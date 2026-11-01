#!/usr/bin/env node
/**
 * BIBLIA AUDIO CC -> YOUTUBE STUDIO PLAYWRIGHT PUBLISHER
 *
 * 100% BEZPŁATNA AUTOMATYZACJA (0 PLN, BEZ LIMITÓW API)
 *
 * Silnik: Playwright Persistent Browser Context
 * Profil sesji: C:\Users\czark\.youtube_browser_profile
 * Standard: ZERO COST / JOMA-D005 / @A001 / CC Studio DAW
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Stały katalog profilu użytkownika (poza gitem)
const PROFILE_DIR = path.join(process.env.USERPROFILE || 'C:\\Users\\czark', '.youtube_browser_profile');
const HISTORY_FILE = path.join(ROOT, 'data', 'youtube_published_history.json');

// Rejestr historii publikacji
function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    }
  } catch (err) {
    console.warn('[WARN] Błąd odczytu historii YouTube:', err.message);
  }
  return { version: '1.0', published: [] };
}

function saveHistory(history) {
  try {
    const dir = path.dirname(HISTORY_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
  } catch (err) {
    console.error('[BŁĄD] Nie udało się zapisać historii YouTube:', err.message);
  }
}

// Uruchomienie kontekstu przeglądarki
async function getBrowserContext(headless = true) {
  if (!fs.existsSync(PROFILE_DIR)) {
    fs.mkdirSync(PROFILE_DIR, { recursive: true });
  }

  const launchOptions = {
    headless,
    channel: 'chrome',
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-infobars'
    ]
  };

  let context;
  try {
    context = await chromium.launchPersistentContext(PROFILE_DIR, launchOptions);
  } catch (err) {
    delete launchOptions.channel;
    context = await chromium.launchPersistentContext(PROFILE_DIR, launchOptions);
  }

  return context;
}

// Sprawdzenie stanu logowania
async function checkLoginState(page) {
  await page.goto('https://studio.youtube.com', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);

  const url = page.url();
  if (url.includes('accounts.google.com') || url.includes('signin')) {
    return false;
  }

  // Sprawdź czy widzimy elementy YouTube Studio
  const isStudio = await page.evaluate(() => {
    return !!(document.querySelector('#create-icon') || document.querySelector('ytcp-button#create-icon') || document.querySelector('button[aria-label*="Utwórz"]') || document.querySelector('button[aria-label*="Create"]'));
  });

  return isStudio || url.includes('studio.youtube.com/channel/');
}

const KNOWN_CHANNELS = {
  'Biblia Audio Christian Culture': 'UCCqHRCEuSDhlRcvcQ6qM1Kw',
  'Christian Culture TV': 'UCHmPxDM2zzlUAf5ZvlotPLw'
};

// Przełączanie kanału w ramach sesji YouTube Studio
async function switchChannelInStudio(page, targetChannel) {
  if (!targetChannel) return;
  console.log(`[Kanał] Przełączam sesję na wskazany kanał: "${targetChannel}"...`);

  // Jeśli kanał ma znany stały identyfikator, przechodzimy bezpośrednio
  const channelId = KNOWN_CHANNELS[targetChannel] || (targetChannel.startsWith('UC') ? targetChannel : null);
  if (channelId) {
    const directUrl = `https://studio.youtube.com/channel/${channelId}`;
    await page.goto(directUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Obsłuż ewentualny przycisk "PRZEJDŹ DO YOUTUBE STUDIO"
    const proceedBtn = page.locator('text="PRZEJDŹ DO YOUTUBE STUDIO", text="PROCEED TO YOUTUBE STUDIO"').first();
    if (await proceedBtn.count() > 0) {
      await proceedBtn.click().catch(() => {});
      await page.waitForTimeout(2000);
    }

    if (page.url().includes(channelId)) {
      console.log(`[Kanał] Pomyślnie otwarto Studio kanału ${targetChannel} (${directUrl})`);
      return;
    }
  }

  // W przeciwnym razie przełączamy przez channel_switcher
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2500);

  const item = page.locator('ytd-account-item-renderer', { hasText: targetChannel }).first();
  const count = await item.count();
  if (count === 0) {
    console.warn(`[OSTRZEŻENIE] Nie znaleziono kanału "${targetChannel}" na liście switcher. Sprawdzam bieżący panel.`);
    await page.goto('https://studio.youtube.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
    return;
  }

  await item.click();
  await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await page.goto('https://studio.youtube.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  console.log(`[Kanał] Pomyślnie ustawiono aktywny kanał.`);
}

// Tryb interaktywnego logowania (zaloguj_do_youtube.bat)
async function runLogin() {
  console.log('\n========================================================');
  console.log('🔴 YOUTUBE STUDIO — JEDNORAZOWE LOGOWANIE DO KONTA');
  console.log('   Standard: ZERO COST (Playwright Persistent Session)');
  console.log('========================================================\n');
  console.log('Otwieram przeglądarkę Chrome z panelem YouTube Studio...');
  console.log('Profil sesji:', PROFILE_DIR);
  console.log('\nINSTRUKCJA DLA DOWÓDCY:');
  console.log('1. Zaloguj się na oficjalne konto Google / kanał YouTube.');
  console.log('2. Upewnij się, że widzisz pulpit YouTube Studio (studio.youtube.com).');
  console.log('3. Po zalogowaniu możesz po prostu zamknąć okno przeglądarki.\n');

  const context = await getBrowserContext(false);
  const page = context.pages()[0] || await context.newPage();

  await page.goto('https://studio.youtube.com', { waitUntil: 'domcontentloaded' });

  console.log('Oczekuję na zalogowanie (okno otwarte)...');

  // Pętla sprawdzająca stan sesji co 5s
  let loggedIn = false;
  for (let i = 0; i < 120; i++) {
    await page.waitForTimeout(5000);
    try {
      const url = page.url();
      if (!url.includes('accounts.google.com') && (url.includes('studio.youtube.com/channel') || await page.$('#create-icon'))) {
        loggedIn = true;
        break;
      }
    } catch {
      // Okno mogło zostać zamknięte przez użytkownika
      break;
    }
  }

  if (loggedIn) {
    console.log('\n✅ SUKCES! Zalogowano pomyślnie do YouTube Studio!');
    console.log('Sesja została trwale zapisana w profilu. Kolejne publikacje będą wykonywać się w 100% automatycznie w tle.');
  } else {
    console.log('\n[INFO] Zakończono sesję logowania. Stan profilu zaktualizowany.');
  }

  await context.close();
}

// Główna funkcja publikująca wideo
async function uploadToYouTube({ videoPath, metaPath, visibility = 'public', headed = false, channel = null }) {
  console.log('\n========================================================');
  console.log('🚀 YOUTUBE STUDIO AUTO-PUBLISHER (PLAYWRIGHT)');
  console.log('========================================================\n');

  if (!fs.existsSync(videoPath)) {
    throw new Error(`Nie znaleziono pliku wideo: ${videoPath}`);
  }

  // Wczytaj metadane (z pliku .json lub .txt)
  let meta = {};
  if (metaPath && fs.existsSync(metaPath)) {
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    } catch {
      console.warn('[WARN] Nie udało się sparsować pliku JSON z metadanymi, używam wartości domyślnych.');
    }
  }

  const title = (meta.title || path.basename(videoPath, path.extname(videoPath))).slice(0, 100);
  const description = (meta.description || meta.full_description || title).slice(0, 5000);
  const tags = Array.isArray(meta.tags) ? meta.tags.join(', ') : (meta.tags || '');

  console.log('Parametry publikacji:');
  console.log('• Wideo:', path.basename(videoPath));
  console.log('• Tytuł:', title);
  console.log('• Kanał docelowy:', channel || '(aktywny domyślny)');
  console.log('• Widoczność:', visibility);
  console.log('• Długość opisu:', description.length, 'znaków');
  console.log('• Tagi:', tags.slice(0, 80) + '...');

  const context = await getBrowserContext(!headed);
  const page = context.pages()[0] || await context.newPage();

  try {
    console.log('\n[1/7] Otwieram YouTube Studio...');
    const isLoggedIn = await checkLoginState(page);
    if (!isLoggedIn) {
      throw new Error(
        'Brak aktywnej sesji Google w YouTube Studio!\n' +
        'Uruchom najpierw jednorazowo: scripts/zaloguj_do_youtube.bat aby zalogować konto.'
      );
    }
    console.log('  -> Sesja aktywna, zalogowano do YouTube Studio.');

    if (channel) {
      await switchChannelInStudio(page, channel);
    }

    // 2. Kliknij przycisk "Utwórz" / "Create"
    console.log('[2/7] Otwieram okno przesyłania filmów...');
    const createBtn = await page.waitForSelector(
      '#create-icon, ytcp-button#create-icon, button[aria-label*="Utwórz"], button[aria-label*="Create"]',
      { timeout: 15000 }
    );
    await createBtn.click();
    await page.waitForTimeout(1000);

    // Wybierz "Prześlij filmy" / "Upload videos"
    const uploadMenuItem = await page.waitForSelector(
      'tp-yt-paper-item:has-text("Prześlij filmy"), tp-yt-paper-item:has-text("Upload videos"), ytcp-text-menu-item:has-text("Prześlij"), ytcp-text-menu-item:has-text("Upload")',
      { timeout: 10000 }
    );
    await uploadMenuItem.click();
    await page.waitForTimeout(1500);

    // 3. Wgraj plik wideo
    console.log('[3/7] Przesyłanie pliku wideo do formularza...');
    const fileInput = await page.waitForSelector('input[type="file"]', { state: 'attached', timeout: 20000 });
    await fileInput.setInputFiles(path.resolve(videoPath));
    console.log('  -> Plik przekazany do formularza YouTube.');

    // Czekaj na załadowanie formularza szczegółów filmu
    await page.waitForSelector('#dialog, ytcp-uploads-dialog', { timeout: 30000 });
    await page.waitForTimeout(3000);

    // 4. Ustaw Tytuł i Opis
    console.log('[4/7] Uzupełnianie tytułu i opisu...');
    const titleBox = await page.waitForSelector(
      '#title-textarea #textbox, ytcp-social-suggestions-textbox#title-textarea div[contenteditable="true"]',
      { timeout: 15000 }
    );
    await titleBox.click();
    // Zaznacz wszystko i wyczyść domyślny tytuł
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await titleBox.fill(title);
    await page.waitForTimeout(500);

    const descBox = await page.waitForSelector(
      '#description-textarea #textbox, ytcp-social-suggestions-textbox#description-textarea div[contenteditable="true"]',
      { timeout: 15000 }
    );
    await descBox.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await descBox.fill(description);
    await page.waitForTimeout(1000);

    // 5. Oznaczenie: "Nie, ten film nie jest przeznaczony dla dzieci" (wymóg prawny COPPA)
    console.log('[5/7] Konfiguracja opcji widowni (COPPA: nie dla dzieci)...');
    const notForKidsRadio = await page.waitForSelector(
      'tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], [name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]',
      { timeout: 15000 }
    );
    await notForKidsRadio.click();
    await page.waitForTimeout(1000);

    // Dodanie tagów jeśli są dostępne (rozwinięcie "Pokaż więcej" / "Show more")
    if (tags) {
      try {
        const showMoreBtn = await page.$(
          'ytcp-button#toggle-button:has-text("Pokaż więcej"), ytcp-button#toggle-button:has-text("Show more"), button:has-text("Pokaż więcej")'
        );
        if (showMoreBtn) {
          await showMoreBtn.click();
          await page.waitForTimeout(1000);
          const tagsInput = await page.$('input[aria-label*="Tagi"], input[aria-label*="Tags"], #tags-container input');
          if (tagsInput) {
            await tagsInput.fill(tags);
            await page.keyboard.press('Enter');
          }
        }
      } catch (err) {
        console.warn('  [Ostrzeżenie] Nie udało się wprowadzić tagów, kontynuuję:', err.message);
      }
    }

    // Odczytaj wygenerowany link do wideo (np. https://youtu.be/xyz)
    let videoUrl = '';
    try {
      const linkElem = await page.waitForSelector(
        'span.video-url-fadeable a, a.ytcp-video-info, a[href*="youtu.be"]',
        { timeout: 10000 }
      );
      videoUrl = await linkElem.getAttribute('href') || await linkElem.innerText();
      console.log(`  -> Przypisany stały URL filmu: ${videoUrl}`);
    } catch {
      console.log('  -> Oczekuję na link w końcowym oknie...');
    }

    // 6. Przejście przez kolejne kroki (Dalej -> Dalej -> Dalej -> Widoczność)
    console.log('[6/7] Przechodzenie do ustawień widoczności...');
    for (let step = 1; step <= 3; step++) {
      const nextBtn = await page.waitForSelector('#next-button, button#next-button', { timeout: 15000 });
      await nextBtn.click();
      await page.waitForTimeout(1500);
    }

    // Ustawienie widoczności
    if (visibility === 'unlisted') {
      const unlistedRadio = await page.waitForSelector(
        'tp-yt-paper-radio-button[name="UNLISTED"], [name="UNLISTED"]',
        { timeout: 10000 }
      );
      await unlistedRadio.click();
    } else if (visibility === 'private') {
      const privateRadio = await page.waitForSelector(
        'tp-yt-paper-radio-button[name="PRIVATE"], [name="PRIVATE"]',
        { timeout: 10000 }
      );
      await privateRadio.click();
    } else {
      // Domyślnie publiczny
      const publicRadio = await page.waitForSelector(
        'tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"]',
        { timeout: 10000 }
      );
      await publicRadio.click();
    }
    await page.waitForTimeout(1500);

    // 7. Kliknij "Zapisz" / "Opublikuj" ("Publish" / "Done")
    console.log('[7/7] Zatwierdzanie publikacji (Zapisz / Opublikuj)...');
    const doneBtn = await page.waitForSelector(
      '#done-button, button#done-button, ytcp-button#done-button',
      { timeout: 15000 }
    );
    await doneBtn.click();

    // Czekaj na okno potwierdzenia lub zamknięcie dialogu
    console.log('Oczekiwanie na potwierdzenie przyjęcia pliku przez YouTube...');
    await page.waitForTimeout(5000);

    // Sprawdź końcowy URL w oknie "Przesłano film" jeśli wcześniej nie udało się pobrać
    if (!videoUrl) {
      try {
        const finalLink = await page.$('a.ytcp-video-share-dialog, a[href*="youtu.be"]');
        if (finalLink) {
          videoUrl = await finalLink.getAttribute('href');
        }
      } catch {}
    }

    console.log('\n========================================================');
    console.log('🎉 SUKCES! Wideo zostało przesłane do YouTube Studio!');
    if (videoUrl) {
      console.log(`🔗 Link do filmu: ${videoUrl}`);
    }
    console.log('========================================================\n');

    // Zapisz do historii
    const history = loadHistory();
    history.published.push({
      videoFile: path.basename(videoPath),
      title: title,
      videoUrl: videoUrl || 'https://studio.youtube.com',
      visibility: visibility,
      publishedAt: new Date().toISOString()
    });
    saveHistory(history);

    await context.close();
    return { success: true, title, videoUrl, visibility };
  } catch (err) {
    console.error('\n❌ BŁĄD PUBLIKACJI DO YOUTUBE:', err.message);
    try {
      await page.screenshot({ path: path.join(ROOT, 'youtube_upload_error.png'), fullPage: true });
      console.log('Zapisano zrzut błędu do: youtube_upload_error.png');
    } catch {}
    await context.close();
    throw err;
  }
}

// Obsługa wywołania z wiersza poleceń
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--login')) {
    await runLogin();
    return;
  }

  let videoPath = null;
  let metaPath = null;
  let visibility = 'public';
  let channel = null;
  let headed = args.includes('--headed');

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--video' && args[i + 1]) {
      videoPath = args[i + 1];
    } else if (args[i] === '--meta' && args[i + 1]) {
      metaPath = args[i + 1];
    } else if (args[i] === '--visibility' && args[i + 1]) {
      visibility = args[i + 1];
    } else if (args[i] === '--channel' && args[i + 1]) {
      channel = args[i + 1];
    }
  }

  if (!videoPath) {
    console.log('Użycie:');
    console.log('  node scripts/publish_to_youtube_playwright.mjs --login');
    console.log('  node scripts/publish_to_youtube_playwright.mjs --video <plik.mp4> [--meta <meta.json>] [--channel "<Nazwa kanału>"] [--visibility public|unlisted|private] [--headed]');
    process.exit(1);
  }

  await uploadToYouTube({ videoPath, metaPath, visibility, headed, channel });
}

export { uploadToYouTube, runLogin, getBrowserContext, checkLoginState };

if (process.argv[1] && process.argv[1].endsWith('publish_to_youtube_playwright.mjs')) {
  main().catch(() => process.exit(1));
}
