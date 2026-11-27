import { catalog, search, compare, costFields, directLink, isAmount, maxObservationAge } from './deals.mjs';
import { criteriaFor } from './criteria.mjs';
import { readSearches, storeSearch, removeSearch, searchStorageKey } from './saved-searches.mjs';
import {createSearchPersistence,nativeSearchPreferences} from './search-persistence.mjs';
import {bindDailyUpdate} from './daily-update.mjs';
import {configureNativeUI} from './native-ui.mjs';
import {configuredPilotSession,bindPilotSignIn,localTestEnabled} from './pilot-sign-in.mjs';
import { applyChecks } from './observations.mjs';
import { icon, mountIcons } from './ui.mjs';
import { intentFor, addCapacity } from './intent.mjs';
import { setupVoice } from './voice.mjs';
import { costs, priceStatus } from './costs.mjs';
import { setupInstall } from './install.mjs';
import { setupSharing, readSharedSearch } from './share.mjs';
import {runtimePlatform,discoverOffers,loadObservations} from './runtime.mjs';
import {searchContext} from './markets.mjs';
import { m,t,setText,uiError,initializeLanguage,setLanguage,formatMoney,formatDate } from './i18n.mjs';

const get = id => document.getElementById(id);
const storageKey = 'udi.watchlist.v1';
const money = formatMoney;
const conditionText = (value,fallback) => ['Neu','Gebraucht','Generalüberholt','Beschädigt'].includes(value) ? m(value) : value || fallback;
const priceLabels = {
  confirmed: m('Verbindlich bestätigt'),
  checked: m('Preis geprüft'),
  incomplete: m('Unvollständig / Schätzung'),
  unverifiable: m('Nicht verifizierbar'),
};
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
let savedLoad;
let activeCriteria = {};
let skippedQuestion = null;
let suggestionReceipt = null;
let voice;
let sharer;
mountIcons();
initializeLanguage();
const platform=runtimePlatform();
const localTestMode=localTestEnabled(document,platform);
const compactLayout=localTestMode || platform!=='web';
const fixtureMode=localTestMode || (['android','ios'].includes(platform) && Boolean(document.querySelector('meta[name="udi-native-fixture"]')));
if (fixtureMode) {
  const notice = element('p', m(localTestMode?'Lokale Testansicht im Browser · Nur simulierte Konten und Preise':'Testumgebung · Nur simulierte Konten und Preise'), 'surface shared-notice');
  notice.id = 'native-fixture-notice';
  const account = element('span');
  account.id = 'native-fixture-account';
  notice.append(account);
  get('main').querySelector('.shell').prepend(notice);
}
if (localTestMode) {
  get('pilot-sign-in').querySelector('[data-pilot-intro]').after(element('p',
    m('Testzugang: plus@udi.test · Code 123456.'), 'muted'));
}
const pilotSession=await configuredPilotSession(document,platform);
let fixtureAccountRead=0;
async function refreshFixtureAccount(signedIn) {
  const label = get('native-fixture-account');
  if (!label || !pilotSession?.getFixtureAccount) return;
  const read = ++fixtureAccountRead;
  if (!signedIn) { setText(label, ''); return; }
  try {
    const account = await pilotSession.getFixtureAccount();
    if (read !== fixtureAccountRead || !account) return;
    setText(label, m(' · Testabo {plan} · {used} von {limit} Suchen',
      {plan:account.plan==='plus'?'Plus':'Free',used:account.used,limit:account.limit}));
  } catch {
    if (read === fixtureAccountRead) setText(label, m(' · Testkontingent nicht verfügbar'));
  }
}
const pilotConfigured=localTestMode || (['android','ios'].includes(platform)&&Boolean(document.querySelector('meta[name="udi-native-pilot"]')));
const pilotSystemMessage='Aktualisiere dein Betriebssystem, um dich im Pilot anzumelden. Du kannst deinen Wunsch weiterhin eingeben.';
document.documentElement.toggleAttribute('data-native-ui',compactLayout);
let searchPersistence;
if(!pilotConfigured) {
  try {
    const preferences=['android','ios'].includes(platform)?nativeSearchPreferences(globalThis.Capacitor):undefined;
    let timer;
    try {searchPersistence=await Promise.race([createSearchPersistence({storage:localStorage,preferences}),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Gespeicherte Suchen konnten nicht gelesen werden.')),5000);})]);}
    finally {clearTimeout(timer);}
  } catch(error) {
    searchPersistence={storage:{getItem(){throw error;}},update:async()=>{throw error;}};
  }
}
if(compactLayout) {
  configureNativeUI(document);
  if(pilotConfigured&&!pilotSession)setText(get('native-runtime-status'),m(pilotSystemMessage));
}
const pilotSignIn=pilotSession && bindPilotSignIn({
  dialog:get('pilot-sign-in'),
  openButton:get('pilot-account'),
  searchButton:get('suche').querySelector('.primary-search'),
  session:pilotSession,
  async beforeOpen() {
    let timer;
    try {
      const deadline=new Promise(resolve=>{timer=setTimeout(()=>resolve(false),4000);});
      if(await Promise.race([voice?.stop(),deadline])!==false)return true;
      const form=get('search-query').form;
      form.querySelector('[data-voice]').hidden=false;
      setText(form.querySelector('[data-voice-status]'),m('Beende dein Diktat, bevor du dich anmeldest.'));
      return false;
    } finally {clearTimeout(timer);}
  },
  onSessionChange(signedIn) {
    void refreshFixtureAccount(signedIn);
    const status=get('native-runtime-status');
    const field=get('search-query');
    status.hidden=signedIn;
    setText(status,m('Melde dich an, wenn du deinen Wunsch prüfen möchtest.'));
    if(signedIn)field.removeAttribute('aria-describedby');
    else field.setAttribute('aria-describedby',status.id);
  },
  onSignOut() {
    void voice?.stop();
    activeSearch?.abort();
    clearTimeout(resultsExpiry);
    activeProduct=null;
    activeSeller=null;
    activeCriteria={};
    get('search-query').form.reset();
    get('shared-notice').hidden=true;
    get('results').replaceChildren();
    get('search-outcome').hidden=true;
    get('web-results').replaceChildren();
    get('comparison').replaceChildren();
    get('detail').replaceChildren();
    savedLoad?.abort();
    get('saved').replaceChildren();
    get('suche').classList.remove('has-search');
    get('search-home').hidden=false;
    refreshIntent();
    navigate('suche');
  },
});
bindDailyUpdate(get('daily-update'));
if (!localTestMode) setupInstall();

function draftInput(query = get('search-query').value.trim()) {
  const form = get('search-query').form;
  return { ...searchContext(),query, maxPrice: form.elements.maxPrice.value.trim(), condition: form.elements.condition.value || undefined,
    completeCostsOnly: form.elements.completeCostsOnly.checked };
}

function refreshIntent({invalidate=true}={}) {
  if(invalidate)sharer?.invalidate();
  const input = draftInput();
  const target = get('intent-summary');
  const panel = get('intent-compass');
  panel.hidden = true;
  target.replaceChildren();
  get('suche').querySelector('.share-search').hidden = !input.query || compactLayout;
  const questionBox = get('intent-question');
  questionBox.replaceChildren();
  questionBox.hidden = true;
  if (!input.query) {
    return;
  }
  let intent;
  try { intent = intentFor(input); }
  catch (error) { panel.hidden=false;target.replaceChildren(element('p', uiError(error), 'muted')); return; }
  if(suggestionReceipt?.query===input.query)target.append(element('p',suggestionReceipt.note,'intent-origin'));
  const tags = element('div', null, 'intent-tags');
  const criteriaLabel = describeCriteria(intent.criteria);
  if (criteriaLabel) tags.append(element('span', criteriaLabel, 'intent-tag'));
  if (skippedQuestion === input.query) tags.append(element('span', m('Kapazität offen · von dir bestätigt'), 'intent-tag'));
  if(tags.childNodes.length)target.append(tags);
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
  panel.hidden=!target.childNodes.length&&questionBox.hidden;
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
  if(compactLayout){target.hidden=true;return;}
  try {
    const saved = readSearches(searchPersistence.storage).slice(0, 3);
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
  const run = () => searchPersistence.update(operation);
  if (navigator.locks) return navigator.locks.request(searchStorageKey, run);
  return run();
}

function saveSearchButton(input) {
  const button = element('button', m('Suche speichern'), 'text-button');
  let errorNote;
  button.type = 'button';
  button.addEventListener('click', async () => {
    errorNote?.remove();
    button.disabled = true;
    try {
      if(pilotSession)await pilotSession.saveSearch(input);
      else await updateSearches(storage => storeSearch(storage, input));
      if(!button.isConnected)return;
      setText(button,m('Suche gespeichert'));
      renderRecent();
      setText(get('notice'),m('Suchwunsch und Kaufkriterien wurden in deiner Watchlist gespeichert.'));
    } catch (error) {
      if(!button.isConnected)return;
      pilotSignIn?.updateButton();
      button.disabled = false;
      setText(get('notice'),m('Die Suche konnte auf diesem Gerät nicht gespeichert werden.'));
      errorNote=element('p',uiError(error),'muted');
      errorNote.setAttribute('role','alert');
      button.insertAdjacentElement('afterend',errorNote);
    }
  });
  return button;
}

function describeCriteria(criteria) {
  if(criteria.maxTotal==null&&!['new','used'].includes(criteria.condition)&&!criteria.completeCostsOnly)return '';
  return m('{value}',()=>({value:[criteria.maxTotal==null?null:t('Gesamtbudget bis {amount}',{amount:money(criteria.maxTotal)}),
    {new:t('Nur neu'),used:t('Gebraucht oder generalüberholt')}[criteria.condition],criteria.completeCostsOnly?t('Nur bestätigte Gesamtkosten'):null].filter(Boolean).join(' · ')}));
}

if(!pilotConfigured) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    if (!Array.isArray(saved)) throw new Error('Invalid watchlist');
    watched = new Set(saved.filter(mpn => catalog.some(product => product.mpn === mpn)));
  } catch {
    storageError = true;
  }
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
  if (!fixtureMode) card.append(productAction(m('Händler vergleichen'), 'vergleich', product));
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
  try{searchContext(result);}catch(error){target.replaceChildren(message(m('Bitte prüfe deine Kaufkriterien'),uiError(error)));return;}
  if(!result.testData)observations = applyChecks(observations, catalog, result);
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
  if(result.kind==='outside-catalog') {
    const note=message(m('Für diese Suche fehlt eine prüfbare Quelle'),
      m('Der Pilot kann nur bestimmte Angebote prüfen. Dein Suchkontingent bleibt unverändert.'));
    const edit=element('button',m('Suchwunsch bearbeiten'),'text-button');
    edit.type='button';
    edit.addEventListener('click',()=>get('search-query').focus());
    note.append(edit);
    target.replaceChildren(note);
    return;
  }
  if (result.kind === 'results' && !result.items.length && result.missingCompleteCosts > 0) {
    const note = message(m('Kein Gesamtpreis bestätigt'), m('Für die infrage kommenden Angebote fehlen einzelne Kostenangaben.'));
    const review = element('button', m('Kostenfilter prüfen'), 'text-button');
    review.type = 'button';
    review.addEventListener('click', () => {
      const form = get('search-query').form;
      form.querySelector('.search-options').open = true;
      form.elements.completeCostsOnly.focus();
    });
    note.append(review);
    target.replaceChildren(note);
    return;
  }
  if (result.kind !== 'results' || !result.items.length) {
    const messages = {
      disabled: m('Die Websuche ist in dieser Installation noch nicht verbunden.'),
      'native-unavailable':m('Die Angebotssuche ist in dieser App-Version noch nicht verbunden. Gespeicherte Suchen bleiben verfügbar.'),
      'configuration-error':m('Der Angebotsdienst ist noch nicht richtig verbunden. Gespeicherte Suchen bleiben verfügbar.'),
      'authentication-required':m('Für diese Suche fehlt eine gültige Anmeldung am Angebotsdienst.'),
      'authentication-expired':m('Deine Anmeldung am Angebotsdienst ist abgelaufen. Verbinde die App erneut.'),
      'access-denied':m('Deine Anmeldung hat keinen Zugriff auf diesen Angebotsdienst.'),
      'invalid-response':m('Die Antwort konnte nicht sicher geprüft werden. Es werden keine Angebote angezeigt.'),
      timeout:m('Die Suche dauert zu lange. Versuche es erneut.'),
      offline:m('Du bist offline. Gespeicherte Suchen bleiben verfügbar.'),
      'network-error':m('Die Verbindung zum Angebotsdienst ist fehlgeschlagen. Prüfe deine Verbindung und versuche es erneut.'),
      cancelled:m('Die Suche wurde abgebrochen. Dein Suchtext bleibt erhalten.'),
      busy: m('Die Websuche ist gerade ausgelastet. Versuche es in einer Minute erneut.'),
      'quota-exhausted': m('Dein Suchkontingent ist aufgebraucht. Im nächsten Abrechnungszeitraum kannst du wieder suchen.'),
      unavailable: m('Die Websuche ist vorübergehend nicht erreichbar.'),
      invalid: m('Gib einen Kaufwunsch als Text ohne Webadresse ein.'),
      results: result.excluded
        ? m('Die geprüften Angebote erfüllen deine Kaufkriterien nicht. Du kannst dein Budget oder den Zustand anpassen.')
        : result.unconfirmed ? m('Wir konnten die gefundenen Angebote gerade nicht aktuell bestätigen. Versuche es später erneut.')
        : m('Keine passenden aktuellen Angebote gefunden. Ändere deinen Suchwunsch oder versuche es später erneut.'),
      expired: m('Die Angebotsprüfung ist abgelaufen. Suche erneut für den aktuellen Stand.'),
    };
    if (['expired', 'unavailable', 'invalid-response', 'network-error', 'timeout', 'offline'].includes(result.kind) ||
      (result.kind === 'results' && !result.excluded && result.unconfirmed)) {
      target.replaceChildren(message(priceLabels.unverifiable, messages[result.kind]));
    } else {
      target.replaceChildren(element('p', messages[result.kind] ?? messages.unavailable, 'surface muted'));
    }
    return;
  }
  const intro = element('div', null, 'section-heading');
  intro.append(element('p', m(result.testData?'Testantwort':'Aktuell geprüft'), 'offer-receipt'), element('span',m(result.items.length===1?'{count} Angebot':'{count} Angebote',{count:result.items.length}),'unit'));
  if (result.sourceMode === 'catalog' && !result.testData) intro.append(element('p', m('Prüfung der bekannten Katalogquellen'), 'muted'));
  const previousCard = get('results').querySelector('.surface');
  previousCard?.setAttribute('hidden', '');
  const cards = result.items.map(item => {
    const box = element('article', null, 'surface offer');
    const heading = element('div', null, 'offer-heading');
    const source = element('p', item.source, 'eyebrow');
    source.prepend(icon('shop'));
    const check = item.check;
    const status = priceStatus(check);
    heading.append(source, element('span', priceLabels[status], 'badge ' + status));
    const product = catalog.find(product => product.mpn === check.mpn && product.sources.some(source => source.url === item.url));
    const layout = element('div', null, 'offer-layout');
    const identity = element('div');
    identity.append(element('h3', product
      ? m('{name} · {variant}',()=>({name:product.name,variant:t(product.variant)}))
      : item.title));
    if (check.mpn) identity.append(element('p', check.mpn, 'price-caption'));
    const amount = element('div', null, 'offer-cost');
    amount.append(element('p',m('{value}',()=>({value:money(check.total??check.price)})), 'offer-price'),
      element('p', status === 'confirmed'
        ? m('Bestätigter Endpreis für {postalCode} (CH)', {postalCode:check.priceConfirmation.postalCode})
        : check.total === null ? m('Artikelpreis · Gesamtkosten noch offen')
        : m('Gesamtkosten laut Quelle'), 'price-caption'));
    const costNote = openCosts(check);
    if (costNote) amount.append(costNote);
    const costSummary = costs(check);
    if (costSummary.total === null && costSummary.minimum > check.price) amount.append(element('p',
      m('Bisher bekannte Kosten: {amount}. Der Endpreis ist noch offen.',()=>({amount:money(costSummary.minimum)})), 'price-caption'));
    layout.append(identity, amount);
    const meta = element('p',m(result.testData?'Testdaten · beispielhafte Prüfzeit {checkedAt}':'Quelle meldet verfügbar · geprüft {checkedAt} (CH)',()=>({checkedAt:formatDate(check.checkedAt)})), 'offer-meta');
    meta.prepend(icon('clock'));
    box.append(heading, layout, meta);
    if (item.budgetStatus === 'unknown-total') box.append(element('p', m('Ob der Endpreis in dein Budget passt, ist noch offen.'), 'muted'));
    const details = element('details');
    details.append(element('summary', m('Preisdetails und Quelle')));
    details.append(facts([
      [m('Herstellernummer'), check.mpn ?? m('Unbestätigt')],
      [m('Zustand laut Quelle'), conditionText(check.condition,m('Unbestätigt'))],
      [m('Verkäufer laut Quelle'), check.seller ?? m('Unbestätigt')],
      ...costFields.map(([key, label]) => [label, isAmount(check[key]) ? money(check[key]) : m('Unbekannt')]),
      [m('Angerechneter Rabatt'), isAmount(check.discount) ? money(check.discount) : m('Nicht belegt')],
      [m('Lieferziel des Preises'), checkedDelivery(check)],
      [m('Funktionszustand'), m('Nicht unabhängig getestet')],
    ]));
    const action = result.testData?element('p',m('Testdaten: Anbieterlink deaktiviert.'),'muted')
      :link(item.type === 'listing' ? m('Inserat öffnen') : m('Angebotsseite öffnen'), item.url, 'button', true);
    action.addEventListener('click', event => {
      if (Date.now() >= Date.parse(item.expiresAt)) {
        event.preventDefault();
        renderWebResults({ kind: 'expired' }, query);
      }
    });
    const actions = element('div', null, 'actions');
    actions.append(action);
    if (!result.testData && product) {
      actions.append(productAction(m('Deal Passport'), 'passport', product, item.source));
    }
    box.append(details, actions);
    return box;
  });
  target.replaceChildren(intro, ...cards);
  if(result.testData)intro.append(element('p',m('TESTDATEN – keine aktuellen Kaufangebote. Es wurde kein Anbieter geprüft.'),'fixture-price-note'));
  const expiry = Math.min(...result.items.map(item => Date.parse(item.expiresAt)));
  resultsExpiry = setTimeout(() => renderWebResults({ kind: 'expired' }, query), Math.max(1, expiry - Date.now()));
}

function cancelSearch() {
  if (!activeSearch) return;
  activeSearch.abort();
  activeSearch = null;
  renderWebResults({kind:'cancelled'}, get('search-query').value);
}

async function submit(query, scope) {
  if (voice?.isRecording()) { voice.stop(); return; }
  cancelSearch();
  get('search-query').value = query;
  refreshIntent();
  if (!get('intent-question').hidden) {
    navigate('suche');
    get('intent-question').querySelector('h3').focus();
    return;
  }
  const form = get('search-query').form;
  const input = {
    ...searchContext(),
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
    get('search-outcome').hidden=false;
    get('results').replaceChildren(message(m('Bitte prüfe deine Kaufkriterien'), uiError(error)));
    get('web-results').replaceChildren();
    navigate('suche');
    form.querySelector('.search-options').open = true;
    get('max-price').setAttribute('aria-invalid', 'true');
    get('max-price').focus();
    return;
  }
  if(pilotConfigured&&!pilotSession) {
    const status=get('native-runtime-status');
    status.tabIndex=-1;
    status.focus();
    return;
  }
  if(pilotSession && !pilotSession.isSignedIn()) {
    pilotSignIn.updateButton();
    void pilotSignIn.open(form.querySelector('.primary-search'));
    return;
  }
  const products = search(query);
  get('suche').classList.add('has-search');
  get('search-home').hidden = true;
  activeCriteria = criteria;
  const context = message(m('Dein Suchwunsch'), query);
  context.classList.add('request-context');
  get('results').replaceChildren(...(products.length && !fixtureMode ? products.map(productCard) : [context]));
  const criteriaLabel = describeCriteria(criteria);
  if (criteriaLabel) get('results').append(element('p', criteriaLabel, 'muted'));
  get('results').append(saveSearchButton(input));
  const request = new AbortController();
  activeSearch = request;
  clearTimeout(resultsExpiry);
  const loading = element('div', null, 'surface');
  const status = element('p', m('Wir suchen und prüfen die Angebote …'), 'muted');
  status.setAttribute('role', 'status');
  const cancel = element('button', m('Suche abbrechen'), 'text-button');
  cancel.type = 'button';
  cancel.dataset.cancelSearch = '';
  cancel.addEventListener('click', () => {
    form.querySelector('.primary-search').focus();
    cancelSearch();
  });
  loading.append(status, cancel);
  get('web-results').replaceChildren(loading);
  navigate('suche');
  const outcome = get('search-outcome');
  outcome.hidden=false;
  get('search-outcome-title').focus({preventScroll:true});
  // This anchor survives loading and the final reply, so focus remains stable.
  outcome.scrollIntoView({block:'start',behavior:'instant'});
  const deadline = AbortSignal.timeout(20_000);
  try {
    const result = await discoverOffers(input, {
      signal: AbortSignal.any([request.signal, deadline]),
      client:pilotSession??undefined,
    });
    if (!request.signal.aborted) {
      pilotSignIn?.updateButton();
      renderWebResults(result, query);
    }
  } catch {
    if (!request.signal.aborted) renderWebResults({kind: deadline.aborted ? 'timeout' : 'unavailable'}, query);
  } finally {
    if (activeSearch === request) activeSearch = null;
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

function checkedDelivery(observation) {
  const destination = observation?.deliveryDestination;
  return destination?.country === 'CH' && /^[1-9]\d{3}$/.test(destination.postalCode)
    ? destination.postalCode + ' (CH)' : m('Nicht belegt');
}

function factsFor(offer) {
  const observation = offer.observation;
  const available = observation?.stock === 'in-stock' ? m('Verfügbar')
    : observation?.stock === 'out-of-stock' ? m('Nicht verfügbar') : m('Unbestätigt');
  return [
    [m('Artikelpreis'), isAmount(observation?.price) && observation.price > 0 ? money(observation.price) : m('Unbekannt')],
    [m('Gesamtkosten'), offer.total === null ? m('Unbekannt') : money(offer.total)],
    [m('Zustand laut Quelle'), conditionText(observation?.condition,m('Nicht belegt'))],
    [m('Lieferziel des Preises'), checkedDelivery(observation)],
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
    box.append(element('h3', offer.seller), element('span', priceLabels[priceStatus(offer.observation)], 'badge ' + offer.state),
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
  box.append(element('span', priceLabels[priceStatus(offer.observation)], 'badge ' + offer.state),
    facts([...factsFor(offer), ...expenses,
      [m('Angerechneter Rabatt'), isAmount(observation?.discount) ? money(observation.discount) : m('Nicht belegt')],
      [m('Lieferbedingungen'), delivery || m('Unbestätigt')],
      [m('Quelle'), new URL(offer.url).hostname]]), element('p', risk[offer.state], 'muted'));
  const costNote = openCosts(observation);
  if (costNote) box.append(costNote);
  const actions = element('div', null, 'actions');
  const url = directLink(offer.url, activeProduct);
  if (url && offer.state !== 'unconfirmed') actions.append(link(m('{seller} öffnen',{seller:offer.seller}), url, 'button', true));
  if(!pilotConfigured)actions.append(watchAction(activeProduct));
  box.append(actions);
  const guidance = message(m('Kaufentscheid'), recommendationText(recommendation, comparisonStatus));
  if (recommendation?.seller === offer.seller) appendPriceAdvantage(guidance, priceAdvantage);
  guidance.append(element('p', m(activeProduct.compatibility)),
    link(m('Technische Daten bei Samsung'), activeProduct.manufacturer, 'text-button', true),
    link(m('Händler vergleichen'), '#vergleich'));
  target.replaceChildren(box, guidance);
}

function savedSearchCard(request) {
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
      let updated;
      if(pilotSession)updated=await pilotSession.removeSearch(request);
      else await updateSearches(storage => removeSearch(storage, request));
      if(!remove.isConnected)return;
      if(pilotSession)showAccountSearches(updated);
      else renderWatchlist();
      setText(get('notice'),m('Gespeicherte Suche entfernt.'));
      get('saved').querySelector('button, a')?.focus();
    } catch (error) {
      if(!remove.isConnected)return;
      remove.disabled = false;
      if(pilotSession&&!pilotSession.isSignedIn()) {
        pilotSignIn.updateButton();
        renderWatchlist();
      } else {
        box.append(element('p',m('Die Suche konnte nicht entfernt werden. {error}',()=>({error:uiError(error)})), 'muted'));
      }
    }
  });
  actions.append(searchAgain, remove);
  box.append(actions);
  return box;
}

function showAccountSearches(items) {
  const target=get('saved');
  if(items.length)target.replaceChildren(...items.map(savedSearchCard));
  else target.replaceChildren(message(m('Noch keine Suchwünsche gespeichert'),
    m('Speichere deinen Suchwunsch mit Budget und Kriterien. Du kannst später mit einem Klick erneut prüfen.')),
    link(m('Zur Suche'),'#suche'));
}

async function renderAccountWatchlist() {
  savedLoad?.abort();
  const target=get('saved');
  if(!pilotSession.isSignedIn()) {
    const note=message(m('Deine gespeicherten Suchen'),m('Melde dich an, um deine gespeicherten Suchen zu sehen.'));
    const signIn=element('button',m('Anmelden'),'button');
    signIn.type='button';
    signIn.addEventListener('click',()=>{navigate('suche');pilotSignIn.open();});
    note.append(signIn);
    target.replaceChildren(note);
    return;
  }
  const load=new AbortController();
  savedLoad=load;
  target.replaceChildren(element('p',m('Gespeicherte Suchen werden geladen …'),'muted'));
  try {
    const items=await pilotSession.listSearches({signal:load.signal});
    if(load.signal.aborted)return;
    showAccountSearches(items);
  } catch {
    if(load.signal.aborted)return;
    if(!pilotSession.isSignedIn()) {
      pilotSignIn.updateButton();
      void renderAccountWatchlist();
      return;
    }
    const note=message(m('Die gespeicherten Suchen konnten nicht synchronisiert werden.'));
    const retry=element('button',m('Erneut versuchen'),'text-button');
    retry.type='button';
    retry.addEventListener('click',()=>void renderAccountWatchlist());
    note.append(retry);
    target.replaceChildren(note);
  }
}

function renderWatchlist() {
  if(pilotConfigured&&!pilotSession) {
    get('saved').replaceChildren(message(m(pilotSystemMessage)));
    return;
  }
  if(pilotSession) {
    void renderAccountWatchlist();
    return;
  }
  const items = catalog.filter(product => watched.has(product.mpn));
  const boxes = items.map(product => {
    const box = message(product.name,m('{variant} · {mpn}',()=>({variant:t(product.variant),mpn:product.mpn})));
    const actions = element('div', null, 'actions');
    actions.append(productAction(m('Händler vergleichen'), 'vergleich', product), watchAction(product, true));
    box.append(actions);
    return box;
  });
  try {
    boxes.push(...readSearches(searchPersistence.storage).map(savedSearchCard));
  } catch {
    boxes.push(message(m('Gespeicherte Suchen nicht lesbar'), m('Die gespeicherten Daten bleiben auf diesem Gerät. Prüfe die Browsereinstellungen für lokalen Speicher.')));
  }
  if (!boxes.length) {
    const empty = message(m(platform==='web'?'Deine Watchlist ist leer':'Noch keine Suchwünsche gespeichert'), m('Speichere deinen Suchwunsch mit Budget und Kriterien. Du kannst später mit einem Klick erneut prüfen.'));
    empty.append(link(m('Zur Suche'), '#suche'));
    boxes.push(empty);
  }
  boxes.push(element('p', m(platform==='web'?'Die Watchlist bleibt in diesem Browser. Automatische Benachrichtigungen sind noch nicht verfügbar.':'Deine Suchwünsche bleiben in dieser App auf diesem Gerät. Automatische Hinweise sind noch nicht verfügbar.'), 'muted'));
  if (storageError) boxes.push(element('p', m('Der lokale Speicher ist zurzeit nicht lesbar oder beschreibbar.'), 'muted'));
  get('saved').replaceChildren(...boxes);
}

function renderRoute(focus = false) {
  const hash = location.hash.slice(1).split('?')[0];
  const current = routes.find(id => !get(id).hidden);
  const requestedRoute = routes.includes(hash) ? hash : (hash === 'main' ? current ?? 'suche' : 'suche');
  const route = fixtureMode && !['suche','watchlist','hilfe'].includes(requestedRoute) ? 'suche' : requestedRoute;
  if(route!=='watchlist')savedLoad?.abort();
  if(route!=='suche')cancelSearch();
  if (route !== 'suche' && voice?.isRecording()) voice.stop();
  if (route === 'suche') renderRecent();
  for (const id of routes) get(id).hidden = id !== route;
  for (const anchor of document.querySelectorAll('nav a')) {
    const tab=compactLayout?(route==='watchlist'?'watchlist':'suche'):(route==='passport'?'vergleich':route);
    if (anchor.hash === '#' + tab) anchor.setAttribute('aria-current', 'page');
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

get('outcome-edit').addEventListener('click',()=>get('search-query').focus());
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
voice = setupVoice(composer, refreshIntent,{allowBrowser:!localTestMode});
if (!localTestMode) sharer = setupSharing(document, draftInput);
function importSharedSearch() {
  try {
    const input=readSharedSearch(location.hash);
    if(!input)return;
    if(voice?.isRecording())throw new Error('Beende zuerst deine Aufnahme. Dein Text bleibt erhalten; öffne den geteilten Link danach erneut.');
    activeSearch?.abort();clearTimeout(resultsExpiry);
    get('results').replaceChildren();
    get('web-results').replaceChildren();
    get('search-outcome').hidden=true;
    get('suche').classList.remove('has-search');get('search-home').hidden=false;
    get('search-query').value=input.query;get('max-price').value=input.maxPrice;get('condition').value=input.condition;
    composer.elements.completeCostsOnly.checked=input.completeCostsOnly;
    refreshIntent();
    get('shared-notice').hidden=false;
    setText(get('shared-notice'),m('Geteilte Suche übernommen. Prüfe oder ändere Text und Kriterien und starte die Prüfung bewusst. Nach einer Installation kannst du den Original-Link erneut öffnen; eine automatische Übergabe ist nicht garantiert.'));
  }catch(error){get('shared-notice').hidden=false;setText(get('shared-notice'),m('Geteilte Suche nicht übernommen. {error} Du kannst deinen Wunsch selbst eingeben.',()=>({error:uiError(error)})));}
}
refreshIntent();
importSharedSearch();
window.addEventListener('hashchange', event => {
  if (event.newURL === location.href) {importSharedSearch();renderRoute(true);}
});
window.addEventListener('storage', event => {
  if (event.key === searchStorageKey && !get('watchlist').hidden) renderWatchlist();
});
renderRoute();
document.documentElement.dataset.platform=platform;

try {
  const data = localTestMode ? [] : await loadObservations({signal:AbortSignal.timeout(5000)});
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
