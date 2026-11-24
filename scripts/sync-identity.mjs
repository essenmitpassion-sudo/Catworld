import {readFile,writeFile} from 'node:fs/promises';
import {brand,brandTemplate} from '../src/brand.mjs';
import {iconPng,writeIconFile} from './generate-icons.mjs';

// Generate display metadata from one trusted source. Technical identities are
// never synthesized from a name. Run before packaging/browser/native builds.
export async function syncIdentity() {
  const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
  const write=(path,value)=>writeFile(new URL('../'+path,import.meta.url),value);
  const xml=value=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  for(const size of [180,192,512])await writeIconFile(new URL('../src/assets/udi-'+size+'.png',import.meta.url),iconPng(size));
  for(const [lang,file] of [['de','manifest.webmanifest'],['en','manifest.en.webmanifest']]){
    const path='src/'+file,manifest=JSON.parse(await read(path));
    manifest.name=brand.labels[lang].name;manifest.short_name=brand.labels[lang].shortName;
    await write(path,JSON.stringify(manifest,null,2)+'\n');
  }
  const config=JSON.parse(await read('capacitor.config.json'));
  config.appName=brand.installName;await write('capacitor.config.json',JSON.stringify(config,null,2)+'\n');
  const strings='android/app/src/main/res/values/strings.xml';
  await write(strings,(await read(strings)).replace(/(<string name="(?:app_name|title_activity_main)">)[^<]*(<\/string>)/g,(_,a,b)=>a+xml(brand.installName)+b));
  const plist='ios/App/App/Info.plist';
  await write(plist,(await read(plist)).replace(/(<key>CFBundleDisplayName<\/key>\s*<string>)[^<]*(<\/string>)/,(_,a,b)=>a+xml(brand.installName)+b));
  const index='src/index.html';let html=await read(index);
  html=html.replace(/(<span data-brand-wordmark="">)[^<]*(<\/span>)/,(_,a,b)=>a+xml(brand.labels.de.shortName)+b)
    .replace(/(<title data-i18n=")([^"]+)(">)[^<]*(<\/title>)/,(_,a,key,b,c)=>a+key+b+xml(brandTemplate(key,'de'))+c)
    .replace(/(<a class="brand"[^>]*?\saria-label=")[^"]*(")/,(_,a,b)=>a+xml(brandTemplate('UDI · Zur Suche','de'))+b);
  await write(index,html);
}
