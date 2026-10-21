"""Apply bounded text changes to an immutable server-selected baseline."""
import tempfile
import base64
from pathlib import Path
from .repository import safe_relative


def revision_artifact(service, artifact_id, version, changes, entry, screenshots=None):
    from tools.import_local_review import snapshot
    if not isinstance(changes,dict) or not 1<=len(changes)<=100:
        raise ValueError('Provide 1–100 changed text files')
    if sum(len(v.encode('utf-8')) for v in changes.values() if isinstance(v,str))>2_000_000:
        raise ValueError('Text changes exceed 2 MB')
    for name,value in changes.items():
        safe_relative(name)
        if not isinstance(value,str) or Path(name).suffix.lower() not in ('.html','.js','.mjs','.css','.json','.md','.txt','.svg'):
            raise ValueError('Revision accepts text code only; existing assets are preserved')
        if name.startswith(('assets/','vendor/','screenshots/')):
            raise ValueError('Resource directories are preserved; change application code instead')
    baseline=service.repo.artifacts/version['artifact_id']
    with tempfile.TemporaryDirectory() as directory:
        # snapshot performs path, symlink, size and count validation before copying.
        class TempRepo:
            artifacts=Path(directory)
        snapshot(TempRepo(),'work',baseline,version['entry'])
        work=Path(directory)/'work'
        for name,value in changes.items():
            target=work/name;target.parent.mkdir(parents=True,exist_ok=True)
            target.write_text(value,encoding='utf-8',newline='')
        if screenshots:
            if not isinstance(screenshots,dict) or len(screenshots)>4:
                raise ValueError('Too many screenshots')
            for name,value in screenshots.items():
                safe_relative(name)
                if not name.startswith('screenshots/') or not name.endswith('.png'):
                    raise ValueError('Invalid screenshot path')
                data=base64.b64decode(value,validate=True)
                if len(data)>2_000_000 or not data.startswith(b'\x89PNG\r\n\x1a\n'):
                    raise ValueError('Invalid PNG screenshot')
                target=work/name;target.parent.mkdir(exist_ok=True,parents=True);target.write_bytes(data)
        return snapshot(service.repo,artifact_id,work,entry)
