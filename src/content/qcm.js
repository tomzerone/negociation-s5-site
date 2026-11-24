// QCM — { t: 'single' | 'multi' | 'tf', q, o: [[proposition, juste ?, explication]], x?: explication générale }
// Identifiants stables par groupe (q-s1-01…) : ajouter les nouvelles questions en fin de groupe.
const V = (ok, why) => [['Vrai', ok, why], ['Faux', !ok, why]];

const S1 = [
  { t: 'single', q: 'Selon le cours, une négociation spécifique est une négociation…', o: [
    ['dont les modalités sont fortement influencées par les caractéristiques du contexte.', true, 'C’est la définition exacte du cours.'],
    ['qui porte sur un produit technique ou spécifique.', false, 'Le cours ne définit pas la négociation spécifique par l’objet vendu mais par le contexte.'],
    ['qui se déroule toujours avec plusieurs décideurs.', false, 'Le multi-acteurs n’est qu’un des contextes spécifiques possibles.'],
    ['dans laquelle le prix n’est pas négociable.', false, 'Rien de tel dans le cours ; le prix peut même devenir déterminant (enchère inversée).'],
  ] },
  { t: 'multi', q: 'Quels éléments font partie de la définition de la négociation commerciale donnée en cours ?', o: [
    ['Des intérêts au moins partiellement divergents.', true, 'Oui : sans divergence, il n’y aurait rien à négocier.'],
    ['La recherche d’un accord acceptable pour les parties.', true, 'Oui : c’est le résultat recherché.'],
    ['Des propositions, contre-propositions, concessions et contreparties.', true, 'Oui : ce sont les moyens mobilisés.'],
    ['L’obligation de conclure un accord.', false, 'Non : on recherche un accord, mais aucune partie n’est obligée de conclure (d’où l’importance des alternatives).'],
  ] },
  { t: 'tf', q: '« Le contexte est un simple décor : il ne change pas la façon de négocier. »', o: V(false, 'Le cours affirme l’inverse : « Le contexte n’est pas un simple décor. Il influence la manière dont la négociation est organisée et conduite. »') },
  { t: 'single', q: 'Quelle est l’idée centrale du module ?', o: [
    ['Le négociateur doit d’abord analyser la situation.', true, 'C’est la diapositive « Idée centrale du module ».'],
    ['Le négociateur doit obtenir le prix le plus élevé possible.', false, 'Le cours insiste au contraire sur le fait que la négociation ne se réduit pas au prix.'],
    ['Le négociateur doit toujours faire la première offre.', false, 'Le cours ne pose pas cette règle.'],
    ['Le négociateur doit éviter toute concession.', false, 'Les concessions font partie de la négociation, à condition d’obtenir une contrepartie.'],
  ] },
  { t: 'single', q: 'Les quatre dimensions qui caractérisent un contexte sont…', o: [
    ['le cadre, la temporalité, les acteurs et l’information.', true, 'Ce sont les quatre « premières dimensions à repérer ».'],
    ['le prix, le volume, le délai et le service.', false, 'Ce sont des variables négociables, pas des dimensions du contexte.'],
    ['l’acheteur, le vendeur, le produit et le marché.', false, 'Ce n’est pas la grille du cours.'],
    ['les objectifs, les enjeux, les contraintes et les alternatives.', false, 'Ce sont des questions de la grille d’analyse, pas les quatre dimensions.'],
  ] },
  { t: 'single', q: 'Dans une négociation fortement encadrée…', o: [
    ['une partie du processus est définie à l’avance (règles, délais, procédures, conditions de réponse).', true, 'C’est la définition du cours.'],
    ['les interlocuteurs et les sujets peuvent librement évoluer.', false, 'C’est la négociation relativement libre.'],
    ['il n’y a aucune marge de négociation.', false, 'Le cadre réduit la marge de manœuvre, mais ne la supprime pas forcément (ex. variables négociables en appel d’offres si la procédure le permet).'],
    ['une seule personne décide.', false, 'Le cadre ne dit rien du nombre de décideurs (c’est la dimension « acteurs »).'],
  ] },
  { t: 'multi', q: 'Quels exemples le cours donne-t-il de négociations fortement encadrées ?', o: [
    ['Appel d’offres', true, 'Exemple cité.'], ['Référencement', true, 'Exemple cité.'], ['Procédure d’achat', true, 'Exemple cité.'], ['Enchère inversée', true, 'Exemple cité.'],
    ['Rencontre directe avec le responsable d’une PME', false, 'C’est l’exemple de négociation classique, relativement libre.'],
  ] },
  { t: 'single', q: 'Quelle séquence correspond à un processus formalisé ?', o: [
    ['Préparation → candidature/réponse → sélection → négociation → décision → contractualisation', true, 'C’est la séquence du cours.'],
    ['Prise de contact → échanges → accord → contractualisation', false, 'C’est la négociation ponctuelle.'],
    ['Analyser → décider → marges → offre → négociation', false, 'C’est la démarche de réponse à un appel d’offres (séance 2), pas la définition du processus formalisé.'],
    ['Préparer l’offre → présenter → analyser → négocier → décider → formaliser → suivre', false, 'C’est le processus de référencement (séance 3).'],
  ] },
  { t: 'tf', q: 'Dans un processus formalisé, le négociateur maîtrise toutes les étapes.', o: V(false, 'Le cours précise : « Le négociateur ne maîtrise pas nécessairement toutes les étapes du processus. »') },
  { t: 'single', q: '« Plusieurs vendeurs ↔ 1 acheteur » correspond à…', o: [
    ['une mise en concurrence.', true, 'C’est la troisième configuration d’acteurs du cours.'],
    ['un comité d’achat.', false, 'Le comité, c’est 1 vendeur face à plusieurs interlocuteurs côté acheteur.'],
    ['une négociation individuelle.', false, 'Individuelle = 1 vendeur ↔ 1 acheteur.'],
    ['une négociation sous contrainte.', false, 'Ce n’est pas une configuration d’acteurs.'],
  ] },
  { t: 'single', q: 'Une information « relativement équilibrée » signifie que…', o: [
    ['les parties disposent d’informations assez proches, sans savoir exactement la même chose.', true, 'Le cours précise que cela ne signifie pas qu’elles savent exactement la même chose.'],
    ['les parties savent exactement la même chose.', false, 'C’est précisément ce que le cours exclut.'],
    ['aucune partie n’a d’information confidentielle.', false, 'Il peut rester des informations propres à chacun.'],
    ['toutes les informations sont publiques.', false, 'Ce n’est pas la définition.'],
  ] },
  { t: 'multi', q: 'Quels exemples d’information asymétrique le cours donne-t-il ?', o: [
    ['Le budget maximal de l’acheteur.', true, 'Exemple du cours.'],
    ['Le coût de revient et la marge minimale du vendeur.', true, 'Exemple du cours.'],
    ['Le prix public affiché du produit.', false, 'Un prix affiché est connu des deux parties.'],
    ['La date limite d’un appel d’offres publié.', false, 'Elle figure dans le dossier, accessible à tous les candidats.'],
  ] },
  { t: 'single', q: 'Quel indice permet de reconnaître un appel d’offres ?', o: [
    ['Procédure + cahier des charges + échéance', true, 'Indice exact du cours.'],
    ['Référencement + centrale d’achat', false, 'C’est l’indice du référencement.'],
    ['Mise en concurrence + mécanisme d’enchère', false, 'C’est l’indice de l’enchère inversée.'],
    ['Plusieurs interlocuteurs dans la décision', false, 'C’est l’indice du multi-acteurs.'],
  ] },
  { t: 'single', q: 'Dans une enchère inversée, que doit faire le négociateur en priorité ?', o: [
    ['Comprendre le mécanisme avant de décider de sa participation.', true, 'C’est ce que demande le cours.'],
    ['Proposer immédiatement le prix le plus bas possible.', false, 'Sans analyse du mécanisme (et de son seuil), c’est le risque de vendre à perte.'],
    ['Refuser de participer car le prix est la seule variable.', false, 'Le prix peut devenir déterminant, mais le cours ne recommande pas de refuser par principe.'],
    ['Demander un rendez-vous individuel à l’acheteur.', false, 'Ce n’est pas ce que le cours met en avant.'],
  ] },
  { t: 'multi', q: 'Quelles contraintes le cours cite-t-il pour une négociation « sous contraintes » ?', o: [
    ['Délai', true, 'Citée.'], ['Budget', true, 'Citée.'], ['Réglementation', true, 'Citée.'], ['Capacité de production', true, 'Citée.'], ['Dépendance à un fournisseur', true, 'Citée.'],
    ['Couleur du produit', false, 'Non citée, et ce n’est pas une contrainte qui structure la négociation.'],
  ] },
  { t: 'single', q: 'Dans une négociation multi-acteurs, le responsable financier s’intéresse surtout…', o: [
    ['au budget.', true, 'Exemple du cours : financier → budget.'],
    ['à la faisabilité.', false, 'C’est le responsable technique.'],
    ['à l’usage.', false, 'C’est l’utilisateur.'],
    ['aux conditions commerciales.', false, 'C’est l’acheteur.'],
  ] },
  { t: 'single', q: 'Question 8 de la grille d’analyse : « Quelles alternatives ? » — que cherche-t-on ?', o: [
    ['Les solutions de repli, la MESORE.', true, 'Formulation exacte du cours.'],
    ['Les variables négociables.', false, 'C’est la question 9.'],
    ['Les dépendances et le pouvoir de négociation.', false, 'C’est la question 6 (rapport de force).'],
    ['Les informations manquantes.', false, 'C’est la question 4.'],
  ] },
  { t: 'single', q: 'Question 5 de la grille : « Quels enjeux ? » — que cherche-t-on ?', o: [
    ['Ce que chacun risque de gagner ou de perdre.', true, 'Formulation du cours.'],
    ['Les objectifs et intérêts de chacun.', false, 'C’est la question 2 (Pourquoi ?).'],
    ['Le budget et les délais.', false, 'Ce sont des contraintes (question 7).'],
    ['Les parties prenantes.', false, 'C’est la question 1 (Qui ?).'],
  ] },
  { t: 'single', q: 'Activité : « Une collectivité publie un dossier précisant ses besoins, les conditions de réponse et une date limite. » Type ?', o: [
    ['Appel d’offres', true, 'Indice : procédure + cahier des charges + échéance.'],
    ['Négociation commerciale classique', false, 'Il n’y a pas d’échange direct et libre : tout est cadré par le dossier.'],
    ['Comité d’achat', false, 'Rien n’indique ici plusieurs interlocuteurs dans la décision.'],
    ['Référencement', false, 'Pas d’enseigne ni de centrale d’achat.'],
  ] },
  { t: 'tf', q: 'Pour identifier un type de négociation, il suffit de repérer un mot-clé dans l’énoncé.', o: V(false, 'La consigne du cours : « Ne cherchez pas uniquement un mot-clé. Appuyez-vous sur les caractéristiques de la situation. »') },
  { t: 'single', q: 'Quelle est la question de départ du négociateur selon le cours ?', o: [
    ['« Dans quel contexte suis-je en train de négocier ? »', true, 'Dernière diapositive « À retenir ».'],
    ['« Quel est mon prix plancher ? »', false, 'Important, mais ce n’est pas la question de départ.'],
    ['« Qui dépend le plus de l’autre ? »', false, 'C’est la question du rapport de force (séance 3).'],
    ['« Que puis-je concéder ? »', false, 'C’est une question de préparation (séance 3).'],
  ] },
];

