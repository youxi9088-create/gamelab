from controlplane.runtime import node_binary
import hashlib
import os
from pathlib import Path
import tempfile
import unittest
import subprocess
import threading
from unittest.mock import patch
import test_platform
from controlplane.supply import SupplyWorker, SupplyError, build_archive, signature, PREFIX
from server import build_server


class SupplyTests(unittest.TestCase):
    def setUp(self):
        self.fixture = test_platform.PlatformTest()
        self.fixture.setUp()
        self.addCleanup(self.fixture.doCleanups)
        self.s = self.fixture.s
        env = patch.dict(os.environ, {'SUPPLY_CONFIG_FILE': str(self.s.data_dir/'absent-config.json')})
        env.start()
        self.addCleanup(env.stop)
        publisher=patch('controlplane.supply_distribution.publish',side_effect=lambda archive,digest,config:config.get('SUPPLY_ARCHIVE_BASE_URL','https://files.example/games').rstrip('/')+'/'+Path(archive).name)
        publisher.start();self.addCleanup(publisher.stop)

    def approved(self, metadata=None):
        self.fixture.enqueue()
        job = self.fixture.completion(self.fixture.claim(), report={'supply': metadata or {}})
        vid = job['version_id']
        self.s.mutate('/api/versions/'+vid+'/approve', {'checks': {'gameplay': True, 'visual': True}})
        return vid

    def config(self):
        return patch.dict(os.environ, dict(SUPPLY_PLATFORM_BASE='https://platform.example',
            SUPPLY_APP_ID='sup_fixture', SUPPLY_APP_SECRET='fixture-secret',
            SUPPLY_EXPECTED_FINGERPRINT=hashlib.sha256(b'fixture-secret').hexdigest()[:12],
            SUPPLY_ARCHIVE_DIR=str(self.s.data_dir/'public'),
            SUPPLY_ARCHIVE_BASE_URL='https://files.example/games'))

    def due(self, vid):
        with self.s.store.tx() as db:
            row = self.s.get(db, 'supply', vid)
            row['next_poll'] = 0
            self.s.store.put(db, 'supply', row)

    def test_official_signature_vectors(self):
        secret = '0123456789abcdef'*4
        args = (secret, 'sup_0123456789abcdef', '1760000000', 'nonce000000000000000001')
        self.assertEqual(signature(*args, 'POST', PREFIX+'/extraction/submit',
            b'{"submission_id":"demo-0000000000000001"}'),
            'e97806d91bb849a7ceceb913eab5303df903f2ae62dc3eec2a4a7dd0bee7a560')
        self.assertEqual(signature(*args, 'GET', PREFIX+'/extraction/issues?since_seq=3&submission_id=demo-0000000000000001', b''),
            '3ca0df4e3037f539e47ab83b3b4013ecdc9408930b8fa5b641ba7c4e601ca6e7')

    def test_updated_checker_rechecks_local_block_once_without_new_submission(self):
        vid=self.approved({'license_declaration':{'distributable':'yes','owner':'Fixture'}})
        with self.s.store.tx() as db:
            row=self.s.get(db,'supply',vid)
            row.update(status='blocked',error_code='MISSING_LOCAL_RESOURCE',next_poll=0)
            original_id=row['submission_id'];self.s.store.put(db,'supply',row)
        ordinary=self.approved({'license_declaration':{'distributable':'yes','owner':'Fixture'}})
        calls=[]
        def client(method,route,**kwargs):
            calls.append(route)
            return {'app_id':'sup_fixture'}
        worker=SupplyWorker(self.s,client)
        with self.config(),patch('controlplane.supply.build_archive',side_effect=SupplyError('MISSING_LOCAL_RESOURCE',422)) as build:
            worker.tick(package_recheck_only=True);self.due(vid);worker.tick(package_recheck_only=True)
            self.assertEqual(build.call_count,1)
        with self.s.store.read() as db:
            row=self.s.get(db,'supply',vid)
            self.assertEqual(self.s.get(db,'supply',ordinary)['status'],'pending')
        self.assertEqual(row['status'],'blocked')
        self.assertTrue(row['package_check_revision'])
        self.assertEqual(row['submission_id'],original_id)
        self.assertNotIn('extraction/submit',calls)

    def test_approval_persists_outbox_and_rights_block_does_not_undo_acceptance(self):
        vid = self.approved()
        called = []
        SupplyWorker(self.s, lambda *a, **k: called.append(a)).tick()
        state = self.s.state()
        self.assertEqual(state['supply'][0]['error_code'], 'LICENSE_UNDECLARED')
        self.assertEqual(state['versions'][0]['status'], 'approved')
        self.assertEqual(called, [])
        self.assertNotIn('metadata', state['supply'][0])
        self.assertIsNone(state['metrics']['production']['templates'])

    def test_submit_retry_same_id_and_poll_terminal(self):
        vid = self.approved({'license_declaration': {'distributable': 'yes', 'owner': 'Fixture owner'}})
        payloads = []
        def client(method, route, payload=None, query=None):
            if route == 'whoami':
                return {'app_id': 'sup_fixture'}
            if route == 'extraction/submit':
                payloads.append(payload)
                if len(payloads) == 1:
                    raise SupplyError('NETWORK_ERROR')
                return {'submission_id': payload['submission_id'], 'state': 'queued'}
            if route == 'extraction/status':
                return {'submission_id': query['submission_id'], 'state': 'needs_your_fix',
                        'revision': 1, 'notice': '请修改入口', 'next_action': 'supplier'}
            return {'revision': 1, 'items': [{'seq': 1, 'code': 'NEW_CODE', 'severity': 'blocker',
                                             'title': '入口问题', 'suggestion': '修复入口'}], 'max_seq': 1, 'total': 1}
        worker = SupplyWorker(self.s, client)
        with self.config():
            worker.tick()
            self.assertEqual(self.s.state()['supply'][0]['status'], 'retrying')
            self.due(vid);worker.tick()
            self.assertEqual(payloads[0], payloads[1])
            self.due(vid);worker.tick()
        row = self.s.state()['supply'][0]
        self.assertEqual(row['status'], 'done')
        self.assertEqual(row['next_action'], 'supplier')
        self.assertEqual(len(row['issues']), 1)
        self.assertEqual(self.s.state()['versions'][0]['status'], 'approved')

    def test_platform_failure_is_rechecked_without_resubmission(self):
        vid=self.approved({'license_declaration':{'distributable':'yes','owner':'Fixture'}})
        with self.s.store.tx() as db:
            row=self.s.get(db,'supply',vid);row.update(submitted=True,status='done',state='failed',next_action='platform',next_poll=0);self.s.store.put(db,'supply',row)
        calls=[]
        def client(method,route,**kwargs):
            calls.append((method,route));self.assertEqual(method,'GET')
            if route=='extraction/status':return {'submission_id':row['submission_id'],'state':'failed','next_action':'platform','revision':1}
            return {'revision':1,'items':[],'total':0}
        with self.config():SupplyWorker(self.s,client).tick()
        result=self.s.state()['supply'][0]
        self.assertEqual(result['status'],'done')
        from controlplane.supply import STATUS_SYNC_REVISION
        self.assertEqual(result['status_sync_revision'],STATUS_SYNC_REVISION)
        self.assertEqual(calls,[('GET','extraction/status'),('GET','extraction/issues')])
        SupplyWorker(self.s,lambda *a,**k:self.fail('Fresh terminal state was polled again')).tick()

    def test_delivery_metadata_and_long_name_survive_unknown_submit_outcome(self):
        vid=self.approved({'license_declaration':{'distributable':'yes','owner':'Fixture'}})
        with self.s.store.tx() as db:
            v=self.s.get(db,'versions',vid);v.setdefault('report',{})['acceptance_actions']=[{'type':'click','selector':'#start'}];self.s.store.put(db,'versions',v)
            c=self.s.get(db,'candidates',v['candidate_id']);c['title']='Long verified game title '*5;self.s.store.put(db,'candidates',c)
        payloads=[]
        def client(method,route,payload=None,**kw):
            if route=='whoami':return {'app_id':'sup_fixture'}
            payloads.append(payload)
            if len(payloads)==1:raise SupplyError('NETWORK_ERROR')
            return {'submission_id':payload['submission_id'],'state':'queued'}
        worker=SupplyWorker(self.s,client)
        with self.config():worker.tick();self.due(vid);worker.tick()
        self.assertEqual(payloads[0],payloads[1]);self.assertLessEqual(len(payloads[0]['game_name']),40)
        self.assertEqual(payloads[0]['acceptance_steps'][0]['target'],'#start')

    def test_review_preparation_finds_rights_and_config_before_acceptance(self):
        from controlplane.supply_preparation import prepare_one_review
        self.fixture.enqueue();job=self.fixture.completion(self.fixture.claim());vid=job['version_id']
        prepare_one_review(self.s)
        with self.s.store.read() as db:
            row=self.s.store.get(db,'supply_preparations',vid)
            self.assertEqual(self.s.store.get(db,'versions',vid)['status'],'review')
            self.assertEqual(self.s.store.all(db,'supply'),[])
        self.assertEqual({x['code'] for x in row['blockers']},{'LICENSE_UNDECLARED','CONFIG_REQUIRED'})
        self.assertEqual(row['package'],'passed_static_checks');self.assertFalse(row['submission_sent'])

    def test_review_scan_allows_concurrent_executor_write(self):
        import sqlite3
        from contextlib import contextmanager
        from controlplane.supply_preparation import prepare_one_review
        self.fixture.enqueue();self.fixture.completion(self.fixture.claim())
        original_read=self.s.store.read;observed=[];errors=[]
        def trace(sql):
            if "kind='versions'" not in sql:return
            try:
                with sqlite3.connect(self.s.store.path,timeout=0.05) as writer:
                    writer.execute('BEGIN IMMEDIATE')
                    writer.execute("INSERT INTO records VALUES ('probe','heartbeat','{}')")
                observed.append(True)
            except Exception as exc:errors.append(str(exc))
        @contextmanager
        def read():
            with original_read() as db:
                db.set_trace_callback(trace)
                yield db
        with patch.object(self.s.store,'read',read):prepare_one_review(self.s)
        self.assertEqual(errors,[]);self.assertEqual(observed,[True])

    def test_explicit_status_sync_preserves_terminal_payload_and_acceptance(self):
        vid=self.approved({'license_declaration':{'distributable':'yes','owner':'Fixture'}})
        with self.s.store.tx() as db:
            row=self.s.get(db,'supply',vid);row.update(submitted=True,status='done',state='published',archive_sha256='a'*64,payload_sha256='b'*64);self.s.store.put(db,'supply',row)
        result=self.s.mutate('/api/supply/'+vid+'/sync',{})['supply']
        self.assertEqual(result['state'],'published');self.assertTrue(result['submitted']);self.assertEqual(result['status'],'tracking')
        self.assertEqual(result['submission_id'],row['submission_id']);self.assertEqual(result['payload_sha256'],'b'*64)
        self.assertEqual(next(v for v in self.s.state()['versions'] if v['id']==vid)['status'],'approved')

    def test_configuration_missing_blocks_without_network(self):
        self.approved({'license_declaration': {'distributable': 'yes', 'owner': 'Fixture'}})
        with patch.dict(os.environ, {'SUPPLY_CONFIG_FILE': str(self.s.data_dir/'absent-config.json')}, clear=True):
            SupplyWorker(self.s, lambda *a, **k: self.fail('unexpected request')).tick()
        self.assertEqual(self.s.state()['supply'][0]['error_code'], 'CONFIG_REQUIRED')

    def test_rate_limit_survives_worker_restart_and_locks_submission(self):
        vid = self.approved({'license_declaration': {'distributable': 'yes', 'owner': 'Fixture'}})
        submitted = []
        def client(method, route, payload=None, query=None):
            if route == 'whoami':
                return {'app_id': 'sup_fixture'}
            submitted.append(payload['submission_id'])
            if len(submitted) == 1:
                raise SupplyError('RATE_LIMITED', 429, 120)
            return {'submission_id': payload['submission_id'], 'state': 'queued'}
        with self.config():
            SupplyWorker(self.s, client).tick()
            self.assertEqual(self.s.state()['supply'][0]['status'], 'retrying')
            with self.assertRaises(test_platform.ApiError):
                self.s.mutate('/api/supply/'+vid+'/metadata', {'metadata': {
                    'license_declaration': {'distributable': 'yes', 'owner': 'Changed'}}})
            self.due(vid)
            SupplyWorker(self.s, client).tick()
        self.assertEqual(submitted[0], submitted[1])
        self.assertEqual(self.s.state()['supply'][0]['status'], 'tracking')

    def test_metadata_update_resumes_and_is_audited(self):
        vid = self.approved()
        SupplyWorker(self.s).tick()
        self.s.mutate('/api/supply/'+vid+'/metadata', {'metadata': {
            'license_declaration': {'distributable': 'yes', 'owner': 'Fixture'}}})
        self.assertEqual(self.s.state()['supply'][0]['status'], 'pending')
        self.assertTrue(any(e.get('action') == 'metadata' for e in self.s.state()['events']))

    def test_archive_deterministic_and_rejects_unsupported_packages(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)/'source';root.mkdir()
            (root/'index.html').write_text('<html>fixture</html>')
            out = Path(d)/'out.zip'
            digest = build_archive(root, out)
            self.assertEqual(digest, hashlib.sha256(out.read_bytes()).hexdigest())
            self.assertEqual(digest, build_archive(root, out))
            (root/'engine.wasm').write_bytes(b'wasm')
            with self.assertRaises(SupplyError):
                build_archive(root, out)
            (root/'engine.wasm').unlink()
            (root/'index.html').write_text('<iframe src="http://127.0.0.1:9999/"></iframe>')
            with self.assertRaises(SupplyError) as error:
                build_archive(root, out)
            self.assertEqual(error.exception.code, 'EXTERNAL_DEPENDENCY')

    def test_no_historical_backfill(self):
        self.assertEqual(self.s.state()['supply'], [])
        with self.s.store.tx() as db:
            self.s.store.put(db, 'versions', dict(id='historical', candidate_id='gone', status='approved'))
        SupplyWorker(self.s, lambda *a, **k: self.fail('unexpected submit')).tick()
        self.assertEqual(self.s.state()['supply'], [])

    def test_supply_ui_and_metadata_resume(self):
        self.approved()
        SupplyWorker(self.s).tick()
        server=build_server(self.s,0)
        threading.Thread(target=server.serve_forever,daemon=True).start()
        try:
            node=node_binary()
            result=subprocess.run([str(node),'tools/check_supply_ui.cjs',f'http://127.0.0.1:{server.server_port}'],
                                  capture_output=True,text=True,timeout=60)
            self.assertEqual(result.returncode,0,result.stderr)
        finally:
            server.shutdown();server.server_close()
