$skills = Get-ChildItem "C:\Users\etechadmin\.gemini\config\skills" -Directory | Select-Object -ExpandProperty Name | Sort-Object
$skills | ForEach-Object { Write-Host $_ }
