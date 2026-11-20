import { launchStudio } from './yt_studio_session.mjs';

const SHOT_DIR = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await page.goto('https://studio.youtube.com/video/z33rEkjNciY/edit', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('ytcp-video-metadata-visibility', { timeout: 45000 });
    await page.waitForTimeout(2500);

    await page.locator('ytcp-video-metadata-visibility').first().click();
    await page.waitForTimeout(1500);

    const radios = await page.evaluate(() =>
      Array.from(document.querySelectorAll('tp-yt-paper-radio-button')).map((r) => ({
        name: r.getAttribute('name'),
        text: (r.innerText || '').trim().split('\n')[0],
        checked: r.getAttribute('aria-checked'),
      }))
    );
    console.log('Radia:', JSON.stringify(radios));

    // Dokładne dopasowanie: name="PUBLIC" albo tekst dokładnie "Publiczny" (NIE "Niepubliczny")
    let pub = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first();
    if (!(await pub.isVisible().catch(() => false))) {
      pub = page.locator('tp-yt-paper-radio-button').filter({ hasText: /^\s*Publiczny/ }).first();
    }
    await pub.click();
    await page.waitForTimeout(1000);
    console.log('Zaznaczono Publiczny, aria-checked =', await pub.getAttribute('aria-checked'));
    await page.screenshot({ path: SHOT_DIR + 'vis_public_selected.png' });

    await page.locator('#save-button').filter({ hasText: 'Gotowe' }).first().click();
    await page.waitForTimeout(1500);

    const save = page.locator('ytcp-button#save').first();
    await save.click();
    await page.waitForTimeout(5000);

    const vis = await page.evaluate(() => {
      const el = document.querySelector('ytcp-video-metadata-visibility');
      return el ? el.innerText.trim().replace(/\s+/g, ' ') : 'brak';
    });
    console.log('Widoczność po zapisie:', vis);
    await page.screenshot({ path: SHOT_DIR + 'vis_public_final.png' });
  } catch (err) {
    console.error('BŁĄD:', err.message);
    await page.screenshot({ path: SHOT_DIR + 'vis_public_error.png' }).catch(() => {});
  } finally {
    await ctx.close();
  }
}

main();
