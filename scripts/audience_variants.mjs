#!/usr/bin/env node
/**
 * WARIANTY ODBIORCÓW — CC Men / CC Women (Biblia Audio CC)
 *
 * Cel: unikalna wartość dodana na kanałach dążących do monetyzacji (YPP),
 * zamiast identycznych duplikatów: własna plansza wstępna serii, osobny tytuł,
 * opis i tagi pod odbiorcę. Tekst Pisma pozostaje 100% UBG bez zmian.
 *
 * Użycie:
 *   node scripts/audience_variants.mjs <prefix> <men|women> [--format 4k|shorts|both] [--upload]
 *   np. node scripts/audience_variants.mjs Ksiega_Rodzaju_9_1-29 women --format both --upload
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const EMISJA = 'C:\\Users\\czark\\Desktop\\Biblia Audio CC — Gotowe do Emisji';
const DEFAULT_DIR = path.join(EMISJA, '01_Stary_Testament', '01_Ksiega_Rodzaju');
const TMP = path.join(ROOT, 'temp_variants');
const FONT_BOLD = 'C\\:/Windows/Fonts/segoeuib.ttf';
const FONT = 'C\\:/Windows/Fonts/segoeui.ttf';

export const AUDIENCES = {
  men: {
    channel: 'CC Men',
    label: 'SŁOWO DLA MĘŻCZYZN',
    titlePrefix: 'Słowo dla Mężczyzn',
    intro: 'Seria CC Men: Pismo Święte czytane w całości, bez komentarza — dla mężczyzn, którzy chcą budować swoje życie, małżeństwo i rodzinę na Słowie Bożym.\n\n🧭 Pytanie do rozważenia: co ten rozdział mówi o odpowiedzialności, wierności i posłuszeństwie Bogu?',
    hashtags: '#CCMen #MężczyznaWiary #SłowoBoże #BibliaAudio',
    tags: ['CC Men', 'mężczyzna wiary', 'Biblia dla mężczyzn', 'ojciec', 'mąż', 'Słowo Boże', 'Biblia Audio', 'UBG']
  },
  women: {
    channel: 'CC Women',
    label: 'SŁOWO DLA KOBIET',
    titlePrefix: 'Słowo dla Kobiet',
    intro: 'Seria CC Women: Pismo Święte czytane w całości, bez komentarza — dla kobiet, które szukają w Słowie Bożym siły, mądrości i pokoju na każdy dzień.\n\n🌿 Pytanie do rozważenia: jak ten rozdział ukazuje Bożą wierność i troskę o człowieka?',
    hashtags: '#CCWomen #KobietaWiary #SłowoBoże #BibliaAudio',
    tags: ['CC Women', 'kobieta wiary', 'Biblia dla kobiet', 'żona', 'mama', 'Słowo Boże', 'Biblia Audio', 'UBG']
  }
};

function ref(baseTitle) {
  // "Księga Rodzaju 9:1-29 (UBG) • Przymierze ... | Biblia Audio CC [4K UHD]" -> "Księga Rodzaju 9:1-29 • Przymierze ..."
  return baseTitle.split('|')[0].replace('(UBG)', '').replace(/\s+/g, ' ').trim();
}

function ffmpeg(args) {
  const r = spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`ffmpeg zakończył się kodem ${r.status}`);
}

function esc(p) { return p.replace(/\\/g, '/').replace(/:/g, '\\:'); }

export function renderVariant({ src, out, aud, refText, vertical }) {
  fs.mkdirSync(TMP, { recursive: true });
  const W = vertical ? 1080 : 3840, H = vertical ? 1920 : 2160;
  const dur = vertical ? 3 : 5;
  const s = vertical ? 0.55 : 1; // skala fontów
  const t1 = path.join(TMP, 'l1.txt'), t2 = path.join(TMP, 'l2.txt'), t2b = path.join(TMP, 'l2b.txt'), t3 = path.join(TMP, 'l3.txt');
  const [refPart, ...themeParts] = refText.split(' • ');
  const theme = themeParts.join(' • ');
  fs.writeFileSync(t1, aud.label, 'utf8');
  fs.writeFileSync(t2, refPart, 'utf8');
  fs.writeFileSync(t2b, theme || ' ', 'utf8');
  fs.writeFileSync(t3, `${aud.channel} • Biblia Audio Christian Culture`, 'utf8');
  const gold = '0xC4A35A', light = '0xE2CC9A';
  // Temat: rozmiar dopasowany do szerokości kadru (ok. 0.52 em na znak, margines 8%)
  const themeFs = Math.min(Math.round(72 * s), Math.floor((W * 0.84) / (Math.max(theme.length, 1) * 0.52)));
  const card =
    `color=c=0x0B0F1A:s=${W}x${H}:d=${dur}:r=30,` +
    `drawtext=fontfile='${FONT_BOLD}':textfile='${esc(t1)}':fontcolor=${gold}:fontsize=${Math.round(150 * s)}:x=(w-tw)/2:y=h/2-${Math.round(200 * s)},` +
    `drawbox=x=(iw-${Math.round(900 * s)})/2:y=ih/2-${Math.round(30 * s)}:w=${Math.round(900 * s)}:h=${Math.max(2, Math.round(6 * s))}:color=${gold}:t=fill,` +
    `drawtext=fontfile='${FONT}':textfile='${esc(t2)}':fontcolor=white:fontsize=${Math.round(90 * s)}:x=(w-tw)/2:y=h/2+${Math.round(20 * s)},` +
    `drawtext=fontfile='${FONT}':textfile='${esc(t2b)}':fontcolor=white:fontsize=${themeFs}:x=(w-tw)/2:y=h/2+${Math.round(140 * s)},` +
    `drawtext=fontfile='${FONT}':textfile='${esc(t3)}':fontcolor=${light}:fontsize=${Math.round(56 * s)}:x=(w-tw)/2:y=h/2+${Math.round(260 * s)},` +
    `fade=t=in:st=0:d=0.6,fade=t=out:st=${dur - 0.6}:d=0.6,format=yuv420p,setsar=1[card];` +
    `anullsrc=r=48000:cl=stereo,atrim=0:${dur}[sil];` +
    `[0:v]scale=${W}:${H},setsar=1,format=yuv420p,fps=30[mv];[0:a]aresample=48000[ma];` +
    `[card][sil][mv][ma]concat=n=2:v=1:a=1[v][a]`;
  ffmpeg(['-i', src, '-filter_complex', card, '-map', '[v]', '-map', '[a]',
    '-c:v', 'libx264', '-preset', vertical ? 'medium' : 'veryfast', '-crf', vertical ? '19' : '20',
    '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', out]);
}

export function variantMeta({ baseMetaPath, aud, shorts, out }) {
  const base = JSON.parse(fs.readFileSync(baseMetaPath, 'utf8'));
  const r = ref(base.title || '');
  const title = `${aud.titlePrefix} | ${r}${shorts ? ' #Shorts' : ''}`.slice(0, 100);
  const description = `${aud.intro}\n\n━━━━━━━━━━━━━━━━━━━━\n${base.description || ''}\n\n${aud.hashtags}${shorts ? ' #Shorts' : ''}`.slice(0, 4900);
  const tags = [...new Set([...(aud.tags || []), ...(base.tags || [])])].slice(0, 25);
  fs.writeFileSync(out, JSON.stringify({ title, description, tags }, null, 2), 'utf8');
  return { title, refText: r };
}

async function main() {
  const [prefix, audKey] = process.argv.slice(2);
  const args = process.argv.slice(2);
  const fmtIdx = args.indexOf('--format');
  const format = fmtIdx >= 0 ? args[fmtIdx + 1] : 'both';
  const upload = args.includes('--upload');
  const dirIdx = args.indexOf('--dir');
  const dir = dirIdx >= 0 ? args[dirIdx + 1] : DEFAULT_DIR;
  const aud = AUDIENCES[audKey];
  if (!prefix || !aud) {
    console.log('Użycie: node scripts/audience_variants.mjs <prefix> <men|women> [--format 4k|shorts|both] [--upload] [--dir <katalog>]');
    process.exit(1);
  }
  const files = fs.readdirSync(dir);
  const meta = files.find(f => f.startsWith(prefix) && f.endsWith('_metadata.json'));
  if (!meta) throw new Error(`Brak metadanych dla ${prefix}`);
  const outDir = path.join(dir, 'warianty_odbiorcow');
  fs.mkdirSync(outDir, { recursive: true });

  const jobs = [];
  if (format !== 'shorts') jobs.push({ src: files.find(f => f.startsWith(prefix) && f.endsWith('_4K.mp4')), shorts: false });
  if (format !== '4k') jobs.push({ src: files.find(f => f.startsWith(prefix) && f.includes('Shorts') && f.endsWith('.mp4')), shorts: true });

  const tag = audKey === 'men' ? 'CC_Men' : 'CC_Women';
  for (const j of jobs) {
    if (!j.src) { console.warn(`[POMINIĘTO] brak pliku ${j.shorts ? 'Shorts' : '4K'} dla ${prefix}`); continue; }
    const base = path.basename(j.src, '.mp4');
    const outVideo = path.join(outDir, `${base}_${tag}.mp4`);
    const outMeta = path.join(outDir, `${base}_${tag}_metadata.json`);
    const { title, refText } = variantMeta({ baseMetaPath: path.join(dir, meta), aud, shorts: j.shorts, out: outMeta });
    console.log(`\n[WARIANT] ${tag} • ${j.shorts ? 'Shorts 9:16' : '4K 16:9'} • ${title}`);
    if (!fs.existsSync(outVideo)) {
      renderVariant({ src: path.join(dir, j.src), out: outVideo, aud, refText, vertical: j.shorts });
    }
    console.log(`  -> Wideo: ${outVideo}`);
    if (upload) {
      const { uploadEpisodeToChannel } = await import('./publish_perfect.mjs');
      const r = await uploadEpisodeToChannel({ videoPath: outVideo, metaPath: outMeta, channelId: 'switcher', channelName: aud.channel, visibility: 'public' });
      console.log(`  -> Opublikowano: ${r.videoUrl || '(link w Studio)'}`);
    }
  }
}

if (process.argv[1] && process.argv[1].endsWith('audience_variants.mjs')) {
  main().catch(err => { console.error('❌', err.message); process.exit(1); });
}
