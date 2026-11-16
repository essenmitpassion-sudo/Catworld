import {
  setPlan,
  preview,
  active,
  distance,
  MODES,
  segmentDistance,
} from "../src/engine.js";
// Test opponents only; the product has no hidden assistance or automatic commands.
function value(s, next) {
  let score =
    next.delivered * 850 +
    (next.status === "won" ? 20000 : next.status === "lost" ? -20000 : 0);
  for (const g of next.giants) {
    const old = s.giants.find((a) => a.id === g.id);
    if (!active(g)) continue;
    score +=
      g.people * 240 +
      g.x * (g.people + 1) * 0.24 +
      g.hull * 145 +
      g.breath * 13;
    if (g.hull < old.hull) score -= (old.hull - g.hull) * 260;
    if (g.people < g.capacity) {
      const targets = next.rafts.filter((r) => r.people > 0 && r.x > g.x - 55);
      if (targets.length) {
        const near = Math.min(...targets.map((r) => distance(g, r)));
        score += (Math.max(0, 150 - near * 0.5) * (g.capacity - g.people)) / 3;
      }
    }
    // Leave manoeuvring room before a rock on the following tide.
    const probe = { x: Math.min(1100, g.x + g.speed), y: g.y };
    if (next.reefs.some((r) => segmentDistance(r, g, probe) < r.r + 24))
      score -= 25;
  }
  return score;
}
export function choose(s, policy = "navigator") {
  if (policy === "idle") return s;
  if (policy === "straight" || policy === "sprint") {
    let plan = s;
    for (const g of s.giants)
      if (active(g)) {
        const mode = policy === "sprint" ? "sprint" : "glide";
        plan = setPlan(plan, g.id, {
          angle: 0,
          mode: g.breath < MODES[mode].cost ? "rest" : mode,
        });
      }
    return plan;
  }
  let best = s;
  for (let pass = 0; pass < 3; pass++)
    for (const g of best.giants.filter(active)) {
      let local = best,
        score = -Infinity;
      const angles = [
        -1,
        -0.8,
        -0.6,
        -0.4,
        -0.2,
        0,
        0.2,
        0.4,
        0.6,
        0.8,
        1,
        g.angle,
      ];
      for (const mode of policy === "patient"
        ? ["glide", "rest"]
        : ["glide", "sprint", "rest"]) {
        if (g.breath < MODES[mode].cost) continue;
        for (const angle of mode === "rest" ? [0] : angles) {
          const candidate = setPlan(best, g.id, { angle, mode }),
            n = preview(candidate),
            v = value(s, n);
          if (v > score) {
            score = v;
            local = candidate;
          }
        }
      }
      best = local;
    }
  return best;
}
