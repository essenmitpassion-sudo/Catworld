import test from 'node:test';
import assert from 'node:assert/strict';
import { scan } from '../scripts/scans.mjs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const candidate = { title: 'Gaming-PC', url: 'https://www.ricardo.ch/de/a/gaming-pc-1234567890/', type: 'listing' };
const found = { kind: 'results', items: [candidate] };
const now = Date.parse('2026-11-18T12:00:00Z');
const fresh = {
  url: candidate.url, checkedAt: new Date(now).toISOString(), httpStatus: 200,
  status: 'partial', availability: 'active', price: 50000, total: null,
  currency: 'CHF',
};

test('nur frisch bestätigte und bepreiste Angebote erscheinen im Suchergebnis', async () => {
  for (const check of [null, { ...fresh, availability: 'inactive' }, { ...fresh, availability: 'unknown' },
    { ...fresh, price: null }, { ...fresh, checkedAt: '2026-11-18T11:54:59Z' },
    { ...fresh, checkedAt: '2026-11-19T12:00:00Z' }, { ...fresh, httpStatus: 403 },
    { ...fresh, url: 'https://evil.test/' }, { ...fresh, currency: 'EUR' }]) {
    const result = await scan(found, { verify: async () => check, now: () => now });
    assert.equal(result.items.length, 0);
    assert.equal(result.unconfirmed, 1);
  }
  const result = await scan(found, { verify: async () => fresh, now: () => now });
  assert.equal(result.items[0].check.price, 50000);
  assert.equal(result.items[0].check.total, null);
});

test('Quellenausfälle und ungeprüfte Treffer verhindern keine unabhängig bestätigten Angebote', async () => {
  const result = await scan({ ...found, items: [candidate, { ...candidate, url: candidate.url + '2' }] }, {
    verify: async item => {
      if (item.url !== candidate.url) throw new Error('Quelle ausgefallen');
      return fresh;
    }, now: () => now,
  });
  assert.equal(result.items.length, 1);
  assert.equal(result.unconfirmed, 1);
});

test('Budget und Zustandskriterien gelten für die geprüften Daten', async () => {
  const input = { ...found, criteria: { maxTotal: 50000, condition: 'new', completeCostsOnly: false } };
  for (const change of [{ price: 50001, condition: 'Neu' }, { price: 40000, condition: 'Gebraucht' },
    { price: 40000, condition: null }]) {
    const result = await scan(input, { verify: async () => ({ ...fresh, ...change }), now: () => now });
    assert.equal(result.items.length, 0);
    assert.equal(result.excluded, 1);
  }
  const partial = await scan(input, { verify: async () => ({ ...fresh, condition: 'Neu' }), now: () => now });
  assert.equal(partial.items[0].budgetStatus, 'unknown-total');
  const strict = await scan({ ...input, criteria: { ...input.criteria, completeCostsOnly: true } },
    { verify: async () => ({ ...fresh, condition: 'Neu' }), now: () => now });
  assert.equal(strict.items.length, 0);
});

test('bekannte Versand- und Pflichtkosten können ein vermeintlich passendes Angebot ausschliessen', async () => {
  const result = await scan({ ...found, criteria: { maxTotal: 50500 } }, {
    verify: async () => ({ ...fresh, currency: 'CHF', shipping: 1000, taxes: 0, imports: 0, fees: 0 }),
    now: () => now,
  });
  assert.equal(result.items.length, 0);
  assert.equal(result.excluded, 1);
});

test('Scan-Ergebnisse werden nachvollziehbar und ohne Suchtext gespeichert', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'udi-scan-test-'));
  try {
    const journalPath = join(folder, 'checks.json');
    await Promise.all([scan(found, { verify: async () => fresh, journalPath, now: () => now }),
      scan(found, { verify: async () => ({ ...fresh, availability: 'inactive' }), journalPath, now: () => now })]);
    const saved = JSON.parse(await readFile(journalPath, 'utf8'));
    assert.equal(saved.length, 2);
    assert.equal(saved[0].checks[0].url, candidate.url);
    assert.equal(saved[1].checks[0].availability, 'inactive');
    assert.equal(saved[0].query, undefined);
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
});
