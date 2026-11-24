// État de progression : sauvegarde locale immédiate + synchronisation cloud (capability db) quand la page est un artefact claude.ai.
const KEY = 'nego-s5-state-v1';
const listeners = new Set();

export function defaultState() {
  return {
    v: 1, updatedAt: 0,
    seances: {},      // s1: { studied, studiedAt, seen: {secId: ts}, last }
    cards: {},        // f001: { box, due, seen, known, wrong, last, lastAt }
    cardSession: null,
    qcm: {},          // q001: { ok, ko, last, at }
    qcmRuns: [],      // { at, label, score, total }
    questions: {},    // qc01: { answer, got: [indices], score (0..1), at }
    drills: {},       // x01: { best, last, at, runs }
    sims: {},         // sim1: { best, last, at, runs }
    cases: {},        // marketone: { camp, answers: {stepId}, got: {stepId: []}, evals: {stepId: {score, by, at, detail}}, prep: {}, revealed, at }
    exams: [],        // { at, id, title, score20, by }
    examDrafts: {},   // ex1: { answers, startedAt, duration, done, got, evals }
    sessions: [],
    last: null,
    name: '', examDate: '',
  };
}

function readLocal() { try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch { return null; } }
function writeLocal(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* stockage indisponible */ } }

export let state = Object.assign(defaultState(), readLocal() || {});
export const sync = { mode: 'local', status: 'Progression gardée sur cet appareil', lastSync: 0 };

export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function emit() { listeners.forEach((fn) => { try { fn(state); } catch (e) { console.error(e); } }); }

export function save() { state.updatedAt = Date.now(); writeLocal(state); scheduleRemote(); }
export function mutate(fn) { fn(state); save(); }

export function logSession(kind, label) {
  const now = Date.now();
  const prev = state.sessions[0];
  if (prev && prev.kind === kind && prev.label === label && now - prev.at < 20 * 60 * 1000) prev.at = now;
  else state.sessions.unshift({ at: now, kind, label });
  state.sessions = state.sessions.slice(0, 40);
  save();
}
export function setLast(route, label) { state.last = { route, label, at: Date.now() }; save(); }

export function resetAll() {
  const fresh = defaultState();
  fresh.updatedAt = Date.now();
  Object.keys(state).forEach((k) => delete state[k]);
  Object.assign(state, fresh);
  writeLocal(state); scheduleRemote(true); emit();
}
export function exportJSON() { return JSON.stringify(state); }
export function importJSON(txt) {
  const data = JSON.parse(txt);
  if (!data || typeof data !== 'object' || !data.v) throw new Error('Sauvegarde invalide');
  Object.keys(state).forEach((k) => delete state[k]);
  Object.assign(state, defaultState(), data);
  save(); emit();
}

// ───────── Synchronisation cloud (artefact claude.ai uniquement)
let docRef = null, timer = null, writing = false, pending = false;
function scheduleRemote(now) { if (!docRef) return; clearTimeout(timer); timer = setTimeout(pushRemote, now ? 50 : 1500); }
async function pushRemote() {
  if (!docRef) return;
  if (writing) { pending = true; return; }
  writing = true;
  try {
    await docRef.set({ json: JSON.stringify(state), updatedAt: state.updatedAt });
    sync.status = 'Synchronisé sur tes appareils'; sync.lastSync = Date.now();
  } catch (e) {
    sync.status = 'Synchronisation en pause — sauvegarde locale active';
    if (e && ['revoked', 'invalid_argument', 'not_granted'].includes(e.code)) docRef = null;
  } finally {
    writing = false; emitSync();
    if (pending) { pending = false; scheduleRemote(); }
  }
}
const syncListeners = new Set();
export function onSync(fn) { syncListeners.add(fn); }
function emitSync() { syncListeners.forEach((fn) => fn(sync)); }

export async function initRemote() {
  const C = typeof window !== 'undefined' ? window.claude : null;
  if (!C || typeof C.use !== 'function') return;
  try {
    const [db, user] = await Promise.all([C.use('db'), C.use('user')]);
    if (!db || !user) return;
    const uid = await user.id();
    if (!uid) return;
    const ref = db.doc('data/users/' + uid + '/progress');
    let t;
    const snap = await Promise.race([ref.get(), new Promise((_, rej) => { t = setTimeout(() => rej(new Error('timeout')), 10000); })]);
    clearTimeout(t);
    docRef = ref; sync.mode = 'cloud';
    if (snap.exists) {
      const remote = snap.data();
      const rs = remote && remote.json ? JSON.parse(remote.json) : null;
      if (rs && (rs.updatedAt || 0) > (state.updatedAt || 0)) {
        Object.keys(state).forEach((k) => delete state[k]);
        Object.assign(state, defaultState(), rs);
        writeLocal(state); emit();
      } else if ((state.updatedAt || 0) > ((remote && remote.updatedAt) || 0)) scheduleRemote(true);
    } else if (state.updatedAt) scheduleRemote(true);
    sync.status = 'Synchronisé sur tes appareils'; sync.lastSync = Date.now(); emitSync();
  } catch {
    sync.status = 'Progression gardée sur cet appareil'; emitSync();
  }
}
