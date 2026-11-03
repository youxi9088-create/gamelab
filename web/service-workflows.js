const stages={queued:'下游排队',received:'下游接收',analyzing:'分析',awaiting_platform_review:'自动核验',building:'模板制作',template_ready:'模板就绪',certifying:'上架验证'};
export function supplyOverview(state){
 const rows=state.supply||[],counts={pending:0,processing:0,retrying:0,published:0,supplier:0,platform:0,other:0};
 const problems=new Map();let latest='';
 for(const row of rows){
  if(row.updated_at&&row.updated_at>latest)latest=row.updated_at;
  let group='other';
  if(row.state==='published'&&!row.error_code)group='published';
  else if(row.next_action==='platform'&&(row.state==='failed'||row.status==='blocked'))group='platform';
  else if(row.status==='blocked'||row.state==='needs_your_fix'||row.next_action==='supplier')group='supplier';
  else if(row.status==='retrying')group='retrying';
  else if(row.submitted&&stages[row.state])group='processing';
  else if(!row.submitted&&['pending','retrying'].includes(row.status))group='pending';
  counts[group]++;
  if(['supplier','platform','retrying'].includes(group)){
   const code=row.error_code||row.state||'未分类';const key=group+':'+code;
   const item=problems.get(key)||{owner:group,code,count:0,notice:row.recovery?.action||row.notice||''};item.count++;problems.set(key,item);
  }
 }
 return {counts,total:rows.length,submitted:rows.filter(r=>r.submitted).length,latest,problems:[...problems.values()].sort((a,b)=>b.count-a.count)};
}
function flow(labels,esc){return `<ol class="service-flow" aria-label="处理流程">${labels.map((label,i)=>`<li><span>${i+1}</span>${esc(label)}</li>`).join('')}</ol>`;}
export function converterWorkflow(service,state,{esc}){
 const jobs=state.jobs||[];const current=jobs.filter(j=>j.status!=='superseded');
 const running=current.filter(j=>j.status==='running'),queued=current.filter(j=>j.status==='queued'&&!j.manual_paused),review=current.filter(j=>j.status==='review');
 return flow(['入口识别','抓取资源','适配／重建','离线与玩法验证','待人工验收'],esc)+
 `<div class="service-counts"><span>执行中 <b>${running.length}</b></span><span>排队 <b>${queued.length}</b></span><span>待验收 <b>${review.length}</b></span></div><p class="tiny muted">失败和待完善在任务中心继续；待验收通过后才进入供货流程。</p><button data-nav="jobs">查看转换任务 ↗</button>`;
}
export function supplyWorkflow(state,{esc,date}){
 const summary=supplyOverview(state),c=summary.counts,s=state.supply_service||state.supply_config||{},check=s.check||{};
 const missing=s.missing||[],errors=s.errors||[];
 const connection=s.configured===undefined?'配置状态未提供':!s.configured?'配置未就绪':check.identity==='verified'?'上次身份验证通过':check.identity==='failed'?'上次连接检查失败':'配置齐全，尚待连接检测';
 const mode=s.delivery_mode==='cs'?'CS 上传与回下载校验':s.delivery_mode==='static'?'静态目录分发':'分发模式待确认';
 return flow(['人工验收','供货副本检查','上传并校验','下游核验与制模','上架试跑'],esc)+
 `<p class="service-connection"><strong>${esc(connection)}</strong><span>${esc(mode)}</span></p>${missing.length||errors.length?`<div class="notice">待处理配置：${esc([...missing,...errors].join('、'))}</div>`:''}
 <div class="service-counts"><span>待发送 <b>${c.pending}</b></span><span>待重试 <b>${c.retrying}</b></span><span>下游处理中 <b>${c.processing}</b></span><span>已发布 <b>${c.published}</b></span><span>我方处理 <b>${c.supplier}</b></span><span>下游处理 <b>${c.platform}</b></span>${c.other?`<span>待核对 <b>${c.other}</b></span>`:''}</div>
 <p class="tiny muted">${summary.total} 条实际供货记录，${summary.submitted} 条已提交；不含看板中的 Git 历史数量。最近状态更新：${summary.latest?esc(date(summary.latest)):'暂无记录'}。</p>
 ${summary.problems.length?`<div class="service-problems">${summary.problems.slice(0,4).map(p=>`<div><strong>${esc(p.owner==='supplier'?'我方处理':p.owner==='retrying'?'待重试':'下游处理')} · ${esc(p.code)}（${p.count}）</strong><p>${esc(p.notice||'查看供货记录中的问题清单')}</p></div>`).join('')}</div>`:'<p class="tiny muted">当前记录未发现待处理阻断；处理中不代表已生成模板。</p>'}`;
}
