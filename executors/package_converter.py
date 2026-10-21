"""Adapter for the existing authenticated, asynchronous wxapkg ZIP service."""
import base64
import hashlib
import io
import json
import re
import stat
import time
import urllib.request
import zipfile
from pathlib import Path
from controlplane.repository import safe_relative
from controlplane.service_registry import NoRedirect


def input_zip(observation, roots):
    packages=observation.get('resource_package_inventory',[])
    ids={p['appid'] for p in packages}
    if len(ids)!=1:raise ValueError('需要唯一匹配的游戏 AppID 和实际游戏包')
    appid=ids.pop()
    providers=set()
    resource=Path(observation['resource_directory'])
    for file in resource.rglob('app-config.json'):
        config=json.loads(file.read_text('utf-8'))
        provider=config.get('gamePlugins',{}).get('cocos',{}).get('provider')
        if provider:providers.add(provider)
    if len(providers)!=1:raise ValueError('未从原游戏配置确认唯一 Cocos 引擎插件，不能猜测匹配包')
    engine=providers.pop()
    if not re.fullmatch(r'wx[0-9a-fA-F]{16}',engine):raise ValueError('引擎 AppID 无效')
    engines=[]
    for root in roots:
        versions=sorted((p for p in (Path(root)/engine).glob('*') if p.is_dir()),key=lambda p:int(p.name) if p.name.isdigit() else -1,reverse=True)
        if versions:
            engines=list(versions[0].glob('*.wxapkg'))
            if engines:break
    if not engines:raise ValueError('缺少原游戏配置指定的引擎插件包：'+engine)
    buffer=io.BytesIO();total=0
    with zipfile.ZipFile(buffer,'w',zipfile.ZIP_DEFLATED) as archive:
        archive.writestr('manifest.json',json.dumps({'appid':appid,'engine_appid':engine,'ad_free':False}))
        for group,paths in [('game',[Path(p['path']) for p in packages]),('engine',engines)]:
            for index,path in enumerate(paths):
                if path.is_symlink() or not path.is_file():raise ValueError('包文件缺失或是链接')
                total+=path.stat().st_size
                if total>256*1024*1024:raise ValueError('输入包容量超限')
                archive.write(path,f'{group}/{index}.wxapkg')
    data=buffer.getvalue()
    if len(data)>128*1024*1024:raise ValueError('上传 ZIP 超限')
    return data


def extract_result(data, destination):
    destination=Path(destination);destination.mkdir(exist_ok=False)
    total=0;seen=set()
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        if len(archive.infolist())>2000:raise ValueError('转换产物文件数超限')
        for item in archive.infolist():
            name=item.filename.rstrip('/')
            safe_relative(name)
            if name.lower() in seen or stat.S_ISLNK(item.external_attr>>16):raise ValueError('重复路径或链接')
            seen.add(name.lower());total+=item.file_size
            if total>256*1024*1024:raise ValueError('转换产物容量超限')
            target=destination/name
            if item.is_dir():target.mkdir(parents=True,exist_ok=True);continue
            target.parent.mkdir(parents=True,exist_ok=True)
            target.write_bytes(archive.read(item))
    if not (destination/'index.html').is_file():raise ValueError('转换产物缺少 index.html')


def convert(config, observation, roots, run, budget):
    base=config['base_url'].rstrip('/')
    opener=urllib.request.build_opener(NoRedirect)
    def request(path,data=None,limit=1024*1024):
        headers={'Authorization':'Bearer '+config.get('api_key','')}
        if data is not None:headers['Content-Type']='application/zip'
        with opener.open(urllib.request.Request(base+path,data=data,headers=headers),timeout=budget.remaining(45)) as response:
            raw=response.read(limit+1)
        if len(raw)>limit:raise ValueError('转换服务响应超限')
        return raw
    upload=input_zip(observation,roots)
    record={'input_sha256':hashlib.sha256(upload).hexdigest(),'status':'submitting'}
    record_path=run/'converter-job.json'
    def save():record_path.write_text(json.dumps(record,ensure_ascii=False,indent=2),'utf-8')
    save()
    job=json.loads(request('/v1/jobs',upload))
    jid=job.get('id','')
    if not re.fullmatch('[0-9a-f]{32}',jid):raise ValueError('转换服务返回无效任务ID')
    record.update(id=jid,status=job['status']);save()
    while job['status'] in ('queued','running'):
        time.sleep(budget.remaining(2))
        job=json.loads(request('/v1/jobs/'+jid))
        record.update(status=job['status'],stage=job.get('stage'));save()
    if job['status']!='built_unverified':raise ValueError('转换未完成：'+str(job.get('error',job['status']))[:500])
    data=request('/v1/jobs/'+jid+'/download',limit=128*1024*1024)
    if hashlib.sha256(data).hexdigest()!=job.get('sha256'):raise ValueError('转换下载 SHA-256 不匹配')
    (run/'converted.zip').write_bytes(data)
    extract_result(data,run/'converted')
    record.update(sha256=job['sha256'],report=job.get('report',{}));save()
    return run/'converted',record


def runtime_files(directory):
    return {p.relative_to(directory).as_posix():{'encoding':'base64','content':base64.b64encode(p.read_bytes()).decode()} for p in directory.rglob('*') if p.is_file()}