const S2 = [
  { t: 'single', q: 'Un appel d’offres est…', o: [
    ['une procédure par laquelle un acheteur met plusieurs fournisseurs en concurrence afin de satisfaire un besoin défini.', true, 'Définition exacte du cours.'],
    ['une simple demande de prix envoyée à plusieurs fournisseurs.', false, 'Le cours insiste : ce n’est pas simplement une demande de prix.'],
    ['une négociation libre entre un acheteur et son fournisseur habituel.', false, 'C’est l’inverse : mise en concurrence et cadre défini.'],
    ['une vente aux enchères où le prix monte.', false, 'Confusion : dans une enchère inversée, ce sont les prix des fournisseurs qui baissent.'],
  ] },
  { t: 'single', q: 'Dans quel ordre se déroule la démarche de la séance 2 ?', o: [
    ['Analyser la consultation → décider de répondre → identifier les marges de manœuvre → construire une offre → préparer la négociation éventuelle', true, 'C’est le fil conducteur de toutes les diapositives.'],
    ['Construire une offre → analyser la consultation → décider → négocier', false, 'On ne construit pas l’offre avant d’avoir analysé et décidé.'],
    ['Décider de répondre → analyser la consultation → négocier → construire une offre', false, 'On analyse avant de décider.'],
    ['Préparer la négociation → identifier les marges → analyser → décider', false, 'Ordre inversé.'],
  ] },
  { t: 'multi', q: 'Quels acteurs peuvent intervenir dans un appel d’offres selon le cours ?', o: [
    ['Les services techniques', true, 'Ils vérifient la qualité et la conformité.'],
    ['Les services achats ou financiers', true, 'Ils analysent prix et conditions contractuelles.'],
    ['Les décideurs', true, 'Ils choisissent l’offre retenue.'],
    ['Les utilisateurs finaux', true, 'Éventuellement : leurs attentes peuvent influencer le choix.'],
    ['Les concurrents du candidat, pour noter les offres', false, 'Les entreprises candidates déposent une offre ; elles ne notent pas.'],
  ] },
  { t: 'single', q: 'Dans l’exemple des ascenseurs, comment est réparti le poids des critères ?', o: [
    ['Prix 50 %, valeur technique 50 %', true, 'Chiffres de l’exemple.'],
    ['Prix 40 %, valeur technique 40 %, délais 20 %', false, 'C’est l’exemple de pondération de la diapositive 19, différent de celui des ascenseurs.'],
    ['Prix 60 %, valeur technique 40 %', false, 'Non.'],
    ['Prix 100 %', false, 'Non.'],
  ] },
  { t: 'single', q: 'Maintenance d’ascenseurs : quels sont la durée et le montant maximal du marché ?', o: [
    ['48 mois, 240 000 €', true, 'Chiffres de l’exemple.'], ['36 mois, 240 000 €', false, 'La durée est de 48 mois.'], ['48 mois, 420 000 €', false, 'Le montant maximal est de 240 000 €.'], ['24 mois, 120 000 €', false, 'Non.'],
  ] },
  { t: 'single', q: '« Go sous conditions » signifie que l’entreprise…', o: [
    ['poursuit l’analyse, mais doit obtenir certaines informations avant de prendre une décision définitive.', true, 'Définition du cours.'],
    ['répond, à condition que l’acheteur baisse ses exigences.', false, 'L’entreprise ne peut pas imposer de modifier une exigence obligatoire.'],
    ['renonce sauf si un concurrent se retire.', false, 'Non.'],
    ['répond avec une offre incomplète.', false, 'Une offre incomplète risque d’être écartée.'],
  ] },
  { t: 'multi', q: 'Pour vérifier la capacité de l’entreprise, quelles questions le cours pose-t-il ?', o: [
    ['Possède-t-elle les compétences nécessaires ?', true, 'Citée.'],
    ['Peut-elle mobiliser suffisamment de personnel ?', true, 'Citée.'],
    ['Possède-t-elle les qualifications ou certifications demandées ?', true, 'Citée.'],
    ['Peut-elle intervenir dans la zone géographique concernée ?', true, 'Citée.'],
    ['Le prix pèse-t-il plus de 50 % dans la note ?', false, 'C’est un élément des chances de réussite (poids du prix), pas de la capacité.'],
  ] },
  { t: 'tf', q: 'Si le chiffre d’affaires attendu est élevé, le marché est forcément intéressant.', o: V(false, '« Le chiffre d’affaires attendu ne suffit pas » : il faut estimer coûts, pénalités, trésorerie et marge ; une offre remportée peut être déficitaire.') },
  { t: 'multi', q: 'Quels coûts l’entreprise doit-elle estimer pour vérifier la rentabilité ?', o: [
    ['Coûts de préparation de la réponse', true, 'Cités.'], ['Coûts de sous-traitance', true, 'Cités.'], ['Éventuelles pénalités', true, 'Citées.'], ['Besoins de trésorerie', true, 'Cités.'],
    ['Le salaire du négociateur de l’acheteur', false, 'Non pertinent.'],
  ] },
  { t: 'single', q: 'Selon le tableau Go/No-Go des ascenseurs, une entreprise à qui il manque certaines compétences peut…', o: [
    ['renoncer ou rechercher un partenaire.', true, 'Conséquence indiquée dans le tableau.'],
    ['répondre quand même et apprendre en cours de marché.', false, 'Risque de non-exécution : « intéressée sans être capable d’exécuter ».'],
    ['négocier la suppression de l’exigence.', false, 'On ne négocie pas une exigence obligatoire.'],
    ['baisser son prix pour compenser.', false, 'Un prix bas ne compense pas une incapacité technique.'],
  ] },
  { t: 'single', q: 'Pourquoi une entreprise peut-elle accepter une rentabilité modérée ?', o: [
    ['Si l’intérêt stratégique du marché est réel (développement, références).', true, 'Ligne « Potentiel commercial » du tableau.'],
    ['Si elle n’a pas calculé ses coûts.', false, 'Au contraire : il faut toujours chiffrer.'],
    ['Si le prix compte pour 50 % de la note.', false, 'Ce n’est pas la justification donnée.'],
    ['Jamais : la marge doit toujours être maximale.', false, 'Le cours admet une rentabilité modérée en cas d’intérêt stratégique.'],
  ] },
  { t: 'single', q: 'À quelle étape l’entreprise commence-t-elle réellement à préparer la négociation ?', o: [
    ['Identifier les marges de manœuvre', true, '« C’est à cette étape que l’entreprise commence réellement à préparer la négociation. »'],
    ['Analyser la consultation', false, 'C’est l’étape de compréhension du dossier.'],
    ['Construire une offre', false, 'Elle vient après l’identification des marges.'],
    ['Décider de répondre', false, 'C’est le Go/No-Go.'],
  ] },
  { t: 'single', q: 'Un délai d’intervention maximal imposé par le dossier est…', o: [
    ['une exigence obligatoire.', true, 'Le cours cite « un délai maximal » parmi les exigences.'],
    ['un élément différenciant.', false, 'Proposer mieux que le maximum peut l’être, mais le maximum lui-même est obligatoire.'],
    ['une variable négociable.', false, 'Une exigence obligatoire ne se présente pas comme négociable.'],
    ['un critère facultatif.', false, 'Non.'],
  ] },
  { t: 'tf', q: 'Une offre très bon marché qui ne respecte pas une exigence essentielle sera tout de même retenue grâce à son prix.', o: V(false, 'Elle « peut être écartée, même si elle présente un prix intéressant ».') },
  { t: 'single', q: 'Prix 40 %, valeur technique 40 %, délais 20 %. Quelle stratégie le cours suggère-t-il ?', o: [
    ['Ne pas nécessairement chercher à être le moins cher, et améliorer sa note par l’organisation, les délais, la méthode, l’assistance ou le suivi.', true, 'C’est la conclusion de la diapositive 19.'],
    ['Être absolument le moins cher.', false, 'Le prix ne pèse que 40 %.'],
    ['Ignorer le prix.', false, 'Il pèse tout de même 40 %.'],
    ['Négocier la pondération avec l’acheteur.', false, 'Les critères sont fixés par la consultation.'],
  ] },
  { t: 'single', q: 'Quelle condition doit remplir un élément différenciant ?', o: [
    ['Répondre à un besoin réel de l’acheteur.', true, '« Une innovation inutile ne constitue pas nécessairement un avantage commercial. »'],
    ['Être une innovation technologique.', false, 'L’innovation n’est pas un avantage en soi.'],
    ['Être gratuit.', false, 'Ce n’est pas une condition du cours.'],
    ['Figurer dans les exigences obligatoires.', false, 'Une exigence est obligatoire pour tous : elle ne différencie pas.'],
  ] },
  { t: 'multi', q: 'Quelles variables peuvent éventuellement être négociées dans un appel d’offres (si la procédure le permet) ?', o: [
    ['Le périmètre de la prestation', true, 'Cité.'], ['Les conditions de paiement', true, 'Citées.'], ['Les modalités d’exécution', true, 'Citées.'], ['Le niveau de service', true, 'Cité.'],
    ['Les exigences obligatoires du dossier', false, 'Jamais : elles ne sont pas négociables.'],
  ] },
  { t: 'tf', q: 'Tous les appels d’offres permettent une phase de négociation.', o: V(false, '« Tous les appels d’offres ne permettent pas de négocier. Dans certains cas, l’entreprise doit remettre dès le départ une offre complète et définitive. »') },
  { t: 'single', q: 'Pourquoi la conformité est-elle le « socle » de l’offre ?', o: [
    ['Parce qu’une non-conformité ne peut pas être compensée par un argument commercial.', true, 'Formulation du cours.'],
    ['Parce qu’elle permet d’augmenter le prix.', false, 'Non.'],
    ['Parce qu’elle remplace le mémoire technique.', false, 'Non.'],
    ['Parce qu’elle est le seul critère noté.', false, 'Les critères notés sont le prix, la valeur technique, etc.'],
  ] },
  { t: 'multi', q: 'Avant de proposer un prix, l’entreprise doit connaître (diapositive) :', o: [
    ['son coût de revient', true, 'Cité.'], ['sa marge minimale', true, 'Citée.'], ['son prix cible', true, 'Cité.'], ['le prix maximal acceptable pour l’acheteur', true, 'Cité.'], ['les coûts liés aux éventuelles concessions', true, 'Cités.'],
    ['le salaire moyen des concurrents', false, 'Non cité.'],
  ] },
  { t: 'single', q: 'Les trois niveaux d’objectifs à définir avant de négocier sont…', o: [
    ['l’objectif idéal, la cible réaliste, le seuil minimal acceptable.', true, 'Diapositive 27.'],
    ['le prix public, le prix remisé, le prix de revient.', false, 'Non.'],
    ['Go, No-Go, Go sous conditions.', false, 'Ce sont les décisions de réponse.'],
    ['court, moyen et long terme.', false, 'Non.'],
  ] },
  { t: 'single', q: 'Quel argument correspond le mieux à la recommandation du cours ?', o: [
    ['« Notre astreinte 24 h/24 garantit qu’un ascenseur en panne le week-end est remis en service rapidement, ce qui évite la gêne des usagers. »', true, 'Il relie une caractéristique à un bénéfice pour l’acheteur.'],
    ['« Nous sommes leaders depuis 30 ans. »', false, 'C’est une caractéristique de l’entreprise sans bénéfice explicite.'],
    ['« Nos techniciens sont très compétents. »', false, 'Affirmation générale sans bénéfice concret.'],
    ['« Notre prix est le plus bas du marché. »', false, 'Le cours recommande de ne pas tout ramener au prix.'],
  ] },
  { t: 'single', q: 'Pourquoi préparer des questions à poser à l’acheteur ?', o: [
    ['Pour comprendre ses priorités et négocier sur les véritables enjeux plutôt que de réduire immédiatement le prix.', true, 'Diapositive 28.'],
    ['Pour gagner du temps.', false, 'Non.'],
    ['Pour connaître le prix des concurrents.', false, 'Ce n’est pas l’objectif affiché.'],
    ['Pour éviter de présenter son offre.', false, 'Non.'],
  ] },
];

