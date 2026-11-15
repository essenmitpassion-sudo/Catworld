import {createGame,applyMove,legalMoves,validateSave,replay} from '../research/rules-v1/engine.js';
import {chooseMove,evaluate} from './lib/baseline-ai-v1.mjs';
import {immediateWins,previewMove} from '../research/rules-v1/tactics.js';
import {auditTranscript,transformGame,traceIdentity,opening,summarize} from '../research/rules-v1/audit.mjs';
import {chooseReference} from '../research/rules-v1/reference-search.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';
const games=[],groups={},tactics=[];let serial=0;
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const policy=(name,seed)=>s=>{
 if(name.startsWith('legacy'))return chooseMove(s,{depth:Number(name.slice(6)),nodeLimit:90000,seed:seed+s.ply});
 if(name.startsWith('reference'))return chooseReference(s,{depth:3,nodeLimit:50000,style:name.slice(10),seed:seed+s.ply});
 if(name==='random'){const moves=legalMoves(s);let word=(seed^Math.imul(s.ply+1,0x9e3779b1))>>>0;word=Math.imul(word^(word>>>16),0x7feb352d)>>>0;return {move:moves[word%moves.length],nodes:0,completedDepth:0};}
 if(name==='greedy')return chooseMove(s,{depth:1,nodeLimit:1500,seed:seed+s.ply});
 if(name==='guarded'||name==='ranked'){
  const ranked=legalMoves(s).map(move=>({move,next:applyMove(s,move)})).sort((a,b)=>evaluate(b.next,s.turn)-evaluate(a.next,s.turn));
  const win=ranked.find(c=>c.next.winner===s.turn);if(win)return {move:win.move,nodes:ranked.length,completedDepth:1};
  const safe=name==='guarded'?ranked.filter(c=>!immediateWins(c.next).length):ranked;return {move:(safe[0]||ranked[0]).move,nodes:ranked.length,completedDepth:name==='guarded'?2:1};
 }
 throw Error('Unknown policy '+name);
};
async function match(group,initial,a,b,seed){
 let s=initial,stats={depths:{},nodes:0,immediateLossesOffered:0,captures:0,distinctPositions:0,choices:0,avoidableImmediateLosses:0,byPolicy:{}},keys=new Set();const prefixPlies=s.ply,start=performance.now();
 const players={1:policy(a,seed),'-1':policy(b,seed)};
 while(s.status==='playing'){
  const r=players[s.turn](s);stats.depths[r.completedDepth]=(stats.depths[r.completedDepth]||0)+1;stats.nodes+=r.nodes;const projection=previewMove(s,r.move);stats.immediateLossesOffered+=Number(projection.replyWins.length>0);stats.choices+=legalMoves(s).length;
  const avoidable=projection.replyWins.length>0&&legalMoves(s).some(m=>{const n=applyMove(s,m);return n.status!=='playing'||!immediateWins(n).length;});stats.avoidableImmediateLosses+=Number(avoidable);
  const name=s.turn===1?a:b,log=stats.byPolicy[name]||{decisions:0,offeredImmediateWins:0,avoidableImmediateLosses:0};log.decisions++;log.offeredImmediateWins+=Number(projection.replyWins.length>0);log.avoidableImmediateLosses+=Number(avoidable);stats.byPolicy[name]=log;
  // Save interesting, reachable examples with a real reply and a concrete alternative.
  if(projection.replyWins.length&&tactics.length<8){const alternative=legalMoves(s).find(m=>{const n=applyMove(s,m);return n.status!=='playing'||!immediateWins(n).length;});if(alternative)tactics.push({initial:s.initial,prefix:s.history,move:r.move,reply:projection.replyWins[0],alternative});}
  s=projection.game;stats.captures+=Number(s.last.capture!==null);keys.add(s.board.join(',')+s.turn);
 }
 assert.deepEqual(validateSave(s),s);const independent=auditTranscript(createGame(s.initial),s.history);for(const key of ['board','turn','ply','status','winner','reason'])assert.deepEqual(independent[key],s[key]);
 const rotated=transformGame(s,'rotate'),reflected=transformGame(s,'reflect');assert.equal(rotated.winner,s.winner===null?null:-s.winner);assert.equal(reflected.winner,s.winner);
 const record={id:serial++,group,initial:s.initial,prefixPlies,a,b,seed,winner:s.winner,reason:s.reason,plies:s.ply,identity:traceIdentity(s),ms:Math.round(performance.now()-start),...stats,distinctPositions:keys.size,history:s.history};games.push(record);
 // Incremental checkpoint: a bounded experiment can be interrupted without losing completed games.
 await writeFile('work/intelligence/incremental.json',JSON.stringify({complete:false,games,tactics},null,2));
 console.log(JSON.stringify({id:record.id,group,formation:s.initial.formation,a,b,starter:s.initial.starter,winner:s.winner,plies:s.ply,depths:stats.depths}));
}
await mkdir('work/intelligence',{recursive:true});
for(const formation of [0,2])for(const depth of [3,4,5])for(const starter of [1,-1])await match('horizon',createGame({formation,starter}),`legacy${depth}`,`legacy${depth}`,0x6a09e667);
for(const formation of [0,2])for(const style of ['material','position','race'])for(const kind of ['identity','rotate']){const initial=createGame({formation});await match('independent-evaluation',kind==='rotate'?transformGame(initial,kind):initial,'reference-'+style,'reference-'+style,0x31415926);}
// Distinct legal four-ply openings, paired by exact rotation+color exchange.
for(const seed of [11,29,61,113])for(const kind of ['identity','rotate']){const initial=opening({formation:2,seed,plies:4});await match('varied-openings',kind==='rotate'?transformGame(initial,kind):initial,'legacy4','legacy4',seed*0x9e3779b1>>>0);}
for(const seed of [5,17,43,97])for(const kind of ['identity','rotate'])for(const swapped of [false,true]){const initial=opening({formation:2,seed,plies:2});const a=swapped?'ranked':'guarded',b=swapped?'guarded':'ranked';await match('visible-counterplay',kind==='rotate'?transformGame(initial,kind):initial,a,b,seed);}
for(const guarded of [false,true])for(const seed of [5,43])for(const kind of ['identity','rotate'])for(const swapped of [false,true]){const initial=opening({formation:2,seed,plies:2}),low=guarded?'guarded':'ranked';await match(guarded?'counterplay-vs-search':'control-vs-search',kind==='rotate'?transformGame(initial,kind):initial,swapped?'legacy3':low,swapped?low:'legacy3',seed);}
for(const formation of [0,2])for(const starter of [1,-1])await match('random-greedy-control',createGame({formation,starter}),'random','greedy',0x12345678);
for(const group of new Set(games.map(g=>g.group)))groups[group]=summarize(games.filter(g=>g.group===group));
// Bounded AND/OR proof search. Returning false at the horizon is only "not won within horizon".
function proof(formation,maxDepth=9,limit=250000){let nodes=0;const root=createGame({formation}),attacker=root.turn,STOP=Symbol();const layers=[];function visit(s,d){if(++nodes>limit)throw STOP;if(s.status==='won')return s.winner===attacker;if(s.status!=='playing'||!d)return false;const actions=legalMoves(s);if(s.turn===attacker){for(const m of actions)if(visit(applyMove(s,m),d-1))return true;return false;}for(const m of actions)if(!visit(applyMove(s,m),d-1))return false;return true;}for(let d=7;d<=maxDepth;d+=2){try{layers.push({plies:d,result:visit(root,d)?'forced-starter-win':'no-starter-win-within-horizon'});}catch(e){if(e!==STOP)throw e;layers.push({plies:d,result:'unknown-budget-exhausted'});break;}}return {formation,nodes:Math.min(nodes,limit),limit,layers};}
const proofs=[proof(0),proof(2)],hashes={};for(const path of ['research/rules-v1/engine.js','research/rules-v1/ai.js','research/rules-v1/tactics.js','scripts/intelligence.mjs','scripts/lib/audit.mjs','scripts/lib/reference-search.mjs','scripts/lib/baseline-ai-v1.mjs'])hashes[path]=createHash('sha256').update(await readFile(path)).digest('hex');
const report={date:'2026-11-15',base:'d46be8b',aiBaseline:'Frozen scripts/lib/baseline-ai-v1.mjs from d46be8b; production AI may be newer.',rulesUnchanged:true,method:'Small controlled horizon/evaluation/opening/counterplay experiments. Full histories independently checked. Rotated/reflected duplicates identified explicitly; seed does not itself mean a new independent opening.',limitations:['No perfect-play balance claim.','Reported search nodes have implementation-specific definitions and are not directly comparable across policies.','Reference policies use canonical color-relative tie breaks, so paired rotations are correlated negative controls, not independent samples.','Guarded policy combines an exact immediate-loss filter with one-ply ranking; its strength is not a human-learning result.','Openings are randomized legal prefixes and may already favor one side.','Depth/budget totals and exact source hashes are logged.'],hashes,groups,proofs,games,tactics};await writeFile('docs/intelligence.json',JSON.stringify(report,null,2));console.log('SUMMARY',JSON.stringify({groups,proofs}));
