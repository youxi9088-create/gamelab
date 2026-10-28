"""Recover the original Web adapter identity without changing historical versions."""
import json
from pathlib import Path


def prepare(inp):
    previous=inp.get('base_version',{}).get('report',{})
    if str(previous.get('recovery_kind','')).startswith('discovered-web-'):
        return True
    checkpoint=inp.get('_revision_checkpoint') or {}
    if checkpoint.get('changes'):
        return False  # Never abandon saved edits by switching adapters.
    root=Path(inp['source_path'])
    path=root/'evidence/acquisition.json'
    if not path.is_file() or path.is_symlink() or path.stat().st_size>6*1024*1024:
        return False
    try:
        evidence=json.loads(path.read_text('utf-8'))
        engine=evidence.get('engine')
        if engine not in ('cocos2','cocos3','ruffle','defold') or not isinstance(evidence.get('files'),list) or not evidence['files']:
            return False
        if not str(evidence.get('url','')).startswith(('https://','http://')) or not (root/'index.html').is_file():
            return False
    except (OSError,ValueError,TypeError):
        return False
    inp['base_version']={**inp['base_version'],'report':{**previous,'path':'A','recovery_kind':'discovered-web-'+engine}}
    inp['_revision_route_evidence']='evidence/acquisition.json'
    return True
