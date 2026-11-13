import fs from 'node:fs';

const p = 'C:/Users/czark/Desktop/@ICC/Misja CC/JOMA_SHARED_MEMORY/SKRZYNKA/narzedzia/build-cc-workflows.mjs';
let code = fs.readFileSync(p, 'utf8');

// 1. Zdefiniujmy nowe stałe agentów na początku pliku
const targetAgentConst = 'const PUBLIKATOR_AGENT_ID = "agent-pub10000-7777-4000-8000-000000000005";';
const newAgentConsts = `
const NOEMI_AGENT_ID = "agent-00770077-7777-4000-8000-000000000077";
const A150_AGENT_ID = "agent-a1500150-7777-4000-8000-000000000150";
const A520_AGENT_ID = "agent-a5200520-7777-4000-8000-000000000520";
const SMCC_AGENT_ID = "agent-smcc0008-7777-4000-8000-000000000008";
const RUT_AGENT_ID = "agent-rut00014-7777-4000-8000-000000000014";`;

if (!code.includes('NOEMI_AGENT_ID')) {
  code = code.replace(targetAgentConst, targetAgentConst + newAgentConsts);
  console.log('Agent consts added to build-cc-workflows.mjs');
}

// 2. Dodajmy obiekt CC 0 do buildIndividualWorkflows
const targetWorkflowStart = 'function buildIndividualWorkflows() {\n  return [';

