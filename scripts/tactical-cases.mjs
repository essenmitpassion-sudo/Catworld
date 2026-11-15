import {createGame,applyMove,legalMoves} from '../src/engine.js';
import {chooseMove} from '../src/ai.js';import {previewMove,immediateWins} from '../src/tactics.js';
import {auditTranscript} from './lib/audit.mjs';import {writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const cases={},budget={positions:0,transitions:0,limit:120000};
function save(type,s,data){if(cases[type])return;cases[type]={initial:s.initial,prefix:s.history,...data};const independently=auditTranscript(createGame(s.initial),s.history);assert.deepEqual(independently.board,s.board);}
outer:for(const formation of [2,0])for(const seed of [11,29,61,113]){
 let s=createGame({formation});while(s.status==='playing'&&budget.transitions<budget.limit){budget.positions++;
  if(s.ply>=4){const choices=legalMoves(s).map(move=>{budget.transitions++;return {move,view:previewMove(s,move)};});
   for(const c of choices){
    if(c.view.replyWins.length){const opposite=choices.find(d=>d.move.from===c.move.from&&d.move.to===c.move.to&&d.move.shift===-c.move.shift&&!d.view.replyWins.length&&d.view.game.status==='playing');if(opposite)save('counterShift',s,{move:c.move,reply:c.view.replyWins[0],alternative:opposite.move});}
    if(c.view.goal!==null&&c.view.game.last.landing!==c.view.goal)save('transportWin',s,{move:c.move,goal:c.view.goal});
    if(c.view.capture&&c.view.transports.some(p=>!p.mover&&p.side===-s.turn))save('dualPurpose',s,{move:c.move,capture:c.view.capture,transports:c.view.transports});
   }
  }
  const chosen=chooseMove(s,{depth:3,nodeLimit:20000,seed:seed+s.ply}).move,next=applyMove(s,chosen);
  if(!cases.forcedThreePly&&s.ply>=4&&next.status==='playing'){
   const witnesses=[];let forced=true;for(const reply of legalMoves(next)){if(++budget.transitions>budget.limit){forced=false;break;}const after=applyMove(next,reply),wins=immediateWins(after);if(after.status!=='playing'||!wins.length){forced=false;break;}witnesses.push({reply,win:wins[0]});}if(forced&&witnesses.length)save('forcedThreePly',s,{move:chosen,witnesses,scope:'For every legal opponent reply, the original side has an immediate legal win. Exact three-ply statement only.'});
  }
  s=next;if(Object.keys(cases).length===4)break outer;
 }
}
assert(cases.counterShift,'need an actual reachable losing direction and a nonlosing alternative');await writeFile('docs/tactical-cases.json',JSON.stringify({rules:'unchanged VERSATZ v1',budget,cases},null,2));console.log(JSON.stringify({budget,cases:Object.fromEntries(Object.entries(cases).map(([key,c])=>[key,{ply:c.prefix.length,move:c.move}]))},null,2));
