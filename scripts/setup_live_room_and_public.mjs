import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    const videoId = 'z33rEkjNciY';
    const roomUrl = `https://studio.youtube.com/video/${videoId}/livestreaming`;
    console.log('1. Otwieram pokój transmisji:', roomUrl);
    await page.goto(roomUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    const roomShot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_live_room_z33r.png';
    await page.screenshot({ path: roomShot });
    console.log('Zrzut pokoju transmisji:', roomShot);

    // Odczytaj dane ze strony
    const pageData = await page.evaluate(() => {
      // Find stream key
      const passInputs = Array.from(document.querySelectorAll('input[type="password"]')).map(i => i.value);
      const textInputs = Array.from(document.querySelectorAll('input')).map(i => ({ aria: i.getAttribute('aria-label'), val: i.value }));
      const btns = Array.from(document.querySelectorAll('button, ytcp-button')).map(b => b.innerText.trim()).filter(Boolean);
      return { passInputs, textInputs, btns: btns.slice(0, 15) };
    });

    console.log('Dane ze strony pokoju:\n', JSON.stringify(pageData, null, 2));

    // Kliknij przycisk "Edytuj" aby zmienić widoczność na Publiczny
    console.log('2. Szukam przycisku Edytuj...');
    const editBtn = page.locator('button:has-text("Edytuj"), ytcp-button:has-text("Edytuj")').first();
    if (await editBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editBtn.click();
      console.log('Kliknięto Edytuj');
      await page.waitForTimeout(3000);

      const editModalShot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_edit_modal.png';
      await page.screenshot({ path: editModalShot });
      console.log('Zrzut okna edycji:', editModalShot);

      // W oknie edycji zmień widoczność na Publiczny
      const visTrigger = page.locator('ytcp-text-dropdown-trigger#visibility-trigger, [id*="visibility"]').first();
      if (await visTrigger.isVisible({ timeout: 2000 }).catch(() => false)) {
        await visTrigger.click();
        await page.waitForTimeout(1000);
      }

      const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
      if (await pubRadio.isVisible({ timeout: 2000 }).catch(() => false)) {
        await pubRadio.click();
        await page.waitForTimeout(1000);
      }

      // Kliknij "Zapisz"
      const saveBtn = page.locator('button:has-text("Zapisz"), ytcp-button:has-text("Zapisz")').first();
      if (await saveBtn.isVisible().catch(() => false)) {
        await saveBtn.click();
        console.log('Kliknięto Zapisz');
        await page.waitForTimeout(3000);
      }
    }

    const finalShot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_live_room_final.png';
    await page.screenshot({ path: finalShot });
    console.log('Zrzut końcowy pokoju:', finalShot);

  } catch (err) {
    console.error('BŁĄD:', err);
  } finally {
    await ctx.close();
  }
}

main();
