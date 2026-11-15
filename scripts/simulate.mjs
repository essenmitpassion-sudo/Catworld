import {mkdir,writeFile} from 'node:fs/promises';import {performance} from 'node:perf_hooks';
import {createGame,startGame,applyAction,validateGame,ownerOf} from '../src/engine.js';import {chooseAction} from '../src/ai.js';
await mkdir('work',{recursive:true});const runs=[],examples={};let maxDecisionMs=0;
for(const style of ['tactical','pressure','network'])for(let seed=1;seed<=8;seed++){
 let s=startGame(createGame(seed));const moves=[];let takeovers=0,redirects=0,sends=0;
 while(s.phase==='playing'){const side=s.turn,start=performance.now(),action=chooseAction(s,side===0?style:'tactical');maxDecisionMs=Math.max(maxDecisionMs,performance.now()-start);moves.push({side,action});if(action.type==='send')sends++;else if(action.type==='redirect')redirects++;else takeovers++;s=applyAction(s,action);}
 if(!validateGame(s))throw Error('Terminal replay does not validate');
 const record={seed,humanStyle:style,aiStyle:'tactical',winner:s.winner,ticks:s.tick,actions:s.ply,starter:s.initialStarter,hq:[s.nodes[0].integrity,s.nodes[8].integrity],owned:s.nodes.filter(n=>n.kind==='town').map(n=>ownerOf(n)),takeovers,redirects,sends,reason:s.reason};runs.push(record);
 const key=s.winner===0?'win':s.winner===1?'loss':'draw';if(!examples[key])examples[key]={...record,moves,state:s};if(takeovers&&!examples.takeover)examples.takeover={...record,moves,state:s};
}
const summary={games:runs.length,humanWins:runs.filter(r=>r.winner===0).length,computerWins:runs.filter(r=>r.winner===1).length,draws:runs.filter(r=>r.winner===null).length,meanTicks:runs.reduce((n,r)=>n+r.ticks,0)/runs.length,maxDecisionMs,actions:{send:runs.reduce((n,r)=>n+r.sends,0),redirect:runs.reduce((n,r)=>n+r.redirects,0),takeover:runs.reduce((n,r)=>n+r.takeovers,0)},byStyle:Object.fromEntries(['tactical','pressure','network'].map(style=>[style,{wins:runs.filter(r=>r.humanStyle===style&&r.winner===0).length,losses:runs.filter(r=>r.humanStyle===style&&r.winner===1).length,draws:runs.filter(r=>r.humanStyle===style&&r.winner===null).length}]))};
await writeFile('work/signalbruch-simulation.json',JSON.stringify({summary,runs},null,2));await writeFile('work/signalbruch-examples.json',JSON.stringify(examples,null,2));console.log(JSON.stringify(summary,null,2));
