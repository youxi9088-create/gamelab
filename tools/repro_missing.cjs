// Reproduce the "Missing local runtime resources" verdict: serve the converted
// directory over http and list every request that comes back >= 400.
const path = require('path');
const http = require('http');
const fs = require('fs');
const { chromium } = require('playwright');

const root = path.resolve(process.argv[2] || '.');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.bin': 'application/octet-stream', '.mp3': 'audio/mpeg' };

const server = http.createServer((req, res) => {
  let p;
  try { p = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://local').pathname)); } catch { res.writeHead(400); return res.end(); }
  if (p === root) p = path.join(root, 'index.html');
  if (!p.startsWith(root + path.sep) || !fs.existsSync(p) || !fs.statSync(p).isFile()) { res.writeHead(404); return res.end(); }
  res.setHeader('Content-Type', mime[path.extname(p)] || 'application/octet-stream');
  res.end(fs.readFileSync(p));
});

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1000, height: 760 } });
  const bad = [];
  const errors = [];
  page.on('response', r => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url().replace(base, '/')}`); });
  page.on('requestfailed', r => bad.push(`FAILED ${r.url().replace(base, '/')} ${r.failure()?.errorText}`));
  page.on('pageerror', e => errors.push(String(e.message).slice(0, 300)));
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(12000);
  const canvas = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    return c ? { w: c.width, h: c.height } : null;
  });
  console.log('canvas:', JSON.stringify(canvas));
  console.log('=== 404 / failed (' + bad.length + ') ===');
  [...new Set(bad)].slice(0, 40).forEach(b => console.log('  ' + b));
  console.log('=== page errors (' + errors.length + ') ===');
  [...new Set(errors)].slice(0, 10).forEach(e => console.log('  ' + e));
  await browser.close();
  server.close();
})();
