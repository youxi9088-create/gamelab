"""Compare a failed deployment probe with an isolated local development host.

Never changes captured game code, deployment origin, or the primary verdict.
"""
import hashlib
import json
import shutil
import subprocess
from pathlib import Path
from controlplane.runtime import node_binary


def probe(run,budget):
    run=Path(run).resolve()
    record=run/'runtime-environment.json'
    target=run/'converted'
    files=[p for p in target.rglob('*') if p.is_file()]
    if len(files)>10000 or sum(p.stat().st_size for p in files)>500_000_000:
        raise ValueError('Environment diagnostic exceeds isolated-copy budget')
    sources={p.relative_to(target).as_posix():hashlib.sha256(p.read_bytes()).hexdigest()
             for p in target.rglob('*') if p.is_file() and not p.is_symlink()
             and not set(p.relative_to(target).parts)&{'evidence','screenshots'}}
    fingerprint=hashlib.sha256(json.dumps(sources,sort_keys=True).encode()).hexdigest()
    if record.is_file():
        previous=json.loads(record.read_text('utf-8'))
        if previous.get('source_fingerprint')==fingerprint:return previous
    diagnostic=run/'environment-probes'/fingerprint[:16]
    if diagnostic.exists():raise ValueError('Environment probe already exists without a completed result')
    for p in target.rglob('*'):
        if p.is_symlink() or (hasattr(p,'is_junction') and p.is_junction()):raise ValueError('Linked diagnostic input refused')
    diagnostic.mkdir(parents=True)
    shutil.copytree(target,diagnostic/'converted')
    shutil.copy2(run/'web-acquisition.json',diagnostic/'web-acquisition.json')
    (diagnostic/'input.json').write_text('{"actions":[]}','utf-8')
    primary=json.loads((target/'evidence/runtime.json').read_text('utf-8'))
    output=diagnostic/'converted/evidence/runtime.json'
    output.unlink(missing_ok=True)
    result=subprocess.run([node_binary(),str(Path(__file__).with_name('discovered-web.cjs')),
        'diagnose-localhost',str(diagnostic/'input.json'),str(diagnostic)],
        capture_output=True,encoding='utf-8',errors='replace',timeout=budget.remaining(150))
    local=json.loads(output.read_text('utf-8')) if output.exists() else {'passed':False,'failure':result.stderr[-1500:]}
    value={'source_fingerprint':fingerprint,'diagnostic_only':True,
           'deployment':{'passed':primary.get('passed'),'origin':primary.get('runtime_origin'),'failure':primary.get('failure')},
           'localhost':{'passed':result.returncode==0 and local.get('passed') is True,'origin':local.get('runtime_origin'),
                        'failure':local.get('failure'),'state':local.get('lastObserved') or (local.get('steps') or [None])[0]},
           'evidence':str(output.relative_to(run)),
           'next_action':'Compare the original startup/environment conditions. Local startup does not establish deployment compatibility or gameplay acceptance.'}
    value['environment_mismatch']=not primary.get('passed') and value['localhost']['passed']
    record.write_text(json.dumps(value,ensure_ascii=False,indent=2),'utf-8')
    return value
