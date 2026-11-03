const { chromium } = require('../executors/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.platform === 'win32' ? { channel: 'msedge' } : {}),
  });
  const errors = [];
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem('replica-demo', 'true');
    localStorage.setItem('hero-motion-paused', 'false');
  });
  await page.goto(process.env.PLATFORM_URL || 'http://127.0.0.1:8765');
  await page.waitForSelector('.playground-hero .hero-balloon');
  assert.equal(await page.locator('.hero-pixels i').count(), 12);
  assert.equal(await page.locator('.hero-balloon').evaluate(el => getComputedStyle(el).animationName), 'balloon-float');
  assert.equal(await page.locator('.hero-water-sheen').evaluate(el => getComputedStyle(el).animationName), 'water-flow');

  const hero = page.locator('.playground-hero');
  const first = await hero.screenshot();
  await page.waitForTimeout(450);
  const second = await hero.screenshot();
  assert.equal(first.equals(second), false, 'hero animation should change rendered pixels');

  assert.equal(await page.locator('.simple-glow').evaluate(el => getComputedStyle(el).animationName), 'none');
  assert((await page.locator('.simple-glow').evaluate(el => getComputedStyle(el).backgroundImage)).includes('hero-nova-archipelago'));
  await page.mouse.move(1200, 240);
  await page.waitForTimeout(150);
  assert.equal(await hero.evaluate(el => getComputedStyle(el.querySelector('.hero-world')).transform), 'none');
  await page.locator('[data-motion-toggle]').click();
  assert.equal(await hero.getAttribute('data-motion'), 'paused');
  assert.equal(await page.locator('.hero-balloon').evaluate(el => getComputedStyle(el).animationPlayState), 'paused');
  assert.equal(await page.evaluate(() => localStorage.getItem('hero-motion-paused')), 'true');
  await page.locator('[data-motion-toggle]').click();
  assert.equal(await hero.getAttribute('data-motion'), 'running');

  fs.mkdirSync('qa-output', { recursive: true });
  await page.screenshot({ path: 'qa-output/hero-desktop.png', fullPage: false });

  await page.locator('[data-browse]').click();
  await page.waitForTimeout(350);
  assert.equal(await page.locator('#filter-query').evaluate(el => el === document.activeElement), true);
  await page.locator('.hero-actions [data-play]').click();
  await page.waitForSelector('.modal[role="dialog"]');
  assert((await page.locator('.modal[role="dialog"]').innerText()).includes('交互设计演示'));
  await page.getByRole('button', { name: '关闭', exact: true }).click();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mobile.on('pageerror', error => errors.push(error.message));
  await mobile.addInitScript(() => localStorage.setItem('replica-demo', 'true'));
  await mobile.goto(process.env.PLATFORM_URL || 'http://127.0.0.1:8765');
  await mobile.waitForSelector('.playground-hero .hero-balloon');
  assert.equal(await mobile.locator('.playground-hero').evaluate(el => getComputedStyle(el).height), '350px');
  assert.equal(await mobile.locator('.hero-sailboat').isVisible(), true);
  await mobile.screenshot({ path: 'qa-output/hero-mobile.png', fullPage: false });

  const reduced = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await reduced.addInitScript(() => localStorage.setItem('replica-demo', 'true'));
  await reduced.goto(process.env.PLATFORM_URL || 'http://127.0.0.1:8765');
  await reduced.waitForSelector('.playground-hero');
  assert.equal(await reduced.locator('.hero-pixels').isVisible(), false);
  assert.equal(await reduced.locator('[data-motion-toggle]').isVisible(), false);
  assert.equal(await reduced.locator('.hero-balloon').evaluate(el => getComputedStyle(el).animationName), 'none');

  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ hero: 'passed', desktop: true, mobile: true, reduced_motion: true, js_errors: errors.length }));
  await browser.close();
})().catch(error => {
  console.error(error);
  process.exit(1);
});
