const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const roleLabels = {admin:'管理员',operator:'操作员',viewer:'只读用户'};
const statusLabels = {queued:'排队中',running:'执行中',review:'待验收',completed:'已完成',failed:'失败',blocked:'已阻断',stopped:'已停止',waiting_input:'待回复',pending:'待选择',pending_capture:'待抓取',dispatched:'已派单',rejected:'已拒绝',approved:'已验收',published:'已发布',draft:'草稿',paused:'已暂停'};
const viewNames = {tasks:['TASK OPERATIONS','任务中心'],discovery:['DISCOVERY','采集建议'],services:['CONNECTIONS','服务配置'],accounts:['ACCESS CONTROL','账号权限']};
const aiLabels = {compatible:'OpenAI 兼容 API',openai:'OpenAI 官方 API',local_codex:'本地 Codex（独立账号）',cloud_codex:'云服务器 Codex CLI',codex_account:'Codex 账号（云服务器）'};
const aiDefaults = {compatible:{base_url:'https://ai.botclaw.top/v1',model:'gpt-6-sol'},openai:{base_url:'https://api.openai.com/v1',model:'gpt-6-sol'},local_codex:{base_url:'http://127.0.0.1:8877/v1',model:'local-codex'},cloud_codex:{base_url:'https://ai.botclaw.top/v1',model:'gpt-6-sol'},codex_account:{model:'gpt-6-sol'}};
let csrf = '';
let currentUser = null;
let state = null;
let accounts = [];
let services = [];
let operations = {};
let currentView = 'tasks';
let setupRequired = false;
let selectedJob = null;
let toastTimer;
const dirty = new Set();

function toast(message, error=false) {
  const node = $('#toast');
  node.textContent = message;
  node.className = error ? 'show error' : 'show';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.className = '', 3600);
}

async function request(path, options={}) {
  const config = {...options, headers:{...(options.headers || {})}};
  if (config.body && typeof config.body !== 'string') {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(config.body);
  }
  if (config.method && config.method !== 'GET') config.headers['X-CSRF-Token'] = csrf;
  const response = await fetch(path, config);
  const type = response.headers.get('Content-Type') || '';
  const data = type.includes('json') ? await response.json() : await response.text();
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/api/auth/')) showAuth(false);
    throw new Error(data.error || `请求失败（HTTP ${response.status}）`);
  }
  return data;
}

function showAuth(setup=false) {
  setupRequired = setup;
  $('#shell').hidden = true;
  $('#auth').hidden = false;
  $('#auth-title').textContent = setup ? '初始化任务后台' : '登录任务后台';
  $('#auth-copy').textContent = setup ? '创建首位管理员。此操作仅在数据库没有账号时可用。' : '独立管理采集、转换队列与执行账号。';
  $('#auth-submit').textContent = setup ? '创建管理员并进入' : '登录';
  $('#auth-password').autocomplete = setup ? 'new-password' : 'current-password';
  currentUser = null;
  csrf = '';
}

async function enter(user, token) {
  currentUser = user;
  csrf = token;
  $('#auth').hidden = true;
  $('#shell').hidden = false;
  $('#user-name').textContent = user.username;
  $('#user-role').textContent = roleLabels[user.role] || user.role;
  $('#user-avatar').textContent = user.username.slice(0,1).toUpperCase();
  $$('.admin-only').forEach((node) => node.hidden = user.role !== 'admin');
  $$('.operator-only').forEach((node) => node.hidden = user.role === 'viewer');
  await refresh(true);
}

async function refresh(force=false) {
  if (!currentUser) return;
  try {
    state = await request('/api/state');
    if (currentUser.role === 'admin') {
      [accounts, operations] = await Promise.all([request('/api/accounts').then((x) => x.users), request('/api/operations')]);
    }
    renderAll(force);
  } catch (error) {
    if (currentUser) toast(error.message, true);
  }
}

function renderAll(force=false) {
  renderMetrics();
  renderJobs();
  renderBatches();
  renderDiscovery(force);
  renderAccounts();
  if (currentView === 'services') loadServices(force);
  if (selectedJob && !$('#job-dialog').open) selectedJob = null;
  if (selectedJob) renderJobDetail(selectedJob);
}

function status(value) {
  return `<span class="status ${esc(value)}">${esc(statusLabels[value] || value || '未知')}</span>`;
}
function date(value) {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? esc(value) : parsed.toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
}
function candidateFor(job) { return state.candidates.find((item) => item.id === job.candidate_id) || {}; }

