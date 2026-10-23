import json
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'executors'))
from auto_repair import CHAT
from entry_recovery import recover
from worker import Blocked


class Budget:
    calls = 10
    def remaining(self, maximum): return maximum


class EntryRecoveryTests(unittest.TestCase):
    def run_case(self, url, result):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root/'acquisition').mkdir()
            observation = {'title':'fixture', 'web_discovery':{'iframe_hints':[
                {'url':'https://example.org/game', 'evidence':'iframe-src'}]}}
            (root/'acquisition/observation.json').write_text(json.dumps(observation))
            calls = []
            answers = iter([{'action':'probe_entry', 'arguments':{'url':url}}, {'action':'stop'}])
            def chat(messages, budget):
                payload = json.loads(messages[-1]['content'][0]['text'])
                self.assertIn('probe_entry', payload['allowed_actions'])
                self.assertIn('acquisition/observation.json', [r['path'] for r in payload['source_inventory']])
                return next(answers)
            def acquire(url, directory, budget):
                calls.append(url)
                return result
            token = CHAT.set(chat)
            try:
                try:
                    value = recover(observation, root, Budget(), acquire)
                except Blocked:
                    value = None
                report = json.loads((root/'auto-repair/report.json').read_text('utf-8'))
                return value, calls, report
            finally:
                CHAT.reset(token)

    def test_probe_returns_verified_entry_to_original_flow(self):
        entry = {'url':'https://example.org/game', 'canvas_count':1, 'evidence':'rendered-canvas'}
        value, calls, report = self.run_case('https://example.org/game', {'web_discovery':{'entries':[entry]}})
        self.assertEqual(value['web_discovery']['entries'], [entry])
        self.assertEqual(calls, ['https://example.org/game'])
        self.assertTrue(report['attempts'][0]['verified'])

    def test_no_canvas_remains_blocked(self):
        value, calls, report = self.run_case('https://example.org/game', {'web_discovery':{'entries':[]}})
        self.assertIsNone(value)
        self.assertEqual(len(calls), 1)
        self.assertFalse(report['attempts'][0]['verified'])

    def test_unverified_entry_cannot_pass_original_converter_check(self):
        value, calls, report = self.run_case('https://example.org/game', {'web_discovery':{
            'entries':[{'url':'https://example.org/game', 'canvas_count':0, 'evidence':'iframe-src'}]}})
        self.assertIsNone(value)
        self.assertEqual(len(calls), 1)
        self.assertFalse(report['attempts'][0]['verified'])

    def test_undeclared_url_never_executes(self):
        value, calls, report = self.run_case('https://unrelated.example/game', {})
        self.assertIsNone(value)
        self.assertEqual(calls, [])
        self.assertFalse(report['attempts'][0]['verified'])
