// Shares route and title rules with controlplane/workflow_display.py.
const rules=await fetch(new URL('./workflow-display.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('流程显示规则加载失败');return r.json()});
export function presentWorkflow(state){
  for(const job of state.jobs||[]){
    const pipe=job.pipeline;if(!pipe?.nodes)continue;
    const route=job.conversion_plan?.route;
    const mode=job.continuation?'revision':['web-profile','discovered-web','embedded-lib','wxapkg-v1','provided-source','external'].includes(route)?'original':route==='ai'?'ai':'unknown';
    const plan=rules.plans[mode==='revision'?'revision':mode==='unknown'?'unknown':'initial'];
    const terminal=['review','completed','superseded','cancelled','stopped'].includes(job.status);
    for(const node of pipe.nodes){
      const title=rules.titles[mode]?.[node.key];
      if(title&&node.presentation){node.presentation.title=title[0];node.presentation.work=title[1];}
      if(mode==='unknown'&&node.key==='adapt'&&node.presentation){node.presentation.title='处理运行适配';node.presentation.work='按当前方案处理运行环境和未完成项，具体操作见本轮记录。';}
    }
    pipe.visible_nodes=pipe.nodes.filter(n=>(n.records||[]).some(r=>(r.round||1)===(job.round||1))||(['delivery','review','publish'].includes(n.key)&&['succeeded','waiting_input','draft_saved'].includes(n.status))||n.key===pipe.current||(!terminal&&plan.includes(n.key)));
    const p=pipe.presentation,active=pipe.nodes.find(n=>n.key===pipe.current);
    if(p){
      for(const key of Object.keys(p.counts||{}))p.counts[key]=pipe.visible_nodes.filter(n=>n.presentation?.group===key).length;
      if(active?.presentation){p.current_title=active.presentation.title;if(job.status==='running'){p.headline='正在'+p.current_title;p.location_label=p.current_title;job.progress_label=p.current_title+'中';}}
    }
  }
  return state;
}
