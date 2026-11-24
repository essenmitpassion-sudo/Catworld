import { execFile as run } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, writeFile, unlink, lstat, copyFile } from 'node:fs/promises';
import {constants} from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHash,randomUUID } from 'node:crypto';
import { appFiles } from './public-files.mjs';

const execFile=promisify(run);
const root=fileURLToPath(new URL('../',import.meta.url));
const git=async args=>(await execFile('git',args,{cwd:root,windowsHide:true})).stdout.trim();
if(await git(['status','--porcelain'])) throw new Error('Save the reviewed, tested changes in Git before packaging.');
const commit=await git(['rev-parse','HEAD']);
if(!/^[a-f0-9]{40}$/.test(commit))throw new Error('Invalid Git commit');
await import('./build.mjs');
if(await git(['status','--porcelain']))throw new Error('Build updated generated files. Review and commit them before packaging this source identity.');
const dir=new URL('../artifacts/',import.meta.url);await mkdir(dir,{recursive:true});
const key=commit.slice(0,12),archive=new URL('udi-pilot-'+key+'.tar.gz',dir),receipt=new URL('udi-pilot-'+key+'.json',dir);
const exists=async url=>{try{await lstat(url);return true;}catch(error){if(error.code==='ENOENT')return false;throw error;}};
if(await exists(archive)||await exists(receipt)) {
  if(!await exists(archive)||!await exists(receipt))throw new Error('Incomplete backup preserved. Inspect it before creating another package.');
  const saved=JSON.parse(await readFile(receipt,'utf8'));
  const actual=createHash('sha256').update(await readFile(archive)).digest('hex');
  if(saved.commit!==commit||saved.sha256!==actual)throw new Error('Existing backup failed integrity check; it was not overwritten.');
  console.log(JSON.stringify({archive:fileURLToPath(archive),commit,sha256:actual,files:Object.keys(saved.files).length,reused:true,published:false}));
  process.exit(0);
}
const tracked=(await execFile('git',['ls-files','-z'],{cwd:root,windowsHide:true})).stdout.split('\0').filter(Boolean);
const allowed=tracked.filter(path=>/^(?:src\/|scripts\/|public\/|tests\/|docs\/|android\/|ios\/|\.github\/workflows\/|\.gitattributes$|capacitor\.config\.json$|tsconfig\.client\.json$|package\.json$|package-lock\.json$|README\.md$|AGENTS\.md$|PLAN\.md$|STATUS\.md$)/.test(path));
const paths=[...allowed,...appFiles.map(([path])=>'dist/'+path)].sort();
if(paths.some(path=>path.includes('..')||/[\r\n]/.test(path)||/(?:^|\/)(?:\.env[^/]*|node_modules|\.udi)(?:\/|$)/.test(path)||/\.(?:jks|keystore|p12|mobileprovision)$/i.test(path)))throw new Error('Unsafe pilot path');
const list=new URL('pilot-files-'+key+'-'+randomUUID()+'.tmp',dir);
const temporary=new URL('udi-pilot-'+key+'-'+randomUUID()+'.tmp',dir);
const hashes={};
for(const path of paths) {
  const source=new URL('../'+path,import.meta.url);
  if(!(await lstat(source)).isFile())throw new Error('Pilot files must be ordinary files: '+path);
  hashes[path]=createHash('sha256').update(await readFile(source)).digest('hex');
}
await writeFile(list,paths.join('\0')+'\0');
try {
  await execFile('tar',['-czf',fileURLToPath(temporary),'--null','-T',fileURLToPath(list)],{cwd:root,windowsHide:true});
  await copyFile(temporary,archive,constants.COPYFILE_EXCL);
} finally {await unlink(list);await unlink(temporary).catch(error=>{if(error.code!=='ENOENT')throw error;});}
const sha256=createHash('sha256').update(await readFile(archive)).digest('hex');
await writeFile(receipt,JSON.stringify({commit,sha256,files:hashes,scope:'local developer/operator package; no hosted service or native APK/IPA'},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({archive:fileURLToPath(archive),commit,sha256,files:paths.length,includesBackend:true,includesLockfile:paths.includes('package-lock.json'),published:false}));
