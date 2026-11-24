// Correction assistée par Claude (capability « sample » des artefacts claude.ai), uniquement au regard du cours.
// Hors artefact (GitHub Pages, fichier local), ces fonctions renvoient null et l'auto-évaluation guidée prend le relais.
import { SE, SEANCES } from './data.js';
import { blockText, strip } from './ui.js';

let samplePromise = null;
export function getSample() {
  const C = typeof window !== 'undefined' ? window.claude : null;
  if (!C || typeof C.use !== 'function') return Promise.resolve(null);
  if (!samplePromise) samplePromise = C.use('sample').catch(() => null);
  return samplePromise;
}

function courseExcerpt(ids) {
  const list = (ids && ids.length ? ids : SEANCES.map((s) => s.id)).filter((id) => SE[id]);
  return list.map((id) => {
    const s = SE[id];
    return `## Séance ${s.num} — ${s.title}\n` + s.sections.map((sec) => `### ${sec.title}\n` + sec.blocks.map(blockText).filter(Boolean).join('\n')).join('\n');
  }).join('\n\n');
}

const RULES = `Tu es correcteur d'un contrôle de « Négociation spécifique » (BUT Techniques de commercialisation, 3e année, parcours MDEE).
Règles impératives :
- Évalue UNIQUEMENT au regard du COURS fourni et des éléments attendus. N'exige aucune notion absente du cours.
- Une idée juste formulée avec d'autres mots que le corrigé est juste. Ne note pas la simple présence de mots-clés : évalue le raisonnement (analyse de la situation, application aux faits, argumentation, cohérence).
- Une affirmation contraire au cours ou aux faits de l'énoncé est une erreur, même entourée de bons mots-clés. Une information inventée (chiffre, garantie, fait absent de l'énoncé) est une erreur.
- Valorise une réponse qui commence par analyser la situation (contexte, parties, rapport de force, alternatives, informations) avant de proposer une solution.
- Sois exigeant mais bienveillant, tutoie l'étudiant, écris en français, phrases courtes.
- Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour.`;

async function ask(prompt, signal) {
  const sample = await getSample();
  if (!sample) throw { code: 'unavailable', message: 'Correction automatique indisponible ici' };
  let value;
  if (typeof sample.json === 'function') value = await sample.json(prompt, { modelTier: 'default', signal });
  else {
    const r = await sample(prompt, { modelTier: 'default', signal });
    const m = r.text.match(/\{[\s\S]*\}/);
    value = JSON.parse(m ? m[0] : r.text);
  }
  if (typeof value === 'string') { const m = value.match(/\{[\s\S]*\}/); value = JSON.parse(m ? m[0] : value); }
  return value;
}

// Question ouverte / factuelle, étape de cas pratique : éléments attendus cochés + commentaire
export async function evaluateAnswer({ context, question, keys, model, answer, seances }, signal) {
  const prompt = `${RULES}

# COURS (référence)
${courseExcerpt(seances)}
${context ? `\n# SITUATION / ÉNONCÉ\n${strip(context)}\n` : ''}
# QUESTION
${question}

# ÉLÉMENTS ATTENDUS
${keys.map((k, i) => `${i + 1}. ${k}`).join('\n')}

# RÉPONSE MODÈLE (indicative)
${strip(model)}

# RÉPONSE DE L'ÉTUDIANT
"""${answer}"""

# FORMAT DE SORTIE (JSON)
{
 "elements": [true/false pour chaque élément attendu, dans l'ordre : true seulement s'il est traité correctement],
 "raisonnement": 0-4 (qualité de l'analyse et de l'argumentation),
 "points_forts": ["..."],
 "a_ameliorer": ["..."],
 "erreurs": ["affirmations fausses au regard du cours ou de l'énoncé ; [] si aucune"],
 "synthese": "2 phrases maximum"
}`;
  const v = await ask(prompt, signal);
  const el = Array.isArray(v.elements) ? keys.map((_, i) => !!v.elements[i]) : keys.map(() => false);
  const raisonnement = Math.max(0, Math.min(4, Number(v.raisonnement) || 0));
  const score = keys.length ? (0.75 * (el.filter(Boolean).length / keys.length) + 0.25 * (raisonnement / 4)) : raisonnement / 4;
  return {
    score, elements: el, raisonnement,
    points_forts: (v.points_forts || []).map(String), a_ameliorer: (v.a_ameliorer || []).map(String),
    erreurs: (v.erreurs || []).map(String), synthese: String(v.synthese || ''),
  };
}

// Question de contrôle blanc notée selon une grille [élément, points]
export async function evaluateExamQuestion({ context, question, criteria, model, answer, seances }, signal) {
  const prompt = `${RULES}

# COURS (référence)
${courseExcerpt(seances)}
${context ? `\n# ÉNONCÉ\n${strip(context)}\n` : ''}
# QUESTION
${question}

# CORRIGÉ DE RÉFÉRENCE
${strip(model)}

# GRILLE (élément attendu → points maximum)
${criteria.map((c, i) => `${i + 1}. ${c[0]} → ${c[1]} pt`).join('\n')}

# RÉPONSE DE L'ÉTUDIANT
"""${answer}"""

Attribue pour chaque élément de la grille un nombre de points entre 0 et son maximum (demi-points autorisés). Un élément évoqué mais faux ou mal appliqué vaut 0.
# FORMAT DE SORTIE (JSON)
{"grille": [{"points": nombre, "justification": "courte"}], "commentaire": "2 phrases maximum", "erreurs": ["..."]}`;
  const v = await ask(prompt, signal);
  const grille = criteria.map((c, i) => {
    const g = (v.grille && v.grille[i]) || {};
    const p = Math.max(0, Math.min(c[1], Math.round((Number(g.points) || 0) * 2) / 2));
    return { points: p, justification: String(g.justification || '') };
  });
  return { grille, points: grille.reduce((a, g) => a + g.points, 0), commentaire: String(v.commentaire || ''), erreurs: (v.erreurs || []).map(String) };
}

export function aiError(err) {
  const code = err && err.code;
  if (code === 'not_granted') return 'La correction par Claude n’a pas été autorisée. Utilise l’auto-évaluation guidée.';
  if (code === 'rate_limited') return 'Trop de demandes de correction : réessaie dans quelques minutes, ou utilise l’auto-évaluation.';
  return 'La correction automatique n’a pas abouti. Réessaie, ou utilise l’auto-évaluation guidée.';
}
