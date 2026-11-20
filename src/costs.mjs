import {activeMarket} from './markets.mjs';
export const costFields = [
  ['price', 'Artikelpreis'], ['shipping', 'Versand'], ['taxes', 'Zusätzliche Steuern'],
  ['imports', 'Importkosten'], ['fees', 'Pflichtgebühren'],
];
export const isAmount = value => Number.isSafeInteger(value) && value >= 0 && value <= 100_000_000;

export function costs(observation) {
  const missing = costFields.filter(([key]) =>
    !isAmount(observation?.[key]) || (key === 'price' && observation[key] === 0))
    .map(([key]) => key);
  if (observation?.currency !== activeMarket.currency || missing.includes('price')) {
    return { total: null, minimum: null, missing };
  }
  const minimum = costFields.reduce((sum, [key]) =>
    sum + (isAmount(observation[key]) ? observation[key] : 0), 0);
  return { total: missing.length ? null : minimum, minimum, missing };
}
