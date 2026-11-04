import sys
import tempfile
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from offline_source_patch import OfflineSourcePatch
from runtime_source_patch import sha


class OfflinePatchTests(unittest.TestCase):
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
