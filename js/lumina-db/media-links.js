/**
 * LUMINA Rich Media, YouTube, Google Drive & OpenGraph Links Parser
 * Extracted from lumina-db.js (Phase 1 Modularization)
 */
// ══════════════════════════════════════════════════════════════════════════
// 7. RICH MEDIA & SOCIAL LINKS PARSER (Etap: Clickable Links & Media Embeds)
// ══════════════════════════════════════════════════════════════════════════

export function extractYouTubeId(url) {
    if (!url) return null;
    const str = String(url).trim();
    // If iframe tag passed, extract src
    const iframeMatch = str.match(/src=["']([^"']+)["']/i);
    const targetUrl = iframeMatch ? iframeMatch[1] : str;
    const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = targetUrl.match(regExp);
    return (match && match[1]) ? match[1] : null;
}

export function extractYouTubePlaylistId(url) {
    if (!url) return null;
    const str = String(url).trim();
    const iframeMatch = str.match(/src=["']([^"']+)["']/i);
    const targetUrl = iframeMatch ? iframeMatch[1] : str;
    const regExp = /[?&]list=([a-zA-Z0-9_-]+)/i;
    const match = targetUrl.match(regExp);
    return (match && match[1]) ? match[1] : null;
}

export const LUMINA_HANDLES = {
    'pawel': { slug: 'pawelmurawski', name: 'Paweł Murawski', url: 'lumina.pawelmurawski.html', avatar: 'avatar_pawel_murawski.jpg', badge: '🌿 Holistyczny Coaching' },
    'pawelmurawski': { slug: 'pawelmurawski', name: 'Paweł Murawski', url: 'lumina.pawelmurawski.html', avatar: 'avatar_pawel_murawski.jpg', badge: '🌿 Holistyczny Coaching' },
    'u_yciezywymbogiem_4231': { slug: 'pawelmurawski', name: 'Paweł Murawski', url: 'lumina.pawelmurawski.html', avatar: 'avatar_pawel_murawski.jpg', badge: '🌿 Holistyczny Coaching' },
    'robert': { slug: 'u_robertukaszpio_5668', name: 'Robert Łukasz Pio', url: 'lumina-profile.html?u=u_robertukaszpio_5668', avatar: 'lumina_icon.jpg', badge: '✨ Społeczność LUMINA' },
    'bratrobert': { slug: 'u_robertukaszpio_5668', name: 'Robert Łukasz Pio', url: 'lumina-profile.html?u=u_robertukaszpio_5668', avatar: 'lumina_icon.jpg', badge: '✨ Społeczność LUMINA' },
    'robertlukaszpio': { slug: 'u_robertukaszpio_5668', name: 'Robert Łukasz Pio', url: 'lumina-profile.html?u=u_robertukaszpio_5668', avatar: 'lumina_icon.jpg', badge: '✨ Społeczność LUMINA' },
    'u_robertukaszpio_5668': { slug: 'u_robertukaszpio_5668', name: 'Robert Łukasz Pio', url: 'lumina-profile.html?u=u_robertukaszpio_5668', avatar: 'lumina_icon.jpg', badge: '✨ Społeczność LUMINA' },
    'magdalena': { slug: 'magdalena', name: 'Magdalena (43)', url: 'lumina.magdalena.html', avatar: 'avatar_magdalena.png', badge: '🕊️ Poznań' },
    'cezary': { slug: 'cezaryrgowski', name: 'Cezary Rogowski', url: 'lumina.cezaryrgowski.html', avatar: 'avatar_cezary_official.jpg', badge: '👑 Założyciel CC' },
    'cezaryrgowski': { slug: 'cezaryrgowski', name: 'Cezary Rogowski', url: 'lumina.cezaryrgowski.html', avatar: 'avatar_cezary_official.jpg', badge: '👑 Założyciel CC' },
    'cezaryrogowski': { slug: 'cezaryrgowski', name: 'Cezary Rogowski', url: 'lumina.cezaryrgowski.html', avatar: 'avatar_cezary_official.jpg', badge: '👑 Założyciel CC' },
    'wioletta': { slug: 'wiolettarogowska', name: 'Wioletta Rogowska', url: 'lumina.wiolettarogowska.html', avatar: 'avatar_wioletta_official.jpg', badge: '🌸 Współzałożycielka CC' },
    'wiolettarogowska': { slug: 'wiolettarogowska', name: 'Wioletta Rogowska', url: 'lumina.wiolettarogowska.html', avatar: 'avatar_wioletta_official.jpg', badge: '🌸 Współzałożycielka CC' },
    'andrzej': { slug: 'andrzejthiel', name: 'Andrzej Thiel', url: 'lumina.andrzejthiel.html', avatar: 'avatar_andrzej_thiel.jpg', badge: '📖 Cuda Każdego Dnia' },
    'andrzejthiel': { slug: 'andrzejthiel', name: 'Andrzej Thiel', url: 'lumina.andrzejthiel.html', avatar: 'avatar_andrzej_thiel.jpg', badge: '📖 Cuda Każdego Dnia' },
    'thiel': { slug: 'andrzejthiel', name: 'Andrzej Thiel', url: 'lumina.andrzejthiel.html', avatar: 'avatar_andrzej_thiel.jpg', badge: '📖 Cuda Każdego Dnia' },
    'studiodobregoslowa': { slug: 'studiodobregoslowa', name: 'Studio Dobrego Słowa', url: 'lumina.studiodobregoslowa.html', avatar: 'studiodobregoslowa_avatar.jpg', badge: '🎬 Partner Medialny' },
    'sds': { slug: 'studiodobregoslowa', name: 'Studio Dobrego Słowa', url: 'lumina.studiodobregoslowa.html', avatar: 'studiodobregoslowa_avatar.jpg', badge: '🎬 Partner Medialny' },
    'ccwomen': { slug: 'ccwomen', name: 'CC Women • YouTube', url: 'lumina.ccwomen.html', avatar: 'avatar_ccwomen_official_2026.jpg', badge: '🌸 Kanał CC Women' },
    'women': { slug: 'ccwomen', name: 'CC Women • YouTube', url: 'lumina.ccwomen.html', avatar: 'avatar_ccwomen_official_2026.jpg', badge: '🌸 Kanał CC Women' },
    'cc_women': { slug: 'ccwomen', name: 'CC Women • YouTube', url: 'lumina.ccwomen.html', avatar: 'avatar_ccwomen_official_2026.jpg', badge: '🌸 Kanał CC Women' },
    'ccmen': { slug: 'ccmen', name: 'CC MEN • YouTube', url: 'lumina.ccmen.html', avatar: 'logo_cc_men.jpg', badge: '🛡️ Męska Wspólnota Wiary' },
    'men': { slug: 'ccmen', name: 'CC MEN • YouTube', url: 'lumina.ccmen.html', avatar: 'logo_cc_men.jpg', badge: '🛡️ Męska Wspólnota Wiary' },
    'cc_men': { slug: 'ccmen', name: 'CC MEN • YouTube', url: 'lumina.ccmen.html', avatar: 'logo_cc_men.jpg', badge: '🛡️ Męska Wspólnota Wiary' },
    'radiocc': { slug: 'radiocc', name: 'Polskie Radio CC', url: 'lumina.radiocc.html', avatar: 'logo_radio_cc.jpg', badge: '📻 Radio Uwielbienia 24/7' },
    'radio': { slug: 'radiocc', name: 'Polskie Radio CC', url: 'lumina.radiocc.html', avatar: 'logo_radio_cc.jpg', badge: '📻 Radio Uwielbienia 24/7' },
    'cctv': { slug: 'cctv', name: 'Christian Culture TV', url: 'lumina.cctv.html', avatar: 'logo_cctv.png', badge: '📺 Telewizja CCTV24' },
    'osobowoscplus': { slug: 'osobowoscplus', name: 'OSOBOWOŚĆ + • YouTube', url: 'lumina.osobowoscplus.html', avatar: 'logo_osobowosc_plus.jpg', badge: '🧠 Formacja & Wiara' },



    'jola': { slug: 'jolawojcik', name: 'Jola Wójcik', url: 'lumina.jolawojcik.html', avatar: 'avatar_jolawojcik.jpg', badge: '🕊️ Społeczność LUMINA' },
    'jolawojcik': { slug: 'jolawojcik', name: 'Jola Wójcik', url: 'lumina.jolawojcik.html', avatar: 'avatar_jolawojcik.jpg', badge: '🕊️ Społeczność LUMINA' },
    'zofia': { slug: 'zofiadudek', name: 'Zofia Dudek', url: 'lumina.zofiadudek.html', avatar: 'avatar_zofia_dudek.jpg', badge: '🌿 Społeczność LUMINA' },
    'zofiadudek': { slug: 'zofiadudek', name: 'Zofia Dudek', url: 'lumina.zofiadudek.html', avatar: 'avatar_zofia_dudek.jpg', badge: '🌿 Społeczność LUMINA' },
    'bibliaaudio': { slug: 'u_bibliaaudiochristianculture_3248', name: 'Biblia Audio Christian Culture', url: 'lumina-profile.html?u=u_bibliaaudiochristianculture_3248', avatar: 'avatar_biblia_audio.gif', badge: '📖 Biblia Audio CC' },
    'bibliaaudiochristianculture': { slug: 'u_bibliaaudiochristianculture_3248', name: 'Biblia Audio Christian Culture', url: 'lumina-profile.html?u=u_bibliaaudiochristianculture_3248', avatar: 'avatar_biblia_audio.gif', badge: '📖 Biblia Audio CC' },
    'u_bibliaaudiochristianculture_3248': { slug: 'u_bibliaaudiochristianculture_3248', name: 'Biblia Audio Christian Culture', url: 'lumina-profile.html?u=u_bibliaaudiochristianculture_3248', avatar: 'avatar_biblia_audio.gif', badge: '📖 Biblia Audio CC' },
    'lumina': { slug: 'lumina_official', name: 'LUMINA Społeczność', url: 'lumina-tablica.html', avatar: 'lumina_icon.jpg', badge: '🕊️ Tablica Portalu' },
    'noemi': { slug: 'noemi', name: 'Noemi', url: 'lumina-profile.html?u=noemi', avatar: 'avatar_noemi.jpg', badge: '🌿 Misja CC' },
    'dawid': { slug: 'dawid', name: 'Dawid', url: 'lumina-profile.html?u=dawid', avatar: 'avatar_dawid.jpg', badge: '🎵 Misja CC' },
    'tomek': { slug: 'tomek', name: 'Tomasz', url: 'lumina-profile.html?u=tomek', avatar: 'avatar_widget_tomek.jpg', badge: '🌲 Pasjonat Gór' }
};

