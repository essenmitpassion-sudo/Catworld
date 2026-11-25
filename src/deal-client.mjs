// @ts-check
import {prepareSearch,parseDealReply} from './deal-contract.mjs';
/** @typedef {import('./deal-types.d.ts').DealReply} DealReply */
/** @typedef {import('./deal-types.d.ts').ClientOptions} ClientOptions */
/** @param {ClientOptions} [options] @returns {import('./deal-types.d.ts').DealClient} */
export function createDealClient({endpoint=null,approvedOrigin=null,getAccessToken=async()=>null,fetchImpl=globalThis.fetch,timeoutMs=10000,now=Date.now,
  isOnline=()=>globalThis.navigator?.onLine!==false,allowTestData=false,
  makeRequestId=()=>Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)),v=>v.toString(16).padStart(2,'0')).join('')}={}) {
  let configured=false;
  try {
    const url=new URL(endpoint??'');
    configured=url.protocol==='https:'&&url.origin===approvedOrigin&&!url.username&&!url.password&&!url.port&&!url.hash&&!url.search
      &&url.pathname==='/api/v1/search'&&url.hostname.includes('.')&&!/[\[\]:]/.test(url.hostname)&&!/^\d+\.\d+\.\d+\.\d+$/.test(url.hostname)
      &&!/(?:^|\.)(?:localhost|local|internal)$/.test(url.hostname)&&Number.isFinite(timeoutMs)&&timeoutMs>0&&timeoutMs<=20000;
  }catch{/* Remain closed without a concrete approved configuration. */}
  return Object.freeze({async search(input,{signal}={}) {
    if(endpoint===null)return {kind:'native-unavailable'};
    if(!configured)return {kind:'configuration-error'};
    let request;try{request=prepareSearch(input);}catch{return {kind:'invalid'};}
    if(signal?.aborted)return {kind:'cancelled'};
    let requestId;try{requestId=makeRequestId();if(!/^[a-f0-9]{32}$/.test(requestId))throw new Error('Invalid request ID');}catch{return {kind:'configuration-error'};}
    const controller=new AbortController();
    /** @type {(value:DealReply)=>void} */let end=()=>{};
    const boundary=new Promise(resolve=>{end=resolve;});
    const abort=()=>{controller.abort();end({kind:'cancelled'});};
    signal?.addEventListener('abort',abort,{once:true});
    const timer=setTimeout(()=>{controller.abort();end({kind:'timeout'});},timeoutMs);
    /** @returns {Promise<DealReply>} */const work=async()=>{
      let token;try{token=await getAccessToken(controller.signal);}catch{return {kind:'authentication-required'};}
      if(controller.signal.aborted)return {kind:'cancelled'};
      if(!token)return {kind:'authentication-required'};
      if(typeof token!=='string'||token.length>4096||!/^[-A-Za-z0-9._~+/]+=*$/.test(token))return {kind:'authentication-required'};
      let response;
      try {response=await fetchImpl(/** @type {string} */(endpoint),{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/vnd.udi.deals.v1+json',Authorization:'Bearer '+token},
        body:JSON.stringify({...request,schemaVersion:1,requestId}),credentials:'omit',redirect:'error',cache:'no-store',referrerPolicy:'no-referrer',signal:controller.signal});}
      catch{return {kind:isOnline()?'network-error':'offline'};}
      /** @param {import('./deal-types.d.ts').FailureKind} kind @returns {DealReply} */
      const failure=kind=>{void response.body?.cancel().catch(()=>{});return {kind};};
      if(controller.signal.aborted)return failure('cancelled');
      if(response.status===401)return failure('authentication-expired');
      if(response.status===403)return failure('access-denied');
      if(response.status===422)return failure('outside-catalog');
      if(response.status===429)return failure(response.headers.get('X-UDI-Limit')==='monthly'?'quota-exhausted':'busy');
      if(response.status===400)return failure('invalid');
      if(response.status===408||response.status===504)return failure('timeout');
      if(!response.ok)return failure('unavailable');
      if(response.redirected||!/^application\/(?:json|vnd\.udi\.deals\.v1\+json)(?:;|$)/i.test(response.headers.get('content-type')??''))return failure('invalid-response');
      try {
        if(Number(response.headers.get('content-length'))>65536||!response.body)return failure('invalid-response');
        const reader=response.body.getReader(),chunks=[];let size=0;
        const cancelReader=()=>{void reader.cancel().catch(()=>{});};
        controller.signal.addEventListener('abort',cancelReader,{once:true});
        try {while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>65536)throw new Error('Oversized body');chunks.push(value);}}
        finally {controller.signal.removeEventListener('abort',cancelReader);cancelReader();reader.releaseLock();}
        if(controller.signal.aborted)return {kind:'cancelled'};
        const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
        return parseDealReply(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)),request,now(),allowTestData,requestId);
      }catch{return {kind:'invalid-response'};}
    };
    try {return /** @type {DealReply} */(await Promise.race([work(),boundary]));}
    finally {clearTimeout(timer);signal?.removeEventListener('abort',abort);}
  }});
}
