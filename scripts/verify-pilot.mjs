import assert from 'node:assert/strict';
import { execFile as run } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, mkdtemp, lstat } from 'node:fs/promises';
import { resolve, join, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const execFile=promisify(run), root=fileURLToPath(new URL('../',import.meta.url));
const receiptPath=resolve(root,process.argv[2]??'');
assert(receiptPath.startsWith(join(root,'artifacts')+sep)&&/udi-pilot-[a-f0-9]{7}\.json$/.test(receiptPath),'Pass the generated artifacts/udi-pilot-<commit>.json receipt');
const receipt=JSON.parse(await readFile(receiptPath,'utf8'));
assert(/^[a-f0-9]{40}$/.test(receipt.commit));
const archive=receiptPath.replace(/\.json$/,'.tar.gz');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
assert.equal(hash(await readFile(archive)),receipt.sha256,'archive integrity');
const entries=(await execFile('tar',['-tf',archive],{windowsHide:true})).stdout.trim().split(/\r?\n/);
assert(entries.every(path=>!path.startsWith('/')&&!path.includes('..')&&!path.includes('\\')&&Object.hasOwn(receipt.files,path)),'archive only contains the recorded relative files');
assert.deepEqual([...entries].sort(),Object.keys(receipt.files).sort());
const unpacked=await mkdtemp(join(tmpdir(),'udi-pilot-verified-'));
await execFile('tar',['-xzf',archive,'-C',unpacked],{windowsHide:true});
for(const [path,expected]of Object.entries(receipt.files)) {
  const file=resolve(unpacked,path);assert(file.startsWith(unpacked+sep));assert((await lstat(file)).isFile());
  assert.equal(hash(await readFile(file)),expected,path);
}
assert(receipt.files['package-lock.json']&&receipt.files['scripts/serve.mjs']&&receipt.files['dist/manifest.webmanifest']);
assert(process.env.npm_execpath,'Run through npm run pilot:verify');
await execFile(process.execPath,[process.env.npm_execpath,'ci','--ignore-scripts','--no-audit','--no-fund'],{cwd:unpacked,windowsHide:true,maxBuffer:1_048_576});
const {server}=await import(pathToFileURL(join(unpacked,'scripts/serve.mjs')));
const app=server();await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));
try {
  const origin='http://127.0.0.1:'+app.address().port;
  const response=await fetch(origin+'/manifest.webmanifest');assert.equal(response.status,200);
  assert.equal((await response.json()).short_name,'UDI');
  const scan=await fetch(origin+'/api/discovery',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,'Sec-Fetch-Site':'same-origin'},body:JSON.stringify({query:'Samsung 990 PRO 2 TB'})});
  assert.equal(scan.status,200);assert.equal((await scan.json()).items.length,0,'without verifier, no offer is invented');
  console.log(JSON.stringify({commit:receipt.commit,archiveIntegrity:true,unpackedFiles:entries.length,lockfileInstalled:true,backendManifestStatus:200,catalogApiStatus:200,liveSourceCalls:false,unpacked}));
} finally {await new Promise(resolve=>app.close(resolve));}
