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
    root=Path(root).resolve();refs=[];missing=[];external=[];files=[];dynamic=[]
    for p in sorted(root.rglob('*')):
        if not p.is_file() or any(x in ('evidence','screenshots','platform-delivery','.git','node_modules') for x in p.relative_to(root).parts):continue
        rel=p.relative_to(root).as_posix()
        if p.is_symlink() or not p.resolve().is_relative_to(root):missing.append({'file':rel,'reference':'unsafe path'});continue
        files.append({'file':rel,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
        if p.suffix not in ('.html','.css','.js','.mjs') or p.stat().st_size>4_000_000:continue
        text=p.read_text('utf-8',errors='replace');values=[]
        if p.suffix=='.html':
            parser=References();parser.feed(text);values+=parser.refs
        if p.suffix in ('.css','.html'):values+=re.findall(r'url\(\s*["\']?([^\s"\')]+)',text)
        if p.suffix in ('.js','.mjs'):
            values+=re.findall(r'(?:fetch|import)\(\s*["\']([^"\']+)["\']\s*\)',text)
            values+=re.findall(r'["\'](assets/[^"\'\s]+)["\']',text)
            if re.search(r'(?:fetch|import)\(\s*[^"\'\s]',text):dynamic.append(rel)
        for value in values:
            if not value or value.startswith(('#','data:','blob:')):continue
            u=urlsplit(value);row={'file':rel,'reference':value}
            if u.scheme or u.netloc:external.append(row);continue
            # Script fetch paths are document-relative; CSS references are stylesheet-relative.
            base=p.parent if p.suffix in ('.css','.html') else root
            target=(root/unquote(u.path).lstrip('/') if u.path.startswith('/') else base/unquote(u.path)).resolve()
            if aliases and target.is_relative_to(root):
                mapped=aliases.get(target.relative_to(root).as_posix())
                if mapped:target=(root/mapped).resolve()
            refs.append(row)
            if not target.is_relative_to(root) or not target.is_file():missing.append(row)
    return {'schema_version':1,'status':'blocked' if missing or external else 'static_pass','files':files,'references':refs,'missing':missing,'external':external,
            'dynamic_files':dynamic,'scope':'HTML/CSS 与 JS 字面量 fetch/import；动态拼接、引擎加载和全关卡必须另做运行验证'}
