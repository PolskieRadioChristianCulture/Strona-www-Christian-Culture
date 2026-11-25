Set shell = CreateObject("WScript.Shell")
repoDir = "C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc"
logFile = repoDir & "\data\yt_community_daily.log"
cmd = "cmd.exe /c cd /d """ & repoDir & """ && node scripts\publish_yt_community_post.mjs --daily >> """ & logFile & """ 2>&1"
shell.Run cmd, 0, False
