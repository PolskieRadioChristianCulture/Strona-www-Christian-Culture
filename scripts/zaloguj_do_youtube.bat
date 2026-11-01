@echo off
chcp 65001 >nul
echo ========================================================
echo 🔴 JEDNORAZOWE LOGOWANIE DO YOUTUBE STUDIO (PLAYWRIGHT)
echo    Standard: ZERO COST (0 PLN / Bez oplat i limitow API)
echo ========================================================
echo.
echo Za chwile otworzy sie okno przegladarki Chrome z panelem YouTube Studio.
echo Zaloguj sie na swoje oficjalne konto Google / kanal YouTube.
echo.
echo Po zalogowaniu sesja zostanie trwale zapisana w bezpiecznym profilu.
echo Kolejne odcinki Biblii Audio (4K i Shorts) beda wgrywac sie same w tle!
echo.
cd /d "C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc"
node scripts/publish_to_youtube_playwright.mjs --login
echo.
echo ========================================================
echo Gotowe! Mozesz zamknac to okno.
echo ========================================================
pause
