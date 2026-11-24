import { state, save, logSession, sync, exportJSON, importJSON, resetAll } from '../store.js';
import { SEANCES, SE, FLASHCARDS, QCM, QUESTIONS, EXERCICES, CAS, seanceStats, weakSeances, search, snippet, highlight, isToReview, isDue, seLabel } from '../data.js';
import { esc, icon, roundel, pct, toast, confirmDialog, copyText, $, fr } from '../ui.js';
import { setTheme } from '../main.js';

let query = '';
export function setQuery(q) { query = q; }

// ───────── Révision ciblée
let pick = null;
const revision = {
  render() {
    const target = pick || (weakSeances(1)[0] || {}).id || 's1';
    const s = SE[target];
    const st = seanceStats(target);
    const seen = (state.seances[target] && state.seances[target].seen) || {};
    const unread = s.sections.filter((x) => !seen[x.id]);
    const cards = FLASHCARDS.filter((f) => f.s === target);
    const toRev = cards.filter((f) => isToReview(f.id)).length;
    const due = cards.filter((f) => state.cards[f.id] && isDue(f.id)).length;
    const qs = QUESTIONS.filter((q) => q.s === target).sort((a, b) => ((state.questions[a.id] || {}).score ?? -1) - ((state.questions[b.id] || {}).score ?? -1)).slice(0, 2);
    const ex = EXERCICES.filter((x) => x.s === target).sort((a, b) => ((state.drills[a.id] || {}).best ?? -1) - ((state.drills[b.id] || {}).best ?? -1))[0] || EXERCICES.filter((x) => x.s === 'x' || x.s === 'cas')[0];
    const cas = CAS.find((c) => c.seances[0] === target) || CAS[0];
    const steps = [
      { t: unread.length ? `Relire ${unread.length} station${unread.length > 1 ? 's' : ''} non lue${unread.length > 1 ? 's' : ''}` : 'Relire la fiche express', d: unread.length ? unread.map((x) => x.station).join(' · ') : 'Dix phrases à savoir par cœur', href: unread.length ? `cours-${target}-${unread[0].id}` : `fiches-${target}` },
      { t: `Flashcards de la séance (${toRev} à revoir, ${due} à échéance)`, d: `${st.mastered}/${st.cards} cartes maîtrisées`, href: `flashcards-${target}` },
      { t: 'QCM ciblé sur la séance', d: st.qcmAnswered ? `${pct(st.qcmOk, st.qcmAnswered)} % de réussite sur ${st.qcmAnswered} questions vues` : 'Pas encore de QCM sur cette séance', href: `qcm-${target}` },
      ...qs.map((q) => ({ t: 'Question de cours', d: q.q, href: `questions-${q.id}` })),
      { t: `Exercice : ${ex.title}`, d: state.drills[ex.id] ? `Meilleur score ${pct(state.drills[ex.id].best * 100, 100)} %` : 'Pas encore fait', href: `exercices-${ex.id}` },
      { t: `Cas pratique : ${cas.title}`, d: cas.context, href: `cas-${cas.id}` },
    ];
    const html = `<header class="page-h"><h1>Révision ciblée</h1><p class="lead">Une séance de travail construite sur tes points faibles. ${pick ? '' : 'La plateforme a choisi la séance la moins maîtrisée ; tu peux en choisir une autre.'}</p></header>
    <div class="chips">${SEANCES.map((x) => `<button class="chip ${x.color} ${x.id === target ? 'on' : ''}" data-pick="${x.id}"><span class="dot"></span>Séance ${x.num}</button>`).join('')}</div>
    <section class="panel ${s.color}"><div style="display:flex;gap:12px;align-items:center;margin-bottom:10px">${roundel(s.id, s.num)}<h2 style="margin:0">${esc(s.title)}</h2></div>
    <p class="muted">${st.mastery == null ? 'Maîtrise pas encore évaluée.' : `Maîtrise estimée : ${Math.round(st.mastery * 100)} %.`} ${st.sectionsSeen}/${st.sections} stations lues.</p>
    <ol class="path">${steps.map((x) => `<li><div><a href="#${x.href}">${esc(x.t)}</a><span>${esc(x.d)}</span></div><em>${icon('right')}</em></li>`).join('')}</ol></section>`;
    return { html, title: 'Révision ciblée', resume: 'Révision ciblée' };
  },
  mount(root) {
    logSession('revision', 'Révision ciblée');
    root.addEventListener('click', (e) => { const b = e.target.closest('[data-pick]'); if (b) { pick = b.dataset.pick; root.innerHTML = fr(revision.render().html); } });
  },
};

