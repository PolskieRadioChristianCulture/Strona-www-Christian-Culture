#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const SESSION_PATH = path.join(__dirname, 'fb_session.json');
const IMAGE_PATH = path.join(ROOT, 'images', 'news', 'art-globalny-reset-premiera-sds.jpg');

const FB_PAGES = [
  { name: 'Radio Christian Culture', url: 'https://www.facebook.com/RadioChristianCulture', isPage: true },
  { name: 'Profil osobisty',         url: 'https://www.facebook.com/cezary.rogowski1' },
  { name: 'Christian Culture App',   url: 'https://www.facebook.com/ChristianCultureApp',   isPage: true }
];

const postText = `🔴 PREMIERA JUTRO O GODZINIE 21:00!
🔥 GLOBALNY RESET — Studio Dobrego Słowa

Gospodarz programu: Mariusz Adamczyk

Czy współczesny świat zmierza ku nieodwracalnemu przełomowi? Jakie siły kształtują globalną rzeczywistość i co na ten temat mówi Pismo Święte?

W najnowszym programie Studia Dobrego Słowa Mariusz Adamczyk podejmuje jeden z najbardziej palących tematów naszych czasów. Zobacz analizę, która zamiast taniej sensacji stawia na fakty, rzetelną wiedzę i Bożą perspektywę.

⏰ PREMIERA: Sobota, 14 listopada, godz. 21:00
👉 Link do premiery na YouTube i możliwość włączenia powiadomienia znajduje się w pierwszym komentarzu poniżej!

Ustaw powiadomienie (dzwoneczek), zasubskrybuj kanał i udostępnij to zaproszenie znajomym!

#GlobalnyReset #StudioDobregoSłowa #MariuszAdamczyk #ChristianCulture #Premiera`;

const ytUrl = 'https://youtu.be/UHAcOhDvlys';

async function main() {
  if (!fs.existsSync(SESSION_PATH)) {
    console.log('Brak fb_session.json');
    return;
  }

  let raw = fs.readFileSync(SESSION_PATH, 'utf8');
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
  const cookies = JSON.parse(raw);

  // Filter valid cookies for playwright
  const pwCookies = cookies.map(c => ({
    name: c.name,
    value: c.value,
    domain: c.domain.startsWith('.') ? c.domain : `.${c.domain}`,
    path: c.path || '/',
    httpOnly: !!c.httpOnly,
    secure: !!c.secure,
    sameSite: c.sameSite === 'no_restriction' ? 'None' : (c.sameSite === 'lax' ? 'Lax' : 'Strict')
  }));

  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  }).catch(() => chromium.launch({ headless: true, args: ['--no-sandbox'] }));

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
  });

  await context.addCookies(pwCookies);

  const page = await context.newPage();
  console.log('🌐 Sprawdzam sesję Facebooka...');
  await page.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const url = page.url();
  console.log('FB Current URL:', url);
  if (url.includes('/login') || url.includes('/checkpoint')) {
    console.warn('⚠️ Sesja FB wygasła lub wymaga ponownego logowania przez przeglądarkę.');
    await browser.close();
    return;
  }

  console.log('✅ Sesja FB aktywna! Publikuję...');
  for (const target of FB_PAGES) {
    try {
      console.log(`\n📢 Otwieram cel: ${target.name} (${target.url})`);
      await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 35000 });
      await page.waitForTimeout(4000);

      // Otwarcie okna kompozytora
      const trigger = page.locator('span, div[role="button"]').filter({ hasText: /słychać|napisz coś|utwórz post|stwórz post/i }).first();
      if (await trigger.isVisible({ timeout: 5000 }).catch(() => false)) {
        await trigger.click();
        await page.waitForTimeout(3000);

        const editor = page.locator('div[role="dialog"] div[role="textbox"]').first();
        if (await editor.isVisible({ timeout: 8000 }).catch(() => false)) {
          // Załącz grafikę
          if (fs.existsSync(IMAGE_PATH)) {
            const fileInput = page.locator('div[role="dialog"] input[type="file"]').first();
            if (await fileInput.count() > 0) {
              await fileInput.setInputFiles(IMAGE_PATH);
              await page.waitForTimeout(3000);
            }
          }

          await editor.focus();
          await page.keyboard.insertText(postText);
          await page.waitForTimeout(2000);

          // Kliknij Dalej jeśli istnieje
          const dalejBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Dalej")').first();
          if (await dalejBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await dalejBtn.click();
            await page.waitForTimeout(2000);
          }

          // Kliknij Opublikuj
          const pubBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Opublikuj")').first();
          if (await pubBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await pubBtn.click();
            await page.waitForTimeout(8000);
            console.log(`✅ Opublikowano na ${target.name}!`);
          }
        }
      }
    } catch (e) {
      console.warn(`Błąd na ${target.name}:`, e.message);
    }
  }

  await browser.close();
}

main().catch(err => console.error(err));
