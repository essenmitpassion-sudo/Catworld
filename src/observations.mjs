import {searchContext} from './markets.mjs';
export function applyChecks(observations, catalog, result) {
  let updated = [...observations];
  try{searchContext(result);}catch{return updated;}
  if (result.kind !== 'results') return updated;
  const productsByUrl = new Map(catalog.flatMap(product => product.sources.map(source => [source.url, product])));
  const sourcesByUrl=new Map(catalog.flatMap(product=>product.sources.map(source=>[source.url,source])));
  for (const url of result.attemptedUrls ?? []) {
    if (!productsByUrl.has(url)) continue;
    updated = updated.filter(row => row?.url !== url);
    // A failed check must also block older data arriving after this response.
    const source=sourcesByUrl.get(url);
    updated.push({ url,marketId:source.marketId,sourceId:source.sourceId,checkedAt: result.completedAt ?? new Date().toISOString() });
  }
  for (const item of result.items) {
    const product = productsByUrl.get(item.url);
    const source=sourcesByUrl.get(item.url);
    if (!product || item.check?.mpn !== product.mpn || item.check.url !== item.url
      || item.check.marketId!==source.marketId || item.check.sourceId!==source.sourceId) continue;
    updated = updated.filter(row => row?.url !== item.url);
    updated.push({ ...item.check, mpn: product.mpn, finalUrl: item.url, stock: 'in-stock' });
  }
  return updated;
}
