import { execSync } from 'node:child_process';
import fs from 'node:fs';

const psScript = `
$sh = New-Object -ComObject WScript.Shell
$sc = $sh.CreateShortcut('C:\\Users\\czark\\Desktop\\OpenBot.lnk')
[PSCustomObject]@{
  Target = $sc.TargetPath
  Args = $sc.Arguments
  Working = $sc.WorkingDirectory
} | ConvertTo-Json
`;

const res = execSync(`powershell -NoProfile -Command "${psScript.replace(/\n/g, ' ')}"`, { encoding: 'utf8' });
console.log('OpenBot Shortcut Details:');
console.log(res);
