import {m,setText,t} from './i18n.mjs';
import {icon} from './ui.mjs';
import {nativeSpeech} from './native-voice.mjs';

// Presentation only. Search, markets, evidence and storage stay in their modules.
export function configureNativeUI(document) {
  const get=id=>document.getElementById(id);
  document.documentElement.setAttribute('data-native-ui','');
  document.querySelector('.brand-mark').replaceChildren(icon('waymark'));
  const language=get('ui-language'),languageGroup=document.createElement('div');
  const settings=document.createElement('details'),toggle=document.createElement('summary');
  settings.className='native-settings';toggle.id='native-settings-toggle';
  toggle.setAttribute('aria-label',t('Sprache und Markt: {language}',{language:language.selectedOptions[0].textContent}));
  const current=document.createElement('span');current.dataset.languageCurrent='';
  current.textContent=language.selectedOptions[0].textContent;
  toggle.append(current);settings.append(toggle);
  const panel=document.createElement('div');panel.className='native-settings-panel';
  const market=document.querySelector('.market-label');
  const heading=document.createElement('p');setText(heading,m('Oberflächensprache'));
  panel.append(heading,languageGroup,market);settings.append(panel);
  language.closest('label').after(settings);
  // A non-modal disclosure: normal tab order, Escape and outside taps close it.
  document.addEventListener('pointerdown',event=>{if(settings.open&&!settings.contains(event.target))settings.open=false;});
  settings.addEventListener('keydown',event=>{if(event.key==='Escape'){settings.open=false;toggle.focus();event.preventDefault();}});
  languageGroup.className='native-languages';languageGroup.setAttribute('role','group');
  languageGroup.dataset.i18nAriaLabel='Oberflächensprache';
  languageGroup.setAttribute('aria-label',t('Oberflächensprache'));
  // Keep full endonyms and the existing language contract inside one disclosure.
  language.closest('label').hidden=true;
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
      settings.open=false;toggle.focus({preventScroll:true});
      if(focused?.matches('textarea,input'))focused.blur();
    });
    languageGroup.append(button);
  }
  setText(get('suche').querySelector('h1'),m('Was brauchst du?'));
  setText(get('suche').querySelector('.search-intro p'),m('Beschreibe deinen Wunsch. UDI zeigt dir belegte Angebote und offene Kosten.'));
  const input=get('search-query');
  input.form.querySelector('.primary-search').addEventListener('pointerdown',event=>{
    // Keep the editing viewport steady until the search click is delivered.
    if(event.button===0&&document.activeElement?.matches('textarea,input'))event.preventDefault();
  });
  const inputLabel=document.querySelector('label[for="search-query"]');
  inputLabel.classList.remove('sr-only');setText(inputLabel,m('Dein Wunsch'));
  input.dataset.i18nPlaceholder='Zum Beispiel: Samsung 990 PRO mit 2 TB, bis CHF 500.';
  input.placeholder=t(input.dataset.i18nPlaceholder);
  setText(get('suche').querySelector('.search-options summary'),m('Budget und Zustand'));
  const status=document.createElement('p');status.id='native-runtime-status';status.className='shared-notice';
  setText(status,m('Diese App zeigt noch keine aktuellen Angebote. Deine Suchwünsche kannst du speichern.'));
  get('suche').querySelector('.composer-submit').after(status);
  input.setAttribute('aria-describedby',status.id);
  get('suche').querySelector('.coverage-note').hidden=true;
  setText(get('hilfe').querySelector('[data-help-voice]'),m(nativeSpeech()
    ?'Diktat funktioniert mit einer lokal verfügbaren Sprache. Die App speichert keine Tonaufnahme. Du entscheidest, wann du den bearbeiteten Text zur Suche abschickst.'
    :'Die Spracheingabe ist für diese App-Version noch nicht verfügbar. Nutze die Texteingabe.'));
  for(const route of ['radar','vergleich'])document.querySelector(`nav a[href="#${route}"]`).hidden=true;
  setText(document.querySelector('nav a[href="#watchlist"] [data-i18n]'),m('Gespeichert'));
  setText(get('watchlist').querySelector('h1'),m('Deine Suchen'));
  setText(get('watchlist').querySelector('.page-title > p:last-child'),m('Deine Wünsche bleiben hier. Suche weiter, wenn es für dich passt.'));
  setText(document.querySelector('.footer a'),m('Hilfe & Datenschutz'));
  const examples=get('search-home').querySelector('.suggestions');
  examples.querySelector('[data-prompt]').remove();
  setText(examples.querySelector('span'),m('Beispielsuche'));
}
