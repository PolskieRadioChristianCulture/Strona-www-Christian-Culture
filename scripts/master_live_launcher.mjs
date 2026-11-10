/**
 * MASTER LIVE LAUNCHER — Uruchamia transmisje LIVE na wszystkich kanałach CC z miniaturą.
 * Obsługuje:
 *  - Kanały już LIVE → tylko upload miniatury do bieżącej transmisji
 *  - Kanały nowe → kreator wizard + miniatura + start OBS output
 * Uruchamia sekwencyjnie, jeden po drugim (jeden profil Chrome).
 */
import { chromium } from 'playwright';
import { execSync } from 'child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const THUMBNAIL_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\thumbnail_cc.jpg';
const OBS_HOST = '192.168.50.217';
const OBS_PORT = 4455;
const OBS_PASS = '6qPcL0sXrVvs6sPN';
const RESULTS_LOG = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\launch_log.json';

// ============ OBS WebSocket ============
async function restartAitumOutput(outputName) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://${OBS_HOST}:${OBS_PORT}`);
    const timer = setTimeout(() => { ws.close(); reject(new Error(`Timeout: ${outputName}`)); }, 20000);
    function send(type, data = {}) {
      return new Promise((res, rej) => {
        const id = crypto.randomUUID();
        const t = setTimeout(() => rej(new Error('timeout ' + type)), 8000);
        const h = (e) => {
          const m = JSON.parse(e.data);
          if (m.op === 7 && m.d.requestId === id) {
            clearTimeout(t); ws.removeEventListener('message', h);
            if (m.d.requestStatus.result) res(m.d.responseData);
            else rej(new Error(m.d.requestStatus.comment || 'OBS fail'));
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
        await send('TriggerHotkeyByName', { hotkeyName: `AitumStreamSuiteStopOutput${outputName}` }).catch(() => {});
        await new Promise(r => setTimeout(r, 2500));
        await send('TriggerHotkeyByName', { hotkeyName: `AitumStreamSuiteStartOutput${outputName}` });
        await new Promise(r => setTimeout(r, 2500));
        clearTimeout(timer); ws.close(); resolve();
      }
    };
    ws.onerror = (err) => { clearTimeout(timer); ws.close(); reject(err); };
  });
}

function updateAitumKeyRemote(outputName, streamKey) {
  const psScript = `
    $profilesDir = "C:\\\\Users\\\\nazir\\\\AppData\\\\Roaming\\\\obs-studio\\\\basic\\\\profiles"
    $profiles = Get-ChildItem $profilesDir -Directory
    foreach ($dir in $profiles) {
        $p = Join-Path $dir.FullName "aitum.json"
        if (Test-Path $p) {
            $raw = Get-Content $p -Raw -Encoding UTF8
            if ($raw[0] -eq [char]0xFEFF) { $raw = $raw.Substring(1) }
            $j = $raw | ConvertFrom-Json
            $found = $false
            foreach ($out in $j.outputs) {
                if ($out.name -eq "${outputName}") {
                    $out.stream_key = "${streamKey}"
                    if ($out.video_encoders -and $out.video_encoders.Count -gt 0) {
                        $out.video_encoders[0].stream_key = "${streamKey}"
                    }
                    $found = $true
                }
            }
            if ($found) { $j | ConvertTo-Json -Depth 10 | Set-Content $p -Encoding UTF8 }
        }
    }
    Write-Output "Updated ${outputName}"
  `;
  const localPs = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\temp_key.ps1';
  fs.writeFileSync(localPs, psScript, 'utf8');
  execSync(`scp "${localPs}" cc-nadajnik:C:/Users/nazir/a007/temp_key.ps1`, { stdio: 'pipe' });
  execSync('ssh cc-nadajnik "powershell -ExecutionPolicy Bypass -File C:\\\\Users\\\\nazir\\\\a007\\\\temp_key.ps1"', { stdio: 'pipe' });
  console.log(`  ✅ Aitum key updated for ${outputName}`);
}

