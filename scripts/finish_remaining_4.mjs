import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
import { chromium } from 'playwright';
import fs from 'fs';

const THUMBNAIL_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\thumbnail_cc.jpg';
const ARTIFACTS_DIR = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138';
const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

const REMAINING_CHANNELS = [
  {
    channelName: 'Osobowość +',
    id: 'UCHmPxDM2zzlUAf5ZvlotPLw',
    via: 'Osobowość',
    title: 'Osobowość + LIVE 🔴 | Christian Culture TV24',
    existingVideoId: 'suYDIRikPjQ'
  },
  {
    channelName: 'Werset Dnia',
    id: 'UCyOvW5DuDLVq5XWFyijgtbw',
    via: 'Osobowość',
    title: 'Werset Dnia LIVE 🔴 24/7 | Chrześcijański Serwis Biblijny'
  },
  {
    channelName: 'Popraw Koronę',
    handle: 'PoprawKoronęCC',
    via: 'Osobowość',
    title: 'Popraw Koronę LIVE 🔴 24/7 | Christian Culture'
  },
  {
    channelName: 'CC Identity',
    handle: 'CCIdentityTwojaDuchowaTożsamoś',
    via: 'Osobowość',
    title: 'CC Identity LIVE 🔴 24/7 | Twoja Duchowa Tożsamość'
  }
];

async function enableAutoStart(page) {
  const result = await page.evaluate(() => {
    const tList = Array.from(document.querySelectorAll('tp-yt-paper-toggle-button, ytcp-paper-toggle-button'));
    for (const t of tList) {
      const p = t.closest('.toggle-container') || t.parentElement?.parentElement || t.parentElement;
      const text = p ? p.innerText : '';
      if (/automatyczne uruchamianie/i.test(text)) {
        const isChecked = t.getAttribute('aria-checked') === 'true' || t.hasAttribute('checked');
        if (!isChecked) { t.click(); return 'turned ON'; }
        return 'already ON';
      }
    }
    return 'not found';
  });
  console.log(`  → Auto-start: ${result}`);
  await page.waitForTimeout(1000);
  
  const confirmBtn = page.locator('ytcp-confirmation-dialog #confirm-button, button:has-text("Włącz")').first();
  if (await confirmBtn.isVisible().catch(() => false)) {
    await confirmBtn.click();
    await page.waitForTimeout(1500);
    console.log('  → Auto-start confirmed.');
  }
  return result;
}

async function uploadThumbnail(page) {
  try {
    const inp = page.locator('input[type="file"][accept*="image"]').first();
    if (await inp.count()) {
      await inp.setInputFiles(THUMBNAIL_PATH);
      await page.waitForTimeout(3000);
      console.log('  → Thumbnail uploaded via file input!');
      return true;
    }
    const thumbBtn = page.locator('ytcp-thumbnail-upload-button, button:has-text("Prześlij miniaturę"), button:has-text("Zmień")').first();
    if (await thumbBtn.isVisible().catch(() => false)) {
      const [fc] = await Promise.all([
        page.waitForFileChooser({ timeout: 5000 }),
        thumbBtn.click()
      ]).catch(() => [null]);
      if (fc) {
        await fc.setFiles(THUMBNAIL_PATH);
        await page.waitForTimeout(3000);
        console.log('  → Thumbnail uploaded via button!');
        return true;
      }
    }
    return false;
  } catch (err) {
    console.log(`  ⚠️ Thumbnail upload error: ${err.message}`);
    return false;
  }
}

