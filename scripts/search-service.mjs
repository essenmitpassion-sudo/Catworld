// Unpublished single-process service boundary. No default credentials, provider,
// source calls or listener. The operator must supply real verified authentication.
import {createServer} from 'node:http';
import {performance} from 'node:perf_hooks';
import {readServiceRequest,serializeScanReply} from './service-contract.mjs';

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

export function createSearchService({authenticate,search,timeoutMs=8000}={}) {
  if(!Number.isSafeInteger(timeoutMs)||timeoutMs<20||timeoutMs>20000)throw new Error('Invalid service timeout');
  const users=new Map();let active=0,attempts=0,windowEnds=0;
  const configured=typeof authenticate==='function'&&typeof search==='function';
  return createServer({requestTimeout:timeoutMs,headersTimeout:Math.min(5000,timeoutMs),maxHeaderSize:8192},async(request,response)=>{
    const origin=request.headers.origin;
    const send=(status,payload)=>{
      if(response.destroyed||response.writableEnded)return;
      const headers={'Content-Type':'application/vnd.udi.deals.v1+json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',
        'Referrer-Policy':'no-referrer','Connection':'close',Vary:'Origin',...(origins.has(origin)?{'Access-Control-Allow-Origin':origin}:{})};
      if(status===429)headers['Retry-After']='60';
      if(status===204)Object.assign(headers,{'Access-Control-Allow-Methods':'POST','Access-Control-Allow-Headers':'authorization,content-type,accept'});
      if(status===405)headers.Allow='POST, OPTIONS';
      response.once('finish',()=>{if(!request.complete)request.destroy();});
      response.writeHead(status,headers).end(payload===undefined?undefined:JSON.stringify(payload));
    };
    if(request.url!=='/api/v1/search')return send(404,{kind:'unavailable'});
    if(origin!==undefined&&!origins.has(origin))return send(403,{kind:'access-denied'});
    if(request.method==='OPTIONS') {
      const requested=(request.headers['access-control-request-headers']??'').split(',').map(value=>value.trim().toLowerCase()).filter(Boolean);
      if(!origins.has(origin)||request.headers['access-control-request-method']!=='POST'||requested.some(name=>!['authorization','content-type','accept'].includes(name)))return send(403,{kind:'access-denied'});
      return send(204);
    }
    if(request.method!=='POST')return send(405,{kind:'invalid'});
    if(!configured)return send(503,{kind:'unavailable'});
    if(request.headers.cookie!==undefined||request.rawHeaders.filter((value,index)=>index%2===0&&value.toLowerCase()==='authorization').length!==1)return send(403,{kind:'access-denied'});
    const authorization=request.headers.authorization;
    // Match the existing client token syntax; never copy credentials to a URL,
    // observation, response or log. Authentication itself belongs to the operator.
    if(typeof authorization!=='string'||authorization.length>4103||!/^Bearer [-A-Za-z0-9._~+/]+=*$/.test(authorization))return send(401,{kind:'authentication-required'});
    if(!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers['content-type']??''))return send(415,{kind:'invalid'});
    const length=request.headers['content-length'];
    if(length!==undefined&&(!/^\d+$/.test(length)||Number(length)>2048))return send(413,{kind:'invalid'});
    const now=performance.now();
    if(now>=windowEnds){attempts=0;windowEnds=now+60000;}
    if(attempts>=60||active>=2)return send(429,{kind:'busy'});
    attempts++;active++;
    const controller=new AbortController();let userLocked=null;
    const disconnect=()=>{if(!response.writableEnded)controller.abort();};
    response.once('close',disconnect);
    const operation=(async()=>{
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
        let requestData;try{requestData=readServiceRequest(await readBody(request,controller.signal));}catch(error){throw fault(error.status===413?413:controller.signal.aborted?504:400);}
        if(controller.signal.aborted)throw fault(504);
        const result=await search(requestData.input,{subject,requestId:requestData.requestId,signal:controller.signal});
        if(controller.signal.aborted)throw fault(504);
        let reply;try{reply=serializeScanReply(result,requestData);}catch{throw fault(502);}
        if(Buffer.byteLength(JSON.stringify(reply))>65536)throw fault(502);
        return reply;
      } finally {
        // A timed-out dependency may ignore cancellation. It still owns its
        // slot until it actually settles; do not create unbounded hidden work.
        if(userLocked)userLocked.running=false;active--;
      }
    })();
    let timer;
    const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(fault(504));},timeoutMs);});
    try{send(200,await Promise.race([operation,deadline]));}
    catch(error){const status=[400,401,403,413,429,502,503,504].includes(error.status)?error.status:502;send(status,{kind:status===429?'busy':status===504?'timeout':status===401?'authentication-required':status===403?'access-denied':status===400||status===413?'invalid':'unavailable'});}
    finally{clearTimeout(timer);response.off('close',disconnect);}
  });
}
