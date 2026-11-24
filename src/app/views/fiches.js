import { state, save, logSession } from '../store.js';
import { SEANCES, SE, FICHES, TRANSVERSALE, LEXIQUE, CORRESPONDANCES, tagLabel } from '../data.js';
import { esc, icon, roundel, table, $, $$, fr } from '../ui.js';

const LIST = () => [
  ...SEANCES.map((s) => ({ id: s.id, title: `Séance ${s.num} — ${s.short}`, color: s.color, r: roundel(s.id, s.num), d: s.title })),
  { id: 'cas', title: 'Cas MarketOne / TempoRun', color: 'l5', r: roundel('cas', 'C'), d: 'Les chiffres et consignes du cas du cours' },
  { id: 'transversale', title: 'Fiche transversale', color: 'l5', r: roundel('x', '+'), d: 'Les contextes comparés et la boîte à outils commune' },
  { id: 'lexique', title: 'Lexique', color: 'l5', r: roundel('x', 'A'), d: `${LEXIQUE.length} notions définies avec les mots du cours` },
];

function list() {
  return `<header class="page-h"><h1>Fiches et lexique</h1><p class="lead">Pour chaque séance, une fiche complète (par rubriques) et une fiche express (dix phrases à savoir par cœur). La fiche transversale relie les séances ; le lexique définit chaque notion avec les mots du cours.</p></header>
  <div class="decks">${LIST().map((f) => `<a class="deck ${f.color}" href="#fiches-${f.id}"><span style="display:flex;gap:10px;align-items:center">${f.r}<strong>${esc(f.title)}</strong></span><span>${esc(f.d)}</span></a>`).join('')}</div>`;
}

function ficheView(id, mode) {
  const f = FICHES[id];
  const s = SE[id];
  const color = s ? s.color : 'l5';
  const title = s ? `Séance ${s.num} — ${s.title}` : f.title;
  const nav = LIST().map((x) => `<a class="chip ${x.id === id ? 'on' : ''}" href="#fiches-${x.id}">${esc(x.id === 'transversale' ? 'Transversale' : x.id === 'lexique' ? 'Lexique' : x.id === 'cas' ? 'Cas' : 'Séance ' + SE[x.id].num)}</a>`).join('');
  const body = mode === 'express'
    ? `<ol class="express">${f.express.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>`
    : f.rubriques.map(([h, b]) => `<div class="f-rub"><h3>${esc(h)}</h3><div>${b}</div></div>`).join('');
  return {
    html: `<a href="#fiches" class="back">${icon('left')} Toutes les fiches</a>
    <nav class="chips" aria-label="Fiches">${nav}</nav>
    <article class="fiche ${color}">
      <header class="fiche-h">${s ? roundel(s.id, s.num) : roundel('cas', 'C')}<h1 style="font-size:1.45rem;margin:0">${esc(title)}</h1></header>
      <div class="row-btns" style="margin:10px 0 4px"><div class="seg" role="group" aria-label="Format"><button data-mode="complete" class="${mode !== 'express' ? 'on' : ''}">Fiche complète</button><button data-mode="express" class="${mode === 'express' ? 'on' : ''}">Fiche express</button></div></div>
      ${body}
    </article>
    <div class="train">${s ? `<a class="btn small" href="#cours-${id}">${icon('book')} Relire le cours</a><a class="btn small" href="#flashcards-${id}">${icon('cards')} Flashcards</a><a class="btn small" href="#qcm-${id}">${icon('check')} QCM</a>` : `<a class="btn small" href="#cas-marketone">${icon('case')} Ouvrir le cas</a><a class="btn small" href="#flashcards-cas">${icon('cards')} Flashcards du cas</a>`}</div>`,
    title: s ? `Fiche — Séance ${s.num}` : 'Fiche — Cas MarketOne / TempoRun',
    resume: s ? `Fiche — Séance ${s.num} : ${s.short}` : 'Fiche du cas MarketOne / TempoRun',
  };
}

