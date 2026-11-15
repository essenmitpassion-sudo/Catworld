import {lstat,readdir,readFile,realpath,rm} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const MiB=1024*1024;
const generated=new Set([
 'work/browser-results.json','work/counterplay-browser.json','work/counterplay-mobile.png','work/versatz-desktop.png','work/versatz-mobile.png','work/preview-response.html','work/balance-check.json','work/formations.json',
 ...['endgame-probe.json','incremental.json','mobile-counterplay.png','probe.json','route-incremental.json','route-probe.json','route-validation.json','search-benchmark.json'].map(name=>'work/intelligence/'+name),
 ...['active-browser.json','active-direction-mobile.png','comparison.json','incremental.json','motion-feedback.json','new-tactics.json','prior-comparison.json','tension.json','winning-feedback.png'].map(name=>'work/phase2/'+name)
]);
async function info(path){try{return await lstat(path);}catch(error){if(error.code==='ENOENT')return null;throw error;}}
async function inventory(root,relative='work'){
 const stat=await info(join(root,relative));if(!stat||stat.isSymbolicLink())return [];
 if(stat.isFile())return [{path:relative,bytes:stat.size,mtime:stat.mtimeMs}];
 if(!stat.isDirectory())return [];
 const files=[];for(const name of await readdir(join(root,relative)))files.push(...await inventory(root,relative+'/'+name));return files;
}

export async function cleanWorkspace(root,{apply=false,trim=false,now=Date.now(),budgetBytes=16*MiB,cacheBudgetBytes=16*MiB}={}){
 root=await realpath(root);
 if(JSON.parse(await readFile(join(root,'package.json'),'utf8')).name!=='versatz-row-duel')throw new Error('Refusing cleanup outside the VERSATZ project');
 const work=await info(join(root,'work'));if(work?.isSymbolicLink())throw new Error('Refusing cleanup through a symlinked work directory');
 const files=await inventory(root),beforeBytes=files.reduce((sum,f)=>sum+f.bytes,0),selected=new Map();
 const cache=await info(join(root,'work/npm-cache')),cacheFiles=files.filter(f=>f.path.startsWith('work/npm-cache/')),cacheBytes=cacheFiles.reduce((sum,f)=>sum+f.bytes,0);
 if(cache?.isDirectory()&&(!trim||cacheBytes>cacheBudgetBytes))selected.set('work/npm-cache',cacheBytes);
 const expendable=files.filter(f=>generated.has(f.path)||/^work\/(?:(?:intelligence|phase2)\/)?[^/]+\.log$/.test(f.path)).sort((a,b)=>a.mtime-b.mtime||a.path.localeCompare(b.path));
 let remainingBytes=beforeBytes-[...selected.values()].reduce((a,b)=>a+b,0);
 for(const f of expendable)if(!trim||now-f.mtime>7*86400000||remainingBytes>budgetBytes){selected.set(f.path,f.bytes);remainingBytes-=f.bytes;}
 const planned=[...selected.keys()].sort();
 if(apply)for(const relative of planned)await rm(join(root,relative),{recursive:relative==='work/npm-cache',force:true});
 return {planned,beforeBytes,remainingBytes,removedBytes:apply?beforeBytes-remainingBytes:0,overBudget:remainingBytes>budgetBytes};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const flags=process.argv.slice(2);if(flags.some(flag=>!['--apply','--trim'].includes(flag)))throw new Error('Usage: node scripts/clean.mjs [--apply] [--trim]');
 const report=await cleanWorkspace(fileURLToPath(new URL('..',import.meta.url)),{apply:flags.includes('--apply'),trim:flags.includes('--trim')});
 if(!flags.includes('--trim')||report.planned.length||report.overBudget)console.log(JSON.stringify({...report,mode:flags.includes('--apply')?'apply':'dry-run'},null,2));
}