export function resolveMentionHandle(handle) {
    const clean = (handle || '').toLowerCase().replace(/^[@#]/, '').trim();
    if (LUMINA_HANDLES[clean]) {
        return LUMINA_HANDLES[clean];
    }
    if (typeof window !== 'undefined' && window.LUMINA_COMMUNITY_PROFILES && window.LUMINA_COMMUNITY_PROFILES[clean]) {
        const prof = window.LUMINA_COMMUNITY_PROFILES[clean];
        return {
            slug: clean,
            name: prof.name || ('@' + clean),
            url: prof.url || `lumina-profile.html?u=${encodeURIComponent(clean)}`,
            avatar: prof.avatar || 'lumina_icon.jpg',
            badge: prof.badge || prof.tag || 'Profil LUMINA'
        };
    }
    return {
        slug: clean,
        name: '@' + clean,
        url: `lumina-profile.html?u=${encodeURIComponent(clean)}`,
        avatar: 'lumina_icon.jpg',
        badge: 'Profil LUMINA'
    };
}


// ══════════════════════════════════════════════════════════════════════════
// ── LUMINA GOOGLE DRIVE INTEGRATION SUITE (WSZYSCY UŻYTKOWNICY) ──
// ══════════════════════════════════════════════════════════════════════════

export function parseGoogleDriveUrl(url) {
    if (!url) return null;
    let cleanUrl = String(url).trim();
    if (cleanUrl.includes('<iframe') && cleanUrl.includes('src=')) {
        const m = cleanUrl.match(/src=["']([^"']+)["']/i);
        if (m && m[1]) cleanUrl = m[1];
    }
    let fileId = null;
    let type = 'file';
    let typeLabel = 'Plik z Dysku Google';
    let icon = 'fa-brands fa-google-drive';

    // Match patterns:
    // https://drive.google.com/file/d/FILE_ID/view...
    // https://drive.google.com/file/d/FILE_ID/preview
    // https://drive.google.com/open?id=FILE_ID
    // https://docs.google.com/document/d/FILE_ID/...
    // https://docs.google.com/presentation/d/FILE_ID/...
    // https://docs.google.com/spreadsheets/d/FILE_ID/...
    // https://docs.google.com/forms/d/FILE_ID/...
    const fileMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i) || 
                      cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/i) ||
                      cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/i);

    if (fileMatch && fileMatch[1]) {
        fileId = fileMatch[1];
    } else if (/^[a-zA-Z0-9_-]{20,}$/.test(cleanUrl)) {
        fileId = cleanUrl;
    }

    if (!fileId) return null;

    if (cleanUrl.includes('docs.google.com/document')) {
        type = 'document';
        typeLabel = 'Dokument Google Docs';
        icon = 'fa-solid fa-file-lines';
    } else if (cleanUrl.includes('docs.google.com/spreadsheets')) {
        type = 'spreadsheet';
        typeLabel = 'Arkusz Google Sheets';
        icon = 'fa-solid fa-table-cells';
    } else if (cleanUrl.includes('docs.google.com/presentation')) {
        type = 'presentation';
        typeLabel = 'Prezentacja Google Slides';
        icon = 'fa-solid fa-file-powerpoint';
    } else if (cleanUrl.includes('docs.google.com/forms')) {
        type = 'form';
        typeLabel = 'Formularz Google Forms';
        icon = 'fa-solid fa-square-poll-vertical';
    } else if (cleanUrl.includes('drive.google.com/drive/folders')) {
        type = 'folder';
        typeLabel = 'Katalog z Dysku Google';
        icon = 'fa-solid fa-folder-open';
    } else if (cleanUrl.match(/\.(wav|mp3|m4a|ogg|aac|flac)/i) || cleanUrl.toLowerCase().includes('audio')) {
        type = 'audio';
        typeLabel = 'Audio / Muzyka (Dysk Google)';
        icon = 'fa-solid fa-music';
    } else if (cleanUrl.match(/\.(mp4|mov|avi|mkv|webm)/i) || cleanUrl.toLowerCase().includes('video')) {
        type = 'video';
        typeLabel = 'Wideo (Dysk Google)';
        icon = 'fa-solid fa-film';
    } else if (cleanUrl.match(/\.pdf/i)) {
        type = 'pdf';
        typeLabel = 'Dokument PDF (Dysk Google)';
        icon = 'fa-solid fa-file-pdf';
    } else if (cleanUrl.match(/\.(jpg|jpeg|png|webp|gif)/i)) {
        type = 'image';
        typeLabel = 'Grafika (Dysk Google)';
        icon = 'fa-solid fa-image';
    }

    const previewEmbedUrl = type === 'document' 
        ? `https://docs.google.com/document/d/${fileId}/preview`
        : (type === 'presentation' 
            ? `https://docs.google.com/presentation/d/${fileId}/preview`
            : (type === 'spreadsheet' 
                ? `https://docs.google.com/spreadsheets/d/${fileId}/preview`
                : (type === 'form' 
                    ? `https://docs.google.com/forms/d/${fileId}/viewform?embedded=true`
                    : (type === 'folder'
                        ? `https://drive.google.com/embeddedfolderview?id=${fileId}#grid`
                        : `https://drive.google.com/file/d/${fileId}/preview`))));

    return {
        fileId: fileId,
        type: type,
        typeLabel: typeLabel,
        icon: icon,
        directImgUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`,
        lh3ImgUrl: `https://lh3.googleusercontent.com/d/${fileId}`,
        directDownloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
        previewEmbedUrl: previewEmbedUrl,
        viewUrl: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`
    };
}

export function createGoogleDriveEmbedHtml(gdriveData, options = {}) {
    if (!gdriveData || !gdriveData.fileId) return '';
    const isImageOnly = options.mode === 'image';
    if (isImageOnly) {
        return `
            <div class="gdrive-img-box" style="position:relative; margin-top:10px; border-radius:14px; overflow:hidden; border:1px solid rgba(52,168,83,0.3); background:#07090e;">
                <img src="${gdriveData.directImgUrl}" alt="Grafika z Dysku Google" class="post-image" loading="lazy" decoding="async" style="width:100%; height:auto; max-height:none; object-fit:contain; display:block;" onerror="this.onerror=null; this.src='${gdriveData.lh3ImgUrl}';">
                <div style="position:absolute; bottom:8px; right:8px; background:rgba(0,0,0,0.75); border:1px solid rgba(52,168,83,0.5); color:#86efac; font-size:0.7rem; font-weight:800; padding:3px 8px; border-radius:12px; display:flex; align-items:center; gap:5px; backdrop-filter:blur(8px);">
                    <i class="fa-brands fa-google-drive" style="color:#34a853;"></i> Dysk Google
                </div>
            </div>
        `;
    }

    return `
        <div class="rich-gdrive-embed" style="margin-top:12px; border-radius:16px; overflow:hidden; border:1.5px solid rgba(52,168,83,0.35); background:rgba(15,23,42,0.85); box-shadow:0 8px 24px rgba(0,0,0,0.5);">
            <div style="padding:10px 14px; background:rgba(52,168,83,0.12); border-bottom:1px solid rgba(52,168,83,0.25); display:flex; align-items:center; justify-content:space-between; gap:10px;">
                <div style="display:flex; align-items:center; gap:8px; font-size:0.85rem; font-weight:800; color:#fff;">
                    <i class="${gdriveData.icon || 'fa-brands fa-google-drive'}" style="color:#34a853; font-size:1.15rem;"></i>
                    <span>Dysk Google • ${gdriveData.typeLabel || 'Zasób'}</span>
                </div>
                <a href="${gdriveData.viewUrl}" target="_blank" rel="noopener noreferrer" style="font-size:0.75rem; color:#86efac; text-decoration:none; display:flex; align-items:center; gap:5px; font-weight:700; padding:4px 10px; border-radius:12px; background:rgba(52,168,83,0.2); border:1px solid rgba(52,168,83,0.4);" onclick="event.stopPropagation()">
                    <span>Otwórz na Dysku</span> <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.65rem;"></i>
                </a>
            </div>
            <div style="position:relative; width:100%; aspect-ratio:16/9; min-height:240px; background:#000;">
                <iframe src="${gdriveData.previewEmbedUrl}" 
                        title="Podgląd pliku z Dysku Google" 
                        style="width:100%; height:100%; border:none; display:block;" 
                        allow="autoplay; encrypted-media; fullscreen" 
                        loading="lazy"></iframe>
            </div>
        </div>
    `;
}

let _escapeHtml = null;
export function configureMediaLinks(deps = {}) {
    if (typeof deps.escapeHtml === 'function') _escapeHtml = deps.escapeHtml;
}

export function escapeHtml(str) {
    if (!str) return '';
    if (typeof _escapeHtml !== 'function') {
        throw new Error('media-links requires configureMediaLinks({ escapeHtml })');
    }
    return _escapeHtml(str);
}

// ══════════════════════════════════════════════════════════════════════════
// ── LUMINA RICH OPENGRAPH & STORE PRODUCT PREVIEWS ENGINE ──
// ══════════════════════════════════════════════════════════════════════════

const _luminaOgCache = new Map();

/**
 * Returns instant synchronous heuristic metadata for known Christian Culture links & external URLs
 */
export function getHeuristicLinkMetadata(url) {
    if (!url) return null;
    try {
        const rawUrl = String(url).trim();
        const normalizedUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : ('https://' + rawUrl);
        const u = new URL(normalizedUrl);
        const host = u.hostname.replace(/^www\./, '').toLowerCase();
        const pathname = u.pathname;

        // 0. Kampania Wspieraj Misję Christian Culture (polskieradio.cc/wspieraj)
        if (rawUrl.includes('wspieraj') || pathname.includes('wspieraj')) {
            return {
                url: normalizedUrl,
                host: 'polskieradio.cc/wspieraj',
                domain: host,
                title: 'Wspieraj misję Christian Culture • Razem niesiemy nadzieję',
                description: 'Nie każdy może dać pieniądze. Każdy może pomóc nieść Ewangelię dalej. Wybierz swoją formę wsparcia.',
                image: 'https://polskieradio.cc/assets/cc-support/social.jpg',
                badge: '🤝 WSPIERAJ MISJĘ CC',
                ctaText: 'Wspieraj Dzieło Boże ➔',
                icon: 'fa-solid fa-hand-holding-heart'
            };
        }

        // 1. Oficjalny Sklep Christian Culture (Creator Spring / Teespring)
        if (host.includes('creator-spring.com') || host.includes('teespring.com') || pathname.includes('/listing/')) {
            let itemName = 'Kolekcja Christian Culture';
            const listingMatch = pathname.match(/\/listing\/([^/?#]+)/i);
            if (listingMatch && listingMatch[1]) {
                const rawName = decodeURIComponent(listingMatch[1]).replace(/[-_]+/g, ' ').trim();
                itemName = rawName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
            }

            // High-quality mockup / product image for Christian Culture store
            let img = 'https://mockup-api.teespring.com/v3/image/iZ-CubEFlReC1xHtnlIhCrSODTk/500/500.jpg';
            let desc = 'Oficjalne artykuły, kubki ceramiczne, odzież i akcesoria Christian Culture. Kupując, wspierasz rozwój dzieła ewangelizacji i mediów chrześcijańskich.';

            return {
                url: url,
                host: 'Oficjalny Sklep Christian Culture',
                domain: host,
                isStore: true,
                title: `Sklep Christian Culture • ${itemName}`,
                description: desc,
                image: img,
                badge: '🛍️ OFICJALNY SKLEP CHRISTIAN CULTURE',
                ctaText: 'Kup w Sklepie 🛒',
                icon: 'fa-solid fa-bag-shopping'
            };
        }

        // 2. Polskie Radio Christian Culture & Portale Tematyczne CCN
        if (host.includes('polskieradio.cc') || host.includes('christian-culture.web.app')) {
            let title = 'Polskie Radio Christian Culture • 24/7 Ku Bożej Chwale';
            let desc = 'Słuchaj na żywo muzyki uwielbienia, Biblii Śpiewanej, codziennych inspiracji i programów ku Bożej chwale.';
            let badge = '📻 MEDIA CHRISTIAN CULTURE';
            let ctaText = 'Słuchaj / Otwórz ✨';
            let img = 'https://polskieradio.cc/logo-glowne.png';
            let icon = 'fa-solid fa-radio';

            // A. Artykuł Flagowy: AI, SI a biblijny Antychryst
            if (pathname.includes('ai-antychryst') || pathname.includes('antychryst')) {
                title = 'AI, SI a biblijny Antychryst: Dlaczego sztuczna inteligencja nie może być Antychrystem';
                desc = 'Dlaczego sztuczna inteligencja — w świetle krytyki biblijno-historycznej, proroczej i eschatologicznej — nie może być Antychrystem. Prawidłowa hermeneutyka wymaga, aby to tekst Pisma definiował symbol, a nie współczesna technologia sposób czytania tekstu.';
                badge = '🔬 NOWE TECHNOLOGIE & SI';
                ctaText = 'Czytaj Cały Artykuł ➔';
                img = '/images/si/ai-vs-antychryst.webp';
                icon = 'fa-solid fa-microchip';
            } else if (pathname.includes('/si')) {
                title = 'CCN Nowe Technologie & Sztuczna Inteligencja • Chrześcijańska Perspektywa';
                desc = 'Rzetelne analizy teologiczne, etyczne i technologiczne w świecie dynamicznego rozwoju sztucznej inteligencji.';
                badge = '🔬 NOWE TECHNOLOGIE & SI';
                ctaText = 'Otwórz Portal SI ➔';
                img = '/images/si/ai-vs-antychryst.webp';
                icon = 'fa-solid fa-microchip';
            } else if (pathname.includes('/nauka')) {
                title = 'CCN Nauka i Wiara • Odkrycia w Świetle Pisma Świętego';
                desc = 'Fascynujące dowody naukowe, archeologia biblijna i harmonia nauki ze Słowem Bożym.';
                badge = '🔬 NAUKA & WIARA';
                ctaText = 'Otwórz Portal Nauka ➔';
                img = 'https://polskieradio.cc/images/si/si-imago-dei.webp';
                icon = 'fa-solid fa-atom';
            } else if (pathname.includes('/historia')) {
                title = 'CCN Historia i Proroctwa • Dzieje Świata w Świetle Biblii';
                desc = 'Analizy historyczne, wypełnione proroctwa i prawda o minionych wiekach.';
                badge = '📜 HISTORIA & ARCHEO';
                ctaText = 'Otwórz Portal Historia ➔';
                img = 'https://polskieradio.cc/assets/prawda-bez-filtra-scene-960.webp';
                icon = 'fa-solid fa-scroll';
            } else if (pathname.includes('/biologia')) {
                title = 'CCN Biologia i Kreacja • Niezwykły Projekt Życia';
                desc = 'Projekt w naturze, genetyka, inteligentny projekt i dowody na stworzenie.';
                badge = '🧬 BIOLOGIA & KREACJA';
                ctaText = 'Otwórz Portal Biologia ➔';
                img = 'https://polskieradio.cc/images/player/art-dna.jpg';
                icon = 'fa-solid fa-dna';
            } else if (pathname.includes('/prawo')) {
                title = 'CCN Prawo i Wolność • Boże Prawo i Wolność Sumienia';
                desc = 'Etyka, wolność religijna i Boży Dekalog we współczesnym świecie.';
                badge = '⚖️ PRAWO & ETYKA';
                ctaText = 'Otwórz Portal Prawo ➔';
                img = 'https://polskieradio.cc/assets/kod-zrodlowy-scene-960.webp';
                icon = 'fa-solid fa-scale-balanced';
            } else if (pathname.includes('/seks') || pathname.includes('relacje') || pathname.includes('malzenstwo')) {
                title = 'CCN Relacje i Małżeństwo • Czystość i Prawdziwa Miłość';
                desc = 'Biblijny fundament miłości, relacji narzeczeńskich i trwałego małżeństwa.';
                badge = '❤️ MAŁŻEŃSTWO & CZYSTOŚĆ';
                ctaText = 'Otwórz Portal Relacje ➔';
                img = 'https://polskieradio.cc/nie-bylejaki-kurs-malzenski.webp';
                icon = 'fa-solid fa-heart';
            } else if (pathname.includes('/akademia') || pathname.includes('kurscodzienny') || pathname.includes('dzien-') || url.includes('dzien-')) {
                const dayMatch = (pathname + ' ' + url).match(/dzien[_-](\d+)/i);
                if (dayMatch) {
                    const dayNum = parseInt(dayMatch[1], 10);
                    const dailyLessonsMeta = {
                        1: { title: 'Dzień 1: NA POCZĄTKU BÓG — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 1. Zanim powstał świat, zanim pojawił się grzech — był Bóg.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_01_creation.jpg' },
                        2: { title: 'Dzień 2: STWORZENI DO RELACJI Z BOGIEM — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 2. Odpoczynek, praca, bliskość i małżeństwo — Rdz 2:1–25.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_02_eden.jpg' },
                        3: { title: 'Dzień 3: GDZIE JESTEŚ? — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 3. Upadek człowieka i pierwsza obietnica Ewangelii — Rdz 3:1–24.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_03_fall.jpg' },
                        4: { title: 'Dzień 4: DWA SERCA, DWIE DROGI — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 4. Kain i Abel — Rdz 4:1–26.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_04_cain_abel.jpg' },
                        5: { title: 'Dzień 5: CHODZIĆ Z BOGIEM, GDY ŚWIAT OD NIEGO ODCHODZI — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 5. Henoch i Noe — Rdz 5:1–6:8.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_05_henoch_noe.jpg' },
                        6: { title: 'Dzień 6: ARKA — SĄD I RATUNEK — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 6. Arka, potop i ocalenie Noego — Rdz 6:9–8:22.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_06_ark_flood_noah.jpg' },
                        7: { title: 'Dzień 7: TĘCZA: BÓG ZAWIERA PRZYMIERZE — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 7. Przymierze, tęcza i upadek Noego — Rdz 9:1–29.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_07_rainbow_covenant.jpg' },
                        8: { title: 'Dzień 8: BABEL: KIEDY CZŁOWIEK CHCE UCZYNIĆ SOBIE IMIĘ — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 8. Narody, wieża Babel i droga do Abrahama — Rdz 10:1–11:32.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_08_tower_of_babel.jpg' },
                        9: { title: 'Dzień 9: WYJDŹ! WIARA, KTÓRA RUSZA W DROGĘ — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 9. Powołanie Abrama — Rdz 12:1–20.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_09_abram_calling.jpg' },
                        10: { title: 'Dzień 10: DWIE DROGI WYBORU — Abram i Lot — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 10. Abram i Lot — Rdz 13:1–14:24.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_10_abram_lot.jpg' },
                        11: { title: 'Dzień 11: UWIERZYŁ PANU — I ZOSTAŁ UZNANY ZA SPRAWIEDLIWEGO — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 11. Abraham, gwiazdy i przymierze łaski — Rdz 15:1–21.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_11_abram_gwiazdy.jpg' },
                        12: { title: 'Dzień 12: GDY CZŁOWIEK PRÓBUJE POMÓC BOGU — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 12. Hagar, Ismael i Abraham — obietnica, cierpliwość i Bóg, który widzi — Rdz 16:1–17:27.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_12_hagar_pustynia.jpg' },
                        13: { title: 'Dzień 13: CZY JEST COŚ ZBYT TRUDNEGO DLA PANA? — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 13. Bóg dotrzymuje obietnic, a Abraham wstawia się za grzesznikami — Rdz 18:1–33.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_13_mamre_goscie.jpg' },
                        14: { title: 'Dzień 14: SODOMA: ŁASKA, SĄD I RATUNEK — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 14. Gdy Bóg wyprowadza człowieka z miejsca zagłady — Rdz 19:1–38.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_14_sodoma_lot.jpg' },
                        15: { title: 'Dzień 15: BÓG DOTRZYMUJE OBIETNICY — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 15. Gdy ludzkie możliwości się kończą, Boża wierność pozostaje — Rdz 20:1–21:34.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_15_isaac_obietnica.jpg' },
                        16: { title: 'Dzień 16: BÓG SAM ZAPEWNI BARANKA — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 16. Abraham i Izaak — wiara poddana największej próbie — Rdz 22:1–24.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_16_baranek_moria.jpg' },
                        17: { title: 'Dzień 17: WIARA PATRZĄCA W PRZYSZŁOŚĆ — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 17. Gdy przychodzi strata, a Boża obietnica trwa nadal — Rdz 23:1–24:67.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_17_machpela_rebeka.jpg' },
                        18: { title: 'Dzień 18: JAKUB I EZAW — CZEGO NAPRAWDĘ PRAGNIESZ? — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 18. Chwilowe pragnienia nie powinny przesłaniać duchowego dziedzictwa — Rdz 25:1–26:35.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_18_jakub_ezaw.jpg' },
                        19: { title: 'Dzień 19: GDY PRÓBUJEMY POMÓC BOGU OSZUSTWEM — Z Biblią za Pan Brat', desc: 'Księga Rodzaju — Miesiąc 1, Dzień 19. Boża obietnica nie potrzebuje kłamstwa ani manipulacji — Rdz 27:1–46.', img: 'https://polskieradio.cc/images/academy/daily/kc_day_19_jakub_izaak_podstep.jpg' }
                    };
                    const dMeta = dailyLessonsMeta[dayNum];
                    if (dMeta) {
                        title = dMeta.title;
                        desc = dMeta.desc;
                        img = dMeta.img;
                    } else {
                        title = `Dzień ${dayNum}: Kurs Codzienny Pisma Świętego — Z Biblią za Pan Brat`;
                        desc = `Studiuj Słowo Boże dzień po dniu w Akademii Biblijnej Christian Culture.`;
                        img = `https://polskieradio.cc/images/academy/daily/kc_day_${String(dayNum).padStart(2, '0')}.jpg`;
                    }
                    badge = `📖 DZIEŃ ${dayNum} • KURS CODZIENNY`;
                    ctaText = `Czytaj Dzień ${dayNum} ➔`;
                    icon = 'fa-solid fa-book-bible';
                } else {
                    title = 'Akademia Biblijna • Codzienny Kurs „Z Biblią za Pan Brat”';
                    desc = 'Kompletny 365-dniowy bezpłatny kurs biblijny od Księgi Rodzaju po Apokalipsę.';
                    badge = '📖 AKADEMIA BIBLIJNA';
                    ctaText = 'Rozpocznij Kurs ➔';
                    img = 'https://polskieradio.cc/images/academy/z_biblia_za_pan_brat_hero.jpg';
                    icon = 'fa-solid fa-book-bible';
                }
            } else if (pathname.includes('mojabiblia')) {
                title = 'MojaBiblia • Interlinearna Biblia z Kodami Stronga';
                desc = 'Badaj teksty hebrajskie i greckie, leksykon i porównuj 4 przekłady biblijne.';
                badge = '📜 MOJA BIBLIA';
                ctaText = 'Badaj Pismo ➔';
                img = 'https://polskieradio.cc/reklama_telebiblia_wikifaith_916.jpg';
                icon = 'fa-solid fa-book-open';
            } else if (pathname.includes('player')) {
                title = 'PLAYER CC • Spotify-Style Audio Dashboard';
                desc = 'Strumień radiowy w jakości bezstratnej, teksty pieśni, kanały tematyczne i odsłuch w tle.';
                badge = '🎵 PLAYER CC';
                ctaText = 'Słuchaj Muzyki ➔';
                img = 'https://polskieradio.cc/images/player/player-clean-art.jpg';
                icon = 'fa-solid fa-music';
            } else if (pathname.includes('vod')) {
                title = 'Kino Chrześcijańskie VOD • Christian Culture';
                desc = 'Oglądaj pełnometrażowe filmy chrześcijańskie, dokumenty i wartościowe produkcje filmowe bez opłat.';
                badge = '🎬 VOD CHRISTIAN CULTURE';
                ctaText = 'Oglądaj Film 🍿';
                img = 'https://polskieradio.cc/vod_hity_kina_poster.jpg';
                icon = 'fa-solid fa-film';
            } else if (pathname.includes('wspieraj')) {
                title = 'Wspieraj misję Christian Culture • Razem niesiemy nadzieję';
                desc = 'Nie każdy może dać pieniądze. Każdy może pomóc nieść Ewangelię dalej. Wesprzyj nas przez modlitwę, BLIK, przelew, Patronite lub udostępnianie.';
                badge = '🤝 WSPIERAJ MISJĘ CC';
                ctaText = 'Wspieraj Dzieło Boże ➔';
                img = 'https://polskieradio.cc/assets/cc-support/social.jpg';
                icon = 'fa-solid fa-hand-holding-heart';
            } else if (pathname.includes('lumina')) {
                title = 'Portal Społecznościowy LUMINA ✨';
                desc = 'Pierwszy polski chrześcijański portal społecznościowy. Łączymy wierzących, dzielimy się Słowem i świadectwami.';
                badge = '🕊️ PORTAL LUMINA';
                ctaText = 'Przejdź do Portalu 🕊️';
                img = 'https://polskieradio.cc/lumina_cover_bg.jpg';
                icon = 'fa-solid fa-users-rays';
            }

            return {
                url: url,
                host: 'Polskie Radio Christian Culture',
                domain: host,
                title,
                description: desc,
                image: img,
                badge,
                ctaText,
                icon
            };
        }

        // 3. Patronite (Wsparcie Misji CC)
        if (host.includes('patronite.pl')) {
            return {
                url: url,
                host: 'Patronite • Christian Culture',
                domain: host,
                title: 'Wspieraj Misję Ewangelizacyjną Christian Culture',
                description: 'Dołącz do grona Patronów i twórz z nami pierwsze w Polsce chrześcijańskie media nowej generacji.',
                image: 'https://polskieradio.cc/logo-glowne.png',
                badge: '💖 SPOŁECZNOŚĆ PATRONÓW',
                ctaText: 'Zostań Patronem 💖',
                icon: 'fa-solid fa-hand-holding-heart'
            };
        }

        // 4. Spotify
        if (host.includes('spotify.com')) {
            return {
                url: url,
                host: 'Spotify Music & Podcast',
                domain: host,
                title: 'Posłuchaj w serwisie Spotify',
                description: 'Odtwórz muzykę uwielbienia lub podcast chrześcijański bezpośrednio na platformie Spotify.',
                image: '',
                badge: '🎵 SPOTIFY STREAMING',
                ctaText: 'Odtwórz na Spotify 🎧',
                icon: 'fa-brands fa-spotify'
            };
        }

        // 5. Facebook
        if (host.includes('facebook.com') || host.includes('fb.watch')) {
            return {
                url: url,
                host: 'Facebook',
                domain: host,
                title: 'Zobacz materiał w serwisie Facebook',
                description: 'Oficjalny wpis, transmisja wideo lub aktualność w serwisie społecznościowym Facebook.',
                image: '',
                badge: '📱 FACEBOOK SOCIAL',
                ctaText: 'Zobacz na Facebooku ↗',
                icon: 'fa-brands fa-facebook'
            };
        }

        // 6. Instagram
        if (host.includes('instagram.com')) {
            return {
                url: url,
                host: 'Instagram',
                domain: host,
                title: 'Zobacz zdjęcie lub relację na Instagramie',
                description: 'Profil społecznościowy, fotografia lub relacja w serwisie Instagram.',
                image: '',
                badge: '📸 INSTAGRAM',
                ctaText: 'Zobacz na Instagramie ↗',
                icon: 'fa-brands fa-instagram'
            };
        }

        // 7. Generic URL
        return {
            url: url,
            host: host.toUpperCase(),
            domain: host,
            title: host.toUpperCase(),
            description: 'Otwórz stronę w nowej karcie...',
            image: '',
            badge: '🔗 ODNOŚNIK ZEWNĘTRZNY',
            ctaText: 'Odwiedź stronę ↗',
            icon: 'fa-solid fa-globe'
        };
    } catch(e) {
        return null;
    }
}

