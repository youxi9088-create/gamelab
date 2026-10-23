import json
import tempfile
import unittest
import threading
import subprocess
from unittest.mock import patch
from pathlib import Path
from controlplane.accounts import Accounts,authorize
from controlplane.service import Service,ApiError
from controlplane.store import ACTOR
from tools.production_data import backup,restore,verify,backup_capacity


class CloudProductionTests(unittest.TestCase):
    def test_http_accounts_and_page(self):
        from server import build_server
        from controlplane.runtime import node_binary
        with patch.dict('os.environ',{'PORTAL_ADMIN_USERNAME':'','PORTAL_ADMIN_PASSWORD':''}):server=build_server(self.s,0)
        threading.Thread(target=server.serve_forever,daemon=True).start()
        try:
            result=subprocess.run([node_binary(),'tools/check_accounts_ui.cjs',f'http://127.0.0.1:{server.server_port}'],capture_output=True,text=True,timeout=60)
            self.assertEqual(result.returncode,0,result.stderr)
            import urllib.request,urllib.error,http.cookiejar
            client=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
            base=f'http://127.0.0.1:{server.server_port}'
            def post(path,body,csrf=''):
                return client.open(urllib.request.Request(base+path,json.dumps(body).encode(),{'Content-Type':'application/json','X-CSRF-Token':csrf}))
            with post('/api/auth/login',{'username':'viewer-fixture','password':'fixture-viewer-password'}) as r:csrf=json.load(r)['csrf']
            with self.assertRaises(urllib.error.HTTPError) as error:post('/api/conversions',{'url':'https://example.org/forbidden'},csrf)
            self.assertEqual(error.exception.code,403)
            with self.assertRaises(urllib.error.HTTPError):client.open(base+'/api/accounts')
            with post('/api/auth/logout',{},csrf) as r:self.assertEqual(r.status,200)
        finally:server.shutdown();server.server_close()

    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.root=Path(self.temp.name)/'shared'
        self.s=Service(self.root/'data',self.root/'game-library','http://127.0.0.1:8766')
        self.accounts=Accounts(self.s.store,'admin','fixture-admin-password')
        self.admin=self.accounts.list()[0]

    def tearDown(self):self.temp.cleanup()

    def test_password_not_plain_and_sessions_survive_restart(self):
        token,session=self.accounts.login('admin','fixture-admin-password')
        other=Accounts(self.s.store,'admin','changed-bootstrap-does-not-reset')
        self.assertEqual(other.session(token)['user']['id'],self.admin['id'])
        with self.s.store.tx() as db:
            row=self.s.store.get(db,'users',self.admin['id'])
            self.assertNotIn('fixture-admin-password',json.dumps(row))
            self.assertIsNone(self.s.store.get(db,'portal_sessions',token))
        self.assertIsNone(other.login('admin','changed-bootstrap-does-not-reset'))

    def test_disable_and_password_change_revoke_sessions(self):
        user=self.accounts.save(dict(username='operator',role='operator',password='fixture-operator-password'),self.admin)
        token,_=self.accounts.login('operator','fixture-operator-password')
        self.accounts.save(dict(id=user['id'],enabled=False),self.admin)
        self.assertIsNone(self.accounts.session(token))
        self.assertIsNone(self.accounts.login('operator','fixture-operator-password'))

    def test_last_admin_cannot_be_removed(self):
        with self.assertRaises(ApiError):self.accounts.save(dict(id=self.admin['id'],enabled=False),self.admin)

    def test_roles_enforced(self):
        for path in ['/api/accounts/save','/api/services/ai/save','/api/settings','/api/operations/drain','/api/versions/v/approve']:
            with self.assertRaises(ApiError):authorize({'role':'operator'},path,True)
        authorize({'role':'operator'},'/api/conversions',True)
        authorize({'role':'viewer'},'/api/auth/logout',True)
        with self.assertRaises(ApiError):authorize({'role':'viewer'},'/api/conversions',True)
        with self.assertRaises(ApiError):authorize({'role':'viewer'},'/api/accounts')

    def test_actor_and_maintenance_claim(self):
        token=ACTOR.set(self.admin)
        try:job=self.s.mutate('/api/conversions',{'url':'https://example.org/cloud-fixture'})['job']
        finally:ACTOR.reset(token)
        self.assertEqual(job['created_by'],self.admin['id'])
        tool=self.s.mutate('/api/tools',{'name':'fixture','capabilities':['rea']})['tool']
        with self.s.store.tx() as db:self.s.store.put(db,'settings',{'id':'maintenance','draining':True})
        self.assertIsNone(self.s.mutate('/api/v1/jobs/claim',{'capabilities':['rea']},tool)['job'])

    def test_backup_restore_complete(self):
        with self.s.store.tx() as db:self.s.store.put(db,'settings',{'id':'maintenance','draining':True})
        p=self.root/'runs/fixture/evidence.txt';p.parent.mkdir(parents=True);p.write_text('isolated evidence')
        archive=Path(self.temp.name)/'backup.zip'
        result=backup(self.root,archive);self.assertTrue(result['verified'])
        target=Path(self.temp.name)/'restored';restore(archive,target)
        self.assertEqual((target/'runs/fixture/evidence.txt').read_text(),'isolated evidence')
        self.assertTrue((target/'data/platform.sqlite3').exists())
        with self.assertRaises(ValueError):restore(archive,target)

    def test_backup_refuses_active_or_undrained(self):
        with self.assertRaises(ValueError):backup(self.root,Path(self.temp.name)/'backup.zip')

    def test_backup_capacity_refuses_insufficient_space_without_mutation(self):
        from types import SimpleNamespace
        before=(self.root/'data/platform.sqlite3').read_bytes()
        with patch('tools.production_data.shutil.disk_usage',return_value=SimpleNamespace(free=1)):
            with self.assertRaisesRegex(ValueError,'空间不足'):
                backup_capacity(self.root,self.root.parent)
        self.assertEqual((self.root/'data/platform.sqlite3').read_bytes(),before)
        with patch('tools.production_data.shutil.disk_usage',return_value=SimpleNamespace(free=10**12)):
            result=backup_capacity(self.root,self.root.parent)
        self.assertGreater(result['required_bytes'],result['source_bytes'])


if __name__=='__main__':unittest.main()
