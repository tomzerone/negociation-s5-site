import { state, save, logSession } from '../store.js';
import { SEANCES, CORRESPONDANCES, SE, seanceStats } from '../data.js';
import { esc, icon, renderBlocks, roundel, bar, toast, $, $$ } from '../ui.js';

const LEGEND = `<div class="legend"><span><span class="tag">Cours</span> contenu de tes supports et de tes notes</span><span><span class="tag pfx">Plateforme</span> explication, application ou conseil ajouté pour t’aider</span></div>`;

function list() {
  const cards = SEANCES.map((s) => {
    const st = seanceStats(s.id);
    const p = st.sections ? (st.sectionsSeen / st.sections) * 100 : 0;
    return `<a class="se-card ${s.color}" href="#cours-${s.id}">
      ${roundel(s.id, s.num).replace('class="rd', 'class="rd lg')}
      <div><span class="meta">Séance ${s.num} · ${s.sections.length} stations</span><strong>${esc(s.title)}</strong><p>${esc(s.lead)}</p></div>
      <div class="prog"><span>${st.studied ? 'Étudiée ✓' : `${st.sectionsSeen}/${st.sections} stations lues`}</span>${bar(p)}</div>
    </a>`;
  }).join('');
  const x = CORRESPONDANCES.map((c) => `<li><span><strong>${esc(c.label)}</strong> — ${esc(c.text)}</span><em>${c.stations.map(([s, sec]) => `<a href="#cours-${s}-${sec}">S${SE[s].num} · ${esc(SE[s].sections.find((z) => z.id === sec).station)}</a>`).join(' · ')}</em></li>`).join('');
  return `<header class="page-h"><h1>Cours</h1><p class="lead">Les quatre séances, organisées comme des lignes de métro : chaque section est une station. Les encadrés distinguent ce qui vient de ton cours de ce que la plateforme ajoute.</p></header>
  ${LEGEND}
  <div class="se-list">${cards}</div>
  <section class="panel"><h2>Les correspondances : notions qui relient les séances</h2><p class="muted small">Ces notions reviennent d’une séance à l’autre. Au contrôle, les relier montre que tu as compris la logique du module.</p><ul class="rows">${x}</ul></section>`;
}

function seanceView(s, secId) {
  const st = seanceStats(s.id);
  const seen = (state.seances[s.id] && state.seances[s.id].seen) || {};
  const idx = SEANCES.indexOf(s);
  const prev = SEANCES[idx - 1], next = SEANCES[idx + 1];
  const stations = s.sections.map((sec) => `<li><a href="#cours-${s.id}-${sec.id}" data-sec="${sec.id}" class="${seen[sec.id] ? 'seen' : ''}">${esc(sec.station)}</a></li>`).join('');
  const others = SEANCES.filter((x) => x !== s).map((x) => `<a href="#cours-${x.id}" class="${x.color}">${roundel(x.id, x.num)}${esc(x.short)}</a>`).join('');
  const body = s.sections.map((sec, i) => `
    <section class="c-sec" id="sec-${sec.id}" data-sec="${sec.id}">
      <h2>${esc(sec.title)}</h2><span class="sec-src">${esc(sec.src)}</span>
      ${renderBlocks(sec.blocks, { prefix: `${s.id}-${sec.id}` })}
    </section>`).join('');
  const html = `
  <div class="reader ${s.color}">
    <nav class="se-nav" aria-label="Stations de la séance">
      <div class="se-nav-h">${roundel(s.id, s.num)}<span>${esc(s.short)}</span></div>
      <ol class="stations">${stations}</ol>
      <div class="se-other"><span class="muted small">Autres lignes</span>${others}</div>
    </nav>
    <article class="ch">
      <a href="#cours" class="back">${icon('left')} Toutes les séances</a>
      <details class="se-pick"><summary>${roundel(s.id, s.num)} Stations de la séance ${icon('down')}</summary><div><ol class="stations">${stations}</ol></div></details>
      <header class="ch-h">
        ${roundel(s.id, s.num).replace('class="rd', 'class="rd lg')}
        <div>
          <h1>${esc(s.title)}</h1>
          <p class="lead">${esc(s.lead)}</p>
          <p class="src"><span>${esc(s.src)}</span>${st.studied ? '<span>Étudiée ✓</span>' : ''}</p>
        </div>
      </header>
      <div class="obj"><h2>Objectifs de la séance</h2><ul>${s.objectifs.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>${s.objectifsNote ? `<p class="muted">${esc(s.objectifsNote)}</p>` : ''}</div>
      ${s.question ? `<aside class="box c qk"><div class="box-l"><span class="tag">Cours</span>La question qui résume la séance</div><div class="box-b qk-t">${esc(s.question)}</div></aside>` : ''}
      <nav class="sec-toc" aria-label="Sections">${s.sections.map((sec) => `<a href="#cours-${s.id}-${sec.id}">${esc(sec.station)}</a>`).join('')}</nav>
      ${body}
      <footer class="ch-f">
        <div class="row-btns">
          <button class="btn ${st.studied ? 'ok' : 'primary'}" id="mark">${icon('check')} ${st.studied ? 'Séance étudiée' : 'Marquer la séance comme étudiée'}</button>
        </div>
        <p class="muted">S’entraîner sur cette séance :</p>
        <div class="train">
          <a class="btn small" href="#fiches-${s.id}">${icon('sheet')} Fiche</a>
          <a class="btn small" href="#flashcards-${s.id}">${icon('cards')} Flashcards</a>
          <a class="btn small" href="#qcm-${s.id}">${icon('check')} QCM</a>
          <a class="btn small" href="#questions">${icon('quest')} Questions de cours</a>
          <a class="btn small" href="#exercices">${icon('puzzle')} Exercices</a>
        </div>
        <div class="pn">
          ${prev ? `<a class="pn-a" href="#cours-${prev.id}">${icon('left')}<span><em>Séance précédente</em>${esc(prev.short)}</span></a>` : '<span></span>'}
          ${next ? `<a class="pn-a r" href="#cours-${next.id}"><span><em>Séance suivante</em>${esc(next.short)}</span>${icon('right')}</a>` : `<a class="pn-a r" href="#methode"><span><em>Ensuite</em>Méthode d’analyse</span>${icon('right')}</a>`}
        </div>
      </footer>
    </article>
  </div>`;
  return { html, title: `Séance ${s.num} — ${s.short}`, resume: `Cours — Séance ${s.num} : ${s.short}`, anchor: secId ? 'sec-' + secId : null, noFocus: !!secId };
}

