export function applyChecks(observations, catalog, result) {
  let updated = [...observations];
  if (result.kind !== 'results') return updated;
  const productsByUrl = new Map(catalog.flatMap(product => product.sources.map(source => [source.url, product])));
  for (const url of result.attemptedUrls ?? []) {
    if (!productsByUrl.has(url)) continue;
    updated = updated.filter(row => row?.url !== url);
    // A failed check must also block older data arriving after this response.
    updated.push({ url, checkedAt: result.completedAt ?? new Date().toISOString() });
  }
  for (const item of result.items) {
    const product = productsByUrl.get(item.url);
    if (!product || item.check?.mpn !== product.mpn || item.check.url !== item.url) continue;
    updated = updated.filter(row => row?.url !== item.url);
    updated.push({ ...item.check, mpn: product.mpn, finalUrl: item.url, stock: 'in-stock' });
  }
  return updated;
}
