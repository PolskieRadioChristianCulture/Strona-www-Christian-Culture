/* One presence view for the community list, avatar strips and direct chat. */
(function (global) {
  'use strict';
  if (global.LuminaMemberPresence) return;
  // @007 (L0 24.11.2026): jeden znak w całym ekosystemie — zielona kropka = online; offline/nieznany = brak kropki
  // (czerwona kropka przy większości osób wyglądała jak błąd).
  const colors = { online: '#22C55E', offline: 'transparent', unknown: 'transparent' };
  const labels = { online: 'Online · aktywność w ostatnich 90 sekundach', offline: 'Offline · brak aktualnej aktywności', unknown: 'Status nieznany · brak aktualnych danych' };
  let records = [], available = false, stop = null, observer = null, scheduled = false;
  const normalize = value => global.LuminaDB?.normalizeChatUserId?.(String(value || '')) || String(value || '').toLowerCase();
  function state(uid, slug) {
    if (!available || global.navigator?.onLine === false) return 'unknown';
    const matches = records.filter(p => (uid && p.uid === uid) || (slug && p.slug && normalize(p.slug) === normalize(slug)));
    if (!matches.length) return 'unknown';
    return matches.some(p => p.online) ? 'online' : 'offline';
  }
  function safeImage(value) {
    const text = String(value || '');
    return /^(https:\/\/|\/(?!\/)|[\w.-]+\.(?:jpe?g|png|webp|gif)(?:\?|$))/i.test(text) ? text : '/lumina_icon.jpg';
  }
  function strip(container) {
    if (!container) return;
    const me = global.LuminaDB?.getCurrentUser?.()?.uid;
    const seen = new Set();
    const online = available && global.navigator?.onLine !== false ? records.filter(p => {
      if (!p.online || !p.uid || !p.slug || p.uid === me || seen.has(p.uid)) return false;
      seen.add(p.uid); return true;
    }) : [];
    if (container.id === 'tablicaOnlineAvatarsContainer' && !online.length) {
      container.hidden = false;
      container.style.display = 'flex';
      return;
    }
    const signature = JSON.stringify(online.map(p => [p.uid, p.slug, p.displayName, p.avatar]));
    if (container.dataset.presenceSignature === signature) return;
    container.dataset.presenceSignature = signature;
    container.replaceChildren();
    container.hidden = !online.length;
    container.style.display = online.length ? 'flex' : 'none';
    container.style.gap = '10px';container.style.overflowX = 'auto';container.style.padding = '8px';
    container.setAttribute('aria-label', 'Osoby online');
    online.forEach(p => {
      const button = document.createElement('button');button.type = 'button';
      button.style.cssText = 'position:relative;flex:0 0 48px;width:48px;height:48px;padding:0;border:2px solid #22C55E;border-radius:50%;background:#172034;cursor:pointer';
      button.title = String(p.displayName || 'Członek społeczności') + ' · ' + labels.online;
      const image = document.createElement('img');image.src = safeImage(p.avatar);image.alt = String(p.displayName || 'Członek społeczności');
      image.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%';image.onerror = () => { image.onerror = null; image.src = '/lumina_icon.jpg'; };
      button.appendChild(image);
      button.onclick = () => {
        if (typeof global.openChatWith === 'function') global.openChatWith(p.displayName || 'Rozmówca', safeImage(p.avatar), p.slug);
        else if (typeof global.openCommunityProfile === 'function') global.openCommunityProfile(p.slug);
      };
      container.appendChild(button);
    });
  }
  function render() {
    scheduled = false;
    document.querySelectorAll('[data-lumina-presence-id]').forEach(dot => {
      const value = state(dot.dataset.luminaPresenceId, dot.dataset.luminaPresenceSlug);
      dot.dataset.presenceState = value;dot.title = labels[value];dot.setAttribute('aria-label', labels[value]);dot.style.backgroundColor = colors[value];
      dot.hidden = value !== 'online';
    });
    strip(document.getElementById('tablicaOnlineAvatarsContainer'));
    const list = document.getElementById('dmConversationsList');
    if (list && !document.getElementById('luminaMemberPresenceStrip')) {
      const bar = document.createElement('div');bar.id = 'luminaMemberPresenceStrip';list.before(bar);
    }
    strip(document.getElementById('luminaMemberPresenceStrip'));
  }
  function schedule() { if (!scheduled) { scheduled = true; queueMicrotask(render); } }
  function start() {
    if (stop || !global.LuminaDB?.subscribeToOnlinePresence) return;
    stop = global.LuminaDB.subscribeToOnlinePresence((_active, info) => {
      available = info?.available === true;records = available && Array.isArray(info.members) ? info.members : [];schedule();
    });
  }
  global.LuminaMemberPresence = { state, render: schedule, start };
  global.renderTablicaOnlineAvatars = schedule;
  if (typeof MutationObserver === 'function') { observer = new MutationObserver(schedule);observer.observe(document.documentElement, { childList: true, subtree: true }); }
  global.addEventListener('lumina-chat-history-error', event => {
    const box = document.getElementById('activeChatMessagesBox');
    if (!box) return;
    let notice = document.getElementById('luminaChatHistoryNotice');
    if (!notice) { notice = document.createElement('p'); notice.id = 'luminaChatHistoryNotice'; notice.setAttribute('role', 'alert'); box.before(notice); }
    notice.textContent = event.detail?.code === 'resource-exhausted'
      ? 'Historia jest chwilowo niedostępna: baza osiągnęła limit. To nie oznacza usunięcia rozmowy.'
      : 'Nie udało się wczytać historii. Sprawdź połączenie i otwórz rozmowę ponownie.';
  });
  global.addEventListener('offline', schedule);global.addEventListener('online', schedule);
  global.addEventListener('lumina-auth-state', start);global.addEventListener('lumina-user-changed', start);
  let attempts = 0;
  const boot = () => { start();if (!stop && ++attempts < 30) setTimeout(boot, 1000); };
  boot();schedule();
})(window);
