import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';

const OBS_HOST = '192.168.50.217';
const OBS_PORT = 4455;
const OBS_PASS = '6qPcL0sXrVvs6sPN';

export async function restartAitumOutput(outputName) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://${OBS_HOST}:${OBS_PORT}`);
    const timer = setTimeout(() => {
      ws.close();
      reject(new Error(`Timeout restarting output ${outputName}`));
    }, 25000);

    function send(type, data = {}) {
      return new Promise((res, rej) => {
        const id = crypto.randomUUID();
        const t = setTimeout(() => rej(new Error('timeout ' + type)), 10000);
        const h = (e) => {
          const m = JSON.parse(e.data);
          if (m.op === 7 && m.d.requestId === id) {
            clearTimeout(t);
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
        const secret = crypto.createHash('sha256').update(OBS_PASS + salt).digest('base64');
        const auth = crypto.createHash('sha256').update(secret + challenge).digest('base64');
        ws.send(JSON.stringify({ op: 1, d: { rpcVersion: 1, authentication: auth } }));
      } else if (msg.op === 2) {
        console.log(`[OBS WS] Stopping output: ${outputName}...`);
        await send('TriggerHotkeyByName', { hotkeyName: `AitumStreamSuiteStopOutput${outputName}` })
          .catch(err => console.log(`[OBS WS] Stop notice: ${err.message}`));
        await new Promise(r => setTimeout(r, 2500));

        console.log(`[OBS WS] Starting output: ${outputName}...`);
        await send('TriggerHotkeyByName', { hotkeyName: `AitumStreamSuiteStartOutput${outputName}` });
        await new Promise(r => setTimeout(r, 2500));

        console.log(`[OBS WS] Output ${outputName} restarted.`);
        clearTimeout(timer);
        ws.close();
        resolve();
      }
    };
    ws.onerror = (err) => {
      clearTimeout(timer);
      reject(err);
    };
  });
}

export function updateAitumKeyOnRemote(outputName, streamKey) {
  console.log(`Updating ${outputName} key on cc-nadajnik to: ${streamKey}...`);
  const psScript = `
    $profilesDir = "C:\\Users\\nazir\\AppData\\Roaming\\obs-studio\\basic\\profiles"
    $profiles = Get-ChildItem $profilesDir -Directory
    foreach ($dir in $profiles) {
        $p = Join-Path $dir.FullName "aitum.json"
        if (Test-Path $p) {
            $raw = Get-Content $p -Raw -Encoding UTF8 | ConvertFrom-Json
            $found = $false
            foreach ($out in $raw.outputs) {
                if ($out.name -eq "${outputName}") {
                    $out.stream_key = "${streamKey}"
                    if ($out.video_encoders -and $out.video_encoders.Count -gt 0) {
                        $out.video_encoders[0].stream_key = "${streamKey}"
                    }
                    $found = $true
                }
            }
            if ($found) {
                $raw | ConvertTo-Json -Depth 10 | Set-Content $p -Encoding UTF8
            }
        }
    }
    Write-Output "Successfully updated ${outputName} key in profiles."
  `;
  const localPs = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\temp_update_key.ps1';
  fs.writeFileSync(localPs, psScript, 'utf8');
  execSync(`scp "${localPs}" cc-nadajnik:C:/Users/nazir/a007/temp_update_key.ps1`, { stdio: 'inherit' });
  execSync('ssh cc-nadajnik "powershell -ExecutionPolicy Bypass -File C:\\Users\\nazir\\a007\\temp_update_key.ps1"', { stdio: 'inherit' });
}

