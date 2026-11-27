Set WshShell = CreateObject("WScript.Shell")
q = Chr(34)
nodeExe = "C:\Program Files\nodejs\node.exe"
scriptPath = "C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc\scripts\cc-straznik-wersji.mjs"
WshShell.CurrentDirectory = "C:\Users\czark\Christian_Culture_Projekty\polskieradio.cc"
WshShell.Run q & nodeExe & q & " " & q & scriptPath & q & " --restore", 0, False
