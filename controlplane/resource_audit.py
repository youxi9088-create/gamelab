"""Bounded static reference audit. Dynamic expressions are explicitly not covered."""
import hashlib
from html.parser import HTMLParser
from pathlib import Path
import re
import json
from urllib.parse import urlsplit,unquote

def javascript_tokens(text):
    """Lexical tokens excluding comments; documentation is not a dependency."""
    token=re.compile(r'''(?P<quoted>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(?P<comment>//[^\n]*|/\*.*?\*/)|(?P<word>[A-Za-z_$][\w$]*)|(?P<punct>\S)''',re.S)
    tokens=[]
    for match in token.finditer(text):
        if match.lastgroup=='comment':continue
        raw=match[0];value=raw[1:-1].replace('\\/','/') if match.lastgroup=='quoted' else raw
        if match.lastgroup=='quoted' and '${' in value:value=''
        tokens.append((match.lastgroup,value,match.start()))
    return tokens


def javascript_requests(text):
    """Bounded lexical call audit; strings/comments are not executable calls."""
    tokens=javascript_tokens(text);result=[]
    for i,(kind,value,pos) in enumerate(tokens):
        if kind!='word':continue
        prefix=tokens[i-1][1] if i else ''
        object_name=tokens[i-2][1] if i>=2 else ''
        if value in ('import','from') and i+1<len(tokens) and tokens[i+1][0]=='quoted':
            result.append({'reference':tokens[i+1][1],'line':text.count('\n',0,pos)+1,'base':'module'})
        direct=value in ('fetch','import') and (prefix!='.' or object_name in ('window','globalThis','self'))
        ctor=value in ('WebSocket','EventSource','Worker','Audio') and prefix=='new'
        beacon=value=='sendBeacon' and prefix=='.' and object_name=='navigator'
        arg=i+2
        if value=='open' and prefix=='.' and i+5<len(tokens) and tokens[i+1][1]=='(' and tokens[i+2][1].upper() in ('GET','POST','PUT','PATCH','DELETE','HEAD') and tokens[i+3][1]==',':arg=i+4;direct=True
        if (direct or ctor or beacon) and i+1<len(tokens) and tokens[i+1][1]=='(' and arg<len(tokens) and tokens[arg][0]=='quoted' and tokens[arg][1]:
            result.append({'reference':tokens[arg][1],'line':text.count('\n',0,pos)+1,'base':'module' if value=='import' else 'document'})
    return result

def external_request_findings(files):
    findings=[]
    for path,relative in files:
        if path.suffix.lower() not in ('.html','.htm','.js','.mjs') or path.stat().st_size>4_000_000:continue
        if any(p in ('evidence','verification','screenshots','supply-delivery','platform-delivery') for p in Path(relative).parts):continue
        text=path.read_text('utf-8',errors='replace')
        if path.suffix.lower() in ('.html','.htm'):
            sources=[m for m in re.finditer(r'<script\b[^>]*>(.*?)</script\s*>',text,re.I|re.S)]
            calls=[dict(r,line=r['line']+text.count('\n',0,m.start(1))) for m in sources for r in javascript_requests(m[1])]
        else:calls=javascript_requests(text)
        for request in calls:
            try:host=urlsplit(request['reference']).hostname;scheme=urlsplit(request['reference']).scheme
            except ValueError:continue
            if host and scheme in ('http','https','ws','wss',''):
                findings.append({'file':relative,'line':request['line'],'host':host,'code':'EXTERNAL_REQUEST_REJECTED'})
                if len(findings)>=20:return findings
    return findings

class References(HTMLParser):
    def __init__(self):super().__init__();self.refs=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag in ('script','img','audio','video','source','iframe','embed'):self.refs.append(a.get('src',''))
        if tag=='link' and a.get('rel') in ('stylesheet','preload','modulepreload','icon'):self.refs.append(a.get('href',''))

def css_urls(text):
    # Consume quoted URLs as a whole: an SVG data URL may itself contain
    # filter='url(%23id)', which is not another stylesheet file request.
    pattern=r'''url\(\s*(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'|([^\s"')]*))\s*\)'''
    return [next(value for value in match.groups() if value is not None)
            for match in re.finditer(pattern,text,re.I)]

