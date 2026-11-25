import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Worker} from 'node:worker_threads';
import {catalog} from '../src/deals.mjs';
import {createDailyUpdates,createDailyUpdateHandler} from '../scripts/daily-updates.mjs';

const createStore=createDailyUpdates;
const now=Date.parse('2026-11-25T12:00:00Z');
const source=catalog[0].sources[2];
function observation(change={}) {
  return {marketId:'CH',sourceId:source.sourceId,mpn:'MZ-V9P2T0BW',seller:source.seller,url:source.url,finalUrl:source.url,
    checkedAt:new Date(now).toISOString(),currency:'CHF',price:20000,shipping:0,taxes:0,imports:0,fees:0,
    stock:'in-stock',delivery:'2 Werktage',condition:'Neu',deliveryDestination:{country:'CH',postalCode:'8000'},...change};
}
const previous=()=>observation({checkedAt:new Date(now-86400000).toISOString(),price:21000});

test('daily updates default off, isolate authenticated accounts and persist explicit consent',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'udi-daily-'));
  let store;
  try {
    store=createStore({databasePath:join(directory,'preferences.sqlite'),now:()=>now});
    assert.deepEqual(store.getPreference('account:a'),{enabled:false,updatedAt:null});
    assert.deepEqual(store.setPreference('account:a',true),{enabled:true,updatedAt:'2026-11-25T12:00:00.000Z'});
    assert.deepEqual(store.getPreference('account:b'),{enabled:false,updatedAt:null});
    store.close();store=createStore({databasePath:join(directory,'preferences.sqlite'),now:()=>now});
    assert.equal(store.getPreference('account:a').enabled,true);
  }finally{store?.close();await rm(directory,{recursive:true,force:true});}
});

test('repeated toggles are idempotent and account deletion removes consent immediately',()=>{
  let time=now;const store=createStore({now:()=>time});
  try {
    assert.deepEqual(store.setPreference('a',false),{enabled:false,updatedAt:null});
    const first=store.setPreference('a',true);time+=1000;
    assert.deepEqual(store.setPreference('a',true),first);
    assert.equal(store.eligibleDeals('a',{previous:[previous()],current:[observation()]}).length,1);
    store.setPreference('a',false);
    assert.deepEqual(store.eligibleDeals('a',{previous:[previous()],current:[observation()]}),[]);
    store.setPreference('a',true);store.deleteAccount('a');store.deleteAccount('a');
    assert.deepEqual(store.getPreference('a'),{enabled:false,updatedAt:null});
    assert.deepEqual(store.eligibleDeals('a',{previous:[previous()],current:[observation()]}),[]);
    for(const id of ['',null,' a','a\n','x'.repeat(129)])assert.throws(()=>store.getPreference(id));
    assert.throws(()=>store.setPreference('a','true'));
  }finally{store.close();}
});

test('digest eligibility requires consent plus a fresh independently verified improvement on the same basis',()=>{
  const store=createStore({now:()=>now});
  try {
    assert.deepEqual(store.eligibleDeals('a',{previous:[previous()],current:[observation()]}),[]);
    store.setPreference('a',true);
    const accepted=store.eligibleDeals('a',{previous:[previous()],current:[observation()]});
    assert.equal(accepted.length,1);assert.equal(accepted[0].observation.price,20000);assert.equal(accepted[0].change,'lower-total');
    assert.equal(accepted[0].delivered,undefined);assert.equal(accepted[0].confirmedSavings,undefined);
    for(const change of [{fees:null},{stock:'out-of-stock'},{checkedAt:new Date(now-300000).toISOString()},
      {checkedAt:new Date(now+1).toISOString()},{marketId:'DE'},{sourceId:'other.test'},{mpn:'WRONG'},
      {testData:true},{dataMode:'test'},{condition:'Gebraucht'},{deliveryDestination:{country:'CH',postalCode:'3000'}},
      {deliveryDestination:null},{price:21000},{price:22000}]) {
      assert.deepEqual(store.eligibleDeals('a',{previous:[previous()],current:[observation(change)]}),[],JSON.stringify(change));
    }
    for(const older of [[],[observation({price:22000})],[previous(),previous()],
      [previous()].map(row=>({...row,testData:true})),[previous()].map(row=>({...row,fees:null}))]) {
      assert.deepEqual(store.eligibleDeals('a',{previous:older,current:[observation()]}),[]);
    }
    assert.deepEqual(store.eligibleDeals('a',{previous:[previous()],current:[observation(),observation()]}),[]);
    assert.equal(store.eligibleDeals('a',{previous:[previous()].map(row=>({...row,stock:'out-of-stock',price:20000})),current:[observation()]})[0].change,'back-in-stock');
  }finally{store.close();}
});

