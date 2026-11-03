let page=1;
const pageSize=10;
let filters={query:'',engine:'',status:'',sort:'tokens'};
const time=n=>n==null?'—':n<60?`${n.toFixed(0)} 秒`:n<3600?`${(n/60).toFixed(1)} 分钟`:`${(n/3600).toFixed(2)} 小时`;
const number=n=>n==null?'—':Number(n).toLocaleString();
const percent=n=>n==null?'—':`${(n*100).toFixed(0)}%`;
const cost=(r,esc)=>Object.entries(r.costs||{}).map(([k,v])=>`${esc(k)} ${v.toFixed(4)}`).join(' / ')||'—';
const supplyNames={not_submitted:'未提交',pending:'待供货',blocked:'供货受阻',retrying:'重试中',published:'已发布',template_ready:'模板就绪',submitted:'已提交',processing:'处理中',failed:'供货失败',queued:'排队中',received:'已接收',analyzing:'分析中',awaiting_platform_review:'自动核验中',building:'制作模板中',certifying:'认证中',canceled:'已撤回',rejected:'未收录',needs_your_fix:'待修改',tracking:'跟踪中'};

// Compatibility while existing conversion workers finish before the server reloads.
export function weeklySupply(state, clock=new Date()) {
 const now=+new Date(clock), local=new Date(now+8*3600000);
 const week=Date.UTC(local.getUTCFullYear(),local.getUTCMonth(),local.getUTCDate())-((local.getUTCDay()+6)%7)*86400000-8*3600000;
 const visible=new Set((state.candidates||[]).filter(c=>!c.observations?.catalog_hidden).map(c=>c.id));
 const dates=new Map(),unknown=new Set();
 for(const s of state.supply||[]) {
  if(!visible.has(s.candidate_id)||!s.submitted||!s.submission_id)continue;
  const stamp=v=>v?Date.parse(/(?:Z|[+-]\d\d:\d\d)$/.test(v)?v:v+'Z'):NaN;
  const accepted=stamp(s.accepted_at),t=Number.isFinite(accepted)?accepted:stamp(s.submitted_at);
  if(Number.isFinite(t))dates.set(s.submission_id,Math.min(t,dates.get(s.submission_id)??t));else unknown.add(s.submission_id);
 }
 return {count:[...dates.values()].filter(t=>t>=week&&t<=now).length,undated:[...unknown].filter(id=>!dates.has(id)).length};
}

export function dashboardPulse(state,{esc,date}) {
 const d=state.dashboard_operations;if(!d)return '';
 const k=d.kpis||{};
 const cards=[['模版生成新游戏数量',number(k.template_generated_games),k.template_generated_games==null?'下游尚未提供此统计，未接入':'累计由下游模版生成的新游戏'],['执行耗时中位数',time(k.median_seconds),`${k.timing_games??0} 款有执行耗时记录的已转换游戏`],['平均token消耗',k.average_tokens==null?'—':number(Math.round(k.average_tokens)),`Token / 游戏 · ${k.usage_cost_games??k.token_games??0} 款同批Token样本`],['平均费用CNY',k.average_cost_cny==null?'—':`¥${k.average_cost_cny.toFixed(4)}`,`CNY / 游戏 · ${k.usage_cost_games??k.cost_games??0} 款同批Token样本`]];
 return `<section class="dashboard-pulse" aria-label="下游产出与转换效率">${cards.map(([name,value,note])=>`<article><span>${name}</span><strong>${value}</strong><small>${note}</small></article>`).join('')}</section><p class="tiny muted">同步于 ${esc(date(d.updated_at))} · 平均Token与费用使用同一批完整Token游戏，累计全部轮次、失败与重试。耗时不含排队和人工验收等待。费用为估算，缓存明细缺失按保守上限计算，可能偏高并与实际账单存在偏差。</p>`;
}

