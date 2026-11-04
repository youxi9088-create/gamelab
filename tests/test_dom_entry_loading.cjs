const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {chromium} = require('../executors/node_modules/playwright');
const {probe} = require('../executors/dom-entry.cjs');

(async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'dom-entry-loading-'));
  const launch = chromium.launch;
  const browser = await launch.call(chromium, require('../executors/browser-options.cjs')());
  const newContext = browser.newContext.bind(browser);
  let deferredLoaded = false;
  browser.newContext = async options => {
    const context = await newContext(options);
    const newPage = context.newPage.bind(context);
    context.newPage = async () => {
      const page = await newPage();
      await page.route('https://dom-fixture.example/**', async route => {
        if (route.request().url().endsWith('/deferred.js')) {
          await new Promise(resolve => setTimeout(resolve, 10000));
          deferredLoaded = true;
          await route.fulfill({contentType: 'text/javascript', body: ''}).catch(() => {});
          return;
        }
        await route.fulfill({contentType: 'text/html', body:
          '<h1>Choose a character</h1><button aria-label="Launch the first round" onclick="this.textContent=\'Next turn\';document.querySelector(\'h1\').textContent=\'Adventure started\'">Begin</button><script defer src="/deferred.js"></script>'});
      });
      return page;
    };
    return context;
  };
  chromium.launch = async () => browser;
  try {
    const proof = await probe('https://dom-fixture.example/game', 'Begin', directory);
    assert.equal(proof.passed, true);
    assert.equal(deferredLoaded, false);
    assert.match(proof.after.text, /Adventure started/);
    console.log(JSON.stringify({passed: true, screenshot: path.join(directory, 'after.png')}));
  } finally {
    chromium.launch = launch;
    await browser.close();
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
