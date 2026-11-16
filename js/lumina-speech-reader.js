/**
 * lumina-speech-reader.js
 * LUMINA Portal — Free Speech Reader (Web Speech API)
 * Dodaje przycisk 🔊 obok tytułu rozważań i postów misyjnych.
 * Czyta treść poszczególnego posta na życzenie (toggle: czyta / stop).
 * Obsługuje dynamiczne posty renderowane z Firestore (MutationObserver).
 *
 * Selektory:
 *   - Profile:  article.post-card.reflection-post-card  → h3.post-title, .post-content
 *   - Tablica:  article.post-card-1x1 (reflection)     → .post-headline, .daily-reflection-fulltext
 *   - Tablica:  article.post-card-1x1 (misyjny)        → .post-headline, .post-text-body
 *
 * © Christian Culture / Antigravity — 2026
 */
(function () {
    'use strict';

    /* ------------------------------------------------------------------ */
    /*  Stałe                                                               */
    /* ------------------------------------------------------------------ */
    const BTN_CLASS      = 'lumina-tts-btn';
    const BTN_ACTIVE_CLS = 'lumina-tts-btn--active';

    const POST_SELECTORS = [
        'article.post-card.reflection-post-card',  // Profile: rozważania DZJ/CKD
        'article.post-card-1x1',                   // Tablica: rozważania + misyjne
    ];

    /* ------------------------------------------------------------------ */
    /*  Sprawdzanie wsparcia przeglądarki                                  */
    /* ------------------------------------------------------------------ */
    const hasSpeechAPI = !!(window.SpeechSynthesisUtterance && window.speechSynthesis);

    if (!hasSpeechAPI) {
        console.info('[LuminaSpeechReader] SpeechSynthesis API niedostępna — reader wyłączony.');
        return;
    }

    /* ------------------------------------------------------------------ */
    /*  Pobieranie czystego tekstu z posta                                 */
    /* ------------------------------------------------------------------ */
    function extractPlainText(card) {
        // Priorytet: pełny tekst rozważania (Tablica) → treść profilu → tekst misyjny
        const sourceEl =
            card.querySelector('.daily-reflection-fulltext') ||
            card.querySelector('.post-content')              ||
            card.querySelector('.post-text-body')            ||
            card.querySelector('.post-content-row');

        if (!sourceEl) return '';

        const clone = sourceEl.cloneNode(true);
        // Usuń elementy UI, skrypty i niepotrzebne elementy
        clone.querySelectorAll(
            'button, .btn-toggle-reflection, .reflection-links-container, ' +
            '.post-footer, .post-actions-bar, .comments-section-v2, ' +
            'script, style, svg, .lumina-tts-btn, .lumina-support-project-btn'
        ).forEach(el => el.remove());

        const raw = (clone.textContent || clone.innerText || '')
            .replace(/\s+/g, ' ')
            .replace(/[\u{1F000}-\u{1FFFF}]/gu, '') // usuń emoji (opcjonalne)
            .trim();

        return raw;
    }

    /* ------------------------------------------------------------------ */
    /*  Pobieranie tytułu posta                                            */
    /* ------------------------------------------------------------------ */
    function extractTitle(card) {
        const el = card.querySelector('h3.post-title, .post-headline');
        if (!el) return '';
        // Klonujemy, żeby usunąć przycisk TTS z tytułu zanim odczytamy tekst
        const clone = el.cloneNode(true);
        clone.querySelectorAll('.' + BTN_CLASS).forEach(b => b.remove());
        return (clone.textContent || '').replace(/\s+/g, ' ').trim();
    }

    /* ------------------------------------------------------------------ */
    /*  Zatrzymanie globalnego odtwarzania                                 */
    /* ------------------------------------------------------------------ */
    let _activeBtn = null;

    function stopSpeech() {
        window.speechSynthesis.cancel();
        if (_activeBtn) {
            _activeBtn.textContent = '🔊';
            _activeBtn.title = 'Posłuchaj rozważania 🔊';
            _activeBtn.classList.remove(BTN_ACTIVE_CLS);
            _activeBtn.dataset.ttsActive = 'false';
            _activeBtn = null;
        }
    }

    /* ------------------------------------------------------------------ */
    /*  Odtwarzanie tekstu                                                 */
    /* ------------------------------------------------------------------ */
    function speakText(text, btn) {
        window.speechSynthesis.cancel();

        const utt = new SpeechSynthesisUtterance(text);
        const activeLang = (typeof localStorage !== 'undefined' && (localStorage.getItem('cc_user_lang_choice') || localStorage.getItem('lumina_lang'))) || (document.documentElement.lang || 'pl');
        utt.lang  = activeLang.startsWith('en') ? 'en-US' : (activeLang.startsWith('es') ? 'es-ES' : 'pl-PL');
        utt.rate  = 0.92;
        utt.pitch = 1.0;

        // Spróbuj wybrać polski głos jeśli dostępny
        const voices = window.speechSynthesis.getVoices();
        const langPrefix = utt.lang.slice(0, 2);
        const matchVoice = voices.find(v => (v.lang || '').toLowerCase().startsWith(langPrefix));
        if (matchVoice) utt.voice = matchVoice;

        utt.onend = () => {
            if (_activeBtn === btn) stopSpeech();
        };
        utt.onerror = () => {
            if (_activeBtn === btn) stopSpeech();
        };

        _activeBtn = btn;
        btn.textContent = '⏹';
        btn.title = 'Zatrzymaj czytanie ⏹';
        btn.classList.add(BTN_ACTIVE_CLS);
        btn.dataset.ttsActive = 'true';

        window.speechSynthesis.speak(utt);
    }

    /* ------------------------------------------------------------------ */
    /*  Tworzenie przycisku TTS                                            */
    /* ------------------------------------------------------------------ */
    function createTtsBtn(card) {
        const btn = document.createElement('button');
        btn.type              = 'button';
        btn.className         = BTN_CLASS;
        btn.title             = 'Posłuchaj rozważania 🔊';
        btn.textContent       = '🔊';
        btn.dataset.ttsActive = 'false';

        // Styl inline — nie wymaga zmian w CSS
        Object.assign(btn.style, {
            display         : 'inline-flex',
            alignItems      : 'center',
            justifyContent  : 'center',
            minWidth        : '44px',
            minHeight       : '44px',
            width           : '44px',
            height          : '44px',
            borderRadius    : '50%',
            background      : 'rgba(255,122,0,0.15)',
            border          : '1.5px solid #FF7A00',
            color           : '#FF7A00',
            cursor          : 'pointer',
            marginLeft      : '8px',
            flexShrink      : '0',
            fontSize        : '1rem',
            lineHeight      : '1',
            transition      : 'background 0.2s, color 0.2s, border-color 0.2s',
            verticalAlign   : 'middle',
            padding         : '0',
            outline         : 'none',
            boxSizing       : 'border-box',
        });

        btn.addEventListener('mouseenter', () => {
            if (btn.dataset.ttsActive !== 'true') {
                btn.style.background = 'rgba(255,122,0,0.25)';
            }
        });
        btn.addEventListener('mouseleave', () => {
            if (btn.dataset.ttsActive !== 'true') {
                btn.style.background = 'rgba(255,122,0,0.15)';
            }
        });

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();

            if (btn.dataset.ttsActive === 'true') {
                stopSpeech();
                return;
            }

            // Zatrzymaj poprzedni
            window.LuminaReflectionTTS?.stop();
            if (_activeBtn && _activeBtn !== btn) stopSpeech();

            const title   = extractTitle(card);
            const content = extractPlainText(card);

            if (!content && !title) {
                console.warn('[LuminaSpeechReader] Brak tekstu do odczytania.');
                return;
            }

            const fullText = [title, content].filter(Boolean).join('. ');
            speakText(fullText, btn);
        });

        return btn;
    }

    /* ------------------------------------------------------------------ */
    /*  Dekorowanie pojedynczego posta                                     */
    /* ------------------------------------------------------------------ */
    function decoratePost(card) {
        if (card && window.LuminaReflectionTTS?.isReflection(card)) return;
        if (!card || card.dataset.ttsDecorated === '1') return;

        // Pomijamy kanały live broadcast
        const isLive = !!(
            card.querySelector('iframe[src*="stream"], iframe[src*="master-live"], iframe[src*="worship"], iframe[src*="cctv24"]') ||
            card.querySelector('[data-live="true"], .live-badge, .broadcast-badge') ||
            card.classList.contains('broadcast-channel-card')
        );
        if (isLive) return;

        // Znajdź element tytułu
        const titleEl = card.querySelector('h3.post-title, .post-headline');
        if (!titleEl) return;

        // Sprawdź czy przycisk już istnieje
        if (titleEl.querySelector('.' + BTN_CLASS)) {
            card.dataset.ttsDecorated = '1';
            return;
        }

        const btn = createTtsBtn(card);

        // Ustaw flex na tytule żeby przycisk był obok tekstu
        titleEl.style.display        = 'flex';
        titleEl.style.alignItems     = 'flex-start';
        titleEl.style.justifyContent = 'space-between';
        titleEl.style.gap            = '6px';
        titleEl.style.flexWrap       = 'nowrap';

        titleEl.appendChild(btn);
        card.dataset.ttsDecorated = '1';
    }

    /* ------------------------------------------------------------------ */
    /*  Dekorowanie wszystkich pasujących postów na stronie               */
    /* ------------------------------------------------------------------ */
    function decoratePosts() {
        POST_SELECTORS.forEach(sel => {
            document.querySelectorAll(sel).forEach(decoratePost);
        });
    }

    /* ------------------------------------------------------------------ */
    /*  Ładowanie głosów (asynchroniczne w niektórych przeglądarkach)     */
    /* ------------------------------------------------------------------ */
    function ensureVoicesLoaded(cb) {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            cb();
        } else {
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.onvoiceschanged = null;
                cb();
            };
            // Fallback timeout — start bez głosu jeśli API nie odpowiada
            setTimeout(cb, 1500);
        }
    }

    /* ------------------------------------------------------------------ */
    /*  MutationObserver — obsługa dynamicznie renderowanych postów       */
    /* ------------------------------------------------------------------ */
    function startObserver() {
        const observer = new MutationObserver(() => {
            decoratePosts();
        });

        const targets = [
            document.querySelector('#mainFeed, #main-feed, .feed-container, .posts-container, .timeline-container'),
            document.querySelector('#profileFeed, .profile-posts, .profile-content, .user-posts'),
            document.querySelector('main, .main-content, #main, #app'),
            document.body,
        ].filter(Boolean);

        const root = targets[0] || document.body;

        observer.observe(root, {
            childList : true,
            subtree   : true,
        });

        return observer;
    }

    /* ------------------------------------------------------------------ */
    /*  Styl aktywnego przycisku (wstrzyknięcie CSS)                      */
    /* ------------------------------------------------------------------ */
    function injectStyles() {
        if (document.getElementById('lumina-tts-styles')) return;
        const style = document.createElement('style');
        style.id = 'lumina-tts-styles';
        style.textContent = `
.lumina-tts-btn--active {
    background: rgba(239,68,68,0.15) !important;
    border-color: rgba(239,68,68,0.5) !important;
    color: #ef4444 !important;
}
.lumina-tts-btn:focus-visible {
    outline: 2px solid #f59e0b;
    outline-offset: 2px;
}
@media (max-width: 600px) {
    .lumina-tts-btn {
        min-width: 44px !important;
        min-height: 44px !important;
        width: 44px !important;
        height: 44px !important;
        font-size: 1.05rem !important;
    }
}
`;
        document.head.appendChild(style);
    }

    /* ------------------------------------------------------------------ */
    /*  Inicjalizacja                                                      */
    /* ------------------------------------------------------------------ */
    function init() {
        injectStyles();
        decoratePosts();
        startObserver();
        console.info('[LuminaSpeechReader] ✅ Aktywny — czytnik postów uruchomiony.');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ensureVoicesLoaded(init));
    } else {
        ensureVoicesLoaded(init);
    }

    /* ------------------------------------------------------------------ */
    /*  Publiczne API                                                      */
    /* ------------------------------------------------------------------ */
    window.LuminaSpeechReader = {
        stop         : stopSpeech,
        decoratePosts: decoratePosts,
        version      : '1.0.0',
    };

})();
