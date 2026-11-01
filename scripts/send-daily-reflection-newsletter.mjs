/**
 * ============================================================================
 * EkoCC / CC NEWSLETTER — Automatyczna Wysyłka Codziennych Rozważań
 * Kategoria: codzienne-rozwazania | Harmonogram: 06:00 rano (Europe/Warsaw)
 * Standard: ZERO COST, RFC 8058, RODO/PKE Art. 398, UBG
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getNewsletterService, generateId } from '../services/cc-newsletter/newsletter-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

export async function prepareDailyReflectionContent({ title, verse, verseRef, text, dateStr } = {}) {
  const now = dateStr ? new Date(dateStr) : new Date();
  const dateFormatted = now.toLocaleDateString('pl-PL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let displayTitle = title;
  let displayVerse = verse;
  let displayVerseRef = verseRef;
  let displayText = text;

  if (!displayTitle || !displayText) {
    try {
      const todayIso = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Warsaw",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).format(now);
      const bazaPath = path.resolve(ROOT, 'rozwazania_baza.json');
      if (fs.existsSync(bazaPath)) {
        const list = JSON.parse(fs.readFileSync(bazaPath, 'utf8'));
        const found = list.find(x => x.date === todayIso) || list[0];
        if (found) {
          if (!displayTitle) displayTitle = found.title;
          if (!displayText) displayText = found.contentWeb || found.fullText;
          if (!displayVerse && found.contentWeb) {
            const vMatch = found.contentWeb.match(/Jezus mówi dziś do Ciebie:\s*([^\n]+)/i);
            if (vMatch) {
              displayVerse = vMatch[1].trim();
              displayVerseRef = '— UBG';
            }
          }
        }
      }
    } catch (_) {}
  }

  if (!displayTitle) displayTitle = `Słowo na Dziś • ${dateFormatted}`;
  if (!displayVerse) displayVerse = '„Pan jest moją siłą i moją tarczą, w nim zaufało moje serce i otrzymałem pomoc.”';
  if (!displayVerseRef) displayVerseRef = '— Psalm 28, 7 (UBG)';
  if (!displayText) displayText = 'Niech Boży pokój i łaska towarzyszą Ci przez cały dzisiejszy dzień. Rozpoczynaj każdy poranek w obecności Tego, który jest źródłem życia i wszelkiego dobra.';

  const htmlBody = `
    <div style="margin-bottom: 24px;">
      <span style="display:inline-block; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #C4A35A; background: rgba(196,163,90,0.12); border: 1px solid rgba(196,163,90,0.3); padding: 4px 10px; border-radius: 12px; margin-bottom: 12px;">
        Codzienne Rozważanie Biblijne • ${dateFormatted}
      </span>
      <h1 style="font-size: 22px; line-height: 1.35; color: #FFFFFF; margin: 0 0 16px 0; font-family: Georgia, serif;">
        ${displayTitle}
      </h1>
      
      <!-- Werset Dnia w złotej ramce -->
      <blockquote style="margin: 0 0 20px 0; padding: 16px 18px; border-left: 4px solid #C4A35A; background: rgba(255,255,255,0.03); border-radius: 0 12px 12px 0;">
        <p style="font-size: 16px; line-height: 1.6; color: #F1F5F9; font-style: italic; margin: 0 0 8px 0;">
          ${displayVerse}
        </p>
        <cite style="display:block; font-size: 13px; font-weight: 700; color: #C4A35A; font-style: normal; text-align: right;">
          ${displayVerseRef}
        </cite>
      </blockquote>

      <div style="font-size: 15px; line-height: 1.75; color: #CBD5E1; white-space: pre-line;">
        ${displayText}
      </div>

      <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.08); display:flex; gap:12px; flex-wrap:wrap;">
        <a href="https://polskieradio.cc/lumina-tablica.html" style="display:inline-block; background: #FF7A00; color: #FFFFFF; font-weight: 800; font-size: 13px; text-decoration: none; padding: 10px 20px; border-radius: 20px;">
          Skomentuj na Tablicy LUMINA →
        </a>
        <a href="https://polskieradio.cc/player" style="display:inline-block; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: #F8FAFC; font-weight: 700; font-size: 13px; text-decoration: none; padding: 10px 18px; border-radius: 20px;">
          Słuchaj Radia na Żywo
        </a>
      </div>
    </div>
  `;

  const textBody = `CHRISTIAN CULTURE • EKOCC NEWSLETTER
CODZIENNE ROZWAŻANIA BIBLIJNE — ${dateFormatted}
==================================================

${displayTitle}

Werset dnia:
${displayVerse}
${displayVerseRef}

--------------------------------------------------
${displayText}
--------------------------------------------------

Skomentuj na Tablicy Społeczności LUMINA:
https://polskieradio.cc/lumina-tablica.html

Słuchaj Radia Christian Culture:
https://polskieradio.cc/player
`;

  return {
    subject: `☀️ Słowo na Dziś: ${displayTitle}`,
    preheader: `${displayVerse.slice(0, 80)}...`,
    htmlBody,
    textBody,
  };
}

export async function runDailyReflectionNewsletter(options = {}) {
  const isDryRun = options.dryRun || process.argv.includes('--dry-run');
  const isDelivery = (!isDryRun && (process.env.NEWSLETTER_DELIVERY_ENABLED === 'true' || process.env.CC_ENABLE_NEWSLETTER_DELIVERY === 'true' || process.env.ENABLE_DELIVERY === 'true')) ? 'true' : 'false';
  const service = options.service || getNewsletterService({
    NEWSLETTER_ADMIN_SECRET: process.env.NEWSLETTER_ADMIN_SECRET || 'local-dev-secret',
    NEWSLETTER_DELIVERY_ENABLED: isDelivery,
    CC_ENABLE_NEWSLETTER_DELIVERY: isDelivery,
  });

  await service.repo.ensureInitialized();

  const content = await prepareDailyReflectionContent(options);

  console.log(`[Daily Reflection Newsletter] Przygotowano treść: "${content.subject}"`);
  console.log(`[Daily Reflection Newsletter] Kategoria: codzienne-rozwazania`);
  console.log(`[Daily Reflection Newsletter] Tryb: ${isDryRun ? 'DRY-RUN (symulacja / inspekcja)' : 'PRODUKCJA (wysyłka na żywo)'}`);

  // Utwórz kampanię w kategorii codzienne-rozwazania
  const campaign = await service.repo.saveCampaign({
    id: generateId('cmp_ref'),
    subject_pl: content.subject,
    preheader_pl: content.preheader,
    html_body: content.htmlBody,
    text_body: content.textBody,
    topics: ['codzienne-rozwazania'],
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'automation_daily_reflection',
  });

  console.log(`[Daily Reflection Newsletter] Utworzono kampanię ID: ${campaign.id}`);

  // Wyślij kampanię do subskrybentów kategorii codzienne-rozwazania
  const sendResult = await service.sendCampaign(campaign.id, {
    requestUrl: 'https://polskieradio.cc/newsletter',
  });

  console.log(`[Daily Reflection Newsletter] Wynik wysyłki:`, JSON.stringify(sendResult, null, 2));
  return {
    campaign,
    sendResult,
  };
}

// Uruchomienie z CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runDailyReflectionNewsletter()
    .then((res) => {
      console.log('✅ Zakończono proces wysyłki codziennego rozważania newslettera.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Błąd wysyłki:', err);
      process.exit(1);
    });
}
