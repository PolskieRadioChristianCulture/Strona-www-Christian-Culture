@echo off
REM CC Singing Bible Factory Watchdog — Windows Task Scheduler runner
setlocal

set REPO=C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc
set LOG=%REPO%\factory\singing-bible\logs\watchdog.log
set DAEMON=%REPO%\factory\singing-bible\pipeline-daemon.mjs

if not exist "%REPO%\factory\singing-bible\logs" mkdir "%REPO%\factory\singing-bible\logs"

echo Watchdog cycle starting... >> "%LOG%"
node "%DAEMON%" --watch >> "%LOG%" 2>&1
echo Watchdog cycle complete. >> "%LOG%"

endlocal
