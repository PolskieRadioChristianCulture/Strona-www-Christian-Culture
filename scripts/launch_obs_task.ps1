$action = New-ScheduledTaskAction -Execute "C:\Program Files\obs-studio\bin\64bit\obs64.exe" -WorkingDirectory "C:\Program Files\obs-studio\bin\64bit"
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1)
Register-ScheduledTask -TaskName "RunOBSInteractive" -Action $action -Trigger $trigger -User "nazir" -Force
Start-ScheduledTask -TaskName "RunOBSInteractive"
Start-Sleep -Seconds 5
Get-Process obs64
