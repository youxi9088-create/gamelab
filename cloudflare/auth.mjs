const cryptoReady = import('node:crypto').catch(() => null);
const SESSION_SECONDS = 43200;
const FAILURE_SECONDS = 900;
const MAX_ATTEMPTS = 10;
const MAX_JSON_BYTES = 4096;
// 原站为 600000 轮，实测约 319ms，超出 Workers Free 每请求 10ms 的 CPU 上限（必然 1102）。
// 按用户决定降级到 5000 轮（实测约 3ms）以适配免费版；密码在迁移时重新设置并重新哈希。
const PBKDF2_ITERATIONS = 5000;
const DUMMY_HASH = `${'0'.repeat(32)}:${'0'.repeat(64)}`;
const encoder = new TextEncoder();

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function failure(status, message) {
  return new HttpError(status, message);
}

function json(statusCode, body, headers = {}) {
  return Response.json(body, {
    status: statusCode,
    headers: { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', ...headers },
  });
}

function errorResponse(error) {
  const known = error instanceof HttpError;
  return json(known ? error.status : 503, { error: known ? error.message : '认证服务暂不可用，请稍后重试' });
}

async function cryptoApi() {
  const api = await cryptoReady;
  if (!api || !['pbkdf2', 'createHash', 'randomBytes', 'timingSafeEqual'].every(name => typeof api[name] === 'function')) {
    throw failure(503, '认证加密服务暂不可用，请稍后重试');
  }
  return api;
}

function sha256(api, value) {
  return api.createHash('sha256').update(value, 'utf8').digest('hex');
}

function sessionToken(request) {
  const values = (request.headers.get('Cookie') || '').split(';')
    .map(item => item.trim()).filter(item => item.startsWith('replica_session='));
  if (values.length !== 1) return null;
  const token = values[0].slice('replica_session='.length);
  // 兼容既有 token_urlsafe(32)，但不接受畸形或重复的会话 Cookie。
  return /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null;
}

function parseRecord(row) {
  if (!row) return null;
  try {
    const data = JSON.parse(row.data);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    return { ...data, id: row.id };
  } catch {
    return null;
  }
}

async function record(env, kind, id) {
  return parseRecord(await env.DB.prepare('SELECT id, data FROM records WHERE kind = ? AND id = ?')
    .bind(kind, id).first());
}

export function publicUser(user) {
  return Object.fromEntries(['id', 'username', 'role', 'enabled', 'created_at'].map(key => [key, user[key]]));
}

export async function authenticate(request, env) {
  const api = await cryptoApi();
  const token = sessionToken(request);
  if (!token) return null;
  try {
    const session = await record(env, 'portal_sessions', sha256(api, token));
    if (!session || session.authenticated !== true || !Number.isFinite(session.expires)
        || session.expires <= Math.floor(Date.now() / 1000) || typeof session.user_id !== 'string'
        || typeof session.csrf !== 'string' || !session.csrf) return null;
    const user = await record(env, 'users', session.user_id);
    if (!user || user.enabled !== true || !Number.isSafeInteger(user.revision) || user.revision < 1
        || user.revision !== session.revision) return null;
    return { ...session, user: publicUser(user) };
  } catch {
    throw failure(503, '认证服务暂不可用，请稍后重试');
  }
}

export async function status(request, env) {
  try {
    return json(200, { required: true, authenticated: Boolean(await authenticate(request, env)) });
  } catch (error) {
    return errorResponse(error);
  }
}

function checkOrigin(request, required = false) {
  const origin = request.headers.get('Origin');
  if ((required && origin === null) || (origin !== null && origin !== new URL(request.url).origin)) {
    throw failure(403, '不允许跨站操作');
  }
}

async function readLoginBody(request) {
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw failure(415, '请使用 application/json');
  }
  const declared = request.headers.get('Content-Length');
  if (declared !== null) {
    if (!/^\d+$/.test(declared)) throw failure(400, '请求参数无效');
    if (Number(declared) > MAX_JSON_BYTES) throw failure(413, '登录请求不得超过 4KB');
  }
  if (!request.body) throw failure(400, '登录 JSON 无效');
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_JSON_BYTES) {
        await reader.cancel().catch(() => {});
        throw failure(413, '登录请求不得超过 4KB');
      }
      chunks.push(value);
    }
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw failure(400, '登录 JSON 无效');
  } finally {
    reader.releaseLock();
  }
  try {
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const body = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (!body || typeof body !== 'object' || Array.isArray(body)
        || typeof body.username !== 'string' || body.username.length < 1 || body.username.length > 80
        || typeof body.password !== 'string' || body.password.length < 1 || body.password.length > 1024) {
      throw failure(400, '用户名或密码格式无效');
    }
    return body;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw failure(400, '登录 JSON 无效');
  }
}

