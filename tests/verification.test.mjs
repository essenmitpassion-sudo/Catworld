import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectPage, publicAddresses, pageVerifier } from '../scripts/verification.mjs';

const url = 'https://www.ricardo.ch/de/a/gaming-pc-1234567890/';
const now = Date.parse('2026-11-18T10:00:00Z');
const item = { url, source: 'Ricardo', type: 'listing', title: 'Gaming-PC' };
const product = {
  '@type': 'Product', name: 'Gaming-PC', url,
  offers: { '@type': 'Offer', url, availability: 'https://schema.org/InStock',
    priceCurrency: 'CHF', price: '600.00', seller: { name: 'Testverkäufer' },
    itemCondition: 'https://schema.org/UsedCondition' },
};
const html = data => '<html><script type="application/ld+json">' + JSON.stringify(data) + '</script></html>';

test('Preis und Aktivstatus stammen aus der passenden konkreten Angebotsseite', () => {
  const check = inspectPage(item, { status: 200, html: html(product) }, now);
  assert.equal(check.availability, 'active');
  assert.equal(check.price, 60000);
  assert.equal(check.seller, 'Testverkäufer');
  assert.equal(check.condition, 'Gebraucht');
  assert.equal(check.status, 'partial');
  assert.equal(check.total, null);
  assert.equal(check.checkedAt, '2026-11-18T10:00:00.000Z');
});

test('Fehlerseiten, Redirects und Sperren bestätigen kein Angebot', () => {
  for (const status of [301, 302, 403, 404, 410, 429, 500]) {
    const check = inspectPage(item, { status, html: html(product) }, now);
    assert.notEqual(check.availability, 'active');
    assert.equal(check.price, null);
    assert.equal(check.httpStatus, status);
  }
});

test('verkaufte Angebote und fremde Empfehlungen werden nicht als aktiv gelesen', () => {
  const sold = structuredClone(product);
  sold.offers.availability = 'https://schema.org/SoldOut';
  const check = inspectPage(item, { status: 200, html: html([sold, {
    ...product, url: url.replace('1234567890', '9999999999'),
    offers: { ...product.offers, url: url.replace('1234567890', '9999999999') },
  }]) }, now);
  assert.equal(check.availability, 'inactive');
  assert.equal(inspectPage(item, { status: 200, html: html({
    ...product, url: 'https://evil.test/', offers: { ...product.offers, url: 'https://evil.test/' },
  }) }, now).availability, 'unknown');
  assert.equal(inspectPage(item, { status: 200, html: '<p>Der Artikel wurde erfolgreich verkauft</p>' + html(product) }, now).availability, 'inactive');
  assert.equal(inspectPage(item, { status: 200, html: '<p>Nächstes Gebot</p>' + html(product) }, now).price, null);
});

test('fehlende, mehrdeutige und fremdwährungsbasierte Angebotsdaten bleiben offen', () => {
  for (const offers of [
    { ...product.offers, price: 'CHF 600' },
    { ...product.offers, priceCurrency: 'EUR' },
    { ...product.offers, availability: 'https://schema.org/PreOrder' },
    [product.offers, { ...product.offers, price: '999.00' }],
  ]) {
    const check = inspectPage(item, { status: 200, html: html({ ...product, offers }) }, now);
    assert.equal(check.total, null);
    assert.notEqual(check.status, 'verified');
  }
  assert.equal(inspectPage(item, { status: 200, html: '<p>PC an Lager, CHF 100</p>' }, now).availability, 'unknown');
  assert.equal(inspectPage(item, { status: 200, html: html({ ...product,
    offers: [product.offers, { ...product.offers, price: '999.00' }] }) }, now).availability, 'unknown');
});

test('alle DNS-Adressen müssen öffentlich sein, IPv4- und IPv6-Sonderbereiche werden gesperrt', () => {
  assert.equal(publicAddresses([{ address: '93.184.216.34', family: 4 }]), true);
  for (const address of ['127.0.0.1', '169.254.169.254', '10.0.0.1', '0.0.0.0',
    '192.168.1.1', '::1', '::ffff:127.0.0.1', 'fc00::1', '64:ff9b::a9fe:a9fe']) {
    assert.equal(publicAddresses([{ address, family: address.includes(':') ? 6 : 4 }]), false);
  }
  assert.equal(publicAddresses([]), false);
  assert.equal(publicAddresses([{ address: '93.184.216.34', family: 4 }, { address: '10.0.0.1', family: 4 }]), false);
});

test('Quellenfreigabe und konkrete URL werden vor einem Abruf geprüft', async () => {
  assert.equal(pageVerifier([]), null);
  assert.equal(pageVerifier(['evil.test']), null);
  const verify = pageVerifier(['ricardo.ch']);
  for (const address of ['https://www.tutti.ch/de/vi/84018795', url + '?target=evil',
    'http://www.ricardo.ch/de/a/gaming-pc-1234567890/', 'https://www.ricardo.ch/de/c/pc-39289/',
    url.replace('www.ricardo.ch', 'www.ricardo.ch.evil.test')]) {
    const check = await verify({ ...item, url: address });
    assert.equal(check.reason, 'url-rejected');
  }
});

test('Produktzustand und Verkäuferreferenz werden aus derselben DQ-Produktseite aufgelöst', () => {
  const url = 'https://www.dq-solutions.ch/de/samsung-2-tb-ssd-990-pro-nvme-m-2-ssd-m-2-hs2011';
  const check = inspectPage({ url, mpn: 'MZ-V9P2T0BW', source: 'DQ Solutions' }, {
    status: 200, html: html([
      { '@type': 'Store', '@id': 'https://www.dq-solutions.ch/de#organization', name: 'DQ Solutions' },
      { ...product, url, mpn: 'MZ-V9P2T0BW', itemCondition: 'https://schema.org/NewCondition',
        offers: { ...product.offers, url, itemCondition: undefined, seller: { '@id': 'https://www.dq-solutions.ch/de#organization' } } },
    ]),
  }, now);
  assert.equal(check.availability, 'active');
  assert.equal(check.seller, 'DQ Solutions');
  assert.equal(check.condition, 'Neu');
  assert.equal(check.mpn, 'MZ-V9P2T0BW');
});
