Set WshShell = CreateObject("WScript.Shell")
q = Chr(34)
cmd = "powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File " & q & "C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc\scripts\run_sds_apokalipsa_daily.ps1" & q
WshShell.Run cmd, 0, False
