import {chromium} from '@playwright/test';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
await mkdir('work',{recursive:true});
const html=await readFile('dist/index.html','utf8'),examples=JSON.parse(await readFile('work/sog-examples.json','utf8')),errors=[];
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const stored=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('sog.match')));
async function open(seed=3,starter=0,width=1280,{denied=false,reduced=true,corrupt=false,restore=null}={}) {
 const context=await browser.newContext({viewport:{width,height:850},deviceScaleFactor:1,reducedMotion:reduced?'reduce':'no-preference',hasTouch:width<500});
 if(denied)await context.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('denied');}}));
 if(restore)await context.addInitScript(value=>localStorage.setItem('sog.match',JSON.stringify(value)),restore);
 if(corrupt)await context.addInitScript(()=>{localStorage.setItem('sog.match','{broken');localStorage.setItem('signalbruch.match','legacy-preserved');});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>r.request().url().startsWith('https://sog.test/')?r.fulfill({contentType:'text/html',body:html}):r.abort());
 await page.goto(`https://sog.test/?seed=${seed}&starter=${starter}`);return{page,context};
}
const ready=page=>page.waitForFunction(()=>{const s=JSON.parse(localStorage.getItem('sog.match'));return s&&(s.phase==='over'||s.turn===0);});
try {
 const corrupt=await open(3,0,320,{corrupt:true});
 assert.equal(await corrupt.page.locator('#storage-note').textContent(),'','bad JSON must not claim storage is unavailable');
 assert.match(await corrupt.page.locator('#hint').textContent(),/beschädigt/);
 assert.equal(await corrupt.page.evaluate(()=>localStorage.getItem('signalbruch.match')),'legacy-preserved');
 assert.equal((await stored(corrupt.page)).ply,0);await corrupt.context.close();
 const first=await open(3,0,320);let p=first.page;
 assert.equal(await p.locator('[data-cell]').count(),25,'initial board must be immediately playable');
 assert.equal(await p.locator('#start').count(),0,'no Start/tutorial gate');
 assert.equal(await p.locator('#rules').getAttribute('open'),null,'rules are optional and closed');
 const goal=await p.locator('#goal').textContent();assert.match(goal,/Vier/);
 for(const width of [320,390,768,1440]) {
  await p.setViewportSize({width,height:850});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const b=await p.locator('#board').boundingBox(),cell=await p.locator('[data-cell="12"]').boundingBox();assert(b.y+b.height<850,'entire board before scroll');assert(cell.width>=44,'usable touch target');
 }
 await p.setViewportSize({width:320,height:700});await p.screenshot({path:'work/sog-mobile.png',fullPage:true});
 await p.locator('[data-cell="12"]').focus();await p.keyboard.press('Enter');assert.equal((await stored(p)).history[0],12);
 await p.locator('#undo').click();assert.equal((await stored(p)).ply,0);await p.waitForTimeout(800);assert.equal((await stored(p)).ply,0,'undo cancels pending AI');
 await p.locator('[data-cell="10"]').click();const pending=await stored(p);assert.equal(pending.ply,1);await p.reload();await ready(p);const resumed=await stored(p);assert.equal(resumed.ply,2);assert.equal(resumed.history[0],10);await first.context.close();
 console.log('Immediate board / no gate / responsive first click / keyboard / pending AI undo + reload: PASS');
 for(const kind of ['win','loss']) {
  const e=examples[kind];assert(e,`complete ${kind} fixture required`);const {page,context}=await open(e.seed,e.starter);let pulls=0,enemyPulls=0;
  while((await stored(page)).phase!=='over') {
   await ready(page);const s=await stored(page);if(s.phase==='over')break;
   const cell=e.state.history[s.ply];assert.equal(s.turn,0);await page.locator(`[data-cell="${cell}"]`).click();
   const committed=await stored(page);pulls+=committed.last.pulls.length;enemyPulls+=committed.last.pulls.filter(p=>p.side===1).length;
   if(kind==='win'&&committed.ply>=5&&pulls)await page.screenshot({path:'work/sog-live.png',fullPage:true});
  }
  const end=await stored(page);assert.equal(end.winner,e.winner);assert.deepEqual(end.board,e.state.board);assert.equal(await page.locator('#result').isVisible(),true);
  await page.screenshot({path:`work/sog-${kind}.png`,fullPage:true});
  await page.locator('#watch').click();await page.locator('#replay-range').fill('0');assert.equal(await page.locator('.stone').count(),2,'only the two starting stones appear in initial replay');assert.deepEqual(await stored(page),end);
  await page.locator('#replay-close').click();assert.deepEqual(await stored(page),end);await page.locator('#new-game').click();const fresh=await stored(page);assert.notEqual(fresh.seed,end.seed);assert.equal(fresh.phase,'playing');
  await context.close();console.log(`Complete actual UI ${kind}: PASS (${end.ply} actions, human pulled ${enemyPulls} enemy stones)`);
 }
 const draw=examples.draw,{page:drawPage,context:drawContext}=await open(draw.seed,draw.starter,1280,{restore:draw.state});
 assert.equal((await stored(drawPage)).phase,'over');assert.equal(await drawPage.locator('#result').isVisible(),true);assert.match(await drawPage.locator('#status').textContent(),/Unentschieden/);
 await drawPage.waitForTimeout(650);assert.deepEqual(await stored(drawPage),draw.state,'terminal reload never schedules AI');
 await drawPage.locator('#watch').click();await drawPage.locator('#replay-range').fill('0');assert.equal(await drawPage.locator('.stone').count(),2);await drawPage.locator('#replay-close').click();assert.deepEqual(await stored(drawPage),draw.state);
 await drawPage.screenshot({path:'work/sog-draw.png',fullPage:true});await drawContext.close();console.log('Legal full-board draw save: restored and replayed; no AI-match claim');
 const normal=await open(13,0,1280,{reduced:false}),np=normal.page;
 const original=await np.locator('#stones .blue').elementHandle(),before=await original.boundingBox();
 await np.locator('[data-cell="12"]').hover();assert.equal(await np.locator('.ghost').count(),3);assert.match(await np.locator('#hint').textContent(),/1 blaue und 1 rote/);
 await np.locator('[data-cell="12"]').click();await np.waitForTimeout(70);
 assert.equal(await original.evaluate(el=>el.isConnected),true,'moving stone retains its DOM identity');
 const moving=await original.boundingBox();assert(moving.x<before.x-1,'real stone moves toward the anchor');assert.match(await np.locator('#status').textContent(),/Dein Stein zieht/);
 await np.locator('#undo').click();await np.waitForTimeout(750);assert.equal((await stored(np)).ply,0);assert.equal(await np.locator('#stones .stone').count(),2);
 await np.locator('[data-cell="12"]').click();await np.waitForFunction(()=>JSON.parse(localStorage.getItem('sog.match')).ply===2);assert.match(await np.locator('#status').textContent(),/Rot zieht/);
 await np.waitForFunction(()=>document.querySelector('#status').textContent==='Setze einen blauen Stein.');await np.screenshot({path:'work/sog-desktop.png',fullPage:true});await normal.context.close();
 console.log('Exact shared-pull preview / real normal-motion stones / feedback actor / cancel during motion: PASS');
 const {page,context}=await open(42,0,320,{denied:true});await page.locator('[data-cell="12"]').click();assert.match(await page.locator('#storage-note').textContent(),/Speicher/);await context.close();
 assert.deepEqual(errors,[]);
 await writeFile('work/sog-browser-result.json',JSON.stringify({immediateBoard:true,keyboard:true,undoPendingAI:true,pendingReload:true,win:true,loss:true,drawRestored:true,normalMotion:true,exactPreview:true,corruptStorage:true,legacyStoragePreserved:true,replayReadOnly:true,newMatch:true,deniedStorage:true,widths:[320,390,768,1440],errors},null,2)+'\n');
} finally {await browser.close();}
