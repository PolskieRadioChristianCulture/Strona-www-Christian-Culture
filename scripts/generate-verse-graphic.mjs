#!/usr/bin/env node
/**
 * GENERATOR DEDYKOWANYCH GRAFIK TEMATYCZNYCH DLA WERSETU DNIA (EkoCC @777)
 *
 * Dyrektywa Dowódcy (14.11.2026):
 * „Każdy werset dnia opublikowany czy to na platformie X, czy na WhatsAppie,
 *  czy na Facebooku musi mieć własną wygenerowaną tematyczną grafikę, a nie
 *  przypadkową, tak jak teraz, że mamy werset biblijny i zdjęcie, grafikę
 *  piosenkarza na scenie. To absolutnie nieadekwatne. Zapisz to w automatyzacji
 *  i aktualizuj natychmiast.”
 *
 * Działanie:
 * 1. Analizuje treść wersetu, referencję biblijną i temat duchowy.
 * 2. Dobiera semantycznie adekwatną biblijną scenę malarską z kanonu CC
 *    (zero przypadkowych zdjęć koncertowych, muzycznych, świeckich czy portretów).
 * 3. Komponuje w jakości HD (1280x720) dedykowaną kartę graficzną Wersetu Dnia
 *    z podwójną złotą ramą (#C4A35A), symbolem tematycznym, pełnym tekstem
 *    wersetu UBG oraz referencją biblijną.
 * 4. Zapisuje plik w `images/werset-dnia/generated/werset-<slug>.jpg` oraz
 *    synchronizuje do `.pages-release` i repozytorium `LUMINA`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ROOT = path.resolve(__dirname, '..');
const LUMINA_MIRROR_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';

/**
 * Bezwzględna czarna lista grafik, które NIGDY nie mogą pojawić się przy Wersecie Dnia
 */
export const FORBIDDEN_VERSE_IMAGE_PATTERNS = [
  /gerald-welch/i,
  /chan-muzyka/i,
  /popular-muzyka/i,
  /art-worship/i,
  /ark-of-fire/i,
  /wspieramto-banner/i,
  /topten/i,
  /cclite/i,
  /heatfix/i,
  /murawski/i,
  /avatar_/i,
  /cezary-hero/i,
  /wioletta-og/i,
  /em-cezary/i,
  /ccn-news-official-badge/i,
  /skin-earth/i,
  /ambient_hero/i
];

export function isForbiddenVerseImage(imagePathOrUrl = '') {
  if (!imagePathOrUrl) return true;
  const s = String(imagePathOrUrl);
  return FORBIDDEN_VERSE_IMAGE_PATTERNS.some((re) => re.test(s));
}

/**
 * Katalog 20 biblijnych scen tematycznych dopasowywanych semantycznie do treści wersetu
 */
