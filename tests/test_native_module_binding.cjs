const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('../executors/node_modules/playwright');

(async () => {
  const root = path.resolve(process.argv[2], 'converted');
  const browser = await chromium.launch(require('../executors/browser-options.cjs')());
  const external = [];
  try {
    const page = await browser.newPage();
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin !== 'https://replica-runtime.invalid') {
        external.push(url.href);
        return route.abort();
      }
      const file = path.resolve(root, '.' + (url.pathname === '/' ? '/index.html' : url.pathname));
      assert.ok(file.startsWith(root + path.sep));
      await route.fulfill({body: fs.readFileSync(file), contentType: file.endsWith('.html') ? 'text/html' : 'text/javascript'});
    });
    await page.goto('https://replica-runtime.invalid/');
    await page.waitForFunction(() => document.querySelector('h1').textContent === 'Local dependency ready');
    assert.deepEqual(external, []);
    console.log('Native dynamic import loaded the captured module without external requests');
  } finally {
    await browser.close();
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
