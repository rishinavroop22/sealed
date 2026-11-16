@echo off
cd /d "%~dp0"
echo Starting Sealed at http://localhost:5173
echo Keep this window open while testing. Close it to stop.
start "" "chrome" "http://localhost:5173"
where python >nul 2>&1
if %errorlevel%==0 (
  python -m http.server 5173 --directory web
) else (
  npx --yes serve web -l 5173
)
pause
