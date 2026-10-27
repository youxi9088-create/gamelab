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

/**
 * 服务状态。云端只读门面不托管 AI 与执行器，如实标注由本地平台提供，
 * 避免前端拿到空数组后误判为"平台异常"。
 */
// ---- 看板指标：移植 controlplane/usage.py 的 aggregate / operations ----
// 时区与本地平台一致（+08:00），否则按天/周/月分桶会错位。
const TZ_OFFSET_MS = 8 * 3600 * 1000;
const isoDate = d => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;

function bucketOf(iso, period) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  const d = new Date(t + TZ_OFFSET_MS);
  if (period === 'month') return isoDate(d).slice(0, 7);
  if (period !== 'week') return isoDate(d);
  const dt = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const monday = dt - ((new Date(dt).getUTCDay() + 6) % 7) * 86400000;
  return isoDate(new Date(monday));
}

function aggregateUsage(rows, period) {
  const out = new Map();
  for (const row of rows) {
    const bucket = bucketOf(row.created_at, period);
    if (!bucket) continue;
    const key = `${bucket}|${row.candidate_id || ''}|${row.stage || ''}`;
    let r = out.get(key);
    if (!r) {
      r = { period: bucket, candidate_id: row.candidate_id || '', stage: row.stage || '',
        calls: 0, input_tokens: 0, output_tokens: 0, cached_input_tokens: 0, cache_write_tokens: 0,
        cache_known_calls: 0, cache_unknown_calls: 0, unknown_usage_calls: 0, unknown_cost_calls: 0,
        duration_seconds: 0, costs: {} };
      out.set(key, r);
    }
    r.calls += 1;
    r.duration_seconds += row.duration_seconds || 0;
    r.input_tokens += row.input_tokens || 0;
    r.output_tokens += row.output_tokens || 0;
    r.cached_input_tokens += row.cached_input_tokens || row.cache_read_input_tokens || 0;
    r.cache_write_tokens += row.cache_write_tokens || row.cache_creation_input_tokens || 0;
    if (row.input_tokens == null || row.output_tokens == null) r.unknown_usage_calls += 1;
    if (row.estimated_cost == null) r.unknown_cost_calls += 1;
    else r.costs[row.currency || 'USD'] = (r.costs[row.currency || 'USD'] || 0) + row.estimated_cost;
  }
  return [...out.values()].sort((a, b) => String(b.period).localeCompare(String(a.period))
    || String(a.candidate_id).localeCompare(String(b.candidate_id))
    || String(a.stage).localeCompare(String(b.stage)));
}

function operationStats(events, jobs, period) {
  const owners = new Map(jobs.map(j => [j.id, j.candidate_id]));
  const starts = new Map();
  const rows = new Map();
  const sorted = [...events].sort((a, b) => String(a.created_at || '').localeCompare(String(b.created_at || '')));
  for (const e of sorted) {
    if (!e.node || !owners.has(e.job_id)) continue;
    const key = `${e.job_id}|${e.round}|${e.attempt}|${e.node}`;
    if (e.node_status === 'running') { starts.set(key, e); continue; }
    if (!['succeeded', 'failed', 'cancelled'].includes(e.node_status) || !starts.has(key)) continue;
    const start = starts.get(key);
    starts.delete(key);
    const bucket = bucketOf(e.created_at, period);
    if (!bucket) continue;
    const group = `${bucket}|${owners.get(e.job_id) || ''}|${e.node}`;
    let r = rows.get(group);
    if (!r) {
      r = { period: bucket, candidate_id: owners.get(e.job_id) || '', stage: e.node,
        executions: 0, failed: 0, duration_seconds: 0 };
      rows.set(group, r);
    }
    r.executions += 1;
    if (e.node_status !== 'succeeded') r.failed += 1;
    const span = (Date.parse(e.created_at) - Date.parse(start.created_at)) / 1000;
    r.duration_seconds += Number.isFinite(span) ? Math.max(0, span) : 0;
  }
  return [...rows.values()].sort((a, b) => String(b.period).localeCompare(String(a.period)));
}

export function services() {
  const detail = '该服务由本地平台提供，云端站点只读，不做模型调用或转换任务。';
  return [
    { id: 'ai', base_url: '', model: '', backend: 'local', has_key: false,
      status: '未由云端托管', detail, checked_at: null, connection_label: '本地平台' },
    { id: 'wechat', base_url: '', model: '', backend: 'builtin', has_key: false,
      status: '未由云端托管', detail: '转换执行器运行于本地平台；云端仅提供已通过审核产物的试玩。',
      checked_at: null, checks: {} },
  ];
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

  // 看板指标：只用于统计，不进响应体（避免把 2531 条事件塞回浏览器）。
  const usageRows = await allRecords(env, 'ai_usage');
  const allEvents = await allRecords(env, 'events');
  const supply = await allRecords(env, 'supply');

  const periods = ['day', 'week', 'month'];
  const usage = {};
  const operations = {};
  for (const period of periods) {
    usage[period] = aggregateUsage(usageRows, period);
    operations[period] = operationStats(allEvents, collections.jobs, period);
  }

  const templates = new Set();
  const published = new Set();
  for (const row of supply) {
    const id = row.template && row.template.template_id;
    if (!id) continue;
    templates.add(id);
    if (row.state === 'published') published.add(id);
  }

  const settings = {};
  for (const row of await allRecords(env, 'settings')) settings[row.id] = row;
  const pricing = settings.ai_pricing && settings.ai_pricing.rates ? settings.ai_pricing.rates : {};

  return {
    ...collections,
    ai_pricing: pricing,
    settings,
    usage,
    operation_stats: operations,
    downstream_summary: {
      templates: templates.size, published: published.size,
      scope: '仅下游实际返回模板 ID 的记录；提交成功不计入模板生成',
    },
    // 供货服务的密钥与归档目录只存在本地配置文件（data/supply-config.json），
    // 不在 D1 里，云端如实标注由本地平台提供，不伪造配置状态。
    supply_config: { local_only: true, detail: '供货服务配置由本地平台管理，云端只读。' },
    supply_service: { local_only: true, values: {}, has_secret: false, check: {},
      detail: '供货服务由本地平台提供，云端不发起供货请求。' },
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
