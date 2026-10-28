"""把转换队列聚焦到单个来源域。

批次是按提交顺序混着建的，一个 running 批次里同时有 4k99、poki、remix，
所以"停掉某个批次"选不中域名。队列只认 queued_at 升序，这里就把非目标域的
排队任务整体挪到远期（等于暂停），目标域排到队首。全程可逆。

用法：
  python tools/focus_host.py --host www.4k99.com               # 预览
  python tools/focus_host.py --host www.4k99.com --apply       # 只跑 4k99
  python tools/focus_host.py --host www.4k99.com --apply --revive   # 同时把该域受阻/待回复的一起重排队
  python tools/focus_host.py --restore                         # 还原被挪后的任务
"""
import argparse
import json
import sqlite3
import sys
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from controlplane.store import Store  # noqa: E402

PARKED = '2030-01-01T00:00:00+00:00'
MARK = 'focus_paused_original_queued_at'


def _write(db, sql, params, attempts=6):
    delay = 0.05
    for attempt in range(attempts):
        try:
            db.execute(sql, params)
            return
        except sqlite3.OperationalError as exc:
            if 'readonly' not in str(exc) or attempt == attempts - 1:
                raise
            time.sleep(delay)
            delay = min(delay * 2, 1.0)


def host_of(candidates, job):
    url = (candidates.get(job.get('candidate_id'), {}) or {}).get('url') or ''
    return urlsplit(url).hostname or ''


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', default='', help='要放行的来源域，如 www.4k99.com')
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--revive', action='store_true', help='同时把该域受阻/待回复的任务重排队')
    parser.add_argument('--restore', action='store_true', help='还原之前被挪后的任务')
    args = parser.parse_args()
    if not args.host and not args.restore:
        parser.error('需要 --host 或 --restore')

    store = Store(ROOT / 'data' / 'platform.sqlite3')
    with store.tx() as db:
        candidates = {r['id']: r for r in store.all(db, 'candidates')}
        jobs = store.all(db, 'jobs')

        if args.restore:
            restored = 0
            for job in jobs:
                if job.get(MARK):
                    job['queued_at'] = job.pop(MARK)
                    job.pop('focus_host', None)
                    _write(db, "UPDATE records SET data=? WHERE kind='jobs' AND id=?",
                           (json.dumps(job, ensure_ascii=False), job['id']))
                    restored += 1
            print(f'已还原 {restored} 个任务到原排队位置')
            return

        keep, park = [], []
        for job in jobs:
            if job.get('status') == 'queued' and not job.get(MARK):
                (keep if host_of(candidates, job) == args.host else park).append(job)
            elif (args.revive and job.get('status') in ('blocked', 'waiting_input')
                  and host_of(candidates, job) == args.host):
                keep.append(job)
        print(f'目标域 {args.host}：放行 {len(keep)} 个 · 暂停 {len(park)} 个')
        for job in keep[:5]:
            print('   放行', job['id'], (candidates.get(job['candidate_id'], {}) or {}).get('title', '')[:40])
        if not args.apply:
            print('\n这是预览。加 --apply 生效，可用 --restore 还原。')
            return

        now = datetime.now(timezone.utc)
        for index, job in enumerate(keep):
            job['queued_at'] = (now + timedelta(seconds=index)).isoformat()
            if job.get('status') != 'queued':
                job['status'] = 'queued'
                job.pop('question', None)
            job.pop('lease_token', None)
            job.pop('lease_expires_at', None)
            job['focus_host'] = args.host
            _write(db, "UPDATE records SET data=? WHERE kind='jobs' AND id=?",
                   (json.dumps(job, ensure_ascii=False), job['id']))
        for job in park:
            job[MARK] = job.get('queued_at') or job.get('created_at', '')
            job['queued_at'] = PARKED
            job['focus_host'] = args.host
            _write(db, "UPDATE records SET data=? WHERE kind='jobs' AND id=?",
                   (json.dumps(job, ensure_ascii=False), job['id']))
        print(f'已生效：{len(keep)} 个排到队首，{len(park)} 个挪后暂停')


if __name__ == '__main__':
    main()
