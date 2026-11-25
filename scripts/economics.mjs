import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { defaultPlanPolicy, planPolicy } from './plan-policy.mjs';

// Offline planning only. Nothing here configures entitlements, makes a network
// request, purchases credits, or authorizes production prices or provider use.
export const defaultEconomics = Object.freeze({
  ...defaultPlanPolicy, marketId: 'CH',
  usdToChf: 0.9, vatRate: 0.081, storeFeeRate: 0.30, refundRate: 0.02,
  searchUsdPer1000: 5, inputUsdPerMillion: 0.75, outputUsdPerMillion: 4.50,
  inputTokens: 2000, outputTokens: 384, attemptMultiplier: 1.15, safetyMarginRate: 0.25,
  revenueCatRate: 0.01, revenueCatThresholdUsd: 2500, hostingMonthlyUsd: 20,
  // No separate customer payment fee assumed for native store billing. This
  // does not mean the operator's API-credit funding or refund fees are known.
  paymentFeeRate: 0, paymentFeeRappen: 0,
  providerPaymentFeeRate: null, providerTaxRate: null, refundFeeRappen: null,
  hostingUsageMonthlyChf: null, authAndDatabaseMonthlyChf: null, otherMonthlyChf: null,
});

export const economicsSources = Object.freeze([
  { item: 'Perplexity Search through AI Gateway: USD 5 per 1000 requests',
    url: 'https://vercel.com/docs/ai-gateway/models-and-providers/web-search' },
  { item: 'Search API billing: successful requests, including empty results; no token charge',
    url: 'https://docs.perplexity.ai/docs/getting-started/pricing' },
  { item: 'GPT-5.4 mini: USD 0.75 input / 4.50 output per million tokens',
    url: 'https://developers.openai.com/api/docs/models/gpt-5.4-mini' },
  { item: 'Gateway model listing confirms the same starting token rates',
    url: 'https://vercel.com/ai-gateway/models/openai/gpt-5.4-mini' },
  { item: 'Gateway: no token markup; payment fees and optional surcharges may apply',
    url: 'https://vercel.com/docs/ai-gateway/pricing' },
  { item: 'Apple standard subscriptions: 30% in first year, 15% after a paid year',
    url: 'https://developer.apple.com/app-store/subscriptions/' },
  { item: 'Apple 15% Small Business rate requires actual eligibility and enrollment',
    url: 'https://developer.apple.com/app-store/small-business-program/' },
  { item: 'Google Play subscriptions in remaining markets including CH: 15%',
    url: 'https://support.google.com/googleplay/android-developer/answer/112622' },
  { item: 'RevenueCat: at USD 2500 MTR, 1% of all MTR, before platform cut',
    url: 'https://www.revenuecat.com/pricing' },
  { item: 'Vercel Pro: USD 20/month starting price, not an all-in hosting quote',
    url: 'https://vercel.com/pricing' },
  { item: 'Swiss standard VAT rate: 8.1%; actual store proceeds need reconciliation',
    url: 'https://www.estv.admin.ch/en/vat-rates-switzerland' },
]);

const nullableCosts = [
  'providerPaymentFeeRate', 'providerTaxRate', 'refundFeeRappen',
  'hostingUsageMonthlyChf', 'authAndDatabaseMonthlyChf', 'otherMonthlyChf',
];
const rates = new Set(['vatRate', 'storeFeeRate', 'refundRate', 'safetyMarginRate',
  'revenueCatRate', 'paymentFeeRate', 'providerPaymentFeeRate', 'providerTaxRate']);
const integers = new Set(['priceRappen', 'freeSearches', 'plusSearches', 'inputTokens',
  'outputTokens', 'paymentFeeRappen', 'refundFeeRappen']);

function number(value, label, { min = 0, max = 1_000_000_000, integer = false } = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max
    || (integer && !Number.isSafeInteger(value))) throw new Error('Invalid economics value: ' + label);
  return value;
}

export function economicsConfig(overrides = {}) {
  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) throw new Error('Expected economics configuration object');
  for (const key of Object.keys(overrides)) {
    if (!Object.hasOwn(defaultEconomics, key)) throw new Error('Unknown economics setting: ' + key);
  }
  const config = { ...defaultEconomics, ...overrides };
  if (config.marketId !== 'CH' || config.currency !== 'CHF') throw new Error('Only the CH/CHF planning model is supported');
  planPolicy({ priceRappen: config.priceRappen, freeSearches: config.freeSearches,
    plusSearches: config.plusSearches, currency: config.currency });
  for (const [key, value] of Object.entries(config)) {
    if (['marketId', 'currency'].includes(key) || (value === null && nullableCosts.includes(key))) continue;
    number(value, key, { integer: integers.has(key), max: rates.has(key) ? 1 : 1_000_000_000 });
  }
  if (config.priceRappen < 1 || config.plusSearches < Math.max(1, config.freeSearches)
    || config.usdToChf <= 0 || config.attemptMultiplier < 1) throw new Error('Invalid price, quota, FX or attempt assumptions');
  return config;
}

