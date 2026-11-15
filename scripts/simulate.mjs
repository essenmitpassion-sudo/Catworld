import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {createGame,applyMove,validateGame} from '../src/engine.js';
import {chooseMove} from '../src/ai.js';
await mkdir('work',{recursive:true});const runs=[],examples={};let maxDecisionMs=0;
for(const style of ['tactical','pressure','gather'])for(let seed=1;seed<=8;seed++) {
 let s=createGame(seed,seed%2),pulls=0,opponentPulls=0;
 while(s.phase==='playing') {
  const t=performance.now(),cell=chooseMove(s,{style:s.turn===0?style:'tactical',depth:3});
  maxDecisionMs=Math.max(maxDecisionMs,performance.now()-t);s=applyMove(s,cell);
  pulls+=s.last.pulls.length;opponentPulls+=s.last.pulls.filter(p=>p.side!==s.last.side).length;
 }
 if(!validateGame(s))throw Error('Terminal state failed authoritative replay.');
 const record={seed,starter:s.starter,style,winner:s.winner,plies:s.ply,pulls,opponentPulls,reason:s.reason};runs.push(record);
 const key=s.winner===0?'win':s.winner===1?'loss':'draw';if(!examples[key])examples[key]={...record,state:s};
 if(opponentPulls&&!examples.pull)examples.pull={...record,state:s};
}
const hash=async path=>createHash('sha256').update(await readFile(path)).digest('hex');
const summary={games:runs.length,blueWins:runs.filter(r=>r.winner===0).length,redWins:runs.filter(r=>r.winner===1).length,draws:runs.filter(r=>r.winner===null).length,meanPlies:runs.reduce((n,r)=>n+r.plies,0)/runs.length,maxDecisionMs,pulls:runs.reduce((n,r)=>n+r.pulls,0),opponentPulls:runs.reduce((n,r)=>n+r.opponentPulls,0),byStyle:Object.fromEntries(['tactical','pressure','gather'].map(style=>[style,{wins:runs.filter(r=>r.style===style&&r.winner===0).length,losses:runs.filter(r=>r.style===style&&r.winner===1).length,draws:runs.filter(r=>r.style===style&&r.winner===null).length}]))};
await writeFile('work/sog-simulation.json',JSON.stringify({method:'Three public line-evaluation policies at depth3; same legal transitions, seeded opposite one-stone-per-color opening, 8 seeds per policy, alternating initial starter. Bot diagnostic, not human fun/duration evidence.',engine_sha256:await hash('src/engine.js'),ai_sha256:await hash('src/ai.js'),summary,runs},null,2)+'\n');
// A legal random-v-random trace tests terminal draw restoration. It is not an AI-match claim.
for(let seed=1;seed<=256&&!examples.draw;seed++) {
 let s=createGame(seed,seed%2),noise=seed*7919;
 while(s.phase==='playing') {
  const moves=s.board.flatMap((v,cell)=>v===0?[cell]:[]);
  noise=(Math.imul(noise,1664525)+1013904223)>>>0;s=applyMove(s,moves[noise%moves.length]);
 }
 if(s.winner===null){if(!validateGame(s))throw Error('Draw fixture replay failed');examples.draw={seed,starter:s.starter,winner:null,plies:s.ply,style:'legal random-v-random trace for terminal save restoration only',state:s};}
}
if(!examples.draw)throw Error('No terminal draw fixture found in the bounded search');
await writeFile('work/sog-examples.json',JSON.stringify(examples,null,2)+'\n');console.log(JSON.stringify(summary,null,2));
