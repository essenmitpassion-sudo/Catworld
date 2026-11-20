// Approved market configuration, independent of UI language or native platform.
// A search destination is an intention, never evidence of actual delivery.
export const activeMarket=Object.freeze({id:'CH',country:'CH',deliveryCountry:'CH',currency:'CHF',timeZone:'Europe/Zurich',
  formatLocales:Object.freeze({de:'de-CH',en:'en-CH'})});
export const legacySearchMarket=Object.freeze({marketId:'CH',deliveryCountry:'CH',currency:'CHF'});
export function searchContext(input={}) {
  const marketId=Object.hasOwn(input,'marketId')?input.marketId:activeMarket.id;
  const deliveryCountry=Object.hasOwn(input,'deliveryCountry')?input.deliveryCountry:activeMarket.deliveryCountry;
  const currency=Object.hasOwn(input,'currency')?input.currency:activeMarket.currency;
  if(marketId!==activeMarket.id||deliveryCountry!==activeMarket.deliveryCountry)throw new Error('Dieser Markt oder dieses Lieferland ist noch nicht unterstützt. Deine Suche wurde nicht umgestellt.');
  if(currency!==activeMarket.currency)throw new Error('Der Pilot unterstützt Budgets nur in CHF. Andere Währungen werden nicht automatisch umgerechnet.');
  return {marketId,deliveryCountry,currency};
}
