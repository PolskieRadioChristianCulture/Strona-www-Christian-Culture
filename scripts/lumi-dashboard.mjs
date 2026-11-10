const paths = {
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M2 21v-3a7 7 0 0 1 14 0v3M17 5a3 3 0 0 1 0 6m3 10v-3a6 6 0 0 0-3-5"/>',
  crown: '<path d="m3 6 4 5 5-8 5 8 4-5-3 14H6Z"/>',
  book: '<path d="M12 5v16M12 5C9 2 4 3 2 4v15c4-2 8-1 10 2 2-3 6-4 10-2V4c-2-1-7-2-10 1Z"/>',
  heart: '<path d="M20 4c-3-3-6-1-8 2-2-3-5-5-8-2-5 5 2 11 8 16 6-5 13-11 8-16Z"/>',
  plus: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/>',
  chat: '<path d="M21 12a9 9 0 0 1-9 9H3l2-5a9 9 0 1 1 16-4Z"/>',
  headphones: '<path d="M3 17v-5a9 9 0 0 1 18 0v5M3 13h4v8H3Zm14 0h4v8h-4Z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5Z"/>',
  sliders: '<path d="M3 6h18M3 12h18M3 18h18"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="9" cy="18" r="2"/>',
  pen: '<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  radio: '<path d="M3 11h18v10H3ZM4 7l15-5"/><circle cx="8" cy="16" r="2"/><path d="M14 14h4M14 18h4"/>'
};
export function icon(name) { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.chat}</svg>`; }
export function renderLumiDashboard() {
  const categories = [
    ['all', 'users', 'Wszyscy', 'Społeczność LUMINA'],
    ['mission', 'crown', 'Liderzy & Misja', 'Twórcy · Służba · Projekty'],
    ['formation', 'book', 'Formacja', 'Biblia · Studium · Modlitwa'],
    ['community', 'heart', 'Społeczność', 'Rozmowy · Wsparcie · Przyjaźnie'],
    ['channels', 'plus', 'Więcej', 'Kanały · Grupy']
  ];
  return `<main id="lumiLanding" class="lumi-dashboard" aria-labelledby="lumiTitle">
  <header class="lumi-dashboard-header">
    <a class="lumi-brand" href="/mess" aria-label="LUMI Messenger"><span class="lumi-brand-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="currentColor"><path d="M24 6C13 6 6 12 6 20c0 4 2 8 5 10l-2 7 8-4c2 1 4 1 7 1 11 0 18-6 18-14S35 6 24 6Z"/><path d="M33 28c-2 5-7 9-14 9 4 5 12 7 17 4l7 3-2-6c3-4 3-9 0-12l-8 2Z"/></svg></span><span><h1 id="lumiTitle">LUMI <small>Messenger</small></h1><span class="lumi-brand-note">Rozmowy, które budują wspólnotę</span></span></a>
    <div class="lumi-header-tools">
      <div class="lumi-radio-pill"><button type="button" id="lumiRadioPlay" aria-label="Włącz radio" disabled><span class="lumi-play-orb" aria-hidden="true">▶</span><span><small>Słuchaj</small><strong id="lumiRadioName">Radio PL</strong></span></button><button type="button" id="lumiRadioMenu" aria-label="Wybierz jedną z sześciu stacji" aria-expanded="false" aria-controls="lumiRadioPanel">${icon('chevronDown')}</button></div>
      <button type="button" class="lumi-icon-button" data-lumi-action="search" aria-label="Wyszukaj osoby i rozmowy">${icon('search')}</button>
      <button type="button" class="lumi-icon-button" data-lumi-action="notifications" aria-label="Powiadomienia">${icon('bell')}<span id="lumiNotificationCount" hidden></span></button>
      <button type="button" class="lumi-icon-button lumi-account" id="lumiAccountAction" aria-label="Konto i logowanie">${icon('user')}</button>
    </div>
  </header>
  <section id="lumiRadioPanel" class="lumi-radio-panel" aria-label="Radio Christian Culture" hidden><label for="lumiRadioSelect">Stacja radiowa</label><select id="lumiRadioSelect"></select><output id="lumiRadioStatus" role="status" aria-live="polite">Wczytywanie radia…</output></section>
  <section class="lumi-community-hero" aria-label="Wspólnota LUMINA"><p>Rozmawiaj<br>Inspiruj<br>Wzrastaj<br>razem <span>♡</span></p><div><strong>LUMINA</strong><span>WIĘCEJ NIŻ CZAT<br>TO WSPÓLNOTA</span></div></section>
  <nav class="lumi-category-grid" aria-label="Kategorie społeczności">${categories.map(([key, glyph, name, description]) => `<button type="button" data-lumi-category="${key}" aria-pressed="${key === 'all'}" class="lumi-category${key === 'all' ? ' is-active' : ''}">${icon(glyph)}<strong>${name}</strong><span>${description}</span></button>`).join('')}</nav>
  <div class="lumi-search-row"><label class="lumi-search-field">${icon('search')}<input id="lumiDirectorySearch" type="search" placeholder="Wyszukaj osoby i rozmowy…" aria-label="Wyszukaj osoby i rozmowy" autocomplete="off"></label><button type="button" class="lumi-icon-button" id="lumiFilterButton" aria-label="Pokaż filtry rozmów" aria-expanded="false" aria-controls="lumiFilters">${icon('sliders')}</button></div>
  <nav id="lumiFilters" class="lumi-filter-bar" aria-label="Filtry rozmów"><button type="button" data-lumi-filter="all" aria-pressed="true">${icon('users')}Wszyscy</button><button type="button" data-lumi-filter="unread" aria-pressed="false">${icon('bell')}Nieprzeczytane</button><button type="button" data-lumi-filter="recent" aria-pressed="false">${icon('clock')}Ostatnie</button><button type="button" data-lumi-filter="mine" aria-pressed="false">${icon('chat')}Moje czaty</button><button type="button" data-lumi-category="channels" aria-pressed="false">${icon('radio')}Kanały</button><button type="button" id="lumiFilterBcm24" class="lumi-filter-bcm24" aria-label="Biblijny Czas Modlitwy LIVE" title="Otwórz pokój Biblijny Czas Modlitwy LIVE na żywo">${icon('flame')}<span>BCM24 LIVE</span></button></nav>
  <section class="lumi-directory" aria-labelledby="lumiDirectoryHeading"><div class="lumi-directory-heading"><h2 id="lumiDirectoryHeading">Rozmowy i społeczność</h2><div class="lumi-heading-actions"><button type="button" id="lumiOpenCommander" class="lumi-open-room lumi-open-commander" hidden><span>👑 Pokój Agentów</span> ${icon('chevron')}</button><button type="button" id="lumiOpenFamily" class="lumi-open-room lumi-open-family" hidden><span>👨‍👩‍👧‍👦 Pokój rodzinny</span> ${icon('chevron')}</button><button type="button" id="lumiOpenAssistant" class="lumi-open-room lumi-open-assistant"><span>🧭 Asystent CC</span> ${icon('chevron')}</button><button type="button" id="lumiOpen" class="lumi-open-room"><span>Czat ogólny</span> ${icon('chevron')}</button></div></div><p id="lumiDirectoryStatus" class="lumi-directory-status" role="status" aria-live="polite">Wczytywanie społeczności…</p><div id="lumiConversationCards"></div></section>
  <button type="button" class="lumi-new-conversation" id="lumiNewConversation" aria-label="Nowa rozmowa" title="Nowa rozmowa">${icon('pen')}<span>Nowa rozmowa</span></button>
  <aside class="lumi-account-prompt"><a id="lumiLogin" href="/lumina-login?next=%2Fmess">Zaloguj się bezpłatnie</a><button id="lumiSettings" type="button" hidden>Ustawienia i wylogowanie</button><button id="lumiInstall" type="button">Dodaj LUMI do urządzenia</button><p id="lumiInstallStatus" role="status" aria-live="polite"></p><details id="lumiInstallHelp"><summary>Jak zainstalować aplikację?</summary><p>Android: wybierz w menu przeglądarki „Zainstaluj aplikację”. iPhone: Safari → Udostępnij → Do ekranu początkowego. Dostępność zależy od przeglądarki.</p></details></aside>
  <footer class="lumi-dashboard-footer"><a href="/lumina-safety">Zasady społeczności</a><a href="/privacy">Prywatność</a><button type="button" id="lumiReplayIntro">Obejrzyj intro</button><button type="button" id="lumiFooterSettings" data-lumi-action="settings">Ustawienia czatu</button><small>Społeczność dla osób pełnoletnich.</small></footer>
  <nav class="lumi-bottom-navigation" aria-label="Nawigacja komunikatora"><button type="button" data-lumi-action="chats" class="is-active">${icon('chat')}<span>Czat</span></button><button type="button" data-lumi-action="radio">${icon('headphones')}<span>Radio</span></button><button type="button" data-lumi-category="community" aria-pressed="false">${icon('users')}<span>Społeczność</span></button><a href="/lumina">${icon('compass')}<span>Odkrywaj</span></a><button type="button" data-lumi-action="notifications">${icon('bell')}<span>Powiadomienia</span></button></nav>
</main>`;
}
