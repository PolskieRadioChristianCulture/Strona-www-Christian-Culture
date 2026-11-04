/**
 * publish_facebook_short.cjs — Oficjalny publikator wideo Shorts/Reels na Facebooku (Playwright)
 * Standard JOMA-STD-FB-SHORTS-20261103
 *
 * Publikacja 1 wideo Shorts (MP4 9:16) dziennie na Facebooku:
 * - Profil osobisty: https://www.facebook.com/cezary.rogowski1
 * - Radio Christian Culture: https://www.facebook.com/RadioChristianCulture
 * - Christian Culture App: https://www.facebook.com/ChristianCultureApp
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const FB_PAGES = [
  { name: 'Radio Christian Culture', url: 'https://www.facebook.com/RadioChristianCulture', isPage: true },
  { name: 'Christian Culture App',   url: 'https://www.facebook.com/ChristianCultureApp',   isPage: true },
  { name: 'Profil osobisty',         url: 'https://www.facebook.com/cezary.rogowski1',     isPage: false }
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

function saveHistory(hist) {
  fs.mkdirSync(path.dirname(HISTORY_FILE), { recursive: true });
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(hist, null, 2), 'utf8');
}

async function publishToPage(page, target, postText, videoPath) {
  console.log(`\n📢 [FB Target: ${target.name}] Otwieram stronę docelową...`);
  await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  // Sprawdź czy jest banner przełączenia profilu (dla stron)
  if (target.isPage) {
    const switched = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('div[role="button"], button'));
      const b = btns.find(el => (el.innerText || '').trim() === 'Przełącz' || (el.innerText || '').trim() === 'Przełącz teraz');
      if (b) { b.click(); return true; }
      return false;
    });
    if (switched) {
      console.log(`   🔄 Kliknięto 'Przełącz profil' na stronę ${target.name}...`);
      await page.waitForTimeout(4000);
    }
  }

  // 1. Otwarcie kompozytora posta
  console.log("   📝 Otwieram kompozytor posta/Reelsa...");
  await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('span, div[role="button"]'));
    const trigger = nodes.find(el => {
      const t = (el.innerText || '').trim().toLowerCase();
      return t.includes('słychać') || t.includes('napisz coś') || t.includes('utwórz rolkę') || t.includes('zdjęcie/film');
    });
    if (trigger) trigger.click();
  });

  await page.waitForTimeout(3000);

  // 2. Załączenie pliku wideo
  console.log(`   🎬 Załączam wideo: ${path.basename(videoPath)}...`);
  const fileInput = await page.$('input[type="file"]');
  if (fileInput) {
    await fileInput.setInputFiles(videoPath);
    console.log("   ⏳ Wgrywanie wideo na serwery Facebooka (oczekiwanie 12s)...");
    await page.waitForTimeout(12000);
  }

  // 3. Wpisanie opisu posta
  console.log("   ✍️ Wprowadzam opis posta...");
  await page.evaluate((txt) => {
    const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
    const postDialog = dialogs.find(d => d.querySelector('div[role="textbox"]'));
    const ed = postDialog ? postDialog.querySelector('div[role="textbox"]') : document.querySelector('div[role="textbox"]');
    if (ed) {
      ed.focus();
      document.execCommand('insertText', false, txt);
    }
  }, postText);

  await page.keyboard.press('Space');
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(3000);

  // 4. Kliknięcie Dalej (jeśli otworzył się kreator Rolek/Reels)
  const clickedDalej = await page.evaluate(() => {
    const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
    const postDialog = dialogs.find(d => (d.innerText || '').includes('Dalej') || (d.innerText || '').includes('Opublikuj'));
    if (!postDialog) return false;
    const btns = Array.from(postDialog.querySelectorAll('div[role="button"], button'));
    const b = btns.find(btn => (btn.innerText || '').trim() === 'Dalej');
    if (b) { b.click(); return true; }
    return false;
  });

  if (clickedDalej) {
    console.log("   ➡️ Kliknięto 'Dalej' w kreatorze Reels...");
    await page.waitForTimeout(3000);
  }

  // 5. Kliknięcie Opublikuj
  console.log("   🚀 Klikam 'Opublikuj'...");
  await page.evaluate(() => {
    const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
    const postDialog = dialogs.find(d => (d.innerText || '').includes('Ustawienia') || (d.innerText || '').includes('Opublikuj'));
    const container = postDialog || document.body;
    const btns = Array.from(container.querySelectorAll('div[role="button"], button'));
    const pub = btns.find(b => {
      const t = (b.innerText || '').trim();
      return (t === 'Opublikuj' || t === 'Opublikuj teraz') && b.getAttribute('aria-disabled') !== 'true';
    });
    if (pub) pub.click();
  });

  console.log("   ⏳ Czekam na przetworzenie publikacji (15 sekund)...");
  await page.waitForTimeout(15000);
  console.log(`   ✅ Wideo Short pomyślnie opublikowane na: ${target.name}!`);
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
    console.error("Błąd: Podaj istniejącą ścieżkę do pliku wideo (--video <plik.mp4>)");
    process.exit(1);
  }

  let postText = "Czy wiesz, jak wielka jest miłość Boga do Ciebie? Ewangelia Jana 3:16. Subskrybuj Polskie Radio Christian Culture i słuchaj pełnej Biblii Audio każdego dnia! https://polskieradio.cc #Shorts #Biblia #WersetDnia";
  if (metaPath && fs.existsSync(metaPath)) {
    postText = fs.readFileSync(metaPath, 'utf8').trim();
  }

  const sessionPath = path.resolve('C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/fb_session.json');
  if (!fs.existsSync(sessionPath)) {
    console.error("Brak pliku fb_session.json!");
    process.exit(1);
  }

  const cookies = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
  const validSameSite = new Set(['Strict', 'Lax', 'None']);
  const pwCookies = cookies.map(c => {
    const copy = { ...c };
    delete copy.sameParty;
    delete copy.sourceScheme;
    delete copy.sourcePort;
    if (!validSameSite.has(copy.sameSite)) delete copy.sameSite;
    return copy;
  });

  const todayWarsaw = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw' }).format(new Date());
  const history = loadHistory();
  if (!history[todayWarsaw]) history[todayWarsaw] = {};

  const videoStem = path.basename(videoPath, '.mp4');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 1000 },
    locale: 'pl-PL'
  });

  await context.addCookies(pwCookies);
  const page = await context.newPage();

  for (const target of FB_PAGES) {
    if (history[todayWarsaw][target.name] && history[todayWarsaw][target.name].status === 'published') {
      console.log(`⏩ [Pominięto] Na ${target.name} Short Dnia został już dziś opublikowany.`);
      continue;
    }

    try {
      await publishToPage(page, target, postText, videoPath);
      history[todayWarsaw][target.name] = {
        status: 'published',
        videoStem,
        timestamp: new Date().toISOString()
      };
      saveHistory(history);
    } catch(err) {
      console.error(`   ❌ Błąd publikacji na ${target.name}:`, err.message);
      history[todayWarsaw][target.name] = {
        status: 'error',
        videoStem,
        error: err.message,
        timestamp: new Date().toISOString()
      };
      saveHistory(history);
    }
  }

  await browser.close();
  console.log(`\n🎉 [FB Shorts Publisher] Zakończono sesję publikacji Facebook.`);
}

main().catch(err => {
  console.error("Błąd krytyczny:", err);
  process.exit(1);
});
