import {writeFile,mkdir,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createGame,startGame,observe,applyAction,validateGame} from '../src/engine.js';
import {chooseAction} from '../src/ai.js';
const runs=[];
for(let seed=1;seed<=32;seed++)for(const starter of [0,1]){let s=startGame(createGame(seed,starter)),pincers=0;while(s.phase==='playing'){s=applyAction(s,chooseAction(observe(s,s.turn),'balanced'));if(s.last?.pincer)pincers++;}if(!validateGame(s))throw Error('Paired game failed authoritative replay');runs.push({seed,starter,winner:s.winner,plies:s.ply,pincers,signal:s.signal,reason:s.reason});}
const hash=async path=>createHash('sha256').update(await readFile(path)).digest('hex');
const report={method:'Same 32 seeded role formations, each with both initiative assignments, both sides using identical observation-only balanced policy; current +2 second-player compensation. Automated diagnostic, not human balance/fun proof.',engine_sha256:await hash('src/engine.js'),ai_sha256:await hash('src/ai.js'),summary:{games:runs.length,starterWins:runs.filter(r=>r.winner===r.starter).length,secondWins:runs.filter(r=>r.winner!==null&&r.winner!==r.starter).length,draws:runs.filter(r=>r.winner===null).length,meanPlies:runs.reduce((n,r)=>n+r.plies,0)/runs.length,pincers:runs.reduce((n,r)=>n+r.pincers,0)},runs};await mkdir('work',{recursive:true});await writeFile('work/paired.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.summary,null,2));
