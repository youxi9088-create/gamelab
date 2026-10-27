import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import { authenticate, status, login, logout, requireMutation, publicUser } from '../auth.mjs';
import { play, parsePath, parseRange } from '../playback.mjs';

const ORIGIN = 'https://portal.example';
const PASSWORD = '测试密码-Cloud22!';
const SALT = '00112233445566778899aabbccddeeff';
// 独立 Python hashlib.pbkdf2_hmac 的旧实现向量，不能用被测实现生成期望值。
const HASH = `${SALT}:80bb4d38c7350705c2cdc890934da962c3dc355c48455f639f0d52a00807244c`;
const TOKEN = 'a'.repeat(43);
const encoder = new TextEncoder();
const hash = value => createHash('sha256').update(value).digest('hex');
const now = () => Math.floor(Date.now() / 1000);
const userFixture = () => ({
  id: 'user_1', username: 'tester', password_hash: HASH, enabled: true,
  revision: 3, role: 'admin', created_at: '2026-01-01T00:00:00Z',
});
const sessionFixture = () => ({
  id: hash(TOKEN), user_id: 'user_1', revision: 3,
  csrf: 'c'.repeat(32), authenticated: true, expires: now() + 43200,
});
const loggedIn = () => ({ ...sessionFixture(), user: publicUser(userFixture()) });

