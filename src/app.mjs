import { catalog, search, compare, costFields, directLink, isAmount, maxObservationAge } from './deals.mjs';

const get = id => document.getElementById(id);
const storageKey = 'udi.watchlist.v1';
const currency = new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' });
const date = new Intl.DateTimeFormat('de-CH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Zurich' });
const money = amount => currency.format(amount / 100);
const labels = { verified: 'Verifiziert', partial: 'Teilweise geprüft', unconfirmed: 'Unbestätigt' };
const routes = ['radar', 'suche', 'vergleich', 'passport', 'watchlist'];
let activeProduct = null;
let activeSeller = null;
let observations = [];
let sourceState = 'loading';
let watched = new Set();
let storageError = false;
let activeSearch;
let resultsExpiry;

try {
  const saved = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
  if (!Array.isArray(saved)) throw new Error('Invalid watchlist');
  watched = new Set(saved.filter(mpn => catalog.some(product => product.mpn === mpn)));
} catch {
  storageError = true;
}

function element(tag, content, className) {
  const node = document.createElement(tag);
  if (content != null) node.textContent = content;
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

function watchAction(product, remove = false) {
  const button = element('button', remove ? 'Entfernen' : 'Auf die Watchlist', 'text-button');
  button.type = 'button';
  if (!remove && watched.has(product.mpn)) {
    button.textContent = 'Auf der Watchlist';
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
      get('notice').textContent = remove ? 'Produkt entfernt.' : 'Produkt gespeichert.';
      if (remove) {
        renderWatchlist();
        get('saved').querySelector('button, a')?.focus();
      } else {
        button.replaceWith(link('Watchlist öffnen', '#watchlist'));
        const anchors = get('detail').querySelectorAll('a');
        [...anchors].find(anchor => anchor.hash === '#watchlist')?.focus();
      }
    } catch {
      storageError = true;
      get('notice').textContent = 'Die Watchlist konnte auf diesem Gerät nicht gespeichert werden.';
      button.insertAdjacentElement('afterend', element('p', get('notice').textContent, 'muted'));
    }
  });
  return button;
}

function productCard(product) {
  const card = message(product.name, product.variant + ' · ' + product.mpn);
  card.append(productAction('Händler vergleichen', 'vergleich', product));
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
      loading: 'Daten werden geladen …',
      error: 'Angebotsdaten konnten nicht geladen werden. Der Produktvergleich ist weiterhin verfügbar.',
      ready: 'Derzeit gibt es keine bestätigte Kaufempfehlung. In der Suche findest du die bekannten Händlerseiten.',
    };
    target.append(element('p', text[sourceState], 'muted'));
    return;
  }
  for (const { product, recommendation } of opportunities) {
    target.append(element('h3', product.name + ' · ' + product.variant),
      element('p', money(recommendation.total) + ' bei ' + recommendation.seller),
      productAction('Deal Passport ansehen', 'passport', product, recommendation.seller));
  }
}

function renderWebResults(result, query) {
  clearTimeout(resultsExpiry);
  const target = get('web-results');
  if (result.kind === 'clarification') {
    const question = message('Darf ein Gebrauchtangebot dabei sein?', 'Wenn ein Upgrade allein sinnvoll ist, bleibt es im Vergleich.');
    const choices = element('div', null, 'actions');
    for (const [label, scope] of [['Neue Angebote', 'component'], ['Auch gebraucht', 'both']]) {
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
      disabled: 'Die Websuche ist in dieser Installation noch nicht verbunden.',
      busy: 'Die Websuche ist gerade ausgelastet. Versuche es in einer Minute erneut.',
      unavailable: 'Die Websuche ist vorübergehend nicht erreichbar.',
      invalid: 'Gib einen Kaufwunsch als Text ohne Webadresse ein.',
      results: result.unconfirmed
        ? 'Wir konnten die gefundenen Angebote gerade nicht aktuell bestätigen. Versuche es später erneut.'
        : 'Keine passenden aktuellen Angebote gefunden. Ändere deinen Suchwunsch oder versuche es später erneut.',
      expired: 'Die Angebotsprüfung ist abgelaufen. Suche erneut für den aktuellen Stand.',
    };
    target.replaceChildren(element('p', messages[result.kind] ?? messages.unavailable, 'surface muted'));
    return;
  }
  const intro = element('div', null, 'section-heading');
  intro.append(element('h2', 'Aktuell geprüft'), element('span',
    result.items.length + (result.items.length === 1 ? ' Angebot' : ' Angebote'), 'unit'));
  const cards = result.items.map(item => {
    const box = element('article', null, 'surface offer');
    const heading = element('div', null, 'offer-heading');
    heading.append(element('p', item.source, 'eyebrow'), element('span', 'Teilweise geprüft', 'badge'));
    const check = item.check;
    box.append(heading, element('h3', item.title), element('p', money(check.price), 'offer-price'),
      element('p', 'Artikelpreis · Gesamtkosten noch offen', 'muted'),
      element('p', 'Quelle meldet verfügbar · geprüft ' + date.format(new Date(check.checkedAt)) + ' (CH)', 'muted'));
    const details = element('details');
    details.append(element('summary', 'Prüfung und offene Angaben'));
    details.append(facts([
      ['Zustand laut Quelle', check.condition ?? 'Unbestätigt'],
      ['Verkäufer laut Quelle', check.seller ?? 'Unbestätigt'],
      ['Versand und Gebühren', 'Unbekannt'],
      ['Funktionszustand', 'Nicht unabhängig getestet'],
    ]));
    const action = link(item.type === 'listing' ? 'Inserat öffnen' : 'Angebotsseite öffnen', item.url, 'button', true);
    action.addEventListener('click', event => {
      if (Date.now() >= Date.parse(item.expiresAt)) {
        event.preventDefault();
        renderWebResults({ kind: 'expired' }, query);
      }
    });
    box.append(details, action);
    return box;
  });
  target.replaceChildren(intro, ...cards);
  const expiry = Math.min(...result.items.map(item => Date.parse(item.expiresAt)));
  resultsExpiry = setTimeout(() => renderWebResults({ kind: 'expired' }, query), Math.max(1, expiry - Date.now()));
}

