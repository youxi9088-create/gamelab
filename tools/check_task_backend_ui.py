"""Render the standalone backend with isolated data; stop every child process."""
import os
import socket
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from controlplane.runtime import node_binary


def main():
    output = ROOT / 'qa-output'
    output.mkdir(exist_ok=True)
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        port = sock.getsockname()[1]
    with tempfile.TemporaryDirectory(prefix='task-backend-ui-', dir=output) as temp:
        log_path = output / 'task-backend-ui-server.log'
        with log_path.open('w', encoding='utf-8') as log:
            process = subprocess.Popen([
                sys.executable, str(ROOT / 'services/task_backend/app.py'),
                '--port', str(port), '--no-executor', '--no-discovery',
                '--data-dir', str(Path(temp) / 'data'),
                '--repo-dir', str(Path(temp) / 'repo'),
            ], cwd=ROOT, env={**os.environ, 'PYTHONIOENCODING': 'utf-8'},
               stdout=log, stderr=log)
            try:
                url = f'http://127.0.0.1:{port}'
                for _ in range(100):
                    if process.poll() is not None:
                        raise RuntimeError(f'Backend exited with {process.returncode}; see {log_path}')
                    try:
                        with urllib.request.urlopen(url + '/health', timeout=1) as response:
                            if response.status == 200:
                                break
                    except OSError:
                        time.sleep(0.1)
                else:
                    raise RuntimeError('Backend did not become ready')
                result = subprocess.run([
                    node_binary(), str(ROOT / 'tools/check_task_backend_ui.cjs'), url,
                ], cwd=ROOT, text=True, capture_output=True, timeout=120)
                if result.stdout:
                    print(result.stdout, end='')
                if result.stderr:
                    print(result.stderr, end='', file=sys.stderr)
                return result.returncode
            finally:
                process.terminate()
                try:
                    process.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait(timeout=5)


if __name__ == '__main__':
    sys.exit(main())
