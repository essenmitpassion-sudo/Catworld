import { chromium } from "@playwright/test";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createGame, advance, active } from "../src/engine.js";
import { choose } from "./policies.mjs";
await mkdir("work/preview", { recursive: true });
const html = await readFile("dist/SAUM.html");
const server = createServer((req, res) => {
  if (req.url === "/favicon.ico") {
    res.writeHead(204).end();
    return;
  }
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(html);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const url = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  }),
  page = await context.newPage();
const errors = [],
  requests = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("request", (r) => requests.push(r.url()));
const result = {};
async function readState(s) {
  assert.equal(
    await page.locator("#app").getAttribute("data-tide"),
    String(s.tide),
  );
  assert.equal(
    await page.locator("#app").getAttribute("data-status"),
    s.status,
  );
  for (const g of s.giants) {
    const el = page.locator(`[data-giant="${g.id}"]`);
    assert.equal(
      await el.getAttribute("aria-label"),
      `${g.name}, ${g.people} Familien, ${g.breath} Atem, ${g.hull} Leben`,
    );
    const transform = await el.getAttribute("transform");
    assert.equal(transform, `translate(${g.x} ${g.y})`);
  }
}
async function enterPlan(p) {
  for (const g of p.giants.filter(active)) {
    await page
      .getByRole("button", { name: `${g.name} auswählen`, exact: true })
      .click();
    await page.locator(`[data-mode="${g.mode}"]`).click();
    const range = page.getByRole("slider");
    await range.focus();
    await range.press("Home");
    const steps = Math.round((g.angle + 1) / 0.05);
    for (let i = 0; i < steps; i++) await range.press("ArrowRight");
    assert.ok(Math.abs(Number(await range.inputValue()) - g.angle) < 1e-6);
  }
}
try {
  await page.goto(url);
  await page.screenshot({ path: "work/preview/intro.png", fullPage: true });
  await page
    .getByRole("button", { name: "Die Reise beginnen", exact: true })
    .click();
  await page.screenshot({ path: "work/preview/desktop.png", fullPage: true });
  // The characteristic interaction is exercised as a real pointer drag.
  const box = await page.locator('[data-giant="mara"] .creature').boundingBox();
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.4);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width + 70, box.y - 30, { steps: 8 });
  await page.mouse.up();
  assert.ok(
    Number(await page.getByRole("slider").inputValue()) < -0.1,
    "drag changes course",
  );
  await page.getByRole("button", { name: "Neustart", exact: true }).click();
  await readState(createGame("MORGEN"));
  // Keyboard interaction and rules dialog retain working focus.
  await page.getByRole("button", { name: "Mara auswählen" }).focus();
  await page.keyboard.press("2");
  await page.keyboard.press("e");
  assert.equal(
    await page.locator('[data-mode="sprint"]').getAttribute("aria-pressed"),
    "true",
  );
  await page.getByRole("button", { name: "Lotsenbuch", exact: true }).click();
  await page.getByRole("dialog").waitFor();
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("dialog").count(), 0);
  await page.getByRole("button", { name: "Neustart", exact: true }).click();
  let s = createGame("MORGEN"),
    trace = [];
  while (s.status === "playing") {
    const p = choose(s);
    await enterPlan(p);
    const n = advance(p);
    await page
      .getByRole("button", { name: "Die Tide kommt", exact: false })
      .click();
    await page.waitForFunction(
      (t) => document.querySelector("#app").dataset.tide === String(t),
      n.tide,
    );
    await readState(n);
    trace.push({ tide: n.tide, delivered: n.delivered, events: n.events });
    s = n;
    if (n.tide === 5)
      await page.screenshot({
        path: "work/preview/midgame.png",
        fullPage: true,
      });
  }
  assert.equal(s.status, "won");
  await page
    .getByRole("heading", { name: "Ein Ufer für die wandernden Gärten." })
    .waitFor();
  await page.screenshot({ path: "work/preview/win.png", fullPage: true });
  result.win = { tides: s.tide, delivered: s.delivered, trace };
  await page
    .getByRole("button", { name: "Dieselbe Reise noch einmal", exact: true })
    .click();
  s = createGame("MORGEN");
  await readState(s);
  // A complete unplanned run demonstrates a reachable loss and a working recovery.
  while (s.status === "playing") {
    s = advance(s);
    await page
      .getByRole("button", { name: "Die Tide kommt", exact: false })
      .click();
    await page.waitForFunction(
      (t) => document.querySelector("#app").dataset.tide === String(t),
      s.tide,
    );
    await readState(s);
  }
  assert.equal(s.status, "lost");
  await page
    .getByRole("heading", { name: "Nicht alle Wege führen ans Ufer." })
    .waitFor();
  await page.screenshot({ path: "work/preview/loss.png", fullPage: true });
  result.loss = { tides: s.tide, delivered: s.delivered };
  await page
    .getByRole("button", { name: "Dieselbe Reise noch einmal", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Andere Seekarte", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Seekarte", exact: true })
    .fill("FERNE");
  await page
    .getByRole("button", { name: "Diese Reise beginnen", exact: true })
    .click();
  await readState(createGame("FERNE"));
  result.seedRestart = true;
  // Offline interaction on the exact portable artifact; no external runtime requests.
  await context.setOffline(true);
  await page
    .getByRole("button", { name: "Die Tide kommt", exact: false })
    .click();
  await page.waitForFunction(
    () => document.querySelector("#app").dataset.tide === "1",
  );
  await context.setOffline(false);
  result.offline = true;
  await page.getByRole("button", { name: "Neustart", exact: true }).click();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForFunction(
      (w) =>
        document.querySelector("#sea").viewBox.baseVal.width ===
        (w <= 520 ? 600 : 1200),
      width,
    );
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `overflow ${width}`,
    );
    for (const name of ["Mara auswählen", "Ivo auswählen", "Nemi auswählen"])
      assert.ok(
        (await page.getByRole("button", { name, exact: true }).boundingBox())
          .width >= 30,
      );
    if (width <= 390) {
      assert.equal(
        (await page.locator("#sea").getAttribute("viewBox")).split(" ")[2],
        "600",
      );
      await page
        .getByRole("button", { name: "Gesamte Karte", exact: true })
        .click();
      assert.equal(
        (await page.locator("#sea").getAttribute("viewBox")).split(" ")[2],
        "1200",
      );
      await page
        .getByRole("button", { name: "Nahansicht", exact: true })
        .click();
    }
    await page.screenshot({
      path: `work/preview/width-${width}.png`,
      fullPage: true,
    });
  }
  // Animation must move through intermediate positions and reject a double command.
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page
    .getByRole("button", { name: "Die Tide kommt", exact: false })
    .click();
  assert.equal(
    await page.locator('[data-action="restart"]').isDisabled(),
    true,
  );
  await page.waitForFunction(() => {
    const x = Number(
      document
        .querySelector('[data-giant="mara"]')
        .getAttribute("transform")
        .match(/translate\(([^ ]+)/)[1],
    );
    return x > 145 && x < 240;
  });
  await page.locator('[data-action="tide"]').dispatchEvent("click");
  await page.waitForFunction(
    () => document.querySelector("#app").dataset.tide === "1",
  );
  await readState(advance(createGame("FERNE")));
  result.animation = true;
  assert.deepEqual(errors, []);
  assert.ok(
    requests.every((r) => r.startsWith(url)),
    requests.join("\n"),
  );
  result.errors = errors;
  result.runtimeNetworkRequests = requests.length - 1;
  result.widths = [320, 390, 768, 1440];
  await writeFile("work/browser-results.json", JSON.stringify(result, null, 2));
  console.log(
    JSON.stringify({
      ...result,
      win: { tides: result.win.tides, delivered: result.win.delivered },
    }),
  );
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
