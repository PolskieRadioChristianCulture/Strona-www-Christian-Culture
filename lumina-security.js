/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA SECURITY ENGINE (lumina-security.js)
 * Master Administrator Exclusive Access & Self-Only User Profile Editing
 * Ekosystem: Christian Culture | Standard: Enterprise Grade
 * ══════════════════════════════════════════════════════════════════════════
 */

import * as LuminaDB from './lumina-db.js?v=20261013_notifsafe1';

class LuminaSecurityEngine {
    constructor() {
        this.db = LuminaDB;
        this.adminEmails = [
            'polskieradio.cc@gmail.com',
            'czarkr@gmail.com',
            'nazirczarkes@gmail.com'
        ];
    }

    /**
     * Sprawdza czy bieżący użytkownik jest zweryfikowanym Głównym Administratorem Portalu (Firebase Auth).
     */
    isMasterAdmin() {
        return Boolean(
            (typeof window !== 'undefined' && window.LuminaGuard && typeof window.LuminaGuard.isMasterAdmin === 'function' && window.LuminaGuard.isMasterAdmin()) ||
            (this.db && typeof this.db.isLuminaMasterAdmin === 'function' && this.db.isLuminaMasterAdmin())
        );
    }

    _purgeLegacyAdminStorage() {
        const keys = [
            'lumina_auth_master_admin',
            'lumina_admin',
            'lumina_admin_unlocked',
            'lumina_auth_owner_cezaryrgowski',
            'lumina_private_access_cezaryrgowski'
        ];
        keys.forEach((k) => {
            try { sessionStorage.removeItem(k); } catch (_) {}
            try { localStorage.removeItem(k); } catch (_) {}
        });
    }

    /**
     * Uwierzytelnienie wyłącznie przez Firebase Auth (brak lokalnych PIN-ów / flag w Storage).
     */
    async unlockMasterAdmin() {
        this._purgeLegacyAdminStorage();
        if (this.isMasterAdmin()) {
            if (typeof document !== 'undefined' && document.body) {
                document.body.classList.add('lumina-admin-mode', 'owner-mode-active');
            }
            return true;
        }
        if (typeof window !== 'undefined') {
            if (typeof window.openAuthModal === 'function') window.openAuthModal('login');
            else if (typeof window.triggerLuminaLoginModal === 'function') window.triggerLuminaLoginModal();
        }
        return false;
    }

    /**
     * Blokada uprawnień Administratora (wylogowanie sesji Firebase / czyszczenie UI).
     */
    lockMasterAdmin() {
        this._purgeLegacyAdminStorage();
        if (typeof document !== 'undefined' && document.body) {
            document.body.classList.remove('lumina-admin-mode');
            document.body.classList.remove('owner-mode-active');
        }
        if (this.db && typeof this.db.logout === 'function' && this.isMasterAdmin()) {
            this.db.logout().catch(() => {});
        }
    }

    /**
     * Ścisła weryfikacja uprawnień do edycji profilu:
     * - Administrator ma wyłączny dostęp do edycji DOWOLNEGO profilu i kanału misyjnego.
     * - Zwykły użytkownik może edytować WYŁĄCZNIE swój własny profil.
     * - Niezalogowany gość ma dostęp wyłącznie do odczytu.
     */
    canEditProfile(targetSlug, targetUid = null) {
        if (!targetSlug) return false;
        
        // 1. Główny Administrator portalu -> pełna wyłączność na edycję każdego profilu
        if (this.isMasterAdmin()) return true;

        // Kanały misyjne mogą być edytowane WYŁĄCZNIE przez Administratora Portalu
        const missionSlugs = ['ccwomen', 'ccmen', 'osobowoscplus', 'radiocc', 'cctv'];
        if (missionSlugs.includes(targetSlug.toLowerCase())) {
            return false;
        }

        // 2. Zwykły zalogowany użytkownik -> sprawdzenie czy edytuje SWÓJ WŁASNY profil
        try {
            const curUser = this.db.getCurrentUser?.();
            const curProf = this.db.getCurrentProfile?.() || JSON.parse(localStorage.getItem('lumina_current_user_profile') || 'null');

            if (!curUser && !curProf) return false; // Niezalogowany -> brak uprawnień

            // Porównanie po UID
            if (curUser && targetUid && curUser.uid === targetUid) return true;
            if (curUser && curUser.uid === targetSlug) return true;

            // Porównanie po Slug własnego profilu
            if (curProf && curProf.slug && curProf.slug.toLowerCase() === targetSlug.toLowerCase()) return true;
            if (curProf && curProf.uid && curProf.uid === targetSlug) return true;
            if (curProf && targetUid && curProf.uid === targetUid) return true;
        } catch(e) {}

        return false;
    }
}

// Singleton na oknie globalnym
window.LuminaSecurity = new LuminaSecurityEngine();

export const isMasterAdmin = () => window.LuminaSecurity.isMasterAdmin();
export const unlockMasterAdmin = (pin) => window.LuminaSecurity.unlockMasterAdmin(pin);
export const lockMasterAdmin = () => window.LuminaSecurity.lockMasterAdmin();
export const canEditProfile = (slug, uid) => window.LuminaSecurity.canEditProfile(slug, uid);