export async function setupAndGoLive({ channelName, outputName, streamTitle }) {
  console.log(`\n========================================`);
  console.log(`Setting up Live for: ${channelName} (Output: ${outputName})`);
  console.log(`========================================`);

  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log(`1. Navigating to ${channelName} manage page...`);
    await openChannelStudio(page, channelName, '/livestreaming/manage');
    await page.waitForTimeout(5000);

    // Check if there is an existing broadcast
    let row = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
    let hasRow = await row.isVisible().catch(() => false);

    if (!hasRow) {
      console.log('No broadcast row found. Clicking Zaplanuj transmisję...');
      const schedBtn = page.locator('button:has-text("Zaplanuj transmisję"), #schedule-stream-button').first();
      await schedBtn.click();
      await page.waitForTimeout(2500);

      const createNew = page.locator('button:has-text("Utwórz nowe")').first();
      if (await createNew.isVisible().catch(() => false)) {
        await createNew.click();
        await page.waitForTimeout(2000);
      }

      // Step 1: Title
      console.log(`Typing title: ${streamTitle}...`);
      await page.mouse.click(400, 335);
      await page.waitForTimeout(500);
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type(streamTitle);
      await page.waitForTimeout(1000);

      // Step 1: Click Dalej at (1220, 880)
      console.log('Clicking Dalej step 1...');
      await page.mouse.click(1220, 880);
      await page.waitForTimeout(2500);

      // Step 2: Click Dalej at (1220, 880)
      console.log('Clicking Dalej step 2...');
      await page.mouse.click(1220, 880);
      await page.waitForTimeout(2500);

      // Step 3: Visibility Publiczny
      console.log('Selecting Publiczny in step 3...');
      const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
      if (await pubRadio.isVisible().catch(() => false)) {
        await pubRadio.click();
        await page.waitForTimeout(1000);
      }

      // Finish Gotowe at (1220, 880)
      console.log('Clicking Gotowe...');
      await page.mouse.click(1220, 880);
      await page.waitForTimeout(8000);
    }

    // Check if visibility in row is Niepubliczny, and publish if needed
    const niepubCell = page.locator('text=Niepublicz').first();
    if (await niepubCell.isVisible().catch(() => false)) {
      console.log('Publishing broadcast to Public...');
      await niepubCell.click();
      await page.waitForTimeout(1500);
      const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first();
      if (await pubRadio.isVisible().catch(() => false)) {
        await pubRadio.click();
        await page.waitForTimeout(1000);
        const saveBtn = page.locator('tp-yt-paper-dialog #save-button').first();
        if (await saveBtn.isVisible().catch(() => false)) {
          await saveBtn.click();
          await page.waitForTimeout(4000);
        }
      }
    }

    // Enter room
    console.log('Entering live control room...');
    row = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
    if (await row.isVisible().catch(() => false)) {
      await row.click();
      await page.waitForTimeout(5000);
    }

    // Dismiss layout modal
    await page.mouse.click(598, 612).catch(() => {});
    await page.waitForTimeout(1000);

    // Read stream key
    const streamKey = await page.evaluate(() => {
      const input = document.querySelector('input[type="password"]');
      return input ? input.value : null;
    });
    console.log(`Stream key for ${channelName} is: ${streamKey}`);
    if (!streamKey) throw new Error(`Could not find stream key for ${channelName}`);

    // Update Aitum key & restart output
    updateAitumKeyOnRemote(outputName, streamKey);
    await restartAitumOutput(outputName);

    // Wait for encoder signal to arrive in YouTube Studio
    console.log('Waiting 15 seconds for OBS signal to arrive in Studio...');
    await page.waitForTimeout(15000);

    // Click "Transmituj na żywo" button
    console.log('Checking "Transmituj na żywo" button...');
    const goLiveBtn = page.locator('button:has-text("Transmituj na żywo"), #go-live-button').first();
    if (await goLiveBtn.isVisible().catch(() => false)) {
      const disabled = await goLiveBtn.getAttribute('disabled');
      console.log(`Go Live button state: disabled=${disabled}`);
      if (!disabled) {
        console.log('Clicking Transmituj na żywo!');
        await goLiveBtn.click();
        await page.waitForTimeout(2500);

        const confirmBtn = page.locator('#confirm-button, button:has-text("Rozpocznij")').first();
        if (await confirmBtn.isVisible().catch(() => false)) {
          await confirmBtn.click();
          await page.waitForTimeout(3000);
        }
      }
    }

    const safeName = channelName.replace(/[^a-zA-Z0-9]/g, '_');
    const shotPath = `C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\live_${safeName}.png`;
    await page.screenshot({ path: shotPath });
    console.log(`Saved screenshot: ${shotPath}`);

  } finally {
    await ctx.close();
  }
}
