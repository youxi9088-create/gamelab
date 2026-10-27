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
// report 里只有这几项用得到，其余（auto_repair / runtime_smoke 等）动辄几百 KB。
// 第三列为 true 表示值是 JSON 串，需要 JSON.parse 还原。
//   engine —— 5 个版本的引擎标签只存在于 report（最长 8 字节）。丢了它，"按引擎分析"会退化成"待分析"。
//   blocker —— 任务阻断码（最长 323 字节）。丢了它，失败原因只剩状态码。
const REPORT_FIELDS = [
  ['path', '$.report.path', false],
  ['recovery_kind', '$.report.recovery_kind', false],
  ['game_spec', '$.report.game_spec', true],
  ['runtime_viewport', '$.report.runtime_viewport', true],
  ['runtime_verified', '$.report.runtime_verified', false],
  ['entry', '$.report.entry', false],
  ['engine', '$.report.engine', false],
  ['blocker', '$.report.blocker', true],
];
const REPORT_KEYS = REPORT_FIELDS.map(([key]) => key);
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

// Workers Free 每请求只有 10 ms CPU，而 JSON.stringify 的成本与体积线性相关
// （实测 1 MB ≈ 8.5 ms，光序列化就会顶满）。所以体积不是"优化项"，是"能不能跑"。
// 下面两组白名单 = 前端实际读取的字段（逐个 grep web/ 确认），其余一律不留。
// 全量返回 981 KB：rounds 140 KB + recommendations 396 KB 是大头，裁剪后约 620 KB。
const ROUND_KEYS = ['id', 'candidate_id', 'job_id', 'round', 'status', 'reason', 'created_at'];
const RECOMMENDATION_KEYS = ['id', 'run_id', 'title', 'source', 'source_id', 'category',
  'platform_category_missing', 'reason', 'gameplay', 'gameplay_zh', 'category_basis',
  'description_basis', 'content_sha256', 'created_at', 'status', 'url', 'job_id', 'evidence_url'];

