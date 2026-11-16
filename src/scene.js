import {
  active,
  destination,
  stormsAt,
  frontAt,
  shelterRadius,
  MODES,
} from "./engine.js";
export const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const town = (x, y, scale = 1) =>
  `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-7 0v-14h14V0z" fill="#f2dfb7" stroke="#785444" stroke-width="1.2"/><path d="M-10-13 0-23 10-13Z" fill="#ae5f43" stroke="#754b3c" stroke-width="1.2"/><path d="M-2 0v-8h4v8" fill="#4d6660"/><path d="M-4-12v3m8-3v3" stroke="#a56541"/></g>`;
const tree = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 2v-20" stroke="#425d4e" stroke-width="2"/><path d="M0-28C-15-24-12-6 0-10 13-7 15-25 0-28" fill="#718a63" stroke="#425d4e" stroke-width="1.3"/><path d="M0-22v12m-7-9 7 5 7-6" fill="none" stroke="#a3ad78"/></g>`;
function island(g, selected, busy) {
  const live = active(g),
    color =
      g.kind === "guardian"
        ? "#314e54"
        : g.kind === "garden"
          ? "#4d675d"
          : "#3a6067";
  const houses = Array.from({ length: g.people }, (_, i) =>
    town(-29 + (i % 3) * 23, -4 - Math.floor(i / 3) * 18, 0.68),
  ).join("");
  const radius = g.kind === "guardian" ? 1.15 : 1;
  return `<g class="giant ${selected ? "selected" : ""} ${g.hull === 0 ? "sunk" : ""}" data-giant="${g.id}" transform="translate(${g.x} ${g.y})" role="button" tabindex="${live && !busy ? "0" : "-1"}" aria-disabled="${!live || busy}" aria-label="${g.name}, ${g.people} Familien, ${g.breath} Atem, ${g.hull} Leben" style="--body:${color}">
 <title>${g.name} · ${g.kind === "guardian" ? "Hüter" : g.kind === "garden" ? "Gartenriese" : "Schnellschwimmer"} · ${g.people}/6 Familien · ${g.breath}/${g.maxBreath} Atem</title>
 <g class="creature" transform="rotate(${g.angle * 24}) scale(${radius} 1)">
 <path class="wake" d="M-72-40Q-134-21-152-37M-78 38Q-126 52-159 37M-88-9Q-136 1-169-7"/>
 <ellipse cx="-2" cy="16" rx="76" ry="34" fill="#618c89" opacity=".15"/>
 <path d="M-55-2Q-78-6-101-29L-96-3-113 23Q-77 19-57 10" fill="${color}" stroke="#253f45" stroke-width="2"/>
 <path d="M-14 15Q-31 58 8 52L29 20M8-20Q2-51 37-43L43-20" fill="${color}" stroke="#253f45" stroke-width="2"/>
 <path d="M-65 1C-50-38 29-48 68-20Q92-5 72 17C38 46-45 38-65 1Z" fill="${color}" stroke="#253f45" stroke-width="2.3"/>
 <path d="M-45 8C-12 30 47 25 68 8M49 14l10-4" fill="none" stroke="#a4b7a3" stroke-width="1.4"/>
 <path d="M-45-4C-36-27 14-35 42-17Q56 2 24 10L-20 11Z" fill="#8f9f72" stroke="#b9b38a" stroke-width="2"/>
 <path d="M-39 1Q-14-12 30-5M-24-18Q-16-2-12 9M4-25 9 8" fill="none" stroke="#c9c39c" stroke-width="1.3"/>
 ${tree(-39, -8, 0.65)}${tree(31, -9, 0.82)}${tree(9, -24, 0.56)}${houses}
 <circle cx="68" cy="-4" r="3.1" fill="#f0dfb7"/><circle cx="69" cy="-4" r="1.5" fill="#203c40"/>
 <path d="M55-24q7 1 11 6" stroke="#a3af91" fill="none"/>
 </g>
 ${selected && live ? `<ellipse class="selection-ring" cy="8" rx="91" ry="59"/>` : ""}
 <text class="giant-name" x="0" y="73" text-anchor="middle">${escape(g.name)}${g.arrived ? " · angekommen" : g.hull === 0 ? " · verloren" : ""}</text>
 ${live ? `<g class="hull" transform="translate(-15 84)">${[0, 1, 2].map((i) => `<path d="M${i * 13} 0l4-4 4 4-4 4Z" fill="${i < g.hull ? "#425d56" : "none"}" stroke="#425d56"/>`).join("")}</g>` : ""}
 </g>`;
}
function reef(r, i) {
  return `<g class="reef"><ellipse cx="${r.x}" cy="${r.y + 5}" rx="${r.r + 15}" ry="${r.r * 0.65}" fill="none" stroke="#658d85" stroke-dasharray="2 6"/><g transform="translate(${r.x} ${r.y})"><path d="M${-r.r} 8l${r.r * 0.65}-${r.r * 1.2} ${r.r * 0.45} 19 ${r.r * 0.35}-27 ${r.r * 0.65} ${r.r * 1.5}Z" fill="#8c9988" stroke="#506d65" stroke-width="1.4"/><path d="M-9 8-13-16 4 0 12-23" fill="none" stroke="#cad0b3"/><text x="0" y="${r.r + 26}" text-anchor="middle">RIFF ${["I", "II", "III"][i]}</text></g></g>`;
}
function storm(c, forecast) {
  return `<g class="storm ${forecast ? "forecast" : ""}" transform="translate(${c.x} ${c.y})"><circle r="${c.r}" fill="${forecast ? "none" : "url(#rain)"}" stroke="${forecast ? "#ac674f" : "#55777a"}" stroke-width="${forecast ? 2 : 1}" ${forecast ? 'stroke-dasharray="7 7"' : ""}/>${forecast ? `<text y="${-c.r - 9}" text-anchor="middle">STURM · NÄCHSTE TIDE</text>` : `<path d="M-19 0q12-20 30-8t23 1m-75 18q20-16 41-4t34-3" fill="none" stroke="#55777a" opacity=".5"/>`}</g>`;
}
export function scene(
  s,
  p,
  selected,
  { busy = false, from = null, progress = 1, closeup = false } = {},
) {
  const mix = (g) => {
    const a = from?.giants.find((a) => a.id === g.id);
    return a
      ? {
          ...(progress < 1 ? a : g),
          x: a.x + (g.x - a.x) * progress,
          y: a.y + (g.y - a.y) * progress,
          angle: a.angle + (g.angle - a.angle) * progress,
        }
      : g;
  };
  const center = s.giants.find((g) => g.id === selected) || s.giants[0],
    camera = closeup
      ? `${Math.max(0, Math.min(600, center.x - 165))} 0 600 700`
      : "0 0 1200 700";
  const world = from && progress < 1 ? from : s,
    weatherTide = from ? from.tide + (s.tide - from.tide) * progress : s.tide;
  let contours = "";
  for (let i = 0; i < 15; i++) {
    const y = 55 + i * 43;
    contours += `<path d="M25 ${y}C230 ${y - 90} 340 ${y + 86} 560 ${y - 2}S910 ${y - 58} 1180 ${y + 5}"/>`;
  }
  let ripples = "";
  for (let i = 0; i < 54; i++) {
    const x = 80 + ((i * 173) % 1010),
      y = 90 + ((i * 97) % 510);
    ripples += `<path d="M${x} ${y}q8 5 16 0m4 0q5 3 10 0"/>`;
  }
  return `<svg id="sea" viewBox="${camera}" class="${closeup ? "closeup" : "overview"}" xmlns="http://www.w3.org/2000/svg" aria-label="Seekarte. Drei bewohnte Meeresriesen reisen nach Osten. Riesen auswählen und Kurs ziehen." role="group">
 <defs><pattern id="rain" width="13" height="13" patternUnits="userSpaceOnUse" patternTransform="rotate(24)"><path d="M2 0v7" stroke="#5e7c7b" stroke-width="1" opacity=".4"/></pattern><pattern id="ash" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="2" cy="3" r="1" fill="#4a6264" opacity=".35"/></pattern><clipPath id="chart"><path d="M20 72Q13 23 100 35L1110 27Q1194 24 1180 108L1188 606Q1189 670 1099 664L91 675Q7 668 19 597Z"/></clipPath></defs>
 <path class="shore-shadow" d="M20 72Q13 23 100 35L1110 27Q1194 24 1180 108L1188 606Q1189 670 1099 664L91 675Q7 668 19 597Z"/>
 <g clip-path="url(#chart)"><path fill="#d5e3d9" d="M0 0h1200v700H0Z"/>
 <g class="contours">${contours}</g><g class="ripples">${ripples}</g>
 <path d="M0 0h${frontAt(weatherTide)}v700H0Z" fill="#9aaba5" opacity=".8"/><path d="M0 0h${frontAt(weatherTide)}v700H0Z" fill="url(#ash)"/>
 <path class="front-next" d="M${frontAt(Math.min(14, s.tide + 1))} 35V670"/>
 <text class="front-label" transform="translate(${Math.max(42, frontAt(weatherTide) - 18)} 640) rotate(-90)">DER STURM FOLGT UNS</text>
 <path d="M1103 24C1063 94 1143 121 1092 172S1133 271 1092 335 1141 440 1096 510 1142 607 1098 686H1210V24Z" fill="#b4bca0" stroke="#718774" stroke-width="2"/>
 <path d="M1134 30Q1107 104 1148 143T1125 283 1145 400 1136 544 1157 675" fill="none" stroke="#d7d7b9" stroke-width="8"/>
 <path d="M1060 43V655" stroke="#718774" stroke-dasharray="2 9" fill="none"/>
 <text class="sanctuary" x="1145" y="349" text-anchor="middle" transform="rotate(-90 1145 349)">DER SAUM</text>
 ${tree(1132, 203, 1.3)}${tree(1168, 551, 1.1)}${town(1130, 112, 1.2)}${town(1150, 600, 1)}
 ${stormsAt(s, weatherTide)
   .map((c) => storm(c, false))
   .join("")}${
   !busy && s.status === "playing"
     ? stormsAt(s, s.tide + 1)
         .map((c) => storm(c, true))
         .join("")
     : ""
 }
 ${s.reefs.map(reef).join("")}
 ${world.rafts
   .filter((r) => r.people > 0)
   .map(
     (r) =>
       `<g class="raft" transform="translate(${r.x} ${r.y})"><circle r="64" fill="none" stroke="#aa7956" stroke-dasharray="2 7" opacity=".55"/><ellipse cy="8" rx="24" ry="10" fill="#8aa699" opacity=".35"/><path d="M-20 6h40l-6 8h-27Z" fill="#b18b60" stroke="#785b45"/>${town(-6, 5, 0.72)}<path d="M13 5v-26l14 7-14 5" fill="#bd6b4c" stroke="#785b45"/><text y="39" text-anchor="middle">${r.people} FAMILIEN</text></g>`,
   )
   .join("")}
 ${
   !busy && s.status === "playing"
     ? s.giants
         .filter(active)
         .map((g) => {
           const d = destination(g),
             next = p.giants.find((a) => a.id === g.id),
             danger = next.hull < g.hull,
             sel = g.id === selected;
           return `<g class="route ${sel ? "chosen" : ""} ${danger ? "danger" : ""}"><path d="M${g.x} ${g.y}L${d.x} ${d.y}"/><circle class="destination" cx="${d.x}" cy="${d.y}" r="${sel ? 12 : 7}"/><text x="${d.x}" y="${d.y - 20}" text-anchor="middle">${danger ? "! " : ""}${MODES[g.mode].label}</text>${sel ? `<path d="M${d.x - 5} ${d.y}h10m-5-5v10"/><path class="shelter-area" d="M${d.x + 30} ${d.y - shelterRadius(g) * 0.97}A${shelterRadius(g)} ${shelterRadius(g)} 0 1 0 ${d.x + 30} ${d.y + shelterRadius(g) * 0.97}"/>` : ""}</g>`;
         })
         .join("")
     : ""
 }
 ${s.giants
   .map(mix)
   .map((g) => island(g, g.id === selected, busy))
   .join("")}
 ${
   !busy
     ? s.events
         .filter((e) =>
           ["rescue", "damage", "shelter", "arrive"].includes(e.type),
         )
         .map((e, i) => {
           const g = s.giants.find((g) => g.id === e.id),
             offset =
               s.events.slice(0, i).filter((a) => a.id === e.id).length * 19;
           return `<g class="event-label event-${e.type}" transform="translate(${g.x} ${g.y - 66 - offset})"><text text-anchor="middle">${e.type === "rescue" ? "+" + e.count + " Familien" : e.type === "damage" ? "−" + e.amount + " Leben" : e.type === "arrive" ? "Am neuen Ufer" : "Im Windschatten"}</text></g>`;
         })
         .join("")
     : ""
 }
 </g>
 <g class="compass" transform="translate(1030 79)"><path d="M0-22 5 0 0 22-5 0ZM-22 0 0-5 22 0 0 5Z" fill="none" stroke="#536a5e"/><path d="M0-22 5 0H0Z" fill="#536a5e"/><text y="-31" text-anchor="middle">N</text></g>
 <text class="map-note" x="51" y="58">ARCHIPEL DER WANDERNDEN · SEEKARTE ${escape(s.seed)}</text>
 <path class="scale" d="M845 640h150m-150-5v10m75-10v10m75-10v10"/><text class="map-note" x="920" y="659" text-anchor="middle">EINE GLEITENDE TIDE</text>
 </svg>`;
}
