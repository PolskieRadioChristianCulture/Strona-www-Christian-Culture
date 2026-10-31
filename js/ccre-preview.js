/**
 * CCRE Preview Controller
 * Obsługuje interaktywny pulpit testowy ccre-preview.html
 */

import CCWarmWelcome from '/components/cc-warm-welcome.js';
import CCRECatalog from '/components/ccre-catalog.js';
import CCREToday from '/components/ccre-today.js';
import CCREProgress from '/components/ccre-progress.js';

// 1. Inicjalizacja M2: CC Dzisiaj
const today = CCREToday.create();
const todayContainer = document.getElementById('todayContainer');
if (todayContainer) {
  today.render(todayContainer);
}

// 2. Inicjalizacja M1: Katalog
const catalog = CCRECatalog.create();
const catalogContainer = document.getElementById('catalogList');
if (catalogContainer) {
  const items = catalog.getFeatured();
  catalogContainer.innerHTML = items.map(item => `
    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(196,163,90,0.15); border-radius: 8px; padding: 12px;">
      <span style="font-size: 10px; font-weight: 700; color: #C4A35A; text-transform: uppercase;">${item.badgeText || item.category}</span>
      <h4 style="margin: 6px 0 4px; font-size: 14px; color: #FFF;">${item.title}</h4>
      <p style="margin: 0 0 10px; font-size: 12px; color: #9CA3AF;">${item.subtitle || ''}</p>
      <a href="${item.url}" class="btn btn-secondary" style="font-size: 11px; min-height: 36px; padding: 0 10px;">Otwórz →</a>
    </div>
  `).join('');
}

// 3. Testy M8: Warm Welcome
const welcomeMgr = CCWarmWelcome.create({ delayMs: 100 });
const welcomeStatus = document.getElementById('welcomeStatus');
const updateWelcomeStatus = () => {
  if (welcomeStatus) {
    const state = welcomeMgr.getState();
    welcomeStatus.textContent = JSON.stringify(state, null, 2);
  }
};
updateWelcomeStatus();

const btnShowWelcome = document.getElementById('btnShowWelcome');
if (btnShowWelcome) {
  btnShowWelcome.addEventListener('click', () => {
    welcomeMgr.render();
    updateWelcomeStatus();
  });
}

const btnResetWelcome = document.getElementById('btnResetWelcome');
if (btnResetWelcome) {
  btnResetWelcome.addEventListener('click', () => {
    welcomeMgr.reset();
    updateWelcomeStatus();
  });
}

// 4. Testy M3: Progress
const tracker = CCREProgress.create();
const progressStatus = document.getElementById('progressStatus');
const updateProgressStatus = () => {
  if (progressStatus) {
    const last = tracker.getLastActive();
    progressStatus.textContent = last ? JSON.stringify(last, null, 2) : 'Brak zapisanego postępu';
  }
};
updateProgressStatus();

const btnSaveProgress = document.getElementById('btnSaveProgress');
if (btnSaveProgress) {
  btnSaveProgress.addEventListener('click', () => {
    tracker.saveProgress({
      contentId: 'ba_gen_01',
      title: 'Księga Rodzaju • Rozdział 1',
      positionSeconds: 180,
      durationSeconds: 720,
      percentage: 25,
      url: '/biblia-audio#rdz-1'
    }, true);
    updateProgressStatus();
  });
}

const btnClearProgress = document.getElementById('btnClearProgress');
if (btnClearProgress) {
  btnClearProgress.addEventListener('click', () => {
    tracker.clearAll();
    updateProgressStatus();
  });
}