const S3 = [
  { t: 'single', q: 'Le référencement est…', o: [
    ['la décision d’intégrer un fournisseur et/ou ses produits dans l’offre.', true, 'Définition du cours.'],
    ['la présence concrète du produit dans les magasins.', false, 'C’est l’implantation.'],
    ['l’ensemble des références effectivement proposées.', false, 'C’est l’assortiment.'],
    ['une opération promotionnelle en magasin.', false, 'C’est du trade marketing.'],
  ] },
  { t: 'single', q: 'La présence concrète d’un produit dans les magasins s’appelle…', o: [
    ['l’implantation.', true, 'Définition du cours.'], ['le référencement.', false, 'Le référencement est la décision d’intégrer.'], ['l’assortiment.', false, 'L’assortiment désigne les références proposées.'], ['le trade marketing.', false, 'Non.'],
  ] },
  { t: 'single', q: 'Quelle est la question centrale du référencement ?', o: [
    ['Le produit répond-il aux besoins des clients de l’enseigne ?', true, 'Diapositive 2.'],
    ['Quel est le prix le plus bas possible ?', false, 'Le prix n’est qu’une variable.'],
    ['Le fournisseur est-il une grande marque ?', false, 'Non.'],
    ['Combien de magasins compte l’enseigne ?', false, 'Non.'],
  ] },
  { t: 'tf', q: 'Le distributeur est automatiquement en position de force parce qu’il contrôle l’accès à son réseau.', o: V(false, 'Il contrôle l’accès au réseau mais « n’est pas automatiquement en position de force » : tout dépend de la dépendance, des alternatives et de l’attractivité de l’offre.') },
  { t: 'single', q: 'Fournisseur A : 40 % de son chiffre d’affaires avec l’enseigne et quasiment aucune autre distribution. Sa position est…', o: [
    ['fragile, car il est fortement dépendant.', true, 'Conclusion du cours.'],
    ['solide, car il pèse lourd chez l’enseigne.', false, 'Le cours raisonne sur la dépendance du fournisseur, pas sur son poids chez l’enseigne.'],
    ['équilibrée.', false, 'Non : forte dépendance.'],
    ['impossible à évaluer.', false, 'Le cours conclut clairement.'],
  ] },
  { t: 'single', q: 'Qu’est-ce qui rend la position du fournisseur B solide ?', o: [
    ['Il a des alternatives crédibles : l’enseigne ne pèse que 10 % de son activité et il travaille avec plusieurs distributeurs.', true, 'Exemple du cours.'],
    ['Il propose le prix le plus bas.', false, 'Le prix n’est pas évoqué dans l’exemple.'],
    ['Il est plus gros que l’enseigne.', false, 'Non.'],
    ['Il a signé une convention.', false, 'Non.'],
  ] },
  { t: 'multi', q: 'Quelles sont les alternatives du distributeur citées en cours ?', o: [
    ['D’autres fournisseurs', true, 'Cité.'], ['Des produits substituables', true, 'Cité.'], ['D’autres enseignes', false, 'Ce sont les alternatives du fournisseur.'], ['D’autres circuits de distribution', false, 'Alternative du fournisseur.'],
  ] },
  { t: 'single', q: 'La BATNA est…', o: [
    ['la solution de repli en cas d’absence d’accord.', true, 'Définition du cours.'],
    ['le meilleur prix obtenu pendant la négociation.', false, 'Non.'],
    ['l’objectif idéal du négociateur.', false, 'Non.'],
    ['un type de remise commerciale.', false, 'Non.'],
  ] },
  { t: 'tf', q: 'Plus une alternative est crédible, plus la partie dépend de son interlocuteur.', o: V(false, 'C’est l’inverse : « Plus une alternative est crédible, moins la partie dépend de son interlocuteur. »') },
  { t: 'multi', q: 'Que peut-on négocier dans un référencement ?', o: [
    ['L’assortiment', true, 'Cité.'], ['Les volumes', true, 'Cités.'], ['La logistique', true, 'Citée.'], ['Le trade marketing', true, 'Cité.'], ['La promotion', true, 'Citée.'],
  ], x: 'Le référencement ne se réduit pas au prix : toutes ces variables figurent dans le cours.' },
  { t: 'single', q: '« Si vous vous engagez sur tel volume, je peux envisager telle condition. » Ce principe signifie que…', o: [
    ['la concession tarifaire devient une variable d’échange, liée à une contrepartie.', true, 'Formulation du cours.'],
    ['le fournisseur doit toujours baisser son prix.', false, 'Non : la baisse est conditionnée.'],
    ['les volumes ne sont pas négociables.', false, 'Ils le sont.'],
    ['l’enseigne fixe seule le prix.', false, 'Non.'],
  ] },
  { t: 'single', q: 'Le trade marketing vise à…', o: [
    ['développer les ventes avec le distributeur en tenant compte du circuit.', true, 'Définition du cours.'],
    ['négocier le prix d’achat le plus bas.', false, 'Non.'],
    ['remplacer le référencement.', false, 'Il le prolonge : transformer le référencement en développement commercial.'],
    ['gérer la logistique des entrepôts.', false, 'Non.'],
  ] },
  { t: 'single', q: 'Quelle est la sixième étape du processus de référencement ?', o: [
    ['Formaliser (convention)', true, 'Préparer → présenter → analyser → négocier → décider → formaliser → suivre.'],
    ['Négocier les conditions', false, 'C’est la quatrième.'], ['Suivre l’accord', false, 'C’est la septième.'], ['Décider du référencement', false, 'C’est la cinquième.'],
  ] },
  { t: 'multi', q: 'Selon le cours, un accord doit être…', o: [
    ['acceptable', true, 'Cité.'], ['économiquement viable', true, 'Cité.'], ['réalisable', true, 'Cité.'], ['exclusif', false, 'Non cité.'],
  ] },
  { t: 'single', q: 'Quelle est la logique du distributeur ?', o: [
    ['Optimiser l’offre proposée à ses clients.', true, 'Tableau « deux parties, deux logiques ».'],
    ['Maximiser le développement de son offre.', false, 'C’est la logique du fournisseur.'],
    ['Référencer un maximum de produits.', false, 'Il sélectionne les plus pertinents et maîtrise l’espace.'],
    ['Acheter au prix le plus bas quel que soit le produit.', false, 'Non.'],
  ] },
  { t: 'single', q: 'Exemple des jus (3 références partout vs 1 référence en test). Quel espace de négociation le cours propose-t-il ?', o: [
    ['Un référencement progressif, avec élargissement éventuel selon les résultats.', true, 'Formulation du cours.'],
    ['Les 3 références dans tous les magasins à prix réduit.', false, 'Non.'],
    ['Le refus du référencement.', false, 'Non.'],
    ['Une seule référence, définitivement.', false, 'Non : élargissement possible.'],
  ] },
  { t: 'single', q: 'Quelle question centrale le cours pose-t-il pour préparer la négociation de référencement ?', o: [
    ['« Que puis-je concéder, dans quelles limites, et contre quoi ? »', true, 'Diapositive 14.'],
    ['« Combien puis-je baisser mon prix ? »', false, 'Trop réducteur.'],
    ['« Qui a raison ? »', false, 'Non.'],
    ['« Comment éviter toute concession ? »', false, 'Non.'],
  ] },
  { t: 'single', q: '10 € → 9 € demandés. Quel raisonnement le cours recommande-t-il ?', o: [
    ['Mesurer ce que rapporte la concession (volumes, référencement, développement des ventes) et raisonner sur l’économie globale.', true, 'Diapositive 15.'],
    ['Refuser toute baisse.', false, 'Le cours n’exclut pas la concession ; il demande de la mesurer.'],
    ['Accepter pour conserver la relation.', false, 'Sans contrepartie, c’est une baisse gratuite.'],
    ['Proposer 9,50 € pour couper la poire en deux.', false, 'Ce n’est pas le raisonnement du cours.'],
  ] },
];

