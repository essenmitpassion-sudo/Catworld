import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createTryUdi} from './try-udi.mjs';
import {androidControls} from './native-flow-android.mjs';

const wish='Samsung 990 PRO 2 TB';
const scenarios=[
  {language:'de',width:320,height:720,checked:'Unvollständig / Schätzung',saved:'Suche gespeichert',
    cancelled:'Die Suche wurde abgebrochen',timedOut:'Die Suche dauert zu lange',noOffer:'Keine passenden aktuellen Angebote',
    invalid:'Die Antwort konnte nicht sicher geprüft werden',failure:'Die Websuche ist vorübergehend nicht erreichbar'},
  {language:'en',width:390,height:820,checked:'Incomplete / estimate',saved:'Search saved',
    cancelled:'The search was cancelled',timedOut:'The search is taking too long',noOffer:'No matching current offers',
    invalid:'The response could not be checked safely',failure:'Web search is temporarily unavailable'},
];

export async function checkPersonalTest({send,evaluate,until,pointerClick,type,noOverflow}) {
  for(const scenario of scenarios) {
    const {language,width,height}=scenario;
    const app=createTryUdi();
    try {
      const {port}=await app.listen(0);
      const origin='http://127.0.0.1:'+port;
      await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});
      await send('Page.navigate',{url:origin});
      const has=(selector,text)=>evaluate('document.querySelector('+JSON.stringify(selector)+')?.textContent.includes('+JSON.stringify(text)+')');
      const results=text=>until(()=>has('#web-results',text),text);
      const capture=async name=>{
        const output=process.env.UDI_SCREENSHOT_DIR;
        if(!output)return;
        await mkdir(output,{recursive:true});
        const png=await send('Page.captureScreenshot',{format:'png'});
        await writeFile(join(output,language+'-'+name+'.png'),Buffer.from(png.data,'base64'));
      };
      await until(()=>evaluate("document.documentElement.dataset.platform==='web' && !document.querySelector('#pilot-account').hidden"),'local fixture ready');
      assert(await evaluate("!document.querySelector('#native-fixture-notice').hidden && document.querySelector('.composer-tools').hidden"));
      if(language==='en') {
        await pointerClick('.native-settings summary');
        await pointerClick('[data-language-value=en]');
      }
      await noOverflow();
      await capture('start');
      await pointerClick('.primary-search');
      assert.equal(await evaluate("document.querySelector('#pilot-sign-in').open"),false,'empty search never signs in or requests offers');
      await pointerClick('.suggestions [data-example]');
      await pointerClick('.primary-search');
      await until(()=>evaluate("document.querySelector('#pilot-sign-in').open"),'local sign-in opens');
      await type('plus@udi.test');
      await pointerClick('[data-pilot-email] [type=submit]');
      await until(()=>evaluate("!document.querySelector('[data-pilot-code]').hidden"),'test code ready');
      await type('123456');
      await pointerClick('[data-pilot-code] [type=submit]');
      await until(()=>evaluate("!document.querySelector('#pilot-sign-in').open"),'test session ready');
      assert.equal(await evaluate("document.querySelector('#search-query').value"),wish);
      await pointerClick('.primary-search');
      await results(scenario.checked);
      assert(await has('#web-results .offer-receipt',language==='de'?'Endpreis noch offen':'Final price still unknown'));
      assert(await evaluate("(()=>{const price=document.querySelector('#web-results .offer-price').getBoundingClientRect(),main=document.querySelector('main').getBoundingClientRect();return price.top>=main.top && price.bottom<=main.bottom})()"),'first price is visible in the initial result viewport');
      assert(await evaluate("document.querySelector('#web-results .offer-price').textContent.includes('99.00')"));
      assert.equal(await evaluate("document.querySelectorAll('#web-results a, #results a[href*=vergleich]').length"),0);
      await noOverflow();
      await capture('result');
      assert.equal(await evaluate("document.activeElement.id"),'search-outcome-title','replies keep focus on the stable outcome heading');
      await pointerClick('#outcome-edit');
      assert.equal(await evaluate("document.activeElement.id"),'search-query');
      assert.equal(await evaluate("document.querySelector('#search-query').value"),wish);
      await pointerClick('#web-results .offer summary');
      assert(await evaluate("document.querySelector('#web-results .offer details').open"));
      assert(await has('#web-results .offer details',language==='de'?'Versand':'Shipping'));
      await pointerClick('#web-results .offer summary');
      await evaluate("document.documentElement.style.fontSize='200%'");
      await noOverflow();
      await evaluate("document.documentElement.style.fontSize=''");
      await pointerClick('#results button.text-button');
      await until(()=>has('#results button.text-button',scenario.saved),'confirmed test save');

      async function search(text,{touch=false}={}) {
        await evaluate('(()=>{const field=document.querySelector("#search-query");field.value='+JSON.stringify(text)+';field.dispatchEvent(new Event("input",{bubbles:true}));})()');
        if(touch) await androidControls({send,evaluate}).tap('.primary-search',{touch:true});
        else await pointerClick('.primary-search');
      }
      await search('UDI fixture timeout');
      await until(()=>evaluate("Boolean(document.querySelector('[data-cancel-search]'))"),'cancel available while loading');
      await pointerClick('[data-cancel-search]');
      await results(scenario.cancelled);
      await search('UDI fixture timeout',{touch:true});
      await results(scenario.timedOut);
      await search('UDI fixture invalid');
      await results(scenario.invalid);
      await search('UDI fixture unavailable');
      await results(scenario.failure);
      await capture('error');
      await search(wish+' confirmed');
      await until(()=>has('#web-results .offer-price','104.00'),'confirmed fixture amount');
      assert(await has('#web-results .offer-receipt',language==='de'?'Endpreis bestätigt':'Final price confirmed'));
      assert(await has('#web-results .offer-cost .price-caption','8000'));
      assert(await has('#web-results .fixture-price-note',language==='de'?'TESTDATEN':'TEST DATA'));
      assert.equal(await evaluate("document.querySelectorAll('#web-results a').length"),0);
      await search('Réparation mystérieuse 🛰️');
      await results(scenario.noOffer);
      assert.equal(await evaluate("document.querySelectorAll('#web-results article').length"),0);
      await pointerClick('nav a[href="#watchlist"]');
      await until(()=>has('#saved',wish),'protected saved wish visible');
      await send('Page.reload');
      await until(()=>has('#saved',wish),'test session and saved wish restored');
      await capture('saved');
      await pointerClick('nav a[href="#suche"]');
      await noOverflow();
      assert(await evaluate("performance.getEntriesByType('resource').every(entry=>new URL(entry.name).origin===location.origin)"));
      console.log('Personal fixture UI passed '+language+' at '+width+'px through the real loopback service');
    } finally {
      await app.close();
    }
  }
}
