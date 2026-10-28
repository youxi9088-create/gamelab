"""Queue watcher: print job status distribution and the active jobs.

The platform stores everything in a KV table records(kind, id, data JSON),
so jobs are read by kind='jobs' and decoded from JSON.

Usage: python tools/watch_queue.py [--detail] [--status completed]
"""
import json
import sqlite3
import sys
from collections import Counter
from pathlib import Path

DB = Path(__file__).resolve().parents[1] / 'data' / 'platform.sqlite3'


def load_jobs():
    conn = sqlite3.connect(f'file:{DB}?mode=ro', uri=True)
    candidates = {}
    for (_id, data) in conn.execute("SELECT id, data FROM records WHERE kind='candidates'"):
        try:
            candidates[_id] = json.loads(data)
        except Exception:
            pass
    jobs = []
    for (_id, data) in conn.execute("SELECT id, data FROM records WHERE kind='jobs'"):
        try:
            row = json.loads(data)
        except Exception:
            continue
        row.setdefault('id', _id)
        candidate = candidates.get(row.get('candidate_id') or '', {})
        for key in ('title', 'name', 'url', 'source_url'):
            if not row.get(key) and candidate.get(key):
                row[key] = candidate[key]
        jobs.append(row)
    return jobs


def title(j):
    for k in ('title', 'name', 'source_url', 'url', 'link'):
        v = j.get(k)
        if v:
            return str(v)
    return j.get('id', '?')


def main():
    jobs = load_jobs()
    dist = Counter(j.get('status', '?') for j in jobs)
    print('=== distribution ===')
    for status, count in dist.most_common():
        print(f'  {status:<16} {count}')
    print(f'  {"TOTAL":<16} {len(jobs)}')

    active = [j for j in jobs if j.get('status') in ('running', 'queued', 'claimed')]
    active.sort(key=lambda j: (j.get('progress') or 0), reverse=True)
    print(f'=== active ({len(active)}) ===')
    for j in active[:12]:
        print(f'  {j.get("id")}  p={j.get("progress") or 0:<4} {j.get("status"):<9} {title(j)[:58]}')

    if '--detail' in sys.argv:
        want = None
        for a in sys.argv:
            if a.startswith('--status='):
                want = a.split('=', 1)[1]
        term = [j for j in jobs if j.get('status') in
                ('completed', 'review', 'pending_review', 'failed', 'blocked', 'waiting_input')]
        if want:
            term = [j for j in term if j.get('status') == want]
        term.sort(key=lambda j: j.get('id', ''))
        print(f'=== terminal ({len(term)}) ===')
        for j in term[:50]:
            reason = str(j.get('blocked_reason') or j.get('error') or j.get('last_error') or '')[:50]
            print(f'  {j.get("id")}  {j.get("status"):<14} {title(j)[:52]} {reason}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
