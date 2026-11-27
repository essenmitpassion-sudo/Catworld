// Operator composition only. No listener, credentials, default web provider or
// new source permissions. Authentication must precede every invocation.
import {prepareSearch} from '../src/deal-contract.mjs';
import {discover} from './discovery.mjs';
import {catalogSearch} from './catalog-search.mjs';
import {scan} from './scans.mjs';

export function createOfferSearch({verify,webSearch=null,now=Date.now}={}) {
  if(typeof verify!=='function'||(webSearch!==null&&typeof webSearch!=='function')||typeof now!=='function')throw new Error('Missing approved search adapter');
  return async(input,{subject,requestId,signal,additionalSources=true}={})=>{
    if(typeof subject!=='string'||!/^[A-Za-z0-9:_|.-]{1,128}$/.test(subject)||typeof requestId!=='string'||!/^[a-f0-9]{32}$/.test(requestId)
      ||!(signal instanceof AbortSignal))throw new Error('Missing authenticated request context');
    for(const key of ['marketId','deliveryCountry','currency'])if(typeof input?.[key]!=='string')throw new Error('Missing explicit market context');
    const prepared=prepareSearch(input);signal.throwIfAborted();
    let sourceMode='catalog',outsideCatalog=false;
    const found=await discover(prepared,async query=>{
      signal.throwIfAborted();
      const known=await catalogSearch(query);signal.throwIfAborted();
      if(known.length)return known;
      if(!webSearch) {
        outsideCatalog=true;
        return [];
      }
      sourceMode='web';
      const rows=await webSearch(query,{signal});signal.throwIfAborted();return rows;
    },{excludedSources:additionalSources?[]:['shop.mixel.ch']});
    signal.throwIfAborted();
    if(outsideCatalog)return {kind:'outside-catalog'};
    // Do not select a shared personal journal from user-controlled input. Public
    // source facts stay in the verifier; private histories need separate storage.
    const result=await scan(found,{now,signal,verify:item=>verify(item,{signal})});
    signal.throwIfAborted();
    return result.kind==='results'?{...result,sourceMode}:result;
  };
}
