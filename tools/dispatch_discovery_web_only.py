"""Local operator command: submit un-dispatched suggestions through shared service transactions.

Requires --execute. Uses an atomic snapshot, private SQLite backup, and normal
approval/dispatch services; never restarts existing jobs or accepts versions.
"""
import argparse
import json
import sqlite3
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from controlplane.service import Service
from controlplane.store import Store, ACTOR
from controlplane.repository import Repository


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--execute', action='store_true')
    args=parser.parse_args()
    data=ROOT/'data'
    stamp=datetime.now().strftime('%Y%m%d-%H%M%S')
    # Initialize no settings and reconcile no history: use the already initialized
    # live database through exactly the same transactional domain operations.
    service=Service.__new__(Service)
    service.data_dir=data
    service.store=Store(data/'platform.sqlite3')
    service.repo=Repository(ROOT/'game-library',data/'artifacts')
    service.play_url='http://127.0.0.1:8766'
    if not args.execute:
        with service.store.tx() as db:
            rows=service.store.all(db,'recommendations')
            print(json.dumps({'total':len(rows),'eligible':sum(r['status'] in ('pending','pending_capture') for r in rows)}))
        return
    backup=data/'backups'/('before-web-only-'+stamp+'.sqlite3')
    backup.parent.mkdir(parents=True,exist_ok=True)
    with sqlite3.connect(data/'platform.sqlite3') as source, sqlite3.connect(backup) as dest:
        source.backup(dest)
    token=ACTOR.set({'id':'local-user-authorized-operation','username':'用户授权：全部采集建议仅转换 Web'})
    try:
        with service.store.tx() as db:
            rows=service.store.all(db,'recommendations')
            eligible=[r for r in rows if r['status'] in ('pending','pending_capture')]
            batches=[];job_ids=[]
            for offset in range(0,len(eligible),100):
                items=eligible[offset:offset+100]
                pending=[r['id'] for r in items if r['status']=='pending']
                if pending:
                    service.discovery_mutate(db,['api','discovery','approve'],{'ids':pending,'reason':'用户要求全部建议发起转换，仅 Web 继续，其他暂停'})
                result=service.discovery_mutate(db,['api','discovery','dispatch'],{
                    'ids':[r['id'] for r in items], 'web_only':True,
                    'name':f'全部采集建议 · 仅 Web · {stamp} · {offset//100+1}'})
                if result['batch']:batches.append(result['batch']['id'])
                for job in result['jobs']:
                    candidate=service.get(db,'candidates',job['candidate_id'])
                    item=next(r for r in items if r['url']==candidate['canonical_url'])
                    if not candidate.get('title_edited'):
                        candidate.update(title=item['title'],category=item.get('category','未识别'),source=item.get('source','采集建议'))
                        service.store.put(db,'candidates',candidate)
                    job_ids.append(job['id'])
            report={'id':'web-only-'+stamp,'total_recommendations':len(rows),'submitted':len(eligible),
                    'new_jobs':len(job_ids),'preserved':len(rows)-len(eligible),
                    'batch_ids':batches,'job_ids':job_ids,'backup':str(backup),'policy':'web_only'}
            service.store.put(db,'operator_runs',report)
            service.store.event(db,'用户授权全部采集建议提交，仅 Web 继续，其余暂停',operator_run=report['id'],count=len(job_ids))
        path=data/(report['id']+'.json')
        path.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
        print(json.dumps({**report,'job_ids_count':len(job_ids),'job_ids':job_ids[:3],'report':str(path)},ensure_ascii=False))
    finally:
        ACTOR.reset(token)


if __name__=='__main__':main()
