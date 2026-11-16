import test from "node:test";
import assert from "node:assert/strict";
import * as game from "../src/engine.js";
const giant = (id, x, y, extra = {}) => ({
  id,
  name: id,
  x,
  y,
  angle: 0,
  mode: "glide",
  speed: 100,
  breath: 6,
  maxBreath: 6,
  hull: 3,
  people: 3,
  capacity: 6,
  kind: "swift",
  arrived: false,
  ...extra,
});
const water = (giants = [giant("a", 400, 300)]) => ({
  ...game.createGame("MORGEN"),
  tide: 0,
  giants,
  rafts: [],
  reefs: [],
  storms: [],
  delivered: 0,
  goal: 3,
  status: "playing",
  events: [],
});

test("planning rejects unknown commands and non-finite courses without mutating state", () => {
  assert.equal(
    typeof game.setPlan,
    "function",
    "new course-planning API is required",
  );
  const s = water(),
    copy = structuredClone(s);
  for (const [id, p] of [
    ["x", { mode: "rest" }],
    ["a", { mode: "hack" }],
    ["a", { angle: NaN }],
    ["a", { angle: Infinity }],
  ])
    assert.deepEqual(game.setPlan(s, id, p), s);
  assert.deepEqual(s, copy);
});
test("glide and sprint pay breath, rest restores it, exhausted ships always have a legal rest", () => {
  let s = water();
  let n = game.advance(s);
  assert.equal(n.giants[0].x, 500);
  assert.equal(n.giants[0].breath, 5);
  s = game.setPlan(s, "a", { mode: "sprint" });
  n = game.advance(s);
  assert.equal(n.giants[0].x, 550);
  assert.equal(n.giants[0].breath, 4);
  s = water([giant("a", 400, 300, { breath: 0, mode: "rest" })]);
  assert.equal(game.setPlan(s, "a", { mode: "sprint" }).giants[0].mode, "rest");
  n = game.advance(s);
  assert.equal(n.giants[0].x, 400);
  assert.equal(n.giants[0].breath, 3);
});
test("reef damage checks entire path, not only destination", () => {
  const s = water();
  s.reefs = [{ x: 450, y: 300, r: 12 }];
  const n = game.advance(s);
  assert.equal(n.giants[0].hull, 2);
  assert.equal(n.giants[0].people, 2);
});
test("resting companion shelters a traveller from the next storm", () => {
  const s = water([
    giant("a", 400, 300),
    giant("b", 560, 350, { mode: "rest" }),
  ]);
  s.goal = 1;
  s.storms = [{ x: 500, y: 300, r: 100, dy: 0, phase: 0 }];
  const n = game.advance(s);
  assert.equal(n.giants[0].hull, 3);
  assert.ok(n.events.some((e) => e.type === "shelter" && e.id === "a"));
  const alone = water();
  alone.goal = 1;
  alone.storms = s.storms;
  assert.equal(game.advance(alone).giants[0].hull, 2);
});
test("shelter ahead of the protector does not work", () => {
  const s = water([
    giant("a", 500, 300),
    giant("b", 500, 400, { mode: "rest" }),
  ]);
  s.goal = 1;
  s.storms = [{ x: 600, y: 300, r: 60, dy: 0, phase: 0 }];
  assert.equal(game.advance(s).giants[0].hull, 2);
});
test("simultaneous crossing paths collide even with distant endpoints", () => {
  const s = water([
    giant("a", 400, 250, { angle: 1 }),
    giant("b", 400, 350, { angle: -1 }),
  ]);
  s.goal = 1;
  const n = game.advance(s);
  assert.deepEqual(
    n.giants.map((g) => g.hull),
    [2, 2],
  );
});
test("one raft cannot be collected twice; capacity leaves remaining families afloat", () => {
  const s = water([giant("a", 400, 300, { people: 5 }), giant("b", 400, 430)]);
  s.goal = 1;
  s.rafts = [{ id: "r", x: 450, y: 300, people: 2 }];
  const n = game.advance(s);
  assert.equal(n.giants[0].people, 6);
  assert.equal(n.rafts[0].people, 1);
  const next = game.advance(n);
  assert.equal(next.giants[0].people, 6);
  assert.equal(next.rafts[0].people, 1);
});
test("families on a destroyed carrier are lost rather than delivered or rescued", () => {
  const s = water([giant("a", 1010, 300, { hull: 1 })]);
  s.reefs = [{ x: 1035, y: 300, r: 20 }];
  s.rafts = [{ id: "r", x: 1040, y: 300, people: 2 }];
  const n = game.advance(s);
  assert.equal(n.delivered, 0);
  assert.equal(n.giants[0].people, 0);
  assert.equal(n.rafts[0].people, 2);
  assert.equal(n.status, "lost");
});
test("delivery scores exactly once and terminal states lock input", () => {
  const s = water([giant("a", 1010, 300)]);
  const n = game.advance(s);
  assert.equal(n.delivered, 3);
  assert.equal(n.status, "won");
  assert.equal(n.giants[0].people, 0);
  assert.deepEqual(game.advance(n), n);
  assert.deepEqual(game.setPlan(n, "a", { mode: "rest" }), n);
});
test("last tide permits victory before deadline loss; rest to deadline loses", () => {
  const s = water([giant("a", 1010, 300)]);
  s.tide = 13;
  assert.equal(game.advance(s).status, "won");
  const t = water([giant("a", 1000, 300, { mode: "rest" })]);
  t.tide = 13;
  assert.equal(game.advance(t).status, "lost");
});
test("forecast is pure and exactly matches execution, seed replay is deterministic", () => {
  const s = game.createGame("MORGEN"),
    copy = structuredClone(s);
  assert.deepEqual(game.preview(s), game.advance(s));
  assert.deepEqual(s, copy);
  assert.deepEqual(game.createGame("MORGEN"), s);
  assert.notDeepEqual(game.createGame("FERNE").rafts, s.rafts);
});
test("finite positions, family conservation and restart hold across 40 seeded complete runs", () => {
  for (let seed = 0; seed < 40; seed++) {
    let s = game.createGame(String(seed)),
      initial = structuredClone(s);
    const total =
      s.giants.reduce((a, g) => a + g.people, 0) +
      s.rafts.reduce((a, r) => a + r.people, 0);
    for (let t = 0; t < 14 && s.status === "playing"; t++) {
      for (const g of s.giants)
        s = game.setPlan(s, g.id, {
          angle: Math.sin(t + seed) * 0.9,
          mode: t % 3 === 0 ? "rest" : "glide",
        });
      s = game.advance(s);
      assert.ok(
        s.delivered +
          s.giants.reduce((a, g) => a + g.people, 0) +
          s.rafts.reduce((a, r) => a + r.people, 0) <=
          total,
      );
      for (const g of s.giants) {
        assert.ok(Number.isFinite(g.x) && Number.isFinite(g.y));
        assert.ok(g.breath >= 0 && g.breath <= g.maxBreath);
      }
    }
    assert.notEqual(s.status, "playing");
    assert.deepEqual(game.createGame(String(seed)), initial);
  }
});
