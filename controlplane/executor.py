"""Lifecycle-bound worker supervisor. Tokens stay server-side, logs are local."""
import os
import json
import subprocess
import sys
import threading
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class Executor:
    def __init__(self, service, port):
        self.service, self.port = service, port
        self.stop = threading.Event()
        self.process = None
        self.processes = []
        self.threads = []
        self.thread = None
        self.restarts = 0
        self._probe = None
        self._probe_time = 0
        self._probe_lock = threading.Lock()
        self._lock = threading.Lock()

    def start(self):
        from .package_service import PackageService
        self.package_service=PackageService(self.service.data_dir)
        self.package_service.start()
        token_file = self.service.data_dir / 'executor-token.txt'
        token = token_file.read_text('utf-8').strip() if token_file.exists() else ''
        try: self.service.authenticate(token)
        except Exception:
            registration = self.service.mutate('/api/tools', {'name':'内置自动转换执行器','capabilities':['rea','reconstruct']})
            token = registration['token']
            token_file.write_text(token, 'utf-8')
        env = {**os.environ, 'PLATFORM_TOOL_TOKEN':token, 'PYTHONIOENCODING':'utf-8',
               'REPLICA_SERVICE_CONFIG':str(self.service.data_dir / 'services.json'),
               'REPLICA_RUNS_ROOT':str(self.service.runs_dir)}
        slots = self._slots()

        def watch(slot):
            # 每个槽位一个独立看门狗：worker 是"领一个任务→跑完→再领"的串行循环，
            # 想真正并行只能起多个进程。认领在服务端是事务性的，多进程不会重复领同一个。
            while not self.stop.is_set():
                try:
                    with (self.service.data_dir / 'executor.log').open('a',encoding='utf-8') as log:
                        process = subprocess.Popen([sys.executable,str(ROOT/'executors/worker.py'),
                            '--url',f'http://127.0.0.1:{self.port}','--automatic','--parent-pid',str(os.getpid()),
                            '--worker-id',f'python-rea-ai-worker-{slot}'],cwd=ROOT,env=env,
                            stdout=log,stderr=log,creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0)
                        with self._lock:
                            self.processes = [p for p in self.processes if p is not process] + [process]
                            if slot == 1: self.process = process
                        while process.poll() is None and not self.stop.wait(1): pass
                        if self.stop.is_set() and process.poll() is None:
                            self._kill(process)
                        self.restarts += 1
                except Exception: pass
                self.stop.wait(3)
        for slot in range(1, slots + 1):
            thread = threading.Thread(target=watch, args=(slot,), daemon=True)
            thread.start(); self.threads.append(thread)

    def _slots(self):
        """并发槽位数取服务端设置，读不到就退回 1（保守值）。"""
        try:
            with self.service.store.tx() as db:
                value = (self.service.store.get(db,'settings','main') or {}).get('concurrency', 1)
            return max(1, min(16, int(value)))
        except Exception:
            return 1

    def _kill(self, process):
        try:
            if os.name == 'nt':
                subprocess.run(['taskkill','/PID',str(process.pid),'/T','/F'],capture_output=True,creationflags=subprocess.CREATE_NO_WINDOW)
            else:
                process.terminate()
            process.wait(timeout=10)
        except Exception: pass

    def health(self):
        running = bool(self.process and self.process.poll() is None and not self.stop.is_set())
        from .runtime import node_binary
        with self._probe_lock:
            if self._probe is None or time.monotonic()-self._probe_time > 60:
                node=node_binary()
                checks={'node':bool(node)}
                if node:
                    try:
                        result=subprocess.run([node,str(ROOT/'executors/readiness.cjs')],capture_output=True,text=True,timeout=20,
                            creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0)
                        reported=json.loads(result.stdout)['checks']
                        checks.update({key:result.returncode==0 and reported.get(key) is True for key in ('rea','rea-analysis','playwright','browser')})
                    except (OSError,ValueError,KeyError,subprocess.TimeoutExpired):checks['probe']=False
                self._probe=checks;self._probe_time=time.monotonic()
            checks=dict(self._probe)
        missing=[key for key,value in checks.items() if not value]
        ready=running and not missing
        detail='执行器及 Node、REA 原生分析样例、Playwright 和浏览器启动检查通过；不代表任意游戏可自动适配'
        if not running:detail='内置执行器未运行'
        if missing:detail+='；依赖检查未通过：'+', '.join(missing)
        return dict(ok=ready,ready=ready,capabilities=['wechat_to_web'],restarts=self.restarts,checks=checks,detail=detail)

    def close(self):
        self.stop.set()
        for thread in self.threads:thread.join(timeout=12)
        if self.thread:self.thread.join(timeout=12)
        if hasattr(self,'package_service'):self.package_service.close()
