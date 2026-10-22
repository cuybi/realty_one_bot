$ErrorActionPreference = 'Continue'
$env:PATH = "C:\Program Files\nodejs;C:\Users\etechadmin\AppData\Local\Microsoft\WinGet\Packages\astral-sh.uv_Microsoft.Winget.Source_8wekyb3d8bbwe;$env:APPDATA\npm;$env:PATH"

$serversDir = "C:\Users\etechadmin\.gemini\mcp-servers"

# 1. science-mcp
Write-Host "=== Setting up science-mcp ==="
Set-Location "$serversDir\science-mcp"
npm.cmd install --no-audit --no-fund

# 2. medical-mcp
Write-Host "=== Setting up medical-mcp ==="
Set-Location "$serversDir\medical-mcp"
npm.cmd install --no-audit --no-fund
npm.cmd run build

# 3. google-patents-mcp
Write-Host "=== Setting up google-patents-mcp ==="
Set-Location "$serversDir\google-patents-mcp"
npm.cmd install --no-audit --no-fund
if (Test-Path "tsconfig.json") {
    npm.cmd run build
}

# 4. youtube-mcp
Write-Host "=== Setting up youtube-mcp ==="
Set-Location "$serversDir\youtube-mcp"
uv sync

Write-Host "=== Setup completed for all custom servers ==="