function renderMetrics() {
  const jobs = state.jobs || [];
  const values = [
    ['正在执行',jobs.filter((x) => x.status === 'running').length,'全局单任务执行'],
    ['等待排队',jobs.filter((x) => x.status === 'queued').length,'按入队时间领取'],
    ['等待人工',jobs.filter((x) => ['waiting_input','review'].includes(x.status)).length,'回复与验收独立'],
    ['异常阻断',jobs.filter((x) => ['failed','blocked'].includes(x.status)).length,'保留历史与产物'],
  ];
  $('#metrics').innerHTML = values.map(([label,value,note]) => `<div class="metric"><span>${label}</span><strong>${value}</strong><small>${note}</small></div>`).join('');
  $('#nav-task-count').textContent = jobs.filter((x) => ['queued','running','waiting_input'].includes(x.status)).length;
  $('#nav-discovery-count').textContent = (state.recommendations || []).filter((x) => x.status === 'pending').length;
  const queue = state.conversion_queue || {};
  $('#queue-summary').textContent = `并发上限 ${queue.limit ?? 1} · 执行 ${queue.running ?? 0} · 等待 ${queue.waiting ?? 0}`;
}

function renderJobs() {
  const query = $('#job-search').value.trim().toLowerCase();
  const jobs = (state.jobs || []).filter((job) => `${candidateFor(job).title || ''} ${job.id}`.toLowerCase().includes(query));
  $('#jobs-body').innerHTML = jobs.map((job) => {
    const candidate = candidateFor(job);
    const retry = ['blocked','failed'].includes(job.status) && currentUser.role !== 'viewer' ? `<button class="button" data-retry="${esc(job.id)}">继续</button>` : '';
    return `<tr><td class="primary-cell"><strong>${esc(candidate.title || '未命名游戏')}</strong><small>${esc(job.id)}</small></td><td>${status(job.display_status || job.status)}</td><td>${esc(job.progress_label || job.stage || '—')}</td><td>${job.round || 1}</td><td>${date(job.created_at)}</td><td><div class="row-actions"><button class="button" data-job="${esc(job.id)}">详情</button>${retry}</div></td></tr>`;
  }).join('');
  $('#jobs-empty').hidden = jobs.length > 0;
  $$('[data-job]').forEach((button) => button.onclick = () => openJob(button.dataset.job));
  $$('[data-retry]').forEach((button) => button.onclick = () => mutate(`/api/jobs/${button.dataset.retry}/retry`,{},'任务已重新排队'));
}

function renderBatches() {
  $('#batches-body').innerHTML = (state.batches || []).map((batch) => `<tr><td class="primary-cell"><strong>${esc(batch.name)}</strong><small>${esc(batch.id)}</small></td><td>${status(batch.status)}</td><td>${date(batch.created_at)}</td><td class="operator-only" ${currentUser.role === 'viewer' ? 'hidden' : ''}><div class="row-actions">${['running','paused'].includes(batch.status) ? `<button class="button" data-batch="${esc(batch.id)}" data-action="${batch.status === 'running' ? 'pause' : 'resume'}">${batch.status === 'running' ? '暂停' : '恢复'}</button>` : ''}${['running','paused'].includes(batch.status) ? `<button class="button" data-batch="${esc(batch.id)}" data-action="stop">停止</button>` : ''}${batch.status === 'stopped' ? `<button class="button" data-batch="${esc(batch.id)}" data-action="retry">重试异常</button>` : ''}</div></td></tr>`).join('') || '<tr><td colspan="4" class="empty">暂无批次</td></tr>';
  $$('[data-batch]').forEach((button) => button.onclick = () => mutate(`/api/batches/${button.dataset.batch}/${button.dataset.action}`,{},'批次状态已更新'));
}

function renderDiscovery(force=false) {
  const config = state.discovery_settings || {};
  if (force || !dirty.has('discovery-settings')) {
    $('#discovery-enabled').checked = !!config.enabled;
    $('#discovery-hour').value = config.hour ?? 9;
    $('#discovery-max-games').value = config.max_games ?? 12;
    $('#discovery-max-pages').value = config.max_pages ?? 2;
  }
  const latest = (state.discovery_runs || [])[0];
  $('#latest-scan').textContent = latest ? `最近扫描：${date(latest.created_at)} · ${statusLabels[latest.status] || latest.status} · ${(latest.recommendation_ids || []).length} 条新建议` : '尚未执行扫描。手动扫描会访问已启用的公开来源。';
  renderRecommendations();
}

