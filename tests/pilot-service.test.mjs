import assert from 'node:assert/strict';
import {once} from 'node:events';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import test from 'node:test';
import {createPilotService} from '../scripts/pilot-service.mjs';
import {createPilotSession} from '../src/pilot-session.mjs';
import {discoverOffers} from '../src/runtime.mjs';
import {normalizeSearch,SavedSearchLimitError} from '../src/saved-searches.mjs';
import {createAccountSearches} from '../scripts/account-searches.mjs';
import {inspectPage} from '../scripts/verification.mjs';

const authOrigin='https://abcdefghijklmnopqrst.supabase.co';
const publishableKey='sb_publishable_synthetic-test-key';
const alpha='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const beta='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const auth={authOrigin,publishableKey,allowedAccounts:[alpha,beta]};
const request={schemaVersion:1,query:'Samsung 990 PRO 2 TB',marketId:'CH',deliveryCountry:'CH',currency:'CHF'};
const user=id=>({id,role:'authenticated',is_anonymous:false,email_confirmed_at:'2026-11-25T10:00:00Z'});
const token=id=>'fixture.'+id+'.signature';

async function fixture(t,fetchUser,verify=async()=>({status:'unconfirmed'})) {
  const dataDirectory=await mkdtemp(join(tmpdir(),'udi-pilot-'));
  let verificationCalls=0;
  const service=createPilotService({...auth,dataDirectory,fetchUser,verify:async item=>{
    verificationCalls++;
    return verify(item);
  }});
  t.after(async()=>{
    await service.close();
    await rm(dataDirectory,{recursive:true,force:true});
  });
  service.server.listen(0,'127.0.0.1');
  await once(service.server,'listening');
  const base='http://127.0.0.1:'+service.server.address().port;
  const headers=id=>({authorization:'Bearer '+token(id),'content-type':'application/json',origin:'capacitor://localhost'});
  return {
    verificationCalls:()=>verificationCalls,
    fetchSearch:(url,options)=>fetch(base+new URL(url).pathname,{...options,
      headers:{...options.headers,origin:'https://localhost'}}),
    search:(id,index,criteria)=>fetch(base+'/api/v1/search',{method:'POST',headers:headers(id),
      body:JSON.stringify({...request,...criteria,requestId:index.toString(16).padStart(32,'0')})}),
    daily:(id,enabled)=>fetch(base+'/api/v1/preferences/daily-update',enabled===undefined
      ?{headers:headers(id)}
      :{method:'PUT',headers:headers(id),body:JSON.stringify({enabled})}),
    wishes:(id,method='GET',entry)=>fetch(base+'/api/v1/saved-searches',{
      method,headers:headers(id),body:entry===undefined?undefined:JSON.stringify(entry),
    }),
  };
}

test('geschützter Pilot prüft das Konto vor jeder Suche, trennt Kontingente und Einstellungen',async t=>{
  const app=await fixture(t,async(url,options)=>{
    assert.equal(String(url),authOrigin+'/auth/v1/user');
    assert.equal(options.redirect,'error');
    assert.equal(options.credentials,'omit');
    assert.equal(options.headers.apikey,publishableKey);
    const id=options.headers.Authorization.split('.')[1];
    if(id==='expired')return new Response(null,{status:401});
    return Response.json(user(id));
  });
  assert.equal((await app.search('expired',0)).status,401);
  assert.equal((await app.search('cccccccc-cccc-4ccc-8ccc-cccccccccccc',0)).status,401);
  assert.equal(app.verificationCalls(),0);

  const outside=await app.search(alpha,0,{query:'Kingston NV3 2 TB'});
  assert.equal(outside.status,422);
  assert.deepEqual(await outside.json(),{kind:'outside-catalog'});
  assert.equal(app.verificationCalls(),0);

  for(let index=1;index<=3;index++) {
    const response=await app.search(alpha,index);
    assert.equal(response.status,200);
    assert.deepEqual((await response.json()).items,[]);
  }
  const afterAlpha=app.verificationCalls();
  assert.ok(afterAlpha>0);
  const limited=await app.search(alpha,4);
  assert.equal(limited.status,429);
  assert.equal(limited.headers.get('x-udi-limit'),'monthly');
  assert.equal(app.verificationCalls(),afterAlpha);
  assert.equal((await app.search(beta,4)).status,200);
  assert.ok(app.verificationCalls()>afterAlpha);

  assert.equal((await (await app.daily(alpha,true)).json()).enabled,true);
  assert.equal((await (await app.daily(beta)).json()).enabled,false);
  assert.equal((await (await app.daily(alpha)).json()).enabled,true);
});

