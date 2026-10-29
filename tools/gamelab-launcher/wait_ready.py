"""等到平台就绪后自动打开浏览器。禁用系统代理，否则 127.0.0.1 会走代理拿到 502。"""
import os, sys, time, urllib.request, webbrowser

BASE = 'http://127.0.0.1:8765'
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))

for _ in range(120):
    try:
        opener.open(BASE + '/api/session', timeout=2).read()
        if not os.environ.get('GAMELAB_NO_BROWSER'):
            webbrowser.open(BASE)
        sys.exit(0)
    except Exception:
        time.sleep(1)
sys.exit(1)
