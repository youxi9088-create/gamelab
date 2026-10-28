// 用本机真实 Chrome（非 Playwright 的 headless shell）渲染运行包并取证。
// 用法: node tools/render_with_local_chrome.cjs <运行包目录> [等待毫秒] [headless|windowed]
const path = require('path');
const fs = require('fs');
const http = require('http');
const { chromium } = require('../executors/node_modules/playwright');

const dir = process.argv[2];
const wait = Number(process.argv[3] || 25000);
const mode = process.argv[4] || 'windowed';

const CANDIDATES = [
  'C:/Users/Administrator/AppData/Local/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
];

const TYPES = {
  '.html': 'text/html', '.js': 'application/javascript', '.mjs': 'application/javascript',
  '.wasm': 'application/wasm', '.json': 'application/json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.gif': 'image/gif', '.mp3': 'audio/mpeg', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.swf': 'application/x-shockwave-flash', '.bin': 'application/octet-stream',
};

(async () => {
  const executablePath = CANDIDATES.find(p => fs.existsSync(p));
  if (!executablePath) { console.error('未找到本机 Chrome'); process.exit(2); }
  console.log('Chrome:', executablePath, '| 模式:', mode);

  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const file = path.join(dir, rel);
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); res.end('missing'); return; }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream' });
      res.end(data);
    });
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + server.address().port;

  const browser = await chromium.launch({
    executablePath,
    headless: mode === 'headless',
    args: ['--no-first-run', '--no-default-browser-check', '--enable-unsafe-swiftshader',
           '--autoplay-policy=no-user-gesture-required'],
  });
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  const errors = [];
  const webgl = [];
  page.on('console', m => {
    const text = m.text();
    if (/INVALID_ENUM|GPU stall|too many errors/.test(text)) { webgl.push(text.slice(0, 120)); return; }
    if (m.type() === 'error' || /error|failed/i.test(text)) errors.push(m.type() + ': ' + text.slice(0, 240));
  });
  page.on('pageerror', e => errors.push('pageerror: ' + String(e).slice(0, 300)));
  page.on('requestfailed', r => errors.push('reqfail: ' + r.url().slice(0, 120) + ' ' + (r.failure() || {}).errorText));
  const missing = [];
  page.on('response', r => { if (r.status() >= 400) missing.push(r.status() + ' ' + new URL(r.url()).pathname); });

  await page.goto(base + '/index.html', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(wait);

  let state = null;
  try {
    state = await page.evaluate(() => {
      const player = document.querySelector('ruffle-player');
      const root = player && player.shadowRoot;
      const canvas = root ? root.querySelector('canvas') : null;
      return {
        rufflePlayer: !!player,
        shadowCanvas: !!canvas,
        canvasSize: canvas ? [canvas.width, canvas.height] : null,
        loaded: window.gameLoaded === true,
        loadError: window.gameLoadError || null,
        bodyCanvas: document.querySelectorAll('canvas').length,
      };
    });
  } catch (exc) { state = { evaluateFailed: String(exc).slice(0, 200) }; }

  const shot = path.join(process.cwd(), 'data/reports/local-chrome-render.png');
  try { await page.screenshot({ path: shot }); } catch (exc) { console.log('截图失败:', String(exc).slice(0, 120)); }

  console.log('页面状态:', JSON.stringify(state));
  console.log('WebGL 噪声条数:', webgl.length);
  console.log('错误:', errors.length ? JSON.stringify(errors.slice(0, 8), null, 1) : '无');
  console.log('HTTP>=400:', missing.length ? JSON.stringify([...new Set(missing)].slice(0, 10), null, 1) : '无');
  console.log('截图:', shot);
  await browser.close();
  server.close();
})().catch(e => { console.error('失败:', String(e).slice(0, 400)); process.exit(1); });
