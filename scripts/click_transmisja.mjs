import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await openChannelStudio(page, 'Osobowość +', '/livestreaming/dashboard');
  await page.waitForTimeout(4000);

  const sidebarItems = await page.evaluate(() => {
    // Look for elements with text "Transmisja"
    const all = Array.from(document.querySelectorAll('*'));
    return all
      .filter(el => (el.innerText === 'Transmisja' || el.getAttribute('aria-label') === 'Transmisja') && el.children.length === 0)
      .map(el => ({
        tag: el.tagName,
        text: el.innerText,
        className: el.className,
        parentTag: el.parentElement?.tagName,
        parentClass: el.parentElement?.className,
        grandParentTag: el.parentElement?.parentElement?.tagName,
        role: el.getAttribute('role') || el.parentElement?.getAttribute('role')
      }));
  });

  console.log('Sidebar items:', JSON.stringify(sidebarItems, null, 2));

  // Let's try clicking the element that has text "Transmisja"
  const clicked = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('*'))
      .find(e => (e.innerText === 'Transmisja' || e.getAttribute('aria-label') === 'Transmisja') && e.children.length === 0);
    if (el) {
      // Find closest clickable ancestor or el itself
      const target = el.closest('a, button, ytcp-navigation-item, tp-yt-paper-tab, ytls-icon-button') || el.parentElement || el;
      target.click();
      return { clickedTag: target.tagName, text: el.innerText };
    }
    return null;
  });

  console.log('Clicked result:', clicked);
  await page.waitForTimeout(8000);

  console.log('New URL:', page.url());
  const shotPath = `C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\after_click_transmisja.png`;
  await page.screenshot({ path: shotPath, fullPage: true });
  console.log(`Screenshot saved to: ${shotPath}`);

  const bodyText = await page.evaluate(() => document.body.innerText);
  const keywords = ['Brak danych', 'Połącz oprogramowanie', 'Doskonałe połączenie', 'Dobre połączenie', 'Klucz strumienia', 'Automatyczny start', 'Rozpocznij transmisję', 'Domyślny klucz'];
  for (const kw of keywords) {
    if (bodyText.includes(kw)) console.log(`  [Match] "${kw}"`);
  }

  const idx = bodyText.indexOf('Klucz strumienia');
  if (idx !== -1) {
    console.log(`\n--- Text around Klucz strumienia ---\n${bodyText.slice(Math.max(0, idx - 50), idx + 500)}`);
  }

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
