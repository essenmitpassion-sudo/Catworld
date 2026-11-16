import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { createGame, setPlan, advance } from "../src/engine.js";
import { scene } from "../src/scene.js";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage();
  const before = setPlan(createGame("MORGEN"), "mara", { mode: "sprint" }),
    after = advance(before);
  assert.ok(
    after.events.some((e) => e.type === "rescue"),
    "fixture must actually rescue families",
  );
  await page.setContent(
    scene(after, after, "mara", { busy: true, from: before, progress: 0.5 }),
  );
  const mid = await page
    .locator('[data-giant="mara"]')
    .getAttribute("aria-label");
  assert.ok(
    mid.includes("3 Familien"),
    "families must only board when the journey finishes",
  );
  assert.equal(
    await page.locator(".raft").count(),
    5,
    "raft must remain until arrival",
  );
  await page.setContent(scene(after, after, "mara"));
  assert.ok(
    (
      await page.locator('[data-giant="mara"]').getAttribute("aria-label")
    ).includes("5 Familien"),
  );
  assert.equal(await page.locator(".raft").count(), 4);
  assert.equal(
    await page.locator(".event-rescue").count(),
    1,
    "successful rescue remains visible after tide",
  );
  console.log(
    "movement retains prior population until arrival; rescue label visible after arrival",
  );
} finally {
  await browser.close();
}
