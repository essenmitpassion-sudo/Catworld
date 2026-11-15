import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.js';
const fixture=(pieces,turn=1,ply=0)=>{const board=Array(25).fill(0);for(const [cell,side] of pieces)board[cell]=side;return {board,turn,ply,status:'playing',winner:null,reason:null};};
const move=(from,to,shift)=>({from,to,shift});
test('default deployment uses a tested off-centre formation without adding balancing currency',()=>{const s=E.createGame();assert.deepEqual(s.board.flatMap((p,i)=>p===1?[i]:[]),[20,21,23]);assert.deepEqual(s.board.flatMap((p,i)=>p===-1?[i]:[]),[1,3,4]);});
test('starts a minimal three-against-three duel with both initiative assignments',()=>{
 for(const starter of [1,-1]){const s=E.createGame({starter,formation:0});assert.equal(s.turn,starter);assert.equal(s.board.filter(x=>x===1).length,3);assert.equal(s.board.filter(x=>x===-1).length,3);assert.equal(s.board[22],1);assert.equal(s.board[2],-1);assert.equal(s.status,'playing');assert.equal(E.legalMoves(s).length,10);}
});
test('step does not wrap but destination row transports BOTH sides and wraps',()=>{
 const s=fixture([[10,1],[14,-1],[22,1],[2,-1]]),before=structuredClone(s);
 const n=E.advance(s,move(10,11,1));assert.equal(n.board[12],1);assert.equal(n.board[10],-1);assert.equal(n.board[22],1);assert.equal(n.board[2],-1);assert.deepEqual(s,before);
 assert.throws(()=>E.advance(s,move(10,14,-1)));assert.throws(()=>E.advance(s,move(10,9,1)));
});
test('capture happens at the step square before shifting, never by sliding',()=>{
 const s=fixture([[10,1],[11,-1],[13,-1],[22,1]]);const n=E.advance(s,move(10,11,-1));
 assert.equal(n.board[10],1);assert.equal(n.board[12],-1);assert.equal(n.board.filter(x=>x===-1).length,1);assert.equal(n.last.capture,11);
 const w=E.advance(fixture([[10,1],[11,-1]]),move(10,11,1));assert.equal(w.status,'won');assert.equal(w.winner,1);assert.equal(w.reason,'elimination');
});
test('gate victory is checked after the whole turn for its active side only',()=>{
 const visits=E.advance(fixture([[7,1],[24,-1]]),move(7,2,1));assert.equal(visits.status,'playing');assert.equal(visits.board[3],1);
 const lands=E.advance(fixture([[6,1],[24,-1]]),move(6,1,1));assert.equal(lands.status,'won');assert.equal(lands.winner,1);assert.equal(lands.reason,'gate');
 const other=E.advance(fixture([[20,1],[21,-1],[0,-1]]),move(20,15,1));assert.equal(other.status,'playing');
 const carried=E.advance(fixture([[23,1],[16,-1],[0,-1]],-1),move(16,21,1));assert.equal(carried.board[24],1);assert.equal(carried.status,'won');assert.equal(carried.winner,-1);
});
test('rejects wrong side, diagonal, occupied, malformed, out-of-board and terminal moves',()=>{
 const s=E.createGame({formation:0}),copy=structuredClone(s);
 for(const m of [move(1,6,1),move(21,22,1),move(21,15,1),move(21,16,0),move(-1,0,1),move(21,16.5,1),null,{},move(21,26,1)])assert.throws(()=>E.applyMove(s,m));
 assert.deepEqual(s,copy);const done={...s,status:'draw',reason:'limit'};assert.deepEqual(E.legalMoves(done),[]);assert.throws(()=>E.applyMove(done,move(21,16,1)));
});
test('three occurrences include side-to-move; ply limit is a draw, never material adjudication',()=>{
 let s=E.createGame({formation:0});s.board=Array(25).fill(0);s.board[21]=1;s.board[3]=-1;s.positions=[E.positionKey(s)];const cycle=[move(21,22,1),move(3,2,-1),move(23,22,-1),move(1,2,1)];
 // Both pieces really move out and back; no empty turn is needed to test repetition.
 for(let i=0;i<20&&s.status==='playing';i++)s=E.applyMove(s,cycle[i%4]);
 assert.equal(s.status,'draw');assert.equal(s.reason,'repetition');assert.equal(s.ply,8);
 const limited=E.advance(fixture([[10,1],[24,-1]],1,119),move(10,11,1));assert.equal(limited.status,'draw');assert.equal(limited.reason,'limit');
 assert.notEqual(E.positionKey({...s,turn:1}),E.positionKey({...s,turn:-1}));
});
test('complete histories replay, undo exactly and validate saves without trusting derived data',()=>{
 let s=E.createGame({starter:-1,formation:1});const states=[s];for(let i=0;i<12&&s.status==='playing';i++){s=E.applyMove(s,E.legalMoves(s)[i%E.legalMoves(s).length]);states.push(s);}
 assert.deepEqual(E.validateSave(JSON.parse(JSON.stringify(s))),s);
 for(let i=0;i<states.length;i++)assert.deepEqual(E.replay(s,i),states[i]);
 assert.deepEqual(E.undo(s),states.at(-2));
 for(const mutate of [x=>x.board[0]=9,x=>x.turn*=-1,x=>x.history[0].shift=0,x=>x.positions.push('forged'),x=>x.initial.formation=99,x=>x.last.capture=99]){const bad=structuredClone(s);mutate(bad);assert.equal(E.validateSave(bad),null);}
 assert.equal(E.validateSave(null),null);assert.equal(E.validateSave({version:1}),null);
});
// Independent coordinate/list oracle: no production movement, shifting, key or win helpers.
function reference(s,m){const actors=[];for(let y=0;y<5;y++)for(let x=0;x<5;x++)if(s.board[y*5+x])actors.push({x,y,side:s.board[y*5+x]});const a=actors.find(p=>p.y*5+p.x===m.from);const victim=actors.find(p=>p.y*5+p.x===m.to);if(victim)actors.splice(actors.indexOf(victim),1);a.x=m.to%5;a.y=Math.floor(m.to/5);for(const p of actors)if(p.y===a.y){p.x+=m.shift;if(p.x<0)p.x=4;if(p.x>4)p.x=0;}const board=Array(25).fill(0);for(const p of actors)board[p.y*5+p.x]=p.side;const won=!actors.some(p=>p.side===-s.turn)||actors.some(p=>p.side===s.turn&&p.x===2&&p.y===(s.turn===1?0:4));return {board,won};}
test('all reachable legal transitions match independent coordinate oracle, rotate and reflect',()=>{
 let transitions=0;let seed=1337;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/2**32);
 for(let trial=0;trial<40;trial++){let s=E.createGame({formation:trial%4,starter:trial%2?1:-1});while(s.status==='playing'){
 const actions=E.legalMoves(s);assert(actions.length>0);for(const m of actions){transitions++;const actual=E.advance(s,m),ref=reference(s,m);assert.deepEqual(actual.board,ref.board);assert.equal(actual.status==='won',ref.won);
 const rotated={...s,board:[...s.board].reverse().map(x=>x?-x:0),turn:-s.turn};const r=E.advance(rotated,move(24-m.from,24-m.to,-m.shift));assert.deepEqual(r.board,[...actual.board].reverse().map(x=>x?-x:0));assert.equal(r.winner,actual.winner===null?null:-actual.winner);
 const flip=i=>Math.floor(i/5)*5+4-i%5;const reflected={...s,board:s.board.map((_,i)=>s.board[flip(i)])};assert.deepEqual(E.advance(reflected,move(flip(m.from),flip(m.to),-m.shift)).board,actual.board.map((_,i)=>actual.board[flip(i)]));}
 s=E.applyMove(s,actions[Math.floor(random()*actions.length)]);assert(s.board.filter(x=>x).length<=6);assert(s.ply<=120);
 } }assert(transitions>1000);
});