test('gespeicherte Suchwünsche gehören dem bestätigten Konto und Änderungen sind wiederholbar',async t=>{
  const app=await fixture(t,async(_url,options)=>{
    const id=options.headers.Authorization.split('.')[1];
    return id===alpha||id===beta?Response.json(user(id)):new Response(null,{status:401});
  });
  const wish=normalizeSearch({query:'Samsung 990 PRO 2 TB',maxPrice:'200'});
  assert.equal((await app.wishes('expired')).status,401);
  assert.deepEqual(await (await app.wishes(alpha)).json(),{schemaVersion:1,items:[]});
  assert.equal((await app.wishes(alpha,'PUT',{...wish,subject:beta})).status,400);
  for(let index=0;index<2;index++)assert.deepEqual(await (await app.wishes(alpha,'PUT',wish)).json(),{schemaVersion:1,items:[wish]});
  assert.deepEqual(await (await app.wishes(beta,'DELETE',wish)).json(),{schemaVersion:1,items:[]});
  assert.deepEqual(await (await app.wishes(alpha)).json(),{schemaVersion:1,items:[wish]});
  assert.deepEqual(await (await app.wishes(alpha,'DELETE',wish)).json(),{schemaVersion:1,items:[]});
  assert.equal(app.verificationCalls(),0);
});

test('dauerhafter Suchspeicher bleibt für dasselbe Konto nach Neustart verfügbar',async t=>{
  const directory=await mkdtemp(join(tmpdir(),'udi-saved-'));
  t.after(()=>rm(directory,{recursive:true,force:true}));
  const databasePath=join(directory,'saved.sqlite');
  const first=createAccountSearches(databasePath);
  const wish=normalizeSearch({query:'Samsung 990 PRO 2 TB',maxPrice:'200'});
  first.save(alpha,wish);
  first.save(beta,normalizeSearch({query:'SSD 1 TB'}));
  first.close();
  const reopened=createAccountSearches(databasePath);
  try {
    assert.deepEqual(reopened.list(alpha),[wish]);
    for(let i=1;i<20;i++)reopened.save(alpha,normalizeSearch({query:'PC-Aufrüstung '+i}));
    assert.equal(reopened.save(alpha,wish).length,20);
    assert.throws(()=>reopened.save(alpha,normalizeSearch({query:'21. Wunsch'})),SavedSearchLimitError);
    assert.equal(reopened.list(alpha).length,20);
    reopened.deleteAccount(alpha);
    assert.deepEqual(reopened.list(alpha),[]);
    assert.equal(reopened.list(beta).length,1);
  } finally {
    reopened.close();
  }
});

test('gemeinsamer App-Client nutzt nach dem Einmalcode den echten geschützten Suchpfad',async t=>{
  const pilot=await fixture(t,async(_url,options)=>{
    return options.headers.Authorization==='Bearer '+token(alpha)?Response.json(user(alpha)):new Response(null,{status:401});
  });
  const session=createPilotSession({authOrigin,publishableKey,approvedOrigin:'https://udi.example.com',fetchImpl:async(url,options)=>{
    const destination=new URL(url);
    if(destination.origin===authOrigin) {
      if(destination.pathname==='/auth/v1/otp')return Response.json({});
      assert.equal(destination.pathname,'/auth/v1/verify');
      return Response.json({access_token:token(alpha),expires_in:120,token_type:'bearer'});
    }
    return pilot.fetchSearch(url,options);
  }});
  const {query,marketId,deliveryCountry,currency}=request;
  const search=platform=>discoverOffers({query,marketId,deliveryCountry,currency},{platform,client:session});
  assert.equal((await search('ios')).kind,'authentication-required');
  assert.equal((await session.requestCode('alpha@example.com')).kind,'code-requested');
  assert.equal((await session.verifyCode('123456')).kind,'signed-in');
  for(const platform of ['android','ios']) {
    const response=await search(platform);
    assert.equal(response.kind,'results');
    assert.deepEqual(response.items,[]);
  }
  const wish=normalizeSearch({query,marketId,deliveryCountry,currency,maxPrice:'200'});
  assert.deepEqual(await session.saveSearch(wish),[wish]);
  assert.deepEqual(await session.listSearches(),[wish]);
  assert.deepEqual(await session.removeSearch(wish),[]);
  session.signOut();
  assert.equal((await search('android')).kind,'authentication-required');
  await assert.rejects(session.listSearches(),/Melde dich an/);
});

