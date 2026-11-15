/**
 * LUMINA Shared Accessibility Shell (EkoCC v2 PREMIUM — WCAG 2.2 AA)
 * Ujednolica obsługę klawiatury, atrybuty ARIA, zamykanie klawiszem Escape,
 * focus trap w oknie dialogowym Szybkich Akcji oraz synchronizację szuflady #topNavDrawer.
 */
(function (root) {
    'use strict';

    const initializedDocs = new WeakSet();
    const FOCUSABLE_SELECTOR = [
        'a[href]',
        'area[href]',
        'button:not([disabled])',
        'input:not([disabled]):not([type="hidden"])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    function isElementVisible(win, el) {
        if (!el || el.hasAttribute('hidden') || el.closest('[hidden]')) return false;
        if (el.style && el.style.display === 'none') return false;
        if (el.style && el.style.visibility === 'hidden') return false;
        if (win && typeof win.getComputedStyle === 'function') {
            try {
                const cs = win.getComputedStyle(el);
                if (cs && (cs.display === 'none' || cs.visibility === 'hidden')) return false;
            } catch (_) { /* noop */ }
        }
        return true;
    }

    function getFocusableElements(container, win) {
        if (!container || typeof container.querySelectorAll !== 'function') return [];
        const nodes = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
        return nodes.filter((el) => isElementVisible(win, el));
    }

    function isDrawerOpen(drawer) {
        if (!drawer) return false;
        if (drawer.classList && drawer.classList.contains('open')) return true;
        const display = drawer.style ? drawer.style.display : '';
        return Boolean(display && display !== 'none');
    }

    function isModalOpen(modal) {
        if (!modal) return false;
        if (modal.classList && modal.classList.contains('open')) return true;
        const display = modal.style ? modal.style.display : '';
        return Boolean(display && display !== 'none');
    }

    function init(targetDoc) {
        const doc = targetDoc || (typeof document !== 'undefined' ? document : null);
        if (!doc || typeof doc.getElementById !== 'function') return null;
        const win = doc.defaultView || (typeof window !== 'undefined' ? window : root);

        if (initializedDocs.has(doc)) {
            return win.__luminaA11yShell || null;
        }
        initializedDocs.add(doc);

        const drawer = doc.getElementById('topNavDrawer');
        const menuBtn = doc.getElementById('topNavMenuBtn');
        const modal = doc.getElementById('luminaProfileQuickActionsModal');

        let lastTriggerBeforeModal = null;
        let wasModalOpen = isModalOpen(modal);

        function ensureDrawerAttributes() {
            if (menuBtn) {
                if (!menuBtn.getAttribute('aria-haspopup')) {
                    menuBtn.setAttribute('aria-haspopup', 'true');
                }
                if (!menuBtn.getAttribute('aria-controls')) {
                    menuBtn.setAttribute('aria-controls', 'topNavDrawer');
                }
                const icon = menuBtn.querySelector('i');
                if (icon && !icon.hasAttribute('aria-hidden')) {
                    icon.setAttribute('aria-hidden', 'true');
                }
            }
            if (drawer) {
                if (!drawer.getAttribute('role')) {
                    drawer.setAttribute('role', 'region');
                }
                if (!drawer.getAttribute('aria-label') && !drawer.getAttribute('aria-labelledby')) {
                    drawer.setAttribute('aria-label', 'Menu nawigacji LUMINA');
                }
            }
        }

        function syncDrawerState() {
            if (!drawer) return;
            const open = isDrawerOpen(drawer);
            if (menuBtn) {
                menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
            }
            drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
        }

        function closeDrawer(restoreFocus) {
            if (!drawer) return;
            if (typeof win.closeTopNavDrawer === 'function' && !win.closeTopNavDrawer.__ccClosing) {
                win.closeTopNavDrawer();
            } else {
                drawer.classList.remove('open');
                drawer.style.display = 'none';
            }
            syncDrawerState();
            if (restoreFocus && menuBtn && typeof menuBtn.focus === 'function') {
                try {
                    menuBtn.focus({ preventScroll: true });
                } catch (_) {
                    menuBtn.focus();
                }
            }
        }

        function ensureModalAttributes() {
            if (!modal) return;
            if (!modal.getAttribute('role')) {
                modal.setAttribute('role', 'dialog');
            }
            if (!modal.getAttribute('aria-modal')) {
                modal.setAttribute('aria-modal', 'true');
            }
            const qaName = doc.getElementById('qaName');
            if (qaName && !modal.getAttribute('aria-labelledby')) {
                modal.setAttribute('aria-labelledby', 'qaName');
            }
            const closeBtn = modal.querySelector('.qa-close-btn');
            if (closeBtn && !closeBtn.getAttribute('aria-label')) {
                closeBtn.setAttribute('aria-label', 'Zamknij');
            }
        }

        function focusFirstModalControl() {
            if (!modal) return;
            if (doc.activeElement && modal.contains(doc.activeElement)) return;
            const focusables = getFocusableElements(modal, win);
            const preferred = modal.querySelector('.qa-action-btn') || focusables[0] || modal.querySelector('.qa-close-btn');
            if (preferred && typeof preferred.focus === 'function') {
                try {
                    preferred.focus({ preventScroll: true });
                } catch (_) {
                    preferred.focus();
                }
            }
        }

        function restoreTriggerFocus() {
            const trigger = lastTriggerBeforeModal;
            lastTriggerBeforeModal = null;
            if (!trigger || trigger.isConnected === false || typeof trigger.focus !== 'function') return;
            const active = doc.activeElement;
            if (!active || active === doc.body || active === doc.documentElement || (modal && modal.contains(active))) {
                try {
                    trigger.focus({ preventScroll: true });
                } catch (_) {
                    trigger.focus();
                }
            }
        }

        function syncModalState() {
            if (!modal) return;
            const open = isModalOpen(modal);
            modal.setAttribute('aria-hidden', open ? 'false' : 'true');
            if (open && !wasModalOpen) {
                wasModalOpen = true;
                focusFirstModalControl();
            } else if (!open && wasModalOpen) {
                wasModalOpen = false;
                restoreTriggerFocus();
            }
        }

        function closeModal(restoreFocus) {
            if (!modal) return;
            if (typeof win.closeProfileQuickActions === 'function' && !win.closeProfileQuickActions.__ccClosing) {
                win.closeProfileQuickActions();
            } else {
                modal.classList.remove('open');
                modal.style.display = 'none';
            }
            wasModalOpen = false;
            modal.setAttribute('aria-hidden', 'true');
            if (restoreFocus) {
                restoreTriggerFocus();
            }
        }

        function wrapGlobalDrawerFns() {
            if (typeof win.toggleTopNavDrawer === 'function' && !win.toggleTopNavDrawer.__ccA11yWrapped) {
                const origToggle = win.toggleTopNavDrawer;
                const wrappedToggle = function () {
                    const res = origToggle.apply(this, arguments);
                    syncDrawerState();
                    return res;
                };
                wrappedToggle.__ccA11yWrapped = true;
                win.toggleTopNavDrawer = wrappedToggle;
            }
            if (typeof win.closeTopNavDrawer === 'function' && !win.closeTopNavDrawer.__ccA11yWrapped) {
                const origClose = win.closeTopNavDrawer;
                const wrappedClose = function () {
                    if (wrappedClose.__ccClosing) return;
                    wrappedClose.__ccClosing = true;
                    try {
                        return origClose.apply(this, arguments);
                    } finally {
                        wrappedClose.__ccClosing = false;
                        syncDrawerState();
                    }
                };
                wrappedClose.__ccA11yWrapped = true;
                win.closeTopNavDrawer = wrappedClose;
            }
        }

        function wrapGlobalModalFns() {
            if (!modal) return;
            if (typeof win.openProfileQuickActions === 'function' && !win.openProfileQuickActions.__ccA11yWrapped) {
                const origOpen = win.openProfileQuickActions;
                const wrappedOpen = function () {
                    if (!isModalOpen(modal) && doc.activeElement && !modal.contains(doc.activeElement)) {
                        lastTriggerBeforeModal = doc.activeElement;
                    }
                    const res = origOpen.apply(this, arguments);
                    syncModalState();
                    return res;
                };
                wrappedOpen.__ccA11yWrapped = true;
                win.openProfileQuickActions = wrappedOpen;
            }
            if (typeof win.closeProfileQuickActions === 'function' && !win.closeProfileQuickActions.__ccA11yWrapped) {
                const origCloseModal = win.closeProfileQuickActions;
                const wrappedCloseModal = function () {
                    if (wrappedCloseModal.__ccClosing) return;
                    wrappedCloseModal.__ccClosing = true;
                    try {
                        return origCloseModal.apply(this, arguments);
                    } finally {
                        wrappedCloseModal.__ccClosing = false;
                        syncModalState();
                    }
                };
                wrappedCloseModal.__ccA11yWrapped = true;
                win.closeProfileQuickActions = wrappedCloseModal;
            }
        }

        ensureDrawerAttributes();
        syncDrawerState();
        ensureModalAttributes();
        if (modal) {
            modal.setAttribute('aria-hidden', wasModalOpen ? 'false' : 'true');
        }
        wrapGlobalDrawerFns();
        wrapGlobalModalFns();

        doc.addEventListener('focusin', function (event) {
            if (!modal || isModalOpen(modal)) return;
            const target = event.target;
            if (target && !modal.contains(target) && target !== doc.body && target !== doc.documentElement) {
                lastTriggerBeforeModal = target;
            }
        });

        doc.addEventListener('click', function () {
            if (drawer) syncDrawerState();
        });

        doc.addEventListener('keydown', function (event) {
            if (!event) return;

            if (modal && isModalOpen(modal)) {
                if (event.key === 'Escape') {
                    event.preventDefault();
                    event.stopPropagation();
                    closeModal(true);
                    return;
                }
                if (event.key === 'Tab') {
                    const focusables = getFocusableElements(modal, win);
                    if (!focusables.length) {
                        event.preventDefault();
                        return;
                    }
                    const first = focusables[0];
                    const last = focusables[focusables.length - 1];
                    const active = doc.activeElement;
                    if (event.shiftKey) {
                        if (active === first || !modal.contains(active)) {
                            event.preventDefault();
                            last.focus();
                        }
                    } else if (active === last || !modal.contains(active)) {
                        event.preventDefault();
                        first.focus();
                    }
                    return;
                }
            }

            if (drawer && isDrawerOpen(drawer) && event.key === 'Escape') {
                event.preventDefault();
                closeDrawer(true);
            }
        });

        const Observer = win.MutationObserver || (typeof MutationObserver !== 'undefined' ? MutationObserver : null);
        if (Observer) {
            if (drawer) {
                const drawerObserver = new Observer(function () {
                    syncDrawerState();
                });
                drawerObserver.observe(drawer, { attributes: true, attributeFilter: ['class', 'style'] });
            }
            if (modal) {
                const modalObserver = new Observer(function () {
                    syncModalState();
                });
                modalObserver.observe(modal, { attributes: true, attributeFilter: ['class', 'style'] });
            }
        }

        const api = {
            init: init,
            syncDrawerState: syncDrawerState,
            syncModalState: syncModalState,
            getFocusableElements: function (container) {
                return getFocusableElements(container || modal, win);
            }
        };
        win.__luminaA11yShell = api;
        return api;
    }

    root.__luminaA11yShell = root.__luminaA11yShell || {
        init: init,
        getFocusableElements: getFocusableElements
    };

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () {
                init(document);
            });
        } else {
            init(document);
        }
    }
})(typeof window !== 'undefined' ? window : globalThis);
