import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from types import SimpleNamespace
import worker


class Client:
    def __init__(self):
        self.calls = []
    def post(self, path, body):
        self.calls.append((path, body))
        return {'artifact_id': 'test-artifact'}


class WorkerTests(unittest.TestCase):
    def test_malformed_json_retries_only_provider_preserving_evidence(self):
        messages = [{'role': 'system', 'content': 'Use allowed tools only'},
                    {'role': 'user', 'content': [{'type': 'text', 'text': 'evidence'}]}]
        original = json.loads(json.dumps(messages))
        budget = SimpleNamespace(calls=3, remaining=lambda seconds: seconds)
        failures = [json.JSONDecodeError('invalid', 'x', 0),
                    RuntimeError('AI API 调用失败：响应不是有效 JSON；请检查连接和模型配置')]
        for failure in failures:
            budget.calls = 3
            with self.subTest(failure=type(failure).__name__), patch('worker.ai_config', return_value={}), \
                    patch('worker.complete', side_effect=[failure, ({'action': 'stop'}, 'test')]) as complete:
                self.assertEqual(worker.chat(messages, budget), {'action': 'stop'})
                self.assertEqual(complete.call_count, 2)
                self.assertEqual(budget.calls, 1)
                retried = complete.call_args.args[0]
                self.assertIn('合法 JSON', retried[0]['content'])
                self.assertEqual(retried[1], original[1])
                self.assertEqual(messages, original)

    def test_malformed_json_stops_at_two_calls_or_budget_limit(self):
        for calls, expected in [(3, 2), (1, 1)]:
            budget = SimpleNamespace(calls=calls, remaining=lambda seconds: seconds)
            with self.subTest(calls=calls), patch('worker.ai_config', return_value={}), \
                    patch('worker.complete', side_effect=json.JSONDecodeError('invalid', 'x', 0)) as complete:
                with self.assertRaises(worker.Blocked):
                    worker.chat([], budget)
                self.assertEqual(complete.call_count, expected)
                self.assertEqual(budget.calls, calls - expected)

    def test_format_correction_preserves_full_multimodal_message_list(self):
        messages = [{'role': 'user', 'content': [{'type': 'text', 'text': 'evidence'}]} for _ in range(32)]
        original = json.loads(json.dumps(messages))
        with patch('worker.ai_config', return_value={}), patch('worker.complete', side_effect=[
                json.JSONDecodeError('invalid', 'x', 0), ({'action': 'stop'}, 'test')]) as complete:
            worker.chat(messages)
        retried = complete.call_args.args[0]
        self.assertEqual(len(retried), 32)
        self.assertIn('合法 JSON', retried[-1]['content'][-1]['text'])
        self.assertEqual(messages, original)

    def test_authentication_and_schema_errors_are_not_retried(self):
        for failure in [RuntimeError('AI API 调用失败：HTTP 401'), ValueError('invalid action')]:
            with self.subTest(failure=str(failure)), patch('worker.ai_config', return_value={}), \
                    patch('worker.complete', side_effect=failure) as complete:
                with self.assertRaises(worker.Blocked):
                    worker.chat([])
                self.assertEqual(complete.call_count, 1)

    def test_paths_block_escape(self):
        for name in ['../index.html', '/index.html', 'C:/index.html', 'sub\\index.html', '.env', 'sub/.git/config']:
            with self.assertRaises(ValueError):
                worker.validate_files({name: 'x'})

    def test_binary_not_silently_dropped(self):
        with tempfile.TemporaryDirectory() as tmp:
            Path(tmp, 'asset.exe').write_bytes(b'EXE')
            with self.assertRaises(worker.Blocked):
                worker.source_files(Path(tmp))

    def test_fixture_packaged(self):
        files = worker.source_files(worker.ROOT / 'fixtures/orbit-catch')
        self.assertIn('index.html', files)
        self.assertIn('game.js', files)

    def test_no_source_blocks_without_false_rea_claim(self):
        client = Client()
        with patch('worker.chat', return_value={'action':'stop','diagnosis':'隔离夹具缺少来源'}):
            worker.execute(client, {'id':'unit-no-source', 'lease_token':'test', 'stage':'rea', 'input':{}})
        result = client.calls[-1][1]
        self.assertEqual(result['outcome'], 'blocked')
        self.assertNotIn('artifact_id', result)

    def test_missing_observations_asks_for_input(self):
        client = Client()
        with patch('worker.chat', return_value={'action':'stop','diagnosis':'隔离夹具缺少观测'}) as diagnosis:
            worker.execute(client, {'id':'unit-no-observations', 'lease_token':'test', 'stage':'reconstruct', 'input':{}})
        diagnosis.assert_called_once()
        self.assertTrue(client.calls[-1][0].endswith('/ask'))

    def test_ai_key_missing_blocks(self):
        with patch.dict('os.environ', {}, clear=True):
            with self.assertRaises(worker.Blocked):
                worker.chat([])

    def test_source_map_extraction_neutralizes_paths(self):
        files={'index.html':'<script src="game.js"></script>','game.js':'run();','game.js.map':json.dumps({'sourceRoot':'../../outside','sources':['../../evil.js','C:\\tmp\\absolute.ts','webpack://app/src/main.js'],'sourcesContent':['let a=1','const b=2','run()']})}
        result, report=worker.recover_source_maps(files)
        self.assertEqual(report['kind'],'recovered-source-map')
        self.assertEqual(len(report['recovered_sources']),3)
        for item in report['recovered_sources']:
            self.assertTrue(item['path'].startswith('recovered-src/'))
            self.assertNotIn('..',item['path'])
            self.assertNotIn(':',item['path'])
        self.assertEqual(result['game.js'],'run();')
        self.assertFalse(report['maintainability_verified'])

    def test_minified_bundle_not_claimed_original_source(self):
        _,report=worker.recover_source_maps({'game.js':'a();'*300})
        self.assertEqual(report['kind'],'bundle-preserved')

    def test_generated_code_never_claims_playtest(self):
        with tempfile.TemporaryDirectory() as tmp, patch('worker.chat', side_effect=[{'observed_rules':['click']},{'files':{'index.html':'<h1>game</h1>'},'entry':'index.html'}]):
            files, entry, report = worker.reconstruct({'observations':'click score restart'}, Path(tmp))
            self.assertFalse(report['runtime_verified'])
            self.assertTrue(report['requires_manual_playtest'])


if __name__ == '__main__':
    unittest.main()
