import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGame, resolve, edit, advance, forecast} from '../src/engine.js';
const empty=()=>Array.from({length:25},()=>({axis:'h',pressure:0}));
const total=b=>b.reduce((a,c)=>a+c.pressure,0);

test('four pressure splits into two on each side and never mutates input',()=>{
 const b=empty(); b[12].pressure=3; const snapshot=structuredClone(b);
 const r=resolve(b,[{index:12,amount:1}]);
 assert.equal(r.board[12].pressure,0); assert.equal(r.board[11].pressure,2); assert.equal(r.board[13].pressure,2);
 assert.equal(total(r.board),4); assert.deepEqual(b,snapshot); assert.equal(r.events.length,1);
});
test('vertical axis cascades to a second cell with literal hand-calculated result',()=>{
 const b=empty();b[12]={axis:'v',pressure:3};b[7]={axis:'h',pressure:2};
 const r=resolve(b,[{index:12,amount:1}]);
 assert.equal(r.board[7].pressure,0); assert.equal(r.board[6].pressure,2);assert.equal(r.board[8].pressure,2);assert.equal(r.board[17].pressure,2);
 assert.equal(r.events.length,2);assert.equal(r.leaks,0);
});
test('only middle edge exits charge corresponding beacons; corner exits damage hull',()=>{
 const b=empty(); b[2]={axis:'v',pressure:4}; b[14]={axis:'h',pressure:4}; b[22]={axis:'v',pressure:4}; b[10]={axis:'h',pressure:4};b[0].pressure=4;
 const r=resolve(b,[]);
 assert.deepEqual(r.delivered,[2,2,2,2]);assert.equal(r.leaks,1);
 assert.equal(total(r.board)+r.delivered.reduce((a,c)=>a+c,0)+r.leaks*2,20);
});
test('edits spend two scarce interventions, reject third and invalid input without mutation',()=>{
 const s=createGame('rules');const snapshot=structuredClone(s);const a=edit(s,12,'flip');const b=edit(a,13,'flip');
 assert.equal(a.edits,1);assert.notEqual(a.board[12].axis,s.board[12].axis);assert.equal(b.edits,2);
 assert.throws(()=>edit(b,14,'flip'));assert.throws(()=>edit(s,-1,'flip'));assert.throws(()=>edit(s,1.5,'flip'));assert.throws(()=>edit(s,12,'hack'));
 assert.deepEqual(s,snapshot);
});
test('vent sacrifices up to two stored pressure and cannot spend on an empty cell',()=>{
 const s=createGame('vent');s.board[12].pressure=3;s.board[0].pressure=0;
 const a=edit(s,12,'vent');assert.equal(a.board[12].pressure,1);assert.equal(a.edits,1);assert.throws(()=>edit(s,0,'vent'));
});
test('seed reproduces complete run schedule while other seeds differ; forecasts do not mutate',()=>{
 assert.deepEqual(createGame('a'),createGame('a'));assert.notDeepEqual(createGame('a').board,createGame('b').board);
 const s=createGame('a');const before=structuredClone(s);assert.equal(forecast(s).length,2);assert.deepEqual(s,before);
 assert.throws(()=>createGame('<script>'));assert.throws(()=>createGame('x'.repeat(25)));
});
test('advance and preview agree exactly, keep input and reset intervention budget',()=>{
 const s=edit(createGame('preview'),12,'flip');const before=structuredClone(s);
 const r=resolve(s.board,forecast(s));const next=advance(s);
 assert.deepEqual(next.board,r.board);assert.equal(next.hull,Math.max(0,s.hull-r.leaks));assert.equal(next.turn,1);assert.equal(next.edits,0);assert.deepEqual(s,before);
});
test('win, hull loss priority, deadline loss and terminal input lock are explicit',()=>{
 const s=createGame('end');s.board=empty();s.beacons=[8,8,8,6];s.schedule[0]=[{index:10,amount:4}];
 const win=advance(s);assert.equal(win.status,'won');assert.throws(()=>advance(win));assert.throws(()=>edit(win,1,'flip'));
 const death=structuredClone(s);death.hull=1;death.board[0].pressure=4;assert.equal(advance(death).status,'lost');
 const late=createGame('late');late.board=empty();late.turn=9;late.schedule[9]=[];assert.equal(advance(late).status,'lost');
});
test('dense mixed networks terminate, stabilize and conserve every unit across 100 seeds',()=>{
 for(let i=0;i<100;i++) {const s=createGame(String(i));const f=forecast(s);const r=resolve(s.board,f);
 assert.ok(r.board.every(c=>c.pressure>=0&&c.pressure<4));assert.ok(r.events.length<1000);
 assert.equal(total(s.board)+f.reduce((n,x)=>n+x.amount,0),total(r.board)+r.delivered.reduce((a,c)=>a+c,0)+2*r.leaks);
 }
});
