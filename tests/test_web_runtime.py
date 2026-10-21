import json
from pathlib import Path
import sys
import tempfile
import unittest
import hashlib
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT));sys.path.insert(0,str(ROOT/'executors'))
from web_runtime import adapt

class WebRuntimeTests(unittest.TestCase):
    def test_exact_hash_and_single_replacement(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);source=root/'source';source.mkdir();(source/'index.html').write_text('original','utf-8')
            profile={'patches':[{'file':'index.html','sha256':hashlib.sha256(b'original').hexdigest(),'replacements':[{'find':'original','replace':'local'}]}]}
            changes=adapt(source,root/'out',profile)
            self.assertEqual((root/'out/index.html').read_text(),'local')
            self.assertEqual((source/'index.html').read_text(),'original')
            self.assertEqual(len(changes),1)
            profile['patches'][0]['sha256']='wrong'
            with self.assertRaisesRegex(ValueError,'source changed'):adapt(source,root/'changed',profile)

    def test_path_escape_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);source=root/'source';source.mkdir();(root/'secret').write_text('outside')
            with self.assertRaisesRegex(ValueError,'path'):
                adapt(source,root/'out',{'patches':[{'file':'../secret'}]})

    def test_no_version_web_retry_returns_to_acquisition(self):
        from controlplane.service import Service
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);s=Service(root/'data',root/'repo','http://localhost')
            c=s.mutate('/api/candidates',{'url':'https://example.org/game','title':'Authored test','observations':{'web_runtime':{'engine':'cocos2'}}})['candidate']
            b=s.mutate('/api/batches',{'name':'isolated','candidate_ids':[c['id']]})['batch'];s.mutate('/api/batches/'+b['id']+'/start',{})
            with s.store.tx() as db:
                j=s.store.all(db,'jobs')[0];j.update(status='blocked',stage='reconstruct');s.store.put(db,'jobs',j)
            result=s.mutate('/api/jobs/'+j['id']+'/message',{'message':'Continue configured Web acquisition'})
            self.assertEqual(result['job']['stage'],'rea')

    def test_platform_restore_action_configures_and_queues_same_job(self):
        from controlplane.service import Service,ApiError
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);s=Service(root/'data',root/'repo','http://localhost')
            c=s.mutate('/api/candidates',{'url':'https://c.17yoo.cn/playbox/10109/','title':'Authored test'})['candidate']
            b=s.mutate('/api/batches',{'name':'isolated','candidate_ids':[c['id']]})['batch'];s.mutate('/api/batches/'+b['id']+'/start',{})
            with s.store.tx() as db:
                j=s.store.all(db,'jobs')[0];j.update(status='blocked',stage='reconstruct');s.store.put(db,'jobs',j)
            with self.assertRaises(ApiError):s.mutate('/api/jobs/'+j['id']+'/restore-web',{'profile_id':'unknown'})
            result=s.mutate('/api/jobs/'+j['id']+'/restore-web',{'profile_id':'cocos2-minesweeper'})['job']
            self.assertEqual(result['id'],j['id']);self.assertEqual(result['stage'],'rea');self.assertEqual(result['status'],'queued')
            with s.store.tx() as db:
                candidate=s.get(db,'candidates',c['id']);self.assertEqual(candidate['observations']['web_profile_id'],'cocos2-minesweeper')
                self.assertEqual(len(s.store.all(db,'rounds')),1)
            with self.assertRaises(ApiError):s.mutate('/api/jobs/'+j['id']+'/restore-web',{'profile_id':'cocos2-minesweeper'})

if __name__=='__main__':unittest.main()
