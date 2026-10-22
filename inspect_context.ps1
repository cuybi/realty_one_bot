$activeSkills = Get-ChildItem "C:\Users\etechadmin\.gemini\config\skills" -Directory
$archivedSkills = Get-ChildItem "C:\Users\etechadmin\.gemini\skills-archive" -Directory
$plugins = Get-ChildItem "C:\Users\etechadmin\.gemini\config\plugins" -Directory

Write-Host "Total active skills in ~/.gemini/config/skills: $($activeSkills.Count)"
Write-Host "Total archived skills in ~/.gemini/skills-archive: $($archivedSkills.Count)"
Write-Host "Total plugins in ~/.gemini/config/plugins: $($plugins.Count)"

$pluginSkillsCount = 0
foreach ($p in $plugins) {
    $pSkills = Get-ChildItem (Join-Path $p.FullName "skills") -Directory -ErrorAction SilentlyContinue
    $c = if ($pSkills) { $pSkills.Count } else { 0 }
    $pluginSkillsCount += $c
    Write-Host " - Plugin $($p.Name): $c skills"
}

Write-Host "Total skills exposed from plugins: $pluginSkillsCount"
Write-Host "GRAND TOTAL SKILLS LOADED INTO AGY PROMPT: $($activeSkills.Count + $pluginSkillsCount)"

# Calculate approximate text size of descriptions
$totalDescChars = 0
foreach ($s in $activeSkills) {
    $skillMd = Join-Path $s.FullName "SKILL.md"
    if (Test-Path $skillMd) {
        $content = Get-Content $skillMd -Raw
        $totalDescChars += $content.Length
    }
}
Write-Host "Total bytes in active SKILL.md files: $totalDescChars"
