import assert from 'node:assert/strict';
import test from 'node:test';
import {createPilotSession} from '../src/pilot-session.mjs';
import {nativePilotProfile} from '../scripts/native-pilot-config.mjs';

const authOrigin='https://abcdefghijklmnopqrst.supabase.co';
const approvedOrigin='https://udi.example.com';
const config={authOrigin,approvedOrigin,publishableKey:'sb_publishable_test_fixture_only'};
const email='test@example.com';
const query={query:'Samsung 990 PRO 2 TB',marketId:'CH',deliveryCountry:'CH',currency:'CHF'};
const token='fixture.account.signature';
const issued={access_token:token,token_type:'bearer',expires_in:120,refresh_token:'discard-this-fixture'};

test('nur der ausdrücklich konfigurierte native Testbuild erhält genau zwei erlaubte HTTPS-Ziele',()=>{
  const env={UDI_AUTH_ORIGIN:authOrigin,UDI_PILOT_SEARCH_ORIGIN:approvedOrigin,UDI_AUTH_PUBLISHABLE_KEY:config.publishableKey};
  assert.deepEqual(nativePilotProfile(env),{connectSrc:"'none'",meta:''});
  const profile=nativePilotProfile({...env,UDI_NATIVE_PILOT:'1'});
  assert.equal(profile.connectSrc,authOrigin+' '+approvedOrigin);
  assert(profile.meta.includes('name="udi-native-pilot"'));
  assert.throws(()=>nativePilotProfile({...env,UDI_NATIVE_PILOT:'1',UDI_AUTH_PUBLISHABLE_KEY:'sb_secret_never_embed'}));
});

test('E-Mail-Code öffnet eine befristete Suchsitzung ohne Registrierung und persistente Zugangsdaten',async()=>{
  const calls=[];
  let now=1000;
  const session=createPilotSession({...config,now:()=>now,fetchImpl:async(url,options)=>{
    const address=new URL(url);
    calls.push(address.pathname);
    assert.equal(options.redirect,'error');
    assert.equal(options.credentials,'omit');
    if(address.pathname==='/auth/v1/otp') {
      assert.equal(address.origin,authOrigin);
      assert.deepEqual(JSON.parse(options.body),{email,create_user:false});
      return Response.json({});
    }
    if(address.pathname==='/auth/v1/verify') {
      assert.deepEqual(JSON.parse(options.body),{email,token:'012345',type:'email'});
      return Response.json(issued);
    }
    assert.equal(address.origin,approvedOrigin);
    assert.equal(options.headers.Authorization,'Bearer '+token);
    assert(!JSON.stringify(options).includes(issued.refresh_token));
    return new Response(null,{status:429,headers:{'X-UDI-Limit':'monthly'}});
  }});
  assert.deepEqual(await session.search(query),{kind:'authentication-required'});
  assert.deepEqual(await session.requestCode(' '+email+' '),{kind:'code-requested'});
  assert.deepEqual(await session.verifyCode('012345'),{kind:'signed-in'});
  assert.deepEqual(await session.search(query),{kind:'quota-exhausted'});
  now+=120000;
  assert.deepEqual(await session.search(query),{kind:'authentication-required'});
  assert.deepEqual(calls,['/auth/v1/otp','/auth/v1/verify','/api/v1/search']);
});

test('Fehlende oder unbrauchbare Betreiberziele blockieren die Codeanfrage schon vor dem ersten Abruf',()=>{
  for(const origin of [authOrigin,'https://127.0.0.1','http://udi.example.com','https://udi.example.com/login','https://udi.internal']) {
    assert.throws(()=>createPilotSession({...config,approvedOrigin:origin}),/Invalid pilot configuration/);
  }
});

test('Ablehnung und Rate Limit bleiben unterscheidbar; erneuter Code funktioniert',async()=>{
  let codeRequests=0;
  let confirmRequests=0;
  const session=createPilotSession({...config,fetchImpl:async(url)=>{
    if(new URL(url).pathname==='/auth/v1/otp') {
      codeRequests++;
      return codeRequests===2?new Response(null,{status:429}):Response.json({});
    }
    confirmRequests++;
    return confirmRequests===1?new Response(null,{status:403}):Response.json(issued);
  }});
  assert.equal((await session.verifyCode('123456')).kind,'code-required');
  assert.equal((await session.requestCode('invalid')).kind,'invalid-email');
  assert.equal((await session.requestCode(email)).kind,'code-requested');
  assert.equal((await session.verifyCode('abc')).kind,'invalid-code');
  assert.equal((await session.verifyCode('123456')).kind,'code-rejected');
  assert.equal((await session.requestCode(email)).kind,'busy');
  assert.equal((await session.requestCode(email)).kind,'code-requested');
  assert.equal((await session.verifyCode('654321')).kind,'signed-in');
});

test('Abmelden während der Bestätigung kann die Sitzung auch bei späterer Antwort nicht reaktivieren',async()=>{
  let complete;
  let requestSignal;
  const session=createPilotSession({...config,fetchImpl:async(url,options)=>{
    if(new URL(url).pathname==='/auth/v1/otp')return Response.json({});
    requestSignal=options.signal;
    return new Promise(resolve=>{complete=resolve;});
  }});
  await session.requestCode(email);
  const pending=session.verifyCode('123456');
  session.signOut();
  assert.equal(requestSignal.aborted,true);
  assert.equal((await pending).kind,'cancelled');
  complete(Response.json(issued));
  assert.equal((await session.search(query)).kind,'authentication-required');
});

test('Auth-Antworten mit überlangem Body, Umleitungen oder falschem Typ erzeugen keine Sitzung',async()=>{
  for(const invalidResponse of [
    ()=>new Response(' '.repeat(65537),{headers:{'content-type':'application/json'}}),
    ()=>new Response('<html>login</html>',{headers:{'content-type':'text/html'}}),
    ()=>Response.redirect('https://other.example.com',302),
  ]) {
    const session=createPilotSession({...config,fetchImpl:async url=>new URL(url).pathname.endsWith('/otp')?Response.json({}):invalidResponse()});
    assert.equal((await session.requestCode(email)).kind,'code-requested');
    assert.equal((await session.verifyCode('123456')).kind,'unavailable');
    assert.equal((await session.search(query)).kind,'authentication-required');
  }
});

test('eine Suche nach Ablauf unterbricht die bereits begonnene erneute Anmeldung nicht',async()=>{
  let now=1000;
  let codeRequests=0;
  let delivered;
  const session=createPilotSession({...config,now:()=>now,fetchImpl:async url=>{
    if(new URL(url).pathname.endsWith('/verify'))return Response.json(issued);
    if(++codeRequests===1)return Response.json({});
    return new Promise(resolve=>{delivered=resolve;});
  }});
  await session.requestCode(email);
  assert.equal((await session.verifyCode('123456')).kind,'signed-in');
  now+=120000;
  const retry=session.requestCode(email);
  assert.equal((await session.search(query)).kind,'authentication-required');
  delivered(Response.json({}));
  assert.equal((await retry).kind,'code-requested');
  assert.equal((await session.verifyCode('123456')).kind,'signed-in');
});
