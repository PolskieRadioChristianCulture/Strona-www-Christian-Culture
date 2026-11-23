import { chromium } from 'playwright';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const KEY = 'bpta-dj4x-p34k-5d8y-3mqx';
const OUTPUT_NAME = 'CC TV';
const ROOM_URL = 'https://studio.youtube.com/video/KdOBA_zRU0c/livestreaming';

async function updateAitumKeyOnNadajnik(outputName, key) {
  console.log(`[1] Updating aitum.json on cc-nadajnik for output "${outputName}" with key: ${key}...`);
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
                    if ($out.video_encoders) {
                        foreach ($ve in $out.video_encoders) {
                            $ve.stream_key = "${key}"
                        }
                    }
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
  fs.writeFileSync(tempScriptPath, psCode, 'utf8');
  execSync(`scp "${tempScriptPath}" cc-nadajnik:C:/Users/nazir/a007/temp_update_key.ps1`, { stdio: 'inherit' });
  execSync(`ssh cc-nadajnik "powershell -ExecutionPolicy Bypass -File C:\\Users\\nazir\\a007\\temp_update_key.ps1"`, { stdio: 'inherit' });
}

function restartAitumOutput(outputName) {
  return new Promise((resolve, reject) => {
    console.log(`[2] Connecting to OBS WebSocket on cc-nadajnik to restart "${outputName}"...`);
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
        await send('TriggerHotkeyByName', { hotkeyName: `AitumStreamSuiteStartOutput${outputName}` }).catch(e => console.log('Start note:', e.message));
        await new Promise(r => setTimeout(r, 2000));

        console.log(`Restarted Aitum output: ${outputName}`);
        ws.close();
        resolve();
      }
    };
    ws.onerror = reject;
  });
}

async function goLiveInStudio() {
  console.log('[3] Launching Playwright to go live in YouTube Studio...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    channel: 'chrome',
    viewport: { width: 1600, height: 1000 },
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  console.log(`Navigating to room: ${ROOM_URL}...`);
  await page.goto(ROOM_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) {
    await gate.click();
    await page.waitForTimeout(5000);
  }

  // Dismiss any "Gotowe" dialog
  await page.mouse.click(600, 600);
  await page.waitForTimeout(1000);

  // Turn ON Auto-start toggle if not enabled
  console.log('Checking auto-start toggle...');
  const toggles = await page.locator('tp-yt-paper-toggle-button').all();
  for (const t of toggles) {
    const txt = (await t.innerText().catch(() => '')).trim();
    const isChecked = await t.evaluate(el => el.getAttribute('aria-checked') === 'true' || el.hasAttribute('checked'));
    if (txt.includes('automatyczne uruchamianie') && !isChecked) {
      console.log(`Enabling ${txt}...`);
      await t.click();
      await page.waitForTimeout(1500);
    }
  }

  // Wait up to 30s for stream health to turn good / Go Live button to become enabled
  console.log('Waiting for signal from OBS nadajnik...');
  for (let attempt = 1; attempt <= 10; attempt++) {
    const bodyText = await page.evaluate(() => document.body.innerText);
    const hasSignal = bodyText.includes('Doskonałe połączenie') || bodyText.includes('Dobre połączenie') || !bodyText.includes('Brak danych');
    const startBtn = page.locator('#start-stream-button, button:has-text("Transmituj na żywo"), ytcp-button:has-text("Transmituj na żywo")').first();
    const isEnabled = await startBtn.isEnabled().catch(() => false);

    console.log(`Attempt ${attempt}/10: hasSignal=${hasSignal}, startBtnEnabled=${isEnabled}`);
    if (isEnabled) {
      console.log('Clicking "Transmituj na żywo" button!');
      await startBtn.click();
      await page.waitForTimeout(2000);
      const confirmBtn = page.locator('#confirm-button, button:has-text("Rozpocznij"), button:has-text("Gotowe")').first();
      if (await confirmBtn.isVisible().catch(() => false)) {
        console.log('Confirming broadcast start...');
        await confirmBtn.click();
        await page.waitForTimeout(3000);
      }
      break;
    }
    await page.waitForTimeout(3000);
  }

  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/golive_kdoba_result.png' });
  await ctx.close();
}

async function verifyPublic() {
  console.log('\n[4] Verifying public stream at https://www.youtube.com/watch?v=KdOBA_zRU0c...');
  const res = await fetch('https://www.youtube.com/watch?v=KdOBA_zRU0c', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const html = await res.text();
  const playability = html.match(/"playabilityStatus":\{"status":"([^"]+)"/)?.[1];
  const isLiveNow = html.includes('"isLiveNow":true') || html.includes('"isLive":true');
  console.log(`Public Verification: playabilityStatus=${playability}, isLiveNow=${isLiveNow}`);
}

async function main() {
  await updateAitumKeyOnNadajnik(OUTPUT_NAME, KEY);
  await restartAitumOutput(OUTPUT_NAME);
  await new Promise(r => setTimeout(r, 4000));
  await goLiveInStudio();
  await new Promise(r => setTimeout(r, 4000));
  await verifyPublic();
}

main().catch(console.error);