function payingUsers(mau, share) {
  // Floor the configured decimal value exactly (e.g. 100 * 0.29 is 29,
  // whereas binary floating-point multiplication gives 28.999999999999996).
  const [mantissa, exponent = '0'] = String(share).split('e');
  const [whole, fraction = ''] = mantissa.split('.');
  const coefficient = BigInt(whole + fraction);
  const scale = fraction.length - Number(exponent);
  return Number(scale >= 0 ? BigInt(mau) * coefficient / 10n ** BigInt(scale)
    : BigInt(mau) * coefficient * 10n ** BigInt(-scale));
}

export function evaluateScenario(scenario, overrides = {}) {
  const config = economicsConfig(overrides);
  if (!scenario || typeof scenario !== 'object' || Array.isArray(scenario)
    || Object.keys(scenario).some(key => !['mau', 'plusShare', 'callsPerSearch'].includes(key))) throw new Error('Invalid economics scenario');
  const mau = number(scenario.mau, 'mau', { integer: true, max: 10_000_000 });
  const plusShare = number(scenario.plusShare, 'plusShare', { max: 1 });
  const callsPerSearch = number(scenario.callsPerSearch, 'callsPerSearch', { min: 1, max: 3 });
  const plusUsers = payingUsers(mau, plusShare);
  const freeUsers = mau - plusUsers;
  const monthlySearches = plusUsers * config.plusSearches + freeUsers * config.freeSearches;
  const expectedBillableRequests = monthlySearches * callsPerSearch * config.attemptMultiplier;
  const unpricedCosts = nullableCosts.filter(key => config[key] === null);
  const priceChf = config.priceRappen / 100;
  const grossChf = plusUsers * priceChf;
  const excludingVatChf = grossChf / (1 + config.vatRate);
  // Reserve the full ex-VAT refund amount without crediting any store fee back.
  const storeFeesChf = excludingVatChf * config.storeFeeRate;
  const refundReserveChf = excludingVatChf * config.refundRate;
  const refundFeesChf = plusUsers * config.refundRate * (config.refundFeeRappen ?? 0) / 100;
  const paymentFeesChf = excludingVatChf * config.paymentFeeRate + plusUsers * config.paymentFeeRappen / 100;
  // Conservatively count gross VAT-inclusive, pre-refund receipts as MTR. No
  // marginal/excess-only billing: the entire base is charged at the threshold.
  const revenueCatFeesChf = grossChf > 0 && grossChf / config.usdToChf >= config.revenueCatThresholdUsd
    ? grossChf * config.revenueCatRate : 0;
  const tokenCostUsd = (config.inputTokens * config.inputUsdPerMillion
    + config.outputTokens * config.outputUsdPerMillion) / 1_000_000;
  const bundleCostUsd = config.searchUsdPer1000 / 1000 + tokenCostUsd;
  const providerCostPerSearchChf = bundleCostUsd * callsPerSearch * config.attemptMultiplier
    * config.usdToChf * (1 + (config.providerPaymentFeeRate ?? 0)) * (1 + (config.providerTaxRate ?? 0));
  const perSearchChf = providerCostPerSearchChf * (1 + config.safetyMarginRate);
  const providerCostsChf = providerCostPerSearchChf * monthlySearches;
  const fixedBaseChf = config.hostingMonthlyUsd * config.usdToChf
    + (config.hostingUsageMonthlyChf ?? 0) + (config.authAndDatabaseMonthlyChf ?? 0) + (config.otherMonthlyChf ?? 0);
  const fixedCostsChf = fixedBaseChf * (1 + config.safetyMarginRate);
  const costReserveChf = (fixedBaseChf + providerCostsChf) * config.safetyMarginRate;
  const modeledCostsChf = providerCostsChf + fixedBaseChf + costReserveChf
    + storeFeesChf + refundReserveChf + refundFeesChf + paymentFeesChf + revenueCatFeesChf;
  const modeledOperatingResultChf = excludingVatChf - modeledCostsChf;
  const perFreeUserChf = config.freeSearches * perSearchChf;
  const perPlusUserChf = config.plusSearches * perSearchChf;
  const retainedPerPlusChf = priceChf / (1 + config.vatRate)
    * (1 - config.storeFeeRate - config.refundRate - config.paymentFeeRate)
    - config.paymentFeeRappen / 100 - config.refundRate * (config.refundFeeRappen ?? 0) / 100;
  const plusContributionChf = retainedPerPlusChf - perPlusUserChf
    - (plusUsers ? revenueCatFeesChf / plusUsers : 0);
  // Thresholds always reserve RevenueCat's full rate, even below its cliff.
  const conservativeRetainedPerPlusChf = retainedPerPlusChf - priceChf * config.revenueCatRate;
  const conservativePlusContributionChf = conservativeRetainedPerPlusChf - perPlusUserChf;
  const contributionSpreadChf = conservativePlusContributionChf + perFreeUserChf;
  const contributionPerMauChf = plusShare * contributionSpreadChf - perFreeUserChf;
  const safeCeil = value => Number.isSafeInteger(Math.ceil(value)) ? Math.ceil(value) : null;
  const maxSearches = value => perSearchChf > 0 ? Math.max(0, Math.floor(value / perSearchChf)) : null;
  const requiredShare = mau > 0 && contributionSpreadChf > 0
    ? (perFreeUserChf + fixedCostsChf / mau) / contributionSpreadChf : null;
  return {
    scenario: { mau, plusShare, callsPerSearch, plusUsers, freeUsers, monthlySearches, expectedBillableRequests },
    costs: { bundleCostUsd, perSearchChf, perFreeSearchChf: perSearchChf, perPlusSearchChf: perSearchChf,
      perFreeUserChf, perPlusUserChf, providerCostsChf, fixedCostsChf, costReserveChf },
    revenue: { grossChf, excludingVatChf, vatChf: grossChf - excludingVatChf,
      storeFeesChf, refundReserveChf, refundFeesChf, paymentFeesChf, revenueCatFeesChf,
      plusContributionChf, conservativePlusContributionChf },
    totals: { modeledCostsChf, modeledOperatingResultChf,
      modeledNetMarginRate: excludingVatChf > 0 ? modeledOperatingResultChf / excludingVatChf : null,
      completeCostsChf: unpricedCosts.length ? null : modeledCostsChf,
      completeOperatingResultChf: unpricedCosts.length ? null : modeledOperatingResultChf },
    thresholds: {
      standalonePlusUsersForFixedCosts: conservativePlusContributionChf > 0
        ? safeCeil(fixedCostsChf / conservativePlusContributionChf) : null,
      // Sufficient upper bound, not an exact minimum: the extra spread covers
      // losing up to one paying user when floor(MAU * share) is taken.
      sufficientMauForFixedCosts: contributionPerMauChf > 0
        ? safeCeil((fixedCostsChf + Math.max(0, contributionSpreadChf)) / contributionPerMauChf) : null,
      minimumPlusShareAtMau: requiredShare !== null && requiredShare <= 1 ? requiredShare : null,
      maxAffordablePlusSearchesAtMix: plusUsers > 0
        ? maxSearches(conservativeRetainedPerPlusChf - (freeUsers * perFreeUserChf + fixedCostsChf) / plusUsers) : null,
      maxAffordableFreeSearchesAtMix: freeUsers > 0
        ? maxSearches((plusUsers * conservativePlusContributionChf - fixedCostsChf) / freeUsers) : null,
    },
    unpricedCosts, viability: 'unconfirmed',
  };
}