const S4 = [
  { t: 'single', q: 'Quelles sont les deux relations fondamentales de l’agent sportif ?', o: [
    ['Agent ↔ sportif (obtenir et sécuriser le mandat) et agent ↔ club / sponsor / partenaire (défendre les intérêts du sportif).', true, 'Diapositive 3.'],
    ['Agent ↔ fédération et agent ↔ médias.', false, 'Non.'],
    ['Agent ↔ club et club ↔ sponsor.', false, 'Non.'],
    ['Sportif ↔ club et sportif ↔ sponsor, sans agent.', false, 'Non.'],
  ] },
  { t: 'single', q: 'Dans le transfert de Ronaldo au Real Madrid (2009), qu’est-ce qui opposait les parties ?', o: [
    ['Le partage des revenus liés aux droits à l’image.', true, 'Jorge Mendes voulait une part plus favorable ; le Real voulait garder son modèle.'],
    ['Le montant du transfert uniquement.', false, 'Le cours insiste : la négociation ne portait pas uniquement sur le montant.'],
    ['La durée du mandat de l’agent.', false, 'Non.'],
    ['Le choix du club.', false, 'Les deux parties voulaient conclure.'],
  ] },
  { t: 'tf', q: 'La relation entre l’agent et le sportif est elle-même une négociation.', o: V(true, 'Diapositive 5 : le mandat définit les conditions de la mission ; ce n’est pas une formalité.') },
  { t: 'multi', q: 'Que faut-il clarifier dans le mandat ?', o: [
    ['Ce que l’agent apporte', true, 'Cité.'], ['La durée de la relation', true, 'Cité.'], ['L’exclusivité éventuelle', true, 'Cité.'], ['La rémunération', true, 'Cité.'],
    ['Le salaire que le sportif obtiendra à coup sûr', false, 'L’agent ne peut pas garantir un résultat.'],
  ] },
  { t: 'single', q: 'Que dit le cours de la confiance entre agent et sportif ?', o: [
    ['C’est une ressource de la négociation, mais les engagements doivent être clairement définis.', true, 'Diapositive 7.'],
    ['Elle dispense de contrat écrit.', false, 'Au contraire.'],
    ['Elle n’a aucune importance.', false, 'Elle conditionne la qualité des négociations extérieures.'],
    ['Elle remplace la rémunération.', false, 'Non.'],
  ] },
  { t: 'multi', q: 'Pour évaluer le rapport de force, l’agent doit identifier…', o: [
    ['les alternatives de son client', true, 'Cité.'], ['les alternatives de l’autre partie', true, 'Cité.'], ['la rareté du profil du sportif', true, 'Cité.'], ['l’information dont dispose chaque acteur', true, 'Cité.'],
    ['la popularité de l’agent sur les réseaux sociaux', false, 'Non cité.'],
  ] },
  { t: 'single', q: 'Pourquoi une offre financièrement supérieure n’est-elle pas forcément la meilleure ?', o: [
    ['Elle peut offrir moins de potentiel de développement ou imposer davantage de contraintes.', true, 'Distinction prix / valeur.'],
    ['Parce que l’agent touche moins.', false, 'Raisonnement contraire à l’intérêt du mandant.'],
    ['Parce que la loi l’interdit.', false, 'Non.'],
    ['Elle l’est toujours.', false, 'Non.'],
  ] },
  { t: 'single', q: 'Dans la négociation Jordan / Nike (1984), comment David Falk a-t-il amélioré la proposition de Nike ?', o: [
    ['En utilisant l’alternative existante : la proposition d’Adidas.', true, 'Exemple du cours.'],
    ['En menaçant de faire arrêter Jordan.', false, 'Non.'],
    ['En baissant la commission de l’agent.', false, 'Non.'],
    ['En acceptant la première offre.', false, 'Non.'],
  ] },
  { t: 'single', q: 'Que contenait le contrat final Jordan / Nike ?', o: [
    ['Rémunération, ligne de produits et participation aux revenus.', true, 'Exemple du cours.'],
    ['Uniquement une rémunération fixe.', false, 'Non.'],
    ['Une participation au capital de Nike.', false, 'C’est l’exemple de Serena Williams (Mission Skincare).'],
    ['Une exclusivité de 10 ans sans rémunération.', false, 'Non.'],
  ] },
  { t: 'multi', q: 'Avec un club, l’agent peut négocier…', o: [
    ['la durée du contrat', true, 'Cité.'], ['les primes et objectifs', true, 'Cités.'], ['les conditions d’évolution', true, 'Citées.'], ['la place dans le projet sportif', true, 'Citée.'],
  ] },
  { t: 'single', q: 'Complète : « L’agent ne défend pas seulement une demande : il défend… »', o: [
    ['les intérêts globaux de son client.', true, 'Diapositive 11.'], ['sa propre rémunération.', false, 'Non.'], ['les intérêts du club.', false, 'Non.'], ['le prix le plus élevé.', false, 'Non.'],
  ] },
  { t: 'single', q: 'Les deux questions de la proposition de valeur dans une négociation avec une marque sont…', o: [
    ['Qu’apporte le sportif à la marque ? Qu’apporte la marque au sportif ?', true, 'Diapositive 13.'],
    ['Combien paie la marque ? Combien touche l’agent ?', false, 'Réducteur.'],
    ['Qui décide ? Quand signe-t-on ?', false, 'Non.'],
    ['Quel est le prix ? Quelle est la remise ?', false, 'Non.'],
  ] },
  { t: 'single', q: 'Qu’illustre l’accord Serena Williams / Mission Skincare (2009) ?', o: [
    ['Un partenariat qui va au-delà de la visibilité : ambassadrice, partenaire au capital, développement de produits, royalties.', true, 'Exemple du cours.'],
    ['Un transfert entre deux clubs.', false, 'Non.'],
    ['Une enchère inversée.', false, 'Non.'],
    ['Un refus de mandat.', false, 'Non.'],
  ] },
  { t: 'single', q: 'Selon le cours, une bonne négociation avec une marque consiste surtout à…', o: [
    ['élargir la valeur créée par le partenariat.', true, '« … pas toujours à augmenter le montant payé. »'],
    ['augmenter le montant payé.', false, 'Pas toujours.'],
    ['obtenir l’exclusivité totale.', false, 'Non.'],
    ['réduire la durée.', false, 'Non.'],
  ] },
  { t: 'single', q: 'Quelle formulation de concession correspond au cours ?', o: [
    ['« Nous pouvons envisager cela si vous nous accordez telle contrepartie. »', true, 'Formulation recommandée (diapositive 17).'],
    ['« Nous pouvons vous accorder cela. »', false, 'C’est la formulation à éviter.'],
    ['« C’est à prendre ou à laisser. »', false, 'Non.'],
    ['« Faites-nous une proposition. »', false, 'Non.'],
  ] },
  { t: 'single', q: 'Quelle question distingue la négociation par représentation d’une négociation menée pour soi-même ?', o: [
    ['« Cette concession est-elle réellement dans l’intérêt de mon client ? »', true, 'Diapositive 17.'],
    ['« Quel est mon prix plancher ? »', false, 'Non.'],
    ['« Qui dépend le plus de l’autre ? »', false, 'Question du rapport de force (séance 3).'],
    ['« Dans quel contexte suis-je ? »', false, 'Question de départ (séance 1).'],
  ] },
  { t: 'single', q: 'Dans quel ordre le cours présente-t-il l’évolution possible du rôle de l’agent ?', o: [
    ['Intermédiaire → représentant → conseiller → développeur d’opportunités', true, 'Diapositive 19.'],
    ['Conseiller → intermédiaire → représentant → développeur', false, 'Non.'],
    ['Représentant → intermédiaire → développeur → conseiller', false, 'Non.'],
    ['Développeur → conseiller → représentant → intermédiaire', false, 'Ordre inversé.'],
  ] },
  { t: 'single', q: 'Selon le support de cours, la durée d’un contrat d’agent sportif ne peut excéder…', o: [
    ['3 ans', true, 'Chiffre du support (diapositive 20).'], ['2 ans', false, 'Non.'], ['5 ans', false, 'Non.'], ['la durée du contrat du joueur', false, 'Non.'],
  ] },
  { t: 'single', q: 'Selon le support, la rémunération de l’agent ne peut excéder…', o: [
    ['10 % du contrat ou de l’accord conclu par les parties qu’il a mises en relation (plafond inférieur possible fixé par les fédérations délégataires).', true, 'Chiffre du support.'],
    ['15 % du contrat.', false, 'Non.'],
    ['5 % du contrat, sans exception.', false, 'Non.'],
    ['librement fixée par les parties.', false, 'Non : la réponse du support est « Non », la rémunération est encadrée.'],
  ] },
  { t: 'single', q: 'Qu’illustre l’exemple Federer / Godsick (Team8, Laver Cup) ?', o: [
    ['L’agent qui crée de nouvelles opportunités, au-delà de la négociation de contrats existants.', true, 'Diapositives 18–19.'],
    ['Un conflit sur les droits à l’image.', false, 'C’est Ronaldo.'],
    ['L’utilisation d’une offre concurrente.', false, 'C’est Jordan.'],
    ['Une relation de confiance née à l’IMG Academy.', false, 'C’est Sharapova.'],
  ] },
];

