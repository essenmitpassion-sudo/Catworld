// Unpublished single-process service boundary. No default credentials, provider,
// source calls or listener. The operator must supply real verified authentication.
import {createServer} from 'node:http';
import {performance} from 'node:perf_hooks';
import {readServiceRequest,serializeScanReply} from './service-contract.mjs';
import {readSavedSearch} from './account-searches.mjs';
import {SavedSearchLimitError} from '../src/saved-searches.mjs';
import {additionalSourcesAccept} from '../src/deal-contract.mjs';

const origins=new Set(['https://localhost','capacitor://localhost']);
const fault=status=>Object.assign(new Error('Request rejected'),{status});
function readBody(request,signal) {
  return new Promise((resolve,reject)=>{
    const chunks=[];let size=0;
    const finish=(error,value)=>{request.off('data',data);request.off('end',end);request.off('error',failed);request.off('aborted',failed);signal.removeEventListener('abort',aborted);error?reject(error):resolve(value);};
    const failed=()=>finish(fault(400)),aborted=()=>finish(fault(504));
    const data=chunk=>{size+=chunk.length;if(size>2048){request.pause();finish(fault(413));}else chunks.push(chunk);};
    const end=()=>{try{finish(null,JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks))));}catch{finish(fault(400));}};
    request.on('data',data);request.once('end',end);request.once('error',failed);request.once('aborted',failed);
    signal.addEventListener('abort',aborted,{once:true});if(signal.aborted)aborted();
  });
}

