import { costs } from './costs.mjs';
import {searchContext} from './markets.mjs';

const foreignCurrencyCodes = new Set(Intl.supportedValuesOf('currency').filter(code=>code!=='CHF'));
function foreignCurrencyIn(query) {
  const codes=query.matchAll(/\b([a-z]{3})\s*\d|\d\s*([a-z]{3})\b/gi);
  return [...codes].some(match=>foreignCurrencyCodes.has((match[1]??match[2]).toUpperCase()))
    || /(?:\b(?:Euro|dollars?|pounds?)\s*\d|\d\s*(?:Euro|dollars?|pounds?)\b|[$€£]\s*\d|\d\s*[$€£])/i.test(query);
}

function amount(value) {
  if (typeof value !== 'string' || !/^(?:\d{1,3}(?:['’]\d{3})+|\d{1,7})(?:[.,]\d{1,2})?$/.test(value)) {
    throw new Error('Gib das Budget in CHF mit höchstens zwei Nachkommastellen ein.');
  }
  const [whole, fraction = ''] = value.replace(/['’]/g, '').replace(',', '.').split('.');
  const result = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (result <= 0 || result > 100_000_000) throw new Error('Das Budget muss zwischen CHF 0.01 und CHF 1’000’000 liegen.');
  return result;
}

function budgetMentions(query) {
  const expression = /\b(bis(?:\s+zu)?|budget|maximal|max\.?|höchstens|unter|up\s+to|under|at\s+most|maximum)\s*[:]?\s+(?:(?:CHF|Fr\.?)\s*)?([\d'’]+(?:[.,]\d+)?)\s*(CHF|Franken|Fr\.?)?(?=$|[\s,.!?])/giu;
  const mentions = [];
  for (const match of query.matchAll(expression)) {
    const tail = query.slice(match.index + match[0].length);
    if (!match[3] && /^\s*(?:TB|GB|MB|RAM|MHz|GHz|Watt|km|EUR|Euro|€|%|Zoll)\b/i.test(tail)) continue;
    mentions.push(match);
  }
  return mentions;
}

function budgetFrom(query) {
  const budgets = budgetMentions(query).map(match =>
    amount(match[2]) - (['unter','under'].includes(match[1].toLowerCase()) ? 1 : 0));
  return budgets.length ? Math.min(...budgets) : null;
}

export function withoutBudget(query) {
  let result = query;
  for (const match of budgetMentions(query).reverse()) {
    result = result.slice(0, match.index) + ' ' + result.slice(match.index + match[0].length);
  }
  return result.trim();
}

export function criteriaFor(input) {
  searchContext(input);
  const query = input.query;
  if(foreignCurrencyIn(query))throw new Error('Der Pilot unterstützt Budgets nur in CHF. Andere Währungen werden nicht automatisch umgerechnet.');
  const newOnly = /\b(?:(?:nicht|kein(?:e|en|er|es)?) gebraucht\w*|nur neu(?:ware)?|neu(?:er|en|e|es)? (?:gaming[- ]?)?(?:pc|ssd|speicher|grafikkarte)|(?:not|no)\s+used|new(?:\s+only)?\s+(?:gaming[- ]?)?(?:pc|ssd|ram|memory|graphics)|only\s+new)\b/i.test(query);
  const usedOnly = /\b(?:gebraucht\w*|secondhand|second.hand|refurbished|used|pre-owned)\b/i.test(query);
  const inferred = newOnly ? 'new' : usedOnly ? 'used' : 'any';
  const condition = input.condition ?? inferred;
  if (!['any', 'new', 'used'].includes(condition)) throw new Error('Wähle einen gültigen Zustand.');
  if (input.completeCostsOnly != null && typeof input.completeCostsOnly !== 'boolean') {
    throw new Error('Die Kostenoption muss eingeschaltet oder ausgeschaltet sein.');
  }
  const explicit = input.maxPrice != null && input.maxPrice !== '';
  const maxTotal = explicit ? amount(input.maxPrice) : budgetFrom(query);
  if (maxTotal !== null && maxTotal <= 0) throw new Error('Das Gesamtbudget muss mindestens CHF 0.01 betragen.');
  return { maxTotal, condition, completeCostsOnly: input.completeCostsOnly ?? false };
}

export function acceptsOffer(observation, criteria = {}) {
  const summary = costs(observation);
  const conditionMatches = !criteria.condition || criteria.condition === 'any'
    || (criteria.condition === 'new' && observation?.condition === 'Neu')
    || (criteria.condition === 'used' && ['Gebraucht', 'Generalüberholt'].includes(observation?.condition));
  return conditionMatches && !(criteria.maxTotal != null && (summary.minimum === null || summary.minimum > criteria.maxTotal))
    && !(criteria.completeCostsOnly && summary.total === null);
}