/**
 * Creates rich HTML card for OpenGraph/link preview
 */
export function createRichOpenGraphCardHtml(meta) {
    if (!meta || !meta.url) return '';
    const safeUrl = escapeHtml(meta.url);
    const safeHost = escapeHtml(meta.host || meta.domain || 'Odnośnik');
    const safeTitle = escapeHtml(meta.title || meta.url);
    const safeDesc = escapeHtml(meta.description || '');
    const safeBadge = escapeHtml(meta.badge || '🔗 ODNOŚNIK');
    const safeCta = escapeHtml(meta.ctaText || 'Otwórz stronę ↗');
    const safeIcon = meta.icon || 'fa-solid fa-globe';
    const isStore = !!meta.isStore;
    const hasImage = meta.image && String(meta.image).trim().length > 0;

    return `
        <div class="rich-og-card ${isStore ? 'rich-og-card-store' : ''}" data-og-url="${safeUrl}" onclick="event.stopPropagation()">
            <div class="rich-og-thumb-wrapper" style="${hasImage ? '' : 'display:none;'}">
                <img src="${hasImage ? escapeHtml(meta.image) : ''}" alt="${safeTitle}" class="rich-og-thumb" loading="lazy" onerror="this.closest('.rich-og-thumb-wrapper').style.display='none';">
                <div class="rich-og-floating-badge"><i class="${safeIcon}"></i> ${safeBadge}</div>
            </div>
            ${!hasImage ? `
                <div class="rich-og-top-bar">
                    <span class="rich-og-floating-badge static"><i class="${safeIcon}"></i> ${safeBadge}</span>
                </div>
            ` : ''}
            <div class="rich-og-body">
                <div class="rich-og-host"><i class="${safeIcon}" style="color:${isStore ? '#f59e0b' : '#38bdf8'};"></i> ${safeHost}</div>
                <h4 class="rich-og-title">${safeTitle}</h4>
                ${safeDesc ? `<p class="rich-og-desc">${safeDesc}</p>` : ''}
                <div class="rich-og-action-row">
                    <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="rich-og-cta ${isStore ? 'store-cta' : ''}">
                        <span>${safeCta}</span> <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.75rem;"></i>
                    </a>
                </div>
            </div>
        </div>
    `;
}

