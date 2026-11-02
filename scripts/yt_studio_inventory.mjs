// Spis filmów w YouTube Studio na kanałach Biblia Audio (TYLKO ODCZYT) — @007, 02.11.2026.
// Użycie: node scripts/yt_studio_inventory.mjs [wynik.json] [nazwa kanału]
import fs from 'node:fs';
import path from 'node:path';
import { launchStudio, openChannelStudio, CHANNELS } from './yt_studio_session.mjs';

export async function readContentList(page) {
  await page.locator('ytcp-video-row').first().waitFor({ timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const videos = [];
  for (let p = 0; p < 20; p++) {
    const rows = await page.$$eval('ytcp-video-row', els => els.map(r => {
      const href = r.querySelector('a[href*="/video/"]')?.getAttribute('href') || '';
      const thumb = r.querySelector('img[src*="/vi/"]')?.getAttribute('src') || '';
      const cell = sel => (r.querySelector(sel)?.innerText || '').replace(/\s+/g, ' ').trim();
      return {
        title: (r.querySelector('#video-title')?.innerText || '').trim(),
        id: (href.match(/video\/([\w-]{11})/) || thumb.match(/\/vi\/([\w-]{11})\//) || r.outerHTML.match(/vi\/([\w-]{11})\//) || [])[1] || null,
        visibility: cell('.tablecell-visibility'),
        restrictions: cell('.tablecell-restrictions'),
        date: cell('.tablecell-date'),
        monetization: cell('.tablecell-monetization'),
        draft: /edytuj wersję roboczą|edit draft/i.test(r.innerText),
        rowText: r.innerText.replace(/\s+/g, ' ').trim().slice(0, 600)
      };
    }));
    videos.push(...rows);
    const next = page.locator('#navigate-after').first();
    if (!(await next.isVisible().catch(() => false)) || (await next.getAttribute('aria-disabled')) === 'true') break;
    await next.click(); await page.waitForTimeout(3000);
  }
  return videos;
}

export async function inventory(names = Object.keys(CHANNELS)) {
  const { ctx, page } = await launchStudio();
  const result = [];
  try {
    for (const name of names) {
      try {
        const id = await openChannelStudio(page, name, '/videos/upload');
        const videos = (await readContentList(page)).map(v => ({ ...v, tab: 'videos' }));
        await page.goto(`https://studio.youtube.com/channel/${id}/videos/short?approve_browser_access=true`, { waitUntil: 'domcontentloaded', timeout: 45000 });
        videos.push(...(await readContentList(page)).map(v => ({ ...v, tab: 'shorts' })));
        result.push({ channel: name, channelId: id, count: videos.length, videos });
        console.log(`${name} (${id}): ${videos.length} filmów, wersje robocze: ${videos.filter(v => v.draft).length}`);
      } catch (e) {
        result.push({ channel: name, error: e.message });
        console.log(`${name}: BŁĄD ${e.message}`);
      }
    }
  } finally { await ctx.close(); }
  return result;
}

if (process.argv[1] && path.basename(process.argv[1]) === 'yt_studio_inventory.mjs') {
  const out = process.argv[2] || 'yt_studio_inventory.json';
  const res = await inventory(process.argv[3] ? [process.argv[3]] : undefined);
  fs.writeFileSync(out, JSON.stringify(res, null, 2), 'utf8');
  console.log(`Zapisano: ${out}`);
}
