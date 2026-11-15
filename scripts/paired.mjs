import {writeFile,mkdir,readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
import {createGame,applyMove,validateGame} from '../src/engine.js';import {chooseMove} from '../src/ai.js';
const runs=[];
for(let seed=1;seed<=12;seed++)for(const starter of [0,1]) {
 let s=createGame(seed,starter);
 while(s.phase==='playing')s=applyMove(s,chooseMove(s));
 if(!validateGame(s))throw Error('Paired replay failed');
 runs.push({seed,starter,winner:s.winner,plies:s.ply,reason:s.reason});
}
const hash=async path=>createHash('sha256').update(await readFile(path)).digest('hex');
const report={method:'Same 12 seeded opposite one-stone-per-color openings, both initial starters, identical depth3 tactical policy. Same5x5 topology; not solved balance or human fun evidence.',engine_sha256:await hash('src/engine.js'),ai_sha256:await hash('src/ai.js'),summary:{games:runs.length,blueWins:runs.filter(r=>r.winner===0).length,redWins:runs.filter(r=>r.winner===1).length,starterWins:runs.filter(r=>r.winner===r.starter).length,secondWins:runs.filter(r=>r.winner!==null&&r.winner!==r.starter).length,draws:runs.filter(r=>r.winner===null).length,meanPlies:runs.reduce((n,r)=>n+r.plies,0)/runs.length},runs};
await mkdir('work',{recursive:true});await writeFile('work/sog-paired.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.summary,null,2));
