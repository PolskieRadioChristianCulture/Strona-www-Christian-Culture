import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
import path from 'path';
import fs from 'fs';

const THUMBNAIL_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\wieczor_ze_slowem_bozym_thumb.jpg';
const STREAM_TITLE = 'Wieczór ze Słowem Bożym • Zaznaj spokoju serca 🕊️ Pismo Święte i Modlitwa [DZIŚ 20:00]';
const STREAM_DESC = `🕊️ WIECZÓR ZE SŁOWEM BOŻYM • ZAZNAJ SPOKOJU SERCA
Zapraszamy na wspólny wieczór wyciszenia, pokoju serca i zanurzenia w Słowie Bożym. 

Zatrzymaj się po całym dniu, oddaj troski Bogu i pozwól, aby Jego obecność napełniła Twój dom głębokim spokojem.

🙏 WESPRZYJ MISJĘ CHRISTIAN CULTURE:
Jeśli to Słowo i modlitwa wnoszą pokój do Twojego serca, pomóż nam budować niezależne chrześcijańskie media:
👉 https://polskieradio.cc/wspieraj (BLIK, szybki przelew, karta)

🌐 ODKRYJ WIĘCEJ W EKOSYSTEMIE CHRISTIAN CULTURE:
✨ Portal Społecznościowy LUMINA: https://polskieradio.cc/lumina
📖 Pismo Święte Interlinearne: https://polskieradio.cc/mojabiblia
🎧 Chrześcijańskie Radio i Słuchowiska: https://polskieradio.cc/player
🎬 Chrześcijańskie Kino VOD: https://polskieradio.cc/vod

Błogosławionego wieczoru! Zostaw intencję modlitewną w komentarzu na czacie. Subskrybuj kanał i kliknij dzwoneczek 🔔, aby być powiadamianym o kolejnych transmisjach.

#WieczórZeSłowemBożym #SłowoBoże #Modlitwa #SpokójSerca #Biblia #PismoŚwięte #ChristianCulture #Wiara #BógJestDobry`;

