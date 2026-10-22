"""Package only a pushed Git commit; never package the working directory."""
import argparse
import hashlib
import json
import io
from pathlib import Path
import subprocess
import zipfile


def git(*args):return subprocess.check_output(['git',*args])


def build(ref,output):
    commit=git('rev-parse',ref+'^{commit}').decode().strip()
    git('fetch','origin')
    branches=git('branch','-r','--contains',commit).decode().strip()
    if not branches:raise ValueError('版本尚未推送到远程 Git 分支')
    roots=[p for p in git('ls-tree','--name-only',commit).decode().splitlines() if p not in ('bundled-games','.codex-web-debug')]
    source=zipfile.ZipFile(io.BytesIO(git('archive','--format=zip',commit,*roots)))
    output=Path(output);output.parent.mkdir(parents=True,exist_ok=True)
    manifest={}
    with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED) as z:
        for path in source.namelist():
            if path.endswith('/'):continue
            content=source.read(path);z.writestr(path,content);manifest[path]=hashlib.sha256(content).hexdigest()
        z.writestr('RELEASE_MANIFEST.json',json.dumps({'schema':1,'commit':commit,'files':manifest}))
    return {'commit':commit,'file':str(output),'files':len(manifest),'sha256':hashlib.sha256(output.read_bytes()).hexdigest()}


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--ref',default='HEAD');p.add_argument('--output',required=True);a=p.parse_args()
    print(json.dumps(build(a.ref,a.output)))
