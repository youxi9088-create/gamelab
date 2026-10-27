const $ = id => document.getElementById(id);
let csrf;
async function api(path, body) {
  const response = await fetch(path, body === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf || '' }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `请求失败 ${response.status}`);
  return data;
}
function cell(row, text) { const td = document.createElement('td'); td.textContent = String(text ?? ''); row.append(td); return td; }
async function refresh() {
  const auth = await api('/api/auth/status');
  $('login-panel').hidden = auth.authenticated;
  $('content').hidden = !auth.authenticated;
  $('logout').hidden = !auth.authenticated;
  if (!auth.authenticated) return;
  csrf = (await api('/api/session')).csrf;
  const data = await api('/api/state');
  $('identity').textContent = `${data.current_user.username} · 只读迁移视图 · ${data.counts.versions} 个版本`;
  $('versions').replaceChildren(); $('jobs').replaceChildren();
  const names = new Map(data.candidates.map(c => [c.id, c.title]));
  for (const version of data.versions) {
    const row = document.createElement('tr');
    cell(row, `${version.title || names.get(version.candidate_id) || '游戏'} / ${version.id}`);
    cell(row, version.status);
    const target = cell(row, '');
    if (version.preview_url) {
      const link = document.createElement('a'); link.href = version.preview_url; link.textContent = '打开试玩'; link.className = 'button'; target.append(link);
    }
    $('versions').append(row);
  }
  for (const job of data.jobs) {
    const row = document.createElement('tr');
    cell(row, names.get(job.candidate_id) || job.id);
    cell(row, `${job.status} / ${job.stage}`); cell(row, job.reason || ''); $('jobs').append(row);
  }
}
$('login').addEventListener('submit', async event => {
  event.preventDefault(); $('error').textContent = '';
  const button = event.target.querySelector('button'); button.disabled = true;
  try { await api('/api/auth/login', { username: $('username').value, password: $('password').value }); $('password').value = ''; await refresh(); }
  catch (error) { $('error').textContent = error.message; }
  finally { button.disabled = false; }
});
$('logout').addEventListener('click', async () => { try { await api('/api/auth/logout', {}); await refresh(); } catch (error) { $('error').textContent = error.message; } });
refresh().catch(error => { $('error').textContent = error.message; });
