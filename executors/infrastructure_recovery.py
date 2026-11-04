"""Bounded verifier recovery, separate from model edits to game content."""
import json
import os
from pathlib import Path
import urllib.error


def classify(error):
    if getattr(error,'resource_transport_failure',None):return 'public_resource_transport'
    if getattr(error,'platform_request_path',None) and isinstance(getattr(error,'reason',error),TimeoutError):
        return 'control_plane_timeout'
    if 'Viewport screenshot timed out' in str(error):
        return 'verifier_screenshot_timeout'
    if 'page.goto' in str(error) and 'Timeout' in str(error) and 'https://replica-runtime.invalid/' in str(error):
        return 'verifier_navigation_timeout'
    return None


def recover(error, run, budget, retry):
    kind=classify(error)
    if not kind:
        return None
    run=Path(run);path=run/'infrastructure-recovery.json'
    report=json.loads(path.read_text('utf-8')) if path.exists() else {'attempts':[]}
    error.infrastructure_failure={'kind':kind,'owner':'platform','verification_required':True}
    if kind=='public_resource_transport':
        error.infrastructure_failure.update(owner='source_access',resource=error.resource_transport_failure)
    if getattr(error,'platform_request_path',None):
        error.infrastructure_failure['endpoint']=error.platform_request_path
    # Writes have already used the client's stable idempotency key and bounded
    # retries. Never add another replay layer or ask the model to edit a game.
    if kind not in ('verifier_screenshot_timeout','verifier_navigation_timeout'):
        return False,None
    if retry is None or any(a.get('kind')==kind for a in report['attempts']):
        return False,None
    budget.remaining(60)
    row={'kind':kind,'action':'restart_owned_verification_session','passed':False,
         'retry_environment':{'BROWSER_HEADLESS':'true'},
         'scope':'Same deployment origin, package and requested inputs; no acceptance override'}
    report['attempts'].append(row)
    path.write_text(json.dumps(report,ensure_ascii=False,indent=2),'utf-8')
    previous_headless=os.environ.get('BROWSER_HEADLESS')
    previous_backend=os.environ.get('BROWSER_WEBGL_BACKEND')
    try:
        # This worker owns one job. Avoid a detached Windows desktop compositor
        # in the replacement browser without changing global runtime settings.
        os.environ['BROWSER_HEADLESS']='true'
        if kind=='verifier_screenshot_timeout':
            os.environ['BROWSER_WEBGL_BACKEND']='default'
            row['retry_environment']['BROWSER_WEBGL_BACKEND']='default'
        result=retry()
    except Exception as failure:
        row['error_type']=type(failure).__name__
        row['same_failure']=classify(failure)==kind
        if not row['same_failure']:
            # New game/resource failures must enter their own normal diagnosis.
            raise
        return False,None
    else:
        row['passed']=True
        return True,result
    finally:
        if previous_headless is None:os.environ.pop('BROWSER_HEADLESS',None)
        else:os.environ['BROWSER_HEADLESS']=previous_headless
        if previous_backend is None:os.environ.pop('BROWSER_WEBGL_BACKEND',None)
        else:os.environ['BROWSER_WEBGL_BACKEND']=previous_backend
        path.write_text(json.dumps(report,ensure_ascii=False,indent=2),'utf-8')
