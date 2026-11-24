import { SEANCES, CORRESPONDANCES, CHECKS } from '../content/cours.js';
import { FICHES, TRANSVERSALE, LEXIQUE } from '../content/fiches.js';
import { FLASHCARDS } from '../content/flashcards.js';
import { QCM } from '../content/qcm.js';
import { QUESTIONS } from '../content/questions.js';
import { METHODE } from '../content/methode.js';
import { EXERCICES } from '../content/exercices.js';
import { SIMS } from '../content/simulateur.js';
import { CAS } from '../content/cas.js';
import { EXAMS } from '../content/examens.js';
import { blockText, strip } from './ui.js';
import { state } from './store.js';

export { SEANCES, CORRESPONDANCES, CHECKS, FICHES, TRANSVERSALE, LEXIQUE, FLASHCARDS, QCM, QUESTIONS, METHODE, EXERCICES, SIMS, CAS, EXAMS };

export const SE = Object.fromEntries(SEANCES.map((s) => [s.id, s]));
export const TAGS = { s1: 'Séance 1', s2: 'Séance 2', s3: 'Séance 3', s4: 'Séance 4', cas: 'Cas MarketOne / TempoRun', x: 'Transversal' };
export const tagLabel = (t) => TAGS[t] || t;
export const seLabel = (id) => (SE[id] ? `Séance ${SE[id].num} — ${SE[id].short}` : tagLabel(id));
export const LEVELS = { 1: 'Découverte', 2: 'Intermédiaire', 3: 'Exigeant' };

// ───────── Recherche plein texte
const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, ' ');
let INDEX = null;
function buildIndex() {
  INDEX = [];
  SEANCES.forEach((s) => s.sections.forEach((sec) => sec.blocks.forEach((b, i) => {
    const text = blockText(b);
    if (text) INDEX.push({ kind: 'Cours', route: `cours-${s.id}-${sec.id}`, anchor: `${s.id}-${sec.id}-b${i}`, title: `Séance ${s.num} — ${sec.title}`, text, n: norm(text + ' ' + sec.title) });
  })));
  LEXIQUE.forEach((l) => INDEX.push({ kind: 'Lexique', route: 'fiches-lexique', title: l.t, text: strip(l.d), n: norm(l.t + ' ' + strip(l.d)) }));
  FLASHCARDS.forEach((f) => INDEX.push({ kind: 'Flashcard', route: 'flashcards', title: f.q, text: strip(f.a), n: norm(f.q + ' ' + strip(f.a)) }));
  QUESTIONS.forEach((q) => INDEX.push({ kind: 'Question de cours', route: `questions-${q.id}`, title: q.q, text: strip(q.model), n: norm(q.q + ' ' + strip(q.model)) }));
  METHODE.steps.forEach((st) => INDEX.push({ kind: 'Méthode', route: 'methode', anchor: 'm-' + st.id, title: st.title, text: strip(st.what), n: norm(st.title + ' ' + strip(st.what) + ' ' + st.ask.join(' ')) }));
  CAS.forEach((c) => INDEX.push({ kind: 'Cas pratique', route: `cas-${c.id}`, title: c.title, text: strip(c.pitch), n: norm(c.title + ' ' + strip(c.pitch) + ' ' + c.context) }));
}
export function search(q) {
  if (!INDEX) buildIndex();
  const terms = norm(q).split(/\s+/).filter((t) => t.length > 1);
  if (!terms.length) return [];
  return INDEX.map((e) => {
    let score = 0;
    for (const t of terms) { const k = e.n.split(t).length - 1; if (!k) return null; score += k; }
    if (e.kind === 'Cours' || e.kind === 'Lexique') score += 2;
    if (norm(e.title).includes(terms[0])) score += 3;
    return { ...e, score };
  }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 60);
}
export function snippet(text, q, len = 190) {
  const terms = norm(q).split(/\s+/).filter((t) => t.length > 1);
  const n = norm(text);
  let pos = terms.length ? n.indexOf(terms[0]) : 0;
  if (pos < 0) pos = 0;
  const start = Math.max(0, pos - 60);
  let s = text.slice(start, start + len);
  if (start > 0) s = '…' + s;
  if (start + len < text.length) s += '…';
  return s;
}
export function highlight(escaped, q) {
  const terms = norm(q).split(/\s+/).filter((t) => t.length > 2);
  if (!terms.length) return escaped;
  // surligne sans tenir compte des accents
  let out = '', i = 0;
  const n = norm(escaped);
  while (i < escaped.length) {
    let hit = null;
    for (const t of terms) if (n.startsWith(t, i)) { hit = t; break; }
    if (hit) { out += '<mark>' + escaped.slice(i, i + hit.length) + '</mark>'; i += hit.length; } else { out += escaped[i]; i++; }
  }
  return out;
}

