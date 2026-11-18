import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const files = new Map([
  ['/', ['index.html', 'text/html']], ['/index.html', ['index.html', 'text/html']],
  ['/style.css', ['style.css', 'text/css']], ['/app.mjs', ['app.mjs', 'text/javascript']],
  ['/deals.mjs', ['deals.mjs', 'text/javascript']], ['/observations.json', ['observations.json', 'application/json']],
]);
const securityHeaders = {
  'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-src 'self'; frame-ancestors 'self'; base-uri 'none'; form-action 'self'",
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
};

export function server() {
  return createServer(async (request, response) => {
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
  server().listen(4173, '127.0.0.1', () => console.log('UDI: http://127.0.0.1:4173'));
}
