// 判定 17yoo playbox 入口到底是什么引擎：只看首屏 HTML 不够（加载器由 SDK 动态注入），
// 实际跑一遍，把加载到的脚本和资源列出来。
const path = require('path');
const { chromium } = require('../executors/node_modules/playwright');
const url = process.argv[2];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 900, height: 640 } });
  const seen = [];
  page.on('request', r => seen.push(r.url()));
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(20000);
  const unity = seen.filter(u => /unity|Build\/|\.loader\.js|framework\.js|wasm|data\.unityweb|\.data\b/i.test(u));
  const canvas = await page.evaluate(() => document.querySelectorAll('canvas').length);
  const lib = await page.evaluate(() => {
    const t = document.documentElement.innerHTML;
    return ['UnityLoader', 'unityInstance', 'createUnityInstance', 'unityFramework', 'Module.ccall']
      .filter(k => t.includes(k));
  });
  console.log('请求总数', seen.length, '| canvas', canvas);
  console.log('全局 Unity 痕迹:', JSON.stringify(lib));
  console.log('Unity 相关请求（前 12）:');
  for (const u of [...new Set(unity)].slice(0, 12)) console.log('   ' + u.slice(0, 130));
  console.log('全部脚本（前 12）:');
  for (const u of [...new Set(seen.filter(u => /\.js|\.wasm|\.data|\.json/i.test(u)))].slice(0, 12)) console.log('   ' + u.slice(0, 130));
  await browser.close();
})().catch(e => { console.error('FATAL ' + e.message); process.exit(1); });
