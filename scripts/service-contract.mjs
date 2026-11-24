// Internal codec only, not a network route or authentication implementation.
// Only actual scan output belongs here; explicit test markers always fail closed.
import {prepareSearch,parseDealReply} from '../src/deal-contract.mjs';

function record(value) {
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Invalid service record');
  return value;
}
function requireLive(value) {
  if((value.testData!==undefined&&value.testData!==false)||(value.dataMode!==undefined&&value.dataMode!=='live'))throw new Error('Test or unknown data mode');
}
export function readServiceRequest(raw) {
  const value=record(raw);
  if(value.schemaVersion!==1||typeof value.requestId!=='string'||!/^[a-f0-9]{32}$/.test(value.requestId))throw new Error('Invalid service envelope');
  for(const field of ['marketId','deliveryCountry','currency'])if(typeof value[field]!=='string')throw new Error('Missing explicit market context');
  const {schemaVersion,requestId,...input}=value;
  return {requestId,input:prepareSearch(input)};
}

export function serializeScanReply(raw,request,now=Date.now()) {
  if(!Number.isSafeInteger(now)||now<0)throw new Error('Invalid service clock');
  const {requestId,input}=readServiceRequest({schemaVersion:1,...record(request).input,requestId:request.requestId});
  const result=record(raw);requireLive(result);
  if(!['results','clarification'].includes(result.kind))throw new Error('Unsupported scan result');
  let items,unconfirmed=result.unconfirmed;
  if(result.kind==='results') {
    if(!Array.isArray(result.items)||result.items.length>3)throw new Error('Invalid scan item count');
    items=[];let unmatched=0;
    for(const rawItem of result.items) {
      const item=record(rawItem),check=record(item.check);requireLive(item);requireLive(check);
      // The existing page adapter's partial status means structured offer data
      // on this exact page. Corroborate an explicit candidate MPN as well;
      // HTTP200 alone never establishes identity. Generic listings stay open.
      if(check.status!=='partial'||check.httpStatus!==200||(check.productMatch!==undefined&&check.productMatch!==true)
        ||typeof item.mpn!=='string'||!item.mpn||check.mpn!==item.mpn) {unmatched++;continue;}
      items.push({...item,check:{...check,status:'http-200',productMatch:true,
        shipping:check.shipping===undefined?null:check.shipping,taxes:check.taxes===undefined?null:check.taxes,
        imports:check.imports===undefined?null:check.imports,fees:check.fees===undefined?null:check.fees}});
    }
    if(unconfirmed!==undefined&&(!Number.isSafeInteger(unconfirmed)||unconfirmed<0))throw new Error('Invalid unconfirmed count');
    unconfirmed=(unconfirmed??0)+unmatched;
  }
  const envelope={...result,schemaVersion:1,requestId,dataMode:'live',...(items?{items,unconfirmed}:{})};
  // Reuse the app's strict validator for source/URL, known/requested variant,
  // market, echoed criteria, freshness and recalculated costs. Never refresh a
  // timestamp, relabel a foreign market, or overwrite a contradictory total.
  const clean=parseDealReply(envelope,input,now,false,requestId);
  if(!['results','clarification'].includes(clean.kind))throw new Error('Scan is no longer current');
  return {schemaVersion:1,requestId,dataMode:'live',...clean};
}