test('Pilot sperrt anonyme und unbestätigte Konten und bleibt bei defektem Auth-Dienst geschlossen',async t=>{
  const app=await fixture(t,async(_url,options)=>{
    const id=options.headers.Authorization.split('.')[1];
    if(id===alpha)return Response.json({...user(id),is_anonymous:true});
    if(id===beta)return Response.json({...user(id),email_confirmed_at:null});
    if(id==='oversized')return new Response(' '.repeat(32769),{headers:{'Content-Type':'application/json'}});
    return new Response(null,{status:503});
  });
  assert.equal((await app.search(alpha,1)).status,401);
  assert.equal((await app.search(beta,1)).status,401);
  assert.equal((await app.search('oversized',1)).status,503);
  assert.equal((await app.search('unavailable',1)).status,503);
  assert.equal(app.verificationCalls(),0);
});

test('Pilot verlangt einen festen Auth-Anbieter, einen öffentlichen Projektschlüssel und freigegebene UUIDs',()=>{
  for(const change of [
    {authOrigin:'https://other.example.com'},
    {authOrigin:authOrigin+'/path'},
    {publishableKey:'sb_secret_test'},
    {allowedAccounts:[]},
    {allowedAccounts:['placeholder']},
  ]) assert.throws(()=>createPilotService({...auth,...change,dataDirectory:tmpdir()}),/Invalid pilot authentication/);
});

test('ausgefallene oder unbelegte Quellen verbrauchen keine Suche; belegte leere Ergebnisse zählen',async t=>{
  const productPage=(item,mpn,priceValidUntil)=>({
    status:200,html:'<script type="application/ld+json">'+JSON.stringify({
      '@type':'Product',url:item.url,mpn,offers:{'@type':'Offer',url:item.url,priceCurrency:'CHF',price:'100.00',
        availability:'https://schema.org/InStock',priceValidUntil},
    })+'</script>',
  });
  let merchantPage;
  let peerPage={reason:'url-rejected'};
  const app=await fixture(t,async()=>Response.json(user(alpha)),async item=>inspectPage(item,
    item.sourceId==='dq-solutions.ch' ? merchantPage(item) : peerPage));
  const failures=[
    ()=>({reason:'fetch-failed'}),
    ()=>({reason:'source-cooldown'}),
    ()=>({status:429}),
    ()=>({status:200,html:'<title>Just a moment...</title>'}),
    item=>productPage(item,undefined),
    item=>productPage(item,item.mpn,'2026-02-30'),
  ];
  for(const [index,page] of failures.entries()) {
    merchantPage=page;
    const response=await app.search(alpha,index);
    assert.equal(response.status,502,'Quellenprüfung '+index);
    assert.deepEqual(await response.json(),{kind:'unavailable'});
  }

  peerPage={status:503};
  const completed=[
    ()=>({status:404}),
    item=>productPage(item,'MZ-V9P2T0CW'),
    item=>productPage(item,item.mpn,'2020-01-01'),
  ];
  for(const [index,page] of completed.entries()) {
    merchantPage=page;
    const response=await app.search(alpha,failures.length+index);
    assert.equal(response.status,200,'belegte Recherche '+index);
    const result=await response.json();
    assert.equal(result.kind,'results');
    assert.deepEqual(result.items,[]);
  }
  const limited=await app.search(alpha,failures.length+completed.length);
  assert.equal(limited.status,429);
  assert.equal(limited.headers.get('x-udi-limit'),'monthly');
});
