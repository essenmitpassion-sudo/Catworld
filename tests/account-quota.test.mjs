import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

import * as quotaModule from '../scripts/account-quota.mjs';
import {planPolicy} from '../scripts/plan-policy.mjs';
const now=Date.parse('2026-11-25T12:00:00Z');
const entitlement={periodId:'free:2026-11',startsAt:'2026-11-01T00:00:00.000Z',endsAt:'2026-12-01T00:00:00.000Z',limit:1};
const december={periodId:'free:2026-12',startsAt:'2026-12-01T00:00:00.000Z',endsAt:'2027-01-01T00:00:00.000Z',limit:1};
const request=(id='a',subject='unit-user')=>({subject,requestId:id.repeat(32),input:{query:'SSD'},entitlement});

test('dauerhafte Monatsreservierung ist vor dem Neustart atomar und danach weiterhin gesperrt',async t=>{
  assert.equal(typeof quotaModule.createAccountQuota,'function','durable account quota is implemented');
  const directory=await mkdtemp(join(tmpdir(),'udi-quota-'));t.after(()=>rm(directory,{recursive:true,force:true}));
  const databasePath=join(directory,'account.sqlite');
  const first=quotaModule.createAccountQuota({databasePath,now:()=>now});
  const second=quotaModule.createAccountQuota({databasePath,now:()=>now});
  try {
    assert.equal(first.reserve(request()).kind,'reserved');
    assert.equal(second.reserve(request('b')).kind,'quota-exceeded');
    assert.equal(second.reserve(request()).kind,'pending');
    assert.equal(second.reserve(request('b','other-user')).kind,'reserved');
  } finally {first.close();second.close();}
  const reopened=quotaModule.createAccountQuota({databasePath,now:()=>now});
  try {assert.equal(reopened.reserve(request('c')).kind,'quota-exceeded');}
  finally {reopened.close();}
});

test('Erfolg ist nur kurz identisch wiederholbar; andere Eingaben und spätere Wiederverwendung starten keine neue Arbeit',async t=>{
  assert.equal(typeof quotaModule.createAccountQuota,'function');
  const directory=await mkdtemp(join(tmpdir(),'udi-quota-'));
  let time=now;const store=quotaModule.createAccountQuota({databasePath:join(directory,'account.sqlite'),now:()=>time,replayMs:1000});
  t.after(async()=>{store.close();await rm(directory,{recursive:true,force:true});});
  const reservation=store.reserve(request());
  const reply={kind:'results',items:[],completedAt:new Date(now).toISOString()};
  store.finish(reservation,{reply,charge:true});
  assert.deepEqual(store.reserve(request()),{kind:'replay',reply});
  assert.equal(store.reserve({...request(),input:{query:'different'}}).kind,'conflict');
  time+=1000;
  assert.equal(store.reserve(request()).kind,'request-reused');
  assert.equal(store.reserve(request('b')).kind,'quota-exceeded');
  time=Date.parse('2026-12-01T00:00:00Z');
  assert.equal(store.reserve({...request(),entitlement:december}).kind,'request-reused');
  assert.equal(store.reserve({...request('b'),entitlement:december}).kind,'reserved');
});

test('beendete Fehler und Rückfragen geben Monatsplatz frei; veraltete Freigaben und Speicherfehler sperren',async t=>{
  assert.equal(typeof quotaModule.createAccountQuota,'function');
  assert.throws(()=>quotaModule.createAccountQuota({databasePath:':memory:'}));
  const directory=await mkdtemp(join(tmpdir(),'udi-quota-'));t.after(()=>rm(directory,{recursive:true,force:true}));
  const store=quotaModule.createAccountQuota({databasePath:join(directory,'account.sqlite'),now:()=>now,maxEntriesPerPeriod:3});
  const failed=store.reserve(request());store.finish(failed,{charge:false});
  assert.equal(store.reserve(request()).kind,'request-reused');
  const clarification=store.reserve(request('b'));store.finish(clarification,{reply:{kind:'clarification'},charge:false});
  assert.equal(store.reserve(request('b')).kind,'replay');
  const next=store.reserve(request('c'));assert.equal(next.kind,'reserved');store.finish(next,{charge:false});
  assert.equal(store.reserve(request('d')).kind,'quota-exceeded','bounded ledger even when failures are refunded');
  assert.throws(()=>store.reserve({...request('e'),entitlement:{...entitlement,endsAt:'2026-11-20T00:00:00.000Z'}}));
  store.close();assert.throws(()=>store.reserve(request('f')));
});

