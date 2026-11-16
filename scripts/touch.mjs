import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:3000');
 const tap=async(locator)=>{await locator.scrollIntoViewIfNeeded();const b=await locator.boundingBox();await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);};
 await tap(page.getByRole('button',{name:'Die Reise beginnen',exact:true}));
 await tap(page.locator('[data-giant="ivo"] .creature'));assert.equal(await page.getByRole('button',{name:'Ivo auswählen',exact:true}).getAttribute('aria-pressed'),'true');
 const slider=page.getByRole('slider');await slider.scrollIntoViewIfNeeded();const box=await slider.boundingBox();await page.touchscreen.tap(box.x+box.width*.8,box.y+box.height/2);assert.ok(Number(await slider.inputValue())>.3);
 await tap(page.getByRole('button',{name:'Die Tide kommt',exact:false}));await page.waitForFunction(()=>document.querySelector('#app').dataset.tide==='1');
 await tap(page.getByRole('button',{name:'Neustart',exact:true}));assert.equal(await page.locator('#app').getAttribute('data-tide'),'0');
 assert.deepEqual(errors,[]);console.log('Chromium touch emulation: island tap, native course slider, tide and restart pass');
}finally{await browser.close();}
