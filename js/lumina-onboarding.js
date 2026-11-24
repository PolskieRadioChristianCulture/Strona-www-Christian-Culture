/**
 * LUMINA — Kreator profilu po pierwszym logowaniu
 * Strażnik Standardów Christian Culture • 2026-10-07
 *
 * Każdy nowy (i każdy niekompletny) członek społeczności jest zapraszany do uzupełnienia:
 *   • imienia i nazwiska, miasta (wymagane), wieku, płci, wyznania, „o mnie” (opcjonalne),
 *   • co najmniej jednego PRAWDZIWEGO zdjęcia profilowego (wymagane).
 * Do czasu uzupełnienia profil nie pojawia się na karuzeli „Poznajmy się bliżej”.
 * Kreator wraca przy każdej wizycie (raz na sesję), dopóki profil nie jest kompletny.
 *
 * Weryfikacja zdjęcia: tutaj — rozmiar, jakość, wykrywanie twarzy (jeśli przeglądarka je wspiera);
 * po zapisie — funkcja chmurowa Google Cloud Vision (onProfileAvatarChanged), jeśli jest wdrożona.
 */
(function () {
    'use strict';
    if (window.__luminaOnboarding) return;
    if (typeof location !== 'undefined' && /[?&]embed=1\b/.test(location.search)) return;
    if (typeof document !== 'undefined' && (document.documentElement.classList.contains('cc-mess-embedded') || document.documentElement.hasAttribute('data-no-onboarding'))) return;
    window.__luminaOnboarding = true;

    var SESSION_KEY = 'lumina_onboarding_later';
    var forceOpen = /[?&](uzupelnij|onboarding)=1\b/.test(location.search);
    var state = { step: 1, photo: null, saving: false };
    var root = null;

    // ── narzędzia ─────────────────────────────────────────────────────────
    function $(sel) { return root ? root.querySelector(sel) : null; }
    function esc(v) {
        return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function db() { return window.LuminaDB || {}; }

    function waitForIdentity(cb, tries) {
        tries = tries || 0;
        var L = db();
        var user = typeof L.getCurrentUser === 'function' ? L.getCurrentUser() : null;
        var profile = typeof L.getCurrentProfile === 'function' ? L.getCurrentProfile() : null;
        // @007 (L0 24.11.2026): decyzja tylko na podstawie profilu Z BAZY. Kopia z przeglądarki ma zdjęcie
        // podmienione na ikonę LUMINA — wcześniej kreator prosił o zdjęcie na każdej stronie.
        var fromServer = !!(user && window.__luminaProfileServerUid === user.uid);
        if (user && profile && fromServer && typeof L.getLuminaProfileCompletion === 'function') return cb(user, profile);
        if (tries > 60) return; // ~30 s — gość lub brak sieci: nic nie pokazujemy
        setTimeout(function () { waitForIdentity(cb, tries + 1); }, 500);
    }

    function shouldOpen(user, profile) {
        var L = db();
        if (!user || user.isAnonymous) return false;
        if (document.documentElement.hasAttribute('data-no-onboarding')) return false;
        if (typeof L.detectLuminaOfficialIdentity === 'function' && L.detectLuminaOfficialIdentity(user)) return false;
        if (profile && profile.isMissionAccount) return false;
        if (L.getLuminaProfileCompletion(profile).complete) return false;
        if (!forceOpen) {
            try { if (sessionStorage.getItem(SESSION_KEY) === '1') return false; } catch (e) {}
        }
        return true;
    }

    // ── zdjęcie: wczytanie, kontrola jakości, kadrowanie, kompresja ─────────
    function loadImage(file) {
        return new Promise(function (resolve, reject) {
            if (!file || !/^image\/(jpe?g|png|webp|heic|heif)$/i.test(file.type || 'image/jpeg')) {
                return reject(new Error('Wybierz zdjęcie w formacie JPG, PNG lub WEBP.'));
            }
            if (file.size > 25 * 1024 * 1024) return reject(new Error('To zdjęcie jest bardzo duże. Wybierz mniejsze (do 25 MB).'));
            var url = URL.createObjectURL(file);
            var img = new Image();
            img.onload = function () { resolve({ img: img, url: url }); };
            img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Nie udało się odczytać zdjęcia. Spróbuj innego pliku.')); };
            img.src = url;
        });
    }

    function analyse(img) {
        var w = img.naturalWidth, h = img.naturalHeight;
        if (Math.min(w, h) < 300) throw new Error('Zdjęcie jest za małe (min. 300 × 300 px). Wybierz wyraźniejsze.');
        var c = document.createElement('canvas');
        c.width = 48; c.height = 48;
        var x = c.getContext('2d');
        x.drawImage(img, 0, 0, 48, 48);
        var d = x.getImageData(0, 0, 48, 48).data;
        var sum = 0, sq = 0, n = 0;
        for (var i = 0; i < d.length; i += 4) {
            var l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            sum += l; sq += l * l; n++;
        }
        var mean = sum / n, sd = Math.sqrt(Math.max(0, sq / n - mean * mean));
        if (sd < 12) throw new Error('Na zdjęciu prawie nic nie widać (jednolity kolor). Wybierz zdjęcie, na którym widać Twoją twarz.');
        if (mean < 18) throw new Error('Zdjęcie jest zbyt ciemne. Wybierz jaśniejsze.');
    }

    function detectFace(img) {
        if (!('FaceDetector' in window)) return Promise.resolve(null); // brak wsparcia → sprawdzi chmura
        try {
            return new window.FaceDetector({ fastMode: true, maxDetectedFaces: 3 }).detect(img)
                .then(function (faces) { return faces.length > 0; })
                .catch(function () { return null; });
        } catch (e) { return Promise.resolve(null); }
    }

    function toAvatarDataUrl(img) {
        var w = img.naturalWidth, h = img.naturalHeight, side = Math.min(w, h);
        var sx = (w - side) / 2, sy = Math.max(0, (h - side) / 2 - side * 0.08); // lekko w górę — twarz zwykle wyżej
        var out = 640;
        var c = document.createElement('canvas');
        c.width = out; c.height = out;
        var x = c.getContext('2d');
        x.imageSmoothingQuality = 'high';
        x.drawImage(img, sx, sy, side, side, 0, 0, out, out);
        var q = 0.86, data = c.toDataURL('image/jpeg', q);
        while (data.length > 300000 && q > 0.5) { q -= 0.08; data = c.toDataURL('image/jpeg', q); }
        return data;
    }

    // ── interfejs ─────────────────────────────────────────────────────────
    var CSS = '' +
        '.lob-backdrop{position:fixed;inset:0;z-index:2147483000;background:rgba(15,23,42,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:flex-end;justify-content:center;animation:lobFade .25s ease}' +
        '@media(min-width:640px){.lob-backdrop{align-items:center}}' +
        '.lob-card{width:100%;max-width:520px;max-height:94vh;overflow:auto;background:#fff;color:#0f172a;border-radius:24px 24px 0 0;box-shadow:0 -10px 40px rgba(15,23,42,.25);padding:22px 20px calc(20px + env(safe-area-inset-bottom));font-family:"Plus Jakarta Sans","Outfit",system-ui,sans-serif;animation:lobUp .3s cubic-bezier(.2,.8,.2,1)}' +
        '@media(min-width:640px){.lob-card{border-radius:24px;padding:28px}}' +
        '.lob-progress{display:flex;gap:6px;margin-bottom:18px}.lob-progress span{flex:1;height:4px;border-radius:4px;background:#e2e8f0}.lob-progress span.on{background:#C4A35A}' +
        '.lob-eyebrow{font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#8a6d2b;margin:0 0 6px}' +
        '.lob-title{font-family:"Outfit",system-ui,sans-serif;font-size:1.45rem;line-height:1.25;margin:0 0 8px;font-weight:700}' +
        '.lob-lead{font-size:.95rem;line-height:1.55;color:#475569;margin:0 0 18px}' +
        '.lob-list{list-style:none;padding:0;margin:0 0 20px;display:grid;gap:10px}.lob-list li{display:flex;gap:10px;align-items:flex-start;font-size:.92rem;color:#334155}.lob-list b{color:#0f172a}' +
        '.lob-dot{flex:0 0 26px;height:26px;border-radius:50%;background:#faf5e8;color:#8a6d2b;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.8rem}' +
        '.lob-field{margin-bottom:14px}.lob-field label{display:block;font-size:.85rem;font-weight:600;margin-bottom:6px;color:#1e293b}.lob-field .req{color:#b45309}' +
        '.lob-field input,.lob-field select,.lob-field textarea{width:100%;box-sizing:border-box;min-height:48px;padding:12px 14px;border:1.5px solid #cbd5e1;border-radius:14px;font:inherit;font-size:16px;color:#0f172a;background:#fff;outline:none;transition:border-color .15s,box-shadow .15s}' +
        '.lob-field textarea{min-height:84px;resize:vertical}' +
        '.lob-field input:focus,.lob-field select:focus,.lob-field textarea:focus{border-color:#C4A35A;box-shadow:0 0 0 3px rgba(196,163,90,.25)}' +
        '.lob-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}' +
        '.lob-hint{font-size:.78rem;color:#64748b;margin-top:5px}' +
        '.lob-error{display:none;background:#fef2f2;border:1px solid #fecaca;color:#991b1b;border-radius:12px;padding:10px 12px;font-size:.88rem;margin:0 0 14px}.lob-error.show{display:block}' +
        '.lob-photo{display:flex;flex-direction:column;align-items:center;gap:14px;margin:6px 0 18px}' +
        '.lob-avatar{width:148px;height:148px;border-radius:50%;background:#f1f5f9 center/cover no-repeat;border:4px solid #fff;box-shadow:0 0 0 2px #C4A35A,0 10px 24px rgba(15,23,42,.15);display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:2.6rem}' +
        '.lob-photo-btns{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;width:100%}' +
        '.lob-btn{min-height:48px;padding:12px 18px;border-radius:14px;border:0;font:inherit;font-weight:700;font-size:.95rem;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:transform .1s,background .15s}' +
        '.lob-btn:active{transform:scale(.98)}.lob-btn:focus-visible{outline:3px solid #C4A35A;outline-offset:2px}' +
        '.lob-btn-primary{background:#0f172a;color:#fff;flex:1}.lob-btn-primary[disabled]{opacity:.5;cursor:not-allowed}' +
        '.lob-btn-gold{background:#C4A35A;color:#1c1406}' +
        '.lob-btn-ghost{background:#f1f5f9;color:#334155}' +
        '.lob-actions{display:flex;gap:10px;margin-top:8px}' +
        '.lob-later{display:block;margin:12px auto 0;background:none;border:0;color:#64748b;font:inherit;font-size:.88rem;text-decoration:underline;min-height:44px;cursor:pointer}' +
        '.lob-note{font-size:.8rem;color:#64748b;line-height:1.5;text-align:center;margin:0 0 6px}' +
        '.lob-ok{font-size:3rem;text-align:center;margin:8px 0}' +
        '@keyframes lobFade{from{opacity:0}to{opacity:1}}@keyframes lobUp{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}' +
        '@media(prefers-reduced-motion:reduce){.lob-backdrop,.lob-card{animation:none}}' +
        '.sr-only-lob{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}';

    function injectCss() {
        if (document.getElementById('lumina-onboarding-css')) return;
        var st = document.createElement('style');
        st.id = 'lumina-onboarding-css';
        st.textContent = CSS;
        document.head.appendChild(st);
    }

    function progress(n) {
        return '<div class="lob-progress" aria-hidden="true">' +
            [1, 2, 3].map(function (i) { return '<span class="' + (i <= n ? 'on' : '') + '"></span>'; }).join('') +
            '</div><p class="sr-only-lob">Krok ' + n + ' z 3</p>';
    }

    function render(user, profile) {
        var L = db();
        var miss = L.getLuminaProfileCompletion(profile).missing;
        var name = (profile.name && miss.indexOf('name') === -1) ? profile.name : (user.displayName || '');
        var html;
        if (state.step === 1) {
            html = progress(1) +
                '<p class="lob-eyebrow">Witaj w LUMINA</p>' +
                '<h2 class="lob-title" id="lobTitle">Szczęść Boże' + (name ? ', ' + esc(name.split(' ')[0]) : '') + '! 🕊️</h2>' +
                '<p class="lob-lead">LUMINA to społeczność prawdziwych ludzi. Żeby inni mogli Cię poznać, uzupełnij profil — zajmie to około minuty.</p>' +
                '<ul class="lob-list">' +
                '<li><span class="lob-dot">1</span><span><b>Imię i miasto</b> — tak, jak chcesz być widoczny dla innych.</span></li>' +
                '<li><span class="lob-dot">2</span><span><b>Prawdziwe zdjęcie</b> — na którym widać Twoją twarz. Bez logo i grafik.</span></li>' +
                '<li><span class="lob-dot">3</span><span>Potem pojawisz się w sekcji <b>„Poznajmy się bliżej”</b>.</span></li>' +
                '</ul>' +
                '<div class="lob-actions"><button type="button" class="lob-btn lob-btn-primary" data-act="next">Zaczynamy</button></div>' +
                '<button type="button" class="lob-later" data-act="later">Uzupełnię później</button>';
        } else if (state.step === 2) {
            html = progress(2) +
                '<p class="lob-eyebrow">Krok 2 z 3</p>' +
                '<h2 class="lob-title" id="lobTitle">Kilka słów o Tobie</h2>' +
                '<div class="lob-error" role="alert" id="lobErr"></div>' +
                '<div class="lob-field"><label for="lobName">Imię i nazwisko <span class="req">*</span></label>' +
                '<input id="lobName" autocomplete="name" maxlength="60" required value="' + esc(name) + '"></div>' +
                '<div class="lob-field"><label for="lobCity">Miejscowość <span class="req">*</span></label>' +
                '<input id="lobCity" autocomplete="address-level2" maxlength="80" required placeholder="np. Kraków" value="' + esc(profile.city || '') + '"></div>' +
                '<div class="lob-row">' +
                '<div class="lob-field"><label for="lobAge">Wiek</label><input id="lobAge" type="number" inputmode="numeric" min="16" max="110" value="' + esc(profile.age || '') + '"></div>' +
                '<div class="lob-field"><label for="lobGender">Płeć</label><select id="lobGender">' +
                '<option value="">— wybierz —</option>' +
                '<option value="kobieta"' + (profile.gender === 'kobieta' ? ' selected' : '') + '>Kobieta</option>' +
                '<option value="mezczyzna"' + (profile.gender === 'mezczyzna' ? ' selected' : '') + '>Mężczyzna</option>' +
                '</select></div></div>' +
                '<div class="lob-field"><label for="lobDenom">Wspólnota / wyznanie</label><select id="lobDenom">' +
                ['', 'Rzymskokatolickie', 'Protestanckie', 'Ewangelikalne', 'Prawosławne', 'Zielonoświątkowe', 'Baptystyczne', 'Adwentystyczne', 'Inne chrześcijańskie']
                    .map(function (d) { return '<option value="' + esc(d) + '"' + (profile.denom === d ? ' selected' : '') + '>' + (d || '— wybierz —') + '</option>'; }).join('') +
                '</select></div>' +
                '<div class="lob-field"><label for="lobBio">O mnie</label><textarea id="lobBio" maxlength="400" placeholder="Kilka zdań o sobie i swojej wierze">' + esc(profile.bio || '') + '</textarea>' +
                '<p class="lob-hint">Widoczne publicznie. Nie podawaj adresu ani numeru telefonu.</p></div>' +
                '<div class="lob-actions"><button type="button" class="lob-btn lob-btn-ghost" data-act="back">Wstecz</button>' +
                '<button type="button" class="lob-btn lob-btn-primary" data-act="saveData">Dalej</button></div>';
        } else if (state.step === 3) {
            var hasPhoto = !!state.photo || miss.indexOf('photo') === -1;
            var preview = state.photo || (miss.indexOf('photo') === -1 ? profile.avatar : '');
            html = progress(3) +
                '<p class="lob-eyebrow">Krok 3 z 3</p>' +
                '<h2 class="lob-title" id="lobTitle">Twoje prawdziwe zdjęcie</h2>' +
                '<p class="lob-lead">Wybierz wyraźne zdjęcie, na którym widać Twoją twarz. Dzięki temu LUMINA pozostaje miejscem prawdziwych spotkań.</p>' +
                '<div class="lob-error" role="alert" id="lobErr"></div>' +
                '<div class="lob-photo">' +
                '<div class="lob-avatar" id="lobAvatar" role="img" aria-label="' + (preview ? 'Podgląd zdjęcia profilowego' : 'Brak zdjęcia') + '"' +
                (preview ? ' style="background-image:url(\'' + esc(preview) + '\')"' : '') + '>' + (preview ? '' : '👤') + '</div>' +
                '<div class="lob-photo-btns">' +
                '<button type="button" class="lob-btn lob-btn-gold" data-act="camera">📷 Zrób zdjęcie</button>' +
                '<button type="button" class="lob-btn lob-btn-ghost" data-act="gallery">🖼️ Wybierz z galerii</button>' +
                '</div>' +
                '<input type="file" id="lobCam" accept="image/*" capture="user" hidden>' +
                '<input type="file" id="lobGal" accept="image/jpeg,image/png,image/webp,image/heic" hidden>' +
                '</div>' +
                '<p class="lob-note">Zdjęcie zostanie automatycznie sprawdzone. Logo, grafiki i zdjęcia bez twarzy nie będą widoczne w społeczności.</p>' +
                '<div class="lob-actions"><button type="button" class="lob-btn lob-btn-ghost" data-act="back">Wstecz</button>' +
                '<button type="button" class="lob-btn lob-btn-primary" data-act="finish"' + (hasPhoto ? '' : ' disabled') + '>Zapisz profil</button></div>';
        } else {
            html = '<div class="lob-ok" aria-hidden="true">✨</div>' +
                '<h2 class="lob-title" id="lobTitle" style="text-align:center">Gotowe! Witamy w społeczności</h2>' +
                '<p class="lob-lead" style="text-align:center">Za chwilę przeniesiemy Cię na Twój profil — możesz tam dodać więcej o sobie.</p>' +
                '<div class="lob-actions"><button type="button" class="lob-btn lob-btn-primary" data-act="profile">Przejdź do mojego profilu</button></div>' +
                '<button type="button" class="lob-later" data-act="close">Zostań na tej stronie</button>';
        }
        $('.lob-card').innerHTML = html;
        var first = $('input:not([hidden]), select, textarea, .lob-btn-primary');
        if (first) setTimeout(function () { try { first.focus({ preventScroll: true }); } catch (e) {} }, 60);
    }

    function showError(msg) {
        var el = $('#lobErr');
        if (!el) return;
        el.textContent = msg;
        el.classList.add('show');
    }

    function close(later) {
        if (later) { try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) {} }
        if (root) root.remove();
        root = null;
        document.documentElement.style.overflow = '';
    }

    function goToOwnProfile() {
        if (state.redirectTimer) { clearTimeout(state.redirectTimer); state.redirectTimer = null; }
        var p = db().getCurrentProfile ? db().getCurrentProfile() : null;
        var slug = p && (p.slug || p.uid);
        close(false);
        if (!slug) return;
        var target = 'lumina-profile.html?u=' + encodeURIComponent(slug) + '&nowy=1';
        // Już na własnym profilu — tylko odśwież, żeby pokazać nowe zdjęcie
        if (/lumina-profile/.test(location.pathname) && new RegExp('[?&]u(ser)?=' + slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(location.search)) { location.reload(); return; }
        location.href = '/' + target;
    }

    function handleFile(file, user, profile) {
        var errEl = $('#lobErr'); if (errEl) errEl.classList.remove('show');
        loadImage(file).then(function (r) {
            try { analyse(r.img); } catch (e) { URL.revokeObjectURL(r.url); throw e; }
            return detectFace(r.img).then(function (hasFace) {
                if (hasFace === false) {
                    URL.revokeObjectURL(r.url);
                    throw new Error('Nie widzimy twarzy na tym zdjęciu. Wybierz zdjęcie, na którym widać Ciebie.');
                }
                var data = toAvatarDataUrl(r.img);
                URL.revokeObjectURL(r.url);
                return data;
            });
        }).then(function (dataUrl) {
            state.photo = dataUrl;
            render(user, profile);
        }).catch(function (e) {
            showError(e && e.message ? e.message : 'Nie udało się przygotować zdjęcia.');
        });
    }

    function open(user, profile) {
        injectCss();
        root = document.createElement('div');
        root.className = 'lob-backdrop';
        root.setAttribute('role', 'dialog');
        root.setAttribute('aria-modal', 'true');
        root.setAttribute('aria-labelledby', 'lobTitle');
        root.innerHTML = '<div class="lob-card"></div>';
        document.body.appendChild(root);
        document.documentElement.style.overflow = 'hidden';
        var L = db();
        var miss = L.getLuminaProfileCompletion(profile).missing;
        state.step = (miss.indexOf('name') === -1 && miss.indexOf('city') === -1) ? 3 : 1;
        render(user, profile);

        root.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && state.step < 4) close(true);
            if (e.key === 'Tab') { // prosta pułapka fokusu
                var f = root.querySelectorAll('button:not([disabled]), input:not([hidden]), select, textarea');
                if (!f.length) return;
                var a = f[0], z = f[f.length - 1];
                if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
                else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
            }
        });

        root.addEventListener('change', function (e) {
            if (e.target && (e.target.id === 'lobCam' || e.target.id === 'lobGal') && e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0], user, profile);
                e.target.value = '';
            }
        });

        root.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-act]');
            if (!btn || state.saving) return;
            var act = btn.getAttribute('data-act');
            if (act === 'later') return close(true);
            if (act === 'close') { if (state.redirectTimer) clearTimeout(state.redirectTimer); return close(false); }
            if (act === 'profile') return goToOwnProfile();
            if (act === 'next') { state.step = 2; return render(user, profile); }
            if (act === 'back') { state.step = Math.max(1, state.step - 1); return render(user, profile); }
            if (act === 'camera') return $('#lobCam').click();
            if (act === 'gallery') return $('#lobGal').click();
            if (act === 'saveData') {
                var nm = $('#lobName').value.trim(), ct = $('#lobCity').value.trim();
                if (nm.length < 3 || nm.split(/\s+/).length < 2) return showError('Podaj imię i nazwisko (np. Anna Kowalska).');
                if (ct.length < 2) return showError('Podaj miejscowość.');
                var ageV = $('#lobAge').value;
                if (ageV && (+ageV < 16 || +ageV > 110)) return showError('Wiek musi mieścić się w przedziale 16–110 lat.');
                state.saving = true; btn.disabled = true; btn.textContent = 'Zapisywanie…';
                L.completeOwnLuminaProfile({
                    name: nm, city: ct, age: ageV, gender: $('#lobGender').value,
                    denom: $('#lobDenom').value, bio: $('#lobBio').value
                }).then(function () {
                    state.saving = false;
                    profile = L.getCurrentProfile() || profile;
                    state.step = 3; render(user, profile);
                }).catch(function (err) {
                    state.saving = false; btn.disabled = false; btn.textContent = 'Dalej';
                    showError(err && err.message ? err.message : 'Nie udało się zapisać. Sprawdź połączenie i spróbuj ponownie.');
                });
                return;
            }
            if (act === 'finish') {
                state.saving = true; btn.disabled = true; btn.textContent = 'Zapisywanie…';
                var payload = state.photo ? { avatar: state.photo } : {};
                L.completeOwnLuminaProfile(payload).then(function (res) {
                    state.saving = false;
                    profile = L.getCurrentProfile() || profile;
                    if (res && res.complete) {
                        state.step = 4; render(user, profile);
                        // @007 (L0 24.11.2026): po zdjęciu od razu na własny profil, by go uzupełnić
                        state.redirectTimer = setTimeout(goToOwnProfile, 2500);
                    }
                    else {
                        state.step = 2; render(user, profile);
                        showError('Uzupełnij jeszcze brakujące pola.');
                    }
                }).catch(function (err) {
                    state.saving = false; btn.disabled = false; btn.textContent = 'Zapisz profil';
                    showError(err && err.message ? err.message : 'Nie udało się zapisać zdjęcia. Spróbuj ponownie.');
                });
            }
        });
    }

    window.openLuminaProfileWizard = function () {
        waitForIdentity(function (user, profile) {
            if (!root) open(user, profile);
        });
    };

    function boot() {
        waitForIdentity(function (user, profile) {
            if (!shouldOpen(user, profile)) return;
            setTimeout(function () {
                // ponowne sprawdzenie tuż przed otwarciem (profil mógł się w międzyczasie zaktualizować)
                var fresh = db().getCurrentProfile ? db().getCurrentProfile() : profile;
                if (!root && shouldOpen(user, fresh || profile)) open(user, fresh || profile);
            }, 1200);
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
    else boot();
})();