const BIBLICAL_THEMATIC_SCENES = [
  {
    id: 'swiatlo_slowa',
    badge: 'ŚWIATŁO SŁOWA BOŻEGO',
    icon: 'book',
    accent: '#E5C158',
    tintTop: '#0B132B',
    tintBottom: '#1C1408',
    keywords: [
      'słow', 'oświec', 'pochodni', 'światłem na mojej ścieżce', 'zrozumien',
      'prostaczk', 'psalm 119', 'pismo', 'natchnion', 'naucz', 'mądroś', 'rozważ'
    ],
    backgrounds: [
      'images/player/sidebar-verse-bg.jpg',
      'images/academy/daily/kc_day_34_plonacy_krzak_horeb.jpg',
      'images/news/art-dekalog-dziesiec-przykazan-wujek.jpg'
    ]
  },
  {
    id: 'twierdza_tarcza_ochrona',
    badge: 'BÓG NASZĄ TWIERDZĄ I TARCZĄ',
    icon: 'shield',
    accent: '#D4AF37',
    tintTop: '#081826',
    tintBottom: '#0A0F1D',
    keywords: [
      'twierdz', 'tarcz', 'ucieczk', 'schronien', 'obron', 'chroni',
      'nie bój się', 'nie lękaj', 'będzie za was walczył', 'psalm 46', 'psalm 91', 'psalm 119:114'
    ],
    backgrounds: [
      'images/academy/daily/kc_day_37_obietnice_odkupienia_ramie_pana.jpg',
      'images/academy/daily/kc_day_06_ark_flood_noah.jpg',
      'images/news/art-rodzina-chrzescijanski-dom-twierdza-pokoju.jpg'
    ]
  },
  {
    id: 'gwiazdy_obietnica_wiara',
    badge: 'BOŻE PRZYMIERZE I OBIETNICA',
    icon: 'star',
    accent: '#F0C96B',
    tintTop: '#070B1E',
    tintBottom: '#121830',
    keywords: [
      'gwiazd', 'nieb', 'policz', 'potomstw', 'abram', 'abraham',
      'obietnic', 'wiara jest podstawą', 'hebrajczyków 11', 'rdz 15', 'rodzaju 15'
    ],
    backgrounds: [
      'images/academy/daily/kc_day_11_abram_gwiazdy.jpg',
      'images/news/art-rdz15-abram-gwiazdy.jpg',
      'images/academy/daily/kc_day_15_isaac_obietnica.jpg'
    ]
  },
  {
    id: 'zbawienie_odkupienie_krzyz',
    badge: 'ZBAWIENIE I ŁASKA W CHRYSTUSIE',
    icon: 'cross',
    accent: '#E2B857',
    tintTop: '#1A0B0E',
    tintBottom: '#0D0914',
    keywords: [
      'umiłował świat', 'jednorodzonego syna', 'życie wieczne', 'zbawien', 'zbawieni',
      'krew', 'baranek', 'krzyż', 'odkupien', 'grzech', 'jana 3:16', 'efezjan 2'
    ],
    backgrounds: [
      'images/academy/daily/kc_day_42_swieto_paschy_krew_baranka.jpg',
      'images/academy/daily/kc_day_16_baranek_moria.jpg',
      'images/news/art-czy-jezus-naprawde-byl-bogiem-biblijne-dowody.jpg'
    ]
  },
  {
    id: 'prowadzenie_droga_sciezki',
    badge: 'BOŻE PROWADZENIE NA KAŻDYM KROKU',
    icon: 'compass',
    accent: '#DFAF4B',
    tintTop: '#0E1726',
    tintBottom: '#1B140B',
    keywords: [
      'ścieżk', 'drog', 'prostować', 'ufaj panu', 'prowadz', 'krok',
      'dokądkolwiek pójdziesz', 'słup', 'przysłów 3', 'przysłów 16', 'jozuego 1'
    ],
    backgrounds: [
      'images/academy/daily/kc_day_09_abram_calling.jpg',
      'images/academy/daily/kc_day_29_bog_prowadzi_swoj_lud_do_egiptu.jpg',
      'images/academy/daily/kc_day_20_drabina_jakuba.jpg'
    ]
  },
  {
    id: 'pustynia_bog_widzi_woda',
    badge: 'BÓG, KTÓRY WIDZI I POKRZEPIA',
    icon: 'water',
    accent: '#D9B36C',
    tintTop: '#1B150E',
    tintBottom: '#0C161E',
    keywords: [
      'widzi mnie', 'który mnie widzi', 'hagar', 'pustyn', 'pragn',
      'wod', 'źródł', 'strumie', 'łz', 'samotn', 'rdz 16', 'rodzaju 16'
    ],
    backgrounds: [
      'images/academy/daily/kc_day_12_hagar_pustynia.jpg',
      'images/news/art-rdz16-17-hagar-el-roi.jpg',
      'images/academy/daily/kc_day_33_ocalenie_mojzesza_nil_madian.jpg'
    ]
  },
  {
    id: 'pasterz_pokoj_odpoczynek',
    badge: 'DOBRY PASTERZ I BOŻY POKÓJ',
    icon: 'olive',
    accent: '#D5B869',
    tintTop: '#0A1917',
    tintBottom: '#0B121C',
    keywords: [
      'pasterz', 'niczego mi nie zabraknie', 'odpoczynek', 'spracowani',
      'obciążeni', 'ukojen', 'pokój', 'zielon', 'psalm 23', 'mateusza 11:28'
    ],
    backgrounds: [
      'images/academy/daily/kc_day_02_eden.jpg',
      'images/academy/daily/kc_day_07_rainbow_covenant.jpg',
      'images/academy/daily/kc_day_46_manna_z_nieba_chleb_zycia.jpg'
    ]
  },
  {
    id: 'modlitwa_wstawiennictwo',
    badge: 'MODLITWA I BLISKOŚĆ BOGA',
    icon: 'flame',
    accent: '#E4BD63',
    tintTop: '#0F1329',
    tintBottom: '#1A110B',
    keywords: [
      'modl', 'módlcie', 'wołaj', 'odpowiem ci', 'wysłuch', 'proście',
      'szukajcie', 'kołaczcie', 'sędzia całej ziemi', 'jeremiasza 33', 'jakuba 5', 'rdz 18'
    ],
    backgrounds: [
      'images/academy/daily/kc_day_20_drabina_jakuba.jpg',
      'images/news/art-rdz18-mamre-wstawiennictwo.jpg',
      'images/academy/daily/kc_day_13_mamre_goscie.jpg'
    ]
  },
  {
    id: 'opatrznosc_dobro_nadzieja',
    badge: 'BOŻA OPATRZNOŚĆ I NADZIEJA',
    icon: 'sun',
    accent: '#E5BE5C',
    tintTop: '#101828',
    tintBottom: '#1C150A',
    keywords: [
      'współdziała dla dobra', 'obrócił to w dobro', 'myśli o pokoju',
      'przyszłoś', 'nadziej', 'oczekujecie', 'rzymian 8:28', 'jeremiasza 29:11', 'rdz 50:20'
    ],
    backgrounds: [
      'images/academy/daily/kc_day_31_bog_obrocil_to_w_dobro.jpg',
      'images/news/art-z-biblia-za-pan-brat-dzien-31-bog-obrocil-to-w-dobro.jpg',
      'images/academy/daily/kc_day_26_jozef_od_wiezienia_do_palacu.jpg'
    ]
  },
  {
    id: 'milosc_przebaczenie_jednosci',
    badge: 'MIŁOŚĆ, PRZEBACZENIE I POKÓJ',
    icon: 'heart',
    accent: '#E3B963',
    tintTop: '#19111B',
    tintBottom: '#0E1322',
    keywords: [
      'miłość jest cierpliwa', 'największa jest miłość', 'przebacz', 'pojednan',
      'owocem zaś ducha', 'życzliw', 'łagodn', 'koryntian 13', 'galacjan 5', 'kolosan 3'
    ],
    backgrounds: [
      'images/academy/daily/kc_day_28_ja_jestem_jozef_przebaczenie_zamiast_zemsty.jpg',
      'images/academy/daily/kc_day_23_pojednanie_i_powrot_do_betel.jpg',
      'images/news/art-bog-jest-miloscia.jpg'
    ]
  },
  {
    id: 'moc_zwyciestwo_odwaga',
    badge: 'MOC I ZWYCIĘSTWO W PANU',
    icon: 'crown',
    accent: '#E8C25A',
    tintTop: '#131629',
    tintBottom: '#1D1409',
    keywords: [
      'wszystko mogę', 'umacnia', 'nowych sił', 'skrzydłach jak orły', 'ducha bojaźni',
      'mocy i miłości', 'bądźcie mężni', 'zwycię', 'filipian 4:13', 'izajasza 40:31', 'tymoteusza 1:7'
    ],
    backgrounds: [
      'images/academy/daily/kc_day_30_blogoslawienstwo_obietnica_i_lew_z_judy.jpg',
      'images/academy/daily/kc_day_22_jakub_walczy_z_bogiem_jabbok.jpg',
      'images/academy/daily/kc_day_35_laska_waz_horeb.jpg'
    ]
  },
  {
    id: 'prawo_szabat_przykazania',
    badge: 'BOŻE PRAWO I ŚWIĘTY ODPOCZYNEK',
    icon: 'tablets',
    accent: '#DCAE4B',
    tintTop: '#15120C',
    tintBottom: '#0B111E',
    keywords: [
      'szabat', 'siódmy dzień', 'przykazan', 'dekalog', 'święcić',
      'wj 20', 'wyjścia 20', 'sprawiedliw'
    ],
    backgrounds: [
      'images/news/art-dekalog-dziesiec-przykazan-wujek.jpg',
      'images/academy/daily/kc_day_46_manna_z_nieba_chleb_zycia.jpg',
      'images/academy/daily/kc_day_01_creation.jpg'
    ]
  },
  {
    id: 'uwielbienie_wdziecznosc_radosc',
    badge: 'CHWAŁA I WDZIĘCZNOŚĆ BOGU',
    icon: 'flame',
    accent: '#E7C260',
    tintTop: '#12182B',
    tintBottom: '#1B130B',
    keywords: [
      'błogosławił pana', 'chwała jego', 'śpiewaj', 'psalm', 'radoś',
      'dziękuj', 'wdzięcznoś', 'miłosierdzie', 'odnawia się każdego poranka', 'lamentacje 3'
    ],
    backgrounds: [
      'images/academy/daily/kc_day_45_piesn_zwyciestwa_miriam_mara.jpg',
      'images/academy/daily/kc_day_07_rainbow_covenant.jpg',
      'images/academy/daily/kc_day_01_creation.jpg'
    ]
  },
  {
    id: 'stworzenie_majestat_boga',
    badge: 'MAJESTAT STWÓRCY I SŁOWO PANA',
    icon: 'sun',
    accent: '#DFB858',
    tintTop: '#081021',
    tintBottom: '#161109',
    keywords: [
      'stworz', 'początk', 'ziemi', 'światłoś', 'królestw', 'pan'
    ],
    backgrounds: [
      'images/academy/daily/kc_day_01_creation.jpg',
      'images/academy/daily/kc_day_34_plonacy_krzak_horeb.jpg',
      'images/academy/daily/kc_day_11_abram_gwiazdy.jpg'
    ]
  }
];

