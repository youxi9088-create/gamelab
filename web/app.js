import {patchHTML} from './dom-sync.js';
import {presentPolicyPauses} from './policy-pause.js';
import {dashboardPulse,dashboardGames,dashboardDiagnostics,bindDashboard} from './dashboard.js';
let discoveryStatus='pending', discoveryRun='', discoverySelected=new Set(), discoveryCategory='', discoverySource='', libraryEngine='';
// 云端只读门面会通过 state.migration.read_only 声明自己不承载写操作。
// 此时前端隐藏一切"发起/修改"入口，并在 mutate 层兜底拦截，避免点了才发现是 501。
let readOnly=false;
const READ_ONLY_HINT='这是云端只读站点，发起任务、采集与修改请在本地平台操作。';
const gameCategories=c=>c.catalog_facets?.categories||[String(c.category||'').trim()||'未分类'];
const gameEngines=c=>c.catalog_facets?.engines||['待识别'];
function discoveryGroups(rows) {
  return rows.slice().sort((a,b)=>String(a.category||'未分类').localeCompare(String(b.category||'未分类'),'zh-CN')||String(a.source||'未知网站').localeCompare(String(b.source||'未知网站'),'zh-CN')||a.title.localeCompare(b.title,'zh-CN'));
}
function discoveryPage() {
  if(!state.features?.discovery)return head('采集建议','自动发现、品类对比与人工选择')+empty('请重启平台服务','新采集接口需要更新后的后台。');
  const cfg=state.discovery_settings, runs=state.discovery_runs||[];
  const run=runs.find(r=>r.id===discoveryRun)||runs[0];
  const available=(state.recommendations||[]).filter(r=>(!discoveryStatus||r.status===discoveryStatus)&&(!discoveryRun||r.run_id===discoveryRun));
  const rows=discoveryGroups(available.filter(r=>(!discoveryCategory||(r.category||'未分类')===discoveryCategory)&&(!discoverySource||(r.source_id||r.source||'未知网站')===discoverySource)));
  const facetOptions=(key,selected)=>[...new Set(available.map(r=>key==='category'?(r.category||'未分类'):(r.source_id||r.source||'未知网站')))].sort().map(value=>`<option value="${esc(value)}" ${selected===value?'selected':''}>${esc(key==='category'?value:available.find(r=>(r.source_id||r.source||'未知网站')===value)?.source||value)} · ${available.filter(r=>(key==='category'?(r.category||'未分类'):(r.source_id||r.source||'未知网站'))===value).length}</option>`).join('');
  let lastGroup='';
  const groupHeading=r=>{const key=JSON.stringify([r.category,r.source_id||r.source]);if(lastGroup===key)return '';lastGroup=key;return `<tr class="discovery-group"><td colspan="6">${esc(r.category||'未分类')} / ${esc(r.source||'未知网站')} <span class="muted">· ${rows.filter(x=>(x.category||'未分类')===(r.category||'未分类')&&(x.source_id||x.source)===(r.source_id||r.source)).length} 款</span></td></tr>`;};
  const statuses={pending:'待选择',pending_capture:'待抓取',rejected:'不再处理',dispatched:'已派单'};
  return head('采集建议', readOnly?'以下为本地平台采集结果的只读快照。':'每天发现游戏与品类变化，由你决定哪些进入待抓取。',
    readOnly?'':'<button data-discovery-settings>每日规则</button><button class="primary" data-discovery-scan>立即扫描来源</button>')+
    `<p class="notice">每日计划：${cfg.enabled?'每天北京时间 '+String(cfg.hour).padStart(2,'0')+':00':'已暂停'}。平台后台需持续运行；错过当天时间会在启动后补扫一次。${cfg.auto_dispatch?'规则自动选择的游戏会直接派单转换；人工通过仍进入待抓取。':'审核通过不会立即复刻。'}</p>
    <section class="schedule-summary" aria-label="自动分析服务"><p><strong>每日采集分析</strong><br>${cfg.enabled?'已启用 · 北京时间 '+String(cfg.hour).padStart(2,'0')+':00':'已暂停'}</p><p><strong>最近执行</strong><br>${runs[0]?esc(runs[0].day)+' · '+esc(({completed:'完成',partial:'部分完成',running:'执行中',queued:'排队中',interrupted:'中断'})[runs[0].status]||runs[0].status):'尚无记录'}</p><p><strong>执行范围</strong><br>发现游戏、分析页面品类、生成建议；${cfg.auto_dispatch?'已开启规则派单':'转换仍需通过并派单'}</p></section>
    <div class="discovery-toolbar"><label>游戏品类<select id="discovery-category"><option value="">全部品类</option>${facetOptions('category',discoveryCategory)}</select></label><label>来源网站<select id="discovery-source"><option value="">全部网站</option>${facetOptions('source',discoverySource)}</select></label><label>清单状态<select id="discovery-status">${Object.entries(statuses).map(([k,v])=>`<option value="${k}" ${discoveryStatus===k?'selected':''}>${v}</option>`).join('')}</select></label>
    <label>生成批次<select id="discovery-run"><option value="">全部日期</option>${runs.map(r=>`<option value="${esc(r.id)}" ${discoveryRun===r.id?'selected':''}>${esc(r.day)} · ${date(r.created_at)} · ${esc(r.status)}</option>`).join('')}</select></label>
    ${!readOnly&&discoveryStatus==='pending'?'<button data-discovery-decision="approve">选中项通过 → 待抓取</button><button data-discovery-decision="reject">选中项不再处理</button>':''}
    ${!readOnly&&discoveryStatus==='pending_capture'?'<button class="primary" data-discovery-decision="dispatch">开始抓取选中游戏</button>':''}</div>
    ${run?`<details class="panel"><summary>扫描记录与品类变化 · ${esc(run.day)} · ${esc(({queued:'等待扫描',running:'扫描中',completed:'已完成',partial:'部分完成',interrupted:'已中断'})[run.status]||run.status)}</summary>
    <p class="tiny muted">平台品类基线：${esc((run.catalog_categories||[]).join('、')||'尚无')}。首次扫描只建立观察基线，不等于网站刚新增。</p>
    ${(run.category_changes||[]).map(c=>`<div class="step"><strong>${esc(c.category)}</strong> · ${esc(c.source)} · ${c.first_observation?'首次观察':'本次新观察'}<p>${esc(c.recommendation)}</p><a href="${esc(safeUrl(c.evidence_url))}" target="_blank" rel="noopener noreferrer">品类依据 ↗</a></div>`).join('')||'<p>尚未记录新品类；不代表已覆盖全站。</p>'}
    ${(run.sources||[]).map(s=>`<div class="step"><b>${esc(s.name)}</b> · ${esc(({success:'扫描完成',partial:'部分完成',failed:'失败',needs_adapter:'需要调整规则或适配'})[s.status]||s.status)} · 新建议 ${s.new} · 去重 ${s.duplicates}<p class="tiny muted">${esc(s.coverage)}</p>${s.errors.map(e=>`<p class="tiny">${esc(e.url||'')} ${esc(e.error)}</p>`).join('')}</div>`).join('')}</details>`:''}
    <p class="tiny muted">当前 ${rows.length} / ${available.length} 款 · 按品类 / 网站分组，切换筛选会清空勾选。玩法说明来自来源页面，未经实际试玩验证。</p>
    ${rows.length?`<div class="table-wrap discovery-list"><table class="table discovery-table" aria-label="采集建议列表"><thead><tr><th scope="col">游戏 / 来源</th><th scope="col">品类 / 技术类型</th><th scope="col">建议原因 / 玩法</th><th scope="col">发现时间</th><th scope="col">状态</th><th scope="col">操作</th></tr></thead><tbody>${rows.map(r=>`${groupHeading(r)}<tr><td><label class="checkrow"><input type="checkbox" data-recommendation="${esc(r.id)}" ${discoverySelected.has(r.id)?'checked':''} ${['rejected','dispatched'].includes(r.status)?'disabled':''}><strong>${esc(r.title)}</strong></label><small class="discovery-source">${esc(r.source)}</small></td>
    <td>${esc(r.category)}${r.platform_category_missing?'<small class="discovery-gap">平台尚未覆盖</small>':''}${r.source_policy_label?`<small class="discovery-gap" data-source-policy title="${esc(r.source_policy_reason||'')}">${esc(r.source_policy_label)} · 已知门槛</small>`:''}<small class="discovery-source" data-technology title="${esc((r.technology?.matches||[]).map(m=>m.evidence).join('；')||'暂无识别依据')}">${esc(r.technology?.label||'待识别')}<br>${r.technology?.status==='hint'?'页面线索 · 未运行验证':'技术类型待识别'}</small></td>
    <td class="discovery-description"><p>${esc(r.reason)}</p>${r.selection_score?`<small>信息评分 ${r.selection_score.value}/100 · 未试玩</small>`:''}<details><summary>玩法与来源依据</summary><p>${esc(r.gameplay||'来源未提供，需打开原站核对，未自动编造')}</p><p class="tiny muted">${esc(r.category_basis||"来源分类记录")} · ${esc(r.description_basis)} · 页面校验 ${esc(r.content_sha256)}</p></details></td>
    <td class="tiny muted">${date(r.created_at)}</td><td><span class="badge">${r.job_id?esc(statusMap[(state.jobs||[]).find(j=>j.id===r.job_id)?.display_status]||statuses[r.status]):statuses[r.status]}</span></td>
    <td><div class="actions"><a href="${esc(safeUrl(r.url))}" target="_blank" rel="noopener noreferrer">原平台试玩 ↗</a>${r.job_id?`<button data-job="${esc(r.job_id)}">查看执行任务</button>`:''}</div></td></tr>`).join('')}</tbody></table></div>`:empty('当前没有对应清单', readOnly?'本地平台暂无采集结果。':'等待每日扫描，或点击“立即扫描来源”；失败与未适配站点会保留原因。')}`;
}
function discoverySettings() {
  const c=state.discovery_settings;
  modal('每日采集规则',`<form id="discovery-settings-form"><label class="checkrow"><input name="enabled" type="checkbox" ${c.enabled?'checked':''}>每日自动扫描所有已启用来源</label><label>北京时间（小时）</label><input name="hour" type="number" min="0" max="23" value="${c.hour}" required><label>每站最多扫描入口数</label><input name="max_pages" type="number" min="1" max="10" value="${c.max_pages}" required><label>每站最多读取游戏详情数</label><input name="max_games" type="number" min="1" max="50" value="${c.max_games}" required><label class="checkrow"><input name="auto_select" type="checkbox" ${c.auto_select?'checked':''}>按规则自动通过采集建议</label><label class="checkrow"><input name="auto_dispatch" type="checkbox" ${c.auto_dispatch?'checked':''}>通过后自动派单（会启动转换）</label><label>允许自动选择的品类（每行一个，须与清单一致）</label><textarea name="allowed_categories" rows="3">${esc((c.allowed_categories||[]).join('\n'))}</textarea><label>最低信息评分（不是游戏质量分）</label><input name="score_threshold" type="number" min="0" max="100" value="${c.score_threshold??85}"><label>每日最多自动选择</label><input name="daily_limit" type="number" min="1" max="20" value="${c.daily_limit||3}"><label>品类别名映射（JSON，英文名称可映射中文）</label><textarea name="aliases" rows="6">${esc(JSON.stringify(c.aliases,null,2))}</textarea><p class="tiny muted">按入口和数量上限扫描，不代表覆盖整个网站。调整后下一次扫描生效。</p><div class="modalfooter"><button class="primary">保存规则</button></div></form>`);
  $('#discovery-settings-form').onsubmit=e=>{
    e.preventDefault();const f=new FormData(e.target);
    try{mutate('/api/discovery/settings',{enabled:f.has('enabled'),auto_select:f.has('auto_select'),auto_dispatch:f.has('auto_dispatch'),allowed_categories:String(f.get('allowed_categories')).split(/\r?\n/).map(x=>x.trim()).filter(Boolean),score_threshold:Number(f.get('score_threshold')),daily_limit:Number(f.get('daily_limit')),hour:Number(f.get('hour')),max_games:Number(f.get('max_games')),max_pages:Number(f.get('max_pages')),aliases:JSON.parse(f.get('aliases'))},()=>{});}
    catch(error){$('#modal-error').textContent=error.message;}
  };
}
function sourceDiscoveryRule(id) {
  const s=state.sources.find(s=>s.id===id),r=s.discovery_rule||{};
  modal(s.name+' · 扫描规则',`<form id="source-rule-form"><label>扫描入口（每行一个，同站点地址）</label><textarea name="entries" rows="4" required>${esc((r.entry_urls||[s.url]).join('\n'))}</textarea><label>游戏详情路径包含（每行一项）</label><textarea name="paths" rows="4" required>${esc((r.game_paths||['/game/','/games/','/play/','/detail/','/g/']).join('\n'))}</textarea><p class="tiny muted">只读扫描公开页面与结构化资料。动态页面无可识别内容时会报告需要适配，不会生成虚假游戏。</p><div class="modalfooter"><button class="primary">保存来源规则</button></div></form>`);
  $('#source-rule-form').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),lines=v=>String(v).split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
    mutate('/api/discovery/rules',{source_id:id,rule:{entry_urls:lines(f.get('entries')),game_paths:lines(f.get('paths'))}},()=>{});
  };
}
function bindDiscovery() {
  listen($('#discovery-category'),'change',e=>{discoveryCategory=e.target.value;discoverySelected.clear();render();});
  listen($('#discovery-source'),'change',e=>{discoverySource=e.target.value;discoverySelected.clear();render();});
  listen($('#discovery-status'),'change',e=>{discoveryStatus=e.target.value;discoveryCategory='';discoverySource='';discoverySelected.clear();render();});
  listen($('#discovery-run'),'change',e=>{discoveryRun=e.target.value;discoveryCategory='';discoverySource='';discoverySelected.clear();render();});
  document.querySelectorAll('[data-recommendation]').forEach(e=>e.onchange=()=>e.checked?discoverySelected.add(e.dataset.recommendation):discoverySelected.delete(e.dataset.recommendation));
  document.querySelectorAll('[data-discovery-decision]').forEach(e=>e.onclick=async()=>{
    const ids=[...discoverySelected].filter(id=>(state.recommendations||[]).some(r=>r.id===id&&r.status===discoveryStatus));
    if(!ids.length)return toast('请先勾选游戏');
    e.disabled=true;
    try{await api('/api/discovery/'+e.dataset.discoveryDecision,{ids});discoverySelected.clear();await load();}
    catch(error){toast(error.message);e.disabled=false;}
  });
  listen(document.querySelector('[data-discovery-scan]'),'click',async e=>{
    e.currentTarget.disabled=true;
    try{await api('/api/discovery/scan',{});await load();toast('扫描已排队，后台每 30 秒领取一次');}
    catch(error){toast(error.message);render();}
  });
  listen(document.querySelector('[data-discovery-settings]'),'click',discoverySettings);
  document.querySelectorAll('[data-source-rule]').forEach(e=>e.onclick=()=>sourceDiscoveryRule(e.dataset.sourceRule));
}

function listen(element,event,handler){if(element)element['on'+event]=handler;}
const $ = (s) => document.querySelector(s),
  esc = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
const nav = [
  ["overview", "◈", "总览看板"],
  ["candidates", "▧", "候选游戏"],
  ["discovery", "◇", "采集建议"],
  ["library", "▦", "小游戏库"],
  ["batches", "▣", "批次管理"],
  ["jobs", "⌘", "任务中心"],
  ["reviews", "☑", "验收中心"],
  ["tools", "⌁", "工具服务"],
  ["settings", "⚙", "来源与规则"],
  ["administration", "⚙", "账号与运维"],
];
let page = location.hash.slice(1) || "library",
  demo = localStorage.getItem("replica-demo") === "true",
  state = {},
  query = "",
  filter = "",
  csrf = "",
  selected = new Set(), mutationEpoch = 0, authRequired = false;
const statusMap = {
  candidate: "待选品",
  draft: "草稿",
  blocked: "执行阻断",
  needs_work: "待完善",
  dependency_pending: "依赖待处理",
  waiting_input: "待回复",
  paused_non_web: "已暂停 · 非 Web 游戏",
  paused_web_unknown: "已暂停 · 游戏类型待确认",
  paused_web_access: "已暂停 · 页面访问失败",
  superseded: "已被替代",
  attention: "需要关注",
  discovered: "待选品",
  queued: "等待执行",
  running: "执行中",
  paused: "已暂停",
  stopped: "已停止",
  failed: "执行失败",
  review: "待验收",
  approved: "已验收",
  published: "已发布",
  rejected: "已退回",
  completed: "已完成",
  success: "成功",
  pending: "等待执行",
  enabled: "已启用",
  disabled: "已停用",
};
const badge = (s) =>
  `<span class="badge ${["published", "approved", "completed", "success", "在线"].includes(s) ? "green" : ["failed", "rejected", "异常"].includes(s) ? "red" : s === "review" ? "yellow" : ["paused", "queued", "pending", "未配置", "待检测", "未连接"].includes(s) ? "gray" : ""}">${esc(statusMap[s] || s)}</span>`;
