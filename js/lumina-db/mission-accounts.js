/**
 * LUMINA Mission Broadcast Channels, Multi-Persona Accounts & Coffee Invites
 * Extracted from lumina-db.js (Phase 1 Modularization)
 */
let _missionDeps = {};
export function configureMissionAccounts(deps = {}) {
    _missionDeps = { ..._missionDeps, ...deps };
}

// ══════════════════════════════════════════════════════════════════════════
// 3A. MISSION BROADCAST INTEGRATION ENGINE (Live Autostart Channels on Profiles)
// ══════════════════════════════════════════════════════════════════════════

export const MISSION_BROADCAST_CHANNELS = {
    'cezary_rogowski': {
        channelId: 'master_live',
        authorName: 'Cezary Rogowski',
        authorAvatar: 'avatar_cezary_official.jpg',
        authorRole: '👑 Założyciel Christian Culture',
        channelTitle: 'Główny Kanał Telewizyjny Christian Culture TV',
        badge: '🔴 TRANSMISJA NA ŻYWO • EMISJA GŁÓWNA 24/7',
        showTitle: 'Telewizja Christian Culture TV 24/7 • Główny Kanał Nadawczy',
        description: 'Oficjalna całodobowa transmisja telewizyjna Christian Culture TV. Słowo Boże, proroctwa biblijne, pieśni chwały i programy na żywo.',
        streamUrl: 'master-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'master-live.html',
        category: 'Telewizja Główna CC',
        icon: 'fa-tv',
        accentColor: '#d4af37'
    },
    'wioletta_rogowska': {
        channelId: 'biblia_spiewana',
        authorName: 'Wioletta Rogowska',
        authorAvatar: 'avatar_wioletta_official.jpg',
        authorRole: '🌸 Współzałożycielka Christian Culture',
        channelTitle: 'Biblia Śpiewana & Pasmo Uwielbienia Kobiet',
        badge: '🌸 EMISJA NA ŻYWO • SŁOWO I UWIELBIENIE',
        showTitle: 'Biblia Śpiewana • Pasmo Pokoju, Modlitwy i Pieśni Chwały',
        description: 'Wersety Pisma Świętego śpiewane z głębi serca ku Bożej chwale. Przestrzeń Bożego pokoju, budowania relacji i modlitwy.',
        streamUrl: 'biblia-spiewana-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'biblia-spiewana-live.html',
        category: 'Uwielbienie & Słowo',
        icon: 'fa-heart',
        accentColor: '#ec4899'
    },
    'cc_women': {
        channelId: 'cc_women_live',
        authorName: 'CC WOMEN (WOMEN TV) • YouTube',
        authorAvatar: 'logo_cc_women.jpg',
        authorRole: '🌸 Misja Kobiet Wiary • @womentv24',
        channelTitle: 'CC WOMEN • Oficjalny Kanał YouTube',
        badge: '🌸 EMISJA NA ŻYWO • KOBIETY WIARY',
        showTitle: 'CC WOMEN • Świadectwa, Modlitwa i Muzyka Uwielbienia',
        description: 'Oficjalny kanał Wioletty Rogowskiej i kobiet wiary Christian Culture (@womentv24). Świadectwa przemiany życia, pieśni uwielbienia, modlitwa o relacje i uświęcenie w Chrystusie.',
        streamUrl: 'biblia-spiewana-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'https://youtube.com/@womentv24?si=gtUZ764bTofGk3Py',
        category: 'Kobiety Wiary',
        icon: 'fa-wand-magic-sparkles',
        accentColor: '#f472b6'
    },
    'cc_men': {
        channelId: 'cc_men_live',
        authorName: 'CC Men • Wojownicy Chrystusa',
        authorAvatar: 'logo_cc_men.jpg',
        authorRole: '⚔️ Misja Mężczyzn Wiary',
        channelTitle: 'CC Men • Pasmo Mężczyzn Wiary & Totalny Atak',
        badge: '⚔️ EMISJA NA ŻYWO • WOJOWNICY CHRYSTUSA',
        showTitle: 'Prof. Walter Veith • Totalny Atak & Męska Formacja Wiary',
        description: 'Męska formacja duchowa, odwaga w wierze, odkrywanie prawdy biblijnej oraz demaskowanie kłamstw współczesnego świata.',
        streamUrl: 'totalny-atak-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'totalny-atak-live.html',
        category: 'Mężczyźni Wiary',
        icon: 'fa-shield-halved',
        accentColor: '#38bdf8'
    },
    'cc_tv': {
        channelId: 'cctv_live',
        authorName: 'Christian Culture TV',
        authorAvatar: 'logo_cctv.png',
        authorRole: '📺 Telewizja CC TV24',
        channelTitle: 'Christian Culture TV 24/7',
        badge: '🔴 EMISJA GŁÓWNA • CCTV24 LIVE',
        showTitle: 'Christian Culture TV • Całodobowy Kanał Chrześcijański',
        description: 'Oficjalna ogólnopolska i międzynarodowa transmisja telewizyjna Christian Culture TV 24/7.',
        streamUrl: 'master-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'master-live.html',
        category: 'Telewizja CC',
        icon: 'fa-satellite-dish',
        accentColor: '#eab308'
    },
    'radio_cc': {
        channelId: 'radio_cc_live',
        authorName: 'Polskie Radio Christian Culture',
        authorAvatar: 'lumina_icon.jpg',
        authorRole: '📻 Oficjalny Głos Ewangelizacyjny',
        channelTitle: 'Polskie Radio Christian Culture',
        badge: '📻 EMISJA RADIOWA • GŁOS EWANGELIZACYJNY',
        showTitle: 'Polskie Radio Christian Culture • Pasmo Dnia & Muzyka Chwały',
        description: 'Całodobowy strumień radiowy z najpiękniejszą muzyką chrześcijańską, Biblią Audio i codziennymi rozważaniami.',
        streamUrl: 'codzienne-uwielbienie-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'index.html',
        category: 'Radio CC',
        icon: 'fa-radio',
        accentColor: '#06b6d4'
    },
    'andrzej_thiel': {
        channelId: 'studium_live',
        authorName: 'Andrzej Thiel',
        authorAvatar: 'avatar_andrzej_thiel.jpg',
        authorRole: '📖 Nauczyciel Słowa Bożego',
        channelTitle: 'Studium Telewizyjne Pisma Świętego',
        badge: '📖 EMISJA NA ŻYWO • WYKŁAD BIBLIJNY',
        showTitle: 'Studium Telewizyjne Pisma Świętego — 572 Odcinki Werset po Wersecie',
        description: 'Wyczerpujący telewizyjny wykład całej Biblii. Systematyczne studium werset po wersecie z Andrzejem Thielem.',
        streamUrl: 'studium-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'studium-live.html',
        category: 'Studium Biblijne',
        icon: 'fa-book-bible',
        accentColor: '#10b981'
    },
    'osobowosc_plus': {
        channelId: 'kino_live',
        authorName: 'Studio Dobrego Słowa / Osobowość Plus',
        authorAvatar: 'avatar_osobowoscplus.jpg',
        authorRole: '🎬 Relacje i Wzrost w Bogu',
        channelTitle: 'Chrześcijański Blok Filmowy & Świadectwa',
        badge: '🎬 EMISJA NA ŻYWO • KINO & RELACJE',
        showTitle: 'Chrześcijański Blok Filmowy • Wzrost Osobisty w Chrystusie',
        description: 'Inspirujące filmy, świadectwa i wykłady psychologiczno-duchowe o budowaniu zdrowych relacji i dojrzałości w Bogu.',
        streamUrl: 'kino-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'kino-live.html',
        category: 'Filmy & Relacje',
        icon: 'fa-film',
        accentColor: '#a855f7'
    },
    'noemi_misja': {
        channelId: 'swiadectwa_live',
        authorName: 'Noemi',
        authorAvatar: 'avatar_noemi.jpg',
        authorRole: '🌿 Ewangelizacja i Świadectwa',
        channelTitle: 'Świadectwa Wiary & Zjednoczeni za Polskę',
        badge: '🌿 EMISJA NA ŻYWO • ŚWIADECTWA ŁASKI',
        showTitle: 'Świadectwa Wiary • Niezwykłe Dzieła Boga w Życiu Ludzi',
        description: 'Poruszające świadectwa ludzi, których życie zmienił Jezus Chrystus. Modlitwa wstawiennicza za Polskę i rodziny.',
        streamUrl: 'swiadectwa-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'swiadectwa-live.html',
        category: 'Świadectwa',
        icon: 'fa-hands-praying',
        accentColor: '#34d399'
    },
    'dawid_misja': {
        channelId: 'codzienne_uwielbienie',
        authorName: 'Dawid',
        authorAvatar: 'avatar_dawid.jpg',
        authorRole: '🎵 Uwielbienie i Świadectwa',
        channelTitle: 'Codzienne Uwielbienie • Pasmo Muzyczne',
        badge: '🎵 EMISJA NA ŻYWO • 538 UTWORÓW CHWAŁY',
        showTitle: 'Codzienne Uwielbienie • Pasmo Pieśni Chwały i Dziękczynienia',
        description: 'Wielka biblioteka 538 najpiękniejszych utworów uwielbienia. Codzienna rotacja bez powtórzeń i nieustanna modlitwa śpiewem.',
        streamUrl: 'codzienne-uwielbienie-live.html?muted=1&in_mcr=1',
        fullPageUrl: 'codzienne-uwielbienie-live.html',
        category: 'Muzyka Uwielbienia',
        icon: 'fa-music',
        accentColor: '#fbbf24'
    }
};


