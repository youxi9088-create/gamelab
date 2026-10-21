import unittest
from controlplane.dashboard import production_metrics


class DashboardTests(unittest.TestCase):
    def test_evidence_dedup_and_reserved_templates(self):
        state = dict(
            sources=[{'url': 'https://www.example.org/games'}, {'url': 'https://example.org/other'}],
            candidates=[
                {'id': 'a', 'url': 'https://example.org/a', 'source_bundle_id': 'bundle'},
                {'id': 'b', 'url': 'https://example.org/b', 'acquired_at': 'page-only'},
                {'id': 'hidden', 'url': 'https://example.org/test', 'observations': {'catalog_hidden': True}}],
            recommendations=[
                {'url': 'https://example.org/a?utm_source=scan', 'content_sha256': 'hash'},
                {'url': 'https://example.org/test', 'content_sha256': 'hash'},
                {'url': 'https://example.org/unread'}],
            jobs=[{'id': 'job', 'candidate_id': 'a', 'report': {'rea_attempted': True}}],
            versions=[
                {'candidate_id': 'a', 'artifact_id': 'one', 'report': {'path': 'B'}},
                {'candidate_id': 'a', 'artifact_id': 'two', 'report': {'tool': 'external-coding-agent'}},
                {'candidate_id': 'b', 'artifact_id': 'import', 'report': {'runtime_verified': True}},
                {'candidate_id': 'hidden', 'artifact_id': 'test', 'report': {'path': 'B'}}])
        m = production_metrics(state)
        self.assertEqual([m[k] for k in ('websites', 'analyzed', 'acquired', 'generated', 'templates')], [1, 1, 1, 1, None])

    def test_local_import_and_event_evidence(self):
        state = dict(candidates=[{'id': 'a', 'url': '#小程序://游戏/abc'}],
                     jobs=[{'id': 'j', 'candidate_id': 'a'}],
                     events=[{'job_id': 'j', 'node': 'analysis', 'node_status': 'succeeded'}],
                     versions=[{'candidate_id': 'a', 'artifact_id': 'local',
                                'report': {'source_recovered': True}}])
        m = production_metrics(state)
        self.assertEqual((m['analyzed'], m['acquired'], m['generated']), (1, 1, 0))

    def test_no_output_is_not_generated(self):
        m = production_metrics(dict(jobs=[{'id': 'j', 'candidate_id': 'a', 'report': {'path': 'B'}}],
                                    candidates=[{'id': 'a', 'url': 'https://example.org/a'}]))
        self.assertEqual(m['generated'], 0)
