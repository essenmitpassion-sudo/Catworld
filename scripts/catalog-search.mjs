import { search } from '../src/deals.mjs';
import {searchContext} from '../src/markets.mjs';

export async function catalogSearch(input) {
  const {query,domains}=input;
  const {marketId}=searchContext(input);
  const compact = query.toLowerCase().replace(/[^a-z0-9]/g, '');
  return search(query).filter(product =>
    compact.includes(product.name.toLowerCase().replace(/[^a-z0-9]/g, ''))
      || compact.includes(product.mpn.toLowerCase().replace(/[^a-z0-9]/g, '')))
    .flatMap(product => product.sources
    .filter(source => source.marketId===marketId && domains.includes(source.sourceId))
    .map(source => ({
      title: product.name + ' · ' + product.variant,
      url: source.url, snippet: product.mpn,
    })));
}
