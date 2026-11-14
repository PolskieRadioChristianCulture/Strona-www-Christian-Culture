/**
 * LUMINA Live Prayer & Sync-Faith Lounge (JOMA-D015)
 * Extracted from lumina-db.js (Phase 1 Modularization)
 */
let _loungeDeps = {};
export function configureLiveLounge(deps = {}) {
    _loungeDeps = { ..._loungeDeps, ...deps };
}

/* ══════════════════════════════════════════════════════════════════════════
   WSTAWIENNICTWO CZASU RZECZYWISTEGO: LUMINA LIVE PRAYER (JOMA-D015)
   „Modlę się za Ciebie TERAZ” — haptyka, złoty rozbłysk i wstawiennictwo live
   ══════════════════════════════════════════════════════════════════════════ */
let _prayerBroadcastChan = null;
try {
    if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
        _prayerBroadcastChan = new BroadcastChannel('lumina_prayer_network');
    }
} catch (e) {}

export const LuminaLivePrayer = {
    _listeners: new Set(),
    _activeFloatingQueue: [],
    _initialized: false,

    init() {
        if (typeof window === 'undefined') return;
        if (this._initialized) return;
        this._initialized = true;

        if (_prayerBroadcastChan) {
            _prayerBroadcastChan.onmessage = (evt) => {
                if (evt.data && evt.data.type === 'PRAY_NOW') {
                    this._handleIncomingPrayer(evt.data.payload);
                }
            };
        }

        window.addEventListener('storage', (e) => {
            if (e.key === 'lumina_prayer_event_broadcast' && e.newValue) {
                try {
                    const payload = JSON.parse(e.newValue);
                    this._handleIncomingPrayer(payload);
                } catch (err) {}
            }
        });
    },

    subscribe(callback) {
        this.init();
        this._listeners.add(callback);
        return () => this._listeners.delete(callback);
    },

    triggerPrayNow(postId, targetAuthor, prayerUser) {
        this.init();
        const currentProfile = (_loungeDeps.getCurrentProfile || window.LuminaDB?.getCurrentProfile || (() => null))();
        const currentUser = (_loungeDeps.getCurrentUser || window.LuminaDB?.getCurrentUser || (() => null))();
        const prayerName = prayerUser?.name || currentProfile?.name || currentUser?.displayName || 'Brat/Siostra w Chrystusie';
        const prayerAvatar = prayerUser?.avatar || currentProfile?.avatar || currentUser?.photoURL || 'lumina_icon.jpg';

        const payload = {
            id: 'pray_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
            postId: postId,
            targetAuthor: (targetAuthor || '').trim(),
            prayerName: prayerName,
            prayerAvatar: prayerAvatar,
            timestamp: Date.now()
        };

        // Zapisz lokalnie w historii modlitw z 60-sekundowym oknem aktywności
        try {
            let active = JSON.parse(localStorage.getItem('lumina_active_prayers_map') || '{}');
            const now = Date.now();
            // Czyść wpisy starsze niż 60s
            for (const pid in active) {
                active[pid] = (active[pid] || []).filter(t => (now - t) < 60000);
                if (!active[pid].length) delete active[pid];
            }
            if (!active[postId]) active[postId] = [];
            active[postId].push(now);
            localStorage.setItem('lumina_active_prayers_map', JSON.stringify(active));
        } catch (e) {}

        // 1. Haptyka smartfona (wibracja delikatna modlitewna)
        this.triggerHapticPulse();

        // 2. Złoty Rozbłysk Wstawiennictwa na ekranie
        this.showGoldenPulse();

        // 3. Pływające cząstki wiary 🕊️✨
        this.emitFaithParticles();

        // 4. Emisja przez kanał BroadcastChannel & LocalStorage
        try {
            if (_prayerBroadcastChan) {
                _prayerBroadcastChan.postMessage({ type: 'PRAY_NOW', payload });
            }
            localStorage.setItem('lumina_prayer_event_broadcast', JSON.stringify(payload));
        } catch (e) {}

        // Powiadom lokalnych subskrybentów
        this._listeners.forEach(cb => {
            try { cb(payload, true); } catch (e) {}
        });

        return payload;
    },

    getLivePrayerCount(postId) {
        try {
            const active = JSON.parse(localStorage.getItem('lumina_active_prayers_map') || '{}');
            const now = Date.now();
            const list = (active[postId] || []).filter(t => (now - t) < 60000);
            return Math.max(1, list.length);
        } catch (e) {
            return 1;
        }
    },

    triggerHapticPulse() {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try {
                navigator.vibrate([70, 40, 90]);
            } catch (e) {}
        }
    },

    showGoldenPulse() {
        if (typeof document === 'undefined') return;
        const pulse = document.createElement('div');
        pulse.className = 'lumina-prayer-golden-pulse';
        document.body.appendChild(pulse);
        setTimeout(() => {
            if (pulse.parentNode) pulse.parentNode.removeChild(pulse);
        }, 1650);
    },

    emitFaithParticles(originX, originY) {
        if (typeof document === 'undefined') return;
        const emojis = ['🕊️', '✨', '🙏', '💛', '🕊️'];
        const startX = originX || (window.innerWidth / 2);
        const startY = originY || (window.innerHeight * 0.65);

        emojis.forEach((emoji, i) => {
            setTimeout(() => {
                const el = document.createElement('div');
                el.className = 'floating-faith-particle';
                el.textContent = emoji;
                el.style.left = (startX + (Math.random() * 80 - 40)) + 'px';
                el.style.top = (startY + (Math.random() * 40 - 20)) + 'px';
                el.style.setProperty('--dx', (Math.random() * 100 - 50) + 'px');
                document.body.appendChild(el);
                setTimeout(() => {
                    if (el.parentNode) el.parentNode.removeChild(el);
                }, 2000);
            }, i * 140);
        });
    },

    _handleIncomingPrayer(payload) {
        if (!payload) return;
        const currentProfile = (_loungeDeps.getCurrentProfile || window.LuminaDB?.getCurrentProfile || (() => null))();
        const currentUser = (_loungeDeps.getCurrentUser || window.LuminaDB?.getCurrentUser || (() => null))();
        const mySlug = (currentProfile?.slug || currentUser?.slug || '').toLowerCase();
        const myName = (currentProfile?.name || currentUser?.displayName || '').toLowerCase();
        const targetAuthor = (payload.targetAuthor || '').toLowerCase();

        // Jeśli to ja jestem autorem lub post jest mój:
        const isForMe = (mySlug && targetAuthor.includes(mySlug)) || (myName && targetAuthor.includes(myName));

        if (isForMe) {
            this.triggerHapticPulse();
            this.showGoldenPulse();
            this.emitFaithParticles();

            // Pokaż uroczysty baner
            const bannerFn = _loungeDeps.showInAppChatBanner || window.LuminaDB?.showInAppChatBanner;
            if (typeof bannerFn === 'function') {
                bannerFn({
                    title: '🕊️ Wstawiennictwo Czasu Rzeczywistego',
                    body: `${payload.prayerName} wstawia się za Tobą w modlitwie dokładnie w tej chwili! Nie jesteś sam(a) w Panu.`,
                    avatar: payload.prayerAvatar || 'lumina_icon.jpg',
                    senderName: payload.prayerName,
                    type: 'prayer'
                });
            } else if (typeof window.showToast === 'function') {
                window.showToast(`🕊️ ${payload.prayerName} wstawia się za Tobą w modlitwie dokładnie w tej chwili! ✨`);
            }
        }

        // Powiadom wszystkich subskrybentów
        this._listeners.forEach(cb => {
            try { cb(payload, false); } catch (e) {}
        });
    }
};

