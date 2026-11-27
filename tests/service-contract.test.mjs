import test from 'node:test';
import assert from 'node:assert/strict';
import {readServiceRequest,serializeScanReply} from '../scripts/service-contract.mjs';
import {parseDealReply} from '../src/deal-contract.mjs';
import {catalog,compare} from '../src/deals.mjs';
import {applyChecks} from '../src/observations.mjs';
import {criteriaFor} from '../src/criteria.mjs';
import {discover} from '../scripts/discovery.mjs';
import {scan} from '../scripts/scans.mjs';
import {inspectPage} from '../scripts/verification.mjs';

// Synthetic unit fixture only; never loaded into an app or served as an offer.
const now=Date.parse('2026-11-24T08:00:00Z'),requestId='a'.repeat(32);
const input={query:'Samsung 990 PRO 2 TB',marketId:'CH',deliveryCountry:'CH',currency:'CHF'};
const product=catalog[0],source=product.sources.find(row=>row.sourceId==='dq-solutions.ch');
const fixture=()=>({kind:'results',...input,criteria:criteriaFor(input),sourceMode:'catalog',completedAt:new Date(now).toISOString(),unconfirmed:0,excluded:0,items:[{
  title:'UNIT TEST – not a current offer',url:source.url,sourceId:source.sourceId,marketId:'CH',type:'shop',status:'partial',mpn:product.mpn,
  expiresAt:new Date(now+300000).toISOString(),check:{url:source.url,sourceId:source.sourceId,marketId:'CH',httpStatus:200,status:'partial',
    checkedAt:new Date(now).toISOString(),availability:'active',seller:'UNIT TEST',condition:'Neu',currency:'CHF',mpn:product.mpn,price:10000,total:null},
}]});

test('Dienstanfrage verlangt expliziten versionierten CH-Kontext und dieselbe strikte Suchprüfung',()=>{
  const raw={schemaVersion:1,requestId,...input};
  assert.deepEqual(readServiceRequest(raw),{requestId,input});
  for(const change of [{schemaVersion:2},{requestId:'x'},{marketId:'DE'},{currency:undefined},{deliveryCountry:undefined},
    {query:'https://evil.test/'},{subject:'another-user'},{completeCostsOnly:'true'}])assert.throws(()=>readServiceRequest({...raw,...change}));
  for(const value of [null,[],1,'SSD'])assert.throws(()=>readServiceRequest(value));
});

test('interne Teilprüfung wird ohne erfundene Kosten vom tatsächlichen Clientvertrag angenommen',()=>{
  const request=readServiceRequest({schemaVersion:1,requestId,...input});
  const result=fixture(),before=structuredClone(result),wire=serializeScanReply(result,request,now);
  const accepted=parseDealReply(wire,input,now,false,requestId);
  assert.equal(accepted.kind,'results');assert.equal(accepted.items.length,1);
  assert.equal(wire.schemaVersion,1);assert.equal(wire.dataMode,'live');assert.equal(wire.requestId,requestId);
  assert.equal(accepted.items[0].check.total,null);assert.equal(accepted.items[0].check.shipping,null);
  assert.equal(accepted.items[0].check.mpn,product.mpn);assert.equal(wire.query,undefined);
  assert.deepEqual(result,before,'adapter never mutates original scan evidence');
});

test('HTTP-Erfolg ohne bestätigten Kandidatenabgleich bleibt unbestätigt',()=>{
  const request={requestId,input};
  for(const change of [{status:'unconfirmed'},{productMatch:false},{productMatch:'false'},{productMatch:null},{mpn:undefined}]) {
    const result=fixture();Object.assign(result.items[0].check,change);
    const wire=serializeScanReply(result,request,now);
    assert.equal(wire.items.length,0);assert.equal(wire.unconfirmed,1);
  }
  const bothWrong=fixture();bothWrong.items[0].mpn='WRONG-PART123';bothWrong.items[0].check.mpn='WRONG-PART123';
  assert.throws(()=>serializeScanReply(bothWrong,request,now),'known URL prevents both-wrong identity');
});

