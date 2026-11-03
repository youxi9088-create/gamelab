"""Dedicated shared outbox worker; no HTTP server, executor, acceptance or scanner."""
import argparse,signal,sys,logging,time,json,collections
from pathlib import Path
from types import SimpleNamespace
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT))
from controlplane.service import Service
from controlplane.store import Store
from controlplane.supply import SupplyWorker,call,STATUS_SYNC_REVISION

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--data',required=True);parser.add_argument('--library',required=True);parser.add_argument('--reconcile-submitted',action='store_true');args=parser.parse_args()
 service=Service.__new__(Service);service.data_dir=Path(args.data).resolve();service.store=Store(service.data_dir/'platform.sqlite3')
 logging.basicConfig(filename=service.data_dir/'supply-worker.log',level=logging.INFO,format='%(asctime)s %(levelname)s %(message)s')
 service.repo=SimpleNamespace(root=Path(args.library).resolve(),artifacts=service.data_dir/'artifacts')
 if args.reconcile_submitted:
  def read_client(method,*a,**kw):
   if method!='GET':raise RuntimeError('Read-only reconciliation cannot submit')
   return call(method,*a,**kw)
  worker=SupplyWorker(service,read_client)
  for _ in range(40):
   with service.store.read() as db:
    rows=service.store.all(db,'supply');remaining=[r for r in rows if r.get('submitted') and r.get('status_sync_revision')!=STATUS_SYNC_REVISION and r.get('next_poll',0)<=time.time() and r.get('lease_until',0)<=time.time()]
    paused=(service.store.get(db,'settings','maintenance') or {}).get('draining')
   if not remaining or paused:break
   worker.tick(submitted_only=True);time.sleep(2.2)
  with service.store.read() as db:rows=[r for r in service.store.all(db,'supply') if r.get('submitted')]
  print(json.dumps({'submitted_records':len(rows),'synced_records':sum(r.get('status_sync_revision')==STATUS_SYNC_REVISION for r in rows),'states':dict(collections.Counter(r.get('state','unknown') for r in rows)),'submission_sent':False}))
  return
 worker=SupplyWorker(service)
 logging.info('Shared supply worker started; no conversion executors or HTTP listeners')
 for sig in (signal.SIGINT,signal.SIGTERM):signal.signal(sig,lambda *a:worker.close())
 worker.run()
if __name__=='__main__':main()