export function render(param) {
  if (!param) return { html: list(), title: 'Cours', resume: 'Cours' };
  const [sid, ...rest] = param.split('-');
  const s = SE[sid];
  if (!s) return { html: list(), title: 'Cours' };
  let secId = rest.join('-') || null;
  // ancre de bloc venant de la recherche : s1-dimensions-b4
  let blockAnchor = null;
  if (secId && /-b\d+$/.test(secId)) { blockAnchor = `${sid}-${secId}`; secId = secId.replace(/-b\d+$/, ''); }
  const out = seanceView(s, secId);
  if (blockAnchor) { out.anchor = blockAnchor; out.flash = blockAnchor; }
  return out;
}

let io = null;
export function mount(root, param) {
  if (!param) return;
  const [sid, ...rest] = param.split('-');
  const s = SE[sid];
  if (!s) return;
  logSession('cours', `Cours — Séance ${s.num}`);
  const d = (state.seances[sid] = state.seances[sid] || { seen: {} });
  d.seen = d.seen || {};
  const markSeen = (secId) => {
    if (d.seen[secId]) return;
    d.seen[secId] = Date.now(); save();
    $$(`.stations a[data-sec="${secId}"]`, root).forEach((a) => a.classList.add('seen'));
  };
  const secId = rest.join('-').replace(/-b\d+$/, '');
  if (secId) markSeen(secId);
  const blockId = rest.join('-').match(/-b\d+$/) ? `${sid}-${rest.join('-')}` : null;
  if (blockId) { const el = document.getElementById(blockId); if (el) { el.classList.add('flash'); el.scrollIntoView({ block: 'center' }); } }
  // stations lues au fil du défilement + station courante surlignée
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          const id = en.target.dataset.sec;
          markSeen(id);
          $$('.stations a', root).forEach((a) => a.classList.toggle('on', a.dataset.sec === id));
        }
      });
    }, { rootMargin: '0px 0px -65% 0px', threshold: 0 });
    $$('.c-sec', root).forEach((el) => io.observe(el));
  }
  $('#mark', root).addEventListener('click', (e) => {
    const was = !!d.studied;
    d.studied = !was; d.studiedAt = Date.now();
    if (d.studied) s.sections.forEach((x) => { d.seen[x.id] = d.seen[x.id] || Date.now(); });
    save();
    const b = e.currentTarget;
    b.className = 'btn ' + (d.studied ? 'ok' : 'primary');
    b.innerHTML = `${icon('check')} ${d.studied ? 'Séance étudiée' : 'Marquer la séance comme étudiée'}`;
    if (d.studied) { $$('.stations a', root).forEach((a) => a.classList.add('seen')); toast(`Séance ${s.num} marquée comme étudiée`); }
  });
  // liens de station : défilement doux sans changer de vue
  $$('.se-pick', root).forEach((det) => det.addEventListener('click', (e) => { if (e.target.closest('a')) det.open = false; }));
}
export function unmount() { if (io) { io.disconnect(); io = null; } }
