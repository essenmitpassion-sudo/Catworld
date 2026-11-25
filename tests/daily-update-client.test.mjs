// Local HTTP and synthetic account identities. No customer login or delivery.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {createDailyUpdates,createDailyUpdateHandler} from '../scripts/daily-updates.mjs';
import {dailyUpdateAccount} from '../src/daily-update.mjs';

const approvedOrigin='https://udi.example.com';
test('App liest und ändert die Einstellung über den HTTP-Dienst nur für das angemeldete Testkonto', async t=>{
  const store=createDailyUpdates();
  const authenticate=async token=>({'session-a':'subject-a','session-b':'subject-b'})[token]??null;
  const server=createServer(createDailyUpdateHandler({store,authenticate}));
  server.listen(0,'127.0.0.1');
  await once(server,'listening');
  t.after(async()=>{await new Promise(resolve=>server.close(resolve));store.close();});
  const signal=new AbortController().signal;
  function session(token) {
    return dailyUpdateAccount({approvedOrigin,getAccessToken:async()=>token,fetchImpl:(url,options)=>{
      assert.equal(url.origin,approvedOrigin);
      assert.equal(options.credentials,'omit');
      return fetch('http://127.0.0.1:'+server.address().port+url.pathname,options);
    }});
  }
  const a=session('session-a'),b=session('session-b');
  assert.equal(await a.getEnabled(signal),false);
  assert.equal(await a.setEnabled(true,signal),true);
  assert.equal(await b.getEnabled(signal),false);
  assert.equal(await session('session-a').getEnabled(signal),true);
  await assert.rejects(session('expired').setEnabled(false,signal));
  assert.equal(await a.getEnabled(signal),true);
  assert.equal(await a.setEnabled(false,signal),false);
});

test('Abmelden unterbricht auch eine hängende Tokenabfrage vor jedem Netzwerkzugriff', async()=>{
  let networkCalls=0;
  let unlock;
  const token=new Promise(resolve=>{unlock=resolve;});
  const client=dailyUpdateAccount({approvedOrigin,getAccessToken:()=>token,fetchImpl:async()=>{networkCalls++;}});
  const session=new AbortController();
  const pending=client.getEnabled(session.signal);
  session.abort();
  await assert.rejects(pending);
  unlock('obsolete-token');
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(networkCalls,0);
});
