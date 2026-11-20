import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { setTimeout as pause } from 'node:timers/promises';
import { server } from './serve.mjs';
import { inspectPage, pageVerifier } from './verification.mjs';
import { catalog } from '../src/deals.mjs';

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
let browser;
let socket;
let browserError = '';
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
  await send('Page.enable');
  if (!live) await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `Object.defineProperty(window, 'SpeechRecognition', { value: class {
      start() {
        if (window.udiHoldSpeech) return;
        setTimeout(() => {
          if (window.udiSpeechError) { this.onerror({error: window.udiSpeechError}); this.onend(); return; }
          this.onresult({ results: [[{ transcript: 'Mein PC braucht mehr Speicher' }]] });
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
  const type = text => send('Input.insertText', { text });
  async function key(name) {
    const windowsVirtualKeyCode = { Enter: 13, Tab: 9 }[name];
    const text = name === 'Enter' ? '\r' : '';
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: name, code: name, text, windowsVirtualKeyCode });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: name, code: name, windowsVirtualKeyCode });
  }
  async function noOverflow() {
    assert(await evaluate('document.documentElement.scrollWidth <= innerWidth'));
  }
  for (const width of live ? [390] : [360, 390, 768, 1365]) {
    if (width !== (live ? 390 : 360)) {
      await new Promise(resolve => app.close(resolve));
      app = server(appOptions);
      app.listen(0, '127.0.0.1');
      await once(app, 'listening');
      origin = 'http://127.0.0.1:' + app.address().port;
    }
    await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 500 });
    await send('Page.navigate', { url: origin + '/?width=' + width });
    await until(() => visible('suche'), 'search start page');
    await noOverflow();
    if (!live) {
      assert(await evaluate("Boolean(document.querySelector('#search-query').tagName === 'TEXTAREA')"));
      await click('[data-example]');
      assert.equal(await evaluate("document.querySelector('#search-query').value"), 'Samsung 990 PRO 2 TB');
      assert(await evaluate("document.querySelector('#intent-summary').textContent.includes('Samsung 990 PRO 2 TB')"));
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
      await type('Samsung 990 PRO 2 TB bis CHF 500');
      await key('Enter');
      await until(() => evaluate("document.querySelector('#web-results article a')?.href.startsWith('https://www.dq-solutions.ch/')"), 'live DQ offer');
      await noOverflow();
      const receipt = JSON.parse(await readFile(join(profile, 'checks.json'), 'utf8')).at(-1);
      const check = receipt.checks.find(check => check.seller === 'DQ Solutions');
      assert.equal(check.httpStatus, 200);
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
    await until(() => evaluate("Boolean(document.querySelector('#web-results article a[href$=passport]'))"), 'catalog offer Passport');
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
      assert(await evaluate("document.querySelector('#intent-summary').textContent.includes('Mein PC braucht mehr Speicher')"));
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
    console.log('Browser workflow passed at ' + width + 'px');
  }
} catch (error) {
  if (browserError) console.error(browserError.trim());
  throw error;
} finally {
  socket?.close();
  if (browser?.pid && browser.exitCode === null) {
    const closed = once(browser, 'exit');
    browser.kill();
    await Promise.race([closed, pause(2500)]);
  }
  app.close();
  await rm(profile, { recursive: true, force: true, maxRetries: 4, retryDelay: 200 });
}
