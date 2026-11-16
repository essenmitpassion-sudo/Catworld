import {writeFile,mkdir} from 'node:fs/promises';
import {createGame,edit,advance} from '../src/engine.js';
import {choose} from './policies.mjs';
const count=Number(process.env.SAMPLES||24),rows=[];
for(const style of ['idle','balanced','safe','greedy']) {
 for(let i=0;i<count;i++) {
  let s=createGame(`TEST-${i}`),trace=[];
  while(s.status==='playing') {const p=choose(s,style);for(const a of p)s=edit(s,a.index,a.kind);s=advance(s);trace.push(p);}
  rows.push({seed:s.seed,style,status:s.status,turn:s.turn,hull:s.hull,beacons:s.beacons,trace});
 }
 console.log(style,rows.filter(r=>r.style===style&&r.status==='won').length,'/',count);
}
await mkdir('work',{recursive:true});await writeFile('work/balance.json',JSON.stringify({count,rows},null,2));
