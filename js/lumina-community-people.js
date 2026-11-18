/**
 * LUMINA — „Poznajmy się bliżej”: wszyscy członkowie społeczności (2026-10-11)
 * Zdjęcie profilowe użytkownika; zastępcze logo LUMINA wyłącznie w ostateczności.
 * Strażnik Standardów Christian Culture • 2026-10-07
 *
 * Wcześniej karuzela pokazywała stałą listę 10 kont, w większości logotypów marek
 * (Radio CC, CC TV, CC Men…), a profile bez zdjęcia — logo LUMINA.
 * Teraz: członkowie społeczności z uzupełnionym profilem i prawdziwym zdjęciem
 * (jednorazowy odczyt, stała kolejność w czasie wizyty) + osoby oficjalne z prawdziwą twarzą.
 */
(function () {
    'use strict';
    if (window.getLuminaCarouselPeople) return;

    var OFFICIAL_PEOPLE = [
        { name: 'Cezary Rogowski',   slug: 'cezaryrgowski',    tag: 'Założyciel CC',        avatar: '/avatar_cezary_official.jpg',   verified: true },
        { name: 'Wioletta Rogowska', slug: 'wiolettarogowska', tag: 'Ewangelizacja',        avatar: '/avatar_wioletta_official.jpg', verified: true },
        { name: 'Andrzej Thiel',     slug: 'andrzejthiel',     tag: 'Słowo na każdy dzień', avatar: '/avatar_andrzej_thiel.jpg',     verified: true }
    ];
    var FALLBACK_AVATAR = '/images/lumina-avatar-zastepczy.jpg';
    var community = [];
    window.LUMINA_CAROUSEL_FALLBACK_AVATAR = FALLBACK_AVATAR;
    // Gdy zdjęcie się nie wczyta — logo LUMINA (karta zostaje; nikt nie znika z karuzeli).
    window.luminaCarouselAvatarFallback = function (img) {
        if (!img || img.getAttribute('data-fallback') === '1') return;
        img.setAttribute('data-fallback', '1');
        img.src = FALLBACK_AVATAR;
    };

    function esc(v) {
        return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    window.getLuminaCarouselPeople = function () {
        var seen = {};
        var list = [];
        community.forEach(function (p) {
            if (!p) return;
            var s = String(p.slug || '').toLowerCase().replace(/^u_/, '');
            var n = String(p.name || '').toLowerCase();
            if (s === 'zbyszekgieron' || s === 'zbyszek' || n.includes('zbyszek') || n.includes('gieroń') || n.includes('gieron')) return;
            if (seen[p.slug]) return;
            seen[p.slug] = true;
            list.push({
                name: esc(p.name),
                slug: encodeURIComponent(p.slug),
                tag: esc(p.city || 'Społeczność LUMINA'),
                avatar: esc(p.avatar || FALLBACK_AVATAR),
                verified: !!p.verified
            });
        });
        // Osoby oficjalne zawsze obecne (jeśli nie przyszły już z bazy) — na początku listy.
        var official = OFFICIAL_PEOPLE.filter(function (p) {
            var s = String(p.slug || '').toLowerCase().replace(/^u_/, '');
            var n = String(p.name || '').toLowerCase();
            if (s === 'zbyszekgieron' || s === 'zbyszek' || n.includes('zbyszek') || n.includes('gieroń') || n.includes('gieron')) return false;
            return !seen[p.slug];
        });
        return official.concat(list);
    };

    function load(attempt) {
        var db = window.LuminaDB;
        if (!db || typeof db.getCommunityCarouselProfiles !== 'function') {
            if ((attempt || 0) < 40) setTimeout(function () { load((attempt || 0) + 1); }, 250);
            return;
        }
        db.getCommunityCarouselProfiles(60).then(function (people) {
            if (!Array.isArray(people) || !people.length) return;
            community = people;
            try { window.dispatchEvent(new CustomEvent('lumina:carousel-people')); } catch (e) {}
            if (typeof window.renderFeed === 'function') {
                clearTimeout(window.__luminaPeopleRenderTimer);
                window.__luminaPeopleRenderTimer = setTimeout(window.renderFeed, 120);
            }
        }).catch(function () {});
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { load(0); }, { once: true });
    } else {
        load(0);
    }
})();
