// ============================================================================
// EkoCC / CC NEWSLETTER — Szablony Wiadomości E-mail (HTML + Plain Text, PL/EN)
// Identyfikator: CCNL-007 | Standard: ZERO COST, RODO / PKE Art. 398, RFC 8058
// ============================================================================

export const NEWSLETTER_TOPICS_V1 = [
  {
    id: 'topic_the_journal',
    slug: 'the-journal',
    namePl: 'THE JOURNAL — nowości projektu',
    nameEn: 'THE JOURNAL — project updates',
    nameDe: 'THE JOURNAL — Projektneuigkeiten',
    descriptionPl: 'Premiera książki, rozwój aplikacji i nowe materiały THE JOURNAL.',
    descriptionEn: 'Book launch, app development and new THE JOURNAL materials.',
    descriptionDe: 'Buchpremiere, App-Entwicklung und neue THE JOURNAL Materialien.',
    isActive: true,
    sortOrder: 60,
  },
  {
    id: 'topic_codzienne_rozwazania',
    slug: 'codzienne-rozwazania',
    namePl: 'Codzienne Rozważania Biblijne',
    nameEn: 'Daily Biblical Reflections',
    nameDe: 'Tägliche Biblische Andachten',
    descriptionPl: 'Codzienna poranna porcja Słowa Bożego i rozważań („Dobrze, że jesteś” / autorzy LUMINA) wysyłana o 06:00 rano na e-mail.',
    descriptionEn: 'Daily morning scripture inspiration and biblical reflections delivered to your inbox at 6:00 AM.',
    descriptionDe: 'Tägliche morgendliche biblische Impulse und geistliche Andachten um 06:00 Uhr direkt per E-Mail.',
    isActive: true,
    sortOrder: 5,
  },
  {
    id: 'topic_nowosci_ekocc',
    slug: 'nowosci-ekocc',
    namePl: 'Nowości EkoCC',
    nameEn: 'EkoCC Highlights & News',
    nameDe: 'EkoCC Neuigkeiten',
    descriptionPl: 'Najważniejsze publikacje, wydarzenia, premiery i komunikaty z całego ekosystemu Christian Culture.',
    descriptionEn: 'Top publications, events, premieres, and announcements from across the Christian Culture ecosystem.',
    descriptionDe: 'Wichtigste Veröffentlichungen, Veranstaltungen, Premieren und Mitteilungen aus dem gesamten Christian Culture Ökosystem.',
    isActive: true,
    sortOrder: 10,
  },
  {
    id: 'topic_muzyka_radio_tv',
    slug: 'muzyka-radio-tv',
    namePl: 'Muzyka, Radio i TV',
    nameEn: 'Music, Radio & TV',
    nameDe: 'Musik, Radio & TV',
    descriptionPl: 'PolskieRadio.cc, premiery muzyczne, Biblijne Uwielbienie, Gerald Welch, JJ Beauvais, audycje i Kino VOD.',
    descriptionEn: 'PolskieRadio.cc, music premieres, Biblical Worship, Gerald Welch, JJ Beauvais, broadcasts, and Cinema VOD.',
    descriptionDe: 'PolskieRadio.cc, Musikpremieren, Biblijne Uwielbienie, Gerald Welch, JJ Beauvais, Sendungen und Kino VOD.',
    isActive: true,
    sortOrder: 20,
  },
  {
    id: 'topic_biblia_akademia',
    slug: 'biblia-akademia',
    namePl: 'Biblia, Rozważania i Akademia',
    nameEn: 'Bible, Reflections & Academy',
    nameDe: 'Bibel, Andachten & Akademie',
    descriptionPl: 'MojaBiblia, Kurs Codzienny „Z Biblią za Pan Brat”, rozważania „Dobrze, że jesteś” oraz wykłady Akademii Biblijnej.',
    descriptionEn: 'MojaBiblia, Daily Bible Course, daily reflections, and Bible Academy lectures.',
    descriptionDe: 'MojaBiblia, Täglicher Bibelkurs, tägliche Andachten und Vorlesungen der Bibel-Akademie.',
    isActive: true,
    sortOrder: 30,
  },
  {
    id: 'topic_ksiazki_literatura',
    slug: 'ksiazki-literatura',
    namePl: 'Książki, Literatura i Kultura',
    nameEn: 'Books, Literature & Culture',
    nameDe: 'Bücher, Literatur & Kultur',
    descriptionPl: 'Powieść „Pardon, Czy To Miłość?”, Biblioteka CC, Your Imagination Studio (YIS), sztuka i publicystyka kulturalna.',
    descriptionEn: 'Novel "Pardon, Is This Love?", CC Library, Your Imagination Studio (YIS), art, and cultural essays.',
    descriptionDe: 'Roman „Pardon, Ist Das Liebe?“, CC-Bibliothek, Your Imagination Studio (YIS), Kunst und Kulturpublizistik.',
    isActive: true,
    sortOrder: 40,
  },
  {
    id: 'topic_rodzina_zdrowie_rozwoj',
    slug: 'rodzina-zdrowie-rozwoj',
    namePl: 'Rodzina, Zdrowie, Kuchnia i Rozwój',
    nameEn: 'Family, Health, Kitchen & Growth',
    nameDe: 'Familie, Gesundheit, Küche & Entwicklung',
    descriptionPl: 'Praktyczne artykuły o relacjach, wychowaniu, zdrowiu (ZiU), kuchni, finansach domowych i planerze HOLOS.',
    descriptionEn: 'Practical articles on relationships, parenting, health, kitchen, family finances, and HOLOS planner.',
    descriptionDe: 'Praktische Artikel über Beziehungen, Familie, Gesundheit, Küche, Finanzen und den HOLOS-Planer.',
    isActive: true,
    sortOrder: 50,
  },
];

