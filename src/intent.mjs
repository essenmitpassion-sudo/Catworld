import { criteriaFor } from './criteria.mjs';

export function intentFor(input) {
  const query = input.query.trim();
  const criteria = criteriaFor(input);
  const intent = { query, criteria, question: null, suggestions: [] };
  const component = /\b(ram|arbeitsspeicher|ssd)\b/i.exec(query);
  if (!component || /\b(kapazität egal|grösse egal|größe egal|any capacity|capacity does not matter)\b/i.test(query)) return intent;
  // A complete PC's installed components are not a request for a loose component.
  if (/\b(pc|computer|rechner)\b.*\b(mit|inklusive|inkl\.|with|including)\b/i.test(query.slice(0, component.index))) return intent;
  const ram = component[1].toLowerCase() !== 'ssd';
  const hasCapacity = ram
    ? /\b(?:ram|arbeitsspeicher)\s*(?:(?:mit|von|à|a|with)\s*)?(?:(?:\d+)\s*[x×]\s*)?\d+\s*gb\b|\b\d+\s*gb\s*(?:ddr\d\s*)?(?:ram|arbeitsspeicher)\b/i.test(query)
    : /\b\d+(?:[.,]\d+)?\s*tb\b|\bssd\s*(?:(?:mit|von|à|a|with)\s*)?\d+\s*gb\b|\b\d+\s*gb\s*ssd\b/i.test(query);
  if (!hasCapacity) intent.question = {
    key: ram ? 'ram-capacity' : 'ssd-capacity',
    title: ram ? 'Wie viel Arbeitsspeicher soll es sein?' : 'Wie viel SSD-Speicher brauchst du?',
    reason: 'Die Kapazität entscheidet, welche Angebote vergleichbar sind. Du kannst sie auch offenlassen.',
    options: ram ? ['16 GB', '32 GB', '64 GB'] : ['1 TB', '2 TB', '4 TB'],
  };
  return intent;
}

export function addCapacity(query, capacity) {
  if (!['16 GB', '32 GB', '64 GB', '1 TB', '2 TB', '4 TB'].includes(capacity)) return null;
  const result = query.replace(/\b(ram|arbeitsspeicher|ssd)\b/i, '$1 ' + capacity);
  if (result === query || result.length > 300) return null;
  return result;
}
