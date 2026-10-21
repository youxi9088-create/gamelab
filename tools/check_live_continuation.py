"""Live AI + browser check in a disposable platform, never touches real tasks."""
import os, sys, json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path[:0]=[str(ROOT),str(ROOT/'tests'),str(ROOT/'executors')]
os.environ['REPLICA_SERVICE_CONFIG']=str(ROOT/'data/services.json')
from test_conversations import ConversationsTest
import worker
test=ConversationsTest();test.setUp()
try:
    test.reply('把现有唯一按钮 Old 改成“继续游戏”，保留现有文件和资源。验收动作是点击 #start 两次，两次都断言 body 含“继续游戏”。不需要澄清，不增加其他功能。')
    job=test.claim()
    class Client:
        def post(self,path,body):return test.s.mutate('/api/v1/'+path,body,test.tool)
    worker.execute(Client(),job)
    state=test.s.state();job=state['jobs'][0]
    result={'status':job['status'],'reason':job.get('reason'),'real_ai':True,'isolated':True}
    if job['status']=='review':
        version=state['versions'][0];result.update(report=version['report'],assets_preserved=(test.s.repo.artifacts/version['artifact_id']/'assets/original.bin').read_bytes()==b'original-resource')
    (ROOT/'qa-output/live-continuation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(result,ensure_ascii=False))
    assert result['status']=='review',result['reason']
finally:
    test.doCleanups()
