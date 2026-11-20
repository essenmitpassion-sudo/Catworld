// Platform boundaries are independent of search criteria, language and market.
export function runtimePlatform(bridge=globalThis.Capacitor,bundle=globalThis.document?.querySelector('meta[name=udi-runtime]')?.content) {
  if(bridge==null)return bundle==='native'?'unsupported':'web';
  try {const platform=bridge.getPlatform();return ['android','ios'].includes(platform)?platform:platform==='web'&&bundle!=='native'?'web':'unsupported';}
  catch{return 'unsupported';}
}

// A bundled native UI does not contain the Node service. Until authenticated
// native transport is approved, never fall back to a device-local API or host.
export async function discoverOffers(input,{platform=runtimePlatform(),signal,fetchImpl=globalThis.fetch}={}) {
  if(platform!=='web')return {kind:'native-unavailable'};
  const response=await fetchImpl('./api/discovery',{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input),signal,
  });
  return response.json();
}
export async function loadObservations({platform=runtimePlatform(),signal,fetchImpl=globalThis.fetch}={}) {
  if(platform!=='web')return [];
  const response=await fetchImpl('./observations.json',{cache:'no-store',signal});
  if(!response.ok)throw new Error('Observation data unavailable');
  const rows=await response.json();if(!Array.isArray(rows))throw new Error('Invalid observation data');
  return rows;
}
