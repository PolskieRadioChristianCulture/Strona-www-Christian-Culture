/**
 * LUMINA CORE ENGINE (lumina-core.js)
 * Architektura Danych Firebase/Firestore + Czat Real-Time + Kawa ☕ + Matching Wartości
 * Ekosystem: Christian Culture | Standard: Premium
 */
import * as LuminaDB from './lumina-db.js?v=20261013_notifsafe1';

class LuminaCoreEngine {
    constructor() {
        this.db = LuminaDB;
        this.currentUser = null;
        this.currentProfile = null;
        this.activeListeners = [];
        this.init();
    }

    init() {
        this.currentUser = this.db.getCurrentUser?.() || null;
        this.currentProfile = this.db.getCurrentProfile?.() || null;
        
        if (typeof this.db.onAuthChange === 'function') {
            this.db.onAuthChange((user, profile) => {
                this.currentUser = user;
                this.currentProfile = profile;
                if (user) this.listenForCoffeeInvitations();
            });
        }
        
        this.injectCoffeeModalUI();
    }

    // ==========================================
    // 1. INTENTIONAL MATCHING ENGINE (Algorytm Wartości)
    // ==========================================
    _resolveBinaryGender(profile) {
        if (!profile) return 'unknown';
        if (typeof window !== 'undefined' && typeof window.detectProfileGender === 'function') {
            return window.detectProfileGender(profile);
        }
        const g = String(profile.gender || '').toLowerCase().trim();
        if (['kobieta', 'female', 'woman', 'dziewczyna'].includes(g)) return 'female';
        if (['mezczyzna', 'mężczyzna', 'male', 'man', 'facet', 'chłopak', 'chlopak'].includes(g)) return 'male';
        const status = String(profile.status || '').toLowerCase();
        if (/(panna|mężatka|mezatka|wdowa|rozwiedziona)/.test(status)) return 'female';
        if (/(kawaler|żonaty|zonaty|wdowiec|rozwiedziony)/.test(status)) return 'male';
        return 'unknown';
    }

    calculateMatchScore(userA, userB) {
        if (!userA || !userB) return null;
        if (userA.isMissionAccount || userA.isMission || userA.isFounder ||
            userB.isMissionAccount || userB.isMission || userB.isFounder) {
            return null;
        }

        // Żelazna doktryna LUMINA: dopasowanie matrymonialne tej samej płci = 0%.
        const genderA = this._resolveBinaryGender(userA);
        const genderB = this._resolveBinaryGender(userB);
        if (genderA !== 'unknown' && genderB !== 'unknown' && genderA === genderB) {
            return 0;
        }

        let score = 50; // Baza dla przeciwnej płci / nieokreślonej pary
        const weights = {
            denomination: 25, // Zgodność wyznaniowa / wspólnotowa
            familyVision: 20, // Wizja małżeństwa i rodziny
            lifestyle: 15     // Styl życia (aktywność w kościele, pasje)
        };

        // Zgodność wyznaniowa
        if (userA.denom && userB.denom && userA.denom === userB.denom) {
            score += weights.denomination;
        } else if (userA.denomination && userB.denomination && userA.denomination === userB.denomination) {
            score += weights.denomination;
        }

        // Zgodność wartości / wizji
        const valuesA = userA.values || userA.tags || [];
        const valuesB = userB.values || userB.tags || [];
        if (Array.isArray(valuesA) && Array.isArray(valuesB)) {
            const sharedValues = valuesA.filter(v => valuesB.includes(v));
            score += Math.min(weights.familyVision, sharedValues.length * 7);
        }

        // Zbieżność pasji
        const passionsA = userA.passions || userA.hobbies || [];
        const passionsB = userB.passions || userB.hobbies || [];
        if (Array.isArray(passionsA) && Array.isArray(passionsB)) {
            const sharedPassions = passionsA.filter(p => passionsB.includes(p));
            score += Math.min(weights.lifestyle, sharedPassions.length * 5);
        }

        return Math.min(99, Math.max(50, score));
    }

