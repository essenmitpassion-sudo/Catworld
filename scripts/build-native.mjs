import './build.mjs';
import {mkdir,copyFile,readFile,writeFile,readdir,lstat,rm} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import {appFiles} from './public-files.mjs';
import {nativeIcons} from './native-icons.mjs';
import {nativePilotProfile} from './native-pilot-config.mjs';

const profile=nativePilotProfile(process.env);
// Positive asset list; no journals, observations, credentials or Node backend.
const files=appFiles.map(([file])=>file).filter(file=>file!=='observations.json');
const target=new URL('../native-dist/',import.meta.url);
const transport='native-fixture-transport.mjs';
const fixturePlist=new URL('../ios/App/App/Info.fixture.plist',import.meta.url);
if(profile.fixture)files.push(transport);
else await Promise.all([rm(new URL(transport,target),{force:true}),rm(fixturePlist,{force:true})]);
await nativeIcons();
async function validate(directory,prefix='') {
  if((await lstat(directory)).isSymbolicLink())throw new Error('Native assets cannot contain links');
  for(const name of await readdir(directory)) {
    const path=prefix+name,entry=new URL(name,directory),stat=await lstat(entry);
    if(stat.isDirectory()&&path==='assets')await validate(new URL(name+'/',directory),path+'/');
    else if(!stat.isFile()||!files.includes(path))throw new Error('Unexpected native asset: '+path);
  }
}
await mkdir(target,{recursive:true});await validate(target);
await mkdir(new URL('assets/',target),{recursive:true});
for(const file of files) {
  const source=file===transport?new URL(transport,import.meta.url):new URL('../dist/'+file,import.meta.url);
  await copyFile(source,new URL(file,target));
}
if(profile.fixture) {
  const signIn=new URL('pilot-sign-in.mjs',target);
  const original=await readFile(signIn,'utf8');
  const body=original.replace('return createPilotSession(profile.dataset);','return fixtureOptions && createPilotSession(fixtureOptions);');
  if(body===original)throw new Error('Fixture sign-in hook missing');
  await writeFile(signIn,`import {fixturePilotOptions} from './${transport}';\nconst fixtureOptions=await fixturePilotOptions(globalThis.Capacitor);\n`+body);
  const plist=await readFile(new URL('../ios/App/App/Info.plist',import.meta.url),'utf8');
  const patched=plist.replace('<dict>',`<dict>
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsLocalNetworking</key>
        <true/>
    </dict>`);
  if(patched===plist||plist.includes('NSAppTransportSecurity'))throw new Error('Invalid fixture plist source');
  await writeFile(fixturePlist,patched);
}
const path=new URL('index.html',target);
const policy="default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; media-src blob:; connect-src "+profile.connectSrc+"; manifest-src 'self'; base-uri 'none'; form-action 'none'";
const html=(await readFile(path,'utf8')).replace('<html lang="de-CH">','<html lang="de-CH" data-native-ui="">').replace('<head>','<head>\n<meta name="udi-runtime" content="native">\n<meta http-equiv="Content-Security-Policy" content="'+policy+'">\n'+profile.meta);
if(!html.includes('name="udi-runtime"'))throw new Error('Native runtime marker missing');
await writeFile(path,html);
const run=promisify(execFile),cli=fileURLToPath(new URL('../node_modules/@capacitor/cli/bin/capacitor',import.meta.url));
for(const platform of ['android','ios']) {
  const {stdout}=await run(process.execPath,[cli,'sync',platform],{windowsHide:true,env:{...process.env,CI:'1'}});
  process.stdout.write(stdout);
}
console.log('Prepared identical local UI assets for Android and iOS; no native compilation or service connection claimed.');
