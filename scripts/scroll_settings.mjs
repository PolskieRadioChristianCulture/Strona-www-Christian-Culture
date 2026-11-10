import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/video/KYSla9a5bjQ/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Scroll down the entire page and particularly the settings cards
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
    const scrollables = document.querySelectorAll('div, ytcp-card, ytls-stream-settings');
    scrollables.forEach(s => s.scrollTop = s.scrollHeight);
  });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\scrolled_settings.png', fullPage: true });

  // Extract all text inside "Ustawienia dodatkowe" or all toggle labels
  const additionalSettings = await page.evaluate(() => {
    const texts = Array.from(document.querySelectorAll('*'))
      .filter(e => e.innerText && e.innerText.includes('Włącz DVR'))
      .map(e => e.innerText);
    return texts[texts.length - 1] || 'Not found';
  });
  console.log('Text around Włącz DVR:\n', additionalSettings);

  // Check all paper-toggle-buttons and their parent labels
  const allToggles = await page.evaluate(() => {
    const toggles = Array.from(document.querySelectorAll('tp-yt-paper-toggle-button, ytcp-paper-toggle-button, ytcp-toggle'));
    return toggles.map(t => {
      let label = t.innerText || t.getAttribute('aria-label');
      let parent = t.parentElement;
      for (let i = 0; i < 3 && parent; i++) {
        if (parent.innerText && parent.innerText.length < 150) {
          label = parent.innerText;
          break;
        }
        parent = parent.parentElement;
      }
      return {
        id: t.id,
        label: label ? label.trim().replace(/\s+/g, ' ') : '',
        checked: t.hasAttribute('checked') || t.getAttribute('aria-checked') === 'true',
        disabled: t.hasAttribute('disabled') || t.getAttribute('aria-disabled') === 'true',
        visible: t.offsetParent !== null
      };
    });
  });
  console.log('All toggles on page:\n', JSON.stringify(allToggles, null, 2));

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
