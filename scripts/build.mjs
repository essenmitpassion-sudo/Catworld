import { copyFile, mkdir, readFile } from 'node:fs/promises';

const files = ['index.html', 'app.mjs', 'deals.mjs', 'costs.mjs', 'criteria.mjs', 'saved-searches.mjs', 'style.css'];
const observations = new URL('../public/observations.json', import.meta.url);
const data = JSON.parse(await readFile(observations, 'utf8'));
if (!Array.isArray(data)) throw new Error('observations.json must contain an array');
await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
await Promise.all([
  ...files.map(file => copyFile(new URL('../src/' + file, import.meta.url), new URL('../dist/' + file, import.meta.url))),
  copyFile(observations, new URL('../dist/observations.json', import.meta.url)),
]);
