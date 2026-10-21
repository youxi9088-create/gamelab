"""Produce source distribution without API keys, game assets or test uploads."""
from pathlib import Path
import hashlib,json,zipfile
root=Path(__file__).resolve().parent
files=['server.py','pipeline.cjs','README.md','VALIDATION.md','openapi.json','docs.html','start.ps1','Dockerfile','.dockerignore','.gitignore','make-release.py']
for directory in ('templates','profiles','vendor','tests'):
    files.extend(p.relative_to(root).as_posix() for p in (root/directory).rglob('*') if p.is_file() and '__pycache__' not in p.parts)
archive=root.parent/'wechat-web-service-v0.1.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for name in sorted(files):z.write(root/name,'wechat-web-service/'+name)
with zipfile.ZipFile(archive) as z:
    assert not any('/data/' in n or '/test-output/' in n or n.endswith('.wxapkg') or 'api-key' in n for n in z.namelist())
print(json.dumps({'file':str(archive),'files':len(files),'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest()}))