    // ==========================================
    // 2. TRUST & SAFETY (Filtr Kultury Słowa)
    // ==========================================
    moderateText(text) {
        if (!text) return '';
        const prohibited = ['spam', 'kasa', 'przelew', 'pożyczka', 'wulgaryzm1', 'wulgaryzm2'];
        let cleanText = text;
        prohibited.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            cleanText = cleanText.replace(regex, '***');
        });
        return cleanText;
    }

    // ==========================================
    // 3. ZAPROSZENIE NA CHRZEŚCIJAŃSKĄ KAWĘ ☕
    // ==========================================
    async sendCoffeeInvite(receiverIdOrSlug, customNote = '') {
        const sender = this.currentProfile || this.currentUser || {
            uid: localStorage.getItem('lumina_guest_id') || 'guest_' + Date.now(),
            name: 'Użytkownik LUMINA',
            avatar: 'lumina_icon.jpg'
        };

        const sanitizedNote = this.moderateText(customNote);

        const invitePayload = {
            id: 'coffee_' + Date.now(),
            senderId: sender.uid || sender.slug,
            senderName: sender.name || 'Użytkownik LUMINA',
            senderAvatar: sender.avatar || 'lumina_icon.jpg',
            receiverId: receiverIdOrSlug,
            status: 'pending_invitation',
            note: sanitizedNote || 'Szczęść Boże! Z radością zapraszam Cię na chrześcijańską kawę ☕🕊️',
            timestamp: new Date().toISOString()
        };

        const chatId = this.db.getChatId ? this.db.getChatId(invitePayload.senderId, receiverIdOrSlug) : `${invitePayload.senderId}_${receiverIdOrSlug}`;
        
        if (this.db.sendDirectMessageToCloud) {
            await this.db.sendDirectMessageToCloud(chatId, {
                ...invitePayload,
                text: `☕ ${invitePayload.note}`,
                type: 'coffee_invite'
            });
        }

        if (typeof window.showToast === 'function') {
            window.showToast('Zaproszenie na Chrześcijańską Kawę ☕ zostało wysłane!');
        }
        return invitePayload;
    }

    // ==========================================
    // 4. NASŁUCHIWANIE I OBSŁUGA ZAPROSZEŃ
    // ==========================================
    listenForCoffeeInvitations() {
        const myUid = this.currentUser?.uid || this.currentProfile?.slug;
        if (!myUid) return;

        // Subskrypcja czatów z zaproszeniami na kawę
        if (this.db.subscribeToUserChats) {
            this.db.subscribeToUserChats(myUid, (chats) => {
                if (!chats || !chats.length) return;
                const lastChat = chats[0];
                if (lastChat.lastMessageText && lastChat.lastMessageText.includes('☕') && lastChat.lastSenderId !== myUid) {
                    this.displayCoffeeInviteNotification({
                        id: lastChat.id,
                        senderId: lastChat.lastSenderId,
                        senderName: lastChat.lastSenderName || 'Użytkownik LUMINA',
                        senderAvatar: lastChat.lastSenderAvatar || 'lumina_icon.jpg',
                        note: lastChat.lastMessageText
                    });
                }
            });
        }
    }

    displayCoffeeInviteNotification(invite) {
        const modal = document.getElementById('lumina-coffee-modal');
        if (!modal) return;

        const nameEl = document.getElementById('coffee-modal-sender-name');
        const noteEl = document.getElementById('coffee-modal-note');
        const avatarEl = document.getElementById('coffee-modal-avatar');
        const btnAccept = document.getElementById('coffee-btn-accept');
        const btnDecline = document.getElementById('coffee-btn-decline');

        if (nameEl) nameEl.textContent = invite.senderName;
        if (noteEl) noteEl.textContent = invite.note;
        if (avatarEl) avatarEl.src = invite.senderAvatar || 'lumina_icon.jpg';

        if (btnAccept) btnAccept.onclick = () => this.respondCoffeeInvite(invite, 'accepted');
        if (btnDecline) btnDecline.onclick = () => this.respondCoffeeInvite(invite, 'declined');

        modal.classList.add('active');
    }

    async respondCoffeeInvite(invite, responseType) {
        const myUid = this.currentUser?.uid || this.currentProfile?.slug || 'me';
        const chatId = this.db.getChatId ? this.db.getChatId(myUid, invite.senderId) : `${myUid}_${invite.senderId}`;

        if (responseType === 'accepted') {
            await this.db.sendDirectMessageToCloud?.(chatId, {
                senderId: myUid,
                senderName: this.currentProfile?.name || 'Ja',
                receiverId: invite.senderId,
                text: '☕ Z radością przyjmuję zaproszenie na kawę! Miło mi Cię poznać. Niech Bóg błogosławi naszą rozmowę ✨',
                type: 'coffee_accepted',
                timestamp: new Date().toISOString()
            });
            if (typeof window.showToast === 'function') {
                window.showToast(`Przyjąłeś zaproszenie na kawę od ${invite.senderName}! ☕✨`);
            }
            if (typeof window.openMessageModal === 'function') {
                window.openMessageModal(invite.senderName, invite.senderAvatar, invite.senderId);
            }
        } else {
            await this.db.sendDirectMessageToCloud?.(chatId, {
                senderId: myUid,
                senderName: this.currentProfile?.name || 'Ja',
                receiverId: invite.senderId,
                text: '🙏 Dziękuję serdecznie za zaproszenie. Z modlitwą i życzeniami Bożego pokoju.',
                type: 'coffee_declined',
                timestamp: new Date().toISOString()
            });
            if (typeof window.showToast === 'function') {
                window.showToast('Wysłano odpowiedź: Z modlitwą dziękuję 🙏');
            }
        }
        this.closeCoffeeNotificationModal();
    }

    closeCoffeeNotificationModal() {
        const modal = document.getElementById('lumina-coffee-modal');
        if (modal) modal.classList.remove('active');
    }

    // ==========================================
    // 5. INIEKCJA UI MODALA KAWY (Harmonijny styl LUMINA)
    // ==========================================
    injectCoffeeModalUI() {
        if (document.getElementById('lumina-coffee-modal')) return;

        const modalHtml = `
        <div id="lumina-coffee-modal" class="coffee-modal-overlay" style="display:none; position:fixed; inset:0; background:rgba(7,14,36,0.88); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); z-index:100000; align-items:center; justify-content:center;">
            <div class="coffee-modal-card" style="background:#0b1838; border-radius:24px; max-width:440px; width:92%; padding:28px 24px; text-align:center; box-shadow:0 24px 55px rgba(0,0,0,0.85), 0 0 30px rgba(245,158,11,0.25); border:1.5px solid rgba(245,158,11,0.4);">
                <div style="width:68px; height:68px; margin:0 auto 14px; border-radius:50%; background:linear-gradient(135deg, rgba(234,179,8,0.2), rgba(168,85,247,0.2)); display:flex; align-items:center; justify-content:center; border:2px solid #facc15; box-shadow:0 0 20px rgba(250,204,21,0.35);">
                    <i class="fa-solid fa-mug-hot" style="font-size:1.8rem; color:#facc15;"></i>
                </div>
                <h3 style="color:#ffffff; font-size:1.3rem; font-weight:800; font-family:'Outfit',sans-serif; margin-bottom:8px;">Zaproszenie na Chrześcijańską Kawę</h3>
                <img id="coffee-modal-avatar" src="lumina_icon.jpg" style="width:64px; height:64px; border-radius:50%; object-fit:cover; margin:10px auto; border:2px solid #f59e0b;" alt="Avatar" onerror="this.onerror=null; this.src='lumina_icon.jpg';">
                <h4 id="coffee-modal-sender-name" style="color:#f8fafc; font-size:1.05rem; font-weight:700; margin-bottom:6px;">Użytkownik LUMINA</h4>
                <p id="coffee-modal-note" style="color:#cbd5e1; font-size:0.88rem; font-style:italic; margin-bottom:22px; line-height:1.5; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:12px;"></p>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <button id="coffee-btn-accept" style="background:linear-gradient(135deg, #f59e0b, #d97706); color:#fff; border:none; padding:12px; border-radius:14px; font-weight:700; font-size:0.9rem; cursor:pointer; box-shadow:0 6px 18px rgba(245,158,11,0.35); transition:transform 0.2s;">Przyjmij ☕</button>
                    <button id="coffee-btn-decline" style="background:rgba(255,255,255,0.08); color:#cbd5e1; border:1px solid rgba(255,255,255,0.15); padding:12px; border-radius:14px; font-weight:600; font-size:0.86rem; cursor:pointer; transition:background 0.2s;">Z modlitwą dziękuję 🙏</button>
                </div>
            </div>
        </div>
        <style>
            #lumina-coffee-modal.active { display: flex !important; animation: fadeIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }
            @keyframes fadeIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
        </style>`;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    // ==========================================
    // 6. HELPERY TABLICY I PROFILI
    // ==========================================
    listenToLiveFeed(onUpdate) {
        return this.db.subscribeToFeedPosts ? this.db.subscribeToFeedPosts(onUpdate) : () => {};
    }

    listenToChatMessages(chatPartnerId, onMessagesReceived) {
        const myId = this.currentUser?.uid || this.currentProfile?.slug || 'guest';
        const chatId = this.db.getChatId ? this.db.getChatId(myId, chatPartnerId) : `${myId}_${chatPartnerId}`;
        return this.db.subscribeToDirectMessages ? this.db.subscribeToDirectMessages(chatId, onMessagesReceived) : () => {};
    }

    async sendMessage(chatPartnerId, text) {
        const myId = this.currentUser?.uid || this.currentProfile?.slug || 'guest';
        const chatId = this.db.getChatId ? this.db.getChatId(myId, chatPartnerId) : `${myId}_${chatPartnerId}`;
        return await this.db.sendDirectMessageToCloud(chatId, {
            senderId: myId,
            senderName: this.currentProfile?.name || this.currentUser?.displayName || 'Użytkownik LUMINA',
            senderAvatar: this.currentProfile?.avatar || this.currentUser?.photoURL || 'lumina_icon.jpg',
            receiverId: chatPartnerId,
            text: text
        });
    }

    async saveUserProfile(userData) {
        const uid = userData.uid || userData.slug || (this.currentUser ? this.currentUser.uid : 'user_' + Date.now());
        return await this.db.saveProfileToCloud(uid, userData);
    }
}

// Global Universal Logout Handler for Profiles & Nav
window.handleLogout = async function(redirectUrl = 'lumina.html') {
    try {
        if (window.LuminaDB && typeof window.LuminaDB.logoutUser === 'function') {
            await window.LuminaDB.logoutUser();
        }
    } catch(e) {
        console.warn('Lumina Logout notice:', e);
    }

    try {
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
            const k = sessionStorage.key(i);
            if (k && (k.startsWith('lumina_auth_owner_') || k.startsWith('lumina_auth_master_'))) {
                sessionStorage.removeItem(k);
            }
        }
    } catch(e) {}

    localStorage.removeItem('lumina_current_user_profile');
    localStorage.removeItem('lumina_auth_token');
    
    if (typeof window.showToast === 'function') {
        window.showToast('Wylogowano pomyślnie z aplikacji LUMINA 👋');
    } else {
        alert('Wylogowano pomyślnie z aplikacji LUMINA 👋');
    }

    setTimeout(() => {
        if (redirectUrl) {
            window.location.href = redirectUrl;
        } else {
            window.location.reload();
        }
    }, 600);
};

window.LuminaCore = new LuminaCoreEngine();
export default window.LuminaCore;
