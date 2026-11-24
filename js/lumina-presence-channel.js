// One server subscription per page, regardless of the number of UI consumers.
// Presence is ephemeral. Chat messages and their storage are never touched here.
export function createPresenceChannel({ listen, document, now = Date.now, setInterval, clearInterval }) {
    const subscribers = new Set();
    let rows = [], available = false, stop = null, clock = null, generation = 0;
    // @007 (L0 24.11.2026): `sessions` = znacznik każdej karty/urządzenia (0 = karta zamknięta/schowana).
    // Brak żadnego żywego znacznika → offline od razu, bez czekania 90 s. Stare dokumenty bez `sessions` — jak dotąd.
    function hasLiveSession(data) {
        const s = data.sessions;
        if (!s || typeof s !== 'object') return true;
        const ref = Number(data.lastActiveMillis) || 0;
        // Ostatni „jestem” wysłała starsza wersja strony (bez znaczników) — znaczniki są nieaktualne, liczy się czas.
        if (ref > (Number(data.sessionsAt) || 0) + 5000) return true;
        return Object.values(s).some(v => {
            const n = Number(v) || 0;
            return n > 0 && (!ref || n >= ref - 120000);
        });
    }
    function emit() {
        const time = now();
        const members = rows.map(data => {
            const millis = data.lastActive?.toMillis?.() || data.lastActiveMillis || 0;
            return { ...data, online: Boolean(available && data.isLoggedIn === true && data.uid &&
                millis > 0 && millis <= time + 5000 && millis >= time - 90000 && hasLiveSession(data)) };
        });
        for (const callback of subscribers) {
            try { callback(members.filter(p => p.online), { available, members }); } catch (_) {}
        }
    }
    function disconnect() {
        generation++;
        if (stop) stop();
        stop = null;
        if (clock !== null) clearInterval(clock);
        clock = null;
        available = false;
    }
    function connect() {
        if (stop || !subscribers.size || document.visibilityState === 'hidden') return;
        const current = ++generation;
        stop = listen(snapshot => {
            if (generation !== current) return;
            rows = [];
            snapshot.forEach(d => { if (!d.metadata?.hasPendingWrites) rows.push({ id: d.id, ...d.data() }); });
            available = snapshot.metadata?.fromCache === false;
            emit();
        }, () => {
            if (generation !== current) return;
            available = false;
            emit(); // No retry loop on exhausted quota. Resume after a visibility change.
        });
        clock = setInterval(emit, 15000);
    }
    function visibility() {
        if (document.visibilityState === 'hidden') { disconnect(); emit(); }
        else connect();
    }
    return callback => {
        subscribers.add(callback);
        if (subscribers.size === 1) document.addEventListener('visibilitychange', visibility);
        connect();
        emit();
        let stopped = false;
        return () => {
            if (stopped) return;
            stopped = true;
            subscribers.delete(callback);
            if (!subscribers.size) {
                disconnect(); rows = [];
                document.removeEventListener('visibilitychange', visibility);
            }
        };
    };
}