export function economicsReport(overrides = {}, axes = {}) {
  const config = economicsConfig(overrides);
  if (!axes || typeof axes !== 'object' || Array.isArray(axes)
    || Object.keys(axes).some(key => !['mau', 'plusShares', 'calls'].includes(key))) throw new Error('Invalid scenario axes');
  const { mau = [100, 1000, 10000], plusShares = [0.05, 0.1, 0.2], calls = [1, 2, 3] } = axes;
  if ([mau, plusShares, calls].some(values => !Array.isArray(values) || !values.length || values.length > 100)
    || mau.length * plusShares.length * calls.length > 1000) throw new Error('Scenario matrix must contain 1 to 1000 entries');
  const scenarios = mau.flatMap(users => plusShares.flatMap(share => calls.map(count =>
    evaluateScenario({ mau: users, plusShare: share, callsPerSearch: count }, config))));
  return {
    mode: 'planning-only', sourcesCheckedAt: '2026-11-25', config, sources: economicsSources,
    assumptions: [
      'CH/CHF only; price is a target, not a configured store product or confirmed proceeds.',
      'Full monthly quota use by free and Plus MAU; Plus quota replaces rather than adds to free quota.',
      'Monthly figures approximate steady-state billing windows: free UTC calendar month, Plus verified store renewal period; no extra calendar reset.',
      'Each external call includes one single-query Search request and one model call at the configured token usage.',
      'Tokens, FX, attempt multiplier, refund rate, safety reserve and hosting choice are assumptions, not measured invoices.',
      'Attempt multiplier covers provider-billable failures outside successful user quotas; it is not a runtime retry policy.',
      'Thirty percent store fee conservatively models first-year Apple terms; no Small Business enrollment is presumed.',
      'Refunds reserve full ex-VAT receipts without assuming store commissions are returned.',
      'RevenueCat uses gross pre-refund VAT-inclusive MTR here, with its full rate at the USD threshold.',
      'No credits, cache discounts, affiliate income, confirmed savings or commercial hosting allowance are assumed.',
      'Null costs remain unpriced. Modeled totals omit them; even fully specified forecasts do not prove actual viability.',
    ],
    scenarios,
  };
}

