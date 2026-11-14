/**
 * LUMINA 3D Faith & Engagement Badges Catalog & Details Modal
 * Extracted from lumina-db.js (Phase 1 Modularization)
 */
import { escapeHtml } from './media-links.js';

let _publishUniversalPost = null;
export function configureBadgesModule(deps = {}) {
    if (typeof deps.publishUniversalPost === "function") _publishUniversalPost = deps.publishUniversalPost;
}

// ══════════════════════════════════════════════════════════════════════════
// ── LUMINA 3D FAITH & ENGAGEMENT BADGES SUITE (WIRTUALNE ODZNAKI 3D) ──
// ══════════════════════════════════════════════════════════════════════════

export const LUMINA_BADGES_CATALOG = {
    // 🛡️ Wiara & Formacja Duchowa
    'prayer_flame': {
        id: 'prayer_flame',
        category: 'faith',
        categoryLabel: '🛡️ Wiara & Formacja',
        name: 'Płomień Modlitwy',
        icon: 'fa-solid fa-fire-flame-curved',
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
        bgGlow: 'rgba(245, 158, 11, 0.45)',
        verse: '„Nieustannie się módlcie!” (1 Tesaloniczan 5,17)',
        desc: 'Wyróżnienie za wierność w codziennej modlitwie osobistej oraz wstawienniczej za Kościół i Naród.',
        tier: 'Gold Tier',
        rarity: 'Duchowa Siła'
    },
    'word_guardian': {
        id: 'word_guardian',
        category: 'faith',
        categoryLabel: '🛡️ Wiara & Formacja',
        name: 'Strażnik Słowa',
        icon: 'fa-solid fa-book-bible',
        color: '#38bdf8',
        gradient: 'linear-gradient(135deg, #38bdf8, #2563eb)',
        bgGlow: 'rgba(56, 189, 248, 0.45)',
        verse: '„Twoje słowo jest lampą dla moich stóp i światłem na mojej ścieżce.” (Psalm 119,105)',
        desc: 'Wyróżnienie za codzienne rozważanie i studiowanie Pisma Świętego oraz wierność Bożej Prawdzie.',
        tier: 'Diamond Tier',
        rarity: 'Mądrość Boża'
    },
    'worship_pillar': {
        id: 'worship_pillar',
        category: 'faith',
        categoryLabel: '🛡️ Wiara & Formacja',
        name: 'Filar Wspólnoty',
        icon: 'fa-solid fa-church',
        color: '#a855f7',
        gradient: 'linear-gradient(135deg, #a855f7, #6366f1)',
        bgGlow: 'rgba(168, 85, 247, 0.45)',
        verse: '„Nie opuszczajmy naszych wspólnych zebrań...” (Hebrajczyków 10,25)',
        desc: 'Za regularne uczestnictwo w nabożeństwach i aktywne budowanie żywego Ciała Chrystusa.',
        tier: 'Platinum Tier',
        rarity: 'Wierność'
    },
    'kingdom_marriage': {
        id: 'kingdom_marriage',
        category: 'faith',
        categoryLabel: '🛡️ Wiara & Formacja',
        name: 'Małżeństwo w Bożej Woli',
        icon: 'fa-solid fa-ring',
        color: '#ec4899',
        gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
        bgGlow: 'rgba(236, 72, 153, 0.45)',
        verse: '„A sznur potrójny niełatwo się zerwie.” (Księga Koheleta 4,12)',
        desc: 'Honorowe wyróżnienie dla małżeństw i rodzin budujących swoje przymierze na fundamencie Chrystusa.',
        tier: 'Ruby Tier',
        rarity: 'Przymierze'
    },

    // ⚔️ Misja & Wzrost Społeczności
    'royal_heritage': {
        id: 'royal_heritage',
        category: 'mission',
        categoryLabel: '⚔️ Misja CC',
        name: 'Królewskie Dziedzictwo',
        icon: 'fa-solid fa-crown',
        color: '#fbbf24',
        gradient: 'linear-gradient(135deg, #fbbf24, #d97706)',
        bgGlow: 'rgba(251, 191, 36, 0.50)',
        verse: '„Wy zaś jesteście wybranym plemieniem, królewskim kapłaństwem...” (1 Piotra 2,9)',
        desc: 'Wyróżnienie Założycieli dla kluczowych filarów misji ewangelizacyjnej Christian Culture.',
        tier: 'Royal Gold',
        rarity: 'Przywództwo'
    },
    'intercessor': {
        id: 'intercessor',
        category: 'mission',
        categoryLabel: '⚔️ Misja CC',
        name: 'Orędownik Braterski',
        icon: 'fa-solid fa-hands-praying',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981, #059669)',
        bgGlow: 'rgba(16, 185, 129, 0.45)',
        verse: '„Jedni drugich brzemiona noście, a tak wypełnicie zakon Chrystusowy.” (Galacjan 6,2)',
        desc: 'Za modlitewne wstawiennictwo za braci i siostry w intencjach zgłaszanych na portalu LUMINA.',
        tier: 'Emerald Tier',
        rarity: 'Miłość Braterska'
    },
    'fellowship_builder': {
        id: 'fellowship_builder',
        category: 'mission',
        categoryLabel: '⚔️ Misja CC',
        name: 'Budowniczy Relacji',
        icon: 'fa-solid fa-mug-hot',
        color: '#f97316',
        gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
        bgGlow: 'rgba(249, 115, 22, 0.45)',
        verse: '„Miłością braterską jedni drugich miłujcie...” (Rzymian 12,10)',
        desc: 'Wyróżnienie za otwartość, wysyłanie chrześcijańskiej kawy i nawiązywanie czystych, Bożych relacji.',
        tier: 'Amber Tier',
        rarity: 'Gościnność'
    },
    'gospel_ambassador': {
        id: 'gospel_ambassador',
        category: 'mission',
        categoryLabel: '⚔️ Misja CC',
        name: 'Ambasador Dobrej Nowiny',
        icon: 'fa-solid fa-bullhorn',
        color: '#06b6d4',
        gradient: 'linear-gradient(135deg, #06b6d4, #0284c7)',
        bgGlow: 'rgba(6, 182, 212, 0.45)',
        verse: '„Idźcie na cały świat i głoście Ewangelię!” (Marka 16,15)',
        desc: 'Za aktywne udostępnianie rozważań, zapraszanie do społeczności LUMINA i szerzenie Dobrej Nowiny.',
        tier: 'Sapphire Tier',
        rarity: 'Ewangelizacja'
    },

    // 💎 Wiarygodność & Autentyczność
    'verified_authentic': {
        id: 'verified_authentic',
        category: 'integrity',
        categoryLabel: '💎 Wiarygodność',
        name: 'Zweryfikowany Świadek',
        icon: 'fa-solid fa-shield-halved',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981, #3b82f6)',
        bgGlow: 'rgba(16, 185, 129, 0.40)',
        verse: '„I poznacie prawdę, a prawda was wyzwoli.” (Jana 8,32)',
        desc: 'Odznaka poświadczająca autentyczność profilu, prawdziwe zdjęcie twarzy i transparentność w społeczności.',
        tier: 'Guardian Shield',
        rarity: 'Autentyczność'
    },
    'heart_of_peace': {
        id: 'heart_of_peace',
        category: 'integrity',
        categoryLabel: '💎 Wiarygodność',
        name: 'Serce Pełne Pokoju',
        icon: 'fa-solid fa-dove',
        color: '#f43f5e',
        gradient: 'linear-gradient(135deg, #f43f5e, #a855f7)',
        bgGlow: 'rgba(244, 63, 94, 0.45)',
        verse: '„A pokój Boży, który przewyższa wszelki rozum, strzec będzie serc waszych...” (Filipian 4,7)',
        desc: 'Za nienaganną klasę, budujące słowa i wnoszenie pokoju Chrystusowego do każdej rozmowy.',
        tier: 'Ruby Star',
        rarity: 'Owoc Ducha'
    }
};

