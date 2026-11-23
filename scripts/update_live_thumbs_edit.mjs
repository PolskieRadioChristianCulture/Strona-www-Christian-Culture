import { chromium } from 'playwright';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_live_dedicated_profile';
const THUMBNAIL_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\thumbnail_tvw_live.jpg';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36';

const TARGETS = [
  { name: 'Christian Culture TV', vid: 'KdOBA_zRU0c', via: '@ChristianCultureTV' },
  { name: 'Popraw Koronę', vid: '9H_xc4mdUro', via: '@PoprawKoronęCC' }
];

async function main() {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    channel: 'chrome',
    viewport: { width: 1600, height: 1000 },
    userAgent: UA,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });

  try {
    const page = ctx.pages()[0] || await ctx.newPage();
    for (const ch of TARGETS) {
      console.log(`\n=== Thumb Sync: ${ch.name} (${ch.vid}) ===`);
      await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 30000 });
      await page.waitForTimeout(1200);
      const item = page.locator('ytd-account-item-renderer', { hasText: ch.via.replace('@', '') }).first();
      if (await item.count()) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {}),
          item.click({ force: true })
        ]);
        await page.waitForTimeout(3000);
      }

      await page.goto(`https://studio.youtube.com/video/${ch.vid}/edit?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(4500);
      const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
      if (await gate.isVisible({ timeout: 1500 }).catch(() => false)) {
        await gate.click({ force: true });
        await page.waitForTimeout(3500);
      }

      let fileSet = false;
      const inputs = page.locator('input[type="file"]');
      const cnt = await inputs.count();
      for (let i = 0; i < cnt; i++) {
        try {
          await inputs.nth(i).setInputFiles(THUMBNAIL_PATH);
          fileSet = true;
          break;
        } catch {}
      }
      if (!fileSet) {
        const optBtn = page.locator('ytcp-thumbnails-compact-editor-uploader #options-button, [aria-label*="Opcje"]').first();
        if (await optBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await optBtn.click({ force: true });
          await page.waitForTimeout(1000);
          const changeItem = page.locator('tp-yt-paper-item:has-text("Zmień"), [role="menuitem"]:has-text("Zmień")').first();
          if (await changeItem.isVisible({ timeout: 2000 }).catch(() => false)) {
            const [fc] = await Promise.all([
              page.waitForEvent('filechooser', { timeout: 8000 }).catch(() => null),
              changeItem.click({ force: true })
            ]);
            if (fc) {
              await fc.setFiles(THUMBNAIL_PATH);
              fileSet = true;
            }
          }
        }
      }

      await page.waitForTimeout(3000);
      const saveBtn = page.locator('#save, #save-button, ytcp-button:has-text("Zapisz"), button:has-text("Zapisz")').first();
      const canSave = await saveBtn.evaluate(node => {
        const inner = node.querySelector('button') || node;
        const disabled = node.hasAttribute('disabled') || node.getAttribute('aria-disabled') === 'true' || inner.disabled || inner.hasAttribute('disabled');
        return !disabled;
      }).catch(() => false);

      if (canSave) {
        await saveBtn.click();
        await page.waitForTimeout(4500);
        console.log(`  ✅ ${ch.name}: Miniatura zapisana!`);
      } else {
        console.log(`  ℹ️ ${ch.name}: Przycisk Zapisz nieaktywny (fileSet=${fileSet})`);
      }
    }
  } finally {
    await ctx.close();
  }
}

main().catch(err => {
  console.error('ERR:', err);
  process.exit(1);
});
