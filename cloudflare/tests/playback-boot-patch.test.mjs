// 打包产物（registry 键是纯相对路径）的 boot.js 会把"脚本 URL 目录"当模块基准。
// 云端挂在 /runtime/<artifact>/runtime/ 下时，这段前缀被拼进模块 id，
// registry 永远匹配不上 → 浏览器报 "Missing module"，整局游戏起不来。
// playback 必须按散列命中后改写基准，与本地 server.py 的 mounted_boot 一致。
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import { play } from '../playback.mjs';
import { mountBoot } from '../playback.mjs';

const ORIGIN = 'https://portal.example';
const encoder = new TextEncoder();
const hash = value => createHash('sha256').update(value).digest('hex');
const now = () => Math.floor(Date.now() / 1000);

const SESSION = {
  authenticated: true, expires: now() + 43200,
  user: { id: 'user_1', username: 'tester', role: 'admin', enabled: true },
};

const BOOT = new Uint8Array(await readFile(new URL('./fixtures/boot-legacy.js', import.meta.url)));
// 与 controlplane/runtime_compatibility.py 的白名单第一项一致。
const BOOT_SHA = '1ea87465b7f7ac7b16593d411cd1130f0e6dbd07974b6da606fc1bdc06b0fd71';

function stream(bytes) {
  return new ReadableStream({ start(c) { c.enqueue(bytes); c.close(); } });
}

function environment(t, files) {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(`
    CREATE TABLE records (kind TEXT, id TEXT, data TEXT, PRIMARY KEY(kind,id));
    CREATE TABLE artifact_files (artifact_id TEXT, path TEXT, object_key TEXT, sha256 TEXT, bytes INTEGER, PRIMARY KEY(artifact_id,path));
  `);
  t.after(() => sqlite.close());
  sqlite.prepare('INSERT INTO records VALUES (?, ?, ?)')
    .run('artifacts', 'art_1', JSON.stringify({ id: 'art_1', runtime_local: true }));

  const objects = new Map();
  for (const [path, bytes] of Object.entries(files)) {
    const key = `registered/${hash(bytes)}`;
    sqlite.prepare('INSERT INTO artifact_files VALUES (?, ?, ?, ?, ?)')
      .run('art_1', path, key, hash(bytes), bytes.byteLength);
    objects.set(key, bytes);
  }
  const bound = sql => ({
    async first(...values) { return sqlite.prepare(sql).get(...values) || null; },
    async run() { return { success: true, meta: { changes: 1 } }; },
  });
  return {
    DB: { prepare(sql) { const b = bound(sql); return { bind: (...v) => ({ first: () => b.first(...v), run: b.run }) }; } },
    FILES: {
      async head(key) {
        return objects.has(key)
          ? { size: objects.get(key).byteLength, etag: `etag-${key}`, httpEtag: `"etag-${key}"` }
          : null;
      },
      async get(key) {
        const bytes = objects.get(key);
        return bytes ? { size: bytes.byteLength, etag: `etag-${key}`, body: stream(bytes) } : null;
      },
    },
  };
}

const request = path => new Request(`${ORIGIN}${path}`, { headers: {} });

test('mountBoot 命中已知散列并改写模块基准', async () => {
  const patch = await mountBoot(BOOT);
  assert.ok(patch, '应命中白名单');
  const text = new TextDecoder().decode(patch.bytes);
  assert.ok(text.includes('function runtimeModulePath'), '应注入基准换算函数');
  assert.ok(text.includes('runtimeModulePath(document.currentScript.src)'), '应改写 window.require 的基准');
  assert.ok(text.includes('requireModule(runtimeModulePath(url))'), '应改写 loadScript 的基准');
  assert.equal(patch.headers['X-GameLab-Runtime-Compatibility'], 'module-base-v1');
  assert.equal(patch.headers['X-GameLab-Artifact-File-SHA256'], BOOT_SHA);
});

test('mountBoot 对未知内容原样不动', async () => {
  assert.equal(await mountBoot(encoder.encode('const x = 1;')), null);
});

test('试玩路由对 boot.js 返回补丁内容且 Content-Length 一致', async (t) => {
  const env = environment(t, { 'runtime/boot.js': BOOT });
  const response = await play(request('/runtime/art_1/runtime/boot.js'), env, SESSION);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('X-GameLab-Runtime-Compatibility'), 'module-base-v1');
  const body = await response.text();
  assert.ok(body.includes('runtimeModulePath(document.currentScript.src)'));
  assert.equal(Number(response.headers.get('Content-Length')), encoder.encode(body).byteLength);
});

test('非 runtime 模式不打补丁，避免影响隔离试玩', async (t) => {
  const env = environment(t, { 'runtime/boot.js': BOOT });
  const response = await play(request('/play/art_1/runtime/boot.js'), env, SESSION);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('X-GameLab-Runtime-Compatibility'), null);
  const body = await response.text();
  assert.ok(!body.includes('runtimeModulePath'));
});

test('普通脚本不被补丁影响', async (t) => {
  const env = environment(t, { 'runtime/game.js': encoder.encode('console.log(1);') });
  const response = await play(request('/runtime/art_1/runtime/game.js'), env, SESSION);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('X-GameLab-Runtime-Compatibility'), null);
});
