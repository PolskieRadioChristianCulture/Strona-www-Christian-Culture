import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

const OBS_HOST = 'ws://192.168.50.217:4455';
const OBS_PASSWORD = '6qPcL0sXrVvs6sPN';

async function main() {
  // 1. Zaktualizuj streamEncoder.json we wszystkich profilach OBS na cc-nadajnik (preset: veryfast, profile: high, bitrate: 2650)
  // Uwaga: karta sieciowa ma LinkSpeed 100 Mbps i obsługuje ~28 strumieni jednocześnie (~74 Mbps łącznego uploadu przy 2650 kbps),
  // dlatego 2650 kbps + preset veryfast (z włączonym weightp dla przenikania obrazów i CABAC) oraz profil high daje maksymalną jakość bez zapychania łącza 100 Mbps!
  const ps = `
$profDir = Join-Path $env:APPDATA "obs-studio\\basic\\profiles"
foreach ($d in Get-ChildItem $profDir -Directory) {
  $se = Join-Path $d.FullName "streamEncoder.json"
  if (Test-Path $se) {
    $newSe = @{
      profile = "high"
      bitrate = 2650
      preset = "veryfast"
      keyint_sec = 2
      rate_control = "CBR"
    } | ConvertTo-Json
    Set-Content -Path $se -Value $newSe -Encoding UTF8
    Write-Output "Updated streamEncoder.json in $($d.Name)"
  }
}
`;
  const b64 = Buffer.from(ps, 'utf16le').toString('base64');
  const out = execSync(`ssh -o BatchMode=yes cc-nadajnik "powershell -NoProfile -EncodedCommand ${b64}"`, { encoding: 'utf8' });
  console.log(out.trim());

  // 2. Ustaw w OBS przez WebSocket filtr skalowania Lanczos (36 próbek) oraz DynamicBitrate
  const ws = new WebSocket(OBS_HOST);
  await new Promise((resolve, reject) => {
    ws.onmessage = async (e) => {
      const msg = JSON.parse(e.data);
      if (msg.op === 0 && msg.d.authentication) {
        const { challenge, salt } = msg.d.authentication;
        const secretHash = crypto.createHash('sha256').update(OBS_PASSWORD + salt).digest('base64');
        const authResponse = crypto.createHash('sha256').update(secretHash + challenge).digest('base64');
        ws.send(JSON.stringify({ op: 1, d: { rpcVersion: 1, authentication: authResponse, eventSubscriptions: 33 } }));
      } else if (msg.op === 2) resolve();
    };
    ws.onerror = reject;
  });

  const sendReq = (type, data = {}) => new Promise((res) => {
    const id = crypto.randomUUID();
    const h = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.op === 7 && m.d.requestId === id) {
        ws.removeEventListener('message', h);
        res(m.d);
      }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ op: 6, d: { requestType: type, requestId: id, requestData: data } }));
  });

  await sendReq('SetProfileParameter', { parameterCategory: 'Video', parameterName: 'ScaleType', parameterValue: 'lanczos' });
  await sendReq('SetProfileParameter', { parameterCategory: 'Output', parameterName: 'DynamicBitrate', parameterValue: 'true' });

  const checkScale = await sendReq('GetProfileParameter', { parameterCategory: 'Video', parameterName: 'ScaleType' });
  console.log('Nowy filtr skalowania OBS (Video.ScaleType):', checkScale.responseData?.parameterValue);

  ws.close();
}

main().catch(console.error);
