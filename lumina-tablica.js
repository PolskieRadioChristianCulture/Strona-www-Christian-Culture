/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA TABLICA ENGINE (lumina-tablica.js)
 * Dynamiczna Synchronizacja Tablicy Społeczności LIVE + Reakcje Amen/Serce + Rotacja Misji CC
 * Ekosystem: Christian Culture | Standard: Premium
 * ══════════════════════════════════════════════════════════════════════════
 */

import * as LuminaDB from './lumina-db.js?v=20261013_notifsafe1';
import * as LuminaCore from './lumina-core.js?v=20261013_notifsafe1';

class LuminaTablicaEngine {
    constructor() {
        this.db = LuminaDB;
        this.core = LuminaCore.default || window.LuminaCore;
        this.feedContainer = null;
        this.currentPosts = [];
        this.isFirstLoad = true;
        this.attachedImageDataUrl = null;
    }

    init() {
        this.feedContainer = document.getElementById('communityFeed') || document.getElementById('feedStream') || document.querySelector('.feed-posts-stream');
        
        // 1. Wyświetlenie Skeleton UI Loader podczas ładowania
        this.renderSkeletonLoader();

        // 2. Podpięcie Real-time Feedu z Chmury Firestore
        this.subscribeToLiveFeed();

        // 3. Podpięcie formularza publikacji wpisów
        this.bindComposerEvents();
    }

    // ── 1. SKELETON LOADER UI ──
    renderSkeletonLoader() {
        if (!this.feedContainer || !this.isFirstLoad) return;
        
        const skeletonHtml = `
            <div class="skeleton-card" style="background:var(--navy-card, #112350); border:1px solid rgba(255,255,255,0.08); border-radius:20px; padding:22px; margin-bottom:20px; animation:pulseSkeleton 1.5s infinite ease-in-out;">
                <div style="display:flex; align-items:center; gap:14px; margin-bottom:16px;">
                    <div style="width:48px; height:48px; border-radius:50%; background:rgba(255,255,255,0.1);"></div>
                    <div style="flex:1;">
                        <div style="width:140px; height:14px; background:rgba(255,255,255,0.1); border-radius:6px; margin-bottom:8px;"></div>
                        <div style="width:90px; height:10px; background:rgba(255,255,255,0.06); border-radius:4px;"></div>
                    </div>
                </div>
                <div style="width:100%; height:12px; background:rgba(255,255,255,0.08); border-radius:4px; margin-bottom:8px;"></div>
                <div style="width:80%; height:12px; background:rgba(255,255,255,0.08); border-radius:4px; margin-bottom:18px;"></div>
                <div style="width:100%; height:200px; background:rgba(255,255,255,0.05); border-radius:12px;"></div>
            </div>
            <style>
                @keyframes pulseSkeleton {
                    0% { opacity: 0.6; }
                    50% { opacity: 0.9; }
                    100% { opacity: 0.6; }
                }
            </style>
        `;
        this.feedContainer.innerHTML = skeletonHtml + skeletonHtml;
    }

    // ── 2. REAL-TIME FEED LISTENER ──
    subscribeToLiveFeed() {
        if (this.db.subscribeToFeedPosts) {
            this.db.subscribeToFeedPosts((cloudPosts) => {
                this.isFirstLoad = false;
                this.currentPosts = cloudPosts || [];
                this.renderFeed(this.currentPosts);
            });
        }
    }