test('one local briefing per Zurich calendar day survives restart and never renews stale evidence that day',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'udi-daily-brief-'));let time=now,store;
  try {
    const options={databasePath:join(directory,'brief.sqlite'),now:()=>time};store=createStore(options);store.setPreference('a',true);
    const first=store.getDailyBriefing('a',{previous:[previous()],current:[observation()]});
    assert.equal(first.date,'2026-11-25');assert.equal(first.items.length,1);assert.equal(first.delivered,undefined);
    assert.deepEqual(store.getDailyBriefing('a'),first);
    store.close();store=createStore(options);
    assert.deepEqual(store.getDailyBriefing('a'),first);
    time+=300000;
    assert.equal(store.getDailyBriefing('a',{previous:[previous()],current:[observation({checkedAt:new Date(time).toISOString()})]}),null);
    time=Date.parse('2026-11-25T23:01:00Z');
    const tomorrow=store.getDailyBriefing('a',{previous:[previous()],current:[observation({checkedAt:new Date(time).toISOString()})]});
    assert.equal(tomorrow.date,'2026-11-26','Zurich calendar day differs from UTC');
    assert.equal(tomorrow.items.length,1);
  }finally{store?.close();await rm(directory,{recursive:true,force:true});}
});

test('new contradictory checks immediately invalidate persisted briefing contents without freeing the day',()=>{
  for(const change of [{stock:'out-of-stock'},{price:22000},{mpn:'WRONG'},{seller:'Other seller'},
    {finalUrl:'https://evil.test/'},{fees:null},{sourceId:'other.test'},
    {url:source.url+'?other=true'},{condition:'Gebraucht'},{deliveryDestination:null}]) {
    let time=now;const store=createStore({now:()=>time});
    try {
      store.setPreference('a',true);
      assert(store.getDailyBriefing('a',{previous:[previous()],current:[observation()]}));
      time+=1000;
      assert.equal(store.getDailyBriefing('a',{current:[observation({checkedAt:new Date(time).toISOString(),...change})]}),null,JSON.stringify(change));
      assert.equal(store.getDailyBriefing('a'),null,'invalidated contents cannot reappear when later callers omit the new check');
      assert.equal(store.getDailyBriefing('a',{previous:[previous()],current:[observation({checkedAt:new Date(time).toISOString()})]}),null,'the existing daily slot stays consumed');
    }finally{store.close();}
  }
});

test('no verified change consumes no daily briefing; opt-out cancels existing contents even after re-enabling',()=>{
  const store=createStore({now:()=>now});
  try {
    const snapshots={previous:[previous()],current:[observation()]};
    assert.equal(store.getDailyBriefing('a',snapshots),null);
    store.setPreference('a',true);
    assert.equal(store.getDailyBriefing('a',{previous:[previous()],current:[observation({fees:null})]}),null);
    assert(store.getDailyBriefing('a',snapshots));
    store.setPreference('a',false);assert.equal(store.getDailyBriefing('a',snapshots),null);
    store.setPreference('a',true);assert.equal(store.getDailyBriefing('a',snapshots),null,'cancelled briefing must not return on the same day');
    store.deleteAccount('a');assert.equal(store.getDailyBriefing('a',snapshots),null);
    store.setPreference('b',true);assert(store.getDailyBriefing('b',snapshots),'a separate account has its own daily eligibility');
  }finally{store.close();}
});

test('two genuinely concurrent SQLite workers return the same single account briefing',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'udi-daily-race-')),databasePath=join(directory,'race.sqlite');
  const store=createStore({databasePath,now:()=>now});store.setPreference('a',true);store.close();
  const workers=[];
  try {
    const code=`const {parentPort,workerData}=require('node:worker_threads');
      (async()=>{const {createDailyUpdates}=await import(workerData.module);
      const store=createDailyUpdates({databasePath:workerData.databasePath,now:()=>workerData.now});
      parentPort.once('message',()=>{try{parentPort.postMessage({result:store.getDailyBriefing('a',workerData.snapshots)});}catch(error){parentPort.postMessage({error:error.message});}finally{store.close();}});
      parentPort.postMessage({ready:true});})();`;
    for(const price of [21000,22000])workers.push(new Worker(code,{eval:true,workerData:{module:new URL('../scripts/daily-updates.mjs',import.meta.url).href,databasePath,now,
      snapshots:{previous:[{...previous(),price}],current:[observation()]}}}));
    await Promise.all(workers.map(worker=>new Promise((resolve,reject)=>{worker.once('message',message=>{assert.equal(message.ready,true);resolve();});worker.once('error',reject);} )));
    const results=await Promise.all(workers.map(worker=>new Promise((resolve,reject)=>{worker.once('message',message=>{if(message.error)reject(new Error(message.error));else resolve(message.result);});worker.once('error',reject);worker.postMessage('start');})));
    assert.deepEqual(results[0],results[1]);assert.equal(results[0].items.length,1);
    assert.equal(results[0].items[0].observation.price,20000);assert([21000,22000].includes(results[0].items[0].previousTotal));
  }finally{await Promise.all(workers.map(worker=>worker.terminate()));await rm(directory,{recursive:true,force:true});}
});

