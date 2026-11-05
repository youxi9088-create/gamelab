"""Read-only UI statistics worker, isolated from HTTP request threads."""
import json
import sys
import threading
import time
import traceback
from pathlib import Path

if not __package__:
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    __package__ = 'controlplane'


def main():
    import faulthandler
    faulthandler.dump_traceback_later(25)
    from .service import Service
    from .store import Store
    from .repository import Repository, git_binary
    from .ui_state import summary
    data_dir, repo_dir, runs_dir, play_url = sys.argv[1:5]
    service = Service.__new__(Service)
    service.data_dir, service.runs_dir = Path(data_dir), Path(runs_dir)
    service.store = Store.__new__(Store)
    service.store.path = service.data_dir / 'platform.sqlite3'
    service.repo = Repository.__new__(Repository)
    service.repo.root, service.repo.artifacts = Path(repo_dir), service.data_dir / 'artifacts'
    service.repo.git = git_binary()
    service.play_url = play_url
    stopped = threading.Event()
    # EOF means the owning UI process exited; do not leave orphan workers.
    def watch_parent():
        sys.stdin.buffer.read()
        stopped.set()
    threading.Thread(target=watch_parent, daemon=True).start()
    from .ui_live import operational
    latest = [None]
    def statistics():
        first=True
        while not stopped.is_set():
            started=time.monotonic()
            try:
                value=summary(service.state(defer_engine_evidence=first))
                first=False
                value['ui_build_seconds']=round(time.monotonic()-started,3)
                from .store import now
                value['ui_statistics_built_at']=now()
                latest[0]=value
                faulthandler.cancel_dump_traceback_later()
            except Exception:
                traceback.print_exc(file=sys.stderr)
            stopped.wait(30)
    threading.Thread(target=statistics,daemon=True).start()
    while not stopped.is_set():
        try:
            if latest[0] is None:
                stopped.wait(1)
                continue
            value=operational(service,latest[0])
            sys.stdout.buffer.write(json.dumps(value, ensure_ascii=False, separators=(',', ':')).encode('utf-8') + b'\n')
            sys.stdout.buffer.flush()
        except (BrokenPipeError, OSError):
            return
        except Exception:
            traceback.print_exc(file=sys.stderr)
        stopped.wait(2)


if __name__ == '__main__':
    main()
