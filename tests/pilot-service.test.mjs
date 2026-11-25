import assert from 'node:assert/strict';
import {once} from 'node:events';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import test from 'node:test';
import {createPilotService} from '../scripts/pilot-service.mjs';

const authOrigin='https://abcdefghijklmnopqrst.supabase.co';
const publishableKey='sb_publishable_synthetic-test-key';
const alpha='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const beta='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const auth={authOrigin,publishableKey,allowedAccounts:[alpha,beta]};
const request={schemaVersion:1,query:'Samsung 990 PRO 2 TB',marketId:'CH',deliveryCountry:'CH',currency:'CHF'};
const user=id=>({id,role:'authenticated',is_anonymous:false,email_confirmed_at:'2026-11-25T10:00:00Z'});
const token=id=>'fixture.'+id+'.signature';

async function fixture(t,fetchUser) {
  const dataDirectory=await mkdtemp(join(tmpdir(),'udi-pilot-'));
  let verificationCalls=0;
  const service=createPilotService({...auth,dataDirectory,fetchUser,verify:async()=>{
    verificationCalls++;
    return {status:'unconfirmed'};
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
    search:(id,index)=>fetch(base+'/api/v1/search',{method:'POST',headers:headers(id),
      body:JSON.stringify({...request,requestId:index.toString(16).padStart(32,'0')})}),
    daily:(id,enabled)=>fetch(base+'/api/v1/preferences/daily-update',enabled===undefined
      ?{headers:headers(id)}
      :{method:'PUT',headers:headers(id),body:JSON.stringify({enabled})}),
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
