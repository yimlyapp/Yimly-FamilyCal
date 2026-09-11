@echo off
setlocal enabledelayedexpansion

title Yimly FamilyCal - Update

echo ========================================
echo       YIMLY FAMILYCAL UPDATE
echo ========================================
echo.

:: -----------------------------------------------------------------------------
:: [1/5] Checking repository and environment prerequisites
:: -----------------------------------------------------------------------------
echo [1/5] Checking repository and prerequisites...

:: 1. Verify Git is installed
where git >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Git is not installed or not found in PATH.
    echo Please install Git for Windows from https://git-scm.com/
    goto :fail
)

:: 2. Verify Docker CLI is installed
where docker >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker is not installed or not found in PATH.
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop/
    goto :fail
)

:: 3. Verify Docker Desktop engine is running
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker Desktop is not running.
    echo Please launch Docker Desktop and wait until the Docker engine has started.
    goto :fail
)

:: 4. Verify Docker Compose is available
docker compose version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker Compose is not available.
    echo Please ensure Docker Desktop includes Docker Compose v2.
    goto :fail
)

:: 5. Verify current directory is the Yimly FamilyCal Git repository
if not exist ".git" (
    echo [ERROR] Current directory is not a Git repository.
    echo Please run update.bat from the root directory of your cloned Yimly FamilyCal project.
    goto :fail
)

if not exist "docker-compose.yml" (
    echo [ERROR] docker-compose.yml not found in the current directory.
    echo Please ensure you are running this updater from the Yimly FamilyCal project root.
    goto :fail
)

:: 6. Verify Git remote points to the Yimly FamilyCal repository
set "REMOTE_URL="
for /f "delims=" %%u in ('git config --get remote.origin.url 2^>nul') do set "REMOTE_URL=%%u"
if defined REMOTE_URL (
    echo Current remote: !REMOTE_URL!
    echo !REMOTE_URL! | findstr /i "yimlyapp/Yimly-FamilyCal Yimly-FamilyCal" >nul
    if %ERRORLEVEL% neq 0 (
        echo [WARNING] Git remote URL does not match the official repository:
        echo   Expected: https://github.com/yimlyapp/Yimly-FamilyCal.git
        echo   Current:  !REMOTE_URL!
        echo Continuing update with currently configured remote...
    )
) else (
    echo [WARNING] No git remote origin configured.
)

:: 7. Check Docker Network requirements (if external network configured in compose)
findstr /i "cloudflared_bridge" docker-compose.yml >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo Checking external Docker network 'cloudflared_bridge'...
    docker network inspect cloudflared_bridge >nul 2>&1
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Required external Docker network 'cloudflared_bridge' does not exist.
        echo Create it using: docker network create cloudflared_bridge
        goto :fail
    ) else (
        echo Docker network 'cloudflared_bridge' verified.
    )
)

:: 8. Check for uncommitted local changes
set "STATUS_TMP=%TEMP%\yimly_status_%RANDOM%.tmp"
git status --porcelain > "!STATUS_TMP!" 2>&1
set "DIRTY_COUNT=0"
for /f %%A in ('type "!STATUS_TMP!" 2^>nul ^| find /c /v ""') do set "DIRTY_COUNT=%%A"
if !DIRTY_COUNT! gtr 0 (
    echo [ERROR] Uncommitted local changes detected.
    echo.
    git status --short
    echo.
    echo Please commit or stash your local modifications before updating.
    del "!STATUS_TMP!" >nul 2>&1
    goto :fail
)
del "!STATUS_TMP!" >nul 2>&1

echo All repository and environment checks passed.
echo.

:: -----------------------------------------------------------------------------
:: [2/5] Pulling latest GitHub changes
:: -----------------------------------------------------------------------------
echo [2/5] Pulling latest GitHub changes...

git pull
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Failed to pull changes from GitHub.
    echo Please check your network connection and Git credentials.
    goto :fail
)

echo Repository updated successfully.
echo.

:: -----------------------------------------------------------------------------
:: [3/5] Backing up database and preserving environment configuration
:: -----------------------------------------------------------------------------
echo [3/5] Backing up database and checking configuration...

