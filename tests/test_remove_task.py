import tempfile
import unittest
from pathlib import Path
from controlplane.service import Service, ApiError

# 任务中心的“删除”是任务级清理：排队/受阻的任务可以直接删掉，跑了一半或已经出过版本的
# 任务必须保留，否则会把可验收的产物和批次进度一起抹掉。
BASE = [('candidates', dict(id='c', title='示例', status='candidate')),
        ('batches', dict(id='b', candidate_ids=['c'])),
        ('jobs', dict(id='j', candidate_id='c', batch_id='b', status='queued')),
        ('events', dict(id='e', job_id='j')),
        ('messages', dict(id='m', job_id='j')),
        ('events', dict(id='unrelated')),
        ('jobs', dict(id='other', candidate_id='c', batch_id='b', status='queued'))]


def build(root):
    service = Service(root / 'data', root / 'repo', 'http://localhost:8766')
    with service.store.tx() as db:
        for kind, value in BASE:
            service.store.put(db, kind, value)
    return service


class RemoveTaskTest(unittest.TestCase):
    def test_running_task_cannot_be_removed(self):
        with tempfile.TemporaryDirectory() as directory:
            service = build(Path(directory))
            with service.store.tx() as db:
                job = service.store.get(db, 'jobs', 'j')
                job['status'] = 'running'
                service.store.put(db, 'jobs', job)
            with self.assertRaises(ApiError):
                service.mutate('/api/jobs/j/remove', {})
            with service.store.tx() as db:
                self.assertIsNotNone(service.store.get(db, 'jobs', 'j'))

    def test_task_with_version_cannot_be_removed(self):
        with tempfile.TemporaryDirectory() as directory:
            service = build(Path(directory))
            with service.store.tx() as db:
                service.store.put(db, 'versions', dict(id='v', job_id='j', candidate_id='c', status='draft'))
            with self.assertRaises(ApiError):
                service.mutate('/api/jobs/j/remove', {})
            with service.store.tx() as db:
                self.assertIsNotNone(service.store.get(db, 'jobs', 'j'))

    def test_remove_archives_task_scoped_records_and_keeps_candidate(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            service = build(root)
            result = service.mutate('/api/jobs/j/remove', {})
            with service.store.tx() as db:
                self.assertIsNone(service.store.get(db, 'jobs', 'j'))
                self.assertIsNone(service.store.get(db, 'events', 'e'))
                self.assertIsNone(service.store.get(db, 'messages', 'm'))
                self.assertIsNotNone(service.store.get(db, 'events', 'unrelated'))
                self.assertIsNotNone(service.store.get(db, 'jobs', 'other'))
                self.assertIsNotNone(service.store.get(db, 'candidates', 'c'))
                archive = service.store.get(db, 'deleted-tasks', result['archive_id'])
                self.assertEqual('task', archive['scope'])
                self.assertEqual('j', archive['job_id'])
                self.assertEqual(3, len(archive['records']))
                self.assertEqual(3, result['removed_records'])

    def test_candidate_returns_to_pool_when_last_task_removed(self):
        with tempfile.TemporaryDirectory() as directory:
            service = build(Path(directory))
            with service.store.tx() as db:
                candidate = service.store.get(db, 'candidates', 'c')
                candidate['status'] = 'queued'
                service.store.put(db, 'candidates', candidate)
            service.mutate('/api/jobs/j/remove', {})
            service.mutate('/api/jobs/other/remove', {})
            with service.store.tx() as db:
                self.assertEqual('candidate', service.store.get(db, 'candidates', 'c')['status'])

    def test_candidate_with_review_version_keeps_its_status(self):
        with tempfile.TemporaryDirectory() as directory:
            service = build(Path(directory))
            with service.store.tx() as db:
                candidate = service.store.get(db, 'candidates', 'c')
                candidate['status'] = 'review'
                service.store.put(db, 'candidates', candidate)
                service.store.put(db, 'versions', dict(id='v', job_id='gone', candidate_id='c', status='review'))
                job = service.store.get(db, 'jobs', 'other')
                job['status'] = 'failed'
                service.store.put(db, 'jobs', job)
            service.mutate('/api/jobs/other/remove', {})
            with service.store.tx() as db:
                self.assertEqual('review', service.store.get(db, 'candidates', 'c')['status'])

class BulkRemoveTest(unittest.TestCase):
    """批量删除用于按筛选结果清理：不可删的跳过并带回原因，不整批失败。"""

    def seed(self, root, extra_jobs=()):
        service = build(root)
        with service.store.tx() as db:
            for job in extra_jobs:
                service.store.put(db, 'jobs', job)
        return service

    def test_bulk_removes_only_eligible_and_reports_reasons(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            service = self.seed(root, [
                dict(id='running', candidate_id='c', batch_id='b', status='running'),
                dict(id='done', candidate_id='c', batch_id='b', status='blocked'),
            ])
            with service.store.tx() as db:
                service.store.put(db, 'versions',
                                  dict(id='v1', job_id='done', candidate_id='c', status='draft'))
            result = service.mutate('/api/jobs/bulk', {'action': 'remove', 'ids': ['j', 'running', 'done']})
            self.assertEqual(result['changed'], ['j'])
            reasons = {item['id']: item['reason'] for item in result['skipped_detail']}
            self.assertIn('正在执行', reasons['running'])
            self.assertIn('已产出版本', reasons['done'])
            with service.store.tx() as db:
                self.assertIsNone(service.store.get(db, 'jobs', 'j'))
                self.assertIsNotNone(service.store.get(db, 'jobs', 'running'))
                archives = service.store.all(db, 'deleted-tasks')
            self.assertEqual(len(archives), 1)
            self.assertEqual(archives[0]['scope'], 'task')

    def test_bulk_remove_keeps_sibling_task_and_candidate(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            service = self.seed(root)
            service.mutate('/api/jobs/bulk', {'action': 'remove', 'ids': ['j']})
            with service.store.tx() as db:
                self.assertIsNotNone(service.store.get(db, 'jobs', 'other'))
                self.assertIsNone(service.store.get(db, 'candidates', 'c').get('imported_at'))
                self.assertEqual(service.store.get(db, 'candidates', 'c')['status'], 'candidate')
