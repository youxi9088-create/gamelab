"""Close only explicit matched-game cache dependencies; preserve original runtime."""
import hashlib
import json
from pathlib import Path
import shutil
from urllib.parse import urlsplit
from remote_assets import download

def complete(observation,target,run,budget):
    manifest=observation.get('download_cache',{}).get('manifest')
    if not manifest:return {'status':'not_available','reason':'未提供该游戏的下载缓存索引'}
    source=Path(manifest);index=json.loads(source.read_text('utf-8'));mapping={};records=[]
    assets=target/'assets/remote';assets.mkdir(parents=True,exist_ok=True)
    for number,item in enumerate(index.get('files',[])):
        original=(source.parent/item['file']).resolve()
        if not original.is_relative_to(source.parent.resolve()) or not original.is_file():raise ValueError('缓存资源路径无效')
        data=original.read_bytes()
        if hashlib.sha256(data).hexdigest()!=item['sha256']:raise ValueError('缓存资源哈希改变')
        name=f'cached-{number+1:04d}'+original.suffix
        (assets/name).write_bytes(data);mapping[item['url']]='assets/remote/'+name
        records.append({**item,'local':mapping[item['url']]})
    missing=index.get('missing',[])
    if missing:
        # Missing resources are downloaded from this game's explicit index only.
        inputs={f'remote-{i+1:04d}':{'url':x['url'],'type':'data'} for i,x in enumerate(missing)}
        fetched,report=download(inputs,run/'remote-completion/assets',budget)
        for i,(key,item) in enumerate(inputs.items()):
            local=Path(fetched[key]['url']).name;shutil.copy2(run/'remote-completion/assets'/local,assets/local)
            mapping[item['url']]='assets/remote/'+local
        records.extend({**r,'local':mapping[r['url']]} for r in report['files'])
    result={'status':('partial' if index.get('rejected') else ('indexed_complete' if records else 'not_available')),'files':records,'rejected':index.get('rejected',[]),
            'scope':'仅已匹配 Cocos cacheList 的资源；未知分包与动态依赖不推定完整'}
    evidence=target/'evidence';evidence.mkdir(exist_ok=True)
    (evidence/'remote-completion.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),'utf-8')
    if mapping:
        (target/'remote-resource-map.js').write_text('window.localRemoteResources='+json.dumps(mapping,ensure_ascii=False)+';','utf-8')
        shutil.copy2(Path(__file__).parent/'adapters/remote-resources.js',target/'remote-resources.js')
        html=(target/'index.html').read_text('utf-8')
        injection='<script src="remote-resource-map.js"></script><script src="remote-resources.js"></script>'
        # Place bindings before any engine scripts; no game-name special cases.
        if '<head>' not in html:raise ValueError('无法确定资源适配脚本加载顺序')
        (target/'index.html').write_text(html.replace('<head>','<head>'+injection,1),'utf-8')
    return result
