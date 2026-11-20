import test from 'node:test';
import assert from 'node:assert/strict';
import { storeSearch, readSearches, removeSearch } from '../src/saved-searches.mjs';

function storage(initial = null) {
  let value = initial;
  return { getItem: () => value, setItem: (_key, data) => { value = data; } };
}

test('Suchwunsch, Budget, Zustand und Gebrauchtoption bleiben nach erneutem Lesen erhalten', () => {
  const local = storage();
  storeSearch(local, { query: 'Gaming-PC bis CHF 650', scope: 'both', condition: 'used', completeCostsOnly: true });
  assert.deepEqual(readSearches(local), [{
    schemaVersion:2,marketId:'CH',deliveryCountry:'CH',currency:'CHF',
    query: 'Gaming-PC bis CHF 650', scope: 'both', maxPrice: '650.00', condition: 'used', completeCostsOnly: true,
  }]);
  storeSearch(local, { query: 'gaming-pc bis CHF 650', scope: 'both', condition: 'used', completeCostsOnly: true });
  assert.equal(readSearches(local).length, 1);
  removeSearch(local, readSearches(local)[0]);
  assert.deepEqual(readSearches(local), []);
});

test('geänderte Kriterien erzeugen einen eigenen Auftrag und Lese- oder Schreibfehler gehen nicht verloren', () => {
  const local = storage();
  storeSearch(local, { query: 'SSD', maxPrice: '100' });
  storeSearch(local, { query: 'SSD', maxPrice: '120' });
  assert.equal(readSearches(local).length, 2);
  assert.throws(() => readSearches(storage('{broken')));
  const corrupt = storage('{}');
  assert.throws(() => storeSearch(corrupt, { query: 'SSD' }));
  assert.equal(corrupt.getItem(), '{}');
  assert.throws(() => storeSearch({ getItem: () => null, setItem: () => { throw new Error('quota'); } }, { query: 'SSD' }), /quota/);
});

test('ein unmögliches Budget darf bestehende gespeicherte Suchen nicht unlesbar machen', () => {
  const local = storage();
  storeSearch(local, { query: 'SSD bis CHF 100' });
  assert.throws(() => storeSearch(local, { query: 'SSD unter CHF 0.01' }));
  const [original] = readSearches(local);
  assert.equal(original.maxPrice, '100.00');
  removeSearch(local, original);
  assert.deepEqual(readSearches(local), []);
});
