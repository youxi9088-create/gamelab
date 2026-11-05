export const supplyView={filter:'attention',query:'',page:1};
const groups=[['attention','待我方处理'],['processing','处理中'],['published','已发布'],['all','全部记录']];
export function supplyGroup(r){
 if(r.state==='published')return 'published';
 if(r.next_action==='supplier'||['blocked','failed'].includes(r.status)||['needs_your_fix','failed','rejected'].includes(r.state))return 'attention';
 return 'processing';
}
export function supplyList(state,{esc,date,cBy,readOnly}){
 const all=state.supply||[],counts=Object.fromEntries(groups.map(([k])=>[k,k==='all'?all.length:all.filter(r=>supplyGroup(r)===k).length]));
 const query=supplyView.query.trim().toLowerCase();
 const filtered=all.filter(r=>(supplyView.filter==='all'||supplyGroup(r)===supplyView.filter)&&(!query||[cBy(r.candidate_id).title,r.version_id,r.submission_id,r.error_code,r.notice].some(v=>String(v||'').toLowerCase().includes(query))));
 const pages=Math.max(1,Math.ceil(filtered.length/10));supplyView.page=Math.min(pages,supplyView.page);
 const labels={pending:'待自动推送',blocked:'供货受阻',retrying:'等待重试',tracking:'下游处理中',done:'处理结束',failed:'处理失败'};
 const cards=filtered.slice((supplyView.page-1)*10,supplyView.page*10).map(r=>{
  const group=supplyGroup(r),version=(state.versions||[]).find(v=>v.id===(r.version_id||r.id)),accepted=['approved','published'].includes(version?.status);
  const job=(state.jobs||[]).find(j=>j.candidate_id===r.candidate_id);
  const states={published:'已发布',needs_your_fix:'需修订',failed:'处理失败',rejected:'已拒绝',canceled:'已取消',queued:'下游排队',received:'下游已接收',analyzing:'分析中',building:'制模中',certifying:'核验中',template_ready:'模板已生成',awaiting_platform_review:'待下游审核'};
  const status=states[r.state]||labels[r.status]||r.state_text||'状态待确认';
  const next=({supplier:'需要我方修复或补充资料',platform:'等待下游处理',none:'无需人工操作'})[r.next_action]||(group==='published'?'供货已发布':group==='attention'?'查看问题并处理':'等待处理结果');
  return `<article class="supply-record"><div class="supply-record-head"><h3>${esc(cBy(r.candidate_id).title||'未命名游戏')}</h3><span class="badge ${group==='attention'?'yellow':group==='published'?'green':''}">${esc(status)}</span></div><p class="supply-next">${esc(next)}${r.queue_position?` · 排队第 ${esc(r.queue_position)} 位`:''}</p><p class="supply-reason">${esc(r.notice||'暂无补充说明')}</p><div class="supply-record-meta"><span>${accepted?'功能已验收':version?.status==='review'?'功能待验收':'版本状态见详情'}</span><span>版本 ${esc(r.version_id||r.id||'—')}</span>${r.updated_at?`<span>更新于 ${esc(date(r.updated_at))}</span>`:''}</div>${job?`<div class="actions" style="margin-top:12px"><button class="smallbtn" data-job="${esc(job.id)}">查看转换任务</button></div>`:''}<details class="supply-record-details"><summary>查看问题与提交详情${r.issues?.length?`（${r.issues.length}项）`:''}</summary><div><p>提交编号：${esc(r.submission_id||'尚未提交')}</p>${r.error_code?`<p>错误码：${esc(r.error_code)}</p>`:''}<p>${esc(r.notice||'暂无详细说明')}</p>${(r.issues||[]).map(i=>`<div class="notice"><strong>${esc(i.title||i.code||'待核查问题')}</strong>${i.detail?`<p>${esc(i.detail)}</p>`:''}${i.suggestion?`<p>${esc(i.suggestion)}</p>`:''}${i.files?.length?`<p class="tiny">涉及文件：${esc(i.files.join('、'))}</p>`:''}</div>`).join('')}${!readOnly&&['pending','blocked','retrying'].includes(r.status)?`<div class="actions">${!r.archive_sha256?`<button data-supply-metadata="${esc(r.id)}">补充供货资料</button>`:''}<button data-supply-retry="${esc(r.id)}">重新检查 / 重试</button></div>`:''}</div></details></article>`;
 }).join('');
 return `<div class="supply-filters" role="group" aria-label="按供货状态筛选">${groups.map(([key,title])=>`<button data-supply-filter="${key}" aria-pressed="${supplyView.filter===key}"><span>${title}</span><strong>${counts[key]}</strong></button>`).join('')}</div><div class="supply-search"><label for="supply-query">查找供货记录</label><input type="search" id="supply-query" name="supply-query" autocomplete="off" value="${esc(supplyView.query)}" placeholder="搜索游戏、版本、提交编号或问题…"><span class="tiny muted">${filtered.length} 条结果 · 每页 10 条</span></div><div class="supply-records">${cards||'<div class="supply-empty">当前筛选下没有供货记录。可切换状态或清空搜索。</div>'}</div><div class="supply-pagination"><button data-supply-page="${supplyView.page-1}" ${supplyView.page<=1?'disabled':''}>上一页</button><span>第 ${supplyView.page} / ${pages} 页</span><button data-supply-page="${supplyView.page+1}" ${supplyView.page>=pages?'disabled':''}>下一页</button></div>`;
}
export function bindSupplyList(root,refresh){
 root.querySelectorAll('[data-supply-filter]').forEach(b=>b.onclick=()=>{supplyView.filter=b.dataset.supplyFilter;supplyView.page=1;refresh();});
 root.querySelectorAll('[data-supply-page]').forEach(b=>b.onclick=()=>{supplyView.page=Number(b.dataset.supplyPage);refresh();});
 const input=root.querySelector('#supply-query');if(input)input.oninput=()=>{supplyView.query=input.value;supplyView.page=1;refresh();};
}