// 仅内存 SQLite 的 D1 接口替身，实际执行 SQL；不使用 Miniflare 或平台服务。
function database(t) {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(`
    CREATE TABLE records (kind TEXT, id TEXT, data TEXT, PRIMARY KEY(kind,id));
    CREATE TABLE artifact_files (artifact_id TEXT, path TEXT, object_key TEXT, sha256 TEXT, bytes INTEGER, PRIMARY KEY(artifact_id,path));
    CREATE TABLE auth_failures (key TEXT PRIMARY KEY, attempts INTEGER, expires INTEGER);
  `);
  t.after(() => sqlite.close());
  const calls = [];
  function bound(sql, values) {
    return {
      sql, values,
      async first() {
        calls.push({ sql, values });
        return sqlite.prepare(sql).get(...values) || null;
      },
      async run() {
        calls.push({ sql, values });
        const result = sqlite.prepare(sql).run(...values);
        return { success: true, meta: { changes: Number(result.changes) } };
      },
    };
  }
  const DB = {
    sqlite, calls,
    prepare(sql) { return { bind: (...values) => bound(sql, values) }; },
    async batch(statements) {
      sqlite.exec('BEGIN');
      try {
        const result = [];
        for (const statement of statements) result.push(await statement.run());
        sqlite.exec('COMMIT');
        return result;
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    },
  };
  DB.put = (kind, data) => sqlite.prepare('INSERT OR REPLACE INTO records VALUES (?, ?, ?)')
    .run(kind, data.id, JSON.stringify(data));
  DB.get = (kind, id) => {
    const row = sqlite.prepare('SELECT data FROM records WHERE kind = ? AND id = ?').get(kind, id);
    return row ? JSON.parse(row.data) : null;
  };
  return DB;
}

function authEnvironment(t) {
  const DB = database(t);
  DB.put('users', userFixture());
  DB.put('portal_sessions', sessionFixture());
  return { DB };
}

function loginRequest(body = { username: 'tester', password: PASSWORD }, options = {}) {
  const { headers = {}, ...rest } = options;
  return new Request(`${ORIGIN}/api/auth/login`, {
    method: 'POST', body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', Origin: ORIGIN, 'CF-Connecting-IP': '192.0.2.1', ...headers },
    ...rest,
  });
}

function sessionRequest(path = '/api/auth/status', options = {}) {
  const { headers = {}, ...rest } = options;
  return new Request(`${ORIGIN}${path}`, {
    ...rest, headers: { Cookie: `replica_session=${TOKEN}`, ...headers },
  });
}

function playbackEnvironment(t, path = 'game.bin', text = '0123456789') {
  const DB = database(t);
  DB.put('artifacts', { id: 'art_1', runtime_local: true });
  const bytes = encoder.encode(text);
  const key = 'registered/private/object';
  DB.sqlite.prepare('INSERT INTO artifact_files VALUES (?, ?, ?, ?, ?)')
    .run('art_1', path, key, hash(bytes), bytes.byteLength);
  const calls = [];
  const meta = { size: bytes.byteLength, etag: 'r2-etag', httpEtag: '"r2-etag"', version: 'version_1' };
  const FILES = {
    async head(objectKey) { calls.push({ method: 'head', key: objectKey }); return objectKey === key ? { ...meta } : null; },
    async get(objectKey, options = {}) {
      calls.push({ method: 'get', key: objectKey, options });
      if (objectKey !== key) return null;
      if (options.onlyIf?.etagMatches !== meta.etag) return { ...meta };
      const range = options.range;
      const selected = range ? bytes.subarray(range.offset, range.offset + range.length) : bytes;
      return {
        ...meta, range,
        body: new ReadableStream({ start(controller) { controller.enqueue(selected); controller.close(); } }),
        // 若被测实现缓冲正文，测试须立即失败。
        arrayBuffer() { throw new Error('禁止缓冲 R2 文件'); },
        text() { throw new Error('禁止读取整个 R2 文件'); },
        httpMetadata: { contentType: 'text/html', cacheControl: 'public, max-age=99999' },
      };
    },
  };
  return { DB, FILES, calls, key, bytes, meta };
}

const playbackRequest = (options = {}, path = '/play/art_1/game.bin') => new Request(`${ORIGIN}${path}`, options);

async function modifiedAuth(cryptoExpression) {
  const source = await readFile(new URL('../auth.mjs', import.meta.url), 'utf8');
  const changed = source.replace("import('node:crypto')", cryptoExpression);
  assert.notEqual(changed, source);
  return import(`data:text/javascript;base64,${Buffer.from(changed).toString('base64')}`);
}

test('公开用户使用字段白名单，不包含散列或 revision', () => {
  assert.deepEqual(publicUser({ ...userFixture(), extra_secret: '不可公开' }), {
    id: 'user_1', username: 'tester', role: 'admin', enabled: true, created_at: '2026-01-01T00:00:00Z',
  });
});

test('认证沿用旧 token 的 sha256 id，状态始终 required:true', async t => {
  const env = authEnvironment(t);
  const result = await authenticate(sessionRequest(), env);
  assert.equal(result.id, hash(TOKEN));
  assert.equal(result.user.username, 'tester');
  assert.ok(!('password_hash' in result.user));
  assert.deepEqual(await (await status(sessionRequest(), env)).json(), { required: true, authenticated: true });
  const anonymous = await status(new Request(`${ORIGIN}/api/auth/status`), env);
  assert.deepEqual(await anonymous.json(), { required: true, authenticated: false });
  assert.equal(anonymous.headers.get('Cache-Control'), 'private, no-store');
});

for (const [name, change] of [
  ['用户停用', env => env.DB.put('users', { ...userFixture(), enabled: false })],
  ['用户修订变化', env => env.DB.put('users', { ...userFixture(), revision: 4 })],
  ['会话过期', env => env.DB.put('portal_sessions', { ...sessionFixture(), expires: now() - 1 })],
  ['未认证会话', env => env.DB.put('portal_sessions', { ...sessionFixture(), authenticated: false })],
  ['删除用户', env => env.DB.sqlite.prepare("DELETE FROM records WHERE kind='users'").run()],
  ['损坏会话 JSON', env => env.DB.sqlite.prepare("UPDATE records SET data='{' WHERE kind='portal_sessions'").run()],
]) {
  test(`${name}使会话失效`, async t => {
    const env = authEnvironment(t);
    change(env);
    assert.equal(await authenticate(sessionRequest(), env), null);
    assert.equal((await (await status(sessionRequest(), env)).json()).authenticated, false);
    assert.equal((await play(playbackRequest({ headers: { 'If-None-Match': '*' } }), {}, await authenticate(sessionRequest(), env))).status, 401);
  });
}

test('畸形、重复、缺失 Cookie 不访问 D1', async () => {
  const env = { DB: { prepare() { throw new Error('不应查询'); } } };
  for (const value of ['', 'replica_session=bad', `replica_session=${TOKEN}; replica_session=${TOKEN}`, 'replica_session=%00']) {
    assert.equal(await authenticate(sessionRequest('/', { headers: { Cookie: value } }), env), null);
  }
});

test('正确旧版密码可登录且原散列不变，新会话只存 token 摘要', async t => {
  const env = authEnvironment(t);
  const response = await login(loginRequest(), env);
  assert.equal(response.status, 200);
  const body = await response.json();
  const setCookie = response.headers.get('Set-Cookie');
  assert.match(setCookie, /^replica_session=[A-Za-z0-9_-]{43}; HttpOnly; SameSite=Strict; Path=\/; Max-Age=43200; Secure$/);
  const token = /^replica_session=([^;]+)/.exec(setCookie)[1];
  assert.notEqual(token, TOKEN);
  const stored = env.DB.get('portal_sessions', hash(token));
  assert.equal(stored.authenticated, true);
  assert.equal(stored.revision, 3);
  assert.equal(stored.user_id, 'user_1');
  assert.match(stored.csrf, /^[A-Za-z0-9_-]{32}$/);
  assert.equal(stored.csrf, body.csrf);
  assert.ok(stored.expires >= now() + 43199 && stored.expires <= now() + 43200);
  assert.ok(!JSON.stringify(stored).includes(token));
  assert.ok(!JSON.stringify(body).includes(HASH));
  assert.equal(env.DB.get('users', 'user_1').password_hash, HASH);
  assert.equal(env.DB.sqlite.prepare('SELECT COUNT(*) AS count FROM auth_failures').get().count, 0);
  const active = await authenticate(sessionRequest('/', { headers: { Cookie: `replica_session=${token}` } }), env);
  assert.equal(active.csrf, body.csrf);
});

test('错误密码、未知用户、停用用户统一失败，且都实际执行同成本异步 PBKDF2', async t => {
  globalThis.__authPlaybackHashCalls = [];
  t.after(() => { delete globalThis.__authPlaybackHashCalls; });
  const instrumented = await modifiedAuth(`import('node:crypto').then(api => ({ ...api, pbkdf2(...args) {
    globalThis.__authPlaybackHashCalls.push(args.slice(0, 5)); return api.pbkdf2(...args);
  } }))`);
  const env = authEnvironment(t);
  const before = env.DB.sqlite.prepare("SELECT COUNT(*) AS count FROM records WHERE kind='portal_sessions'").get().count;
  const responses = [];
  responses.push(await instrumented.login(loginRequest({ username: 'tester', password: 'bad-password' }), env));
  responses.push(await instrumented.login(loginRequest({ username: 'unknown', password: 'bad-password' }), env));
  responses.push(await instrumented.login(loginRequest({ username: '未知账号', password: 'bad-password' }), env));
  env.DB.put('users', { ...userFixture(), enabled: false });
  responses.push(await instrumented.login(loginRequest(), env));
  env.DB.put('users', { ...userFixture(), password_hash: '损坏散列' });
  responses.push(await instrumented.login(loginRequest(), env));
  for (const response of responses) {
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { error: '账号或密码不正确' });
    assert.equal(response.headers.get('Set-Cookie'), null);
  }
  const calls = globalThis.__authPlaybackHashCalls;
  assert.equal(calls.length, 5);
  for (const call of calls) assert.deepEqual(call.slice(2), [600000, 32, 'sha256']);
  assert.equal(calls[0][1], SALT);
  assert.equal(calls[1][1], '0'.repeat(32));
  assert.equal(env.DB.sqlite.prepare("SELECT COUNT(*) AS count FROM records WHERE kind='portal_sessions'").get().count, before);
});

