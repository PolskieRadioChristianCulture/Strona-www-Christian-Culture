/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA LEGAL & COMMUNITY STANDARDS MODAL (lumina-terms-modal.js)
 * Regulamin Społeczności, Polityka Prywatności (RODO) i Kodeks Wartości LUMINA
 * Ekosystem: Christian Culture
 * ══════════════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    function injectTermsStyles() {
        if (document.getElementById('luminaTermsModalStyles')) return;
        const style = document.createElement('style');
        style.id = 'luminaTermsModalStyles';
        style.textContent = `
            .lumina-legal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(3, 7, 18, 0.85);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                padding: 16px;
                box-sizing: border-box;
            }

            .lumina-legal-overlay.active {
                opacity: 1;
                pointer-events: auto;
            }

            .lumina-legal-modal {
                width: 100%;
                max-width: 680px;
                max-height: 88vh;
                background: #0b1329;
                border: 1.5px solid rgba(250, 204, 21, 0.35);
                border-radius: 24px;
                box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(234, 179, 8, 0.15);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transform: scale(0.95);
                transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                color: #f8fafc;
                font-family: 'Plus Jakarta Sans', sans-serif;
            }

            .lumina-legal-overlay.active .lumina-legal-modal {
                transform: scale(1);
            }

            .lumina-legal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 18px 24px;
                background: rgba(15, 23, 42, 0.9);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .lumina-legal-tabs {
                display: flex;
                gap: 8px;
                padding: 12px 24px 0;
                background: rgba(11, 19, 41, 0.95);
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            }

            .lumina-legal-tab-btn {
                background: none;
                border: none;
                color: #94a3b8;
                font-size: 0.88rem;
                font-weight: 700;
                padding: 8px 14px 12px;
                cursor: pointer;
                border-bottom: 2px solid transparent;
                transition: all 0.2s;
                font-family: inherit;
            }

            .lumina-legal-tab-btn.active {
                color: #facc15;
                border-bottom-color: #facc15;
            }

            .lumina-legal-body {
                padding: 24px;
                overflow-y: auto;
                font-size: 0.90rem;
                line-height: 1.75;
                color: #cbd5e1;
            }

            .lumina-legal-body h3 {
                color: #f8fafc;
                font-size: 1.1rem;
                font-family: 'Outfit', sans-serif;
                margin: 18px 0 8px 0;
            }

            .lumina-legal-body h3:first-child {
                margin-top: 0;
            }

            .lumina-legal-body p {
                margin-bottom: 12px;
            }

            .lumina-legal-body ul {
                margin-bottom: 16px;
                padding-left: 20px;
            }

            .lumina-legal-body li {
                margin-bottom: 6px;
            }

            .lumina-legal-footer {
                padding: 16px 24px;
                background: rgba(15, 23, 42, 0.95);
                border-top: 1px solid rgba(255, 255, 255, 0.08);
                display: flex;
                justify-content: flex-end;
            }

            .lumina-legal-close-btn {
                background: #FF7A00;
                border: none;
                color: #FFFFFF;
                font-weight: 800;
                padding: 11px 24px;
                border-radius: 50px;
                cursor: pointer;
                font-size: 0.88rem;
                font-family: inherit;
                min-height: 44px;
                min-width: 44px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s, background 0.2s, box-shadow 0.2s;
            }

            .lumina-legal-close-btn:hover {
                background: #FF8C33;
                transform: translateY(-1px);
                box-shadow: 0 4px 15px rgba(255, 122, 0, 0.4);
            }
            .lumina-legal-close-btn:active {
                background: #E66A00;
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
    }

    function createModalHTML() {
        if (document.getElementById('luminaLegalModalOverlay')) return;
        const div = document.createElement('div');
        div.id = 'luminaLegalModalOverlay';
        div.className = 'lumina-legal-overlay';
        div.onclick = function(e) {
            if (e.target === div) closeLuminaLegalModal();
        };

        div.innerHTML = `
            <div class="lumina-legal-modal" onclick="event.stopPropagation()">
                <div class="lumina-legal-header">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="lumina_icon.jpg" onerror="this.src='icon.png'" alt="LUMINA" style="width: 28px; height: 28px; border-radius: 50%;">
                        <span style="font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.1rem; color: #facc15;">LUMINA • Zasady & Bezpieczeństwo</span>
                    </div>
                    <button type="button" onclick="window.closeLuminaLegalModal()" style="background: none; border: none; color: #94a3b8; font-size: 1.2rem; cursor: pointer; padding: 4px;" title="Zamknij"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <div class="lumina-legal-tabs">
                    <button type="button" class="lumina-legal-tab-btn active" id="tabBtnTerms" onclick="window.switchLegalTab('terms')">📖 Regulamin & Wartości</button>
                    <button type="button" class="lumina-legal-tab-btn" id="tabBtnPrivacy" onclick="window.switchLegalTab('privacy')">🔒 Prywatność & RODO</button>
                    <button type="button" class="lumina-legal-tab-btn" id="tabBtnAi" onclick="window.switchLegalTab('ai')">🛡️ Bezpieczeństwo Społeczności</button>
                </div>

                <div class="lumina-legal-body" id="legalModalBody">
                    <!-- Dynamic content filled by switchLegalTab -->
                </div>

                <div class="lumina-legal-footer">
                    <button type="button" class="lumina-legal-close-btn" onclick="window.closeLuminaLegalModal()">Rozumiem i Akceptuję ✨</button>
                </div>
            </div>
        `;
        document.body.appendChild(div);
    }

    const TAB_CONTENTS = {
        terms: `
            <h3>1. Cel Portalu LUMINA</h3>
            <p>LUMINA to bezpieczna, chrześcijańska przestrzeń relacji, wzajemnego wsparcia modlitewnego i budowania wartościowych więzi zakorzenionych w Chrystusie.</p>

            <h3>2. Kodeks Wartości i Szacunku</h3>
            <ul>
                <li><b>Kultura i Życzliwość:</b> Każdy użytkownik zobowiązuje się do odnoszenia się do innych z szacunkiem i miłością bliźniego.</li>
                <li><b>Prawdziwość Danych:</b> Tworząc profil, zobowiązujesz się do podawania autentycznych informacji o sobie.</li>
                <li><b>Zakaz Treści Niezgodnych z Prawem i Wiarą:</b> Surowo zabronione jest publikowanie materiałów wulgarnych, erotycznych, promujących nienawiść, oszustwo, spam oraz treści komercyjnych bez zgody administracji.</li>
            </ul>

            <h3>3. Pokoje i Zgłoszenia</h3>
            <p>Administracja portalu (Master Admin) zastrzega sobie prawo do weryfikacji, ukrywania wpisów oraz natychmiastowego blokowania profili naruszających zasady społeczności.</p>
        `,
        privacy: `
            <h3>1. Administrator Danych Osobowych</h3>
            <p>Administratorem Twoich danych w portalu LUMINA jest Christian Culture Media. Dbamy o najwyższe standardy ochrony prywatności zgodnie z wymogami RODO (GDPR).</p>

            <h3>2. Przetwarzanie i Bezpieczeństwo Danych</h3>
            <ul>
                <li>Twoje dane profilowe (imię, miasto, bio, preferencje) są wykorzystywane wyłącznie w celu umożliwienia nawiązywania relacji i wyświetlania postów w społeczności.</li>
                <li><b>Nigdy nie sprzedajemy</b> ani nie udostępniamy Twoich danych osobowych zewnętrznym agencjom marketingowym.</li>
                <li>Komunikacja i baza danych są szyfrowane za pośrednictwem certyfikatu SSL oraz bezpiecznej infrastruktury Google Cloud Firestore.</li>
            </ul>

            <h3>3. Twoje Prawa</h3>
            <p>W każdej chwili masz prawo do wglądu, edycji swoich informacji, wyłączenia widoczności profilu lub jego trwałego usunięcia z poziomu zakładki <i>Mój Profil</i>.</p>
        `,
        ai: `
            <h3>1. Tarcza Bezpieczeństwa Społeczności</h3>
            <p>Portal LUMINA wykorzystuje inteligentne filtry treści, które chronią społeczność przed niepożądanym spamem, botami i próbami wyłudzeń.</p>

            <h3>2. System Zgłaszania (Raportowanie)</h3>
            <p>Jeśli zauważysz post lub profil, który narusza zasady chrześcijańskiej kultury, użyj opcji <b>Zgłoś Naruszenie</b> (menu z trzema kropkami przy każdym poście). Zgłoszenie natychmiast trafia do kolejki moderacji administratora.</p>

            <h3>3. Ochrona w Czasie Rzeczywistym</h3>
            <p>Wszystkie publiczne wpisy i modlitwy live są na bieżąco monitorowane, aby zapewnić pokój, Bożą atmosferę i bezpieczeństwo każdemu członkowi społeczności.</p>
        `
    };

    function switchLegalTab(tab) {
        const body = document.getElementById('legalModalBody');
        const btnTerms = document.getElementById('tabBtnTerms');
        const btnPrivacy = document.getElementById('tabBtnPrivacy');
        const btnAi = document.getElementById('tabBtnAi');

        if (!body) return;

        [btnTerms, btnPrivacy, btnAi].forEach(b => b?.classList.remove('active'));

        if (tab === 'privacy') {
            btnPrivacy?.classList.add('active');
            body.innerHTML = TAB_CONTENTS.privacy;
        } else if (tab === 'ai') {
            btnAi?.classList.add('active');
            body.innerHTML = TAB_CONTENTS.ai;
        } else {
            btnTerms?.classList.add('active');
            body.innerHTML = TAB_CONTENTS.terms;
        }
    }

    function openLuminaLegalModal(initialTab = 'terms') {
        injectTermsStyles();
        createModalHTML();
        switchLegalTab(initialTab);
        const overlay = document.getElementById('luminaLegalModalOverlay');
        if (overlay) overlay.classList.add('active');
    }

    function closeLuminaLegalModal() {
        const overlay = document.getElementById('luminaLegalModalOverlay');
        if (overlay) overlay.classList.remove('active');
    }

    window.openLuminaTermsModal = () => openLuminaLegalModal('terms');
    window.openLuminaPrivacyModal = () => openLuminaLegalModal('privacy');
    window.openLuminaLegalModal = openLuminaLegalModal;
    window.closeLuminaLegalModal = closeLuminaLegalModal;
    window.switchLegalTab = switchLegalTab;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectTermsStyles();
            createModalHTML();
        });
    } else {
        injectTermsStyles();
        createModalHTML();
    }
})();
