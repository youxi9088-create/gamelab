"""Prepare immutable embedded assets for the supplier's replaceable-name contract."""
from contextlib import contextmanager
import hashlib
import json
from pathlib import Path
import re
import shutil
import tempfile

@contextmanager
def prepared(source):
    source=Path(source).resolve()
    config=source/'local-config.js';manifest=source/'resource-downloads.json'
    if not config.is_file() or not manifest.is_file():
        yield source;return
    text=config.read_text('utf-8');match=re.search(r'window\.localAssetMap\s*=\s*',text)
    if not match:
        yield source;return
    mapping,_=json.JSONDecoder().raw_decode(text[match.end():])
    provenance={r['path']:r for r in json.loads(manifest.read_text('utf-8')).get('files',[])}
    renames={}
    for i,(key,item) in enumerate(sorted(mapping.items())):
        old=item.get('url','')
        if not re.fullmatch(r'assets/[a-f0-9]{64}\.[A-Za-z0-9]+',old):continue
        original=source/old
        if old not in provenance or not original.is_file() or hashlib.sha256(original.read_bytes()).hexdigest()!=provenance[old]['sha256']:raise ValueError('供货资源来源或哈希不符')
        stem=re.sub(r'[^A-Za-z0-9_-]+','-',key).strip('-')[:70] or 'resource'
        renames.setdefault(old,'assets/'+stem+f'-{i+1:03d}'+original.suffix)
    if not renames:
        yield source;return
    with tempfile.TemporaryDirectory(prefix='supply-prepare-') as t:
        target=Path(t)/'game'
        for p in source.rglob('*'):
            if p.is_symlink() or not p.resolve().is_relative_to(source):raise ValueError('供货源目录包含链接')
        shutil.copytree(source,target)
        for old,new in renames.items():
            if (target/new).exists():raise ValueError('供货资源名称冲突')
            (target/old).rename(target/new)
        for p in target.rglob('*'):
            if p.suffix not in ('.html','.js','.css') or 'evidence' in p.relative_to(target).parts:continue
            content=p.read_text('utf-8')
            for old,new in renames.items():
                for quote in ('"',"'"):content=content.replace(quote+old+quote,quote+new+quote)
            p.write_text(content,'utf-8')
        (target/'supply-resource-map.json').write_text(json.dumps({'renames':renames,'scope':'独立供货包中的资源命名与引用适配；原版本不变'},ensure_ascii=False,indent=2),'utf-8')
        yield target
