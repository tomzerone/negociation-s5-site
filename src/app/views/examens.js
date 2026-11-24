import { state, save, logSession } from '../store.js';
import { EXAMS, SE } from '../data.js';
import { esc, icon, note20, fmtDate, toast, confirmDialog, $, $$, fr } from '../ui.js';
import { getSample, evaluateExamQuestion, aiError } from '../ai.js';

const qsOf = (ex) => ex.parts.flatMap((p) => p.questions.map((q) => ({ ...q, part: p })));
const total = (ex) => qsOf(ex).reduce((a, q) => a + q.points, 0);
const fmtPts = (x) => (Math.round(x * 100) / 100).toLocaleString('fr-FR');

function list() {
  return `<header class="page-h"><h1>Contrôles blancs</h1><p class="lead">Trois sujets complets, comme au contrôle annoncé : des <strong>questions de cours</strong> puis un <strong>cas pratique écrit</strong> avec analyse et argumentation. Chronomètre, copie rédigée, puis correction argumentée avec un barème indicatif sur 20.</p></header>
  <div class="note">${icon('info')}<p>Le format exact et la durée du contrôle ne sont pas encore confirmés (tes notes l’indiquent). Ces sujets sont des entraînements inventés pour la plateforme : leurs barèmes ne sont pas ceux de ton professeur.</p></div>
  <div class="ex-list">${EXAMS.map((ex) => {
    const runs = state.exams.filter((r) => r.id === ex.id);
    const draft = state.examDrafts[ex.id];
    return `<section class="case-i" style="grid-template-columns:minmax(0,1fr) auto"><div><strong>${esc(ex.title)}</strong><p>${esc(ex.desc)}</p><div class="meta"><span class="pill">${ex.duration} min conseillées</span><span class="pill">${qsOf(ex).length} questions</span><span class="pill">${total(ex)} points</span>${runs.length ? `<span class="pill ok">Meilleure note ${note20(Math.max(...runs.map((r) => r.score20)))}/20</span>` : ''}</div></div>
      <div class="row-btns" style="margin:0">${!draft ? `<a class="btn primary" href="#examen-${ex.id}">${icon('play')} Commencer</a>` : !draft.submittedAt ? `<a class="btn primary" href="#examen-${ex.id}">${icon('play')} Reprendre</a>` : `<a class="btn" href="#examen-${ex.id}">Voir la correction</a><button class="btn primary" data-restart="${ex.id}">${icon('refresh')} Repasser</button>`}</div></section>`;
  }).join('')}</div>
  ${state.exams.length ? `<section class="panel" style="margin-top:22px"><h2>Historique</h2><ul class="rows">${state.exams.slice(0, 12).map((r) => `<li><span>${esc(r.title)}</span><strong>${note20(r.score20)}/20</strong><em>${fmtDate(r.at)} · ${r.by === 'ai' ? 'corrigé par Claude' : 'auto-évalué'}</em></li>`).join('')}</ul></section>` : ''}`;
}

function intro(ex) {
  return `<a href="#examens" class="back">${icon('left')} Contrôles blancs</a>
  <header class="page-h"><h1>${esc(ex.title)}</h1><p class="lead">${esc(ex.desc)}</p></header>
  <section class="panel" style="max-width:760px">
    <h2>Consignes</h2>
    <ul><li>${qsOf(ex).length} questions, ${total(ex)} points : ${ex.parts.map((p) => esc(p.title.split(' — ')[1] || p.title)).join(' puis ')}.</li><li>Pour les questions ouvertes et le cas : <strong>commence par analyser la situation</strong>, puis argumente et conclus.</li><li>Ta copie est enregistrée au fil de l’eau ; tu peux quitter et reprendre.</li><li>À la fin, tu compares chaque réponse au corrigé et tu coches les éléments du barème que tu as traités.</li></ul>
    <h2>Durée</h2>
    <div class="seg" role="group" aria-label="Durée">${[60, 90, 120, 0].map((d) => `<button data-dur="${d}" class="${d === ex.duration ? 'on' : ''}">${d ? d + ' min' : 'Sans chrono'}</button>`).join('')}</div>
    <div class="row-btns"><button class="btn primary" id="go">${icon('timer')} Démarrer le contrôle</button></div>
  </section>`;
}

