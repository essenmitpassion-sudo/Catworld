import { criteriaFor } from './criteria.mjs';
import {searchContext,legacySearchMarket} from './markets.mjs';

export const searchStorageKey = 'udi.searches.v2';
export const legacySearchStorageKey='udi.searches.v1';
export class SavedSearchLimitError extends Error {
  constructor() {
    super('Du kannst bis zu 20 Suchen speichern. Entferne zuerst eine ältere Suche.');
  }
}

export function normalizeSearch(input) {
  if(Object.hasOwn(input??{},'schemaVersion')&&input.schemaVersion!==2)throw new Error('Dieser gespeicherte Suchauftrag wird nicht unterstützt.');
  if(input?.schemaVersion===2) {
    const fields=['schemaVersion','marketId','deliveryCountry','currency','query','scope','maxPrice','condition','completeCostsOnly'];
    if(fields.some(key=>!Object.hasOwn(input,key))||Object.keys(input).some(key=>!fields.includes(key))
      ||typeof input.maxPrice!=='string'||typeof input.completeCostsOnly!=='boolean'||!['any','new','used'].includes(input.condition)
      ||(input.scope!==null&&!['component','secondhand','both'].includes(input.scope)))throw new Error('Dieser gespeicherte Suchauftrag wird nicht unterstützt.');
  }
  const context=searchContext({...(!Object.hasOwn(input??{},'schemaVersion')?legacySearchMarket:{}),...input});
  const query = typeof input?.query === 'string' ? input.query.trim() : '';
  if (!query || query.length > 300) throw new Error('Der Suchwunsch muss 1 bis 300 Zeichen enthalten.');
  if (input.scope != null && !['component', 'secondhand', 'both'].includes(input.scope)) throw new Error('Ungültiger Suchumfang.');
  const criteria = criteriaFor({ ...input, query });
  return {
    schemaVersion:2,...context,
    query, scope: input.scope ?? null,
    maxPrice: criteria.maxTotal === null ? '' : (criteria.maxTotal / 100).toFixed(2),
    condition: criteria.condition, completeCostsOnly: criteria.completeCostsOnly,
  };
}

export function readSearches(storage) {
  const current=storage.getItem(searchStorageKey);
  const saved = JSON.parse(current ?? storage.getItem(legacySearchStorageKey) ?? '[]');
  if (!Array.isArray(saved) || saved.length > 20) throw new Error('Gespeicherte Suchen konnten nicht gelesen werden.');
  return saved.map(normalizeSearch);
}

function identity(input) {
  return JSON.stringify({ ...input, query: input.query.toLocaleLowerCase('de-CH') });
}

export function storeSearch(storage, input) {
  const entry = normalizeSearch(input);
  const saved = readSearches(storage);
  const same = saved.some(existing => identity(existing) === identity(entry));
  if (!same && saved.length >= 20) throw new SavedSearchLimitError();
  const updated = same ? saved : [...saved, entry];
  storage.setItem(searchStorageKey, JSON.stringify(updated));
  return updated;
}

export function removeSearch(storage, input) {
  const entry = normalizeSearch(input);
  const updated = readSearches(storage).filter(existing => identity(existing) !== identity(entry));
  const legacy=storage.getItem(legacySearchStorageKey);
  let older;
  if(legacy!==null) {
    older=JSON.parse(legacy);
    if(!Array.isArray(older))throw new Error('Gespeicherte Suchen konnten nicht gelesen werden.');
    older=older.filter(existing=>{
      try{return identity(normalizeSearch(existing))!==identity(entry);}catch{return true;}
    });
  }
  storage.setItem(searchStorageKey, JSON.stringify(updated));
  if(older)storage.setItem(legacySearchStorageKey,JSON.stringify(older));
  return updated;
}