function technologyLabel(item) {
  const tech = item.technology || {};
  if (typeof tech === 'string') return tech;
  return tech.label || tech.name || tech.platform || (tech.status === 'unknown' ? '待识别' : '待识别');
}

function renderRecommendations() {
  const filter = $('#recommendation-filter').value;
  const rows = (state.recommendations || []).filter((item) => !filter || item.status === filter);
  $('#recommendations-body').innerHTML = rows.map((item) => `<tr><td class="operator-only" ${currentUser.role === 'viewer' ? 'hidden' : ''}>${['pending','pending_capture'].includes(item.status) ? `<input type="checkbox" data-recommendation="${esc(item.id)}" data-status="${esc(item.status)}" aria-label="选择 ${esc(item.title)}">` : ''}</td><td class="primary-cell"><strong>${esc(item.title)}</strong><small>${esc(item.url)}</small></td><td>${esc(item.source)}</td><td>${esc(item.category || '未识别')}</td><td>${esc(technologyLabel(item))}</td><td>${status(item.status)}</td></tr>`).join('');
  $('#recommendations-empty').hidden = rows.length > 0;
  $$('[data-recommendation]').forEach((box) => box.onchange = updateSelection);
  updateSelection();
}

function selectedRecommendations() { return $$('[data-recommendation]:checked').map((box) => ({id:box.dataset.recommendation,status:box.dataset.status})); }
function updateSelection() {
  const selected = selectedRecommendations();
  $('#selection-count').textContent = selected.length ? `已选择 ${selected.length} 项` : '未选择条目';
  $$('[data-discovery-action]').forEach((button) => {
    const action = button.dataset.discoveryAction;
    const valid = selected.length > 0 && selected.every((item) => action === 'dispatch' ? item.status === 'pending_capture' : item.status === 'pending');
    button.disabled = !valid;
  });
}

function renderAccounts() {
  if (currentUser.role !== 'admin') return;
  $('#accounts-body').innerHTML = accounts.map((user) => `<tr><td class="primary-cell"><strong>${esc(user.username)}</strong><small>${esc(user.id)}</small></td><td>${esc(roleLabels[user.role])}</td><td><span class="status ${user.enabled ? 'completed' : 'stopped'}">${user.enabled ? '启用' : '停用'}</span></td><td>${date(user.created_at)}</td><td><div class="row-actions"><button class="button" data-account="${esc(user.id)}">编辑</button></div></td></tr>`).join('');
  $$('[data-account]').forEach((button) => button.onclick = () => editAccount(accounts.find((x) => x.id === button.dataset.account)));
}

function editAccount(user=null) {
  $('#account-editor-panel').hidden = false;
  $('#account-editor-title').textContent = user ? '编辑账号' : '新增账号';
  $('#account-id').value = user?.id || '';
  $('#account-username').value = user?.username || '';
  $('#account-username').disabled = !!user;
  $('#account-role').value = user?.role || 'viewer';
  $('#account-enabled').checked = user?.enabled ?? true;
  $('#account-password').value = '';
  $('#account-password').required = !user;
  dirty.delete('account-form');
  $('#account-username').focus();
}

async function loadServices(force=false) {
  try {
    services = await request('/api/services');
    $('#service-status').innerHTML = services.map((service) => `<article class="service-card"><header><h2>${service.id === 'ai' ? 'AI 推理' : '原包转换'}</h2><span class="status ${service.status === '在线' ? 'completed' : service.status === '异常' ? 'failed' : 'queued'}">${esc(service.status)}</span></header><dl><dt>状态</dt><dd>${esc(service.status)}</dd><dt>连接</dt><dd>${esc(service.connection_label || service.backend || '—')}</dd><dt>模型</dt><dd>${esc(service.model || '—')}</dd><dt>检测</dt><dd>${esc(service.detail || '尚未检测')}</dd></dl></article>`).join('');
    if (currentUser.role === 'admin' && (force || !dirty.has('ai-form'))) fillAiForm();
    if (currentUser.role === 'admin' && (force || !dirty.has('wechat-form'))) fillWechatForm();
    $('#drain-toggle').textContent = operations.draining ? '退出维护暂停' : '进入维护暂停';
  } catch (error) { toast(error.message,true); }
}

