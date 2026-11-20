import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
import crypto from 'node:crypto';
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

async function testSingle() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    const channelName = 'Robert Łukasz Pio';
    const channelId = await openChannelStudio(page, channelName, '/livestreaming/manage');
    await page.waitForTimeout(4000);

    console.log('1. Szukam Zaplanuj transmisję...');
    const schedBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję"), #schedule-stream-button').first();
    await schedBtn.waitFor({ timeout: 10000 });
    await schedBtn.click();
    await page.waitForTimeout(3000);

    const createNewBtn = page.locator('button:has-text("Utwórz nowe"), ytcp-button:has-text("Utwórz nowe")').first();
    if (await createNewBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('2. Klikam Utwórz nowe...');
      await createNewBtn.click();
      await page.waitForTimeout(2500);
    }

    console.log('3. Wypełniam Tytuł...');
    const titleInput = page.locator('#title-textarea #textbox, #textbox[aria-label*="tytuł" i], #textbox[aria-label*="title" i], textarea[name="title"], input[name="title"], #textbox').first();
    await titleInput.waitFor({ timeout: 10000 });
    await titleInput.click();
    await titleInput.fill('');
    await titleInput.fill(STREAM_TITLE);

    console.log('4. Wypełniam Opis...');
    const descInput = page.locator('#description-textarea #textbox, #textbox[aria-label*="opis" i], #textbox[aria-label*="description" i]').first();
    if (await descInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await descInput.click();
      await descInput.fill('');
      await descInput.fill(STREAM_DESC);
    }

    console.log('5. Wgrywam miniaturę...');
    if (fs.existsSync(THUMBNAIL_PATH)) {
      const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 3500 }).catch(() => null);
      const thumbBtn = page.locator('#upload-button, button:has-text("Prześlij miniaturę"), ytcp-button:has-text("Prześlij miniaturę"), ytcp-thumbnails-compact-editor-uploader').first();
      if (await thumbBtn.isVisible().catch(() => false)) {
        await thumbBtn.click().catch(() => {});
        const chooser = await fileChooserPromise;
        if (chooser) {
          await chooser.setFiles(THUMBNAIL_PATH);
          console.log('   Miniatura przesłana!');
          await page.waitForTimeout(2500);
        }
      }
    }

    console.log('6. NOT_MFK...');
    const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], tp-yt-paper-radio-button:has-text("Nie, nie są przeznaczone dla dzieci")').first();
    if (await notForKids.isVisible({ timeout: 4000 }).catch(() => false)) {
      await notForKids.click();
      await page.waitForTimeout(1000);
    }

    console.log('7. Przechodzę do widoczności...');
    for (let i = 0; i < 3; i++) {
      const nextBtn = page.locator('ytcp-button:visible, button:visible').filter({ hasText: /^Dalej$/ }).first();
      if (await nextBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    console.log('8. Ustawiam Publiczny i 20:00...');
    const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
    if (await pubRadio.isVisible({ timeout: 4000 }).catch(() => false)) {
      await pubRadio.click();
      await page.waitForTimeout(1000);
    }

    const timeInput = page.locator('#time-of-day-container input').first();
    if (await timeInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await timeInput.click().catch(() => {});
      await timeInput.fill('20:00').catch(() => {});
      await timeInput.press('Enter').catch(() => {});
      await page.waitForTimeout(1000);
    }

    // Zróbmy zrzut ekranu krok 4
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\step4_inspect.png' });

    console.log('9. Szukam widocznego przycisku Gotowe / Utwórz...');
    const actionBtn = page.locator('ytcp-button:visible, button:visible').filter({ hasText: /Gotowe|Utwórz|Zaplanuj|Zapisz/ }).last();
    console.log('Tekst przycisku:', await actionBtn.innerText());
    await actionBtn.click();
    console.log('Kliknięto przycisk finalny!');
    await page.waitForTimeout(6000);

    // Zrzut po zapisaniu
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\after_save.png' });

    // Zamknij popup sukcesu
    const closeBtn = page.locator('ytcp-button:has-text("Zamknij"), button:has-text("Zamknij")').first();
    if (await closeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await closeBtn.click();
      await page.waitForTimeout(2000);
    }

    // Przejdź do /manage i odczytaj videoId
    await page.goto(`https://studio.youtube.com/channel/${channelId}/livestreaming/manage`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const firstRow = page.locator('ytcp-video-row, ytls-broadcast-row, [role="row"]').first();
    console.log('Pierwszy wiersz w /manage:', await firstRow.innerText().catch(() => 'brak'));

    const rowLink = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
    if (await rowLink.isVisible({ timeout: 4000 }).catch(() => false)) {
      await rowLink.click();
      await page.waitForTimeout(5000);
    }

    // Toggle Auto-start
    const toggles = page.locator('tp-yt-paper-toggle-button');
    const toggleCount = await toggles.count();
    for (let i = 0; i < toggleCount; i++) {
      const t = toggles.nth(i);
      const txt = (await t.innerText()).trim();
      const isChecked = await t.evaluate(el => el.getAttribute('aria-checked') === 'true' || el.hasAttribute('checked'));
      if (txt.includes('automatyczne uruchamianie') && !isChecked) {
        console.log('Włączam auto-start...');
        await t.click();
        await page.waitForTimeout(800);
      }
      if (txt.includes('automatyczne zatrzymywanie') && !isChecked) {
        console.log('Włączam auto-stop...');
        await t.click();
        await page.waitForTimeout(800);
      }
    }

    const finalShot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_live_scheduled_success.png';
    await page.screenshot({ path: finalShot });
    console.log('🎉 SUKCES! Zapisano zrzut:', finalShot);

  } finally {
    await ctx.close();
  }
}

testSingle().catch(console.error);
