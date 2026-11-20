import { catalog, search, compare, costFields, directLink, isAmount, maxObservationAge } from './deals.mjs';
import { criteriaFor } from './criteria.mjs';
import { readSearches, storeSearch, removeSearch, searchStorageKey } from './saved-searches.mjs';
import { applyChecks } from './observations.mjs';
import { icon, mountIcons } from './ui.mjs';
import { intentFor, addCapacity } from './intent.mjs';
import { setupVoice } from './voice.mjs';
import { costs } from './costs.mjs';
import { setupInstall } from './install.mjs';
import { setupSharing, readSharedSearch } from './share.mjs';
import { m,t,setText,uiError,initializeLanguage,setLanguage,formatMoney,formatDate } from './i18n.mjs';

const get = id => document.getElementById(id);
const storageKey = 'udi.watchlist.v1';
const money = formatMoney;
const conditionText = (value,fallback) => ['Neu','Gebraucht','Generalüberholt','Beschädigt'].includes(value) ? m(value) : value || fallback;
const labels = { verified: m('Verifiziert'), partial: m('Teilweise geprüft'), unconfirmed: m('Unbestätigt') };
const routes = ['radar', 'suche', 'vergleich', 'passport', 'watchlist', 'hilfe'];
let activeProduct = null;
let activeSeller = null;
let observations = [];
let sourceState = 'loading';
let watched = new Set();
let storageError = false;
let activeSearch;
let resultsExpiry;
let observationExpiry;
let activeCriteria = {};
let skippedQuestion = null;
let suggestionReceipt = null;
let voice;
let sharer;
mountIcons();
initializeLanguage();
setupInstall();

function draftInput(query = get('search-query').value.trim()) {
  const form = get('search-query').form;
  return { query, maxPrice: form.elements.maxPrice.value.trim(), condition: form.elements.condition.value || undefined,
    completeCostsOnly: form.elements.completeCostsOnly.checked };
}

function refreshIntent({invalidate=true}={}) {
  if(invalidate)sharer?.invalidate();
  const input = draftInput();
  const target = get('intent-summary');
  const questionBox = get('intent-question');
  questionBox.replaceChildren();
  questionBox.hidden = true;
  if (!input.query) {
    target.replaceChildren(element('p', m('Beschreibe deinen Wunsch. Hier siehst du, wonach UDI suchen wird.'), 'muted'));
    return;
  }
  let intent;
  try { intent = intentFor(input); }
  catch (error) { target.replaceChildren(element('p', uiError(error), 'muted')); return; }
  const origin = suggestionReceipt?.query === input.query ? suggestionReceipt.note : m('Deine Formulierung · wird unverändert gesucht');
  target.replaceChildren(element('p', intent.query, 'intent-query'), element('p', origin, 'intent-origin'));
  const tags = element('div', null, 'intent-tags');
  tags.append(element('span', m('Markt: Schweiz · Pilot'), 'intent-tag'));
  const criteriaLabel = describeCriteria(intent.criteria);
  if (criteriaLabel) tags.append(element('span', criteriaLabel, 'intent-tag'));
  if (skippedQuestion === input.query) tags.append(element('span', m('Kapazität offen · von dir bestätigt'), 'intent-tag'));
  target.append(tags);
  if (intent.question && skippedQuestion !== input.query) {
    questionBox.hidden = false;
    const title = element('h3', m(intent.question.title));
    title.tabIndex = -1;
    const choices = element('div', null, 'intent-choices');
    for (const capacity of intent.question.options) {
      const button = element('button', capacity);
      button.type = 'button';
      button.addEventListener('click', () => {
        const next = addCapacity(input.query, capacity);
        if (!next) { setText(get('notice'),m('Die Ergänzung passt nicht mehr in das Textfeld. Kürze deinen Wunsch.')); return; }
        get('search-query').value = next;
        suggestionReceipt = { query: next, note: m('{capacity} · von UDI vorgeschlagen, von dir gewählt. Im Text bearbeitbar.',{capacity}) };
        refreshIntent();
        get('search-query').focus();
      });
      choices.append(button);
    }
    const skip = element('button', m('Noch offen'));
    skip.type = 'button';
    skip.addEventListener('click', () => { skippedQuestion = input.query; refreshIntent(); get('search-query').focus(); });
    choices.append(skip);
    questionBox.append(title, element('p', m(intent.question.reason)), choices);
  }
}

