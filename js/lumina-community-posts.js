/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA COMMUNITY POSTS - IMMUTABLE PERMANENT POSTS REPOSITORY & SAFETY SHIELD
 * Centralny, zabezpieczony rejestr wszystkich wpisów społeczności LUMINA
 * Zapewnia 100% odporność na utratę treści i awarie skryptów.
 * ══════════════════════════════════════════════════════════════════════════
 */

(function(global) {
    'use strict';

    function safeFormatTimestamp(dateOrString, fallback) {
        if (!dateOrString) return fallback || 'Przed chwilą';
        try {
            let d;
            if (typeof dateOrString === 'object' && dateOrString instanceof Date) {
                d = dateOrString;
            } else if (typeof dateOrString === 'number') {
                d = new Date(dateOrString);
            } else if (typeof dateOrString === 'string') {
                const parsed = Date.parse(dateOrString);
                if (!isNaN(parsed) && (dateOrString.includes('-') || dateOrString.includes('T') || dateOrString.includes(':'))) {
                    d = new Date(parsed);
                } else {
                    return dateOrString;
                }
            } else {
                return fallback || 'Przed chwilą';
            }

            const now = new Date();
            const diffMs = now - d;
            const diffMin = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMin / 60);
            const pad = (n) => n < 10 ? '0' + n : n;
            const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

            if (diffMin < 60) return `${Math.max(1, diffMin)} min temu`;
            if (now.toDateString() === d.toDateString()) return `Dzisiaj o ${timeStr}`;

            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            if (yesterday.toDateString() === d.toDateString()) return `Wczoraj o ${timeStr}`;

            return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}, ${timeStr}`;
        } catch(e) {
            return fallback || 'Przed chwilą';
        }
    }

    const LUMINA_CORE_POSTS_DATA = [
        {
            "id": "post_premiera_globalny_reset_mariusz_adamczyk_20261114",
            "type": "post",
            "category": "sds",
            "isArticle": false,
            "author": "Mariusz Adamczyk",
            "authorSlug": "mariusz",
            "authorAvatar": "/images/team/mariusz-duszpasterz.jpg",
            "authorRole": "Gospodarz Programu • Studio Dobrego Słowa",
            "authorBadge": "🔥 PREMIERA SDS • JUTRO 21:00",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,#c2410c,#ea580c);border:1.5px solid #ff7a00;color:#fff;font-weight:800;box-shadow:0 0 10px rgba(255,122,0,0.4);\" title=\"🔥 PREMIERA SDS\"><i class=\"fa-solid fa-fire\"></i> <span class=\"badge-type-tag-text\">PREMIERA • STUDIO DOBREGO SŁOWA</span></span>",
            "time": "Wydarzenie • Premiera: Sobota, 14 listopada o 21:00",
            "title": "GLOBALNY RESET — Premiera programu w Studio Dobrego Słowa (Jutro, godz. 21:00)",
            "text": "Czy świat zmierza ku nieodwracalnemu przełomowi? Jakie siły kształtują globalną rzeczywistość i co na ten temat mówi Pismo Święte?\n\nJuż jutro (sobota, 14 listopada) o godzinie 21:00 zapraszam na premierę mojego najnowszego programu „GLOBALNY RESET” w Studio Dobrego Słowa. Zobacz rzetelną analizę opartą na faktach, Biblii i Bożej perspektywie.\n\n🔔 Ustaw powiadomienie (dzwoneczek) na YouTube, aby nie przegapić premiery i dołączyć do dyskusji na żywo:\n🔗 https://youtu.be/UHAcOhDvlys",
            "desc": "Premiera programu „GLOBALNY RESET” w Studio Dobrego Słowa. Prowadzi Mariusz Adamczyk. Sobota, 14 listopada o 21:00 na YouTube.",
            "image": "/images/news/art-globalny-reset-premiera-sds.jpg",
            "imageUrl": "/images/news/art-globalny-reset-premiera-sds.jpg",
            "actionText": "Ustaw Przypomnienie na YouTube ➔",
            "actionUrl": "https://youtu.be/UHAcOhDvlys",
            "externalUrl": "https://youtu.be/UHAcOhDvlys",
            "externalUrlLabel": "Oglądaj Premierę na YouTube ➔",
            "sourceUrl": "https://youtu.be/UHAcOhDvlys",
            "sourceSlug": "globalny-reset-premiera",
            "likes": 142,
            "amen": 128,
            "createdAtTimestamp": 1794580000000,
            "_sortTs": 1794599999000,
            "_isNewlyPublished": true,
            "_isFreshSpotlight": true,
            "_isTopSpotlight": true
        },
        {
            "id": "post_art_95_tez_marcina_lutra_1517",
            "type": "post",
            "category": "historia",
            "isArticle": true,
            "author": "Cezary Rogowski",
            "authorSlug": "cezaryrgowski",
            "authorAvatar": "avatar_cezary_official.jpg",
            "authorRole": "Założyciel Christian Culture ✨ • Redakcja Teologiczna",
            "authorBadge": "📜 DOKUMENT ŹRÓDŁOWY • DZIEŃ REFORMACJI",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,#b45309,#78350f);border:1.5px solid #f59e0b;color:#fff;font-weight:800;box-shadow:0 0 10px rgba(245,158,11,0.4);\" title=\"📜 DOKUMENT ŹRÓDŁOWY • 95 TEZ LUTRA\"><i class=\"fa-solid fa-scroll\"></i> <span class=\"badge-type-tag-text\">DZIEŃ REFORMACJI • DOKUMENT ŹRÓDŁOWY</span></span>",
            "time": "31 października 2026 • 📜 Dzień Reformacji",
            "title": "95 tez Marcina Lutra (Wittenberga 1517) – Pełny tekst źródłowy w nowej redakcji polskiej",
            "text": "31 października wspominamy Dzień Reformacji — 509 lat od chwili, gdy Marcin Luter ogłosił w Wittenberdze 95 tez przeciw nadużyciom odpustowym, zapoczątkowując powrót do Pisma Świętego i zbawienia z łaski.\n\nOpublikowaliśmy w zasobach Christian Culture pełny, autentyczny tekst wszystkich 95 tez w nowej redakcji polskiej, skonfrontowanej z tekstem łacińskim, wraz z wyszukiwarką w treści tez, wstępem i notą źródłową.\n\nZapraszam do lektury pełnego dokumentu źródłowego oraz mojego eseju teologicznego na portalu CCN Historia & Biblioteka:\n🔗 https://polskieradio.cc/historia/95-tez-marcina-lutra-wittenberga-1517",
            "desc": "Pełny tekst historyczny: 95 tez Marcina Lutra z 31 października 1517 roku w nowej polskiej redakcji skonfrontowanej z tekstem łacińskim.",
            "image": "/images/news/95-tez-marcina-lutra-wittenberga-1517.jpg",
            "imageUrl": "/images/news/95-tez-marcina-lutra-wittenberga-1517.jpg",
            "actionText": "Przeczytaj Pełny Tekst 95 Tez (18 min) ➔",
            "actionUrl": "https://polskieradio.cc/historia/95-tez-marcina-lutra-wittenberga-1517",
            "externalUrl": "https://polskieradio.cc/historia/95-tez-marcina-lutra-wittenberga-1517",
            "externalUrlLabel": "Przeczytaj Pełny Tekst 95 Tez (18 min) ➔",
            "sourceUrl": "https://polskieradio.cc/historia/95-tez-marcina-lutra-wittenberga-1517",
            "sourceSlug": "95-tez-marcina-lutra",
            "likes": 517,
            "amen": 495,
            "createdAtTimestamp": 1793444000000,
            "_sortTs": 1793444000000
        },
        {
            "id": "post_art_ai_si_antychryst_cezary_rogowski",
            "type": "post",
            "category": "si",
            "isArticle": true,
            "author": "Cezary Rogowski",
            "authorSlug": "cezaryrgowski",
            "authorAvatar": "avatar_cezary_official.jpg",
            "authorRole": "Założyciel Christian Culture ✨ • Redakcja Teologiczna",
            "authorBadge": "👑 ARTYKUŁ CCN • NOWE TECHNOLOGIE & SI",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,#bb142e,#7f1d1d);border:1.5px solid #f87171;color:#fff;font-weight:800;box-shadow:0 0 10px rgba(187,20,46,0.4);\" title=\"👑 ARTYKUŁ CCN • NOWE TECHNOLOGIE & SI\"><i class=\"fa-solid fa-microchip\"></i> <span class=\"badge-type-tag-text\">NOWE TECHNOLOGIE & SI • EKSKLUZYWNY ARTYKUŁ</span></span>",
            "time": "4 października 2026 • 👑 Artykuł CCN Nowe Technologie & SI",
            "title": "AI, SI a biblijny Antychryst: Dlaczego sztuczna inteligencja nie może być Antychrystem",
            "text": "Dlaczego sztuczna inteligencja — w świetle krytyki biblijno-historycznej, proroczej i eschatologicznej — nie może być Antychrystem?\n\nWraz z rozwojem sztucznej inteligencji coraz częściej pojawiają się próby łączenia AI z biblijnym Antychrystem, „obrazem bestii” czy systemem kontroli z Apokalipsy 13. Z perspektywy rzetelnej analizy Pisma Świętego i proroctw Księgi Daniela takie utożsamienie jest jednak metodologicznie błędne.\n\nBiblia nie przedstawia Antychrysta jako technologii, lecz jako historyczny system religijno-polityczny o określonej sukcesji (1260 lat, mały róg, roszczenia do Bożego Prawa i kultu). Sztuczna inteligencja jest narzędziem, a nie biblijnym podmiotem proroczym.\n\nZapraszam do lektury pełnej, 20-rozdziałowej analizy egzegetycznej z tabelami porównawczymi na portalu CCN Nowe Technologie & SI:\n🔗 https://polskieradio.cc/si/ai-antychryst",
            "desc": "Dlaczego sztuczna inteligencja — w świetle krytyki biblijno-historycznej, proroczej i eschatologicznej — nie może być Antychrystem. Rzetelna analiza Cezarego Rogowskiego.",
            "image": "/images/si/ai-vs-antychryst.webp",
            "imageUrl": "/images/si/ai-vs-antychryst.webp",
            "actionText": "Czytaj Cały Artykuł (14 min) ➔",
            "actionUrl": "https://polskieradio.cc/si/ai-antychryst",
            "externalUrl": "https://polskieradio.cc/si/ai-antychryst",
            "externalUrlLabel": "Czytaj Cały Artykuł (14 min) ➔",
            "sourceUrl": "https://polskieradio.cc/si/ai-antychryst",
            "sourceSlug": "ai-antychryst",
            "likes": 428,
            "amen": 396,
            "createdAtTimestamp": 1791080000000,
            "_sortTs": 1791080000000
        },

        {
            "id": "post_ccmen_kurs_malzenski_feed",
            "type": "post",
            "author": "CC Men",
            "authorSlug": "ccmen",
            "authorAvatar": "logo_cc_men.jpg",
            "authorRole": "Formacja Mężczyzn & Wojownicy Wiary ⚔️",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,#f59e0b,#d97706);border:1px solid #f59e0b;color:#fff;font-weight:800;\" title=\"CC MEN • Polecany Kurs\"><i class=\"fa-solid fa-ring\"></i> <span class=\"badge-type-tag-text\">CC MEN • KURS MAŁŻEŃSKI</span></span>",
            "time": "Wyróżniona Premiera • Dla Mężczyzn & Randkowiczów",
            "title": "NIE BYLEJAKI KURS MAŁŻEŃSKI — Roman Chałupka: Prawdziwe Szczęście w Rodzinie",
            "text": "Bo miłość to decyzja, nie przypadek! ⚔️ Bracia, jeśli szukacie żony, randkujecie w portalu LUMINA lub planujecie małżeństwo — ten bezpłatny cykl wykładów to fundament mądrości, którego potrzebuje każdy odpowiedzialny mężczyzna.\n\nLepsza komunikacja • Większe zrozumienie • Większa bliskość • Biblijne wartości • Szczęśliwszy dom. Oglądaj całą serię na YouTube! Polecają @CezaryRogowski i @WiolettaRogowska #małżeństwo #randki #rodzina #świadectwo",
            "desc": "Roman Chałupka — Nie Bylejaki Kurs Małżeński: Prawdziwe szczęście w rodzinie. Cała playlista wykładów.",
            "image": "nie-bylejaki-kurs-malzenski.webp",
            "videoUrl": "https://www.youtube.com/playlist?list=PLdsZ3vCpkBY8",
            "youtubeUrl": "https://www.youtube.com/playlist?list=PLdsZ3vCpkBY8",
            "actionText": "Obejrzyj Całą Serię (Playlista) ▶",
            "actionUrl": "https://www.youtube.com/playlist?list=PLdsZ3vCpkBY8",
            "category": "ccmen",
            "likes": 268,
            "amen": 242,
            "createdAtTimestamp": 1789745000000,
            "_sortTs": 1789745000000,
            "_isNewlyPublished": true
        },
        {
            "id": "post_ccwomen_kurs_malzenski_feed",
            "type": "post",
            "author": "CC Women",
            "authorSlug": "ccwomen",
            "authorAvatar": "avatar_ccwomen_official_2026.jpg",
            "authorRole": "Społeczność Kobiet Wiary 🌸 • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,#ec4899,#be185d);border:1px solid #ec4899;color:#fff;font-weight:800;\" title=\"🌸 CC WOMEN • Polecany Kurs\"><i class=\"fa-solid fa-heart\"></i> <span class=\"badge-type-tag-text\">CC WOMEN • KURS MAŁŻEŃSKI</span></span>",
            "time": "Wyróżniona Premiera • Dla Kobiet & Randkowiczek",
            "title": "NIE BYLEJAKI KURS MAŁŻEŃSKI — Roman Chałupka: Prawdziwe Szczęście w Rodzinie",
            "text": "Bo miłość to decyzja, nie przypadek! 💖 Drogie Siostry i randkowiczki w portalu LUMINA — polecamy niezwykły cykl wykładów Romana Chałupki: Prawdziwe szczęście w rodzinie. Razem z Bogiem wszystko jest możliwe!\n\nLepsza komunikacja • Większe zrozumienie • Większa bliskość • Praktyczne wskazówki • Biblijne wartości • Szczęśliwszy dom. Oglądaj całą serię na YouTube! Zobacz kanały @CCMen oraz @CCWomen #małżeństwo #randki #modlitwa #wiara",
            "desc": "Roman Chałupka — Nie Bylejaki Kurs Małżeński: Prawdziwe szczęście w rodzinie. Cała playlista wykładów.",
            "image": "nie-bylejaki-kurs-malzenski.webp",
            "videoUrl": "https://www.youtube.com/playlist?list=PLdsZ3vCpkBY8",
            "youtubeUrl": "https://www.youtube.com/playlist?list=PLdsZ3vCpkBY8",
            "actionText": "Obejrzyj Całą Serię (Playlista) ▶",
            "actionUrl": "https://www.youtube.com/playlist?list=PLdsZ3vCpkBY8",
            "category": "ccwomen",
            "likes": 324,
            "amen": 298,
            "createdAtTimestamp": 1789744900000,
            "_sortTs": 1789744900000,
            "_isNewlyPublished": true
        },
        {
            "id": "post_yt_osobowoscplus_FtY7zvLNK0A",
            "type": "post",
            "author": "Osobowość Plus",
            "authorSlug": "osobowoscplus",
            "authorAvatar": "logo_osobowosc_plus.jpg",
            "authorRole": "Formacja, Psychologia & Wiara ✨ • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"OSOBOWOŚĆ + • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">OSOBOWOŚĆ + • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Roman Chalupka — Prawdziwe szczęście w rodzinie | Zasady dobrej rodzinnej łączności (Część 3)",
            "text": "Roman Chalupka — Prawdziwe szczęście w rodzinie | Zasady dobrej rodzinnej łączności (Część 3)\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału Osobowość Plus w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Roman Chalupka — Prawdziwe szczęście w rodzinie | Zasady dobrej rodzinnej łączności (Część 3)",
            "image": "https://i.ytimg.com/vi/FtY7zvLNK0A/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/FtY7zvLNK0A",
            "youtubeUrl": "https://www.youtube.com/watch?v=FtY7zvLNK0A",
            "category": "wzrost",
            "likes": 54,
            "amen": 52,
            "createdAtTimestamp": 1789636777325,
            "_sortTs": 1789636777325,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_osobowoscplus_gtGiaco7rwI",
            "type": "post",
            "author": "Osobowość Plus",
            "authorSlug": "osobowoscplus",
            "authorAvatar": "logo_osobowosc_plus.jpg",
            "authorRole": "Formacja, Psychologia & Wiara ✨ • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"OSOBOWOŚĆ + • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">OSOBOWOŚĆ + • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Roman Chalupka — Prawdziwe szczęście w rodzinie | Czy to rzeczywiście miłość? (Część 2)",
            "text": "Roman Chalupka — Prawdziwe szczęście w rodzinie | Czy to rzeczywiście miłość? (Część 2)\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału Osobowość Plus w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Roman Chalupka — Prawdziwe szczęście w rodzinie | Czy to rzeczywiście miłość? (Część 2)",
            "image": "https://i.ytimg.com/vi/gtGiaco7rwI/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/gtGiaco7rwI",
            "youtubeUrl": "https://www.youtube.com/watch?v=gtGiaco7rwI",
            "category": "wzrost",
            "likes": 64,
            "amen": 38,
            "createdAtTimestamp": 1789634077325,
            "_sortTs": 1789634077325,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_ccwomen_u6gLT1pEAvE",
            "type": "post",
            "author": "CC Women",
            "authorSlug": "ccwomen",
            "authorAvatar": "avatar_ccwomen_official_2026.jpg",
            "authorRole": "Społeczność Kobiet Wiary 🌸 • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🌸 CC WOMEN • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🌸 CC WOMEN • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Prawa ręka Ewangelii: Reforma zdrowia w czasach ostatecznych (Walter Veith & Martin Smith)",
            "text": "Prawa ręka Ewangelii: Reforma zdrowia w czasach ostatecznych (Walter Veith & Martin Smith)\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału CC Women w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Prawa ręka Ewangelii: Reforma zdrowia w czasach ostatecznych (Walter Veith & Martin Smith)",
            "image": "https://i.ytimg.com/vi/u6gLT1pEAvE/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/u6gLT1pEAvE",
            "youtubeUrl": "https://www.youtube.com/watch?v=u6gLT1pEAvE",
            "category": "ccwomen",
            "likes": 74,
            "amen": 49,
            "createdAtTimestamp": 1789631380052,
            "_sortTs": 1789631380052,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_ccwomen_vhs-tiE4GPY",
            "type": "post",
            "author": "CC Women",
            "authorSlug": "ccwomen",
            "authorAvatar": "avatar_ccwomen_official_2026.jpg",
            "authorRole": "Społeczność Kobiet Wiary 🌸 • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🌸 CC WOMEN • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🌸 CC WOMEN • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "polskie radio cc player",
            "text": "polskie radio cc player\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału CC Women w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "polskie radio cc player",
            "image": "https://i.ytimg.com/vi/vhs-tiE4GPY/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/vhs-tiE4GPY",
            "youtubeUrl": "https://www.youtube.com/watch?v=vhs-tiE4GPY",
            "category": "ccwomen",
            "likes": 73,
            "amen": 56,
            "createdAtTimestamp": 1789628680052,
            "_sortTs": 1789628680052,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_ccmen_9DtQIjFafmE",
            "type": "post",
            "author": "CC Men",
            "authorSlug": "ccmen",
            "authorAvatar": "logo_cc_men.jpg",
            "authorRole": "Wojownicy Chrystusa 🛡️ • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🛡️ CC MEN • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🛡️ CC MEN • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Apo 13 cz 4   Wersja Emisyjna",
            "text": "Apo 13 cz 4   Wersja Emisyjna\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału CC Men w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Apo 13 cz 4   Wersja Emisyjna",
            "image": "https://i.ytimg.com/vi/9DtQIjFafmE/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/9DtQIjFafmE",
            "youtubeUrl": "https://www.youtube.com/watch?v=9DtQIjFafmE",
            "category": "ccmen",
            "likes": 52,
            "amen": 57,
            "createdAtTimestamp": 1789625980945,
            "_sortTs": 1789625980945,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_ccmen_rhD9gdo5y0Q",
            "type": "post",
            "author": "CC Men",
            "authorSlug": "ccmen",
            "authorAvatar": "logo_cc_men.jpg",
            "authorRole": "Wojownicy Chrystusa 🛡️ • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🛡️ CC MEN • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🛡️ CC MEN • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Zwłoka W Przyjściu Pana - Trzej Aniołowie Tablice Przymierza Walter Veith i Martin Smith",
            "text": "Zwłoka W Przyjściu Pana - Trzej Aniołowie Tablice Przymierza Walter Veith i Martin Smith\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału CC Men w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Zwłoka W Przyjściu Pana - Trzej Aniołowie Tablice Przymierza Walter Veith i Martin Smith",
            "image": "https://i.ytimg.com/vi/rhD9gdo5y0Q/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/rhD9gdo5y0Q",
            "youtubeUrl": "https://www.youtube.com/watch?v=rhD9gdo5y0Q",
            "category": "ccmen",
            "likes": 49,
            "amen": 40,
            "createdAtTimestamp": 1789623280945,
            "_sortTs": 1789623280945,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_cctv_YdgG01clXAM",
            "type": "post",
            "author": "Christian Culture TV",
            "authorSlug": "cctv",
            "authorAvatar": "logo_cctv.png",
            "authorRole": "Telewizja Internetowa 🎬 • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🎬 CC TV • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🎬 CC TV • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "BO TWOJA ŁASKA LEPSZA JEST NIŻ SAMO ŻYCIE 🙏 | Christian Culture | Pieśń Uwielbienia",
            "text": "BO TWOJA ŁASKA LEPSZA JEST NIŻ SAMO ŻYCIE 🙏 | Christian Culture | Pieśń Uwielbienia\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału Christian Culture TV w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "BO TWOJA ŁASKA LEPSZA JEST NIŻ SAMO ŻYCIE 🙏 | Christian Culture | Pieśń Uwielbienia",
            "image": "https://i.ytimg.com/vi/YdgG01clXAM/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/YdgG01clXAM",
            "youtubeUrl": "https://www.youtube.com/watch?v=YdgG01clXAM",
            "category": "cctv",
            "likes": 47,
            "amen": 47,
            "createdAtTimestamp": 1789620582409,
            "_sortTs": 1789620582409,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_cctv_HwJRYGBI7Sg",
            "type": "post",
            "author": "Christian Culture TV",
            "authorSlug": "cctv",
            "authorAvatar": "logo_cctv.png",
            "authorRole": "Telewizja Internetowa 🎬 • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🎬 CC TV • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🎬 CC TV • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Burza słoneczna i światowy zwrot ku religii: Co kryje się za globalną zmianą? | Walter Veith",
            "text": "Burza słoneczna i światowy zwrot ku religii: Co kryje się za globalną zmianą? | Walter Veith\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału Christian Culture TV w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Burza słoneczna i światowy zwrot ku religii: Co kryje się za globalną zmianą? | Walter Veith",
            "image": "https://i.ytimg.com/vi/HwJRYGBI7Sg/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/HwJRYGBI7Sg",
            "youtubeUrl": "https://www.youtube.com/watch?v=HwJRYGBI7Sg",
            "category": "cctv",
            "likes": 66,
            "amen": 53,
            "createdAtTimestamp": 1789617882409,
            "_sortTs": 1789617882409,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_radiocc_4r3tnt4G9Hc",
            "type": "post",
            "author": "Polskie Radio CC",
            "authorSlug": "radiocc",
            "authorAvatar": "logo_radio_cc.jpg",
            "authorRole": "Główny Nadawca Radiowy 🎙️ • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🎙️ RADIO CC • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🎙️ RADIO CC • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Przyjdź królestwo Twoje: Czy Boże Królestwo powstanie na Ziemi? (Walter Veith & Martin Smith)",
            "text": "Przyjdź królestwo Twoje: Czy Boże Królestwo powstanie na Ziemi? (Walter Veith & Martin Smith)\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału Polskie Radio CC w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Przyjdź królestwo Twoje: Czy Boże Królestwo powstanie na Ziemi? (Walter Veith & Martin Smith)",
            "image": "https://i.ytimg.com/vi/4r3tnt4G9Hc/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/4r3tnt4G9Hc",
            "youtubeUrl": "https://www.youtube.com/watch?v=4r3tnt4G9Hc",
            "category": "radiocc",
            "likes": 71,
            "amen": 51,
            "createdAtTimestamp": 1789615183908,
            "_sortTs": 1789615183908,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_radiocc_c1urEjJb3Ds",
            "type": "post",
            "author": "Polskie Radio CC",
            "authorSlug": "radiocc",
            "authorAvatar": "logo_radio_cc.jpg",
            "authorRole": "Główny Nadawca Radiowy 🎙️ • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🎙️ RADIO CC • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🎙️ RADIO CC • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Cyfrowa waluta i szczyty klimatyczne: Czy to wstęp do znamienia bestii? | Walter Veith Martin Smith",
            "text": "Cyfrowa waluta i szczyty klimatyczne: Czy to wstęp do znamienia bestii? | Walter Veith Martin Smith\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału Polskie Radio CC w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Cyfrowa waluta i szczyty klimatyczne: Czy to wstęp do znamienia bestii? | Walter Veith Martin Smith",
            "image": "https://i.ytimg.com/vi/c1urEjJb3Ds/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/c1urEjJb3Ds",
            "youtubeUrl": "https://www.youtube.com/watch?v=c1urEjJb3Ds",
            "category": "radiocc",
            "likes": 73,
            "amen": 41,
            "createdAtTimestamp": 1789612483908,
            "_sortTs": 1789612483908,
            "_isNewlyPublished": true
        },





        {
            "id": "post_yt_osobowoscplus_gtGiaco7rwI",
            "type": "post",
            "author": "Osobowość Plus",
            "authorSlug": "osobowoscplus",
            "authorAvatar": "logo_osobowosc_plus.jpg",
            "authorRole": "Formacja, Psychologia & Wiara ✨ • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"OSOBOWOŚĆ + • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">OSOBOWOŚĆ + • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Roman Chalupka — Prawdziwe szczęście w rodzinie | Czy to rzeczywiście miłość? (Część 2)",
            "text": "Roman Chalupka — Prawdziwe szczęście w rodzinie | Czy to rzeczywiście miłość? (Część 2)\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału Osobowość Plus w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Roman Chalupka — Prawdziwe szczęście w rodzinie | Czy to rzeczywiście miłość? (Część 2)",
            "image": "https://i.ytimg.com/vi/gtGiaco7rwI/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/gtGiaco7rwI",
            "youtubeUrl": "https://www.youtube.com/watch?v=gtGiaco7rwI",
            "category": "wzrost",
            "likes": 70,
            "amen": 43,
            "createdAtTimestamp": 1789623258654,
            "_sortTs": 1789623258654,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_osobowoscplus_OWKwixyQq2c",
            "type": "post",
            "author": "Osobowość Plus",
            "authorSlug": "osobowoscplus",
            "authorAvatar": "logo_osobowosc_plus.jpg",
            "authorRole": "Formacja, Psychologia & Wiara ✨ • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"OSOBOWOŚĆ + • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">OSOBOWOŚĆ + • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Roman Chalupka — Prawdziwe szczęście w rodzinie | Cztery wielkie sekrety rodzinnego szczęścia (1)",
            "text": "Roman Chalupka — Prawdziwe szczęście w rodzinie | Cztery wielkie sekrety rodzinnego szczęścia (1)\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału Osobowość Plus w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Roman Chalupka — Prawdziwe szczęście w rodzinie | Cztery wielkie sekrety rodzinnego szczęścia (1)",
            "image": "https://i.ytimg.com/vi/OWKwixyQq2c/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/OWKwixyQq2c",
            "youtubeUrl": "https://www.youtube.com/watch?v=OWKwixyQq2c",
            "category": "wzrost",
            "likes": 52,
            "amen": 56,
            "createdAtTimestamp": 1789620558654,
            "_sortTs": 1789620558654,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_ccwomen_u6gLT1pEAvE",
            "type": "post",
            "author": "CC Women",
            "authorSlug": "ccwomen",
            "authorAvatar": "avatar_ccwomen_official_2026.jpg",
            "authorRole": "Społeczność Kobiet Wiary 🌸 • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🌸 CC WOMEN • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🌸 CC WOMEN • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Prawa ręka Ewangelii: Reforma zdrowia w czasach ostatecznych (Walter Veith & Martin Smith)",
            "text": "Prawa ręka Ewangelii: Reforma zdrowia w czasach ostatecznych (Walter Veith & Martin Smith)\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału CC Women w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Prawa ręka Ewangelii: Reforma zdrowia w czasach ostatecznych (Walter Veith & Martin Smith)",
            "image": "https://i.ytimg.com/vi/u6gLT1pEAvE/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/u6gLT1pEAvE",
            "youtubeUrl": "https://www.youtube.com/watch?v=u6gLT1pEAvE",
            "category": "ccwomen",
            "likes": 59,
            "amen": 41,
            "createdAtTimestamp": 1789617859718,
            "_sortTs": 1789617859718,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_ccwomen_vhs-tiE4GPY",
            "type": "post",
            "author": "CC Women",
            "authorSlug": "ccwomen",
            "authorAvatar": "avatar_ccwomen_official_2026.jpg",
            "authorRole": "Społeczność Kobiet Wiary 🌸 • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🌸 CC WOMEN • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🌸 CC WOMEN • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "polskie radio cc player",
            "text": "polskie radio cc player\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału CC Women w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "polskie radio cc player",
            "image": "https://i.ytimg.com/vi/vhs-tiE4GPY/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/vhs-tiE4GPY",
            "youtubeUrl": "https://www.youtube.com/watch?v=vhs-tiE4GPY",
            "category": "ccwomen",
            "likes": 48,
            "amen": 40,
            "createdAtTimestamp": 1789615159718,
            "_sortTs": 1789615159718,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_ccmen_9DtQIjFafmE",
            "type": "post",
            "author": "CC Men",
            "authorSlug": "ccmen",
            "authorAvatar": "logo_cc_men.jpg",
            "authorRole": "Wojownicy Chrystusa 🛡️ • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🛡️ CC MEN • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🛡️ CC MEN • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Apo 13 cz 4   Wersja Emisyjna",
            "text": "Apo 13 cz 4   Wersja Emisyjna\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału CC Men w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Apo 13 cz 4   Wersja Emisyjna",
            "image": "https://i.ytimg.com/vi/9DtQIjFafmE/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/9DtQIjFafmE",
            "youtubeUrl": "https://www.youtube.com/watch?v=9DtQIjFafmE",
            "category": "ccmen",
            "likes": 58,
            "amen": 57,
            "createdAtTimestamp": 1789612460796,
            "_sortTs": 1789612460796,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_ccmen_rhD9gdo5y0Q",
            "type": "post",
            "author": "CC Men",
            "authorSlug": "ccmen",
            "authorAvatar": "logo_cc_men.jpg",
            "authorRole": "Wojownicy Chrystusa 🛡️ • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🛡️ CC MEN • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🛡️ CC MEN • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Zwłoka W Przyjściu Pana - Trzej Aniołowie Tablice Przymierza Walter Veith i Martin Smith",
            "text": "Zwłoka W Przyjściu Pana - Trzej Aniołowie Tablice Przymierza Walter Veith i Martin Smith\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału CC Men w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Zwłoka W Przyjściu Pana - Trzej Aniołowie Tablice Przymierza Walter Veith i Martin Smith",
            "image": "https://i.ytimg.com/vi/rhD9gdo5y0Q/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/rhD9gdo5y0Q",
            "youtubeUrl": "https://www.youtube.com/watch?v=rhD9gdo5y0Q",
            "category": "ccmen",
            "likes": 47,
            "amen": 39,
            "createdAtTimestamp": 1789609760796,
            "_sortTs": 1789609760796,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_cctv_YdgG01clXAM",
            "type": "post",
            "author": "Christian Culture TV",
            "authorSlug": "cctv",
            "authorAvatar": "logo_cctv.png",
            "authorRole": "Telewizja Internetowa 🎬 • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🎬 CC TV • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🎬 CC TV • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "BO TWOJA ŁASKA LEPSZA JEST NIŻ SAMO ŻYCIE 🙏 | Christian Culture | Pieśń Uwielbienia",
            "text": "BO TWOJA ŁASKA LEPSZA JEST NIŻ SAMO ŻYCIE 🙏 | Christian Culture | Pieśń Uwielbienia\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału Christian Culture TV w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "BO TWOJA ŁASKA LEPSZA JEST NIŻ SAMO ŻYCIE 🙏 | Christian Culture | Pieśń Uwielbienia",
            "image": "https://i.ytimg.com/vi/YdgG01clXAM/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/YdgG01clXAM",
            "youtubeUrl": "https://www.youtube.com/watch?v=YdgG01clXAM",
            "category": "cctv",
            "likes": 57,
            "amen": 59,
            "createdAtTimestamp": 1789607061967,
            "_sortTs": 1789607061967,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_cctv_HwJRYGBI7Sg",
            "type": "post",
            "author": "Christian Culture TV",
            "authorSlug": "cctv",
            "authorAvatar": "logo_cctv.png",
            "authorRole": "Telewizja Internetowa 🎬 • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🎬 CC TV • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🎬 CC TV • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Burza słoneczna i światowy zwrot ku religii: Co kryje się za globalną zmianą? | Walter Veith",
            "text": "Burza słoneczna i światowy zwrot ku religii: Co kryje się za globalną zmianą? | Walter Veith\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału Christian Culture TV w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Burza słoneczna i światowy zwrot ku religii: Co kryje się za globalną zmianą? | Walter Veith",
            "image": "https://i.ytimg.com/vi/HwJRYGBI7Sg/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/HwJRYGBI7Sg",
            "youtubeUrl": "https://www.youtube.com/watch?v=HwJRYGBI7Sg",
            "category": "cctv",
            "likes": 65,
            "amen": 58,
            "createdAtTimestamp": 1789604361967,
            "_sortTs": 1789604361967,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_radiocc_4r3tnt4G9Hc",
            "type": "post",
            "author": "Polskie Radio CC",
            "authorSlug": "radiocc",
            "authorAvatar": "logo_radio_cc.jpg",
            "authorRole": "Główny Nadawca Radiowy 🎙️ • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🎙️ RADIO CC • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🎙️ RADIO CC • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Przyjdź królestwo Twoje: Czy Boże Królestwo powstanie na Ziemi? (Walter Veith & Martin Smith)",
            "text": "Przyjdź królestwo Twoje: Czy Boże Królestwo powstanie na Ziemi? (Walter Veith & Martin Smith)\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału Polskie Radio CC w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Przyjdź królestwo Twoje: Czy Boże Królestwo powstanie na Ziemi? (Walter Veith & Martin Smith)",
            "image": "https://i.ytimg.com/vi/4r3tnt4G9Hc/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/4r3tnt4G9Hc",
            "youtubeUrl": "https://www.youtube.com/watch?v=4r3tnt4G9Hc",
            "category": "radiocc",
            "likes": 71,
            "amen": 56,
            "createdAtTimestamp": 1789601663013,
            "_sortTs": 1789601663013,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_radiocc_c1urEjJb3Ds",
            "type": "post",
            "author": "Polskie Radio CC",
            "authorSlug": "radiocc",
            "authorAvatar": "logo_radio_cc.jpg",
            "authorRole": "Główny Nadawca Radiowy 🎙️ • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🎙️ RADIO CC • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🎙️ RADIO CC • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Cyfrowa waluta i szczyty klimatyczne: Czy to wstęp do znamienia bestii? | Walter Veith Martin Smith",
            "text": "Cyfrowa waluta i szczyty klimatyczne: Czy to wstęp do znamienia bestii? | Walter Veith Martin Smith\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału Polskie Radio CC w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Cyfrowa waluta i szczyty klimatyczne: Czy to wstęp do znamienia bestii? | Walter Veith Martin Smith",
            "image": "https://i.ytimg.com/vi/c1urEjJb3Ds/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/c1urEjJb3Ds",
            "youtubeUrl": "https://www.youtube.com/watch?v=c1urEjJb3Ds",
            "category": "radiocc",
            "likes": 48,
            "amen": 62,
            "createdAtTimestamp": 1789598963013,
            "_sortTs": 1789598963013,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_osobowoscplus_gtGiaco7rwI",
            "type": "post",
            "author": "Osobowość Plus",
            "authorSlug": "osobowoscplus",
            "authorAvatar": "logo_osobowosc_plus.jpg",
            "authorRole": "Formacja, Psychologia & Wiara ✨ • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"OSOBOWOŚĆ + • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">OSOBOWOŚĆ + • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Roman Chalupka — Prawdziwe szczęście w rodzinie | Czy to rzeczywiście miłość? (Część 2)",
            "text": "Roman Chalupka — Prawdziwe szczęście w rodzinie | Czy to rzeczywiście miłość? (Część 2)\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału Osobowość Plus w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Roman Chalupka — Prawdziwe szczęście w rodzinie | Czy to rzeczywiście miłość? (Część 2)",
            "image": "https://i.ytimg.com/vi/gtGiaco7rwI/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/gtGiaco7rwI",
            "youtubeUrl": "https://www.youtube.com/watch?v=gtGiaco7rwI",
            "category": "wzrost",
            "likes": 64,
            "amen": 47,
            "createdAtTimestamp": 1789623064442,
            "_sortTs": 1789623064442,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_osobowoscplus_OWKwixyQq2c",
            "type": "post",
            "author": "Osobowość Plus",
            "authorSlug": "osobowoscplus",
            "authorAvatar": "logo_osobowosc_plus.jpg",
            "authorRole": "Formacja, Psychologia & Wiara ✨ • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"OSOBOWOŚĆ + • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">OSOBOWOŚĆ + • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Roman Chalupka — Prawdziwe szczęście w rodzinie | Cztery wielkie sekrety rodzinnego szczęścia (1)",
            "text": "Roman Chalupka — Prawdziwe szczęście w rodzinie | Cztery wielkie sekrety rodzinnego szczęścia (1)\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału Osobowość Plus w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Roman Chalupka — Prawdziwe szczęście w rodzinie | Cztery wielkie sekrety rodzinnego szczęścia (1)",
            "image": "https://i.ytimg.com/vi/OWKwixyQq2c/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/OWKwixyQq2c",
            "youtubeUrl": "https://www.youtube.com/watch?v=OWKwixyQq2c",
            "category": "wzrost",
            "likes": 58,
            "amen": 55,
            "createdAtTimestamp": 1789620364442,
            "_sortTs": 1789620364442,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_ccwomen_u6gLT1pEAvE",
            "type": "post",
            "author": "CC Women",
            "authorSlug": "ccwomen",
            "authorAvatar": "avatar_ccwomen_official_2026.jpg",
            "authorRole": "Społeczność Kobiet Wiary 🌸 • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🌸 CC WOMEN • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🌸 CC WOMEN • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Prawa ręka Ewangelii: Reforma zdrowia w czasach ostatecznych (Walter Veith & Martin Smith)",
            "text": "Prawa ręka Ewangelii: Reforma zdrowia w czasach ostatecznych (Walter Veith & Martin Smith)\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału CC Women w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Prawa ręka Ewangelii: Reforma zdrowia w czasach ostatecznych (Walter Veith & Martin Smith)",
            "image": "https://i.ytimg.com/vi/u6gLT1pEAvE/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/u6gLT1pEAvE",
            "youtubeUrl": "https://www.youtube.com/watch?v=u6gLT1pEAvE",
            "category": "ccwomen",
            "likes": 50,
            "amen": 59,
            "createdAtTimestamp": 1789617665043,
            "_sortTs": 1789617665043,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_ccwomen_vhs-tiE4GPY",
            "type": "post",
            "author": "CC Women",
            "authorSlug": "ccwomen",
            "authorAvatar": "avatar_ccwomen_official_2026.jpg",
            "authorRole": "Społeczność Kobiet Wiary 🌸 • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🌸 CC WOMEN • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🌸 CC WOMEN • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "polskie radio cc player",
            "text": "polskie radio cc player\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału CC Women w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "polskie radio cc player",
            "image": "https://i.ytimg.com/vi/vhs-tiE4GPY/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/vhs-tiE4GPY",
            "youtubeUrl": "https://www.youtube.com/watch?v=vhs-tiE4GPY",
            "category": "ccwomen",
            "likes": 68,
            "amen": 50,
            "createdAtTimestamp": 1789614965043,
            "_sortTs": 1789614965043,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_ccmen_9DtQIjFafmE",
            "type": "post",
            "author": "CC Men",
            "authorSlug": "ccmen",
            "authorAvatar": "logo_cc_men.jpg",
            "authorRole": "Wojownicy Chrystusa 🛡️ • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🛡️ CC MEN • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🛡️ CC MEN • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Apo 13 cz 4   Wersja Emisyjna",
            "text": "Apo 13 cz 4   Wersja Emisyjna\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału CC Men w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Apo 13 cz 4   Wersja Emisyjna",
            "image": "https://i.ytimg.com/vi/9DtQIjFafmE/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/9DtQIjFafmE",
            "youtubeUrl": "https://www.youtube.com/watch?v=9DtQIjFafmE",
            "category": "ccmen",
            "likes": 52,
            "amen": 42,
            "createdAtTimestamp": 1789612265606,
            "_sortTs": 1789612265606,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_ccmen_rhD9gdo5y0Q",
            "type": "post",
            "author": "CC Men",
            "authorSlug": "ccmen",
            "authorAvatar": "logo_cc_men.jpg",
            "authorRole": "Wojownicy Chrystusa 🛡️ • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🛡️ CC MEN • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🛡️ CC MEN • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Zwłoka W Przyjściu Pana - Trzej Aniołowie Tablice Przymierza Walter Veith i Martin Smith",
            "text": "Zwłoka W Przyjściu Pana - Trzej Aniołowie Tablice Przymierza Walter Veith i Martin Smith\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału CC Men w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Zwłoka W Przyjściu Pana - Trzej Aniołowie Tablice Przymierza Walter Veith i Martin Smith",
            "image": "https://i.ytimg.com/vi/rhD9gdo5y0Q/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/rhD9gdo5y0Q",
            "youtubeUrl": "https://www.youtube.com/watch?v=rhD9gdo5y0Q",
            "category": "ccmen",
            "likes": 74,
            "amen": 44,
            "createdAtTimestamp": 1789609565606,
            "_sortTs": 1789609565606,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_cctv_YdgG01clXAM",
            "type": "post",
            "author": "Christian Culture TV",
            "authorSlug": "cctv",
            "authorAvatar": "logo_cctv.png",
            "authorRole": "Telewizja Internetowa 🎬 • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🎬 CC TV • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🎬 CC TV • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "BO TWOJA ŁASKA LEPSZA JEST NIŻ SAMO ŻYCIE 🙏 | Christian Culture | Pieśń Uwielbienia",
            "text": "BO TWOJA ŁASKA LEPSZA JEST NIŻ SAMO ŻYCIE 🙏 | Christian Culture | Pieśń Uwielbienia\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału Christian Culture TV w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "BO TWOJA ŁASKA LEPSZA JEST NIŻ SAMO ŻYCIE 🙏 | Christian Culture | Pieśń Uwielbienia",
            "image": "https://i.ytimg.com/vi/YdgG01clXAM/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/YdgG01clXAM",
            "youtubeUrl": "https://www.youtube.com/watch?v=YdgG01clXAM",
            "category": "cctv",
            "likes": 57,
            "amen": 47,
            "createdAtTimestamp": 1789606866186,
            "_sortTs": 1789606866186,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_cctv_HwJRYGBI7Sg",
            "type": "post",
            "author": "Christian Culture TV",
            "authorSlug": "cctv",
            "authorAvatar": "logo_cctv.png",
            "authorRole": "Telewizja Internetowa 🎬 • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🎬 CC TV • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🎬 CC TV • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Burza słoneczna i światowy zwrot ku religii: Co kryje się za globalną zmianą? | Walter Veith",
            "text": "Burza słoneczna i światowy zwrot ku religii: Co kryje się za globalną zmianą? | Walter Veith\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału Christian Culture TV w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Burza słoneczna i światowy zwrot ku religii: Co kryje się za globalną zmianą? | Walter Veith",
            "image": "https://i.ytimg.com/vi/HwJRYGBI7Sg/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/HwJRYGBI7Sg",
            "youtubeUrl": "https://www.youtube.com/watch?v=HwJRYGBI7Sg",
            "category": "cctv",
            "likes": 62,
            "amen": 61,
            "createdAtTimestamp": 1789604166186,
            "_sortTs": 1789604166186,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_radiocc_4r3tnt4G9Hc",
            "type": "post",
            "author": "Polskie Radio CC",
            "authorSlug": "radiocc",
            "authorAvatar": "logo_radio_cc.jpg",
            "authorRole": "Główny Nadawca Radiowy 🎙️ • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🎙️ RADIO CC • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🎙️ RADIO CC • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Przyjdź królestwo Twoje: Czy Boże Królestwo powstanie na Ziemi? (Walter Veith & Martin Smith)",
            "text": "Przyjdź królestwo Twoje: Czy Boże Królestwo powstanie na Ziemi? (Walter Veith & Martin Smith)\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału Polskie Radio CC w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Przyjdź królestwo Twoje: Czy Boże Królestwo powstanie na Ziemi? (Walter Veith & Martin Smith)",
            "image": "https://i.ytimg.com/vi/4r3tnt4G9Hc/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/4r3tnt4G9Hc",
            "youtubeUrl": "https://www.youtube.com/watch?v=4r3tnt4G9Hc",
            "category": "radiocc",
            "likes": 45,
            "amen": 41,
            "createdAtTimestamp": 1789601466816,
            "_sortTs": 1789601466816,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_radiocc_c1urEjJb3Ds",
            "type": "post",
            "author": "Polskie Radio CC",
            "authorSlug": "radiocc",
            "authorAvatar": "logo_radio_cc.jpg",
            "authorRole": "Główny Nadawca Radiowy 🎙️ • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🎙️ RADIO CC • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🎙️ RADIO CC • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Cyfrowa waluta i szczyty klimatyczne: Czy to wstęp do znamienia bestii? | Walter Veith Martin Smith",
            "text": "Cyfrowa waluta i szczyty klimatyczne: Czy to wstęp do znamienia bestii? | Walter Veith Martin Smith\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału Polskie Radio CC w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Cyfrowa waluta i szczyty klimatyczne: Czy to wstęp do znamienia bestii? | Walter Veith Martin Smith",
            "image": "https://i.ytimg.com/vi/c1urEjJb3Ds/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/c1urEjJb3Ds",
            "youtubeUrl": "https://www.youtube.com/watch?v=c1urEjJb3Ds",
            "category": "radiocc",
            "likes": 66,
            "amen": 57,
            "createdAtTimestamp": 1789598766816,
            "_sortTs": 1789598766816,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_osobowoscplus_gtGiaco7rwI",
            "type": "post",
            "author": "Osobowość Plus",
            "authorSlug": "osobowoscplus",
            "authorAvatar": "logo_osobowosc_plus.jpg",
            "authorRole": "Formacja, Psychologia & Wiara ✨ • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"OSOBOWOŚĆ + • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">OSOBOWOŚĆ + • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Roman Chalupka — Prawdziwe szczęście w rodzinie | Czy to rzeczywiście miłość? (Część 2)",
            "text": "Roman Chalupka — Prawdziwe szczęście w rodzinie | Czy to rzeczywiście miłość? (Część 2)\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału Osobowość Plus w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Roman Chalupka — Prawdziwe szczęście w rodzinie | Czy to rzeczywiście miłość? (Część 2)",
            "image": "https://i.ytimg.com/vi/gtGiaco7rwI/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/gtGiaco7rwI",
            "youtubeUrl": "https://www.youtube.com/watch?v=gtGiaco7rwI",
            "category": "wzrost",
            "likes": 45,
            "amen": 49,
            "createdAtTimestamp": 1789622637743,
            "_sortTs": 1789622637743,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_osobowoscplus_OWKwixyQq2c",
            "type": "post",
            "author": "Osobowość Plus",
            "authorSlug": "osobowoscplus",
            "authorAvatar": "logo_osobowosc_plus.jpg",
            "authorRole": "Formacja, Psychologia & Wiara ✨ • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"OSOBOWOŚĆ + • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">OSOBOWOŚĆ + • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Roman Chalupka — Prawdziwe szczęście w rodzinie | Cztery wielkie sekrety rodzinnego szczęścia (1)",
            "text": "Roman Chalupka — Prawdziwe szczęście w rodzinie | Cztery wielkie sekrety rodzinnego szczęścia (1)\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału Osobowość Plus w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Roman Chalupka — Prawdziwe szczęście w rodzinie | Cztery wielkie sekrety rodzinnego szczęścia (1)",
            "image": "https://i.ytimg.com/vi/OWKwixyQq2c/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/OWKwixyQq2c",
            "youtubeUrl": "https://www.youtube.com/watch?v=OWKwixyQq2c",
            "category": "wzrost",
            "likes": 74,
            "amen": 58,
            "createdAtTimestamp": 1789619937743,
            "_sortTs": 1789619937743,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_ccwomen_u6gLT1pEAvE",
            "type": "post",
            "author": "CC Women",
            "authorSlug": "ccwomen",
            "authorAvatar": "avatar_ccwomen_official_2026.jpg",
            "authorRole": "Społeczność Kobiet Wiary 🌸 • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🌸 CC WOMEN • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🌸 CC WOMEN • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Prawa ręka Ewangelii: Reforma zdrowia w czasach ostatecznych (Walter Veith & Martin Smith)",
            "text": "Prawa ręka Ewangelii: Reforma zdrowia w czasach ostatecznych (Walter Veith & Martin Smith)\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału CC Women w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Prawa ręka Ewangelii: Reforma zdrowia w czasach ostatecznych (Walter Veith & Martin Smith)",
            "image": "https://i.ytimg.com/vi/u6gLT1pEAvE/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/u6gLT1pEAvE",
            "youtubeUrl": "https://www.youtube.com/watch?v=u6gLT1pEAvE",
            "category": "ccwomen",
            "likes": 50,
            "amen": 56,
            "createdAtTimestamp": 1789617238368,
            "_sortTs": 1789617238368,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_ccwomen_vhs-tiE4GPY",
            "type": "post",
            "author": "CC Women",
            "authorSlug": "ccwomen",
            "authorAvatar": "avatar_ccwomen_official_2026.jpg",
            "authorRole": "Społeczność Kobiet Wiary 🌸 • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🌸 CC WOMEN • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🌸 CC WOMEN • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "polskie radio cc player",
            "text": "polskie radio cc player\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału CC Women w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "polskie radio cc player",
            "image": "https://i.ytimg.com/vi/vhs-tiE4GPY/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/vhs-tiE4GPY",
            "youtubeUrl": "https://www.youtube.com/watch?v=vhs-tiE4GPY",
            "category": "ccwomen",
            "likes": 48,
            "amen": 58,
            "createdAtTimestamp": 1789614538368,
            "_sortTs": 1789614538368,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_ccmen_9DtQIjFafmE",
            "type": "post",
            "author": "CC Men",
            "authorSlug": "ccmen",
            "authorAvatar": "logo_cc_men.jpg",
            "authorRole": "Wojownicy Chrystusa 🛡️ • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🛡️ CC MEN • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🛡️ CC MEN • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Apo 13 cz 4   Wersja Emisyjna",
            "text": "Apo 13 cz 4   Wersja Emisyjna\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału CC Men w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Apo 13 cz 4   Wersja Emisyjna",
            "image": "https://i.ytimg.com/vi/9DtQIjFafmE/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/9DtQIjFafmE",
            "youtubeUrl": "https://www.youtube.com/watch?v=9DtQIjFafmE",
            "category": "ccmen",
            "likes": 65,
            "amen": 47,
            "createdAtTimestamp": 1789611838927,
            "_sortTs": 1789611838927,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_ccmen_rhD9gdo5y0Q",
            "type": "post",
            "author": "CC Men",
            "authorSlug": "ccmen",
            "authorAvatar": "logo_cc_men.jpg",
            "authorRole": "Wojownicy Chrystusa 🛡️ • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🛡️ CC MEN • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🛡️ CC MEN • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Zwłoka W Przyjściu Pana - Trzej Aniołowie Tablice Przymierza Walter Veith i Martin Smith",
            "text": "Zwłoka W Przyjściu Pana - Trzej Aniołowie Tablice Przymierza Walter Veith i Martin Smith\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału CC Men w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Zwłoka W Przyjściu Pana - Trzej Aniołowie Tablice Przymierza Walter Veith i Martin Smith",
            "image": "https://i.ytimg.com/vi/rhD9gdo5y0Q/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/rhD9gdo5y0Q",
            "youtubeUrl": "https://www.youtube.com/watch?v=rhD9gdo5y0Q",
            "category": "ccmen",
            "likes": 73,
            "amen": 44,
            "createdAtTimestamp": 1789609138927,
            "_sortTs": 1789609138927,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_cctv_YdgG01clXAM",
            "type": "post",
            "author": "Christian Culture TV",
            "authorSlug": "cctv",
            "authorAvatar": "logo_cctv.png",
            "authorRole": "Telewizja Internetowa 🎬 • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🎬 CC TV • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🎬 CC TV • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "BO TWOJA ŁASKA LEPSZA JEST NIŻ SAMO ŻYCIE 🙏 | Christian Culture | Pieśń Uwielbienia",
            "text": "BO TWOJA ŁASKA LEPSZA JEST NIŻ SAMO ŻYCIE 🙏 | Christian Culture | Pieśń Uwielbienia\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału Christian Culture TV w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "BO TWOJA ŁASKA LEPSZA JEST NIŻ SAMO ŻYCIE 🙏 | Christian Culture | Pieśń Uwielbienia",
            "image": "https://i.ytimg.com/vi/YdgG01clXAM/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/YdgG01clXAM",
            "youtubeUrl": "https://www.youtube.com/watch?v=YdgG01clXAM",
            "category": "cctv",
            "likes": 69,
            "amen": 43,
            "createdAtTimestamp": 1789606439578,
            "_sortTs": 1789606439578,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_cctv_HwJRYGBI7Sg",
            "type": "post",
            "author": "Christian Culture TV",
            "authorSlug": "cctv",
            "authorAvatar": "logo_cctv.png",
            "authorRole": "Telewizja Internetowa 🎬 • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🎬 CC TV • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🎬 CC TV • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Burza słoneczna i światowy zwrot ku religii: Co kryje się za globalną zmianą? | Walter Veith",
            "text": "Burza słoneczna i światowy zwrot ku religii: Co kryje się za globalną zmianą? | Walter Veith\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału Christian Culture TV w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Burza słoneczna i światowy zwrot ku religii: Co kryje się za globalną zmianą? | Walter Veith",
            "image": "https://i.ytimg.com/vi/HwJRYGBI7Sg/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/HwJRYGBI7Sg",
            "youtubeUrl": "https://www.youtube.com/watch?v=HwJRYGBI7Sg",
            "category": "cctv",
            "likes": 46,
            "amen": 55,
            "createdAtTimestamp": 1789603739578,
            "_sortTs": 1789603739578,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_radiocc_4r3tnt4G9Hc",
            "type": "post",
            "author": "Polskie Radio CC",
            "authorSlug": "radiocc",
            "authorAvatar": "logo_radio_cc.jpg",
            "authorRole": "Główny Nadawca Radiowy 🎙️ • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🎙️ RADIO CC • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🎙️ RADIO CC • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Przyjdź królestwo Twoje: Czy Boże Królestwo powstanie na Ziemi? (Walter Veith & Martin Smith)",
            "text": "Przyjdź królestwo Twoje: Czy Boże Królestwo powstanie na Ziemi? (Walter Veith & Martin Smith)\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału Polskie Radio CC w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Przyjdź królestwo Twoje: Czy Boże Królestwo powstanie na Ziemi? (Walter Veith & Martin Smith)",
            "image": "https://i.ytimg.com/vi/4r3tnt4G9Hc/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/4r3tnt4G9Hc",
            "youtubeUrl": "https://www.youtube.com/watch?v=4r3tnt4G9Hc",
            "category": "radiocc",
            "likes": 72,
            "amen": 42,
            "createdAtTimestamp": 1789601040247,
            "_sortTs": 1789601040247,
            "_isNewlyPublished": true
        },

        {
            "id": "post_yt_radiocc_c1urEjJb3Ds",
            "type": "post",
            "author": "Polskie Radio CC",
            "authorSlug": "radiocc",
            "authorAvatar": "logo_radio_cc.jpg",
            "authorRole": "Główny Nadawca Radiowy 🎙️ • YouTube",
            "badgeHtml": "<span class=\"badge-type-tag\" style=\"background:linear-gradient(135deg,rgba(239,68,68,0.25),rgba(220,38,38,0.35));border:1px solid #ef4444;color:#fca5a5;font-weight:800;\" title=\"🎙️ RADIO CC • YouTube\"><i class=\"fa-brands fa-youtube\" style=\"color:#ef4444;\"></i> <span class=\"badge-type-tag-text\">🎙️ RADIO CC • YouTube</span></span>",
            "time": "Świeża Publikacja • 🎥 YouTube",
            "title": "Cyfrowa waluta i szczyty klimatyczne: Czy to wstęp do znamienia bestii? | Walter Veith Martin Smith",
            "text": "Cyfrowa waluta i szczyty klimatyczne: Czy to wstęp do znamienia bestii? | Walter Veith Martin Smith\n\nZapraszamy do oglądania najnowszego materiału z oficjalnego kanału Polskie Radio CC w sieci Christian Culture! Oglądaj bezpośrednio w odtwarzaczu powyżej. 🕊️✨",
            "desc": "Cyfrowa waluta i szczyty klimatyczne: Czy to wstęp do znamienia bestii? | Walter Veith Martin Smith",
            "image": "https://i.ytimg.com/vi/c1urEjJb3Ds/hqdefault.jpg",
            "videoUrl": "https://www.youtube-nocookie.com/embed/c1urEjJb3Ds",
            "youtubeUrl": "https://www.youtube.com/watch?v=c1urEjJb3Ds",
            "category": "radiocc",
            "likes": 51,
            "amen": 57,
            "createdAtTimestamp": 1789598340247,
            "_sortTs": 1789598340247,
            "_isNewlyPublished": true
        },

        {
            id: 'post_dzj_2026_09_15',
            type: 'post',
            author: 'Cezary Rogowski',
            authorRole: '☀️ Dobrze, że jesteś • Założyciel Christian Culture ✨',
            authorAvatar: 'avatar_cezary_official.jpg',
            authorSlug: 'cezaryrgowski',
            time: '15 Września 2026 • ☀️ Słowa Mają Moc',
            title: '☀️ Słowa Mają Moc — Dzień 15: Skory do słuchania, nieskory do mówienia',
            text: `☀️ **Słowa Mają Moc — Dzień 15: Skory do słuchania, nieskory do mówienia**

W piętnastym dniu wrześniowego cyklu formacyjnego „Słowa Mają Moc” mierzymy się z pokusą wypowiadania ostrych słów w gniewie i pośpiesznej oceny.

Apostoł Jakub daje nam prostą, rewolucyjną radę: bądź skory do słuchania, nieskory do mówienia i nieskory do gniewu. Chrześcijański lider nie pozwala sobie na wybuchy gniewu i raniące komentarze pod wpływem emocji. Jego mowa jest opanowana i pełna łaski. Wybieraj dzisiaj świadomie: panuj nad swoim językiem, odrzucając gniew i stając w królewskiej klasie opanowania.

**Jezus mówi dziś do Ciebie:**
„...niech każdy człowiek będzie skory do słuchania, nieskory do mówienia, nieskory do gniewu.” *(Jakuba 1,19, UBG)*

**Zadanie Taktyczne (Czytaj | Wierz | Działaj):**
**CZYTAJ:** Otwórz dzisiaj Pismo Święte i przeczytaj pierwszy rozdział Listu świętego Jakuba, wersety 19–27.
**WIERZ:** Przyjmij wiarą, że opanowanie języka w trudnej sytuacji jest dowodem dojrzałości i pracy Ducha Świętego.
**DZIAŁAJ:** W każdej sytuacji konfliktowej najpierw usłysz i przemilcz gniew, a dopiero potem wypowiedz słowo pełne pokoju i mądrości.

W Christian Culture aplikacje i portale są zawsze BEZPŁATNE.

**Modlitwa Bojowa:**
„Panie Jezu, poskrom mój gniew i naucz mnie milczeć wtedy, gdy emocje chcą przejąć kontrolę. Uczyń mój język narzędziem Twojego pokoju.”

Baza i wzrost: https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0 – Wejdź do zespołu ludzi z pasją!

PODAJ DALEJ 🔴
www.polskieradio.cc | www.polskieradio.cc/lumina | www.cclite.pl
Wspomóż misję: patronite.pl/osobowoscplus`,
            image: 'promo_dzj.jpg',
            likes: 0,
            amen: 0,
            _sortTs: Date.now() + 10000000020
        },
        {
            id: 'post_vod_mega_hity_kina',
            type: 'promo',
            author: 'Christian Culture VOD',
            authorRole: '🎬 Kino Chrześcijańskie • Mega Hity Świata ✨',
            authorAvatar: 'logo_vod_cc.jpg',
            authorSlug: 'cctv',
            time: '🎬 REPERTUAR VOD • MEGA HITY ŚWIATOWEGO KINA',
            title: '🎬 VOD Christian Culture — MEGA HITY ŚWIATOWEGO KINA 🍿✨',
            text: `🎬 **VOD Christian Culture — MEGA HITY ŚWIATOWEGO KINA** 🍿✨

Zapraszamy do oficjalnego kina **VOD Christian Culture**! Oglądaj pełnometrażowe, legalne i inspirujące filmy chrześcijańskie, poruszające dramaty oparte na faktach, historie wiary, męstwa, nadziei oraz walki dobra ze złem w najwyższej jakości z polskim lektorem.

🌟 **Co zyskujesz w VOD Christian Culture?**
• 🍿 **Mega Hity Światowego Kina** — wyselekcjonowane arcydzieła kina wiary,
• 🎬 **Oglądanie na życzenie (VOD)** lub w całodobowej rotacji kinowej 24/7,
• 💯 **100% Bezpłatnie** — bez abonamentów, bez ukrytych opłat, bez komercyjnych reklam,
• 📱 **Dostępne na każdym urządzeniu** — komputer, tablet, smartfon i Smart TV.

Odkryj kino, które nie tylko bawi, ale przede wszystkim przemienia serca, buduje wiarę i daje nadzieję!

👉 **Oglądaj teraz za darmo:** https://polskieradio.cc/vod

PODAJ DALEJ 🔴
www.polskieradio.cc/vod | www.polskieradio.cc | www.polskieradio.cc/lumina`,
            image: 'vod_hity_kina_poster.jpg',
            ctaText: 'Przejdź do Kina VOD CC 🎬 ▶',
            ctaUrl: 'https://polskieradio.cc/vod',
            likes: 428,
            amen: 396,
            _sortTs: Date.now() + 9999999998
        },
        {
            id: 'post_jola_podcast_playlist',
            type: 'promo',
            author: 'Jola Wójcik',
            authorRole: '🕊️ Biblijny Czas Modlitwy • Polskie Radio CC 🌸',
            authorAvatar: 'avatar_jolawojcik.jpg',
            authorSlug: 'jolawojcik',
            time: '🕊️ OFICJALNY PODCAST • BIBLIJNY CZAS MODLITWY',
            title: '🕊️ Podcast: Biblijny Czas Modlitwy — Pełna Playlista YouTube ✨',
            text: `🕊️ **Biblijny Czas Modlitwy — Oficjalny Podcast & Playlista YouTube** ✨

Serdecznie zapraszamy do wspólnego trwania w Bożej obecności w ramach oficjalnego podcastu modlitewnego **„Biblijny Czas Modlitwy”** Polskiego Radia Christian Culture, prowadzonego przez Jolę Wójcik.

📖 **W serii podcastów znajdziesz:**
• 🙏 **Głębokie modlitwy wstawiennicze** — za rodziny, zdrowie, ochronę i pokój w sercu,
• 🕊️ **Medytacje i rozważania Słowa Bożego** wnoszące Bożą obecność do codzienności,
• 🌸 **Wspólnotę wiary** i jedność z tysiącami słuchaczy z całej Polski.

Wszystkie odcinki podcastu są stale dostępne i aktualizowane w oficjalnej playliście YouTube.

👉 **Odtwarzaj całą serię:** https://youtube.com/playlist?list=PLQBdxcl9HBc98HweGapf1brLPQBTf-6eN
👉 **Profil w LUMINA:** https://polskieradio.cc/lumina.jolawojcik

PODAJ DALEJ 🔴
www.polskieradio.cc | www.polskieradio.cc/lumina.jolawojcik`,
            image: 'cover_jolawojcik.jpg',
            youtubePlaylistId: 'PLQBdxcl9HBc98HweGapf1brLPQBTf-6eN',
            ctaText: 'Odtwarzaj Podcast w YouTube 🎧 ▶',
            ctaUrl: 'https://youtube.com/playlist?list=PLQBdxcl9HBc98HweGapf1brLPQBTf-6eN&si=KPXuvaZfOwtgwxba',
            likes: 312,
            amen: 289,
            _sortTs: Date.now() + 9999999990
        },
        {
            id: 'post_live_cezary_instrumental',
            type: 'broadcast',
            isLiveBroadcastPost: true,
            author: 'Cezary Rogowski',
            authorRole: '👑 Założyciel Christian Culture & Portalu LUMINA',
            authorAvatar: 'avatar_cezary_official.jpg',
            authorSlug: 'cezaryrgowski',
            time: '🔴 TRANSMISJA NA ŻYWO • TV LIVE INSTRUMENTAL 24/7',
            title: '🔴 TV LIVE 24/7: Instrumental Worship Music — Christian Culture',
            showTitle: '🔴 TV LIVE 24/7: Instrumental Worship Music — Christian Culture',
            channelTitle: 'Instrumental Worship Music CC • TV LIVE 24/7',
            description: 'Oficjalny telewizyjny kanał muzyki instrumentalnej uwielbienia. Nieprzerwany strumień 31 wyselekcjonowanych kompozycji stworzonych do modlitwy, osobistego wyciszenia, rozważania Słowa Bożego i pracy.',
            badge: '🔴 TRANSMISJA NA ŻYWO • TV LIVE INSTRUMENTAL 24/7',
            streamUrl: 'cctv24-worship.html',
            fullPageUrl: 'cctv24-worship.html',
            text: 'Oficjalny telewizyjny kanał muzyki instrumentalnej uwielbienia. Nieprzerwany strumień 31 wyselekcjonowanych kompozycji stworzonych do modlitwy, osobistego wyciszenia, rozważania Słowa Bożego i pracy.',
            image: 'worship_logo_thumb.jpg',
            likes: 348,
            amen: 312,
            _sortTs: Date.now() + 10000000000
        },
        {
            id: 'post_dzj_2026_09_01',
            type: 'post',
            author: 'Cezary Rogowski',
            authorRole: '☀️ Dobrze, że jesteś • Założyciel Christian Culture ✨',
            authorAvatar: 'avatar_cezary_official.jpg',
            authorSlug: 'cezaryrgowski',
            time: '1 Września 2026 • ☀️ Słowa Mają Moc',
            title: '☀️ Słowa Mają Moc — Dzień 1: Nie lekceważ słów',
            text: `☀️ **Słowa Mają Moc — Dzień 1: Nie lekceważ słów**

Rozpoczynamy nowy, wrześniowy cykl formacyjny pod tytułem „Słowa Mają Moc”.

Są słowa, które wypowiadamy i natychmiast o nich zapominamy, oraz takie, które zostają w człowieku na lata. Jedno zdanie potrafi podnieść, ale też zranić czy odebrać nadzieję. Jednak ponad ludzkimi opiniami stoi Słowo Boga, które niesie życie i nigdy nie wraca puste (Izajasza 55:11). Zbyt często powtarzamy sobie destrukcyjne kłamstwa: „Nie dam rady”, „Nie nadaję się”, „Moja misja jest zbyt mała”. Tymczasem Bóg mówi: „Albowiem ja znam myśli, które mam o was, mówi Pan, myśli o pokoju, a nie o utrapieniu, aby dać wam oczekiwanie i nadzieję” (Jeremiasza 29:11). Czas wybrać, czym karmisz swoje wnętrze: Czytaj Słowo, wierz Słowu, żyj Słowem.

**Jezus mówi dziś do Ciebie:**
„Tak będzie z moim słowem, które wychodzi z moich ust: nie wróci do mnie puste, ale uczyni to, co mi się podoba...” *(Izajasza 55:11)*

**Zadanie Taktyczne (Czytaj | Wierz | Działaj):**
**CZYTAJ:** Otwórz dzisiaj Biblię, przeczytaj powoli Izajasza 55:10–11 i zatrzymaj się przy jednym zdaniu.
**WIERZ:** Przyjmij Słowo wiarą. Jeśli Bóg powołuje Cię do działania, nie czekaj na poczucie idealnej gotowości.
**DZIAŁAJ:** Przekaż dzisiaj komuś dobre Słowo – wyślij werset, pomódl się za kogoś i nie zatrzymuj Ewangelii w sobie.

W Christian Culture aplikacje i portale są zawsze BEZPŁATNE.

**Modlitwa Bojowa:**
„Panie Jezu, dziękuję Ci za Twoje Słowo. Oczyść moje serce ze słów, które odbierają mi nadzieję. Uczyń moje usta narzędziem zachęty, a moje ręce narzędziem służby, by to, co mówię i robię, przynosiło Ci chwałę.”

Baza i wzrost: https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0 – Wejdź do zespołu ludzi z pasją!

PODAJ DALEJ 🔴
www.polskieradio.cc | www.polskieradio.cc/lumina | www.cclite.pl
Wspomóż misję: patronite.pl/osobowoscplus`,
            image: 'promo_dzj.jpg',
            likes: 125,
            amen: 118
        },
        {
            id: 'post_dzj_2026_08_31',
            type: 'post',
            author: 'Cezary Rogowski',
            authorRole: '☀️ Dobrze, że jesteś • Założyciel Christian Culture ✨',
            authorAvatar: 'avatar_cezary_official.jpg',
            authorSlug: 'cezaryrgowski',
            time: '31 Sierpnia 2026 • ☀️ Dobrze, że jesteś',
            title: '☀️ Lato z Jezusem — Wielkie Pytania (Dzień 31 - Finał Cyklu)',
            text: `☀️ **Lato z Jezusem — Wielkie Pytania**
**Dzień 31 — Finał Cyklu: Dlaczego tak łatwo ulegam lękowi przed ostatecznym krokiem i wejściem w nową jakość życia?**

W trzydziestym pierwszym, finałowym dniu cyklu „Lato z Jezusem — Wielkie Pytania” zamykamy tę potężną formacyjną podróż i stajemy na progu całkowicie nowej jakości.

W psychologii zmiany moment przejścia (transition phase) wymaga porzucenia dawnej tożsamości i odważnego wejścia w nieznane, co często wyzwala lęk przed utratą kontroli. Słowo Boże przez proroka Izajasza przypomina nam niezmienną obietnicę: „Nie bój się, bo Ja jestem z tobą”. Zamykając dziś letni cykl, patrzymy z wdzięcznością na wszystko, co Bóg w nas odbudował. Chrześcijański lider najwyższej klasy nie lęka się nowych wyzwań – przekracza progi z nienaganną klasą i niezachwianą wiarą.

Już jutro, od 1 września, otwieramy nowy, przełomowy rozdział i zapraszamy na zupełnie nowy cykl rozważań pod tytułem „Słowa Mają Moc”!

**Jezus mówi dziś do Ciebie:**
„Nie bój się, bo Ja jestem z tobą; nie lękaj się, bo Ja jestem twoim Bogiem.” *(Izajasza 41,10)*

**Zadanie Taktyczne:**
Zmiażdż dziś lęk przed progiem zmian na swoim polu bitwy. Podsumuj ten miesiąc z wdzięcznością i zrób ostateczny krok w nową jakość życia. Przygotuj się na jutrzejszą inaugurację cyklu „Słowa Mają Moc”. Wnieś do swojego domu i firmy standard odwagi i dojrzałego autorytetu.

W Christian Culture aplikacje i portale są zawsze BEZPŁATNE.

**Modlitwa Bojowa:**
„Ojcze, odrzucam kłamstwa nieprzyjaciela i lęk przed nowym etapem. Dziękuję Ci za zamknięcie cyklu 'Lato z Jezusem' i za to, że od 1 września wkraczamy w potężny cykl 'Słowa Mają Moc'. Daj mi odwagę, rygor i wyrazisty charakter, bym z nienaganną klasą zdobywał ten świat dla Twojej chwały.”

Baza i wzrost: https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0 – Wejdź do zespołu ludzi z pasją!

PODAJ DALEJ 🔴
www.polskieradio.cc | www.cclite.pl
Apps: https://play.google.com/store/apps/dev?id=5215448773598149938`,
            image: 'promo_dzj.jpg',
            likes: 112,
            amen: 106
        },
        {
            id: 'post_dzj_2026_08_30',
            type: 'post',
            author: 'Cezary Rogowski',
            authorRole: '☀️ Dobrze, że jesteś • Założyciel Christian Culture ✨',
            authorAvatar: 'avatar_cezary_official.jpg',
            authorSlug: 'cezaryrgowski',
            time: '30 Sierpnia 2026 • ☀️ Dobrze, że jesteś',
            title: '☀️ Lato z Jezusem — Wielkie Pytania (Dzień 30)',
            text: `☀️ **Lato z Jezusem — Wielkie Pytania**
**Dzień 30 — 31 bardzo osobistych pytań Syna/Córki do Ojca: Dlaczego tak łatwo ulegam lękowi przed samotnością i brakiem zrozumienia przez najbliższych?**

W trzydziestym dniu cyklu „Lato z Jezusem — Wielkie Pytania” rozbrajamy bolesny mechanizm poczucia odizolowania i lęku przed brakiem wsparcia ze strony najbliższego otoczenia.

W psychologii relacyjnej pojęcie „lęku przed izolacją egzystencjalną” opisuje stan, w którym człowiek boleśnie odczuwa brak zrozumienia dla swoich najgłębszych dążeń ze strony grupy odniesienia. Wróg bezwzględnie żeruje na tej wrażliwości, usiłując zaszczepić w nas poczucie bezużyteczności. Słowo Ewangelii uderza w tę samotność poprzez deklarację Jezusa w godzinie próby: „Ale Ja nie jestem sam, bo Ojciec jest ze Mną”. Chrześcijański lider najwyższej klasy nie uzależnia swojego pokoju od ludzkiego zrozumienia – działa z nienaganną klasą, czerpiąc siłę z bezpośredniej relacji z Bogiem.

**Jezus mówi dziś do Ciebie:**
„Ale Ja nie jestem sam, bo Ojciec jest ze Mną.” *(Jana 16,32)*

**Zadanie Taktyczne:**
Zmiażdż dziś użalanie się nad sobą z powodu braku zrozumienia na swoim polu bitwy. Jeśli czujesz się w swoich zmaganiach osamotniony, skieruj wzrok ku Ojcu. Wnieś do swojego domu i środowiska standard niezachwianego spokoju, dojrzałości i królewskiej klasy.

W Christian Culture aplikacje i portale są zawsze BEZPŁATNE.

**Modlitwa Bojowa:**
„Ojcze, odrzucam kłamstwa nieprzyjaciela i ból osamotnienia. Przepraszam, że oczekiwałem od ludzi tego, co możesz dać mi tylko Ty. Daj mi odwagę, rygor i wyrazisty charakter, bym z nienaganną klasą szedł Twoimi śladami, zdobywając ten świat dla Twojej chwały.”

Baza i wzrost: https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0 – Wejdź do zespołu ludzi z pasją!

PODAJ DALEJ 🔴
www.polskieradio.cc | www.cclite.pl
Apps: https://play.google.com/store/apps/dev?id=5215448773598149938&authuser=1`,
            image: 'promo_dzj.jpg',
            likes: 104,
            amen: 98
        },
        {
            id: 'post_dzj_2026_08_29',
            type: 'post',
            author: 'Cezary Rogowski',
            authorRole: '☀️ Dobrze, że jesteś • Założyciel Christian Culture ✨',
            authorAvatar: 'avatar_cezary_official.jpg',
            authorSlug: 'cezaryrgowski',
            time: '29 Sierpnia 2026 • ☀️ Dobrze, że jesteś',
            title: '☀️ Lato z Jezusem — Wielkie Pytania (Dzień 29)',
            text: `☀️ **Lato z Jezusem — Wielkie Pytania**
**Dzień 29 — 31 bardzo osobistych pytań Syna/Córki do Ojca: Dlaczego tak łatwo ulegam lękowi przed utratą moich finansów i materialnego bezpieczeństwa?**

W dwudziestym dziewiątym dniu cyklu „Lato z Jezusem — Wielkie Pytania” rozbrajamy mechanizm lęku przed niedostatkiem oraz pokładania fałszywej nadziei w materialnym bogactwie.

W psychologii ekonomicznej zjawisko „lęku przed niestabilnością finansową” opisuje chroniczny stres, który paraliżuje człowieka, gdy uzależnia on swój pokój wewnętrzny od stanu konta. Wróg bezwzględnie żeruje na tym lęku na duchowym froncie. Słowo Ewangelii uderza w tę iluzję poprzez przypomnienie o trosce Stwórcy, który karmi ptaki i ubiera polne kwiaty. Chrześcijański lider najwyższej klasy zarządza finansami z profesjonalizmem i roztropnością, ale nie ulega panice – jego źródłem zaopatrzenia jest sam Bóg, dlatego działa z nienaganną klasą i niezachwianym spokojem.

**Jezus mówi dziś do Ciebie:**
„Przypatrzcie się krukom: nie sieją ani żną... a Bóg je żywi. O ileż ważniejszy jesteście wy od ptaków!” *(Łukasza 12,24)*

**Zadanie Taktyczne:**
Zmiażdż dziś lęk o finanse na swoim polu bitwy. Podejmij rzetelne działania zarządcze, ale odrzuć toksyczną troskę o jutro. Wnieś do swojego domu i firmy standard ufności, hojności i dojrzałego autorytetu.

W Christian Culture aplikacje i portale są zawsze BEZPŁATNE.

**Modlitwa Bojowa:**
„Ojcze, odrzucam kłamstwa nieprzyjaciela i lęk przed niedostatkiem. Przepraszam, że pokładałem nadzieję w materialnym zabezpieczeniu zamiast w Tobie. Daj mi odwagę, rygor i wyrazisty charakter, bym z nienaganną klasą i spokojem zarządzał finansami, zdobywając ten świat dla Twojej chwały.”

Baza i wzrost: https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0 – Wejdź do zespołu ludzi z pasją!

PODAJ DALEJ 🔴
www.polskieradio.cc | www.cclite.pl
Apps: https://play.google.com/store/apps/dev?id=5215448773598149938&authuser=1`,
            image: 'promo_dzj.jpg',
            likes: 98,
            amen: 94
        },
        {
            id: 'post_dzj_2026_08_28',
            type: 'post',
            author: 'Cezary Rogowski',
            authorRole: '☀️ Dobrze, że jesteś • Założyciel Christian Culture ✨',
            authorAvatar: 'avatar_cezary_official.jpg',
            authorSlug: 'cezaryrgowski',
            time: '28 Sierpnia 2026 • ☀️ Dobrze, że jesteś',
            title: '☀️ Lato z Jezusem — Wielkie Pytania (Dzień 28)',
            text: `☀️ **Lato z Jezusem — Wielkie Pytania**
**Dzień 28 — 31 bardzo osobistych pytań Syna/Córki do Ojca: Dlaczego tak łatwo ulegam lękowi przed odrzuceniem mojej autorytetu i zdania?**

W dwudziestym ósmym dniu cyklu „Lato z Jezusem — Wielkie Pytania” rozbrajamy mechanizm obrony kruchego ego oraz lęk przed utratą autorytetu, gdy ktoś kwestionuje nasze decyzje.

W psychologii przywództwa zjawisko „kruchości autorytetu opartego na statusie” opisuje lidera, który panicznie boi się krytyki, ponieważ jego siła wynika z pozycji, a nie z wewnętrznej spójności. Wróg bezwzględnie żeruje na tej słabości, zmuszając nas do walki o każdą błahostkę. Słowo Ewangelii pokazuje postawę Jezusa, który z całkowitym spokojem i królewską klasą odpierał ataki autorytetów religijnych tamtego czasu. Chrześcijański lider najwyższej klasy nie walczy o własne ego – działa z nienagannym profesjonalizmem, opierając swój autorytet na prawdzie.

**Jezus mówi dziś do Ciebie:**
„Wtedy Jezus odezwał się i rzekł do nich: 'Zapytam was i ja o jedną rzecz...'” *(Mateusza 21,24)*

**Zadanie Taktyczne:**
Zmiażdż dziś potrzebę dominacji i lęk przed podważeniem Twojego zdania na swoim polu bitwy. Jeśli ktoś dzisiaj zakwestionuje Twoje kompetencje lub decyzję, nie reaguj gniewem ani lękiem. Odpowiedz z nienaganną klasą i spokojem. Wnieś do swojego środowiska standard dojrzałości i prawdziwego autorytetu.

W Christian Culture aplikacje i portale są zawsze BEZPŁATNE.

**Modlitwa Bojowa:**
„Ojcze, odrzucam kłamstwa nieprzyjaciela i lęk o utratę ludzkiego uznania. Przepraszam, że walczyłem o pozycję zamiast służyć w prawdzie. Daj mi odwagę, rygor i wyrazisty charakter, bym z nienaganną klasą i spokojem dzierżył autorytet, który mi powierzyłeś, zdobywając ten świat dla Twojej chwały.”

Baza i wzrost: https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0 – Wejdź do zespołu ludzi z pasją!

PODAJ DALEJ 🔴
www.polskieradio.cc | www.cclite.pl
Apps: https://play.google.com/store/apps/dev?id=5215448773598149938&authuser=1`,
            image: 'promo_dzj.jpg',
            likes: 95,
            amen: 89
        },
        {
            id: 'post_ckd_2026_08_27',
            type: 'post',
            author: 'Andrzej Thiel',
            authorRole: 'Opracowuje Rozważania „Cuda Każdego Dnia” ✨ • Sieradz',
            authorAvatar: 'avatar_andrzej_thiel.jpg',
            authorSlug: 'andrzejthiel',
            time: '27 Sierpnia 2026 • 📖 Cuda Każdego Dnia (Dzisiaj)',
            title: 'MODLITWA JEST KLUCZEM, KTÓRY OTWIERA KAŻDE DRZWI! • Cuda Każdego Dnia ✨',
            text: `CUDA KAŻDEGO DNIA! 
27 SIERPNIA 2026.
Przeczytaj i zobacz jak Bóg przemienia twoje życie.

MODLITWA JEST KLUCZEM, KTÓRY OTWIERA KAŻDE DRZWI!

Kiedy się modlisz, Bóg otwiera drzwi. Zupełnie niespodziewane drzwi i często nie te, o których myśleliśmy i o które się modliliśmy! Bóg ma swoje, Jemu tylko wiadome sposoby, ale to twoja modlitwa sprawia, że to co niemożliwe staje się możliwe. Nawet niedostępne, nadzwyczajnie chronione więzienie, w którym Herod uwięził Piotra nie stanowiło dla Boga przeszkody. Pilnowało go szesnastu żołnierzy, a do dwóch z nich był przykuty podwójnym łańcuchem. Wyobrażasz to sobie? (zobacz Dz.12,4-10). Zaś w czasie, kiedy cały zbór gorliwie się modlił o jego ocalenie, Piotr spał. Bóg cudownie odpowiedział na te modlitwy! Posłał anioła, który uwolnił go z kajdanów i wyprowadził na wolność: „A gdy minęli pierwszą i drugą straż, doszli do żelaznej bramy, która im się sama otworzyła; i wyszli na zewnątrz” (Dz.12,10).

To jest możliwe, ponieważ Jezus jest Tym, który ma klucze do każdych drzwi: „Ten który otwiera, a nikt nie zamknie, i Ten który zamyka, a nikt nie otworzy” (Ap.3,7). Może stoisz przed jakimiś zamkniętymi drzwiami? Bóg ma moc je otworzyć, ale też może pokazać ci inną drogę, zgodną z Jego planem. Nie zniechęcaj się, nie traktuj zamkniętych drzwi jako porażki. Apostoł Paweł razem ze współpracownikami chcieli udać się w misyjną podróż do Azji Mniejszej (dzisiejsza Turcja) jednak Duch Święty im na to nie pozwolił. Otworzyły się natomiast dla nich drzwi w Macedonii. (zob. Dz.16,6-10).

W modlitwie proś Bożego Ducha o prowadzenie, byś wiedział, kiedy odpuścić, a kiedy ruszyć dalej z odwagą. To było też stałą modlitwą apostoła Pawła, by Bóg otwierał mu nowe możliwości i by umiał je wykorzystać: „A módlcie się też za nas, aby Bóg otworzył nam drzwi dla Słowa” (Kol.4,3).

Jeśli modlisz się o prowadzenie Boże, bądź gotowy na możliwości jakie Bóg będzie stawiać na twojej drodze.

„Panie drogi, proszę Cię byś Ty kierował moim życiem. Bo tylko Ty znasz konsekwencje moich wyborów. Kiedy stoję na skrzyżowaniu, pokaż mi właściwą drogę. Zamknij te okazje, które choć kuszą, nie są w Twoim planie dla mnie, a otwórz drzwi, przez które mam przejść. Dodaj mi odwagi, by zrobić pierwszy krok”.
/opr. na podst. wiad. B.K./.

Dziękuję, że jesteś! ❤️`,
            image: 'cuda_kazdego_dnia_27_sierpnia_2026.jpg',
            likes: 291,
            amen: 264
        },
        {
            id: 'post_ckd_2026_08_26',
            type: 'post',
            author: 'Andrzej Thiel',
            authorRole: 'Opracowuje Rozważania „Cuda Każdego Dnia” ✨ • Sieradz',
            authorAvatar: 'avatar_andrzej_thiel.jpg',
            authorSlug: 'andrzejthiel',
            time: '26 Sierpnia 2026 • 📖 Cuda Każdego Dnia (Dzisiaj)',
            title: 'JEŚLI NIE WIESZ, JAK SIĘ MODLIĆ...! • Cuda Każdego Dnia ✨',
            text: `CUDA KAŻDEGO DNIA! 
26 SIERPNIA 2026.
Przeczytaj i zobacz jak Bóg przemienia twoje życie.

JEŚLI NIE WIESZ, JAK SIĘ MODLIĆ...!

Chciałbyś lub chciałabyś się modlić, ale nie wiesz jak? Brakuje Ci słów? A może Twoja modlitwa stała się rutyną? Spróbuj modlić się do Boga Jego własnym Słowem. Jezus powiedział: „Słowa, które Ja wam powiedziałem, są duchem i życiem” (J.6,63). Gdy wypowiadasz je w modlitwie, pozwalasz Bożej prawdzie przenikać swoje serce i patrzeć na siebie, innych oraz swoje okoliczności z Bożej perspektywy. Zamiast przedstawiać Bogu własne plany i prosić Go, by je pobłogosławił, uczysz się mówić: „Panie, chcę zaufać Tobie i nie polegać na własnym rozumie, bo Twoje myśli przewyższają moje myśli” ((Prz.3,5; Iz.55,9). Jeśli trudno ci ubrać w słowa swoje emocje, sięgnij po Psalmy. Znajdziesz w nich szczere wołanie, wdzięczność, ból, nadzieję i uwielbienie. Możesz je śmiało personalizować – przecież to Twoja osobista rozmowa z Ojcem.

Oto kilka przykładów:
• Oddając Bogu chwałę – módl się słowami Psalmu 100: „Panie, Ty jesteś moim Bogiem. Ty mnie stworzyłeś i do Ciebie należę. Przychodzę przed Ciebie z dziękczynieniem, a na Twoje dziedzińce – z uwielbieniem. Dziękuję Ci, Panie i błogosławię Twoje imię. Jesteś dobry, a Twoje miłosierdzie trwa na wieki. Twoja prawda trwa przez wszystkie pokolenia. Amen”.
• Gdy potrzebujesz kierunku: „Panie, naucz mnie pełnić Twoją wolę, bo Ty jesteś moim Bogiem. Niech Twój dobry Duch prowadzi mnie właściwą drogą” (Ps.143,10).
• Gdy brakuje Ci wiary: „Wierzę, Panie. Pomóż mi przezwyciężyć moją niewiarę” (Mk. 9,24).
• Modląc się o bliskich: „Niech Twój Duch spocznie na… (imię): Duch mądrości i rozumu, Duch rady i mocy, Duch poznania i bojaźni Pana” (Iz. 11,2).
• Modląc się o dzieci lub wnuki: „Ojcze, spraw, aby wzrastał w mądrości, w łasce u Ciebie i u ludzi” (Łk.2,52). A gdy wychodzi z domu: „Niech Twoi aniołowie strzegą go na wszystkich jego drogach” (Ps.91,11).
• Kiedy jest ci ciężko: „Panie, odpowiedz na wołanie moje, sprawiedliwy Boże mój! W ucisku ulżyłeś mi. Zmiłuj się nade mną i wysłuchaj modlitwę moją” (Ps.4,2).
• Kiedy się boisz: „Panie, Ty jesteś moją światłością i moim zbawieniem – kogo miałbym się bać? Ty jesteś ochroną mojego życia, więc nie chcę ulegać lękowi. Pomóż mi zaufać Tobie bardziej niż moim obawom.” (Ps.27,1)
• Kiedy masz złamane serce: „Kochany Ojcze, dziękuję Ci, że jesteś blisko tych, których serce jest złamane. Widzisz mój ból i nie zostawiasz mnie samego. Proszę, podnieś mnie na duchu, uzdrów moje serce i napełnij mnie swoją nadzieją.” (Ps.34,19)

Wierzę, że znajdziesz wiele innych Bożych Słów, które tchną w ciebie życie.
/opr. na podst. wiad. B.K./.

Dziękuję, że jesteś! ❤️`,
            image: 'cuda_kazdego_dnia_26_sierpnia_2026.jpg',
            likes: 284,
            amen: 256
        },
        {
            id: 'post_dzj_2026_08_26',
            type: 'post',
            author: 'Cezary Rogowski',
            authorRole: '☀️ Dobrze, że jesteś • Założyciel Christian Culture ✨',
            authorAvatar: 'avatar_cezary_official.jpg',
            authorSlug: 'cezaryrgowski',
            time: '26 Sierpnia 2026 • ☀️ Dobrze, że jesteś',
            title: '☀️ Lato z Jezusem — Wielkie Pytania (Dzień 26)',
            text: `☀️ **Lato z Jezusem — Wielkie Pytania**
**Dzień 26 — 31 bardzo osobistych pytań Syna/Córki do Ojca: Dlaczego tak łatwo ulegam lękowi przed odrzuceniem mojej wizji i marzeń?**

W dwudziestym szóstym dniu cyklu „Lato z Jezusem — Wielkie Pytania” rozbrajamy mechanizm lęku przed odrzuceniem naszych planów, celów i wizji przez niezrozumiejące otoczenie.

W psychologii twórczości zjawisko „lęku przed krytyką społeczną” opisuje barierę, w której jednostka rezygnuje ze swoich innowacyjnych pomysłów i marzeń pod wpływem presji otoczenia oczekującego konformizmu. Wróg bezwzględnie żeruje na tym lęku na duchowym froncie. Słowo Boże przypomina nam historię Józefa, którego wizje zostały wyśmiane przez najbliższych, a mimo to stały się narzędziem wielkiego ocalenia. Chrześcijański lider najwyższej klasy nie buduje swojego napędu na ludzkich oklaskach – realizuje Bożą wizję z nienaganną klasą, odwagą i profesjonalizmem, niezależnie od opinii tłumu.

**Jezus mówi dziś do Ciebie:**
„Kiedy opowiedział to ojcu i braciom, ojciec skarcił go i rzekł mu: 'Co to za sen, który śniłeś?...'” *(Księga Rodzaju 37,10)*

**Zadanie Taktyczne:**
Zmiażdż dziś lęk przed odrzuceniem Twoich planów na swoim polu bitwy. Jeśli Twoje projekty spotykają się z oporem lub brakiem wiary ze strony innych, nie trać determinacji. Skup się na precyzyjnym wykonaniu zadań i oddaj wynik Bogu. Wnieś do swojej firmy i domu standard odwagi, stabilności i dojrzałego autorytetu.

W Christian Culture aplikacje i portale są zawsze BEZPŁATNE.

**Modlitwa Bojowa:**
„Ojcze, odrzucam kłamstwa nieprzyjaciela i lęk przed odrzuceniem moich marzeń. Przepraszam, że wątpiłem z powodu ludzkiej krytyki. Dziękuję, że Twoje powołanie jest dla mnie prawem. Daj mi odwagę, rygor i wyrazisty charakter, bym z nienaganną klasą budował to, co mi powierzyłeś, zdobywając ten świat dla Twojej chwały.”

Baza i wzrost: https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0 – Wejdź do zespołu ludzi z pasją!

PODAJ DALEJ 🔴
www.polskieradio.cc | www.cclite.pl`,
            image: 'promo_dzj.jpg',
            likes: 88,
            amen: 82
        },
        {
            id: 'post_ckd_2026_08_25',
            type: 'post',
            author: 'Andrzej Thiel',
            authorRole: 'Opracowuje Rozważania „Cuda Każdego Dnia” ✨ • Sieradz',
            authorAvatar: 'avatar_andrzej_thiel.jpg',
            authorSlug: 'andrzejthiel',
            time: '25 Sierpnia 2026 • 📖 Cuda Każdego Dnia (Dzisiaj)',
            title: 'MODLITWA JEST NAJPOTĘŻNIEJSZĄ BRONIĄ! • Cuda Każdego Dnia ✨',
            text: `CUDA KAŻDEGO DNIA! 
25 SIERPNIA 2026.
Przeczytaj i zobacz jak Bóg przemienia twoje życie.

MODLITWA JEST NAJPOTĘŻNIEJSZĄ BRONIĄ!

W mediach dużo ostatnio mówi się o broni, o skutecznych sposobach walki i obrony. Tuż obok naszych granic trwa wojna, w której obie strony nieustannie pracują nad coraz nowszymi wynalazkami, które mają przeważyć szalę zwycięstwa. Systemy ochrony powietrznej, rakiety dalekiego zasięgu, drony itp. umożliwiają ochronę przed atakami, ale też precyzyjne niszczenie celów. Czy wiesz, że trwa znacznie ważniejsza, choć niewidoczna dla naszych oczu wojna? W której chodzi nie tylko o twoje doczesne życie, ale i to wieczne?

Pisze o tym Apostoł Paweł: „Nie walczymy przeciwko ludziom…, ale złym władcom niewidzialnego świata, potężnym siłom demonicznym i złym książętom ciemności rządzącymi tym światem…” (Ef.6,12). Powiesz: „To koniec ze mną”, „jestem za słaby”, „nie mam czym walczyć”. Bóg nie zostawił cię bezbronnym. Masz najbardziej skuteczną broń, która nie tylko cię ochroni, ale i dzięki której będziesz mógł skutecznie niszczyć diabelskie twierdze: „Gdyż oręż nasz, którym walczymy, nie jest cielesny, lecz ma moc burzenia warowni dla sprawy Bożej” (2 Kor. 10,4).

W co w takim razie Bóg ciebie i mnie wyposażył, byśmy nie zginęli na tej wojnie, a raczej zwyciężali? Dał nam swoje Słowo, które jest mieczem (zob. Ef.6,17) i przywilej modlitwy. Modlitwa jest najpotężniejszą bronią chrześcijan. Jej moc nie pochodzi od człowieka ani nie opiera się na ludzkich siłach, ale na Bogu, który ma wszelką władzę, mądrość i miłość. On czeka byś zaczął się modlić, bo wtedy masz wpływ na to co Bóg robi w tym świecie, ale też w tobie. Bardzo prawdziwe jest to, co odkryła między innymi Matka Teresa: “Kiedyś myślałam, że modlitwa zmienia świat wokół nas. Dziś wiem, że najpierw zmienia nas samych, a potem to my zmieniamy świat”.

Tak, Bóg często zaczyna swoje działanie od przemiany naszego serca, postawy i sposobu patrzenia. Kiedy zwalniamy i rozmawiamy z Bogiem, On może pokazać nam kto najbardziej potrzebuje miłości i jak możemy na tę potrzebę odpowiedzieć. Bądź otwarty dzisiaj na Jego impulsy. Módl się nieustannie, od chwili, kiedy się budzisz do momentu, kiedy idziesz spać. Módl się z wiarą i oczekuj, że Bóg będzie działał.

„Ojcze, wierzę, że Ty działasz, nawet kiedy tego nie widzę. Wierze, że modląc się burzę warownie wroga, które pobudował w moim sercu, moim umyśle. Niech moc Twojego Ducha działa we mnie i w życiu moich bliskich. Z Tobą mogę żyć zwycięsko!”.
/opr. na podst. wiad. B.K./.

Dziękuję, że jesteś! ❤️`,
            image: 'cuda_kazdego_dnia_25_sierpnia_2026.jpg',
            likes: 265,
            amen: 238
        },
        {
            id: 'post_dzj_2026_08_25',
            type: 'post',
            author: 'Cezary Rogowski',
            authorRole: '☀️ Dobrze, że jesteś • Założyciel Christian Culture ✨',
            authorAvatar: 'avatar_cezary_official.jpg',
            authorSlug: 'cezaryrgowski',
            time: '25 Sierpnia 2026 • ☀️ Dobrze, że jesteś',
            title: '☀️ Lato z Jezusem — Wielkie Pytania (Dzień 25)',
            text: `☀️ **Lato z Jezusem — Wielkie Pytania**
**Dzień 25 — 31 bardzo osobistych pytań Syna/Córki do Ojca: Dlaczego tak często ulegam lękowi przed utratą zdrowia i kruchością ciała?**

W dwudziestym piątym dniu cyklu „Lato z Jezusem — Wielkie Pytania” rozbrajamy mechanizm lęku przed chorobą, fizyczną słabością i przemijaniem.

W psychologii zdrowia zjawisko „lęku somatycznego i hipochondrii stresowej” opisuje stan, w którym obawa o utratę zdrowia paraliżuje codzienne funkcjonowanie i odbiera radość życia. Wróg bezwzględnie wykorzystuje tę wrażliwość, wpędzając nas w przewlekły stres. Słowo Boże przez świadectwo Pawła uderza w tę słabość: „Moc bowiem w słabości się doskonali”. Chrześcijański lider najwyższej klasy dba o swój organizm, ale nie panikuje wobec jego kruchości — powierza swoje życie Bogu z nienaganną, królewską klasą i wewnętrznym spokojem.

**Jezus mówi dziś do Ciebie:**
„Wystarczy ci mojej łaski; moc bowiem w słabości się doskonali.” *(2 Koryntian 12,9)*

**Zadanie Taktyczne:**
Zmiażdż dziś lęk o zdrowie i obsesyjne myśli o fizycznej kruchości na swoim polu bitwy. Zadbaj o siebie racjonalnie, ale oddaj niepokój o jutro w ręce Ojca. Wnieś do swojego domu i środowiska standard niezachwianego pokoju i ufności.

W Christian Culture aplikacje i portale są zawsze BEZPŁATNE.

**Modlitwa Bojowa:**
„Ojcze, odrzucam kłamstwa nieprzyjaciela i lęk przed chorobą. Przepraszam, że traciłem pokój z powodu kruchości mojego ciała. Dziękuję, że Twoja łaska podtrzymuje mnie w każdym stanie. Daj mi odwagę, rygor i wyrazisty charakter, bym z nienaganną klasą i spokojem ufał Twojej opiece, zdobywając ten świat dla Twojej chwały.”

Baza i wzrost: https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0 – Wejdź do zespołu ludzi z pasją!

PODAJ DALEJ 🔴
www.polskieradio.cc | www.cclite.pl`,
            image: 'promo_dzj.jpg',
            likes: 82,
            amen: 76
        },
        {
            id: 'post_ckd_2026_08_24',
            type: 'post',
            author: 'Andrzej Thiel',
            authorRole: 'Opracowuje Rozważania „Cuda Każdego Dnia” ✨ • Sieradz',
            authorAvatar: 'avatar_andrzej_thiel.jpg',
            authorSlug: 'andrzejthiel',
            time: '24 Sierpnia 2026 • 📖 Cuda Każdego Dnia (Dzisiaj)',
            title: 'KIEDY BRAKUJE SŁÓW! • Cuda Każdego Dnia ✨',
            text: `CUDA KAŻDEGO DNIA! 
24 SIERPNIA 2026.
Przeczytaj i zobacz jak Bóg przemienia twoje życie.

KIEDY BRAKUJE SŁÓW!

Znaleźliście się kiedyś w sytuacji, w której zabrakło wam słów? Pewnie niejeden raz, prawda? Tak bywa w chwilach ogromnego wzruszenia, radości, gdy spełnia się marzenie, na które czekaliśmy całe życie, czy gdy próbujemy wyrazić wdzięczność za czyjeś poświecenie. Ale też w chwilach ogromnego smutku, kiedy lekarz mówi „to nowotwór”, gdy tracimy kogoś bliskiego, gdy cierpimy fizycznie. W takich chwilach nasza modlitwa też często bywa ograniczona do kilku słów: „Panie kocham Cię!”, „Dziękuję!”, „Panie pomóż!”, „Panie, zmiłuj się”. I wiesz, twój Ojciec w niebie wie o tym i wcale nie oczekuje wielu słów. Jezus powiedział: „…wasz Ojciec wie, czego potrzebujecie, zanim Go poprosicie” (Mt.6,8).

Co więcej, kiedy nie macie siły wołać, doświadczacie bólu, wylaliście już wszystkie łzy lub po prostu czujecie się zagubieni i zdezorientowani, Bóg słyszy was nawet jeśli nie wydajecie głosu. On słyszy wasze serce, a Jego Duch jest przy was i wspiera was. Czytamy: „Podobnie i Duch wspiera nas w niemocy naszej; nie wiemy bowiem, o co się modlić, jak należy, ale sam Duch wstawia się za nami w niewysłowionych westchnieniach” (Rz.8,26).

Masz Ojca, który cię nie zostawi nigdy. On się troszczy o ciebie. On chce cię podnieść, zabrać twoje ciężary, twoją chorobę i przynieść uleczenie ducha, duszy i ciała. On mówi do ciebie dzisiaj: „Znam cię. Wiem, kiedy siedzisz i kiedy wstajesz. I jeszcze nie ma słowa na twoim języku żebym Ja go już nie znał (Ps.139,3-4). A jednak pragnę słyszeć wasz głos. Cieszę się, kiedy mówicie do mnie, tak jak kochający rodzic cieszy się słysząc głos swojego dziecka. Co chcielibyście abym uczynił dla was dzisiaj?”

Życzę wam, byście doświadczyli dzisiaj Jego cudownej obecności. Dotyku Jego silnych, pełnych miłości ramion, w których znajdziecie pocieszenie, podniesienie, nadzieję i siłę do kolejnego dnia.

/opr. na podst. wiad. B.K./.

Dziękuję, że jesteś! ❤️`,
            image: 'cuda_kazdego_dnia_24_sierpnia_2026.jpg',
            likes: 248,
            amen: 214
        },
        {
            id: 'post_dzj_2026_08_24',
            type: 'post',
            author: 'Cezary Rogowski',
            authorRole: '☀️ Dobrze, że jesteś • Założyciel Christian Culture ✨',
            authorAvatar: 'avatar_cezary_official.jpg',
            authorSlug: 'cezaryrgowski',
            time: '24 Sierpnia 2026 • ☀️ Dobrze, że jesteś',
            title: '☀️ Lato z Jezusem — Wielkie Pytania (Dzień 24)',
            text: `☀️ **Lato z Jezusem — Wielkie Pytania**
**Dzień 24 — 31 bardzo osobistych pytań Syna/Córki do Ojca: Dlaczego tak często ulegam lękowi przed oceną mojej przeszłości przez innych?**

W dwudziestym czwartym dniu cyklu „Lato z Jezusem — Wielkie Pytania” rozbrajamy mechanizm wstydu, lęku przed ludzką oceną oraz paraliżu związanego z dawnymi błędami.

W psychologii klinicznej zjawisko „lęku przed zdemaskowaniem” (imposter syndrome) opisuje stan, w którym człowiek żyje w ciągłym napięciu, obawiając się, że jego dawna niedoskonałość wyjdzie na jaw i zniszczy jego obecną pozycję. Wróg bezwzględnie żeruje na tym lęku na duchowym froncie. Słowo Boże przez świadectwo Apostoła Pawła uderza w tę iluzję: Paweł otwarcie przyznaje się do swojej trudnej przeszłości, czyniąc z niej świadectwo przemieniającej mocy Boga. Chrześcijański lider najwyższej klasy nie buduje swojego wizerunku na fałszywej bezbłędności — jego siłą jest autentyczne świadectwo łaski, realizowane z nienaganną, królewską klasą i odwagą.

**Jezus mówi dziś do Ciebie:**
„Ale dostąpiłem miłosierdzia, aby Jezus Chrystus na mnie pierwszym pokazał całą wielkoduszność jako przykład dla tych, którzy w Niego uwierzą...” *(1 Tymoteusza 1,16)*

**Zadanie Taktyczne:**
Zmiażdż dziś lęk przed osądem otoczenia na swoim polu bitwy. Przestań ukrywać swoją historię z lęku przed krytyką. Podejmij obowiązki nowego tygodnia z chirurgiczną precyzją, zdejmując z serca wszelki wstyd. Wnieś do swojej firmy i domu standard wolności, prawdy i niezachwianego autorytetu.

W Christian Culture aplikacje i portale są zawsze BEZPŁATNE.

**Modlitwa Bojowa:**
„Ojcze, odrzucam kłamstwa nieprzyjaciela i paraliżujący wstyd z powodu mojej przeszłości. Przepraszam, że lękałem się ludzkiego sądu. Dziękuję, że Twoje miłosierdzie całkowicie mnie odnowiło. Daj mi odwagę, rygor i wyrazisty charakter, bym z nienaganną klasą i dumą świadczył o Twojej łasce, zdobywając ten świat dla Twojej chwały.”

Baza i wzrost: https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0 – Wejdź do zespołu ludzi z pasją!

PODAJ DALEJ 🔴
www.polskieradio.cc | www.cclite.pl`,
            image: 'promo_dzj.jpg',
            likes: 74,
            amen: 68
        },
        {
            id: 'post_dzj_2026_08_23',
            type: 'post',
            author: 'Cezary Rogowski',
            authorRole: '☀️ Dobrze, że jesteś • Założyciel Christian Culture ✨',
            authorAvatar: 'avatar_cezary_official.jpg',
            authorSlug: 'cezaryrgowski',
            time: '23 Sierpnia 2026 • ☀️ Dobrze, że jesteś',
            title: '☀️ Lato z Jezusem — Wielkie Pytania (Dzień 23)',
            text: `☀️ **Lato z Jezusem — Wielkie Pytania**
**Dzień 23 — 31 bardzo osobistych pytań Syna/Córki do Ojca: Dlaczego tak łatwo ulegam lękowi przed utratą moich ludzi i zasobów?**

W dwudziestym trzecim dniu cyklu „Lato z Jezusem — Wielkie Pytania" rozbrajamy lęk przed zmianą, odejściem współpracowników oraz kurczeniem się dotychczasowych zasobów.

W psychologii zmiany pojęcie „awersji do straty" (loss aversion) opisuje mechanizm, w którym człowiek odczuwa ból straty znacznie silniej niż radość z nowego zysku, co prowadzi do obsesyjnego kurczowego trzymania się starych struktur. Wróg bezwzględnie żeruje na tym lęku na duchowym froncie. Słowo Ewangelii uderza w ten opór poprzez słowa Jezusa: „Pożyteczne jest dla was, abym Ja odszedł". Chrześcijański lider najwyższej klasy nie buduje swojego bezpieczeństwa na ludzkim monopolu – potrafi pożegnać odchodzących z nienaganną klasą i otworzyć się na nowe, potężniejsze prowadzenie Boga.

**Jezus mówi dziś do Ciebie:**
„Lecz mówię wam prawdę: Pożyteczne jest dla was, abym Ja odszedł..." *(Jana 16,7)*

**Zadanie Taktyczne:**
Zmiażdż dziś lęk przed utratą ludzi lub zasobów na swoim polu bitwy. Przeanalizuj zmiany, jakie dokonały się w Twoim otoczeniu, i odrzuć żal. Złóż podziękowanie za to, co było, i z całkowitym spokojem powierz przyszłość Bogu. Wnieś do swojego domu i środowiska standard dojrzałości, pokoju i niezachwianego autorytetu.

W Christian Culture aplikacje i portale są zawsze BEZPŁATNE.

**Modlitwa Bojowa:**
„Ojcze, odrzucam kłamstwa nieprzyjaciela i lęk przed pustką po odejściu ludzi. Przepraszam, że opierałem się zmianom z powodu egoizmu. Dziękuję, że każda strata w Twoich rękach staje się fundamentem nowego wzrostu. Daj mi odwagę, rygor i wyrazisty charakter, bym z nienaganną klasą i ufnością przyjmował nowe sezony, zdobywając ten świat dla Twojej chwały."

Baza i wzrost: https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0 – Wejdź do zespołu ludzi z pasją!

PODAJ DALEJ 🔴
www.polskieradio.cc | www.cclite.pl`,
            image: 'promo_dzj.jpg',
            likes: 64,
            amen: 58
        },
        {
            id: 'post_ckd_2026_08_23',
            type: 'post',
            author: 'Andrzej Thiel',
            authorRole: 'Cuda Każdego Dnia ✨ • Sieradz',
            authorAvatar: 'avatar_andrzej_thiel.jpg',
            authorSlug: 'andrzejthiel',
            time: '23 Sierpnia 2026 • 📖 Cuda Każdego Dnia (Dzisiaj)',
            title: 'ON SŁYSZY TWÓJ GŁOS! • Cuda Każdego Dnia ✨',
            text: `CUDA KAŻDEGO DNIA! 
23 SIERPNIA 2026.
Przeczytaj i zobacz jak Bóg przemienia twoje życie.

ON SŁYSZY TWÓJ GŁOS!

Czy wiesz, że pingwiny cesarskie i królewskie potrafią rozpoznać głos własnych piskląt spośród tysięcy młodych, zgromadzonych w tak zwanych żłobkach? Fascynujące! Jak to możliwe? Okazuje się, że pisklęta potrafią wydawać dźwięki o dwóch różnych częstotliwościach jednocześnie, co tworzy wyjątkowy „odcisk dźwiękowy”, który przypomina cyfrowy kod. Rodzice i pisklęta, jeszcze zanim się wyklują, uczą się tych dźwięków, by później móc wyfiltrować częstotliwości swojego malucha spośród hałasu tysięcy innych ptaków.

Choć jesteś jednym z tysięcy, jesteś słyszany! Psalmista pisał: „Miłuję Pana, bo usłyszał mój głos błagalny, bo nakłonił ku mnie swego ucha w dniu mego wołania” (Ps 116,1). Twój głos ma znaczenie, bo kiedy wołasz twój Ojciec w niebie odpowiada. Twój głos odróżnia się od wszystkich innych. Twoje pragnienie serca, twoja potrzeba ma dla Niego znaczenie. Bo kocha cię bardzo osobiście i czule. Chce okazywać ci łaskę przebaczenia, zaspakajać twoją potrzebę miłości, bezpieczeństwa, pokoju.

Kiedy będziesz wołał, On „skryje cię w dniu niedoli w szałasie swoim, schowa w ukryciu namiotu swego, postawi wysoko na skale” (Ps 27, 5). Wołaj do Niego w chwilach dobrych i złych. Kiedy jest ci dobrze i kiedy jest źle. Nie ma nic ważniejszego w co mógłbyś inwestować swoje życie tu na ziemi niż pielęgnowanie relacji ze swoim Bogiem. Bo choć wszystko przeminie, ona będzie trwała wiecznie!

Pamiętasz co Jezus powiedział do Marty, która w swojej chęci usłużenia Mu kompletnie się pogubiła? „Marto droga, tak wiele spraw cię zaprząta! A przecież jedno tylko się liczy w życiu naprawdę. Maria to właśnie wybrała i nie będzie tego pozbawiona” (Łk 10,41-42). Co wybrała? Budowanie relacji ze swoim Panem i Przyjacielem. Jezus tęskni by spędzać z tobą czas. On ma tyle miłości, którą chce się z tobą podzielić. Czy masz czas by się zatrzymać, spędzić go u Jego stóp i przyjąć to co On ma dla ciebie na dzisiaj?

„Ojcze, dziękuję Ci, że Twoje uszy są nakierowane na mój głos, który rozpoznajesz z daleka. Że słyszysz i odpowiadasz. Że znasz mnie i moją sytuację i będziesz działał w moim imieniu. Chcę inwestować w naszą relację. Pokieruj moim sercem i pomóż mi dzisiaj wybierać to, co przybliża mnie do Ciebie, nie oddala. Dziękuję, że otaczasz mnie łaską i miłością, bo Taki jesteś”.
/opr. na podst. wiad. B.K./.

Dziękuję, że jesteś! ❤️`,
            image: 'cuda_kazdego_dnia_23_sierpnia_2026.jpg',
            likes: 215,
            amen: 189
        },
        {
            id: 'post_ckd_2026_08_18',
            type: 'post',
            author: 'Andrzej Thiel',
            authorRole: 'Opracowuje Rozważania „Cuda Każdego Dnia” ✨ • Sieradz',
            authorAvatar: 'avatar_andrzej_thiel.jpg',
            authorSlug: 'andrzejthiel',
            time: '18 Sierpnia 2026 • 📖 Cuda Każdego Dnia',
            title: 'MASZ ZADANIE! • Cuda Każdego Dnia ✨',
            text: `CUDA KAŻDEGO DNIA! 
18 SIERPNIA 2026.
Przeczytaj i zobacz jak Bóg przemienia twoje życie.

MASZ ZADANIE!

Czytając Biblię zwróćcie uwagę na związek pomiędzy zadaniem, jakie Bóg dał Adamowi i Ewie w raju – „Rozradzajcie się i rozmnażajcie się, i napełniajcie ziemię, i czyńcie ją sobie poddaną (…) i wziął Pan Bóg człowieka i osadził go w ogrodzie Eden, aby go uprawiał i strzegł” (Rdz.1,28; Rdz.2,15) – i poleceniem Jezusa, które dał swoim uczniom: „Ja jestem krzewem winnym, wy jesteście latoroślami (…) wybrałem was i przeznaczyłem was, abyście szli i owoc wydawali i aby owoc wasz był trwały” (J.15,5,16). Czy dostrzegacie to podobieństwo? Sam Bóg chce, byśmy mieli wpływ na to, co dzieje się tu na ziemi. By nasze życie nie było bezowocne, ale zmieniało ten świat na lepsze. Jak to się nam udaje? Nie bardzo. Skutki tego widzimy. Nasza ingerencja stała się dewastacją tego, co zostało nam powierzone. Z powodu grzechu straciliśmy wrażliwość, empatię, czyste intencje, a co najważniejsze: nie czerpiemy mądrości z góry. A przecież dostaliśmy zadanie, by się troszczyć, by dbać i chronić to, co należy do Boga. To wielki honor i przywilej. Ziemia nie należy do nas: „Pańska jest ziemia i to, co ją napełnia, świat i ci, którzy na nim mieszkają (Ps.24,1). Mamy działać w najlepszym interesie właściciela, bo pewnego dnia będziemy musieli zdać z tego rachunek. Może czujesz przytłoczenie tym zdaniem? Myślisz: „Tak niewiele mogę”, „Sam nie zmienię świata”, „Czy to coś zmieni, jeśli ja przestanę używać foliowych torebek, palić czym popadnie? Co za różnica?”, „Po co się przejmować?”, „Uczciwość nie popłaca”. To bardzo niebezpieczna postawa. Wystrzegaj się jej. To, co robisz na co dzień, ma znaczenie. Jeśli nie dla ciebie bezpośrednio, z pewnością dotknie kogoś innego. Bóg widzi i docenia twoje wysiłki.

„Panie, pomóż mi być dobrym szafarzem tego, co mi powierzyłeś. Chcę odpowiedzialnie i mądrze zarządzać i przyczyniać się do tego, by piękno Twojego stworzenia nadal mogło cieszyć wszystkich dokoła”.
/opr. na podst. wiad. B.K./.

Dziękuję, że jesteś! ❤️`,
            image: 'ckd_art_2026_08_18.jpg',
            likes: 67,
            amen: 61
        },
        {
            id: 'post_ckd_2026_08_17',
            type: 'post',
            author: 'Andrzej Thiel',
            authorRole: 'Opracowuje Rozważania „Cuda Każdego Dnia” ✨ • Sieradz',
            authorAvatar: 'avatar_andrzej_thiel.jpg',
            authorSlug: 'andrzejthiel',
            time: 'Dzisiaj, 17 Sierpnia 2026 • 📖 Cuda Każdego Dnia',
            title: 'JAK KONIKI POLNE! • Cuda Każdego Dnia ✨',
            text: `CUDA KAŻDEGO DNIA! 
17 SIERPNIA 2026.
Przeczytaj i zobacz jak Bóg przemienia twoje życie.

JAK KONIKI POLNE!

Czujesz się czasem, kimś tak słabym, niewidocznym, bezsilnym – w porównaniu z górą problemów, wielką troską, zmartwieniem – jak jakiś mały robaczek? Ciąży to nad tobą jak groźny cień jastrzębia, szukającego swojej ofiary? Szpiedzy, którzy wrócili z misji wywiadowczej w Kanaanie, tak się właśnie czuli. Malutcy wobec olbrzymów. Oto co mówili: „Widzieliśmy tam olbrzymów, synów Anaka, z rodu olbrzymów, i wydawaliśmy się sobie w porównaniu z nimi jak szarańcza, i takimi też byliśmy w ich oczach” (Lb. 13,33).  Szarańcza! Czy jak czytamy w innym tłumaczeniu: koniki polne. Zwątpili. Strach ma wielkie oczy, mówi przysłowie. Kiedy zaczynasz się bać, zagrożenie rośnie, aż jego wielki cień odbiera ci nadzieję. A przecież szpiedzy nie mieli pojęcia, co tak naprawdę mogli myśleć ich wrogowie. Wiemy z późniejszej relacji, że Bóg wzbudził strach w sercach mieszkańców Kanaanu na wieść, że Izraelici zbliżają się pod mury Jerycha. Mieszkanka Jerycha, Rachab, tak powiedziała: „Wiem, że Pan dał wam tę ziemię, gdyż padł na nas strach przed wami i wszyscy mieszkańcy tej ziemi drżą przed wami” (Joz. 2,9). Widzisz to? Jeśli idziesz z Bogiem, nie ma takich olbrzymów, których On by nie mógł pokonać. Potrafi sprawić, że uciekną ze strachu.  Przed czym drżysz? Czego się boisz dzisiaj? Nazwij to, a potem przynieś Bogu, który wszystko może. Oddaj Mu to i zaufaj Mu. Nie warto ulegać strachowi, którym świetnie posługuje się szatan, by cię zniechęcić. Niestety jako ludzie niczego się nie uczymy na błędach innych, choć ten przykład jest tak wymowny.  Spełnienie obietnicy było na wyciągnięcie ręki. Nie musiało kosztować 40 lat tułaczki. Dlaczego nie skorzystali z cudu, który Bóg był gotowy dla nich uczynić? Masz wielkiego Boga, niezależnie jak słaby, mały i nic nie znaczący się sobie wydajesz! Idź z wiarą pomimo przeszkód i olbrzymów na drodze. Twój Bóg jest Bogiem cudów i to On będzie walczył za ciebie. Nie wycofuj się, nie stchórz. To, co widzisz i co cię przeraża, przepuść przez Boży teleskop, a doświadczysz cudu! 

„Boże, Ty jesteś wielki i łaskawy. Masz wspaniały plan, według którego chcesz mnie prowadzić. Pomóż mi ufać, dodaj odwagi, chcę widzieć Ciebie takiego, jakim jesteś”.
/opr. na podst. wiad. B.K./.

Dziękuję, że jesteś! ❤️`,
            image: 'ckd_art_2026_08_17.jpg',
            likes: 58,
            amen: 52
        },
        {
            id: 'post_dzj_2026_08_22',
            type: 'post',
            author: 'Cezary Rogowski',
            authorRole: '☀️ Dobrze, że jesteś • Założyciel Christian Culture ✨',
            authorAvatar: 'avatar_cezary_official.jpg',
            authorSlug: 'cezaryrgowski',
            time: '22 Sierpnia 2026 • ☀️ Dobrze, że jesteś',
            title: '☀️ Lato z Jezusem — Wielkie Pytania (Dzień 22)',
            text: `☀️ **Lato z Jezusem — Wielkie Pytania**
**Dzień 22 — 31 bardzo osobistych pytań Syna/Córki do Ojca: Dlaczego tak łatwo ulegam lękowi przed odrzuceniem moich granic?**

W dwudziestym drugim dniu cyklu „Lato z Jezusem — Wielkie Pytania” rozbrajamy pułapkę toksycznej uległości oraz nieumiejętności wyznaczania zdrowych, dojrzałych granic.

W psychologii relacyjnej zjawisko „syndromu zadowalacza ludzi” (people-pleasing syndrome) opisuje wzorzec zachowania, w którym jednostka rezygnuje z własnych granic i potrzeb ze strachu przed odrzuceniem lub konfliktem. Wróg bezwzględnie wykorzystuje tę słabość, prowadząc nas do chronicznego wypalenia. Słowo Ewangelii pokazuje nam postawę Jezusa, który potrafił usunąć się na miejsce pustynne wbrew oczekiwaniom tłumów. Chrześcijański lider najwyższej klasy dba o swoje zasoby i stawia jasne granice z nienaganną, królewską klasą, wiedząc, że nieprzemyślana uległość niszczy potencjał oddania.

**Jezus mówi dziś do Ciebie:**
„On jednak usunie się na miejsca pustynne i modlił się.” *(Łukasza 5,16)*

**Zadanie Taktyczne:**
Zmiażdż dziś lęk przed postawieniem granicy na swoim polu bitwy. Zidentyfikuj relację lub obszar, w którym z powodu uległości pozwaliasz nadwyrężać swój czas i energię. Wyznacz zdrową, jasną granicę z pełnym spokojem i szacunkiem. Wnieś do swojego domu i środowiska standard dojrzałości, ochrony zasobów i niezachwianego autorytetu.

W Christian Culture aplikacje i portale są zawsze BEZPŁATNE.

**Modlitwa Bojowa:**
„Ojcze, odrzucam kłamstwa nieprzyjaciela i lęk przed odrzuceniem z powodu stawiania granic. Przepraszam, że zaniedbywałem swoje zasoby przez źle pojętą uległość. Daj mi odwagę, rygor i wyrazisty charakter, bym z nienaganną klasą i mądrością zarządzał moim czasem i energią, zdobywając ten świat dla Twojej chwały.”

Baza i wzrost: https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0 – Wejdź do zespołu ludzi z pasją!

PODAJ DALEJ 🔴
www.polskieradio.cc | www.cclite.pl`,
            image: 'promo_dzj.jpg',
            likes: 72,
            amen: 65
        },
        {
            id: 'post_dzj_2026_08_21',
            type: 'post',
            author: 'Cezary Rogowski',
            authorRole: '☀️ Dobrze, że jesteś • Założyciel Christian Culture ✨',
            authorAvatar: 'avatar_cezary_official.jpg',
            authorSlug: 'cezaryrgowski',
            time: '21 Sierpnia 2026 • ☀️ Dobrze, że jesteś',
            title: '☀️ Lato z Jezusem — Wielkie Pytania (Dzień 21)',
            text: `☀️ **Lato z Jezusem — Wielkie Pytania**
**Dzień 21 — 31 bardzo osobistych pytań Syna/Córki do Ojca: Dlaczego tak łatwo ulegam lękowi przed utratą moich wpływów i pozycji?**

W dwudziestym pierwszym dniu cyklu „Lato z Jezusem — Wielkie Pytania” rozbrajamy mechanizm terytorialnej zazdrości oraz lęk przed tym, że ktoś inny zdobędzie większe uznanie lub pozycję.

W psychologii przywództwa zjawisko „syndromu strażnika bramy” (gatekeeper syndrome) opisuje lidera, który ze strachu przed utratą kontroli blokuje rozwój utalentowanych podwładnych. Wróg bezwzględnie żeruje na tym lęku, przekształcając nas w zaborczych rywali. Słowo Ewangelii uderza w ten egoizm poprzez postawę Jana Chrzciciela: „On musi rosnąć, ja zaś muszę maleć”. Chrześcijański lider najwyższej klasy nie boi się silnych ludzi wokół siebie — potrafi z nienaganną klasą i hojnością otwierać drzwi innym, wiedząc, że prawdziwa wielkość polega na służbie.

**Jezus mówi dziś do Ciebie:**
„On musi rosnąć, ja zaś muszę maleć.” *(Jana 3,30)*

**Zadanie Taktyczne:**
Zmiażdż dziś lęk przed konkurencją na swoim polu bitwy. Zidentyfikuj relację zawodową lub środowiskową, w której czułeś ukryty opór przed sukcesem innej osoby. Zmień nastawienie: zaoferuj jej wsparcie, pochwal jej osiągnięcie i ciesz się jej wzrostem. Wnieś do swojej firmy i domu standard wspaniałomyślności, bezpieczeństwa i dojrzałego autorytetu.

W Christian Culture aplikacje i portale są zawsze BEZPŁATNE.

**Modlitwa Bojowa:**
„Ojcze, odrzucam kłamstwa nieprzyjaciela i zaborczą zazdrość o wpływy. Przepraszam, że lękałem się cudzego sukcesu. Dziękuję, że moje miejsce u Twojego boku jest niewzruszone. Daj mi odwagę, rygor i wyrazisty charakter, bym z nienaganną klasą hojnie wspierał wzrost innych, zdobywając ten świat dla Twojej chwały.”

Baza i wzrost: https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0 – Wejdź do zespołu ludzi z pasją!

PODAJ DALEJ 🔴
www.polskieradio.cc | www.cclite.pl`,
            image: 'promo_dzj.jpg',
            likes: 64,
            amen: 58
        },
        {
            id: 'post_c1',
            type: 'post',
            author: 'Cezary Rogowski',
            authorRole: 'Założyciel Christian Culture ✨',
            authorAvatar: 'avatar_cezary_official.jpg',
            authorSlug: 'cezaryrgowski',
            get dynamicTime() { return safeFormatTimestamp(new Date(Date.now() - 22 * 3600 * 1000)) + ' • 🌍 Publiczny'; },
            title: 'Fundament Bożej Relacji',
            text: 'Witaj na portalu LUMINA! Wierzę, że najpiękniejsze relacje rodzą się wtedy, gdy Chrystus jest w centrum każdego kroku. Szukajmy bratnich dusz, z którymi będziemy wspólnie służyć, modlić się i budować Boże Królestwo! ☕✨',
            image: 'avatar_cezary_official.jpg',
            likes: 42,
            amen: 38
        },
        {
            id: 'post_c2',
            type: 'post',
            author: 'Cezary Rogowski',
            authorRole: 'Założyciel Christian Culture ✨',
            authorAvatar: 'avatar_cezary_official.jpg',
            authorSlug: 'cezaryrgowski',
            get dynamicTime() { return safeFormatTimestamp(new Date(Date.now() - 46 * 3600 * 1000)) + ' • 📖 Rozważanie'; },
            title: 'Pokój w Chrystusie',
            text: '„Nie troszczcie się zbytnio o jutro, albowiem jutrzejszy dzień sam o siebie troszczyć się będzie.” (Mt 6, 34). Niech ten werset przyniesie Wam dzisiaj pokój serca i siłę do działania! 🙏',
            image: 'tlo_pr_cc.jpg',
            likes: 58,
            amen: 51
        },
        {
            id: 'post_wioletta_yt_1',
            type: 'post',
            author: 'Wioletta Rogowska',
            authorRole: 'Współzałożycielka Christian Culture 💕',
            authorAvatar: 'avatar_wioletta_official.jpg',
            authorSlug: 'wiolettarogowska',
            get dynamicTime() { return safeFormatTimestamp(new Date(Date.now() - 2 * 3600 * 1000)) + ' • 🎬 Nowość Wideo'; },
            title: 'Hymn o Wytrwałości | WOMEN TV • CC WOMEN',
            text: 'Droga Siostro i Drogi Bracie! ✨ Z całego serca zapraszam Was do wysłuchania naszego najnowszego utworu: „Hymn o Wytrwałości”. Bez względu na to, jak trudna wydaje się dzisiaj Twoja droga – pamiętaj, że Boża łaska i moc doskonalą się w naszej słabości. Wytrwaj, zaufaj Panu i nigdy nie trać nadziei! 💕🕊️\n\nObejrzyj i posłuchaj tutaj: https://www.youtube.com/watch?v=RT9m7K0fMgM\n\nSubskrybuj nasz oficjalny kanał CC WOMEN: https://youtube.com/@womentv24?si=gtUZ764bTofGk3Py ✨',
            image: 'https://i.ytimg.com/vi/RT9m7K0fMgM/hqdefault.jpg',
            youtubeUrl: 'https://www.youtube.com/watch?v=RT9m7K0fMgM',
            likes: 88,
            amen: 79
        },
        {
            id: 'post_wioletta_yt_2',
            type: 'post',
            author: 'Wioletta Rogowska',
            authorRole: 'Współzałożycielka Christian Culture 💕',
            authorAvatar: 'avatar_wioletta_official.jpg',
            authorSlug: 'wiolettarogowska',
            get dynamicTime() { return safeFormatTimestamp(new Date(Date.now() - 14 * 3600 * 1000)) + ' • 🌸 Uwielbienie'; },
            title: 'Tylko On | WOMEN TV • CC WOMEN',
            text: '„Tylko On potrafi ukoić skołatane serce, wlać głęboki pokój i dać nadzieję, której ten świat nigdy dać nie potrafi.” Zapraszam Was do wspólnego uwielbienia i zanurzenia się w Bożej obecności. Niech ten utwór napełni Wasze domy i rodziny obecnością Ducha Świętego! 🌸🙏\n\nPosłuchaj utworu: https://www.youtube.com/watch?v=vH2eSEVtTtY\n\nDołącz do nas na kanale CC WOMEN: https://youtube.com/@womentv24?si=gtUZ764bTofGk3Py',
            image: 'https://i.ytimg.com/vi/vH2eSEVtTtY/hqdefault.jpg',
            youtubeUrl: 'https://www.youtube.com/watch?v=vH2eSEVtTtY',
            likes: 104,
            amen: 95
        },
        {
            id: 'post_wioletta_yt_3',
            type: 'post',
            author: 'Wioletta Rogowska',
            authorRole: 'Współzałożycielka Christian Culture 💕',
            authorAvatar: 'avatar_wioletta_official.jpg',
            authorSlug: 'wiolettarogowska',
            get dynamicTime() { return safeFormatTimestamp(new Date(Date.now() - 28 * 3600 * 1000)) + ' • ✨ Świadectwo Wiary'; },
            title: 'Po spotkaniu z JEZUSEM – Twoje życie się zmieni!',
            text: 'Spotkanie z żywym Chrystusem zmienia absolutnie wszystko: usuwa lęk, leczy rany z przeszłości i nadaje życiu wieczny sens. Jeśli szukasz nowego początku i pragniesz doświadczyć Bożej miłości – Ten, który oddał za Ciebie życie, czeka na Ciebie z otwartymi ramionami! Obejrzyj to poruszające przesłanie: https://www.youtube.com/watch?v=kGDQZ1PwWu8 💕🕊️',
            image: 'https://i.ytimg.com/vi/kGDQZ1PwWu8/hqdefault.jpg',
            youtubeUrl: 'https://www.youtube.com/watch?v=kGDQZ1PwWu8',
            likes: 119,
            amen: 110
        },
        {
            id: 'post_wioletta_yt_4',
            type: 'post',
            author: 'Wioletta Rogowska',
            authorRole: 'Współzałożycielka Christian Culture 💕',
            authorAvatar: 'avatar_wioletta_official.jpg',
            authorSlug: 'wiolettarogowska',
            get dynamicTime() { return safeFormatTimestamp(new Date(Date.now() - 52 * 3600 * 1000)) + ' • 👑 Oficjalny Utwór'; },
            title: 'Jestem Kobietą Boga | Oficjalny Hymn CC WOMEN',
            text: 'Oficjalny utwór kanału WOMEN TV: „Jestem Kobietą Boga”! Jesteśmy powołane do świętości, godności, łagodności i niesienia Bożego światła w naszych domach, małżeństwach i całym otoczeniu. Bądź dumna z tego, kim jesteś w Chrystusie! 👑🌸\n\nOdtwórz wideo: https://www.youtube.com/watch?v=wcqjqT5wDPY\n\nSubskrybuj nasz kanał: https://youtube.com/@womentv24?si=gtUZ764bTofGk3Py',
            image: 'https://i.ytimg.com/vi/wcqjqT5wDPY/hqdefault.jpg',
            youtubeUrl: 'https://www.youtube.com/watch?v=wcqjqT5wDPY',
            likes: 142,
            amen: 131
        },
        {
            id: 'post_w1',
            type: 'post',
            author: 'Wioletta Rogowska',
            authorRole: 'Współzałożycielka Christian Culture 💕',
            authorAvatar: 'avatar_wioletta_official.jpg',
            authorSlug: 'wiolettarogowska',
            get dynamicTime() { return safeFormatTimestamp(new Date(Date.now() - 20 * 3600 * 1000)) + ' • 🌍 Publiczny'; },
            title: 'Miłość Przewyższająca Perły',
            text: 'Razem z moim mężem Cezarym wierzymy z całego serca, że Boże relacje budowane na fundamencie Chrystusa przynoszą niegasnący pokój, prawdziwą miłość i siłę na każdy dzień! 💕✨',
            image: 'avatar_wioletta_official.jpg',
            likes: 64,
            amen: 59
        },
        {
            id: 'post_w2',
            type: 'post',
            author: 'Wioletta Rogowska',
            authorRole: 'Współzałożycielka Christian Culture 💕',
            authorAvatar: 'avatar_wioletta_official.jpg',
            authorSlug: 'wiolettarogowska',
            get dynamicTime() { return safeFormatTimestamp(new Date(Date.now() - 44 * 3600 * 1000)) + ' • 📖 Słowo Życia'; },
            title: 'Gorąca Miłość Wzajemna',
            text: '„Przede wszystkim miejcie gorącą miłość jedni ku drugim, bo miłość zakrywa mnóstwo grzechów.” (1 P 4, 8). Błogosławionego i pełnego Bożej obecności wieczoru! 🙏',
            image: 'tlo_ksiega_nadziei.png',
            likes: 72,
            amen: 65
        },
        {
            id: 'post_sds_1',
            type: 'post',
            author: 'Studio Dobrego Słowa',
            authorRole: 'Kanał YouTube @StudioDeeS 🎙️',
            authorAvatar: 'studiodobregoslowa_avatar.jpg',
            authorSlug: 'studiodobregoslowa',
            get dynamicTime() { return safeFormatTimestamp(new Date(Date.now() - 30 * 3600 * 1000)) + ' • 🎬 Nowy Podcast Wideo'; },
            title: 'Nowy Podcast Wideo: Boże Prowadzenie w Relacjach',
            text: 'Premiera nowego odcinka! Zapraszamy do obejrzenia i wysłuchania głębokiej rozmowy o Bożym prowadzeniu w relacjach. Link: https://youtu.be/hHug_C6XDPU ☕🕊️ Zapraszamy także do naszej Herbaciarni Dobrego Słowa!',
            image: 'https://img.youtube.com/vi/hHug_C6XDPU/maxresdefault.jpg',
            likes: 64,
            amen: 52
        },
        {
            id: 'post_ccw_1',
            type: 'post',
            author: 'CC Women Official',
            authorRole: 'Oficjalny Kanał YouTube CC Women 🌸',
            authorAvatar: 'logo_cc_women.jpg',
            authorSlug: 'ccwomen',
            get dynamicTime() { return safeFormatTimestamp(new Date(Date.now() - 50 * 3600 * 1000)) + ' • 🌸 Wzrost Kobiet'; },
            title: 'Kobiety Wiary i Boże Powołanie',
            text: 'Nowy materiał dla kobiet wiary już dostępny na naszym kanale YouTube! Zobacz jak budować poczucie własnej wartości w Bożych oczach i odkrywać Boże powołanie do miłości i mądrości. 🌸🕊️',
            image: 'logo_cc_women.jpg',
            likes: 47,
            amen: 41
        },
        {
            id: 'post_magdalena_1',
            type: 'post',
            author: 'Magdalena',
            authorRole: 'Poznań • Społeczność LUMINA 🕊️',
            authorAvatar: 'avatar_magdalena.png',
            authorSlug: 'magdalena',
            get dynamicTime() { return safeFormatTimestamp(new Date(Date.now() - 14 * 3600 * 1000)) + ' • 🌟 Nowy Profil'; },
            title: 'Zaufanie Bogu i Otwarte Serce',
            text: 'Szczęść Boże wszystkim! Wierzę, że najpiękniejsze relacje rodzą się z zaufania Bogu i otwartego serca. Pozdrawiam serdecznie całą społeczność LUMINA z Poznania! 🕊️✨',
            image: 'avatar_magdalena.png',
            likes: 28,
            amen: 24
        },
        {
            id: 'post_tomek1',
            type: 'post',
            author: 'Tomasz',
            authorRole: 'Profil Poglądowy • Pasjonat Gór 🌲',
            authorAvatar: 'avatar_widget_tomek.jpg',
            authorSlug: 'tomek',
            get dynamicTime() { return safeFormatTimestamp(new Date(Date.now() - 16 * 3600 * 1000)) + ' • 🏔️ Wędrówki z Bogiem'; },
            title: 'Cisza i Boża Obecność na Szlaku',
            text: 'Nic tak nie przybliża do Stwórcy jak poranna modlitwa w górach przy wschodzie słońca. Pozdrawiam całą chrześcijańską społeczność portalu LUMINA! 🌲⛰️',
            image: 'worship_bg.jpg',
            likes: 31,
            amen: 27
        },
        {
            id: 'post_noemi1',
            type: 'post',
            author: 'Noemi',
            authorRole: 'Profil Poglądowy • Wrocław 🌿',
            authorAvatar: 'avatar_noemi.jpg',
            authorSlug: 'noemi',
            get dynamicTime() { return safeFormatTimestamp(new Date(Date.now() - 18 * 3600 * 1000)) + ' • ☕ Rozmowy o Wierze'; },
            title: 'Wdzięczność za Małe Rzeczy',
            text: '„Pan jest moją siłą i moją tarczą, w Nim zaufało moje serce i otrzymałem pomoc.” Życzę Wam pięknego dnia pełnego łaski! ✨🌿',
            image: 'avatar_noemi.jpg',
            likes: 45,
            amen: 39
        },
        {
            id: 'post_dawid1',
            type: 'post',
            author: 'Dawid',
            authorRole: 'Profil Poglądowy • Architekt & Muzyk 🎵',
            authorAvatar: 'avatar_dawid.jpg',
            authorSlug: 'dawid',
            get dynamicTime() { return safeFormatTimestamp(new Date(Date.now() - 26 * 3600 * 1000)) + ' • 🎸 Muzyka Uwielbienia'; },
            title: 'Nowe Dźwięki Ku Bożej Chwale',
            text: 'Przygotowujemy z zespołem nową aranżację Psalmów. Nie ma nic piękniejszego niż łączenie talentów ze służbą dla Pana! 🎶🎸',
            image: '',
            likes: 53,
            amen: 48
        },
        {
            id: 'post_weronika1',
            type: 'post',
            author: 'Weronika',
            authorRole: 'Profil Poglądowy • Graficzka 🎨',
            authorAvatar: 'avatar_widget_ania.jpg',
            authorSlug: 'weronika',
            get dynamicTime() { return safeFormatTimestamp(new Date(Date.now() - 28 * 3600 * 1000)) + ' • 🎨 Sztuka i Wiara'; },
            title: 'Piękno Stworzenia',
            text: 'Każdy wschód słońca to nowe płótno namalowane ręką Boga. Szukajmy piękna i dobra we wszystkim, co nas otacza! ✨',
            image: 'avatar_widget_ania.jpg',
            likes: 39,
            amen: 34
        }
    ];

    /**
     * Zwraca bezpieczną, zaktualizowaną listę wszystkich postów z uwzględnieniem
     * dynamicznych zmian profili w localStorage (np. zmiana avatara lub imienia Cezarego/Wioletty/Andrzeja)
     */
    function getSafeCommunityPosts() {
        const posts = [];
        
        LUMINA_CORE_POSTS_DATA.forEach(baseItem => {
            try {
                const item = { ...baseItem };
                item.time = item.dynamicTime || item.time || 'Dzisiaj';

                // Synchronizacja dynamicznego avatara i imienia z localStorage
                if (item.authorSlug) {
                    try {
                        const localProfileStr = localStorage.getItem('lumina_profile_' + item.authorSlug);
                        if (localProfileStr) {
                            const p = JSON.parse(localProfileStr);
                            if (p && p.name) item.author = p.name;
                            if (p && p.avatar && !p.avatar.includes('avatar_new1')) item.authorAvatar = p.avatar;
                        }
                    } catch(e) {}
                }

                posts.push(item);
            } catch(e) {
                console.warn('Lumina Post parsing error:', e);
            }
        });

        return posts;
    }

    // Eksport globalny do window
    global.LUMINA_CORE_POSTS_DATA = LUMINA_CORE_POSTS_DATA;
    global.getSafeCommunityPosts = getSafeCommunityPosts;

})(typeof window !== 'undefined' ? window : globalThis);
