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
        self.thread = None
        self.restarts = 0
        self._probe = None
        self._probe_time = 0
        self._probe_lock = threading.Lock()

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
               'REPLICA_SERVICE_CONFIG':str(self.service.data_dir / 'services.json')}
        def watch():
            while not self.stop.is_set():
                try:
                    with (self.service.data_dir / 'executor.log').open('a',encoding='utf-8') as log:
                        self.process = subprocess.Popen([sys.executable,str(ROOT/'executors/worker.py'),
                            '--url',f'http://127.0.0.1:{self.port}','--automatic','--parent-pid',str(os.getpid())],cwd=ROOT,env=env,
                            stdout=log,stderr=log,creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0)
                        while self.process.poll() is None and not self.stop.wait(1): pass
                        if self.stop.is_set() and self.process.poll() is None:
                            if os.name=='nt':
                                subprocess.run(['taskkill','/PID',str(self.process.pid),'/T','/F'],capture_output=True,creationflags=subprocess.CREATE_NO_WINDOW)
                            else:self.process.terminate()
                            self.process.wait(timeout=10)
                        self.restarts += 1
                except Exception: pass
                self.stop.wait(3)
        self.thread = threading.Thread(target=watch, daemon=True)
        self.thread.start()

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
                        checks.update({key:result.returncode==0 and reported.get(key) is True for key in ('rea','playwright','browser')})
                    except (OSError,ValueError,KeyError,subprocess.TimeoutExpired):checks['probe']=False
                self._probe=checks;self._probe_time=time.monotonic()
            checks=dict(self._probe)
        missing=[key for key,value in checks.items() if not value]
        ready=running and not missing
        detail='执行器及 Node、REA 安装、浏览器启动检查通过；不代表任意游戏可自动适配'
        if not running:detail='内置执行器未运行'
        if missing:detail+='；依赖检查未通过：'+', '.join(missing)
        return dict(ok=ready,ready=ready,capabilities=['wechat_to_web'],restarts=self.restarts,checks=checks,detail=detail)

    def close(self):
        self.stop.set()
        if self.thread:self.thread.join(timeout=12)
        if hasattr(self,'package_service'):self.package_service.close()
