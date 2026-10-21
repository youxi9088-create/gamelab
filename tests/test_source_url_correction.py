import tempfile
import unittest
from pathlib import Path
from controlplane.service import Service, ApiError


class SourceUrlCorrectionTest(unittest.TestCase):
    def test_correction_preserves_task_and_rejects_busy_or_duplicate(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            service = Service(root/'data', root/'repo', 'http://localhost:8766')
            candidate = service.mutate('/api/candidates', {'url':'https://example.org/detail/1','title':'Test'})['candidate']
            path = '/api/candidates/'+candidate['id']+'/update'
            with service.store.tx() as db:
                service.store.put(db,'jobs',dict(id='job-test',candidate_id=candidate['id'],status='running'))
            with self.assertRaises(ApiError):
                service.mutate(path, {'url':'https://example.org/play/1'})
            with service.store.tx() as db:
                job=service.store.get(db,'jobs','job-test')
                job['status']='blocked'
                service.store.put(db,'jobs',job)
            result=service.mutate(path, {'url':'https://example.org/play/1'})['candidate']
            self.assertEqual('https://example.org/play/1',result['canonical_url'])
            self.assertEqual(candidate['url'],result['url_history'][0]['url'])
            with service.store.tx() as db:
                self.assertEqual(job,service.store.get(db,'jobs','job-test'))
                self.assertEqual(result['url'],service.continuation_input(db,job,result)['url'])
            service.mutate('/api/candidates', {'url':'https://example.org/other','title':'Other'})
            with self.assertRaises(ApiError):
                service.mutate(path, {'url':'https://example.org/other'})
            service.mutate(path, {'source_path':str(root/'source')})
            with self.assertRaises(ApiError):
                service.mutate(path, {'url':'https://example.org/new'})
