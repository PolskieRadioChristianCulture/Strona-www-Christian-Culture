import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const OBS_HOST = 'ws://192.168.50.217:4455';
const OBS_PASSWORD = '6qPcL0sXrVvs6sPN';

const THUMBNAIL_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\images\\promo_wieczor_2.jpg';
const STREAM_TITLE = 'Wieczór ze Słowem Bożym • Zaznaj spokoju serca 🕊️ Pismo Święte i Modlitwa [DZIŚ 20:00]';
const STREAM_DESC = `🕊️ WIECZÓR ZE SŁOWEM BOŻYM • ZAZNAJ SPOKOJU SERCA
Zapraszamy na wspólny wieczór wyciszenia, pokoju serca i zanurzenia w Słowie Bożym. 

Zatrzymaj się po całym dniu, oddaj troski Bogu i pozwól, aby Jego obecność napełniła Twój dom głębokim spokojem.

🙏 WESPRZYJ MISJĘ CHRISTIAN CULTURE:
Jeśli to Słowo i modlitwa wnoszą pokój do Twojego serca, pomóż nam budować niezależne chrześcijańskie media w Polsce:
👉 https://polskieradio.cc/wspieraj (BLIK: 537 137 043, szybki przelew, karta)

🌐 ODKRYJ WIĘCEJ W EKOSYSTEMIE CHRISTIAN CULTURE:
✨ Portal Społecznościowy LUMINA: https://polskieradio.cc/lumina
📖 Pismo Święte Interlinearne: https://polskieradio.cc/mojabiblia
🎧 Chrześcijańskie Radio i Słuchowiska: https://polskieradio.cc/player
🎬 Chrześcijańskie Kino VOD: https://polskieradio.cc/vod

Błogosławionego wieczoru! Zostaw intencję modlitewną w komentarzu na czacie. Subskrybuj kanał i kliknij dzwoneczek 🔔, aby być powiadamianym o kolejnych transmisjach.

#WieczórZeSłowemBożym #SłowoBoże #Modlitwa #SpokójSerca #Biblia #PismoŚwięte #ChristianCulture #Wiara #BógJestDobry`;

function obsSend(ws, type, data = {}) {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    const timer = setTimeout(() => reject(new Error('OBS timeout: ' + type)), 10000);
    const h = (e) => {
      const m = JSON.parse(e.data);
      if (m.op === 7 && m.d.requestId === id) {
        clearTimeout(timer);
        ws.removeEventListener('message', h);
        if (m.d.requestStatus.result) {
          resolve(m.d.responseData);
        } else {
          reject(new Error(m.d.requestStatus.comment || 'OBS request failed'));
        }
      }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ op: 6, d: { requestType: type, requestId: id, requestData: data } }));
  });
}

