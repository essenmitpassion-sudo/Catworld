import { writeFile } from 'node:fs/promises';
import { deflateSync } from 'node:zlib';

// Original UDI magnifier, supersampled and encoded with the built-in PNG/zlib
// primitives. Full-bleed background keeps the symbol safe in OS icon masks.
function chunk(name,data) {
  const type=Buffer.from(name), input=Buffer.concat([type,data]);
  let crc=0xffffffff;
  for(const byte of input) { crc^=byte; for(let i=0;i<8;i++) crc=(crc>>>1)^((crc&1)?0xedb88320:0); }
  const output=Buffer.alloc(data.length+12);
  output.writeUInt32BE(data.length); type.copy(output,4); data.copy(output,8); output.writeUInt32BE((crc^0xffffffff)>>>0,output.length-4);
  return output;
}
for(const size of [180,192,512]) {
  const pixels=Buffer.alloc((size*4+1)*size);
  for(let y=0;y<size;y++) for(let x=0;x<size;x++) {
    let cover=0;
    for(let sy=0;sy<3;sy++) for(let sx=0;sx<3;sx++) {
      const px=(x+(sx+.5)/3)/size, py=(y+(sy+.5)/3)/size;
      const distance=Math.hypot(px-.44,py-.44);
      const t=Math.max(0,Math.min(1,((px-.59)+(py-.59))/.32));
      const handle=Math.hypot(px-(.59+.16*t),py-(.59+.16*t))<.029;
      if(Math.abs(distance-.205)<.028||handle) cover++;
    }
    const offset=y*(size*4+1)+1+x*4;
    for(let c=0;c<3;c++) pixels[offset+c]=Math.round([49,89,219][c]+(255-[49,89,219][c])*cover/9);
    pixels[offset+3]=255;
  }
  const header=Buffer.alloc(13);header.writeUInt32BE(size);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;
  await writeFile(new URL('../src/assets/udi-'+size+'.png',import.meta.url),Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(pixels)),chunk('IEND',Buffer.alloc(0)),
  ]));
}
