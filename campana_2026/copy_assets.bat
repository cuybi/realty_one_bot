@echo off
set ASSETS=c:\Users\etechadmin\.gemini\antigravity\scratch\urubo_v2\campana_2026\assets
set PARENT=c:\Users\etechadmin\.gemini\antigravity\scratch\urubo_v2
set BRAIN1=c:\Users\etechadmin\.gemini\antigravity\brain\7036ee86-b865-4082-8ab4-c5d1dd6a638d
set BRAIN2=c:\Users\etechadmin\.gemini\antigravity\brain\35ee362b-fb15-4db2-8f2a-064c4b310061
set BRAIN3=c:\Users\etechadmin\.gemini\antigravity\brain\273b073b-3506-40bd-bdad-21a45d8b28ea

echo Copying parent assets...
copy "%PARENT%\logo.png" "%ASSETS%\logo.png"
copy "%PARENT%\aerial_urubo.jpg" "%ASSETS%\aerial_urubo.jpg"

echo Copying brain conversation 1 images...
copy "%BRAIN1%\urubo_familia_donut_white_1778178275280.png" "%ASSETS%\urubo_familia_donut_white.png"
copy "%BRAIN1%\urubo_familia_bbq_white_1778178310880.png" "%ASSETS%\urubo_familia_bbq_white.png"
copy "%BRAIN1%\urubo_ninos_jugando_white_final_1778181081384.png" "%ASSETS%\urubo_ninos_jugando_white_final.png"
copy "%BRAIN1%\urubo_strategy_hand_cloud_1778182719897.png" "%ASSETS%\urubo_strategy_hand_cloud.png"
copy "%BRAIN1%\urubo_familia_pool_grill_final_1778183743916.png" "%ASSETS%\urubo_familia_pool_grill_final.png"
copy "%BRAIN1%\urubo_familia_playground_final_1778185057651.png" "%ASSETS%\urubo_familia_playground_final.png"

echo Copying brain conversation 2 images...
copy "%BRAIN2%\urubo_entrance_final_text_1778186924524.png" "%ASSETS%\urubo_entrance_final_text.png"
copy "%BRAIN2%\urubo_family_pool_luxury_1778188014188.png" "%ASSETS%\urubo_family_pool_luxury.png"
copy "%BRAIN2%\urubo_lifestyle_park_running_1778189125137.png" "%ASSETS%\urubo_lifestyle_park_running.png"
copy "%BRAIN2%\urubo_bolivia_independence_day_1778189345162.png" "%ASSETS%\urubo_bolivia_independence_day.png"
copy "%BRAIN2%\urubo_family_palm_park_sunset_1778190459802.png" "%ASSETS%\urubo_family_palm_park_sunset.png"
copy "%BRAIN2%\urubo_father_kids_playing_livingroom_1778190687907.png" "%ASSETS%\urubo_father_kids_playing_livingroom.png"
copy "%BRAIN2%\urubo_couple_luxury_pool_lifestyle_1778190968945.png" "%ASSETS%\urubo_couple_luxury_pool_lifestyle.png"

echo Copying brain conversation 3 images...
copy "%BRAIN3%\urubo_christmas_clubhouse_houses_1778251073377.png" "%ASSETS%\urubo_christmas_clubhouse_houses.png"
copy "%BRAIN3%\urubo_january_2027_new_beginnings_1778251612441.png" "%ASSETS%\urubo_january_2027_new_beginnings.png"
copy "%BRAIN3%\urubo_february_2027_romance_1778252189462.png" "%ASSETS%\urubo_february_2027_romance.png"
copy "%BRAIN3%\urubo_march_2027_family_1778252211775.png" "%ASSETS%\urubo_march_2027_family.png"
copy "%BRAIN3%\urubo_april_2027_nature_1778252241963.png" "%ASSETS%\urubo_april_2027_nature.png"
copy "%BRAIN3%\urubo_may_2027_mother_1778252265478.png" "%ASSETS%\urubo_may_2027_mother.png"
copy "%BRAIN3%\urubo_june_2027_community_1778252296276.png" "%ASSETS%\urubo_june_2027_community.png"
copy "%BRAIN3%\urubo_final_closing_zen_1778253187350.png" "%ASSETS%\urubo_final_closing_zen.png"

echo.
echo All assets copied successfully!
echo Total files in assets:
dir /b "%ASSETS%" | find /c /v ""
pause
