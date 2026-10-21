"""Real installed tool checks against an isolated DB and authored fixture only."""
import functools
import json
import sys
import tempfile
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT));sys.path.insert(0,str(ROOT/'executors'))
import worker
from acquisition import acquire
from controlplane.service import Service


def main():
    output=ROOT/'qa-output/conversion-check'
    output.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory() as directory:
        root=Path(directory)
        fixture=ROOT/'executors/fixtures/orbit-catch'
        class Quiet(SimpleHTTPRequestHandler):
            def log_message(self,*args):pass
        http=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(fixture)))
        threading.Thread(target=http.serve_forever,daemon=True).start()
        try:
            acquired=acquire(f'http://127.0.0.1:{http.server_port}/',root,worker.Budget(90))
        finally:http.shutdown();http.server_close()
        service=Service(root/'data',root/'repo','http://127.0.0.1:8766')
        tool=service.mutate('/api/tools',{'name':'isolated probe','capabilities':['rea','reconstruct']})['tool']
        candidate=service.mutate('/api/candidates',{'title':'Isolated authored fixture','url':'https://example.org/isolated','source_path':str(fixture),'rights':'owned'})['candidate']
        batch=service.mutate('/api/batches',{'name':'isolated','candidate_ids':[candidate['id']]})['batch']
        service.mutate('/api/batches/'+batch['id']+'/start',{})
        class Client:
            def post(self,path,body):return service.mutate('/api/v1/'+path,body,tool)
        client=Client()
        job=client.post('jobs/claim',{'capabilities':['rea']})['job']
        worker.execute(client,job)
        with service.store.tx() as db:
            finished=service.get(db,'jobs',job['id'])
            versions=service.store.all(db,'versions')
        result={'acquisition':bool(acquired.get('analysis_directory')),'status':finished['status'],'reason':finished.get('reason'),'report':finished.get('report'),'versions':len(versions),'isolated':True}
        (output/'result.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),'utf-8')
        print(json.dumps({'acquisition':result['acquisition'],'status':result['status'],'versions':len(versions),'reason':result['reason']},ensure_ascii=False))
        assert finished['status']=='review',result['reason']
        assert finished['report']['runtime_smoke']['gameplay_verified']


if __name__=='__main__':main()
