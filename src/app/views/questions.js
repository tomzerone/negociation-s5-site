import { state, save, logSession } from '../store.js';
import { QUESTIONS, SEANCES, SE, tagLabel } from '../data.js';
import { esc, icon, pct, fr } from '../ui.js';
import { answerArea, aiResultHtml, wireAnswers } from './answer.js';

let fS = 'all', fT = 'all';
const FS = () => [{ id: 'all', label: 'Toutes' }, ...SEANCES.map((s) => ({ id: s.id, label: 'Séance ' + s.num })), { id: 'x', label: 'Transversales' }];
const filtered = () => QUESTIONS.filter((q) => (fS === 'all' || q.s === fS) && (fT === 'all' || q.type === fT));

function status(q) {
  const d = state.questions[q.id];
  if (d && d.score != null) return `<span class="pill ${d.score >= 0.7 ? 'ok' : d.score >= 0.4 ? 'mid' : 'ko'}">${pct(d.score * 100, 100)} %</span>`;
  if (d && d.answer) return '<span class="pill">Brouillon</span>';
  return '<span class="pill">À faire</span>';
}

function list() {
  const qs = filtered();
  const done = QUESTIONS.filter((q) => state.questions[q.id] && state.questions[q.id].score != null).length;
  return `<header class="page-h"><h1>Questions de cours</h1><p class="lead">${QUESTIONS.length} questions comme au contrôle : des <strong>factuelles</strong> (restituer le cours avec précision) et des <strong>ouvertes</strong> (expliquer, argumenter, appliquer à une situation). Rédige, compare à la réponse modèle, puis coche les éléments attendus que tu as vraiment traités.</p></header>
  <div class="note">${icon('info')}<p>L’évaluation annoncée en cours comprend des questions factuelles « dont la réponse commence par l’analyse de la situation et la question de savoir comment on résoudrait le problème ». Les réponses modèles des questions ouvertes suivent cette structure : analyse → solution → nuances.</p></div>
  <div class="chips">${FS().map((f) => `<button class="chip ${fS === f.id ? 'on' : ''}" data-fs="${f.id}">${esc(f.label)}</button>`).join('')}</div>
  <div class="row-btns" style="margin-top:-10px"><div class="seg" role="group" aria-label="Type">${[['all', 'Tous types'], ['factuelle', 'Factuelles'], ['ouverte', 'Ouvertes']].map(([id, l]) => `<button data-ft="${id}" class="${fT === id ? 'on' : ''}">${l}</button>`).join('')}</div><span class="muted small">${done}/${QUESTIONS.length} évaluées</span></div>
  <div class="qlist">${qs.map((q) => `<a class="qrow" href="#questions-${q.id}"><span class="pill ${SE[q.s] ? SE[q.s].color + ' c' : ''}">${esc(SE[q.s] ? 'S' + SE[q.s].num : 'Transv.')} · ${q.type === 'ouverte' ? 'Ouverte' : 'Factuelle'}</span><strong>${esc(q.q)}</strong>${status(q)}</a>`).join('')}</div>`;
}

function one(q) {
  const d = state.questions[q.id] || {};
  const qs = filtered().length && filtered().includes(q) ? filtered() : QUESTIONS;
  const i = qs.indexOf(q);
  const prev = qs[i - 1], next = qs[i + 1];
  return `<a href="#questions" class="back">${icon('left')} Toutes les questions</a>
  <div class="item ${SE[q.s] ? SE[q.s].color : 'l5'}">
    <div class="item-k"><span class="pill c">${esc(tagLabel(q.s))}</span><span>${q.type === 'ouverte' ? 'Question ouverte — expliquer, argumenter, appliquer' : 'Question factuelle — restituer avec précision'}</span><span>${i + 1}/${qs.length}</span></div>
    <h1 class="item-p" style="font-size:1.25rem;font-weight:800">${esc(q.q)}</h1>
    ${answerArea(q.id, d.answer, q.type === 'ouverte' ? 'Commence par analyser la situation (contexte, notions en jeu), puis explique et argumente avec un exemple du cours…' : 'Restitue le cours avec précision : définitions, listes, exemples…')}
    ${d.by === 'ai' && d.ai ? aiResultHtml(d.ai, q.keys) : d.score != null ? `<p class="muted small" style="margin-top:10px">Dernière évaluation : ${pct(d.score * 100, 100)} % (${d.by === 'ai' ? 'Claude' : 'auto-évaluation'}).</p>` : ''}
  </div>
  <div class="pn">
    ${prev ? `<a class="pn-a" href="#questions-${prev.id}">${icon('left')}<span><em>Question précédente</em>${esc(prev.q.slice(0, 70))}${prev.q.length > 70 ? '…' : ''}</span></a>` : '<span></span>'}
    ${next ? `<a class="pn-a r" href="#questions-${next.id}"><span><em>Question suivante</em>${esc(next.q.slice(0, 70))}${next.q.length > 70 ? '…' : ''}</span>${icon('right')}</a>` : ''}
  </div>`;
}

export function render(param) {
  const q = param && QUESTIONS.find((x) => x.id === param);
  if (q) return { html: one(q), title: 'Question de cours', resume: 'Question de cours — ' + q.q.slice(0, 60), noFocus: false };
  return { html: list(), title: 'Questions de cours', resume: 'Questions de cours' };
}

export function mount(root, param) {
  const q = param && QUESTIONS.find((x) => x.id === param);
  if (!q) {
    root.addEventListener('click', (e) => {
      const a = e.target.closest('[data-fs]'); if (a) { fS = a.dataset.fs; root.innerHTML = fr(list()); return; }
      const b = e.target.closest('[data-ft]'); if (b) { fT = b.dataset.ft; root.innerHTML = fr(list()); }
    });
    return;
  }
  logSession('questions', 'Questions de cours');
  wireAnswers(root, {
    get: () => state.questions[q.id] || {},
    set: (_k, patch) => { state.questions[q.id] = Object.assign(state.questions[q.id] || {}, patch); save(); },
    item: () => ({ question: q.q, keys: q.keys, model: q.model, pitfalls: q.pitfalls, seances: SE[q.s] ? [q.s] : null }),
  });
}
