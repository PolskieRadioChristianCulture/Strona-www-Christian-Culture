import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const THUMBNAIL_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\thumbnail_tvw_live.jpg';
const STREAM_TITLE = 'Poznaj Słowo, Które Odmieni Twoje Życie • UWIELBIENIE • INSPIRACJA • MODLITWA 🔴 LIVE 24/7';
const CHANNEL_NAME = 'Christian Culture TV';
const AITUM_OUTPUT = 'CC TV';

const DESCRIPTION = 
`🕊️ POZNAJ SŁOWO, KTÓRE ODMIENI TWOJE ŻYCIE • LIVE 24/7
Dołącz do wspólnego uwielbienia, modlitwy i zanurzenia w Żywym Słowie Bożym.
Każdego dnia odkrywaj Boży pokój, nadzieję i siłę w Chrystusie.

🙏 WESPRZYJ MISJĘ CHRISTIAN CULTURE:
Jeśli to Słowo i modlitwa wnoszą pokój do Twojego serca, pomóż nam budować niezależne chrześcijańskie media w Polsce:
👉 https://polskieradio.cc/wspieraj (BLIK, karta, szybki przelew)

Dołącz do społeczności i korzystaj z narzędzi wiary:
📱 Portal LUMINA: https://polskieradio.cc/lumina
📖 Biblia Interlinearna: https://polskieradio.cc/mojabiblia
🎧 Chrześcijańskie Radio i Słuchowiska: https://polskieradio.cc/player

#ChristianCulture #SlowoBoze #Uwielbienie #Modlitwa #Biblia #Wiara #Live247`;

