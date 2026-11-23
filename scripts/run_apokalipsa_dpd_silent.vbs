Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
repoDir = "C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc"
logFile = repoDir & "\data\apokalipsa_dpd_daily.log"
cmd = "cmd.exe /c cd /d """ & repoDir & """ && node scripts\daily_apokalipsa_dpd.mjs >> """ & logFile & """ 2>&1"
shell.Run cmd, 0, False
