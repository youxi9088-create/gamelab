// 用 node:sqlite 驱动真实迁移库，验证 portal.mjs 的只读状态构建。
// 目的有两个：确认字段裁剪正确（不外泄哈希/租约），以及量出响应体积——
// 体积直接决定 Workers Free 10ms CPU 是否扛得住。
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { state as portalState, slim } from '../portal.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(here, '../../migration-private/platform.migration.sqlite3');
const db = new DatabaseSync(dbPath, { readOnly: true });

const env = {
  DB: {
    prepare(sql) {
      const params = [];
      return {
        bind(...values) { params.push(...values); return this; },
        async all() {
          const statement = db.prepare(sql);
          return { results: params.length ? statement.all(...params) : statement.all() };
        },
        async first() {
          const statement = db.prepare(sql);
          return (params.length ? statement.all(...params) : statement.all())[0] ?? null;
        },
      };
    },
  },
};

const session = { user: { id: 'user-e9a1e8761318', username: 'preview-admin', role: 'admin', enabled: true } };
const publicUser = user => ({ id: user.id, username: user.username, role: user.role, enabled: user.enabled });

const started = Date.now();
const payload = await portalState(env, session, publicUser);
const elapsed = Date.now() - started;
const body = JSON.stringify(payload);

const checks = [];
const check = (name, ok, detail = '') => {
  checks.push([name, ok, detail]);
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

check('构建成功且不抛错', true, `${elapsed} ms`);
check('包含前端所需集合',
  ['candidates', 'versions', 'jobs', 'events', 'messages'].every(k => Array.isArray(payload[k])));
check('响应体积可控 (<4 MB)', body.length < 4 * 1024 * 1024, `${(body.length / 1048576).toFixed(2)} MB`);
check('不含 password_hash', !body.includes('password_hash'));
check('不含 lease_token', !body.includes('lease_token'));
check('不暴露 users 集合', !('users' in payload));
check('版本带预览地址', payload.versions.every(v => typeof v.preview_url === 'string' || v.preview_url === null),
  `示例 ${payload.versions[0]?.preview_url}`);
check('通过版本可播（有 artifact_id）',
  payload.versions.filter(v => ['approved', 'published'].includes(v.status)).every(v => Boolean(v.artifact_id)));
check('当前用户已脱敏', payload.current_user && !('password_hash' in payload.current_user),
  JSON.stringify(payload.current_user));
check('裁剪函数移除超大字段',
  Object.keys(slim({ keep: 'x', huge: 'y'.repeat(200000) }, 'candidates')).join(',') === 'keep');
check('report 只留必要键', (() => {
  const trimmed = slim({ report: { path: 'A', auto_repair: { big: true }, game_spec: { category: 'x' } } }, 'versions');
  return trimmed.report && 'game_spec' in trimmed.report && !('auto_repair' in trimmed.report);
})());

const counts = Object.fromEntries(Object.entries(payload)
  .filter(([, v]) => Array.isArray(v)).map(([k, v]) => [k, v.length]));
console.log('\n集合规模:', JSON.stringify(counts));
console.log('响应体积: %s MB', (body.length / 1048576).toFixed(2));

const passed = checks.filter(([, ok]) => ok).length;
console.log('\n%d/%d 通过', passed, checks.length);
console.log(JSON.stringify({ passed, total: checks.length, ok: passed === checks.length, bytes: body.length, ms: elapsed, counts }));
process.exit(passed === checks.length ? 0 : 1);
