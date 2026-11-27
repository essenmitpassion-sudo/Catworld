import assert from 'node:assert/strict';
import test from 'node:test';
import {nativePilotProfile} from '../scripts/native-pilot-config.mjs';
import {createPilotSession} from '../src/pilot-session.mjs';

const partial='Samsung 990 PRO 2 TB';
const confirmed=partial+' confirmed';
const unavailable='UDI fixture unavailable';
const input=query=>({query,marketId:'CH',deliveryCountry:'CH',currency:'CHF'});

test('der lokale Fixture-Build erfordert einen eigenen ausdrücklichen Schalter',()=>{
  const normal=nativePilotProfile({});
  assert.equal(normal.connectSrc,"'none'");
  assert.equal(normal.meta,'');
  const fixture=nativePilotProfile({UDI_NATIVE_FIXTURE:'1'});
  assert.equal(fixture.connectSrc,"'none'");
  assert.match(fixture.meta,/name="udi-native-fixture"/);
  assert.throws(()=>nativePilotProfile({UDI_NATIVE_FIXTURE:'1',UDI_NATIVE_PILOT:'1'}));
});

test('der isolierte HTTP-Dienst prüft Authentifizierung, Kontingente, Preise und Kontotrennung',async t=>{
  const {createNativeFixtureService}=await import('../scripts/native-fixture-service.mjs');
  const {fixturePilotOptions}=await import('../scripts/native-fixture-transport.mjs');
  const service=createNativeFixtureService();
  t.after(()=>service.close());
  const address=await service.listen(0);
  const base='http://127.0.0.1:'+address.port;
  const http={async request({url,method,data,headers,disableRedirects}) {
    assert.equal(new URL(url).origin,'http://localhost:4175');
    assert.equal(disableRedirects,true);
    const response=await fetch(base+new URL(url).pathname,{method,headers,body:JSON.stringify(data),redirect:'error'});
    return {url,status:response.status,headers:Object.fromEntries(response.headers),data:await response.json()};
  }};
  const create=async (store,now=Date.now)=>{
    const options=await fixturePilotOptions({Plugins:{CapacitorHttp:http,Preferences:{
      get:async()=>({value:store.value}),set:async({value})=>{store.value=value;},
      remove:async()=>{store.value=null;},
    }}},now);
    return createPilotSession(options);
  };
  const signIn=async (session,account)=>{
    assert.equal((await session.requestCode(account+'@udi.test')).kind,'code-requested');
    assert.equal((await session.verifyCode('654321')).kind,'code-rejected');
    assert.equal((await session.verifyCode('123456')).kind,'signed-in');
  };
  const deviceTime=()=>Date.now()-5000;
  const free=await create({value:null},deviceTime);
  const guest=await fetch(base+'/api/v1/saved-searches');
  assert.equal(guest.status,401);
  assert.equal((await free.requestCode('person@example.com')).kind,'request-rejected');
  await signIn(free,'free');
  assert.deepEqual(await free.getFixtureAccount(),{test:true,plan:'free',used:0,limit:1});
  assert.equal((await free.search(input(unavailable))).kind,'unavailable');
  const open=await free.search(input(partial));
  assert.equal(open.kind,'results','A device clock 5 seconds behind the fixture should still accept the offer');
  assert.equal(open.testData,true);
  assert.equal(open.completedAt,open.items[0].check.checkedAt);
  assert(Date.parse(open.completedAt)<=deviceTime());
  assert.equal(Date.parse(open.items[0].expiresAt)-Date.parse(open.completedAt),300000);
  assert.equal(open.items[0].check.total,null);
  assert.equal(open.items[0].check.minimum,9900);
  assert.deepEqual(await free.getFixtureAccount(),{test:true,plan:'free',used:1,limit:1});
  await free.saveSearch(input(partial));
  assert.equal((await free.listSearches())[0].query,partial);
  assert.equal((await free.search(input(partial))).kind,'quota-exhausted');

  const preferences={value:null};
  const plus=await create(preferences);
  await signIn(plus,'plus');
  assert.deepEqual(await plus.getFixtureAccount(),{test:true,plan:'plus',used:0,limit:3});
  assert.deepEqual(await plus.listSearches(),[]);
  const closed=await plus.search(input(confirmed));
  assert.equal(closed.testData,true);
  assert.equal(closed.items[0].check.total,10400);
  assert.equal(closed.items[0].check.priceConfirmation.kind,'checkout');
  assert.equal((await plus.search(input(partial))).kind,'results');
  assert.equal((await plus.search(input(partial))).kind,'results');
  assert.equal((await plus.search(input(partial))).kind,'quota-exhausted');
  const rehydrated=await create(preferences);
  assert.equal(rehydrated.isSignedIn(),true);
  assert.deepEqual(await rehydrated.getFixtureAccount(),{test:true,plan:'plus',used:3,limit:3});
  assert.equal((await rehydrated.search(input(partial))).kind,'quota-exhausted');
  await free.removeSearch(input(partial));
  assert.deepEqual(await free.listSearches(),[]);
  plus.signOut();
  assert.equal(await plus.getFixtureAccount(),null);
  assert.equal(preferences.value,null);
  assert.equal((await create(preferences)).isSignedIn(),false);

  const health=await fetch(base+'/healthz').then(reply=>reply.json());
  assert.deepEqual(health,{test:true,counts:{otp:2,verify:2,partial:3,confirmed:1,unavailable:1,quota:3,list:3,save:1,remove:1}});
});

test('der Fixture-Transport verwirft fremde Ziele, Weiterleitungen und als live markierte Antworten',async()=>{
  const {fixtureFetch,fixturePilotConfig}=await import('../scripts/native-fixture-transport.mjs');
  let response={status:200,url:'http://localhost:4175/api/v1/search',data:{dataMode:'live'}};
  let calls=0;
  const fetchImpl=fixtureFetch({Plugins:{CapacitorHttp:{request:async()=>{calls++;return response;}}}});
  const options={method:'POST',headers:{}};
  const search=fixturePilotConfig.approvedOrigin+'/api/v1/search';
  await assert.rejects(fetchImpl('http://localhost:4175/api/v1/search',options),/Invalid fixture route/);
  await assert.rejects(fetchImpl(search+'?redirect=1',options),/Invalid fixture route/);
  assert.equal(calls,0);
  await assert.rejects(fetchImpl(search,options),/Unmarked fixture data/);
  response={...response,status:302};
  await assert.rejects(fetchImpl(search,options),/Invalid fixture response/);
});
