import './build.mjs';
import {mkdir,copyFile,readFile,writeFile,readdir,lstat} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import {appFiles} from './public-files.mjs';
import {nativeIcons} from './native-icons.mjs';

// Positive asset list; no journals, observations, credentials or Node backend.
const files=appFiles.map(([file])=>file).filter(file=>file!=='observations.json');
const target=new URL('../native-dist/',import.meta.url);
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
for(const file of files)await copyFile(new URL('../dist/'+file,import.meta.url),new URL(file,target));
const path=new URL('index.html',target);
const policy="default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; media-src blob:; connect-src 'none'; manifest-src 'self'; base-uri 'none'; form-action 'none'";
const html=(await readFile(path,'utf8')).replace('<head>','<head>\n<meta name="udi-runtime" content="native">\n<meta http-equiv="Content-Security-Policy" content="'+policy+'">');
if(!html.includes('name="udi-runtime"'))throw new Error('Native runtime marker missing');
await writeFile(path,html);
const run=promisify(execFile),cli=fileURLToPath(new URL('../node_modules/@capacitor/cli/bin/capacitor',import.meta.url));
for(const platform of ['android','ios']) {
  const {stdout}=await run(process.execPath,[cli,'sync',platform],{windowsHide:true,env:{...process.env,CI:'1'}});
  process.stdout.write(stdout);
}
console.log('Prepared identical local UI assets for Android and iOS; no native compilation or service connection claimed.');