// ============ YouTube Studio helpers ============
async function switchToChannel(page, channelHandle) {
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(1500);
  const item = page.locator('ytd-account-item-renderer', { hasText: channelHandle.replace('@', '') }).first();
  if (!await item.count()) throw new Error(`Nie znaleziono kanału: ${channelHandle}`);
  await item.click();
  await page.waitForTimeout(5000);
}

async function openManage(page, channelId) {
  await page.goto(`https://studio.youtube.com/channel/${channelId}/livestreaming/manage?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  // Pass browser gate if needed
  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) { await gate.click(); await page.waitForTimeout(4000); }
}

async function resolveChannelId(page, handle) {
  await page.goto(`https://www.youtube.com/${encodeURI(handle)}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  const id = await page.evaluate(() =>
    document.querySelector('meta[itemprop="identifier"], meta[itemprop="channelId"]')?.content ||
    (document.querySelector('link[rel="canonical"]')?.href.match(/channel\/(UC[\w-]+)/) || [])[1] || null);
  return id;
}

async function uploadThumbnail(page, thumbnailPath) {
  try {
    // Click Edytuj button in the room
    const editBtn = page.locator('#edit-button, button:has-text("Edytuj")').first();
    if (!await editBtn.isVisible().catch(() => false)) {
      console.log('  ⚠️  Edit button not visible for thumbnail upload');
      return false;
    }
    await editBtn.click();
    await page.waitForTimeout(2000);

    // Look for thumbnail upload button
    const thumbUpload = page.locator('input[type="file"][accept*="image"]').first();
    if (await thumbUpload.isVisible().catch(() => false)) {
      await thumbUpload.setInputFiles(thumbnailPath);
      await page.waitForTimeout(3000);
      console.log('  🖼️  Thumbnail uploaded via input[type=file]');
    } else {
      // Try clicking thumbnail section
      const thumbSection = page.locator('[class*="thumbnail"], ytcp-thumbnail-with-preview, #thumbnail-section').first();
      if (await thumbSection.isVisible().catch(() => false)) {
        await thumbSection.click();
        await page.waitForTimeout(1000);
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.isVisible().catch(() => false)) {
          await fileInput.setInputFiles(thumbnailPath);
          await page.waitForTimeout(3000);
          console.log('  🖼️  Thumbnail uploaded via thumbnail section');
        }
      }
    }

    // Save
    const saveBtn = page.locator('#save-button, button:has-text("Zapisz"), ytcp-button:has-text("Zapisz")').first();
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(3000);
      console.log('  💾 Saved');
      return true;
    }

    // Close modal if no save
    const closeBtn = page.locator('#close-button, button:has-text("Zamknij")').first();
    if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click().catch(() => {});
    return false;
  } catch (err) {
    console.log(`  ⚠️  Thumbnail upload error: ${err.message}`);
    return false;
  }
}

