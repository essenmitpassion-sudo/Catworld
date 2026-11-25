import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { defaultEconomics, economicsConfig, evaluateScenario, economicsReport } from '../scripts/economics.mjs';

// Deliberately synthetic arithmetic fixture, not a provider price or business forecast.
const simple = {
  priceRappen: 1000, usdToChf: 1, vatRate: 0, storeFeeRate: 0, refundRate: 0,
  searchUsdPer1000: 1, inputTokens: 0, outputTokens: 0, attemptMultiplier: 1,
  safetyMarginRate: 0, revenueCatRate: 0, hostingMonthlyUsd: 10,
  providerPaymentFeeRate: 0, providerTaxRate: 0, refundFeeRappen: 0,
  hostingUsageMonthlyChf: 0, authAndDatabaseMonthlyChf: 0, otherMonthlyChf: 0,
};
const close = (actual, expected) => assert(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);

test('economics defaults retain the single CH plan and all requested scenario axes', () => {
  assert.equal(defaultEconomics.marketId, 'CH');
  assert.equal(defaultEconomics.currency, 'CHF');
  assert.equal(defaultEconomics.priceRappen, 390);
  assert.equal(defaultEconomics.freeSearches, 3);
  assert.equal(defaultEconomics.plusSearches, 25);
  const report = economicsReport();
  assert.equal(report.scenarios.length, 27);
  assert.deepEqual([...new Set(report.scenarios.map(row => row.scenario.mau))], [100, 1000, 10000]);
  assert.deepEqual([...new Set(report.scenarios.map(row => row.scenario.callsPerSearch))], [1, 2, 3]);
  assert.equal(report.mode, 'planning-only');
  assert(report.sources.every(source => source.url.startsWith('https://')));
});

test('free users and full quotas contribute to provider costs instead of disappearing from the margin', () => {
  const row = evaluateScenario({ mau: 100, plusShare: 0.1, callsPerSearch: 1 }, simple);
  assert.equal(row.scenario.plusUsers, 10);
  assert.equal(row.scenario.freeUsers, 90);
  assert.equal(row.scenario.monthlySearches, 520);
  close(row.costs.perSearchChf, 0.001);
  close(row.costs.perPlusUserChf, 0.025);
  close(row.costs.perFreeUserChf, 0.003);
  close(row.totals.modeledCostsChf, 10.52);
  close(row.totals.modeledOperatingResultChf, 89.48);
  close(row.totals.completeCostsChf, 10.52);
  assert.equal(row.thresholds.standalonePlusUsersForFixedCosts, 2);
});

test('one through three calls include model tokens, failed billable attempts, FX and a cost reserve', () => {
  const config = { ...simple, inputTokens: 2000, outputTokens: 384,
    inputUsdPerMillion: 0.75, outputUsdPerMillion: 4.5,
    searchUsdPer1000: 5, usdToChf: 0.9, attemptMultiplier: 1.15, safetyMarginRate: 0.25 };
  const one = evaluateScenario({ mau: 100, plusShare: 0.1, callsPerSearch: 1 }, config);
  const three = evaluateScenario({ mau: 100, plusShare: 0.1, callsPerSearch: 3 }, config);
  close(one.costs.perSearchChf, (0.005 + 0.0015 + 0.001728) * 0.9 * 1.15 * 1.25);
  close(three.costs.perSearchChf, one.costs.perSearchChf * 3);
  close(three.scenario.expectedBillableRequests, 520 * 3 * 1.15);
  close(three.costs.perPlusUserChf, three.costs.perSearchChf * 25);
});

test('refund reserve and store fees are separate, without assuming a commission refund', () => {
  const row = evaluateScenario({ mau: 10, plusShare: 1, callsPerSearch: 1 }, {
    ...simple, vatRate: 0.1, storeFeeRate: 0.3, refundRate: 0.02, refundFeeRappen: 25,
  });
  close(row.revenue.excludingVatChf, 100 / 1.1);
  close(row.revenue.storeFeesChf, 100 / 1.1 * 0.3);
  close(row.revenue.refundReserveChf, 100 / 1.1 * 0.02);
  close(row.revenue.refundFeesChf, 10 * 0.02 * 0.25);
});

test('RevenueCat charges the full pre-store revenue at the USD threshold, not only its excess', () => {
  const config = { ...simple, revenueCatRate: 0.01, revenueCatThresholdUsd: 2500 };
  const below = evaluateScenario({ mau: 249, plusShare: 1, callsPerSearch: 1 }, config);
  const boundary = evaluateScenario({ mau: 250, plusShare: 1, callsPerSearch: 1 }, config);
  close(below.revenue.revenueCatFeesChf, 0);
  close(boundary.revenue.revenueCatFeesChf, 25);
});

