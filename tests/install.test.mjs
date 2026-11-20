import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { appFiles } from '../scripts/public-files.mjs';

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