test('HTTP 登录 Cookie 无 Secure；密码改变后的 revision 不复用旧会话', async t => {
  const env = authEnvironment(t);
  const request = new Request('http://portal.example/api/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'tester', password: PASSWORD }),
  });
  const response = await login(request, env);
  assert.equal(response.status, 200);
  assert.ok(!response.headers.get('Set-Cookie').includes('; Secure'));
  env.DB.put('users', { ...userFixture(), revision: 4 });
  assert.equal(await authenticate(new Request(`${ORIGIN}/`, { headers: { Cookie: response.headers.get('Set-Cookie').split(';')[0] } }), env), null);
});

test('登录只接受 POST、正确 Origin 和受限 JSON 类型', async t => {
  const env = authEnvironment(t);
  assert.equal((await login(new Request(`${ORIGIN}/api/auth/login`), env)).status, 405);
  assert.equal((await login(loginRequest(undefined, { headers: { Origin: 'https://other.example' } }), env)).status, 403);
  assert.equal((await login(loginRequest(undefined, { headers: { Origin: 'null' } }), env)).status, 403);
  assert.equal((await login(loginRequest(undefined, { headers: { Origin: '' } }), env)).status, 403);
  assert.equal((await login(loginRequest(undefined, { headers: { 'Content-Type': 'text/plain' } }), env)).status, 415);
  for (const body of [null, [], { username: 1, password: PASSWORD }, { username: 'tester', password: 1 },
    { username: 'tester', password: '' }, { username: 'a'.repeat(81), password: 'x' },
    { username: 'tester', password: 'a'.repeat(1025) }]) {
    assert.equal((await login(loginRequest(body), env)).status, 400);
  }
  assert.equal((await login(loginRequest(undefined, { body: '{' }), env)).status, 400);
  assert.equal(env.DB.sqlite.prepare('SELECT COUNT(*) AS count FROM auth_failures').get().count, 0);
});

