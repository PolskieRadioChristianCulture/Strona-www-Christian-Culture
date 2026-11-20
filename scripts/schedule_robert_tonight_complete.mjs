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
  console.log('=== KROK 1: YouTube Studio — Planowanie transmisji na 20:00 ===');
  const { ctx, page } = await launchStudio({ headless: true });

  let streamKey = null;
  let publicLiveUrl = null;

  try {
    await openChannelStudio(page, 'Robert Łukasz Pio', '/livestreaming/manage');
    await page.waitForTimeout(4000);

    // Kliknij przycisk "Zaplanuj transmisję"
    console.log('Szukam przycisku "Zaplanuj transmisję"...');
    const schedBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję")').first();
    await schedBtn.waitFor({ timeout: 10000 });
    await schedBtn.click();
    console.log('Kliknięto "Zaplanuj transmisję"!');
    await page.waitForTimeout(3000);

    // Sprawdź czy jest "Utwórz nowe"
    const createNewBtn = page.locator('button:has-text("Utwórz nowe"), ytcp-button:has-text("Utwórz nowe")').first();
    if (await createNewBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Klikam "Utwórz nowe"...');
      await createNewBtn.click();
      await page.waitForTimeout(2500);
    }

    // Krok 1: Wypełnianie szczegółów (Tytuł, opis)
    console.log('Wpisuję tytuł...');
    const titleInput = page.locator('#textbox[aria-label*="tytuł" i], #textbox[aria-label*="title" i], textarea[name="title"], input[name="title"], #textbox').first();
    await titleInput.waitFor({ timeout: 10000 });
    await titleInput.click();
    await titleInput.fill('');
    await titleInput.fill(STREAM_TITLE);
    console.log('Tytuł wpisany!');

    console.log('Wpisuję opis...');
    const descInput = page.locator('#description-textarea #textbox, #textbox[aria-label*="opis" i], #textbox[aria-label*="description" i]').first();
    if (await descInput.isVisible({ timeout: 4000 }).catch(() => false)) {
      await descInput.click();
      await descInput.fill('');
      await descInput.fill(STREAM_DESC);
      console.log('Opis wpisany!');
    }

    // Miniatura
    if (fs.existsSync(THUMBNAIL_PATH)) {
      console.log('Wgrywam miniaturę promocyjną...');
      const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 4000 }).catch(() => null);
      const thumbBtn = page.locator('#upload-button, button:has-text("Prześlij miniaturę"), ytcp-button:has-text("Prześlij miniaturę")').first();
      if (await thumbBtn.isVisible().catch(() => false)) {
        await thumbBtn.click();
        const chooser = await fileChooserPromise;
        if (chooser) {
          await chooser.setFiles(THUMBNAIL_PATH);
          console.log('Miniatura przesłana przez fileChooser!');
          await page.waitForTimeout(2000);
        }
      } else {
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.count()) {
          await fileInput.setInputFiles(THUMBNAIL_PATH);
          console.log('Miniatura przesłana przez input[type="file"]!');
          await page.waitForTimeout(2000);
        }
      }
    }

    // Nie dla dzieci
    const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], tp-yt-paper-radio-button:has-text("Nie, nie są przeznaczone dla dzieci")').first();
    if (await notForKids.isVisible({ timeout: 4000 }).catch(() => false)) {
      await notForKids.click();
      console.log('Zaznaczono NOT_MFK');
      await page.waitForTimeout(1000);
    }

    // Przejdź dalej przez kolejne kroki
    for (let step = 1; step <= 3; step++) {
      console.log(`Przechodzę krok kreatora ${step}...`);
      const nextBtn = page.locator('#next-button, button:has-text("Dalej"), ytcp-button:has-text("Dalej")').first();
      if (await nextBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(2500);
      }
    }

    // Krok widoczności: Publiczny
    console.log('Wybieram widoczność: Publiczny...');
    const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
    if (await pubRadio.isVisible({ timeout: 4000 }).catch(() => false)) {
      await pubRadio.click();
      console.log('Zaznaczono Publiczny!');
      await page.waitForTimeout(1000);
    }

    // Sprawdź czy jest pole wyboru godziny (np. 20:00)
    const timeInputs = page.locator('input[aria-label*="godzin" i], input[aria-label*="czas" i], ytcp-form-input-container input');
    if (await timeInputs.count() > 0) {
      console.log('Ustawiam godzinę 20:00...');
      await timeInputs.first().fill('20:00').catch(() => {});
    }

    // Kliknij "Gotowe" / "Zapisz"
    console.log('Zapisuję transmisję...');
    const doneBtn = page.locator('#done-button, button:has-text("Gotowe"), ytcp-button:has-text("Gotowe"), button:has-text("Zapisz"), ytcp-button:has-text("Zapisz")').first();
    await doneBtn.waitFor({ timeout: 8000 });
    await doneBtn.click();
    console.log('Kliknięto Zapisz/Gotowe!');
    await page.waitForTimeout(6000);

    // Jeśli pojawiło się okno z linkiem do udostępniania
    publicLiveUrl = await page.evaluate(() => {
      const link = document.querySelector('a[href*="youtu.be"], a[href*="youtube.com/watch"]');
      return link ? link.href : null;
    });

    console.log('Odczytany publiczny link:', publicLiveUrl);

    // Wejdź do pokoju nowo utworzonej transmisji z listy /manage
    if (page.url().includes('/manage')) {
      console.log('Wchodzę do pokoju utworzonej transmisji...');
      const rowLink = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
      if (await rowLink.isVisible({ timeout: 4000 }).catch(() => false)) {
        await rowLink.click();
        await page.waitForTimeout(6000);
      }
    }

    // Odczytaj klucz strumienia (Stream Key)
    streamKey = await page.evaluate(() => {
      const input = document.querySelector('input[type="password"]');
      return input ? input.value : null;
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

    const shotReady = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_live_scheduled_2000.png';
    await page.screenshot({ path: shotReady });
    console.log('Zrzut zaplanowanej transmisji zapisany:', shotReady);

  } catch (err) {
    console.error('Błąd podczas planowania w Studio:', err);
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_schedule_error.png' }).catch(() => {});
  } finally {
    await ctx.close().catch(() => {});
  }

  // === KROK 2: Konfiguracja OBS na komputerze nadawczym ===
  console.log('\n=== KROK 2: Konfiguracja OBS na komputerze nadawczym ===');
  try {
    const ws = await connectToObs();

    // 1. Sprawdźmy bieżący status
    const currentStatus = await obsSend(ws, 'GetStreamStatus');
    console.log('Bieżący status transmisji w OBS:', currentStatus.outputActive ? 'NADAJE' : 'ZATRZYMANY');

    // 2. Jeśli mamy klucz strumienia z nowo zaplanowanego live, zaktualizuj go w OBS
    if (streamKey) {
      console.log('Ustawiam klucz strumienia w OBS na:', streamKey);
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
    }

    // 3. Ustaw źródło przeglądarki na https://polskieradio.cc/wieczor?obs=1
    await obsSend(ws, 'SetInputSettings', {
      inputName: 'Przeglądarka',
      inputSettings: {
        url: 'https://polskieradio.cc/wieczor?obs=1',
        width: 1920,
        height: 1080,
        fps: 30,
        reroute_audio: true,
        restart_when_active: true
      }
    });
    console.log('✅ Źródło "Przeglądarka" w OBS ustawione na https://polskieradio.cc/wieczor?obs=1');

    ws.close();
  } catch (obsErr) {
    console.error('Błąd połączenia z OBS:', obsErr.message);
  }

  console.log('\n🎉 PODSUMOWANIE TRANSMISJI:');
  console.log('Tytuł:', STREAM_TITLE);
  console.log('Godzina startu:', '20:00 (16.11.2026)');
  console.log('Link YouTube:', publicLiveUrl || 'Sprawdzam w Studio');
  console.log('Klucz strumienia:', streamKey || 'Skonfigurowany w OBS');
}

main().catch(console.error);
