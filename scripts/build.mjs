import {build} from 'esbuild';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const js=(await build({entryPoints:['src/main.js'],bundle:true,write:false,format:'iife',target:'es2022',minify:true})).outputFiles[0].text;
const css=await readFile('src/style.css','utf8'),template=await readFile('src/index.html','utf8');
const html=template.replace('</head>',`<style>${css}</style></head>`).replace('</body>',`<script>${js.replace(/<\/script/gi,'<\\/script')}</script></body>`);
await mkdir('dist',{recursive:true});for(const name of ['index.html','KIPPWERK.html'])await writeFile('dist/'+name,html);
console.log(`KIPPWERK: ${Buffer.byteLength(html)} bytes; standalone HTML, no runtime network.`);