test('登录按实际 UTF-8 流限制 4KB，不依赖 Content-Length', async t => {
  const env = authEnvironment(t);
  const big = JSON.stringify({ username: 'tester', password: PASSWORD, extra: '中'.repeat(1500) });
  assert.equal((await login(loginRequest(undefined, { body: big }), env)).status, 413);
  assert.equal((await login(loginRequest(undefined, { headers: { 'Content-Length': '4097' } }), env)).status, 413);
  assert.equal((await login(loginRequest(undefined, { headers: { 'Content-Length': '-1' } }), env)).status, 400);
  let cancelled = false;
  const stream = new ReadableStream({
    start(controller) { controller.enqueue(encoder.encode(big.slice(0, 1000))); controller.enqueue(encoder.encode(big.slice(1000))); },
    cancel() { cancelled = true; },
  });
  const request = loginRequest(undefined, { body: stream, duplex: 'half', headers: { 'Content-Length': '1' } });
  assert.equal((await login(request, env)).status, 413);
  assert.equal(cancelled, true);
  const invalidUtf8 = loginRequest(undefined, { body: new Uint8Array([0xff]) });
  assert.equal((await login(invalidUtf8, env)).status, 400);
});

test('D1 限流为 IP+用户名的散列键，窗口内阻断且到期重置', async t => {
  const env = authEnvironment(t);
  const key = hash(JSON.stringify(['192.0.2.1', 'tester']));
  env.DB.sqlite.prepare('INSERT INTO auth_failures VALUES (?, ?, ?)').run(key, 9, now() + 900);
  assert.equal((await login(loginRequest({ username: 'tester', password: 'bad' }), env)).status, 401);
  const blocked = await login(loginRequest(), env);
  assert.equal(blocked.status, 429);
  assert.ok(Number(blocked.headers.get('Retry-After')) > 0);
  assert.equal(env.DB.sqlite.prepare('SELECT attempts FROM auth_failures WHERE key=?').get(key).attempts, 11);
  const otherIp = await login(loginRequest({ username: 'tester', password: 'bad' }, { headers: { 'CF-Connecting-IP': '192.0.2.2' } }), env);
  assert.equal(otherIp.status, 401);
  env.DB.sqlite.prepare('UPDATE auth_failures SET expires=? WHERE key=?').run(now() - 1, key);
  assert.equal((await login(loginRequest({ username: 'tester', password: 'bad' }), env)).status, 401);
  assert.equal(env.DB.sqlite.prepare('SELECT attempts FROM auth_failures WHERE key=?').get(key).attempts, 1);
});

test('并发限流原子预占，最多一请求取得第十次机会', async t => {
  const env = authEnvironment(t);
  env.DB.sqlite.prepare('INSERT INTO auth_failures VALUES (?, ?, ?)')
    .run(hash(JSON.stringify(['192.0.2.1', 'tester'])), 9, now() + 900);
  const responses = await Promise.all(Array.from({ length: 5 }, () => login(loginRequest({ username: 'tester', password: 'bad' }), env)));
  assert.deepEqual(responses.map(response => response.status).sort(), [401, 429, 429, 429, 429]);
});

test('PBKDF2 执行中用户停用也不签发会话', async t => {
  const env = authEnvironment(t);
  let disabled = false;
  globalThis.__authPlaybackDisable = () => {
    env.DB.put('users', { ...userFixture(), enabled: false, revision: 4 });
    disabled = true;
  };
  t.after(() => { delete globalThis.__authPlaybackDisable; });
  const instrumented = await modifiedAuth(`import('node:crypto').then(api => ({ ...api, pbkdf2(...args) {
    api.pbkdf2(...args.slice(0, 5), (error, value) => {
      globalThis.__authPlaybackDisable(); args[5](error, value);
    });
  } }))`);
  assert.equal((await instrumented.login(loginRequest(), env)).status, 401);
  assert.equal(disabled, true);
});

