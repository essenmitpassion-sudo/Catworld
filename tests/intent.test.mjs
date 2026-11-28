import test from 'node:test';
import assert from 'node:assert/strict';
import { intentFor, addCapacity } from '../src/intent.mjs';

test('Suchkompass preserves the entire user request and separates explicit criteria', () => {
  const query = 'Eine gebrauchte Samsung 990 PRO 2 TB bis CHF 250, Abholung in Bern';
  const intent = intentFor({ query });
  assert.equal(intent.query, query);
  assert.equal(intent.criteria.maxTotal, 25000);
  assert.equal(intent.criteria.condition, 'used');
  assert.equal(intent.question, null);
  assert.deepEqual(intent.suggestions, []);
});

test('one capacity question only for an explicitly requested component with missing capacity', () => {
  for (const query of ['RAM für meinen PC', 'Samsung 990 PRO SSD']) {
    const intent = intentFor({ query });
    assert.match(intent.question.title, /viel/);
    assert(intent.question.options.length <= 4);
  }
  for (const query of ['Mein PC braucht mehr Speicher', 'Ein PC mit 16 GB RAM und SSD', 'RAM 32 GB', 'SSD 2 TB', 'RAM aufrüsten, Kapazität egal']) {
    assert.equal(intentFor({ query }).question, null, query);
  }
});

test('RAM capacity and storage capacity are distinguished, including DDR numbers', () => {
  assert(intentFor({ query: 'DDR5 RAM 6000 MHz' }).question);
  assert(intentFor({ query: 'RAM für PC mit 2 TB SSD' }).question);
  assert.equal(intentFor({ query: 'SSD mit 2 TB für einen PC mit 16 GB RAM' }).question, null);
  assert.equal(intentFor({ query: 'RAM 2 x 16 GB DDR5' }).question, null);
  assert.equal(intentFor({ query: 'RAM mit 32 GB DDR5' }).question, null);
  assert.equal(intentFor({ query: 'Arbeitsspeicher DDR5 2×64 GB' }).question, null);
  const alternatives='RAM 2x38 oder 128gb';
  const intent=intentFor({query:alternatives});
  assert.equal(intent.query,alternatives);
  assert.equal(intent.question,null);
  assert(intentFor({query:'RAM 2x38'}).question);
  assert(intentFor({query:'Arbeitsspeicher'}).question.options.includes('128 GB'));
  assert.equal(intentFor({ query: 'SSD mit 500 GB' }).question, null);
  assert.equal(intentFor({ query: 'Ich brauche 32 GB Arbeitsspeicher' }).question, null);
});

test('accepted capacity suggestions are explicit, retain existing words and respect the input limit', () => {
  assert.equal(addCapacity('RAM für meinen PC', '32 GB'), 'RAM 32 GB für meinen PC');
  assert.equal(addCapacity('Arbeitsspeicher für meinen PC', '128 GB'), 'Arbeitsspeicher 128 GB für meinen PC');
  assert.equal(addCapacity('SSD', '128 GB'), null);
  assert.equal(addCapacity('Samsung 990 PRO SSD', '2 TB'), 'Samsung 990 PRO SSD 2 TB');
  assert.equal(addCapacity('x'.repeat(298), '32 GB'), null);
  assert.equal(addCapacity('RAM', 'http://evil.test'), null);
});
