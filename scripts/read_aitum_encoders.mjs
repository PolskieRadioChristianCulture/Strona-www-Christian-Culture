import { execSync } from 'node:child_process';

const ps = `
$pc = Join-Path $env:APPDATA "obs-studio\\plugin_config"
Get-ChildItem $pc -Recurse -File | Select-Object FullName, Length | Format-Table -AutoSize
$sc = Join-Path $env:APPDATA "obs-studio\\basic\\scenes"
Get-ChildItem $sc -File | Select-Object FullName, Length | Format-Table -AutoSize
`;

const b64 = Buffer.from(ps, 'utf16le').toString('base64');
const out = execSync(`ssh -o BatchMode=yes cc-nadajnik "powershell -NoProfile -EncodedCommand ${b64}"`, { encoding: 'utf8' });
console.log(out);
