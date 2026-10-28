"""把 4k99 的排队任务挪到队尾，先让可转的站点跑出成果。

只改 queued_at（决定领取顺序），不动任务内容、不删任何任务，--restore 可原样恢复。
原因：4k99 现在启动游戏必须登录（弹 /modal/Login），每个任务都要白烧一轮 AI
与 240 秒采集预算；历史上该站成功过 8 个，属于站点新加的门槛，不是能力问题。
"""
import argparse
import json
import sqlite3
import sys
import time
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / 'executors'))
from controlplane.store import Store  # noqa: E402

PARKED = '2030-01-01T00:00:00+00:00'
MARK = '4k99'


def _write(conn, sql, params, attempts=6):
    delay = 0.05
    for attempt in range(attempts):
        try:
            conn.execute(sql, params)
            return
        except sqlite3.OperationalError as exc:
            if 'readonly' not in str(exc) or attempt == attempts - 1:
                raise
            time.sleep(delay)
            delay = min(delay * 2, 1.0)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--restore', action='store_true')
    args = parser.parse_args()
    store = Store(ROOT / 'data' / 'platform.sqlite3')
    with store.tx() as db:
        candidates = {r['id']: r for r in store.all(db, 'candidates')}
        jobs = store.all(db, 'jobs')
        parked = [j for j in jobs if j.get('original_queued_at')]
        if args.restore:
            for job in parked:
                job['queued_at'] = job.pop('original_queued_at')
                _write(db, "UPDATE records SET data=? WHERE kind='jobs' AND id=?",
                       (json.dumps(job, ensure_ascii=False), job['id']))
            print(f'已恢复 {len(parked)} 个 4k99 任务的原排队时间')
            return
        targets = [j for j in jobs
                   if j.get('status') == 'queued' and not j.get('original_queued_at')
                   and MARK in (urlsplit(candidates.get(j['candidate_id'], {}).get('url') or '').hostname or '')]
        print(f'排队中待挪后的 {MARK} 任务：{len(targets)} 个（当前已挪后 {len(parked)} 个）')
        for job in targets[:5]:
            print('  ', job['id'], candidates.get(job['candidate_id'], {}).get('url', '')[:70])
        if not args.apply:
            print('\n这是预览。加 --apply 才落库；--restore 可恢复。')
            return
        for job in targets:
            job['original_queued_at'] = job.get('queued_at')
            job['queued_at'] = PARKED
            _write(db, "UPDATE records SET data=? WHERE kind='jobs' AND id=?",
                   (json.dumps(job, ensure_ascii=False), job['id']))
        print(f'已把 {len(targets)} 个 {MARK} 任务排到队尾')


if __name__ == '__main__':
    main()
