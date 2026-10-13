"""Run real REA + browser + HTTP platform integration on the original fixture only."""
import http.cookiejar
import argparse
import json
import urllib.request
from pathlib import Path
import worker


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--new-version',action='store_true')
    args=parser.parse_args()
    base = 'http://127.0.0.1:8765'
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
    csrf = json.load(opener.open(base + '/api/session'))['csrf']
    def post(path, body):
        req = urllib.request.Request(base + '/api/' + path, data=json.dumps(body).encode(), headers={'Content-Type':'application/json','X-CSRF-Token':csrf})
        return json.load(opener.open(req))
    def state():
        return json.load(opener.open(base + '/api/state'))
    url='https://example.com/replica-center-owned-fixture'
    existing=next((c for c in state()['candidates'] if c['url']==url),None)
    if existing and not args.new_version:
        raise RuntimeError('Self-test candidate already exists; inspect existing run rather than duplicate')
    tool=post('tools', {'name':'系统自检执行器 · REA + 浏览器','capabilities':['collect','rea','reconstruct']})
    client=worker.Client(base,tool['token'])
    candidate=existing or post('candidates',{'title':'系统自检 · 星轨收集（自建测试）','url':url,'source':'自建验证样例','rights':'owned','category':'街机','description':'自有测试作品，验证 REA、源码整理、真实浏览器测试和统一入库，不计作第三方游戏复刻成果。','source_path':str(worker.ROOT/'fixtures/orbit-catch'),'observations':{'controls':'点击绿色目标得分','win':'10 分完成','restart':'重新开始按钮归零'}})['candidate']
    batch=post('batches',{'name':'系统自检 · 自有样例（非 30 款正式批次）','candidate_ids':[candidate['id']]})['batch']
    post('batches/'+batch['id']+'/start',{})
    job=client.post('jobs/claim',{'capabilities':['rea'],'worker_id':'integration-fixture'})['job']
    if not job or job['candidate_id']!=candidate['id']:
        raise RuntimeError('Another task was queued before fixture; no unrelated task executed')
    worker.execute(client,job)
    finished=next(j for j in state()['jobs'] if j['id']==job['id'])
    assert finished['status']=='review',finished
    runtime=finished['report']['runtime_smoke']
    assert runtime['passed'] and runtime['gameplay_verified'] and all(runtime['fixture_checks'].values())
    # Fixture graphics are authored locally; screenshot remains available for inspection.
    version_id=finished['version_id']
    post('versions/'+version_id+'/approve',{'checks':{'gameplay':True,'visual':True,'rights':True}})
    version=post('versions/'+version_id+'/publish',{})['version']
    output={'candidate_id':candidate['id'],'job_id':job['id'],'version_id':version_id,'preview_url':version['preview_url'],'runtime':runtime,'evidence_id':finished['report']['evidence_id']}
    worker.write_json(worker.ROOT/'runs/integration-result.json',output)
    print(json.dumps(output,ensure_ascii=False))


if __name__=='__main__':
    main()