function restoreSearch(request) {
  get('max-price').value = request.maxPrice;
  get('condition').value = request.condition;
  get('search-query').form.elements.completeCostsOnly.checked = request.completeCostsOnly;
  submit(request.query, request.scope ?? undefined);
}

function renderRecent() {
  const target = get('recent-searches');
  target.replaceChildren();
  try {
    const saved = readSearches(localStorage).slice(0, 3);
    target.hidden = !saved.length;
    if (saved.length) target.append(element('h2', m('Hier kannst du anknüpfen')));
    for (const request of saved) {
      const button = element('button', m('{query} · Erneut prüfen',{query:request.query}));
      button.type = 'button';
      button.addEventListener('click', () => restoreSearch(request));
      target.append(button);
    }
  } catch { target.hidden = true; }
}

async function updateSearches(operation) {
  const run = () => operation(localStorage);
  if (navigator.locks) return navigator.locks.request(searchStorageKey, run);
  return run();
}

function saveSearchButton(input) {
  const button = element('button', m('Suche speichern'), 'text-button');
  button.type = 'button';
  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      await updateSearches(storage => storeSearch(storage, input));
      setText(button,m('Suche gespeichert'));
      renderRecent();
      setText(get('notice'),m('Suchwunsch und Kaufkriterien wurden in deiner Watchlist gespeichert.'));
    } catch (error) {
      button.disabled = false;
      setText(get('notice'),m('Die Suche konnte auf diesem Gerät nicht gespeichert werden.'));
      button.insertAdjacentElement('afterend', element('p', uiError(error), 'muted'));
    }
  });
  return button;
}

function describeCriteria(criteria) {
  if(criteria.maxTotal==null&&!['new','used'].includes(criteria.condition)&&!criteria.completeCostsOnly)return '';
  return m('{value}',()=>({value:[criteria.maxTotal==null?null:t('Gesamtbudget bis {amount}',{amount:money(criteria.maxTotal)}),
    {new:t('Nur neu'),used:t('Gebraucht oder generalüberholt')}[criteria.condition],criteria.completeCostsOnly?t('Nur bestätigte Gesamtkosten'):null].filter(Boolean).join(' · ')}));
}

try {
  const saved = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
  if (!Array.isArray(saved)) throw new Error('Invalid watchlist');
  watched = new Set(saved.filter(mpn => catalog.some(product => product.mpn === mpn)));
} catch {
  storageError = true;
}

function element(tag, content, className) {
  const node = document.createElement(tag);
  if (content != null) setText(node,content);
  if (className) node.className = className;
  return node;
}

function link(label, url, className = 'button', external = false) {
  const anchor = element('a', label, className);
  anchor.href = url;
  if (external) {
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
  }
  return anchor;
}

function productAction(label, route, product, seller = null) {
  const anchor = link(label, '#' + route);
  anchor.addEventListener('click', event => {
    event.preventDefault();
    activeProduct = product;
    activeSeller = seller;
    navigate(route);
  });
  return anchor;
}

function message(title, body) {
  const box = element('div', null, 'surface');
  box.append(element('h2', title), element('p', body, 'muted'));
  return box;
}

function openCosts(observation) {
  const summary = costs(observation);
  if (summary.total !== null) return null;
  return element('p',m('Noch offen: {names}.',()=>({names:costFields.filter(([key])=>summary.missing.includes(key)).map(([,label])=>t(label)).join(', ')||t('vollständiger CHF-Endpreis')})),'cost-open');
}

function appendPriceAdvantage(target, advantage) {
  if (!advantage) return;
  const box = element('section', null, 'value-proof');
  box.append(element('h3',m('Möglicher Preisvorteil: {amount}',()=>({amount:money(advantage.amount)}))),
    element('p',m('Gegenüber {seller} mit {total} Gesamtkosten. Dieselbe Variante, Zustand {condition}, Lieferung an {postalCode} (CH).',()=>({seller:advantage.referenceSeller,total:money(advantage.referenceTotal),condition:t(advantage.condition),postalCode:advantage.deliveryDestination.postalCode})),'muted'),
    element('p',m('Älteste Angebotsprüfung im Vergleich: {checkedAt} (CH). Ein Kauf ist nicht bestätigt; dies ist keine bereits erzielte Ersparnis.',()=>({checkedAt:formatDate(advantage.checkedAt)})),'muted'),
    link(m('Vergleichsangebot bei {seller}',{seller:advantage.referenceSeller}),advantage.referenceUrl,'text-button',true));
  target.append(box);
}

