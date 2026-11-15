import {chromium} from '@playwright/test';import {readFile,mkdir,writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
await mkdir('work',{recursive:true});const html=await readFile('dist/SIGNALBRUCH.html','utf8'),examples=JSON.parse(await readFile('work/signalbruch-examples.json','utf8')),errors=[],covered=new Set();
assert(examples.win&&examples.loss&&examples.takeover,'real full-match fixtures must include both outcomes and interception');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
async function open(seed,width=1280,denied=false){const context=await browser.newContext({viewport:{width,height:1050},deviceScaleFactor:2,reducedMotion:'reduce'});if(denied)await context.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('denied');}}));const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith('https://signalbruch.test/')?r.fulfill({contentType:'text/html',body:html}):r.abort());await page.goto('https://signalbruch.test/?seed='+seed);await page.locator('#pace').selectOption('fast');return{page,context};}
const stored=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('signalbruch.match')));
const ready=page=>page.waitForFunction(()=>{const s=JSON.parse(localStorage.getItem('signalbruch.match'));return s.phase==='over'||s.phase==='playing'&&s.turn===0;});
async function action(page,a){await page.locator('#mode-'+a.type).click();if(a.type==='send'){await page.locator(`[data-node="${a.source}"]`).click();await page.locator(`[data-node="${a.to}"]`).click();}else if(a.type==='redirect'){await page.locator(`[data-node="${a.relay}"]`).click();await page.locator(`[data-node="${a.to}"]`).click();}else await page.locator(`[data-packet="${a.packet}"]`).click();covered.add(a.type);}
try{
 for(const kind of ['win','loss','takeover']){
  const e=examples[kind],{page,context}=await open(e.seed);assert.equal(await page.locator('[data-node]').count(),9);assert.equal(await page.title(),'SIGNALBRUCH — Der Weg der Entscheidung');
  if(kind==='win'){
   await page.locator('#rules-button').click();assert.equal(await page.locator('#rules').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#rules').isVisible(),false);
   for(const width of [320,390,768,1920]){await page.setViewportSize({width,height:1050});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`no overflow at ${width}`);const box=await page.locator('[data-node="4"]').boundingBox();assert(box.width>=40,'relay hit target must remain usable');}
   await page.setViewportSize({width:320,height:1050});await page.screenshot({path:'work/signalbruch-mobile.png',fullPage:true});await page.setViewportSize({width:1280,height:1050});await page.screenshot({path:'work/signalbruch-desktop.png',fullPage:true});
  }
  await page.locator('#start').click();let human=0;
  while((await stored(page)).phase!=='over'){
   await ready(page);const s=await stored(page);if(s.phase==='over')break;const planned=e.moves[s.ply];assert.equal(planned.side,0,'UI must follow the actual deterministic opponent trace');
   await action(page,planned.action);human++;
   if(kind==='win'&&human===3){const saved=await stored(page);await page.reload();await ready(page);const resumed=await stored(page);assert(resumed.ply>=saved.ply&&resumed.ply<=saved.ply+2);assert.deepEqual(resumed.history.slice(0,saved.ply),saved.history,'reload must preserve the exact completed action');}
   if(kind==='win'&&human===5)await page.screenshot({path:'work/signalbruch-live.png',fullPage:true});
   assert(human<=24);
  }
  const end=await stored(page);assert.equal(end.winner,e.winner);assert.equal(await page.locator('#result').isVisible(),true);assert.deepEqual([end.nodes[0].integrity,end.nodes[8].integrity],e.hq);assert(end.tick<=24);await page.screenshot({path:`work/signalbruch-${kind}.png`,fullPage:true});
  await page.locator('#watch').click();assert.equal(await page.locator('.packet').count(),0,'initial replay has no future signals');await page.locator('#replay-range').fill(String(end.ply));assert.deepEqual(await stored(page),end);await page.locator('#replay-close').click();assert.deepEqual(await stored(page),end);
  await page.locator('#new-game').click();const fresh=await stored(page);assert.notEqual(fresh.seed,end.seed);assert.equal(fresh.phase,'setup');assert.equal(fresh.tick,0);await context.close();console.log(`Complete real UI ${kind} / both-action ticks / reload / replay / restart: PASS (${end.tick} net ticks)`);
 }
 assert.deepEqual([...covered].sort(),['redirect','send','takeover']);
 const {page,context}=await open(42,320,true);await page.locator('#start').click();await page.locator('#mode-send').click();await page.locator('[data-node="1"]').click();await page.locator('[data-node="3"]').click();assert.match(await page.locator('#save-status').textContent(),/SPEICHERT NICHT/);await context.close();
 assert.deepEqual(errors,[]);await writeFile('work/signalbruch-browser-result.json',JSON.stringify({win:true,loss:true,takeover:true,allThreeHumanActions:true,pendingTickReload:true,replay:true,restart:true,storageDenied:true,widths:[320,390,768,1920],errors},null,2));console.log('All three human action types, conditional forecasts, responsive portrait map, native rules, denied storage and no runtime errors: PASS');
}finally{await browser.close();}
