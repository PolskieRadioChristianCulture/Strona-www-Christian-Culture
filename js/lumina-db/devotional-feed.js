/**
 * LUMINA Daily Devotional Formatter & Loader ("Dobrze, że jesteś")
 * Extracted from lumina-db.js (Phase 1 Modularization)
 */
let _devFs = {};
export function configureDevotionalFeed(deps = {}) {
    _devFs = { ..._devFs, ...deps };
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

    // 5. Patronite / Wsparcie Misji -> zamień na bordowo-czerwony aktywny przycisk ze serduszkiem
    text = text.replace(/(?<!["'/])(?:(?:Wspomóż misję|Wspieraj Bożą misję|Wsparcie misji|Wspieraj misję|Zostań patronem|Patronite)\s*:?\s*)?(?:https?:\/\/)?(?:www\.)?patronite\.pl\/([a-zA-Z0-9_-]+)/gi, (match, slug) => {
        const targetSlug = (slug && slug.toLowerCase() !== 'patronite') ? slug : 'osobowoscplus';
        const url = `https://patronite.pl/${targetSlug}`;
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="reflection-smart-link support-link"><i class="fa-solid fa-heart" style="color:#ef4444;"></i> Wesprzyj Misję na Patronite <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 7. Revolut Wsparcie -> zamień na aktywny przycisk
    text = text.replace(/(?:(?:Wspomóż misję|Wspieraj Bożą misję|Darowizna|Revolut)\s*:?\s*)?(?:https?:\/\/)?(?:www\.)?revolut\.me\/([a-zA-Z0-9_-]+)/gi, (match, tag) => {
        const targetTag = tag || 'christianculture';
        const url = `https://revolut.me/${targetTag}`;
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="reflection-smart-link support-link"><i class="fa-solid fa-hand-holding-dollar" style="color:#ef4444;"></i> Wesprzyj przez Revolut <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 8. Oczyszczenie wiszących separatorów '|' między przyciskami smart-link
    text = text.replace(/(<\/a>)\s*\|\s*(?=<a [^>]*class="[^"]*reflection-smart-link)/gi, '$1 ');

    // 9. Usuń surowe pozostałości linków i tagów OpenGraph lub podwójnych linków
    text = text.replace(/🌐\s*chat\.whatsapp\.com[^\s<]*/gi, '');
    text = text.replace(/CHAT\.WHATSAPP\.COM/gi, '');
    text = text.replace(/Otwórz stronę w nowej karcie\.\.\./gi, '');

    // 10. Markdown links [Tytuł](https://...)
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g, (match, label, url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="reflection-smart-link apps-link">${label} <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    });

    // 7. Podział na akapity i formatowanie modułów (Pismo, Zadanie, Modlitwa, Kanały)
    return text
        .split(/\n\n+/)
        .filter(p => p.trim())
        .map(p => {
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
if (typeof window !== 'undefined') window.formatLuminaDevotionalContent = formatLuminaDevotionalContent;

// ══════════════════════════════════════════════════════════════════════════
// AUTOMATYCZNE POBIERANIE ROZWAŻANIA DNIA (FAITH & GROWTH HUB)
// ══════════════════════════════════════════════════════════════════════════
export async function loadLuminaDailyDevotional() {
    try {
        const now = new Date();
        const pad = (n) => n < 10 ? '0' + n : n;
        const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

        const dayNames = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
        const monthNames = ['Stycznia', 'Lutego', 'Marca', 'Kwietnia', 'Maja', 'Czerwca', 'Lipca', 'Sierpnia', 'Września', 'Października', 'Listopada', 'Grudnia'];
        const formattedDatePl = `${dayNames[now.getDay()]}, ${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;

        let devotionData = null;

        // 1. Próba pobrania z Firestore cc-mission-control (kolekcja web_inspirations)
        try {
            const mcConfig = {
                apiKey: "AIzaSyDou1gYyuJnuF2WocXEqglfRPqqwMm0Ge4",
                authDomain: "cc-mission-control.firebaseapp.com",
                projectId: "cc-mission-control",
                storageBucket: "cc-mission-control.firebasestorage.app",
                messagingSenderId: "519207260358",
                appId: "1:519207260358:web:d875a610f438ecad2c47c7"
            };
            const { getApps, initializeApp, getFirestore, collection, query, orderBy, limit, getDocs } = _devFs;
            if (!getApps || !initializeApp || !getFirestore) throw new Error("Devotional Firestore deps not configured");
            const existingApps = getApps();
            let mcApp = existingApps.find(a => a.name === 'lumina-mc');
            if (!mcApp) {
                mcApp = initializeApp(mcConfig, 'lumina-mc');
            }
            const mcDb = getFirestore(mcApp);

            const q = query(
                collection(mcDb, 'web_inspirations'),
                orderBy('date', 'desc'),
                limit(10)
            );
            const snap = await getDocs(q);
            if (!snap.empty) {
                const validDocs = snap.docs.map(docSnap => docSnap.data()).filter(d => d.date && d.date <= todayStr);
                devotionData = validDocs.find(d => d.date === todayStr) || validDocs[0] || null;
            }
        } catch (fsErr) {
            console.warn('LUMINA: Pobieranie rozważania z chmury Firebase (fallback do bazy lokalnej):', fsErr.message);
        }

        // 2. Fallback do rozwazania_baza.json
        if (!devotionData) {
            try {
                const res = await fetch('/rozwazania_baza.json?v=' + Date.now());
                if (res.ok) {
                    const list = await res.json();
                    if (Array.isArray(list) && list.length > 0) {
                        const validList = list.filter(r => r.date && r.date <= todayStr);
                        devotionData = validList.find(r => r.date === todayStr) || validList[0] || null;
                    }
                }
            } catch (jsonErr) {
                console.warn('LUMINA: Pobieranie rozważania z JSON fallback:', jsonErr.message);
            }
        }

        if (!devotionData) return;

        // Ekstrakcja danych
        const title = devotionData.title || `☀️ Dobrze, że jesteś — Słowo na Dziś`;
        const rawContent = devotionData.contentWeb || devotionData.fullText || devotionData.content || devotionData.teaser || '';
        const teaser = devotionData.teaser || (rawContent.length > 160 ? rawContent.substring(0, 160) + '...' : rawContent);

        // Ekstrakcja wersetu biblijnego
        let verseText = '';
        const verseMatch = rawContent.match(/„([^”]+)”\s*\(([^)]+)\)/) || rawContent.match(/"([^"]+)"\s*\(([^)]+)\)/);
        if (verseMatch) {
            verseText = `„${verseMatch[1]}” (${verseMatch[2]})`;
        }

        // Formatowanie tekstu HTML z aktywnymi przyciskami (Standard Premium Christian Culture)
        const formattedHtml = formatLuminaDevotionalContent(rawContent);

        // Aktualizacja DOM na stronie głównej (lumina.html)
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
            if (verseText) {
                modalVerseText.textContent = verseText;
                if (modalVerseBox) modalVerseBox.style.display = 'block';
            } else if (modalVerseBox) {
                modalVerseBox.style.display = 'none';
            }
        }

        const modalBody = document.getElementById('modalDevotionBody');
        if (modalBody) {
            modalBody.innerHTML = `<p style="line-height: 1.7;">${formattedHtml}</p>`;
        }

        // Zapis do stanu globalnego
        window._luminaDailyReflection = {
            id: devotionData.id || ('daily_rozwazanie_' + todayStr),
            title: title,
            date: devotionData.date || todayStr,
            fullText: rawContent,
            fullTextHtml: formattedHtml,
            teaser: teaser,
            verse: verseText,
            imageUrl: devotionData.imageUrl || 'promo_dzj.jpg'
        };

    } catch (err) {
        console.warn('loadLuminaDailyDevotional global error:', err);
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

if (typeof window !== 'undefined') window.loadLuminaDailyDevotional = loadLuminaDailyDevotional;

