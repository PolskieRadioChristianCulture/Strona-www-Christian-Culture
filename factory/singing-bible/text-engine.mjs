import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc';
const GD_ROOT = 'H:\\Mój dysk\\OA - orkiestracja Agentowa\\CC_SINGING_BIBLE_FACTORY';
const LOCAL_ROOT = path.join(ROOT, 'factory', 'singing-bible');

export function computeSha256(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

/**
 * Splits a long verse into musical lyrical lines of ~6 to 12 words,
 * breaking at natural punctuation (commas, semicolons, dashes)
 * without altering or omitting a single word.
 */
export function splitVerseToLines(verseText) {
  const trimmed = verseText.trim();
  if (!trimmed) return [];

  // Split on punctuation while preserving words
  const parts = trimmed.split(/([,;:–—\.\?!]+\s*)/);
  const clauses = [];
  let currentClause = '';

  for (let i = 0; i < parts.length; i += 2) {
    const textPart = parts[i] || '';
    const punctPart = parts[i + 1] || '';
    const piece = (textPart + punctPart).trim();
    if (piece) {
      clauses.push(piece);
    }
  }

  // Combine small clauses or split overly long clauses
  const lines = [];
  let buffer = '';

  for (const clause of clauses) {
    const combined = buffer ? buffer + ' ' + clause : clause;
    const wordCount = combined.split(/\s+/).length;

    if (wordCount <= 12) {
      buffer = combined;
    } else {
      if (buffer) {
        lines.push(buffer.trim());
      }
      // If clause itself is too long (> 14 words), split by words
      const clauseWords = clause.split(/\s+/);
      if (clauseWords.length > 14) {
        let sub = [];
        for (const w of clauseWords) {
          sub.push(w);
          if (sub.length >= 8) {
            lines.push(sub.join(' '));
            sub = [];
          }
        }
        buffer = sub.join(' ');
      } else {
        buffer = clause;
      }
    }
  }

  if (buffer) {
    lines.push(buffer.trim());
  }

  return lines.length > 0 ? lines : [trimmed];
}

/**
 * Builds parts for a biblical chapter.
 * Target: Max 16 sung lyrical lines per song (4 stanzas x 4 lines),
 * 100% of UBG words preserved in exact sequence.
 */
export function processChapterToSongs(chapterId) {
  const chapterPath = path.join(ROOT, 'data', 'bible', 'ubg-2025', `${chapterId}.json`);
  if (!fs.existsSync(chapterPath)) {
    throw new Error(`Chapter file not found: ${chapterPath}`);
  }

  const chapterData = JSON.parse(fs.readFileSync(chapterPath, 'utf8'));
  const verses = chapterData.verses || [];

  // Flatten verses into array of line objects
  const allLines = [];
  for (const v of verses) {
    const splitLines = splitVerseToLines(v.text);
    for (let idx = 0; idx < splitLines.length; idx++) {
      allLines.push({
        verseNumber: v.number,
        versePart: idx + 1,
        text: splitLines[idx]
      });
    }
  }

  // Group lines into parts of max 16 lines (4 stanzas of 4 lines)
  const songs = [];
  let currentPartIndex = 1;
  let linePointer = 0;

  while (linePointer < allLines.length) {
    const chunk = allLines.slice(linePointer, linePointer + 16);
    linePointer += chunk.length;

    const startVerse = chunk[0].verseNumber;
    const endVerse = chunk[chunk.length - 1].verseNumber;
    const songId = `${chapterId}-P${String(currentPartIndex).padStart(2, '0')}`;

    // Divide chunk into 4 stanzas
    const stanzas = [];
    for (let s = 0; s < chunk.length; s += 4) {
      stanzas.push(chunk.slice(s, s + 4));
    }

    // Format Suno Prompt
    let sunoPrompt = `[Styl: Akustyczne uwielbienie biblijne, ciepły wokal, organiczne instrumenty, podniosły i czysty ton]\n\n`;
    
    stanzas.forEach((stanza, sIdx) => {
      sunoPrompt += `[Zwrotka ${sIdx + 1}]\n`;
      stanza.forEach(l => {
        sunoPrompt += `${l.text}\n`;
      });
      sunoPrompt += `\n`;
    });

    sunoPrompt += `[Zakończenie]\n`;

    // Calculate plain text hash for validation
    const plainLyrics = chunk.map(l => l.text).join('\n');
    const sha256 = computeSha256(plainLyrics);

    songs.push({
      songId,
      chapterId,
      book: chapterData.book,
      bookCode: chapterData.bookCode,
      chapter: chapterData.chapter,
      partNumber: currentPartIndex,
      startVerse,
      endVerse,
      verseRange: startVerse === endVerse ? `Werset ${startVerse}` : `Wersety ${startVerse}–${endVerse}`,
      lineCount: chunk.length,
      lines: chunk,
      sunoPrompt,
      plainLyrics,
      sha256,
      license: "UBG CC BY-ND 4.0 / Logos Media",
      status: "TEXT_READY",
      createdAt: new Date().toISOString()
    });

    currentPartIndex++;
  }

  return {
    chapterId,
    book: chapterData.book,
    chapter: chapterData.chapter,
    totalVerses: verses.length,
    totalLines: allLines.length,
    totalParts: songs.length,
    songs
  };
}

/**
 * CLI execution or export for specific chapter
 */
export function exportChapterSongs(chapterId) {
  const result = processChapterToSongs(chapterId);

  const localTextDir = path.join(LOCAL_ROOT, '02_TEKSTY_DO_SUNO', chapterId);
  if (!fs.existsSync(localTextDir)) fs.mkdirSync(localTextDir, { recursive: true });

  const gdTextDir = path.join(GD_ROOT, '02_TEKSTY_DO_SUNO', chapterId);
  if (fs.existsSync(GD_ROOT) && !fs.existsSync(gdTextDir)) fs.mkdirSync(gdTextDir, { recursive: true });

  // Save each song file
  for (const s of result.songs) {
    const txtName = `${s.songId}.txt`;
    const jsonName = `${s.songId}.json`;

    // Save prompt text
    fs.writeFileSync(path.join(localTextDir, txtName), s.sunoPrompt, 'utf8');
    fs.writeFileSync(path.join(localTextDir, jsonName), JSON.stringify(s, null, 2), 'utf8');

    if (fs.existsSync(gdTextDir)) {
      fs.writeFileSync(path.join(gdTextDir, txtName), s.sunoPrompt, 'utf8');
      fs.writeFileSync(path.join(gdTextDir, jsonName), JSON.stringify(s, null, 2), 'utf8');
    }
  }

  // Summary file for chapter
  const summaryFile = path.join(localTextDir, `MANIFEST_${chapterId}.json`);
  fs.writeFileSync(summaryFile, JSON.stringify(result, null, 2), 'utf8');
  if (fs.existsSync(gdTextDir)) {
    fs.writeFileSync(path.join(gdTextDir, `MANIFEST_${chapterId}.json`), JSON.stringify(result, null, 2), 'utf8');
  }

  console.log(`Exported ${result.songs.length} parts for ${chapterId} (${result.book} ${result.chapter}, wersetów: ${result.totalVerses}).`);
  return result;
}

// Run for next chapter if called directly
const targetChapter = process.argv[2] || 'GEN-002';
console.log(`Processing chapter: ${targetChapter}`);
exportChapterSongs(targetChapter);
