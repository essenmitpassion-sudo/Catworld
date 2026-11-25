import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openProviderBudget} from '../scripts/provider-budget.mjs';
import {gatewaySearch} from '../scripts/gateway.mjs';

test('Providerreservierungen teilen sich die Monatsgrenze über Verbindungen und Neustarts',async t=>{
  const directory=await mkdtemp(join(tmpdir(),'udi-budget-'));
  t.after(()=>rm(directory,{recursive:true,force:true}));
  let now=Date.parse('2026-11-30T23:59:59Z');
  const config={databasePath:join(directory,'budget.sqlite'),monthlyMicros:100,requestMicros:40,now:()=>now};
  const first=openProviderBudget(config),second=openProviderBudget(config);
  try {
    assert.equal(first.reserve(),true);
    assert.equal(second.reserve(),true);
    assert.equal(first.reserve(),false);
  } finally {first.close();second.close();}
  const reopened=openProviderBudget(config);
  try {
    assert.equal(reopened.reserve(),false);
    now+=1000;
    assert.equal(reopened.reserve(),true);
  } finally {reopened.close();}
});

test('Gateway bleibt ohne Budget geschlossen und lehnt erschöpfte oder abgebrochene Aufrufe vor dem Anbieter ab',async()=>{
  const config={apiKey:'unit-test-only',model:'openai/gpt-5.4-mini'};
  assert.equal(gatewaySearch(config),null);
  let reservations=0;
  const search=gatewaySearch({...config,budget:{reserve(){reservations++;return false;}}});
  await assert.rejects(search({query:'SSD'}),/budget exhausted/);
  await assert.rejects(search({query:'SSD'},{signal:AbortSignal.abort()}),{name:'AbortError'});
  assert.equal(reservations,1);
});
