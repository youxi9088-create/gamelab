"""Requeue jobs whose waiting_input verdict is stale rather than real.

Two verdict classes recorded on 2026-10-27 are no longer trustworthy:

  1. ``ERR_CONNECTION_CLOSED`` / ``ERR_CONNECTION_RESET`` / ``ERR_NAME_NOT_RESOLVED``
     -- the outbound proxy was down, so the site was never actually reached.
  2. "已定位游戏 iframe 但页面内未渲染出可运行画面" -- collected *before*
     acquire.cjs learned to wait for request silence, so a slow canvas looked
     exactly like a site lock.

Both are re-runnable now: the proxy is healthy and the capture/verify fixes
(missing-before-errors priority, wider repair budget) are in place. Requeueing
is reversible, so it is safe to give these jobs a fresh attempt.

The queued set is then re-sorted by observed per-domain success, highest first,
because the claim order is ``queued_at`` ascending.
"""
import argparse
import json
import sqlite3
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlparse

DB = Path(__file__).resolve().parents[1] / 'data' / 'platform.sqlite3'

NET_VERDICT = ('ERR_CONNECTION_CLOSED', 'ERR_CONNECTION_RESET', 'ERR_NAME_NOT_RESOLVED', '无法访问页面')
STALE_VERDICT = ('未渲染出可运行画面', '未确认游戏类型或运行入口', '检测超时')
# Under WAL the last connection to close deletes the -wal/-shm pair, which made
# the server's next write fail with "attempt to write a readonly database".
# Heartbeats and playback both went through that path, so jobs died with a bare
# HTTP 500 unrelated to the game. Store.tx() now reopens on that error, so
# these are retryable again.
DB_VERDICT = ('HTTP Error 500',)
# Cocos 按需分包一次只暴露几个新 404，补齐预算 8 轮经常在收敛前就用完；实测这些
# 文件在原站全是 200（手工逐个验证过），放宽到 20 轮后同一条链路即可收敛。
RESOURCE_BUDGET = ('Offline check failed', 'Web verify：')

# Highest observed success first. 4k99 leads despite a lower historical rate:
# the Cocos repair pipeline was fixed after those numbers were measured, and
# every 4k99 title is Cocos.
DOMAIN_ORDER = [
    'www.4k99.com',
    'poki.com',
    'rosebud.ai',
    'www.crazygames.com',
    'www.astrocade.com',
    'remix.gg',
]


def write(conn, sql, params, attempts=6):
    """Retry the WAL "readonly database" race that Store.tx() guards against.

    This tool speaks sqlite directly, so it needs the same protection: when the
    last connection to a WAL database closes, the next write on an already open
    connection fails until it is reopened.
    """
    delay = 0.05
    for attempt in range(attempts):
        try:
            conn.execute(sql, params)
            return conn
        except sqlite3.OperationalError as exc:
            if 'readonly' not in str(exc) or attempt == attempts - 1:
                raise
            try:
                conn.close()
            except Exception:
                pass
            time.sleep(delay)
            delay = min(delay * 2, 1.0)
            conn = sqlite3.connect(DB)
    return conn


def stale_kind(job):
    reason = str(job.get('reason') or job.get('question') or '')
    if any(k in reason for k in NET_VERDICT):
        return 'network'
    if any(k in reason for k in STALE_VERDICT):
        return 'stale-verdict'
    if job.get('status') in ('failed', 'blocked') and any(k in reason for k in DB_VERDICT):
        return 'db-readonly'
    if job.get('status') in ('failed', 'blocked') and any(k in reason for k in RESOURCE_BUDGET):
        return 'resource-budget'
    return None


