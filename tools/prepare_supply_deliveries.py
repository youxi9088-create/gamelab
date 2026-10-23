"""Prepare all latest game deliveries; explicit grants, no acceptance or submission."""
import argparse
from contextlib import closing
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import secrets
import sqlite3
import sys
from types import SimpleNamespace

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from controlplane.supply import inspect_source, SupplyError
from controlplane.supply_delivery import resolve_source, delivery_source, write_review_archive
from controlplane.supply_prepare import prepared


def prepare(data, library, destination, owner, authorization, apply=False):
    if not owner.strip() or not authorization.strip():
        raise ValueError('须提供实际权利人及明确授权说明')
    data=Path(data).resolve();destination=Path(destination).resolve()
    if destination.exists():raise ValueError('交付目录已存在，不覆盖')
    destination.mkdir(parents=True)
    database=data/'platform.sqlite3'
    with closing(sqlite3.connect(database.as_uri()+'?mode=ro',uri=True)) as db:
        raw=[(k,json.loads(d)) for k,d in db.execute("select kind,data from records where kind in ('candidates','versions','supply','game_profiles')")]
    candidates={v['id']:v for k,v in raw if k=='candidates' and not v.get('observations',{}).get('catalog_hidden')}
    supplies={v['id']:v for k,v in raw if k=='supply'}
    profiles={v['id']:v for k,v in raw if k=='game_profiles'}
    repo=SimpleNamespace(root=Path(library).resolve(),artifacts=data/'artifacts')
    seen=set();results=[];registrations=[]
    timestamp=datetime.now(timezone.utc).isoformat()
    for v in sorted((v for k,v in raw if k=='versions'),key=lambda v:v.get('created_at',''),reverse=True):
        cid=v['candidate_id']
        if cid in seen or cid not in candidates:continue
        seen.add(cid);candidate=candidates[cid];old=supplies.get(v['id'],{})
        result={'game':candidate['title'],'candidate_id':cid,'version_id':v['id'],'version_status':v['status']}
        folder=destination/v['id'];folder.mkdir()
        metadata=dict(old.get('metadata') or v.get('report',{}).get('supply') or {})
        metadata['license_declaration']={'distributable':'yes','owner':owner,'note':authorization}
        limits=list(metadata.get('known_limitations') or [])
        for item in (v.get('report') or {}).get('limitations') or []:
            if item not in limits:limits.append(item)
        metadata['known_limitations']=limits
        try:
            source=resolve_source(repo,v)
            result['source_binding']='version_directory' if v.get('source_directory') else 'immutable_artifact'
            with prepared(source) as adapted:
                with delivery_source(adapted,candidate,v,metadata,profiles.get(v['id'],{}).get('profile')) as (target,supplement):
                    if not metadata.get('acceptance_steps') and supplement['acceptance_steps']:
                        metadata['acceptance_steps']=supplement['acceptance_steps']
                    metadata['contact_note']='随包 supply-delivery/ACCEPTANCE.md 为人工验收指引；原始操作及验证范围亦随包提供。'
                    result.update(supplement)
                    if supplement.get('runtime_recheck_required'):
                        limits.append('供货副本已整理入口、启动文件或资源映射；原玩法证据对应原版本，整理后运行需在接收环境核对。')
                        metadata['known_limitations']=list(dict.fromkeys(limits))
                    try:inspect_source(target);result['template_structure']='pass'
                    except SupplyError as exc:result['template_structure']=exc.code
                    result.update(write_review_archive(target,folder/'game.zip'))
                    # Internal stable registration supplements the immutable version.
                    # The archive is downloadable for receiver review, not a newly
                    # approved game and not proof of downstream acceptance.
                    result['archive_path']=str(folder/'game.zip')
                    result['manual_acceptance_guide']=True
                    result['receiver_acceptance']='not_confirmed'
                    result['authorization_recorded']=True
                    if result['template_structure']!='pass':
                        note='运行包保留原引擎；现行模板静态检查：'+result['template_structure']+'。请下游按其接收能力评估，不宣称可提取全部核心逻辑。'
                        metadata['known_limitations']=list(dict.fromkeys(limits+[note]))
                    (folder/'submission.draft.json').write_text(json.dumps({
                        'game_name':candidate['title'],'archive_sha256':result['sha256'],
                        'archive_url':None,'submission_id':old.get('submission_id'),**metadata},ensure_ascii=False,indent=2),'utf-8')
            registrations.append((v,old,metadata,result))
        except (ValueError,OSError) as exc:
            result['preparation_error']=str(exc)
        (folder/'DELIVERY_STATUS.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),'utf-8')
        results.append(result)
    if apply:
        with closing(sqlite3.connect(database,timeout=30)) as db:
            backups=data/'backups';backups.mkdir(exist_ok=True)
            backup=backups/('supply-registration-'+secrets.token_hex(8)+'.sqlite3')
            with closing(sqlite3.connect(backup)) as out:db.backup(out)
            db.execute('BEGIN IMMEDIATE')
            def put(kind,row):
                db.execute('INSERT INTO records(kind,id,data) VALUES(?,?,?) ON CONFLICT(kind,id) DO UPDATE SET data=excluded.data',
                           (kind,row['id'],json.dumps(row,ensure_ascii=False)))
            for version,old,metadata,result in registrations:
                current=json.loads(db.execute("select data from records where kind='versions' and id=?",(version['id'],)).fetchone()[0])
                if current!=version:raise ValueError('版本在准备期间发生变化，未登记')
                row=db.execute("select data from records where kind='supply' and id=?",(version['id'],)).fetchone()
                existing=json.loads(row[0]) if row else {}
                if existing!=old or existing.get('archive_sha256') or existing.get('submitted') or existing.get('lease_until',0)>datetime.now().timestamp():
                    result['registration']='skipped_existing_submission';continue
                put('supply_deliveries',dict(result,id=version['id'],prepared_at=timestamp,metadata=metadata))
                if version['status'] in ('approved','published'):
                    existing=existing or dict(id=version['id'],version_id=version['id'],candidate_id=version['candidate_id'],
                        submission_id='supply-'+secrets.token_hex(16),created_at=timestamp,attempts=0,issues=[])
                    existing.update(metadata=metadata,status='blocked',next_action='supplier',updated_at=timestamp,
                        error_code='DELIVERY_CONNECTION_PENDING' if result['template_structure']=='pass' and result['downstream_size_limits_pass'] else 'RECEIVER_REVIEW_REQUIRED',
                        notice='供货包与授权资料已准备；待配置接收链路。' if result['template_structure']=='pass' and result['downstream_size_limits_pass'] else '完整运行包已准备，现行模板协议兼容性仍需下游确认。',
                        next_poll=0,delivery_prepared=True,delivery_sha256=result['sha256'])
                    put('supply',existing)
                result['registration']='saved_without_approval_or_submission'
            db.commit()
    summary={'created_at':timestamp,'scope':'latest visible versions','submission_sent':False,'games':results}
    (destination/'DELIVERY_INDEX.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),'utf-8')
    lines=['# 游戏供货交付清单','本批未执行游戏、验收或下游提交。game.zip 为完整运行包及补充资料；模板结构未通过项须由下游确认接收。',
        '| 游戏 | 版本状态 | 归档 | 模板结构 | 数量/大小限制 |','|---|---|---|---|---|']
    for r in results:
        lines.append('| '+r['game']+' | '+r['version_status']+' | '+('已准备' if r.get('sha256') else '失败：'+r.get('preparation_error',''))+' | '+r.get('template_structure','未检查')+' | '+('通过' if r.get('downstream_size_limits_pass') else '未通过／未检查')+' |')
    (destination/'README.md').write_text('\n\n'.join(lines[:2])+'\n\n'+'\n'.join(lines[2:])+'\n','utf-8')
    return summary


if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--data',required=True);p.add_argument('--library',required=True);p.add_argument('--output',required=True)
    p.add_argument('--owner',required=True);p.add_argument('--authorization',required=True);p.add_argument('--apply',action='store_true')
    a=p.parse_args();r=prepare(a.data,a.library,a.output,a.owner,a.authorization,a.apply)
    print(json.dumps(r,ensure_ascii=False))
