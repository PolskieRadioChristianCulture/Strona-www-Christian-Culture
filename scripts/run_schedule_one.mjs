import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
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

async function scheduleOne(channelName) {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    const channelId = await openChannelStudio(page, channelName, '/livestreaming/manage');
    await page.waitForTimeout(3000);

    console.log(`[${channelName}] Klikam Zaplanuj transmisję...`);
    const schedBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję"), #schedule-stream-button').first();
    await schedBtn.click();
    await page.waitForTimeout(2000);

    const createNewBtn = page.locator('button:has-text("Utwórz nowe"), ytcp-button:has-text("Utwórz nowe")').first();
    if (await createNewBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await createNewBtn.click();
      await page.waitForTimeout(2000);
    }

    // Step 1: Szczegóły
    console.log(`[${channelName}] Wypełniam tytuł i opis...`);
    const titleInput = page.locator('#title-textarea #textbox, #textbox[aria-label*="tytuł" i]').first();
    await titleInput.click();
    await titleInput.fill(STREAM_TITLE);

    const descInput = page.locator('#description-textarea #textbox, #textbox[aria-label*="opis" i]').first();
    if (await descInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await descInput.click();
      await descInput.fill(STREAM_DESC);
    }

    // Miniatura
    if (fs.existsSync(THUMBNAIL_PATH)) {
      console.log(`[${channelName}] Przesyłam miniaturę...`);
      const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 3500 }).catch(() => null);
      const thumbBtn = page.locator('#upload-button, button:has-text("Prześlij miniaturę"), ytcp-button:has-text("Prześlij miniaturę"), ytcp-thumbnails-compact-editor-uploader').first();
      if (await thumbBtn.isVisible().catch(() => false)) {
        await thumbBtn.click().catch(() => {});
        const chooser = await fileChooserPromise;
        if (chooser) {
          await chooser.setFiles(THUMBNAIL_PATH);
          console.log(`[${channelName}] Miniatura przesłana!`);
          await page.waitForTimeout(2000);
        }
      }
    }

    // NOT_MFK
    console.log(`[${channelName}] Ustawiam odbiorców...`);
    const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], tp-yt-paper-radio-button:has-text("Nie, nie są przeznaczone dla dzieci")').first();
    if (await notForKids.isVisible({ timeout: 3000 }).catch(() => false)) {
      await notForKids.click();
      await page.waitForTimeout(1000);
    }

    // Przechodzenie przez kroki aż do Widoczności
    console.log(`[${channelName}] Przechodzę do kroku Widoczność...`);
    while (await page.locator('#next-button:visible').count() > 0) {
      await page.locator('#next-button:visible').first().click();
      await page.waitForTimeout(2000);
    }

    // Widoczność: Publiczny
    console.log(`[${channelName}] Zaznaczam Publiczny...`);
    const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
    if (await pubRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
      await pubRadio.click();
      await page.waitForTimeout(1000);
    }

    // Ustawienie godziny 20:00
    console.log(`[${channelName}] Ustawiam godzinę 20:00...`);
    const timeInput = page.locator('input[aria-label*="godzin" i], input[aria-label*="czas" i], ytcp-form-input-container input').last();
    if (await timeInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await timeInput.click();
      await timeInput.fill('20:00');
      await timeInput.press('Enter');
      await page.waitForTimeout(1000);
    }

    // Kliknięcie Gotowe (#create-button)
    console.log(`[${channelName}] Klikam Gotowe (#create-button)...`);
    const createBtn = page.locator('#create-button:visible').first();
    await createBtn.click();
    await page.waitForTimeout(7000);

    // Zamknij popup udostępniania jeśli się pojawił
    const closeBtn = page.locator('ytcp-button:has-text("Zamknij"), button:has-text("Zamknij"), #close-button').first();
    if (await closeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await closeBtn.click();
      await page.waitForTimeout(2000);
    }

    // Przejdź do /manage i wejdź do transmisji
    console.log(`[${channelName}] Przechodzę do /manage...`);
    await page.goto(`https://studio.youtube.com/channel/${channelId}/livestreaming/manage`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const rowLink = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
    let videoId = null;
    let watchUrl = null;
    if (await rowLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      const href = await rowLink.getAttribute('href');
      const m = href ? href.match(/\/video\/([a-zA-Z0-9_-]+)/) : null;
      videoId = m ? m[1] : null;
      watchUrl = videoId ? `https://youtube.com/live/${videoId}` : null;
      await rowLink.click();
      await page.waitForTimeout(6000);
    }

    // Włącz Auto-start i Auto-stop
    console.log(`[${channelName}] Sprawdzam Auto-start / Auto-stop...`);
    const toggles = page.locator('tp-yt-paper-toggle-button');
    const toggleCount = await toggles.count();
    for (let i = 0; i < toggleCount; i++) {
      const t = toggles.nth(i);
      const txt = (await t.innerText()).trim();
      const isChecked = await t.evaluate(el => el.getAttribute('aria-checked') === 'true' || el.hasAttribute('checked'));
      if (txt.includes('automatyczne uruchamianie') && !isChecked) {
        console.log(`    Włączam auto-start...`);
        await t.click();
        await page.waitForTimeout(800);
      }
      if (txt.includes('automatyczne zatrzymywanie') && !isChecked) {
        console.log(`    Włączam auto-stop...`);
        await t.click();
        await page.waitForTimeout(800);
      }
    }

    const safeName = channelName.replace(/[^a-zA-Z0-9]/g, '_');
    const shotPath = `C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\scheduled_${safeName}_live.png`;
    await page.screenshot({ path: shotPath }).catch(() => {});

    console.log(`\n🎉 SUKCES DLA ${channelName}!`);
    console.log(`   Video ID: ${videoId}`);
    console.log(`   Watch URL: ${watchUrl}`);
    console.log(`   Zrzut: ${shotPath}\n`);

    return { channelName, channelId, videoId, watchUrl, status: 'SCHEDULED_PUBLIC' };

  } finally {
    await ctx.close();
  }
}

scheduleOne('Robert Łukasz Pio').then(res => console.log('WYNIK:', res)).catch(console.error);
