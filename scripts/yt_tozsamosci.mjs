// @007 2026-11-15 — tylko odczyt: jakie tożsamości (kanały) są w przełączniku konta profilu YouTube.
import { launchStudio } from './yt_studio_session.mjs';
const { ctx, page } = await launchStudio({ headless: true });
try {
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 40000 });
  await page.waitForTimeout(1500);
  const lista = await page.$$eval('ytd-account-item-renderer', (els) => els.map((e) => e.innerText.replace(/\s+/g, ' ').trim()));
  console.log(lista.length, 'tożsamości:');
  lista.forEach((t) => console.log(' -', t.slice(0, 90)));
} finally { await ctx.close(); }
