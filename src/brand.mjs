// Reversible display identity for the unpublished pilot. No storage, API,
// package, signing, URL or merchant identity is derived from this name.
export const brand=Object.freeze({name:'Bessilo',wordmark:'bessilo',status:'provisional-test-name'});
export function brandTemplate(template) {
  return template.replace(/\bUniversal Deal Intelligence\b/g,brand.name)
    .replace(/\bUDI\b/g,brand.name).replace(/\budi\./g,brand.wordmark+'.');
}
