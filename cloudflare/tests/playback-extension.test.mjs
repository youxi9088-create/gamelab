// 打包产物（Cocos / Babel 转译结果）的模块加载器会按无扩展名路径请求 JS，
// 磁盘上却带 .js。playback 必须回退探测，否则游戏整局起不来：
// 浏览器报 "Missing module: runtime/<artifact>/.../regeneratorRuntime"。
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { play } from '../playback.mjs';

const ORIGIN = 'https://portal.example';
const encoder = new TextEncoder();
const hash = value => createHash('sha256').update(value).digest('hex');
const now = () => Math.floor(Date.now() / 1000);

const SESSION = {
  authenticated: true, expires: now() + 43200,
  user: { id: 'user_1', username: 'tester', role: 'admin', enabled: true },
};

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
  for (const [path, text] of Object.entries(files)) {
    const bytes = encoder.encode(text);
    const key = `registered/${hash(path)}`;
    sqlite.prepare('INSERT INTO artifact_files VALUES (?, ?, ?, ?, ?)')
      .run('art_1', path, key, hash(bytes), bytes.byteLength);
    objects.set(key, { bytes, text });
  }
  const meta = key => objects.has(key)
    ? { size: objects.get(key).bytes.byteLength, etag: `etag-${key}`, httpEtag: `"etag-${key}"` }
    : null;

  function bound(sql, values) {
    return {
      async first() { return sqlite.prepare(sql).get(...values) || null; },
      async run() { return { success: true, meta: { changes: 1 } }; },
    };
  }
  return {
    DB: {
      prepare(sql) { return { bind: (...values) => bound(sql, values) }; },
      async batch(statements) { return Promise.all(statements.map(s => s.run())); },
    },
    FILES: {
      async head(key) { return meta(key); },
      async get(key, options) {
        const record = objects.get(key);
        if (!record) return null;
        const base = { size: record.bytes.byteLength, etag: `etag-${key}` };
        if (options?.range) {
          const slice = record.bytes.subarray(options.range.offset, options.range.offset + options.range.length);
          return { ...base, range: options.range, body: stream(slice) };
        }
        return { ...base, body: stream(record.bytes) };
      },
    },
  };
}

function stream(bytes) {
  return new ReadableStream({
    start(controller) { controller.enqueue(bytes); controller.close(); },
  });
}

const request = (path, init = {}) => new Request(`${ORIGIN}${path}`, { headers: {}, ...init });

async function fetchPlay(env, path) {
  const response = await play(request(path), env, SESSION);
  return { status: response.status, type: response.headers.get('Content-Type'), body: await response.text() };
}

test('无扩展名请求回退到 .js 并给出脚本 MIME', async (t) => {
  const env = environment(t, { 'runtime/@babel/runtime/helpers/regeneratorRuntime.js': 'var regeneratorRuntime = 1;' });
  const path = '/runtime/art_1/runtime/@babel/runtime/helpers/regeneratorRuntime';
  const result = await fetchPlay(env, path);
  assert.equal(result.status, 200);
  assert.equal(result.type, 'text/javascript; charset=utf-8');
  assert.equal(result.body, 'var regeneratorRuntime = 1;');
});

test('带扩展名请求照旧精确命中', async (t) => {
  const env = environment(t, { 'index.html': '<html></html>' });
  const result = await fetchPlay(env, '/runtime/art_1/index.html');
  assert.equal(result.status, 200);
  assert.equal(result.type, 'text/html; charset=utf-8');
});

test('确实不存在的路径仍返回 404，且不会误命中', async (t) => {
  const env = environment(t, { 'runtime/index.html': '<html></html>' });
  const result = await fetchPlay(env, '/runtime/art_1/runtime/@babel/runtime/helpers/definitelyMissing');
  assert.equal(result.status, 404);
});

test('无扩展名但存在同名无扩展名文件时优先精确匹配', async (t) => {
  const env = environment(t, { 'plain': 'no-extension-content' });
  const result = await fetchPlay(env, '/runtime/art_1/plain');
  assert.equal(result.status, 200);
  assert.equal(result.body, 'no-extension-content');
});

test('未登录不得取到试玩文件', async (t) => {
  const env = environment(t, { 'index.html': '<html></html>' });
  const response = await play(request('/runtime/art_1/index.html'), env, { ...SESSION, authenticated: false });
  assert.equal(response.status, 401);
});