function hashString(str = '') {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

function slugify(str = '') {
  const map = {
    ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z',
    Ą: 'a', Ć: 'c', Ę: 'e', Ł: 'l', Ń: 'n', Ó: 'o', Ś: 's', Ź: 'z', Ż: 'z'
  };
  return String(str)
    .split('')
    .map((ch) => map[ch] || ch)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function escapeXml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Parsuje wejściowy obiekt wersetu (z bazy 365 wersetów, z kandydata X/FB lub z zaczepki WhatsApp)
 */
export function normalizeVerseInput(input = {}, rootDir = DEFAULT_ROOT) {
  let day = input.day || null;
  const url = String(input.url || '');
  const dayMatch = url.match(/[?&]day=(\d+)/i);
  if (!day && dayMatch) {
    day = parseInt(dayMatch[1], 10);
  }

  // Jeśli mamy numer dnia z bazy 365 wersetów UBG, pobierz pełne kanoniczne dane
  if (day) {
    const versesPath = path.join(rootDir, 'data', 'werset_dnia_365_ubg.json');
    if (fs.existsSync(versesPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(versesPath, 'utf8'));
        const found = (data.verses || []).find((v) => Number(v.day) === Number(day));
        if (found) {
          return {
            day: found.day,
            reference: found.reference,
            text: found.text,
            theme: found.theme || '',
            hook: found.hook || '',
            slug: `day-${String(found.day).padStart(3, '0')}-${slugify(found.reference)}`
          };
        }
      } catch (_) {}
    }
  }

  // Parsowanie z tekstu zaczepki WhatsApp lub kandydata X/FB
  const rawVerse = String(input.verse || input.lead || input.text || input.title || '').trim();
  const rawTitle = String(input.title || '').trim();

  // Wyciągnij referencję w nawiasie lub po myślniku, np. (Psalm 119:130, UBG) albo — Psalm 119:105 (UBG)
  let reference = input.reference || '';
  if (!reference) {
    const refParen = (rawTitle + ' ' + rawVerse).match(/\(([^()]+?\d+:\d+[^()]*)\)/);
    const refDash = rawVerse.match(/—\s*([^\n(]+?\d+:\d+[^\n]*)/);
    if (refParen) {
      reference = refParen[1].replace(/,?\s*UBG(-2025)?/i, '').trim();
    } else if (refDash) {
      reference = refDash[1].replace(/\(?UBG(-2025)?\)?/i, '').trim();
    }
  }
  if (!reference) reference = 'Pismo Święte (UBG)';

  // Wyciągnij sam tekst cytatu biblijnego
  let text = input.text || '';
  if (!text) {
    const quoteMatch = rawVerse.match(/„([^”]+)”/) || rawTitle.match(/„([^”]+)”/);
    if (quoteMatch) {
      text = quoteMatch[1].trim();
    } else {
      text = rawVerse
        .replace(/^Werset Dnia:\s*/i, '')
        .replace(/\([^)]*UBG[^)]*\)/gi, '')
        .replace(/—\s*[^\n]+$/, '')
        .replace(/^[„"']|[”"']$/g, '')
        .trim();
    }
  }

  const slugBase = day
    ? `day-${String(day).padStart(3, '0')}-${slugify(reference)}`
    : `${slugify(reference)}-${slugify(text.slice(0, 32)) || 'ubg'}`;

  return {
    day,
    reference,
    text,
    theme: input.theme || '',
    hook: input.hook || '',
    slug: slugBase
  };
}

/**
 * Dopasowuje scenę biblijną i motyw kolorystyczny do treści wersetu
 */
export function selectThematicScene(verseInfo, rootDir = DEFAULT_ROOT) {
  const haystack = `${verseInfo.reference} ${verseInfo.text} ${verseInfo.theme} ${verseInfo.hook}`.toLowerCase();

  let bestScene = BIBLICAL_THEMATIC_SCENES[0];
  let bestScore = -1;

  for (const scene of BIBLICAL_THEMATIC_SCENES) {
    let score = 0;
    for (const kw of scene.keywords) {
      if (haystack.includes(kw.toLowerCase())) {
        score += kw.length >= 8 ? 3 : 2;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestScene = scene;
    }
  }

  // Jeśli żaden słownik nie trafił bezpośrednio, użyj deterministycznego wyboru z kanonu biblijnego na bazie referencji
  const h = hashString(`${verseInfo.reference}|${verseInfo.text}`);
  if (bestScore <= 0) {
    bestScene = BIBLICAL_THEMATIC_SCENES[h % BIBLICAL_THEMATIC_SCENES.length];
  }

  // Wybierz istniejący plik tła z puli sceny
  const validBgs = bestScene.backgrounds
    .map((rel) => path.join(rootDir, rel))
    .filter((full) => fs.existsSync(full));

  let bgPath = validBgs.length > 0 ? validBgs[h % validBgs.length] : null;
  if (!bgPath) {
    const fallback = path.join(rootDir, 'images', 'player', 'sidebar-verse-bg.jpg');
    bgPath = fs.existsSync(fallback) ? fallback : null;
  }

  return {
    scene: bestScene,
    bgPath,
    hash: h
  };
}

/**
 * Łamie tekst wersetu na linie o wyważonej długości do eleganckiego składu SVG
 */
function wrapTextLines(text, maxCharsPerLine = 42, maxLines = 6) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  for (const word of words) {
    if (!current) {
      current = word;
    } else if ((current + ' ' + word).length <= maxCharsPerLine) {
      current += ' ' + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);

  if (lines.length > maxLines) {
    const truncated = lines.slice(0, maxLines);
    truncated[maxLines - 1] = truncated[maxLines - 1].replace(/[,.!?;:]*$/, '') + '…';
    return truncated;
  }
  return lines;
}

/**
 * Zwraca wektorową ikonę tematyczną SVG (złoty ornament biblijny)
 */
function renderThematicIconSvg(iconType, accent = '#E5C158') {
  switch (iconType) {
    case 'shield':
      return `<path d="M640 82 L666 92 V114 C666 132 654 146 640 152 C626 146 614 132 614 114 V92 Z" fill="none" stroke="${accent}" stroke-width="2.5"/><path d="M640 96 V136 M626 114 H654" stroke="${accent}" stroke-width="2.2" stroke-linecap="round"/>`;
    case 'star':
      return `<polygon points="640,80 647,102 670,102 651,116 658,138 640,124 622,138 629,116 610,102 633,102" fill="none" stroke="${accent}" stroke-width="2.3"/>`;
    case 'cross':
      return `<path d="M640 78 V148 M618 102 H662" stroke="${accent}" stroke-width="3" stroke-linecap="round"/><circle cx="640" cy="102" r="14" fill="none" stroke="${accent}" stroke-width="1.5" stroke-opacity="0.6"/>`;
    case 'water':
      return `<path d="M640 82 C640 82 662 108 662 124 C662 137 652 146 640 146 C628 146 618 137 618 124 C618 108 640 82 640 82 Z" fill="none" stroke="${accent}" stroke-width="2.4"/>`;
    case 'sun':
      return `<circle cx="640" cy="114" r="16" fill="none" stroke="${accent}" stroke-width="2.4"/><path d="M640 84 V92 M640 136 V144 M610 114 H618 M662 114 H670 M619 93 L625 99 M655 129 L661 135 M661 93 L655 99 M625 129 L619 135" stroke="${accent}" stroke-width="2" stroke-linecap="round"/>`;
    case 'crown':
      return `<path d="M612 134 L618 96 L640 114 L662 96 L668 134 Z" fill="none" stroke="${accent}" stroke-width="2.4" stroke-linejoin="round"/>`;
    case 'heart':
      return `<path d="M640 142 C640 142 614 124 614 104 C614 93 623 86 632 86 C637 86 640 90 640 94 C640 90 643 86 648 86 C657 86 666 93 666 104 C666 124 640 142 640 142 Z" fill="none" stroke="${accent}" stroke-width="2.4"/>`;
    default:
      // Otwarta księga Pisma Świętego z promieniem światła
      return `<path d="M612 96 C622 92 634 94 640 100 C646 94 658 92 668 96 V136 C658 132 646 134 640 140 C634 134 622 132 612 136 Z" fill="none" stroke="${accent}" stroke-width="2.4" stroke-linejoin="round"/><path d="M640 100 V140" stroke="${accent}" stroke-width="2"/>`;
  }
}

/**
 * Zwraca relatywną ścieżkę docelowej grafiki dla danego wersetu
 */
export function getVerseGraphicRelativePath(input = {}, rootDir = DEFAULT_ROOT) {
  const info = normalizeVerseInput(input, rootDir);
  return `images/werset-dnia/generated/werset-${info.slug}.jpg`;
}

/**
 * Generuje dedykowaną grafikę tematyczną Wersetu Dnia (1280x720 HD) i synchronizuje mirrory
 */
export async function generateVerseGraphic(input = {}, options = {}) {
  const rootDir = options.rootDir || DEFAULT_ROOT;
  const force = Boolean(options.force);
  const info = normalizeVerseInput(input, rootDir);
  const relPath = `images/werset-dnia/generated/werset-${info.slug}.jpg`;
  const outPath = path.join(rootDir, relPath);

  if (!force && fs.existsSync(outPath) && fs.statSync(outPath).size > 15000) {
    syncGeneratedGraphicMirrors(outPath, relPath, rootDir);
    return {
      ok: true,
      cached: true,
      outPath,
      relPath,
      publicUrl: `https://polskieradio.cc/${relPath}`,
      verseInfo: info
    };
  }

  const { scene, bgPath, hash } = selectThematicScene(info, rootDir);
  const quoteText = `„${info.text.replace(/^[„"']+|[”"']+$/g, '').trim()}”`;

  // Dobierz rozmiar czcionki do długości wersetu
  let fontSize = 36;
  let lineHeight = 50;
  let maxChars = 40;
  if (quoteText.length > 220) {
    fontSize = 27;
    lineHeight = 39;
    maxChars = 54;
  } else if (quoteText.length > 160) {
    fontSize = 30;
    lineHeight = 43;
    maxChars = 48;
  } else if (quoteText.length > 110) {
    fontSize = 33;
    lineHeight = 46;
    maxChars = 44;
  }

  const lines = wrapTextLines(quoteText, maxChars, 6);
  const totalTextHeight = lines.length * lineHeight;
  const centerY = 355;
  const startY = Math.round(centerY - totalTextHeight / 2 + fontSize * 0.35);

  const badgeLabel = escapeXml(
    (info.theme ? `${ scene.badge } • ${ info.theme.toUpperCase() }` : scene.badge).slice(0, 58)
  );
  const refLabel = escapeXml(`${info.reference.toUpperCase()}  •  PRZEKŁAD UBG`);
  const dayLabel = info.day ? `DZIEŃ ${info.day} / 365` : 'SŁOWO BOŻE NA DZIŚ';

  const tspanLines = lines
    .map((line, idx) => {
      const y = startY + idx * lineHeight;
      return `<text x="640" y="${y}" font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" font-style="italic" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${escapeXml(line)}</text>`;
    })
    .join('\n      ');

  const svgOverlay = `<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgShade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${scene.tintTop}" stop-opacity="0.52"/>
        <stop offset="45%" stop-color="#070A14" stop-opacity="0.36"/>
        <stop offset="100%" stop-color="${scene.tintBottom}" stop-opacity="0.72"/>
      </linearGradient>
      <radialGradient id="sacredGlow" cx="50%" cy="38%" r="55%">
        <stop offset="0%" stop-color="${scene.accent}" stop-opacity="0.22"/>
        <stop offset="60%" stop-color="${scene.accent}" stop-opacity="0.05"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="goldLine" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${scene.accent}" stop-opacity="0.1"/>
        <stop offset="50%" stop-color="${scene.accent}" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="${scene.accent}" stop-opacity="0.1"/>
      </linearGradient>
    </defs>

    <!-- Delikatna winieta kinowa zachowująca pełną widoczność sceny biblijnej -->
    <rect x="0" y="0" width="1280" height="720" fill="url(#bgShade)"/>
    <rect x="0" y="0" width="1280" height="720" fill="url(#sacredGlow)"/>

    <!-- Zewnętrzna i wewnętrzna rama Champagne Gold -->
    <rect x="34" y="30" width="1212" height="660" rx="18" fill="none" stroke="${scene.accent}" stroke-width="2" stroke-opacity="0.78"/>
    <rect x="46" y="42" width="1188" height="636" rx="14" fill="none" stroke="${scene.accent}" stroke-width="1" stroke-opacity="0.36"/>

    <!-- Karta centralna pod tekstem wersetu -->
    <rect x="86" y="158" width="1108" height="390" rx="22" fill="#050811" fill-opacity="0.74" stroke="${scene.accent}" stroke-width="1.4" stroke-opacity="0.52"/>

    <!-- Ikona tematyczna nad kartą -->
    ${renderThematicIconSvg(scene.icon, scene.accent)}

    <!-- Górna plakietka: WERSET DNIA -->
    <rect x="340" y="48" width="600" height="36" rx="18" fill="#070A12" fill-opacity="0.88" stroke="${scene.accent}" stroke-width="1.4"/>
    <text x="640" y="72" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="bold" fill="${scene.accent}" letter-spacing="2.5" text-anchor="middle">WERSET DNIA  •  ${escapeXml(dayLabel)}</text>

    <!-- Podtytuł tematyczny -->
    <text x="640" y="188" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="bold" fill="${scene.accent}" fill-opacity="0.9" letter-spacing="3" text-anchor="middle">${badgeLabel}</text>
    <line x1="390" y1="202" x2="890" y2="202" stroke="url(#goldLine)" stroke-width="1.5"/>

    <!-- Cień tekstu dla maksymalnego kontrastu -->
    <g transform="translate(0, 2)" opacity="0.85">
      ${lines
        .map((line, idx) => {
          const y = startY + idx * lineHeight;
          return `<text x="640" y="${y}" font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" font-style="italic" font-weight="bold" fill="#000000" text-anchor="middle">${escapeXml(line)}</text>`;
        })
        .join('\n      ')}
    </g>

    <!-- Główny tekst Wersetu Dnia -->
    <g>
      ${tspanLines}
    </g>

    <!-- Plakietka z referencją biblijną -->
    <rect x="370" y="516" width="540" height="52" rx="26" fill="#0A0E1A" fill-opacity="0.95" stroke="${scene.accent}" stroke-width="2"/>
    <text x="640" y="549" font-family="Georgia, 'Times New Roman', serif" font-size="20" font-weight="bold" fill="${scene.accent}" letter-spacing="1.5" text-anchor="middle">${refLabel}</text>

    <!-- Stopka marki Christian Culture -->
    <line x1="180" y1="612" x2="1100" y2="612" stroke="url(#goldLine)" stroke-width="1"/>
    <text x="640" y="646" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="bold" fill="#FFFFFF" fill-opacity="0.92" letter-spacing="2" text-anchor="middle">CHRISTIAN CULTURE  •  POLSKIERADIO.CC/WERSET-DNIA</text>
  </svg>`;

  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const positions = ['center', 'attention', 'entropy'];
  const cropPos = positions[hash % positions.length];

  let basePipeline;
  if (bgPath && fs.existsSync(bgPath)) {
    basePipeline = sharp(bgPath)
      .resize(1280, 720, { fit: 'cover', position: cropPos })
      .modulate({ brightness: 0.88, saturation: 1.08 });
  } else {
    basePipeline = sharp({
      create: {
        width: 1280,
        height: 720,
        channels: 3,
        background: { r: 10, g: 15, b: 30 }
      }
    });
  }

  const bgBuffer = await basePipeline.toBuffer();

  await sharp(bgBuffer)
    .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
    .jpeg({ quality: 92, progressive: true })
    .toFile(outPath);

  syncGeneratedGraphicMirrors(outPath, relPath, rootDir);

  return {
    ok: true,
    cached: false,
    outPath,
    relPath,
    publicUrl: `https://polskieradio.cc/${relPath}`,
    sceneId: scene.id,
    bgUsed: bgPath ? path.basename(bgPath) : 'synthetic',
    verseInfo: info
  };
}

