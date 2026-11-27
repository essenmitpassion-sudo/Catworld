// @ts-check
import {searchContext} from './markets.mjs';
import {criteriaFor,acceptsOffer} from './criteria.mjs';
import {costs,isAmount} from './costs.mjs';
import {sourceFor} from './sources.mjs';
import {catalog,maxObservationAge,partNumbers} from './deals.mjs';

export const additionalSourcesAccept = 'application/vnd.udi.deals.v1+json; profile=additional-sources';
/** @typedef {import('./deal-types.d.ts').SearchInput} SearchInput */
/** @typedef {import('./deal-types.d.ts').DealReply} DealReply */
/** @typedef {import('./deal-types.d.ts').Offer} Offer */
/** @typedef {import('./deal-types.d.ts').Observation} Observation */
/** @param {unknown} value @returns {Record<string,unknown>} */
function record(value) {if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Invalid record');return /** @type {Record<string,unknown>} */(value);}
/** @param {unknown} value @param {number} [max] */
function text(value,max=200) {if(typeof value!=='string'||!value.trim()||value.length>max||/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/.test(value))throw new Error('Invalid text');return value;}
/** @param {unknown} value */
function stamp(value) {const s=text(value,40);if(!Number.isFinite(Date.parse(s)))throw new Error('Invalid timestamp');return s;}
/** @param {unknown} value @returns {Observation['deliveryDestination']} */
function deliveryDestination(value) {
  if(value==null)return null;
  const destination=record(value);
  if(Object.keys(destination).some(key=>!['country','postalCode'].includes(key))||destination.country!=='CH'
    ||typeof destination.postalCode!=='string'||!/^[1-9]\d{3}$/.test(destination.postalCode))throw new Error('Invalid delivery destination');
  return {country:'CH',postalCode:destination.postalCode};
}
/** @param {SearchInput} input @returns {SearchInput & import('./deal-types.d.ts').SearchContext} */
export function prepareSearch(input) {
  const fields=['query','marketId','deliveryCountry','currency','scope','maxPrice','condition','completeCostsOnly'];
  if(!input||Object.keys(input).some(key=>!fields.includes(key)))throw new Error('Invalid search');
  const query=text(input.query,300).trim();if(/https?:\/\/|www\./i.test(query))throw new Error('No user URLs');
  if(input.scope!=null&&!['component','secondhand','both'].includes(input.scope))throw new Error('Invalid scope');
  criteriaFor({...input,query});
  return {...input,query,.../** @type {import('./deal-types.d.ts').SearchContext} */(searchContext(input))};
}
/** @param {unknown} raw @param {SearchInput} input @param {number} now @param {boolean} allowTestData @param {string} requestId @returns {DealReply} */
export function parseDealReply(raw,input,now,allowTestData,requestId) {
  const data=record(raw),context=searchContext(input),criteria=criteriaFor(input);
  const [requestedMpn]=partNumbers(input.query);
  if(data.requestId!==requestId||data.schemaVersion!==1||!['live','test'].includes(/** @type {string} */(data.dataMode))||(data.dataMode==='test'&&!allowTestData))throw new Error('Unsupported response');
  if(data.marketId!==context.marketId||data.deliveryCountry!==context.deliveryCountry||data.currency!==context.currency)throw new Error('Wrong market');
  const c=record(data.criteria);
  if(c.maxTotal!==criteria.maxTotal||c.condition!==criteria.condition||c.completeCostsOnly!==criteria.completeCostsOnly)throw new Error('Wrong criteria');
  const base={.../** @type {import('./deal-types.d.ts').SearchContext} */(context),criteria,...(data.dataMode==='test'?{testData:/** @type {const} */(true)}:{})};
  if(data.kind==='clarification')return {kind:'clarification',...base};
  if(data.kind!=='results'||!Array.isArray(data.items)||data.items.length>3)throw new Error('Invalid results');
  const completedAt=stamp(data.completedAt);if(Date.parse(completedAt)>now)throw new Error('Future response');
  for(const key of ['unconfirmed','excluded'])if(data[key]!==undefined&&(!Number.isSafeInteger(data[key])||/** @type {number} */(data[key])<0||/** @type {number} */(data[key])>6))throw new Error('Invalid result count');
  if(now-Date.parse(completedAt)>=300000)return {kind:'expired'};
  if(data.sourceMode!==undefined&&!['catalog','web'].includes(/** @type {string} */(data.sourceMode)))throw new Error('Invalid source mode');
  /** @type {Offer[]} */const items=[];const seen=new Set();let stale=0,excluded=0;
  const receivedOfferUrls = new Set();
  for(const rawItem of data.items) {
    const item=record(rawItem),check=record(item.check),url=new URL(text(item.url,1000)),source=sourceFor(url);
    if(!source||url.hash||item.sourceId!==source.id||item.marketId!==context.marketId||item.status!=='partial'||item.type!==('marketplace' in source?'listing':'shop'))throw new Error('Invalid offer source');
    if([...url.searchParams].some(([k,v])=>source.domain!=='digitec.ch'||!['supplier','shid'].includes(k)||!/^\d{1,15}$/.test(v)))throw new Error('Invalid offer URL');
    if(check.url!==url.href||check.sourceId!==source.id||check.marketId!==context.marketId||check.currency!=='CHF'||check.status!=='http-200'||check.productMatch!==true||check.availability!=='active')throw new Error('Unconfirmed offer');
    if(item.mpn!==undefined&&item.mpn!==check.mpn)throw new Error('Wrong variant');
    const knownProduct=catalog.find(product=>product.sources.some(entry=>{
      const known=new URL(entry.url);return known.hostname.replace(/^www\./,'')===url.hostname.replace(/^www\./,'')&&known.pathname===url.pathname;
    }));
    if((requestedMpn&&check.mpn!==requestedMpn)||(knownProduct&&check.mpn!==knownProduct.mpn))throw new Error('Variant does not match request or known URL');
    if(!isAmount(check.price)||check.price===0)throw new Error('Invalid price');
    for(const field of ['shipping','taxes','imports','fees'])if(check[field]!==null&&!isAmount(check[field]))throw new Error('Invalid costs');
    if(!(check.condition===null&&source.id==='shop.mixel.ch')&&!['Neu','Gebraucht','Generalüberholt','Beschädigt'].includes(/** @type {string} */(check.condition)))throw new Error('Invalid condition');
    const checkedAt=stamp(check.checkedAt),expiresAt=stamp(item.expiresAt),checked=Date.parse(checkedAt),expires=Date.parse(expiresAt);
    if(checked>now||expires<=checked||expires>checked+300000)throw new Error('Invalid freshness');
    const summary=costs(check);
    if(check.total!==undefined&&check.total!==summary.total)throw new Error('False total');
    /** @type {Observation} */const observation={url:url.href,marketId:'CH',sourceId:source.id,status:'http-200',productMatch:true,availability:'active',checkedAt,currency:'CHF',
      seller:text(check.seller),condition:/** @type {Observation['condition']} */(check.condition),price:/** @type {number} */(check.price),
      shipping:/** @type {number|null} */(check.shipping),taxes:/** @type {number|null} */(check.taxes),imports:/** @type {number|null} */(check.imports),fees:/** @type {number|null} */(check.fees),
      delivery:check.delivery==null?null:text(check.delivery,500),deliveryDestination:deliveryDestination(check.deliveryDestination),
      total:summary.total,minimum:/** @type {number} */(summary.minimum),missing:summary.missing,
      ...(check.mpn===undefined?{}:{mpn:text(check.mpn,100)})};
    const title=text(item.title),key=url.href;
    receivedOfferUrls.add(url.href);
    if(expires<=now||now-checked>=300000){stale++;continue;}
    if(!acceptsOffer(observation,criteria)){excluded++;continue;}
    if(seen.has(key))continue;seen.add(key);
    items.push({title,url:key,source:source.name,sourceId:source.id,marketId:'CH',type:'marketplace' in source?'listing':'shop',status:'partial',check:observation,expiresAt,
      ...(observation.mpn?{mpn:observation.mpn}:{}),budgetStatus:criteria.maxTotal===null?'none':summary.total===null?'unknown-total':'within'});
  }
  /** @type {import('./deal-types.d.ts').Results['invalidations']} */
  let invalidations;
  if (data.invalidations !== undefined) {
    if (!Array.isArray(data.invalidations) || data.invalidations.length + data.items.length > 3) throw new Error('Invalid source updates');
    invalidations = [];
    const affected = new Set();
    for (const rawCheck of data.invalidations) {
      const check = record(rawCheck);
      const url = text(check.url, 1000);
      const checkedAt = stamp(check.checkedAt);
      const checked = Date.parse(checkedAt), completed = Date.parse(completedAt);
      if ((check.olderOnly !== undefined && check.olderOnly !== true)
        || affected.has(url) || receivedOfferUrls.has(url) || checked > completed || completed - checked >= maxObservationAge
        || !catalog.some(product => product.sources.some(source => source.url === url && source.marketId === context.marketId))) {
        throw new Error('Invalid source update');
      }
      affected.add(url);
      if (now - checked < maxObservationAge) invalidations.push({ url, checkedAt, ...(check.olderOnly ? { olderOnly: true } : {}) });
    }
  }
  if(stale&&!items.length&&!invalidations?.length)return {kind:'expired'};
  return {kind:'results',...base,items,completedAt,unconfirmed:stale+/** @type {number} */(data.unconfirmed??0),excluded:excluded+/** @type {number} */(data.excluded??0),
    ...(invalidations===undefined?{}:{invalidations}),...(data.sourceMode?{sourceMode:/** @type {'catalog'|'web'} */(data.sourceMode)}:{})};
}