function paper(ex) {
  const d = state.examDrafts[ex.id];
  let n = 0;
  return `<div class="timer" id="timer"><span>${esc(ex.title)}</span><b id="clock">${d.duration ? '--:--' : 'Sans chrono'}</b><button class="btn" id="submit">Rendre ma copie</button></div>
  ${ex.parts.map((p) => `<div class="part-h"><h2>${esc(p.title)}</h2><span class="muted">${fmtPts(p.questions.reduce((a, q) => a + q.points, 0))} points</span></div>
    ${p.enonce ? `<article class="doc" data-tab="Énoncé">${p.enonce}</article>` : ''}
    ${p.questions.map((q) => { n++; return `<section class="eq"><div class="eq-h"><h3>${n}. ${esc(q.q)}</h3><span class="pts">${fmtPts(q.points)} pt${q.points > 1 ? 's' : ''}</span></div><label class="sr" for="x-${q.id}">Ta réponse</label><textarea id="x-${q.id}" data-x="${q.id}" rows="${p.enonce ? 9 : 6}" placeholder="Ta réponse…">${esc(d.answers[q.id] || '')}</textarea></section>`; }).join('')}`).join('')}
  <div class="row-btns"><button class="btn primary" id="submit2">Rendre ma copie</button><span class="muted small" id="saved"></span></div>`;
}

