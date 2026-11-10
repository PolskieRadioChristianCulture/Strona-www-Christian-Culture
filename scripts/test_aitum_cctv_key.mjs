import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

const ws = new WebSocket('ws://192.168.50.217:4455');

function send(type, data = {}) {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    const timer = setTimeout(() => reject(new Error('timeout ' + type)), 10000);
    const h = (e) => {
      const m = JSON.parse(e.data);
      if (m.op === 7 && m.d.requestId === id) {
        clearTimeout(timer);
        ws.removeEventListener('message', h);
        if (m.d.requestStatus.result) {
          resolve(m.d.responseData);
        } else {
          reject(new Error(m.d.requestStatus.comment || 'OBS request failed'));
        }
      }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ op: 6, d: { requestType: type, requestId: id, requestData: data } }));
  });
}

async function main() {
  console.log('1. Updating aitum.json on cc-nadajnik...');
  const psCmd = `
    $p = "C:\\Users\\nazir\\AppData\\Roaming\\obs-studio\\basic\\profiles\\Bez_tytułu\\aitum.json"
    $raw = Get-Content $p -Raw -Encoding UTF8 | ConvertFrom-Json
    foreach ($out in $raw.outputs) {
      if ($out.name -eq "CC TV") {
        Write-Output "Found CC TV, old key: $($out.stream_key)"
        $out.stream_key = "bpta-dj4x-p34k-5d8y-3mqx"
      }
    }
    $raw | ConvertTo-Json -Depth 10 | Set-Content $p -Encoding UTF8
    Write-Output "Updated aitum.json successfully."
  `;
  const res = execSync(`ssh cc-nadajnik "powershell -Command \\"${psCmd.replace(/"/g, '\\"').replace(/\n/g, ' ')}\\""`, { encoding: 'utf8' });
  console.log('SSH Output:', res);

  console.log('2. Connecting to OBS WebSocket...');
  await new Promise((resolve, reject) => {
    ws.onmessage = async (e) => {
      const msg = JSON.parse(e.data);
      if (msg.op === 0 && msg.d.authentication) {
        const { challenge, salt } = msg.d.authentication;
        const secret = crypto.createHash('sha256').update('6qPcL0sXrVvs6sPN' + salt).digest('base64');
        const auth = crypto.createHash('sha256').update(secret + challenge).digest('base64');
        ws.send(JSON.stringify({ op: 1, d: { rpcVersion: 1, authentication: auth } }));
      } else if (msg.op === 2) {
        console.log('3. Triggering StopOutput CC TV...');
        await send('TriggerHotkeyByName', { hotkeyName: 'AitumStreamSuiteStopOutputCC TV' });
        await new Promise(r => setTimeout(r, 2000));

        console.log('4. Triggering StartOutput CC TV...');
        await send('TriggerHotkeyByName', { hotkeyName: 'AitumStreamSuiteStartOutputCC TV' });
        await new Promise(r => setTimeout(r, 2000));

        console.log('Output triggered.');
        ws.close();
        resolve();
      }
    };
    ws.onerror = reject;
  });
}

main().catch(console.error);