const CAS = [
  { t: 'single', q: 'Cas MarketOne / TempoRun : quelle est la commission par commande ?', o: [
    ['7,50 €', true, '15 % × 50 € HT.'], ['9,00 €', false, 'Ce serait 15 % du prix TTC (60 €) : la commission se calcule sur le HT.'], ['6,00 €', false, 'C’est la commission RunSphere (12 %).'], ['4,50 €', false, 'C’est la logistique MarketOne.'],
  ] },
  { t: 'single', q: 'Contribution par commande avec la logistique MarketOne ?', o: [
    ['15,50 €', true, '50 − 7,50 − 21 − 1,50 − 4,50.'], ['14,20 €', false, 'C’est si TempoRun expédie (5,80 €).'], ['16,30 €', false, 'C’est RunSphere.'], ['20,00 €', false, 'Oubli de l’emballage et de la logistique.'],
  ] },
  { t: 'tf', q: 'La contribution de 15,50 € par commande est le bénéfice net de TempoRun.', o: V(false, 'Le dossier le précise : les contributions ne sont pas des bénéfices nets (abonnement, publicité, retours, personnel, frais généraux non déduits).') },
  { t: 'single', q: 'Une unité fabriquée en production accélérée, vendue avec la logistique MarketOne, dégage…', o: [
    ['13,00 €, sous le seuil de 14 € exigé par la direction.', true, '15,50 − 2,50 = 13,00 €.'],
    ['15,50 €, la production accélérée ne change rien.', false, 'Elle coûte 2,50 € de plus par unité.'],
    ['18,00 €.', false, 'Le surcoût se retranche.'],
    ['14,20 €.', false, 'Confusion avec l’expédition par TempoRun.'],
  ] },
  { t: 'single', q: 'La prévision de 120 commandes par mois est…', o: [
    ['une estimation commerciale dont la méthode n’a pas été communiquée.', true, 'À clarifier ; à ne pas transformer en garantie.'],
    ['un engagement contractuel de MarketOne.', false, 'Le dossier précise qu’aucune vente n’est garantie.'],
    ['un chiffre issu des ventes passées de TempoRun.', false, 'TempoRun vend 65 unités/mois sur son site.'],
    ['un minimum que TempoRun doit livrer.', false, 'Non.'],
  ] },
  { t: 'multi', q: 'Quels éléments sont présentés comme discutables (sous réserve de validation) ?', o: [
    ['Un test de lancement de trois mois', true, 'Cité.'], ['L’accompagnement technique', true, 'Cité.'], ['Le calendrier de lancement', true, 'Cité.'], ['Le suivi de performance', true, 'Cité.'],
    ['Le taux de commission', false, 'Non négociable individuellement.'], ['Le tarif de la publicité sponsorisée', false, 'Non négociable individuellement.'],
  ] },
  { t: 'single', q: 'La publicité sponsorisée de MarketOne (350 € HT/mois) est-elle compatible avec les consignes internes de TempoRun ?', o: [
    ['Non : budget maximal de 200 € HT/mois et pas d’engagement payant avant d’avoir mesuré un test.', true, 'Annexe TempoRun. La publicité étant optionnelle, TempoRun peut la refuser pendant le test.'],
    ['Oui, si MarketOne accorde une remise.', false, 'Les tarifs standards ne sont pas négociables individuellement.'],
    ['Oui, car elle garantit la visibilité.', false, 'Elle est « sans garantie de résultat ».'],
    ['Oui, elle est obligatoire.', false, 'Elle est optionnelle.'],
  ] },
  { t: 'single', q: 'Quelle est la solution de repli (BATNA) de TempoRun ?', o: [
    ['La proposition indicative de RunSphere (non acceptée, volume non garanti).', true, 'Annexe confidentielle, partie 4.'],
    ['Une baisse de la commission MarketOne.', false, 'Ce n’est pas une alternative, et ce n’est pas négociable.'],
    ['Augmenter le prix public.', false, 'Non.'],
    ['Aucune.', false, 'Elle en a une : RunSphere (et son propre site).'],
  ] },
];

