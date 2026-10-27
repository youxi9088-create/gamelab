// 云端只读门户：给真实前端 web/ 提供浏览所需的状态。
//
// 变体 B（平台留本地、云做门面）下云端只提供读；派单/转换/验收仍走本地平台。
// 两个硬约束决定了这里不能"直接把 records 全量返回"：
//   - Workers Free 每请求 10 ms CPU，序列化几十 MB JSON 必然超限
//   - 单条 records 的 report 字段最大 810 KB（实测）
// 因此：按需取 kind、裁剪超大字段、事件只取最近若干条。

const STATE_KINDS = ['candidates', 'versions', 'jobs', 'batches', 'sources', 'tools', 'messages', 'rounds', 'game_test_runs'];
const RECENT_EVENTS = 150;
const MAX_FIELD_BYTES = 65536;
// report 里只有这几项前端用得到，其余（auto_repair / runtime_smoke 等）动辄几百 KB。
const REPORT_KEYS = ['path', 'recovery_kind', 'game_spec', 'runtime_viewport', 'runtime_verified', 'entry'];
const TRIM_REPORT_KINDS = new Set(['versions', 'jobs', 'rounds', 'candidates']);

function sizeOf(value) {
  try {
    return JSON.stringify(value).length;
  } catch {
    return Number.MAX_SAFE_INTEGER;
  }
}

function trimReport(report) {
  if (!report || typeof report !== 'object' || Array.isArray(report)) return undefined;
  const kept = {};
  for (const key of REPORT_KEYS) {
    if (key in report && sizeOf(report[key]) <= MAX_FIELD_BYTES) kept[key] = report[key];
  }
  return kept;
}

/** 去掉任何超过 MAX_FIELD_BYTES 的字段，保证响应体与序列化开销可控。 */
export function slim(record, kind) {
  const out = {};
  for (const [key, value] of Object.entries(record)) {
    if (key === 'password_hash' || key === 'token' || key === 'lease_token') continue;
    if (key === 'report' && TRIM_REPORT_KINDS.has(kind)) {
      const trimmed = trimReport(value);
      if (trimmed && Object.keys(trimmed).length) out[key] = trimmed;
      continue;
    }
    if (sizeOf(value) > MAX_FIELD_BYTES) continue;
    out[key] = value;
  }
  return out;
}

/** 记录本身小于阈值时无需逐字段测量——避免几千次 JSON.stringify 白烧 CPU。 */
function parseRow(row, kind) {
  let value;
  try {
    value = JSON.parse(row.data);
  } catch {
    return null;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  if (row.data.length <= MAX_FIELD_BYTES && !TRIM_REPORT_KINDS.has(kind)) {
    const { password_hash, token, lease_token, ...safe } = value;
    return safe;
  }
  return slim(value, kind);
}

// report 最大 810 KB（实测）。若整条捞回 Worker 再解析，光 JSON.parse 就会耗尽
// 免费版 10 ms CPU。改为让 D1 在库内裁掉 report、只回传需要的小字段。
const SLIM_SQL = `SELECT id,
  json_remove(data, '$.report') AS data,
  json_extract(data, '$.report.path') AS report_path,
  json_extract(data, '$.report.recovery_kind') AS report_kind,
  json_extract(data, '$.report.runtime_verified') AS report_verified,
  json_extract(data, '$.report.game_spec') AS report_spec,
  json_extract(data, '$.report.runtime_viewport') AS report_viewport
  FROM records WHERE kind = ? ORDER BY rowid DESC`;

function rebuildReport(row) {
  const report = {};
  if (row.report_path !== null && row.report_path !== undefined) report.path = row.report_path;
  if (row.report_kind != null) report.recovery_kind = row.report_kind;
  if (row.report_verified != null) report.runtime_verified = row.report_verified;
  if (row.report_spec != null) {
    try {
      report.game_spec = JSON.parse(row.report_spec);
    } catch {}
  }
  if (row.report_viewport != null) {
    try {
      report.runtime_viewport = JSON.parse(row.report_viewport);
    } catch {}
  }
  return Object.keys(report).length ? report : undefined;
}

async function allRecords(env, kind) {
  const slimKind = TRIM_REPORT_KINDS.has(kind);
  const statement = env.DB.prepare(slimKind ? SLIM_SQL : 'SELECT id, data FROM records WHERE kind = ? ORDER BY rowid DESC');
  const { results } = await statement.bind(kind).all();
  const out = [];
  for (const row of results) {
    const value = parseRow(row, kind);
    if (!value) continue;
    if (slimKind) {
      const report = rebuildReport(row);
      if (report) value.report = report;
    }
    out.push({ ...value, id: row.id });
  }
  return out;
}

async function recentEvents(env) {
  const { results } = await env.DB.prepare('SELECT id, data FROM records WHERE kind = ? ORDER BY rowid DESC LIMIT ?')
    .bind('events', RECENT_EVENTS).all();
  const out = [];
  for (const row of results) {
    const value = parseRow(row, 'events');
    if (value) out.push({ ...value, id: row.id });
  }
  return out;
}

/** 只取用户名映射，绝不外泄哈希。 */
async function actorNames(env) {
  const { results } = await env.DB.prepare(
    "SELECT id, json_extract(data, '$.username') AS name FROM records WHERE kind = 'users'").all();
  return new Map(results.filter(row => row.name).map(row => [row.id, row.name]));
}

function withPreview(version) {
  const raw = version.preview_url;
  if (typeof raw === 'string' && /^\/(play|runtime)\//.test(raw)) return raw;
  if (version.artifact_id && version.entry) {
    return `/runtime/${encodeURIComponent(version.artifact_id)}/${version.entry.split('/').map(encodeURIComponent).join('/')}`;
  }
  return null;
}

export async function state(env, session, publicUser) {
  const collections = {};
  for (const kind of STATE_KINDS) collections[kind] = await allRecords(env, kind);
  collections.events = await recentEvents(env);

  for (const version of collections.versions) {
    version.preview_url = withPreview(version);
  }

  const names = await actorNames(env);
  for (const kind of ['jobs', 'messages', 'versions', 'candidates']) {
    for (const row of collections[kind] || []) {
      if (row.created_by) row.created_by_name = names.get(row.created_by) || row.created_by;
    }
  }

  const profiles = new Map();
  for (const profile of await allRecords(env, 'game_profiles')) {
    if (profile.profile) profiles.set(profile.id, profile.profile);
  }
  for (const version of collections.versions) {
    if (profiles.has(version.id)) version.game_profile = profiles.get(version.id);
  }

  const pricing = await env.DB.prepare("SELECT data FROM records WHERE kind = 'settings' AND id = 'ai_pricing'").first();
  let rates = {};
  if (pricing) {
    try {
      rates = JSON.parse(pricing.data).rates || {};
    } catch {}
  }

  return {
    ...collections,
    ai_pricing: rates,
    current_user: publicUser(session.user),
    migration: {
      phase: 'public-read-portal', read_only: true, task_submission: false,
      executor_claim: false, acceptance_mutations: false,
      // 云端只保留审核通过（approved/published）产物用于试玩；草稿与已取代版本未上传。
      playable_statuses: ['approved', 'published'],
      note: '管理与转换接口仍由本地平台提供；此站点只读。',
    },
  };
}
