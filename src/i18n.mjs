import { english } from './messages.en.mjs';
import {activeMarket} from './markets.mjs';
export {activeMarket} from './markets.mjs';

// Gettext-style source messages are stable IDs. Only explicitly bound UI text
// is translated; user input and merchant fields never pass through this layer.
export const LANGUAGE_STORAGE_KEY='udi.language.v1';
let language='de';
const messageTag=Symbol('udi-ui-message');
const bindings=new WeakMap();
export const getLanguage=()=>language;
export const hasMessage=key=>typeof key==='string'&&Object.hasOwn(english,key);
export function chooseLanguage(saved,languages=[]) {
  if(['de','en'].includes(saved))return saved;
  return languages.map(value=>value.split('-')[0].toLowerCase()).find(value=>['de','en'].includes(value))??'en';
}
export function t(key,params={}) {
  if(!hasMessage(key))throw new Error('Missing UI translation: '+key);
  const values=typeof params==='function'?params():params;
  return (language==='en'?english[key]:key).replace(/\{(\w+)\}/g,(_,name)=>{
    if(!Object.hasOwn(values,name))throw new Error('Missing translation value: '+name);
    return String(values[name]);
  });
}
export function m(key,params={}) {
  if(key?.[messageTag])return key;
  if(!hasMessage(key))throw new Error('Missing UI translation: '+key);
  return {[messageTag]:true,key,params,toString(){return t(key,params);}};
}
export const uiError=error=>m(hasMessage(error?.message)?error.message:'Die Aktion konnte nicht abgeschlossen werden. Versuche es erneut.');
export function setText(node,value) {
  if(!value?.[messageTag]) {delete node.dataset.i18n;bindings.delete(node);node.textContent=value==null?'':String(value);return;}
  let binding=bindings.get(node);
  if(!binding||!node.contains(binding.text)) {
    const text=[...node.childNodes].find(child=>child.nodeType===3&&child.data.trim())??node.appendChild(document.createTextNode(''));
    binding={text,before:text.data.match(/^\s*/)[0],after:text.data.match(/\s*$/)[0]};
  }
  Object.assign(binding,{key:value.key,params:value.params});bindings.set(node,binding);
  node.dataset.i18n=value.key;
  binding.text.data=binding.before+t(value.key,value.params)+binding.after;
}
export function applyLanguage(root=document) {
  document.documentElement.lang=language==='de'?'de-CH':'en';
  for(const node of root.querySelectorAll('[data-i18n]')) {
    const binding=bindings.get(node);setText(node,m(node.dataset.i18n,binding?.params??{}));
  }
  for(const attr of ['placeholder','aria-label','title','content','data-prompt'])for(const node of root.querySelectorAll('[data-i18n-'+attr+']'))node.setAttribute(attr,t(node.getAttribute('data-i18n-'+attr)));
  const selector=root.querySelector('#ui-language');if(selector)selector.value=language;
  for(const button of root.querySelectorAll('[data-language-value]'))button.setAttribute('aria-pressed',String(button.dataset.languageValue===language));
  const manifest=root.querySelector('link[rel=manifest]');if(manifest)manifest.setAttribute('href',language==='en'?'./manifest.en.webmanifest':'./manifest.webmanifest');
}
export function setLanguage(value,{persist=false}={}) {
  if(!['de','en'].includes(value))throw new Error('Unsupported UI language');
  language=value;
  let saved=true;if(persist)try{localStorage.setItem(LANGUAGE_STORAGE_KEY,value);}catch{saved=false;}
  if(typeof document!=='undefined')applyLanguage();
  return saved;
}
export function initializeLanguage() {
  let saved;try{saved=localStorage.getItem(LANGUAGE_STORAGE_KEY);}catch{}
  setLanguage(chooseLanguage(saved,navigator.languages??[navigator.language]));
}
export const speechLanguage=()=>language==='en'?'en-GB':'de-CH';
export const formatMoney=amount=>new Intl.NumberFormat(activeMarket.formatLocales[language],{style:'currency',currency:activeMarket.currency}).format(amount/100);
export const formatDate=value=>new Intl.DateTimeFormat(activeMarket.formatLocales[language],{dateStyle:'medium',timeStyle:'short',timeZone:activeMarket.timeZone}).format(new Date(value));