    // ── 3. RENDEROWANIE TABLICY Z ROTACJĄ MISYJNĄ ──
    renderFeed(posts) {
        if (!this.feedContainer) return;

        if (!posts || posts.length === 0) {
            this.feedContainer.innerHTML = `
                <div style="background:var(--navy-surface, #0b1838); border:1px dashed rgba(255,255,255,0.15); border-radius:20px; padding:32px; text-align:center; color:#94a3b8;">
                    <i class="fa-solid fa-seedling" style="font-size:2.5rem; color:#facc15; margin-bottom:12px;"></i>
                    <h3 style="color:#fff; font-size:1.2rem; margin-bottom:6px;">Bądź pierwszym, który podzieli się świadectwem!</h3>
                    <p style="font-size:0.9rem;">Napisz swój wpis powyżej i zbuduj naszą społeczność w Chrystusie. ✨🕊️</p>
                </div>
            `;
            return;
        }

        const missionBanners = [
            {
                type: 'mission_ambient_sleep',
                title: 'Ambient Sleep • Nowy Generator i Mikser Snów Christian Culture',
                tag: '🌙 NOWOŚĆ • AMBIENT SLEEP',
                desc: 'Odkryj autorski mikser do snu i relaksu: prawdziwy szum deszczu, kominek, fale mózgowe Delta/Theta i kojące tła dźwiękowe. Bez przerw i bez reklam Google.',
                image: 'ambient_hero.jpg',
                link: 'AmbientSleep'
            },
            {
                type: 'mission_vod',
                title: 'VOD Christian Culture • Film „JEZUS” (Ewangelia wg św. Łukasza)',
                tag: '🎬 KINO CHRZEŚCIJAŃSKIE VOD',
                desc: 'Obejrzyj za darmo najsłynniejszy film w historii kina chrześcijańskiego. Dobre Kino 24/7 i na życzenie.',
                image: 'https://i.ytimg.com/vi/GMdQIwKh22A/hqdefault.jpg',
                link: 'vod.html?film=film-jezus-ewangelia-lukasza'
            },
            {
                type: 'mission_robert',
                title: 'Robert Dla Jezusa • Świadectwa i Ewangelizacja',
                tag: '🔴 KANAŁ YOUTUBE',
                desc: 'Dołącz do społeczności kanału Robert Dla Jezusa. Świadectwa wiary, głoszenie Ewangelii i wspólna modlitwa.',
                image: 'robert_dla_jezusa_916.jpg',
                link: 'https://youtube.com/@robertlukaszpio?si=aHMr3p3vs8sXwrUT'
            },
            {
                type: 'mission_wikifaith',
                title: 'Encyklopedia Wiary & Telebiblia.pl',
                tag: '📖 SŁOWO BOŻE & ENCYKLOPEDIA',
                desc: 'Polska edycja Encyklopedii Wiary (wikifaith.org/pl), ilustrowane teksty biblijne na Instagramie i codzienne wersety na WhatsApp od Telebiblia.pl.',
                image: 'reklama_telebiblia_wikifaith_916.jpg',
                link: 'https://www.wikifaith.org/pl'
            },
            {
                type: 'mission_women',
                title: 'CC WOMEN (WOMEN TV) • Oficjalny Kanał YouTube',
                tag: '🌸 KANAŁ OFICJALNY CC & YOUTUBE',
                desc: 'Oficjalny kanał Wioletty Rogowskiej (@womentv24). Świadectwa przemiany życia, pieśni uwielbienia, modlitwa o relacje i uświęcenie w Chrystusie.',
                image: 'logo_cc_women.jpg',
                link: 'https://youtube.com/@womentv24?si=gtUZ764bTofGk3Py'
            },
            {
                type: 'mission_radio',
                title: 'Radio CC • Muzyka Uwielbienia & Pismo Święte 24/7',
                tag: '📻 TRANSMISJA NA ŻYWO',
                desc: 'Słuchaj Bożego Słowa, Biblii Śpiewanej i najpiękniejszych pieśni chwały bez reklam przez całą dobę.',
                image: 'tlo_dla_kanalu_Biblia_Spiewana.jpg',
                link: 'snadaniowa-live.html'
            }
        ];

        let html = '';

            // Pinned Founder Welcome Post for Soft Beta Launch
            const softLaunchWelcome = {
                id: 'post_founder_soft_launch',
                isPinned: true,
                author: 'Cezary Rogowski',
                authorSlug: 'cezaryrgowski',
                authorAvatar: 'avatar_cezary_official.jpg',
                authorRole: 'Założyciel Christian Culture 🕊️',
                time: 'Przypięty Komunikat • ✨ Oficjalny Start Soft Beta',
                text: 'Szczęść Boże wszystkim Użytkownikom i Testerom! 🕊️✨\n\nZ wielką wdzięcznością Bogu otwieramy etap Soft Launch chrześcijańskiego portalu LUMINA. Naszym celem jest łączenie ludzi o czystych sercach, poszukujących wartościowych, Bożych relacji i małżeństwa opartego na fundamencie Chrystusa.\n\nZachęcam do tworzenia autentycznych profili, zapraszania na Chrześcijańską Kawę ☕ oraz dzielenia się świadectwami na naszej Tablicy. Niech Pan obficie błogosławi ten czas i każdą nowo zawartą znajomość!',
                image: 'lumina_hero_clean.jpg',
                likes: 48,
                amen: 34
            };

            // Dzisiejsze Rozważanie: Cezary Rogowski (Cykl „Dobrze, że jesteś”)
            const todayDevotionPost = {
                id: 'post_devotion_day21_20260821',
                isDevotion: true,
                author: 'Cezary Rogowski',
                authorSlug: 'cezaryrgowski',
                authorAvatar: 'avatar_cezary_official.jpg',
                authorRole: 'Założyciel Christian Culture • Autor „Dobrze, że jesteś” 🕊️',
                time: 'Dzisiejsze Rozważanie • 21 sierpnia 2026 ✨',
                text: '☀️ Lato z Jezusem — Wielkie Pytania (Dzień 21)\n\n❓ 31 bardzo osobistych pytań Syna/Córki do Ojca: Dlaczego tak łatwo ulegam lękowi przed utratą moich wpływów i pozycji?\n\nW dwudziestym pierwszym dniu cyklu „Lato z Jezusem — Wielkie Pytania” rozbrajamy mechanizm terytorialnej zazdrości oraz lęk przed tym, że ktoś inny zdobędzie większe uznanie lub pozycję.\n\nW psychologii przywództwa zjawisko „syndromu strażnika bramy” (gatekeeper syndrome) opisuje lidera, który ze strachu przed utratą kontroli blokuje rozwój utalentowanych podwładnych. Wróg bezwzględnie żeruje na tym lęku, przekształcając nas w zaborczych rywali. Słowo Ewangelii uderza w ten egoizm poprzez postawę Jana Chrzciciela: „On musi rosnąć, ja zaś muszę maleć”. Chrześcijański lider najwyższej klasy nie boi się silnych ludzi wokół siebie — potrafi z nienaganną klasą i hojnością otwierać drzwi innym, wiedząc, że prawdziwa wielkość polega na służbie.\n\n📖 Jezus mówi dziś do Ciebie:\n„On musi rosnąć, ja zaś muszę maleć.” (Jana 3,30)\n\n🎯 Zadanie Taktyczne:\nZmiażdż dziś lęk przed konkurencją na swoim polu bitwy. Zidentyfikuj relację zawodową lub środowiskową, w której czułeś ukryty opór przed sukcesem innej osoby. Zmień nastawienie: zaoferuj jej wsparcie, pochwal jej osiągnięcie i ciesz się jej wzrostem. Wnieś do swojej firmy i domu standard wspaniałomyślności, bezpieczeństwa i dojrzałego autorytetu.\n\n🙏 Modlitwa Bojowa:\n„Ojcze, odrzucam kłamstwa nieprzyjaciela i zaborczą zazdrość o wpływy. Przepraszam, że lękałem się cudzego sukcesu. Dziękuję, że moje miejsce u Twojego boku jest niewzruszone. Daj mi odwagę, rygor i wyrazisty charakter, bym z nienaganną klasą hojnie wspierał wzrost innych, zdobywając ten świat dla Twojej chwały.”',
                image: 'avatar_cezary_official.jpg',
                likes: 54,
                amen: 42
            };

        // Render pinned founder post & today's devotion first
        posts = [softLaunchWelcome, todayDevotionPost, ...posts.filter(p => p.id !== 'post_founder_soft_launch' && p.id !== 'post_devotion_day21_20260821')];
        let bannerIdx = 0;

        posts.forEach((post, index) => {
            // Osadzenie widgetu Donorbox po 2 poście (po wpisie założyciela i pierwszym wpisie feedu)
            if (index === 2) {
                html += `                    <div class="mission-rotator-card" style="background:linear-gradient(135deg, rgba(17,35,80,0.9), rgba(11,24,56,0.95)); border:1.5px solid rgba(250,204,21,0.3); border-radius:20px; padding:20px; margin-bottom:24px; box-shadow:0 10px 30px rgba(0,0,0,0.4);">
                        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
                            <span style="font-size:0.75rem; font-weight:800; color:#facc15; letter-spacing:0.5px; background:rgba(250,204,21,0.15); padding:4px 10px; border-radius:20px; border:1px solid rgba(250,204,21,0.3);"><i class="fa-solid fa-users"></i> Darczyńcy LUMINA</span>
                            <span style="font-size:0.75rem; color:#94a3b8;"><i class="fa-solid fa-dove"></i> Podziękowanie</span>
                        </div>
                        <h4 style="color:#fff; font-size:1.1rem; font-weight:700; margin-bottom:6px;">Ściana Wdzięczności</h4>
                        <p style="color:#cbd5e1; font-size:0.88rem; margin-bottom:14px; line-height:1.5;">Każdy dar serca to realne wsparcie ewangelizacji w mediach. Dziękujemy Wam za wspólne budowanie tego Bożego dzieła! 🙏✨</p>
                        
                        <!-- Donorbox Wall Widget -->
                        <div style="width: 100%; border-radius:14px; overflow:hidden; background:transparent; display:flex; justify-content:center;">
                            <iframe height="93px" width="100%" src="https://donorbox.org/embed/christian-culture-radio?donor_wall_color=%23f59e0b&only_donor_wall=true" style="width: 100%; max-width:500px; min-width:310px; min-height: 345px; border-radius:10px;" seamless="seamless" name="donorbox" frameborder="0" scrolling="no"></iframe>
                        </div>
                    </div>
`;
            }
            if (index === 1) {
                html += `                    <div class="mission-rotator-card" style="background:linear-gradient(135deg, rgba(17,35,80,0.9), rgba(11,24,56,0.95)); border:1.5px solid rgba(250,204,21,0.3); border-radius:20px; padding:20px; margin-bottom:24px; box-shadow:0 10px 30px rgba(0,0,0,0.4);">
                        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
                            <span style="font-size:0.75rem; font-weight:800; color:#facc15; letter-spacing:0.5px; background:rgba(250,204,21,0.15); padding:4px 10px; border-radius:20px; border:1px solid rgba(250,204,21,0.3);"><i class="fa-solid fa-hand-holding-heart"></i> Wsparcie Dzieła</span>
                            <span style="font-size:0.75rem; color:#94a3b8;"><i class="fa-solid fa-dove"></i> Misja Christian Culture</span>
                        </div>
                        <h4 style="color:#fff; font-size:1.1rem; font-weight:700; margin-bottom:6px;">Zostań Współtwórcą Portalu LUMINA</h4>
                        <p style="color:#cbd5e1; font-size:0.88rem; margin-bottom:14px; line-height:1.5;">Twoje wsparcie pozwala nam rozwijać portal, radio oraz telewizję CCTV bez reklam i kompromisów. Każda donacja buduje to Boże dzieło.</p>
                        
                        <!-- Donorbox Widget -->
                        <div style="width: 100%; border-radius:14px; overflow:hidden; background:transparent;">
                            <script type="module" src="https://donorbox.org/widgets.js" async></script>
                            <dbox-widget campaign="christian-culture-radio" type="donation_form" interval="1 M" amount="50" enable-auto-scroll="true"></dbox-widget>
                        </div>
                    </div>
`;
            }

            // Wstrzyknięcie banera misyjnego co 3 wpisy
            if (index > 0 && index % 3 === 0 && bannerIdx < missionBanners.length) {
                const b = missionBanners[bannerIdx % missionBanners.length];
                bannerIdx++;
                html += `
                    <div class="mission-rotator-card" style="background:linear-gradient(135deg, rgba(17,35,80,0.9), rgba(11,24,56,0.95)); border:1.5px solid rgba(250,204,21,0.3); border-radius:20px; padding:20px; margin-bottom:24px; box-shadow:0 10px 30px rgba(0,0,0,0.4);">
                        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
                            <span style="font-size:0.75rem; font-weight:800; color:#facc15; letter-spacing:0.5px; background:rgba(250,204,21,0.15); padding:4px 10px; border-radius:20px; border:1px solid rgba(250,204,21,0.3);">${b.tag}</span>
                            <span style="font-size:0.75rem; color:#94a3b8;"><i class="fa-solid fa-dove"></i> Misja Christian Culture</span>
                        </div>
                        <h4 style="color:#fff; font-size:1.1rem; font-weight:700; margin-bottom:6px;">${b.title}</h4>
                        <p style="color:#cbd5e1; font-size:0.88rem; margin-bottom:14px; line-height:1.5;">${b.desc}</p>
                        <div style="width:100%; border-radius:14px; overflow:hidden; margin-bottom:14px; background:#070e24; display:flex; align-items:center; justify-content:center;">
                            <img src="${b.image}" alt="${b.title}" style="width:100%; max-height:280px; object-fit:contain !important;" loading="lazy">
                        </div>
                        <a href="${b.link}" class="btn-action-primary" style="display:inline-flex; align-items:center; gap:8px; text-decoration:none; padding:10px 18px; border-radius:14px; font-weight:700; font-size:0.88rem; background:linear-gradient(135deg,#f59e0b,#d97706); color:#fff;">
                            Otwórz Kanał <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                `;
            }

            // Renderowanie pojedynczego posta
            const rich = this.db.formatRichTextAndMedia ? this.db.formatRichTextAndMedia(post.text || '') : { html: post.text || '', embedHtml: '' };
            let postAvatar = post.authorAvatar;
            if (!postAvatar || postAvatar === 'avatar_new1.jpg' || postAvatar === 'null' || postAvatar === 'undefined') {
                const slug = (post.authorSlug || '').toLowerCase();
                if (slug.includes('cezary')) postAvatar = 'avatar_cezary_official.jpg';
                else if (slug.includes('wioletta')) postAvatar = 'avatar_wioletta_official.jpg';
                else if (slug.includes('hamera')) postAvatar = 'avatar_andrzej_hamera.jpg';
                else if (slug.includes('thiel') || (slug.includes('andrzej') && !slug.includes('hamera'))) postAvatar = 'avatar_andrzej_thiel.jpg';
                else if (slug.includes('ccwomen') || slug.includes('women')) postAvatar = 'logo_cc_women.jpg';
                else if (slug.includes('magdalena')) postAvatar = 'avatar_magdalena.png';
                else postAvatar = 'lumina_icon.jpg';
            }
            const likesCount = post.likes || 1;
            const amenCount = post.amen || 0;

            html += `
                <article class="post-card" id="${post.id}" style="background:var(--navy-card, #112350); border:1px solid rgba(255,255,255,0.08); border-radius:20px; padding:22px; margin-bottom:22px; box-shadow:0 8px 24px rgba(0,0,0,0.35);">
                    <div class="post-header" style="display:flex; align-items:center; gap:14px; margin-bottom:14px;">
                        <a href="lumina-profile.html?u=${post.authorSlug || 'user'}" style="text-decoration:none;">
                            <img src="${postAvatar}" alt="${post.author}" style="width:48px; height:48px; border-radius:50%; object-fit:cover; border:1.5px solid #facc15;" onerror="this.onerror=null; this.src='lumina_icon.jpg';">
                        </a>
                        <div style="flex:1;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <a href="lumina-profile.html?u=${post.authorSlug || 'user'}" style="color:#fff; font-weight:800; font-size:1rem; text-decoration:none;">${post.author}</a>
                                ${post.authorRole ? `<span style="font-size:0.72rem; color:#facc15; background:rgba(250,204,21,0.12); padding:2px 8px; border-radius:12px; border:1px solid rgba(250,204,21,0.25);">${post.authorRole}</span>` : ''}
                            </div>
                            <div style="font-size:0.78rem; color:#94a3b8;">${post.time || 'Przed chwilą'}</div>
                        </div>
                    </div>
                    <div class="post-content" style="color:#f8fafc; font-size:0.95rem; line-height:1.6; margin-bottom:14px; word-break:break-word;">
                        ${rich.html}
                    </div>
                    ${rich.embedHtml || ''}
                    ${post.image ? `
                        <div style="width:100%; border-radius:14px; overflow:hidden; margin-bottom:14px; background:#070e24; display:flex; align-items:center; justify-content:center;">
                            <img src="${post.image}" alt="Post Image" style="width:100%; height:auto; max-height:none; object-fit:contain !important;" loading="lazy">
                        </div>
                    ` : ''}
                    <div class="post-footer" style="display:flex; align-items:center; gap:10px; border-top:1px solid rgba(255,255,255,0.06); padding-top:12px;">
                        <button class="post-action-btn" onclick="window.LuminaTablica.toggleReaction('${post.id}', 'likes')" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:8px 14px; border-radius:20px; font-size:0.85rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px;">
                            <i class="fa-solid fa-heart" style="color:#ec4899;"></i> <span class="count">${likesCount}</span><span class="btn-text"> Polubień</span>
                        </button>
                        <button class="post-action-btn amen" onclick="window.LuminaTablica.toggleReaction('${post.id}', 'amen')" style="background:rgba(250,204,21,0.1); border:1px solid rgba(250,204,21,0.3); color:#facc15; padding:8px 14px; border-radius:20px; font-size:0.85rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px;">
                            <i class="fa-solid fa-hands-praying"></i> <span class="amen-count">${amenCount || ''}</span><span class="btn-text"> Amen!</span>
                        </button>
                        <button class="post-action-btn" onclick="window.openMessageModal?.('${post.author}', '${postAvatar}', '${post.authorSlug || 'user'}')" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#cbd5e1; padding:8px 14px; border-radius:20px; font-size:0.85rem; font-weight:600; cursor:pointer; margin-left:auto;">
                            <i class="fa-solid fa-comment-dots"></i><span class="btn-text"> Napisz</span>
                        </button>
                    </div>
                    ${window.buildPostShareDockHtml ? window.buildPostShareDockHtml(post) : ''}
                </article>
            `;
        });

        this.feedContainer.innerHTML = html;

        // ── POST-RENDER HOOK: re-apply Wspieraj Projekt buttons after every feed render ──
        // renderFeed() replaces entire innerHTML, destroying any previously placed support buttons.
        // We call decoratePosts() synchronously (after DOM write) and again with a short delay
        // to handle cards injected by lumina-tablica.html async (loadDailyReflection etc.)
        if (window.LuminaSupportProject?.decoratePosts) {
            window.LuminaSupportProject.decoratePosts(document);
            setTimeout(() => window.LuminaSupportProject?.decoratePosts?.(document), 600);
        }
    }

