"""Versioned, reviewed Web adapters exposed to task-center operators."""
import json
from pathlib import Path
from urllib.parse import urlsplit

DIRECTORY=Path(__file__).resolve().parents[1]/'executors/web-profiles'


def profiles():
    return [json.loads(p.read_text('utf-8')) for p in sorted(DIRECTORY.glob('*.json'))]


def public_profiles():
    return [{k:p[k] for k in ('id','name','description')} for p in profiles()]


def supports(url,profile):
    actual=urlsplit(url)
    expected=profile.get('source_match',{})
    return bool(expected and actual.scheme in ('http','https') and
        actual.netloc==expected.get('host') and actual.path.rstrip('/')==expected.get('path','').rstrip('/'))


def configure(service,db,job,profile_id):
    from .service import require
    require(job['status'] in ('blocked','failed','waiting_input'),'只有待处理任务可以设置恢复方案',409)
    require(not any(v['candidate_id']==job['candidate_id'] for v in service.store.all(db,'versions')),'已有版本请沿版本续作，不能覆盖原恢复配置',409)
    selected=next((p for p in profiles() if p['id']==profile_id),None)
    require(profile_id=='auto' or selected is not None,'请选择已登记的 Web 恢复方案')
    c=service.get(db,'candidates',job['candidate_id'])
    observations=c.get('observations',{})
    require(isinstance(observations,dict),'请先修正观察材料格式')
    if profile_id=='auto':
        observations=dict(observations)
        observations.pop('web_runtime',None);observations.pop('web_profile_id',None)
        c['observations']=observations
    else:
        require(supports(c['url'],selected['profile']),'恢复方案与当前来源不匹配，请选择自动识别来源',409)
        c['observations']={**observations,'web_runtime':selected['profile'],'web_profile_id':selected['id']}
    service.store.put(db,'candidates',c)
    job.pop('dependency_pending',None)
    return service.continue_job(db,job,'平台重新识别网页来源与实际游戏入口，保留采集证据并按来源分流。' if profile_id=='auto' else '使用平台 Web 恢复方案：'+selected['name']+'。采集原资源、核对源文件、执行适配与离线玩法验证，保存版本待验收。')
