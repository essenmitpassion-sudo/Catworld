import assert from 'node:assert/strict';
import {setTimeout as delay} from 'node:timers/promises';
const wishes=['Samsung 990 PRO 2 TB','Samsung 990 PRO 2 TB bis CHF 500'];
export async function androidFlow({send,evaluate},afterRestart) {
  const wait=async expression=>{
    const until=Date.now()+10000;do {if(await evaluate(expression))return;await delay(100);}while(Date.now()<until);
    throw new Error('Native Android UI condition failed: '+expression);
  };
  const tap=async selector=>{
    const point=await evaluate(`(()=>{const n=document.querySelector(${JSON.stringify(selector)});n?.scrollIntoView({block:'center',behavior:'instant'});const r=n?.getBoundingClientRect();return r?{x:r.left+r.width/2,y:r.top+r.height/2}:null;})()`);
    assert(point,'Missing native UI action: '+selector);
    assert(await evaluate(`(()=>{const n=document.querySelector(${JSON.stringify(selector)}),hit=document.elementFromPoint(${point.x},${point.y});return n===hit||n?.contains(hit);})()`),'Native UI action obscured');
    await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});
  };
  if(afterRestart) {
    assert.equal(await evaluate("localStorage.getItem('udi.language.v1')"),'de','native language persists');
    await tap('nav a[href="#watchlist"]');
    for(const wish of wishes)await wait(`Array.from(document.querySelectorAll('#saved .surface h2')).some(node=>node.textContent===${JSON.stringify(wish)})`);
    assert.deepEqual(await evaluate("JSON.parse(localStorage.getItem('udi.searches.v2')).map(row=>row.query).sort()"),[...wishes].sort(),'both distinct requests survived');
    assert(await evaluate("JSON.parse(localStorage.getItem('udi.searches.v2')).every(row=>row.schemaVersion===2&&row.marketId==='CH'&&row.deliveryCountry==='CH'&&row.currency==='CHF')"));
    console.log('Android: saved searches and CH context survived force-stop/relaunch; German selection preserved.');return;
  }
  for(const [index,language] of ['en','de'].entries()) {
    await tap('nav a[href="#suche"]');
    // Change the real WebView's language control; no fake bridge or HTTP reply.
    await evaluate(`document.querySelector('#ui-language').value=${JSON.stringify(language)};document.querySelector('#ui-language').dispatchEvent(new Event('change',{bubbles:true}));`);
    await tap('#search-query');
    await send('Input.insertText',{text:wishes[index]});
    await tap('.primary-search');
    await wait(`document.querySelector('#web-results').textContent.includes(${JSON.stringify(language==='en'?'not connected':'noch nicht verbunden')})`);
    assert(await evaluate("!document.querySelector('#web-results article a')"),'no invented live result or purchase link');
    await tap('#results button');
    await wait(`document.querySelector('#results button').textContent===${JSON.stringify(language==='en'?'Search saved':'Suche gespeichert')}`);
    await tap('nav a[href="#watchlist"]');
    await wait(`Array.from(document.querySelectorAll('#saved .surface h2')).some(node=>node.textContent===${JSON.stringify(wishes[index])})`);
    console.log('Android '+language+': typed search, actual unconfigured-service error, save and Watchlist passed.');
    // Clear the existing textarea through normal input events before next wish.
    await tap('nav a[href="#suche"]');await evaluate("document.querySelector('#search-query').value='';document.querySelector('#search-query').dispatchEvent(new Event('input',{bubbles:true}));");
  }
}
