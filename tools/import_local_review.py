"""Trusted local admin intake for large, already runnable packages.

Not an HTTP or worker upload endpoint. Preserves unknown rights and always creates
a review version; it never approves, publishes, or claims source recovery.
"""
import argparse
import hashlib
import json
import shutil
import sys
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from controlplane.service import Service, require
from controlplane.repository import safe_relative
from controlplane.store import ident, now

def snapshot(repo, artifact_id, source, entry, max_bytes=256*1024*1024):
    source = Path(source).resolve(strict=True)
    safe_relative(entry)
    paths = []
    for p in source.rglob('*'):
        rel = p.relative_to(source).as_posix()
        if any(x.startswith('.') or x in ('node_modules','__pycache__') for x in p.relative_to(source).parts):
            continue
        if p.is_symlink() or (hasattr(p, 'is_junction') and p.is_junction()):
            raise ValueError('Links and junctions are not accepted')
        if p.is_file():
            safe_relative(rel)
            if not p.resolve().is_relative_to(source):
                raise ValueError('File escapes source directory')
            paths.append((rel,p))
    if not 1<=len(paths)<=2000 or sum(p.stat().st_size for _,p in paths)>max_bytes:
        raise ValueError('Local package exceeds 2000 files or configured byte limit')
    if entry not in dict(paths) or not entry.endswith('.html'):
        raise ValueError('HTML entry must exist')
    dest=repo.artifacts/artifact_id
    dest.mkdir(exist_ok=False)
    digest=hashlib.sha256();total=0
    for rel,p in sorted(paths):
        target=dest/rel;target.parent.mkdir(parents=True,exist_ok=True)
        digest.update(rel.encode()+b'\0')
        with p.open('rb') as src,target.open('xb') as out:
            while data:=src.read(1024*1024):
                total+=len(data)
                if total>max_bytes:raise ValueError('Package grew beyond limit during snapshot')
                digest.update(data);out.write(data)
    return dict(size=total,sha256=digest.hexdigest(),files=[p for p,_ in sorted(paths)],entry=entry)

def intake(service,candidate_id,preview_url,report):
    from controlplane.presentation import preview_settings
    preview=preview_settings(report)
    url=urlsplit(preview_url)
    require(url.scheme=='http' and url.hostname in ('127.0.0.1','localhost') and url.port and not url.username and not url.password,'Preview must be a loopback HTTP runtime')
    require(url.port not in (8765,8766),'Use a separate game runtime port')
    with service.store.tx() as db:
        s=service.store;c=service.get(db,'candidates',candidate_id)
        if c.get('game_spec'):report={**report,'game_spec':c['game_spec']}
        require(c.get('source_path'),'Candidate needs a trusted local source_path')
        from controlplane.delivery_requirements import require_delivery
        source=Path(c['source_path'])
        require_delivery(report,[p.relative_to(source).as_posix() for p in source.rglob('*') if p.is_file()])
        require(not any(j['candidate_id']==candidate_id and j['status'] in ('queued','running','review') for j in s.all(db,'jobs')),'Candidate already has active work',409)
        artifact_id,version_id,job_id,batch_id=ident('artifact'),ident('v'),ident('job'),ident('batch')
        info=snapshot(service.repo,artifact_id,c['source_path'],'index.html')
        artifact=dict(id=artifact_id,job_id=job_id,created_at=now(),report=report,**info)
        version=dict(id=version_id,candidate_id=candidate_id,job_id=job_id,artifact_id=artifact_id,title=c['title'],status='review',entry=info['entry'],report=report,created_at=now(),route='local',preview_mode='external',preview_url=preview_url)
        version.update(service.repo.record(c,version,artifact))
        version['screenshots']=[service.play_url+'/play/'+artifact_id+'/'+p for p in info['files'] if p.startswith('screenshots/') and p.endswith('.png')]
        version['cover']=version['screenshots'][0] if version['screenshots'] else ''
        version['preview']=preview
        s.put(db,'artifacts',artifact);s.put(db,'versions',version)
        s.put(db,'batches',dict(id=batch_id,name=c['title']+' · 本地运行包入库',candidate_ids=[candidate_id],status='attention',created_at=now()))
        s.put(db,'jobs',dict(id=job_id,candidate_id=candidate_id,batch_id=batch_id,stage='packaging',status='review',route='local',progress=100,attempt=1,created_at=now(),completed_at=now(),version_id=version_id,reason='本地发布资源快照，等待玩法、画面和使用范围验收；未声称源码恢复',report=report))
        c['status']='review';c.setdefault('acquired_at',now());s.put(db,'candidates',c)
        s.event(db,'本地运行包已快照入库，保留原使用范围，未自动批准或发布',job_id,'packaging',version_id=version_id)
        return version

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--candidate',required=True);parser.add_argument('--preview',required=True);parser.add_argument('--report',required=True)
    args=parser.parse_args()
    service=Service(ROOT/'data',ROOT/'game-library','http://127.0.0.1:8766')
    version=intake(service,args.candidate,args.preview,json.loads(Path(args.report).read_text(encoding='utf-8-sig')))
    print(json.dumps(version,ensure_ascii=False,indent=2))
