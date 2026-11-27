import assert from 'node:assert/strict';
import {androidControls} from './native-flow-android.mjs';

const wish='Samsung 990 PRO 2 TB';
const confirmedWish=wish+' confirmed';
const unavailableWish='UDI fixture unavailable';
const account='#pilot-account';
const dialog='#pilot-sign-in';
const results='#web-results';
const query='#search-query';
const submit='.primary-search';
const node=target=>'document.querySelector('+JSON.stringify(target)+')';
const visible=target=>node(target)+'?.getClientRects().length>0';
const text=target=>node(target)+'?.textContent.trim()';
const value=target=>node(target)+'?.value';

export async function androidFixtureFlow(page,afterRestart) {
  const {send,evaluate}=page;
  const {tap,wait}=androidControls(page,()=>evaluate(`(()=>{
    const result=document.querySelector('#web-results');
    const has=message=>result?.textContent.includes(message)??false;
    return JSON.stringify({
      fixtureLabel:has('TESTDATEN'),
      cards:result?.querySelectorAll('article').length??0,
      loading:has('Wir suchen und prüfen die Angebote'),
      rejectedResponse:has('Die Antwort konnte nicht sicher geprüft werden'),
      unavailable:has('Die Websuche ist vorübergehend nicht erreichbar'),
      transportFailure:has('Die Verbindung zum Angebotsdienst ist fehlgeschlagen'),
      expiredSession:has('Deine Anmeldung am Angebotsdienst ist abgelaufen'),
      invalidWish:has('Gib einen Kaufwunsch als Text ohne Webadresse ein'),
      clarification:has('Darf ein Gebrauchtangebot dabei sein'),
      signedIn:document.querySelector('#pilot-account')?.textContent.trim()==='Abmelden',
      plusUsedOne:document.querySelector('main')?.textContent.includes('Testabo Plus · 1 von 3 Suchen')??false
    });
  })()`));
  async function type(target,input) {
    await wait('document.activeElement===' + node(target));
    await send('Input.insertText',{text:input});
  }
  async function search(input) {
    await tap(query);
    await evaluate(node(query)+'.select()');
    await send('Input.insertText',{text:input});
    assert.equal(await evaluate(value(query)),input,'Installed Android composer must retain the typed wish');
    await tap(submit);
  }
  async function expectOffer(badge,amount) {
    await wait(text(results)+'?.includes("TESTDATEN")');
    await wait(text(results+' article .badge')+'==='+JSON.stringify(badge));
    const price=await evaluate(text(results+' article .offer-price'));
    assert.match(price,new RegExp('^CHF\\s*'+amount.replace('.','\\.')+'$'));
    assert(await evaluate(text(results)+'?.includes("Testdaten: Anbieterlink deaktiviert.")'));
    assert.equal(await evaluate("document.querySelectorAll('#web-results article a, #web-results article .actions button').length"),0,'Fixture result must exclude purchase and Passport actions');
  }
  const expectUsage=used=>wait(text('main')+'?.includes('+JSON.stringify('Testabo Plus · '+used+' von 3 Suchen')+')');

  await wait("Capacitor.getPlatform()==='android' && document.readyState==='complete' && "+visible(account));
  if(afterRestart) {
    await wait(text(account)+'==="Abmelden"');
    await expectUsage(2);
    await tap('nav a[href="#watchlist"]');
    await wait("Array.from(document.querySelectorAll('#saved .surface h2')).some(node=>node.textContent==="+JSON.stringify(wish)+')');
    console.log('Android fixture: sign-in, Plus usage and protected saved search restored after force-stop/relaunch');
    return;
  }

  if(await evaluate("document.documentElement.lang!=='de-CH'")) {
    await tap('.native-settings summary');
    await tap('[data-language-value="de"]');
  }
  await wait(text(account)+'==="Anmelden"');
  await wait(text('#native-fixture-notice')+'?.includes("Testumgebung · Nur simulierte Konten und Preise")');
  console.log('Android fixture: launched installed app (DE)');

  await search(wish);
  await wait(node(dialog)+'?.open && document.activeElement.id==="pilot-email"');
  await type('#pilot-email','plus@udi.test');
  await tap('[data-pilot-email] [type=submit]');
  await wait(visible('#pilot-code'));
  await type('#pilot-code','999999');
  await tap('[data-pilot-code] [type=submit]');
  await wait(text(dialog+' [role=status]')+'?.includes("falsch oder abgelaufen")');
  await tap('[data-pilot-resend]');
  await wait(value('#pilot-code')+'==="" && document.activeElement.id==="pilot-code"');
  await type('#pilot-code','123456');
  await tap('[data-pilot-code] [type=submit]');
  await wait('!'+node(dialog)+'?.open && '+text(account)+'==="Abmelden"');
  await expectUsage(0);
  assert.equal(await evaluate(value(query)),wish,'Sign-in must preserve the submitted draft');
  assert(!(await evaluate(node(results)+'?.querySelector("article")!==null')),'Sign-in alone must never submit the search');
  console.log('Android fixture: protected login, rejected code and explicit search gate passed');

  await tap(submit);
  await expectOffer('Unvollständig / Schätzung','99.00');
  await tap('#results button.text-button');
  await wait(text('#results button.text-button')+'==="Suche gespeichert"');
  console.log('Android fixture: protected search and incomplete CHF 99.00 price passed; account search saved');

  await search(confirmedWish);
  await expectOffer('Verbindlich bestätigt','104.00');
  console.log('Android fixture: confirmed CHF 104.00 total and disabled seller link passed');

  await search('UDI fixture timeout');
  await wait(text(results)+'?.includes("Die Suche dauert zu lange")');
  await search('UDI fixture invalid');
  await wait(text(results)+'?.includes("Die Antwort konnte nicht sicher geprüft werden")');
  assert.equal(await evaluate("document.querySelectorAll('#web-results article, #results a[href*=vergleich]').length"),0);
  console.log('Android fixture: timeout and contradictory offer rejected; no comparison link shown');
  await search(unavailableWish);
  await wait(text(results)+'?.includes("Die Websuche ist vorübergehend nicht erreichbar.")');
  assert(await evaluate(text(results)+'?.includes("Nicht verifizierbar")'));
  await expectUsage(2);
  assert.equal(await evaluate(value(query)),unavailableWish,'Service outage must retain the typed draft');
  assert.equal(await evaluate("document.querySelectorAll('#web-results article').length"),0,'A failed search must clear the preceding result');
  console.log('Android fixture: service error displayed, old offers cleared, draft retained and Plus usage stayed at 2 of 3');
}
