import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog, search, directLink, assess, compare } from '../src/deals.mjs';

const product = catalog[0];
const [first, second] = product.sources;
const now = Date.parse('2026-11-17T11:01:00Z');
const observation = {
  mpn: product.mpn, url: first.url, finalUrl: first.url,
  seller: first.seller, checkedAt: '2026-11-17T11:00:00Z',
  price: 20000, shipping: 0, taxes: 0, imports: 0, fees: 0,
  currency: 'CHF', stock: 'in-stock', delivery: '2 Werktage',
};

test('search keeps model variants distinct', () => {
  assert.deepEqual(search('Samsung 990 Pro 2 TB'), [product]);
  assert.deepEqual(search('mz-v9p2t0bw'), [product]);
  assert.deepEqual(search('990 pro 2 tb mit Kühlkörper'), []);
  assert.deepEqual(search('990 pro 1 tb'), []);
  assert.deepEqual(search(''), []);
});

test('direct links admit only the exact editorial product URLs', () => {
  assert.equal(directLink(first.url, product), first.url);
  for (const url of [
    first.url + '?redirect=https://evil.test',
    first.url.replace('https://', 'https://evil.test@'),
    new URL('/', first.url).href,
    'http://127.0.0.1/',
    'javascript:alert(1)',
  ]) assert.equal(directLink(url, product), null);
});

test('only fresh, matching observations with known costs are eligible', () => {
  assert.equal(assess(product, first, observation, now).state, 'verified');
  assert.equal(assess(product, first, { ...observation, shipping: 750 }, now).total, 20750);
  for (const change of [
    { shipping: null }, { fees: -1 }, { currency: 'EUR' },
    { checkedAt: '2026-11-15T11:00:00Z' }, { checkedAt: '2026-11-18T11:00:00Z' },
    { stock: 'unknown' }, { delivery: '' }, { finalUrl: second.url },
    { checkedAt: '2026-11-17T10:56:00Z' },
    { mpn: 'MZ-V9P2T0CW' }, { seller: second.seller },
  ]) assert.notEqual(assess(product, first, { ...observation, ...change }, now).state, 'verified');
  assert.equal(assess(product, first, { ...observation, taxes: null }, now).total, null);
  assert.equal(assess(product, first, { ...observation, taxes: null }, now).observation.price, 20000);
  assert.equal(assess(product, first, null, now).state, 'partial');
});

test('a recommendation compares two eligible sellers by landed cost', () => {
  const alternative = { ...observation, seller: second.seller, url: second.url,
    finalUrl: second.url, price: 19500, shipping: 1000 };
  assert.equal(compare(product, [observation], now).recommendation, null);
  assert.equal(compare(product, [observation, alternative], now).recommendation.seller, first.seller);
  assert.equal(compare(product, [observation, { ...alternative, price: 18000, stock: 'out-of-stock' }], now).recommendation, null);
  assert.equal(compare(product, [observation, { ...alternative, fees: null }], now).recommendation, null);
  assert.equal(compare(product, [observation, alternative, { ...alternative, checkedAt: { toString: null } }], now).recommendation, null);
  assert.equal(compare(product, [observation, alternative, { ...alternative, price: 1 }], now).recommendation, null);
});