export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function getConsentTextSnapshot(locale = 'pl', version = '2026-10-30-v1') {
  const loc = ['pl', 'en', 'de'].includes(locale) ? locale : 'pl';
  const texts = {
    pl: `[${version}] Wyrażam zgodę na otrzymywanie drogą elektroniczną na podany adres e-mail newslettera ekosystemu Christian Culture (polskieradio.cc) obejmującego wybrane przeze mnie kategorie tematyczne, zgodnie z art. 398 Prawa komunikacji elektronicznej oraz art. 6 ust. 1 lit. a RODO. Wiem, że zapis wymaga potwierdzenia linku (Double Opt-In), a zgodę mogę wycofać w każdej chwili jednym kliknięciem. Oświadczam, że mam ukończone 16 lat.`,
    en: `[${version}] I consent to receive the Christian Culture ecosystem (polskieradio.cc) newsletter by email covering my selected topic categories, in accordance with GDPR Art. 6(1)(a) and applicable electronic communications law. I understand that subscription requires confirming a link (Double Opt-In) and that I can withdraw my consent at any time with one click. I confirm that I am at least 16 years old.`,
    de: `[${version}] Ich willige ein, den Newsletter des Christian Culture Ökosystems (polskieradio.cc) per E-Mail zu den von mir gewählten Themenkategorien gemäß Art. 6 Abs. 1 lit. a DSGVO zu erhalten. Mir ist bekannt, dass die Anmeldung über einen Bestätigungslink (Double Opt-In) aktiviert wird und ich meine Einwilligung jederzeit mit einem Klick widerrufen kann. Ich bestätige, dass ich mindestens 16 Jahre alt bin.`,
  };
  return texts[loc];
}

export function formatTopicNames(topicSlugs = [], locale = 'pl') {
  const isEn = locale === 'en';
  const isDe = locale === 'de';
  const list = topicSlugs
    .map((slug) => NEWSLETTER_TOPICS_V1.find((t) => t.slug === slug || t.id === slug))
    .filter(Boolean)
    .map((t) => (isEn ? t.nameEn : isDe ? t.nameDe : t.namePl));
  if (list.length === 0) {
    return isEn ? ['EkoCC Highlights & News'] : isDe ? ['EkoCC Neuigkeiten'] : ['Nowości EkoCC'];
  }
  return list;
}

/**
 * 1. Wiadomość transakcyjna Double Opt-In (CCNL-007)
 * ŚCIŚLE TRANSAKCYJNA: Zero treści reklamowych/marketingowych przed potwierdzeniem!
 */
