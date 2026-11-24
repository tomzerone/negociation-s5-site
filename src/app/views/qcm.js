import { state, save, logSession } from '../store.js';
import { QCM, SEANCES, SE, TAGS, tagLabel } from '../data.js';
import { esc, icon, shuffle, pct, bar, $, $$, fr } from '../ui.js';

const FILTERS = () => [...SEANCES.map((s) => ({ id: s.id, label: `Séance ${s.num}`, color: s.color })), { id: 'cas', label: 'Cas MarketOne', color: 'l5' }, { id: 'x', label: 'Transversal', color: 'l5' }];
let picked = new Set(['s1', 's2', 's3', 's4', 'cas', 'x']);
let count = 15, mode = 'smart';
let run = null; // { ids, i, answers: {id: {ok, chosen:[]}}, label, order: {id: [optIdx]} }

function poolFor(filters) { return QCM.filter((q) => filters.has(q.s)); }

function setup(prefill) {
  if (prefill) picked = new Set([prefill]);
  const pool = poolFor(picked);
  const wrong = pool.filter((q) => state.qcm[q.id] && !state.qcm[q.id].last).length;
  const fresh = pool.filter((q) => !state.qcm[q.id]).length;
  const stats = FILTERS().map((f) => {
    const qs = QCM.filter((q) => q.s === f.id);
    const ans = qs.filter((q) => state.qcm[q.id]);
    const ok = ans.filter((q) => state.qcm[q.id].last).length;
    return `<li><span><span class="pill c ${f.color}">${esc(f.label)}</span> ${qs.length} questions</span><strong>${ans.length ? pct(ok, ans.length) + ' %' : '—'}</strong><em>${ans.length}/${qs.length} vues${ans.length - ok ? ` · ${ans.length - ok} erreur${ans.length - ok > 1 ? 's' : ''} à revoir` : ''}</em></li>`;
  }).join('');
  return `<header class="page-h"><h1>QCM</h1><p class="lead">${QCM.length} questions à réponse unique, multiple ou vrai/faux. Chaque proposition est expliquée, qu’elle soit juste ou fausse.</p></header>
  <div class="two">
    <div class="setup panel">
      <div><h2>Séances</h2><div class="chips" style="margin:0">${FILTERS().map((f) => `<button class="chip ${f.color} ${picked.has(f.id) ? 'on' : ''}" data-f="${f.id}"><span class="dot"></span>${esc(f.label)}</button>`).join('')}</div></div>
      <div><h2>Nombre de questions</h2><div class="seg" role="group">${[10, 15, 25, 0].map((n) => `<button data-n="${n}" class="${count === n ? 'on' : ''}">${n || 'Toutes'}</button>`).join('')}</div></div>
      <div><h2>Sélection</h2><div class="seg" role="group">
        <button data-m="smart" class="${mode === 'smart' ? 'on' : ''}">Erreurs et nouvelles d’abord</button>
        <button data-m="random" class="${mode === 'random' ? 'on' : ''}">Au hasard</button>
        <button data-m="wrong" class="${mode === 'wrong' ? 'on' : ''}" ${wrong ? '' : 'disabled'}>Mes erreurs (${wrong})</button>
      </div></div>
      <p class="muted small" id="pool-info">${pool.length} questions dans la sélection · ${fresh} jamais vues · ${wrong} ratées la dernière fois.</p>
      <div><button class="btn primary" id="start" ${pool.length ? '' : 'disabled'}>${icon('play')} Commencer</button></div>
    </div>
    <section class="panel"><h2>Tes résultats par séance</h2><ul class="rows">${stats}</ul></section>
  </div>`;
}

