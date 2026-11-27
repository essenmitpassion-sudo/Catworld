import {createDealClient} from './deal-client.mjs';
import {normalizeSearch,SavedSearchLimitError} from './saved-searches.mjs';

const projectOrigin=/^https:\/\/[a-z0-9]{20}\.supabase\.co$/;
const publishable=/^sb_publishable_[A-Za-z0-9_-]{10,128}$/;
const accessToken=/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const result=kind=>({kind});

async function readJson(response) {
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
    return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(data.subarray(0,length)));
  } finally {
    void reader.cancel().catch(()=>{});
    reader.releaseLock();
  }
}

async function readConfirmation(response) {
  const {access_token:token,expires_in:expires,token_type:type}=await readJson(response);
  if(type!=='bearer' || typeof token!=='string' || token.length>4096 || !accessToken.test(token)
    || !Number.isSafeInteger(expires) || expires<1 || expires>86400)throw new Error('Invalid confirmation');
  return {token,expires};
}

// A pilot session lives only as long as this app instance. The protected API
// independently verifies the token before any account-scoped operation.
export function validatePilotConfig({authOrigin,publishableKey,approvedOrigin}={}) {
  const service=new URL(approvedOrigin);
  if(typeof authOrigin!=='string' || !projectOrigin.test(authOrigin) || typeof publishableKey!=='string' || !publishable.test(publishableKey)
    || service.protocol!=='https:' || service.origin!==approvedOrigin || service.port || approvedOrigin===authOrigin
    || !service.hostname.includes('.') || /^[\d.]+$/.test(service.hostname)
    || /(?:^|\.)(?:localhost|local|internal)$/.test(service.hostname))throw new TypeError('Invalid pilot configuration');
  return {authOrigin,publishableKey,approvedOrigin};
}

export function createPilotSession({authOrigin,publishableKey,approvedOrigin,now=Date.now,fetchImpl=globalThis.fetch,fixture}={}) {
  validatePilotConfig({authOrigin,publishableKey,approvedOrigin});
  if(fixture && fetchImpl===globalThis.fetch)throw new Error('Fixture requires a separate transport');

  let lifetime=new AbortController();
  let pendingEmail=null,active=false,session=fixture?.restoredSession??null;
  const client=createDealClient({endpoint:new URL('/api/v1/search',approvedOrigin).href,approvedOrigin,fetchImpl,now,
    getAccessToken:async()=>session?.token??null,allowTestData:Boolean(fixture)});

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
        const confirmation={token:answer.token,endsAt:now()+answer.expires*1000};
        if(fixture?.saveSession) {
          try {await fixture.saveSession(confirmation);}
          catch {return result('unavailable');}
          if(combined.aborted) {
            if(owner===lifetime)void fixture.saveSession(null).catch(()=>{});
            return interrupted();
          }
        }
        pendingEmail=null;
        session=confirmation;
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
    void fixture?.saveSession?.(null).catch(()=>{});
    pendingEmail=null;
    active=false;
  }
  async function savedSearches(method,input,{signal}={}) {
    if(!session || now()>=session.endsAt)throw new Error('Melde dich an, um deine gespeicherten Suchen zu sehen.');
    const owner=lifetime;
    const timeout=AbortSignal.timeout(8000);
    const combined=AbortSignal.any([owner.signal,timeout,...(signal?[signal]:[])]);
    combined.throwIfAborted();
    const headers={Accept:'application/json',Authorization:'Bearer '+session.token};
    if(method!=='GET')headers['Content-Type']='application/json';
    const response=await fetchImpl(new URL('/api/v1/saved-searches',approvedOrigin),{
      method,headers,signal:combined,cache:'no-store',credentials:'omit',redirect:'error',referrerPolicy:'no-referrer',
      body:method==='GET'?undefined:JSON.stringify(normalizeSearch(input)),
    });
    if(!response.ok||response.redirected) {
      void response.body?.cancel().catch(()=>{});
      if(!owner.signal.aborted && [401,403].includes(response.status) && !response.redirected)signOut();
      if(response.status===409 && !response.redirected)throw new SavedSearchLimitError();
      throw new Error('Die gespeicherten Suchen konnten nicht synchronisiert werden.');
    }
    const {schemaVersion,items}=await readJson(response);
    combined.throwIfAborted();
    if(schemaVersion!==1||!Array.isArray(items)||items.length>20||items.some(item=>item?.schemaVersion!==2)) {
      throw new Error('Invalid saved searches');
    }
    return items.map(normalizeSearch);
  }
  return Object.freeze({
    isSignedIn:()=>Boolean(session && now()<session.endsAt),
    ...(fixture?.readAccount?{async getFixtureAccount() {
      if(!session || now()>=session.endsAt)return null;
      const owner=lifetime;
      const account=await fixture.readAccount(session.token,owner.signal);
      return owner===lifetime?account:null;
    }}:{}),
    listSearches:options=>savedSearches('GET',null,options),
    saveSearch:(input,options)=>savedSearches('PUT',input,options),
    removeSearch:(input,options)=>savedSearches('DELETE',input,options),
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
