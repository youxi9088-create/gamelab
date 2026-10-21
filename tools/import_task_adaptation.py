"""Trusted local resource-adaptation intake into an existing inactive task."""
import argparse
import json
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from controlplane.service import Service,require
from controlplane.store import ident,now
from controlplane.presentation import preview_settings
from tools.import_local_review import snapshot

def intake_task(service,job_id,source,report,save_draft=False):
    require(report.get('runtime_verified') is True,'Runtime verification required')
    preview=preview_settings(report)
    from controlplane.delivery_requirements import delivery_gaps
    gaps=delivery_gaps(report,[p.relative_to(source).as_posix() for p in Path(source).rglob('*') if p.is_file()])
    require(not gaps or save_draft,'基础还原未完成；'+'；'.join(gaps))
    with service.store.tx() as db:
        s=service.store;j=service.get(db,'jobs',job_id)
        require(j['status'] in ('waiting_input','blocked','failed','completed') or (save_draft and j['status']=='review'),'Task must be inactive and awaiting work',409)
        require(not any(x['candidate_id']==j['candidate_id'] and x['id']!=j['id'] and x['status'] in ('running','queued','review','waiting_input') for x in s.all(db,'jobs')),'Another active task exists',409)
        c=service.get(db,'candidates',j['candidate_id'])
        next_round=j.get('round',1)+(1 if j['status']=='completed' else 0)
        if c.get('game_spec'):
            report={**report,'game_spec':c['game_spec']}
            gaps=delivery_gaps(report,[p.relative_to(source).as_posix() for p in Path(source).rglob('*') if p.is_file()])
            require(not gaps or save_draft,'基础还原未完成；'+'；'.join(gaps))
        aid,vid=ident('artifact'),ident('v');info=snapshot(service.repo,aid,source,'index.html')
        require(any(p.startswith('screenshots/') for p in info['files']),'Runtime screenshot required')
        artifact=dict(id=aid,job_id=j['id'],runtime_local=True,created_at=now(),report=report,**info)
        version=dict(id=vid,candidate_id=c['id'],job_id=j['id'],artifact_id=aid,title=c['title'],status='draft' if gaps else 'review',entry=info['entry'],report=report,created_at=now(),route='local',round=next_round,base_version_id=j.get('version_id'),preview_mode='external')
        version.update(service.repo.record(c,version,artifact))
        version.update(preview_url=service.play_url+'/runtime/'+aid+'/index.html',screenshots=[service.play_url+'/play/'+aid+'/'+p for p in info['files'] if p.startswith('screenshots/') and p.endswith('.png')],preview=preview)
        version['cover']=version['screenshots'][0]
        for old in s.all(db,'versions'):
            if old['candidate_id']==c['id'] and old['status'] in ('review','rejected'):
                old.update(status='superseded',superseded_by=vid);s.put(db,'versions',old)
        s.put(db,'rounds',dict(j,id=ident('round'),original_job_id=j['id']))
        s.put(db,'artifacts',artifact);s.put(db,'versions',version)
        reason=report.get('summary','原资源适配及浏览器验证完成，请试玩验收')
        if gaps:reason+='。基础还原待补齐：'+'；'.join(gaps)
        j.update(status='blocked' if gaps else 'review',stage='packaging',route='local',progress=90 if gaps else 100,base_version_id=version.get('base_version_id'),version_id=vid,round=next_round,completed_at=now(),reason=reason,report=report)
        for key in ('question','lease_token','lease_expires_at'):j.pop(key,None)
        s.put(db,'jobs',j);c['status']='blocked' if gaps else 'review';s.put(db,'candidates',c)
        service.message(db,j,'assistant',reason);s.event(db,reason,j['id'],'packaging',version_id=vid)
        service.update_batch(db,j['batch_id'])
        return version

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--job',required=True);p.add_argument('--source',required=True);p.add_argument('--report',required=True);p.add_argument('--save-draft',action='store_true');a=p.parse_args()
    root=Path(__file__).resolve().parents[1]
    result=intake_task(Service(root/'data',root/'game-library','http://127.0.0.1:8766'),a.job,a.source,json.loads(Path(a.report).read_text('utf-8')),save_draft=a.save_draft)
    print(json.dumps({'version_id':result['id'],'preview_url':result['preview_url'],'status':result['status']}))
