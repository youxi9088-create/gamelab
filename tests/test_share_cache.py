import sys,tempfile,unittest,struct,json,os
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from acquisition import acquire
from worker import Budget,NeedsInput,Blocked

class ShareCacheTests(unittest.TestCase):
 def test_confirmed_identity_reads_only_matching_package(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d); appid='wx1234567890abcdef'; folder=root/'packages'/appid/'1';folder.mkdir(parents=True)
   name=b'game.js';body=b'const original=true;';offset=18+12+len(name)
   package=b'\xbe'+b'\0'*12+b'\xed'+struct.pack('>I',1)+struct.pack('>I',len(name))+name+struct.pack('>II',offset,len(body))+body
   (folder/'__APP__.wxapkg').write_bytes(package)
   with patch.dict(os.environ,{'REPLICA_WECHAT_CACHE_ROOTS':str(root/'packages'),'APPDATA':''}):
    result=acquire('#小程序://测试/token',root/'run',Budget(60),{'appid':appid})
   self.assertEqual(result['cache_package_count'],1)
   self.assertTrue(result['cache_manifest'][0]['complete'])
   self.assertEqual(result['evidence']['mode'],'confirmed-wechat-cache')
   self.assertIsNone(result['evidence']['html_sha256'])
 def test_unknown_identity_still_requires_input(self):
  with tempfile.TemporaryDirectory() as d:
   with self.assertRaises(NeedsInput):acquire('#小程序://测试/token',Path(d)/'run',Budget(60))
 def test_confirmed_identity_without_cache_does_not_fallback(self):
  with tempfile.TemporaryDirectory() as d,patch.dict(os.environ,{'REPLICA_WECHAT_CACHE_ROOTS':'','APPDATA':''}):
   with self.assertRaises(NeedsInput):acquire('#小程序://测试/token',Path(d)/'run',Budget(60),{'appid':'wx1234567890abcdef'})
