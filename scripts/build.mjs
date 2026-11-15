import {build} from 'esbuild';
import {mkdir,readFile,writeFile,rm} from 'node:fs/promises';
const js=(await build({entryPoints:['src/main.js'],bundle:true,write:false,format:'iife',target:'es2022',minify:true})).outputFiles[0].text;
const css=await readFile('src/style.css','utf8');
const html=`<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#111b23"><meta name="description" content="Ein Stein zieht andere näher. Auch gegnerische. Vier in einer Reihe gewinnen."><title>SOG — Ein Stein verändert alles</title><style>${css}</style></head><body><div id="app"></div><script>${js.replace(/<\/script/gi,'<\\/script')}</script></body></html>`;
await mkdir('dist',{recursive:true});await writeFile('dist/index.html',html);await writeFile('dist/SOG.html',html);console.log(`Standalone browser game: ${Buffer.byteLength(html)} bytes; no runtime dependencies.`);

for(const old of ['VEIL.html','SPUR.html','SIGNALBRUCH.html'])await rm('dist/'+old,{force:true});
