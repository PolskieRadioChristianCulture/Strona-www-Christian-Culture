import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/video/n6IfxzwXBXU/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Find all elements near "Klucz wygenerowany"
  const elements = await page.evaluate(() => {
    const list = Array.from(document.querySelectorAll('*'));
    const matched = list.filter(el => (el.innerText || '').includes('Klucz wygenerowany') && el.children.length === 0);
    return matched.map(el => {
      let p = el.parentElement;
      return {
        tag: el.tagName,
        text: el.innerText,
        parentTag: p?.tagName,
        parentClass: p?.className,
        grandParentTag: p?.parentElement?.tagName,
        grandParentClass: p?.parentElement?.className
      };
    });
  });

  console.log('Matched elements:\n', JSON.stringify(elements, null, 2));

  // Let's click the clickable ancestor of "Klucz wygenerowany"
  const clicked = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('*')).find(e => (e.innerText || '').includes('Klucz wygenerowany') && e.children.length === 0);
    if (!el) return 'el not found';
    const clickTarget = el.closest('tp-yt-paper-dropdown-menu, ytcp-dropdown, ytls-stream-key-selector, button, [role="button"], ytls-player-action') || el.parentElement;
    clickTarget.click();
    return { clickedTag: clickTarget.tagName, class: clickTarget.className };
  });

  console.log('Click result:', clicked);
  await page.waitForTimeout(2000);

  // Check if dropdown menu opened
  const menuItems = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('tp-yt-paper-item, ytcp-text-menu-item, [role="option"], ytcp-ve'));
    return items.map(i => i.innerText.trim()).filter(Boolean);
  });
  console.log('Menu items found:\n', menuItems);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\key_dropdown_clicked.png' });

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
