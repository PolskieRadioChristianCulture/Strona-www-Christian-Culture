import fs from 'node:fs';
import path from 'node:path';

const htmlPath = path.resolve('Ewangelia.html');
const indexPath = path.resolve('Ewangelia/index.html');

let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Update hreflang tags
const oldHreflangRegex = /<link rel="alternate" hreflang="pl" href="https:\/\/polskieradio\.cc\/Ewangelia">[\s\S]*?<link rel="alternate" hreflang="x-default" href="https:\/\/polskieradio\.cc\/Ewangelia">/;

const newHreflang = `  <link rel="alternate" hreflang="pl" href="https://polskieradio.cc/Ewangelia">
  <link rel="alternate" hreflang="en" href="https://polskieradio.cc/Ewangelia?lang=en">
  <link rel="alternate" hreflang="de" href="https://polskieradio.cc/Ewangelia?lang=de">
  <link rel="alternate" hreflang="uk" href="https://polskieradio.cc/Ewangelia?lang=uk">
  <link rel="alternate" hreflang="es" href="https://polskieradio.cc/Ewangelia?lang=es">
  <link rel="alternate" hreflang="ru" href="https://polskieradio.cc/Ewangelia?lang=ru">
  <link rel="alternate" hreflang="zh" href="https://polskieradio.cc/Ewangelia?lang=zh">
  <link rel="alternate" hreflang="fr" href="https://polskieradio.cc/Ewangelia?lang=fr">
  <link rel="alternate" hreflang="pt" href="https://polskieradio.cc/Ewangelia?lang=pt">
  <link rel="alternate" hreflang="ar" href="https://polskieradio.cc/Ewangelia?lang=ar">
  <link rel="alternate" hreflang="hi" href="https://polskieradio.cc/Ewangelia?lang=hi">
  <link rel="alternate" hreflang="id" href="https://polskieradio.cc/Ewangelia?lang=id">
  <link rel="alternate" hreflang="it" href="https://polskieradio.cc/Ewangelia?lang=it">
  <link rel="alternate" hreflang="ja" href="https://polskieradio.cc/Ewangelia?lang=ja">
  <link rel="alternate" hreflang="ko" href="https://polskieradio.cc/Ewangelia?lang=ko">
  <link rel="alternate" hreflang="x-default" href="https://polskieradio.cc/Ewangelia">`;

html = html.replace(oldHreflangRegex, newHreflang.trim());

// 2. Update topbar-lang-switcher
const oldTopbarRegex = /<div class="topbar-lang-switcher"[\s\S]*?<\/div>/;
const newTopbar = `<div class="topbar-lang-switcher" role="navigation" aria-label="Wybierz język / Select language">
        <button type="button" class="lang-btn is-active" data-lang="pl" aria-pressed="true">PL</button>
        <button type="button" class="lang-btn" data-lang="en" aria-pressed="false">EN</button>
        <button type="button" class="lang-btn" data-lang="de" aria-pressed="false">DE</button>
        <button type="button" class="lang-btn" data-lang="uk" aria-pressed="false">UK</button>
        <button type="button" class="lang-btn" data-lang="es" aria-pressed="false">ES</button>
        <button type="button" class="lang-btn" data-lang="ru" aria-pressed="false">RU</button>
        <button type="button" class="lang-btn" data-lang="zh" aria-pressed="false">ZH</button>
        <button type="button" class="lang-btn" data-lang="fr" aria-pressed="false">FR</button>
        <button type="button" class="lang-btn" data-lang="pt" aria-pressed="false">PT</button>
        <button type="button" class="lang-btn" data-lang="ar" aria-pressed="false">AR</button>
        <button type="button" class="lang-btn" data-lang="hi" aria-pressed="false">HI</button>
        <button type="button" class="lang-btn" data-lang="id" aria-pressed="false">ID</button>
        <button type="button" class="lang-btn" data-lang="it" aria-pressed="false">IT</button>
        <button type="button" class="lang-btn" data-lang="ja" aria-pressed="false">JA</button>
        <button type="button" class="lang-btn" data-lang="ko" aria-pressed="false">KO</button>
      </div>`;

