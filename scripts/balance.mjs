import { createGame, advance } from "../src/engine.js";
import { choose } from "./policies.mjs";
import { writeFile, mkdir } from "node:fs/promises";
const seeds = [
  "MORGEN",
  "FERNE",
  "SALZ",
  "GARTEN",
  "SAUM",
  "WIND",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
];
const results = [];
for (const seed of seeds)
  for (const policy of ["idle", "straight", "sprint", "patient", "navigator"]) {
    let s = createGame(seed),
      rescue = 0,
      shelter = 0,
      damage = 0;
    const trace = [];
    while (s.status === "playing") {
      const p = choose(s, policy);
      trace.push(
        p.giants.map((g) => ({ id: g.id, angle: g.angle, mode: g.mode })),
      );
      s = advance(p);
      rescue += s.events
        .filter((e) => e.type === "rescue")
        .reduce((a, e) => a + e.count, 0);
      shelter += s.events.filter((e) => e.type === "shelter").length;
      damage += s.events
        .filter((e) => e.type === "damage")
        .reduce((a, e) => a + e.amount, 0);
    }
    results.push({
      seed,
      policy,
      status: s.status,
      tides: s.tide,
      delivered: s.delivered,
      rescue,
      shelter,
      damage,
      trace,
    });
  }
await mkdir("work", { recursive: true });
await writeFile("work/strategy-results.json", JSON.stringify(results, null, 2));
for (const policy of ["idle", "straight", "sprint", "patient", "navigator"]) {
  const rows = results.filter((r) => r.policy === policy);
  console.log(
    policy,
    JSON.stringify({
      wins: rows.filter((r) => r.status === "won").length,
      runs: rows.length,
      delivered: rows.map((r) => r.delivered),
      rescues: rows.map((r) => r.rescue),
      shelter: rows.reduce((a, r) => a + r.shelter, 0),
    }),
  );
}
