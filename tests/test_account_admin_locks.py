import http.cookiejar
import json
import os
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch
from controlplane.accounts import Accounts
from controlplane.store import Store
from server import build_server


class AccountAdminLockTests(unittest.TestCase):
    def test_create_viewer_and_permissions_while_task_database_is_write_locked(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder); main=Store(root/'platform.sqlite3')
            Accounts(main,'fixture-admin','fixture-admin-password')
            service=SimpleNamespace(store=main,data_dir=root,runs_dir=root/'runs',
                repo=SimpleNamespace(root=root,artifacts=root/'artifacts'))
            env={'PORTAL_AUTH_DB':str(root/'accounts.sqlite3'), 'PORTAL_ADMIN_USERNAME':'',
                 'PORTAL_ADMIN_PASSWORD':'', 'PORTAL_PUBLIC_ORIGIN':''}
            with patch.dict(os.environ,env):
                server=build_server(service,0)
                thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
                base=f'http://127.0.0.1:{server.server_port}'
                def client():
                    return urllib.request.build_opener(urllib.request.ProxyHandler({}),
                        urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
                def request(op,path,body=None,csrf=''):
                    data=json.dumps(body).encode() if body is not None else None
                    headers={'Content-Type':'application/json','X-CSRF-Token':csrf}
                    with op.open(urllib.request.Request(base+path,data=data,headers=headers),timeout=5) as response:
                        return json.load(response)
                try:
                    with main.tx() as held:
                        held.execute("INSERT INTO records VALUES('busy','one','{}')")
                        admin=client();session=request(admin,'/api/auth/login',
                            {'username':'fixture-admin','password':'fixture-admin-password'})
                        request(admin,'/api/operations')
                        user=request(admin,'/api/accounts/save',{'username':'fixture-reader','role':'viewer',
                            'password':'fixture-reader-password'},session['csrf'])['user']
                        self.assertEqual(user['role'],'viewer')
                        reader=client();viewer=request(reader,'/api/auth/login',
                            {'username':'fixture-reader','password':'fixture-reader-password'})
                        self.assertEqual(viewer['user']['role'],'viewer')
                        for path,body in [('/api/accounts',None),('/api/conversions',{'url':'https://example.org'})]:
                            with self.assertRaises(urllib.error.HTTPError) as error:
                                request(reader,path,body,viewer['csrf'])
                            self.assertEqual(error.exception.code,403)
                finally:
                    server.shutdown();server.server_close();thread.join(5)
