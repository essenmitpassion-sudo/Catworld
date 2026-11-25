import {brand} from './brand.mjs';
// Original, consistently drawn symbols. External data never becomes HTML.
const paths = {
  waymark: [...brand.logo.strokes.flatMap(points=>['polyline',{points:points.map(p=>p.join(',')).join(' ')}]),'circle',{cx:brand.logo.point.x,cy:brand.logo.point.y,r:brand.logo.point.r,fill:brand.colors.accent}],
  search: ['circle', { cx: 10.5, cy: 10.5, r: 6.5 }, 'path', { d: 'm16 16 4.5 4.5' }],
  mic: ['rect', { x: 9, y: 2, width: 6, height: 13, rx: 3 }, 'path', { d: 'M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8' }],
  radar: ['circle', { cx: 12, cy: 12, r: 9 }, 'path', { d: 'M12 7a5 5 0 1 0 5 5M12 12l7-7' }],
  compare: ['path', { d: 'M5 4v16M19 4v16M2 8h6M16 16h6M12 3v18' }],
  bookmark: ['path', { d: 'M6 3h12v18l-6-4-6 4z' }],
  compass: ['circle', { cx: 12, cy: 12, r: 9 }, 'path', { d: 'm16 8-2.5 5.5L8 16l2.5-5.5z' }],
  shield: ['path', { d: 'M12 2 4 5v6c0 5 8 10 8 10s8-5 8-10V5zM8.5 11.5l2.5 2.5 4.5-5' }],
  scan: ['path', { d: 'M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5M7 12h10' }],
  info: ['circle', { cx: 12, cy: 12, r: 9 }, 'path', { d: 'M12 11v6M12 7v.1' }],
  plus: ['path', { d: 'M12 5v14M5 12h14' }],
  clock: ['circle', { cx: 12, cy: 12, r: 9 }, 'path', { d: 'M12 7v5l3 2' }],
  shop: ['path', { d: 'M4 9v12h16V9M2 9l3-6h14l3 6M9 21v-7h6v7M2 9h20' }],
  sliders: ['path', { d: 'M3 6h4M11 6h10M3 12h10M17 12h4M3 18h4M11 18h10M7 3v6M13 9v6M7 15v6' }],
};
export function icon(name) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  for (const [k, v] of Object.entries({ viewBox: name==='waymark'?`0 0 ${brand.logo.size} ${brand.logo.size}`:'0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': name==='waymark'?String(brand.logo.strokeWidth):'1.7', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', focusable: 'false', class: 'icon' })) svg.setAttribute(k, v);
  const parts = paths[name] ?? paths.search;
  for (let i = 0; i < parts.length; i += 2) {
    const part = document.createElementNS(ns, parts[i]);
    for (const [k, v] of Object.entries(parts[i + 1])) part.setAttribute(k, v);
    svg.append(part);
  }
  return svg;
}
export function mountIcons(root = document) {
  for (const node of root.querySelectorAll('[data-icon]')) node.replaceChildren(icon(node.dataset.icon));
}
