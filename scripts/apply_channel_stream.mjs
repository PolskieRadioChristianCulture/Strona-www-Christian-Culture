import { setupScheduledStream } from './setup_scheduled_stream.mjs';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

const channel = process.argv[2] || 'CC Women';
const title = process.argv[3] || 'CC Women LIVE 🔴 | Christian Culture TV24';
const aitumOutputName = process.argv[4] || 'CC Women';

async function updateAitumKeyOnNadajnik(outputName, key) {
  console.log(`Updating aitum.json on cc-nadajnik for output "${outputName}" with key: ${key}...`);
  const psCode = `
    $profilesDir = "C:\\Users\\nazir\\AppData\\Roaming\\obs-studio\\basic\\profiles"
    $profiles = Get-ChildItem $profilesDir -Directory
    foreach ($dir in $profiles) {
        $p = Join-Path $dir.FullName "aitum.json"
        if (Test-Path $p) {
            $raw = Get-Content $p -Raw -Encoding UTF8 | ConvertFrom-Json
            $found = $false
            foreach ($out in $raw.outputs) {
                if ($out.name -eq "${outputName}") {
                    $out.stream_key = "${key}"
                    $found = $true
                }
            }
            if ($found) {
                $raw | ConvertTo-Json -Depth 10 | Set-Content $p -Encoding UTF8
                Write-Output "Updated: $p"
            }
        }
    }
  `;
  const tempScriptPath = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\temp_update_key.ps1';
  import('node:fs').then(fs => fs.writeFileSync(tempScriptPath, psCode, 'utf8'));
  execSync(`scp "${tempScriptPath}" cc-nadajnik:C:/Users/nazir/a007/temp_update_key.ps1`, { stdio: 'inherit' });
  execSync(`ssh cc-nadajnik "powershell -ExecutionPolicy Bypass -File C:\\Users\\nazir\\a007\\temp_update_key.ps1"`, { stdio: 'inherit' });
}

function restartAitumOutput(outputName) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket('ws://192.168.50.217:4455');
    function send(type, data = {}) {
      return new Promise((res, rej) => {
        const id = crypto.randomUUID();
        const timer = setTimeout(() => rej(new Error('timeout ' + type)), 10000);
        const h = (e) => {
          const m = JSON.parse(e.data);
          if (m.op === 7 && m.d.requestId === id) {
            clearTimeout(timer);
            ws.removeEventListener('message', h);
            if (m.d.requestStatus.result) res(m.d.responseData);
            else rej(new Error(m.d.requestStatus.comment || 'OBS request failed'));
          }
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ op: 6, d: { requestType: type, requestId: id, requestData: data } }));
      });
    }

    ws.onmessage = async (e) => {
      const msg = JSON.parse(e.data);
      if (msg.op === 0 && msg.d.authentication) {
        const { challenge, salt } = msg.d.authentication;
        const secret = crypto.createHash('sha256').update('6qPcL0sXrVvs6sPN' + salt).digest('base64');
        const auth = crypto.createHash('sha256').update(secret + challenge).digest('base64');
        ws.send(JSON.stringify({ op: 1, d: { rpcVersion: 1, authentication: auth } }));
      } else if (msg.op === 2) {
        console.log(`Stopping Aitum output: ${outputName}...`);
        await send('TriggerHotkeyByName', { hotkeyName: `AitumStreamSuiteStopOutput${outputName}` }).catch(e => console.log('Stop note:', e.message));
        await new Promise(r => setTimeout(r, 2000));

        console.log(`Starting Aitum output: ${outputName}...`);
        await send('TriggerHotkeyByName', { hotkeyName: `AitumStreamSuiteStartOutput${outputName}` });
        await new Promise(r => setTimeout(r, 2000));

        console.log(`Successfully restarted output: ${outputName}`);
        ws.close();
        resolve();
      }
    };
    ws.onerror = reject;
  });
}

async function main() {
  const streamKey = await setupScheduledStream(channel, title);
  if (!streamKey) {
    throw new Error(`Failed to get stream key for ${channel}`);
  }

  await updateAitumKeyOnNadajnik(aitumOutputName, streamKey);
  await restartAitumOutput(aitumOutputName);

  console.log(`\nChannel ${channel} configuration complete! Waiting 10s before status check...`);
  await new Promise(r => setTimeout(r, 10000));
}

main().catch(console.error);
