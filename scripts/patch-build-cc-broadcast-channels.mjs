import fs from 'node:fs';

const p = 'C:/Users/czark/Desktop/@ICC/Misja CC/JOMA_SHARED_MEMORY/SKRZYNKA/narzedzia/build-cc-workflows.mjs';
let code = fs.readFileSync(p, 'utf8');

const targetWorkflowStart = 'function buildIndividualWorkflows() {\n  return [';

const broadcastChannelsWorkflow = `
    {
      workflowId: "cc077701-7777-4000-8000-000000000778",
      title: "CC 0B. Matryca Kanałów Nadawczych CC (37 Kanałów TV/Radio • 6 Filarów Dystrybucji • OBS 24/7)",
      laneLabel: "PASMO 0B • MATRYCA KANAŁÓW NADAWCZYCH CC (37 KANAŁÓW TV/RADIO • 6 FILARÓW DYSTRYBUCJI • ARCHITEKTURA OBS 24/7)",
      laneY: -650,
      graph: {
        nodes: [
          {
            id: "note-cc077701-0001-channels",
            kind: "note",
            at: { x: 240, y: -260 },
            size: { width: 520 },
            fields: {
              text: "OFICJALNA MATRYCA 37 KANAŁÓW NADAWCZYCH CC (data/cc-channels.json):\\n• #1: TV Christian Culture 24/7 (/master-live.html • /cctv24)\\n• #2: Zjednoczeni za Polskę (/zapolske-live.html)\\n• #3: TV Epafraz (/tv-epafraz-live.html)\\n• #4: Apokalipsa: Księga Nadziei (/apokalipsa-ksiega-nadziei-live.html)\\n• #5: Randki i Małżeństwo (/randki-malzenstwo-live.html)\\n• #6: Studium Pisma Świętego (/studium-live.html)\\n• #7: Totalny Atak — Walter Veith (/totalny-atak-live.html)\\n• #8: Chrześcijański Blok Filmowy (/kino-live.html)\\n• #9: Codzienne Uwielbienie (/spiewajmy-panu-live.html)\\n• #10: Świadectwa — Historie Wiary (/swiadectwa-live.html)\\n• #11: Muzyka instrumentalna i Nocne Czuwanie (/nocne-czuwanie-live.html)\\n• #12: Biblia Śpiewana (/biblia-spiewana-live.html)\\n• #13: Instrumental Worship Music CC (/cctv24-worship.html • ZAMROŻONY)\\n• #14: Radio Biblia Audio po polsku (/stream-scene.html • OBS)\\n• #15: Good to Have You Global (/cctv24-global.html)\\n• #16: Bible Audio Global (/bibleaudio-global.html)\\n• #17: Biblijny Czas Modlitwy 24/7 (/BCM24)\\n• #18–37: 20 Portali Tematycznych CCN (News, Nauka, Historia, Biologia, Prawo, Małżeństwo...)",
              tone: "yellow",
              authorName: "Reżyseria Emisji i Kanałów TV",
              size: "sm",
              bold: false,
              author: true,
            },
          },
          {
            id: "note-cc077701-0002-pillars",
            kind: "note",
            at: { x: 780, y: -260 },
            size: { width: 500 },
            fields: {
              text: "6 STRATEGICZNYCH FILARÓW CC GLOBAL DISTRIBUTION:\\n1. Radio i Katalogi Globalne: TuneIn, Radio Garden, myTuner, radio.net, Online Radio Box, Streema, Radio Browser\\n2. Podcasty i Audio RSS 2.0: Apple Podcasts Connect, Amazon Music, Spotify, Pocket Casts, Overcast, Castbox, iHeartRadio\\n3. Wideo, Shorts i Społeczność: 7 kanałów YouTube (4K 16:9 + Shorts 9:16 + Posty 1:1), Instagram Reels, TikTok, Dailymotion\\n4. Odkrywanie Wizualne & Eksperckie: Pinterest (2:3, 1000x1500 px), LinkedIn, Substack (PL/EN/DE)\\n5. Społeczności i Komunikacja: Grupy Facebook (Polonia DE/UK/USA), Telegram (@ChristianCultureGlobal), WhatsApp FIFO (CC 6)\\n6. Ekspansja Językowa i SEO: 1. EN, 2. DE, 3. ES, 4. PT, 5. FR (+ PL, UK, HE) z tagami hreflang bez geo-blokad",
              tone: "blue",
              authorName: "CC GLOBAL DISTRIBUTION",
              size: "sm",
              bold: false,
              author: true,
            },
          },
          {
            id: "note-cc077701-0003-obs-sentinel",
            kind: "note",
            at: { x: 1300, y: -260 },
            size: { width: 440 },
            fields: {
              text: "PANCERNA OCHRONA KANAŁÓW PRODUKCYJNYCH:\\n• BEZWZGLĘDNY ZAKAZ DOTYKANIA: cctv24-worship.html, cctv24-worship-live.html, stream-scene.html (zamrożone w stanie produkcyjnym)\\n• Działające pliki są WYŁĄCZNIE szablonalne (READ-ONLY)\\n• Modyfikacje wolno wykonywać wyłącznie w plikach dedykowanych dla danego zlecenia\\n• Kontrola Strażnika Kodu (test:guardian) przed każdym commitem",
              tone: "green",
              authorName: "Joma Guard Sentinel",
              size: "sm",
              bold: false,
              author: true,
            },
          },
          {
            id: "trigger-cc077701-0001-4000-8000-000000000001",
            kind: "trigger",
            at: { x: 240, y: 40 },
            size: { width: 352 },
            fields: {
              trigger: "schedule",
              timezone: "Europe/Warsaw",
              scheduleJson: JSON.stringify({ kind: "daily", time: "05:15" }),
            },
            schedule: { kind: "daily", time: "05:15" },
          },
          {
            id: "agent-cc077701-0002-4000-8000-000000000002",
            kind: "agent",
            at: { x: 680, y: 40 },
            fields: {
              agentId: NOEMI_AGENT_ID,
              model: MODEL,
              provider: PROVIDER,
              task: "Faza 1 (Router Emisji Kanałów CC): 1) Odczytaj aktualny katalog kanałów nadawczych z data/cc-channels.json (37 kanałów). 2) Sprawdź harmonogram ramówki dnia (js/cc-ramowka.js) oraz dostępność strumieni Icecast/Zeno.fm. 3) Skieruj potok do 3 równoległych sekcji nadawczych: Sekcja A (Stacje Radiowe 24/7 & Globalne Katalogi), Sekcja B (Kanały Telewizyjne LIVE & Scena OBS), Sekcja C (Dystrybucja Cyfrowa: YouTube Premieres, Podcasty RSS, Social Media & Pinterest). Zwróć STATUS: CHANNELS_ROUTED_OK.",
            },
          },
          {
            id: "agent-cc077701-0003-4000-8000-000000000003",
            kind: "agent",
            at: { x: 1120, y: -180 },
            fields: {
              agentId: PUBLIKATOR_AGENT_ID,
              model: MODEL,
              provider: PROVIDER,
              task: "Faza 2A (Strumienie Audio & Globalne Katalogi Radia — Kolegium 07): 1) Nadzór nad 6 strumieniami radiowymi (Polskie Radio CC, Biblia Audio, Biblia Śpiewana, Nocne Czuwanie, Global EN). 2) Weryfikacja obecności w katalogach: TuneIn, Radio Garden, myTuner, radio.net, Online Radio Box, Streema, Radio Browser. 3) Zapewnienie metadanych ICY/RDS (tytuł utworu, autor, werset). Zwróć STATUS: RADIO_STREAMS_OK.",
            },
          },
          {
            id: "agent-cc077701-0004-4000-8000-000000000004",
            kind: "agent",
            at: { x: 1120, y: 40 },
            fields: {
              agentId: ORCHESTRATOR_AGENT_ID,
              model: MODEL,
              provider: PROVIDER,
              task: "Faza 2B (Kanały TV LIVE & Scena OBS — Kolegium 08): 1) Emisja 37 kanałów telewizyjnych (Kanał #1 master-live.html, #2 zapolske-live.html, #4 apokalipsa, #12 biblia-spiewana-live.html). 2) Nadzór nad komputerem nadawczym OBS i sceną stream-scene.html (zamrożone pliki w trybie READ-ONLY). 3) Przełączanie źródeł wideo HLS/YouTube bez czarnego ekranu. Zwróć STATUS: TV_CHANNELS_OK.",
            },
          },
          {
            id: "agent-cc077701-0005-4000-8000-000000000005",
            kind: "agent",
            at: { x: 1120, y: 260 },
            fields: {
              agentId: PUBLIKATOR_AGENT_ID,
              model: MODEL,
              provider: PROVIDER,
              task: "Faza 2C (Dystrybucja Multimedialna & Social Syndication — Kolegium 10 & 18): 1) Feedy RSS 2.0 podcastów (Apple Podcasts, Amazon Music, Spotify). 2) Harmonogram 7 kanałów YouTube (premiera 20:00 Apokalipsa SDS, posty społeczności 12:30, Shorts 9:16). 3) Pinterest Piny 2:3 (1000x1500 px), Substack, LinkedIn, rotacja grup Facebook DE/UK/USA i Telegram. Zwróć STATUS: DIGITAL_DISTRIBUTION_OK.",
            },
          },
          {
            id: "agent-cc077701-0006-4000-8000-000000000006",
            kind: "agent",
            at: { x: 1600, y: 40 },
            fields: {
              agentId: SMCC_AGENT_ID,
              model: MODEL,
              provider: PROVIDER,
              task: "Faza 3 (Audyt Emisji & Strażnik Kanałów Live @SMCC): 1) Weryfikacja integralności zamrożonych plików (cctv24-worship.html, stream-scene.html — 0 niedozwolonych zmian). 2) Sprawdzenie kodów odpowiedzi HTTP (200 OK) dla wszystkich 37 kanałów. 3) Test filtrów ga4 internal traffic na podstronach nadawczych. Zwróć STATUS: BROADCAST_AUDIT_PASS.",
            },
          },
          {
            id: "condition-cc077701-0007-4000-8000-000000000007",
            kind: "condition",
            at: { x: 2040, y: 40 },
            fields: {
              model: MODEL,
              provider: PROVIDER,
              effort: "low",
              rule: "Wybierz ścieżkę TAK, gdy wszystkie 3 sekcje emisji oraz audyt Strażnika zwróciły PASS (brak zakłóceń w emisji). Wybierz NIE, gdy którykolwiek kanał wymaga interwencji technicznej.",
            },
          },
          {
            id: "agent-cc077701-0008-4000-8000-000000000008",
            kind: "agent",
            at: { x: 2480, y: 40 },
            fields: {
              agentId: RUT_AGENT_ID,
              model: MODEL,
              provider: PROVIDER,
              task: "Faza 4 (Weryfikacja LIVE_VERIFIED & Raportowanie do Dowódcy): 1) Sprawdzenie pętli verify-live dla kanałów nadawczych. 2) Aktualizacja stanu nadawania w Kalendarzu Misji (@ccMC). 3) Odnotowanie bezawaryjnej pracy kanałów w JOMA_HANDOFFS.md i wieczornym bilansie Asystentki Rut. Zwróć STATUS: LIVE_BROADCAST_VERIFIED.",
            },
          },
          {
            id: "output-cc077701-0009-4000-8000-000000000009",
            kind: "output",
            at: { x: 2920, y: 40 },
            size: { width: 440 },
            fields: {
              target: "notify",
              title: "KANAŁY NADAWCZE CC: Pełna Emisja 24/7 Aktywna i Zweryfikowana (LIVE_VERIFIED)",
            },
          },
          {
            id: "output-cc077701-0010-4000-8000-000000000010",
            kind: "output",
            at: { x: 2480, y: 220 },
            fields: {
              target: "notify",
              title: "KANAŁY NADAWCZE CC: Wymagana Interwencja Techniczna (Alarm Emisji)",
            },
          },
        ],
        edges: [
          makeEdge("trigger-cc077701-0001-4000-8000-000000000001", "agent-cc077701-0002-4000-8000-000000000002"),
          makeEdge("agent-cc077701-0002-4000-8000-000000000002", "agent-cc077701-0003-4000-8000-000000000003"),
          makeEdge("agent-cc077701-0002-4000-8000-000000000002", "agent-cc077701-0004-4000-8000-000000000004"),
          makeEdge("agent-cc077701-0002-4000-8000-000000000002", "agent-cc077701-0005-4000-8000-000000000005"),
          makeEdge("agent-cc077701-0003-4000-8000-000000000003", "agent-cc077701-0006-4000-8000-000000000006"),
          makeEdge("agent-cc077701-0004-4000-8000-000000000004", "agent-cc077701-0006-4000-8000-000000000006"),
          makeEdge("agent-cc077701-0005-4000-8000-000000000005", "agent-cc077701-0006-4000-8000-000000000006"),
          makeEdge("agent-cc077701-0006-4000-8000-000000000006", "condition-cc077701-0007-4000-8000-000000000007"),
          makeEdge("condition-cc077701-0007-4000-8000-000000000007", "agent-cc077701-0008-4000-8000-000000000008", "yes"),
          makeEdge("condition-cc077701-0007-4000-8000-000000000007", "output-cc077701-0010-4000-8000-000000000010", "no"),
          makeEdge("agent-cc077701-0008-4000-8000-000000000008", "output-cc077701-0009-4000-8000-000000000009"),
        ],
        strokes: [],
      },
      triggerMeta: {
        nodeId: "trigger-cc077701-0001-4000-8000-000000000001",
        kind: "schedule",
        timezone: "Europe/Warsaw",
        scheduleJson: JSON.stringify({ kind: "daily", time: "05:15" }),
        nextDueAt: "2026-11-14T04:15:00.000Z",
      },
    },`;

if (!code.includes('cc077701-7777-4000-8000-000000000778')) {
  code = code.replace(targetWorkflowStart, targetWorkflowStart + broadcastChannelsWorkflow);
  console.log('CC 0B Broadcast Channels Workflow added to build-cc-workflows.mjs');
}

fs.writeFileSync(p, code, 'utf8');
console.log('build-cc-workflows.mjs updated with broadcast channels matrix');
