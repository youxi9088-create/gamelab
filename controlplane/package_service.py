"""Lifecycle owner for the adjacent, trusted local conversion service."""
import json
import os
import subprocess
import sys
import threading
import urllib.request
from pathlib import Path
from .runtime import node_binary


def service_directory(root=None):
    """Retain installed adjacent services; clean checkouts use bundled source."""
    if os.environ.get('REPLICA_PACKAGE_SERVICE_DIR'):
        return Path(os.environ['REPLICA_PACKAGE_SERVICE_DIR']).expanduser().resolve()
    root=Path(root) if root else Path(__file__).resolve().parents[1]
    adjacent=root.parent/'wechat-web-service'
    return adjacent if (adjacent/'server.py').is_file() else root/'services'/'wechat-web-service'


class PackageService:
    def __init__(self, data):
        self.data=Path(data);self.stop=threading.Event();self.process=None;self.thread=None

    def start(self):
        def watch():
            while not self.stop.is_set():
                try:
                    config=json.loads((self.data/'services.json').read_text('utf-8')).get('wechat',{})
                    enabled=config.get('backend')=='wxapkg_v1' and config.get('base_url')=='http://127.0.0.1:8770'
                    if enabled and (self.process is None or self.process.poll() is not None):
                        try:
                            with urllib.request.urlopen('http://127.0.0.1:8770/health',timeout=2) as response:response.read(1024)
                        except OSError:
                            directory=service_directory()
                            node=node_binary()
                            if node and (directory/'server.py').is_file():
                                with (self.data/'package-converter.log').open('a',encoding='utf-8') as log:
                                    self.process=subprocess.Popen([sys.executable,str(directory/'server.py')],cwd=directory,
                                        env={**os.environ,'NODE_BIN':node,'PYTHONIOENCODING':'utf-8'},stdout=log,stderr=log,
                                        creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0)
                except (OSError,ValueError):pass
                self.stop.wait(3)
        self.thread=threading.Thread(target=watch,daemon=True);self.thread.start()

    def close(self):
        self.stop.set()
        if self.thread:self.thread.join(timeout=5)
        if self.process and self.process.poll() is None:
            if os.name=='nt':subprocess.run(['taskkill','/PID',str(self.process.pid),'/T','/F'],capture_output=True,creationflags=subprocess.CREATE_NO_WINDOW)
            else:self.process.terminate()
