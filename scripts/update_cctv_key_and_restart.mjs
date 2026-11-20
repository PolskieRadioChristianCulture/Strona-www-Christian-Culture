import { execSync } from 'node:child_process';
import crypto from 'node:crypto';

const OBS_HOST = 'ws://192.168.50.217:4455';
const OBS_PASSWORD = '6qPcL0sXrVvs6sPN';
const NEW_KEY = 'bpta-dj4x-p34k-5d8y-3mqx';

async function updateOnRemote() {
  // PowerShell script to update aitum.json in all profiles and config.json
  const psScript = `
$newKey = "${NEW_KEY}"
$cfg = "C:\\Users\\nazir\\AppData\\Roaming\\obs-studio\\plugin_config\\aitum-multistream\\config.json"
if (Test-Path $cfg) {
    $raw = Get-Content $cfg -Raw -Encoding UTF8
    $j = $raw | ConvertFrom-Json
    foreach ($prof in $j.profiles) {
        foreach ($out in $prof.outputs) {
            if ($out.name -eq "CC TV") {
                $out.stream_key = $newKey
                Write-Output "Updated config.json CC TV key"
            }
        }
    }
    $j | ConvertTo-Json -Depth 10 | Set-Content $cfg -Encoding UTF8
}

$profilesDir = "C:\\Users\\nazir\\AppData\\Roaming\\obs-studio\\basic\\profiles"
foreach ($dir in Get-ChildItem $profilesDir -Directory) {
    $p = Join-Path $dir.FullName "aitum.json"
    if (Test-Path $p) {
        $raw = Get-Content $p -Raw -Encoding UTF8
        $j = $raw | ConvertFrom-Json
        foreach ($out in $j.outputs) {
            if ($out.name -eq "CC TV") {
                $out.stream_key = $newKey
                if ($out.video_encoders -and $out.video_encoders.Count -gt 0) {
                    $out.video_encoders[0].stream_key = $newKey
                }
                Write-Output "Updated aitum.json in $($dir.Name)"
            }
        }
        $j | ConvertTo-Json -Depth 10 | Set-Content $p -Encoding UTF8
    }
}
`;

  const b64 = Buffer.from(psScript, 'utf16le').toString('base64');
  const sshCmd = `ssh -o BatchMode=yes cc-nadajnik "powershell -NoProfile -EncodedCommand ${b64}"`;
  console.log('Executing remote key update...');
  const out = execSync(sshCmd).toString();
  console.log('Remote output:', out);
}

async function restartOutput() {
  const ws = new WebSocket(OBS_HOST);
  await new Promise((resolve) => {
    ws.onmessage = async (e) => {
      const msg = JSON.parse(e.data);
      if (msg.op === 0 && msg.d.authentication) {
        const { challenge, salt } = msg.d.authentication;
        const secretHash = crypto.createHash('sha256').update(OBS_PASSWORD + salt).digest('base64');
        const authResponse = crypto.createHash('sha256').update(secretHash + challenge).digest('base64');
        ws.send(JSON.stringify({ op: 1, d: { rpcVersion: 1, authentication: authResponse, eventSubscriptions: 33 } }));
      } else if (msg.op === 2) resolve();
    };
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

  console.log('Stopping output: Aitum Stream Suite Output CC TV...');
  await sendReq('StopOutput', { outputName: 'Aitum Stream Suite Output CC TV' });
  await new Promise(r => setTimeout(r, 2000));

  console.log('Starting output: Aitum Stream Suite Output CC TV...');
  await sendReq('StartOutput', { outputName: 'Aitum Stream Suite Output CC TV' });
  await new Promise(r => setTimeout(r, 3000));

  const st = await sendReq('GetOutputStatus', { outputName: 'Aitum Stream Suite Output CC TV' });
  console.log('New status of CC TV output:', st.responseData);

  ws.close();
}

async function main() {
  await updateOnRemote();
  await restartOutput();
}

main().catch(console.error);