function watchAction(product, remove = false) {
  const button = element('button', remove ? m('Entfernen') : m('Auf die Watchlist'), 'text-button');
  button.type = 'button';
  if (!remove && watched.has(product.mpn)) {
    setText(button,m('Auf der Watchlist'));
    button.disabled = true;
  }
  button.addEventListener('click', () => {
    const next = new Set(watched);
    if (remove) next.delete(product.mpn);
    else next.add(product.mpn);
    try {
      localStorage.setItem(storageKey, JSON.stringify([...next]));
      watched = next;
      storageError = false;
      setText(get('notice'),m(remove ? m('Produkt entfernt.') : m('Produkt gespeichert.')));
      if (remove) {
        renderWatchlist();
        get('saved').querySelector('button, a')?.focus();
      } else {
        button.replaceWith(link(m('Watchlist öffnen'), '#watchlist'));
        const anchors = get('detail').querySelectorAll('a');
        [...anchors].find(anchor => anchor.hash === '#watchlist')?.focus();
      }
    } catch {
      storageError = true;
      setText(get('notice'),m('Die Watchlist konnte auf diesem Gerät nicht gespeichert werden.'));
      button.insertAdjacentElement('afterend', element('p', m('Die Watchlist konnte auf diesem Gerät nicht gespeichert werden.'), 'muted'));
    }
  });
  return button;
}

function productCard(product) {
  const card = message(product.name,m('{variant} · {mpn}',()=>({variant:t(product.variant),mpn:product.mpn})));
  card.append(productAction(m('Händler vergleichen'), 'vergleich', product));
  return card;
}

function renderRadar() {
  const target = get('radar-content');
  const opportunities = catalog.flatMap(product => {
    const { recommendation } = compare(product, observations);
    return recommendation ? [{ product, recommendation }] : [];
  });
  target.replaceChildren();
  if (sourceState !== 'ready' || !opportunities.length) {
    const text = {
      loading: m('Daten werden geladen …'),
      error: m('Angebotsdaten konnten nicht geladen werden. Der Produktvergleich ist weiterhin verfügbar.'),
      ready: m('Derzeit gibt es keine bestätigte Kaufempfehlung. In der Suche findest du die bekannten Händlerseiten.'),
    };
    target.append(element('p', text[sourceState], 'muted'));
    return;
  }
  for (const { product, recommendation } of opportunities) {
    target.append(element('h3',m('{name} · {variant}',()=>({name:product.name,variant:t(product.variant)}))),
      element('p',m('{amount} bei {seller}',()=>({amount:money(recommendation.total),seller:recommendation.seller}))),
      productAction(m('Deal Passport ansehen'), 'passport', product, recommendation.seller));
  }
}

