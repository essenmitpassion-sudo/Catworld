import { readFile,writeFile } from 'node:fs/promises';
import { deflateSync } from 'node:zlib';
import {pathToFileURL} from 'node:url';
import {brand} from '../src/brand.mjs';

// Avoid reopening identical PNGs for writing: Windows preview/indexing can
// temporarily hold them. Generation stays deterministic and content-checked.
export async function writeIconFile(path,data) {
  try {if((await readFile(path)).equals(data))return;}
  catch(error){if(error.code!=='ENOENT')throw error;}
  await writeFile(path,data);
}

// Central working mark, supersampled with built-in PNG/zlib.
// Historical asset filenames remain stable; this is code-drawn, not a merchant asset.
function chunk(name,data) {
  const type=Buffer.from(name), input=Buffer.concat([type,data]);
  let crc=0xffffffff;
  for(const byte of input) { crc^=byte; for(let i=0;i<8;i++) crc=(crc>>>1)^((crc&1)?0xedb88320:0); }
  const output=Buffer.alloc(data.length+12);
  output.writeUInt32BE(data.length); type.copy(output,4); data.copy(output,8); output.writeUInt32BE((crc^0xffffffff)>>>0,output.length-4);
  return output;
}
export function iconPng(size,{alpha=true,adaptive=false}={}) {
  if(adaptive&&!alpha)throw new Error('Adaptive foreground needs alpha');
  const channels=alpha?4:3;
  const pixels=Buffer.alloc((size*channels+1)*size);
  const segments=brand.logo.strokes.flatMap(points=>points.slice(1).map((point,i)=>[points[i].map(v=>v/brand.logo.size),point.map(v=>v/brand.logo.size)]));
  const extent=Math.max(...brand.logo.strokes.flat().map(([x,y])=>Math.hypot(x/brand.logo.size-.5,y/brand.logo.size-.5)))+brand.logo.strokeWidth/brand.logo.size/2;
  const adaptiveScale=Math.min(.72,(66/108/2-.02)/extent);
  function distance(px,py,[[ax,ay],[bx,by]]) {
    const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy)));
    return Math.hypot(px-ax-t*dx,py-ay-t*dy);
  }
  const rgb=value=>[1,3,5].map(i=>parseInt(value.slice(i,i+2),16));
  const ink=rgb(brand.colors.ink),paper=rgb(brand.colors.paper),accent=rgb(brand.colors.accent);
  const point=brand.logo.point,lineRadius=brand.logo.strokeWidth/brand.logo.size/2;
  for(let y=0;y<size;y++) for(let x=0;x<size;x++) {
    let coverage=0;const sum=[0,0,0];
    for(let sy=0;sy<3;sy++) for(let sx=0;sx<3;sx++) {
      const scale=adaptive ? adaptiveScale : 1;
      const px=((x+(sx+.5)/3)/size-.5)/scale+.5, py=((y+(sy+.5)/3)/size-.5)/scale+.5;
      const d=Math.hypot(px-point.x/brand.logo.size,py-point.y/brand.logo.size);
      const color=d<point.r/brand.logo.size-lineRadius?accent:
        d<point.r/brand.logo.size+lineRadius||segments.some(segment=>distance(px,py,segment)<lineRadius)?ink:null;
      if(color) {coverage++;for(let c=0;c<3;c++)sum[c]+=color[c];}
      else if(!adaptive)for(let c=0;c<3;c++)sum[c]+=paper[c];
    }
    const offset=y*(size*channels+1)+1+x*channels;
    for(let c=0;c<3;c++)pixels[offset+c]=Math.round(sum[c]/(adaptive?coverage||1:9));
    if(alpha)pixels[offset+3]=adaptive?Math.round(255*coverage/9):255;
  }
  const header=Buffer.alloc(13);header.writeUInt32BE(size);header.writeUInt32BE(size,4);header[8]=8;header[9]=alpha?6:2;
  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(pixels)),chunk('IEND',Buffer.alloc(0)),
  ]);
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url)for(const size of [180,192,512])await writeIconFile(new URL('../src/assets/udi-'+size+'.png',import.meta.url),iconPng(size));
