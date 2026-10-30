const assert = require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'browser-options-'));
const config=path.join(fixture,'runtime.json');
const browserOptions = engine=>require('../executors/browser-options.cjs')(engine,config);

const previous = process.env.BROWSER_EXECUTABLE;
const previousRuffle=process.env.RUFFLE_BROWSER_EXECUTABLE;
const previousHeadless=process.env.BROWSER_HEADLESS;
try {
  delete process.env.BROWSER_EXECUTABLE;
  delete process.env.BROWSER_HEADLESS;
  assert.deepEqual(browserOptions(), {headless:true}, 'Playwright default browser should be used unless explicitly overridden');
  process.env.BROWSER_EXECUTABLE = 'C:/GameLab/browser/chrome.exe';
  assert.deepEqual(browserOptions(), {headless:true, executablePath:'C:/GameLab/browser/chrome.exe'});
  process.env.BROWSER_HEADLESS='0';
  assert.deepEqual(browserOptions(), {headless:false, executablePath:'C:/GameLab/browser/chrome.exe'});
  process.env.RUFFLE_BROWSER_EXECUTABLE='C:/Explicit/Chrome/chrome.exe';
  assert.deepEqual(browserOptions('ruffle'), {headless:false, executablePath:'C:/Explicit/Chrome/chrome.exe',args:['--enable-unsafe-swiftshader']});
  assert.deepEqual(browserOptions('cocos3'), {headless:false, executablePath:'C:/GameLab/browser/chrome.exe'});
  delete process.env.BROWSER_EXECUTABLE;
  delete process.env.BROWSER_HEADLESS;
  assert.deepEqual(browserOptions('cocos2'), {headless:true});
  delete process.env.RUFFLE_BROWSER_EXECUTABLE;
  assert.deepEqual(browserOptions('ruffle'), {headless:true});
  fs.writeFileSync(config,JSON.stringify({headless:false,executablePath:'C:/Native/chrome.exe'}));
  assert.deepEqual(browserOptions(),{headless:false,executablePath:'C:/Native/chrome.exe'});
  process.env.BROWSER_HEADLESS='true';
  process.env.BROWSER_EXECUTABLE='C:/Override/chrome.exe';
  assert.deepEqual(browserOptions(),{headless:true,executablePath:'C:/Override/chrome.exe'});
} finally {
  fs.rmSync(fixture,{recursive:true,force:true});
  if (previous === undefined) delete process.env.BROWSER_EXECUTABLE;
  else process.env.BROWSER_EXECUTABLE = previous;
  if(previousRuffle===undefined)delete process.env.RUFFLE_BROWSER_EXECUTABLE;
  else process.env.RUFFLE_BROWSER_EXECUTABLE=previousRuffle;
  if(previousHeadless===undefined)delete process.env.BROWSER_HEADLESS;
  else process.env.BROWSER_HEADLESS=previousHeadless;
}
console.log('browser-options checks passed');
