// Neutral presentation defaults. Naming research is paused; UDI stays internal.
// A future approved identity changes this module, never technical/data identities.
export const brand=Object.freeze({
  status:'unbranded',installName:'Offer search',
  labels:Object.freeze({de:Object.freeze({name:'Angebotssuche',shortName:'Suche'}),en:Object.freeze({name:'Offer search',shortName:'Search'})}),
  logo:Object.freeze({size:24,strokeWidth:1.8,strokes:Object.freeze([
    Object.freeze([Object.freeze([5,9]),Object.freeze([5,5]),Object.freeze([9,5])]),
    Object.freeze([Object.freeze([15,5]),Object.freeze([19,5]),Object.freeze([19,9])]),
    Object.freeze([Object.freeze([19,15]),Object.freeze([19,19]),Object.freeze([15,19])]),
    Object.freeze([Object.freeze([9,19]),Object.freeze([5,19]),Object.freeze([5,15])]),
  ])}),
});
export function brandTemplate(template,language='de') {
  const label=brand.labels[language];
  return template.replace(/\bvon UDI\b/g,'von der App').replace(/\bby UDI\b/g,'by the app')
    .replace(/\bUniversal Deal Intelligence\b/g,label.name)
    .replace(/\bUDI\b/g,label.name).replace(/\budi\./g,label.shortName);
}
