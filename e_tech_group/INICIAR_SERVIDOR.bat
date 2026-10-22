@echo off
title e-Tech Group - Servidor Local
color 0A
cd /d "%~dp0"

echo =================================================
echo   e-Tech Group - Sistema Completo (FastAPI + Web)
echo =================================================
echo.

if exist ".venv\Scripts\python.exe" (
    echo [1/2] Iniciando servidor FastAPI en http://127.0.0.1:8000...
    start http://127.0.0.1:8000/
    echo [2/2] Servidor corriendo. Presiona Ctrl+C para detener.
    echo.
    .venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
) else (
    echo [!] No se encontro el entorno .venv. Intentando con Python del sistema...
    start http://127.0.0.1:8000/
    python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
)

pause
