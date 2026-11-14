import {chromium} from '@playwright/test';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createGame,applyMove,legalMoves,positionKey} from '../src/engine.js';
import {chooseMove} from '../src/ai.js';
await mkdir('work',{recursive:true});
const html=await readFile('dist/VERSATZ.html','utf8'),errors=[];
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
async function open(width=1280,denied=false){const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});if(denied)await context.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('denied');}}));const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith('https://versatz.test/')?r.fulfill({contentType:'text/html',body:html}):r.abort());await page.goto('https://versatz.test/');return {page,context};}
const stored=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('versatz.v1')).game);
async function ready(page){await page.waitForFunction(()=>!document.querySelector('#board').classList.contains('busy'));}
async function play(page,s,m){await page.locator(`[data-cell="${m.from}"]`).click();await page.locator(`[data-cell="${m.to}"]`).click();await page.locator(m.shift===1?'#shift-right':'#shift-left').click();const preview=await page.locator('#preview-summary').innerText();assert(preview.length>0);await page.locator('#commit').click();await ready(page);}
const results={matches:[],viewports:[],errors};
try{
 const {page,context}=await open();assert.equal(await page.locator('[role="gridcell"]').count(),25);
 await page.locator('#mode').selectOption('local');
 let s=createGame();assert.deepEqual(await stored(page),s);
 const first={from:21,to:16,shift:1};await play(page,s,first);s=applyMove(s,first);assert.deepEqual(await stored(page),s);assert.equal(await page.locator('.token:not(.ghost)').count(),6);
 await page.locator('#undo').click();assert.deepEqual(await stored(page),createGame());await page.reload();assert.deepEqual(await stored(page),createGame());
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow at ${width}`);results.viewports.push(width);if(width===390)await page.screenshot({path:'work/versatz-mobile.png',fullPage:true});}
 await page.setViewportSize({width:1440,height:1050});await page.screenshot({path:'work/versatz-desktop.png',fullPage:true});
 await page.locator('#rules-button').click();assert(await page.locator('#rules').isVisible());await page.keyboard.press('Escape');assert(!(await page.locator('#rules').isVisible()));
 // A full match through real clicks by both local players, including all previews.
 s=createGame();let captures=0,wraps=0;while(s.status==='playing'){const m=chooseMove(s,{depth:3,nodeLimit:15000,seed:3}).move;await play(page,s,m);s=applyMove(s,m);captures+=Number(s.last.capture!==null);wraps+=Number(s.last.to%5+s.last.shift<0||s.last.to%5+s.last.shift>4);assert.deepEqual(await stored(page),s);}
 assert(await page.locator('#result').isVisible());assert.match(await page.locator('#result-title').innerText(),/gewinnt|Remis/);results.matches.push({mode:'local',plies:s.ply,winner:s.winner,reason:s.reason,captures,wraps});
 await page.locator('#rematch').click();assert.equal((await stored(page)).initial.starter,-1);assert.equal((await stored(page)).ply,0);
 // Real worker-driven AI game; the human side is driven only via UI clicks.
 await page.locator('#mode').selectOption('ai');await page.locator('#human').selectOption('1');await page.locator('#level').selectOption('quick');await page.locator('#starter').selectOption('1');
 while(true){await ready(page);s=await stored(page);if(s.status!=='playing')break;if(s.turn===1){const m=chooseMove(s,{depth:2,nodeLimit:4000,seed:9}).move;await play(page,s,m);}else await page.waitForFunction(()=>{const s=JSON.parse(localStorage.getItem('versatz.v1')).game;return s.turn===1||s.status!=='playing';});}
 results.matches.push({mode:'ai',plies:s.ply,winner:s.winner,reason:s.reason});assert(await page.locator('#result').isVisible());
 await page.reload();assert.deepEqual(await stored(page),s);assert(await page.locator('#result').isVisible());
 // Pending worker cancellation, settings reset, and undo on the computer's turn.
 await page.locator('#new-game').click();s=await stored(page);const m=legalMoves(s)[0];await play(page,s,m);await page.locator('#undo').click();await page.waitForTimeout(200);assert.equal((await stored(page)).turn,1);assert.equal((await stored(page)).ply,0);
 await page.locator('#human').selectOption('-1');await page.locator('#mode').selectOption('local');await page.waitForTimeout(100);assert.equal((await stored(page)).ply,0);
 // A genuine repetition, executed from the public opening using legal horizontal shuffles.
 await page.locator('#starter').selectOption('1');let draw=createGame();let seed=819;for(let attempt=0;attempt<100;attempt++){draw=createGame();while(draw.status==='playing'){const quiet=legalMoves(draw).filter(m=>Math.floor(m.from/5)===Math.floor(m.to/5));if(!quiet.length)break;seed=Math.imul(seed,1664525)+1013904223>>>0;draw=applyMove(draw,quiet[seed%quiet.length]);}if(draw.status==='draw')break;}assert.equal(draw.status,'draw');
 for(const m of draw.history){const current=await stored(page);await play(page,current,m);}assert.match(await page.locator('#result-title').innerText(),/Remis/);results.matches.push({mode:'local-draw',plies:draw.ply,reason:draw.reason});
 // Preview does not spend a turn; keyboard cancellation restores the real board.
 await page.locator('#new-game').click();s=await stored(page);await page.locator('[data-cell="21"]').click();await page.locator('[data-cell="16"]').click();await page.locator('#shift-right').focus();assert.deepEqual(await stored(page),s);await page.keyboard.press('Escape');assert(await page.locator('#commit').isDisabled());
 await context.close();
 const denied=await open(390,true);await denied.page.locator('#mode').selectOption('local');await play(denied.page,createGame(),first);assert.match(await denied.page.locator('#storage-status').innerText(),/nicht gespeichert/);await denied.context.close();
 assert.deepEqual(errors,[]);await writeFile('work/browser-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
}finally{await browser.close();}
