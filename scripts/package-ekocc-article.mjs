#!/usr/bin/env node
/**
 * EkoCC ARTICLE PACKAGER & PUBLISHER (Podręcznik Redakcyjny Wersja 1.0)
 * Narzędzie do automatycznego pakowania i publikacji artykułów EkoCC.
 *
 * Zgodność z Sekcją 10 i 12 Podręcznika Redakcyjnego:
 * - Generuje DOCX z osadzoną grafiką 16:9 (biblioteka docx)
 * - Generuje TXT / Markdown
 * - Generuje SEO.txt (metadane, JSON-LD, sitemap, boty AI)
 * - Generuje kompletny pakiet ZIP: EkoCC_<portal>_<slug>_<YYYY-MM-DD>.zip
 * - Przy fladze --publish: dodaje do bazy portalu i uruchamia cc-universal-publish-discovery.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  ImageRun,
  BorderStyle
} from 'docx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

/**
 * Tworzy pełny pakiet redakcyjny artykułu EkoCC
 * @param {Object} articleData
 * @param {string} articleData.portal np. 'news', 'finanse', 'nauka', 'historia', 'biologia', 'prawo', 'em', 'survival'
 * @param {string} articleData.type np. 'ANALIZA', 'WIADOMOŚĆ', 'EGZEGEZA', 'MOTYWACJA eM', 'MUZYKA', 'PORADNIK'
 * @param {string} articleData.title Tytuł H1
 * @param {string} articleData.slug Slug ASCII bez polskich znaków
 * @param {string} articleData.author 'Cezary Rogowski' | 'Wioletta Rogowska' | 'Redakcja Biblijna CCN News'
 * @param {string} articleData.date YYYY-MM-DD
 * @param {string} articleData.lead Lead artykułu (2-4 zdania)
 * @param {Array<{heading: string, paragraphs: string[]}>} articleData.sections Sekcje H2 z akapitami
 * @param {string} articleData.conclusion Podsumowanie redakcyjne
 * @param {Array<{name: string, url?: string}>} articleData.sources Źródła pierwotne
 * @param {string} articleData.scripture Cytaty i kontekst biblijny
 * @param {string} articleData.imagePath Ścieżka do pliku grafiki 16:9
 * @param {string} [articleData.imageCaption] Podpis grafiki
 * @param {Object} articleData.seo { title, description, keywords }
 * @param {string} [outputDir] Katalog wyjściowy (domyślnie Pulpit)
 */
