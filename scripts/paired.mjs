import {writeFile,mkdir,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createGame,startGame,applyAction,validateGame} from '../src/engine.js';
import {chooseAction} from '../src/ai.js';
const runs=[];
for(let seed=1;seed<=12;seed++)for(const starter of [0,1]){
 let s=startGame(createGame(seed,starter));
 while(s.phase==='playing')s=applyAction(s,chooseAction(s,'tactical'));
 if(!validateGame(s))throw Error('Paired terminal state failed authoritative replay');
 runs.push({seed,starter,winner:s.winner,ticks:s.tick,actions:s.ply,hq:[s.nodes[0].integrity,s.nodes[8].integrity],reason:s.reason});
}
const hash=async path=>createHash('sha256').update(await readFile(path)).digest('hex');
const report={method:'Same 12 seeded mirrored networks, each with both initial initiative assignments. Both sides use the identical tactical policy; round initiative alternates. Automated diagnostic, not human balance or fun evidence.',engine_sha256:await hash('src/engine.js'),ai_sha256:await hash('src/ai.js'),summary:{games:runs.length,westWins:runs.filter(r=>r.winner===0).length,eastWins:runs.filter(r=>r.winner===1).length,initialStarterWins:runs.filter(r=>r.winner===r.starter).length,initialSecondWins:runs.filter(r=>r.winner!==null&&r.winner!==r.starter).length,draws:runs.filter(r=>r.winner===null).length,meanTicks:runs.reduce((n,r)=>n+r.ticks,0)/runs.length},runs};
await mkdir('work',{recursive:true});await writeFile('work/signalbruch-paired.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.summary,null,2));
