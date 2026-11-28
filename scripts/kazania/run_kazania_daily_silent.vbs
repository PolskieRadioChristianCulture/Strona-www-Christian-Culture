Set shell = CreateObject("WScript.Shell")
repoDir = "C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc"
logFile = repoDir & "\data\kazania_daily.log"
cmd = "cmd.exe /c cd /d """ & repoDir & """ && node scripts\kazania\daily-sermon-automation.mjs --publish >> """ & logFile & """ 2>&1"
shell.Run cmd, 0, False