test('Adapter verjüngt keine Daten, bestätigt keine Testdaten und verdeckt keine Widersprüche',()=>{
  const request={requestId,input};
  for(const change of [{testData:true},{dataMode:'test'},{marketId:'DE'},{criteria:{maxTotal:1,condition:'any',completeCostsOnly:false}},
    {completedAt:new Date(now-300001).toISOString()}])assert.throws(()=>serializeScanReply({...fixture(),...change},request,now));
  const inconsistent=fixture();inconsistent.items[0].check.shipping=100;inconsistent.items[0].check.taxes=0;
  inconsistent.items[0].check.imports=0;inconsistent.items[0].check.fees=0;inconsistent.items[0].check.total=10000;
  assert.throws(()=>serializeScanReply(inconsistent,request,now),'a false end price is never normalized away');
  for(const nested of ['item','check']) {
    const result=fixture();(nested==='item'?result.items[0]:result.items[0].check).testData=true;
    assert.throws(()=>serializeScanReply(result,request,now),'nested test markers cannot become live');
  }
  assert.throws(()=>serializeScanReply(fixture(),request,NaN));
  assert.throws(()=>serializeScanReply({...fixture(),marketId:'DE'},request,now));
  assert.throws(()=>serializeScanReply({...fixture(),criteria:{...criteriaFor(input),maxTotal:1}},request,now));
  const clarification={kind:'clarification',...input,criteria:criteriaFor(input)};
  assert.equal(serializeScanReply(clarification,request,now).kind,'clarification');
  assert.equal(serializeScanReply({...fixture(),items:[]},request,now).items.length,0);
});

test('bestehende Discovery und Seitenprüfung erreichen den Clientvertrag mit passender Variante',async()=>{
  const request=readServiceRequest({schemaVersion:1,requestId,...input});
  const found=await discover(request.input,async()=>[{title:'UNIT TEST Samsung 990 PRO 2 TB',url:source.url}]);
  for(const mpn of [product.mpn,'WRONG-VARIANT']) {
    const checked=await scan(found,{now:()=>now,verify:item=>inspectPage(item,{status:200,html:'<script type="application/ld+json">'+JSON.stringify({
      '@type':'Product',url:source.url,mpn,offers:{'@type':'Offer',url:source.url,priceCurrency:'CHF',price:'100.00',
        availability:'https://schema.org/InStock',itemCondition:'https://schema.org/NewCondition',seller:{name:'UNIT TEST'}},
    })+'</script>'},now)});
    const wire=serializeScanReply({...checked,sourceMode:'catalog'},request,now);
    const accepted=parseDealReply(wire,request.input,now,false,requestId);
    assert.equal(accepted.items.length,mpn===product.mpn?1:0);
    if(mpn!==product.mpn)assert.equal(accepted.unconfirmed,1);
  }
});

function completeFixture() {
  const result=fixture();
  result.items=product.sources.slice(0,2).map((entry,index)=>({
    ...result.items[0],url:entry.url,sourceId:entry.sourceId,
    check:{...result.items[0].check,url:entry.url,sourceId:entry.sourceId,seller:entry.seller,
      price:10000+index*2000,shipping:0,taxes:0,imports:0,fees:0,total:10000+index*2000,
      delivery:'UNIT TEST – 2 Werktage',deliveryDestination:{country:'CH',postalCode:'8000'}},
  }));
  return result;
}

