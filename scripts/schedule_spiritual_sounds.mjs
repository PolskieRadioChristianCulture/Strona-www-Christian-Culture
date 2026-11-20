import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
import fs from 'node:fs';

const THUMBNAIL_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\images\\slowo_ktore_cie_uzdrawia_thumb.jpg';
const STREAM_TITLE = 'Słowo, które Cię uzdrawia • Spiritual Sounds & Christian Culture TV • LIVE 🔴 24/7';
const STREAM_DESC = `🕊️ SŁOWO, KTÓRE CIĘ UZDRAWIA • SPIRITUAL SOUNDS & CHRISTIAN CULTURE TV • LIVE 🔴 24/7
Transmisja na żywo: Boże Słowo, psalmy i muzyka wyciszenia.

„Bo Słowo Boże jest żywe i skuteczne, ostrzejsze niż wszelki miecz obosieczny...” (Hbr 4,12).
Zanurz się w Bożej obecności, wycisz serce i napełnij swój dom pokojem.

🙏 WESPRZYJ MISJĘ CHRISTIAN CULTURE:
Jeśli ta muzyka i Słowo wnoszą pokój do Twojego serca, pomóż nam budować niezależne chrześcijańskie media w Polsce:
👉 https://polskieradio.cc/wspieraj (BLIK: 537 137 043, szybki przelew, karta)

🌐 ODKRYJ WIĘCEJ W EKOSYSTEMIE CHRISTIAN CULTURE:
✨ Portal Społecznościowy LUMINA: https://polskieradio.cc/lumina
📖 Pismo Święte Interlinearne: https://polskieradio.cc/mojabiblia
🎧 Chrześcijańskie Radio i Słuchowiska: https://polskieradio.cc/player
🎬 Chrześcijańskie Kino VOD: https://polskieradio.cc/vod

Błogosławionego czasu! Zostaw intencję modlitewną na czacie. Subskrybuj kanał i kliknij dzwoneczek 🔔!
#SpiritualSounds #SłowoKtóreCięUzdrawia #ChristianCulture #Biblia #Psalmy #Uwielbienie #Wiara #Modlitwa #MuzykaChrześcijańska`;

