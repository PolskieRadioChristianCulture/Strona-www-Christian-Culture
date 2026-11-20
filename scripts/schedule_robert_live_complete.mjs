import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
import path from 'path';
import fs from 'fs';

const THUMB_PATH = path.resolve('images/wieczor_ze_slowem_bozym_live_bg.jpg');

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log('1. Otwieram YouTube Studio dla Robert Łukasz Pio...');
    await openChannelStudio(page, 'Robert Łukasz Pio', '/livestreaming/manage');
    await page.waitForTimeout(4000);

    console.log('2. Klikam Zaplanuj transmisję...');
    const schedBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję")').first();
    await schedBtn.click();
    await page.waitForTimeout(2500);

    const createNewBtn = page.locator('button:has-text("Utwórz nowe"), ytcp-button:has-text("Utwórz nowe")').first();
    if (await createNewBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      console.log('   Klikam Utwórz nowe...');
      await createNewBtn.click();
      await page.waitForTimeout(2000);
    }

    // Step 1: Szczegóły
    console.log('3. Wypełniam krok 1 (Szczegóły)...');
    
    // Tytuł - dokładnie #title-textarea #textbox
    const titleBox = page.locator('#title-textarea #textbox').first();
    await titleBox.click();
    await titleBox.fill('Wieczór ze Słowem Bożym • Zaznaj spokoju serca [LIVE 20:00]');
    console.log('   Tytuł wypełniony (49 znaków).');

    // Opis - dokładnie #description-textarea #textbox
    const descBox = page.locator('#description-textarea #textbox').first();
    if (await descBox.isVisible({ timeout: 2000 }).catch(() => false)) {
      const descText = `Wieczór ze Słowem Bożym • Zaznaj spokoju serca\nTransmisja na żywo: Poniedziałek, 16 listopada 2026, godz. 20:00 - 24:00.\n\nDołącz do wspólnego wieczoru z Pismem Świętym, kojącą muzyką i rozważaniem Bożego Słowa.\nZatrzymaj się po całym dniu i napełnij swoje serce pokojem, który przewyższa wszelki umysł (Flp 4,7).\n\n📖 Słuchaj również 24/7 na żywo w Radiu Christian Culture:\nhttps://polskieradio.cc/wieczor\n\n#SlowoBoze #WieczorZeSlowemBozym #Biblia #SpokojSerca #ChristianCulture #Modlitwa #Live`;
      await descBox.click();
      await descBox.fill(descText);
      console.log('   Opis wypełniony.');
    }

    // Miniatura
    if (fs.existsSync(THUMB_PATH)) {
      const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 3000 }).catch(() => null);
      const thumbBtn = page.locator('#upload-thumbnail, ytcp-button:has-text("Prześlij miniaturę"), ytcp-thumbnails-compact-editor-uploader').first();
      if (await thumbBtn.isVisible().catch(() => false)) {
        await thumbBtn.click().catch(() => {});
        const fileChooser = await fileChooserPromise;
        if (fileChooser) {
          await fileChooser.setFiles(THUMB_PATH);
          console.log('   Miniatura przesłana:', THUMB_PATH);
          await page.waitForTimeout(2500);
        }
      }
    }

    // Odbiorcy: Nie przeznaczone dla dzieci
    const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
    await notForKids.click();
    await page.waitForTimeout(1000);

    // Krok 1 -> Krok 2
    console.log('4. Przechodzę przez kolejne kroki...');
    const nextBtn = page.locator('#next-button, button:has-text("Dalej"), ytcp-button:has-text("Dalej")').first();
    await nextBtn.click();
    await page.waitForTimeout(2500);

    // Krok 2 (Monetyzacja / Zarabianie jeśli jest) -> Dalej
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
    }

    // Krok 3 (Dostosowywanie) -> Dalej
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
    }

    // Krok 4: Widoczność
    console.log('5. Krok 4: Ustawiam widoczność i godzinę...');
    // Publiczny radio
    const publicRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
    if (await publicRadio.isVisible().catch(() => false)) {
      await publicRadio.click();
      await page.waitForTimeout(1000);
    }

    // Ustawienie godziny 20:00
    const timeInput = page.locator('#time-of-day-container input').first();
    if (await timeInput.isVisible().catch(() => false)) {
      await timeInput.click();
      await timeInput.fill('20:00');
      await timeInput.press('Enter');
      console.log('   Godzina 20:00 ustawiona.');
      await page.waitForTimeout(1000);
    }

    const preConfirmShot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_live_scheduled_step4.png';
    await page.screenshot({ path: preConfirmShot });
    console.log('   Zrzut przed potwierdzeniem:', preConfirmShot);

    // Kliknij "Gotowe"
    console.log('6. Klikam Gotowe...');
    const gotoweBtn = page.locator('ytcp-button:has-text("Gotowe"), button:has-text("Gotowe")').first();
    await gotoweBtn.click();
    console.log('   Kliknięto Gotowe, czekam na przetworzenie...');
    await page.waitForTimeout(7000);

    const postShot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_live_scheduled_done.png';
    await page.screenshot({ path: postShot });
    console.log('   Zrzut po utworzeniu:', postShot);

    // Pobierz link
    const shareLink = await page.evaluate(() => {
      const linkEl = document.querySelector('a[href*="youtu.be"], a[href*="youtube.com/watch"]');
      if (linkEl) return linkEl.href;
      const copyInput = document.querySelector('input[value*="youtu.be"]');
      if (copyInput) return copyInput.value;
      return null;
    });

    console.log('=== WYNIK HARMONOGRAMU YOUTUBE ===');
    console.log('Link transmisji:', shareLink || 'Sprawdzam w zarządzaniu...');

    // Zamknij dialog sukcesu jeśli jest
    const closeDialogBtn = page.locator('ytcp-button:has-text("Zamknij"), button:has-text("Zamknij")').first();
    if (await closeDialogBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await closeDialogBtn.click();
      await page.waitForTimeout(2000);
    }

    // Przejdź do /livestreaming/manage
    await page.goto('https://studio.youtube.com/channel/UC34DD8FTh_y2GhZhg3qBaIQ/livestreaming/manage', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);

    const manageShot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_manage_final.png';
    await page.screenshot({ path: manageShot });
    console.log('Zrzut listy zarządzania:', manageShot);

    const rows = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('ytcp-video-row, ytls-manage-table-row, [role="row"]')).map(r => ({
        text: r.innerText.trim().replace(/\n+/g, ' | ')
      }));
      return items;
    });

    console.log('Zaplanowane transmisje:\n', JSON.stringify(rows.slice(0, 5), null, 2));

  } catch (err) {
    console.error('BŁĄD:', err);
  } finally {
    await ctx.close();
  }
}

main();
