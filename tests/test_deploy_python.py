import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


@unittest.skipUnless(os.name == 'nt', 'Windows deployment helper')
class DeploymentPythonTests(unittest.TestCase):
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