export function renderDoiConfirmationEmail({
  firstName = '',
  confirmUrl,
  sourcePortal = 'polskieradio.cc',
  topicSlugs = ['nowosci-ekocc'],
  locale = 'pl',
  expiresHours = 48,
}) {
  const isEn = locale === 'en';
  const safeName = escapeHtml(firstName || (isEn ? 'Reader' : 'Czytelniku'));
  const safeConfirmUrl = escapeHtml(confirmUrl);
  const safePortal = escapeHtml(sourcePortal);
  const topics = formatTopicNames(topicSlugs, locale);
  const topicsHtml = topics.map((t) => `<li style="margin:4px 0;">${escapeHtml(t)}</li>`).join('');
  const topicsText = topics.map((t) => `- ${t}`).join('\n');

  const subject = isEn
    ? 'Confirm your EkoCC Newsletter subscription (Action required)'
    : 'Potwierdź zapis na Newsletter EkoCC (Wymagane potwierdzenie)';

  const preheader = isEn
    ? `Click the button inside to confirm your subscription initiated on ${sourcePortal}.`
    : `Kliknij przycisk w wiadomości, aby aktywować subskrypcję zainicjowaną na ${sourcePortal}.`;

  const html = `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'pl'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#07090F;color:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#07090F;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#0F1420;border:1px solid rgba(196,163,90,0.35);border-radius:18px;padding:32px 24px;">
          <tr>
            <td>
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#C4A35A;font-weight:700;">
                Christian Culture • EkoCC
              </p>
              <h1 style="margin:0 0 16px;font-size:22px;line-height:1.35;color:#FFFFFF;">
                ${isEn ? 'Confirm your email address' : 'Potwierdź swój adres e-mail'}
              </h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#E2E8F0;">
                ${
                  isEn
                    ? `Hello ${safeName}, we received a request on <strong>${safePortal}</strong> to subscribe this email address to the Christian Culture (EkoCC) newsletter.`
                    : `Witaj ${safeName}, otrzymaliśmy zgłoszenie z portalu <strong>${safePortal}</strong> o chęci zapisu tego adresu e-mail na Newsletter Ekosystemu Christian Culture (EkoCC).`
                }
              </p>
              <p style="margin:0 0 8px;font-size:14px;color:#CBD5E1;font-weight:600;">
                ${isEn ? 'Selected topic categories:' : 'Wybrane kategorie tematyczne:'}
              </p>
              <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;line-height:1.6;color:#F8FAFC;">
                ${topicsHtml}
              </ul>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                <tr>
                  <td align="center" style="border-radius:12px;background-color:#FF7A00;">
                    <a href="${safeConfirmUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:12px;background-color:#FF7A00;min-height:44px;line-height:16px;">
                      ${isEn ? 'Confirm subscription' : 'Potwierdzam zapis na Newsletter'}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:#94A3B8;">
                ${
                  isEn
                    ? `This confirmation link is valid for <strong>${expiresHours} hours</strong> and works once.`
                    : `Ten link potwierdzający jest ważny przez <strong>${expiresHours} godzin</strong> i jest jednorazowy.`
                }
              </p>
              <p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#94A3B8;word-break:break-all;">
                ${isEn ? 'Direct link:' : 'Link bezpośredni:'} <a href="${safeConfirmUrl}" style="color:#C4A35A;">${safeConfirmUrl}</a>
              </p>
              <hr style="border:none;border-top:1px solid rgba(196,163,90,0.2);margin:20px 0;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#64748B;">
                ${
                  isEn
                    ? 'If you did not request this subscription, simply ignore this transactional message — your email address will not be activated and will be automatically removed.'
                    : 'Jeżeli to nie Ty wypełniłeś(-aś) formularz zapisu, zignoruj tę wiadomość transakcyjną — Twój adres nie zostanie aktywowany i zostanie automatycznie usunięty.'
                }
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = isEn
    ? `Christian Culture • EkoCC\n\nConfirm your email address\n\nHello ${firstName || 'Reader'},\nWe received a request on ${sourcePortal} to subscribe this email address to the Christian Culture (EkoCC) newsletter.\n\nSelected topic categories:\n${topicsText}\n\nTo activate your subscription, open the confirmation link below (valid for ${expiresHours} hours):\n${confirmUrl}\n\nIf you did not request this subscription, ignore this message — no further emails will be sent.`
    : `Christian Culture • EkoCC\n\nPotwierdź swój adres e-mail\n\nWitaj ${firstName || 'Czytelniku'},\nOtrzymaliśmy zgłoszenie z portalu ${sourcePortal} o chęci zapisu tego adresu e-mail na Newsletter Ekosystemu Christian Culture (EkoCC).\n\nWybrane kategorie tematyczne:\n${topicsText}\n\nAby aktywować subskrypcję, otwórz poniższy link potwierdzający (ważny przez ${expiresHours} godzin):\n${confirmUrl}\n\nJeżeli to nie Ty wypełniłeś(-aś) formularz zapisu, zignoruj tę wiadomość — nie wyślemy kolejnych wiadomości.`;

  return { subject, preheader, html, text };
}

/**
 * 2. Wiadomość powitalna po potwierdzeniu Double Opt-In (CCNL-007)
 */
export function renderWelcomeEmail({
  firstName = '',
  topicSlugs = ['nowosci-ekocc'],
  manageUrl,
  unsubscribeUrl,
  unsubscribeApiUrl,
  sourcePortal = 'polskieradio.cc',
  locale = 'pl',
}) {
  const isEn = locale === 'en';
  const safeName = escapeHtml(firstName || (isEn ? 'Friend' : 'Przyjacielu'));
  const safeManageUrl = escapeHtml(manageUrl);
  const safeUnsubUrl = escapeHtml(unsubscribeUrl);
  const safePortal = escapeHtml(sourcePortal);
  const topics = formatTopicNames(topicSlugs, locale);
  const topicsHtml = topics.map((t) => `<li style="margin:4px 0;">${escapeHtml(t)}</li>`).join('');
  const topicsText = topics.map((t) => `- ${t}`).join('\n');

  const subject = isEn
    ? 'Welcome to the EkoCC Newsletter — Subscription Confirmed'
    : 'Witamy w Newsletterze EkoCC — Subskrypcja potwierdzona';

  const preheader = isEn
    ? 'Your subscription is active. Manage your topics or unsubscribe anytime.'
    : 'Twoja subskrypcja jest aktywna. Sprawdź wybrane kategorie i ustawienia.';

  const headers = {
    'List-Unsubscribe': `<${unsubscribeApiUrl || unsubscribeUrl}>, <mailto:radiochristianculture@gmail.com?subject=unsubscribe>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };

  const html = `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'pl'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#07090F;color:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#07090F;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#0F1420;border:1px solid rgba(196,163,90,0.35);border-radius:18px;padding:32px 24px;">
          <tr>
            <td>
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#C4A35A;font-weight:700;">
                Christian Culture • EkoCC Newsletter
              </p>
              <h1 style="margin:0 0 16px;font-size:22px;line-height:1.35;color:#FFFFFF;">
                ${isEn ? `Thank you, ${safeName}! We are in touch.` : `Dziękujemy, ${safeName}! Jesteśmy w kontakcie.`}
              </h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#E2E8F0;">
                ${
                  isEn
                    ? 'Your email address has been verified via Double Opt-In. We will send you curated updates only for your chosen categories:'
                    : 'Twój adres e-mail został pomyślnie zweryfikowany (Double Opt-In). Będziemy przesyłać Ci wartościowe zestawienia wyłącznie z wybranych przez Ciebie kategorii:'
                }
              </p>
              <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;line-height:1.6;color:#F8FAFC;">
                ${topicsHtml}
              </ul>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                <tr>
                  <td align="center" style="border-radius:12px;background-color:#FF7A00;">
                    <a href="${safeManageUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:12px;background-color:#FF7A00;">
                      ${isEn ? 'Manage your preferences' : 'Zarządzaj swoimi kategoriami'}
                    </a>
                  </td>
                </tr>
              </table>
              <hr style="border:none;border-top:1px solid rgba(196,163,90,0.2);margin:20px 0;">
              <p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:#94A3B8;">
                ${
                  isEn
                    ? `You received this email because you confirmed your subscription on <strong>${safePortal}</strong> (Christian Culture • polskieradio.cc, contact: radiochristianculture@gmail.com).`
                    : `Otrzymujesz tę wiadomość, ponieważ potwierdziłeś(-aś) zapis na Newsletter EkoCC na portalu <strong>${safePortal}</strong> (Administrator: Christian Culture • polskieradio.cc, kontakt: radiochristianculture@gmail.com).`
                }
              </p>
              <p style="margin:0;font-size:12px;line-height:1.6;color:#94A3B8;">
                <a href="${safeManageUrl}" style="color:#C4A35A;">${isEn ? 'Change categories' : 'Zmień kategorie'}</a>
                &nbsp;•&nbsp;
                <a href="${safeUnsubUrl}" style="color:#F87171;">${isEn ? 'Unsubscribe with 1 click' : 'Wypisz się 1 kliknięciem'}</a>
                &nbsp;•&nbsp;
                <a href="https://polskieradio.cc/privacy#newsletter" style="color:#94A3B8;">${isEn ? 'Privacy Policy' : 'Polityka Prywatności'}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = isEn
    ? `Christian Culture • EkoCC Newsletter\n\nThank you, ${firstName || 'Friend'}! Your subscription is active.\n\nSelected categories:\n${topicsText}\n\nManage preferences: ${manageUrl}\nUnsubscribe with 1 click: ${unsubscribeUrl}\n\nSender: Christian Culture (https://polskieradio.cc, radiochristianculture@gmail.com). You received this message because you confirmed your subscription on ${sourcePortal}.`
    : `Christian Culture • EkoCC Newsletter\n\nDziękujemy, ${firstName || 'Przyjacielu'}! Twoja subskrypcja jest aktywna.\n\nWybrane kategorie:\n${topicsText}\n\nZarządzaj preferencjami: ${manageUrl}\nWypisz się 1 kliknięciem: ${unsubscribeUrl}\n\nNadawca: Christian Culture (https://polskieradio.cc, radiochristianculture@gmail.com). Otrzymujesz tę wiadomość, ponieważ potwierdziłeś(-aś) zapis na portalu ${sourcePortal}.`;

  return { subject, preheader, html, text, headers };
}

