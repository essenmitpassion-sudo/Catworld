import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const { createGame, setPlan, advance, active } = await import(
  pathToFileURL(resolve(process.argv[2] || "src/engine.js"))
);
let prematurelyPlayable = 0,
  capacityEndings = 0;
for (let k = 0; k < 500; k++) {
  let s = createGame(String(k));
  for (let t = 0; t < 14 && s.status === "playing"; t++) {
    for (const g of s.giants.filter(active))
      s = setPlan(s, g.id, {
        angle: Math.sin(k * 17 + t * 3 + g.speed) * 0.9,
        mode: ["glide", "sprint", "rest"][(k + t + g.speed) % 3],
      });
    s = advance(s);
    const ceiling =
      s.delivered + s.giants.filter(active).reduce((a, g) => a + g.capacity, 0);
    if (s.status === "playing" && ceiling < s.goal) prematurelyPlayable++;
    if (s.status === "lost" && s.reason.includes("tragen")) capacityEndings++;
  }
  if (k === 7) {
    assert.equal(
      s.tide,
      12,
      "known reachable counterexample should end at tide 12",
    );
    assert.equal(s.status, "lost");
  }
}
assert.equal(
  prematurelyPlayable,
  0,
  "journeys with insufficient total transport capacity must already be terminal",
);
console.log(
  JSON.stringify({
    seeds: 500,
    capacityEndings,
    continuingImpossibleJourneys: prematurelyPlayable,
  }),
);
