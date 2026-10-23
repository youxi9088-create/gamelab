"""Cocos delivery resource layout: semantic files, explicit runtime URL aliases.

Engine UUIDs remain logical identifiers. Original versions are never modified.
The generated browser adapter resolves these identifiers to replaceable files;
the map records exact original bytes and is itself part of the delivery contract.
"""
import hashlib
import json
import os
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit

from .repository import safe_relative

HASH_NAME=re.compile(r'(?:^|[.-])[0-9a-f]{8,}(?:[.-]|$)',re.I)


def adapter(mapping):
    return """/* GameLab resource aliases: engine IDs are preserved, assets remain individual files. */
(()=>{'use strict';const aliases=MAP;
const base=new URL('.',document.currentScript.src);
function resolve(value){try{const u=new URL(String(value),document.baseURI);if(u.origin!==base.origin||!u.pathname.startsWith(base.pathname))return value;
const key=decodeURIComponent(u.pathname.slice(base.pathname.length)),target=aliases[key];if(!target)return value;
const mapped=new URL(target,base);mapped.search=u.search;mapped.hash=u.hash;return mapped.href;}catch{return value;}}
const fetchOriginal=window.fetch;if(fetchOriginal)window.fetch=function(input,init){if(input instanceof Request){const target=resolve(input.url);return fetchOriginal.call(this,target===input.url?input:new Request(target,input),init);}return fetchOriginal.call(this,resolve(input),init);};
const open=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(method,url,...rest){return open.call(this,method,resolve(url),...rest);};
for(const [type,property] of [[HTMLImageElement,'src'],[HTMLScriptElement,'src'],[HTMLMediaElement,'src'],[HTMLSourceElement,'src'],[HTMLLinkElement,'href']]){let owner=type.prototype;while(owner&&!Object.getOwnPropertyDescriptor(owner,property))owner=Object.getPrototypeOf(owner);const d=owner&&Object.getOwnPropertyDescriptor(owner,property);if(d&&d.set)Object.defineProperty(type.prototype,property,{...d,set(value){return d.set.call(this,resolve(value));}});}
const attr=Element.prototype.setAttribute;Element.prototype.setAttribute=function(name,value){return attr.call(this,name,/^(src|href)$/i.test(name)?resolve(value):value);};
window.GameLabResourceResolver={resolve,scope:'Explicit local resource aliases; no remote requests or game state modification'};
})();
""".replace('MAP',json.dumps(mapping,ensure_ascii=True,separators=(',',':')))


