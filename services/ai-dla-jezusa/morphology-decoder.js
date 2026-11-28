/**
 * ══════════════════════════════════════════════════════════════════════════════
 * CHRISTIAN CULTURE — DEKODER MORFOLOGII BIBLIJNEJ (SBLGNT / ROBINSON & OSHB / WLC)
 * Plik: /services/ai-dla-jezusa/morphology-decoder.js
 * 
 * Dwukierunkowy analizator i tłumacz kodów gramatycznych na język polski:
 * - Greka Nowego Testamentu (SBLGNT, Robinson-Pierpont, STEPBible)
 * - Hebrajski i Aramejski Starego Testamentu (OSHB, Westminster Leningrad Codex, STEP)
 * ══════════════════════════════════════════════════════════════════════════════
 */

// ── SŁOWNIKI GRECKIE ──
const GREEK_POS = {
  'N': 'Rzeczownik',
  'V': 'Czasownik',
  'A': 'Przymiotnik',
  'R': 'Zaimek względny',
  'C': 'Spójnik',
  'D': 'Przysłówek',
  'P': 'Zaimek osobowy',
  'K': 'Zaimek łączny',
  'I': 'Wykrzyknik',
  'X': 'Cząstka nieokreślona',
  'Q': 'Zaimek pytający',
  'F': 'Zaimek zwrotny',
  'S': 'Zaimek dzierżawczy',
  'T': 'Rodzajnik',
  'PREP': 'Przyimek',
  'CONJ': 'Spójnik',
  'ADV': 'Przysłówek',
  'PRON': 'Zaimek',
  'PART': 'Cząstka',
  'INTERJ': 'Wykrzyknik'
};

const GREEK_TENSE = {
  'P': 'teraźniejszy (praesens)',
  'I': 'przeszły niedokonany (imperfectum)',
  'F': 'przyszły (futurum)',
  'A': 'aoryst (czas przeszły dokonany / aoristus)',
  'X': 'dokonany (perfectum)',
  'Y': 'zaprzeszły (plusquamperfectum)'
};

const GREEK_VOICE = {
  'A': 'strona czynna (activum)',
  'M': 'strona medialna / zwrotna (medium)',
  'P': 'strona bierna (passivum)',
  'E': 'medialna lub bierna'
};

const GREEK_MOOD = {
  'I': 'tryb orzekający (indicativus)',
  'S': 'tryb łączący (coniunctivus)',
  'O': 'tryb życzący (optativus)',
  'M': 'tryb rozkazujący (imperativus)',
  'N': 'bezokolicznik (infinitivus)',
  'P': 'imiesłów (participium)'
};

const GREEK_CASE = {
  'N': 'mianownik (nominativus)',
  'V': 'wołacz (vocativus)',
  'G': 'dopełniacz (genitivus)',
  'D': 'celownik (dativus)',
  'A': 'biernik (accusativus)'
};

const GREEK_NUMBER = {
  'S': 'liczba pojedyncza (singularis)',
  'P': 'liczba mnoga (pluralis)'
};

const GREEK_GENDER = {
  'M': 'rodzaj męski (masculinum)',
  'F': 'rodzaj żeński (femininum)',
  'N': 'rodzaj nijaki (neutrum)'
};

const GREEK_PERSON = {
  '1': '1. osoba',
  '2': '2. osoba',
  '3': '3. osoba'
};

// ── SŁOWNIKI HEBRAJSKIE I ARAMEJSKIE ──
const HEBREW_BINYAN = {
  'q': 'Qal (podstawowy prosty)',
  'N': 'Niphal (strona bierna / zwrotna prostego)',
  'p': 'Piel (intensywny czynny)',
  'P': 'Pual (intensywny bierny)',
  'h': 'Hiphil (sprawczy czynny / kauzatywny)',
  'H': 'Hophal (sprawczy bierny)',
  't': 'Hithpael (intensywny zwrotny)',
  'o': 'Polel',
  'O': 'Polal',
  'r': 'Hithpolel',
  'm': 'Poel',
  'M': 'Poal',
  'k': 'Palel',
  'K': 'Pulal',
  'Q': 'Qal pasywny'
};

const HEBREW_TENSE_CONJ = {
  'p': 'dokonany (qatal / perfekt)',
  'q': 'dokonany z waw (weqatal)',
  'i': 'niedokonany (yiqtol / imperfekt)',
  'w': 'niedokonany z waw konwersyjnym (wayyiqtol)',
  'm': 'tryb rozkazujący (imperativus)',
  'r': 'imiesłów czynny (participium)',
  's': 'imiesłów bierny (participium passivum)',
  'c': 'bezokolicznik w stanie zależnym (infinitivus constructus)',
  'a': 'bezokolicznik w stanie wolnym (infinitivus absolutus)',
  'j': 'tryb życzący (iussivus)',
  'h': 'tryb zachęcający (cohortativus)'
};