const cc0Workflow = `
    {
      workflowId: "cc077700-7777-4000-8000-000000000777",
      title: "CC 0. Architektura i Przepływ Pracy Wszystkich Agentów Federacji @777 (L0–L5 • 21 Kolegiów × 37 = 777)",
      laneLabel: "PASMO 0 • ARCHITEKTURA I PRZEPŁYW PRACY WSZYSTKICH AGENTÓW FEDERACJI @777 (L0–L5 • 21 KOLEGIÓW × 37 RÓL = 777 • BRAMKI T0–T4)",
      laneY: -1250,
      graph: {
        nodes: [
          {
            id: "note-cc077700-0001-hierarchy",
            kind: "note",
            at: { x: 240, y: -260 },
            size: { width: 440 },
            fields: {
              text: "WARSTWY ORKIESTRACJI @777 (CC_STRATEGIA_777_AGENTOW_2030.md):\\n• L0: Dowódca Nazir (Cezary Rogowski) — Wizja, autoryzacja T4 i Konstytucja\\n• L1: Rada JOMA & Router Tokenów (@077 Noemi, @A001 Antigravity)\\n• L2: 21 Dyrektorów Kolegiów Domenowych\\n• L3: 126 Liderów Kompetencji\\n• L4: 504 Specjalistów Wykonawczych (Claude, Codex, Publikator CC, Joshua, DAW, Wektor1)\\n• L5: 84 Audytorów Jakości (@150 K1–K12 UBG, @A520 Obraz, @SMCC Zero-QA, Kuratorzy @Joma/@m/@w)",
              tone: "yellow",
              authorName: "Rada JOMA & Orkiestrator L1",
              size: "sm",
              bold: false,
              author: true,
            },
          },
          {
            id: "note-cc077700-0002-colleges",
            kind: "note",
            at: { x: 700, y: -260 },
            size: { width: 500 },
            fields: {
              text: "21 KOLEGIÓW DOMENOWYCH (21 × 37 RÓL = 777):\\n01 Teologia & Prawda • 02 Przekład Biblii UBG • 03 Ewangelizacja • 04 Akademia & Kurs Codzienny • 05 Redakcja CCN News • 06 SEO/AEO/GEO • 07 Radio CC 24/7 • 08 Wideo/TV/Apokalipsa SDS • 09 Muzyka & Biblia Śpiewana • 10 Podcasty & Audiobooki • 11 UX/UI/Design Taste • 12 Frontend/Backend WWW • 13 AI/Orkiestracja/OpenBot • 14 Cyberbezpieczeństwo • 15 Portal LUMINA • 16 LUMI KIDS • 17 Tłumaczenia Globalne EN/DE/ES/PT/FR • 18 Marketing/Social Media • 19 Partnerstwa Misyjne • 20 Prawo & Prawa Autorskie • 21 Finanse/Analityka GA4/GSC",
              tone: "blue",
              authorName: "Federacja @777",
              size: "sm",
              bold: false,
              author: true,
            },
          },
          {
            id: "note-cc077700-0003-gates",
            kind: "note",
            at: { x: 1220, y: -260 },
            size: { width: 440 },
            fields: {
              text: "BRAMKI RYZYKA I DECYZJI T0–T4:\\n• T0: Odczyt, research i audit (dowolny wolny model)\\n• T1: Zmiany w izolowanej gałęzi/scratch\\n• T2: Bateria testów CI Zero-QA (test:guardian, test:regression, K1–K12)\\n• T3: Rutynowe publikacje z bufora z zatwierdzoną potrójną weryfikacją L5\\n• T4: WYMAGANA OSOBISTA ZGODA CEZAREGO ROGOWSKIEGO (produkcja, doktryna, dane osobowe, LUMI KIDS, budżety)",
              tone: "green",
              authorName: "Strażnik Standardów L5",
              size: "sm",
              bold: false,
              author: true,
            },
          },
          {
            id: "trigger-cc077700-0001-4000-8000-000000000001",
            kind: "trigger",
            at: { x: 240, y: 40 },
            size: { width: 352 },
            fields: {
              trigger: "schedule",
              timezone: "Europe/Warsaw",
              scheduleJson: JSON.stringify({ kind: "daily", time: "05:00" }),
            },
            schedule: { kind: "daily", time: "05:00" },
          },
          {
            id: "agent-cc077700-0002-4000-8000-000000000002",
            kind: "agent",
            at: { x: 680, y: 40 },
            fields: {
              agentId: NOEMI_AGENT_ID,
              model: MODEL,
              provider: PROVIDER,
              task: "Etap 1-2 (L1 Rada JOMA & Router Tokenów @077 Noemi): 1) Odczytaj zadanie ze Skrzynki Misji (TABLICA.md), rozkazu Dowódcy L0 lub harmonogramu rutyn CC. 2) Wykonaj routing dostępności tokenów (route-tokens: OpenCode/OpenRouter fallback sesje). 3) Przypisz klasyfikację ryzyka T0-T4. 4) Skieruj zadanie do właściwego z 21 Kolegiów Domenowych (L2/L3) z podziałem: Inżynieria/WWW/LUMINA/Kursy (Etap 3A) lub Media/Audio DAW/Wideo 4K/Dystrybucja (Etap 3B). Zwróć STATUS: OK | ROUTED_COLLEGE: [01-21].",
            },
          },
          {
            id: "agent-cc077700-0003-4000-8000-000000000003",
            kind: "agent",
            at: { x: 1120, y: -140 },
            fields: {
              agentId: ORCHESTRATOR_AGENT_ID,
              model: MODEL,
              provider: PROVIDER,
              task: "Etap 3A (L4 Wykonawcy Inżynieryjni — Antigravity / Claude Code / Codex): Realizacja zadań w izolacji dla Kolegiów 01-06, 11-16 (strony polskieradio.cc, portal LUMINA, interlinearna MojaBiblia, lekcje Akademii i Kursu Codziennego, rozważania DZJ, moduł analityki CC MISSION INTELLIGENCE). Zwróć STATUS: KOD_GOTOWY.",
            },
          },
          {
            id: "agent-cc077700-0004-4000-8000-000000000004",
            kind: "agent",
            at: { x: 1120, y: 220 },
            fields: {
              agentId: PUBLIKATOR_AGENT_ID,
              model: MODEL,
              provider: PROVIDER,
              task: "Etap 3B (L4 Wykonawcy Mediów i Dystrybucji — CC Studio DAW / Wektor1 / Joshua / Publikator CC): Realizacja dla Kolegiów 07-10, 17-21 (produkcja słuchowisk Biblia Audio -16 LUFS, montaż wideo 4K Apokalipsa SDS, generowanie shorts 9:16, feedy RSS 2.0, zgłoszenia do katalogów radiowych TuneIn/Radio Garden i pakiety CC GLOBAL DISTRIBUTION). Zwróć STATUS: MEDIA_GOTOWE.",
            },
          },
          {
            id: "agent-cc077700-0005-4000-8000-000000000005",
            kind: "agent",
            at: { x: 1560, y: -140 },
            fields: {
              agentId: A150_AGENT_ID,
              model: MODEL,
              provider: PROVIDER,
              task: "Etap 4A (L5 Audyt Doktrynalny @150): Niezależna weryfikacja w 12 krokach K1-K12 (CC_PROTOKOL_WERYFIKACJI_BIBLIJNEJ.md). Sprawdź dosłowność cytatów UBG, kontekst rozdziału, zgodność z 28 Zasadami Wiary i brak czerwonych flag. Zwróć STATUS: DOCTRINE_PASS lub STATUS: DOCTRINE_FAIL.",
            },
          },
          {
            id: "agent-cc077700-0006-4000-8000-000000000006",
            kind: "agent",
            at: { x: 1560, y: 220 },
            fields: {
              agentId: A520_AGENT_ID,
              model: MODEL,
              provider: PROVIDER,
              task: "Etap 4B (L5 Audyt Wizualny @A520): Bramka IMAGE_CONTENT_MATCH = PASS (pełna zgodność znaczeniowa grafiki z treścią), PUBLISHER_VISUAL_APPROVAL = PASS (weryfikacja formatów 16:9, 9:16, 1:1, 2:3 Pinterest) oraz audyt Visual Guardian (brak tandety AI / anti-slop). Zwróć STATUS: VISUAL_PASS.",
            },
          },
          {
            id: "agent-cc077700-0007-4000-8000-000000000007",
            kind: "agent",
            at: { x: 2000, y: 40 },
            fields: {
              agentId: SMCC_AGENT_ID,
              model: MODEL,
              provider: PROVIDER,
              task: "Etap 4C (L5 Strażnik Misji & Zero-QA @SMCC): Uruchomienie baterii testów: test:guardian (0 naruszeń), test:mobile-premium (100% pass), test:cc-regression, weryfikacja dotyku min 44px, pomarańczowego przycisku CTA #FF7A00 i ochrona zamrożonych kanałów live. Zwróć STATUS: ZERO_QA_PASS.",
            },
          },
          {
            id: "condition-cc077700-0008-4000-8000-000000000008",
            kind: "condition",
            at: { x: 2440, y: 40 },
            fields: {
              model: MODEL,
              provider: PROVIDER,
              effort: "low",
              rule: "Wybierz ścieżkę TAK, gdy zadanie zostało sklasyfikowane jako T4 (wymaga osobistej zgody Cezarego Rogowskiego dla produkcji, wrażliwej doktryny, danych osobowych lub dzieci). Wybierz NIE dla automatycznych zadań T0-T3 posiadających potrójny PASS z L5.",
            },
          },
          {
            id: "approval-cc077700-0009-4000-8000-000000000009",
            kind: "approval",
            at: { x: 2880, y: -100 },
            fields: {
              question: "Bramka L0 (Cezary Rogowski / Dowódca Nazir): Czy zatwierdzasz wdrożenie zadania produkcyjnego poziomu T4 dla Federacji @777?",
            },
          },
          {
            id: "agent-cc077700-0010-4000-8000-000000000010",
            kind: "agent",
            at: { x: 3320, y: 40 },
            fields: {
              agentId: RUT_AGENT_ID,
              model: MODEL,
              provider: PROVIDER,
              task: "Etap 6-9 (Dystrybucja, Weryfikacja LIVE_VERIFIED & Raportowanie L0): 1) Wdrożenie CC GLOBAL DISTRIBUTION (podwójny git push origin/lumina-repo, aktualizacja RSS/feedów). 2) Weryfikacja pętli produkcyjnej (verify-live: status 200, HTTP headers, odtwarzacze). 3) Auto-indeksowanie wyszukiwarki @w (data/cc-search-index.json). 4) Zapis symboliczny na Żywej Mapie @m (data/ecosystem-map.json). 5) Wpis ze statusem done do JOMA_HANDOFFS.md i podsumowanie w bilansie wieczornym @ccMC. Zwróć STATUS: LIVE_VERIFIED_OK.",
            },
          },
          {
            id: "output-cc077700-0011-4000-8000-000000000011",
            kind: "output",
            at: { x: 3760, y: 40 },
            size: { width: 440 },
            fields: {
              target: "notify",
              title: "FEDERACJA @777: Zadanie Zrealizowane i Zweryfikowane (LIVE_VERIFIED)",
            },
          },
        ],
        edges: [
          makeEdge("trigger-cc077700-0001-4000-8000-000000000001", "agent-cc077700-0002-4000-8000-000000000002"),
          makeEdge("agent-cc077700-0002-4000-8000-000000000002", "agent-cc077700-0003-4000-8000-000000000003"),
          makeEdge("agent-cc077700-0002-4000-8000-000000000002", "agent-cc077700-0004-4000-8000-000000000004"),
          makeEdge("agent-cc077700-0003-4000-8000-000000000003", "agent-cc077700-0005-4000-8000-000000000005"),
          makeEdge("agent-cc077700-0004-4000-8000-000000000004", "agent-cc077700-0006-4000-8000-000000000006"),
          makeEdge("agent-cc077700-0005-4000-8000-000000000005", "agent-cc077700-0007-4000-8000-000000000007"),
          makeEdge("agent-cc077700-0006-4000-8000-000000000006", "agent-cc077700-0007-4000-8000-000000000007"),
          makeEdge("agent-cc077700-0007-4000-8000-000000000007", "condition-cc077700-0008-4000-8000-000000000008"),
          makeEdge("condition-cc077700-0008-4000-8000-000000000008", "approval-cc077700-0009-4000-8000-000000000009", "yes"),
          makeEdge("condition-cc077700-0008-4000-8000-000000000008", "agent-cc077700-0010-4000-8000-000000000010", "no"),
          makeEdge("approval-cc077700-0009-4000-8000-000000000009", "agent-cc077700-0010-4000-8000-000000000010"),
          makeEdge("agent-cc077700-0010-4000-8000-000000000010", "output-cc077700-0011-4000-8000-000000000011"),
        ],
        strokes: [],
      },
      triggerMeta: {
        nodeId: "trigger-cc077700-0001-4000-8000-000000000001",
        kind: "schedule",
        timezone: "Europe/Warsaw",
        scheduleJson: JSON.stringify({ kind: "daily", time: "05:00" }),
        nextDueAt: "2026-11-14T04:00:00.000Z",
      },
    },`;

if (!code.includes('cc077700-7777-4000-8000-000000000777')) {
  code = code.replace(targetWorkflowStart, targetWorkflowStart + cc0Workflow);
  console.log('CC 0 Workflow added to buildIndividualWorkflows');
}

fs.writeFileSync(p, code, 'utf8');
console.log('build-cc-workflows.mjs patched successfully');
