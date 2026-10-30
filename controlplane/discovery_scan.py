"""Bounded, read-only public HTML discovery. Never downloads game packages."""
import hashlib
import ipaddress
import json
import re
import socket
import urllib.request
import urllib.error
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit
from urllib.robotparser import RobotFileParser

USER_AGENT = 'GameLabDiscovery/1.0'
DEFAULT_RULE = dict(game_paths=['/game/', '/games/', '/play/', '/detail/', '/g/'],
                    max_games=12, max_pages=2)


def public_url(url):
    p = urlsplit(url)
    if p.scheme not in ('https', 'http') or not p.hostname or p.username or p.password:
        raise ValueError('只允许公开 HTTP(S) 来源')
    if p.port not in (None, 80, 443):
        raise ValueError('采集仅支持标准 HTTP(S) 端口')
    addresses = socket.getaddrinfo(p.hostname, p.port or (443 if p.scheme == 'https' else 80))
    if not addresses or any(not ipaddress.ip_address(a[4][0]).is_global for a in addresses):
        raise ValueError('不采集本机、内网或保留地址')
    return url


class PublicRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        public_url(newurl)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def fetch(url):
    public_url(url)
    req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT, 'Accept': 'text/html,application/xhtml+xml,text/plain'})
    with urllib.request.build_opener(PublicRedirect).open(req, timeout=20) as response:
        data = response.read(8_000_001)
        if len(data) > 8_000_000:
            raise ValueError('页面超过 8 MB 扫描上限')
        return data.decode(response.headers.get_content_charset() or 'utf-8', errors='replace')


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.html = html
        self.links=[]; self.meta={}; self.structured=[]; self.title=''
        self.anchor=None; self.in_title=False; self.script=None
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='a' and a.get('href'):
            self.anchor={'href':a['href'],'text':a.get('aria-label','')}
        if tag=='img' and self.anchor and not self.anchor['text']:
            self.anchor['text']=a.get('alt','')
        if tag=='title': self.in_title=True
        if tag=='meta': self.meta[a.get('property') or a.get('name')]=a.get('content','')
        if tag=='script' and a.get('type')=='application/ld+json': self.script=''

    def handle_data(self, data):
        if self.anchor: self.anchor['text']+=' '+data
        if self.in_title: self.title+=data
        if self.script is not None: self.script+=data

    def handle_endtag(self, tag):
        if tag=='a' and self.anchor:
            self.anchor['text']=' '.join(self.anchor['text'].split())[:160]
            self.links.append(self.anchor); self.anchor=None
        if tag=='title': self.in_title=False
        if tag=='script' and self.script is not None:
            try: self.structured.append(json.loads(self.script))
            except (ValueError, TypeError): pass
            self.script=None

    def game_metadata(self):
        def walk(value):
            if isinstance(value,list):
                for item in value: yield from walk(item)
            elif isinstance(value,dict):
                yield value
                for item in value.values():yield from walk(item)
        objects=list(walk(self.structured))
        def types(value):
            value=value.get('@type',[])
            return value if isinstance(value,list) else [value]
        games=[o for o in objects if set(types(o)) & {'VideoGame','Game','SoftwareApplication','ItemPage','Product'}]
        game=games[0] if games else {}
        genre=game.get('genre') or game.get('applicationCategory')
        if isinstance(genre,list): genre=genre[0] if genre else ''
        if not isinstance(genre,str): genre=''
        if genre.lower() in ('game','gameapplication','browser game','games','云游戏','小游戏','网页游戏'):genre=''
        basis='来源结构化品类' if genre else '待确认'
        if not genre:
            for o in objects:
                item=o.get('item',{})
                if isinstance(item,str):url=item;label=o.get('name','')
                elif isinstance(item,dict):url=item.get('@id','');label=item.get('name','')
                else:continue
                if re.search(r'/genre-|/(?:c|category)/',url) and label:
                    genre=label;basis='来源面包屑分类';break
        description=str(game.get('description') or self.meta.get('description') or self.meta.get('og:description') or '').strip()[:2000]
        # Generic page navigation includes unrelated genres; do not use its first link.
        if not genre:
            rules=[(r'endless runner|running game|跑酷','跑酷'),(r'chess|checkmate|象棋','棋类'),
                   (r'puzzle|解谜|益智','益智'),(r'racing|竞速','竞速'),(r'platformer|平台跳跃','平台跳跃'),
                   (r'survival|生存','生存'),(r'simulation|模拟经营','模拟经营')]
            rules.extend([(r'\bFPS\b|shooter|shooting','射击'),(r'garbage truck|garbage collector','模拟经营')])
            genre=next((label for pattern,label in rules if re.search(pattern,description,re.I)),'')
            if genre:basis='按来源说明关键词推断，需人工确认'
        from .game_technology import classify
        return dict(dimension=dimension_evidence(game, description), technology=classify(self.html, game), title=str(game.get('name') or self.meta.get('og:title') or self.title).strip()[:120],
                    category=genre[:80] or '未识别',
                    category_basis=basis,gameplay=description)


