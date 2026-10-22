$env:PATH = "C:\Program Files\nodejs;C:\Users\etechadmin\AppData\Local\Microsoft\WinGet\Packages\astral-sh.uv_Microsoft.Winget.Source_8wekyb3d8bbwe;$env:APPDATA\npm;$env:PATH"

Write-Host "=== Testing youtube-mcp with explicit python path ==="

$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "uv"
$psi.Arguments = "run --project C:/Users/etechadmin/.gemini/mcp-servers/youtube-mcp python C:/Users/etechadmin/.gemini/mcp-servers/youtube-mcp/server.py"
$psi.UseShellExecute = $false
$psi.RedirectStandardInput = $true
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.CreateNoWindow = $true

$p = [System.Diagnostics.Process]::Start($psi)
Start-Sleep -Milliseconds 1500
if (-not $p.HasExited) {
    Write-Host "  [OK] youtube-mcp started and listening on stdio" -ForegroundColor Green
    $p.Kill()
} else {
    $err = $p.StandardError.ReadToEnd()
    $out = $p.StandardOutput.ReadToEnd()
    Write-Host "  [FAIL] youtube-mcp exited with code $($p.ExitCode)" -ForegroundColor Red
    if ($err) { Write-Host "    Stderr: $err" }
    if ($out) { Write-Host "    Stdout: $out" }
}
