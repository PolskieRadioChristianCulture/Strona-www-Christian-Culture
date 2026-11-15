/**
 * LUMINA Daily Devotional Formatter & Unified Loader ("Dobrze, że jesteś")
 * Canonical source order:
 *   1. Firebase `cuda-398c0 / reflections` (Aplikacja „Dobrze, że jesteś” — REST runQuery)
 *   2. Firebase `cc-mission-control / web_inspirations` (WWW enrichment & fallback)
 *   3. Local `/rozwazania_baza.json` archive (Offline / quota fallback)
 */
let _devFs = {};
const _reflectionCache = new Map();

export function configureDevotionalFeed(deps = {}) {
    _devFs = { ..._devFs, ...deps };
}

function decodeFirestoreValue(val) {
    if (!val || typeof val !== 'object') return undefined;
    if ('stringValue' in val) return val.stringValue;
    if ('integerValue' in val) return Number(val.integerValue);
    if ('doubleValue' in val) return Number(val.doubleValue);
    if ('booleanValue' in val) return Boolean(val.booleanValue);
    if ('timestampValue' in val) return val.timestampValue;
    if ('nullValue' in val) return null;
    if ('arrayValue' in val) {
        return Array.isArray(val.arrayValue?.values)
            ? val.arrayValue.values.map(decodeFirestoreValue)
            : [];
    }
    if ('mapValue' in val) {
        return decodeFirestoreFields(val.mapValue?.fields || {});
    }
    return undefined;
}

function decodeFirestoreFields(fields = {}) {
    const out = {};
    for (const [k, v] of Object.entries(fields)) {
        const decoded = decodeFirestoreValue(v);
        if (decoded !== undefined) out[k] = decoded;
    }
    return out;
}

async function fetchFromCudaReflections(todayStr, fetchImpl = typeof fetch === 'function' ? fetch : null) {
    if (!fetchImpl) return null;
    const url = 'https://firestore.googleapis.com/v1/projects/cuda-398c0/databases/(default)/documents:runQuery';
    const body = {
        structuredQuery: {
            from: [{ collectionId: 'reflections' }],
            where: {
                fieldFilter: {
                    field: { fieldPath: 'date' },
                    op: 'LESS_THAN_OR_EQUAL',
                    value: { stringValue: todayStr }
                }
            },
            orderBy: [{ field: { fieldPath: 'date' }, direction: 'DESCENDING' }],
            limit: 5
        }
    };
    const res = await fetchImpl(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`cuda-398c0 HTTP ${res.status}`);
    const rows = await res.json();
    if (!Array.isArray(rows)) return null;
    const docs = rows
        .map((r) => {
            if (!r?.document?.fields) return null;
            const docId = String(r.document.name || '').split('/').pop() || '';
            return { id: docId, _source: 'cuda-398c0/reflections', ...decodeFirestoreFields(r.document.fields) };
        })
        .filter((d) => d && d.date && d.date <= todayStr);
    return docs.find((d) => d.date === todayStr) || docs[0] || null;
}

async function fetchFromMissionControlWeb(todayStr) {
    const { getApps, initializeApp, getFirestore, collection, query, orderBy, limit, getDocs } = _devFs;
    if (!getApps || !initializeApp || !getFirestore) return null;
    const mcConfig = {
        apiKey: "AIzaSyDou1gYyuJnuF2WocXEqglfRPqqwMm0Ge4",
        authDomain: "cc-mission-control.firebaseapp.com",
        projectId: "cc-mission-control",
        storageBucket: "cc-mission-control.firebasestorage.app",
        messagingSenderId: "519207260358",
        appId: "1:519207260358:web:d875a610f438ecad2c47c7"
    };
    const existingApps = getApps();
    let mcApp = existingApps.find((a) => a.name === 'lumina-mc');
    if (!mcApp) mcApp = initializeApp(mcConfig, 'lumina-mc');
    const mcDb = getFirestore(mcApp);
    const q = query(collection(mcDb, 'web_inspirations'), orderBy('date', 'desc'), limit(10));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const validDocs = snap.docs
        .map((docSnap) => ({ id: docSnap.id, _source: 'cc-mission-control/web_inspirations', ...docSnap.data() }))
        .filter((d) => d.date && d.date <= todayStr);
    return validDocs.find((d) => d.date === todayStr) || validDocs[0] || null;
}