async function connectToObs() {
  const ws = new WebSocket(OBS_HOST);
  return new Promise((resolve, reject) => {
    ws.onopen = () => console.log('Połączono z OBS WebSocket');
    ws.onerror = reject;
    ws.onmessage = async (e) => {
      const msg = JSON.parse(e.data);
      if (msg.op === 0 && msg.d.authentication) {
        const { challenge, salt } = msg.d.authentication;
        const secret = crypto.createHash('sha256').update(OBS_PASSWORD + salt).digest('base64');
        const auth = crypto.createHash('sha256').update(secret + challenge).digest('base64');
        ws.send(JSON.stringify({ op: 1, d: { rpcVersion: 1, authentication: auth } }));
      } else if (msg.op === 2) {
        console.log('✅ Zautoryzowano w OBS WebSocket!');
        resolve(ws);
      }
    };
  });
}

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  let streamKey = null;
  let videoId = null;

  try {
    console.log('Otwieram Studio Roberta...');
    await openChannelStudio(page, 'Robert Łukasz Pio', '/livestreaming');
    await page.waitForTimeout(4000);

    // Jeśli wisi okno "Zakończyć transmisję?", kliknij "Zakończ transmisję" lub "Zamknij"
    const endModalBtn = page.locator('#confirm-button:has-text("Zakończ"), button:has-text("Zakończ transmisję"), ytcp-button:has-text("Zakończ transmisję")').first();
    if (await endModalBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Zamykam poprzednią sesję transmisji...');
      await endModalBtn.click();
      await page.waitForTimeout(3000);
    }

    // Zamknij ewentualne okna dialogowe
    const closeBtns = page.locator('ytcp-button#close-button, button:has-text("Zamknij")');
    const closeCount = await closeBtns.count();
    for (let i = 0; i < closeCount; i++) {
      if (await closeBtns.nth(i).isVisible().catch(() => false)) {
        await closeBtns.nth(i).click().catch(() => {});
        await page.waitForTimeout(500);
      }
    }

    // Kliknij przycisk "Edytuj"
    console.log('Szukam przycisku "Edytuj"...');
    const editBtn = page.locator('#edit-button, button:has-text("Edytuj"), ytcp-button:has-text("Edytuj")').first();
    if (await editBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('Klikam "Edytuj"...');
      await editBtn.click();
      await page.waitForTimeout(3000);

      // 1. Tytuł
      console.log('Wpisuję tytuł...');
      const titleInput = page.locator('#textbox[aria-label*="tytuł" i], #textbox[aria-label*="title" i], input[name="title"]').first();
      if (await titleInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await titleInput.click();
        await titleInput.fill('');
        await titleInput.fill(STREAM_TITLE);
        console.log('Tytuł wpisany!');
      }

      // 2. Opis
      console.log('Wpisuję opis...');
      const descInput = page.locator('#description-textarea #textbox, #textbox[aria-label*="opis" i]').first();
      if (await descInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await descInput.click();
        await descInput.fill('');
        await descInput.fill(STREAM_DESC);
        console.log('Opis wpisany!');
      }

      // 3. Miniatura
      if (fs.existsSync(THUMBNAIL_PATH)) {
        console.log('Wgrywam miniaturę:', THUMBNAIL_PATH);
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.count()) {
          await fileInput.setInputFiles(THUMBNAIL_PATH);
          console.log('Miniatura wgrana!');
          await page.waitForTimeout(2000);
        }
      }

      // 4. Zapisz
      const saveBtn = page.locator('#save-button, button:has-text("Zapisz"), ytcp-button:has-text("Zapisz")').first();
      if (await saveBtn.isVisible().catch(() => false)) {
        await saveBtn.click();
        console.log('Kliknięto Zapisz!');
        await page.waitForTimeout(4000);
      }
    }

    // Pobierz VideoId
    const currentUrl = page.url();
    const match = currentUrl.match(/\/video\/([\w-]+)\//);
    if (match) videoId = match[1];

    // Odczytaj klucz strumienia (Stream Key)
    streamKey = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="password"]'));
      return inputs.map(i => i.value).filter(Boolean)[0] || null;
    });
    console.log('Odczytany klucz strumienia:', streamKey);

    // Włącz automatyczne uruchamianie i zatrzymywanie
    const toggles = page.locator('tp-yt-paper-toggle-button');
    const toggleCount = await toggles.count();
    for (let i = 0; i < toggleCount; i++) {
      const t = toggles.nth(i);
      const txt = (await t.innerText()).trim();
      const isChecked = await t.evaluate(el => el.getAttribute('aria-checked') === 'true' || el.hasAttribute('checked'));
      if (txt.includes('automatyczne uruchamianie') && !isChecked) {
        console.log('Włączam automatyczne uruchamianie...');
        await t.click();
        await page.waitForTimeout(500);
      }
      if (txt.includes('automatyczne zatrzymywanie') && !isChecked) {
        console.log('Włączam automatyczne zatrzymywanie...');
        await t.click();
        await page.waitForTimeout(500);
      }
    }

    const shot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_live_configured.png';
    await page.screenshot({ path: shot });
    console.log('Zrzut ekranu zapisany:', shot);

  } catch (err) {
    console.error('Błąd Studio:', err);
  } finally {
    await ctx.close().catch(() => {});
  }

  // === KROK 2: Ustawienie w OBS ===
  if (streamKey) {
    console.log('\n=== KROK 2: Zapisanie klucza w OBS na komputerze nadawczym ===');
    try {
      const ws = await connectToObs();
      console.log('Aktualizuję klucz strumienia w OBS...');
      await obsSend(ws, 'SetStreamServiceSettings', {
        streamServiceType: 'rtmp_custom',
        streamServiceSettings: {
          server: 'rtmps://a.rtmps.youtube.com:443/live2',
          key: streamKey,
          use_auth: false,
          bwtest: false
        }
      });
      console.log('✅ Klucz strumienia w OBS zaktualizowany!');

      // Upewnijmy się, że źródło przeglądarki wskazuje na https://polskieradio.cc/wieczor?obs=1
      await obsSend(ws, 'SetInputSettings', {
        inputName: 'Przeglądarka',
        inputSettings: {
          url: 'https://polskieradio.cc/wieczor?obs=1',
          width: 1920,
          height: 1080
        }
      });
      console.log('✅ Źródło "Przeglądarka" ustawione na polskieradio.cc/wieczor?obs=1');

      ws.close();
    } catch (obsErr) {
      console.error('Błąd OBS:', obsErr.message);
    }
  }

  console.log('\n🏁 WYNIKI KOŃCOWE:');
  console.log('Klucz strumienia:', streamKey || 'Niezmieniony / domyślny');
  console.log('Link do YouTube Live:', videoId ? `https://youtu.be/${videoId}` : 'Dostępny bezpośrednio na kanale');
}

main().catch(console.error);
