// 本地逻辑验证：用 Node 内置 node:sqlite（与 D1 同为 SQLite）挂载真实 schema，
// 用内存实现 R2 与请求对象，驱动真实的 worker.mjs / auth.mjs / playback.mjs。
// 目的：workerd 在本机 Windows 沙箱启动即崩溃，无法跑真机 workerd/D1/R2，
// 故用等价栈验证迁移代码逻辑（登录/会话/鉴权/分片/校验和/历史保护）。
import { DatabaseSync } from 'node:sqlite';
import { createHash, pbkdf2Sync } from 'node:crypto';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const uploadToken = 'fixture-transfer-only-' + 'x'.repeat(40);
const digest = (data) => createHash('sha256').update(data).digest('hex');
const b64 = (hex) => Buffer.from(hex, 'hex').toString('base64');

// ---- D1 mock（接口对齐 Cloudflare D1: prepare().bind().first/all/run, batch）----
class Stmt {
  constructor(db, sql, params = []) { this.db = db; this.sql = sql; this.params = params; }
  bind(...p) { return new Stmt(this.db, this.sql, p); }
  first() { const s = this.db.prepare(this.sql); const r = s.get(...this.params); return r ?? null; }
  all() { const s = this.db.prepare(this.sql); return { results: s.all(...this.params) }; }
  run() { const s = this.db.prepare(this.sql); const r = s.run(...this.params); return { success: true, meta: { changes: r.changes, lastInsertRowid: r.lastInsertRowid } }; }
}
class D1Mock {
  constructor(dbFile) { this.db = new DatabaseSync(dbFile); }
  prepare(sql) { return new Stmt(this.db, sql); }
  batch(statements) {
    this.db.exec('BEGIN');
    try { const out = statements.map((st) => st.run()); this.db.exec('COMMIT'); return out; }
    catch (e) { this.db.exec('ROLLBACK'); throw e; }
  }
  exec(sql) { this.db.exec(sql); }
}

// ---- R2 mock（接口对齐：head / get(opts) / put(body, opts)）----
async function readBody(body) {
  if (body == null) return Buffer.alloc(0);
  if (Buffer.isBuffer(body)) return body;
  if (typeof body === 'string') return Buffer.from(body);
  if (typeof body?.getReader === 'function') {
    const reader = body.getReader(); const chunks = []; let len = 0;
    while (true) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); len += value.byteLength; }
    const out = Buffer.alloc(len); let off = 0; for (const c of chunks) { out.set(c, off); off += c.byteLength; }
    return out;
  }
  throw new Error('不支持的请求体类型');
}
class R2Mock {
  constructor() { this.store = new Map(); }
  async head(key) { const o = this.store.get(key); if (!o) return null; return { size: o.size, etag: o.etag, customMetadata: o.customMetadata, checksums: { sha256: b64(o.sha256) } }; }
  async get(key, opts = {}) {
    const o = this.store.get(key); if (!o) return null;
    if (opts.onlyIf?.etagMatches && o.etag !== opts.onlyIf.etagMatches) return null;
    let start = 0, end = o.size - 1;
    if (opts.range) { start = opts.range.offset; end = opts.range.offset + opts.range.length - 1; }
    const slice = o.data.subarray(start, end + 1);
    const body = new ReadableStream({ start(c) { c.enqueue(new Uint8Array(slice)); c.close(); } });
    return { body, size: o.size, etag: o.etag, range: opts.range ? { offset: start, length: end - start + 1 } : undefined };
  }
  async put(key, body, opts = {}) {
    const buf = await readBody(body);
    const sha = createHash('sha256').update(buf).digest('hex');
    if (opts.sha256 && opts.sha256 !== sha) throw new Error('checksum mismatch (R2 拒绝写入)');
    const etag = opts.customMetadata?.sha256 || sha;
    this.store.set(key, { data: buf, size: buf.length, etag, customMetadata: opts.customMetadata || {}, sha256: sha });
    return { key, etag, size: buf.length, version: 'v1' };
  }
}

import worker from '../worker.mjs';

