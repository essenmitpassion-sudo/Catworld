import { criteriaFor } from './criteria.mjs';

export const searchStorageKey = 'udi.searches.v1';

export function normalizeSearch(input) {
  const query = typeof input?.query === 'string' ? input.query.trim() : '';
  if (!query || query.length > 300) throw new Error('Der Suchwunsch muss 1 bis 300 Zeichen enthalten.');
  if (input.scope != null && !['component', 'secondhand', 'both'].includes(input.scope)) throw new Error('Ungültiger Suchumfang.');
  const criteria = criteriaFor({ ...input, query });
  return {
    query, scope: input.scope ?? null,
    maxPrice: criteria.maxTotal === null ? '' : (criteria.maxTotal / 100).toFixed(2),
    condition: criteria.condition, completeCostsOnly: criteria.completeCostsOnly,
  };
}

export function readSearches(storage) {
  const saved = JSON.parse(storage.getItem(searchStorageKey) ?? '[]');
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
  if (!same && saved.length >= 20) throw new Error('Du kannst bis zu 20 Suchen speichern. Entferne zuerst eine ältere Suche.');
  const updated = same ? saved : [...saved, entry];
  storage.setItem(searchStorageKey, JSON.stringify(updated));
  return updated;
}

export function removeSearch(storage, input) {
  const entry = normalizeSearch(input);
  const updated = readSearches(storage).filter(existing => identity(existing) !== identity(entry));
  storage.setItem(searchStorageKey, JSON.stringify(updated));
  return updated;
}
