// 实际跑一遍运行包，收集真实发生的 404（含资源请求），用于回源补齐。
const path = require('path');
const { chromium } = require('../executors/node_modules/playwright');

const dir = process.argv[2];
const wait = Number(process.argv[3] || 25000);

(async () => {
  const http = require('http');
  const fs = require('fs');
  const types = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.mp3': 'audio/mpeg',
    '.css': 'text/css', '.bin': 'application/octet-stream', '.svg': 'image/svg+xml',
    '.ttf': 'font/ttf', '.woff': 'font/woff', '.atlas': 'text/plain', '.plist': 'text/xml' };
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const file = path.join(dir, rel);
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); res.end('missing'); return; }
      res.writeHead(200, { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream' });
      res.end(data);
    });
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + server.address().port;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 900, height: 640 } });
  const missing = [];
  page.on('response', r => { if (r.status() === 404) missing.push(new URL(r.url()).pathname); });
  await page.goto(base + '/index.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(wait);
  // 稍微交互一下，触发主界面/关卡资源
  await page.mouse.click(450, 400).catch(() => {});
  await page.waitForTimeout(Math.round(wait / 2));
  const canvas = await page.evaluate(() => document.querySelectorAll('canvas').length);
  console.log('canvas=' + canvas + ' | 404 数=' + missing.length);
  for (const m of [...new Set(missing)]) console.log('  404 ' + m);
  await browser.close();
  server.close();
})().catch(e => { console.error('FATAL ' + e.message); process.exit(1); });
