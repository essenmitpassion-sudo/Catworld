import { criteriaFor } from '../src/criteria.mjs';

const webSources = [
  { domain: 'digitec.ch', name: 'Digitec', path: /^\/de\/s1\/product\/[\w-]+-\d+$/ },
  { domain: 'interdiscount.ch', name: 'Interdiscount', path: /^\/de\/product\/[\w-]+-\d+$/ },
  { domain: 'conrad.ch', name: 'Conrad', path: /^\/de\/p\/[\w-]+-\d+\.html$/ },
  { domain: 'ricardo.ch', name: 'Ricardo', path: /^\/de\/a\/[\w-]+-(\d{8,})\/?$/, marketplace: true },
  { domain: 'tutti.ch', name: 'tutti.ch', path: /^\/de\/vi\/(?:[\w-]+\/)*(\d{6,})\/?$/, marketplace: true },
];
const partNumbers = value => [...value.toUpperCase().matchAll(/\b[A-Z]{2,6}-[A-Z0-9]{5,}\b/g)]
  .map(match => match[0]).filter(value => /\d/.test(value));

export class InvalidSearch extends Error {
  name = 'InvalidSearch';
}

export async function discover(input, webSearch) {
  const query = typeof input?.query === 'string' ? input.query.trim() : '';
  const requestedScope = input?.scope;
  if (!query || query.length > 300 || /https?:\/\/|www\./i.test(query)
    || (requestedScope != null && !['component', 'secondhand', 'both'].includes(requestedScope))) {
    throw new InvalidSearch('Gib einen Suchwunsch mit 1 bis 300 Zeichen ein.');
  }
  let criteria;
  try { criteria = criteriaFor({ ...input, query }); } catch (error) { throw new InvalidSearch(error.message); }
  const secondhand = /\b(gebraucht\w*|secondhand|second.hand|refurbished|ricardo|tutti)\b/i.test(query);
  const completePc = /\b(komplett.pc|gaming.pc|desktop.pc|gebraucht\w* (?:gaming[- ]?)?pc|fertig.pc)\b/i.test(query);
  const outcome = /\b(mehr speicher|zu wenig speicher|zu langsam|pc aufrüsten)\b/i.test(query);
  const newOnly = criteria.condition === 'new';
  if (!requestedScope && !secondhand && criteria.condition === 'any' && (outcome || completePc)) {
    return { kind: 'clarification', criteria };
  }
  const scope = newOnly ? 'component' : requestedScope ?? (secondhand || criteria.condition === 'used' ? 'secondhand' : 'component');
  const sources = webSources.filter(source => scope === 'both' || Boolean(source.marketplace) === (scope === 'secondhand'));
  const rows = await webSearch({ query, scope, domains: sources.map(source => source.domain), criteria });
  const items = new Map();
  const [requestedPart] = partNumbers(query);
  for (const row of rows) {
    if (typeof row?.url !== 'string' || typeof row.title !== 'string' || row.url.length > 1000) continue;
    let url;
    try { url = new URL(row.url); } catch { continue; }
    if (url.protocol !== 'https:' || url.username || url.password || url.port) continue;
    const source = sources.find(entry => url.hostname === 'www.' + entry.domain || url.hostname === entry.domain);
    const match = source?.path.exec(url.pathname);
    if (!match) continue;
    url.hostname = 'www.' + source.domain;
    url.hash = '';
    const sellerParams = source.domain === 'digitec.ch'
      ? [...url.searchParams].filter(([key, value]) => ['supplier', 'shid'].includes(key) && /^\d{1,15}$/.test(value))
      : [];
    if (new Set(sellerParams.map(([key]) => key)).size !== sellerParams.length) continue;
    url.search = new URLSearchParams(sellerParams);
    const id = source.marketplace ? source.domain + '/' + match[1] : url.href;
    if (items.has(id)) continue;
    const title = row.title.replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, ' ').trim().slice(0, 200);
    if (!title) continue;
    if (requestedPart) {
      const inTitle = partNumbers(title);
      const evidence = inTitle.length ? inTitle : partNumbers(typeof row.snippet === 'string' ? row.snippet : '');
      if (!evidence.includes(requestedPart)) continue;
    }
    items.set(id, {
      title, url: url.href, source: source.name,
      type: source.marketplace ? 'listing' : 'shop', status: 'unconfirmed',
      ...(requestedPart ? { mpn: requestedPart } : {}),
    });
    if (items.size === 6) break;
  }
  return { kind: 'results', items: [...items.values()], criteria };
}
