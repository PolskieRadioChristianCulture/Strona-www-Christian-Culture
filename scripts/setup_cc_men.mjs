import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
import { execSync } from 'node:child_process';
import crypto from 'node:crypto';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  console.log('1. Opening CC Men manage page...');
  await openChannelStudio(page, 'CC Men', '/livestreaming/manage');
  await page.waitForTimeout(5000);

  // Check if scheduled row exists
  let row = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
  if (!(await row.isVisible().catch(() => false))) {
    console.log('Clicking Zaplanuj transmisję...');
    const schedBtn = page.locator('button:has-text("Zaplanuj transmisję"), #schedule-stream-button').first();
    await schedBtn.click();
    await page.waitForTimeout(2500);

    const reuseBtn = page.locator('button:has-text("Użyj poprzednich ustawień")').first();
    if (await reuseBtn.isVisible().catch(() => false)) {
      console.log('Clicking Użyj poprzednich ustawień...');
      await reuseBtn.click();
      await page.waitForTimeout(2500);
    } else {
      const createNew = page.locator('button:has-text("Utwórz nowe")').first();
      if (await createNew.isVisible().catch(() => false)) {
        await createNew.click();
        await page.waitForTimeout(2000);
      }
    }

    // Step 1: Dalej
    console.log('Clicking Dalej step 1 at (1220, 880)...');
    await page.mouse.click(1220, 880);
    await page.waitForTimeout(2000);

    // Step 2: Dalej
    console.log('Clicking Dalej step 2 at (1220, 880)...');
    await page.mouse.click(1220, 880);
    await page.waitForTimeout(2000);

    // Step 3: Visibility Publiczny
    console.log('Selecting Publiczny in step 3...');
    const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
    if (await pubRadio.isVisible().catch(() => false)) {
      await pubRadio.click();
      await page.waitForTimeout(1000);
    }

    // Finish Gotowe
    console.log('Clicking Gotowe at (1220, 880)...');
    await page.mouse.click(1220, 880);
    await page.waitForTimeout(6000);
  }

  // Open the room
  row = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
  if (await row.isVisible().catch(() => false)) {
    console.log('Opening room...');
    await row.click();
    await page.waitForTimeout(5000);
  }

  // Dismiss layout modal
  await page.mouse.click(598, 612);
  await page.waitForTimeout(1000);

  // Read stream key
  const streamKey = await page.evaluate(() => {
    const input = document.querySelector('input[type="password"]');
    return input ? input.value : null;
  });
  console.log('Stream key for CC Men is:', streamKey);

  // Ensure Auto-start is ON
  for (const t of await page.locator('tp-yt-paper-toggle-button').all()) {
    const txt = (await t.innerText()).trim();
    const isChecked = await t.evaluate(el => el.getAttribute('aria-checked') === 'true' || el.hasAttribute('checked'));
    if ((txt.includes('automatyczne uruchamianie') || txt.includes('automatyczne zatrzymywanie')) && !isChecked) {
      console.log(`Enabling ${txt}...`);
      await t.click();
      await page.waitForTimeout(1000);
    }
  }

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\cc_men_room.png' });
  await ctx.close();

  if (!streamKey) throw new Error('No stream key found for CC Men');

  // Update on cc-nadajnik
  console.log('Updating CC MEN key on cc-nadajnik...');
  const psScript = `
    $profilesDir = "C:\\Users\\nazir\\AppData\\Roaming\\obs-studio\\basic\\profiles"
    $profiles = Get-ChildItem $profilesDir -Directory
    foreach ($dir in $profiles) {
        $p = Join-Path $dir.FullName "aitum.json"
        if (Test-Path $p) {
            $raw = Get-Content $p -Raw -Encoding UTF8 | ConvertFrom-Json
            $found = $false
            foreach ($out in $raw.outputs) {
                if ($out.name -eq "CC MEN") {
                    $out.stream_key = "${streamKey}"
                    $found = $true
                }
            }
            if ($found) {
                $raw | ConvertTo-Json -Depth 10 | Set-Content $p -Encoding UTF8
            }
        }
    }
    Write-Output "Updated CC MEN key."
  `;
  import('node:fs').then(fs => fs.writeFileSync('C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\temp_men.ps1', psScript, 'utf8'));
  execSync('scp "C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\temp_men.ps1" cc-nadajnik:C:/Users/nazir/a007/temp_men.ps1', { stdio: 'inherit' });
  execSync('ssh cc-nadajnik "powershell -ExecutionPolicy Bypass -File C:\\Users\\nazir\\a007\\temp_men.ps1"', { stdio: 'inherit' });

  // Restart Aitum output CC MEN
  console.log('Restarting CC MEN output via OBS WebSocket...');
  const ws = new WebSocket('ws://192.168.50.217:4455');
  await new Promise((resolve, reject) => {
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
        console.log('Stopping output: CC MEN...');
        await send('TriggerHotkeyByName', { hotkeyName: 'AitumStreamSuiteStopOutputCC MEN' }).catch(e => console.log('Stop note:', e.message));
        await new Promise(r => setTimeout(r, 2000));

        console.log('Starting output: CC MEN...');
        await send('TriggerHotkeyByName', { hotkeyName: 'AitumStreamSuiteStartOutputCC MEN' });
        await new Promise(r => setTimeout(r, 2000));

        console.log('Restarted CC MEN output successfully.');
        ws.close();
        resolve();
      }
    };
    ws.onerror = reject;
  });
}

main().catch(console.error);