function renderWebResults(result, query) {
  clearTimeout(resultsExpiry);
  const target = get('web-results');
  observations = applyChecks(observations, catalog, result);
  refreshAtExpiry();
  if (!get('passport').hidden || !get('vergleich').hidden) renderRoute();
  if (result.kind === 'clarification') {
    const question = message(m('Darf ein Gebrauchtangebot dabei sein?'), m('Wenn ein Upgrade allein sinnvoll ist, bleibt es im Vergleich.'));
    const choices = element('div', null, 'actions');
    for (const [label, scope] of [[m('Neue Angebote'), 'component'], [m('Auch gebraucht'), 'both']]) {
      const button = element('button', label, 'button');
      button.addEventListener('click', () => submit(query, scope));
      choices.append(button);
    }
    question.append(choices);
    target.replaceChildren(question);
    if (!get('suche').hidden && get('results').contains(document.activeElement)) choices.firstElementChild.focus();
    return;
  }
  if (result.kind !== 'results' || !result.items.length) {
    const messages = {
      disabled: m('Die Websuche ist in dieser Installation noch nicht verbunden.'),
      busy: m('Die Websuche ist gerade ausgelastet. Versuche es in einer Minute erneut.'),
      unavailable: m('Die Websuche ist vorübergehend nicht erreichbar.'),
      invalid: m('Gib einen Kaufwunsch als Text ohne Webadresse ein.'),
      results: result.excluded
        ? m('Die geprüften Angebote erfüllen deine Kaufkriterien nicht. Du kannst dein Budget oder den Zustand anpassen.')
        : result.unconfirmed ? m('Wir konnten die gefundenen Angebote gerade nicht aktuell bestätigen. Versuche es später erneut.')
        : m('Keine passenden aktuellen Angebote gefunden. Ändere deinen Suchwunsch oder versuche es später erneut.'),
      expired: m('Die Angebotsprüfung ist abgelaufen. Suche erneut für den aktuellen Stand.'),
    };
    target.replaceChildren(element('p', messages[result.kind] ?? messages.unavailable, 'surface muted'));
    return;
  }
  const intro = element('div', null, 'section-heading');
  intro.append(element('h2', m('Aktuell geprüft')), element('span',m(result.items.length===1?'{count} Angebot':'{count} Angebote',{count:result.items.length}),'unit'));
  if (result.sourceMode === 'catalog') intro.append(element('p', m('Prüfung der bekannten Katalogquellen'), 'muted'));
  const previousCard = get('results').querySelector('.surface');
  const moveFocus = previousCard?.contains(document.activeElement);
  previousCard?.setAttribute('hidden', '');
  const cards = result.items.map(item => {
    const box = element('article', null, 'surface offer');
    const heading = element('div', null, 'offer-heading');
    const source = element('p', item.source, 'eyebrow');
    source.prepend(icon('shop'));
    heading.append(source, element('span', m('Teilweise geprüft'), 'badge'));
    const check = item.check;
    const layout = element('div', null, 'offer-layout');
    const identity = element('div');
    identity.append(element('h3', item.title));
    if (check.mpn) identity.append(element('p', check.mpn, 'price-caption'));
    const amount = element('div', null, 'offer-cost');
    amount.append(element('p',m('{value}',()=>({value:money(check.total??check.price)})), 'offer-price'),
      element('p', check.total === null ? m('Artikelpreis · Gesamtkosten noch offen') : m('Gesamtkosten inklusive bekannter Pflichtkosten'), 'price-caption'));
    const costNote = openCosts(check);
    if (costNote) amount.append(costNote);
    const costSummary = costs(check);
    if (costSummary.total === null && costSummary.minimum > check.price) amount.append(element('p',
      m('Bisher bekannte Kosten: {amount}. Der Endpreis ist noch offen.',()=>({amount:money(costSummary.minimum)})), 'price-caption'));
    layout.append(identity, amount);
    const meta = element('p',m('Quelle meldet verfügbar · geprüft {checkedAt} (CH)',()=>({checkedAt:formatDate(check.checkedAt)})), 'offer-meta');
    meta.prepend(icon('clock'));
    box.append(heading, layout, meta);
    if (item.budgetStatus === 'unknown-total') box.append(element('p', m('Ob der Endpreis in dein Budget passt, ist noch offen.'), 'muted'));
    const details = element('details');
    details.append(element('summary', m('Prüfung und offene Angaben')));
    details.append(facts([
      [m('Herstellernummer'), check.mpn ?? m('Unbestätigt')],
      [m('Zustand laut Quelle'), conditionText(check.condition,m('Unbestätigt'))],
      [m('Verkäufer laut Quelle'), check.seller ?? m('Unbestätigt')],
      ...costFields.map(([key, label]) => [label, isAmount(check[key]) ? money(check[key]) : m('Unbekannt')]),
      [m('Funktionszustand'), m('Nicht unabhängig getestet')],
    ]));
    const action = link(item.type === 'listing' ? m('Inserat öffnen') : m('Angebotsseite öffnen'), item.url, 'button', true);
    action.addEventListener('click', event => {
      if (Date.now() >= Date.parse(item.expiresAt)) {
        event.preventDefault();
        renderWebResults({ kind: 'expired' }, query);
      }
    });
    const actions = element('div', null, 'actions');
    actions.append(action);
    const knownProduct = catalog.find(product => product.sources.some(source => source.url === item.url));
    if (knownProduct && check.mpn === knownProduct.mpn) {
      actions.append(productAction(m('Deal Passport'), 'passport', knownProduct, item.source));
    }
    box.append(details, actions);
    return box;
  });
  target.replaceChildren(intro, ...cards);
  if (moveFocus && !get('suche').hidden) {
    const title = intro.querySelector('h2');
    title.tabIndex = -1;
    title.focus();
  }
  const expiry = Math.min(...result.items.map(item => Date.parse(item.expiresAt)));
  resultsExpiry = setTimeout(() => renderWebResults({ kind: 'expired' }, query), Math.max(1, expiry - Date.now()));
}

