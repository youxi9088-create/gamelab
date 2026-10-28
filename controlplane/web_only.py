"""Opt-in conversion gate. URL scheme alone never proves a Web game."""
from urllib.parse import parse_qs, urlparse, urlsplit
import re

from .discovery_scan import Page

# 站点把游戏链接弹回自己的入口页时，多半会带上"从哪来"的回跳参数。
BOUNCE_PARAMS = ('next', 'redirect', 'redirect_url', 'redirect_uri', 'return',
                 'returnurl', 'return_to', 'returnUrl', 'continue', 'from')

# 登录/注册弹窗 iframe。4k99 点"开始游戏"后弹 /modal/Login，早期被当成游戏
# iframe 候选，于是报成"站点锁"，排查方向直接跑偏。这里只匹配路径与查询，
# 不用 account/member/auth 这种会误伤游戏名（accountant、authored）的词。
_LOGIN_FRAME = re.compile(r'(login|log-?in|sign-?in|signin|sign-?up|signup|register|passport|oauth|/modal/)', re.I)


def _wall_redirect(url, observation):
    """Login wall / shell bounce: the game URL came back as the site's own entry page."""
    final = (observation.get('final_url') or '').strip()
    if not final or final == url:
        return None
    start, end = urlparse(url), urlparse(final)
    if start.netloc and end.netloc and start.netloc != end.netloc:
        return None
    bounced = any(name in parse_qs(end.query) for name in BOUNCE_PARAMS)
    start_depth = len([part for part in start.path.split('/') if part])
    end_depth = len([part for part in end.path.split('/') if part])
    if not bounced and end_depth >= start_depth:
        return None
    return final


def _iframe_candidates(observation):
    """Split iframe leads into (game, login). A login modal is not a game entry."""
    discovery = observation.get('web_discovery') or {}
    if discovery.get('entries'):
        return [], []
    items = [item for item in (discovery.get('iframe_probes') or []) if isinstance(item, dict)]
    items += [item for item in (discovery.get('iframe_hints') or []) if isinstance(item, dict)]
    game, login = [], []
    for item in items:
        url = str(item.get('declared_url') or item.get('url') or '').strip()
        if not url:
            continue
        parts = urlsplit(url)
        (login if _LOGIN_FRAME.search(parts.path + '?' + parts.query) else game).append(url)
    return game, login


def assess(url, html='', observation=None):
    observation = observation or {}
    technology = Page(html).game_metadata()['technology']
    if url.startswith('#小程序://'):
        return dict(allowed=False, reason='微信小游戏，不属于本批 Web 转换范围', technology=technology)
    entries = (observation.get('web_discovery') or {}).get('entries') or []
    rendered = any(isinstance(e, dict) and e.get('evidence') in
                   ('rendered-canvas', 'popup-rendered-canvas', 'declared-iframe-rendered-canvas',
                    'srcdoc-rendered-canvas')
                   and e.get('canvas_count', 0) > 0 for e in entries)
    web = any(m['platform'] == 'Web' for m in technology['matches'])
    embedded = bool(observation.get('web_source'))
    allowed = web or rendered or embedded
    # 「页面没读到」与「读到了但没入口」是两种完全不同的失败，早先共用一句
    # "尚未确认入口"，把采集超时/被拦截也归到"没入口"，误导排查方向。
    readable = bool(html.strip()) or bool(observation.get('title')) or bool(
        observation.get('web_discovery'))
    wall = _wall_redirect(url, observation)
    gated, login_wall = _iframe_candidates(observation)
    # 顺序有讲究：站点门/登录墙要先于"没入口"说出口，否则每次排障都停在
    # 同一句"只取得页面线索"，看不出是被挡住还是真没有。
    if allowed:
        reason = '检测到 Web 页面平台声明或运行入口；继续转换，尚未验证玩法'
    elif not readable:
        reason = '未能读取页面内容（采集超时、被拦截或页面不可访问），暂停转换；这是读取失败，不是"没有入口"，请先确认链接可访问与本轮采集超时设置'
    elif wall:
        reason = '页面被站点跳回入口页（多见于登录墙或访问限制），未进入游戏页面，暂停转换；请确认该站点是否需要登录，或补充可直接试玩的公开入口'
    elif gated:
        reason = '已定位游戏 iframe 但页面内未渲染出可运行画面（多见于站点广告同意门或发行方站点锁），暂停转换；本站不规避站点锁，需发行方授权或补充无门槛入口'
    elif login_wall:
        # 与站点锁是两回事：站点锁靠授权或白名单解决，登录要的是凭据。
        reason = '启动游戏时弹出登录框（' + login_wall[0][:120] + '），未登录无法进入游戏；本站不自动注册也不伪造登录态，需提供该站已授权的登录凭据，或改用无登录门槛的入口'
    elif technology['matches']:
        reason = '检测到非 Web 平台声明，暂停转换'
    else:
        reason = '已读取页面但未确认 Web 游戏类型或运行入口，暂停转换；请核对来源或补充入口'
    return dict(allowed=allowed, readable=readable, technology=technology, reason=reason,
                wall_redirect=wall, gated_iframe=gated[0] if gated else '',
                login_iframe=login_wall[0] if login_wall else '')
