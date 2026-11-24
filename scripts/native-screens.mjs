// Bounded screenshots of disposable CI simulators only. No paid artifact store,
// release upload, real-user screen, recording or credential export.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,mkdir,writeFile,realpath,lstat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,join,sep} from 'node:path';
const labels=new Set(['android-start','ios-start','ios-flow','ios-install-timeout']);
const maximum=1024*1024,chunkSize=4096;
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function metadata(png) {
  assert(Buffer.isBuffer(png)&&png.length>=33&&png.length<=maximum,'Screenshot size invalid');
  assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a','Screenshot must be PNG');
  assert.equal(png.toString('ascii',12,16),'IHDR');
  const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
  assert(width>0&&height>0&&width<=4096&&height<=4096&&width*height<=12000000,'Screenshot dimensions invalid');
  return {width,height,sha256:sha(png)};
}
export function screenRecords(label,png) {
  assert(labels.has(label),'Unknown screenshot label');const info=metadata(png),base64=png.toString('base64');
  const count=Math.ceil(base64.length/chunkSize),lines=[`UDI_SCREEN_BEGIN ${label} ${info.sha256} ${png.length} ${count}`];
  for(let index=0;index<count;index++)lines.push(`UDI_SCREEN_CHUNK ${label} ${index} ${base64.slice(index*chunkSize,(index+1)*chunkSize)}`);
  lines.push(`UDI_SCREEN_END ${label} ${info.sha256}`);return lines;
}
export async function writeScreen(label,png,output=process.stdout) {
  // A native command can block the event loop next. Drain each pipe write
  // before starting it, so a later failure cannot lose buffered image chunks.
  for(const line of screenRecords(label,png))await new Promise((resolve,reject)=>{
    output.write(line+'\n',error=>error?reject(error):resolve());
  });
}
export function parseScreens(log) {
  assert(typeof log==='string'&&Buffer.byteLength(log,'utf8')<=16*1024*1024,'QA log too large');
  const pending=new Map(),finished=new Set(),screens=[];
  for(const line of log.split(/\r?\n/)) {
    const offset=line.indexOf('UDI_SCREEN_');if(offset<0)continue;
    const [type,label,...parts]=line.slice(offset).trim().split(/\s+/);assert(labels.has(label),'Invalid screenshot label');
    if(type==='UDI_SCREEN_BEGIN') {
      assert(!pending.has(label)&&!finished.has(label),'Duplicate screenshot');
      const [digest,size,count]=parts;assert(parts.length===3&&/^[a-f0-9]{64}$/.test(digest)&&/^\d+$/.test(size)&&/^\d+$/.test(count));
      assert(+size>=33&&+size<=maximum&&+count===Math.ceil(Math.ceil(+size/3)*4/chunkSize));
      pending.set(label,{digest,size:+size,count:+count,chunks:[]});
    } else if(type==='UDI_SCREEN_CHUNK') {
      const entry=pending.get(label),[index,data]=parts;
      assert(entry&&parts.length===2&&String(entry.chunks.length)===index&&entry.chunks.length<entry.count);
      assert(data.length<=chunkSize&&/^[A-Za-z0-9+/]+={0,2}$/.test(data));entry.chunks.push(data);
    } else if(type==='UDI_SCREEN_END') {
      const entry=pending.get(label);assert(entry&&parts.length===1&&parts[0]===entry.digest&&entry.chunks.length===entry.count);
      const png=Buffer.from(entry.chunks.join(''),'base64'),info=metadata(png);
      assert(png.length===entry.size&&info.sha256===entry.digest,'Screenshot integrity failed');
      screens.push({label,png,...info});pending.delete(label);finished.add(label);
    } else throw new Error('Invalid screenshot record');
  }
  assert.equal(pending.size,0,'Incomplete screenshot');return screens;
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const root=fileURLToPath(new URL('../',import.meta.url)),logPath=resolve(process.argv[2]??''),key=process.argv[3];
  assert(logPath.startsWith(resolve(root,'artifacts')+sep),'Use a local QA log inside artifacts');
  assert(/^[a-f0-9]{7,40}-\d{1,20}$/.test(key??''),'Use source commit and numeric job ID');
  const input=await lstat(logPath);assert(input.isFile()&&input.size<=16*1024*1024,'QA log must be a bounded ordinary file');
  assert((await realpath(logPath)).startsWith((await realpath(root))+sep),'QA log escapes workspace');
  const screens=parseScreens(await readFile(logPath,'utf8'));assert(screens.length,'No complete native screenshots');
  const target=join(root,'artifacts','native-qa',key);await mkdir(target,{recursive:true});
  assert((await realpath(target)).startsWith((await realpath(root))+sep),'Screenshot directory escapes workspace');
  const receipts=[];
  for(const {png,...info} of screens) {
    const file=join(target,info.label+'.png');
    try {await writeFile(file,png,{flag:'wx'});}catch(error){if(error.code!=='EEXIST')throw error;assert((await lstat(file)).isFile(),'Existing screenshot is not an ordinary file');assert.equal(sha(await readFile(file)),info.sha256,'Existing screenshot preserved, hashes differ');}
    receipts.push({...info,file});
  }
  console.log(JSON.stringify({scope:'decoded PNG records; source, job and screen provenance require independent verification',key,screens:receipts}));
}
