/**
 * db.js — Warstwa utrwalania w IndexedDB, migracja schematu, eksport/import JSON
 * oraz wykrywanie konfliktów zapisu między otwartymi kartami (BroadcastChannel).
 */

export const SCHEMA_VERSION = 1;
const DB_NAME = 'cc_sba_deep_study_db';
const STORE_NAME = 'studies';
const CHANNEL_NAME = 'cc-sba-deep-study-sync';

export const DEFAULT_SHARE_SELECTION = {
  includePassage: true,
  includeObservations: true,
  includeContext: true,
  includeInterpretation: true,
  includeApplication: true,
  includeCreative: true,
  includeMindMap: true,
  includePrivatePrayer: false,
  includePrivateNotes: false,
  includeCommitments: false
};

export function sanitizeText(value, maxLen = 8000) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .slice(0, maxLen);
}

export function createStudyId(bookId, ch, vStart, vEnd) {
  const rand = Math.random().toString(36).slice(2, 8);
  return `ds_${bookId}_${ch}_${vStart}-${vEnd || vStart}_${Date.now().toString(36)}_${rand}`;
}

export function createEmptyStudy({
  bookId = 'JHN',
  chapter = 3,
  verseStart = 16,
  verseEnd = 16,
  translation = 'UBG',
  title = '',
  mode = 'pelny',
  studyType = 'werset'
} = {}) {
  const now = new Date().toISOString();
  const safeBook = sanitizeText(String(bookId || 'JHN').toUpperCase(), 8) || 'JHN';
  const ch = Number.isInteger(chapter) && chapter > 0 ? chapter : 1;
  const vStart = Number.isInteger(verseStart) && verseStart > 0 ? verseStart : 1;
  const vEnd = Number.isInteger(verseEnd) && verseEnd >= vStart ? verseEnd : vStart;

  return {
    id: createStudyId(safeBook, ch, vStart, vEnd),
    schemaVersion: SCHEMA_VERSION,
    translation: sanitizeText(String(translation || 'UBG').toUpperCase(), 12) || 'UBG',
    bookId: safeBook,
    chapter: ch,
    verseStart: vStart,
    verseEnd: vEnd,
    title: sanitizeText(title, 200),
    mode: mode === 'szybki' ? 'szybki' : 'pelny',
    studyType: sanitizeText(studyType || 'werset', 30) || 'werset',
    createdAt: now,
    updatedAt: now,
    prayerGateCompleted: false,
    stageStatus: {
      '01': 'pending',
      '02': 'pending',
      '03': 'pending',
      '04': 'pending',
      '05': 'pending',
      '06': 'pending',
      '07': 'pending',
      '08': 'pending'
    },
    answers: {},
    firstImpressions: '',
    promisesNote: '',
    annotations: [],
    references: [],
    interpretation: {
      textSummary: '',
      observation: '',
      interpretation: '',
      application: '',
      uncertainty: ''
    },
    prayer: {
      openingPrayer: '',
      closingPrayer: ''
    },
    application: {
      personalResponse: ''
    },
    commitments: [],
    creativeArtifacts: [],
    mindMap: {
      nodes: [
        {
          id: 'root',
          parentId: null,
          label: `${safeBook} ${ch}:${vStart}${vEnd > vStart ? `–${vEnd}` : ''}`,
          verseRef: `${safeBook} ${ch}:${vStart}${vEnd > vStart ? `–${vEnd}` : ''}`,
          note: '',
          color: '#b71933'
        }
      ],
      edges: []
    },
    shareSelection: { ...DEFAULT_SHARE_SELECTION }
  };
}

function sanitizeAnswers(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out = {};
  for (const [key, val] of Object.entries(raw)) {
    const k = sanitizeText(String(key), 60);
    if (!k) continue;
    if (typeof val === 'string') {
      out[k] = { text: sanitizeText(val, 4000), refs: '', status: 'answered' };
    } else if (val && typeof val === 'object') {
      const status = val.status === 'skipped' ? 'skipped' : (val.status === 'answered' ? 'answered' : 'open');
      out[k] = {
        text: sanitizeText(val.text || '', 4000),
        refs: sanitizeText(val.refs || '', 300),
        status
      };
    }
  }
  return out;
}

