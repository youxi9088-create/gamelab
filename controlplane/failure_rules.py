"""Deterministic failure rules evaluated before platform AI diagnosis.

Each rule records evidence and a fixed handling. Rules only classify; they never
patch games. Publisher site/domain locks are identified and stopped with a clear
next step: they need a publisher-authorized build or domain allowlisting, and the
platform does not bypass them.
"""
import json
import re
from pathlib import Path

# handling: block = stop without AI calls; retry = one bounded re-verification
# without AI; ai = fall through to AI diagnosis.
RULES = {
    'PUBLISHER_SITE_LOCK': {
        'category': 'publisher_restriction', 'handling': 'block',
        'reason': '原游戏包含发行方站点锁：只允许在发行方指定域名运行，部署域名下不会进入游戏',
        'next_action': '向发行方申请授权构建，或请发行方将部署域名加入白名单后重新转换；平台不规避站点锁'},
    'PLATFORM_API_REJECTED': {
        'category': 'platform', 'handling': 'block',
        'reason': '执行器调用平台接口被拒绝，属于平台程序缺陷，不是游戏问题',
        'next_action': '按记录的接口与原因修复平台程序后，从原任务继续'},
    'TRANSIENT_BROWSER': {
        'category': 'transient', 'handling': 'retry',
        'reason': '浏览器或网络连接暂时中断',
        'next_action': '自动重新验证一次；仍失败再交给 AI 分析'},
}

LOCK_SIGNATURES = (
    # (vendor, label, required regexes that must all appear in one file)
    ('crazygames', 'CrazyGames SDK SiteLock', (r'SiteLock', r'CrazySDK|crazygames')),
    ('crazygames', 'CrazyGames 构建按主机名放行', (r'isCrazyWeb', r'''includes\(\s*["']crazygames["']\s*\)''')),
    ('poki', 'Poki 站点锁', (r'poki', r'sitelock')),
)
TRANSIENT = re.compile(r'TargetClosedError|Target (page, context or browser )?(has been )?closed|net::ERR_(CONNECTION|NETWORK|INTERNET)|ECONNRESET|socket hang up', re.I)
SCAN_SUFFIXES = {'.js', '.mjs', '.html', '.htm'}
MAX_SCAN_BYTES = 24 * 1024 * 1024


def rule(code, **evidence):
    return {'code': code, **RULES[code], 'evidence': evidence}


def scan_publisher_lock(*roots):
    """Return the first site-lock signature found in captured code, else None."""
    budget = MAX_SCAN_BYTES
    for root in roots:
        root = Path(root)
        if not root.is_dir():continue
        for path in sorted(root.rglob('*')):
            if path.suffix.lower() not in SCAN_SUFFIXES or path.is_symlink() or not path.is_file():continue
            size = path.stat().st_size
            if size > budget:continue
            budget -= size
            text = path.read_text('utf-8', errors='replace')
            for vendor, label, patterns in LOCK_SIGNATURES:
                matches = [re.search(p, text, re.I) for p in patterns]
                if all(matches):
                    at = matches[-1].start()
                    return {'vendor': vendor, 'signature': label, 'file': path.relative_to(root).as_posix(),
                            'excerpt': text[max(0, at-120):at+120].replace('\n', ' ')}
    return None


def runtime_evidence(run):
    path = Path(run) / 'converted/evidence/runtime.json'
    try:return json.loads(path.read_text('utf-8')) if path.is_file() else {}
    except (OSError, ValueError):return {}


