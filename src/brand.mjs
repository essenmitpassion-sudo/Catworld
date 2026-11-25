// User-approved working presentation; no legal clearance or technical identity.
// A future approved identity changes this module, never technical/data identities.
export const brand=Object.freeze({
  status:'working',installName:'udi.',storeDescription:'Smart product search',
  labels:Object.freeze({de:Object.freeze({name:'udi.',shortName:'udi.',descriptor:'Produkt- und Angebotssuche'}),en:Object.freeze({name:'udi.',shortName:'udi.',descriptor:'Find what you need.'})}),
  colors:Object.freeze({ink:'#244b3c',paper:'#fffef9',accent:'#daedaa'}),
  logo:Object.freeze({size:24,strokeWidth:1.8,point:Object.freeze({x:10,y:9.5,r:1.6}),strokes:Object.freeze([
    Object.freeze(Array.from({length:39},(_,i)=>{const a=(-30-i*7.5)*Math.PI/180;return Object.freeze([9.5+6.2*Math.cos(a),9.9+6.2*Math.sin(a)].map(v=>Number(v.toFixed(3))));})),
    Object.freeze([[13.884,14.284],[20,20]].map(Object.freeze)),
    Object.freeze([[14.869,6.8],[12,9.5],[10,9.5]].map(Object.freeze)),
  ])}),
});
export function brandTemplate(template,language='de') {
  const label=brand.labels[language];
  return template.replace(/\bUDI-Adresse\b/g,'App-Adresse').replace(/\bvon UDI\b/g,'von der App').replace(/\bby UDI\b/g,'by the app')
    .replace(/\bUniversal Deal Intelligence\b/g,label.name)
    .replace(/\bUDI\b\.?/g,label.name).replace(/\budi\./g,label.shortName);
}

// Trusted code-drawn artwork; variants do not claim an app dark-mode feature.
export function brandSvg(variant='light',size=32) {
  if(!['light','dark','mono'].includes(variant)||![24,32,128].includes(size))throw new Error('Unsupported artwork variant');
  const dark=variant==='dark',ink=dark?brand.colors.paper:brand.colors.ink;
  const bg=dark?brand.colors.ink:brand.colors.paper,point=variant==='mono'?ink:brand.colors.accent;
  const geometry=brand.logo.strokes.map(points=>'<polyline points="'+points.map(p=>p.join(',')).join(' ')+'"/>').join('');
  const p=brand.logo.point;
  return '<svg xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+size+'" viewBox="0 0 24 24"><rect width="24" height="24" fill="'+bg+'"/><g fill="none" stroke="'+ink+'" stroke-width="'+brand.logo.strokeWidth+'" stroke-linecap="round" stroke-linejoin="round">'+geometry+'<circle cx="'+p.x+'" cy="'+p.y+'" r="'+p.r+'" fill="'+point+'"/></g></svg>\n';
}