function pick(value, keys) {
  const out = {};
  for (const key of keys) if (key in value) out[key] = value[key];
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
// SQL 由 REPORT_FIELDS 生成：字段清单只维护一处，避免 SQL 与 rebuildReport 漂移。
export const SLIM_SQL = `SELECT id, json_remove(data, '$.report') AS data, ${REPORT_FIELDS
  .map(([key, path]) => `json_extract(data, '${path}') AS r_${key}`).join(', ')}
  FROM records WHERE kind = ? ORDER BY rowid DESC`;

function rebuildReport(row) {
  const report = {};
  for (const [key, , isJson] of REPORT_FIELDS) {
    const raw = row[`r_${key}`];
    if (raw === null || raw === undefined) continue;
    if (!isJson) { report[key] = raw; continue; }
    try {
      report[key] = JSON.parse(raw);
    } catch {
      report[key] = raw;
    }
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

// ---- 游戏维度明细：移植 usage.py::game_totals + dashboard_operations.py::overview ----
// 本地平台在 service.state() 里的顺序是：effective_engine → game_totals → overview。
// 顺序不能变：先补引擎标签，"按引擎分析"才不会把未识别的聚成一团。
const PLACEHOLDER_ENGINES = new Set(['待分析', '待识别', '未识别', 'unknown']);
const RECOVERY_ENGINES = {
  'discovered-web-cocos2': 'Cocos 2', 'discovered-web-three': 'Three.js',
  'discovered-web-defold': 'Defold', 'discovered-web-browser': '通用 Web 运行包',
  'discovered-web-ruffle': 'Ruffle / Flash',
};

/** 用版本证据补齐缺失的引擎标签，不改写已入库的历史。 */
function effectiveEngine(candidate, versions) {
  const current = String(candidate.engine || '').trim();
  if (current && !PLACEHOLDER_ENGINES.has(current.toLowerCase())) return current;
  const matching = versions.filter(v => v.candidate_id === candidate.id)
    .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
  for (const version of matching) {
    const report = version.report;
    if (!report || typeof report !== 'object') continue;
    const engine = report.engine || RECOVERY_ENGINES[report.recovery_kind];
    if (typeof engine === 'string' && engine.trim() && !PLACEHOLDER_ENGINES.has(engine.trim().toLowerCase())) {
      return engine.trim().slice(0, 120);
    }
  }
  return current || '未识别';
}

const TIMING_NODES = new Set(['identify', 'acquire', 'analysis', 'adapt', 'test', 'delivery']);
const byCreatedDesc = (a, b) => String(b.created_at || '').localeCompare(String(a.created_at || ''));

function groupBy(list, key) {
  const out = new Map();
  for (const item of list || []) {
    const k = item[key];
    if (!out.has(k)) out.set(k, []);
    out.get(k).push(item);
  }
  return out;
}

/** 已记录执行耗时：区间并集去重，不含排队与验收等待。 */
function gameTotals(candidates, jobs, events, usage) {
  const owners = new Map(jobs.map(j => [j.id, j.candidate_id]));
  const rows = new Map();
  for (const candidate of candidates) {
    if (candidate.observations && candidate.observations.catalog_hidden) continue;
    rows.set(candidate.id, {
      candidate_id: candidate.id, calls: 0, input_tokens: 0, output_tokens: 0,
      cached_input_tokens: 0, cache_write_tokens: 0, cache_known_calls: 0, cache_unknown_calls: 0,
      unknown_usage_calls: 0, known_token_fields: 0, input_known_calls: 0, output_known_calls: 0,
      duration_seconds: null, unpaired_events: 0,
    });
  }
  const intervals = new Map([...rows.keys()].map(id => [id, []]));
  const starts = new Map();
  for (const event of [...events].sort((a, b) => String(a.created_at || '').localeCompare(String(b.created_at || '')))) {
    const cid = owners.get(event.job_id);
    if (!rows.has(cid) || !TIMING_NODES.has(event.node)) continue;
    const key = `${event.job_id}|${event.round}|${event.attempt}|${event.node}`;
    if (event.node_status === 'running') {
      if (starts.has(key)) rows.get(cid).unpaired_events += 1;
      starts.set(key, event.created_at);
      continue;
    }
    if (!['succeeded', 'failed', 'cancelled'].includes(event.node_status)) continue;
    const started = starts.get(key);
    if (started === undefined) { rows.get(cid).unpaired_events += 1; continue; }
    starts.delete(key);
    const a = Date.parse(started);
    const b = Date.parse(event.created_at);
    if (Number.isFinite(a) && Number.isFinite(b) && b >= a) intervals.get(cid).push([a, b]);
    else rows.get(cid).unpaired_events += 1;
  }
  for (const key of starts.keys()) {
    const cid = owners.get(String(key).split('|')[0]);
    if (rows.has(cid)) rows.get(cid).unpaired_events += 1;
  }
  for (const [cid, spans] of intervals) {
    const merged = [];
    for (const [a, b] of spans.sort((x, y) => x[0] - y[0])) {
      const last = merged[merged.length - 1];
      if (last && a <= last[1]) last[1] = Math.max(b, last[1]);
      else merged.push([a, b]);
    }
    if (merged.length) rows.get(cid).duration_seconds = merged.reduce((sum, [a, b]) => sum + (b - a) / 1000, 0);
  }
  const seen = new Set();
  for (const row of usage) {
    const cid = row.candidate_id;
    if (!rows.has(cid)) continue;
    if (row.id) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
    }
    const r = rows.get(cid);
    r.calls += 1;
    r.cached_input_tokens += row.cached_input_tokens || 0;
    r.cache_write_tokens += row.cache_write_tokens || 0;
    if (row.cached_input_tokens != null && row.cache_write_tokens != null) r.cache_known_calls += 1;
    else r.cache_unknown_calls += 1;
    for (const field of ['input_tokens', 'output_tokens']) {
      r[field] += row[field] || 0;
      if (row[field] != null) {
        r.known_token_fields += 1;
        if (field === 'input_tokens') r.input_known_calls += 1;
        else r.output_known_calls += 1;
      }
    }
    if (row.input_tokens == null || row.output_tokens == null) r.unknown_usage_calls += 1;
  }
  return [...rows.values()];
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** 只读运营看板。历史未测量的量保持未知，不用 0 冒充。 */
function operationalOverview(state, usage, clockMs = Date.now()) {
  const stamp = value => {
    const t = Date.parse(value);
    return Number.isFinite(t) ? t : null;
  };
  const age = value => {
    const t = stamp(value);
    return t == null ? null : Math.max(0, (clockMs - t) / 1000);
  };
  const candidates = (state.candidates || []).filter(c => !(c.observations && c.observations.catalog_hidden));
  const totals = new Map((state.game_conversion_stats || []).map(r => [r.candidate_id, r]));
  const jobsBy = groupBy(state.jobs, 'candidate_id');
  const versionsBy = groupBy(state.versions, 'candidate_id');
  const supplyBy = groupBy(state.supply, 'candidate_id');
  const usageBy = groupBy(usage, 'candidate_id');

  const rows = [];
  const engines = new Map();
  const failures = new Map();
  const firstAccepts = [];
  const publishedDates = [];

  for (const candidate of candidates) {
    const cid = candidate.id;
    const jobs = [...(jobsBy.get(cid) || [])].sort(byCreatedDesc);
    const job = jobs.find(x => x.status !== 'superseded') || jobs[0] || {};
    const versions = versionsBy.get(cid) || [];
    const accepted = versions.filter(v => v.status === 'approved' || v.status === 'published');
    const dates = accepted.map(v => stamp(v.approved_at)).filter(t => t != null);
    if (dates.length) firstAccepts.push(Math.min(...dates));
    const supplies = [...(supplyBy.get(cid) || [])].sort(byCreatedDesc);
    const supply = supplies[0] || {};
    for (const item of supplies) {
      const published = stamp(item.published_at);
      if (item.state === 'published' && published != null) publishedDates.push(published);
    }
    const t = totals.get(cid) || {};
    const costs = {};
    let unknownCost = 0;
    let retryTokens = 0;
    let retryUnknown = 0;
    for (const call of usageBy.get(cid) || []) {
      if (call.estimated_cost == null) unknownCost += 1;
      else {
        const currency = call.currency || 'USD';
        costs[currency] = (costs[currency] || 0) + call.estimated_cost;
      }
      if ((call.round || 1) > 1) {
        retryTokens += (call.input_tokens || 0) + (call.output_tokens || 0);
        if (call.input_tokens == null || call.output_tokens == null) retryUnknown += 1;
      }
    }
    const reason = job.reason || job.question || '';
    if (['failed', 'blocked', 'waiting_input'].includes(job.status)) {
      const blocker = job.report && job.report.blocker;
      const code = (blocker && blocker.code) || job.status;
      failures.set(code, (failures.get(code) || 0) + 1);
    }
    let since = null;
    if (job.status === 'running') since = job.started_at;
    else if (job.status === 'review') {
      const target = versions.find(v => v.id === job.version_id);
      since = target ? target.created_at : null;
    }
    const engine = candidate.engine || '未识别';
    const row = {
      ...t,
      title: candidate.title || cid,
      engine,
      route: job.route || '未记录',
      job_id: job.id,
      status: job.status || candidate.status || 'candidate',
      stage: (job.pipeline && job.pipeline.current) || job.stage,
      status_age_seconds: age(since),
      reason,
      round: job.round,
      accepted: accepted.length > 0,
      costs,
      unknown_cost_calls: unknownCost,
      retry_tokens: retryTokens,
      retry_unknown_calls: retryUnknown,
      supply_status: supply.state || supply.status || 'not_submitted',
      supply_reason: supply.notice || supply.error_code || '',
      supply_error: supply.error_code,
      supply_age_seconds: age(supply.created_at),
      candidate_id: cid,
    };
    rows.push(row);
    let group = engines.get(engine);
    if (!group) {
      group = { name: engine, games: 0, accepted: 0, calls: 0, tokens: 0, known_fields: 0, unknown: 0 };
      engines.set(engine, group);
    }
    group.games += 1;
    group.accepted += accepted.length > 0 ? 1 : 0;
    group.calls += t.calls || 0;
    group.tokens += (t.input_tokens || 0) + (t.output_tokens || 0);
    group.unknown += t.unknown_usage_calls || 0;
    group.known_fields += t.known_token_fields || 0;
  }

  const candidateIds = new Set(candidates.map(c => c.id));
  const seen = new Set();
  const models = new Map();
  for (const call of usage) {
    if (!candidateIds.has(call.candidate_id)) continue;
    if (call.id) {
      if (seen.has(call.id)) continue;
      seen.add(call.id);
    }
    const key = `${call.provider || '未记录'} / ${call.model || '未记录'}`;
    let group = models.get(key);
    if (!group) {
      group = { name: key, calls: 0, tokens: 0, known_fields: 0, unknown: 0, costs: {} };
      models.set(key, group);
    }
    group.calls += 1;
    group.tokens += (call.input_tokens || 0) + (call.output_tokens || 0);
    group.known_fields += (call.input_tokens != null ? 1 : 0) + (call.output_tokens != null ? 1 : 0);
    if (call.input_tokens == null || call.output_tokens == null) group.unknown += 1;
    if (call.estimated_cost != null) {
      const currency = call.currency || 'USD';
      group.costs[currency] = (group.costs[currency] || 0) + call.estimated_cost;
    }
  }

  const calls = rows.reduce((sum, r) => sum + (r.calls || 0), 0);
  const unknown = rows.reduce((sum, r) => sum + (r.unknown_usage_calls || 0), 0);
  const measured = rows.filter(r => r.duration_seconds != null);
  const complete = measured.filter(r => !r.unpaired_events);

  const local = new Date(clockMs + TZ_OFFSET_MS);
  const midnight = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
  const weekStart = midnight - ((new Date(midnight).getUTCDay() + 6) % 7) * 86400000;
  const lastWeek = weekStart - 7 * 86400000;

  return {
    updated_at: new Date(clockMs).toISOString(),
    games: rows,
    models: [...models.values()],
    engines: [...engines.values()],
    failure_reasons: [...failures].map(([code, count]) => ({ code, count })),
    weekly_accepted: firstAccepts.filter(d => d >= weekStart && d <= clockMs).length,
    previous_week_accepted: firstAccepts.filter(d => d >= lastWeek && d < weekStart).length,
    weekly_published: publishedDates.length ? publishedDates.filter(d => d >= weekStart && d <= clockMs).length : null,
    token_coverage: calls ? (calls - unknown) / calls : null,
    calls,
    unknown_calls: unknown,
    timing_complete: complete.length,
    timing_measured: measured.length,
    games_count: rows.length,
    median_seconds: complete.length ? median(complete.map(r => r.duration_seconds)) : null,
    first_pass_rate: null,
    first_pass_note: '历史验收尝试未完整记录，暂不计算首次通过率；已入库数量不是首次通过数量。',
  };
}

// ---- 采集建议：移植 discovery / discovery_language / catalog_facets / conversion_plan ----
// 云端不跑采集（需要访问来源站点与 AI），只把本地已产生的建议如实呈现。
const DISCOVERY_DEFAULTS = {
  id: 'discovery', enabled: true, hour: 9, max_games: 12, max_pages: 2,
  auto_select: false, auto_dispatch: false, score_threshold: 85, daily_limit: 3,
  allowed_categories: [],
  aliases: {
    puzzle: '益智', casual: '休闲', simulation: '模拟经营', racing: '竞速', action: '动作',
    adventure: '冒险', arcade: '街机', survival: '生存', platformer: '平台跳跃', idle: '放置',
    strategy: '策略', sports: '体育', multiplayer: '多人', rpg: '角色扮演', education: '教育',
    sandbox: '沙盒', runner: '跑酷', running: '跑酷', shooting: '射击', shooter: '射击',
  },
};
const CJK = /[\u4e00-\u9fff]/;
const UNTRANSLATED = {
  reason: '建议核对来源玩法后决定是否采集',
  category_basis: '来源品类信息，待核对',
  description_basis: '来源公开说明，未经实际试玩',
};

/** 外文原文不外露给用户当中文看；没有中文译文时如实标注。 */
function recommendationPublic(item) {
  // selection_score 的 basis/scope 占了 118 KB，前端只读 value。
  const slimmed = pick(item, RECOMMENDATION_KEYS);
  if (item.selection_score && typeof item.selection_score === 'object') {
    slimmed.selection_score = { value: item.selection_score.value };
  }
  const row = slimmed;
  const source = String(row.gameplay || '');
  row.gameplay = row.gameplay_zh
    || (source ? (CJK.test(source) ? source : '来源提供了外文玩法说明，中文翻译待完成；可打开原站核对。') : '来源未提供玩法说明，待核对。');
  for (const key of ['reason', 'category_basis', 'description_basis']) {
    if (row[key] && !CJK.test(row[key])) row[key] = UNTRANSLATED[key];
  }
  if (row.gameplay_zh) row.description_basis = '来源公开说明的中文译文；未经实际试玩';
  delete row.gameplay_zh;
  return row;
}

function sourceKind(url, observations) {
  const o = observations && typeof observations === 'object' ? observations : {};
  let source = '';
  try {
    source = new URL(String(url).trim());
  } catch {
    source = null;
  }
  if (String(url).trim().startsWith('#小程序://')) return 'wechat';
  if (source && ['http:', 'https:'].includes(source.protocol.toLowerCase())) return 'web';
  const ids = [o.appid || '', ...(Array.isArray(o.appids) ? o.appids : [])];
  if (ids.some(id => typeof id === 'string' && /^wx[0-9a-fA-F]{16}$/.test(id))) return 'wechat';
  return 'unknown';
}

function facetsOf(candidate, aliases) {
  const raw = String(candidate.category || '').trim();
  const parts = raw.split(/[/／,，|·]/).map(p => p.trim()).filter(Boolean);
  const platforms = new Set(['微信小游戏', 'web游戏', 'web', 'cocos', 'cocos creator']);
  const categories = [...new Set(parts.filter(p => !platforms.has(p.toLowerCase()))
    .map(p => aliases[p.toLowerCase()] || p))];
  const kind = sourceKind(candidate.url, candidate.observations);
  const engines = [];
  if (kind === 'wechat' || parts.includes('微信小游戏')) engines.push('微信小游戏');
  else if (kind === 'web') engines.push('Web 游戏');
  if (/\bcocos\b/i.test(String(candidate.engine || ''))) engines.push('Cocos');
  return { categories: categories.length ? categories : ['未分类'], engines: engines.length ? engines : ['待识别'] };
}

const DEPENDENCY_KINDS = { code: '代码与引擎', resources: '资源', data: '配置数据', backend: '后端服务', platform: '平台接口' };

function dependencySummary(value) {
  const items = value && Array.isArray(value.items) ? value.items : [];
  const missing = Object.keys(DEPENDENCY_KINDS)
    .filter(key => !items.some(i => i.kind === key))
    .map(key => DEPENDENCY_KINDS[key]);
  const unresolved = items.filter(i => !['verified', 'not_applicable'].includes(i.status));
  return { total: items.length, verified: items.filter(i => i.status === 'verified').length,
    unresolved: unresolved.length, missing_categories: missing,
    ready: items.length > 0 && unresolved.length === 0 && missing.length === 0 };
}

const PLAN_LABELS = {
  revision: '沿已有版本续作', 'web-profile': '已登记 Web 适配', 'discovered-web': 'Web 引擎探测与原包适配',
  'embedded-lib': '内嵌 HTML 宿主适配', 'wxapkg-v1': 'Cocos 微信原包转换', 'provided-source': '静态源码整理',
  external: '已配置外部转换器', blocked: '材料或适配能力不足', ai: '显式 AI 玩法重建',
};

function modularCandidate(observation) {
  const leads = (observation.web_discovery || {}).iframe_hints || [];
  const urls = new Set();
  for (const hint of leads) {
    if (!hint || typeof hint !== 'object' || hint.evidence !== 'iframe-src') continue;
    if (!(hint.width > 200 && hint.height > 150)) continue;
    try {
      const parsed = new URL(String(hint.url || ''));
      if (parsed.protocol === 'https:' && (parsed.hostname || '').endsWith('.games.remix.gg')) urls.add(hint.url);
    } catch { /* 非 URL 的 hint 直接忽略 */ }
  }
  return urls.size === 1 ? [...urls][0] : null;
}

function conversionPlan(candidate, job) {
  const o = candidate.observations && typeof candidate.observations === 'object' ? candidate.observations : {};
  const kind = sourceKind(candidate.url, o);
  const evidence = [];
  const missing = [];
  const profile = o.web_runtime;
  const source = o.web_source || {};
  const assets = (source.files || []).some(f => f && f.file === 'asset-map.json');
  let route;
  // 云端拿不到转换器配置（tools 里的 base_url/backend 是本地登记项），
  // 因此 external / wxapkg-v1 两条路径无法判定，如实落到 blocked 而不是猜。
  if (job.continuation) { route = 'revision'; evidence.push('平台已绑定不可变基线版本'); }
  else if (job.stage === 'reconstruct') { route = 'ai'; evidence.push('任务已选择玩法重建阶段'); }
  else if (profile && profile.source_match) { route = 'web-profile'; evidence.push('来源地址匹配登记方案'); }
  else if (kind === 'web' && Object.keys(source).length && assets) { route = 'embedded-lib'; evidence.push('显式内嵌 HTML 与资源映射；宿主契约由执行器核对'); }
  else if (kind === 'web' && modularCandidate(o)) { route = 'discovered-web'; evidence.push('页面声明唯一 Remix 游戏 iframe；核对显式 Three 模块契约后采集，再验证本地运行'); }
  else if (kind === 'web' && (o.web_discovery || {}).entries) { route = 'discovered-web'; evidence.push('已观察到运行入口；读取加载契约，必要时由 AI 分析源码与失败证据，选择原包适配或通用浏览器探测；资源不闭合时保留具体错误'); }
  else if (candidate.source_path) { route = 'provided-source'; evidence.push('已提供平台登记的本地源码包'); }
  else { route = 'blocked'; missing.push(kind === 'wechat' ? '需要匹配游戏包及引擎插件' : '需要完整内嵌源码与资源映射，或匹配的 Web 适配方案'); }
  for (const item of (candidate.dependencies || {}).items || []) {
    if (!['verified', 'not_applicable'].includes(item.status)) {
      missing.push(`${item.name || '依赖'}：${item.next_action || item.reason || '待验证'}`);
    }
  }
  return { schema_version: 1, recorded: false, route, label: PLAN_LABELS[route], source_kind: kind,
    evidence, missing,
    next_action: route !== 'blocked' ? '按所选路径执行资源校验、宿主适配和规格测试' : missing[0],
    scope: '登记方案、Cocos 2 / Ruffle / Defold 原包、显式 Remix Three 模块契约及通用浏览器探测；引擎能力和资源闭合仍需实际执行，分析不是验收' };
}

/**
 * 服务状态。云端只读门面不托管 AI 与执行器，如实标注由本地平台提供，
 * 避免前端拿到空数组后误判为"平台异常"。
 */
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
  // 15 次 D1 查询串行会放大 D1 的跨区延迟（库在 WNAM）：实测 29 s。
  // 它们彼此无依赖，并发后只付一次往返。events 全量取回后截取最近若干条，
  // 省掉一次重复查询——rowid DESC 下 slice 与 LIMIT 结果一致。
  const [kindRows, allEvents, usageRows, supply, gameProfiles, settingRows, names,
    recommendations, discoveryRuns] = await Promise.all([
    Promise.all(STATE_KINDS.map(kind => allRecords(env, kind))),
    allRecords(env, 'events'),
    allRecords(env, 'ai_usage'),
    allRecords(env, 'supply'),
    allRecords(env, 'game_profiles'),
    allRecords(env, 'settings'),
    actorNames(env),
    allRecords(env, 'recommendations'),
    allRecords(env, 'discovery_runs').then(runs => runs.map(run => ({
      ...run,
      // 每轮扫描的错误清单可能很长，详情面板展开也只扫一眼：每站留 3 条。
      sources: (run.sources || []).map(s => ({ ...s, errors: (s.errors || []).slice(0, 3) })),
    }))),
  ]);
  const collections = Object.fromEntries(STATE_KINDS.map((kind, index) => [kind, kindRows[index]]));
  collections.events = allEvents.slice(0, RECENT_EVENTS);
  // 轮次只在"历史任务与补充记录"里显示第几轮/状态/原因（web/app.js:799），
  // 原始记录带完整 report，单条最大 838 KB —— 必须按字段裁剪，否则响应翻倍。
  collections.rounds = collections.rounds.map(row => pick(row, ROUND_KEYS));

  for (const version of collections.versions) {
    version.preview_url = withPreview(version);
  }

  for (const kind of ['jobs', 'messages', 'versions', 'candidates']) {
    for (const row of collections[kind] || []) {
      if (row.created_by) row.created_by_name = names.get(row.created_by) || row.created_by;
    }
  }

  const profiles = new Map();
  for (const profile of gameProfiles) {
    if (profile.profile) profiles.set(profile.id, profile.profile);
  }
  for (const version of collections.versions) {
    if (profiles.has(version.id)) version.game_profile = profiles.get(version.id);
  }

  const periods = ['day', 'week', 'month'];
  const usage = {};
  const operations = {};
  for (const period of periods) {
    usage[period] = aggregateUsage(usageRows, period);
    operations[period] = operationStats(allEvents, collections.jobs, period);
  }

  // 与本地平台同序：先补引擎标签，再算游戏维度汇总，最后出运营看板。
  for (const candidate of collections.candidates) {
    candidate.engine = effectiveEngine(candidate, collections.versions);
  }
  const stats = { candidates: collections.candidates, versions: collections.versions,
    jobs: collections.jobs, supply };
  stats.game_conversion_stats = gameTotals(collections.candidates, collections.jobs, allEvents, usageRows);
  stats.dashboard_operations = operationalOverview(stats, usageRows);

  const templates = new Set();
  const published = new Set();
  for (const row of supply) {
    const id = row.template && row.template.template_id;
    if (!id) continue;
    templates.add(id);
    if (row.state === 'published') published.add(id);
  }

  const settings = {};
  for (const row of settingRows) settings[row.id] = row;
  const pricing = settings.ai_pricing && settings.ai_pricing.rates ? settings.ai_pricing.rates : {};

  // 采集建议：默认值与本地 controlplane/discovery.py DEFAULTS 一致，库里有覆盖就用库里的。
  const discoverySettings = { ...DISCOVERY_DEFAULTS, ...(settings.discovery || {}) };
  const candidateById = new Map(collections.candidates.map(c => [c.id, c]));
  for (const candidate of collections.candidates) {
    candidate.catalog_facets = facetsOf(candidate, discoverySettings.aliases || {});
    candidate.dependency_summary = dependencySummary(candidate.dependencies);
    // Web 恢复方案是本地 controlplane/web_profiles/ 下的 JSON 文件，云端没有，如实给空。
    candidate.web_restore_profiles = [];
  }
  for (const job of collections.jobs) {
    if (!job.conversion_plan) {
      job.conversion_plan = conversionPlan(candidateById.get(job.candidate_id) || {}, job);
    }
    delete job.lease_token;
  }

  return {
    ...collections,
    ai_pricing: pricing,
    settings,
    discovery_settings: discoverySettings,
    discovery_runs: discoveryRuns,
    recommendations: recommendations.map(recommendationPublic),
    usage,
    operation_stats: operations,
    game_conversion_stats: stats.game_conversion_stats,
    dashboard_operations: stats.dashboard_operations,
    // 前端按 features 开关决定采集视图与批次联动是否可用（web/app.js:10 / :945）。
    features: { link_batches: true, pipeline_timeline: true, discovery: true, supply: true },
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
