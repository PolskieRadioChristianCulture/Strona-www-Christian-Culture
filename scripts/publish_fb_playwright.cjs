const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function publishToFacebook() {
  const sessionPath = path.resolve('C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/fb_session.json');
  if (!fs.existsSync(sessionPath)) {
    throw new Error('Brak pliku fb_session.json!');
  }
  const cookies = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 1000 },
    locale: 'pl-PL'
  });

  const validSameSite = new Set(['Strict', 'Lax', 'None']);
  const pwCookies = cookies.map(c => {
    const copy = { ...c };
    delete copy.sameParty;
    delete copy.sourceScheme;
    delete copy.sourcePort;
    if (!validSameSite.has(copy.sameSite)) {
      delete copy.sameSite;
    }
    return copy;
  });

  await context.addCookies(pwCookies);
  const page = await context.newPage();
  
  console.log('🌐 Nawigacja do strony Radio Christian Culture na Facebooku...');
  await page.goto('https://www.facebook.com/profile.php?id=100089154402636', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  const title = await page.title();
  console.log('📄 Tytuł strony:', title);

  const postText = `📖 Z Biblią za Pan Brat — Dzień 44: Przejście przez Morze Czerwone (Wj 14:1–31)

„PAN będzie za was walczył, a wy będziecie milczeć.” (Wj 14:14, UBG)

Przed Tobą bezkresne morze trudności, a za plecami armia przeszłości i lęków? Bóg nie prowadzi Cię w pułapkę, lecz uczy patrzeć na Jego zbawienie. Na Boży rozkaz wody rozstępują się na prawo i na lewo, tworząc suchą drogę w samym sercu niemożliwego!

👉 Studiuj bezpłatnie w Akademii Biblijnej:
https://polskieradio.cc/akademia/kurscodzienny/dzien-44

#ZBibliaZaPanBrat #ChristianCulture #SłowoBoże #Wiara #MorzeCzerwone`;

  console.log('Szukam pola dodawania posta...');
  const createPostTrigger = await page.$('div[role="button"]:has-text("Napisz coś..."), div[role="button"]:has-text("O czym myślisz"), div[role="button"]:has-text("Stwórz post"), div[aria-label="Napisz coś..."]');
  if (createPostTrigger) {
    console.log('Klikam w pole tworzenia posta...');
    await createPostTrigger.click();
    await page.waitForTimeout(3000);

    const dialogTextbox = await page.$('div[role="dialog"] div[role="textbox"][contenteditable="true"]');
    if (dialogTextbox) {
      console.log('Wpisuję treść posta...');
      await dialogTextbox.click();
      await page.keyboard.insertText(postText);
      await page.waitForTimeout(3000);

      const submitBtn = await page.$('div[role="dialog"] div[aria-label="Opublikuj"], div[role="dialog"] div[role="button"]:has-text("Opublikuj")');
      if (submitBtn) {
        console.log('Klikam Opublikuj...');
        await submitBtn.click();
        await page.waitForTimeout(8000);
        console.log('🎉 Post został pomyślnie opublikowany na Facebooku!');
      } else {
        console.log('⚠️ Nie znaleziono przycisku Opublikuj');
      }
    } else {
      console.log('⚠️ Nie znaleziono dialogu tworzenia posta');
    }
  } else {
    console.log('ℹ️ Brak przycisku tworzenia posta na stronie głównej profilu (profil jest oglądany jako gość)');
  }

  await browser.close();
}

publishToFacebook().catch(e => console.error('FB error:', e.message));
