import {searchContext} from './markets.mjs';

// At the same source timestamp, a confirmed withdrawal beats an active quote.
const priority = row => row.olderOnly ? 0 : row.stock === 'in-stock' ? 1 : 2;

export function applyChecks(observations, catalog, result) {
  let updated = [...observations];
  if(result.testData===true)return updated;
  try{searchContext(result);}catch{return updated;}
  if (result.kind !== 'results') return updated;
  const productsByUrl = new Map(catalog.flatMap(product => product.sources.map(source => [source.url, product])));
  const sourcesByUrl=new Map(catalog.flatMap(product=>product.sources.map(source=>[source.url,source])));
  function apply(observation) {
    const timestamp = Date.parse(observation.checkedAt);
    if (!Number.isFinite(timestamp)) return;
    if (updated.some(row => row?.url === observation.url && (Date.parse(row.checkedAt) > timestamp
      || (Date.parse(row.checkedAt) === timestamp && priority(row) > priority(observation))))) return;
    updated = updated.filter(row => row?.url !== observation.url);
    updated.push(observation);
  }
  const invalidations = result.invalidations ?? (result.attemptedUrls ?? [])
    .filter(url => !result.items.some(item => item.url === url))
    .map(url => ({ url, checkedAt: result.completedAt ?? new Date().toISOString() }));
  for (const { url, checkedAt, olderOnly } of invalidations) {
    const source = sourcesByUrl.get(url);
    if (source) apply({ url, marketId:source.marketId, sourceId:source.sourceId, checkedAt, ...(olderOnly ? { olderOnly: true } : {}) });
  }
  for (const item of result.items) {
    const product = productsByUrl.get(item.url);
    const source=sourcesByUrl.get(item.url);
    if (!product || item.check?.mpn !== product.mpn || item.check.url !== item.url
      || item.check.marketId!==source.marketId || item.check.sourceId!==source.sourceId) continue;
    apply({ ...item.check, mpn: product.mpn, finalUrl: item.url, stock: 'in-stock' });
  }
  return updated;
}