async function withHandler(options,work) {
  const store=createStore({now:()=>now});
  const server=createServer(createDailyUpdateHandler({store,authenticate:async token=>token==='alice-token'?'alice':token==='bob-token'?'bob':null,...options}));
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try {await work('http://127.0.0.1:'+server.address().port,store);}
  finally {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));store.close();}
}
const headers={Origin:'https://localhost',Authorization:'Bearer alice-token','Content-Type':'application/json'};
const path='/api/v1/preferences/daily-update';

test('authenticated GET/PUT never accepts an account from the body or crosses account boundaries',async()=>{
  await withHandler({},async(origin,store)=>{
    const initial=await fetch(origin+path,{headers});assert.equal(initial.status,200);
    assert.deepEqual(await initial.json(),{schemaVersion:1,enabled:false,updatedAt:null});
    const enabled=await fetch(origin+path,{method:'PUT',headers,body:'{"enabled":true}'});
    assert.equal(enabled.status,200);assert.equal((await enabled.json()).enabled,true);
    const bob=await fetch(origin+path,{headers:{...headers,Authorization:'Bearer bob-token'}});
    assert.equal((await bob.json()).enabled,false);
    const impersonation=await fetch(origin+path,{method:'PUT',headers,body:'{"enabled":false,"accountId":"bob"}'});
    assert.equal(impersonation.status,400);assert.equal(store.getPreference('alice').enabled,true);
    const disabled=await fetch(origin+path,{method:'PUT',headers,body:'{"enabled":false}'});
    assert.equal(disabled.status,200);assert.equal(store.getPreference('alice').enabled,false);
    assert.equal(disabled.headers.get('cache-control'),'no-store');
    assert(!JSON.stringify(await disabled.json()).includes('alice'));
  });
});

test('preference handler rejects invalid auth, cookies, foreign origins and unbounded or malformed payloads',async()=>{
  let authCalls=0;
  await withHandler({authenticate:async token=>{authCalls++;return token==='alice-token'?'alice':null;}},async(origin,store)=>{
    for(const override of [{Authorization:''},{Cookie:'session=untrusted'},{Origin:'https://evil.test'}]) {
      const result=await fetch(origin+path,{method:'PUT',headers:{...headers,...override},body:'{"enabled":true}'});
      assert([401,403].includes(result.status));
    }
    assert.equal(authCalls,0);
    for(const body of ['{"enabled":"true"}','{"enabled":true,"token":"secret"}','null','{',' '.repeat(300)]) {
      const result=await fetch(origin+path,{method:'PUT',headers,body});assert([400,413].includes(result.status));
    }
    assert.equal(store.getPreference('alice').enabled,false);
    const preflight=await fetch(origin+path,{method:'OPTIONS',headers:{Origin:'capacitor://localhost','Access-Control-Request-Method':'PUT','Access-Control-Request-Headers':'authorization,content-type'}});
    assert.equal(preflight.status,204);assert.equal(preflight.headers.get('access-control-allow-origin'),'capacitor://localhost');
    assert.equal((await fetch(origin+path+'?accountId=alice',{headers})).status,404);
    assert.equal((await fetch(origin+path,{method:'POST',headers})).status,405);
  });
});

test('missing real authentication and hanging authentication fail closed without a late preference write',async()=>{
  await withHandler({authenticate:undefined},async origin=>{
    assert.equal((await fetch(origin+path,{method:'PUT',headers,body:'{"enabled":true}'})).status,503);
  });
  let finish;const authentication=new Promise(resolve=>{finish=resolve;});
  await withHandler({authenticate:()=>authentication,timeoutMs:30},async(origin,store)=>{
    const result=await fetch(origin+path,{method:'PUT',headers,body:'{"enabled":true}'});
    assert.equal(result.status,504);finish('alice');await new Promise(resolve=>setTimeout(resolve,5));
    assert.equal(store.getPreference('alice').enabled,false);
  });
});