async function passwordMatches(api, password, storedHash) {
  const validFormat = typeof storedHash === 'string' && /^[a-f0-9]+:[a-f0-9]{64}$/i.test(storedHash);
  const [salt, expectedHex] = (validFormat ? storedHash : DUMMY_HASH).split(':');
  let derived;
  try {
    // 必须使用 saltHex 本身的 ASCII 字符串；不能把它解码成十六进制字节。
    derived = await new Promise((resolve, reject) => {
      api.pbkdf2(password, salt, PBKDF2_ITERATIONS, 32, 'sha256', (error, value) => error ? reject(error) : resolve(value));
    });
  } catch {
    throw failure(503, '认证加密服务暂不可用，请稍后重试');
  }
  const expected = Uint8Array.from(expectedHex.match(/../g), pair => Number.parseInt(pair, 16));
  const equal = api.timingSafeEqual(derived, expected);
  return validFormat && equal;
}

function cookie(request, token, maxAge) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `replica_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure}`;
}

export async function login(request, env) {
  if (request.method !== 'POST') return json(405, { error: '登录仅允许 POST' }, { Allow: 'POST' });
  try {
    checkOrigin(request);
    const body = await readLoginBody(request);
    const api = await cryptoApi();
    const now = Math.floor(Date.now() / 1000);
    const key = sha256(api, JSON.stringify([request.headers.get('CF-Connecting-IP') || '', body.username]));
    // 原子预占一次尝试，防止并发请求绕过限流；成功后清除。表由宿主迁移建立。
    const attempt = await env.DB.prepare(`INSERT INTO auth_failures (key, attempts, expires) VALUES (?, 1, ?)
      ON CONFLICT(key) DO UPDATE SET
        attempts = CASE WHEN auth_failures.expires <= ? THEN 1 ELSE MIN(auth_failures.attempts + 1, 11) END,
        expires = CASE WHEN auth_failures.expires <= ? THEN excluded.expires ELSE auth_failures.expires END
      RETURNING attempts, expires`).bind(key, now + FAILURE_SECONDS, now, now).first();
    if (!attempt || !Number.isInteger(attempt.attempts)) throw failure(503, '认证服务暂不可用，请稍后重试');
    if (attempt.attempts > MAX_ATTEMPTS) {
      return json(429, { error: '登录尝试过多，请稍后重试' }, { 'Retry-After': String(Math.max(1, attempt.expires - now)) });
    }
    const user = parseRecord(await env.DB.prepare(
      "SELECT id, data FROM records WHERE kind = 'users' AND json_extract(data, '$.username') = ? LIMIT 1",
    ).bind(body.username).first());
    // 未知、停用、损坏散列与已知账号一样实际执行一次完整 PBKDF2，不泄露失败原因。
    const matches = await passwordMatches(api, body.password, user?.password_hash);
    if (!user || user.enabled !== true || !matches || !Number.isSafeInteger(user.revision) || user.revision < 1) {
      return json(401, { error: '账号或密码不正确' });
    }
    const current = await record(env, 'users', user.id);
    if (!current || current.enabled !== true || current.revision !== user.revision || current.password_hash !== user.password_hash) {
      return json(401, { error: '账号或密码不正确' });
    }
    const token = api.randomBytes(32).toString('base64url');
    const session = {
      id: sha256(api, token), user_id: current.id, revision: current.revision,
      csrf: api.randomBytes(24).toString('base64url'),
      expires: Math.floor(Date.now() / 1000) + SESSION_SECONDS, authenticated: true,
    };
    await env.DB.batch([
      env.DB.prepare('INSERT INTO records (kind, id, data) VALUES (?, ?, ?)')
        .bind('portal_sessions', session.id, JSON.stringify(session)),
      env.DB.prepare('DELETE FROM auth_failures WHERE key = ?').bind(key),
    ]);
    return json(200, { ok: true, csrf: session.csrf, user: publicUser(current) }, {
      'Set-Cookie': cookie(request, token, SESSION_SECONDS),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export function requireMutation(request, session) {
  checkOrigin(request);
  const submitted = request.headers.get('X-CSRF-Token');
  if (!session || session.authenticated !== true || session.user?.enabled !== true
      || !Number.isFinite(session.expires) || session.expires <= Math.floor(Date.now() / 1000)
      || typeof session.csrf !== 'string' || !session.csrf || submitted === null) {
    throw failure(403, '请求校验失败，请刷新页面');
  }
  const expected = encoder.encode(session.csrf);
  const actual = encoder.encode(submitted);
  let difference = expected.length ^ actual.length;
  for (let index = 0; index < expected.length; index++) difference |= expected[index] ^ (actual[index] ?? 0);
  if (difference !== 0) throw failure(403, '请求校验失败，请刷新页面');
}

export async function logout(request, env, session) {
  if (request.method !== 'POST') return json(405, { error: '退出仅允许 POST' }, { Allow: 'POST' });
  try {
    checkOrigin(request, true);
    requireMutation(request, session);
    const api = await cryptoApi();
    const token = sessionToken(request);
    if (!token || session.id !== sha256(api, token)) throw failure(403, '请求校验失败，请刷新页面');
    await env.DB.prepare('DELETE FROM records WHERE kind = ? AND id = ?').bind('portal_sessions', session.id).run();
    return json(200, { ok: true }, { 'Set-Cookie': cookie(request, '', 0) });
  } catch (error) {
    return errorResponse(error);
  }
}
