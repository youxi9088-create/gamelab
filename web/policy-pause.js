// Shared declarative read-model rules also consumed by the Python service.
// Supports an already running older backend without interrupting conversion.
const rules=await fetch(new URL('./policy-pause.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('暂停状态规则加载失败');return r.json()});
export function presentPolicyPauses(state) {
  const jobs=new Map();
  for(const job of state.jobs||[]) {
    if(!job.web_only||job.status!=='waiting_input')continue;
    const reason=job.reason||job.question||'';
    if(!rules.prefixes.some(p=>reason.startsWith(p)))continue;
    const rule=rules.rules.find(r=>!r.match.length||r.match.some(text=>reason.includes(text)));
    const {match,...pause}=rule;
    job.policy_pause=pause;
    job.display_status=pause.status;
    job.progress_label=pause.explanation;
    if(job.pipeline?.presentation)Object.assign(job.pipeline.presentation,{
      headline:pause.label,location_label:'游戏类型检测 · 已暂停',problem:pause.explanation,next_action:pause.next_action
    });
    jobs.set(job.id,job);
  }
  for(const row of state.dashboard_operations?.games||[]) {
    const job=jobs.get(row.job_id);
    if(job)row.display_status=job.display_status;
  }
  return state;
}
