Set-Location 'C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc'

$logFile = 'C:\Users\czark\Christian_Culture_Projekty\apokalipsa_dunkel_assets\daily_pipeline.log'
$maxRetries = 3

for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
    "=== Rozpoczecie proby $attempt/$maxRetries ($(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')) ===" | Out-File -FilePath $logFile -Append -Encoding utf8
    
    # 1. Czyszczenie zawieszonych procesow Chrome
    node -e "try { const { killOrphanChromeProfiles } = await import('./scripts/yt_studio_session.mjs'); killOrphanChromeProfiles(); } catch {}" *>> $logFile
    
    # 2. Uruchomienie pipeline z automatycznym ponowieniem
    & node scripts\apokalipsa_dunkel_daily_pipeline.mjs *>> $logFile
    
    if ($LASTEXITCODE -eq 0) {
        "=== Sukces w probie $attempt/$maxRetries ($(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')) ===" | Out-File -FilePath $logFile -Append -Encoding utf8
        break
    } else {
        "=== Blad w probie $attempt/$maxRetries (kod wyjscia $LASTEXITCODE). Ponawiam za 60s... ===" | Out-File -FilePath $logFile -Append -Encoding utf8
        if ($attempt -lt $maxRetries) {
            Start-Sleep -Seconds 60
        }
    }
}