async function submit(query, scope) {
  if (voice?.isRecording()) { voice.stop(); return; }
  get('search-query').value = query;
  refreshIntent();
  if (!get('intent-question').hidden) {
    navigate('suche');
    get('intent-question').querySelector('h3').focus();
    return;
  }
  activeSearch?.abort();
  const request = new AbortController();
  activeSearch = request;
  get('search-query').value = query;
  const form = get('search-query').form;
  const input = {
    query, scope,
    maxPrice: form.elements.maxPrice.value.trim(),
    condition: form.elements.condition.value || undefined,
    completeCostsOnly: form.elements.completeCostsOnly.checked,
  };
  let criteria;
  try {
    criteria = criteriaFor(input);
    get('max-price').removeAttribute('aria-invalid');
  } catch (error) {
    clearTimeout(resultsExpiry);
    get('results').replaceChildren(message(m('Bitte prüfe deine Kaufkriterien'), uiError(error)));
    get('web-results').replaceChildren();
    navigate('suche');
    form.querySelector('.search-options').open = true;
    get('max-price').setAttribute('aria-invalid', 'true');
    get('max-price').focus();
    return;
  }
  const products = search(query);
  get('suche').classList.add('has-search');
  get('search-home').hidden = true;
  activeCriteria = criteria;
  get('results').replaceChildren(...(products.length ? products.map(productCard) : [
    message(m('Dein Suchwunsch'), query),
  ]));
  const criteriaLabel = describeCriteria(criteria);
  if (criteriaLabel) get('results').append(element('p', criteriaLabel, 'muted'));
  get('results').append(saveSearchButton(input));
  clearTimeout(resultsExpiry);
  get('web-results').replaceChildren(element('p', m('Wir suchen und prüfen die Angebote …'), 'surface muted'));
  navigate('suche');
  const resultTitle = get('results').querySelector('h2');
  resultTitle.tabIndex = -1;
  resultTitle.focus();
  try {
    const response = await fetch('./api/discovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(20_000)]),
    });
    const result = await response.json();
    if (!request.signal.aborted) renderWebResults(result, query);
  } catch {
    if (!request.signal.aborted) renderWebResults({ kind: 'unavailable' }, query);
  }
}

function facts(rows) {
  const list = element('dl');
  for (const [name, value] of rows) {
    const row = element('div');
    row.append(element('dt',m(name)), element('dd', value));
    list.append(row);
  }
  return list;
}

function recommendationText(recommendation, comparisonStatus) {
  if (sourceState === 'loading') return m('Angebotsdaten werden geladen …');
  if (sourceState === 'error') return m('Angebotsdaten konnten nicht geladen werden. Öffne die Händlerseite für den aktuellen Stand.');
  if (!recommendation) {
    if (comparisonStatus === 'missing-basis') return m('Kaufentscheid offen. Zustand oder Lieferort sind nicht für alle Angebote belegt. Ein fairer Preisvorteil lässt sich noch nicht bestätigen.');
    if (comparisonStatus === 'different-basis') return m('Kaufentscheid offen. Zustand oder Lieferort unterscheiden sich. Diese Angebote begründen keinen gemeinsamen Preisvorteil.');
    if (comparisonStatus === 'same-price') return m('Kaufentscheid offen. Die vergleichbaren Angebote haben dieselben Gesamtkosten; ein Preisvorteil ist nicht belegt.');
    return m('Kaufentscheid offen. Für eine Empfehlung braucht es zwei verfügbare Angebote mit aktuellen, vollständigen Gesamtkosten, demselben Zustand und demselben belegten Lieferort.');
  }
  return m('{seller} hat im belegten Vergleich für denselben Zustand und Lieferort die tiefsten Gesamtkosten ({amount}).',()=>({seller:recommendation.seller,amount:money(recommendation.total)}));
}