function sanitizeAnnotations(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 500).map((item) => {
    if (!item || typeof item !== 'object') return null;
    const ch = Number(item.chapter);
    const vStart = Number(item.verseStart ?? item.verse ?? 1);
    const vEnd = Number(item.verseEnd ?? vStart);
    if (!item.bookId || !Number.isInteger(ch) || !Number.isInteger(vStart)) return null;
    return {
      id: sanitizeText(String(item.id || `ann_${Math.random().toString(36).slice(2, 9)}`), 64),
      category: sanitizeText(String(item.category || 'kontekst'), 40),
      translation: sanitizeText(String(item.translation || 'UBG'), 12) || 'UBG',
      bookId: sanitizeText(String(item.bookId).toUpperCase(), 8),
      chapter: ch,
      verseStart: vStart,
      verseEnd: Math.max(vStart, Number.isInteger(vEnd) ? vEnd : vStart),
      quote: sanitizeText(item.quote || '', 400),
      note: sanitizeText(item.note || '', 1500),
      createdAt: sanitizeText(item.createdAt || new Date().toISOString(), 40)
    };
  }).filter(Boolean);
}

function sanitizeMindMap(raw, fallbackLabel) {
  const defaultRoot = { id: 'root', parentId: null, label: fallbackLabel, verseRef: fallbackLabel, note: '', color: '#b71933' };
  if (!raw || typeof raw !== 'object') return { nodes: [defaultRoot], edges: [] };
  const rawNodes = Array.isArray(raw.nodes) ? raw.nodes : [];
  const nodes = rawNodes.slice(0, 120).map((n) => {
    if (!n || typeof n !== 'object') return null;
    const id = sanitizeText(String(n.id || ''), 60);
    if (!id) return null;
    return {
      id,
      parentId: n.parentId ? sanitizeText(String(n.parentId), 60) : null,
      label: sanitizeText(String(n.label || 'Węzeł'), 160),
      verseRef: sanitizeText(String(n.verseRef || ''), 80),
      note: sanitizeText(String(n.note || ''), 1000),
      color: /^#[0-9a-fA-F]{6}$/.test(String(n.color || '')) ? String(n.color) : '#121212'
    };
  }).filter(Boolean);
  if (!nodes.some((n) => n.id === 'root')) nodes.unshift(defaultRoot);
  const ids = new Set(nodes.map((n) => n.id));
  const rawEdges = Array.isArray(raw.edges) ? raw.edges : [];
  const edges = rawEdges.slice(0, 240).map((e) => {
    if (!e || typeof e !== 'object') return null;
    const from = sanitizeText(String(e.from || ''), 60);
    const to = sanitizeText(String(e.to || ''), 60);
    if (!from || !to || from === to || !ids.has(from) || !ids.has(to)) return null;
    return {
      id: sanitizeText(String(e.id || `edge_${from}_${to}`), 90),
      from,
      to,
      label: sanitizeText(String(e.label || ''), 80)
    };
  }).filter(Boolean);
  return { nodes, edges };
}

/**
 * Waliduje i migruje rekord Study do aktualnego schematu (v1).
 * Zachowuje polskie znaki UTF-8 i wymusza domyślną prywatność przy shareSelection.
 */
