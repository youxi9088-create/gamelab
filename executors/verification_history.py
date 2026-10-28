"""Compact real executed observations, kept separate from pre-test model narratives."""
import json
import os
from pathlib import Path
ROOT=Path(os.environ.get('REPLICA_RUNS_ROOT',Path(__file__).resolve().parent/'runs')).resolve()

def history(source,job_id):
    if not job_id:return []
    result=[];size=0
    for file in sorted((Path(source)/'verification').glob('*.json'),key=lambda p:p.stat().st_mtime,reverse=True):
        if file.is_symlink() or file.stat().st_size>2_000_000:continue
        try:
            proof=json.loads(file.read_text('utf-8'));runtime=proof.get('runtime',{})
            if runtime.get('passed') is not True:continue
            shot=Path(runtime['screenshot']).resolve();run=shot.parent.parent
            if run.parent!=ROOT.resolve() or json.loads((run/'job-binding.json').read_text('utf-8')).get('job_id')!=job_id:continue
            row={'evidence':'verification/'+file.name,'coverage':runtime.get('coverage'),'historical_execution':True,'source_hashes':proof.get('source_hashes'),
                 'actions':[{'type':a.get('type'),'assertions':[{k:v for k,v in assertion.items() if k!='inputs'} for assertion in a.get('assertions',[])], 'observed_text':a.get('observed_text','')[:1200]} for a in runtime.get('actions',[]) if a.get('completed')]}
            length=len(json.dumps(row,ensure_ascii=False))
            if size+length>40000:continue
            size+=length;result.append(row)
            if len(result)>=12:break
        except (OSError,ValueError,KeyError,TypeError):continue
    return result
