"""Readable provisional names until acquisition supplies the game's title."""
from urllib.parse import urlsplit, parse_qs, unquote
import re


def clean_title(title, url):
    title=' '.join(str(title or '').split())
    host=(urlsplit(url).hostname or '').lower().removeprefix('www.')
    if host=='rosebud.ai' or host.endswith('.rosebud.ai'):
        title=re.sub(r'\s*[|–—-]\s*Rosebud(?:\.ai)?\s*$', '',title,flags=re.I).strip()
        match=re.fullmatch(r'Play\s+(.+?)\s*[–—-]\s*Free Online Game[!.]?\s*',title,re.I)
        if match:title=match[1].strip()
        if re.fullmatch(r'(?:Play\s+)?(?:Free Online Games?|Rosebud(?:\.ai)?)(?:\s*[|–—-].*)?',title,re.I):return ''
    if host=='poki.com' or host.endswith('.poki.com'):
        title=re.sub(r'\s*[|–—-]\s*Poki(?:\s*[（(]宝玩[）)])?\s*$','',title,flags=re.I).strip()
        title=re.sub(r'\s*[|–—-]\s*(?:免费在线玩[!！]?|Free Online Game[s]?[!！]?)\s*$','',title,flags=re.I).strip()
    if host=='17yoo.cn' or host.endswith('.17yoo.cn'):
        title=re.sub(r'(?:免费在线玩|游戏大全)_.*$','',title).strip(' _|')
    if host=='remix.gg' or host.endswith('.remix.gg'):
        title=re.sub(r'\s+(?:on Remix|[|–—-]\s*Remix)(?:\s*[|–—-].*)?$', '', title, flags=re.I).strip()
        if re.fullmatch(r'Free Online Games(?: on Remix)?(?:\s*[|–—-].*)?',title,re.I):
            return ''
    if title.lower() in (host,'www.'+host):
        return ''
    return title[:120]


def acquired_title(candidate, incoming):
    if candidate.get('title_edited'):
        return candidate['title']
    if candidate.get('title_source')=='acquired_clean':
        # Repair an older locked promotional wrapper using its own title,
        # never a later page's recommendation or advertisement.
        return clean_title(candidate['title'],candidate.get('url','')) or candidate['title']
    title=clean_title(incoming,candidate.get('url',''))
    if title:
        candidate['title_source']='acquired_clean'
        return title
    return candidate['title']


def display_title(candidate):
    """Shared projection for old records; do not rewrite immutable versions."""
    if candidate.get('title_edited'):return candidate.get('title','')
    return clean_title(candidate.get('title'),candidate.get('url','')) or link_title(candidate.get('url',''))


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