export function migrateStudy(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Nieprawidłowy obiekt studium.');
  }
  const bookId = sanitizeText(String(raw.bookId || '').toUpperCase(), 8);
  const chapter = Number(raw.chapter);
  const verseStart = Number(raw.verseStart);
  const verseEnd = Number(raw.verseEnd ?? verseStart);
  if (!/^[1-3]?[A-Z]{2,3}$/.test(bookId) || !Number.isInteger(chapter) || chapter < 1 || !Number.isInteger(verseStart) || verseStart < 1) {
    throw new Error('Brak poprawnego adresu fragmentu (bookId, chapter, verseStart).');
  }

  const base = createEmptyStudy({
    bookId,
    chapter,
    verseStart,
    verseEnd: Number.isInteger(verseEnd) && verseEnd >= verseStart ? verseEnd : verseStart,
    translation: raw.translation || 'UBG',
    title: raw.title || '',
    mode: raw.mode,
    studyType: raw.studyType
  });

  base.id = sanitizeText(String(raw.id || base.id), 80) || base.id;
  base.schemaVersion = SCHEMA_VERSION;
  base.createdAt = sanitizeText(String(raw.createdAt || base.createdAt), 40) || base.createdAt;
  base.updatedAt = sanitizeText(String(raw.updatedAt || base.updatedAt), 40) || base.updatedAt;
  base.prayerGateCompleted = Boolean(raw.prayerGateCompleted);
  base.firstImpressions = sanitizeText(raw.firstImpressions || '', 4000);
  base.promisesNote = sanitizeText(raw.promisesNote || '', 3000);

  if (raw.stageStatus && typeof raw.stageStatus === 'object') {
    for (const id of Object.keys(base.stageStatus)) {
      const s = raw.stageStatus[id];
      if (s === 'done' || s === 'in_progress' || s === 'pending') base.stageStatus[id] = s;
    }
  }

  base.answers = sanitizeAnswers(raw.answers);
  base.annotations = sanitizeAnnotations(raw.annotations);
  base.references = Array.isArray(raw.references)
    ? raw.references.slice(0, 200).map((r) => ({
      id: sanitizeText(String(r?.id || `ref_${Math.random().toString(36).slice(2, 8)}`), 64),
      ref: sanitizeText(String(r?.ref || ''), 120),
      note: sanitizeText(String(r?.note || ''), 1000)
    })).filter((r) => r.ref)
    : [];

  if (raw.interpretation && typeof raw.interpretation === 'object') {
    base.interpretation = {
      textSummary: sanitizeText(raw.interpretation.textSummary || '', 4000),
      observation: sanitizeText(raw.interpretation.observation || '', 4000),
      interpretation: sanitizeText(raw.interpretation.interpretation || '', 4000),
      application: sanitizeText(raw.interpretation.application || '', 4000),
      uncertainty: sanitizeText(raw.interpretation.uncertainty || '', 4000)
    };
  }

  if (raw.prayer && typeof raw.prayer === 'object') {
    base.prayer = {
      openingPrayer: sanitizeText(raw.prayer.openingPrayer || '', 4000),
      closingPrayer: sanitizeText(raw.prayer.closingPrayer || '', 4000)
    };
  }

  if (raw.application && typeof raw.application === 'object') {
    base.application = {
      personalResponse: sanitizeText(raw.application.personalResponse || '', 4000)
    };
  }

  base.commitments = Array.isArray(raw.commitments)
    ? raw.commitments.slice(0, 100).map((c) => ({
      id: sanitizeText(String(c?.id || `cm_${Math.random().toString(36).slice(2, 8)}`), 64),
      action: sanitizeText(String(c?.action || ''), 600),
      dueDate: sanitizeText(String(c?.dueDate || ''), 40),
      done: Boolean(c?.done),
      reflection: sanitizeText(String(c?.reflection || ''), 2000)
    })).filter((c) => c.action)
    : [];

  base.creativeArtifacts = Array.isArray(raw.creativeArtifacts)
    ? raw.creativeArtifacts.slice(0, 80).map((a) => ({
      id: sanitizeText(String(a?.id || `art_${Math.random().toString(36).slice(2, 8)}`), 64),
      templateId: sanitizeText(String(a?.templateId || 'rozważanie'), 40),
      title: sanitizeText(String(a?.title || 'Utwór bez tytułu'), 200),
      content: sanitizeText(String(a?.content || ''), 12000),
      updatedAt: sanitizeText(String(a?.updatedAt || new Date().toISOString()), 40)
    })).filter((a) => a.content || a.title)
    : [];

  base.mindMap = sanitizeMindMap(raw.mindMap, `${bookId} ${chapter}:${verseStart}`);

  // Domyślnie modlitwy i notatki prywatne ZAWSZE odznaczone po migracji/imporcie,
  // chyba że świadomie zapisano obiekt shareSelection z jawnymi flagami boolean.
  const incomingShare = raw.shareSelection && typeof raw.shareSelection === 'object' ? raw.shareSelection : {};
  base.shareSelection = {
    includePassage: incomingShare.includePassage !== undefined ? Boolean(incomingShare.includePassage) : true,
    includeObservations: incomingShare.includeObservations !== undefined ? Boolean(incomingShare.includeObservations) : true,
    includeContext: incomingShare.includeContext !== undefined ? Boolean(incomingShare.includeContext) : true,
    includeInterpretation: incomingShare.includeInterpretation !== undefined ? Boolean(incomingShare.includeInterpretation) : true,
    includeApplication: incomingShare.includeApplication !== undefined ? Boolean(incomingShare.includeApplication) : true,
    includeCreative: incomingShare.includeCreative !== undefined ? Boolean(incomingShare.includeCreative) : true,
    includeMindMap: incomingShare.includeMindMap !== undefined ? Boolean(incomingShare.includeMindMap) : true,
    includePrivatePrayer: Boolean(incomingShare.includePrivatePrayer === true),
    includePrivateNotes: Boolean(incomingShare.includePrivateNotes === true),
    includeCommitments: Boolean(incomingShare.includeCommitments === true)
  };

  return base;
}

