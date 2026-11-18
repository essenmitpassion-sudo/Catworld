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
  ],
}];

function tokens(value) {
  return value.toLowerCase().normalize('NFC')
    .replace(/\b2000\s*gb\b/g, '2tb')
    .replace(/(\d+)\s*tb\b/g, '$1tb')
    .replace(/\bm\.2\b/g, 'm2').match(/[\p{L}\d]+/gu) ?? [];
}

export function search(query) {
  const words = tokens(query);
  return catalog.filter(product => {
    const available = new Set(tokens(product.terms + ' ' + product.mpn));
    return words.length > 0 && words.every(word => available.has(word));
  });
}

export function directLink(url, product) {
  return product.sources.find(source => source.url === url)?.url ?? null;
}

export const costFields = [
  ['price', 'Artikelpreis'], ['shipping', 'Versand'], ['taxes', 'Zusätzliche Steuern'],
  ['imports', 'Importkosten'], ['fees', 'Pflichtgebühren'],
];

export const maxObservationAge = 24 * 60 * 60 * 1000;
export const isAmount = value => Number.isSafeInteger(value) && value >= 0 && value <= 100_000_000;
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
    || !costFields.every(([key]) => isAmount(observation[key])) || observation.price === 0) return result;

  const total = costFields.reduce((sum, [key]) => sum + observation[key], 0);
  return { ...result, state: 'verified', total, observation };
}

export function compare(product, observations, now = Date.now()) {
  const offers = product.sources.map(source => {
    const candidates = observations.filter(row => row?.url === source.url);
    const times = candidates.map(row => timestamp(row.checkedAt));
    const latest = times.reduce((max, time) => Math.max(max, time), -Infinity);
    const newest = candidates.filter((_, index) => times[index] === latest);
    return assess(product, source, newest.length === 1 ? newest[0] : null, now);
  });
  const eligible = offers.filter(offer => offer.state === 'verified' && offer.observation.stock === 'in-stock')
    .sort((left, right) => left.total - right.total);
  const recommendation = eligible.length >= 2 && eligible[0].total < eligible[1].total ? eligible[0] : null;
  return { offers, recommendation };
}
