import test from 'node:test';
import assert from 'node:assert/strict';
import { catalogSearch } from '../scripts/catalog-search.mjs';

test('bekannte Produktwünsche erzeugen konkrete Quellen ohne KI-Aufruf und ohne Preisbehauptung', async () => {
  const items = await catalogSearch({ query: 'Samsung 990 PRO 2 TB', domains: ['dq-solutions.ch'] });
  assert.equal(items.length, 1);
  assert.equal(items[0].url, 'https://www.dq-solutions.ch/de/samsung-2-tb-ssd-990-pro-nvme-m-2-ssd-m-2-hs2011');
  assert(items[0].snippet.includes('MZ-V9P2T0BW'));
  assert.equal(items[0].price, undefined);
  assert.equal(items[0].availability, undefined);
});

test('unbekannte Produkte und falsche Varianten erhalten keine erfundenen Katalogtreffer', async () => {
  assert.deepEqual(await catalogSearch({ query: 'Samsung 990 PRO 1 TB', domains: ['dq-solutions.ch'] }), []);
  assert.deepEqual(await catalogSearch({ query: 'Völlig unbekannter Laptop', domains: ['dq-solutions.ch'] }), []);
});

test('ein im Wunsch genanntes Budget verhindert die Katalogzuordnung nicht', async () => {
  const items = await catalogSearch({ query: 'Samsung 990 PRO 2 TB bis CHF 500', domains: ['dq-solutions.ch'] });
  assert.equal(items.length, 1);
});

test('vollständige Suchsätze finden bekannte Modelle und behalten die Variante', async () => {
  for (const query of [
    'Ich suche eine Samsung 990 PRO 2 TB ohne Kühlkörper bis CHF 500.',
    'I am looking for a Samsung 990 PRO 2 TB without a heatsink, up to CHF 500.',
    'Find me a Samsung 990 PRO 2000 GB without heatsink.',
    'Samsung 990 PRO 2 TB (ohne Kühlkörper)',
    'Ohne Kühlkörper: Samsung 990 PRO 2 TB',
    'Ich suche eine Samsung 990 PRO 2 TB (ohne Kühlkörper) bis CHF 500.',
  ]) {
    const items = await catalogSearch({query, domains: ['dq-solutions.ch']});
    assert.deepEqual(items.map(item => item.snippet), ['MZ-V9P2T0BW'], query);
  }
});

test('einzelne Variantenwörter oder ein ausgeschlossener Produktname lösen keine Quellenprüfung aus', async () => {
  for (const query of [
    'I need a -Samsung 990 PRO 2 TB',
    'Samsung 990 PRO 2 TB heatsink',
    'ohne Samsung 990 PRO 2 TB',
    'Ich suche eine Samsung 990 PRO 2 TB mit Kühlkörper.',
    'I need a Samsung 990 PRO 1 TB without a heatsink.',
    'I need a Samsung 990 PRO 2 TB without a heatsink for my PS5.',
    'Samsung 990 PRO 2 TB ohne Kühlkörper mit Kühlkörper',
  ]) {
    assert.deepEqual(await catalogSearch({query, domains: ['dq-solutions.ch']}), [], query);
  }
});

test('explizite Produktmerkmale decken DE und EN ab und lassen unbekannte Anforderungen bindend', async () => {
  const domains=['dq-solutions.ch'];
  const matches=new Map([
    ['Ich suche eine externe SSD 1 TB USB-C bis CHF 350.','MU-PE1T0S/EU'],
    ['I need a 1 TB portable SSD USB-C up to CHF 350.','MU-PE1T0S/EU'],
    ['Samsung 2 TB 990 EVO Plus','MZ-V9S2T0BW'],
    ['MU-PE1T0S/EU','MU-PE1T0S/EU'],
    ['Samsung 990 PRO 2 TB','MZ-V9P2T0BW'],
    ['990 PRO 2 TB ohne Kühlkörper','MZ-V9P2T0BW'],
  ]);
  for (const [query,mpn] of matches) {
    assert.deepEqual((await catalogSearch({query,domains})).map(row=>row.snippet),[mpn],query);
  }
  for (const query of ['externe SSD 2 TB USB-C','external SSD 1 TB Thunderbolt','1 TB SSD',
    'external 1 TB SSD USB-A','external SSD 1 TB USB-C oder 2 TB','MU-PE1T0S/US',
    'external SSD 1 TB USB-C,-Black','external SSD 1 TB USB-C/−Black']) {
    assert.deepEqual(await catalogSearch({query,domains}),[],query);
  }
});
