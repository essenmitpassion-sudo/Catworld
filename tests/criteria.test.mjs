import test from 'node:test';
import assert from 'node:assert/strict';
import { criteriaFor } from '../src/criteria.mjs';
import { costs } from '../src/costs.mjs';

test('Schweizer Budgetangaben bleiben präzise, technische Kapazitäten werden nicht zum Budget', () => {
  for (const query of ['Gaming-PC bis CHF 1’500', "Gaming-PC maximal 1'500 Franken",
    'Gebraucht-PC bis 1500 CHF']) assert.equal(criteriaFor({ query }).maxTotal, 150000);
  assert.equal(criteriaFor({ query: 'SSD unter CHF 199.95' }).maxTotal, 19994);
  assert.equal(criteriaFor({ query: 'SSD mit bis zu 2 TB und 32 GB RAM' }).maxTotal, null);
  assert.equal(criteriaFor({ query: 'Gaming-PC bis 650' }).maxTotal, 65000);
  assert.equal(criteriaFor({ query: 'SSD bis CHF 200', maxPrice: '180,50' }).maxTotal, 18050);
  assert.equal(criteriaFor({ query: 'SSD bis CHF 200', completeCostsOnly: true }).completeCostsOnly, true);
  for (const query of ['Gaming-PC Budget CHF 650', 'Gaming-PC bis zu CHF 650', 'Gaming-PC, Budget: 650 CHF']) {
    assert.equal(criteriaFor({ query }).maxTotal, 65000);
  }
});

test('Zustandswünsche und explizite Kriterien werden durchgesetzt', () => {
  assert.equal(criteriaFor({ query: 'PC, nur neu' }).condition, 'new');
  assert.equal(criteriaFor({ query: 'SSD, keine gebrauchten Angebote' }).condition, 'new');
  assert.equal(criteriaFor({ query: 'gebrauchte SSD' }).condition, 'used');
  assert.equal(criteriaFor({ query: 'PC', condition: 'used' }).condition, 'used');
  for (const extra of [{ maxPrice: '-10' }, { maxPrice: '1.234' }, { maxPrice: 'Infinity' },
    { maxPrice: '10e3' }, { condition: 'maybe' }, { completeCostsOnly: 'false' }]) {
    assert.throws(() => criteriaFor({ query: 'SSD', ...extra }));
  }
});

test('Gesamtkosten zählen nur nachweislich bekannte Bestandteile und rechnen in Rappen', () => {
  const complete = { currency: 'CHF', price: 19995, shipping: 995, taxes: 0, imports: 0, fees: 100 };
  assert.equal(costs(complete).total, 21090);
  assert.deepEqual(costs({ ...complete, shipping: null }), {
    total: null, minimum: 20095, missing: ['shipping'],
  });
  assert.equal(costs({ ...complete, currency: 'EUR' }).minimum, null);
  assert.equal(costs({ ...complete, fees: -1 }).total, null);
  assert.equal(costs({ ...complete, price: 0 }).minimum, null);
});