def dimension_evidence(game, description):
    """Only game-specific metadata, never global navigation or engine guesses."""
    text = ' '.join(str(game.get(k, '')) for k in ('name', 'genre', 'keywords', 'gamePlatform')) + ' ' + description
    if re.search(r'(?i)(?<![a-z0-9])3[ -]?d(?![a-z0-9])|三维|立体游戏', text):
        return '3d'
    if re.search(r'(?i)(?<![a-z0-9])2[ -]?d(?![a-z0-9])|二维|2维', text):
        return '2d'
    return 'unknown'


def scan(source, fetcher=fetch):
    rule={**DEFAULT_RULE, **source.get('discovery_rule',{})}
    origin=urlsplit(source['url'])
    entries=rule.get('entry_urls') or [source['url']]
    results=[]; errors=[]; category_links={}; seen=set(); robots={}
    def get(url):
        parts=urlsplit(url)
        root=f'{parts.scheme}://{parts.netloc}'
        if root not in robots:
            parser=RobotFileParser()
            try: parser.parse(fetcher(root+'/robots.txt').splitlines())
            except urllib.error.HTTPError as exc:
                if exc.code != 404: raise
                parser.parse([])
            robots[root]=parser
        if not robots[root].can_fetch(USER_AGENT,url):
            raise ValueError('来源 robots.txt 不允许扫描此地址')
        return fetcher(url)
    def allowed(url):
        host=urlsplit(url).hostname or ''
        base=(origin.hostname or '').removeprefix('www.')
        return host==base or host.endswith('.'+base)
    def game_link(url):
        path=urlsplit(url).path
        if re.search(r'/(?:t|tag|tags|category|categories|c)/',path):return False
        if origin.hostname in ('itch.io','www.itch.io'):
            return urlsplit(url).hostname not in ('itch.io','www.itch.io') and bool(path.strip('/')) and len(path.strip('/').split('/'))==1
        if any(token in path and path.rstrip('/').split('/')[-1] not in ('new','html5','games','play')
               for token in rule['game_paths']): return True
        return False
    found=[];excluded=set(source.get('excluded_urls',[]));suppressed=0
    if rule.get('full_site'):
        return scan_sitemaps(source,get,allowed,game_link,excluded)
    for entry in entries[:rule['max_pages']]:
        if not allowed(entry): raise ValueError('扫描入口必须属于当前来源站点')
        try:
            page=Page(get(entry))
            for a in page.links:
                url=urljoin(entry,a['href'])
                if not allowed(url) or urlsplit(url).scheme not in ('http','https'): continue
                if re.search(r'/(?:t|tag|category|categories|c)/[^/]+/?$',urlsplit(url).path):
                    if a['text'] and urlsplit(url).path.rstrip('/').split('/')[-1] not in ('new','popular','trending'):
                        category_links[a['text'][:80]]=url
                if origin.hostname in ('itch.io','www.itch.io') and re.search(r'/genre-[a-z-]+',urlsplit(url).path):
                    if a['text']:category_links[a['text'][:80]]=url
                if url not in seen and game_link(url):
                    seen.add(url)
                    from .service import canonical_url
                    if canonical_url(url) in excluded:suppressed+=1
                    else:found.append((url,a['text']))
        except Exception as exc: errors.append({'url':entry,'error':str(exc)[:300]})
    for url,label in found[:rule['max_games']]:
        try:
            html=get(url); meta=Page(html).game_metadata()
            if not meta['title']: meta['title']=label
            if not meta['title']: continue
            results.append(dict(url=url,**meta,evidence_url=url,content_sha256=hashlib.sha256(html.encode()).hexdigest(),
                                description_basis='来源页面公开说明；未实际试玩'))
        except Exception as exc: errors.append({'url':url,'error':str(exc)[:300]})
    return dict(games=results,categories=[dict(name=k,url=v) for k,v in category_links.items()],
                errors=errors,links_found=len(found)+suppressed,suppressed=suppressed,
                coverage=f"扫描 {min(len(entries),rule['max_pages'])} 个入口，最多读取 {rule['max_games']} 个详情；未覆盖全站分页、登录内容或 JS 专有接口",
                status='partial' if (results or suppressed) and errors else 'success' if results or suppressed else 'needs_adapter')


