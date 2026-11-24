import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { appFiles } from '../scripts/public-files.mjs';
import {inflateSync} from 'node:zlib';

test('Android-Adaptive-Signet bleibt mit transparentem Rand innerhalb der sicheren Maskenzone',async()=>{
  const png=await readFile(new URL('../android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png',import.meta.url));
  assert.equal(png[25],6,'adaptive foreground needs a transparent edge, not a full opaque icon');
  const size=png.readUInt32BE(16),parts=[];
  for(let offset=8;offset<png.length;){const n=png.readUInt32BE(offset);if(png.toString('ascii',offset+4,offset+8)==='IDAT')parts.push(png.subarray(offset+8,offset+8+n));offset+=12+n;}
  const pixels=inflateSync(Buffer.concat(parts));let ink=0;
  for(let y=0;y<size;y++){assert.equal(pixels[y*(size*4+1)],0);for(let x=0;x<size;x++)if(pixels[y*(size*4+1)+1+x*4+3]>8){ink++;assert(Math.hypot((x+.5)/size-.5,(y+.5)/size-.5)<=66/108/2+1/size,'monogram is clipped by common launcher masks');}}
  assert(ink>100,'the safe-zone check must inspect a visible monogram');
});

test('App-Manifest beschreibt denselben Pilot und lokale echte PNG-Symbole', async () => {
  const manifest = JSON.parse(await readFile(new URL('../src/manifest.webmanifest',import.meta.url),'utf8'));
  assert.equal(manifest.display,'standalone');
  assert.equal(manifest.start_url,'./#suche');
  assert.equal(manifest.scope,'./');
  assert.equal(manifest.prefer_related_applications,false);
  for (const size of [192,512]) {
    const icon=manifest.icons.find(icon=>icon.sizes===size+'x'+size);
    assert(icon && icon.src.startsWith('./assets/'));
    const bytes=await readFile(new URL('../src/'+icon.src.slice(2),import.meta.url));
    assert.equal(bytes.subarray(1,4).toString(),'PNG');
    assert.equal(bytes.readUInt32BE(16),size);
    assert.equal(bytes.readUInt32BE(20),size);
    assert(appFiles.some(([path,type])=>path===icon.src.slice(2)&&type==='image/png'));
  }
  assert(appFiles.some(([path,type])=>path==='manifest.webmanifest'&&type==='application/manifest+json'));
});

test('alle ausgelieferten App-Dateien haben eine kontrollierte Quelle und keine Geheimnisse', async () => {
  assert.equal(new Set(appFiles.map(([path])=>path)).size,appFiles.length);
  for (const [path] of appFiles) {
    assert(!path.includes('..')&&!path.startsWith('/')&&!/env|checks\.json|package-lock|node_modules/.test(path));
    await readFile(new URL('../'+(path==='observations.json'?'public/':'src/')+path,import.meta.url));
  }
});