test('node:crypto 缺失或 PBKDF2 不支持时返回 503，不降成本', async t => {
  const env = authEnvironment(t);
  const missing = await modifiedAuth("Promise.reject(new Error('不支持 node:crypto'))");
  assert.equal((await missing.login(loginRequest(), env)).status, 503);
  assert.equal((await missing.status(sessionRequest(), env)).status, 503);
  await assert.rejects(missing.authenticate(sessionRequest(), env), error => error.status === 503);
  const unavailable = await modifiedAuth(`import('node:crypto').then(api => ({ ...api, pbkdf2(...args) {
    args[5](new Error('不支持 PBKDF2，底层错误不可公开'));
  } }))`);
  const response = await unavailable.login(loginRequest(), env);
  assert.equal(response.status, 503);
  assert.ok(!(await response.text()).includes('底层错误'));
});

test('认证 D1 故障统一 503，不泄露外部异常状态或明细', async () => {
  const env = { DB: { prepare() { throw Object.assign(new Error('内部敏感明细'), { status: 400 }); } } };
  await assert.rejects(authenticate(sessionRequest(), env), error => error.status === 503);
  for (const response of [await status(sessionRequest(), env), await login(loginRequest(), env)]) {
    assert.equal(response.status, 503);
    assert.ok(!(await response.text()).includes('敏感明细'));
  }
});

test('变更校验强制 CSRF；Origin 若有必须同源', () => {
  const session = loggedIn();
  const valid = sessionRequest('/', { method: 'POST', headers: { 'X-CSRF-Token': session.csrf, Origin: ORIGIN } });
  assert.doesNotThrow(() => requireMutation(valid, session));
  assert.doesNotThrow(() => requireMutation(sessionRequest('/', { headers: { 'X-CSRF-Token': session.csrf } }), session));
  for (const headers of [{}, { 'X-CSRF-Token': 'x' }, { 'X-CSRF-Token': `${session.csrf}x` },
    { 'X-CSRF-Token': session.csrf, Origin: 'https://other.example' }, { 'X-CSRF-Token': session.csrf, Origin: 'null' }]) {
    assert.throws(() => requireMutation(sessionRequest('/', { headers }), session), error => error.status === 403);
  }
  for (const invalid of [null, { ...session, authenticated: false }, { ...session, expires: 0 },
    { ...session, user: { ...session.user, enabled: false } }]) {
    assert.throws(() => requireMutation(valid, invalid), error => error.status === 403);
  }
});

test('退出必须 POST、显式同源 Origin、CSRF 与当前 Cookie；删除并清 Cookie', async t => {
  const env = authEnvironment(t);
  const session = await authenticate(sessionRequest(), env);
  const request = headers => sessionRequest('/api/auth/logout', { method: 'POST', headers });
  assert.equal((await logout(sessionRequest(), env, session)).status, 405);
  assert.equal((await logout(request({ 'X-CSRF-Token': session.csrf }), env, session)).status, 403);
  assert.equal((await logout(request({ Origin: ORIGIN }), env, session)).status, 403);
  assert.equal((await logout(request({ Origin: 'https://other.example', 'X-CSRF-Token': session.csrf }), env, session)).status, 403);
  assert.equal((await logout(request({ Origin: ORIGIN, 'X-CSRF-Token': session.csrf, Cookie: `replica_session=${'b'.repeat(43)}` }), env, session)).status, 403);
  assert.ok(env.DB.get('portal_sessions', session.id));
  const response = await logout(request({ Origin: ORIGIN, 'X-CSRF-Token': session.csrf }), env, session);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('Set-Cookie'), /^replica_session=; HttpOnly; SameSite=Strict; Path=\/; Max-Age=0; Secure$/);
  assert.equal(env.DB.get('portal_sessions', session.id), null);
  assert.equal(await authenticate(sessionRequest(), env), null);
});