const HEBREW_STATE = {
  'a': 'stan bezwzględny (status absolutus)',
  'c': 'stan zależny (status constructus)',
  'd': 'stan zdeterminowany (status determinatus - aramejski)'
};

/**
 * Dekoduje kod morfologiczny grecki (np. "V-IAI-3S", "N-DSF", "T-NSM", "PREP").
 */
export function decodeGreekMorphology(code) {
  if (!code || typeof code !== 'string') {
    return { valid: false, raw: code, error: 'Brak kodu morfologicznego' };
  }
  const clean = code.trim();

  // Proste części mowy
  if (GREEK_POS[clean]) {
    return {
      valid: true,
      lang: 'grc',
      raw: clean,
      partOfSpeech: GREEK_POS[clean],
      fullDescription: GREEK_POS[clean]
    };
  }

  const parts = clean.split('-');
  const posCode = parts[0];
  const pos = GREEK_POS[posCode] || posCode;

  // Czasowniki: np. V-IAI-3S, V-PAN, V-2AAP-NSM
  if (posCode === 'V' && parts.length > 1) {
    const spec = parts[1];
    let tense = null;
    let voice = null;
    let mood = null;
    let person = null;
    let number = null;
    let caseStr = null;
    let gender = null;

    let idx = 0;
    // Opcjonalny wariant aorystu: 1 lub 2
    if (spec[idx] === '1' || spec[idx] === '2') idx++;

    if (spec[idx] && GREEK_TENSE[spec[idx]]) tense = GREEK_TENSE[spec[idx]];
    idx++;
    if (spec[idx] && GREEK_VOICE[spec[idx]]) voice = GREEK_VOICE[spec[idx]];
    idx++;
    if (spec[idx] && GREEK_MOOD[spec[idx]]) mood = GREEK_MOOD[spec[idx]];
    idx++;

    // Druga część: osoba/liczba lub przypadek/liczba/rodzaj (imiesłowy/bezokoliczniki)
    if (parts[2]) {
      const rest = parts[2];
      if (/^[123][SP]$/.test(rest)) {
        person = GREEK_PERSON[rest[0]];
        number = GREEK_NUMBER[rest[1]];
      } else if (rest.length >= 3) {
        caseStr = GREEK_CASE[rest[0]];
        number = GREEK_NUMBER[rest[1]];
        gender = GREEK_GENDER[rest[2]];
      }
    }

    const segments = [pos];
    if (tense) segments.push(tense);
    if (voice) segments.push(voice);
    if (mood) segments.push(mood);
    if (person && number) segments.push(`${person}, ${number}`);
    else if (caseStr && number && gender) segments.push(`${caseStr}, ${number}, ${gender}`);

    return {
      valid: true,
      lang: 'grc',
      raw: clean,
      partOfSpeech: pos,
      tense,
      voice,
      mood,
      person,
      number,
      case: caseStr,
      gender,
      fullDescription: segments.join(', ')
    };
  }

  // Rzeczowniki, przymiotniki, rodzajniki: np. N-DSF, T-NSM, A-APM
  if (parts.length > 1 && parts[1].length >= 3) {
    const spec = parts[1];
    const caseStr = GREEK_CASE[spec[0]] || null;
    const number = GREEK_NUMBER[spec[1]] || null;
    const gender = GREEK_GENDER[spec[2]] || null;

    const segments = [pos];
    if (caseStr) segments.push(caseStr);
    if (number) segments.push(number);
    if (gender) segments.push(gender);

    return {
      valid: true,
      lang: 'grc',
      raw: clean,
      partOfSpeech: pos,
      case: caseStr,
      number,
      gender,
      fullDescription: segments.join(', ')
    };
  }

  return {
    valid: true,
    lang: 'grc',
    raw: clean,
    partOfSpeech: pos,
    fullDescription: `${pos} (${clean})`
  };
}

/**
 * Dekoduje kod morfologiczny hebrajski lub aramejski (OSHB / WLC / STEP, np. "HVqp3ms", "Ncfsa", "HNcmpa").
 */
