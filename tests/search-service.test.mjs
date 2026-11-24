// Local HTTP and authentication fixtures only; no deployment, real token or seller call.
import test from 'node:test';
import assert from 'node:assert/strict';
import {request as httpRequest} from 'node:http';
import {setTimeout as delay} from 'node:timers/promises';
import {createSearchService} from '../scripts/search-service.mjs';
import {createDealClient} from '../src/deal-client.mjs';
import {criteriaFor} from '../src/criteria.mjs';

const token='unit-test-user',input={query:'Samsung 990 PRO 2 TB',marketId:'CH',deliveryCountry:'CH',currency:'CHF'};
const requestId='a'.repeat(32),body=JSON.stringify({schemaVersion:1,requestId,...input});
const headers={'Content-Type':'application/json',Accept:'application/vnd.udi.deals.v1+json',Authorization:'Bearer '+token,Origin:'capacitor://localhost'};
const empty=input=>({kind:'results',...input,criteria:criteriaFor(input),items:[],completedAt:new Date().toISOString()});
async function running(t,options={}) {
  const server=createSearchService({authenticate:async credential=>credential===token?'unit-user':null,search:async input=>empty(input),...options});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections();}));
  const url='http://127.0.0.1:'+server.address().port+'/api/v1/search';
  return {url,send:(change={})=>fetch(url,{method:'POST',headers,body,...change})};
}

test('nicht konfigurierter Dienst und falsche Grenzen lösen keine Suche aus',async t=>{
  const disabled=await running(t,{authenticate:undefined});
  assert.equal((await disabled.send()).status,503);
  let searches=0;const {url,send}=await running(t,{search:async()=>{searches++;throw new Error('must not search');}});
  for(const [change,status] of [[{headers:{...headers,Authorization:''}},401],[{headers:{...headers,Origin:'https://evil.test'}},403],
    [{headers:{...headers,Cookie:'other-session=secret'}},403],[{method:'GET',body:undefined},405],
    [{headers:{...headers,'Content-Type':'text/plain'}},415],[{headers:{...headers,Authorization:'Bearer invalid'}},401]])assert.equal((await send(change)).status,status);
  assert.equal((await fetch(url+'?token=hidden')).status,404);assert.equal(searches,0);
  const preflight=await send({method:'OPTIONS',body:undefined,headers:{Origin:'https://localhost','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'authorization,content-type,accept'}});
  assert.equal(preflight.status,204);assert.equal(preflight.headers.get('Access-Control-Allow-Origin'),'https://localhost');
  assert.equal(preflight.headers.get('Access-Control-Allow-Credentials'),null);
});

test('echter HTTP-Vertrag erreicht den unveränderten Client für beide nativen Origins ohne gemeinsame Suchdaten',async t=>{
  const received=[];const {url}=await running(t,{search:async(search,context)=>{received.push({search,...context});return empty(search);}});
  for(const origin of ['https://localhost','capacitor://localhost']) {
    const client=createDealClient({endpoint:'https://udi.example.com/api/v1/search',approvedOrigin:'https://udi.example.com',getAccessToken:async()=>token,
      makeRequestId:()=>requestId,fetchImpl:(_approved,options)=>fetch(url,{...options,headers:{...options.headers,Origin:origin}})});
    const result=await client.search(input);assert.equal(result.kind,'results');assert.deepEqual(result.items,[]);
    assert.equal(result.testData,undefined,'empty response is not fabricated offer evidence');
  }
  assert.equal(received.length,2);assert(received.every(row=>row.subject==='unit-user'&&row.requestId===requestId&&row.signal instanceof AbortSignal));
  const response=await fetch(url,{method:'POST',headers,body});
  assert.equal(response.headers.get('Cache-Control'),'no-store');assert.equal(response.headers.get('Access-Control-Allow-Origin'),'capacitor://localhost');
  assert(!(await response.text()).includes('unit-user'));
});

test('ungültige oder zu grosse JSON-Anfragen werden vor der Quellenarbeit abgewiesen',async t=>{
  let searches=0;const {send}=await running(t,{search:async()=>{searches++;throw new Error('must not search');}});
  for(const bad of ['{',JSON.stringify({schemaVersion:1,requestId,...input,subject:'another-user'}),JSON.stringify({schemaVersion:1,requestId,...input,marketId:'DE'})])assert.equal((await send({body:bad})).status,400);
  assert.equal((await send({body:'ü'.repeat(1100)})).status,413,'limit measures bytes, not characters');
  assert.equal((await send({body:Buffer.from([0xff])})).status,400,'invalid UTF8 is not repaired');
  assert.equal(searches,0);
});

test('persönliche Quote begrenzt auch bekannte Katalogwünsche und getrennte Nutzer teilen keine Quote',async t=>{
  const {send}=await running(t,{authenticate:async value=>value==='other-test-user'?'other-user':'unit-user'});
  for(let i=0;i<10;i++)assert.equal((await send()).status,200);
  const limited=await send();assert.equal(limited.status,429);assert(Number(limited.headers.get('Retry-After'))>0);
  assert.equal((await send({headers:{...headers,Authorization:'Bearer other-test-user'}})).status,200);
});

test('Zeitlimit bricht ab; ignorierte Abbrüche geben keine unbegrenzte neue Arbeit frei',async t=>{
  let resolveWork,ready,signal,started=0;const pending=new Promise(resolve=>{resolveWork=resolve;}),entered=new Promise(resolve=>{ready=resolve;});
  const {send}=await running(t,{timeoutMs:150,search:async(_,context)=>{started++;signal=context.signal;ready();return pending;}});
  const first=send();await entered;
  const duplicate=await send();assert.equal(duplicate.status,429,'same user has only one active scan');
  assert.equal((await first).status,504);assert(signal.aborted);
  assert.equal((await send()).status,429,'underlying work has not actually finished');assert.equal(started,1);
  resolveWork(empty(input));await delay(10);assert.equal((await send()).status,200);
});

test('globale Parallelitätsgrenze gilt bereits während der Anmeldung und langsame Uploads laufen ab',async t=>{
  let enter,resolveAuth;const pending=new Promise(resolve=>{resolveAuth=resolve;}),entered=new Promise(resolve=>{enter=resolve;});
  let authentications=0;
  const {send}=await running(t,{timeoutMs:150,authenticate:async()=>{authentications++;if(authentications===2)enter();return pending;}});
  const first=send(),second=send();await entered;
  assert.equal((await send()).status,429);assert.equal(authentications,2);
  assert.equal((await first).status,504);assert.equal((await second).status,504);
  assert.equal((await send()).status,429,'unsettled authentication still consumes both slots');resolveAuth(null);await delay(10);
  const {url}=await running(t,{timeoutMs:80});
  const response=await new Promise((resolve,reject)=>{
    const upload=httpRequest(url,{method:'POST',headers},response=>{response.resume();resolve(response.statusCode);});
    upload.on('error',reject);upload.write('{'); // Deliberately never end this test-owned upload.
    t.after(()=>upload.destroy());
  });
  assert.equal(response,504);
});

test('fehlgeschlagene Anmeldung und falsche Scanantworten geben keine internen Informationen preis',async t=>{
  for(const options of [{authenticate:async()=>{throw new Error('private-provider-token');}},
    {authenticate:async()=>({subject:'forged-object'})},{search:async()=>({...empty(input),marketId:'DE'})},
    {search:async()=>({...empty(input),testData:true})}]) {
    const {send}=await running(t,options);const response=await send();assert(response.status>=400);
    const text=await response.text();assert(!text.includes('private-provider-token')&&!text.includes('forged-object'));
  }
});