const date = (v) =>
  v
    ? new Date(v).toLocaleString("zh-CN", {
        timeZone: "Asia/Shanghai",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
const safeUrl = (v) => {
  try {
    const u = new URL(v, location.origin);
    if (
      location.protocol === "https:" &&
      u.port === "8766" &&
      (u.hostname === "127.0.0.1" || u.hostname === "localhost")
    ) {
      return new URL(`${u.pathname}${u.search}${u.hash}`, location.origin).href;
    }
    return ["https:", "http:"].includes(u.protocol) ? u.href : "#";
  } catch {
    return "#";
  }
};
const cover = (c) => safeUrl(c?.cover || "/assets/placeholder.svg");
const empty = (title, desc, action = "") =>
  `<div class="empty"><div class="empty-symbol">◇</div><strong>${title}</strong><p>${desc}</p>${action}</div>`;
const cBy = (id) =>
  (state.candidates || []).find((c) => c.id === id) || {
    title: id || "未关联游戏",
  };
function toast(s) {
  $("#toast").textContent = s;
  $("#toast").classList.add("show");
  setTimeout(() => $("#toast").classList.remove("show"), 3200);
}
async function api(path, body, options = {}) {
  if (body !== undefined) mutationEpoch++;
  const r = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    ...options,
  });
  const d = await r.json();
  if (!r.ok) throw Error(d.error || d.message || "请求失败");
  return d;
}
async function load() {
  mutationEpoch++;
  try {
    const auth = await api('/api/auth/status');
    authRequired = auth.required;
    if (authRequired && !auth.authenticated) { renderLogin(); return; }
    csrf = (await api("/api/session")).csrf;
    if (demo) {
      state = await api("/api/demo");
    } else {
      state = presentPolicyPauses(await api("/api/state"));
    }
    state.services = await api("/api/services");
    readOnly = !demo && !!(state.migration && state.migration.read_only);
    render();
  } catch (e) {
    if (authRequired && (e.message.includes('登录') || e.message.includes('会话'))) { renderLogin(); return; }
    state = {};
    readOnly = false;
    render();
    toast("无法连接平台：" + e.message);
  }
}
function renderLogin(error='') {
  document.title='账号登录 · Game Lab';
  $('#app').innerHTML=`<main class="login-page"><form class="login-card" id="portal-login"><span class="pixel-mark" aria-hidden="true">✣</span><p class="eyebrow">GAME LAB · 管理门户</p><h1>欢迎回来</h1><p class="muted">登录以继续管理游戏与转换任务。</p><label for="portal-username">账号</label><input id="portal-username" name="username" autocomplete="username" required autofocus><label for="portal-password">密码</label><input id="portal-password" name="password" type="password" autocomplete="current-password" required><p class="login-error" role="alert">${esc(error)}</p><button class="primary" type="submit">登录门户</button><p class="tiny muted">登录会话有效期为 12 小时。</p></form></main>`;
  $('#portal-login').onsubmit=async event=>{
    event.preventDefault();
    const form=event.currentTarget,button=form.querySelector('button');button.disabled=true;button.textContent='正在登录…';
    try {const values=Object.fromEntries(new FormData(form));const result=await api('/api/auth/login',values);csrf=result.csrf;await load();}
    catch(error){renderLogin(error.message);}
  };
}
function shell() {
  return `<header class="site-header"><button class="site-brand" data-nav="library" aria-label="小游戏库首页"><span class="pixel-mark" aria-hidden="true">✣</span> Game Lab<span class="brand-cn">游戏实验室</span></button><div class="topright"><input class="search" id="global-search" placeholder="搜索游戏、任务…" aria-label="搜索游戏、任务"><button class="smallbtn" data-action="mode">${demo ? "◉ 演示模式" : "○ 实时数据"}</button><span class="tiny muted" id="sync-status" role="status">${demo ? "演示数据" : "自动同步中"}</span><button class="textbtn" data-action="refresh">↻ 刷新</button>${authRequired?'<button class="textbtn" data-action="logout">退出登录</button>':''}</div></header><nav class="site-nav" aria-label="主导航">${['library','overview','discovery','candidates','jobs','reviews','tools','settings',...(state.current_user?.role==='admin'?['administration']:[])].map(id=>nav.find(n=>n[0]===id)).map(([id,icon,title])=>`<button class="navbtn ${(page==='batches'?'jobs':page)===id?'active':''}" data-nav="${id}" ${(page==='batches'?'jobs':page)===id?'aria-current="page"':''}>${title}</button>`).join('')}</nav><main class="main ${page==='library'?'is-library':''}"><div class="content">${demo ? '<div class="demo-banner"><span>◇ 演示工作空间 · 数据与游戏插画仅用于交互设计演示</span><span>不代表已采集或复刻</span></div>' : readOnly ? '<div class="readonly-banner"><span>◇ 云端只读站点 · 可浏览、可试玩</span><span>发起任务、采集扫描与内容修改请在本地平台操作</span></div>' : ""}<div id="page"></div></div></main>`;
}
let renderedShell = '', renderedPage = '';
function render(background = false) {
  if(page==='administration'&&state.current_user?.role!=='admin')page='library';
  if (!nav.some((n) => n[0] === page)) page = "overview";
  document.title = `${nav.find(n => n[0] === (page === 'batches' ? 'jobs' : page))[2]} · Game Lab`;
  const shellHTML = shell();
  const replaceShell = !background || renderedShell !== shellHTML || !$('#page');
  if (replaceShell) { $('#app').innerHTML = shellHTML; renderedShell = shellHTML; }
  $('.main').dataset.page = page;
  const pageHTML = {
    overview,
    candidates,
    library,
    batches: taskCenter,
    jobs: taskCenter,
    reviews,
    tools: toolPage,
    settings,
    discovery: discoveryPage,
    administration: administrationPage,
  }[page]();
  if (background && !replaceShell && renderedPage === pageHTML) return false;
  if(background && !replaceShell)patchHTML($('#page'),pageHTML);
  else $('#page').innerHTML = pageHTML;
  renderedPage = pageHTML;
  const navigation = $(".site-nav"), active = navigation.querySelector('.active');
  if (active && navigation.scrollWidth > navigation.clientWidth) {
    navigation.scrollLeft = active.offsetLeft - navigation.clientWidth / 2 + active.offsetWidth / 2;
  }
  document.body.classList.toggle('read-only', readOnly);
  bind();
  if(page==='administration')loadAdministration();
}

function administrationPage(){
  return head('账号与运维','项目内共享数据；管理员管理账号，操作员处理任务，只读用户查看游戏和记录。')+'<section class="panel" id="admin-users">正在读取账号…</section><section class="panel" id="admin-operations">正在读取运行状态…</section>';
}
let administrationRequest = 0, lastAdministrationSync = 0;
async function loadAdministration(background = false){
  const usersNode = $('#admin-users'), operationsNode = $('#admin-operations');
  if (!usersNode || !operationsNode || (background && Date.now()-lastAdministrationSync<10000)) return;
  const request = ++administrationRequest;
  lastAdministrationSync = Date.now();
  try{
    const [accounts,ops]=await Promise.all([api('/api/accounts'),api('/api/operations')]);
    if(page!=='administration' || request!==administrationRequest || $('#admin-users')!==usersNode) return;
    const roles={admin:'管理员',operator:'操作员',viewer:'只读用户'};
    const accountsHTML = `${accounts.users.map(u=>`<div class="kv"><span>${esc(u.username)} · ${roles[u.role]} · ${u.enabled?'启用':'停用'}</span><button class="smallbtn" data-edit-user="${esc(u.id)}">编辑 / 重置密码</button></div>`).join('')}`;
    if (!background || !$('#account-form')) {
    $('#admin-users').innerHTML=`<h2>项目账号</h2><p class="muted">管理员可配置服务、验收、供货并管理账号；操作员可提交转换、回复和重试任务；只读用户不能修改数据。修改角色、密码或停用账号会使其旧会话失效。</p><div id="admin-account-list">${accounts.users.map(u=>`<div class="kv"><span>${esc(u.username)} · ${roles[u.role]} · ${u.enabled?'启用':'停用'}</span><button class="smallbtn" data-edit-user="${esc(u.id)}">编辑 / 重置密码</button></div>`).join('')}</div><h3 id="account-heading">创建账号</h3><form id="account-form"><input name="id" type="hidden"><label>账号</label><input name="username" autocomplete="off" required minlength="3" maxlength="80"><label>角色</label><select name="role"><option value="viewer">只读用户</option><option value="operator">操作员</option><option value="admin">管理员</option></select><label>密码（12至256位；编辑时留空保持不变）</label><input name="password" type="password" autocomplete="new-password" minlength="12" maxlength="256"><label class="checkrow"><input name="enabled" type="checkbox" checked>启用账号</label><p id="account-error" role="status"></p><button class="primary">保存账号</button><button type="button" id="account-clear">取消编辑</button></form>`;
    }
    const accountList=$('#admin-account-list');
    if(accountList.renderedHTML!==accountsHTML){patchHTML(accountList,accountsHTML);accountList.renderedHTML=accountsHTML;}
    const form=$('#account-form');
    document.querySelectorAll('[data-edit-user]').forEach(button=>button.onclick=()=>{const u=accounts.users.find(x=>x.id===button.dataset.editUser);for(const k of ['id','username','role'])form.elements[k].value=u[k];form.elements.username.readOnly=true;form.elements.enabled.checked=u.enabled;form.elements.password.value='';$('#account-heading').textContent='编辑账号：'+u.username;});
    $('#account-clear').onclick=()=>loadAdministration();
    form.onsubmit=async e=>{e.preventDefault();const b=form.querySelector('button');b.disabled=true;try{const body=Object.fromEntries(new FormData(form));body.enabled=form.elements.enabled.checked;await api('/api/accounts/save',body);toast('账号已保存');await loadAdministration();}catch(err){$('#account-error').textContent=err.message;}finally{b.disabled=false;}};
    const operationsHTML=`<h2>云端运行与生产数据</h2><p>${esc(ops.note)}</p><div class="kv"><span>生产数据根目录</span><span>${esc(ops.shared_root)}</span></div><div class="kv"><span>程序版本</span><span>${esc(ops.release?.commit||'尚未通过标准发布流程登记')}</span></div><div class="kv"><span>磁盘剩余</span><span>${(ops.disk_free_bytes/1024**3).toFixed(1)} GiB</span></div><div class="kv"><span>最近备份</span><span>${esc(ops.backup?.completed_at||'尚无备份记录')}</span></div><div class="kv"><span>监测状态</span><span>${esc(ops.monitor?.summary||'尚无监测记录')}</span></div><div class="kv"><span>任务领取</span><span>${ops.draining?'已暂停领取新任务':'允许领取任务'}</span></div><button id="toggle-drain">${ops.draining?'恢复领取任务':'暂停领取新任务'}</button><h3>最近操作记录</h3>${ops.audit.map(a=>`<p class="tiny">${date(a.created_at)} · ${esc(a.actor_name)} · ${esc(a.path)} · ${esc(a.result)}</p>`).join('')||'<p>尚无操作记录</p>'}`;
    if (operationsNode.renderedHTML !== operationsHTML) {
      patchHTML(operationsNode,operationsHTML);
      operationsNode.renderedHTML = operationsHTML;
    }
    $('#toggle-drain').onclick=async e=>{const button=e.currentTarget;button.disabled=true;button.dataset.busy='true';try{await api('/api/operations/drain',{enabled:!ops.draining});delete button.dataset.busy;lastAdministrationSync=0;await loadAdministration(true);}catch(err){toast(err.message);}finally{button.disabled=false;delete button.dataset.busy;}};
  }catch(err){
    if(request===administrationRequest && $('#admin-users')===usersNode) {
      if (!background) usersNode.textContent=err.message;
      else throw err;
    }
  }
}
function head(title, desc, buttons = "") {
  return `<div class="pagehead"><div><h1>${title}</h1><p>${desc}</p></div><div class="actions">${buttons}</div></div>`;
}
function gameSummary(c) {
  const o = c.observations;
  if (o && typeof o === "object" && (o.controls || o.rules))
    return [o.controls, o.rules].filter(Boolean).join("。") + "。";
  return c.description || "查看游戏详情，了解玩法与处理记录。";
}
const catalogCandidates = () => (state.candidates || []).filter(c => !c.observations?.catalog_hidden);
const versionTime = v => Date.parse(v.approved_at || v.created_at || "") || 0;
function catalogVersion(id) {
  return (state.versions || []).filter(v => v.candidate_id === id && ["approved", "published"].includes(v.status))
    .sort((a,b) => versionTime(b)-versionTime(a) || b.id.localeCompare(a.id))[0];
}
const gameCoverArt = {
  "game-57b413a1db70": "/assets/covers/sushi.png",
  "game-dcc5130f5732": "/assets/covers/runner.png",
  "game-e7f887db6795": "/assets/covers/frost-land.png",
  "game-d87e999a40ae": "/assets/covers/fruit.png",
  "game-1ce7c59452f3": "/assets/covers/hearth.png",
};
const illustrationFor = c => !demo && c && gameCoverArt[c.id];
function card(c, lib = false) {
  const v = catalogVersion(c.id);
  const art = illustrationFor(c);
  const shot = art || (lib ? cover(v) : (c.cover ? cover(c) : v?.cover || cover(c)));
  return `<article class="gamecard"><div class="cover" data-detail="${esc(c.id)}"><img src="${esc(shot)}" alt="${esc(c.title)}${art ? " · 封面插画" : demo ? " · 演示插画" : " · 游戏预览"}" loading="lazy"><div class="cover-badge">${badge(lib ? v.status : c.status || "discovered")}</div>${demo ? '<span class="demo-img">DEMO · CONCEPT ART</span>' : `<span class="preview-label">${art ? '封面插画' : v?.cover || c.cover ? '实机画面' : '待补充截图'}</span>`}</div><div class="gamebody"><div class="game-category">${esc(c.category || "未分类")}</div><h3>${esc(c.title)}</h3><p class="game-description">${esc(gameSummary(c))}</p><div class="gamemeta">${esc(c.engine || "待识别")}<span>·</span>${esc(c.source || "手动提交")}</div><div class="gamefoot"><span>${lib ? "版本 " + esc(v?.commit?.slice(0, 7) || "待关联") : date(c.created_at)}</span><div class="actions">${lib ? `<button class="smallbtn primary" data-play="${esc(v?.id || "")}">▷ 试玩</button>` : `<button class="smallbtn ${selected.has(c.id) ? "primary" : ""}" data-select="${esc(c.id)}">${selected.has(c.id) ? "✓ 已选择" : "+ 选择"}</button>`}<button class="textbtn" data-detail="${esc(c.id)}">详情 ↗</button></div></div></div></article>`;
}
function currentJobs() {
  const seen=new Set();
  return (state.jobs||[]).filter(j=>{if(seen.has(j.candidate_id))return false;seen.add(j.candidate_id);return j.status!=="superseded";});
}
function usagePanel() {
  const periods={day:'日',week:'周',month:'月'};
  return `<section class="panel"><div class="panelhead"><h2>调用用量与费用</h2><button class="smallbtn" data-action="ai-pricing">配置模型单价</button></div><p class="tiny muted">北京时间分组，费用为按调用时价格估算；币种分开统计。缓存读取和写入属于总输入的一部分；缺用量、缓存明细或价格时费用显示未知。标准档估算不等于服务商账单。</p>${Object.entries(periods).map(([key,label])=>`<details><summary>按${label}统计</summary><div class="table-wrap" style="overflow:auto"><table class="table" style="min-width:720px"><thead><tr><th>周期</th><th>游戏 / 阶段</th><th>调用</th><th>已知 Token（输入 / 输出）</th><th>耗时</th><th>估算费用</th></tr></thead><tbody>${(state.usage?.[key]||[]).slice(0,100).map(r=>`<tr><td>${esc(r.period)}</td><td>${esc(cBy(r.candidate_id).title||r.candidate_id)} / ${esc(r.stage)}</td><td>${r.calls}</td><td>${r.input_tokens} / ${r.output_tokens}${r.unknown_usage_calls?`；${r.unknown_usage_calls} 次未知`:''}<small>${r.cache_known_calls?`其中缓存读取 ${r.cached_input_tokens} / 写入 ${r.cache_write_tokens}`:'缓存明细不完整或未记录'}${r.cache_unknown_calls?`；${r.cache_unknown_calls} 次明细缺失`:''}</small></td><td>${Number(r.duration_seconds).toFixed(1)} 秒</td><td>${Object.entries(r.costs).map(([c,n])=>esc(c)+' '+Number(n).toFixed(6)).join('；')||'—'}${r.unknown_cost_calls?`；${r.unknown_cost_calls} 次费用未知`:''}</td></tr>`).join('')||'<tr><td colspan="6">尚无已记录调用；历史用量不推算补录。</td></tr>'}</tbody></table></div></details>`).join('')}<p>下游已返回模板：${state.downstream_summary?.templates??'—'}，已发布：${state.downstream_summary?.published??'—'}。${esc(state.downstream_summary?.scope||'')}</p></section>`;
}
function operationPanel() {
  return `<section class="panel"><h2>节点执行统计</h2><p class="tiny muted">按有成对起止事件的执行记录统计，包含重试；各节点可嵌套，耗时不可相加作为总墙钟时间。</p>${Object.entries({day:'日',week:'周',month:'月'}).map(([key,label])=>`<details><summary>按${label}统计</summary><div class="table-wrap"><table class="table"><thead><tr><th>周期</th><th>游戏 / 节点</th><th>执行 / 失败</th><th>累计耗时</th></tr></thead><tbody>${(state.operation_stats?.[key]||[]).slice(0,100).map(r=>`<tr><td>${esc(r.period)}</td><td>${esc(cBy(r.candidate_id).title||r.candidate_id)} / ${esc(r.stage)}</td><td>${r.executions} / ${r.failed}</td><td>${Number(r.duration_seconds).toFixed(1)} 秒</td></tr>`).join('')||'<tr><td colspan="4">尚无可统计记录；历史耗时不推算。</td></tr>'}</tbody></table></div></details>`).join('')}</section>`;
}
function pricingDialog() {
  const fields=[['input','未命中缓存的输入','input_per_million'],['cached','缓存读取','cached_input_per_million'],['write','缓存写入','cache_write_per_million'],['output','输出','output_per_million']];
  const inputs=prefix=>fields.map(([name,label])=>`<label>${prefix?'长上下文 · ':''}${label}（每百万 Token）<input name="${prefix+name}" type="number" min="0" step="any" ${!prefix&&['input','output'].includes(name)?'required':''}></label>`).join('');
  modal('模型价格配置',`<p>按标准服务档估算，仅影响后续调用，不覆盖历史费用。缓存读取和写入已包含在总输入中，不重复累加 Token。</p><form id="pricing-form"><label>提供方<select name="provider"><option value="api">API</option><option value="codex">Codex</option></select></label><label>模型名（须与调用记录完全相同）<input name="model" required maxlength="120"></label><label>币种<select name="currency"><option>USD</option><option>CNY</option></select></label>${inputs('')}<label>长上下文输入阈值（超过时整次请求切换价格）<input name="threshold" type="number" min="1" step="1"></label>${inputs('long-')}<p class="tiny muted">不用的缓存价格和长上下文档留空。启用缓存计价后，服务未返回相应 Token 明细时费用显示未知；其他服务档需单独适配。</p><button class="primary">保存单价</button></form>`);
  const form=document.querySelector('#pricing-form'),rates=state.ai_pricing||{};
  const fill=()=>{const rate=rates[form.elements.provider.value+':'+form.elements.model.value.trim()]||{};form.elements.currency.value=rate.currency||'USD';for(const [name,,key] of fields){form.elements[name].value=rate[key]??'';form.elements['long-'+name].value=rate.long_context?.[key]??'';}form.elements.threshold.value=rate.long_context?.threshold??'';};
  const first=Object.keys(rates)[0];if(first){const split=first.indexOf(':');form.elements.provider.value=first.slice(0,split);form.elements.model.value=first.slice(split+1);fill();}
  form.elements.model.onchange=fill;form.elements.provider.onchange=fill;
  form.onsubmit=async e=>{e.preventDefault();try{const f=new FormData(form),updated={...rates},rate={currency:f.get('currency')};for(const [name,,key] of fields)if(String(f.get(name)).trim()!=='')rate[key]=Number(f.get(name));if(String(f.get('threshold')).trim()!==''){rate.long_context={threshold:Number(f.get('threshold'))};for(const [name,,key] of fields)if(String(f.get('long-'+name)).trim()!=='')rate.long_context[key]=Number(f.get('long-'+name));}else if(fields.some(([name])=>String(f.get('long-'+name)).trim()!==''))throw Error('请填写长上下文输入阈值');updated[f.get('provider')+':'+f.get('model').trim()]=rate;await api('/api/ai-pricing',{rates:updated});closeModal();await load();}catch(err){document.querySelector('#modal-error').textContent=err.message;}};
}
function overview() {
  const cs = catalogCandidates(), js = currentJobs(), m = state.metrics || {};
  const production = m.production || {};
  const attention = js.filter(j => ['failed','blocked','waiting_input'].includes(j.status));
  const active = js.filter(j => ['queued','running'].includes(j.status));
  const reviews = (state.versions || []).filter(v => v.status === 'review');
  const stats = [
    ['累计抓取游戏', cs.filter(c => catalogVersion(c.id)).length, '个', '已验收入库 · 与小游戏库数量一致', '↓'],
    ['分析游戏', production.analyzed, '款', '含来源页面信息分析 · 按游戏去重', '⌕'],
    ['AI 复刻生成', production.generated, '款', '已保存生成产物 · 含草稿', '✦'],
    ['下游模板', state.downstream_summary?.templates, '个', '下游实际返回的模板', '▧'],
  ];
  return `<div class="overview-layout">${head('游戏生产概览','查看生产进度，处理待办，跟进每一次交付。', '<button data-nav="jobs">任务中心 ↗</button><button class="primary" data-action="new-candidate">＋ 链接自动转换</button>')}
    <section aria-label="累计生产指标" class="stats production-stats">${stats.map(([title,n,unit,foot,icon])=>`<article class="stat"><div class="stat-icon" aria-hidden="true">${icon}</div><div class="stat-label">${title}</div><div class="stat-value">${n??'—'}<small>${unit}</small></div><div class="stat-foot">${foot}</div></article>`).join('')}</section>
    <p class="tiny muted overview-metric-note">累计指标 · 按已有证据去重统计，各阶段可重叠。未获取的数据以「—」表示。</p>
    ${dashboardPulse(state,{esc,date})}<div class="overview-workspace">
      <div class="overview-primary">
        <section class="panel overview-tasks"><div class="panelhead"><div><h2>需要你关注</h2></div><button class="textbtn" data-nav="jobs">全部任务 ↗</button></div>
          <div class="overview-queue" aria-label="任务状态摘要"><button class="${attention.length?'has-attention':''}" data-nav="jobs"><span>待处理任务</span><strong>${attention.length}</strong><small>异常或等待回复 ↗</small></button><button data-nav="jobs"><span>执行与排队</span><strong>${active.length}</strong><small>${active.filter(j=>j.status==='running').length} 个正在执行 ↗</small></button><button data-nav="reviews"><span>待验收版本</span><strong>${reviews.length}</strong><small>进入验收中心 ↗</small></button></div>
          ${(attention.length || active.length) ? jobTable((attention.length?attention:active).slice(0,3)) : '<div class="overview-quiet"><span aria-hidden="true">✓</span><div><strong>当前没有待处理或执行中的任务</strong><p>可以提交游戏链接，开始下一次转换。</p></div></div>'}
          ${attention.length>3?`<p class="tiny muted">另有 ${attention.length-3} 个待处理任务，可在任务中心查看。</p>`:''}
        </section>
        <section class="panel overview-trend"><div class="panelhead"><div><span class="overview-eyebrow">近 7 天</span><h2>提交与验收入库趋势</h2></div><div class="legend"><span><i class="dot"></i>新增提交</span><span><i class="dot gray"></i>首次验收入库</span></div></div>${trendChart(m.trend)}</section>
      </div>
      <aside class="overview-secondary" aria-label="服务与最近游戏">
        <section class="panel service-summary"><div class="panelhead"><h2>工具服务</h2><button class="textbtn" data-nav="tools">管理 ↗</button></div>${(state.services||[]).map(s=>`<div class="healthrow"><div class="row-left"><div class="tool-avatar" aria-hidden="true">${s.id==='ai'?'✦':'⌘'}</div><div><h3>${esc(serviceNames[s.id]||s.id)}</h3><p class="tiny muted">${esc(s.detail)}</p></div></div>${badge(s.status)}</div>`).join('')||'<p class="muted">暂未获取服务状态，请刷新重试。</p>'}<div class="overview-supply"><span>下游已发布模板</span><strong>${state.downstream_summary?.published??'—'}</strong></div><p class="tiny muted">提交成功与模板发布分别记录。</p></section>
        <section class="panel overview-recent"><div class="panelhead"><h2>最近游戏</h2><button class="textbtn" data-nav="candidates">全部 ↗</button></div>${cs.slice(0,4).map(c=>{const v=catalogVersion(c.id);return `<button class="overview-game" data-detail="${esc(c.id)}"><img src="${esc(illustrationFor(c)||cover(v||c))}" alt="" loading="lazy"><span><strong>${esc(c.title)}</strong><small>${esc(c.category||'未分类')} · ${date(c.created_at)}</small></span><span aria-hidden="true">↗</span></button>`;}).join('')||'<p class="muted">还没有游戏，提交链接后会在这里显示。</p>'}</section>
      </aside>
    </div>
    <div class="overview-detail-heading"><div><h2>用量与执行明细</h2></div><p class="tiny muted">按需展开日、周、月记录</p></div>
    ${dashboardGames(state,{esc,badge})}${dashboardDiagnostics(state,{esc})}<div class="overview-details">${usagePanel()}${operationPanel()}</div>
  </div>`;
}