def classify(error, run=None, stage=None):
    """Classify a failure from its message and run evidence; None means use AI."""
    text = str(error)
    status = getattr(error, 'status', None)
    if getattr(error, 'endpoint', None) and isinstance(status, int) and 400 <= status < 500 and status not in (401, 403, 409):
        return rule('PLATFORM_API_REJECTED', endpoint=error.endpoint, status=status, detail=getattr(error, 'detail', ''))
    if TRANSIENT.search(text):
        return rule('TRANSIENT_BROWSER', message=text[:300])
    if run and stage == 'test':
        runtime = runtime_evidence(run)
        console = json.dumps(runtime.get('siteLockLogs') or [], ensure_ascii=False)
        lock_logged = bool(re.search(r'SiteLock[^"]{0,80}activated', console, re.I))
        silent = not runtime.get('errors') and not runtime.get('missing')
        if lock_logged or (runtime.get('passed') is False and silent):
            found = scan_publisher_lock(Path(run) / 'converted', Path(run) / 'web-original')
            if found:
                return rule('PUBLISHER_SITE_LOCK', **found, console_activation=lock_logged,
                            runtime={k: runtime.get(k) for k in ('passed', 'canvasCount', 'loaded') if k in runtime})
    return None


def signature(text):
    """Stable error shape: drop paths, numbers and hashes so repeats group together."""
    text = re.sub(r'[A-Za-z]:[\\/][^\s"\')]+|(?:/[\w.@-]+)+\.(?:js|cjs|mjs|py|html)', '<path>', str(text))
    text = re.sub(r'[0-9a-f]{12,}|\d+', '#', text)
    return re.sub(r'\s+', ' ', text).strip()[:160]


def summarize(jobs, promote_after=2):
    """Read-only learning view over job reports.

    Shows which layer resolved failures (rule / AI / unresolved) by code, and lists
    AI repairs that were verified by re-running the original node. A repair shape
    seen `promote_after` times is a candidate for a deterministic rule.
    """
    layers = {'rule_blocked': 0, 'rule_recovered': 0, 'ai_recovered': 0, 'unresolved': 0}
    by_code, candidates = {}, {}
    for job in jobs:
        report = job.get('report') or {}
        repair = report.get('auto_repair') or {}
        episodes = repair.get('episodes') or ([repair] if repair else [])
        blocker = job.get('blocker') or report.get('blocker') or {}
        for episode in episodes:
            matched = episode.get('classification')
            if matched:
                layer = 'rule_recovered' if (episode.get('rule_retry') or {}).get('verified') else 'rule_blocked'
                if matched.get('handling') != 'block' and layer == 'rule_blocked':continue
                layers[layer] += 1
                row = by_code.setdefault(matched['code'], {'jobs': set(), 'handling': matched.get('handling')})
                row['jobs'].add(job.get('id'))
                continue
            verified = [a for a in episode.get('attempts', []) if a.get('verified')]
            if verified:
                layers['ai_recovered'] += 1
                for attempt in verified:
                    key = (episode.get('stage'), attempt.get('action'), signature(attempt.get('error', '')))
                    item = candidates.setdefault(key, {'stage': key[0], 'action': key[1], 'error_signature': key[2],
                                                       'jobs': set(), 'examples': []})
                    item['jobs'].add(job.get('id'))
                    if len(item['examples']) < 3:item['examples'].append(str(attempt.get('diagnosis', ''))[:300])
            elif episode.get('attempts') or episode.get('original_error'):
                layers['unresolved'] += 1
        if job.get('status') in ('blocked', 'failed') and blocker.get('code'):
            row = by_code.setdefault(blocker['code'], {'jobs': set(), 'handling': RULES.get(blocker['code'], {}).get('handling', 'ai')})
            row['jobs'].add(job.get('id'))
    finished = [j for j in jobs if j.get('status') in ('completed', 'review', 'blocked', 'failed')]
    succeeded = [j for j in finished if j.get('status') in ('completed', 'review')]
    return {
        'jobs_finished': len(finished), 'jobs_succeeded': len(succeeded),
        'success_rate': round(len(succeeded) / len(finished), 3) if finished else None,
        'resolution_layers': layers,
        'blocking_codes': sorted(({'code': k, 'handling': v['handling'], 'jobs': len(v['jobs'])} for k, v in by_code.items()),
                                 key=lambda r: -r['jobs']),
        'rule_candidates': sorted(({**{k: v for k, v in item.items() if k != 'jobs'}, 'occurrences': len(item['jobs']),
                                    'promote': len(item['jobs']) >= promote_after} for item in candidates.values()),
                                  key=lambda r: -r['occurrences']),
    }
