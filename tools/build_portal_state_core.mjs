// 从真实 D1 生成门户状态核心 JSON（不含 current_user），供 Worker 直接从 R2 吐出。
//
// 为什么预生成：/api/state 每次现算要 15 次 D1 查询 + 解析 + 序列化约 730 KB，
// 在 Workers Free 10 ms CPU 下必然偶发 1102。数据只在同步时变，预生成后 CPU 几乎为 0。
//
// 运行：NODE_USE_ENV_PROXY=1 node tools/build_portal_state_core.mjs <输出文件>
import { writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { D1_DATABASE } from '../cloudflare/tests/d1-rest.mjs';
import { state as portalState } from '../cloudflare/portal.mjs';

const output = process.argv[2];
if (!output) {
  console.error('用法: node tools/build_portal_state_core.mjs <输出文件>');
  process.exit(2);
}

// current_user 随会话变化，不能进缓存；Worker 会在返回时补上。
const session = { user: { id: '', username: '', role: '', enabled: true } };
const inputs = {};
let payload = await portalState({ DB: D1_DATABASE }, session, user => user, inputs);
if (!process.env.GAMELAB_SOURCE_ROOT || !process.env.GAMELAB_PYTHON) throw new Error('Shared source root and Python runtime are required');
const calculated = spawnSync(process.env.GAMELAB_PYTHON,
  [resolve(process.env.GAMELAB_SOURCE_ROOT, 'tools/build_cloud_statistics.py')],
  { input: JSON.stringify({state: payload, inputs}), encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 });
if (calculated.status !== 0) throw new Error('Shared cloud statistics failed: ' + calculated.stderr.slice(-1500));
payload = JSON.parse(calculated.stdout);
delete payload.current_user;
payload.state_generated_at = new Date().toISOString();

writeFileSync(output, JSON.stringify(payload), 'utf8');
const body = JSON.stringify(payload);
console.log(JSON.stringify({
  output,
  bytes: body.length,
  candidates: payload.candidates.length,
  recommendations: payload.recommendations.length,
  games: payload.dashboard_operations?.games_count,
}));