def scan_sitemaps(source,get,allowed,game_link,excluded):
    """Enumerate public sitemap details, with bounded concurrency and progress."""
    import xml.etree.ElementTree as ET
    import time
    from concurrent.futures import ThreadPoolExecutor
    from .service import canonical_url
    origin=urlsplit(source['url'])
    pending=[f'{origin.scheme}://{origin.netloc}/sitemap.xml']
    visited=set();details=set();errors=[];results=[]
    report=source.get('progress',lambda value:None)
    stopped=source.get('stop_requested',lambda:False)
    while pending and not stopped():
        url=pending.pop(0)
        if url in visited:continue
        visited.add(url)
        try:
            if not allowed(url):raise ValueError('站点地图超出来源范围')
            root=ET.fromstring(get(url))
            kind=root.tag.split('}')[-1]
            if kind not in ('sitemapindex','urlset'):raise ValueError('无效站点地图')
            for node in root.iter():
                if node.tag.split('}')[-1]!='loc' or not node.text:continue
                link=node.text.strip()
                if not allowed(link):continue
                if kind=='sitemapindex':
                    if link not in visited and link not in pending:pending.append(link)
                elif game_link(link):details.add(canonical_url(link))
        except Exception as exc:errors.append({'url':url,'error':str(exc)[:300]})
        report(dict(phase='sitemaps',sitemaps_read=len(visited),sitemaps_pending=len(pending),details_found=len(details),errors=len(errors)))
    suppressed=len(details & excluded)
    urls=sorted(details-excluded)
    def read(url):
        if stopped():return None,{'url':url,'error':'扫描已停止'}
        try:
            time.sleep(.15)
            html=get(url);meta=Page(html).game_metadata()
            if not meta['title']:raise ValueError('详情缺少可识别标题')
            return dict(url=url,**meta,evidence_url=url,content_sha256=hashlib.sha256(html.encode()).hexdigest(),description_basis='来源页面公开说明；未实际试玩'),None
        except Exception as exc:return None,{'url':url,'error':str(exc)[:300]}
    # Submit in small batches so cancellation never leaves a giant work queue.
    completed=0
    with ThreadPoolExecutor(max_workers=4) as pool:
        for offset in range(0,len(urls),20):
            if stopped():break
            for item,error in pool.map(read,urls[offset:offset+20]):
                completed+=1
                if item:results.append(item)
                if error:errors.append(error)
            report(dict(phase='details',sitemaps_read=len(visited),details_found=len(details),existing_skipped=suppressed,details_total=len(urls),details_read=completed,new=len(results),errors=len(errors)))
    complete=not errors and not stopped() and completed==len(urls) and bool(details)
    return dict(games=results,categories=[],errors=errors,links_found=len(details),suppressed=suppressed,
                coverage=f'站点地图扫描：读取 {len(visited)} 份地图，发现 {len(details)} 个游戏详情，跳过已有 {suppressed}，读取 {completed}/{len(urls)}；覆盖 Sitemap 列出的公开游戏，不含未列入清单、登录或 robots 禁止内容',
                status='success' if complete else 'partial')
