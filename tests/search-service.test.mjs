// Local HTTP and authentication fixtures only; no deployment, real token or seller call.
import test from 'node:test';
import assert from 'node:assert/strict';
import {request as httpRequest} from 'node:http';
import {setTimeout as delay} from 'node:timers/promises';
import {createSearchService} from '../scripts/search-service.mjs';
import {createDealClient} from '../src/deal-client.mjs';
import {criteriaFor} from '../src/criteria.mjs';
import {createAccountQuota,utcMonthlyEntitlement} from '../scripts/account-quota.mjs';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createDailyUpdates,createDailyUpdateHandler} from '../scripts/daily-updates.mjs';

const token='unit-test-user',input={query:'Samsung 990 PRO 2 TB',marketId:'CH',deliveryCountry:'CH',currency:'CHF'};
const requestId='a'.repeat(32),body=JSON.stringify({schemaVersion:1,requestId,...input});
const headers={'Content-Type':'application/json',Accept:'application/vnd.udi.deals.v1+json',Authorization:'Bearer '+token,Origin:'capacitor://localhost'};
const empty=input=>({kind:'results',...input,criteria:criteriaFor(input),items:[],completedAt:new Date().toISOString()});
async function running(t,options={}) {
  const server=createSearchService({mode:'pilot',authenticate:async credential=>credential===token?'unit-user':null,search:async input=>empty(input),...options});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections();}));
  const url='http://127.0.0.1:'+server.address().port+'/api/v1/search';
  return {url,send:(change={})=>fetch(url,{method:'POST',headers,body,...change})};
}

test('Produktionsstandard führt ohne dauerhafte Kontoquote keine Suche aus',async t=>{
  let searches=0;
  const {send}=await running(t,{mode:undefined,search:async input=>{searches++;return empty(input);}});
  assert.equal((await send()).status,503);
  assert.equal(searches,0);
});

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

async function metered(t,options={}) {
  const directory=await mkdtemp(join(tmpdir(),'udi-service-quota-'));
  const quota=createAccountQuota({databasePath:join(directory,'accounts.sqlite')});
  // Close the HTTP server before its ledger, then remove only this test's directory.
  const service=await running(t,{mode:'production',quota,resolveEntitlement:async()=>utcMonthlyEntitlement(1),...options});
  t.after(async()=>{quota.close();await rm(directory,{recursive:true,force:true});});
  return service;
}
const withId=(letter,extra={})=>JSON.stringify({schemaVersion:1,requestId:letter.repeat(32),...input,...extra});

test('Monatsquote zählt erfolgreiche Suchen einmal; identische Wiederholung gibt dieselbe Antwort ohne Quellenarbeit',async t=>{
  let searches=0;
  const {send}=await metered(t,{search:async input=>{searches++;return empty(input);}});
  const first=await send();assert.equal(first.status,200);const reply=await first.json();
  const repeated=await send();assert.equal(repeated.status,200);assert.deepEqual(await repeated.json(),reply);assert.equal(searches,1);
  assert.equal((await send({body:withId('a',{query:'different'})})).status,409);
  const exhausted=await send({body:withId('b')});assert.equal(exhausted.status,429);
  assert.equal(exhausted.headers.get('X-UDI-Limit'),'monthly');
  assert(Number(exhausted.headers.get('Retry-After'))>60);
  assert(exhausted.headers.get('Access-Control-Expose-Headers').includes('X-UDI-Limit'));
  assert.equal(searches,1);
});

test('Rückfragen, Testdaten und beendete Fehler verbrauchen keinen erfolgreichen Monatsplatz',async t=>{
  let work=0;
  const {send}=await metered(t,{search:async input=>{
    work++;
    if(work===1)return {kind:'clarification',...input,criteria:criteriaFor(input)};
    if(work===2)throw new Error('private upstream error');
    if(work===3)return {...empty(input),testData:true};
    return empty(input);
  }});
  assert.equal((await send()).status,200);
  assert.equal((await send({body:withId('b')})).status,502);
  assert.equal((await send({body:withId('c')})).status,502);
  assert.equal((await send({body:withId('d')})).status,200);
  assert.equal((await send({body:withId('e')})).status,429);
  assert.equal(work,4);
});

test('fehlende oder veraltete serverseitige Berechtigung sperrt vor der Suche',async t=>{
  let searches=0;
  for(const resolveEntitlement of [async()=>null,async()=>({period:'2000-01',limit:100}),async()=>{throw new Error('private entitlement failure');}]) {
    const {send}=await metered(t,{resolveEntitlement,search:async input=>{searches++;return empty(input);}});
    assert.equal((await send()).status,503);
  }
  assert.equal(searches,0);
});

test('zwei Dienstinstanzen reservieren gemeinsam; Zeitüberschreitung gibt keinen laufenden Platz frei',async t=>{
  const directory=await mkdtemp(join(tmpdir(),'udi-service-shared-')),databasePath=join(directory,'accounts.sqlite');
  const firstQuota=createAccountQuota({databasePath}),secondQuota=createAccountQuota({databasePath});
  let entered,finish,work=0;
  const started=new Promise(resolve=>{entered=resolve;}),pending=new Promise(resolve=>{finish=resolve;});
  const config={mode:'production',timeoutMs:100,resolveEntitlement:async()=>utcMonthlyEntitlement(1)};
  const first=await running(t,{...config,quota:firstQuota,search:async()=>{work++;entered();return pending;}});
  const second=await running(t,{...config,quota:secondQuota,search:async input=>{work++;return empty(input);}});
  t.after(async()=>{firstQuota.close();secondQuota.close();await rm(directory,{recursive:true,force:true});});
  const outstanding=first.send();await started;
  const limited=await second.send({body:withId('b')});assert.equal(limited.status,429);assert.equal(limited.headers.get('X-UDI-Limit'),'monthly');
  assert.equal((await outstanding).status,504);
  assert.equal((await second.send({body:withId('b')})).status,429,'unsettled work keeps reservation');
  finish(empty(input));await delay(10);
  assert.equal((await second.send({body:withId('b')})).status,200,'settled cancelled work is refunded');
  assert.equal(work,2);
});

test('optionaler Tagespräferenz-Dienst wird ohne Suchaufruf separat authentifiziert',async t=>{
  const store=createDailyUpdates();
  const dailyUpdates=createDailyUpdateHandler({store,authenticate:async credential=>credential===token?'unit-user':null});
  const {url}=await running(t,{dailyUpdates});t.after(()=>store.close());
  const endpoint=url.replace('/search','/preferences/daily-update');
  const response=await fetch(endpoint,{method:'PUT',headers,body:JSON.stringify({enabled:true})});
  assert.equal(response.status,200);assert.equal((await response.json()).enabled,true);
  assert.equal(store.getPreference('unit-user').enabled,true);
  assert.equal((await fetch(endpoint+'?account=other',{method:'GET',headers})).status,404);
});
