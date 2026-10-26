"""Unified production inventory, checksummed backup and empty-directory restore."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import sqlite3
import tempfile
import urllib.request
import zipfile
import re
from contextlib import closing
from datetime import datetime, timezone


def now():return datetime.now(timezone.utc).isoformat()


def write(path,value):
    path=Path(path);path.parent.mkdir(parents=True,exist_ok=True)
    temporary=path.with_suffix(path.suffix+'.tmp')
    temporary.write_text(json.dumps(value,ensure_ascii=False,indent=2),'utf-8');temporary.replace(path)


def inventory(root):
    root=Path(root).resolve();rows=[]
    for p in sorted(root.rglob('*')):
        parts=p.relative_to(root).parts
        # Per-account CLI scratch locks are recreated; auth and config remain durable.
        if len(parts)>=4 and parts[:2]==('config','codex-accounts') and parts[3]=='tmp':continue
        if not p.is_file() or p.name.endswith(('-wal','-shm','.tmp')):continue
        if not p.resolve().is_relative_to(root):raise ValueError('生产目录含外部文件引用：'+str(p))
        rows.append({'path':p.relative_to(root).as_posix(),'bytes':p.stat().st_size})
    return rows


def digest_file(path):
    with Path(path).open('rb') as stream:return hashlib.file_digest(stream,'sha256').hexdigest()


def read_manifest(path):
    with zipfile.ZipFile(path) as archive:
        manifest=json.loads(archive.read('BACKUP_MANIFEST.json'))
        # Early full-backup archives predate the explicit schema field.
        manifest.setdefault('schema',1)
        if manifest.get('schema') not in (1,2):raise ValueError('未知备份格式')
        rows=manifest['files'];names=[row['path'] for row in rows]
        if len(names)!=len(set(names)):raise ValueError('备份清单重复')
        for row in rows:
            name=row['path'];p=Path(name)
            if not name or p.is_absolute() or '..' in p.parts or ':' in name or '\\' in name:raise ValueError('无效备份路径')
            if not re.fullmatch('[a-f0-9]{64}',row['sha256']) or not isinstance(row['bytes'],int) or row['bytes']<0:raise ValueError('无效备份摘要')
        stored=manifest.get('changed',names) if manifest['schema']==2 else names
        if len(stored)!=len(set(stored)) or not set(stored)<=set(names):raise ValueError('无效增量清单')
        if len(archive.namelist())!=len(stored)+1 or set(archive.namelist())!=set(stored+['BACKUP_MANIFEST.json']):raise ValueError('备份清单不一致')
        return manifest


def baseline_path(archive_path,manifest):
    name=manifest['base']['name']
    if not isinstance(name,str) or not name or Path(name).name!=name or ':' in name or '\\' in name or name in ('.','..'):raise ValueError('无效基线路径')
    path=Path(archive_path).resolve().parent/name
    if path.resolve().parent!=Path(archive_path).resolve().parent:raise ValueError('基线超出备份目录')
    return path


def verified_baseline(path,expected=None):
    path=Path(path).resolve();digest=digest_file(path)
    if expected is not None and digest!=expected:raise ValueError('完整基线摘要不匹配')
    manifest=read_manifest(path)
    if manifest['schema']!=1:raise ValueError('增量必须直接引用完整基线，不能形成链')
    receipt=path.with_suffix(path.suffix+'.verified.json')
    try:cached=json.loads(receipt.read_text('utf-8'))
    except (OSError,ValueError):cached={}
    if cached.get('sha256')!=digest:
        verify(path)
        write(receipt,{'sha256':digest,'verified_at':now()})
    return manifest,digest


def latest_baseline(root):
    status_path=Path(root)/'backup-status.json'
    if not status_path.exists():return None
    state=json.loads(status_path.read_text('utf-8'))
    if not state.get('verified'):raise ValueError('最近备份未校验；拒绝自动退回全量备份')
    latest=Path(state['path']).resolve();manifest=read_manifest(latest)
    base=baseline_path(latest,manifest) if manifest['schema']==2 else latest
    baseline,digest=verified_baseline(base,manifest['base']['sha256'] if manifest['schema']==2 else None)
    return base,baseline,digest


def backup_capacity(root,destination_directory):
    """Conservative uncompressed bound, checked before a deployment stops service."""
    root=Path(root).resolve();destination_directory=Path(destination_directory).resolve()
    rows=inventory(root);baseline=latest_baseline(root)
    old={row['path']:row for row in baseline[1]['files']} if baseline else {}
    source_bytes=sum(row['bytes'] for row in rows if row['path']=='data/platform.sqlite3'
                     or row['path'] not in old or row['bytes']!=old[row['path']]['bytes']
                     or digest_file(root/row['path'])!=old[row['path']]['sha256'])
    # ZIP can be larger than incompressible input; leave room for SQLite and logs.
    required=source_bytes+max(512*1024**2,source_bytes//20)
    free=shutil.disk_usage(destination_directory).free
    if free<required:
        raise ValueError(f'备份空间不足：可用 {free} 字节，需要至少 {required} 字节；服务尚未停止')
    return {'source_bytes':source_bytes,'required_bytes':required,'free_bytes':free,
            'mode':'incremental' if baseline else 'full'}


def backup(root,destination):
    root=Path(root).resolve();destination=Path(destination).resolve()
    if destination.is_relative_to(root):raise ValueError('备份目录必须位于生产数据目录之外')
    database=root/'data/platform.sqlite3'
    with closing(sqlite3.connect(database)) as db:
        values=[(k,json.loads(v)) for k,v in db.execute('SELECT kind,data FROM records')]
        if any(k=='jobs' and r.get('status')=='running' for k,r in values):raise ValueError('有转换正在运行，请等待结束')
        if any(k=='discovery_runs' and r.get('status')=='running' for k,r in values):raise ValueError('来源扫描仍在运行，请稍后重试')
        maintenance=next((r for k,r in values if k=='settings' and r.get('id')=='maintenance'),{})
        if not maintenance.get('draining'):raise ValueError('备份前必须暂停领取新任务')
    destination.parent.mkdir(parents=True,exist_ok=True)
    if destination.exists():raise ValueError('备份文件已存在')
    baseline=latest_baseline(root)
    if baseline and baseline[0].parent!=destination.parent:raise ValueError('增量与完整基线必须在同一备份目录')
    old={row['path']:row for row in baseline[1]['files']} if baseline else {}
    partial=destination.with_suffix('.partial')
    with tempfile.TemporaryDirectory() as temp:
        snapshot=Path(temp)/'platform.sqlite3'
        with closing(sqlite3.connect(database)) as src,closing(sqlite3.connect(snapshot)) as dst:src.backup(dst)
        manifest=[];changed=[]
        with zipfile.ZipFile(partial,'w',zipfile.ZIP_DEFLATED,compresslevel=1,allowZip64=True) as archive:
            for row in inventory(root):
                name=row['path'];source=snapshot if name=='data/platform.sqlite3' else root/name
                observed=digest_file(source)
                if name in old and old[name]['sha256']==observed and old[name]['bytes']==source.stat().st_size:
                    manifest.append(dict(old[name]));continue
                digest=hashlib.sha256();size=0
                with source.open('rb') as src,archive.open(name,'w',force_zip64=True) as dst:
                    while chunk:=src.read(1024*1024):dst.write(chunk);digest.update(chunk);size+=len(chunk)
                if digest.hexdigest()!=observed:raise ValueError('备份期间文件变化：'+name)
                manifest.append({'path':name,'bytes':size,'sha256':digest.hexdigest()});changed.append(name)
            metadata={'schema':2 if baseline else 1,'created_at':now(),'files':manifest}
            if baseline:
                metadata.update(base={'name':baseline[0].name,'sha256':baseline[2]},changed=changed,
                                deleted=sorted(set(old)-{row['path'] for row in manifest}))
            archive.writestr('BACKUP_MANIFEST.json',json.dumps(metadata,ensure_ascii=False))
    partial.replace(destination)
    result={'completed_at':now(),'path':str(destination),'files':len(manifest),'bytes':destination.stat().st_size,'verified':False,
            'mode':'incremental' if baseline else 'full','changed_files':len(changed),
            'base_path':str(baseline[0]) if baseline else None}
    verify(destination);result['verified']=True;write(root/'backup-status.json',result)
    return result


def verify(archive_path):
    manifest=read_manifest(archive_path)
    changed=set(manifest.get('changed',[]))
    if manifest['schema']==2:
        base=baseline_path(archive_path,manifest)
        original,_=verified_baseline(base,manifest['base']['sha256'])
        old={row['path']:row for row in original['files']};current={row['path']:row for row in manifest['files']}
        if set(manifest.get('deleted',[]))!=set(old)-set(current):raise ValueError('删除清单不匹配')
        for name,row in current.items():
            if name not in changed and old.get(name)!=row:raise ValueError('增量缺少变化文件：'+name)
    with zipfile.ZipFile(archive_path) as z:
        for row in manifest['files']:
            if manifest['schema']==2 and row['path'] not in changed:continue
            name=row['path'];p=Path(name)
            if p.is_absolute() or '..' in p.parts or ':' in name or '\\' in name:raise ValueError('无效备份路径')
            digest=hashlib.sha256();size=0
            with z.open(name) as f:
                while chunk:=f.read(1024*1024):digest.update(chunk);size+=len(chunk)
            if digest.hexdigest()!=row['sha256'] or size!=row['bytes']:raise ValueError('备份校验失败：'+name)
        return manifest


def restore(archive_path,target):
    target=Path(target).resolve()
    if target.exists() and any(target.iterdir()):raise ValueError('只允许恢复到空目录')
    manifest=verify(archive_path);target.mkdir(parents=True,exist_ok=True)
    from contextlib import ExitStack
    with ExitStack() as stack:
        z=stack.enter_context(zipfile.ZipFile(archive_path))
        base=stack.enter_context(zipfile.ZipFile(baseline_path(archive_path,manifest))) if manifest['schema']==2 else z
        changed=set(manifest.get('changed',[]))
        for row in manifest['files']:
            out=target/row['path'];out.parent.mkdir(parents=True,exist_ok=True)
            source=z if manifest['schema']==1 or row['path'] in changed else base
            with source.open(row['path']) as src,out.open('wb') as dst:shutil.copyfileobj(src,dst)
    return {'restored_files':len(manifest['files']),'target':str(target),'note':'恢复后保持维护暂停，请核对路径、配置和凭据后恢复领取任务'}


def monitor(root):
    root=Path(root);errors=[]
    for port in (8765,8766):
        try:
            with urllib.request.urlopen(f'http://127.0.0.1:{port}/health',timeout=5) as r:
                if not json.load(r).get('ok'):errors.append(f'{port} 健康检查异常')
        except Exception:errors.append(f'{port} 服务不可访问')
    disk=shutil.disk_usage(root)
    if disk.free<5*1024**3:errors.append('可用磁盘不足5 GiB')
    try:
        with closing(sqlite3.connect(root/'data/platform.sqlite3')) as db:
            if db.execute('PRAGMA quick_check').fetchone()[0]!='ok':errors.append('数据库检查异常')
    except Exception:errors.append('数据库不可读取')
    try:
        backup_state=json.loads((root/'backup-status.json').read_text('utf-8'))
        age=(datetime.now(timezone.utc)-datetime.fromisoformat(backup_state['completed_at'])).total_seconds()
        if age>48*3600:errors.append('最近成功备份超过48小时')
    except Exception:errors.append('尚无成功备份记录')
    result={'checked_at':now(),'ok':not errors,'errors':errors,'summary':'运行正常' if not errors else '；'.join(errors),'disk_free_bytes':disk.free}
    write(root/'monitor-status.json',result)
    return result


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('action',choices=['inventory','backup','verify','restore','monitor'])
    p.add_argument('--root');p.add_argument('--file');p.add_argument('--target');args=p.parse_args()
    if args.action=='backup':result=backup(args.root,args.file)
    elif args.action=='verify':result={'files':len(verify(args.file)['files']),'verified':True}
    elif args.action=='restore':result=restore(args.file,args.target)
    elif args.action=='monitor':result=monitor(args.root)
    else:result=inventory(args.root)
    print(json.dumps(result,ensure_ascii=False))
