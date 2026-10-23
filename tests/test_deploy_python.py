import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


@unittest.skipUnless(os.name == 'nt', 'Windows deployment helper')
class DeploymentPythonTests(unittest.TestCase):
    def test_runtime_read_includes_hidden_protected_files_and_does_not_follow_junctions(self):
        helper=Path(__file__).resolve().parents[1]/'tools/grant-runtime-read.ps1'
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)/'runtime';hidden=root/'.pnpm';hidden.mkdir(parents=True)
            package=hidden/'package.json';package.write_text('{}')
            outside=Path(folder)/'outside';outside.mkdir();(outside/'private.txt').write_text('fixture')
            script=Path(folder)/'fixture.ps1'
            q=lambda s:"'"+str(s).replace("'","''")+"'"
            script.write_text(f'''
$ErrorActionPreference='Stop'
Import-Module "$PSHOME/Modules/Microsoft.PowerShell.Security/Microsoft.PowerShell.Security.psd1" -ErrorAction Stop
. {q(helper)}
$p={q(package)}
$a=Get-Acl -LiteralPath $p
$a.SetAccessRuleProtection($true,$true)
Set-Acl -LiteralPath $p -AclObject $a
(Get-Item -LiteralPath {q(hidden)} -Force).Attributes += [IO.FileAttributes]::Hidden
$outsideBefore=(Get-Acl -LiteralPath {q(outside/'private.txt')}).Sddl
New-Item -ItemType Junction -Path {q(root/'alias')} -Target {q(outside)} | Out-Null
try {{
 $count=Grant-RuntimeRead {q(root)}
 if($count -ne 3){{throw 'Hidden files not traversed or junction followed'}}
 $sid=New-Object System.Security.Principal.SecurityIdentifier('S-1-5-19')
 $rules=(Get-Acl -LiteralPath $p).GetAccessRules($true,$true,[System.Security.Principal.SecurityIdentifier])
 if(-not($rules | Where-Object {{$_.IdentityReference -eq $sid -and $_.FileSystemRights -band [System.Security.AccessControl.FileSystemRights]::ReadData}})){{throw 'Missing service read permission'}}
 if((Get-Acl -LiteralPath {q(outside/'private.txt')}).Sddl -ne $outsideBefore){{throw 'Changed external ACL'}}
}} finally {{[IO.Directory]::Delete({q(root/'alias')})}}
''',encoding='utf-8-sig')
            result=subprocess.run(['powershell','-NoProfile','-ExecutionPolicy','Bypass','-File',str(script)],capture_output=True,timeout=30)
            self.assertEqual(result.returncode,0,result.stderr.decode(errors='replace'))

    def test_exit_status_unicode_arguments_and_large_stderr(self):
        helper = Path(__file__).resolve().parents[1] / 'tools/invoke-python.ps1'
        with tempfile.TemporaryDirectory() as folder:
            script = Path(folder) / 'fixture.ps1'
            q = lambda s: "'" + str(s).replace("'", "''") + "'"
            script.write_text(f'''. {q(helper)}
$ErrorActionPreference='Stop'
$LASTEXITCODE=47
$result=Invoke-DeploymentPython {q(sys.executable)} 'import json,sys; print(json.dumps(sys.argv[1:],ensure_ascii=False))' @('测试 有空格','quote"inside','trailing\')
Write-Output $result
$values=$result | ConvertFrom-Json
if($values.Count -ne 3 -or $values[0] -cne '测试 有空格' -or $values[1] -cne 'quote"inside' -or $values[2] -cne 'trailing\'){{throw 'Argument encoding changed'}}
try {{
 Invoke-DeploymentPython {q(sys.executable)} 'import sys; sys.stderr.write("x"*100000+"fixture failure"); sys.exit(23)'
 throw 'Expected failure was ignored'
}} catch {{
 if($_.Exception.Message -notmatch 'exit 23' -or $_.Exception.Message -notmatch 'fixture failure'){{throw}}
 Write-Output 'failure correctly captured'
}}
''', encoding='utf-8-sig')
            result = subprocess.run(['powershell', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', str(script)], capture_output=True, timeout=30)
            self.assertEqual(result.returncode, 0, result.stderr.decode(errors='replace'))
            self.assertIn(b'failure correctly captured', result.stdout)


if __name__ == '__main__':
    unittest.main()
