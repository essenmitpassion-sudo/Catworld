import {oracleStep,independentMoves} from './lib/variant-oracle.mjs';
import * as B from '../research/rules-v1/engine.js';import * as A from '../src/engine.js';
import {chooseMove as bAI}from'../research/rules-v1/ai.js';import{chooseMove as aAI}from'../src/ai.js';
import{solveOneVsOne as bSolve}from'../research/rules-v1/endgame.js';import{solveOneVsOne as aSolve}from'../src/endgame.js';
import{readFile,writeFile,mkdir}from'node:fs/promises';import assert from'node:assert/strict';import{createHash}from'node:crypto';
await mkdir('work/phase2/reproduce-resonance',{recursive:true});
for(const name of ['engine.js','ai.js','routes.js','endgame.js']){let source=await readFile('research/rules-v1/'+name,'utf8');if(name==='engine.js'){
 const needle='const strip=board.slice(row*5,row*5+5);';assert(source.includes(needle));source=source.replace(needle,'const strip=board.slice(row*5,row*5+5),amount=strip.includes(1)&&strip.includes(-1)?2:1;').replace('(x+m.shift+5)%5','(x+m.shift*amount+5)%5').replace('(m.to%5+m.shift+5)%5','(m.to%5+m.shift*amount+5)%5');
 }await writeFile('work/phase2/reproduce-resonance/'+name,source);}
const R=await import('../work/phase2/reproduce-resonance/engine.js'),{chooseMove:rAI}=await import('../work/phase2/reproduce-resonance/ai.js');
const variants={baseline:{E:B,ai:bAI},active:{E:A,ai:aAI},resonance:{E:R,ai:rAI}},games=[];

