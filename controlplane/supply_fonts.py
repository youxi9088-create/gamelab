"""Close explicit public CSS font references in an independent supply copy."""
import hashlib
import json
from pathlib import Path
import re
from urllib.parse import urlsplit,urljoin,unquote
import urllib.request
import urllib.error

from .discovery_scan import public_url
from .supply import NoRedirect

def font_bytes(url):
    current=url
    opener=urllib.request.build_opener(NoRedirect)
    for _ in range(5):
        if urlsplit(current).scheme!='https':raise ValueError('供货字体重定向必须使用HTTPS')
        public_url(current)
        request=urllib.request.Request(current,headers={'User-Agent':'GameLabSupply/1.0'})
        try:
            with opener.open(request,timeout=20) as response:return response.read(2_000_001),current
        except urllib.error.HTTPError as error:
            location=(error.headers or {}).get('Location')
            if error.code not in (301,302,303,307,308) or not location:raise
            current=urljoin(current,location);error.close()
    raise ValueError('供货字体重定向次数超过上限')

def css_origins(root,css):
    """Use only the converter's explicit URL-to-file provenance, never JS eval."""
    record=root/'runtime-resource-map.js'
    if not record.is_file() or record.stat().st_size>4_000_000:return []
    text=record.read_text('utf-8')
    assignment=re.match(r'\s*window\.runtimeResourceBindings\s*=\s*',text)
    if not assignment:return []
    try:bindings,_=json.JSONDecoder().raw_decode(text[assignment.end():])
    except ValueError:return []
    if not isinstance(bindings,dict):return []
    origins=[]
    for url,local in bindings.items():
        if not isinstance(url,str) or not isinstance(local,str):continue
        if urlsplit(url).scheme!='https' or urlsplit(local).scheme or urlsplit(local).netloc:continue
        target=(root/unquote(urlsplit(local).path).lstrip('/')).resolve()
        if target.is_relative_to(root.resolve()) and target==css.resolve():origins.append(url)
    return list(dict.fromkeys(origins))


def localize(root):
    root=Path(root);known={};records=[]
    from .supply_resources import stylesheet_paths
    for css in sorted(set(root.rglob('*.css'))|{root/name for name in stylesheet_paths(root)}):
        if css.relative_to(root).parts[0] in ('evidence','verification','supply-delivery'):continue
        text=css.read_text('utf-8');origins=css_origins(root,css)
        def replace(match):
            url=match[2];parts=urlsplit(url)
            suffix=Path(parts.path).suffix.lower()
            if suffix not in ('.ttf','.otf','.woff','.woff2'):return match[0]
            source_css=None
            if not parts.scheme and not parts.netloc:
                target=(root/unquote(parts.path).lstrip('/') if parts.path.startswith('/') else css.parent/unquote(parts.path)).resolve()
                if not target.is_relative_to(root.resolve()) or target.exists() or len(origins)!=1:return match[0]
                source_css=origins[0];url=urljoin(source_css,url);parts=urlsplit(url)
            if parts.scheme!='https':return match[0]
            if url not in known:
                if len(known)>=32:raise ValueError('供货CSS字体补齐超过32项限额')
                try:
                    data,resolved_url=font_bytes(url)
                except urllib.error.HTTPError as error:
                    from .supply import SupplyError
                    raise SupplyError('MISSING_LOCAL_RESOURCE',422,details=[{
                        'file':css.relative_to(root).as_posix(),'reference':match[2],
                        'source_status':error.code,'resource_kind':'font'}]) from None
                if len(data)>2_000_000 or len(data)<12 or data[:4] not in (b'\x00\x01\x00\x00',b'OTTO',b'wOFF',b'wOF2'):
                    raise ValueError('供货CSS字体内容或容量校验失败')
                destination=root/'delivery-fonts'/('font-item-'+str(len(known)+1).zfill(5)+suffix)
                if destination.exists():raise ValueError('供货字体文件冲突')
                destination.parent.mkdir(exist_ok=True)
                destination.write_bytes(data);known[url]=destination
                records.append({'url':url,'path':destination.relative_to(root).as_posix(),
                                'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)})
                if resolved_url!=url:records[-1]['resolved_url']=resolved_url
                if source_css:records[-1]['declared_by']=source_css
            import os
            relative=os.path.relpath(known[url],css.parent).replace('\\','/')
            return 'url("'+relative+'")'
        updated=re.sub(r'url\(\s*(["\']?)([^\s\)"\']+)\1\s*\)',replace,text)
        if updated!=text:css.write_text(updated,'utf-8')
    if records:
        (root/'delivery-font-map.json').write_text(json.dumps({'files':records,
            'scope':'仅补齐供货副本CSS明确声明的公开字体，真实字节校验；原版本不变。'},ensure_ascii=False,indent=2),'utf-8')
    return records
