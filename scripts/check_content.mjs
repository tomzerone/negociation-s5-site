// Vérifie la cohérence du contenu : identifiants, réponses, barèmes, liens internes.  →  npm run check
import { SEANCES, CORRESPONDANCES } from '../src/content/cours.js';
import { FICHES, LEXIQUE } from '../src/content/fiches.js';
import { FLASHCARDS } from '../src/content/flashcards.js';
import { QCM } from '../src/content/qcm.js';
import { QUESTIONS } from '../src/content/questions.js';
import { METHODE } from '../src/content/methode.js';
import { EXERCICES } from '../src/content/exercices.js';
import { SIMS } from '../src/content/simulateur.js';
import { CAS } from '../src/content/cas.js';
import { EXAMS } from '../src/content/examens.js';

const errors = [];
const err = (m) => errors.push(m);
const uniq = (arr, label) => { const s = new Set(); arr.forEach((id) => { if (s.has(id)) err(`${label} : identifiant en double ${id}`); s.add(id); }); };
const TAGS = new Set(['s1', 's2', 's3', 's4', 'cas', 'x']);
const SE = Object.fromEntries(SEANCES.map((s) => [s.id, s]));

// Cours
SEANCES.forEach((s) => { uniq(s.sections.map((x) => x.id), `Séance ${s.num}`); s.sections.forEach((x) => { if (!x.station || x.station.length > 22) err(`Station trop longue ou absente : ${s.id}-${x.id}`); }); });
CORRESPONDANCES.forEach((c) => c.stations.forEach(([s, sec]) => { if (!SE[s] || !SE[s].sections.find((x) => x.id === sec)) err(`Correspondance ${c.id} : station inconnue ${s}-${sec}`); }));
// Fiches
[...SEANCES.map((s) => s.id), 'cas'].forEach((id) => { if (!FICHES[id]) err(`Fiche manquante : ${id}`); else if (FICHES[id].express.length < 8) err(`Fiche express courte : ${id}`); });
LEXIQUE.forEach((l) => { if (!TAGS.has(l.s)) err(`Lexique ${l.t} : tag ${l.s}`); });
// Flashcards / QCM / Questions
uniq(FLASHCARDS.map((f) => f.id), 'Flashcards');
FLASHCARDS.forEach((f) => { if (!TAGS.has(f.s)) err(`Flashcard ${f.id} : tag ${f.s}`); if (!f.q || !f.a) err(`Flashcard ${f.id} vide`); });
uniq(QCM.map((q) => q.id), 'QCM');
QCM.forEach((q) => {
  const ok = q.o.filter((o) => o[1]).length;
  if ((q.t === 'single' || q.t === 'tf') && ok !== 1) err(`QCM ${q.id} : ${ok} bonnes réponses pour une question à réponse unique`);
  if (q.t === 'multi' && ok < 1) err(`QCM ${q.id} : aucune bonne réponse`);
  q.o.forEach((o, i) => { if (!o[2]) err(`QCM ${q.id} : proposition ${i + 1} sans explication`); });
  if (!TAGS.has(q.s)) err(`QCM ${q.id} : tag ${q.s}`);
});
uniq(QUESTIONS.map((q) => q.id), 'Questions');
QUESTIONS.forEach((q) => { if (!q.keys || q.keys.length < 2) err(`Question ${q.id} : éléments attendus insuffisants`); if (!q.model) err(`Question ${q.id} : pas de modèle`); });
// Méthode
uniq(METHODE.steps.map((s) => s.id), 'Méthode');
// Exercices
uniq(EXERCICES.map((x) => x.id), 'Exercices');
EXERCICES.forEach((x) => x.items.forEach((it, i) => {
  const at = `Exercice ${x.id} item ${i + 1}`;
  if (it.type === 'single' && !(it.answer >= 0 && it.answer < it.options.length)) err(`${at} : réponse hors limites`);
  if (it.type === 'multi' && !(it.answers.length && it.answers.every((a) => a >= 0 && a < it.options.length))) err(`${at} : réponses hors limites`);
  if (it.type === 'classify') it.entries.forEach((e, j) => { if (!(e[1] >= 0 && e[1] < it.cats.length)) err(`${at} entrée ${j + 1} : catégorie hors limites`); if (!e[2]) err(`${at} entrée ${j + 1} : pas d’explication`); });
  if (it.type === 'grid') it.rows.forEach((r, j) => { if (!(r.answer >= 0 && r.answer < r.options.length)) err(`${at} ligne ${j + 1} : réponse hors limites`); });
  if (it.type === 'numeric' && (typeof it.answer !== 'number' || !it.steps)) err(`${at} : numérique incomplet`);
  if (it.type === 'order' && it.steps.length < 3) err(`${at} : ordre trop court`);
  if (!['single', 'multi', 'classify', 'grid', 'numeric', 'order'].includes(it.type)) err(`${at} : type inconnu ${it.type}`);
}));
// Simulateur
uniq(SIMS.map((s) => s.id), 'Simulateur');
SIMS.forEach((s) => s.nodes.forEach((n, i) => {
  if (n.choices.length < 2) err(`Simulateur ${s.id} étape ${i + 1} : moins de 2 choix`);
  if (!n.choices.some((c) => c.q === 'good')) err(`Simulateur ${s.id} étape ${i + 1} : aucun bon choix`);
  n.choices.forEach((c, j) => { if (!['good', 'ok', 'bad'].includes(c.q) || !Array.isArray(c.g) || c.g.length !== 4 || !c.fb) err(`Simulateur ${s.id} étape ${i + 1} choix ${j + 1} incomplet`); });
}));
// Cas
uniq(CAS.map((c) => c.id), 'Cas');
CAS.forEach((c) => {
  uniq(c.steps.map((s) => s.id), `Cas ${c.id} étapes`);
  const camps = new Set(c.camps.map((k) => k.id));
  c.steps.forEach((st) => { if (st.camp && !camps.has(st.camp)) err(`Cas ${c.id} : étape ${st.id} pour un camp inconnu`); st.seances.forEach((s) => { if (!SE[s]) err(`Cas ${c.id} étape ${st.id} : séance ${s}`); }); if (!st.keys || st.keys.length < 3) err(`Cas ${c.id} étape ${st.id} : éléments attendus insuffisants`); });
  c.camps.forEach((k) => { if (!c.steps.some((st) => st.camp === k.id)) err(`Cas ${c.id} : aucun exercice propre au camp ${k.id}`); if (!c.debrief || !c.debrief[k.id]) err(`Cas ${c.id} : pas de débrief pour ${k.id}`); });
  c.seances.forEach((s) => { if (!SE[s]) err(`Cas ${c.id} : séance ${s}`); });
});
// Contrôles blancs
EXAMS.forEach((ex) => {
  let tot = 0;
  ex.parts.forEach((p) => p.questions.forEach((q) => {
    const s = q.criteria.reduce((a, c) => a + c[1], 0);
    if (Math.abs(s - q.points) > 1e-9) err(`Contrôle ${ex.id} question ${q.id} : barème ${s} ≠ ${q.points}`);
    tot += q.points;
  }));
  if (Math.abs(tot - 20) > 1e-9) err(`Contrôle ${ex.id} : total ${tot} ≠ 20`);
});
uniq(EXAMS.flatMap((ex) => ex.parts.flatMap((p) => p.questions.map((q) => q.id))), 'Questions de contrôle');

