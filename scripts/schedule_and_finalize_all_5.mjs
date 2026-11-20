import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
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

const CHANNEL_CONFIGS = [
  { name: 'Robert Łukasz Pio', knownVideoId: '3v9Dnwidgjk' },
  { name: 'Osobowość +', knownVideoId: 'DTEt2rW_YH4' },
  { name: 'Christian Culture TV', knownVideoId: '7w4bIOba5Z4' },
  { name: 'Polskie Radio CHRISTIAN CULTURE', knownVideoId: null },
  { name: 'CC Women', knownVideoId: null }
];

async function createBroadcast(page, channelName) {
  console.log(`[${channelName}] Tworzę nową zaplanowaną transmisję...`);
  
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
  console.log(`[${channelName}]    Krok 1: Wpisuję tytuł...`);
  const titleInput = page.locator('ytls-broadcast-create-dialog #title-textarea #textbox, ytls-broadcast-create-dialog #textbox').first();
  await titleInput.waitFor({ state: 'visible', timeout: 10000 });
  await titleInput.click();
  await titleInput.fill('');
  await titleInput.fill(STREAM_TITLE);

  // NOT FOR KIDS
  console.log(`[${channelName}]    Krok 1: Wybieram NOT_MFK...`);
  const notForKids = page.locator('ytls-broadcast-create-dialog tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
  if (await notForKids.isVisible({ timeout: 3000 }).catch(() => false)) {
    await notForKids.click();
    await page.waitForTimeout(1000);
  }

  // Przechodzenie przez kroki Dalej aż do Widoczności
  console.log(`[${channelName}]    Przechodzę przez kroki Dalej...`);
  for (let s = 1; s <= 4; s++) {
    const nextBtn = page.locator('ytls-broadcast-create-dialog #next-button:visible').first();
    if (await nextBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
    } else {
      break;
    }
  }

  // Krok Widoczność: Publiczny
  console.log(`[${channelName}]    Krok Widoczność: Publiczny i 20:00...`);
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
  console.log(`[${channelName}]    Klikam Gotowe (#create-button)...`);
  const createBtn = page.locator('ytls-broadcast-create-dialog #create-button').first();
  await createBtn.click();
  await page.waitForTimeout(6000);

  const closeBtn = page.locator('ytcp-button:has-text("Zamknij"), button:has-text("Zamknij")').first();
  if (await closeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await closeBtn.click();
    await page.waitForTimeout(2000);
  }
}

async function findVideoIdInManage(page) {
  return await page.evaluate(() => {
    const rows = document.querySelectorAll('ytcp-video-row, ytls-broadcast-row, [role="row"]');
    for (const r of rows) {
      const a = r.querySelector('a#video-title, a[href*="/video/"]');
      const href = a ? a.href : '';
      const text = r.innerText.replace(/\n+/g, ' ').trim();
      if (text.includes('Dlaczego Potrzebujesz') || (text.includes('20:00') && text.includes('17 lis'))) {
        const match = href.match(/\/video\/([a-zA-Z0-9_-]+)/);
        if (match) return match[1];
      }
    }
    return null;
  });
}

async function updateVideoDetails(page, videoId, channelName) {
  console.log(`[${channelName}] Aktualizuję miniaturę i opis na /video/${videoId}/edit...`);
  await page.goto(`https://studio.youtube.com/video/${videoId}/edit`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);

  // Tytuł
  const titleBox = page.locator('#title-textarea #textbox').first();
  if (await titleBox.isVisible({ timeout: 3000 }).catch(() => false)) {
    const currTitle = await titleBox.innerText().catch(() => '');
    if (!currTitle.includes('Dlaczego Potrzebujesz')) {
      await titleBox.click();
      await titleBox.fill('');
      await titleBox.fill(STREAM_TITLE);
      console.log(`[${channelName}]    Zaktualizowano tytuł.`);
    }
  }

  // Opis
  const descBox = page.locator('#description-textarea #textbox').first();
  if (await descBox.isVisible({ timeout: 3000 }).catch(() => false)) {
    const currDesc = await descBox.innerText().catch(() => '');
    if (!currDesc.includes('DLACZEGO POTRZEBUJESZ')) {
      await descBox.click();
      await descBox.fill('');
      await descBox.fill(STREAM_DESC);
      console.log(`[${channelName}]    Wpisano pełny opis.`);
    }
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
        await page.waitForTimeout(3000);
      }
    }
  }

  // Zapisz
  const saveBtn = page.locator('#save-button, ytcp-button#save').first();
  if (await saveBtn.isEnabled().catch(() => false)) {
    await saveBtn.click();
    console.log(`[${channelName}]    Zapisano zmiany.`);
    await page.waitForTimeout(4000);
  }
}

async function configureStreamRoom(page, videoId, channelName) {
  console.log(`[${channelName}] Konfiguruję pokój transmisji /video/${videoId}/livestreaming...`);
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

  const streamKey = await page.evaluate(() => {
    const input = document.querySelector('input[type="password"]');
    return input ? input.value : null;
  });

  const safeName = channelName.replace(/[^a-zA-Z0-9]/g, '_');
  const shotPath = `C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\scheduled_${safeName}_live.png`;
  await page.screenshot({ path: shotPath }).catch(() => {});
  console.log(`[${channelName}]    Screenshot zapisany: ${shotPath}`);

  return streamKey;
}

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  const results = [];

  try {
    for (const conf of CHANNEL_CONFIGS) {
      const channelName = conf.name;
      console.log(`\n======================================================`);
      console.log(`▶ PRZETWARZAM KANAŁ: ${channelName}`);
      console.log(`======================================================`);

      try {
        const channelId = await openChannelStudio(page, channelName, '/livestreaming/manage');
        await page.waitForTimeout(3000);

        let videoId = conf.knownVideoId;
        if (!videoId) {
          // Sprawdź czy jest na liście manage
          videoId = await findVideoIdInManage(page);
          if (!videoId) {
            await createBroadcast(page, channelName);
            await page.goto(`https://studio.youtube.com/channel/${channelId}/livestreaming/manage`, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(4000);
            videoId = await findVideoIdInManage(page);
          }
        }

        console.log(`[${channelName}] Identyfikator wideo: ${videoId}`);

        if (videoId) {
          // 1. Zaktualizuj opis i miniaturę jeśli potrzebne
          await updateVideoDetails(page, videoId, channelName);
          // 2. Skonfiguruj Auto-start, Auto-stop i zrób screenshot
          const streamKey = await configureStreamRoom(page, videoId, channelName);

          results.push({
            channel: channelName,
            channelId,
            videoId,
            watchUrl: `https://youtube.com/live/${videoId}`,
            streamRoomUrl: `https://studio.youtube.com/video/${videoId}/livestreaming`,
            streamKey: streamKey || 'UKRYTY_W_STUDIO',
            visibility: 'PUBLIC',
            time: '20:00 (17.11.2026)',
            status: 'READY'
          });
        } else {
          results.push({
            channel: channelName,
            channelId,
            error: 'Nie udało się ustalić videoId'
          });
        }
      } catch (err) {
        console.error(`❌ Błąd kanału ${channelName}:`, err.message);
        results.push({
          channel: channelName,
          error: err.message
        });
      }
    }

    console.log('\n======================================================');
    console.log('🎉 RAPORT KOŃCOWY ZAPLANOWANYCH KANAŁÓW (WTOREK, 17.11.2026):');
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
