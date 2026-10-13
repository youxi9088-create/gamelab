// Developer smoke test. Uses the executor's pinned Playwright dependency.
const { chromium } = require("../executors/node_modules/playwright");
const fs = require("node:fs");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.platform === "win32" ? { channel: "msedge" } : {}),
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
  });
  const errors = [];
  await page.addInitScript(() => {
    if (window === window.top && localStorage.getItem("replica-demo") === null)
      localStorage.setItem("replica-demo", "true");
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(process.env.PLATFORM_URL || "http://127.0.0.1:8765");
  await page.waitForSelector(".gamecard");
  fs.mkdirSync("qa-output", { recursive: true });
  await page.screenshot({ path: "qa-output/overview.png", fullPage: true });
  for (const id of [
    "candidates",
    "library",
    "batches",
    "jobs",
    "reviews",
    "tools",
    "settings",
    "overview",
  ]) {
    await page.locator(`[data-nav="${id}"]`).first().click();
    assert(await page.locator("h1").isVisible(), id + " heading missing");
  }
  await page.locator('[data-nav="candidates"]').first().click();
  await page.screenshot({ path: "qa-output/candidates.png", fullPage: true });
  await page.locator("[data-detail]").first().click();
  await page.getByRole("button", { name: "代码与版本", exact: true }).click();
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await page.locator('[data-action="mode"]').click();
  await page.waitForFunction(() =>
    document.body.textContent.includes("本地工作空间"),
  );
  await page.locator('[data-nav="library"]').first().click();
  await page.waitForSelector("[data-play]");
  await page.locator(".gamecard").filter({ hasText: "系统自检" }).locator("[data-play]").first().click();
  await page.waitForSelector("iframe");
  const frame = page.frameLocator("iframe");
  await frame.locator("#game").waitFor();
  assert((await frame.locator("#score").innerText()).includes("0 / 10"));
  await page.screenshot({ path: "qa-output/live-play.png", fullPage: true });
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      routes: 8,
      js_errors: errors.length,
      real_playback: "passed",
    }),
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
