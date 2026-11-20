import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
import path from 'path';
import fs from 'fs';

const THUMB_PATH = path.resolve('images/wieczor_ze_slowem_bozym_live_bg.jpg');

async function main() {
  console.log('--- Rozpoczynam weryfikację i planowanie dla: Osobowość + ---');
  const { ctx, page } = await launchStudio({ headless: true });

  try {
    const channelId = await openChannelStudio(page, 'Osobowość +', '/videos/live');
    console.log('Channel ID:', channelId);
    await page.waitForTimeout(4000);

    // Sprawdź czy jest już wideo z tytułem Wieczór ze Słowem Bożym
    const existing = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('ytcp-video-row'));
      for (const row of rows) {
        const text = row.innerText || '';
        if (text.includes('Wieczór ze Słowem Bożym')) {
          const link = row.querySelector('a[href*="/video/"]');
          const href = link ? link.href : '';
          const match = href.match(/\/video\/([a-zA-Z0-9_-]+)/);
          return {
            videoId: match ? match[1] : null,
            text: text.replace(/\n+/g, ' | ')
          };
        }
      }
      return null;
    });

    console.log('Existing stream search result:', existing);

    let videoId = existing?.videoId;

    if (!videoId) {
      console.log('Brak zaplanowanego streamu - przechodzę do /livestreaming/manage w celu zaplanowania nowego...');
      await page.goto(`https://studio.youtube.com/channel/${channelId}/livestreaming/manage`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(4000);

      // Kliknij "Zaplanuj transmisję"
      console.log('Klikam Zaplanuj transmisję...');
      const schedBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję")').first();
      await schedBtn.click();
      await page.waitForTimeout(2500);

      const createNewBtn = page.locator('button:has-text("Utwórz nowe"), ytcp-button:has-text("Utwórz nowe")').first();
      if (await createNewBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
        console.log('Klikam Utwórz nowe...');
        await createNewBtn.click();
        await page.waitForTimeout(2000);
      }

      // Wypełnij tytuł i opis
      console.log('Wypełniam dane w kroku 1 (Szczegóły)...');
      const titleBox = page.locator('#title-textarea #textbox').first();
      await titleBox.click();
      await titleBox.fill('Wieczór ze Słowem Bożym • Zaznaj spokoju serca [LIVE 20:00]');

      const descBox = page.locator('#description-textarea #textbox').first();
      if (await descBox.isVisible({ timeout: 2000 }).catch(() => false)) {
        const descText = `Wieczór ze Słowem Bożym • Zaznaj spokoju serca\nTransmisja na żywo: Poniedziałek, 16 listopada 2026, godz. 20:00 - 24:00.\n\nDołącz do wspólnego wieczoru z Pismem Świętym, kojącą muzyką i rozważaniem Bożego Słowa.\nZatrzymaj się po całym dniu i napełnij swoje serce pokojem, który przewyższa wszelki umysł (Flp 4,7).\n\n📖 Słuchaj również 24/7 na żywo w Radiu Christian Culture:\nhttps://polskieradio.cc/wieczor\n\n#SlowoBoze #WieczorZeSlowemBozym #Biblia #SpokojSerca #ChristianCulture #Modlitwa #Live`;
        await descBox.click();
        await descBox.fill(descText);
      }

      // Miniatura
      if (fs.existsSync(THUMB_PATH)) {
        const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 3000 }).catch(() => null);
        const thumbBtn = page.locator('#upload-thumbnail, ytcp-button:has-text("Prześlij miniaturę"), ytcp-thumbnails-compact-editor-uploader').first();
        if (await thumbBtn.isVisible().catch(() => false)) {
          await thumbBtn.click().catch(() => {});
          const fileChooser = await fileChooserPromise;
          if (fileChooser) {
            await fileChooser.setFiles(THUMB_PATH);
            console.log('Miniatura przesłana:', THUMB_PATH);
            await page.waitForTimeout(2500);
          }
        }
      }

      // Odbiorcy: Nie przeznaczone dla dzieci
      const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
      await notForKids.click();
      await page.waitForTimeout(1000);

      // Dalej przez kroki
      for (let i = 0; i < 3; i++) {
        const nextBtn = page.locator('#next-button, button:has-text("Dalej"), ytcp-button:has-text("Dalej")').first();
        if (await nextBtn.isVisible().catch(() => false)) {
          await nextBtn.click();
          await page.waitForTimeout(2000);
        }
      }

      // Krok 4: Publiczny i 20:00
      console.log('Ustawiam 20:00 i Publiczny...');
      const publicRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
      if (await publicRadio.isVisible().catch(() => false)) {
        await publicRadio.click();
        await page.waitForTimeout(1000);
      }

      const timeInput = page.locator('#time-of-day-container input').first();
      if (await timeInput.isVisible().catch(() => false)) {
        await timeInput.click();
        await timeInput.fill('20:00');
        await timeInput.press('Enter');
        await page.waitForTimeout(1000);
      }

      // Gotowe
      console.log('Klikam Gotowe...');
      const gotoweBtn = page.locator('ytcp-button:has-text("Gotowe"), button:has-text("Gotowe")').first();
      await gotoweBtn.click();
      await page.waitForTimeout(7000);

      // Zamknij
      const closeBtn = page.locator('ytcp-button:has-text("Zamknij"), button:has-text("Zamknij")').first();
      if (await closeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await closeBtn.click();
        await page.waitForTimeout(2000);
      }

      // Wejdź na videos/live żeby pobrać ID
      await page.goto(`https://studio.youtube.com/channel/${channelId}/videos/live`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(4000);

      const created = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('ytcp-video-row'));
        for (const row of rows) {
          const text = row.innerText || '';
          if (text.includes('Wieczór ze Słowem Bożym')) {
            const link = row.querySelector('a[href*="/video/"]');
            const href = link ? link.href : '';
            const match = href.match(/\/video\/([a-zA-Z0-9_-]+)/);
            return {
              videoId: match ? match[1] : null,
              text: text.replace(/\n+/g, ' | ')
            };
          }
        }
        return null;
      });
      videoId = created?.videoId;
      console.log('Created stream info:', created);
    }

    if (videoId) {
      console.log(`\n>>> Sukces! Stream znaleziony/utworzony: videoId = ${videoId}`);
      console.log(`>>> Link transmisji: https://youtube.com/live/${videoId}`);

      // Weryfikacja widoczności na stronie edycji
      console.log(`Przechodzę do edycji wideo: https://studio.youtube.com/video/${videoId}/edit`);
      await page.goto(`https://studio.youtube.com/video/${videoId}/edit`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(4000);

      const visText = await page.locator('ytcp-video-metadata-visibility').innerText().catch(() => '');
      console.log('Aktualna widoczność:', visText);

      if (!visText.includes('Publiczny') && !visText.includes('Public')) {
        console.log('Zmieniam widoczność na Publiczny...');
        await page.locator('ytcp-video-metadata-visibility').click();
        await page.waitForTimeout(1500);

        const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first();
        if (await pubRadio.isVisible().catch(() => false)) {
          await pubRadio.click();
          await page.waitForTimeout(1000);
        }

        const doneVisBtn = page.locator('#save-button, ytcp-button:has-text("Gotowe")').first();
        if (await doneVisBtn.isVisible().catch(() => false)) {
          await doneVisBtn.click();
          await page.waitForTimeout(1500);
        }

        const saveBtn = page.locator('ytcp-button#save, button:has-text("Zapisz")').first();
        if (await saveBtn.isVisible().catch(() => false)) {
          await saveBtn.click();
          console.log('Zapisano widoczność jako Publiczny!');
          await page.waitForTimeout(3000);
        }
      }

      // Screenshot weryfikacyjny
      const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';
      await page.screenshot({ path: `${artDir}/scheduled_Osobowosc_Plus.png` });
      console.log('Zapisano screenshot:', `${artDir}/scheduled_Osobowosc_Plus.png`);

      // Zapisz do pliku wynikowego
      fs.writeFileSync('scripts/osobowosc_result.json', JSON.stringify({
        channel: 'Osobowość +',
        status: 'PUBLIC',
        videoId: videoId,
        watchUrl: `https://youtube.com/live/${videoId}`,
        timestamp: new Date().toISOString()
      }, null, 2));
    } else {
      console.error('Nie udało się ustalić videoId dla Osobowość +');
    }

  } catch (err) {
    console.error('Błąd:', err);
  } finally {
    await ctx.close();
  }
}

main();
