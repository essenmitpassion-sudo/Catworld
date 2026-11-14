import {mkdir,writeFile} from 'node:fs/promises';
import {createGame,startGame,observe,applyAction,validateGame} from '../src/engine.js';
import {chooseAction} from '../src/ai.js';
await mkdir('work',{recursive:true});
const runs=[],examples={};
for(const style of ['balanced','aggressive','cautious'])for(let seed=1;seed<=16;seed++){
 let s=startGame(createGame(seed));const moves=[];let pincers=0,combats=0;
 while(s.phase==='playing'){const side=s.turn,action=chooseAction(observe(s,side),side===0?style:'balanced');moves.push({side,action});s=applyAction(s,action);if(s.last?.pincer)pincers++;if(s.last?.outcome)combats++;}
 if(!validateGame(s))throw Error('A complete game failed replay validation');
 const record={seed,humanStyle:style,aiStyle:'balanced',winner:s.winner,reason:s.reason,plies:s.ply,signal:s.signal,pincers,combats,echoes:s.history.filter(a=>a.type==='scan').length,starter:s.starter};runs.push(record);
 const key=s.winner===0?'win':s.winner===1?'loss':'draw';if(!examples[key])examples[key]={...record,moves,state:s};if(pincers>0&&!examples.pincer)examples.pincer={...record,moves,state:s};
}
const summary={games:runs.length,humanWins:runs.filter(r=>r.winner===0).length,computerWins:runs.filter(r=>r.winner===1).length,draws:runs.filter(r=>r.winner===null).length,starterWins:runs.filter(r=>r.winner===r.starter).length,meanPlies:runs.reduce((n,r)=>n+r.plies,0)/runs.length,maxPlies:Math.max(...runs.map(r=>r.plies)),totalPincers:runs.reduce((n,r)=>n+r.pincers,0),meanEchoes:runs.reduce((n,r)=>n+r.echoes,0)/runs.length,byStyle:Object.fromEntries(['balanced','aggressive','cautious'].map(style=>[style,{wins:runs.filter(r=>r.humanStyle===style&&r.winner===0).length,losses:runs.filter(r=>r.humanStyle===style&&r.winner===1).length,draws:runs.filter(r=>r.humanStyle===style&&r.winner===null).length}]))};
await writeFile('work/simulation.json',JSON.stringify({summary,runs},null,2));await writeFile('work/match-examples.json',JSON.stringify(examples,null,2));console.log(JSON.stringify(summary,null,2));
