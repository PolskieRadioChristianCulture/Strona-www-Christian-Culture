import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

const CHANNELS = [
  { name: 'Polskie Radio CHRISTIAN CULTURE', id: 'tPipeO1iMD0' },
  { name: 'Christian Culture TV', id: 'OGmZpYMGve4' },
  { name: 'CC Women', id: 'yWyj0Iz1HeA' }
];

async function activateOne(page, ch) {
  console.log(`\n>>> Rozpoczynam aktywację dla: ${ch.name} (${ch.id}) <<<`);
  await openChannelStudio(page, ch.name, '/livestreaming/manage');
  await page.waitForTimeout(3000);
  await page.goto(`https://studio.youtube.com/video/${ch.id}/livestreaming`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  // If "Klucz: Wybierz klucz" is showing, pick Default stream key
  const trigger = page.locator('ytls-ingestion-dropdown-trigger-renderer, [id="prefix"]:has-text("Klucz:")').first();
  const triggerText = await trigger.innerText().catch(() => '');
  console.log(`Trigger text: "${triggerText}"`);

  if (triggerText.includes('Wybierz klucz') || triggerText.includes('Wybierz')) {
    console.log('Klikam trigger wyboru klucza...');
    await trigger.click();
    await page.waitForTimeout(2000);
    const defaultOption = page.locator('tp-yt-paper-item').filter({ hasText: /^Default stream key/i }).first();
    if (await defaultOption.isVisible().catch(() => false)) {
      await defaultOption.click();
      console.log('Wybrano Default stream key!');
      await page.waitForTimeout(4000);
    }
  }

  // Check if "Transmituj na żywo" button is enabled
  const btn = page.locator('button, ytcp-button').filter({ hasText: /^Transmituj na żywo$/ }).first();
  console.log('Go Live visible:', await btn.isVisible().catch(() => false));
  console.log('Go Live enabled:', await btn.isEnabled().catch(() => false));

  if (await btn.isEnabled().catch(() => false)) {
    await btn.click({ force: true });
    console.log(`Kliknięto 'Transmituj na żywo' dla ${ch.name}!`);
    await page.waitForTimeout(3000);

    // If confirmation modal appears, click it
    const modalConfirm = page.locator('ytcp-dialog button, ytcp-confirmation-dialog button').filter({ hasText: /Transmituj na żywo|Rozpocznij/ }).first();
    if (await modalConfirm.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Zatwierdzam modal...');
      await modalConfirm.click();
      await page.waitForTimeout(3000);
    }
  } else {
    // Check if already broadcasting
    const endBtn = page.locator('button, ytcp-button').filter({ hasText: /Zakończ transmisję/ }).first();
    if (await endBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log(`Kanał ${ch.name} JUŻ NADAJE na żywo!`);
    }
  }
}

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    for (const ch of CHANNELS) {
      try {
        await activateOne(page, ch);
      } catch (err) {
        console.error(`Błąd w kanale ${ch.name}:`, err.message);
      }
    }
  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
