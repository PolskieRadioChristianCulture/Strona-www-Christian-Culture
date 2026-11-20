import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const OBS_HOST = 'ws://192.168.50.217:4455';
const OBS_PASSWORD = '6qPcL0sXrVvs6sPN';

const THUMBNAIL_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\images\\wieczor_ze_slowem_bozym_live_bg.jpg';
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

// Pomocnik OBS WebSocket
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
          reject(new Error(m.d.requestStatus.comment || 'OBS request failed: ' + type));
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
    ws.onopen = () => console.log('Połączono z OBS na komputerze nadawczym');
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
  console.log('=== KROK 1: YouTube Studio — Przygotowanie transmisji dla algorytmu ===');
  const { ctx, page } = await launchStudio({ headless: true });

  let streamKey = null;
  let publicLiveUrl = null;

  try {
    const channelId = await openChannelStudio(page, 'Robert Łukasz Pio', '/livestreaming/manage');
    console.log('Studio kanału Robert Łukasz Pio:', channelId);
    await page.waitForTimeout(4000);

    // Sprawdźmy czy jest zaplanowana transmisja w /manage
    const rows = await page.locator('ytcp-video-row, ytls-broadcast-row, [role="row"]').count();
    console.log('Liczba wierszy w /manage:', rows);

    // Kliknij pierwszy wiersz jeśli istnieje, aby wejść do pokoju transmisji
    const rowTitle = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
    if (await rowTitle.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('Wchodzę do pokoju istniejącej transmisji...');
      await rowTitle.click();
      await page.waitForTimeout(6000);
    } else {
      // Jeśli brak, kliknij Zaplanuj transmisję
      console.log('Brak transmisji, klikam "Zaplanuj transmisję"...');
      const schedBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję"), #schedule-stream-button').first();
      if (await schedBtn.isVisible().catch(() => false)) {
        await schedBtn.click();
        await page.waitForTimeout(3000);
      }
    }

    console.log('Aktualny URL pokoju transmisji:', page.url());

    // Pobierzmy link publiczny do wideo / share
    const currentUrl = page.url();
    const match = currentUrl.match(/\/video\/([\w-]+)\//);
    if (match) {
      publicLiveUrl = `https://youtu.be/${match[1]}`;
      console.log('Publiczny link do transmisji:', publicLiveUrl);
    }

    // Zamknij ewentualny modal / kliknij Edytuj szczegóły
    const editBtn = page.locator('button:has-text("Edytuj"), ytcp-button:has-text("Edytuj"), #edit-button').first();
    if (await editBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Klikam "Edytuj" szczegóły transmisji...');
      await editBtn.click();
      await page.waitForTimeout(2500);

      // Tytuł
      const titleInput = page.locator('#textbox[aria-label*="tytuł" i], #textbox[aria-label*="title" i], input[name="title"], textarea[name="title"]').first();
      if (await titleInput.isVisible().catch(() => false)) {
        await titleInput.click();
        await titleInput.fill('');
        await titleInput.fill(STREAM_TITLE);
        console.log('Tytuł zaktualizowany:', STREAM_TITLE);
      }

      // Opis
      const descInput = page.locator('#description-textarea #textbox, #textbox[aria-label*="opis" i]').first();
      if (await descInput.isVisible().catch(() => false)) {
        await descInput.click();
        await descInput.fill('');
        await descInput.fill(STREAM_DESC);
        console.log('Opis zaktualizowany!');
      }

      // Miniatura
      if (fs.existsSync(THUMBNAIL_PATH)) {
        const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 3000 }).catch(() => null);
        const changeThumbBtn = page.locator('#options-button, [aria-label*="miniatur" i]').first();
        if (await changeThumbBtn.isVisible().catch(() => false)) {
          // await changeThumbBtn.click();
        }
      }

      // Zapisz zmiany
      const saveBtn = page.locator('#save-button, button:has-text("Zapisz"), ytcp-button:has-text("Zapisz")').first();
      if (await saveBtn.isVisible().catch(() => false)) {
        await saveBtn.click();
        console.log('Zapisano szczegóły w Studio!');
        await page.waitForTimeout(3000);
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
        await page.waitForTimeout(800);
      }
      if (txt.includes('automatyczne zatrzymywanie') && !isChecked) {
        console.log('Włączam automatyczne zatrzymywanie...');
        await t.click();
        await page.waitForTimeout(800);
      }
    }

    const shot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_live_room_ready.png';
    await page.screenshot({ path: shot });
    console.log('Zrzut pokoju transmisji zapisany:', shot);

  } catch (err) {
    console.error('Błąd w Studio:', err);
  } finally {
    await ctx.close().catch(() => {});
  }

  // === KROK 2: Konfiguracja OBS na komputerze nadawczym ===
  console.log('\n=== KROK 2: Konfiguracja OBS na komputerze nadawczym ===');
  try {
    const ws = await connectToObs();

    // 1. Zaktualizuj URL źródła "Przeglądarka" w scenie głównej na https://polskieradio.cc/wieczor?obs=1
    console.log('Aktualizuję źródło "Przeglądarka" w OBS...');
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
    console.log('✅ Źródło "Przeglądarka" zaktualizowane na: https://polskieradio.cc/wieczor?obs=1');

    // 2. Jeśli mamy klucz strumienia, zaktualizuj go w OBS
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
      console.log('✅ Klucz strumienia w OBS zaktualizowany pomyślnie!');
    }

    // 3. Sprawdźmy status streamu
    const streamStatus = await obsSend(ws, 'GetStreamStatus');
    console.log('Aktualny status streamu w OBS:', JSON.stringify(streamStatus, null, 2));

    ws.close();
  } catch (obsErr) {
    console.error('Błąd konfiguracji OBS:', obsErr.message);
  }

  console.log('\n🎉 KONFIGURACJA ZAKOŃCZONA!');
  console.log('Publiczny link do zaplanowanego live:', publicLiveUrl || 'Do sprawdzenia w Studio');
}

main().catch(console.error);
