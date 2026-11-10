(function () {
  'use strict';
  if (window.LumiDashboard) return;
  const root = document.getElementById('lumiLanding');
  if (!root?.classList.contains('lumi-dashboard')) return;
  let category = 'all', filter = 'all', query = '', owner = '', rooms = [], roomStop = null;
  let generation = 0, radioBound = false;
  const $ = id => document.getElementById(id);
  const currentUser = () => window.LuminaDB?.getCurrentUser?.();
  const isMember = () => Boolean(currentUser()?.uid && !currentUser().isAnonymous);
  function isCommander() {
    if (typeof window.isUserCommanderAuthorized === 'function' && window.isUserCommanderAuthorized()) return true;
    const u = window.LuminaDB?.getFirebaseAuthUser?.() || currentUser();
    if (u && !u.isAnonymous && u.email?.toLowerCase().trim() === 'nazirczarkes@gmail.com') return true;
    try {
      const email = localStorage.getItem('lumina_user_email') || '';
      const slug = localStorage.getItem('lumina_current_user_slug') || '';
      if (email.toLowerCase().trim() === 'nazirczarkes@gmail.com' || slug === 'cezaryrgowski') return true;
    } catch (_) {}
    return false;
  }
  function openBcm24Room() {
    if (window.LumiLiveRooms?.enterRoom) {
      window.LumiLiveRooms.enterRoom('tv_bcm24');
    } else if (typeof window.openDirectMessagesModal === 'function') {
      window.openDirectMessagesModal('livetv');
      setTimeout(() => { window.LumiLiveRooms?.enterRoom?.('tv_bcm24'); }, 300);
    } else {
      lumiOpen?.click();
      setTimeout(() => {
        if (typeof window.openDirectMessagesModal === 'function') {
          window.openDirectMessagesModal('livetv');
        } else {
          window.switchMessengerMainTab?.('livetv');
        }
        setTimeout(() => { window.LumiLiveRooms?.enterRoom?.('tv_bcm24'); }, 300);
      }, 200);
    }
  }
  function openCommanderRoom() {
    if (!isCommander() && !isMember()) {
      location.href = `/lumina-login?next=${encodeURIComponent('/mess?openCommander=1')}`;
      return;
    }
    if (typeof window.openDirectMessagesModal === 'function') {
      window.openDirectMessagesModal('commander');
    } else if (typeof window.switchMessengerMainTab === 'function') {
      const m = document.getElementById('directMessagesModal');
      if (m) {
        m.removeAttribute('inert');
        m.setAttribute('aria-hidden', 'false');
        m.style.display = 'flex';
        m.classList.add('open');
      }
      window.switchMessengerMainTab('commander');
    } else {
      $('lumiOpen')?.click();
      setTimeout(() => {
        if (typeof window.openDirectMessagesModal === 'function') {
          window.openDirectMessagesModal('commander');
        } else {
          window.switchMessengerMainTab?.('commander');
        }
      }, 200);
    }
  }
  function commanderCard() {
    const button = document.createElement('button'); button.type = 'button';
    button.className = 'lumi-conversation-card lumi-commander-card';
    button.setAttribute('data-commander-card', 'true');
    const img = document.createElement('img');
    img.src = '/images/chat/cc-chat-button-128.webp';
    img.alt = 'Sztab Dowództwa';
    img.loading = 'lazy'; img.width = 72; img.height = 72;
    img.style.borderColor = '#d4af37';
    const body = document.createElement('span'); body.className = 'lumi-card-body';
    const title = document.createElement('span'); title.className = 'lumi-card-title';
    title.textContent = '👑 Pokój Agentów CC';
    const badge = document.createElement('span'); badge.className = 'lumi-card-role'; badge.textContent = 'VIP L0';
    title.append(badge);
    const description = document.createElement('span'); description.className = 'lumi-card-description';
    description.textContent = 'Planer Omega 5.10.15 & Sztab Dowództwa';
    const preview = document.createElement('span'); preview.className = 'lumi-card-preview';
    preview.textContent = 'Dyspozycje i odpowiedzi agentów CC';
    body.append(title, description, preview);
    const arrow = document.createElement('span'); arrow.className = 'lumi-card-arrow'; arrow.textContent = '›'; arrow.setAttribute('aria-hidden', 'true');
    button.prepend(img, body); button.append(arrow);
    button.addEventListener('click', openCommanderRoom);
    return button;
  }
  function isRogowscy() {
    if (isCommander()) return true;
    const u = window.LuminaDB?.getFirebaseAuthUser?.() || currentUser();
    const email = u?.email?.toLowerCase().trim() || '';
    if (email === 'nazirczarkes@gmail.com' || email.includes('rogowsk')) return true;
    try {
      const savedEmail = (localStorage.getItem('lumina_user_email') || '').toLowerCase().trim();
      const slug = localStorage.getItem('lumina_current_user_slug') || '';
      if (savedEmail === 'nazirczarkes@gmail.com' || savedEmail.includes('rogowsk') || slug === 'cezaryrgowski' || slug === 'wiolettarogowska') return true;
    } catch (_) {}
    return false;
  }
  async function openFamilyRoom() {
    if (!isMember()) {
      location.href = `/lumina-login?next=${encodeURIComponent('/mess?openFamily=1')}`;
      return;
    }
    if (typeof window.openFamilyPanel === 'function') {
      window.openFamilyPanel();
    } else {
      try {
        const mod = await import('/components/lumi-family-host.js?v=20261019_family2');
        if (typeof mod.openFamilyPanel === 'function') {
          mod.openFamilyPanel();
        }
      } catch (err) {
        console.error('Błąd otwierania pokoju rodzinnego:', err);
      }
    }
  }
  function familyCard() {
    const button = document.createElement('button'); button.type = 'button';
    button.className = 'lumi-conversation-card lumi-family-card';
    button.setAttribute('data-family-card', 'true');
    const img = document.createElement('img');
    img.src = '/images/chat/cc-chat-button-128.webp';
    img.alt = 'Pokój rodzinny';
    img.loading = 'lazy'; img.width = 72; img.height = 72;
    img.style.borderColor = '#10b981';
    const body = document.createElement('span'); body.className = 'lumi-card-body';
    const title = document.createElement('span'); title.className = 'lumi-card-title';
    title.textContent = '👨‍👩‍👧‍👦 Pokój rodzinny';
    const badge = document.createElement('span'); badge.className = 'lumi-card-role'; badge.textContent = 'Prywatny';
    title.append(badge);
    const description = document.createElement('span'); description.className = 'lumi-card-description';
    description.textContent = 'Prywatna przestrzeń rodzinna · LUMI Family';
    const preview = document.createElement('span'); preview.className = 'lumi-card-preview';
    preview.textContent = 'Wiadomości rodzinne · LUMI Family';
    body.append(title, description, preview);
    const arrow = document.createElement('span'); arrow.className = 'lumi-card-arrow'; arrow.textContent = '›'; arrow.setAttribute('aria-hidden', 'true');
    button.prepend(img, body); button.append(arrow);
    button.addEventListener('click', openFamilyRoom);
    return button;
  }
  function openAssistantRoom() {
    if (window.CCAssistant?.open) {
      window.CCAssistant.open({ source: 'lumi_dashboard' });
    } else if (window.CCUnifiedChat?.openCurrent) {
      window.CCUnifiedChat.openCurrent({ tab: 'assistant', partner: 'cc-assistant', source: 'lumi_dashboard' });
    } else if (typeof window.openDirectMessagesModal === 'function') {
      window.openDirectMessagesModal('assistant');
    } else {
      $('lumiOpen')?.click();
      setTimeout(() => {
        if (window.CCAssistant?.open) window.CCAssistant.open({ source: 'lumi_dashboard' });
        else window.switchMessengerMainTab?.('assistant');
      }, 200);
    }
  }
  function assistantCard() {
    const button = document.createElement('button'); button.type = 'button';
    button.className = 'lumi-conversation-card lumi-assistant-card';
    button.setAttribute('data-assistant-card', 'true');
    const img = document.createElement('img');
    img.src = '/images/chat/cc-chat-button-128.webp';
    img.alt = 'Asystent Christian Culture';
    img.loading = 'lazy'; img.width = 72; img.height = 72;
    img.style.borderColor = '#C4A35A';
    const body = document.createElement('span'); body.className = 'lumi-card-body';
    const title = document.createElement('span'); title.className = 'lumi-card-title';
    title.textContent = '🧭 Asystent Christian Culture';
    const badge = document.createElement('span'); badge.className = 'lumi-card-role'; badge.textContent = 'Wirtualny gospodarz';
    title.append(badge);
    const description = document.createElement('span'); description.className = 'lumi-card-description';
    description.textContent = 'Wirtualny gospodarz · Pomoc i inspiracja przez całą dobę';
    const preview = document.createElement('span'); preview.className = 'lumi-card-preview';
    preview.textContent = 'Zadaj pytanie, znajdź materiały lub zgłoś pomysł';
    body.append(title, description, preview);
    const arrow = document.createElement('span'); arrow.className = 'lumi-card-arrow'; arrow.textContent = '›'; arrow.setAttribute('aria-hidden', 'true');
    button.prepend(img, body); button.append(arrow);
    button.addEventListener('click', openAssistantRoom);
    return button;
  }
  function login() { location.href = '/lumina-login?next=%2Fmess'; }
  function safeImage(value) {
    try { const url = new URL(value || '/images/chat/cc-chat-button-128.webp', location.href); return url.protocol === 'https:' || url.origin === location.origin ? url.href : '/images/chat/cc-chat-button-128.webp'; }
    catch (_) { return '/images/chat/cc-chat-button-128.webp'; }
  }
  function timestamp(value) {
    const time = typeof value === 'number' ? value : value?.seconds ? value.seconds * 1000 : 0;
    return Number.isFinite(time) && time > 0 ? time : 0;
  }
  function members() {
    const records = new Map();
    for (const profile of window.CCGlobalChat?.getMembers?.() || []) {
      if (!profile.isPublic) records.set(profile.slug || profile.id, { ...profile });
    }
    for (const profile of Object.values(window._cloudProfilesMap || {})) {
      const slug = profile.slug || profile.id;
      if (!slug || profile.deleted || profile.isDeleted || profile.status === 'withdrawn') continue;
      records.set(slug, { ...records.get(slug), ...profile });
    }
    return [...records].map(([slug, profile]) => ({ ...profile, slug, name: profile.name || profile.displayName || slug, avatar: profile.avatar || profile.avatarUrl || profile.photoURL }));
  }
  function entryCategory(entry) {
    const text = `${entry.name} ${entry.badge || ''} ${entry.desc || ''} ${entry.role || ''}`.toLowerCase();
    if (/biblia|teologia|formacja|osobowość|osobowosc|andrzej|studium/.test(text)) return 'formation';
    if (/założyciel|lider|misja|studio|duszpast|redakcja/.test(text)) return 'mission';
    return 'community';
  }
  function unread(entry) {
    if (!isMember() || currentUser().uid !== owner || !entry.room) return 0;
    const map = window._luminaUnreadRoomsMap;
    const value = map?.get?.(entry.slug) || map?.get?.(entry.room.id) || 0;
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  }
  function entries() {
    const people = members();
    const ownProfile = window.LuminaDB?.getCurrentProfile?.();
    const ownIds = new Set([owner, ownProfile?.slug].filter(Boolean));
    for (const room of rooms) {
      const ids = [...(room.users || []), ...(room.participants || [])];
      const other = room.lastSenderId && !ownIds.has(room.lastSenderId) ? room.lastSenderId : ids.find(id => !ownIds.has(id) && people.some(p => p.slug === id || p.uid === id));
      const peer = people.find(p => p.slug === other || p.uid === other);
      if (peer && (!peer.room || timestamp(room.lastMessageTimestamp) > timestamp(peer.room.lastMessageTimestamp))) peer.room = room;
    }
    return people.filter(p => !ownIds.has(p.slug) && !ownIds.has(p.uid));
  }
  function card(entry) {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'lumi-conversation-card';
    const img = document.createElement('img'); img.src = safeImage(entry.avatar); img.alt = ''; img.loading = 'lazy'; img.width = 72; img.height = 72;
    img.addEventListener('error', () => { img.src = '/images/chat/cc-chat-button-128.webp'; }, { once: true });
    const body = document.createElement('span'); body.className = 'lumi-card-body';
    const title = document.createElement('span'); title.className = 'lumi-card-title'; title.textContent = entry.name;
    const description = document.createElement('span'); description.className = 'lumi-card-description'; description.textContent = entry.desc || entry.job || entry.city || 'Społeczność LUMINA';
    const preview = document.createElement('span'); preview.className = 'lumi-card-preview';
    preview.textContent = entry.room?.lastMessageText || 'Rozpocznij rozmowę';
    if (entry.room) {
      const time = timestamp(entry.room.lastMessageTimestamp);
      if (time) preview.textContent = `${new Date(time).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })} · ${preview.textContent}`;
    }
    body.append(title, description, preview);
    const badge = document.createElement('span'); badge.className = 'lumi-card-role'; badge.textContent = entry.badge || 'LUMINA';
    title.append(badge);
    const count = unread(entry);
    if (count) { const unreadBadge = document.createElement('span'); unreadBadge.className = 'lumi-card-unread'; unreadBadge.textContent = count > 99 ? '99+' : String(count); unreadBadge.setAttribute('aria-label', `${count} nieprzeczytanych`); button.append(unreadBadge); }
    const arrow = document.createElement('span'); arrow.className = 'lumi-card-arrow'; arrow.textContent = '›'; arrow.setAttribute('aria-hidden', 'true');
    button.prepend(img, body); button.append(arrow);
    button.addEventListener('click', () => {
      if (!isMember()) { location.href = `/lumina-login?next=${encodeURIComponent('/mess?openChat=' + encodeURIComponent(entry.slug))}`; return; }
      window.CCUnifiedChat?.openCurrent({ tab: 'private', partner: entry.slug, name: entry.name, avatar: safeImage(entry.avatar) });
    });
    return button;
  }
  function renderChannels() {
    const list = $('lumiConversationCards'); list.replaceChildren();
    const channels = [
      ['🧭 Asystent Christian Culture', 'Wirtualny gospodarz · Pomoc i inspiracja przez całą dobę', openAssistantRoom],
      ['📿 Biblijny Czas Modlitwy 24/7 (LIVE)', 'Kanał modlitewny i intencje na żywo z Jolą Wójcik', openBcm24Room],
      ['Czat ogólny LUMINA', 'Rozmowy całej społeczności', () => $('lumiOpen').click()],
      ['Formacja biblijna', 'Akademia Christian Culture', () => { location.href = '/akademia'; }],
      ['Społeczność i grupy', 'Odkrywaj społeczność LUMINA', () => { location.href = '/lumina'; }],
      ['Radio Christian Culture', 'Wszystkie sześć stacji', toggleRadioPanel]
    ];
    if (isRogowscy()) {
      channels.unshift(['👨‍👩‍👧‍👦 Pokój rodzinny', 'Prywatna przestrzeń rodzinna · LUMI Family', openFamilyRoom]);
    }
    if (isCommander()) {
      channels.unshift(['👑 Pokój Agentów & Planer Omega', 'Dyspozycje agentów i planowanie działań misji', openCommanderRoom]);
    }
    for (const [name, description, action] of channels) {
      const button = document.createElement('button'); button.type = 'button';
      button.className = 'lumi-conversation-card lumi-channel-card' + (name.includes('Pokój Agentów') ? ' lumi-commander-card' : action === openFamilyRoom ? ' lumi-family-card' : '');
      const text = document.createElement('span'); text.className = 'lumi-card-body';
      const title = document.createElement('strong'); title.textContent = name;
      const desc = document.createElement('span'); desc.className = 'lumi-card-description'; desc.textContent = description;
      text.append(title, desc); button.append(text); button.addEventListener('click', action); list.append(button);
    }
  }
  function render() {
    if (!$('lumiConversationCards')) return;
    const btnCommander = $('lumiOpenCommander');
    if (btnCommander) {
      const showCmd = isCommander();
      btnCommander.hidden = !showCmd;
      btnCommander.style.display = showCmd ? 'inline-flex' : 'none';
    }
    const btnFamily = $('lumiOpenFamily');
    if (btnFamily) {
      const showFam = isRogowscy();
      btnFamily.hidden = !showFam;
      btnFamily.style.display = showFam ? 'inline-flex' : 'none';
    }
    root.querySelectorAll('[data-lumi-category]').forEach(button => { const active = button.dataset.lumiCategory === category; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active)); });
    root.querySelectorAll('[data-lumi-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lumiFilter === filter)));
    if (category === 'channels') { renderChannels(); $('lumiDirectoryHeading').textContent = 'Kanały i wspólnota'; $('lumiDirectoryStatus').textContent = 'Wybierz miejsce, do którego chcesz przejść'; return; }
    let list = entries();
    const unreadRooms = list.filter(entry => unread(entry) > 0).length;
    const badge = $('lumiNotificationCount'); badge.hidden = unreadRooms === 0; badge.textContent = String(unreadRooms); badge.setAttribute('aria-label', `${unreadRooms} nieprzeczytanych rozmów`);
    if (category !== 'all') list = list.filter(entry => entryCategory(entry) === category);
    if (filter === 'unread') list = list.filter(entry => unread(entry) > 0);
    if (filter === 'mine' || filter === 'recent') list = list.filter(entry => entry.room);
    if (query) list = list.filter(entry => `${entry.name} ${entry.desc || ''} ${entry.room?.lastMessageText || ''}`.toLocaleLowerCase('pl-PL').includes(query));
    if (filter === 'recent') list.sort((a, b) => timestamp(b.room?.lastMessageTimestamp) - timestamp(a.room?.lastMessageTimestamp));
    const cards = list.map(card);
    if (window.CCAssistant?.isEnabled?.()) {
      const assistantMatches = !query || 'asystent christian culture wirtualny gospodarz pomoc inspiracja pytanie biblia radio'.includes(query);
      if (assistantMatches && (category === 'all' || category === 'community') && (filter === 'all' || filter === 'mine')) {
        cards.unshift(assistantCard());
      }
    }
    if (isRogowscy()) {
      const familyMatches = !query || 'rodzina pokój rodzinny lumi family dom'.includes(query);
      if (familyMatches && (filter === 'all' || filter === 'mine')) {
        cards.unshift(familyCard());
      }
    }
    if (isCommander()) {
      const commanderMatches = !query || 'pokój agentów planer omega sztab l0 biometria dowódca cc'.includes(query);
      if (commanderMatches && (filter === 'all' || filter === 'mine')) {
        cards.unshift(commanderCard());
      }
    }
    $('lumiConversationCards').replaceChildren(...cards);
    $('lumiDirectoryHeading').textContent = filter === 'mine' ? 'Moje czaty' : filter === 'unread' ? 'Nieprzeczytane rozmowy' : 'Rozmowy i społeczność';
    $('lumiDirectoryStatus').textContent = cards.length ? (isMember() ? 'Wybierz rozmowę lub rozpocznij nową' : 'Zaloguj się, aby rozpocząć rozmowę prywatną') : query ? 'Brak osób lub rozmów pasujących do wyszukiwania' : !window.CCGlobalChat ? 'Wczytywanie społeczności…' : 'Brak rozmów w tym widoku';
  }
  function bindSession() {
    const user = currentUser(); const next = user && !user.isAnonymous ? String(user.uid || '') : '';
    if (next !== owner) {
      generation++; roomStop?.(); roomStop = null; rooms = []; owner = next;
      $('lumiNotificationCount').hidden = true; $('lumiNotificationCount').textContent = '';
    }
    if (owner && !roomStop && typeof window.LuminaDB?.subscribeToUserChats === 'function') {
      const ticket = generation, uid = owner;
      roomStop = window.LuminaDB.subscribeToUserChats(uid, snapshot => {
        if (ticket !== generation || currentUser()?.uid !== uid || currentUser()?.isAnonymous) return;
        rooms = Array.isArray(snapshot) ? snapshot : []; render();
      });
    }
    const profile = owner ? window.LuminaDB?.getCurrentProfile?.() : null;
    const account = $('lumiAccountAction'); account.setAttribute('aria-label', owner ? 'Moje konto i ustawienia' : 'Zaloguj się do LUMINA');
    const avatar = profile?.avatar || profile?.photoURL;
    if (avatar) { const image = document.createElement('img'); image.src = safeImage(avatar); image.alt = 'Moje konto'; account.replaceChildren(image); }
    else if (account.querySelector('img')) { account.textContent = 'Konto'; }
    render();
  }
  function toggleRadioPanel() {
    const panel = $('lumiRadioPanel'); panel.hidden = !panel.hidden; $('lumiRadioMenu').setAttribute('aria-expanded', String(!panel.hidden));
    if (!panel.hidden) panel.scrollIntoView?.({ block: 'nearest' });
  }
  function bindRadio() {
    if (radioBound || !window.CCChatRadioReady) return;
    radioBound = true;
    window.CCChatRadioReady.then(() => {
      const radio = window.CCChatRadio, select = $('lumiRadioSelect'), play = $('lumiRadioPlay');
      select.replaceChildren(...radio.stations.map(station => { const option = document.createElement('option'); option.value = station.id; option.textContent = station.name; return option; }));
      let preparation = 0;
      async function prepare() {
        const ticket = ++preparation; play.disabled = true;
        try { await radio.prepare(select.value); if (ticket === preparation) play.disabled = false; }
        catch (_) { if (ticket === preparation) $('lumiRadioStatus').textContent = 'Nie udało się wczytać stacji. Wybierz ją ponownie.'; }
      }
      const stop = radio.subscribe(state => {
        select.value = state.stationId; $('lumiRadioName').textContent = radio.stations.find(station => station.id === state.stationId)?.name || 'Radio CC';
        play.setAttribute('aria-label', state.playing ? 'Wstrzymaj radio' : 'Włącz radio'); play.querySelector('.lumi-play-orb').textContent = state.playing ? 'Ⅱ' : '▶';
        play.querySelector('small').textContent = state.playing ? 'Odtwarza' : 'Słuchaj'; $('lumiRadioStatus').textContent = state.status;
      });
      window.addEventListener('pagehide', stop, { once: true });
      play.addEventListener('click', () => { if (radio.state().playing) radio.pause(); else { radio.select(select.value); radio.play(true); } });
      select.addEventListener('change', () => {
        const id = select.value, wasPlaying = radio.state().playing;
        radio.pause(); radio.select(id); prepare().then(() => { if (wasPlaying && !play.disabled && select.value === id) radio.play(true); });
      });
      prepare();
    }).catch(() => { $('lumiRadioStatus').textContent = 'Radio niedostępne. Odśwież stronę.'; });
  }
  function setup() {
    root.addEventListener('click', event => {
      const categoryButton = event.target.closest('[data-lumi-category]');
      if (categoryButton) { category = categoryButton.dataset.lumiCategory; filter = 'all'; render(); }
      const filterButton = event.target.closest('[data-lumi-filter]');
      if (filterButton) { if (!isMember() && filterButton.dataset.lumiFilter !== 'all') return login(); category = 'all'; filter = filterButton.dataset.lumiFilter; render(); }
      const action = event.target.closest('[data-lumi-action]')?.dataset.lumiAction;
      if (action === 'radio') toggleRadioPanel();
      if (action === 'search') $('lumiDirectorySearch').focus();
      if (action === 'chats') { category = 'all'; filter = 'all'; render(); }
      if (action === 'notifications') { if (!isMember()) return login(); category = 'all'; filter = 'unread'; render(); $('lumiDirectoryHeading').scrollIntoView?.({ block: 'start' }); }
      if (action === 'settings') window.openChatSettingsModal?.();
    });
    $('lumiDirectorySearch').addEventListener('input', event => { query = event.target.value.trim().toLocaleLowerCase('pl-PL'); render(); });
    $('lumiRadioMenu').addEventListener('click', toggleRadioPanel);
    $('lumiFilterButton').addEventListener('click', () => { const active = $('lumiFilters').classList.toggle('is-expanded'); $('lumiFilterButton').setAttribute('aria-expanded', String(active)); });
    $('lumiNewConversation').addEventListener('click', () => { category = 'all'; filter = 'all'; query = ''; $('lumiDirectorySearch').value = ''; render(); $('lumiDirectorySearch').focus(); $('lumiDirectorySearch').scrollIntoView?.({ block: 'center' }); });
    $('lumiAccountAction').addEventListener('click', () => isMember() ? window.openChatSettingsModal?.() : login());
    $('lumiFilterBcm24')?.addEventListener('click', openBcm24Room);
    $('lumiOpenCommander')?.addEventListener('click', openCommanderRoom);
    $('lumiOpenFamily')?.addEventListener('click', openFamilyRoom);
    $('lumiOpenAssistant')?.addEventListener('click', openAssistantRoom);
    window.addEventListener('lumina-auth-state', bindSession);
    for (const event of ['lumina:carousel-people', 'lumina:notification', 'lumina:profileDeleted', 'cc-global-chat-ready']) window.addEventListener(event, render);
    window.addEventListener('cc-chat-integration-ready', () => { bindRadio(); bindSession(); });
    window.addEventListener('pagehide', () => { generation++; roomStop?.(); }, { once: true });
    bindRadio(); bindSession(); setTimeout(render, 2000);
    try {
      if (new URLSearchParams(location.search).get('openCommander') === '1') {
        setTimeout(() => { if (isCommander()) openCommanderRoom(); }, 350);
      }
      if (new URLSearchParams(location.search).get('openFamily') === '1') {
        setTimeout(() => { if (isRogowscy()) openFamilyRoom(); }, 350);
      }
    } catch (_) {}
  }
  window.LumiDashboard = { render, bindSession };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup, { once: true }); else setup();
})();
