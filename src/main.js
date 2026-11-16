import {
  createGame,
  setPlan,
  advance,
  preview,
  MODES,
  active,
  LIMIT,
  clamp,
} from "./engine.js";
import { scene, escape } from "./scene.js";
const app = document.querySelector("#app");
let state = createGame(),
  selected = "mara",
  modal = "intro",
  busy = false,
  drag = null,
  lastFocus = null;
const reduced = matchMedia("(prefers-reduced-motion: reduce)"),
  portrait = matchMedia("(max-width: 520px)");
let overview = false;
const visual = (s, p, id, options = {}) =>
  scene(s, p, id, { ...options, closeup: portrait.matches && !overview });
const kindName = (g) =>
  g.kind === "guardian"
    ? "Hüter · weiter Windschatten"
    : g.kind === "garden"
      ? "Gartenriese · langer Atem"
      : "Schnellschwimmer · weite Wege";
const own = () =>
  state.giants.find((g) => g.id === selected) || state.giants[0];
function forecastText(next) {
  const g = own(),
    n = next.giants.find((a) => a.id === g.id),
    events = next.events.filter((e) => e.id === g.id);
  if (!active(g))
    return g.arrived
      ? `${g.name} hat das neue Ufer erreicht.`
      : `${g.name} ist verloren. Die anderen Inseln brauchen dich.`;
  const losses = state.giants.filter(
    (a) => active(a) && next.giants.find((b) => b.id === a.id).hull < a.hull,
  );
  const details = events
    .filter((e) => e.type !== "damage")
    .map((e) => e.text)
    .join(" ");
  const injury =
    n.hull < g.hull
      ? `${g.name}: ${events.find((e) => e.type === "damage")?.text.split(": ")[1]} −${g.hull - n.hull} Leben, −${n.hull === 0 ? g.people : Math.min(g.people, g.hull - n.hull)} Familien.`
      : "";
  if (injury) return injury;
  if (details)
    return (
      details +
      (losses.length
        ? ` Achtung: ${losses.map((g) => g.name).join(", ")} gefährdet.`
        : "")
    );
  if (losses.length)
    return `Nächste Tide: ${losses.map((g) => g.name).join(", ")} ${losses.length === 1 ? "erleidet" : "erleiden"} Schaden. Ändere Kurs oder Formation.`;
  if (g.mode === "rest")
    return `${g.name} ruht: +${Math.min(3, g.maxBreath - g.breath)} Atem. Der ruhende Körper schützt die anderen.`;
  return state.tide === 0
    ? "Ziehe einen Riesen zum Floss. Plane alle drei Kurse, dann lass die Tide kommen."
    : `${g.name} gleitet sicher. Kurs und Tempo der anderen Inseln bleiben ebenfalls Teil deines Plans.`;
}
function sheet() {
  if (!modal) return "";
  let content = "";
  if (modal === "intro")
    content = `<p class="folio">Eine Reise in vierzehn Tiden</p><p class="ornament" aria-hidden="true">≋ ◇ ≋</p><h2>Die Welt geht unter.<br>Deine Inseln gehen weiter.</h2><p class="intro-text">Auf den Rücken dreier Meeresriesen tragen kleine Dörfer ihre Gärten nach Osten. Hinter ihnen kommt der Sturm. Vor ihnen liegt der Saum.</p><div class="instruction"><strong>Bringe 12 Familien ans neue Ufer.</strong><br>Wähle einen Riesen und ziehe seinen Kurs. Alle drei reisen mit jeder Tide gleichzeitig. Sammle Flossdörfer und nutze den Windschatten der anderen.<br><br>Eilen kostet Atem. Ruhen gibt ihn zurück — und macht eine Insel zum Schutzraum.</div><button class="primary" data-action="start">Die Reise beginnen</button><button class="secondary" data-action="rules">Die Seekarte verstehen</button>`;
  if (modal === "rules")
    content = `<p class="folio">Das kleine Lotsenbuch</p><h2>Gemeinsam durch<br>den Sturm.</h2><dl class="rules-body"><dt>01 · Kurs geben</dt><dd>Riesen wählen, am Körper ziehen oder ins Wasser tippen. Der Kursregler ist genauer. Ein Kreis markiert die nächste Position; alle drei Kurse gelten gleichzeitig.</dd><dt>02 · Atem einteilen</dt><dd>Gleiten: −1 Atem. Eilen: −2 Atem, anderthalbfache Strecke. Ruhen: +3 Atem. Jede Insel hat 3 Leben und Platz für 6 Familien.</dd><dt>03 · Schutz geben</dt><dd>Gestrichelt rostrot zeigt den Sturm der nächsten Tide. Im Halbkreis hinter einem anderen Riesen bist du geschützt. Der Hüter schützt weiter; ruhende Inseln schützen am weitesten. Schutz hilft gegen Sturm, nicht gegen Riffe, Kollisionen oder die westliche Sturmfront.</dd><dt>04 · Niemanden zurücklassen</dt><dd>Flossdörfer in 64 Schritten Abstand zum Fahrweg werden automatisch aufgenommen. Jede Gefahr kostet 1 Leben und 1 Familie; die westliche Sturmfront kostet 2. Riffe treffen den ganzen Weg. Körper können gleichzeitig zusammenstossen. Sinkende Inseln verlieren alle Familien.</dd><dt>05 · Den Saum erreichen</dt><dd>Ab der gepunkteten östlichen Küstenlinie kommen Familien sicher an. 12 Familien bis zur 14. Tide gewinnen. Reiseende, zu viele Verluste oder zu wenig verbleibende Tragkraft beenden die Partie früher.</dd><dt>Mit Tastatur</dt><dd><span class="key">1</span> <span class="key">2</span> <span class="key">3</span> Insel wählen · <span class="key">↑</span> <span class="key">↓</span> Kurs · <span class="key">G</span> Gleiten · <span class="key">E</span> Eilen · <span class="key">R</span> Ruhen · <span class="key">Leertaste</span> Tide · <span class="key">Esc</span> Schliessen. Alle Aktionen auch als fokussierbare Bedienelemente.</dd></dl><button class="primary" data-action="close">Zur Seekarte</button>`;
  if (modal === "chart")
    content = `<p class="folio">Eine andere Strömung</p><h2>Jede Seekarte<br>hat ihren Namen.</h2><p class="intro-text">Derselbe Name bringt dieselben Flösse, Riffe und Stürme zurück. Eine neue Karte beginnt eine neue Reise.</p><form id="seed-form"><div class="seed-form"><label for="seed">Seekarte</label><input id="seed" name="seed" maxlength="32" value="${escape(state.seed)}" autocomplete="off" required></div><button class="primary" type="submit">Diese Reise beginnen</button></form><button class="secondary" data-action="close">Zurück</button>`;
  if (modal === "end")
    content = `<p class="folio">Seekarte ${escape(state.seed)} · ${state.tide} Tiden</p><p class="ornament" aria-hidden="true">≋ ◇ ≋</p><h2>${state.status === "won" ? "Ein Ufer für<br>die wandernden Gärten." : "Nicht alle Wege<br>führen ans Ufer."}</h2><p class="intro-text">${state.status === "won" ? "Die Riesen kommen zur Ruhe. Was sie getragen haben, kann wieder Wurzeln schlagen." : escape(state.reason) + " Jeder Rettungsumweg verändert die Formation. Versuche einen anderen gemeinsamen Kurs."}</p><p class="end-stat">${state.delivered} <span>von 12 Familien angekommen</span></p><button class="primary" data-action="restart">Dieselbe Reise noch einmal</button><button class="secondary" data-action="chart">Eine andere Seekarte</button><button class="secondary" data-action="close">Die letzte Tide ansehen</button>`;
  return `<div class="overlay"><section class="sheet" role="dialog" aria-modal="true" aria-label="${modal === "intro" ? "Willkommen bei Saum" : modal === "rules" ? "Spielregeln" : modal === "chart" ? "Seekarte wählen" : "Reiseergebnis"}">${content}</section></div>`;
}
function render({ focus = null } = {}) {
  const next = preview(state),
    g = own(),
    losses = state.giants.some(
      (a) => active(a) && next.giants.find((b) => b.id === a.id).hull < a.hull,
    );
  app.dataset.tide = state.tide;
  app.dataset.status = state.status;
  app.classList.toggle("busy", busy);
  app.innerHTML = `<header><div class="brand"><div><div class="eyebrow">Die wandernden Inseln</div><h1>SAUM</h1></div><p>Ein neues Ufer.<br>Ein gemeinsamer Weg.</p></div><div class="voyage-stats"><div class="stat">${String(state.tide).padStart(2, "0")} <span>/ ${LIMIT}</span><small>TIDEN VERGANGEN</small></div><div class="stat">${state.delivered} <span>/ ${state.goal}</span><small>FAMILIEN AM UFER</small></div><button class="text-button" data-action="rules" ${busy ? "disabled" : ""}>Lotsenbuch</button></div></header>
 <div class="world">${visual(state, next, selected, { busy })}<button class="map-view" data-action="view" aria-pressed="${overview}" ${busy ? "disabled" : ""}>${overview ? "Nahansicht" : "Gesamte Karte"}</button><div class="legend"><span><i></i>Sturm jetzt</span><span><i class="dash"></i>Nächste Tide</span><span><i class="dot"></i>Windschatten</span></div></div>
 <p class="mobile-help">Riesen antippen · Kurs mit dem Regler ändern</p>
 <div class="report"><div><p id="forecast" aria-live="polite" class="${losses ? "warning" : ""}">${busy ? "Die Inseln wandern …" : state.status === "playing" ? escape(forecastText(next)) : state.status === "won" ? "Die wandernden Gärten haben ihr neues Ufer erreicht." : escape(state.reason)}</p>${
   !busy && state.events.length
     ? `<small class="last-tide">Letzte Tide: ${escape(
         state.events
           .filter((e) =>
             ["rescue", "damage", "arrive", "shelter"].includes(e.type),
           )
           .map((e) => e.text)
           .join(" ") || "Die Inseln reisen ohne Zwischenfall.",
       )}</small>`
     : ""
 }</div><span class="hint">${state.tide === 0 ? "Kurs ziehen · alle Inseln gemeinsam bewegen" : "Körper auswählen · Kurs ziehen · Tide kommen lassen"}</span></div>
 <section class="controls" aria-label="Lotsensteuerung"><div class="roster" aria-label="Insel auswählen">${state.giants.map((a, i) => `<button data-select="${a.id}" class="${a.id === selected ? "current" : ""}" aria-label="${a.name} auswählen" aria-pressed="${a.id === selected}" ${busy ? "disabled" : ""}>${["I", "II", "III"][i]}</button>`).join("")}</div><div class="identity"><h2>${g.name} <small>${g.people}/${g.capacity} Familien</small></h2><small>${kindName(g)} · ${g.hull} Leben</small><div class="breath" aria-label="${g.breath} von ${g.maxBreath} Atem">${Array.from({ length: g.maxBreath }, (_, i) => `<b class="${i < g.breath ? "" : "empty"}"></b>`).join("")}</div><small>${g.breath} / ${g.maxBreath} Atem</small></div><div class="modes" aria-label="Reisetempo">${Object.entries(
   MODES,
 )
   .map(
     ([key, m]) =>
       `<button class="mode ${key === g.mode ? "active" : ""}" data-mode="${key}" aria-pressed="${key === g.mode}" ${busy || !active(g) || g.breath < m.cost ? "disabled" : ""}><strong>${m.label}</strong><small>${key === "rest" ? "+3 Atem" : `−${m.cost} Atem · ${key === "sprint" ? "weit" : "ruhig"}`}</small></button>`,
   )
   .join(
     "",
   )}</div><div class="course"><label for="course">Kurs <span>${Math.round((g.angle * 180) / Math.PI)}°</span></label><input id="course" type="range" min="-1" max="1" step="0.05" value="${g.angle}" aria-label="Kurs von ${g.name}" ${busy || !active(g) ? "disabled" : ""}></div><button class="tide-button" data-action="tide" ${busy || state.status !== "playing" ? "disabled" : ""}><strong>${busy ? "Die Inseln wandern …" : "Die Tide kommt"} <span aria-hidden="true">↗</span></strong><small>ALLE DREI KURSE AUSFÜHREN</small></button></section>
 <footer><span>SEEKARTE ${escape(state.seed)} · EINE REISE OHNE ZUFALLSWÜRFE</span><div class="footer-actions"><button class="text-button" data-action="chart" ${busy ? "disabled" : ""}>Andere Seekarte</button><button class="text-button" data-action="restart" ${busy ? "disabled" : ""}>Neustart</button></div></footer>${sheet()}`;
  if (modal) {
    document
      .querySelector(".sheet button, .sheet input")
      ?.focus({ preventScroll: true });
  } else if (focus)
    document.querySelector(focus)?.focus({ preventScroll: true });
}
function select(id, focus = false) {
  if (busy || modal) return;
  selected = id;
  render({ focus: focus ? `[data-select="${id}"]` : null });
}
function change(patch, focus) {
  if (busy || modal) return;
  state = setPlan(state, selected, patch);
  render({ focus });
}
function reset(seed = state.seed) {
  if (busy) return;
  state = createGame(seed);
  selected = "mara";
  modal = null;
  drag = null;
  render({ focus: '[data-select="mara"]' });
}
function open(which) {
  if (busy) return;
  lastFocus = document.activeElement?.dataset.action;
  modal = which;
  render();
}
function close() {
  modal = null;
  render({
    focus: lastFocus ? `[data-action="${lastFocus}"]` : '[data-action="tide"]',
  });
}
async function tide() {
  if (busy || modal || state.status !== "playing") return;
  const before = state,
    next = advance(state);
  busy = true;
  render();
  const duration = reduced.matches ? 0 : 740,
    start = performance.now();
  await new Promise((resolve) => {
    function frame(now) {
      const t = duration ? clamp((now - start) / duration, 0, 1) : 1,
        e = 1 - Math.pow(1 - t, 3);
      document.querySelector("#sea").outerHTML = visual(next, next, selected, {
        busy: true,
        from: before,
        progress: e,
      });
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
  state = next;
  busy = false;
  if (!active(own())) selected = state.giants.find(active)?.id || selected;
  if (state.status !== "playing") modal = "end";
  render({ focus: '[data-action="tide"]' });
}
app.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button || button.disabled) return;
  if (button.dataset.select) return select(button.dataset.select, true);
  if (button.dataset.mode)
    return change(
      { mode: button.dataset.mode },
      `[data-mode="${button.dataset.mode}"]`,
    );
  switch (button.dataset.action) {
    case "view":
      overview = !overview;
      render();
      break;
    case "start":
      modal = null;
      render({ focus: '[data-select="mara"]' });
      break;
    case "rules":
      open("rules");
      break;
    case "close":
      close();
      break;
    case "chart":
      open("chart");
      break;
    case "restart":
      reset();
      break;
    case "tide":
      void tide();
  }
});
app.addEventListener("submit", (e) => {
  if (e.target.id === "seed-form") {
    e.preventDefault();
    reset(new FormData(e.target).get("seed").trim() || "MORGEN");
  }
});
// Preserve the native slider node while dragging so pointer and keyboard capture survive.
app.addEventListener("input", (e) => {
  if (e.target.id === "course" && !busy && !modal) {
    const value = Number(e.target.value);
    state = setPlan(state, selected, { angle: value });
    const next = preview(state);
    document.querySelector("#sea").outerHTML = visual(state, next, selected);
    e.target.previousElementSibling.querySelector("span").textContent =
      Math.round((value * 180) / Math.PI) + "°";
    document.querySelector("#forecast").textContent = forecastText(next);
    document.querySelector("#forecast").classList.toggle(
      "warning",
      state.giants.some(
        (g) =>
          active(g) && next.giants.find((n) => n.id === g.id).hull < g.hull,
      ),
    );
  }
});
function chartPoint(e) {
  const svg = document.querySelector("#sea"),
    pt = new DOMPoint(e.clientX, e.clientY);
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}
app.addEventListener("pointerdown", (e) => {
  if (busy || modal || !e.target.closest("#sea") || e.button > 0) return;
  const hit = e.target.closest("[data-giant]");
  if (hit) {
    selected = hit.dataset.giant;
    render();
  }
  if (!active(own())) return;
  const p = chartPoint(e);
  drag = { pointerId: e.pointerId, x: p.x, y: p.y, moved: false };
  if (!hit) {
    drag.moved = true;
    steer(p);
  }
  e.preventDefault();
});
function steer(p) {
  const g = own(),
    angle = clamp(Math.atan2(p.y - g.y, Math.max(1, p.x - g.x)), -1, 1);
  state = setPlan(state, selected, {
    angle,
    mode: g.mode === "rest" && g.breath > 0 ? "glide" : g.mode,
  });
  render();
}
window.addEventListener("pointermove", (e) => {
  if (!drag || drag.pointerId !== e.pointerId || busy) return;
  const p = chartPoint(e);
  if (Math.hypot(p.x - drag.x, p.y - drag.y) > 12) drag.moved = true;
  if (drag.moved) steer(p);
});
window.addEventListener("pointerup", () => {
  drag = null;
});
window.addEventListener("pointercancel", () => {
  drag = null;
});
window.addEventListener("keydown", (e) => {
  if (e.altKey || e.ctrlKey || e.metaKey || (e.repeat && e.key === " ")) return;
  if (modal) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
    if (e.key === "Tab") {
      const nodes = [
        ...document.querySelectorAll(".sheet button,.sheet input"),
      ].filter((n) => !n.disabled);
      const first = nodes[0],
        last = nodes.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    return;
  }
  if (busy || e.target.matches("input")) return;
  const hit = e.target.closest("[data-giant]");
  if (hit && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    select(hit.dataset.giant, true);
    return;
  }
  if (["1", "2", "3"].includes(e.key)) {
    e.preventDefault();
    select(state.giants[Number(e.key) - 1].id, true);
  } else if (
    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
  ) {
    e.preventDefault();
    change(
      {
        angle:
          own().angle + (["ArrowUp", "ArrowLeft"].includes(e.key) ? -0.1 : 0.1),
      },
      `[data-select="${selected}"]`,
    );
  } else if (!e.target.closest("button") && e.key === " ") {
    e.preventDefault();
    void tide();
  } else if (e.key.toLowerCase() === "g")
    change({ mode: "glide" }, '[data-mode="glide"]');
  else if (e.key.toLowerCase() === "e")
    change({ mode: "sprint" }, '[data-mode="sprint"]');
  else if (e.key.toLowerCase() === "r")
    change({ mode: "rest" }, '[data-mode="rest"]');
});
render();

portrait.addEventListener("change", () => {
  if (!busy) render();
});
