/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA MESSENGER POST COMPOSER ENGINE (EVERYWHERE POSTING)
 * Umożliwia pisanie i publikowanie postów na Tablicy i profilach
 * bezpośrednio z okna Centrum Rozmów LUMINA dla każdego zalogowanego użytkownika.
 * ══════════════════════════════════════════════════════════════════════════
 */

(function() {
    let msgAttachedImageDataUrl = null;
    let msgAttachedGdriveData = null;
    let msgAttachedYoutubeUrl = null;

    // Helper: get custom avatar from storage if exists
    function getCustomAvatar(slug) {
        try {
            return localStorage.getItem('lumina_custom_avatar_' + slug) || localStorage.getItem('lumina_avatar_' + slug);
        } catch(e) { return null; }
    }

    // Helper: Resolve active logged-in user across Lumina ecosystem
    window.getLuminaActiveUser = function() {
        const path = (window.location.pathname || '').toLowerCase();
        const isCezaryPage = path.includes('cezary') || typeof getCezaryAllPosts === 'function';
        const isWiolettaPage = path.includes('wioletta');

        // 1. Cezary Master / Owner Mode
        if (isCezaryPage && typeof isOwnerMode !== 'undefined' && isOwnerMode) {
            let avatar = getCustomAvatar('cezaryrgowski') || 'avatar_cezary_official.jpg';
            try {
                if (typeof getProfileData === 'function') {
                    const d = getProfileData();
                    if (d && d.avatar && !d.avatar.includes('lumina_icon.jpg')) avatar = d.avatar;
                }
            } catch(e){}
            return {
                name: 'Cezary Rogowski',
                slug: 'cezaryrgowski',
                avatar: avatar,
                role: 'Założyciel Christian Culture ✨'
            };
        }

        if (window.LuminaGuard && typeof window.LuminaGuard.isMasterAdmin === 'function' && window.LuminaGuard.isMasterAdmin()) {
            return {
                name: 'Cezary Rogowski',
                slug: 'cezaryrgowski',
                avatar: getCustomAvatar('cezaryrgowski') || 'avatar_cezary_official.jpg',
                role: 'Założyciel Christian Culture ✨'
            };
        }

        // 2. Wioletta Owner Mode
        if (isWiolettaPage && typeof isOwnerMode !== 'undefined' && isOwnerMode) {
            let avatar = getCustomAvatar('wiolettarogowska') || 'avatar_wioletta_official.jpg';
            try {
                if (typeof getProfileData === 'function') {
                    const d = getProfileData();
                    if (d && d.avatar && !d.avatar.includes('lumina_icon.jpg')) avatar = d.avatar;
                }
            } catch(e){}
            return {
                name: 'Wioletta Rogowska',
                slug: 'wiolettarogowska',
                avatar: avatar,
                role: 'Współzałożycielka Christian Culture ✨'
            };
        }

        if (localStorage.getItem('lumina_auth_owner_wiolettarogowska') === 'true' ||
            sessionStorage.getItem('lumina_auth_owner_wiolettarogowska') === 'true') {
            return {
                name: 'Wioletta Rogowska',
                slug: 'wiolettarogowska',
                avatar: getCustomAvatar('wiolettarogowska') || 'avatar_wioletta_official.jpg',
                role: 'Współzałożycielka Christian Culture ✨'
            };
        }

        // 3. LuminaDB Profile & Current User
        if (window.LuminaDB?.getCurrentProfile) {
            const p = window.LuminaDB.getCurrentProfile();
            if (p && p.name) {
                if (!p.slug) p.slug = p.name.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                const isCez = p.slug === 'cezaryrgowski';
                const isWio = p.slug === 'wiolettarogowska';
                if (isCez && (!p.avatar || p.avatar.includes('lumina_icon.jpg') || p.avatar.includes('googleusercontent.com/a/'))) {
                    p.avatar = getCustomAvatar('cezaryrgowski') || 'avatar_cezary_official.jpg';
                } else if (isWio && (!p.avatar || p.avatar.includes('lumina_icon.jpg') || p.avatar.includes('googleusercontent.com/a/'))) {
                    p.avatar = getCustomAvatar('wiolettarogowska') || 'avatar_wioletta_official.jpg';
                }
                return p;
            }
        }
        if (window.LuminaDB?.getCurrentUser) {
            const u = window.LuminaDB.getCurrentUser();
            if (u && (u.displayName || u.email || u.name)) {
                const name = u.displayName || u.name || (u.email ? u.email.split('@')[0] : 'Użytkownik LUMINA');
                const slug = u.slug || (u.email ? u.email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '') : name.toLowerCase().replace(/[^a-z0-9_-]/g, ''));
                const isCez = slug === 'cezaryrgowski' || (u.email && ['nazirczarkes@gmail.com','studiodees7@gmail.com','czarekrogowski3@gmail.com','osobowoscplus@gmail.com','yourimaginationstudio@gmail.com'].includes(String(u.email).toLowerCase()));
                const isWio = slug === 'wiolettarogowska' || (u.email && String(u.email).toLowerCase().split('@')[0] === 'wioletta1240');
                let avatar = u.photoURL || u.avatar || 'lumina_icon.jpg';
                if (isCez && (!avatar || avatar.includes('lumina_icon.jpg') || avatar.includes('googleusercontent.com/a/'))) {
                    avatar = getCustomAvatar('cezaryrgowski') || 'avatar_cezary_official.jpg';
                } else if (isWio && (!avatar || avatar.includes('lumina_icon.jpg') || avatar.includes('googleusercontent.com/a/'))) {
                    avatar = getCustomAvatar('wiolettarogowska') || 'avatar_wioletta_official.jpg';
                }
                return {
                    name: isCez ? 'Cezary Rogowski' : (isWio ? 'Wioletta Rogowska' : name),
                    slug: isCez ? 'cezaryrgowski' : (isWio ? 'wiolettarogowska' : slug),
                    avatar: avatar,
                    email: u.email || '',
                    role: isCez ? 'Założyciel Christian Culture ✨' : (isWio ? 'Współzałożycielka Christian Culture ✨' : 'Społeczność LUMINA ✨')
                };
            }
        }

        // 4. Local Storage Profile
        try {
            const myProf = localStorage.getItem('lumina_current_user_profile') || localStorage.getItem('lumina_my_profile');
            if (myProf) {
                const parsed = JSON.parse(myProf);
                if (parsed && parsed.name) {
                    if (!parsed.slug) parsed.slug = parsed.name.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                    const isCez = parsed.slug === 'cezaryrgowski';
                    const isWio = parsed.slug === 'wiolettarogowska';
                    if (isCez && (!parsed.avatar || parsed.avatar.includes('lumina_icon.jpg') || parsed.avatar.includes('googleusercontent.com/a/'))) {
                        parsed.avatar = getCustomAvatar('cezaryrgowski') || 'avatar_cezary_official.jpg';
                    } else if (isWio && (!parsed.avatar || parsed.avatar.includes('lumina_icon.jpg') || parsed.avatar.includes('googleusercontent.com/a/'))) {
                        parsed.avatar = getCustomAvatar('wiolettarogowska') || 'avatar_wioletta_official.jpg';
                    }
                    return parsed;
                }
            }
        } catch(e) {}

        // 5. Universal Profile Owner Mode
        if (typeof isOwnerMode !== 'undefined' && isOwnerMode && typeof getProfileData === 'function') {
            const d = getProfileData();
            if (d && d.name) {
                if (!d.slug) {
                    const params = new URLSearchParams(window.location.search);
                    d.slug = params.get('u') || d.name.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                }
                const isCez = d.slug === 'cezaryrgowski';
                const isWio = d.slug === 'wiolettarogowska';
                if (isCez && (!d.avatar || d.avatar.includes('lumina_icon.jpg') || d.avatar.includes('googleusercontent.com/a/'))) {
                    d.avatar = getCustomAvatar('cezaryrgowski') || 'avatar_cezary_official.jpg';
                } else if (isWio && (!d.avatar || d.avatar.includes('lumina_icon.jpg') || d.avatar.includes('googleusercontent.com/a/'))) {
                    d.avatar = getCustomAvatar('wiolettarogowska') || 'avatar_wioletta_official.jpg';
                }
                return d;
            }
        }

        // 6. Saved slug/name in localStorage
        const savedSlug = localStorage.getItem('lumina_current_user_slug');
        const savedName = localStorage.getItem('lumina_current_user_name');
        if (savedSlug && savedName) {
            const isCez = savedSlug === 'cezaryrgowski';
            const isWio = savedSlug === 'wiolettarogowska';
            let avatar = localStorage.getItem('lumina_current_user_avatar') || 'lumina_icon.jpg';
            if (isCez && (!avatar || avatar.includes('lumina_icon.jpg') || avatar.includes('googleusercontent.com/a/'))) {
                avatar = getCustomAvatar('cezaryrgowski') || 'avatar_cezary_official.jpg';
            } else if (isWio && (!avatar || avatar.includes('lumina_icon.jpg') || avatar.includes('googleusercontent.com/a/'))) {
                avatar = getCustomAvatar('wiolettarogowska') || 'avatar_wioletta_official.jpg';
            }
            return {
                name: savedName,
                slug: savedSlug,
                avatar: avatar
            };
        }

        return null;
    };

    // Inject tab button and view into directMessagesModal if missing
    function initMessengerComposerUI() {
        const modal = document.getElementById('directMessagesModal');
        if (!modal) return;

        // 1. Locate tabs bar
        const tabsBar = modal.querySelector('.chat-header-bar > div:last-child') || modal.querySelector('[style*="rgba(255,255,255,0.05)"]');
        if (tabsBar && !document.getElementById('tabBtnCreatePost')) {
            const postBtn = document.createElement('button');
            postBtn.type = 'button';
            postBtn.id = 'tabBtnCreatePost';
            postBtn.onclick = () => window.switchMessengerMainTab('post');
            postBtn.style.cssText = 'flex:1; min-height:44px; min-width:44px; padding:0; border-radius:10px; border:none; background:transparent; color:#94a3b8; font-weight:700; font-family:inherit; font-size:0.8rem; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:6px; transition:all 0.2s; touch-action:manipulation;';
            postBtn.title = 'Napisz nowy post na Tablicy';
            postBtn.innerHTML = '<i class="fa-solid fa-pen-to-square" style="color:#38bdf8;"></i><span class="tab-label"> Napisz Post</span>';
            tabsBar.appendChild(postBtn);
        }

        // 2. Inject Post View if missing
        if (!document.getElementById('messengerPostView')) {
            const postView = document.createElement('div');
            postView.id = 'messengerPostView';
            postView.style.cssText = 'display:none; flex-direction:column; flex:1; min-height:0; overflow-y:auto; padding:16px; background:rgba(11,19,41,0.95);';
            postView.innerHTML = `
                <!-- State A: User is logged in -->
                <div id="messengerPostLoggedInContent" style="display:flex; flex-direction:column; gap:12px;">
                    
                    <!-- Author Info Bar -->
                    <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:rgba(255,255,255,0.04); border-radius:14px; border:1px solid rgba(255,255,255,0.08);">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <img id="msgComposerAuthorAvatar" src="lumina_icon.jpg" alt="Awatara" style="width:38px; height:38px; border-radius:50%; object-fit:cover; border:1.5px solid #38bdf8;">
                            <div>
                                <div id="msgComposerAuthorName" style="font-size:0.88rem; font-weight:800; color:#fff;">Użytkownik LUMINA</div>
                                <div style="font-size:0.72rem; color:#38bdf8; font-weight:700;">Publikujesz na Tablicy Społeczności i Profilu ✨</div>
                            </div>
                        </div>
                        <span style="font-size:0.7rem; background:rgba(56,189,248,0.15); border:1px solid rgba(56,189,248,0.35); color:#7dd3fc; padding:3px 8px; border-radius:10px; font-weight:700;">Publiczny</span>
                    </div>

                    <!-- Post Content Textarea -->
                    <div style="position:relative;">
                        <textarea id="msgComposerInput" rows="4" placeholder="Podziel się słowem, wersetem, intencją modlitewną lub świadectwem..." style="width:100%; box-sizing:border-box; background:rgba(15,23,42,0.9); border:1.5px solid rgba(255,255,255,0.15); border-radius:14px; padding:12px 14px; font-size:0.9rem; color:#fff; font-family:inherit; resize:vertical; min-height:90px; outline:none; transition:border-color 0.2s;" onfocus="this.style.borderColor='#38bdf8'" onblur="this.style.borderColor='rgba(255,255,255,0.15)'"></textarea>
                    </div>

                    <!-- Quick Inspiration Bar (Verses & Themes) -->
                    <div style="display:flex; gap:6px; overflow-x:auto; padding-bottom:4px;">
                        <button type="button" onclick="window.insertMsgComposerVerse('„Pan jest moim pasterzem, nie brak mi niczego.” (Ps 23, 1)')" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#cbd5e1; font-size:0.72rem; font-weight:700; padding:4px 10px; border-radius:12px; cursor:pointer; white-space:nowrap;"><i class="fa-solid fa-quote-left" style="color:#facc15;"></i> Ps 23, 1</button>
                        <button type="button" onclick="window.insertMsgComposerVerse('„Wszystko mogę w Tym, który mnie umacnia.” (Flp 4, 13)')" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#cbd5e1; font-size:0.72rem; font-weight:700; padding:4px 10px; border-radius:12px; cursor:pointer; white-space:nowrap;"><i class="fa-solid fa-quote-left" style="color:#facc15;"></i> Flp 4, 13</button>
                        <button type="button" onclick="window.insertMsgComposerVerse('„Bóg jest miłością: kto trwa w miłości, trwa w Bogu, a Bóg trwa w nim.” (1 J 4, 16)')" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#cbd5e1; font-size:0.72rem; font-weight:700; padding:4px 10px; border-radius:12px; cursor:pointer; white-space:nowrap;"><i class="fa-solid fa-quote-left" style="color:#facc15;"></i> 1 J 4, 16</button>
                    </div>

                    <!-- Attached Image Preview Box -->
                    <div id="msgComposerImgPreviewBox" style="display:none; position:relative; border-radius:14px; overflow:hidden; background:#000; border:1px solid rgba(255,255,255,0.15); max-height:200px;">
                        <img id="msgComposerAttachedImg" src="" alt="Załączona grafika" style="width:100%; height:180px; object-fit:cover; display:block;">
                        <button type="button" onclick="window.removeMsgComposerImage()" style="position:absolute; top:8px; right:8px; width:30px; height:30px; border-radius:50%; background:rgba(225,29,72,0.9); color:#fff; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center;" title="Usuń grafikę"><i class="fa-solid fa-xmark"></i></button>
                    </div>

                    <!-- Attached Google Drive Preview Box -->
                    <div id="msgComposerGdriveAttachment" style="display:none; padding:10px 14px; background:rgba(52,168,83,0.12); border:1.5px solid rgba(52,168,83,0.4); border-radius:14px; align-items:center; justify-content:space-between; gap:10px;">
                        <div style="display:flex; align-items:center; gap:10px; min-width:0; overflow:hidden;">
                            <div style="width:36px; height:36px; border-radius:10px; background:rgba(52,168,83,0.25); display:flex; align-items:center; justify-content:center; color:#34a853; font-size:1.2rem; flex-shrink:0;">
                                <i id="msgComposerGdriveIcon" class="fa-brands fa-google-drive"></i>
                            </div>
                            <div style="min-width:0; overflow:hidden;">
                                <div id="msgComposerGdriveTitle" style="font-size:0.86rem; font-weight:800; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Plik z Dysku Google</div>
                                <div id="msgComposerGdriveSubtitle" style="font-size:0.72rem; color:#86efac; font-weight:600;">Dołączono do wpisu</div>
                            </div>
                        </div>
                        <button type="button" onclick="window.removeMsgComposerGdrive()" style="background:rgba(225,29,72,0.2); border:1px solid rgba(225,29,72,0.5); color:#f43f5e; font-size:0.75rem; width:28px; height:28px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center;" title="Usuń plik z Dysku"><i class="fa-solid fa-xmark"></i></button>
                    </div>

                    <!-- Attached YouTube Preview Box -->
                    <div id="msgComposerYtPreviewBox" style="display:none; padding:10px 14px; background:rgba(239,68,68,0.12); border:1.5px solid rgba(239,68,68,0.4); border-radius:14px; align-items:center; justify-content:space-between; gap:10px;">
                        <div style="display:flex; align-items:center; gap:10px; min-width:0; overflow:hidden;">
                            <i class="fa-brands fa-youtube" style="color:#ef4444; font-size:1.4rem; flex-shrink:0;"></i>
                            <div style="min-width:0; overflow:hidden;">
                                <div id="msgComposerYtTitle" style="font-size:0.86rem; font-weight:800; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Wideo / Playlista YouTube</div>
                                <div id="msgComposerYtUrl" style="font-size:0.72rem; color:#fca5a5; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"></div>
                            </div>
                        </div>
                        <button type="button" onclick="window.removeMsgComposerYt()" style="background:rgba(225,29,72,0.2); border:1px solid rgba(225,29,72,0.5); color:#f43f5e; font-size:0.75rem; width:28px; height:28px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center;" title="Usuń wideo"><i class="fa-solid fa-xmark"></i></button>
                    </div>

                    <!-- Composer Action Toolbar -->
                    <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:space-between; margin-top:4px;">
                        <div style="display:flex; flex-wrap:wrap; gap:6px;">
                            <input type="file" id="msgComposerFileInput" accept="image/*" style="display:none;" onchange="window.handleMsgComposerImageSelect(event)">
                            <button type="button" onclick="document.getElementById('msgComposerFileInput').click()" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); color:#e2e8f0; font-size:0.78rem; font-weight:700; padding:8px 12px; border-radius:10px; cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
                                <i class="fa-solid fa-image" style="color:#22c55e;"></i> <span>Grafika</span>
                            </button>
                            <button type="button" onclick="window.promptMsgComposerYoutube()" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); color:#e2e8f0; font-size:0.78rem; font-weight:700; padding:8px 12px; border-radius:10px; cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
                                <i class="fa-brands fa-youtube" style="color:#ef4444;"></i> <span>YouTube</span>
                            </button>
                            <button type="button" onclick="window.openGoogleDriveModalForMessenger()" style="background:rgba(52,168,83,0.15); border:1px solid rgba(52,168,83,0.35); color:#86efac; font-size:0.78rem; font-weight:700; padding:8px 12px; border-radius:10px; cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
                                <i class="fa-brands fa-google-drive" style="color:#34a853;"></i> <span>Dysk Google</span>
                            </button>
                        </div>
                        <button type="button" onclick="window.publishMsgComposerPost()" style="background:linear-gradient(135deg, #10b981, #059669); border:none; color:#fff; font-size:0.86rem; font-weight:800; padding:10px 20px; border-radius:12px; cursor:pointer; display:inline-flex; align-items:center; gap:8px; box-shadow:0 4px 14px rgba(16,185,129,0.35);">
                            <span>Opublikuj Wpis</span> <i class="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>

                </div>

                <!-- State B: User is NOT logged in -->
                <div id="messengerPostGuestPrompt" style="display:none; flex-direction:column; align-items:center; justify-content:center; padding:36px 20px; text-align:center; background:rgba(255,255,255,0.03); border:1px dashed rgba(255,255,255,0.15); border-radius:20px; margin:auto 0;">
                    <div style="width:64px; height:64px; border-radius:20px; background:linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.2)); border:1.5px solid rgba(245,158,11,0.4); display:flex; align-items:center; justify-content:center; color:#facc15; font-size:1.8rem; margin-bottom:14px;">
                        <i class="fa-solid fa-lock"></i>
                    </div>
                    <h4 style="font-size:1.15rem; font-weight:800; color:#fff; margin:0 0 8px;">Funkcja Dostępna po Zalogowaniu</h4>
                    <p style="font-size:0.85rem; color:#94a3b8; max-width:380px; line-height:1.6; margin:0 0 20px;">
                        Publikowanie postów na Tablicy Społeczności LUMINA oraz w profilach jest dostępne dla wszystkich zarejestrowanych członków i właścicieli profili.
                    </p>
                    <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center;">
                        <button type="button" onclick="window.triggerLuminaLoginModal()" style="background:linear-gradient(135deg, #0284c7, #0369a1); border:none; color:#fff; font-size:0.86rem; font-weight:800; padding:11px 22px; border-radius:12px; cursor:pointer; display:inline-flex; align-items:center; gap:8px; box-shadow:0 4px 14px rgba(2,132,199,0.35);">
                            <i class="fa-solid fa-right-to-bracket"></i> <span>Zaloguj się do LUMINA</span>
                        </button>
                    </div>
                </div>
            `;
            const mBody = modal.querySelector('.modal-card') || modal;
            mBody.appendChild(postView);
        }
    }

    // Update Author Bar UI (Avatar & Name)
    window.updateMsgComposerAuthorUI = function() {
        const user = window.getLuminaActiveUser();
        const av = document.getElementById('msgComposerAuthorAvatar');
        const nm = document.getElementById('msgComposerAuthorName');
        if (user) {
            if (nm) nm.textContent = user.name || 'Użytkownik LUMINA';
            if (av) {
                const isCez = user.slug === 'cezaryrgowski';
                const isWio = user.slug === 'wiolettarogowska';
                let targetAv = user.avatar;
                if (isCez && (!targetAv || targetAv.includes('lumina_icon.jpg') || targetAv.includes('googleusercontent.com/a/'))) {
                    targetAv = getCustomAvatar('cezaryrgowski') || 'avatar_cezary_official.jpg';
                } else if (isWio && (!targetAv || targetAv.includes('lumina_icon.jpg') || targetAv.includes('googleusercontent.com/a/'))) {
                    targetAv = getCustomAvatar('wiolettarogowska') || 'avatar_wioletta_official.jpg';
                }
                if (!targetAv) targetAv = 'lumina_icon.jpg';
                av.src = targetAv;
                av.onerror = function() {
                    if (isCez) this.src = 'avatar_cezary_official.jpg';
                    else if (isWio) this.src = 'avatar_wioletta_official.jpg';
                    else this.src = 'lumina_icon.jpg';
                };
            }
        }
    };

    // Enhance switchMessengerMainTab
    function patchSwitchMessengerTab() {
        const originalSwitch = window.switchMessengerMainTab;

        window.switchMessengerMainTab = function(tab) {
            const btnPublic = document.getElementById('tabBtnPublicChat');
            const btnPrivate = document.getElementById('tabBtnPrivateChat');
            const btnCommander = document.getElementById('tabBtnCommanderChat');
            const btnGroups = document.getElementById('tabBtnGroupsChat');
            const btnPost = document.getElementById('tabBtnCreatePost');

            const viewPublic = document.getElementById('messengerPublicView');
            const viewPrivate = document.getElementById('messengerPrivateView');
            const viewCommander = document.getElementById('messengerCommanderView');
            const viewGroups = document.getElementById('messengerGroupsView');
            const viewPost = document.getElementById('messengerPostView');

            if (tab === 'post') {
                // Inactivate others
                [btnPublic, btnPrivate, btnCommander, btnGroups].forEach(btn => {
                    if (btn) { btn.style.background = 'transparent'; btn.style.color = '#94a3b8'; btn.style.boxShadow = 'none'; }
                });
                if (btnPost) {
                    btnPost.style.background = 'linear-gradient(135deg, #0284c7, #2563eb)';
                    btnPost.style.color = '#fff';
                    btnPost.style.boxShadow = '0 2px 10px rgba(2,132,199,0.35)';
                }

                [viewPublic, viewPrivate, viewCommander, viewGroups].forEach(v => {
                    if (v) {
                        v.style.setProperty('display', 'none', 'important');
                        if (v.id === 'messengerPrivateView') v.classList.add('is-hidden');
                    }
                });

                if (viewPost) viewPost.style.setProperty('display', 'flex', 'important');

                // Check logged in state
                const user = window.getLuminaActiveUser();
                const loggedInBox = document.getElementById('messengerPostLoggedInContent');
                const guestBox = document.getElementById('messengerPostGuestPrompt');

                if (user) {
                    if (loggedInBox) loggedInBox.style.display = 'flex';
                    if (guestBox) guestBox.style.display = 'none';

                    window.updateMsgComposerAuthorUI();

                    const inp = document.getElementById('msgComposerInput');
                    if (inp) setTimeout(() => inp.focus(), 150);
                } else {
                    if (loggedInBox) loggedInBox.style.display = 'none';
                    if (guestBox) guestBox.style.display = 'flex';
                }
                return;
            }

            // If switching to another tab, deactivate post button and hide viewPost
            if (btnPost) {
                btnPost.style.background = 'transparent';
                btnPost.style.color = '#94a3b8';
                btnPost.style.boxShadow = 'none';
            }
            if (viewPost) viewPost.style.display = 'none';

            if (typeof originalSwitch === 'function') {
                originalSwitch.apply(this, arguments);
            }
        };
    }

    // Composer Actions
    window.insertMsgComposerVerse = function(quote) {
        const inp = document.getElementById('msgComposerInput');
        if (!inp) return;
        const current = inp.value.trim();
        inp.value = current ? current + '\n\n' + quote : quote;
        inp.focus();
    };

    window.handleMsgComposerImageSelect = function(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(evt) {
            msgAttachedImageDataUrl = evt.target.result;
            const previewBox = document.getElementById('msgComposerImgPreviewBox');
            const previewImg = document.getElementById('msgComposerAttachedImg');
            if (previewImg) previewImg.src = msgAttachedImageDataUrl;
            if (previewBox) previewBox.style.display = 'block';
            if (window.showToast) window.showToast('Dołączono grafikę do wpisu! 🖼️✨');
        };
        reader.readAsDataURL(file);
    };

    window.removeMsgComposerImage = function() {
        msgAttachedImageDataUrl = null;
        const previewBox = document.getElementById('msgComposerImgPreviewBox');
        if (previewBox) previewBox.style.display = 'none';
        const inp = document.getElementById('msgComposerFileInput');
        if (inp) inp.value = '';
    };

    window.promptMsgComposerYoutube = function() {
        const url = prompt('Wklej link do wideo lub playlisty YouTube (np. https://youtu.be/...):');
        if (!url || !url.trim()) return;
        const clean = url.trim();
        msgAttachedYoutubeUrl = clean;
        const box = document.getElementById('msgComposerYtPreviewBox');
        const urlEl = document.getElementById('msgComposerYtUrl');
        if (urlEl) urlEl.textContent = clean;
        if (box) box.style.display = 'flex';
        if (window.showToast) window.showToast('Dołączono materiał YouTube! 🎬');
    };

    window.removeMsgComposerYt = function() {
        msgAttachedYoutubeUrl = null;
        const box = document.getElementById('msgComposerYtPreviewBox');
        if (box) box.style.display = 'none';
    };

    window.openGoogleDriveModalForMessenger = function() {
        window._gdriveTarget = 'messenger';
        if (typeof window.openGoogleDriveModal === 'function') {
            window.openGoogleDriveModal();
        } else {
            const url = prompt('Wklej link do pliku z Dysku Google:');
            if (!url) return;
            const parsed = window.LuminaDB?.parseGoogleDriveUrl ? window.LuminaDB.parseGoogleDriveUrl(url) : null;
            if (parsed) {
                window.attachGdriveToMessenger(parsed);
            }
        }
    };

    window.attachGdriveToMessenger = function(gdriveData) {
        msgAttachedGdriveData = Object.assign({}, gdriveData);
        const box = document.getElementById('msgComposerGdriveAttachment');
        const icon = document.getElementById('msgComposerGdriveIcon');
        const title = document.getElementById('msgComposerGdriveTitle');
        const sub = document.getElementById('msgComposerGdriveSubtitle');

        if (box) box.style.display = 'flex';
        if (icon) icon.className = msgAttachedGdriveData.icon || 'fa-brands fa-google-drive';
        if (title) title.innerText = (msgAttachedGdriveData.typeLabel || 'Plik') + ' (Dysk Google)';
        if (sub) sub.innerText = msgAttachedGdriveData.mode === 'image' ? 'Tryb: Grafika w poście' : 'Tryb: Interaktywny odtwarzacz / podgląd';
        if (window.showToast) window.showToast('Dołączono zasób z Dysku Google! 📁✨');
    };

    window.removeMsgComposerGdrive = function() {
        msgAttachedGdriveData = null;
        const box = document.getElementById('msgComposerGdriveAttachment');
        if (box) box.style.display = 'none';
    };

    // Hook existing confirmAttachGoogleDrive to support messenger
    const origConfirmGdrive = window.confirmAttachGoogleDrive;
    window.confirmAttachGoogleDrive = function() {
        if (typeof origConfirmGdrive === 'function') {
            try { origConfirmGdrive(); } catch(e){}
        }
        if (window._tempGdriveParsed) {
            window.attachGdriveToMessenger(window._tempGdriveParsed);
        }
    };

    window.publishMsgComposerPost = async function() {
        const input = document.getElementById('msgComposerInput');
        const textVal = input ? input.value.trim() : '';

        if (!textVal && !msgAttachedImageDataUrl && !msgAttachedGdriveData && !msgAttachedYoutubeUrl) {
            if (window.showToast) window.showToast('Napisz coś lub dołącz materiał przed publikacją!');
            return;
        }

        const activeUser = window.getLuminaActiveUser() || { name: 'Użytkownik LUMINA', slug: 'user', avatar: 'lumina_icon.jpg' };
        const authorName = activeUser.name || 'Użytkownik LUMINA';
        const authorSlug = activeUser.slug || (activeUser.name ? activeUser.name.toLowerCase().replace(/[^a-z0-9_-]/g, '') : 'user');

        const isCezary = authorSlug === 'cezaryrgowski';
        const isWioletta = authorSlug === 'wiolettarogowska';

        const resolvedSlug = isCezary ? 'cezaryrgowski' : (isWioletta ? 'wiolettarogowska' : authorSlug);
        const resolvedAvatar = activeUser.avatar || (isCezary ? 'avatar_cezary_official.jpg' : (isWioletta ? 'avatar_wioletta_official.jpg' : 'lumina_icon.jpg'));
        const resolvedRole = activeUser.role || activeUser.job || (isCezary ? 'Założyciel Christian Culture ✨' : (isWioletta ? 'Współzałożycielka Christian Culture ✨' : 'Społeczność LUMINA ✨'));

        // Wykrywanie linków w tekście i generowanie natychmiastowej bogatej karty produktu/odnośnika
        let detectedLinkMeta = null;
        if (!msgAttachedGdriveData && !msgAttachedYoutubeUrl && textVal) {
            const urlMatch = textVal.match(/(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/i);
            if (urlMatch && urlMatch[0]) {
                const targetUrl = urlMatch[0];
                if (!targetUrl.includes('youtube.com') && !targetUrl.includes('youtu.be') && !targetUrl.includes('drive.google.com')) {
                    if (window.LuminaDB?.getHeuristicLinkMetadata) {
                        detectedLinkMeta = window.LuminaDB.getHeuristicLinkMetadata(targetUrl);
                    }
                }
            }
        }

        const newPost = {
            id: 'post_' + Date.now(),
            author: authorName,
            authorSlug: resolvedSlug,
            authorAvatar: resolvedAvatar,
            authorRole: resolvedRole,
            time: 'Przed chwilą • ✨ Nowy Wpis',
            text: textVal,
            likes: 0,
            amen: 0,
            image: (msgAttachedGdriveData && msgAttachedGdriveData.mode === 'image') ? msgAttachedGdriveData.directImgUrl : (msgAttachedImageDataUrl || null),
            video: (msgAttachedGdriveData && msgAttachedGdriveData.mode === 'video') ? msgAttachedGdriveData.directVideoUrl : null,
            videoUrl: msgAttachedYoutubeUrl || null,
            youtubeUrl: msgAttachedYoutubeUrl || null,
            gdrive: msgAttachedGdriveData || null,
            gdriveEmbed: (msgAttachedGdriveData && msgAttachedGdriveData.mode === 'embed') ? msgAttachedGdriveData.previewEmbedUrl : null,
            linkPreview: detectedLinkMeta || null,
            embedHtml: (msgAttachedGdriveData && msgAttachedGdriveData.mode === 'embed' && window.LuminaDB?.createGoogleDriveEmbedHtml) 
                ? window.LuminaDB.createGoogleDriveEmbedHtml(msgAttachedGdriveData, { mode: 'embed' }) 
                : (detectedLinkMeta && window.LuminaDB?.createRichOpenGraphCardHtml ? window.LuminaDB.createRichOpenGraphCardHtml(detectedLinkMeta) : null),
            createdAtTimestamp: Date.now()
        };

        // 1. Zapis bezpośredni w profilach autora w localStorage
        const keysToUpdate = [
            `lumina_profile_${resolvedSlug}`,
            isCezary ? 'lumina_profile_cezaryrgowski' : null,
            isCezary ? 'lumina_main_user_profile' : null,
            isCezary ? 'lumina_current_user_profile' : null,
            isCezary ? 'lumina_my_profile' : null,
            isWioletta ? 'lumina_profile_wiolettarogowska' : null,
            isWioletta ? 'lumina_current_user_profile' : null,
            isWioletta ? 'lumina_my_profile' : null
        ].filter(Boolean);

        keysToUpdate.forEach(k => {
            try {
                const raw = localStorage.getItem(k);
                let prof = raw ? JSON.parse(raw) : { name: authorName, slug: resolvedSlug, posts: [] };
                if (!Array.isArray(prof.posts)) prof.posts = [];
                if (!prof.posts.some(p => p.id === newPost.id)) {
                    prof.posts.unshift(newPost);
                    localStorage.setItem(k, JSON.stringify(prof));
                }
            } catch(e) {
                console.warn('Błąd zapisu w profilu:', k, e);
            }
        });

        // 2. Zapis w pamięci podręcznej tablicy (lumina_cloud_posts_cache)
        try {
            const rawCloud = localStorage.getItem('lumina_cloud_posts_cache');
            const feedList = rawCloud ? JSON.parse(rawCloud) : [];
            if (!feedList.some(p => p.id === newPost.id)) {
                feedList.unshift(newPost);
                localStorage.setItem('lumina_cloud_posts_cache', JSON.stringify(feedList));
            }
        } catch(e) {}

        // 3. Zapis w silniku LuminaDB (chmura Firestore & synchronizacja zdarzeń)
        if (window.LuminaDB?.publishUniversalPost) {
            try {
                const publishedPost = await window.LuminaDB.publishUniversalPost(newPost);
                if (!publishedPost?.cloudDocumentId) {
                    throw new Error('Serwer nie potwierdził zapisu wpisu.');
                }
            } catch(e) {
                console.error('LuminaDB universal publish error:', e);
                keysToUpdate.forEach(k => {
                    try {
                        const raw = localStorage.getItem(k);
                        if (!raw) return;
                        const profile = JSON.parse(raw);
                        if (Array.isArray(profile.posts)) {
                            profile.posts = profile.posts.filter(post => post.id !== newPost.id);
                            localStorage.setItem(k, JSON.stringify(profile));
                        }
                    } catch(err) {}
                });
                try {
                    const cached = JSON.parse(localStorage.getItem('lumina_cloud_posts_cache') || '[]');
                    localStorage.setItem('lumina_cloud_posts_cache', JSON.stringify(cached.filter(post => post.id !== newPost.id)));
                } catch(err) {}
                if (window.showToast) {
                    window.showToast(e?.message || 'Nie udało się opublikować wpisu. Treść pozostała w formularzu.');
                }
                return;
            }
        } else {
            if (window.showToast) window.showToast('Moduł publikacji LUMINA nie jest jeszcze gotowy.');
            return;
        }

        // Asynchroniczne doczytanie pełnego OpenGraph w tle (dla kart sklepów, produktów i stron WWW)
        if (detectedLinkMeta && detectedLinkMeta.url && window.LuminaDB?.fetchLinkOpenGraphMetadata) {
            window.LuminaDB.fetchLinkOpenGraphMetadata(detectedLinkMeta.url).then(async (enrichedMeta) => {
                if (enrichedMeta && (enrichedMeta.image !== detectedLinkMeta.image || enrichedMeta.title !== detectedLinkMeta.title || enrichedMeta.description !== detectedLinkMeta.description)) {
                    newPost.linkPreview = enrichedMeta;
                    newPost.embedHtml = window.LuminaDB.createRichOpenGraphCardHtml(enrichedMeta);
                    keysToUpdate.forEach(k => {
                        try {
                            const raw = localStorage.getItem(k);
                            if (raw) {
                                const prof = JSON.parse(raw);
                                const pIdx = (prof.posts || []).findIndex(p => p.id === newPost.id);
                                if (pIdx !== -1) {
                                    prof.posts[pIdx].linkPreview = enrichedMeta;
                                    prof.posts[pIdx].embedHtml = newPost.embedHtml;
                                    localStorage.setItem(k, JSON.stringify(prof));
                                }
                            }
                        } catch(e) {}
                    });
                    try {
                        const rawCloud = localStorage.getItem('lumina_cloud_posts_cache');
                        if (rawCloud) {
                            const feedList = JSON.parse(rawCloud);
                            const fIdx = feedList.findIndex(p => p.id === newPost.id);
                            if (fIdx !== -1) {
                                feedList[fIdx].linkPreview = enrichedMeta;
                                feedList[fIdx].embedHtml = newPost.embedHtml;
                                localStorage.setItem('lumina_cloud_posts_cache', JSON.stringify(feedList));
                            }
                        }
                    } catch(e) {}
                    if (window.LuminaDB?.publishUniversalPost) {
                        try { await window.LuminaDB.publishUniversalPost(newPost); } catch(e){}
                    }
                }
            }).catch(()=>{});
        }

        // 4. Jeśli jesteśmy na podstronie Cezarego, zapisz zaktualizowany profil w chmurze
        if (isCezary && window.LuminaDB?.saveProfileToCloud) {
            try {
                const rawC = localStorage.getItem('lumina_profile_cezaryrgowski');
                if (rawC) await window.LuminaDB.saveProfileToCloud('cezaryrgowski', JSON.parse(rawC));
            } catch(e){}
        }

        // 5. Natychmiastowe odświeżenie UI aktualnej podstrony (profil lub tablica)
        if (typeof renderPosts === 'function') {
            try { renderPosts(); } catch(e){}
        }
        if (typeof renderFeed === 'function') {
            try {
                if (window.cloudFeedPosts && !window.cloudFeedPosts.some(p => p.id === newPost.id)) {
                    window.cloudFeedPosts.unshift(newPost);
                }
                renderFeed();
            } catch(e){}
        }

        // 6. Globalne zdarzenia powiadamiające inne komponenty i zakładki
        window.dispatchEvent(new CustomEvent('lumina_post_published', { detail: newPost }));
        window.dispatchEvent(new Event('storage'));

        // Reset composer
        if (input) input.value = '';
        window.removeMsgComposerImage();
        window.removeMsgComposerGdrive();
        window.removeMsgComposerYt();

        if (window.showToast) {
            window.showToast('Twój post został pomyślnie opublikowany na Tablicy LUMINA i w Twoim profilu! ✨');
        }

        // Przełącz z powrotem na publiczny czat
        setTimeout(() => {
            window.switchMessengerMainTab('public');
        }, 800);
    };

    window.triggerLuminaLoginModal = function() {
        if (typeof openModal === 'function') {
            openModal('loginModal');
        } else {
            window.location.href = 'lumina-login.html?redirect=' + encodeURIComponent(window.location.href);
        }
    };

    window.triggerOwnerPinModal = function() {
        window.triggerLuminaLoginModal();
    };

    
    // ── Universal Google Drive Modal Handlers ──
    if (!window.openGoogleDriveModal) {
        window.openGoogleDriveModal = function() {
            const modal = document.getElementById('googleDriveModal');
            if (!modal) return;
            modal.style.display = 'flex';
            const input = document.getElementById('gdriveUrlInput');
            if (input) {
                input.value = '';
                setTimeout(() => input.focus(), 100);
            }
        };
    }

    if (!window.closeGoogleDriveModal) {
        window.closeGoogleDriveModal = function(event) {
            if (event && event.target && event.target.id === 'googleDriveModal') {
                window.closeGoogleDriveModalDirect();
            }
        };
    }

    if (!window.closeGoogleDriveModalDirect) {
        window.closeGoogleDriveModalDirect = function() {
            const modal = document.getElementById('googleDriveModal');
            if (modal) modal.style.display = 'none';
        };
    }

    if (!window.openMyGoogleDriveExternal) {
        window.openMyGoogleDriveExternal = function() {
            window.open('https://drive.google.com', '_blank');
        };
    }

    if (!window.handleGoogleDriveUrlInput) {
        window.handleGoogleDriveUrlInput = function(val) {
            const trimmed = String(val || '').trim();
            const btn = document.getElementById('btnConfirmAttachGdrive');
            const previewBox = document.getElementById('gdriveLivePreviewContainer');
            const iframe = document.getElementById('gdrivePreviewIframe');
            const img = document.getElementById('gdrivePreviewImg');
            const typeLabel = document.getElementById('gdrivePreviewTypeLabel');
            const icon = document.getElementById('gdrivePreviewIcon');

            if (!trimmed) {
                if (btn) { btn.disabled = true; btn.style.opacity = '0.5'; }
                if (previewBox) previewBox.style.display = 'none';
                return;
            }

            const parsed = window.LuminaDB?.parseGoogleDriveUrl ? window.LuminaDB.parseGoogleDriveUrl(trimmed) : null;
            if (parsed && parsed.fileId) {
                parsed.originalUrl = trimmed;
                parsed.mode = window._gdrivePublishMode || 'embed';
                window._tempGdriveParsed = parsed;

                if (typeLabel) typeLabel.innerText = parsed.typeLabel;
                if (icon) icon.className = parsed.icon;

                if (previewBox) previewBox.style.display = 'block';

                if (parsed.mode === 'image') {
                    if (iframe) { iframe.style.display = 'none'; iframe.src = ''; }
                    if (img) { img.style.display = 'block'; img.src = parsed.directImgUrl; }
                } else {
                    if (img) { img.style.display = 'none'; img.src = ''; }
                    if (iframe) { iframe.style.display = 'block'; iframe.src = parsed.previewEmbedUrl; }
                }

                if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
            } else {
                if (btn) { btn.disabled = true; btn.style.opacity = '0.5'; }
                if (previewBox) previewBox.style.display = 'none';
            }
        };
    }

    if (!window.setGdrivePublishMode) {
        window.setGdrivePublishMode = function(mode) {
            window._gdrivePublishMode = mode;
            if (window._tempGdriveParsed) {
                window._tempGdriveParsed.mode = mode;
                window.handleGoogleDriveUrlInput(window._tempGdriveParsed.originalUrl);
            }
        };
    }

    
    // Inject Desktop Expanded Style for Centrum Rozmów (860px width & clean tab layout)
    (function injectDesktopStyle() {
        if (document.getElementById('lumina-messenger-desktop-style')) return;
        const style = document.createElement('style');
        style.id = 'lumina-messenger-desktop-style';
        style.textContent = `
            @media (min-width: 769px) {
                #directMessagesModal .modal-card:not(.is-fullscreen) {
                    max-width: 860px !important;
                    width: 95% !important;
                    height: 720px !important;
                    max-height: 88vh !important;
                    border-radius: 24px !important;
                }
                #directMessagesModal .chat-header-bar {
                    padding: 16px 20px 12px 20px !important;
                }
                #directMessagesModal .chat-header-bar > div:last-child {
                    display: flex !important;
                    gap: 8px !important;
                    overflow-x: auto !important;
                    scrollbar-width: none !important;
                }
                #directMessagesModal .chat-header-bar > div:last-child button {
                    white-space: nowrap !important;
                    padding: 9px 14px !important;
                    font-size: 0.82rem !important;
                    gap: 7px !important;
                    flex: 1 1 auto !important;
                }
                #directMessagesModal .chat-fullscreen-btn,
                #directMessagesModal button#btnChatFullscreen {
                    width: 36px !important;
                    height: 36px !important;
                    min-width: 36px !important;
                    max-width: 36px !important;
                    min-height: 36px !important;
                    max-height: 36px !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    flex: 0 0 36px !important;
                    border-radius: 10px !important;
                    border: 1px solid rgba(168,85,247,0.35) !important;
                    background: rgba(168,85,247,0.12) !important;
                    color: #c084fc !important;
                    font-size: 0.95rem !important;
                    cursor: pointer !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    box-sizing: border-box !important;
                    transition: all 0.2s ease !important;
                    flex-shrink: 0 !important;
                }
                #directMessagesModal .chat-fullscreen-btn:hover,
                #directMessagesModal button#btnChatFullscreen:hover {
                    background: rgba(168, 85, 247, 0.28) !important;
                    border-color: rgba(192, 132, 252, 0.6) !important;
                    color: #e9d5ff !important;
                }
                #directMessagesModal .chat-fullscreen-btn:active,
                #directMessagesModal button#btnChatFullscreen:active {
                    transform: scale(0.93) !important;
                }
            }

            /* --- Tryb Pełnoekranowy Centrum Rozmów LUMINA --- */
            #directMessagesModal.is-fullscreen,
            div#directMessagesModal.is-fullscreen {
                padding: 0 !important;
                margin: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                height: 100dvh !important;
                max-width: 100vw !important;
                max-height: 100vh !important;
                max-height: 100dvh !important;
                align-items: stretch !important;
                justify-content: stretch !important;
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
            }

            #directMessagesModal.is-fullscreen .modal-card,
            #directMessagesModal .modal-card.is-fullscreen,
            div#directMessagesModal .lumina-messenger-modal-card.is-fullscreen,
            .lumina-messenger-modal-card.is-fullscreen {
                width: 100vw !important;
                height: 100vh !important;
                height: 100dvh !important;
                max-width: 100vw !important;
                max-height: 100vh !important;
                max-height: 100dvh !important;
                min-width: 100vw !important;
                min-height: 100vh !important;
                min-height: 100dvh !important;
                border-radius: 0 !important;
                border: none !important;
                position: fixed !important;
                inset: 0 !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                margin: 0 !important;
                transform: none !important;
                z-index: 99999999 !important;
                box-shadow: none !important;
            }

            @media (max-width: 768px) {
                .chat-fullscreen-btn,
                #directMessagesModal .chat-fullscreen-btn,
                #directMessagesModal button#btnChatFullscreen {
                    display: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    })();

    // ── Global Fullscreen Mode Handler for LUMINA Messenger 🖥️✨ ──
    window.toggleChatFullscreen = function() {
        const modal = document.getElementById('directMessagesModal');
        const card = document.querySelector('#directMessagesModal .lumina-messenger-modal-card') || (modal ? modal.querySelector('.modal-card') : null);
        const icon = document.getElementById('iconChatFullscreen');
        if (!card || !modal) return;
        const isFs = card.classList.toggle('is-fullscreen');
        modal.classList.toggle('is-fullscreen', isFs);
        if (icon) {
            icon.className = isFs ? 'fa-solid fa-compress' : 'fa-solid fa-expand';
        }
        const btn = document.getElementById('btnChatFullscreen');
        if (btn) btn.title = isFs ? 'Wyjdź z pełnego ekranu' : 'Pełny ekran czatu';
    };

    if (!window.__luminaFsEscBound) {
        window.__luminaFsEscBound = true;
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const modal = document.getElementById('directMessagesModal');
                const card = document.querySelector('#directMessagesModal .lumina-messenger-modal-card');
                if ((card && card.classList.contains('is-fullscreen')) || (modal && modal.classList.contains('is-fullscreen'))) {
                    window.toggleChatFullscreen();
                }
            }
        });
    }

    function ensureChatFullscreenButton() {
        const modal = document.getElementById('directMessagesModal');
        if (!modal) return;
        if (document.getElementById('btnChatFullscreen')) return;
        const closeBtn = modal.querySelector('.chat-header-bar .modal-close-btn');
        if (!closeBtn || !closeBtn.parentNode) return;

        const btn = document.createElement('button');
        btn.id = 'btnChatFullscreen';
        btn.type = 'button';
        btn.onclick = window.toggleChatFullscreen;
        btn.title = 'Pełny ekran czatu';
        btn.className = 'chat-fullscreen-btn';
        btn.style.cssText = 'align-items:center; justify-content:center; width:36px; height:36px; min-width:36px; max-width:36px; min-height:36px; max-height:36px; border-radius:10px; border:1px solid rgba(168,85,247,0.35); background:rgba(168,85,247,0.12); color:#c084fc; font-size:0.95rem; cursor:pointer; transition:all 0.2s; flex:0 0 36px; flex-shrink:0; padding:0; margin:0; box-sizing:border-box;';
        btn.innerHTML = '<i class="fa-solid fa-expand" id="iconChatFullscreen"></i>';

        const parent = closeBtn.parentNode;
        if (!parent.classList.contains('chat-header-actions')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'chat-header-actions';
            wrapper.style.cssText = 'display:flex; align-items:center; gap:6px; flex-shrink:0;';
            parent.insertBefore(wrapper, closeBtn);
            wrapper.appendChild(btn);
            wrapper.appendChild(closeBtn);
        } else {
            parent.insertBefore(btn, closeBtn);
        }
    }

    // Auto-initialize on load & DOM ready
    function setup() {
        initMessengerComposerUI();
        patchSwitchMessengerTab();
        ensureChatFullscreenButton();
        if (typeof window.updateMsgComposerAuthorUI === 'function') {
            window.updateMsgComposerAuthorUI();
        }
    }

    window.addEventListener('lumina-auth-state', () => {
        if (typeof window.updateMsgComposerAuthorUI === 'function') window.updateMsgComposerAuthorUI();
        ensureChatFullscreenButton();
    });
    window.addEventListener('storage', () => {
        if (typeof window.updateMsgComposerAuthorUI === 'function') window.updateMsgComposerAuthorUI();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
    window.addEventListener('load', setup);

    // SMCC 44px Touch Target Mobile Enforcer hook
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 640) {
            const btn = document.getElementById('tabBtnCreatePost');
            if (btn) {
                btn.style.padding = '0';
                btn.style.minHeight = '44px';
                btn.style.minWidth = '44px';
                btn.querySelectorAll('.tab-label').forEach(s => s.style.display = 'none');
            }
        }
    });

})();
