// Copied only into the explicit native fixture build.
export const fixturePilotConfig=Object.freeze({
  authOrigin:'https://udinativefixture0000.supabase.co',
  approvedOrigin:'https://udi-native-fixture.test',
  publishableKey:'sb_publishable_udi_native_fixture',
});
const loopback='http://localhost:4175';
const key='udi.fixture.session.v1';
const accountEndpoint=fixturePilotConfig.approvedOrigin+'/api/v1/fixture/account';
const routes=new Map([
  [fixturePilotConfig.authOrigin+'/auth/v1/otp',['POST']],
  [fixturePilotConfig.authOrigin+'/auth/v1/verify',['POST']],
  [fixturePilotConfig.approvedOrigin+'/api/v1/search',['POST']],
  [fixturePilotConfig.approvedOrigin+'/api/v1/saved-searches',['GET','PUT','DELETE']],
  [accountEndpoint,['GET']],
]);

export function fixtureFetch(bridge) {
  const http=bridge?.Plugins?.CapacitorHttp;
  if(typeof http?.request!=='function')return null;
  return async(address,{method,headers,body,signal})=>{
    signal?.throwIfAborted();
    const virtual=new URL(address);
    if(!routes.get(virtual.href)?.includes(method))throw new Error('Invalid fixture route');
    const fixedUrl=loopback+virtual.pathname;
    const safeHeaders=Object.fromEntries(Object.entries(headers)
      .filter(([name])=>['apikey','accept','content-type','authorization'].includes(name.toLowerCase())));
    const response=await http.request({url:fixedUrl,method,headers:safeHeaders,
      ...(body===undefined?{}:{data:JSON.parse(body)}),
      responseType:'json',connectTimeout:2000,readTimeout:3000,disableRedirects:true});
    signal?.throwIfAborted();
    if(response.url!==fixedUrl || !Number.isInteger(response.status) || response.status<200||response.status>599
      || (response.status>=300&&response.status<400))throw new Error('Invalid fixture response');
    if(virtual.pathname==='/api/v1/search'&&response.status<300&&response.data?.dataMode!=='test') {
      throw new Error('Unmarked fixture data');
    }
    const content=JSON.stringify(response.data);
    if(typeof content!=='string'||new TextEncoder().encode(content).length>65536)throw new Error('Invalid fixture data');
    const responseHeaders=new Headers(response.headers);
    responseHeaders.delete('Content-Length');
    return new Response(content,{status:response.status,headers:responseHeaders});
  };
}

export async function fixturePilotOptions(bridge,now=Date.now) {
  const fetchImpl=fixtureFetch(bridge);
  const prefs=bridge?.Plugins?.Preferences;
  if(!fetchImpl||!['get','set','remove'].every(method=>typeof prefs?.[method]==='function'))return null;
  let writes=Promise.resolve();
  function saveSession(value) {
    const write=writes.then(()=>value===null?prefs.remove({key}):prefs.set({key,value:JSON.stringify(value)}));
    writes=write.catch(()=>{});
    return write;
  }
  async function readAccount(token,signal) {
    const response=await fetchImpl(accountEndpoint,{method:'GET',signal,
      headers:{Accept:'application/json',Authorization:'Bearer '+token}});
    const answer=await response.json();
    if(!response.ok||answer.test!==true||!['free','plus'].includes(answer.plan)
      ||!Number.isSafeInteger(answer.used)||!Number.isSafeInteger(answer.limit)
      ||answer.used<0||answer.used>answer.limit||answer.limit>100)throw new Error('Fixture session rejected');
    const {plan,used,limit}=answer;
    return {test:true,plan,used,limit};
  }
  let restoredSession;
  try {
    const {value}=await prefs.get({key});
    if(value!==null) {
      if(typeof value!=='string'||value.length>200)throw new Error('Invalid fixture session');
      const candidate=JSON.parse(value);
      if(!/^udi-fixture\.session\.[\w-]{32}$/.test(candidate?.token??'')
        || !Number.isSafeInteger(candidate?.endsAt)||candidate.endsAt<=now()||candidate.endsAt>now()+900000) {
        throw new Error('Invalid fixture session');
      }
      await readAccount(candidate.token);
      restoredSession={token:candidate.token,endsAt:candidate.endsAt};
    }
  } catch {
    await saveSession(null).catch(()=>{});
  }
  return {...fixturePilotConfig,fetchImpl,fixture:{restoredSession,saveSession,readAccount},now};
}