test('纯路径解析仅解码一次且精确保留相对路径', () => {
  assert.deepEqual(parsePath('/play/art_1/assets/%E4%B8%AD.js'), { mode: 'play', artifactId: 'art_1', path: 'assets/中.js' });
  assert.deepEqual(parsePath('/runtime/art_1/index.html'), { mode: 'runtime', artifactId: 'art_1', path: 'index.html' });
  assert.equal(parsePath('/play/art_1/%252e%252e/file.bin').path, '%2e%2e/file.bin');
  for (const path of ['/play/art_1/../a', '/play/art_1/%2e%2e/a', '/play/art_1/.env', '/play/.art/a',
    '/play/art_1/a\\b', '/play/art_1/a%5Cb', '/play/art_1/a%00b', '/play/art_1/%2Fa', '/play/art_1/foo..bar']) {
    assert.throws(() => parsePath(path), error => error.status === 403);
  }
  for (const path of ['/play/art_1', '/play/art_1/', '/play//a', '/unknown/art_1/a']) {
    assert.throws(() => parsePath(path), error => error.status === 404);
  }
  for (const path of ['/play/art_1/%GG', '/play/art_1/%E4', '/play/art_1/a?q=1', 'play/art_1/a', null]) {
    assert.throws(() => parsePath(path), error => error.status === 400);
  }
});

test('宿主保留的原始点段不会被 URL 规范化后放行', async t => {
  const env = playbackEnvironment(t);
  for (const path of ['/play/art_1/a/../game.bin', '/play/art_1/a/%2e%2e/game.bin', '/play/art_1/a%5Cb/game.bin']) {
    const request = playbackRequest();
    Object.defineProperty(request, 'url', { value: `${ORIGIN}${path}` });
    assert.equal((await play(request, env, loggedIn())).status, 403);
  }
  assert.equal(env.calls.length, 0);
  const query = await play(playbackRequest({}, '/play/art_1/game.bin?ignored=../secret'), env, loggedIn());
  assert.equal(query.status, 200);
  assert.equal(await query.text(), '0123456789');
});

test('纯 Range 解析支持闭区间、开放区间、尾部范围和越界截断', () => {
  assert.equal(parseRange(null, 10), null);
  assert.equal(parseRange(undefined, 0), null);
  const cases = [
    ['bytes=2-4', 2, 4], ['bytes=2-', 2, 9], ['bytes=-3', 7, 9],
    ['bytes=-99', 0, 9], ['bytes=0-99', 0, 9], ['bytes=9-9', 9, 9], ['BYTES=0-0', 0, 0],
  ];
  for (const [input, start, end] of cases) {
    assert.deepEqual(parseRange(input, 10), { start, end, offset: start, length: end - start + 1 });
  }
});

test('Range 误参、多范围、空文件和不安全整数拒绝 416', () => {
  for (const input of ['', 'bytes=-', 'bytes=-0', 'bytes=10-', 'bytes=5-2', 'bytes=0-1,4-5',
    'items=0-1', 'bytes=1.5-2', 'bytes=-1-2', 'bytes=9007199254740993-', 'bytes=0-9007199254740993', 1]) {
    assert.throws(() => parseRange(input, 10), error => error.status === 416);
  }
  assert.throws(() => parseRange('bytes=0-', 0), error => error.status === 416);
  assert.throws(() => parseRange('bytes=0-', -1), error => error.status === 416);
});

test('试玩鉴权先行，即使 304、Range 误参、HEAD 或 POST 都不能绕过', async () => {
  for (const options of [{}, { headers: { 'If-None-Match': '*' } }, { headers: { Range: 'bad' } }, { method: 'HEAD' }, { method: 'POST' }]) {
    const response = await play(playbackRequest(options), {}, null);
    assert.equal(response.status, 401);
    assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  }
  for (const invalid of [{ ...loggedIn(), expires: 0 }, { ...loggedIn(), authenticated: false },
    { ...loggedIn(), user: { enabled: false } }]) {
    assert.equal((await play(playbackRequest(), {}, invalid)).status, 401);
  }
  const method = await play(playbackRequest({ method: 'POST' }), {}, loggedIn());
  assert.equal(method.status, 405);
  assert.equal(method.headers.get('Allow'), 'GET, HEAD');
});

