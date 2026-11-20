import test from 'node:test';
import assert from 'node:assert/strict';
import { sharedSearchUrl, readSharedSearch } from '../src/share.mjs';

test('geteilte Suche erhält Unicode und wirksame Kriterien ohne Preise oder Zugangsdaten',()=>{
  const input={query:'Gebrauchte SSD für Zürich bis CHF 250',condition:'used',maxPrice:'250',completeCostsOnly:true,price:100,secrets:'do not share'};
  const link=sharedSearchUrl(input,'https://udi.example/app/?token=secret#watchlist');
  assert.equal(new URL(link.url).search,'');
  assert.equal(new URL(link.url).pathname,'/app/');
  assert(!link.url.includes('secret')&&!link.url.includes('price'));
  assert.equal(link.localOnly,false);
  assert.deepEqual(readSharedSearch(new URL(link.url).hash),{marketId:'CH',deliveryCountry:'CH',currency:'CHF',query:input.query,maxPrice:'250.00',condition:'used',completeCostsOnly:true});
});

test('Link teilt nur Suchabsicht, lokale Adresse ist ausdrücklich kein öffentlicher Zugang',()=>{
  const link=sharedSearchUrl({query:'Samsung 990 PRO 2 TB'},'http://127.0.0.1:4173/');
  assert.equal(link.localOnly,true);
  assert.equal(readSharedSearch('#watchlist'),null);
  for(const base of ['javascript:alert(1)','http://udi.example/','https://user:password@udi.example/'])assert.throws(()=>sharedSearchUrl({query:'SSD'},base));
});

test('manipulierte und mehrdeutige Freigaben werden ohne Ausführung abgewiesen',()=>{
  const hash=value=>'#suche?auftrag='+encodeURIComponent(JSON.stringify(value));
  const valid={v:1,q:'SSD',maxPrice:'',condition:'any',completeCostsOnly:false};
  for(const value of [null,[],{...valid,v:2},{...valid,q:'x'.repeat(301)},{...valid,maxPrice:'no'},
    {...valid,redirect:'https://evil.test/'},{...valid,completeCostsOnly:'false'},{...valid,q:'https://evil.test/'}]) assert.throws(()=>readSharedSearch(hash(value)));
  assert.throws(()=>readSharedSearch(hash(valid)+'&auftrag=x'));
  assert.throws(()=>readSharedSearch(hash(valid)+'&redirect=https://evil.test/'));
  assert.throws(()=>readSharedSearch('#suche?auftrag=%broken'));
  assert.throws(()=>readSharedSearch('#suche?auftrag='+'x'.repeat(9000)));
});
