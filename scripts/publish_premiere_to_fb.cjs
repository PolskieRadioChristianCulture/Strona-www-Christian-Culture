const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const FB_PAGES = [
  { name: 'Radio Christian Culture', url: 'https://www.facebook.com/RadioChristianCulture', isPage: true },
  { name: 'Profil osobisty',         url: 'https://www.facebook.com/cezary.rogowski1' },
  { name: 'Christian Culture App',   url: 'https://www.facebook.com/ChristianCultureApp',   isPage: true }
];

const ROOT_CC = path.resolve(__dirname, '..');
const IMAGE_PATH = path.join(ROOT_CC, 'images', 'news', 'art-globalny-reset-premiera-sds.jpg');
const SESSION_PATH = path.join(__dirname, 'fb_session.json');

const postText = `🔴 PREMIERA JUTRO O GODZINIE 21:00!
🔥 GLOBALNY RESET — Studio Dobrego Słowa

Gospodarz programu: Mariusz Adamczyk

Czy współczesny świat zmierza ku nieodwracalnemu przełomowi? Jakie siły kształtują globalną rzeczywistość i co na ten temat mówi Pismo Święte?

W najnowszym programie Studia Dobrego Słowa Mariusz Adamczyk podejmuje jeden z najbardziej palących tematów naszych czasów. Zobacz analizę, która zamiast taniej sensacji stawia na fakty, rzetelną wiedzę i Bożą perspektywę.

⏰ PREMIERA: Sobota, 14 listopada, godz. 21:00
👉 Link do premiery na YouTube i możliwość włączenia powiadomienia znajduje się w pierwszym komentarzu poniżej!

Ustaw powiadomienie (dzwoneczek), zasubskrybuj kanał i udostępnij to zaproszenie znajomym!

#GlobalnyReset #StudioDobregoSłowa #MariuszAdamczyk #ChristianCulture #Premiera`;

const ytUrl = 'https://youtu.be/UHAcOhDvlys';

async function publishPost(page, postText, imagePath, targetName) {
  console.log(`   ⏳ Otwieram kompozytor posta na: ${targetName}...`);

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

  // 1. Wgrywanie dedykowanej grafiki
  if (imagePath && fs.existsSync(imagePath)) {
    console.log(`   🖼️ Załączam dedykowaną grafikę: ${path.basename(imagePath)}...`);
    const fileInput = await page.$('div[role="dialog"] input[type="file"]');
    if (fileInput) {
      await fileInput.uploadFile(imagePath);
      await new Promise(r => setTimeout(r, 4000));
      console.log("   ✅ Dedykowana grafika załączona.");
    }
  }

  // 2. Wklejenie tekstu
  console.log("   ✍️ Wklejam tekst posta...");
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
  await new Promise(r => setTimeout(r, 2000));

  // 3. Dalej / Opublikuj
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
    console.log("   🔘 Kliknięto 'Dalej'...");
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log("   🔘 Klikam 'Opublikuj'...");
  await page.evaluate(() => {
    const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
    const postDialog = dialogs.find(d => (d.innerText || '').includes('Ustawienia') || (d.innerText || '').includes('Opublikuj') || d.querySelector('div[role="button"][aria-label="Opublikuj"]'));
    if (!postDialog) return;
    const btns = Array.from(postDialog.querySelectorAll('div[role="button"], button'));
    const pub = btns.find(b => ((b.innerText || '').trim() === 'Opublikuj' || (b.innerText || '').trim() === 'Opublikuj teraz' || b.getAttribute('aria-label') === 'Opublikuj') && b.getAttribute('aria-disabled') !== 'true');
    if (pub) pub.click();
  });

  await new Promise(r => setTimeout(r, 10000));
  console.log(`   ✅ Post opublikowany na: ${targetName}!`);

  // 4. Komentarz z linkiem
  console.log(`   💬 Dodaję pierwszy komentarz z linkiem YouTube...`);
  try {
    await page.evaluate(() => window.scrollBy(0, 350));
    await new Promise(r => setTimeout(r, 2000));

    const commentSelector = 'form textarea, div[role="textbox"][aria-label*="komentarz" i], div[role="textbox"][aria-label*="comment" i]';
    let commentBox = await page.$(commentSelector);
    if (commentBox) {
      const commentText = `🔗 Link do jutrzejszej premiery na YouTube (ustaw przypomnienie): ${ytUrl}`;
      await commentBox.focus();
      await page.keyboard.type(commentText, { delay: 15 });
      await new Promise(r => setTimeout(r, 1000));
      await page.keyboard.press('Enter');
      await new Promise(r => setTimeout(r, 3000));
      console.log(`   ✅ Komentarz z linkiem opublikowany!`);
    }
  } catch (commErr) {
    console.warn(`   ⚠️ Błąd podczas dodawania komentarza: ${commErr.message}`);
  }

  return true;
}

async function run() {
  console.log('🚀 Rozpoczynam publikację zapowiedzi premiery na Facebooku...');
  if (!fs.existsSync(SESSION_PATH)) {
    console.warn('⚠️ Brak pliku fb_session.json. Pomijam bezpośredni upload na FB.');
    process.exit(0);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=pl-PL']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });

  try {
    let raw = fs.readFileSync(SESSION_PATH, 'utf8');
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
    const cookies = JSON.parse(raw);
    await page.setCookie(...cookies);
    console.log(`🔑 Wczytano ${cookies.length} ciasteczek FB.`);
  } catch(e) {
    console.error('Błąd ciasteczek:', e.message);
  }

  const results = [];
  for (const target of FB_PAGES) {
    console.log(`\n📢 Otwieram cel: ${target.name} (${target.url})`);
    try {
      await page.goto(target.url, { waitUntil: 'networkidle2', timeout: 35000 });
      await new Promise(r => setTimeout(r, 3000));

      if (target.isPage) {
        const switchClicked = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('div[role="button"], button'));
          const btn = buttons.find(b => (b.innerText || '').trim() === 'Przełącz' || (b.innerText || '').trim() === 'Przełącz teraz');
          if (btn) { btn.click(); return true; }
          return false;
        });

        if (switchClicked) {
          console.log(`   🔄 Przełączam profil na: ${target.name}...`);
          await new Promise(r => setTimeout(r, 2000));
          await page.evaluate(() => {
            const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
            const switchDialog = dialogs.find(d => (d.innerText || '').includes('Przełącz profil') || (d.innerText || '').includes('Przełącz się na'));
            if (switchDialog) {
              const btns = Array.from(switchDialog.querySelectorAll('div[role="button"], button'));
              const confirmBtn = btns.find(b => (b.innerText || '').trim() === 'Przełącz');
              if (confirmBtn) confirmBtn.click();
            }
          });
          await new Promise(r => setTimeout(r, 6000));
        }
      }

      const ok = await publishPost(page, postText, IMAGE_PATH, target.name);
      results.push({ target: target.name, ok });
    } catch(e) {
      console.error(`   ❌ Błąd na ${target.name}: ${e.message}`);
      results.push({ target: target.name, ok: false });
    }
  }

  await browser.close();
  const successCount = results.filter(r => r.ok).length;
  console.log(`\n📊 Wynik publikacji FB: ${successCount}/${results.length} udanych.`);
}

run().catch(e => {
  console.error('Błąd FB:', e.message);
});
