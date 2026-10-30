import os
import subprocess
import sys
import unittest
from pathlib import Path


class WorkerEncodingTests(unittest.TestCase):
    def test_job_pipe_ignores_local_console_encoding(self):
        root=Path(__file__).resolve().parents[1]
        script="""
import sys,json
sys.path.insert(0,'executors')
import worker
worker.execute=lambda client,job: print(json.dumps(job,ensure_ascii=True))
sys.argv=['worker','--execute-job','--token','isolated-fixture']
worker.main()
"""
        raw='{"title":"游戏入口 🏛","path":"E:/游戏/任务"}'
        p=subprocess.run([sys.executable,'-c',script],input=raw.encode('utf-8'),capture_output=True,
                         cwd=root,env={**os.environ,'PYTHONIOENCODING':'ascii'})
        self.assertEqual(p.returncode,0,p.stderr.decode('utf-8',errors='replace'))
        import json
        self.assertEqual(json.loads(p.stdout),json.loads(raw))
