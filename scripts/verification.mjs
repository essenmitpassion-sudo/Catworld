import { lookup } from 'node:dns/promises';
import { request } from 'node:https';
import { load } from 'cheerio';
import ipaddr from 'ipaddr.js';

export function publicAddresses(addresses) {
  return addresses.length > 0 && addresses.every(({ address }) => {
    try { return ipaddr.parse(address).range() === 'unicast'; } catch { return false; }
  });
}

const hasType = (node, type) => [node?.['@type']].flat().some(value =>
  value === type || value === 'https://schema.org/' + type || value === 'http://schema.org/' + type);
const schemaName = value => typeof value === 'string'
  ? value.replace(/^https?:\/\/schema\.org\//, '') : '';
const samePage = (value, url) => {
  if (typeof value !== 'string') return false;
  try {
    const candidate = new URL(value, url);
    candidate.hash = '';
    return candidate.href === url;
  } catch { return false; }
};
const plain = value => typeof value === 'string'
  ? value.replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, ' ').trim().slice(0, 160) : null;

function francs(value, currency) {
  if (currency !== 'CHF' || !['number', 'string'].includes(typeof value)) return null;
  const match = /^(\d{1,7})(?:\.(\d{1,2}))?$/.exec(String(value));
  if (!match) return null;
  const amount = Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'));
  return amount > 0 && amount <= 100_000_000 ? amount : null;
}

export function inspectPage(item, page, now = Date.now()) {
  const check = {
    url: item.url, checkedAt: new Date(now).toISOString(), httpStatus: page.status ?? null,
    status: 'unconfirmed', availability: 'unknown', price: null, total: null,
    seller: null, condition: null, reason: 'missing-evidence',
  };
  if ([404, 410].includes(page.status)) return { ...check, availability: 'inactive', reason: 'removed' };
  if (page.status !== 200 || typeof page.html !== 'string') {
    return { ...check, reason: page.reason ?? 'http-error' };
  }
  const $ = load(page.html);
  $('style, nav, footer, noscript').remove();
  const visible = $.root().clone();
  visible.find('script').remove();
  if (/Der Artikel wurde erfolgreich verkauft|Dieser Artikel wurde für CHF [\d.,’' ]+ verkauft|Dieses Inserat ist nicht mehr verfügbar|Dieses Angebot ist reserviert/i.test(visible.text())) {
    return { ...check, availability: 'inactive', reason: 'closed-listing' };
  }
  if (item.source === 'Ricardo' && /Nächstes Gebot/i.test(visible.text())) {
    return { ...check, reason: 'auction-price-unclear' };
  }
  const products = [];
  for (const script of $('script[type="application/ld+json"]').toArray().slice(0, 30)) {
    try {
      const data = JSON.parse($(script).text());
      const nodes = [data].flat().flatMap(node => node?.['@graph'] ?? [node]);
      products.push(...nodes.filter(node => hasType(node, 'Product')));
    } catch { /* Incomplete structured data cannot confirm the offer. */ }
  }
  const matches = products.flatMap(product => {
    const offers = [product.offers].flat().filter(offer => hasType(offer, 'Offer'));
    return offers.filter(offer => samePage(offer.url ?? product.url, item.url))
      .map(offer => ({ product, offer }));
  });
  if (matches.length !== 1) return check;
  const { product, offer } = matches[0];
  if (item.mpn && product.mpn !== item.mpn) return { ...check, reason: 'variant-mismatch' };
  const availability = schemaName(offer.availability);
  if (['SoldOut', 'OutOfStock', 'Discontinued'].includes(availability)) {
    return { ...check, availability: 'inactive', reason: 'not-available' };
  }
  const validUntil = offer.priceValidUntil;
  if (validUntil && (!/^\d{4}-\d{2}-\d{2}$/.test(validUntil)
    || Date.parse(validUntil + 'T23:59:59Z') < now)) return { ...check, reason: 'expired-price' };
  const starts = offer.availabilityStarts;
  const ends = offer.availabilityEnds;
  if ((starts && (!Number.isFinite(Date.parse(starts)) || Date.parse(starts) > now))
    || (ends && (!Number.isFinite(Date.parse(ends)) || Date.parse(ends) <= now))) return check;
  return {
    ...check, status: 'partial', availability: availability === 'InStock' ? 'active' : 'unknown',
    price: francs(offer.price, offer.priceCurrency),
    seller: plain(typeof offer.seller === 'string' ? offer.seller : offer.seller?.name),
    condition: new Map([['UsedCondition', 'Gebraucht'], ['NewCondition', 'Neu'],
      ['RefurbishedCondition', 'Generalüberholt'], ['DamagedCondition', 'Beschädigt']])
      .get(schemaName(offer.itemCondition)) ?? null,
    reason: 'page-data',
  };
}

export function pageVerifier(domains = []) {
  const allowed = new Set(domains.filter(domain => ['ricardo.ch', 'tutti.ch'].includes(domain)));
  if (!allowed.size) return null;
  return async item => {
    const url = new URL(item.url);
    const domain = url.hostname.replace(/^www\./, '');
    const pathMatches = domain === 'ricardo.ch'
      ? /^\/de\/a\/[\w-]+-\d{8,}\/$/.test(url.pathname)
      : /^\/de\/vi\/(?:[\w-]+\/)*\d{6,}\/?$/.test(url.pathname);
    if (!allowed.has(domain) || url.hostname !== 'www.' + domain || url.protocol !== 'https:'
      || url.port || url.username || url.password || url.search || url.hash || !pathMatches) {
      return inspectPage(item, { reason: 'url-rejected' });
    }
    try {
      const signal = AbortSignal.timeout(2500);
      const addresses = await Promise.race([
        lookup(url.hostname, { all: true, verbatim: true }),
        new Promise((_, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true })),
      ]);
      if (!publicAddresses(addresses)) return inspectPage(item, { reason: 'address-rejected' });
      const [address] = addresses;
      const page = await new Promise((resolve, reject) => {
        const req = request(url, {
          method: 'GET', signal, agent: false,
          headers: { 'User-Agent': 'UDI/0.1 (offer verification)', Accept: 'text/html', 'Accept-Encoding': 'identity' },
          lookup: (_hostname, options, callback) => options.all
            ? callback(null, [address]) : callback(null, address.address, address.family),
        }, response => {
          const status = response.statusCode;
          const contentType = response.headers['content-type'] ?? '';
          if (status !== 200 || !contentType.includes('text/html')
            || (response.headers['content-encoding'] && response.headers['content-encoding'] !== 'identity')) {
            response.destroy();
            resolve({ status, reason: status >= 300 && status < 400 ? 'redirect' : 'unsupported-response' });
            return;
          }
          const chunks = [];
          let size = 0;
          response.on('data', chunk => {
            size += chunk.length;
            if (size > 1_048_576) {
              response.destroy(new Error('Page too large'));
              return;
            }
            chunks.push(chunk);
          });
          response.on('end', () => resolve({ status, html: Buffer.concat(chunks).toString('utf8') }));
          response.on('error', reject);
        });
        req.on('error', reject);
        req.end();
      });
      return inspectPage(item, page);
    } catch {
      return inspectPage(item, { reason: 'fetch-failed' });
    }
  };
}
