import sys
import tempfile
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from offline_source_patch import OfflineSourcePatch
from runtime_source_patch import sha


class OfflinePatchTests(unittest.TestCase):
    def test_large_business_bundle_and_html_inline_are_patchable(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);base=root/'baseline';run=root/'run';target=run/'converted'
            base.mkdir();target.mkdir(parents=True)
            script=b'/*'+b'x'*2_100_000+b'*/\nfunction joinRoom(){return 1;}\n'
            html=b'<html><script type="application/json">{"keep":true}</script><script>function joinRoom(){return 1;}</script></html>'
            for folder in (base,target):
                (folder/'main.js').write_bytes(script);(folder/'index.html').write_bytes(html)
            tool=OfflineSourcePatch(run,type('Budget',(),{'remaining':lambda s,n:n})(),base)
            self.assertIn('converted/main.js',tool.candidates())
            self.assertIn('converted/index.html',tool.candidates())
            args={'feature':'multiplayer','evidence':'Read inline joinRoom function','purpose':'Remove multiplayer function',
                  'patches':[{'path':'converted/index.html','sha256':sha(html),'replacements':[{'old':'function joinRoom(){return 1;}','new':'function localScore(){return 1;}'}]}]}
            tool.apply(args)
            self.assertIn(b'{"keep":true}',(target/'index.html').read_bytes())
            self.assertEqual((base/'index.html').read_bytes(),html)
            tool.rollback()
            args['patches'][0]['replacements'][0]['new']='function invalid( {'
            with self.assertRaises(ValueError):tool.apply(args)
            self.assertEqual((target/'index.html').read_bytes(),html)
            args['patches']=[{'path':'converted/main.js','sha256':sha(script),'replacements':[{'old':'function joinRoom(){return 1;}','new':'function localScore(){return 1;}'}]}]
            tool.apply(args)
            self.assertNotIn(b'joinRoom', (target/'main.js').read_bytes())
            tool.rollback()

    def test_removal_is_version_bound_reversible_and_excludes_engine(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);base=root/'baseline';run=root/'run';target=run/'converted'
            base.mkdir();target.mkdir(parents=True)
            source=b'export function showRanking(){sdk.showLeaderboard();}'
            for folder in (base,target):
                (folder/'game.js').write_bytes(source);(folder/'vendor').mkdir();(folder/'vendor/engine.js').write_bytes(source)
            tool=OfflineSourcePatch(run,type('Budget',(),{'remaining':lambda s,n:n})(),base)
            self.assertNotIn('converted/vendor/engine.js',tool.candidates())
            args={'feature':'leaderboard','evidence':'game.js showRanking invokes sdk.showLeaderboard',
                  'purpose':'Remove the online ranking call','patches':[{'path':'converted/game.js','sha256':sha(source),
                  'replacements':[{'old':'sdk.showLeaderboard();','new':'return;'}]}]}
            tool.apply(args)
            self.assertEqual((base/'game.js').read_bytes(),source)
            self.assertNotIn(b'showLeaderboard',(target/'game.js').read_bytes())
            tool.rollback();self.assertEqual((target/'game.js').read_bytes(),source)
            args['feature']='game_score'
            with self.assertRaises(ValueError):tool.apply(args)
