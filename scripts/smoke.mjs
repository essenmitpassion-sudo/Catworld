import {chromium} from '@playwright/test';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createGame,applyMove,legalMoves,positionKey} from '../src/engine.js';
import {chooseMove} from '../src/ai.js';
await mkdir('work',{recursive:true});
const html=await readFile('dist/VERSATZ.html','utf8'),errors=[];
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
async function open(width=1280,denied=false,motion='reduce'){const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:motion});if(denied)await context.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('denied');}}));const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith('https://versatz.test/')?r.fulfill({contentType:'text/html',body:html}):r.abort());await page.goto('https://versatz.test/');return {page,context};}
const stored=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('versatz.v2')).game);
async function ready(page){await page.waitForFunction(()=>!document.querySelector('#board').classList.contains('busy'));}
async function play(page,s,m){await page.locator(`[data-cell="${m.from}"]`).click();await page.locator(`[data-cell="${m.to}"]`).click();await page.locator(m.shift===1?'#shift-right':'#shift-left').click();const preview=await page.locator('#preview-summary').innerText();assert(preview.length>0);const shown=await page.locator('#tokens .token').evaluateAll(els=>els.map(el=>({cell:Number(el.dataset.position),side:el.classList.contains('ivory')?1:-1})).sort((a,b)=>a.cell-b.cell));const expected=applyMove(s,m).board.flatMap((side,cell)=>side?[{cell,side}]:[]);assert.deepEqual(shown,expected,'preview must show the exact final board, including every transported opponent');await page.locator('#commit').click();await ready(page);}
const results={matches:[],viewports:[],errors};
try{
 const {page,context}=await open();assert.equal(await page.locator('[role="gridcell"]').count(),25);
 await page.locator('#mode').selectOption('local');await page.locator('#formation').selectOption('0');
 let s=createGame({formation:0});assert.deepEqual(await stored(page),s);
 const first={from:21,to:16,shift:1};await play(page,s,first);s=applyMove(s,first);assert.deepEqual(await stored(page),s);assert.equal(await page.locator('.token:not(.ghost)').count(),6);
 await page.locator('#undo').click();assert.deepEqual(await stored(page),createGame({formation:0}));await page.reload();assert.deepEqual(await stored(page),createGame({formation:0}));
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow at ${width}`);results.viewports.push(width);if(width===390)await page.screenshot({path:'work/versatz-mobile.png',fullPage:true});}
 await page.setViewportSize({width:1440,height:1050});await page.screenshot({path:'work/versatz-desktop.png',fullPage:true});
 await page.locator('#rules-button').click();assert(await page.locator('#rules').isVisible());await page.keyboard.press('Escape');assert(!(await page.locator('#rules').isVisible()));
 // A full match through real clicks by both local players, including all previews.
 s=createGame({formation:0});let captures=0,wraps=0;while(s.status==='playing'){const m=chooseMove(s,{depth:3,nodeLimit:15000,seed:3}).move;await play(page,s,m);s=applyMove(s,m);captures+=Number(s.last.capture!==null);wraps+=Number(s.last.to%5+s.last.shift<0||s.last.to%5+s.last.shift>4);assert.deepEqual(await stored(page),s);}
 assert(await page.locator('#result').isVisible());assert.match(await page.locator('#result-title').innerText(),/gewinnt|Remis/);results.matches.push({mode:'local',plies:s.ply,winner:s.winner,reason:s.reason,captures,wraps});
 await page.locator('#rematch').click();assert.equal((await stored(page)).initial.starter,-1);assert.equal((await stored(page)).ply,0);
 // Real worker-driven AI game; the human side is driven only via UI clicks.
 await page.locator('#mode').selectOption('ai');await page.locator('#human').selectOption('1');await page.locator('#level').selectOption('quick');await page.locator('#starter').selectOption('1');
 while(true){await ready(page);s=await stored(page);if(s.status!=='playing')break;if(s.turn===1){const m=chooseMove(s,{depth:2,nodeLimit:4000,seed:9}).move;await play(page,s,m);}else await page.waitForFunction(()=>{const s=JSON.parse(localStorage.getItem('versatz.v2')).game;return s.turn===1||s.status!=='playing';});}
 results.matches.push({mode:'ai',plies:s.ply,winner:s.winner,reason:s.reason});assert(await page.locator('#result').isVisible());
 await page.reload();assert.deepEqual(await stored(page),s);assert(await page.locator('#result').isVisible());
 // A full match on the revised default deployment, with the human playing Jade.
 await page.locator('#formation').selectOption('2');await page.locator('#level').selectOption('deep');await page.locator('#human').selectOption('-1');
 while(true){await ready(page);s=await stored(page);if(s.status!=='playing')break;assert.equal(s.turn,-1);await play(page,s,chooseMove(s,{depth:1,nodeLimit:1500,seed:4}).move);}
 results.matches.push({mode:'ai-default-jade-human',plies:s.ply,winner:s.winner,reason:s.reason});assert(await page.locator('#result').isVisible());
 await page.locator('#human').selectOption('1');await page.locator('#formation').selectOption('0');
 // Pending worker cancellation, settings reset, and undo on the computer's turn.
 await page.locator('#new-game').click();s=await stored(page);const m=legalMoves(s)[0];await play(page,s,m);await page.locator('#undo').click();await page.waitForTimeout(200);assert.equal((await stored(page)).turn,1);assert.equal((await stored(page)).ply,0);
 await page.locator('#human').selectOption('-1');await page.locator('#mode').selectOption('local');await page.waitForTimeout(100);assert.equal((await stored(page)).ply,0);
 // A genuine repetition, executed from the public opening using legal horizontal shuffles.
 await page.locator('#starter').selectOption('1');let draw=createGame({formation:0});let seed=819;for(let attempt=0;attempt<100;attempt++){draw=createGame({formation:0});while(draw.status==='playing'){const quiet=legalMoves(draw).filter(m=>Math.floor(m.from/5)===Math.floor(m.to/5));if(!quiet.length)break;seed=Math.imul(seed,1664525)+1013904223>>>0;draw=applyMove(draw,quiet[seed%quiet.length]);}if(draw.status==='draw')break;}assert.equal(draw.status,'draw');
 for(const m of draw.history){const current=await stored(page);await play(page,current,m);}assert.match(await page.locator('#result-title').innerText(),/Remis/);results.matches.push({mode:'local-draw',plies:draw.ply,reason:draw.reason});
 // Preview does not spend a turn; keyboard cancellation restores the real board.
 await page.locator('#new-game').click();s=await stored(page);await page.locator('[data-cell="21"]').click();await page.locator('[data-cell="16"]').click();await page.locator('#shift-right').focus();assert.deepEqual(await stored(page),s);await page.keyboard.press('Escape');assert(await page.locator('#commit').isDisabled());
 await context.close();
 const moving=await open(1000,false,'no-preference');await moving.page.locator('#mode').selectOption('local');await moving.page.locator('#formation').selectOption('0');await moving.page.locator('[data-cell="21"]').click();await moving.page.locator('[data-cell="20"]').click();await moving.page.locator('#shift-left').click();await moving.page.evaluate(()=>{window.wrapEntry=new Promise(resolve=>{const observer=new MutationObserver(()=>{const el=document.querySelector('.wrap-copy');if(!el)return;const b=document.querySelector('#board').getBoundingClientRect(),r=el.getBoundingClientRect();observer.disconnect();resolve({left:r.left,right:b.right,cell:b.width/5});});observer.observe(document.querySelector('#ghosts'),{childList:true});});});await moving.page.locator('#commit').click();const entry=await moving.page.evaluate(()=>window.wrapEntry);assert(entry.left>entry.right-entry.cell/2,'left-wrap copy must enter from outside the right edge');await ready(moving.page);await moving.page.locator('#new-game').click();await moving.page.locator('[data-cell="21"]').click();await moving.page.locator('[data-cell="16"]').click();await moving.page.locator('#shift-right').click();await moving.page.locator('#commit').click();const stepError=await moving.page.evaluate(()=>new Promise(resolve=>{const b=document.querySelector('#board').getBoundingClientRect(),originX=b.left+b.width/5,targetY=b.top+3*b.width/5,start=performance.now();function sample(){const el=document.querySelector('[data-token="i21"]');const r=el.getBoundingClientRect();if(Math.abs(r.left-originX)>1){resolve(Math.abs(r.top-targetY));return;}if(performance.now()-start>2000){resolve(999);return;}requestAnimationFrame(sample);}sample();}));assert(stepError<2,'step must finish before horizontal row motion starts');await ready(moving.page);await moving.context.close();
 const denied=await open(390,true);await denied.page.locator('#mode').selectOption('local');await denied.page.locator('#formation').selectOption('0');await play(denied.page,createGame({formation:0}),first);assert.match(await denied.page.locator('#storage-status').innerText(),/nicht gespeichert/);await denied.context.close();
 assert.deepEqual(errors,[]);await writeFile('work/browser-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
}finally{await browser.close();}
