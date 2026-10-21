import json,tempfile,unittest
from pathlib import Path
from executors.cache_downloads import collect_download_cache
class DownloadCacheTests(unittest.TestCase):
 def test_snapshots_only_indexed_resources_and_reports_gaps(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d);base=root/'game/usr/gamecaches';base.mkdir(parents=True);(base/'sprite.png').write_bytes(b'png')
   files={'https://example.org/sprite.png':{'url':'wxfile://usr/gamecaches/sprite.png'},'https://example.org/missing.png':{'url':'wxfile://usr/gamecaches/missing.png'},'https://example.org/private.json':{'url':'wxfile://usr/private.json'}}
   (base/'cacheList.json').write_text(json.dumps({'files':files}))
   r=collect_download_cache([root/'game'],root/'out')
   self.assertEqual(len(r['files']),1);self.assertEqual(len(r['missing']),1);self.assertEqual(len(r['rejected']),1);self.assertFalse(r['complete_index'])
   self.assertEqual((root/'out'/r['files'][0]['file']).read_bytes(),b'png')
 def test_budget_is_not_silently_truncated(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d);base=root/'game/usr/gamecaches';base.mkdir(parents=True);(base/'a.bin').write_bytes(b'ab')
   (base/'cacheList.json').write_text(json.dumps({'files':{'https://example.org/a.bin':{'url':'wxfile://usr/gamecaches/a.bin'}}}))
   with self.assertRaises(ValueError):collect_download_cache([root/'game'],root/'out',max_bytes=1)
   self.assertFalse((root/'out/manifest.json').exists())
