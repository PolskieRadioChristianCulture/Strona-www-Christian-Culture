// Presentation only: keep the original buttons, handlers, authorization and badges.
export function mountRoomNavigation(document, { onFamily } = {}) {
    const publicButton = document.getElementById('tabBtnPublicChat');
    const bar = publicButton?.parentElement;
    if (!bar || bar.__lumiNavigation) return bar?.__lumiNavigation;
    const win = document.defaultView;
    const mainIds = ['tabBtnPublicChat', 'tabBtnGroupsChat', 'tabBtnPrivateChat'];
    const labels = ['Czat ogólny', 'Grupy i pokoje', 'Rozmowy prywatne'];
    const more = document.createElement('button');
    more.id = 'tabBtnMoreRooms'; more.type = 'button'; more.textContent = '⋯';
    more.setAttribute('aria-label', 'Więcej pokoi i działań'); more.title = 'Więcej pokoi i działań';
    more.setAttribute('aria-haspopup', 'dialog'); more.setAttribute('aria-expanded', 'false');
    const badge = document.createElement('span'); badge.className = 'lumi-more-badge'; badge.hidden = true;
    more.append(badge);
    const dialog = document.createElement('dialog');
    dialog.id = 'lumiMoreRooms'; dialog.className = 'lumi-more-rooms';
    dialog.setAttribute('aria-labelledby', 'lumiMoreRoomsTitle');
    more.setAttribute('aria-controls', dialog.id);
    const title = document.createElement('h3'); title.id = 'lumiMoreRoomsTitle'; title.textContent = 'Pokoje i działania';
    const close = document.createElement('button'); close.type = 'button'; close.textContent = '×';
    close.className = 'lumi-more-close'; close.setAttribute('aria-label', 'Zamknij pozostałe pokoje');
    const items = document.createElement('div'); items.className = 'lumi-more-items';
    dialog.append(title, close, items);
    bar.classList.add('lumi-room-navigation'); bar.append(more);
    // Keep the header's last child as the tabs bar: existing composer discovers it there.
    bar.parentElement.parentElement.append(dialog);
    const closeMenu = (restore = true) => {
        if (dialog.open) dialog.close();
        more.setAttribute('aria-expanded', 'false');
        if (restore) more.focus();
    };
    more.onclick = () => { dialog.showModal(); more.setAttribute('aria-expanded', 'true'); close.focus(); };
    close.onclick = () => closeMenu();
    dialog.addEventListener('cancel', () => { more.setAttribute('aria-expanded', 'false'); more.focus(); });
    dialog.addEventListener('close', () => more.setAttribute('aria-expanded', 'false'));
    dialog.addEventListener('click', e => {
        if (e.target === dialog) closeMenu();
        else if (e.target.closest('button')?.parentElement === items) closeMenu(false);
    });
    if (onFamily) {
        const family = document.createElement('button'); family.type = 'button';
        family.id = 'tabBtnFamilyRooms'; family.textContent = '👨‍👩‍👧‍👦 Pokój rodzinny';
        family.onclick = () => { closeMenu(false); onFamily(); };
        items.append(family);
    }
    const visible = b => !b.hidden && !b.classList.contains('is-commander-hidden') && b.style.display !== 'none';
    function reconcile() {
        mainIds.forEach((id, i) => {
            const b = document.getElementById(id); if (!b) return;
            if (!b.classList.contains('lumi-main-room')) b.classList.add('lumi-main-room');
            if (!b.hasAttribute('aria-label')) b.setAttribute('aria-label', labels[i]);
            if (!b.title) b.title = labels[i];
            const next = mainIds.slice(i + 1).map(x => document.getElementById(x)).find(x => x?.parentElement === bar) || more;
            if (b.parentElement !== bar || b.nextElementSibling !== next) bar.insertBefore(b, next);
        });
        for (const b of [...bar.children]) {
            if (b.tagName === 'BUTTON' && b !== more && !mainIds.includes(b.id)) items.append(b);
        }
        let count = 0;
        for (const b of [...items.children]) {
            if (b.tagName !== 'BUTTON' || !visible(b)) continue;
            for (const counter of b.querySelectorAll('.tab-badge')) count += Math.max(0, parseInt(counter.textContent, 10) || 0);
        }
        const value = count > 99 ? '99+' : String(count);
        if (badge.textContent !== value) badge.textContent = value;
        if (badge.hidden !== (count === 0)) badge.hidden = count === 0;
    }
    let queued = false;
    const observer = new win.MutationObserver(() => {
        if (queued) return; queued = true;
        win.queueMicrotask(() => { queued = false; reconcile(); });
    });
    reconcile();
    observer.observe(bar.parentElement, { childList: true, subtree: true, attributes: true,
        attributeFilter: ['style', 'hidden', 'class'] });
    observer.observe(dialog, { childList: true, subtree: true, attributes: true,
        attributeFilter: ['style', 'hidden', 'class'] });
    const api = { reconcile, close: closeMenu, dispose() { observer.disconnect(); closeMenu(false); } };
    bar.__lumiNavigation = api;
    return api;
}