export function serializeStudyJson(studiesOrSingle) {
  const list = Array.isArray(studiesOrSingle) ? studiesOrSingle : [studiesOrSingle];
  return JSON.stringify({
    format: 'cc-sba-deep-study-backup',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    studies: list
  }, null, 2);
}

export function parseImportedJson(jsonText) {
  if (typeof jsonText !== 'string' || !jsonText.trim()) {
    throw new Error('Plik JSON jest pusty.');
  }
  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('Nieprawidłowa składnia pliku JSON.');
  }
  const items = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.studies)
      ? parsed.studies
      : (parsed && typeof parsed === 'object' ? [parsed] : []);
  if (!items.length) {
    throw new Error('W pliku JSON nie znaleziono żadnego studium.');
  }
  return items.map((entry) => migrateStudy(entry));
}

export class StudyStorageEngine {
  constructor() {
    this.db = null;
    this.tabId = `tab_${Math.random().toString(36).slice(2, 10)}`;
    this.channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null;
  }

  async open() {
    if (this.db) return this.db;
    if (typeof indexedDB === 'undefined') {
      throw new Error('Przeglądarka nie obsługuje IndexedDB.');
    }
    this.db = await new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, SCHEMA_VERSION);
      req.onupgradeneeded = (event) => {
        const db = event.target.result;
        let store;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        } else {
          store = req.transaction.objectStore(STORE_NAME);
        }
        if (!store.indexNames.contains('updatedAt')) store.createIndex('updatedAt', 'updatedAt', { unique: false });
        if (!store.indexNames.contains('bookId')) store.createIndex('bookId', 'bookId', { unique: false });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('Błąd otwierania bazy IndexedDB.'));
      req.onblocked = () => reject(new Error('Baza IndexedDB jest zablokowana przez inną kartę.'));
    });
    return this.db;
  }

  onRemoteSave(callback) {
    if (!this.channel) return () => {};
    const handler = (event) => {
      const msg = event.data;
      if (msg && msg.type === 'study-saved' && msg.tabId !== this.tabId) {
        callback(msg);
      }
    };
    this.channel.addEventListener('message', handler);
    return () => this.channel.removeEventListener('message', handler);
  }

  async getStudy(id) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(id);
      req.onsuccess = () => resolve(req.result ? migrateStudy(req.result) : null);
      req.onerror = () => reject(req.error);
    });
  }

  async listStudies() {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => {
        const list = (req.result || []).map((item) => {
          try {
            return migrateStudy(item);
          } catch {
            return null;
          }
        }).filter(Boolean);
        list.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async findStudyByPassage(bookId, ch, vStart, vEnd) {
    const all = await this.listStudies();
    return all.find((s) => s.bookId === bookId && s.chapter === ch && s.verseStart === vStart && s.verseEnd === vEnd) || null;
  }

  async saveStudy(study) {
    const db = await this.open();
    const record = migrateStudy(study);
    record.updatedAt = new Date().toISOString();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const req = tx.objectStore(STORE_NAME).put(record);
      req.onsuccess = () => resolve(record);
      req.onerror = () => reject(req.error);
      tx.onabort = () => reject(tx.error || new Error('Przerwano zapis do IndexedDB.'));
    });
    if (this.channel) {
      try {
        this.channel.postMessage({
          type: 'study-saved',
          id: record.id,
          updatedAt: record.updatedAt,
          tabId: this.tabId
        });
      } catch {
        /* ignoruj błąd kanału */
      }
    }
    return record;
  }

  async deleteStudy(id) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const req = tx.objectStore(STORE_NAME).delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }
}