function build(label) {
  let pool = poolFor(picked);
  if (mode === 'wrong') pool = pool.filter((q) => state.qcm[q.id] && !state.qcm[q.id].last);
  let ordered;
  if (mode === 'smart') {
    const rank = (q) => { const s = state.qcm[q.id]; return !s ? 1 : !s.last ? 0 : 2 + (s.ok || 0); };
    ordered = shuffle(pool).sort((a, b) => rank(a) - rank(b));
  } else ordered = shuffle(pool);
  const ids = (count ? ordered.slice(0, count) : ordered).map((q) => q.id);
  const order = {};
  ids.forEach((id) => { const q = QCM.find((x) => x.id === id); order[id] = q.t === 'tf' ? q.o.map((_, i) => i) : shuffle(q.o.map((_, i) => i)); });
  run = { ids, i: 0, answers: {}, order, label: label || [...picked].map((p) => p.startsWith('s') ? 'S' + p.slice(1) : p === 'cas' ? 'Cas' : 'Transv.').join(' + ') };
}

function questionHtml() {
  const id = run.ids[run.i];
  const q = QCM.find((x) => x.id === id);
  const color = SE[q.s] ? SE[q.s].color : 'l5';
  const ans = run.answers[id];
  const multi = q.t === 'multi';
  const opts = run.order[id].map((oi) => {
    const [txt, ok, why] = q.o[oi];
    let cls = '';
    const chosen = ans ? ans.chosen.includes(oi) : false;
    if (ans) cls = ok && chosen ? 'right' : !ok && chosen ? 'wrong' : ok ? 'missed' : '';
    return `<li><button class="opt ${multi ? 'sq' : ''} ${cls}" data-o="${oi}" aria-pressed="${chosen}" ${ans ? 'disabled' : ''}><span class="mk">${ans ? (ok ? '✓' : chosen ? '✕' : '') : ''}</span><span>${esc(txt)}${ans && (chosen || ok) ? `<span class="why"><b>${ok ? 'Juste' : 'Faux'}.</b> ${esc(why)}</span>` : ''}</span></button></li>`;
  }).join('');
  const right = ans && ans.ok;
  return `<div class="q-card ${color}">
    <div class="q-k"><span class="pill c">${esc(tagLabel(q.s))}</span><span>Question ${run.i + 1}/${run.ids.length}</span><span>${q.t === 'multi' ? 'Plusieurs réponses possibles' : q.t === 'tf' ? 'Vrai ou faux' : 'Une seule réponse'}</span></div>
    <div class="q-t">${esc(q.q)}</div>
    <ul class="opts">${opts}</ul>
    ${ans ? `<div class="verdict ${right ? 'ok' : 'ko'}">${icon(right ? 'check' : 'x')} ${right ? 'Bonne réponse' : 'Réponse incorrecte'}</div>${q.x ? `<div class="expl">${esc(q.x)}</div>` : ''}` : ''}
  </div>
  <div class="q-nav">
    <span class="muted small">${Object.values(run.answers).filter((a) => a.ok).length} bonne${Object.values(run.answers).filter((a) => a.ok).length > 1 ? 's' : ''} réponse${Object.values(run.answers).filter((a) => a.ok).length > 1 ? 's' : ''} sur ${Object.keys(run.answers).length}</span>
    ${ans ? `<button class="btn primary" id="next">${run.i + 1 < run.ids.length ? 'Question suivante' : 'Voir mon résultat'} ${icon('right')}</button>` : multi ? `<button class="btn primary" id="validate">Valider</button>` : ''}
  </div>`;
}

function resultHtml() {
  const total = run.ids.length;
  const ok = run.ids.filter((id) => run.answers[id] && run.answers[id].ok).length;
  const wrongs = run.ids.filter((id) => run.answers[id] && !run.answers[id].ok);
  return `<div class="result-h"><p class="score-big">${ok}<small>/${total}</small></p><div><h2>${ok === total ? 'Sans faute !' : ok >= total * 0.7 ? 'Bon résultat' : 'À retravailler'}</h2><p class="muted">${pct(ok, total)} % de bonnes réponses — ${esc(run.label)}</p>${bar(pct(ok, total))}</div></div>
  ${wrongs.length ? `<section class="panel"><h2>Questions ratées</h2><ul class="rows">${wrongs.map((id) => { const q = QCM.find((x) => x.id === id); const good = q.o.filter((o) => o[1]).map((o) => o[0]); return `<li><span><strong>${esc(q.q)}</strong><br><span class="muted small">Réponse : ${esc(good.join(' · '))}</span></span><em>${esc(tagLabel(q.s))}</em></li>`; }).join('')}</ul></section>` : ''}
  <div class="row-btns">${wrongs.length ? '<button class="btn primary" id="redo">Refaire mes erreurs</button>' : ''}<button class="btn" id="again">Nouveau QCM</button><a class="btn" href="#flashcards-review">Flashcards à revoir</a></div>`;
}

