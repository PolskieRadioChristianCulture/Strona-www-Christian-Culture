const SUPERNATURAL_IMPERSONATION_PATTERNS = [
  /jezus\s+(?:właśnie|przed\s+chwilą|osobiście|teraz)\s+(?:wysłał|napisał|mówi\s+do\s+ciebie\s+na\s+żywo)/i,
  /bezpośrednie\s+nowe\s+objawienie/i,
  /piszę\s+do\s+ciebie\s+osobiście\s+jako\s+jezus/i,
  /rozmawiaj\s+z\s+jezusem\s+na\s+czacie/i,
  /oficjalne\s+prywatne\s+konto\s+jezusa/i,
];

const PROSPERITY_OR_GUILT_PATTERNS = [
  /uzdrowieni[ea].*w\s+zamian\s+za\s+(?:klik|komentarz|udostępn|wpłat)/i,
  /(?:pieniądz|bogactw|sukces\s+finansowy).*w\s+zamian\s+za/i,
  /jeśli\s+nie\s+(?:klikniesz|napiszesz\s+amen|udostępnisz)/i,
  /(?:wstydź\s+się|zgrzeszysz\s+jeśli\s+pominiesz)/i,
  /bóg\s+gwarantuje\s+ci\s+(?:pieniądze|bogactwo|natychmiastowe\s+rozwiązanie)/i,
];

const NON_BIBLICAL_TRADITION_PATTERNS = [
  /\b(?:czyściec|czyśćc|kult\s+relikwii|modlitw[ay]\s+za\s+zmarłych|niepokalane\s+poczęcie|wstawiennictwo\s+świętych)\b/i,
];

const INTERNAL_JARGON_PATTERNS = [
  /\bmission\s+control\b/i,
  /\bopenbot\b/i,
  /\bcron\b/i,
  /\bllm\b/i,
  /\bskrypt(?:em|u|y)?\b/i,
];

export function validateComposedPublication({ composed, verse, config }) {
  const checks = [];
  const text = String(composed?.bodyText || '');
  const sections = composed?.sections || {};
  const mainUrl = config?.profile?.mainUrl || 'https://polskieradio.cc/werset-dnia';
  const publisher = config?.profile?.publisher || 'Christian Culture';

  // 1. Zweryfikowane źródło i licencja UBG
  checks.push({
    id: 'source_verified',
    label: 'Autorytatywne źródło Werset Dnia i licencja UBG',
    passed: Boolean(
      verse?.canonicalVerified === true &&
      String(verse?.translation || '').includes('UBG') &&
      String(verse?.license || '').includes('CC BY-ND 4.0')
    ),
    detail: `${verse?.translation || 'brak'} | ${verse?.license || 'brak'}`,
  });

  // 2. Dosłowne brzmienie cytatu biblijnego bez parafrazowania jako cytat
  checks.push({
    id: 'verbatim_quote_preserved',
    label: 'Dosłowny cytat biblijny zachowany w 100%',
    passed: Boolean(verse?.text && text.includes(`„${verse.text}”`) && text.includes(verse.referencePl)),
    detail: verse?.referencePl || 'brak odnośnika',
  });

  // 3. Obecność wszystkich 5 wymaganych elementów publikacji (A–E)
  const reflText = String(sections.reflection || '');
  const sentenceCount = reflText
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean).length;
  const fiveOk = Boolean(
    sections.hook &&
    sections.verseBlock &&
    sentenceCount >= 2 &&
    sentenceCount <= 4 &&
    reflText.length >= 90 &&
    reflText.length <= 520 &&
    sections.ctaBlock?.includes(mainUrl) &&
    sections.signature === `❤️ Wiadomości z nieba | ${publisher}`
  );
  checks.push({
    id: 'five_elements_present',
    label: 'Kompletność 5 elementów (Hak, Werset, Refleksja 2–3 zdania, CTA, Podpis)',
    passed: fiveOk,
    detail: `zdania refleksji: ${sentenceCount}, długość: ${reflText.length} zn.`,
  });

  // 4. Jawna informacja o wydawcy (Christian Culture)
  const profileDisclosure = String(config?.profile?.editorialDisclosure || '');
  checks.push({
    id: 'publisher_disclosed',
    label: 'Jawne oznaczenie wydawcy Christian Culture',
    passed: Boolean(text.includes(publisher) && profileDisclosure.includes(publisher)),
    detail: `wydawca: ${publisher}`,
  });

  // 5. Zakaz udawania osobistego nadprzyrodzonego konta Jezusa / nowych objawień
  const supHit = SUPERNATURAL_IMPERSONATION_PATTERNS.find(re => re.test(text));
  checks.push({
    id: 'no_supernatural_impersonation',
    label: 'Brak podszywania się pod bezpośrednie nadprzyrodzone autorstwo',
    passed: !supHit,
    detail: supHit ? `Wykryto zakazany wzorzec: ${supHit}` : 'OK',
  });

  // 6. Zakaz ewangelii sukcesu i wywoływania poczucia winy dla kliknięć
  const guiltHit = PROSPERITY_OR_GUILT_PATTERNS.find(re => re.test(text));
  checks.push({
    id: 'no_prosperity_or_guilt_manipulation',
    label: 'Brak obietnic sukcesu/uzdrowienia za klik i brak szantażu emocjonalnego',
    passed: !guiltHit,
    detail: guiltHit ? `Wykryto zakazany wzorzec: ${guiltHit}` : 'OK',
  });

  // 7. Zakaz przypisywania Jezusowi zmyślonych słów poza zweryfikowanym cytatem
  const quotes = [...text.matchAll(/„([^”]+)”/g)].map(m => m[1]);
  const allowedQuotes = new Set([verse?.text || '', 'Amen']);
  const unexpectedQuotes = quotes.filter(q => !allowedQuotes.has(q));
  checks.push({
    id: 'no_unbiblical_jesus_quotes',
    label: 'Brak niebiblijnych cytatów poza zweryfikowanym wersetem',
    passed: unexpectedQuotes.length === 0,
    detail: unexpectedQuotes.length ? `Nieznane cytaty: ${unexpectedQuotes.join('; ')}` : 'OK',
  });

  // 8. Zgodność z Kanonem 28 Zasad Wiary (brak niebiblijnych tradycji)
  const tradHit = NON_BIBLICAL_TRADITION_PATTERNS.find(re => re.test(text));
  checks.push({
    id: 'no_nonbiblical_traditions',
    label: 'Zgodność teologiczna z Biblią (Sola Scriptura)',
    passed: !tradHit,
    detail: tradHit ? `Wykryto zakazany wątek: ${tradHit}` : 'OK',
  });

  // 9. Brak nazw zaplecza technicznego i żargonu
  const jargonHit = INTERNAL_JARGON_PATTERNS.find(re => re.test(text));
  checks.push({
    id: 'no_internal_jargon',
    label: 'Czysty język bez nazw wewnętrznego zaplecza i żargonu',
    passed: !jargonHit,
    detail: jargonHit ? `Wykryto zakazany termin: ${jargonHit}` : 'OK',
  });

  // 10. Poprawność głównego linku docelowego
  checks.push({
    id: 'link_integrity',
    label: 'Poprawny link główny https://polskieradio.cc/werset-dnia',
    passed: Boolean(text.includes(mainUrl) && composed?.luminaPostPayload?.actionUrl === mainUrl),
    detail: mainUrl,
  });

  const passedCount = checks.filter(c => c.passed).length;
  return {
    ok: passedCount === checks.length,
    passedCount,
    totalCount: checks.length,
    checks,
  };
}
