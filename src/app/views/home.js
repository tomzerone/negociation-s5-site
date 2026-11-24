import { state } from '../store.js';
import { SEANCES, CORRESPONDANCES, FLASHCARDS, QCM, EXERCICES, CAS, SIMS, EXAMS, seanceStats, globalStats, weakSeances, seLabel, daysLeft, caseProgress } from '../data.js';
import { esc, icon, fmtDate, pct, note20, plural, roundel, bar } from '../ui.js';

function greet() { const h = new Date().getHours(); return h < 5 ? 'Bonne nuit' : h < 18 ? 'Bonjour' : 'Bonsoir'; }

// Stations de correspondance : sections citées par au moins une notion transversale
const XST = {};
CORRESPONDANCES.forEach((c) => c.stations.forEach(([s, sec]) => { (XST[s + '-' + sec] = XST[s + '-' + sec] || []).push(c.label); }));

export function networkMap() {
  const lines = SEANCES.map((s) => {
    const st = seanceStats(s.id);
    const seen = (state.seances[s.id] && state.seances[s.id].seen) || {};
    const m = st.mastery == null ? null : Math.round(st.mastery * 100);
    const stations = s.sections.map((sec) => {
      const x = XST[s.id + '-' + sec.id];
      const title = sec.title + (x ? ' — correspondance : ' + x.join(', ') : '') + (seen[sec.id] ? ' (lu)' : '');
      return `<li><a class="st ${seen[sec.id] ? 'seen' : ''} ${x ? 'x' : ''}" href="#cours-${s.id}-${sec.id}" title="${esc(title)}" aria-label="${esc(title)}"></a><span class="st-l">${esc(sec.station)}</span></li>`;
    }).join('');
    return `<div class="ln ${s.color}">
      <a class="ln-t" href="#cours-${s.id}">${roundel(s.id, s.num)}<span class="ln-n"><strong>${esc(s.short)}</strong><span>${st.sectionsSeen}/${st.sections} stations lues${st.studied ? ' · étudiée' : ''}</span></span></a>
      <div class="ln-wrap"><ol class="ln-track">${stations}</ol></div>
      <div class="ln-m">${m == null ? '—' : m + ' %'}<small>maîtrise</small></div>
    </div>`;
  }).join('');
  return `<section class="net" aria-labelledby="h-net">
    <div class="net-h"><h2 id="h-net">Ton réseau de révision</h2><a href="#fiches-transversale" class="small">Voir les correspondances entre séances</a></div>
    ${lines}
    <div class="net-k"><span><i></i>station à lire</span><span><i class="f"></i>station lue</span><span><i class="x"></i>correspondance : notion qui relie plusieurs séances</span></div>
  </section>`;
}

