// 用 node:sqlite 驱动真实迁移库，验证 portal.mjs 的只读状态构建。
// 目的有两个：确认字段裁剪正确（不外泄哈希/租约），以及量出响应体积——
// 体积直接决定 Workers Free 10ms CPU 是否扛得住。
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { state as portalState, slim } from '../portal.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(here, '../../migration-private/platform.migration.sqlite3');
const db = new DatabaseSync(dbPath, { readOnly: true });

const env = {
  DB: {
    prepare(sql) {
      const params = [];
      return {
        bind(...values) { params.push(...values); return this; },
        async all() {
          const statement = db.prepare(sql);
          return { results: params.length ? statement.all(...params) : statement.all() };
        },
        async first() {
          const statement = db.prepare(sql);
          return (params.length ? statement.all(...params) : statement.all())[0] ?? null;
        },
      };
    },
  },
};

const session = { user: { id: 'user-e9a1e8761318', username: 'preview-admin', role: 'admin', enabled: true } };
const publicUser = user => ({ id: user.id, username: user.username, role: user.role, enabled: user.enabled });

const started = Date.now();
const payload = await portalState(env, session, publicUser);
const elapsed = Date.now() - started;
const body = JSON.stringify(payload);

const checks = [];
const check = (name, ok, detail = '') => {
  checks.push([name, ok, detail]);
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

check('构建成功且不抛错', true, `${elapsed} ms`);
check('包含前端所需集合',
  ['candidates', 'versions', 'jobs', 'events', 'messages'].every(k => Array.isArray(payload[k])));
check('响应体积可控 (<4 MB)', body.length < 4 * 1024 * 1024, `${(body.length / 1048576).toFixed(2)} MB`);
check('不含 password_hash', !body.includes('password_hash'));
check('不含 lease_token', !body.includes('lease_token'));
check('不暴露 users 集合', !('users' in payload));
check('版本带预览地址', payload.versions.every(v => typeof v.preview_url === 'string' || v.preview_url === null),
  `示例 ${payload.versions[0]?.preview_url}`);
check('通过版本可播（有 artifact_id）',
  payload.versions.filter(v => ['approved', 'published'].includes(v.status)).every(v => Boolean(v.artifact_id)));
check('当前用户已脱敏', payload.current_user && !('password_hash' in payload.current_user),
  JSON.stringify(payload.current_user));
check('裁剪函数移除超大字段',
  Object.keys(slim({ keep: 'x', huge: 'y'.repeat(200000) }, 'candidates')).join(',') === 'keep');
check('report 只留必要键', (() => {
  const trimmed = slim({ report: { path: 'A', auto_repair: { big: true }, game_spec: { category: 'x' } } }, 'versions');
  return trimmed.report && 'game_spec' in trimmed.report && !('auto_repair' in trimmed.report);
})());

// 看板字段：前端 dashboard/overview 直接消费，缺一个就会显示空或报错
check('usage 三个周期齐全且非空',
  ['day', 'week', 'month'].every(p => Array.isArray(payload.usage?.[p]) && payload.usage[p].length > 0),
  JSON.stringify(Object.fromEntries(['day', 'week', 'month'].map(p => [p, payload.usage?.[p]?.length]))));
check('operation_stats 三个周期齐全',
  ['day', 'week', 'month'].every(p => Array.isArray(payload.operation_stats?.[p])),
  JSON.stringify(Object.fromEntries(['day', 'week', 'month'].map(p => [p, payload.operation_stats?.[p]?.length]))));
check('usage 分桶带时区日期', /^\d{4}-\d{2}(-\d{2})?$/.test(String(payload.usage?.day?.[0]?.period || '')),
  String(payload.usage?.day?.[0]?.period));
check('usage 统计有调用数与耗时',
  (payload.usage?.day?.[0]?.calls || 0) > 0 && typeof payload.usage.day[0].duration_seconds === 'number',
  `calls=${payload.usage?.day?.[0]?.calls}`);
check('downstream_summary 存在',
  typeof payload.downstream_summary?.templates === 'number',
  JSON.stringify(payload.downstream_summary));
check('settings 已提供', payload.settings && Object.keys(payload.settings).length > 0,
  Object.keys(payload.settings || {}).join(','));
check('供货配置如实标注由本地提供',
  payload.supply_service?.local_only === true && payload.supply_config?.local_only === true);
check('响应体不含全部事件（仅最近若干）', payload.events.length < 300, `${payload.events.length} 条`);

// 游戏明细面板：缺 dashboard_operations 就永远停在"正在获取游戏明细…"
const dash = payload.dashboard_operations;
const GAME_KEYS = ['title', 'engine', 'route', 'job_id', 'status', 'stage', 'status_age_seconds', 'reason',
  'round', 'accepted', 'costs', 'unknown_cost_calls', 'retry_tokens', 'retry_unknown_calls',
  'supply_status', 'supply_reason', 'supply_error', 'supply_age_seconds', 'duration_seconds',
  'unpaired_events', 'known_token_fields', 'input_tokens', 'output_tokens', 'input_known_calls',
  'output_known_calls', 'unknown_usage_calls', 'cache_known_calls', 'cached_input_tokens',
  'cache_write_tokens', 'calls', 'candidate_id'];
check('dashboard_operations 存在且有游戏行', Array.isArray(dash?.games) && dash.games.length > 0,
  `${dash?.games?.length} 款`);
check('游戏行字段齐全（dashboard.js 全部列）',
  dash.games.every(r => GAME_KEYS.every(k => k in r)),
  (() => { const missing = GAME_KEYS.filter(k => !(k in (dash.games[0] || {}))); return missing.length ? '缺 ' + missing.join(',') : '齐全'; })());
check('汇总指标齐全',
  ['weekly_accepted', 'previous_week_accepted', 'weekly_published', 'token_coverage', 'calls',
    'unknown_calls', 'timing_complete', 'timing_measured', 'games_count', 'median_seconds',
    'first_pass_note'].every(k => k in (dash || {})),
  JSON.stringify({ games: dash?.games_count, calls: dash?.calls, timing: `${dash?.timing_complete}/${dash?.timing_measured}` }));
check('引擎与模型分组非空', dash.engines.length > 0 && dash.models.length > 0,
  `引擎 ${dash.engines.length} / 模型 ${dash.models.length}`);
check('引擎已补标签（无"未识别"堆积）',
  dash.engines.every(e => e.name && e.name !== '未识别') || dash.engines.length < 3,
  dash.engines.map(e => `${e.name}:${e.games}`).join(' '));
check('有计时闭合样本', dash.timing_complete > 0, `${dash.timing_complete} 个闭合 / 中位 ${dash.median_seconds ?? '—'} 秒`);
check('game_conversion_stats 与游戏行数一致',
  payload.game_conversion_stats?.length === dash.games?.length,
  `${payload.game_conversion_stats?.length} vs ${dash.games?.length}`);
check('features 已提供（前端按此开关视图）',
  payload.features?.discovery === true && payload.features?.link_batches === true);

// 采集建议页：缺 discovery_settings / recommendations 会直接落到"请重启平台服务"
check('discovery_settings 含默认规则', payload.discovery_settings?.hour === 9
  && typeof payload.discovery_settings?.aliases === 'object',
  `hour=${payload.discovery_settings?.hour} 别名 ${Object.keys(payload.discovery_settings?.aliases || {}).length} 项`);
check('recommendations 非空且已中文化',
  Array.isArray(payload.recommendations) && payload.recommendations.length > 0
  && payload.recommendations.every(r => typeof r.gameplay === 'string' && r.gameplay.length > 0),
  `${payload.recommendations?.length} 条`);
check('discovery_runs 已提供', Array.isArray(payload.discovery_runs) && payload.discovery_runs.length > 0,
  `${payload.discovery_runs?.length} 轮`);
check('候选带 catalog_facets', payload.candidates.every(c => Array.isArray(c.catalog_facets?.categories)
  && Array.isArray(c.catalog_facets?.engines)),
  JSON.stringify(payload.candidates[0]?.catalog_facets));
check('候选带 dependency_summary',
  payload.candidates.every(c => typeof c.dependency_summary?.total === 'number'));
check('任务带 conversion_plan', payload.jobs.every(j => typeof j.conversion_plan?.route === 'string'),
  payload.jobs.map(j => j.conversion_plan?.route).join(' '));
check('任务不含 lease_token', !JSON.stringify(payload).includes('lease_token'));

const counts = Object.fromEntries(Object.entries(payload)
  .filter(([, v]) => Array.isArray(v)).map(([k, v]) => [k, v.length]));
console.log('\n集合规模:', JSON.stringify(counts));
console.log('响应体积: %s MB', (body.length / 1048576).toFixed(2));

const passed = checks.filter(([, ok]) => ok).length;
console.log('\n%d/%d 通过', passed, checks.length);
console.log(JSON.stringify({ passed, total: checks.length, ok: passed === checks.length, bytes: body.length, ms: elapsed, counts }));
process.exit(passed === checks.length ? 0 : 1);
