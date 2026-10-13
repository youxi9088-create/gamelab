import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import worker


class Client:
    def __init__(self):
        self.calls = []
    def post(self, path, body):
        self.calls.append((path, body))
        return {'artifact_id': 'test-artifact'}


class WorkerTests(unittest.TestCase):
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
        worker.execute(client, {'id':'unit-no-source', 'lease_token':'test', 'stage':'rea', 'input':{}})
        result = client.calls[-1][1]
        self.assertEqual(result['outcome'], 'blocked')
        self.assertNotIn('artifact_id', result)

    def test_missing_observations_blocks(self):
        client = Client()
        worker.execute(client, {'id':'unit-no-observations', 'lease_token':'test', 'stage':'reconstruct', 'input':{}})
        self.assertEqual(client.calls[-1][1]['outcome'], 'blocked')

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
