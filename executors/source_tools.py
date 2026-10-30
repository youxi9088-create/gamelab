"""Bounded, optional analysis artifacts independent of runtime acceptance."""
import hashlib
import json
import os
import re
import subprocess
from pathlib import Path
from controlplane.runtime import node_binary

ROOT=Path(__file__).resolve().parent
VERSIONS={'webcrack':'2.16.0','cc-reverse':'2.1.1'}

def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()

def execute_tool(script,source,output,args,timeout):
    source,output,script=Path(source).resolve(),Path(output).resolve(),Path(script).resolve()
    output.mkdir(parents=True,exist_ok=True)
    env={k:v for k,v in os.environ.items() if k.upper() in ('PATH','SYSTEMROOT','WINDIR','TEMP','TMP','HOME','USERPROFILE')}
    command=[node_binary(),'--max-old-space-size=512','--permission',
             '--allow-fs-read='+str(ROOT/'node_modules'),
             '--allow-fs-read='+str((ROOT/'node_modules').resolve()),'--allow-fs-read='+str(script),
             '--allow-fs-read='+str(source),'--allow-fs-read='+str(output),
             '--allow-fs-write='+str(output),str(script),*map(str,args)]
    with (output/'tool.log').open('w',encoding='utf-8') as log:
        result=subprocess.run(command,cwd=output,env=env,stdout=log,stderr=subprocess.STDOUT,timeout=timeout)
    if result.returncode:raise ValueError('tool_exit_'+str(result.returncode))

def run_source_tools(run,budget,engine=None):
    run=Path(run).resolve();source=run/'web-original'
    if not source.is_dir():source=run/'converted'
    root=run/'source-analysis';root.mkdir(exist_ok=True)
    report={'tools':VERSIONS,'runtime_modified':False,'editable_project_verified':False,'items':[]}
    files=[];size=0
    for p in sorted(source.rglob('*')) if source.is_dir() else []:
        if any(q.is_symlink() or (hasattr(q,'is_junction') and q.is_junction()) for q in (p,*p.parents)):continue
        if p.relative_to(source).parts[0] in ('evidence','verification','screenshots','platform-delivery'):continue
        if not p.is_file():continue
        size+=p.stat().st_size
        if len(files)>=2000 or size>220*1024*1024:break
        files.append(p)
    # Prefer game code over engines and SDKs; bounds are explicit in the report.
    scripts=[p for p in files if p.suffix in ('.js','.mjs') and p.stat().st_size<=1_000_000]
    # Bundled Web games often keep the actual game in inline HTML modules.
    # Analyze a copy; never replace the original runtime with decompiled output.
    inline_sources={}
    for document in [p for p in files if p.suffix.lower()=='.html' and p.stat().st_size<=2_000_000][:3]:
        for index,match in enumerate(re.finditer(r'<script\b([^>]*)>(.*?)</script>',document.read_text('utf-8'),re.S|re.I)):
            attrs,code=match.groups()
            if re.search(r'\bsrc\s*=',attrs,re.I) or not re.search(r'\btype\s*=\s*["\']module["\']',attrs,re.I) or not code.strip() or len(code.encode())>1_000_000:continue
            dest=root/'inputs'/f'{digest(document)[:12]}-inline-{index}.js'
            dest.parent.mkdir(exist_ok=True);dest.write_text(code,'utf-8');scripts.append(dest)
            inline_sources[dest]=document.relative_to(run).as_posix()
    scripts.sort(key=lambda p:(0 if p in inline_sources else 2 if 'vendor' in p.parts or any(x in p.name.lower() for x in ('cocos','engine','sdk','three')) else 1, -p.stat().st_size))
    for p in scripts[:3]:
        key=digest(p);out=root/('js-'+VERSIONS['webcrack']+'-'+key);item={'tool':'webcrack','source':p.relative_to(run).as_posix(),'sha256':key,'output':out.relative_to(run).as_posix()}
        if p in inline_sources:item['source_document']=inline_sources[p]
        try:
            marker=out/'complete.json'
            if marker.exists() and valid_artifacts(out):item['status']='reused'
            else:
                execute_tool(ROOT/'analyze-js.cjs',p,out,[p,out],min(30,budget.remaining(30)))
                save_artifacts(out);item['status']='analyzed'
        except Exception as exc:item.update(status='unavailable',error=type(exc).__name__+': '+str(exc)[:160])
        report['items'].append(item)
    cocos=engine=='cocos2' or any(p.name=='application.js' for p in files) and any(p.name.startswith('settings') and p.suffix=='.json' for p in files)
    if cocos:
        fingerprint=hashlib.sha256(('cc-reverse:'+VERSIONS['cc-reverse']+'\n'+'\n'.join(p.relative_to(source).as_posix()+':'+digest(p) for p in files)).encode()).hexdigest()
        out=root/('cocos-'+fingerprint);item={'tool':'cc-reverse','source':source.name,'sha256':fingerprint,'output':out.relative_to(run).as_posix(),'editor_opened':False,'build_verified':False}
        try:
            if (out/'complete.json').exists() and valid_artifacts(out):item['status']='reused'
            else:
                execute_tool(ROOT/'node_modules/cc-reverse/bin/cc-reverse.js',source,out,['--path',source,'--output',out],min(60,budget.remaining(60)))
                if not (out/'RECOVERY_REPORT.md').is_file():raise ValueError('Recovery report missing')
                save_artifacts(out);item['status']='recovered_unverified'
        except Exception as exc:item.update(status='unavailable',error=type(exc).__name__+': '+str(exc)[:160])
        report['items'].append(item)
    report['scope']='At most 3 scripts <=1MB; static analysis copies only. Cocos output requires editor/build validation; failure does not fail the runtime package.'
    (root/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),'utf-8')
    return report

def save_artifacts(root):
    entries={p.relative_to(root).as_posix():digest(p) for p in root.rglob('*') if p.is_file() and p.name not in ('complete.json','tool.log')}
    if not entries:raise ValueError('No tool output')
    (root/'complete.json').write_text(json.dumps(entries),'utf-8')

def valid_artifacts(root):
    try:
        entries=json.loads((root/'complete.json').read_text('utf-8'))
        return bool(entries) and all((root/n).resolve().is_relative_to(root.resolve()) and not (root/n).is_symlink() and digest(root/n)==h for n,h in entries.items())
    except (ValueError,OSError,TypeError):return False