// ───────── Recherche
const recherche = {
  render() {
    const res = query ? search(query) : [];
    const html = `<header class="page-h"><h1>Recherche</h1></header>
    <form class="big-search" id="bs" role="search">${icon('search')}<label class="sr" for="bq">Rechercher</label><input id="bq" type="search" value="${esc(query)}" placeholder="BATNA, référencement, Go / No-Go, mandat…" autocomplete="off"><button class="btn primary small">Rechercher</button></form>
    ${query ? `<p class="muted">${res.length} résultat${res.length > 1 ? 's' : ''} pour « ${esc(query)} »</p>` : '<p class="muted">Cherche dans le cours, le lexique, les flashcards, les questions de cours, la méthode et les cas.</p>'}
    <ul class="results">${res.map((r) => `<li><a href="#${r.route}${r.anchor && r.kind === 'Cours' ? '' : ''}" data-anchor="${esc(r.anchor || '')}"><span class="kind">${esc(r.kind)}</span><strong>${highlight(esc(r.title), query)}</strong><span>${highlight(esc(snippet(r.text, query)), query)}</span></a></li>`).join('')}</ul>`;
    return { html, title: 'Recherche', noFocus: true };
  },
  mount(root) {
    const inp = $('#bq', root); if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
    $('#bs', root).addEventListener('submit', (e) => { e.preventDefault(); query = inp.value.trim(); root.innerHTML = fr(recherche.render().html); recherche.mount(root); });
    root.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-anchor]');
      if (a && a.dataset.anchor && a.getAttribute('href').startsWith('#cours-')) { e.preventDefault(); location.hash = 'cours-' + a.dataset.anchor; }
    });
  },
};

// ───────── Réglages
const reglages = {
  render() {
    let theme = 'auto'; try { theme = localStorage.getItem('nego-theme') || 'auto'; } catch { /* */ }
    const html = `<header class="page-h"><h1>Réglages et sauvegarde</h1></header>
    <section class="panel" style="max-width:760px">
      <h2>Toi</h2>
      <div class="form-row"><label for="nm">Prénom affiché sur le tableau de bord</label><input type="text" id="nm" value="${esc(state.name)}" autocomplete="given-name"></div>
      <div class="form-row"><label for="dt">Date du contrôle</label><input type="date" id="dt" value="${esc(state.examDate)}"><span class="muted small">Affiche un compte à rebours sur le tableau de bord.</span></div>
      <h2>Apparence</h2>
      <div class="seg" role="group" aria-label="Thème">${[['auto', 'Automatique'], ['light', 'Clair'], ['dark', 'Sombre']].map(([k, l]) => `<button data-theme="${k}" class="${theme === k ? 'on' : ''}">${l}</button>`).join('')}</div>
    </section>
    <section class="panel" style="max-width:760px">
      <h2>Sauvegarde de ta progression</h2>
      <p>${esc(sync.status)}. ${sync.mode === 'cloud' ? 'Ta progression est enregistrée dans ton compte et suit tes appareils.' : 'Ta progression est gardée dans ce navigateur. Pour la transférer sur un autre appareil, copie la sauvegarde ici puis colle-la sur l’autre appareil.'}</p>
      <div class="row-btns"><button class="btn" id="exp">${icon('copy')} Copier ma sauvegarde</button></div>
      <label class="sr" for="imp">Coller une sauvegarde</label><textarea id="imp" class="copybox" placeholder="Colle ici une sauvegarde copiée depuis un autre appareil…"></textarea>
      <div class="row-btns"><button class="btn" id="doimp">Importer la sauvegarde</button></div>
      <h2 style="margin-top:20px">Tout recommencer</h2>
      <p class="muted">Efface ta progression : séances lues, flashcards, QCM, exercices, cas et contrôles.</p>
      <button class="btn danger" id="reset">Effacer ma progression</button>
    </section>
    <p class="muted small">Plateforme construite à partir des supports du cours de Négociation spécifique (BUT TC, MDEE). Les cas d’entraînement et les contrôles blancs sont inventés pour s’entraîner.</p>`;
    return { html, title: 'Réglages' };
  },
  mount(root) {
    let t;
    root.addEventListener('input', (e) => {
      if (e.target.id === 'nm') { clearTimeout(t); t = setTimeout(() => { state.name = e.target.value.trim(); save(); }, 400); }
    });
    root.addEventListener('change', (e) => { if (e.target.id === 'dt') { state.examDate = e.target.value; save(); toast('Date du contrôle enregistrée'); } });
    root.addEventListener('click', async (e) => {
      const th = e.target.closest('[data-theme]');
      if (th) { setTheme(th.dataset.theme); root.querySelectorAll('[data-theme]').forEach((b) => b.classList.toggle('on', b === th)); return; }
      if (e.target.closest('#exp')) { copyText(exportJSON()); return; }
      if (e.target.closest('#doimp')) {
        const v = $('#imp', root).value.trim(); if (!v) return;
        try { importJSON(v); toast('Sauvegarde importée'); } catch { toast('Sauvegarde invalide'); }
        return;
      }
      if (e.target.closest('#reset')) {
        const ok = await confirmDialog('Effacer ta progression ?', 'Cette action est définitive sur cet appareil (et sur ton compte si la synchronisation est active).', 'Effacer');
        if (ok) { resetAll(); toast('Progression effacée'); location.hash = 'accueil'; }
      }
    });
  },
};

export const views = { revision, reglages, recherche };
