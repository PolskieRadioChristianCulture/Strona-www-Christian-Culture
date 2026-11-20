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

async function scheduleChannel(page, channelName) {
  console.log(`\n======================================================`);
  console.log(`▶ PLANOWANIE LIVE DLA: ${channelName}`);
  console.log(`======================================================`);

  const channelId = await openChannelStudio(page, channelName, '/livestreaming/manage');
  await page.waitForTimeout(4000);

  // 1. Kliknij "Zaplanuj transmisję"
  console.log('1. Szukam przycisku "Zaplanuj transmisję"...');
  const schedBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję"), #schedule-stream-button').first();
  await schedBtn.waitFor({ timeout: 10000 });
  await schedBtn.click();
  console.log('   Kliknięto "Zaplanuj transmisję"!');
  await page.waitForTimeout(3000);

  // 2. Jeśli pyta "Utwórz nowe" vs "Użyj ponownie"
  const createNewBtn = page.locator('button:has-text("Utwórz nowe"), ytcp-button:has-text("Utwórz nowe")').first();
  if (await createNewBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('   Klikam "Utwórz nowe"...');
    await createNewBtn.click();
    await page.waitForTimeout(2500);
  }

  // 3. Tytuł
  console.log('2. Wpisuję tytuł...');
  const titleInput = page.locator('#title-textarea #textbox, #textbox[aria-label*="tytuł" i], #textbox[aria-label*="title" i], textarea[name="title"], input[name="title"], #textbox').first();
  await titleInput.waitFor({ timeout: 10000 });
  await titleInput.click();
  await titleInput.fill('');
  await titleInput.fill(STREAM_TITLE);
  console.log('   Tytuł wpisany!');

  // 4. Opis
  console.log('3. Wpisuję opis...');
  const descInput = page.locator('#description-textarea #textbox, #textbox[aria-label*="opis" i], #textbox[aria-label*="description" i]').first();
  if (await descInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await descInput.click();
    await descInput.fill('');
    await descInput.fill(STREAM_DESC);
    console.log('   Opis wpisany!');
  }

  // 5. Miniatura
  if (fs.existsSync(THUMBNAIL_PATH)) {
    console.log('4. Wgrywam miniaturę...');
    const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 3500 }).catch(() => null);
    const thumbBtn = page.locator('#upload-button, button:has-text("Prześlij miniaturę"), ytcp-button:has-text("Prześlij miniaturę"), ytcp-thumbnails-compact-editor-uploader').first();
    if (await thumbBtn.isVisible().catch(() => false)) {
      await thumbBtn.click().catch(() => {});
      const chooser = await fileChooserPromise;
      if (chooser) {
        await chooser.setFiles(THUMBNAIL_PATH);
        console.log('   Miniatura przesłana przez fileChooser!');
        await page.waitForTimeout(2500);
      }
    } else {
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.count()) {
        await fileInput.setInputFiles(THUMBNAIL_PATH);
        console.log('   Miniatura przesłana przez input[type="file"]!');
        await page.waitForTimeout(2500);
      }
    }
  }

  // 6. Odbiorcy: Nie dla dzieci
  console.log('5. Ustawiam odbiorców (NOT_MFK)...');
  const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], tp-yt-paper-radio-button:has-text("Nie, nie są przeznaczone dla dzieci")').first();
  if (await notForKids.isVisible({ timeout: 4000 }).catch(() => false)) {
    await notForKids.click();
    await page.waitForTimeout(1000);
  }

  // 7. Przejście przez kroki kreatora
  console.log('6. Przechodzę przez kroki Dalej...');
  for (let step = 1; step <= 3; step++) {
    const nextBtn = page.locator('#next-button, button:has-text("Dalej"), ytcp-button:has-text("Dalej")').first();
    if (await nextBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  // 8. Krok Widoczność: Publiczny + 20:00
  console.log('7. Ustawiam widoczność Publiczny i 20:00...');
  const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
  if (await pubRadio.isVisible({ timeout: 4000 }).catch(() => false)) {
    await pubRadio.click();
    await page.waitForTimeout(1000);
  }

  const timeInput = page.locator('#time-of-day-container input, input[aria-label*="godzin" i], input[aria-label*="czas" i], ytcp-form-input-container input').first();
  if (await timeInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await timeInput.click().catch(() => {});
    await timeInput.fill('20:00').catch(() => {});
    await timeInput.press('Enter').catch(() => {});
    await page.waitForTimeout(1000);
  }

  // 9. Zapisz / Gotowe
  console.log('8. Zapisuję zaplanowaną transmisję...');
  const doneBtn = page.locator('#done-button, button:has-text("Gotowe"), ytcp-button:has-text("Gotowe"), button:has-text("Zapisz"), ytcp-button:has-text("Zapisz")').first();
  await doneBtn.waitFor({ timeout: 8000 });
  await doneBtn.click();
  console.log('   Kliknięto Gotowe!');
  await page.waitForTimeout(6000);

  // Zamknij popup sukcesu jeśli jest
  const closeBtn = page.locator('ytcp-button:has-text("Zamknij"), button:has-text("Zamknij"), #close-button').first();
  if (await closeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await closeBtn.click();
    await page.waitForTimeout(2000);
  }

  // 10. Wejdź do pokoju nowo utworzonej transmisji z listy /manage
  console.log('9. Wchodzę do pokoju transmisji z listy /manage...');
  await page.goto(`https://studio.youtube.com/channel/${channelId}/livestreaming/manage`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const rowLink = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
  if (await rowLink.isVisible({ timeout: 5000 }).catch(() => false)) {
    await rowLink.click();
    await page.waitForTimeout(6000);
  }

  // 11. Włącz Auto-start i Auto-stop
  console.log('10. Konfiguruję Auto-start i Auto-stop...');
  const toggles = page.locator('tp-yt-paper-toggle-button');
  const toggleCount = await toggles.count();
  for (let i = 0; i < toggleCount; i++) {
    const t = toggles.nth(i);
    const txt = (await t.innerText()).trim();
    const isChecked = await t.evaluate(el => el.getAttribute('aria-checked') === 'true' || el.hasAttribute('checked'));
    if (txt.includes('automatyczne uruchamianie') && !isChecked) {
      console.log('    Włączam automatyczne uruchamianie...');
      await t.click();
      await page.waitForTimeout(800);
    }
    if (txt.includes('automatyczne zatrzymywanie') && !isChecked) {
      console.log('    Włączam automatyczne zatrzymywanie...');
      await t.click();
      await page.waitForTimeout(800);
    }
  }

  // 12. Odczytaj streamKey i publicLiveUrl
  const streamKey = await page.evaluate(() => {
    const input = document.querySelector('input[type="password"]');
    return input ? input.value : null;
  });

  const urlMatch = page.url().match(/\/video\/([a-zA-Z0-9_-]+)/);
  const videoId = urlMatch ? urlMatch[1] : null;
  const watchUrl = videoId ? `https://youtube.com/live/${videoId}` : null;

  const safeName = channelName.replace(/[^a-zA-Z0-9]/g, '_');
  const shotPath = `C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\scheduled_${safeName}_live.png`;
  await page.screenshot({ path: shotPath }).catch(() => {});

  console.log(`✅ ZAPLANOWANO POMYŚLNIE DLA ${channelName}:`);
  console.log(`   Video ID: ${videoId}`);
  console.log(`   Watch URL: ${watchUrl}`);
  console.log(`   Stream Key: ${streamKey ? 'ODCZYTANY' : 'STANDARD'}`);
  console.log(`   Zrzut: ${shotPath}`);

  return {
    channel: channelName,
    channelId,
    videoId,
    watchUrl,
    streamKey,
    status: 'SCHEDULED_PUBLIC'
  };
}

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  const results = [];

  try {
    for (const ch of CHANNELS) {
      try {
        const res = await scheduleChannel(page, ch);
        results.push(res);
      } catch (err) {
        console.error(`❌ BŁĄD DLA ${ch}:`, err.message);
        results.push({ channel: ch, error: err.message });
      }
    }

    console.log('\n======================================================');
    console.log('🎉 RAPORT ZAPLANOWANYCH TRANSMISJI (DZIŚ 20:00):');
    console.log(JSON.stringify(results, null, 2));
    console.log('======================================================');

    fs.writeFileSync(
      'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\data\\live_2000_scheduled.json',
      JSON.stringify(results, null, 2)
    );

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
