import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log('Otwieram /livestreaming dla Robert Łukasz Pio...');
    await openChannelStudio(page, 'Robert Łukasz Pio', '/livestreaming');
    await page.waitForTimeout(5000);

    const shot1 = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_live_direct.png';
    await page.screenshot({ path: shot1 });
    console.log('Zapisano zrzut:', shot1);

    const text = await page.evaluate(() => document.body.innerText);
    console.log('Tekst na stronie /livestreaming:\n', text.slice(0, 500).replace(/\n+/g, ' '));

    console.log('Sprawdzam URL:', page.url());

    // Sprawdźmy czy jest pole z kluczem strumienia lub przycisk Utwórz
    const streamKey = await page.evaluate(() => {
      const input = document.querySelector('input[type="password"]');
      return input ? input.value : null;
    });
    console.log('Klucz strumienia:', streamKey);

  } catch (err) {
    console.error('Błąd:', err);
  } finally {
    await ctx.close().catch(() => {});
  }
}

main();
