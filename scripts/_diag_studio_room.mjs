import { chromium } from 'playwright';
import fs from 'node:fs';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const OUT = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\scratch';
const via = process.argv[2] || '@CCWomen7';
const channelId = process.argv[3] || 'UC-LPFt-vmJCeap746DOWMgw';
const tag = process.argv[4] || 'ccwomen';

const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
  headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
  args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
});
const page = ctx.pages()[0] || await ctx.newPage();
try {
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(1500);
  const names = await page.locator('ytd-account-item-renderer').allInnerTexts();
  console.log('ACCOUNTS:', names.map(n => n.replace(/\s+/g, ' ').trim()).join(' || '));
  const item = page.locator('ytd-account-item-renderer', { hasText: via.replace('@', '') }).first();
  if (await item.count()) { await item.click(); await page.waitForTimeout(5000); console.log('SWITCHED to', via); }
  else console.log('NO ACCOUNT ITEM for', via);

  await page.goto(`https://studio.youtube.com/channel/${channelId}/livestreaming/manage?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(7000);
  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) { await gate.click(); await page.waitForTimeout(5000); }
  await page.screenshot({ path: `${OUT}\\studio_${tag}_manage.png` });
  const manageText = (await page.locator('body').innerText()).replace(/\n{2,}/g, '\n').slice(0, 2500);
  console.log('URL:', page.url());
  console.log('MANAGE TEXT:\n', manageText);

  const row = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
  if (await row.isVisible().catch(() => false)) {
    await row.click();
    await page.waitForTimeout(9000);
    await page.screenshot({ path: `${OUT}\\studio_${tag}_room.png` });
    const roomText = (await page.locator('body').innerText()).replace(/\n{2,}/g, '\n').slice(0, 3500);
    console.log('ROOM URL:', page.url());
    console.log('ROOM TEXT:\n', roomText);
  } else {
    console.log('NO ROW');
  }
} catch (e) {
  console.log('ERR', e.message);
  await page.screenshot({ path: `${OUT}\\studio_${tag}_err.png` }).catch(() => {});
} finally {
  await ctx.close();
}