def audit(root,aliases=None):
    root=Path(root).resolve();refs=[];missing=[];external=[];files=[];dynamic=[];backend=[]
    imports={}
    if (root/'index.html').is_file():
        entry=(root/'index.html').read_text('utf-8',errors='replace')
        for block in re.finditer(r'<script\b([^>]*)>(.*?)</script\s*>',entry,re.I|re.S):
            if not re.search(r'''\btype\s*=\s*["']importmap["']''',block[1],re.I):continue
            try:
                mapping=json.loads(block[2]).get('imports',{})
                if isinstance(mapping,dict):imports.update({k:v for k,v in mapping.items() if isinstance(k,str) and isinstance(v,str)})
            except (ValueError,AttributeError):pass
    for p in sorted(root.rglob('*')):
        if not p.is_file() or any(x in ('evidence','screenshots','platform-delivery','.git','node_modules') for x in p.relative_to(root).parts):continue
        rel=p.relative_to(root).as_posix()
        if p.is_symlink() or not p.resolve().is_relative_to(root):missing.append({'file':rel,'reference':'unsafe path'});continue
        files.append({'file':rel,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
        if p.suffix not in ('.html','.css','.js','.mjs') or p.stat().st_size>4_000_000:continue
        text=p.read_text('utf-8',errors='replace');values=[];direct=set()
        if p.suffix=='.html':
            parser=References();parser.feed(text);values+=parser.refs
            requests=[r for m in re.finditer(r'<script\b[^>]*>(.*?)</script\s*>',text,re.I|re.S)
                      for r in javascript_requests(m[1])]
            direct={r['reference'] for r in requests}
            values+=requests
        if p.suffix in ('.css','.html'):
            # JavaScript templates may contain CSS url(${variable}); those are
            # expressions, not literal resource paths in the document stylesheet.
            css_text=re.sub(r'<script\b[^>]*>.*?</script\s*>','',text,flags=re.I|re.S) if p.suffix=='.html' else text
            values+=css_urls(css_text)
        if p.suffix in ('.js','.mjs'):
            # Object methods such as app.import('cc') resolve module identifiers,
            # not document-relative files. Do not report a nonexistent file cc.
            requests=javascript_requests(text)
            direct={r['reference'] for r in requests}
            values+=requests
            values+=[value for kind,value,_ in javascript_tokens(text) if kind=='quoted' and value not in direct and value.startswith('assets/') and not value.endswith('/') and not any(c.isspace() for c in value)]
            if re.search(r'(?:fetch|import)\(\s*[^"\'\s]',text):dynamic.append(rel)
        for reference in values:
            value=reference['reference'] if isinstance(reference,dict) else reference
            if not value or value.startswith(('#','data:','blob:')):continue
            mapped_module=False
            if isinstance(reference,dict) and reference.get('base')=='module':
                key=value if value in imports else next((key for key in sorted(imports,key=len,reverse=True) if key.endswith('/') and value.startswith(key)),None)
                if key is not None:value=imports[key]+value[len(key):];mapped_module=True
            u=urlsplit(value);row={'file':rel,'reference':value}
            if u.scheme or u.netloc:external.append(row);continue
            if value in direct and u.path.startswith('/api/') and not Path(u.path).suffix:
                backend.append(row);continue
            # Script fetch paths are document-relative; CSS references are stylesheet-relative.
            base=root if mapped_module else p.parent if p.suffix in ('.css','.html') or (isinstance(reference,dict) and reference.get('base')=='module') else root
            target=(root/unquote(u.path).lstrip('/') if u.path.startswith('/') else base/unquote(u.path)).resolve()
            if aliases and target.is_relative_to(root):
                mapped=aliases.get(target.relative_to(root).as_posix())
                if mapped:target=(root/mapped).resolve()
            if (not isinstance(reference,dict) and value not in direct
                    and p.suffix in ('.js','.mjs') and value.startswith('assets/')
                    and target.is_relative_to(root) and target.is_dir()):
                continue  # Existing directory prefix, never a direct fetch/import.
            # A bare assets/... string is only a reference hint. Cocos jsList
            # entries are relative to their settings script, unlike fetch URLs.
            if not target.is_file() and value not in direct and p.suffix in ('.js','.mjs') and value.startswith('assets/'):
                alternate=(p.parent/unquote(u.path)).resolve()
                if alternate.is_relative_to(root) and alternate.is_file():target=alternate
            refs.append(row)
            if not target.is_relative_to(root) or not target.is_file():missing.append(row)
    return {'schema_version':1,'status':'blocked' if missing or external else 'static_pass','files':files,'references':refs,'missing':missing,'external':external,
            'backend_endpoints':backend,'dynamic_files':dynamic,'scope':'HTML/CSS、全局 fetch/import 字面量及 assets 路径线索；API 路由单独登记，不视为静态文件。动态拼接、引擎加载、后端依赖和全关卡必须另做运行验证'}