test('只读登记 object_key，完整 GET 返回流、不信任 R2 MIME 或缓存元数据', async t => {
  const env = playbackEnvironment(t);
  const response = await play(playbackRequest(), env, loggedIn());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Content-Type'), 'application/octet-stream');
  assert.equal(response.headers.get('Content-Length'), '10');
  assert.equal(response.headers.get('Accept-Ranges'), 'bytes');
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  assert.equal(response.headers.get('ETag'), `"${hash(env.bytes)}"`);
  assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
  assert.ok(response.body instanceof ReadableStream);
  assert.equal(await response.text(), '0123456789');
  assert.deepEqual(env.calls.map(call => call.key), [env.key, env.key]);
  assert.deepEqual(env.calls[1].options, { onlyIf: { etagMatches: 'r2-etag' } });
  const unknown = await play(playbackRequest({}, '/play/art_1/registered/private/object'), env, loggedIn());
  assert.equal(unknown.status, 404);
  assert.equal(env.calls.length, 2);
  const encoded = await play(playbackRequest({}, '/play/art_1/%252e%252e/game.bin'), env, loggedIn());
  assert.equal(encoded.status, 404);
  assert.equal(env.calls.length, 2);
});

for (const [range, expected, contentRange] of [
  ['bytes=2-4', '234', 'bytes 2-4/10'], ['bytes=7-', '789', 'bytes 7-9/10'],
  ['bytes=-3', '789', 'bytes 7-9/10'], ['bytes=0-99', '0123456789', 'bytes 0-9/10'],
]) {
  test(`流式 Range ${range} 返回 206 与精确长度`, async t => {
    const env = playbackEnvironment(t);
    const response = await play(playbackRequest({ headers: { Range: range } }), env, loggedIn());
    assert.equal(response.status, 206);
    assert.equal(response.headers.get('Content-Range'), contentRange);
    assert.equal(response.headers.get('Content-Length'), String(expected.length));
    assert.equal(await response.text(), expected);
    const parsed = parseRange(range, 10);
    assert.deepEqual(env.calls[1].options.range, { offset: parsed.offset, length: parsed.length });
  });
}

test('HEAD 不读取 R2 正文，支持正常、范围、304 与 416', async t => {
  const env = playbackEnvironment(t);
  for (const [headers, statusCode, length] of [
    [{}, 200, '10'], [{ Range: 'bytes=-2' }, 206, '2'], [{ 'If-None-Match': '*' }, 304, null],
  ]) {
    const response = await play(playbackRequest({ method: 'HEAD', headers }), env, loggedIn());
    assert.equal(response.status, statusCode);
    assert.equal(response.headers.get('Content-Length'), length);
    assert.equal(response.body, null);
  }
  const invalid = await play(playbackRequest({ method: 'HEAD', headers: { Range: 'bad' } }), env, loggedIn());
  assert.equal(invalid.status, 416);
  assert.equal(invalid.headers.get('Content-Range'), 'bytes */10');
  assert.equal(invalid.body, null);
  assert.ok(env.calls.every(call => call.method === 'head'));
});

test('If-None-Match 的弱标记、列表、星号可返回 304，非匹配返回正文', async t => {
  const env = playbackEnvironment(t);
  const etag = `"${hash(env.bytes)}"`;
  for (const condition of [etag, `W/${etag}`, `"other", ${etag}`, '*']) {
    const response = await play(playbackRequest({ headers: { 'If-None-Match': condition, Range: 'bad' } }), env, loggedIn());
    assert.equal(response.status, 304);
    assert.equal(response.body, null);
    assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  }
  const nonmatching = await play(playbackRequest({ headers: { 'If-None-Match': '"other"' } }), env, loggedIn());
  assert.equal(nonmatching.status, 200);
  assert.equal(await nonmatching.text(), '0123456789');
});

test('无效 Range 返回 416、总长度，绝不执行 R2 get', async t => {
  const env = playbackEnvironment(t);
  for (const range of ['bad', 'bytes=10-', 'bytes=0-1,2-3']) {
    const response = await play(playbackRequest({ headers: { Range: range } }), env, loggedIn());
    assert.equal(response.status, 416);
    assert.equal(response.headers.get('Content-Range'), 'bytes */10');
    assert.equal(response.headers.get('Accept-Ranges'), 'bytes');
    assert.equal(response.headers.get('Content-Type'), 'application/json; charset=utf-8');
    assert.equal(response.headers.get('Content-Length'), String(encoder.encode(await response.text()).byteLength));
  }
  assert.ok(env.calls.every(call => call.method === 'head'));
});

