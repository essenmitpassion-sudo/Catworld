import {execFile} from 'node:child_process';
import {createHash} from 'node:crypto';
import {constants} from 'node:fs';
import {copyFile,lstat,mkdir,mkdtemp,readFile,realpath,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {basename,dirname,extname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';
import {appFiles} from './public-files.mjs';

const [runtimeDirectory,outputFile,...extra]=process.argv.slice(2);
if(process.platform!=='win32'||!runtimeDirectory||!outputFile||extra.length||extname(outputFile).toLowerCase()!=='.zip') {
  throw new Error('Usage on Windows: node scripts/package-personal-test.mjs <Windows-x64-Node-directory> <output.zip>');
}

const run=promisify(execFile);
const runtime=resolve(runtimeDirectory);
const target=resolve(outputFile);
const executable=join(runtime,'node.exe');
const license=join(runtime,'LICENSE');
for(const path of [executable,license]) {
  if(!(await lstat(path)).isFile()) throw new Error('Expected ordinary Node.js runtime file: '+basename(path));
}
const {stdout}=await run(executable,['-p','[process.platform,process.arch,process.versions.node].join(" ")'],{windowsHide:true});
const version=stdout.trim().match(/^win32 x64 (24\.\d+\.\d+)$/)?.[1];
if(!version) throw new Error('Use the official Windows x64 Node.js 24 release archive.');

const root=fileURLToPath(new URL('../',import.meta.url));
const files=[
  'UDI testen.cmd',
  ...appFiles.filter(([name])=>name!=='observations.json').map(([name])=>'src/'+name),
  ...['try-udi','native-fixture-service','native-fixture-transport','public-files','account-searches','service-contract']
    .map(name=>'scripts/'+name+'.mjs'),
];

const tempRoot=await realpath(tmpdir());
const stage=await mkdtemp(join(tempRoot,'udi-personal-'));
const content=join(stage,'UDI Windows Test');
const archive=join(stage,'udi-personal.zip');
try {
  for(const path of files) {
    const source=join(root,path);
    if(!(await lstat(source)).isFile()) throw new Error('Expected ordinary UDI file: '+path);
    await mkdir(dirname(join(content,path)),{recursive:true});
    await copyFile(source,join(content,path));
  }
  await mkdir(join(content,'runtime'));
  await copyFile(executable,join(content,'runtime','node.exe'));
  await copyFile(license,join(content,'runtime','LICENSE'));
  await writeFile(join(content,'So startest du UDI.txt'),[
    'UDI Windows-Test · x64',
    '',
    'Entpacke die ZIP-Datei vollständig und öffne im entpackten Ordner «UDI testen.cmd».',
    'Lass das Startfenster offen. Falls kein Browser aufgeht, kopiere die dort angezeigte Adresse.',
    'Suche zum Beispiel nach Samsung 990 PRO 2 TB. Melde dich mit plus@udi.test und 123456 an.',
    'Starte danach die Suche. Konten und Angebote sind Testdaten und leben nur solange der Dienst läuft.',
    'Die Laufzeit ist im Paket enthalten. UDI braucht für diesen Test weder ein Konto bei einem KI-Anbieter noch einen API-Schlüssel.',
    '',
    'Node.js '+version+' · Lizenzhinweise unter runtime/LICENSE.',
  ].join('\r\n')+'\r\n');
  await run('tar.exe',['-a','-cf',archive,'-C',stage,basename(content)],{windowsHide:true});
  const sha256=createHash('sha256').update(await readFile(archive)).digest('hex');
  await copyFile(archive,target,constants.COPYFILE_EXCL);
  console.log(JSON.stringify({archive:target,sha256,node:version}));
} finally {
  if(dirname(stage)!==tempRoot||!basename(stage).startsWith('udi-personal-'))throw new Error('Unexpected temporary path');
  await rm(stage,{recursive:true});
}