function syncGeneratedGraphicMirrors(outPath, relPath, rootDir = DEFAULT_ROOT) {
  if (!fs.existsSync(outPath)) return;

  // 1. Kopiuj do .pages-release
  const pagesReleaseTarget = path.join(rootDir, '.pages-release', relPath);
  try {
    const dir1 = path.dirname(pagesReleaseTarget);
    if (!fs.existsSync(dir1)) fs.mkdirSync(dir1, { recursive: true });
    fs.copyFileSync(outPath, pagesReleaseTarget);
  } catch (_) {}

  // 2. Kopiuj do repozytorium lustrzanego LUMINA
  if (fs.existsSync(LUMINA_MIRROR_ROOT)) {
    const luminaTarget = path.join(LUMINA_MIRROR_ROOT, relPath);
    try {
      const dir2 = path.dirname(luminaTarget);
      if (!fs.existsSync(dir2)) fs.mkdirSync(dir2, { recursive: true });
      fs.copyFileSync(outPath, luminaTarget);
    } catch (_) {}
  }

  // 3. Aktualizuj og:image i twitter:image w werset-dnia.html oraz werset-dnia/index.html, jeśli to bieżący dzień roku
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const todayDayOfYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
    if (relPath.includes(`werset-day-${todayDayOfYear}-`)) {
      const publicUrl = `https://polskieradio.cc/${relPath}`;
      const htmlTargets = [
        path.join(rootDir, 'werset-dnia.html'),
        path.join(rootDir, 'werset-dnia', 'index.html'),
        path.join(rootDir, '.pages-release', 'werset-dnia.html'),
        path.join(rootDir, '.pages-release', 'werset-dnia', 'index.html'),
        path.join(LUMINA_MIRROR_ROOT, 'werset-dnia.html'),
        path.join(LUMINA_MIRROR_ROOT, 'werset-dnia', 'index.html')
      ];
      for (const htmlFile of htmlTargets) {
        if (fs.existsSync(htmlFile)) {
          let html = fs.readFileSync(htmlFile, 'utf8');
          const nextHtml = html
            .replace(/<meta property="og:image" content="[^"]+" \/>/g, `<meta property="og:image" content="${publicUrl}" />`)
            .replace(/<meta name="twitter:image" content="[^"]+" \/>/g, `<meta name="twitter:image" content="${publicUrl}" />`);
          if (nextHtml !== html) {
            fs.writeFileSync(htmlFile, nextHtml, 'utf8');
          }
        }
      }
    }
  } catch (_) {}
}

