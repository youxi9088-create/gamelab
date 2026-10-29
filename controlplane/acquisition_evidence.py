"""Engine evidence produced by the web acquisition step.

The acquisition step writes ``web-acquisition.json`` into each job run directory
with the engine it actually detected while fetching the original build. That is
the only engine evidence a candidate has before a conversion succeeds, and it
covers the long tail of candidates still marked 待分析.

Directory scans are memoised: ``state()`` is served on every dashboard poll and
must not re-read hundreds of run directories each time.
"""
import json
import time
from pathlib import Path

LABELS = {'cocos2': 'Cocos 2', 'browser': '通用 Web 运行包', 'ruffle': 'Ruffle / Flash'}
# Most specific wins: a candidate whose later attempt was downgraded to the
# generic browser runtime still deserves the Cocos label from the earlier one.
PRIORITY = ('cocos2', 'ruffle', 'browser')
CACHE_SECONDS = 120

_CACHE = {'key': None, 'at': 0.0, 'signature': None, 'value': {}}


def engine_by_candidate(runs_dir, jobs):
    """Map candidate id -> engine label, using acquisition evidence from run dirs."""
    root = Path(runs_dir)
    key = str(root)
    now = time.monotonic()
    if _CACHE['key'] == key and now - _CACHE['at'] < CACHE_SECONDS:
        return _CACHE['value']
    signature = _signature(root)
    if signature is not None and signature == _CACHE.get('signature'):
        # Nothing was written since the last scan; keep the value and re-arm the TTL.
        _CACHE['at'] = now
        return _CACHE['value']
    by_job = _scan(root)
    job_to_candidate = {j['id']: j.get('candidate_id') for j in jobs if j.get('id')}
    merged = {}
    for job_id, engines in by_job.items():
        candidate_id = job_to_candidate.get(job_id)
        if not candidate_id:
            continue
        merged.setdefault(candidate_id, set()).update(engines)
    value = {cid: LABELS[_prefer(codes)] for cid, codes in merged.items() if _prefer(codes)}
    _CACHE.update(key=key, at=now, signature=signature, value=value)
    return value


def _signature(root):
    """Cheap change marker: entry count plus newest mtime, ~10ms for ~850 dirs."""
    try:
        entries = list(root.iterdir())
    except OSError:
        return None
    try:
        return (len(entries), max(entry.stat().st_mtime for entry in entries))
    except (OSError, ValueError):
        return None


def _prefer(codes):
    for code in PRIORITY:
        if code in codes:
            return code
    return None


def _scan(root):
    if not root.is_dir():
        return {}
    by_job = {}
    try:
        entries = list(root.iterdir())
    except OSError:
        return {}
    for directory in entries:
        evidence = directory / 'web-acquisition.json'
        binding = directory / 'job-binding.json'
        if not evidence.exists():
            continue
        try:
            job_id = json.loads(binding.read_text(encoding='utf-8')).get('job_id')
            engine = json.loads(evidence.read_text(encoding='utf-8')).get('engine')
        except (OSError, ValueError, AttributeError):
            continue
        if job_id and engine in LABELS:
            by_job.setdefault(job_id, set()).add(engine)
    return by_job


def reset():
    """Drop the memoised scan; tests and long-lived processes use this."""
    _CACHE.update(key=None, at=0.0, signature=None, value={})
