import tempfile
import unittest
from pathlib import Path
from controlplane.service import Service
from tools.import_local_review import snapshot, intake
from test_conversations import fixture_report

class LocalIntakeTest(unittest.TestCase):
    def test_trusted_local_intake_supports_resource_heavy_game_with_finite_limit(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);s=Service(root/'data',root/'repo','http://127.0.0.1:8766');src=root/'src';src.mkdir()
            (src/'index.html').write_text('fixture')
            for i in range(500):(src/f'asset-{i}.txt').write_text('x')
            self.assertEqual(len(snapshot(s.repo,'large-local',src,'index.html')['files']),501)
            for i in range(500,2000):(src/f'asset-{i}.txt').write_text('x')
            with self.assertRaises(ValueError):snapshot(s.repo,'too-many',src,'index.html')
    def test_snapshot_limits_and_hidden_files(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);s=Service(root/'data',root/'repo','http://127.0.0.1:8766');src=root/'src';src.mkdir()
            (src/'index.html').write_text('<html>test</html>');(src/'.env').write_text('private')
            with self.assertRaises(ValueError):snapshot(s.repo,'oversize',src,'index.html',max_bytes=2)
            info=snapshot(s.repo,'okay',src,'index.html');self.assertEqual(info['files'],['index.html'])
            self.assertFalse((s.repo.artifacts/'okay'/'.env').exists())
    def test_intake_is_review_and_preserves_rights_and_snapshot(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);s=Service(root/'data',root/'repo','http://127.0.0.1:8766');src=root/'src';src.mkdir();(src/'index.html').write_text('original')
            c=s.mutate('/api/candidates',dict(title='Local fixture',url='https://example.org/local',source_path=str(src),rights='unknown'))['candidate']
            v=intake(s,c['id'],'http://127.0.0.1:8787/',{**fixture_report(),'source_recovered':False})
            self.assertEqual(v['status'],'review');self.assertEqual(v['route'],'local')
            self.assertTrue((s.repo.root/v['source_directory']/'platform-delivery/GAME_SPECIFICATION.md').is_file())
            self.assertTrue((s.repo.root/v['source_directory']/'platform-delivery/game-profile.json').is_file())
            (src/'index.html').write_text('changed')
            self.assertEqual((s.repo.artifacts/v['artifact_id']/'index.html').read_text(),'original')
            self.assertEqual(s.state()['candidates'][0]['rights'],'unknown')
            with self.assertRaises(Exception):intake(s,c['id'],'http://127.0.0.1:8787/',{})
            s.mutate('/api/versions/'+v['id']+'/approve',{'checks':dict(gameplay=True,visual=True)})
            self.assertEqual('unknown',s.state()['candidates'][0]['rights'])
            with self.assertRaises(Exception):s.mutate('/api/versions/'+v['id']+'/publish',{})

if __name__=='__main__':unittest.main()
