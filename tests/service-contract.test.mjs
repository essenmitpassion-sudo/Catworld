import test from 'node:test';
import assert from 'node:assert/strict';
import {readServiceRequest,serializeScanReply} from '../scripts/service-contract.mjs';
import {parseDealReply} from '../src/deal-contract.mjs';
import {catalog} from '../src/deals.mjs';
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