:: Generate timestamp formatted yyyy-MM-dd-HH-mm-ss
set "TIMESTAMP="
for /f "delims=" %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd-HH-mm-ss"') do set "TIMESTAMP=%%I"
if not defined TIMESTAMP (
    set "TIMESTAMP=%DATE:~10,4%-%DATE:~4,2%-%DATE:~7,2%-%TIME:~0,2%-%TIME:~3,2%-%TIME:~6,2%"
    set "TIMESTAMP=!TIMESTAMP: =0!"
)

:: Ensure backups directory exists
if not exist "backups" (
    mkdir "backups" >nul 2>&1
)

set "BACKUP_FILE="
set "DB_FOUND=0"

:: Check for actual SQLite database file: data\yimly_familycal.db
if exist "data\yimly_familycal.db" (
    set "DB_FOUND=1"
    set "BACKUP_FILE=backups\yimly-familycal-!TIMESTAMP!.db"
    echo Creating backup of host database 'data\yimly_familycal.db'...
    copy /y "data\yimly_familycal.db" "!BACKUP_FILE!" >nul
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Database backup failed while copying 'data\yimly_familycal.db'.
        goto :fail
    )
    :: Also copy SQLite WAL and SHM files if present for complete consistency
    if exist "data\yimly_familycal.db-wal" (
        copy /y "data\yimly_familycal.db-wal" "backups\yimly-familycal-!TIMESTAMP!.db-wal" >nul 2>&1
    )
    if exist "data\yimly_familycal.db-shm" (
        copy /y "data\yimly_familycal.db-shm" "backups\yimly-familycal-!TIMESTAMP!.db-shm" >nul 2>&1
    )
) else if exist "data\family_calendar.sqlite" (
    set "DB_FOUND=1"
    set "BACKUP_FILE=backups\family-calendar-!TIMESTAMP!.db"
    echo Creating backup of legacy database 'data\family_calendar.sqlite'...
    copy /y "data\family_calendar.sqlite" "!BACKUP_FILE!" >nul
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Database backup failed while copying 'data\family_calendar.sqlite'.
        goto :fail
    )
) else (
    :: If not mounted directly on host filesystem, check inside running/stopped Docker container
    docker ps -a --format "{{.Names}}" 2^>nul | findstr /x /c:"yimly-familycal" >nul
    if %ERRORLEVEL% equ 0 (
        echo Copying database from Docker container volume 'yimly-familycal:/data/yimly_familycal.db'...
        set "BACKUP_FILE=backups\yimly-familycal-!TIMESTAMP!.db"
        docker cp yimly-familycal:/data/yimly_familycal.db "!BACKUP_FILE!" >nul 2>&1
        if %ERRORLEVEL% equ 0 (
            set "DB_FOUND=1"
        ) else (
            set "BACKUP_FILE="
        )
    )
)

if !DB_FOUND! equ 1 (
    if exist "!BACKUP_FILE!" (
        echo Database successfully backed up to: !BACKUP_FILE!
    ) else (
        echo [ERROR] Database backup file verification failed.
        goto :fail
    )
) else (
    echo No existing database found. Skipping backup.
)

:: Preserve .env configuration and secrets
if exist ".env" (
    echo Existing .env detected - preserving configuration and secrets.
) else (
    echo [NOTICE] No local .env file found. Docker will use container environment variables.
)
echo.

:: -----------------------------------------------------------------------------
:: [4/5] Rebuilding and restarting FamilyCal
:: -----------------------------------------------------------------------------
echo [4/5] Rebuilding and restarting FamilyCal...

echo Building updated Docker image using docker-compose.yml...
docker compose -f docker-compose.yml build --pull
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Docker image build failed.
    if defined BACKUP_FILE (
        echo Your database backup is preserved safely at: !BACKUP_FILE!
    )
    goto :fail
)

echo Starting updated Yimly FamilyCal service...
docker compose -f docker-compose.yml up -d
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Failed to restart FamilyCal.
    if defined BACKUP_FILE (
        echo Your database backup is preserved safely at: !BACKUP_FILE!
    )
    goto :fail
)