async function updateNadajnikKey(outputName, key) {
  console.log(`[OBS Update] Updating stream key for output "${outputName}" to: ${key}...`);
  // Update aitum.json
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
                Write-Output "Updated aitum.json in: $p"
            }
        }
    }
    # Also update service.json for main stream
    $s = "C:\\Users\\nazir\\AppData\\Roaming\\obs-studio\\basic\\profiles\\Bez_tytułu\\service.json"
    if (Test-Path $s) {
        $sj = @{ type = "rtmp_custom"; settings = @{ server = "rtmp://a.rtmp.youtube.com/live2"; key = "${key}"; use_auth = $false; bwtest = $false } }
        $sj | ConvertTo-Json | Set-Content $s -Encoding UTF8
        Write-Output "Updated service.json!"
    }
  `;
  const tempScriptPath = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\temp_update_key.ps1';
  fs.writeFileSync(tempScriptPath, psCode, 'utf8');
  execSync(`scp "${tempScriptPath}" cc-nadajnik:C:/Users/nazir/a007/temp_update_key.ps1`, { stdio: 'inherit' });
  execSync(`ssh cc-nadajnik "powershell -ExecutionPolicy Bypass -File C:\\Users\\nazir\\a007\\temp_update_key.ps1"`, { stdio: 'inherit' });
}

function restartOBSOutputs(outputName) {
  return new Promise((resolve, reject) => {
    console.log(`[OBS WS] Connecting to OBS WebSocket on cc-nadajnik...`);
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
        // Restart main stream
        console.log('Stopping and restarting main stream (adv_stream)...');
        await send('StopStream').catch(() => {});
        await new Promise(r => setTimeout(r, 2000));
        await send('StartStream').catch(e => console.log('StartStream note:', e.message));

        // Restart Aitum output
        console.log(`Restarting Aitum output: ${outputName}...`);
        await send('TriggerHotkeyByName', { hotkeyName: `AitumStreamSuiteStopOutput${outputName}` }).catch(() => {});
        await new Promise(r => setTimeout(r, 2000));
        await send('TriggerHotkeyByName', { hotkeyName: `AitumStreamSuiteStartOutput${outputName}` }).catch(e => console.log('Aitum start note:', e.message));
        await new Promise(r => setTimeout(r, 2000));

        console.log(`Restart complete!`);
        ws.close();
        resolve();
      }
    };
    ws.onerror = reject;
  });
}

async function main() {
  console.log(`=== Setting up LIVE broadcast for ${CHANNEL_NAME} ===`);
  const { ctx, page } = await launchStudio({ headless: true });

  const channelId = await openChannelStudio(page, CHANNEL_NAME, '/livestreaming/manage');
  console.log(`Studio opened for channel ${CHANNEL_NAME} (${channelId})`);
  await page.waitForTimeout(5000);

  // Dismiss any confirmation modals if present
  const leaveBtn = page.locator('button:has-text("Wyjdź"), #confirm-button').first();
  if (await leaveBtn.isVisible().catch(() => false)) {
    console.log('Dismissing leave modal...');
    await leaveBtn.click();
    await page.waitForTimeout(2000);
  }

  // Click "Zaplanuj transmisję"
  console.log('Clicking "Zaplanuj transmisję"...');
  const schedBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję"), #schedule-stream-button').first();
  await schedBtn.click();
  await page.waitForTimeout(3000);

  // If "Utwórz nowe" modal appears
  const createNewBtn = page.locator('button:has-text("Utwórz nowe"), ytcp-button:has-text("Utwórz nowe")').first();
  if (await createNewBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log('Clicking "Utwórz nowe"...');
    await createNewBtn.click();
    await page.waitForTimeout(2500);
  }

  // Step 1: Title
  console.log('Filling title:', STREAM_TITLE);
  const titleInput = page.locator('#textbox, input[name="title"], textarea').first();
  if (await titleInput.isVisible().catch(() => false)) {
    await titleInput.fill(STREAM_TITLE);
    await page.waitForTimeout(1000);
  }

  // Description
  const descInput = page.locator('#description-textarea, #textbox[aria-label*="opis"], textarea[name="description"]').first();
  if (await descInput.isVisible().catch(() => false)) {
    await descInput.fill(DESCRIPTION);
    await page.waitForTimeout(1000);
  }

  // Thumbnail upload
  console.log('Uploading thumbnail:', THUMBNAIL_PATH);
  const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null);
  const uploadThumbBtn = page.locator('button:has-text("Prześlij miniaturę"), ytcp-button:has-text("Prześlij miniaturę"), #upload-button, [aria-label*="miniatur"]').first();
  if (await uploadThumbBtn.isVisible().catch(() => false)) {
    await uploadThumbBtn.click();
    const fileChooser = await fileChooserPromise;
    if (fileChooser) {
      await fileChooser.setFiles(THUMBNAIL_PATH);
      console.log('Thumbnail set via filechooser!');
      await page.waitForTimeout(3000);
    }
  } else {
    // Try file input directly
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count()) {
      await fileInput.setInputFiles(THUMBNAIL_PATH);
      console.log('Thumbnail set via file input!');
      await page.waitForTimeout(3000);
    }
  }

  // Not made for kids
  const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
  if (await notForKids.isVisible().catch(() => false)) {
    await notForKids.click();
    await page.waitForTimeout(1000);
  }

  // Wizard steps -> Next
  for (let step = 1; step <= 3; step++) {
    console.log(`Advancing wizard step ${step}...`);
    const nextBtn = page.locator('#next-button, button:has-text("Dalej"), ytcp-button:has-text("Dalej")').first();
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(2500);
    }
  }

  // Visibility: Publiczny
  console.log('Selecting Publiczny visibility...');
  const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
  if (await pubRadio.isVisible().catch(() => false)) {
    await pubRadio.click();
    await page.waitForTimeout(1000);
  }

  // Gotowe / Zapisz
  console.log('Finishing schedule wizard...');
  const doneBtn = page.locator('#done-button, button:has-text("Gotowe"), ytcp-button:has-text("Gotowe"), button:has-text("Zapisz")').first();
  if (await doneBtn.isVisible().catch(() => false)) {
    await doneBtn.click();
    await page.waitForTimeout(7000);
  }

  // If on manage page, open the newly scheduled stream room
  if (page.url().includes('/manage')) {
    console.log('Opening newly scheduled stream room...');
    const rowTitle = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
    await rowTitle.click();
    await page.waitForTimeout(7000);
  }

  console.log('Current room URL:', page.url());
  const vidMatch = page.url().match(/\/video\/([^\/]+)\/livestreaming/);
  const newVid = vidMatch ? vidMatch[1] : null;
  console.log('New Broadcast Video ID:', newVid);

  // Dismiss modal if present
  await page.mouse.click(600, 600);
  await page.waitForTimeout(1000);

  // Turn ON Auto-start and Auto-stop
  console.log('Enabling Auto-start and Auto-stop toggles...');
  const toggles = await page.locator('tp-yt-paper-toggle-button').all();
  for (const t of toggles) {
    const txt = (await t.innerText().catch(() => '')).trim();
    const isChecked = await t.evaluate(el => el.getAttribute('aria-checked') === 'true' || el.hasAttribute('checked'));
    if ((txt.includes('automatyczne uruchamianie') || txt.includes('automatyczne zatrzymywanie')) && !isChecked) {
      console.log(`Enabling: ${txt}...`);
      await t.click();
      await page.waitForTimeout(1000);
    }
  }

  // Read the stream key
  const streamKey = await page.evaluate(() => {
    function walk(node) {
      if (!node) return null;
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.value && node.value.length > 10 && !node.value.startsWith('http')) {
          return node.value;
        }
        if (node.shadowRoot) {
          const res = walk(node.shadowRoot);
          if (res) return res;
        }
      }
      for (let ch = node.firstChild; ch; ch = ch.nextSibling) {
        const res = walk(ch);
        if (res) return res;
      }
      return null;
    }
    return walk(document.body);
  });
  console.log('EXTRACTED STREAM KEY:', streamKey);

  await page.screenshot({ path: `C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/new_room_${newVid || 'cctv'}.png` });
  await ctx.close();

  if (streamKey) {
    await updateNadajnikKey(AITUM_OUTPUT, streamKey);
    await restartOBSOutputs(AITUM_OUTPUT);
    console.log('Waiting 15s for RTMP handshake and YouTube Auto-Start to trigger...');
    await new Promise(r => setTimeout(r, 15000));

    if (newVid) {
      console.log(`\nVerifying public broadcast: https://www.youtube.com/watch?v=${newVid}`);
      const res = await fetch(`https://www.youtube.com/watch?v=${newVid}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const html = await res.text();
      const playability = html.match(/"playabilityStatus":\{"status":"([^"]+)"/)?.[1];
      const isLiveNow = html.includes('"isLiveNow":true');
      console.log(`PUBLIC VERIFICATION: playabilityStatus=${playability}, isLiveNow=${isLiveNow}`);
    }
  }
}

main().catch(console.error);
