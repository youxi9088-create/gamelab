"""Import an explicitly selected game through public platform APIs, leaving it in review.

A runs the real REA worker. B submits code authored by an external coding agent;
it never pretends that the configured remote AI service generated the files.
"""
import argparse
import http.cookiejar
import json
from pathlib import Path
import urllib.request
import worker


def main():
    p=argparse.ArgumentParser()
    p.add_argument('manifest',type=Path)
    p.add_argument('--new-version',action='store_true')
    args=p.parse_args()
    manifest=json.loads(args.manifest.read_text(encoding='utf-8-sig'))
    directory=Path(manifest['directory']).resolve()
    route=manifest['route']
    assert route in ('A','B')
    base='http://127.0.0.1:8765'
    opener=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
    csrf=json.load(opener.open(base+'/api/session'))['csrf']
    def post(path,body):
        req=urllib.request.Request(base+'/api/'+path,data=json.dumps(body).encode(),headers={'Content-Type':'application/json','X-CSRF-Token':csrf})
        return json.load(opener.open(req))
    def state():
        return json.load(opener.open(base+'/api/state'))
    # Do not accidentally claim another person's queued task.
    if any(j['status'] in ('queued','running') for j in state()['jobs']):
        raise RuntimeError('Other active work exists; use a dedicated worker to avoid taking unrelated tasks')
    candidate_body=dict(manifest['candidate'],source_path=str(directory) if route=='A' else '')
    existing=next((c for c in state()['candidates'] if c['url']==candidate_body['url']),None)
    if existing and not args.new_version:
        raise RuntimeError('Candidate already exists; inspect its current version before importing again')
    tool=post('tools',{'name':manifest['tool_name'],'capabilities':['collect','rea','reconstruct']})
    client=worker.Client(base,tool['token'])
    candidate=existing or post('candidates',candidate_body)['candidate']
    batch=post('batches',{'name':manifest['batch_name'],'candidate_ids':[candidate['id']]})['batch']
    post('batches/'+batch['id']+'/start',{})
    queued=next(j for j in state()['jobs'] if j['batch_id']==batch['id'])
    if route=='B':
        post('jobs/'+queued['id']+'/reconstruct',{'reason':manifest['routing_reason']})
    job=client.post('jobs/claim',{'capabilities':['rea'] if route=='A' else ['reconstruct'],'worker_id':'explicit-game-import'})['job']
    assert job and job['candidate_id']==candidate['id']
    run=worker.RUNS/job['id']
    run.mkdir(parents=True,exist_ok=True)
    if route=='A':
        worker.execute(client,job)
    else:
        client.post('jobs/'+job['id']+'/events',{'lease_token':job['lease_token'],'message':'接收外部 AI 编码代理独立实现；没有调用远程模型接口，也没有反编译原版客户端。','progress':60})
        files=worker.source_files(directory)
        runtime=worker.smoke(files,'index.html',run,actions=candidate_body.get('observations',{}).get('actions',[]))
        files=worker.attach_screenshots(files,run)
        report=dict(manifest['report'],path='B',runtime_smoke=runtime,rea_attempted=False,remote_model_called=False,tool='external-coding-agent',provenance=json.loads((directory/'provenance.json').read_text(encoding='utf-8')))
        if manifest.get('gameplay_report'):
            report['gameplay_qa']=json.loads(Path(manifest['gameplay_report']).read_text(encoding='utf-8-sig'))
        artifact=client.post('artifacts',{'job_id':job['id'],'lease_token':job['lease_token'],'files':files,'entry':'index.html','report':report})
        client.post('jobs/'+job['id']+'/complete',{'lease_token':job['lease_token'],'outcome':'ready_review','artifact_id':artifact['artifact_id'],'report':report,'reason':'核心玩法独立实现，等待验收；不是原版完整客户端'})
    final=next(j for j in state()['jobs'] if j['id']==job['id'])
    if final['status']!='review':
        raise RuntimeError('Game did not reach review: '+str(final))
    version=next(v for v in state()['versions'] if v['id']==final['version_id'])
    result={'candidate_id':candidate['id'],'job_id':job['id'],'version_id':version['id'],'preview_url':version['preview_url'],'commit':version['commit'],'source_directory':version['source_directory']}
    worker.write_json(run/'import-result.json',result)
    print(json.dumps(result,ensure_ascii=False))


if __name__=='__main__':
    main()
