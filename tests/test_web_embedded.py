import json
from pathlib import Path
import sys
import tempfile
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from web_embedded import extract


class EmbeddedTests(unittest.TestCase):
    def fixture(self,code,declared=None):
        size=len(code.encode()) if declared is None else declared
        stream='1:T'+format(size,'x')+','+code+'\n2:{"game_code":"$1"}\n'
        return '<script>self.__next_f.push('+json.dumps([1,stream]).replace('<','\\u003c')+')</script>'
    def test_utf8_byte_length_and_no_execution(self):
        code='<!DOCTYPE html><title>中文</title><script>throw Error("not executed")</script>'
        with tempfile.TemporaryDirectory() as t:
            root=Path(t)/'source';result=extract(self.fixture(code),root)
            self.assertEqual((root/'index.html').read_text('utf-8'),code)
            self.assertEqual(result['files'][0]['bytes'],len(code.encode()))
    def test_unreferenced_or_truncated_is_not_source(self):
        with tempfile.TemporaryDirectory() as t:
            self.assertIsNone(extract('<script>alert(1)</script>',Path(t)/'source'))
            self.assertIsNone(extract(self.fixture('<html>abc</html>',9999),Path(t)/'source'))
    def test_explicit_asset_map_retained_and_ambiguous_map_rejected(self):
        mapping={'fish':{'url':'https://example.com/fish.png','type':'image'}}
        base=self.fixture('<html>game</html>')
        stream='3:'+json.dumps({'asset_map':mapping})+'\n'
        extra='<script>self.__next_f.push('+json.dumps([1,stream])+')</script>'
        with tempfile.TemporaryDirectory() as t:
            root=Path(t)/'one';extract(base+extra,root)
            self.assertEqual(json.loads((root/'asset-map.json').read_text('utf-8')),mapping)
            root=Path(t)/'two';extract(base+extra+extra,root)
            self.assertFalse((root/'asset-map.json').exists())

if __name__=='__main__':unittest.main()