// ───────── Répétition espacée (Leitner : 0, 1, 3, 7, 15, 30 jours)
export const INTERVALS = [0, 1, 3, 7, 15, 30];
const DAY = 86400000;
export function rateCard(id, known) {
  const c = state.cards[id] || { box: 0, seen: 0, known: 0, wrong: 0 };
  c.seen++; c.lastAt = Date.now();
  if (known) { c.known++; c.box = Math.min((c.box || 0) + 1, 5); c.due = Date.now() + INTERVALS[c.box] * DAY; }
  else { c.wrong++; c.box = 0; c.due = Date.now(); }
  c.last = known;
  state.cards[id] = c;
}
export const isMastered = (id) => { const c = state.cards[id]; return !!(c && c.last && c.box >= 1); };
export const isToReview = (id) => { const c = state.cards[id]; return !!(c && !c.last); };
export const isDue = (id) => { const c = state.cards[id]; return !c || (c.due || 0) <= Date.now(); };
export function orderDeck(ids) {
  const rank = (id) => { const c = state.cards[id]; if (!c) return 1; if (!c.last) return 0; if ((c.due || 0) <= Date.now()) return 2; return 3 + c.box; };
  const groups = {};
  ids.forEach((id) => { const r = rank(id); (groups[r] = groups[r] || []).push(id); });
  return Object.keys(groups).sort((a, b) => a - b).flatMap((k) => groups[k].sort(() => Math.random() - 0.5));
}

// ───────── Indicateurs par séance
export function seanceStats(sid) {
  const s = SE[sid];
  const seen = (state.seances[sid] && state.seances[sid].seen) || {};
  const sectionsSeen = s ? s.sections.filter((x) => seen[x.id]).length : 0;
  const cards = FLASHCARDS.filter((f) => f.s === sid);
  const mastered = cards.filter((f) => isMastered(f.id)).length;
  const toReview = cards.filter((f) => isToReview(f.id)).length;
  const qs = QCM.filter((q) => q.s === sid);
  const answered = qs.filter((q) => state.qcm[q.id]);
  const qOk = answered.filter((q) => state.qcm[q.id].last).length;
  const qc = QUESTIONS.filter((q) => q.s === sid && state.questions[q.id] && state.questions[q.id].score != null);
  const qcAvg = qc.length ? qc.reduce((a, q) => a + state.questions[q.id].score, 0) / qc.length : null;
  const ex = EXERCICES.filter((x) => x.s === sid && state.drills[x.id]);
  const exAvg = ex.length ? ex.reduce((a, x) => a + (state.drills[x.id].best || 0), 0) / ex.length : null;
  const parts = [];
  if (cards.length && (mastered + toReview)) parts.push(mastered / cards.length);
  if (answered.length) parts.push(qOk / answered.length);
  if (qcAvg != null) parts.push(qcAvg);
  if (exAvg != null) parts.push(exAvg);
  const mastery = parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : null;
  return {
    studied: !!(state.seances[sid] && state.seances[sid].studied),
    sections: s ? s.sections.length : 0, sectionsSeen,
    cards: cards.length, mastered, toReview,
    qcmTotal: qs.length, qcmAnswered: answered.length, qcmOk: qOk,
    mastery,
  };
}

export function caseProgress(c) {
  const d = state.cases[c.id];
  if (!d || !d.camp) return { started: false, done: 0, total: 0, revealed: false };
  const steps = c.steps.filter((st) => !st.camp || st.camp === d.camp);
  const done = steps.filter((st) => d.steps && d.steps[st.id] && d.steps[st.id].shown).length;
  return { started: true, camp: d.camp, done, total: steps.length, revealed: !!d.revealed };
}

export function globalStats() {
  const studied = SEANCES.filter((s) => state.seances[s.id] && state.seances[s.id].studied).length;
  const mastered = FLASHCARDS.filter((f) => isMastered(f.id)).length;
  const toReview = FLASHCARDS.filter((f) => isToReview(f.id)).length;
  const due = FLASHCARDS.filter((f) => state.cards[f.id] && isDue(f.id)).length;
  const answered = QCM.filter((q) => state.qcm[q.id]);
  const qOk = answered.filter((q) => state.qcm[q.id].last).length;
  const qDone = QUESTIONS.filter((q) => state.questions[q.id] && state.questions[q.id].score != null).length;
  const exDone = EXERCICES.filter((x) => state.drills[x.id]).length;
  const exAvg = exDone ? EXERCICES.filter((x) => state.drills[x.id]).reduce((a, x) => a + state.drills[x.id].best, 0) / exDone : null;
  const simDone = SIMS.filter((s) => state.sims[s.id]).length;
  const casStarted = CAS.filter((c) => caseProgress(c).started).length;
  const casDone = CAS.filter((c) => { const p = caseProgress(c); return p.started && p.done >= p.total && p.total > 0; }).length;
  const progress = Math.round(100 * (
    0.25 * (studied / SEANCES.length) + 0.2 * (mastered / FLASHCARDS.length) + 0.2 * (answered.length ? qOk / QCM.length : 0)
    + 0.15 * (exDone / EXERCICES.length) + 0.1 * (qDone / QUESTIONS.length) + 0.1 * (casDone / CAS.length)));
  return { studied, mastered, toReview, due, qcmAnswered: answered.length, qcmOk: qOk, qDone, exDone, exAvg, simDone, casStarted, casDone, progress };
}

export function weakSeances(n = 2) {
  const rows = SEANCES.map((s) => ({ id: s.id, s: seanceStats(s.id) }));
  const score = (r) => (r.s.mastery == null ? (r.s.studied ? 0.45 : 0.3) : r.s.mastery - 0.04 * r.s.toReview);
  return rows.sort((a, b) => score(a) - score(b)).slice(0, n).map((r) => ({ ...r, score: score(r) }));
}

export function daysLeft() {
  if (!state.examDate) return null;
  const d = new Date(state.examDate + 'T08:00:00');
  if (isNaN(d)) return null;
  return Math.ceil((d - Date.now()) / DAY);
}
