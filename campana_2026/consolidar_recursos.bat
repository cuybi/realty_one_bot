@echo off
echo ======================================================
echo CONSOLIDACION DE RECURSOS - URUBO GREEN PARK
echo ======================================================
echo.
echo Creando carpeta de activos...
if not exist assets mkdir assets

echo.
echo Copiando imagenes base...
copy "..\logo.png" "assets\logo.png" /Y
copy "..\aerial_urubo.jpg" "assets\aerial_urubo.jpg" /Y

echo.
echo Copiando imagenes de slides (Campaña 2026)...

:: Slide 2, 3, 7, 8, 10, 14, 15
copy "..\..\..\brain\7036ee86-b865-4082-8ab4-c5d1dd6a638d\urubo_familia_donut_white_1778178275280.png" "assets\urubo_familia_donut_white_1778178275280.png" /Y
copy "..\..\..\brain\7036ee86-b865-4082-8ab4-c5d1dd6a638d\urubo_familia_bbq_white_1778178310880.png" "assets\urubo_familia_bbq_white_1778178310880.png" /Y
copy "..\..\..\brain\7036ee86-b865-4082-8ab4-c5d1dd6a638d\urubo_ninos_jugando_white_final_1778181081384.png" "assets\urubo_ninos_jugando_white_final_1778181081384.png" /Y
copy "..\..\..\brain\7036ee86-b865-4082-8ab4-c5d1dd6a638d\urubo_strategy_hand_cloud_1778182719897.png" "assets\urubo_strategy_hand_cloud_1778182719897.png" /Y
copy "..\..\..\brain\7036ee86-b865-4082-8ab4-c5d1dd6a638d\urubo_familia_pool_grill_final_1778183743916.png" "assets\urubo_familia_pool_grill_final_1778183743916.png" /Y
copy "..\..\..\brain\7036ee86-b865-4082-8ab4-c5d1dd6a638d\urubo_familia_playground_final_1778185057651.png" "assets\urubo_familia_playground_final_1778185057651.png" /Y
copy "..\..\..\brain\7036ee86-b865-4082-8ab4-c5d1dd6a638d\urubo_entrance_final_text_1778186924524.png" "assets\urubo_entrance_final_text_1778186924524.png" /Y

:: Slides 18-23
copy "..\..\..\brain\35ee362b-fb15-4db2-8f2a-064c4b310061\urubo_family_pool_luxury_1778248037302.png" "assets\urubo_family_pool_luxury_1778248037302.png" /Y
copy "..\..\..\brain\35ee362b-fb15-4db2-8f2a-064c4b310061\urubo_lifestyle_park_running_1778248060851.png" "assets\urubo_lifestyle_park_running_1778248060851.png" /Y
copy "..\..\..\brain\35ee362b-fb15-4db2-8f2a-064c4b310061\urubo_bolivia_independence_day_1778248118029.png" "assets\urubo_bolivia_independence_day_1778248118029.png" /Y
copy "..\..\..\brain\35ee362b-fb15-4db2-8f2a-064c4b310061\urubo_family_palm_park_sunset_1778248141445.png" "assets\urubo_family_palm_park_sunset_1778248141445.png" /Y
copy "..\..\..\brain\35ee362b-fb15-4db2-8f2a-064c4b310061\urubo_father_kids_playing_livingroom_1778248163585.png" "assets\urubo_father_kids_playing_livingroom_1778248163585.png" /Y
copy "..\..\..\brain\35ee362b-fb15-4db2-8f2a-064c4b310061\urubo_couple_luxury_pool_lifestyle_1778248187834.png" "assets\urubo_couple_luxury_pool_lifestyle_1778248187834.png" /Y

:: Slides 24-31
copy "..\..\..\brain\273b073b-3506-40bd-bdad-21a45d8b28ea\urubo_christmas_clubhouse_houses_1778251073377.png" "assets\urubo_christmas_clubhouse_houses_1778251073377.png" /Y
copy "..\..\..\brain\273b073b-3506-40bd-bdad-21a45d8b28ea\urubo_january_2027_new_beginnings_1778251612441.png" "assets\urubo_january_2027_new_beginnings_1778251612441.png" /Y
copy "..\..\..\brain\273b073b-3506-40bd-bdad-21a45d8b28ea\urubo_february_2027_romance_1778252189462.png" "assets\urubo_february_2027_romance_1778252189462.png" /Y
copy "..\..\..\brain\273b073b-3506-40bd-bdad-21a45d8b28ea\urubo_march_2027_family_1778252211775.png" "assets\urubo_march_2027_family_1778252211775.png" /Y
copy "..\..\..\brain\273b073b-3506-40bd-bdad-21a45d8b28ea\urubo_april_2027_nature_1778252241963.png" "assets\urubo_april_2027_nature_1778252241963.png" /Y
copy "..\..\..\brain\273b073b-3506-40bd-bdad-21a45d8b28ea\urubo_may_2027_mother_1778252265478.png" "assets\urubo_may_2027_mother_1778252265478.png" /Y
copy "..\..\..\brain\273b073b-3506-40bd-bdad-21a45d8b28ea\urubo_june_2027_community_1778252296276.png" "assets\urubo_june_2027_community_1778252296276.png" /Y
copy "..\..\..\brain\273b073b-3506-40bd-bdad-21a45d8b28ea\urubo_final_closing_zen_1778253187350.png" "assets\urubo_final_closing_zen_1778253187350.png" /Y

echo.
echo Proceso finalizado. Ahora puedes subir la carpeta 'campana_2026' a Netlify.
pause