function transversale() {
  const T = TRANSVERSALE;
  const x = CORRESPONDANCES.map((c) => `<li><span><strong>${esc(c.label)}</strong> — ${esc(c.text)}</span></li>`).join('');
  return {
    html: `<a href="#fiches" class="back">${icon('left')} Toutes les fiches</a>
    <header class="page-h"><h1>Fiche transversale</h1><p class="lead">${esc(T.intro)}</p></header>
    <h2>Trois contextes comparés</h2>
    ${table(T.contextes.head, T.contextes.rows)}
    <h2>La boîte à outils commune</h2>
    <div class="tbl-wrap"><table class="stack"><thead><tr><th>Outil</th><th>Contenu</th></tr></thead><tbody>${T.outils.map(([a, b]) => `<tr><th scope="row">${esc(a)}</th><td data-label="Contenu">${esc(b)}</td></tr>`).join('')}</tbody></table></div>
    <section class="panel" id="correspondances"><h2>Les correspondances entre séances</h2><ul class="rows">${x}</ul></section>`,
    title: 'Fiche transversale', resume: 'Fiche transversale',
  };
}

function lexique() {
  const sorted = LEXIQUE.slice().sort((a, b) => a.t.localeCompare(b.t, 'fr'));
  const letters = [...new Set(sorted.map((l) => l.t[0].toUpperCase().normalize('NFD')[0]))];
  const items = sorted.map((l) => {
    const L = l.t[0].toUpperCase().normalize('NFD')[0];
    return `<div class="lex-i" data-l="${L}" data-n="${esc((l.t + ' ' + l.d).toLowerCase())}"><dt>${esc(l.t)} <span class="pill">${esc(tagLabel(l.s))}</span></dt><dd>${esc(l.d)}${l.note ? ` <span class="muted">(${esc(l.note)})</span>` : ''}</dd></div>`;
  }).join('');
  return {
    html: `<a href="#fiches" class="back">${icon('left')} Toutes les fiches</a>
    <header class="page-h"><h1>Lexique</h1><p class="lead">${LEXIQUE.length} notions du module, définies avec les mots du cours.</p></header>
    <div class="lex-filter"><label class="sr" for="lexq">Filtrer le lexique</label><input type="search" id="lexq" placeholder="Filtrer (ex. BATNA, référencement…)"></div>
    <nav class="lex-letters" aria-label="Lettres">${letters.map((L) => `<a href="#fiches-lexique" data-go="${L}">${L}</a>`).join('')}</nav>
    <dl class="lex">${items}</dl>`,
    title: 'Lexique', resume: 'Lexique',
  };
}

let mode = 'complete';
export function render(param) {
  if (!param) return { html: list(), title: 'Fiches et lexique', resume: 'Fiches et lexique' };
  if (param === 'transversale') return transversale();
  if (param === 'lexique') return lexique();
  if (FICHES[param]) return ficheView(param, mode);
  return { html: list(), title: 'Fiches et lexique' };
}

export function mount(root, param) {
  if (!param) return;
  logSession('fiches', param === 'lexique' ? 'Lexique' : param === 'transversale' ? 'Fiche transversale' : 'Fiches');
  if (SE[param]) { const d = (state.seances[param] = state.seances[param] || { seen: {} }); if (!d.fiche) { d.fiche = Date.now(); save(); } }
  root.addEventListener('click', (e) => {
    const m = e.target.closest('[data-mode]');
    if (m) { mode = m.dataset.mode; const out = ficheView(param, mode); root.innerHTML = fr(out.html); return; }
    const g = e.target.closest('[data-go]');
    if (g) { e.preventDefault(); const el = root.querySelector(`.lex-i[data-l="${g.dataset.go}"]`); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
  const q = $('#lexq', root);
  if (q) q.addEventListener('input', () => {
    const v = q.value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    $$('.lex-i', root).forEach((el) => { el.hidden = !!v && !el.dataset.n.normalize('NFD').replace(/[̀-ͯ]/g, '').includes(v); });
  });
}
