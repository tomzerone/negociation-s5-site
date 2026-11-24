# Négociation spécifique — plateforme de révision

Plateforme personnelle de révision du module **Négociation spécifique** (BUT Techniques de commercialisation, parcours MDEE, S5), construite à partir des quatre supports de cours (appels d’offres, référencement en grande distribution, agent sportif, négociations spécifiques) et du cas pratique **MarketOne / TempoRun**.

Le site est organisé comme un **plan de métro** : chaque séance est une ligne colorée, chaque notion une station, et les notions transversales (grille d’analyse, rapport de force, BATNA, concession ↔ contrepartie…) sont des correspondances.

## Accès

- **GitHub Pages** : https://tomzerone.github.io/negociation-s5-site/ — une fois Pages activé (dépôt public, *Settings → Pages → Deploy from a branch → `main` / `/docs`*). La progression est gardée dans le navigateur ; la correction par Claude est remplacée par l’auto-évaluation guidée.
- **Page claude.ai (artefact)** : https://claude.ai/artifact/CcUD3gzvXzPiDcv73Ahxur — privée par défaut ; progression synchronisée entre tes appareils et correction des réponses rédigées par Claude.
- **Hors ligne** : ouvrir `dist/negociation-revision.html` (un seul fichier, tout inclus).
- **Serveur local** : `npm install && npm run build && npm run serve`, puis http://localhost:8080.

## Contenu

| Rubrique | Contenu |
|---|---|
| Tableau de bord | Réseau des 4 lignes (stations lues, maîtrise par séance), chiffres clés, parcours conseillé, reprise, compte à rebours du contrôle |
| Cours | 4 séances, 32 stations ; encadrés « Cours » (supports et notes) distingués des encadrés « Plateforme » (explications, applications, pièges) ; sources par diapositive |
| Fiches et lexique | Fiche complète + fiche express par séance, fiche du cas MarketOne, fiche transversale (contextes comparés, boîte à outils), lexique de 48 notions |
| Flashcards | 152 cartes, répétition espacée (Leitner : 1, 3, 7, 15, 30 jours), raccourcis clavier |
| QCM | 92 questions (réponse unique, multiple, vrai/faux), chaque proposition expliquée |
| Questions de cours | 31 questions factuelles et ouvertes, réponse modèle, éléments attendus à cocher, erreurs fréquentes |
| Exercices d’application | 16 exercices (75 items) : identifier le contexte, 4 dimensions, grille, consultation, Go/No-Go, faits/hypothèses, information confidentielle, rapport de force, BATNA, concessions, arguments, questions, calculs, prix/valeur, processus, mandat |
| Simulateur | 4 négociations à choix (référencement, appel d’offres, agent sportif, commission contradictoire MarketOne) avec retours du coach et jauges |
| Méthode d’analyse | La grille en 10 étapes illustrée sur MarketOne, construction de la stratégie, rédaction au contrôle, trois niveaux de réponse, formulations, erreurs fréquentes |
| Cas pratiques | 5 cas à plusieurs camps avec dossier commun, annexes confidentielles, analyse guidée (48 étapes corrigées), fiche de préparation, débrief et synthèse |
| Contrôles blancs | 3 sujets (questions de cours + cas pratique écrit), chronomètre, correction argumentée et barème indicatif sur 20 |
| Révision ciblée, recherche, points à vérifier, réglages | Plan de travail sur la séance la plus fragile, recherche plein texte, signalement des écarts entre supports, sauvegarde / import de la progression |

## Organisation du dépôt

```
src/content/   contenu pédagogique (cours, fiches, flashcards, qcm, questions, methode, exercices, simulateur, cas-*.js, examens)
src/app/       application (store.js = progression, data.js = indicateurs et recherche, ai.js = correction par Claude, views/ = écrans)
src/styles.css styles ; src/index.html page
scripts/       build.mjs (construction), check_content.mjs (cohérence du contenu), test_e2e.py (tests navigateur), shot.py (captures)
dist/          site construit (index.html + app.js + styles.css, et version fichier unique)
docs/          copie pour GitHub Pages
```

## Maintenance

- **Corriger ou compléter le contenu** : modifier le fichier concerné dans `src/content/` (format décrit en tête de chaque fichier), puis `npm run build`. Les identifiants des cartes et des questions sont stables par groupe : ajouter les nouveaux éléments en fin de groupe pour ne pas décaler la progression.
- **Vérifier le contenu** : `npm run check` (identifiants, réponses, barèmes à 20, liens internes, calculs du cas).
- **Tester** : `python3 scripts/test_e2e.py` (Playwright + Chrome, ordinateur et mobile : navigation de toutes les pages, débordements, flashcards, QCM, questions, exercices, simulateur, cas, contrôle blanc, recherche, réglages, persistance).

## Règles de fidélité

Les notions présentées comme « Cours » viennent des supports et des compléments de notes. Tout ce que la plateforme ajoute (explications, illustrations chiffrées, pièges, méthode, cas d’entraînement, contrôles blancs) est signalé comme tel. Les écarts entre supports (par exemple la liste « avant de proposer un prix » en séance 2) et les éléments incertains (phrase coupée de la séance 4, annexe MarketOne simulée) sont listés dans la page **Points à vérifier** plutôt que corrigés en silence. Les barèmes des contrôles blancs sont indicatifs, pas ceux du professeur.
