// Synthetic unit source responses only, no merchant or AI requests.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createOfferSearch} from '../scripts/offer-search.mjs';
import {serializeScanReply} from '../scripts/service-contract.mjs';
import {parseDealReply} from '../src/deal-contract.mjs';
import {inspectPage} from '../scripts/verification.mjs';
import {createSearchService} from '../scripts/search-service.mjs';
import {createDealClient} from '../src/deal-client.mjs';

const now=Date.parse('2026-11-24T13:00:00Z'),input={query:'Samsung 990 PRO 2 TB',marketId:'CH',deliveryCountry:'CH',currency:'CHF'};
const context=()=>({subject:'unit-user',requestId:'b'.repeat(32),signal:new AbortController().signal});
const fixture=(item,checkedAt=now)=>inspectPage(item,{status:200,html:'<script type="application/ld+json">'+JSON.stringify({
  '@type':'Product',url:item.url,mpn:item.mpn,offers:{'@type':'Offer',url:item.url,priceCurrency:'CHF',price:'100.00',
    itemCondition:'https://schema.org/NewCondition',availability:'https://schema.org/InStock',seller:{name:'UNIT TEST ONLY'}},
})+'</script>'},checkedAt);

test('Dienstadapter verlangt Prüfzugang und expliziten authentifizierten Auftragskontext',async()=>{
  assert.throws(()=>createOfferSearch());assert.throws(()=>createOfferSearch({verify:()=>{},webSearch:'enabled'}));
  let calls=0;const search=createOfferSearch({verify:async()=>{calls++;},now:()=>now});
  for(const change of [{subject:undefined},{subject:{id:'other'}},{requestId:'bad'},{signal:null}])await assert.rejects(search(input,{...context(),...change}));
  for(const change of [{marketId:undefined},{query:'https://evil.test/'},{subject:'other-user'}])await assert.rejects(search({...input,...change},context()));
  assert.equal(calls,0);
});

test('bekannter Auftrag verbindet echten Katalog/Discovery/Scan mit Clientvertrag ohne Modellaufruf',async()=>{
  let modelCalls=0,sourceCalls=0;const ctx=context();
  const search=createOfferSearch({now:()=>now,webSearch:async()=>{modelCalls++;throw new Error('not needed');},verify:async(item,{signal})=>{
    sourceCalls++;assert.equal(signal,ctx.signal);return fixture(item);
  }});
  const raw=await search(input,ctx),wire=serializeScanReply(raw,{input,requestId:ctx.requestId},now);
  const accepted=parseDealReply(wire,input,now,false,ctx.requestId);
  assert.equal(accepted.kind,'results');assert.equal(accepted.items.length,3);assert.equal(accepted.sourceMode,'catalog');
  assert(accepted.items.every(item=>item.check.total===null&&item.check.deliveryDestination===null));
  assert.equal(modelCalls,0);assert.equal(sourceCalls,3);assert(!JSON.stringify(wire).includes('unit-user'));
});

test('Rückfrage benötigt keinen Abruf; unbekannte Wünsche nutzen nur ausdrücklich freigegebene Websuche',async()=>{
  let sources=0,web=0;const ctx=context();
  const search=createOfferSearch({verify:async()=>{sources++;},now:()=>now});
  assert.equal((await search({...input,query:'more storage for my PC'},ctx)).kind,'clarification');
  assert.deepEqual(await search({...input,query:'Kingston NV3 2 TB'},ctx),{kind:'outside-catalog'});assert.equal(sources,0);
  const enabled=createOfferSearch({verify:async()=>{sources++;},now:()=>now,webSearch:async(query,{signal})=>{web++;assert.equal(signal,ctx.signal);assert.equal(query.marketId,'CH');return [];}});
  const result=await enabled({...input,query:'Kingston NV3 2 TB'},ctx);
  assert.equal(result.sourceMode,'web');assert.deepEqual(result.items,[]);assert.equal(web,1);assert.equal(sources,0);
});

