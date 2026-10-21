from controlplane.runtime import node_binary
import copy
import json
import shutil
from pathlib import Path
import subprocess
import threading
import unittest
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
import test_platform
from controlplane.game_specs import normalize, digest, verification_gaps
from controlplane.service import ApiError


def spec():
    return normalize(dict(title='Fixture',category='测试',scope='按钮开始、得分与重开',
        evidence=['self-authored fixture'],cases=[dict(id='start',mode='browser',
        expected='点击开始后出现目标',steps=[dict(type='click',selector='#start'),
        dict(type='expect_visible',selector='#target')])]))


class GameSpecTest(unittest.TestCase):
    def setUp(self):
        self.f=test_platform.PlatformTest();self.f.setUp()
        self.addCleanup(self.f.doCleanups)
        self.s=self.f.s

    def test_revision_and_test_result_no_auto_acceptance(self):
        c=self.f.enqueue(); j=self.f.claim()
        body=dict(spec=spec(),revision=0,job_id=j['id'],lease_token=j['lease_token'])
        saved=self.s.mutate('/api/v1/candidates/'+c['id']+'/game-spec',body,self.f.tool)['spec']
        self.assertEqual(saved['digest'],digest(spec()))
        with self.assertRaises(ApiError):
            self.s.mutate('/api/v1/candidates/'+c['id']+'/game-spec',body,self.f.tool)
        result=dict(spec_digest=saved['digest'],cases=[dict(id='start',status='passed',evidence=['start.png'])],runtime_errors=[])
        before=self.s.state()
        self.s.mutate('/api/candidates/'+c['id']+'/spec-test-report',dict(job_id=j['id'],report=result))
        after=self.s.state()
        self.assertEqual([{k:v for k,v in j.items() if k!='pipeline'} for j in before['jobs']],
                         [{k:v for k,v in j.items() if k!='pipeline'} for j in after['jobs']])
        self.assertEqual(after['versions'],[])
        self.assertEqual(after['supply'],[])
        self.assertTrue(after['game_test_runs'][0]['passed'])
        self.assertTrue(verification_gaps(saved,dict(result,spec_digest='stale')))
        with self.assertRaises(ApiError):
            self.s.mutate('/api/candidates/'+c['id']+'/spec-test-report',
                          dict(job_id=j['id'],report=dict(result,spec_digest='stale')))

    def test_contract_requires_assertions_and_keeps_unknowns_blocked(self):
        value=spec()
        value['cases'][0]['steps']=[dict(type='click',selector='#start')]
        with self.assertRaises(ValueError):normalize(value)
        value=spec();value['unknowns']=['关卡参数未知']
        self.assertTrue(verification_gaps(value,dict(spec_digest=digest(value),
            cases=[dict(id='start',status='passed',evidence=['start.png'])])))

    def test_browser_runner_does_not_pass_blocked_cases(self):
        folder=Path(self.f.tmp.name)
        server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(Path('tests/fixtures/supply-game').resolve())))
        threading.Thread(target=server.serve_forever,daemon=True).start()
        try:
            value=spec()
            value['cases'].append(dict(id='missing-data',mode='blocked',expected='胜负结算',reason='缺配置',steps=[]))
            value=normalize(value)
            inp=folder/'input.json'
            inp.write_text(json.dumps(dict(url=f'http://127.0.0.1:{server.server_port}',spec=value)),'utf-8')
            node=node_binary()
            result=subprocess.run([str(node),'executors/spec_test.cjs',str(inp),str(folder/'result')],capture_output=True,text=True,timeout=45)
            self.assertEqual(result.returncode,2,result.stderr)
            report=json.loads((folder/'result/spec-tests.json').read_text('utf-8'))
            self.assertEqual([c['status'] for c in report['cases']],['passed','blocked'])
            self.assertFalse(report['passed'])
        finally:server.shutdown();server.server_close()

    def test_storage_assertion_survives_reload_and_wrong_value_fails(self):
        folder=Path(self.f.tmp.name)
        (folder/'index.html').write_text(
            '<button id="win" onclick=\'localStorage.setItem("save",JSON.stringify({stage:2}))\'>win</button>',
            'utf-8')
        server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(folder)))
        threading.Thread(target=server.serve_forever,daemon=True).start()
        try:
            value=spec()
            steps=[dict(type='click',selector='#win'),dict(type='reload'),
                   dict(type='expect_storage',key='save',path='stage',value=2)]
            value['cases']=[dict(id='persisted',mode='browser',expected='saved stage survives reload',steps=steps),
                dict(id='wrong-state',mode='browser',expected='wrong state must fail',
                     steps=[dict(type='expect_storage',key='save',path='stage',value=3)])]
            value=normalize(value)
            inp=folder/'input.json'
            inp.write_text(json.dumps(dict(url=f'http://127.0.0.1:{server.server_port}',spec=value)),'utf-8')
            node=node_binary()
            result=subprocess.run([str(node),'executors/spec_test.cjs',str(inp),str(folder/'result')],capture_output=True,text=True,timeout=45)
            self.assertEqual(result.returncode,2,result.stderr)
            report=json.loads((folder/'result/spec-tests.json').read_text('utf-8'))
            self.assertEqual([c['status'] for c in report['cases']],['passed','failed'])
        finally:server.shutdown();server.server_close()