async function createAndLaunch(page, ch) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📺 Kanał: ${ch.channelName} (${ch.handle})`);
  console.log(`${'='.repeat(60)}`);

  // Switch to right identity
  console.log(`  → Switching to ${ch.via}...`);
  await switchToChannel(page, ch.via);

  // Resolve channel ID if needed
  let channelId = ch.id && !ch.id.startsWith('UC_placeholder') ? ch.id : null;
  if (!channelId) {
    console.log(`  → Resolving channel ID for ${ch.handle}...`);
    channelId = await resolveChannelId(page, ch.handle);
    if (!channelId) throw new Error(`Could not resolve channel ID for ${ch.handle}`);
    console.log(`  → Channel ID: ${channelId}`);
  }

  // Open manage
  await openManage(page, channelId);

  if (ch.alreadyLive) {
    // Enter room and upload thumbnail
    console.log(`  → Already LIVE. Entering room to upload thumbnail...`);
    const row = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
    if (await row.isVisible().catch(() => false)) {
      await row.click();
      await page.waitForTimeout(5000);
      await page.mouse.click(598, 612).catch(() => {});
      await page.waitForTimeout(1000);
      await uploadThumbnail(page, THUMBNAIL_PATH);
    } else {
      console.log('  ⚠️  No broadcast row visible for thumbnail upload');
    }
    return { channel: ch.channelName, handle: ch.handle, status: 'LIVE (thumbnail only)', channelId };
  }

  // Create broadcast if no row
  const row = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
  const hasRow = await row.isVisible().catch(() => false);

  if (!hasRow) {
    console.log(`  → Creating new broadcast...`);
    const schedBtn = page.locator('#schedule-stream-button, button:has-text("Zaplanuj transmisję")').first();
    if (!await schedBtn.isVisible().catch(() => false)) {
      console.log(`  ❌ Schedule button not found!`);
      return { channel: ch.channelName, handle: ch.handle, status: 'ERROR: No schedule button', channelId };
    }
    await schedBtn.click();
    await page.waitForTimeout(3000);

    const createNew = page.locator('button:has-text("Utwórz nowe")').first();
    if (await createNew.isVisible().catch(() => false)) { await createNew.click(); await page.waitForTimeout(2000); }

    // Type title
    console.log(`  → Typing title: ${ch.title}...`);
    await page.mouse.click(400, 335);
    await page.waitForTimeout(500);
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type(ch.title);
    await page.waitForTimeout(1000);

    // Not for kids
    const notForKids = page.locator('tp-yt-paper-radio-button:has-text("przeznaczone dla dzieci")').last();
    if (await notForKids.isVisible().catch(() => false)) { await notForKids.click(); await page.waitForTimeout(500); }

    // Dalej 1
    let nextBtn = page.locator('#next-button, button:has-text("Dalej")').first();
    if (await nextBtn.isVisible().catch(() => false)) await nextBtn.click();
    else await page.mouse.click(1220, 880);
    await page.waitForTimeout(2500);

    // Dalej 2
    nextBtn = page.locator('#next-button, button:has-text("Dalej")').first();
    if (await nextBtn.isVisible().catch(() => false)) await nextBtn.click();
    else await page.mouse.click(1220, 880);
    await page.waitForTimeout(2500);

    // Dalej 3 (if present)
    nextBtn = page.locator('#next-button, button:has-text("Dalej")').first();
    if (await nextBtn.isVisible().catch(() => false)) { await nextBtn.click(); await page.waitForTimeout(2500); }

    // Select Publiczny
    console.log(`  → Selecting Publiczny...`);
    const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
    if (await pubRadio.isVisible().catch(() => false)) { await pubRadio.click(); await page.waitForTimeout(1000); }

    // Gotowe
    console.log(`  → Clicking Gotowe...`);
    const doneBtn = page.locator('#done-button, button:has-text("Gotowe"), ytcp-button:has-text("Gotowe")').first();
    if (await doneBtn.isVisible().catch(() => false)) await doneBtn.click();
    else await page.mouse.click(1220, 880);
    await page.waitForTimeout(8000);
  }

  // Check if Niepubliczny → publish
  const niepub = page.locator('text=Niepublicz').first();
  if (await niepub.isVisible().catch(() => false)) {
    console.log(`  → Publishing from Niepubliczny → Publiczny...`);
    await niepub.click();
    await page.waitForTimeout(1500);
    const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first();
    if (await pubRadio.isVisible().catch(() => false)) { await pubRadio.click(); await page.waitForTimeout(1000); }
    const saveBtn = page.locator('tp-yt-paper-dialog #save-button').first();
    if (await saveBtn.isVisible().catch(() => false)) { await saveBtn.click(); await page.waitForTimeout(4000); }
  }

  // Enter room
  console.log(`  → Entering broadcast room...`);
  const rowFresh = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
  if (await rowFresh.isVisible().catch(() => false)) {
    await rowFresh.click();
    await page.waitForTimeout(6000);
  } else {
    await page.mouse.click(300, 350);
    await page.waitForTimeout(5000);
  }

  // Dismiss layout prompt
  await page.mouse.click(598, 612).catch(() => {});
  await page.waitForTimeout(1500);

  // Read stream key
  console.log(`  → Extracting stream key...`);
  let streamKey = await page.evaluate(() => {
    const inp = document.querySelector('input[type="password"]');
    return inp ? inp.value : null;
  });
  if (!streamKey) {
    const eye = page.locator('ytcp-icon-button[aria-label*="Pokaż"], #toggle-button').first();
    if (await eye.isVisible().catch(() => false)) { await eye.click(); await page.waitForTimeout(1000); }
    streamKey = await page.evaluate(() => {
      const inp = document.querySelector('input[type="text"][aria-label*="Klucz"], input[type="text"][value*="-"]');
      return inp ? inp.value : null;
    });
  }
  if (!streamKey) {
    // Try copy button
    const copyBtn = page.locator('button:has-text("Kopiuj"), #copy-button').first();
    if (await copyBtn.isVisible().catch(() => false)) {
      await copyBtn.click();
      await page.waitForTimeout(500);
    }
  }
  console.log(`  → Stream key: ${streamKey || 'NOT FOUND'}`);

  // Upload thumbnail
  console.log(`  → Uploading thumbnail...`);
  await uploadThumbnail(page, THUMBNAIL_PATH);

  // Update Aitum + restart output
  if (ch.aitumOutput && streamKey) {
    console.log(`  → Updating Aitum output "${ch.aitumOutput}"...`);
    try {
      updateAitumKeyRemote(ch.aitumOutput, streamKey);
      await restartAitumOutput(ch.aitumOutput);
      console.log(`  ✅ OBS output "${ch.aitumOutput}" restarted`);
    } catch (err) {
      console.log(`  ⚠️  OBS/Aitum error: ${err.message}`);
    }
  }

  // Wait for signal
  console.log(`  → Waiting 15s for stream signal...`);
  await page.waitForTimeout(15000);

  // Click Transmituj na żywo
  console.log(`  → Clicking Transmituj na żywo...`);
  const goLive = page.locator('button:has-text("Transmituj na żywo"), #go-live-button').first();
  if (await goLive.isVisible().catch(() => false)) {
    await goLive.click({ force: true });
    await page.waitForTimeout(2000);
    const confirm = page.locator('#confirm-button, button:has-text("Rozpocznij")').first();
    if (await confirm.isVisible().catch(() => false)) { await confirm.click({ force: true }); await page.waitForTimeout(3000); }
    console.log(`  🟢 LIVE button clicked!`);
  } else {
    console.log(`  ⚠️  Transmituj na żywo button not visible`);
  }

  return { channel: ch.channelName, handle: ch.handle, status: 'LAUNCHED', channelId, streamKey };
}

// ============ MAIN ============
async function main() {
  const { ALL_CHANNELS } = await import('./all_channels_config.mjs');

  const toProcess = ALL_CHANNELS; // Przetwarza wszystkie — już LIVE dostają miniaturę
  const results = [];

  let ctx = null;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
        headless: true, channel: 'chrome',
        viewport: { width: 1600, height: 1000 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
      });
      break;
    } catch (err) {
      if (err.message.includes('ProcessSingleton') && attempt < 4) {
        console.log(`[Retry ${attempt}] Waiting for profile...`);
        await new Promise(r => setTimeout(r, 4000));
      } else throw err;
    }
  }

  const page = ctx.pages()[0] || await ctx.newPage();

  for (const ch of toProcess) {
    try {
      const result = await createAndLaunch(page, ch);
      results.push(result);
      console.log(`\n✅ ${ch.channelName}: ${result.status}\n`);
    } catch (err) {
      console.error(`\n❌ ${ch.channelName}: ERROR — ${err.message}\n`);
      results.push({ channel: ch.channelName, handle: ch.handle, status: `ERROR: ${err.message}` });
    }
    // Short pause between channels
    await page.waitForTimeout(2000);
  }

  await ctx.close();

  console.log('\n\n========== WYNIKI KOŃCOWE ==========');
  for (const r of results) {
    const icon = r.status.includes('ERROR') ? '❌' : (r.status.includes('LIVE') ? '🟢' : '🟡');
    console.log(`${icon} ${(r.channel || '?').padEnd(35)} | ${r.status}`);
  }

  fs.writeFileSync(RESULTS_LOG, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nLog zapisany: ${RESULTS_LOG}`);
}

main().catch(console.error);
