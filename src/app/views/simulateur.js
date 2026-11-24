import { state, save, logSession } from '../store.js';
import { SIMS, SE, tagLabel } from '../data.js';
import { GAUGES } from '../../content/simulateur.js';
import { esc, icon, pct, bar, $, fr } from '../ui.js';

const colorOf = (s) => (SE[s] ? SE[s].color : 'l5');
let run = null; // { sim, i, log: [{node, choice}], g: [..], waiting }

function list() {
  return `<header class="page-h"><h1>Simulateur de négociation</h1><p class="lead">Tu es face à l’autre partie : à chaque étape, choisis ta réplique. Ton interlocuteur réagit, un coach t’explique ce que dit le cours, et quatre jauges suivent ta marge, la relation, la valeur créée et l’information obtenue.</p></header>
  <div class="ex-grid">${SIMS.map((s) => { const d = state.sims[s.id]; return `<a class="ex-card ${colorOf(s.s)}" href="#simulateur-${s.id}"><span class="ex-m"><span class="pill c">${esc(tagLabel(s.s))}</span><span>${s.nodes.length} étapes</span></span><strong>${esc(s.title)}</strong><p>${esc(s.role.replace(/<[^>]+>/g, '').slice(0, 170))}…</p><span class="ex-m">${d ? `Meilleur score ${pct(d.best * 100, 100)} %` : 'Pas encore joué'}</span>${d ? bar(d.best * 100) : ''}</a>`; }).join('')}</div>`;
}

function gaugesHtml() {
  return `<aside class="gauges panel" aria-label="Jauges">${GAUGES.map((l, i) => `<div class="gauge g${i + 1}"><div><span>${esc(l)}</span><span>${run.g[i]}</span></div>${bar(run.g[i])}</div>`).join('')}<p class="muted small" style="margin:0">Les jauges partent de 50. Elles illustrent les effets de tes choix ; seule la qualité des choix compte dans le score.</p></aside>`;
}

function chatHtml() {
  const S = run.sim;
  const parts = [];
  run.log.forEach(({ node, choice }) => {
    const n = S.nodes[node];
    parts.push(n.narr ? `<div class="msg narr">${esc(n.say)}</div>` : `<div class="msg them"><span class="who">${esc(n.who || S.them)}</span>${esc(n.say)}</div>`);
    const c = n.choices[choice];
    parts.push(`<div class="msg me"><span class="who">Toi</span>${esc(c.t)}</div>`);
    if (c.react) parts.push(n.narr ? `<div class="msg narr">${esc(c.react)}</div>` : `<div class="msg them"><span class="who">${esc(n.who || S.them)}</span>${esc(c.react)}</div>`);
    parts.push(`<div class="msg coach ${c.q}"><span class="who">${c.q === 'good' ? 'Coach — excellent réflexe' : c.q === 'ok' ? 'Coach — acceptable, mais…' : 'Coach — à éviter'}</span>${esc(c.fb)}</div>`);
  });
  if (!run.waiting && run.i < S.nodes.length) {
    const n = S.nodes[run.i];
    parts.push(n.narr ? `<div class="msg narr">${esc(n.say)}</div>` : `<div class="msg them"><span class="who">${esc(n.who || S.them)}</span>${esc(n.say)}</div>`);
  }
  return parts.join('');
}

