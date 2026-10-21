import hashlib
import json
from pathlib import Path
import sys
import tempfile
import unittest
import subprocess
from controlplane.runtime import node_binary
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from resource_completion import complete
from acquisition import retained_web_source

class CompletionTests(unittest.TestCase):
    def test_empty_index_does_not_claim_complete(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);target=root/'converted';target.mkdir()
            manifest=root/'manifest.json';manifest.write_text('{"files":[],"missing":[],"rejected":[]}')
            report=complete({'download_cache':{'manifest':str(manifest)}},target,root,None)
            self.assertEqual(report['status'],'not_available')
    def test_browser_fetch_xhr_image_bindings(self):
        result=subprocess.run([node_binary(),'tools/check_resource_adapter.cjs'],capture_output=True,text=True,timeout=40)
        self.assertEqual(result.returncode,0,result.stdout+result.stderr)
    def test_cache_mapping_and_corruption(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);cache=root/'cache';cache.mkdir();target=root/'converted';target.mkdir()
            (target/'index.html').write_text('<html><head></head><body></body></html>')
            data=b'fixture';(cache/'original.png').write_bytes(data)
            manifest=cache/'manifest.json'
            manifest.write_text(json.dumps({'files':[{'url':'https://example.com/a.png','file':'original.png','sha256':hashlib.sha256(data).hexdigest()}],'missing':[],'rejected':[]}))
            observation={'download_cache':{'manifest':str(manifest)}}
            report=complete(observation,target,root,None)
            self.assertEqual(report['status'],'indexed_complete');self.assertEqual((target/'assets/remote/cached-0001.png').read_bytes(),data)
            self.assertIn('remote-resources.js',(target/'index.html').read_text())
            (cache/'original.png').write_bytes(b'changed')
            with self.assertRaises(ValueError):complete(observation,target,root,None)
    def test_retry_only_same_url_hash_verified_capture(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);capture=root/'old/acquisition';capture.mkdir(parents=True)
            data=b'<html>fixture</html>';(capture/'source.html').write_bytes(data)
            prior={'web_source':{'directory':'old'},'evidence':{'directory':str(capture),'source_url':'https://example.com/g','html_sha256':hashlib.sha256(data).hexdigest()}}
            self.assertIsNone(retained_web_source('https://example.com/other',prior,root/'new',root))
            self.assertTrue(retained_web_source('https://example.com/g',prior,root/'new',root))
            (capture/'source.html').write_bytes(b'changed')
            self.assertIsNone(retained_web_source('https://example.com/g',prior,root/'new',root))

if __name__=='__main__':unittest.main()