/* ══════════════════════════════════════════════════════════════════════════
   SYNC-FAITH LOUNGE: WSPÓLNE SŁUCHANIE & OGLĄDANIE DLA DWOJGA (JOMA-D015)
   Zsynchronizowany strumień Radia CC, CCTV24 i Kursu Małżeńskiego w czacie
   ══════════════════════════════════════════════════════════════════════════ */
let _syncBroadcastChan = null;
try {
    if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
        _syncBroadcastChan = new BroadcastChannel('lumina_sync_faith_lounge');
    }
} catch (e) {}

export const KURS_MALZENSKI_EPISODES = [
    { num: 1, title: 'Cztery wielkie sekrety rodzinnego szczęścia', id: 'OWKwixyQq2c' },
    { num: 2, title: 'Czy to rzeczywiście miłość?', id: 'gtGiaco7rwI' },
    { num: 3, title: 'Zasady dobrej rodzinnej łączności', id: 'FtY7zvLNK0A' },
    { num: 4, title: 'Co zrobić z gniewem i złością?', id: 'lqQ1f8L9F_s' },
    { num: 5, title: 'Jak rozwiązywać konflikty?', id: 'g2T49iFvdT8' },
    { num: 6, title: 'Jak radzić sobie ze stresem i depresją?', id: 'dF5-cQ7bN0Q' },
    { num: 7, title: 'Pieniądze w rodzinie', id: 'W6JgRz9kF_o' },
    { num: 8, title: 'Jak wychowywać dzieci?', id: 'bZ3nJcQ-21w' },
    { num: 9, title: 'Gdy dziecko dorasta', id: '2J2F7L-6kQ0' },
    { num: 10, title: 'Gdy małżeństwo przeżywa kryzys', id: 'p5l-qHk6j4Y' },
    { num: 11, title: 'Jak przebaczać i zacząć od nowa?', id: 'rV1d1JzQh9o' },
    { num: 12, title: 'Seksualność w małżeństwie', id: 'u8hZ_k1bN5g' },
    { num: 13, title: 'Wierność i zaufanie', id: 'qZ8x-bM6K78' },
    { num: 14, title: 'Duchowy wymiar rodziny', id: 'n7kL_w8B9g0' },
    { num: 15, title: 'Rola męża i ojca', id: 'm4nZ_j5K6h8' },
    { num: 16, title: 'Rola żony i matki', id: 'v9pL_d7Q1s4' },
    { num: 17, title: 'Jak budować dom pełen miłości?', id: 't6kM_z4V1j0' },
    { num: 18, title: 'Boże błogosławieństwo dla rodziny', id: 'x5nL_k9B3w8' }
];