// Odznaki się ZDOBYWA (Strażnik, 2026-10-11): nikt nie dostaje kompletu na start.
// Zdobyte = przyznane w profilu (pole badges w Firestore) + to, co wynika z prawdziwych danych:
// „Zweryfikowany Świadek” za prawdziwe zdjęcie profilowe, „Królewskie Dziedzictwo” dla Założycieli.
const LUMINA_FOUNDER_SLUGS = ['cezaryrgowski', 'cezaryrogowski', 'wiolettarogowska'];

export function ensure3DBadgeModalInDom() {
    if (typeof document === 'undefined') return;
    
    // Inject 3D Badge Styles if not present
    if (!document.getElementById('lumina-3d-badges-style')) {
        const style = document.createElement('style');
        style.id = 'lumina-3d-badges-style';
        style.textContent = `
            .lumina-3d-badges-section {
                margin: 20px 0;
                padding: 20px 18px;
                background: linear-gradient(135deg, rgba(13, 20, 39, 0.90), rgba(18, 26, 47, 0.95));
                border: 1px solid rgba(250, 204, 21, 0.25);
                border-radius: 24px;
                box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
            }
            .lumina-3d-badges-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }
            .lumina-3d-badges-title {
                font-size: 1.05rem;
                font-weight: 900;
                color: #fff;
                display: flex;
                align-items: center;
                gap: 10px;
                font-family: 'Outfit', -apple-system, sans-serif;
            }
            .lumina-3d-badges-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
                gap: 14px;
            }
            .lumina-badge-3d-card {
                background: rgba(11, 19, 41, 0.85);
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-radius: 20px;
                padding: 16px 12px;
                text-align: center;
                cursor: pointer;
                transition: all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
                position: relative;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                align-items: center;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
            }
            .lumina-badge-3d-card:hover {
                transform: translateY(-6px) scale(1.04);
                border-color: rgba(250, 204, 21, 0.6);
                box-shadow: 0 14px 32px rgba(0, 0, 0, 0.6), 0 0 24px rgba(250, 204, 21, 0.28);
            }
            .badge-3d-medal {
                width: 52px;
                height: 52px;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                color: #fff;
                margin-bottom: 10px;
                border: 1.5px solid rgba(255, 255, 255, 0.4);
                transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .lumina-badge-3d-card:hover .badge-3d-medal {
                transform: scale(1.15) rotate(6deg);
            }
            .badge-3d-name {
                font-size: 0.82rem;
                font-weight: 800;
                color: #fff;
                line-height: 1.3;
                margin-bottom: 4px;
            }
            .badge-3d-tier {
                font-size: 0.68rem;
                color: #94a3b8;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
            }
            .badge-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                display: inline-block;
            }
        `;
        document.head.appendChild(style);
    }

    if (document.getElementById('modal3DBadgeDetails')) return;

    const modal = document.createElement('div');
    modal.id = 'modal3DBadgeDetails';
    modal.className = 'modal-overlay';
    modal.style.cssText = 'z-index: 100005; background: rgba(5, 8, 22, 0.88); backdrop-filter: blur(16px); display: none; align-items: center; justify-content: center; position: fixed; inset: 0; padding: 16px;';
    modal.onclick = (e) => { if (e.target === modal) window.close3DBadgeModal(); };

    modal.innerHTML = `
        <div class="modal-card" style="max-width: 480px; width: 100%; text-align: center; background: #0b1329; border: 1.5px solid rgba(250, 204, 21, 0.45); border-radius: 28px; padding: 32px 24px; box-shadow: 0 0 50px rgba(250, 204, 21, 0.25); position: relative; overflow: hidden;">
            <!-- Ambient 3D Glow Background -->
            <div id="badgeModalGlow" style="position: absolute; top: -60px; left: 50%; transform: translateX(-50%); width: 220px; height: 220px; background: radial-gradient(circle, rgba(250, 204, 21, 0.35) 0%, transparent 70%); border-radius: 50%; pointer-events: none; filter: blur(20px);"></div>
            
            <button type="button" class="modal-close-btn" onclick="window.close3DBadgeModal()" style="position: absolute; top: 16px; right: 16px; width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease;">
                <i class="fa-solid fa-xmark"></i>
            </button>

            <!-- 3D Big Animated Badge Medal -->
            <div style="perspective: 800px; margin: 10px auto 20px;">
                <div id="badgeModalMedal" style="width: 96px; height: 96px; border-radius: 26px; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 2.6rem; color: #fff; box-shadow: 0 12px 36px rgba(0,0,0,0.5); border: 2px solid rgba(255,255,255,0.35); transform: rotateY(0deg); transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);">
                    <i id="badgeModalIcon" class="fa-solid fa-crown"></i>
                </div>
            </div>

            <!-- Category & Tier Badges -->
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;">
                <span id="badgeModalCategory" style="font-size: 0.72rem; font-weight: 800; padding: 3px 10px; border-radius: 10px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #94a3b8; text-transform: uppercase;">
                    🛡️ WIARA & FORMACJA
                </span>
                <span id="badgeModalTier" style="font-size: 0.72rem; font-weight: 800; padding: 3px 10px; border-radius: 10px; background: rgba(250, 204, 21, 0.2); border: 1px solid rgba(250, 204, 21, 0.45); color: #facc15;">
                    GOLD TIER
                </span>
            </div>

            <h2 id="badgeModalName" style="color: #fff; font-size: 1.45rem; font-weight: 900; margin-bottom: 6px; font-family: 'Outfit', sans-serif;">
                Płomień Modlitwy
            </h2>

            <p id="badgeModalOwner" style="font-size: 0.82rem; color: #38bdf8; font-weight: 700; margin-bottom: 16px;">
                ✨ Wyróżnienie członka społeczności: <b>Cezary Rogowski</b>
            </p>

            <!-- Scripture Verse Card -->
            <div id="badgeModalVerseBox" style="background: rgba(250, 204, 21, 0.08); border-left: 3px solid #facc15; border-radius: 0 14px 14px 0; padding: 12px 16px; margin-bottom: 16px; text-align: left;">
                <div style="font-size: 0.70rem; font-weight: 800; color: #facc15; text-transform: uppercase; margin-bottom: 4px;">
                    <i class="fa-solid fa-sparkles"></i> Słowo Boże / Fundament
                </div>
                <p id="badgeModalVerse" style="color: #fde047; font-size: 0.86rem; font-weight: 600; font-style: italic; line-height: 1.45; margin: 0;">
                    „Nieustannie się módlcie!” (1 Tesaloniczan 5,17)
                </p>
            </div>

            <p id="badgeModalDesc" style="color: #cbd5e1; font-size: 0.86rem; line-height: 1.6; margin-bottom: 22px;">
                Wyróżnienie za wierność w codziennej modlitwie osobistej oraz wstawienniczej za Kościół i Naród.
            </p>

            <!-- Action buttons -->
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button type="button" onclick="window.share3DBadgeToFeed()" style="flex: 1; padding: 12px 18px; border-radius: 14px; border: none; background: linear-gradient(135deg, #f59e0b, #ec4899); color: #fff; font-weight: 800; font-size: 0.88rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 18px rgba(245,158,11,0.35);">
                    <i class="fa-solid fa-share-nodes"></i> Udostępnij na Tablicy
                </button>
                <button type="button" onclick="window.close3DBadgeModal()" style="padding: 12px 18px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.06); color: #94a3b8; font-weight: 700; font-size: 0.85rem; cursor: pointer;">
                    Zamknij
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

if (typeof window !== 'undefined') window._activeBadgeModalData = null;

export function open3DBadgeDetailsModal(badgeId, ownerName = 'Członek Społeczności', locked = false) {
    ensure3DBadgeModalInDom();
    const badge = LUMINA_BADGES_CATALOG[badgeId];
    if (!badge) return;

    window._activeBadgeModalData = locked ? null : { badge, ownerName };

    const modal = document.getElementById('modal3DBadgeDetails');
    if (!modal) return;

    const medal = document.getElementById('badgeModalMedal');
    const icon = document.getElementById('badgeModalIcon');
    const name = document.getElementById('badgeModalName');
    const cat = document.getElementById('badgeModalCategory');
    const tier = document.getElementById('badgeModalTier');
    const owner = document.getElementById('badgeModalOwner');
    const verse = document.getElementById('badgeModalVerse');
    const desc = document.getElementById('badgeModalDesc');
    const glow = document.getElementById('badgeModalGlow');

    if (medal) {
        medal.style.background = badge.gradient;
        medal.style.boxShadow = `0 14px 40px ${badge.bgGlow}`;
    }
    if (glow) {
        glow.style.background = `radial-gradient(circle, ${badge.bgGlow} 0%, transparent 70%)`;
    }
    if (icon) icon.className = badge.icon;
    if (name) name.textContent = badge.name;
    if (cat) cat.textContent = badge.categoryLabel;
    if (tier) {
        tier.textContent = `${badge.tier} • ${badge.rarity}`;
        tier.style.color = badge.color;
        tier.style.borderColor = badge.color;
    }
    if (owner) owner.innerHTML = locked
        ? '<i class="fa-solid fa-lock" aria-hidden="true"></i> Jeszcze nie zdobyta — jak ją zdobyć, opisuje tekst poniżej.'
        : `✨ Wyróżnienie członka społeczności: <b>${escapeHtml(String(ownerName))}</b>`;
    const shareBtn = modal.querySelector('[onclick*="share3DBadgeToFeed"]');
    if (shareBtn) shareBtn.style.display = locked ? 'none' : '';
    if (medal) medal.style.filter = locked ? 'grayscale(1)' : '';
    if (verse) verse.textContent = badge.verse;
    if (desc) desc.textContent = badge.desc;

    modal.style.display = 'flex';
    modal.classList.add('open');

    // 3D subtle rotation effect
    if (medal) {
        medal.style.transform = 'rotateY(360deg)';
        setTimeout(() => { medal.style.transform = 'rotateY(0deg)'; }, 600);
    }
}

export function close3DBadgeModal() {
    const modal = document.getElementById('modal3DBadgeDetails');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('open');
    }
}

if (typeof window !== 'undefined') {
    window.open3DBadgeDetailsModal = open3DBadgeDetailsModal;
    window.close3DBadgeModal = close3DBadgeModal;
    window.share3DBadgeToFeed = async function() {
        if (!window._activeBadgeModalData) return;
        const { badge, ownerName } = window._activeBadgeModalData;
        close3DBadgeModal();

        const postText = `🏆 Zdobyłem(am) nową odznakę w społeczności LUMINA!\n✨ Odznaka: **${badge.name}** (${badge.tier})\n📖 ${badge.verse}\n\n${badge.desc}\n\nDołącz do nas i buduj Królestwo Boże! 🕊️✨`;

        const pubFn = _publishUniversalPost || window.LuminaDB?.publishUniversalPost;
        if (typeof pubFn === 'function') {
            const res = await pubFn({
                text: postText,
                authorName: ownerName,
                mediaType: 'badge',
                badgeId: badge.id
            });
            if (typeof showToast === 'function') showToast('🏆 Udostępniono odznakę na Tablicy Społeczności!');
        } else {
            if (typeof showToast === 'function') showToast(`Skopiowano treść odznaki: ${badge.name}! ✨`);
        }
    };
}
