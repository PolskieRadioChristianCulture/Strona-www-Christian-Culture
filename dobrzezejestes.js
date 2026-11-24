import { db } from "./firebase-config.js";
import { collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

window.shareDzjContent = function() {
    const textToShare = window.currentDzjTitle + "\n\n" + window.currentDzjText;
    const shareUrl = window.location.origin + window.location.pathname + "?dzj=true";
    
    if(navigator.share) {
        navigator.share({
            title: window.currentDzjTitle,
            text: textToShare,
            url: shareUrl
        }).catch(console.error);
    } else {
        if(navigator.clipboard) {
            navigator.clipboard.writeText(textToShare + "\n\n" + shareUrl)
                .then(() => alert('Treść rozważania została skopiowana do schowka!'))
                .catch(console.error);
        } else {
            alert('Twoja przeglądarka nie wspiera systemowego udostępniania.');
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const dzjBtn = document.getElementById("navDzjLink");
    const dzjIconBtn = document.getElementById("navDzjIconBtn");
    const modal = document.getElementById("dzjModal");
    const closeBtn = document.getElementById("dzjCloseBtn");
    const closeFooterBtn = document.getElementById("dzjCloseFooterBtn");
    const modalOverlay = document.getElementById("dzjModalOverlay");

    const contentBox = document.getElementById("dzjContentBox");
    const titleBox = document.getElementById("dzjTitle");
    const dateBox = document.getElementById("dzjDate");

    const hTitleBox = document.getElementById("homepageDzjTitle");
    const hDateBox = document.getElementById("homepageDzjDate");
    const hContentBox = document.getElementById("homepageDzjContent");

    const formatReflectionText = (rawContent) => {
        if (!rawContent) return '';
        return rawContent
            .replace(/((?:https?:\/\/|www\.)[^\s\n<]+)/g, (url) => {
                const href = url.startsWith('http') ? url : 'https://' + url;
                let label = 'Otwórz odnośnik';
                if (url.includes('chat.whatsapp.com')) {
                    label = 'Wejdź do zespołu ludzi z pasją! (Grupa WhatsApp)';
                } else if (url.includes('play.google.com')) {
                    label = 'Pobierz bezpłatne aplikacje w Google Play';
                } else if (url.includes('polskieradio.cc')) {
                    label = 'Polskie Radio Christian Culture';
                } else if (url.includes('cclite.pl')) {
                    label = 'Telewizja CC Lite';
                } else {
                    try {
                        const urlObj = new URL(href);
                        label = urlObj.hostname;
                    } catch (e) {
                        label = 'Otwórz odnośnik';
                    }
                }
                return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color: #facc15; text-decoration: underline; font-weight: bold;">${label}</a>`;
            })
            .replace(/\n\n/g, '</p><p class="mt-4" style="margin-top: 14px; margin-bottom: 14px; line-height: 1.8;">')
            .replace(/\n/g, '<br/>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    };

    const populateContent = (title, formattedContent, dateStr) => {
        // Populate modal
        if (titleBox) titleBox.textContent = title;
        if (dateBox) dateBox.textContent = dateStr;
        if (contentBox) {
            contentBox.innerHTML = `
                <div class="dzj-text-content" style="color: #e0e0e0; line-height: 1.8; font-weight: 300;">
                    <p style="margin-bottom: 14px; line-height: 1.8;">${formattedContent}</p>
                </div>
                
                <!-- Przycisk Udostępnij & TV -->
                <div style="text-align: center; margin: 20px 0; display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
                    <button onclick="window.shareDzjContent()" style="background: #E2B859; color: #000; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(226, 184, 89, 0.4); font-family: inherit;">
                        <i class="fa-solid fa-share-nodes"></i> UDOSTĘPNIJ ROZWAŻANIE
                    </button>
                    ${window.youtubeLiveStreamId ? `
                    <a href="https://youtube.com/live/${window.youtubeLiveStreamId}" target="_blank" style="background: rgba(226, 184, 89, 0.1); color: #E2B859; border: 2px solid #E2B859; padding: 10px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-family: inherit; text-decoration: none;">
                        <i class="fa-solid fa-tv"></i> ZOBACZ WERSJĘ TV
                    </a>
                    ` : ''}
                </div>
                
                <!-- YouTube Video Section -->
                <div class="dzj-youtube-section">
                    <div class="dzj-youtube-header">
                        <i class="fa-solid fa-heart"></i>
                        <span>POSŁUCHAJ HYMNU</span>
                    </div>
                    <div class="dzj-youtube-container">
                        <iframe 
                            src="https://www.youtube.com/embed/wKfdQrKwYtw?si=IrRVVy4LlgUqtnTq" 
                            title="Dobrze, że jesteś - Hymn" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerpolicy="strict-origin-when-cross-origin" 
                            allowfullscreen
                        ></iframe>
                    </div>
                </div>

                <!-- SMS CTA -->
                <div class="dzj-sms-cta">
                    <p class="dzj-sms-title"><i class="fa-solid fa-share-nodes"></i> Bądź na bieżąco</p>
                    <p class="dzj-sms-text">Jeśli Twój frontowy system powiadomień jeszcze nie działa, wyślij darmowy SMS o treści <strong>Inspiracje</strong> na numer <strong class="dzj-sms-number">783 478 280</strong>, by codziennie odbierać to Słowo na swój telefon!</p>
                </div>
            `;
        }

        // Populate homepage
        if (hTitleBox) hTitleBox.textContent = title;
        if (hDateBox) hDateBox.textContent = dateStr;
        if (hContentBox) {
            hContentBox.innerHTML = `
                <div class="dzj-text-content" style="color: #e0e0e0; line-height: 1.8; font-weight: 300;">
                    <p style="margin-bottom: 14px; line-height: 1.8;">${formattedContent}</p>
                </div>
            `;
        }
    };

    const loadReflectionData = async () => {
        const now = new Date();
        const pad = (n) => n < 10 ? '0' + n : n;
        // @007 (L0 24.11.2026): data według czasu polskiego (Europe/Warsaw)
        const todayStr = (typeof window.ccWarsawDate === 'function' && window.ccWarsawDate(now))
            || `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

        let docData = null;

        // 1. Próba pobrania z Firestore
        try {
            const q = query(collection(db, "web_inspirations"), orderBy("date", "desc"), limit(10));
            const snap = await getDocs(q);

            if (!snap.empty) {
                const validDocs = snap.docs.map(d => d.data()).filter(d => d.date && d.date <= todayStr);
                docData = validDocs.find(d => d.date === todayStr) || validDocs[0] || null;
            }
        } catch (e) {
            console.warn("LUMINA/DZJ: Błąd Firestore (przełączam na rozwazania_baza.json):", e.message);
        }

        // 2. Fallback do rozwazania_baza.json (gdy Firestore jest niedostępny lub limit wyczerpany)
        if (!docData) {
            try {
                const res = await fetch('/rozwazania_baza.json?v=' + Date.now());
                if (res.ok) {
                    const list = await res.json();
                    if (Array.isArray(list) && list.length > 0) {
                        const validList = list.filter(r => r.date && r.date <= todayStr);
                        docData = validList.find(r => r.date === todayStr) || validList[0] || null;
                    }
                }
            } catch (jsonErr) {
                console.warn("LUMINA/DZJ: Błąd pobierania JSON fallback:", jsonErr.message);
            }
        }

        // 3. Jeśli mamy dane (z Firestore lub JSON)
        if (docData && (docData.contentWeb || docData.fullText || docData.teaser)) {
            const dParts = (docData.date || todayStr).split('-');
            let dateLabel = docData.date || todayStr;
            if (dParts.length === 3) {
                const monthNames = ['Stycznia', 'Lutego', 'Marca', 'Kwietnia', 'Maja', 'Czerwca', 'Lipca', 'Sierpnia', 'Września', 'Października', 'Listopada', 'Grudnia'];
                const mIdx = parseInt(dParts[1], 10) - 1;
                dateLabel = `${parseInt(dParts[2], 10)} ${monthNames[mIdx] || ''} ${dParts[0]}`;
            }

            const title = docData.title || "☀️ Lato z Jezusem — Wielkie Pytania (Dzień 31 - Finał Cyklu)";
            const rawContent = docData.contentWeb || docData.fullText || docData.teaser || '';
            window.currentDzjTitle = title;
            window.currentDzjText = rawContent;

            const formattedContent = formatReflectionText(rawContent);
            populateContent(title, formattedContent, dateLabel);
            return;
        }

        // 4. Ostateczny bezpieczny fallback (Dzień 31 — 31 sierpnia 2026)
        const defaultTitle = "☀️ Lato z Jezusem — Wielkie Pytania (Dzień 31 - Finał Cyklu)";
        const defaultDate = "31 sierpnia 2026";
        const rawContent = `☀️ Lato z Jezusem — Wielkie Pytania
Dzień 31 — Finał Cyklu: Dlaczego tak łatwo ulegam lękowi przed ostatecznym krokiem i wejściem w nową jakość życia?

W trzydziestym pierwszym, finałowym dniu cyklu „Lato z Jezusem — Wielkie Pytania” zamykamy tę potężną formacyjną podróż i stajemy na progu całkowicie nowej jakości.

W psychologii zmiany moment przejścia (transition phase) wymaga porzucenia dawnej tożsamości i odważnego wejścia w nieznane, co często wyzwala lęk przed utratą kontroli. Słowo Boże przez proroka Izajasza przypomina nam niezmienną obietnicę: „Nie bój się, bo Ja jestem z tobą”. Zamykając dziś letni cykl, patrzymy z wdzięcznością na wszystko, co Bóg w nas odbudował. Chrześcijański lider najwyższej klasy nie lęka się nowych wyzwań – przekracza progi z nienaganną klasą i niezachwianą wiarą.

Już jutro, od 1 września, otwieramy nowy, przełomowy rozdział i zapraszamy na zupełnie nowy cykl rozważań pod tytułem „Słowa Mają Moc”!

Jezus mówi dziś do Ciebie:
„Nie bój się, bo Ja jestem z tobą; nie lękaj się, bo Ja jestem twoim Bogiem.” (Izajasza 41,10)

Zadanie Taktyczne:
Zmiażdż dziś lęk przed progiem zmian na swoim polu bitwy. Podsumuj ten miesiąc z wdzięcznością i zrób ostateczny krok w nową jakość życia. Przygotuj się na jutrzejszą inaugurację cyklu „Słowa Mają Moc”. Wnieś do swojego domu i firmy standard odwagi i dojrzałego autorytetu.

W Christian Culture aplikacje i portale są zawsze BEZPŁATNE.

Modlitwa Bojowa:
„Ojcze, odrzucam kłamstwa nieprzyjaciela i lęk przed nowym etapem. Dziękuję Ci za zamknięcie cyklu 'Lato z Jezusem' i za to, że od 1 września wkraczamy w potężny cykl 'Słowa Mają Moc'. Daj mi odwagę, rygor i wyrazisty charakter, bym z nienaganną klasą zdobywał ten świat dla Twojej chwały.”

Baza i wzrost: https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0 – Wejdź do zespołu ludzi z pasją!

PODAJ DALEJ 🔴
www.polskieradio.cc | www.cclite.pl
Apps: https://play.google.com/store/apps/dev?id=5215448773598149938`;

        window.currentDzjTitle = defaultTitle;
        window.currentDzjText = rawContent;

        const formattedContent = formatReflectionText(rawContent);
        populateContent(defaultTitle, formattedContent, defaultDate);
    };

    const scrollToSection = () => {
        // Close side drawer if open
        const drawer = document.getElementById("sideDrawer");
        const drawerOverlay = document.getElementById("drawerOverlay");
        if (drawer) drawer.classList.remove("open");
        if (drawerOverlay) drawerOverlay.classList.remove("visible");

        const section = document.getElementById("dailyReflectionSection");
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    };

    const openModal = () => {
        // Close side drawer if open
        const drawer = document.getElementById("sideDrawer");
        const drawerOverlay = document.getElementById("drawerOverlay");
        if (drawer) drawer.classList.remove("open");
        if (drawerOverlay) drawerOverlay.classList.remove("visible");

        if (modal) {
            modal.classList.add("open");
            document.body.style.overflow = "hidden"; // Prevent scrolling
        }
    };

    const closeModal = () => {
        if (modal) {
            modal.classList.remove("open");
            document.body.style.overflow = "";
        }
    };

    if (dzjBtn) dzjBtn.addEventListener("click", (e) => { e.preventDefault(); scrollToSection(); });
    if (dzjIconBtn) dzjIconBtn.addEventListener("click", (e) => { e.preventDefault(); scrollToSection(); });
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (closeFooterBtn) closeFooterBtn.addEventListener("click", closeModal);
    if (modalOverlay) modalOverlay.addEventListener("click", closeModal);

    // @007 (L0 24.11.2026): o północy czasu polskiego (js/cc-new-day.js) — rozważanie nowego dnia bez przeładowania
    window.addEventListener('cc:new-day', () => { loadReflectionData().catch(() => {}); });

    // Initial fetch to load page reflection
    loadReflectionData().then(() => {
        // Auto-scroll to section if URL contains ?dzj=true
        if (window.location.search.includes('dzj=true')) {
            setTimeout(scrollToSection, 300);
        } else if (window.location.hash) {
            // Re-apply hash scroll after dynamic content shifted the layout
            setTimeout(() => {
                const target = document.querySelector(window.location.hash);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }, 300);
        }
    });
});
