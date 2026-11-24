import { state, save, logSession } from '../store.js';
import { EXERCICES, SE, tagLabel } from '../data.js';
import { esc, icon, shuffle, pct, bar, parseNum, num, $, $$, fr } from '../ui.js';

const colorOf = (s) => (SE[s] ? SE[s].color : 'l5');
let run = null; // { ex, i, scores: [], ui: {} }

function list() {
  const cards = EXERCICES.map((x) => {
    const d = state.drills[x.id];
    return `<a class="ex-card ${colorOf(x.s)}" href="#exercices-${x.id}">
      <span class="ex-m"><span class="pill c">${esc(tagLabel(x.s))}</span><span>${esc(x.kind)}</span><span>${x.items.length} item${x.items.length > 1 ? 's' : ''}</span></span>
      <strong>${esc(x.title)}</strong><p>${esc(x.intro)}</p>
      <span class="ex-m">${d ? `Meilleur score ${pct(d.best * 100, 100)} % · dernier ${pct(d.last * 100, 100)} %` : 'Pas encore fait'}</span>
      ${d ? bar(d.best * 100) : ''}
    </a>`;
  }).join('');
  return `<header class="page-h"><h1>Exercices d’application</h1><p class="lead">Des entraînements courts et corrigés pour <strong>appliquer</strong> le cours : identifier un contexte, trier l’information, évaluer un rapport de force, transformer une concession, calculer une contribution… Chaque réponse est expliquée.</p></header>
  <div class="ex-grid">${cards}</div>`;
}

function dots() {
  return `<div class="ex-dots" aria-hidden="true">${run.ex.items.map((_, i) => `<i class="${i < run.scores.length ? (run.scores[i] >= 0.999 ? 'ok' : 'ko') : i === run.i ? 'cur' : ''}"></i>`).join('')}</div>`;
}