test('零字节文件正常 GET/HEAD，任何 Range 都返回 416', async t => {
  const env = playbackEnvironment(t, 'game.bin', '');
  const response = await play(playbackRequest(), env, loggedIn());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Content-Length'), '0');
  assert.equal(await response.text(), '');
  assert.equal((await play(playbackRequest({ headers: { Range: 'bytes=-1' } }), env, loggedIn())).status, 416);
});

test('不存在 artifact 或未登记文件不触碰 R2；runtime_local 是严格开关', async t => {
  const env = playbackEnvironment(t);
  assert.equal((await play(playbackRequest({}, '/play/missing/game.bin'), env, loggedIn())).status, 404);
  assert.equal((await play(playbackRequest({}, '/play/art_1/missing.bin'), env, loggedIn())).status, 404);
  env.DB.put('artifacts', { id: 'art_1', runtime_local: false });
  assert.equal((await play(playbackRequest({}, '/runtime/art_1/game.bin'), env, loggedIn())).status, 403);
  assert.equal(env.calls.length, 0);
  assert.equal((await play(playbackRequest(), env, loggedIn())).status, 200);
});

test('play/runtime CSP 精确复用 server.py，不启用外网来源', async t => {
  const env = playbackEnvironment(t);
  const normal = await play(playbackRequest(), env, loggedIn());
  assert.equal(normal.headers.get('Content-Security-Policy'), "sandbox allow-scripts; default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self' http://127.0.0.1:* http://localhost:*");
  const runtime = await play(playbackRequest({}, '/runtime/art_1/game.bin'), env, loggedIn());
  assert.equal(runtime.headers.get('Content-Security-Policy'), "default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'");
});

test('登记文件存在但 R2 缺失、绑定缺失或异常统一 503，绝非未认证', async t => {
  const env = playbackEnvironment(t);
  for (const FILES of [undefined, { head: async () => null }, {
    head: async () => { throw Object.assign(new Error('底层敏感明细'), { status: 401 }); },
  }, { head: env.FILES.head, get: async () => null }, { head: env.FILES.head, get: async () => ({ ...env.meta }) }]) {
    const response = await play(playbackRequest(), { ...env, FILES }, loggedIn());
    assert.equal(response.status, 503);
    assert.ok(!(await response.text()).includes('敏感明细'));
  }
  const missingConditional = await play(playbackRequest({ headers: { 'If-None-Match': '*' } }), {
    ...env, FILES: { head: async () => null },
  }, loggedIn());
  assert.equal(missingConditional.status, 503);
});

test('对象大小或 head/get ETag 变化及错误范围失败关闭，取消正文流', async t => {
  const env = playbackEnvironment(t);
  assert.equal((await play(playbackRequest(), {
    ...env, FILES: { head: async () => ({ ...env.meta, size: 11 }) },
  }, loggedIn())).status, 503);
  for (const changes of [{ etag: 'changed' }, { size: 9 }, { range: { offset: 0, length: 10 } }]) {
    let cancelled = false;
    const response = await play(playbackRequest({ headers: { Range: 'bytes=1-2' } }), {
      ...env, FILES: {
        head: env.FILES.head,
        get: async () => ({ ...env.meta, range: { offset: 1, length: 2 }, ...changes,
          body: new ReadableStream({ cancel() { cancelled = true; } }),
        }),
      },
    }, loggedIn());
    assert.equal(response.status, 503);
    assert.equal(cancelled, true);
  }
});

test('每个指定扩展名使用固定 MIME，旧 boot.js 保持原字节不做补丁', async t => {
  const expected = {
    js: 'text/javascript; charset=utf-8', wasm: 'application/wasm', html: 'text/html; charset=utf-8',
    json: 'application/json; charset=utf-8', data: 'application/octet-stream', png: 'image/png',
    mp3: 'audio/mpeg', woff2: 'font/woff2', css: 'text/css; charset=utf-8', bin: 'application/octet-stream',
  };
  for (const [extension, mime] of Object.entries(expected)) {
    const path = extension === 'js' ? 'boot.js' : `game.${extension}`;
    const original = '历史文件原文，不改写';
    const env = playbackEnvironment(t, path, original);
    const response = await play(playbackRequest({}, `/runtime/art_1/${path}`), env, loggedIn());
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Content-Type'), mime);
    assert.equal(await response.text(), original);
  }
});
