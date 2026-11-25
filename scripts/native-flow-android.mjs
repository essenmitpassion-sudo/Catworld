import assert from 'node:assert/strict';
import {setTimeout as delay} from 'node:timers/promises';
const wishes=['Samsung 990 PRO 2 TB','Samsung 990 PRO 2 TB bis CHF 500'];
export async function androidFlow({send,evaluate},afterRestart) {
  // Only synthetic CI wishes enter this bounded diagnostic trace.
  await evaluate("window.udiQATrace=[];for(const type of ['input','change','click','submit'])document.addEventListener(type,e=>{window.udiQATrace.push({type,target:e.target.id||e.target.className,query:document.querySelector('#search-query').value});window.udiQATrace=window.udiQATrace.slice(-20)},true)");
  const wait=async expression=>{
    const until=Date.now()+10000;do {if(await evaluate(expression))return;await delay(100);}while(Date.now()<until);
    const state=await evaluate("JSON.stringify({query:document.querySelector('#search-query').value,saved:localStorage.getItem('udi.searches.v2'),headings:Array.from(document.querySelectorAll('#saved .surface h2')).map(n=>n.textContent),notice:document.querySelector('#notice').textContent,trace:window.udiQATrace})");
    throw new Error('Native Android UI condition failed: '+expression+'; QA state: '+state);
  };
  const tap=async selector=>{
    await evaluate(`document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({block:'center',behavior:'instant'})`);
    // The real IME resizes/pans the WebView after focus. A point sampled during
    // that transition can hit the textarea even though the button was visible.
    let previous='',stableSince=Date.now(),point;const deadline=Date.now()+4000;
    do {
      const box=await evaluate(`(()=>{const n=document.querySelector(${JSON.stringify(selector)});n?.scrollIntoView({block:'center',behavior:'instant'});const r=n?.getBoundingClientRect(),v=visualViewport,x=r?.left+r?.width/2,y=r?.top+r?.height/2,hit=document.elementFromPoint(x,y);return r?{x,y,width:r.width,height:r.height,visible:n===hit||n.contains(hit),viewport:[innerWidth,innerHeight,v?.height,v?.offsetTop,v?.offsetLeft]}:null;})()`);
      assert(box,'Missing native UI action: '+selector);
      const signature=JSON.stringify(box);if(signature!==previous||!box.visible){previous=signature;stableSince=Date.now();}
      point={x:box.x,y:box.y};
      if(Date.now()-stableSince>=500)break;
      await delay(100);
    }while(Date.now()<deadline);
    assert(Date.now()-stableSince>=500,'Native layout did not settle: '+selector);
    assert(point,'Missing native UI action: '+selector);
    assert(await evaluate(`(()=>{const n=document.querySelector(${JSON.stringify(selector)}),hit=document.elementFromPoint(${point.x},${point.y});return n===hit||n?.contains(hit);})()`),'Native UI action obscured');
    await evaluate(`window.udiQATap=null;document.addEventListener('click',e=>{const n=document.querySelector(${JSON.stringify(selector)});window.udiQATap=n===e.target||n?.contains(e.target);},{capture:true,once:true})`);
    await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});
    await wait('window.udiQATap!==null');assert.equal(await evaluate('window.udiQATap'),true,'Native click must reach '+selector);
  };
  if(afterRestart) {
    assert.equal(await evaluate("localStorage.getItem('udi.language.v1')"),'de','native language persists');
    await tap('nav a[href="#watchlist"]');
    for(const wish of wishes)await wait(`Array.from(document.querySelectorAll('#saved .surface h2')).some(node=>node.textContent===${JSON.stringify(wish)})`);
    const record=await evaluate("Capacitor.Plugins.Preferences.get({key:'udi.searches.native.v1'}).then(({value})=>JSON.parse(value))");
    const rows=JSON.parse(record.values['udi.searches.v2']);
    assert.deepEqual(rows.map(row=>row.query).sort(),[...wishes].sort(),'both distinct native requests survived');
    assert(rows.every(row=>row.schemaVersion===2&&row.marketId==='CH'&&row.deliveryCountry==='CH'&&row.currency==='CHF'));
    console.log('Android: saved searches and CH context survived force-stop/relaunch; German selection preserved.');return;
  }
  assert(await evaluate("typeof Capacitor.Plugins.NativeSpeech?.recognize==='function'"),'Native speech bridge is registered');
  await tap('[data-mic]');
  await wait("!document.querySelector('[data-native-voice-options]').hidden && document.querySelector('[data-mic]').getAttribute('aria-pressed')==='false'");
  await tap('[data-native-voice-cancel]');
  console.log('Android: microphone explanation can open and close before requesting permission.');
  for(const [index,language] of ['en','de'].entries()) {
    await tap('nav a[href="#suche"]');
    // Tap the visible language action in the installed app.
    await tap('.native-settings summary');
    await tap(`[data-language-value="${language}"]`);
    assert.equal(await evaluate("document.documentElement.lang"),language==='de'?'de-CH':'en');
    await tap('#search-query');
    await send('Input.insertText',{text:wishes[index]});
    assert.equal(await evaluate("document.querySelector('#search-query').value"),wishes[index],'native input must contain the exact new wish');
    await tap('.primary-search');
    await wait("document.querySelector('#results button')?.disabled===false");
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
