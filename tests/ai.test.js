import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chooseAction} from '../src/ai.js';
import {createGame,startGame,observe,legalActions,applyAction} from '../src/engine.js';
test('the AI makes the same decision in indistinguishable hidden worlds',()=>{const a=startGame(createGame(17));a.turn=0;const b=structuredClone(a),enemy=b.pieces.filter(p=>p.side===1);[enemy[0].role,enemy[2].role]=[enemy[2].role,enemy[0].role];const va=observe(a,0),vb=observe(b,0);assert.deepEqual(va,vb);assert.deepEqual(chooseAction(va),chooseAction(vb));});
test('AI choices are legal, deterministic and do not mutate observations through complete matches',()=>{for(let seed=1;seed<=8;seed++){let s=startGame(createGame(seed));while(s.phase==='playing'){const v=observe(s,s.turn),copy=structuredClone(v),a=chooseAction(v,s.turn?'balanced':'aggressive');assert.deepEqual(v,copy);assert.deepEqual(a,chooseAction(v,s.turn?'balanced':'aggressive'));assert(legalActions(v).some(l=>JSON.stringify(l)===JSON.stringify(a)));s=applyAction(s,a);}assert(s.ply<=80);assert(['over'].includes(s.phase));}});
