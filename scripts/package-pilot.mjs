import { execFile as run } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, writeFile, unlink, lstat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { appFiles } from './public-files.mjs';

const execFile=promisify(run);
const root=fileURLToPath(new URL('../',import.meta.url));
const git=async args=>(await execFile('git',args,{cwd:root,windowsHide:true})).stdout.trim();
if(await git(['status','--porcelain'])) throw new Error('Save the reviewed, tested changes in Git before packaging.');
const commit=await git(['rev-parse','HEAD']);
if(!/^[a-f0-9]{40}$/.test(commit))throw new Error('Invalid Git commit');
await import('./build.mjs');
const tracked=(await execFile('git',['ls-files','-z'],{cwd:root,windowsHide:true})).stdout.split('\0').filter(Boolean);
const allowed=tracked.filter(path=>/^(?:src\/|scripts\/|public\/|tests\/|docs\/|package\.json$|package-lock\.json$|README\.md$|AGENTS\.md$|PLAN\.md$|STATUS\.md$)/.test(path));
const paths=[...allowed,...appFiles.map(([path])=>'dist/'+path)].sort();
if(paths.some(path=>path.includes('..')||/[\r\n]/.test(path)||/(?:^|\/)(?:\.env[^/]*|node_modules|\.udi)(?:\/|$)/.test(path)))throw new Error('Unsafe pilot path');
const dir=new URL('../artifacts/',import.meta.url);await mkdir(dir,{recursive:true});
const archive=new URL('udi-pilot-'+commit.slice(0,7)+'.tar.gz',dir);
const list=new URL('pilot-files.tmp',dir);
const hashes={};
for(const path of paths) {
  const source=new URL('../'+path,import.meta.url);
  if(!(await lstat(source)).isFile())throw new Error('Pilot files must be ordinary files: '+path);
  hashes[path]=createHash('sha256').update(await readFile(source)).digest('hex');
}
await writeFile(list,paths.join('\0')+'\0');
try {await execFile('tar',['-czf',fileURLToPath(archive),'--null','-T',fileURLToPath(list)],{cwd:root,windowsHide:true});}
finally {await unlink(list);}
const sha256=createHash('sha256').update(await readFile(archive)).digest('hex');
await writeFile(new URL('udi-pilot-'+commit.slice(0,7)+'.json',dir),JSON.stringify({commit,sha256,files:hashes,scope:'local developer/operator package; no hosted service or native APK/IPA'},null,2)+'\n');
console.log(JSON.stringify({archive:fileURLToPath(archive),commit,sha256,files:paths.length,includesBackend:true,includesLockfile:paths.includes('package-lock.json'),published:false}));
