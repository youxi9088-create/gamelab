"""Readable provisional names until acquisition supplies the game's title."""
from urllib.parse import urlsplit, parse_qs, unquote
import re


def clean_title(title, url):
    title=' '.join(str(title or '').split())
    host=(urlsplit(url).hostname or '').lower().removeprefix('www.')
    if host=='remix.gg' or host.endswith('.remix.gg'):
        title=re.sub(r'\s+(?:on Remix|[|–—-]\s*Remix)(?:\s*[|–—-].*)?$', '', title, flags=re.I).strip()
        if re.fullmatch(r'Free Online Games(?: on Remix)?(?:\s*[|–—-].*)?',title,re.I):
            return ''
    if title.lower() in (host,'www.'+host):
        return ''
    return title[:120]


def acquired_title(candidate, incoming):
    if candidate.get('title_edited') or candidate.get('title_source')=='acquired_clean':
        return candidate['title']
    title=clean_title(incoming,candidate.get('url',''))
    if title:
        candidate['title_source']='acquired_clean'
        return title
    return candidate['title']


def link_title(url):
    if url.startswith('#小程序://'):
        return url[len('#小程序://'):].split('/')[0]
    parsed=urlsplit(url)
    path=parsed.path
    # Portal share URLs may wrap a relative game entry.
    next_path=parse_qs(parsed.query).get('next',[''])[0]
    if path in ('','/') and next_path.startswith('/') and not next_path.startswith('//'):
        path=urlsplit(next_path).path
    slug=unquote(path.rstrip('/').rsplit('/',1)[-1])
    if slug and slug.lower() not in ('index.html','index.htm','index.php','play','games','g'):
        return re.sub(r'[-_]+',' ',slug).strip()[:120]
    return parsed.hostname or '待识别游戏'


def placeholder_title(candidate):
    host=urlsplit(candidate.get('url','')).hostname
    return not candidate.get('title_edited') and bool(host) and candidate.get('title','').strip().lower() in (host,'www.'+host.removeprefix('www.'))
