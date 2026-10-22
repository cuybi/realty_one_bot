Add-Type -AssemblyName System.Windows.Forms

$ASSETS = "c:\Users\etechadmin\.gemini\antigravity\scratch\urubo_v2\campana_2026\assets"
$PARENT = "c:\Users\etechadmin\.gemini\antigravity\scratch\urubo_v2"
$BRAIN1 = "c:\Users\etechadmin\.gemini\antigravity\brain\7036ee86-b865-4082-8ab4-c5d1dd6a638d"
$BRAIN2 = "c:\Users\etechadmin\.gemini\antigravity\brain\35ee362b-fb15-4db2-8f2a-064c4b310061"
$BRAIN3 = "c:\Users\etechadmin\.gemini\antigravity\brain\273b073b-3506-40bd-bdad-21a45d8b28ea"

$files = @(
    @{src="$PARENT\logo.png"; dst="$ASSETS\logo.png"},
    @{src="$PARENT\aerial_urubo.jpg"; dst="$ASSETS\aerial_urubo.jpg"},
    @{src="$BRAIN1\urubo_familia_donut_white_1778178275280.png"; dst="$ASSETS\urubo_familia_donut_white.png"},
    @{src="$BRAIN1\urubo_familia_bbq_white_1778178310880.png"; dst="$ASSETS\urubo_familia_bbq_white.png"},
    @{src="$BRAIN1\urubo_ninos_jugando_white_final_1778181081384.png"; dst="$ASSETS\urubo_ninos_jugando_white_final.png"},
    @{src="$BRAIN1\urubo_strategy_hand_cloud_1778182719897.png"; dst="$ASSETS\urubo_strategy_hand_cloud.png"},
    @{src="$BRAIN1\urubo_familia_pool_grill_final_1778183743916.png"; dst="$ASSETS\urubo_familia_pool_grill_final.png"},
    @{src="$BRAIN1\urubo_familia_playground_final_1778185057651.png"; dst="$ASSETS\urubo_familia_playground_final.png"},
    @{src="$BRAIN2\urubo_entrance_final_text_1778186924524.png"; dst="$ASSETS\urubo_entrance_final_text.png"},
    @{src="$BRAIN2\urubo_family_pool_luxury_1778188014188.png"; dst="$ASSETS\urubo_family_pool_luxury.png"},
    @{src="$BRAIN2\urubo_lifestyle_park_running_1778189125137.png"; dst="$ASSETS\urubo_lifestyle_park_running.png"},
    @{src="$BRAIN2\urubo_bolivia_independence_day_1778189345162.png"; dst="$ASSETS\urubo_bolivia_independence_day.png"},
    @{src="$BRAIN2\urubo_family_palm_park_sunset_1778190459802.png"; dst="$ASSETS\urubo_family_palm_park_sunset.png"},
    @{src="$BRAIN2\urubo_father_kids_playing_livingroom_1778190687907.png"; dst="$ASSETS\urubo_father_kids_playing_livingroom.png"},
    @{src="$BRAIN2\urubo_couple_luxury_pool_lifestyle_1778190968945.png"; dst="$ASSETS\urubo_couple_luxury_pool_lifestyle.png"},
    @{src="$BRAIN3\urubo_christmas_clubhouse_houses_1778251073377.png"; dst="$ASSETS\urubo_christmas_clubhouse_houses.png"},
    @{src="$BRAIN3\urubo_january_2027_new_beginnings_1778251612441.png"; dst="$ASSETS\urubo_january_2027_new_beginnings.png"},
    @{src="$BRAIN3\urubo_february_2027_romance_1778252189462.png"; dst="$ASSETS\urubo_february_2027_romance.png"},
    @{src="$BRAIN3\urubo_march_2027_family_1778252211775.png"; dst="$ASSETS\urubo_march_2027_family.png"},
    @{src="$BRAIN3\urubo_april_2027_nature_1778252241963.png"; dst="$ASSETS\urubo_april_2027_nature.png"},
    @{src="$BRAIN3\urubo_may_2027_mother_1778252265478.png"; dst="$ASSETS\urubo_may_2027_mother.png"},
    @{src="$BRAIN3\urubo_june_2027_community_1778252296276.png"; dst="$ASSETS\urubo_june_2027_community.png"},
    @{src="$BRAIN3\urubo_final_closing_zen_1778253187350.png"; dst="$ASSETS\urubo_final_closing_zen.png"}
)

$ok = 0; $fail = 0
foreach ($f in $files) {
    if (Test-Path $f.src) {
        Copy-Item $f.src $f.dst -Force
        Write-Host "OK: $(Split-Path $f.dst -Leaf)" -ForegroundColor Green
        $ok++
    } else {
        Write-Host "NO ENCONTRADO: $($f.src)" -ForegroundColor Red
        $fail++
    }
}

Write-Host "`n=== RESULTADO: $ok copiados, $fail fallidos ===" -ForegroundColor Cyan
$total = (Get-ChildItem $ASSETS).Count
Write-Host "Total archivos en assets: $total" -ForegroundColor Cyan

[System.Windows.Forms.MessageBox]::Show("Listo! $ok imagenes copiadas a assets/. Refresca tu navegador (F5).", "Copia Completada", "OK", "Information")
