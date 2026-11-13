$sh = New-Object -ComObject WScript.Shell
$sc = $sh.CreateShortcut('C:\Users\czark\Desktop\OpenBot.lnk')
[PSCustomObject]@{
  Target = $sc.TargetPath
  Args = $sc.Arguments
  Working = $sc.WorkingDirectory
} | ConvertTo-Json
