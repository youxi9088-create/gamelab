import hashlib
import json
from pathlib import Path
import sys
import tempfile
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from revision_resource_cache import adopt


class RevisionResources(unittest.TestCase):
    def fixture(self,root,job='job-a',tamper=False):
        old=root/'prior';new=root/'current'
        for directory in (old,new):
            directory.mkdir();(directory/'job-binding.json').write_text(json.dumps({'job_id':job if directory==old else 'job-a'}))
        target=new/'converted';(target/'evidence').mkdir(parents=True)
        url='https://example.org/model.glb?v=1'
        (target/'index.html').write_text('fetch("'+url+'")')
        raw=b'actual-model-bytes';name='_runtime_resources/model.glb'
        source=old/'web-original'/name;source.parent.mkdir(parents=True)
        source.write_bytes(b'changed' if tamper else raw)
        acquisition={'url':'https://example.org/game','referer':'https://example.org/portal','files':[]}
        (old/'web-acquisition.json').write_text(json.dumps({**acquisition,'files':[{'url':url,'path':name,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}]}))
        return new,acquisition

    def test_exact_declared_resource_is_adopted_without_verification(self):
        with tempfile.TemporaryDirectory() as temp:
            run,acq=self.fixture(Path(temp))
            self.assertEqual(len(adopt(run,acq)),1)
            self.assertTrue((run/'converted/_runtime_resources/model.glb').exists())
            self.assertTrue(acq['resource_cache_reuse'][0]['verification_required'])
            self.assertFalse((run/'converted/evidence/runtime.json').exists())

    def test_cross_job_and_changed_bytes_rejected(self):
        for job,tamper in [('other-job',False),('job-a',True)]:
            with self.subTest(job=job,tamper=tamper),tempfile.TemporaryDirectory() as temp:
                run,acq=self.fixture(Path(temp),job,tamper)
                self.assertEqual(adopt(run,acq),[])

    def test_query_identity_not_guessed(self):
        with tempfile.TemporaryDirectory() as temp:
            run,acq=self.fixture(Path(temp))
            (run/'converted/index.html').write_text('fetch("https://example.org/model.glb?v=2")')
            self.assertEqual(adopt(run,acq),[])

if __name__=='__main__':unittest.main()
