import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, basename, sep } from 'node:path';
import { once } from 'node:events';
import { setTimeout as pause } from 'node:timers/promises';
import { server } from './serve.mjs';
import { inspectPage, pageVerifier } from './verification.mjs';
import { catalog } from '../src/deals.mjs';
import { androidFlow } from './native-flow-android.mjs';

const browserPath = process.env.UDI_BROWSER || [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
].find(existsSync);
assert(browserPath, 'Set UDI_BROWSER to the Chromium browser executable');

async function until(read, label) {
  const deadline = Date.now() + 12000;
  let error;
  do {
    try {
      const result = await read();
      if (result) return result;
    } catch (failure) {
      error = failure;
    }
    await pause(80);
  } while (Date.now() < deadline);
  throw new Error('Timed out: ' + label, { cause: error });
}

const live = process.argv.includes('--live');
const liveEnglish=live&&process.argv.includes('--english');
const layoutBaseline=process.argv.includes('--layout-baseline');
const layoutOnly=layoutBaseline||process.argv.includes('--layout-only');
const nativeOnly=process.argv.includes('--native-only');
const nativeSmall=process.argv.includes('--native-small');
const captureLabel=process.argv.find(value=>value.startsWith('--capture-native-boundary='))?.split('=')[1];
if(captureLabel)assert(['before','after'].includes(captureLabel),'Use a fixed UI comparison label');
async function captureBoundary(platform,language,send) {
  if(!captureLabel||!['android','ios'].includes(platform))return;
  await mkdir(new URL('../artifacts/ux/',import.meta.url),{recursive:true});
  const capture=await send('Page.captureScreenshot',{format:'png'});
  const target=`../artifacts/ux/browser-boundary-${platform}-${language}-${captureLabel}${nativeSmall?'-320':''}`;
  await writeFile(new URL(target+'.png',import.meta.url),Buffer.from(capture.data,'base64'));
  const layout=await send('Runtime.evaluate',{expression:"(()=>{const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height}};return {width:innerWidth,height:innerHeight,composer:rect('.composer'),primary:rect('.primary-search'),navigation:rect('nav'),voice:rect('[data-voice]'),tools:rect('.composer-tools')}})()",returnByValue:true});
  await writeFile(new URL(target+'.json',import.meta.url),JSON.stringify({scope:'desktop browser boundary simulation, not a native device screenshot',...layout.result.value},null,2)+'\n');
}
const profile = await mkdtemp(join(tmpdir(), 'udi-browser-'));
const appOptions = live ? {
  verify: pageVerifier(['dq-solutions.ch']), journalPath: join(profile, 'checks.json'),
} : { webSearch: async ({ query, scope }) => {
  if (scope === 'both' || scope === 'secondhand') return [
    { title: 'Gebrauchter PC · Browser-Testdaten', url: 'https://www.ricardo.ch/de/a/test-pc-1234567890/' },
    { title: 'Verkaufter PC · Browser-Testdaten', url: 'https://www.ricardo.ch/de/a/verkauft-1234567891/' },
  ];
  if (query.includes('1 TB')) return [];
  return [{ title: 'Samsung SSD · Browser-Testdaten',
    url: 'https://www.digitec.ch/de/s1/product/samsung-990-pro-22097721' }];
}, verify: async item => inspectPage(item, {
  status: 200,
  html: '<script type="application/ld+json">' + JSON.stringify({
    '@type': 'Product', url: item.url, name: item.title, mpn: item.mpn,
    offers: { '@type': 'Offer', url: item.url, priceCurrency: 'CHF', price: '550',
      seller: { name: item.mpn ? item.source : 'Testverkäufer' }, itemCondition: 'https://schema.org/UsedCondition',
      availability: item.url.includes('verkauft') ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock' },
  }) + '</script>',
}) };
let app = server(appOptions);
async function closeTestServer() {
  const closed=new Promise(resolve=>app.close(resolve));
  // Chromium can retain a speculative connection with no request. This server
  // belongs only to the completed scenario; do not wait indefinitely for it.
  app.closeAllConnections();
  await closed;
}
let browser;
let socket;
let browserError = '';
const pageErrors=[];
try {
  app.listen(0, '127.0.0.1');
  await once(app, 'listening');
  browser = spawn(browserPath, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--disable-background-networking', ...(!live ? ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] : []),
    '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
  browser.on('error', error => console.error(error.message));
  browser.stderr.setEncoding('utf8');
  browser.stderr.on('data', chunk => { browserError = (browserError + chunk).slice(-4000); });
  const port = await until(async () => (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0], 'browser startup');
  const pages = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
  socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
  await once(socket, 'open');
  let id = 0;
  const pending = new Map();
  socket.addEventListener('message', event => {
    const reply = JSON.parse(event.data);
    if(reply.method==='Runtime.exceptionThrown')pageErrors.push(reply.params.exceptionDetails.exception?.description??reply.params.exceptionDetails.text);
    if(reply.method==='Runtime.consoleAPICalled' && reply.params.type==='error')pageErrors.push(reply.params.args.map(value=>value.description??value.value).join(' '));
    const finish = pending.get(reply.id);
    if (finish) finish(reply);
  });
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const commandId = ++id;
      const deadline = setTimeout(() => {
        pending.delete(commandId);
        reject(new Error(method + ' timed out'));
      }, 7000);
      pending.set(commandId, reply => {
        clearTimeout(deadline);
        pending.delete(commandId);
        if (reply.error) reject(new Error(reply.error.message));
        else resolve(reply.result);
      });
      socket.send(JSON.stringify({ id: commandId, method, params }));
    });
  }
  async function evaluate(expression) {
    const reply = await send('Runtime.evaluate', { expression, returnByValue: true, userGesture: true, awaitPromise: true });
    if (reply.exceptionDetails) throw new Error(reply.exceptionDetails.exception?.description ?? expression);
    return reply.result.value;
  }
  let origin = 'http://127.0.0.1:' + app.address().port;
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Page.addScriptToEvaluateOnNewDocument',{source:`if(location.hostname==='127.0.0.1'){try{if(localStorage.getItem('udi.language.v1')===null)localStorage.setItem('udi.language.v1',${JSON.stringify(liveEnglish?'en':'de')})}catch{}}`});
  if (!live) await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `Object.defineProperty(window, 'SpeechRecognition', { value: class {
      start() {
        window.udiSpeechLanguage=this.lang;
        if (window.udiHoldSpeech) return;
        setTimeout(() => {
          if (window.udiSpeechError) { this.onerror({error: window.udiSpeechError}); this.onend(); return; }
          this.onresult({ results: [[{ transcript: window.udiTranscript ?? 'Mein PC braucht mehr Speicher' }]] });
          this.onend();
        }, 650);
      }
      stop() {
        if (this.ending) return;
        this.ending = true;
        queueMicrotask(() => {
          if (window.udiFinalOnStop) this.onresult({results: [[{transcript:window.udiFinalOnStop}]]});
          this.onend();
        });
      }
    }, configurable: true })`,
  });
  const forbidden = await fetch(origin + '/api/discovery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://evil.test', 'Sec-Fetch-Site': 'cross-site' },
    body: JSON.stringify({ query: 'Gebrauchter Gaming-PC' }),
  });
  assert.equal(forbidden.status, 403);
  const visible = id => evaluate(`document.getElementById('${id}')?.hidden === false`);
  const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  async function pointerClick(selector) {
    const point=await evaluate(`(()=>{const button=document.querySelector(${JSON.stringify(selector)});button.scrollIntoView({block:'center'});const r=button.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;if(!button.contains(document.elementFromPoint(x,y)))throw new Error('Action is obscured');return {x,y}})()`);
    await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});
  }
  const type = text => send('Input.insertText', { text });
  async function key(name) {
    const windowsVirtualKeyCode = { Enter: 13, Tab: 9 }[name];
    const text = name === 'Enter' ? '\r' : '';
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: name, code: name, text, windowsVirtualKeyCode });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: name, code: name, windowsVirtualKeyCode });
  }
  async function noOverflow() {
    assert(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
    assert(await evaluate("document.querySelector('main').scrollWidth<=document.querySelector('main').clientWidth"),'app content reflows without horizontal clipping');
    assert(await evaluate("(()=>{const main=document.querySelector('main').getBoundingClientRect(),nav=document.querySelector('nav').getBoundingClientRect();return main.bottom<=nav.top+.5||nav.bottom<=main.top+.5})()"),'navigation never overlays the content viewport');
  }
  for (const width of live ? [390] : nativeOnly?[]:[360, 390, 768, 1365]) {
    if (width !== (live ? 390 : 360)) {
      await closeTestServer();
      app = server(appOptions);
      app.listen(0, '127.0.0.1');
      await once(app, 'listening');
      origin = 'http://127.0.0.1:' + app.address().port;
    }
    await send('Emulation.setDeviceMetricsOverride', { width, height: layoutOnly?780:900, deviceScaleFactor: 1, mobile: width < 500 });
    await send('Page.navigate', { url: origin + '/?width=' + width });
    await until(() => visible('suche'), 'search start page');
    await noOverflow();
    if(layoutOnly) {
      const layout=await evaluate(`(()=>{const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {top:Math.round(r.top),bottom:Math.round(r.bottom),height:Math.round(r.height)}};return {width:innerWidth,height:innerHeight,input:rect('#search-query'),submit:rect('.primary-search'),intro:rect('.search-intro'),content:rect('main'),nav:rect('nav'),emptySummaryHidden:document.querySelector('#intent-compass').hidden}})()`);
      console.log(JSON.stringify({layoutBaseline,layout}));
      if(process.env.UDI_SCREENSHOT_DIR){await mkdir(process.env.UDI_SCREENSHOT_DIR,{recursive:true});const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(join(process.env.UDI_SCREENSHOT_DIR,'layout-'+width+'.png'),Buffer.from(shot.data,'base64'));}
      if(!layoutBaseline) {
        assert(layout.emptySummaryHidden,'empty search has no redundant summary');
        if(width<500){assert(layout.content.bottom<=layout.nav.top,'navigation has its own area outside content');assert(layout.submit.bottom<=layout.nav.top-12,'search starts within the first screen');}
        assert(await evaluate("(()=>{const b=document.querySelector('.primary-search'),r=b.getBoundingClientRect();return b.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))})()"),'visible search button receives pointer input');
        await evaluate("document.querySelector('#search-query').value='Samsung 990 PRO 2 TB';document.querySelector('#search-query').dispatchEvent(new Event('input',{bubbles:true}))");
        assert(await evaluate("document.querySelector('#intent-compass').hidden"),'plain query is not repeated');
        await pointerClick('.primary-search');await until(()=>evaluate("Boolean(document.querySelector('#web-results article a'))"),'visible primary action starts real app flow');
        await evaluate("document.querySelector('main').scrollTop=document.querySelector('main').scrollHeight");
        assert(await evaluate("(()=>{const footer=document.querySelector('footer a'),r=footer.getBoundingClientRect();return footer.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))})()"),'last content action scrolls fully clear of navigation');
        await send('Emulation.setDeviceMetricsOverride',{width,height:520,deviceScaleFactor:1,mobile:width<500});
        await evaluate("document.documentElement.style.fontSize='200%'");await noOverflow();
        assert(await evaluate("(()=>{const button=document.querySelector('.primary-search').getBoundingClientRect(),form=document.querySelector('.composer').getBoundingClientRect();return button.left>=form.left && button.right<=form.right})()"),'large-text search button fits entirely inside its form');
        await evaluate("document.querySelector('#search-query').focus();document.querySelector('#search-query').scrollIntoView({block:'center'})");
        assert(await evaluate("(()=>{const input=document.querySelector('#search-query'),r=input.getBoundingClientRect();return input.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))})()"),'input remains reachable with large text in a short viewport');
      }
      continue;
    }
    if (!live) {
      const manifest = await send('Page.getAppManifest');
      assert.equal(manifest.errors.length,0,'manifest loads without parser errors');
      assert.equal(JSON.parse(manifest.data).display,'standalone');
      assert(await evaluate("Promise.all([192,512].map(size=>new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(i.naturalWidth===size);i.onerror=()=>resolve(false);i.src='./assets/udi-'+size+'.png'}))).then(values=>values.every(Boolean))"),'local install icons decode in browser');
      if(width===390) {
        const installability=await send('Page.getInstallabilityErrors');
        console.log('Chromium installability: '+JSON.stringify(installability.installabilityErrors));
      }
      await click('a[href="#hilfe"]');
      await until(()=>visible('hilfe'),'installation and pilot help');
      assert(await evaluate("document.querySelector('main #hilfe')!==null"));
      assert(await evaluate("document.querySelector('[data-install-status]').textContent.includes('HTTPS-Testadresse')"));
      if(width===390) {
        await evaluate("window.udiInstallCalls=0;const invitation=new Event('beforeinstallprompt',{cancelable:true});Object.assign(invitation,{prompt:async()=>{window.udiInstallCalls++},userChoice:Promise.resolve({outcome:'dismissed'})});window.dispatchEvent(invitation)");
        assert.equal(await evaluate('window.udiInstallCalls'),0,'installation prompt needs explicit action');
        await click('[data-install]');
        await until(()=>evaluate("document.querySelector('[data-install-status]').textContent.includes('abgebrochen')"),'installation dismissal respected');
        assert.equal(await evaluate('window.udiInstallCalls'),1);
        assert(await evaluate("document.querySelector('[data-install]').hidden"));
      }
      assert(await evaluate("(()=>{const u=new URL(document.querySelector('#hilfe a[target=_blank]').href);return u.pathname==='/essenmitpassion-sudo/Catworld/issues/new' && !u.searchParams.has('template') && u.searchParams.has('title') && u.searchParams.get('body').includes('keine persoenlichen Daten')})()"),'feedback works without a template on the historical default branch');
      if(process.env.UDI_SCREENSHOT_DIR) {
        await mkdir(process.env.UDI_SCREENSHOT_DIR,{recursive:true});
        const shot=await send('Page.captureScreenshot',{format:'png'});
        await writeFile(join(process.env.UDI_SCREENSHOT_DIR,'help-'+width+'.png'),Buffer.from(shot.data,'base64'));
      }
      await noOverflow();
      await evaluate("document.documentElement.style.fontSize='200%'");await noOverflow();await evaluate("document.documentElement.style.fontSize=''");
      await click('#hilfe [data-example]');
      await until(()=>visible('suche'),'pilot onboarding prepares search');
      assert(await evaluate("!document.querySelector('#web-results').textContent"),'onboarding does not start scanning');
      if(width===390) {
        await evaluate("navigator.clipboard.writeText=async value=>{window.udiCopied=value}");
        await click('.share-search summary');await click('[data-share-prepare]');
        assert(await evaluate("document.querySelector('[data-share-status]').textContent.includes('lokaler Testlink')"));
        assert(await evaluate("document.querySelector('[data-share-native]').hidden"));
        await noOverflow();
        await click('[data-share-copy]');
        assert(await evaluate("window.udiCopied===document.querySelector('[data-share-url]').value"));
        await evaluate("document.querySelector('#max-price').value='500';document.querySelector('#condition').value='new';document.querySelector('#max-price').dispatchEvent(new Event('input',{bubbles:true}))");
        assert(await evaluate("document.querySelector('#share-preview').hidden && !document.querySelector('[data-share-url]').value"),'edited criteria invalidate the prepared link');
        await click('[data-share-prepare]');await click('[data-share-copy]');
        const shared=await evaluate('window.udiCopied');
        await send('Page.navigate',{url:shared});
        await until(()=>evaluate("document.querySelector('#shared-notice')?.textContent.includes('Geteilte Suche übernommen')"),'shared search received');
        assert.equal(await evaluate("document.querySelector('#max-price').value"),'500.00');
        assert.equal(await evaluate("document.querySelector('#condition').value"),'new');
        assert(await evaluate("!document.querySelector('#web-results').textContent && performance.getEntriesByType('resource').every(entry=>!entry.name.includes('/api/discovery'))"),'opening a shared link never scans automatically');
        await send('Page.navigate',{url:origin+'/#suche?auftrag=%broken'});
        await until(()=>evaluate("document.querySelector('#shared-notice')?.textContent.includes('nicht übernommen')"),'invalid share explained without executing it');
        assert(await evaluate("!document.querySelector('#web-results').textContent"));
        await send('Page.navigate',{url:origin+'/?reset-share=1#suche'});
        await until(()=>evaluate("location.search==='?reset-share=1' && document.getElementById('suche')?.hidden===false"),'ordinary search after share test');
        await click('[data-example]');
      }
      assert(await evaluate("Boolean(document.querySelector('#search-query').tagName === 'TEXTAREA')"));
      await click('[data-example]');
      assert.equal(await evaluate("document.querySelector('#search-query').value"), 'Samsung 990 PRO 2 TB');
      assert(await evaluate("document.querySelector('#intent-compass').hidden && !document.querySelector('#intent-summary').textContent"),'plain search is not repeated beneath the input');
      assert(await evaluate("!document.querySelector('#web-results').textContent"), 'example prepares the search without starting it');
      await evaluate("document.querySelector('#search-query').focus()");
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', text: '\r', windowsVirtualKeyCode: 13, modifiers: 8 });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, modifiers: 8 });
      assert(await evaluate("document.querySelector('#search-query').value.includes('\\n')"), 'Shift+Enter inserts a line without starting a search');
      await click('[data-example]');
    }
    if (process.env.UDI_SCREENSHOT_DIR) {
      await mkdir(process.env.UDI_SCREENSHOT_DIR, { recursive: true });
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      await writeFile(join(process.env.UDI_SCREENSHOT_DIR, 'start-' + width + '.png'), Buffer.from(shot.data, 'base64'));
    }
    if (!live) {
      await evaluate("document.documentElement.style.fontSize='200%'");
      await noOverflow();
      await evaluate("document.documentElement.style.fontSize=''");
    }
    if (live) {
      await evaluate("document.querySelector('#search-query').focus()");
      await type(liveEnglish?'Samsung 990 PRO 2 TB up to CHF 500':'Samsung 990 PRO 2 TB bis CHF 500');
      await key('Enter');
      await until(() => evaluate("document.querySelector('#web-results article a')?.href.startsWith('https://www.dq-solutions.ch/')"), 'live DQ offer');
      assert(await evaluate(`document.querySelector('#web-results .cost-open')?.textContent.includes(${JSON.stringify(liveEnglish?'Shipping':'Versand')})`), 'live offer names unknown costs');
      assert(await evaluate("!document.querySelector('#web-results .value-proof')"), 'partial live offer has no savings claim');
      await noOverflow();
      const receipt = JSON.parse(await readFile(join(profile, 'checks.json'), 'utf8')).at(-1);
      const check = receipt.checks.find(check => check.seller === 'DQ Solutions');
      assert.equal(check.httpStatus, 200);
      assert.equal(receipt.marketId,'CH');assert.equal(receipt.deliveryCountry,'CH');assert.equal(receipt.currency,'CHF');
      assert.equal(check.marketId,'CH');assert.equal(check.sourceId,'dq-solutions.ch');assert.equal(check.deliveryDestination,null,'requested CH delivery is not a delivery proof');
      assert.equal(check.mpn, 'MZ-V9P2T0BW');
      assert.equal(check.availability, 'active');
      assert(check.price > 0);
      assert.equal(check.total, null);
      const offerUrl = await evaluate("document.querySelector('#web-results article a').href");
      if (process.env.UDI_SCREENSHOT_DIR) {
        await evaluate("document.querySelector('#web-results').scrollIntoView()");
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        await writeFile(join(process.env.UDI_SCREENSHOT_DIR, 'live-offer.png'), Buffer.from(shot.data, 'base64'));
      }
      // Respect the source's crawl delay before following the link in the browser.
      await pause(10_100);
      await click('#web-results article a[href="#passport"]');
      assert(await visible('passport'));
      assert(await evaluate("document.querySelector('#detail').textContent.includes('MZ-V9P2T0BW')"));
      assert.equal(await evaluate("document.querySelector('#detail a[target=_blank]').href"), offerUrl);
      await click('#detail a[target=_blank]');
      let lastPages = [];
      const merchant = await until(async () => {
        const list = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
        lastPages = list.map(page => ({ url: page.url, title: page.title }));
        return list.find(page => page.url === offerUrl && page.title.includes('MZ-V9P2T0BW'));
      }, 'correct live merchant page').catch(error => {
        console.error(JSON.stringify({ observedBrowserPages: lastPages }));
        throw error;
      });
      console.log(JSON.stringify({ checkedOffer: check, browserPage: { url: merchant.url, title: merchant.title } }));
      await send('Target.closeTarget', { targetId: merchant.id });
      continue;
    }
    await click('nav a[href="#radar"]');
    await until(() => visible('radar'), 'radar');
    await until(() => evaluate("document.querySelector('#radar-content').textContent.includes('keine bestätigte')"), 'radar empty state');
    await noOverflow();
    if (width === 390) {
      await key('Tab');
      await evaluate("document.querySelector('.skip').focus()");
      await key('Enter');
      assert.equal(await evaluate('document.activeElement.id'), 'main');
    }
    await evaluate("document.querySelector('#radar-query').focus()");
    await type('Samsung 990 PRO 2 TB');
    await key('Enter');
    await until(() => visible('suche'), 'keyboard search submission');
    assert.equal(await evaluate('document.activeElement.tagName'), 'H2');
    await until(() => evaluate("Boolean(document.querySelector('#web-results article a[href$=passport]'))"), 'catalog offer Passport').catch(async error=>{
      console.error(await evaluate("document.querySelector('#web-results').textContent"));throw error;
    });
    assert.equal(await evaluate('document.activeElement.tagName'), 'H2', 'focus stays on visible search results');
    await click('#web-results article a[href="#passport"]');
    assert(await visible('passport'));
    await click('nav a[href="#vergleich"]');
    assert(await visible('vergleich'));
    assert.equal(await evaluate("document.querySelectorAll('#comparison article').length"), catalog[0].sources.length);
    assert(await evaluate("document.querySelector('#comparison').textContent.includes('Kaufentscheid offen')"));
    await noOverflow();
    await click('#comparison article a');
    assert(await visible('passport'));
    const link = await evaluate("document.querySelector('#detail a[target=_blank]').href");
    assert.match(link, /^https:\/\/www\.digitec\.ch\/de\/s1\/product\/.+-22097721$/);
    await noOverflow();
    await click('#detail button');
    await click('nav a[href="#watchlist"]');
    await until(() => visible('watchlist'), 'watchlist');
    await send('Page.reload');
    await until(() => evaluate("document.querySelector('#saved')?.textContent.includes('MZ-V9P2T0BW')"), 'persisted watchlist');
    await click('#saved button');
    assert(await evaluate("document.querySelector('#saved').textContent.includes('Watchlist ist leer')"));
    await click('nav a[href="#suche"]');
    await until(() => visible('suche'), 'search');
    if (width === 390) {
      await evaluate("document.querySelector('#search-query').focus()");
      await type('Samsung 990 PRO 1 TB');
      await key('Enter');
      await until(() => evaluate("document.querySelector('#web-results').textContent.includes('Keine passenden aktuellen Angebote')"), 'empty web search');
      assert(await evaluate("window.SpeechRecognition?.toString().includes('udiSpeechError')"), 'dictation test adapter installed');
      assert(await evaluate("!document.querySelector('#suche [data-mic]').hidden"), 'dictation control visible');
      await evaluate("document.querySelector('#search-query').value = ''; document.querySelector('#search-query').dispatchEvent(new Event('input', {bubbles:true}))");
      await click('#suche [data-mic]');
      await until(() => evaluate("document.querySelector('#search-query').value === 'Mein PC braucht mehr Speicher'"), 'dictation input');
      await until(() => evaluate("!document.querySelector('[data-audio-preview]').hidden && document.querySelector('[data-audio]').src.startsWith('blob:')"), 'temporary recording preview');
      assert(await evaluate("document.querySelector('#intent-compass').hidden"),'dictated request is editable in one place');
      assert(await evaluate("document.querySelector('#intent-question').hidden"), 'no unnecessary capacity question for a vague need');
      assert(await visible('suche'));
      assert.equal(await evaluate("document.querySelector('#results h2').textContent"), 'Dein Suchwunsch');
      await key('Enter');
      await until(() => evaluate("document.querySelector('#web-results').textContent.includes('Darf ein Gebrauchtangebot')"), 'clarification').catch(async error => {
        console.error(await evaluate("JSON.stringify({query:document.querySelector('#search-query').value,focus:document.activeElement.outerHTML,results:document.querySelector('#web-results').textContent,voice:document.querySelector('[data-voice-status]').textContent,intent:document.querySelector('#intent-compass').textContent})"));
        throw error;
      });
      await click('#web-results button:nth-child(2)');
      await until(() => evaluate("document.querySelector('#web-results a')?.textContent === 'Inserat öffnen'"), 'marketplace result');
      assert.equal(await evaluate("document.querySelector('#web-results a').href"), 'https://www.ricardo.ch/de/a/test-pc-1234567890/');
      assert(await evaluate("document.querySelector('#web-results').textContent.includes('Teilweise geprüft')"));
      assert(await evaluate("!document.querySelector('#web-results').textContent.includes('Verkaufter PC')"));
      assert(await evaluate("document.querySelector('#web-results').textContent.includes('Gesamtkosten noch offen')"));
      assert(await evaluate("document.querySelector('#web-results .cost-open').textContent.includes('Pflichtgebühren')"));
      await noOverflow();
      if (process.env.UDI_SCREENSHOT_DIR) {
        await evaluate("document.querySelector('#web-results').scrollIntoView()");
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        await writeFile(join(process.env.UDI_SCREENSHOT_DIR, 'offers-' + width + '.png'), Buffer.from(shot.data, 'base64'));
      }
      assert(await evaluate(`(() => {
        const realNow = Date.now;
        Date.now = () => realNow() + 300001;
        try {
          document.querySelector('#web-results a').click();
          return document.querySelector('#web-results').textContent.includes('abgelaufen')
            && !document.querySelector('#web-results a');
        } finally { Date.now = realNow; }
      })()`), 'expired offer cannot be opened');
      await evaluate("document.querySelector('#suche .search-options').open = true; document.querySelector('#max-price').value = '500'; document.querySelector('#condition').value = 'used'; document.querySelector('#search-query').focus()");
      await key('Enter');
      await until(() => evaluate("document.querySelector('#web-results').textContent.includes('erfüllen deine Kaufkriterien nicht')"), 'over-budget offer excluded');
      assert(await evaluate("!document.querySelector('#web-results a')"));
      assert(await evaluate("document.querySelector('#results').textContent.includes('Gesamtbudget bis CHF')"));
      await noOverflow();
      await click('#results button');
      await until(() => evaluate("document.querySelector('#results button').textContent === 'Suche gespeichert'"), 'saved search');
      await click('nav a[href="#watchlist"]');
      await until(() => evaluate("document.querySelector('#saved').textContent.includes('Gesamtbudget bis CHF')"), 'watchlist saved criteria');
      await send('Page.reload');
      await until(() => evaluate("document.querySelector('#saved').textContent.includes('Mein PC braucht mehr Speicher')"), 'saved search persisted');
      await click('#saved .button');
      await until(() => visible('suche'), 'restore saved search');
      assert.equal(await evaluate("document.querySelector('#max-price').value"), '500.00');
      assert.equal(await evaluate("document.querySelector('#condition').value"), 'used');
      await until(() => evaluate("document.querySelector('#web-results').textContent.includes('erfüllen deine Kaufkriterien nicht')"), 'saved search reapplies budget');
      await click('nav a[href="#watchlist"]');
      await until(() => visible('watchlist'), 'saved search removal');
      await click('#saved .text-button');
      await until(() => evaluate("document.querySelector('#saved').textContent.includes('Watchlist ist leer')"), 'saved search removed');
      await click('nav a[href="#suche"]');
      await until(() => visible('suche'), 'search');
      await evaluate("document.querySelector('#max-price').value = '1.234'; document.querySelector('#search-query').focus()");
      await key('Enter');
      assert(await evaluate("document.querySelector('#results').textContent.includes('Bitte prüfe deine Kaufkriterien')"));
      assert.equal(await evaluate('document.activeElement.id'), 'max-price');
      if (process.env.UDI_SCREENSHOT_DIR) {
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        await writeFile(join(process.env.UDI_SCREENSHOT_DIR, 'criteria-' + width + '.png'), Buffer.from(shot.data, 'base64'));
      }
      // Intent refinement happens before a request and never modifies the draft silently.
      await evaluate("document.querySelector('#max-price').value = ''; document.querySelector('#condition').value = ''; document.querySelector('#search-query').value = 'RAM für meinen PC'; document.querySelector('#search-query').dispatchEvent(new Event('input',{bubbles:true}))");
      assert.equal(await evaluate("document.querySelectorAll('#intent-question h3').length"), 1);
      const previousResults = await evaluate("document.querySelector('#web-results').textContent");
      await click('#suche button[type=submit]');
      assert.equal(await evaluate('document.activeElement.tagName'), 'H3');
      assert.equal(await evaluate("document.querySelector('#web-results').textContent"), previousResults);
      await click('#intent-question button:nth-child(2)');
      assert.equal(await evaluate("document.querySelector('#search-query').value"), 'RAM 32 GB für meinen PC');
      assert(await evaluate("document.querySelector('#intent-summary').textContent.includes('von UDI vorgeschlagen, von dir gewählt')"));
      assert(await evaluate("document.querySelector('#intent-question').hidden"));
      await evaluate("document.querySelector('#search-query').value='RAM für meinen PC'; document.querySelector('#search-query').dispatchEvent(new Event('input',{bubbles:true}))");
      await click('#intent-question button:last-child');
      assert.equal(await evaluate("document.querySelector('#search-query').value"), 'RAM für meinen PC');
      assert(await evaluate("document.querySelector('#intent-summary').textContent.includes('Kapazität offen')"));

      await evaluate("document.querySelector('#search-query').value='Bitte gebraucht.'; document.querySelector('#search-query').dispatchEvent(new Event('input',{bubbles:true}))");
      await click('[data-mic]');
      await until(() => evaluate("document.querySelector('#search-query').value === 'Bitte gebraucht. Mein PC braucht mehr Speicher'"), 'dictation appends without losing typed text');
      await until(() => evaluate("!document.querySelector('[data-audio-preview]').hidden"), 'recording ready for playback');
      assert(await evaluate("(async()=>{const audio=document.querySelector('[data-audio]');await audio.play();const playing=!audio.paused;audio.pause();return playing;})()"));
      await click('[data-delete-audio]');
      assert(await evaluate("document.querySelector('[data-audio-preview]').hidden && !document.querySelector('[data-audio]').getAttribute('src')"));
      assert.equal(await evaluate("document.querySelector('#search-query').value"), 'Bitte gebraucht. Mein PC braucht mehr Speicher');

      await evaluate("window.udiGetMedia=navigator.mediaDevices.getUserMedia; navigator.mediaDevices.getUserMedia=()=>Promise.reject(new DOMException('denied','NotAllowedError'))");
      await click('[data-mic]');
      await until(() => evaluate("document.querySelector('[data-voice-status]').textContent.includes('Kein Mikrofonzugriff')"), 'microphone refusal explained');
      assert.equal(await evaluate("document.querySelector('#search-query').value"), 'Bitte gebraucht. Mein PC braucht mehr Speicher');
      await evaluate("navigator.mediaDevices.getUserMedia=window.udiGetMedia; window.udiSpeechError='no-speech'");
      await click('[data-mic]');
      await until(() => evaluate("document.querySelector('[data-voice-status]').textContent.includes('nicht verstehen')"), 'speech recognition failure explained');
      assert.equal(await evaluate("document.querySelector('#search-query').value"), 'Bitte gebraucht. Mein PC braucht mehr Speicher');
      await evaluate("window.udiSpeechError='not-allowed'");
      await click('[data-mic]');
      await until(() => evaluate("document.querySelector('[data-voice-status]').textContent.includes('nicht erlaubt')"), 'speech service refusal explained');
      await evaluate("window.udiSpeechError=null; window.udiHoldSpeech=true");
      await evaluate("window.udiFinalOnStop='Samsung 990 PRO 2 TB';document.querySelector('#search-query').value='Eine';document.querySelector('#search-query').dispatchEvent(new Event('input',{bubbles:true}))");
      await click('[data-mic]');
      await until(() => evaluate("document.querySelector('[data-mic-label]').textContent==='Aufnahme stoppen'"), 'ready to stop recording');
      await click('[data-mic]');
      await until(() => evaluate("document.querySelector('#search-query').value==='Eine Samsung 990 PRO 2 TB'"), 'final words after manual stop preserved');
      await evaluate("window.udiFinalOnStop=null");
      await click('[data-mic]');
      await until(() => evaluate("document.querySelector('[data-voice-status]').textContent.includes('0:01')"), 'visible recording duration');
      await click('#suche button[type=submit]');
      assert.equal(await evaluate("document.querySelector('[data-mic]').getAttribute('aria-pressed')"), 'false');
      assert.equal(await evaluate("document.querySelector('#web-results').textContent"), previousResults, 'stopping a recording does not start a search');
      await evaluate("window.udiHoldSpeech=false");
      const unsupported = await send('Page.addScriptToEvaluateOnNewDocument', { source: "Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true})" });
      await send('Page.reload');
      await until(() => evaluate("Boolean(document.querySelector('[data-mic]')?.disabled)"), 'unsupported browser offers text fallback');
      assert(await evaluate("document.querySelector('[data-voice-status]').textContent.includes('Textfeld')"));
      await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: unsupported.identifier });
    }
    if (!live && [390,1365].includes(width)) {
      // Trusted-publication fixtures are intercepted only in this isolated test
      // browser. Production observations and real merchant pages stay untouched.
      let fixture = [];
      const intercept = async event => {
        const message = JSON.parse(event.data);
        if (message.method !== 'Fetch.requestPaused') return;
        const body = message.params.request.url.includes('/observations.json') ? fixture
          : {kind:'results',items:[],attemptedUrls:[]};
        await send('Fetch.fulfillRequest', {requestId:message.params.requestId,responseCode:200,
          responseHeaders:[{name:'Content-Type',value:'application/json'}],
          body:Buffer.from(JSON.stringify(body)).toString('base64')});
      };
      socket.addEventListener('message', intercept);
      await send('Fetch.enable', {patterns:[{urlPattern:origin+'/observations.json'}, {urlPattern:origin+'/api/discovery'}]});
      for (const matchingDestination of [true,false]) {
        fixture = catalog[0].sources.slice(0,2).map((source,index) => ({
          marketId:source.marketId,sourceId:source.sourceId,
          mpn:catalog[0].mpn, seller:source.seller, url:source.url, finalUrl:source.url,
          checkedAt:new Date().toISOString(),currency:'CHF',stock:'in-stock',condition:'Neu',
          delivery:'Browser-Testbeobachtung',price:20000+index*1000,shipping:0,taxes:0,imports:0,fees:0,
          deliveryDestination:{country:'CH',postalCode:index && !matchingDestination?'3000':'8000'},
        }));
        const evidenceQuery = '?evidence=' + (matchingDestination ? 'matching' : 'different');
        await send('Page.navigate',{url:origin+'/'+evidenceQuery+'#suche'});
        await until(()=>evaluate(`location.search === ${JSON.stringify(evidenceQuery)} && document.readyState === 'complete' && document.getElementById('suche')?.hidden === false`),'comparison evidence start');
        await evaluate("document.querySelector('#search-query').focus()");
        await type('Samsung 990 PRO 2 TB'); await key('Enter');
        await until(()=>evaluate("Boolean(document.querySelector('#results .button'))"),'product comparison action');
        await click('#results a[href="#vergleich"]');
        if (matchingDestination) {
          await until(()=>evaluate("document.querySelector('#comparison .value-proof')?.textContent.includes('Möglicher Preisvorteil')"),'possible price advantage with traceable basis');
          const proof=await evaluate("document.querySelector('#comparison .value-proof').textContent");
          assert(proof.includes('CHF') && proof.includes('10.00') && proof.includes('8000') && proof.includes('keine bereits erzielte Ersparnis'));
          assert.equal(await evaluate("document.querySelector('#comparison .value-proof a').href"),catalog[0].sources[1].url);
        } else {
          await until(()=>evaluate("document.querySelector('#comparison').textContent.includes('Zustand oder Lieferort sind nicht') || document.querySelector('#comparison').textContent.includes('Zustand oder Lieferort')"),'different destinations explained');
          assert(await evaluate("!document.querySelector('#comparison .value-proof')"));
          assert(await evaluate("document.querySelector('#comparison').textContent.includes('Kaufentscheid offen')"));
        }
        await noOverflow();
      }
      await send('Fetch.disable');
      socket.removeEventListener('message',intercept);
    }
    console.log('Browser workflow passed at ' + width + 'px');
  }
  if(!live&&!layoutOnly&&!nativeOnly)for(const width of [390,1365]) {
    await closeTestServer();app=server(appOptions);app.listen(0,'127.0.0.1');await once(app,'listening');
    origin='http://127.0.0.1:'+app.address().port;
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<500});
    await send('Page.navigate',{url:origin+'/#suche'});await until(()=>visible('suche'),'bilingual app start');
    await evaluate("document.querySelector('#search-query').value='Samsung 990 PRO 2 TB up to CHF 600';document.querySelector('#max-price').value='600';document.querySelector('#condition').value='used';document.querySelector('#search-query').dispatchEvent(new Event('input',{bubbles:true}))");
    const draft=await evaluate("JSON.stringify([document.querySelector('#search-query').value,document.querySelector('#max-price').value,document.querySelector('#condition').value])");
    await evaluate("document.querySelector('#ui-language').value='en';document.querySelector('#ui-language').dispatchEvent(new Event('change',{bubbles:true}))");
    assert.equal(await evaluate("JSON.stringify([document.querySelector('#search-query').value,document.querySelector('#max-price').value,document.querySelector('#condition').value])"),draft);
    assert.equal(await evaluate('document.documentElement.lang'),'en');
    await evaluate("document.querySelector('#search-query').value='SSD under 500 €';document.querySelector('#search-query').dispatchEvent(new Event('input',{bubbles:true}))");
    assert(await evaluate("document.querySelector('#intent-summary').textContent.includes('supports budgets in CHF only')"),'foreign currency error is English in the search compass');
    await evaluate("document.querySelector('#search-query').value='Samsung 990 PRO 2 TB up to CHF 600';document.querySelector('#condition').value='';document.querySelector('#search-query').dispatchEvent(new Event('input',{bubbles:true}))");
    assert(await evaluate("document.querySelector('.market-label').textContent.includes('Switzerland')"));
    assert(await evaluate("performance.getEntriesByType('resource').every(entry=>!entry.name.includes('/api/discovery'))"),'language change never scans');
    const manifest=await send('Page.getAppManifest');assert.equal(JSON.parse(manifest.data).lang,'en');assert.equal(manifest.errors.length,0);
    await noOverflow();await evaluate("document.documentElement.style.fontSize='200%'");await noOverflow();await evaluate("document.documentElement.style.fontSize=''");
    if(process.env.UDI_SCREENSHOT_DIR){await evaluate("document.querySelector('main').scrollTo(0,0)");const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(join(process.env.UDI_SCREENSHOT_DIR,'english-start-'+width+'.png'),Buffer.from(shot.data,'base64'));}
    await pointerClick('#suche button[type=submit]');
    await until(()=>evaluate("Boolean(document.querySelector('#web-results article a[href=\"#passport\"]'))"),'English current offer').catch(async error=>{console.error(await evaluate("document.querySelector('#web-results').textContent"));console.error(await evaluate("document.querySelector('#results').textContent"));throw error;});
    assert(await evaluate("document.querySelector('#web-results').textContent.includes('Recently checked') && document.querySelector('#web-results').textContent.includes('total costs still unknown')"));
    assert(await evaluate("document.querySelector('#web-results article h3').textContent.includes('Samsung 990 PRO')"),'product identity remains unchanged');
    assert(await evaluate("!document.querySelector('#web-results .value-proof')"),'English partial costs never imply savings');
    const direct=await evaluate("document.querySelector('#web-results a[target=_blank]').href");
    if(process.env.UDI_SCREENSHOT_DIR){await evaluate("document.querySelector('#web-results').scrollIntoView()");const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(join(process.env.UDI_SCREENSHOT_DIR,'english-offers-'+width+'.png'),Buffer.from(shot.data,'base64'));}
    await click('#web-results a[href="#passport"]');assert(await visible('passport'));
    assert(await evaluate("document.querySelector('#detail').textContent.includes('Partially checked') && document.querySelector('#detail').textContent.includes('Total cost') && document.querySelector('#detail').textContent.includes('Unknown')"));
    assert.equal(await evaluate("document.querySelector('#detail a[target=_blank]').href"),direct);
    await click('nav a[href="#vergleich"]');assert(await evaluate("document.querySelector('#comparison').textContent.includes('Buying decision open')"));await noOverflow();
    await click('nav a[href="#suche"]');await click('#results button');
    await until(()=>evaluate("document.querySelector('#results button').textContent==='Search saved'"),'English save search');
    await click('nav a[href="#watchlist"]');const savedBefore=await evaluate("localStorage.getItem('udi.searches.v2')");
    assert(savedBefore&&JSON.parse(savedBefore)[0].marketId==='CH','saved request has an explicit market');
    assert(await evaluate("document.querySelector('#saved').textContent.includes('Total budget up to CHF')"));
    await evaluate("document.querySelector('#ui-language').value='de';document.querySelector('#ui-language').dispatchEvent(new Event('change',{bubbles:true}))");
    assert.equal(await evaluate("localStorage.getItem('udi.searches.v2')"),savedBefore,'switching language preserves saved requests byte for byte');
    await evaluate("document.querySelector('#ui-language').value='en';document.querySelector('#ui-language').dispatchEvent(new Event('change',{bubbles:true}))");
    await send('Page.reload');await until(()=>evaluate("document.documentElement.lang==='en' && document.querySelector('#saved')?.textContent.includes('Samsung 990 PRO 2 TB up to CHF 600')"),'English preference and saved search survive restart');
    await click('#saved .button');await until(()=>evaluate("document.querySelector('#web-results').textContent.includes('Recently checked')"),'English saved search reruns');
    assert.equal(await evaluate("document.querySelector('#condition').value"),'any');
    assert(await evaluate(`(()=>{const original=Date.now;Date.now=()=>original()+300001;try{document.querySelector('#web-results a').click();return document.querySelector('#web-results').textContent.includes('expired')&&!document.querySelector('#web-results a')}finally{Date.now=original}})()`),'English expired offers are removed');
    await evaluate("document.querySelector('#search-query').value='SSD for my PC';document.querySelector('#max-price').value='';document.querySelector('#condition').value='';document.querySelector('#search-query').dispatchEvent(new Event('input',{bubbles:true}))");
    assert(await evaluate("document.querySelector('#intent-question').textContent.includes('How much SSD storage')"));
    await evaluate("document.querySelector('#search-query').value='';document.querySelector('#search-query').dispatchEvent(new Event('input',{bubbles:true}));window.udiTranscript='My PC needs more storage'");
    await click('[data-mic]');await until(()=>evaluate("document.querySelector('#search-query').value==='My PC needs more storage' && document.querySelector('[data-mic]').getAttribute('aria-pressed')==='false'"),'English dictation with test adapter');
    assert.equal(await evaluate('window.udiSpeechLanguage'),'en-GB');
    await click('[data-delete-audio]');
    await evaluate("navigator.mediaDevices.getUserMedia=()=>Promise.reject(new DOMException('denied','NotAllowedError'))");await click('[data-mic]');
    await until(()=>evaluate("document.querySelector('[data-voice-status]').textContent.includes('No microphone access')"),'English microphone permission refusal');
    await click('.share-search summary');await click('[data-share-prepare]');assert(await evaluate("document.querySelector('[data-share-status]').textContent.toLowerCase().includes('local test link')"));
    await click('a[href="#hilfe"]');await until(()=>visible('hilfe'),'English installation and privacy help');
    assert(await evaluate("document.querySelector('#hilfe').textContent.includes('Dictation needs microphone permission')"));
    await noOverflow();
    console.log('English workflow passed at '+width+'px (CH/CHF, persistence, expiry, dictation adapter, permissions, sharing)');
  }
  if(!live&&!layoutOnly)for(const platform of ['android','ios','unsupported']) {
    await closeTestServer();app=server(appOptions);app.listen(0,'127.0.0.1');await once(app,'listening');
    origin='http://127.0.0.1:'+app.address().port;
    const legacySearches=JSON.stringify([{query:'Samsung 990 PRO 2 TB',scope:null,maxPrice:'',condition:'any',completeCostsOnly:false}]);
    const adapter=await send('Page.addScriptToEvaluateOnNewDocument',{source:`window.Capacitor={getPlatform:()=>${JSON.stringify(platform)},Plugins:{Preferences:{get:async({key})=>({value:localStorage.getItem('udi.qa.pref:'+key)}),set:async({key,value})=>{localStorage.setItem('udi.qa.pref:'+key,value)}}}};try{localStorage.setItem('udi.language.v1','en');if(localStorage.getItem('udi.searches.v1')===null)localStorage.setItem('udi.searches.v1',${JSON.stringify(legacySearches)})}catch{}`});
    const savedRows=platform==='unsupported'?"JSON.parse(localStorage.getItem('udi.searches.v2'))":"JSON.parse(JSON.parse(localStorage.getItem('udi.qa.pref:udi.searches.native.v1')).values['udi.searches.v2'])";
    await send('Emulation.setDeviceMetricsOverride',{width:nativeSmall?320:390,height:nativeSmall?640:780,deviceScaleFactor:1,mobile:true});
    await send('Page.navigate',{url:origin+'/#suche'});
    await until(()=>evaluate(`document.documentElement.dataset.platform===${JSON.stringify(platform)}`),'native boundary simulation initialized');
    await captureBoundary(platform,'en',send);
    if(process.argv.includes('--native-flow-simulation')&&platform==='android') {
      await evaluate("localStorage.removeItem('udi.searches.v1');localStorage.removeItem('udi.searches.v2')");
      await androidFlow({send,evaluate},false);
      console.log('Desktop simulation of Android QA sequence passed; this is not device acceptance.');
      break;
    }
    assert(await evaluate("document.querySelector('#native-runtime-status').textContent.includes('cannot show current offers')"));
    assert.equal(await evaluate("document.querySelectorAll('nav a:not([hidden])').length"),2,'native navigation has the two usable main destinations');
    assert.equal(await evaluate("document.querySelector('nav a[href=\"#watchlist\"]').textContent.trim()"),'Saved');
    assert(await evaluate("document.querySelector('[data-mic]').disabled"),'native voice is not pretended from browser support');
    assert(await evaluate("document.querySelector('.composer-tools').hidden&&document.querySelector('[data-voice]').hidden"),'native entry offers text without inactive microphone or desktop keyboard hints');
    assert(await evaluate("document.querySelector('.primary-search').getBoundingClientRect().bottom<=document.querySelector('nav').getBoundingClientRect().top"),'native primary action fits above navigation without an initial scroll');
    await pointerClick('#search-query');await type('Samsung 990 PRO 2 TB');
    assert(await evaluate("Array.from(document.querySelectorAll('[data-language-value]')).length===2&&Array.from(document.querySelectorAll('[data-language-value]')).every(node=>{const r=node.getBoundingClientRect();return r.width>=44&&r.height>=44})"),'both native language actions have usable touch targets');
    assert(await evaluate("['de','en'].every(code=>{const b=document.querySelector('[data-language-value='+code+']'),r=b?.getBoundingClientRect();return b?.tagName==='BUTTON'&&r.width>=44&&r.height>=44})"),'native languages must be directly reachable touch actions');
    await evaluate("document.querySelector('#search-query').value='Samsung 990 PRO 2 TB';document.querySelector('#search-query').focus()");
    await pointerClick('[data-language-value=de]');
    assert.equal(await evaluate("document.documentElement.lang"),'de-CH');
    assert.equal(await evaluate("document.querySelector('#search-query').value"),'Samsung 990 PRO 2 TB','language tap preserves editing draft');
    assert.equal(await evaluate("document.querySelector('[data-language-value=de]').getAttribute('aria-pressed')"),'true');
    await pointerClick('[data-language-value=en]');
    assert.equal(await evaluate("document.querySelector('[data-language-value=de]').getAttribute('aria-pressed')"),'false');
    assert(await evaluate("document.querySelector('#ui-language').closest('label').hidden"),'old picker is not a second visible control');
    await evaluate("document.querySelector('#search-query').value='';document.querySelector('#search-query').dispatchEvent(new Event('input',{bubbles:true}))");
    assert(await evaluate("document.querySelector('.search-intro p').textContent.startsWith('Describe what you need.')"),'native introduction must not promise unavailable voice input');
    await evaluate("document.querySelector('#ui-language').value='de';document.querySelector('#ui-language').dispatchEvent(new Event('change',{bubbles:true}))");
    assert(await evaluate("document.querySelector('.search-intro p').textContent.startsWith('Beschreibe deinen Wunsch.')"),'native text-first introduction follows German language selection');
    await captureBoundary(platform,'de',send);
    await evaluate("document.querySelector('#ui-language').value='en';document.querySelector('#ui-language').dispatchEvent(new Event('change',{bubbles:true}))");
    await evaluate("document.querySelector('#search-query').focus()");await type('Samsung 990 PRO 2 TB');await pointerClick('.primary-search');
    await until(()=>evaluate("document.querySelector('#web-results').textContent.includes('not connected')"),'native search explains missing service');
    assert(await evaluate("!document.querySelector('.share-search').offsetHeight && !document.querySelector('#web-results article a')"),'no fake live or sharing actions');
    assert(await evaluate("performance.getEntriesByType('resource').every(entry=>!entry.name.includes('/api/discovery')&&!entry.name.includes('observations.json'))"),'native path never falls back to device API or bundled observations');
    assert(await evaluate("document.querySelector('#native-runtime-status').getBoundingClientRect().height>0"),'service warning survives submitted search');
    await evaluate("if(navigator.locks){const request=navigator.locks.request.bind(navigator.locks);navigator.locks.request=async(...args)=>{await new Promise(resolve=>setTimeout(resolve,250));return request(...args)}}");
    await click('#results button');
    await until(()=>evaluate("document.querySelector('#results button')?.textContent==='Search saved'"),'native-boundary save completion before restart');
    assert.equal(await evaluate("localStorage.getItem('udi.searches.v1')"),legacySearches,'legacy backup is preserved during explicit native save');
    assert(await evaluate(`(${savedRows})[0].marketId==='CH' && (${savedRows})[0].schemaVersion===2`),'native shared code writes explicit market-bound requests');
    await click('nav a[href="#watchlist"]');await send('Page.reload');
    await until(()=>evaluate("document.querySelector('#saved')?.textContent.includes('Samsung 990 PRO 2 TB')"),'saved request persists in native-boundary simulation');
    assert.equal(await evaluate("document.querySelector('[data-language-value=en]').getAttribute('aria-pressed')"),'true','visible language choice is restored too');
    await captureBoundary(platform,'en-saved',send);
    await click('#saved .text-button');
    await until(()=>evaluate("document.querySelector('#saved').textContent.includes('No saved searches yet')"),'native saved request removal');
    assert(await evaluate(`JSON.parse(localStorage.getItem('udi.searches.v1')).length===0 && (${savedRows}).length===0`),'removing a migrated request clears both versions');
    await click('a[href="#hilfe"]');await until(()=>visible('hilfe'),'native version help');
    assert(await evaluate("document.querySelector('[data-install-status]').textContent.includes('not connected') && document.querySelector('[data-install]').hidden"));
    assert(await evaluate("document.querySelector('[data-help-voice]').textContent.includes('not available in this app version')"),'native help explains actual voice availability');
    await evaluate("document.documentElement.style.fontSize='200%'");await noOverflow();
    await evaluate("document.documentElement.style.fontSize=''");
    await noOverflow();await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:adapter.identifier});
    console.log('Native boundary simulation passed for '+platform+' (browser test; no native emulator/device claim)');
  }
  assert.equal(pageErrors.length,0,'no unhandled app errors or console errors');
} catch (error) {
  if(pageErrors.length)console.error(JSON.stringify({pageErrors}));
  if (browserError) console.error(browserError.trim());
  throw error;
} finally {
  // Closing the browser through its own protocol lets child processes flush
  // their profile databases. Killing just the launcher left locked WAL files.
  if(socket?.readyState===WebSocket.OPEN) {
    socket.send(JSON.stringify({id:2147483647,method:'Browser.close'}));
    await Promise.race([once(socket,'close'),pause(2500)]);
  }
  socket?.close();
  if (browser?.pid && browser.exitCode === null) {
    const closed = once(browser, 'exit');
    if(process.platform==='win32')spawnSync('taskkill',['/PID',String(browser.pid),'/T','/F'],{windowsHide:true,stdio:'ignore',timeout:5000});
    else browser.kill();
    await Promise.race([closed, pause(2500)]);
  }
  await closeTestServer();
  assert(resolve(profile).startsWith(resolve(tmpdir())+sep)&&basename(profile).startsWith('udi-browser-'),'cleanup stays inside this test profile');
  await rm(profile, { recursive: true, force: true, maxRetries: 4, retryDelay: 200 });
}