/**
 * 3. Wiadomość z linkiem do zarządzania subskrypcją
 */
export function renderManageLinkEmail({
  manageUrl,
  unsubscribeUrl,
  locale = 'pl',
  expiresMinutes = 30,
}) {
  const isEn = locale === 'en';
  const safeManageUrl = escapeHtml(manageUrl);
  const safeUnsubUrl = escapeHtml(unsubscribeUrl);

  const subject = isEn
    ? 'Manage your EkoCC Newsletter preferences'
    : 'Link do zarządzania Twoją subskrypcją Newslettera EkoCC';

  const html = `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'pl'}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:24px;background-color:#07090F;color:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#0F1420;border:1px solid rgba(196,163,90,0.35);border-radius:16px;padding:28px;">
    <h1 style="margin:0 0 12px;font-size:20px;color:#FFFFFF;">${escapeHtml(subject)}</h1>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#E2E8F0;">
      ${
        isEn
          ? `Use the button below to update your topic categories or language (valid for ${expiresMinutes} minutes):`
          : `Kliknij poniższy przycisk, aby zmienić wybrane kategorie tematyczne lub język subskrypcji (link ważny przez ${expiresMinutes} minut):`
      }
    </p>
    <p style="margin:0 0 20px;">
      <a href="${safeManageUrl}" style="display:inline-block;padding:12px 24px;background:#FF7A00;color:#FFFFFF;font-weight:700;text-decoration:none;border-radius:10px;">
        ${isEn ? 'Open Preference Center' : 'Otwórz Ustawienia Subskrypcji'}
      </a>
    </p>
    <p style="margin:0;font-size:12px;color:#94A3B8;">
      <a href="${safeUnsubUrl}" style="color:#F87171;">${isEn ? 'Unsubscribe immediately' : 'Wypisz się natychmiast'}</a>
    </p>
  </div>
</body>
</html>`;

  const text = isEn
    ? `${subject}\n\nOpen Preference Center (valid for ${expiresMinutes} minutes): ${manageUrl}\nUnsubscribe: ${unsubscribeUrl}`
    : `${subject}\n\nOtwórz ustawienia subskrypcji (link ważny przez ${expiresMinutes} minut): ${manageUrl}\nWypisz się: ${unsubscribeUrl}`;

  return { subject, html, text };
}

