import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { parseDealReply } from '../src/deal-contract.mjs';
import { gatewaySearch } from './gateway.mjs';
import { cases, pages, snapshotAt, sourcePage, urls } from './multi-ai-benchmark-fixtures.mjs';
import { createOfferSearch } from './offer-search.mjs';
import { serializeScanReply } from './service-contract.mjs';
import { inspectPage } from './verification.mjs';

const time = Date.parse(snapshotAt);
const requestId = 'c'.repeat(32);
const primary = 'openai/fixture-primary';
const second = 'google/fixture-second';
const perCallUsdMicros = 1500;
const budgetUsdMicros = 2 * perCallUsdMicros;
const elapsed = start => Math.round((performance.now() - start) * 1000) / 1000;

// The expectations are hand-pinned from the review rubric and source fixture.
// They are independent of candidate rows and are never passed to either route.
const pro = { title: 'Samsung 990 PRO · 2 TB · ohne Kühlkörper', mpn: 'MZ-V9P2T0BW' };
const dqOffer = { ...pro, sourceId: 'dq-solutions.ch', seller: 'DQ Solutions', price: 27900 };
const mixelOffer = { ...pro, sourceId: 'shop.mixel.ch', seller: 'MIXEL Shop', price: 24900 };
const expected = {
  1: { offers: { [urls.dq990]: dqOffer, [urls.mixel990]: mixelOffer }, kind: 'results', budgetStatus: 'unknown-total', outcome: 'partial-offers' },
  2: { offers: { [urls.dqT7]: { title: 'Samsung T7 Shield · 1 TB · Schwarz', mpn: 'MU-PE1T0S/EU',
    sourceId: 'dq-solutions.ch', seller: 'DQ Solutions', price: 8900 } }, kind: 'results', outcome: 'partial-offers' },
  3: { kind: 'results', outcome: 'variant-rejected' },
  4: { kind: 'results', outcome: 'variant-rejected' },
  5: { offers: { [urls.dq990]: dqOffer }, kind: 'results', outcome: 'partial-offers' },
  6: { kind: 'results', missingCompleteCosts: 2, excluded: 2, outcome: 'cost-gap-explained' },
  7: { kind: 'results', excluded: 2, outcome: 'above-budget-excluded' },
  8: { kind: 'clarification', outcome: 'scope-needed', followUp: { kind: 'results', excluded: 1, unconfirmed: 0 } },
  9: { kind: 'results', unconfirmed: 1, outcome: 'compatibility-unproven' },
  10: { kind: 'results', outcome: 'unavailable-offer-excluded' },
  11: { kind: 'results', outcome: 'variant-rejected' },
};

export function scoreResult(caseId, result, followUp) {
  const rubric = expected[caseId];
  if (!rubric) throw new Error('Unknown benchmark case');
  const hardViolations = [];
  const gaps = [];
  function compare(actual, rule) {
    const offers = rule.offers ?? {};
    const checked = new Set();
    for (const item of actual?.items ?? []) {
      if (!Object.hasOwn(offers, item.url) || checked.has(item.url)) {
        hardViolations.push({ url: item.url, field: 'url' });
        continue;
      }
      checked.add(item.url);
      const { title, mpn, sourceId, ...prices } = offers[item.url];
      const itemFacts = { title, mpn, sourceId, marketId: 'CH', budgetStatus: rule.budgetStatus ?? 'none' };
      const sourceFacts = {
        ...prices, mpn, url: item.url, sourceId, marketId: 'CH', currency: 'CHF', availability: 'active',
        checkedAt: snapshotAt, condition: 'Neu', deliveryDestination: null, delivery: null,
        total: null, taxes: null, imports: null, shipping: null, fees: null,
      };
      for (const [observed, facts] of [[item, itemFacts], [item.check, sourceFacts]]) {
        for (const [field, value] of Object.entries(facts)) {
          if (observed?.[field] !== value) hardViolations.push({ url: item.url, field });
        }
      }
    }
    for (const url of Object.keys(offers)) if (!checked.has(url)) gaps.push('missing-offer ' + url);
    if (actual?.kind !== rule.kind) gaps.push('kind');
    for (const field of ['excluded', 'missingCompleteCosts']) {
      if ((actual?.[field] ?? 0) !== (rule[field] ?? 0)) gaps.push(field);
    }
    if (rule.unconfirmed !== undefined && actual?.unconfirmed !== rule.unconfirmed) gaps.push('unconfirmed');
  }
  compare(result, rubric);
  if (rubric.followUp) compare(followUp, rubric.followUp);
  const useful = hardViolations.length === 0 && gaps.length === 0;
  return { useful, outcome: useful ? rubric.outcome : 'missed', hardViolations, gaps };
}

