// Run the converted game offline and capture screenshots over time to see
// whether it actually reaches the main menu or stalls at Splash.
const path = require('path');
const http = require('http');
const fs = require('fs');
const { chromium } = require('playwright');

const root = path.resolve(process.argv[2] || '.');
const out = path.resolve(process.argv[3] || './shots');
fs.mkdirSync(out, { recursive: true });
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.wasm': 'application/wasm', '.png': 'image/png' };
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
  const missing = new Set();
  page.on('response', r => { if (r.status() >= 400) missing.add(`${r.status()} ${r.url().replace(base, '/')}`); });
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  const marks = [10, 20, 30, 40];
  let elapsed = 0;
  for (const m of marks) {
    await page.waitForTimeout((m - elapsed) * 1000);
    elapsed = m;
    await page.screenshot({ path: path.join(out, `t${m}.png`) });
    const text = await page.evaluate(() => document.body.innerText.slice(0, 120)).catch(() => '');
    console.log(`t=${m}s bodyText=${JSON.stringify(text)}`);
  }
  console.log('=== 本地 404 (' + missing.size + ') ===');
  [...missing].slice(0, 30).forEach(x => console.log('  ' + x));
  await browser.close();
  server.close();
})();
