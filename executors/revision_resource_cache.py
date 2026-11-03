"""Carry verified resource bytes across job revisions, never verification results."""
import hashlib
import json
from pathlib import Path
import shutil
from html import escape


def adopt(run, acquisition):
    run=Path(run).resolve();target=run/'converted'
    # Unbound imports and isolated inspections cannot inherit another run's
    # resources. Cache reuse is optional; do not crash the normal revision.
    try:job=json.loads((run/'job-binding.json').read_text('utf-8'))['job_id']
    except (OSError,ValueError,KeyError,TypeError):return []
    if not isinstance(job,str) or not job:return []
    declarations='\n'.join(p.read_text('utf-8',errors='replace') for p in target.rglob('*')
        if p.is_file() and p.suffix.lower() in ('.html','.js','.mjs') and p.stat().st_size<=5_000_000
        and p.relative_to(target).parts[0] not in ('evidence','verification','screenshots'))
    rows=[];mapping=dict(acquisition.get('runtime_resource_map',{}));total=0
    sources=sorted((p for p in run.parent.iterdir() if p.is_dir() and p!=run),
                   key=lambda p:p.stat().st_mtime,reverse=True)[:100]
    for prior in sources:
        try:
            if prior.is_symlink() or json.loads((prior/'job-binding.json').read_text('utf-8')).get('job_id')!=job:continue
            old=json.loads((prior/'web-acquisition.json').read_text('utf-8'))
            if (old.get('url'),old.get('referer'))!=(acquisition.get('url'),acquisition.get('referer')):continue
            for row in old.get('files',[]):
                url=row.get('url');name=row.get('path','');relative=Path(name)
                if not isinstance(url,str) or url in mapping:continue
                if not any(quote+spelling+quote in declarations for quote in ('"',"'") for spelling in (url,escape(url,quote=True))):continue
                if not name.startswith('_runtime_resources/') or relative.is_absolute() or '..' in relative.parts or ':' in name or '\\' in name:continue
                source=prior/'web-original'/relative
                if source.is_symlink() or not source.resolve().is_relative_to(prior.resolve()) or not source.is_file():continue
                size=source.stat().st_size
                if size!=row.get('bytes') or size>20_000_000 or total+size>80_000_000:continue
                if hashlib.sha256(source.read_bytes()).hexdigest()!=row.get('sha256'):continue
                destination=target/relative
                if destination.exists():continue
                destination.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,destination)
                mapping[url]='./'+name;rows.append(dict(row));total+=size
                acquisition.setdefault('resource_cache_reuse',[]).append({'source_run':prior.name,
                    'url':url,'sha256':row['sha256'],'bytes':size,'verification_required':True})
        except (OSError,ValueError,KeyError,TypeError):continue
    if rows:
        acquisition.setdefault('files',[]).extend(rows)
        acquisition['runtime_resource_map']=mapping
        acquisition['bytes']=acquisition.get('bytes',0)+total
        encoded=json.dumps(acquisition,ensure_ascii=False)
        (run/'web-acquisition.json').write_text(encoded,'utf-8')
        (target/'evidence/acquisition.json').write_text(encoded,'utf-8')
        (target/'runtime-resource-map.js').write_text('window.runtimeResourceBindings='+json.dumps(mapping)+';','utf-8')
    return rows
