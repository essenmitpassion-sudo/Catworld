import assert from 'node:assert/strict';
import test from 'node:test';
import { runBenchmark, scoreResult } from '../scripts/multi-ai-benchmark.mjs';

test('paired replay pins all 12 acceptance cases and scores resilience separately', async () => {
  const report = await runBenchmark();
  assert.equal(report.mode, 'simulated');
  assert.equal(report.externalCalls, 0);
  assert.equal(report.actualCostUsdMicros, 0);
  assert.deepEqual(report.pairs.map(pair => pair.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  for (const pair of report.pairs) {
    assert.equal(pair.single.hardViolations.length, 0, `single case ${pair.id}`);
    assert.equal(pair.collaboration.hardViolations.length, 0, `collaboration case ${pair.id}`);
    assert.equal(pair.single.useful, true, `single case ${pair.id}`);
    assert.equal(pair.collaboration.useful, true, `collaboration case ${pair.id}`);
    assert.ok(pair.single.simulatedCostUsdMicros <= report.simulatedBudgetUsdMicros);
    assert.ok(pair.collaboration.simulatedCostUsdMicros <= report.simulatedBudgetUsdMicros);
    assert.ok(pair.single.localLatencyMs >= 0);
    assert.ok(pair.collaboration.localLatencyMs >= 0);
  }
  assert.equal(report.pairs[0].single.calls.length, 0);
  assert.equal(report.pairs[1].collaboration.calls.length, 0);
  assert.equal(report.pairs[5].single.result.missingCompleteCosts, 2);
  assert.equal(report.pairs[6].single.result.missingCompleteCosts, undefined);
  assert.equal(report.pairs[7].single.result.kind, 'clarification');
  assert.equal(report.pairs[7].single.followUp.result.excluded, 1);
  assert.equal(report.pairs[8].single.result.unconfirmed, 1);
  assert.equal(report.pairs[8].collaboration.calls[1].role, 'review');
  assert.equal(report.pairs[10].collaboration.result.items.length, 0);
  assert.equal(report.pairs[11].single.calls[0].outcome, 'http-503');
  assert.equal(report.pairs[11].single.calls.length, 2);
  assert.equal(report.pairs[11].collaboration.calls.length, 2);
  assert.equal(report.pairs[11].resilience.budget.calls.length, 1);
  assert.equal(report.pairs[11].resilience.budget.result.kind, 'budget-blocked');
  assert.equal(report.pairs[11].resilience.budget.useful, true);
  assert.equal(report.pairs[11].resilience.cancelled.calls.length, 1);
  assert.equal(report.pairs[11].resilience.cancelled.result.kind, 'cancelled');
  assert.equal(report.pairs[11].resilience.cancelled.useful, true);
  assert.equal(report.qualityGains, 0);
  assert.equal(report.fixtureThresholdMet, false);
});

test('scoring detects unsupported price, availability, variant and direct source claims', () => {
  const wrong = {
    kind: 'results',
    items: [{
      title: 'Samsung 990 PRO · 1 TB', mpn: 'MZ-V9P1T0BW', sourceId: 'dq-solutions.ch',
      url: 'https://www.dq-solutions.ch/de/samsung-2-tb-ssd-990-pro-nvme-m-2-ssd-m-2-hs2011',
      budgetStatus: 'within',
      check: { total: 1, price: 1, availability: 'inactive' },
    }, {
      title: 'Made-up SSD', mpn: 'FICTITIOUS',
      url: 'https://example.invalid/offers/1', check: { total: 1 },
    }],
  };
  const score = scoreResult(1, wrong);
  for (const field of ['title', 'mpn', 'total', 'price', 'availability', 'budgetStatus', 'url']) {
    assert.ok(score.hardViolations.some(violation => violation.field === field), field);
  }
  assert.equal(score.useful, false);
});
