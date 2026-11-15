import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm,access,utimes,symlink,lstat} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {cleanWorkspace} from '../scripts/clean.mjs';
const now=Date.UTC(2026,10,15),day=86400000;
async function fixture(t){const root=await mkdtemp(join(tmpdir(),'versatz-clean-'));t.after(()=>rm(root,{recursive:true,force:true}));await writeFile(join(root,'package.json'),'{"name":"versatz-row-duel"}');return root;}
async function put(root,path,content='keep',age=0){const file=join(root,path);await mkdir(join(file,'..'),{recursive:true});await writeFile(file,content);await utimes(file,new Date(now-age),new Date(now-age));return file;}
async function exists(path){try{await access(path);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}}

test('cleanup dry-run lists expendable output without deleting any bytes',async t=>{
 const root=await fixture(t),file=await put(root,'work/phase2/run.log','trace');
 const report=await cleanWorkspace(root,{now});assert.deepEqual(report.planned,['work/phase2/run.log']);assert.equal(await readFile(file,'utf8'),'trace');assert.equal(report.removedBytes,0);
});
test('explicit cleanup preserves preview, recovery, scripts, unknown data and symlink targets',async t=>{
 const root=await fixture(t);await put(root,'work/phase2/run.log');await put(root,'work/npm-cache/_cacache/data');
 const protectedPaths=['src/source.js','docs/proof.json','.git/objects/value','dist/VERSATZ.html','node_modules/dependency.js','work/preview/versatz-ready.html','work/versatz-final.bundle','work/remote-receipt.json','work/match-examples.json','work/phase2/analysis.mjs','work/unknown.bin','work/unknown.json','work/phase2/unknown.png'];
 for(const path of protectedPaths)await put(root,path);
 const target=await put(root,'outside/important.json','outside');await symlink(target,join(root,'work/phase2/link.json'));await symlink(join(root,'outside'),join(root,'work/intelligence'));
 await cleanWorkspace(root,{apply:true,now});assert.equal(await exists(join(root,'work/phase2/run.log')),false);assert.equal(await exists(join(root,'work/npm-cache')),false);
 for(const path of protectedPaths)assert.equal(await readFile(join(root,path),'utf8'),'keep',path);
 assert.equal(await readFile(target,'utf8'),'outside');assert((await lstat(join(root,'work/phase2/link.json'))).isSymbolicLink());assert((await lstat(join(root,'work/intelligence'))).isSymbolicLink());
});
test('automatic trim removes expired output and oldest excess while retaining recent output',async t=>{
 const root=await fixture(t);await put(root,'work/expired.log','a',8*day);await put(root,'work/phase2/old.log','12345678',2*day);await put(root,'work/phase2/recent.log','12345678',day);
 await cleanWorkspace(root,{apply:true,trim:true,now,budgetBytes:10});assert.equal(await exists(join(root,'work/expired.log')),false);assert.equal(await exists(join(root,'work/phase2/old.log')),false);assert.equal(await exists(join(root,'work/phase2/recent.log')),true);
});
test('automatic trim clears only oversized cache and reports protected budget excess',async t=>{
 const root=await fixture(t),cache=await put(root,'work/npm-cache/data','1234');await put(root,'work/preview/versatz-ready.html','protected-content');
 let report=await cleanWorkspace(root,{apply:true,trim:true,now,cacheBudgetBytes:4,budgetBytes:1});assert.equal(await exists(cache),true);assert.equal(report.overBudget,true);
 report=await cleanWorkspace(root,{apply:true,trim:true,now,cacheBudgetBytes:3,budgetBytes:1});assert.equal(await exists(cache),false);assert.equal(report.overBudget,true);assert.equal(await readFile(join(root,'work/preview/versatz-ready.html'),'utf8'),'protected-content');
});
test('cleanup rejects a symlinked work root before touching its target',async t=>{
 const root=await fixture(t);const target=await put(root,'outside/valuable.log','untouched');await symlink(join(root,'outside'),join(root,'work'));
 await assert.rejects(cleanWorkspace(root,{apply:true,now}),/symlink/i);assert.equal(await readFile(target,'utf8'),'untouched');
});
test('cleanup tolerates absent work and rejects the wrong project',async t=>{
 const root=await fixture(t);assert.equal((await cleanWorkspace(root,{apply:true,now})).remainingBytes,0);await writeFile(join(root,'package.json'),'{"name":"another-project"}');await assert.rejects(cleanWorkspace(root,{apply:true,now}),/VERSATZ/);
});
