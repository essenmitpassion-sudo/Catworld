import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile, unlink } from 'node:fs/promises';
import { dirname } from 'node:path';
import { maxObservationAge } from '../src/deals.mjs';
import { costs } from '../src/costs.mjs';
import { acceptsOffer } from '../src/criteria.mjs';

const journals = new Map();

async function saveScan(path, record) {
  const previous = journals.get(path) ?? Promise.resolve();
  const pending = previous.catch(() => {}).then(async () => {
    let history = [];
    try {
      history = JSON.parse(await readFile(path, 'utf8'));
      if (!Array.isArray(history)) throw new Error('Invalid verification history');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    await mkdir(dirname(path), { recursive: true });
    const temporary = path + '.' + randomUUID() + '.tmp';
    try {
      await writeFile(temporary, JSON.stringify([...history.slice(-199), record]), { mode: 0o600 });
      await rename(temporary, path);
    } finally {
      await unlink(temporary).catch(error => {
        if (error.code !== 'ENOENT') throw error;
      });
    }
  });
  journals.set(path, pending);
  try { await pending; } finally {
    if (journals.get(path) === pending) journals.delete(path);
  }
}

export async function scan(discovery, { verify, journalPath, now = Date.now } = {}) {
  if (discovery.kind !== 'results') return discovery;
  const checks = [];
  const items = [];
  let excluded = 0;
  // Bound detail-page requests independently of the number of search results.
  const candidates = discovery.items.slice(0, 3);
  for (const candidate of candidates) {
    let check;
    try { check = await verify?.(candidate); } catch { /* Each source can fail independently. */ }
    const checkedAt = typeof check?.checkedAt === 'string' ? Date.parse(check.checkedAt) : NaN;
    const currentTime = now();
    const current = Number.isFinite(checkedAt) && checkedAt <= currentTime && currentTime - checkedAt < maxObservationAge;
    const record = check ?? {
      url: candidate.url, checkedAt: new Date(currentTime).toISOString(),
      status: 'unconfirmed', availability: 'unknown', reason: 'not-checked',
    };
    checks.push(record);
    if (current && check.url === candidate.url && check.httpStatus === 200 && check.currency === 'CHF'
      && check.availability === 'active' && Number.isSafeInteger(check.price) && check.price > 0
      && check.price <= 100_000_000) {
      const summary = costs(check);
      const criteria = discovery.criteria ?? {};
      if (!acceptsOffer(check, criteria)) {
        excluded++;
        continue;
      }
      items.push({ ...candidate, status: 'partial', check: { ...check, ...summary },
        budgetStatus: criteria.maxTotal == null ? 'none' : summary.total === null ? 'unknown-total' : 'within',
        expiresAt: new Date(checkedAt + maxObservationAge).toISOString() });
    }
  }
  if (journalPath && checks.length) await saveScan(journalPath, {
    id: randomUUID(), completedAt: new Date(now()).toISOString(), checks,
  });
  return { kind: 'results', items, unconfirmed: discovery.items.length - items.length - excluded,
    excluded, criteria: discovery.criteria, attemptedUrls: candidates.map(candidate => candidate.url),
    completedAt: new Date(now()).toISOString() };
}
