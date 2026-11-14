import {createGame,applyMove,legalMoves,validateSave,positionKey} from '../src/engine.js';
import {chooseMove} from '../src/ai.js';
import {writeFile,mkdir,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const rng=seed=>()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/2**32);
const policies={random:null,greedy:{depth:1,nodeLimit:1500},tactical:{depth:3,nodeLimit:16000},deep:{depth:5,nodeLimit:65000},race:{depth:2,nodeLimit:6000,style:'race'},capture:{depth:2,nodeLimit:6000,style:'capture'}};
const all=[],examples={};
function play(a,b,seed,starter,automatic=false){
 let s=createGame({starter,formation:seed%4});const random=rng(seed),branch=[],seen=new Set(),notes={captures:0,wrappedRows:0,repeatVisits:0,peakMaterialLead:0,maxConsecutiveAdvantage:0},opening=[];let streak=0;
 while(s.status==='playing'){
  const available=legalMoves(s).filter(m=>!automatic||m.shift===(s.ply%2===0?1:-1));assert(available.length);branch.push(available.length);
  const policy=s.turn===1?a:b;
  let m;if(policy==='random')m=available[Math.floor(random()*available.length)];else{const result=chooseMove(s,{...policies[policy],seed:seed+s.ply});m=result.move;if(automatic&&m.shift!==(s.ply%2===0?1:-1))m=available.find(x=>x.from===m.from&&x.to===m.to)||available[0];}
  const row=Math.floor(m.to/5);if(s.board[row*5+(m.shift===1?4:0)]!==0)notes.wrappedRows++;
  s=applyMove(s,m);if(s.ply<=6)opening.push(m);notes.captures+=Number(s.last.capture!==null);const key=positionKey(s);notes.repeatVisits+=Number(seen.has(key));seen.add(key);
  const lead=s.board.filter(x=>x===1).length-s.board.filter(x=>x===-1).length;notes.peakMaterialLead=Math.max(notes.peakMaterialLead,Math.abs(lead));streak=lead?streak+1:0;notes.maxConsecutiveAdvantage=Math.max(notes.maxConsecutiveAdvantage,streak);
 }
 assert.deepEqual(validateSave(s),s);const outcome={a,b,seed,starter,formation:seed%4,automatic,plies:s.ply,winner:s.winner,reason:s.reason,meanBranch:branch.reduce((a,b)=>a+b,0)/branch.length,minBranch:Math.min(...branch),maxBranch:Math.max(...branch),...notes,traceHash:createHash('sha256').update(JSON.stringify(s.history)).digest('hex')};all.push(outcome);
 if(!examples[s.reason])examples[s.reason]={initial:s.initial,history:s.history};return outcome;
}
const groups={};
function summarize(games){return {games:games.length,ivoryWins:games.filter(g=>g.winner===1).length,jadeWins:games.filter(g=>g.winner===-1).length,starterWins:games.filter(g=>g.winner===g.starter).length,secondWins:games.filter(g=>g.winner===-g.starter).length,draws:games.filter(g=>g.winner===null).length,meanPlies:Number((games.reduce((a,g)=>a+g.plies,0)/games.length).toFixed(2)),shortest:Math.min(...games.map(g=>g.plies)),longest:Math.max(...games.map(g=>g.plies)),meanLegalMoves:Number((games.reduce((a,g)=>a+g.meanBranch,0)/games.length).toFixed(2)),repetitionDraws:games.filter(g=>g.reason==='repetition').length,limitDraws:games.filter(g=>g.reason==='limit').length,blocked:games.filter(g=>g.reason==='blocked').length,repeatVisits:games.reduce((a,g)=>a+g.repeatVisits,0),captures:games.reduce((a,g)=>a+g.captures,0),wrappedRows:games.reduce((a,g)=>a+g.wrappedRows,0),peakMaterialLead:Math.max(...games.map(g=>g.peakMaterialLead)),maxConsecutiveAdvantage:Math.max(...games.map(g=>g.maxConsecutiveAdvantage))};}
function batch(label,a,b,n,automatic=false){const start=all.length;for(let seed=0;seed<n;seed++)for(const starter of [1,-1]){play(a,b,1000+seed,starter,automatic);if(a!==b)play(b,a,1000+seed,starter,automatic);}groups[label]=summarize(all.slice(start));console.log(label,JSON.stringify(groups[label]));}
batch('random_baseline','random','random',160);
batch('greedy_paired','greedy','greedy',24);
batch('tactical_paired','tactical','tactical',24);
batch('tactical_vs_greedy','tactical','greedy',16);
batch('deep_vs_tactical','deep','tactical',12);
batch('race_vs_capture','race','capture',16);
batch('tactical_vs_race','tactical','race',12);
batch('automatic_random_control','random','random',80,true);
// Actual minimax on a finite horizon: 'unknown' is not a loss or a proof of safety.
function forcedOpening(maxDepth=7){let nodes=0;const s=createGame({formation:0});function solve(p,d,attacker){nodes++;if(p.status==='won')return p.winner===attacker;if(p.status==='draw'||!d)return false;const actions=legalMoves(p);if(p.turn===attacker){for(const m of actions)if(solve(applyMove(p,m),d-1,attacker))return true;return false;}for(const m of actions)if(!solve(applyMove(p,m),d-1,attacker))return false;return true;}
 const layers=[];for(let depth=1;depth<=maxDepth;depth+=2)layers.push({plies:depth,starterCanForceWin:solve(s,depth,s.turn)});return {formation:0,scope:'All legal moves, bounded horizon only. False means no forced win within that many plies.',nodes,layers};}
const forced=forcedOpening();const hashes={};for(const path of ['src/engine.js','src/ai.js','scripts/simulate.mjs'])hashes[path]=createHash('sha256').update(await readFile(path)).digest('hex');
const report={date:'2026-11-15',rules:'VERSATZ v1; 120 plies; threefold board+turn repetition; terminal own-turn gate check',hashes,method:'Seeded LCG tie breaks; four 180-degree symmetric deployments; each seed played with both initiative assignments. No random openings. Race/capture are competing evaluation policies. Automatic control is RANDOM ONLY with alternating predetermined directions; it does not establish stronger-policy balance.',limits:['No human enjoyment evidence.','Paired rotated starts are correlated; effective sample size is smaller than game count.','Four formations and shallow searches do not solve the game.','No forced win within seven plies does not rule out longer forced openings.','Material advantage streak includes changes of leading side; it diagnoses persistent imbalance, not a causal advantage chain.'],summary:summarize(all),groups,forcedOpening:forced,games:all};
await mkdir('work',{recursive:true});await writeFile('docs/playtest.json',JSON.stringify(report,null,2));await writeFile('work/match-examples.json',JSON.stringify(examples,null,2));console.log('TOTAL',JSON.stringify(report.summary));console.log('OPENING',JSON.stringify(forced));