def reset_to_fresh(job, why):
    for field in ('started_at', 'completed_at', 'tool_id',
                  'worker_id', 'lease_token', 'lease_expires_at', 'question',
                  'blocked_at', 'finished_at'):
        job.pop(field, None)
    job['status'] = 'queued'
    job['attempt'] = 0
    job['progress'] = 0
    job['reason'] = why
    # Keep `report`, `conversion_plan` and `round`. The report carries
    # recovery_kind, which decides whether the next round goes to the offline
    # playtest revision or is mistaken for a half-finished draft and handed to
    # the re-implementation path. Wiping it here sent jobs back to round one
    # forever, which is why nothing ever reached the playtest stage.
    return job


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--apply', action='store_true', help='write changes (default: dry run)')
    args = ap.parse_args()

    conn = sqlite3.connect(DB)
    jobs = {jid: json.loads(d) for jid, d in conn.execute("SELECT id,data FROM records WHERE kind='jobs'")}
    cands = {cid: json.loads(d) for cid, d in conn.execute("SELECT id,data FROM records WHERE kind='candidates'")}

    def host(job):
        cand = cands.get(job.get('candidate_id')) or {}
        return (urlparse(cand.get('url') or '').hostname or '').lower()

    touched = {}
    per_domain = {}
    for jid, job in jobs.items():
        if job.get('status') not in ('waiting_input', 'failed', 'blocked'):
            continue
        kind = stale_kind(job)
        if not kind:
            continue
        # Unfreezing resets `attempt`, which is also the platform's own guard
        # against hopeless jobs. Keep a separate ceiling so a title that can
        # never convert does not cycle through the queue forever.
        if int(job.get('requeue_count') or 0) >= 3:
            continue
        job['requeue_count'] = int(job.get('requeue_count') or 0) + 1
        why = {'network': '代理恢复后重跑（原判定为网络不可达，站点未真实触达）',
               'stale-verdict': '采集等待修复后重跑（原"无画面"判定早于 canvas 等待修复）',
               'db-readonly': 'WAL 只读竞态修复后重跑（原 HTTP 500 来自数据库连接，与游戏无关）',
               'resource-budget': '补齐预算由 8 轮放宽到 20 轮后重跑（原站资源实测均可取回）'}[kind]
        touched[jid] = reset_to_fresh(job, why)
        per_domain.setdefault(host(job), []).append(jid)

    print(f'待解冻 {len(touched)} 个过期判决任务：')
    for dom, ids in sorted(per_domain.items(), key=lambda kv: -len(kv[1])):
        print(f'   {len(ids):4}  {dom}')

    queued = [jid for jid, j in jobs.items()
              if (touched.get(jid) or j).get('status') == 'queued']

    def rank(jid):
        job = touched.get(jid) or jobs[jid]
        dom = host(job)
        report = job.get('report') or {}
        # A converted package is one playtest round away from acceptance, while
        # an untouched candidate still needs a full capture first. Finishing
        # those first is what turns queue churn into actual completions.
        stage = 0 if isinstance(report, dict) and str(
            report.get('recovery_kind', '')).startswith('discovered-web-') else 1
        try:
            order = DOMAIN_ORDER.index(dom)
        except ValueError:
            order = len(DOMAIN_ORDER) + 1
        return (stage, order, str(job.get('queued_at') or ''))

    ordered = sorted(queued, key=rank)
    base = datetime(2026, 10, 26, 0, 0, tzinfo=timezone.utc)
    plan = {}
    for idx, jid in enumerate(ordered):
        plan[jid] = (base + timedelta(seconds=idx)).isoformat()

    print(f'\n重排后 queued 共 {len(ordered)} 个，前 8 个域名：')
    for jid in ordered[:8]:
        print(f'   {host(touched.get(jid) or jobs[jid]):22} {jid}  {plan[jid]}')

    if not args.apply:
        print('\n[dry-run] 未写入。加 --apply 执行。')
        return

    n = 0
    for jid, job in touched.items():
        job['queued_at'] = plan[jid]
        conn = write(conn, "UPDATE records SET data=? WHERE kind='jobs' AND id=?",
                     (json.dumps(job, ensure_ascii=False), jid))
        n += 1
    for jid in ordered:
        if jid in touched:
            continue
        job = jobs[jid]
        if job.get('queued_at') == plan[jid]:
            continue
        job['queued_at'] = plan[jid]
        conn = write(conn, "UPDATE records SET data=? WHERE kind='jobs' AND id=?",
                     (json.dumps(job, ensure_ascii=False), jid))
        n += 1
    conn.commit()
    print(f'\n已写入 {n} 个任务。')


if __name__ == '__main__':
    main()
