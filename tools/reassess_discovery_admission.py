"""One explicit full-list audit, with durable per-item results and no dispatch."""
import argparse
from contextlib import contextmanager
from concurrent.futures import ThreadPoolExecutor,wait,FIRST_COMPLETED
import hashlib
import json
import os
from pathlib import Path
import re
import sqlite3
import sys
import time
from types import SimpleNamespace

sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from controlplane.admission import assess,REVISION
from controlplane.discovery import category,config
from controlplane.store import Store,now


class AuditTargetStore(Store):
    """Never queue a batch writer for 30 seconds behind live game callbacks."""
    @contextmanager
    def tx(self,label=None):
        db=sqlite3.connect(self.path,timeout=.25)
        try:
            db.execute('PRAGMA busy_timeout=250');db.execute('BEGIN IMMEDIATE')
            yield db
            db.commit()
        except BaseException:
            db.rollback();raise
        finally:db.close()


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
    store=AuditTargetStore.__new__(AuditTargetStore);store.path=args.data_dir/'platform.sqlite3'
    # Accounting must not turn a successful model response into a failed
    # analysis when the live database is busy. Merge this durable ledger later.
    usage_store=Store(folder/'usage.sqlite3')
    with store.read() as db:pricing=store.get(db,'settings','ai_pricing') or {'id':'ai_pricing','rates':{}}
    with usage_store.tx() as db:usage_store.put(db,'settings',pricing)
    service=SimpleNamespace(store=usage_store)
    input_file=folder/'input.json'
    if input_file.exists():data=json.loads(input_file.read_text('utf-8'))
    else:
        data=snapshot(store)
        input_file.write_text(json.dumps(data,ensure_ascii=False),'utf-8')
    with store.read() as db:
        results={r[0]:json.loads(r[1]) for r in db.execute("SELECT json_extract(data,'$.recommendation_id'),data FROM records WHERE kind='admission_audit_results' AND json_extract(data,'$.run_id')=?",(args.run_id,))}
    spool=folder/'evaluations';spool.mkdir(exist_ok=True)
    def save_evaluation(original,assessment):
        name=hashlib.sha256(original['id'].encode()).hexdigest()+'.json'
        temporary=spool/(name+'.tmp')
        temporary.write_text(json.dumps({'recommendation_id':original['id'],'assessment':assessment},ensure_ascii=False),'utf-8')
        temporary.replace(spool/name)
    state={'id':args.run_id,'revision':REVISION,'created_at':data['created_at'],'total':len(data['items']),'workers':args.workers,'pid':os.getpid(),'status':'running'}
    def progress(final=False,file_only=False):
        counts={k:sum(r['assessment']['status']==k for r in results.values()) for k in ('eligible','filtered','unknown')}
        state.update(done=len(results),counts=counts,heartbeat_at=now(),status='completed' if final else 'running',
                     applied=sum(r['outcome']=='applied' for r in results.values()),source_changed=sum(r['outcome']=='source_changed_or_removed' for r in results.values()),
                     analysis_incomplete=sum('assessed_at' not in r['assessment'] for r in results.values()),
                     gate_counts={k:{s:sum(r['assessment']['gates'][k]['status']==s for r in results.values()) for s in ('pass','fail','unknown')} for k in ('originality','completeness','loop')})
        temporary=folder/'progress.json.tmp';temporary.write_text(json.dumps(state,ensure_ascii=False,indent=2),'utf-8');temporary.replace(folder/'progress.json')
        if not file_only:
            try:
                with store.tx(label='/operations/admission-audit-progress') as db:store.put(db,'admission_audits',state)
            except sqlite3.OperationalError as exc:
                if 'locked' not in str(exc) and 'busy' not in str(exc):raise
        print(json.dumps(state,ensure_ascii=False),flush=True)
    progress()
    originals={i['id']:i for i in data['items']}
    def deferred(original,assessment):
        return {'id':args.run_id+':'+original['id'],'run_id':args.run_id,'recommendation_id':original['id'],
                'title':original.get('title'),'source':original.get('source'),'original_status':original['status'],
                'current_status':None,'assessment':assessment,'outcome':'pending_database','at':now()}
    for saved in spool.glob('*.json'):
        row=json.loads(saved.read_text('utf-8'));key=row['recommendation_id']
        if key not in results and key in originals:results[key]=deferred(originals[key],row['assessment'])
    def drain(limit=6):
        state.pop('waiting_for_database',None)
        waiting=[r for r in results.values() if r['outcome']=='pending_database']
        for row in waiting[:limit]:
            try:results[row['recommendation_id']]=apply_result(store,args.run_id,originals[row['recommendation_id']],row['assessment'])
            except sqlite3.OperationalError as exc:
                if 'locked' not in str(exc) and 'busy' not in str(exc):raise
                state['waiting_for_database']=True;break
        state['pending_database']=sum(r['outcome']=='pending_database' for r in results.values())
    def evaluate(original):
        item={**original,'category':category(original.get('category',''),data['aliases'])}
        # A game's own current version is not a duplicate template of itself.
        baselines=[b for b in data['baselines'] if b.get('url')!=original.get('url')]
        assess([item],baselines,service,args.run_id)
        save_evaluation(original,item['admission'])
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
                results[original['id']]=deferred(original,assessment)
                item=next(source,None)
                if item:active[pool.submit(evaluate,item)]=item
            drain();progress()
    deadline=time.monotonic()+1800
    while any(r['outcome']=='pending_database' for r in results.values()):
        drain(24);progress()
        if time.monotonic()>deadline:raise RuntimeError('Evaluations saved; database publication still blocked. Resume the same run without repeating AI.')
        if state.get('waiting_for_database'):time.sleep(5)
    with usage_store.read() as db:usage_rows=usage_store.all(db,'ai_usage')
    for row in usage_rows:
        while True:
            try:
                with store.tx(label='/operations/admission-audit-usage-merge') as db:
                    if not store.get(db,'ai_usage',row['id']):store.put(db,'ai_usage',row)
                break
            except sqlite3.OperationalError as exc:
                if ('locked' not in str(exc) and 'busy' not in str(exc)) or time.monotonic()>deadline:raise
                state['waiting_for_database']=True;progress(file_only=True);time.sleep(5)
    state['merged_usage_calls']=len(usage_rows)
    progress(True)
    report={'run':state,'results':list(results.values())}
    (folder/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),'utf-8')
    lock.close()


if __name__=='__main__':main()
