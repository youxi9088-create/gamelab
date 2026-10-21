"""Carry failed browser observations into retry without treating them as user instructions."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parent/'runs'

def previous_execution(job):
    path=(job.get('report') or {}).get('run_directory')
    if not path:return None
    run=Path(path).resolve()
    if run.parent!=ROOT.resolve():return None
    try:
        if json.loads((run/'job-binding.json').read_text('utf-8')).get('job_id')!=job['id']:return None
        reports=sorted(run.glob('revision-*/runtime-report.json'),key=lambda p:int(p.parent.name.split('-')[-1]))
        if not reports:return None
        report=reports[-1];runtime=json.loads(report.read_text('utf-8'))
        resultfile=run/('model-step-'+report.parent.name.split('-')[-1]+'.json')
        result=json.loads(resultfile.read_text('utf-8')) if resultfile.exists() else {}
        return {'runtime':runtime,'actions':result.get('acceptance_actions',[]),'summary':result.get('summary'),'source':'Prior platform execution; not a user request'}
    except (OSError,ValueError):return None
