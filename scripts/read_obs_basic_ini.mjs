import { execSync } from 'node:child_process';

const ps = `
$profDir = Join-Path $env:APPDATA "obs-studio\\basic\\profiles"
foreach ($d in Get-ChildItem $profDir -Directory) {
  $ini = Join-Path $d.FullName "basic.ini"
  if (Test-Path $ini) {
    $se = Join-Path $d.FullName "streamEncoder.json"
    if (Test-Path $se) {
      $seContent = Get-Content $se -Raw
      if ($seContent -match "2200") {
        Write-Output "=== ACTIVE PROFILE: $($d.FullName) ==="
        Get-Content $ini
      }
    }
  }
}
`;

const b64 = Buffer.from(ps, 'utf16le').toString('base64');
const out = execSync(`ssh -o BatchMode=yes cc-nadajnik "powershell -NoProfile -EncodedCommand ${b64}"`, { encoding: 'utf8' });
console.log(out);
