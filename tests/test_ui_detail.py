import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from controlplane.store import Store
from controlplane.ui_detail import candidate_detail


class UIDetailTests(unittest.TestCase):
    def test_only_requested_game_evidence_and_no_global_state_build(self):
        with tempfile.TemporaryDirectory() as folder:
            store = Store(Path(folder) / 'db.sqlite3')
            with store.tx() as db:
                for cid in ('a', 'b'):
                    store.put(db, 'candidates', {'id': cid, 'title': cid})
                    store.put(db, 'versions', {'id': 'v'+cid, 'candidate_id': cid,
                        'status': 'review', 'report': {'files': ['original-'+cid], 'runtime_verified': True}})
                    store.put(db, 'events', {'id': 'e'+cid, 'candidate_id': cid, 'message': 'evidence-'+cid})
                store.put(db, 'game_profiles', {'id': 'va', 'profile': {'rules': ['original rules']}})
            service = SimpleNamespace(store=store)
            value = candidate_detail(service, 'a')
            self.assertEqual([r['id'] for r in value['candidates']], ['a'])
            self.assertEqual([r['id'] for r in value['events']], ['ea'])
            self.assertEqual(value['versions'][0]['report']['files'], ['original-a'])
            self.assertEqual(value['versions'][0]['game_profile']['rules'], ['original rules'])
            self.assertTrue(all(not rows for rows in candidate_detail(service, 'missing').values()))

    def test_job_linked_legacy_event_is_preserved_and_lease_secret_removed(self):
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as folder:
            store = Store(Path(folder) / 'db.sqlite3')
            with store.tx() as db:
                store.put(db, 'candidates', {'id': 'a'})
                store.put(db, 'jobs', {'id': 'ja', 'candidate_id': 'a', 'lease_token': 'private'})
                store.put(db, 'events', {'id': 'legacy', 'job_id': 'ja', 'message': 'real evidence'})
                store.put(db, 'events', {'id': 'other', 'job_id': 'jb', 'message': 'unrelated'})
            with patch('controlplane.pipeline.timeline', return_value={'nodes': []}), patch('controlplane.pipeline.progress_summary', return_value='status'):
                value = candidate_detail(SimpleNamespace(store=store), 'a')
            self.assertEqual([r['id'] for r in value['events']], ['legacy'])
            self.assertNotIn('lease_token', value['jobs'][0])


if __name__ == '__main__':
    unittest.main()
