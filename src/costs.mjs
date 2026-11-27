import {activeMarket} from './markets.mjs';
export const maxObservationAge = 5 * 60 * 1000;

export const costFields = [
  ['price', 'Artikelpreis'], ['shipping', 'Versand'], ['taxes', 'Zusätzliche Steuern'],
  ['imports', 'Importkosten'], ['fees', 'Pflichtgebühren'],
];
export const isAmount = value => Number.isSafeInteger(value) && value >= 0 && value <= 100_000_000;

export function validDiscount(discount, price) {
  return discount == null || (isAmount(discount) && isAmount(price) && discount <= price);
}

export function costs(observation) {
  const missing = costFields.filter(([key]) =>
    !isAmount(observation?.[key]) || (key === 'price' && observation[key] === 0))
    .map(([key]) => key);
  if (!validDiscount(observation?.discount, observation?.price)) missing.push('discount');
  if (observation?.currency !== activeMarket.currency || missing.includes('price') || missing.includes('discount')) {
    return { total: null, minimum: null, missing };
  }
  const gross = costFields.reduce((sum, [key]) =>
    sum + (isAmount(observation[key]) ? observation[key] : 0), 0);
  const minimum = gross - (observation.discount ?? 0);
  return { total: missing.length ? null : minimum, minimum, missing };
}

export function matchesPriceConfirmation(confirmation, total, destination) {
  return confirmation != null && typeof confirmation === 'object' && !Array.isArray(confirmation)
    && Object.keys(confirmation).length === 4 && ['checkout', 'merchant-quote'].includes(confirmation.kind)
    && isAmount(total) && confirmation.total === total && confirmation.country === activeMarket.deliveryCountry
    && confirmation.country === destination?.country && typeof confirmation.postalCode === 'string'
    && /^[1-9]\d{3}$/.test(confirmation.postalCode) && confirmation.postalCode === destination.postalCode;
}

export function priceStatus(observation, now = Date.now()) {
  const time = typeof observation?.checkedAt === 'string' ? Date.parse(observation.checkedAt) : NaN;
  const { minimum, total } = costs(observation);
  if (minimum === null || !Number.isFinite(time) || time > now || now - time >= maxObservationAge) return 'unverifiable';
  if (total === null) return 'incomplete';
  if (observation.stock !== 'out-of-stock' &&
    matchesPriceConfirmation(observation.priceConfirmation, total, observation.deliveryDestination)) return 'confirmed';
  return 'checked';
}
