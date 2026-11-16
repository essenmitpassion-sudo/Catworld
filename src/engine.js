// Pure, deterministic rules. All distances are chart coordinates (1200 × 700).
export const LIMIT = 14,
  HARBOR = 1060;
export const MODES = {
  glide: { label: "Gleiten", cost: 1, mult: 1 },
  sprint: { label: "Eilen", cost: 2, mult: 1.5 },
  rest: { label: "Ruhen", cost: 0, mult: 0 },
};
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export function segmentDistance(p, a, b) {
  const dx = b.x - a.x,
    dy = b.y - a.y,
    d = dx * dx + dy * dy;
  const t = d ? clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / d, 0, 1) : 0;
  return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
}
function rng(seed) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function createGame(seed = "MORGEN") {
  seed = String(seed).slice(0, 32) || "MORGEN";
  const random = rng(seed),
    j = () => Math.round((random() - 0.5) * 65);
  const specs = [
    ["mara", "Mara", "guardian", 95, 8, 205],
    ["ivo", "Ivo", "swift", 115, 6, 365],
    ["nemi", "Nemi", "garden", 105, 7, 525],
  ];
  return {
    seed,
    tide: 0,
    goal: 12,
    delivered: 0,
    status: "playing",
    reason: "",
    events: [],
    giants: specs.map(([id, name, kind, speed, maxBreath, y]) => ({
      id,
      name,
      kind,
      speed,
      maxBreath,
      breath: maxBreath,
      x: 145,
      y,
      angle: 0,
      mode: "glide",
      hull: 3,
      people: 3,
      capacity: 6,
      arrived: false,
    })),
    rafts: [
      [320, 220],
      [345, 490],
      [570, 350],
      [790, 185],
      [850, 525],
    ].map(([x, y], i) => ({ id: "r" + i, x: x + j(), y: y + j(), people: 2 })),
    reefs: [
      [435, 365, 37],
      [720, 235, 33],
      [880, 440, 36],
    ].map(([x, y, r]) => ({ x: x + j(), y: y + j(), r })),
    storms: [
      { x: 555 + j(), y: 205, r: 110, dy: 125, phase: random() * 6 },
      { x: 810 + j(), y: 480, r: 120, dy: 110, phase: random() * 6 },
    ],
  };
}
export const active = (g) => g.hull > 0 && !g.arrived;
export const frontAt = (tide) => 20 + tide * 55;
export const stormsAt = (s, tide) =>
  s.storms.map((c) => ({
    ...c,
    y: clamp(c.y + Math.sin((tide + c.phase) * 0.64) * c.dy, 110, 590),
  }));
export const shelterRadius = (g) =>
  g.mode === "rest" ? 155 : g.kind === "guardian" ? 145 : 85;
