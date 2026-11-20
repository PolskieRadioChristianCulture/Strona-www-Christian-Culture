import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await openChannelStudio(page, 'Robert Łukasz Pio', '/livestreaming/manage');
    await page.waitForTimeout(3000);
    await page.goto('https://studio.youtube.com/video/z33rEkjNciY/livestreaming', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);

    const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';
    await page.screenshot({ path: `${artDir}/robert_studio_now.png` });

    const data = await page.evaluate(() => {
      const liveBtn = document.querySelector('button:has-text("Transmituj na żywo"), ytcp-button:has-text("Transmituj na żywo"), #go-live-button button');
      const endBtn = document.querySelector('button:has-text("Zakończ transmisję"), ytcp-button:has-text("Zakończ transmisję")');
      const health = document.querySelector('.stream-health, [class*="health"]')?.innerText;
      const text = document.body.innerText;
      return {
        hasLiveBtn: !!liveBtn,
        liveBtnDisabled: liveBtn ? liveBtn.disabled || liveBtn.getAttribute('aria-disabled') : null,
        hasEndBtn: !!endBtn,
        health,
        includesDoskonaly: text.includes('Doskonały') || text.includes('Połączenie doskonałe'),
        includesBrakDanych: text.includes('Brak danych')
      };
    });
    console.log('Robert studio state:', data);
  } finally {
    await ctx.close();
  }
}
main().catch(console.error);