async function main() {
  console.log('=== Planowanie transmisji na kanale Robert Łukasz Pio ===');
  console.log('Miniatura:', THUMBNAIL_PATH, 'Istnieje:', fs.existsSync(THUMBNAIL_PATH));

  const { ctx, page } = await launchStudio({ headless: true });

  try {
    const channelId = await openChannelStudio(page, 'Robert Łukasz Pio', '/livestreaming/manage');
    console.log('Otwarto Studio kanału Robert Łukasz Pio:', channelId);
    await page.waitForTimeout(4000);

    const shot1 = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_manage_view.png';
    await page.screenshot({ path: shot1 });
    console.log('Zrzut ekranu zapisany do:', shot1);

    // Sprawdźmy co jest na stronie
    const pageText = await page.evaluate(() => document.body.innerText);
    console.log('Tekst strony zarzadzania (pierwsze 300 znaków):', pageText.slice(0, 300).replace(/\n+/g, ' '));

    // Kliknij "Zaplanuj transmisję"
    const schedBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję"), #schedule-stream-button').first();
    if (await schedBtn.isVisible().catch(() => false)) {
      console.log('Klikam przycisk "Zaplanuj transmisję"...');
      await schedBtn.click();
      await page.waitForTimeout(3000);
    } else {
      console.log('Szukam alternatywnych przycisków...');
      const createBtn = page.locator('#create-icon, button:has-text("Utwórz"), ytcp-button:has-text("Utwórz")').first();
      if (await createBtn.isVisible().catch(() => false)) {
        await createBtn.click();
        await page.waitForTimeout(1000);
        const liveOption = page.locator('tp-yt-paper-item:has-text("Rozpocznij transmisję na żywo"), [test-id="upload-live"]').first();
        if (await liveOption.isVisible().catch(() => false)) {
          await liveOption.click();
          await page.waitForTimeout(3000);
        }
      }
    }

    const shot2 = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_schedule_dialog.png';
    await page.screenshot({ path: shot2 });
    console.log('Zrzut po kliknięciu planowania:', shot2);

    // Sprawdźmy czy jest okno "Planowanie z wykorzystaniem wcześniejszych ustawień" / "Utwórz nowe"
    const createNewBtn = page.locator('button:has-text("Utwórz nowe"), ytcp-button:has-text("Utwórz nowe")').first();
    if (await createNewBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Klikam "Utwórz nowe"...');
      await createNewBtn.click();
      await page.waitForTimeout(2500);
    }

    // Wypełnij tytuł
    console.log('Ustawianie tytułu...');
    const titleInput = page.locator('#textbox[aria-label*="tytuł" i], #textbox[aria-label*="title" i], textarea[name="title"], input[name="title"], #textbox').first();
    if (await titleInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await titleInput.click();
      await titleInput.fill('');
      await titleInput.fill(STREAM_TITLE);
      console.log('Tytuł wpisany!');
    }

    // Wypełnij opis
    console.log('Ustawianie opisu...');
    const descInput = page.locator('#description-textarea #textbox, #textbox[aria-label*="opis" i], #textbox[aria-label*="description" i]').first();
    if (await descInput.isVisible({ timeout: 4000 }).catch(() => false)) {
      await descInput.click();
      await descInput.fill('');
      await descInput.fill(STREAM_DESC);
      console.log('Opis wpisany!');
    }

    // Miniatura
    console.log('Wgrywanie miniatury...');
    const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 4000 }).catch(() => null);
    const thumbUploadBtn = page.locator('#upload-button, [aria-label*="miniatur" i], button:has-text("Prześlij miniaturę"), ytcp-button:has-text("Prześlij miniaturę")').first();
    if (await thumbUploadBtn.isVisible().catch(() => false)) {
      await thumbUploadBtn.click();
      const fileChooser = await fileChooserPromise;
      if (fileChooser) {
        await fileChooser.setFiles(THUMBNAIL_PATH);
        console.log('Miniatura przesłana przez fileChooser!');
        await page.waitForTimeout(2000);
      }
    } else {
      // Spróbuj bezpośrednio input type=file
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.count()) {
        await fileInput.setInputFiles(THUMBNAIL_PATH);
        console.log('Miniatura przesłana przez input[type="file"]!');
        await page.waitForTimeout(2000);
      }
    }

    // Sprawdź czy jest pole wyboru daty i godziny w Kroku 1
    const scheduleInputs = await page.locator('input[type="text"], input[role="combobox"]').evaluateAll(inputs => 
      inputs.map(i => ({ aria: i.getAttribute('aria-label'), placeholder: i.placeholder, val: i.value })).filter(i => i.aria || i.placeholder || i.val)
    ).catch(() => []);
    console.log('Pola tekstowe w bieżącym kroku:', JSON.stringify(scheduleInputs));
    console.log('Ustawianie nie dla dzieci...');
    const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], tp-yt-paper-radio-button:has-text("Nie, nie są przeznaczone dla dzieci")').first();
    if (await notForKids.isVisible({ timeout: 3000 }).catch(() => false)) {
      await notForKids.click();
      console.log('Zaznaczono NOT_MFK');
    }

    const shot3 = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_step1_filled.png';
    await page.screenshot({ path: shot3 });

    // Przechodzenie przez kreator: Krok 2, 3, 4
    for (let step = 1; step <= 3; step++) {
      console.log(`Przechodzę krok ${step}...`);
      const nextBtn = page.locator('#next-button, button:has-text("Dalej"), ytcp-button:has-text("Dalej")').first();
      if (await nextBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    // Krok widoczności i harmonogramu
    console.log('Ustawianie daty i widoczności...');
    const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
    if (await pubRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
      await pubRadio.click();
      await page.waitForTimeout(1000);
    }

    // Ustawienie godziny transmisji na 20:00 jeśli jest pole czasu
    const timeInput = page.locator('input[aria-label*="godzin" i], input[aria-label*="czas" i], ytcp-form-input-container input').first();
    if (await timeInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Znaleziono pole czasu, próba ustawienia 20:00...');
      // await timeInput.fill('20:00');
    }

    const shot4 = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_visibility_step.png';
    await page.screenshot({ path: shot4 });

    // Kliknij "Gotowe" / "Zapisz"
    console.log('Kończenie kreatora (Zapisz / Gotowe)...');
    const doneBtn = page.locator('#done-button, button:has-text("Gotowe"), ytcp-button:has-text("Gotowe"), button:has-text("Zapisz"), ytcp-button:has-text("Zapisz")').first();
    if (await doneBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await doneBtn.click();
      console.log('Kliknięto Zapisz/Gotowe!');
      await page.waitForTimeout(6000);
    }

    const shot5 = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_after_save.png';
    await page.screenshot({ path: shot5 });
    console.log('Zrzut po zapisie:', shot5);

    // Sprawdźmy obecny URL i ewentualne linki do transmisji
    console.log('Końcowy URL:', page.url());

    // Pobierz link do wideo / pokoju transmisji
    const videoLink = await page.evaluate(() => {
      const share = document.querySelector('a[href*="youtu.be"], a[href*="youtube.com/watch"]');
      if (share) return share.href;
      const text = document.body.innerText;
      const match = text.match(/https:\/\/(?:youtu\.be|www\.youtube\.com\/watch\?v=)([\w-]+)/);
      return match ? match[0] : null;
    });

    console.log('Znaleziony link do transmisji:', videoLink);

  } catch (err) {
    console.error('Błąd podczas planowania:', err);
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_error.png' });
  } finally {
    await ctx.close();
  }
}

main();
