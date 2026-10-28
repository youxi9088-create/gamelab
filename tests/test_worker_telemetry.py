"""Telemetry reported by the executor must satisfy the pipeline node contract.

A rejected telemetry post once aborted whole jobs: the invalid-checkpoint branch
sent a node without a node_status and the server answered 400, which the worker
treated as a fatal conversion error.
"""
import re
import tempfile
import unittest
from pathlib import Path

from controlplane.service import ApiError, Service

WORKER = Path(__file__).resolve().parents[1] / 'executors' / 'worker.py'


class TelemetryContractTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        root = Path(self.temp.name)
        self.service = Service(root / 'data', root / 'repo', 'http://127.0.0.1:0',
                               runs_dir=root / 'data' / 'runs')
        with self.service.store.tx() as db:
            store = self.service.store
            store.put(db, 'settings', {'id': 'main', 'lease_seconds': 300})
            store.put(db, 'tools', {'id': 'tool-1', 'name': 'worker'})
            store.put(db, 'candidates', {'id': 'c', 'title': 'sample', 'url': 'https://example.test/g'})
            store.put(db, 'batches', {'id': 'b', 'candidate_ids': ['c']})
            store.put(db, 'jobs', {'id': 'j', 'candidate_id': 'c', 'batch_id': 'b',
                                   'status': 'running', 'stage': 'rea', 'tool_id': 'tool-1', 'progress': 0,
                                   'lease_token': 'lease-1', 'lease_expires_at': '2999-01-01T00:00:00+00:00'})
        self.tool = {'id': 'tool-1'}

    def tearDown(self):
        self.temp.cleanup()

    def post(self, body):
        return self.service.mutate('/api/v1/jobs/j/events', dict(body, lease_token='lease-1'), self.tool)

    def test_node_without_status_is_rejected(self):
        with self.assertRaises(ApiError) as caught:
            self.post({'node': 'identify', 'message': 'checkpoint unusable'})
        self.assertEqual(caught.exception.status, 400)

    def test_node_with_status_is_accepted(self):
        result = self.post({'node': 'identify', 'node_status': 'skipped', 'message': 'checkpoint unusable'})
        self.assertTrue(result['ok'])
        self.assertTrue(result['lease_expires_at'])

    def test_worker_never_reports_a_node_without_a_status(self):
        source = WORKER.read_text('utf-8')
        calls = re.findall(r"client\.post\((?:prefix\s*\+\s*)?'events'[^)]*\)", source, re.S)
        self.assertTrue(calls, 'expected worker telemetry posts')
        for call in calls:
            if re.search(r"'node'\s*:", call):
                self.assertRegex(call, r"'node_status'\s*:",
                                 'telemetry post must carry a node_status: ' + call[:160])


if __name__ == '__main__':
    unittest.main()
