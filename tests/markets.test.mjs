import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,compare} from '../src/deals.mjs';
import {scan} from '../scripts/scans.mjs';
import {discover} from '../scripts/discovery.mjs';
import {normalizeSearch,readSearches,storeSearch,removeSearch,searchStorageKey,legacySearchStorageKey} from '../src/saved-searches.mjs';
import {sharedSearchUrl,readSharedSearch} from '../src/share.mjs';
import {setLanguage,activeMarket} from '../src/i18n.mjs';

const now=Date.parse('2026-11-20T13:00:00Z'),product=catalog[0];
const rows=product.sources.slice(0,2).map((source,index)=>({
  marketId:'CH',sourceId:new URL(source.url).hostname.replace(/^www\./,''),
  mpn:product.mpn,seller:source.seller,url:source.url,finalUrl:source.url,
  checkedAt:new Date(now).toISOString(),currency:'CHF',price:20000+index*1000,
  shipping:0,taxes:0,imports:0,fees:0,stock:'in-stock',delivery:'Testdaten',condition:'Neu',
  deliveryDestination:{country:'CH',postalCode:'8000'},
}));
test('CHF beweist keinen Markt: fremde oder fehlende Herkunft verhindert Empfehlung',()=>{
  assert(compare(product,rows,now).recommendation);
  for(const change of [{marketId:'DE'},{marketId:null},{sourceId:'other.test'},{sourceId:null}]){
    const result=compare(product,[rows[0],{...rows[1],...change}],now);
    assert.equal(result.recommendation,null,JSON.stringify(change));assert.equal(result.priceAdvantage,null);
  }
});
test('Scan zeigt nur zum Markt und zur Quelle passende Beobachtungen',async()=>{
  const candidate={title:'Testangebot',url:rows[0].url,source:'Digitec',marketId:'CH',sourceId:'digitec.ch'};
  const check={...rows[0],httpStatus:200,availability:'active',status:'partial'};
  for(const change of [{marketId:'DE'},{sourceId:'other.test'},{marketId:null}]) {
    const result=await scan({kind:'results',items:[candidate]},{verify:async()=>({...check,...change}),now:()=>now});
    assert.equal(result.items.length,0);
  }
  for(const change of [{marketId:'DE'},{sourceId:'other.test'}]) {
    let calls=0;
    const result=await scan({kind:'results',items:[{...candidate,...change}]},{verify:async()=>{calls++;return check},now:()=>now});
    assert.equal(result.items.length,0);assert.equal(calls,0,'wrong search provenance is rejected before a source call');
  }
});
test('nicht unterstützte Suchmärkte und Lieferländer lösen keine Quellensuche aus',async()=>{
  for(const context of [{marketId:'DE'},{deliveryCountry:'DE'},{marketId:null},{currency:'EUR'}]) {
    let calls=0;
    await assert.rejects(discover({query:'Samsung 990 PRO 2 TB',...context},async()=>{calls++;return []}),/noch nicht unterstützt|Budgets nur in CHF/);
    assert.equal(calls,0);
  }
});
test('alte Schweizer Suchen werden lesend migriert und neue ausdrücklich gebunden',()=>{
  const original=JSON.stringify([{query:'SSD bis CHF 100',scope:null,maxPrice:'100',condition:'any',completeCostsOnly:false}]);
  const data=new Map([[legacySearchStorageKey,original]]),storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};
  const [saved]=readSearches(storage);assert.equal(storage.getItem(legacySearchStorageKey),original);assert.equal(storage.getItem(searchStorageKey),null);
  assert.equal(saved.schemaVersion,2);assert.equal(saved.marketId,'CH');assert.equal(saved.deliveryCountry,'CH');
  assert.equal(saved.currency,'CHF');
  storeSearch(storage,saved);assert.equal(JSON.parse(storage.getItem(searchStorageKey))[0].schemaVersion,2);assert.equal(storage.getItem(legacySearchStorageKey),original);
  removeSearch(storage,saved);assert.deepEqual(readSearches(storage),[]);assert.deepEqual(JSON.parse(storage.getItem(legacySearchStorageKey)),[],'explicit deletion also removes the migrated request from its legacy backup');
  assert.throws(()=>normalizeSearch({...saved,marketId:'DE'}));
  assert.throws(()=>normalizeSearch({...saved,schemaVersion:3}));
  assert.throws(()=>normalizeSearch({...saved,currency:'EUR'}));
  assert.throws(()=>normalizeSearch({...saved,unknownNewField:'unrecognised'}));
  for(const key of ['scope','maxPrice','condition','completeCostsOnly']) {
    const broken={...saved};delete broken[key];assert.throws(()=>normalizeSearch(broken),'missing v2 criterion '+key);
  }
});
test('Freigaben binden Markt und Lieferwunsch; alte v1-Links bleiben explizit CH',()=>{
  const old={v:1,q:'SSD',maxPrice:'',condition:'any',completeCostsOnly:false};
  const hash=value=>'#suche?auftrag='+encodeURIComponent(JSON.stringify(value));
  const input=readSharedSearch(hash(old));assert.equal(input.marketId,'CH');assert.equal(input.deliveryCountry,'CH');
  const url=sharedSearchUrl({query:'SSD'},'https://udi.example/').url;
  const value=JSON.parse(new URLSearchParams(new URL(url).hash.slice(7)).get('auftrag'));
  assert.equal(value.v,2);assert.equal(value.marketId,'CH');assert.equal(value.deliveryCountry,'CH');
  assert.equal(value.currency,'CHF');
  for(const change of [{marketId:'DE'},{deliveryCountry:'DE'},{marketId:undefined}])assert.throws(()=>readSharedSearch(hash({...value,...change})));
});
test('Oberflächensprache ändert keine Marktkonfiguration',()=>{
  try{setLanguage('en');assert.equal(activeMarket.id,'CH');assert.equal(activeMarket.currency,'CHF');setLanguage('de');assert.equal(activeMarket.deliveryCountry,'CH');}finally{setLanguage('de');}
});