async function scheduleForChannel(channelName) {
  console.log(`\n======================================================`);
  console.log(`▶ PRZYGOTOWUJĘ TRANSMISJĘ DLA: ${channelName}`);
  console.log(`======================================================`);

  const { ctx, page } = await launchStudio({ headless: true });
  try {
    const channelId = await openChannelStudio(page, channelName, '/livestreaming/manage');
    await page.waitForTimeout(3500);

    // 1. Sprawdź czy już istnieje zaplanowana transmisja o tym tytule
    let videoId = await page.evaluate(() => {
      const rows = document.querySelectorAll('ytcp-video-row, ytls-broadcast-row, [role="row"]');
      for (const r of rows) {
        const text = r.innerText.replace(/\n+/g, ' ').trim();
        if (text.includes('Słowo, które Cię uzdrawia')) {
          const a = r.querySelector('a#video-title, a[href*="/video/"]');
          if (a && a.href) {
            const m = a.href.match(/\/video\/([a-zA-Z0-9_-]+)/);
            if (m) return m[1];
          }
        }
      }
      return null;
    });

    if (!videoId) {
      console.log(`[${channelName}] 1. Klikam Zaplanuj transmisję...`);
      const schedBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję"), #schedule-stream-button').first();
      await schedBtn.waitFor({ state: 'visible', timeout: 15000 });
      await schedBtn.click();
      await page.waitForTimeout(2500);

      const createNewBtn = page.locator('button:has-text("Utwórz nowe"), ytcp-button:has-text("Utwórz nowe")').first();
      if (await createNewBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log(`[${channelName}]    Klikam Utwórz nowe...`);
        await createNewBtn.click();
        await page.waitForTimeout(2000);
      }

      // Step 1: Tytuł
      console.log(`[${channelName}] 2. Tytuł: ${STREAM_TITLE}`);
      const titleInput = page.locator('ytls-broadcast-create-dialog #title-textarea #textbox, ytls-broadcast-create-dialog #textbox').first();
      await titleInput.waitFor({ state: 'visible', timeout: 10000 });
      await titleInput.click();
      await titleInput.fill('');
      await titleInput.fill(STREAM_TITLE);
      await page.waitForTimeout(1000);

      // Step 1: NOT_MFK
      console.log(`[${channelName}] 3. Odbiorcy NOT_MFK...`);
      const notForKids = page.locator('ytls-broadcast-create-dialog tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
      if (await notForKids.isVisible({ timeout: 3000 }).catch(() => false)) {
        await notForKids.click();
        await page.waitForTimeout(1000);
      }

      // Dalej
      console.log(`[${channelName}] 4. Przechodzę do kroku Widoczność...`);
      for (let s = 1; s <= 4; s++) {
        const nextBtn = page.locator('ytls-broadcast-create-dialog #next-button:visible').first();
        if (await nextBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
          await nextBtn.click();
          await page.waitForTimeout(2000);
        } else {
          break;
        }
      }

      // Publiczny
      console.log(`[${channelName}] 5. Ustawiam Publiczny...`);
      const pubRadio = page.locator('ytls-broadcast-create-dialog tp-yt-paper-radio-button[name="PUBLIC"]').first();
      if (await pubRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
        await pubRadio.click();
        await page.waitForTimeout(1000);
      }

      // Godzina
      const now = new Date();
      now.setMinutes(now.getMinutes() + 5);
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const timeInput = page.locator('ytls-broadcast-create-dialog #time-of-day-container input, ytls-broadcast-create-dialog input[aria-label*="godzin" i]').last();
      if (await timeInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`[${channelName}]    Ustawiam czas na: ${timeStr}`);
        await timeInput.click();
        await timeInput.fill(timeStr);
        await timeInput.press('Enter');
        await page.waitForTimeout(1000);
      }

      // Gotowe
      console.log(`[${channelName}] 6. Zapisuję (#create-button)...`);
      const createBtn = page.locator('ytls-broadcast-create-dialog #create-button').first();
      await createBtn.click();
      await page.waitForTimeout(7000);

      const closeBtn = page.locator('ytcp-button:has-text("Zamknij"), button:has-text("Zamknij")').first();
      if (await closeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await closeBtn.click();
        await page.waitForTimeout(2000);
      }

      // Odczytaj videoId
      console.log(`[${channelName}] 7. Odczytuję nowo utworzone videoId...`);
      await page.goto(`https://studio.youtube.com/channel/${channelId}/videos/live`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(4000);

      videoId = await page.evaluate(() => {
        const row = document.querySelector('ytcp-video-row');
        if (!row) return null;
        const link = row.querySelector('a[href*="/video/"]');
        const href = link ? link.href : '';
        const match = href.match(/\/video\/([a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
      });
    }

    console.log(`[${channelName}] VideoId: ${videoId}`);

    if (videoId) {
      console.log(`[${channelName}] 8. Wgrywam miniaturę i pełny opis na /video/${videoId}/edit...`);
      await page.goto(`https://studio.youtube.com/video/${videoId}/edit`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(4000);

      // Opis
      const descBox = page.locator('#description-textarea #textbox').first();
      if (await descBox.isVisible({ timeout: 4000 }).catch(() => false)) {
        await descBox.click();
        await descBox.fill('');
        await descBox.fill(STREAM_DESC);
        console.log(`[${channelName}]    Wpisano pełny opis.`);
      }

      // Miniatura
      if (fs.existsSync(THUMBNAIL_PATH)) {
        const fileInput = page.locator('input#file-loader, input[type="file"][accept*="image"]').first();
        if (await fileInput.count()) {
          await fileInput.setInputFiles(THUMBNAIL_PATH);
          console.log(`[${channelName}]    Miniatura przesłana!`);
          await page.waitForTimeout(2500);
        }
      }

      // Zapisz
      const saveBtn = page.locator('#save, ytcp-button#save-button, ytcp-button:has-text("Zapisz")').first();
      if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        if (await saveBtn.isEnabled().catch(() => false)) {
          await saveBtn.click();
          await page.waitForTimeout(5000);
          console.log(`[${channelName}]    Zapisano zmiany.`);
        }
      }

      // 9. Wejdź do pokoju transmisji na żywo i sprawdź/kliknij Rozpocznij
      console.log(`[${channelName}] 9. Sprawdzam pokój transmisji /video/${videoId}/livestreaming...`);
      await page.goto(`https://studio.youtube.com/video/${videoId}/livestreaming`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(6000);

      // Sprawdź czy przycisk Transmituj na żywo jest dostępny
      const goLiveBtn = page.locator('button:has-text("Transmituj na żywo"), ytcp-button:has-text("Transmituj na żywo")').first();
      if (await goLiveBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
        const canClick = await goLiveBtn.isEnabled().catch(() => false);
        console.log(`[${channelName}]    Przycisk Transmituj na żywo widoczny (aktywny: ${canClick})`);
        if (canClick) {
          await goLiveBtn.click();
          console.log(`[${channelName}]    KLIKNIĘTO TRANSMITUJ NA ŻYWO!`);
          await page.waitForTimeout(3000);
        }
      }
    }

    return { channelName, videoId, url: videoId ? `https://youtube.com/live/${videoId}` : null, success: true };
  } catch (err) {
    console.error(`[${channelName}] BŁĄD:`, err.message);
    return { channelName, error: err.message, success: false };
  } finally {
    try { await ctx.close(); } catch (e) {}
  }
}

async function main() {
  const CHANNELS_TO_RUN = [
    'Biblia Audio Christian Culture',
    'CC Men'
  ];

  const results = [];
  for (const ch of CHANNELS_TO_RUN) {
    const res = await scheduleForChannel(ch);
    results.push(res);
  }

  console.log(`\n======================================================`);
  console.log(`PODSUMOWANIE URUCHAMIANIA TRANSMISJI:`);
  console.log(`======================================================`);
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
