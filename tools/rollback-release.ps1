param([string]$Root='C:\GameLab',[string]$Python='C:\Program Files\Python313\python.exe')
$ErrorActionPreference='Stop'
$rootPath=[IO.Path]::GetFullPath($Root)
$shared=Join-Path $rootPath 'shared'
$record=Get-Content (Join-Path $shared 'release.json') -Raw | ConvertFrom-Json
$previous=[IO.Path]::GetFullPath($record.previous)
if(-not $previous.StartsWith((Join-Path $rootPath 'releases')+'\',[StringComparison]::OrdinalIgnoreCase) -or -not(Test-Path (Join-Path $previous 'server.py'))){throw 'Invalid rollback target'}
$lock=[IO.File]::Open((Join-Path $rootPath 'deploy.lock'),'OpenOrCreate','ReadWrite','None')
try {
    @'
import sys,json,sqlite3
from pathlib import Path
with sqlite3.connect(Path(sys.argv[1])/'data/platform.sqlite3') as db:
 db.execute('BEGIN IMMEDIATE')
 assert not any(json.loads(r[0]).get('status')=='running' for r in db.execute("select data from records where kind='jobs'")),'Active conversion'
 db.execute("UPDATE records SET data=? WHERE kind='settings' AND id='maintenance'",(json.dumps({'id':'maintenance','draining':True}),))
'@ | & $Python - $shared
    if($LASTEXITCODE -ne 0){throw 'Rollback refused while busy'}
    Stop-ScheduledTask -TaskName GameLabPlatform
    foreach($port in @(8765,8766)){
        $listener=Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        if($listener){$process=Get-CimInstance Win32_Process -Filter "ProcessId=$($listener[0].OwningProcess)";if($process.CommandLine -notlike '*GameLab*server.py*'){throw 'Unexpected listener'};Stop-Process -Id $process.ProcessId -Force}
    }
    $app=Join-Path $rootPath 'app'
    if(-not(Get-Item -LiteralPath $app).LinkType){throw 'Active app is not a release link'}
    [IO.Directory]::Delete($app)
    New-Item -ItemType Junction -Path $app -Target $previous | Out-Null
    Start-ScheduledTask -TaskName GameLabPlatform
    $healthy=$false
    for($i=0;$i -lt 20;$i++){Start-Sleep -Seconds 2;try{if((Invoke-RestMethod http://127.0.0.1:8765/health).ok -and (Invoke-RestMethod http://127.0.0.1:8766/health).ok){$healthy=$true;break}}catch{}}
    if(-not $healthy){throw 'Rollback target unhealthy; maintenance stays enabled'}
    @'
import sys,json,sqlite3,datetime
from pathlib import Path
root,previous=map(Path,sys.argv[1:]);old=json.loads((root/'release.json').read_text())
manifest=previous/'RELEASE_MANIFEST.json'
record={'commit':json.loads(manifest.read_text())['commit'] if manifest.exists() else 'legacy','path':str(previous),'previous':old['path'],'deployed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'action':'rollback'}
(root/'release.json').write_text(json.dumps(record),'utf-8')
with (root/'releases.jsonl').open('a') as f:f.write(json.dumps(record)+'\n')
with sqlite3.connect(root/'data/platform.sqlite3') as db:db.execute("UPDATE records SET data=? WHERE kind='settings' AND id='maintenance'",(json.dumps({'id':'maintenance','draining':False}),))
'@ | & $Python - $shared $previous
    if($LASTEXITCODE -ne 0){throw 'Rollback metadata failed'}
}finally{$lock.Dispose()}
