import test from 'node:test';
import assert from 'node:assert/strict';
import { applyChecks } from '../src/observations.mjs';
import { catalog, compare } from '../src/deals.mjs';

const product = catalog[0];
const source = product.sources.find(source => source.seller === 'DQ Solutions');
const check = {
  marketId:source.marketId,sourceId:source.sourceId,
  url: source.url, seller: source.seller, mpn: product.mpn,
  checkedAt: '2026-11-18T12:00:00Z', httpStatus: 200,
  price: 43900, currency: 'CHF', condition: 'Neu', availability: 'active',
};
test('Testantworten verändern weder echte Beobachtungen noch Vergleich und Passport',()=>{
  const previous=[{...check,stock:'in-stock',finalUrl:source.url}];
  for(const items of [[],[{url:source.url,check:{...check,price:100}}]]) {
    const updated=applyChecks(previous,catalog,{kind:'results',testData:true,items,attemptedUrls:[source.url],completedAt:'2026-11-18T12:00:15Z'});
    assert.deepEqual(updated,previous);
    const offer=compare(product,updated,Date.parse('2026-11-18T12:00:16Z')).offers.find(offer=>offer.url===source.url);
    assert.equal(offer.observation.price,43900);
  }
});

test('ein erfolgreicher Live-Check wird im bestehenden Passport aus denselben Fakten dargestellt', () => {
  const observations = applyChecks([], catalog, {
    kind: 'results', attemptedUrls: [source.url],
    items: [{ url: source.url, check }],
    completedAt: '2026-11-18T12:00:01Z',
  });
  const offer = compare(product, observations, Date.parse('2026-11-18T12:00:02Z')).offers.find(offer => offer.url === source.url);
  assert.equal(offer.observation.price, 43900);
  assert.equal(offer.observation.stock, 'in-stock');
  assert.equal(offer.total, null);
});

test('ein späterer gegenteiliger Scan entwertet den vorherigen Preis und Lagerstatus sofort', () => {
  const active = applyChecks([], catalog, {
    kind: 'results', attemptedUrls: [source.url], items: [{ url: source.url, check }],
  });
  const failed = applyChecks(active, catalog, {
    kind: 'results', attemptedUrls: [source.url], items: [],
    completedAt: '2026-11-18T12:00:15Z',
  });
  const offer = compare(product, failed, Date.parse('2026-11-18T12:00:16Z')).offers.find(offer => offer.url === source.url);
  assert.equal(offer.observation, null);
  assert.equal(offer.state, 'unconfirmed');
  assert.equal(offer.total, null);
});

test('ungeprüfte Quellen und nicht betroffene Beobachtungen werden nicht überschrieben', () => {
  const previous = [{ url: product.sources[0].url, price: 20000 }];
  const updated = applyChecks(previous, catalog, {
    kind: 'results', attemptedUrls: ['https://evil.test/'], items: [],
  });
  assert.deepEqual(updated, previous);
  assert.notEqual(updated, previous);
});