export async function packageEkoccArticle(articleData, outputDir = 'C:\\Users\\czark\\Desktop') {
  const {
    portal = 'news',
    type = 'ANALIZA',
    title,
    slug,
    author = 'Cezary Rogowski',
    date = new Date().toISOString().slice(0, 10),
    lead,
    sections = [],
    conclusion,
    sources = [],
    scripture = '',
    imagePath,
    imageCaption = 'Ilustracja redakcyjna EkoCC / Christian Culture',
    seo = {}
  } = articleData;

  if (!title || !slug || !lead) {
    throw new Error('Brak wymaganych pól artykułu (title, slug, lead).');
  }

  const baseName = `EkoCC_${portal}_${slug}_${date}`;
  const tempDir = path.join(ROOT, 'temp_packages', baseName);
  fs.mkdirSync(tempDir, { recursive: true });

  console.log(`📦 Przygotowywanie pakietu redakcyjnego: ${baseName}...`);

  // 1. Zapis pliku TXT / Markdown
  const mdContent = `# ${title}
**Portal:** ${portal} | **Typ:** ${type} | **Data:** ${date} | **Autor:** ${author}
**Status:** Do autoryzacji autora i akceptacji wydawcy

---

**LEAD:**
${lead}

---

${sections.map(s => `## ${s.heading}\n\n${s.paragraphs.join('\n\n')}`).join('\n\n')}

---

## PODSUMOWANIE REDAKCYJNE CCN
${conclusion || ''}
${articleData.cta ? `\n---\n\n## WEZWANIE DO DZIAŁANIA I MODLITWA\n${articleData.cta}\n` : ''}
${articleData.tags && articleData.tags.length > 0 ? `\n**Tagi i słowa kluczowe:** ${articleData.tags.join(' ')}\n` : ''}
---

### ŹRÓDŁA I DOKUMENTACJA:
${sources.map(src => `- ${src.name}${src.url ? ` (${src.url})` : ''}`).join('\n')}

### ODNIESIENIE BIBLIJNE:
${scripture}
`;

  const txtPath = path.join(tempDir, `${baseName}.txt`);
  fs.writeFileSync(txtPath, mdContent, 'utf8');

  // 2. Zapis pliku SEO.txt
  const canonicalUrl = `https://polskieradio.cc/${portal}/${slug}`;
  const seoContent = `===================================================================
METADANE SEO & REJESTR WYSZUKIWARKI — EkoCC (${baseName})
===================================================================
Tytuł SEO (45-65 znaków): ${seo.title || title.slice(0, 65)}
Meta Description (130-160): ${seo.description || lead.slice(0, 155)}
Slug ASCII: ${slug}
Portal docelowy: https://polskieradio.cc/${portal}
Canonical URL: ${canonicalUrl}
Autor zweryfikowany: ${author}
Słowa kluczowe: ${(seo.keywords || []).join(', ')}

Schema.org JSON-LD:
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "${title.replace(/"/g, '\\"')}",
  "description": "${(seo.description || lead).replace(/"/g, '\\"')}",
  "datePublished": "${date}T06:00:00+01:00",
  "dateModified": "${date}T06:00:00+01:00",
  "author": {
    "@type": "Person",
    "name": "${author}"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Christian Culture Network",
    "url": "https://polskieradio.cc"
  },
  "mainEntityOfPage": "${canonicalUrl}"
}

Status w wyszukiwarce ekosystemu:
- Zindeksowano w /wyszukiwarka i /szukaj
- Sitemapy: https://polskieradio.cc/sitemap.xml oraz /sitemaps/${portal === 'news' ? 'news.xml' : 'pages.xml'}
- Boty AI: Dostęp publiczny w robots.txt (GPTBot, ClaudeBot, PerplexityBot) oraz llms.txt
`;
  const seoPath = path.join(tempDir, `${baseName}_SEO.txt`);
  fs.writeFileSync(seoPath, seoContent, 'utf8');

  // 3. Kopiowanie grafiki 16:9
  let finalImgPath = null;
  if (imagePath && fs.existsSync(imagePath)) {
    const ext = path.extname(imagePath) || '.jpg';
    finalImgPath = path.join(tempDir, `${baseName}${ext}`);
    fs.copyFileSync(imagePath, finalImgPath);
  }

  // 4. Budowa dokumentu DOCX ze stylami i osadzoną grafiką
  const docxChildren = [
    new Paragraph({
      text: `CHRISTIAN CULTURE NETWORK • PORTAL: ${portal.toUpperCase()}`,
      style: 'Header',
      spacing: { after: 120 },
      alignment: AlignmentType.CENTER
    }),
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Autor: `, bold: true }),
        new TextRun({ text: `${author}  |  ` }),
        new TextRun({ text: `Data: `, bold: true }),
        new TextRun({ text: `${date}  |  ` }),
        new TextRun({ text: `Typ: `, bold: true }),
        new TextRun({ text: `${type}` })
      ],
      spacing: { after: 300 }
    })
  ];

  // Osadzenie grafiki w DOCX jeśli dostępna
  if (finalImgPath) {
    try {
      const imgBuffer = fs.readFileSync(finalImgPath);
      docxChildren.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: imgBuffer,
              transformation: { width: 560, height: 315 } // Proporcja 16:9
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [new TextRun({ text: imageCaption, italics: true, size: 18, color: '666666' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 }
        })
      );
    } catch (err) {
      console.warn('Nie udało się osadzić obrazu w DOCX:', err.message);
    }
  }

  // Lead
  docxChildren.push(
    new Paragraph({
      children: [new TextRun({ text: lead, bold: true, size: 23 })],
      spacing: { after: 300 }
    })
  );

  // Sekcje H2
  for (const s of sections) {
    docxChildren.push(
      new Paragraph({
        text: s.heading,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 }
      })
    );
    for (const p of s.paragraphs) {
      docxChildren.push(
        new Paragraph({
          text: p,
          spacing: { after: 160 },
          alignment: AlignmentType.JUSTIFIED
        })
      );
    }
  }

  // Podsumowanie
  if (conclusion) {
    docxChildren.push(
      new Paragraph({
        text: 'PODSUMOWANIE REDAKCYJNE CCN',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 350, after: 150 }
      }),
      new Paragraph({
        text: conclusion,
        spacing: { after: 300 },
        alignment: AlignmentType.JUSTIFIED
      })
    );
  }

  // CTA i Wezwanie do Działania
  if (articleData.cta) {
    docxChildren.push(
      new Paragraph({
        text: 'WEZWANIE DO DZIAŁANIA I MODLITWA',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 350, after: 150 }
      }),
      new Paragraph({
        text: articleData.cta,
        spacing: { after: 250 },
        alignment: AlignmentType.JUSTIFIED
      })
    );
  }

  // Tagi i Oznaczenia Misyjne (@ i #)
  if (articleData.tags && articleData.tags.length > 0) {
    docxChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Oznaczenia i słowa kluczowe: ', bold: true, size: 20 }),
          new TextRun({ text: articleData.tags.join('  '), italics: true, size: 20, color: 'C4A35A' })
        ],
        spacing: { before: 200, after: 300 }
      })
    );
  }

  // Blok Patronatu Christian Culture (Wspieram to)
  docxChildren.push(
    new Paragraph({
      text: 'MISJA CHRISTIAN CULTURE • WOLNE MEDIA BOŻE',
      style: 'Header',
      spacing: { before: 400, after: 100 },
      alignment: AlignmentType.CENTER
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Razem niesiemy czystą Ewangelię i biblijną nadzieję dalej',
          bold: true,
          size: 24,
          color: 'C4A35A'
        })
      ],
      spacing: { after: 150 },
      alignment: AlignmentType.CENTER
    }),
    new Paragraph({
      text: 'Ten artykuł powstał dzięki wsparciu naszych Darczyńców i Patronów. Jeśli ta treść dotknęła Twojego serca, wesprzyj naszą misję i pomóż docierać z biblijną prawdą do kolejnych tysięcy ludzi.',
      spacing: { after: 200 },
      alignment: AlignmentType.CENTER
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: '👉 [WSPIERAM TO]: https://polskieradio.cc/wspieraj  |  Patronite: https://patronite.pl/osobowoscplus',
          bold: true,
          color: 'FF7A00',
          size: 22
        })
      ],
      spacing: { after: 350 },
      alignment: AlignmentType.CENTER
    })
  );

  // Źródła i Biblia
  docxChildren.push(
    new Paragraph({
      text: 'DOKUMENTACJA I ŹRÓDŁA',
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 300, after: 100 }
    })
  );
  for (const src of sources) {
    docxChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: `• ${src.name}: `, bold: true }),
          new TextRun({ text: src.url || 'Archiwum redakcyjne' })
        ],
        spacing: { after: 80 }
      })
    );
  }

  if (scripture) {
    docxChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: `• Kontekst biblijny: `, bold: true }),
          new TextRun({ text: scripture })
        ],
        spacing: { after: 80 }
      })
    );
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22, color: '1A1A1A' },
          paragraph: { lineSpacing: 276 }
        }
      }
    },
    sections: [{ children: docxChildren }]
  });

  const docxBuffer = await Packer.toBuffer(doc);
  const docxPath = path.join(tempDir, `${baseName}.docx`);
  fs.writeFileSync(docxPath, docxBuffer);
  console.log(`✅ Utworzono DOCX z grafiką: ${docxPath}`);

  // 5. Archiwum ZIP
  const zipDest = path.join(outputDir, `${baseName}.zip`);
  const psZipCmd = `powershell.exe -NoProfile -Command "Compress-Archive -Path '${tempDir}\\*' -DestinationPath '${zipDest}' -Force"`;
  execSync(psZipCmd, { stdio: 'inherit' });
  console.log(`🎉 Utworzono paczkę ZIP na Pulpicie: ${zipDest}`);

  // Skopiuj DOCX także bezpośrednio na Pulpit dla wygody
  const desktopDocx = path.join(outputDir, `${baseName}.docx`);
  fs.copyFileSync(docxPath, desktopDocx);

  return {
    baseName,
    zipPath: zipDest,
    docxPath: desktopDocx,
    txtPath,
    seoPath,
    tempDir
  };
}

// Jeśli uruchomiono bezpośrednio z CLI (np. test lub pakowanie)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const jsonArg = process.argv[2] || path.join(ROOT, 'scripts/current-article-data.json');
  if (fs.existsSync(jsonArg)) {
    console.log(`📦 Ładowanie danych artykułu z: ${jsonArg}`);
    const articleData = JSON.parse(fs.readFileSync(jsonArg, 'utf8'));
    packageEkoccArticle(articleData)
      .then((res) => {
        console.log('🎉 Kompletny pakiet redakcyjny EkoCC przygotowany pomyślnie!');
        console.log('ZIP:', res.zipPath);
        console.log('DOCX:', res.docxPath);
        console.log('TXT:', res.txtPath);
        console.log('SEO:', res.seoPath);
      })
      .catch((err) => {
        console.error('❌ Błąd pakowania:', err);
        process.exit(1);
      });
  } else {
    console.log('EkoCC Article Packager Module Ready. Użyj: node scripts/package-ekocc-article.mjs [ścieżka_do_pliku.json]');
  }
}
