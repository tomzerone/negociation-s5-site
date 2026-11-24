import { state, save, logSession } from '../store.js';
import { CAS, SE, LEVELS, caseProgress } from '../data.js';
import { esc, icon, bar, pct, confirmDialog, copyText, toast, $, $$, fr } from '../ui.js';
import { answerArea, aiResultHtml, wireAnswers } from './answer.js';

let tab = 'dossier';

function list() {
  const items = CAS.map((c) => {
    const p = caseProgress(c);
    const camp = p.started ? c.camps.find((x) => x.id === p.camp) : null;
    return `<a class="case-i" href="#cas-${c.id}">
      <div><div class="meta"><span class="pill ${c.badge === 'Cas du cours' ? 'dark' : ''}">${esc(c.badge)}</span><span class="pill">${esc(LEVELS[c.level])}</span><span class="pill">${c.camps.length} camps</span>${c.seances.map((s) => `<span class="pill c ${SE[s].color}">S${SE[s].num}</span>`).join('')}</div>
      <strong style="margin-top:8px">${esc(c.title)}</strong><p>${esc(c.pitch)}</p></div>
      <div class="prog">${p.started ? `<span>${esc(camp ? camp.name : '')} · ${p.done}/${p.total} étapes${p.revealed ? ' · débrief vu' : ''}</span>${bar(p.total ? (p.done / p.total) * 100 : 0)}` : '<span>Pas encore commencé</span>'}</div>
    </a>`;
  }).join('');
  return `<header class="page-h"><h1>Cas pratiques</h1><p class="lead">Des négociations à plusieurs parties, avec un <strong>dossier commun</strong> et des <strong>annexes confidentielles</strong> par camp. Choisis ton camp, analyse la situation étape par étape, prépare ta fiche de négociation, puis découvre ce que savait l’autre camp et le corrigé.</p></header>
  <div class="note">${icon('info')}<p>Le cas MarketOne / TempoRun est celui de ton cours (l’annexe MarketOne est une simulation signalée comme telle). Les autres cas sont inventés pour t’entraîner sur chaque contexte : référencement, appel d’offres, agent sportif, comité d’achat sous contrainte.</p></div>
  <div class="case-list">${items}</div>
  <p class="muted small">Nouveau dans l’exercice ? Commence par la <a href="#methode">méthode d’analyse</a>.</p>`;
}

function campPicker(c) {
  return `<a href="#cas" class="back">${icon('left')} Tous les cas</a>
  <header class="page-h"><div class="kicker"><span class="pill ${c.badge === 'Cas du cours' ? 'dark' : ''}">${esc(c.badge)}</span>${esc(c.context)}</div><h1>${esc(c.title)}</h1><p class="lead">${esc(c.pitch)}</p></header>
  <p class="muted">${esc(c.intro)}</p>
  <h2>Choisis ton camp</h2>
  <p>Tu verras le dossier commun et l’annexe confidentielle de ton camp uniquement. Les autres annexes resteront verrouillées jusqu’au débrief.</p>
  <div class="camps">${c.camps.map((k) => `<button class="camp ${k.color}" data-camp="${k.id}"><span class="pill c">${esc(k.label)}</span><strong>${esc(k.name)}</strong><span>${esc(k.mission)}</span>${k.simulated ? '<span class="pill mid">Annexe simulée</span>' : ''}</button>`).join('')}</div>`;
}

function stepsFor(c, camp) { return c.steps.filter((st) => !st.camp || st.camp === camp); }
const stepData = (c, sid) => { const d = state.cases[c.id]; return (d && d.steps && d.steps[sid]) || {}; };

function tabDossier(c) {
  return `${c.commun.map((d) => `<article class="doc" data-tab="Dossier commun"><h3>${esc(d.title)}</h3>${d.html}</article>`).join('')}
  <article class="doc" data-tab="Consignes"><h3>Consignes d’utilisation des documents</h3>${c.consignes}</article>`;
}
function annexDoc(k, mine) {
  return `<article class="doc conf" data-tab="${esc(k.label)}">${k.simulated ? '<span class="stamp sim">SIMULATION</span>' : '<span class="stamp">CONFIDENTIEL</span>'}
    <h3>${esc(k.label)}${mine ? ' — ton annexe' : ''}</h3>
    ${k.source ? `<p class="muted small">${esc(k.source)}</p>` : ''}
    <p><strong>Ta mission :</strong> ${esc(k.mission)}</p>${k.annexe}</article>`;
}
function tabAnnexe(c, camp) { return annexDoc(c.camps.find((k) => k.id === camp), true); }

