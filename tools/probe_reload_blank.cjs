const path = require('path');
// 3D桌球：首次加载能玩，但玩法验证在"存档恢复"这步刷新后白屏。
// 本探针在同一 context 下先加载、再刷新，记录两边差异，定位白屏根因。
const { chromium } = require('../executors/node_modules/playwright');

const URL = process.argv[2];
const EDGE = process.env.EDGE_EXECUTABLE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

const SNAPSHOT = `(() => {
  const texts = [...document.querySelectorAll('*')]
    .filter(e => e.children.length === 0 && (e.textContent || '').trim())
    .map(e => (e.textContent || '').trim()).slice(0, 8);
  let painted = false;
  for (const c of document.querySelectorAll('canvas')) {
    try {
      const ctx = c.getContext('2d') || c.getContext('webgl');
      if (!ctx || !c.width) continue;
      if (ctx.getImageData) {
        const d = ctx.getImageData(0, 0, Math.min(c.width, 60), Math.min(c.height, 60)).data;
        for (let i = 3; i < d.length; i += 4) { if (d[i] !== 0) { painted = true; break; } }
      } else painted = true;
    } catch (e) {}
    if (painted) break;
  }
  return { canvas: document.querySelectorAll('canvas').length, painted, texts };
})()`;

async function observe(page, tag, waits) {
  for (const t of waits) {
    await page.waitForTimeout(t);
    const snap = await page.evaluate(SNAPSHOT);
    console.log(`${tag} +${t}ms`, JSON.stringify(snap, null, 0).slice(0, 260));
    if (snap.texts.length || snap.painted) return snap;
  }
  return null;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 900, height: 640 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e.message).split('\n')[0]));
  page.on('console', m => { if (m.type() === 'error') errors.push('[console] ' + m.text().slice(0, 140)); });

  console.log('=== 首次加载 ===');
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const first = await observe(page, 'first', [8000, 8000, 10000]);
  console.log('首次加载可玩:', !!(first && (first.texts.length || first.painted)), '| 报错', errors.length);

  // 制造一点存档变化，模拟玩法验证里"已通关/有进度"的状态
  await page.evaluate(() => { try { localStorage.setItem('probe-marker', '1'); } catch (e) {} });
  const ls1 = await page.evaluate(() => Object.keys(localStorage).length);

  console.log('\n=== 刷新（同一 context，保留 localStorage）===');
  errors.length = 0;
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  const second = await observe(page, 'reload', [8000, 10000, 20000, 30000]);
  console.log('刷新后可玩:', !!(second && (second.texts.length || second.painted)), '| 报错', errors.length);
  console.log('localStorage 键数 刷新前后:', ls1, '->', await page.evaluate(() => Object.keys(localStorage).length));
  console.log('刷新后报错明细:', JSON.stringify(errors.slice(0, 6), null, 0).slice(0, 500));

  await browser.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