async function play(name,{formation=2,seed,starter=1,depth=3,styles=['balanced','balanced'],fixture=null,id=null}){
 const{E,ai}=variants[name];let s=E.createGame({formation,starter});if(fixture){s.board=fixture.board.slice();s.turn=fixture.turn;s.positions=[E.positionKey(s)];}const start=structuredClone(s),stats={captures:0,emptyTurns:0,emptyWinningTurns:0,sharedTransports:0,legalActions:0,uniqueSuccessors:0,depths:{}},seen=new Map([[JSON.stringify([s.board,s.turn]),1]]);
 while(s.status==='playing'){
  const legal=E.legalMoves(s),independent=independentMoves(s,name);assert.deepEqual(new Set(legal.map(JSON.stringify)),new Set(independent.map(JSON.stringify)));
  stats.legalActions+=legal.length;stats.uniqueSuccessors+=new Set(legal.map(m=>JSON.stringify(E.advance(s,m).board))).size;
  const r=ai(s,{depth,nodeLimit:depth===4?30000:16000,seed:(Math.imul(seed,0x9e3779b1)+s.ply)>>>0,style:styles[s.turn===1?0:1],endgame:true}),ref=oracleStep(s,r.move,name),old=s;
  s=E.applyMove(s,r.move);assert.deepEqual(s.board,ref.board);assert.equal(s.status==='won',ref.won);if(ref.won)assert.equal(s.winner,old.turn);
  stats.depths[r.completedDepth]=(stats.depths[r.completedDepth]||0)+1;stats.emptyTurns+=Number(s.board.every((v,i)=>v===old.board[i]));stats.emptyWinningTurns+=Number(ref.won&&s.board.every((v,i)=>v===old.board[i]));stats.captures+=Number(s.last.capture!==null);stats.sharedTransports+=Number(ref.shiftedPieces>=2);
  const key=JSON.stringify([s.board,s.turn]),count=(seen.get(key)||0)+1;seen.set(key,count);if(s.reason==='repetition')assert(count>=3);if(s.status==='draw')assert(s.reason==='limit'&&s.ply>=120||s.reason==='repetition'&&count>=3||s.reason==='blocked'&&!independentMoves(s,name).length);
 }
 if(!fixture)assert.deepEqual(E.validateSave(s),s);
 const g={variant:name,kind:fixture?'fresh-midgame':'native-opening',id,formation,seed,starter:fixture?null:start.turn,initialTurn:start.turn,depth,styles,board:start.board,plies:s.ply,winner:s.winner,reason:s.reason,...stats,traceHash:createHash('sha256').update(JSON.stringify([start.board,start.turn,s.history])).digest('hex'),history:s.history};games.push(g);await writeFile('work/phase2/incremental.json',JSON.stringify(games,null,2));console.log(JSON.stringify({...g,history:undefined,board:undefined}));
}
for(const name of Object.keys(variants)){
 for(const formation of[0,2])for(const seed of[17,43])for(const starter of[1,-1])await play(name,{formation,seed,starter});
 for(const starter of[1,-1])await play(name,{formation:2,seed:97,starter,depth:4});
 for(const starter of[1,-1])for(const styles of[['race','capture'],['capture','race']])await play(name,{formation:2,seed:131,starter,styles});
 const source=JSON.parse(await readFile('docs/intelligence.json'));for(const id of[26,27,30]){const original=source.games.find(g=>g.id===id),count=id===27?31:24;let fixture=B.createGame(original.initial);for(const m of original.history.slice(0,count))fixture=B.applyMove(fixture,m);for(const seed of[43,97])await play(name,{fixture,id,seed,depth:4});}
}
const summary={};for(const name of Object.keys(variants))for(const kind of['native-opening','fresh-midgame']){const g=games.filter(g=>g.variant===name&&g.kind===kind);summary[name+' '+kind]={games:g.length,startingSideWins:g.filter(g=>g.winner===(kind==='native-opening'?g.starter:g.initialTurn)).length,otherSideWins:g.filter(g=>g.winner===-(kind==='native-opening'?g.starter:g.initialTurn)).length,draws:g.filter(g=>g.winner===null).length,meanPlies:g.reduce((a,g)=>a+g.plies,0)/g.length,emptyTurns:g.reduce((a,g)=>a+g.emptyTurns,0),emptyWinningTurns:g.reduce((a,g)=>a+g.emptyWinningTurns,0),captures:g.reduce((a,g)=>a+g.captures,0),sharedTransports:g.reduce((a,g)=>a+g.sharedTransports,0),meanLegalActions:g.reduce((a,g)=>a+g.legalActions/g.plies,0)/g.length,meanUniqueSuccessors:g.reduce((a,g)=>a+g.uniqueSuccessors/g.plies,0)/g.length,uniqueTraces:new Set(g.map(g=>g.traceHash)).size};}
const hashes={};for(const path of ['src/engine.js','src/ai.js','src/endgame.js','research/rules-v1/engine.js','research/rules-v1/ai.js','research/rules-v1/endgame.js','scripts/phase2.mjs','scripts/lib/variant-oracle.mjs'])hashes[path]=createHash('sha256').update(await readFile(path)).digest('hex');
function proof(formation,limit=100000){let nodes=0;const STOP=Symbol(),root=A.createGame({formation});function visit(s,d){if(++nodes>limit)throw STOP;if(s.status==='won')return s.winner===root.turn;if(s.status!=='playing'||!d)return false;if(s.turn===root.turn){for(const m of A.legalMoves(s))if(visit(A.applyMove(s,m),d-1))return true;return false;}for(const m of A.legalMoves(s))if(!visit(A.applyMove(s,m),d-1))return false;return true;}try{return {formation,horizon:7,nodes:undefined,result:visit(root,7)?'forced-starter-win':'no-forced-starter-win-within-seven',visited:nodes};}catch(e){if(e!==STOP)throw e;return {formation,horizon:7,result:'unknown-budget-exhausted',visited:limit};}}
const openingProofs=[proof(0),proof(2)];
const distribution={classic:{win:0,loss:0,draw:0},active:{win:0,loss:0,draw:0},changed:0};for(let i=0;i<25;i++)for(let j=0;j<25;j++)if(i!==j)for(const turn of [1,-1]){const s=B.createGame();s.board=Array(25).fill(0);s.board[i]=1;s.board[j]=-1;s.turn=turn;s.positions=[B.positionKey(s)];const b=bSolve(s),a=aSolve(s);distribution.classic[b.outcome]++;distribution.active[a.outcome]++;distribution.changed+=Number(b.outcome!==a.outcome);}
await writeFile('docs/phase2-comparison.json',JSON.stringify({date:'2026-11-15',base:'34a7e57',hashes,openingProofs,distribution,scope:'Bounded prototypes. Same model used by both players/search/endgame. Native openings and fresh-history counterfactual midgames reported separately. No human enjoyment evidence.',summary,games},null,2));console.log('SUMMARY',JSON.stringify({summary,openingProofs,distribution}));
