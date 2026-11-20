// The same explicit allowlist controls builds, HTTP delivery and pilot packaging.
export const appFiles = [
  ['index.html','text/html'], ['style.css','text/css'],
  ...['app','deals','costs','criteria','saved-searches','observations','ui','intent','voice','install'].map(name=>[name+'.mjs','text/javascript']),
  ['observations.json','application/json'], ['manifest.webmanifest','application/manifest+json'],
  ['assets/manrope-latin.woff2','font/woff2'], ['assets/manrope-OFL.txt','text/plain'],
  ...[180,192,512].map(size=>['assets/udi-'+size+'.png','image/png']),
];