function scoreOutage(result, calls, expectedKind) {
  const gaps = [];
  const fallback = expectedKind === 'results';
  const expectedCalls = fallback ? ['primary:http-503', 'fallback:response'] : ['primary:http-503'];
  if (result.kind !== expectedKind) gaps.push('kind');
  if (calls.map(call => call.role + ':' + call.outcome).join('|') !== expectedCalls.join('|')) gaps.push('calls');
  const hardViolations = (result.items ?? []).map(item => ({ url: item.url, field: 'url' }));
  const useful = gaps.length === 0 && hardViolations.length === 0;
  return { useful, outcome: useful ? fallback ? 'bounded-fallback' : expectedKind : 'missed', hardViolations, gaps };
}

function gatewayReply(rows, tokens) {
  return Response.json({
    content: [
      { type: 'tool-call', toolName: 'search', toolCallId: 'replay', input: '{}', providerExecuted: true },
      { type: 'tool-result', toolName: 'search', toolCallId: 'replay', result: { results: rows } },
    ],
    finishReason: { unified: 'stop', raw: 'stop' },
    usage: { inputTokens: { total: tokens.input }, outputTokens: { total: tokens.output } },
  });
}

async function runRoute(fixture, collaboration, { budget = budgetUsdMicros, cancel = false } = {}) {
  const calls = [];
  const sourceChecks = [];
  const reviews = [];
  const controller = new AbortController();
  const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(10_000)]);
  const start = performance.now();
  let reserved = 0;
  const reserve = () => {
    if (signal.aborted || reserved + perCallUsdMicros > budget) return false;
    reserved += perCallUsdMicros;
    return true;
  };
  const lookup = gatewaySearch({
    apiKey: 'fixture-only', model: primary, fallbackModel: fixture.outage ? second : undefined,
    budget: { reserve },
    fetchImpl: async (_url, init) => {
      const started = performance.now();
      const model = new Headers(init.headers).get('ai-language-model-id');
      const failed = fixture.outage && model === primary;
      const role = model === primary ? 'primary' : 'fallback';
      const tokens = failed ? null : { input: 120, output: 20 };
      const response = failed
        ? Response.json({ error: { message: 'Fixture 503' } }, { status: 503 })
        : gatewayReply(fixture.candidates ?? [], tokens);
      calls.push({ role, model, outcome: failed ? 'http-503' : 'response', tokens, localLatencyMs: elapsed(started) });
      if (failed && cancel) controller.abort();
      return response;
    },
  });
  const search = createOfferSearch({
    now: () => time,
    async webSearch(query, context) {
      const rows = await lookup(query, context);
      if (!collaboration || !fixture.review) return rows;
      const { url, claim, replacementTitle } = fixture.review;
      if (!rows.some(row => row.url === url) || !reserve()) return rows;
      signal.throwIfAborted();
      // Replay the second opinion. Its packet contains only the disputed claim
      // and the small relevant excerpt of the same frozen source snapshot.
      const started = performance.now();
      const { mpn, text } = pages[url];
      reviews.push({ url, claim, evidence: text ?? mpn, decision: 'withhold' });
      calls.push({ role: 'review', model: second, outcome: 'response', tokens: { input: 50, output: 5 },
        localLatencyMs: elapsed(started) });
      return rows.flatMap(row => row.url !== url ? [row] : replacementTitle ? [{ ...row, title: replacementTitle }] : []);
    },
    async verify(item) {
      const page = sourcePage(item.url);
      const fact = inspectPage(item, page, time);
      sourceChecks.push({ url: item.url, reason: fact.reason, httpStatus: fact.httpStatus });
      return fact;
    },
  });
  const input = { marketId: 'CH', deliveryCountry: 'CH', currency: 'CHF', query: fixture.query, ...fixture.options };
  const context = { subject: 'offline-benchmark', requestId, signal };
  async function clientResult(query) {
    const raw = await search(query, context);
    if (raw.kind === 'unavailable') return raw;
    return parseDealReply(serializeScanReply(raw, { input: query, requestId }, time), query, time, false, requestId);
  }
  let result, followUp;
  try {
    result = await clientResult(input);
    if (fixture.followUp && result.kind === 'clarification') {
      const confirmed = { ...input, ...fixture.followUp };
      followUp = { criteria: fixture.followUp, result: await clientResult(confirmed) };
    }
  } catch (error) {
    if (fixture.outage && cancel && error.name === 'AbortError') result = { kind: 'cancelled' };
    else if (fixture.outage && budget < budgetUsdMicros && error.message === 'Provider budget exhausted') result = { kind: 'budget-blocked' };
    else throw error;
  }
  const expectedKind = cancel ? 'cancelled' : budget < budgetUsdMicros ? 'budget-blocked' : 'results';
  const score = fixture.outage ? scoreOutage(result, calls, expectedKind) : scoreResult(fixture.id, result, followUp?.result);
  return { input, result, ...(followUp && { followUp }), ...score,
    calls, sourceChecks, reviews, simulatedCostUsdMicros: calls.length * perCallUsdMicros, localLatencyMs: elapsed(start) };
}

