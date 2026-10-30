import json
import tempfile
import unittest
from pathlib import Path
from controlplane.game_catalog import document, export, index, FIELDS, normalize, profile


class CatalogTests(unittest.TestCase):
    def test_submission_documents_all_paths_and_only_current_evidence(self):
        from controlplane.game_catalog import prepare_submission
        for field in ('files','changes'):
            body={field:{},'report':{'game_profile':{'rules':'Verified rule'},'runtime_smoke':{'captured_screenshots':['screenshots/current.png'],'steps':[]}}}
            prepare_submission(body,Path('.'))
            self.assertIn('## 场景、关卡与难度设计',body[field]['GAME_SPECIFICATION.md'])
            self.assertIn('screenshots/current.png',body[field]['GAME_SPECIFICATION.md'])
            self.assertEqual(len(body['report']['game_profile']['illustrations']),1)
        with tempfile.TemporaryDirectory() as d:
            target=Path(d)/('a'*36)/'converted';target.mkdir(parents=True)
            prepare_submission({'local_run':'a'*36,'report':{}},Path(d))
            self.assertIn('未登记',(target/'GAME_SPECIFICATION.md').read_text('utf-8'))
            with self.assertRaises(ValueError):prepare_submission({'local_run':'../escape','report':{}},Path(d))

    def test_automatic_pictures_only_use_recorded_version_steps(self):
        runtime={'captured_screenshots':['screenshots/step-1.png'], 'steps':[
            {'screenshot':'screenshots/stale.png','text':'old state'},
            {'screenshot':'screenshots/step-1.png','text':'Result 275'}]}
        facts=profile({}, {'report':{'runtime_smoke':runtime}})
        self.assertEqual(len(facts['illustrations']),1)
        self.assertEqual(facts['illustrations'][0]['path'],'screenshots/step-1.png')
        self.assertIn('Result 275',facts['illustrations'][0]['caption'])
        self.assertEqual(profile({}, {'report':{}})['illustrations'],[])

    def test_detailed_profile_images_are_version_bound_and_exported(self):
        facts=normalize({'rules':'Score = tips + chaos','illustrations':[{'path':'screenshots/step-1.png','caption':'Result, not proof of all levels'}]})
        self.assertIn('## 目标、规则与结算数值',document('Game',facts))
        self.assertIn('![实机图 1](screenshots/step-1.png)',document('Game',facts))
        for path in ['https://example.org/a.png','../a.png','screenshots/../a.png','screenshots/a.svg']:
            with self.assertRaises(ValueError):normalize({'illustrations':[{'path':path,'caption':'bad'}]})
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);source=root/'games/x/v/screenshots';source.mkdir(parents=True)
            (source/'step-1.png').write_bytes(b'image')
            export(root,[{'id':'x','title':'Game'}],[{'id':'v','candidate_id':'x','status':'review','source_directory':'games/x/v','game_profile':facts}])
            self.assertEqual((root/'catalog/versions/v/screenshots/step-1.png').read_bytes(),b'image')
            local=(root/'catalog/versions/v/GAME_SPECIFICATION.md').read_text('utf-8')
            self.assertIn((root/'catalog/versions/v/screenshots/step-1.png').resolve().as_posix(),local)
            self.assertIn('](screenshots/step-1.png)',document('Game',facts))

    def test_dimension_annotation_does_not_discard_delivery(self):
        self.assertEqual(normalize({'dimension':'2D（使用 Cocos 3.x 引擎，主逻辑为 2D 战斗系统）'})['dimension'], '2D')
        self.assertEqual(normalize({'dimension':'3D (unverified)'})['dimension'], '3D')
        for value in ['2D/3D', 'unknown dimension', '2D（unfinished', '2D or 3D']:
            with self.assertRaises(ValueError):
                normalize({'dimension':value})

    def test_profile_registration_preserves_version_and_revision_history(self):
        from controlplane.service import Service
        from tools.register_game_profile import register
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            service = Service(root/'data', root/'repo', 'http://127.0.0.1:8766')
            version = dict(id='v-fixture', candidate_id='fixture', status='review', report={})
            with service.store.tx() as db:
                service.store.put(db, 'versions', version)
            register(service, version['id'], {'dimension':'2D'}, 0)
            with self.assertRaises(ValueError):
                register(service, version['id'], {'dimension':'3D'}, 0)
            register(service, version['id'], {'dimension':'2.5D'}, 1)
            with service.store.tx() as db:
                self.assertEqual(service.store.get(db, 'versions', version['id']), version)
                self.assertEqual(len(service.store.all(db, 'game_profile_history')), 2)
                self.assertEqual(service.store.get(db, 'game_profiles', version['id'])['revision'], 2)

    def test_document_only_contains_game_facts(self):
        candidate = dict(id='game-one', title='Puzzle')
        version = dict(id='v-one',candidate_id='game-one',status='review',
                       report={'summary':'secret adaptation failure', 'game_profile':dict(category='益智',dimension='2D')})
        with tempfile.TemporaryDirectory() as d:
            result=export(Path(d),[candidate],[version])
            text=(Path(d)/result['games'][0]['specification']).read_text('utf-8')
            self.assertNotIn('secret adaptation',text)
            self.assertNotIn('review',text)
            self.assertIn('2D',text)
            self.assertEqual(result['games'][0]['profile_status'],'incomplete')
            self.assertEqual(json.loads((Path(d)/'catalog/index.json').read_text('utf8')),result)

    def test_latest_version_facts_do_not_use_current_candidate_spec(self):
        c=dict(id='game',title='=HYPERLINK("bad")',game_spec={'category':'not version evidence'})
        old=dict(id='v1',candidate_id='game',status='published',created_at='2020',report={'game_profile':{'dimension':'3D'}})
        new=dict(id='v2',candidate_id='game',status='draft',created_at='2021',report={})
        row=index([c],[old,new])['games'][0]
        self.assertEqual(row['version_id'],'v2')
        self.assertEqual(row['dimension'],'')
        self.assertEqual(row['category'],'')
        with tempfile.TemporaryDirectory() as d:
            export(Path(d),[c],[old,new])
            self.assertIn("'=HYPERLINK", (Path(d)/'catalog/index.csv').read_text('utf-8-sig'))

    def test_hidden_and_bad_legacy_metadata(self):
        self.assertEqual(index([dict(id='x',observations={'catalog_hidden':True})],[])['games'],[])
        row=index([dict(id='x',title='X')],[dict(id='v',candidate_id='x',status='review',report={'game_profile':[]})])['games'][0]
        self.assertEqual(row['profile_status'],'incomplete')
        with self.assertRaises(ValueError):normalize({'dimension':'unknown dimension'})