export function createSearchService({authenticate,search,timeoutMs=8000,mode='production',quota,resolveEntitlement,dailyUpdates,savedSearches}={}) {
  if(!Number.isSafeInteger(timeoutMs)||timeoutMs<20||timeoutMs>20000)throw new Error('Invalid service timeout');
  if(!['production','pilot'].includes(mode))throw new Error('Invalid service mode');
  const users=new Map();let active=0,attempts=0,windowEnds=0;
  const metered=quota?.durable===true&&typeof quota.reserve==='function'&&typeof quota.finish==='function'&&typeof resolveEntitlement==='function';
  const configured=typeof authenticate==='function'&&typeof search==='function'&&(mode==='pilot'||metered);
  return createServer({requestTimeout:timeoutMs,headersTimeout:Math.min(5000,timeoutMs),maxHeaderSize:8192},async(request,response)=>{
    const origin=request.headers.origin;
    const savedRoute=request.url==='/api/v1/saved-searches' && savedSearches;
    const methods=savedRoute?['GET','PUT','DELETE']:['POST'];
    const send=(status,payload,limit)=>{
      if(response.destroyed||response.writableEnded)return;
      const headers={'Content-Type':savedRoute?'application/json':'application/vnd.udi.deals.v1+json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',
        'Referrer-Policy':'no-referrer','Connection':'close',Vary:savedRoute?'Origin':'Origin, Accept',...(origins.has(origin)?{'Access-Control-Allow-Origin':origin}:{})};
      if(status===429) {
        headers['Retry-After']=String(limit?.retryAfter??60);
        if(limit?.kind==='quota-exceeded') {
          headers['X-UDI-Limit']='monthly';
          if(origins.has(origin))headers['Access-Control-Expose-Headers']='X-UDI-Limit, Retry-After';
        }
      }
      if(status===204)Object.assign(headers,{'Access-Control-Allow-Methods':methods.join(', '),'Access-Control-Allow-Headers':'authorization,content-type,accept'});
      if(status===405)headers.Allow=[...methods,'OPTIONS'].join(', ');
      response.once('finish',()=>{if(!request.complete)request.destroy();});
      response.writeHead(status,headers).end(payload===undefined?undefined:JSON.stringify(payload));
    };
    if(request.url==='/api/v1/preferences/daily-update'&&typeof dailyUpdates==='function') {
      try {await dailyUpdates(request,response);}catch{send(503,{kind:'unavailable'});}
      return;
    }
    if(request.url!=='/api/v1/search'&&!savedRoute)return send(404,{kind:'unavailable'});
    if(origin!==undefined&&!origins.has(origin))return send(403,{kind:'access-denied'});
    if(request.method==='OPTIONS') {
      const requested=(request.headers['access-control-request-headers']??'').split(',').map(value=>value.trim().toLowerCase()).filter(Boolean);
      if(!origins.has(origin)||!methods.includes(request.headers['access-control-request-method'])||requested.some(name=>!['authorization','content-type','accept'].includes(name)))return send(403,{kind:'access-denied'});
      return send(204);
    }
    if(!methods.includes(request.method))return send(405,{kind:'invalid'});
    if(!configured)return send(503,{kind:'unavailable'});
    if(request.headers.cookie!==undefined||request.rawHeaders.filter((value,index)=>index%2===0&&value.toLowerCase()==='authorization').length!==1)return send(403,{kind:'access-denied'});
    const authorization=request.headers.authorization;
    // Match the existing client token syntax; never copy credentials to a URL,
    // observation, response or log. Authentication itself belongs to the operator.
    if(typeof authorization!=='string'||authorization.length>4103||!/^Bearer [-A-Za-z0-9._~+/]+=*$/.test(authorization))return send(401,{kind:'authentication-required'});
    const reads=request.method==='GET';
    if(!reads&&!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers['content-type']??''))return send(415,{kind:'invalid'});
    const length=request.headers['content-length'];
    if(reads&&(request.headers['transfer-encoding']!==undefined||(length!==undefined&&length!=='0')))return send(400,{kind:'invalid'});
    if(length!==undefined&&(!/^\d+$/.test(length)||Number(length)>2048))return send(413,{kind:'invalid'});
    const now=performance.now();
    if(now>=windowEnds){attempts=0;windowEnds=now+60000;}
    if(attempts>=60||active>=2)return send(429,{kind:'busy'});
    attempts++;active++;
    const controller=new AbortController();let userLocked=null;
    const disconnect=()=>{if(!response.writableEnded)controller.abort();};
    response.once('close',disconnect);
    const operation=(async()=>{
      let reservation,settled=false;
      try {
        let subject;try{subject=await authenticate(authorization.slice(7),{signal:controller.signal});}catch{throw fault(503);}
        if(controller.signal.aborted)throw fault(504);
        if(subject===null||subject===undefined)throw fault(401);
        if(typeof subject!=='string'||!/^[A-Za-z0-9:_|.-]{1,128}$/.test(subject))throw fault(403);
        const time=performance.now();
        for(const [key,value]of users)if(value.ends<=time&&!value.running)users.delete(key);
        const user=users.get(subject)??{calls:0,ends:time+60000,running:false};
        if(user.running||user.calls>=10||(!users.has(subject)&&users.size>=256))throw fault(429);
        user.calls++;user.running=true;users.set(subject,user);userLocked=user;
        if(savedRoute) {
          let items;
          if(reads)items=savedSearches.list(subject);
          else {
            let entry;
            try {entry=readSavedSearch(await readBody(request,controller.signal));}
            catch(error){throw fault(error.status===413?413:controller.signal.aborted?504:400);}
            if(controller.signal.aborted)throw fault(504);
            items=request.method==='PUT'?savedSearches.save(subject,entry):savedSearches.remove(subject,entry);
          }
          return {schemaVersion:1,items};
        }
        let requestData;try{requestData=readServiceRequest(await readBody(request,controller.signal));}catch(error){throw fault(error.status===413?413:controller.signal.aborted?504:400);}
        if(controller.signal.aborted)throw fault(504);
        const additionalSources=request.headers.accept===additionalSourcesAccept;
        if(metered) {
          let entitlement,reserved;
          try {
            entitlement=await resolveEntitlement(subject,{signal:controller.signal});
            if(controller.signal.aborted)throw fault(504);
            const fingerprintInput=additionalSources?{...requestData.input,responseProfile:'additional-sources'}:requestData.input;
            reserved=quota.reserve({subject,requestId:requestData.requestId,input:fingerprintInput,entitlement});
          } catch {throw fault(controller.signal.aborted?504:503);}
          if(reserved.kind==='replay')return reserved.reply;
          if(reserved.kind==='quota-exceeded')throw Object.assign(fault(429),{limit:reserved});
          if(reserved.kind==='pending')throw fault(429);
          if(['conflict','request-reused'].includes(reserved.kind))throw fault(409);
          if(reserved.kind!=='reserved')throw fault(503);
          reservation=reserved;
        }
        const result=await search(requestData.input,{subject,requestId:requestData.requestId,signal:controller.signal,additionalSources});
        if(controller.signal.aborted)throw fault(504);
        if(result?.kind==='outside-catalog')throw fault(422);
        if(result?.kind==='unavailable')throw fault(502);
        let reply;try{reply=serializeScanReply(result,requestData);}catch{throw fault(502);}
        if(Buffer.byteLength(JSON.stringify(reply))>65536)throw fault(502);
        if(reservation) {
          try {quota.finish(reservation,{reply,charge:reply.kind==='results'});settled=true;}
          catch {throw fault(503);}
        }
        return reply;
      } catch(error) {
        if(reservation&&!settled) {
          try {quota.finish(reservation,{charge:false});}
          catch {throw fault(503);}
        }
        throw error;
      } finally {
        // A timed-out dependency may ignore cancellation. It still owns its
        // slot until it actually settles; do not create unbounded hidden work.
        if(userLocked)userLocked.running=false;active--;
      }
    })();
    let timer;
    const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(fault(504));},timeoutMs);});
    try{send(200,await Promise.race([operation,deadline]));}
    catch(error){
      if(savedRoute&&error instanceof SavedSearchLimitError)return send(409,{kind:'saved-search-limit'});
      const status=[400,401,403,409,413,422,429,502,503,504].includes(error.status)?error.status:502;
      const failureKind={400:'invalid',401:'authentication-required',403:'access-denied',413:'invalid',
        422:'outside-catalog',429:'busy',504:'timeout'};
      send(status,{kind:failureKind[status]??'unavailable'},error.limit);
    }
    finally{clearTimeout(timer);response.off('close',disconnect);}
  });
}
