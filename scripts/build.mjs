import {build} from 'esbuild';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const js=(await build({entryPoints:['src/main.js'],bundle:true,write:false,format:'iife',target:'es2022',minify:true})).outputFiles[0].text;
const css=await readFile('src/style.css','utf8');
const html=`<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#101b20"><meta name="description" content="Ein eigenständiges Taktikduell: verdeckte Rollen, offene Relais und Zangen, die jeden Bluff brechen."><title>VEIL — Das Signalduell</title><style>${css}</style></head><body><div id="app"></div><script>${js.replace(/<\/script/gi,'<\\/script')}</script></body></html>`;
await mkdir('dist',{recursive:true});await writeFile('dist/index.html',html);await writeFile('dist/VEIL.html',html);console.log(`Standalone browser game: ${Buffer.byteLength(html)} bytes; no runtime dependencies.`);
