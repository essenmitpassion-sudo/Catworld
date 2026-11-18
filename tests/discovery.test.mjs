import test from 'node:test';
import assert from 'node:assert/strict';
import { discover } from '../scripts/discovery.mjs';

const ricardo = 'https://www.ricardo.ch/de/a/gebrauchter-pc-1234567890/';
const tutti = 'https://www.tutti.ch/de/vi/84018795';
const digitec = 'https://www.digitec.ch/de/s1/product/samsung-990-pro-22097721';

test('bedarfsgesteuerte Anfrage fragt für eine sinnvolle Erweiterung nach', async () => {
  const result = await discover({ query: 'Mein PC braucht mehr Speicher' }, () => {
    assert.fail('Anfrage darf noch keinen kostenpflichtigen Suchaufruf auslösen');
  });
  assert.equal(result.kind, 'clarification');
});

test('exakte Produktsuche bleibt bei der gewählten Variante und schliesst Marktplätze aus', async () => {
  const result = await discover({ query: 'Samsung MZ-V9P2T0BW' }, async search => {
    assert.equal(search.query, 'Samsung MZ-V9P2T0BW');
    assert.equal(search.scope, 'component');
    assert(!search.domains.includes('ricardo.ch'));
    return [
      { url: ricardo, title: 'PC' },
      { url: digitec, title: 'Samsung', snippet: 'Herstellernummer MZ-V9P2T0BW' },
      { url: 'https://www.digitec.ch/de/s1/product/samsung-990-pro-heatsink-22097722',
        title: 'Samsung MZ-V9P2T0CW', snippet: 'Ähnliches Modell MZ-V9P2T0BW' },
    ];
  });
  assert.deepEqual(result.items.map(item => item.url), [digitec]);
});

test('ein Wunsch nach Neuware erweitert die Suche ohne Zustimmung nicht', async () => {
  await discover({ query: 'Neuer Gaming-PC, keine gebrauchten Angebote' }, async search => {
    assert.equal(search.scope, 'component');
    assert(!search.domains.includes('ricardo.ch'));
    return [];
  });
});

test('Gebrauchtsuche liefert deduplizierte Direktlinks mit offenem Status', async () => {
  const result = await discover({ query: 'Gebrauchter Gaming-PC unter CHF 650' }, async search => {
    assert.equal(search.scope, 'secondhand');
    assert(search.domains.includes('tutti.ch'));
    return [
      { url: ricardo, title: 'Gebrauchter PC' },
      { url: ricardo + '?utm_source=test', title: 'Dublette' },
      { url: tutti, title: 'Gaming-PC', price: 650, availability: 'active' },
      { url: 'https://www.ricardo.ch/de/c/pc-rechner-39289/', title: 'Kategorie' },
      { url: 'https://www.ricardo.ch.evil.test/de/a/pc-1234567890/', title: 'Fremde Domain' },
      { url: 'https://me@www.tutti.ch/de/vi/84018795', title: 'Anmeldedaten' },
      { url: 'http://127.0.0.1/', title: 'Intern' },
    ];
  });
  assert.deepEqual(result.items.map(item => item.url), [ricardo, tutti]);
  assert.deepEqual(result.items.map(item => item.title), ['Gebrauchter PC', 'Gaming-PC']);
  assert(result.items.every(item => item.status === 'unconfirmed' && !('price' in item)));
});

test('ungültige Eingabe wird vor einem externen Aufruf abgewiesen', async () => {
  for (const input of [null, { query: ' ' }, { query: 'x'.repeat(301) },
    { query: 'https://localhost/test' }, { query: 'PC', scope: 'all-web' },
    { query: 'PC', maxPrice: '-100' }, { query: 'PC', completeCostsOnly: 'false' }]) {
    await assert.rejects(discover(input, () => assert.fail('Externer Aufruf')), { name: 'InvalidSearch' });
  }
});
