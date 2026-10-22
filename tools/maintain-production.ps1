param([ValidateSet('monitor','backup')][string]$Action='monitor',[string]$Root='C:\GameLab',[string]$Python='C:\Program Files\Python313\python.exe')
$ErrorActionPreference='Stop'
$shared=Join-Path $Root 'shared'
$tool=Join-Path $Root 'app\tools\production_data.py'
if($Action -eq 'monitor') {
    & $Python $tool monitor --root $shared
    if($LASTEXITCODE -ne 0){throw 'Production monitor failed'}
    exit
}
$lock=[IO.File]::Open((Join-Path $Root 'deploy.lock'),'OpenOrCreate','ReadWrite','None')
$previous='true'
try {
    $previous=@'
import sys,sqlite3,json
from pathlib import Path
with sqlite3.connect(Path(sys.argv[1])/'data/platform.sqlite3') as db:
 db.execute('BEGIN IMMEDIATE')
 old=db.execute("select data from records where kind='settings' and id='maintenance'").fetchone()
 print(json.dumps(bool(old and json.loads(old[0]).get('draining'))))
 row={'id':'maintenance','draining':True}
 db.execute("INSERT INTO records VALUES ('settings','maintenance',?) ON CONFLICT(kind,id) DO UPDATE SET data=excluded.data",(json.dumps(row),))
'@ | & $Python - $shared
    if($LASTEXITCODE -ne 0){throw 'Could not pause new work'}
    $file=Join-Path $Root ('backups\production-'+(Get-Date -Format 'yyyyMMdd-HHmmss')+'.zip')
    # A busy system is not interrupted. Next schedule retries; monitor reports stale backups.
    & $Python $tool backup --root $shared --file $file
    if($LASTEXITCODE -ne 0){throw 'Backup deferred or failed; inspect task output and monitor'}
} finally {
    @'
import sys,sqlite3,json
from pathlib import Path
with sqlite3.connect(Path(sys.argv[1])/'data/platform.sqlite3') as db:
 db.execute("UPDATE records SET data=? WHERE kind='settings' AND id='maintenance'",(json.dumps({'id':'maintenance','draining':json.loads(sys.argv[2])}),))
'@ | & $Python - $shared ([string]$previous).Trim()
    $lock.Dispose()
}