// ══════════════════════════════════════════════════════════════════════════
// 3B. MISSION ACCOUNTS & MULTI-PERSONA ENGINE (Dowódca, Żona, Misje, AI)
// ══════════════════════════════════════════════════════════════════════════

export const MISSION_ACCOUNTS = {
    'cezary_rogowski': {
        id: 'cezary_rogowski',
        name: 'Cezary Rogowski',
        role: '👑 Założyciel Christian Culture',
        avatar: 'avatar_cezary_official.jpg',
        slug: 'cezaryrgowski',
        profileUrl: 'lumina.cezaryrgowski.html',
        badge: '👑 Założyciel CC',
        isMissionAccount: true
    },
    'wioletta_rogowska': {
        id: 'wioletta_rogowska',
        name: 'Wioletta Rogowska',
        role: '🌸 Współzałożycielka Christian Culture',
        avatar: 'avatar_wioletta_official.jpg',
        avatarVideo: 'wioletta_rogowska_video_avatar.mp4',
        slug: 'wiolettarogowska',
        profileUrl: 'lumina.wiolettarogowska.html',
        badge: '🌸 Współzałożycielka CC',
        isMissionAccount: true
    },
    'cc_women': {
        id: 'cc_women',
        name: 'CC Women • YouTube',
        role: '🌸 Misja Kobiet Wiary',
        avatar: 'logo_cc_women.jpg',
        slug: 'ccwomen',
        profileUrl: 'lumina.ccwomen.html',
        badge: '🌸 CC Women Official',
        isMissionAccount: true
    },
    'cc_men': {
        id: 'cc_men',
        name: 'CC Men • Wojownicy Chrystusa',
        role: '⚔️ Misja Mężczyzn Wiary',
        avatar: 'logo_cc_men.jpg',
        slug: 'ccmen',
        profileUrl: 'lumina.ccmen.html',
        badge: '⚔️ CC Men Official',
        isMissionAccount: true
    },
    'cc_tv': {
        id: 'cc_tv',
        name: 'Christian Culture TV',
        role: '📺 Telewizja CC TV24',
        avatar: 'logo_cctv.png',
        slug: 'cctv',
        profileUrl: 'lumina.cctv.html',
        badge: '📺 CCTV24 Official',
        isMissionAccount: true
    },
    'radio_cc': {
        id: 'radio_cc',
        name: 'Polskie Radio Christian Culture',
        role: '📻 Oficjalny Głos Ewangelizacyjny',
        avatar: 'lumina_icon.jpg',
        slug: 'radio_cc',
        profileUrl: 'index.html',
        badge: '📻 Radio CC',
        isMissionAccount: true
    },
    'andrzej_thiel': {
        id: 'andrzej_thiel',
        name: 'Andrzej Thiel',
        role: '📖 Nauczyciel Słowa Bożego',
        avatar: 'avatar_andrzej_thiel.jpg',
        slug: 'andrzejthiel',
        profileUrl: 'lumina.andrzejthiel.html',
        badge: '📖 Studium Biblijne CC',
        isMissionAccount: true
    },
    'osobowosc_plus': {
        id: 'osobowosc_plus',
        name: 'Studio Dobrego Słowa / Osobowość Plus',
        role: '🎬 Relacje i Wzrost w Bogu',
        avatar: 'avatar_osobowoscplus.jpg',
        slug: 'osobowoscplus',
        profileUrl: 'lumina.osobowoscplus.html',
        badge: '🎬 Osobowość Plus',
        isMissionAccount: true
    },
    'lumina_official': {
        id: 'lumina_official',
        name: 'LUMINA • Społeczność',
        role: '🕊️ Redakcja i Moderacja',
        avatar: 'lumina_icon.jpg',
        slug: 'lumina_official',
        profileUrl: 'lumina-tablica.html',
        badge: '🕊️ LUMINA Official',
        isMissionAccount: true
    },
    'noemi_misja': {
        id: 'noemi_misja',
        name: 'Noemi',
        role: '🌿 Ewangelizacja i Świadectwa',
        avatar: 'avatar_noemi.jpg',
        slug: 'noemi',
        profileUrl: 'lumina-profile.html?u=noemi',
        badge: '🌿 Misja CC',
        isMissionAccount: true
    },
    'dawid_misja': {
        id: 'dawid_misja',
        name: 'Dawid',
        role: '🎵 Uwielbienie i Świadectwa',
        avatar: 'avatar_dawid.jpg',
        slug: 'dawid',
        profileUrl: 'lumina-profile.html?u=dawid',
        badge: '🎵 Misja CC',
        isMissionAccount: true
    }
};

