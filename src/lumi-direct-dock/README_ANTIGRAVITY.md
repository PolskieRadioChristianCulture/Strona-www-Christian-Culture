# LUMI Direct Dock (Vue 3 + Vanilla Adapter Architecture)

Moduł **LUMI Direct Dock** zapewnia pływający dok czatów prywatnych 1:1 (chat heads + okno rozmowy) dla autoryzowanych członków portalu **LUMINA**.

## Struktura modułu
- `src/lumi-direct-dock/src/LumiDirectDock.vue` — natywny komponent Vue 3 (Strict TypeScript) zgodny w 100% ze standardem klas `.ldd-*` oraz tokenami Obsidian / Champagne Gold.
- `src/lumi-direct-dock/src/types.ts` — kontrakty `DirectMessagingAdapter`, `DockConversation`, `DockMessage`, `IncomingDM`.
- `src/lumi-direct-dock/src/index.ts` — eksport komponentu `LumiDirectDock` i typów TypeScript.
- `src/lumi-direct-dock/src/example-integration.ts` — pomocnik montujący `mountLumiDirectDock(target, adapter)` w Vue 3.
- `src/lumi-direct-dock/src/LumiDirectDock.test.ts` — testy jednostkowe Vitest (autoOpen=false, oznaczanie przeczytanych, zachowanie szkicu po błędzie, minimalizacja vs zamknięcie, czyszczenie subskrypcji).
- `components/lumi-direct-dock.js` i `components/lumi-direct-dock-adapter.js` — produkcyjny kontroler vanilla JS dla stron statycznych HTML.
- `css/lumi-direct-dock.css` — produkcyjny arkusz stylów.

## Gwarancje bezpieczeństwa P0
1. Brak automatycznego otwierania i kradzieży fokusu przy nowej wiadomości (`autoOpen: false` domyślnie w `lumi-direct-dock-prefs-v1`).
2. Rozróżnienie minimalizacji (`−` ukrywa okno, zachowuje skrót) od zamknięcia (`×` chowa skrót do następnej nowej wiadomości DM).
3. Zachowanie szkicu wiadomości przy błędzie sieci i blokada podwójnej wysyłki (`busy`).
4. Pełne czyszczenie subskrypcji `subscribeIncomingDM` i `subscribeConversation` przy odmontowaniu komponentu oraz wylogowaniu.