function view() {
  const S = run.sim;
  const done = run.i >= S.nodes.length;
  let actions = '';
  if (run.waiting) actions = `<div class="row-btns"><button class="btn primary" id="cont">${run.i + 1 < S.nodes.length ? 'Continuer' : 'Voir le bilan'} ${icon('right')}</button></div>`;
  else if (!done) {
    const n = S.nodes[run.i];
    if (!run.order || run.order.node !== run.i) run.order = { node: run.i, idx: n.choices.map((_, k) => k).sort(() => Math.random() - 0.5) };
    actions = `<p class="muted small" style="margin:6px 0">Ta réplique :</p><div class="choices">${run.order.idx.map((k) => `<button class="choice" data-c="${k}">${esc(n.choices[k].t)}</button>`).join('')}</div>`;
  } else {
    const q = run.log.map(({ node, choice }) => S.nodes[node].choices[choice].q);
    const sc = q.reduce((a, x) => a + (x === 'good' ? 1 : x === 'ok' ? 0.5 : 0), 0) / q.length;
    actions = `<section class="panel" style="margin-top:10px"><div class="result-h" style="margin-bottom:8px"><p class="score-big">${pct(sc * 100, 100)}<small> %</small></p><div><h2>${sc >= 0.9 ? 'Négociation maîtrisée' : sc >= 0.6 ? 'Bonne négociation, des réflexes à consolider' : 'Reprends les réflexes du cours'}</h2><p class="muted">${q.filter((x) => x === 'good').length} excellent${q.filter((x) => x === 'good').length > 1 ? 's' : ''} réflexe${q.filter((x) => x === 'good').length > 1 ? 's' : ''} sur ${q.length} étapes</p></div></div>
      <h3>Ce qu’il fallait retenir</h3>${S.debrief}
      <div class="row-btns"><button class="btn primary" id="replay">${icon('refresh')} Rejouer</button><a class="btn" href="#simulateur">Autres scénarios</a></div></section>`;
  }
  return `<a href="#simulateur" class="back">${icon('left')} Tous les scénarios</a>
  <header class="page-h" style="margin-bottom:14px"><div class="kicker"><span class="pill c ${colorOf(S.s)}">${esc(tagLabel(S.s))}</span>Étape ${Math.min(run.i + 1, S.nodes.length)}/${S.nodes.length}</div><h1 style="font-size:1.8rem">${esc(S.title)}</h1></header>
  <div class="sim-wrap ${colorOf(S.s)}">
    <div><div class="sim-ctx">${S.role}</div><div class="chat" aria-live="polite">${chatHtml()}</div>${actions}</div>
    ${gaugesHtml()}
  </div>`;
}

export function render(param) {
  const sim = param && SIMS.find((s) => s.id === param);
  if (!sim) { run = null; return { html: list(), title: 'Simulateur de négociation', resume: 'Simulateur de négociation' }; }
  run = { sim, i: 0, log: [], g: [50, 50, 50, 50], waiting: false };
  return { html: view(), title: sim.title, resume: 'Simulateur — ' + sim.title };
}

export function mount(root) {
  if (!run) return;
  logSession('simulateur', 'Simulateur — ' + run.sim.title);
  const draw = (scrollEnd) => {
    root.innerHTML = fr(view());
    if (scrollEnd) { const last = root.querySelector('.chat > :last-child'); if (last) last.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  };
  root.addEventListener('click', (e) => {
    const c = e.target.closest('[data-c]');
    if (c && !run.waiting) {
      const k = +c.dataset.c;
      const ch = run.sim.nodes[run.i].choices[k];
      run.log.push({ node: run.i, choice: k });
      run.g = run.g.map((v, i) => Math.max(0, Math.min(100, v + (ch.g[i] || 0))));
      run.waiting = true; draw(true); return;
    }
    if (e.target.closest('#cont')) {
      run.waiting = false; run.i++;
      if (run.i >= run.sim.nodes.length) {
        const q = run.log.map(({ node, choice }) => run.sim.nodes[node].choices[choice].q);
        const sc = q.reduce((a, x) => a + (x === 'good' ? 1 : x === 'ok' ? 0.5 : 0), 0) / q.length;
        const d = state.sims[run.sim.id] || { best: 0, runs: 0 };
        d.best = Math.max(d.best || 0, sc); d.last = sc; d.at = Date.now(); d.runs = (d.runs || 0) + 1;
        state.sims[run.sim.id] = d; save();
      }
      draw(true); return;
    }
    if (e.target.closest('#replay')) { run = { sim: run.sim, i: 0, log: [], g: [50, 50, 50, 50], waiting: false }; draw(); window.scrollTo(0, 0); }
  });
}
