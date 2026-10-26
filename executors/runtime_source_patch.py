"""Bounded compatibility edits in a working copy, followed by mandatory verification."""
import hashlib
import json
from pathlib import Path
import subprocess

from controlplane.runtime import node_binary
from repair_context import linked


def sha(data):return hashlib.sha256(data).hexdigest()


class RuntimeSourcePatch:
    def __init__(self, run, budget):
        self.run = Path(run).resolve()
        self.target = self.run / 'converted'
        self.budget = budget
        self.before = {}
        self.rows = []

    def candidates(self):
        acquisition = json.loads((self.run/'web-acquisition.json').read_text('utf-8'))
        result = {}
        for item in acquisition.get('files', []):
            name = item['path'];relative = Path(name)
            if relative.is_absolute() or '..' in relative.parts or ':' in name or '\\' in name:continue
            if relative.suffix.lower() not in ('.js', '.mjs'):continue
            if set(relative.parts) & {'evidence', 'screenshots', 'verification', 'platform-delivery'}:continue
            working = self.target / relative;original = self.run / 'web-original' / relative
            if any(linked(p) for p in (working, original, *working.parents, *original.parents) if p != self.run.parent):continue
            if not working.is_file() or not original.is_file():continue
            if not working.resolve().is_relative_to(self.target) or not original.resolve().is_relative_to(self.run/'web-original'):continue
            if not 0 < working.stat().st_size <= 2_000_000 or original.stat().st_size > 2_000_000:continue
            if sha(original.read_bytes()) != item['sha256']:continue
            result['converted/'+name] = {'path': 'converted/'+name, 'sha256': sha(working.read_bytes()),
                                        'original_sha256': item['sha256'], 'bytes': working.stat().st_size}
        return result

    def prepare(self, arguments):
        if not isinstance(arguments, dict) or not isinstance(arguments.get('purpose'), str) or not arguments['purpose'].strip():
            raise ValueError('必须说明已查证的兼容问题及本次修改目的')
        patches = arguments.get('patches')
        if not isinstance(patches, list) or not 1 <= len(patches) <= 2:raise ValueError('一次最多修改两个工作副本模块')
        allowed = self.candidates();prepared = {};rows = []
        for patch in patches:
            if not isinstance(patch, dict):raise ValueError('patches 成员必须为对象')
            name = patch.get('path')
            if name not in allowed or name in prepared:raise ValueError('文件不在允许的运行源码工作副本中，或重复提交')
            if patch.get('sha256') != allowed[name]['sha256']:raise ValueError('文件摘要已改变，请重新读取证据')
            path = self.run/name;before = path.read_bytes();text = before.decode('utf-8')
            replacements = patch.get('replacements')
            if not isinstance(replacements, list) or not 1 <= len(replacements) <= 4:raise ValueError('需要 1 至 4 个精确替换')
            for replacement in replacements:
                if not isinstance(replacement, dict):raise ValueError('替换必须为对象')
                old,new = replacement.get('old'),replacement.get('new')
                if not isinstance(old,str) or not isinstance(new,str) or not 8 <= len(old) <= 4000 or len(new)>4000 or old==new:
                    raise ValueError('替换需包含足够上下文，且仅允许有界兼容修改')
                if text.count(old)!=1:raise ValueError('原文必须在当前模块中唯一匹配，禁止盲目全局替换')
                text = text.replace(old,new,1)
            after = text.encode('utf-8')
            if len(after)>2_000_000:raise ValueError('修改后模块超出限制')
            prepared[name] = (before,after)
            rows.append({**allowed[name], 'after_sha256': sha(after), 'replacements': replacements})
        return prepared, rows

    def validate(self, arguments):self.prepare(arguments)

    def apply(self, arguments):
        prepared,rows = self.prepare(arguments)
        # Parse as modules without executing model-supplied code in the service process.
        for before,after in prepared.values():
            result = subprocess.run([node_binary(),'--input-type=module','--check'],input=after,
                                    capture_output=True,timeout=self.budget.remaining(15))
            if result.returncode:raise ValueError('修改后的 JavaScript 语法检查失败，未写入工作副本')
        self.before = {name: before for name,(before,after) in prepared.items()}
        self.rows = rows;self.purpose = arguments['purpose'][:1600]
        for name,(before,after) in prepared.items():(self.run/name).write_bytes(after)
        return {'applied':True,'scope':'working-copy compatibility adaptation; original files unchanged',
                'files':[{k:row[k] for k in ('path','sha256','after_sha256','original_sha256')} for row in rows]}

    def rollback(self):
        for name,before in self.before.items():(self.run/name).write_bytes(before)
        self.before = {};self.rows = []

    def commit(self):
        path = self.target/'evidence/runtime-source-patches.json';path.parent.mkdir(exist_ok=True)
        history = json.loads(path.read_text('utf-8')) if path.exists() else []
        history.append({'purpose':self.purpose,'files':self.rows,'runtime_reverified':True,
                        'scope':'Working copy adapted; gameplay acceptance remains separate.'})
        path.write_text(json.dumps(history,ensure_ascii=False,indent=2),'utf-8')
        self.before = {}
