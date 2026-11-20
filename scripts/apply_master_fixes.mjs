import fs from 'fs';

const masterHtmlPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/master-live.html';
let content = fs.readFileSync(masterHtmlPath, 'utf8');

// Target snippet to replace
const target = `        function unmuteSubframe() {
            isMutedDefault = false;
            hideMasterBanner();
            try {
                silenceFrame(getInactiveFrame(), true);
                if (isSwitchingWithBumper) {
                    if (bumperVideo && !bumperVideo.paused) {
                        bumperVideo.muted = false;
                    }
                    return;
                }
                if (bumperVideo) {
                    bumperVideo.muted = true;
                    try { bumperVideo.pause(); } catch(err) {}
                }
                unmuteFrame(getActiveFrame());
            } catch(e) {}
        }

        function muteSubframe() {
            isMutedDefault = true;
            try {
                if (bumperVideo) {
                    bumperVideo.muted = true;
                }
                silenceFrame(frameA, false);
                silenceFrame(frameB, false);
            } catch(e) {}
        }`;

const replacement = `        function updateMuteUi() {
            const isEn = (localStorage.getItem('cc_user_lang_choice') === 'en' || localStorage.getItem('lumina_lang') === 'en');
            const icon = document.getElementById('masterMuteIcon');
            const text = document.getElementById('masterMuteText');
            const btn = document.getElementById('masterMuteToggleBtn');
            const banner = document.getElementById('masterUnmuteBanner');
            if (isMutedDefault) {
                if (icon) icon.className = 'fa-solid fa-volume-xmark';
                if (text) text.textContent = isEn ? 'MUTED' : 'WYCISZONY';
                if (btn) {
                    btn.style.background = 'rgba(255, 255, 255, 0.15)';
                    btn.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                    btn.style.color = '#ffffff';
                }
                if (banner && !isEmbedMode) {
                    banner.style.display = 'flex';
                    banner.style.opacity = '1';
                }
            } else {
                if (icon) icon.className = 'fa-solid fa-volume-high';
                if (text) text.textContent = isEn ? 'SOUND: ON' : 'DŹWIĘK: WŁ';
                if (btn) {
                    btn.style.background = '#FF7A00';
                    btn.style.borderColor = '#FF7A00';
                    btn.style.color = '#1a0d00';
                }
                if (banner) {
                    banner.style.display = 'none';
                }
            }
        }

        function toggleMasterAudio(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            if (isMutedDefault) {
                unmuteSubframe();
            } else {
                muteSubframe();
            }
        }

        function unmuteSubframe() {
            isMutedDefault = false;
            hideMasterBanner();
            try {
                silenceFrame(getInactiveFrame(), true);
                if (isSwitchingWithBumper) {
                    if (bumperVideo && !bumperVideo.paused) {
                        bumperVideo.muted = false;
                    }
                    return;
                }
                if (bumperVideo) {
                    bumperVideo.muted = true;
                    try { bumperVideo.pause(); } catch(err) {}
                }
                unmuteFrame(getActiveFrame());
            } catch(e) {}
            updateMuteUi();
        }

        function muteSubframe() {
            isMutedDefault = true;
            try {
                if (bumperVideo) {
                    bumperVideo.muted = true;
                }
                silenceFrame(frameA, false);
                silenceFrame(frameB, false);
            } catch(e) {}
            updateMuteUi();
        }

        // ── I18N BILINGUAL SYSTEM (PL <-> EN) ──
        const DEKALOG_HTML_PL = \`
<div class="dekalog-segment">
    <div class="dekalog-item">
        <span class="dekalog-num"><i class="fa-solid fa-book-bible"></i></span>
        <span class="dekalog-text"><strong>Dziesięć przykazań Bożych wg Biblii w tł. ks. Jakuba Wujka (BJW)</strong></span>
        <span class="dekalog-separator">✦</span>
    </div>
    <div class="dekalog-item"><span class="dekalog-num">I.</span><span class="dekalog-text">Nie będziesz miał bogów cudzych przede mną.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">II.</span><span class="dekalog-text">Nie uczynisz sobie obrazu rytego ani żadnej podobizny tego, co jest na niebie w górze i co na ziemi nisko, ani z tych rzeczy, które są w wodach pod ziemią. Nie będziesz się im kłaniał ani służył. Ja jestem Pan, Bóg twój, mocny, zawistny, karzący nieprawość ojców na synach do trzeciego i czwartego pokolenia tych, którzy mnie nienawidzą; a czyniący miłosierdzie tysiącom tych, którzy mię miłują i strzegą przykazań moich.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">III.</span><span class="dekalog-text">Nie będziesz brał imienia Pana, Boga twego, nadaremno; bo nie będzie miał Pan za niewinnego tego, który by wziął imię Pana, Boga swego, nadaremno.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">IV.</span><span class="dekalog-text">Pamiętaj, abyś dzień sobotni święcił. Sześć dni robic będziesz i będziesz wykonywał wszystkie roboty twoje; ale dnia siódmego sabat Pana, Boga twego, jest: nie będziesz wykonywał weń żadnej roboty, ty i syn twój, i córka twoja, sługa twój i służebnica twoja, bydlę twoje i gość, który jest między bramami twymi. Przez sześć dni bowiem czynił Pan niebo i ziemię, i morze, i wszystko, co w nich jest, a odpoczął dnia siódmego; i dlatego pobłogosławił Pan dniowi sobotniemu i poświęcił go.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">V.</span><span class="dekalog-text">Czcij ojca twego i matkę twoją, abyś długo żył na ziemi, którą Pan, Bóg twój, da tobie.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">VI.</span><span class="dekalog-text">Nie będziesz zabijał.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">VII.</span><span class="dekalog-text">Nie będziesz cudzołożył.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">VIII.</span><span class="dekalog-text">Nie będziesz kradł.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">IX.</span><span class="dekalog-text">Nie będziesz mówił przeciw bliźniemu twemu świadectwa fałszywego.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">X.</span><span class="dekalog-text">Nie będziesz pożądał domu bliźniego twego, ani będziesz pragnął żony jego, ani sługi, ani służebnicy, ani wołu, ani osła, ani żadnej rzeczy, która jego jest.</span><span class="dekalog-separator">✦</span></div>
</div>
<!-- SET 2 -->
<div class="dekalog-segment">
    <div class="dekalog-item">
        <span class="dekalog-num"><i class="fa-solid fa-book-bible"></i></span>
        <span class="dekalog-text"><strong>Dziesięć przykazań Bożych wg Biblii w tł. ks. Jakuba Wujka (BJW)</strong></span>
        <span class="dekalog-separator">✦</span>
    </div>
    <div class="dekalog-item"><span class="dekalog-num">I.</span><span class="dekalog-text">Nie będziesz miał bogów cudzych przede mną.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">II.</span><span class="dekalog-text">Nie uczynisz sobie obrazu rytego ani żadnej podobizny tego, co jest na niebie w górze i co na ziemi nisko, ani z tych rzeczy, które są w wodach pod ziemią. Nie będziesz się im kłaniał ani służył. Ja jestem Pan, Bóg twój, mocny, zawistny, karzący nieprawość ojców na synach do trzeciego i czwartego pokolenia tych, którzy mnie nienawidzą; a czyniący miłosierdzie tysiącom tych, którzy mię miłują i strzegą przykazań moich.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">III.</span><span class="dekalog-text">Nie będziesz brał imienia Pana, Boga twego, nadaremno; bo nie będzie miał Pan za niewinnego tego, który by wziął imię Pana, Boga swego, nadaremno.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">IV.</span><span class="dekalog-text">Pamiętaj, abyś dzień sobotni święcił. Sześć dni robic będziesz i będziesz wykonywał wszystkie roboty twoje; ale dnia siódmego sabat Pana, Boga twego, jest: nie będziesz wykonywał weń żadnej roboty, ty i syn twój, i córka twoja, sługa twój i służebnica twoja, bydlę twoje i gość, który jest między bramami twymi. Przez sześć dni bowiem czynił Pan niebo i ziemię, i morze, i wszystko, co w nich jest, a odpoczął dnia siódmego; i dlatego pobłogosławił Pan dniowi sobotniemu i poświęcił go.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">V.</span><span class="dekalog-text">Czcij ojca twego i matkę twoją, abyś długo żył na ziemi, którą Pan, Bóg twój, da tobie.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">VI.</span><span class="dekalog-text">Nie będziesz zabijał.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">VII.</span><span class="dekalog-text">Nie będziesz cudzołożył.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">VIII.</span><span class="dekalog-text">Nie będziesz kradł.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">IX.</span><span class="dekalog-text">Nie będziesz mówił przeciw bliźniemu twemu świadectwa fałszywego.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">X.</span><span class="dekalog-text">Nie będziesz pożądał domu bliźniego twego, ani będziesz pragnął żony jego, ani sługi, ani służebnicy, ani wołu, ani osła, ani żadnej rzeczy, która jego jest.</span><span class="dekalog-separator">✦</span></div>
</div>\`;

        const DEKALOG_HTML_EN = \`
<div class="dekalog-segment">
    <div class="dekalog-item">
        <span class="dekalog-num"><i class="fa-solid fa-book-bible"></i></span>
        <span class="dekalog-text"><strong>The Ten Commandments of God according to the Holy Scriptures</strong></span>
        <span class="dekalog-separator">✦</span>
    </div>
    <div class="dekalog-item"><span class="dekalog-num">I.</span><span class="dekalog-text">You shall have no other gods before Me.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">II.</span><span class="dekalog-text">You shall not make for yourself a carved image, or any likeness of anything that is in heaven above or that is in the earth beneath. You shall not bow down to them nor serve them. For I, the Lord your God, am a jealous God.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">III.</span><span class="dekalog-text">You shall not take the name of the Lord your God in vain, for the Lord will not hold him guiltless who takes His name in vain.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">IV.</span><span class="dekalog-text">Remember the Sabbath day, to keep it holy. Six days you shall labor and do all your work, but the seventh day is the Sabbath of the Lord your God. For in six days the Lord made the heavens and the earth, the sea, and all that is in them, and rested the seventh day.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">V.</span><span class="dekalog-text">Honor your father and your mother, that your days may be long upon the land which the Lord your God is giving you.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">VI.</span><span class="dekalog-text">You shall not murder.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">VII.</span><span class="dekalog-text">You shall not commit adultery.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">VIII.</span><span class="dekalog-text">You shall not steal.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">IX.</span><span class="dekalog-text">You shall not bear false witness against your neighbor.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">X.</span><span class="dekalog-text">You shall not covet your neighbor's house; you shall not covet your neighbor's wife, nor his manservant, nor his maidservant, nor his ox, nor his donkey, nor anything that is your neighbor's.</span><span class="dekalog-separator">✦</span></div>
</div>
<!-- SET 2 -->
<div class="dekalog-segment">
    <div class="dekalog-item">
        <span class="dekalog-num"><i class="fa-solid fa-book-bible"></i></span>
        <span class="dekalog-text"><strong>The Ten Commandments of God according to the Holy Scriptures</strong></span>
        <span class="dekalog-separator">✦</span>
    </div>
    <div class="dekalog-item"><span class="dekalog-num">I.</span><span class="dekalog-text">You shall have no other gods before Me.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">II.</span><span class="dekalog-text">You shall not make for yourself a carved image, or any likeness of anything that is in heaven above or that is in the earth beneath. You shall not bow down to them nor serve them. For I, the Lord your God, am a jealous God.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">III.</span><span class="dekalog-text">You shall not take the name of the Lord your God in vain, for the Lord will not hold him guiltless who takes His name in vain.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">IV.</span><span class="dekalog-text">Remember the Sabbath day, to keep it holy. Six days you shall labor and do all your work, but the seventh day is the Sabbath of the Lord your God. For in six days the Lord made the heavens and the earth, the sea, and all that is in them, and rested the seventh day.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">V.</span><span class="dekalog-text">Honor your father and your mother, that your days may be long upon the land which the Lord your God is giving you.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">VI.</span><span class="dekalog-text">You shall not murder.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">VII.</span><span class="dekalog-text">You shall not commit adultery.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">VIII.</span><span class="dekalog-text">You shall not steal.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">IX.</span><span class="dekalog-text">You shall not bear false witness against your neighbor.</span><span class="dekalog-separator">✦</span></div>
    <div class="dekalog-item"><span class="dekalog-num">X.</span><span class="dekalog-text">You shall not covet your neighbor's house; you shall not covet your neighbor's wife, nor his manservant, nor his maidservant, nor his ox, nor his donkey, nor anything that is your neighbor's.</span><span class="dekalog-separator">✦</span></div>
</div>\`;

        const CCN_TICKER_HTML_PL = \`
<!-- SET 1 -->
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-now"><i class="fa-solid fa-tower-broadcast"></i> TERAZ W EMISJI</span>
    <span><strong class="dynamic-current-program gold-text">BIBLIA ŚPIEWANA & WORSHIP 24/7</strong> — Całodobowa transmisja Słowa Bożego i pieśni chwały</span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-bible"><i class="fa-solid fa-book-bible"></i> DARMOWA BIBLIA PDF</span>
    <span>Pobierz bezpłatny egzemplarz Pisma Świętego (UBG / Wujek) na <strong class="gold-text">polskieradio.cc/biblia-do-pobrania</strong></span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-sms"><i class="fa-solid fa-box-archive"></i> BIBLIA W DRUKU</span>
    <span>Zamów bezpłatną drukowaną Biblię — wyślij SMS: <strong class="gold-text">BIBLIA</strong> pod numer <strong class="gold-text">507 821 789</strong></span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-lumina"><i class="fa-solid fa-globe"></i> PORTAL LUMINA</span>
    <span>Pierwsza polska chrześcijańska platforma relacji i wartości — wolna od hejtu i komercji • Wejdź na <strong class="gold-text">polskieradio.cc/lumina</strong></span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-support"><i class="fa-solid fa-heart"></i> WSPARCIE MISJI</span>
    <span>Zostań patronem: <strong class="gold-text">patronite.pl/osobowoscplus</strong> • BLIK: <strong class="gold-text">537 137 043</strong> • Nr konta: <strong class="gold-text">48 2910 0006 0000 0000 0527 2629</strong></span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-app"><i class="fa-solid fa-mobile-screen"></i> APLIKACJE CC</span>
    <span>Pobierz aplikację mobilną <strong class="gold-text">„Dobrze, że jesteś”</strong> (Google Play) oraz PWA na <strong class="gold-text">cclite.pl</strong></span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-contact"><i class="fa-solid fa-envelope"></i> KONTAKT</span>
    <span>Napisz do redakcji: <strong class="gold-text">polskiercctv@gmail.com</strong> | <strong class="gold-text">radiochristianculture@gmail.com</strong></span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-next"><i class="fa-solid fa-forward-step"></i> W RAMÓWCE</span>
    <span><strong>Codzienne Uwielbienie • Apokalipsa Dzień po Dniu • Zjednoczeni za Polskę • Studium Biblijne</strong></span>
    <span class="separator">✦</span>
</div>
<!-- SET 2 -->
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-now"><i class="fa-solid fa-tower-broadcast"></i> TERAZ W EMISJI</span>
    <span><strong class="dynamic-current-program gold-text">BIBLIA ŚPIEWANA & WORSHIP 24/7</strong> — Całodobowa transmisja Słowa Bożego i pieśni chwały</span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-bible"><i class="fa-solid fa-book-bible"></i> DARMOWA BIBLIA PDF</span>
    <span>Pobierz bezpłatny egzemplarz Pisma Świętego (UBG / Wujek) na <strong class="gold-text">polskieradio.cc/biblia-do-pobrania</strong></span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-sms"><i class="fa-solid fa-box-archive"></i> BIBLIA W DRUKU</span>
    <span>Zamów bezpłatną drukowaną Biblię — wyślij SMS: <strong class="gold-text">BIBLIA</strong> pod numer <strong class="gold-text">507 821 789</strong></span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-lumina"><i class="fa-solid fa-globe"></i> PORTAL LUMINA</span>
    <span>Pierwsza polska chrześcijańska platforma relacji i wartości — wolna od hejtu i komercji • Wejdź na <strong class="gold-text">polskieradio.cc/lumina</strong></span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-support"><i class="fa-solid fa-heart"></i> WSPARCIE MISJI</span>
    <span>Zostań patronem: <strong class="gold-text">patronite.pl/osobowoscplus</strong> • BLIK: <strong class="gold-text">537 137 043</strong> • Nr konta: <strong class="gold-text">48 2910 0006 0000 0000 0527 2629</strong></span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-app"><i class="fa-solid fa-mobile-screen"></i> APLIKACJE CC</span>
    <span>Pobierz aplikację mobilną <strong class="gold-text">„Dobrze, że jesteś”</strong> (Google Play) oraz PWA na <strong class="gold-text">cclite.pl</strong></span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-contact"><i class="fa-solid fa-envelope"></i> KONTAKT</span>
    <span>Napisz do redakcji: <strong class="gold-text">polskiercctv@gmail.com</strong> | <strong class="gold-text">radiochristianculture@gmail.com</strong></span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-next"><i class="fa-solid fa-forward-step"></i> W RAMÓWCE</span>
    <span><strong>Codzienne Uwielbienie • Apokalipsa Dzień po Dniu • Zjednoczeni za Polskę • Studium Biblijne</strong></span>
    <span class="separator">✦</span>
</div>\`;

        const CCN_TICKER_HTML_EN = \`
<!-- SET 1 -->
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-now"><i class="fa-solid fa-tower-broadcast"></i> ON AIR NOW</span>
    <span><strong class="dynamic-current-program gold-text">SINGING BIBLE & WORSHIP 24/7</strong> — 24/7 continuous broadcast of God's Word and songs of praise</span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-bible"><i class="fa-solid fa-book-bible"></i> FREE BIBLE PDF</span>
    <span>Download a free digital copy of the Holy Scriptures at <strong class="gold-text">polskieradio.cc/biblia-do-pobrania</strong></span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-sms"><i class="fa-solid fa-box-archive"></i> PRINTED BIBLE</span>
    <span>Order a free printed Bible — send SMS: <strong class="gold-text">BIBLIA</strong> to <strong class="gold-text">+48 507 821 789</strong></span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-lumina"><i class="fa-solid fa-globe"></i> LUMINA PORTAL</span>
    <span>The global Christian relational community — free of hate and commercialism • Visit <strong class="gold-text">polskieradio.cc/lumina</strong></span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-support"><i class="fa-solid fa-heart"></i> MISSION SUPPORT</span>
    <span>Become a Patron: <strong class="gold-text">patronite.pl/osobowoscplus</strong> • Bank Account: <strong class="gold-text">48 2910 0006 0000 0000 0527 2629</strong></span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-app"><i class="fa-solid fa-mobile-screen"></i> CC APPS</span>
    <span>Download mobile app <strong class="gold-text">"Glad You Are Here"</strong> (Google Play) & PWA at <strong class="gold-text">cclite.pl</strong></span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-contact"><i class="fa-solid fa-envelope"></i> CONTACT</span>
    <span>Write to the editorial team: <strong class="gold-text">polskiercctv@gmail.com</strong></span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-next"><i class="fa-solid fa-forward-step"></i> ON SCHEDULE</span>
    <span><strong>Daily Worship • Book of Revelation Day by Day • United for Poland • Bible Study</strong></span>
    <span class="separator">✦</span>
</div>
<!-- SET 2 -->
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-now"><i class="fa-solid fa-tower-broadcast"></i> ON AIR NOW</span>
    <span><strong class="dynamic-current-program gold-text">SINGING BIBLE & WORSHIP 24/7</strong> — 24/7 continuous broadcast of God's Word and songs of praise</span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-bible"><i class="fa-solid fa-book-bible"></i> FREE BIBLE PDF</span>
    <span>Download a free digital copy of the Holy Scriptures at <strong class="gold-text">polskieradio.cc/biblia-do-pobrania</strong></span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-sms"><i class="fa-solid fa-box-archive"></i> PRINTED BIBLE</span>
    <span>Order a free printed Bible — send SMS: <strong class="gold-text">BIBLIA</strong> to <strong class="gold-text">+48 507 821 789</strong></span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-lumina"><i class="fa-solid fa-globe"></i> LUMINA PORTAL</span>
    <span>The global Christian relational community — free of hate and commercialism • Visit <strong class="gold-text">polskieradio.cc/lumina</strong></span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-support"><i class="fa-solid fa-heart"></i> MISSION SUPPORT</span>
    <span>Become a Patron: <strong class="gold-text">patronite.pl/osobowoscplus</strong> • Bank Account: <strong class="gold-text">48 2910 0006 0000 0000 0527 2629</strong></span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-app"><i class="fa-solid fa-mobile-screen"></i> CC APPS</span>
    <span>Download mobile app <strong class="gold-text">"Glad You Are Here"</strong> (Google Play) & PWA at <strong class="gold-text">cclite.pl</strong></span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-contact"><i class="fa-solid fa-envelope"></i> CONTACT</span>
    <span>Write to the editorial team: <strong class="gold-text">polskiercctv@gmail.com</strong></span>
    <span class="separator">✦</span>
</div>
<div class="ccn-ticker-item">
    <span class="ccn-badge ccn-badge-next"><i class="fa-solid fa-forward-step"></i> ON SCHEDULE</span>
    <span><strong>Daily Worship • Book of Revelation Day by Day • United for Poland • Bible Study</strong></span>
    <span class="separator">✦</span>
</div>\`;

        window.updateMasterLiveLanguage = function(lang) {
            const isEn = (lang === 'en');
            const dekalogEl = document.getElementById('dekalogContent');
            if (dekalogEl) {
                dekalogEl.innerHTML = isEn ? DEKALOG_HTML_EN : DEKALOG_HTML_PL;
            }
            const tickerEl = document.getElementById('ccnTickerContent');
            if (tickerEl) {
                tickerEl.innerHTML = isEn ? CCN_TICKER_HTML_EN : CCN_TICKER_HTML_PL;
            }
            const liveText = document.querySelector('.ccn-live-text');
            if (liveText) {
                liveText.textContent = isEn ? 'LIVE' : 'NA ŻYWO';
            }
            const bannerSpan = document.querySelector('#masterUnmuteBanner span');
            if (bannerSpan) {
                bannerSpan.textContent = isEn ? 'CLICK TO UNMUTE 24/7 LIVE BROADCAST' : 'KLIKNIJ, ABY WŁĄCZYĆ DŹWIĘK TRANSMISJI NA ŻYWO';
            }
            const l3Tag = document.querySelector('#mlL3 .t');
            if (l3Tag) {
                l3Tag.textContent = isEn ? 'RECOMMENDED' : 'POLECAMY';
            }
            const nowTag = document.querySelector('#mlPromo .ml-now b');
            if (nowTag) {
                nowTag.textContent = isEn ? 'NOW' : 'TERAZ';
            }
            const headTag = document.querySelector('#mlPromo .ml-head');
            if (headTag) {
                headTag.textContent = isEn ? 'RECOMMENDED' : 'POLECAMY';
            }
            updateMuteUi();

            // Notify subframes of language change
            [frameA, frameB].forEach(f => {
                try {
                    if (f && f.contentWindow) {
                        f.contentWindow.postMessage({ type: 'SET_LANGUAGE', lang: lang }, '*');
                    }
                } catch(e){}
            });
        };

        window.addEventListener('ccLanguageChanged', (e) => {
            if (e && e.detail && e.detail.lang) {
                window.updateMasterLiveLanguage(e.detail.lang);
            }
        });

        // Initialize language on startup
        document.addEventListener('DOMContentLoaded', () => {
            const curLang = localStorage.getItem('cc_user_lang_choice') || localStorage.getItem('lumina_lang') || 'pl';
            if (curLang === 'en') {
                window.updateMasterLiveLanguage('en');
            }
            updateMuteUi();
        });`;

if (!content.includes(target)) {
  console.error('Target snippet not found in master-live.html!');
  process.exit(1);
}

content = content.replace(target, replacement);
fs.writeFileSync(masterHtmlPath, content, 'utf8');
console.log('Successfully updated master-live.html with mute UI and i18n!');
