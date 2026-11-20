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
  currency: 'CHF', stock: 'in-stock', delivery: '2 Werktage', condition: 'Neu',
  deliveryDestination: { country: 'CH', postalCode: '8000' },
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

test('Katalogvergleich und Empfehlung müssen dieselben Kaufkriterien respektieren', () => {
  const alternative = { ...observation, seller: second.seller, url: second.url,
    finalUrl: second.url, price: 21000 };
  for (const criteria of [{ maxTotal: 100 }, { condition: 'used' }]) {
    const result = compare(product, [observation, alternative], now, criteria);
    assert.equal(result.recommendation, null);
    assert(result.offers.every(offer => offer.excluded));
  }
  const passing = compare(product, [observation, alternative], now, { maxTotal: 20000, condition: 'new' });
  assert.equal(passing.offers[0].excluded, false);
});

test('ein Preisvorteil benötigt denselben belegten Zustand und Lieferort', () => {
  const alternative = { ...observation, seller: second.seller, url: second.url, finalUrl: second.url, price: 21000 };
  for (const change of [
    { condition: null }, { condition: 'Gebraucht' }, { condition: 'Generalüberholt' },
    { deliveryDestination: null }, { deliveryDestination: {country:'CH'} },
    { deliveryDestination: {country:'CH',postalCode:'3000'} },
    { deliveryDestination: {country:'DE',postalCode:'8000'} },
  ]) {
    const result = compare(product, [observation, {...alternative,...change}], now);
    assert.equal(result.recommendation, null, JSON.stringify(change));
    assert.equal(result.priceAdvantage, null);
  }
  const result = compare(product, [observation,alternative], now);
  assert.equal(result.priceAdvantage.amount, 1000);
  assert.equal(result.priceAdvantage.status, 'possible');
  assert.equal(result.priceAdvantage.referenceSeller, second.seller);
  assert.equal(result.priceAdvantage.referenceUrl, second.url);
  assert.deepEqual(result.priceAdvantage.deliveryDestination, observation.deliveryDestination);
  assert.equal(Date.parse(result.priceAdvantage.checkedAt), Date.parse(observation.checkedAt));
  assert.equal(result.priceAdvantage.confirmedSavings, undefined);
});

test('Provisionen, UVP, Gleichstand, unvollständige und alte Daten begründen keinen Sparvorteil', () => {
  const alternative = { ...observation, seller: second.seller, url: second.url, finalUrl: second.url, price:21000, commission:999999 };
  const best = {...observation, commission:0};
  assert.equal(compare(product,[best,alternative],now).recommendation.seller,first.seller);
  for(const change of [ {price:20000}, {shipping:null}, {stock:'out-of-stock'}, {checkedAt:'2026-11-17T10:55:00Z'} ]) {
    const result=compare(product,[best,{...alternative,...change}],now);
    assert.equal(result.priceAdvantage,null);
  }
  assert.equal(compare(product,[{...best,listPrice:999999}],now).priceAdvantage,null);
});
