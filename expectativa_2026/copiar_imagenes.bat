@echo off
echo Creando carpeta assets...
mkdir assets 2>nul

echo Copiando Logo...
copy "C:\Users\etechadmin\.gemini\antigravity\brain\b853c0eb-ee51-4c3c-ad0f-639cbb23efeb\media__1778265524063.png" "assets\logo.png"

echo Copiando fondos...
copy "C:\Users\etechadmin\.gemini\antigravity\brain\b853c0eb-ee51-4c3c-ad0f-639cbb23efeb\media__1778263975826.jpg" "assets\slide2.jpg"
copy "C:\Users\etechadmin\.gemini\antigravity\brain\b853c0eb-ee51-4c3c-ad0f-639cbb23efeb\media__1778263641946.jpg" "assets\slide4.jpg"
copy "C:\Users\etechadmin\.gemini\antigravity\brain\b853c0eb-ee51-4c3c-ad0f-639cbb23efeb\media__1778263845141.jpg" "assets\slide7.jpg"
copy "C:\Users\etechadmin\.gemini\antigravity\brain\b853c0eb-ee51-4c3c-ad0f-639cbb23efeb\media__1778265976742.jpg" "assets\slide10.jpg"

echo.
echo =========================================
echo IMAGENES COPIADAS CORRECTAMENTE
echo =========================================
echo Ya puedes subir la carpeta a Netlify.
pause
