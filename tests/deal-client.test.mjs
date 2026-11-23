// Synthetic contract responses only. No retailer/service request is made.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createDealClient} from '../src/deal-client.mjs';

const endpoint='https://udi.example.com/api/v1/search';
const origin='https://udi.example.com';
const token='synthetic-test-user-token-not-a-production-secret';
const now=Date.parse('2026-11-20T18:00:00Z');
const input={query:'Samsung 990 PRO 2 TB',marketId:'CH',deliveryCountry:'CH',currency:'CHF'};
const url='https://www.dq-solutions.ch/de/samsung-2-tb-ssd-990-pro-nvme-m-2-ssd-m-2-hs2011';
const requestId='a'.repeat(32);
function payload() {return {schemaVersion:1,requestId,dataMode:'test',kind:'results',marketId:'CH',deliveryCountry:'CH',currency:'CHF',
  completedAt:new Date(now).toISOString(),criteria:{maxTotal:null,condition:'any',completeCostsOnly:false},sourceMode:'catalog',
  items:[{title:'TESTDATEN – keine Kaufempfehlung',url,source:'DQ Solutions',sourceId:'dq-solutions.ch',marketId:'CH',type:'shop',status:'partial',mpn:'MZ-V9P2T0BW',
    expiresAt:new Date(now+300000).toISOString(),check:{url,marketId:'CH',sourceId:'dq-solutions.ch',status:'http-200',productMatch:true,availability:'active',
      checkedAt:new Date(now).toISOString(),mpn:'MZ-V9P2T0BW',seller:'DQ Solutions',condition:'Neu',currency:'CHF',price:10000,shipping:null,taxes:0,imports:0,fees:0,
      deliveryDestination:null,total:null,minimum:10000,missing:['shipping']}}]};}
const response=data=>new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json'}});
function client(fetchImpl,extra={}) {return createDealClient({endpoint,approvedOrigin:origin,getAccessToken:async()=>token,fetchImpl,now:()=>now,makeRequestId:()=>requestId,allowTestData:true,...extra});}

