import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile, unlink } from 'node:fs/promises';
import { dirname } from 'node:path';
import { catalog, maxObservationAge } from '../src/deals.mjs';
import { costs } from '../src/costs.mjs';
import { acceptsOffer } from '../src/criteria.mjs';
import {activeMarket,searchContext} from '../src/markets.mjs';
import {sourceFor} from './sources.mjs';

const journals = new Map();
const interruptedChecks = new Set([
  'fetch-failed', 'source-cooldown', 'address-rejected', 'redirect', 'unsupported-response', 'missing-evidence',
]);
const negativeEvidence = new Set(['variant-mismatch', 'expired-price']);

function sourceFailed({ httpStatus, reason }) {
  return interruptedChecks.has(reason) || httpStatus === 403 || httpStatus === 429
    || (httpStatus >= 500 && httpStatus < 600);
}

async function saveScan(path, record, signal) {
  const previous = journals.get(path) ?? Promise.resolve();
  const pending = previous.catch(() => {}).then(async () => {
    signal?.throwIfAborted();
    let history = [];
    try {
      history = JSON.parse(await readFile(path, 'utf8'));
      if (!Array.isArray(history)) throw new Error('Invalid verification history');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    signal?.throwIfAborted();
    await mkdir(dirname(path), { recursive: true });
    signal?.throwIfAborted();
    const temporary = path + '.' + randomUUID() + '.tmp';
    try {
      await writeFile(temporary, JSON.stringify([...history.slice(-199), record]), { mode: 0o600, signal });
      signal?.throwIfAborted();
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

export async function scan(discovery, { verify, journalPath, now = Date.now, signal } = {}) {
  signal?.throwIfAborted();
  if (discovery.kind !== 'results') return discovery;
  const context=searchContext(discovery);
  const checks = [];
  const invalidations = [];
  const items = [];
  let excluded = 0;
  let interrupted = false;
  let evidence = false;
  // Bound detail-page requests independently of the number of search results.
  const candidates = discovery.items.slice(0, 3);
  for (const candidate of candidates) {
    signal?.throwIfAborted();
    let check;
    let source;try{source=sourceFor(new URL(candidate.url));}catch{}
    const matching=source?.marketId===context.marketId && (!Object.hasOwn(candidate,'marketId')||candidate.marketId===context.marketId)
      && (!Object.hasOwn(candidate,'sourceId')||candidate.sourceId===source.id);
    const knownProduct=catalog.find(product=>product.sources.some(entry=>{
      const known=new URL(entry.url);let target;try{target=new URL(candidate.url);}catch{return false;}
      return known.hostname.replace(/^www\./,'')===target.hostname.replace(/^www\./,'')&&known.pathname===target.pathname;
    }));
    try { if(matching)check = await verify?.(candidate); } catch { interrupted = true; }
    signal?.throwIfAborted();
    const checkedAt = typeof check?.checkedAt === 'string' ? Date.parse(check.checkedAt) : NaN;
    const currentTime = now();
    const current = Number.isFinite(checkedAt) && checkedAt <= currentTime && currentTime - checkedAt < maxObservationAge;
    const record = check ?? {
      marketId:source?.marketId??null,sourceId:source?.id??null,
      url: candidate.url, checkedAt: new Date(currentTime).toISOString(),
      status: 'unconfirmed', availability: 'unknown', reason: 'not-checked',
    };
    checks.push(record);
    const sourceCheck = matching && current && check.marketId===context.marketId
      && check.sourceId===source.id && check.url===candidate.url;
    const canonicalOffer = knownProduct?.sources.some(entry => entry.url === candidate.url);
    if (sourceCheck) {
      if (sourceFailed(check)) interrupted = true;
      else {
        const contradicted = check.availability === 'inactive' || negativeEvidence.has(check.reason);
        if (check.status === 'partial' || contradicted) evidence = true;
        // A mismatch against the user's requested part is not a mismatch against the canonical listing.
        const matchesCatalogRequest = candidate.mpn === knownProduct?.mpn;
        if (contradicted && (check.availability === 'inactive' || matchesCatalogRequest)
          && [200, 404, 410].includes(check.httpStatus)
          && canonicalOffer) {
          invalidations.push({ url: candidate.url, checkedAt: check.checkedAt });
        }
      }
    }
    if (sourceCheck && check.status==='partial' && check.productMatch!==false
      && (!candidate.mpn || check.mpn===candidate.mpn) && (!knownProduct || check.mpn===knownProduct.mpn)
      && check.httpStatus === 200 && check.currency === activeMarket.currency
      && check.availability === 'active' && Number.isSafeInteger(check.price) && check.price > 0
      && check.price <= 100_000_000) {
      const summary = costs(check);
      const criteria = discovery.criteria ?? {};
      if (!acceptsOffer(check, criteria)) {
        excluded++;
        if (canonicalOffer) invalidations.push({ url: candidate.url, checkedAt: check.checkedAt, olderOnly: true });
        continue;
      }
      items.push({ ...candidate, status: 'partial', check: { ...check, ...summary },
        budgetStatus: criteria.maxTotal == null ? 'none' : summary.total === null ? 'unknown-total' : 'within',
        expiresAt: new Date(checkedAt + maxObservationAge).toISOString() });
    }
  }
  signal?.throwIfAborted();
  if (journalPath && checks.length) await saveScan(journalPath, {
    ...context,
    id: randomUUID(), completedAt: new Date(now()).toISOString(), checks,
  }, signal);
  signal?.throwIfAborted();
  // Source downtime with no usable evidence is an interrupted search.
  if (interrupted && !evidence && !items.length) return { kind: 'unavailable' };
  return { kind: 'results',...context,items, unconfirmed: discovery.items.length - items.length - excluded,
    excluded, criteria: discovery.criteria, attemptedUrls: candidates.map(candidate => candidate.url), invalidations,
    completedAt: new Date(now()).toISOString() };
}