/**
 * Fetches real OpenGraph metadata asynchronously via Microlink API, with localStorage & memory caching
 */
export async function fetchLinkOpenGraphMetadata(url) {
    if (!url) return null;
    const baseMeta = getHeuristicLinkMetadata(url) || { url, host: '', title: '', description: '', image: '' };

    // Czyszczenie starego legacy cache (lumina_og_ -> lumina_og_v5_)
    try {
        if (typeof localStorage !== 'undefined') {
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const k = localStorage.key(i);
                if (k && k.startsWith('lumina_og_') && !k.startsWith('lumina_og_v5_')) {
                    localStorage.removeItem(k);
                }
            }
        }
    } catch(e) {}

    // Dedykowany priorytet dla podstrony wsparcia /wspieraj
    if (url.includes('wspieraj')) {
        _luminaOgCache.set(url, baseMeta);
        return baseMeta;
    }
    
    // Check in-memory cache
    if (_luminaOgCache.has(url)) {
        return _luminaOgCache.get(url);
    }

    // Check localStorage cache (TTL: 7 days)
    let cacheKey = 'lumina_og_v5_';
    try {
        cacheKey += btoa(encodeURIComponent(url)).slice(0, 32);
        const raw = localStorage.getItem(cacheKey);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Date.now() - parsed.ts < 7 * 24 * 60 * 60 * 1000) {
                _luminaOgCache.set(url, parsed.data);
                return parsed.data;
            }
        }
    } catch(e) {}

    try {
        const resp = await fetch('https://api.microlink.io?url=' + encodeURIComponent(url));
        if (resp.ok) {
            const json = await resp.json();
            if (json && json.status === 'success' && json.data) {
                const d = json.data;
                let resolvedImg = d.image?.url || baseMeta.image;
                if (resolvedImg && (resolvedImg.includes('polskieradio.cc/images/') || resolvedImg.includes('polskieradio.cc/assets/'))) {
                    resolvedImg = resolvedImg.replace(/^https?:\/\/(?:www\.)?polskieradio\.cc/, '');
                }
                const merged = {
                    ...baseMeta,
                    title: d.title || baseMeta.title,
                    description: d.description || baseMeta.description,
                    image: resolvedImg,
                    publisher: d.publisher || baseMeta.host,
                    logo: d.logo?.url || null
                };
                if (d.publisher && !baseMeta.isStore) {
                    merged.host = d.publisher;
                }
                _luminaOgCache.set(url, merged);
                try {
                    localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: merged }));
                } catch(e) {}
                return merged;
            }
        }
    } catch(err) {
        console.warn('LuminaDB fetchLinkOpenGraphMetadata network error:', err);
    }

    _luminaOgCache.set(url, baseMeta);
    return baseMeta;
}

