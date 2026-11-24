import {m,setText,t} from './i18n.mjs';

// Presentation only. Search, markets, evidence and storage stay in their modules.
export function configureNativeUI(document) {
  const get=id=>document.getElementById(id);
  document.documentElement.setAttribute('data-native-ui','');
  const language=get('ui-language'),languageGroup=document.createElement('div');
  languageGroup.className='native-languages';languageGroup.setAttribute('role','group');
  languageGroup.dataset.i18nAriaLabel='Oberflächensprache';
  languageGroup.setAttribute('aria-label',t('Oberflächensprache'));
  // Both supported languages are direct actions. Keep the existing selection
  // contract hidden, without opening a platform picker while editing a wish.
  language.closest('label').hidden=true;
  language.closest('label').after(languageGroup);
  for(const option of language.options) {
    const button=document.createElement('button');button.type='button';
    button.textContent=option.textContent;button.lang=option.value;
    button.dataset.languageValue=option.value;
    button.setAttribute('aria-pressed',String(language.value===option.value));
    // Keep the editing viewport stable until the complete tap commits. A
    // pointer-down focus change can dismiss/pan the iOS keyboard before click.
    button.addEventListener('pointerdown',event=>{if(event.button===0)event.preventDefault();});
    button.addEventListener('click',()=>{
      const focused=document.activeElement;
      language.value=option.value;language.dispatchEvent(new Event('change',{bubbles:true}));
      if(focused?.matches('textarea,input'))focused.blur();
    });
    languageGroup.append(button);
  }
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
