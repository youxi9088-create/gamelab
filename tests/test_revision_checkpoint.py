import hashlib
import json
import uuid
import unittest
from pathlib import Path
import test_conversations
from controlplane.service import ApiError


class RevisionCheckpointTests(unittest.TestCase):
    def setUp(self):
        self.fixture = test_conversations.ConversationsTest()
        self.fixture.setUp()
        self.addCleanup(self.fixture.doCleanups)
        self.s = self.fixture.s
        self.tool = self.fixture.tool
        self.reply = self.fixture.reply
        self.claim = self.fixture.claim

    def checkpoint(self, job):
        root = Path(__file__).resolve().parents[1] / 'executors' / 'runs' / str(uuid.uuid4())
        root.mkdir()
        def cleanup():
            for name in ('job-binding.json', 'revision-checkpoint.json'):
                (root / name).unlink(missing_ok=True)
            root.rmdir()
        self.addCleanup(cleanup)
        (root / 'job-binding.json').write_text(json.dumps({'job_id': job['id'], 'lease_sha256': hashlib.sha256(job['lease_token'].encode()).hexdigest()}))
        raw = b'{"fixture":true}'
        (root / 'revision-checkpoint.json').write_bytes(raw)
        return {'run': root.name, 'sha256': hashlib.sha256(raw).hexdigest(), 'base_version_id': job['base_version_id']}

    def complete_checkpoint(self, job, cp):
        return self.s.mutate('/api/v1/jobs/' + job['id'] + '/complete', {'lease_token': job['lease_token'], 'outcome': 'checkpoint', 'checkpoint': cp}, self.tool)['job']

    def test_checkpoint_preserves_round_version_and_releases_lease(self):
        self.reply(); job = self.claim(); cp = self.checkpoint(job)
        result = self.complete_checkpoint(job, cp)
        self.assertEqual(result['status'], 'queued')
        self.assertEqual(result['round'], job['round'])
        self.assertEqual(len(self.s.state()['versions']), 1)
        with self.assertRaises(ApiError): self.complete_checkpoint(job, cp)
        resumed = self.claim()
        self.assertEqual(resumed['revision_checkpoint'], cp)
        self.assertNotEqual(resumed['lease_token'], job['lease_token'])

    def test_checkpoint_rejects_tampering_and_honors_pause(self):
        self.reply(); job = self.claim(); cp = self.checkpoint(job)
        with self.assertRaises(ApiError): self.complete_checkpoint(job, {**cp, 'sha256': 'bad'})
        self.s.mutate('/api/batches/' + job['batch_id'] + '/pause', {})
        self.complete_checkpoint(job, cp)
        self.assertIsNone(self.claim())

    def test_checkpoint_bound_and_retry_retains_saved_work(self):
        self.reply()
        for i in range(3):
            job = self.claim(); cp = self.checkpoint(job)
            result = self.complete_checkpoint(job, cp)
            self.assertEqual(result['status'], 'blocked' if i == 2 else 'queued')
        self.assertEqual(result['blocker']['code'], 'REVISION_EXECUTION_LIMIT')
        result = self.s.mutate('/api/jobs/' + job['id'] + '/retry', {})['job']
        self.assertEqual(result['revision_checkpoint'], cp)
        self.assertNotIn('checkpoint_slices', result)