test('ohne freigegebenen Dienst oder gültigen Suchkontext kein Token-/Netzwerkaufruf',async()=>{
  let calls=0;const fail=()=>{calls++;throw new Error('must not call');};
  assert.equal((await createDealClient({getAccessToken:fail,fetchImpl:fail}).search(input)).kind,'native-unavailable');
  assert.equal((await client(fail,{getAccessToken:fail}).search({...input,marketId:'DE'})).kind,'invalid');assert.equal(calls,0);
  for(const bad of ['http://udi.example.com/api/v1/search','https://127.0.0.1/api/v1/search',endpoint+'?key=secret','https://other.example.com/api/v1/search']) {
    assert.equal((await client(fail,{endpoint:bad,getAccessToken:fail}).search(input)).kind,'configuration-error');
  }assert.equal(calls,0);
});
test('gemeinsamer Client sendet nur Kriterien und kurzlebige Authentifizierung ohne Cookies/Umleitung',async()=>{
  let calls=0;
  const result=await client(async(address,options)=>{
    calls++;assert.equal(address,endpoint);assert.equal(options.redirect,'error');assert.equal(options.credentials,'omit');assert.equal(options.cache,'no-store');
    assert.equal(options.headers.Authorization,'Bearer '+token);assert(!options.body.includes(token));
    assert.deepEqual(JSON.parse(options.body),{...input,schemaVersion:1,requestId});return response(payload());
  }).search(input);
  assert.equal(calls,1);assert.equal(result.kind,'results');assert.equal(result.testData,true);
  assert.equal(result.items[0].check.total,null);assert.equal(result.items[0].check.shipping,null);
});
test('Testantworten können nicht als Live-Daten durch den normalen App-Client gelangen',async()=>{
  assert.equal((await client(async()=>response(payload()),{allowTestData:false}).search(input)).kind,'invalid-response');
});
test('fehlende/abgelaufene Rechte, Quoten und Dienstfehler werden ohne Wiederholung unterschieden',async()=>{
  let calls=0;assert.equal((await client(async()=>{calls++;},{getAccessToken:async()=>null}).search(input)).kind,'authentication-required');assert.equal(calls,0);
  for(const [status,kind] of [[401,'authentication-expired'],[403,'access-denied'],[429,'busy'],[503,'unavailable'],[504,'timeout']]){
    let count=0;const result=await client(async()=>{count++;return new Response('no secret details',{status});}).search(input);
    assert.equal(result.kind,kind);assert.equal(count,1);assert(!JSON.stringify(result).includes('secret'));
  }
});
test('ungültige Herkunft, Identität, Gebühren und Antworten werden vor der Darstellung abgewiesen',async()=>{
  const mutations=[p=>p.requestId='wrong-request',p=>p.schemaVersion=2,p=>p.marketId='DE',p=>p.items[0].url='https://evil.example/item',p=>p.items[0].check.url=url+'?other=seller',
    p=>p.items[0].check.sourceId='ricardo.ch',p=>p.items[0].check.mpn='WRONG',p=>p.items[0].check.total=10000,
    p=>p.items[0].check.shipping=-1,p=>p.items[0].check.checkedAt=new Date(now+60000).toISOString(),p=>p.items[0].expiresAt=new Date(now+600000).toISOString(),
    p=>p.criteria.condition='used',p=>p.items[0].check.availability='sold'];
  for(const mutate of mutations){const data=payload();mutate(data);assert.equal((await client(async()=>response(data)).search(input)).kind,'invalid-response');}
  for(const reply of [()=>new Response('<html>login</html>',{headers:{'Content-Type':'text/html'}}),()=>new Response('{',{headers:{'Content-Type':'application/json'}}),
    ()=>new Response(' '.repeat(70000),{headers:{'Content-Type':'application/json'}})])assert.equal((await client(async()=>reply()).search(input)).kind,'invalid-response');
});
test('leere Ergebnisse bleiben leer; abgelaufene und doppelte Angebote bleiben nicht aktiv',async()=>{
  let p=payload();p.items=[];assert.deepEqual((await client(async()=>response(p)).search(input)).items,[]);
  p.unconfirmed=2;assert.equal((await client(async()=>response(p)).search(input)).unconfirmed,2);
  p=payload();p.items.push(structuredClone(p.items[0]));assert.equal((await client(async()=>response(p)).search(input)).items.length,1);
  p=payload();p.items[0].check.checkedAt=new Date(now-300001).toISOString();p.items[0].expiresAt=new Date(now-1).toISOString();
  assert.equal((await client(async()=>response(p)).search(input)).kind,'expired');
});
test('Zeitlimit gilt auch für hängende Tokenlieferanten; verspätete Tokens lösen keinen Abruf aus',async()=>{
  let finish,calls=0;const pending=new Promise(resolve=>{finish=resolve;});
  const result=await client(async()=>{calls++;return response(payload());},{getAccessToken:()=>pending,timeoutMs:20}).search(input);
  assert.equal(result.kind,'timeout');finish(token);await new Promise(resolve=>setTimeout(resolve,5));assert.equal(calls,0);
});
test('Abbruch und Netzwerkausfall bleiben unterscheidbar; keine fremden Fehlertexte gelangen zur App',async()=>{
  const controller=new AbortController();controller.abort();let calls=0;
  assert.equal((await client(async()=>{calls++;}).search(input,{signal:controller.signal})).kind,'cancelled');assert.equal(calls,0);
  for(const [online,kind] of [[false,'offline'],[true,'network-error']]) {
    const result=await client(async()=>{throw new Error('private-token');},{isOnline:()=>online}).search(input);
    assert.equal(result.kind,kind);assert(!JSON.stringify(result).includes('private-token'));
  }
});
test('Fehlerantworten geben ihren Body frei, und ein stillstehender Antwortstream unterliegt dem Zeitlimit',async()=>{
  let cancelled=0;
  const forbidden=client(async()=>new Response(new ReadableStream({cancel(){cancelled++;}}),{status:401}));
  assert.equal((await forbidden.search(input)).kind,'authentication-expired');assert.equal(cancelled,1);
  const stalled=client(async()=>new Response(new ReadableStream({pull(){return new Promise(()=>{});},cancel(){cancelled++;}}),{headers:{'Content-Type':'application/json'}}),{timeoutMs:20});
  assert.equal((await stalled.search(input)).kind,'timeout');await new Promise(resolve=>setTimeout(resolve,1));assert.equal(cancelled,2);
});
test('zueinander passende falsche MPNs widersprechen weiterhin Anfrage oder bekannter Katalogvariante',async()=>{
  for(const query of [input.query,'SSD MZ-V9P2T0BW']) {
    const data=payload();data.items[0].mpn=data.items[0].check.mpn='MZ-V9P1T0BW';
    assert.equal((await client(async()=>response(data)).search({...input,query})).kind,'invalid-response');
  }
});
