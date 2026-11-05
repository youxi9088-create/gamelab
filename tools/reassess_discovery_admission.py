"""One explicit full-list audit, with durable per-item results and no dispatch."""
import argparse
from concurrent.futures import ThreadPoolExecutor,wait,FIRST_COMPLETED
import hashlib
import json
import os
from pathlib import Path
import re
import sys
from types import SimpleNamespace

sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from controlplane.admission import assess,REVISION
from controlplane.discovery import category,config
from controlplane.store import Store,now


def fingerprint(item):
    return hashlib.sha256(json.dumps({k:item.get(k) for k in ('url','gameplay','category')},ensure_ascii=True,sort_keys=True).encode()).hexdigest()


def apply_result(store,run_id,original,assessment):
    """Compare source facts; preserve human decisions and all dispatched work."""
    key=run_id+':'+original['id']
    with store.tx(label='/operations/admission-audit-result') as db:
        existing=store.get(db,'admission_audit_results',key)
        if existing:return existing
        current=store.get(db,'recommendations',original['id'])
        outcome='source_changed_or_removed'
        if current and fingerprint(current)==fingerprint(original):
            current['admission']={**assessment,'audit_id':run_id}
            if current['status']=='pending' and not current.get('decision_by') and assessment['status']=='filtered':
                current['status']='filtered'
                current['reason']='；'.join(g['reason'] for g in assessment['gates'].values() if g['status']=='fail')
            store.put(db,'recommendations',current);outcome='applied'
        result={'id':key,'run_id':run_id,'recommendation_id':original['id'],'title':original.get('title'),
                'source':original.get('source'),'original_status':original['status'],'current_status':current.get('status') if current else None,
                'assessment':assessment,'outcome':outcome,'at':now()}
        store.put(db,'admission_audit_results',result)
        return result


def snapshot(store):
    with store.read() as db:
        cfg=config(store,db)
        items=store.all(db,'recommendations')
        versions=list(db.execute("""SELECT id,json_extract(data,'$.candidate_id'),
          COALESCE(json_extract(data,'$.game_profile'),json_extract(data,'$.report.game_profile'),'{}')
          FROM records WHERE kind='versions' AND json_extract(data,'$.status') IN ('review','approved','published') ORDER BY rowid DESC"""))
        urls={row[0]:row[1] for row in db.execute("SELECT id,json_extract(data,'$.canonical_url') FROM records WHERE kind='candidates'")}
    baselines=[];seen=set()
    for vid,cid,raw in versions:
        if cid in seen:continue
        facts=json.loads(raw)
        if not isinstance(facts,dict) or not facts.get('core_gameplay'):continue
        seen.add(cid)
        for genre in re.split(r'[/／,，|·]',facts.get('category','')):
            baselines.append({'id':vid,'candidate_id':cid,'url':urls.get(cid),'category':category(genre,cfg['aliases']),
                'signature':{k:str(facts.get(k,''))[:1600] for k in ('core_gameplay','controls','rules','ui_flow','game_loop','gameplay_signature')}})
    items.sort(key=lambda i:(i['status']!='pending',i.get('created_at',''),i['id']))
    return {'created_at':now(),'revision':REVISION,'items':items,'baselines':baselines,'aliases':cfg['aliases']}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--data-dir',required=True,type=Path)
    parser.add_argument('--run-id',required=True)
    parser.add_argument('--workers',type=int,choices=(1,2,3),default=3)
    args=parser.parse_args()
    if not re.fullmatch(r'[a-zA-Z0-9_-]{1,100}',args.run_id):parser.error('Invalid run id')
    from controlplane.process_priority import prioritize_control_plane
    prioritize_control_plane()
    from controlplane.service_registry import ai_config
    if not all(ai_config().get(k) for k in ('base_url','api_key','model')):raise SystemExit('AI service unavailable; no audit started')
    from controlplane import admission
    admission.INSTRUCTIONS += '\n本次批量核查请简短输出：机制value不超过60字，门槛reason不超过100字，每个引文仅取支持结论所必需的短片段；未知机制可省略。不要重复大段介绍，不增加额外字段，仍完整返回三门槛JSON，不减少证据要求。'
    folder=args.data_dir/'admission-audits'/args.run_id;folder.mkdir(parents=True,exist_ok=True)
    lock=(folder/'process.lock').open('a+b');lock.seek(0);lock.write(b'1');lock.flush();lock.seek(0)
    if os.name=='nt':
        import msvcrt
        msvcrt.locking(lock.fileno(),msvcrt.LK_NBLCK,1)
    else:
        import fcntl
        fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
    store=Store.__new__(Store);store.path=args.data_dir/'platform.sqlite3';service=SimpleNamespace(store=store)
    input_file=folder/'input.json'
    if input_file.exists():data=json.loads(input_file.read_text('utf-8'))
    else:
        data=snapshot(store)
        input_file.write_text(json.dumps(data,ensure_ascii=False),'utf-8')
    with store.read() as db:
        results={r[0]:json.loads(r[1]) for r in db.execute("SELECT json_extract(data,'$.recommendation_id'),data FROM records WHERE kind='admission_audit_results' AND json_extract(data,'$.run_id')=?",(args.run_id,))}
    state={'id':args.run_id,'revision':REVISION,'created_at':data['created_at'],'total':len(data['items']),'workers':args.workers,'pid':os.getpid(),'status':'running'}
    def progress(final=False):
        counts={k:sum(r['assessment']['status']==k for r in results.values()) for k in ('eligible','filtered','unknown')}
        state.update(done=len(results),counts=counts,heartbeat_at=now(),status='completed' if final else 'running',
                     applied=sum(r['outcome']=='applied' for r in results.values()),source_changed=sum(r['outcome']!='applied' for r in results.values()))
        with store.tx(label='/operations/admission-audit-progress') as db:store.put(db,'admission_audits',state)
        (folder/'progress.json').write_text(json.dumps(state,ensure_ascii=False,indent=2),'utf-8')
        print(json.dumps(state,ensure_ascii=False),flush=True)
    progress()
    def evaluate(original):
        item={**original,'category':category(original.get('category',''),data['aliases'])}
        # A game's own current version is not a duplicate template of itself.
        baselines=[b for b in data['baselines'] if b.get('url')!=original.get('url')]
        assess([item],baselines,service,args.run_id)
        return original,item['admission']
    pending_items=[i for i in data['items'] if i['id'] not in results]
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        # Bound queued calls as well as running calls; durable results permit a
        # resumed invocation to skip every already-completed model evaluation.
        source=iter(pending_items);active={}
        for _ in range(args.workers):
            item=next(source,None)
            if item:active[pool.submit(evaluate,item)]=item
        while active:
            completed,_=wait(active,timeout=20,return_when=FIRST_COMPLETED)
            for future in completed:
                active.pop(future)
                original,assessment=future.result()
                result=apply_result(store,args.run_id,original,assessment);results[original['id']]=result
                item=next(source,None)
                if item:active[pool.submit(evaluate,item)]=item
            progress()
    progress(True)
    report={'run':state,'results':list(results.values())}
    (folder/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),'utf-8')


if __name__=='__main__':main()
