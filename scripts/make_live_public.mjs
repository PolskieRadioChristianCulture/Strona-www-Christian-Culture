import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    const videoId = 'z33rEkjNciY';
    const roomUrl = `https://studio.youtube.com/video/${videoId}/livestreaming`;
    console.log('1. Otwieram pokój transmisji:', roomUrl);
    await page.goto(roomUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);

    // Zamknij popup "Edytowanie układu pionowego" jeśli jest
    const promoGotowe = page.locator('div:has-text("Edytowanie układu pionowego") ytcp-button:has-text("Gotowe"), button:has-text("Gotowe")').first();
    if (await promoGotowe.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Zamykam popup informacyjny...');
      await promoGotowe.click();
      await page.waitForTimeout(2000);
    }

    // Kliknij przycisk Edytuj przy tytule/prywatności
    console.log('2. Klikam przycisk Edytuj metadanych...');
    const editBtn = page.locator('button:has-text("Edytuj"), ytcp-button:has-text("Edytuj")').first();
    await editBtn.click();
    await page.waitForTimeout(3000);

    const editDialogShot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_live_edit_dialog.png';
    await page.screenshot({ path: editDialogShot });
    console.log('Zrzut okna edycji:', editDialogShot);

    // W oknie edycji szukamy sekcji widoczności / prywatności
    // Najpierw sprawdźmy widoczność
    const privDropdown = page.locator('#privacy-dropdown, ytcp-text-dropdown-trigger#privacy, ytcp-dropdown-trigger:has-text("Niepubliczny")').first();
    if (await privDropdown.isVisible({ timeout: 2500 }).catch(() => false)) {
      console.log('Klikam rozwijane menu prywatności...');
      await privDropdown.click();
      await page.waitForTimeout(1000);
      const publicOpt = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [test-id="PUBLIC"], tp-yt-paper-item:has-text("Publiczny")').first();
      await publicOpt.click();
      await page.waitForTimeout(1000);
    } else {
      // Może jest radio bezpośrednio
      const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
      if (await pubRadio.isVisible({ timeout: 2000 }).catch(() => false)) {
        await pubRadio.click();
        await page.waitForTimeout(1000);
      }
    }

    // Kliknij Zapisz w oknie edycji
    const saveBtn = page.locator('#save-button, button:has-text("Zapisz"), ytcp-button:has-text("Zapisz")').first();
    if (await saveBtn.isVisible().catch(() => false)) {
      console.log('Klikam Zapisz...');
      await saveBtn.click();
      await page.waitForTimeout(4000);
    }

    // Sprawdź widoczność w pokoju
    const finalRoomShot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_live_room_public_ready.png';
    await page.screenshot({ path: finalRoomShot });
    console.log('Zrzut finalny pokoju:', finalRoomShot);

    // Kopiuj klucz strumienia
    const copyKeyBtn = page.locator('ytcp-icon-button[aria-label*="Kopiuj" i], button[aria-label*="Kopiuj" i]').first();
    console.log('Przycisk kopiowania klucza widoczny:', await copyKeyBtn.isVisible().catch(() => false));

  } catch (err) {
    console.error('BŁĄD:', err);
  } finally {
    await ctx.close();
  }
}

main();
