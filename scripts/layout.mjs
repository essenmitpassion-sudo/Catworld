import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
try {
  for (const width of [320, 390, 768, 1440]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      reducedMotion: "reduce",
    });
    await page.goto("http://127.0.0.1:3000");
    await page
      .getByRole("button", { name: "Die Reise beginnen", exact: true })
      .click();
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `document overflows at ${width}`,
    );
    for (const name of ["Mara auswählen", "Ivo auswählen", "Nemi auswählen"])
      assert.ok(
        (await page.getByRole("button", { name, exact: true }).boundingBox())
          .width >= 30,
      );
    await page.screenshot({ path: `work/width-${width}.png`, fullPage: true });
    await page.close();
  }
  console.log("320/390/768/1440: no overflow, selection controls reachable");
} finally {
  await browser.close();
}
