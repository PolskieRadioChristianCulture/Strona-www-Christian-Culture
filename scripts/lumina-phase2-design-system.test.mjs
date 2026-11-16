import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { Window } from 'happy-dom';

const ROOT = new URL('..', import.meta.url);

async function readRepoFile(relPath) {
  return readFile(new URL(relPath, ROOT), 'utf8');
}

const DARK_DESIGN_FILES = [
  'src/styles/tokens.css',
  'css/lumina-shared-shell.css',
  'css/lumina-theme.css',
  'css/lumina-components.css',
  'css/lumina-feed.css',
  'css/lumina-mini-player.css',
  'css/lumina-mobile-premium.css',
  'css/lumina-reflection-tts.css',
  'css/lumina-chat-premium.css',
];

const PRIMARY_LUMINA_HTML = [
  'lumina.html',
  'lumina-tablica.html',
  'lumina-profile.html',
  'lumina.cezaryrgowski.html',
  'lumina.wiolettarogowska.html',
];

const OFF_BRAND_NEON_RE =
  /#(?:a855f7|8b5cf6|c084fc|ec4899|f472b6|facc15|fde047|0b1120|fbcfe8|e9d5ff|070b14|060814)\b|var\(--accent-(?:purple|pink|yellow)\)|rgba\(\s*(?:168\s*,\s*85\s*,\s*247|139\s*,\s*92\s*,\s*246|192\s*,\s*132\s*,\s*252|236\s*,\s*72\s*,\s*153|244\s*,\s*114\s*,\s*182|250\s*,\s*204\s*,\s*21|253\s*,\s*224\s*,\s*71|11\s*,\s*17\s*,\s*32|15\s*,\s*23\s*,\s*42|30\s*,\s*27\s*,\s*75|7\s*,\s*13\s*,\s*30)\b/i;

const MOJIBAKE_RE =
  /(?:EspaĂ±ol|FranĂ§ais|ZDJÄCIA|ZAPRO9a|PEĹNY|SPOĹECZNOŚĆ|Robert Ĺukasz Pio|Ĺadowanie|HASĹO|MAĹŻEĹSTWA|POZOSTAĹYCH|SĹOWA|BĹYSKAWICZNA|BEZWZGLÄDN|BEZPIECZEĹSTW|Ă—|Â[·§])/; // + zepsute ×, ·, § (L0 16.11.2026: „Ă—” w banerze cookies)

