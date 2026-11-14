/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA ADVANCED VALUES-BASED DISCOVERY ENGINE (js/lumina-discovery-filters.js)
 * Zaawansowane Filtrowanie Profili: Wartości Chrześcijańskie, Wiek, Stan Cywilny,
 * Cel Relacji, Tradycja Wiary, Czytanie Biblii, Czystość, Sortowanie i Geolokalizacja
 * ══════════════════════════════════════════════════════════════════════════
 */

(function initLuminaDiscoveryFiltersEngine() {
    'use strict';

    // Domyslny stan filtrow
    const DEFAULT_FILTER_STATE = {
        gender: 'all',              // 'all' | 'kobieta' | 'mezczyzna'
        minAge: 18,                 // 18..80
        maxAge: 75,                 // 18..80
        status: 'all',              // 'all' | 'wolny' | 'malzenstwo' | 'wdow' | 'wdowa' | 'wdowiec'
        goal: 'all',                // 'all' | 'malzenstwo' | 'relacja' | 'przyjazn' | 'modlitwa'
        denomination: 'all',        // 'all' | 'biblijny' | 'ewangeliczny' | 'katolicki' | 'charyzmatyczny'
        bibleReading: 'all',        // 'all' | 'codziennie' | 'regularnie' | 'niedziela'
        location: '',               // '' | wojewodztwo / miasto
        purityPriority: false,      // czystosc przedmalzenska
        noAddictions: false,        // wolny od nalogow
        withPhotoOnly: true,        // tylko ze zdjeciem
        sortBy: 'match'             // 'match' | 'age_asc' | 'age_desc' | 'newest'
    };

    let filterState = Object.assign({}, DEFAULT_FILTER_STATE);

    function injectStyles() {
        if (document.getElementById('luminaDiscoveryFiltersStyles')) return;
        const style = document.createElement('style');
        style.id = 'luminaDiscoveryFiltersStyles';
        style.textContent = `
            #luminaAdvancedFiltersModal.modal-overlay {
                position: fixed !important;
                inset: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                height: 100dvh !important;
                background: rgba(3, 7, 18, 0.85) !important;
                backdrop-filter: blur(14px) !important;
                -webkit-backdrop-filter: blur(14px) !important;
                z-index: 2147483640 !important;
                padding: 16px !important;
                box-sizing: border-box !important;
                display: none !important;
                opacity: 0 !important;
                pointer-events: none !important;
                transition: opacity 0.25s ease !important;
            }
            #luminaAdvancedFiltersModal.modal-overlay.open {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            }
            .adv-filters-card {
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                max-height: 90dvh;
                background: linear-gradient(180deg, #0b1329 0%, #060b18 100%);
                border: 1.5px solid rgba(250, 204, 21, 0.45);
                border-radius: 24px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                box-shadow: 0 24px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(250, 204, 21, 0.15);
                animation: advModalScaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            }
            @keyframes advModalScaleUp {
                from { transform: scale(0.93) translateY(14px); opacity: 0; }
                to { transform: scale(1) translateY(0); opacity: 1; }
            }
            .filter-group-title {
                font-size: 0.80rem;
                font-weight: 800;
                color: #facc15;
                font-family: 'Outfit', sans-serif;
                margin-bottom: 6px;
                display: flex;
                align-items: center;
                gap: 6px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .filter-select-luxury {
                width: 100%;
                padding: 10px 14px;
                border-radius: 12px;
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.15);
                color: #ffffff;
                font-family: inherit;
                font-size: 0.84rem;
                outline: none;
                transition: all 0.2s;
                box-sizing: border-box;
            }
            .filter-select-luxury:focus {
                border-color: #facc15;
                box-shadow: 0 0 12px rgba(250, 204, 21, 0.3);
                background: rgba(255, 255, 255, 0.1);
            }
            .filter-select-luxury option {
                background: #0b1329;
                color: #fff;
            }
            .filter-radio-pill-group {
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
            }
            .filter-radio-pill {
                padding: 7px 14px;
                border-radius: 12px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.14);
                color: #cbd5e1;
                font-size: 0.78rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.18s ease;
                user-select: none;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                touch-action: manipulation;
            }
            .filter-radio-pill:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
                border-color: rgba(255, 255, 255, 0.25);
            }
            .filter-radio-pill.active {
                background: linear-gradient(135deg, #ec4899, #8b5cf6);
                border-color: transparent;
                color: #fff;
                box-shadow: 0 2px 10px rgba(236, 72, 153, 0.35);
            }
            .filter-checkbox-row {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 7px 12px;
                border-radius: 12px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                cursor: pointer;
                transition: all 0.2s;
                user-select: none;
            }
            .filter-checkbox-row:hover {
                background: rgba(255, 255, 255, 0.07);
                border-color: rgba(250, 204, 21, 0.3);
            }
            .filter-checkbox-row input[type="checkbox"] {
                width: 18px;
                height: 18px;
                accent-color: #facc15;
                cursor: pointer;
            }
            .filter-checkbox-row label {
                font-size: 0.80rem;
                color: #e2e8f0;
                font-weight: 600;
                cursor: pointer;
                flex: 1;
            }
            .age-slider-double {
                display: flex;
                flex-direction: column;
                gap: 6px;
                background: rgba(255, 255, 255, 0.03);
                padding: 10px 14px;
                border-radius: 14px;
                border: 1px solid rgba(255, 255, 255, 0.08);
            }
            .age-slider-row {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .age-slider-input {
                flex: 1;
                accent-color: #facc15;
                cursor: pointer;
                height: 5px;
            }
            /* Active indicator badge on filter trigger button */
            #btnAdvancedFiltersModalTrigger.has-active-filters {
                border-color: #facc15 !important;
                background: linear-gradient(135deg, rgba(250, 204, 21, 0.2), rgba(217, 119, 6, 0.3)) !important;
                box-shadow: 0 0 14px rgba(250, 204, 21, 0.4) !important;
                color: #fef08a !important;
            }
            /* Summary Bar below filters */
            .active-filters-summary-bar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 8px;
                max-width: 900px;
                width: 94%;
                margin: 8px auto 0;
                padding: 8px 14px;
                background: rgba(15, 23, 42, 0.75);
                border: 1px solid rgba(250, 204, 21, 0.35);
                border-radius: 16px;
                font-size: 0.78rem;
                color: #cbd5e1;
                backdrop-filter: blur(10px);
                animation: fadeInSummary 0.2s ease;
            }
            @keyframes fadeInSummary {
                from { opacity: 0; transform: translateY(-4px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }

    // ── OBLICZANIE LICZBY AKTYWNYCH FILTROW ──
    function countActiveFilters() {
        let count = 0;
        if (filterState.gender !== 'all') count++;
        if (filterState.minAge > 18 || filterState.maxAge < 75) count++;
        if (filterState.status !== 'all') count++;
        if (filterState.goal !== 'all') count++;
        if (filterState.denomination !== 'all') count++;
        if (filterState.bibleReading !== 'all') count++;
        if (filterState.location !== '') count++;
        if (filterState.purityPriority) count++;
        if (filterState.noAddictions) count++;
        if (filterState.sortBy !== 'match') count++;
        return count;
    }

    // ── TWORZENIE LUB AKTUALIZACJA MODALA ──
    function getOrCreateModal() {
        injectStyles();
        let modal = document.getElementById('luminaAdvancedFiltersModal');
        if (modal) {
            if (!modal.__hasBackdropListener) {
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                        window.closeAdvancedFiltersModal();
                    }
                });
                modal.__hasBackdropListener = true;
            }
            return modal;
        }

        modal = document.createElement('div');
        modal.id = 'luminaAdvancedFiltersModal';
        modal.className = 'modal-overlay';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'advFiltersTitle');

        modal.innerHTML = `
            <div class="adv-filters-card">
                <!-- Header -->
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02);">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #facc15, #d97706); display: flex; align-items: center; justify-content: center; color: #030712; font-size: 1.2rem; box-shadow: 0 0 15px rgba(250,204,21,0.4);">
                            <i class="fa-solid fa-sliders"></i>
                        </span>
                        <div>
                            <h3 id="advFiltersTitle" style="font-size: 1.05rem; font-weight: 800; color: #fff; font-family: 'Outfit', sans-serif; margin: 0; letter-spacing: 0.3px;">
                                Filtry Wartości & Wiary ⚙️
                            </h3>
                            <div style="font-size: 0.72rem; color: #94a3b8;">
                                Szukaj relacji opartych na wierze, czystości i powołaniu
                            </div>
                        </div>
                    </div>
                    <button type="button" onclick="window.closeAdvancedFiltersModal()" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #fff; width: 38px; height: 38px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.05rem; touch-action: manipulation; transition: all 0.2s;" title="Zamknij (ESC)">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <!-- Body (Scrollable) -->
                <div style="padding: 18px 20px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 14px;">

                    <!-- 1. Kogo szukasz (Płeć) -->
                    <div>
                        <div class="filter-group-title"><i class="fa-solid fa-venus-mars"></i> Kogo szukasz?</div>
                        <div class="filter-radio-pill-group" id="filterGroupGender">
                            <span class="filter-radio-pill active" data-val="all" onclick="window._setFilterOption('gender', 'all', this)">
                                <i class="fa-solid fa-users"></i> Wszyscy
                            </span>
                            <span class="filter-radio-pill" data-val="kobieta" onclick="window._setFilterOption('gender', 'kobieta', this)">
                                🌸 Kobiety
                            </span>
                            <span class="filter-radio-pill" data-val="mezczyzna" onclick="window._setFilterOption('gender', 'mezczyzna', this)">
                                🛡️ Mężczyźni
                            </span>
                        </div>
                    </div>

                    <!-- 2. Przedział Wieku (Wiek Od - Do) -->
                    <div class="age-slider-double">
                        <div class="filter-group-title" style="margin-bottom: 2px;">
                            <i class="fa-solid fa-cake-candles"></i> Przedział Wieku: 
                            <span id="filterAgeLabel" style="color: #facc15; font-weight: 800; margin-left: 6px;">18 – 75 lat</span>
                        </div>
                        <div class="age-slider-row">
                            <span style="font-size: 0.72rem; color: #94a3b8; width: 35px;">Od: <b id="lblMinAge" style="color:#fff;">18</b></span>
                            <input type="range" class="age-slider-input" id="filterAgeSliderMin" min="18" max="75" value="18" oninput="window._updateAgeSliders()">
                        </div>
                        <div class="age-slider-row">
                            <span style="font-size: 0.72rem; color: #94a3b8; width: 35px;">Do: <b id="lblMaxAge" style="color:#fff;">75</b></span>
                            <input type="range" class="age-slider-input" id="filterAgeSliderMax" min="20" max="80" value="75" oninput="window._updateAgeSliders()">
                        </div>
                    </div>

                    <!-- 3. Stan Cywilny -->
                    <div>
                        <div class="filter-group-title"><i class="fa-solid fa-ring"></i> Stan Cywilny</div>
                        <div class="filter-radio-pill-group" id="filterGroupStatus">
                            <span class="filter-radio-pill active" data-val="all" onclick="window._setFilterOption('status', 'all', this)">
                                Dowolny stan
                            </span>
                            <span class="filter-radio-pill" data-val="wolny" onclick="window._setFilterOption('status', 'wolny', this)">
                                🕊️ Panna / Kawaler
                            </span>
                            <span class="filter-radio-pill" data-val="malzenstwo" onclick="window._setFilterOption('status', 'malzenstwo', this)">
                                💍 Małżeństwo
                            </span>
                            <span class="filter-radio-pill" data-val="wdow" onclick="window._setFilterOption('status', 'wdow', this)">
                                🌿 Wdowa / Wdowiec
                            </span>
                            <span class="filter-radio-pill" data-val="wdowa" onclick="window._setFilterOption('status', 'wdowa', this)">
                                🌸 Wdowa
                            </span>
                            <span class="filter-radio-pill" data-val="wdowiec" onclick="window._setFilterOption('status', 'wdowiec', this)">
                                🛡️ Wdowiec
                            </span>
                        </div>
                    </div>

                    <!-- 4. Cel Relacji -->
                    <div>
                        <div class="filter-group-title"><i class="fa-solid fa-heart"></i> Cel Relacji & Powołanie</div>
                        <select id="filterSelectGoal" class="filter-select-luxury" onchange="filterState.goal = this.value">
                            <option value="all">Wszystkie cele relacji</option>
                            <option value="malzenstwo">💍 Szukam małżeństwa według Bożej woli</option>
                            <option value="relacja">❤️ Trwała relacja oparta na wartościach</option>
                            <option value="przyjazn">🤝 Chrześcijańska przyjaźń & rozmowa</option>
                            <option value="modlitwa">🙏 Wspólna modlitwa & budowanie w wierze</option>
                        </select>
                    </div>

                    <!-- 5. Tradycja Wiary / Wyznanie -->
                    <div>
                        <div class="filter-group-title"><i class="fa-solid fa-church"></i> Wyznanie & Tradycja Wiary</div>
                        <select id="filterSelectDenom" class="filter-select-luxury" onchange="filterState.denomination = this.value">
                            <option value="all">Wszystkie tradycje chrześcijańskie</option>
                            <option value="biblijny">✝️ Chrześcijanin Biblijny / Bezdenominacyjny</option>
                            <option value="ewangeliczny">🌿 Wspólnoty Ewangeliczne / Wolne Kościoły</option>
                            <option value="katolicki">⛪ Tradycja Katolicka</option>
                            <option value="charyzmatyczny">🕊️ Ruch Uwielbienia & Charyzmatyczny</option>
                        </select>
                    </div>

                    <!-- 6. Czytanie Słowa Bożego -->
                    <div>
                        <div class="filter-group-title"><i class="fa-solid fa-book-bible"></i> Praktyka Wiary & Pismo Święte</div>
                        <select id="filterSelectBible" class="filter-select-luxury" onchange="filterState.bibleReading = this.value">
                            <option value="all">Dowolna częstotliwość</option>
                            <option value="codziennie">📖 Codziennie rozważam Słowo Boże</option>
                            <option value="regularnie">🌿 Kilka razy w tygodniu</option>
                            <option value="niedziela">⛪ W niedziele i podczas nabożeństw</option>
                        </select>
                    </div>

                    <!-- 7. Lokalizacja / Województwo -->
                    <div>
                        <div class="filter-group-title"><i class="fa-solid fa-location-dot"></i> Województwo / Miasto</div>
                        <select id="filterSelectLocation" class="filter-select-luxury" onchange="filterState.location = this.value">
                            <option value="">Cała Polska & Zagranica</option>
                            <option value="mazowieckie">Mazowieckie (Warszawa, Radom, Płock...)</option>
                            <option value="malopolskie">Małopolskie (Kraków, Tarnów, Nowy Sącz...)</option>
                            <option value="slaskie">Śląskie (Katowice, Częstochowa, Gliwice...)</option>
                            <option value="wielkopolskie">Wielkopolskie (Poznań, Kalisz, Konin...)</option>
                            <option value="dolnoslaskie">Dolnośląskie (Wrocław, Legnica, Wałbrzych...)</option>
                            <option value="pomorskie">Pomorskie (Gdańsk, Gdynia, Sopot...)</option>
                            <option value="lodzkie">Łódzkie (Łódź, Sieradz, Piotrków...)</option>
                            <option value="lubelskie">Lubelskie (Lublin, Zamość, Chełm...)</option>
                            <option value="podkarpackie">Podkarpackie (Rzeszów, Przemyśl, Krosno...)</option>
                            <option value="kujawsko-pomorskie">Kujawsko-Pomorskie (Bydgoszcz, Toruń...)</option>
                            <option value="zachodniopomorskie">Zachodniopomorskie (Szczecin, Koszalin...)</option>
                            <option value="warminsko-mazurskie">Warmińsko-Mazurskie (Olsztyn, Elbląg...)</option>
                            <option value="swietokrzyskie">Świętokrzyskie (Kielce, Ostrowiec Św....)</option>
                            <option value="podlaskie">Podlaskie (Białystok, Suwałki, Łomża...)</option>
                            <option value="lubuskie">Lubuskie (Zielona Góra, Gorzów Wlkp....)</option>
                            <option value="opolskie">Opolskie (Opole, Nysa, Kędzierzyn...)</option>
                        </select>
                    </div>

                    <!-- 8. Wartości Życiowe & Czystość (Checkboxy) -->
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <div class="filter-group-title"><i class="fa-solid fa-gem"></i> Wartości Chrześcijańskie</div>
                        
                        <div class="filter-checkbox-row" onclick="window._toggleCheckbox('filterCheckPurity')">
                            <input type="checkbox" id="filterCheckPurity" onchange="filterState.purityPriority = this.checked">
                            <label for="filterCheckPurity">✨ Czystość przedmałżeńska jako priorytet</label>
                        </div>

                        <div class="filter-checkbox-row" onclick="window._toggleCheckbox('filterCheckNoAddictions')">
                            <input type="checkbox" id="filterCheckNoAddictions" onchange="filterState.noAddictions = this.checked">
                            <label for="filterCheckNoAddictions">🕊️ Życie wolne od nałogów (bez alkoholu i tytoniu)</label>
                        </div>

                        <div class="filter-checkbox-row" onclick="window._toggleCheckbox('filterCheckWithPhoto')">
                            <input type="checkbox" id="filterCheckWithPhoto" checked onchange="filterState.withPhotoOnly = this.checked">
                            <label for="filterCheckWithPhoto">🖼️ Tylko profile ze zdjęciem</label>
                        </div>
                    </div>

                    <!-- 9. Sortowanie -->
                    <div>
                        <div class="filter-group-title"><i class="fa-solid fa-arrow-down-wide-short"></i> Sortowanie Wyników</div>
                        <select id="filterSelectSort" class="filter-select-luxury" onchange="filterState.sortBy = this.value">
                            <option value="match">✨ Najwyższe dopasowanie duchowe (%)</option>
                            <option value="age_asc">👶 Wiek: od najmłodszych</option>
                            <option value="age_desc">🧓 Wiek: od najstarszych</option>
                            <option value="newest">⚡ Najnowsze profile w społeczności</option>
                        </select>
                    </div>

                </div>

                <!-- Footer Actions -->
                <div style="display: flex; gap: 10px; padding: 14px 20px; border-top: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02);">
                    <button type="button" onclick="window.resetAdvancedFilters()" style="flex: 1; padding: 12px; border-radius: 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-weight: 700; font-family: inherit; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;">
                        Wyczyść
                    </button>
                    <button type="button" id="btnApplyAdvancedFilters" onclick="window.applyAdvancedFilterValues()" style="flex: 2; padding: 12px; border-radius: 14px; background: linear-gradient(90deg, #f59e0b, #ec4899); border: none; color: #fff; font-weight: 800; font-family: inherit; font-size: 0.88rem; cursor: pointer; box-shadow: 0 4px 16px rgba(245,158,11,0.4); display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s;">
                        <span>Zastosuj Filtry</span> <i class="fa-solid fa-sparkles"></i>
                    </button>
                </div>
            </div>
        `;

        // Zamkniecie po kliknieciu w tlo (backdrop)
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                window.closeAdvancedFiltersModal();
            }
        });

        document.body.appendChild(modal);
        return modal;
    }

    // ── INTERFEJS GLOBALNY: OTWARCIE MODALA ──
    window.openAdvancedFiltersModal = function() {
        const modal = getOrCreateModal();
        modal.classList.add('open');
        modal.style.display = 'flex';
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
        document.body.style.overflow = 'hidden';
        try {
            document.querySelectorAll('#luminaCookieConsentBanner, #lumina-cookie-banner, .cookie-banner').forEach(b => {
                b.dataset.prevDisplay = b.style.display || '';
                b.style.display = 'none';
            });
        } catch(e) {}
    };

    // ── ZAMKNIECIE MODALA ──
    window.closeAdvancedFiltersModal = function() {
        const modal = document.getElementById('luminaAdvancedFiltersModal');
        if (modal) {
            modal.classList.remove('open');
            modal.style.display = 'none';
            modal.style.opacity = '0';
            modal.style.pointerEvents = 'none';
        }
        document.body.style.overflow = '';
        try {
            document.querySelectorAll('#luminaCookieConsentBanner, #lumina-cookie-banner, .cookie-banner').forEach(b => {
                if (b.dataset.prevDisplay !== undefined) {
                    b.style.display = b.dataset.prevDisplay;
                }
            });
        } catch(e) {}
    };

    // Obsluga klawisza ESC
    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('luminaAdvancedFiltersModal');
            if (modal && modal.classList.contains('open')) {
                window.closeAdvancedFiltersModal();
            }
        }
    });

    // Pomocniki kontrolek
    window._setFilterOption = function(prop, val, el) {
        filterState[prop] = val;
        if (el && el.parentElement) {
            el.parentElement.querySelectorAll('.filter-radio-pill').forEach(b => b.classList.remove('active'));
            el.classList.add('active');
        }
    };

    window._toggleCheckbox = function(id) {
        const cb = document.getElementById(id);
        if (cb && event.target !== cb) {
            cb.checked = !cb.checked;
            cb.dispatchEvent(new Event('change'));
        }
    };

    window._updateAgeSliders = function() {
        const sMin = document.getElementById('filterAgeSliderMin');
        const sMax = document.getElementById('filterAgeSliderMax');
        if (!sMin || !sMax) return;

        let vMin = parseInt(sMin.value, 10);
        let vMax = parseInt(sMax.value, 10);

        if (vMin > vMax) {
            vMin = vMax;
            sMin.value = vMin;
        }

        filterState.minAge = vMin;
        filterState.maxAge = vMax;

        const lblMin = document.getElementById('lblMinAge');
        const lblMax = document.getElementById('lblMaxAge');
        const lblTotal = document.getElementById('filterAgeLabel');

        if (lblMin) lblMin.textContent = vMin;
        if (lblMax) lblMax.textContent = vMax;
        if (lblTotal) lblTotal.textContent = `${vMin} – ${vMax} lat`;
    };

    // ── RESETOWANIE FILTRÓW ──
    window.resetAdvancedFilters = function() {
        filterState = Object.assign({}, DEFAULT_FILTER_STATE);

        // Reset kontrolek w DOM
        const sMin = document.getElementById('filterAgeSliderMin');
        const sMax = document.getElementById('filterAgeSliderMax');
        if (sMin) sMin.value = 18;
        if (sMax) sMax.value = 75;
        window._updateAgeSliders();

        ['filterGroupGender', 'filterGroupStatus'].forEach(groupId => {
            const grp = document.getElementById(groupId);
            if (grp) {
                grp.querySelectorAll('.filter-radio-pill').forEach((b, idx) => {
                    if (idx === 0) b.classList.add('active');
                    else b.classList.remove('active');
                });
            }
        });

        const selects = {
            'filterSelectGoal': 'all',
            'filterSelectDenom': 'all',
            'filterSelectBible': 'all',
            'filterSelectLocation': '',
            'filterSelectSort': 'match'
        };
        for (const [id, val] of Object.entries(selects)) {
            const el = document.getElementById(id);
            if (el) el.value = val;
        }

        const checks = {
            'filterCheckPurity': false,
            'filterCheckNoAddictions': false,
            'filterCheckWithPhoto': true
        };
        for (const [id, val] of Object.entries(checks)) {
            const el = document.getElementById(id);
            if (el) el.checked = val;
        }

        window.applyAdvancedFilterValues();
    };

    // ── ZASTOSOWANIE FILTROW DO KARUZELI ──
    window.applyAdvancedFilterValues = function() {
        window.closeAdvancedFiltersModal();

        const carousel = document.getElementById('profilesCarousel');
        if (!carousel) return;

        const cards = Array.from(carousel.querySelectorAll('.profile-card'));
        let matchCount = 0;

        cards.forEach(card => {
            // Czy to karta wideo/reklamy?
            const isVideoCard = card.classList.contains('video-card');
            if (isVideoCard) {
                // Reklamy promocyjne zostawiamy aktywne
                card.style.display = '';
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
                return;
            }

            const category = (card.getAttribute('data-category') || '').toLowerCase();
            const slug = (card.getAttribute('data-profile-slug') || card.id.replace('card_profile_', '')).toLowerCase();
            const nameText = (card.querySelector('.card-name')?.textContent || '').toLowerCase();
            const cityText = (card.querySelector('.card-city, .card-location')?.textContent || '').toLowerCase();
            const descText = (card.querySelector('.card-desc, p')?.textContent || '').toLowerCase();
            const matchText = (card.querySelector('.card-match')?.textContent || '90%').replace('%', '').trim();

            const pDb = (window.PROFILES_DB && (window.PROFILES_DB[slug] || window.PROFILES_DB[slug.replace(/^u_/, '')]))
                     || (window.LUMINA_BASE_PROFILES && (window.LUMINA_BASE_PROFILES[slug] || window.LUMINA_BASE_PROFILES[slug.replace(/^u_/, '')]))
                     || (typeof window.getLiveProfile === 'function' && window.getLiveProfile(slug))
                     || null;

            let isMatch = true;

            // 1. Płeć (priorytet dla jawnych danych schematu / detectProfileGender)
            const detectedGender = pDb && typeof window.detectProfileGender === 'function'
                ? window.detectProfileGender(pDb)
                : 'unknown';
            if (filterState.gender === 'kobieta') {
                const isFemale = detectedGender !== 'unknown'
                    ? detectedGender === 'female'
                    : (category.includes('kobieta') ||
                       category.includes('ccwomen') ||
                       /\b(wioletta|noemi|weronika|anna|jola|zofia|urszula|zyta|magdalena|julia)\b/.test(nameText) ||
                       (pDb && (pDb.status === 'Panna' || pDb.status === 'Mężatka' || pDb.status === 'Wdowa' || pDb.gender === 'kobieta' || pDb.denom === 'Chrześcijanka')));
                if (!isFemale) isMatch = false;
            } else if (filterState.gender === 'mezczyzna') {
                const isMale = detectedGender !== 'unknown'
                    ? detectedGender === 'male'
                    : (category.includes('mezczyzna') ||
                       category.includes('ccmen') ||
                       /\b(cezary|andrzej|robert|lukasz|łukasz|tomek|tomasz|dawid|zbyszek|marek|piotr)\b/.test(nameText) ||
                       (pDb && (pDb.status === 'Kawaler' || pDb.status === 'Żonaty' || pDb.status === 'Wdowiec' || pDb.gender === 'mezczyzna' || pDb.denom === 'Chrześcijanin')));
                if (!isMale) isMatch = false;
            }

            // 2. Wiek (min & max)
            let age = null;
            const ageMatch = nameText.match(/,\s*(\d{2})/);
            if (ageMatch) {
                age = parseInt(ageMatch[1], 10);
            } else if (pDb && pDb.age) {
                age = parseInt(pDb.age, 10);
            }

            if (age !== null && !isNaN(age)) {
                if (age < filterState.minAge || age > filterState.maxAge) {
                    isMatch = false;
                }
            }

            // 3. Stan Cywilny
            if (filterState.status !== 'all') {
                const combinedStatus = (cityText + ' ' + descText + ' ' + (pDb?.status || '')).toLowerCase();
                if (filterState.status === 'wolny') {
                    const isSingle = combinedStatus.includes('panna') || combinedStatus.includes('kawaler') || combinedStatus.includes('wolny') || combinedStatus.includes('wolna');
                    if (!isSingle) isMatch = false;
                } else if (filterState.status === 'malzenstwo') {
                    const isMarried = combinedStatus.includes('żonaty') || combinedStatus.includes('mężatka') || combinedStatus.includes('małżeństw');
                    if (!isMarried) isMatch = false;
                } else if (filterState.status === 'wdow') {
                    const isWidow = combinedStatus.includes('wdow');
                    if (!isWidow) isMatch = false;
                } else if (filterState.status === 'wdowa') {
                    const isWidowWoman = combinedStatus.includes('wdowa') || (combinedStatus.includes('wdow') && !combinedStatus.includes('wdowiec'));
                    if (!isWidowWoman) isMatch = false;
                } else if (filterState.status === 'wdowiec') {
                    const isWidowMan = combinedStatus.includes('wdowiec') || (combinedStatus.includes('wdow') && !combinedStatus.includes('wdowa'));
                    if (!isWidowMan) isMatch = false;
                }
            }

            // 4. Cel Relacji
            if (filterState.goal !== 'all') {
                const combinedGoal = (descText + ' ' + (pDb?.bio || '') + ' ' + (pDb?.role || '')).toLowerCase();
                if (filterState.goal === 'malzenstwo') {
                    if (!combinedGoal.includes('małżeństw') && !combinedGoal.includes('żon') && !combinedGoal.includes('mąż') && !combinedGoal.includes('rodzin') && !combinedGoal.includes('dom')) {
                        // tolerancja dla profili ogolnych
                        if (!combinedGoal.includes('wiar') && !combinedGoal.includes('panu')) isMatch = false;
                    }
                } else if (filterState.goal === 'przyjazn') {
                    if (!combinedGoal.includes('przyjaźń') && !combinedGoal.includes('rozmow') && !combinedGoal.includes('wspólnot') && !combinedGoal.includes('społeczno')) isMatch = false;
                } else if (filterState.goal === 'modlitwa') {
                    if (!combinedGoal.includes('modlitw') && !combinedGoal.includes('uwielbien') && !combinedGoal.includes('słow') && !combinedGoal.includes('bóg')) isMatch = false;
                }
            }

            // 5. Tradycja Wiary / Wyznanie
            if (filterState.denomination !== 'all') {
                const combinedDenom = (descText + ' ' + (pDb?.church || '') + ' ' + (pDb?.denom || '')).toLowerCase();
                if (filterState.denomination === 'ewangeliczny') {
                    if (!combinedDenom.includes('ewangeli') && !combinedDenom.includes('protestant') && !combinedDenom.includes('wspólnot')) isMatch = false;
                } else if (filterState.denomination === 'katolicki') {
                    if (!combinedDenom.includes('katolick') && !combinedDenom.includes('kościół')) isMatch = false;
                } else if (filterState.denomination === 'charyzmatyczny') {
                    if (!combinedDenom.includes('uwielbien') && !combinedDenom.includes('charyzmat') && !combinedDenom.includes('duch')) isMatch = false;
                }
            }

            // 6. Lokalizacja / Województwo
            if (filterState.location) {
                const locKey = filterState.location.toLowerCase();
                const combinedLoc = (cityText + ' ' + (pDb?.city || '')).toLowerCase();
                
                // Mapowanie wojewodztw na glowne miasta
                const regionMap = {
                    'mazowieckie': ['warszawa', 'radom', 'płock', 'mazow'],
                    'malopolskie': ['kraków', 'tarnów', 'nowy sącz', 'małopol'],
                    'slaskie': ['katowice', 'częstochowa', 'gliwice', 'śląsk'],
                    'wielkopolskie': ['poznań', 'kalisz', 'konin', 'wielkopol'],
                    'dolnoslaskie': ['wrocław', 'legnica', 'wałbrzych', 'dolnośląsk'],
                    'pomorskie': ['gdańsk', 'gdynia', 'sopot', 'pomor'],
                    'lodzkie': ['łódź', 'sieradz', 'piotrków', 'łódzk'],
                    'lubelskie': ['lublin', 'zamość', 'chełm', 'lubel'],
                    'podkarpackie': ['rzeszów', 'przemyśl', 'krosno', 'podkarp'],
                    'kujawsko-pomorskie': ['bydgoszcz', 'toruń', 'włocławek', 'kujaw'],
                    'zachodniopomorskie': ['szczecin', 'koszalin', 'zachodniopomor'],
                    'warminsko-mazurskie': ['olsztyn', 'elbląg', 'warmiń'],
                    'swietokrzyskie': ['kielce', 'ostrowiec', 'świętokrzysk'],
                    'podlaskie': ['białystok', 'suwałki', 'łomża', 'podlas'],
                    'lubuskie': ['zielona góra', 'gorzów', 'lubus'],
                    'opolskie': ['opole', 'nysa', 'kędzierzyn', 'opol']
                };

                const cities = regionMap[locKey] || [locKey];
                const hasLoc = cities.some(c => combinedLoc.includes(c));
                if (!hasLoc) isMatch = false;
            }

            // 7. Czystość przedmałżeńska
            if (filterState.purityPriority) {
                // profile podkreslajace Boze zasady
                const hasPurity = descText.includes('bogu') || descText.includes('wier') || descText.includes('wartośc') || descText.includes('zaufani') || descText.includes('czysto');
                if (!hasPurity) isMatch = false;
            }

            // 8. Bez nałogów
            if (filterState.noAddictions) {
                const isClean = !descText.includes('alkohol') && !descText.includes('tytoń');
                if (!isClean) isMatch = false;
            }

            if (isMatch) {
                card.style.display = '';
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
                card.dataset.matchPercent = matchText;
                card.dataset.profileAge = age || 30;
                matchCount++;
            } else {
                card.style.display = 'none';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
            }
        });

        // Sortowanie widocznych kart
        if (filterState.sortBy === 'age_asc') {
            cards.filter(c => c.style.display !== 'none').sort((a, b) => parseInt(a.dataset.profileAge || 0) - parseInt(b.dataset.profileAge || 0)).forEach(c => carousel.appendChild(c));
        } else if (filterState.sortBy === 'age_desc') {
            cards.filter(c => c.style.display !== 'none').sort((a, b) => parseInt(b.dataset.profileAge || 0) - parseInt(a.dataset.profileAge || 0)).forEach(c => carousel.appendChild(c));
        } else if (filterState.sortBy === 'match') {
            cards.filter(c => c.style.display !== 'none').sort((a, b) => parseInt(b.dataset.matchPercent || 0) - parseInt(a.dataset.matchPercent || 0)).forEach(c => carousel.appendChild(c));
        }

        // Wycentrowanie karuzeli
        if (typeof window.centerMiddleSetPromo === 'function') {
            window.centerMiddleSetPromo(true);
        }

        // Aktualizacja wyglądu przycisku wyzwalacza (Counter & Glow)
        updateTriggerButtonState(matchCount);

        // Toast z wynikiem
        const activeCount = countActiveFilters();
        if (typeof window.showToast === 'function') {
            if (activeCount > 0) {
                window.showToast(`✨ Filtry Wartości aktywne (${activeCount}): znaleziono ${matchCount} profili!`);
            } else {
                window.showToast(`✨ Zresetowano filtry — widoczne wszystkie profile.`);
            }
        }
    };

    // ── AKTUALIZACJA PRZYCISKU WYŚWIETLAJĄCEGO ORAZ BELKI PODSUMOWANIA ──
    function updateTriggerButtonState(matchCount) {
        const btn = document.getElementById('btnAdvancedFiltersModalTrigger');
        const activeCount = countActiveFilters();

        if (btn) {
            if (activeCount > 0) {
                btn.classList.add('has-active-filters');
                btn.innerHTML = `<i class="fa-solid fa-sliders" style="color:#facc15;"></i> <span class="filter-chip-text">Filtry Wartości (${activeCount}) ⚙️</span>`;
            } else {
                btn.classList.remove('has-active-filters');
                btn.innerHTML = `<i class="fa-solid fa-sliders" style="color:#facc15;"></i> <span class="filter-chip-text">Filtry Wartości ⚙️</span>`;
            }
        }

        // Pasek podsumowania filtrow pod wrapem
        const wrap = document.querySelector('.discovery-filters-wrap');
        if (!wrap) return;

        let summaryBar = document.getElementById('luminaActiveFiltersSummaryBar');
        if (activeCount > 0) {
            if (!summaryBar) {
                summaryBar = document.createElement('div');
                summaryBar.id = 'luminaActiveFiltersSummaryBar';
                summaryBar.className = 'active-filters-summary-bar';
                wrap.parentNode.insertBefore(summaryBar, wrap.nextSibling);
            }

            const tags = [];
            if (filterState.gender === 'kobieta') tags.push('🌸 Kobiety');
            if (filterState.gender === 'mezczyzna') tags.push('🛡️ Mężczyźni');
            if (filterState.minAge > 18 || filterState.maxAge < 75) tags.push(`🎂 ${filterState.minAge}–${filterState.maxAge} lat`);
            if (filterState.status !== 'all') {
                let statusLabel = '🌿 ' + filterState.status;
                if (filterState.status === 'wolny') statusLabel = '🕊️ Panna / Kawaler';
                else if (filterState.status === 'malzenstwo') statusLabel = '💍 Małżeństwo';
                else if (filterState.status === 'wdow') statusLabel = '🌿 Wdowa / Wdowiec';
                else if (filterState.status === 'wdowa') statusLabel = '🌸 Wdowa';
                else if (filterState.status === 'wdowiec') statusLabel = '🛡️ Wdowiec';
                tags.push(statusLabel);
            }
            if (filterState.location) tags.push(`📍 ${filterState.location}`);
            if (filterState.purityPriority) tags.push('✨ Czystość');

            summaryBar.innerHTML = `
                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                    <span style="color:#facc15; font-weight:800;"><i class="fa-solid fa-filter"></i> Aktywne filtry:</span>
                    <span style="color:#fff;">${tags.join(' • ') || 'Zaawansowane'}</span>
                    <span style="color:#94a3b8; margin-left:4px;">(Wyniki: <b style="color:#38bdf8;">${matchCount}</b>)</span>
                </div>
                <button type="button" onclick="window.resetAdvancedFilters()" style="background:rgba(239,68,68,0.18); border:1px solid rgba(239,68,68,0.4); color:#fca5a5; padding:3px 10px; border-radius:10px; font-size:0.75rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:4px;">
                    <i class="fa-solid fa-xmark"></i> Wyczyść
                </button>
            `;
            summaryBar.style.display = 'flex';
        } else if (summaryBar) {
            summaryBar.style.display = 'none';
        }
    }

    // ── INICJALIZACJA PRZYCISKU W BELCE ODKRYWANIA ──
    function ensureButtonHook() {
        const btn = document.getElementById('btnAdvancedFiltersModalTrigger');
        if (btn) {
            const handleTrigger = function(e) {
                if (e) {
                    if (e.cancelable) e.preventDefault();
                    if (typeof e.stopPropagation === 'function') e.stopPropagation();
                }
                window.openAdvancedFiltersModal(e);
            };
            btn.onclick = handleTrigger;
            btn.addEventListener('click', handleTrigger);
            btn.addEventListener('touchend', handleTrigger, { passive: false });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(ensureButtonHook, 300);
        });
    } else {
        setTimeout(ensureButtonHook, 300);
    }
})();