async function submit(query, scope) {
  activeSearch?.abort();
  const request = new AbortController();
  activeSearch = request;
  get('search-query').value = query;
  const products = search(query);
  get('results').replaceChildren(...(products.length ? products.map(productCard) : [
    message('Dein Suchwunsch', query),
  ]));
  clearTimeout(resultsExpiry);
  get('web-results').replaceChildren(element('p', 'Wir suchen und prüfen die Angebote …', 'surface muted'));
  navigate('suche');
  const resultTitle = get('results').querySelector('h2');
  resultTitle.tabIndex = -1;
  resultTitle.focus();
  try {
    const response = await fetch('./api/discovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, scope }),
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
    row.append(element('dt', name), element('dd', value));
    list.append(row);
  }
  return list;
}

function recommendationText(recommendation) {
  if (sourceState === 'loading') return 'Angebotsdaten werden geladen …';
  if (sourceState === 'error') return 'Angebotsdaten konnten nicht geladen werden. Öffne die Händlerseite für den aktuellen Stand.';
  if (!recommendation) return 'Kaufentscheid offen. Für eine Empfehlung braucht es zwei verfügbare Angebote mit aktuellen, vollständigen Gesamtkosten und einen eindeutigen Preisvorteil.';
  return recommendation.seller + ' hat unter den geprüften, verfügbaren Angeboten die tiefsten Gesamtkosten (' + money(recommendation.total) + ').';
}

function factsFor(offer) {
  const observation = offer.observation;
  const available = observation?.stock === 'in-stock' ? 'Verfügbar'
    : observation?.stock === 'out-of-stock' ? 'Nicht verfügbar' : 'Unbestätigt';
  return [
    ['Gesamtkosten', offer.total === null ? 'Unbekannt' : money(offer.total)],
    ['Verfügbarkeit', available],
    ['Prüfzeitpunkt', observation ? date.format(new Date(observation.checkedAt)) + ' (CH)' : 'Keine aktuelle Prüfung'],
  ];
}

function renderComparison() {
  const target = get('comparison');
  if (!activeProduct) {
    const box = message('Wähle eine SSD', 'Öffne die Suche und wähle ein Produkt für den Händlervergleich.');
    box.append(link('Zur Suche', '#suche'));
    target.replaceChildren(box);
    return;
  }
  const { offers, recommendation } = compare(activeProduct, observations);
  const columns = element('div', null, 'columns');
  for (const offer of offers) {
    const box = element('article', null, 'surface');
    box.append(element('h3', offer.seller), element('span', labels[offer.state], 'badge ' + offer.state),
      facts(factsFor(offer)), productAction('Deal Passport · ' + offer.seller, 'passport', activeProduct, offer.seller));
    columns.append(box);
  }
  const heading = message(activeProduct.name + ' · ' + activeProduct.variant, activeProduct.mpn);
  heading.append(element('p', recommendationText(recommendation)));
  target.replaceChildren(heading, columns);
}

function renderPassport() {
  const target = get('detail');
  if (!activeProduct || !activeSeller) {
    const box = message('Wähle einen Händler', 'Im Vergleich findest du den Deal Passport für jede Händlerseite.');
    box.append(link('Zum Vergleich', '#vergleich'));
    target.replaceChildren(box);
    return;
  }
  const { offers, recommendation } = compare(activeProduct, observations);
  const offer = offers.find(row => row.seller === activeSeller);
  const box = message(offer.seller + ' · ' + activeProduct.name, activeProduct.variant + ' · ' + activeProduct.mpn);
  const observation = offer.observation;
  const risk = {
    verified: 'Preis und Bestand können sich seit der Prüfung ändern. Kontrolliere die Angaben vor dem Kauf.',
    partial: observation
      ? 'Die vorliegenden Angebotsdaten sind unvollständig. Kontrolliere die offenen Angaben vor dem Kauf.'
      : 'Die Produktvariante wurde der Händlerseite zugeordnet. Preis, Bestand, Lieferbedingungen und Weiterleitungen sind derzeit nicht aktuell bestätigt.',
    unconfirmed: 'Die Angebotsdaten passen nicht eindeutig zur hinterlegten Variante oder Adresse.',
  };
  const expenses = costFields.map(([key, label]) => {
    const amount = observation?.[key];
    return [label, isAmount(amount) && (key !== 'price' || amount > 0) ? money(amount) : 'Unbekannt'];
  });
  const delivery = typeof observation?.delivery === 'string' && observation.delivery.trim();
  box.append(element('span', labels[offer.state], 'badge ' + offer.state),
    facts([...factsFor(offer), ...expenses, ['Lieferbedingungen', delivery || 'Unbestätigt'],
      ['Quelle', new URL(offer.url).hostname]]), element('p', risk[offer.state], 'muted'));
  const actions = element('div', null, 'actions');
  const url = directLink(offer.url, activeProduct);
  if (url && offer.state !== 'unconfirmed') actions.append(link(offer.seller + ' öffnen', url, 'button', true));
  actions.append(watchAction(activeProduct));
  box.append(actions);
  const guidance = message('Kaufentscheid', recommendationText(recommendation));
  guidance.append(element('p', activeProduct.compatibility),
    link('Technische Daten bei Samsung', activeProduct.manufacturer, 'text-button', true),
    link('Händler vergleichen', '#vergleich'));
  target.replaceChildren(box, guidance);
}

function renderWatchlist() {
  const items = catalog.filter(product => watched.has(product.mpn));
  const boxes = items.map(product => {
    const box = message(product.name, product.variant + ' · ' + product.mpn);
    const actions = element('div', null, 'actions');
    actions.append(productAction('Händler vergleichen', 'vergleich', product), watchAction(product, true));
    box.append(actions);
    return box;
  });
  if (!boxes.length) {
    const empty = message('Deine Watchlist ist leer', 'Speichere eine SSD aus ihrem Deal Passport.');
    empty.append(link('Zur Suche', '#suche'));
    boxes.push(empty);
  }
  boxes.push(element('p', 'Die Watchlist bleibt in diesem Browser. Automatische Benachrichtigungen sind noch nicht verfügbar.', 'muted'));
  if (storageError) boxes.push(element('p', 'Der lokale Speicher ist zurzeit nicht lesbar oder beschreibbar.', 'muted'));
  get('saved').replaceChildren(...boxes);
}

function renderRoute(focus = false) {
  const hash = location.hash.slice(1);
  const current = routes.find(id => !get(id).hidden);
  const route = routes.includes(hash) ? hash : (hash === 'main' ? current ?? 'suche' : 'suche');
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
  button.addEventListener('click', () => submit('Samsung 990 PRO 2 TB'));
}
const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
if (SpeechRecognition) {
  let recording;
  for (const button of document.querySelectorAll('[data-mic]')) {
    button.hidden = false;
    button.title = 'Die Spracherkennung deines Browsers kann Audio an seinen Spracherkennungsdienst übertragen.';
    button.addEventListener('click', () => {
      if (recording) {
        recording.abort();
        return;
      }
      const input = button.closest('form').elements.query;
      const speech = new SpeechRecognition();
      speech.lang = 'de-CH';
      speech.onresult = event => {
        input.value = event.results[0][0].transcript.slice(0, input.maxLength);
        input.focus();
        get('notice').textContent = 'Diktat eingefügt. Du kannst den Text prüfen und dann suchen.';
      };
      speech.onerror = event => {
        if (event.error !== 'aborted') get('notice').textContent = 'Diktieren war nicht möglich. Du kannst den Suchwunsch tippen.';
      };
      speech.onend = () => {
        recording = null;
        button.textContent = 'Diktieren';
      };
      try {
        speech.start();
        recording = speech;
        button.textContent = 'Diktat stoppen';
        get('notice').textContent = 'Mikrofon aktiv.';
      } catch {
        get('notice').textContent = 'Diktieren war nicht möglich. Du kannst den Suchwunsch tippen.';
      }
    });
  }
}
window.addEventListener('hashchange', event => {
  if (event.newURL === location.href) renderRoute(true);
});
renderRoute();

try {
  const response = await fetch('./observations.json', { cache: 'no-store', signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error('Observation data unavailable');
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Invalid observation data');
  observations = data;
  sourceState = 'ready';
} catch {
  sourceState = 'error';
}
renderRadar();
renderRoute();

function refreshAtExpiry() {
  const now = Date.now();
  const expiry = catalog.flatMap(product => compare(product, observations, now).offers)
    .filter(offer => offer.observation)
    .map(offer => Date.parse(offer.observation.checkedAt) + maxObservationAge);
  if (!expiry.length) return;
  setTimeout(() => {
    renderRadar();
    renderRoute();
    refreshAtExpiry();
  }, Math.max(1, Math.min(...expiry) - now));
}
refreshAtExpiry();
