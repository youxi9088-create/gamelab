import { createHash, timingSafeEqual } from 'node:crypto';
import { authenticate, status as authStatus, login, logout, publicUser } from './auth.mjs';
import { play, parsePath } from './playback.mjs';
import { state as portalState, services as portalServices } from './portal.mjs';

const MAX_UPLOAD = 64 * 1024 * 1024;
const json = (status, body, extra = {}) => Response.json(body, { status, headers: {
  'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', ...extra,
}});
function fail(status, message) { throw Object.assign(new Error(message), { status }); }

// 门户状态是只读的，只在数据同步时变化。每次请求都现算一遍意味着：
// 15 次 D1 查询 + 解析 + 序列化约 730 KB（实测 stringify 就要 6–8 ms），
// 而 Workers Free 每请求只有 10 ms CPU——现算必然偶发 1102。
// 改为：同步时预生成核心 JSON 存进 R2，请求时直接把字节流拼上 current_user 返回。
// 这样 CPU 几乎为 0，且不受 D1 单日读取配额影响。
const STATE_OBJECT = 'portal/state-core.json';

export async function portalStateResponse(env, session) {
  const cached = await env.FILES.get(STATE_OBJECT);
  if (!cached) return json(200, await portalState(env, session, publicUser));
  const core = (await cached.text()).replace(/\}\s*$/, '');
  // 预生成内容不含 current_user（它随会话变化），这里只补这一项，不做全量解析。
  const body = `${core},"current_user":${JSON.stringify(publicUser(session.user))}}`;
  return new Response(body, { status: 200, headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff',
  } });
}
const hex = data => createHash('sha256').update(data).digest('hex');
function validToken(request, env) {
  // This secret authorizes only copying already registered immutable files, never
  // changing jobs, users, versions or acceptance states. Not a task lease token.
  if (!env.MIGRATION_UPLOAD_TOKEN || env.MIGRATION_UPLOAD_TOKEN.length < 32) fail(503, '迁移上传授权尚未配置');
  const auth = request.headers.get('Authorization') || '';
  const supplied = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const a = createHash('sha256').update(supplied).digest();
  const b = createHash('sha256').update(env.MIGRATION_UPLOAD_TOKEN).digest();
  if (!timingSafeEqual(a, b)) fail(401, '迁移上传授权无效');
}
function hashMatches(metadata, digest) {
  const checksum = metadata?.checksums?.sha256;
  if (checksum) return Buffer.from(checksum, 'base64').toString('hex') === digest;
  return metadata?.customMetadata?.sha256 === digest;
}
async function upload(request, env) {
  validToken(request, env);
  if (!['PUT', 'HEAD'].includes(request.method)) return json(405, { error: '仅支持 PUT 或 HEAD' }, { Allow: 'PUT, HEAD' });
  const pathname = new URL(request.url).pathname;
  const match = /^\/api\/executor\/artifacts\/([^/]+)\/files\/(.+)$/.exec(pathname);
  if (!match) fail(404, '迁移上传路径不存在');
  const route = parsePath(`/runtime/${match[1]}/${match[2]}`);
  const file = await env.DB.prepare('SELECT object_key, sha256, bytes FROM artifact_files WHERE artifact_id = ? AND path = ?')
    .bind(route.artifactId, route.path).first();
  if (!file) fail(404, '必须先完成私密迁移清单登记，不能上传未知产物');
  if (!/^[a-f0-9]{64}$/.test(file.sha256) || !Number.isSafeInteger(file.bytes) || file.bytes < 0) fail(503, '迁移清单无效');
  const known = await env.FILES.head(file.object_key);
  if (request.method === 'HEAD') {
    if (!known) return new Response(null, { status: 404 });
    if (known.size !== file.bytes || !hashMatches(known, file.sha256)) fail(409, '已存在对象不符合清单，拒绝覆盖');
    return new Response(null, { headers: { 'X-Content-SHA256': file.sha256, 'Content-Length': String(file.bytes), 'Cache-Control': 'no-store' } });
  }
  if (request.headers.get('X-Content-SHA256') !== file.sha256 || request.headers.get('Content-Length') !== String(file.bytes)) fail(409, '文件大小或摘要不符合登记清单');
  const encodedKey = request.headers.get('X-Object-Key');
  if (encodedKey && decodeURIComponent(encodedKey) !== file.object_key) fail(409, '对象键不符合登记清单');
  if (file.bytes > MAX_UPLOAD) fail(413, '首阶段上传只支持单文件不超过 64 MiB；大文件需后续分片适配');
  if (known) {
    if (known.size !== file.bytes || !hashMatches(known, file.sha256)) fail(409, '已存在对象不符合清单，拒绝覆盖');
    return json(200, { ok: true, reused: true, sha256: file.sha256, bytes: file.bytes });
  }
  // R2 verifies the declared digest while streaming. Never buffer a game package
  // into a Workers isolate or accept uploader metadata as proof of integrity.
  let object;
  try {
    object = await env.FILES.put(file.object_key, request.body, {
      sha256: file.sha256, onlyIf: { etagDoesNotMatch: '*' },
      customMetadata: { sha256: file.sha256 },
    });
  } catch { fail(422, '文件校验或写入失败，不能认定迁移成功'); }
  if (!object) {
    const raced = await env.FILES.head(file.object_key);
    if (!raced || raced.size !== file.bytes || !hashMatches(raced, file.sha256)) fail(409, '并发上传对象冲突');
  }
  return json(200, { ok: true, sha256: file.sha256, bytes: file.bytes });
}
export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      if (url.pathname === '/health' && request.method === 'GET') return json(200, { ok: true, service: 'cloudflare-migration-prototype' });
      if (url.pathname === '/api/auth/status' && request.method === 'GET') return await authStatus(request, env);
      if (url.pathname === '/api/auth/login') return await login(request, env);
      if (url.pathname.startsWith('/api/executor/artifacts/')) return await upload(request, env);
      const session = await authenticate(request, env);
      if (/^\/(play|runtime)\//.test(url.pathname)) return await play(request, env, session);
      if (url.pathname.startsWith('/api/')) {
        if (!session) return json(401, { error: '请先登录门户' });
        if (url.pathname === '/api/session' && request.method === 'GET') return json(200, { csrf: session.csrf });
        if (url.pathname === '/api/auth/logout') return await logout(request, env, session);
        if (url.pathname === '/api/state' && request.method === 'GET') {
          return await portalStateResponse(env, session);
        }
        if (url.pathname === '/api/services' && request.method === 'GET') {
          return json(200, portalServices());
        }
        // 采集要访问来源站点并调用 AI，云端不执行；只展示本地平台已产生的建议。
        // 给明确原因，避免前端把 501 误报成"无法连接平台"。
        if (url.pathname.startsWith('/api/discovery/')) {
          return json(501, { error: '采集扫描由本地平台执行；云端站点只读展示已产生的采集建议。',
            implemented: false, read_only: true });
        }
        return json(501, { error: '该管理或转换接口尚未迁移，旧站保持运行；不能替代完整平台', implemented: false });
      }
      if (!['GET', 'HEAD'].includes(request.method)) return json(405, { error: '不支持的请求方法' });
      if (env.ASSETS) return env.ASSETS.fetch(request);
      return json(404, { error: '页面尚未绑定' });
    } catch (error) {
      return json(error.status || 503, { error: error.status ? error.message : '迁移服务暂不可用，请稍后重试' });
    }
  },
};
