const assert = require('node:assert/strict');
const browserOptions = require('../executors/browser-options.cjs');

const previous = process.env.BROWSER_EXECUTABLE;
const previousRuffle=process.env.RUFFLE_BROWSER_EXECUTABLE;
try {
  delete process.env.BROWSER_EXECUTABLE;
  assert.deepEqual(browserOptions(), {headless:true}, 'Playwright default browser should be used unless explicitly overridden');
  process.env.BROWSER_EXECUTABLE = 'C:/GameLab/browser/chrome.exe';
  assert.deepEqual(browserOptions(), {headless:true, executablePath:'C:/GameLab/browser/chrome.exe'});
  process.env.RUFFLE_BROWSER_EXECUTABLE='C:/Explicit/Chrome/chrome.exe';
  assert.deepEqual(browserOptions('ruffle'), {headless:true, executablePath:'C:/Explicit/Chrome/chrome.exe',args:['--enable-unsafe-swiftshader']});
  assert.deepEqual(browserOptions('cocos3'), {headless:true, executablePath:'C:/GameLab/browser/chrome.exe'});
  delete process.env.BROWSER_EXECUTABLE;
  assert.deepEqual(browserOptions('cocos2'), {headless:true});
  delete process.env.RUFFLE_BROWSER_EXECUTABLE;
  assert.deepEqual(browserOptions('ruffle'), {headless:true});
} finally {
  if (previous === undefined) delete process.env.BROWSER_EXECUTABLE;
  else process.env.BROWSER_EXECUTABLE = previous;
  if(previousRuffle===undefined)delete process.env.RUFFLE_BROWSER_EXECUTABLE;
  else process.env.RUFFLE_BROWSER_EXECUTABLE=previousRuffle;
}
console.log('browser-options checks passed');
