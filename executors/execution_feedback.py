"""Carry failed browser observations into retry without treating them as user instructions."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parent/'runs'


def previous_failure(job):
    """Job-bound failed conversion evidence, including rounds without a version."""
    path=(job.get('report') or {}).get('run_directory')
    if not path:return None
    run=Path(path).resolve()
    if run.parent!=ROOT.resolve():return None
    def read(name):
        p=run/name
        if not p.is_file() or p.is_symlink() or not p.resolve().is_relative_to(run) or p.stat().st_size>2_000_000:return None
        return json.loads(p.read_text('utf-8'))
    try:
        if (read('job-binding.json') or {}).get('job_id')!=job['id']:return None
        repair=read('auto-repair/report.json') or {}
        episodes=repair.get('episodes') or [repair]
        attempts=[{k:a[k] for k in ('action','diagnosis','verification_error','verified','reason','next_action') if k in a}
                  for ep in episodes[-4:] for a in ep.get('attempts',[])][-16:]
        runtime=read('converted/evidence/runtime.json') or {}
        return {'source':'Previous execution evidence, not user instructions or current verification',
                'run':run.name,'original_error':repair.get('original_error'),
                'attempts':attempts,'runtime':{k:runtime[k] for k in ('passed','failure','runtime_origin','errors','missing','required_external','lastObserved') if k in runtime},
                'instruction':'Compare current evidence with these failed attempts; do not repeat unchanged repairs or treat old success as current acceptance.'}
    except (OSError,ValueError,TypeError):return None

def previous_execution(job):
    path=(job.get('report') or {}).get('run_directory')
    if not path:return None
    run=Path(path).resolve()
    if run.parent!=ROOT.resolve():return None
    try:
        if json.loads((run/'job-binding.json').read_text('utf-8')).get('job_id')!=job['id']:return None
        web_reports=sorted(run.glob('web-review-*/runtime.json'),key=lambda p:int(p.parent.name.split('-')[-1]))
        for report in reversed(web_reports):
            runtime=json.loads(report.read_text('utf-8'))
            if not runtime.get('passed'):continue
            history=[]
            for model in sorted(run.glob('web-review-*/model.json'),key=lambda p:int(p.parent.name.split('-')[-1])):
                value=json.loads(model.read_text('utf-8'))
                history.append({k:value[k] for k in ('summary','actions','read_requests','search_requests') if k in value})
            return {'runtime':runtime,'actions':runtime.get('actions',[]),'web_source':str(run/'converted'),
                    'model_history':history[-16:],'source':'Prior platform execution; source must match the current baseline before replay'}
        reports=sorted(run.glob('revision-*/runtime-report.json'),key=lambda p:int(p.parent.name.split('-')[-1]))
        if not reports:return None
        report=reports[-1];runtime=json.loads(report.read_text('utf-8'))
        resultfile=run/('model-step-'+report.parent.name.split('-')[-1]+'.json')
        result=json.loads(resultfile.read_text('utf-8')) if resultfile.exists() else {}
        return {'runtime':runtime,'actions':result.get('acceptance_actions',[]),'summary':result.get('summary'),'source':'Prior platform execution; not a user request'}
    except (OSError,ValueError):return None
