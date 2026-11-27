import {randomBytes} from 'node:crypto';
import {createServer} from 'node:http';
import {pathToFileURL} from 'node:url';
import {createAccountSearches,readSavedSearch} from './account-searches.mjs';
import {readServiceRequest} from './service-contract.mjs';
import {criteriaFor} from '../src/criteria.mjs';
import {SavedSearchLimitError} from '../src/saved-searches.mjs';

const port=4175;
const code='123456';
const expiresIn=900;
const key='sb_publishable_udi_native_fixture';
const product='samsung 990 pro 2 tb';
const confirmed=product+' confirmed';
const unavailable='udi fixture unavailable';
const queryKey=value=>value.trim().toLowerCase();
const url='https://www.dq-solutions.ch/de/udi-native-fixture-hs000000';
const sourceId='dq-solutions.ch';
const mpn='MZ-V9P2T0BW';

function account(plan,limit) {
  return {plan,limit,used:0,pendingUntil:0,session:null};
}
function offer(isConfirmed,at) {
  const checkedAt=new Date(at).toISOString();
  const deliveryDestination=isConfirmed?{country:'CH',postalCode:'8000'}:null;
  const total=isConfirmed?10400:null;
  const check={
    url,marketId:'CH',sourceId,status:'http-200',productMatch:true,availability:'active',
    checkedAt,mpn,seller:'UDI TEST',condition:'Neu',currency:'CHF',price:9900,
    shipping:isConfirmed?500:null,taxes:0,imports:0,fees:0,deliveryDestination,total,
    ...(isConfirmed?{priceConfirmation:{kind:'checkout',total,country:'CH',postalCode:'8000'}}:{}),
  };
  return {title:'TEST – Samsung 990 PRO 2 TB',url,sourceId,marketId:'CH',type:'shop',status:'partial',mpn,
    expiresAt:new Date(at+300000).toISOString(),check};
}
async function readBody(request) {
  if(!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers['content-type']??''))throw new Error('Expected JSON');
  const chunks=[];
  let size=0;
  for await(const chunk of request) {
    size+=chunk.length;
    if(size>2048)throw new Error('Oversized request');
    chunks.push(chunk);
  }
  return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks)));
}
function send(response,status,body,headers={}) {
  if(response.destroyed||response.writableEnded)return;
  response.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','Connection':'close',...headers})
    .end(JSON.stringify(body));
}

// Disposable fixture process. Only these synthetic identities can create state.
export function createNativeFixtureService() {
  const accounts=new Map([['free@udi.test',account('free',1)],['plus@udi.test',account('plus',3)]]);
  const counts={otp:0,verify:0,partial:0,confirmed:0,unavailable:0,quota:0,list:0,save:0,remove:0};
  const saves=createAccountSearches(':memory:');
  const reject=(response,status)=>send(response,status,{test:true});

  async function handle(request,response) {
    const address=server.address();
    if(address===null||typeof address==='string'||request.socket.remoteAddress!=='127.0.0.1'
      ||![`127.0.0.1:${address.port}`,`localhost:${address.port}`].includes(request.headers.host)
      ||request.headers.origin!==undefined||request.headers.cookie!==undefined)return reject(response,403);
    const route=request.url;
    const method=request.method;
    const at=Date.now();
    if(route==='/healthz'&&method==='GET')return send(response,200,{test:true,counts});
    if(['/auth/v1/otp','/auth/v1/verify'].includes(route)&&method==='POST') {
      if(request.headers.apikey!==key)return reject(response,403);
      const body=await readBody(request);
      const subject=accounts.get(body?.email);
      if(!subject)return reject(response,403);
      if(route==='/auth/v1/otp') {
        if(body.create_user!==false)return reject(response,400);
        subject.pendingUntil=at+120000;
        counts.otp++;
        return reject(response,200);
      }
      if(body.token!==code||body.type!=='email'||subject.pendingUntil<=at)return reject(response,400);
      const token='udi-fixture.session.'+randomBytes(24).toString('base64url');
      subject.pendingUntil=0;
      subject.session={token,endsAt:at+expiresIn*1000};
      counts.verify++;
      return send(response,200,{access_token:token,token_type:'bearer',expires_in:expiresIn});
    }

    const search=route==='/api/v1/search'&&method==='POST';
    const saved=route==='/api/v1/saved-searches'&&['GET','PUT','DELETE'].includes(method);
    const accountStatus=route==='/api/v1/fixture/account'&&method==='GET';
    if(!search&&!saved&&!accountStatus)return reject(response,404);
    const token=request.headers.authorization;
    const match=[...accounts].find(([,subject])=>subject.session?.endsAt>at&&'Bearer '+subject.session.token===token);
    if(!match)return reject(response,401);
    const [identity,subject]=match;
    if(accountStatus) {
      const {plan,used,limit}=subject;
      return send(response,200,{test:true,plan,used,limit});
    }
    if(saved) {
      if(method==='GET') {
        counts.list++;
        return send(response,200,{schemaVersion:1,items:saves.list(identity)});
      }
      const entry=readSavedSearch(await readBody(request));
      if(![product,confirmed,unavailable].includes(queryKey(entry.query)))return reject(response,400);
      const action=method==='PUT'?'save':'remove';
      const items=saves[action](identity,entry);
      counts[action]++;
      return send(response,200,{schemaVersion:1,items});
    }

    const {requestId,input}=readServiceRequest(await readBody(request));
    const {marketId,deliveryCountry,currency}=input;
    const query=queryKey(input.query);
    if(query===unavailable) {
      counts.unavailable++;
      return reject(response,503);
    }
    if(subject.used>=subject.limit) {
      counts.quota++;
      return send(response,429,{test:true},{'X-UDI-Limit':'monthly'});
    }
    subject.used++;
    const envelope={schemaVersion:1,requestId,dataMode:'test',marketId,deliveryCountry,currency,criteria:criteriaFor(input)};
    if(![product,confirmed].includes(query))return send(response,200,{...envelope,kind:'clarification'});
    const isConfirmed=query===confirmed;
    counts[isConfirmed?'confirmed':'partial']++;
    return send(response,200,{...envelope,kind:'results',sourceMode:'catalog',
      completedAt:new Date(at).toISOString(),items:[offer(isConfirmed,at)]});
  }

  const server=createServer({requestTimeout:3000,headersTimeout:2000,maxHeaderSize:8192},(request,response)=>{
    void handle(request,response).catch(error=>reject(response,error instanceof SavedSearchLimitError?409:400));
  });
  server.maxConnections=16;
  return {
    listen(localPort=port) {
      return new Promise((resolve,reject)=>{
        server.once('error',reject);
        server.listen(localPort,'127.0.0.1',()=>{
          server.off('error',reject);
          resolve(server.address());
        });
      });
    },
    async close() {
      try {
        await new Promise((resolve,reject)=>server.close(error=>error && error.code!=='ERR_SERVER_NOT_RUNNING'?reject(error):resolve()));
      } finally {saves.close();}
    },
  };
}

if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url) {
  const service=createNativeFixtureService();
  try {
    await service.listen();
    console.log('UDI TEST fixture ready on 127.0.0.1:'+port);
  } catch {
    await service.close();
    console.error('UDI TEST fixture could not listen on 127.0.0.1:'+port);
    process.exitCode=1;
  }
}
