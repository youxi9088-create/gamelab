import json
import subprocess
import tempfile
import threading
import unittest
from pathlib import Path
from controlplane.runtime import node_binary
from controlplane.service import Service
from server import build_server

# 任务中心列表的真实使用方式：一次进来几百个任务，靠搜索/筛选/翻页缩小范围，
# 再对个别任务点删除。以下 60 个任务覆盖四种产线与三种状态。
TOTAL = 60


class JobsListTest(unittest.TestCase):
    def test_search_filter_pagination_and_remove(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            service = Service(root / 'data', root / 'repo', 'http://127.0.0.1:8766')
            batch = service.mutate('/api/conversions', {'urls': [f'https://example.org/toolbar-{i}' for i in range(TOTAL)]})
            with service.store.tx() as db:
                for index, job in enumerate(batch['jobs']):
                    job['report'] = {'recovery_kind': 'discovered-web-cocos2'} if index % 4 == 0 else {}
                    if index % 4 == 1:
                        job.update({'stage': 'reconstruct', 'route': 'B'})
                    if index % 5 == 0:
                        job['status'] = 'blocked'
                    elif index % 7 == 0:
                        job['status'] = 'waiting_input'
                    service.store.put(db, 'jobs', job)
                    candidate = service.store.get(db, 'candidates', job['candidate_id'])
                    candidate['title'] = f'toolbar-{index}'
                    service.store.put(db, 'candidates', candidate)
            server = build_server(service, 0)
            threading.Thread(target=server.serve_forever, daemon=True).start()
            try:
                result = subprocess.run([str(node_binary()), 'tools/check_jobs_toolbar.cjs',
                                         f'http://127.0.0.1:{server.server_port}'],
                                        capture_output=True, text=True, timeout=180,
                                        cwd=str(Path(__file__).resolve().parents[1]))
                self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
                print(result.stdout)
            finally:
                server.shutdown()
                server.server_close()
