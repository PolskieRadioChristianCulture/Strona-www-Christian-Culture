/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA UNIVERSAL PROFILE & SYSTEM SEARCH ENGINE (DEEP MULTI-FIELD SEARCH)
 * ══════════════════════════════════════════════════════════════════════════
 */

// Helper to remove Polish diacritics and normalize search tokens
export function normalizeSearchString(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ł/g, 'l')
        .replace(/Ł/g, 'l')
        .trim();
}

export const OMNI_BASE_PROFILES = [
    {
        id: 'cezaryrgowski',
        slug: 'cezaryrgowski',
        name: 'Cezary Rogowski',
        handle: '@cezary',
        aliases: ['cezary', 'rogowski', 'cezary rogowski', 'czarek', 'nazir', 'czarkes'],
        age: 51,
        city: 'Ostrowiec Świętokrzyski, Polska',
        status: 'Żonaty',
        job: 'Założyciel Christian Culture 👑',
        bio: 'Założyciel Christian Culture. Razem z żoną Wiolettą służymy Panu.',
        verse: '„Ja i mój dom służyć będziemy Panu.” (Joz 24, 15)',
        church: 'Christian Culture',
        denom: 'Rzymskokatolickie / Wspólnota',
        tags: ['Założyciel', 'Ewangelizacja', 'Radio CC', 'Worship', 'Rodzina', 'Wiara'],
        avatar: 'avatar_cezary_official.jpg',
        url: 'lumina.cezaryrgowski.html',
        type: 'founder',
        badge: 'Założyciel CC'
    },
    {
        id: 'wiolettarogowska',
        slug: 'wiolettarogowska',
        name: 'Wioletta Rogowska',
        handle: '@wioletta',
        aliases: ['wioletta', 'rogowska', 'wioletta rogowska', 'wiola'],
        age: 50,
        city: 'Ostrowiec Świętokrzyski, Polska',
        status: 'Mężatka',
        job: 'Współzałożycielka Christian Culture 🌸',
        bio: 'Współzałożycielka Christian Culture. Niewiastę dzielną któż znajdzie? Jej wartość przewyższa perły.',
        verse: '„Niewiastę dzielną któż znajdzie? Jej wartość przewyższa perły.” (Prz 31, 10)',
        church: 'Christian Culture',
        denom: 'Rzymskokatolickie',
        tags: ['Współzałożycielka', 'Kobiety Wiary', 'CC Women', 'Rodzina', 'Modlitwa'],
        avatar: 'avatar_wioletta_official.jpg',
        url: 'lumina.wiolettarogowska.html',
        type: 'founder',
        badge: 'Współzałożycielka CC'
    },
    {
        id: 'magdalena',
        slug: 'magdalena',
        name: 'Magdalena',
        handle: '@magdalena',
        aliases: ['magda', 'magdalena', 'magdalena poznan', 'lekarka'],
        age: 43,
        city: 'Poznań, Polska',
        status: 'Panna • Dojrzała chrześcijanka',
        job: 'Lekarka & Działaczka Społeczna 🩺',
        bio: 'Chrześcijanin poszukujący Bożej relacji opartej na zaufaniu, szacunku i miłości.',
        verse: '„Wszystko mogę w Tym, który mnie umacnia.” (Flp 4, 13)',
        church: 'Poznań',
        denom: 'Chrześcijanka',
        tags: ['Medycyna', 'Lekarka', 'Poznań', 'Służba', 'Dojrzałość'],
        avatar: 'avatar_magdalena.png',
        url: 'lumina.magdalena.html',
        type: 'user',
        badge: 'Społeczność LUMINA'
    },
    {
        id: 'noemi',
        slug: 'noemi',
        name: 'Noemi',
        handle: '@noemi',
        aliases: ['noemi', 'noemi wroclaw', 'biolog', 'psycholog'],
        age: null,
        city: 'Wrocław, Polska',
        status: 'Panna • Szuka relacji z wartościami',
        job: 'Biolog & Edukatorka Przyrodnicza 🌿',
        bio: 'Spokój, las i głębokie rozmowy o Bogu przy herbacie. Szukam bratniej duszy.',
        verse: '„Pan moim pasterzem, nie brak mi niczego.” (Ps 23, 1)',
        church: 'Wspólnota Uwielbienia Wrocław',
        denom: 'Rzymskokatolickie',
        tags: ['Góry', 'Psychologia', 'Muzyka Chwały', 'Herbata', 'Modlitwa', 'Wrocław'],
        avatar: 'avatar_noemi.jpg',
        url: 'lumina-profile.html?u=noemi',
        type: 'user',
        badge: 'Społeczność LUMINA'
    },
    {
        id: 'dawid',
        slug: 'dawid',
        name: 'Dawid',
        handle: '@dawid',
        aliases: ['dawid', 'dawid poznan', 'architekt'],
        age: 30,
        city: 'Poznań, Polska',
        status: 'Kawaler • Wierzący w działanie Ducha',
        job: 'Architekt Wnętrz & Muzyk Uwielbienia 🏛️',
        bio: 'Architekt z sercem do uwielbienia. Chcę budować relację opartą na zaufaniu i wierze.',
        verse: '„Szukajcie wpierw Królestwa Bożego.” (Mt 6, 33)',
        church: 'Kościół Poznań',
        denom: 'Chrześcijanin',
        tags: ['Architektura', 'Design', 'Muzyka', 'Worship', 'Poznań', 'Gitara'],
        avatar: 'avatar_dawid.jpg',
        url: 'lumina-profile.html?u=dawid',
        type: 'user',
        badge: 'Społeczność LUMINA'
    },
    {
        id: 'weronika',
        slug: 'weronika',
        name: 'Weronika',
        handle: '@weronika',
        aliases: ['weronika', 'weronika krakow', 'graficzka', 'artystka'],
        age: 25,
        city: 'Kraków, Polska',
        status: 'Panna • Pasjonatka sztuki i modlitwy',
        job: 'Graficzka & Projektantka UI 🎨',
        bio: 'Graficzka z pasją do piękna i muzyki. Szukam szczerej relacji opartej na wierze.',
        verse: '„Wszystko niech się dzieje w miłości.” (1 Kor 16, 14)',
        church: 'Kraków',
        denom: 'Chrześcijanka',
        tags: ['Fotografia', 'Design', 'Malarstwo', 'Kraków', 'Kawa', 'Sztuka'],
        avatar: 'avatar_widget_ania.jpg',
        url: 'lumina-profile.html?u=weronika',
        type: 'user',
        badge: 'Społeczność LUMINA'
    },
    {
        id: 'tomek',
        slug: 'tomek',
        name: 'Tomasz',
        handle: '@tomek',
        aliases: ['tomasz', 'tomek', 'tomasz gdansk', 'inzynier', 'gory', 'survival'],
        age: 31,
        city: 'Gdańsk, Polska',
        status: 'Kawaler • Miłośnik gór i ciszy',
        job: 'Inżynier Oprogramowania & Lider Męski 🌲',
        bio: 'Pasjonat leśnych wędrówek, natury i spokojnych rozmów o Bogu przy ognisku.',
        verse: '„Bądź mężny i mocny, nie lękaj się!” (Joz 1, 9)',
        church: 'Wspólnota Mężczyzn św. Józefa',
        denom: 'Chrześcijanin',
        tags: ['Survival', 'Leśnictwo', 'Gotowanie', 'Kajaki', 'Góry', 'Gdańsk'],
        avatar: 'avatar_widget_tomek.jpg',
        url: 'lumina-profile.html?u=tomek',
        type: 'user',
        badge: 'Społeczność LUMINA'
    },
    {
        id: 'anna',
        slug: 'anna',
        name: 'Anna',
        handle: '@anna',
        aliases: ['anna', 'ania', 'anna warszawa', 'pedagog', 'animatorka'],
        age: null,
        city: 'Warszawa, Polska',
        status: 'Panna • Liderka uwielbienia',
        job: 'Pedagog & Animatorka Chrześcijańska 📚',
        bio: 'Uwielbia podróże i sztukę, szuka kogoś do wspólnego odkrywania Bożego świata.',
        verse: '„Miłość cierpliwa jest, łaskawa jest...” (1 Kor 13, 4)',
        church: 'Wspólnota Emmanuel Warszawa',
        denom: 'Chrześcijanka',
        tags: ['Języki Obce', 'Podróże', 'Książki', 'Wolontariat', 'Warszawa'],
        avatar: 'avatar_widget_ania.jpg',
        url: 'lumina-profile.html?u=anna',
        type: 'user',
        badge: 'Społeczność LUMINA'
    },
    {
        id: 'piotr',
        slug: 'piotr',
        name: 'Piotr',
        handle: '@piotr',
        aliases: ['piotr', 'piotrek', 'piotr krakow', 'trener', 'misjonarz'],
        age: 31,
        city: 'Kraków, Polska',
        status: 'Kawaler • Wolontariusz misyjny',
        job: 'Trener Personalny & Misjonarz 🏔️',
        bio: 'Szuka spontanicznych przygód. Entuzjasta górskich wędrówek i wspólnoty wiary.',
        verse: '„W biegu nie ustawać.” (Hbr 12, 1)',
        church: 'Kraków Męska Grupa',
        denom: 'Chrześcijanin',
        tags: ['Sport', 'Góry', 'Misje', 'Kraków', 'Trening'],
        avatar: 'lumina_piotr2.jpg',
        url: 'lumina-profile.html?u=piotr',
        type: 'user',
        badge: 'Społeczność LUMINA'
    },
    {
        id: 'julia',
        slug: 'julia',
        name: 'Julia',
        handle: '@julia',
        aliases: ['julia', 'julka', 'julia gdansk', 'wokalistka', 'gospel'],
        age: 26,
        city: 'Gdańsk, Polska',
        status: 'Panna • Wokalistka gospel',
        job: 'Wokalistka & Nauczycielka Muzyki 🎶',
        bio: 'Marzycielka z pasją do muzyki. Szukam głębokich, szczerych relacji opartych na Chrystusie.',
        verse: '„Śpiewajcie Panu pieśń nową!” (Ps 96, 1)',
        church: 'Gdańsk Chór',
        denom: 'Chrześcijanka',
        tags: ['Wokal', 'Gospel', 'Muzyka', 'Pianino', 'Gdańsk'],
        avatar: 'lumina_julia2.jpg',
        url: 'lumina-profile.html?u=julia',
        type: 'user',
        badge: 'Społeczność LUMINA'
    },
    {
        id: 'studiodobregoslowa',
        slug: 'studiodobregoslowa',
        name: 'Studio Dobrego Słowa',
        handle: '@sds',
        aliases: ['studio dobrego slowa', 'studiods', 'studiods.pl', 'studiodees', 'apokalipsa live', 'herbaciarnia miedzy slowami', 'herbatka miedzy slowami', 'herbatka', 'herbaciarnia', 'pila', 'podcast'],
        city: 'Piła, Polska',
        job: 'Kanał YouTube @StudioDeeS • studiods.pl 🎙️',
        bio: 'Oficjalny profil Studia. Apokalipsa Live, podcasty, Słowo Boże i Herbaciarnia Między Słowami.',
        avatar: 'studiodobregoslowa_avatar.jpg',
        url: 'lumina.studiodobregoslowa.html',
        type: 'channel',
        badge: 'Kanał YouTube @StudioDeeS'
    },
    {
        id: 'osobowoscplus',
        slug: 'osobowoscplus',
        name: 'OSOBOWOŚĆ +',
        handle: '@osobowoscplus',
        aliases: ['osobowosc plus', 'osobowosc', 'psychologia', 'formacja', 'meskosc', 'dojrzalosc', 'relacje'],
        city: 'Christian Culture',
        job: 'Formacja Chrześcijańska & Psychologia 🧠',
        bio: 'Oficjalny kanał YouTube OSOBOWOŚĆ +. Rozwój dojrzałości, tożsamość w Bogu i mądre relacje.',
        avatar: 'logo_osobowosc_plus.jpg',
        url: 'lumina.osobowoscplus.html',
        type: 'channel',
        badge: 'Kanał YouTube CC'
    },
    {
        id: 'radiocc',
        slug: 'radiocc',
        name: 'Polskie Radio CC',
        handle: '@radiocc',
        aliases: ['radio', 'radio cc', 'polskie radio christian culture', 'radio uwielbienia', 'biblia spiewana', 'live 24/7'],
        city: 'Cała Polska',
        job: 'Radio Uwielbienia 24/7 📻',
        bio: 'Muzyka chwały, Biblia Śpiewana, audycje na żywo i codzienne rozważania przez całą dobę.',
        avatar: 'logo_radio_cc.jpg',
        url: 'lumina.radiocc.html',
        type: 'media',
        badge: 'Rozgłośnia 24/7'
    },
    {
        id: 'cctv',
        slug: 'cctv',
        name: 'Christian Culture TV',
        handle: '@cctv',
        aliases: ['cctv', 'cctv24', 'telewizja cc', 'telewizja chrzescijanska', 'wideo', 'transmisje live'],
        city: 'Warszawa, Polska',
        job: 'Telewizja CCTV24 📺',
        bio: 'Oficjalna telewizja chrześcijańska. Pasma wideo, debaty, świadectwa i transmisje ewangelizacyjne.',
        avatar: 'logo_cctv.png',
        url: 'lumina.cctv.html',
        type: 'channel',
        badge: 'Telewizja CC'
    },
    {
        id: 'ccmen',
        slug: 'ccmen',
        name: 'CC MEN',
        handle: '@ccmen',
        aliases: ['cc men', 'ccmen', 'mezczyzni', 'meska wspolnota', 'braterstwo', 'odpowiedzialnosc'],
        city: 'Polska',
        job: 'Męska Wspólnota Wiary 🛡️',
        bio: 'Mężczyźni w Chrystusie. Męstwo, odpowiedzialność za rodzinę, wierność i braterstwo.',
        avatar: 'logo_cc_men.jpg',
        url: 'lumina.ccmen.html',
        type: 'channel',
        badge: 'Wspólnota Męska'
    },
    {
        id: 'ccwomen',
        slug: 'ccwomen',
        name: 'CC Women',
        handle: '@ccwomen',
        aliases: ['cc women', 'ccwomen', 'kobiety', 'niewiasta dzielna', 'kobiety wiary'],
        city: 'Warszawa, Polska',
        job: 'Kobiety Wiary Christian Culture 🌸',
        bio: 'Oficjalny profil i kanał YouTube CC Women. Niewiastę dzielną któż znajdzie? Jej wartość przewyższa perły.',
        avatar: 'logo_cc_women.jpg',
        url: 'lumina.ccwomen.html',
        type: 'channel',
        badge: 'Kanał YouTube CC'
    },
    {
        id: 'u_robertukaszpio_5668',
        slug: 'u_robertukaszpio_5668',
        name: 'Robert Łukasz Pio',
        handle: '@robert',
        aliases: ['robert', 'bratrobert', 'robertlukaszpio', 'robert lukasz pio', 'u_robertukaszpio_5668'],
        age: 41,
        city: 'Polska',
        status: 'Panna/Kawaler',
        job: 'Członek Społeczności LUMINA ✨',
        bio: 'Szczęść Boże! Cieszę się, że mogę być częścią chrześcijańskiej społeczności LUMINA. Zapraszam do zapoznania się z moją twórczością i playlistą wideo.',
        verse: '„Kto nie miłuje, nie zna Boga, bo Bóg jest miłością.” (1 J 4, 8)',
        church: 'Wspólnota Chrześcijańska',
        denom: 'Rzymskokatolickie',
        tags: ['Modlitwa', 'Wierność', 'Wartości', 'Chrześcijaństwo', 'Muzyka Uwielbienia'],
        avatar: 'lumina_icon.jpg',
        url: 'lumina-profile.html?u=u_robertukaszpio_5668',
        type: 'user',
        badge: '✨ Społeczność'
    },
    {
        id: 'u_yciezywymbogiem_4231',
        slug: 'u_yciezywymbogiem_4231',
        name: 'Paweł Murawski',
        handle: '@pawel',
        aliases: ['pawel', 'pawelmurawski', 'paweł murawski', 'pawel murawski', 'u_yciezywymbogiem_4231', 'bozenowezycie'],
        age: 49,
        city: 'Żywiec, Polska',
        status: 'Kawaler',
        gender: 'mezczyzna',
        lookingFor: 'kobieta',
        job: 'Społeczność LUMINA ✨',
        bio: 'Szczęść Boże! Cieszę się, że dołączam do społeczności LUMINA. Szukam wartościowej relacji opartej na wierze, zaufaniu i wzajemnym szacunku w Chrystusie.',
        verse: '„Wszystko mogę w Tym, który mnie umacnia” (Flp 4, 13)',
        church: 'Nabożeństwa Sobotnie',
        denom: 'Protestanckie',
        worshipDay: 'Sobotnie nabożeństwo',
        tags: ['Modlitwa', 'Wierność', 'Wartości', 'Chrześcijaństwo', 'Żywiec', 'Nabożeństwa Sobotnie'],
        avatar: 'avatar_pawel_murawski.jpg',
        url: 'pawelmurawski',
        type: 'user',
        badge: '✨ Społeczność'
    },
    {
        id: 'marekjakubowski',
        slug: 'marekjakubowski',
        name: 'Marek Jakubowski',
        handle: '@marek',
        aliases: ['marek', 'jakubowski', 'marek jakubowski', 'marekjakubowski', 'marusjakubowski', 'autor rozwazan'],
        age: '',
        city: 'Polska',
        status: '',
        gender: 'mezczyzna',
        lookingFor: '',
        job: 'Autor Rozważań Biblijnych',
        role: 'Autor Rozważań & Społeczność LUMINA ✨',
        bio: 'Dzielę się tym, co Pan kładzie na moje serce — przez codzienne rozważania Słowa Bożego.',
        verse: '„Pan jest moją siłą i moją tarczą, w nim zaufało moje serce i otrzymałem pomoc.” (Psalm 28, 7 UBG)',
        church: 'Wspólnota Chrześcijańska',
        denom: 'Chrześcijanin',
        worshipDay: '',
        tags: ['Rozważania Biblijne', 'Słowo na Dziś', 'Wiara', 'Modlitwa', 'Społeczność LUMINA'],
        avatar: 'avatar_marek_jakubowski.jpg',
        url: 'lumina.marekjakubowski.html',
        type: 'user',
        badge: '✨ Społeczność'
    }
];

