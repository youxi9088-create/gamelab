const { Miniflare } = require('miniflare');
const { chromium } = require('F:/youxi/door/executors/node_modules/playwright');
const { createHash, pbkdf2Sync } = require('node:crypto');
const { readFileSync, mkdirSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const output = path.resolve(root, '../qa-output/cloudflare-integration');
const digest = data => createHash('sha256').update(data).digest('hex');
const uploadToken = 'fixture-transfer-only-' + 'x'.repeat(40);
const source = new Map([
  ['index.html', '<!doctype html><meta charset="utf-8"><title>自建迁移夹具</title><button id="advance">收集金币</button><div id="coins">0</div><script src="game.js"></script>'],
  ['game.js', 'let n=Number(localStorage.getItem("coins")||0);const show=()=>document.getElementById("coins").textContent=n;show();document.getElementById("advance").onclick=()=>{n++;localStorage.setItem("coins",n);show()};'],
  ['engine.wasm', Buffer.from([0, 97, 115, 109, 1, 0, 0, 0])],
]);
(async () => {
  mkdirSync(output, { recursive: true });
  const report = { cloudflareAuthRequired: false, productionVerified: false, checks: [], limitations: ['This is local workerd/D1/R2 verification, not production Free plan validation.'] };
  const mf = new Miniflare({ workers: [{ name: 'gamelab-test', modules: true, scriptPath: path.join(root, 'worker.mjs'), compatibilityDate: '2026-10-27', compatibilityFlags: ['nodejs_compat'],
    d1Databases: { DB: 'gamelab-local-test' }, r2Buckets: ['FILES'], bindings: { MIGRATION_UPLOAD_TOKEN: uploadToken } }], host: '127.0.0.1', port: 0 });
  let browser;
  try {
    const db = await mf.getD1Database('DB');
    for (const statement of readFileSync(path.join(root, 'schema.sql'), 'utf8').split(';').filter(s => s.trim())) await db.prepare(statement).run();
    const insert = async (kind, value) => db.prepare('INSERT INTO records(kind,id,data) VALUES (?,?,?)').bind(kind, value.id, JSON.stringify(value)).run();
    const salt = '00112233445566778899aabbccddeeff';
    const password = 'synthetic-migration-password';
    await insert('users', { id: 'user-fixture', username: 'fixture', role: 'admin', enabled: true, revision: 1, created_at: '2026-10-27T00:00:00Z', password_hash: salt + ':' + pbkdf2Sync(password, salt, 600000, 32, 'sha256').toString('hex') });
    await insert('artifacts', { id: 'artifact-fixture', entry: 'index.html', runtime_local: true });
    await insert('versions', { id: 'version-fixture', artifact_id: 'artifact-fixture', entry: 'index.html', preview_url: 'http://127.0.0.1:8766/runtime/artifact-fixture/index.html', status: 'review', title: '自建迁移夹具' });
    await insert('jobs', { id: 'job-fixture', status: 'blocked', reason: 'fixture', lease_token: 'must-not-leak' });
    for (const [name, content] of source) await db.prepare('INSERT INTO artifact_files VALUES (?,?,?,?,?)').bind('artifact-fixture', name, 'artifacts/artifact-fixture/' + name, digest(content), Buffer.byteLength(content)).run();
    const base = (await mf.ready).origin;
    const get = (url, options) => fetch(base + url, options);
    assert.equal((await get('/runtime/artifact-fixture/index.html')).status, 401); report.checks.push('unauthenticated playback rejected');
    assert.equal((await get('/api/state')).status, 401);
    const headers = { 'Content-Type': 'application/json', Origin: base };
    const bad = await get('/api/auth/login', { method: 'POST', headers, body: JSON.stringify({ username: 'fixture', password: 'wrong' }) });
    report.badPasswordStatus = bad.status;
    const start = Date.now();
    const auth = await get('/api/auth/login', { method: 'POST', headers, body: JSON.stringify({ username: 'fixture', password }) });
    report.loginStatus = auth.status; report.localLoginMilliseconds = Date.now() - start;
    if (auth.status !== 200) {
      report.authenticationBlocker = await auth.json();
      report.limitations.push('Legacy 600000-iteration PBKDF2 could not be verified in this Workers runtime. Authentication stayed closed; production migration is blocked.');
      throw Error('legacy login failed closed: ' + auth.status);
    }
    assert.equal(bad.status, 401); report.checks.push('wrong password rejected, legacy 600000-iteration hash accepted');
    const login = await auth.json(); const cookie = auth.headers.get('set-cookie').split(';')[0];
    for (const [name, content] of source) {
      const fileHeaders = { Authorization: 'Bearer ' + uploadToken, 'X-Content-SHA256': digest(content), 'Content-Length': String(Buffer.byteLength(content)) };
      const route = '/api/executor/artifacts/artifact-fixture/files/' + name;
      assert.equal((await get(route, { method: 'PUT', headers: { ...fileHeaders, Authorization: 'Bearer wrong' }, body: content })).status, 401);
      const res = await get(route, { method: 'PUT', headers: fileHeaders, body: content });
      assert.equal(res.status, 200, await res.text());
      assert.equal((await get(route, { method: 'PUT', headers: fileHeaders, body: content })).status, 200);
    }
    report.checks.push('registered checksum upload accepted and idempotent, wrong token rejected');
    const missing = await get('/api/executor/artifacts/artifact-fixture/files/unknown.js', { method: 'PUT', headers: { Authorization: 'Bearer ' + uploadToken }, body: 'x' }); assert.equal(missing.status, 404);
    const wrong = 'x'.repeat(Buffer.byteLength(source.get('game.js')));
    const rawBucket = await mf.getR2Bucket('FILES');
    await db.prepare('INSERT INTO artifact_files VALUES (?,?,?,?,?)').bind('artifact-fixture', 'bad.js', 'artifacts/artifact-fixture/bad.js', digest(source.get('game.js')), Buffer.byteLength(wrong)).run();
    const corrupted = await get('/api/executor/artifacts/artifact-fixture/files/bad.js', { method: 'PUT', headers: { Authorization: 'Bearer ' + uploadToken, 'X-Content-SHA256': digest(source.get('game.js')), 'Content-Length': String(Buffer.byteLength(wrong)) }, body: wrong });
    assert.equal(corrupted.status, 422); assert.equal(await rawBucket.head('artifacts/artifact-fixture/bad.js'), null); report.checks.push('checksum corruption and unregistered path rejected');
    const state = await (await get('/api/state', { headers: { Cookie: cookie } })).json();
    assert.equal(state.jobs[0].status, 'blocked'); assert.equal(state.versions[0].status, 'review'); assert(!JSON.stringify(state).includes('must-not-leak')); report.checks.push('history states preserved and lease redacted');
    assert.equal((await get('/api/jobs/job-fixture/retry', { method: 'POST', headers: { Cookie: cookie } })).status, 501);
    const bytes = await get('/runtime/artifact-fixture/engine.wasm', { headers: { Cookie: cookie, Range: 'bytes=0-3' } });
    assert.equal(bytes.status, 206); assert.equal(bytes.headers.get('content-type'), 'application/wasm'); assert.equal(bytes.headers.get('content-range'), 'bytes 0-3/8'); assert.equal(Buffer.from(await bytes.arrayBuffer()).length, 4);
    assert.equal((await get('/runtime/artifact-fixture/engine.wasm', { headers: { Cookie: cookie, Range: 'bytes=99-' } })).status, 416); report.checks.push('WASM MIME, range bytes and invalid range');
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const context = await browser.newContext({ viewport: { width: 1100, height: 700 } });
    await context.addCookies([{ name: 'replica_session', value: cookie.split('=')[1], url: base, httpOnly: true, sameSite: 'Strict' }]);
    const page = await context.newPage();
    await page.goto(base + '/runtime/artifact-fixture/index.html'); await page.locator('#advance').click(); assert.equal(await page.locator('#coins').innerText(), '1');
    await page.reload(); assert.equal(await page.locator('#coins').innerText(), '1');
    await page.screenshot({ path: path.join(output, 'private-playback-fixture.png') });
    report.checks.push('browser game input changed state and refresh restored fixture save');
    const loggedOut = await get('/api/auth/logout', { method: 'POST', headers: { ...headers, Cookie: cookie, 'X-CSRF-Token': login.csrf }, body: '{}' });
    assert.equal(loggedOut.status, 200); assert.equal((await get('/runtime/artifact-fixture/index.html', { headers: { Cookie: cookie } })).status, 401); report.checks.push('logout immediately revokes resource access');
    report.passed = true;
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    report.passed = false; report.error = error.message; console.error(JSON.stringify(report, null, 2)); process.exitCode = 1;
  } finally {
    writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
    if (browser) await browser.close(); await mf.dispose();
  }
})();
