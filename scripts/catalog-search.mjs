import { search } from '../src/deals.mjs';
import {searchContext} from '../src/markets.mjs';
import {sources} from './sources.mjs';

const verifiable = new Set(sources.filter(source => source.verifiable).map(source => source.id));

export async function catalogSearch(input) {
  const {query,domains}=input;
  const {marketId}=searchContext(input);
  return search(query).flatMap(product => product.sources
    .filter(source => source.marketId===marketId && domains.includes(source.sourceId))
    .toSorted((left,right) => Number(verifiable.has(right.sourceId)) - Number(verifiable.has(left.sourceId)))
    .map(source => ({
      title: product.name + ' · ' + product.variant,
      url: source.url, snippet: product.mpn,
    })));
}