export function getAllSearchableProfiles() {
    const profileMap = new Map();

    // 1. Master Base Profiles
    OMNI_BASE_PROFILES.forEach(p => profileMap.set(p.slug || p.id, Object.assign({}, p)));

    // 2. Global registered base profiles from window
    if (typeof window !== 'undefined' && window.LUMINA_BASE_PROFILES) {
        Object.keys(window.LUMINA_BASE_PROFILES).forEach(slug => {
            const raw = window.LUMINA_BASE_PROFILES[slug];
            if (raw && raw.name) {
                const existing = profileMap.get(slug) || {};
                profileMap.set(slug, Object.assign({}, existing, raw));
            }
        });
    }

    // 3. LocalStorage Saved Profiles
    if (typeof localStorage !== 'undefined') {
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('lumina_profile_') || key === 'lumina_my_profile' || key === 'lumina_current_user_profile')) {
                    try {
                        const parsed = JSON.parse(localStorage.getItem(key) || '{}');
                        if (parsed && parsed.name) {
                            const slug = parsed.slug || parsed.uid || key.replace('lumina_profile_', '');
                            const existing = profileMap.get(slug) || {};
                            profileMap.set(slug, Object.assign({}, existing, parsed, {
                                url: parsed.profileUrl || existing.url || `lumina-profile.html?u=${encodeURIComponent(slug)}`
                            }));
                        }
                    } catch(e) {}
                }
            }
        } catch(e) {}
    }

    // 4. Cloud Firestore Profiles cache
    if (typeof window !== 'undefined' && window._cloudProfilesMap) {
        Object.keys(window._cloudProfilesMap).forEach(key => {
            const raw = window._cloudProfilesMap[key];
            if (raw && raw.name) {
                const slug = raw.slug || raw.uid || key;
                const existing = profileMap.get(slug) || {};
                profileMap.set(slug, Object.assign({}, existing, raw, {
                    url: raw.profileUrl || existing.url || `lumina-profile.html?u=${encodeURIComponent(slug)}`
                }));
            }
        });
    }

    return Array.from(profileMap.values());
}

