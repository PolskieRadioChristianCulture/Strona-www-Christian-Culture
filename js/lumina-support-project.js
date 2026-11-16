(function () {
    'use strict';

    const SUPPORT_BUTTON_CLASS = 'lumina-support-project-btn';
    const MODAL_ID = 'luminaSupportProjectModal';
    const BLIK_NUMBER = '537137043';
    const BLIK_LABEL = '537 137 043';

    // Klasy i identyfikatory kart-nagłówków live/broadcast/transmisji/stream wykluczonych z dekoracji.
    // Regex: live|broadcast|transmisj|stream — używany do weryfikacji testowej i dokumentacji.
    const LIVE_HEADER_EXCLUSION_RE = /live|broadcast|transmisj|stream/;

    function isEligiblePost(card) {
        if (!(card instanceof HTMLElement)) return false;
        // Wyklucz nagłówek transmisji TV na samej górze tablicy
        // (pasuje do wzorca: live|broadcast|transmisj|stream — patrz LIVE_HEADER_EXCLUSION_RE)
        if (card.id === 'card_live_tablica_community' || card.classList.contains('lumina-live-card-highlight')) {
            return false;
        }
        return true;
    }

    function getMediaHosts(card) {
        const hosts = [];

        // 1. Explicit wrappers used across Tablica and Profiles (excluding static live TV header card)
        const wraps = card.querySelectorAll(
            '.media-container-1x1, .campaign-media-container, .broadcast-preview-wrap, .video-wrapper, .rich-youtube-embed, .post-media-wrap, .aspect-ratio-9-16, .mission-live-player-wrapper, [id^="livePlayerWrap_"], .lumina-video-wrapper'
        );
        wraps.forEach(w => {
            if (!w.closest('#card_live_tablica_community, .lumina-live-card-highlight, .rich-og-preview-card, .og-preview, .link-preview')) {
                hosts.push(w);
            }
        });

        // 2. Images inside post (post-image, reflection covers, content photos, excluding avatars and link preview thumbnails)
        const imgs = card.querySelectorAll('img.post-image, .post-content img, .post-content-pro img, .reflection-card-cover, .reflection-link img, .post-body img, .post-details-box img');
        imgs.forEach(img => {
            const isAvatar = img.closest('.post-author-box, .post-avatar, .post-header, .post-header-pro, .quick-post-avatar, .author-avatar, .avatar, .modal-author-avatar');
            const isThumb = img.closest('.rich-og-thumb-wrapper, .rich-og-preview-card, .link-preview-card, .og-preview');
            const isSmall = (img.naturalWidth > 0 && img.naturalWidth < 120) || img.classList.contains('emoji') || img.classList.contains('icon');
            if (!isAvatar && !isThumb && !isSmall && !hosts.some(h => h.contains(img))) {
                const parent = img.parentElement;
                if (parent && parent !== card && parent.tagName !== 'A' && !parent.closest('header, .post-top-header, .post-header-pro')) {
                    hosts.push(parent);
                } else if (parent && parent.tagName === 'A' && parent.parentElement && parent.parentElement !== card) {
                    hosts.push(parent.parentElement);
                }
            }
        });

        // 3. Videos and embedded players
        const mediaTags = card.querySelectorAll('video, iframe');
        mediaTags.forEach(el => {
            const isHeaderTV = el.closest('#card_live_tablica_community, .lumina-live-card-highlight');
            const isThumb = el.closest('.rich-og-preview-card, .link-preview-card');
            if (!isHeaderTV && !isThumb && !hosts.some(h => h.contains(el))) {
                const liveWrap = el.closest('.mission-live-player-wrapper, [id^="livePlayerWrap_"], .media-container-1x1');
                const parent = liveWrap || el.parentElement;
                if (parent && parent !== card) {
                    hosts.push(parent);
                }
            }
        });

        return [...new Set(hosts)];
    }

    function createSupportButton() {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = SUPPORT_BUTTON_CLASS;
        button.setAttribute('aria-haspopup', 'dialog');
        button.setAttribute('aria-controls', MODAL_ID);
        button.innerHTML = '<i class="fa-solid fa-heart" aria-hidden="true"></i><span>Wspieraj projekt</span>';
        button.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            openModal();
        });
        return button;
    }

    function decoratePost(card) {
        if (!isEligiblePost(card)) return;

        const mediaHosts = getMediaHosts(card);
        if (mediaHosts.length > 0) {
            // Jedna akcja wsparcia na kartę. Umieszczana bezpośrednio na elemencie graficznym / odtwarzaczu.
            const host = mediaHosts[0];
            const existingButtons = Array.from(card.querySelectorAll(`.${SUPPORT_BUTTON_CLASS}`));
            const button = existingButtons.shift() || createSupportButton();
            existingButtons.forEach(element => element.remove());
            host.setAttribute('data-lumina-media-host', 'true');
            if (window.getComputedStyle(host).position === 'static') {
                host.style.position = 'relative';
            }
            if (button.parentElement !== host) host.appendChild(button);
        } else {
            // Post bez multimediów/grafiki — umieść w stopce akcji jeśli istnieje, lub wyczyść
            const fallbackHost = card.querySelector('.post-actions, .post-action-row, .post-footer-actions, .post-footer');
            if (fallbackHost && !card.querySelector(`.${SUPPORT_BUTTON_CLASS}`)) {
                fallbackHost.appendChild(createSupportButton());
            } else if (!fallbackHost) {
                const existingButtons = Array.from(card.querySelectorAll(`.${SUPPORT_BUTTON_CLASS}`));
                existingButtons.forEach(element => element.remove());
            }
        }
    }

    function decoratePosts(root) {
        if (!(root instanceof Element || root instanceof Document)) return;
        if (root.matches?.('.post-card, .post-card-1x1')) decoratePost(root);
        root.querySelectorAll?.('.post-card').forEach(decoratePost);
        root.querySelectorAll?.('.post-card-1x1').forEach(decoratePost);
    }

    function copyBlik() {
        const done = () => {
            if (typeof window.showToast === 'function') {
                window.showToast(`Skopiowano numer BLIK: ${BLIK_LABEL}`);
            }
        };
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(BLIK_NUMBER).then(done).catch(() => fallbackCopy(done));
        } else {
            fallbackCopy(done);
        }
    }

    function fallbackCopy(done) {
        const input = document.createElement('textarea');
        input.value = BLIK_NUMBER;
        input.setAttribute('readonly', '');
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        try { document.execCommand('copy'); } catch (error) {}
        input.remove();
        done();
    }

    function closeModal() {
        const modal = document.getElementById(MODAL_ID);
        if (!modal) return;
        modal.hidden = true;
        document.body.classList.remove('lumina-support-modal-open');
    }

    function openModal() {
        const modal = ensureModal();
        modal.hidden = false;
        document.body.classList.add('lumina-support-modal-open');
        modal.querySelector('.lumina-support-modal-close')?.focus();
    }

    function ensureModal() {
        const existing = document.getElementById(MODAL_ID);
        if (existing) return existing;

        const modal = document.createElement('div');
        modal.id = MODAL_ID;
        modal.className = 'lumina-support-modal';
        modal.hidden = true;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'luminaSupportProjectTitle');
        modal.innerHTML = `
            <div class="lumina-support-modal-backdrop" data-support-close></div>
            <section class="lumina-support-modal-card">
                <button type="button" class="lumina-support-modal-close" data-support-close aria-label="Zamknij okno wsparcia">
                    <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                </button>
                <div class="lumina-support-modal-icon"><i class="fa-solid fa-heart" aria-hidden="true"></i></div>
                <h2 id="luminaSupportProjectTitle">Wspieraj projekt</h2>
                <p>Wspieraj misję Christian Culture — wybierz najprostszy dla Ciebie sposób.</p>
                <div class="lumina-support-methods">
                    <button type="button" class="lumina-support-method lumina-support-blik">
                        <i class="fa-solid fa-mobile-screen-button" aria-hidden="true"></i>
                        <span><strong>BLIK</strong><small>${BLIK_LABEL} · dotknij, aby skopiować</small></span>
                    </button>
                    <a class="lumina-support-method lumina-support-revolut" href="https://revolut.me/christianculture" target="_blank" rel="noopener noreferrer">
                        <i class="fa-solid fa-bolt" aria-hidden="true"></i>
                        <span><strong>Revolut</strong><small>Szybkie wsparcie online</small></span>
                    </a>
                    <a class="lumina-support-method lumina-support-patronite" href="https://patronite.pl/osobowoscplus" target="_blank" rel="noopener noreferrer">
                        <i class="fa-solid fa-hand-holding-heart" aria-hidden="true"></i>
                        <span><strong>Patronite</strong><small>Regularne wsparcie misji</small></span>
                    </a>
                </div>
            </section>`;
        document.body.appendChild(modal);
        modal.querySelectorAll('[data-support-close]').forEach(element => element.addEventListener('click', closeModal));
        modal.querySelector('.lumina-support-blik')?.addEventListener('click', copyBlik);
        return modal;
    }

    function installStyles() {
        if (document.getElementById('luminaSupportProjectStyles')) return;
        const style = document.createElement('style');
        style.id = 'luminaSupportProjectStyles';
        style.textContent = `
            .${SUPPORT_BUTTON_CLASS}{position:absolute;bottom:12px;left:12px;z-index:15;display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:44px;padding:8px 16px;border:1px solid rgba(255,255,255,.25);border-radius:999px;background:rgba(15,23,42,.65);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:#f8fafc;font:700 .78rem/1.1 inherit;cursor:pointer;box-shadow:0 4px 18px rgba(0,0,0,.5);transition:background .2s ease,transform .2s ease,border-color .2s ease,box-shadow .2s ease;pointer-events:auto}
            .${SUPPORT_BUTTON_CLASS}:hover{background:rgba(190,24,93,.85);border-color:rgba(251,113,133,.8);transform:translateY(-2px);box-shadow:0 6px 22px rgba(225,29,72,.45)}
            .${SUPPORT_BUTTON_CLASS} i{color:#fb7185;font-size:.85rem;filter:drop-shadow(0 0 5px rgba(251,113,133,.6))}
            .post-actions .${SUPPORT_BUTTON_CLASS},.post-action-row .${SUPPORT_BUTTON_CLASS},.post-footer .${SUPPORT_BUTTON_CLASS},.post-footer-actions .${SUPPORT_BUTTON_CLASS}{position:static;margin-left:auto}
            .lumina-support-modal[hidden]{display:none!important}.lumina-support-modal{position:fixed;inset:0;z-index:100000;display:grid;place-items:center;padding:18px}.lumina-support-modal-backdrop{position:absolute;inset:0;background:rgba(2,6,23,.76);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
            .lumina-support-modal-card{box-sizing:border-box;position:relative;width:min(100%,460px);padding:28px 22px 22px;border:1px solid rgba(255,255,255,.16);border-radius:24px;background:linear-gradient(145deg,#111c37,#080e1f);box-shadow:0 28px 70px rgba(0,0,0,.62);color:#fff;text-align:center}.lumina-support-modal-close{position:absolute;top:12px;right:12px;width:40px;height:40px;border:1px solid rgba(255,255,255,.14);border-radius:50%;background:rgba(255,255,255,.07);color:#fff;cursor:pointer}.lumina-support-modal-icon{display:grid;place-items:center;width:58px;height:58px;margin:0 auto 12px;border-radius:18px;background:linear-gradient(135deg,#ec4899,#be123c);font-size:1.4rem}.lumina-support-modal-card h2{margin:0 0 8px;font:800 1.5rem/1.2 'Outfit',sans-serif}.lumina-support-modal-card>p{margin:0 auto 18px;color:#cbd5e1;font-size:.88rem;line-height:1.5}.lumina-support-methods{display:grid;gap:10px}.lumina-support-method{box-sizing:border-box;display:flex;align-items:center;gap:13px;width:100%;min-height:62px;padding:11px 14px;border:1px solid rgba(255,255,255,.13);border-radius:16px;color:#fff;text-align:left;text-decoration:none;cursor:pointer}.lumina-support-method>i{display:grid;place-items:center;width:38px;height:38px;flex:0 0 38px;border-radius:12px;background:rgba(255,255,255,.13)}.lumina-support-method span{display:grid;gap:3px}.lumina-support-method strong{font-size:.92rem}.lumina-support-method small{color:#e2e8f0;font-size:.73rem}.lumina-support-blik{background:linear-gradient(135deg,#7c3aed,#5b21b6)}.lumina-support-revolut{background:linear-gradient(135deg,#087bea,#0754c7)}.lumina-support-patronite{background:linear-gradient(135deg,#e11d48,#be123c)}body.lumina-support-modal-open{overflow:hidden!important}
            @media(max-width:768px){.${SUPPORT_BUTTON_CLASS}{bottom:10px;left:10px;min-height:44px;padding:8px 14px;font-size:.78rem}.lumina-support-modal{padding:10px}.lumina-support-modal-card{padding:26px 14px 16px;border-radius:20px}.lumina-support-method{min-height:58px}}
            @media(prefers-reduced-motion:reduce){.${SUPPORT_BUTTON_CLASS}{transition:none}}
        `;
        document.head.appendChild(style);
    }

    function init() {
        installStyles();
        decoratePosts(document);
        new MutationObserver(records => {
            records.forEach(record => record.addedNodes.forEach(node => {
                if (!(node instanceof Element)) return;
                decoratePosts(node);
                // Element multimedialny może zostać dołączony do już istniejącej
                // karty. Wtedy ponownie oceń całą kartę i przenieś przycisk.
                const ownerCard = node.closest?.('.post-card, .post-card-1x1')
                    || node.parentElement?.closest?.('.post-card, .post-card-1x1');
                if (ownerCard) decoratePost(ownerCard);
            }));
        }).observe(document.body, { childList: true, subtree: true });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') closeModal();
        });

        // Safety net — re-dekoracje po asynchronicznym renderze kart (loadDailyReflection itp.)
        // Karty poza feedContainer nie są objęte post-render hookiem w renderFeed(),
        // więc przechwytujemy je tutaj z opóźnieniem dopasowanym do Firebase round-trip.
        setTimeout(() => decoratePosts(document), 1200);
        setTimeout(() => decoratePosts(document), 3500);
    }

    window.LuminaSupportProject = {
        openModal,
        closeModal,
        copyBlik,
        decoratePosts
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
})();