/**
 * Hydrates all .rich-og-card elements in a container with real OpenGraph image and text
 */
export function hydrateOpenGraphCards(container = document) {
    if (!container) return;
    const cards = container.querySelectorAll('.rich-og-card[data-og-url]');
    cards.forEach(async (card) => {
        const url = card.getAttribute('data-og-url');
        if (!url || card.getAttribute('data-og-hydrated') === 'true') return;
        card.setAttribute('data-og-hydrated', 'true');

        try {
            const meta = await fetchLinkOpenGraphMetadata(url);
            if (!meta) return;

            // Update title
            const titleEl = card.querySelector('.rich-og-title');
            if (titleEl && meta.title && meta.title !== titleEl.textContent) {
                titleEl.textContent = meta.title;
            }

            // Update description
            const descEl = card.querySelector('.rich-og-desc');
            if (descEl && meta.description) {
                descEl.textContent = meta.description;
            } else if (!descEl && meta.description) {
                const p = document.createElement('p');
                p.className = 'rich-og-desc';
                p.textContent = meta.description;
                const body = card.querySelector('.rich-og-body');
                const actionRow = card.querySelector('.rich-og-action-row');
                if (body && actionRow) body.insertBefore(p, actionRow);
            }

            // Update or show image & floating badge
            if (meta.image) {
                let thumbWrapper = card.querySelector('.rich-og-thumb-wrapper');
                let thumbImg = card.querySelector('.rich-og-thumb');
                if (thumbWrapper && thumbImg) {
                    if (thumbImg.src !== meta.image) {
                        thumbImg.src = meta.image;
                    }
                    thumbWrapper.style.display = '';
                    const badgeEl = thumbWrapper.querySelector('.rich-og-floating-badge');
                    if (badgeEl && meta.badge) {
                        badgeEl.innerHTML = `<i class="${meta.icon || 'fa-solid fa-globe'}"></i> ${escapeHtml(meta.badge)}`;
                    }
                } else if (!thumbWrapper) {
                    thumbWrapper = document.createElement('div');
                    thumbWrapper.className = 'rich-og-thumb-wrapper';
                    thumbWrapper.innerHTML = `
                        <img src="${escapeHtml(meta.image)}" alt="${escapeHtml(meta.title || '')}" class="rich-og-thumb" loading="lazy" onerror="this.closest('.rich-og-thumb-wrapper').style.display='none';">
                        <div class="rich-og-floating-badge"><i class="${meta.icon || 'fa-solid fa-globe'}"></i> ${escapeHtml(meta.badge || 'LINK')}</div>
                    `;
                    card.insertBefore(thumbWrapper, card.firstChild);
                }
                const topBar = card.querySelector('.rich-og-top-bar');
                if (topBar) topBar.remove();
            }
        } catch(e) {}
    });
}

