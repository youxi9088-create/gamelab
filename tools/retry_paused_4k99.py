"""批量重排队被暂停的转换任务，并记录每轮耗时。

背景：任务停在 waiting_input（等人工回复）。API 的 retry 只接受 blocked/failed，
waiting_input 走不通，所以这里直接改状态重新排队。对网络抖动类（连接被断、
类型检测超时）尤其合适——站点本身没问题，是那一轮没连上，重跑就能继续。
登录态由 data/browser-sessions/<host>.json 提供，采集时自动带上，无需再人工登录。

用法：
  python tools/retry_paused_4k99.py --host poki.com              # 预览
  python tools/retry_paused_4k99.py --host poki.com --apply      # 重新排队（默认插到队首）
  python tools/retry_paused_4k99.py --host poki.com --apply --order append   # 排到队尾
  python tools/retry_paused_4k99.py --host www.4k99.com --watch 360          # 监控并记录耗时
  python tools/retry_paused_4k99.py --host poki.com --status blocked         # 也带上受阻任务
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

REPORTS = ROOT / 'data' / 'reports'


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


def session_preflight(host):
    """登录态不存在或已过期时，重试毫无意义，先挡住。没有存档说明该站本来就
    不需要登录（如 poki），不是拦路条件。"""
    path = ROOT / 'data' / 'browser-sessions' / (host + '.json')
    if not path.exists():
        return '无登录态存档，该站按免登录处理'
    try:
        state = json.loads(path.read_text('utf-8'))
    except ValueError:
        return '登录态文件不是合法 JSON：' + str(path)
    expired = ''
    for cookie in state.get('cookies', []):
        if cookie.get('name') == 'token_expired_at':
            expired = cookie.get('value', '')
    if not any(c.get('name') == 'token' and c.get('value') for c in state.get('cookies', [])):
        return '登录态里没有 token，登录可能没成功'
    return 'OK · cookie %d 个 · token_expired_at=%s' % (len(state.get('cookies', [])), expired or '未记录')


def paused_jobs(db, store, candidates, mark, statuses):
    out = []
    for job in store.all(db, 'jobs'):
        url = candidates.get(job['candidate_id'], {}).get('url') or ''
        if job.get('status') in statuses and mark in (urlsplit(url).hostname or ''):
            out.append((job, url))
    return out


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', default='www.4k99.com', help='来源域名关键词，如 poki.com')
    parser.add_argument('--status', default='waiting_input',
                        help='要重排队的状态，逗号分隔，如 waiting_input,blocked')
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--order', choices=['front', 'append'], default='front')
    parser.add_argument('--watch', type=int, metavar='MINUTES')
    parser.add_argument('--report', default='')
    args = parser.parse_args()
    mark = args.host
    statuses = {s.strip() for s in args.status.split(',') if s.strip()}
    batch = '%s-retry' % mark
    print('登录态预检：', session_preflight(mark))

    store = Store(ROOT / 'data' / 'platform.sqlite3')
    with store.tx() as db:
        candidates = {r['id']: r for r in store.all(db, 'candidates')}
        found = paused_jobs(db, store, candidates, mark, statuses)
        print(f'待重排队的 {mark} 任务：{len(found)} 个（状态 {sorted(statuses)}）')
        for job, url in found[:5]:
            print('  ', job['id'], url[:70])

        if args.watch:
            return watch(args.watch, args.report, batch)

        if not args.apply:
            print('\n这是预览。加 --apply 重新排队（--order front 插到队首，append 排队尾）。')
            return

        jobs = store.all(db, 'jobs')
        queued = [j.get('queued_at') or j.get('created_at', '') for j in jobs if j.get('status') == 'queued']
        if args.order == 'front' and queued:
            base = datetime.fromisoformat(min(queued)) - timedelta(hours=1)
        else:
            base = datetime.now(timezone.utc)
        for index, (job, url) in enumerate(found):
            stamp = (base + timedelta(seconds=index)).isoformat()
            job['previous_waiting_reason'] = str(job.get('reason') or job.get('question') or '')[:500]
            job['retry_batch'] = batch
            job['retry_queued_at'] = datetime.now(timezone.utc).isoformat()
            job['status'] = 'queued'
            job['queued_at'] = stamp
            job['reason'] = f'已按 {mark} 重新排队（{batch}）'
            job.pop('lease_token', None)
            job.pop('lease_expires_at', None)
            job.pop('question', None)
            _write(db, "UPDATE records SET data=? WHERE kind='jobs' AND id=?",
                   (json.dumps(job, ensure_ascii=False), job['id']))
        print(f'已重新排队 {len(found)} 个任务（{args.order}）')


def _read_jobs():
    """只读轮询。写事务（BEGIN IMMEDIATE）会与平台抢锁，监控不该写库。"""
    db = sqlite3.connect(str(ROOT / 'data' / 'platform.sqlite3'), timeout=30)
    try:
        db.execute('PRAGMA busy_timeout=30000')
        return {json.loads(r[0])['id']: json.loads(r[0])
                for r in db.execute("select data from records where kind='jobs'")}
    finally:
        db.close()


def watch(minutes, report_path, batch):
    """记录这批任务每一轮的起止与耗时。"""
    REPORTS.mkdir(parents=True, exist_ok=True)
    target = Path(report_path) if report_path else REPORTS / ('4k99-retry-%s.jsonl' % time.strftime('%Y%m%d-%H%M%S'))
    deadline = time.time() + minutes * 60
    running, finished = {}, 0
    ids = [job['id'] for job in _read_jobs().values() if job.get('retry_batch') == BATCH]
    total = len(ids)
    print('监控中，日志：' + str(target), flush=True)
    print(f'跟踪任务 {total} 个', flush=True)
    with target.open('a', encoding='utf-8') as log:
        while time.time() < deadline and finished < total:
            time.sleep(20)
            rows = _read_jobs()
            for job_id in ids:
                job = rows.get(job_id)
                if not job:
                    continue
                status = job.get('status')
                if status == 'running' and job_id not in running:
                    running[job_id] = job.get('started_at') or datetime.now(timezone.utc).isoformat()
                if job_id in running and status != 'running':
                    started = running.pop(job_id)
                    try:
                        seconds = (datetime.fromisoformat(job.get('completed_at') or job.get('updated_at') or
                                                          datetime.now(timezone.utc).isoformat())
                                   - datetime.fromisoformat(started)).total_seconds()
                    except ValueError:
                        seconds = None
                    finished += 1
                    row = {'job_id': job_id, 'status': status, 'started_at': started,
                           'ended_at': job.get('completed_at') or job.get('updated_at'),
                           'duration_seconds': round(seconds, 1) if seconds is not None else None,
                           'reason': str(job.get('reason') or '')[:200]}
                    log.write(json.dumps(row, ensure_ascii=False) + '\n')
                    log.flush()
                    print(f'[{finished}/{total}] {job_id} -> {status} 耗时 {row["duration_seconds"]}s', flush=True)
            print(f'{time.strftime("%H:%M:%S")} 进行中 {len(running)} · 已完成 {finished} · 剩余 {total - finished}', flush=True)
        print('监控结束，共记录 %d 条' % finished, flush=True)


if __name__ == '__main__':
    main()