/**
 * Handle real-time multi-field searching
 */
export function handleOmniSearchInput(val) {
    const dropdown = document.getElementById('omniDropdown');
    if (!dropdown) return;

    const queryRaw = (val || '').trim();
    if (!queryRaw) {
        dropdown.classList.remove('open');
        dropdown.innerHTML = '';
        return;
    }

    const normQuery = normalizeSearchString(queryRaw);
    const tokens = normQuery.split(/\s+/).filter(t => t.length > 0);
    const allProfiles = getAllSearchableProfiles();

    // Score and filter each profile
    const scoredMatches = [];

    allProfiles.forEach(item => {
        const normName = normalizeSearchString(item.name || '');
        const normHandle = normalizeSearchString(item.handle || '');
        const normCity = normalizeSearchString(item.city || '');
        const normJob = normalizeSearchString(item.job || '');
        const normBio = normalizeSearchString(item.bio || '');
        const normStatus = normalizeSearchString(item.status || '');
        const normChurch = normalizeSearchString(item.church || '');
        const normDenom = normalizeSearchString(item.denom || '');
        const normTags = (item.tags || []).map(t => normalizeSearchString(t)).join(' ');
        const normAliases = (item.aliases || []).map(a => normalizeSearchString(a)).join(' ');

        const combinedSearchText = `${normName} ${normHandle} ${normCity} ${normJob} ${normBio} ${normStatus} ${normChurch} ${normDenom} ${normTags} ${normAliases}`;

        // Check if all search tokens match somewhere in the profile text
        const matchesAllTokens = tokens.every(token => combinedSearchText.includes(token));

        if (matchesAllTokens) {
            let score = 0;
            // Higher priority if matches name directly
            if (normName.includes(normQuery)) score += 100;
            if (normName.startsWith(normQuery)) score += 50;
            if (normHandle.includes(normQuery)) score += 80;
            if (normCity.includes(normQuery)) score += 40;
            if (normJob.includes(normQuery)) score += 30;
            if (item.isFounder) score += 20;

            scoredMatches.push({ item, score });
        }
    });

    // Sort by relevance score descending
    scoredMatches.sort((a, b) => b.score - a.score);
    const matches = scoredMatches.map(m => m.item);

    dropdown.classList.add('open');

    if (matches.length === 0) {
        dropdown.innerHTML = `
            <div style="padding:14px 16px; font-size:0.86rem; color:#cbd5e1; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                <span>Brak profilu o frazie "<b>${escapeHtml(queryRaw)}</b>"</span>
                <a href="lumina-tablica.html?q=${encodeURIComponent(queryRaw)}" class="btn-omni-shortcut" style="text-decoration:none; color:#facc15; font-weight:700; background:rgba(250,204,21,0.15); border:1px solid rgba(250,204,21,0.35); padding:6px 14px; border-radius:20px; font-size:0.8rem; display:inline-flex; align-items:center; gap:6px;">
                    <i class="fa-solid fa-rectangle-list"></i> Szukaj wpisów na Tablicy ➔
                </a>
            </div>
        `;
    } else {
        const renderedItems = matches.slice(0, 8).map(item => {
            const rawAv = item.avatar || '';
            const isLetter = rawAv.includes('googleusercontent.com/a/');
            const avatar = (!rawAv || isLetter || rawAv === 'icon.png') ? 'lumina_icon.jpg' : rawAv;
            const name = item.name || 'Profil Społeczności';
            const isMission = item.isMissionAccount || item.badge === 'Media CC' || (item.slug && ['radiocc','cctv','ccmen','ccwomen','studiodobregoslowa','osobowoscplus','lumina','bibliaaudio','jolawojcik'].includes(item.slug.toLowerCase())) || (name && (name.toLowerCase().includes('christian culture') || name.toLowerCase().includes('portal lumina') || name.toLowerCase().includes('studio dobrego słowa') || name.toLowerCase().includes('osobowość +')));
            const hasValidAge = !isMission && item.age && Number(item.age) > 0 && item.profileCompleted !== false && !item.needsProfileCompletion && (item.hasRealPhoto !== false);
            const ageStr = hasValidAge ? `, ${item.age}` : '';
            const cityStr = item.city ? item.city.split(',')[0] : 'Polska';
            const jobOrBio = item.job || item.bio || item.status || 'Profil społeczności';
            const shortJob = jobOrBio.length > 70 ? jobOrBio.substring(0, 70) + '...' : jobOrBio;
            const badgeLabel = item.badge || (item.isFounder ? 'Założyciel' : (item.isMissionAccount ? 'Media CC' : 'Społeczność'));

            // Click destination: modal or direct page
            const targetUrl = item.url || (item.slug ? `lumina-profile.html?u=${encodeURIComponent(item.slug)}` : 'lumina.html');
            const isDirectPage = targetUrl.startsWith('lumina.') && targetUrl.endsWith('.html');

            let clickAction = '';
            if (isDirectPage) {
                clickAction = `window.location.href='${targetUrl}'`;
            } else if (typeof window.openCommunityProfile === 'function' && item.slug) {
                clickAction = `window.openCommunityProfile('${item.slug}')`;
            } else {
                clickAction = `window.location.href='${targetUrl}'`;
            }

            return `
                <div class="omni-item" onclick="${clickAction}" style="display:flex; align-items:center; gap:12px; padding:10px 14px; border-radius:14px; cursor:pointer; transition:all 0.2s cubic-bezier(0.16,1,0.3,1); background:rgba(255,255,255,0.04); margin-bottom:4px; border:1px solid rgba(255,255,255,0.06);">
                    <img src="${avatar}" alt="${escapeHtml(name)}" onerror="this.src='lumina_icon.jpg'" style="width:42px; height:42px; border-radius:50%; object-fit:cover; border:2px solid rgba(168,85,247,0.6); box-shadow:0 2px 10px rgba(0,0,0,0.3); flex-shrink:0;">
                    <div style="flex:1; min-width:0;">
                        <div style="font-weight:800; font-size:0.90rem; color:#fff; display:flex; align-items:center; gap:8px; flex-wrap:nowrap;">
                            <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(name)}${ageStr}</span>
                            <span style="font-size:0.70rem; color:#c084fc; background:rgba(168,85,247,0.18); border:1px solid rgba(168,85,247,0.35); padding:2px 7px; border-radius:10px; font-weight:700; white-space:nowrap;">${badgeLabel}</span>
                        </div>
                        <div style="font-size:0.77rem; color:#94a3b8; margin-top:2px; display:flex; align-items:center; gap:6px;">
                            <span>📍 ${escapeHtml(cityStr)}</span>
                            <span>•</span>
                            <span style="color:#cbd5e1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(shortJob)}</span>
                        </div>
                    </div>
                    <i class="fa-solid fa-chevron-right" style="color:#a855f7; font-size:0.85rem; margin-left:4px; opacity:0.8;"></i>
                </div>
            `;
        }).join('');

        const tablicaQuickLink = `
            <div style="padding:10px 14px; margin-top:4px; border-top:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center; font-size:0.80rem;">
                <span style="color:#94a3b8;">Szukasz wpisów lub świadectw?</span>
                <a href="lumina-tablica.html?q=${encodeURIComponent(queryRaw)}" style="color:#facc15; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:5px;">
                    <i class="fa-solid fa-magnifying-glass"></i> Otwórz Tablicę (${matches.length} trafień) ➔
                </a>
            </div>
        `;

        dropdown.innerHTML = renderedItems + tablicaQuickLink;
    }
}