export function getMissionAccounts() {
    return Object.values(MISSION_ACCOUNTS);
}

export function getActiveMissionPersona() {
    try {
        const savedId = localStorage.getItem('lumina_active_mission_persona') || 'cezary_rogowski';
        return MISSION_ACCOUNTS[savedId] || MISSION_ACCOUNTS['cezary_rogowski'];
    } catch(e) {
        return MISSION_ACCOUNTS['cezary_rogowski'];
    }
}

export function setActiveMissionPersona(personaId) {
    if (MISSION_ACCOUNTS[personaId]) {
        try {
            localStorage.setItem('lumina_active_mission_persona', personaId);
            window.dispatchEvent(new CustomEvent('lumina-persona-changed', { detail: MISSION_ACCOUNTS[personaId] }));
        } catch(e) {}
        return MISSION_ACCOUNTS[personaId];
    }
    return null;
}

export async function publishAsMissionAccount(personaId, postData) {
    const persona = MISSION_ACCOUNTS[personaId] || getActiveMissionPersona();
    const payload = {
        ...postData,
        author: persona.name,
        authorRole: persona.role,
        avatar: persona.avatar,
        authorSlug: persona.slug,
        authorBadge: persona.badge,
        isMissionPost: true,
        personaId: persona.id,
        createdAtDateStr: new Date().toISOString()
    };
    const addFn = _missionDeps.addPostToCloud || window.LuminaDB?.addPostToCloud;
    return await addFn(payload);
}

