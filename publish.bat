@echo off
cd /d "%~dp0"
set "GIT=git"
where git >nul 2>&1
if errorlevel 1 (
  if not exist "%ProgramFiles%\Git\cmd\git.exe" (
    echo Git is not installed. Installing Git for Windows now ^(one time only^)...
    echo If Windows asks for permission, click Yes.
    winget install --id Git.Git -e --source winget
  )
  set "GIT=%ProgramFiles%\Git\cmd\git.exe"
)
if not exist "%ProgramFiles%\Git\cmd\git.exe" (
  where git >nul 2>&1
  if errorlevel 1 (
    echo Git could not be installed automatically. Install it from https://git-scm.com/download/win and run this again.
    pause
    exit /b 1
  )
)
if not exist .git (
  "%GIT%" init -b main
  "%GIT%" remote add origin https://github.com/rishinavroop22/sealed.git
  "%GIT%" config user.name "rishinavroop22"
  "%GIT%" config user.email "rishinavroop22@users.noreply.github.com"
  "%GIT%" pull origin main
)
"%GIT%" add -A
"%GIT%" commit -m "Update Sealed"
"%GIT%" push -u origin main
echo.
echo Finished. If you see errors above, send a screenshot. Otherwise you can close this window.
pause