def prepare(root):
    root=Path(root)
    if (root/'delivery-resource-map.json').exists():
        validated_aliases(root)
        return {'renamed':0,'deduplicated':0,'existing':True}
    configs=list(root.glob('assets/*/config*.json'))
    recognized=False
    for p in configs:
        try:
            value=json.loads(p.read_text('utf-8'))
            if isinstance(value,dict) and isinstance(value.get('uuids'),list) and isinstance(value.get('paths'),dict):recognized=True;break
        except (ValueError,OSError):continue
    if not recognized:return {'renamed':0,'deduplicated':0}
    files=sorted(p for p in root.rglob('*') if p.is_file())
    plans={};seen={};hashes={};renamed=deduplicated=0
    categories={'.png':'image','.jpg':'image','.jpeg':'image','.webp':'image','.mp3':'audio','.ogg':'audio',
                '.wav':'audio','.json':'asset-data','.atlas':'atlas','.plist':'atlas','.bin':'buffer','.js':'module','.mjs':'module'}
    for p in files:
        old=p.relative_to(root).as_posix();parts=Path(old).parts
        if not parts or parts[0] not in ('assets','subpackages','cocos-js'):continue
        digest=hashlib.sha256(p.read_bytes()).hexdigest();key=(p.suffix.lower(),digest)
        # Code/styles retain directory-relative evaluation semantics. Only data
        # responses may share storage across directories.
        can_dedupe=p.suffix.lower() not in ('.js','.mjs','.cjs','.html','.css') and not p.name.startswith('config')
        if can_dedupe and key in seen:
            plans[old]=seen[key];hashes[old]=digest;deduplicated+=1;continue
        new=old
        if HASH_NAME.search(p.name):
            label=categories.get(p.suffix.lower(),'resource')
            # Keep original directory so relative JS imports retain their base.
            new=(p.parent/(label+'-item-'+str(len(plans)+1).zfill(5)+p.suffix)).relative_to(root).as_posix()
            if (root/new).exists():raise ValueError('供货资源名称冲突')
            plans[old]=new;hashes[old]=digest;renamed+=1
        if can_dedupe:seen[key]=new
    if not plans:return {'renamed':0,'deduplicated':0}
    for old,new in plans.items():
        p=root/old;dest=root/new
        if not dest.exists():p.rename(dest)
        else:
            if hashlib.sha256(dest.read_bytes()).hexdigest()!=hashes[old]:raise ValueError('供货资源去重哈希不符')
            p.unlink()
    def reference(value,relative):
        u=urlsplit(value)
        if u.scheme or u.netloc or not u.path:return value
        original=(root/unquote(u.path).lstrip('/')) if u.path.startswith('/') else (root/relative).parent/unquote(u.path)
        original=original.resolve()
        if not original.is_relative_to(root.resolve()):return value
        target=plans.get(original.relative_to(root.resolve()).as_posix())
        if not target:return value
        value=os.path.relpath(root/target,(root/relative).parent).replace('\\','/')
        return value+('?' +u.query if u.query else '')+('#'+u.fragment if u.fragment else '')
    # Parser-discovered HTML resources load before prototype interception. CSS
    # URLs also need static rewriting. Logical engine/module IDs are untouched.
    for p in sorted(root.rglob('*')):
        if p.suffix.lower() not in ('.html','.css') or not p.is_file():continue
        rel=p.relative_to(root).as_posix();text=p.read_text('utf-8')
        if p.suffix.lower()=='.html':
            text=re.sub(r'((?:src|href)\s*=\s*)(["\'])(.*?)(\2)',lambda m:m[1]+m[2]+reference(m[3],rel)+m[4],text,flags=re.I)
        text=re.sub(r'url\(\s*(["\']?)([^\s\)"\']+)\1\s*\)',lambda m:'url('+m[1]+reference(m[2],rel)+m[1]+')',text)
        p.write_text(text,'utf-8')
    script=root/'delivery-resource-loader.js'
    if script.exists():raise ValueError('供货资源加载器名称冲突')
    script.write_text(adapter(plans),'utf-8')
    entry=root/'index.html';text=entry.read_text('utf-8')
    tag='<script src="delivery-resource-loader.js"></script>'
    # Before any executable game scripts; charset/doctype remain valid.
    match=re.search(r'<script\b',text,re.I)
    if match:text=text[:match.start()]+tag+text[match.start():]
    else:text+=tag
    entry.write_text(text,'utf-8')
    (root/'delivery-resource-map.json').write_text(json.dumps({'schema':1,'aliases':plans,'source_sha256':hashes,
        'scope':'仅调整独立供货副本的资源存储与请求映射；引擎 UUID、游戏规则和存档不变；完整玩法需在交付环境核对。'},ensure_ascii=False,indent=2),'utf-8')
    return {'renamed':renamed,'deduplicated':deduplicated,'runtime_recheck_required':True}


def validated_aliases(root):
    root=Path(root).resolve();path=root/'delivery-resource-map.json'
    if not path.exists():return {}
    data=json.loads(path.read_text('utf-8'));mapping=data['aliases'];hashes=data['source_sha256']
    if not isinstance(mapping,dict) or len(mapping)>10000:raise ValueError('资源映射无效')
    if (root/'delivery-resource-loader.js').read_text('utf-8')!=adapter(mapping):raise ValueError('资源加载器与映射不符')
    if '<script src="delivery-resource-loader.js"></script>' not in (root/'index.html').read_text('utf-8'):raise ValueError('资源加载器未接入')
    for old,new in mapping.items():
        safe_relative(old);safe_relative(new);p=(root/new).resolve()
        if not p.is_relative_to(root) or not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest()!=hashes[old]:
            raise ValueError('资源映射校验失败：'+old)
    return mapping
