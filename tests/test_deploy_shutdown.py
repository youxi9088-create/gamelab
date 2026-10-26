"""Exercise shutdown races without touching tasks, ports or real processes."""
from pathlib import Path
import os
import subprocess
import tempfile
import unittest


@unittest.skipUnless(os.name == 'nt', 'PowerShell deployment is Windows-only')
class ShutdownTests(unittest.TestCase):
    def test_exited_listener_is_ignored_but_unknown_live_process_is_refused(self):
        source=Path(__file__).resolve().parents[1]/'tools/deploy_release.ps1'
        quoted=str(source).replace("'","''")
        script=f"""
$ErrorActionPreference='Stop'
$tokens=$null;$parseErrors=$null
$ast=[Management.Automation.Language.Parser]::ParseFile('{quoted}',[ref]$tokens,[ref]$parseErrors)
if($parseErrors.Count){{throw 'Invalid deployment script'}}
$fn=$ast.Find({{param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst] -and $n.Name -eq 'Stop-Platform'}},$true)
Invoke-Expression $fn.Extent.Text
function Disable-ScheduledTask {{}}
function Stop-ScheduledTask {{}}
function taskkill {{throw 'Must not terminate a process in this fixture'}}
$script:reads=0
function Get-NetTCPConnection {{
 $script:reads++
 if($script:reads -eq 1){{[pscustomobject]@{{OwningProcess=99999}}}}
}}
function Get-CimInstance {{}}
Stop-Platform
function Get-NetTCPConnection {{[pscustomobject]@{{OwningProcess=99999}}}}
$refused=$false
try{{Stop-Platform}}catch{{$refused=$_.Exception.Message -like 'Listener changed*'}}
if(-not $refused){{throw 'Changed listener must be refused'}}
function Get-CimInstance {{[pscustomobject]@{{ProcessId=99999;CommandLine='unrelated service'}}}}
$refused=$false
try{{Stop-Platform}}catch{{$refused=$_.Exception.Message -eq 'Unexpected listener; refusing to stop'}}
if(-not $refused){{throw 'Unknown service must be refused'}}
Write-Output 'PASS'
"""
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)/'fixture.ps1';p.write_text(script,encoding='utf-8-sig')
            result=subprocess.run(['powershell','-NoProfile','-ExecutionPolicy','Bypass','-File',str(p)],capture_output=True,timeout=30)
        self.assertEqual(result.returncode,0,result.stderr.decode(errors='replace'))
        self.assertIn(b'PASS',result.stdout)
