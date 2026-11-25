import {isAbsolute,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createAccountQuota,utcMonthlyEntitlement} from './account-quota.mjs';
import {createDailyUpdateHandler,createDailyUpdates} from './daily-updates.mjs';
import {createOfferSearch} from './offer-search.mjs';
import {createSearchService} from './search-service.mjs';
import {pageVerifier} from './verification.mjs';

const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const authError=()=>new Error('Pilot authentication service unavailable');

async function readUser(response) {
  if (!/^application\/json(?:\s*;|$)/i.test(response.headers.get('content-type')??'') || !response.body) {
    await response.body?.cancel();
    throw authError();
  }
  const reader=response.body.getReader();
  const bytes=new Uint8Array(32768);
  let size=0;
  try {
    for (;;) {
      const {done,value}=await reader.read();
      if(done)break;
      if(value.length>bytes.length-size)throw authError();
      bytes.set(value,size);
      size+=value.length;
    }
    const user=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes.subarray(0,size)));
    if(!user || typeof user.id!=='string' || !uuid.test(user.id) || typeof user.role!=='string')throw authError();
    return user;
  } finally {
    void reader.cancel().catch(()=>{});
    reader.releaseLock();
  }
}

function createAuthenticator({authOrigin,publishableKey,allowedAccounts,fetchUser}) {
  const project=typeof authOrigin==='string' && /^https:\/\/([a-z0-9]{20})\.supabase\.co$/.exec(authOrigin)?.[1];
  if(!project || typeof publishableKey!=='string' || !/^sb_publishable_[A-Za-z0-9_-]{10,128}$/.test(publishableKey)
    || !Array.isArray(allowedAccounts) || !allowedAccounts.length
    || allowedAccounts.some(id=>typeof id!=='string' || !uuid.test(id)))throw new Error('Invalid pilot authentication configuration');
  const permitted=new Set(allowedAccounts);
  const endpoint=new URL('/auth/v1/user',authOrigin);
  return async(token,{signal})=>{
    // A personal Supabase JWT has three segments. The provider verifies it.
    if(!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token))return null;
    const authSignal=AbortSignal.any([signal,AbortSignal.timeout(2500)]);
    const response=await fetchUser(endpoint,{method:'GET',signal:authSignal,redirect:'error',credentials:'omit',
      cache:'no-store',headers:{apikey:publishableKey,Authorization:'Bearer '+token,Accept:'application/json'}});
    if(response.status!==200 || response.redirected) {
      void response.body?.cancel().catch(()=>{});
      if(!response.redirected && (response.status===401 || response.status===403))return null;
      throw authError();
    }
    const user=await readUser(response);
    authSignal.throwIfAborted();
    if(user.role!=='authenticated' || user.is_anonymous!==false || typeof user.email_confirmed_at!=='string'
        || !Number.isFinite(Date.parse(user.email_confirmed_at)) || !permitted.has(user.id))return null;
    return 'sb:'+project+':'+user.id;
  };
}

export function createPilotService({authOrigin,publishableKey,allowedAccounts,dataDirectory,fetchUser=fetch,
  verify=pageVerifier(['dq-solutions.ch'])}={}) {
  const authenticate=createAuthenticator({authOrigin,publishableKey,allowedAccounts,fetchUser});
  if(typeof dataDirectory!=='string' || !isAbsolute(dataDirectory))throw new Error('Pilot needs an absolute data directory');
  const search=createOfferSearch({verify});
  const databasePath=join(dataDirectory,'udi-pilot.sqlite');
  const quota=createAccountQuota({databasePath});
  let updates;
  try {
    updates=createDailyUpdates({databasePath});
    const server=createSearchService({authenticate,search,quota,resolveEntitlement:()=>utcMonthlyEntitlement(),
      dailyUpdates:createDailyUpdateHandler({store:updates,authenticate})});
    return {
      server,
      async close() {
        await new Promise((resolve,reject)=>server.close(error=>{
          if(error && error.code!=='ERR_SERVER_NOT_RUNNING')reject(error);
          else resolve();
        }));
        updates.close();
        quota.close();
      },
    };
  } catch(error) {
    updates?.close();
    quota.close();
    throw error;
  }
}

if(process.argv[1] && pathToFileURL(process.argv[1]).href===import.meta.url) {
  try {
    const pilot=createPilotService({
      authOrigin:process.env.UDI_AUTH_ORIGIN,
      publishableKey:process.env.UDI_AUTH_PUBLISHABLE_KEY,
      allowedAccounts:process.env.UDI_PILOT_ACCOUNTS?.split(',').map(value=>value.trim()),
      dataDirectory:process.env.UDI_PILOT_DATA_DIR,
    });
    pilot.server.once('error',async()=>{
      console.error('UDI-Pilot konnte den lokalen Port nicht öffnen.');
      await pilot.close();
      process.exitCode=1;
    });
    pilot.server.listen(4174,'127.0.0.1',()=>console.log('Geschützter UDI-Pilot auf 127.0.0.1:4174'));
  } catch {
    console.error('UDI-Pilot konnte nicht starten. Prüfe die Betreiberkonfiguration in docs/SERVICE.md.');
    process.exitCode=1;
  }
}