function factsFor(offer) {
  const observation = offer.observation;
  const available = observation?.stock === 'in-stock' ? m('Verfügbar')
    : observation?.stock === 'out-of-stock' ? m('Nicht verfügbar') : m('Unbestätigt');
  return [
    [m('Artikelpreis'), isAmount(observation?.price) && observation.price > 0 ? money(observation.price) : m('Unbekannt')],
    [m('Gesamtkosten'), offer.total === null ? m('Unbekannt') : money(offer.total)],
    [m('Zustand laut Quelle'), conditionText(observation?.condition,m('Nicht belegt'))],
    [m('Lieferziel des Preises'), observation?.deliveryDestination?.country === 'CH'
      && /^[1-9]\d{3}$/.test(observation.deliveryDestination.postalCode)
      ? observation.deliveryDestination.postalCode + ' (CH)' : m('Nicht belegt')],
    [m('Verfügbarkeit'), available],
    [m('Prüfzeitpunkt'), observation ? m('{checkedAt} (CH)',()=>({checkedAt:formatDate(observation.checkedAt)})) : m('Keine aktuelle Prüfung')],
  ];
}

function renderComparison() {
  const target = get('comparison');
  if (!activeProduct) {
    const box = message(m('Wähle eine SSD'), m('Öffne die Suche und wähle ein Produkt für den Händlervergleich.'));
    box.append(link(m('Zur Suche'), '#suche'));
    target.replaceChildren(box);
    return;
  }
  const { offers, recommendation, priceAdvantage, comparisonStatus } = compare(activeProduct, observations, Date.now(), activeCriteria);
  const columns = element('div', null, 'columns');
  for (const offer of offers) {
    const box = element('article', null, 'surface');
    box.append(element('h3', offer.seller), element('span', labels[offer.state], 'badge ' + offer.state),
      facts(factsFor(offer)));
    if (offer.excluded) box.append(element('p', m('Erfüllt deine Kaufkriterien nicht.'), 'muted'));
    else box.append(productAction(m('Deal Passport · {seller}',{seller:offer.seller}), 'passport', activeProduct, offer.seller));
    columns.append(box);
  }
  const heading = message(m('{name} · {variant}',()=>({name:activeProduct.name,variant:t(activeProduct.variant)})), activeProduct.mpn);
  const criteriaLabel = describeCriteria(activeCriteria);
  if (criteriaLabel) heading.append(element('p', criteriaLabel, 'muted'));
  heading.append(element('p', recommendationText(recommendation, comparisonStatus)));
  appendPriceAdvantage(heading, priceAdvantage);
  target.replaceChildren(heading, columns);
}

function renderPassport() {
  const target = get('detail');
  if (!activeProduct || !activeSeller) {
    const box = message(m('Wähle einen Händler'), m('Im Vergleich findest du den Deal Passport für jede Händlerseite.'));
    box.append(link(m('Zum Vergleich'), '#vergleich'));
    target.replaceChildren(box);
    return;
  }
  const { offers, recommendation, priceAdvantage, comparisonStatus } = compare(activeProduct, observations, Date.now(), activeCriteria);
  const offer = offers.find(row => row.seller === activeSeller);
  if (offer.excluded) {
    const box = message(m('Angebot erfüllt deine Kaufkriterien nicht'), m('Suche mit angepassten Kriterien oder öffne den Vergleich.'));
    box.append(link(m('Zum Vergleich'), '#vergleich'));
    target.replaceChildren(box);
    return;
  }
  const box = message(offer.seller + ' · ' + activeProduct.name,m('{variant} · {mpn}',()=>({variant:t(activeProduct.variant),mpn:activeProduct.mpn})));
  const observation = offer.observation;
  const risk = {
    verified: m('Preis und Bestand können sich seit der Prüfung ändern. Kontrolliere die Angaben vor dem Kauf.'),
    partial: observation
      ? m('Die vorliegenden Angebotsdaten sind unvollständig. Kontrolliere die offenen Angaben vor dem Kauf.')
      : m('Die Produktvariante wurde der Händlerseite zugeordnet. Preis, Bestand, Lieferbedingungen und Weiterleitungen sind derzeit nicht aktuell bestätigt.'),
    unconfirmed: m('Die letzte Prüfung konnte dieses Angebot nicht bestätigen. Eine aktuelle passende Angebotsprüfung fehlt.'),
  };
  const expenses = costFields.map(([key, label]) => {
    const amount = observation?.[key];
    return [label, isAmount(amount) && (key !== 'price' || amount > 0) ? money(amount) : m('Unbekannt')];
  });
  const delivery = typeof observation?.delivery === 'string' && observation.delivery.trim();
  box.append(element('span', labels[offer.state], 'badge ' + offer.state),
    facts([...factsFor(offer), ...expenses, [m('Lieferbedingungen'), delivery || m('Unbestätigt')],
      [m('Quelle'), new URL(offer.url).hostname]]), element('p', risk[offer.state], 'muted'));
  const costNote = openCosts(observation);
  if (costNote) box.append(costNote);
  const actions = element('div', null, 'actions');
  const url = directLink(offer.url, activeProduct);
  if (url && offer.state !== 'unconfirmed') actions.append(link(m('{seller} öffnen',{seller:offer.seller}), url, 'button', true));
  actions.append(watchAction(activeProduct));
  box.append(actions);
  const guidance = message(m('Kaufentscheid'), recommendationText(recommendation, comparisonStatus));
  if (recommendation?.seller === offer.seller) appendPriceAdvantage(guidance, priceAdvantage);
  guidance.append(element('p', m(activeProduct.compatibility)),
    link(m('Technische Daten bei Samsung'), activeProduct.manufacturer, 'text-button', true),
    link(m('Händler vergleichen'), '#vergleich'));
  target.replaceChildren(box, guidance);
}

