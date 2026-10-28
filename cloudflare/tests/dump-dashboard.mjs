// 以与 tools/crosscheck_dashboard.py 完全相同的归一化形状输出云端看板，
// 供两边逐字段 diff——证明 JS 移植与 Python 原实现同构。
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { state as portalState } from '../portal.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const db = new DatabaseSync(resolve(here, '../../migration-private/platform.migration.sqlite3'), { readOnly: true });
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
      };
    },
  },
};
const session = { user: { id: 'u', username: 'preview-admin', role: 'admin', enabled: true } };
const payload = await portalState(env, session, u => u);
const d = payload.dashboard_operations;

console.log(JSON.stringify({
  games_count: d.games_count,
  calls: d.calls,
  unknown_calls: d.unknown_calls,
  timing_complete: d.timing_complete,
  timing_measured: d.timing_measured,
  median_seconds: d.median_seconds,
  weekly_accepted: d.weekly_accepted,
  previous_week_accepted: d.previous_week_accepted,
  weekly_published: d.weekly_published,
  token_coverage: d.token_coverage,
  engines: d.engines.map(e => e.name).sort(),
  engine_game_counts: d.engines.map(e => [e.name, e.games]).sort(),
  models: d.models.map(m => m.name).sort(),
  failure_reasons: d.failure_reasons.map(f => [f.code, f.count]).sort(),
  production: (({ websites, analyzed, acquired, generated, templates }) =>
    ({ websites, analyzed, acquired, generated, templates }))(payload.metrics.production),
  production_evidence: payload.metrics.production.evidence,
  rows: d.games.map(r => [
    r.candidate_id, r.title, r.engine, r.status, r.stage ?? null,
    r.duration_seconds ?? null, r.calls, r.input_tokens, r.output_tokens,
    r.known_token_fields, r.unpaired_events, r.accepted, r.supply_status,
  ]).sort(),
}, null, 1));