export function decodeHebrewMorphology(code) {
  if (!code || typeof code !== 'string') {
    return { valid: false, raw: code, error: 'Brak kodu morfologicznego' };
  }
  const clean = code.trim();
  const isAramaic = clean.startsWith('A') || clean.startsWith('a');
  let rest = clean.startsWith('H') || clean.startsWith('A') ? clean.slice(1) : clean;

  const langName = isAramaic ? 'Aramejski biblijny' : 'Hebrajski biblijny';

  // Czasownik: zaczyna się od V
  if (rest.startsWith('V')) {
    const binyanCode = rest[1] || '';
    const tenseCode = rest[2] || '';
    const binyan = HEBREW_BINYAN[binyanCode] || binyanCode;
    const tense = HEBREW_TENSE_CONJ[tenseCode] || tenseCode;

    let person = null;
    let gender = null;
    let number = null;

    const tail = rest.slice(3);
    if (tail.length >= 3) {
      person = GREEK_PERSON[tail[0]] || tail[0];
      gender = tail[1] === 'm' ? 'rodzaj męski' : (tail[1] === 'f' ? 'rodzaj żeński' : 'rodzaj wspólny');
      number = tail[2] === 's' ? 'liczba pojedyncza' : (tail[2] === 'p' ? 'liczba mnoga' : (tail[2] === 'd' ? 'liczba podwójna (dualis)' : tail[2]));
    } else if (tail.length === 2) {
      gender = tail[0] === 'm' ? 'rodzaj męski' : (tail[0] === 'f' ? 'rodzaj żeński' : tail[0]);
      number = tail[1] === 's' ? 'liczba pojedyncza' : (tail[1] === 'p' ? 'liczba mnoga' : tail[1]);
    }

    const segments = [`Czasownik (${langName})`];
    if (binyan) segments.push(`binyan: ${binyan}`);
    if (tense) segments.push(`koniugacja: ${tense}`);
    if (person) segments.push(person);
    if (gender) segments.push(gender);
    if (number) segments.push(number);

    return {
      valid: true,
      lang: isAramaic ? 'arc' : 'heb',
      raw: clean,
      partOfSpeech: 'Czasownik',
      binyan,
      tense,
      person,
      gender,
      number,
      fullDescription: segments.join(', ')
    };
  }

  // Rzeczownik: N (Noun), Nc (Noun common), Np (Noun proper)
  if (rest.startsWith('N')) {
    const type = rest[1] === 'c' ? 'Rzeczownik pospolity' : (rest[1] === 'p' ? 'Nazwa własna' : 'Rzeczownik');
    let gender = null;
    let number = null;
    let state = null;

    const tail = rest.startsWith('Nc') || rest.startsWith('Np') ? rest.slice(2) : rest.slice(1);
    if (tail[0]) gender = tail[0] === 'm' ? 'rodzaj męski' : (tail[0] === 'f' ? 'rodzaj żeński' : tail[0]);
    if (tail[1]) number = tail[1] === 's' ? 'liczba pojedyncza' : (tail[1] === 'p' ? 'liczba mnoga' : (tail[1] === 'd' ? 'liczba podwójna (dualis)' : tail[1]));
    if (tail[2]) state = HEBREW_STATE[tail[2]] || tail[2];

    const segments = [`${type} (${langName})`];
    if (gender) segments.push(gender);
    if (number) segments.push(number);
    if (state) segments.push(state);

    return {
      valid: true,
      lang: isAramaic ? 'arc' : 'heb',
      raw: clean,
      partOfSpeech: type,
      gender,
      number,
      state,
      fullDescription: segments.join(', ')
    };
  }

  // Cząstka / Przyimek / Spójnik / Wykrzyknik
  if (rest.startsWith('To')) {
    return {
      valid: true,
      lang: isAramaic ? 'arc' : 'heb',
      raw: clean,
      partOfSpeech: 'Cząstka wyznacznika biernika (nota accusativi)',
      fullDescription: `Cząstka wyznacznika biernika / obiektu bezpośredniego (${langName})`
    };
  }
  if (rest.startsWith('R') || clean === 'PREP') {
    return {
      valid: true,
      lang: isAramaic ? 'arc' : 'heb',
      raw: clean,
      partOfSpeech: 'Przyimek',
      fullDescription: `Przyimek (${langName})`
    };
  }
  if (rest.startsWith('C') || clean === 'CONJ') {
    return {
      valid: true,
      lang: isAramaic ? 'arc' : 'heb',
      raw: clean,
      partOfSpeech: 'Spójnik',
      fullDescription: `Spójnik (${langName})`
    };
  }

  return {
    valid: true,
    lang: isAramaic ? 'arc' : 'heb',
    raw: clean,
    partOfSpeech: 'Forma gramatyczna',
    fullDescription: `Znacznik gramatyczny (${langName}: ${clean})`
  };
}

/**
 * Automatycznie wykrywa język i dekoduje kod morfologiczny.
 */
export function decodeMorphology(code, langHint = 'auto') {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Brak kodu' };
  }
  const clean = code.trim();
  if (langHint === 'grc' || clean.includes('-') || clean === 'PREP' || clean === 'CONJ') {
    return decodeGreekMorphology(clean);
  }
  if (langHint === 'heb' || langHint === 'arc' || clean.startsWith('H') || clean.startsWith('A') || clean.startsWith('HV') || clean.startsWith('Nc')) {
    return decodeHebrewMorphology(clean);
  }
  // Auto-detekcja
  if (clean.startsWith('H') || clean.startsWith('A') || clean.startsWith('HV') || clean.startsWith('Nc')) {
    return decodeHebrewMorphology(clean);
  }
  return decodeGreekMorphology(clean);
}