function itemHtml() {
  const it = run.ex.items[run.i];
  const u = run.ui;
  const done = run.scores.length > run.i;
  let body = '';
  if (it.type === 'single' || it.type === 'multi') {
    if (!u.order) u.order = it.options.map((_, i) => i);
    const good = it.type === 'single' ? [it.answer] : it.answers;
    body = `<ul class="opts">${u.order.map((oi) => {
      const chosen = (u.chosen || []).includes(oi);
      const cls = done ? (good.includes(oi) && chosen ? 'right' : !good.includes(oi) && chosen ? 'wrong' : good.includes(oi) ? 'missed' : '') : '';
      return `<li><button class="opt ${it.type === 'multi' ? 'sq' : ''} ${cls}" data-o="${oi}" aria-pressed="${chosen}" ${done ? 'disabled' : ''}><span class="mk">${done ? (good.includes(oi) ? '✓' : chosen ? '✕' : '') : ''}</span><span>${esc(it.options[oi])}</span></button></li>`;
    }).join('')}</ul>`;
  } else if (it.type === 'classify') {
    if (!u.order) u.order = shuffle(it.entries.map((_, i) => i));
    u.pick = u.pick || {};
    body = `<div class="cls">${u.order.map((ei) => {
      const [txt, cat, why] = it.entries[ei];
      const p = u.pick[ei];
      const cls = done ? (p === cat ? 'right' : 'wrong') : '';
      return `<div class="cls-row ${cls}"><div class="cls-t">${esc(txt)}</div><div class="cls-opts" role="group">${it.cats.map((c, ci) => `<button data-e="${ei}" data-c="${ci}" aria-pressed="${p === ci}" class="${done && ci === cat ? 'good' : ''}" ${done ? 'disabled' : ''}>${esc(c)}</button>`).join('')}</div>${done ? `<div class="cls-why">${p === cat ? '✓' : '✕ Réponse : <strong>' + esc(it.cats[cat]) + '</strong>.'} ${esc(why)}</div>` : ''}</div>`;
    }).join('')}</div>`;
  } else if (it.type === 'grid') {
    u.pick = u.pick || {};
    body = `<div class="gridq">${it.rows.map((r, ri) => {
      const p = u.pick[ri];
      const cls = done ? (p === r.answer ? 'right' : 'wrong') : '';
      return `<div class="cls-row ${cls}"><div class="gridq-row"><span>${esc(r.label)}</span><div class="cls-opts" role="group">${r.options.map((o, oi) => `<button data-r="${ri}" data-c="${oi}" aria-pressed="${p === oi}" class="${done && oi === r.answer ? 'good' : ''}" ${done ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div></div>${done ? `<div class="cls-why">${p === r.answer ? '✓' : '✕ Réponse : <strong>' + esc(r.options[r.answer]) + '</strong>.'} ${esc(r.why)}</div>` : ''}</div>`;
    }).join('')}</div>`;
  } else if (it.type === 'numeric') {
    const ok = done && run.scores[run.i] >= 0.999;
    body = `<div class="num-row"><label class="sr" for="numv">Ta réponse</label><input id="numv" type="text" inputmode="decimal" autocomplete="off" value="${esc(u.value || '')}" ${done ? 'disabled' : ''} placeholder="Ta réponse"><span class="unit">${esc(it.unit || '')}</span></div>
    ${done ? `<div class="verdict ${ok ? 'ok' : 'ko'}">${icon(ok ? 'check' : 'x')} ${ok ? 'Exact' : `Réponse attendue : ${num(it.answer)} ${esc(it.unit || '')}`}</div>` : ''}`;
  } else if (it.type === 'order') {
    if (!u.order) { let o; do { o = shuffle(it.steps.map((_, i) => i)); } while (o.every((v, i) => v === i) && it.steps.length > 1); u.order = o; }
    body = `<ol class="order">${u.order.map((si, pos) => `<li class="${done ? (si === pos ? 'right' : 'wrong') : ''}"><span class="n">${pos + 1}</span><span>${esc(it.steps[si])}</span><span class="mv">${done ? '' : `<button data-up="${pos}" aria-label="Monter" ${pos === 0 ? 'disabled' : ''}>${icon('up')}</button><button data-down="${pos}" aria-label="Descendre" ${pos === u.order.length - 1 ? 'disabled' : ''}>${icon('down')}</button>`}</span></li>`).join('')}</ol>
    ${done ? `<div class="expl"><strong>Ordre juste :</strong> ${it.steps.map(esc).join(' → ')}</div>` : ''}`;
  }
  const needValidate = !done && it.type !== 'single';
  const explain = done ? (it.type === 'numeric' ? `<div class="expl"><strong>Raisonnement :</strong> ${it.steps}</div>` : it.explain ? `<div class="expl">${it.explain}</div>` : '') : '';
  const verdict = done && ['single', 'multi'].includes(it.type) ? `<div class="verdict ${run.scores[run.i] >= 0.999 ? 'ok' : 'ko'}">${icon(run.scores[run.i] >= 0.999 ? 'check' : 'x')} ${run.scores[run.i] >= 0.999 ? 'Bonne réponse' : 'Réponse incorrecte'}</div>` : done && ['classify', 'grid', 'order'].includes(it.type) ? `<div class="verdict ${run.scores[run.i] >= 0.999 ? 'ok' : 'ko'}">${pct(run.scores[run.i] * 100, 100)} % de bonnes réponses</div>` : '';
  return `<a href="#exercices" class="back">${icon('left')} Tous les exercices</a>
  <header class="page-h" style="margin-bottom:12px"><div class="kicker"><span class="pill c ${colorOf(run.ex.s)}">${esc(tagLabel(run.ex.s))}</span>${esc(run.ex.kind)}</div><h1 style="font-size:1.7rem">${esc(run.ex.title)}</h1>${run.i === 0 && !done ? `<p class="lead" style="font-size:1rem">${esc(run.ex.intro)}</p>` : ''}</header>
  ${dots()}
  <div class="item ${colorOf(run.ex.s)}">
    <div class="item-k"><span>Item ${run.i + 1}/${run.ex.items.length}</span>${it.tag ? `<span class="pill">${esc(it.tag)}</span>` : ''}${it.type === 'multi' ? '<span>Plusieurs réponses possibles</span>' : ''}</div>
    ${it.scenario ? `<div class="scenario">${it.scenario}</div>` : ''}
    <div class="item-p">${esc(it.prompt)}</div>
    ${body}
    ${verdict}${explain}
  </div>
  <div class="q-nav">${needValidate ? '<button class="btn primary" id="validate">Valider</button>' : '<span></span>'}${done ? `<button class="btn primary" id="next">${run.i + 1 < run.ex.items.length ? 'Item suivant' : 'Voir mon résultat'} ${icon('right')}</button>` : ''}</div>`;
}

function score() {
  const it = run.ex.items[run.i], u = run.ui;
  if (it.type === 'single') return (u.chosen || [])[0] === it.answer ? 1 : 0;
  if (it.type === 'multi') { const c = (u.chosen || []).slice().sort().join(','); return c === it.answers.slice().sort().join(',') ? 1 : 0; }
  if (it.type === 'classify') return it.entries.filter((e, i) => u.pick[i] === e[1]).length / it.entries.length;
  if (it.type === 'grid') return it.rows.filter((r, i) => u.pick[i] === r.answer).length / it.rows.length;
  if (it.type === 'numeric') { const v = parseNum(u.value); return !isNaN(v) && Math.abs(v - it.answer) <= (it.tol || 0) + 1e-9 ? 1 : 0; }
  if (it.type === 'order') return u.order.filter((si, pos) => si === pos).length / u.order.length;
  return 0;
}

function resultHtml() {
  const avg = run.scores.reduce((a, b) => a + b, 0) / run.scores.length;
  const d = state.drills[run.ex.id];
  const next = EXERCICES[EXERCICES.indexOf(run.ex) + 1];
  return `<a href="#exercices" class="back">${icon('left')} Tous les exercices</a>
  <header class="page-h"><div class="kicker">${esc(run.ex.kind)}</div><h1>${esc(run.ex.title)} — résultat</h1></header>
  <div class="result-h"><p class="score-big">${pct(avg * 100, 100)}<small> %</small></p><div><h2>${avg >= 0.999 ? 'Parfait !' : avg >= 0.7 ? 'Bien joué' : 'À retravailler'}</h2><p class="muted">Meilleur score : ${pct(d.best * 100, 100)} % · ${d.runs} tentative${d.runs > 1 ? 's' : ''}</p>${bar(avg * 100)}</div></div>
  ${dots()}
  <div class="row-btns"><button class="btn primary" id="restart">${icon('refresh')} Recommencer</button>${next ? `<a class="btn" href="#exercices-${next.id}">Exercice suivant : ${esc(next.title)}</a>` : ''}<a class="btn" href="#exercices">Tous les exercices</a></div>`;
}

export function render(param) {
  const ex = param && EXERCICES.find((x) => x.id === param);
  if (!ex) { run = null; return { html: list(), title: 'Exercices d’application', resume: 'Exercices d’application' }; }
  run = { ex, i: 0, scores: [], ui: {} };
  return { html: itemHtml(), title: ex.title, resume: 'Exercice — ' + ex.title };
}

export function mount(root, param) {
  if (!run) return;
  logSession('exercices', 'Exercice — ' + run.ex.title);
  const draw = () => { root.innerHTML = fr(itemHtml()); };
  const validate = () => {
    const it = run.ex.items[run.i];
    if (it.type === 'numeric') { const inp = $('#numv', root); run.ui.value = inp ? inp.value : ''; if (isNaN(parseNum(run.ui.value))) { inp && inp.focus(); return; } }
    if (it.type === 'multi' && !(run.ui.chosen || []).length) return;
    run.scores[run.i] = score();
    draw();
  };
  root.addEventListener('click', (e) => {
    const it = run && run.ex.items[run.i];
    const o = e.target.closest('[data-o]');
    if (o && !o.disabled) {
      const oi = +o.dataset.o;
      if (it.type === 'single') { run.ui.chosen = [oi]; validate(); return; }
      const c = new Set(run.ui.chosen || []); c.has(oi) ? c.delete(oi) : c.add(oi); run.ui.chosen = [...c];
      o.setAttribute('aria-pressed', c.has(oi)); return;
    }
    const cb = e.target.closest('[data-c]');
    if (cb && !cb.disabled) {
      if (cb.dataset.e != null) { run.ui.pick[+cb.dataset.e] = +cb.dataset.c; $$(`[data-e="${cb.dataset.e}"]`, root).forEach((b) => b.setAttribute('aria-pressed', b === cb)); }
      else if (cb.dataset.r != null) { run.ui.pick[+cb.dataset.r] = +cb.dataset.c; $$(`[data-r="${cb.dataset.r}"]`, root).forEach((b) => b.setAttribute('aria-pressed', b === cb)); }
      return;
    }
    const up = e.target.closest('[data-up]'), down = e.target.closest('[data-down]');
    if (up || down) {
      const p = +(up ? up.dataset.up : down.dataset.down), q = up ? p - 1 : p + 1;
      const a = run.ui.order; [a[p], a[q]] = [a[q], a[p]];
      draw(); const btn = $(`[data-${up ? 'up' : 'down'}="${q}"]`, root) || $(`[data-${up ? 'down' : 'up'}="${q}"]`, root); if (btn) btn.focus(); return;
    }
    if (e.target.closest('#validate')) { validate(); return; }
    if (e.target.closest('#next')) {
      if (run.i + 1 < run.ex.items.length) { run.i++; run.ui = {}; draw(); window.scrollTo(0, 0); return; }
      const avg = run.scores.reduce((a, b) => a + b, 0) / run.scores.length;
      const d = state.drills[run.ex.id] || { best: 0, runs: 0 };
      d.best = Math.max(d.best || 0, avg); d.last = avg; d.at = Date.now(); d.runs = (d.runs || 0) + 1;
      state.drills[run.ex.id] = d; save();
      root.innerHTML = fr(resultHtml()); window.scrollTo(0, 0); return;
    }
    if (e.target.closest('#restart')) { run = { ex: run.ex, i: 0, scores: [], ui: {} }; draw(); window.scrollTo(0, 0); }
  });
  root.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.id === 'numv') { e.preventDefault(); validate(); } });
}
