# Inwentaryzacja Środowiska Emisyjnego — CC Broadcast Mission Control
**Data inwentaryzacji:** 2026-11-03 09:50 CET  
**Audytor:** Antigravity (Pair Programming Agent)  
**Status:** ZATWIERDZONY (Audit GATE-A)  

---

## 1. Topologia Węzłów Fizycznych

### Węzeł 01: Laptop Nadawczy (`cc-nadajnik` / `DESKTOP-FLS3JVI`)
- **Rola:** Dedykowany enkoder emisyjny (Playout Node 01)
- **Procesor:** Intel(R) Core(TM) i7-3610QM CPU @ 2.30GHz (4 rdzenie / 8 wątków)
- **Pamięć RAM:** 8.0 GB (zajętość ~3.9 GB, wolne ~4.1 GB)
- **Karty graficzne:**
  - Intel(R) HD Graphics 4000 (QuickSync `qsv`)
  - NVIDIA GeForce GTX 660M
- **Dysk:** 645.1 GB wolnego miejsca na partycji systemowej
- **Sieć:**
  - Wi-Fi: Intel(R) Centrino(R) Wireless-N 2200 (Stan: `Connected`, link 144 Mbps)
  - Ethernet: Gigabit Adapter (Stan: `Disconnected` — wymaga fizycznego podpięcia linku)
- **System operacyjny:** Windows 10 Home/Pro 64-bit (build 19045, 22H2)
- **Uprawnienia zasilania:** `powercfg` AC/DC standby = 0, hibernate = 0, lid-close = 0 (blokada uśpienia aktywowana).

### Węzeł 02: Stacja Operatorska / Główna (`DESKTOP-G7J...`)
- **Rola:** Mission Control / Controller / Development / Repo master
- **System:** Windows 10/11 64-bit
- **Środowisko:** PowerShell, Node.js, Python, Git, dostęp SSH do `cc-nadajnik` (alias w OpenSSH).

---

## 2. Inwentaryzacja OBS Studio (Węzeł Nadawczy)

- **Wersja OBS:** OBS Studio 33.0.0 (64-bit)
- **Lokalizacja binariów:** `C:\Program Files\obs-studio\bin\64bit\obs64.exe`
- **Profil aktywny:** `Bez_tytułu` (katalog `%APPDATA%\obs-studio\basic\profiles\Bez_tytułu`)
- **Kolekcja scen aktywna:** `Bez_tytułu`
- **Scena na antenie:** `CHRISTIAN CULTURE TV24`
- **Źródło główne:** Przeglądarka (Browser Source) -> `https://www.polskieradio.cc/master-live`
- **Rozdzielczość / Klatkarz bazowy:** 1920x1080 @ 30.0 FPS
- **Zainstalowane wtyczki (Audytowane):**
  - `obs-websocket` v5: wbudowany, port 4455, autoryzacja SHA-256 aktywna.
  - `obs-multi-rtmp` v0.7.4.5: `C:\Program Files\obs-studio\obs-plugins\64bit\obs-multi-rtmp.dll`.
  - `aitum-multistream`: `C:\Program Files\obs-studio\obs-plugins\64bit\aitum-multistream.dll`.

---

## 3. Zmapowane Profile Tematyczne (Gotowe w OBS)

1. `Bez_tytułu` — Emisja główna Master Live (`https://www.polskieradio.cc/master-live`)
2. `CC_Women_BCM24` — Kanał dla kobiet (`https://www.polskieradio.cc/BCM24`)
3. `CC_Muzyka_Uwielbienia` — Pasmo muzyczne (`https://www.polskieradio.cc/spiewajmy-panu-live.html?mix=1`)
4. `Biblia_Spiewana_24` — Pismo Święte śpiewane (`https://www.polskieradio.cc/biblia-spiewana-live`)
5. `Osobowosc_Plus_24` — Osobowość Plus (`...playlist=PLQBdxcl9HBc8jNIM45udIp2N6ucvK75rW&brand=osobowoscplus`)
6. `Polskie_Radio_CC_24` — Scena radiowa radia live (`https://www.polskieradio.cc/stream-scene.html`)

---

## 4. Rejestr 25 Podpisanych Kanałów Dystrybucji

Klucze zostały bezpiecznie przeniesione z lokalnej konfiguracji Aitum do konfiguracji profilu na laptopie. Wszystkie sekrety podlegają maskowaniu w logach i audytach.

| Lp. | Identyfikator Kanału | Typ serwisu | Priorytet emisji |
|---|---|---|---|
| 1 | `O+` (Osobowość Plus) | YouTube RTMP | **GWARANTOWANY (P0 - Main stream)** |
| 2 | `CC TV` (Christian Culture TV) | YouTube RTMP | **GWARANTOWANY (P0 - Multi-target)** |
| 3 | `Polskie Radio CC` | YouTube RTMP | **GWARANTOWANY (P0 - Multi-target)** |
| 4 | `Robert dla Jezusa` | YouTube RTMP | **GWARANTOWANY (P0 - Multi-target)** |
| 5 | `Katarzyna Fedków` | YouTube RTMP | **GWARANTOWANY (P0 - Multi-target)** |
| 6 | `CC WOMEN` | YouTube RTMP | Wysoki (P1 - Thematic) |
| 7 | `CC Worship` | YouTube RTMP | Wysoki (P1 - Music) |
| 8 | `Top Seven` | YouTube RTMP | Średni (P2 - Music) |
| 9 | `Biblia Audio CC` | YouTube RTMP | Wysoki (P1 - Bible) |
| 10 | `RCC TV24` | YouTube RTMP | Średni (P2) |
| 11 | `Personality Plus` | YouTube RTMP | Średni (P2) |
| 12 | `CC MEN` | YouTube RTMP | Średni (P2) |
| 13 | `Instrumental CC` | YouTube RTMP | Średni (P2 - Music) |
| 14 | `CC Pop` | YouTube RTMP | Średni (P2 - Music) |
| 15 | `Werset Dnia` | YouTube RTMP | Standardowy (P3) |
| 16 | `Rogowski` | YouTube RTMP | Standardowy (P3) |
| 17 | `CC Prayer 24` | YouTube RTMP | Standardowy (P3) |
| 18 | `CC Bible Deep` | YouTube RTMP | Standardowy (P3) |
| 19 | `CC NETWORK` | YouTube RTMP | Standardowy (P3) |
| 20 | `Popraw Koronę` | YouTube RTMP | Standardowy (P3) |
| 21 | `CC Identity` | YouTube RTMP | Standardowy (P3) |
| 22 | `CC FILM` | YouTube RTMP | Standardowy (P3) |
| 23 | `Facebook CR` | Facebook RTMP | Społecznościowy (P2) |
| 24 | `FB Radio CC` | Facebook RTMP | Społecznościowy (P2) |
| 25 | `Twitch CC` | Twitch RTMP | Społecznościowy (P3) |
