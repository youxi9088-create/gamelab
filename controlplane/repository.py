"""Central source repository; runtime artifacts are immutable and stored separately."""
import base64
import hashlib
import json
import os
import re
import shutil
import subprocess
import threading
from pathlib import Path, PurePosixPath

REPO_LOCK = threading.RLock()

def git_binary():
    configured = os.getenv('GIT_BIN')
    bundled = Path.home()/'.cache/codex-runtimes/codex-primary-runtime/dependencies/native/git/cmd/git.exe'
    found = configured or shutil.which('git') or (str(bundled) if bundled.exists() else None)
    if not found and os.environ.get('LOCALAPPDATA'):
        local=Path(os.environ['LOCALAPPDATA'])/'door-runtime/mingit/cmd/git.exe'
        if local.is_file():found=str(local)
    if not found:
        raise RuntimeError('Git is required. Set GIT_BIN to its executable.')
    return found

def safe_relative(value):
    if not isinstance(value,str) or not value or '\\' in value or ':' in value or '\x00' in value:
        raise ValueError('Invalid artifact path')
    p = PurePosixPath(value)
    if p.is_absolute() or any(s in ('..','.') or s.startswith('.') for s in p.parts):
        raise ValueError('Artifact paths must be relative and must not contain hidden/traversal segments')
    if any(re.fullmatch(r'(?i)(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?', s) or s.endswith((' ','.')) for s in p.parts):
        raise ValueError('Reserved filename')
    if any(s.lower() in ('node_modules','__pycache__') for s in p.parts):
        raise ValueError('Dependencies must not be uploaded')
    return p

class Repository:
    def __init__(self, root, artifacts):
        self.root, self.artifacts = Path(root).resolve(), Path(artifacts).resolve()
        self.root.mkdir(parents=True,exist_ok=True)
        self.artifacts.mkdir(parents=True,exist_ok=True)
        self.git = git_binary()
        with REPO_LOCK:
            if not (self.root/'.git').exists():
                self.run('init','-b','main')
                (self.root/'README.md').write_text('# Game Library\n\nCentral game sources. Each accepted output is stored under games/<candidate-id>/versions/<version-id>/.\nRuntime bundles and evidence remain in the platform artifact store.\nMigrate with git clone --mirror and git push --mirror to an empty company repository.\n',encoding='utf-8')
                (self.root/'.gitignore').write_text('node_modules/\n.env\ndist/\n',encoding='utf-8')
                self.run('add','README.md','.gitignore')
                self.commit('Initialize game library')

    def run(self,*args):
        r = subprocess.run([self.git,'-C',str(self.root),*args],capture_output=True,text=True,encoding='utf-8',errors='replace',timeout=60)
        if r.returncode:
            raise RuntimeError('Git operation failed: '+r.stderr[:700])
        return r.stdout.strip()

    def commit(self,message):
        return self.run('-c','user.name=Game Library Bot','-c','user.email=game-library@localhost','commit','-m',message)

    def save_artifact(self, artifact_id, files, entry):
        if not isinstance(files,dict) or not 1 <= len(files) <= 500:
            raise ValueError('Upload 1 to 500 files')
        safe_relative(entry)
        if entry not in files or not entry.endswith('.html'):
            raise ValueError('An HTML entry present in files is required')
        decoded, total = {}, 0
        for path,value in files.items():
            safe_relative(path)
            if isinstance(value,str):
                content = value.encode('utf-8')
            elif isinstance(value,dict) and value.get('encoding')=='base64':
                content = base64.b64decode(value['content'],validate=True)
            else:
                raise ValueError('File must be text or {encoding:base64,content:...}')
            total += len(content)
            if total>20*1024*1024:
                raise ValueError('Artifact exceeds 20 MiB')
            decoded[path]=content
        dest = self.artifacts/artifact_id
        dest.mkdir(exist_ok=False)
        for path,content in decoded.items():
            target = dest/path
            target.parent.mkdir(parents=True,exist_ok=True)
            target.write_bytes(content)
        digest = hashlib.sha256()
        for path in sorted(decoded):
            digest.update(path.encode()+b'\0'+decoded[path])
        return dict(size=total,sha256=digest.hexdigest(),files=list(decoded),entry=entry)

    def record(self, candidate, version, artifact):
        with REPO_LOCK:
            rel = f"games/{candidate['id']}/versions/{version['id']}"
            target = self.root/rel
            if not target.exists():
                shutil.copytree(self.artifacts/artifact['id'],target)
                from .game_catalog import write_delivery
                write_delivery(target/'platform-delivery', candidate, version)
                from .delivery_audit import write as write_audit
                write_audit(target,target/'platform-delivery',candidate,version)
                (target/'game.json').write_text(json.dumps(dict(id=candidate['id'],title=candidate['title'],version=version['id'],entry=artifact['entry'],source=candidate['url'],rights=candidate.get('rights','unknown'),artifact_sha256=artifact['sha256']),ensure_ascii=False,indent=2),encoding='utf-8')
                spec=version.get('report',{}).get('game_spec')
                if spec:
                    documentation=target/'platform-delivery'
                    documentation.mkdir(exist_ok=True)
                    (documentation/'game-spec.json').write_text(json.dumps(spec,ensure_ascii=False,indent=2),encoding='utf-8')
                    from .game_specs import test_report
                    tests=test_report(version.get('report',{})) or {}
                    (documentation/'test-report.json').write_text(json.dumps(tests,ensure_ascii=False,indent=2),encoding='utf-8')
                    parts=[f"# {candidate['title']} · 游戏规格",f"品类：{spec['category']}",f"范围：{spec['scope']}"]
                    for key,label in [('controls','操作'),('mechanics','玩法'),('states','状态'),('dependencies','依赖'),('reuse','代码复用边界'),('unknowns','未确认项'),('evidence','来源证据')]:
                        parts.append('## '+label+'\n\n'+'\n'.join('- '+str(x) for x in spec.get(key,[])))
                    parts.append('## 验收用例\n\n'+'\n'.join('- '+c['id']+'：'+c['expected']+'（'+c['mode']+'）' for c in spec['cases']))
                    parts.append('测试报告仅覆盖已执行断言，不替代人工验收或资源分发许可。')
                    (documentation/'GAME_SPEC.md').write_text('\n\n'.join(parts),encoding='utf-8')
                if not (target/'README.md').exists():
                    (target/'README.md').write_text(f"# {candidate['title']}\n\nStatic entry: `{artifact['entry']}`. Serve this directory with an HTTP server.\nSource: {candidate['url']}\n\nThis is a review version, not publication approval.\n",encoding='utf-8')
                self.run('add','--',rel)
                self.commit(f"Record {candidate['id']} version {version['id']}")
            sha = self.run('log','-1','--format=%H','--',rel)
            return dict(commit=sha,source_directory=rel)
