$mcp = Get-Content "C:\Users\etechadmin\.gemini\config\mcp_config.json" -Raw | ConvertFrom-Json
$activeSkills = (Get-ChildItem "C:\Users\etechadmin\.gemini\config\skills" -Directory).Count
$archiveItems = (Get-ChildItem "C:\Users\etechadmin\.gemini\skills-archive" -Directory).Count
$serverKeys = ($mcp.mcpServers.PSObject.Properties | Select-Object -ExpandProperty Name)

Write-Host "================ RESUMEN DE INSTALACION ================"
Write-Host "Skills Activas instaladas: $activeSkills"
Write-Host "Skills Archivadas: $archiveItems"
Write-Host "Total Servidores MCP configurados: $($serverKeys.Count)"
Write-Host "Servidores MCP:"
$serverKeys | ForEach-Object { Write-Host " - $_" }
Write-Host "========================================================"
