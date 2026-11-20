import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    const videoId = 'z33rEkjNciY';
    const roomUrl = `https://studio.youtube.com/video/${videoId}/livestreaming`;
    await page.goto(roomUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);

    // 1. Sprawdź czy jest jakikolwiek dialog na wierzchu i zamknij go
    const dialogDismissBtn = page.locator('ytcp-dialog button:has-text("Gotowe"), ytcp-dialog button:has-text("Anuluj"), ytcp-dialog #close-button, [role="dialog"] button:has-text("Gotowe")').first();
    if (await dialogDismissBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Zamykam otwarty dialog...');
      await dialogDismissBtn.click();
      await page.waitForTimeout(2000);
    }

    // 2. Kliknij przycisk Edytuj w sekcji metadanych (obok tytułu i kategorii)
    console.log('Szukam przycisku Edytuj...');
    const editBtn = page.locator('#edit-button, ytcp-button:has-text("Edytuj"), button:has-text("Edytuj")').first();
    await editBtn.click();
    await page.waitForTimeout(2500);

    const dialogShot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\metadata_edit_open.png';
    await page.screenshot({ path: dialogShot });
    console.log('Zrzut dialogu:', dialogShot);

    // 3. W dialogu edycji kliknij widoczność i wybierz Publiczny
    const privSelect = page.locator('#privacy-dropdown, ytcp-dropdown-trigger:has-text("Niepubliczny"), [id*="privacy"]').first();
    if (await privSelect.isVisible({ timeout: 2500 }).catch(() => false)) {
      await privSelect.click();
      await page.waitForTimeout(1000);
      const publicOpt = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny"), tp-yt-paper-item:has-text("Publiczny")').first();
      await publicOpt.click();
      await page.waitForTimeout(1000);
    }

    // 4. Zapisz
    const saveBtn = page.locator('#save-button, ytcp-button:has-text("Zapisz"), button:has-text("Zapisz")').first();
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click();
      console.log('Kliknięto Zapisz');
      await page.waitForTimeout(3000);
    }

    const checkShot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\metadata_edit_saved.png';
    await page.screenshot({ path: checkShot });
    console.log('Zrzut końcowy:', checkShot);

  } catch (err) {
    console.error(err);
  } finally {
    await ctx.close();
  }
}

main();
