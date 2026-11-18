import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { setTimeout as pause } from 'node:timers/promises';
import { server } from './serve.mjs';

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

const app = server({ webSearch: async ({ query, scope }) => {
  if (scope === 'both') return [{ title: 'Gebrauchter PC · Browser-Testdaten',
    url: 'https://www.ricardo.ch/de/a/test-pc-1234567890/' }];
  if (query.includes('1 TB')) return [];
  return [{ title: 'Samsung SSD · Browser-Testdaten',
    url: 'https://www.digitec.ch/de/s1/product/samsung-990-pro-22097721' }];
} });
const profile = await mkdtemp(join(tmpdir(), 'udi-browser-'));
let browser;
let socket;
let browserError = '';
try {
  app.listen(0, '127.0.0.1');
  await once(app, 'listening');
  browser = spawn(browserPath, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--disable-background-networking', '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank',
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
    const reply = await send('Runtime.evaluate', { expression, returnByValue: true });
    if (reply.exceptionDetails) throw new Error(reply.exceptionDetails.exception?.description ?? expression);
    return reply.result.value;
  }
  const origin = 'http://127.0.0.1:' + app.address().port;
  await send('Page.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `Object.defineProperty(window, 'SpeechRecognition', { value: class {
      start() {
        queueMicrotask(() => {
          this.onresult({ results: [[{ transcript: 'Mein PC braucht mehr Speicher' }]] });
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
  for (const width of [390, 1365]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 500 });
    await send('Page.navigate', { url: origin + '/?width=' + width });
    await until(() => visible('radar'), 'radar');
    await until(() => evaluate("document.querySelector('#radar-content').textContent.includes('keine bestätigte')"), 'radar empty state');
    await noOverflow();
    if (width === 390) {
      await key('Tab');
      assert.equal(await evaluate('document.activeElement.textContent'), 'Zum Inhalt');
      await key('Enter');
      assert.equal(await evaluate('document.activeElement.id'), 'main');
    }
    await evaluate("document.querySelector('#radar-query').focus()");
    await type('Samsung 990 PRO 2 TB');
    await key('Enter');
    await until(() => visible('suche'), 'keyboard search submission');
    assert.equal(await evaluate('document.activeElement.tagName'), 'H2');
    await click('#results a');
    assert(await visible('vergleich'));
    assert.equal(await evaluate("document.querySelectorAll('#comparison article').length"), 2);
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
    await evaluate("document.querySelector('#search-query').focus()");
    await type('Samsung 990 PRO 1 TB');
    await key('Enter');
    await until(() => evaluate("document.querySelector('#web-results').textContent.includes('keine konkreten Seiten')"), 'empty web search');
    if (width === 390) {
      assert(await evaluate("window.SpeechRecognition?.toString().includes('queueMicrotask')"), 'dictation test adapter installed');
      assert(await evaluate("!document.querySelector('#suche [data-mic]').hidden"), 'dictation control visible');
      await click('#suche [data-mic]');
      await until(() => evaluate("document.querySelector('#search-query').value === 'Mein PC braucht mehr Speicher'"), 'dictation input');
      assert(await visible('suche'));
      assert.equal(await evaluate("document.querySelector('#results h2').textContent"), 'Dein Suchwunsch');
      await key('Enter');
      await until(() => evaluate("document.querySelector('#web-results').textContent.includes('Darf ein Gebrauchtangebot')"), 'clarification');
      await click('#web-results button:nth-child(2)');
      await until(() => evaluate("document.querySelector('#web-results a')?.textContent === 'Inserat öffnen'"), 'marketplace result');
      assert.equal(await evaluate("document.querySelector('#web-results a').href"), 'https://www.ricardo.ch/de/a/test-pc-1234567890/');
      assert(await evaluate("document.querySelector('#web-results').textContent.includes('Unbestätigt')"));
      await noOverflow();
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
