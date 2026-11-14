// Optional developer server. The game itself is standalone and needs no server.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const port=Number(process.env.PORT||3000),html=await readFile(new URL('../dist/index.html',import.meta.url));
createServer((req,res)=>{if(req.url==='/favicon.ico'){res.writeHead(204).end();return;}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}).end(html);}).listen(port,'0.0.0.0',()=>console.log(`VERSATZ at http://localhost:${port}`));