const gameCategory = c => gameCategories(c)[0];
function libraryFilters(games) {
  const counts=new Map();
  games.forEach(c=>gameCategories(c).forEach(category=>counts.set(category,(counts.get(category)||0)+1)));
  const categories=[...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'zh-CN'));
  const categoryGames=games.filter(c=>!filter||gameCategories(c).includes(filter));
  const engines=['微信小游戏','Web 游戏','Cocos','待识别'];
  return `<section class="facet-section"><span class="facet-label">品类</span><div class="library-categories" role="group" aria-label="按游戏品类筛选"><button data-library-category="" aria-pressed="${!filter}" class="${!filter?'active':''}">全部游戏 <span>${games.length}</span></button>${categories.map(([name,count])=>`<button data-library-category="${esc(name)}" aria-pressed="${filter===name}" class="${filter===name?'active':''}">${esc(name)} <span>${count}</span></button>`).join('')}</div></section>
  <section class="facet-section"><span class="facet-label">引擎</span><div class="library-engines" role="group" aria-label="按引擎筛选"><button data-library-engine="" aria-pressed="${!libraryEngine}">全部引擎 <span>${categoryGames.length}</span></button>${engines.map(name=>{const count=categoryGames.filter(c=>gameEngines(c).includes(name)).length;return `<button data-library-engine="${esc(name)}" aria-pressed="${libraryEngine===name}" ${!count?'disabled':''}>${esc(name)} <span>${count}</span></button>`;}).join('')}</div><p class="tiny muted">Cocos 可与微信或 Web 平台重叠；数量按当前品类统计，未知引擎不推测。</p></section>
  <div class="filters"><input id="filter-query" aria-label="搜索小游戏库" placeholder="搜索游戏名称、来源…" value="${esc(query)}"><span class="tiny muted">当前显示 ${filtered(games).length} 款${filter?' · '+esc(filter):''}${libraryEngine?' · '+esc(libraryEngine):''}</span>${query||filter||libraryEngine?'<button class="textbtn" data-library-reset>清除筛选</button>':''}</div>`;
}
function filters() {
  return `<div class="filters"><input id="filter-query" placeholder="搜索游戏名称、来源…" value="${esc(query)}"><select id="filter-category"><option value="">全部类型</option>${[...new Set(catalogCandidates().flatMap(gameCategories))].map((c) => `<option ${filter === c ? "selected" : ""}>${esc(c)}</option>`).join("")}</select><span class="muted tiny">${demo ? "演示素材 · 非实际游戏截图" : "来源记录统一汇总，保留完整追溯"}</span></div>`;
}
function filtered(cs) {
  return cs.filter(
    (c) =>
      (!query ||
        `${c.title} ${c.source}`.toLowerCase().includes(query.toLowerCase())) &&
      (!filter || gameCategories(c).includes(filter)) &&
      (page!=='library'||!libraryEngine||gameEngines(c).includes(libraryEngine)),
  );
}
function candidates() {
  const pending = catalogCandidates().filter(c => !catalogVersion(c.id));
  const pendingIds = new Set(pending.map(c => c.id));
  for (const id of selected) if (!pendingIds.has(id)) selected.delete(id);
  return (
    head(
      "发现值得重建的游戏",
      "仅显示尚未验收入库的游戏；验收通过后自动进入小游戏库。",
      `<button data-action="new-candidate">＋ 链接自动转换</button><button class="primary" data-action="new-batch">创建批次${selected.size ? " · " + selected.size : ""}</button>`,
    ) +
    filters() +
    `<div class="cards">${
      filtered(pending)
        .map((c) => card(c))
        .join("") ||
      (pending.length ? empty("没有匹配的候选游戏", "调整筛选条件查看其他候选游戏。") : empty("暂无待处理的候选游戏", "已验收游戏可在小游戏库查看，也可以提交新游戏开始转换。"))
    }</div>`
  );
}
function library() {
  const games = catalogCandidates().filter(c => catalogVersion(c.id)).sort((a,b) => versionTime(catalogVersion(b.id))-versionTime(catalogVersion(a.id)) || a.id.localeCompare(b.id));
  const featured = games[0];
  const version = featured && catalogVersion(featured.id);
  const featureArt = illustrationFor(featured);
  const featureCover = featureArt || cover(version);
  const featureAction = version ? `<button class="primary" data-play="${esc(version.id)}">▷ ${demo ? "查看演示" : "开始试玩"}</button>` : "";
  const pendingCount = games.filter(c => catalogVersion(c.id).status === "review").length;
  const feature = featured && !query && !filter ? `<section class="library-feature"><div class="feature-copy"><div class="eyebrow">${demo ? "演示内容" : "最新入库"}</div><h2>${esc(featured.title.split(" · ")[0])}</h2><p>${esc(gameSummary(featured))}</p><div class="feature-tags">${badge(version.status)}<span>${esc(featured.category)}</span><span>${demo ? "演示空间" : version.preview_mode === "external" ? "独立窗口试玩" : "站内试玩"}</span></div><div class="actions">${featureAction}<button class="feature-detail" data-detail="${esc(featured.id)}">查看游戏详情 ↗</button></div>${version.preview_mode === "external" ? '<p class="local-preview-note">此版本通过独立窗口试玩；请先启动版本包中的本地运行服务。</p>' : ""}</div><div class="feature-preview"><img src="${esc(featureCover)}" alt="${esc(featured.title)}${featureArt ? '封面插画' : demo ? '演示插画' : '运行截图'}"><span>${featureArt ? '封面插画' : demo ? '演示插画' : '实机截图'}</span></div></section>` : "";
  return (
    (!query && !filter ? `<section class="playground-hero" aria-label="游戏实验室" data-motion="${localStorage.getItem('hero-motion-paused') === 'true' ? 'paused' : 'running'}"><div class="hero-world" aria-hidden="true"><div class="simple-glow"></div></div><button class="motion-toggle" data-motion-toggle aria-pressed="${localStorage.getItem('hero-motion-paused') === 'true'}" aria-label="${localStorage.getItem('hero-motion-paused') === 'true' ? '播放背景动画' : '暂停背景动画'}">${localStorage.getItem('hero-motion-paused') === 'true' ? '播放背景' : '暂停背景'}</button><div class="hero-center"><p class="hero-kicker">小游戏库 · ${games.length} 款已收录${pendingCount ? ` · ${pendingCount} 款待验收` : ""}${demo?' · 演示空间':''}</p><img class="pixel-title" src="/assets/game-lab.svg" alt="Game Lab"><h1>发现下一款好游戏。</h1><p class="hero-description">拆解玩法，重建代码，让好游戏在实验室里焕新。</p><div class="hero-actions">${featureAction}<button class="hero-browse" data-browse>探索游戏 ↓</button></div></div></section>` : head("小游戏库", "搜索与发现已入库的游戏")) +
    feature +
    `<div class="collection-heading" id="discover"><div><h2>探索游戏 <span>${games.length}</span></h2><p>找到你的下一场小冒险。</p></div><span class="muted">${demo ? "演示数据" : "按最新入库排序"}</span></div>` +
    libraryFilters(games) +
    `<div class="cards">${
      filtered(games)
        .map((c) => card(c, true))
        .join("") ||
      (query || filter ? empty("没有匹配的游戏", "换个品类或关键词试试，或清除筛选查看全部游戏。") : empty(
        "还没有已入库游戏",
        "版本通过验收入库后即可预览，发布状态独立管理。",
        '<button data-nav="reviews">前往验收中心</button>',
      ))
    }</div>`
  );
}
function batchJobs(b) { return (state.jobs||[]).filter(j=>j.batch_id===b.id); }
function batchState(b) {
  const jobs=batchJobs(b);
  if(!jobs.length||['paused','stopped'].includes(b.status))return b.status;
  if(jobs.every(j=>j.status==='superseded'))return 'superseded';
  if(jobs.every(j=>['completed','superseded'].includes(j.status)))return 'completed';
  if(jobs.some(j=>['review','waiting_input','failed','blocked'].includes(j.status)))return 'attention';
  if(jobs.some(j=>['running','queued'].includes(j.status)))return 'running';
  return b.status;
}
function batchSummary(b) {
  const jobs=batchJobs(b), counts={};jobs.forEach(j=>{const status=j.display_status||j.status;counts[status]=(counts[status]||0)+1;});
  return Object.entries(counts).map(([status,n])=>`${n} 个${statusMap[status]||status}`).join(' · ')||'尚未启动，等待统一派发';
}
function batchControls(b) {
  const jobs=batchJobs(b), active=jobs.some(j=>['queued','running'].includes(j.status)), failed=jobs.filter(j=>['failed','blocked'].includes(j.status)).length;
  const button=(op,label)=>`<button class="smallbtn" data-batch="${esc(b.id)}" data-op="${op}">${label}</button>`;
  if(b.status==='draft')return button('start','开始转换这一批');
  let controls='';
  if(['paused','stopped'].includes(b.status))controls+=button('resume',b.status==='stopped'?'继续未完成任务':'恢复调度');
  else if(b.status==='running'&&active)controls+=button('pause','暂停调度');
  if(active)controls+=button('stop','停止这一批');
  if(failed)controls+=button('retry',`重试异常任务（${failed}）`);
  return controls;
}
function taskCenter() {
  const active = page === 'batches' ? 'batches' : 'jobs';
  return head('任务中心','集中管理游戏任务与批次，查看执行进度、沟通记录和待办。',active === 'batches' ? '<button class="primary" data-action="new-batch">＋ 创建批次</button>' : '') +
    `<div class="tabs" role="tablist" aria-label="任务中心视图">${[['jobs','任务'],['batches','批次']].map(([id,label]) => `<button class="tab ${active===id?'active':''}" role="tab" id="task-tab-${id}" aria-selected="${active===id}" aria-controls="task-center-panel" tabindex="${active===id?0:-1}" data-task-tab="${id}">${label}</button>`).join('')}</div><section id="task-center-panel" role="tabpanel" aria-labelledby="task-tab-${active}">${active==='batches'?batches():jobs()}</section>`;
}
function batches() {
  return `<div class="panel">${(state.batches||[]).length?`<div class="table-wrap"><table class="table"><thead><tr><th>批次名称</th><th>游戏数量</th><th>状态 / 待办</th><th>创建时间</th><th>操作</th></tr></thead><tbody>${state.batches.map(b=>`<tr><td><button class="textbtn" data-batch-detail="${esc(b.id)}">${esc(b.name)} →</button><br><small>${esc(b.id)}</small></td><td>${b.candidate_ids.length} 款</td><td><button class="textbtn" data-batch-detail="${esc(b.id)}">${badge(batchState(b))}</button><p class="tiny muted">${esc(batchSummary(b))}</p></td><td>${date(b.created_at)}</td><td><button class="smallbtn primary" data-batch-detail="${esc(b.id)}">${batchState(b)==='attention'?'查看并处理':'查看详情'}</button>${batchControls(b)}</td></tr>`).join('')}</tbody></table></div>`:empty('还没有批次','提交一个或多个游戏链接，开始一批转换任务。')}</div>`;
}
function batchDetail(id) {
  const b=(state.batches||[]).find(b=>b.id===id);if(!b)return;
  const jobs=batchJobs(b);
  const next={review:'已有可玩版本，请试玩后通过验收，或填写修改意见。',waiting_input:'AI 需要补充信息，回复后会继续处理。',blocked:'执行被阻断，请查看原因并补充要求或重试。',failed:'执行失败，请查看原因并重试。',stopped:'已停止，点击“继续未完成任务”可重新排队。',queued:'等待执行器领取。',running:'AI 正在处理，等待产出。',completed:'已完成验收，无须处理。',superseded:'此轮已被后续任务替代，无须重复处理。'};
  modal(b.name+' · 批次详情',`<div class="kv"><span>批次状态</span>${badge(batchState(b))}</div><p>${esc(batchSummary(b))}</p><div class="notice">“需要关注”表示其中有游戏等待回复、验收或修复，并不一定是转换失败。请按下方每个游戏的提示处理。</div><div class="actions">${batchControls(b)}</div>${b.candidate_ids.map(cid=>{const c=cBy(cid),j=jobs.find(j=>j.candidate_id===cid),v=j&&(state.versions||[]).find(v=>v.id===j.version_id),current=currentJobs().find(x=>x.candidate_id===cid);return `<section class="panel" style="margin-top:16px"><div class="panelhead"><h3>${esc(c.title)}</h3>${badge(j?.display_status||j?.status||'draft')}</div><p class="tiny muted">当前节点：${esc(j?.pipeline?.presentation?.location_label || j?.pipeline?.nodes.find(n=>n.key===j.pipeline.current)?.label || "等待执行 / 详见任务记录")}</p><p>${esc(j?(j.policy_pause?j.policy_pause.explanation:j.display_status==='needs_work'?'已有草稿，整体待完善。'+(j.status==='failed'?'上次续作失败，可查看原因后重试。':'可继续补充修改要求。'):next[j.status]||'查看任务记录。'):'尚未启动；点击“开始转换这一批”派发任务。')}</p>${j?.reason?`<p class="tiny muted" style="white-space:pre-wrap">${esc(j.reason)}</p>`:''}<div class="actions">${j?`<button class="smallbtn" data-job="${esc(j.id)}">${j.policy_pause?'查看暂停原因':j.status==='waiting_input'?'回复 AI':['failed','blocked'].includes(j.status)?'查看原因 / 补充要求':'任务记录与沟通'}</button>`:''}${v?.status==='review'?`<button class="primary" data-review="${esc(v.id)}">试玩并验收</button>`:''}${j&&['failed','blocked'].includes(j.status)?`<button class="smallbtn" data-retry="${esc(j.id)}">重试本任务</button>`:''}${j?.status==='superseded'&&current?`<button class="primary" data-job="${esc(current.id)}">查看后续任务</button>`:''}</div></section>`;}).join('')}`,true);
  liveDialog = () => batchDetail(id);
}
function hasDraft(j){return Boolean(j.has_draft||(state.versions||[]).some(v=>v.id===j.version_id&&v.status==='draft'));}
// 处理路径：优先用服务端按证据算出的产线（网页采集 / AI 复刻 / REA 反编译 / 原版整理），
// route 字段只记录结果轴且到 review 才写入，排队任务全为 null，不能用来区分产线。
function routeLabel(j){return j.route_label||(j.display_status==="dependency_pending"?"原版优先":j.route==="A"?"A · 代码整理":j.route==="B"?"B · AI 复刻":j.route==="local"?"本地运行包":"待 REA 分流");}
function routeTone(j){return j.route_tone||(j.route==="A"?"green":"");}
function jobTable(list) {
  return list.length
    ? `<div class="table-wrap"><table class="table"><thead><tr><th>游戏 / 任务</th><th>当前阶段</th><th>处理路径</th><th>任务状态</th><th>进度</th><th>操作</th></tr></thead><tbody>${list.map((j) => `<tr><td><b>${esc(cBy(j.candidate_id).title)}</b><br><small>${esc(j.id)}</small></td><td>${esc(j.pipeline?.presentation?.location_label || j.pipeline?.nodes.find(n=>n.key===j.pipeline.current)?.label || (j.display_status==="dependency_pending"?"依赖分析与适配":{ rea: "REA 分析", reconstruct: "AI 复刻", packaging: "运行包整理" }[j.stage] || j.stage || "等待分析"))}</td><td><span class="badge ${routeTone(j)}" title="${esc(j.route_detail||"")}">${esc(routeLabel(j))}</span>${j.route_basis==="inferred"?'<p class="tiny muted">按来源与阶段推断</p>':''}</td><td>${badge(j.display_status||j.status)}${hasDraft(j)?'<p class="tiny muted">已有可试玩草稿</p>':''}${j.display_status==='needs_work'&&j.status==='failed'?'<p class="tiny muted">上次续作失败，可重试</p>':''}</td><td><small>${esc(j.progress_label||"等待阶段记录")}</small></td><td><button class="textbtn" data-job="${esc(j.id)}">继续沟通 / 记录</button>${["failed", "blocked"].includes(j.status) ? `<button class="smallbtn" data-retry="${esc(j.id)}">重试</button>` : ""}</td></tr>`).join("")}</tbody></table></div>`
    : empty("暂无任务记录", "从批次管理启动任务，执行工具将领取并回传进度。");
}
let showCompletedTasks=false;
function jobs() {
  const all=currentJobs(), active=all.filter(j=>j.status!=="completed"), list=showCompletedTasks?all:active;
  return `<div class="notice">${active.length} 个未完成任务 · ${all.filter(j=>j.status==='waiting_input'&&!j.policy_pause).length} 个待回复 · ${all.filter(j=>j.policy_pause).length} 个按 Web 范围暂停 · ${all.filter(j=>j.status==='review').length} 个待验收。退回意见会直接进入下一轮修改。</div><div class="actions" style="margin-bottom:16px"><button id="toggle-completed">${showCompletedTasks?'隐藏已完成':'显示已完成'}</button></div><div class="panel">${jobTable(list.filter(j=>!query||cBy(j.candidate_id).title.includes(query)||j.id.includes(query)))}</div>`;
}
function reviewImage(record, label, full = false) {
  const src=screenshotItems(record)[0];
  const configuredZoom = Number(record.preview?.zoom || 1);
  const zoom = Number.isFinite(configuredZoom) ? Math.max(1,Math.min(8,configuredZoom)) : 1;
  return src ? `<div class="review-shot${full ? ' review-shot-full' : ''}"><img src="${esc(src)}" alt="${esc(label)}" style="transform:scale(${full ? 1 : zoom});transform-origin:center"></div>` : `<div class="notice">${esc(label)}尚未采集。</div>`;
}
function supplyDeliveryList() {
  const deliveries=state.supply_deliveries||[];
  if(!deliveries.length)return '';
  return `<h3>已准备的供货包</h3><p class="muted">包含游戏文件、规格、授权声明和人工验收指引。下载运行包不代表下游已接受或模板已生成；草稿和待验收状态保持原样。</p>${deliveries.map(r=>`<details class="step"><summary>${esc(cBy(r.candidate_id).title)} · ${esc(({approved:'已验收',published:'已发布',review:'待人工验收',draft:'草稿'})[r.version_status]||r.version_status)}</summary><p>版本：${esc(r.version_id)} · ${(Number(r.archive_bytes||0)/1048576).toFixed(1)} MiB · ${esc(r.files)} 个文件</p><p>${r.template_structure==='pass'?'静态结构检查通过':'已保留完整运行包；当前模板格式兼容性待确认'}；${r.downstream_size_limits_pass?'数量与大小符合限制':'文件数量或大小仍超出当前下游限制'}</p>${r.runtime_recheck_required?'<p>已整理入口或资源布局，需在接收环境核对运行效果。</p>':''}<p style="overflow-wrap:anywhere">SHA-256：${esc(r.sha256)}</p><a class="button" href="/api/supply-deliveries/${encodeURIComponent(r.id)}/download">下载供货包</a></details>`).join('')}`;
}
function supplyPanel() {
  const names={pending:'待自动推送',blocked:'供货阻塞',retrying:'等待自动重试',tracking:'下游处理中',done:'下游已结束'};
  return `<section class="panel" style="margin-top:24px"><div class="panelhead"><h2>下游模板供货</h2></div>${state.supply_config && !state.supply_config.configured ? `<div class="notice">下游服务待配置，验收后会保留待推送任务。待处理：${esc([...(state.supply_config.missing||[]).map(k=>({SUPPLY_PLATFORM_BASE:"下游接口地址",SUPPLY_APP_ID:"供应方身份",SUPPLY_APP_SECRET:"授权码",SUPPLY_ARCHIVE_DIR:"分发目录",SUPPLY_ARCHIVE_BASE_URL:"HTTPS 下载前缀"})[k]||k),...(state.supply_config.errors||[])].join("、"))}</div>` : ""}<p class="muted">新版本人工验收通过后自动推送。供货问题不影响功能验收结果；历史已验收版本不会自动补推。</p>${supplyDeliveryList()}${(state.supply||[]).map(r=>`<details class="step"><summary>${esc(cBy(r.candidate_id).title)} · ${esc(r.state_text||names[r.status]||r.status)}</summary><p>版本：${esc(r.version_id)} · 提交：${esc(r.submission_id)}</p><p>下一步：${esc(({supplier:'我方处理',platform:'等待下游处理',none:'无需人工操作'})[r.next_action]||r.next_action||'—')} ${r.queue_position?` · 排队第 ${esc(r.queue_position)} 位`:''}</p><p>${esc(r.notice||'')}</p>${r.error_code?`<p class="tiny">错误码：${esc(r.error_code)}</p>`:''}${(r.issues||[]).map(i=>`<div class="notice"><b>${esc(i.severity)} · ${esc(i.title||i.code)}</b><p>${esc(i.detail||'')}</p><p>${esc(i.suggestion||'')}</p><p class="tiny">${esc((i.files||[]).join('、'))}</p></div>`).join('')}${['pending','blocked','retrying'].includes(r.status)?`<div class="actions">${!r.archive_sha256?`<button data-supply-metadata="${esc(r.id)}">补充供货资料</button>`:''}<button data-supply-retry="${esc(r.id)}">重新检查 / 重试</button></div>`:''}</details>`).join('')||'<p class="muted">尚无供货任务。下一次人工验收通过后自动创建。</p>'}</section>`;
}
function supplyMetadata(id) {
  modal('供货资料',`<p>仅填写已核实的可分发授权，须覆盖模板抽取与衍生作品发布。正常交付由执行器在 report.supply 中一并提供。</p><form id="supply-metadata-form"><label>供货资料 JSON</label><textarea name="metadata" rows="12" placeholder='{"license_declaration":{"distributable":"","owner":""},"known_limitations":[]}'></textarea><p class="tiny muted">可填写 license_declaration、acceptance_steps、known_limitations、contact_note。保存后自动检查并推送。</p><button class="primary">保存并继续供货</button></form>`);
  $('#supply-metadata-form').onsubmit=async e=>{
    e.preventDefault();
    try {await api('/api/supply/'+id+'/metadata',{metadata:JSON.parse(e.currentTarget.elements.metadata.value)});closeModal();await load();}
    catch(error){toast(error.message);}
  };
}
function reviews() {
  const pending=(state.versions||[]).filter(v=>v.status==='review');
  const seen=new Set();
  const accepted=(state.versions||[]).filter(v=>{if(!['approved','published'].includes(v.status)||seen.has(v.candidate_id))return false;seen.add(v.candidate_id);return true;});
  const cards=(items,done)=>items.map(v=>{const c=cBy(v.candidate_id);return `<article class="gamecard"><div class="cover" data-review="${esc(v.id)}">${reviewImage(v,'产出版本实机截图')}<div class="cover-badge">${badge(v.status)}</div></div><div class="gamebody"><h3>${esc(c.title)}</h3><p class="tiny muted">版本 ${esc(v.commit?.slice(0,7)||v.id)} · ${done?'验收于 '+date(v.approved_at):'提交于 '+date(v.created_at)}</p><div class="gamefoot"><span>${done?'✓ 玩法与画面已通过':'等待确认玩法与画面'}</span><button class="smallbtn ${done?'':'primary'}" data-review="${esc(v.id)}">${done?'查看验收结果':'开始验收'}</button></div></div></article>`;}).join('');
  return head('验收中心','HTML 移植完成后人工试玩验收；通过后自动进入下游模板供货。')+
    `<section id="pending-reviews"><div class="panelhead"><h2>待验收 <small>${pending.length} 个版本</small></h2></div><div class="cards review-cards">${cards(pending,false)||empty('当前没有待验收版本','新版本完成后会出现在这里。')}</div></section>`+
    `<section id="accepted-reviews" style="margin-top:32px"><div class="panelhead"><h2>已验收 <small>${accepted.length} 款游戏</small></h2></div><div class="cards accepted-cards">${cards(accepted,true)||empty('尚无已验收游戏','确认玩法和画面后，游戏会移入这里。')}</div></section>`+supplyPanel();
}
const serviceNames = {wechat: "小游戏转 Web 浏览器游戏服务", ai: "AI 服务"};
function toolPage() {
  return head("工具服务", "统一管理游戏转换、AI 与下游模板供货服务。") +
    `<div class="notice">转换与 AI 连接检测有效期为 5 分钟；供货检查显示最近一次检查快照。${demo ? "此处始终显示真实服务状态。" : ""}</div><div class="toolgrid service-grid">${(state.services || []).map(s => `<section class="panel service-card"><div class="panelhead"><div class="tool-avatar">${s.id === 'ai' ? '✦' : '⌘'}</div><span class="badge ${s.status === '在线' ? 'green' : s.status === '异常' ? 'red' : 'gray'}">${esc(s.status)}</span></div><h2>${serviceNames[s.id]}</h2><p class="muted service-description">${s.id === 'ai' ? '为游戏分析、代码生成与修复提供模型调用。' : '接收游戏链接，自动采集、重建、运行验证并入库待验收。'}</p><div class="kv"><span>服务地址</span><span class="service-address">${esc(s.base_url || (s.id === 'ai' ? '本机 Codex（自动备用）' : '平台内置执行器'))}</span></div>${s.id === 'ai' ? `<div class="kv"><span>接入方式</span><span>${esc((s.connection_label || s.backend) + (s.account_email ? ' · ' + s.account_email : ''))}</span></div><div class="kv"><span>模型</span><span>${esc(s.model || '使用本机 Codex 默认模型')}</span></div>` : '<p class="tiny muted">执行器随平台启动；失败保留记录，可重试。基于页面材料重建的版本不表示原版已完整移植。</p>'}<div class="kv"><span>最近检测</span><span>${s.checked_at ? date(s.checked_at * 1000) : '尚未检测'}</span></div><p class="tiny muted" role="status">${esc(s.detail)}</p><div class="modalfooter"><button class="smallbtn" data-service-config="${s.id}">配置服务</button><button class="primary" data-service-test="${s.id}" ${s.status === '未配置' ? 'disabled' : ''}>检测连接</button></div></section>`).join('')}${supplyServiceCard()}</div>`;
}
const supplyFields = {SUPPLY_PLATFORM_BASE:"下游接口地址",SUPPLY_APP_ID:"供应方 ID（非微信 AppID）",SUPPLY_APP_SECRET:"供应方授权码",SUPPLY_ARCHIVE_DIR:"服务器分发目录",SUPPLY_ARCHIVE_BASE_URL:"HTTPS 下载前缀",SUPPLY_EXPECTED_FINGERPRINT:"下游管理页授权码指纹（12 位）"};
function supplyServiceCard() {
  const s=state.supply_service||{}, c=s.check||{};
  return `<section class="panel service-card"><div class="panelhead"><div class="tool-avatar">↗</div><span class="badge ${c.identity==='verified'&&s.configured?'green':'gray'}">${!s.configured?'待配置':c.identity==='verified'?'身份已验证':c.identity==='failed'?'连接异常':'待检测'}</span></div><h2>下游模板供货服务</h2><p class="muted service-description">HTML 移植完成 → 人工验收 → 自动供货 → 跟踪下游处理结果。</p><div class="kv"><span>服务地址</span><span class="service-address">${esc(s.values?.SUPPLY_PLATFORM_BASE||'尚未配置')}</span></div><div class="kv"><span>供货任务</span><span>${(state.supply||[]).length} 个</span></div><div class="kv"><span>最近检查</span><span>${c.checked_at?date(c.checked_at):'尚未检查'}</span></div><p class="tiny muted">检查真实入库版本的静态结构与分发声明；不自动验收、重跑或提交游戏。</p><p class="tiny muted">${esc(c.error_code||(!s.configured?'待补充：'+(s.missing||[]).map(k=>supplyFields[k]||k).join('、'):c.notice||'保存配置后检查接入情况'))}</p><div class="actions"><button data-supply-config>配置服务</button><button data-supply-check class="primary">检查接入与游戏</button><button data-supply-report>查看检查结果</button><button data-nav="reviews">查看供货任务 ↗</button></div></section>`;
}
function supplyConfigDialog() {
  const s=state.supply_service||{};
  modal("配置下游模板供货服务",`<form id="supply-service-form">${Object.entries(supplyFields).map(([k,label])=>`<label>${label}</label><input name="${k}" type="${k==='SUPPLY_APP_SECRET'?'password':'text'}" autocomplete="off" value="${k==='SUPPLY_APP_SECRET'?'':esc(s.values?.[k]||'')}" placeholder="${k==='SUPPLY_APP_SECRET'&&s.has_secret?'已保存，留空保留':''}">`).join('')}<p class="tiny muted">配置保存在本平台服务端，授权码不会回传。当前下游协议使用供应方认证和 HTTPS 拉取游戏包；环境变量覆盖的字段需在部署环境修改。</p><div class="modalfooter"><button class="primary" type="submit">保存配置</button></div></form>`);
  $('#supply-service-form').onsubmit=async e=>{
    e.preventDefault();const b=e.currentTarget.querySelector('button');b.disabled=true;
    try {await api('/api/supply-service/save',Object.fromEntries(new FormData(e.currentTarget)));closeModal();await load();toast('供货服务配置已保存');}
    catch(err){$('#modal-error').textContent=err.message;b.disabled=false;}
  };
}
function supplyReportDialog() {
  const c=state.supply_service?.check||{};
  const reasons={NESTED_ARCHIVE:'包含嵌套压缩包，需交付展开后的静态游戏',TOOLCHAIN_UNSUPPORTED:'含不支持的引擎或构建产物',ARCHIVE_UNSAFE:'包含禁止交付的文件',SOURCE_DIRECTORY_MISSING:'缺少源码目录记录',SOURCE_UNREADABLE:'源码目录不可读'};
  modal("供货服务 · 游戏交付检查",`<p>${c.checked_at?'检查时间：'+esc(date(c.checked_at)):'尚未检查，请先点击“检查接入与游戏”。'}</p><p class="notice">结构检查通过不等于可供货；仍需完成分发声明、人工验收，以及下游下载链路确认。检查不会推送游戏。</p>${(c.games||[]).map(g=>`<div class="step"><strong>${esc(g.title)}</strong><p class="tiny muted">版本 ${esc(g.version_id)}</p><p>静态结构：${g.structure==='pass'?'通过 · '+g.files+' 个文件':esc(reasons[g.reason]||g.reason||'待检查')}</p><p>分发声明：${g.distribution_declared?'已记录，范围需真实有效':'待确认模板及衍生作品分发范围'}</p></div>`).join('')}<p class="tiny muted">${esc(c.notice||'')}</p>`);
}
function serviceDialog(id) {
  const s = state.services.find(s => s.id === id);
  if (id === 'ai') return aiServiceDialog(s);
  modal(serviceNames[id], `<form id="service-form"><label>运行方式</label><select name="backend" id="service-backend">${id === 'ai' ? '<option value="codex">本机 Codex</option><option value="auto">API 优先，Codex 备用</option><option value="api">仅 API</option>' : '<option value="wxapkg_v1">ZIP / v1/jobs</option><option value="builtin">平台内置执行器</option><option value="auto">外部转换服务</option>'}</select><div id="remote-service-fields"><label>服务地址</label><input name="base_url" type="url" value="${esc(s.base_url)}" placeholder="https://example.com/v1">${id === 'ai' ? `<label>模型名称</label><input name="model" value="${esc(s.model)}"><label>接口协议</label><select name="wire_api"><option value="chat_completions">Chat Completions</option><option value="responses">Responses API</option></select><label>附加授权头（可选）</label><input name="actor_authorization" type="password" autocomplete="new-password" placeholder="${s.has_actor_authorization ? '留空保留已保存值' : '未配置'}">` : ''}<label>API Key / 令牌</label><input name="api_key" type="password" autocomplete="new-password" placeholder="${s.has_key ? '留空保留已保存密钥' : '未配置'}"></div><p class="tiny muted">Codex 使用本机已有登录状态。密钥仅保存在服务端。外部转换服务需实现 POST /convert 并返回 files、entry。</p><div class="modalfooter"><button type="submit" class="primary">保存配置</button></div></form>`);
  $('#service-backend').value = s.backend === 'builtin' ? 'builtin' : id === 'ai' && !s.base_url ? 'codex' : s.backend || 'auto';
  const wireApi = $('#service-form [name="wire_api"]');
  if (wireApi) wireApi.value = s.wire_api || 'chat_completions';
  const packageOption = $('#service-backend option[value="wxapkg_v1"]');
  if (packageOption) packageOption.textContent = '原包转换服务（异步 ZIP）';
  const toggleFields = () => {
    const mode = $('#service-backend').value;
    $('#remote-service-fields').hidden = ['builtin','codex'].includes(mode);
    $('#service-form > p').textContent = id === 'ai' ? 'Codex 使用本机已有登录状态。密钥仅保存在服务端。' : mode === 'wxapkg_v1' ? '平台采集游戏包并匹配引擎，上传 ZIP 后查询结果并下载验证。当前适配 Cocos 3.5.1；缺失资源会保留原因，转换完成不代表玩法已验收。' : '内置执行器负责采集与验证；外部同步服务需实现 POST /convert 并返回 files、entry。密钥仅保存在服务端。';
  };
  $('#service-backend').onchange = toggleFields; toggleFields();
  $('#service-form').onsubmit = async e => {
    e.preventDefault();
    const button = e.currentTarget.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      state.services = await api(`/api/services/${id}/save`, Object.fromEntries(new FormData(e.currentTarget)));
      closeModal(); render(); toast('配置已保存，请检测连接');
    } catch (err) { $('#modal-error').textContent = err.message; button.disabled = false; }
  };
}
function aiServiceDialog(s) {
  const labels = {local_codex:'本地 Codex（独立账号）',codex_account:'Codex 账号（云服务器）',cloud_codex:'云服务器 Codex CLI',openai:'OpenAI 官方 API',compatible:'OpenAI 兼容 API'};
  const drafts = Object.fromEntries(Object.entries(s.profiles || {}).map(([key, value]) => [key, {...value}]));
  let selected = Object.hasOwn(labels, s.connection) ? s.connection : 'codex_account';
  modal('AI 服务', `<form id="ai-service-form"><p class="notice">当前连接：${esc(s.connection_label || '旧配置')}。各连接配置分别保存，保存后启用所选连接。</p><label>接入方式</label><select name="connection">${Object.entries(labels).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select><div id="ai-account-field"><label>Codex 账号邮箱</label><input name="account_email" type="email" autocomplete="username"></div><div id="ai-base-field"><label>服务基础地址</label><input name="base_url" type="url" required></div><label>模型名称</label><input name="model" required><label>接口协议</label><select name="wire_api"><option value="responses">Responses API</option><option value="chat_completions">Chat Completions</option></select><div id="ai-actor-field"><label>附加授权头（可选）</label><input name="actor_authorization" type="password" autocomplete="new-password"></div><label id="ai-key-label">API Key</label><input name="api_key" type="password" autocomplete="new-password"><p class="tiny muted" id="ai-connection-help"></p><div class="modalfooter"><button type="submit" class="primary">保存并启用</button></div></form>`);
  const form = $('#ai-service-form');
  const field = name => form.elements.namedItem(name);
  const renderFields = () => {
    const saved = drafts[selected] || {};
    field('connection').value = selected;
    for (const name of ['base_url','model','wire_api','api_key','actor_authorization','account_email']) field(name).value = saved[name] || (name === 'wire_api' ? 'responses' : '');
    field('api_key').placeholder = saved.has_key ? '留空保留此连接已保存的密钥' : '填写此连接的密钥';
    field('actor_authorization').placeholder = saved.has_actor_authorization ? '留空保留此连接已保存值' : '未配置';
    field('base_url').readOnly = selected === 'openai';
    field('model').readOnly = false;
    const account = selected === 'codex_account';
    $('#ai-account-field').hidden = !account; field('account_email').required = account;
    $('#ai-base-field').hidden = account; field('base_url').required = !account;
    field('api_key').hidden = account; $('#ai-key-label').hidden = account;
    field('wire_api').disabled = selected !== 'compatible';
    $('#ai-actor-field').hidden = !['compatible','cloud_codex'].includes(selected);
    $('#ai-key-label').textContent = 'API Key';
    $('#ai-connection-help').textContent = selected === 'local_codex' ? '连接本机独立登录账号的 Codex 桥接；由启动参数指定账号，凭据留在本机。电脑及 SSH 隧道须在线。' : account
      ? '使用此账号在云服务器上的独立 Codex 登录。先完成官方浏览器授权，再保存并检测；邮箱不是凭据，无需填写 API Key。模型是否可用以实际检测为准。'
      : selected === 'cloud_codex' ? '由云服务器服务账号启动 Codex CLI，使用此处配置的模型和 API 凭据。无需你电脑在线，也不依赖服务器管理员的交互登录。'
      : selected === 'openai' ? '直连 OpenAI 官方服务，请使用官方 API Key。模型名称须在该账号下可用；Responses 请求关闭响应存储。'
      : '使用兼容 OpenAI 协议的第三方服务。基础地址通常以 /v1 结尾，不要填写 /responses。Responses 请求关闭响应存储；模型可用性以服务检测为准。';
  };
  field('connection').onchange = () => {
    drafts[selected] = {...drafts[selected], ...Object.fromEntries(new FormData(form))};
    selected = field('connection').value;
    renderFields();
  };
  renderFields();
  form.onsubmit = async e => {
    e.preventDefault();
    const button = form.querySelector('button[type="submit"]'); button.disabled = true;
    try {
      state.services = await api('/api/services/ai/save', Object.fromEntries(new FormData(form)));
      closeModal(); render(); toast('AI 连接已启用，请检测连接');
    } catch (err) { $('#modal-error').textContent = err.message; button.disabled = false; }
  };
}
function settings() {
  const s = state.settings || {};
  const fields = [
    ['concurrency', '云服务器同时转换任务数（固定为 1）', 1, 1, 1],
    ['rea_minutes', 'REA 尝试上限（分钟）', 1, 180, s.rea_minutes || 45],
    ['reconstruct_minutes', 'AI 复刻上限（分钟）', 1, 600, s.reconstruct_minutes || 180],
    ['repair_rounds', '自动修复轮数', 1, 5, s.repair_rounds ?? 3],
  ];
  return head("来源与规则", "管理采集来源、处理预算与版本交付规则。") +
    `<div class="setting-grid"><div class="settings-column"><section class="panel"><div class="panelhead"><h2>处理预算</h2></div><p class="settings-help">设置同时处理的任务数，以及每轮分析与修复的上限。</p><form id="settings-form"><div class="formgrid">${fields.map(([name, label, min, max, value]) => `<div><label for="setting-${name}">${label}</label><input id="setting-${name}" name="${name}" type="number" min="${min}" ${max == null ? '' : `max="${max}"`} value="${value}" required></div>`).join('')}</div><div class="modalfooter"><button class="primary">保存规则</button></div></form></section><section class="panel"><div class="panelhead"><h2>统一源码仓库</h2></div><p class="settings-help">所有游戏统一保存，平台代码与游戏代码分离。</p><div class="code">game-library/<br>  games/{game-id}/<br>    src/ · public/ · game.json · README.md<br>  shared/<br>  tooling/</div><div class="kv"><span>仓库状态</span><span>${esc(state.repository?.status || '由服务端配置')}</span></div><div class="kv"><span>迁移方式</span><span>保留提交历史，同步到公司 Git</span></div></section></div><div class="settings-column"><section class="panel"><div class="panelhead"><h2>采集来源</h2><button class="textbtn" data-action="new-source">＋ 添加来源</button></div>${(state.sources || []).map(s => `<div class="healthrow"><div><h3>${esc(s.name)}</h3><a class="tiny" href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer">${esc(s.url)}</a></div><button class="smallbtn" data-source-rule="${esc(s.id)}">扫描规则</button><button class="smallbtn" data-source="${esc(s.id)}" aria-label="${s.enabled ? '停用' : '启用'}来源 ${esc(s.name)}" aria-pressed="${s.enabled}">${s.enabled ? '已启用' : '已停用'}</button></div>`).join('') || '<p class="muted">尚未配置来源</p>'}</section><section class="panel"><div class="panelhead"><h2>发布要求</h2></div><ul class="requirements">${['工程可构建，核心功能通过测试', '人工确认玩法、画面和资源使用条件', '版本绑定源码提交与运行产物', '预览版本和发布版本独立管理'].map(t => `<li>${t}</li>`).join('')}</ul></section></div></div>`;
}
let modalReturnFocus = null, liveDialog = null, backgroundDialog = false;
function modal(title, body, wide = false) {
  liveDialog = null;
  if (!$(".modal-backdrop")) modalReturnFocus = document.activeElement;
  document.body.classList.add("modal-open");
  const dialogHTML =
    `<div class="modal-backdrop"><section class="modal ${wide ? "wide" : ""}" tabindex="-1" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modalheader"><h2>${esc(title)}</h2><button class="close" aria-label="关闭">×</button></div>${body}<div class="error" id="modal-error"></div></section></div>`;
  if(backgroundDialog)patchHTML($("#overlay"),dialogHTML);
  else $("#overlay").innerHTML=dialogHTML;
  $(".close").onclick = closeModal;
  $(".modal-backdrop").onclick = (e) => {
    if (e.target === $(".modal-backdrop")) closeModal();
  };
  bind();
  if(!backgroundDialog)($(".modal input:not([type=checkbox])") || $(".modal .close") || $(".modal")).focus();
}
function closeModal() {
  liveDialog = null;
  $("#overlay").innerHTML = "";
  document.body.classList.remove("modal-open");
  if (modalReturnFocus?.isConnected) modalReturnFocus.focus({preventScroll: true});
  modalReturnFocus = null;
}
async function mutate(path, body, demoFn) {
  if (readOnly) { toast(READ_ONLY_HINT); return; }
  try {
    if (demo) {
      demoFn?.();
      render();
      toast("演示操作已完成 · 未写入真实数据");
    } else {
      await api(path, body);
      await load();
      toast("操作已完成");
    }
    closeModal();
  } catch (e) {
    if ($("#modal-error")) $("#modal-error").textContent = e.message;
    else toast(e.message);
  }
}
function provenancePanel(c) {
  const p = c.observations?.provenance;
  if (!p) return '<p class="tiny muted">提交工具尚未提供来源明细。</p>';
  const fields = [["代码来源", p.code_origin], ["素材来源", p.assets_origin], ["许可依据", p.license_basis], ["使用范围记录", p.use_scope], ["待确认内容", p.unresolved], ["封面来源", p.cover_origin]];
  return `<section style="margin-top:20px"><h3>代码与素材来源</h3>${fields.map(([label, value]) => `<div class="kv"><span>${label}</span><span style="max-width:75%;overflow-wrap:anywhere">${esc(value || "无")}</span></div>`).join("")}<details><summary>查看核对依据</summary><div class="code">${esc((p.evidence || []).map(e => `${e.path}\nSHA256: ${e.sha256}`).join("\n\n"))}</div></details><p class="tiny muted">${esc(p.checked_at)} · 按现有交付记录核对；资料记录不等于授权证明。</p></section>`;
}
function detail(id) {
  const c = cBy(id),
    vs = (state.versions || []).filter((v) => v.candidate_id === id);
  const latest = catalogVersion(id);
  const previewVersion = latest && screenshotItems(latest).length ? latest : null;
  const previewRecord = previewVersion || c;
  const previewImages = screenshotItems(previewRecord);
  modal(
    c.title,
    `<div class="tabs"><button class="tab active" data-dtab="preview">游戏预览</button><button class="tab" data-dtab="source">来源信息</button><button class="tab" data-dtab="code">代码与版本</button><button class="tab" data-dtab="tasks">处理记录</button></div><div id="detail-body"></div>`,
    true,
  );
  const panes = {
    preview: `<div class="detail-grid"><div><img class="detail-cover" src="${esc(previewImages[0] || cover(c))}" alt="${previewVersion ? '当前版本实机截图' : '来源游戏预览'}"><div class="screenshot-strip">${previewImages
      .map(
        (u, i) =>
          `<button ${previewVersion ? 'data-vgallery' : 'data-gallery'}="${esc(previewRecord.id)}" data-index="${i}" aria-label="查看截图 ${i + 1}"><img src="${esc(u)}" alt="游戏截图 ${i + 1}"></button>`,
      )
      .join(
        "",
      )}</div><p class="tiny muted">${demo ? "演示插画 · 非实际采集截图" : previewVersion ? "当前版本实机截图" : previewImages.length ? "来源预览图片" : "尚无来源或版本截图"}</p></div><div><h3>玩法简介</h3><p class="muted" style="margin:14px 0">${esc(c.description || "等待分析工具提交玩法说明。")}</p><div class="kv"><span>游戏类型</span><span>${esc(c.category || "待分类")}</span></div><div class="kv"><span>引擎</span><span>${esc(c.engine || "待识别")}</span></div><div class="kv"><span>状态</span>${badge(c.status)}</div><div class="modalfooter">${latest ? `<button class="smallbtn primary" data-play="${esc(latest.id)}">试玩当前版本</button>` : ''}<button class="smallbtn" data-rename="${esc(c.id)}">重命名</button><button class="smallbtn" data-edit="${esc(c.id)}">编辑资料</button><a href="${esc(safeUrl(c.url))}" target="_blank" rel="noopener noreferrer">打开来源试玩 ↗</a></div></div></div>`,
    source: `<div class="kv"><span>来源平台</span><span>${esc(c.source)}</span></div><div class="kv"><span>原始地址</span><a href="${esc(safeUrl(c.url))}" target="_blank" rel="noopener noreferrer">查看来源 ↗</a></div><div class="kv"><span>首次汇总</span><span>${date(c.created_at)}</span></div><div class="kv"><span>使用条件</span><span>${esc(({unknown:"待核实",owned:"自有实现",licensed:"已授权",open:"开源"})[c.rights] || c.rights || "待确认")}</span></div>${provenancePanel(c)}`,
    code: `<div class="code">games/${esc(c.id)}/</div>${
      vs
        .map(
          (v) =>
            `<div class="healthrow"><div><b>${esc(v.commit || "尚未提交")}</b><p class="tiny muted">${date(v.created_at)}</p><div class="screenshot-strip">${screenshotItems(
              v,
            )
              .map(
                (u, i) =>
                  `<button data-vgallery="${esc(v.id)}" data-index="${i}" aria-label="产出截图 ${i + 1}"><img src="${esc(u)}" alt="产出截图"></button>`,
              )
              .join(
                "",
              )}</div></div>${badge(v.status)}<button class="smallbtn" data-play="${esc(v.id)}">预览版本</button>${!demo ? `<a class="tiny" href="/api/versions/${esc(v.id)}/download">下载版本包</a>` : ""}${v.status === "published" ? `<button class="smallbtn" data-unpublish="${esc(v.id)}">下架版本</button>` : ""}</div>`,
        )
        .join("") ||
      empty("暂无代码版本", "执行工具提交产物并完成版本登记后可查看。")
    }`,
    tasks: jobTable((state.jobs || []).filter((j) => j.candidate_id === id)),
  };
  function set(t) {
    $("#detail-body").innerHTML = panes[t];
    document
      .querySelectorAll("[data-dtab]")
      .forEach((b) => b.classList.toggle("active", b.dataset.dtab === t));
    bind();
  }
  set("preview");
  document
    .querySelectorAll("[data-dtab]")
    .forEach((b) => (b.onclick = () => set(b.dataset.dtab)));
}
function dependencyPanel(candidate) {
  const record=candidate.dependencies, info=candidate.dependency_summary;
  const labels={unknown:'待分析',available:'已取得 · 待适配验证',missing:'待获取',rebuild:'待重建 / 适配',verified:'已验证',not_applicable:'不适用'};
  const kinds={code:'代码与引擎',resources:'资源',data:'配置数据',backend:'后端服务',platform:'平台接口'};
  if(!record)return '<section><h3>代码与资源依赖</h3><p class="muted">尚未形成依赖清单。缺少清单不代表没有依赖。</p></section>';
  return `<section><h3>代码与资源依赖</h3><p class="tiny muted">游戏运行还缺什么，以及每项依赖的下一步处理方式。</p><p>${esc(record.scope)}</p><div class="notice">共 ${info?.total||record.items.length} 项 · 已验证 ${info?.verified||0} 项 · 待处理 ${info?.unresolved||0} 项。${info?.ready?'清单已处理，仍需原版对照与玩法测试。':'依赖尚未闭合，不能据此认定完整还原。'}</div>${record.items.map(i=>`<details class="step"><summary>${esc(kinds[i.kind])} · ${esc(i.name)} — ${esc(labels[i.status])}</summary><p>${esc(i.reason)}</p><p>下一步：${esc(i.next_action||'—')}</p><p class="tiny" style="overflow-wrap:anywhere">证据：${esc(i.evidence||'待补充')}</p></details>`).join('')}<p class="tiny muted">清单版本 ${record.revision} · ${date(record.updated_at)}。已取得不等于已适配；状态不会自动替代人工验收。</p></section>`;
}
function pipelineRecords(records) {
  const groups=[];
  for(const r of records) {
    const last=groups.at(-1), previous=last?.[0];
    if(previous&&previous.message===r.message&&previous.round===r.round&&previous.attempt===r.attempt&&previous.status===r.status)last.push(r);
    else groups.push([r]);
  }
  return groups.map(group=>{
    const r=group[0], text=r.summary||r.message;
    return `<div class="pipeline-record"><p class="tiny"><time>${date(r.time)}</time> ${r.round?'第 '+r.round+' 轮 · ':''}${esc(text)}</p>${text!==r.message?`<details><summary class="tiny muted">详细记录（原始内容）</summary><p class="tiny">${esc(r.message)}</p></details>`:''}${group.length>1?`<details><summary class="tiny muted">相同记录共 ${group.length} 次 · 查看时间</summary>${group.slice(1).map(item=>`<p class="tiny">${date(item.time)}</p>`).join('')}</details>`:''}</div>`;
  }).join('');
}
function pipelinePanel(job) {
  const pipe=job.pipeline;
  if(!pipe)return '<p class="muted">当前服务尚未提供节点时间线。</p>';
  const labels={draft_saved:'草稿已保存 · 未完成',unrecorded:'缺少阶段结论',pending:'尚未开始',recorded:'结果未确认',running:'● 进行中',succeeded:'✓ 已完成',failed:'！执行失败',blocked:'！遇到阻断',waiting_input:'待处理',skipped:'已跳过',cancelled:'已停止'};
  const summary=pipe.presentation, countLabels={complete:'本轮已完成',active:'进行中',issue:'有问题',waiting:'等待处理',incomplete:'未完成',pending:'尚未开始',unknown:'结论缺失',history:'历史结果',optional:'按需 / 跳过',stopped:'已停止'};
  return `<section class="pipeline"><h3>转换阶段与完成情况</h3>${summary?`<div class="pipeline-overview"><strong>${esc(summary.headline)}</strong>${summary.current_title?`<p>当前节点：${esc(summary.current_title)} <button class="smallbtn" data-stage-focus="${esc(pipe.current)}">定位这个阶段 ↓</button></p>`:''}${summary.problem?`<p class="pipeline-problem"><b>当前问题：</b>${esc(summary.problem)}</p>`:''}<p>下一步：${esc(summary.next_action)}</p><div class="pipeline-counts">${Object.entries(countLabels).filter(([k])=>summary.counts[k]).map(([k,label])=>`<span data-group="${k}">${label} ${summary.counts[k]} 项</span>`).join('')}</div><p class="tiny muted">完成项只统计本轮有明确结论的阶段，历史完成与按需步骤单独显示。</p></div>`:''}<p class="tiny muted">${esc(pipe.note)}</p><ol>${pipe.nodes.map((n,index)=>{
    const view=n.presentation, records=n.records||[], currentRecords=records.filter(r=>(r.round||1)===(job.round||1)), history=records.filter(r=>(r.round||1)!==(job.round||1));
    return `<li data-node="${esc(n.key)}" data-status="${esc(n.status)}" data-group="${esc(view?.group||'unknown')}" ${pipe.current===n.key?'aria-current="step"':''}><div class="pipeline-stage-header"><strong>${index+1}. ${esc(view?.title||n.label)}</strong><span class="pipeline-status">${esc(view?.label||labels[n.status]||n.status)}</span></div>${view?`<p class="pipeline-work">${esc(view.work)}</p><p class="pipeline-result"><b>当前结果：</b>${esc(view.result)}</p>${view.problem?`<p class="pipeline-problem"><b>问题：</b>${esc(view.problem)}</p>`:''}<p class="pipeline-next"><b>下一步：</b>${esc(view.next_action)}</p>${view.previous?`<p class="tiny muted">历史结论：${esc(view.previous)}</p>`:''}`:''}<details class="pipeline-evidence"><summary>查看过程与依据 · 本轮 ${currentRecords.length} 条 / 历史 ${history.length} 条</summary>${n.started_at?`<p class="tiny">开始 ${date(n.started_at)}</p>`:''}${n.ended_at?`<p class="tiny">结束 ${date(n.ended_at)}</p>`:''}${n.duration_seconds!=null?`<p class="tiny">耗时 ${n.duration_seconds} 秒</p>`:''}${!view&&n.reason&&n.reason!==job.question&&!records.some(r=>r.message?.trim()===n.reason.trim())?`<p>${esc(n.reason)}</p>`:''}${n.version_id?`<p class="tiny">关联版本 ${esc(n.version_id)}</p>`:''}${pipelineRecords(currentRecords)}${!currentRecords.length?'<p class="tiny muted">本轮没有独立的步骤日志；如有版本结果，以阶段说明为准。</p>':''}${history.length?`<details><summary>此前轮次记录</summary>${pipelineRecords(history)}</details>`:''}</details></li>`;
  }).join('')}</ol></section>`;
}
function gameSpecPanel(candidate,job) {
  const spec=candidate.game_spec;
  if(!spec)return '';
  const run=(state.game_test_runs||[]).find(r=>r.job_id===job.id&&r.report?.spec_digest===spec.digest);
  const results=new Map((run?.report?.cases||[]).map(c=>[c.id,c]));
  return `<details class="task-game-spec"><summary>游戏规格与测试 · ${esc(spec.category)} · 第 ${spec.revision} 版</summary><p>${esc(spec.scope)}</p>${[['controls','操作'],['mechanics','玩法'],['dependencies','依赖'],['reuse','代码复用边界'],['unknowns','待确认项']].map(([key,label])=>`<h4>${label}</h4><ul>${(spec[key]||[]).map(text=>`<li>${esc(text)}</li>`).join('')||'<li>暂无记录</li>'}</ul>`).join('')}<h4>验收用例</h4>${spec.cases.map(c=>{const r=results.get(c.id);return `<div class="step"><b>${esc(c.id)} · ${esc(({passed:'通过',failed:'失败',blocked:'阻塞',manual_required:'待人工验证'})[r?.status]||'未执行')}</b><p>${esc(c.expected)}</p>${r?.reason||c.reason?`<p class="tiny muted">${esc(r?.reason||c.reason)}</p>`:''}</div>`}).join('')}<p class="tiny muted">${run?'最近测试：'+date(run.created_at):'尚无匹配当前规格的测试记录'}。测试通过不替代分发许可或人工验收。</p></details>`;
}
let taskSectionJob='',taskSection='summary',taskSectionStatus='';
function jobDetail(id) {
  const j=(state.jobs||[]).find(j=>j.id===id);if(!j)return;
  const versions=(state.versions||[]).filter(v=>v.candidate_id===j.candidate_id);
  const messages=(state.messages||[]).filter(m=>m.candidate_id===j.candidate_id).slice().reverse();
  const history=(state.jobs||[]).filter(h=>h.candidate_id===j.candidate_id);
  const messageKind=m=>m.role==='user'?'request':m.presentation||m.kind||'legacy';
  const conversation=messages.filter(m=>['request','question','reply'].includes(messageKind(m)));
  const reports=messages.filter(m=>['progress','result'].includes(messageKind(m)));
  const legacy=messages.filter(m=>messageKind(m)==='legacy');
  const messageMarkup=list=>list.map(m=>`<div class="step"><b>${m.role==='user'?esc(m.created_by_name||'历史用户'):messageKind(m)==='question'?'AI 提问':'AI'} · 第 ${m.round} 轮</b><p style="white-space:pre-wrap">${esc(m.text)}</p><small>${date(m.created_at)}</small></div>`).join('');
  const olderJobs=history.filter(h=>h.id!==id);
  const timelineRecords=(j.pipeline?.nodes||[]).flatMap(n=>n.records||[]);
  const timelineIds=new Set(timelineRecords.map(r=>r.event_id));
  const sameMessage=(text,round)=>messages.some(m=>m.text?.trim()===text?.trim()&&m.round===round);
  const represented=text=>!!text&&((j.pipeline?.nodes||[]).some(n=>n.reason?.trim()===text.trim()||(n.records||[]).some(r=>r.message?.trim()===text.trim()))||sameMessage(text,j.round||1));
  const extraEvents=(state.events||[]).filter(e=>history.some(h=>h.id===e.job_id)&&!timelineIds.has(e.id)&&!sameMessage(e.message,e.round));
  const rounds=(state.rounds||[]).filter(r=>r.candidate_id===j.candidate_id);
  const roundReasonShown=r=>sameMessage(r.reason,r.round)||timelineRecords.some(e=>e.round===r.round&&e.message?.trim()===r.reason?.trim())||extraEvents.some(e=>e.round===r.round&&e.message?.trim()===r.reason?.trim());
  const canReply=['review','waiting_input','blocked','failed','completed'].includes(j.status);
  const next={queued:'等待执行器领取',running:'AI 正在处理，完成后可继续反馈',waiting_input:'等待你回答下面的问题',review:'等待你试玩验收，或提交修改要求',completed:'已验收；仍可提出新修改',failed:'查看错误后重试或补充要求',blocked:'查看错误后重试或补充要求'};
  modal(cBy(j.candidate_id).title+' · 持续任务',`
    <div class="kv"><span>当前状态</span>${badge(j.display_status||j.status)}</div><div class="kv"><span>实际进展</span><span>${esc(j.progress_label||"等待阶段记录")}</span></div><div class="kv"><span>下一步</span><span>${esc(j.pipeline?.presentation?.next_action || (j.display_status==='dependency_pending'?'按依赖清单继续获取、适配及验证；尚未完成自动执行':j.display_status==='needs_work'?'已有草稿，基础还原尚未完成；可试玩后补充修改要求':next[j.status]||'历史记录'))}</span></div>
    ${j.display_status==='needs_work'&&j.status==='failed'?'<div class="notice">上次续作失败，原因见下方记录；已有草稿仍可试玩，可继续沟通或重试。</div>':''}
    <p class="tiny muted">任务 ${esc(j.id)} · 第 ${j.round||1} 轮${j.created_by_name?' · 发起人 '+esc(j.created_by_name):' · 历史任务未记录发起人'}</p>${j.reason&&!represented(j.reason)?`<p>${esc(j.reason)}</p>`:''}
    <div class="task-tabs" role="group" aria-label="任务详情分区">${[['summary','进度概览'],['conversation','沟通与操作'],['versions','交付版本'],['evidence','分析与记录']].map(([key,label])=>`<button type="button" data-task-section="${key}" aria-pressed="false">${label}</button>`).join('')}</div><section class="task-pane" data-task-pane="summary">${pipelinePanel(j)}${j.auto_followup?.gaps?.length?`<section><h3>最近一次检查的未完成项</h3><ul>${j.auto_followup.gaps.map(g=>`<li>${esc(g)}</li>`).join('')}</ul><p class="tiny muted">执行中的新结果尚未计入，不代表剩余操作次数。</p></section>`:''}<p class="tiny muted">详细分析与执行依据见“分析与记录”；提交要求和回复见“沟通与操作”。</p></section><section class="task-pane" data-task-pane="evidence">
    ${j.conversion_plan?`<details class="task-game-spec"><summary>转换分析与分流 · ${esc(j.conversion_plan.label)}</summary><p>${esc(j.conversion_plan.scope)}</p><p class="tiny muted">${j.conversion_plan.recorded?"已记录的执行决策":"依据当前材料评估；历史执行未记录分流报告"}</p><h4>已取得的依据</h4><ul>${(j.conversion_plan.evidence||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul><h4>待处理</h4><ul>${(j.conversion_plan.missing||[]).map(x=>`<li>${esc(x)}</li>`).join('')||'<li>分流阶段未列出缺项；仍需运行和玩法验证。</li>'}</ul><p>下一步：${esc(j.conversion_plan.next_action)}</p></details>`:''}
    ${!versions.length&&['blocked','failed','waiting_input'].includes(j.status)&&(state.web_profiles||[]).length?`<section class="panel"><h3>Web 原版恢复</h3><p class="muted">为现成网页游戏选择已登记方案。平台执行原资源采集、版本哈希核对、适配及离线玩法验证；不匹配时保留原因并停止。</p><form id="restore-web-form"><label for="web-profile">恢复方案</label><select id="web-profile"><option value="auto">自动识别网页来源</option>${state.web_profiles.filter(p=>(cBy(j.candidate_id).web_restore_profiles||[]).includes(p.id)).map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('')}</select>${state.web_profiles.filter(p=>(cBy(j.candidate_id).web_restore_profiles||[]).includes(p.id)).map(p=>`<p class="tiny muted">${esc(p.name)}：${esc(p.description)}</p>`).join('')}<button class="primary" type="submit">按此方案恢复并验证</button></form></section>`:''}
    ${cBy(j.candidate_id).observations?.web_profile_id?`<p class="tiny muted">Web 恢复方案：${esc(cBy(j.candidate_id).observations.web_profile_id)} · 执行结果保存在版本报告与任务记录中。</p>`:''}
    ${reports.length?`<details class="task-progress-reports"><summary>AI 执行汇报 · ${reports.length} 条</summary><p class="tiny muted">处理结果与已知限制，属于执行记录。</p>${messageMarkup(reports)}</details>`:''}
    ${dependencyPanel(cBy(j.candidate_id))}
    ${gameSpecPanel(cBy(j.candidate_id),j)}
    </section><section class="task-pane" data-task-pane="conversation"><section class="task-conversation"><h3>沟通记录</h3><p class="tiny muted">你的要求、AI 答复与需要你确认的问题。</p>${j.status==='waiting_input'&&j.question&&!conversation.some(m=>m.text?.trim()===j.question.trim())?`<div class="notice">${j.policy_pause?'暂停说明：':'需要你回复：'}${esc(j.question)}</div>`:''}${messageMarkup(conversation)||'<p class="muted">暂无已分类对话，可在下方提交修改要求。</p>'}</section>
    ${legacy.length?`<details class="task-legacy-messages"><summary>历史未分类消息 · ${legacy.length} 条</summary><p class="tiny muted">旧记录未标注用途，保留原文供核对，不自动猜测为问题或执行进度。</p>${messageMarkup(legacy)}</details>`:''}
    ${canReply?`<form id="task-message-form"><label for="task-message">${j.policy_pause?'补充网页入口或说明':j.status==='waiting_input'?'回复 AI':'修改要求 / 补充信息'}</label><textarea id="task-message" maxlength="8000" required placeholder="例如：保留原角色资源，调整跳跃高度，并验证手机操作。"></textarea><div class="modalfooter"><button class="primary" type="submit">发送并继续处理</button></div></form>`:'<p class="muted">当前轮处理结束后可继续提交意见。状态会自动更新。</p>'}
    <button id="reload-task" class="smallbtn">重新读取状态</button>
    </section><section class="task-pane" data-task-pane="versions"><h3>版本记录</h3>${versions.map(v=>`<div class="kv"><span>${esc(v.id)} ${badge(v.status)}</span><span><button class="smallbtn" data-task-play="${esc(v.id)}">试玩</button>${v.status==='review'?`<button class="smallbtn" data-task-review="${esc(v.id)}">验收</button>`:''}</span></div>`).join('')||'<p>尚无版本</p>'}
    ${olderJobs.length||rounds.length||extraEvents.length?`<details class="task-history"><summary>历史任务与补充记录</summary>${olderJobs.length?jobTable(olderJobs):''}${rounds.length?`<h4>轮次结果</h4>${rounds.map(r=>`<p>第 ${r.round||1} 轮：${esc(statusMap[r.status]||r.status)}${r.reason&&!roundReasonShown(r)?' · '+esc(r.reason):''}</p>`).join('')}`:''}${extraEvents.length?`<h4>其他执行记录</h4>${extraEvents.map(e=>`<p>${date(e.created_at)}${e.round?' · 第 '+e.round+' 轮':''} · ${esc(e.message)}</p>`).join('')}`:''}</details>`:''}</section>`,true);
  document.querySelector('.modal').classList.add('task-detail');
  if(taskSectionJob!==id){taskSectionJob=id;taskSection=j.status==='waiting_input'&&!j.policy_pause?'conversation':'summary';}
  if(taskSectionStatus!==j.status&&j.status==='waiting_input'&&!j.policy_pause)taskSection='conversation';
  taskSectionStatus=j.status;
  const showSection=key=>{
    taskSection=key;
    document.querySelectorAll('[data-task-pane]').forEach(p=>p.hidden=p.dataset.taskPane!==key);
    document.querySelectorAll('[data-task-section]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.taskSection===key)));
  };
  showSection(taskSection);
  document.querySelectorAll('[data-task-section]').forEach(b=>b.onclick=()=>showSection(b.dataset.taskSection));
  liveDialog = () => jobDetail(id);
  listen($('#restore-web-form'),'submit',e=>{e.preventDefault();const button=e.currentTarget.querySelector('button');button.disabled=true;mutate(`/api/jobs/${id}/restore-web`,{profile_id:$('#web-profile').value},()=>{j.status='queued';}).finally(()=>{button.disabled=false;});});
  listen($('#task-message-form'),'submit',e=>{e.preventDefault();const button=e.currentTarget.querySelector('button');button.disabled=true;mutate(`/api/jobs/${id}/message`,{message:$('#task-message').value},()=>{j.status='queued';}).finally(()=>{button.disabled=false;});});
  $('#reload-task').onclick=async()=>{if(!demo)state=presentPolicyPauses({...state,...await api('/api/state')});jobDetail(id);};
  document.querySelectorAll('[data-task-play]').forEach(b=>b.onclick=()=>play(b.dataset.taskPlay));
  document.querySelectorAll('[data-task-review]').forEach(b=>b.onclick=()=>review(b.dataset.taskReview));
}
function play(id) {
  const v = (state.versions || []).find((v) => v.id === id);
  if (!v) return toast("尚无可运行版本");
  const u = safeUrl(v.preview_url);
  modal(
    cBy(v.candidate_id).title + " · 版本试玩",
    demo
      ? '<div class="notice">这是交互设计演示，没有实际游戏运行包。真实版本将由独立试玩服务加载。</div>' +
          `<img class="detail-cover" src="${esc(cover(cBy(v.candidate_id)))}" alt="演示插画">`
      : u === "#" || !v.preview_url
        ? empty("运行包尚未部署", "请先完成构建并配置独立试玩地址。")
        : v.preview_mode === "external"
          ? `<div class="notice">${readOnly?'此版本以独立运行目录打包，将在新窗口打开完整游戏。':'此游戏运行包使用独立本地窗口试玩。下载版本包后按包内说明启动，也可在下方打开已启动的运行服务。'}</div><p><a class="primary" href="${esc(u)}" target="_blank" rel="noopener noreferrer">打开 ${esc(cBy(v.candidate_id).title)} 试玩</a></p><p class="tiny muted">版本 ${esc(v.commit || v.id)} · ${readOnly?'云端只读运行包':'本地运行包'}，使用范围以验收记录为准</p>`
          : `<iframe sandbox="allow-scripts" referrerpolicy="no-referrer" src="${esc(u)}" title="游戏试玩"></iframe><p class="tiny muted">隔离运行 · ${esc(v.commit || v.id)}</p>`,
    true,
  );
}
const specificationViews = new Map();
function specificationHtml(markdown) {
  // Only headings and paragraphs are emitted by the shared document generator.
  // Treat Markdown body/HTML as text, never execute embedded markup or links.
  return String(markdown).split(/\n\s*\n/).map(block => {
    const heading=block.match(/^(#{1,2}) (.*)$/);
    return heading ? `<h${heading[1].length+2}>${esc(heading[2])}</h${heading[1].length+2}>`
      : `<p style="white-space:pre-wrap;overflow-wrap:anywhere">${esc(block)}</p>`;
  }).join('');
}
function review(id) {
  const v = (state.versions || []).find((v) => v.id === id),
    c = cBy(v.candidate_id);
  modal(
    c.title + (["approved","published"].includes(v.status) ? " · 验收结果" : " · 版本验收"),
    `<div class="preview-pair" style="grid-template-columns:minmax(0,1fr)"><div><h3>产出版本 ${badge(v.status)}</h3>${reviewImage(v,"产出版本实机截图",true)}<p class="tiny muted">${demo ? "演示插画，非复刻成果" : screenshotItems(v).length ? "该版本运行截图" : "该版本尚未提供运行截图"}</p><button class="smallbtn" data-play="${esc(v.id)}">▷ 打开产出试玩</button></div></div><details id="game-specification" class="panel" style="margin-top:20px" ${specificationViews.get(id)?.open ? "open" : ""}><summary><strong>游戏规格说明书</strong> <span class="tiny muted">Markdown · 点击阅读</span></summary><article id="game-specification-content" style="margin-top:16px">${specificationViews.get(id)?.html || '<p class="muted">展开后加载说明书。</p>'}</article></details>${provenancePanel(c)}<form id="review-form"><label class="checkrow"><input type="checkbox" name="gameplay" required>核心玩法、计分或胜负、重开符合规格</label><label class="checkrow"><input type="checkbox" name="visual" required>画面可用且无阻断运行错误</label><p class="tiny muted">此处确认玩法与画面，完成学习项目的功能验收入库。资源使用信息另行记录，发布前核对。</p><label>验收意见 / 退回原因</label><textarea name="reason" placeholder="记录需要修复的问题…"></textarea><div class="modalfooter"><button type="button" id="reject-version">退回修复</button><button type="submit" class="primary">${v.status === "approved" ? "发布到小游戏库" : "通过验收"}</button></div></form>`,
    true,
  );
  const specification = $('#game-specification');
  specification.ontoggle = async () => {
    const view=specificationViews.get(id)||{};
    view.open=specification.open;specificationViews.set(id,view);
    if(!view.open||view.html||view.loading)return;
    view.loading=true;
    const content=specification.querySelector('article');content.textContent='正在加载说明书…';
    try {
      const response=await fetch(`/api/versions/${encodeURIComponent(id)}/specification.md`,{credentials:'same-origin'});
      if(!response.ok)throw new Error(response.status===401?'请重新登录后查看说明书':'说明书加载失败，请收起后重试');
      view.html=specificationHtml(await response.text());
      if(content.isConnected)content.innerHTML=view.html;
    } catch(error) { if(content.isConnected)content.textContent=error.message; }
    finally { view.loading=false; }
  };
  liveDialog = () => review(id);
  if (["rejected","superseded"].includes(v.status)) {
    $("#review-form").outerHTML = `<div class="notice" style="margin-top:20px">此版本已退回或被新版替代：${esc(v.reason || "请查看任务记录中的修复意见")}。修复要求会进入当前任务，提交新版本后再验收。</div><div class="modalfooter"><button id="review-back-to-jobs" class="primary">前往任务中心</button></div>`;
    $("#review-back-to-jobs").onclick = () => { closeModal(); location.hash = "jobs"; };
    return;
  }
  if (['approved','published'].includes(v.status)) {
    const summary=document.createElement('div');summary.className='notice';summary.innerHTML=`<strong>✓ 功能验收已通过</strong><p>验收时间：${esc(date(v.approved_at))} · ${v.status==='published'?'已发布':'已入库'}</p><p>玩法与画面检查已确认，无须重复验收。</p>`;$('#review-form').prepend(summary);
    $('#review-form textarea').value=v.reason||'功能验收通过';$('#review-form textarea').readOnly=true;
    if(v.status==='published'){$('#review-form button[type="submit"]').disabled=true;$('#review-form button[type="submit"]').textContent='已验收并发布';}
    $("#review-form").querySelectorAll('input[type="checkbox"]').forEach(input => { input.checked = true; input.disabled = true; });
    $("#reject-version").hidden = true;
    if(!['owned','licensed','open'].includes(c.rights)){
      const submit=$('#review-form button[type="submit"]');submit.disabled=true;submit.textContent='功能验收已通过';
      const note=document.createElement('p');note.className='notice';note.textContent='已完成学习项目的功能验收。资源使用信息尚未确认，补充后才能发布。';$('#review-form').prepend(note);
    }
  }
  $("#review-form").onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target),
      op = v.status === "approved" ? "publish" : "approve";
    mutate(
      `/api/versions/${id}/${op}`,
      {
        reason: f.get("reason"),
        checks: { gameplay: f.get("gameplay") === "on", visual: f.get("visual") === "on" },
      },
      () => (v.status = op === "publish" ? "published" : "approved"),
    );
  };
  $("#reject-version").onclick = () => {
    const reason = $("#review-form textarea").value.trim();
    if (!reason)
      return ($("#modal-error").textContent =
        "请填写退回原因，便于执行工具修复。");
    mutate(
      `/api/versions/${id}/reject`,
      { reason },
      () => (v.status = "rejected"),
    );
  };
}
function formDialog(type) {
  let title, html;
  if (type === "new-candidate") {
    title = "链接自动转换";
    html = `<label>游戏链接或微信小程序分享链接</label><input name="url" type="text" required placeholder="https://… 或 #小程序://游戏名称/分享码"><p class="tiny muted">提交后创建转换任务。小程序需要在本机微信运行并确认匹配缓存；缺少材料时任务会等待补充，不会改用其他游戏资源。</p>`;
  } else if (type === "new-batch") {
    title = "提交链接 · 批量复刻";
    html = `<label>批次名称（可选）</label><input name="name" maxlength="120" placeholder="自动命名为链接复刻批次"><label>游戏链接（每行一个，最多 100 个）</label><textarea name="urls" rows="7" required placeholder="https://…
#小程序://游戏名称/分享码"></textarea><p class="tiny muted">提交后立即排队调用微信小游戏转 Web 服务。已有活动任务或已完成的游戏会返回原任务，不重复执行。缺少缓存时会提示补充。</p>`;
  } else if (type === "new-tool") {
    title = "注册执行工具";
    html =
      '<label>工具名称</label><input name="name" required placeholder="例如：REA Worker 01"><label>能力（英文逗号分隔）</label><input name="capabilities" required placeholder="collect, rea, reconstruct"><p class="tiny muted" style="margin-top:14px">凭证仅显示一次。工具通过 Bearer Token 调用执行接口。</p>';
  } else {
    title = "添加采集来源";
    html =
      '<label>来源名称</label><input name="name" required><label>来源网址</label><input name="url" type="url" required placeholder="https://">';
  }
  modal(
    title,
    `<form id="dialog-form">${html}<div class="modalfooter"><button type="button" id="cancel-form">取消</button><button class="primary">确认创建</button></div></form>`,
  );
  $("#cancel-form").onclick = closeModal;
  $("#dialog-form").onsubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target),
      body = Object.fromEntries(f);
    if (["new-candidate","new-batch"].includes(type) && demo) return ($("#modal-error").textContent = "请先切换到实时数据，再提交真实转换任务。");
    const collection = {
      "new-candidate": "conversions",
      "new-batch": "conversions",
      "new-tool": "tools",
      "new-source": "sources",
    }[type];
    if (type === "new-batch") {
      if (!state.features?.link_batches) return ($("#modal-error").textContent = "批次功能已更新，请先重启平台服务并刷新页面。");
      body.urls = String(body.urls || "").split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
      if (!body.urls.length || body.urls.length > 100) return ($("#modal-error").textContent = "每批填写 1–100 个链接。");
      const button=e.target.querySelector('button[type="submit"],button.primary');button.disabled=true;
      try {
        const result=await api('/api/conversions',body);await load();
        modal('批次提交结果',`<p>新建 ${result.jobs.length} 个任务，复用 ${result.reused.length} 个已有任务。</p><p class="muted">新任务已排队；已存在的任务保持原批次和状态。</p>${result.batch?`<button data-batch-detail="${esc(result.batch.id)}" class="primary">查看新批次</button>`:''}${result.reused.map(r=>`<p><button data-job="${esc(r.job_id)}" class="textbtn">查看已有任务 · ${esc(cBy(r.candidate_id).title)}</button></p>`).join('')}`);
        bind();
      } catch(error) { $("#modal-error").textContent=error.message;button.disabled=false; }
      return;
    }
    if (type === "new-tool")
      body.capabilities = body.capabilities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    if (type === "new-tool" && !demo) {
      try {
        const r = await api("/api/tools", body);
        await load();
        modal(
          "工具注册成功",
          `<p class="muted">请立即保存令牌，关闭后不再显示。</p><div class="code token" style="margin-top:15px">${esc(r.token)}</div>`,
        );
      } catch (e) {
        $("#modal-error").textContent = e.message;
      }
      return;
    }
    mutate("/api/" + collection, body, () => {
      state[collection] ??= [];
      state[collection].unshift({
        ...body,
        id: "demo-" + Date.now(),
        created_at: new Date().toISOString(),
        status: type === "new-batch" ? "queued" : "discovered",
        enabled: true,
      });
    });
  };
}
function bind() {
  document.querySelectorAll('[data-stage-focus]').forEach(b=>b.onclick=()=>document.querySelector('.pipeline [data-node="'+CSS.escape(b.dataset.stageFocus)+'"]')?.scrollIntoView({block:'center',behavior:'instant'}));
  bindDashboard(render);
  document.querySelectorAll('[data-supply-metadata]').forEach(b=>b.onclick=()=>supplyMetadata(b.dataset.supplyMetadata));
  document.querySelectorAll('[data-supply-retry]').forEach(b=>b.onclick=async()=>{
    try {await api('/api/supply/'+b.dataset.supplyRetry+'/retry',{});await load();}catch(e){toast(e.message);}
  });
  bindDiscovery();
  document.querySelectorAll("[data-rename]").forEach(b=>b.onclick=()=>renameGame(b.dataset.rename));
  document.querySelectorAll("[data-batch-detail]").forEach(b=>b.onclick=()=>batchDetail(b.dataset.batchDetail));
  document.querySelectorAll('.cover[data-detail], .cover[data-review]').forEach(el => {
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', (el.hasAttribute('data-review') ? '验收：' : '查看详情：') + (el.querySelector('img')?.alt || '游戏'));
    el.onkeydown = e => { if (['Enter', ' '].includes(e.key)) { e.preventDefault(); el.click(); } };
  });
  document.querySelectorAll('.table-wrap').forEach(el => { el.tabIndex = 0; el.setAttribute('role', 'region'); el.setAttribute('aria-label', '记录列表，可横向滚动查看'); });
  document.querySelectorAll('[data-service-config]').forEach(b => b.onclick = () => serviceDialog(b.dataset.serviceConfig));
  listen(document.querySelector('[data-supply-config]'),'click',supplyConfigDialog);
  listen(document.querySelector('[data-supply-report]'),'click',supplyReportDialog);
  listen(document.querySelector('[data-supply-check]'),'click',async e=>{
    const b=e.currentTarget;b.disabled=true;b.dataset.busy='true';b.textContent='检查中…';
    try {await api('/api/supply-service/check',{});await load();supplyReportDialog();}
    catch(err){toast(err.message);b.disabled=false;delete b.dataset.busy;b.textContent='检查接入与游戏';}
  });
  document.querySelectorAll('[data-service-test]').forEach(b => b.onclick = async () => {
    const service = b.dataset.serviceTest;
    b.disabled = true; b.dataset.busy = 'true';
    const started = Date.now();
    const update = () => { b.textContent = `检测中 ${Math.floor((Date.now()-started)/1000)} 秒…`; };
    update();
    const timer = setInterval(update, 1000);
    try {
      const services = await api(`/api/services/${service}/test`, {}, {signal: AbortSignal.timeout(service === 'ai' ? 75000 : 30000)});
      mutationEpoch++;
      state.services = services;
      toast((state.services.find(s => s.id === service)?.detail) || '检测完成');
    } catch (e) {
      toast(e.name === 'TimeoutError' ? '检测超过等待上限，请检查连接后重试' : e.message);
    } finally {
      clearInterval(timer);
      delete b.dataset.busy;
      b.disabled = false;
      b.textContent = '检测连接';
      render();
    }
  });
  listen(document.querySelector('[data-motion-toggle]'),'click', e => {
    const hero = document.querySelector('.playground-hero');
    const paused = hero.dataset.motion !== 'paused';
    hero.dataset.motion = paused ? 'paused' : 'running';
    localStorage.setItem('hero-motion-paused', String(paused));
    e.currentTarget.textContent = paused ? '播放背景' : '暂停背景';
    e.currentTarget.setAttribute('aria-label', paused ? '播放背景动画' : '暂停背景动画');
    e.currentTarget.setAttribute('aria-pressed', String(paused));
  });
  listen(document.querySelector("[data-browse]"),"click", () => { document.querySelector("#filter-query")?.focus({preventScroll:true}); document.querySelector("#discover")?.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"}); });
  document
    .querySelectorAll("[data-vgallery]")
    .forEach(
      (b) =>
        (b.onclick = () =>
          gallery(b.dataset.vgallery, Number(b.dataset.index), true)),
    );
  document
    .querySelectorAll("[data-gallery]")
    .forEach(
      (b) =>
        (b.onclick = () => gallery(b.dataset.gallery, Number(b.dataset.index))),
    );
  document
    .querySelectorAll("[data-edit]")
    .forEach((b) => (b.onclick = () => editCandidate(b.dataset.edit)));
  document.querySelectorAll("[data-nav]").forEach(
    (b) =>
      (b.onclick = () => {
        page = b.dataset.nav;
        query = "";
        filter = "";
        location.hash = page;
        render();
      }),
  );
  document.querySelectorAll('[data-task-tab]').forEach(button => {
    const selectTab = id => {
      page = id;
      location.hash = id;
      render();
      document.getElementById('task-tab-' + id)?.focus();
    };
    button.onclick = () => selectTab(button.dataset.taskTab);
    button.onkeydown = event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      selectTab(event.key==='Home'?'jobs':event.key==='End'?'batches':button.dataset.taskTab==='jobs'?'batches':'jobs');
    };
  });
  document
    .querySelectorAll("[data-detail]")
    .forEach((b) => (b.onclick = () => detail(b.dataset.detail)));
  document
    .querySelectorAll("[data-job]")
    .forEach((b) => (b.onclick = () => jobDetail(b.dataset.job)));
  document
    .querySelectorAll("[data-play]")
    .forEach((b) => (b.onclick = () => play(b.dataset.play)));
  document
    .querySelectorAll("[data-review]")
    .forEach((b) => (b.onclick = () => review(b.dataset.review)));
  document.querySelectorAll("[data-select]").forEach(
    (b) =>
      (b.onclick = () => {
        selected.has(b.dataset.select)
          ? selected.delete(b.dataset.select)
          : selected.add(b.dataset.select);
        render();
      }),
  );
  document.querySelectorAll("[data-action]").forEach(
    (b) =>
      (b.onclick = () => {
        const a = b.dataset.action;
        if(a==='ai-pricing')return pricingDialog();
        if(a==='logout') {api('/api/auth/logout',{}).catch(()=>{}).finally(()=>{csrf='';load();});return;}
        if (a === "mode") {
          demo = !demo;
          localStorage.setItem("replica-demo", demo);
          selected.clear();
          load();
        } else if (a === "refresh") load();
        else if (readOnly) toast(READ_ONLY_HINT);
        else formDialog(a);
      }),
  );
  document.querySelectorAll("[data-batch]").forEach(
    (b) =>
      (b.onclick = () =>
        mutate(`/api/batches/${b.dataset.batch}/${b.dataset.op}`, {automatic:true}, () => {
          const t = state.batches.find((t) => t.id === b.dataset.batch);
          t.status = b.dataset.op === "stop" ? "stopped" : b.dataset.op === "pause" ? "paused" : "running";
          if (b.dataset.op === "start") {
            state.jobs ??= [];
            t.candidate_ids.forEach((id, i) => {
              if (
                !state.jobs.some(
                  (j) => j.batch_id === t.id && j.candidate_id === id,
                )
              )
                state.jobs.unshift({
                  id: "demo-job-" + Date.now() + "-" + i,
                  candidate_id: id,
                  batch_id: t.id,
                  stage: "rea",
                  status: "queued",
                  route: null,
                  progress: 0,
                  attempt: 0,
                  created_at: new Date().toISOString(),
                });
            });
          }
        })),
  );
  if($("#toggle-completed"))$("#toggle-completed").onclick=()=>{showCompletedTasks=!showCompletedTasks;render();};
  document.querySelectorAll("[data-retry]").forEach(
    (b) =>
      (b.onclick = () =>
        mutate(`/api/jobs/${b.dataset.retry}/retry`, {}, () => {
          const j = state.jobs.find((j) => j.id === b.dataset.retry);
          j.status = "queued";
          j.progress = 0;
        })),
  );
  document.querySelectorAll("[data-tool]").forEach(
    (b) =>
      (b.onclick = () =>
        mutate(`/api/tools/${b.dataset.tool}/toggle`, {}, () => {
          const t = state.tools.find((t) => t.id === b.dataset.tool);
          t.enabled = !t.enabled;
        })),
  );
  document.querySelectorAll("[data-source]").forEach(
    (b) =>
      (b.onclick = () =>
        mutate(`/api/sources/${b.dataset.source}/toggle`, {}, () => {
          const t = state.sources.find((t) => t.id === b.dataset.source);
          t.enabled = !t.enabled;
        })),
  );
  document
    .querySelectorAll("[data-unpublish]")
    .forEach(
      (b) =>
        (b.onclick = () =>
          mutate(
            `/api/versions/${b.dataset.unpublish}/unpublish`,
            {},
            () =>
              (state.versions.find((v) => v.id === b.dataset.unpublish).status =
                "approved"),
          )),
    );
  if ($("#filter-query"))
    $("#filter-query").oninput = (e) => {
      query = e.target.value;
      const pos = e.target.selectionStart;
      $("#page").innerHTML = page === "library" ? library() : candidates();
      bind();
      $("#filter-query").focus();
      $("#filter-query").setSelectionRange(pos, pos);
    };
  if ($("#filter-category"))
    $("#filter-category").onchange = (e) => {
      filter = e.target.value;
      render();
    };
  document.querySelectorAll('[data-library-category]').forEach(b=>b.onclick=()=>{
    filter=b.dataset.libraryCategory;
    libraryEngine='';
    render();
    document.querySelector('#discover')?.scrollIntoView({block:'start'});
  });
  listen(document.querySelector('[data-library-reset]'),'click',()=>{
    query='';filter='';libraryEngine='';render();
    document.querySelector('#discover')?.scrollIntoView({block:'start'});
  });
  document.querySelectorAll('[data-library-engine]').forEach(b=>b.onclick=()=>{libraryEngine=b.dataset.libraryEngine;render();document.querySelector('#discover')?.scrollIntoView({block:'start'});});
  if ($("#global-search"))
    $("#global-search").onkeydown = (e) => {
      if (e.key === "Enter") {
        query = e.target.value;
        page = "candidates";
        render();
      }
    };
  if ($("#settings-form"))
    $("#settings-form").onsubmit = (e) => {
      e.preventDefault();
      const body = Object.fromEntries(
        [...new FormData(e.target)].map(([k, v]) => [k, Number(v)]),
      );
      mutate("/api/settings", body, () => Object.assign(state.settings, body));
    };
}
window.addEventListener("hashchange", () => {
  const n = location.hash.slice(1);
  if (n !== page) {
    page = n;
    render();
  }
});
load();

function trendChart(rows) {
  if (demo)
    rows = [3, 5, 4, 8, 6, 9, 12].map((n, i) => ({
      date: "10/" + (7 + i),
      submitted: n,
      imported: Math.floor(n / 3),
    }));
  if (!rows?.length) return empty("暂无趋势数据", "正式运行后展示每日真实产出");
  const max = Math.max(1, ...rows.flatMap((r) => [r.submitted ?? 0, r.imported]));
  return `<div class="chart">${rows.map((r) => `<div class="chart-col"><div class="bar" style="height:${((r.submitted ?? 0) / max) * 90}%" title="提交 ${r.submitted ?? 0} 款"></div><div class="bar second" style="height:${(r.imported / max) * 90}%" title="首次验收入库 ${r.imported} 款"></div><span class="chart-label">${esc(r.date.slice(-5))}</span></div>`).join("")}</div>`;
}
function renameGame(id) {
  const c=cBy(id);
  modal('重命名游戏',`<form id="rename-game"><label for="game-title">游戏名称</label><input id="game-title" name="title" value="${esc(c.title)}" maxlength="120" required><p class="tiny muted">同步更新游戏库、候选游戏、任务、批次内游戏和验收页的名称。游戏文件与历史代码快照保持不变。</p><div class="modalfooter"><button class="primary">保存名称</button></div></form>`);
  $('#rename-game').onsubmit=e=>{e.preventDefault();mutate(`/api/candidates/${id}/update`,{title:$('#game-title').value.trim()},()=>{c.title=$('#game-title').value.trim();});};
}
function editCandidate(id) {
  const c = cBy(id);
  modal(
    "编辑游戏资料",
    `<form id="edit-candidate"><label>游戏名称</label><input name="title" value="${esc(c.title)}" maxlength="120" required><label>游戏运行地址</label><input name="url" value="${esc(c.url)}" required><p class="tiny muted">未取得代码或版本的暂停任务可修正地址；保存不会自动重试。</p><label>分类</label><input name="category" value="${esc(c.category)}"><label>代码与素材使用条件</label><select name="rights">${[
      ["unknown", "待确认"],
      ["owned", "自有"],
      ["licensed", "已授权"],
      ["open", "开源许可已核对"],
    ]
      .map(
        ([v, t]) =>
          `<option value="${v}" ${c.rights === v ? "selected" : ""}>${t}</option>`,
      )
      .join(
        "",
      )}</select><label>本地源码目录（执行器可读取的位置）</label><input name="source_path" value="${esc(c.source_path)}"><label>玩法说明</label><textarea name="description">${esc(c.description)}</textarea><label>试玩观察记录</label><textarea name="observations">${esc(typeof c.observations === "object" ? JSON.stringify(c.observations, null, 2) : c.observations)}</textarea><div class="modalfooter"><button class="primary">保存资料</button></div></form>`,
  );
  $("#edit-candidate").onsubmit = (e) => {
    e.preventDefault();
    const b = Object.fromEntries(new FormData(e.target));
    const observations = b.observations.trim();
    if (observations.startsWith('{') || observations.startsWith('[')) {
      try {
        const parsed = JSON.parse(observations);
        if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') throw new Error();
        b.observations = parsed;
      } catch {
        $("#modal-error").textContent = "观察记录的 JSON 格式不正确，请填写 JSON 对象或普通文字。";
        return;
      }
    } else b.observations = observations;
    mutate(`/api/candidates/${id}/update`, b, () => Object.assign(c, b));
  };
}

function screenshotItems(c) {
  return [...new Set([
    c.cover,
    ...(Array.isArray(c.screenshots) ? c.screenshots : []).map((x) =>
      typeof x === "string" ? x : x.url || x.src,
    ),
  ]
    .filter(Boolean)
    .map(safeUrl)
    .filter((u) => u !== "#"))];
}
function gallery(id, index = 0, isVersion = false) {
  const c = isVersion
      ? (state.versions || []).find((v) => v.id === id)
      : cBy(id),
    images = screenshotItems(c);
  modal(
    c.title + " · 截图 " + (index + 1) + " / " + images.length,
    `<img style="width:100%;max-height:65vh;object-fit:contain" src="${esc(images[index])}" alt="游戏截图 ${index + 1}"><div class="modalfooter"><button id="gallery-prev" ${index === 0 ? "disabled" : ""}>← 上一张</button><button id="gallery-return">返回详情</button><button id="gallery-next" ${index === images.length - 1 ? "disabled" : ""}>下一张 →</button></div>`,
    true,
  );
  $("#gallery-prev").onclick = () => gallery(id, index - 1, isVersion);
  $("#gallery-next").onclick = () => gallery(id, index + 1, isVersion);
  $("#gallery-return").onclick = () => detail(isVersion ? c.candidate_id : id);
}

// Poll even with dialogs open. Preserve drafts and focus across status rendering.
let syncBusy = false, lastHealthSync = 0;
function preserveUI(root, update) {
  const key = e => e.id ? '#' + e.id : e.name ? e.tagName + ':' + e.name + ':' + (['checkbox','radio'].includes(e.type) ? e.value : '') : null;
  const active = document.activeElement, activeKey = root.contains(active) ? key(active) : null;
  const values = new Map([...root.querySelectorAll('input,textarea,select')].filter(e => key(e)).map(e => [key(e), {value:e.value,checked:e.checked,start:e.selectionStart,end:e.selectionEnd}]));
  const details = [...root.querySelectorAll('details')].map(e => e.open);
  const scroll = [...root.querySelectorAll('.modal,.modal-backdrop')].map(e => e.scrollTop);
  const x=window.scrollX,y=window.scrollY;
  if (update() === false) return;
  for (const e of root.querySelectorAll('input,textarea,select')) {
    const saved=values.get(key(e));
    if (!saved || e.disabled || e.readOnly) continue;
    if(e.value!==saved.value)e.value=saved.value;
    if(e.checked!==saved.checked)e.checked=saved.checked;
    if (key(e)===activeKey) {
      if(document.activeElement!==e)e.focus({preventScroll:true});
      if(saved.start!=null && (e.selectionStart!==saved.start || e.selectionEnd!==saved.end))e.setSelectionRange(saved.start,saved.end);
    }
  }
  root.querySelectorAll('details').forEach((e,i)=>{if(i<details.length)e.open=details[i];});
  root.querySelectorAll('.modal,.modal-backdrop').forEach((e,i)=>{e.scrollTop=scroll[i]||0;});
  window.scrollTo(x,y);
}
async function syncState() {
  if (demo || document.hidden || syncBusy || !csrf) return;
  syncBusy=true;
  const epoch=mutationEpoch;
  try {
    const next=presentPolicyPauses(await api('/api/state'));
    next.services=state.services;
    if (Date.now()-lastHealthSync>30000) {
      try { next.services=await api('/api/services'); lastHealthSync=Date.now(); } catch (_) {}
    }
    if (epoch!==mutationEpoch || demo) return;
    if (JSON.stringify(next)!==JSON.stringify(state)) {
      state=next;
      preserveUI($('#app'),()=>render(true));
      // Keep the active game's browsing context alive while background data changes.
      if (liveDialog && !$('#overlay').querySelector('iframe')) {
        backgroundDialog=true;
        try{preserveUI($('#overlay'),liveDialog);}finally{backgroundDialog=false;}
      }
    }
    if(page==='administration') await loadAdministration(true);
    const status=$('#sync-status'); if(status)status.textContent='自动同步中';
  } catch (_) {
    const status=$('#sync-status'); if(status)status.textContent='连接中断，正在重试';
  } finally { syncBusy=false; }
}
setInterval(syncState,3000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncState();});
window.addEventListener('online',syncState);
window.addEventListener('focus',syncState);

// Keep keyboard navigation inside the active dialog.
document.addEventListener('keydown', e => {
  const dialog = document.querySelector('.modal');
  if (!dialog) return;
  if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
  if (e.key !== 'Tab') return;
  const items = [...dialog.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex="0"]')].filter(el => el.getClientRects().length);
  const first = items[0], last = items.at(-1);
  if (!first) { e.preventDefault(); dialog.focus(); }
  else if (e.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
});
