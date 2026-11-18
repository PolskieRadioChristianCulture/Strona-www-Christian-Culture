import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await openChannelStudio(page, 'Osobowość +', '/livestreaming/manage');
    await page.waitForTimeout(3000);
    await page.goto('https://studio.youtube.com/video/Al56YdVI40c/livestreaming', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);

    const elementsWithKlucz = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('*'));
      const matches = [];
      for (const el of all) {
        if (el.children.length === 0 && (el.innerText?.includes('klucz') || el.innerText?.includes('Klucz') || el.innerText?.includes('Wybierz'))) {
          matches.push({
            tag: el.tagName,
            text: el.innerText,
            className: el.className,
            id: el.id,
            parentTag: el.parentElement?.tagName,
            parentClass: el.parentElement?.className
          });
        }
      }
      return matches;
    });

    console.log('Matches for klucz/wybierz:', elementsWithKlucz);

    // Let's also find clickable dropdown / select elements
    const selects = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('ytcp-select, tp-yt-paper-dropdown-menu, [role="combobox"], [aria-haspopup="true"]')).map(el => ({
        tag: el.tagName,
        ariaLabel: el.getAttribute('aria-label'),
        text: el.innerText?.slice(0, 50),
        id: el.id
      }));
    });
    console.log('Selects/dropdowns:', selects);

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
