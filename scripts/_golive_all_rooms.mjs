import { chromium } from 'playwright';
import fs from 'node:fs';
import { ALL_CHANNELS } from './all_channels_config.mjs';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const OUT = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\scratch';
const SKIP = new Set(['Biblia Audio CC', 'Osobowość +']);
const only = process.argv[2] ? new Set(process.argv[2].split(',')) : null;

const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
  headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
  args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
});
const page = ctx.pages()[0] || await ctx.newPage();
const results = [];

async function switchTo(via) {
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(1500);
  const item = page.locator('ytd-account-item-renderer', { hasText: via.replace('@', '') }).first();
  if (!await item.count()) throw new Error('brak konta ' + via);
  await item.click();
  await page.waitForTimeout(4000);
}

async function resolveId(handle) {
  await page.goto(`https://www.youtube.com/${encodeURI(handle)}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  return page.evaluate(() =>
    document.querySelector('meta[itemprop="identifier"], meta[itemprop="channelId"]')?.content ||
    (document.querySelector('link[rel="canonical"]')?.href.match(/channel\/(UC[\w-]+)/) || [])[1] || null);
}

for (const ch of ALL_CHANNELS) {
  if (SKIP.has(ch.channelName)) continue;
  if (only && !only.has(ch.channelName)) continue;
  const r = { channel: ch.channelName };
  try {
    await switchTo(ch.via);
    let id = ch.id && !ch.id.startsWith('UC_placeholder') ? ch.id : await resolveId(ch.handle);
    if (!id) throw new Error('brak ID kanału');
    await page.goto(`https://studio.youtube.com/channel/${id}/livestreaming/manage?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(6000);
    const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
    if (await gate.isVisible().catch(() => false)) { await gate.click(); await page.waitForTimeout(4000); }
    const row = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
    if (!await row.isVisible().catch(() => false)) throw new Error('brak zaplanowanej transmisji na liście');
    r.title = (await row.innerText().catch(() => '')).trim();
    await row.click();
    await page.waitForTimeout(9000);
    r.room = page.url();
    const body = await page.locator('body').innerText();
    const health = (body.match(/\n(Doskonały|Dobry|Dobra|Słaby|Słaba|Brak danych|Brak sygnału|Oczekiwanie)[^\n]*/) || [])[1] || '?';
    r.healthBefore = health;
    const goLive = page.locator('#go-live-button, ytcp-button:has-text("Transmituj na żywo"), button:has-text("Transmituj na żywo")').first();
    let visible = false, disabled = true;
    for (let t = 0; t < 40; t++) {
      visible = await goLive.isVisible().catch(() => false);
      disabled = visible ? await goLive.evaluate(el => el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true').catch(() => true) : true;
      if (visible && !disabled) break;
      if (/Zakończ transmisję/.test(await page.locator('body').innerText().catch(() => ''))) break;
      await page.waitForTimeout(3000);
    }
    r.goLiveVisible = visible; r.goLiveDisabled = disabled;
    if (/Zakończ transmisję/.test(body)) { r.action = 'już nadaje (Zakończ transmisję widoczne)'; }
    else if (visible && !disabled) {
      await goLive.click({ force: true });
      await page.waitForTimeout(2500);
      const confirm = page.locator('#confirm-button, ytcp-button:has-text("Rozpocznij"), button:has-text("Rozpocznij")').first();
      if (await confirm.isVisible().catch(() => false)) { await confirm.click({ force: true }); await page.waitForTimeout(2000); }
      await page.waitForTimeout(8000);
      const after = await page.locator('body').innerText();
      r.action = /Zakończ transmisję|NA ŻYWO|Na żywo/.test(after) ? 'KLIKNIĘTO -> na żywo' : 'KLIKNIĘTO -> brak potwierdzenia';
    } else {
      r.action = 'przycisk niedostępny';
    }
    await page.screenshot({ path: `${OUT}\\golive_${ch.channelName.replace(/[^\w]+/g, '_')}.png` }).catch(() => {});
  } catch (e) {
    r.error = e.message;
  }
  console.log(JSON.stringify(r));
  results.push(r);
}
await ctx.close();
fs.writeFileSync(`${OUT}\\golive_results.json`, JSON.stringify(results, null, 2), 'utf8');
console.log('DONE', results.length);
