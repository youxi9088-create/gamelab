"""Snapshot indexed Cocos download resources, never arbitrary account storage."""
import hashlib
import json
from pathlib import Path, PurePosixPath
from urllib.parse import urlsplit


def collect_download_cache(local_roots, output, max_bytes=512*1024*1024):
    output=Path(output); output.mkdir(parents=True,exist_ok=False)
    result={'files':[], 'missing':[], 'rejected':[], 'bytes':0,
            'scope':'Only resource URLs listed in the matched game cacheList; not all game dependencies.'}
    seen=set()
    for local in local_roots:
        root=Path(local).resolve(); base=(root/'usr/gamecaches').resolve()
        if not base.is_relative_to(root):raise ValueError('Cache directory escapes game root')
        index=base/'cacheList.json'
        if not index.is_file():continue
        if index.stat().st_size>8*1024*1024:raise ValueError('Cache index exceeds limit')
        entries=json.loads(index.read_text('utf-8')).get('files',{})
        if not isinstance(entries,dict) or len(entries)>20000:raise ValueError('Invalid cache index')
        for url, item in entries.items():
            parsed=urlsplit(url)
            if parsed.scheme not in ('http','https') or not parsed.hostname or parsed.username or parsed.password:
                result['rejected'].append({'url':url,'reason':'not a public resource URL'});continue
            if url in seen:continue
            cached=item.get('url','') if isinstance(item,dict) else ''
            rel=cached.removeprefix('wxfile://')
            if not cached.startswith('wxfile://usr/gamecaches/') or '\\' in rel or '..' in PurePosixPath(rel).parts:
                result['rejected'].append({'url':url,'reason':'outside resource cache'});continue
            source=(root/rel).resolve()
            if not source.is_relative_to(base):
                result['rejected'].append({'url':url,'reason':'resource path escapes cache'});continue
            if not source.is_file():result['missing'].append({'url':url,'reason':'cache file absent'});continue
            size=source.stat().st_size
            if result['bytes']+size>max_bytes:raise ValueError('Download cache exceeds snapshot budget')
            data=source.read_bytes()
            if len(data)!=size:raise ValueError('Cache changed during snapshot; retry acquisition')
            digest=hashlib.sha256(data).hexdigest()
            suffix=Path(parsed.path).suffix
            if not suffix or len(suffix)>12 or not suffix[1:].isalnum():suffix='.bin'
            name=hashlib.sha256(url.encode()).hexdigest()+suffix
            (output/name).write_bytes(data)
            result['files'].append({'url':url,'file':name,'bytes':size,'sha256':digest})
            result['bytes']+=size;seen.add(url)
    result['complete_index']=not result['missing'] and not result['rejected'] and bool(result['files'])
    (output/'manifest.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),'utf-8')
    return result