html = html.replace(oldTopbarRegex, newTopbar);

// 3. Update site-menu menu-lang-pills
const oldMenuPillsRegex = /<div class="menu-lang-group">[\s\S]*?<\/div>\s*<\/dialog>/;
const newMenuPills = `<div class="menu-lang-group">
      <span class="menu-lang-title">Język / Language (15 języków):</span>
      <div class="menu-lang-pills">
        <button type="button" class="lang-pill is-active" data-lang="pl">Polski</button>
        <button type="button" class="lang-pill" data-lang="en">English</button>
        <button type="button" class="lang-pill" data-lang="de">Deutsch</button>
        <button type="button" class="lang-pill" data-lang="uk">Українська</button>
        <button type="button" class="lang-pill" data-lang="es">Español</button>
        <button type="button" class="lang-pill" data-lang="ru">Русский</button>
        <button type="button" class="lang-pill" data-lang="zh">中文 (简体)</button>
        <button type="button" class="lang-pill" data-lang="fr">Français</button>
        <button type="button" class="lang-pill" data-lang="pt">Português</button>
        <button type="button" class="lang-pill" data-lang="ar">العربية</button>
        <button type="button" class="lang-pill" data-lang="hi">हिन्दी</button>
        <button type="button" class="lang-pill" data-lang="id">Bahasa Indonesia</button>
        <button type="button" class="lang-pill" data-lang="it">Italiano</button>
        <button type="button" class="lang-pill" data-lang="ja">日本語</button>
        <button type="button" class="lang-pill" data-lang="ko">한국어</button>
      </div>
    </div>
  </dialog>`;

html = html.replace(oldMenuPillsRegex, newMenuPills);

// 4. Update prayerLangPills
const oldPrayerPillsRegex = /<div class="prayer-lang-pills">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<blockquote class="prayer-verse-box">/;
const newPrayerPills = `<div class="prayer-lang-pills" id="prayerLangPills">
              <button type="button" class="lang-pill is-active" data-lang="pl" aria-pressed="true">Polski</button>
              <button type="button" class="lang-pill" data-lang="en" aria-pressed="false">English</button>
              <button type="button" class="lang-pill" data-lang="de" aria-pressed="false">Deutsch</button>
              <button type="button" class="lang-pill" data-lang="uk" aria-pressed="false">Українська</button>
              <button type="button" class="lang-pill" data-lang="es" aria-pressed="false">Español</button>
              <button type="button" class="lang-pill" data-lang="ru" aria-pressed="false">Русский</button>
              <button type="button" class="lang-pill" data-lang="zh" aria-pressed="false">中文 (简体)</button>
              <button type="button" class="lang-pill" data-lang="fr" aria-pressed="false">Français</button>
              <button type="button" class="lang-pill" data-lang="pt" aria-pressed="false">Português</button>
              <button type="button" class="lang-pill" data-lang="ar" aria-pressed="false">العربية</button>
              <button type="button" class="lang-pill" data-lang="hi" aria-pressed="false">हिन्दी</button>
              <button type="button" class="lang-pill" data-lang="id" aria-pressed="false">Bahasa Indonesia</button>
              <button type="button" class="lang-pill" data-lang="it" aria-pressed="false">Italiano</button>
              <button type="button" class="lang-pill" data-lang="ja" aria-pressed="false">日本語</button>
              <button type="button" class="lang-pill" data-lang="ko" aria-pressed="false">한국어</button>
            </div>
          </div>
        </div>

        <blockquote class="prayer-verse-box">`;

html = html.replace(oldPrayerPillsRegex, newPrayerPills);

fs.writeFileSync(htmlPath, html, 'utf8');
fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully updated Ewangelia.html and Ewangelia/index.html with 15 languages (identical: ' + (fs.readFileSync(htmlPath, 'utf8') === fs.readFileSync(indexPath, 'utf8')) + ')');
