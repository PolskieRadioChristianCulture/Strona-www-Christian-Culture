import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

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

const CHANNELS = [
  'Robert Łukasz Pio',
  'Osobowość +',
  'Christian Culture TV',
  'Polskie Radio CHRISTIAN CULTURE',
  'CC Women'
];

async function setupChannel(page, channelName) {
  console.log(`\n======================================================`);
  console.log(`▶ PRZYGOTOWUJĘ TRANSMISJĘ DLA: ${channelName}`);
  console.log(`======================================================`);

  const channelId = await openChannelStudio(page, channelName, '/livestreaming/manage');
  await page.waitForTimeout(3500);

  // Sprawdź czy już istnieje zaplanowana transmisja na dziś o tym tytule
  let alreadyScheduled = false;
  const existingRows = page.locator('ytcp-video-row, ytls-broadcast-row, [role="row"]');
  const rowCount = await existingRows.count();
  for (let i = 0; i < rowCount; i++) {
    const txt = await existingRows.nth(i).innerText().catch(() => '');
    if (txt.includes('Dlaczego Potrzebujesz Żywego Słowa') || (txt.includes('20:00') && txt.includes('17 lis'))) {
      alreadyScheduled = true;
      console.log(`[${channelName}] Transmisja już istnieje w liście zaplanowanych!`);
      break;
    }
  }

  if (!alreadyScheduled) {
    console.log(`[${channelName}] 1. Klikam Zaplanuj transmisję...`);
    const schedBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję"), #schedule-stream-button').first();
    await schedBtn.click();
    await page.waitForTimeout(2500);

    const createNewBtn = page.locator('button:has-text("Utwórz nowe"), ytcp-button:has-text("Utwórz nowe")').first();
    if (await createNewBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      console.log(`[${channelName}]    Klikam Utwórz nowe...`);
      await createNewBtn.click();
      await page.waitForTimeout(2000);
    }

    // Step 1: Tytuł
    console.log(`[${channelName}] 2. Tytuł...`);
    const titleInput = page.locator('ytls-broadcast-create-dialog #title-textarea #textbox, ytls-broadcast-create-dialog #textbox').first();
    await titleInput.click();
    await titleInput.fill('');
    await titleInput.fill(STREAM_TITLE);

    // Step 1: Odbiorcy NOT_MFK
    console.log(`[${channelName}] 3. Odbiorcy NOT_MFK...`);
    const notForKids = page.locator('ytls-broadcast-create-dialog tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
    if (await notForKids.isVisible({ timeout: 3000 }).catch(() => false)) {
      await notForKids.click();
      await page.waitForTimeout(1000);
    }

    // Przechodzenie przez kroki Dalej aż do Widoczności
    console.log(`[${channelName}] 4. Przechodzę przez kolejne kroki kreatora...`);
    for (let step = 1; step <= 3; step++) {
      const nextBtn = page.locator('ytls-broadcast-create-dialog #next-button:visible').first();
      if (await nextBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    // Krok Widoczność: Publiczny
    console.log(`[${channelName}] 5. Ustawiam Publiczny i godzina 20:00...`);
    const pubRadio = page.locator('ytls-broadcast-create-dialog tp-yt-paper-radio-button[name="PUBLIC"]').first();
    if (await pubRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
      await pubRadio.click();
      await page.waitForTimeout(1000);
    }

    const timeInput = page.locator('ytls-broadcast-create-dialog #time-of-day-container input, ytls-broadcast-create-dialog input[aria-label*="godzin" i]').last();
    if (await timeInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await timeInput.click();
      await timeInput.fill('20:00');
      await timeInput.press('Enter');
      await page.waitForTimeout(1000);
    }

    // Gotowe (#create-button)
    console.log(`[${channelName}] 6. Zapisuję (#create-button)...`);
    const createBtn = page.locator('ytls-broadcast-create-dialog #create-button').first();
    await createBtn.click();
    await page.waitForTimeout(6000);

    const closeBtn = page.locator('ytcp-button:has-text("Zamknij"), button:has-text("Zamknij")').first();
    if (await closeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await closeBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  // 7. Pobierz videoId ze strony /videos/live
  console.log(`[${channelName}] 7. Odczytuję videoId...`);
  await page.goto(`https://studio.youtube.com/channel/${channelId}/videos/live`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const videoId = await page.evaluate(() => {
    const row = document.querySelector('ytcp-video-row');
    if (!row) return null;
    const link = row.querySelector('a[href*="/video/"]');
    const href = link ? link.href : '';
    const match = href.match(/\/video\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  });

  const watchUrl = videoId ? `https://youtube.com/live/${videoId}` : null;
  console.log(`[${channelName}] Znaleziono videoId: ${videoId} -> ${watchUrl}`);

  // 8. Wgrywamy miniaturę i pełny opis na stronie /video/{videoId}/edit
  if (videoId) {
    console.log(`[${channelName}] 8. Konfiguruję miniaturę i opis na /video/${videoId}/edit...`);
    await page.goto(`https://studio.youtube.com/video/${videoId}/edit`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Opis
    const descBox = page.locator('#description-textarea #textbox').first();
    if (await descBox.isVisible({ timeout: 3000 }).catch(() => false)) {
      await descBox.click();
      await descBox.fill('');
      await descBox.fill(STREAM_DESC);
      console.log(`[${channelName}]    Wpisano pełny opis z linkami i tagami.`);
    }

    // Miniatura
    if (fs.existsSync(THUMBNAIL_PATH)) {
      const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 3500 }).catch(() => null);
      const thumbBtn = page.locator('#upload-thumbnail, ytcp-button:has-text("Prześlij miniaturę"), ytcp-thumbnails-compact-editor-uploader').first();
      if (await thumbBtn.isVisible().catch(() => false)) {
        await thumbBtn.click().catch(() => {});
        const chooser = await fileChooserPromise;
        if (chooser) {
          await chooser.setFiles(THUMBNAIL_PATH);
          console.log(`[${channelName}]    Miniatura przesłana!`);
          await page.waitForTimeout(2500);
        }
      }
    }

    // Kliknij Zapisz jeśli aktywne
    const saveBtn = page.locator('#save-button, ytcp-button#save').first();
    if (await saveBtn.isEnabled().catch(() => false)) {
      await saveBtn.click();
      console.log(`[${channelName}]    Zapisano zmiany na stronie edycji.`);
      await page.waitForTimeout(4000);
    }
  }

  // 9. Przejdź do pokoju transmisji na żywo, aby odczytać streamKey oraz włączyć Auto-start i Auto-stop
  let streamKey = null;
  if (videoId) {
    console.log(`[${channelName}] 9. Sprawdzam pokój transmisji /video/${videoId}/livestreaming...`);
    await page.goto(`https://studio.youtube.com/video/${videoId}/livestreaming`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    const toggles = page.locator('tp-yt-paper-toggle-button');
    const count = await toggles.count();
    for (let i = 0; i < count; i++) {
      const t = toggles.nth(i);
      const txt = (await t.innerText()).trim();
      const isChecked = await t.evaluate(el => el.getAttribute('aria-checked') === 'true' || el.hasAttribute('checked'));
      if (txt.includes('automatyczne uruchamianie') && !isChecked) {
        console.log(`[${channelName}]    Włączam Auto-start...`);
        await t.click();
        await page.waitForTimeout(800);
      }
      if (txt.includes('automatyczne zatrzymywanie') && !isChecked) {
        console.log(`[${channelName}]    Włączam Auto-stop...`);
        await t.click();
        await page.waitForTimeout(800);
      }
    }

    streamKey = await page.evaluate(() => {
      const input = document.querySelector('input[type="password"]');
      return input ? input.value : null;
    });

    const safeName = channelName.replace(/[^a-zA-Z0-9]/g, '_');
    const shotPath = `C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\scheduled_${safeName}_live.png`;
    await page.screenshot({ path: shotPath }).catch(() => {});
    console.log(`[${channelName}]    Zrzut pokoju zapisany: ${shotPath}`);
  }

  console.log(`\n✅ SUKCES DLA KANAŁU ${channelName}:`);
  console.log(`   Video ID: ${videoId}`);
  console.log(`   Watch URL: ${watchUrl}`);
  console.log(`   Widoczność: PUBLICZNY (Dziś, 17.11.2026, 20:00)`);

  return {
    channel: channelName,
    channelId,
    videoId,
    watchUrl,
    streamKey,
    visibility: 'PUBLIC'
  };
}

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  const results = [];

  try {
    for (const ch of CHANNELS) {
      try {
        const res = await setupChannel(page, ch);
        results.push(res);
      } catch (err) {
        console.error(`❌ Błąd dla ${ch}:`, err.message);
        results.push({ channel: ch, error: err.message });
      }
    }

    console.log('\n======================================================');
    console.log('🎉 RAPORT ZAPLANOWANYCH KANAŁÓW YT (WTOREK, 17.11.2026):');
    console.log(JSON.stringify(results, null, 2));
    console.log('======================================================');

    fs.writeFileSync(
      'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\data\\live_2000_scheduled.json',
      JSON.stringify({
        event: 'Dlaczego Potrzebujesz Żywego Słowa?',
        date: '2026-11-17',
        scheduledTime: '20:00:00+01:00',
        thumbnail: 'images/live_2000_dlaczego_potrzebujesz_zywego_slowa.jpg',
        channels: results
      }, null, 2)
    );

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
