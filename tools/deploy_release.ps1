param(
    [Parameter(Mandatory=$true)][string]$Package,
    [string]$Root = 'C:\GameLab',
    [string]$Python = 'C:\Program Files\Python313\python.exe'
)
$ErrorActionPreference='Stop'
$Root=[IO.Path]::GetFullPath($Root)
$shared=Join-Path $Root 'shared'
$app=Join-Path $Root 'app'
$releases=Join-Path $Root 'releases'
$runtime=Join-Path $Root 'runtime'
$lockPath=Join-Path $Root 'deploy.lock'
$lock=[IO.File]::Open($lockPath,'OpenOrCreate','ReadWrite','None')
$oldTarget=$null
$stopped=$false
function CheckedPython([string]$Script,[string[]]$Arguments=@()) {
    $Script | & $Python - @Arguments
    if($LASTEXITCODE -ne 0){throw 'Python deployment step failed'}
}
function Stop-Platform {
    Stop-ScheduledTask -TaskName GameLabPlatform -ErrorAction Stop
    foreach($port in @(8765,8766)) {
        $listener=Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        if($listener){
            $process=Get-CimInstance Win32_Process -Filter "ProcessId=$($listener[0].OwningProcess)"
            if($process.CommandLine -notlike '*GameLab*server.py*'){throw 'Unexpected listener; refusing to stop'}
            Stop-Process -Id $process.ProcessId -Force
        }
    }
}
function Link-Directory([string]$Link,[string]$Target) {
    New-Item -ItemType Directory -Path (Split-Path $Link) -Force | Out-Null
    New-Item -ItemType Junction -Path $Link -Target $Target | Out-Null
}
try {
    New-Item -ItemType Directory -Path $shared,$releases,$runtime -Force | Out-Null
    $prepared=CheckedPython @'
import sys,zipfile,json,hashlib,re
from pathlib import Path
package,root=Path(sys.argv[1]),Path(sys.argv[2])
with zipfile.ZipFile(package) as z:
 m=json.loads(z.read('RELEASE_MANIFEST.json'));commit=m['commit']
 assert re.fullmatch('[a-f0-9]{40}',commit)
 assert len(z.namelist())==len(m['files'])+1
 target=root/'releases'/commit
 if target.exists():raise ValueError('Release already exists; use rollback to select it')
 for name,digest in m['files'].items():
  p=Path(name)
  assert not p.is_absolute() and '..' not in p.parts and ':' not in name and '\\' not in name
  assert not name.startswith(('data/','game-library/','executors/runs/','executors/node_modules/'))
  assert hashlib.sha256(z.read(name)).hexdigest()==digest
 target.mkdir()
 for name in m['files']:
  out=target/name;out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(z.read(name))
 (target/'RELEASE_MANIFEST.json').write_text(json.dumps(m),'utf-8')
 print(str(target))
'@ @($Package,$Root)
    $target=([string]$prepared).Trim()
    $oldTarget=(Get-Item -LiteralPath $app).FullName
    if((Get-Item -LiteralPath $app).LinkType){$oldTarget=(Get-Item -LiteralPath $app).Target[0]}
    CheckedPython @'
import sys,sqlite3,json
from pathlib import Path
p=Path(sys.argv[1])/'data/platform.sqlite3'
with sqlite3.connect(p,timeout=30) as db:
 db.execute('BEGIN IMMEDIATE')
 rows=[(k,json.loads(v)) for k,v in db.execute('SELECT kind,data FROM records')]
 assert not any(k=='jobs' and r.get('status')=='running' for k,r in rows),'An active conversion must finish before deployment'
 assert not any(k=='discovery_runs' and r.get('status')=='running' for k,r in rows),'Source discovery is still running'
 value={'id':'maintenance','draining':True}
 db.execute("INSERT INTO records VALUES ('settings','maintenance',?) ON CONFLICT(kind,id) DO UPDATE SET data=excluded.data",(json.dumps(value),))
'@ @($app)
    Stop-Platform
    $stopped=$true
    # Move only explicitly named directories within this deployment root.
    $moves=@(@('data','data'),@('game-library','game-library'),@('executors\runs','runs'))
    foreach($pair in $moves){
        $from=[IO.Path]::GetFullPath((Join-Path $app $pair[0]));$to=Join-Path $shared $pair[1]
        if(-not $from.StartsWith($Root+'\',[StringComparison]::OrdinalIgnoreCase)){throw 'Unsafe migration path'}
        if(-not(Test-Path -LiteralPath $to)){
            if(Test-Path -LiteralPath $from){Move-Item -LiteralPath $from -Destination $to}else{New-Item -ItemType Directory -Path $to | Out-Null}
        }
        if(-not(Test-Path -LiteralPath $from)){Link-Directory $from $to}
    }
    foreach($name in @('node_modules','.tools')){
        $from=Join-Path $app ('executors\'+$name);$to=Join-Path $runtime $name
        if(-not(Test-Path -LiteralPath $to) -and (Test-Path -LiteralPath $from)){Move-Item -LiteralPath $from -Destination $to;Link-Directory $from $to}
    }
    New-Item -ItemType Directory -Path (Join-Path $shared 'config'),(Join-Path $shared 'logs'),(Join-Path $shared 'converter-data') -Force | Out-Null
    $deploymentConfig=Join-Path $shared 'config\deployment.json'
    if(-not(Test-Path -LiteralPath $deploymentConfig)){
        @{python=$Python;node='C:\Program Files\nodejs\node.exe';git=(Join-Path $Root 'git-portable\cmd\git.exe');browsers=(Join-Path $Root 'playwright-browsers')} | ConvertTo-Json | Set-Content -LiteralPath $deploymentConfig -Encoding UTF8
    }
    $secret=Join-Path $shared 'config\portal-secrets.ps1'
    if(-not(Test-Path -LiteralPath $secret)){Copy-Item -LiteralPath C:\ProgramData\GameLab\portal-secrets.ps1 -Destination $secret}
    . $secret
    $configValue=Get-Content -LiteralPath $deploymentConfig -Raw | ConvertFrom-Json
    $configValue | Add-Member -NotePropertyName public_origin -NotePropertyValue $env:PORTAL_PUBLIC_ORIGIN -Force
    $configValue | ConvertTo-Json | Set-Content -LiteralPath $deploymentConfig -Encoding UTF8
    if(Test-Path (Join-Path $Root 'Caddyfile')){Copy-Item -LiteralPath (Join-Path $Root 'Caddyfile') -Destination (Join-Path $shared 'config\Caddyfile') -Force}
    foreach($task in @('GameLabPlatform','GameLabReverseProxy','GameLabCertificateRenewal')){Export-ScheduledTask -TaskName $task | Set-Content -LiteralPath (Join-Path $shared ('config\'+$task+'.xml')) -Encoding UTF8}
    foreach($name in @('run-proxy.ps1','renew-ip-cert.ps1')){if(Test-Path (Join-Path $Root $name)){Copy-Item -LiteralPath (Join-Path $Root $name) -Destination (Join-Path $shared ('config\'+$name)) -Force}}
    $certs=Join-Path $Root 'certs';$sharedCerts=Join-Path $shared 'certs'
    if((Test-Path -LiteralPath $certs) -and -not(Test-Path -LiteralPath $sharedCerts)){
        if(-not ([IO.Path]::GetFullPath($certs)).StartsWith($Root+'\',[StringComparison]::OrdinalIgnoreCase)){throw 'Unsafe certificate path'}
        Move-Item -LiteralPath $certs -Destination $sharedCerts
        Link-Directory $certs $sharedCerts
    }
    $oldLogs=Join-Path $Root 'logs'
    if(Test-Path -LiteralPath $oldLogs){Copy-Item -LiteralPath $oldLogs -Destination (Join-Path $shared 'logs\legacy') -Recurse -Force}
    foreach($pair in $moves){Link-Directory (Join-Path $target $pair[0]) (Join-Path $shared $pair[1])}
    foreach($name in @('node_modules','.tools')){if(Test-Path (Join-Path $runtime $name)){Link-Directory (Join-Path $target ('executors\'+$name)) (Join-Path $runtime $name)}}
    # Same locked dependencies are required for this release; changed locks fail before switching.
    if((Get-FileHash (Join-Path $oldTarget 'executors\pnpm-lock.yaml')).Hash -ne (Get-FileHash (Join-Path $target 'executors\pnpm-lock.yaml')).Hash){throw 'Dependency lock changed; install release dependencies before deployment'}
    $backupFile=Join-Path $Root ('backups\production-'+(Get-Date -Format 'yyyyMMdd-HHmmss')+'.zip')
    & $Python (Join-Path $target 'tools\production_data.py') backup --root $shared --file $backupFile
    if($LASTEXITCODE -ne 0){throw 'Production backup failed'}
    # Grant the established service identity access to this release and shared data.
    & icacls $target /grant '*S-1-5-19:(OI)(CI)RX' /T /Q | Out-Null
    if($LASTEXITCODE -ne 0){throw 'Release ACL failed'}
    & icacls $shared /grant '*S-1-5-19:(OI)(CI)M' /T /Q | Out-Null
    if($LASTEXITCODE -ne 0){throw 'Shared ACL failed'}
    if((Get-Item -LiteralPath $app).LinkType){[IO.Directory]::Delete($app)}
    else {
        $legacy=Join-Path $releases ('legacy-'+(Get-Date -Format 'yyyyMMdd-HHmmss'))
        if(-not $legacy.StartsWith($Root+'\',[StringComparison]::OrdinalIgnoreCase)){throw 'Unsafe legacy path'}
        Move-Item -LiteralPath $app -Destination $legacy;$oldTarget=$legacy
    }
    Link-Directory $app $target
    Copy-Item -LiteralPath (Join-Path $target 'tools\run-platform.ps1') -Destination (Join-Path $Root 'run-platform.ps1') -Force
    Start-ScheduledTask -TaskName GameLabPlatform
    $healthy=$false
    for($i=0;$i -lt 20;$i++){
        Start-Sleep -Seconds 2
        try{if((Invoke-RestMethod http://127.0.0.1:8765/health).ok -and (Invoke-RestMethod http://127.0.0.1:8766/health).ok){$healthy=$true;break}}catch{}
    }
    if(-not $healthy){throw 'New release health check failed'}
    CheckedPython @'
import sys,json,sqlite3,datetime
from pathlib import Path
root,target,previous=map(Path,sys.argv[1:])
manifest=json.loads((target/'RELEASE_MANIFEST.json').read_text())
record={'commit':manifest['commit'],'deployed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'path':str(target),'previous':str(previous)}
(root/'release.json').write_text(json.dumps(record,indent=2),'utf-8')
with (root/'releases.jsonl').open('a') as f:f.write(json.dumps(record)+'\n')
with sqlite3.connect(root/'data/platform.sqlite3') as db:
 db.execute("UPDATE records SET data=? WHERE kind='settings' AND id='maintenance'",(json.dumps({'id':'maintenance','draining':False}),))
print('release',record['commit'])
'@ @($shared,$target,$oldTarget)
    $stopped=$false
} catch {
    if($stopped){
        Stop-Platform
        if($oldTarget -and (Test-Path -LiteralPath $oldTarget)){
            if((Test-Path -LiteralPath $app) -and (Get-Item -LiteralPath $app).LinkType){[IO.Directory]::Delete($app)}
            if(-not(Test-Path -LiteralPath $app)){Link-Directory $app $oldTarget}
        }
        Start-ScheduledTask -TaskName GameLabPlatform
    }
    throw
} finally {$lock.Dispose()}
