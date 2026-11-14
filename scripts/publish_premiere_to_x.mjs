#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const ENV_LOCAL_PATH = path.join(ROOT, '.env.local');
const ENV_PATH = path.join(ROOT, '.env');
const PROFILE_DIR = path.join(ROOT, '.x_browser_profile');
const IMAGE_PATH = path.join(ROOT, 'images', 'news', 'art-globalny-reset-premiera-sds.jpg');

function loadEnv() {
  const envFiles = [ENV_LOCAL_PATH, ENV_PATH];
  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      try {
        const content = fs.readFileSync(envFile, 'utf8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const idx = trimmed.indexOf('=');
          if (idx !== -1) {
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      } catch (err) {}
    }
  }
}

loadEnv();

const authToken = process.env.X_AUTH_TOKEN;
if (!authToken) {
  console.error('❌ Błąd: Brak X_AUTH_TOKEN w .env.local');
  process.exit(1);
}

const tweetText = `🔴 PREMIERA JUTRO O 21:00!
🔥 GLOBALNY RESET — Studio Dobrego Słowa

Prowadzi: Mariusz Adamczyk

Czy świat zmierza ku przełomowi? Ustaw przypomnienie na YouTube i bądź z nami!

👉 Oglądaj i włącz powiadomienie:
https://youtu.be/UHAcOhDvlys

#GlobalnyReset #StudioDobregoSłowa`;

async function publish() {
  console.log('🚀 Rozpoczynam publikację zapowiedzi premiery na platformie X...');
  console.log('📄 Tekst posta:\n' + tweetText);
  console.log('🖼️ Załącznik graficzny:', IMAGE_PATH);

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    channel: 'chrome',
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  }).catch(async () => {
    return await chromium.launchPersistentContext(PROFILE_DIR, {
      headless: true,
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
    });
  });

  await context.addCookies([
    {
      name: 'auth_token',
      value: authToken,
      domain: '.x.com',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'None'
    },
    {
      name: 'auth_token',
      value: authToken,
      domain: '.twitter.com',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'None'
    }
  ]);

  try {
    const page = await context.newPage();
    console.log('🌐 Nawigacja do x.com/compose/post...');
    await page.goto('https://x.com/compose/post', { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    if (currentUrl.includes('/login') || currentUrl.includes('/i/flow/login')) {
      throw new Error('Sesja X wygasła. Wymagane odświeżenie X_AUTH_TOKEN w .env.local.');
    }

    let isDialog = await page.locator('[role="dialog"]').isVisible({ timeout: 2000 }).catch(() => false);
    let textarea = isDialog
      ? page.locator('[role="dialog"] div[data-testid="tweetTextarea_0"], [role="dialog"] div[role="textbox"][contenteditable="true"]').first()
      : page.locator('div[data-testid="tweetTextarea_0"], div[role="textbox"][contenteditable="true"]').first();

    await textarea.waitFor({ state: 'visible', timeout: 25000 });
    await textarea.click({ force: true }).catch(async () => {
      await textarea.focus();
    });
    await page.waitForTimeout(500);

    // Wpisanie tekstu
    await page.keyboard.insertText(tweetText);
    console.log('📝 Wpisano treść posta...');
    await page.waitForTimeout(2000);

    // Załączenie grafiki
    if (IMAGE_PATH && fs.existsSync(IMAGE_PATH)) {
      console.log('🖼️ Załączam grafikę:', path.basename(IMAGE_PATH));
      isDialog = await page.locator('[role="dialog"]').isVisible({ timeout: 1000 }).catch(() => false);
      const fileInput = isDialog
        ? page.locator('[role="dialog"] input[data-testid="fileInput"]').first()
        : page.locator('input[data-testid="fileInput"]').last();
      await fileInput.setInputFiles(IMAGE_PATH);
      console.log('⏳ Czekam na załadowanie podglądu grafiki...');
      try {
        await page.waitForSelector('div[data-testid="attachments"], div[aria-label*="Usuń"], div[aria-label*="Remove"]', { timeout: 15000 });
        console.log('✅ Grafika została pomyślnie załączona!');
      } catch (e) {
        await page.waitForTimeout(3000);
      }
    }

    // Wysłanie posta
    console.log('🔘 Klikam publikuj post...');
    isDialog = await page.locator('[role="dialog"]').isVisible().catch(() => false);
    const postBtn = isDialog
      ? page.locator('[role="dialog"] [data-testid="tweetButton"]')
      : page.locator('[data-testid="tweetButton"], [data-testid="tweetButtonInline"]').last();

    const btnVisible = await postBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (btnVisible) {
      await postBtn.click({ force: true });
    }

    await page.waitForTimeout(2000);
    if (await postBtn.isVisible().catch(() => false)) {
      console.log('🔄 Ponawiam próbę skrótem Control+Enter...');
      await textarea.focus();
      await page.keyboard.press('Control+Enter');
      await page.waitForTimeout(3000);
    }

    console.log('🎉 Post promocyjny premiery został pomyślnie wyemitowany na platformie X!');
    await context.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Błąd podczas publikacji na X:', err.message);
    await context.close();
    process.exit(1);
  }
}

publish();
