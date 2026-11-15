import test from'node:test';import assert from'node:assert/strict';import{createGame}from'../src/engine.js';import{oracleStep}from'../scripts/lib/variant-oracle.mjs';
function fixture(pieces){const s=createGame();s.board=Array(25).fill(0);for(const[i,side]of pieces)s.board[i]=side;return s;}
test('transport metric includes a vertical arrival in a row with one existing piece',()=>{const s=fixture([[1,1],[9,-1]]),r=oracleStep(s,{from:1,to:6,shift:1},'active');assert.equal(r.shiftedPieces,2);});
test('transport metric counts survivors after capture rather than pre-step occupancy',()=>{const s=fixture([[10,1],[11,-1],[24,-1]]),r=oracleStep(s,{from:10,to:11,shift:1},'active');assert.equal(r.shiftedPieces,1);});
