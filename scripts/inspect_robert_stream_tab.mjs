import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await openChannelStudio(page, 'Robert Łukasz Pio', '/livestreaming');
    await page.waitForTimeout(4000);

    // Kliknij pierwszą zakładkę / ikonę "Transmisja" po lewej
    console.log('Szukam zakładki "Transmisja"...');
    const streamTab = page.locator('tp-yt-paper-tab[test-id="STREAM"], tp-yt-paper-tab:has-text("Transmisja"), a[href*="livestreaming/stream"], [aria-label*="Transmisja" i]').first();
    if (await streamTab.isVisible().catch(() => false)) {
      console.log('Klikam zakładkę "Transmisja"...');
      await streamTab.click();
      await page.waitForTimeout(5000);
    } else {
      console.log('Przechodzę bezpośrednio na URL /livestreaming/stream...');
      await page.goto(page.url().replace(/\/livestreaming.*$/, '/livestreaming/stream'), { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(5000);
    }

    console.log('Aktualny URL po przejściu:', page.url());
    const shot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_stream_tab.png';
    await page.screenshot({ path: shot });
    console.log('Zrzut zapisany do:', shot);

    // Odczytaj klucz strumienia
    const streamKey = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="password"]'));
      return inputs.map(i => i.value).filter(Boolean);
    });
    console.log('Znalezione klucze strumienia w input[type="password"]:', streamKey);

    // Odczytaj tekst i przyciski
    const details = await page.evaluate(() => {
      const title = document.querySelector('#title, #video-title, ytcp-badge')?.innerText || document.title;
      return { title, url: window.location.href };
    });
    console.log('Szczegóły widoku:', details);

  } catch (err) {
    console.error('Błąd:', err);
  } finally {
    await ctx.close().catch(() => {});
  }
}

main();
