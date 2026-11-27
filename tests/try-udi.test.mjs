import assert from 'node:assert/strict';
import test from 'node:test';
import {createTryUdi} from '../scripts/try-udi.mjs';

test('the personal test start serves the existing app and the fixture on loopback only', async t => {
  const app = createTryUdi();
  t.after(() => app.close());
  const address = await app.listen(0);
  assert.equal(address.address,'127.0.0.1');
  const origin = 'http://127.0.0.1:' + address.port;
  const html = await fetch(origin);
  assert.equal(html.status,200);
  assert.match(await html.text(),/name="udi-local-test"/);
  assert.match(html.headers.get('content-security-policy'),/connect-src 'self'/);
  assert.match(html.headers.get('permissions-policy'),/microphone=\(\)/);
  assert.equal((await fetch(origin + '/scripts/serve.mjs')).status,404);
  assert.equal((await fetch(origin + '/observations.json')).status,404);
  assert.equal((await fetch(origin + '/native-fixture-transport.mjs')).status,200);
  assert.deepEqual(await fetch(origin + '/healthz').then(r => r.json()).then(r => r.test),true);
  const auth = {method:'POST',headers:{'Content-Type':'application/json',apikey:'sb_publishable_udi_native_fixture'},
    body:JSON.stringify({email:'plus@udi.test',create_user:false})};
  assert.equal((await fetch(origin+'/auth/v1/otp',{...auth,headers:{...auth.headers,Origin:'https://foreign.invalid'}})).status,403);
  assert.equal((await fetch(origin+'/auth/v1/otp',{...auth,headers:{...auth.headers,Origin:origin,'Sec-Fetch-Site':'same-origin'}})).status,200);
});
