import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.js';
import * as AI from '../src/ai.js';
test('AI takes an immediate final-board gate win, legally and without mutation',()=>{const s=E.createGame();s.board=Array(25).fill(0);s.board[6]=1;s.board[24]=-1;s.positions=[E.positionKey(s)];const copy=structuredClone(s);const r=AI.chooseMove(s,{depth:3,nodeLimit:10000});assert.equal(E.applyMove(s,r.move).winner,1);assert.deepEqual(s,copy);});
test('bounded search defends against a one-turn gate threat when a defense exists',()=>{const s=E.createGame();s.board=Array(25).fill(0);s.board[16]=-1;s.board[21]=1;s.board[23]=1;s.board[0]=-1;s.positions=[E.positionKey(s)];const r=AI.chooseMove(s,{depth:3,nodeLimit:30000});const n=E.applyMove(s,r.move);assert(!E.legalMoves(n).some(m=>E.applyMove(n,m).winner===-1));});
test('AI respects budget, determinism, terminal states and completes both initiative orders',()=>{
 for(const starter of [1,-1]){let s=E.createGame({starter});while(s.status==='playing'){const copy=structuredClone(s);const a=AI.chooseMove(s,{depth:2,nodeLimit:5000,seed:7});const b=AI.chooseMove(s,{depth:2,nodeLimit:5000,seed:7});assert.deepEqual(a,b);assert(a.nodes<=5000);assert(E.legalMoves(s).some(m=>JSON.stringify(m)===JSON.stringify(a.move)));assert.deepEqual(s,copy);s=E.applyMove(s,a.move);}assert(s.ply<=120);assert.equal(AI.chooseMove(s).move,null);}
});
test('search prunes equivalent successor boards without changing exact fixed-horizon value',()=>{
 const s=E.createGame();s.board=Array(25).fill(0);s.board[2]=1;s.board[21]=1;s.board[4]=-1;s.positions=[E.positionKey(s)];
 const r=AI.chooseMove(s,{depth:3,nodeLimit:100000,seed:5});assert(r.prunedEquivalentMoves>0,'equivalent immediate gate wins must not search the same board twice');
 function value(p,d){if(p.status!=='playing'||d===0){const n=AI.evaluate(p,p.turn);return Math.abs(n)===100000?Math.sign(n)*(100000-p.ply):n;}return Math.max(...E.legalMoves(p).map(m=>-value(E.applyMove(p,m),d-1)));}
 assert.equal(r.score,value(s,r.completedDepth));assert.equal(r.completedDepth,1);
});