/**
 * Synchroniczny helper dla skryptów nadawczych (X, Facebook, WhatsApp, Tablica)
 * Gwarantuje, że każdy Werset Dnia ma własny wygenerowany plik graficzny na dysku.
 */
export function ensureVerseGraphicSync(input = {}, rootDir = DEFAULT_ROOT) {
  const relPath = getVerseGraphicRelativePath(input, rootDir);
  const fullPath = path.join(rootDir, relPath);

  if (fs.existsSync(fullPath) && fs.statSync(fullPath).size > 15000) {
    syncGeneratedGraphicMirrors(fullPath, relPath, rootDir);
    return fullPath;
  }

  try {
    const payload = Buffer.from(JSON.stringify(input), 'utf8').toString('base64');
    execFileSync(process.execPath, [__filename, `--b64=${payload}`, `--root=${rootDir}`], {
      stdio: 'pipe',
      timeout: 20000
    });
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).size > 15000) {
      return fullPath;
    }
  } catch (err) {
    console.warn('[VERSE-GRAPHIC-WARN] Błąd synchronicznego generowania grafiki wersetu:', err.message);
  }

  const fallback = path.join(rootDir, 'images', 'player', 'sidebar-verse-bg.jpg');
  return fs.existsSync(fallback) ? fallback : null;
}

