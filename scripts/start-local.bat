@echo off
REM =============================================================================
REM AquaPure Pro - Script de Inicio en 1 Clic (Windows)
REM =============================================================================

echo.
echo =========================================================
echo   Iniciando AquaPure Pro en Servidor Local / Intranet...
echo =========================================================
echo.

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker no esta instalado o no se encuentra en el PATH.
    echo Por favor descargue e instale Docker Desktop para Windows.
    pause
    exit /b 1
)

if not exist .env (
    echo [INFO] Creando archivo de configuracion .env desde plantilla...
    copy .env.example .env >nul
)

echo [INFO] Levantando contenedores (Web App + PostgreSQL Aislado)...
docker compose up -d --build

echo.
echo =========================================================
echo   AquaPure Pro esta listo y operando de forma segura.
echo   Acceso Local: http://localhost:3000
echo =========================================================
echo.
pause
