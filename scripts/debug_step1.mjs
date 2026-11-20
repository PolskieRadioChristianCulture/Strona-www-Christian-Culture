import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
import path from 'path';
import fs from 'fs';

const THUMB_PATH = path.resolve('images/wieczor_ze_slowem_bozym_live_bg.jpg');

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await openChannelStudio(page, 'Robert Łukasz Pio', '/livestreaming/manage');
    await page.waitForTimeout(4000);

    const schedBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję")').first();
    await schedBtn.click();
    await page.waitForTimeout(2500);

    const createNewBtn = page.locator('button:has-text("Utwórz nowe"), ytcp-button:has-text("Utwórz nowe")').first();
    if (await createNewBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await createNewBtn.click();
      await page.waitForTimeout(2000);
    }

    const titleInput = page.locator('#textbox[aria-label*="tytuł" i], textarea[name="title"], #textbox').first();
    await titleInput.fill('Wieczór ze Słowem Bożym • Zaznaj spokoju serca [LIVE 20:00]');
    console.log('Tytuł wpisany:', await titleInput.innerText().catch(() => ''));

    // Opis
    const descInput = page.locator('#description-container #textbox, textarea[aria-label*="opis" i], #textbox[aria-label*="opis" i]').first();
    if (await descInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await descInput.fill('Wieczór ze Słowem Bożym • Zaznaj spokoju serca\nTransmisja na żywo: Poniedziałek, 16 listopada 2026, godz. 20:00.');
      console.log('Opis wpisany.');
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
          console.log('Miniatura przesłana');
          await page.waitForTimeout(2500);
        }
      }
    }

    // Not for kids
    const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], tp-yt-paper-radio-button:has-text("Nieprzeznaczony dla dzieci")').first();
    await notForKids.click();
    await page.waitForTimeout(1000);

    // Click Dalej ONCE and check what happens
    const nextBtn = page.locator('#next-button, button:has-text("Dalej"), ytcp-button:has-text("Dalej")').first();
    console.log('Next button visible:', await nextBtn.isVisible(), 'enabled:', await nextBtn.isEnabled());
    await nextBtn.click();
    await page.waitForTimeout(2000);

    // Sprawdź błędy
    const errors = await page.evaluate(() => {
      const errEls = Array.from(document.querySelectorAll('[aria-invalid="true"], [invalid], ytcp-form-error-tip, .error-message, .error-text, #error-message'));
      return errEls.map(el => ({
        tag: el.tagName,
        id: el.id,
        text: el.innerText.trim(),
        html: el.outerHTML.slice(0, 150)
      }));
    });

    console.log('Błędy walidacji:', JSON.stringify(errors, null, 2));

    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\step1_validation_debug.png' });

  } catch (err) {
    console.error(err);
  } finally {
    await ctx.close();
  }
}

main();