export function dashboardGames(state,{esc,badge}) {
 const d=state.dashboard_operations;if(!d)return '<section class="panel">正在获取游戏明细…</section>';
 let rows=d.games.filter(r=>(!filters.query||r.title.toLowerCase().includes(filters.query.toLowerCase()))&&(!filters.engine||r.engine===filters.engine)&&(!filters.status||r.status===filters.status));
 rows.sort((a,b)=>filters.sort==='duration'?(b.duration_seconds??-1)-(a.duration_seconds??-1):filters.sort==='name'?a.title.localeCompare(b.title,'zh-CN'):(b.known_token_fields?b.input_tokens+b.output_tokens:-1)-(a.known_token_fields?a.input_tokens+a.output_tokens:-1));
 const pages=Math.max(1,Math.ceil(rows.length/pageSize));
 page=Math.min(page,pages);
 const pageRows=rows.slice((page-1)*pageSize,page*pageSize);
 const options=(values,selected)=>[...new Set(values)].sort().map(v=>`<option value="${esc(v)}" ${v===selected?'selected':''}>${esc(v)}</option>`).join('');
 return `<section class="panel dashboard-games"><div class="panelhead"><div><h2>单个游戏转换用量</h2><p class="tiny muted">累计全部已记录轮次 · 含失败与重试 · ${rows.length} / ${d.games.length} 款</p><p class="tiny muted">费用为估算，缓存明细缺失按保守上限计算，可能偏高并与实际账单存在偏差。</p></div></div><div class="dashboard-filters"><input id="dashboard-query" aria-label="搜索转换游戏" placeholder="搜索游戏…" value="${esc(filters.query)}"><select id="dashboard-engine" aria-label="按引擎筛选"><option value="">全部引擎</option>${options(d.games.map(r=>r.engine),filters.engine)}</select><select id="dashboard-status" aria-label="按任务状态筛选"><option value="">全部任务状态</option>${[...new Set(d.games.map(r=>r.status))].map(v=>`<option value="${esc(v)}" ${v===filters.status?'selected':''}>${esc(({completed:'已完成',review:'待验收',waiting_input:'待回复',queued:'排队中',running:'执行中',failed:'失败',blocked:'受阻',candidate:'候选'})[v]||v)}</option>`).join('')}</select><select id="dashboard-sort" aria-label="明细排序">${[['tokens','Token从高到低'],['duration','耗时从长到短'],['name','游戏名称']].map(([v,n])=>`<option value="${v}" ${v===filters.sort?'selected':''}>${n}</option>`).join('')}</select><button id="dashboard-reset">重置筛选</button></div><div class="table-wrap"><table class="table"><thead><tr><th>游戏</th><th>原引擎</th><th>当前进度</th><th>执行耗时</th><th>Token消耗</th><th title="平台AI请求数量，包含成功、失败和重试；不是转换轮次">AI请求次数</th><th>估算费用</th><th>交付状态</th><th>操作</th></tr></thead><tbody>${pageRows.map(r=>`<tr><td><button class="textbtn" data-detail="${esc(r.candidate_id)}">${esc(r.title)}</button></td><td>${esc(r.engine)}</td><td>${badge(r.display_status||r.status)}<small>${esc(({adapt:'适配',analysis:'分析',acquire:'采集',test:'验证',delivery:'交付',review:'验收',reconstruct:'转换',rea:'资源分析'})[r.stage]||r.stage||'未记录')}</small></td><td title="累计已记录执行时间，不含排队和人工等待">${time(r.duration_seconds)}</td><td>${r.known_token_fields?number(r.input_tokens+r.output_tokens):'—'}<small>输入 ${r.input_known_calls?number(r.input_tokens):'—'} / 输出 ${r.output_known_calls?number(r.output_tokens):'—'}</small></td><td title="累计AI请求，含失败和重试">${r.calls?number(r.calls)+' 次':'—'}</td><td>${cost(r,esc)}</td><td>${r.accepted?'已验收入库':'尚未入库'}${r.supply_status!=='not_submitted'?`<small>${esc(supplyNames[r.supply_status]||r.supply_status)}</small>`:''}</td><td>${r.job_id?`<button class="smallbtn" data-job="${esc(r.job_id)}">查看任务</button>`:'历史导入'}</td></tr>`).join('')||'<tr><td colspan="9">没有匹配的游戏，可重置筛选。</td></tr>'}</tbody></table></div><nav class="dashboard-pagination" aria-label="转换用量分页"><span aria-live="polite">共 ${rows.length} 款 · 第 ${page} / ${pages} 页 · 每页 ${pageSize} 条</span><button id="dashboard-prev" ${page===1?'disabled':''}>上一页</button><button id="dashboard-next" ${page===pages?'disabled':''}>下一页</button></nav><details><summary>统计说明与记录详情</summary><p class="tiny muted">执行耗时累计已记录区间并去重，排除排队和人工等待；不完整的历史时段不推算。Token为输入+输出，缓存属于输入子集。AI请求次数指模型请求，含成功、失败和重试，不是转换轮次。费用按币种分开统计；“—”表示没有可靠记录。供货与验收分开判断。</p>${pageRows.filter(r=>r.calls&&r.cache_known_calls).map(r=>`<p class="tiny muted">${esc(r.title)}：${r.cache_known_calls?`缓存读取 ${number(r.cached_input_tokens)} / 写入 ${number(r.cache_write_tokens)}`:`已知缓存读取 ${number(r.cached_input_tokens||0)}；写入明细未完整记录`}。</p>`).join('')}</details></section>`;
}

