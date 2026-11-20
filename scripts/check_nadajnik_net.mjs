import { execSync } from 'node:child_process';

const ps = `
Get-NetAdapter | Where-Object { $_.Status -eq 'Up' } | Select-Object Name, InterfaceDescription, LinkSpeed | Format-List
$s1 = (Get-NetAdapterStatistics | Where-Object { $_.SentBytes -gt 0 } | Measure-Object -Property SentBytes -Sum).Sum
Start-Sleep -Seconds 2
$s2 = (Get-NetAdapterStatistics | Where-Object { $_.SentBytes -gt 0 } | Measure-Object -Property SentBytes -Sum).Sum
$mbps = [math]::Round((($s2 - $s1) * 8) / (2 * 1000000), 2)
Write-Output "Current Upload Traffic: $mbps Mbps"
`;

const b64 = Buffer.from(ps, 'utf16le').toString('base64');
const out = execSync(`ssh -o BatchMode=yes cc-nadajnik "powershell -NoProfile -EncodedCommand ${b64}"`, { encoding: 'utf8' });
console.log(out);
