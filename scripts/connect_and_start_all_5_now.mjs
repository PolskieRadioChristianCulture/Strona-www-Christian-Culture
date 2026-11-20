import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
import { execSync } from 'node:child_process';

function unlockProfile() {
  try {
    const cmd = `powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name='chrome.exe'\\" | Select-Object ProcessId,CommandLine | ConvertTo-Json -Compress"`;
    const raw = execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (!raw) return;
    const list = JSON.parse(raw);
    const items = Array.isArray(list) ? list : [list];
    for (const proc of items) {
      if (proc && proc.CommandLine && proc.CommandLine.includes('.youtube_browser_profile')) {
        console.log(`Zwalniam osierocony proces Chrome (PID ${proc.ProcessId})...`);
        try { process.kill(proc.ProcessId, 'SIGKILL'); } catch {}
      }
    }
  } catch (e) {}
}

const CHANNELS = [
  { name: 'Robert Łukasz Pio', videoId: '3v9Dnwidgjk' },
  { name: 'Osobowość +', videoId: 'DTEt2rW_YH4' },
  { name: 'Christian Culture TV', videoId: '7w4bIOba5Z4' },
  { name: 'Polskie Radio CHRISTIAN CULTURE', videoId: '2IrFZMYWQiA' },
  { name: 'CC Women', videoId: 'uHDqU-rlzsg' }
];

const ART_DIR = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';

