import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFile as execute} from 'node:child_process';
import {promisify} from 'node:util';
import {Writable} from 'node:stream';
import {screenRecords,parseScreens,writeScreen,resultScreenshotName} from '../scripts/native-screens.mjs';
// Transport test fixture, not a native application screenshot.
const fixture=await readFile(new URL('../src/assets/udi-192.png',import.meta.url));

test('XCTest-Bildauswahl exportiert nur den ausdrücklich markierten eigenen PNG-Anhang',()=>{
  // Synthetic metadata only, not an actual xcresult/device screenshot.
  const attachment={suggestedHumanReadableName:'UDI-final-native-screen.png',exportedFileName:'test-screen.png'};
  assert.equal(resultScreenshotName([{attachments:[attachment,{suggestedHumanReadableName:'unrelated.png',exportedFileName:'other.png'}]}]),'test-screen.png');
  for(const file of ['../private.png','sub/image.png','image.jpg','/tmp/private.png','..secret.png'])assert.throws(()=>resultScreenshotName([{attachments:[{...attachment,exportedFileName:file}]}]));
  for(const value of [null,{},[],[{attachments:[]}],[{attachments:[attachment,attachment]}]])assert.throws(()=>resultScreenshotName(value));
});

test('grosse Bildnachweise werden vor einem sofortigen Prozessende vollständig in eine echte Pipe geschrieben',async()=>{
  const script=`import{readFileSync}from'node:fs';import{writeScreen}from'./scripts/native-screens.mjs';
    const png=Buffer.concat([readFileSync('src/assets/udi-192.png'),Buffer.alloc(256*1024,7)]);
    await writeScreen('ios-start',png);process.exit(0);`;
  const {stdout}=await promisify(execute)(process.execPath,['--input-type=module','-e',script],{
    cwd:new URL('../',import.meta.url),windowsHide:true,maxBuffer:2*1024*1024,timeout:10000,
  });
  const [result]=parseScreens(stdout);
  assert(result.png.length>64*1024);assert.deepEqual(result.png,Buffer.concat([fixture,Buffer.alloc(256*1024,7)]));
});

test('Bildtransport wartet auch bei verzögerten Pipe-Schreibbestätigungen auf das vollständige Ende',async()=>{
  const chunks=[];
  const output=new Writable({highWaterMark:16,write(chunk,_encoding,done){setImmediate(()=>{chunks.push(Buffer.from(chunk));done();});}});
  await writeScreen('ios-start',fixture,output);
  const [result]=parseScreens(Buffer.concat(chunks).toString('utf8'));
  assert.deepEqual(result.png,fixture);
});
test('native PNG-Prüfnachweise überleben Zeitstempel/Logpräfixe bytegleich',()=>{
  const records=screenRecords('android-start',fixture);
  const log=records.map(line=>'2026-11-24T00:00:00Z job\t'+line).join('\n');
  const [screen]=parseScreens(log);assert.equal(screen.label,'android-start');assert.deepEqual(screen.png,fixture);
  assert.equal(screen.width,192);assert.equal(screen.height,192);
  assert.equal(parseScreens(screenRecords('ios-flow',fixture).join('\n'))[0].label,'ios-flow');
});
test('fehlende, verdoppelte oder verfälschte Bildteile sind kein gültiger Nachweis',()=>{
  const records=screenRecords('android-start',fixture);
  assert.throws(()=>parseScreens(records.filter((_,index)=>index!==1).join('\n')));
  assert.throws(()=>parseScreens([...records.slice(0,2),records[1],...records.slice(2)].join('\n')));
  assert.throws(()=>parseScreens(records.join('\n').replace(/(UDI_SCREEN_BEGIN android-start )([a-f0-9])/,(_,start,c)=>start+(c==='a'?'b':'a'))));
});
test('Screenshotkanal akzeptiert keine beliebigen Dateinamen, Formate oder riesigen Bildgrössen',()=>{
  assert.throws(()=>screenRecords('../private',fixture));assert.throws(()=>screenRecords('ios-start',Buffer.from('not a PNG')));
  const huge=Buffer.from(fixture);huge.writeUInt32BE(100000,16);assert.throws(()=>screenRecords('ios-start',huge));
  assert.throws(()=>screenRecords('ios-start',Buffer.alloc(1024*1024+1)));
});

test('grössere echte Simulator-PNGs bleiben begrenzt transportierbar statt still verloren zu gehen',()=>{
  // Padded transport fixture only, never a real screenshot or visual acceptance.
  const larger=Buffer.concat([fixture,Buffer.alloc(1536*1024)]);
  assert.deepEqual(parseScreens(screenRecords('ios-flow',larger).join('\n'))[0].png,larger);
  assert.throws(()=>screenRecords('ios-flow',Buffer.concat([fixture,Buffer.alloc(5*1024*1024)])));
});
