import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const HISTORY_FILE = path.resolve('C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\data\\youtube_published_history.json');

export async function uploadEpisodeToChannel({
  videoPath,
  metaPath,
  channelId = 'UCCqHRCEuSDhlRcvcQ6qM1Kw',
  channelName = 'Biblia Audio Christian Culture',
  visibility = 'public'
}) {
  console.log('\n========================================================');
  console.log(`🚀 PUBLIKACJA NA KANALE: ${channelName} (${channelId})`);
  console.log('========================================================\n');

  if (!fs.existsSync(videoPath)) throw new Error(`Brak pliku: ${videoPath}`);

  let meta = {};
  if (metaPath && fs.existsSync(metaPath)) {
    try { meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch {}
  }

  const title = (meta.title || path.basename(videoPath, path.extname(videoPath))).slice(0, 100);
  const description = (meta.description || meta.full_description || title).slice(0, 5000);
  const tags = Array.isArray(meta.tags) ? meta.tags.join(', ') : (meta.tags || '');

  console.log(`• Tytuł: ${title}`);
  console.log(`• Plik: ${path.basename(videoPath)}`);
  console.log(`• Widoczność: ${visibility}`);

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    channel: 'chrome',
    viewport: { width: 1440, height: 900 },
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });

  const page = ctx.pages()[0] || await ctx.newPage();

  try {
    // 1. Przełącz sesję na żądany kanał
    if (channelName && (!channelId || !channelId.startsWith('UC'))) {
      console.log(`[1/5] Przełączam sesję na kanał: "${channelName}"...`);
      await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 35000 });
      await page.waitForTimeout(2000);

      const item = page.locator('ytd-account-item-renderer', { hasText: channelName }).first();
      for (let s = 0; s < 10; s++) {
        if (await item.count() > 0) break;
        await page.evaluate(() => window.scrollBy(0, 800));
        await page.waitForTimeout(500);
      }
      if (await item.count() > 0) {
        await item.click();
        await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
        await page.waitForTimeout(2000);
      }
      await page.goto('https://studio.youtube.com/?approve_browser_access=true', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
    } else {
      const studioUrl = `https://studio.youtube.com/channel/${channelId}?approve_browser_access=true`;
      console.log(`[1/5] Otwieram Studio kanału: ${studioUrl}`);
      await page.goto(studioUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(3000);
    }

    // Obsłuż ewentualny przycisk przejścia do Studio
    const proceed = page.locator('a[href*="approve_browser_access=true"], a:has-text("PRZEJDŹ DO YOUTUBE STUDIO")').first();
    if (await proceed.isVisible().catch(() => false)) {
      await proceed.click().catch(() => {});
      await page.waitForTimeout(3000);
    }

    // Zamknij ewentualne popupy/powiadomienia Studio (naruszenia, reklamy itp.)
    for (let pi = 0; pi < 3; pi++) {
      const popup = page.locator('ytcp-dialog paper-button:has-text("OK"), ytcp-dialog button:has-text("Rozumiem"), ytcp-dialog button:has-text("Zamknij"), tp-yt-paper-dialog button:has-text("OK"), tp-yt-paper-dialog button:has-text("Zamknij"), ytcp-button[dialog-confirm], button[dialog-confirm]').first();
      if (await popup.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('  -> Zamykam popup/powiadomienie Studio...');
        await popup.click({ force: true });
        await page.waitForTimeout(1000);
      } else break;
    }

    // Zamknij backdrop jeśli aktywny na stronie panelu (klikamy go przez JS — Playwright nie może przez backdrop)
    const hasPageBackdrop = await page.locator('tp-yt-iron-overlay-backdrop[opened]').first().isVisible().catch(() => false);
    if (hasPageBackdrop) {
      console.log('  -> Backdrop aktywny na panelu — zamykam przez JS click...');
      await page.evaluate(() => {
        const bd = document.querySelector('tp-yt-iron-overlay-backdrop[opened]');
        if (bd) bd.click();
      });
      await page.waitForTimeout(1000);
    }

    // 2. Kliknij Utwórz -> Prześlij filmy
    console.log('[2/5] Otwieram formularz przesyłania...');
    const createBtn = page.locator('#create-icon, ytcp-button#create-icon, button[aria-label*="Utwórz"], button[aria-label*="Create"]').first();
    await createBtn.waitFor({ state: 'visible', timeout: 25000 });
    // Upewnij się że backdrop zniknął przed kliknięciem Utwórz
    await page.evaluate(() => {
      const bd = document.querySelector('tp-yt-iron-overlay-backdrop[opened]');
      if (bd) bd.click();
    });
    await page.waitForTimeout(500);
    await createBtn.click({ force: true });
    await page.waitForTimeout(1200);

    const uploadMenu = page.locator(
      'tp-yt-paper-item:has-text("Prześlij filmy"), tp-yt-paper-item:has-text("Upload videos"), ytcp-text-menu-item:has-text("Prześlij")'
    ).first();
    await uploadMenu.waitFor({ state: 'visible', timeout: 10000 });
    await uploadMenu.click({ force: true });
    await page.waitForTimeout(2000);

    // Upewnij się że dialog uploadu jest naprawdę otwarty
    const uploadDialogVisible = await page.locator('input[type="file"]').first().isVisible({ timeout: 8000 }).catch(() => false);
    console.log(`  -> Input pliku widoczny: ${uploadDialogVisible}`);

    // 3. Wgraj plik
    console.log('[3/5] Przesyłanie pliku do formularza...');
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.waitFor({ state: 'attached', timeout: 20000 });
    await fileInput.setInputFiles(path.resolve(videoPath));
    console.log('  -> Plik zaakceptowany.');

    // 4. Wypełnij Tytuł, Opis, COPPA, Tagi
    console.log('[4/5] Uzupełnianie metadanych...');
    const titleBox = page.locator('#title-textarea #textbox, ytcp-social-suggestions-textbox#title-textarea div[contenteditable="true"]').first();
    await titleBox.waitFor({ state: 'visible', timeout: 45000 });
    await page.waitForTimeout(1000);
    await titleBox.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await titleBox.fill(title);
    await page.waitForTimeout(1000);

    // Usuń ewentualny dropdown podpowiedzi hashtagów, który zasłania pole opisu
    await page.evaluate(() => {
      const dd = document.querySelector('ytcp-social-suggestions-dropdown');
      if (dd) dd.remove();
    });
    await page.waitForTimeout(400);

    const descBox = page.locator('#description-textarea #textbox, ytcp-social-suggestions-textbox#description-textarea div[contenteditable="true"]').first();
    if (await descBox.count() > 0 && await descBox.isVisible()) {
      await descBox.click({ force: true });
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await descBox.fill(description);
      await page.waitForTimeout(1000);
    }

    // Ponownie usuń dropdown jeśli pojawił się po opisie
    await page.evaluate(() => {
      const dd = document.querySelector('ytcp-social-suggestions-dropdown');
      if (dd) dd.remove();
    });

    // COPPA: Nieprzeznaczony dla dzieci (opcjonalny dla kanałów z polityką globalną)
    const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
    if (await notForKids.isVisible().catch(() => false)) {
      await notForKids.scrollIntoViewIfNeeded().catch(() => {});
      await notForKids.click({ force: true }).catch(() => {});
      console.log('  -> COPPA: Zaznaczono Nie dla dzieci.');
    } else {
      console.log('  -> COPPA: Pominięto (domyślna polityka kanału).');
    }
    await page.waitForTimeout(1000);

    // Tagi (opcjonalne)
    if (tags) {
      try {
        const showMore = page.locator(
          'ytcp-button#toggle-button:has-text("Pokaż więcej"), ytcp-button#toggle-button:has-text("Show more"), button:has-text("Pokaż więcej")'
        ).first();
        if (await showMore.isVisible().catch(() => false)) {
          await showMore.click();
          await page.waitForTimeout(1000);
          
          // Usuń domyślne tagi kanału, aby uniknąć przekroczenia limitu 500 znaków
          await page.evaluate(() => {
            const clearBtn = document.querySelector('#tags-container ytcp-icon-button[id="delete-all-button"], #tags-container button[aria-label*="Usuń"], #tags-container [id*="delete-all"]');
            if (clearBtn) {
              clearBtn.click();
            } else {
              const chips = document.querySelectorAll('ytcp-chip #delete-icon, ytcp-chip-shape button, ytcp-chip [id="delete-icon"]');
              chips.forEach(c => c.click());
            }
          });
          await page.waitForTimeout(600);

          const tagsInput = page.locator('input[aria-label*="Tagi"], input[aria-label*="Tags"], #tags-container input').first();
          if (await tagsInput.isVisible().catch(() => false)) {
            // Bezpieczny limit tagów: max 300 znaków
            const safeTags = typeof tags === 'string' ? tags.slice(0, 320) : '';
            if (safeTags) {
              await tagsInput.fill(safeTags);
              await page.keyboard.press('Enter');
              await page.waitForTimeout(800);
            }
          }

          // Weryfikacja: jeśli tagi przekraczają dozwoloną liczbę znaków, usuwaj pojedynczo aż błąd zniknie
          for (let ti = 0; ti < 10; ti++) {
            const hasTagError = await page.evaluate(() => {
              const text = document.body.innerText || '';
              return text.includes('Tagi przekraczają dozwoloną liczbę znaków') ||
                     !!document.querySelector('#tags-container [invalid], #tags-container.invalid');
            });
            if (hasTagError) {
              console.log('  -> Wykryto przekroczenie limitu tagów! Usuwam ostatni tag...');
              await page.evaluate(() => {
                const chips = document.querySelectorAll('ytcp-chip #delete-icon, ytcp-chip-shape button, ytcp-chip [id="delete-icon"]');
                if (chips.length > 0) chips[chips.length - 1].click();
              });
              await page.waitForTimeout(500);
            } else {
              break;
            }
          }
        }
      } catch (err) {
        console.warn('  -> Tagi pominięte:', err.message);
      }
    }

    // Pobierz stały link wideo jeśli dostępny
    let videoUrl = '';
    try {
      const linkElem = page.locator('span.video-url-fadeable a, a.ytcp-video-info, a[href*="youtu.be"], a.ytcp-video-share-dialog, a[href*="/shorts/"]').first();
      await linkElem.waitFor({ state: 'attached', timeout: 15000 });
      videoUrl = (await linkElem.getAttribute('href')) || (await linkElem.innerText()) || '';
      if (videoUrl) console.log(`  -> Stały URL filmu: ${videoUrl}`);
    } catch {}

    // 5. Pętla przechodzenia przez kroki aż do kroku Widoczność
    console.log('[5/5] Przechodzenie do widoczności i publikacja...');
    let reachedVisibility = false;
    let monetizationDone = false;
    let adRatingDone = false;

    // Pętla: max 120 iteracji × ~5s = ~10 minut — wystarczy na upload dużego pliku 4K
    for (let step = 0; step < 120; step++) {
      await page.waitForTimeout(3000);
      if (step % 5 === 0) console.log(`  [pętla krok ${step}] sprawdzam stan formularza...`);

      // Czy radio PUBLIC jest widoczne? → koniec pętli
      const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first();
      if (await pubRadio.isVisible().catch(() => false)) {
        console.log(`  -> Osiągnięto krok Widoczność (iteracja ${step})!`);
        reachedVisibility = true;
        break;
      }

      // UWAGA: NIE sprawdzamy iron-overlay-backdrop — backdrop dialogu YT Studio to normalny
      // element tła modalu, NIE blokuje kliknięć w przyciski dialogu.
      // Pressing Escape zamknęłoby cały dialog uploadu!

      // Krok Zarabianie (Monetization)
      if (!monetizationDone) {
        const monetContainer = page.locator('ytcp-uploads-monetization').first();
        if (await monetContainer.isVisible().catch(() => false)) {
          const m10nTrigger = monetContainer.locator('div.m10n-text.clickable, ytcp-video-monetization').first();
          if (await m10nTrigger.isVisible().catch(() => false)) {
            const triggerText = await m10nTrigger.innerText().catch(() => '');
            const needsAction = triggerText.includes('Wybierz') || triggerText.trim() === '' || triggerText.includes('Select');
            if (!needsAction) {
              console.log(`  -> Krok Zarabianie: już ustawione ("${triggerText.trim()}"), oznaczam jako gotowe.`);
              monetizationDone = true;
            } else {
              console.log(`  -> Krok Zarabianie: otwieram wybór...`);
              // Usuń dropdown podpowiedzi (NIE Escape — zamknęłoby dialog)
              await page.evaluate(() => { document.querySelector('ytcp-social-suggestions-dropdown')?.remove(); });
              await page.waitForTimeout(400);
              await m10nTrigger.click({ force: true });
              await page.waitForTimeout(1500);

              const radioOn = page.locator('tp-yt-paper-radio-button#radio-on, tp-yt-paper-radio-button[name="ON"]').first();
              if (await radioOn.isVisible().catch(() => false)) {
                console.log(`  -> Wybieram Włącz...`);
                await radioOn.click({ force: true });
                await page.waitForTimeout(800);
              }

              const doneM10n = page.locator('ytcp-button:has-text("Gotowe"), button:has-text("Gotowe")').first();
              if (await doneM10n.isVisible().catch(() => false)) {
                console.log(`  -> Klikam Gotowe monetization...`);
                await doneM10n.click({ force: true });
                await page.waitForTimeout(2000);
                monetizationDone = true;
              }
            }
          }
        }
      }

      // Krok Możliwość wyświetlania reklam (Ad suitability)
      if (!adRatingDone) {
        const noneBox = page.locator('ytcp-checkbox-lit.all-none-checkbox, ytcp-checkbox-lit:has-text("Żadne z powyższych")').first();
        if (await noneBox.isVisible().catch(() => false)) {
          console.log(`  -> Krok Ocena reklam: zaznaczam "Żadne z powyższych"...`);
          await noneBox.scrollIntoViewIfNeeded().catch(() => {});
          await noneBox.click({ force: true });
          await page.waitForTimeout(1500);

          const submitRatingBtn = page.locator('ytcp-button:has-text("Prześlij ocenę"), button:has-text("Prześlij ocenę")').first();
          if (await submitRatingBtn.isVisible().catch(() => false)) {
            console.log(`  -> Klikam "Prześlij ocenę"...`);
            await submitRatingBtn.click({ force: true });
            await page.waitForTimeout(2500);
            adRatingDone = true;
          }
        }
      }

      // Kliknij przycisk Dalej — bezwarunkowo (backdrop dialogu nie blokuje kliknięć)
      const nextBtn = page.locator('#next-button, ytcp-button#next-button').first();
      if (await nextBtn.isVisible().catch(() => false)) {
        const isDis = await nextBtn.getAttribute('aria-disabled').catch(() => 'false');
        if (isDis !== 'true') {
          console.log(`  -> Klikam Dalej (iteracja ${step})...`);
          await nextBtn.click({ force: true });
          await page.waitForTimeout(2500);
        } else {
          // Jeśli Dalej zablokowany, sprawdź czy tagi nie generują błędu walidacji
          const hasTagError = await page.evaluate(() => {
            return (document.body.innerText || '').includes('Tagi przekraczają dozwoloną liczbę znaków');
          }).catch(() => false);
          if (hasTagError) {
            console.log(`  -> [Auto-fix] Błąd limitu tagów blokuje Dalej! Usuwam chipy tagów...`);
            await page.evaluate(() => {
              const chips = document.querySelectorAll('ytcp-chip #delete-icon, ytcp-chip-shape button, ytcp-chip [id="delete-icon"]');
              if (chips.length > 0) chips[chips.length - 1].click();
            });
            await page.waitForTimeout(1000);
          } else {
            // Dalej zablokowany = plik wciąż się przesyła. Czekamy cicho.
            if (step % 10 === 0) console.log(`  -> Dalej zablokowany — oczekuję na zakończenie przesyłania (iteracja ${step})...`);
            await page.waitForTimeout(3000);
          }
        }
      } else {
        if (step % 10 === 0) console.log(`  -> Brak przycisku Dalej (iteracja ${step}), czekam...`);
        await page.waitForTimeout(3000);
      }
    }

    // Ustaw widoczność
    if (!reachedVisibility) {
      // Ostatnia szansa: poczekaj jeszcze 15s na pojawienie się kroku Widoczność
      console.log('  -> Pętla zakończona bez widoczności — czekam dodatkowe 15s...');
      await page.waitForTimeout(15000);
      const pubFinal = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first();
      reachedVisibility = await pubFinal.isVisible().catch(() => false);
      if (!reachedVisibility) {
        // Zrób screenshot diagnostyczny
        await page.screenshot({ path: 'youtube_publish_visibility_debug.png', fullPage: true });
        throw new Error('Nie osiągnięto kroku Widoczność po 40 iteracjach + 15s. Screenshot: youtube_publish_visibility_debug.png');
      }
    }

    if (visibility === 'unlisted') {
      const unlisted = page.locator('tp-yt-paper-radio-button[name="UNLISTED"], [name="UNLISTED"]').first();
      await unlisted.click({ force: true });
    } else if (visibility === 'private') {
      const priv = page.locator('tp-yt-paper-radio-button[name="PRIVATE"], [name="PRIVATE"]').first();
      await priv.click({ force: true });
    } else {
      const pub = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"]').first();
      await pub.waitFor({ state: 'visible', timeout: 15000 });
      await pub.click({ force: true });
    }
    await page.waitForTimeout(1500);

    // Kliknij Publikuj / Zapisz
    const doneBtn = page.locator('#done-button, button#done-button, ytcp-button#done-button, button:has-text("Opublikuj"), button:has-text("Publish")').first();
    await doneBtn.waitFor({ state: 'visible', timeout: 15000 });
    await doneBtn.click();

    console.log('Oczekiwanie na potwierdzenie publikacji przez YouTube...');
    await page.waitForTimeout(8000);

    if (!videoUrl) {
      try {
        const finalLink = page.locator('a.ytcp-video-share-dialog, a[href*="youtu.be"], a[href*="/shorts/"], #share-url a, input#share-url, input[readonly][value*="youtu.be"]').first();
        if (await finalLink.count() > 0) {
          videoUrl = (await finalLink.getAttribute('href')) || (await finalLink.getAttribute('value')) || (await finalLink.innerText()) || '';
        }
      } catch {}
    }

    console.log('\n========================================================');
    console.log(`🎉 SUKCES! Film opublikowany na kanale: ${channelName}`);
    console.log(`🔗 Link do filmu: ${videoUrl}`);
    console.log('========================================================\n');

    // Zapisz do bazy historii
    try {
      const dir = path.dirname(HISTORY_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      let data = { version: '1.0', published: [] };
      if (fs.existsSync(HISTORY_FILE)) data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
      data.published.push({
        title,
        videoFile: path.basename(videoPath),
        channel: channelName,
        channelId,
        videoUrl: videoUrl || 'https://studio.youtube.com',
        visibility,
        publishedAt: new Date().toISOString()
      });
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch {}

    await ctx.close();
    return { success: true, title, videoUrl, channel: channelName };

  } catch (err) {
    console.error(`❌ BŁĄD PUBLIKACJI:`, err.message);
    try {
      await page.screenshot({ path: 'youtube_publish_final_error.png', fullPage: true });
      console.log('Zrzut ekranu zapisany do: youtube_publish_final_error.png');
    } catch {}
    await ctx.close();
    throw err;
  }
}

if (process.argv[1] && process.argv[1].endsWith('publish_perfect.mjs')) {
  const args = process.argv.slice(2);
  let video = args[0] || 'C:\\Users\\czark\\Desktop\\Biblia Audio CC — Gotowe do Emisji\\01_Stary_Testament\\01_Ksiega_Rodzaju\\Ksiega_Rodzaju_1_1-19_Biblia_Audio_CC_4K.mp4';
  let meta = args[1] || 'C:\\Users\\czark\\Desktop\\Biblia Audio CC — Gotowe do Emisji\\01_Stary_Testament\\01_Ksiega_Rodzaju\\Ksiega_Rodzaju_1_1-19_metadata.json';
  let chId = args[2] || 'UCCqHRCEuSDhlRcvcQ6qM1Kw';
  let chName = args[3] || 'Biblia Audio Christian Culture';

  uploadEpisodeToChannel({ videoPath: video, metaPath: meta, channelId: chId, channelName: chName, visibility: 'public' })
    .catch(() => process.exit(1));
}
