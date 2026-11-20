import { costs } from './costs.mjs';
import { acceptsOffer, withoutBudget } from './criteria.mjs';
export { costFields, isAmount } from './costs.mjs';

export const catalog = [{
  name: 'Samsung 990 PRO',
  variant: '2 TB · ohne Kühlkörper',
  mpn: 'MZ-V9P2T0BW',
  compatibility: 'Für einen M.2-2280-Steckplatz mit NVMe-Unterstützung. PCIe 4.0 für die volle Schnittstellengeschwindigkeit.',
  manufacturer: 'https://www.samsung.com/ch/support/model/MZ-V9P2T0BW/',
  terms: 'samsung 990 pro 2tb ohne kühlkörper ohne heatsink nvme m2 2280 ssd',
  sources: [
    { seller: 'Digitec', url: 'https://www.digitec.ch/de/s1/product/samsung-990-pro-2000-gb-m2-2280-ssd-22097721' },
    { seller: 'Conrad', url: 'https://www.conrad.ch/de/p/samsung-990-pro-2-tb-interne-m-2-pcie-nvme-ssd-2280-pcie-nvme-40-x4-retail-mz-v9p2t0bw-2705384.html' },
    { seller: 'DQ Solutions', url: 'https://www.dq-solutions.ch/de/samsung-2-tb-ssd-990-pro-nvme-m-2-ssd-m-2-hs2011' },
  ],
}];

function tokens(value) {
  return value.toLowerCase().normalize('NFC')
    .replace(/\b2000\s*gb\b/g, '2tb')
    .replace(/(\d+)\s*tb\b/g, '$1tb')
    .replace(/\bm\.2\b/g, 'm2').match(/[\p{L}\d]+/gu) ?? [];
}

export function search(query) {
  const words = tokens(withoutBudget(query));
  return catalog.filter(product => {
    const available = new Set(tokens(product.terms + ' ' + product.mpn));
    return words.length > 0 && words.every(word => available.has(word));
  });
}

export function directLink(url, product) {
  return product.sources.find(source => source.url === url)?.url ?? null;
}

export const maxObservationAge = 5 * 60 * 1000;
const timestamp = value => typeof value === 'string'
  && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(value)
  ? Date.parse(value) : NaN;

export function assess(product, source, observation, now = Date.now()) {
  const result = { ...source, state: 'partial', total: null, observation: null };
  if (!observation) return result;
  if (observation.mpn !== product.mpn || observation.seller !== source.seller
    || observation.url !== source.url || observation.finalUrl !== source.url
    || !directLink(source.url, product)) return { ...result, state: 'unconfirmed' };

  const checkedAt = timestamp(observation.checkedAt);
  if (!Number.isFinite(checkedAt) || checkedAt > now || now - checkedAt >= maxObservationAge) return result;
  if (observation.currency !== 'CHF') return result;
  result.observation = observation;
  if (!['in-stock', 'out-of-stock'].includes(observation.stock)
    || typeof observation.delivery !== 'string' || !observation.delivery.trim()
    || costs(observation).total === null) return result;

  const { total } = costs(observation);
  return { ...result, state: 'verified', total, observation };
}

export function compare(product, observations, now = Date.now(), criteria = {}) {
  const offers = product.sources.map(source => {
    const candidates = observations.filter(row => row?.url === source.url);
    const times = candidates.map(row => timestamp(row.checkedAt));
    const latest = times.reduce((max, time) => Math.max(max, time), -Infinity);
    const newest = candidates.filter((_, index) => times[index] === latest);
    const offer = assess(product, source, newest.length === 1 ? newest[0] : null, now);
    return { ...offer, excluded: !acceptsOffer(offer.observation, criteria) };
  });
  const eligible = offers.filter(offer => !offer.excluded && offer.state === 'verified' && offer.observation.stock === 'in-stock')
    .sort((left, right) => left.total - right.total);
  const bases = eligible.map(offer => {
    const { condition, deliveryDestination: destination } = offer.observation;
    if (!['Neu', 'Gebraucht', 'Generalüberholt', 'Beschädigt'].includes(condition)
      || destination?.country !== 'CH' || typeof destination.postalCode !== 'string'
      || !/^[1-9]\d{3}$/.test(destination.postalCode)) return null;
    return condition + '|' + destination.country + '|' + destination.postalCode;
  });
  const comparisonStatus = eligible.length < 2 ? 'insufficient'
    : bases.some(basis => basis === null) ? 'missing-basis'
    : new Set(bases).size !== 1 ? 'different-basis'
    : eligible[0].total === eligible[1].total ? 'same-price' : 'price-advantage';
  const recommendation = comparisonStatus === 'price-advantage' ? eligible[0] : null;
  const priceAdvantage = recommendation ? {
    status: 'possible', amount: eligible[1].total - recommendation.total,
    referenceSeller: eligible[1].seller, referenceUrl: eligible[1].url,
    referenceTotal: eligible[1].total, offerTotal: recommendation.total,
    condition: recommendation.observation.condition,
    deliveryDestination: { ...recommendation.observation.deliveryDestination },
    checkedAt: new Date(Math.min(...eligible.map(offer => timestamp(offer.observation.checkedAt)))).toISOString(),
    comparedAt: new Date(now).toISOString(),
  } : null;
  return { offers, recommendation, priceAdvantage, comparisonStatus };
}