// Obsługa wywołania CLI:
// node scripts/generate-verse-graphic.mjs --day=318
// node scripts/generate-verse-graphic.mjs --b64=<base64_json>
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  (async () => {
    const b64Arg = process.argv.find((a) => a.startsWith('--b64='));
    const dayArg = process.argv.find((a) => a.startsWith('--day='));
    const rootArg = process.argv.find((a) => a.startsWith('--root='));
    const force = process.argv.includes('--force');
    const rootDir = rootArg ? rootArg.slice('--root='.length) : DEFAULT_ROOT;

    if (b64Arg) {
      const jsonStr = Buffer.from(b64Arg.slice('--b64='.length), 'base64').toString('utf8');
      const input = JSON.parse(jsonStr);
      const res = await generateVerseGraphic(input, { rootDir, force });
      console.log(JSON.stringify(res));
      process.exit(0);
    }

    if (dayArg) {
      const dayVal = dayArg.slice('--day='.length);
      if (dayVal === 'all') {
        const versesPath = path.join(rootDir, 'data', 'werset_dnia_365_ubg.json');
        const data = JSON.parse(fs.readFileSync(versesPath, 'utf8'));
        let count = 0;
        for (const v of data.verses || []) {
          await generateVerseGraphic(v, { rootDir, force });
          count++;
        }
        console.log(`✅ Wygenerowano ${count} dedykowanych grafik tematycznych dla 365 wersetów UBG.`);
        process.exit(0);
      } else {
        const day = parseInt(dayVal, 10);
        const res = await generateVerseGraphic({ day }, { rootDir, force });
        console.log(JSON.stringify(res, null, 2));
        process.exit(0);
      }
    }

    // Domyślnie: wygeneruj dla bieżącego dnia roku oraz sąsiednich dni
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.max(1, Math.min(365, Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24))));
    const res = await generateVerseGraphic({ day: dayOfYear }, { rootDir, force });
    console.log(JSON.stringify(res, null, 2));
  })().catch((err) => {
    console.error('[BŁĄD] generate-verse-graphic:', err);
    process.exit(1);
  });
}
