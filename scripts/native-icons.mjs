import {iconPng,writeIconFile} from './generate-icons.mjs';
export async function nativeIcons() {
  const cache=new Map();
  const png=size=>{if(!cache.has(size))cache.set(size,iconPng(size,{alpha:false}));return cache.get(size);};
  for(const [density,size,foreground]of [['mdpi',48,108],['hdpi',72,162],['xhdpi',96,216],['xxhdpi',144,324],['xxxhdpi',192,432]]) {
    for(const name of ['ic_launcher','ic_launcher_round'])await writeIconFile(new URL('../android/app/src/main/res/mipmap-'+density+'/'+name+'.png',import.meta.url),png(size));
    await writeIconFile(new URL('../android/app/src/main/res/mipmap-'+density+'/ic_launcher_foreground.png',import.meta.url),iconPng(foreground,{adaptive:true}));
  }
  await writeIconFile(new URL('../ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png',import.meta.url),png(1024));
}
