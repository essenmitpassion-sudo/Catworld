const swissSources = [
  { domain: 'digitec.ch', name: 'Digitec', path: /^\/de\/s1\/product\/[\w-]+-\d+$/ },
  { domain: 'interdiscount.ch', name: 'Interdiscount', path: /^\/de\/product\/[\w-]+-\d+$/ },
  { domain: 'conrad.ch', name: 'Conrad', path: /^\/de\/p\/[\w-]+-\d+\.html$/ },
  { domain: 'dq-solutions.ch', name: 'DQ Solutions', path: /^\/de\/[a-z0-9-]+-hs\d+$/, verifiable: true, interval: 10_000 },
  { domain: 'ricardo.ch', name: 'Ricardo', path: /^\/de\/a\/[\w-]+-(\d{8,})\/?$/, marketplace: true, verifiable: true },
  { domain: 'tutti.ch', name: 'tutti.ch', path: /^\/de\/vi\/(?:[\w-]+\/)*(\d{6,})\/?$/, marketplace: true, verifiable: true },
];
export const sources=swissSources.map(source=>Object.freeze({...source,id:source.domain,marketId:'CH'}));

export function sourceFor(url) {
  if(url.protocol!=='https:'||url.username||url.password||url.port)return null;
  return sources.find(source => (url.hostname === source.domain || url.hostname === 'www.' + source.domain)
    && source.path.test(url.pathname));
}
