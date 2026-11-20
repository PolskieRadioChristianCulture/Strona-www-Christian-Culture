import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

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
    await titleInput.fill('Wieczór ze Słowem Bożym • Zaznaj spokoju serca [DZIŚ 20:00]');

    const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
    await notForKids.click();
    await page.waitForTimeout(1000);

    for (let i = 0; i < 3; i++) {
      await page.locator('#next-button, button:has-text("Dalej"), ytcp-button:has-text("Dalej")').first().click();
      await page.waitForTimeout(2000);
    }

    const inputs = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('*'));
      return all
        .filter(el => {
          const txt = el.innerText || '';
          const val = el.value || '';
          return txt.includes('12:15') || val.includes('12:15') || (el.getAttribute('aria-label') || '').includes('godzin');
        })
        .map(el => ({
          tag: el.tagName,
          id: el.id,
          className: el.className,
          ariaLabel: el.getAttribute('aria-label'),
          value: el.value,
          text: el.innerText ? el.innerText.trim() : ''
        }));
    });

    console.log('Inputs found:\n', JSON.stringify(inputs.slice(0, 10), null, 2));

    const gotowe = page.locator('ytcp-button:has-text("Gotowe"), button:has-text("Gotowe")').first();
    console.log('Gotowe visible:', await gotowe.isVisible());
    console.log('Gotowe enabled:', await gotowe.isEnabled());

  } catch (err) {
    console.error(err);
  } finally {
    await ctx.close();
  }
}

main();
