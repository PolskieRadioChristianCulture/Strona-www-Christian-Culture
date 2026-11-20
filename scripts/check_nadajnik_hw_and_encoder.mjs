import { execSync } from 'node:child_process';

const ps = `
Write-Output "=== USER & HOST ==="
Write-Output "User: $env:USERNAME | Host: $env:COMPUTERNAME | AppData: $env:APPDATA"
Write-Output "=== CPU ==="
Get-CimInstance Win32_Processor | Select-Object Name, NumberOfCores, NumberOfLogicalProcessors, MaxClockSpeed | Format-List
Write-Output "=== GPU ==="
Get-CimInstance Win32_VideoController | Select-Object Name, AdapterRAM, DriverVersion | Format-List
Write-Output "=== RAM (GB) ==="
[math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)
Write-Output "=== OBS PROFILES ==="
$profDir = Join-Path $env:APPDATA "obs-studio\\basic\\profiles"
if (Test-Path $profDir) {
  foreach ($d in Get-ChildItem $profDir -Directory) {
    Write-Output "--- Profile: $($d.Name) ---"
    $se = Join-Path $d.FullName "streamEncoder.json"
    if (Test-Path $se) {
      Write-Output "streamEncoder.json: $(Get-Content $se -Raw)"
    }
    $ait = Join-Path $d.FullName "aitum.json"
    if (Test-Path $ait) {
      Write-Output "aitum.json exists (size: $((Get-Item $ait).Length))"
    }
  }
}
`;

const b64 = Buffer.from(ps, 'utf16le').toString('base64');
const out = execSync(`ssh -o BatchMode=yes cc-nadajnik "powershell -NoProfile -EncodedCommand ${b64}"`, { encoding: 'utf8' });
console.log(out);