/**
 * 4. Szablon Kampanii Okresowej Newslettera EkoCC (z obowiązkową stopką prawną i nagłówkami RFC 8058)
 */
export function renderCampaignEmail({
  subject,
  preheader = '',
  htmlContent,
  textContent,
  manageUrl,
  unsubscribeUrl,
  unsubscribeApiUrl,
  sourcePortal = 'polskieradio.cc',
  locale = 'pl',
}) {
  const isEn = locale === 'en';
  const safeSubject = escapeHtml(subject);
  const safePreheader = escapeHtml(preheader);
  const safeManageUrl = escapeHtml(manageUrl);
  const safeUnsubUrl = escapeHtml(unsubscribeUrl);
  const safePortal = escapeHtml(sourcePortal);

  const headers = {
    'List-Unsubscribe': `<${unsubscribeApiUrl || unsubscribeUrl}>, <mailto:radiochristianculture@gmail.com?subject=unsubscribe>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };

  const html = `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'pl'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeSubject}</title>
</head>
<body style="margin:0;padding:0;background-color:#07090F;color:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${safePreheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#07090F;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#0F1420;border:1px solid rgba(196,163,90,0.35);border-radius:18px;padding:32px 24px;">
          <tr>
            <td>
              <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#C4A35A;font-weight:700;">
                Christian Culture • EkoCC Newsletter
              </p>
              <div style="font-size:15px;line-height:1.7;color:#E2E8F0;">
                ${htmlContent}
              </div>
              <hr style="border:none;border-top:1px solid rgba(196,163,90,0.22);margin:28px 0 18px;">
              <p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:#94A3B8;">
                ${
                  isEn
                    ? `Sender: <strong>Christian Culture / PolskieRadio.cc</strong> (contact: radiochristianculture@gmail.com). You are receiving this newsletter because you confirmed your voluntary subscription on <strong>${safePortal}</strong>.`
                    : `Nadawca: <strong>Christian Culture / PolskieRadio.cc</strong> (kontakt: radiochristianculture@gmail.com). Otrzymujesz ten newsletter, ponieważ potwierdziłeś(-aś) dobrowolny zapis (Double Opt-In) na portalu <strong>${safePortal}</strong>.`
                }
              </p>
              <p style="margin:0;font-size:12px;line-height:1.6;color:#94A3B8;">
                <a href="${safeManageUrl}" style="color:#C4A35A;font-weight:600;">${isEn ? 'Manage preferences & categories' : 'Zarządzaj preferencjami i kategoriami'}</a>
                &nbsp;•&nbsp;
                <a href="${safeUnsubUrl}" style="color:#F87171;font-weight:600;">${isEn ? 'Unsubscribe (1-Click)' : 'Wypisz się (1 kliknięciem)'}</a>
                &nbsp;•&nbsp;
                <a href="https://polskieradio.cc/privacy#newsletter" style="color:#94A3B8;">${isEn ? 'Privacy Policy' : 'Polityka Prywatności'}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `${textContent}\n\n---\n${
    isEn
      ? `Sender: Christian Culture / PolskieRadio.cc (radiochristianculture@gmail.com)\nYou received this email because you confirmed your subscription on ${sourcePortal}.\nManage preferences: ${manageUrl}\nUnsubscribe with 1 click: ${unsubscribeUrl}`
      : `Nadawca: Christian Culture / PolskieRadio.cc (radiochristianculture@gmail.com)\nOtrzymujesz tę wiadomość, ponieważ potwierdziłeś(-aś) zapis na portalu ${sourcePortal}.\nZarządzaj preferencjami: ${manageUrl}\nWypisz się 1 kliknięciem: ${unsubscribeUrl}`
  }`;

  return { subject, preheader, html, text, headers };
}
