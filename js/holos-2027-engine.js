/**
 * ══════════════════════════════════════════════════════════════════════════
 * HOLOS 2027 — Wyzwania Noworoczne, System Celów & Realna Synchronizacja Google
 * Plik: /js/holos-2027-engine.js
 *
 * - Grace-first motywacja: 14-dniowa mapa rytmu, Tarcza Szabatu (Sobota nie
 *   przerywa serii), kamienie milowe i mostek 1-klik do stopera 5·10·15.
 * - Realna synchronizacja chmurowa dla zweryfikowanych kont Google (non-anon)
 *   w istniejących regułach Firestore: /users/{uid}/personal_hub/holos_2027.
 * - 100% uczciwości: tryb gościa lub błąd sieci NIGDY nie deklaruje chmury.
 * - Bezpieczeństwo XSS: cały DOM budowany wyłącznie przez createElement +
 *   textContent (zero wstrzykiwania HTML z danych użytkownika).
 * ══════════════════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  if (window.Holos2027Engine) return;

  const STORAGE_KEY = 'holos_2027_state_v1';
  const FIRESTORE_PROJECT = 'lumina-cc';
  const PERSONAL_HUB_DOC = 'holos_2027';

  const SECTORS = {
    faith: { label: 'Wiara i Duchowość', icon: '🙏', color: '#FBBF24', border: 'rgba(251, 191, 36, 0.35)', bg: 'rgba(251, 191, 36, 0.12)' },
    family: { label: 'Relacje i Rodzina', icon: '❤️', color: '#F87171', border: 'rgba(248, 113, 113, 0.35)', bg: 'rgba(248, 113, 113, 0.12)' },
    body: { label: 'Zdrowie i Ciało', icon: '🏃', color: '#34D399', border: 'rgba(52, 211, 153, 0.35)', bg: 'rgba(52, 211, 153, 0.12)' },
    money: { label: 'Finanse i Szafarstwo', icon: '💰', color: '#00F2FE', border: 'rgba(0, 242, 254, 0.35)', bg: 'rgba(0, 242, 254, 0.12)' },
    work: { label: 'Praca i Talenty', icon: '🎯', color: '#818CF8', border: 'rgba(129, 140, 248, 0.35)', bg: 'rgba(129, 140, 248, 0.12)' }
  };

  // Zweryfikowane dosłowne wersety UBG-2025 (data/bible/ubg-2025/*.json)
  const UBG_VERSES_2027 = [
    {
      ref: 'Flp 3,13–14 (UBG)',
      text: 'Bracia, ja o sobie nie myślę, że już pochwyciłem. Lecz jedno czynię: zapominając o tym, co za mną, a zdążając do tego, co przede mną; Biegnę do mety, do nagrody powołania Bożego, które jest z góry w Chrystusie Jezusie.'
    },
    {
      ref: 'Prz 16,3 (UBG)',
      text: 'Powierz PANU swe dzieła, a twoje zamysły będą utwierdzone.'
    },
    {
      ref: 'Ps 90,12 (UBG)',
      text: 'Naucz nas liczyć nasze dni, abyśmy przywiedli serce do mądrości.'
    },
    {
      ref: 'Iz 40,31 (UBG)',
      text: 'Ale ci, którzy oczekują PANA, nabiorą nowych sił; wzbiją się na skrzydłach jak orły, będą biec, a się nie zmęczą, będą chodzić, a nie ustaną.'
    },
    {
      ref: 'Prz 16,9 (UBG)',
      text: 'Serce człowieka obmyśla swe drogi, ale PAN kieruje jego krokami.'
    },
    {
      ref: 'Kol 3,23 (UBG)',
      text: 'A wszystko, co czynicie, z serca czyńcie, jak dla Pana, a nie dla ludzi;'
    },
    {
      ref: 'Prz 3,5–6 (UBG)',
      text: 'Ufaj PANU z całego swego serca i nie polegaj na swoim rozumie. Zważaj na niego we wszystkich swoich drogach, a on będzie prostować twoje ścieżki.'
    }
  ];

  const CHALLENGE_PACKS_2027 = [
    {
      packId: 'bible-2027',
      title: 'Cała Biblia w 2027 (15 min/dzień)',
      description: 'Codzienny kwadrans z MojaBiblia Interlinearna lub Biblią Audio — karmienie ducha czystym Słowem.',
      sector: 'faith',
      frequency: 'daily',
      targetPerWeek: 6,
      minutes: 15,
      verseRef: 'Ps 90,12 (UBG)',
      milestones: ['Księga Rodzaju i Wyjścia', 'Psalmy i Księga Przysłów', 'Cztery Ewangelie', 'Listy Apostolskie i Apokalipsa']
    },
    {
      packId: 'morning-5-10',
      title: '365 Dni Porannego 5+10',
      description: '5 minut ciszy i modlitwy + 10 minut Pisma Świętego zanim sięgniesz po telefon i wiadomości.',
      sector: 'faith',
      frequency: 'daily',
      targetPerWeek: 6,
      minutes: 10,
      verseRef: 'Iz 40,31 (UBG)',
      milestones: ['Pierwsze 7 poranków bez ekranu', '21 dni stałego rytmu 5+10', '90 dni wiernego poranka']
    },
    {
      packId: 'covenant-relations',
      title: 'Relacje Przymierza — 1 gest dziennie',
      description: 'Rozmowa bez telefonu, dobre słowo, modlitwa za bliską osobę lub telefon wdzięczności.',
      sector: 'family',
      frequency: 'daily',
      targetPerWeek: 6,
      minutes: 5,
      verseRef: 'Kol 3,23 (UBG)',
      milestones: ['7 wieczorów bez ekranów z bliskimi', '4 głębokie rozmowy w miesiącu', '12 świadomych gestów wdzięczności']
    },
    {
      packId: 'temple-body',
      title: 'Świątynia Ciała — Ruch 3× w tygodniu',
      description: 'Spacer, ćwiczenia siłowe lub rozciąganie oraz sen przed 22:30 dla służby w pełni sił.',
      sector: 'body',
      frequency: 'weekly',
      targetPerWeek: 3,
      minutes: 30,
      verseRef: 'Iz 40,31 (UBG)',
      milestones: ['Pierwsze 4 tygodnie ruchu 3×', '14 dni snu przed 22:30', '50 sesji ruchu w 2027 roku']
    },
    {
      packId: 'wise-steward',
      title: 'Mądry Szafarz 10/20/70',
      description: 'Cotygodniowy spokojny przegląd budżetu, wierność w dziesięcinie i budowa poduszki finansowej.',
      sector: 'money',
      frequency: 'weekly',
      targetPerWeek: 1,
      minutes: 10,
      verseRef: 'Prz 16,3 (UBG)',
      milestones: ['Spisany plan budżetu na 2027', 'Pierwszy miesiąc poduszki bezpieczeństwa', '12 miesięcy wiernego szafarstwa']
    },
    {
      packId: 'sabbath-rest',
      title: 'Szabat Bez Ekranów (Sobota)',
      description: 'Święty odpoczynek od piątku zachodu do soboty zachodu: natura, wspólnota i cisza przed Bogiem.',
      sector: 'faith',
      frequency: 'weekly',
      targetPerWeek: 1,
      minutes: 15,
      verseRef: 'Prz 3,5–6 (UBG)',
      milestones: ['Pierwsza sobota w trybie spokoju', '4 kolejne Szabaty bez pośpiechu', 'Rodzinny rytuał powitania Szabatu']
    }
  ];

  let state = createDefaultState();
  let syncStatus = {
    mode: 'guest', // 'guest' | 'syncing' | 'synced' | 'error'
    verifiedCloud: false,
    uid: null,
    displayName: '',
    email: '',
    photoURL: '',
    lastSyncedAt: null,
    errorMessage: ''
  };
  let activeFirebaseUser = null;
  let saveTimer = null;
  let verseIndex = new Date().getDate() % UBG_VERSES_2027.length;
  let initialized = false;
  let promoMounted = false;

  function createDefaultState() {
    return {
      schemaVersion: 1,
      year: 2027,
      updatedAt: 0,
      motto: '',
      sabbathShield: true,
      wheel: { faith: 50, family: 50, body: 50, money: 50, work: 50, hasCalculated: false },
      stewardshipIncome: 6000,
      dailyIntention: { intention: '', notes: '', date: '' },
      goals: [],
      weeklyReviews: []
    };
  }

  function toDateKey(dateObj) {
    const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function getWeekKey(dateObj) {
    const d = new Date(dateObj.getTime());
    d.setHours(0, 0, 0, 0);
    const dayNum = d.getDay() || 7;
    d.setDate(d.getDate() + 4 - dayNum);
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }

  function uidShort(prefix) {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  }

  function showToast(msg, tone) {
    if (typeof window.holosToast === 'function') {
      window.holosToast(msg, tone || 'info');
    }
  }

  function normalizeGoal(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const title = String(raw.title || '').trim().slice(0, 120);
    if (!title) return null;
    const sector = SECTORS[raw.sector] ? raw.sector : 'faith';
    const frequency = raw.frequency === 'weekly' ? 'weekly' : 'daily';
    const targetPerWeek = Math.max(1, Math.min(7, Number(raw.targetPerWeek) || (frequency === 'daily' ? 6 : 3)));
    const minutes = [5, 10, 15, 30].includes(Number(raw.minutes)) ? Number(raw.minutes) : 10;
    const checkins = Array.from(new Set(
      (Array.isArray(raw.checkins) ? raw.checkins : [])
        .map(x => String(x || '').trim())
        .filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x))
    )).sort();
    const milestones = (Array.isArray(raw.milestones) ? raw.milestones : [])
      .map((m, idx) => {
        if (typeof m === 'string') {
          const text = m.trim().slice(0, 100);
          return text ? { id: `ms_${idx}_${text.length}`, text, done: false } : null;
        }
        if (m && typeof m === 'object' && String(m.text || '').trim()) {
          return {
            id: String(m.id || uidShort('ms')),
            text: String(m.text).trim().slice(0, 100),
            done: Boolean(m.done)
          };
        }
        return null;
      })
      .filter(Boolean)
      .slice(0, 12);

    return {
      id: String(raw.id || uidShort('g2027')),
      packId: raw.packId ? String(raw.packId).slice(0, 48) : '',
      title,
      sector,
      frequency,
      targetPerWeek,
      minutes,
      verseRef: String(raw.verseRef || 'Flp 3,13–14 (UBG)').slice(0, 48),
      checkins,
      milestones,
      createdAt: Number(raw.createdAt) || Date.now()
    };
  }

  function normalizeState(raw) {
    const base = createDefaultState();
    if (!raw || typeof raw !== 'object') return base;
    base.updatedAt = Number(raw.updatedAt) || 0;
    base.motto = String(raw.motto || '').trim().slice(0, 140);
    base.sabbathShield = raw.sabbathShield !== false;
    if (raw.wheel && typeof raw.wheel === 'object') {
      ['faith', 'family', 'body', 'money', 'work'].forEach(k => {
        const v = Number(raw.wheel[k]);
        if (Number.isFinite(v)) base.wheel[k] = Math.max(0, Math.min(100, Math.round(v)));
      });
      base.wheel.hasCalculated = Boolean(raw.wheel.hasCalculated);
    }
    const inc = Number(raw.stewardshipIncome);
    if (Number.isFinite(inc) && inc >= 0) base.stewardshipIncome = Math.round(inc);
    if (raw.dailyIntention && typeof raw.dailyIntention === 'object') {
      base.dailyIntention = {
        intention: String(raw.dailyIntention.intention || '').slice(0, 300),
        notes: String(raw.dailyIntention.notes || '').slice(0, 2000),
        date: String(raw.dailyIntention.date || '')
      };
    }
    if (Array.isArray(raw.goals)) {
      base.goals = raw.goals.map(normalizeGoal).filter(Boolean).slice(0, 30);
    }
    if (Array.isArray(raw.weeklyReviews)) {
      base.weeklyReviews = raw.weeklyReviews
        .filter(r => r && typeof r === 'object' && r.weekKey)
        .map(r => ({
          weekKey: String(r.weekKey).slice(0, 16),
          gratitude: String(r.gratitude || '').trim().slice(0, 400),
          nextStep: String(r.nextStep || '').trim().slice(0, 400),
          savedAt: Number(r.savedAt) || Date.now()
        }))
        .slice(-24);
    }
    return base;
  }

  function loadLocalState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        state = normalizeState(JSON.parse(raw));
      }
    } catch (e) {
      state = createDefaultState();
    }
    if (!state.wheel.hasCalculated) {
      try {
        const uidKey = typeof window.getStorageKey === 'function' ? window.getStorageKey('holos_wheel_data') : 'holos_wheel_data_guest';
        const legacy = localStorage.getItem(uidKey) || localStorage.getItem('holos_wheel_data_guest');
        if (legacy) {
          const parsed = JSON.parse(legacy);
          ['faith', 'family', 'body', 'money', 'work'].forEach(k => {
            if (parsed[k] !== undefined) state.wheel[k] = Number(parsed[k]);
          });
          state.wheel.hasCalculated = Boolean(parsed.hasCalculated);
        }
      } catch (e) {}
    }
  }

  function persistLocal(scheduleCloud) {
    state.updatedAt = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
    if (scheduleCloud !== false) {
      queueCloudSave();
    }
  }

  function mergeStates(localSt, remoteSt) {
    const a = normalizeState(localSt);
    const b = normalizeState(remoteSt);
    const newer = (b.updatedAt >= a.updatedAt) ? b : a;
    const merged = normalizeState(newer);

    const goalMap = new Map();
    const packSeen = new Map();
    const ingestGoal = (g) => {
      const existingById = goalMap.get(g.id);
      const existingByPack = g.packId ? packSeen.get(g.packId) : null;
      const target = existingById || existingByPack;
      if (!target) {
        const copy = JSON.parse(JSON.stringify(g));
        goalMap.set(copy.id, copy);
        if (copy.packId) packSeen.set(copy.packId, copy);
      } else {
        target.checkins = Array.from(new Set([...target.checkins, ...g.checkins])).sort();
        const msMap = new Map();
        target.milestones.forEach(m => msMap.set(m.text.toLowerCase(), { ...m }));
        g.milestones.forEach(m => {
          const key = m.text.toLowerCase();
          if (msMap.has(key)) {
            msMap.get(key).done = msMap.get(key).done || m.done;
          } else {
            msMap.set(key, { ...m });
          }
        });
        target.milestones = Array.from(msMap.values()).slice(0, 12);
      }
    };
    a.goals.forEach(ingestGoal);
    b.goals.forEach(ingestGoal);
    merged.goals = Array.from(goalMap.values()).slice(0, 30);

    const revMap = new Map();
    [...a.weeklyReviews, ...b.weeklyReviews].forEach(r => {
      const prev = revMap.get(r.weekKey);
      if (!prev || r.savedAt >= prev.savedAt) revMap.set(r.weekKey, r);
    });
    merged.weeklyReviews = Array.from(revMap.values()).sort((x, y) => x.weekKey.localeCompare(y.weekKey)).slice(-24);
    merged.updatedAt = Math.max(a.updatedAt, b.updatedAt, Date.now());
    return merged;
  }

  function isVerifiedGoogleMember(user) {
    if (!user || !user.uid || user.isAnonymous) return false;
    if (typeof user.getIdToken !== 'function') return false;
    return true;
  }

  function buildFirestoreUrl(uid) {
    return `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents/users/${encodeURIComponent(uid)}/personal_hub/${PERSONAL_HUB_DOC}`;
  }

  function updateAllSyncViews() {
    renderCloudSyncBar();
    if (typeof window.updateSyncUI === 'function') {
      try { window.updateSyncUI(); } catch (e) {}
    }
  }

  async function pullFromCloud(user) {
    if (!isVerifiedGoogleMember(user)) {
      syncStatus = {
        mode: 'guest',
        verifiedCloud: false,
        uid: null,
        displayName: '',
        email: '',
        photoURL: '',
        lastSyncedAt: null,
        errorMessage: ''
      };
      updateAllSyncViews();
      return false;
    }

    syncStatus = {
      mode: 'syncing',
      verifiedCloud: false,
      uid: user.uid,
      displayName: user.displayName || user.email || 'Konto Google',
      email: user.email || '',
      photoURL: user.photoURL || '',
      lastSyncedAt: syncStatus.lastSyncedAt,
      errorMessage: ''
    };
    updateAllSyncViews();

    try {
      const token = await user.getIdToken();
      const res = await fetch(buildFirestoreUrl(user.uid), {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 404) {
        return await pushToCloud(user, true);
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const docJson = await res.json();
      const payloadStr = docJson?.fields?.payloadJson?.stringValue;
      let remoteState = null;
      if (payloadStr) {
        remoteState = normalizeState(JSON.parse(payloadStr));
      }

      if (remoteState) {
        const localBefore = JSON.stringify(state.goals);
        state = mergeStates(state, remoteState);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
        hydrateLegacyDomFromState();
        renderAll();

        const remoteGoalsStr = JSON.stringify(remoteState.goals);
        if (JSON.stringify(state.goals) !== remoteGoalsStr || localBefore !== remoteGoalsStr) {
          return await pushToCloud(user, true);
        }
      }

      syncStatus = {
        mode: 'synced',
        verifiedCloud: true,
        uid: user.uid,
        displayName: user.displayName || user.email || 'Konto Google',
        email: user.email || '',
        photoURL: user.photoURL || '',
        lastSyncedAt: new Date(),
        errorMessage: ''
      };
      updateAllSyncViews();
      return true;
    } catch (err) {
      syncStatus = {
        mode: 'error',
        verifiedCloud: false,
        uid: user.uid,
        displayName: user.displayName || user.email || 'Konto Google',
        email: user.email || '',
        photoURL: user.photoURL || '',
        lastSyncedAt: null,
        errorMessage: err?.message || 'Brak połączenia z chmurą'
      };
      updateAllSyncViews();
      return false;
    }
  }

  async function pushToCloud(user, immediate) {
    const fbUser = user || activeFirebaseUser;
    if (!isVerifiedGoogleMember(fbUser)) {
      syncStatus.mode = 'guest';
      syncStatus.verifiedCloud = false;
      updateAllSyncViews();
      return false;
    }

    syncStatus = {
      ...syncStatus,
      mode: 'syncing',
      verifiedCloud: false,
      uid: fbUser.uid,
      displayName: fbUser.displayName || fbUser.email || 'Konto Google',
      email: fbUser.email || '',
      photoURL: fbUser.photoURL || ''
    };
    updateAllSyncViews();

    try {
      const token = await fbUser.getIdToken();
      const mask = 'updateMask.fieldPaths=schemaVersion&updateMask.fieldPaths=updatedAtMs&updateMask.fieldPaths=goalsCount&updateMask.fieldPaths=payloadJson';
      const url = `${buildFirestoreUrl(fbUser.uid)}?${mask}`;
      const body = {
        fields: {
          schemaVersion: { integerValue: String(state.schemaVersion || 1) },
          updatedAtMs: { integerValue: String(state.updatedAt || Date.now()) },
          goalsCount: { integerValue: String(state.goals.length) },
          payloadJson: { stringValue: JSON.stringify(state) }
        }
      };

      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      syncStatus = {
        mode: 'synced',
        verifiedCloud: true,
        uid: fbUser.uid,
        displayName: fbUser.displayName || fbUser.email || 'Konto Google',
        email: fbUser.email || '',
        photoURL: fbUser.photoURL || '',
        lastSyncedAt: new Date(),
        errorMessage: ''
      };
      updateAllSyncViews();
      if (immediate) {
        showToast('Zsynchronizowano HOLOS 2027 z kontem Google.', 'success');
      }
      return true;
    } catch (err) {
      syncStatus = {
        ...syncStatus,
        mode: 'error',
        verifiedCloud: false,
        errorMessage: err?.message || 'Błąd zapisu w chmurze'
      };
      updateAllSyncViews();
      return false;
    }
  }

  function queueCloudSave() {
    if (!isVerifiedGoogleMember(activeFirebaseUser)) return;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      pushToCloud(activeFirebaseUser, false);
    }, 800);
  }

  function hydrateLegacyDomFromState() {
    if (state.wheel && state.wheel.hasCalculated) {
      ['faith', 'family', 'body', 'money', 'work'].forEach(sec => {
        const slider = document.getElementById('slider-' + sec);
        if (slider && state.wheel[sec] !== undefined) {
          slider.value = String(state.wheel[sec]);
        }
      });
      try {
        const uidKey = typeof window.getStorageKey === 'function' ? window.getStorageKey('holos_wheel_data') : 'holos_wheel_data_guest';
        localStorage.setItem(uidKey, JSON.stringify(state.wheel));
      } catch (e) {}
      if (typeof window.updateWheel === 'function') window.updateWheel();
    }

    const incEl = document.getElementById('input-income');
    if (incEl && Number.isFinite(state.stewardshipIncome)) {
      incEl.value = String(state.stewardshipIncome);
      if (typeof window.calcStewardship === 'function') window.calcStewardship();
    }

    if (state.dailyIntention && (state.dailyIntention.intention || state.dailyIntention.notes)) {
      const iEl = document.getElementById('input-intention');
      const nEl = document.getElementById('input-notes');
      if (iEl && !iEl.value) iEl.value = state.dailyIntention.intention || '';
      if (nEl && !nEl.value) nEl.value = state.dailyIntention.notes || '';
    }
  }

  /* ── OBLICZENIA SERII (STREAK) Z TARCZĄ SZABATU ── */
  function computeGoalStreak(goal) {
    const doneSet = new Set(goal.checkins || []);
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    if (goal.frequency === 'weekly') {
      let weeks = 0;
      const cursor = new Date(today.getTime());
      for (let w = 0; w < 52; w++) {
        const wk = getWeekKey(cursor);
        const hits = goal.checkins.filter(ds => getWeekKey(new Date(ds + 'T12:00:00')) === wk).length;
        if (hits >= 1) {
          weeks++;
        } else if (w > 0) {
          break;
        }
        cursor.setDate(cursor.getDate() - 7);
      }
      return { value: weeks, unit: weeks === 1 ? 'tydz.' : 'tyg.' };
    }

    let streak = 0;
    const cursor = new Date(today.getTime());
    for (let i = 0; i < 366; i++) {
      const key = toDateKey(cursor);
      const isSaturday = cursor.getDay() === 6;
      if (doneSet.has(key)) {
        streak++;
      } else if (i === 0) {
        // Dzisiejszy dzień trwa
      } else if (state.sabbathShield && isSaturday) {
        // Tarcza Szabatu chroni serię w Sobotę
      } else {
        break;
      }
      cursor.setDate(cursor.getDate() - 1);
    }
    return { value: streak, unit: streak === 1 ? 'dzień' : 'dni' };
  }

  function getLast14Days() {
    const arr = [];
    const base = new Date();
    base.setHours(12, 0, 0, 0);
    for (let i = 13; i >= 0; i--) {
      const d = new Date(base.getTime());
      d.setDate(d.getDate() - i);
      arr.push({
        key: toDateKey(d),
        dayOfWeek: d.getDay(),
        isToday: i === 0,
        label: d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
      });
    }
    return arr;
  }

  function getWeeklyCount(goal) {
    const currentWeek = getWeekKey(new Date());
    return (goal.checkins || []).filter(ds => getWeekKey(new Date(ds + 'T12:00:00')) === currentWeek).length;
  }

  /* ── AKCJE NA CELACH ── */
  function activatePack(packId) {
    const pack = CHALLENGE_PACKS_2027.find(p => p.packId === packId);
    if (!pack) return;
    if (state.goals.some(g => g.packId === packId)) {
      showToast('To wyzwanie jest już aktywne na Twojej liście 2027.', 'info');
      return;
    }
    const newGoal = normalizeGoal({
      id: uidShort('g2027'),
      packId: pack.packId,
      title: pack.title,
      sector: pack.sector,
      frequency: pack.frequency,
      targetPerWeek: pack.targetPerWeek,
      minutes: pack.minutes,
      verseRef: pack.verseRef,
      checkins: [],
      milestones: pack.milestones.map((txt, idx) => ({ id: uidShort('ms' + idx), text: txt, done: false })),
      createdAt: Date.now()
    });
    if (!newGoal) return;
    state.goals.unshift(newGoal);
    persistLocal(true);
    renderAll();
    showToast(`Dodano wyzwanie 2027: „${newGoal.title}”. Powierz je Panu!`, 'success');
  }

  function addCustomGoal(payload) {
    const title = String(payload?.title || '').trim();
    if (!title) {
      showToast('Wpisz nazwę swojego celu na 2027 rok.', 'warn');
      return false;
    }
    const freqRaw = String(payload?.frequency || 'daily');
    const frequency = freqRaw === 'daily' ? 'daily' : 'weekly';
    const targetPerWeek = freqRaw === 'weekly_3' ? 3 : (freqRaw === 'weekly_1' ? 1 : 6);
    const firstMs = String(payload?.milestone || '').trim();
    const newGoal = normalizeGoal({
      id: uidShort('g2027'),
      packId: '',
      title,
      sector: payload?.sector || 'faith',
      frequency,
      targetPerWeek,
      minutes: Number(payload?.minutes) || 10,
      verseRef: 'Prz 16,3 (UBG)',
      checkins: [],
      milestones: firstMs ? [{ id: uidShort('ms'), text: firstMs, done: false }] : [],
      createdAt: Date.now()
    });
    if (!newGoal) return false;
    state.goals.unshift(newGoal);
    persistLocal(true);
    renderAll();
    showToast(`Dodano własny cel 2027: „${newGoal.title}”.`, 'success');
    return true;
  }

  function toggleTodayCheckin(goalId) {
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;
    const todayKey = toDateKey(new Date());
    const idx = goal.checkins.indexOf(todayKey);
    if (idx >= 0) {
      goal.checkins.splice(idx, 1);
      persistLocal(true);
      renderAll();
      showToast(`Cofnięto dzisiejszy wpis dla „${goal.title}”.`, 'info');
    } else {
      goal.checkins.push(todayKey);
      goal.checkins.sort();
      persistLocal(true);
      renderAll();
      const streak = computeGoalStreak(goal);
      showToast(`Zaliczone dziś! Seria: ${streak.value} ${streak.unit} — chwała Bogu za wierność!`, 'success');
    }
  }

  function toggleMilestone(goalId, msId) {
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;
    const ms = goal.milestones.find(m => m.id === msId);
    if (!ms) return;
    ms.done = !ms.done;
    persistLocal(true);
    renderAll();
    if (ms.done) {
      showToast(`Kamień milowy ukończony: „${ms.text}”!`, 'success');
    }
  }

  function addMilestone(goalId, text) {
    const clean = String(text || '').trim().slice(0, 100);
    if (!clean) return;
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;
    if (goal.milestones.length >= 12) {
      showToast('Maksymalnie 12 kamieni milowych na jeden cel.', 'warn');
      return;
    }
    goal.milestones.push({ id: uidShort('ms'), text: clean, done: false });
    persistLocal(true);
    renderAll();
  }

  function removeGoal(goalId) {
    const idx = state.goals.findIndex(g => g.id === goalId);
    if (idx < 0) return;
    const removed = state.goals[idx];
    state.goals.splice(idx, 1);
    persistLocal(true);
    renderAll();
    showToast(`Usunięto cel „${removed.title}”.`, 'info');
  }

  function triggerGoogleSignIn() {
    if (window.ccGlobalAuth && typeof window.ccGlobalAuth.openAuthModal === 'function') {
      window.ccGlobalAuth.openAuthModal();
      return;
    }
    const authBtn = document.querySelector('#cc-global-auth-btn, .cc-auth-google-btn, .cc-global-auth-trigger');
    if (authBtn && typeof authBtn.click === 'function') {
      authBtn.click();
      return;
    }
    if (window.LuminaDB && typeof window.LuminaDB.loginWithGoogle === 'function') {
      window.LuminaDB.loginWithGoogle();
      return;
    }
    window.location.href = '/lumina';
  }

  function exportJsonBackup() {
    try {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `holos-2027-backup-${toDateKey(new Date())}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast('Pobrano kopię zapasową HOLOS 2027 (JSON).', 'success');
    } catch (e) {
      showToast('Nie udało się wyeksportować pliku JSON.', 'warn');
    }
  }

  function importJsonBackup(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.goals)) {
          throw new Error('Nieprawidłowy format kopii HOLOS 2027.');
        }
        state = mergeStates(state, parsed);
        persistLocal(true);
        hydrateLegacyDomFromState();
        renderAll();
        showToast('Zaimportowano i scalono kopię zapasową HOLOS 2027!', 'success');
      } catch (err) {
        showToast('Błąd importu JSON: ' + (err?.message || 'sprawdź plik'), 'warn');
      }
    };
    reader.readAsText(file);
  }

  /* ── RENDEROWANIE DOM (100% BEZ innerHTML) ── */
  function clearEl(elNode) {
    while (elNode && elNode.firstChild) elNode.removeChild(elNode.firstChild);
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function renderCloudSyncBar() {
    const bar = document.getElementById('holos-cloud-sync-bar');
    if (!bar) return;
    clearEl(bar);

    const left = el('div', 'flex items-center gap-3 min-w-0 flex-1');
    const dot = el('span', 'w-3 h-3 rounded-full shrink-0');
    const textWrap = el('div', 'min-w-0');
    const titleEl = el('div', 'text-xs sm:text-sm font-extrabold text-white truncate');
    const subEl = el('div', 'text-[11px] text-text-secondary leading-snug');

    const right = el('div', 'flex flex-wrap items-center gap-2 shrink-0');

    if (syncStatus.mode === 'synced' && syncStatus.verifiedCloud && syncStatus.uid) {
      dot.style.backgroundColor = '#10B981';
      dot.style.boxShadow = '0 0 10px rgba(16,185,129,0.7)';
      const timeStr = syncStatus.lastSyncedAt
        ? syncStatus.lastSyncedAt.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
        : '';
      titleEl.textContent = `Zsynchronizowano z kontem Google (${syncStatus.displayName}) ✓`;
      subEl.textContent = `Twoje cele 2027, Koło Życia i seria zapisują się w prywatnej chmurze Firestore${timeStr ? ' · ostatni zapis ' + timeStr : ''}.`;

      const btnSync = el('button', 'px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all', '↻ Synchronizuj teraz');
      btnSync.type = 'button';
      btnSync.addEventListener('click', () => pushToCloud(activeFirebaseUser, true));
      right.appendChild(btnSync);
    } else if (syncStatus.mode === 'syncing') {
      dot.style.backgroundColor = '#38BDF8';
      titleEl.textContent = 'Synchronizacja z kontem Google...';
      subEl.textContent = 'Łączenie z prywatnym schowkiem HOLOS 2027 w chmurze.';
    } else if (syncStatus.mode === 'error') {
      dot.style.backgroundColor = '#F59E0B';
      titleEl.textContent = 'Zapis lokalny — chmura chwilowo niedostępna';
      subEl.textContent = `Twoje zmiany są bezpieczne w przeglądarce (${syncStatus.errorMessage || 'tryb offline'}).`;

      const btnRetry = el('button', 'px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all', '↻ Ponów zapis w chmurze');
      btnRetry.type = 'button';
      btnRetry.addEventListener('click', () => pushToCloud(activeFirebaseUser, true));
      right.appendChild(btnRetry);
    } else {
      dot.style.backgroundColor = '#94A3B8';
      titleEl.textContent = 'Tryb gościa — zapis lokalny w przeglądarce';
      subEl.textContent = 'Zaloguj się przez Google, aby synchronizować swoje wyzwania 2027 między telefonem a komputerem.';

      const btnLogin = el('button', 'holos-cta-orange px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-lg flex items-center gap-2', 'Zaloguj z Google (Chmura)');
      btnLogin.type = 'button';
      btnLogin.id = 'h2027-google-signin-btn';
      btnLogin.addEventListener('click', triggerGoogleSignIn);
      right.appendChild(btnLogin);
    }

    const btnExport = el('button', 'px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-text-secondary hover:text-white text-xs font-bold transition-all', '⬇ Kopia JSON');
    btnExport.type = 'button';
    btnExport.title = 'Eksportuj kopię zapasową celów 2027 do pliku JSON';
    btnExport.addEventListener('click', exportJsonBackup);

    const importLabel = el('label', 'px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-text-secondary hover:text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center', '⬆ Wczytaj JSON');
    importLabel.style.minHeight = '44px';
    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.accept = 'application/json,.json';
    importInput.className = 'sr-only';
    importInput.addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      if (f) importJsonBackup(f);
      e.target.value = '';
    });
    importLabel.appendChild(importInput);

    right.appendChild(btnExport);
    right.appendChild(importLabel);

    textWrap.appendChild(titleEl);
    textWrap.appendChild(subEl);
    left.appendChild(dot);
    left.appendChild(textWrap);
    bar.appendChild(left);
    bar.appendChild(right);
  }

  function renderDashboardCockpit() {
    const todayKey = toDateKey(new Date());
    const totalGoals = state.goals.length;
    const completedToday = state.goals.filter(g => g.checkins.includes(todayKey)).length;
    const pct = totalGoals > 0 ? Math.round((completedToday / totalGoals) * 100) : 0;

    let bestStreak = 0;
    let totalCheckins = 0;
    state.goals.forEach(g => {
      totalCheckins += g.checkins.length;
      const st = computeGoalStreak(g);
      if (st.value > bestStreak) bestStreak = st.value;
    });

    const ringCircle = document.getElementById('h2027-ring-circle');
    const ringPct = document.getElementById('h2027-ring-pct');
    const ringSub = document.getElementById('h2027-ring-sub');
    if (ringCircle) {
      const circumference = 2 * Math.PI * 52;
      ringCircle.style.strokeDasharray = String(circumference.toFixed(2));
      ringCircle.style.strokeDashoffset = String((circumference * (1 - pct / 100)).toFixed(2));
    }
    if (ringPct) ringPct.textContent = `${pct}%`;
    if (ringSub) {
      ringSub.textContent = totalGoals === 0
        ? 'Wybierz 1. wyzwanie'
        : `${completedToday} z ${totalGoals} dziś`;
    }

    const statActive = document.getElementById('h2027-stat-active');
    const statToday = document.getElementById('h2027-stat-today');
    const statStreak = document.getElementById('h2027-stat-streak');
    const statTotal = document.getElementById('h2027-stat-total');
    if (statActive) statActive.textContent = String(totalGoals);
    if (statToday) statToday.textContent = `${completedToday}/${totalGoals}`;
    if (statStreak) statStreak.textContent = `${bestStreak}`;
    if (statTotal) statTotal.textContent = String(totalCheckins);

    const countdownEl = document.getElementById('h2027-year-countdown');
    if (countdownEl) {
      const now = new Date();
      const target2027 = new Date(2027, 0, 1, 0, 0, 0);
      if (now < target2027) {
        const daysLeft = Math.max(1, Math.ceil((target2027 - now) / 86400000));
        countdownEl.textContent = `Do Nowego Roku 2027: ${daysLeft} dni — zacznij rytm już dziś`;
      } else {
        const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 1)) / 86400000) + 1;
        countdownEl.textContent = `Rok ${now.getFullYear()} · Dzień ${dayOfYear} z 365`;
      }
    }

    const sabbathToggle = document.getElementById('h2027-sabbath-toggle');
    if (sabbathToggle) sabbathToggle.checked = Boolean(state.sabbathShield);

    const mottoInput = document.getElementById('h2027-motto-input');
    if (mottoInput && document.activeElement !== mottoInput) {
      mottoInput.value = state.motto || '';
    }

    const verseObj = UBG_VERSES_2027[verseIndex % UBG_VERSES_2027.length];
    const vText = document.getElementById('h2027-verse-text');
    const vRef = document.getElementById('h2027-verse-ref');
    if (vText) vText.textContent = `„${verseObj.text}”`;
    if (vRef) vRef.textContent = `— ${verseObj.ref}`;
  }

  function renderGoalsList() {
    const container = document.getElementById('h2027-goals-list');
    if (!container) return;
    clearEl(container);

    if (state.goals.length === 0) {
      const empty = el('div', 'p-8 rounded-3xl bg-surface-dark/80 border border-dashed border-white/15 text-center space-y-3');
      empty.appendChild(el('div', 'text-3xl', '🌱'));
      empty.appendChild(el('h3', 'text-base sm:text-lg font-extrabold text-white', 'Rozpocznij swój Rok 2027 od pierwszego małego kroku'));
      empty.appendChild(el('p', 'text-xs sm:text-sm text-text-secondary max-w-lg mx-auto leading-relaxed', 'Wybierz gotowe wyzwanie poniżej jednym kliknięciem albo dodaj własny cel. Nie musisz zmieniać wszystkiego naraz — wystarczy 5–15 minut wierności dziennie.'));
      container.appendChild(empty);
      return;
    }

    const todayKey = toDateKey(new Date());
    const last14 = getLast14Days();

    state.goals.forEach(goal => {
      const sec = SECTORS[goal.sector] || SECTORS.faith;
      const doneToday = goal.checkins.includes(todayKey);
      const streak = computeGoalStreak(goal);
      const weekHits = getWeeklyCount(goal);
      const msDone = goal.milestones.filter(m => m.done).length;
      const msTotal = goal.milestones.length;

      const card = el('article', 'h2027-goal-card p-5 sm:p-6 rounded-3xl glass-spatial border transition-all space-y-4 min-w-0');
      card.style.borderColor = doneToday ? 'rgba(16, 185, 129, 0.45)' : 'rgba(255, 255, 255, 0.08)';
      card.setAttribute('data-goal-id', goal.id);

      const topRow = el('div', 'flex flex-col sm:flex-row sm:items-start justify-between gap-4 min-w-0');
      const infoCol = el('div', 'space-y-2 min-w-0 flex-1');

      const badgesRow = el('div', 'flex flex-wrap items-center gap-2');
      const sectorBadge = el('span', 'px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1', `${sec.icon} ${sec.label}`);
      sectorBadge.style.color = sec.color;
      sectorBadge.style.backgroundColor = sec.bg;
      sectorBadge.style.border = `1px solid ${sec.border}`;
      badgesRow.appendChild(sectorBadge);

      const freqLabel = goal.frequency === 'daily'
        ? `Codziennie · ${goal.minutes} min`
        : `${goal.targetPerWeek}× w tyg. (${weekHits}/${goal.targetPerWeek}) · ${goal.minutes} min`;
      badgesRow.appendChild(el('span', 'px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/5 text-text-secondary border border-white/10', freqLabel));

      const streakBadge = el('span', 'px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-400/15 text-amber-300 border border-amber-400/30', `🔥 Seria: ${streak.value} ${streak.unit}`);
      badgesRow.appendChild(streakBadge);

      const titleHeading = el('h3', 'text-base sm:text-lg font-extrabold text-white break-words', goal.title);
      infoCol.appendChild(badgesRow);
      infoCol.appendChild(titleHeading);

      const actionsCol = el('div', 'flex flex-wrap items-center gap-2 shrink-0');

      const checkinBtn = el(
        'button',
        doneToday
          ? 'px-4 py-2.5 rounded-xl bg-emerald-500 text-pure-black font-black text-xs transition-all shadow-md flex items-center gap-1.5'
          : 'holos-cta-orange px-4 py-2.5 rounded-xl font-black text-xs transition-all shadow-md flex items-center gap-1.5',
        doneToday ? '✓ Zaliczone dziś' : '✓ Zalicz dziś'
      );
      checkinBtn.type = 'button';
      checkinBtn.setAttribute('data-action', 'checkin');
      checkinBtn.setAttribute('aria-pressed', doneToday ? 'true' : 'false');
      checkinBtn.addEventListener('click', () => toggleTodayCheckin(goal.id));
      actionsCol.appendChild(checkinBtn);

      const timerBtn = el('button', 'px-3.5 py-2.5 rounded-xl bg-holos-turquoise/15 hover:bg-holos-turquoise/25 text-holos-turquoise border border-holos-turquoise/30 font-extrabold text-xs transition-all flex items-center gap-1.5', `⏱ Start ${goal.minutes} min`);
      timerBtn.type = 'button';
      timerBtn.setAttribute('data-action', 'start-timer');
      timerBtn.addEventListener('click', () => {
        if (typeof window.startSpecificTimer === 'function') {
          window.startSpecificTimer(goal.minutes, goal.title);
        }
      });
      actionsCol.appendChild(timerBtn);

      const removeBtn = el('button', 'px-3 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-text-tertiary hover:text-red-300 border border-white/10 text-xs font-bold transition-all', '✕');
      removeBtn.type = 'button';
      removeBtn.setAttribute('aria-label', `Usuń cel ${goal.title}`);
      removeBtn.title = 'Usuń cel';
      removeBtn.addEventListener('click', () => removeGoal(goal.id));
      actionsCol.appendChild(removeBtn);

      topRow.appendChild(infoCol);
      topRow.appendChild(actionsCol);
      card.appendChild(topRow);

      const heatWrap = el('div', 'pt-2 border-t border-white/5 space-y-2');
      const heatHeader = el('div', 'flex items-center justify-between text-[11px] text-text-tertiary');
      heatHeader.appendChild(el('span', 'font-bold uppercase tracking-wider', 'Rytm ostatnich 14 dni'));
      heatHeader.appendChild(el('span', 'font-mono', `Łącznie zaliczeń: ${goal.checkins.length}`));
      heatWrap.appendChild(heatHeader);

      const dotsRow = el('div', 'h2027-heatmap');
      const doneSet = new Set(goal.checkins);
      last14.forEach(day => {
        const isDone = doneSet.has(day.key);
        const isSabbathRest = !isDone && state.sabbathShield && day.dayOfWeek === 6 && goal.frequency === 'daily';
        const dot = el('span', 'h2027-heat-dot');
        if (isDone) {
          dot.classList.add('is-done');
          dot.title = `${day.label}: Zaliczone ✓`;
        } else if (isSabbathRest) {
          dot.classList.add('is-sabbath');
          dot.textContent = '🕊';
          dot.title = `${day.label}: Szabat (Tarcza odpoczynku chroni serię)`;
        } else {
          dot.title = `${day.label}: Oczekuje`;
        }
        if (day.isToday) dot.classList.add('is-today');
        dotsRow.appendChild(dot);
      });
      heatWrap.appendChild(dotsRow);
      card.appendChild(heatWrap);

      const msDetails = document.createElement('details');
      msDetails.className = 'pt-2 border-t border-white/5';
      const msSummary = el('summary', 'cursor-pointer text-xs font-bold text-text-secondary hover:text-white select-none py-1', `Kamienie milowe 2027 (${msDone}/${msTotal})`);
      msDetails.appendChild(msSummary);

      const msBody = el('div', 'pt-3 space-y-2');
      goal.milestones.forEach(ms => {
        const row = el('label', 'flex items-center gap-3 p-2.5 rounded-xl bg-surface-dark border border-white/5 hover:border-white/15 cursor-pointer');
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = Boolean(ms.done);
        cb.className = 'w-4 h-4 rounded cursor-pointer accent-emerald-400';
        cb.addEventListener('change', () => toggleMilestone(goal.id, ms.id));

        const txt = el('span', ms.done ? 'text-xs line-through text-text-tertiary flex-1' : 'text-xs text-white flex-1', ms.text);
        row.appendChild(cb);
        row.appendChild(txt);
        msBody.appendChild(row);
      });

      const addMsRow = el('div', 'flex gap-2 pt-1');
      const msInput = document.createElement('input');
      msInput.type = 'text';
      msInput.placeholder = 'Dodaj kolejny krok milowy...';
      msInput.maxLength = 100;
      msInput.className = 'flex-1 min-w-0 px-3 py-2 rounded-xl glass-input text-xs';
      const msAddBtn = el('button', 'px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold shrink-0', '+ Krok');
      msAddBtn.type = 'button';
      const submitMs = () => {
        if (msInput.value.trim()) {
          addMilestone(goal.id, msInput.value);
          msInput.value = '';
        }
      };
      msAddBtn.addEventListener('click', submitMs);
      msInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitMs();
        }
      });
      addMsRow.appendChild(msInput);
      addMsRow.appendChild(msAddBtn);
      msBody.appendChild(addMsRow);

      msDetails.appendChild(msBody);
      card.appendChild(msDetails);

      container.appendChild(card);
    });
  }

  function renderPacksGrid() {
    const grid = document.getElementById('h2027-packs-grid');
    if (!grid) return;
    clearEl(grid);

    CHALLENGE_PACKS_2027.forEach(pack => {
      const sec = SECTORS[pack.sector] || SECTORS.faith;
      const isAdded = state.goals.some(g => g.packId === pack.packId);

      const card = el('div', 'p-5 rounded-2xl bg-surface-dark/90 border border-white/10 hover:border-holos-turquoise/40 transition-all flex flex-col justify-between gap-4 min-w-0');
      const top = el('div', 'space-y-2');

      const meta = el('div', 'flex items-center justify-between gap-2 text-[11px]');
      const secTag = el('span', 'font-bold', `${sec.icon} ${sec.label}`);
      secTag.style.color = sec.color;
      meta.appendChild(secTag);
      meta.appendChild(el('span', 'font-mono text-text-tertiary', `${pack.minutes} min`));

      top.appendChild(meta);
      top.appendChild(el('h4', 'text-sm font-extrabold text-white', pack.title));
      top.appendChild(el('p', 'text-xs text-text-secondary leading-relaxed', pack.description));

      const btn = el(
        'button',
        isAdded
          ? 'w-full px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-extrabold text-xs transition-all'
          : 'w-full px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 font-extrabold text-xs transition-all',
        isAdded ? '✓ Aktywne na Twojej liście 2027' : '+ Dodaj do mojego 2027'
      );
      btn.type = 'button';
      btn.setAttribute('data-pack-id', pack.packId);
      btn.disabled = isAdded;
      btn.addEventListener('click', () => activatePack(pack.packId));

      card.appendChild(top);
      card.appendChild(btn);
      grid.appendChild(card);
    });
  }

  function renderWeeklyReview() {
    const weekKey = getWeekKey(new Date());
    const badge = document.getElementById('h2027-week-label');
    if (badge) badge.textContent = `Tydzień ${weekKey}`;

    const existing = state.weeklyReviews.find(r => r.weekKey === weekKey);
    const gEl = document.getElementById('h2027-review-gratitude');
    const nEl = document.getElementById('h2027-review-next');
    if (existing) {
      if (gEl && document.activeElement !== gEl && !gEl.value) gEl.value = existing.gratitude;
      if (nEl && document.activeElement !== nEl && !nEl.value) nEl.value = existing.nextStep;
    }
  }

  function renderAll() {
    renderCloudSyncBar();
    renderDashboardCockpit();
    renderGoalsList();
    renderPacksGrid();
    renderWeeklyReview();
  }

  function mountPromoBanner() {
    if (promoMounted) return;
    if (window.CCEco && typeof window.CCEco.mountPromo === 'function') {
      const stage = document.getElementById('promoStage');
      const dots = document.getElementById('promoDots');
      const bar = document.getElementById('promoBar');
      if (stage && dots) {
        window.CCEco.mountPromo(stage, dots, bar, 'pl', 'holos_2027', 9000);
        promoMounted = true;
      }
    }
  }

  function bindStaticControls() {
    const sabbathToggle = document.getElementById('h2027-sabbath-toggle');
    if (sabbathToggle) {
      sabbathToggle.addEventListener('change', () => {
        state.sabbathShield = Boolean(sabbathToggle.checked);
        persistLocal(true);
        renderAll();
        showToast(
          state.sabbathShield
            ? 'Tarcza Szabatu włączona — Sobota odpoczynku chroni Twoją serię.'
            : 'Tarcza Szabatu wyłączona.',
          'info'
        );
      });
    }

    const mottoSaveBtn = document.getElementById('h2027-motto-save');
    const mottoInput = document.getElementById('h2027-motto-input');
    if (mottoSaveBtn && mottoInput) {
      const saveMotto = () => {
        state.motto = mottoInput.value.trim().slice(0, 140);
        persistLocal(true);
        showToast('Zapisano Twoje motto na 2027 rok.', 'success');
      };
      mottoSaveBtn.addEventListener('click', saveMotto);
      mottoInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveMotto();
        }
      });
    }

    const verseNextBtn = document.getElementById('h2027-verse-next');
    if (verseNextBtn) {
      verseNextBtn.addEventListener('click', () => {
        verseIndex = (verseIndex + 1) % UBG_VERSES_2027.length;
        renderDashboardCockpit();
      });
    }

    const form = document.getElementById('h2027-custom-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const titleInput = document.getElementById('h2027-new-title');
        const sectorSelect = document.getElementById('h2027-new-sector');
        const freqSelect = document.getElementById('h2027-new-frequency');
        const minSelect = document.getElementById('h2027-new-minutes');
        const msInput = document.getElementById('h2027-new-milestone');

        const ok = addCustomGoal({
          title: titleInput ? titleInput.value : '',
          sector: sectorSelect ? sectorSelect.value : 'faith',
          frequency: freqSelect ? freqSelect.value : 'daily',
          minutes: minSelect ? Number(minSelect.value) : 10,
          milestone: msInput ? msInput.value : ''
        });
        if (ok) {
          if (titleInput) titleInput.value = '';
          if (msInput) msInput.value = '';
        }
      });
    }

    const reviewBtn = document.getElementById('h2027-review-save');
    if (reviewBtn) {
      reviewBtn.addEventListener('click', () => {
        const gEl = document.getElementById('h2027-review-gratitude');
        const nEl = document.getElementById('h2027-review-next');
        const gratitude = gEl ? gEl.value.trim().slice(0, 400) : '';
        const nextStep = nEl ? nEl.value.trim().slice(0, 400) : '';
        if (!gratitude && !nextStep) {
          showToast('Wpisz krótkie dziękczynienie lub krok na nowy tydzień.', 'warn');
          return;
        }
        const weekKey = getWeekKey(new Date());
        const idx = state.weeklyReviews.findIndex(r => r.weekKey === weekKey);
        const rec = { weekKey, gratitude, nextStep, savedAt: Date.now() };
        if (idx >= 0) state.weeklyReviews[idx] = rec;
        else state.weeklyReviews.push(rec);
        persistLocal(true);
        showToast(`Zapisano przegląd wierności (${weekKey}).`, 'success');
      });
    }
  }

  async function bindFirebaseAuth() {
    const handleAuthUser = (user) => {
      if (isVerifiedGoogleMember(user)) {
        const changed = !activeFirebaseUser || activeFirebaseUser.uid !== user.uid;
        activeFirebaseUser = user;
        if (changed) {
          pullFromCloud(user);
        }
      } else {
        activeFirebaseUser = null;
        syncStatus = {
          mode: 'guest',
          verifiedCloud: false,
          uid: null,
          displayName: '',
          email: '',
          photoURL: '',
          lastSyncedAt: null,
          errorMessage: ''
        };
        updateAllSyncViews();
      }
    };

    window.addEventListener('lumina-auth-state', () => {
      if (window.firebaseAuth && window.firebaseAuth.currentUser) {
        handleAuthUser(window.firebaseAuth.currentUser);
      } else {
        handleAuthUser(null);
      }
    });

    window.addEventListener('cc-auth-changed', () => {
      if (window.firebaseAuth && window.firebaseAuth.currentUser) {
        handleAuthUser(window.firebaseAuth.currentUser);
      } else {
        handleAuthUser(null);
      }
    });

    let attempts = 0;
    const attach = async () => {
      mountPromoBanner();
      if (window.LuminaDB && typeof window.LuminaDB.ensureDbReady === 'function') {
        try {
          const ready = await window.LuminaDB.ensureDbReady();
          const authInst = ready?.auth || window.firebaseAuth;
          if (authInst && typeof authInst.onAuthStateChanged === 'function') {
            authInst.onAuthStateChanged(handleAuthUser);
            return;
          }
        } catch (e) {}
      }
      if (window.firebaseAuth && typeof window.firebaseAuth.onAuthStateChanged === 'function') {
        window.firebaseAuth.onAuthStateChanged(handleAuthUser);
        return;
      }
      attempts++;
      if (attempts < 25) {
        setTimeout(attach, 300);
      }
    };
    attach();
  }

  function init() {
    if (initialized) return;
    initialized = true;
    loadLocalState();
    bindStaticControls();
    renderAll();
    mountPromoBanner();
    bindFirebaseAuth();
  }

  window.Holos2027Engine = {
    CHALLENGE_PACKS_2027,
    UBG_VERSES_2027,
    getState: () => JSON.parse(JSON.stringify(state)),
    getSyncStatus: () => ({ ...syncStatus }),
    activatePack,
    addCustomGoal,
    toggleTodayCheckin,
    syncCoreData(partial) {
      if (!partial || typeof partial !== 'object') return;
      if (partial.wheel && typeof partial.wheel === 'object') {
        state.wheel = { ...state.wheel, ...partial.wheel };
      }
      if (Number.isFinite(Number(partial.stewardshipIncome))) {
        state.stewardshipIncome = Math.round(Number(partial.stewardshipIncome));
      }
      if (partial.dailyIntention && typeof partial.dailyIntention === 'object') {
        state.dailyIntention = { ...state.dailyIntention, ...partial.dailyIntention };
      }
      persistLocal(true);
    },
    syncNow: () => pushToCloud(activeFirebaseUser, true),
    triggerGoogleSignIn
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
