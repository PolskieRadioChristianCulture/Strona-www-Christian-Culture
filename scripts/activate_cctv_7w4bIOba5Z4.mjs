import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const THUMBNAIL_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\images\\live_2000_dlaczego_potrzebujesz_zywego_slowa.jpg';
const STREAM_TITLE = 'Dlaczego Potrzebujesz Żywego Słowa? • LIVE 20:00';
const STREAM_DESC = `🕊️ DLACZEGO POTRZEBUJESZ ŻYWEGO SŁOWA? • LIVE 20:00
Zapraszamy na wspólny wieczór wyciszenia, pokoju serca i zanurzenia w Żywym Słowie Bożym. 

„Bo Słowo Boże jest żywe i skuteczne, ostrzejsze niż wszelki miecz obosieczny...” (Hbr 4,12).
Zatrzymaj się po całym dniu, oddaj troski Bogu i pozwól, aby Jego obecność napełniła Twój dom głębokim pokojem i przemieniła Twoje serce.

🙏 WESPRZYJ MISJĘ CHRISTIAN CULTURE:
Jeśli to Słowo i modlitwa wnoszą pokój do Twojego serca, pomóż nam budować niezależne chrześcijańskie media w Polsce:
👉 https://polskieradio.cc/wspieraj (BLIK: 537 137 043, szybki przelew, karta)

🌐 ODKRYJ WIĘCEJ W EKOSYSTEMIE CHRISTIAN CULTURE:
✨ Portal Społecznościowy LUMINA: https://polskieradio.cc/lumina
📖 Pismo Święte Interlinearne: https://polskieradio.cc/mojabiblia
🎧 Chrześcijańskie Radio i Słuchowiska: https://polskieradio.cc/player
🎬 Chrześcijańskie Kino VOD: https://polskieradio.cc/vod

Błogosławionego wieczoru! Zostaw intencję modlitewną w komentarzu na czacie. Subskrybuj kanał i kliknij dzwoneczek 🔔, aby być powiadamianym o kolejnych transmisjach.

#ŻyweSłowo #SłowoBoże #DlaczegoPotrzebujeszŻywegoSłowa #Biblia #PismoŚwięte #ChristianCulture #Wiara #Modlitwa #SpokójSerca #BógJestDobry`;

const ART_DIR = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';

function unlockProfile() {
  try {
    const cmd = `powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name='chrome.exe'\\" | Select-Object ProcessId,CommandLine | ConvertTo-Json -Compress"`;
    const raw = execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (!raw) return;
    const list = JSON.parse(raw);
    const items = Array.isArray(list) ? list : [list];
    for (const proc of items) {
      if (proc && proc.CommandLine && proc.CommandLine.includes('youtube_browser_profile')) {
        console.log(`Zwalniam osierocony proces Chrome (PID ${proc.ProcessId})...`);
        try { process.kill(proc.ProcessId, 'SIGKILL'); } catch {}
      }
    }
  } catch {}
}

async function main() {
  unlockProfile();
  await new Promise(r => setTimeout(r, 1500));
  const { ctx, page } = await launchStudio({ headless: true });
  const videoId = 'UyE9BDuk2F0';

  try {
    await openChannelStudio(page, 'Christian Culture TV', '/livestreaming/manage');
    await page.waitForTimeout(3000);

    // 2. Przejdź bezpośrednio do pokoju transmisji /video/UyE9BDuk2F0/livestreaming i włącz Auto-start / kliknij Transmituj na żywo
    console.log(`Otwieram pokój transmisji /video/${videoId}/livestreaming...`);
    await page.goto(`https://studio.youtube.com/video/${videoId}/livestreaming`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);

    // Włącz przełączniki Auto-start i Auto-stop
    const toggles = page.locator('tp-yt-paper-toggle-button');
    const tCount = await toggles.count();
    for (let i = 0; i < tCount; i++) {
      const t = toggles.nth(i);
      const txt = (await t.innerText().catch(() => '')).trim();
      const isChecked = await t.evaluate(el => el.getAttribute('aria-checked') === 'true' || el.hasAttribute('checked')).catch(() => false);
      if (txt.includes('automatyczne uruchamianie') && !isChecked) {
        console.log('  Włączam Auto-start w UyE9BDuk2F0...');
        await t.click().catch(() => {});
        await page.waitForTimeout(1500);
        const confirmToggle = page.locator('ytcp-dialog button, ytcp-confirmation-dialog button').filter({ hasText: /Włącz|Potwierdź|OK/i }).first();
        if (await confirmToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmToggle.click().catch(() => {});
          await page.waitForTimeout(1500);
        }
      }
      if (txt.includes('automatyczne zatrzymywanie') && !isChecked) {
        console.log('  Włączam Auto-stop w UyE9BDuk2F0...');
        await t.click().catch(() => {});
        await page.waitForTimeout(1000);
      }
    }

    await page.waitForTimeout(6000);
    const bodyText = await page.evaluate(() => document.body.innerText);
    const isLive = bodyText.includes('Zakończ transmisję') || bodyText.includes('TRWA');
    console.log('Czy Christian Culture TV (UyE9BDuk2F0) już nadaje na żywo?', isLive);

    await page.screenshot({ path: `${ART_DIR}/live_active_Christian_Culture_TV.png` });
    console.log(`Zapisano screenshot: ${ART_DIR}/live_active_Christian_Culture_TV.png`);

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
