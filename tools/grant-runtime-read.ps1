function Grant-RuntimeRead([string]$Path) {
    # pnpm's hidden .pnpm store and protected file ACLs need explicit traversal.
    # Never follow junctions into another runtime or outside the supplied tree.
    $runtimeReadRoot = [IO.Path]::GetFullPath($Path).TrimEnd('\')
    $rootItem = Get-Item -LiteralPath $runtimeReadRoot -Force -ErrorAction Stop
    if (-not $rootItem.PSIsContainer -or ($rootItem.Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw 'Runtime root must be a real directory' }
    $sid = New-Object System.Security.Principal.SecurityIdentifier('S-1-5-19')
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule($sid,'ReadAndExecute','Allow')
    $pending = New-Object 'System.Collections.Generic.Stack[string]'
    $pending.Push($runtimeReadRoot)
    $count = 0
    while ($pending.Count) {
        $current = $pending.Pop()
        if ($current -ne $runtimeReadRoot -and -not $current.StartsWith($runtimeReadRoot+'\',[StringComparison]::OrdinalIgnoreCase)) { throw 'Unsafe runtime ACL path' }
        $item = Get-Item -LiteralPath $current -Force -ErrorAction Stop
        if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { continue }
        $acl = Get-Acl -LiteralPath $current -ErrorAction Stop
        $acl.AddAccessRule($rule)
        Set-Acl -LiteralPath $current -AclObject $acl -ErrorAction Stop
        $count++
        if ($item.PSIsContainer) {
            foreach ($child in Get-ChildItem -LiteralPath $current -Force -ErrorAction Stop) { $pending.Push($child.FullName) }
        }
    }
    return $count
}
