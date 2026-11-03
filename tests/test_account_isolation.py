import tempfile
import unittest
from pathlib import Path
from controlplane.accounts import Accounts, isolated_store, actor_names
from controlplane.store import Store


class AccountIsolationTests(unittest.TestCase):
    def test_login_and_session_do_not_wait_for_platform_writer(self):
        with tempfile.TemporaryDirectory() as d:
            platform=Store(Path(d)/'platform.db')
            Accounts(platform,'preview-admin','isolated-fixture-password')
            auth=isolated_store(platform,Path(d)/'accounts.db')
            account=Accounts(auth)
            with platform.tx() as busy:
                busy.execute("INSERT INTO records VALUES('busy','one','{}')")
                logged=account.login('preview-admin','isolated-fixture-password')
                self.assertIsNotNone(logged)
                token,session=logged
                self.assertEqual(account.session(token)['user']['role'],'admin')
                account.logout(token)
                self.assertIsNone(account.session(token))
            with platform.read() as db:
                self.assertEqual(platform.all(db,'portal_sessions'),[])

    def test_migration_never_replaces_current_password_and_session_revision(self):
        with tempfile.TemporaryDirectory() as d:
            platform=Store(Path(d)/'platform.db')
            Accounts(platform,'preview-admin','old-fixture-password')
            path=Path(d)/'accounts.db';auth=isolated_store(platform,path)
            account=Accounts(auth)
            self.assertIsNone(account.login('preview-admin','wrong-password'))
            token,session=account.login('preview-admin','old-fixture-password')
            account.save({'id':session['user']['id'],'password':'new-fixture-password'},session['user'])
            self.assertIsNone(account.session(token))
            same=Accounts(isolated_store(platform,path))
            self.assertIsNone(same.login('preview-admin','old-fixture-password'))
            self.assertIsNotNone(same.login('preview-admin','new-fixture-password'))

    def test_new_private_accounts_keep_task_actor_names_without_mirroring_hashes(self):
        with tempfile.TemporaryDirectory() as d:
            platform=Store(Path(d)/'platform.db')
            Accounts(platform,'preview-admin','fixture-admin-password')
            auth=isolated_store(platform,Path(d)/'portal-accounts.sqlite3')
            accounts=Accounts(auth);admin=accounts.list()[0]
            user=accounts.save({'username':'operator','role':'operator','password':'fixture-operator-password'},admin)
            with platform.read() as db:
                self.assertEqual(len(platform.all(db,'users')),1)
                self.assertEqual(actor_names(platform,db)[user['id']],'operator')
