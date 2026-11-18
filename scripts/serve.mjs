import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { discover, InvalidSearch } from './discovery.mjs';
import { gatewaySearch } from './gateway.mjs';
import { pageVerifier } from './verification.mjs';
import { scan } from './scans.mjs';
import { catalogSearch } from './catalog-search.mjs';

const files = new Map([
  ['/', ['index.html', 'text/html']], ['/index.html', ['index.html', 'text/html']],
  ['/style.css', ['style.css', 'text/css']], ['/app.mjs', ['app.mjs', 'text/javascript']],
  ['/deals.mjs', ['deals.mjs', 'text/javascript']], ['/observations.json', ['observations.json', 'application/json']],
  ['/costs.mjs', ['costs.mjs', 'text/javascript']], ['/criteria.mjs', ['criteria.mjs', 'text/javascript']],
  ['/saved-searches.mjs', ['saved-searches.mjs', 'text/javascript']],
  ['/observations.mjs', ['observations.mjs', 'text/javascript']],
]);
const securityHeaders = {
  'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-src 'self'; frame-ancestors 'self'; base-uri 'none'; form-action 'self'",
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
};

export function server({ webSearch = null, verify = null, journalPath } = {}) {
  const callsPerMinute = 6;
  let windowEnds = 0;
  let calls = 0;
  let running = 0;

  async function handleSearch(request, response) {
    const reply = (status, payload) => response.writeHead(status, {
      ...securityHeaders, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
    }).end(JSON.stringify(payload));
    const host = '127.0.0.1:' + request.socket.localPort;
    if (request.method !== 'POST' || request.headers['sec-fetch-site'] !== 'same-origin'
      || request.headers.host !== host || request.headers.origin !== 'http://' + host
      || request.headers['content-type'] !== 'application/json') return reply(403, { kind: 'forbidden' });
    let body = '';
    request.setEncoding('utf8');
    for await (const chunk of request) {
      body += chunk;
      if (body.length > 2048) {
        reply(413, { kind: 'invalid' });
        return;
      }
    }
    try {
      let sourceMode = 'catalog';
      const result = await discover(JSON.parse(body), async query => {
        const known = await catalogSearch(query);
        if (!known.length && !webSearch) throw new Error('disabled');
        const now = Date.now();
        if (now >= windowEnds) {
          windowEnds = now + 60_000;
          calls = 0;
        }
        if (running >= 2 || calls >= callsPerMinute) throw new Error('busy');
        running++;
        calls++;
        try {
          if (known.length) return known;
          sourceMode = 'web';
          return await webSearch(query);
        } finally {
          running--;
        }
      });
      const checked = await scan(result, { verify, journalPath });
      reply(200, { ...checked, sourceMode });
    } catch (error) {
      if (error instanceof InvalidSearch || error instanceof SyntaxError) return reply(400, { kind: 'invalid' });
      if (error.message === 'disabled') return reply(503, { kind: 'disabled' });
      if (error.message === 'busy') return reply(429, { kind: 'busy' });
      reply(502, { kind: 'unavailable' });
    }
  }

  return createServer({ requestTimeout: 15_000, headersTimeout: 5_000 }, async (request, response) => {
    if (request.url === '/api/discovery') {
      try { await handleSearch(request, response); } catch { response.destroy(); }
      return;
    }
    const entry = files.get(request.url?.split('?')[0]);
    if (request.method !== 'GET' || !entry) {
      response.writeHead(404, securityHeaders).end();
      return;
    }
    const [file, mime] = entry;
    try {
      const body = await readFile(new URL('../dist/' + file, import.meta.url));
      response.writeHead(200, { ...securityHeaders, 'Content-Type': mime + '; charset=utf-8', 'Cache-Control': 'no-store' }).end(body);
    } catch {
      response.writeHead(503, securityHeaders).end('Build fehlt. Bitte npm run build ausführen.');
    }
  });
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const webSearch = gatewaySearch({ apiKey: process.env.AI_GATEWAY_API_KEY, model: process.env.UDI_SEARCH_MODEL });
  const verify = pageVerifier((process.env.UDI_VERIFY_DOMAINS ?? 'dq-solutions.ch').split(',').map(value => value.trim()));
  server({ webSearch, verify, journalPath: fileURLToPath(new URL('../.udi/checks.json', import.meta.url)) })
    .listen(4173, '127.0.0.1', () => console.log('UDI: http://127.0.0.1:4173'));
}
