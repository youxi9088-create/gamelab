"""Bounded public link acquisition; source evidence is never treated as instructions."""
import hashlib
import json
import os
import re
import shutil
import subprocess
from pathlib import Path

def retained_web_source(url,observations,directory,runs_root):
    """Retry from this candidate's hash-verified capture, never another game's cache."""
    prior=observations or {};evidence=prior.get('evidence') or {}
    if evidence.get('source_url')!=url or not prior.get('web_source'):return None
    source=(Path(evidence.get('directory',''))/'source.html')
    root=Path(runs_root).resolve()
    if source.is_symlink() or not source.resolve().is_relative_to(root) or not source.is_file():return None
    data=source.read_bytes()
    if len(data)>2_000_000 or hashlib.sha256(data).hexdigest()!=evidence.get('html_sha256'):return None
    directory.mkdir(parents=True,exist_ok=True);(directory/'source.html').write_bytes(data)
    return {'url':url,'title':prior.get('title',''),'metadata':prior.get('metadata',{}),'appids':[],
            'retained_capture':{'source_sha256':evidence['html_sha256'],'reason':'本轮网络采集失败，复用同一来源已验证快照；不代表原站最新版本'}}


def acquire(url, run, budget, observations=None, web_only=False):
    from worker import Blocked, NeedsInput, PolicyPause
    from controlplane.runtime import node_binary
    directory = run / 'acquisition'
    if web_only and url.startswith('#小程序://'):
        raise PolicyPause('本批仅转换 Web：该链接为微信小游戏，已暂停；请在原任务确认是否调整范围。')
    node = node_binary()
    if not node:
        raise Blocked('采集缺少 Node 运行时，请配置 NODE_BINARY')
    command = [node]
    share = url.startswith('#小程序://')
    if share:
        title = url[len('#小程序://'):].split('/')[0]
        prior = observations if isinstance(observations, dict) else {}
        appid = prior.get('appid', '')
        # Only reuse an identity recorded on this candidate, never guess by cache recency.
        if not isinstance(appid, str) or not re.fullmatch(r'wx[0-9a-fA-F]{16}', appid):
            raise NeedsInput(f'请在本机 PC 微信打开“{title}”并进入游戏场景。尚未确认此分享链接对应的 AppID，不能使用其他游戏资源。')
        directory.mkdir(parents=True)
        observation = {'title': title, 'metadata': {}, 'appids': [appid],
                       'appid': appid, 'identity_source': 'candidate-observations'}
    else:
        # The installed REA launcher and acquisition browser share the same Node runtime.
        # 90 秒对中文游戏站根本不够：4k99 详情页首字节就要 6–9 秒，页面还挂
        # 一堆广告脚本。放宽到 240 秒，并把同一份预算交给 acquire.cjs 内部
        # 自己分配——它会在 deadline 前收尾并写出已收集到的观测。
        acquire_timeout = budget.remaining(240)
        child_env = {**os.environ, 'GAMELAB_ACQUIRE_TIMEOUT_MS': str(int(acquire_timeout * 1000))}
        try:
            result = subprocess.run(command+[str(Path(__file__).with_name('acquire.cjs')),url,str(directory)],
                capture_output=True,timeout=acquire_timeout,shell=False,env=child_env)
        except subprocess.TimeoutExpired:
            detail=(directory/'observation.json')
            if web_only:
                raise PolicyPause('Web 类型检测超时（采集预算 {} 秒），未确认游戏类型，已暂停；现场保留，请核对入口后继续。'.format(int(acquire_timeout))) from None
            raise
        if result.returncode:
            detail=result.stderr.decode('utf-8',errors='replace')[-2000:]
            (run/'acquisition-error.txt').write_text(detail,'utf-8')
            observation=retained_web_source(url,observations,directory,Path(os.environ.get('REPLICA_RUNS_ROOT',Path(__file__).parent/'runs')).resolve())
            if observation is None:
                if web_only:raise PolicyPause('Web 类型检测无法访问页面，已暂停；'+detail[-700:])
                raise Blocked('无法采集游戏链接：'+detail[-700:])
            # 复用旧快照时也必须留下失败标记，否则下游会把"采集失败"
            # 当成本轮观测结果，继续说成"没有入口"。
            observation['acquisition_error']=' '.join(detail.split())[-300:] or '采集进程非零退出'
        else:observation = json.loads((directory/'observation.json').read_text('utf-8'))
    from controlplane.source_routing import source_kind
    observation['source_kind']=source_kind(url,observation)
    if observation['source_kind']=='web' and (directory/'source.html').is_file():
        from web_embedded import extract
        embedded=extract((directory/'source.html').read_text('utf-8'),directory/'web-source')
        if embedded:observation['web_source']=embedded
    if web_only:
        from controlplane.web_only import assess
        html = (directory/'source.html').read_text('utf-8') if (directory/'source.html').is_file() else ''
        gate = assess(url, html, observation)
        observation['web_only_check'] = gate
        (directory/'web-only-check.json').write_text(json.dumps(gate, ensure_ascii=False, indent=2), 'utf-8')
        if not gate['allowed']:
            raise PolicyPause('本批仅转换 Web：'+gate['reason']+'。检测记录保留在本轮 acquisition/web-only-check.json。')
    analysis = directory/'analysis'
    analysis.mkdir(exist_ok=True)
    # Retain full downloaded evidence separately; bound static analysis and AI context.
    snippets=[]
    for source in sorted(directory.glob('*.js'))[:12]:
        body=source.read_text('utf-8',errors='replace')
        if len(body)<20000 and len(list(analysis.glob('*.js')))<3:
            shutil.copyfile(source,analysis/source.name)
        snippets.append({'file':source.name,'text':body[:10000]})
    if not list(analysis.iterdir()):
        (analysis/'metadata.js').write_text('const sourceEvidence = '+json.dumps({'title':observation['title'],'metadata':observation['metadata']},ensure_ascii=False)+';', 'utf-8')
    # Cache roots may be configured by deployment; never inspect unrelated account files.
    roots=[Path(p) for p in os.environ.get('REPLICA_WECHAT_CACHE_ROOTS','').split(os.pathsep) if p]
    if os.environ.get('APPDATA'):
        roots.extend((Path(os.environ['APPDATA'])/'Tencent/xwechat/radium/users').glob('*/applet/packages'))
    cache=[];local_roots=[]
    for appid in ([] if web_only else observation.get('appids',[])[:3]):
        if not re.fullmatch(r'wx[0-9a-fA-F]{16}',appid):continue
        for root in roots:
            if not root.is_dir():continue
            local=root.parent/'local'/appid
            if local.is_dir():local_roots.append(str(local))
            versions=[p for p in (root/appid).glob('*') if p.is_dir()]
            versions.sort(key=lambda p:int(p.name) if p.name.isdigit() else -1,reverse=True)
            for package in (versions[0].glob('*.wxapkg') if versions else []):
                if len(cache)>=20:break
                cache.append({'appid':appid,'path':str(package),'bytes':package.stat().st_size})
    if share and not cache:
        raise NeedsInput(f'已确认 AppID {appid}，但未发现对应代码包。请在本机微信打开该游戏加载场景，随后继续原任务。')
    cache_status='no matched cache'
    if cache:
        cache_file=directory/'cache-input.json';cache_file.write_text(json.dumps(cache),'utf-8')
        unpacked=directory/'unpacked'
        result=subprocess.run(command+[str(Path(__file__).with_name('unpack-cache.cjs')),str(cache_file),str(unpacked)],capture_output=True,timeout=budget.remaining(60),shell=False)
        if result.returncode==0:
            manifest=json.loads((unpacked/'manifest.json').read_text('utf-8'))
            observation['cache_manifest']=manifest
            cache_status='cache unpacked; original resource adaptation required before generation'
            for item in [f for p in manifest for f in p['files'] if f['file'].endswith('.js')][:10]:
                source=unpacked/item['file'];body=source.read_text('utf-8',errors='replace')
                snippets.insert(0,{'file':item['original'],'text':body[:12000]})
                if len(body)<20000:shutil.copyfile(source,analysis/source.name)
        else:
            raise Blocked('匹配缓存解包失败，已保留输入清单；需检查格式或容量限制，不能转为简化重写')
    from cache_downloads import collect_download_cache
    downloads=collect_download_cache(list(dict.fromkeys(local_roots)),directory/'download-cache')
    observation['download_cache']={k:v for k,v in downloads.items() if k!='files'}
    observation['download_cache'].update(file_count=len(downloads['files']),manifest=str(directory/'download-cache/manifest.json'))
    from config_discovery import discover_config
    configs=discover_config(local_roots, (directory/'unpacked').rglob('*.js'),directory/'config-cache')
    observation['config_cache']={'count':len(configs['candidates']),'manifest':str(directory/'config-cache/manifest.json'),'schema_count':len(configs['schemas'])}
    observation.update(cache_checked=True,cache_package_count=len(cache),
        resource_directory=str(directory/'unpacked'),resource_policy='original-resources-first',
        resource_package_inventory=cache,matched_local_resource_roots=list(dict.fromkeys(local_roots)))
    limitations=['宣传页面不等于原游戏运行记录']
    if observation['source_kind']=='wechat':
        limitations.append('未取得或未适配的微信接口、原版素材和完整关卡不视为已还原')
    else:
        limitations.append('未确认网页游戏的实际运行入口、远程资源和完整玩法，不视为已还原')
    observation.update(code_excerpts=snippets[:10],cache_status=cache_status,analysis_directory=str(analysis),
        evidence={'directory':str(directory),'html_sha256':hashlib.sha256((directory/'source.html').read_bytes()).hexdigest() if not share else None,
                  'source_url':url,'cache_package_count':len(cache),'mode':'confirmed-wechat-cache' if share else 'public-page-gameplay-reconstruction',
                  'rea_scope':[p.name for p in analysis.glob('*.js')],
                  'limitations':limitations})
    (directory/'collected.json').write_text(json.dumps(observation,ensure_ascii=False,indent=2),'utf-8')
    return observation
