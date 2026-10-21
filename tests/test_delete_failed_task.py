import tempfile
import unittest
from pathlib import Path
from controlplane.service import Service, ApiError


class DeleteFailedTaskTest(unittest.TestCase):
    def test_delete_archives_only_failed_task(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            service=Service(root/'data',root/'repo','http://localhost:8766')
            with service.store.tx() as db:
                for kind,value in [('candidates',dict(id='c')),('batches',dict(id='b',candidate_ids=['c'])),('jobs',dict(id='j',candidate_id='c',batch_id='b',status='running')),('events',dict(id='e',job_id='j')),('events',dict(id='unrelated'))]:
                    service.store.put(db,kind,value)
            with self.assertRaises(ApiError):service.mutate('/api/jobs/j/delete',{})
            with service.store.tx() as db:
                job=service.store.get(db,'jobs','j');job['status']='blocked';service.store.put(db,'jobs',job)
            result=service.mutate('/api/jobs/j/delete',{})
            with service.store.tx() as db:
                self.assertIsNone(service.store.get(db,'jobs','j'))
                self.assertIsNone(service.store.get(db,'candidates','c'))
                self.assertIsNotNone(service.store.get(db,'events','unrelated'))
                self.assertEqual(4,len(service.store.get(db,'deleted-tasks',result['archive_id'])['records']))