export function executeOmniSearch() {
    const input = document.getElementById('omniSearchInput');
    const val = input ? input.value.trim() : '';
    if (!val) {
        if (typeof window.scrollToSection === 'function') {
            window.scrollToSection('odkrywaj');
        }
        return;
    }

    const norm = normalizeSearchString(val);
    const all = getAllSearchableProfiles();
    const exact = all.find(p => 
        normalizeSearchString(p.name) === norm ||
        normalizeSearchString(p.handle) === norm ||
        (p.aliases && p.aliases.some(a => normalizeSearchString(a) === norm))
    );

    if (exact) {
        const isDirectPage = exact.url && exact.url.startsWith('lumina.') && exact.url.endsWith('.html');
        if (isDirectPage) {
            window.location.href = exact.url;
        } else if (typeof window.openCommunityProfile === 'function' && exact.slug) {
            window.openCommunityProfile(exact.slug);
        } else {
            window.location.href = exact.url || `lumina-profile.html?u=${encodeURIComponent(exact.slug || exact.id)}`;
        }
    } else {
        window.location.href = 'lumina-tablica.html?q=' + encodeURIComponent(val);
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Expose globally
if (typeof window !== 'undefined') {
    window.handleOmniSearchInput = handleOmniSearchInput;
    window.executeOmniSearch = executeOmniSearch;
    window.getAllSearchableProfiles = getAllSearchableProfiles;
    window.normalizeSearchString = normalizeSearchString;
}