    // ── 4. PUBLIKACJA NOWYCH POSTÓW ──
    bindComposerEvents() {
        const composerForm = document.getElementById('feedComposerForm') || document.querySelector('.post-composer-form');
        const publishBtn = document.getElementById('btnPublishPost') || document.getElementById('btnSubmitFeedPost');
        
        if (publishBtn) {
            publishBtn.onclick = (e) => this.handlePublishPost(e);
        }
        if (composerForm) {
            composerForm.onsubmit = (e) => this.handlePublishPost(e);
        }
    }

    async handlePublishPost(e) {
        if (e && e.preventDefault) e.preventDefault();

        const textarea = document.getElementById('composerTextarea') || document.getElementById('composerInput') || document.getElementById('postContentInput');
        const rawText = textarea ? textarea.value.trim() : '';

        if (!rawText && !this.attachedImageDataUrl) {
            if (typeof window.showToast === 'function') {
                window.showToast('Napisz treść świadectwa lub dołącz grafikę przed publikacją!');
            }
            if (textarea) textarea.focus();
            return;
        }

        // Trust & Safety Moderacja
        const cleanText = this.core?.moderateText ? this.core.moderateText(rawText) : rawText;

        const curUser = this.db.getCurrentUser?.();
        const curProf = this.db.getCurrentProfile?.() || JSON.parse(localStorage.getItem('lumina_current_user_profile') || 'null');

        const authorName = curProf?.name || curUser?.displayName || 'Użytkownik LUMINA';
        const authorAvatar = curProf?.avatar || curUser?.photoURL || 'lumina_icon.jpg';
        const authorSlug = curProf?.slug || (curUser ? curUser.uid : 'user_' + Date.now());
        const authorRole = curProf?.job || curProf?.role || 'Społeczność LUMINA ✨';

        const postPayload = {
            id: 'post_' + Date.now(),
            author: authorName,
            authorSlug: authorSlug,
            authorAvatar: authorAvatar,
            authorRole: authorRole,
            authorUid: curUser?.uid || authorSlug,
            time: 'Przed chwilą • 🕊️ Świadectwo Wiary',
            text: cleanText,
            image: this.attachedImageDataUrl || null,
            likes: 0,
            amen: 0,
            timestamp: new Date()
        };

        const publishBtn = document.getElementById('btnPublishPost') || document.getElementById('btnSubmitFeedPost');
        if (publishBtn) {
            publishBtn.disabled = true;
            publishBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publikacja...';
        }

        // Zapis w chmurze
        if (this.db.createFeedPost) {
            await this.db.createFeedPost(postPayload);
        } else if (this.db.publishUniversalPost) {
            await this.db.publishUniversalPost(postPayload);
        }

        // Czyszczenie formularza
        if (textarea) textarea.value = '';
        this.attachedImageDataUrl = null;
        const preview = document.getElementById('composerImgPreviewBox');
        if (preview) preview.style.display = 'none';

        if (publishBtn) {
            publishBtn.disabled = false;
            publishBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Opublikuj Wpis';
        }

        if (typeof window.showToast === 'function') {
            window.showToast('Twój wpis został pomyślnie opublikowany na Tablicy Społeczności! ✨🕊️');
        }
    }

    // ── 5. ASYNCHRONICZNE REAKCJE (Amen, Polubienia) ──
    async toggleReaction(postId, reactionType) {
        if (!postId) return;
        const type = reactionType === 'amen' ? 'amen' : 'likes';
        const reactFn = this.db.toggleLuminaPostReaction || this.db.togglePostReactionInCloud;
        if (!reactFn) return;
        try {
            const res = await reactFn(postId, type);
            const post = this.currentPosts.find(p => p.id === postId);
            if (post && res && typeof res.delta === 'number') {
                post[type] = Math.max(0, (Number(post[type]) || 0) + res.delta);
                this.renderFeed(this.currentPosts);
            }
        } catch (err) {
            if (err && err.code === 'auth') {
                if (typeof window.showToast === 'function') {
                    window.showToast('Zaloguj się, aby reagować na wpisy na Tablicy. 🕊️');
                }
                if (typeof window.openAuthModal === 'function') {
                    window.openAuthModal('login');
                }
            } else {
                console.warn('Lumina Reaction Sync error:', err?.message || err);
            }
        }
    }
}

window.LuminaTablica = new LuminaTablicaEngine();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.LuminaTablica.init());
} else {
    window.LuminaTablica.init();
}

export default window.LuminaTablica;
