import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runtimePlatform,discoverOffers,loadObservations} from '../src/runtime.mjs';

test('native Plattformen werden explizit erkannt; unbekannte Brücken bleiben gesperrt',()=>{
  assert.equal(runtimePlatform(null),'web');
  assert.equal(runtimePlatform(null,'native'),'unsupported');
  assert.equal(runtimePlatform({getPlatform:()=> 'web'},'native'),'unsupported');
  for(const name of ['android','ios','web'])assert.equal(runtimePlatform({getPlatform:()=>name}),name);
  assert.equal(runtimePlatform({getPlatform:()=> 'unknown'}),'unsupported');
  assert.equal(runtimePlatform({getPlatform(){throw new Error('broken')}}),'unsupported');
});
test('Android und iOS starten ohne freigegebenen Dienst keine API- oder Snapshot-Abrufe',async()=>{
  for(const platform of ['android','ios','unsupported']) {
    const fetchImpl=()=>assert.fail('No native network fallback is allowed');
    assert.deepEqual(await discoverOffers({query:'Samsung 990 PRO 2 TB'},{platform,fetchImpl}),{kind:'native-unavailable'});
    assert.deepEqual(await loadObservations({platform,fetchImpl}),[]);
  }
});
test('bestehender lokaler Datenpfad bewahrt Origin, Kriterien und Abbruchsignal',async()=>{
  const controller=new AbortController(),input={query:'Samsung 990 PRO 2 TB',maxPrice:'500',condition:'new'};
  const fetchImpl=async(url,options)=>{
    assert.equal(url,'./api/discovery');assert.equal(options.method,'POST');
    assert.equal(options.signal,controller.signal);assert.deepEqual(JSON.parse(options.body),input);
    return {json:async()=>({kind:'results',items:[]})};
  };
  assert.deepEqual(await discoverOffers(input,{platform:'web',fetchImpl,signal:controller.signal}),{kind:'results',items:[]});
});
test('beide native Projekte benutzen lokale Assets ohne Fernnavigation oder Cleartext',async()=>{
  const config=JSON.parse(await readFile(new URL('../capacitor.config.json',import.meta.url),'utf8'));
  assert.equal(config.webDir,'native-dist');assert.equal(config.server.cleartext,false);
  assert.equal(config.server.url,undefined);assert.equal(config.server.allowNavigation,undefined);
  for(const file of ['../android/app/src/main/AndroidManifest.xml','../ios/App/App/Info.plist'])assert((await readFile(new URL(file,import.meta.url),'utf8')).length>0);
});
