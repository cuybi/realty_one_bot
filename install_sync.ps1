$ErrorActionPreference = 'Stop'
$src = "C:\Users\etechadmin\Desktop\Antigravity_backup\Antigravity_backup"
$skillsDest = "C:\Users\etechadmin\.gemini\config\skills"
$archiveDest = "C:\Users\etechadmin\.gemini\skills-archive"
$mcpServersDest = "C:\Users\etechadmin\.gemini\mcp-servers"

Write-Host "Creating destination directories..."
New-Item -ItemType Directory -Force -Path $skillsDest | Out-Null
New-Item -ItemType Directory -Force -Path $archiveDest | Out-Null
New-Item -ItemType Directory -Force -Path $mcpServersDest | Out-Null

Write-Host "Copying active skills..."
Copy-Item -Path "$src\skills\*" -Destination $skillsDest -Recurse -Force
Write-Host "Active skills copied successfully."

Write-Host "Copying mcp-servers..."
Copy-Item -Path "$src\mcp\mcp-servers\*" -Destination $mcpServersDest -Recurse -Force
Write-Host "mcp-servers copied successfully."

Write-Host "Copying skills-archive..."
Copy-Item -Path "$src\skills-archive\*" -Destination $archiveDest -Recurse -Force
Write-Host "skills-archive copied successfully."
