const assert = require('node:assert/strict');
const browserOptions = require('../executors/browser-options.cjs');

const previous = process.env.BROWSER_EXECUTABLE;
try {
  delete process.env.BROWSER_EXECUTABLE;
  assert.deepEqual(browserOptions(), {headless:true}, 'Playwright default browser should be used unless explicitly overridden');
  process.env.BROWSER_EXECUTABLE = 'C:/GameLab/browser/chrome.exe';
  assert.deepEqual(browserOptions(), {headless:true, executablePath:'C:/GameLab/browser/chrome.exe'});
} finally {
  if (previous === undefined) delete process.env.BROWSER_EXECUTABLE;
  else process.env.BROWSER_EXECUTABLE = previous;
}
console.log('browser-options checks passed');
