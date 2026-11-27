Set-Location 'C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc'

$logFile = 'C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc\data\gbp_auto_publisher.log'
"=== GBP AUTO-PUBLISHER START ($(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')) ===" | Out-File -FilePath $logFile -Append -Encoding utf8

& node scripts\gbp_auto_publisher.mjs --once *>> $logFile
$code = $LASTEXITCODE

"=== GBP AUTO-PUBLISHER END (exit=$code | $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')) ===" | Out-File -FilePath $logFile -Append -Encoding utf8
exit $code