test('design tokens and dark LUMINA stylesheets enforce Obsidian, Champagne Gold and Classic Orange #FF7A00 without off-brand neon accents', async () => {
  const tokensCss = await readRepoFile('src/styles/tokens.css');
  assert.match(tokensCss, /--cc-bg-primary:\s*#0a0a0c\b/i);
  assert.match(tokensCss, /--cc-surface-obsidian:\s*#141418\b/i);
  assert.match(tokensCss, /--cc-bg-card:\s*rgba\(\s*20,\s*20,\s*24,\s*0\.86\s*\)/i);
  assert.match(tokensCss, /--cc-gold-primary:\s*#C4A35A\b/i);
  assert.match(tokensCss, /--cc-btn-orange:\s*#FF7A00\b/i);
  assert.match(tokensCss, /--cc-btn-orange-hover:\s*#FF8C33\b/i);
  assert.match(tokensCss, /--cc-btn-orange-active:\s*#E66A00\b/i);
  assert.doesNotMatch(tokensCss, /--cc-(?:pink|purple)-accent\b/i);

  for (const relPath of DARK_DESIGN_FILES) {
    const content = await readRepoFile(relPath);
    const match = content.match(OFF_BRAND_NEON_RE);
    assert.equal(
      match,
      null,
      `${relPath} contains off-brand neon color token: ${match ? match[0] : ''}`,
    );
  }

  const miniPlayerCss = await readRepoFile('css/lumina-mini-player.css');
  assert.match(miniPlayerCss, /\.lmp-btn-play[\s\S]*?#FF7A00/i);

  const sharedShellCss = await readRepoFile('css/lumina-shared-shell.css');
  assert.match(sharedShellCss, /#drawerAuthCtaBtn[\s\S]*?#FF7A00/i);
  assert.match(sharedShellCss, /#drawerAuthCtaBtn:hover[\s\S]*?#FF8C33/i);
  assert.match(sharedShellCss, /#drawerAuthCtaBtn:active[\s\S]*?#E66A00/i);
});

test('protected light-edition stylesheets preserve light contrast rules', async () => {
  const lightCss = await readRepoFile('css/lumina-light-edition.css');
  const profileStandardCss = await readRepoFile('css/lumina-profile-standard.css');

  assert.match(lightCss, /html\[data-lumina-theme="light"\]/);
  assert.match(lightCss, /#FAF9F6/i);
  assert.match(lightCss, /#FFFFFF/i);
  assert.match(profileStandardCss, /html\[data-lumina-theme="light"\]/);
  assert.match(profileStandardCss, /html\[data-theme="light"\]/);
  assert.match(profileStandardCss, /#0a0a0c/i);
  assert.match(profileStandardCss, /#141418/i);
});

test('mobile touch targets >= 44px, GPU-safe skeleton pulse, and reduced-motion rules are present', async () => {
  const sharedShellCss = await readRepoFile('css/lumina-shared-shell.css');
  const themeCss = await readRepoFile('css/lumina-theme.css');
  const miniPlayerCss = await readRepoFile('css/lumina-mini-player.css');
  const chatCss = await readRepoFile('css/lumina-chat-premium.css');

  assert.match(
    sharedShellCss,
    /@media\s*\(\s*max-width:\s*640px\s*\)[\s\S]*?#radioWidget[\s\S]*?width:\s*44px[\s\S]*?height:\s*44px/,
  );
  assert.match(
    sharedShellCss,
    /@media\s*\(\s*max-width:\s*640px\s*\)[\s\S]*?\.nav-menu-btn[\s\S]*?\.btn-nav-support[\s\S]*?min-width:\s*44px[\s\S]*?min-height:\s*44px/,
  );
  assert.match(
    sharedShellCss,
    /\.qa-close-btn[\s\S]*?min-width:\s*44px[\s\S]*?min-height:\s*44px/,
  );
  assert.match(sharedShellCss, /\.lumina-skeleton\b/);
  assert.match(sharedShellCss, /@keyframes\s+luminaSkeletonPulse\b/);
  assert.match(sharedShellCss, /:focus-visible\b[\s\S]*?#D4B578/i);

  for (const [name, content] of [
    ['css/lumina-shared-shell.css', sharedShellCss],
    ['css/lumina-theme.css', themeCss],
    ['css/lumina-mini-player.css', miniPlayerCss],
    ['css/lumina-chat-premium.css', chatCss],
  ]) {
    assert.match(
      content,
      /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)/,
      `${name} missing @media (prefers-reduced-motion: reduce)`,
    );
  }
});

test('primary LUMINA HTML files load lumina-a11y-shell.js, expose drawer/modal ARIA, and have zero encoding mojibake', async () => {
  for (const relPath of PRIMARY_LUMINA_HTML) {
    const html = await readRepoFile(relPath);
    assert.match(
      html,
      /<script\s+src="\/js\/lumina-a11y-shell\.js(?:\?[^"]*)?"\s+defer><\/script>/,
      `${relPath} missing deferred /js/lumina-a11y-shell.js`,
    );
    assert.match(
      html,
      /id="topNavMenuBtn"[\s\S]{0,300}aria-haspopup="true"[\s\S]{0,300}aria-controls="topNavDrawer"[\s\S]{0,300}aria-expanded="false"/,
      `${relPath} #topNavMenuBtn missing required ARIA attributes`,
    );
    assert.match(
      html,
      /id="topNavDrawer"[\s\S]{0,160}role="region"[\s\S]{0,160}aria-label="Menu nawigacji LUMINA"/,
      `${relPath} #topNavDrawer missing landmark ARIA attributes`,
    );
    assert.match(
      html,
      /id="drawerAuthCtaBtn"[\s\S]{0,220}background:#FF7A00;/i,
      `${relPath} #drawerAuthCtaBtn missing Classic Orange #FF7A00 CTA`,
    );
    assert.doesNotMatch(
      html,
      MOJIBAKE_RE,
      `${relPath} still contains Polish/Latin encoding mojibake`,
    );
  }

  for (const relPath of ['lumina.html', 'lumina-tablica.html']) {
    const html = await readRepoFile(relPath);
    assert.match(
      html,
      /id="luminaProfileQuickActionsModal"[\s\S]{0,160}role="dialog"[\s\S]{0,160}aria-modal="true"[\s\S]{0,160}aria-labelledby="qaName"/,
      `${relPath} #luminaProfileQuickActionsModal missing dialog ARIA attributes`,
    );
    assert.match(
      html,
      /class="qa-close-btn"[\s\S]{0,120}aria-label="Zamknij"/,
      `${relPath} .qa-close-btn missing aria-label="Zamknij"`,
    );
  }

  const wiolettaHtml = await readRepoFile('lumina.wiolettarogowska.html');
  assert.match(wiolettaHtml, /id="topNavMenuBtn"[\s\S]{0,360}min-height:44px;\s*min-width:44px/);
  assert.doesNotMatch(
    wiolettaHtml,
    /id="topNavMenuBtn"[\s\S]{0,400}rgba\(\s*168\s*,\s*85\s*,\s*247/,
  );

  const tablicaSrc = await readRepoFile('lumina-tablica.html');
  const tablicaLight = await readRepoFile('lumina-tablica-light.html');
  const marker = '<!-- PLIK GENEROWANY przez scripts/build-tablica-light.mjs z lumina-tablica.html — nie edytuj ręcznie -->';
  const expectedLight = tablicaSrc.replace(/<html(\s[^>]*)?>/i, (_m, attrs = '') => {
    const clean = String(attrs).replace(/\sdata-lumina-theme(-lock)?="[^"]*"/g, '');
    return `<html${clean} data-lumina-theme="light" data-lumina-theme-lock="light">\n${marker}`;
  });
  assert.equal(tablicaLight, expectedLight, 'lumina-tablica-light.html is out of sync with lumina-tablica.html');
  assert.match(tablicaLight, /data-lumina-theme-lock="light"/);
  assert.match(
    tablicaLight,
    /<script\s+src="\/js\/lumina-a11y-shell\.js(?:\?[^"]*)?"\s+defer><\/script>/,
  );
  assert.doesNotMatch(tablicaLight, MOJIBAKE_RE);
});

test('lumina-a11y-shell.js synchronizes drawer ARIA and supports Escape focus return', async () => {
  const scriptSrc = await readRepoFile('js/lumina-a11y-shell.js');
  const win = new Window({ url: 'https://polskieradio.cc/lumina.html' });
  const doc = win.document;

  doc.body.innerHTML = `
    <div class="nav-menu-wrapper">
      <button type="button" id="topNavMenuBtn">Menu</button>
      <div id="topNavDrawer" style="display:none">
        <a href="/lumina" id="drawerLink1">LUMINA</a>
        <button type="button" id="drawerAction1">Akcja</button>
      </div>
    </div>
  `;

  let drawerVisible = false;
  win.toggleTopNavDrawer = () => {
    const drawer = doc.getElementById('topNavDrawer');
    drawerVisible = !drawerVisible;
    drawer.style.display = drawerVisible ? 'flex' : 'none';
  };
  win.closeTopNavDrawer = () => {
    const drawer = doc.getElementById('topNavDrawer');
    drawerVisible = false;
    drawer.style.display = 'none';
  };

  vm.runInNewContext(scriptSrc, {
    window: win,
    document: doc,
    MutationObserver: win.MutationObserver,
    WeakSet,
    setTimeout,
    clearTimeout,
  });

  const menuBtn = doc.getElementById('topNavMenuBtn');
  const drawer = doc.getElementById('topNavDrawer');
  const drawerAction = doc.getElementById('drawerAction1');

  assert.equal(menuBtn.getAttribute('aria-haspopup'), 'true');
  assert.equal(menuBtn.getAttribute('aria-controls'), 'topNavDrawer');
  assert.equal(menuBtn.getAttribute('aria-expanded'), 'false');
  assert.equal(drawer.getAttribute('role'), 'region');
  assert.equal(drawer.getAttribute('aria-hidden'), 'true');

  win.toggleTopNavDrawer();
  assert.equal(menuBtn.getAttribute('aria-expanded'), 'true');
  assert.equal(drawer.getAttribute('aria-hidden'), 'false');

  drawerAction.focus();
  const escEvent = new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
  doc.dispatchEvent(escEvent);

  assert.equal(escEvent.defaultPrevented, true);
  assert.equal(drawer.style.display, 'none');
  assert.equal(menuBtn.getAttribute('aria-expanded'), 'false');
  assert.equal(drawer.getAttribute('aria-hidden'), 'true');
  assert.equal(doc.activeElement, menuBtn);

  await win.close();
});

test('lumina-a11y-shell.js traps focus in #luminaProfileQuickActionsModal and restores trigger focus on Escape', async () => {
  const scriptSrc = await readRepoFile('js/lumina-a11y-shell.js');
  const win = new Window({ url: 'https://polskieradio.cc/lumina-tablica.html' });
  const doc = win.document;

  doc.body.innerHTML = `
    <button type="button" id="outsideCardBtn">Karta profilu</button>
    <div id="luminaProfileQuickActionsModal" style="display:none">
      <div class="quick-actions-sheet">
        <button type="button" class="qa-close-btn">X</button>
        <h3 id="qaName">Cezary Rogowski</h3>
        <button type="button" class="qa-action-btn" id="qaFirstAction">Wiadomość</button>
        <a href="/lumina-profile?u=cezary" class="qa-action-btn" id="qaLastLink">Otwórz Profil</a>
      </div>
    </div>
  `;

  win.openProfileQuickActions = () => {
    const modal = doc.getElementById('luminaProfileQuickActionsModal');
    modal.style.display = 'flex';
    modal.classList.add('open');
  };
  win.closeProfileQuickActions = () => {
    const modal = doc.getElementById('luminaProfileQuickActionsModal');
    modal.style.display = 'none';
    modal.classList.remove('open');
  };

  vm.runInNewContext(scriptSrc, {
    window: win,
    document: doc,
    MutationObserver: win.MutationObserver,
    WeakSet,
    setTimeout,
    clearTimeout,
  });

  const triggerBtn = doc.getElementById('outsideCardBtn');
  const modal = doc.getElementById('luminaProfileQuickActionsModal');
  const closeBtn = doc.querySelector('.qa-close-btn');
  const firstAction = doc.getElementById('qaFirstAction');
  const lastLink = doc.getElementById('qaLastLink');

  assert.equal(modal.getAttribute('role'), 'dialog');
  assert.equal(modal.getAttribute('aria-modal'), 'true');
  assert.equal(modal.getAttribute('aria-labelledby'), 'qaName');
  assert.equal(closeBtn.getAttribute('aria-label'), 'Zamknij');
  assert.equal(modal.getAttribute('aria-hidden'), 'true');

  triggerBtn.focus();
  win.openProfileQuickActions();

  assert.equal(modal.getAttribute('aria-hidden'), 'false');
  assert.equal(doc.activeElement, firstAction);

  lastLink.focus();
  const tabForward = new win.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
  doc.dispatchEvent(tabForward);
  assert.equal(tabForward.defaultPrevented, true);
  assert.equal(doc.activeElement, closeBtn);

  const tabBackward = new win.KeyboardEvent('keydown', {
    key: 'Tab',
    shiftKey: true,
    bubbles: true,
    cancelable: true,
  });
  doc.dispatchEvent(tabBackward);
  assert.equal(tabBackward.defaultPrevented, true);
  assert.equal(doc.activeElement, lastLink);

  const escEvent = new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
  doc.dispatchEvent(escEvent);
  assert.equal(escEvent.defaultPrevented, true);
  assert.equal(modal.classList.contains('open'), false);
  assert.equal(modal.getAttribute('aria-hidden'), 'true');
  assert.equal(doc.activeElement, triggerBtn);

  await win.close();
});
