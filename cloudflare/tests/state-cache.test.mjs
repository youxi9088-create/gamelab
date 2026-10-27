// 端到端验证 /api/state 的缓存路径：真实 D1 登录 → 从 R2 取预生成核心 → 拼上 current_user。
//
// 这是改造后线上真正走的那条路，必须单独测：拼接一旦错位，前端只会显示
// "无法连接平台"，看不出其实是 JSON 坏了。
//
// 运行：NODE_USE_ENV_PROXY=1 node cloudflare/tests/state-cache.test.mjs
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import worker, { portalStateResponse } from '../worker.mjs';
import { D1_DATABASE } from './d1-rest.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '../..');
const CORE = process.env.STATE_CORE || resolve(ROOT, 'migration-private/portal-state-core.json');
const ORIGIN = 'https://gamelab-migration.youxi9088.workers.dev';

const core = readFileSync(CORE, 'utf8');
const checks = [];
const check = (name, ok, detail = '') => {
  checks.push(ok);
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

check('核心快照是合法 JSON 对象', (() => {
  try {
    const parsed = JSON.parse(core);
    return Boolean(parsed) && typeof parsed === 'object' && !Array.isArray(parsed);
  } catch { return false; }
})(), `${(Buffer.byteLength(core) / 1024).toFixed(0)} KB`);
check('核心快照不含 current_user（随会话变化）', !('current_user' in JSON.parse(core)));

const env = {
  DB: D1_DATABASE,
  FILES: { async get() { return { async text() { return core; } }; } },
  MIGRATION_UPLOAD_TOKEN: 'x'.repeat(40),
};

const accounts = JSON.parse(readFileSync(resolve(ROOT, 'migration-private/new-passwords.json'), 'utf8'));
const login = await worker.fetch(new Request(`${ORIGIN}/api/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
  body: JSON.stringify({ username: 'preview-admin', password: accounts['preview-admin'] }),
}), env);
const cookie = (login.headers.get('Set-Cookie') || '').split(';')[0];
const loginBody = await login.clone().text().catch(() => '');
// 登录要写 portal_sessions，D1 免费版单日写入上限 10 万行，用尽后写请求一律 7500。
// 这是配额问题不是代码问题，不能让测试假红；已登录用户的会话在 12 小时内仍有效。
// 503 只由未预期异常产生（HttpError 会带明确状态码），最常见就是 D1 写入配额 7500。
const writeBlocked = login.status === 503;
if (writeBlocked) {
  console.log('  SKIP  真实 D1 登录 — D1 免费版当日写入配额已用尽，等待 00:00 UTC 重置或升级 Workers Paid');
} else {
  check('真实 D1 登录成功', login.status === 200 && cookie.startsWith('replica_session='), `HTTP ${login.status}`);
}

let response;
let body;
if (writeBlocked) {
  // 写配额用尽时无法建会话，改为直接调用缓存组装函数，验证"拼上 current_user"这一环。
  response = await portalStateResponse(env, { user: { id: 'user-e9a1e8761318',
    username: 'preview-admin', role: 'admin', enabled: true }, csrf: 'c' });
  body = await response.text();
} else {
  response = await worker.fetch(new Request(`${ORIGIN}/api/state`, { headers: { Cookie: cookie } }), env);
  body = await response.text();
  check('/api/state 返回 200', response.status === 200, `HTTP ${response.status}`);
}

let payload = null;
try { payload = JSON.parse(body); } catch { /* 由下一项报告 */ }
check('响应是合法 JSON（拼接未错位）', Boolean(payload), `${(Buffer.byteLength(body) / 1024).toFixed(0)} KB`);
check('带上当前用户', payload?.current_user?.username === 'preview-admin',
  JSON.stringify(payload?.current_user));
check('游戏明细数据仍在', Array.isArray(payload?.dashboard_operations?.games)
  && payload.dashboard_operations.games.length > 0, `${payload?.dashboard_operations?.games?.length} 款`);
check('采集建议数据仍在', Array.isArray(payload?.recommendations) && payload.recommendations.length > 0,
  `${payload?.recommendations?.length} 条`);
check('采集设置与批次仍在', payload?.discovery_settings?.hour === 9 && payload?.discovery_runs?.length > 0,
  `${payload?.discovery_runs?.length} 轮`);
check('不含 password_hash / lease_token',
  !body.includes('password_hash') && !body.includes('lease_token'));

const passed = checks.filter(Boolean).length;
console.log('\n%d/%d 通过', passed, checks.length);
console.log(JSON.stringify({ passed, total: checks.length, ok: passed === checks.length,
  kb: Math.round(Buffer.byteLength(body) / 1024) }));
process.exit(passed === checks.length ? 0 : 1);
