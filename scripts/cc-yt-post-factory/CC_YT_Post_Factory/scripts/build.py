import json, csv, re, html, os
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent

def find_font(size, bold=True):
    from PIL import ImageFont
    candidates = [
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\calibrib.ttf" if bold else r"C:\Windows\Fonts\calibri.ttf",
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for c in candidates:
        if Path(c).exists():
            try:
                return ImageFont.truetype(c, size)
            except Exception:
                pass
    return ImageFont.load_default()

def main():
    campaign_file = ROOT / 'campaign.json'
    channels_file = ROOT / 'channels.json'

    if not campaign_file.exists():
        raise SystemExit('BŁĄD: brak pliku campaign.json')
    if not channels_file.exists():
        raise SystemExit('BŁĄD: brak pliku channels.json')

    c = json.loads(campaign_file.read_text(encoding='utf-8'))
    channels = json.loads(channels_file.read_text(encoding='utf-8'))

    u = urlparse(c.get('url', ''))
    if u.scheme != 'https' or not u.netloc:
        raise SystemExit('BŁĄD: wymagany zweryfikowany URL HTTPS w campaign.json')

    campaign_id = re.sub(r'[^a-zA-Z0-9_-]', '_', c.get('id', 'default_campaign'))
    out = ROOT / 'output' / campaign_id
    out.mkdir(parents=True, exist_ok=True)

    # 1. GENEROWANIE LUB KOPIOWANIE GRAFIKI 1:1 (1080x1080)
    image_file = Path(c.get('image_file', '')) if c.get('image_file') else None
    if image_file:
        from shutil import copy2
        if not image_file.is_absolute():
            image_file = ROOT / image_file
        if not image_file.is_file():
            raise SystemExit(f'BŁĄD: plik grafiki nie istnieje: {image_file}')
        if image_file.suffix.lower() not in ['.png', '.jpg', '.jpeg', '.webp', '.gif']:
            raise SystemExit('BŁĄD: nieobsługiwany format grafiki')
        image = out / ('grafika' + image_file.suffix.lower())
        copy2(image_file, image)
    else:
        try:
            from PIL import Image, ImageDraw
        except ImportError:
            raise SystemExit('Zainstaluj Pillow: python -m pip install Pillow lub użyj uv run --with pillow python build.py')

        image = out / 'grafika.png'
        # 1080x1080 Christian Culture Luxury Palette
        im = Image.new('RGB', (1080, 1080), '#0B121C')
        d = ImageDraw.Draw(im)

        # Elegant double border in Champagne Gold & Dark Azure
        d.rounded_rectangle([32, 32, 1048, 1048], radius=36, fill='#111C2B', outline='#C4A35A', width=4)
        d.rounded_rectangle([44, 44, 1036, 1036], radius=28, fill=None, outline='#1E2E42', width=2)

        # Brand header badge
        d.text((80, 80), 'CHRISTIAN CULTURE', font=find_font(36, bold=True), fill='#C4A35A')
        d.text((80, 126), 'EKOSYSTEM MEDIÓW I EWANGELIZACJI', font=find_font(20, bold=False), fill='#94A3B8')
        d.line([(80, 165), (1000, 165)], fill='#C4A35A', width=2)

        # Campaign main title
        title_text = c.get('graphic_title', 'DOBRE SŁOWO').upper()
        font_title = find_font(68, bold=True)
        lines = []
        curr = ''
        for word in title_text.split():
            candidate = (curr + ' ' + word).strip()
            bbox = d.textbbox((0, 0), candidate, font=font_title)
            if (bbox[2] - bbox[0]) > 860 and curr:
                lines.append(curr)
                curr = word
            else:
                curr = candidate
        if curr:
            lines.append(curr)

        for i, line in enumerate(lines[:4]):
            d.text((80, 240 + 85 * i), line, font=font_title, fill='#FFFFFF')

        # Subtitle quote preview
        sub_text = c.get('text_pl', '')
        font_sub = find_font(34, bold=False)
        sub_lines = []
        curr_sub = ''
        for word in sub_text.split():
            cand_sub = (curr_sub + ' ' + word).strip()
            bbox_sub = d.textbbox((0, 0), cand_sub, font=font_sub)
            if (bbox_sub[2] - bbox_sub[0]) > 860 and curr_sub:
                sub_lines.append(curr_sub)
                curr_sub = word
            else:
                curr_sub = cand_sub
        if curr_sub:
            sub_lines.append(curr_sub)

        start_sub_y = 260 + 85 * len(lines) + 40
        for j, sline in enumerate(sub_lines[:4]):
            d.text((80, start_sub_y + 48 * j), sline, font=font_sub, fill='#E2E8F0')

        # Modern Orange Action Button (#FF7A00 - JOMA-D052)
        d.rounded_rectangle([80, 880, 1000, 970], radius=22, fill='#FF7A00', outline='#FFA34D', width=2)
        btn_label = 'ODKRYJ I PODZIEL SIĘ  →'
        d.text((320, 905), btn_label, font=find_font(38, bold=True), fill='#FFFFFF')

        # Footer URL
        clean_url = c.get('url', '').replace('https://', '')
        d.text((80, 995), clean_url, font=find_font(24, bold=False), fill='#C4A35A')

        im.save(image, quality=95)

    if image.stat().st_size > 16_000_000:
        raise SystemExit('BŁĄD: plik grafiki przekracza limit YouTube (16 MB)')

    # 2. GENEROWANIE TREŚCI POSTÓW I KART KANAŁÓW
    rows = []
    cards_html = []
    active_count = 0

    for ch in channels:
        if not ch.get('enabled', False):
            continue
        active_count += 1
        ident = ch['id']
        name = ch['name']
        lang = ch.get('language', 'pl')
        angle = ch.get('angle', '')
        handle = ch.get('handle', '')
        ch_id = ch.get('channel_id', '')
        via = ch.get('via', '')

        text_key = f'text_{lang}' if f'text_{lang}' in c else 'text_pl'
        cta_key = f'cta_{lang}' if f'cta_{lang}' in c else 'cta_pl'
        tags_key = f'hashtags_{lang}' if f'hashtags_{lang}' in c else 'hashtags_pl'

        main_text = c.get(text_key, '')
        cta = c.get(cta_key, '👉 Odkryj:')
        tags = ' '.join(c.get(tags_key, ['#ChristianCulture']))
        url = c.get('url', '')

        # Format posta: Hook + treść główna + kąt kanału + CTA + URL + Hashtagi
        parts = [p for p in [main_text, angle, f'{cta} {url}', tags] if p]
        full_message = '\n\n'.join(parts)

        # Zapis do pliku .txt
        post_file = out / f'{ident}.txt'
        post_file.write_text(full_message + '\n', encoding='utf-8')

        char_count = len(full_message)

        # Wiersz do CSV
        rows.append({
            'kanal': name,
            'uchwyt': handle,
            'channel_id': ch_id,
            'konto_zarzadzajace': via,
            'status': 'DO ZATWIERDZENIA',
            'plik': post_file.name,
            'grafika': image.name,
            'znaki': char_count,
            'url_posta': '',
            'data': '',
            'uwagi': ''
        })

        # Linki do YouTube Studio
        studio_url = f"https://studio.youtube.com/channel/{ch_id}" if ch_id else "https://studio.youtube.com/"
        community_url = f"https://www.youtube.com/channel/{ch_id}/community" if ch_id else "https://www.youtube.com/"

        via_badge = f'<span class="badge badge-manager" title="Dostępne z konta {html.escape(via)}">Zarządzane przez: {html.escape(via)}</span>' if (via and via != handle) else ''

        cards_html.append(f'''
        <div class="channel-card" data-channel-id="{html.escape(ident)}">
            <div class="channel-header">
                <div class="channel-title-group">
                    <span class="channel-lang-pill">{lang.upper()}</span>
                    <h2 class="channel-name">{html.escape(name)}</h2>
                    <span class="channel-handle">{html.escape(handle)}</span>
                    {via_badge}
                </div>
                <div class="channel-actions-top">
                    <span class="char-counter" id="cc_{ident}">{char_count} znaków</span>
                    <button type="button" class="btn-copy" onclick="copyPostText('{ident}')">📋 Kopiuj treść posta</button>
                    <a href="{html.escape(studio_url)}" target="_blank" rel="noopener" class="btn-studio">🚀 Otwórz YouTube Studio</a>
                    <a href="{html.escape(community_url)}" target="_blank" rel="noopener" class="btn-community">🌐 Karta Społeczność</a>
                </div>
            </div>

            <div class="post-preview-box">
                <div class="post-text-wrap">
                    <textarea class="post-textarea" id="text_{ident}" readonly>{html.escape(full_message)}</textarea>
                </div>
                <div class="post-image-preview">
                    <img src="{image.name}" alt="Podgląd grafiki" class="thumb-img" onclick="openImageModal('{image.name}')" title="Kliknij, aby powiększyć">
                    <a href="{image.name}" download="{image.name}" class="btn-download-img">⬇ Pobierz 1:1</a>
                </div>
            </div>

            <div class="channel-status-bar">
                <div class="status-select-wrap">
                    <label for="status_{ident}">Status kanału:</label>
                    <select id="status_{ident}" class="status-dropdown" onchange="updateChannelStatus('{ident}')">
                        <option value="DO ZATWIERDZENIA" selected>⏳ DO ZATWIERDZENIA</option>
                        <option value="SKOPIOWANO">📋 SKOPIOWANO DO SCHOWKA</option>
                        <option value="ZAPLANOWANO">⏰ ZAPLANOWANO W STUDIO</option>
                        <option value="OPUBLIKOWANO">✅ OPUBLIKOWANO NA ŻYWO</option>
                        <option value="BŁĄD">⚠️ BŁĄD / POMINIĘTO</option>
                    </select>
                </div>
                <div class="post-url-wrap">
                    <label for="url_{ident}">Link do opublikowanego posta:</label>
                    <input type="url" id="url_{ident}" class="post-url-input" placeholder="https://youtube.com/post/..." oninput="updateChannelStatus('{ident}')">
                </div>
            </div>
        </div>
        ''')

    # Zapis CSV
    if rows:
        with (out / 'status_publikacji.csv').open('w', encoding='utf-8-sig', newline='') as f:
            w = csv.DictWriter(f, fieldnames=rows[0].keys())
            w.writeheader()
            w.writerows(rows)

    # 3. GENEROWANIE PANELU PUBLIKACJI (HTML5 + LUXURY DARK THEME)
    all_cards_str = '\n'.join(cards_html)
    panel_html = f'''<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>CC YouTube Post Factory · {html.escape(c.get("id", "Kampania"))}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {{
            --bg-base: #07090E;
            --bg-card: rgba(18, 24, 38, 0.85);
            --bg-surface: #0E1624;
            --gold-primary: #C4A35A;
            --gold-light: #E2CC9A;
            --gold-border: rgba(196, 163, 90, 0.35);
            --orange-cta: #FF7A00;
            --orange-hover: #FF8C33;
            --orange-active: #E66A00;
            --text-main: #F8FAFC;
            --text-muted: #94A3B8;
            --radius-card: 16px;
        }}
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            background: var(--bg-base);
            color: var(--text-main);
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
            padding: 30px 20px 80px;
            line-height: 1.5;
        }}
        .container {{
            max-width: 1100px;
            margin: 0 auto;
        }}
        .factory-header {{
            background: linear-gradient(135deg, rgba(20, 30, 48, 0.95), rgba(12, 18, 28, 0.95));
            border: 1px solid var(--gold-border);
            border-radius: var(--radius-card);
            padding: 28px 32px;
            margin-bottom: 24px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            backdrop-filter: blur(12px);
        }}
        .brand-badge {{
            display: inline-block;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.15em;
            color: var(--gold-primary);
            text-transform: uppercase;
            margin-bottom: 8px;
        }}
        .factory-title {{
            font-size: 28px;
            font-weight: 800;
            color: #FFFFFF;
            letter-spacing: -0.02em;
            margin-bottom: 8px;
        }}
        .factory-desc {{
            color: var(--text-muted);
            font-size: 15px;
            max-width: 800px;
            margin-bottom: 16px;
        }}
        .header-meta-row {{
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            align-items: center;
            padding-top: 14px;
            border-top: 1px solid rgba(255,255,255,0.08);
        }}
        .meta-pill {{
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 6px 14px;
            font-size: 13px;
            color: var(--gold-light);
        }}
        .btn-export-csv {{
            background: var(--orange-cta);
            color: #FFFFFF;
            border: none;
            border-radius: 12px;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            margin-left: auto;
            transition: all 0.2s ease;
        }}
        .btn-export-csv:hover {{ background: var(--orange-hover); transform: translateY(-1px); }}
        .btn-export-csv:active {{ background: var(--orange-active); }}

        /* Channel Cards */
        .channel-card {{
            background: var(--bg-card);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: var(--radius-card);
            padding: 24px;
            margin-bottom: 20px;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }}
        .channel-card:hover {{
            border-color: var(--gold-border);
            box-shadow: 0 8px 30px rgba(0,0,0,0.35);
        }}
        .channel-header {{
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            margin-bottom: 18px;
        }}
        .channel-title-group {{
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }}
        .channel-lang-pill {{
            background: var(--gold-primary);
            color: #07090E;
            font-weight: 800;
            font-size: 11px;
            padding: 4px 8px;
            border-radius: 6px;
        }}
        .channel-name {{
            font-size: 19px;
            font-weight: 700;
            color: #FFFFFF;
        }}
        .channel-handle {{
            color: var(--gold-light);
            font-size: 13px;
            font-family: 'JetBrains Mono', monospace;
            background: rgba(196, 163, 90, 0.1);
            padding: 3px 8px;
            border-radius: 6px;
        }}
        .badge-manager {{
            font-size: 11px;
            color: #38BDF8;
            background: rgba(56, 189, 248, 0.12);
            border: 1px solid rgba(56, 189, 248, 0.25);
            padding: 3px 8px;
            border-radius: 6px;
        }}
        .channel-actions-top {{
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
        }}
        .char-counter {{
            font-size: 12px;
            color: var(--text-muted);
            font-family: 'JetBrains Mono', monospace;
        }}
        button, a.btn-studio, a.btn-community {{
            display: inline-flex;
            align-items: center;
            gap: 6px;
            text-decoration: none;
            padding: 9px 14px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            min-height: 40px;
        }}
        .btn-copy {{
            background: #1E293B;
            color: #F8FAFC;
            border: 1px solid rgba(255,255,255,0.15);
        }}
        .btn-copy:hover {{ background: #334155; border-color: var(--gold-primary); }}
        .btn-copy.copied {{ background: #059669; color: white; border-color: #10B981; }}
        .btn-studio {{
            background: var(--orange-cta);
            color: white;
            border: none;
        }}
        .btn-studio:hover {{ background: var(--orange-hover); color: white; }}
        .btn-community {{
            background: rgba(255,255,255,0.06);
            color: var(--gold-light);
            border: 1px solid rgba(196, 163, 90, 0.3);
        }}
        .btn-community:hover {{ background: rgba(196, 163, 90, 0.15); }}

        /* Post Body & Image Preview */
        .post-preview-box {{
            display: grid;
            grid-template-columns: 1fr 180px;
            gap: 16px;
            margin-bottom: 18px;
        }}
        @media (max-width: 768px) {{
            .post-preview-box {{ grid-template-columns: 1fr; }}
        }}
        .post-textarea {{
            width: 100%;
            height: 180px;
            background: var(--bg-surface);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            color: #E2E8F0;
            font-family: inherit;
            font-size: 14px;
            line-height: 1.6;
            padding: 14px;
            resize: vertical;
        }}
        .post-image-preview {{
            display: flex;
            flex-direction: column;
            gap: 8px;
            align-items: center;
        }}
        .thumb-img {{
            width: 180px;
            height: 180px;
            object-fit: cover;
            border-radius: 12px;
            border: 1px solid var(--gold-border);
            cursor: pointer;
            transition: transform 0.2s ease;
        }}
        .thumb-img:hover {{ transform: scale(1.02); }}
        .btn-download-img {{
            font-size: 12px;
            color: var(--gold-light);
            text-decoration: none;
            padding: 4px 8px;
            border-radius: 6px;
            background: rgba(255,255,255,0.05);
            display: inline-block;
        }}

        /* Status & URL Bar */
        .channel-status-bar {{
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            align-items: center;
            background: rgba(0,0,0,0.3);
            border-radius: 12px;
            padding: 12px 16px;
            border: 1px solid rgba(255,255,255,0.06);
        }}
        .status-select-wrap, .post-url-wrap {{
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
            min-width: 260px;
        }}
        .status-select-wrap label, .post-url-wrap label {{
            font-size: 12px;
            color: var(--text-muted);
            white-space: nowrap;
        }}
        .status-dropdown {{
            background: var(--bg-surface);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 8px;
            color: #FFFFFF;
            padding: 8px 12px;
            font-size: 13px;
            font-family: inherit;
            flex: 1;
        }}
        .post-url-input {{
            background: var(--bg-surface);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 8px;
            color: #FFFFFF;
            padding: 8px 12px;
            font-size: 13px;
            font-family: 'JetBrains Mono', monospace;
            flex: 1;
        }}

        /* Toast notification */
        #toast {{
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #059669;
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 14px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.6);
            display: none;
            z-index: 10000;
        }}
    </style>
</head>
<body>
    <div class="container">
        <header class="factory-header">
            <span class="brand-badge">CHRISTIAN CULTURE · AUTOMATYZACJA YOUTUBE</span>
            <h1 class="factory-title">CC YouTube Post Factory · Panel Kampanii</h1>
            <p class="factory-desc">
                Pakiet gotowy. <b>Publikacja wymaga autoryzowanego zatwierdzenia w YouTube Studio.</b>
                Dla każdego kanału skopiuj dedykowaną treść, dołącz pobraną grafikę 1:1, wybierz termin lub publikuj od razu, a link do posta wklej do tabeli.
            </p>
            <div class="header-meta-row">
                <span class="meta-pill">ID: <strong>{html.escape(c.get("id", ""))}</strong></span>
                <span class="meta-pill">Aktywne kanały: <strong>{active_count}</strong></span>
                <span class="meta-pill">Grafika: <strong>{html.escape(image.name)} (1080×1080)</strong></span>
                <button type="button" class="btn-export-csv" onclick="exportUpdatedCSV()">💾 Eksportuj status_publikacji.csv</button>
            </div>
        </header>

        <main id="channelsContainer">
            {all_cards_str}
        </main>
    </div>

    <div id="toast">✅ Skopiowano do schowka!</div>

    <script>
        const STORAGE_KEY = 'cc_yt_factory_' + '{html.escape(campaign_id)}';

        function showToast(msg) {{
            const t = document.getElementById('toast');
            t.textContent = msg;
            t.style.display = 'block';
            setTimeout(() => {{ t.style.display = 'none'; }}, 2500);
        }}

        async function copyPostText(ident) {{
            const ta = document.getElementById('text_' + ident);
            if (!ta) return;
            try {{
                await navigator.clipboard.writeText(ta.value);
                const btn = document.querySelector(`[data-channel-id="${{ident}}"] .btn-copy`);
                if (btn) {{
                    btn.classList.add('copied');
                    btn.textContent = '✅ Skopiowano!';
                    setTimeout(() => {{
                        btn.classList.remove('copied');
                        btn.textContent = '📋 Kopiuj treść posta';
                    }}, 2000);
                }}
                showToast('✅ Skopiowano treść posta dla: ' + ident);
                const sel = document.getElementById('status_' + ident);
                if (sel && sel.value === 'DO ZATWIERDZENIA') {{
                    sel.value = 'SKOPIOWANO';
                    updateChannelStatus(ident);
                }}
            }} catch (err) {{
                ta.select();
                document.execCommand('copy');
                showToast('✅ Zaznaczono i skopiowano!');
            }}
        }}

        function updateChannelStatus(ident) {{
            const sel = document.getElementById('status_' + ident);
            const inp = document.getElementById('url_' + ident);
            if (!sel || !inp) return;
            const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{{}}');
            state[ident] = {{
                status: sel.value,
                url: inp.value.trim(),
                updatedAt: new Date().toISOString()
            }};
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }}

        function loadSavedState() {{
            const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{{}}');
            for (const [ident, val] of Object.entries(state)) {{
                const sel = document.getElementById('status_' + ident);
                const inp = document.getElementById('url_' + ident);
                if (sel && val.status) sel.value = val.status;
                if (inp && val.url) inp.value = val.url;
            }}
        }}

        function exportUpdatedCSV() {{
            const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{{}}');
            const cards = document.querySelectorAll('.channel-card');
            const lines = ['kanal,uchwyt,channel_id,konto_zarzadzajace,status,plik,grafika,znaki,url_posta,data,uwagi'];
            cards.forEach(card => {{
                const ident = card.getAttribute('data-channel-id');
                const name = card.querySelector('.channel-name')?.textContent || ident;
                const handle = card.querySelector('.channel-handle')?.textContent || '';
                const sel = document.getElementById('status_' + ident);
                const inp = document.getElementById('url_' + ident);
                const status = sel ? sel.value : 'DO ZATWIERDZENIA';
                const url = inp ? inp.value.trim() : '';
                const saved = state[ident] || {{}};
                const date = saved.updatedAt || new Date().toISOString().slice(0, 10);
                lines.push(`"${{name}}","${{handle}}","","","${{status}}","${{ident}}.txt","{html.escape(image.name)}","","${{url}}","${{date}}",""`);
            }});
            const blob = new Blob([lines.join('\\r\\n')], {{ type: 'text/csv;charset=utf-8;' }});
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'status_publikacji_zaktualizowany.csv';
            link.click();
            showToast('💾 Wyeksportowano zaktualizowany CSV!');
        }}

        document.addEventListener('DOMContentLoaded', loadSavedState);
    </script>
</body>
</html>
'''
    (out / 'PANEL_PUBLIKACJI.html').write_text(panel_html, encoding='utf-8')

    # Raport podsumowujący
    raport_text = (
        f"KAMPANIA: {c.get('id', '')}\n"
        f"DATA GENERACJI: {Path(image).stat().st_mtime}\n"
        f"LICZBA KANAŁÓW AKTYWNYCH: {active_count}\n"
        f"GRAFIKA: {image.name} ({image.stat().st_size} bajtów)\n"
        f"PANEL PUBLIKACJI: {out / 'PANEL_PUBLIKACJI.html'}\n"
        f"STATUS: GOTOWE DO RĘCZNEGO ZATWIERDZENIA W YOUTUBE STUDIO (ZERO-QA PASS)\n"
    )
    (out / 'RAPORT.txt').write_text(raport_text, encoding='utf-8')
    print(f"Wygenerowano {active_count} postów dla kampanii: {out}")

if __name__ == '__main__':
    main()
