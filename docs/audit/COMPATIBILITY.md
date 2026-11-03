# Kompatybilność Wersji i Zależności — CC Broadcast Automation
**Data audytu:** 2026-11-03 09:50 CET  
**Wersja specyfikacji:** 1.0  

---

## 1. Macierz Zgodności Komponentów

| Komponent | Wersja zainstalowana | Wymóg specyfikacji | Status | Uwagi |
|---|---|---|---|---|
| **OBS Studio** | 33.0.0 (64-bit) | OBS >= 28.0 (dla v5) | **ZGODNY** | Wersja produkcyjna 33.0.0 w pełni wspiera obs-websocket v5. |
| **obs-websocket** | v5 (wbudowany) | Protokół WebSocket v5 | **ZGODNY** | Port 4455, obsługa RPC v1, uwierzytelnianie SHA-256 aktywne. |
| **obs-multi-rtmp** | 0.7.4.5 | Multi-destination relay | **ZGODNY** | Zero narzutu CPU/GPU przy współdzielonym enkoderze (`adv_stream`). |
| **aitum-multistream**| 1.0.x (Stream Suite) | Multi-destination / canvas | **ZGODNY** | Biblioteka DLL i dane zainstalowane w Program Files, config w AppData. |
| **Python** | 3.10+ na stacji gównej | Python 3.11+ rekomendowany | **ZGODNY** | Dostępny do skryptów pomocniczych i testów kontrolera. |
| **PowerShell** | 5.1 (Windows Desktop) | Wersja systemowa Windows | **ZGODNY** | Wymagane używanie `-ExecutionPolicy Bypass` w zadaniach zdalnych. |
| **Hardware Enkoder**| QuickSync (Intel) / NVENC | Wsparcie enkoderów sprzętowych | **ZGODNY** | CPU i7-3610QM obciążony zaledwie w 7–12% przy emisji 1080p30. |

---

## 2. Porty Sieciowe i Protokoły

- `127.0.0.1:4455` (TCP) — Port sterowania lokalnego obs-websocket v5 (zabroniona ekspozycja do publicznego Internetu).
- `192.168.50.174:22` (TCP) — Port SSH węzła nadawczego (zarządzanie administracyjne po kluczach RSA/Ed25519).
- `rtmps://a.rtmps.youtube.com:443/live2` — Wychodzący strumień RTMPS (szyfrowany TLS).
- `rtmp://a.rtmp.youtube.com/live2:1935` — Wychodzący strumień RTMP dla dodatkowych celów multi-stream.