// Liens internes (#route) présents dans le contenu
const ROUTES = {
  accueil: () => true, cours: (p) => !p || (() => { const [s, ...r] = p.split('-'); return SE[s] && (!r.length || SE[s].sections.some((x) => x.id === r.join('-').replace(/-b\d+$/, ''))); })(),
  fiches: (p) => !p || FICHES[p] || ['transversale', 'lexique'].includes(p), flashcards: (p) => !p || TAGS.has(p) || ['all', 'review', 'due', 'new'].includes(p),
  qcm: (p) => !p || TAGS.has(p), questions: (p) => !p || QUESTIONS.some((q) => q.id === p), methode: (p) => !p, exercices: (p) => !p || EXERCICES.some((x) => x.id === p),
  simulateur: (p) => !p || SIMS.some((s) => s.id === p), cas: (p) => !p || CAS.some((c) => c.id === p), examens: (p) => !p, examen: (p) => EXAMS.some((e) => e.id === p),
  revision: () => true, reglages: () => true, recherche: () => true,
};
const all = JSON.stringify({ SEANCES, FICHES, METHODE, EXERCICES, SIMS, CAS, EXAMS, QUESTIONS });
const links = new Set([...all.matchAll(/href=\\"#([a-z0-9-]+)\\"/g)].map((m) => m[1]));
links.forEach((h) => { const i = h.indexOf('-'); const name = i < 0 ? h : h.slice(0, i); const param = i < 0 ? '' : h.slice(i + 1); if (!ROUTES[name] || !ROUTES[name](param)) err(`Lien interne cassé : #${h}`); });

// Calculs du cas MarketOne
const near = (a, b) => Math.abs(a - b) < 1e-9;
if (!near(50 - 7.5 - 21 - 1.5 - 4.5, 15.5) || !near(50 - 7.5 - 21 - 1.5 - 5.8, 14.2) || !near(50 - 6 - 21 - 1.5 - 5.2, 16.3)) err('Calculs MarketOne incohérents');

const counts = { séances: SEANCES.length, sections: SEANCES.reduce((a, s) => a + s.sections.length, 0), lexique: LEXIQUE.length, flashcards: FLASHCARDS.length, qcm: QCM.length, questions: QUESTIONS.length, exercices: EXERCICES.length, items: EXERCICES.reduce((a, x) => a + x.items.length, 0), simulations: SIMS.length, cas: CAS.length, étapesCas: CAS.reduce((a, c) => a + c.steps.length, 0), contrôles: EXAMS.length, liensInternes: links.size };
console.log(counts);
if (errors.length) { console.error(errors.map((e) => '✗ ' + e).join('\n')); process.exit(1); }
console.log('Contenu cohérent ✓');
