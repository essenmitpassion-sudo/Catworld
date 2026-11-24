import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {screenRecords,parseScreens} from '../scripts/native-screens.mjs';
// Transport test fixture, not a native application screenshot.
const fixture=await readFile(new URL('../src/assets/udi-192.png',import.meta.url));
test('native PNG-Prüfnachweise überleben Zeitstempel/Logpräfixe bytegleich',()=>{
  const records=screenRecords('android-start',fixture);
  const log=records.map(line=>'2026-11-24T00:00:00Z job\t'+line).join('\n');
  const [screen]=parseScreens(log);assert.equal(screen.label,'android-start');assert.deepEqual(screen.png,fixture);
  assert.equal(screen.width,192);assert.equal(screen.height,192);
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
