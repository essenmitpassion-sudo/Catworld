import { writeFile } from 'node:fs/promises';
import { deflateSync } from 'node:zlib';
import {pathToFileURL} from 'node:url';

// Original two-route Bessilo monogram, supersampled with built-in PNG/zlib.
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
  for(let y=0;y<size;y++) for(let x=0;x<size;x++) {
    let cover=0;
    for(let sy=0;sy<3;sy++) for(let sx=0;sx<3;sx++) {
      const scale=adaptive ? 0.72 : 1;
      const px=((x+(sx+.5)/3)/size-.5)/scale+.5, py=((y+(sy+.5)/3)/size-.5)/scale+.5;
      const stem=Math.abs(px-.3)<.026&&py>=.194&&py<=.806;
      const top=Math.abs(py-.22)<.026&&px>=.3&&px<=.51;
      const middle=Math.abs(py-.5)<.026&&px>=.3&&px<=.54;
      const bottom=Math.abs(py-.78)<.026&&px>=.3&&px<=.54;
      const upper=px>=.51&&Math.abs(Math.hypot(px-.51,py-.36)-.14)<.026;
      const lower=px>=.54&&Math.abs(Math.hypot(px-.54,py-.64)-.14)<.026;
      if(stem||top||middle||bottom||upper||lower) cover++;
    }
    const offset=y*(size*channels+1)+1+x*channels;
    for(let c=0;c<3;c++) pixels[offset+c]=adaptive?[32,44,37][c]:Math.round([218,237,170][c]+([32,44,37][c]-[218,237,170][c])*cover/9);
    if(alpha)pixels[offset+3]=adaptive?Math.round(255*cover/9):255;
  }
  const header=Buffer.alloc(13);header.writeUInt32BE(size);header.writeUInt32BE(size,4);header[8]=8;header[9]=alpha?6:2;
  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(pixels)),chunk('IEND',Buffer.alloc(0)),
  ]);
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url)for(const size of [180,192,512])await writeFile(new URL('../src/assets/udi-'+size+'.png',import.meta.url),iconPng(size));
