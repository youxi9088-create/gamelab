import copy
import unittest
import threading
import time
import uuid
from controlplane.ui_state import summary, detail


class UIStateTests(unittest.TestCase):
    def fixture(self):
        return {'metrics': {'accepted_games': 12}, 'usage': {'day': {'tokens': 99}},
                'candidates': [{'id': 'a', 'observations': {'raw': 'x'*100000}}, {'id': 'b'}],
                'jobs': [{'id': 'j', 'candidate_id': 'a', 'status': 'blocked',
                          'report': {'runtime_verified': False, 'files': ['evidence']},
                          'pipeline': {'current': 'test', 'nodes': [{'key': 'test', 'status': 'failed',
                                                                   'records': [{'message': 'x'*100000}]}]}}],
                'versions': [{'id': 'v', 'candidate_id': 'a', 'report': {'evidence': ['original']}}],
                'rounds': [{'id': 'r', 'candidate_id': 'a'}], 'messages': [],
                'events': [{'id': 'e', 'job_id': 'j', 'message': 'failure'},
                           {'id': 'other', 'job_id': 'different', 'message': 'private unrelated'}]}

    def test_summary_preserves_metrics_status_and_original_evidence(self):
        source = self.fixture()
        before = copy.deepcopy(source)
        value = summary(source)
        self.assertEqual(value['metrics'], source['metrics'])
        self.assertEqual(value['usage'], source['usage'])
        self.assertEqual(value['jobs'][0]['status'], 'blocked')
        self.assertIs(value['jobs'][0]['report']['runtime_verified'], False)
        self.assertNotIn('observations', value['candidates'][0])
        self.assertEqual(value['jobs'][0]['pipeline']['nodes'][0]['records'], [])
        self.assertEqual(source, before)

    def test_detail_keeps_complete_evidence_for_requested_game(self):
        source = self.fixture()
        value = detail(source, 'a')
        self.assertEqual(value['candidates'][0]['observations'], source['candidates'][0]['observations'])
        self.assertEqual(value['jobs'][0]['pipeline'], source['jobs'][0]['pipeline'])
        self.assertEqual([e['id'] for e in value['events']], ['e'])
        self.assertEqual([v['id'] for v in value['versions']], ['v'])
        value['versions'][0]['report']['evidence'].clear()
        self.assertEqual(source['versions'][0]['report']['evidence'], ['original'])

    def test_unknown_game_does_not_return_unrelated_records(self):
        self.assertTrue(all(not rows for rows in detail(self.fixture(), 'unknown').values()))

    def test_stale_snapshot_refresh_does_not_block_or_fan_out(self):
        import controlplane.ui_state as ui
        key = 'isolated-ui-test-'+uuid.uuid4().hex
        entered, release = threading.Event(), threading.Event()
        calls = []
        source = self.fixture()
        class Service:
            data_dir = key
            def state(self):
                calls.append(1)
                entered.set()
                release.wait(3)
                return source
        with ui._lock:
            ui._cache[key] = (time.monotonic()-10, {'metrics': {'accepted_games': 1}})
        try:
            start = time.monotonic()
            value = ui.cached_summary(Service())
            self.assertLess(time.monotonic()-start, 1)
            self.assertEqual(value['metrics']['accepted_games'], 1)
            self.assertTrue(entered.wait(3))
            for _ in range(8):
                self.assertEqual(ui.cached_summary(Service())['metrics']['accepted_games'], 1)
            self.assertEqual(len(calls), 1)
            release.set()
            deadline = time.monotonic()+3
            while time.monotonic()<deadline:
                with ui._lock:
                    if key not in ui._refreshing:
                        break
                time.sleep(.01)
            self.assertEqual(ui.cached_summary(Service())['metrics']['accepted_games'], 12)
        finally:
            release.set()
            with ui._lock:
                ui._cache.pop(key, None)
