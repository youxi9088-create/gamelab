import json
import subprocess
import tempfile
import threading
import unittest
from pathlib import Path
from controlplane.runtime import node_binary
from controlplane.service import Service
from server import build_server

# 每个任务一种产线证据：列必须显示成不同文案，而不是统一的占位。
LINES = [({'report': {'recovery_kind': 'discovered-web-cocos2', 'runtime_verified': True}}, {}, '网页采集 · 本地运行包'),
         ({'stage': 'reconstruct', 'route': 'B'}, {}, 'AI 复刻'),
         ({}, {'url': '#小程序://几何王国/Xq1y10POetHAipF'}, 'REA 反编译'),
         ({'report': {'recovery_kind': 'provided_source'}}, {}, '原版源码整理')]


class RouteColumnTest(unittest.TestCase):
    def test_each_task_shows_its_own_production_line(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            service = Service(root / 'data', root / 'repo', 'http://127.0.0.1:8766')
            batch = service.mutate('/api/conversions', {'urls': ['https://example.org/route-' + str(i) for i in range(len(LINES))]})
            with service.store.tx() as db:
                for job, (patch, candidate_patch, _) in zip(batch['jobs'], LINES):
                    job.update(patch)
                    service.store.put(db, 'jobs', job)
                    if candidate_patch:
                        candidate = service.get(db, 'candidates', job['candidate_id'])
                        candidate.update(candidate_patch)
                        service.store.put(db, 'candidates', candidate)
            server = build_server(service, 0)
            threading.Thread(target=server.serve_forever, daemon=True).start()
            try:
                result = subprocess.run([str(node_binary()), 'tools/check_route_column.cjs',
                                         f'http://127.0.0.1:{server.server_port}',
                                         json.dumps([line for *_ , line in LINES], ensure_ascii=False)],
                                        capture_output=True, text=True, timeout=120, cwd=str(Path(__file__).resolve().parents[1]))
                self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            finally:
                server.shutdown()
                server.server_close()