function renderWatchlist() {
  const items = catalog.filter(product => watched.has(product.mpn));
  const boxes = items.map(product => {
    const box = message(product.name,m('{variant} · {mpn}',()=>({variant:t(product.variant),mpn:product.mpn})));
    const actions = element('div', null, 'actions');
    actions.append(productAction(m('Händler vergleichen'), 'vergleich', product), watchAction(product, true));
    box.append(actions);
    return box;
  });
  try {
    for (const request of readSearches(localStorage)) {
      const box = message(request.query, describeCriteria(criteriaFor(request)) || m('Alle Zustände'));
      const actions = element('div', null, 'actions');
      const searchAgain = element('button', m('Erneut prüfen'), 'button');
      searchAgain.type = 'button';
      searchAgain.addEventListener('click', () => restoreSearch(request));
      const remove = element('button', m('Suche entfernen'), 'text-button');
      remove.type = 'button';
      remove.addEventListener('click', async () => {
        remove.disabled = true;
        try {
          await updateSearches(storage => removeSearch(storage, request));
          renderWatchlist();
          setText(get('notice'),m('Gespeicherte Suche entfernt.'));
          get('saved').querySelector('button, a')?.focus();
        } catch (error) {
          remove.disabled = false;
          box.append(element('p',m('Die Suche konnte nicht entfernt werden. {error}',()=>({error:uiError(error)})), 'muted'));
        }
      });
      actions.append(searchAgain, remove);
      box.append(actions);
      boxes.push(box);
    }
  } catch {
    boxes.push(message(m('Gespeicherte Suchen nicht lesbar'), m('Die gespeicherten Daten bleiben auf diesem Gerät. Prüfe die Browsereinstellungen für lokalen Speicher.')));
  }
  if (!boxes.length) {
    const empty = message(m('Deine Watchlist ist leer'), m('Speichere deinen Suchwunsch mit Budget und Kriterien. Du kannst später mit einem Klick erneut prüfen.'));
    empty.append(link(m('Zur Suche'), '#suche'));
    boxes.push(empty);
  }
  boxes.push(element('p', m('Die Watchlist bleibt in diesem Browser. Automatische Benachrichtigungen sind noch nicht verfügbar.'), 'muted'));
  if (storageError) boxes.push(element('p', m('Der lokale Speicher ist zurzeit nicht lesbar oder beschreibbar.'), 'muted'));
  get('saved').replaceChildren(...boxes);
}

function renderRoute(focus = false) {
  const hash = location.hash.slice(1).split('?')[0];
  const current = routes.find(id => !get(id).hidden);
  const route = routes.includes(hash) ? hash : (hash === 'main' ? current ?? 'suche' : 'suche');
  if (route !== 'suche' && voice?.isRecording()) voice.stop();
  if (route === 'suche') renderRecent();
  for (const id of routes) get(id).hidden = id !== route;
  for (const anchor of document.querySelectorAll('nav a')) {
    if (anchor.hash === '#' + (route === 'passport' ? 'vergleich' : route)) anchor.setAttribute('aria-current', 'page');
    else anchor.removeAttribute('aria-current');
  }
  if (route === 'vergleich') renderComparison();
  if (route === 'passport') renderPassport();
  if (route === 'watchlist') renderWatchlist();
  if (focus && hash !== 'main') {
    const title = get(route).querySelector('h1');
    title.tabIndex = -1;
    title.focus();
  }
}

