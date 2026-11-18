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
