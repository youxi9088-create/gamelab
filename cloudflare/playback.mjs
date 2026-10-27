// 与 server.py:270-272 保持一致：沙箱试玩禁止网络连接，独立运行仅可同源连接。
const PLAY_CSP = "sandbox allow-scripts; default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self' http://127.0.0.1:* http://localhost:*";
const RUNTIME_CSP = "default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'";
const MIME = {
  '.js': 'text/javascript; charset=utf-8',
  '.wasm': 'application/wasm',
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.data': 'application/octet-stream',
  '.png': 'image/png',
  '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2',
  '.css': 'text/css; charset=utf-8',
  '.bin': 'application/octet-stream',
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function failure(status, message) {
  return new HttpError(status, message);
}

function baseHeaders() {
  return {
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  };
}

function errorResponse(request, status, message, headers = {}) {
  const body = JSON.stringify({ error: message });
  return new Response(request.method === 'HEAD' ? null : body, {
    status,
    headers: {
      ...baseHeaders(), 'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': String(new TextEncoder().encode(body).byteLength), ...headers,
    },
  });
}

export function parsePath(pathname) {
  if (typeof pathname !== 'string' || !pathname.startsWith('/') || /[?#]/.test(pathname)) {
    throw failure(400, '试玩路径无效');
  }
  const raw = pathname.slice(1).split('/');
  if (raw.length < 3 || !['play', 'runtime'].includes(raw[0]) || raw.some(part => !part)) {
    throw failure(404, '试玩文件不存在');
  }
  let parts;
  try {
    // 每段仅解码一次，拒绝编码的分隔符；绝不把解码结果再次交给 URL 规范化。
    parts = raw.map(part => decodeURIComponent(part));
  } catch {
    throw failure(400, '试玩路径编码无效');
  }
  if (parts.some(part => part.startsWith('.') || part.includes('..') || /[\\/\u0000-\u001f\u007f]/.test(part))) {
    throw failure(403, '试玩路径不可访问');
  }
  return { mode: parts[0], artifactId: parts[1], path: parts.slice(2).join('/') };
}

export function parseRange(header, size) {
  if (!Number.isSafeInteger(size) || size < 0) throw failure(416, '文件范围无效');
  if (header === null || header === undefined) return null;
  if (typeof header !== 'string') throw failure(416, '文件范围无效');
  const match = /^bytes=(\d*)-(\d*)$/i.exec(header.trim());
  if (!match || (!match[1] && !match[2]) || size === 0) throw failure(416, '文件范围无效');
  const first = match[1] ? Number(match[1]) : null;
  const last = match[2] ? Number(match[2]) : null;
  if ((first !== null && !Number.isSafeInteger(first)) || (last !== null && !Number.isSafeInteger(last))) {
    throw failure(416, '文件范围无效');
  }
  let start;
  let end;
  if (first === null) {
    if (last <= 0) throw failure(416, '文件范围无效');
    start = Math.max(0, size - last);
    end = size - 1;
  } else {
    if (first >= size || (last !== null && last < first)) throw failure(416, '文件范围无效');
    start = first;
    end = last === null ? size - 1 : Math.min(last, size - 1);
  }
  return { start, end, offset: start, length: end - start + 1 };
}

function matchesEtag(header, etag) {
  if (header === null) return false;
  return header.split(',').some(item => {
    const value = item.trim();
    return value === '*' || value.replace(/^W\//, '') === etag;
  });
}

export async function play(request, env, session) {
  // 主入口须先调用 authenticate；任何条件请求和存储查询都在此鉴权门之后。
  if (!session || session.authenticated !== true || session.user?.enabled !== true
      || !Number.isFinite(session.expires) || session.expires <= Math.floor(Date.now() / 1000)) {
    return errorResponse(request, 401, '请先登录门户');
  }
  if (!['GET', 'HEAD'].includes(request.method)) {
    return errorResponse(request, 405, '试玩仅允许 GET 或 HEAD', { Allow: 'GET, HEAD' });
  }
  try {
    // 在 URL 规范化抹掉点段前检查宿主提供的原始路径；查询参数不参与文件定位。
    const urlParts = /^https?:\/\/[^/?#]+(\/[^?#]*)?(?:[?#]|$)/i.exec(request.url);
    if (!urlParts) throw failure(400, '试玩路径无效');
    const route = parsePath(urlParts[1] || '/');
    const artifactRow = await env.DB.prepare('SELECT data FROM records WHERE kind = ? AND id = ?')
      .bind('artifacts', route.artifactId).first();
    if (!artifactRow) return errorResponse(request, 404, '试玩版本不存在');
    const artifact = JSON.parse(artifactRow.data);
    if (!artifact || typeof artifact !== 'object' || Array.isArray(artifact)) throw failure(503, '试玩存储暂不可用');
    if (route.mode === 'runtime' && artifact.runtime_local !== true) {
      return errorResponse(request, 403, '版本未启用独立运行');
    }
    const file = await env.DB.prepare(
      'SELECT object_key, sha256, bytes FROM artifact_files WHERE artifact_id = ? AND path = ?',
    ).bind(route.artifactId, route.path).first();
    if (!file) return errorResponse(request, 404, '试玩文件不存在');
    if (typeof file.object_key !== 'string' || !file.object_key || !/^[a-f0-9]{64}$/i.test(file.sha256)
        || !Number.isSafeInteger(file.bytes) || file.bytes < 0) throw failure(503, '试玩存储暂不可用');
    // R2 是扁平键空间：只读取登记的 object_key，不拼接或接受请求中的 R2 键。
    const metadata = await env.FILES.head(file.object_key);
    if (!metadata || metadata.size !== file.bytes || typeof metadata.etag !== 'string') {
      throw failure(503, '试玩存储暂不可用');
    }
    const etag = `"${file.sha256.toLowerCase()}"`;
    const extension = route.path.slice(route.path.lastIndexOf('.')).toLowerCase();
    const headers = {
      ...baseHeaders(),
      'Content-Security-Policy': route.mode === 'runtime' ? RUNTIME_CSP : PLAY_CSP,
      'Content-Type': MIME[extension] || 'application/octet-stream',
      'Accept-Ranges': 'bytes', ETag: etag,
    };
    if (matchesEtag(request.headers.get('If-None-Match'), etag)) {
      return new Response(null, { status: 304, headers });
    }
    let range;
    try {
      range = parseRange(request.headers.get('Range'), metadata.size);
    } catch (error) {
      return errorResponse(request, 416, error.message, {
        ...headers, 'Content-Type': 'application/json; charset=utf-8',
        'Content-Range': `bytes */${metadata.size}`,
      });
    }
    headers['Content-Length'] = String(range ? range.length : metadata.size);
    if (range) headers['Content-Range'] = `bytes ${range.start}-${range.end}/${metadata.size}`;
    const status = range ? 206 : 200;
    if (request.method === 'HEAD') return new Response(null, { status, headers });
    const options = { onlyIf: { etagMatches: metadata.etag } };
    if (range) options.range = { offset: range.offset, length: range.length };
    // head/get 之间的对象变更必须失败关闭，避免返回错误大小或旧登记文件的部分数据。
    const object = await env.FILES.get(file.object_key, options);
    if (!object?.body || object.size !== metadata.size || object.etag !== metadata.etag
        || (range && (!object.range || object.range.offset !== range.offset || object.range.length !== range.length))) {
      if (object?.body) await object.body.cancel().catch(() => {});
      throw failure(503, '试玩存储暂不可用');
    }
    // 未迁移：旧 boot.js 的已知散列通用兼容补丁；不做 site-lock 适配，也不修改历史游戏。
    return new Response(object.body, { status, headers });
  } catch (error) {
    const known = error instanceof HttpError;
    return errorResponse(request, known ? error.status : 503, known ? error.message : '试玩存储暂不可用');
  }
}
