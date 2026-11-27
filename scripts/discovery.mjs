import { criteriaFor } from '../src/criteria.mjs';
import { catalog, partNumbers } from '../src/deals.mjs';
import {searchContext} from '../src/markets.mjs';
import { sources as webSources } from './sources.mjs';

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
  const context=searchContext(input);
  const secondhand = /\b(gebraucht\w*|secondhand|second.hand|refurbished|ricardo|tutti|used|pre-owned)\b/i.test(query);
  const completePc = /\b(komplett.pc|gaming.pc|desktop.pc|gebraucht\w* (?:gaming[- ]?)?pc|fertig.pc)\b/i.test(query);
  const outcome = /\b(mehr speicher|zu wenig speicher|zu langsam|pc aufrüsten|more storage|more memory|not enough storage|too slow|upgrade (?:my |a )?pc)\b/i.test(query);
  const newOnly = criteria.condition === 'new';
  if (!requestedScope && !secondhand && criteria.condition === 'any' && (outcome || completePc)) {
    return { kind: 'clarification', criteria,...context };
  }
  const scope = newOnly ? 'component' : requestedScope ?? (secondhand || criteria.condition === 'used' ? 'secondhand' : 'component');
  const sources = webSources.filter(source => source.marketId===context.marketId && (scope === 'both' || Boolean(source.marketplace) === (scope === 'secondhand')));
  const rows = await webSearch({ query, scope, domains: sources.map(source => source.domain), criteria,...context });
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
    const knownProduct = catalog.find(product => product.sources.some(source => source.url === url.href));
    const expectedPart = requestedPart ?? knownProduct?.mpn;
    items.set(id, {
      title, url: url.href, source: source.name,sourceId:source.id,marketId:source.marketId,
      type: source.marketplace ? 'listing' : 'shop', status: 'unconfirmed',
      ...(expectedPart ? { mpn: expectedPart } : {}),
    });
    if (items.size === 6) break;
  }
  return { kind: 'results', items: [...items.values()], criteria,...context };
}
