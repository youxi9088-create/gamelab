"""UI projections. Full state remains the source for metrics and detail evidence."""
from copy import deepcopy
import threading
import time
import os

_lock = threading.Lock()
_cache = {}
_refreshing = set()
_processes = {}


def start_snapshot_worker(service):
    """One persistent child per UI service; CPU-heavy builds cannot hold its GIL."""
    import subprocess
    import sys
    from pathlib import Path
    key = str(service.data_dir)
    with _lock:
        if key in _processes:
            return _processes[key]
        ready = threading.Event()
        _processes[key] = ready
    def consume():
        while True:
            try:
                with (Path(service.data_dir) / 'ui-snapshot-worker.log').open('ab') as errors:
                    child = subprocess.Popen([sys.executable, '-X', 'utf8', str(Path(__file__).with_name('ui_snapshot_worker.py')),
                        key, str(service.repo.root), str(service.runs_dir), service.play_url],
                        cwd=str(Path(__file__).resolve().parents[1]), stdin=subprocess.PIPE,
                        stdout=subprocess.PIPE, stderr=errors,
                        creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
                    for line in child.stdout:
                        import json
                        value = json.loads(line)
                        with _lock:
                            _cache[key] = (time.monotonic(), value)
                        ready.set()
                    child.wait()
            except Exception:
                import logging
                logging.exception('UI snapshot worker failed; preserving last good snapshot')
            time.sleep(2)
    threading.Thread(target=consume, daemon=True).start()
    return ready


def cached_summary(service):
    key = str(service.data_dir)
    if os.getenv('PORTAL_UI_SNAPSHOT_PROCESS') == '1':
        ready = start_snapshot_worker(service)
        if not ready.wait(45):
            from .service import ApiError
            raise ApiError(503, '统计快照正在准备，请稍后刷新')
        with _lock:
            prior = _cache[key]
            return dict(prior[1], ui_snapshot_age_seconds=round(time.monotonic()-prior[0], 1))
    with _lock:
        prior = _cache.get(key)
        if prior:
            if time.monotonic()-prior[0] > 3 and key not in _refreshing:
                _refreshing.add(key)
                threading.Thread(target=_refresh, args=(service, key), daemon=True).start()
            return dict(prior[1], ui_snapshot_age_seconds=round(time.monotonic()-prior[0], 1))
    # Only the first request waits for a snapshot. Refreshes never block readers.
    value = summary(service.state())
    with _lock:
        _cache[key] = (time.monotonic(), value)
    return dict(value, ui_snapshot_age_seconds=0)


def _refresh(service, key):
    try:
        value = summary(service.state())
        with _lock:
            _cache[key] = (time.monotonic(), value)
    except Exception:
        import logging
        logging.exception('UI snapshot refresh failed; retaining last successful snapshot')
    finally:
        with _lock:
            _refreshing.discard(key)


def small(value, depth=0):
    if isinstance(value, str):
        return value[:1600]
    if isinstance(value, dict):
        if depth >= 3:
            return {k: v for k, v in value.items() if isinstance(v, (bool, int, float)) or v is None}
        return {k: small(v, depth+1) for k, v in value.items()
                if k not in {'observations', 'raw', 'source_html', 'runtime_contract', 'resource_requests',
                             'verification_evidence', 'files', 'acquisition', 'history', 'events', 'attempts'}}
    if isinstance(value, list):
        return [small(v, depth+1) for v in value[:24]] if depth < 3 else []
    return value


def summary(state):
    result = dict(state)
    for key in ('candidates', 'jobs', 'versions'):
        rows = []
        for source in state.get(key, []):
            row = dict(source)
            for field in ('observations', 'acquisition', 'raw', 'source_html'):
                row.pop(field, None)
            if key == 'candidates':
                row.pop('dependencies', None)
            if 'report' in row:
                report = row['report'] or {}
                row['report'] = {k: (v[:500] if isinstance(v, str) else v) for k, v in report.items()
                                 if v is None or isinstance(v, (str, bool, int, float))}
                for k in ('viewport', 'display', 'controls', 'review_checks'):
                    if k in report:
                        row['report'][k] = small(report[k])
            if 'pipeline' in row:
                p = row['pipeline']
                row['pipeline'] = {k: small(v) for k, v in p.items() if k in ('current', 'presentation', 'note')}
                row['pipeline']['nodes'] = [{k: small(v) for k, v in n.items()
                    if k in ('key', 'label', 'status', 'group', 'optional')}
                    for n in p.get('nodes', [])]
                for node in row['pipeline']['nodes']:
                    node['records'] = []
            rows.append(row)
        result[key] = rows
    result['rounds'] = []
    result['messages'] = []
    result['events'] = [{k: row[k] for k in ('id', 'message', 'job_id', 'stage', 'created_at') if k in row}
                        for row in state.get('events', [])[:40]]
    result['ui_summary'] = True
    return result


def detail(state, candidate_id):
    """Return one game's complete records, without changing or pruning evidence."""
    collections = ('candidates', 'jobs', 'versions', 'messages', 'rounds', 'events')
    job_ids = {j['id'] for j in state.get('jobs', []) if j.get('candidate_id') == candidate_id}
    return {key: [deepcopy(row) for row in state.get(key, [])
                  if row.get('candidate_id') == candidate_id or row.get('job_id') in job_ids
                  or (key == 'candidates' and row['id'] == candidate_id)] for key in collections}
