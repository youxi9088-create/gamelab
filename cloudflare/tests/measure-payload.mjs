// 量 /api/state 各段体积：Workers Free 每请求 10 ms CPU，序列化体积就是成本。
// 运行：node cloudflare/tests/measure-payload.mjs
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

const rows = Object.entries(payload)
  .map(([key, value]) => [key, JSON.stringify(value).length])
  .sort((a, b) => b[1] - a[1]);
const total = rows.reduce((sum, [, n]) => sum + n, 0);
for (const [key, size] of rows) {
  if (size < 2048) continue;
  console.log(`${key.padEnd(24)} ${(size / 1024).toFixed(1).padStart(9)} KB  ${(size / total * 100).toFixed(1)}%`);
}
console.log(`${'合计'.padEnd(23)} ${(total / 1024).toFixed(1).padStart(9)} KB`);