const detailPages={engines:1,models:1};
function detailSlice(rows,key,size) {
 const pages=Math.max(1,Math.ceil(rows.length/size));
 detailPages[key]=Math.max(1,Math.min(detailPages[key],pages));
 return {rows:rows.slice((detailPages[key]-1)*size,detailPages[key]*size),pages,size,total:rows.length,page:detailPages[key]};
}
function detailPager(view,key,label) {
 if(view.total<=view.size)return '';
 return `<nav class="dashboard-pagination detail-pagination" aria-label="${label}分页"><span aria-live="polite">共 ${view.total} 条 · ${view.page} / ${view.pages} 页</span><button data-detail-page="${key}" data-step="-1" ${view.page===1?'disabled':''}>上一页</button><button data-detail-page="${key}" data-step="1" ${view.page===view.pages?'disabled':''}>下一页</button></nav>`;
}
export function dashboardDiagnostics(state,{esc}) {
 const d=state.dashboard_operations;if(!d)return '';
 const heading=(title,total,note)=>`<div class="diagnostic-heading"><h2>${title}</h2><span class="diagnostic-count">${total} 条</span></div><p class="tiny muted">${note}</p>`;
 const breakdown=(rows,engine,key)=>{
  const view=detailSlice(rows,key,8);
  return `<section class="panel diagnostic-analysis" id="diagnostic-${key}">${heading(engine?'按引擎分析':'按模型分析',rows.length,engine?'各引擎的游戏入库与调用情况':'各提供方与模型的累计调用情况')}<div class="table-wrap"><table class="table"><thead><tr><th>${engine?'引擎':'提供方 / 模型'}</th>${engine?'<th>游戏 / 入库</th>':''}<th>调用次数</th><th>已知Token</th></tr></thead><tbody>${view.rows.map(r=>`<tr><td>${esc(r.name)}</td>${engine?`<td>${r.games} / ${r.accepted}</td>`:''}<td>${number(r.calls)}</td><td>${r.known_fields?number(r.tokens):'—'}</td></tr>`).join('')||`<tr><td colspan="${engine?4:3}">尚无记录</td></tr>`}</tbody></table></div>${detailPager(view,key,engine?'引擎分析':'模型分析')}</section>`;
 };
 return `<div class="overview-details">
 ${breakdown(d.engines,true,'engines')}${breakdown(d.models,false,'models')}</div>`;
}

export function bindDashboard(render) {
 document.querySelectorAll('[data-detail-page]').forEach(button=>{
  button.onclick=()=>{const key=button.dataset.detailPage;detailPages[key]+=Number(button.dataset.step);render();document.getElementById('diagnostic-'+key)?.scrollIntoView({block:'start'});};
 });
 for(const [id,step] of [['dashboard-prev',-1],['dashboard-next',1]]) {
  const el=document.getElementById(id);if(el)el.onclick=()=>{page=Math.max(1,page+step);render();document.querySelector('.dashboard-games')?.scrollIntoView({block:'start'});};
 }
 for(const [id,key] of [['dashboard-query','query'],['dashboard-engine','engine'],['dashboard-status','status'],['dashboard-sort','sort']]) {
  const el=document.getElementById(id);if(el)el.onchange=()=>{filters[key]=el.value;page=1;render();};
 }
 const reset=document.getElementById('dashboard-reset');if(reset)reset.onclick=()=>{page=1;filters={query:'',engine:'',status:'',sort:'tokens'};render();};
}
