/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA THEMATIC GROUPS & DISCUSSION ROOMS ENGINE (js/lumina-groups-engine.js)
 * Chrześcijańskie Pokoje Tematyczne w Czasie Rzeczywistym (Firestore Realtime)
 * 1. 🌸 CC Women – Kobiety Wiary
 * 2. 🛡️ CC Men – Mężczyźni Wiary
 * 3. 💍 Single z Wartościami
 * 4. 💼 Chrześcijanin w Biznesie & Pracy
 * 5. 📖 Klub Biblijny & Świadectwa
 * ══════════════════════════════════════════════════════════════════════════
 */

(function initLuminaGroupsEngine() {
    'use strict';

    const LUMINA_THEMATIC_GROUPS = [
        {
            id: 'group_cc_women',
            name: 'CC Women – Kobiety Wiary',
            icon: '🌸',
            avatar: 'logo_cc_women.jpg',
            badge: '🌸 Kobiety Wiary',
            badgeColor: '#f472b6',
            borderColor: '#ec4899',
            desc: 'Miejsce modlitwy, wzajemnego wsparcia i budowania dla kobiet szukających Bożej mądrości w codzienności, małżeństwie i macierzyństwie.',
            leader: 'Wioletta Rogowska',
            membersCount: 142,
            topics: ['🌸 Modlitwa za rodzinę', '🕊️ Świadectwo wiary', '☕ Spotkanie kobiet', '📖 Werset dnia'],
            genderRestriction: 'kobieta'
        },
        {
            id: 'group_cc_men',
            name: 'CC Men – Mężczyźni Wiary',
            icon: '🛡️',
            avatar: 'logo_cc_men.jpg',
            badge: '🛡️ Mężczyźni Wiary',
            badgeColor: '#38bdf8',
            borderColor: '#0284c7',
            desc: 'Męska odpowiedzialność, mężowie, ojcowie i liderzy w Chrystusie. Wzajemne umacnianie w prawości, odwadze i braterskiej modlitwie.',
            leader: 'Cezary Rogowski',
            membersCount: 128,
            topics: ['🛡️ Męska odpowiedzialność', '⚔️ Walka duchowa', '💼 Praca & prawość', '🙏 Męski krąg modlitwy'],
            genderRestriction: 'mezczyzna'
        },
        {
            id: 'group_singles',
            name: 'Single z Wartościami',
            icon: '💍',
            avatar: 'lumina_icon.jpg',
            badge: '💍 Czystość & Relacje',
            badgeColor: '#c084fc',
            borderColor: '#a855f7',
            desc: 'Społeczność chrześcijańskich singli szukających głębokich, czystych relacji, wartościowych przyjaźni i małżeństwa według Bożej woli.',
            leader: 'Moderatorzy LUMINA',
            membersCount: 215,
            topics: ['💍 Boża wola w relacjach', '🌿 Czystość serca', '☕ Chrześcijańska kawa', '💬 Poznajmy się']
        },
        {
            id: 'group_business',
            name: 'Chrześcijanin w Biznesie & Pracy',
            icon: '💼',
            avatar: 'icon.png',
            badge: '💼 Biznes & Misja',
            badgeColor: '#facc15',
            borderColor: '#eab308',
            desc: 'Etyka w biznesie, sukces oparty na Bożych zasadach, ewangelizacja w miejscu pracy i wzajemne wspieranie przedsiębiorców.',
            leader: 'Przedsiębiorcy CC',
            membersCount: 89,
            topics: ['💼 Etyka w pracy', '💡 Boże prowadzenie w projektach', '🤝 Współpraca chrześcijan', '📈 Hojność & mecenat']
        },
        {
            id: 'group_bible_study',
            name: 'Klub Biblijny & Świadectwa',
            icon: '📖',
            avatar: 'reklama_biblia.png',
            badge: '📖 Słowo & Cuda',
            badgeColor: '#10b981',
            borderColor: '#059669',
            desc: 'Wspólne czytanie Pisma Świętego, dzielenie się wersetami życia, cudami Boga i wzajemne budowanie się w łasce Pana.',
            leader: 'Andrzej Thiel & Zespół CC',
            membersCount: 310,
            topics: ['📖 Werset na dziś', '✨ Świadectwo cudu', '🙏 Intencja modlitewna', '🔍 Rozważanie biblijne']
        }
    ];

    let activeGroupSession = null;
    let activeGroupUnsubscribe = null;

    // ── STYLES ──
    function injectGroupStyles() {
        if (document.getElementById('luminaGroupsEngineStyles')) return;
        const style = document.createElement('style');
        style.id = 'luminaGroupsEngineStyles';
        style.textContent = `
            .group-card-item {
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 16px;
                padding: 14px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                cursor: pointer;
                transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
                position: relative;
                overflow: hidden;
                flex-shrink: 0;
            }
            .group-card-item:hover {
                background: rgba(255, 255, 255, 0.08);
                border-color: rgba(168, 85, 247, 0.45);
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
            }
            .group-card-item:active {
                transform: scale(0.98);
            }
            .group-topic-chip {
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.12);
                color: #cbd5e1;
                font-size: 0.70rem;
                font-weight: 700;
                padding: 3px 8px;
                border-radius: 10px;
                white-space: nowrap;
                cursor: pointer;
                transition: all 0.18s;
            }
            .group-topic-chip:hover {
                background: rgba(250, 204, 21, 0.15);
                border-color: #facc15;
                color: #fef08a;
            }
        `;
        document.head.appendChild(style);
    }

    // ── RENDER GROUPS LIST VIEW ──
    function renderGroupsListView(containerEl) {
        if (!containerEl) return;
        injectGroupStyles();

        containerEl.innerHTML = `
            <div style="padding: 14px 16px; display: flex; flex-direction: column; height: 100%; min-height: 0;">
                <div style="margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <h4 style="font-size: 0.95rem; font-weight: 800; color: #fff; font-family: 'Outfit', sans-serif; margin: 0 0 2px;">
                            👥 Grupy Tematyczne & Pokoje Wsparcia
                        </h4>
                        <div style="font-size: 0.72rem; color: #94a3b8;">
                            Dołącz do społeczności wierzących o wspólnych pasjach i powołaniu ✨
                        </div>
                    </div>
                </div>

                <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-right: 2px;">
                    ${LUMINA_THEMATIC_GROUPS.map(g => `
                        <div class="group-card-item" onclick="window.openGroupChatRoom('${g.id}')">
                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                                <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                                    <img src="${g.avatar}" alt="${g.name}" loading="lazy" decoding="async" style="width: 44px; height: 44px; border-radius: 12px; object-fit: cover; border: 2px solid ${g.borderColor}; flex-shrink: 0;" onerror="this.src='lumina_icon.jpg'">
                                    <div style="min-width: 0;">
                                        <div style="font-size: 0.92rem; font-weight: 800; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                            ${g.name}
                                        </div>
                                        <div style="font-size: 0.68rem; color: ${g.badgeColor}; font-weight: 700; margin-top: 1px;">
                                            <i class="fa-solid fa-users"></i> ${g.membersCount} członków • Lider: ${g.leader}
                                        </div>
                                    </div>
                                </div>
                                <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                                    ${g.genderRestriction ? `
                                        <span title="${g.genderRestriction === 'kobieta' ? 'Tylko kobiety' : 'Tylko mężczyźni'}"
                                              style="font-size:0.68rem;font-weight:800;padding:3px 8px;border-radius:8px;
                                                     background:${g.genderRestriction === 'kobieta' ? 'rgba(236,72,153,0.18)' : 'rgba(56,189,248,0.18)'};
                                                     border:1px solid ${g.genderRestriction === 'kobieta' ? '#ec4899' : '#38bdf8'};
                                                     color:${g.genderRestriction === 'kobieta' ? '#f472b6' : '#7dd3fc'};">
                                            ${g.genderRestriction === 'kobieta' ? '🌸 Tylko kobiety' : '🛡️ Tylko mężczyźni'}
                                        </span>
                                    ` : ''}
                                    <span style="background: linear-gradient(135deg, rgba(236,72,153,0.2), rgba(139,92,246,0.2)); border: 1px solid rgba(236,72,153,0.4); color: #f472b6; font-size: 0.72rem; font-weight: 800; padding: 4px 10px; border-radius: 10px; white-space: nowrap;">
                                        Wejdź 💬
                                    </span>
                                </div>
                            </div>
                            
                            <p style="font-size: 0.76rem; color: #cbd5e1; line-height: 1.4; margin: 0;">
                                ${g.desc}
                            </p>

                            <div style="display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; padding-top: 2px;">
                                ${g.topics.map(t => `<span class="group-topic-chip" onclick="event.stopPropagation(); window.openGroupChatRoom('${g.id}', '${t}')">${t}</span>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // ── GENDER ACCESS GATE ──
    function checkGenderAccess(group) {
        if (!group.genderRestriction) return true; // no restriction

        const myProfile = window.LuminaDB?.getCurrentProfile?.();
        const myUser   = window.LuminaDB?.getCurrentUser?.();
        const myGender = (
            myProfile?.gender ||
            myProfile?.plec  ||
            myUser?.gender   ||
            myUser?.plec     ||
            localStorage.getItem('lumina_user_gender') ||
            ''
        ).toLowerCase().trim();

        // Accepted values: 'kobieta' / 'mezczyzna' (also 'woman'/'man' aliases)
        const normalise = g => {
            if (['kobieta','woman','female','k','f'].includes(g)) return 'kobieta';
            if (['mezczyzna','mężczyzna','man','male','m'].includes(g)) return 'mezczyzna';
            return g;
        };

        return normalise(myGender) === group.genderRestriction;
    }

    function showGenderBlockModal(group) {
        const isWomenRoom = group.genderRestriction === 'kobieta';
        const icon  = isWomenRoom ? '🌸' : '🛡️';
        const color = isWomenRoom ? '#ec4899' : '#38bdf8';
        const forWhom = isWomenRoom
            ? 'Ta przestrzeń jest przeznaczona wyłącznie dla kobiet wierzących.'
            : 'Ta przestrzeń jest przeznaczona wyłącznie dla mężczyzn wierzących.';
        const subtitle = isWomenRoom
            ? 'Szanujemy prywatność i bezpieczeństwo sióstr w wierze.'
            : 'Szanujemy prywatność i bezpieczeństwo braci w wierze.';

        // Remove previous if any
        const prev = document.getElementById('luminaGenderGateModal');
        if (prev) prev.remove();

        const m = document.createElement('div');
        m.id = 'luminaGenderGateModal';
        m.style.cssText = 'position:fixed;inset:0;z-index:9999999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.88);backdrop-filter:blur(14px);padding:20px;';
        m.innerHTML = `
            <div style="max-width:380px;width:100%;background:#070e24;border:1.5px solid ${color}55;border-radius:24px;padding:28px 24px;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,0.9);">
                <div style="font-size:3rem;margin-bottom:12px;">${icon}</div>
                <div style="font-size:1.1rem;font-weight:900;color:#fff;font-family:'Outfit',sans-serif;margin-bottom:8px;">${group.name}</div>
                <div style="font-size:0.88rem;color:${color};font-weight:700;margin-bottom:10px;">${forWhom}</div>
                <div style="font-size:0.78rem;color:#94a3b8;line-height:1.5;margin-bottom:20px;">${subtitle}<br>Dziękujemy za zrozumienie i szacunek dla tej przestrzeni.</div>
                <button onclick="document.getElementById('luminaGenderGateModal').remove()" style="padding:12px 28px;border-radius:14px;background:linear-gradient(135deg,${color},#8b5cf6);border:none;color:#fff;font-weight:800;font-family:inherit;font-size:0.9rem;cursor:pointer;width:100%;">
                    Rozumiem 🕊️
                </button>
            </div>
        `;
        document.body.appendChild(m);
        m.addEventListener('click', e => { if (e.target === m) m.remove(); });
    }

    // ── OPEN SPECIFIC GROUP CHAT ROOM ──
    window.openGroupChatRoom = function(groupId, prefillTopic) {
        const group = LUMINA_THEMATIC_GROUPS.find(g => g.id === groupId) || LUMINA_THEMATIC_GROUPS[0];

        // ── GENDER GATE ──
        if (!checkGenderAccess(group)) {
            showGenderBlockModal(group);
            return;
        }

        activeGroupSession = group;

        const groupsListView = document.getElementById('messengerGroupsListView');
        const groupChatView = document.getElementById('groupChatRoomView');
        if (groupsListView) groupsListView.style.display = 'none';
        if (groupChatView) groupChatView.style.display = 'flex';

        const nameEl = document.getElementById('activeGroupChatName');
        const avatarEl = document.getElementById('activeGroupChatAvatar');
        const descEl = document.getElementById('activeGroupChatDesc');
        const chipsEl = document.getElementById('activeGroupChatChips');
        const inputEl = document.getElementById('groupChatInput');

        if (nameEl) nameEl.textContent = group.name;
        if (avatarEl) avatarEl.src = group.avatar || 'lumina_icon.jpg';
        if (descEl) descEl.textContent = `${group.badge} • ${group.membersCount} członków`;

        if (chipsEl) {
            chipsEl.innerHTML = group.topics.map(t => `
                <button type="button" class="group-topic-chip" onclick="window.insertChatSmartBlessing('groupChatInput', '${t} — ')">
                    ${t}
                </button>
            `).join('');
        }

        if (prefillTopic && inputEl) {
            inputEl.value = `${prefillTopic} — `;
            inputEl.focus();
        }

        const box = document.getElementById('groupChatMessagesBox');
        if (box) {
            box.innerHTML = `
                <div style="text-align:center;margin:10px 0;">
                    <span style="font-size:0.72rem;color:#94a3b8;background:rgba(255,255,255,0.05);padding:4px 12px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);">
                        Witaj w pokoju grupy ${group.name}! Rozmawiajmy w pokoju i miłości Chrystusa ✨
                    </span>
                </div>
            `;
        }

        if (activeGroupUnsubscribe) {
            activeGroupUnsubscribe();
            activeGroupUnsubscribe = null;
        }

        const chatId = `group_${group.id}`;
        if (window.LuminaDB?.subscribeToDirectMessages) {
            activeGroupUnsubscribe = window.LuminaDB.subscribeToDirectMessages(chatId, (messages) => {
                renderGroupMessages(messages);
            });
        }
    };

    // ── RETURN TO GROUPS LIST ──
    window.returnToGroupsList = function() {
        if (activeGroupUnsubscribe) {
            activeGroupUnsubscribe();
            activeGroupUnsubscribe = null;
        }
        activeGroupSession = null;

        const groupsListView = document.getElementById('messengerGroupsListView');
        const groupChatView = document.getElementById('groupChatRoomView');
        if (groupsListView) groupsListView.style.display = 'flex';
        if (groupChatView) groupChatView.style.display = 'none';
    };

    // ── RENDER GROUP MESSAGES ──
    function renderGroupMessages(messages) {
        const box = document.getElementById('groupChatMessagesBox');
        if (!box || !Array.isArray(messages)) return;

        const myUser = window.LuminaDB?.getCurrentUser();
        const myProfile = window.LuminaDB?.getCurrentProfile();
        const rawMyId = myProfile?.slug || myProfile?.uid || myUser?.slug || myUser?.uid || localStorage.getItem('lumina_current_user_slug') || 'guest';
        const myId = window.LuminaDB ? window.LuminaDB.normalizeChatUserId(rawMyId) : rawMyId;

        const groupName = activeGroupSession ? activeGroupSession.name : 'Grupa';

        let html = `
            <div style="text-align:center;margin:10px 0;">
                <span style="font-size:0.72rem;color:#94a3b8;background:rgba(255,255,255,0.05);padding:4px 12px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);">
                    Pokój dyskusyjny ${groupName} ✨
                </span>
            </div>
        `;

        messages.forEach(msg => {
            const senderId = window.LuminaDB ? window.LuminaDB.normalizeChatUserId(msg.senderId || msg.senderUid || '') : (msg.senderId || '');
            const isMe = senderId === myId;
            const authorName = msg.senderName || 'Użytkownik LUMINA';
            const avatar = msg.senderAvatar || 'lumina_icon.jpg';
            const badge = msg.senderBadge || '🕊️ Społeczność';
            const text = msg.text || '';
            const dateStr = msg.dateStr || (msg.timestamp?.seconds ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Przed chwilą');

            html += `
                <div style="display:flex; gap:8px; margin-bottom:8px; align-items:flex-start; ${isMe ? 'flex-direction:row-reverse;' : ''}">
                    <img src="${avatar}" alt="${authorName}" loading="lazy" decoding="async" style="width:32px; height:32px; border-radius:50%; object-fit:cover; border:1px solid rgba(255,255,255,0.2); flex-shrink:0;" onerror="this.src='lumina_icon.jpg'">
                    <div style="max-width:78%; display:flex; flex-direction:column; ${isMe ? 'align-items:flex-end;' : 'align-items:flex-start;'}">
                        <div style="display:flex; align-items:center; gap:5px; margin-bottom:2px;">
                            <span style="font-size:0.72rem; font-weight:800; color:#fff;">${authorName}</span>
                            <span style="font-size:0.62rem; color:#facc15; background:rgba(250,204,21,0.12); padding:1px 5px; border-radius:6px;">${badge}</span>
                            <span style="font-size:0.62rem; color:#64748b;">${dateStr}</span>
                        </div>
                        <div style="padding:8px 12px; border-radius:14px; font-size:0.84rem; line-height:1.45; ${isMe ? 'background:linear-gradient(135deg,#ec4899,#8b5cf6); color:#fff; border-bottom-right-radius:2px;' : 'background:rgba(255,255,255,0.08); color:#f1f5f9; border-bottom-left-radius:2px; border:1px solid rgba(255,255,255,0.1);'}">
                            ${text}
                            ${isMe ? `
                                <div style="display:flex; justify-content:flex-end; align-items:center; margin-top:4px; font-size:0.68rem; color:#fff;">
                                    <span style="background:rgba(0,0,0,0.4); padding:2px 6px; border-radius:6px; font-weight:800; display:inline-flex; align-items:center; gap:4px;">
                                        <i class="fa-solid fa-check-double" style="color:${msg.isRead ? '#fde047' : '#38bdf8'};"></i> ${msg.isRead ? ('Odczytano' + (msg.readByName ? ' przez: ' + msg.readByName : '')) : 'Dostarczono'}
                                    </span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        box.innerHTML = html;
        if (typeof window.scrollChatToBottom === 'function') {
            window.scrollChatToBottom(box, false);
        } else {
            box.scrollTop = box.scrollHeight;
        }
    }

    // ── SEND GROUP MESSAGE ──
    window.handleSendGroupChatMessage = async function(e) {
        if (e) e.preventDefault();
        const input = document.getElementById('groupChatInput');
        if (!input || !activeGroupSession) return;
        const text = (input.value || '').trim();
        if (!text) return;

        const myUser = window.LuminaDB?.getCurrentUser();
        const myProfile = window.LuminaDB?.getCurrentProfile();
        const fromId = myProfile?.slug || myProfile?.uid || myUser?.slug || myUser?.uid || localStorage.getItem('lumina_current_user_slug') || 'guest';
        const senderName = myProfile?.name || myUser?.displayName || 'Użytkownik LUMINA';
        const senderAvatar = myProfile?.avatar || myUser?.photoURL || 'lumina_icon.jpg';
        const senderBadge = myProfile?.badge || activeGroupSession.badge || '🕊️ Społeczność';

        const chatId = `group_${activeGroupSession.id}`;

        input.value = '';

        if (window.LuminaDB?.sendDirectMessageToCloud) {
            await window.LuminaDB.sendDirectMessageToCloud(chatId, {
                senderId: fromId,
                senderName: senderName,
                senderAvatar: senderAvatar,
                senderBadge: senderBadge,
                receiverId: chatId,
                text: text,
                type: 'group_message'
            });
        }
    };

    // ── INJECT GROUPS TAB & VIEWS INTO MESSENGER MODAL ──
    function setupGroupsInMessengerModal() {
        const modal = document.getElementById('directMessagesModal');
        if (!modal) return;

        // 1. Inject Tab Button [ 👥 Grupy ]
        const tabsBar = modal.querySelector('div[style*="background:rgba(255,255,255,0.05)"]') || modal.querySelector('div[style*="background: rgba(255, 255, 255, 0.05)"]');
        if (tabsBar && !document.getElementById('tabBtnGroupsChat')) {
            const groupsBtn = document.createElement('button');
            groupsBtn.type = 'button';
            groupsBtn.id = 'tabBtnGroupsChat';
            groupsBtn.onclick = () => window.switchMessengerMainTab('groups');
            groupsBtn.style.cssText = 'flex:1; min-height:44px; min-width:44px; padding:0; border-radius:10px; border:none; background:transparent; color:#94a3b8; font-weight:700; font-family:inherit; font-size:0.8rem; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:6px; transition:all 0.2s; touch-action:manipulation;';
            groupsBtn.title = 'Grupy & Pokoje';
            groupsBtn.innerHTML = '<i class="fa-solid fa-users"></i><span class="tab-label" aria-hidden="true"> Grupy &amp; Pokoje</span>';

            const privateBtn = document.getElementById('tabBtnPrivateChat');
            if (privateBtn) {
                tabsBar.insertBefore(groupsBtn, privateBtn);
            } else {
                tabsBar.appendChild(groupsBtn);
            }
        }

        // 2. Inject Groups Container Views if missing
        if (!document.getElementById('messengerGroupsView')) {
            const groupsView = document.createElement('div');
            groupsView.id = 'messengerGroupsView';
            groupsView.style.cssText = 'display:none; flex-direction:column; flex:1; min-height:0;';
            groupsView.innerHTML = `
                <!-- VIEW 3A: GROUPS DIRECTORY LIST -->
                <div id="messengerGroupsListView" style="display:flex; flex-direction:column; height:100%; min-height:0;"></div>

                <!-- VIEW 3B: ACTIVE GROUP CHAT ROOM -->
                <div id="groupChatRoomView" style="display:none; flex-direction:column; height:100%; min-height:0;">
                    <!-- Group Header -->
                    <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:rgba(255,255,255,0.04); border-bottom:1px solid rgba(255,255,255,0.1);">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <button type="button" onclick="window.returnToGroupsList()" style="background:none; border:none; color:#94a3b8; font-size:1.1rem; cursor:pointer; padding:4px 8px;"><i class="fa-solid fa-arrow-left"></i></button>
                            <img id="activeGroupChatAvatar" src="lumina_icon.jpg" alt="Grupa" style="width:38px; height:38px; border-radius:12px; object-fit:cover; border:1.5px solid #facc15;">
                            <div>
                                <div id="activeGroupChatName" style="font-weight:800; font-size:0.95rem; color:#fff;">Grupa</div>
                                <div id="activeGroupChatDesc" style="font-size:0.7rem; color:#facc15; font-weight:700;">🌸 Kobiety Wiary</div>
                            </div>
                        </div>
                        <button class="modal-close-btn" onclick="closeModal('directMessagesModal')" style="position:static;"><i class="fa-solid fa-xmark"></i></button>
                    </div>

                    <!-- Group Topics Filter Chips -->
                    <div id="activeGroupChatChips" style="display:flex; gap:6px; padding:6px 14px; background:rgba(255,255,255,0.02); border-bottom:1px solid rgba(255,255,255,0.05); overflow-x:auto; scrollbar-width:none;"></div>

                    <!-- Group Messages Scroll Box -->
                    <div id="groupChatMessagesBox" style="flex:1; overflow-y:auto; padding:14px 16px; display:flex; flex-direction:column; gap:10px; background:rgba(0,0,0,0.25);"></div>

                    <!-- Smart Blessings & Scripture Bar -->
                    <div id="groupChatSmartBar" class="chat-quick-bar" data-target-input="groupChatInput"></div>

                    <!-- Group Chat Input Form -->
                    <form id="groupChatForm" class="chat-input-bar" onsubmit="handleSendGroupChatMessage(event)" style="display:flex; gap:8px; padding:10px 14px; background:rgba(255,255,255,0.04); border-top:1px solid rgba(255,255,255,0.1);">
                        <input type="text" id="groupChatInput" placeholder="Napisz do grupy..." style="flex:1; padding:10px 14px; border-radius:20px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); color:#fff; font-family:inherit; font-size:0.85rem;" required>
                        <button type="submit" style="padding:10px 18px; border-radius:20px; background:linear-gradient(90deg, #ec4899, #8b5cf6); border:none; color:#fff; font-weight:800; cursor:pointer; font-family:inherit; font-size:0.85rem; display:flex; align-items:center; gap:6px;">
                            <span>Wyślij</span> <i class="fa-solid fa-paper-plane"></i>
                        </button>
                    </form>
                </div>
            `;

            const mBody = modal.querySelector('.modal-card') || modal;
            mBody.appendChild(groupsView);

            renderGroupsListView(document.getElementById('messengerGroupsListView'));
            if (typeof window.initLuminaSmartBlessings === 'function') {
                window.initLuminaSmartBlessings();
            }
        }
    }

    // ── MONKEY-PATCH / ENHANCE switchMessengerMainTab ──
    const originalSwitchMessengerMainTab = window.switchMessengerMainTab;
    window.switchMessengerMainTab = function(tab) {
        const btnPublic = document.getElementById('tabBtnPublicChat');
        const btnPrivate = document.getElementById('tabBtnPrivateChat');
        const btnCommander = document.getElementById('tabBtnCommanderChat');
        const btnGroups = document.getElementById('tabBtnGroupsChat');

        const viewPublic = document.getElementById('messengerPublicView');
        const viewPrivate = document.getElementById('messengerPrivateView');
        const viewCommander = document.getElementById('messengerCommanderView');
        const viewGroups = document.getElementById('messengerGroupsView');

        const btnPost = document.getElementById('tabBtnCreatePost');
        const viewPost = document.getElementById('messengerPostView');

        if (tab === 'groups') {
            if (btnPublic) { btnPublic.style.background = 'transparent'; btnPublic.style.color = '#94a3b8'; btnPublic.style.boxShadow = 'none'; }
            if (btnPrivate) { btnPrivate.style.background = 'transparent'; btnPrivate.style.color = '#94a3b8'; btnPrivate.style.boxShadow = 'none'; }
            if (btnCommander) { btnCommander.style.background = 'transparent'; btnCommander.style.color = '#94a3b8'; btnCommander.style.boxShadow = 'none'; }
            if (btnPost) { btnPost.style.background = 'transparent'; btnPost.style.color = '#94a3b8'; btnPost.style.boxShadow = 'none'; }
            if (btnGroups) {
                btnGroups.style.background = 'linear-gradient(135deg,#ec4899,#8b5cf6)';
                btnGroups.style.color = '#fff';
                btnGroups.style.boxShadow = '0 2px 8px rgba(236,72,153,0.3)';
            }

            if (viewPublic) viewPublic.style.setProperty('display', 'none', 'important');
            if (viewPrivate) {
                viewPrivate.style.setProperty('display', 'none', 'important');
                viewPrivate.classList.add('is-hidden');
            }
            if (viewCommander) viewCommander.style.setProperty('display', 'none', 'important');
            if (viewPost) viewPost.style.setProperty('display', 'none', 'important');
            if (viewGroups) viewGroups.style.setProperty('display', 'flex', 'important');

            renderGroupsListView(document.getElementById('messengerGroupsListView'));
        } else {
            if (btnGroups) {
                btnGroups.style.background = 'transparent';
                btnGroups.style.color = '#94a3b8';
                btnGroups.style.boxShadow = 'none';
            }
            if (viewGroups) viewGroups.style.setProperty('display', 'none', 'important');
            if (viewPrivate && tab === 'private') {
                viewPrivate.classList.remove('is-hidden');
            }

            if (typeof originalSwitchMessengerMainTab === 'function') {
                originalSwitchMessengerMainTab.apply(this, arguments);
            }
        }
    };

    // Auto-init on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(setupGroupsInMessengerModal, 500));
    } else {
        setTimeout(setupGroupsInMessengerModal, 500);
    }
})();
