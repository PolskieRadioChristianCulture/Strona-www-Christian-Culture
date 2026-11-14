import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { ALL_CHANNELS } from './all_channels_config.mjs';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const THUMBNAIL_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\thumbnail_cc.jpg';
const OUT = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\scratch';

if (!fs.existsSync(THUMBNAIL_PATH)) {
  console.error('Thumbnail file does not exist:', THUMBNAIL_PATH);
  process.exit(1);
}

const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
  headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
  args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
});
const page = ctx.pages()[0] || await ctx.newPage();

async function switchTo(via) {
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(1000);
  const target = via.replace('@', '');
  const item = page.locator('ytd-account-item-renderer', { hasText: target }).first();
  if (await item.count()) {
    await item.click();
    await page.waitForTimeout(4000);
    return true;
  }
  return false;
}

async function uploadThumbnail(channel) {
  console.log(`\n========================================`);
  console.log(`Updating thumbnail for: ${channel.channelName} (${channel.via})`);
  console.log(`========================================`);
  
  try {
    const switched = await switchTo(channel.via);
    if (!switched) {
      console.log(`❌ Could not switch to identity ${channel.via}`);
      return { channel: channel.channelName, status: 'ERROR_NO_IDENTITY' };
    }

    let id = channel.id;
    if (!id || id.startsWith('UC_placeholder')) {
      await page.goto(`https://www.youtube.com/${encodeURI(channel.handle)}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);
      id = await page.evaluate(() =>
        document.querySelector('meta[itemprop="identifier"], meta[itemprop="channelId"]')?.content ||
        (document.querySelector('link[rel="canonical"]')?.href.match(/channel\/(UC[\w-]+)/) || [])[1] || null);
    }
    if (!id) {
      console.log(`❌ Could not find channel ID for ${channel.handle}`);
      return { channel: channel.channelName, status: 'ERROR_NO_ID' };
    }

    await page.goto(`https://studio.youtube.com/channel/${id}/livestreaming/manage?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
    if (await gate.isVisible().catch(() => false)) { await gate.click(); await page.waitForTimeout(4000); }

    const row = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
    if (!await row.isVisible().catch(() => false)) {
      console.log(`⚠️ No active/scheduled broadcast row found for ${channel.channelName}`);
      return { channel: channel.channelName, status: 'NO_ROW' };
    }

    await row.click();
    await page.waitForTimeout(7000);

    // Edit button
    const editBtn = page.locator('#edit-button, button:has-text("Edytuj")').first();
    if (!await editBtn.isVisible().catch(() => false)) {
      console.log(`⚠️ Edit button not visible`);
      return { channel: channel.channelName, status: 'NO_EDIT_BUTTON' };
    }
    await editBtn.click();
    await page.waitForTimeout(2500);

    // Upload thumbnail
    let uploaded = false;
    const fileInput = page.locator('input[type="file"][accept*="image"]').first();
    if (await fileInput.count()) {
      await fileInput.setInputFiles(THUMBNAIL_PATH);
      uploaded = true;
      console.log(`  📸 Thumbnail injected into file input`);
    } else {
      const thumbSection = page.locator('[class*="thumbnail"], ytcp-thumbnail-with-preview, #thumbnail-section').first();
      if (await thumbSection.isVisible().catch(() => false)) {
        await thumbSection.click();
        await page.waitForTimeout(1000);
        const modalInput = page.locator('input[type="file"]').first();
        if (await modalInput.count()) {
          await modalInput.setInputFiles(THUMBNAIL_PATH);
          uploaded = true;
          console.log(`  📸 Thumbnail injected after clicking section`);
        }
      }
    }

    if (!uploaded) {
      console.log(`❌ Failed to locate thumbnail input`);
      const closeBtn = page.locator('#close-button, button:has-text("Zamknij")').first();
      if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click().catch(() => {});
      return { channel: channel.channelName, status: 'NO_INPUT' };
    }

    await page.waitForTimeout(2000);
    const saveBtn = page.locator('#save-button, button:has-text("Zapisz"), ytcp-button:has-text("Zapisz")').first();
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(4000);
      console.log(`  ✅ ZAPISANO miniaturę dla ${channel.channelName}`);
      return { channel: channel.channelName, status: 'SUCCESS' };
    } else {
      console.log(`⚠️ Save button not clickable`);
      const closeBtn = page.locator('#close-button, button:has-text("Zamknij")').first();
      if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click().catch(() => {});
      return { channel: channel.channelName, status: 'NO_SAVE' };
    }
  } catch (err) {
    console.log(`❌ Error: ${err.message}`);
    return { channel: channel.channelName, status: 'ERROR: ' + err.message };
  }
}

const targetChannels = process.argv[2] 
  ? ALL_CHANNELS.filter(c => process.argv[2].split(',').includes(c.channelName))
  : ALL_CHANNELS;

const results = [];
for (const ch of targetChannels) {
  const res = await uploadThumbnail(ch);
  results.push(res);
  await page.waitForTimeout(1500);
}

await ctx.close();
console.log('\n\n=== PODSUMOWANIE MINIATUR ===');
for (const r of results) {
  console.log(`${r.status === 'SUCCESS' ? '🟢' : '🔴'} ${r.channel.padEnd(30)}: ${r.status}`);
}
