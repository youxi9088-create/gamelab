"""Bounded static reference audit. Dynamic expressions are explicitly not covered."""
import hashlib
from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import urlsplit,unquote

class References(HTMLParser):
    def __init__(self):super().__init__();self.refs=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag in ('script','img','audio','video','source','iframe','embed'):self.refs.append(a.get('src',''))
        if tag=='link' and a.get('rel') in ('stylesheet','preload','modulepreload','icon'):self.refs.append(a.get('href',''))

def audit(root,aliases=None):
    root=Path(root).resolve();refs=[];missing=[];external=[];files=[];dynamic=[];backend=[]
    for p in sorted(root.rglob('*')):
        if not p.is_file() or any(x in ('evidence','screenshots','platform-delivery','.git','node_modules') for x in p.relative_to(root).parts):continue
        rel=p.relative_to(root).as_posix()
        if p.is_symlink() or not p.resolve().is_relative_to(root):missing.append({'file':rel,'reference':'unsafe path'});continue
        files.append({'file':rel,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
        if p.suffix not in ('.html','.css','.js','.mjs') or p.stat().st_size>4_000_000:continue
        text=p.read_text('utf-8',errors='replace');values=[];direct=set()
        if p.suffix=='.html':
            parser=References();parser.feed(text);values+=parser.refs
        if p.suffix in ('.css','.html'):
            # JavaScript templates may contain CSS url(${variable}); those are
            # expressions, not literal resource paths in the document stylesheet.
            css_text=re.sub(r'<script\b[^>]*>.*?</script\s*>','',text,flags=re.I|re.S) if p.suffix=='.html' else text
            values+=re.findall(r'url\(\s*["\']?([^\s"\')]+)',css_text)
        if p.suffix in ('.js','.mjs'):
            # Object methods such as app.import('cc') resolve module identifiers,
            # not document-relative files. Do not report a nonexistent file cc.
            direct=set(re.findall(r'(?<![\w$.])(?:fetch|import)\(\s*["\']([^"\']+)["\']\s*\)',text))
            values+=sorted(direct)
            values+=re.findall(r'["\'](assets/[^"\'\s]+)["\']',text)
            if re.search(r'(?:fetch|import)\(\s*[^"\'\s]',text):dynamic.append(rel)
        for value in values:
            if not value or value.startswith(('#','data:','blob:')):continue
            u=urlsplit(value);row={'file':rel,'reference':value}
            if u.scheme or u.netloc:external.append(row);continue
            if value in direct and u.path.startswith('/api/') and not Path(u.path).suffix:
                backend.append(row);continue
            # Script fetch paths are document-relative; CSS references are stylesheet-relative.
            base=p.parent if p.suffix in ('.css','.html') else root
            target=(root/unquote(u.path).lstrip('/') if u.path.startswith('/') else base/unquote(u.path)).resolve()
            if aliases and target.is_relative_to(root):
                mapped=aliases.get(target.relative_to(root).as_posix())
                if mapped:target=(root/mapped).resolve()
            # A bare assets/... string is only a reference hint. Cocos jsList
            # entries are relative to their settings script, unlike fetch URLs.
            if not target.is_file() and value not in direct and p.suffix in ('.js','.mjs') and value.startswith('assets/'):
                alternate=(p.parent/unquote(u.path)).resolve()
                if alternate.is_relative_to(root) and alternate.is_file():target=alternate
            refs.append(row)
            if not target.is_relative_to(root) or not target.is_file():missing.append(row)
    return {'schema_version':1,'status':'blocked' if missing or external else 'static_pass','files':files,'references':refs,'missing':missing,'external':external,
            'backend_endpoints':backend,'dynamic_files':dynamic,'scope':'HTML/CSS、全局 fetch/import 字面量及 assets 路径线索；API 路由单独登记，不视为静态文件。动态拼接、引擎加载、后端依赖和全关卡必须另做运行验证'}
