// One station catalogue for the home player and the chat player.
(function () {
  'use strict';
  if (window.CCRadioStations) return;
  window.CCRadioStations = Object.freeze([
    { id: 'poland', name: 'Radio PL', streamUrl: 'https://stream.zeno.fm/vz96pvl3pnktv', logo: '/Aplikacja Christian Culture.png' },
    { id: 'global', name: 'Radio Global', streamUrl: 'https://stream.zeno.fm/umej2cuqncluv', logo: '/Aplikacja CC Lite.jpg' },
    { id: 'biblia_audio', name: 'Radio Biblia', streamUrl: 'https://stream.zeno.fm/imo45hqnshyuv', logo: '/Logo Biblia Audio CC.jpg' },
    { id: 'global_biblia', name: 'Global Biblia', playlistUrl: '/playlist.json', streamUrl: 'https://ebible.org/eng-web/mp3/01_01_Matthew.mp3', logo: '/Logo Globalna Biblia Audio.jpg' },
    { id: 'instrumental_worship', name: 'Instrumental Worship', playlistUrl: '/worship_playlist.json', streamUrl: '/audio/worship/CCM%20(1).mp3', logo: '/worship_logo_bg.jpg' },
    { id: 'biblia_spiewana', name: 'Biblia Śpiewana', playlistUrl: '/biblia_spiewana_playlist.json', streamUrl: '/audio/biblia_spiewana/%C5%9Apiewane%20Przypowie%C5%9Bci%20Salomona%201.mp3', logo: '/Logo_Biblia_Spiewana.jpg' },
    { id: 'radio_cc_women', name: 'Radio CC Women', streamUrl: '', logo: '/assets/ccw-icon.png' }
  ].map(station => Object.freeze(station)));
})();
