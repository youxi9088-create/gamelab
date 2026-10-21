"""Run isolated release checks; never call production selftest or a real provider."""
import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]


def main():
    output=ROOT/'qa-output';output.mkdir(exist_ok=True)
    suites=[('platform',ROOT,['tests']),
            ('executor',ROOT,['executors','test_worker.py']),
            ('model-contract',ROOT,['executors','test_ai_integration.py']),
            ('package-service',ROOT/'services/wechat-web-service',['tests'])]
    results=[]
    for name,cwd,args in suites:
        start=args[0];pattern=args[1] if len(args)>1 else 'test*.py'
        # Explicit sys.path supports the bundled Windows Python which ignores PYTHONPATH.
        code=("import sys,unittest;sys.path[:0]=['.','tests','executors'];"
              f"s=unittest.defaultTestLoader.discover({start!r},pattern={pattern!r});"
              "r=unittest.TextTestRunner(verbosity=2).run(s);sys.exit(not r.wasSuccessful())")
        logfile=output/f'release-{name}.log'
        print(f'Running {name}; log: {logfile}',flush=True)
        with logfile.open('w',encoding='utf-8') as log:
            try:
                p=subprocess.run([sys.executable,'-c',code],cwd=cwd,
                                 env={**os.environ,'PYTHONIOENCODING':'utf-8'},stdout=log,stderr=log,timeout=1200)
                status=p.returncode
            except subprocess.TimeoutExpired:
                status=124;log.write('\nRelease check exceeded 1200 seconds.\n')
        results.append({'suite':name,'exit_code':status,'log':logfile.relative_to(ROOT).as_posix()})
        print(f'{name}: {"PASS" if status==0 else "FAIL"}',flush=True)
    (output/'release-results.json').write_text(json.dumps({'time':datetime.now(timezone.utc).isoformat(),'suites':results},indent=2),encoding='utf-8')
    return int(any(r['exit_code'] for r in results))


if __name__=='__main__':sys.exit(main())