async function run() {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    channel: 'chrome',
    viewport: { width: 1600, height: 1000 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  // First switch to Osobowość
  console.log('Switching to Osobowość identity in switcher...');
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 40000 });
  await page.waitForTimeout(1500);
  const item = page.locator('ytd-account-item-renderer', { hasText: 'Osobowość' }).first();
  if (await item.count()) {
    await item.click();
    await page.waitForTimeout(4000);
  }

  for (const ch of REMAINING_CHANNELS) {
    console.log(`\n============================================================`);
    console.log(`📺 Processing: ${ch.channelName}`);
    console.log(`============================================================`);

    try {
      if (ch.existingVideoId) {
        // Osobowość + : set public
        console.log(`Setting ${ch.existingVideoId} to Public on edit page...`);
        await page.goto(`https://studio.youtube.com/video/${ch.existingVideoId}/edit`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(4000);

        const visText = page.locator('#visibility-text').first();
        if (await visText.isVisible().catch(() => false)) {
          await visText.click();
          await page.waitForTimeout(1000);
          const pubOpt = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"]').first();
          if (await pubOpt.isVisible().catch(() => false)) {
            await pubOpt.click();
            await page.waitForTimeout(500);
            console.log('  → Set to Publiczny');
          }
          const doneBtn = page.locator('ytcp-button#save-button, button:has-text("Gotowe")').first();
          if (await doneBtn.isVisible().catch(() => false)) await doneBtn.click();
          await page.waitForTimeout(500);
        }

        const saveBtn = page.locator('button:has-text("Zapisz")').last();
        if (await saveBtn.isEnabled().catch(() => false)) {
          await saveBtn.click();
          console.log('  → Saved video edit page!');
          await page.waitForTimeout(3000);
        }

        console.log(`Checking live room for ${ch.existingVideoId}...`);
        await page.goto(`https://studio.youtube.com/video/${ch.existingVideoId}/livestreaming`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(4000);
        await enableAutoStart(page);
        console.log(`✅ ${ch.channelName} updated successfully!`);
        continue;
      }

      // Resolve channel ID if not present
      let channelId = ch.id;
      if (!channelId && ch.handle) {
        console.log(`Resolving channel ID for @${ch.handle}...`);
        await page.goto(`https://www.youtube.com/@${ch.handle}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(2500);
        channelId = await page.evaluate(() => {
          return document.querySelector('meta[itemprop="identifier"], meta[itemprop="channelId"]')?.content ||
            (document.querySelector('link[rel="canonical"]')?.href.match(/channel\/(UC[\w-]+)/) || [])[1] || null;
        });
        console.log(`Resolved channelId: ${channelId}`);
      }

      if (!channelId) {
        console.error(`❌ Could not resolve channel ID for ${ch.channelName}`);
        continue;
      }

      // Open livestreaming manage
      console.log(`Opening manage page: https://studio.youtube.com/channel/${channelId}/livestreaming/manage`);
      await page.goto(`https://studio.youtube.com/channel/${channelId}/livestreaming/manage`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(4000);

      // Dismiss browser gate if any
      const gateLink = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
      if (await gateLink.isVisible().catch(() => false)) {
        await gateLink.click();
        await page.waitForTimeout(4000);
      }

      // Click Zaplanuj transmisję
      const schedBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję")').first();
      if (!await schedBtn.isVisible().catch(() => false)) {
        console.log(`⚠️ Zaplanuj button not found on ${ch.channelName}`);
        continue;
      }
      await schedBtn.click();
      await page.waitForTimeout(2500);

      // Reuse settings or create new
      const reuseBtn = page.locator('button:has-text("Użyj poprzednich ustawień")').first();
      if (await reuseBtn.isVisible().catch(() => false)) {
        console.log('  → Użyj poprzednich ustawień');
        await reuseBtn.click();
      } else {
        const createNewBtn = page.locator('button:has-text("Utwórz nowe")').first();
        if (await createNewBtn.isVisible().catch(() => false)) {
          await createNewBtn.click();
        }
      }
      await page.waitForTimeout(3000);

      // Title
      const titleBox = page.locator('#textbox[contenteditable="true"]').first();
      if (await titleBox.isVisible().catch(() => false)) {
        await titleBox.click({ clickCount: 3 });
        await titleBox.fill(ch.title);
        console.log('  → Title set.');
      }

      // Not for kids
      const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
      if (await notForKids.isVisible().catch(() => false)) await notForKids.click();
      await page.waitForTimeout(1000);

      // Wizard steps
      for (let s = 1; s <= 3; s++) {
        const nextBtn = page.locator('#next-button button, button:has-text("Dalej")').last();
        if (await nextBtn.isVisible().catch(() => false)) {
          await nextBtn.click();
          await page.waitForTimeout(2000);
        }
      }

      // Publiczny
      const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"]').first();
      if (await pubRadio.isVisible().catch(() => false)) {
        await pubRadio.click();
        console.log('  → Visibility: Publiczny ✅');
      }

      // Done
      const doneBtn = page.locator('#done-button button, ytcp-button#done-button, button:has-text("Gotowe")').last();
      await doneBtn.click();
      console.log('  → Gotowe clicked!');
      await page.waitForTimeout(5000);

      const currentUrl = page.url();
      const videoIdMatch = currentUrl.match(/\/video\/([^/]+)\//);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;
      console.log(`  → Stream URL: ${currentUrl}, videoId: ${videoId}`);

      // Auto-start
      await enableAutoStart(page);

      // Thumbnail
      await uploadThumbnail(page);

      const shot = `${ARTIFACTS_DIR}\\remaining_${ch.channelName.replace(/[^a-z0-9]/gi, '_')}.png`;
      await page.screenshot({ path: shot });
      console.log(`✅ ${ch.channelName}: SUCCESS (videoId: ${videoId || 'created'})`);

    } catch (err) {
      console.error(`❌ ${ch.channelName} failed:`, err.message);
    }
  }

  await ctx.close();
}

run().catch(console.error);
