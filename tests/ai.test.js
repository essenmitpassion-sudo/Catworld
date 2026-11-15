import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGame,applyMove,resolve,legalMoves,validateGame} from '../src/engine.js';
import * as AI from '../src/ai.js';
const fixture=(pairs,side=0)=>{const s=createGame(51,side);s.board.fill(0);for(const [cell,color] of pairs)s.board[cell]=color;return s;};
test('the opponent takes a post-attraction win using the same public transition',()=>{
 const s=fixture([[5,1],[6,1],[9,1]]);
 const move=AI.chooseMove?.(s);assert.equal(move,7);assert.equal(resolve(s.board,move,0).winner,0);
});
test('the opponent prevents a visible immediate loss when a reply-safe move exists',()=>{
 const s=fixture([[5,2],[6,2],[9,2],[0,1],[24,1]]),cell=AI.chooseMove(s),next=applyMove(s,cell);
 assert.notEqual(next.winner,1);
 if(next.phase==='playing')for(const reply of legalMoves(next))assert.notEqual(resolve(next.board,reply,1).winner,1);
});
test('decisions are reproducible, legal and leave the public match unchanged',()=>{
 let s=createGame(9,1);
 for(let n=0;n<6&&s.phase==='playing';n++){
  const copy=structuredClone(s),a=AI.chooseMove(s,{depth:2});assert(legalMoves(s).includes(a));assert.equal(a,AI.chooseMove(s,{depth:2}));assert.deepEqual(s,copy);s=applyMove(s,a);
 }
});
test('different public policies finish whole reconstructible matches without cycles',()=>{
 for(const starter of [0,1]){
  let s=createGame(71,starter);
  while(s.phase==='playing')s=applyMove(s,AI.chooseMove(s,{depth:2,style:s.turn?'tactical':'gather'}));
  assert(s.ply>=5&&s.ply<=23);assert.deepEqual(validateGame(s),s);assert.throws(()=>AI.chooseMove(s));
 }
});
