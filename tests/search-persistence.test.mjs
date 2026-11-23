import test from 'node:test';
import assert from 'node:assert/strict';
import {createSearchPersistence,nativeSearchKey,nativeSearchPreferences} from '../src/search-persistence.mjs';
import {storeSearch,readSearches,removeSearch,searchStorageKey,legacySearchStorageKey} from '../src/saved-searches.mjs';
const memory=()=>{const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};};
const wish=query=>({query,maxPrice:'',condition:'any',completeCostsOnly:false});
function native() {const data=memory();return {data,plugin:{get:async({key})=>({value:data.getItem(key)}),set:async({key,value})=>data.setItem(key,value)}};}
test('native Adapter nutzt tatsächliche injizierte Pluginexports und sperrt fehlende Brücken',()=>{
  const {plugin}=native();assert.equal(nativeSearchPreferences({Plugins:{Preferences:plugin}}),plugin);
  assert.throws(()=>nativeSearchPreferences({registerPlugin:()=>plugin}));assert.throws(()=>nativeSearchPreferences({Plugins:{Preferences:{}}}));
});

test('native Suchen überleben verlorene WebView-Schreibstände und bewahren CH-Kontext',async()=>{
  const {plugin}=native(),web=memory();
  const first=await createSearchPersistence({storage:web,preferences:plugin});
  await first.update(s=>storeSearch(s,wish('Samsung 990 PRO 2 TB')));
  await first.update(s=>storeSearch(s,wish('Samsung 990 PRO 2 TB bis CHF 500')));
  const restarted=await createSearchPersistence({storage:memory(),preferences:plugin});
  assert.deepEqual(readSearches(restarted.storage).map(s=>s.query),['Samsung 990 PRO 2 TB','Samsung 990 PRO 2 TB bis CHF 500']);
  assert(readSearches(restarted.storage).every(s=>s.marketId==='CH'&&s.deliveryCountry==='CH'&&s.currency==='CHF'));
});
test('Speichererfolg und sichtbarer Zustand warten auf die native Bestätigung',async()=>{
  let resolve;const persisted=new Promise(r=>resolve=r);let finished=false;
  const state=await createSearchPersistence({storage:memory(),preferences:{get:async()=>({value:null}),set:()=>persisted}});
  const saving=state.update(s=>storeSearch(s,wish('SSD 2 TB'))).then(()=>finished=true);
  await new Promise(r=>setImmediate(r));assert.equal(finished,false);assert.deepEqual(readSearches(state.storage),[]);
  resolve();await saving;assert.equal(finished,true);assert.equal(readSearches(state.storage).length,1);
});
test('native Schreibfehler veröffentlichen keinen scheinbar gespeicherten Wunsch',async()=>{
  const state=await createSearchPersistence({storage:memory(),preferences:{get:async()=>({value:null}),set:async()=>{throw new Error('storage denied')}}});
  await assert.rejects(state.update(s=>storeSearch(s,wish('SSD 2 TB'))));assert.deepEqual(readSearches(state.storage),[]);
});
test('gleichzeitige Speicheraktionen werden ohne verlorenen Wunsch serialisiert',async()=>{
  const {plugin}=native(),state=await createSearchPersistence({storage:memory(),preferences:plugin});
  await Promise.all(['SSD 2 TB','RAM 32 GB'].map(query=>state.update(s=>storeSearch(s,wish(query)))));
  assert.equal(readSearches(state.storage).length,2);
});
test('Lesen migriert nichts; explizites Entfernen bereinigt native und vorhandene Altkopien',async()=>{
  const {plugin,data}=native(),web=memory(),old=JSON.stringify([wish('SSD 2 TB')]);web.setItem(legacySearchStorageKey,old);
  const state=await createSearchPersistence({storage:web,preferences:plugin});
  assert.equal(data.getItem(nativeSearchKey),null);assert.equal(web.getItem(legacySearchStorageKey),old);
  await state.update(s=>storeSearch(s,wish('RAM 32 GB')));
  assert.equal(web.getItem(legacySearchStorageKey),old);
  await state.update(s=>removeSearch(s,wish('SSD 2 TB')));
  assert.equal(web.getItem(legacySearchStorageKey),'[]');
  const next=await createSearchPersistence({storage:memory(),preferences:plugin});
  assert.deepEqual(readSearches(next.storage).map(s=>s.query),['RAM 32 GB']);
});
test('ungültige native Daten und fehlender Zugriff werden ohne Überschreiben abgewiesen',async()=>{
  const {plugin,data}=native();data.setItem(nativeSearchKey,'{"version":99}');
  await assert.rejects(createSearchPersistence({storage:memory(),preferences:plugin}));
  assert.equal(data.getItem(nativeSearchKey),'{"version":99}');
  await assert.rejects(createSearchPersistence({storage:memory(),preferences:{get:async()=>{throw new Error('unavailable')}}}));
});
test('Browser-Speicherung nutzt weiter den bestehenden Speicher und Marktvertrag',async()=>{
  const web=memory(),state=await createSearchPersistence({storage:web});
  await state.update(s=>storeSearch(s,wish('SSD 2 TB')));
  assert.equal(readSearches(web).length,1);assert.equal(state.storage,web);assert(web.getItem(searchStorageKey));
});
test('fehlgeschlagene Alt-Kopienbereinigung bleibt sichtbar und kann erneut abgeschlossen werden',async()=>{
  const {plugin}=native(),web=memory();web.setItem(legacySearchStorageKey,JSON.stringify([wish('SSD 2 TB')]));
  const state=await createSearchPersistence({storage:web,preferences:plugin});
  await state.update(s=>storeSearch(s,wish('RAM 32 GB')));
  const write=web.setItem;let failOnce=true;
  web.setItem=(key,value)=>{if(key===legacySearchStorageKey&&failOnce){failOnce=false;throw new Error('temporarily unavailable');}write(key,value);};
  await assert.rejects(state.update(s=>removeSearch(s,wish('SSD 2 TB'))));
  assert(readSearches(state.storage).some(s=>s.query==='SSD 2 TB'),'failed deletion stays retryable in the UI');
  await state.update(s=>removeSearch(s,wish('SSD 2 TB')));
  assert.equal(web.getItem(legacySearchStorageKey),'[]');assert(!readSearches(state.storage).some(s=>s.query==='SSD 2 TB'));
});