async function main(args) {
  if (args.includes('--help')) {
    process.stdout.write('Offline CH economics, no network or spending.\n'
      + 'node scripts/economics.mjs [--json] [--config local.json] [--mau 100,1000,10000]\n'
      + '  [--plus-shares 0.05,0.1,0.2] [--calls 1,2,3] [--defaults]\n');
    return;
  }
  let json = false;
  let defaults = false;
  let configPath;
  const axes = {};
  const seen = new Set();
  for (let index = 0; index < args.length; index++) {
    const flag = args[index];
    if (!['--json', '--defaults', '--config', '--mau', '--plus-shares', '--calls'].includes(flag) || seen.has(flag)) throw new Error('Unknown or repeated CLI option');
    seen.add(flag);
    if (flag === '--json') { json = true; continue; }
    if (flag === '--defaults') { defaults = true; continue; }
    const value = args[++index];
    if (!value || value.startsWith('--')) throw new Error('Missing CLI option value');
    if (flag === '--config') { configPath = value; continue; }
    const key = { '--mau': 'mau', '--plus-shares': 'plusShares', '--calls': 'calls' }[flag];
    const parts = value.split(',');
    if (parts.some(part => !/^\d+(?:\.\d+)?$/.test(part))) throw new Error('Expected comma-separated decimal numbers');
    axes[key] = parts.map(Number);
  }
  if (defaults) {
    if (configPath || Object.keys(axes).length) throw new Error('--defaults cannot be combined with scenario overrides');
    process.stdout.write(JSON.stringify(defaultEconomics, null, 2) + '\n');
    return;
  }
  let overrides = {};
  if (configPath) {
    const raw = await readFile(configPath);
    if (raw.byteLength > 65_536) throw new Error('Configuration exceeds 64 KiB');
    try { overrides = JSON.parse(raw.toString('utf8')); } catch { throw new Error('Invalid configuration JSON'); }
  }
  const report = economicsReport(overrides, axes);
  if (json) { process.stdout.write(JSON.stringify(report, null, 2) + '\n'); return; }
  process.stdout.write('CH/CHF ECONOMICS — conditional planning, not confirmed profit\n'
    + 'Sources checked: ' + report.sourcesCheckedAt + '; price CHF ' + (report.config.priceRappen / 100).toFixed(2)
    + '; free/Plus quotas ' + report.config.freeSearches + '/' + report.config.plusSearches + '\n'
    + 'MAU\tPlus %\tCalls\tCHF/search*\tCHF/Plus API*\tCHF result*\tSufficient MAU*\n');
  for (const row of report.scenarios) {
    process.stdout.write([row.scenario.mau, (row.scenario.plusShare * 100).toFixed(1), row.scenario.callsPerSearch,
      row.costs.perSearchChf.toFixed(4), row.costs.perPlusUserChf.toFixed(2),
      row.totals.modeledOperatingResultChf.toFixed(2), row.thresholds.sufficientMauForFixedCosts ?? 'none'].join('\t') + '\n');
  }
  process.stdout.write('* Assumptions + reserves; unknown costs excluded. Unpriced: '
    + (report.scenarios[0].unpricedCosts.join(', ') || 'none in configured model')
    + '. Full assumptions, sources, fees and thresholds: --json and docs/ECONOMICS.md.\n');
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main(process.argv.slice(2)).catch(() => {
    // Never echo raw config, filesystem paths, JSON or potential secrets.
    process.stderr.write('Invalid economics input. Use --help and docs/ECONOMICS.md.\n');
    process.exitCode = 1;
  });
}
