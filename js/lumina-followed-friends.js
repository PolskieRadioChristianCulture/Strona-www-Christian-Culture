/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA FOLLOWED & FRIENDS WIDGET (js/lumina-followed-friends.js)
 * Wyświetla awatary znajomych i obserwowanych pod wizytówką na profilach LUMINA
 * Rozróżnia relacje: Znajomi (🤝 obustronna relacja) vs Obserwowani (✓ jednostronna subskrypcja)
 * Zawiera wbudowaną wyszukiwarkę z zaproszeniami do znajomych i filtrami zakładek
 * Standard: Obsidian & Gold, @ProgresMCC, @SMCC Touch Ergonomics (44px+)
 * ══════════════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    // Baza kluczowych profili społeczności LUMINA
    const COMMUNITY_FRIENDS = [
        {
            slug: 'cezaryrgowski',
            name: 'Cezary Rogowski',
            shortName: 'Cezary',
            avatar: 'avatar_cezary_official.jpg',
            role: 'Założyciel 👑',
            url: 'lumina.cezaryrgowski.html',
            city: 'Ostrowiec Św.',
            defaultFriend: false,
            defaultFollowed: false
        },
        {
            slug: 'wiolettarogowska',
            name: 'Wioletta Rogowska',
            shortName: 'Wioletta',
            avatar: 'avatar_wioletta_official.jpg',
            role: 'Współzałożycielka 🌸',
            url: 'lumina.wiolettarogowska.html',
            city: 'Ostrowiec Św.',
            defaultFriend: false,
            defaultFollowed: false
        },

        {
            slug: 'andrzejthiel',
            name: 'Andrzej Thiel',
            shortName: 'Andrzej',
            avatar: 'avatar_andrzej_thiel.jpg',
            role: 'Lider CC 🛡️',
            url: 'lumina.andrzejthiel.html',
            city: 'Gdańsk',
            defaultFriend: false,
            defaultFollowed: false
        },
        {
            slug: 'jolawojcik',
            name: 'Jola Wójcik',
            shortName: 'Jola',
            avatar: 'avatar_jolawojcik.jpg',
            role: 'Czas Modlitwy 🙏',
            url: 'lumina.jolawojcik.html',
            city: 'Lublin',
            defaultFriend: false,
            defaultFollowed: false
        },
        {
            slug: 'magdalena',
            name: 'Magdalena',
            shortName: 'Magda',
            avatar: 'avatar_magdalena.jpg',
            role: 'Świadectwo 🕊️',
            url: 'lumina.magdalena.html',
            city: 'Poznań',
            defaultFriend: false,
            defaultFollowed: false
        },
        {
            slug: 'pawelmurawski',
            name: 'Paweł Murawski',
            shortName: 'Paweł',
            avatar: 'avatar_pawel_murawski.jpg',
            role: 'Życie z Bogiem ✝️',
            url: 'lumina.pawelmurawski.html',
            city: 'Kraków',
            defaultFriend: false,
            defaultFollowed: false
        },
        {
            slug: 'zofiadudek',
            name: 'Zofia Dudek',
            shortName: 'Zofia',
            avatar: 'avatar_zofia_dudek.jpg',
            role: 'Rodzina 🌿',
            url: 'lumina.zofiadudek.html',
            city: 'Wrocław',
            defaultFriend: false,
            defaultFollowed: false
        },
        {
            slug: 'tomek',
            name: 'Tomasz',
            shortName: 'Tomek',
            avatar: 'avatar_tomek.jpg',
            role: 'Młodzież 🎸',
            url: 'lumina.html?user=tomek',
            city: 'Warszawa',
            defaultFriend: false,
            defaultFollowed: false
        },
        {
            slug: 'noemi',
            name: 'Noemi',
            shortName: 'Noemi',
            avatar: 'avatar_noemi.jpg',
            role: 'Uwielbienie 🎶',
            url: 'lumina.html?user=noemi',
            city: 'Kraków',
            defaultFriend: false,
            defaultFollowed: false
        },
        {
            slug: 'dawid',
            name: 'Dawid',
            shortName: 'Dawid',
            avatar: 'avatar_dawid.jpg',
            role: 'Ewangelizacja 📖',
            url: 'lumina.html?user=dawid',
            city: 'Wrocław',
            defaultFriend: false,
            defaultFollowed: false
        },
        {
            slug: 'weronika',
            name: 'Weronika',
            shortName: 'Weronika',
            avatar: 'avatar_weronika.jpg',
            role: 'Diakonia 🌸',
            url: 'lumina.html?user=weronika',
            city: 'Łódź',
            defaultFriend: false,
            defaultFollowed: false
        },
        {
            slug: 'ania',
            name: 'Ania',
            shortName: 'Ania',
            avatar: 'avatar_ania.jpg',
            role: 'Modlitwa 🕊️',
            url: 'lumina.html?user=anna',
            city: 'Gdańsk',
            defaultFriend: false,
            defaultFollowed: false
        },
        {
            slug: 'robert',
            name: 'Robert',
            shortName: 'Robert',
            avatar: 'avatar_robert.jpg',
            role: 'Świadectwo ✝️',
            url: 'lumina.html?user=robert',
            city: 'Katowice',
            defaultFriend: false,
            defaultFollowed: false
        }
    ];

    // Aktywny stan filtra zakładek: 'all' | 'friends' | 'followed'
    let currentFilterTab = 'all';
    // Aktywny stan wyszukiwarki
    let currentSearchQuery = '';

    // Wstrzyknięcie stylów CSS
    function injectStyles() {
        if (document.getElementById('lumina-followed-friends-styles')) return;

        const styleEl = document.createElement('style');
        styleEl.id = 'lumina-followed-friends-styles';
        styleEl.textContent = `
            .followed-friends-card {
                background: var(--navy-surface, #0b1838) !important;
                border: 1px solid rgba(245, 158, 11, 0.28) !important;
                border-radius: var(--radius-lg, 20px) !important;
                padding: 18px !important;
                margin-bottom: 22px !important;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
                position: relative;
                overflow: hidden;
            }

            .followed-friends-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, transparent, #facc15, #38bdf8, transparent);
            }

            .followed-friends-header {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                gap: 6px;
                margin-bottom: 8px;
            }

            .followed-friends-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.98rem;
                font-weight: 800;
                color: #fff;
            }

            .followed-friends-badge {
                background: rgba(245, 158, 11, 0.16);
                border: 1px solid rgba(245, 158, 11, 0.4);
                color: #fef08a;
                font-size: 0.72rem;
                font-weight: 800;
                padding: 3px 9px;
                border-radius: 14px;
            }

            /* ── WYSZUKIWARKA ZNAJOMYCH ── */
            .friends-search-box {
                position: relative;
                width: 100%;
                margin: 10px 0 12px 0;
            }

            .friends-search-input {
                width: 100%;
                height: 38px;
                box-sizing: border-box;
                padding: 0 34px 0 34px;
                border-radius: 20px;
                background: rgba(15, 23, 42, 0.75);
                border: 1px solid rgba(250, 204, 21, 0.3);
                color: #fff;
                font-size: 0.78rem;
                font-family: inherit;
                outline: none;
                transition: all 0.2s;
            }

            .friends-search-input:focus {
                border-color: #facc15;
                background: rgba(15, 23, 42, 0.95);
                box-shadow: 0 0 12px rgba(250, 204, 21, 0.35);
            }

            .friends-search-icon {
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: #facc15;
                font-size: 0.82rem;
                pointer-events: none;
            }

            .friends-search-clear {
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(255,255,255,0.12);
                border: none;
                color: #94a3b8;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.65rem;
                cursor: pointer;
                transition: all 0.15s;
            }

            .friends-search-clear:hover {
                color: #fff;
                background: rgba(239, 68, 68, 0.6);
            }

            /* ── ZAKŁADKI: Wszyscy / Znajomi 🤝 / Obserwowani ✓ ── */
            .friends-filter-tabs {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
                margin-bottom: 12px;
                background: rgba(0, 0, 0, 0.25);
                padding: 3px;
                border-radius: 12px;
                border: 1px solid rgba(255, 255, 255, 0.06);
            }

            .friends-tab-btn {
                flex: 1 1 auto;
                min-width: 0;
                background: transparent;
                border: none;
                color: #94a3b8;
                font-size: 0.68rem;
                font-weight: 700;
                padding: 6px 4px;
                border-radius: 9px;
                cursor: pointer;
                text-align: center;
                transition: all 0.2s;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .friends-tab-btn:hover {
                color: #fff;
                background: rgba(255, 255, 255, 0.05);
            }

            .friends-tab-btn.active {
                background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(56, 189, 248, 0.2));
                color: #fef08a;
                border: 1px solid rgba(250, 204, 21, 0.45);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            }

            /* ── SIATKA 3 KOLUMNY ── */
            .followed-friends-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 14px 6px;
                margin-bottom: 16px;
                width: 100%;
                box-sizing: border-box;
            }

            @media (max-width: 480px) {
                .followed-friends-grid {
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px 4px;
                }
            }

            .followed-friend-item {
                text-decoration: none;
                display: flex;
                flex-direction: column;
                align-items: center;
                cursor: pointer;
                transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                -webkit-tap-highlight-color: transparent;
                width: 100%;
                min-width: 0;
                box-sizing: border-box;
                position: relative;
            }

            .followed-friend-item:hover {
                transform: translateY(-3px) scale(1.04);
            }

            .followed-avatar-wrapper {
                position: relative;
                width: 52px;
                height: 52px;
                margin-bottom: 5px;
                flex-shrink: 0;
            }

            .followed-avatar-anchor {
                display: block;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                text-decoration: none;
            }

            .followed-avatar-img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                object-fit: cover;
                border: 2px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                transition: all 0.2s;
            }

            .followed-friend-item:hover .followed-avatar-img {
                border-color: #facc15;
                box-shadow: 0 0 16px rgba(250, 204, 21, 0.6);
            }

            /* Aktywny obrys dla znajomego / obserwowanego */
            .followed-friend-item.is-friend .followed-avatar-img {
                border-color: #38bdf8;
                box-shadow: 0 0 12px rgba(56, 189, 248, 0.45);
            }

            .followed-friend-item.is-active-follow .followed-avatar-img {
                border-color: #facc15;
                box-shadow: 0 0 14px rgba(250, 204, 21, 0.45);
            }

            .followed-friend-item.is-friend.is-active-follow .followed-avatar-img {
                border-color: #facc15;
                box-shadow: 0 0 16px rgba(250, 204, 21, 0.5), 0 0 8px rgba(56, 189, 248, 0.4);
            }

            .followed-online-dot {
                position: absolute;
                bottom: 2px;
                right: 2px;
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: #10b981;
                border: 2px solid #070b16;
                box-shadow: 0 0 8px #10b981;
                cursor: pointer;
                z-index: 5;
                outline: none;
                padding: 0;
                transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
                -webkit-tap-highlight-color: transparent;
            }

            .followed-online-dot::after {
                content: '';
                position: absolute;
                top: -12px;
                left: -12px;
                right: -12px;
                bottom: -12px;
                border-radius: 50%;
            }

            .followed-online-dot:hover {
                transform: scale(1.35);
                background: #34d399;
                box-shadow: 0 0 12px #34d399;
                border-color: #facc15;
            }

            .followed-online-dot:active {
                transform: scale(0.92);
            }

            /* Ukrycie starych elementów przyklejonych do zdjęcia (wszystko przeniesione pod zieloną kropkę) */
            .followed-check-badge,
            .followed-friend-badge,
            .followed-card-opt-btn {
                display: none !important;
            }

            .followed-friend-name {
                font-size: 0.75rem;
                font-weight: 700;
                color: #fff;
                text-align: center;
                width: 100%;
                max-width: 84px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                line-height: 1.25;
            }

            .followed-friend-item.is-active-follow .followed-friend-name {
                color: #fef08a;
            }

            .followed-friend-role {
                font-size: 0.64rem;
                color: #94a3b8;
                text-align: center;
                width: 100%;
                max-width: 84px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                line-height: 1.2;
                margin-top: 2px;
            }

            .followed-discover-btn {
                position: relative;
                width: 52px;
                height: 52px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.05);
                border: 2px dashed rgba(245, 158, 11, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #facc15;
                font-size: 1.1rem;
                margin-bottom: 5px;
                transition: all 0.2s;
                flex-shrink: 0;
            }

            .followed-friend-item:hover .followed-discover-btn {
                background: rgba(245, 158, 11, 0.15);
                border-color: #facc15;
                transform: rotate(90deg);
            }

            /* ── WYNIKI WYSZUKIWANIA (LISTA WYNIKÓW) ── */
            .friends-search-results {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-bottom: 16px;
                max-height: 280px;
                overflow-y: auto;
                padding-right: 4px;
            }

            .friends-search-results::-webkit-scrollbar {
                width: 4px;
            }
            .friends-search-results::-webkit-scrollbar-thumb {
                background: rgba(250, 204, 21, 0.3);
                border-radius: 4px;
            }

            .search-result-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                padding: 8px 10px;
                transition: all 0.2s;
            }

            .search-result-item:hover {
                background: rgba(255, 255, 255, 0.07);
                border-color: rgba(250, 204, 21, 0.3);
            }

            .search-result-user {
                display: flex;
                align-items: center;
                gap: 8px;
                text-decoration: none;
                flex: 1;
                min-width: 0;
            }

            .search-result-avatar {
                width: 38px;
                height: 38px;
                border-radius: 50%;
                object-fit: cover;
                border: 1.5px solid rgba(250, 204, 21, 0.4);
                flex-shrink: 0;
            }

            .search-result-meta {
                display: flex;
                flex-direction: column;
                min-width: 0;
            }

            .search-result-name {
                font-size: 0.78rem;
                font-weight: 700;
                color: #fff;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .search-result-role {
                font-size: 0.65rem;
                color: #94a3b8;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .search-result-actions {
                display: flex;
                align-items: center;
                gap: 4px;
                flex-shrink: 0;
            }

            .btn-action-mini {
                padding: 5px 8px;
                border-radius: 12px;
                font-size: 0.65rem;
                font-weight: 800;
                cursor: pointer;
                border: none;
                transition: all 0.2s;
                display: inline-flex;
                align-items: center;
                gap: 4px;
            }

            .btn-action-mini.friend-btn {
                background: rgba(56, 189, 248, 0.18);
                color: #38bdf8;
                border: 1px solid rgba(56, 189, 248, 0.45);
            }

            .btn-action-mini.friend-btn:hover {
                background: #0284c7;
                color: #fff;
            }

            .btn-action-mini.friend-btn.is-active {
                background: #0284c7;
                color: #fff;
                border-color: #38bdf8;
            }

            .btn-action-mini.friend-btn.is-pending {
                background: rgba(245, 158, 11, 0.2);
                color: #fde047;
                border-color: rgba(245, 158, 11, 0.5);
            }

            .btn-action-mini.follow-btn {
                background: rgba(245, 158, 11, 0.15);
                color: #fef08a;
                border: 1px solid rgba(245, 158, 11, 0.4);
            }

            .btn-action-mini.follow-btn:hover {
                background: #f59e0b;
                color: #000;
            }

            .btn-action-mini.follow-btn.is-active {
                background: #f59e0b;
                color: #000;
                font-weight: 800;
            }

            /* Pusty stan wyników */
            .friends-search-empty {
                text-align: center;
                padding: 16px 8px;
                font-size: 0.76rem;
                color: #94a3b8;
            }

            /* Przycisk dolny */
            .btn-discover-all-friends {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                width: 100%;
                padding: 10px 14px;
                border-radius: 14px;
                background: rgba(245, 158, 11, 0.1);
                border: 1px solid rgba(245, 158, 11, 0.3);
                color: #fef08a;
                text-decoration: none;
                font-size: 0.80rem;
                font-weight: 800;
                transition: all 0.2s;
                min-height: 44px;
                box-sizing: border-box;
            }

            .btn-discover-all-friends:hover {
                background: rgba(245, 158, 11, 0.2);
                border-color: #facc15;
                color: #fff;
            }

            /* Toast powiadomień */
            .friends-mini-toast {
                position: fixed;
                bottom: 24px;
                right: 24px;
                background: rgba(15, 23, 42, 0.95);
                border: 1px solid #facc15;
                color: #fff;
                padding: 10px 16px;
                border-radius: 12px;
                font-size: 0.82rem;
                font-weight: 700;
                box-shadow: 0 8px 24px rgba(0,0,0,0.5);
                z-index: 999999;
                display: flex;
                align-items: center;
                gap: 8px;
                animation: friendsToastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .followed-card-opt-btn,
            .followed-friend-badge,
            .followed-check-badge {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                width: 0 !important;
                height: 0 !important;
            }

            /* ── MODAL RELACJI I ZARZĄDZANIA ── */
            .lumina-rel-modal-overlay {
                position: fixed;
                inset: 0;
                z-index: 100005;
                background: rgba(0, 0, 0, 0.78);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                display: none;
                align-items: center;
                justify-content: center;
                padding: 16px;
                animation: friendsToastIn 0.2s ease;
            }

            .lumina-rel-modal-overlay.open {
                display: flex;
            }

            .lumina-rel-modal-card {
                position: relative;
                width: 100%;
                max-width: 360px;
                background: #0b142e;
                border: 1px solid rgba(250, 204, 21, 0.4);
                border-radius: 20px;
                padding: 20px;
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.85), 0 0 25px rgba(250, 204, 21, 0.15);
                box-sizing: border-box;
            }

            .lumina-rel-modal-close {
                position: absolute;
                top: 12px;
                right: 12px;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.15);
                color: #94a3b8;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 0.85rem;
                transition: all 0.2s;
            }

            .lumina-rel-modal-close:hover {
                color: #fff;
                background: rgba(239, 68, 68, 0.7);
                border-color: #ef4444;
            }

            .lumina-rel-modal-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
                padding-bottom: 14px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .lumina-rel-modal-avatar {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                object-fit: cover;
                border: 2px solid #facc15;
                box-shadow: 0 0 12px rgba(250, 204, 21, 0.4);
                flex-shrink: 0;
            }

            .lumina-rel-modal-info {
                min-width: 0;
                flex: 1;
            }

            .lumina-rel-modal-name {
                font-size: 1rem;
                font-weight: 800;
                color: #fff;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .lumina-rel-modal-role {
                font-size: 0.74rem;
                color: #94a3b8;
                margin-top: 2px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .lumina-rel-modal-actions {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .lumina-rel-btn {
                width: 100%;
                min-height: 44px;
                padding: 10px 14px;
                border-radius: 14px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                font-size: 0.82rem;
                font-weight: 700;
                font-family: inherit;
                cursor: pointer;
                border: none;
                text-decoration: none;
                box-sizing: border-box;
                transition: all 0.2s;
            }

            .lumina-rel-btn.is-primary {
                background: rgba(56, 189, 248, 0.2);
                border: 1px solid rgba(56, 189, 248, 0.5);
                color: #38bdf8;
            }

            .lumina-rel-btn.is-primary:hover {
                background: #0284c7;
                color: #fff;
            }

            .lumina-rel-btn.is-gold {
                background: rgba(245, 158, 11, 0.2);
                border: 1px solid rgba(245, 158, 11, 0.5);
                color: #fef08a;
            }

            .lumina-rel-btn.is-gold:hover {
                background: #f59e0b;
                color: #000;
            }

            .lumina-rel-btn.is-danger {
                background: rgba(239, 68, 68, 0.16);
                border: 1px solid rgba(239, 68, 68, 0.5);
                color: #fca5a5;
            }

            .lumina-rel-btn.is-danger:hover {
                background: #ef4444;
                color: #fff;
            }

            .lumina-rel-btn.is-outline {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.15);
                color: #cbd5e1;
            }

            .lumina-rel-btn.is-outline:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
            }

            .lumina-rel-admin-sep {
                height: 1px;
                background: linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.5), transparent);
                margin: 4px 0;
            }

            .lumina-rel-btn.is-master-delete {
                background: linear-gradient(135deg, rgba(220, 38, 38, 0.25), rgba(153, 27, 27, 0.35));
                border: 1px solid #ef4444;
                color: #fca5a5;
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
            }

            .lumina-rel-btn.is-master-delete:hover {
                background: #dc2626;
                color: #fff;
                box-shadow: 0 4px 16px rgba(220, 38, 38, 0.6);
            }

            .btn-action-mini.btn-delete-prof-mini {
                background: rgba(239, 68, 68, 0.2);
                color: #fca5a5;
                border: 1px solid rgba(239, 68, 68, 0.5);
                padding: 5px 8px;
            }

            .btn-action-mini.btn-delete-prof-mini:hover {
                background: #ef4444;
                color: #fff;
                border-color: #f87171;
                box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
            }

            @keyframes friendsToastIn {
                from { opacity: 0; transform: translateY(12px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(styleEl);
    }

    // Wyświetlanie powiadomienia Toast
    function showToast(message) {
        if (typeof window.showToast === 'function') {
            window.showToast(message);
            return;
        }

        const existing = document.querySelector('.friends-mini-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'friends-mini-toast';
        toast.innerHTML = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.transition = 'opacity 0.3s ease';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2600);
    }

    // ── ZARZĄDZANIE RELACJAMI: ZNAJOMOŚĆ (FRIENDSHIP) ──
    function getFriendshipStatus(slug) {
        if (!slug) return null;
        try {
            const val = localStorage.getItem('lumina_friend_' + slug);
            if (val === 'accepted' || val === 'pending') return val;
            if (val === '0' || val === 'none') return null;
        } catch (e) {}
        return null;
    }

    function isFriend(slug) {
        return getFriendshipStatus(slug) === 'accepted';
    }

    function sendFriendRequest(slug) {
        const item = COMMUNITY_FRIENDS.find(f => f.slug === slug);
        const name = item ? item.name : slug;
        const current = getFriendshipStatus(slug);

        if (current === 'accepted') {
            // Usunięcie ze znajomych (przełącznik)
            localStorage.setItem('lumina_friend_' + slug, '0');
            showToast(`Usunięto z grona znajomych: ${name}`);
        } else if (current === 'pending') {
            // Anulowanie zaproszenia
            localStorage.setItem('lumina_friend_' + slug, '0');
            showToast(`Anulowano zaproszenie do: ${name}`);
        } else {
            // Wysłanie zaproszenia
            localStorage.setItem('lumina_friend_' + slug, 'pending');
            showToast(`🤝 Wysłano zaproszenie do grona znajomych do: ${name}!`);

            // Rejestracja w centrum powiadomień jeśli aktywne
            if (window.LuminaNotificationCenter && typeof window.LuminaNotificationCenter.notify === 'function') {
                window.LuminaNotificationCenter.notify({
                    type: 'friend_request_sent',
                    title: 'Zaproszenie do znajomych 🤝',
                    message: `Wysłałeś zaproszenie do ${name}`,
                    senderName: name,
                    avatar: item ? item.avatar : 'lumina_icon.jpg'
                });
            }
        }

        window.dispatchEvent(new CustomEvent('lumina:friendshipChange', { detail: { slug } }));
        refreshWidgetView();
    }

    // ── ZARZĄDZANIE RELACJAMI: OBSERWOWANIE (FOLLOWING) ──
    function isFollowing(slug) {
        if (!slug) return false;
        try {
            const val = localStorage.getItem('lumina_following_' + slug);
            if (val === '1' || val === 'true') return true;
            if (val === '0' || val === 'false') return false;
        } catch (e) {}

        if (typeof window.isFollowingLocally === 'function') {
            return window.isFollowingLocally(slug);
        }

        return false;
    }

    function toggleFollow(slug) {
        const item = COMMUNITY_FRIENDS.find(f => f.slug === slug);
        const name = item ? item.name : slug;
        const currentlyFollowing = isFollowing(slug);

        if (currentlyFollowing) {
            localStorage.setItem('lumina_following_' + slug, '0');
            showToast(`Przestałeś obserwować publikacje: ${name}`);
        } else {
            localStorage.setItem('lumina_following_' + slug, '1');
            showToast(`✓ Obserwujesz publikacje i świadectwa: ${name}!`);
        }

        window.dispatchEvent(new CustomEvent('lumina:followChange', { detail: { slug } }));
        refreshWidgetView();
    }

    // Sprawdza czy profil został oznaczony jako trwale usunięty przez Dowódcę
    function isDeletedProfile(slug) {
        if (!slug) return false;
        try {
            const deleted = JSON.parse(localStorage.getItem('lumina_deleted_profiles') || '[]');
            const clean = String(slug).toLowerCase().trim();
            return deleted.includes(clean) || deleted.includes(clean.replace(/^u_/, ''));
        } catch(e) {
            return false;
        }
    }

    // Sprawdza uprawnienia Dowódcy / Master Admin (wyłącznie zweryfikowany Firebase Auth)
    function checkIsMasterAdmin() {
        return Boolean(
            (window.LuminaGuard && typeof window.LuminaGuard.isMasterAdmin === 'function' && window.LuminaGuard.isMasterAdmin()) ||
            (window.LuminaDB && typeof window.LuminaDB.isLuminaMasterAdmin === 'function' && window.LuminaDB.isLuminaMasterAdmin())
        );
    }

    function ensureRelationshipModal() {
        let modal = document.getElementById('luminaFollowedRelModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'luminaFollowedRelModal';
            modal.className = 'lumina-rel-modal-overlay';
            modal.onclick = function(e) {
                if (e.target === modal) modal.classList.remove('open');
            };
            document.body.appendChild(modal);
        }
        return modal;
    }

    function openRelationshipModal(data) {
        const modal = ensureRelationshipModal();
        const isMaster = checkIsMasterAdmin();
        const isFr = data.isFriend === true || data.isFriend === 'true';
        const isFoll = data.isFollowed === true || data.isFollowed === 'true';

        modal.innerHTML = `
            <div class="lumina-rel-modal-card">
                <button type="button" class="lumina-rel-modal-close" onclick="document.getElementById('luminaFollowedRelModal').classList.remove('open')">✕</button>
                <div class="lumina-rel-modal-header">
                    <img src="${data.avatar || 'lumina_icon.jpg'}" alt="${escapeHtml(data.name)}" onerror="this.src='lumina_icon.jpg'" class="lumina-rel-modal-avatar">
                    <div class="lumina-rel-modal-info">
                        <div class="lumina-rel-modal-name">${escapeHtml(data.name)}</div>
                        <div class="lumina-rel-modal-role">${escapeHtml(data.role || '')} ${data.city ? `• ${escapeHtml(data.city)}` : ''}</div>
                        <div class="lumina-rel-modal-status-pills" style="display:flex; flex-wrap:wrap; gap:6px; margin-top:8px;">
                            <span style="display:inline-flex; align-items:center; gap:5px; font-size:0.72rem; padding:3px 9px; border-radius:12px; background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.35); font-weight:700;">
                                <span style="width:7px; height:7px; border-radius:50%; background:#10b981; display:inline-block; box-shadow:0 0 6px #10b981;"></span> Dostępny online
                            </span>
                            ${isFr ? `
                                <span style="display:inline-flex; align-items:center; gap:5px; font-size:0.72rem; padding:3px 9px; border-radius:12px; background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.35); font-weight:700;">
                                    🤝 Twój Znajomy
                                </span>
                            ` : ''}
                            ${isFoll ? `
                                <span style="display:inline-flex; align-items:center; gap:5px; font-size:0.72rem; padding:3px 9px; border-radius:12px; background:rgba(250,204,21,0.15); color:#facc15; border:1px solid rgba(250,204,21,0.35); font-weight:700;">
                                    ✓ Obserwujesz
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>
                <div class="lumina-rel-modal-actions">
                    <!-- 1. Znajomość: Dodaj / Usuń ze znajomych -->
                    <button type="button" class="lumina-rel-btn ${isFr ? 'is-danger' : 'is-primary'}" id="modalRelBtnFriend">
                        <i class="fa-solid fa-handshake"></i>
                        <span>${isFr ? 'Usuń z grona znajomych 🤝' : 'Wyślij zaproszenie do znajomych 🤝'}</span>
                    </button>

                    <!-- 2. Obserwowanie: Obserwuj / Przestań obserwować -->
                    <button type="button" class="lumina-rel-btn ${isFoll ? 'is-danger' : 'is-gold'}" id="modalRelBtnFollow">
                        <i class="fa-solid fa-check"></i>
                        <span>${isFoll ? 'Przestań obserwować publikacje ✓' : 'Zacznij obserwować publikacje ✓'}</span>
                    </button>

                    <!-- 3. Zobacz profil -->
                    <a href="${data.url}" class="lumina-rel-btn is-outline">
                        <i class="fa-solid fa-user"></i>
                        <span>Przejdź do profilu</span>
                    </a>

                    <!-- 4. Tylko dla Dowódcy: Trwałe usunięcie profilu -->
                    ${isMaster ? `
                        <div class="lumina-rel-admin-sep"></div>
                        <button type="button" class="lumina-rel-btn is-master-delete" id="modalRelBtnAdminDelete">
                            <i class="fa-solid fa-trash-can"></i>
                            <span>🗑️ Trwale usuń profil z portalu LUMINA</span>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        const friendBtn = modal.querySelector('#modalRelBtnFriend');
        if (friendBtn) {
            friendBtn.onclick = function() {
                sendFriendRequest(data.slug);
                modal.classList.remove('open');
            };
        }

        const followBtn = modal.querySelector('#modalRelBtnFollow');
        if (followBtn) {
            followBtn.onclick = function() {
                toggleFollow(data.slug);
                modal.classList.remove('open');
            };
        }

        const adminDelBtn = modal.querySelector('#modalRelBtnAdminDelete');
        if (adminDelBtn) {
            adminDelBtn.onclick = function() {
                modal.classList.remove('open');
                if (typeof window.LuminaDeleteProfile === 'function') {
                    window.LuminaDeleteProfile(data.slug, data.name);
                } else if (window.LuminaDB && typeof window.LuminaDB.deleteProfile === 'function') {
                    window.LuminaDB.deleteProfile(data.slug, data.name);
                }
            };
        }

        modal.classList.add('open');
    }

    // Pobiera listę z przypisanymi statusami
    function getFriendsData(currentProfileSlug) {
        const slug = (currentProfileSlug || '').toLowerCase();
        
        // Zalogowany użytkownik w sesji
        let mySlug = '';
        try {
            const curUser = window.LuminaDB?.getCurrentUser?.();
            const curProf = window.LuminaDB?.getCurrentProfile?.() || JSON.parse(localStorage.getItem('lumina_current_user_profile') || 'null');
            mySlug = (curProf?.slug || curProf?.uid || curUser?.uid || localStorage.getItem('lumina_user_slug') || '').toLowerCase();
        } catch(e) {}

        const isForeignProfile = slug && mySlug && slug !== mySlug && !slug.includes(mySlug) && !mySlug.includes(slug);

        // Jeśli jesteśmy na profilu innego użytkownika (np. u_tijanihammed_9980):
        // NIGDY nie wyświetlaj znajomych/obserwowanych z localStorage osoby przeglądającej stronę!
        // Wyświetlaj WYŁĄCZNIE rzeczywistych znajomych przypisanych do tego profilu w bazie.
        if (isForeignProfile) {
            const profileData = (window._cloudProfileData && (window._cloudProfileData.slug === slug || window._cloudProfileData.uid === slug))
                ? window._cloudProfileData
                : (window.PROFILES_DB ? (window.PROFILES_DB[slug] || window.PROFILES_DB['u_' + slug]) : null);
            
            const profileFriends = Array.isArray(profileData?.friends) ? profileData.friends : [];
            const profileFollowed = Array.isArray(profileData?.following) ? profileData.following : [];

            // Jeśli profil nie dodał jeszcze nikogo (np. nowy użytkownik na start) -> 0 powiązań!
            if (profileFriends.length === 0 && profileFollowed.length === 0) {
                return [];
            }

            const friends = COMMUNITY_FRIENDS.filter(f => f.slug !== slug && !isDeletedProfile(f.slug));
            return friends.map(f => {
                const isFr = profileFriends.includes(f.slug);
                const isFoll = profileFollowed.includes(f.slug);
                return {
                    ...f,
                    isFollowed: isFoll,
                    friendStatus: isFr ? 'accepted' : null,
                    isFriend: isFr
                };
            }).filter(f => f.isFriend || f.isFollowed);
        }

        // Jeśli to własny profil (lub strona główna / tablica)
        const friends = COMMUNITY_FRIENDS.filter(f => f.slug !== slug && !isDeletedProfile(f.slug));

        const mapped = friends.map(f => {
            const followed = isFollowing(f.slug);
            const friendStatus = getFriendshipStatus(f.slug);
            const isFr = friendStatus === 'accepted';
            return {
                ...f,
                isFollowed: followed,
                friendStatus: friendStatus,
                isFriend: isFr
            };
        });

        return mapped;
    }

    // Sortowanie: najpierw Znajomi, potem Obserwowani
    function sortFriends(list) {
        return [...list].sort((a, b) => {
            if (a.isFriend && !b.isFriend) return -1;
            if (!a.isFriend && b.isFriend) return 1;
            if (a.isFollowed && !b.isFollowed) return -1;
            if (!a.isFollowed && b.isFollowed) return 1;
            return 0;
        });
    }

    // Odświeżenie widoku widżetu
    function refreshWidgetView() {
        const slot = document.getElementById('luminaFollowedFriendsSlot') || document.getElementById('followedFriendsCard');
        if (slot) {
            const currentSlug = detectCurrentProfileSlug();
            renderFollowedFriends(slot, currentSlug);
        }
    }

    // ── RENDEROWANIE GŁÓWNEGO WIDŻETU ──
    function renderFollowedFriends(container, currentProfileSlug) {
        if (!container) return;

        injectStyles();

        const allFriends = getFriendsData(currentProfileSlug);
        const friendsCount = allFriends.filter(f => f.isFriend).length;
        const followedCount = allFriends.filter(f => f.isFollowed).length;
        const totalConnections = friendsCount + followedCount;
        const isMaster = checkIsMasterAdmin();

        const profileBioMap = {
            'cezaryrgowski': 'Założyciel Christian Culture. Razem z żoną Wiolettą służymy Panu.',
            'wiolettarogowska': 'Współzałożycielka Christian Culture. Razem z mężem Cezarym służymy Panu.',
            'zbyszekgieron': 'Głoszenie Ewangelii, misja i świadectwo żywej wiary w Chrystusie.',
            'andrzejthiel': 'Lider męskich grup, formacja i wzrost duchowy w Bożej prawdzie.',
            'jolawojcik': 'Wstawiennictwo, modlitwa i wsparcie dla potrzebujących serc.'
        };
        let subtext = profileBioMap[currentProfileSlug];
        if (!subtext) {
            subtext = totalConnections === 0
                ? 'Ten profil nie dodał jeszcze znajomych ani nie obserwuje osób w społeczności LUMINA.'
                : 'Osoby ze społeczności LUMINA, z którymi budujesz braterstwo i wiarę:';
        }

        // Filtrowanie według aktywnej zakładki: w zakładce 'all' pokazuj tylko rzeczywistych znajomych/obserwowanych
        let filteredByTab = allFriends.filter(f => f.isFriend || f.isFollowed);
        if (currentFilterTab === 'friends') {
            filteredByTab = allFriends.filter(f => f.isFriend);
        } else if (currentFilterTab === 'followed') {
            filteredByTab = allFriends.filter(f => f.isFollowed);
        }

        const sortedFriends = sortFriends(filteredByTab);

        // Filtrowanie według wyszukiwarki
        const query = (currentSearchQuery || '').trim().toLowerCase();
        let searchResults = [];
        let isSearching = query.length > 0;

        if (isSearching) {
            searchResults = allFriends.filter(f => {
                return f.name.toLowerCase().includes(query) ||
                       f.shortName.toLowerCase().includes(query) ||
                       f.role.toLowerCase().includes(query) ||
                       (f.city && f.city.toLowerCase().includes(query));
            });
        }

        // Siatka 3 kolumny: do 8 osób + 1 kafelek Odkryj Więcej
        const displayGridFriends = sortedFriends.slice(0, 8);

        const html = `
            <div class="followed-friends-header">
                <div class="followed-friends-title">
                    <i class="fa-solid fa-user-group" style="color:#facc15;"></i>
                    <span>Znajomi & Obserwowani</span>
                </div>
                <span class="followed-friends-badge">
                    ${friendsCount} znajomych • ${followedCount} obs.
                </span>
            </div>
            
            <p style="font-size:0.80rem; color:#94a3b8; line-height:1.45; margin:0 0 10px 0;">
                ${subtext}
            </p>

            <!-- ── WYSZUKIWARKA ZNAJOMYCH ── -->
            <div class="friends-search-box">
                <i class="fa-solid fa-magnifying-glass friends-search-icon"></i>
                <input type="text" 
                       id="friendsSearchInput" 
                       class="friends-search-input" 
                       placeholder="Szukaj osoby, znajomego..." 
                       value="${escapeHtml(currentSearchQuery)}"
                       autocomplete="off" />
                ${isSearching ? `
                    <button type="button" id="friendsSearchClear" class="friends-search-clear" title="Wyczyść szukanie">✕</button>
                ` : ''}
            </div>

            <!-- ── ZAKŁADKI FILTROWANIA ── -->
            ${!isSearching ? `
                <div class="friends-filter-tabs">
                    <button type="button" class="friends-tab-btn ${currentFilterTab === 'all' ? 'active' : ''}" data-tab="all">
                        Wszyscy (${totalConnections})
                    </button>
                    <button type="button" class="friends-tab-btn ${currentFilterTab === 'friends' ? 'active' : ''}" data-tab="friends" title="Osoby z obustronną relacją znajomości">
                        Znajomi 🤝 (${friendsCount})
                    </button>
                    <button type="button" class="friends-tab-btn ${currentFilterTab === 'followed' ? 'active' : ''}" data-tab="followed" title="Osoby, których publikacje obserwujesz">
                        Obserwowani ✓ (${followedCount})
                    </button>
                </div>
            ` : ''}

            <!-- ── WIDOK WYSZUKIWANIA (LISTA Z PRZYCISKAMI AKCJI) ── -->
            ${isSearching ? `
                <div class="friends-search-results">
                    ${searchResults.length > 0 ? searchResults.map(f => {
                        const isFr = f.isFriend;
                        const isPend = f.friendStatus === 'pending';
                        const isFoll = f.isFollowed;

                        return `
                            <div class="search-result-item" data-slug="${f.slug}">
                                <a href="${f.url}" class="search-result-user" title="${f.name} • ${f.role}">
                                    <img src="${f.avatar}" alt="${f.name}" onerror="this.src='lumina_icon.jpg'" class="search-result-avatar">
                                    <div class="search-result-meta">
                                        <div class="search-result-name">${f.name}</div>
                                        <div class="search-result-role">${f.role} (${f.city})</div>
                                    </div>
                                </a>
                                <div class="search-result-actions">
                                    <!-- Przycisk Znajomości -->
                                    <button type="button" 
                                            class="btn-action-mini friend-btn ${isFr ? 'is-active' : (isPend ? 'is-pending' : '')}" 
                                            data-action="friend" 
                                            data-slug="${f.slug}" 
                                            title="${isFr ? 'Jesteście Znajomymi (kliknij aby usunąć ze znajomych)' : (isPend ? 'Wysłano zaproszenie' : 'Wyślij zaproszenie do znajomych')}">
                                        ${isFr ? '🤝 Znajomy' : (isPend ? 'Wysłano ⏳' : '🤝 Zaproś')}
                                    </button>

                                    <!-- Przycisk Obserwowania -->
                                    <button type="button" 
                                            class="btn-action-mini follow-btn ${isFoll ? 'is-active' : ''}" 
                                            data-action="follow" 
                                            data-slug="${f.slug}" 
                                            title="${isFoll ? 'Obserwujesz ten profil (kliknij aby wyłączyć)' : 'Zacznij obserwować'}">
                                        ${isFoll ? '✓' : '+ Obs.'}
                                    </button>

                                    <!-- Przycisk Kasowania dla Dowódcy -->
                                    ${isMaster ? `
                                        <button type="button" 
                                                class="btn-action-mini btn-delete-prof-mini" 
                                                data-action="admin-delete" 
                                                data-slug="${f.slug}" 
                                                data-name="${escapeHtml(f.name)}" 
                                                title="Trwale usuń profil z portalu LUMINA (Tylko Dowódca)">
                                            <i class="fa-solid fa-trash-can"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    }).join('') : `
                        <div class="friends-search-empty">
                            <i class="fa-solid fa-user-xmark" style="font-size:1.4rem; color:#64748b; margin-bottom:6px; display:block;"></i>
                            Nie znaleziono osoby „${escapeHtml(query)}” w podręcznym katalogu.
                        </div>
                    `}
                </div>
            ` : `
                <!-- ── SIATKA 3 KOLUMNY (STANDARDOWY WIDOK) ── -->
                <div class="followed-friends-grid">
                    ${displayGridFriends.length > 0 ? displayGridFriends.map(f => `
                        <div class="followed-friend-item ${f.isFriend ? 'is-friend' : ''} ${f.isFollowed ? 'is-active-follow' : ''}" data-slug="${f.slug}">
                            <div class="followed-avatar-wrapper">
                                <a href="${f.url}" class="followed-avatar-anchor" title="${f.name} • ${f.role}">
                                    <img loading="lazy" decoding="async" src="${f.avatar}" alt="${f.name}" onerror="this.src='lumina_icon.jpg'" class="followed-avatar-img">
                                </a>
                                
                                <!-- PRZYCISK JEDNEJ ZIELONEJ KROPKI: status online + zarządzanie relacją -->
                                <button type="button" 
                                        class="followed-online-dot" 
                                        data-action="open-options" 
                                        data-slug="${f.slug}" 
                                        data-name="${escapeHtml(f.name)}" 
                                        data-role="${escapeHtml(f.role)}" 
                                        data-city="${escapeHtml(f.city || '')}" 
                                        data-avatar="${f.avatar}" 
                                        data-url="${f.url}" 
                                        data-is-friend="${f.isFriend}" 
                                        data-is-followed="${f.isFollowed}" 
                                        title="Status i opcje relacji: ${escapeHtml(f.name)}" 
                                        aria-label="Status i opcje relacji: ${escapeHtml(f.name)}">
                                </button>
                            </div>

                            <a href="${f.url}" 
                               class="followed-friend-link" 
                               title="${f.name} • ${f.role} (${f.city}) ${f.isFriend ? '• 🤝 Znajomy' : ''} ${f.isFollowed ? '• ✓ Obserwujesz' : ''}">
                                <div class="followed-friend-name">
                                    ${f.shortName}
                                </div>
                                <div class="followed-friend-role">
                                    ${f.role}
                                </div>
                            </a>
                        </div>
                    `).join('') : `
                        <div style="grid-column:1 / -1; text-align:center; padding:22px 14px; background:rgba(255,255,255,0.02); border:1px dashed rgba(250,204,21,0.25); border-radius:16px;">
                            <i class="fa-solid fa-user-plus" style="font-size:1.5rem; color:#facc15; margin-bottom:8px; display:block; opacity:0.85;"></i>
                            <div style="font-size:0.82rem; font-weight:700; color:#f8fafc; margin-bottom:4px;">Brak znajomych i obserwowanych</div>
                            <div style="font-size:0.72rem; color:#94a3b8; line-height:1.4;">Ten profil nie ma jeszcze powiązań. Wpisz imię w szukajce powyżej, aby znaleźć osoby ze społeczności i wysłać zaproszenie.</div>
                        </div>
                    `}

                    <!-- Dodatkowy kafelek Odkryj więcej -->
                    <a href="lumina.html" class="followed-friend-item" title="Odkryj więcej profili w katalogu LUMINA">
                        <div class="followed-discover-btn">
                            <i class="fa-solid fa-plus"></i>
                        </div>
                        <div class="followed-friend-name" style="color:#facc15;">Więcej</div>
                        <div class="followed-friend-role">Odkrywaj</div>
                    </a>
                </div>
            `}

            <div style="padding-top:10px; border-top:1px solid rgba(255,255,255,0.08); text-align:center;">
                <a href="lumina.html" class="btn-discover-all-friends">
                    <i class="fa-solid fa-compass"></i> Odkrywaj społeczność LUMINA
                </a>
            </div>
        `;

        container.innerHTML = html;

        // Podpięcie zdarzeń wyszukiwarki
        const searchInput = container.querySelector('#friendsSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                currentSearchQuery = e.target.value;
                renderFollowedFriends(container, currentProfileSlug);
                const newInput = container.querySelector('#friendsSearchInput');
                if (newInput) {
                    newInput.focus();
                    newInput.setSelectionRange(newInput.value.length, newInput.value.length);
                }
            });
        }

        const clearBtn = container.querySelector('#friendsSearchClear');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                currentSearchQuery = '';
                renderFollowedFriends(container, currentProfileSlug);
            });
        }

        // Podpięcie zdarzeń zakładek
        const tabBtns = container.querySelectorAll('.friends-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                currentFilterTab = this.getAttribute('data-tab') || 'all';
                renderFollowedFriends(container, currentProfileSlug);
            });
        });

        // Podpięcie zielonej kropki (oraz ewentualnych przycisków opcji relacji)
        const optBtns = container.querySelectorAll('.followed-online-dot, .followed-card-opt-btn, [data-action="open-options"]');
        optBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const data = {
                    slug: this.getAttribute('data-slug'),
                    name: this.getAttribute('data-name'),
                    role: this.getAttribute('data-role'),
                    city: this.getAttribute('data-city'),
                    avatar: this.getAttribute('data-avatar'),
                    url: this.getAttribute('data-url'),
                    isFriend: this.getAttribute('data-is-friend') === 'true',
                    isFollowed: this.getAttribute('data-is-followed') === 'true'
                };
                openRelationshipModal(data);
            });
        });

        // Podpięcie akcji z listy wyszukiwania (Zaproś do znajomych / Obserwuj / Usuń dla Dowódcy)
        const actionBtns = container.querySelectorAll('.btn-action-mini');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const action = this.getAttribute('data-action');
                const slug = this.getAttribute('data-slug');
                const name = this.getAttribute('data-name');
                if (action === 'friend') {
                    sendFriendRequest(slug);
                } else if (action === 'follow') {
                    toggleFollow(slug);
                } else if (action === 'admin-delete') {
                    if (typeof window.LuminaDeleteProfile === 'function') {
                        window.LuminaDeleteProfile(slug, name);
                    } else if (window.LuminaDB && typeof window.LuminaDB.deleteProfile === 'function') {
                        window.LuminaDB.deleteProfile(slug, name);
                    }
                }
            });
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // Wykrywa slug bieżącego profilu z URL lub DOM
    function detectCurrentProfileSlug() {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('cezaryrgowski') || path.includes('cezaryrogowski') || path.includes('rogowski')) return 'cezaryrgowski';
        if (path.includes('wiolettarogowska') || path.includes('rogowska')) return 'wiolettarogowska';
        if (path.includes('zbyszekgieron') || path.includes('gieron')) return 'zbyszekgieron';
        if (path.includes('andrzejthiel') || path.includes('thiel')) return 'andrzejthiel';
        if (path.includes('jolawojcik') || path.includes('wojcik')) return 'jolawojcik';
        if (path.includes('magdalena')) return 'magdalena';
        if (path.includes('pawelmurawski') || path.includes('murawski')) return 'pawelmurawski';
        if (path.includes('zofiadudek') || path.includes('dudek')) return 'zofiadudek';
        if (path.includes('ccmen')) return 'ccmen';
        if (path.includes('ccwomen')) return 'ccwomen';
        if (path.includes('cctv')) return 'cctv';
        if (path.includes('radiocc')) return 'radiocc';
        if (path.includes('studiodobregoslowa')) return 'studiodobregoslowa';
        if (path.includes('osobowoscplus')) return 'osobowoscplus';

        const params = new URLSearchParams(window.location.search);
        const user = params.get('u') || params.get('user') || params.get('slug') || params.get('profile');
        if (user) return user.toLowerCase();

        return '';
    }

    // Automatyczny montaż widżetu na stronie
    function autoMountFollowedFriends() {
        const currentSlug = detectCurrentProfileSlug();

        // 1. Sprawdź czy istnieje dedykowany slot w HTML
        let slot = document.getElementById('luminaFollowedFriendsSlot') || document.getElementById('followedFriendsCard');

        // 2. Jeśli nie ma dedykowanego slotu, znajdź kartę "Wizytówka" i zamontuj tuż pod nią
        if (!slot) {
            const aside = document.querySelector('aside, .profile-body-grid aside, .sidebar-column-area, .sidebar-col, .left-founder-wing');
            if (!aside) return;

            // Szukaj karty zawierającej "Wizytówka"
            const cards = Array.from(aside.querySelectorAll('.sidebar-card, .side-card, aside > div'));
            const wizytowkaCard = cards.find(card => {
                const txt = card.textContent.toLowerCase();
                return txt.includes('wizytówka') || txt.includes('o mnie') || txt.includes('informacje');
            }) || cards[0];

            if (wizytowkaCard) {
                slot = document.createElement('div');
                slot.id = 'luminaFollowedFriendsSlot';
                slot.className = 'sidebar-card followed-friends-card';
                wizytowkaCard.insertAdjacentElement('afterend', slot);
            } else {
                slot = document.createElement('div');
                slot.id = 'luminaFollowedFriendsSlot';
                slot.className = 'sidebar-card followed-friends-card';
                aside.prepend(slot);
            }
        }

        renderFollowedFriends(slot, currentSlug);
    }

    // Reaktywna aktualizacja przy zmianach relacji
    window.addEventListener('storage', function(e) {
        if (e.key && (e.key.startsWith('lumina_following_') || e.key.startsWith('lumina_friend_'))) {
            refreshWidgetView();
        }
    });

    window.addEventListener('lumina:followChange', refreshWidgetView);
    window.addEventListener('lumina:friendshipChange', refreshWidgetView);
    window.addEventListener('lumina:profileDeleted', refreshWidgetView);

    // Inicjalizacja po załadowaniu drzewa DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoMountFollowedFriends);
    } else {
        autoMountFollowedFriends();
    }

    // Eksport globalny do natychmiastowego wywołania i integracji
    window.mountFollowedFriendsWidget = autoMountFollowedFriends;
    window.refreshFollowedFriendsWidget = autoMountFollowedFriends;
    window.LuminaFriends = {
        isFriend,
        isFollowing,
        sendFriendRequest,
        toggleFollow,
        getFriendshipStatus
    };

})();