function fillAiForm() {
  const ai = services.find((x) => x.id === 'ai') || {};
  const select = $('#ai-connection');
  if (!select.options.length) select.innerHTML = Object.entries(aiLabels).map(([key,label]) => `<option value="${key}">${label}</option>`).join('');
  select.value = ai.connection && aiLabels[ai.connection] ? ai.connection : 'compatible';
  fillAiProfile();
}

function fillAiProfile() {
  const connection = $('#ai-connection').value;
  const ai = services.find((x) => x.id === 'ai') || {};
  const profile = ai.profiles?.[connection] || aiDefaults[connection] || {};
  $('#ai-url').value = profile.base_url || aiDefaults[connection]?.base_url || '';
  $('#ai-model').value = profile.model || aiDefaults[connection]?.model || '';
  $('#ai-email').value = profile.account_email || '';
  $('#ai-key').value = '';
  $('#ai-actor').value = '';
  $('#ai-key').placeholder = profile.has_key ? '已保存，留空保留' : '请输入密钥';
  $('#ai-actor').placeholder = profile.has_actor_authorization ? '已保存，留空保留' : '可选';
  const accountOnly = connection === 'codex_account';
  $('#ai-email-row').hidden = !accountOnly;
  $('#ai-url-row').hidden = accountOnly;
  $('#ai-key-row').hidden = accountOnly;
  $('#ai-actor-row').hidden = accountOnly || ['openai','local_codex'].includes(connection);
  $('#ai-url').disabled = connection === 'openai';
}

function fillWechatForm() {
  const service = services.find((x) => x.id === 'wechat') || {};
  $('#wechat-backend').value = service.backend === 'wxapkg_v1' ? 'wxapkg_v1' : 'builtin';
  $('#wechat-url').value = service.base_url || 'http://127.0.0.1:8770';
  $('#wechat-key').value = '';
  $('#wechat-key').placeholder = service.has_key ? '已保存，留空保留' : '请输入访问令牌';
  toggleWechat();
}
function toggleWechat() {
  const remote = $('#wechat-backend').value === 'wxapkg_v1';
  $('#wechat-url-row').hidden = !remote;
  $('#wechat-key-row').hidden = !remote;
}

async function mutate(path, body, success='已保存') {
  try {
    await request(path,{method:'POST',body});
    toast(success);
    dirty.clear();
    await refresh(true);
  } catch (error) { toast(error.message,true); }
}

function openJob(id) {
  selectedJob = state.jobs.find((job) => job.id === id);
  if (!selectedJob) return;
  renderJobDetail(selectedJob);
  $('#job-dialog').showModal();
}

function renderJobDetail(job) {
  const candidate = candidateFor(job);
  const version = (state.versions || []).find((item) => item.job_id === job.id) || (state.versions || []).find((item) => item.id === job.version_id);
  const events = (state.events || []).filter((item) => item.job_id === job.id).slice().reverse();
  $('#job-dialog-title').textContent = candidate.title || job.id;
  $('#job-detail').innerHTML = `<div class="detail-grid"><div class="detail-item"><span>状态</span><strong>${esc(statusLabels[job.display_status || job.status] || job.status)}</strong></div><div class="detail-item"><span>当前阶段</span><strong>${esc(job.stage || '—')}</strong></div><div class="detail-item"><span>轮次 / 尝试</span><strong>${job.round || 1} / ${job.attempt || 0}</strong></div></div><p class="muted">${esc(job.reason || job.progress_label || '暂无补充说明')}</p>${version?.source_directory ? `<a class="button" href="/api/versions/${esc(version.id)}/download">下载当前版本</a>` : ''}<h3>过程记录</h3><ol class="timeline">${events.map((event) => `<li><time>${date(event.created_at)}</time>${esc(event.message)}</li>`).join('') || '<li>暂无过程记录</li>'}</ol>${currentUser.role !== 'viewer' ? `<form id="job-message-form" class="message-form"><input id="job-message" placeholder="补充任务要求或回复阻断问题" required><button class="button primary" type="submit">发送并继续</button></form>` : ''}`;
  const form = $('#job-message-form');
  if (form) form.onsubmit = async (event) => {
    event.preventDefault();
    const message = $('#job-message').value.trim();
    if (!message) return;
    $('#job-dialog').close();
    await mutate(`/api/jobs/${job.id}/message`,{message},'要求已提交，任务按原队列继续');
  };
}

