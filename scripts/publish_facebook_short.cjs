/**
 * publish_facebook_short.cjs — Dedykowana publikacja wideo Shorts/Reels na Facebooku
 * Standard JOMA-STD-FB-SHORTS-POSTING-20261103
 *
 * 1. Ochrona anty-duplikat (dokładnie 1 Short dziennie na każdym celu).
 * 2. Wgrywanie pliku wideo 9:16 (MP4 z lektorem ElevenLabs).
 * 3. Obsługa oficjalnych stron (Radio Christian Culture, Christian Culture App, profil).
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const FB_PAGES = [
  { name: 'Radio Christian Culture', url: 'https://www.facebook.com/RadioChristianCulture', isPage: true },
  { name: 'Christian Culture App',   url: 'https://www.facebook.com/ChristianCultureApp',   isPage: true },
  { name: 'Profil osobisty',         url: 'https://www.facebook.com/cezary.rogowski1' }
];

const HISTORY_FILE = path.join(__dirname, '..', 'data', 'fb_shorts_history.json');

function loadHistory() {
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    } catch(e) {}
  }
  return {};
}

function saveHistory(history) {
  try {
    const dir = path.dirname(HISTORY_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
  } catch(e) {
    console.error('Błąd zapisu historii FB Shorts:', e.message);
  }
}

async function publishVideoPost(page, postText, videoPath, targetName) {
  console.log(`   🎬 Otwieram kompozytor posta na: ${targetName}...`);

  const triggerClicked = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('span, div[role="button"]'));
    const trigger = nodes.find(el => {
      const t = (el.innerText || '').trim().toLowerCase();
      return t.includes('słychać') || t.includes('napisz coś') || t.includes('utwórz post') || t.includes('stwórz post');
    });
    if (trigger) { trigger.click(); return true; }
    return false;
  });

  if (!triggerClicked) throw new Error("Nie znaleziono pola tworzenia posta");

  const editorSelector = 'div[role="dialog"] div[role="textbox"]';
  await page.waitForSelector(editorSelector, { timeout: 15000 });

  // 1. Wgrywanie wideo MP4
  if (videoPath && fs.existsSync(videoPath)) {
    console.log(`   🎬 Załączam wideo Shorts: ${path.basename(videoPath)}...`);
    const fileInput = await page.$('div[role="dialog"] input[type="file"]');
    if (fileInput) {
      await fileInput.uploadFile(videoPath);
      // Oczekiwanie na przetworzenie wideo przez Facebook
      await new Promise(r => setTimeout(r, 8000));
      console.log("   ✅ Wideo załączone do kompozytora.");
    }
  }

  // 2. Wprowadzanie tekstu opisu
  console.log("   ✍️ Wprowadzam treść opisu posta...");
  await page.evaluate((txt) => {
    const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
    const postDialog = dialogs.find(d => d.querySelector('div[role="textbox"]'));
    const ed = postDialog ? postDialog.querySelector('div[role="textbox"]') : document.querySelector('div[role="textbox"]');
    if (ed) {
      ed.focus();
      const dt = new DataTransfer();
      dt.setData('text/plain', txt);
      const pasteEvent = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true });
      ed.dispatchEvent(pasteEvent);
    }
  }, postText);

  await page.keyboard.press('Space');
  await page.keyboard.press('Backspace');
  await new Promise(r => setTimeout(r, 3000));

  // 3. Sprawdź przycisk Dalej (jeśli Facebook otwiera kreator Reels)
  console.log("   🔍 Sprawdzam przyciski (Dalej / Opublikuj)...");
  const hasDalej = await page.evaluate(() => {
    const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
    const postDialog = dialogs.find(d => d.querySelector('div[role="textbox"]'));
    if (!postDialog) return false;
    const btns = Array.from(postDialog.querySelectorAll('div[role="button"], button'));
    const dalej = btns.find(b => (b.innerText || '').trim() === 'Dalej' && b.getAttribute('aria-disabled') !== 'true');
    if (dalej) { dalej.click(); return true; }
    return false;
  });

  if (hasDalej) {
    console.log("   ➡️ Kliknięto 'Dalej'...");
    await new Promise(r => setTimeout(r, 4000));
  }

  // 4. Kliknięcie Opublikuj
  console.log("   🚀 Klikam 'Opublikuj'...");
  await page.waitForFunction(() => {
    const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
    const postDialog = dialogs.find(d => (d.innerText || '').includes('Ustawienia') || (d.innerText || '').includes('Opublikuj') || d.querySelector('div[role="button"][aria-label="Opublikuj"]'));
    if (!postDialog) return false;
    const btns = Array.from(postDialog.querySelectorAll('div[role="button"], button'));
    const pub = btns.find(b => ((b.innerText || '').trim() === 'Opublikuj' || (b.innerText || '').trim() === 'Opublikuj teraz' || b.getAttribute('aria-label') === 'Opublikuj') && b.getAttribute('aria-disabled') !== 'true');
    return !!pub;
  }, { timeout: 20000 });

  await page.evaluate(() => {
    const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
    const postDialog = dialogs.find(d => (d.innerText || '').includes('Ustawienia') || (d.innerText || '').includes('Opublikuj') || d.querySelector('div[role="button"][aria-label="Opublikuj"]'));
    if (!postDialog) return;
    const btns = Array.from(postDialog.querySelectorAll('div[role="button"], button'));
    const pub = btns.find(b => ((b.innerText || '').trim() === 'Opublikuj' || (b.innerText || '').trim() === 'Opublikuj teraz' || b.getAttribute('aria-label') === 'Opublikuj') && b.getAttribute('aria-disabled') !== 'true');
    if (pub) pub.click();
  });

  await new Promise(r => setTimeout(r, 15000));
  console.log(`   ✅ Wideo Short pomyślnie opublikowane na: ${targetName}!`);
  return true;
}

async function main() {
  const args = process.argv.slice(2);
  let videoPath = null;
  let metaPath = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--video' && args[i + 1]) videoPath = path.resolve(args[i + 1]);
    if (args[i] === '--meta' && args[i + 1]) metaPath = path.resolve(args[i + 1]);
  }

  if (!videoPath || !fs.existsSync(videoPath)) {
    console.error("Błąd: Brak pliku wideo (--video <ścieżka>)");
    process.exit(1);
  }

  let postText = "Słowo Boże na dziś — Christian Culture #Shorts";
  if (metaPath && fs.existsSync(metaPath)) {
    postText = fs.readFileSync(metaPath, 'utf8');
  }

  const todayWarsaw = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw' }).format(new Date());
  const history = loadHistory();
  if (!history[todayWarsaw]) {
    history[todayWarsaw] = {};
  }

  const videoStem = path.basename(videoPath, '.mp4');
  const pendingTargets = FB_PAGES.filter(target => history[todayWarsaw][target.name]?.videoStem !== videoStem);

  if (pendingTargets.length === 0) {
    console.log(`✅ [ANTY-DUPLIKAT] Wideo Short ${videoStem} zostało już dziś opublikowane na wszystkich celach Facebooka.`);
    process.exit(0);
  }

  console.log(`🚀 [FB Shorts Publisher] Rozpoczynam publikację wideo: ${path.basename(videoPath)}`);
  console.log(`📋 Cele do publikacji (${pendingTargets.length}/${FB_PAGES.length}):`, pendingTargets.map(t => t.name).join(', '));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=pl-PL']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });

  const sessionPath = path.join(__dirname, 'fb_session.json');
  if (fs.existsSync(sessionPath)) {
    try {
      let raw = fs.readFileSync(sessionPath, 'utf8');
      if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
      const cookies = JSON.parse(raw);
      await page.setCookie(...cookies);
      console.log(`🔑 Wczytano ${cookies.length} ciasteczek z fb_session.json.`);
    } catch(e) {
      console.error('Błąd ciasteczek:', e.message);
    }
  }

  for (const target of pendingTargets) {
    console.log(`\n🌐 Otwieram cel: ${target.name} (${target.url})`);
    try {
      await page.goto(target.url, { waitUntil: 'networkidle2', timeout: 35000 });
      await new Promise(r => setTimeout(r, 4000));

      if (target.isPage) {
        const switchClicked = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('div[role="button"], button'));
          const btn = buttons.find(b => (b.innerText || '').trim() === 'Przełącz' || (b.innerText || '').trim() === 'Przełącz teraz');
          if (btn) { btn.click(); return true; }
          return false;
        });

        if (switchClicked) {
          console.log(`   🔄 Kliknięto banner 'Przełącz' na stronę ${target.name}...`);
          await new Promise(r => setTimeout(r, 3000));
        }
      }

      await publishVideoPost(page, postText, videoPath, target.name);

      history[todayWarsaw][target.name] = {
        status: 'published',
        videoStem: videoStem,
        timestamp: new Date().toISOString()
      };
      saveHistory(history);
    } catch(err) {
      console.error(`   ❌ Błąd publikacji na ${target.name}:`, err.message);
      history[todayWarsaw][target.name] = {
        status: 'error',
        videoStem: videoStem,
        error: err.message,
        timestamp: new Date().toISOString()
      };
      saveHistory(history);
    }
  }

  await browser.close();
  console.log(`\n🎉 [FB Shorts Publisher] Zakończono sesję publikacji.`);
}

main().catch(err => {
  console.error("Błąd krytyczny:", err);
  process.exit(1);
});
