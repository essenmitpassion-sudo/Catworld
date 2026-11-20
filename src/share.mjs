import { criteriaFor } from './criteria.mjs';

function queryText(value) {
  if(typeof value!=='string'||!value.trim()||value.trim().length>300||/https?:\/\/|www\.|[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/i.test(value))throw new Error('Gib einen Kaufwunsch mit höchstens 300 Zeichen ohne Webadresse ein.');
  return value.trim();
}

export function sharedSearchUrl(input,base) {
  const query=queryText(input.query), criteria=criteriaFor({...input,query});
  const url=new URL('./',base);
  const localOnly=['localhost','127.0.0.1','[::1]'].includes(url.hostname);
  if(url.username||url.password||!(url.protocol==='https:'||(url.protocol==='http:'&&localOnly)))throw new Error('Für einen allgemeinen Freigabelink ist eine sichere UDI-Adresse nötig.');
  const payload={v:1,q:query,maxPrice:criteria.maxTotal===null?'':(criteria.maxTotal/100).toFixed(2),condition:criteria.condition,completeCostsOnly:criteria.completeCostsOnly};
  url.search='';url.hash='suche?'+new URLSearchParams({auftrag:JSON.stringify(payload)});
  return {url:url.href,localOnly};
}

export function readSharedSearch(hash) {
  if(!hash.startsWith('#suche?'))return null;
  if(hash.length>8192)throw new Error('Der geteilte Suchauftrag ist zu lang.');
  const params=new URLSearchParams(hash.slice(7));
  if([...params].length!==1||!params.has('auftrag'))throw new Error('Der geteilte Suchauftrag ist nicht eindeutig.');
  let value;try{value=JSON.parse(params.get('auftrag'));}catch{throw new Error('Der geteilte Suchauftrag ist nicht lesbar.');}
  const keys=['v','q','maxPrice','condition','completeCostsOnly'];
  if(!value||Array.isArray(value)||value.v!==1||Object.keys(value).some(key=>!keys.includes(key))
    ||typeof value.maxPrice!=='string'||typeof value.completeCostsOnly!=='boolean'||!['any','new','used'].includes(value.condition))throw new Error('Dieser geteilte Suchauftrag wird nicht unterstützt.');
  const input={query:queryText(value.q),maxPrice:value.maxPrice,condition:value.condition,completeCostsOnly:value.completeCostsOnly};
  criteriaFor(input);
  return input;
}

export function setupSharing(root,getDraft) {
  const panel=root.querySelector('#share-preview'), field=root.querySelector('[data-share-url]');
  const status=root.querySelector('[data-share-status]'), native=root.querySelector('[data-share-native]');
  const copy=root.querySelector('[data-share-copy]');
  let prepared;
  root.querySelector('[data-share-prepare]').addEventListener('click',()=>{
    try {
      prepared=sharedSearchUrl(getDraft(),location.href);field.value=prepared.url;panel.hidden=false;
      copy.textContent=prepared.localOnly?'Lokalen Testlink kopieren':'Link kopieren';
      native.hidden=prepared.localOnly||typeof navigator.share!=='function';
      status.textContent=prepared.localOnly?'Nur ein lokaler Testlink: Er funktioniert auf diesem Computer, nicht als Einladung auf andere Geräte. Eine freigegebene HTTPS-Testadresse fehlt noch.'
        :'Prüfe den Link und deinen Suchtext vor dem Teilen. Er enthält Wunsch und Kriterien, keine Preise, Aufnahme oder Zugangsdaten. Beim Empfänger startet keine Suche automatisch.';
    }catch(error){prepared=null;panel.hidden=false;field.value='';native.hidden=true;status.textContent=error.message;}
  });
  copy.addEventListener('click',async()=>{
    if(!prepared)return;
    try {await navigator.clipboard.writeText(prepared.url);status.textContent=prepared.localOnly?'Lokaler Testlink kopiert. Nur auf diesem Computer nutzbar.':'Link kopiert. Teile ihn nur mit Personen, die deinen Suchtext sehen dürfen.';}
    catch {field.focus();field.select();status.textContent='Automatisches Kopieren ist hier nicht möglich. Kopiere den markierten Link von Hand.';}
  });
  native.addEventListener('click',async()=>{
    if(!prepared||prepared.localOnly)return;
    try{await navigator.share({title:'UDI · Geteilte Suche',url:prepared.url});status.textContent='Teilen abgeschlossen. Das bestätigt keine Installation oder Nutzung.';}
    catch(error){status.textContent=error.name==='AbortError'?'Teilen abgebrochen. Dein Suchwunsch bleibt erhalten.':'Teilen war nicht möglich. Du kannst den Link kopieren.';}
  });
  return {invalidate(){prepared=null;panel.hidden=true;field.value='';native.hidden=true;}};
}
