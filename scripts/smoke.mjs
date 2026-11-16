import {chromium} from '@playwright/test';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createGame,edit,advance} from '../src/engine.js';
import {choose} from './policies.mjs';
await mkdir('work/preview',{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try {
 await page.route('http://kippwerk.test/**',async route=>route.fulfill({contentType:'text/html',body:await readFile('dist/KIPPWERK.html','utf8')}));
 await page.goto('http://kippwerk.test/');
 await page.getByRole('button',{name:'Los geht’s'}).click();
 assert.equal(await page.locator('.cell').count(),25);
 await page.screenshot({path:'work/preview/desktop.png',fullPage:true});
 let s=createGame('MORGEN');const turns=[];
 while(s.status==='playing') {
  const path=choose(s);
  for(const a of path) {
   await page.getByRole('button',{name:a.kind==='flip'?'Kippen':'Entlasten',exact:true}).click();
   await page.locator(`[data-cell="${a.index}"]`).click();s=edit(s,a.index,a.kind);
  }
  const next=advance(s);
  const preview=await page.locator('#app').getAttribute('data-preview');
  assert.deepEqual(JSON.parse(preview),{beacons:next.beacons,hull:next.hull});
  await page.getByRole('button',{name:'Flut auslösen',exact:true}).click();
  await page.waitForFunction(t=>Number(document.querySelector('#app').dataset.turn)===t,next.turn);
  assert.deepEqual(JSON.parse(await page.locator('#app').getAttribute('data-board')),next.board);
  turns.push({turn:next.turn,hull:next.hull,beacons:next.beacons});s=next;
 }
 assert.equal(s.status,'won');await page.getByRole('heading',{name:'Alle Feuer brennen.'}).waitFor();
 await page.screenshot({path:'work/preview/win.png',fullPage:true});
 await page.getByRole('button',{name:'Gleiche Karte',exact:true}).click();
 assert.equal(await page.locator('#app').getAttribute('data-turn'),'0');
 let loss=createGame('MORGEN');while(loss.status==='playing') {loss=advance(loss);await page.getByRole('button',{name:'Flut auslösen',exact:true}).click();await page.waitForFunction(t=>Number(document.querySelector('#app').dataset.turn)===t,loss.turn);}
 assert.equal(loss.status,'lost');await page.getByRole('heading',{name:/Die Inseln verstummen.|Die Zeit ist um./}).waitFor();
 await page.getByRole('button',{name:'Gleiche Karte',exact:true}).click();
 for(const width of [320,390,768,1440]) {await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width}`);await page.screenshot({path:`work/preview/width-${width}.png`,fullPage:true});}
 assert.deepEqual(errors,[]);const result={win:turns,loss:{turn:loss.turn,hull:loss.hull},widths:[320,390,768,1440],errors};
 await writeFile('work/browser-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
} finally {await browser.close();}
