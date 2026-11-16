import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const failures = [];
try {
  await page.goto("http://127.0.0.1:3000");
  await page
    .getByRole("button", { name: "Die Reise beginnen", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Ivo auswählen", exact: true })
    .click();
  await page.locator('[data-giant="mara"] .creature').click();
  await page.keyboard.press("2");
  try {
    assert.equal(
      await page
        .getByRole("button", { name: "Ivo auswählen", exact: true })
        .getAttribute("aria-pressed"),
      "true",
      "keyboard shortcuts must survive pointer selection",
    );
  } catch (e) {
    failures.push(e.message);
  }
  await page.getByRole("button", { name: "Neustart", exact: true }).click();
  await page.locator('[data-mode="sprint"]').click();
  await page
    .getByRole("button", { name: "Die Tide kommt", exact: false })
    .click();
  await page.waitForFunction(
    () => document.querySelector("#app").dataset.tide === "1",
  );
  await page
    .getByRole("button", { name: "Ivo auswählen", exact: true })
    .click();
  await page.locator('[data-mode="sprint"]').click();
  assert.equal(
    await page.locator("#forecast").getAttribute("class"),
    "warning",
    "fixture starts with real reef danger",
  );
  await page.getByRole("slider").press("Home");
  try {
    assert.equal(
      await page.locator("#forecast").getAttribute("class"),
      "",
      "safe slider course must clear obsolete danger styling",
    );
  } catch (e) {
    failures.push(e.message);
  }
  assert.deepEqual(failures, []);
  console.log(
    "mixed pointer/keyboard shortcuts and slider danger styling: pass",
  );
} finally {
  await browser.close();
}