:: Remove dangling/unused build images safely
echo Pruning dangling images...
docker image prune -f >nul 2>&1

echo Containers restarted successfully.
echo.

:: -----------------------------------------------------------------------------
:: [5/5] Checking health
:: -----------------------------------------------------------------------------
echo [5/5] Checking health...
echo Waiting for container 'yimly-familycal' to report healthy status (up to 60s)...

set "IS_HEALTHY=0"

for /l %%i in (1,1,12) do (
    if !IS_HEALTHY! equ 0 (
        set "CURRENT_STATUS=starting"
        for /f "delims=" %%s in ('docker inspect --format="{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}" yimly-familycal 2^>nul') do set "CURRENT_STATUS=%%s"
        
        echo   [Check %%i/12] Status: !CURRENT_STATUS!

        if /i "!CURRENT_STATUS!"=="healthy" (
            set "IS_HEALTHY=1"
        ) else if /i "!CURRENT_STATUS!"=="unhealthy" (
            echo.
            echo [ERROR] Container 'yimly-familycal' reported UNHEALTHY status.
            goto :health_failed
        ) else (
            timeout /t 5 /nobreak >nul
        )
    )
)

if !IS_HEALTHY! neq 1 (
    echo.
    echo [ERROR] Container 'yimly-familycal' did not become healthy within 60 seconds.
    goto :health_failed
)

:: -----------------------------------------------------------------------------
:: SUCCESS
:: -----------------------------------------------------------------------------
echo.
echo ========================================
echo Yimly FamilyCal health check: HEALTHY
echo ========================================
echo ========================================
echo Yimly FamilyCal update complete.
echo ========================================
echo.

echo Running container status:
docker compose -f docker-compose.yml ps
echo.

:: Determine network target for summary
docker network inspect cloudflared_bridge >nul 2>&1
if %ERRORLEVEL% equ 0 (
    set "DETECTED_NET=cloudflared_bridge (external)"
    set "TUNNEL_TARGET=http://familycal:3000"
) else (
    set "DETECTED_NET=cloudflared_bridge (external - not yet created)"
    set "TUNNEL_TARGET=http://familycal:3000"
)

echo Yimly FamilyCal Networking Summary:
echo - Compose Service:          yimly-familycal
echo - Container Name:           yimly-familycal
echo - Docker Network:           !DETECTED_NET!
echo - Network Alias:            familycal
echo - Internal Port:            3000
echo - Published Host Port:      3000
echo - Local URL:                http://localhost:3000
echo - Public URL:               https://familycal.robinhort.link
echo - Cloudflare Tunnel Target: !TUNNEL_TARGET!
echo - Health Endpoint:          http://localhost:3000/api/health
echo - Google OAuth Callback:    https://familycal.robinhort.link/api/v1/calendar/google/callback
if defined BACKUP_FILE (
    echo - Database Backup File:     !BACKUP_FILE!
)
echo.
goto :end

:: -----------------------------------------------------------------------------
:: HEALTH FAILURE
:: -----------------------------------------------------------------------------
:health_failed
echo.
echo ========================================
echo Yimly FamilyCal health check: FAILED
echo ========================================
echo.
echo Container status:
docker compose -f docker-compose.yml ps
echo.
echo Recent container logs (last 100 lines):
docker compose -f docker-compose.yml logs --tail=100
echo.
if defined BACKUP_FILE (
    echo Database backup is preserved safely at: !BACKUP_FILE!
)
echo.
echo [ERROR] FamilyCal health check failed.
goto :fail

:: -----------------------------------------------------------------------------
:: FAILURE EXIT
:: -----------------------------------------------------------------------------
:fail
echo.
echo ========================================
echo        UPDATE PROCESS FAILED
echo ========================================
echo Please review the diagnostic messages above.
echo.
pause
exit /b 1

:: -----------------------------------------------------------------------------
:: SUCCESS EXIT
:: -----------------------------------------------------------------------------
:end
pause
exit /b 0