test('unpriced items keep totals and viability open rather than silently becoming free', () => {
  const row = evaluateScenario({ mau: 1000, plusShare: 0.1, callsPerSearch: 2 });
  assert(row.unpricedCosts.includes('providerPaymentFeeRate'));
  assert(row.unpricedCosts.includes('hostingUsageMonthlyChf'));
  assert.equal(row.totals.completeCostsChf, null);
  assert.equal(row.totals.completeOperatingResultChf, null);
  assert.equal(row.viability, 'unconfirmed');
  assert.equal(typeof row.totals.modeledOperatingResultChf, 'number');
});

test('thresholds fund the free cohort, conservatively include the RevenueCat cliff, and expose loss scenarios', () => {
  const config = { ...simple, revenueCatRate: 0.01 };
  const row = evaluateScenario({ mau: 100, plusShare: 0.05, callsPerSearch: 3 }, config);
  const sufficient = row.thresholds.sufficientMauForFixedCosts;
  assert(Number.isSafeInteger(sufficient));
  const funded = evaluateScenario({ mau: sufficient, plusShare: 0.05, callsPerSearch: 3 }, config);
  assert(funded.totals.modeledOperatingResultChf >= 0);
  const losing = evaluateScenario({ mau: 1000, plusShare: 0, callsPerSearch: 3 }, config);
  assert(losing.totals.modeledOperatingResultChf < 0);
  assert.equal(losing.thresholds.sufficientMauForFixedCosts, null);
  assert.equal(losing.thresholds.maxAffordablePlusSearchesAtMix, null);
  const expensive = evaluateScenario({ mau: 1000, plusShare: 0.1, callsPerSearch: 3 }, {
    ...simple, searchUsdPer1000: 1000,
  });
  assert.equal(expensive.thresholds.sufficientMauForFixedCosts, null);
  assert.equal(expensive.thresholds.maxAffordablePlusSearchesAtMix, 0);
});

test('configuration is strict and boundary populations never yield NaN or infinite JSON values', () => {
  for (const change of [{ marketId: 'DE' }, { currency: 'EUR' }, { priceRappen: 3.9 },
    { plusSearches: 2 }, { usdToChf: 0 }, { vatRate: -1 }, { storeFeeRate: 1.1 },
    { searchUsdPer1000: Infinity }, { attemptMultiplier: 0.9 }, { hostingUsageMonthlyChf: -1 },
    { providerTaxRate: '0' }, { unknownSetting: 1 }]) assert.throws(() => economicsConfig(change));
  for (const scenario of [{ mau: -1, plusShare: 0.1, callsPerSearch: 1 },
    { mau: 1, plusShare: 2, callsPerSearch: 1 }, { mau: 1, plusShare: 0, callsPerSearch: 4 }]) {
    assert.throws(() => evaluateScenario(scenario));
  }
  const empty = evaluateScenario({ mau: 0, plusShare: 0, callsPerSearch: 1 }, simple);
  assert.equal(empty.scenario.monthlySearches, 0);
  assert.equal(empty.thresholds.minimumPlusShareAtMau, null);
  assert(!JSON.stringify(empty).includes('NaN'));
  assert.equal(economicsConfig({ priceRappen: 490 }).priceRappen, 490);
  assert.equal(defaultEconomics.priceRappen, 390);
});

test('ordinary decimal Plus shares do not lose a whole payer to binary floating point', () => {
  const row = evaluateScenario({ mau: 100, plusShare: 0.29, callsPerSearch: 1 }, simple);
  assert.equal(row.scenario.plusUsers, 29);
  assert.equal(row.scenario.freeUsers, 71);
  assert.equal(evaluateScenario({ mau: 100, plusShare: 0.28999999999999, callsPerSearch: 1 }, simple).scenario.plusUsers, 28);
  assert.equal(evaluateScenario({ mau: 10_000_000, plusShare: 1e-7, callsPerSearch: 1 }, simple).scenario.plusUsers, 1);
});

test('CLI produces offline JSON scenarios and rejects misspelled arguments', () => {
  const path = fileURLToPath(new URL('../scripts/economics.mjs', import.meta.url));
  const result = spawnSync(process.execPath, [path,
    '--json', '--mau', '100', '--plus-shares', '0.1', '--calls', '3'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.scenarios.length, 1);
  assert.equal(report.scenarios[0].scenario.callsPerSearch, 3);
  const bad = spawnSync(process.execPath, [path, '--spend'], { encoding: 'utf8' });
  assert.notEqual(bad.status, 0);
  assert.equal(bad.stdout, '');
});
