import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.js';
const board=(pairs=[])=>{const b=Array(25).fill(0);for(const [at,v] of pairs)b[at]=v;return b;};

test('one placement attracts the first stone in each cardinal direction, of either color, simultaneously',()=>{
 const b=board([[2,1],[10,2],[14,1],[22,2]]),copy=[...b];
 const r=E.resolve?.(b,12,0);
 assert.deepEqual(r?.board,board([[7,1],[11,2],[12,1],[13,1],[17,2]]));
 assert.deepEqual(r.pulls.map(p=>[p.from,p.to,p.side]).sort((a,b)=>a[0]-b[0]),[[2,7,0],[10,11,1],[14,13,0],[22,17,1]]);
 assert.deepEqual(b,copy);
});
test('an adjacent stone shields all stones farther along its ray',()=>{
 const r=E.resolve(board([[10,2],[11,1],[14,2]]),12,0);
 assert.deepEqual(r.board,board([[10,2],[11,1],[12,1],[13,2]]));
 assert.deepEqual(r.pulls,[{from:14,to:13,side:1}]);
});
test('diagonals and row wrapping never attract stones',()=>{
 const b=board([[0,2],[4,1],[20,1],[24,2]]);assert.deepEqual(E.resolve(b,12,0).pulls,[]);
 assert.deepEqual(E.resolve(board([[9,2]]),10,0).board,board([[9,2],[10,1]]));
});
test('wins are checked after attraction, not before the shared motion',()=>{
 const r=E.resolve(board([[5,1],[6,1],[9,1]]),7,0);
 assert.equal(r.winner,0);assert.equal(r.over,true);assert.deepEqual(r.lines[0],[[5,6,7,8]]);
});
test('a move can complete the opponent line and lose immediately',()=>{
 const r=E.resolve(board([[2,2],[5,2],[6,2],[8,2]]),17,0);
 assert.equal(r.winner,1);assert.equal(r.reason,'line');assert.deepEqual(r.lines[1],[[5,6,7,8]]);
});
test('simultaneous blue and red lines draw independently of resolution order',()=>{
 const r=E.resolve(board([[2,2],[5,2],[6,2],[8,2],[15,1],[16,1],[19,1]]),17,0);
 assert.equal(r.over,true);assert.equal(r.winner,null);assert.equal(r.reason,'double-line');
 assert.deepEqual(r.lines,[[[15,16,17,18]],[[5,6,7,8]]]);
});
test('diagonal lines win, while apparent lines crossing a row boundary do not',()=>{
 assert.equal(E.resolve(board([[0,1],[6,1],[12,1]]),18,0).winner,0);
 assert.equal(E.resolve(board([[3,1],[4,1],[5,1]]),6,0).over,false);
});
test('a full board without any line draws',()=>{
 const b=[1,1,2,2,1,2,2,1,1,2,1,1,2,2,1,2,2,1,1,2,1,2,2,1,0];
 const r=E.resolve(b,24,0);assert.equal(r.over,true);assert.equal(r.reason,'full');assert.equal(r.winner,null);
});
test('invalid placement, color and terminal play are rejected without mutation',()=>{
 const s=E.createGame(3),a=E.applyMove(s,12),copy=structuredClone(a);
 for(const v of [-1,25,1.5,'7',null,12])assert.throws(()=>E.applyMove(a,v));
 assert.throws(()=>E.resolve(s.board,3,2));assert.deepEqual(a,copy);
 const terminal={...a,phase:'over'};assert.deepEqual(E.legalMoves(terminal),[]);assert.throws(()=>E.applyMove(terminal,0));
});
test('each legal move adds exactly one stone, never loses colors, and leaves its input intact',()=>{
 let s=E.createGame(11);for(let n=0;n<25&&s.phase==='playing';n++){
  const copy=structuredClone(s),side=s.turn,m=E.legalMoves(s)[(n*7)%E.legalMoves(s).length],next=E.applyMove(s,m);
  for(const color of [1,2])assert.equal(next.board.filter(v=>v===color).length,s.board.filter(v=>v===color).length+(color===side+1?1:0));
  assert.deepEqual(s,copy);s=next;
 }assert.equal(s.phase,'over');assert(s.ply<=25);
});
test('saves are rebuilt from exact public actions and replay never modifies a live match',()=>{
 let s=E.createGame(42,1);for(const cell of [0,24,12,4,20])s=E.applyMove(s,cell);
 assert.deepEqual(E.validateGame(s),s);assert.deepEqual(E.replayGame(s,0).board,board([[19,1],[5,2]]));assert.equal(E.replayGame(s,2).ply,2);
 const forged=structuredClone(s);forged.board[1]=1;assert.equal(E.validateGame(forged),null);
 assert.equal(E.validateGame({...s,history:[12,12]}),null);assert.equal(E.validateGame({...s,version:3}),null);assert.equal(E.validateGame(null),null);
 assert.equal(s.ply,5);assert.deepEqual(E.createGame(42,1),E.createGame(42,1));assert.equal(E.createGame(42,1).turn,1);
});
test('the seeded opening gives both colors one opposite stone, making shared motion visible immediately',()=>{
 const s=E.createGame(13);assert.deepEqual(s.board,board([[10,2],[14,1]]));
 const next=E.applyMove(s,12);assert.deepEqual(next.board,board([[11,2],[12,1],[13,1]]));
 for(let seed=0;seed<24;seed++){
  const b=E.createGame(seed).board,a=b.indexOf(1),c=b.indexOf(2);assert.equal(a+c,24);assert.equal(b.filter(Boolean).length,2);assert.notEqual(a,12);
 }
});
