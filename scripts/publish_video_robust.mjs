import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const PROFILE_DIR = path.join(process.env.USERPROFILE || 'C:\\Users\\czark', '.youtube_browser_profile');
const HISTORY_FILE = path.join(ROOT, 'data', 'youtube_published_history.json');

function saveToHistory(record) {
  try {
    const dir = path.dirname(HISTORY_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    let data = { version: '1.0', published: [] };
    if (fs.existsSync(HISTORY_FILE)) {
      data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    }
    data.published.push(record);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn('[WARN] Nie udało się zapisać do historii:', err.message);
  }
}

export async function publishToYouTubeChannel({
  videoPath,
  metaPath,
  channelName = 'Biblia Audio Christian Culture',
  visibility = 'public',
  headed = false
}) {
  console.log('\n========================================================');
  console.log(`🚀 PUBLIKACJA DO YOUTUBE: [${channelName}]`);
  console.log('========================================================\n');

  if (!fs.existsSync(videoPath)) {
    throw new Error(`Brak pliku wideo: ${videoPath}`);
  }

  let meta = {};
  if (metaPath && fs.existsSync(metaPath)) {
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    } catch {}
  }

  const title = (meta.title || path.basename(videoPath, path.extname(videoPath))).slice(0, 100);
  const description = (meta.description || meta.full_description || title).slice(0, 5000);
  const tags = Array.isArray(meta.tags) ? meta.tags.join(', ') : (meta.tags || '');

  console.log(`• Plik: ${path.basename(videoPath)}`);
  console.log(`• Tytuł: ${title}`);
  console.log(`• Kanał: ${channelName}`);
  console.log(`• Widoczność: ${visibility}`);

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: !headed,
    channel: 'chrome',
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });

  const page = context.pages()[0] || await context.newPage();

  try {
    // 1. Przełącz na wskazany kanał
    console.log(`[1/6] Ustawianie aktywnego kanału: "${channelName}"...`);
    await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'networkidle', timeout: 35000 });
    await page.waitForTimeout(2000);

    const channelItem = page.locator('ytd-account-item-renderer', { hasText: channelName }).first();
    const count = await channelItem.count();
    if (count > 0) {
      await channelItem.click();
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(2000);
    } else {
      console.log(`  -> Kanał "${channelName}" nie wymaga przełączenia lub jest już aktywny.`);
    }

    // 2. Otwórz YouTube Studio
    console.log('[2/6] Otwieram YouTube Studio...');
    await page.goto('https://studio.youtube.com', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3000);

    // Odrzuć ewentualny banner
    const proceedBtn = page.locator('text="PRZEJDŹ DO YOUTUBE STUDIO", text="PROCEED TO YOUTUBE STUDIO"').first();
    if (await proceedBtn.count() > 0) {
      await proceedBtn.click().catch(() => {});
      await page.waitForTimeout(2000);
    }

    // Sprawdź czy widzimy nazwę kanału
    const activeHeader = await page.locator('#channel-title, #entity-name').allInnerTexts().catch(() => []);
    console.log('  -> Aktywny pulpit Studio:', activeHeader);

    // 3. Kliknij "Utwórz" -> "Prześlij filmy"
    console.log('[3/6] Otwieram formularz przesyłania...');
    const createBtn = page.locator('#create-icon, ytcp-button#create-icon, button[aria-label*="Utwórz"], button[aria-label*="Create"]').first();
    await createBtn.waitFor({ state: 'visible', timeout: 20000 });
    await createBtn.click();
    await page.waitForTimeout(1000);

    const uploadMenuItem = page.locator('tp-yt-paper-item:has-text("Prześlij filmy"), tp-yt-paper-item:has-text("Upload videos"), ytcp-text-menu-item:has-text("Prześlij"), ytcp-text-menu-item:has-text("Upload")').first();
    await uploadMenuItem.waitFor({ state: 'visible', timeout: 10000 });
    await uploadMenuItem.click();
    await page.waitForTimeout(1500);

    // 4. Przekaż plik do input[type=file]
    console.log('[4/6] Wgrywanie pliku wideo...');
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.waitFor({ state: 'attached', timeout: 20000 });
    await fileInput.setInputFiles(path.resolve(videoPath));
    console.log('  -> Plik przekazany do silnika przesyłania.');

    // Czekaj na pole tytułu
    console.log('[5/6] Wypełnianie metadanych filmu...');
    const titleBox = page.locator('#title-textarea #textbox, ytcp-social-suggestions-textbox#title-textarea div[contenteditable="true"]').first();
    await titleBox.waitFor({ state: 'visible', timeout: 40000 });
    await titleBox.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await titleBox.fill(title);
    await page.waitForTimeout(1000);

    // Opis
    const descBox = page.locator('#description-textarea #textbox, ytcp-social-suggestions-textbox#description-textarea div[contenteditable="true"]').first();
    if (await descBox.count() > 0) {
      await descBox.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await descBox.fill(description);
      await page.waitForTimeout(1000);
    }

    // COPPA: nie dla dzieci
    const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], [name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
    await notForKids.waitFor({ state: 'visible', timeout: 15000 });
    await notForKids.click();
    await page.waitForTimeout(1000);

    // Tagi
    if (tags) {
      try {
        const showMoreBtn = page.locator('ytcp-button#toggle-button:has-text("Pokaż więcej"), ytcp-button#toggle-button:has-text("Show more"), button:has-text("Pokaż więcej")').first();
        if (await showMoreBtn.count() > 0) {
          await showMoreBtn.click();
          await page.waitForTimeout(1000);
          const tagsInput = page.locator('input[aria-label*="Tagi"], input[aria-label*="Tags"], #tags-container input').first();
          if (await tagsInput.count() > 0) {
            await tagsInput.fill(tags);
            await page.keyboard.press('Enter');
          }
        }
      } catch (err) {
        console.warn('  -> Błąd przy wprowadzaniu tagów (pomijam):', err.message);
      }
    }

    // Odczytaj wygenerowany link do filmu (np. https://youtu.be/xyz)
    let videoUrl = '';
    try {
      const linkElem = page.locator('span.video-url-fadeable a, a.ytcp-video-info, a[href*="youtu.be"]').first();
      await linkElem.waitFor({ state: 'attached', timeout: 10000 });
      videoUrl = await linkElem.getAttribute('href') || await linkElem.innerText();
      console.log(`  -> Przypisany stały URL filmu: ${videoUrl}`);
    } catch {
      console.log('  -> Link zostanie pobrany w oknie końcowym.');
    }

    // 6. Przejdź przez kroki: Dalej -> Dalej -> Dalej -> Widoczność
    console.log('[6/6] Konfiguracja widoczności i zatwierdzenie...');
    for (let step = 1; step <= 3; step++) {
      const nextBtn = page.locator('#next-button, button#next-button').first();
      await nextBtn.waitFor({ state: 'visible', timeout: 15000 });
      await nextBtn.click();
      await page.waitForTimeout(2000);
    }

    // Wybór widoczności
    if (visibility === 'unlisted') {
      await page.locator('tp-yt-paper-radio-button[name="UNLISTED"], [name="UNLISTED"]').first().click();
    } else if (visibility === 'private') {
      await page.locator('tp-yt-paper-radio-button[name="PRIVATE"], [name="PRIVATE"]').first().click();
    } else {
      await page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"]').first().click();
    }
    await page.waitForTimeout(1500);

    // Kliknij "Zapisz" / "Opublikuj"
    const doneBtn = page.locator('#done-button, button#done-button, ytcp-button#done-button').first();
    await doneBtn.waitFor({ state: 'visible', timeout: 15000 });
    await doneBtn.click();

    console.log('Oczekiwanie na finalizację publikacji...');
    await page.waitForTimeout(6000);

    if (!videoUrl) {
      try {
        const finalLink = page.locator('a.ytcp-video-share-dialog, a[href*="youtu.be"]').first();
        if (await finalLink.count() > 0) {
          videoUrl = await finalLink.getAttribute('href');
        }
      } catch {}
    }

    console.log('\n========================================================');
    console.log(`🎉 SUKCES! Wideo opublikowane na kanale: ${channelName}`);
    console.log(`🔗 Link: ${videoUrl || 'Sprawdź w YouTube Studio'}`);
    console.log('========================================================\n');

    saveToHistory({
      videoFile: path.basename(videoPath),
      title,
      channel: channelName,
      videoUrl: videoUrl || 'https://studio.youtube.com',
      visibility,
      publishedAt: new Date().toISOString()
    });

    await context.close();
    return { success: true, title, videoUrl, channel: channelName };
  } catch (err) {
    console.error(`\n❌ BŁĄD PUBLIKACJI:`, err.message);
    try {
      await page.screenshot({ path: path.join(ROOT, 'youtube_upload_error.png'), fullPage: true });
      console.log('Zrzut ekranu zapisany do: youtube_upload_error.png');
    } catch {}
    await context.close();
    throw err;
  }
}

if (process.argv[1] && process.argv[1].endsWith('publish_video_robust.mjs')) {
  const args = process.argv.slice(2);
  let videoPath = null;
  let metaPath = null;
  let channelName = 'Biblia Audio Christian Culture';
  let visibility = 'public';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--video' && args[i + 1]) videoPath = args[i + 1];
    else if (args[i] === '--meta' && args[i + 1]) metaPath = args[i + 1];
    else if (args[i] === '--channel' && args[i + 1]) channelName = args[i + 1];
    else if (args[i] === '--visibility' && args[i + 1]) visibility = args[i + 1];
  }

  if (!videoPath) {
    console.log('Użycie: node scripts/publish_video_robust.mjs --video <plik.mp4> [--meta <meta.json>] [--channel <nazwa>] [--visibility public]');
    process.exit(1);
  }

  publishToYouTubeChannel({ videoPath, metaPath, channelName, visibility })
    .catch(() => process.exit(1));
}
