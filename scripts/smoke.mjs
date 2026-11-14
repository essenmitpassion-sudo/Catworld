import {chromium} from '@playwright/test';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
await mkdir('work',{recursive:true});
const html=await readFile('dist/VEIL.html','utf8'),examples=JSON.parse(await readFile('work/match-examples.json','utf8')),errors=[];
assert(examples.win&&examples.loss&&examples.pincer,'simulations must provide actual win and loss matches');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
async function open(seed,width=1280,denied=false){
 const context=await browser.newContext({viewport:{width,height:1050},deviceScaleFactor:2,reducedMotion:'reduce'});if(denied)await context.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('denied');}}));
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith('https://veil.test/')?r.fulfill({contentType:'text/html',body:html}):r.abort());await page.goto('https://veil.test/?seed='+seed);await page.locator('#pace').selectOption('fast');return {page,context};
}
const stored=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('veil.match')));
const ready=page=>page.waitForFunction(()=>{const s=JSON.parse(localStorage.getItem('veil.match'));return s.phase==='over'||s.phase==='playing'&&s.turn===0;});
async function clickAction(page,state,action){
 if(action.type==='pass'){await page.locator('#pass').click();return;}
 const p=state.pieces.find(p=>p.id===action.piece);await page.locator(`[data-x="${p.x}"][data-y="${p.y}"]`).click();
 if(action.type==='scan'){await page.locator('#echo-mode').click();const t=state.pieces.find(p=>p.id===action.target);await page.locator(`[data-x="${t.x}"][data-y="${t.y}"]`).click();}
 else await page.locator(`[data-x="${action.x}"][data-y="${action.y}"]`).click();
}
try{
 for(const outcome of ['win','loss','pincer']){
  const example=examples[outcome],{page,context}=await open(example.seed);
  assert.equal(await page.locator('.opponent.masked').count(),6);assert.deepEqual(await page.locator('.opponent b').allTextContents(),['?','?','?','?','?','?']);assert.equal(await page.locator('[role="gridcell"]').count(),49);
  if(outcome==='win'){
   await page.locator('[data-x="0"][data-y="5"]').click();await page.locator('[data-x="1"][data-y="5"]').click();const setup=await stored(page);assert.equal(setup.deployment.find(p=>p.id==='0-0').x,1);await page.reload();assert.deepEqual(await stored(page),setup,'setup must survive reload');await page.locator('#retry').click();
   await page.locator('#rules-button').click();assert.equal(await page.locator('#rules').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#rules').isVisible(),false);
   await page.screenshot({path:'work/setup-desktop.png',fullPage:true});
   for(const width of [320,390,768,1920]){await page.setViewportSize({width,height:1050});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`no overflow at ${width}`);}
   await page.setViewportSize({width:390,height:1050});await page.screenshot({path:'work/setup-mobile.png',fullPage:true});await page.setViewportSize({width:1280,height:1050});
  }
  await page.locator('#start').click();
  let humanTurns=0,pincerSeen=false;
  while((await stored(page)).phase!=='over'){
   await ready(page);let s=await stored(page);if(s.last?.pincer){pincerSeen=true;assert.match(await page.locator('#log').innerText(),/Zange/);}if(s.phase==='over')break;
   const planned=example.moves[s.ply];assert.equal(planned.side,0,'browser must match the actual deterministic AI trace');
   await clickAction(page,s,planned.action);if((await stored(page)).last?.pincer){pincerSeen=true;assert.match(await page.locator('#log').innerText(),/Zange/);}humanTurns++;
   if(humanTurns===2&&outcome==='win'){const after=await stored(page);await page.reload();await ready(page);const resumed=await stored(page);assert(resumed.ply>=after.ply&&resumed.ply<=after.ply+1,'reload must preserve the action and at most complete its pending AI reply');}
   if(humanTurns>40)throw Error('UI match did not terminate');
  }
  const ended=await stored(page);assert.equal(ended.winner,example.winner);if(outcome==='pincer')assert(pincerSeen,'a complete pincer example must visibly execute the positional capture');assert.equal(await page.locator('#result').isVisible(),true);assert.match(await page.locator('#result-title').textContent(),example.winner===0?/gewonnen/:example.winner===1?/Gegner gewinnt/:/Remis/);
  await page.screenshot({path:`work/${outcome}.png`,fullPage:true});
  await page.locator('#watch').click();assert.equal(await page.locator('.opponent.masked').count(),6,'replay must show information as known then');await page.locator('#replay-range').fill(String(ended.history.length));assert.equal((await stored(page)).ply,ended.ply);await page.locator('#replay-close').click();assert.deepEqual(await stored(page),ended,'replay must never alter the real game');
  await page.locator('#new-game').click();const fresh=await stored(page);assert.notEqual(fresh.seed,example.seed);assert.equal(fresh.phase,'setup');assert.equal(fresh.ply,0);
  await context.close();console.log(`Complete real UI ${outcome}, authoritative reload, historical fog replay and restart: PASS (${ended.ply} actions)`);
 }
 const {page,context}=await open(42,320,true);await page.locator('#start').click();await page.locator('[data-x="0"][data-y="5"]').click();await page.locator('[data-x="0"][data-y="4"]').click();assert.match(await page.locator('#save-status').textContent(),/SPEICHERT NICHT/);await context.close();
 assert.deepEqual(errors,[]);await writeFile('work/browser-result.json',JSON.stringify({win:true,loss:true,setupReload:true,midTurnReload:true,replayFog:true,restart:true,storageDenied:true,widths:[320,390,768,1920],pageErrors:errors},null,2));console.log('Privacy rendering, setup, native rules dialog, keyboard, 320–1920px, offline artifact and denied storage: PASS');
}finally{await browser.close();}
