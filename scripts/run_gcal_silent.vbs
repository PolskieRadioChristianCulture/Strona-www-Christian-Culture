Set WshShell = CreateObject("WScript.Shell")
q = Chr(34)
cmd = "cmd.exe /c " & q & q & "C:\Program Files\nodejs\node.exe" & q & " " & q & "C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc\scripts\sync-gcalendar-quarter-hour.mjs" & q & " >> " & q & "C:\Users\czark\AppData\Local\ChristianCulture\GCalendarReports\sync-task.log" & q & " 2>&1" & q
WshShell.Run cmd, 0, False