function tabAnalyse(c, camp) {
  const steps = stepsFor(c, camp);
  return `<p class="muted">Rédige chaque réponse avant d’ouvrir la correction. Coche ensuite les éléments attendus que tu as vraiment traités.</p>
  <div class="steps">${steps.map((st, i) => {
    const d = stepData(c, st.id);
    const key = `${c.id}:${st.id}`;
    return `<section class="step ${d.shown ? 'done' : ''}" id="st-${st.id}">
      <div class="step-h"><span class="step-n">${i + 1}</span><div><h3>${esc(st.title)}</h3><span class="muted small">${st.camp ? 'Ton camp' : 'Tous les camps'} · ${st.seances.map((s) => 'Séance ' + SE[s].num).join(', ')}${d.score != null ? ` · évaluée : ${pct(d.score * 100, 100)} %` : ''}</span></div></div>
      <div class="step-q"><p>${esc(st.q)}</p></div>
      <div class="step-b">${answerArea(key, d.answer)}${d.by === 'ai' && d.ai ? aiResultHtml(d.ai, st.keys) : ''}</div>
    </section>`;
  }).join('')}</div>`;
}

const PREP = [
  ['objectifs', 'Objectifs', 'Objectif idéal / cible réaliste / seuil minimal (ou limite économique et limite opérationnelle)', 3],
  ['force', 'Rapport de force', 'Qui dépend le plus de l’autre ? Dépendance, attractivité, rareté', 3],
  ['batna', 'Alternatives', 'Ma BATNA (crédibilité ?) — celle de l’autre partie', 3],
  ['valeur', 'Proposition de valeur', 'Pourquoi l’autre partie a-t-elle intérêt à conclure avec nous plutôt qu’avec un concurrent ?', 3],
  ['concessions', 'Concessions → contreparties', 'Ce que je peux concéder, dans quelle limite, contre quoi', 4],
  ['arguments', 'Arguments', 'Caractéristique → bénéfice, pour chaque interlocuteur', 3],
  ['questions', 'Questions à poser', 'Les informations manquantes et les priorités à découvrir', 3],
  ['vigilance', 'Points de vigilance', 'Ce qui est non négociable, ce qu’il ne faut pas révéler, ce qui ferait changer ma position', 3],
];
function tabPrep(c) {
  const p = (state.cases[c.id] && state.cases[c.id].prep) || {};
  return `<p class="muted">Ta fiche de négociation, comme le jour du contrôle : synthétise ici ton analyse. Elle est enregistrée automatiquement.</p>
  <form class="prep" id="prep" onsubmit="return false">${PREP.map(([k, l, h, r]) => `<label>${esc(l)}<span>${esc(h)}</span><textarea data-prep="${k}" rows="${r}">${esc(p[k] || '')}</textarea></label>`).join('')}</form>
  <div class="row-btns"><button class="btn" id="copy-prep">${icon('copy')} Copier ma fiche</button><span class="muted small" id="prep-saved"></span></div>`;
}

function tabDebrief(c, camp) {
  const d = state.cases[c.id] || {};
  const others = c.camps.filter((k) => k.id !== camp);
  if (!d.revealed) {
    return `<div class="locked">${icon('lock')}<h3 style="margin:0">Commission contradictoire</h3><p style="margin:0">Les annexes de ${others.map((k) => esc(k.name)).join(' et ')} sont verrouillées. Termine ton analyse et ta fiche de préparation avant de les découvrir : c’est en confrontant ta préparation aux informations de l’autre camp que tu progresses.</p><button class="btn primary" id="reveal">${icon('unlock')} Révéler les annexes et le débrief</button></div>`;
  }
  return `${others.map((k) => annexDoc(k, false)).join('')}
  <section class="panel" style="max-width:900px"><h2>Débrief — ce que cela change pour toi</h2>${(c.debrief && c.debrief[camp]) || ''}</section>
  <section class="panel soft" style="max-width:900px"><h2>Synthèse et accord possible</h2>${c.synthese}</section>`;
}

function caseView(c) {
  const d = state.cases[c.id];
  const camp = d.camp;
  const k = c.camps.find((x) => x.id === camp);
  const p = caseProgress(c);
  const tabs = [['dossier', 'Dossier commun', 'sheet'], ['annexe', 'Mon annexe', 'eye'], ['analyse', `Analyse guidée (${p.done}/${p.total})`, 'compass'], ['prep', 'Fiche de préparation', 'pen'], ['debrief', 'Débrief', d.revealed ? 'unlock' : 'lock']];
  const body = tab === 'annexe' ? tabAnnexe(c, camp) : tab === 'analyse' ? tabAnalyse(c, camp) : tab === 'prep' ? tabPrep(c) : tab === 'debrief' ? tabDebrief(c, camp) : tabDossier(c);
  return `<a href="#cas" class="back">${icon('left')} Tous les cas</a>
  <header class="page-h" style="margin-bottom:14px"><div class="kicker"><span class="pill ${c.badge === 'Cas du cours' ? 'dark' : ''}">${esc(c.badge)}</span>${esc(c.context)}</div><h1>${esc(c.title)}</h1>
  <p style="margin:0" class="${k.color}">Tu joues : <span class="pill c">${esc(k.label)}</span> <button class="btn small ghost" id="switch" style="margin-left:6px">Changer de camp</button></p></header>
  <nav class="tabs" role="tablist">${tabs.map(([id, l, ic]) => `<button role="tab" aria-selected="${tab === id}" class="${tab === id ? 'on' : ''}" data-tab="${id}">${icon(ic)} ${esc(l)}</button>`).join('')}</nav>
  <div id="tabbody">${body}</div>`;
}

