Start-Process -FilePath "C:\Program Files\obs-studio\bin\64bit\obs64.exe" -WorkingDirectory "C:\Program Files\obs-studio\bin\64bit"
Start-Sleep -Seconds 4
Get-Process obs64 | Select-Object Id,ProcessName
