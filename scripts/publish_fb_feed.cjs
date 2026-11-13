const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function publishToFeed() {
  const sessionPath = path.resolve('C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/fb_session.json');
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
  
  console.log('🌐 Nawigacja do strony głównej facebook.com...');
  await page.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  const postText = `📖 Z Biblią za Pan Brat — Dzień 44: Przejście przez Morze Czerwone (Wj 14:1–31)

„PAN będzie za was walczył, a wy będziecie milczeć.” (Wj 14:14, UBG)

Przed Tobą bezkresne morze trudności, a za plecami armia przeszłości i lęków? Bóg nie prowadzi Cię w pułapkę, lecz uczy patrzeć na Jego zbawienie. Na Boży rozkaz wody rozstępują się na prawo i na lewo, tworząc suchą drogę w samym sercu niemożliwego!

👉 Studiuj bezpłatnie w Akademii Biblijnej:
https://polskieradio.cc/akademia/kurscodzienny/dzien-44

#ZBibliaZaPanBrat #ChristianCulture #SłowoBoże #Wiara #MorzeCzerwone`;

  console.log('Szukam pola dodawania posta na Tablicy...');
  const createTrigger = await page.$('div[role="button"]:has-text("O czym myślisz"), div[role="button"]:has-text("Co słychać"), div[aria-label*="O czym myślisz"]');
  if (createTrigger) {
    console.log('Klikam w pole...');
    await createTrigger.click();
    await page.waitForTimeout(3000);

    const dialogBox = await page.$('div[role="dialog"] div[role="textbox"][contenteditable="true"]');
    if (dialogBox) {
      console.log('Wpisuję treść posta...');
      await dialogBox.click();
      await page.keyboard.insertText(postText);
      await page.waitForTimeout(4000);

      const postBtn = await page.$('div[role="dialog"] div[aria-label="Opublikuj"], div[role="dialog"] div[role="button"]:has-text("Opublikuj")');
      if (postBtn) {
        console.log('Klikam Opublikuj...');
        await postBtn.click();
        await page.waitForTimeout(8000);
        console.log('🎉 Post został pomyślnie opublikowany na Facebooku (profil osobisty Cezary Rogowski)!');
      } else {
        console.log('⚠️ Brak przycisku Opublikuj');
      }
    } else {
      console.log('⚠️ Brak dialogBox');
    }
  } else {
    console.log('⚠️ Nie znaleziono pola tworzenia posta na feedzie');
  }

  await browser.close();
}

publishToFeed().catch(e => console.error('FB error:', e.message));
