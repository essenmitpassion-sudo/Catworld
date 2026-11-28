import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { createNativeFixtureService } from './native-fixture-service.mjs';
import { appFiles } from './public-files.mjs';

const files = new Map(appFiles.filter(([name]) => name !== 'observations.json').map(([name, type]) => [
  '/'+name, { url: new URL('../src/'+name, import.meta.url), type },
]));
files.set('/',files.get('/index.html'));
files.set('/native-fixture-transport.mjs',{url:new URL('./native-fixture-transport.mjs',import.meta.url),type:'text/javascript'});
const headers = {
  'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  'Permissions-Policy': 'microphone=(), camera=(), geolocation=()',
  'Cache-Control': 'no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
};

export function createTryUdi() {
  return createNativeFixtureService({
    async servePage(request,response) {
      const file=request.method==='GET' && files.get(request.url);
      if(!file)return false;
      const html = file.type==='text/html';
      let body=await readFile(file.url,html?'utf8':undefined);
      if (html) body=body.replace('<head>','<head>\n<meta name="udi-local-test" content="test">');
      response.writeHead(200,{...headers,'Content-Type':file.type+'; charset=utf-8'}).end(body);
      return true;
    },
  });
}

if(process.argv[1] && pathToFileURL(process.argv[1]).href===import.meta.url) {
  const app=createTryUdi();
  try {
    const address=await app.listen(0);
    const url='http://127.0.0.1:'+address.port;
    console.log('UDI testen: '+url);
    console.log('Testdaten. Das Startfenster beim Test geöffnet lassen.');
    console.log('Falls kein Browser öffnet, kopiere die Adresse oben in deinen Browser.');
    if(process.argv.includes('--open')&&process.platform==='win32') {
      const browser=spawn('rundll32.exe',['url.dll,FileProtocolHandler',url],{stdio:'ignore',windowsHide:true});
      browser.once('error',()=>console.log('Der Browser konnte nicht automatisch geöffnet werden.'));
    }
  } catch {
    await app.close();
    console.error('UDI konnte den lokalen Testdienst nicht starten.');
    process.exitCode=1;
  }
}
