import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/video/KYSla9a5bjQ/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  // Look for stream key elements or copy buttons
  const streamKeyData = await page.evaluate(() => {
    // Look for all inputs, password fields, or copy buttons
    const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
      id: i.id,
      name: i.name,
      type: i.type,
      value: i.value,
      ariaLabel: i.getAttribute('aria-label'),
      placeholder: i.placeholder
    }));

    // Look for stream key selector dropdown
    const dropdown = document.querySelector('ytls-stream-key-selector, #stream-key-selector, yt-dropdown-menu');
    const dropdownText = dropdown ? dropdown.innerText : null;

    // Look for header elements (Go live / etc.)
    const header = document.querySelector('ytls-header, .ytls-header');
    const headerHtml = header ? header.innerHTML : null;
    const headerText = header ? header.innerText : null;

    // Look for any status badges / error messages
    const badges = Array.from(document.querySelectorAll('.badge, ytcp-badge, .status-indicator, ytls-stream-status, .health-status'))
      .map(b => b.innerText);

    return { inputs, dropdownText, headerText, badges };
  });

  console.log('Stream key data:', JSON.stringify(streamKeyData, null, 2));

  // Let's check the copy stream key button
  // In YouTube Studio, the stream key copy button is usually a paper-button with aria-label or text containing "Kopiuj"
  const copyButtons = page.locator('button:has-text("Kopiuj"), tp-yt-paper-button:has-text("Kopiuj"), [aria-label*="Kopiuj"]');
  const count = await copyButtons.count();
  console.log(`Found ${count} copy buttons.`);

  // Let's click the stream key dropdown to see available stream keys!
  console.log('Clicking stream key dropdown...');
  const keyDropdown = page.locator('ytls-stream-key-selector, [aria-label*="Klucz"], #stream-key-selector').first();
  if (await keyDropdown.isVisible().catch(() => false)) {
    await keyDropdown.click();
    await page.waitForTimeout(2000);
    const dropdownItems = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('tp-yt-paper-item, ytcp-text-menu-item, tp-yt-paper-listbox *'));
      return items.map(i => i.innerText).filter(Boolean);
    });
    console.log('Stream key dropdown items:', dropdownItems);
    await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\stream_key_dropdown.png' });
  }

  // Let's inspect the top right header where "Transmituj na żywo" or "Rozpocznij transmisję" should be
  const topButtons = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('ytls-header button, ytls-header ytcp-button, ytls-header tp-yt-paper-button'));
    return btns.map(b => ({
      text: (b.innerText || b.getAttribute('aria-label') || '').trim(),
      id: b.id,
      className: b.className,
      disabled: b.hasAttribute('disabled') || b.getAttribute('aria-disabled') === 'true',
      style: b.getAttribute('style')
    }));
  });
  console.log('Top header buttons:', topButtons);

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
