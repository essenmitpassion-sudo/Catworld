import test from 'node:test';
import assert from 'node:assert/strict';
import { setLanguage, getLanguage, t, formatMoney, speechLanguage, chooseLanguage, activeMarket } from '../src/i18n.mjs';
import { english } from '../src/messages.en.mjs';
import { criteriaFor, withoutBudget } from '../src/criteria.mjs';
import { readFile } from 'node:fs/promises';
import { load } from 'cheerio';
import { intentFor } from '../src/intent.mjs';

test('neutraler Anzeigename folgt der Sprache ohne Nutzerwünsche oder interne Kürzel umzubenennen',()=>{
  try {
    setLanguage('de');assert.equal(t('UDI · Zur Suche'),'Angebotssuche · Zur Suche');
    assert.equal(t('{query} · Erneut prüfen',{query:'UDI camera udi.'}),'UDI camera udi. · Erneut prüfen');
    setLanguage('en');assert.equal(t('UDI · Zur Suche'),'Offer search · Go to search');
    assert.equal(t('{query} · Erneut prüfen',{query:'UDI camera udi.'}),'UDI camera udi. · Check again');
  } finally {setLanguage('de');}
});

test('Sprache ändert weder aktiven Markt noch CHF-Preisgrundlage',()=>{
  try {
    setLanguage('en');assert.equal(getLanguage(),'en');assert.equal(t('Suche'),'Search');assert.equal(speechLanguage(),'en-GB');
    assert.equal(activeMarket.id,'CH');assert.equal(activeMarket.currency,'CHF');assert(formatMoney(43900).includes('439.00'));
    setLanguage('de');assert.equal(t('Suche'),'Suche');assert.equal(speechLanguage(),'de-CH');
    assert.throws(()=>setLanguage('fr'));
  }finally{setLanguage('de');}
});

test('Katalog hat vollständige, passende Platzhalter und keine leeren Übersetzungen',()=>{
  const slots=s=>[...new Set([...s.matchAll(/\{(\w+)\}/g)].map(m=>m[1]))].sort();
  assert(Object.keys(english).length>100);
  for(const [source,target]of Object.entries(english)){assert(target.trim(),source);assert.deepEqual(slots(target),slots(source),source);}
  try{setLanguage('en');assert.equal(t('Gesamtbudget bis {amount}',{amount:'CHF 500.00'}),'Total budget up to CHF 500.00');}finally{setLanguage('de');}
});

test('Sprachwahl verwendet gültige Präferenz und sichere Rückfälle',()=>{
  assert.equal(chooseLanguage('en',['de-CH']),'en');assert.equal(chooseLanguage(null,['de-CH','en']),'de');
  assert.equal(chooseLanguage('bad',['en-US']),'en');assert.equal(chooseLanguage(null,['fr-CH']),'en');
});

test('alle gebundenen HTML-Texte und Attribute haben eine Übersetzung',async()=>{
  const $=load(await readFile(new URL('../src/index.html',import.meta.url),'utf8'));
  for(const node of $('*').toArray())for(const [name,value]of Object.entries(node.attribs)) {
    if(name==='data-i18n'||name.startsWith('data-i18n-'))assert(Object.hasOwn(english,value),`${name}: ${value}`);
  }
  const manifests=await Promise.all(['manifest.webmanifest','manifest.en.webmanifest'].map(async file=>JSON.parse(await readFile(new URL('../src/'+file,import.meta.url),'utf8'))));
  for(const key of ['id','scope','start_url','display','icons'])assert.deepEqual(manifests[0][key],manifests[1][key]);
  assert.equal(manifests[1].lang,'en');
});

test('englische Suchwünsche unterscheiden vollständige PCs und Komponenten',()=>{
  assert(intentFor({query:'SSD for my PC'}).question);
  for(const query of ['My PC needs more storage','A PC with 16 GB RAM and SSD','RAM with 32 GB','SSD with 500 GB','SSD any capacity'])assert.equal(intentFor({query}).question,null,query);
});

test('englische CHF-Budgets und Zustände gelten wie deutsche Kriterien',()=>{
  assert.equal(criteriaFor({query:'used Samsung 990 PRO 2 TB up to CHF 500'}).maxTotal,50000);
  assert.equal(criteriaFor({query:'used Samsung 990 PRO 2 TB up to CHF 500'}).condition,'used');
  assert.equal(criteriaFor({query:'new SSD under CHF 500'}).maxTotal,49999);
  assert.equal(criteriaFor({query:'not used SSD up to CHF 500'}).condition,'new');
  assert.equal(withoutBudget('Samsung 990 PRO 2 TB up to CHF 500'),'Samsung 990 PRO 2 TB');
  assert.throws(()=>criteriaFor({query:'SSD under USD 500'}));
  assert.throws(()=>criteriaFor({query:'SSD bis 500 EUR'}));
  for(const query of ['SSD under 500 €','SSD under 500€','SSD under 500 $','SSD under 500£'])assert.throws(()=>criteriaFor({query}),query);
  for(const query of ['SSD under CAD 500','SSD under 500 JPY','SSD under 500 SEK'])assert.throws(()=>criteriaFor({query}),query);
});
