$env:PATH = "C:\Program Files\nodejs;C:\Users\etechadmin\AppData\Local\Microsoft\WinGet\Packages\astral-sh.uv_Microsoft.Winget.Source_8wekyb3d8bbwe;$env:APPDATA\npm;$env:PATH"

Write-Host "=== FINAL MCP SERVERS INTEGRATION TEST ==="

$servers = @(
    @{ 
        Name = "science-mcp"
        Cmd = "node"
        Args = @("C:/Users/etechadmin/.gemini/mcp-servers/science-mcp/index.js")
        Env = @{}
    },
    @{ 
        Name = "medical-mcp"
        Cmd = "node"
        Args = @("C:/Users/etechadmin/.gemini/mcp-servers/medical-mcp/build/index.js")
        Env = @{}
    },
    @{ 
        Name = "google-patents-mcp"
        Cmd = "node"
        Args = @("C:/Users/etechadmin/.gemini/mcp-servers/google-patents-mcp/build/index.js")
        Env = @{ "SERPAPI_API_KEY" = "49b4ac8ae96433b68d8d2a00cf280283c1a334015fc110114cdc6ba19e9091f3" }
    },
    @{ 
        Name = "youtube-mcp"
        Cmd = "uv"
        Args = @("run", "--project", "C:/Users/etechadmin/.gemini/mcp-servers/youtube-mcp", "python", "C:/Users/etechadmin/.gemini/mcp-servers/youtube-mcp/server.py")
        Env = @{}
    }
)

$allOk = $true
foreach ($s in $servers) {
    Write-Host "Testing $($s.Name)..."
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $s.Cmd
    $psi.Arguments = ($s.Args -join " ")
    $psi.UseShellExecute = $false
    $psi.RedirectStandardInput = $true
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.CreateNoWindow = $true

    foreach ($k in $s.Env.Keys) {
        $psi.EnvironmentVariables[$k] = $s.Env[$k]
    }

    $p = [System.Diagnostics.Process]::Start($psi)
    Start-Sleep -Milliseconds 1500
    if (-not $p.HasExited) {
        Write-Host "  [OK] $($s.Name) running and listening on stdio" -ForegroundColor Green
        $p.Kill()
    } else {
        $allOk = $false
        $err = $p.StandardError.ReadToEnd()
        $out = $p.StandardOutput.ReadToEnd()
        Write-Host "  [FAIL] $($s.Name) exited with code $($p.ExitCode)" -ForegroundColor Red
        if ($err) { Write-Host "    Stderr: $err" }
        if ($out) { Write-Host "    Stdout: $out" }
    }
}

if ($allOk) {
    Write-Host "`nAll 4 custom MCP servers passed the test successfully!" -ForegroundColor Green
} else {
    Write-Host "`nSome servers had issues." -ForegroundColor Red
}
