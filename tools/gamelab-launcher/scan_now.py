"""立即触发一次采集扫描，走平台 HTTP 接口（复用平台进程写库，避免并发写冲突）。

流程：提交 -> 平台内置调度线程 30 秒内捡起执行 -> 轮询状态直到结束。
"""
import json, os, sqlite3, sys, time, urllib.request, http.cookiejar

BASE = 'http://127.0.0.1:8765'
DB = r'F://youxi//door//data//platform.sqlite3'

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(
    urllib.request.HTTPCookieProcessor(cj),
    urllib.request.ProxyHandler({}),          # 关键：绕过系统代理
)
CSRF = None


def get(path, timeout=30):
    with opener.open(BASE + path, timeout=timeout) as r:
        return json.loads(r.read())


def post(path, body, timeout=120):
    req = urllib.request.Request(
        BASE + path, data=json.dumps(body).encode(),
        headers={'Content-Type': 'application/json', 'X-CSRF-Token': CSRF})
    with opener.open(req, timeout=timeout) as r:
        return json.loads(r.read())


def run_status(run_id):
    con = sqlite3.connect('file:%s?mode=ro' % DB.replace('\\', '/'), uri=True, timeout=10)
    try:
        row = con.execute("SELECT data FROM records WHERE id=? AND kind='discovery_runs'", (run_id,)).fetchone()
        return json.loads(row[0]) if row else None
    finally:
        con.close()


def main():
    global CSRF
    try:
        CSRF = get('/api/session', timeout=10)['csrf']
    except Exception as exc:
        print('平台未运行或无法连接：%s' % exc)
        print('请先双击 start.bat 启动平台。')
        return 1

    resp = post('/api/discovery/scan', {})
    run = resp.get('run') or resp
    run_id = run.get('id')
    print('已提交采集任务：%s（状态 %s）' % (run_id, run.get('status')))
    print('平台内置调度线程会在 30 秒内开始执行，请稍候...')
    print()

    deadline = time.time() + 20 * 60
    last = ''
    while time.time() < deadline:
        time.sleep(10)
        rec = run_status(run_id)
        if not rec:
            continue
        status = rec.get('status', '')
        if status != last:
            print('  状态：%s' % status)
            last = status
        if status in ('partial', 'ok', 'completed', 'done', 'failed', 'interrupted', 'error'):
            print()
            print('采集结束：%s' % status)
            print('  采集建议：%s 条' % len(rec.get('recommendation_ids') or []))
            print('  来源：%s' % (rec.get('sources') or '-'))
            errs = rec.get('errors') or []
            if errs:
                print('  错误 %s 条：' % len(errs))
                for e in errs[:5]:
                    print('    -', str(e)[:120])
            print()
            print('在网页「采集建议」页查看结果。')
            return 0
    print('等待超时（20 分钟），请在网页查看进度。')
    return 1


if __name__ == '__main__':
    sys.exit(main())
