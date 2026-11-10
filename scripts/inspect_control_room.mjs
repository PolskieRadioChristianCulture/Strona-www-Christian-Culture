import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  console.log('Launching Studio via yt_studio_session...');
  const { ctx, page } = await launchStudio({ headless: true });

  const channelName = 'Osobowość +';
  console.log(`Opening Studio for: ${channelName}`);
  const channelId = await openChannelStudio(page, channelName, '/livestreaming');
  await page.waitForTimeout(4000);

  console.log(`Current URL: ${page.url()}`);

  // Find all left sidebar navigation links/buttons
  const navItems = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('ytcp-navigation-item, tp-yt-paper-tab, a, ytcp-icon-button'));
    return items.map(el => ({
      tag: el.tagName,
      text: (el.innerText || el.getAttribute('aria-label') || '').trim(),
      href: el.getAttribute('href'),
      id: el.id,
      className: el.className
    })).filter(x => x.text || x.href);
  });

  console.log('Nav items found:', navItems.filter(x => /transmis|kamera|zarządz/i.test(x.text || x.href)));

  // Click on "Transmisja"
  console.log('Attempting to click "Transmisja"...');
  const streamNav = page.locator('ytcp-navigation-item:has-text("Transmisja"), a:has-text("Transmisja"), [aria-label*="Transmisja"]').first();
  if (await streamNav.isVisible().catch(() => false)) {
    console.log('Found streamNav, clicking...');
    await streamNav.click();
  } else {
    console.log('streamNav not visible, trying direct goto /livestreaming/stream');
    await page.goto(`https://studio.youtube.com/channel/${channelId}/livestreaming/stream?approve_browser_access=true`);
  }

  await page.waitForTimeout(8000);
  console.log(`URL after clicking Transmisja: ${page.url()}`);

  const shotPath = `C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\stream_control_room_osobowosc.png`;
  await page.screenshot({ path: shotPath, fullPage: true });
  console.log(`Screenshot saved to: ${shotPath}`);

  // Inspect page text and state
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Body text length:', bodyText.length);
  
  const keywords = [
    'Brak danych', 'Połącz oprogramowanie', 'Doskonałe połączenie', 'Dobre połączenie',
    'Automatyczny start', 'Włącz automatyczny start', 'Automatyczne zatrzymanie',
    'Prywatny', 'Niepubliczny', 'Publiczny', 'Rozpocznij transmisję', 'Zakończ transmisję',
    'Klucz strumienia', 'Stream key', 'NA ŻYWO', 'LIVE', 'W toku', 'Nadawanie'
  ];
  for (const kw of keywords) {
    if (bodyText.includes(kw)) {
      console.log(`  [Match] "${kw}"`);
    }
  }

  // Find all toggles and inputs
  const details = await page.evaluate(() => {
    const toggles = Array.from(document.querySelectorAll('tp-yt-paper-toggle-button, ytcp-paper-toggle-button, ytcp-toggle')).map(t => ({
      label: (t.innerText || t.getAttribute('aria-label') || t.parentElement?.innerText || '').trim(),
      checked: t.hasAttribute('checked') || t.getAttribute('aria-checked') === 'true'
    }));

    const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
      id: i.id,
      value: i.value,
      type: i.type,
      ariaLabel: i.getAttribute('aria-label')
    }));

    const buttons = Array.from(document.querySelectorAll('button, ytcp-button, tp-yt-paper-button')).map(b => ({
      text: (b.innerText || b.getAttribute('aria-label') || '').trim(),
      disabled: b.hasAttribute('disabled') || b.getAttribute('aria-disabled') === 'true'
    })).filter(b => b.text.length > 0 && b.text.length < 50);

    return { toggles, inputs, buttons };
  });

  console.log('Details:', JSON.stringify(details, null, 2));

  // Check text around "Klucz strumienia"
  const idx = bodyText.indexOf('Klucz strumienia');
  if (idx !== -1) {
    console.log(`\n--- Text around Klucz strumienia ---\n${bodyText.slice(Math.max(0, idx - 50), idx + 500)}`);
  } else {
    console.log('\n--- First 1000 chars ---\n', bodyText.slice(0, 1000));
  }

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
