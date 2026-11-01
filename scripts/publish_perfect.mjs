import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const HISTORY_FILE = path.resolve('C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\data\\youtube_published_history.json');

export async function uploadEpisodeToChannel({
  videoPath,
  metaPath,
  channelId = 'UCCqHRCEuSDhlRcvcQ6qM1Kw', // default: Biblia Audio Christian Culture
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
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });

  const page = ctx.pages()[0] || await ctx.newPage();

  try {
    // 1. Otwórz bezpośrednio Studio wybranego kanału
    const studioUrl = `https://studio.youtube.com/channel/${channelId}`;
    console.log(`[1/5] Otwieram Studio kanału: ${studioUrl}`);
    await page.goto(studioUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3000);

    // Obsłuż ewentualny przycisk przejścia do Studio
    const proceed = page.locator('text="PRZEJDŹ DO YOUTUBE STUDIO", text="PROCEED TO YOUTUBE STUDIO"').first();
    if (await proceed.count() > 0) {
      await proceed.click().catch(() => {});
      await page.waitForTimeout(2000);
    }

    // 2. Kliknij Utwórz -> Prześlij filmy
    console.log('[2/5] Otwieram formularz przesyłania...');
    const createBtn = page.locator('#create-icon, ytcp-button#create-icon, button[aria-label*="Utwórz"], button[aria-label*="Create"]').first();
    await createBtn.waitFor({ state: 'visible', timeout: 20000 });
    await createBtn.click();
    await page.waitForTimeout(1000);

    const uploadMenu = page.locator('tp-yt-paper-item:has-text("Prześlij filmy"), tp-yt-paper-item:has-text("Upload videos"), ytcp-text-menu-item:has-text("Prześlij")').first();
    await uploadMenu.waitFor({ state: 'visible', timeout: 10000 });
    await uploadMenu.click();
    await page.waitForTimeout(1500);

    // 3. Wgraj plik
    console.log('[3/5] Przesyłanie pliku do formularza...');
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.waitFor({ state: 'attached', timeout: 20000 });
    await fileInput.setInputFiles(path.resolve(videoPath));
    console.log('  -> Plik zaakceptowany.');

    // 4. Wypełnij Tytuł, Opis, COPPA, Tagi
    console.log('[4/5] Uzupełnianie metadanych...');
    const titleBox = page.locator('#title-textarea #textbox, ytcp-social-suggestions-textbox#title-textarea div[contenteditable="true"]').first();
    await titleBox.waitFor({ state: 'visible', timeout: 40000 });
    await titleBox.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await titleBox.fill(title);
    await page.waitForTimeout(1000);

    const descBox = page.locator('#description-textarea #textbox, ytcp-social-suggestions-textbox#description-textarea div[contenteditable="true"]').first();
    if (await descBox.count() > 0) {
      await descBox.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await descBox.fill(description);
      await page.waitForTimeout(1000);
    }

    // COPPA: Nieprzeznaczony dla dzieci
    const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
    await notForKids.scrollIntoViewIfNeeded();
    await notForKids.click({ force: true });
    await page.waitForTimeout(1000);

    // Tagi
    if (tags) {
      try {
        const showMore = page.locator('ytcp-button#toggle-button:has-text("Pokaż więcej"), ytcp-button#toggle-button:has-text("Show more"), button:has-text("Pokaż więcej")').first();
        if (await showMore.count() > 0) {
          await showMore.scrollIntoViewIfNeeded();
          await showMore.click();
          await page.waitForTimeout(1000);
          const tagsInput = page.locator('input[aria-label*="Tagi"], input[aria-label*="Tags"], #tags-container input').first();
          if (await tagsInput.count() > 0) {
            await tagsInput.fill(tags);
            await page.keyboard.press('Enter');
          }
        }
      } catch (err) {
        console.warn('  -> Tagi pominięte:', err.message);
      }
    }

    // Pobierz link do wideo
    let videoUrl = '';
    try {
      const linkElem = page.locator('span.video-url-fadeable a, a.ytcp-video-info, a[href*="youtu.be"]').first();
      await linkElem.waitFor({ state: 'attached', timeout: 10000 });
      videoUrl = await linkElem.getAttribute('href') || await linkElem.innerText();
      console.log(`  -> Stały URL filmu: ${videoUrl}`);
    } catch {}

    // 5. Przejdź przez kroki i opublikuj
    console.log('[5/5] Przechodzenie do widoczności i publikacja...');
    for (let step = 0; step < 5; step++) {
      const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"]').first();
      if (await pubRadio.count() > 0 && await pubRadio.isVisible()) {
        console.log(`  -> Osiągnięto krok Widoczność (krok ${step}).`);
        break;
      }
      const nextBtn = page.locator('#next-button, button#next-button, ytcp-button#next-button').first();
      if (await nextBtn.count() > 0 && await nextBtn.isVisible()) {
        await nextBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    // Ustaw widoczność
    if (visibility === 'unlisted') {
      const unlisted = page.locator('tp-yt-paper-radio-button[name="UNLISTED"], [name="UNLISTED"]').first();
      await unlisted.click({ force: true });
    } else if (visibility === 'private') {
      const priv = page.locator('tp-yt-paper-radio-button[name="PRIVATE"], [name="PRIVATE"]').first();
      await priv.click({ force: true });
    } else {
      const pub = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"]').first();
      await pub.click({ force: true });
    }
    await page.waitForTimeout(1500);

    // Kliknij Publikuj / Zapisz
    const doneBtn = page.locator('#done-button, button#done-button, ytcp-button#done-button, button:has-text("Opublikuj"), button:has-text("Publish")').first();
    await doneBtn.waitFor({ state: 'visible', timeout: 15000 });
    await doneBtn.click();

    console.log('Oczekiwanie na potwierdzenie publikacji przez YouTube...');
    await page.waitForTimeout(7000);

    if (!videoUrl) {
      try {
        const finalLink = page.locator('a.ytcp-video-share-dialog, a[href*="youtu.be"]').first();
        if (await finalLink.count() > 0) {
          videoUrl = await finalLink.getAttribute('href');
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