test('Abbruch stoppt den tatsächlichen Scan vor weiteren Kandidaten und vor verspäteten Ergebnissen',async()=>{
  const controller=new AbortController(),ctx={...context(),signal:controller.signal};let sources=0;
  const search=createOfferSearch({now:()=>now,verify:async item=>{sources++;controller.abort();return fixture(item);}});
  await assert.rejects(search(input,ctx),{name:'AbortError'});assert.equal(sources,1);
  await assert.rejects(search(input,ctx),{name:'AbortError'});assert.equal(sources,1,'pre-aborted requests do not touch a source');
  const other=new AbortController();let verifications=0;
  const late=createOfferSearch({verify:async()=>{verifications++;},webSearch:async()=>{other.abort();return []}});
  await assert.rejects(late({...input,query:'Kingston NV3 2 TB'},{...context(),signal:other.signal}),{name:'AbortError'});
  assert.equal(verifications,0,'late discovery does not start detail checks');
});

test('gemeinsamer Client durchläuft echten lokalen HTTP-Dienst und bestehenden Suchkern mit Testquelle',async t=>{
  const search=createOfferSearch({verify:async item=>item.sourceId==='dq-solutions.ch'?fixture(item,Date.now()):inspectPage(item,{status:403})});
  const server=createSearchService({mode:'pilot',authenticate:async credential=>credential==='unit-test-token'?'unit-user':null,search});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections();}));
  const client=createDealClient({endpoint:'https://udi.example.com/api/v1/search',approvedOrigin:'https://udi.example.com',getAccessToken:async()=>'unit-test-token',
    fetchImpl:(_approved,options)=>fetch('http://127.0.0.1:'+server.address().port+'/api/v1/search',{...options,headers:{...options.headers,Origin:'capacitor://localhost'}})});
  const result=await client.search(input);
  assert.equal(result.kind,'results');assert.equal(result.items.length,1);assert.equal(result.items[0].check.seller,'UNIT TEST ONLY');
  assert.equal(result.items[0].check.total,null);assert.equal(result.unconfirmed,2);
  assert(!JSON.stringify(result).includes('unit-user')&&!JSON.stringify(result).includes('unit-test-token'));
});

test('ein bekannter Suchsatz erreicht den Clientvertrag mit bindendem Budget und offenen Gesamtkosten', async () => {
  const ctx=context();
  const search=createOfferSearch({now:()=>now,verify:async item=>fixture(item)});
  const query=budget=>({...input,query:'I need a Samsung 990 PRO 2 TB without a heatsink, up to CHF '+budget+'.'});
  const allowed=query(500);
  const scan=await search(allowed,ctx);
  const result=parseDealReply(serializeScanReply(scan,{input:allowed,requestId:ctx.requestId},now),allowed,now,false,ctx.requestId);
  assert.equal(result.criteria.maxTotal,50000);
  assert.equal(result.items[0].mpn,'MZ-V9P2T0BW');
  assert.equal(result.items[0].check.total,null);
  assert.equal(result.items[0].budgetStatus,'unknown-total');
  const tight=await search(query(99),ctx);
  assert.deepEqual(tight.items,[]);
  assert.equal(tight.excluded,3);
});

test('regionale Modellnummer bleibt vom Quellenabruf bis zum geschützten Client vollständig',async()=>{
  const ctx=context();
  const wanted={...input,query:'MU-PE1T0S/EU'};
  const search=createOfferSearch({now:()=>now,verify:async item=>fixture(item)});
  const raw=await search(wanted,ctx);
  const accepted=parseDealReply(serializeScanReply(raw,{input:wanted,requestId:ctx.requestId},now),wanted,now,false,ctx.requestId);
  assert.equal(accepted.items.length,1);
  assert.equal(accepted.items[0].mpn,'MU-PE1T0S/EU');
  assert.equal(accepted.items[0].check.total,null);
});

test('eine engere Grenze im Suchtext schliesst das geprüfte Angebot trotz höherem Formularbudget aus',async()=>{
  const ctx=context();
  const wanted={...input,query:'Samsung 990 PRO 2 TB under CHF 100',maxPrice:'500'};
  const search=createOfferSearch({now:()=>now,verify:async item=>fixture(item)});
  const raw=await search(wanted,ctx);
  const accepted=parseDealReply(serializeScanReply(raw,{input:wanted,requestId:ctx.requestId},now),wanted,now,false,ctx.requestId);
  assert.equal(accepted.criteria.maxTotal,9999);
  assert.deepEqual(accepted.items,[]);
  assert.equal(accepted.excluded,3);
});
