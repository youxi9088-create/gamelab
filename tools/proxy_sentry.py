"""Proxy sentry: wait for the local proxy to recover, then requeue blocked jobs.

The outbound proxy (HTTP(S)_PROXY) died mid-run with 502 on every CONNECT,
which blocks all AI calls and site capture. Queued jobs keep being consumed
into blocked/failed while the proxy is down, so this watcher:
  1. probes the proxy every 5 minutes (max ~8 hours);
  2. on first success, requeues the 4k99 watch job plus any job blocked by
     transient AI/network errors, so they run with the fixed retry logic.
"""
import json
import os
import sqlite3
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

DB = Path(__file__).resolve().parents[1] / 'data' / 'platform.sqlite3'
TRANSIENT = ('URLError', '502', 'Tunnel connection failed', 'ECONNRESET', 'ENOTFOUND', 'timed out', 'TimeoutError')


def proxy_ok():
    proxy = os.environ.get('HTTPS_PROXY') or os.environ.get('https_proxy') or os.environ.get('HTTP_PROXY') or os.environ.get('http_proxy')
    if not proxy:
        return True  # nothing to wait for
    handler = urllib.request.ProxyHandler({'https': proxy, 'http': proxy})
    opener = urllib.request.build_opener(handler)
    try:
        opener.open('https://www.baidu.com', timeout=10)
        return True
    except Exception as exc:
        print(time.strftime('%H:%M:%S'), 'proxy still down:', type(exc).__name__, str(exc)[:90], flush=True)
        return False


def requeue():
    conn = sqlite3.connect(DB)
    now = datetime.now(timezone.utc).isoformat()
    n = 0
    for jid, data in conn.execute("SELECT id,data FROM records WHERE kind='jobs'").fetchall():
        job = json.loads(data)
        reason = str(job.get('reason') or '')
        if job.get('status') == 'blocked' and any(t in reason for t in TRANSIENT):
            job['status'] = 'queued'
            job['attempt'] = 0
            job['progress'] = 0
            job['queued_at'] = '2026-10-26T00:00:00+00:00'
            job['reason'] = '代理恢复后自动重试（原因为瞬时网络故障）：' + reason[:120]
            for field in ('lease_token', 'lease_expires_at'):
                job.pop(field, None)
            conn.execute("UPDATE records SET data=? WHERE kind='jobs' AND id=?", (json.dumps(job, ensure_ascii=False), jid))
            n += 1
    conn.commit()
    print(time.strftime('%H:%M:%S'), f'proxy recovered; requeued {n} transiently-blocked jobs', flush=True)


def main():
    deadline = time.time() + 8 * 3600
    while time.time() < deadline:
        if proxy_ok():
            requeue()
            return
        time.sleep(300)
    print('proxy still down after 8h; giving up', flush=True)


if __name__ == '__main__':
    main()
