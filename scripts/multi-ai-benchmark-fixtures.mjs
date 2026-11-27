// Synthetic source and model data, pinned to cases 1–12 in the P2 baseline.
export const snapshotAt = '2026-11-27T12:00:00.000Z';
export const urls = {
  dq990: 'https://www.dq-solutions.ch/de/samsung-2-tb-ssd-990-pro-nvme-m-2-ssd-m-2-hs2011',
  mixel990: 'https://shop.mixel.ch/product/samsung-ssd-990-pro-m-2-2280-nvme-2000-gb-1425209',
  dqT7: 'https://www.dq-solutions.ch/de/samsung-1-tb-t7-shield-portable-ssd-schwarz-hs1114',
  desktop: 'https://www.ricardo.ch/de/a/udi-benchmark-desktop-9000000001/',
  kingston: 'https://www.dq-solutions.ch/de/udi-benchmark-kingston-nv3-2tb-hs999990',
};

export const pages = Object.freeze({
  [urls.dq990]: { seller: 'DQ Solutions', mpn: 'MZ-V9P2T0BW', price: '279.00' },
  [urls.mixel990]: { seller: 'MIXEL Shop', mpn: 'MZ-V9P2T0BW', gtin13: '8806094215038', price: '249.00' },
  [urls.dqT7]: { seller: 'DQ Solutions', mpn: 'MU-PE1T0S/EU', price: '89.00' },
  [urls.desktop]: { seller: 'Synthetic reseller', price: '349.00', condition: 'UsedCondition',
    text: 'The listing description says the only confirmed M.2 slot is occupied. The specification does not identify a second slot.' },
  [urls.kingston]: { seller: 'DQ Solutions', mpn: 'SNV3S/2000G', price: '119.00', availability: 'OutOfStock' },
});

export function sourcePage(url) {
  const page = pages[url];
  if (!page) return { reason: 'url-rejected' };
  const product = {
    '@type': 'Product', url, mpn: page.mpn, gtin13: page.gtin13,
    offers: {
      '@type': 'Offer', url, price: page.price, priceCurrency: 'CHF',
      seller: { name: page.seller }, availability: page.availability ?? 'InStock',
      itemCondition: page.condition ?? 'NewCondition',
    },
  };
  const specs = url === urls.mixel990
    ? `<noscript><main><dl><div><dt>Hersteller-Artikel-Nr.</dt><dd>${page.mpn}</dd></div></dl></main></noscript>`
    : '';
  return { status: 200, html: `<html><body><script type="application/ld+json">${JSON.stringify(product)}</script>${specs}<p>${page.text ?? ''}</p></body></html>` };
}

const mislabeled = [{ title: 'Samsung 990 PRO 1 TB ohne Kühlkörper', url: urls.dq990 }];
const desktop = [{ title: 'Used desktop PC with a free second NVMe slot', url: urls.desktop }];

export const cases = [
  { id: 1, language: 'de', query: 'Ich suche eine Samsung 990 PRO 2 TB ohne Kühlkörper bis CHF 500.' },
  { id: 2, language: 'en', query: 'I need a portable 1 TB USB-C SSD.' },
  { id: 3, language: 'de', query: 'Samsung 990 PRO 1 TB', candidates: mislabeled },
  { id: 4, language: 'en', query: 'I need a Samsung 990 PRO with 1000 GB.', candidates: mislabeled },
  { id: 5, language: 'de', query: 'Samsung 990 PRO mit 1 TB oder 2 TB', candidates: mislabeled },
  { id: 6, language: 'de', query: 'Samsung 990 PRO 2 TB', options: { completeCostsOnly: true } },
  { id: 7, language: 'en', query: 'Samsung 990 PRO 2 TB under CHF 200', options: { completeCostsOnly: true } },
  { id: 8, language: 'de', query: 'Mehr Speicher für meinen PC bis CHF 200', followUp: { scope: 'both' },
    candidates: [{ title: 'Gebrauchter PC als mögliche Alternative', url: urls.desktop }] },
  { id: 9, language: 'en', query: 'I need a used desktop PC under CHF 400 with room for a second NVMe drive.',
    candidates: desktop, review: { url: urls.desktop, claim: 'free second NVMe slot',
      replacementTitle: 'Used desktop PC; second NVMe slot unconfirmed' } },
  { id: 10, language: 'en', query: 'Kingston NV3 2 TB, new', options: { condition: 'new' },
    candidates: [{ title: 'Kingston NV3 2 TB', url: urls.kingston }] },
  { id: 11, language: 'en', query: 'I need an NVMe SSD MZ-V9P2T0CW with a heatsink.',
    candidates: [{ title: 'Samsung 990 PRO MZ-V9P2T0CW mit Kühlkörper', url: urls.dq990 }],
    review: { url: urls.dq990, claim: 'MZ-V9P2T0CW' } },
  { id: 12, language: 'de', query: 'mechanische Tastatur, ISO-CH', outage: true },
];
