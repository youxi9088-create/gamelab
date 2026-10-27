// 真实 D1 验收：portal.mjs 原封不动，只把 D1 绑定换成直连 D1 REST API。
//
// 验证链路 = 真实部署代码 + 真实云端数据，只有执行位置从 Worker 换成 Node
// （workerd 在本机沙箱启动即 0xc0000005，跑不了 wrangler dev）。
// 重点验证 D1 侧的 json_remove / json_extract 与 SQLite 行为一致——
// 尤其是下推裁剪里新加的 report.engine / report.blocker。
//
// 运行：NODE_USE_ENV_PROXY=1 node tests/portal-state-remote.mjs
//       （沙箱只放行 api.cloudflare.com，需让 undici 走环境代理）
import { state as portalState } from '../portal.mjs';

const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const DATABASE = process.env.D1_DATABASE_ID || '1610b3f0-7a28-4270-b30b-fab183f92dbd';
const ENDPOINT = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/d1/database/${DATABASE}/query`;
if (!ACCOUNT || !TOKEN) {
  console.error('缺少 CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN');
  process.exit(2);
}

async function query(sql, params) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql, params }),
  });
  const body = await response.json();
  if (!body.success) throw new Error(`D1 查询失败: ${JSON.stringify(body.errors || body)}`);
  return (body.result || [{}])[0].results || [];
}

const env = {
  DB: {
    prepare(sql) {
      const params = [];
      return {
        bind(...values) { params.push(...values); return this; },
        async all() { return { results: await query(sql, params) }; },
        async first() { return (await query(sql, params))[0] ?? null; },
      };
    },
  },
};

const session = { user: { id: 'user-e9a1e8761318', username: 'preview-admin', role: 'admin', enabled: true } };
const publicUser = user => ({ id: user.id, username: user.username, role: user.role, enabled: user.enabled });

const started = Date.now();
const payload = await portalState(env, session, publicUser);
const elapsed = Date.now() - started;
const bytes = JSON.stringify(payload).length;
const dash = payload.dashboard_operations;

const checks = [];
const check = (name, ok, detail = '') => {
  checks.push(ok);
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

check('真实 D1 构建状态成功', Array.isArray(payload.candidates) && payload.candidates.length > 0,
  `${elapsed} ms · ${(bytes / 1048576).toFixed(2)} MB`);
check('游戏明细面板有数据', Array.isArray(dash?.games) && dash.games.length > 0, `${dash?.games?.length} 款`);
check('引擎标签已由 report.engine 补齐（Three.js 应出现）',
  dash.engines.some(e => e.name === 'Three.js'),
  dash.engines.map(e => `${e.name}:${e.games}`).join(' '));
check('阻断码已从 report.blocker 取回（非状态码兜底）',
  dash.failure_reasons.length > 0
  && !dash.failure_reasons.every(f => ['failed', 'blocked', 'waiting_input'].includes(f.code)),
  dash.failure_reasons.map(f => `${f.code}x${f.count}`).join(' ') || '无');
check('耗时统计存在闭合样本', dash.timing_complete > 0,
  `闭合 ${dash.timing_complete}/${dash.timing_measured} · 中位 ${dash.median_seconds} 秒`);
check('用量三个周期齐全', ['day', 'week', 'month'].every(p => payload.usage?.[p]?.length > 0),
  JSON.stringify(Object.fromEntries(['day', 'week', 'month'].map(p => [p, payload.usage?.[p]?.length]))));
check('事件仅回传最近若干条', payload.events.length === 150, `${payload.events.length} 条`);
check('不含 password_hash / lease_token',
  !JSON.stringify(payload).includes('password_hash') && !JSON.stringify(payload).includes('lease_token'));

const passed = checks.filter(Boolean).length;
console.log('\n%d/%d 通过 · %s ms · %s MB', passed, checks.length, elapsed, (bytes / 1048576).toFixed(2));
console.log(JSON.stringify({ passed, total: checks.length, ok: passed === checks.length,
  bytes, ms: elapsed, games: dash.games_count, calls: dash.calls, engines: dash.engines.length }));
process.exit(passed === checks.length ? 0 : 1);
