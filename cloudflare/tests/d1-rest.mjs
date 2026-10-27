// D1 REST 客户端。沙箱只放行 api.cloudflare.com，Node 需带 NODE_USE_ENV_PROXY=1
// 才能让 fetch 走环境代理（Node 22 的 undici EnvHttpProxyAgent）。
const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const DATABASE = process.env.D1_DATABASE_ID || '1610b3f0-7a28-4270-b30b-fab183f92dbd';
const ENDPOINT = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/d1/database/${DATABASE}/query`;

if (!ACCOUNT || !TOKEN) {
  console.error('缺少 CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN');
  process.exit(2);
}

async function call(payload) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.json();
  if (!body.success) throw new Error(`D1 查询失败: ${JSON.stringify(body.errors || body)}`);
  return body.result || [];
}

async function query(sql, params = []) {
  const result = await call({ sql, params });
  return { results: result[0]?.results || [] };
}

/** 与 Workers 的 D1 绑定同构的 env.DB，可原样喂给 portal.mjs / worker.mjs。 */
export const D1_DATABASE = {
  prepare(sql) {
    const statement = {
      sql,
      params: [],
      bind(...values) { statement.params.push(...values); return statement; },
      async all() { return query(statement.sql, statement.params); },
      async first() { const { results } = await query(statement.sql, statement.params); return results[0] ?? null; },
      async run() { await query(statement.sql, statement.params); return { success: true }; },
    };
    return statement;
  },
  async batch(statements) {
    const result = await call({ batch: statements.map(s => ({ sql: s.sql, params: s.params || [] })) });
    return result.map(item => ({ results: item.results || [] }));
  },
  query,
};

export { query };