const X = [
  { t: 'single', q: 'Quel principe traverse les séances 2, 3 et 4 ?', o: [
    ['Une concession doit être liée à une contrepartie.', true, 'S2 : pas de concession sans contrepartie ; S3 : contre quoi ? ; S4 : si vous nous accordez…'],
    ['Le moins cher gagne toujours.', false, 'Contredit par la séance 2 (pondération) et la séance 4 (prix ≠ valeur).'],
    ['Le distributeur décide seul.', false, 'Non.'],
    ['L’information est toujours équilibrée.', false, 'Non.'],
  ] },
  { t: 'single', q: 'MESORE (séance 1) et BATNA (séance 3) désignent…', o: [
    ['la même idée : la solution de repli si aucun accord n’est trouvé.', true, 'Les deux sigles renvoient à la meilleure solution de rechange.'],
    ['deux types d’appel d’offres.', false, 'Non.'],
    ['le prix plancher et le prix plafond.', false, 'Non.'],
    ['deux étapes du processus de référencement.', false, 'Non.'],
  ] },
];

const group = (s, arr) => arr.map((q, i) => ({ id: `q-${s}-${String(i + 1).padStart(2, '0')}`, s, ...q }));
export const QCM = [...group('s1', S1), ...group('s2', S2), ...group('s3', S3), ...group('s4', S4), ...group('cas', CAS), ...group('x', X)];
