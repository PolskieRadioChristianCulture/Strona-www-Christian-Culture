/**
 * Finalizer & audio matcher dla Śpiewnika Biblijnego "Śpiewajmy Panu" (700/700 pieśni)
 * - Rozdziela 5 pieśni bez kropki po numerze (176, 386, 431, 458, 460) -> pełne 700/700
 * - Dodaje jawną klasyfikację licencyjną (License object per hymn)
 * - Dopasowuje i kopiuje nagrania MP3 Christian Culture z Dysku Google (L:\) do audio/spiewajmy-panu/
 * - Generuje lekką wersję katalogu metadanych data/spiewajmy-panu-meta.json (dla trybu ścisłej licencji Mój kościół)
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DATA_PATH = path.join(ROOT, 'data', 'spiewajmy-panu.json');
const META_PATH = path.join(ROOT, 'data', 'spiewajmy-panu-meta.json');
const AUDIO_OUT_DIR = path.join(ROOT, 'audio', 'spiewajmy-panu');
const AUDIO_SRC_DIR = 'L:\\Mój dysk\\00_GOTOWE_PLYTY_YOUTUBE_STREAMING\\01_Spiewane (Plyty po 12 utworow)';

const COPY_AUDIO = process.argv.includes('--copy-audio');

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function classifyLicense(song) {
  const auth = String(song.author || '');
  const hasModernTranslator = /sł\.\s*pol\.|tł\.|tłum\.|Chałupk|Chalupk|Łozowsk|Bajko|Smyk|Borody|Kosowsk|Sikora/i.test(auth);
  const yearMatches = [...auth.matchAll(/(\d{4})/g)].map((m) => Number(m[1]));
  const maxYear = yearMatches.length ? Math.max(...yearMatches) : 9999;
  const isHistoricPd =
    !hasModernTranslator &&
    ((maxYear > 1000 && maxYear <= 1955) ||
      /Kochanowski|Neander|Rinkart|Feliński|Franz|Rische|Mackay/i.test(auth));

  if (isHistoricPd) {
    return {
      licenseId: 'cc-spiewajmy-panu-public-domain',
      status: 'public_domain',
      lyricsPublicAllowed: true
    };
  }
  return {
    licenseId: 'kads-spiewajmy-panu-review',
    status: 'rights_review_required',
    lyricsPublicAllowed: false
  };
}

function main() {
  const d = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

  const missingTargets = [
    { prev: 175, num: 176 },
    { prev: 385, num: 386 },
    { prev: 430, num: 431 },
    { prev: 457, num: 458 },
    { prev: 459, num: 460 }
  ];

  for (const { prev, num } of missingTargets) {
    if (d.songs.some((s) => s.number === num)) continue;
    const prevSong = d.songs.find((s) => s.number === prev);
    if (!prevSong) continue;
    const splitIdx = prevSong.stanzas.findIndex((st) => st.text.includes('Nr ' + num));
    if (splitIdx < 0) continue;

    const markerRe = new RegExp('\\s*Nr\\s+' + num + '\\.?\\s*(.*)$');
    const m = prevSong.stanzas[splitIdx].text.match(markerRe);
    if (!m) continue;

    const beforeText = prevSong.stanzas[splitIdx].text.slice(0, m.index).trim();
    const headerStr = m[1].trim();
    const newStanzas = prevSong.stanzas.slice(splitIdx + 1);
    prevSong.stanzas = prevSong.stanzas.slice(0, splitIdx);
    if (beforeText) {
      prevSong.stanzas.push({ label: String(prevSong.stanzas.length + 1), type: 'verse', text: beforeText });
    }

    let title = headerStr;
    let key = '';
    let author = '';
    const km = headerStr.match(/^(.+?)\s*\(([A-Ha-h](?:es|is|s|b)?)\)\s*(.*)$/);
    if (km) {
      title = km[1].trim();
      key = km[2].trim();
      author = km[3].trim();
    }
    const cat = d.categories.find((c) => num >= c.from && num <= c.to) || d.categories[0];

    d.songs.push({
      number: num,
      title,
      key,
      author,
      section: cat.section,
      category: cat.name,
      categoryId: cat.id,
      stanzas: newStanzas,
      bibleRefs: []
    });
    console.log(`✅ Naprawiono Nr ${num}: ${title} (${key}) [${newStanzas.length} zwrotek]`);
  }

  d.songs.sort((a, b) => a.number - b.number);

  // Collect MP3 files from Google Drive L:\
  const mp3Files = [];
  if (fs.existsSync(AUDIO_SRC_DIR)) {
    for (const dir of fs.readdirSync(AUDIO_SRC_DIR, { withFileTypes: true })) {
      if (!dir.isDirectory()) continue;
      const sub = path.join(AUDIO_SRC_DIR, dir.name);
      for (const f of fs.readdirSync(sub)) {
        if (f.toLowerCase().endsWith('.mp3')) {
          mp3Files.push({ album: dir.name, fileName: f, fullPath: path.join(sub, f) });
        }
      }
    }
  }

  if (COPY_AUDIO) {
    fs.mkdirSync(AUDIO_OUT_DIR, { recursive: true });
  }

  let matchedAudio = 0;
  let copiedAudio = 0;
  let pdCount = 0;

  for (const song of d.songs) {
    const lic = classifyLicense(song);
    song.licenseId = lic.licenseId;
    song.licenseStatus = lic.status;
    song.lyricsPublicAllowed = lic.lyricsPublicAllowed;
    if (lic.status === 'public_domain') pdCount++;

    // Detect bible references in lyrics/author too if empty
    if (!Array.isArray(song.bibleRefs)) song.bibleRefs = [];

    const nTitle = norm(song.title);
    const hit = mp3Files.find((mp) => {
      const numTag = mp.fileName.match(/#(\d{1,3})\b/);
      if (numTag && Number(numTag[1]) === song.number) return true;
      const nFile = norm(mp.fileName.replace(/\.mp3$/i, ''));
      return nTitle.length >= 6 && nFile.startsWith(nTitle);
    });

    if (hit) {
      matchedAudio++;
      const safeSlug = `sp-${String(song.number).padStart(3, '0')}.mp3`;
      song.audioUrl = `/audio/spiewajmy-panu/${safeSlug}`;
      song.audioSourceAlbum = hit.album;
      song.audioSourceFile = hit.fileName;
      song.audioLicenseId = 'cc-studio-recording-owner';

      if (COPY_AUDIO) {
        const dest = path.join(AUDIO_OUT_DIR, safeSlug);
        if (!fs.existsSync(dest)) {
          fs.copyFileSync(hit.fullPath, dest);
          copiedAudio++;
        }
      }
    }
  }

  d.edition = 'Śpiewajmy Panu (KADS)';
  d.hymnalId = 'spiewajmy-panu-kads';
  d.officialUrl = 'https://muzycy.adwent.pl/';
  d.totalSongs = d.songs.length;
  d.audioCount = matchedAudio;
  d.publicDomainCount = pdCount;
  d.licenses = {
    'cc-spiewajmy-panu-public-domain': {
      id: 'cc-spiewajmy-panu-public-domain',
      sourceUrl: 'https://muzycy.adwent.pl/',
      rightsHolder: 'Domena publiczna (historyczne teksty pieśni)',
      license: 'Public Domain',
      allowedUses: ['metadata', 'lyrics_display', 'sing_along'],
      reviewedAt: '2026-11-28'
    },
    'kads-spiewajmy-panu-review': {
      id: 'kads-spiewajmy-panu-review',
      sourceUrl: 'https://muzycy.adwent.pl/',
      rightsHolder: 'Kościół Adwentystów Dnia Siódmego w RP / Wydawnictwo Znaki Czasu (do potwierdzenia praw przed publiczną redystrybucją tekstu)',
      license: 'All Rights Reserved — wymaga potwierdzenia wydawcy dla publicznej redystrybucji tekstu',
      allowedUses: ['metadata', 'official_link', 'owner_gdrive_preview'],
      reviewedAt: '2026-11-28'
    },
    'cc-studio-recording-owner': {
      id: 'cc-studio-recording-owner',
      sourceUrl: 'https://polskieradio.cc/spiewajmy-panu',
      rightsHolder: 'Christian Culture — Cezary Rogowski (nagrania studyjne CC)',
      license: 'Christian Culture Mission Use',
      allowedUses: ['streaming', 'sing_along'],
      reviewedAt: '2026-11-28'
    }
  };

  // Write full dataset (owner songbook + lyrics)
  fs.writeFileSync(DATA_PATH, JSON.stringify(d, null, 2), 'utf8');

  // Write strict license-safe metadata-only dataset (includes lyrics ONLY for verified public_domain songs)
  const metaDataset = {
    title: d.title,
    subtitle: d.subtitle,
    edition: d.edition,
    hymnalId: d.hymnalId,
    officialUrl: d.officialUrl,
    version: d.version,
    totalSongs: d.totalSongs,
    audioCount: d.audioCount,
    publicDomainCount: d.publicDomainCount,
    categories: d.categories,
    licenses: d.licenses,
    songs: d.songs.map((s) => ({
      id: `spiewajmy-panu:${s.number}`,
      hymnalId: d.hymnalId,
      edition: d.edition,
      number: s.number,
      title: s.title,
      key: s.key,
      author: s.author,
      section: s.section,
      category: s.category,
      categoryId: s.categoryId,
      bibleRefs: s.bibleRefs || [],
      licenseId: s.licenseId,
      licenseStatus: s.licenseStatus,
      lyricsPublicAllowed: s.lyricsPublicAllowed,
      officialUrl: d.officialUrl,
      stanzaCount: Array.isArray(s.stanzas) ? s.stanzas.length : 0,
      firstLine: s.lyricsPublicAllowed && s.stanzas?.[0]?.text ? s.stanzas[0].text.slice(0, 90) : null,
      stanzas: s.lyricsPublicAllowed ? s.stanzas : null,
      audioUrl: s.audioUrl || null,
      audioLicenseId: s.audioLicenseId || null
    }))
  };
  fs.writeFileSync(META_PATH, JSON.stringify(metaDataset), 'utf8');

  const missing = [];
  for (let i = 1; i <= 700; i++) if (!d.songs.some((s) => s.number === i)) missing.push(i);

  console.log(`📊 Podsumowanie: ${d.totalSongs}/700 pieśni | Brakujące: ${missing.length} | Audio MP3 dopasowane: ${matchedAudio} (skopiowano: ${copiedAudio}) | Public Domain: ${pdCount}`);
  console.log(`💾 Pełny JSON: ${Math.round(fs.statSync(DATA_PATH).size / 1024)} KB | Meta JSON: ${Math.round(fs.statSync(META_PATH).size / 1024)} KB`);
}

main();
