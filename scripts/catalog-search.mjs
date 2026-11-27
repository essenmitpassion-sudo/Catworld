import { search } from '../src/deals.mjs';
import {searchContext} from '../src/markets.mjs';

export async function catalogSearch(input) {
  const {query,domains}=input;
  const {marketId}=searchContext(input);
  return search(query).flatMap(product => product.sources
    .filter(source => source.marketId===marketId && domains.includes(source.sourceId))
    .map(source => ({
      title: product.name + ' · ' + product.variant,
      url: source.url, snippet: product.mpn,
    })));
}
