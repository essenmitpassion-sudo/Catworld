import {createDealClient} from './deal-client.mjs';

const projectOrigin=/^https:\/\/[a-z0-9]{20}\.supabase\.co$/;
const publishable=/^sb_publishable_[A-Za-z0-9_-]{10,128}$/;
const accessToken=/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const result=kind=>({kind});

async function readConfirmation(response) {
  if (!/^application\/json(?:\s*;|$)/i.test(response.headers.get('content-type')??'') || !response.body) {
    void response.body?.cancel().catch(()=>{});
    throw new Error('Invalid confirmation');
  }
  const reader=response.body.getReader();
  const data=new Uint8Array(65536);
  let length=0;
  try {
    for (;;) {
      const {done,value}=await reader.read();
      if(done)break;
      if(value.length>data.length-length)throw new Error('Invalid confirmation');
      data.set(value,length);
      length+=value.length;
    }
    const {access_token:token,expires_in:expires,token_type:type}=
      JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(data.subarray(0,length)));
    if(type!=='bearer' || typeof token!=='string' || token.length>4096 || !accessToken.test(token)
      || !Number.isSafeInteger(expires) || expires<1 || expires>86400)throw new Error('Invalid confirmation');
    return {token,expires};
  } finally {
    void reader.cancel().catch(()=>{});
    reader.releaseLock();
  }
}

// A pilot session lives only as long as this app instance. The protected API
// independently verifies the token before any account-scoped operation.
export function createPilotSession({authOrigin,publishableKey,approvedOrigin,now=Date.now,fetchImpl=globalThis.fetch}={}) {
  const service=new URL(approvedOrigin);
  if(typeof authOrigin!=='string' || !projectOrigin.test(authOrigin) || typeof publishableKey!=='string' || !publishable.test(publishableKey)
    || service.protocol!=='https:' || service.origin!==approvedOrigin || service.port || approvedOrigin===authOrigin
    || !service.hostname.includes('.') || /^[\d.]+$/.test(service.hostname)
    || /(?:^|\.)(?:localhost|local|internal)$/.test(service.hostname))throw new TypeError('Invalid pilot configuration');

  let lifetime=new AbortController();
  let pendingEmail=null,active=false,session=null;
  const client=createDealClient({endpoint:new URL('/api/v1/search',service).href,approvedOrigin,fetchImpl,now,
    getAccessToken:async()=>session?.token??null});

  async function exchange(path,body,{signal}={}) {
    const owner=lifetime;
    if(active)return result('busy');
    if(signal?.aborted)return result('cancelled');
    active=true;
    const deadline=AbortSignal.timeout(8000);
    const combined=AbortSignal.any([owner.signal,deadline,...(signal?[signal]:[])]);
    const interrupted=()=>result(deadline.aborted && !owner.signal.aborted && !signal?.aborted?'timeout':'cancelled');
    let abort;
    const boundary=new Promise(resolve=>{
      abort=()=>resolve(interrupted());
      combined.addEventListener('abort',abort,{once:true});
    });
    async function send() {
      try {
        const response=await fetchImpl(new URL(path,authOrigin),{method:'POST',redirect:'error',credentials:'omit',
          referrerPolicy:'no-referrer',cache:'no-store',signal:combined,
          headers:{apikey:publishableKey,Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify(body)});
        if(!response.redirected && response.status===200 && path==='/auth/v1/verify')return {kind:'confirmed',...await readConfirmation(response)};
        void response.body?.cancel().catch(()=>{});
        if(response.redirected)return result('unavailable');
        if(response.status===429)return result('busy');
        if(response.status===200)return result('code-requested');
        if([400,401,403,422].includes(response.status))return result(path==='/auth/v1/verify'?'code-rejected':'request-rejected');
        return result('unavailable');
      } catch {
        return combined.aborted?interrupted():result('unavailable');
      }
    }
    try {
      const answer=await Promise.race([send(),boundary]);
      if(combined.aborted)return interrupted();
      if(answer.kind==='code-requested')pendingEmail=body.email;
      if(answer.kind==='confirmed') {
        pendingEmail=null;
        session={token:answer.token,endsAt:now()+answer.expires*1000};
        return result('signed-in');
      }
      return answer;
    } finally {
      combined.removeEventListener('abort',abort);
      if(owner===lifetime)active=false;
    }
  }

  function signOut() {
    lifetime.abort();
    lifetime=new AbortController();
    session=null;
    pendingEmail=null;
    active=false;
  }
  return Object.freeze({
    requestCode(email,options) {
      const address=typeof email==='string'?email.trim():'';
      if(address.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address))return Promise.resolve(result('invalid-email'));
      if(session) {
        if(now()<session.endsAt)return Promise.resolve(result('already-signed-in'));
        signOut();
      }
      return exchange('/auth/v1/otp',{email:address,create_user:false},options);
    },
    verifyCode(code,options) {
      if(!pendingEmail)return Promise.resolve(result('code-required'));
      if(typeof code!=='string' || !/^\d{6}$/.test(code))return Promise.resolve(result('invalid-code'));
      return exchange('/auth/v1/verify',{email:pendingEmail,token:code,type:'email'},options);
    },
    async search(input,{signal}={}) {
      if(!session)return result('authentication-required');
      if(now()>=session.endsAt) {
        signOut();
        return result('authentication-required');
      }
      const owner=lifetime;
      const combined=signal?AbortSignal.any([signal,owner.signal]):owner.signal;
      const answer=await client.search(input,{signal:combined});
      if(owner!==lifetime)return result('cancelled');
      if(['authentication-expired','access-denied'].includes(answer.kind))signOut();
      return answer;
    },
    signOut,
  });
}