async function activateChannel(page, ch) {
  console.log(`\n======================================================`);
  console.log(`▶ AKTYWUJĘ TRANSMISJĘ WSTĘPNĄ DLA: ${ch.name} (${ch.videoId})`);
  console.log(`======================================================`);

  await openChannelStudio(page, ch.name, '/livestreaming/manage');
  await page.waitForTimeout(3000);

  await page.goto(`https://studio.youtube.com/video/${ch.videoId}/livestreaming`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(6000);

  // 1. Sprawdź czy już nadaje na żywo
  const endBtn = page.locator('button, ytcp-button').filter({ hasText: /Zakończ transmisję/ }).first();
  if (await endBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log(`[${ch.name}] ✅ Transmisja JUŻ TRWA NA ŻYWO!`);
    const safe = ch.name.replace(/[^a-zA-Z0-9]/g, '_');
    await page.screenshot({ path: `${ART_DIR}/live_active_${safe}.png` });
    return { channel: ch.name, videoId: ch.videoId, status: 'ALREADY_LIVE' };
  }

  // 2. Sprawdź wybór klucza strumienia
  const trigger = page.locator('ytls-ingestion-dropdown-trigger-renderer, [id="prefix"]:has-text("Klucz:")').first();
  const triggerText = await trigger.innerText().catch(() => '');
  console.log(`[${ch.name}] Obecny klucz w pokoju: "${triggerText.trim()}"`);

  if (triggerText.includes('Wybierz klucz') || triggerText.includes('Wybierz') || !(await page.locator('body').innerText()).includes('Doskonały')) {
    console.log(`[${ch.name}] Otwieram listę kluczy strumienia...`);
    await trigger.click().catch(() => {});
    await page.waitForTimeout(2000);

    const defaultOption = page.locator('tp-yt-paper-item').filter({ hasText: /Default stream key|Domyślny klucz/i }).first();
    if (await defaultOption.isVisible({ timeout: 2500 }).catch(() => false)) {
      await defaultOption.click();
      console.log(`[${ch.name}] ✅ Wybrano Default stream key!`);
      await page.waitForTimeout(7000);
    } else {
      // Jeśli nie ma "Default stream key", wybierz pierwszy dostępny klucz RTMP
      const firstRtmp = page.locator('tp-yt-paper-item').filter({ hasText: /\(RTMP/i }).first();
      if (await firstRtmp.isVisible({ timeout: 2500 }).catch(() => false)) {
        const keyName = await firstRtmp.innerText();
        await firstRtmp.click();
        console.log(`[${ch.name}] ✅ Wybrano klucz RTMP: ${keyName.trim()}`);
        await page.waitForTimeout(7000);
      }
    }
  }

  // 3. Włącz przełączniki Auto-start i Auto-stop (gdy są już widoczne po podpięciu klucza)
  const toggles = page.locator('tp-yt-paper-toggle-button');
  const tCount = await toggles.count();
  for (let i = 0; i < tCount; i++) {
    const t = toggles.nth(i);
    const txt = (await t.innerText().catch(() => '')).trim();
    const isChecked = await t.evaluate(el => el.getAttribute('aria-checked') === 'true' || el.hasAttribute('checked')).catch(() => false);
    if (txt.includes('automatyczne uruchamianie') && !isChecked) {
      console.log(`[${ch.name}] Włączam Auto-start...`);
      await t.click().catch(() => {});
      await page.waitForTimeout(1000);
      // Potwierdź modal jeśli wyskoczy
      const confirmToggle = page.locator('ytcp-dialog button, ytcp-confirmation-dialog button').filter({ hasText: /Włącz|Potwierdź|OK/i }).first();
      if (await confirmToggle.isVisible({ timeout: 1500 }).catch(() => false)) {
        await confirmToggle.click().catch(() => {});
        await page.waitForTimeout(1000);
      }
    }
    if (txt.includes('automatyczne zatrzymywanie') && !isChecked) {
      console.log(`[${ch.name}] Włączam Auto-stop...`);
      await t.click().catch(() => {});
      await page.waitForTimeout(1000);
    }
  }

  // 4. Poczekaj aż przycisk "Transmituj na żywo" stanie się aktywny (lub transmisja sama ruszy dzięki Auto-start)
  let isLiveNow = false;
  for (let attempt = 1; attempt <= 8; attempt++) {
    if (await endBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      console.log(`[${ch.name}] ✅ Transmisja ruszyła automatycznie (widoczny przycisk Zakończ transmisję)!`);
      isLiveNow = true;
      break;
    }

    const goLiveBtn = page.locator('button, ytcp-button').filter({ hasText: /^Transmituj na żywo$/ }).first();
    const isEnabled = await goLiveBtn. evaluate(el => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true').catch(() => false);
    if (await goLiveBtn.isVisible().catch(() => false) && isEnabled) {
      console.log(`[${ch.name}] Klikam "Transmituj na żywo" (próba ${attempt})...`);
      await goLiveBtn.click({ force: true });
      await page.waitForTimeout(3000);

      const modalConfirm = page.locator('ytcp-dialog button, ytcp-confirmation-dialog button, #confirm-button').filter({ hasText: /Transmituj na żywo|Rozpocznij/i }).last();
      if (await modalConfirm.isVisible({ timeout: 2500 }).catch(() => false)) {
        console.log(`[${ch.name}] Potwierdzam w oknie dialogowym...`);
        await modalConfirm.click({ force: true });
        await page.waitForTimeout(3000);
      }
    } else {
      console.log(`[${ch.name}] Oczekiwanie na sygnał z kodera OBS (${attempt}/8)...`);
      await page.waitForTimeout(3000);
    }
  }

  await page.waitForTimeout(4000);
  if (await endBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    isLiveNow = true;
  }

  const safe = ch.name.replace(/[^a-zA-Z0-9]/g, '_');
  const shotPath = `${ART_DIR}/live_active_${safe}.png`;
  await page.screenshot({ path: shotPath }).catch(() => {});
  console.log(`[${ch.name}] Stan końcowy: ${isLiveNow ? '🔴 NA ŻYWO (LIVE)' : '⏳ W PODGLĄDZIE'} | Screenshot: ${shotPath}`);

  return {
    channel: ch.name,
    videoId: ch.videoId,
    watchUrl: `https://youtube.com/live/${ch.videoId}`,
    status: isLiveNow ? 'LIVE_NOW' : 'PREVIEW_ONLY'
  };
}

async function main() {
  unlockProfile();
  await new Promise(r => setTimeout(r, 1500));
  const { ctx, page } = await launchStudio({ headless: true });
  const results = [];

  try {
    for (const ch of CHANNELS) {
      try {
        const res = await activateChannel(page, ch);
        results.push(res);
      } catch (err) {
        console.error(`❌ Błąd na kanale ${ch.name}:`, err.message);
        results.push({ channel: ch.name, videoId: ch.videoId, error: err.message });
      }
    }
  } finally {
    await ctx.close();
  }

  console.log('\n======================================================');
  console.log('📊 PODSUMOWANIE AKTYWACJI TRANSMISJI WSTĘPNEJ (5 KANAŁÓW):');
  console.log(JSON.stringify(results, null, 2));
  console.log('======================================================');
}

main().catch(console.error);
