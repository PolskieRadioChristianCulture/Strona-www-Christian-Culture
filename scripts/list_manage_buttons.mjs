import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await openChannelStudio(page, 'Robert Łukasz Pio', '/livestreaming/manage');
    await page.waitForTimeout(5000);

    const info = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, ytcp-button, tp-yt-paper-button, [role="button"], a')).map(b => ({
        tag: b.tagName,
        text: b.innerText.replace(/\s+/g, ' ').trim(),
        id: b.id,
        href: b.href
      })).filter(b => b.text.length > 0 && b.text.length < 50);

      const headings = Array.from(document.querySelectorAll('h1, h2, h3, .heading')).map(h => h.innerText.trim());

      return { headings, btns };
    });

    console.log('Nagłówki:', info.headings);
    console.log('Przyciski i akcje (pierwsze 30):', info.btns.slice(0, 30));

  } catch (err) {
    console.error('Błąd:', err);
  } finally {
    await ctx.close().catch(() => {});
  }
}

main();
