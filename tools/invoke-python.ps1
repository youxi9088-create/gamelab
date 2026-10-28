function Invoke-DeploymentPython([string]$Executable,[string]$Script,[string[]]$Arguments=@(),[int]$TimeoutMilliseconds=180000) {
    # Use the child process's exit status, not the caller's ambient LASTEXITCODE.
    # Drain both pipes before waiting so diagnostic output cannot block deployment.
    $quoted=@('-X','utf8','-')+$Arguments | ForEach-Object {
        '"'+[regex]::Replace([regex]::Replace($_,'(\\*)"','$1$1\"'),'(\\+)$','$1$1')+'"'
    }
    $info=New-Object System.Diagnostics.ProcessStartInfo
    $info.FileName=$Executable
    $info.Arguments=$quoted -join ' '
    $info.UseShellExecute=$false
    $info.CreateNoWindow=$true
    $info.RedirectStandardInput=$true
    $info.RedirectStandardOutput=$true
    $info.RedirectStandardError=$true
    $info.StandardOutputEncoding=New-Object System.Text.UTF8Encoding($false)
    $info.StandardErrorEncoding=New-Object System.Text.UTF8Encoding($false)
    $info.EnvironmentVariables['PYTHONIOENCODING']='utf-8'
    $process=New-Object System.Diagnostics.Process
    $process.StartInfo=$info
    try {
        if(-not $process.Start()){throw 'Python deployment process did not start'}
        $stdout=$process.StandardOutput.ReadToEndAsync()
        $stderr=$process.StandardError.ReadToEndAsync()
        $bytes=[Text.Encoding]::UTF8.GetBytes($Script)
        $process.StandardInput.BaseStream.Write($bytes,0,$bytes.Length)
        $process.StandardInput.Close()
        if(-not $process.WaitForExit($TimeoutMilliseconds)){$process.Kill();throw 'Python deployment step timed out'}
        $output=$stdout.GetAwaiter().GetResult()
        $errorText=$stderr.GetAwaiter().GetResult()
        if($process.ExitCode -ne 0){throw ('Python deployment step failed (exit '+$process.ExitCode+'): '+$errorText)}
        if($output){Write-Output $output.TrimEnd()}
    } finally {$process.Dispose()}
}
