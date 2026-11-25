// Configurable CH product targets, not a verified store price or entitlement.
export const defaultPlanPolicy=Object.freeze({freeSearches:3,plusSearches:25,priceRappen:390,currency:'CHF'});
export function planPolicy(overrides={}) {
  if(!overrides||typeof overrides!=='object'||Array.isArray(overrides)
    ||Object.keys(overrides).some(key=>!Object.hasOwn(defaultPlanPolicy,key)))throw new Error('Invalid plan policy');
  const value={...defaultPlanPolicy,...overrides};
  if(value.currency!=='CHF'||!Number.isSafeInteger(value.priceRappen)||value.priceRappen<1||value.priceRappen>100000000
    ||['freeSearches','plusSearches'].some(key=>!Number.isSafeInteger(value[key])||value[key]<0||value[key]>100000)
    ||value.plusSearches<value.freeSearches)throw new Error('Invalid plan policy');
  return Object.freeze(value);
}
