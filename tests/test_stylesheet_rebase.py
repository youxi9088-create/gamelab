import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from runtime_recovery import rebase_stylesheet

class StylesheetRebaseTest(unittest.TestCase):
    def test_font_origin_query_and_import_survive_relocation(self):
        raw=b'@import "../theme.css?v=2"; @font-face{src:url(../fonts/a.woff2?v=3)} .a{background:url(data:image/png;base64,AA)} .b{filter:url(#mask)}'
        result=rebase_stylesheet(raw,'https://cdn.example/css/main.css',{
            'https://cdn.example/fonts/a.woff2?v=3':'/_runtime_resources/font.woff2'}).decode()
        self.assertIn('"https://cdn.example/theme.css?v=2"',result)
        self.assertIn('url("/_runtime_resources/font.woff2")',result)
        self.assertIn('data:image/png;base64,AA',result)
        self.assertIn('#mask',result)

    def test_new_mapping_updates_original_reference_on_next_pass(self):
        raw=b'a{background:url(//assets.example/a.png?x=1&y=2)}'
        first=rebase_stylesheet(raw,'https://cdn.example/a.css',{})
        self.assertIn(b'https://assets.example/a.png?x=1&y=2',first)
        second=rebase_stylesheet(raw,'https://cdn.example/a.css',{'https://assets.example/a.png?x=1&y=2':'/a.png'})
        self.assertIn(b'url("/a.png")',second)

if __name__=='__main__':unittest.main()