$('#auth-form').onsubmit = async (event) => {
  event.preventDefault();
  try {
    const result = await request(setupRequired ? '/api/auth/setup' : '/api/auth/login',{method:'POST',body:{username:$('#auth-username').value.trim(),password:$('#auth-password').value}});
    await enter(result.user,result.csrf);
  } catch (error) { toast(error.message,true); }
};
async function logout() { try { await request('/api/auth/logout',{method:'POST',body:{}}); } catch {} showAuth(false); }
$('#logout').onclick = logout;
$('#logout-mobile').onclick = logout;
$('#conversion-form').onsubmit = (event) => { event.preventDefault(); const url = $('#conversion-url').value.trim(); if (url) mutate('/api/conversions',{url},'任务已提交').then(() => $('#conversion-url').value = ''); };
$('#job-search').oninput = renderJobs;
$('#recommendation-filter').onchange = renderRecommendations;
$('#scan-now').onclick = () => mutate('/api/discovery/scan',{},'扫描已排队');
$('#discovery-settings').onsubmit = (event) => { event.preventDefault(); mutate('/api/discovery/settings',{enabled:$('#discovery-enabled').checked,hour:Number($('#discovery-hour').value),max_games:Number($('#discovery-max-games').value),max_pages:Number($('#discovery-max-pages').value)},'采集调度已保存'); };
$$('[data-discovery-action]').forEach((button) => button.onclick = () => { const selected = selectedRecommendations(); if (selected.length) mutate(`/api/discovery/${button.dataset.discoveryAction}`,{ids:selected.map((x) => x.id)},'采集建议已更新'); });
$('#new-account').onclick = () => editAccount();
$('#close-account-editor').onclick = () => $('#account-editor-panel').hidden = true;
$('#account-form').onsubmit = (event) => { event.preventDefault(); const id = $('#account-id').value; mutate('/api/accounts/save',{...(id ? {id} : {username:$('#account-username').value.trim()}),role:$('#account-role').value,enabled:$('#account-enabled').checked,password:$('#account-password').value},'账号已保存').then(() => $('#account-editor-panel').hidden = true); };
$('#ai-connection').onchange = () => { fillAiProfile(); dirty.add('ai-form'); };
$('#wechat-backend').onchange = toggleWechat;
$('#ai-form').onsubmit = (event) => { event.preventDefault(); const connection = $('#ai-connection').value; mutate('/api/services/ai/save',{connection,base_url:$('#ai-url').value.trim(),model:$('#ai-model').value.trim(),account_email:$('#ai-email').value.trim(),api_key:$('#ai-key').value,actor_authorization:$('#ai-actor').value},'AI 连接已保存，等待实际调用检测'); };
$('#wechat-form').onsubmit = (event) => { event.preventDefault(); const backend = $('#wechat-backend').value; mutate('/api/services/wechat/save',backend === 'builtin' ? {backend} : {backend,base_url:$('#wechat-url').value.trim(),api_key:$('#wechat-key').value},'转换服务已保存'); };
$('#test-ai').onclick = () => mutate('/api/services/ai/test',{},'AI 检测完成');
$('#test-wechat').onclick = () => mutate('/api/services/wechat/test',{},'转换服务检测完成');
$('#drain-toggle').onclick = () => mutate('/api/operations/drain',{enabled:!operations.draining},operations.draining ? '已恢复任务领取' : '已进入维护暂停');
$('#close-job').onclick = () => $('#job-dialog').close();
$('#job-dialog').addEventListener('close',() => selectedJob = null);
$$('form').forEach((form) => form.addEventListener('input',() => dirty.add(form.id)));
$$('[data-view]').forEach((button) => button.onclick = () => {
  currentView = button.dataset.view;
  $$('.view').forEach((view) => view.hidden = view.id !== `view-${currentView}`);
  $$('[data-view]').forEach((item) => item.classList.toggle('active',item === button));
  $('#view-eyebrow').textContent = viewNames[currentView][0];
  $('#view-title').textContent = viewNames[currentView][1];
  if (currentView === 'services') loadServices(true);
  history.replaceState(null,'',`#${currentView}`);
});

async function init() {
  try {
    const auth = await request('/api/auth/status');
    if (!auth.authenticated) return showAuth(auth.setup_required);
    const session = await request('/api/session');
    await enter(session.user,session.csrf);
    const view = location.hash.slice(1);
    if (viewNames[view] && (view !== 'accounts' || session.user.role === 'admin')) $(`[data-view="${view}"]`).click();
  } catch (error) { showAuth(false); toast(error.message,true); }
}

init();
setInterval(() => { if (currentUser && !document.hidden) refresh(false); },15000);
