// Composant partagé : rédiger une réponse → voir la correction → s'auto-évaluer (éléments attendus) ou se faire corriger par Claude.
import { esc, icon, $, $$, toast, confirmDialog, fr, pct } from '../ui.js';
import { getSample, evaluateAnswer, aiError } from '../ai.js';

let SAMPLE = false;
getSample().then((s) => { SAMPLE = !!s; });
export const sampleReady = () => SAMPLE;

export function answerArea(key, value, placeholder = 'Rédige ta réponse : commence par analyser la situation, puis argumente…', rows = 7) {
  return `<label class="sr" for="a-${esc(key)}">Ta réponse</label>
  <textarea id="a-${esc(key)}" data-ans="${esc(key)}" rows="${rows}" placeholder="${esc(placeholder)}">${esc(value || '')}</textarea>
  <div class="row-btns" style="margin:10px 0 0">
    <button class="btn primary" data-show="${esc(key)}">${icon('eye')} Voir la correction</button>
    <button class="btn ghost ai-btn" data-ai="${esc(key)}" ${SAMPLE ? '' : 'hidden'}>${icon('spark')} Faire corriger par Claude</button>
    <span class="muted small" data-saved="${esc(key)}">${value ? 'Brouillon enregistré' : ''}</span>
  </div>
  <div data-aiout="${esc(key)}"></div>
  <div data-corr="${esc(key)}" hidden></div>`;
}

export function correctionHtml(key, item, got = []) {
  const keys = item.keys || [];
  return `<div class="answer-zone">
    <div class="model"><div class="model-h">${icon('check')} Réponse modèle</div>${item.model}</div>
    ${keys.length ? `<div><h4>Éléments attendus — coche ceux que ta réponse contient vraiment</h4>
      <ul class="keys">${keys.map((k, i) => `<li><label><input type="checkbox" data-key="${esc(key)}" data-i="${i}" ${got.includes(i) ? 'checked' : ''}> <span>${esc(k)}</span></label></li>`).join('')}</ul>
      <div class="row-btns" style="margin:10px 0 0"><button class="btn" data-selfsave="${esc(key)}">Enregistrer mon auto-évaluation</button><span class="muted small" data-live="${esc(key)}">${got.length}/${keys.length} éléments</span></div></div>` : ''}
    ${item.pitfalls && item.pitfalls.length ? `<div><h4>Erreurs fréquentes</h4><ul class="pitfalls">${item.pitfalls.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>` : ''}
  </div>`;
}

export function aiResultHtml(r, keys = []) {
  return `<div class="model" style="border-color:var(--l1);margin-top:12px">
    <div class="model-h">${icon('spark')} Correction par Claude — ${pct(r.score * 100, 100)} %</div>
    <p>${esc(r.synthese)}</p>
    ${keys.length ? `<ul class="keys">${keys.map((k, i) => `<li><label style="cursor:default"><input type="checkbox" disabled ${r.elements[i] ? 'checked' : ''}> <span>${esc(k)}</span></label></li>`).join('')}</ul>` : ''}
    ${r.erreurs.length ? `<h4 style="margin-top:12px">Erreurs au regard du cours</h4><ul class="pitfalls">${r.erreurs.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
    ${r.points_forts.length ? `<h4 style="margin-top:12px">Points forts</h4><ul>${r.points_forts.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
    ${r.a_ameliorer.length ? `<h4>À améliorer</h4><ul>${r.a_ameliorer.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
    <p class="muted small" style="margin:0">Correction générée par Claude à partir de ton cours et du corrigé : un entraînement, pas la note de ton professeur.</p>
  </div>`;
}

// get(key) → { answer, got, score, by, shown, ai } ; set(key, patch) ; item(key) → { question, keys, model, pitfalls, context, seances }
export function wireAnswers(root, { get, set, item, onShown }) {
  const timers = {};
  root.addEventListener('input', (e) => {
    const t = e.target.closest('[data-ans]'); if (!t) return;
    const k = t.dataset.ans;
    clearTimeout(timers[k]);
    timers[k] = setTimeout(() => { set(k, { answer: t.value }); const s = $(`[data-saved="${CSS.escape(k)}"]`, root); if (s) s.textContent = 'Brouillon enregistré'; }, 500);
  });
  root.addEventListener('change', (e) => {
    const c = e.target.closest('input[data-key]'); if (!c) return;
    const k = c.dataset.key;
    const n = $$(`input[data-key="${CSS.escape(k)}"]`, root);
    const live = $(`[data-live="${CSS.escape(k)}"]`, root);
    if (live) live.textContent = `${n.filter((x) => x.checked).length}/${n.length} éléments`;
  });
  getSample().then((s) => { if (s) $$('.ai-btn', root).forEach((b) => (b.hidden = false)); });
  root.addEventListener('click', async (e) => {
    const show = e.target.closest('[data-show]');
    if (show) {
      const k = show.dataset.show;
      const slot = $(`[data-corr="${CSS.escape(k)}"]`, root);
      const ta = $(`[data-ans="${CSS.escape(k)}"]`, root);
      const txt = ta ? ta.value.trim() : '';
      if (!txt) {
        const ok = await confirmDialog('Voir la correction sans répondre ?', 'Tu progresseras bien plus en rédigeant d’abord ta propre réponse, même courte.', 'Voir quand même');
        if (!ok) return;
      }
      if (ta) set(k, { answer: ta.value });
      slot.innerHTML = fr(correctionHtml(k, item(k), get(k).got || []));
      slot.hidden = false; show.remove();
      set(k, { shown: true });
      if (onShown) onShown(k);
      slot.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const ss = e.target.closest('[data-selfsave]');
    if (ss) {
      const k = ss.dataset.selfsave;
      const n = $$(`input[data-key="${CSS.escape(k)}"]`, root);
      const got = n.map((x, i) => (x.checked ? i : -1)).filter((i) => i >= 0);
      const score = n.length ? got.length / n.length : 0;
      set(k, { got, score, by: 'self', at: Date.now() });
      toast(`Auto-évaluation enregistrée : ${got.length}/${n.length} éléments`);
      return;
    }
    const ai = e.target.closest('[data-ai]');
    if (ai) {
      const k = ai.dataset.ai;
      const ta = $(`[data-ans="${CSS.escape(k)}"]`, root);
      const txt = ta ? ta.value.trim() : '';
      if (txt.length < 40) { toast('Rédige une réponse plus développée avant de la faire corriger'); return; }
      set(k, { answer: txt });
      const out = $(`[data-aiout="${CSS.escape(k)}"]`, root);
      ai.disabled = true; out.innerHTML = '<p class="loading">Correction en cours au regard de ton cours…</p>';
      try {
        const it = item(k);
        const r = await evaluateAnswer({ context: it.context, question: it.question, keys: it.keys || [], model: it.model, answer: txt, seances: it.seances });
        set(k, { score: r.score, by: 'ai', at: Date.now(), ai: r, got: r.elements.map((x, i) => (x ? i : -1)).filter((i) => i >= 0) });
        out.innerHTML = fr(aiResultHtml(r, it.keys || []));
      } catch (err) {
        out.innerHTML = `<p class="err-box">${esc(aiError(err))}</p>`;
        if (err && err.code === 'not_granted') ai.hidden = true;
      } finally { ai.disabled = false; }
    }
  });
}
