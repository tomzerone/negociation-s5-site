import { logSession } from '../store.js';
import { METHODE } from '../data.js';
import { esc, icon, copyText, $ } from '../ui.js';

const TEMPLATE = () => [
  'ANALYSE DE LA NÉGOCIATION',
  ...METHODE.steps.map((s) => `${s.n}. ${s.title.toUpperCase()}\n   ${s.ask.join('\n   ')}\n   → `),
  'STRATÉGIE',
  ...METHODE.strategy.map((s) => `- ${s.title} : `),
].join('\n\n');

export function render() {
  const M = METHODE;
  const rail = `<div class="flow l5"><div class="flow-l">Analyser avant de résoudre : les étapes</div><ol class="flow-line">${M.steps.map((s) => `<li><span><a href="#methode" data-to="m-${s.id}" style="color:inherit;text-decoration:none">${s.n}. ${esc(s.title.split(' — ')[0].replace(' ?', ' ?'))}</a></span></li>`).join('')}</ol></div>`;
  const steps = M.steps.map((s) => `
    <section class="step" id="m-${s.id}">
      <div class="step-h"><span class="step-n">${s.n}</span><div><h3>${esc(s.title)}</h3><span class="muted small">Source : ${esc(s.src)}</span></div></div>
      <div class="step-b">
        <p>${s.what}</p>
        <h4>Les questions à te poser</h4>
        <ul>${s.ask.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
        <div class="scenario"><strong>Sur le cas MarketOne / TempoRun :</strong> ${esc(s.example)}</div>
        <p class="small" style="margin:0"><strong style="color:var(--ko-ink)">Piège :</strong> ${esc(s.trap)}</p>
      </div>
    </section>`).join('');
  const strat = M.strategy.map((s, i) => `
    <section class="step">
      <div class="step-h"><span class="step-n">${String.fromCharCode(65 + i)}</span><div><h3>${esc(s.title)}</h3><span class="muted small">Source : ${esc(s.src)}</span></div></div>
      <div class="step-b"><p>${esc(s.text)}</p><div class="scenario"><strong>Exemple :</strong> ${esc(s.example)}</div></div>
    </section>`).join('');
  const W = M.writing;
  const html = `
  <header class="page-h"><h1>Méthode d’analyse</h1><p class="lead">${M.intro}</p></header>
  <div class="legend"><span><span class="tag pfx">Plateforme</span> méthode construite à partir de la grille d’analyse du cours (séance 1) et des outils des séances 2 à 4 ; chaque étape indique sa source.</span></div>
  ${rail}
  <div class="row-btns"><button class="btn" id="copy-tpl">${icon('copy')} Copier la trame d’analyse vierge</button><a class="btn" href="#exercices-grille">${icon('puzzle')} S’entraîner sur la grille</a><a class="btn primary" href="#cas">${icon('case')} Appliquer sur un cas</a></div>
  <h2 style="margin-top:28px">1. Analyser la situation</h2>
  <div class="steps">${steps}</div>
  <h2 style="margin-top:34px">2. Construire sa stratégie</h2>
  <div class="steps">${strat}</div>
  <h2 style="margin-top:34px">3. Rédiger au contrôle</h2>
  <div class="two">
    <section class="panel"><h3>Question factuelle</h3><ol>${W.factuelle.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></section>
    <section class="panel"><h3>Question ouverte ou argumentée</h3><ol>${W.ouverte.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></section>
  </div>
  <section class="panel"><h3>Plan type d’un cas pratique écrit</h3><div class="tbl-wrap" style="margin:6px 0 0"><table class="stack"><thead><tr><th>Partie</th><th>Contenu</th></tr></thead><tbody>${W.cas.map(([a, b]) => `<tr><th scope="row">${esc(a)}</th><td data-label="Contenu">${esc(b)}</td></tr>`).join('')}</tbody></table></div></section>
  <h3 style="margin-top:26px">Trois niveaux de réponse à la même question</h3>
  <p class="muted">« ${esc(M.levels.question)} »</p>
  <div class="steps">${M.levels.items.map((l, i) => `<section class="step"><div class="step-h"><span class="step-n" style="border-color:${['var(--ko)', 'var(--mid)', 'var(--ok)'][i]}">${i + 1}</span><div><h3>${esc(l.label)} <span class="pill ${['ko', 'mid', 'ok'][i]}">${esc(l.score)}</span></h3></div></div><div class="step-b"><blockquote class="scenario" style="font-style:italic;margin:0 0 10px">${esc(l.text)}</blockquote><p class="small" style="margin:0"><strong>Pourquoi :</strong> ${esc(l.why)}</p></div></section>`).join('')}</div>
  <p class="muted small">${esc(M.levels.note)}</p>
  <div class="two" style="margin-top:22px">
    <section class="panel"><h2>Boîte à formulations</h2><ul class="rows">${M.phrases.map(([a, b]) => `<li><span><strong>${esc(a)}</strong><br><span class="muted">${esc(b)}</span></span></li>`).join('')}</ul></section>
    <section class="panel"><h2>Erreurs fréquentes</h2><ul class="rows">${M.mistakes.map(([a, b]) => `<li><span><strong>${esc(a)}</strong><br><span class="muted">${esc(b)}</span></span></li>`).join('')}</ul></section>
  </div>
  <div class="row-btns"><a class="btn primary" href="#cas">S’entraîner sur les cas pratiques</a><a class="btn" href="#examens">Passer un contrôle blanc</a></div>`;
  return { html, title: 'Méthode d’analyse', resume: 'Méthode d’analyse' };
}

export function mount(root) {
  logSession('methode', 'Méthode d’analyse');
  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-to]');
    if (t) { e.preventDefault(); const el = document.getElementById(t.dataset.to); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if (e.target.closest('#copy-tpl')) copyText(TEMPLATE());
  });
}
