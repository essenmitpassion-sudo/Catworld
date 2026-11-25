import {validatePilotConfig} from '../src/pilot-session.mjs';

export function nativePilotProfile(env) {
  if(env.UDI_NATIVE_PILOT!=='1')return {connectSrc:"'none'",meta:''};
  const {authOrigin,publishableKey,approvedOrigin}=validatePilotConfig({
    authOrigin:env.UDI_AUTH_ORIGIN,
    publishableKey:env.UDI_AUTH_PUBLISHABLE_KEY,
    approvedOrigin:env.UDI_PILOT_SEARCH_ORIGIN,
  });
  const connectSrc=authOrigin+' '+approvedOrigin;
  // The validator accepts canonical HTTPS origins and a public key alphabet.
  const meta=`<meta name="udi-native-pilot" data-auth-origin="${authOrigin}" data-publishable-key="${publishableKey}" data-approved-origin="${approvedOrigin}">`;
  return {connectSrc,meta};
}
