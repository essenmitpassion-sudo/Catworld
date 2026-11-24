import {m,setText,t} from './i18n.mjs';

// Presentation only. Search, markets, evidence and storage stay in their modules.
export function configureNativeUI(document) {
  const get=id=>document.getElementById(id);
  document.documentElement.setAttribute('data-native-ui','');
  setText(get('suche').querySelector('h1'),m('Was brauchst du?'));
  setText(get('suche').querySelector('.search-intro p'),m('Beschreibe deinen Wunsch. Ein Produkt oder ein Ziel reicht.'));
  const input=get('search-query');
  input.dataset.i18nPlaceholder='Zum Beispiel: 2 TB mehr Speicher für meinen PC, bis CHF 200.';
  input.placeholder=t(input.dataset.i18nPlaceholder);
  const status=document.createElement('p');status.id='native-runtime-status';status.className='shared-notice';
  setText(status,m('Diese App zeigt noch keine aktuellen Angebote. Deine Suchwünsche kannst du speichern.'));
  get('suche').querySelector('.search-intro').after(status);
  get('suche').querySelector('.coverage-note').hidden=true;
  setText(get('hilfe').querySelector('[data-help-voice]'),m('Die Spracheingabe ist für diese App-Version noch nicht verfügbar. Nutze die Texteingabe.'));
  for(const route of ['radar','vergleich'])document.querySelector(`nav a[href="#${route}"]`).hidden=true;
  setText(document.querySelector('nav a[href="#watchlist"] [data-i18n]'),m('Gespeichert'));
  setText(get('watchlist').querySelector('h1'),m('Deine Suchen'));
  setText(document.querySelector('.footer a'),m('Hilfe & Datenschutz'));
  get('search-home').prepend(get('recent-searches'));
  const examples=get('search-home').querySelector('.suggestions');
  examples.querySelector('[data-example]').before(examples.querySelector('[data-prompt]'));
}