export function render(param) {
  run = null;
  const pre = param && (SE[param] || TAGS[param]) ? param : null;
  return { html: setup(pre), title: 'QCM', resume: 'QCM' };
}

export function mount(root, param) {
  logSession('qcm', 'QCM');
  const draw = (html) => { root.innerHTML = fr(html); };
  const showQ = () => { draw(`<a href="#qcm" class="back">${icon('left')} Quitter le QCM</a>` + questionHtml()); const t = $('.q-t', root); if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); } window.scrollTo(0, 0); };
  const finish = () => {
    const total = run.ids.length, ok = run.ids.filter((id) => run.answers[id] && run.answers[id].ok).length;
    state.qcmRuns.unshift({ at: Date.now(), label: run.label, score: ok, total });
    state.qcmRuns = state.qcmRuns.slice(0, 30); save();
    draw(`<a href="#qcm" class="back">${icon('left')} QCM</a><header class="page-h"><h1>Résultat</h1></header>` + resultHtml()); window.scrollTo(0, 0);
  };
  const record = (q, chosen) => {
    const good = q.o.map((o, i) => (o[1] ? i : -1)).filter((i) => i >= 0);
    const ok = good.length === chosen.length && good.every((g) => chosen.includes(g));
    run.answers[q.id] = { ok, chosen };
    const s = state.qcm[q.id] || { ok: 0, ko: 0 };
    if (ok) s.ok++; else s.ko++;
    s.last = ok; s.at = Date.now();
    state.qcm[q.id] = s; save();
    showQ();
  };
  root.addEventListener('click', (e) => {
    const f = e.target.closest('[data-f]');
    if (f) { const id = f.dataset.f; if (picked.has(id) && picked.size > 1) picked.delete(id); else picked.add(id); draw(setup()); return; }
    const n = e.target.closest('[data-n]'); if (n) { count = +n.dataset.n; draw(setup()); return; }
    const m = e.target.closest('[data-m]'); if (m && !m.disabled) { mode = m.dataset.m; draw(setup()); return; }
    if (e.target.closest('#start')) { build(); if (run.ids.length) showQ(); return; }
    const o = e.target.closest('[data-o]');
    if (o && run && !o.disabled) {
      const q = QCM.find((x) => x.id === run.ids[run.i]);
      if (q.t === 'multi') { o.setAttribute('aria-pressed', o.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); return; }
      record(q, [+o.dataset.o]); return;
    }
    if (e.target.closest('#validate')) {
      const q = QCM.find((x) => x.id === run.ids[run.i]);
      const chosen = $$('.opt[aria-pressed="true"]', root).map((b) => +b.dataset.o);
      if (!chosen.length) return;
      record(q, chosen); return;
    }
    if (e.target.closest('#next')) { if (run.i + 1 < run.ids.length) { run.i++; showQ(); } else finish(); return; }
    if (e.target.closest('#redo')) {
      const wrongs = run.ids.filter((id) => run.answers[id] && !run.answers[id].ok);
      const order = {}; wrongs.forEach((id) => { order[id] = run.order[id]; });
      run = { ids: shuffle(wrongs), i: 0, answers: {}, order, label: 'Erreurs — ' + run.label }; showQ(); return;
    }
    if (e.target.closest('#again')) { run = null; draw(setup()); }
  });
  if (param && (SE[param] || TAGS[param]) && location.hash.includes('qcm-')) { /* filtre pré-rempli : l’utilisateur lance quand il veut */ }
}
