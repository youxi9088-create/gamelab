"""Run only explicitly selected queued jobs, respecting leases and global capacity."""
import argparse
import json
import sys
import threading
import time
from pathlib import Path
from types import SimpleNamespace

ROOT=Path(__file__).resolve().parents[1]
sys.path[:0]=[str(ROOT),str(ROOT/'executors')]
from controlplane.service import Service
from controlplane.store import Store
from worker import Client, execute_isolated


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('job_ids',nargs='+')
    args=parser.parse_args()
    service=Service.__new__(Service)
    service.data_dir=ROOT/'data';service.runs_dir=ROOT/'executors/runs'
    service.store=Store(service.data_dir/'platform.sqlite3')
    service.repo=SimpleNamespace(artifacts=service.data_dir/'artifacts')
    service.play_url='http://127.0.0.1:8766'
    token=(service.data_dir/'executor-token.txt').read_text('utf-8').strip()
    tool=service.authenticate(token)
    client=Client('http://127.0.0.1:8765',token)
    pending=set(args.job_ids);threads=[];deadline=time.monotonic()+3600
    while pending and time.monotonic()<deadline:
        for job_id in list(pending):
            with service.store.tx() as db:
                current=service.get(db,'jobs',job_id)
                if current['status']!='queued':
                    print(json.dumps({'job_id':job_id,'status':current['status']}),flush=True)
                    pending.remove(job_id);continue
                job=service._mutate(db,'/api/v1/jobs/claim',{'job_id':job_id,'capabilities':['rea','reconstruct'],'worker_id':'selected-workflow-validation'},tool)['job']
            if job:
                print(json.dumps({'job_id':job_id,'status':'started','round':job.get('round')}),flush=True)
                thread=threading.Thread(target=execute_isolated,args=(client,job))
                thread.start();threads.append(thread);pending.remove(job_id)
        if pending:time.sleep(0.5)
    for thread in threads:thread.join()
    if pending:print(json.dumps({'not_started':sorted(pending)}),flush=True)


if __name__=='__main__':main()