export function render() {
  const g = globalStats();
  const last = state.last;
  const dl = daysLeft();
  const resume = last && last.route !== 'accueil'
    ? `<a class="resume" href="#${esc(last.route)}"><span class="resume-k">Reprendre là où tu t’es arrêté</span><span class="resume-t">${esc(last.label)}</span><span class="resume-d">${fmtDate(last.at)}</span></a>`
    : `<a class="resume" href="#cours-s1"><span class="resume-k">Pour commencer</span><span class="resume-t">Séance 1 — Entrer dans les négociations spécifiques</span><span class="resume-d">La grille d’analyse sert dans toutes les autres séances</span></a>`;

  const exDone = Object.keys(state.drills).length;
  const lastExam = state.exams[0];
  const casStarted = CAS.filter((c) => caseProgress(c).started).length;
  const steps = [
    { t: 'Lire les quatre séances', d: 'Le cours, station par station', href: 'cours', done: g.studied === SEANCES.length, m: `${g.studied}/4` },
    { t: 'Relire les fiches express', d: 'L’essentiel de chaque séance en 10 lignes', href: 'fiches', done: SEANCES.every((s) => state.seances[s.id] && state.seances[s.id].fiche), m: `${SEANCES.filter((s) => state.seances[s.id] && state.seances[s.id].fiche).length}/4` },
    { t: 'Mémoriser avec les flashcards', d: 'Répétition espacée', href: 'flashcards', done: FLASHCARDS.length > 0 && g.mastered >= FLASHCARDS.length * 0.7, m: `${g.mastered}/${FLASHCARDS.length}` },
    { t: 'Vérifier avec les QCM', d: 'Chaque réponse expliquée', href: 'qcm', done: QCM.length > 0 && g.qcmAnswered >= QCM.length * 0.7 && g.qcmOk >= g.qcmAnswered * 0.7, m: `${g.qcmAnswered}/${QCM.length}` },
    { t: 'Appliquer avec les exercices', d: 'Contexte, rapport de force, concessions, calculs…', href: 'exercices', done: EXERCICES.length > 0 && exDone >= Math.ceil(EXERCICES.length * 0.6), m: `${exDone}/${EXERCICES.length}` },
    { t: 'S’entraîner au simulateur', d: 'Choisir ses réponses face à l’autre partie', href: 'simulateur', done: g.simDone >= 2, m: `${g.simDone}/${SIMS.length}` },
    { t: 'Analyser un cas pratique complet', d: 'Informations communes et confidentielles, plusieurs camps', href: 'cas', done: g.casDone >= 1, m: `${casStarted}/${CAS.length}` },
    { t: 'Passer un contrôle blanc', d: 'Questions de cours + cas pratique, chronométré', href: 'examens', done: state.exams.length > 0, m: `${state.exams.length ? state.exams.length + ' fait' + (state.exams.length > 1 ? 's' : '') : '0/' + EXAMS.length}` },
  ];
  const path = steps.map((s) => `<li class="${s.done ? 'done' : ''}"><div><a href="#${s.href}">${esc(s.t)}</a><span>${esc(s.d)}</span></div><em>${s.m}</em></li>`).join('');

  const weak = weakSeances(2);
  const hasData = g.qcmAnswered || g.mastered || g.toReview || exDone;
  const diff = hasData
    ? weak.map((w) => `<li><a href="#cours-${w.id}">${esc(seLabel(w.id))}</a><span class="muted small">${w.s.mastery == null ? 'pas encore évaluée' : Math.round(w.s.mastery * 100) + ' % de maîtrise'}${w.s.toReview ? ', ' + plural(w.s.toReview, 'carte à revoir', 'cartes à revoir') : ''}</span></li>`).join('')
    : `<li class="empty">Tes points faibles apparaîtront ici dès tes premières flashcards, tes premiers QCM et exercices.</li>`;

  const qRuns = state.qcmRuns.slice(0, 4).map((r) => `<li><span>${esc(r.label)}</span><strong>${r.score}/${r.total}</strong><em>${fmtDate(r.at)}</em></li>`).join('') || '<li class="empty">Aucun QCM terminé pour l’instant.</li>';
  const exRuns = Object.entries(state.drills).sort((a, b) => b[1].at - a[1].at).slice(0, 4).map(([id, d]) => {
    const x = EXERCICES.find((e) => e.id === id);
    return x ? `<li><a href="#exercices-${id}">${esc(x.title)}</a><strong>${pct(d.last * 100, 100)} %</strong><em>${fmtDate(d.at)}</em></li>` : '';
  }).join('') || '<li class="empty">Aucun exercice fait pour l’instant.</li>';
  const eRuns = state.exams.slice(0, 4).map((r) => `<li><span>${esc(r.title)}</span><strong>${note20(r.score20)}/20</strong><em>${fmtDate(r.at)}${r.by === 'ai' ? ' · corrigé par Claude' : ' · auto-évalué'}</em></li>`).join('') || '<li class="empty">Aucun contrôle blanc passé pour l’instant.</li>';

  const html = `
  <header class="home-h">
    <div>
      <h1>${greet()}${state.name ? ' ' + esc(state.name) : ''}</h1>
      <p class="lead">Négociation spécifique — BUT TC, parcours MDEE. ${g.progress ? `Tu as parcouru <strong>${g.progress} %</strong> du programme de révision.` : 'Quatre séances, un cas du cours, et tout ce qu’il faut pour raisonner comme un négociateur le jour du contrôle.'}</p>
      ${dl != null ? `<p class="countdown">${dl > 0 ? `Contrôle dans <b>${dl}</b> jour${dl > 1 ? 's' : ''}` : dl === 0 ? '<b>Contrôle aujourd’hui</b> — bonne chance !' : 'Date du contrôle passée — <a href="#reglages">la modifier</a>'}</p>` : `<p class="countdown small"><a href="#reglages">Indiquer la date du contrôle</a> pour afficher un compte à rebours</p>`}
    </div>
    ${resume}
  </header>
  ${networkMap()}
  <section class="figures" aria-label="Chiffres clés">
    <a href="#cours" class="fig"><b>${g.studied}<small>/4</small></b><span>séances étudiées</span></a>
    <a href="#flashcards" class="fig"><b>${g.mastered}<small>/${FLASHCARDS.length}</small></b><span>flashcards maîtrisées${g.toReview ? `, <em>${g.toReview} à revoir</em>` : ''}</span></a>
    <a href="#qcm" class="fig"><b>${g.qcmAnswered ? pct(g.qcmOk, g.qcmAnswered) + '<small> %</small>' : '—'}</b><span>de réussite aux QCM (${g.qcmAnswered}/${QCM.length} vues)</span></a>
    <a href="#exercices" class="fig"><b>${g.exAvg == null ? '—' : Math.round(g.exAvg * 100) + '<small> %</small>'}</b><span>aux exercices (${g.exDone}/${EXERCICES.length} faits)</span></a>
    <a href="#cas" class="fig"><b>${g.casStarted}<small>/${CAS.length}</small></b><span>cas pratiques commencés</span></a>
    <a href="#examens" class="fig"><b>${lastExam ? note20(lastExam.score20) + '<small>/20</small>' : '—'}</b><span>dernier contrôle blanc</span></a>
  </section>
  <div class="home-grid">
    <section class="panel" aria-labelledby="h-path"><h2 id="h-path">Parcours conseillé</h2>${'<ol class="path">' + path + '</ol>'}</section>
    <div>
      <section class="panel soft">
        <h2>Révision ciblée</h2>
        <p>Une séance construite sur tes points faibles : stations à relire, cartes fragiles, QCM et exercice sur la séance la moins maîtrisée.</p>
        <a class="btn primary" href="#revision">${icon('spark')} Lancer une séance</a>
        ${g.due ? `<p class="muted small" style="margin-top:10px">${plural(g.due, 'carte arrive', 'cartes arrivent')} à échéance de révision.</p>` : ''}
      </section>
      <section class="panel"><h2>Points à renforcer</h2><ul class="rows">${diff}</ul></section>
    </div>
  </div>
  <div class="home-cols">
    <section class="panel"><h2>Derniers QCM</h2><ul class="rows">${qRuns}</ul></section>
    <section class="panel"><h2>Derniers exercices</h2><ul class="rows">${exRuns}</ul></section>
    <section class="panel"><h2>Contrôles blancs</h2><ul class="rows">${eRuns}</ul></section>
  </div>`;
  return { html, title: 'Tableau de bord', noFocus: true };
}
