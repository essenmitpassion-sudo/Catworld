import {build} from 'esbuild';
import {mkdir,readFile,writeFile,rm} from 'node:fs/promises';
const worker=(await build({entryPoints:['src/worker.js'],bundle:true,write:false,format:'iife',target:'es2022',minify:true})).outputFiles[0].text;
const js=(await build({entryPoints:['src/main.js'],bundle:true,write:false,format:'iife',target:'es2022',minify:true,define:{__WORKER_SOURCE__:JSON.stringify(worker)}})).outputFiles[0].text;
const css=await readFile('src/style.css','utf8');
const html=`<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#203d35"><meta name="description" content="Ein Schritt. Alles bewegt sich. VERSATZ ist ein kompaktes Strategiespiel für zwei – lokal oder gegen die KI."><title>VERSATZ — Ein Schritt. Alles bewegt sich.</title><style>${css}</style></head><body><div id="app"></div><script>${js.replace(/<\/script/gi,'<\\/script')}</script></body></html>`;
await mkdir('dist',{recursive:true});await rm('dist/VEIL.html',{force:true});await writeFile('dist/index.html',html);await writeFile('dist/VERSATZ.html',html);console.log(`VERSATZ: ${Buffer.byteLength(html)} bytes, standalone HTML with embedded AI worker; no runtime network.`);