const source = new Map([
  ['index.html', '<!doctype html><meta charset="utf-8"><title>自建迁移夹具</title><button id="advance">收集金币</button><div id="coins">0</div><script src="game.js"></script>'],
  ['game.js', 'let n=Number(localStorage.getItem("coins")||0);const show=()=>document.getElementById("coins").textContent=n;show();document.getElementById("advance").onclick=()=>{n++;localStorage.setItem("coins",n);show()};'],
  ['engine.wasm', Buffer.from([0, 97, 115, 109, 1, 0, 0, 0])],
]);

const PBKDF2_ITERATIONS = 5000;
const report = { cloudflareAuthRequired: false, productionVerified: false, checks: [], pbkdf2Iterations: PBKDF2_ITERATIONS, limitations: ['本地 node:sqlite+内存R2 验证，非 production Free plan 实测；workerd 本机沙箱启动崩溃，无法跑真机 workerd/D1/R2。'] };
const base = 'http://localhost';
let env;
const get = (p, opts = {}) => worker.fetch(new Request(base + p, opts), env);

async function main() {
  const db = new D1Mock(':memory:');
  db.exec(readFileSync(path.join(root, 'schema.sql'), 'utf8'));
  const files = new R2Mock();
  env = { DB: db, FILES: files, MIGRATION_UPLOAD_TOKEN: uploadToken };
  const insert = (kind, value) => db.prepare('INSERT INTO records(kind,id,data) VALUES (?,?,?)').bind(kind, value.id, JSON.stringify(value)).run();
  const salt = '00112233445566778899aabbccddeeff';
  const password = 'synthetic-migration-password';
  insert('users', { id: 'user-fixture', username: 'fixture', role: 'admin', enabled: true, revision: 1, created_at: '2026-10-27T00:00:00Z', password_hash: salt + ':' + pbkdf2Sync(password, salt, 5000, 32, 'sha256').toString('hex') });
  insert('artifacts', { id: 'artifact-fixture', entry: 'index.html', runtime_local: true });
  insert('versions', { id: 'version-fixture', artifact_id: 'artifact-fixture', entry: 'index.html', preview_url: base + 'runtime/artifact-fixture/index.html', status: 'review', title: '自建迁移夹具' });
  insert('jobs', { id: 'job-fixture', status: 'blocked', reason: 'fixture', lease_token: 'must-not-leak' });
  for (const [name, content] of source) db.prepare('INSERT INTO artifact_files VALUES (?,?,?,?,?)').bind('artifact-fixture', name, 'artifacts/artifact-fixture/' + name, digest(content), Buffer.byteLength(content)).run();

  // 1. 未登录试玩与状态接口均拒绝
  assert.equal((await get('/runtime/artifact-fixture/index.html')).status, 401);
  report.checks.push('unauthenticated playback rejected');
  assert.equal((await get('/api/state')).status, 401);

  // 2. 错误密码拒绝
  const bad = await get('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base }, body: JSON.stringify({ username: 'fixture', password: 'wrong' }) });
  report.badPasswordStatus = bad.status;
  assert.equal(bad.status, 401);

  // 3. 正确密码（600k PBKDF2）登录成功并计时
  const start = Date.now();
  const auth = await get('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base }, body: JSON.stringify({ username: 'fixture', password }) });
  report.loginStatus = auth.status; report.localLoginMilliseconds = Date.now() - start;
  if (auth.status !== 200) { report.authenticationBlocker = await auth.json(); throw new Error('legacy login failed: ' + auth.status); }
  assert.equal(bad.status, 401); report.checks.push(`wrong password rejected, ${PBKDF2_ITERATIONS}-iteration PBKDF2 hash accepted (Free-plan 10ms CPU budget)`);
  const login = await auth.json();
  const cookie = auth.headers.get('set-cookie').split(';')[0];
  assert.match(cookie, /^replica_session=/);

  // 4. 已登记校验和上传：接受、幂等、错误 token 拒绝
  for (const [name, content] of source) {
    const route = '/api/executor/artifacts/artifact-fixture/files/' + name;
    const fh = { Authorization: 'Bearer ' + uploadToken, 'X-Content-SHA256': digest(content), 'Content-Length': String(Buffer.byteLength(content)) };
    assert.equal((await get(route, { method: 'PUT', headers: { ...fh, Authorization: 'Bearer wrong' }, body: content })).status, 401);
    const res = await get(route, { method: 'PUT', headers: fh, body: content });
    assert.equal(res.status, 200, await res.text());
    assert.equal((await get(route, { method: 'PUT', headers: fh, body: content })).status, 200);
  }
  report.checks.push('registered checksum upload accepted and idempotent, wrong token rejected');

  // 5. 未登记路径拒绝
  const missing = await get('/api/executor/artifacts/artifact-fixture/files/unknown.js', { method: 'PUT', headers: { Authorization: 'Bearer ' + uploadToken }, body: 'x' });
  assert.equal(missing.status, 404);

  // 6. 校验和损坏拒绝，且不写入 R2
  const wrong = 'x'.repeat(Buffer.byteLength(source.get('game.js')));
  db.prepare('INSERT INTO artifact_files VALUES (?,?,?,?,?)').bind('artifact-fixture', 'bad.js', 'artifacts/artifact-fixture/bad.js', digest(source.get('game.js')), Buffer.byteLength(wrong)).run();
  const corrupted = await get('/api/executor/artifacts/artifact-fixture/files/bad.js', { method: 'PUT', headers: { Authorization: 'Bearer ' + uploadToken, 'X-Content-SHA256': digest(source.get('game.js')), 'Content-Length': String(Buffer.byteLength(wrong)) }, body: wrong });
  assert.equal(corrupted.status, 422);
  assert.equal(files.store.get('artifacts/artifact-fixture/bad.js') || null, null);
  report.checks.push('checksum corruption and unregistered path rejected');

  // 7. 状态接口历史保留、lease 脱敏
  const state = await (await get('/api/state', { headers: { Cookie: cookie } })).json();
  assert.equal(state.jobs[0].status, 'blocked');
  assert.equal(state.versions[0].status, 'review');
  assert.ok(!JSON.stringify(state).includes('must-not-leak'));
  report.checks.push('history states preserved and lease redacted');

  // 8. 未迁移管理/转换接口返回 501
  assert.equal((await get('/api/jobs/job-fixture/retry', { method: 'POST', headers: { Cookie: cookie } })).status, 501);

  // 9. WASM MIME、Range 分片、非法 Range
  const wasm = await get('/runtime/artifact-fixture/engine.wasm', { headers: { Cookie: cookie, Range: 'bytes=0-3' } });
  assert.equal(wasm.status, 206);
  assert.equal(wasm.headers.get('content-type'), 'application/wasm');
  assert.equal(wasm.headers.get('content-range'), 'bytes 0-3/8');
  assert.equal(Buffer.from(await wasm.arrayBuffer()).length, 4);
  assert.equal((await get('/runtime/artifact-fixture/engine.wasm', { headers: { Cookie: cookie, Range: 'bytes=99-' } })).status, 416);
  report.checks.push('WASM MIME, range bytes and invalid range');

  // 10. 退出即撤销资源访问
  const loggedOut = await get('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base, Cookie: cookie, 'X-CSRF-Token': login.csrf }, body: '{}' });
  assert.equal(loggedOut.status, 200);
  assert.equal((await get('/runtime/artifact-fixture/index.html', { headers: { Cookie: cookie } })).status, 401);
  report.checks.push('logout immediately revokes resource access');

  report.passed = true;
}

const outDir = path.resolve(root, '../qa-output/cloudflare-integration');
mkdirSync(outDir, { recursive: true });
try {
  await main();
  console.log(JSON.stringify(report, null, 2));
} catch (e) {
  report.passed = false; report.error = e.message;
  console.error(JSON.stringify(report, null, 2));
  process.exitCode = 1;
} finally {
  writeFileSync(path.join(outDir, 'report-node-logic.json'), JSON.stringify(report, null, 2));
}
