"""Run one genuine discovery scan without starting conversion or accepting games."""
import argparse
import json
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from controlplane.service import Service
from controlplane.discovery import DiscoveryScheduler

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--data-dir',type=Path,default=ROOT/'data')
    parser.add_argument('--repo-dir',type=Path,default=ROOT/'game-library')
    args=parser.parse_args()
    service=Service(args.data_dir,args.repo_dir,'http://127.0.0.1:8766')
    result=service.mutate('/api/discovery/scan',{})
    print(json.dumps({'scan_id':result['run']['id'],'status':result['run']['status']},ensure_ascii=False),flush=True)
    DiscoveryScheduler(service).tick()
    with service.store.tx() as db:
        run=service.store.get(db,'discovery_runs',result['run']['id'])
    print(json.dumps({'scan_id':run['id'],'status':run['status'],'recommendations':len(run['recommendation_ids']),'sources':run['sources']},ensure_ascii=False),flush=True)