function navigate(route) {
  if (location.hash !== '#' + route) history.pushState(null, '', '#' + route);
  renderRoute(true);
}

for (const form of document.querySelectorAll('[data-search]')) {
  form.addEventListener('submit', event => {
    event.preventDefault();
    const query = new FormData(form).get('query').trim();
    if (query) submit(query);
    else form.querySelector('input').focus();
  });
}
for (const button of document.querySelectorAll('[data-example]')) {
  button.addEventListener('click', () => {
    get('search-query').value = 'Samsung 990 PRO 2 TB';
    refreshIntent();
    navigate('suche');
    get('search-query').focus();
  });
}
for (const button of document.querySelectorAll('[data-prompt]')) {
  button.addEventListener('click', () => {
    get('search-query').value = button.dataset.prompt;
    refreshIntent(); get('search-query').focus();
  });
}
const composer = get('search-query').form;
get('ui-language').addEventListener('change',event=>{
  if(voice?.isRecording())voice.stop();
  const saved=setLanguage(event.target.value,{persist:true});
  refreshIntent({invalidate:false});renderRadar();renderRoute();
  setText(get('notice'),m(saved?'Sprache geändert. Dein Suchtext und deine Kriterien bleiben erhalten.':'Sprache für diese Sitzung geändert. Die Einstellung konnte nicht gespeichert werden.'));
});
composer.addEventListener('input', refreshIntent);
composer.addEventListener('change', refreshIntent);
get('search-query').addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault(); composer.requestSubmit();
  }
});
voice = setupVoice(composer, refreshIntent);
sharer = setupSharing(document, draftInput);
function importSharedSearch() {
  try {
    const input=readSharedSearch(location.hash);
    if(!input)return;
    if(voice?.isRecording())throw new Error('Beende zuerst deine Aufnahme. Dein Text bleibt erhalten; öffne den geteilten Link danach erneut.');
    activeSearch?.abort();clearTimeout(resultsExpiry);
    get('results').replaceChildren();get('web-results').replaceChildren();
    get('suche').classList.remove('has-search');get('search-home').hidden=false;
    get('search-query').value=input.query;get('max-price').value=input.maxPrice;get('condition').value=input.condition;
    composer.elements.completeCostsOnly.checked=input.completeCostsOnly;
    refreshIntent();
    get('shared-notice').hidden=false;
    setText(get('shared-notice'),m('Geteilte Suche übernommen. Prüfe oder ändere Text und Kriterien und starte die Prüfung bewusst. Nach einer Installation kannst du den Original-Link erneut öffnen; eine automatische Übergabe ist nicht garantiert.'));
  }catch(error){get('shared-notice').hidden=false;setText(get('shared-notice'),m('Geteilte Suche nicht übernommen. {error} Du kannst deinen Wunsch selbst eingeben.',()=>({error:uiError(error)})));}
}
importSharedSearch();
window.addEventListener('hashchange', event => {
  if (event.newURL === location.href) {importSharedSearch();renderRoute(true);}
});
window.addEventListener('storage', event => {
  if (event.key === searchStorageKey && !get('watchlist').hidden) renderWatchlist();
});
renderRoute();

try {
  const response = await fetch('./observations.json', { cache: 'no-store', signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error('Observation data unavailable');
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Invalid observation data');
  const currentUrls = new Set(observations.map(row => row?.url));
  observations = [...data.filter(row => !currentUrls.has(row?.url)), ...observations];
  sourceState = 'ready';
} catch {
  sourceState = 'error';
}
renderRadar();
renderRoute();

function refreshAtExpiry() {
  clearTimeout(observationExpiry);
  const now = Date.now();
  const expiry = catalog.flatMap(product => compare(product, observations, now).offers)
    .filter(offer => offer.observation)
    .map(offer => Date.parse(offer.observation.checkedAt) + maxObservationAge);
  if (!expiry.length) return;
  observationExpiry = setTimeout(() => {
    renderRadar();
    renderRoute();
    refreshAtExpiry();
  }, Math.max(1, Math.min(...expiry) - now));
}
refreshAtExpiry();