test('belegte Lieferbedingungen und strukturiertes Lieferziel erreichen den tatsächlichen Vergleich unverändert',()=>{
  const result=completeFixture(),before=structuredClone(result);
  const wire=serializeScanReply(result,{requestId,input},now);
  const accepted=parseDealReply(wire,input,now,false,requestId);
  const comparison=compare(product,applyChecks([],catalog,accepted),now);
  assert.equal(comparison.comparisonStatus,'price-advantage');
  assert.equal(comparison.recommendation.seller,product.sources[0].seller);
  assert.equal(comparison.priceAdvantage.amount,2000);
  assert.equal(comparison.priceAdvantage.confirmedSavings,undefined);
  assert.equal(accepted.items[0].check.delivery,result.items[0].check.delivery);
  assert.deepEqual(comparison.priceAdvantage.deliveryDestination,{country:'CH',postalCode:'8000'});
  assert.notEqual(accepted.items[0].check.deliveryDestination,result.items[0].check.deliveryDestination);
  assert.deepEqual(result,before);
});

test('fehlende Lieferbelege bleiben unbekannt; fremde oder mehrdeutige Ziele werden nicht auf CH umgedeutet',()=>{
  for(const field of ['delivery','deliveryDestination']) {
    const result=completeFixture();delete result.items[0].check[field];
    const wire=serializeScanReply(result,{requestId,input},now);
    const accepted=parseDealReply(wire,input,now,false,requestId);
    assert.equal(accepted.items[0].check[field],null);
    assert.equal(compare(product,applyChecks([],catalog,accepted),now).recommendation,null);
  }
  for(const destination of ['CH 8000',[],{country:'DE',postalCode:'8000'},{country:'CH'},
    {country:'CH',postalCode:8000},{country:'CH',postalCode:'0800'},{country:'CH',postalCode:'80000'},
    {country:'CH',postalCode:'8000',street:'unnecessary personal data'}]) {
    const result=completeFixture();result.items[0].check.deliveryDestination=destination;
    assert.throws(()=>serializeScanReply(result,{requestId,input},now));
  }
  for(const delivery of ['',true,'\u202ehidden']) {
    const result=completeFixture();result.items[0].check.delivery=delivery;
    assert.throws(()=>serializeScanReply(result,{requestId,input},now));
  }
});

test('ein frischer negativer Beleg entwertet im geschützten Client den früheren Passport',async()=>{
  const request={requestId,input};
  const first=fixture();
  first.items[0].check.seller=source.seller;
  const active=parseDealReply(serializeScanReply(first,request,now),input,now,false,requestId);
  const previous=applyChecks([],catalog,active);
  assert.equal(compare(product,previous,now).offers.find(offer=>offer.url===source.url).observation.price,10000);
  const later=now+1000;
  const found=await discover(input,async()=>[{title:'Samsung 990 PRO 2 TB',url:source.url}]);
  const checked=await scan(found,{now:()=>later,verify:item=>inspectPage(item,{status:410},later)});
  const wire=serializeScanReply(checked,request,later);
  const reply=parseDealReply(wire,input,later,false,requestId);
  const current=applyChecks(previous,catalog,reply);
  const updated=compare(product,current,later).offers.find(offer=>offer.url===source.url);
  assert.equal(updated.observation,null);
  assert.deepEqual(reply.invalidations,[{url:source.url,checkedAt:new Date(later).toISOString()}]);
  assert.deepEqual(applyChecks(current,catalog,active),current,'a late active response must not revive the offer');
  assert.deepEqual(applyChecks(previous,catalog,{...reply,invalidations:[{url:source.url,checkedAt:new Date(now-1).toISOString()}]}),
    previous,'older negative evidence must not remove fresher active facts');
});

test('der Antwortvertrag akzeptiert nur frische, exakte Kataloglinks für negative Belege',()=>{
  const valid={url:source.url,checkedAt:new Date(now).toISOString()};
  for(const invalidations of [
    'not a list', [valid,valid], [{...valid,url:'https://evil.test/'}], [{...valid,url:source.url+'?other=1'}],
    [{...valid,checkedAt:new Date(now+1).toISOString()}], [{...valid,checkedAt:new Date(now-300000).toISOString()}],
  ]) {
    assert.throws(()=>serializeScanReply({...fixture(),items:[],invalidations},{requestId,input},now));
  }
  assert.throws(()=>serializeScanReply({...fixture(),invalidations:[valid]},{requestId,input},now));
  const restricted={...input,maxPrice:'1'};
  assert.throws(()=>serializeScanReply({...fixture(),criteria:criteriaFor(restricted),invalidations:[valid]},
    {requestId,input:restricted},now),'an offer filtered by budget still conflicts with a simultaneous withdrawal');
});