export const LuminaSyncLounge = {
    _listeners: new Set(),
    _reactionListeners: new Set(),
    
    init() {
        if (typeof window === 'undefined') return;
        if (this._initialized) return;
        this._initialized = true;

        if (_syncBroadcastChan) {
            _syncBroadcastChan.onmessage = (evt) => {
                if (!evt.data) return;
                if (evt.data.type === 'SYNC_STATE') {
                    this._listeners.forEach(cb => {
                        try { cb(evt.data.chatId, evt.data.state, false); } catch(e) {}
                    });
                } else if (evt.data.type === 'SYNC_REACTION') {
                    this._reactionListeners.forEach(cb => {
                        try { cb(evt.data.chatId, evt.data.reaction); } catch(e) {}
                    });
                }
            };
        }

        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('lumina_sync_state_') && e.newValue) {
                const chatId = e.key.replace('lumina_sync_state_', '');
                try {
                    const state = JSON.parse(e.newValue);
                    this._listeners.forEach(cb => {
                        try { cb(chatId, state, false); } catch(e) {}
                    });
                } catch(err) {}
            } else if (e.key === 'lumina_sync_reaction_broadcast' && e.newValue) {
                try {
                    const data = JSON.parse(e.newValue);
                    this._reactionListeners.forEach(cb => {
                        try { cb(data.chatId, data.reaction); } catch(e) {}
                    });
                } catch(err) {}
            }
        });
    },

    subscribeState(callback) {
        this.init();
        this._listeners.add(callback);
        return () => this._listeners.delete(callback);
    },

    subscribeReactions(callback) {
        this.init();
        this._reactionListeners.add(callback);
        return () => this._reactionListeners.delete(callback);
    },

    broadcastState(chatId, state) {
        this.init();
        const payload = {
            ...state,
            updatedAt: Date.now()
        };
        try {
            localStorage.setItem('lumina_sync_state_' + chatId, JSON.stringify(payload));
            if (_syncBroadcastChan) {
                _syncBroadcastChan.postMessage({ type: 'SYNC_STATE', chatId, state: payload });
            }
        } catch(e) {}

        this._listeners.forEach(cb => {
            try { cb(chatId, payload, true); } catch(e) {}
        });
        return payload;
    },

    getState(chatId) {
        try {
            const raw = localStorage.getItem('lumina_sync_state_' + chatId);
            if (raw) return JSON.parse(raw);
        } catch(e) {}
        return {
            tab: 'radio',
            isPlaying: false,
            courseEpisode: 1,
            updatedAt: Date.now()
        };
    },

    sendReaction(chatId, emoji, label) {
        this.init();
        const currentProfile = (_loungeDeps.getCurrentProfile || window.LuminaDB?.getCurrentProfile || (() => null))();
        const currentUser = (_loungeDeps.getCurrentUser || window.LuminaDB?.getCurrentUser || (() => null))();
        const senderName = currentProfile?.name || currentUser?.displayName || 'Rozmówca';

        const reaction = {
            id: 'react_' + Date.now(),
            emoji: emoji,
            label: label,
            senderName: senderName,
            timestamp: Date.now()
        };

        try {
            if (_syncBroadcastChan) {
                _syncBroadcastChan.postMessage({ type: 'SYNC_REACTION', chatId, reaction });
            }
            localStorage.setItem('lumina_sync_reaction_broadcast', JSON.stringify({ chatId, reaction, _ts: Date.now() }));
        } catch(e) {}

        this._reactionListeners.forEach(cb => {
            try { cb(chatId, reaction); } catch(e) {}
        });

        // Wstaw animację cząstki wiary
        if (typeof LuminaLivePrayer !== 'undefined' && LuminaLivePrayer.emitFaithParticles) {
            LuminaLivePrayer.emitFaithParticles();
        }

        return reaction;
    }
};

// Expose on window.LuminaDB
if (typeof window !== 'undefined') {
    window.LuminaDB = window.LuminaDB || {};
    window.LuminaDB.LuminaLivePrayer = LuminaLivePrayer;
    window.LuminaDB.LuminaSyncLounge = LuminaSyncLounge;
    window.LuminaDB.KURS_MALZENSKI_EPISODES = KURS_MALZENSKI_EPISODES;
    window.LuminaLivePrayer = LuminaLivePrayer;
    window.LuminaSyncLounge = LuminaSyncLounge;
}

