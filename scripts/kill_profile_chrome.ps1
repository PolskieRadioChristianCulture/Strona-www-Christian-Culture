Get-CimInstance Win32_Process -Filter "Name = 'chrome.exe'" | Where-Object { $_.CommandLine -like "*youtube_browser_profile*" } | ForEach-Object {
    Write-Host "Killing PID: $($_.ProcessId)"
    Stop-Process -Id $_.ProcessId -Force
}
