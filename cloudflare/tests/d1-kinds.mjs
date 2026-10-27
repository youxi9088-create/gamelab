// 列出 D1 里各类记录的数量，用于确认"前端要的数据到底有没有迁上来"。
// 运行：NODE_USE_ENV_PROXY=1 node cloudflare/tests/d1-kinds.mjs
import { D1_DATABASE } from './d1-rest.mjs';

const { results } = await D1_DATABASE.query(
  'SELECT kind, COUNT(*) AS c FROM records GROUP BY kind ORDER BY c DESC');
for (const row of results) console.log(String(row.kind).padEnd(24), row.c);
