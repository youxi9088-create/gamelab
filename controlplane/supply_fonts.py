"""Close explicit public CSS font references in an independent supply copy."""
import hashlib
import json
from pathlib import Path
import re
from urllib.parse import urlsplit
import urllib.request

from .discovery_scan import public_url
from .supply import NoRedirect


def localize(root):
    root=Path(root);known={};records=[]
    for css in sorted(root.rglob('*.css')):
        if css.relative_to(root).parts[0] in ('evidence','verification','supply-delivery'):continue
        text=css.read_text('utf-8')
        def replace(match):
            url=match[2];parts=urlsplit(url)
            suffix=Path(parts.path).suffix.lower()
            if parts.scheme!='https' or suffix not in ('.ttf','.otf','.woff','.woff2'):return match[0]
            if url not in known:
                if len(known)>=8:raise ValueError('供货CSS字体补齐超过8项限额')
                public_url(url)
                request=urllib.request.Request(url,headers={'User-Agent':'GameLabSupply/1.0'})
                with urllib.request.build_opener(NoRedirect).open(request,timeout=20) as response:
                    data=response.read(2_000_001)
                if len(data)>2_000_000 or len(data)<12 or data[:4] not in (b'\x00\x01\x00\x00',b'OTTO',b'wOFF',b'wOF2'):
                    raise ValueError('供货CSS字体内容或容量校验失败')
                destination=root/'delivery-fonts'/('font-item-'+str(len(known)+1).zfill(5)+suffix)
                if destination.exists():raise ValueError('供货字体文件冲突')
                destination.parent.mkdir(exist_ok=True)
                destination.write_bytes(data);known[url]=destination
                records.append({'url':url,'path':destination.relative_to(root).as_posix(),
                                'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)})
            import os
            relative=os.path.relpath(known[url],css.parent).replace('\\','/')
            return 'url("'+relative+'")'
        updated=re.sub(r'url\(\s*(["\']?)(https://[^\s\)"\']+)\1\s*\)',replace,text)
        if updated!=text:css.write_text(updated,'utf-8')
    if records:
        (root/'delivery-font-map.json').write_text(json.dumps({'files':records,
            'scope':'仅补齐供货副本CSS明确声明的公开字体，真实字节校验；原版本不变。'},ensure_ascii=False,indent=2),'utf-8')
    return records