test('Plus nutzt denselben bestätigten Store-Zeitraum über den Kalendermonatswechsel und sperrt geänderte Periodengrenzen',async t=>{
  const directory=await mkdtemp(join(tmpdir(),'udi-quota-'));
  let time=now;const store=quotaModule.createAccountQuota({databasePath:join(directory,'account.sqlite'),now:()=>time});
  t.after(async()=>{store.close();await rm(directory,{recursive:true,force:true});});
  const plus={periodId:'verified-store-cycle-1',startsAt:'2026-11-15T09:00:00.000Z',endsAt:'2026-12-15T09:00:00.000Z',limit:1};
  const first=store.reserve({...request(),entitlement:plus});
  assert.equal(first.kind,'reserved');store.finish(first,{charge:true});
  assert.throws(()=>store.reserve({...request('b'),entitlement:{...plus,periodId:'changed'}}),/period ID/);
  time=Date.parse('2026-12-01T00:00:00Z');
  const exhausted=store.reserve({...request('b'),entitlement:plus});
  assert.equal(exhausted.kind,'quota-exceeded');assert.equal(exhausted.retryAfter,1242000);
  assert.throws(()=>store.reserve({...request('b'),entitlement:{...plus,endsAt:'2026-12-16T09:00:00.000Z'}}));
  time=Date.parse(plus.endsAt);
  assert.throws(()=>store.reserve({...request('b'),entitlement:plus}));
  assert.equal(store.reserve({...request('b'),entitlement:{...plus,periodId:'verified-store-cycle-2',startsAt:plus.endsAt,endsAt:'2027-01-15T09:00:00.000Z'}}).kind,'reserved');
});

test('Kontolöschung schützt unbeendete Suchen und alte Auftragskennungen werden nach Ablauf entfernt',async t=>{
  const directory=await mkdtemp(join(tmpdir(),'udi-quota-'));
  let time=now;
  const store=quotaModule.createAccountQuota({databasePath:join(directory,'account.sqlite'),now:()=>time});
  t.after(async()=>{store.close();await rm(directory,{recursive:true,force:true});});
  const independent=store.reserve(request('b','other-user'));
  store.finish(independent,{charge:true});
  const reservation=store.reserve(request());
  assert.throws(()=>store.deleteAccount('unit-user'),/reserved searches/);
  store.finish(reservation,{charge:true});
  store.deleteAccount('unit-user');
  assert.equal(store.reserve(request('c','other-user')).kind,'quota-exceeded');
  time=Date.parse('2026-12-08T00:00:00Z');
  store.prune();
  assert.equal(store.reserve({...request('b','other-user'),entitlement:december}).kind,'reserved');
});

test('Free-Grenze gilt exakt im UTC-Monat und validierte Konfiguration steuert das Kontingent',async t=>{
  const directory=await mkdtemp(join(tmpdir(),'udi-quota-'));
  let time=Date.parse('2026-11-30T23:59:59.999Z');
  const store=quotaModule.createAccountQuota({databasePath:join(directory,'account.sqlite'),now:()=>time});
  t.after(async()=>{store.close();await rm(directory,{recursive:true,force:true});});
  const free=quotaModule.utcMonthlyEntitlement(undefined,time);
  assert.equal(free.startsAt,'2026-11-01T00:00:00.000Z');assert.equal(free.endsAt,'2026-12-01T00:00:00.000Z');
  for(const id of ['a','b','c'])assert.equal(store.reserve({...request(id),entitlement:free}).kind,'reserved');
  assert.equal(store.reserve({...request('d'),entitlement:free}).kind,'quota-exceeded');
  time++;
  const policy=planPolicy({freeSearches:1});
  const next=quotaModule.utcMonthlyEntitlement(policy.freeSearches,time);
  assert.equal(store.reserve({...request('d'),entitlement:next}).kind,'reserved');
  assert.equal(store.reserve({...request('e'),entitlement:next}).kind,'quota-exceeded');
  for(const value of [{freeSearches:-1},{plusSearches:2},{priceRappen:0},{currency:'EUR'},{unknown:1}])assert.throws(()=>planPolicy(value));
});