async function fetchFromLocalArchiveJson(todayStr, fetchImpl = typeof fetch === 'function' ? fetch : null) {
    if (!fetchImpl) return null;
    const res = await fetchImpl('/rozwazania_baza.json?v=' + Date.now());
    if (!res.ok) return null;
    const list = await res.json();
    if (!Array.isArray(list) || list.length === 0) return null;
    const validList = list.filter((r) => r.date && r.date <= todayStr);
    const match = validList.find((r) => r.date === todayStr) || validList[0] || null;
    return match ? { _source: 'rozwazania_baza.json', ...match } : null;
}

// ══════════════════════════════════════════════════════════════════════════
// STANDARD FORMATOWANIA ROZWAŻAŃ: DOBRZE, ŻE JESTEŚ • CHRISTIAN CULTURE PREMIUM
// Reguła portalu: Żadne surowe adresy URL ani niebieskie linki nie są widoczne w tekście.
// Każdy link jest eleganckim, lśniącym przyciskiem funkcyjnym z polską etykietą!
// ══════════════════════════════════════════════════════════════════════════
export function formatLuminaDevotionalContent(rawText) {
    if (!rawText) return '';
    let text = rawText;

    // 0. Markdown bold i italic
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // 1. WhatsApp invite -> zamień na elegancki zielony przycisk
    text = text.replace(/(?<!["'/])(?:https?:\/\/)?(?:www\.)?chat\.whatsapp\.com\/([a-zA-Z0-9_-]+)(?:\s*[-–—]?\s*(?:Wejdź do zespołu ludzi z pasją!?|Dołącz do grupy WhatsApp!?))?/gi, (match, inviteCode) => {
        const url = `https://chat.whatsapp.com/${inviteCode || 'DBTRDxQWamZDWaOkjupSt0'}`;
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="reflection-smart-link whatsapp-link"><i class="fa-brands fa-whatsapp"></i> Wejdź do zespołu ludzi z pasją! (Grupa WhatsApp) <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 2. Google Play Apps -> zamień na złoty przycisk aplikacji
    text = text.replace(/(?:Apps:\s*)?https?:\/\/play\.google\.com\/store\/apps\/[^\s<)]+/gi, (match) => {
        const url = match.replace(/^Apps:\s*/i, '').trim();
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="reflection-smart-link apps-link"><i class="fa-brands fa-google-play"></i> Pobierz bezpłatne aplikacje w Google Play <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 3a. Lumina Portal
    text = text.replace(/(?<!["'/])(?:https?:\/\/)?(?:www\.)?polskieradio\.cc\/lumina[a-zA-Z0-9_/-]*/gi, () => {
        return `<a href="https://www.polskieradio.cc/lumina" target="_blank" rel="noopener noreferrer" class="reflection-smart-link radio-link"><i class="fa-solid fa-users-rays"></i> Portal Społeczności LUMINA <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 3b. Polskie Radio CC
    text = text.replace(/(?<!["'/])(?:https?:\/\/)?(?:www\.)?polskieradio\.cc(?!\/[a-zA-Z0-9_/-])/gi, () => {
        return `<a href="https://www.polskieradio.cc" target="_blank" rel="noopener noreferrer" class="reflection-smart-link radio-link"><i class="fa-solid fa-radio"></i> Polskie Radio Christian Culture <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 4. CC Lite -> zamień na różowy przycisk Telewizji CC Lite
    text = text.replace(/(?<!["'/])(?:https?:\/\/)?(?:www\.)?cclite\.pl[a-zA-Z0-9_/-]*/gi, () => {
        return `<a href="https://www.cclite.pl" target="_blank" rel="noopener noreferrer" class="reflection-smart-link tv-link"><i class="fa-solid fa-tv"></i> Telewizja CC Lite <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 5. Patronite / Wsparcie Misji -> zamień na aktywny przycisk ze serduszkiem
    text = text.replace(/(?<!["'/])(?:(?:Wspomóż misję|Wspieraj Bożą misję|Wsparcie misji|Wspieraj misję|Zostań patronem|Patronite)\s*:?\s*)?(?:https?:\/\/)?(?:www\.)?patronite\.pl\/([a-zA-Z0-9_-]+)/gi, (match, slug) => {
        const targetSlug = (slug && slug.toLowerCase() !== 'patronite') ? slug : 'osobowoscplus';
        const url = `https://patronite.pl/${targetSlug}`;
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="reflection-smart-link support-link"><i class="fa-solid fa-heart" style="color:#ef4444;"></i> Wesprzyj Misję na Patronite <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 6. Revolut Wsparcie -> zamień na aktywny przycisk
    text = text.replace(/(?:(?:Wspomóż misję|Wspieraj Bożą misję|Darowizna|Revolut)\s*:?\s*)?(?:https?:\/\/)?(?:www\.)?revolut\.me\/([a-zA-Z0-9_-]+)/gi, (match, tag) => {
        const targetTag = tag || 'christianculture';
        const url = `https://revolut.me/${targetTag}`;
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="reflection-smart-link support-link"><i class="fa-solid fa-hand-holding-dollar" style="color:#ef4444;"></i> Wesprzyj przez Revolut <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 7. Oczyszczenie wiszących separatorów '|' między przyciskami smart-link
    text = text.replace(/(<\/a>)\s*\|\s*(?=<a [^>]*class="[^"]*reflection-smart-link)/gi, '$1 ');

    // 8. Usuń surowe pozostałości linków
    text = text.replace(/🌐\s*chat\.whatsapp\.com[^\s<]*/gi, '');
    text = text.replace(/CHAT\.WHATSAPP\.COM/gi, '');
    text = text.replace(/Otwórz stronę w nowej karcie\.\.\./gi, '');

    // 9. Markdown links [Tytuł](https://...)
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (match, label, url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="reflection-smart-link apps-link">${label} <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 10. Pozostałe URLs (http/https i www.) zamienione na eleganckie skrócone etykiety
    text = text.replace(/(^|[\s(])((https?:\/\/)[^\s<>"')]+)/gi, (match, prefix, url) => {
        let cleanUrl = url;
        let trailing = '';
        const punct = cleanUrl.match(/[.,;!?:)]+$/);
        if (punct) {
            trailing = punct[0];
            cleanUrl = cleanUrl.slice(0, -trailing.length);
        }
        let displayUrl = cleanUrl.replace(/^https?:\/\/(?:www\.)?/, '');
        if (displayUrl.length > 38) displayUrl = displayUrl.substring(0, 35) + '…';
        return `${prefix}<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="reflection-link lumina-post-link">${displayUrl} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.72rem; margin-left:3px;"></i></a>${trailing}`;
    });

    text = text.replace(/(^|[\s(])(www\.[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+[^\s<>"')]*)/gi, (match, prefix, rawDomain) => {
        let domain = rawDomain;
        let trailing = '';
        const punct = domain.match(/[.,;!?:)]+$/);
        if (punct) {
            trailing = punct[0];
            domain = domain.slice(0, -trailing.length);
        }
        let displayDomain = domain.replace(/^www\./, '');
        if (displayDomain.length > 38) displayDomain = displayDomain.substring(0, 35) + '…';
        return `${prefix}<a href="https://${domain}" target="_blank" rel="noopener noreferrer" class="reflection-link lumina-post-link">${displayDomain} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.72rem; margin-left:3px;"></i></a>${trailing}`;
    });

    // 11. Podział na akapity i formatowanie modułów (Pismo, Zadanie, Modlitwa, Kanały)
    return text
        .split(/\n\n+/)
        .filter((p) => p.trim())
        .map((p) => {
            const trimmed = p.trim();
            if (trimmed.startsWith('Jezus mówi dziś do Ciebie:') || trimmed.match(/^„[^”]+”\s*\([^)]+\)/)) {
                return `<div class="reflection-scripture-box"><div class="scripture-label"><i class="fa-solid fa-book-bible"></i> Jezus mówi dziś do Ciebie:</div><div class="scripture-quote">${trimmed.replace(/^Jezus mówi dziś do Ciebie:\s*/i, '').replace(/\n/g, '<br>')}</div></div>`;
            }
            if (trimmed.startsWith('Zadanie Taktyczne:')) {
                return `<div class="reflection-task-box"><div class="task-label"><i class="fa-solid fa-shield-halved"></i> Zadanie Taktyczne:</div><p style="margin:0; font-size:0.93rem; color:#f1f5f9; line-height:1.7;">${trimmed.replace(/^Zadanie Taktyczne:\s*/i, '').replace(/\n/g, '<br>')}</p></div>`;
            }
            if (trimmed.startsWith('Modlitwa Bojowa:') || trimmed.startsWith('Modlitwa:')) {
                return `<div class="reflection-prayer-box"><div class="prayer-label"><i class="fa-solid fa-hands-praying"></i> Modlitwa Bojowa:</div><p style="margin:0; font-style:italic; font-size:0.95rem; line-height:1.75; color:#f8fafc;">${trimmed.replace(/^(?:Modlitwa Bojowa|Modlitwa):\s*/i, '').replace(/\n/g, '<br>')}</p></div>`;
            }
            if (trimmed.startsWith('Baza i wzrost:') || trimmed.includes('PODAJ DALEJ') || trimmed.includes('reflection-smart-link')) {
                return `<div class="reflection-links-container"><div style="font-size:0.82rem; font-weight:800; color:#f59e0b; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:10px;"><i class="fa-solid fa-network-wired"></i> Społeczność & Kanały LUMINA</div>${trimmed.replace(/\n/g, '<br>')}</div>`;
            }
            return `<p style="margin:0 0 14px; line-height:1.75; color:inherit; font-size:0.94rem;">${trimmed.replace(/\n/g, '<br>')}</p>`;
        })
        .join('');
}

export async function fetchCanonicalDailyReflection(options = {}) {
    const now = options.now instanceof Date ? options.now : new Date();
    const pad = (n) => (n < 10 ? '0' + n : String(n));
    const todayStr = options.todayStr || `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    if (!options.forceRefresh && _reflectionCache.has(todayStr)) {
        return _reflectionCache.get(todayStr);
    }

    const dayNames = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
    const monthNames = ['Stycznia', 'Lutego', 'Marca', 'Kwietnia', 'Maja', 'Czerwca', 'Lipca', 'Sierpnia', 'Września', 'Października', 'Listopada', 'Grudnia'];
    const formattedDatePl = `${dayNames[now.getDay()]}, ${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;

    let cudaData = null;
    try {
        cudaData = await fetchFromCudaReflections(todayStr, options.fetchImpl);
    } catch (cudaErr) {
        console.warn('LUMINA: Błąd odczytu cuda-398c0/reflections:', cudaErr?.message || cudaErr);
    }

    let mcWebData = null;
    const needsWebEnrichment = !cudaData || (!cudaData.contentWeb && !cudaData.content);
    if (needsWebEnrichment) {
        try {
            mcWebData = await fetchFromMissionControlWeb(todayStr);
        } catch (mcErr) {
            console.warn('LUMINA: Fallback web_inspirations niedostępny:', mcErr?.message || mcErr);
        }
    }

    let devotionData = null;
    if (cudaData) {
        const sameDateWeb = mcWebData && mcWebData.date === cudaData.date ? mcWebData : null;
        devotionData = {
            ...cudaData,
            contentWeb: cudaData.contentWeb || sameDateWeb?.contentWeb || sameDateWeb?.content || ''
        };
    } else if (mcWebData) {
        devotionData = mcWebData;
    }

    if (!devotionData || (!devotionData.contentWeb && !devotionData.content)) {
        try {
            const localDoc = await fetchFromLocalArchiveJson(todayStr, options.fetchImpl);
            if (!devotionData && localDoc) {
                devotionData = localDoc;
            } else if (devotionData && localDoc && localDoc.date === devotionData.date && localDoc.contentWeb) {
                devotionData = {
                    ...devotionData,
                    contentWeb: localDoc.contentWeb,
                    imageUrl: devotionData.imageUrl || localDoc.imageUrl
                };
            }
        } catch (jsonErr) {
            console.warn('LUMINA: Błąd odczytu rozwazania_baza.json:', jsonErr?.message || jsonErr);
        }
    }

    if (!devotionData) return null;

    const title = devotionData.title || '☀️ Dobrze, że jesteś — Słowo na Dziś';
    const rawContent = devotionData.contentWeb || devotionData.content || devotionData.fullText || devotionData.teaser || '';
    const teaser = devotionData.teaser || (rawContent.length > 160 ? rawContent.substring(0, 160) + '...' : rawContent);

    let verseText = '';
    const verseMatch = rawContent.match(/„([^”]+)”\s*\(([^)]+)\)/) || rawContent.match(/"([^"]+)"\s*\(([^)]+)\)/);
    if (verseMatch) {
        verseText = `„${verseMatch[1]}” (${verseMatch[2]})`;
    }

    const formattedHtml = formatLuminaDevotionalContent(rawContent);
    const reflectionRecord = {
        id: devotionData.id || ('daily_rozwazanie_' + (devotionData.date || todayStr)),
        type: 'reflection',
        author: 'Cezary Rogowski',
        authorRole: '☀️ Dobrze, że jesteś • Założyciel Christian Culture ✨',
        authorAvatar: 'avatar_cezary_official.jpg',
        authorSlug: 'cezaryrgowski',
        time: `${devotionData.date || todayStr} • ☀️ Cykl: Dobrze, że jesteś`,
        title,
        date: devotionData.date || todayStr,
        fullText: rawContent,
        fullTextHtml: formattedHtml,
        image: devotionData.imageUrl || 'promo_dzj.jpg',
        imageUrl: devotionData.imageUrl || 'promo_dzj.jpg',
        streamUrl: devotionData.streamUrl || 'cctv24-worship-live.html?muted=1&mute=1&in_mcr=1',
        likes: devotionData.likes || 198,
        amen: devotionData.amen || 174,
        teaser,
        verse: verseText,
        _pinned: true,
        _isReflection: true,
        _source: devotionData._source || 'unified'
    };

    const payload = { data: devotionData, formattedDatePl, todayStr, reflectionRecord };
    _reflectionCache.set(todayStr, payload);
    return payload;
}

// ══════════════════════════════════════════════════════════════════════════
// AUTOMATYCZNE POBIERANIE ROZWAŻANIA DNIA (FAITH & GROWTH HUB)
// ══════════════════════════════════════════════════════════════════════════
export async function loadLuminaDailyDevotional() {
    try {
        const result = await fetchCanonicalDailyReflection();
        if (!result) return null;

        const { formattedDatePl, reflectionRecord } = result;
        const { title, teaser, verse, fullTextHtml } = reflectionRecord;

        const dateBadge = document.getElementById('devotionalDateBadge');
        if (dateBadge) dateBadge.textContent = formattedDatePl;

        const cardTitle = document.getElementById('devotionalCardTitle');
        if (cardTitle) cardTitle.textContent = title;

        const cardSnippet = document.getElementById('devotionalCardSnippet');
        if (cardSnippet) cardSnippet.textContent = teaser;

        const modalTitle = document.getElementById('modalDevotionTitle');
        if (modalTitle) modalTitle.textContent = title;

        const modalVerseBox = document.getElementById('modalDevotionVerseBox');
        const modalVerseText = document.getElementById('modalDevotionVerseText');
        if (modalVerseText) {
            if (verse) {
                modalVerseText.textContent = verse;
                if (modalVerseBox) modalVerseBox.style.display = 'block';
            } else if (modalVerseBox) {
                modalVerseBox.style.display = 'none';
            }
        }

        const modalBody = document.getElementById('modalDevotionBody');
        if (modalBody) {
            modalBody.innerHTML = `<p style="line-height: 1.7;">${fullTextHtml}</p>`;
        }

        window._luminaDailyReflection = reflectionRecord;
        return reflectionRecord;
    } catch (err) {
        console.warn('loadLuminaDailyDevotional global error:', err);
        return null;
    }
}

export function initDevotionalFeedAutoRefresh() {
    if (typeof window === 'undefined') return;
    const runIfPresent = () => {
        if (document.getElementById('todayDevotionalBanner') || document.getElementById('devotionalModal')) {
            loadLuminaDailyDevotional();
        }
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runIfPresent);
    } else {
        runIfPresent();
    }
    if (!window._luminaDevotionalInterval) {
        window._luminaDevotionalInterval = setInterval(runIfPresent, 900000);
    }
}

if (typeof window !== 'undefined') {
    window.formatLuminaDevotionalContent = formatLuminaDevotionalContent;
    window.fetchCanonicalDailyReflection = fetchCanonicalDailyReflection;
    window.loadLuminaDailyDevotional = loadLuminaDailyDevotional;
}
