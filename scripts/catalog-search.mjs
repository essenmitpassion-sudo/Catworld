import { search } from '../src/deals.mjs';

export async function catalogSearch({ query, domains }) {
  const compact = query.toLowerCase().replace(/[^a-z0-9]/g, '');
  return search(query).filter(product =>
    compact.includes(product.name.toLowerCase().replace(/[^a-z0-9]/g, ''))
      || compact.includes(product.mpn.toLowerCase().replace(/[^a-z0-9]/g, '')))
    .flatMap(product => product.sources
    .filter(source => domains.includes(new URL(source.url).hostname.replace(/^www\./, '')))
    .map(source => ({
      title: product.name + ' · ' + product.variant,
      url: source.url, snippet: product.mpn,
    })));
}