export async function runBenchmark() {
  const pairs = [];
  for (const fixture of cases) {
    const single = await runRoute(fixture, false);
    const collaboration = await runRoute(fixture, true);
    const pair = { id: fixture.id, language: fixture.language, single, collaboration,
      qualityGain: fixture.outage ? null : !single.useful && collaboration.useful };
    if (fixture.outage) {
      pair.resilience = {
        budget: await runRoute(fixture, true, { budget: perCallUsdMicros }),
        cancelled: await runRoute(fixture, true, { cancel: true }),
      };
    }
    pairs.push(pair);
  }
  const qualityPairs = pairs.filter(pair => !pair.resilience);
  const qualityGains = qualityPairs.filter(pair => pair.qualityGain).length;
  const summary = {};
  for (const arm of ['single', 'collaboration']) {
    const runs = qualityPairs.map(pair => pair[arm]);
    const useful = runs.filter(run => run.useful).length;
    const cost = runs.reduce((sum, run) => sum + run.simulatedCostUsdMicros, 0);
    summary[arm] = {
      useful, calls: runs.reduce((sum, run) => sum + run.calls.length, 0),
      hardViolations: runs.reduce((sum, run) => sum + run.hardViolations.length, 0),
      simulatedCostUsdMicros: cost, simulatedCostPerUsefulUsdMicros: useful ? cost / useful : null,
      localLatencyMs: Math.round(runs.reduce((sum, run) => sum + run.localLatencyMs, 0) * 1000) / 1000,
    };
  }
  return {
    mode: 'simulated', snapshotAt, snapshotSha256: createHash('sha256').update(JSON.stringify(pages)).digest('hex'),
    primary, second, simulatedBudgetUsdMicros: budgetUsdMicros, actualCostUsdMicros: 0, externalCalls: 0,
    qualityGains, fixtureThresholdMet: qualityGains >= 2 && summary.collaboration.hardViolations === 0, summary, pairs,
  };
}

if (import.meta.main) {
  const report = await runBenchmark();
  console.log(JSON.stringify(report, null, 2));
  if (report.pairs.some(({ single, collaboration, resilience }) => !single.useful || !collaboration.useful
    || (resilience && Object.values(resilience).some(run => !run.useful)))) process.exitCode = 1;
}