export function render(param) {
  const c = param && CAS.find((x) => x.id === param);
  if (!c) return { html: list(), title: 'Cas pratiques', resume: 'Cas pratiques' };
  const d = state.cases[c.id];
  if (!d || !d.camp) return { html: campPicker(c), title: c.title, resume: 'Cas pratique — ' + c.title };
  if (!['dossier', 'annexe', 'analyse', 'prep', 'debrief'].includes(tab)) tab = 'dossier';
  return { html: caseView(c), title: c.title, resume: 'Cas pratique — ' + c.title };
}

export function mount(root, param) {
  const c = param && CAS.find((x) => x.id === param);
  if (!c) return;
  logSession('cas', 'Cas pratique — ' + c.title);
  const redraw = () => { root.innerHTML = fr(state.cases[c.id] && state.cases[c.id].camp ? caseView(c) : campPicker(c)); };
  const ensure = () => { const d = (state.cases[c.id] = state.cases[c.id] || {}); d.steps = d.steps || {}; d.prep = d.prep || {}; return d; };
  wireAnswers(root, {
    get: (key) => stepData(c, key.split(':')[1]),
    set: (key, patch) => { const d = ensure(); const sid = key.split(':')[1]; d.steps[sid] = Object.assign(d.steps[sid] || {}, patch); d.at = Date.now(); save(); },
    item: (key) => { const st = c.steps.find((x) => x.id === key.split(':')[1]); const d = state.cases[c.id]; const k = c.camps.find((x) => x.id === d.camp); return { question: st.q, keys: st.keys, model: st.model, pitfalls: st.pitfalls, seances: st.seances, context: c.commun.map((x) => x.html).join(' ') + ' ' + (st.camp ? k.annexe : '') }; },
    onShown: (key) => { const el = document.getElementById('st-' + key.split(':')[1]); if (el) el.classList.add('done'); },
  });
  let prepTimer;
  root.addEventListener('input', (e) => {
    const t = e.target.closest('[data-prep]'); if (!t) return;
    clearTimeout(prepTimer);
    prepTimer = setTimeout(() => { const d = ensure(); d.prep[t.dataset.prep] = t.value; save(); const s = $('#prep-saved', root); if (s) s.textContent = 'Fiche enregistrée'; }, 500);
  });
  root.addEventListener('click', async (e) => {
    const cp = e.target.closest('[data-camp]');
    if (cp) { const d = ensure(); d.camp = cp.dataset.camp; d.startedAt = d.startedAt || Date.now(); save(); tab = 'dossier'; redraw(); window.scrollTo(0, 0); return; }
    const t = e.target.closest('[data-tab]');
    if (t && t.tagName === 'BUTTON') { tab = t.dataset.tab; redraw(); return; }
    if (e.target.closest('#switch')) {
      const ok = await confirmDialog('Changer de camp ?', 'Tes réponses sont conservées pour chaque étape ; tu retrouveras ce camp si tu y reviens.', 'Changer');
      if (ok) { state.cases[c.id].camp = null; save(); redraw(); }
      return;
    }
    if (e.target.closest('#reveal')) {
      const d = ensure();
      const p = caseProgress(c);
      if (p.done < p.total) {
        const ok = await confirmDialog('Révéler les annexes adverses ?', `Tu as ouvert la correction de ${p.done} étape${p.done > 1 ? 's' : ''} sur ${p.total}. Une fois les annexes révélées, l’effet de surprise est perdu.`, 'Révéler');
        if (!ok) return;
      }
      d.revealed = Date.now(); save(); redraw(); return;
    }
    if (e.target.closest('#copy-prep')) {
      const p = (state.cases[c.id] && state.cases[c.id].prep) || {};
      const txt = `FICHE DE NÉGOCIATION — ${c.title}\n\n` + PREP.map(([k, l]) => `${l.toUpperCase()}\n${p[k] || '—'}`).join('\n\n');
      copyText(txt);
    }
  });
}
