@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"
echo Starting PrepDuel dev server...
echo Open: http://localhost:5173/prep-duel/
echo.
call npm run dev