export function formatRichTextAndMedia(rawText, postData = null) {
    if (!rawText && (!postData || !postData.linkPreview)) return { html: '', embedHtml: '', urls: [] };
    
    // 1. Zabezpieczenie przed XSS (Sanityzacja znaczników HTML)
    const sanitizedText = escapeHtml(rawText || '');

    // Używamy tokenizera placeholderów, aby zapobiec zagnieżdżaniu tagów <a> wewnątrz już wygenerowanych <a>
    const linkPlaceholders = [];
    function stashLink(html) {
        const id = `___LUMINA_LNK_${linkPlaceholders.length}___`;
        linkPlaceholders.push(html);
        return id;
    }

    // 0. Rozpoznanie i zamiana linku wsparcia Patronite na aktywny lśniący przycisk (schowany w tokenie)
    let placeholderText = sanitizedText.replace(/(?:(?:Wspomóż misję|Wspieraj Bożą misję|Wsparcie misji|Wspieraj misję|Zostań patronem|Patronite)\s*:?\s*)?(?:https?:\/\/)?(?:www\.)?patronite\.pl\/([a-zA-Z0-9_-]+)/gi, (match, slug) => {
        const targetSlug = (slug && slug.toLowerCase() !== 'patronite') ? slug : 'osobowoscplus';
        const url = `https://patronite.pl/${targetSlug}`;
        return stashLink(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="reflection-smart-link support-link" onclick="event.stopPropagation()"><i class="fa-solid fa-heart" style="color:#ef4444;"></i> Wesprzyj Misję na Patronite <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`);
    });

    // Regex for URLs, www domains, and bare domains
    const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/gi;
    const foundUrls = placeholderText.match(urlRegex) || [];

    // 1. Zamiana pełnych URLs (http/https) na aktywne linki (schowane w tokenach)
    placeholderText = placeholderText.replace(urlRegex, (url) => {
        let display = url.replace(/^https?:\/\/(www\.)?/, '');
        if (display.length > 38) display = display.substring(0, 35) + '...';
        const safeUrl = encodeURI(url).replace(/"/g, '&quot;');
        return stashLink(`<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="post-rich-link lumina-post-link" onclick="event.stopPropagation()"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.72rem;"></i> ${display}</a>`);
    });

    // 2. Zamiana adresów www. (bez protokołu)
    placeholderText = placeholderText.replace(/(^|[\s(])(www\.[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+[^\s<]*)/gi, (match, p1, rawDomain) => {
        let domain = rawDomain;
        let trail = '';
        const trailMatch = domain.match(/[.,:;!?)\]]+$/);
        if (trailMatch) {
            trail = trailMatch[0];
            domain = domain.slice(0, -trail.length);
        }
        let display = domain;
        if (display.length > 38) display = display.substring(0, 35) + '...';
        return `${p1}${stashLink(`<a href="https://${domain}" target="_blank" rel="noopener noreferrer" class="post-rich-link lumina-post-link" onclick="event.stopPropagation()"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.72rem;"></i> ${display}</a>`)}${trail}`;
    });

    // 3. Zamiana domen bazowych bez protokołu (np. apokalipsa.online, studiods.pl, polskieradio.cc)
    const tlds = 'online|pl|cc|com|org|net|eu|tv|live|app|edu|gov|io|info|biz|me|fm|ai|co';
    const bareDomainRegex = new RegExp('(^|[\\s(])([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.(?:' + tlds + ')(?:\\/[^\\s<]*)?)', 'gi');
    placeholderText = placeholderText.replace(bareDomainRegex, (match, p1, rawDomain) => {
        if (match.includes('___LUMINA_LNK_')) return match;
        let domain = rawDomain;
        let trail = '';
        const trailMatch = domain.match(/[.,:;!?)\]]+$/);
        if (trailMatch) {
            trail = trailMatch[0];
            domain = domain.slice(0, -trail.length);
        }
        if (!foundUrls.includes('https://' + domain)) foundUrls.push('https://' + domain);
        let display = domain;
        if (display.length > 38) display = display.substring(0, 35) + '...';
        return `${p1}${stashLink(`<a href="https://${domain}" target="_blank" rel="noopener noreferrer" class="post-rich-link lumina-post-link" onclick="event.stopPropagation()"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.72rem;"></i> ${display}</a>`)}${trail}`;
    });

    // Replace @mentions with clickable profile pills (schowane w tokenach)
    placeholderText = placeholderText.replace(/(^|[\s>(])@([a-zA-Z0-9_]+)/g, (match, p1, handle) => {
        const hInfo = resolveMentionHandle(handle);
        const nameAttr = (hInfo && hInfo.name) ? escapeHtml(hInfo.name) : escapeHtml(handle);
        const urlAttr = (hInfo && hInfo.url) ? encodeURI(hInfo.url) : `lumina-profile.html?u=${encodeURIComponent(handle)}`;
        return `${p1}${stashLink(`<a href="${urlAttr}" class="lumina-mention-pill" title="Przejdź do profilu: ${nameAttr}" onclick="event.stopPropagation()"><i class="fa-solid fa-at"></i>${escapeHtml(handle)}</a>`)}`;
    });

    // Replace #hashtags with clickable search pills (schowane w tokenach)
    placeholderText = placeholderText.replace(/(^|[\s>(])#([a-zA-Z0-9_ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+)/g, (match, p1, tag) => {
        const safeTag = escapeHtml(tag);
        const encTag = encodeURIComponent(tag);
        return `${p1}${stashLink(`<a href="lumina-tablica.html?q=%23${encTag}" class="lumina-hashtag-pill" data-tag="${safeTag}" title="Filtruj wpisy #${safeTag}" onclick="if(window.filterFeedByTag){event.preventDefault();event.stopPropagation();window.filterFeedByTag('${safeTag}');}else{event.stopPropagation();}"><i class="fa-solid fa-hashtag"></i>${safeTag}</a>`)}`;
    });

    // Replace linebreaks with <br>
    placeholderText = placeholderText.replace(/\n/g, '<br>');

    // 4. Przywróć wszystkie linki z tokenów
    let formattedText = placeholderText;
    linkPlaceholders.forEach((html, idx) => {
        formattedText = formattedText.replace(`___LUMINA_LNK_${idx}___`, html);
    });

    // Generate Rich Embed Card if URL is present or iframe is embedded
    let embedHtml = '';
    let linkMeta = null;

    if (postData && postData.linkPreview) {
        embedHtml = createRichOpenGraphCardHtml(postData.linkPreview);
        linkMeta = postData.linkPreview;
    }

    // Check if rawText contains direct YouTube iframe
    if (!embedHtml && rawText && rawText.includes('<iframe') && (rawText.includes('youtube.com') || rawText.includes('youtu.be'))) {
        const srcMatch = rawText.match(/src=["'](https?:\/\/[^"']+)["']/i);
        if (srcMatch && srcMatch[1]) {
            let embedSrc = srcMatch[1].replace(/&amp;/g, '&');
            embedHtml = `
                <div class="rich-youtube-embed">
                    <iframe src="${escapeHtml(embedSrc)}" 
                            title="Odtwarzacz wideo YouTube" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerpolicy="strict-origin-when-cross-origin"
                            allowfullscreen></iframe>
                </div>
            `;
        }
    }

    if (!embedHtml && foundUrls.length > 0) {
        const firstUrl = foundUrls[0];
        const playlistId = extractYouTubePlaylistId(firstUrl);
        const ytId = extractYouTubeId(firstUrl);

        if (playlistId && (firstUrl.includes('videoseries') || firstUrl.includes('playlist') || !ytId)) {
            // YouTube Playlist Embed
            embedHtml = `
                <div class="rich-youtube-embed">
                    <iframe src="https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(playlistId)}&rel=0&modestbranding=1" 
                            title="Odtwarzacz playlisty YouTube" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerpolicy="strict-origin-when-cross-origin"
                            allowfullscreen></iframe>
                </div>
            `;
        } else if (ytId) {
            // YouTube Interactive Video Player Embed
            embedHtml = `
                <div class="rich-youtube-embed">
                    <iframe src="https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1${playlistId ? `&list=${encodeURIComponent(playlistId)}` : ''}" 
                            title="Odtwarzacz wideo YouTube" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerpolicy="strict-origin-when-cross-origin"
                            allowfullscreen></iframe>
                </div>
            `;
        } else if (firstUrl.includes('drive.google.com') || firstUrl.includes('docs.google.com')) {
            const gdriveData = parseGoogleDriveUrl(firstUrl);
            if (gdriveData) {
                embedHtml = createGoogleDriveEmbedHtml(gdriveData);
            }
        } else {
            // Social Media / OpenGraph Style Rich Preview Card
            linkMeta = getHeuristicLinkMetadata(firstUrl);
            if (linkMeta) {
                embedHtml = createRichOpenGraphCardHtml(linkMeta);
            }
        }
    }

    return {
        html: formattedText,
        embedHtml: embedHtml,
        urls: foundUrls,
        linkPreview: linkMeta
    };
}