// ══════════════════════════════════════════════════════════════════════════

// ── Dedykowany nasłuch zaproszeń na chrześcijańską kawę ☕ ──
export function subscribeToCoffeeInvites(userId, callback) {
    if (!userId || typeof callback !== 'function') return () => {};
    
    // 1. Sprawdź lokalny bufor
    try {
        const localInvites = JSON.parse(localStorage.getItem('lumina_coffee_invites') || '[]');
        const forMe = localInvites.filter(inv => inv.receiverId === userId && inv.status === 'pending_invitation');
        if (forMe.length) {
            callback(forMe[forMe.length - 1]);
        }
    } catch(e) {}

    // 2. Realtime nasłuch z chmury Firestore (bez złożonego indeksu composite)
    const db = _missionDeps.getDb ? _missionDeps.getDb() : null;
    const { collection, query, where, limit, onSnapshot } = _missionDeps.fs || {};
    if (!db || !collection || !onSnapshot) return () => {};
    try {
        const chatsQuery = query(
            collection(db, 'lumina_chats'),
            where('users', 'array-contains', userId),
            limit(40)
        );
        return onSnapshot(chatsQuery, (snap) => {
            const list = [];
            snap.forEach(docSnap => {
                const data = docSnap.data();
                if (data.lastMessageText && data.lastMessageText.includes('☕') && data.lastSenderId !== userId) {
                    list.push({
                        id: docSnap.id,
                        senderId: data.lastSenderId,
                        senderName: data.lastSenderName || 'Użytkownik LUMINA',
                        senderAvatar: data.lastSenderAvatar || 'lumina_icon.jpg',
                        note: data.lastMessageText,
                        status: 'pending_invitation',
                        lastMessageTimestamp: data.lastMessageTimestamp
                    });
                }
            });

            if (list.length > 0) {
                // Posortuj najnowsze na wierzchu
                list.sort((a, b) => {
                    const getTs = (item) => {
                        if (!item || !item.lastMessageTimestamp) return 0;
                        if (typeof item.lastMessageTimestamp === 'number') return item.lastMessageTimestamp;
                        if (item.lastMessageTimestamp.seconds) return item.lastMessageTimestamp.seconds * 1000;
                        if (typeof item.lastMessageTimestamp.toDate === 'function') return item.lastMessageTimestamp.toDate().getTime();
                        return 0;
                    };
                    return getTs(b) - getTs(a);
                });
                callback(list[0]);
            }
        }, (err) => {
            console.warn('Lumina Coffee Invites listener notice:', err.message);
        });
    } catch(e) {
        return () => {};
    }
}