function correction(ex) {
  const d = state.examDrafts[ex.id];
  d.grades = d.grades || {}; d.ai = d.ai || {};
  let n = 0;
  const score = computeScore(ex);
  return `<a href="#examens" class="back">${icon('left')} Contrôles blancs</a>
  <header class="page-h"><h1>Correction — ${esc(ex.title)}</h1><p class="lead">Compare chaque réponse au corrigé, puis coche honnêtement les éléments du barème que ta réponse traite <strong>correctement</strong>. ${'<span class="ai-all" hidden>Tu peux aussi demander une correction par Claude.</span>'}</p></header>
  <div class="result-h"><p class="score-big"><span id="sc">${note20(score)}</span><small>/20</small></p><div><h2 id="sc-l">${score >= 14 ? 'Très bonne copie' : score >= 10 ? 'Copie correcte' : 'À retravailler'}</h2><p class="muted">Note indicative calculée à partir du barème coché.</p><div class="row-btns" style="margin:8px 0 0"><button class="btn primary" id="save-grade">${icon('check')} Enregistrer ma note</button><button class="btn ghost" id="ai-all" hidden>${icon('spark')} Tout faire corriger par Claude</button><button class="btn ghost" id="restart">${icon('refresh')} Repasser ce contrôle</button></div></div></div>
  ${ex.parts.map((p) => `<div class="part-h"><h2>${esc(p.title)}</h2></div>
    ${p.enonce ? `<details class="doc" data-tab="Énoncé" style="margin-top:34px"><summary style="cursor:pointer;font-weight:700">Relire l’énoncé</summary>${p.enonce}</details>` : ''}
    ${p.questions.map((q) => {
      n++;
      const g = d.grades[q.id] || [];
      const ai = d.ai[q.id];
      return `<section class="eq" id="c-${q.id}"><div class="eq-h"><h3>${n}. ${esc(q.q)}</h3><span class="pts" data-qpts="${q.id}">${fmtPts(qPoints(q, g))}/${fmtPts(q.points)}</span></div>
        <div class="two" style="gap:14px">
          <div><h4>Ta réponse</h4><div class="scenario" style="white-space:pre-wrap;font-weight:400">${d.answers[q.id] ? esc(d.answers[q.id]) : '<em class="muted">Pas de réponse</em>'}</div></div>
          <div class="model"><div class="model-h">${icon('check')} Corrigé</div>${q.model}</div>
        </div>
        <h4 style="margin-top:12px">Barème</h4>
        <ul class="keys">${q.criteria.map(([t, pts], i) => `<li><label><input type="checkbox" data-g="${q.id}" data-i="${i}" ${g[i] ? 'checked' : ''}> <span>${esc(t)}</span><span class="pts">${fmtPts(pts)} pt</span></label></li>`).join('')}</ul>
        <div class="row-btns" style="margin:10px 0 0"><button class="btn small ghost ai-q" data-aiq="${q.id}" hidden>${icon('spark')} Corriger par Claude</button></div>
        <div data-aiout="${q.id}">${ai ? aiHtml(ai, q) : ''}</div>
      </section>`;
    }).join('')}`).join('')}`;
}
function aiHtml(r, q) {
  return `<div class="model" style="border-color:var(--l1);margin-top:10px"><div class="model-h">${icon('spark')} Correction par Claude — ${fmtPts(r.points)}/${fmtPts(q.points)}</div><p>${esc(r.commentaire)}</p><ul class="rows">${q.criteria.map(([t, pts], i) => `<li><span>${esc(t)}<br><span class="muted small">${esc(r.grille[i].justification)}</span></span><strong>${fmtPts(r.grille[i].points)}/${fmtPts(pts)}</strong></li>`).join('')}</ul>${r.erreurs.length ? `<h4>Erreurs</h4><ul class="pitfalls">${r.erreurs.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}<p class="muted small" style="margin:0">Correction générée par Claude d’après ton cours et le corrigé : un entraînement, pas la note de ton professeur.</p></div>`;
}
const qPoints = (q, g) => q.criteria.reduce((a, c, i) => a + (g[i] ? c[1] : 0), 0);
function computeScore(ex) {
  const d = state.examDrafts[ex.id];
  const pts = qsOf(ex).reduce((a, q) => a + (d.ai && d.ai[q.id] && d.aiUsed && d.aiUsed[q.id] ? d.ai[q.id].points : qPoints(q, (d.grades && d.grades[q.id]) || [])), 0);
  return (pts / total(ex)) * 20;
}

export function render(param) {
  if (!param) return { html: list(), title: 'Contrôles blancs', resume: 'Contrôles blancs' };
  return { html: '', title: 'Contrôle blanc' };
}
export function mount(root) {
  root.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-restart]'); if (!b) return;
    const ok = await confirmDialog('Repasser ce contrôle ?', 'Ta copie actuelle sera effacée (les notes déjà enregistrées restent dans l’historique).', 'Recommencer');
    if (ok) { delete state.examDrafts[b.dataset.restart]; save(); location.hash = 'examen-' + b.dataset.restart; }
  });
}

let tick = null;
export const views = {
  run: {
    render(param) {
      const ex = EXAMS.find((x) => x.id === param);
      if (!ex) return { html: list(), title: 'Contrôles blancs' };
      const d = state.examDrafts[ex.id];
      if (d && d.submittedAt) return { html: correction(ex), title: 'Correction — ' + ex.title, resume: 'Correction — ' + ex.title };
      if (d && d.startedAt) return { html: paper(ex), title: ex.title, resume: ex.title, noFocus: true };
      return { html: intro(ex), title: ex.title, resume: ex.title };
    },
    mount(root, param) {
      const ex = EXAMS.find((x) => x.id === param);
      if (!ex) return;
      logSession('examen', ex.title);
      let dur = ex.duration;
      const redraw = () => { const out = views.run.render(param); root.innerHTML = fr(out.html); setup(); };
      const submit = async (auto) => {
        const d = state.examDrafts[ex.id];
        if (!auto) {
          const empty = qsOf(ex).filter((q) => !(d.answers[q.id] || '').trim()).length;
          const ok = await confirmDialog('Rendre ta copie ?', empty ? `${empty} question${empty > 1 ? 's' : ''} sans réponse. Tu ne pourras plus modifier ta copie.` : 'Tu ne pourras plus modifier ta copie.', 'Rendre');
          if (!ok) return;
        } else toast('Temps écoulé : ta copie a été rendue');
        $$('[data-x]', root).forEach((t) => { d.answers[t.dataset.x] = t.value; });
        d.submittedAt = Date.now(); save();
        clearInterval(tick); redraw(); window.scrollTo(0, 0);
      };
      const setup = () => {
        const d = state.examDrafts[ex.id];
        clearInterval(tick);
        if (d && d.startedAt && !d.submittedAt && d.duration) {
          const end = d.startedAt + d.duration * 60000;
          const upd = () => {
            const left = Math.max(0, end - Date.now());
            const el = $('#clock', root); if (!el) { clearInterval(tick); return; }
            const m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
            el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            $('#timer', root).classList.toggle('low', left < 5 * 60000);
            if (left <= 0) submit(true);
          };
          upd(); tick = setInterval(upd, 1000);
        }
        if (d && d.submittedAt) getSample().then((s) => { if (s) { $$('.ai-q, #ai-all, .ai-all', root).forEach((b) => (b.hidden = false)); } });
      };
      setup();
      let saveT;
      root.addEventListener('input', (e) => {
        const t = e.target.closest('[data-x]'); if (!t) return;
        const d = state.examDrafts[ex.id];
        clearTimeout(saveT);
        saveT = setTimeout(() => { d.answers[t.dataset.x] = t.value; save(); const s = $('#saved', root); if (s) s.textContent = 'Copie enregistrée'; }, 600);
      });
      root.addEventListener('change', (e) => {
        const c = e.target.closest('[data-g]'); if (!c) return;
        const d = state.examDrafts[ex.id];
        d.grades = d.grades || {}; const g = (d.grades[c.dataset.g] = d.grades[c.dataset.g] || []);
        g[+c.dataset.i] = c.checked; if (d.aiUsed) delete d.aiUsed[c.dataset.g];
        save();
        const q = qsOf(ex).find((x) => x.id === c.dataset.g);
        const el = $(`[data-qpts="${q.id}"]`, root); if (el) el.textContent = `${fmtPts(qPoints(q, g))}/${fmtPts(q.points)}`;
        const sc = computeScore(ex); $('#sc', root).textContent = note20(sc);
        $('#sc-l', root).textContent = sc >= 14 ? 'Très bonne copie' : sc >= 10 ? 'Copie correcte' : 'À retravailler';
      });
      const aiOne = async (q) => {
        const d = state.examDrafts[ex.id];
        const ans = (d.answers[q.id] || '').trim();
        const out = $(`[data-aiout="${q.id}"]`, root);
        if (ans.length < 30) { out.innerHTML = '<p class="muted small">Réponse trop courte pour une correction automatique.</p>'; return; }
        out.innerHTML = '<p class="loading">Correction en cours…</p>';
        try {
          const r = await evaluateExamQuestion({ context: q.part.enonce, question: q.q, criteria: q.criteria, model: q.model, answer: ans, seances: q.seances });
          d.ai = d.ai || {}; d.ai[q.id] = r; d.aiUsed = d.aiUsed || {}; d.aiUsed[q.id] = true;
          d.grades = d.grades || {}; d.grades[q.id] = r.grille.map((x, i) => x.points >= q.criteria[i][1] - 1e-9);
          save();
          out.innerHTML = fr(aiHtml(r, q));
          $$(`[data-g="${q.id}"]`, root).forEach((cb, i) => { cb.checked = !!d.grades[q.id][i]; });
          $(`[data-qpts="${q.id}"]`, root).textContent = `${fmtPts(r.points)}/${fmtPts(q.points)}`;
          $('#sc', root).textContent = note20(computeScore(ex));
        } catch (err) { out.innerHTML = `<p class="err-box">${esc(aiError(err))}</p>`; throw err; }
      };
      root.addEventListener('click', async (e) => {
        const du = e.target.closest('[data-dur]');
        if (du) { dur = +du.dataset.dur; $$('[data-dur]', root).forEach((b) => b.classList.toggle('on', b === du)); return; }
        if (e.target.closest('#go')) { state.examDrafts[ex.id] = { answers: {}, startedAt: Date.now(), duration: dur }; save(); redraw(); window.scrollTo(0, 0); return; }
        if (e.target.closest('#submit') || e.target.closest('#submit2')) { submit(false); return; }
        const aq = e.target.closest('[data-aiq]');
        if (aq) { aq.disabled = true; try { await aiOne(qsOf(ex).find((x) => x.id === aq.dataset.aiq)); } catch { /* message affiché */ } aq.disabled = false; return; }
        if (e.target.closest('#ai-all')) {
          const b = e.target.closest('#ai-all'); b.disabled = true;
          for (const q of qsOf(ex)) { try { await aiOne(q); } catch (err) { if (err && (err.code === 'not_granted' || err.code === 'rate_limited')) break; } }
          b.disabled = false; return;
        }
        if (e.target.closest('#save-grade')) {
          const d = state.examDrafts[ex.id];
          const byAi = d.aiUsed && Object.keys(d.aiUsed).length === qsOf(ex).length;
          state.exams.unshift({ at: Date.now(), id: ex.id, title: ex.title, score20: computeScore(ex), by: byAi ? 'ai' : 'self' });
          state.exams = state.exams.slice(0, 30); save();
          toast(`Note enregistrée : ${note20(computeScore(ex))}/20`);
          return;
        }
        if (e.target.closest('#restart')) {
          const ok = await confirmDialog('Repasser ce contrôle ?', 'Ta copie actuelle sera effacée (les notes déjà enregistrées restent dans l’historique).', 'Recommencer');
          if (ok) { delete state.examDrafts[ex.id]; save(); redraw(); window.scrollTo(0, 0); }
        }
      });
    },
    unmount() { clearInterval(tick); tick = null; },
  },
};