export function destination(g) {
  const move = MODES[g.mode].mult * g.speed;
  return {
    x: Math.min(1100, g.x + Math.cos(g.angle) * move),
    y: clamp(g.y + Math.sin(g.angle) * move, 85, 615),
  };
}
export function setPlan(s, id, patch) {
  if (s.status !== "playing" || !patch || typeof patch !== "object") return s;
  const g = s.giants.find((g) => g.id === id);
  if (!g || !active(g)) return s;
  if (patch.mode !== undefined && !Object.hasOwn(MODES, patch.mode)) return s;
  if (patch.angle !== undefined && !Number.isFinite(patch.angle)) return s;
  const mode = patch.mode ?? g.mode;
  if (MODES[mode].cost > g.breath) return s;
  return {
    ...s,
    giants: s.giants.map((v) =>
      v.id === id
        ? { ...v, mode, angle: clamp(patch.angle ?? g.angle, -1, 1) }
        : v,
    ),
  };
}
export function advance(s) {
  if (s.status !== "playing") return s;
  const n = structuredClone(s);
  n.tide++;
  n.events = [];
  const emit = (type, id, text, extra = {}) =>
    n.events.push({ type, id, text, ...extra });
  const old = new Map(s.giants.map((g) => [g.id, g]));
  for (const g of n.giants)
    if (active(g)) {
      if (MODES[g.mode].cost > g.breath) g.mode = "rest";
      Object.assign(g, destination(g));
      g.breath = clamp(
        g.breath + (g.mode === "rest" ? 3 : -MODES[g.mode].cost),
        0,
        g.maxBreath,
      );
    }
  // Relative-motion segment catches simultaneous crossings without tunnelling.
  const collision = new Set();
  const living = n.giants.filter(active);
  for (let i = 0; i < living.length; i++)
    for (let j = i + 1; j < living.length; j++) {
      const a = living[i],
        b = living[j],
        oa = old.get(a.id),
        ob = old.get(b.id);
      if (
        segmentDistance(
          { x: 0, y: 0 },
          { x: oa.x - ob.x, y: oa.y - ob.y },
          { x: a.x - b.x, y: a.y - b.y },
        ) < 48
      ) {
        collision.add(a.id);
        collision.add(b.id);
      }
    }
  // Hazards are simultaneous: shelter is evaluated from the shared pre-damage formation.
  const damage = new Map();
  for (const g of living) {
    let hit = 0;
    const reasons = [];
    if (n.reefs.some((r) => segmentDistance(r, old.get(g.id), g) < r.r + 18)) {
      hit++;
      reasons.push("Riff");
    }
    if (collision.has(g.id)) {
      hit++;
      reasons.push("Kollision");
    }
    if (g.x < frontAt(n.tide)) {
      hit += 2;
      reasons.push("Sturmfront");
    }
    if (stormsAt(n, n.tide).some((c) => distance(g, c) < c.r)) {
      const guardian = living.find(
        (b) =>
          b.id !== g.id && g.x <= b.x + 30 && distance(g, b) < shelterRadius(b),
      );
      if (guardian)
        emit(
          "shelter",
          g.id,
          `${g.name} reist im Schutz von ${guardian.name}.`,
          { protector: guardian.id },
        );
      else {
        hit++;
        reasons.push("Sturm");
      }
    }
    damage.set(g.id, { hit, reasons });
  }
  for (const g of living) {
    const { hit, reasons } = damage.get(g.id);
    if (hit) {
      g.hull = Math.max(0, g.hull - hit);
      g.people = Math.max(0, g.people - hit);
      emit("damage", g.id, `${g.name}: ${reasons.join(" + ")}.`, {
        amount: hit,
      });
    }
    if (g.hull === 0) {
      g.people = 0;
      emit("sunk", g.id, `${g.name} ist im Sturm verloren.`);
    }
  }
  for (const g of n.giants)
    if (active(g)) {
      for (const r of n.rafts)
        if (
          r.people &&
          g.people < g.capacity &&
          segmentDistance(r, old.get(g.id), g) < 64
        ) {
          const count = Math.min(r.people, g.capacity - g.people);
          r.people -= count;
          g.people += count;
          emit("rescue", g.id, `${g.name} nimmt ${count} Familien auf.`, {
            count,
          });
        }
      if (g.x >= HARBOR) {
        n.delivered += g.people;
        emit(
          "arrive",
          g.id,
          `${g.name} bringt ${g.people} Familien in den Saum.`,
          { count: g.people },
        );
        g.people = 0;
        g.arrived = true;
      }
    }
  const remainingPeople =
    n.giants.reduce((a, g) => a + (active(g) ? g.people : 0), 0) +
    n.rafts.reduce((a, r) => a + r.people, 0);
  const remainingCapacity = n.giants.reduce(
    (a, g) => a + (active(g) ? g.capacity : 0),
    0,
  );
  // Each island can arrive only once. Even unlimited time cannot deliver more
  // than this upper bound; equality must remain playable.
  const available = n.delivered + Math.min(remainingPeople, remainingCapacity);
  if (n.delivered >= n.goal) {
    n.status = "won";
    n.reason = "Die Gärten haben ein neues Ufer.";
  } else if (n.tide >= LIMIT || !n.giants.some(active) || available < n.goal) {
    n.status = "lost";
    n.reason =
      n.tide >= LIMIT
        ? "Die letzte Tide ist verstrichen."
        : n.delivered + remainingCapacity < n.goal
          ? "Die verbliebenen Inseln können nicht genug Familien tragen."
          : available < n.goal
            ? "Zu viele Familien sind verloren."
            : "Alle Inseln haben ihre Reise beendet.";
  }
  // Keep plans affordable; rest is always available, never an exhausted-input soft lock.
  for (const g of n.giants)
    if (active(g) && MODES[g.mode].cost > g.breath) g.mode = "rest";
  return n;
}
export const preview = advance;
