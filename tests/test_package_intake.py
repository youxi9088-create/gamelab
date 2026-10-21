import hashlib
import json
import shutil
import tempfile
import unittest
import uuid
from pathlib import Path
from controlplane.service import Service,ApiError


class PackageIntakeTest(unittest.TestCase):
    def test_bound_local_package_keeps_unverified_draft(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);service=Service(root/'data',root/'repo','http://127.0.0.1:8766')
            registration=service.mutate('/api/tools',{'name':'isolated','capabilities':['rea']});tool=registration['tool']
            candidate=service.mutate('/api/candidates',{'url':'https://example.org/package','title':'Fixture'})['candidate']
            batch=service.mutate('/api/batches',{'name':'fixture','candidate_ids':[candidate['id']]})['batch']
            service.mutate('/api/batches/'+batch['id']+'/start',{'automatic':True})
            job=service.mutate('/api/v1/jobs/claim',{'capabilities':['rea']},tool)['job']
            run=Path(__file__).resolve().parents[1]/'executors/runs'/str(uuid.uuid4());run.mkdir()
            self.addCleanup(shutil.rmtree,run)
            source=run/'converted';source.mkdir();(source/'index.html').write_text('<h1>fixture</h1>')
            for i in range(501):(source/f'{i}.txt').write_text('fixture')
            binding={'job_id':job['id'],'lease_sha256':hashlib.sha256(job['lease_token'].encode()).hexdigest()}
            (run/'job-binding.json').write_text(json.dumps(binding))
            body={'job_id':job['id'],'lease_token':job['lease_token'],'local_run':run.name,'entry':'index.html'}
            with self.assertRaises(ApiError):service.mutate('/api/v1/artifacts',body,tool)
            (root/'data/executor-token.txt').write_text(registration['token'])
            artifact=service.mutate('/api/v1/artifacts',body,tool)
            self.assertEqual(502,len(artifact['files']))
            service.mutate('/api/v1/jobs/'+job['id']+'/complete',{'lease_token':job['lease_token'],'outcome':'recovered','artifact_id':artifact['artifact_id'],'report':{'runtime_verified':True}},tool)
            with service.store.tx() as db:
                version=service.store.all(db,'versions')[0]
                self.assertEqual('draft',version['status'])
                self.assertIn('/runtime/',version['preview_url'])
