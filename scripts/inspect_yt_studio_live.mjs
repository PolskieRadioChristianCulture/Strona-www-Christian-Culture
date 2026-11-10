import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  console.log('Launching Studio via yt_studio_session...');
  const { ctx, page } = await launchStudio({ headless: true });

  const targetChannels = [
    { name: 'Osobowość +', expectedKey: 'x5xh-8g1y-ethh-g0mz-audj' },
    { name: 'Christian Culture TV', expectedKey: 'rzeb-442c-078a-pvv1-7d9j' }
  ];

  for (const item of targetChannels) {
    console.log(`\n========================================`);
    console.log(`Opening Studio for: ${item.name}`);
    try {
      const channelId = await openChannelStudio(page, item.name, '/livestreaming/stream');
      console.log(`Successfully opened Studio for ${item.name} (${channelId})`);

      await page.waitForTimeout(5000);

      const shotPath = `C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\yt_live_${channelId.slice(0, 8)}.png`;
      await page.screenshot({ path: shotPath, fullPage: true });
      console.log(`Screenshot saved to: ${shotPath}`);

      const bodyText = await page.evaluate(() => document.body.innerText);
      const title = await page.title();
      console.log(`Title: ${title}, URL: ${page.url()}`);

      const keywords = [
        'Brak danych', 'Połącz oprogramowanie', 'Doskonałe połączenie', 'Dobre połączenie',
        'Automatyczny start', 'Włącz automatyczny start', 'Automatyczne zatrzymanie',
        'Prywatny', 'Niepubliczny', 'Publiczny', 'Rozpocznij transmisję', 'Zakończ transmisję',
        'Klucz strumienia', 'Stream key', 'NA ŻYWO', 'LIVE', 'W toku', 'Nadawanie'
      ];
      for (const kw of keywords) {
        if (bodyText.includes(kw)) {
          console.log(`  [Match] "${kw}"`);
        }
      }

      // Check toggles and buttons
      const controls = await page.evaluate(() => {
        const toggles = Array.from(document.querySelectorAll('tp-yt-paper-toggle-button, ytcp-paper-toggle-button, ytcp-toggle')).map(t => ({
          text: (t.innerText || t.getAttribute('aria-label') || '').trim(),
          checked: t.hasAttribute('checked') || t.getAttribute('aria-checked') === 'true'
        }));
        const buttons = Array.from(document.querySelectorAll('button, ytcp-button, tp-yt-paper-button')).map(b => ({
          text: (b.innerText || b.getAttribute('aria-label') || '').trim(),
          disabled: b.hasAttribute('disabled') || b.getAttribute('aria-disabled') === 'true'
        })).filter(b => b.text.length > 0 && b.text.length < 50);
        
        return { toggles, buttons };
      });

      console.log('Toggles:', JSON.stringify(controls.toggles, null, 2));
      console.log('Buttons:', JSON.stringify(controls.buttons.filter(b => /start|transmis|zakończ|edytuj|na żywo|live/i.test(b.text)), null, 2));

      // Check current stream key displayed
      const keySnippetIdx = bodyText.indexOf('Klucz strumienia');
      if (keySnippetIdx !== -1) {
        console.log(`\n--- Text around Klucz strumienia ---\n${bodyText.slice(Math.max(0, keySnippetIdx - 50), keySnippetIdx + 350)}`);
      }

    } catch (err) {
      console.error(`Failed on ${item.name}:`, err.message);
      const errShot = `C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\err_${item.name.replace(/[^a-z0-9]/gi, '_')}.png`;
      await page.screenshot({ path: errShot, fullPage: true }).catch(() => {});
      console.log(`Error screenshot saved to ${errShot}`);
    }
  }

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
