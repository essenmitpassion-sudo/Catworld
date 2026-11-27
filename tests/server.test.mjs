import test from 'node:test';
import assert from 'node:assert/strict';
import { server } from '../scripts/serve.mjs';

test('ein bekannter Produktauftrag verwendet auch bei eingerichtetem KI-Zugang die direkte Quellenprüfung', async () => {
  let modelCalls = 0;
  const app = server({
    webSearch: async () => { modelCalls++; return []; },
    verify: async item => ({
      marketId:item.marketId,sourceId:item.sourceId,
      url: item.url, checkedAt: new Date().toISOString(), httpStatus: 200, mpn: item.mpn,
      status: 'partial', availability: 'active', price: 43900, total: null, currency: 'CHF',
    }),
  });
  await new Promise((resolve, reject) => {
    app.once('error', reject);
    app.listen(0, '127.0.0.1', resolve);
  });
  try {
    const origin = 'http://127.0.0.1:' + app.address().port;
    const response = await fetch(origin + '/api/discovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: origin, 'Sec-Fetch-Site': 'same-origin' },
      body: JSON.stringify({ query: 'Samsung 990 PRO 2 TB bis CHF 500' }),
    });
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.sourceMode, 'catalog');
    assert(result.items.some(item => item.source === 'DQ Solutions'));
    assert(result.items.every(item => item.check.total === null));
    assert.equal(modelCalls, 0);
    const rejected=await fetch(origin+'/api/discovery',{
      method:'POST',headers:{'Content-Type':'application/json',Origin:origin,'Sec-Fetch-Site':'same-origin'},
      body:JSON.stringify({query:'SSD',marketId:'DE'}),
    });
    assert.equal(rejected.status,400);assert.equal(modelCalls,0,'foreign market never reaches configured model');
    assert.equal(result.marketId,'CH');assert.equal(result.deliveryCountry,'CH');assert.equal(result.currency,'CHF');
  } finally {
    await new Promise(resolve => app.close(resolve));
  }
});

test('Installationsdateien werden nur aus der festen Liste geliefert und behalten Sicherheitsheader', async () => {
  const app=server();await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));
  try {
    const origin='http://127.0.0.1:'+app.address().port;
    // Build is deliberately not required before the ordinary source tests.
    for(const path of ['/manifest.webmanifest','/assets/udi-192.png']) {
      const result=await fetch(origin+path);
      assert([200,503].includes(result.status));
      if(result.status===200)assert(result.headers.get('content-type').includes(path.endsWith('.png')?'image/png':'application/manifest+json'));
      assert.equal(result.headers.get('cache-control'),result.status===200?'no-store':null);
      assert(result.headers.get('content-security-policy').includes("manifest-src 'self'"));
    }
    assert.equal((await fetch(origin+'/package-lock.json')).status,404);
    assert.equal((await fetch(origin+'/.env')).status,404);
  } finally {await new Promise(resolve=>app.close(resolve));}
});

test('a discarded local search tells the provider to stop before another attempt', {timeout:3000}, async () => {
  const started=Promise.withResolvers();
  const stopped=Promise.withResolvers();
  const app=server({webSearch:async (_request,{signal})=>{
    started.resolve();
    await new Promise(resolve=>signal.addEventListener('abort',resolve,{once:true}));
    stopped.resolve();
    return [];
  }});
  await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));
  const controller=new AbortController();
  try {
    const origin='http://127.0.0.1:'+app.address().port;
    const request=fetch(origin+'/api/discovery',{
      method:'POST',headers:{'Content-Type':'application/json',Origin:origin,'Sec-Fetch-Site':'same-origin'},
      body:JSON.stringify({query:'Mechanische Tastatur mit ISO-CH Layout'}),
      signal:controller.signal,
    });
    const cancelled=assert.rejects(request,{name:'AbortError'});
    await started.promise;
    controller.abort();
    await Promise.all([cancelled,stopped.promise]);
  } finally {
    controller.abort();
    app.closeAllConnections();
    await new Promise(resolve=>app.close(resolve));
  }
});