test('eine vorübergehende Quellensperre entwertet keinen aktiven Beleg',async()=>{
  const found=await discover(input,async()=>[{title:'Samsung 990 PRO 2 TB',url:source.url}]);
  const paused=await scan({...found,items:[...found.items,{url:product.sources[0].url}]},{now:()=>now,
    verify:async item=>inspectPage(item,item.url===source.url?{reason:'source-cooldown'}:{status:410},now)});
  assert.deepEqual(paused.invalidations,[{url:product.sources[0].url,checkedAt:new Date(now).toISOString()}]);
});

test('eine fremde gesuchte Variante entwertet kein korrektes Angebot unter der bekannten URL',async()=>{
  const wrongMpn='MZ-V9P2T0CW';
  const found=await discover({...input,query:wrongMpn},async()=>[{title:wrongMpn,url:source.url}]);
  const checked=await scan(found,{now:()=>now,verify:item=>inspectPage(item,{
    status:200,html:'<script type="application/ld+json">'+JSON.stringify({
      '@type':'Product',url:item.url,mpn:product.mpn,offers:{'@type':'Offer',url:item.url,priceCurrency:'CHF',price:'100.00',
        availability:'https://schema.org/InStock'},
    })+'</script>',
  },now)});
  assert.deepEqual(checked.items,[]);
  assert.deepEqual(checked.invalidations,[]);
});

test('ein neuer Preis über Budget verdrängt den alten Preis, während derselbe Beleg wiederverwendbar bleibt',async()=>{
  const request={requestId,input};
  const initial=fixture();
  initial.items[0].check.seller=source.seller;
  const first=parseDealReply(serializeScanReply(initial,request,now),input,now,false,requestId);
  const previous=applyChecks([],catalog,first);
  const restricted={...input,maxPrice:'150'};
  const next=now+1000,checkedAt=new Date(next).toISOString();
  const found=await discover(restricted,async()=>[{title:'Samsung 990 PRO 2 TB',url:source.url}]);
  const check={...initial.items[0].check,checkedAt,price:20000};
  const result=await scan(found,{now:()=>next,verify:async()=>check});
  const reply=parseDealReply(serializeScanReply(result,{requestId,input:restricted},next),restricted,next,false,requestId);
  assert.equal(reply.excluded,1);
  assert.deepEqual(reply.items,[]);
  const retired=applyChecks(previous,catalog,reply);
  assert.equal(compare(product,retired,next).offers.find(offer=>offer.url===source.url).observation,null);

  const widened=await scan({...found,criteria:criteriaFor(input)},{now:()=>next,verify:async()=>check});
  const accepted=parseDealReply(serializeScanReply(widened,request,next),input,next,false,requestId);
  const current=applyChecks(retired,catalog,accepted);
  assert.equal(compare(product,current,next).offers.find(offer=>offer.url===source.url).observation.price,20000);
  assert.deepEqual(applyChecks(current,catalog,reply),current,'filtering a known price never deletes the equal-time quote');
});

test('Endpreis-Metadaten gelten nur im Kostenfilter und für ausgefilterte Angebote', () => {
  const restricted={...input,completeCostsOnly:true};
  const unavailable={...fixture(),criteria:criteriaFor(restricted),items:[],excluded:1};
  for(const missingCompleteCosts of [2,-1,0.5,'1',null]) {
    assert.throws(()=>serializeScanReply({...unavailable,missingCompleteCosts},{requestId,input:restricted},now));
  }
  assert.throws(()=>serializeScanReply({...fixture(),items:[],excluded:1,missingCompleteCosts:1},{requestId,input},now));
});
