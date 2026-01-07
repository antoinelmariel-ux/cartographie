const templateDefinitions = {
  'lfb-fournisseur': {
    columns: [
      { key: 'objective', color: 'objective' },
      { key: 'tier', color: 'tier' },
      { key: 'comportement', color: 'comportement' },
      { key: 'moyen', color: 'moyen' },
      { key: 'controle', color: 'controle' },
      { key: 'limite', color: 'limite' },
      { key: 'proba', color: 'proba' },
    ],
    synthese: {
      tierKey: 'tier',
      comportementKey: 'comportement',
      moyenKey: 'moyen',
    },
  },
  'lfb-client': {
    columns: [
      { key: 'tier', color: 'tier' },
      { key: 'objective', color: 'objective' },
      { key: 'comportement', color: 'comportement' },
      { key: 'moyen', color: 'moyen' },
      { key: 'controle', color: 'controle' },
      { key: 'contournement', color: 'limite' },
      { key: 'proba', color: 'proba' },
    ],
    synthese: {
      tierKey: 'tier',
      comportementKey: 'comportement',
      moyenKey: 'moyen',
    },
  },
  'lfb-controleur': {
    columns: [
      { key: 'controle', color: 'controle' },
      { key: 'description', color: 'objective' },
      { key: 'pertinence', color: 'tier' },
      { key: 'efficacite', color: 'comportement' },
    ],
    synthese: null,
  },
};

const translations = {
  fr: {
    ui: {
      brand: 'Impact Mapping',
      pageTitle: 'Impact Mapping',
      mapSelectorLabel: 'Carte',
      mapSelectorAriaLabel: 'Choisir une carte',
      questionPanelTitle: 'Questions à poser',
      questionPanelTitleWithColumn: (label) => `Questions à poser • ${label}`,
      tabBarAriaLabel: 'Navigation des onglets',
      tabMap: 'Carte',
      tabSynthese: 'Synthèse',
      tabMentions: 'Mentions @',
      tabConfiguration: 'Configuration',
      helperTitle: 'Prise de notes en direct',
      selectionPrefix: 'Sélection :',
      selectionNone: 'Aucune',
      addSibling: 'Ajouter au même niveau (Entrée)',
      addChild: 'Ajouter un enfant (Tab)',
      deleteBranch: 'Supprimer la branche (Suppr)',
      notesHint: 'Astuce : Alt + Entrée ou Maj + Entrée pour insérer un retour à la ligne dans une note.',
      tagAdminTitle: 'Back-office des tags "Moyen"',
      tagAdminDesc: 'Mettez à jour la liste déroulante affichée sur les noeuds de la colonne Moyen.',
      newTagPlaceholder: 'Nouveau tag',
      newTagAriaLabel: 'Ajouter un tag',
      addTagButton: 'Ajouter',
      tierAdminTitle: 'Back-office des catégories "Tiers"',
      tierAdminDesc: 'Mettez à jour la liste déroulante affichée sur les noeuds de la colonne Tiers.',
      newTierCategoryPlaceholder: 'Nouvelle catégorie',
      newTierCategoryAriaLabel: 'Ajouter une catégorie',
      addTierCategoryButton: 'Ajouter',
      questionAdminTitle: 'Back-office des questions par badge',
      questionAdminDesc: 'Saisissez une question par ligne pour chaque catégorie de badge de la carte active.',
      syntheseTitle: 'Synthèse des chaînes',
      copyAllSynthese: 'Copier toutes les synthèses',
      exportChainsCsv: 'Exporter CSV',
      mentionAdminTitle: 'Back-office des mentions @',
      mentionAdminDesc: 'Liste des bulles contenant des mentions, regroupées par personne citée.',
      zoomPanelAriaLabel: 'Contrôles de zoom',
      zoomOutAriaLabel: 'Dézoomer',
      zoomRangeAriaLabel: 'Zoom',
      zoomInAriaLabel: 'Zoomer',
      fitMap: 'Ajuster',
      fitMapAriaLabel: "Adapter à l'écran",
      footerLabel: 'Outil Mindmap Impact Mapping',
      categoryPlaceholder: 'Catégorie',
      objectiveAddTitle: 'Ajouter un objectif',
      objectiveAddAriaLabel: 'Ajouter un nouvel objectif',
      objectiveRelaunchLabel: 'Spécifique relance activité',
      branchExpand: 'Déplier la branche',
      branchCollapse: 'Replier la branche',
      remove: 'Retirer',
      questionsFor: 'Questions pour',
      questionPlaceholder: 'Une question par ligne, listes en Markdown (-, *, +) acceptées',
      questionsEmpty: 'Aucune question configurée pour cette catégorie.',
      syntheseUnavailable: 'Synthèse indisponible pour cette carte.',
      mentionEmpty: 'Aucune mention @ détectée pour le moment.',
      mentionBubbleSingular: 'bulle',
      mentionBubblePlural: 'bulles',
      untitled: '[Sans titre]',
      unknown: 'Inconnu',
      moyenUncategorized: 'Moyen non catégorisé',
      tierUncategorized: 'Tiers non catégorisé',
      comportementUnfilled: 'Comportement non renseigné',
      copy: 'Copier',
      copyFeedback: 'Copié !',
      exportFeedback: 'Exporté !',
      syntheseEmptyChains: "Aucune chaîne complète Tier → Comportement → Moyen n'est disponible pour le moment.",
      expandTextAria: 'Afficher tout le texte',
      collapseTextAria: 'Réduire le texte',
      csvFilenamePrefix: 'chaines',
      languageToggle: {
        label: 'EN',
        ariaLabel: 'Passer en anglais',
        title: 'Passer en anglais',
      },
    },
    synthese: {
      description: (connector) =>
        `Générez automatiquement les phrases « Catégorie du moyen ${connector} Catégorie du tiers afin de Comportement » pour chaque chaîne.`,
      phrase: (moyen, connector, tier, comportement) => `${moyen} ${connector} ${tier} afin de ${comportement}`,
      meta: (moyen, tier) => `Moyen : ${moyen} • Tiers : ${tier}`,
    },
    mapTemplates: {
      'lfb-fournisseur': {
        name: 'LFB Fournisseur',
        columns: {
          objective: { label: 'Objectif', placeholder: 'Nouvel objectif' },
          tier: { label: 'Tiers', placeholder: 'Nouveau tiers' },
          comportement: { label: 'Comportement', placeholder: 'Nouveau comportement' },
          moyen: { label: 'Moyen', placeholder: 'Nouveau moyen' },
          controle: { label: 'Contrôle', placeholder: 'Nouveau contrôle' },
          limite: { label: 'Limite', placeholder: 'Nouvelle limite' },
          proba: { label: 'Crédibilité', placeholder: 'Nouvelle crédibilité' },
        },
        synthese: { tierConnector: 'de' },
      },
      'lfb-client': {
        name: 'LFB Client',
        columns: {
          tier: { label: 'Tiers', placeholder: 'Nouveau tiers' },
          objective: { label: 'Objectif', placeholder: 'Nouvel objectif' },
          comportement: { label: 'Comportement', placeholder: 'Nouveau comportement' },
          moyen: { label: 'Moyens', placeholder: 'Nouveau moyen' },
          controle: { label: 'Contrôle', placeholder: 'Nouveau contrôle' },
          contournement: { label: 'Contournement', placeholder: 'Nouveau contournement' },
          proba: { label: 'Crédibilité', placeholder: 'Nouvelle crédibilité' },
        },
        synthese: { tierConnector: 'par' },
      },
      'lfb-controleur': {
        name: 'LFB contrôleur',
        columns: {
          controle: { label: 'Contrôle', placeholder: 'Nouveau contrôle' },
          description: { label: 'Description', placeholder: 'Nouvelle description' },
          pertinence: { label: 'Pertinence', placeholder: 'Nouvelle pertinence' },
          efficacite: { label: 'Efficacité', placeholder: 'Nouvelle efficacité' },
        },
      },
    },
    questions: {
      'lfb-fournisseur': {
        objective: `**Quels sont vos objectifs métier qui peuvent être influencés par un tiers ?**
- Objectifs opérationnels (gagner un AO, obtenir une autorisation, négocier un prix…)
  - A quelle fréquence ?
- Objectifs relationnels (maintenir une relation clé)
- Objectifs temps (accélérer, sécuriser, débloquer)
- Avez vous des objectifs portés par des tiers (distributeurs, prestataires, intermédiaires, ...) ?
- Pensez-vous à d’autres activités où vous êtes en contact avec des tiers ? (directement ou indirectement)`,
        tier: `**Qui sont les tiers qui ont un impact sur ces objectifs ?**
- Administration / Client / Prestataires / …
- Agent public ? Privé ?
- Influenceurs ?
- Faites-vous appel à des intermédiaires / Prestataires / Apporteurs d’affaires ?`,
        comportement: `**Quels comportements rêvés pourriez vous espérer de ces tiers ?**
- Décision / interprétation favorable ?
- Décision plus rapide ?
- Souplesse sur une règle ?`,
        moyen: `**Quels avantages indus pourraient être proposés pour obtenir ces comportements ?** (Pas “ce que vous feriez”, mais ce qui pourrait exister)
- Avantages financiers : commission, rétrocommission, surfacturation, prestation (fictive ou non)
  - Disposez-vous d’une marge de manoeuvre ? Possibilité de paiement en espèce ?
  - Disposez-vous d’un tel budget ?
- Avantages en nature : cadeaux, invitations, hospitalité
  - Disposez-vous d’une marge de manoeuvre ?
  - Disposez-vous d’un tel budget ?
- Avantages indirects : dons, sponsoring, emploi, stage, recommandation
  - Disposez-vous d'une marge de manoeuvre ? d'un budget ?
  - Fréquence ? Bénéficiaires ? critères ?
- Avantages différés : promesse future, relation entretenue`,
        controle: `**Quelles règles ou procédures sont censées empêcher ce scénario ?**
- Procédure formelle ou pratique informelle ? Critères objectifs ?
- Comment cela se passe concrètement ?
- Qui contrôle ? à quel moment ? systématique ? tracé ?
- Est-ce réellement appliqué ? Est-ce réellement efficace ?
- Comment identifiez-vous les tiers avec lesquels vous collaborez ? Critères ?
- Comment déterminez-vous le montant de sa rémunération ?
- Comment documentez-vous la réalité de la prestation fournie ?`,
        limite: `**Comment un acteur malintentionné pourrait-il contourner ces contrôles ?**
- Via un tiers ?
- Détournement des procédures ? Fractionnement des prestations ?
- Prestations fictives ?
- Possibilité de réaliser des opérations non tracées ? (en cash)
- Possibilité de réaliser des paiements dans d’autres pays que celui d’implémentation ?`,
        proba: `**Ce scénario vous paraît il crédible dans votre environnement ?**
- Déjà vu dans le secteur ?
- Parait il crédible dans certains pays spécifique ?
- Avez-vous déjà eu connaissance de sollicitations de quelconque nature ?
- Quel est le niveau de pression à l’atteinte de l’objectif ? Pourrait-il amener à des pratiques non-respectueuses des process ?
- Quel lien entre rémunération et atteinte de l’objectif (bonus, success fee, commission …) ?`,
      },
      'lfb-client': {
        tier: `**Avec quels tiers êtes-vous en contact ? (directement ou indirectement)**
- Est-ce que certains tiers ont une influence considérable pour le LFB ?
- Est-ce que certains tiers sont très dépendant du LFB ? et inversement ?`,
        objective: `**Quels sont leurs attentes vis-à-vis de vous ?**`,
        comportement: `**Quels comportements rêvés ?**
Exemples:
- Être sélectionné ou reconduit sans mise en concurrence
- Obtenir une souplesse contractuelle
- Être payé plus ou plus vite
- Voir certaines non-conformités ignorées
- Être recommandé en interne
- Tirer un avantage personnel de leur influence sur vous`,
        moyen: `**Quels types d’avantages indus (direct ou indirect) certains pourraient-ils être tentés d’offrir pour obtenir ces comportements ?**
- Cadeaux / invitations : Recevez-vous des cadeaux, invitations ou proposition d’avantage de la part de ce tiers ?
- Avantages indirects : Un interlocuteur vous a-t-il déjà demandé de prendre une personne en stage ou d’offrir un emploi ?
- Financiers : Avez-vous déjà entendu parler de rétro-commission ?`,
        controle: `**Quelles règles ou procédures sont censées empêcher ce scénario ?**
- Procédure formelle ou pratique informelle ? Critères objectifs ?
- Comment cela se passe concrètement ?
- Qui contrôle ? à quel moment ? systématique ? tracé ?
- Est-ce réellement appliqué ? Est-ce réellement efficace ?
- Comment identifiez-vous les tiers avec lesquels vous collaborez ? Critères ? Décisions collectives ?
- Comment déterminez-vous le montant de sa rémunération ?
- Comment documentez-vous la réalité de la prestation fournie ?`,
        contournement: `**À votre avis, comment un acteur malintentionné pourrait-il contourner les contrôles existants ?**`,
        proba: `**In fine, quelle est selon vous la probabilité qu’un risque de corruption survienne dans votre périmètre d’activité ?**
- Déjà vu dans le secteur ?
- Parait il crédible dans certains pays spécifique ?
- Avez-vous déjà eu connaissance de sollicitations de quelconque nature ?
- Avez-vous déjà été victime ou témoin d’une tentative de fraude ?`,
      },
      'lfb-controleur': {
        controle: `**Quels sont les principaux mécanismes de contrôle que vous avez mis en place pour prévenir et détecter les risques de corruption sur les opérations ?**
- Quelles validations existent avant un engagement ?
- Quels contrôles existent sur les flux financiers ?
- Y-a-t-il des séparations de tâches prévues pour éviter les prises de décisions isolées ?`,
        description: `**Pouvez-vous me décrire ce contrôle et la façon dont il est mis en œuvre ?**
- Qui est responsable du contrôle ?
- À quel moment intervient-il dans le processus ?
- Quelle est la donnée ou l’opération contrôlée ?
- Le contrôle est-il :
  - manuel ou automatisé ?
  - systématique ou par échantillon ?
- Quelle est la preuve du contrôle ?
- Existe-t-il une procédure ou un formalisme associé ?
- Existe-t-il des spécificités pays / zones à risque ?`,
        pertinence: `**Ce contrôle est-il bien adapté pour prévenir les risques de corruption ?**
- Couvre-t-il les scénarios de risque prioritaires ?
- Existe-t-il des zones non couvertes par ce contrôle ?
- Est-il bien positionné :
  - au bon moment ?
  - au bon niveau ?
  - Est-il adapté aux pratiques de l'entreprise ?
  - Quelles difficultés dans la mise en oeuvre ?`,
        efficacite: `**Comment évaluez-vous l’efficacité de ce mécanisme ?**
- Ce contrôle permet-il réellement de :
  - empêcher un comportement non conforme ?
  - détecter un écart avant qu’il ne produise ses effets ?
- Est-il plutôt efficace :
  - sur des risques simples ?
  - ou aussi sur des schémas complexes (tiers, surfacturation, rétro-commissions) ?
- Avez-vous déjà constaté des incidents malgré ce contrôle ? des contournements ?
- Le contrôle est-il appliqué de façon homogène ? ou dépendant fortement des personnes ?
- Comment qualifieriez-vous son efficacité : faible / moyenne / élevée ?
- Disposez-vous d’éléments factuels pour étayer cette appréciation ?
`,
      },
    },
    initialNodeTextByColumnKey: {
      objective: 'Objectif principal',
      tier: 'Tiers principal',
      comportement: 'Comportement principal',
      moyen: 'Moyen principal',
      controle: 'Contrôle principal',
      limite: 'Limite principale',
      proba: 'Crédibilité principale',
      contournement: 'Contournement principal',
      description: 'Description principale',
      pertinence: 'Pertinence principale',
      efficacite: 'Efficacité principale',
    },
    options: {
      tagOptions: [
        'Corruption directe',
        'Corruption indirecte',
        "Trafic d'influence",
        'Favoritisme',
        "Prise illégale d'intérêt",
      ],
      credibilityOptions: ['Haute', 'Moyenne', 'Faible'],
      tierCategoryOptions: ['Professionnel de santé', 'Administratif', 'Politique', 'Prestataire', 'Client'],
    },
  },
  en: {
    ui: {
      brand: 'Impact Mapping',
      pageTitle: 'Impact Mapping',
      mapSelectorLabel: 'Map',
      mapSelectorAriaLabel: 'Choose a map',
      questionPanelTitle: 'Questions to ask',
      questionPanelTitleWithColumn: (label) => `Questions to ask • ${label}`,
      tabBarAriaLabel: 'Tab navigation',
      tabMap: 'Map',
      tabSynthese: 'Summary',
      tabMentions: 'Mentions @',
      tabConfiguration: 'Configuration',
      helperTitle: 'Live note-taking',
      selectionPrefix: 'Selection:',
      selectionNone: 'None',
      addSibling: 'Add at same level (Enter)',
      addChild: 'Add a child (Tab)',
      deleteBranch: 'Delete branch (Del)',
      notesHint: 'Tip: Alt + Enter or Shift + Enter to insert a line break in a note.',
      tagAdminTitle: 'Back office for "Means" tags',
      tagAdminDesc: 'Update the dropdown list displayed on nodes in the Means column.',
      newTagPlaceholder: 'New tag',
      newTagAriaLabel: 'Add a tag',
      addTagButton: 'Add',
      tierAdminTitle: 'Back office for "Third-party" categories',
      tierAdminDesc: 'Update the dropdown list displayed on nodes in the Third-party column.',
      newTierCategoryPlaceholder: 'New category',
      newTierCategoryAriaLabel: 'Add a category',
      addTierCategoryButton: 'Add',
      questionAdminTitle: 'Back office for badge questions',
      questionAdminDesc: 'Enter one question per line for each badge category of the active map.',
      syntheseTitle: 'Chain summary',
      copyAllSynthese: 'Copy all summaries',
      exportChainsCsv: 'Export CSV',
      mentionAdminTitle: 'Mentions @ back office',
      mentionAdminDesc: 'List of bubbles containing mentions, grouped by cited person.',
      zoomPanelAriaLabel: 'Zoom controls',
      zoomOutAriaLabel: 'Zoom out',
      zoomRangeAriaLabel: 'Zoom',
      zoomInAriaLabel: 'Zoom in',
      fitMap: 'Fit',
      fitMapAriaLabel: 'Fit to screen',
      footerLabel: 'Mindmap Impact Mapping tool',
      categoryPlaceholder: 'Category',
      objectiveAddTitle: 'Add an objective',
      objectiveAddAriaLabel: 'Add a new objective',
      objectiveRelaunchLabel: 'Specific activity relaunch',
      branchExpand: 'Expand branch',
      branchCollapse: 'Collapse branch',
      remove: 'Remove',
      questionsFor: 'Questions for',
      questionPlaceholder: 'One question per line, Markdown lists (-, *, +) supported',
      questionsEmpty: 'No questions configured for this category.',
      syntheseUnavailable: 'Summary unavailable for this map.',
      mentionEmpty: 'No @ mentions detected yet.',
      mentionBubbleSingular: 'bubble',
      mentionBubblePlural: 'bubbles',
      untitled: '[Untitled]',
      unknown: 'Unknown',
      moyenUncategorized: 'Uncategorized means',
      tierUncategorized: 'Uncategorized third party',
      comportementUnfilled: 'Behavior not specified',
      copy: 'Copy',
      copyFeedback: 'Copied!',
      exportFeedback: 'Exported!',
      syntheseEmptyChains: 'No complete chain Third party → Behavior → Means is available yet.',
      expandTextAria: 'Show full text',
      collapseTextAria: 'Collapse text',
      csvFilenamePrefix: 'chains',
      languageToggle: {
        label: 'FR',
        ariaLabel: 'Switch to French',
        title: 'Switch to French',
      },
    },
    synthese: {
      description: (connector) =>
        `Automatically generate sentences like "Means category ${connector} Third-party category to achieve Behavior" for each chain.`,
      phrase: (moyen, connector, tier, comportement) => `${moyen} ${connector} ${tier} to ${comportement}`,
      meta: (moyen, tier) => `Means: ${moyen} • Third party: ${tier}`,
    },
    mapTemplates: {
      'lfb-fournisseur': {
        name: 'LFB Supplier',
        columns: {
          objective: { label: 'Objective', placeholder: 'New objective' },
          tier: { label: 'Third party', placeholder: 'New third party' },
          comportement: { label: 'Behavior', placeholder: 'New behavior' },
          moyen: { label: 'Means', placeholder: 'New means' },
          controle: { label: 'Control', placeholder: 'New control' },
          limite: { label: 'Limit', placeholder: 'New limit' },
          proba: { label: 'Credibility', placeholder: 'New credibility' },
        },
        synthese: { tierConnector: 'of' },
      },
      'lfb-client': {
        name: 'LFB Client',
        columns: {
          tier: { label: 'Third party', placeholder: 'New third party' },
          objective: { label: 'Objective', placeholder: 'New objective' },
          comportement: { label: 'Behavior', placeholder: 'New behavior' },
          moyen: { label: 'Means', placeholder: 'New means' },
          controle: { label: 'Control', placeholder: 'New control' },
          contournement: { label: 'Workaround', placeholder: 'New workaround' },
          proba: { label: 'Credibility', placeholder: 'New credibility' },
        },
        synthese: { tierConnector: 'by' },
      },
      'lfb-controleur': {
        name: 'LFB Controller',
        columns: {
          controle: { label: 'Control', placeholder: 'New control' },
          description: { label: 'Description', placeholder: 'New description' },
          pertinence: { label: 'Relevance', placeholder: 'New relevance' },
          efficacite: { label: 'Effectiveness', placeholder: 'New effectiveness' },
        },
      },
    },
    questions: {
      'lfb-fournisseur': {
        objective: `**What are your business objectives that could be influenced by a third party?**
- Operational objectives (win a bid, obtain an authorization, negotiate a price…)
  - How often?
- Relationship objectives (maintain a key relationship)
- Time objectives (speed up, secure, unblock)
- Do you have objectives driven by third parties (distributors, service providers, intermediaries, ...)?
- Can you think of other activities where you are in contact with third parties? (directly or indirectly)`,
        tier: `**Who are the third parties that impact these objectives?**
- Administration / Client / Service providers / …
- Public agent? Private?
- Influencers?
- Do you use intermediaries / service providers / business introducers?`,
        comportement: `**What desired behaviors could you hope for from these third parties?**
- Favorable decision / interpretation?
- Faster decision?
- Flexibility on a rule?`,
        moyen: `**What undue advantages could be offered to obtain these behaviors?** (Not “what you would do,” but what could exist)
- Financial advantages: commission, kickback, overbilling, service (fictive or not)
  - Do you have room to maneuver? Possibility of cash payment?
  - Do you have such a budget?
- Benefits in kind: gifts, invitations, hospitality
  - Do you have room to maneuver?
  - Do you have such a budget?
- Indirect benefits: donations, sponsorship, job, internship, recommendation
  - Do you have room to maneuver? a budget?
  - Frequency? Beneficiaries? criteria?
- Deferred benefits: future promise, relationship maintained`,
        controle: `**What rules or procedures are supposed to prevent this scenario?**
- Formal procedure or informal practice? Objective criteria?
- How does it work in practice?
- Who controls? at what time? systematic? traceable?
- Is it actually applied? Is it actually effective?
- How do you identify the third parties you work with? Criteria?
- How do you determine their compensation amount?
- How do you document the reality of the service provided?`,
        limite: `**How could a malicious actor bypass these controls?**
- Through a third party?
- Circumventing procedures? Splitting services?
- Fictive services?
- Possibility of untraceable operations? (cash)
- Possibility to make payments in countries other than the implementation country?`,
        proba: `**Does this scenario seem credible in your environment?**
- Seen before in the sector?
- Does it seem credible in certain specific countries?
- Have you already been aware of solicitations of any kind?
- What is the level of pressure to achieve the objective? Could it lead to non-compliant practices?
- What link between remuneration and achieving the objective (bonus, success fee, commission …)?`,
      },
      'lfb-client': {
        tier: `**Which third parties are you in contact with? (directly or indirectly)**
- Are some third parties particularly influential for LFB?
- Are some third parties very dependent on LFB? and vice versa?`,
        objective: `**What are their expectations of you?**`,
        comportement: `**What desired behaviors?**
Examples:
- Be selected or renewed without competition
- Obtain contractual flexibility
- Be paid more or faster
- Have certain non-compliances ignored
- Be recommended internally
- Gain a personal advantage from their influence over you`,
        moyen: `**What types of undue advantages (direct or indirect) might some be tempted to offer to obtain these behaviors?**
- Gifts / invitations: Do you receive gifts, invitations or offers of advantage from this third party?
- Indirect benefits: Has a contact ever asked you to take someone as an intern or offer a job?
- Financial: Have you ever heard about kickbacks?`,
        controle: `**What rules or procedures are supposed to prevent this scenario?**
- Formal procedure or informal practice? Objective criteria?
- How does it work in practice?
- Who controls? at what time? systematic? traceable?
- Is it actually applied? Is it actually effective?
- How do you identify the third parties you work with? Criteria? Collective decisions?
- How do you determine their compensation amount?
- How do you document the reality of the service provided?`,
        contournement: `**In your opinion, how could a malicious actor bypass existing controls?**`,
        proba: `**Ultimately, what is the likelihood that a corruption risk will arise in your scope of activity?**
- Seen before in the sector?
- Does it seem credible in certain specific countries?
- Have you already been aware of solicitations of any kind?
- Have you ever been a victim or witness of an attempted fraud?`,
      },
      'lfb-controleur': {
        controle: `**What are the main control mechanisms you have put in place to prevent and detect corruption risks in operations?**
- What validations exist before a commitment?
- What controls exist on financial flows?
- Are there segregation-of-duties arrangements to avoid isolated decision-making?`,
        description: `**Can you describe this control and how it is implemented?**
- Who is responsible for the control?
- When does it take place in the process?
- What data or operation is controlled?
- Is the control:
  - manual or automated?
  - systematic or sampled?
- What is the evidence of the control?
- Is there a procedure or associated formalism?
- Are there country-specific / high-risk area specifics?`,
        pertinence: `**Is this control well suited to prevent corruption risks?**
- Does it cover priority risk scenarios?
- Are there areas not covered by this control?
- Is it well positioned:
  - at the right time?
  - at the right level?
  - Is it adapted to the company's practices?
  - What difficulties in implementation?`,
        efficacite: `**How do you assess the effectiveness of this mechanism?**
- Does this control actually:
  - prevent non-compliant behavior?
  - detect a deviation before it produces effects?
- Is it more effective:
  - on simple risks?
  - or also on complex schemes (third parties, overbilling, kickbacks)?
- Have you observed incidents despite this control? circumventions?
- Is the control applied uniformly? or highly dependent on people?
- How would you rate its effectiveness: low / medium / high?
- Do you have factual elements to support this assessment?
`,
      },
    },
    initialNodeTextByColumnKey: {
      objective: 'Primary objective',
      tier: 'Primary third party',
      comportement: 'Primary behavior',
      moyen: 'Primary means',
      controle: 'Primary control',
      limite: 'Primary limit',
      proba: 'Primary credibility',
      contournement: 'Primary workaround',
      description: 'Primary description',
      pertinence: 'Primary relevance',
      efficacite: 'Primary effectiveness',
    },
    options: {
      tagOptions: ['Direct corruption', 'Indirect corruption', 'Influence peddling', 'Favoritism', 'Conflict of interest'],
      credibilityOptions: ['High', 'Medium', 'Low'],
      tierCategoryOptions: ['Healthcare professional', 'Administrative', 'Political', 'Service provider', 'Client'],
    },
  },
};

const templateOrder = ['lfb-fournisseur', 'lfb-client', 'lfb-controleur'];
const localeByLanguage = { fr: 'fr', en: 'en' };
const defaultLanguage = 'fr';
let activeLanguage = defaultLanguage;
let mapTemplates = buildMapTemplates(activeLanguage);
let activeTemplateKey = templateOrder[0];
let columns = mapTemplates[activeTemplateKey].columns;
const questionConfigByLanguage = {
  fr: buildQuestionConfig('fr'),
  en: buildQuestionConfig('en'),
};
let questionConfigByTemplate = questionConfigByLanguage[activeLanguage];
const defaultOptionsByLanguage = {
  fr: translations.fr.options,
  en: translations.en.options,
};

function buildMapTemplates(language) {
  const translation = translations[language];
  return Object.fromEntries(
    Object.entries(templateDefinitions).map(([key, template]) => {
      const translatedTemplate = translation.mapTemplates[key];
      const columns = template.columns.map((column) => ({
        ...column,
        label: translatedTemplate.columns[column.key].label,
        placeholder: translatedTemplate.columns[column.key].placeholder,
      }));
      const synthese = template.synthese
        ? {
            ...template.synthese,
            tierConnector: translatedTemplate.synthese?.tierConnector ?? 'de',
          }
        : null;
      return [key, { name: translatedTemplate.name, columns, synthese }];
    })
  );
}

function buildQuestionConfig(language) {
  return Object.fromEntries(
    Object.entries(templateDefinitions).map(([key, template]) => {
      const questions = translations[language].questions[key] ?? {};
      const config = {};
      template.columns.forEach((column) => {
        config[column.key] = questions[column.key] || '';
      });
      return [key, config];
    })
  );
}

function getLocale() {
  return localeByLanguage[activeLanguage] ?? 'fr';
}

function getInitialNodeText(columnKey, columnLabel) {
  return translations[activeLanguage].initialNodeTextByColumnKey[columnKey] ?? columnLabel;
}

function arraysEqual(left, right) {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function replaceDefaultsIfUnused(currentOptions, previousDefaults, nextDefaults, isUsed) {
  if (isUsed) return currentOptions;
  if (arraysEqual(currentOptions, previousDefaults)) {
    return [...nextDefaults];
  }
  return currentOptions;
}

function applyStaticTranslations() {
  const { ui } = translations[activeLanguage];
  document.documentElement.lang = activeLanguage;
  document.title = ui.pageTitle;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (ui[key]) {
      el.textContent = ui[key];
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    if (ui[key]) {
      el.placeholder = ui[key];
    }
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    const key = el.dataset.i18nAriaLabel;
    if (ui[key]) {
      el.setAttribute('aria-label', ui[key]);
    }
  });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.dataset.i18nTitle;
    if (ui[key]) {
      el.title = ui[key];
    }
  });
}

function renderMapSelectorOptions() {
  if (!mapSelector) return;
  mapSelector.innerHTML = '';
  templateOrder.forEach((templateKey) => {
    const option = document.createElement('option');
    option.value = templateKey;
    option.textContent = mapTemplates[templateKey].name;
    mapSelector.appendChild(option);
  });
}

function updateLanguageToggle() {
  if (!languageToggleBtn) return;
  const toggle = translations[activeLanguage].ui.languageToggle;
  languageToggleBtn.textContent = toggle.label;
  languageToggleBtn.setAttribute('aria-label', toggle.ariaLabel);
  languageToggleBtn.title = toggle.title;
}

function setLanguage(language) {
  if (!translations[language] || language === activeLanguage) return;
  const previousLanguage = activeLanguage;
  activeLanguage = language;
  const previousDefaults = defaultOptionsByLanguage[previousLanguage];
  const nextDefaults = defaultOptionsByLanguage[activeLanguage];
  mapTemplates = buildMapTemplates(activeLanguage);
  columns = mapTemplates[activeTemplateKey].columns;
  questionConfigByTemplate = questionConfigByLanguage[activeLanguage];
  tagOptions = replaceDefaultsIfUnused(tagOptions, previousDefaults.tagOptions, nextDefaults.tagOptions, nodes.some((n) => n.tag));
  tierCategoryOptions = replaceDefaultsIfUnused(
    tierCategoryOptions,
    previousDefaults.tierCategoryOptions,
    nextDefaults.tierCategoryOptions,
    nodes.some((n) => n.tierCategory)
  );
  credibilityOptions = replaceDefaultsIfUnused(
    credibilityOptions,
    previousDefaults.credibilityOptions,
    nextDefaults.credibilityOptions,
    nodes.some((n) => n.credibilityTag)
  );
  applyStaticTranslations();
  updateLanguageToggle();
  renderMapSelectorOptions();
  if (mapSelector) {
    mapSelector.value = activeTemplateKey;
  }
  renderLegend();
  renderTagManager();
  renderTierCategoryManager();
  renderQuestionConfigManager();
  renderQuestionPanel();
  updateSyntheseDescription();
  render();
}
let activeQuestionCategoryKey = null;
let activeQuestionNodeId = null;

let nodes = [];

const templateStates = {};
let selectedId = null;
let collapsed = new Set();
let tagOptions = [...translations[activeLanguage].options.tagOptions];
let credibilityOptions = [...translations[activeLanguage].options.credibilityOptions];
let tierCategoryOptions = [...translations[activeLanguage].options.tierCategoryOptions];
let history = [];
let isRestoring = false;
let linkingFromId = null;
let linkPreviewPath = null;
let currentLinkTargetId = null;
let zoom = 1.0;
let hasCenteredInitialObjective = false;
let editingId = null;
const NODE_WIDTH = 300;
const MAX_NODE_TEXT_LENGTH = 145;
const TRUNCATED_NODE_TEXT_LENGTH = 140;
const columnSpacing = NODE_WIDTH + 60;
const rowSpacing = 170;
const mapWrapper = document.getElementById('map-wrapper');
const nodesContainer = document.getElementById('nodes');
const connectionsSvg = document.getElementById('connections');
const workspace = document.getElementById('workspace');
const zoomRange = document.getElementById('zoom-range');
const zoomValue = document.getElementById('zoom-value');
const zoomOutBtn = document.getElementById('zoom-out');
const zoomInBtn = document.getElementById('zoom-in');
const fitBtn = document.getElementById('fit-map');
const selectionLabel = document.getElementById('current-selection');
const addSiblingBtn = document.getElementById('add-sibling');
const addChildBtn = document.getElementById('add-child');
const deleteBranchBtn = document.getElementById('delete-branch');
const tagListEl = document.getElementById('tag-list');
const addTagBtn = document.getElementById('add-tag');
const newTagInput = document.getElementById('new-tag');
const tierCategoryListEl = document.getElementById('tier-category-list');
const addTierCategoryBtn = document.getElementById('add-tier-category');
const newTierCategoryInput = document.getElementById('new-tier-category');
const mentionListEl = document.getElementById('mention-list');
const syntheseListEl = document.getElementById('synthese-list');
const copyAllSyntheseBtn = document.getElementById('copy-all-synthese');
const exportChainsCsvBtn = document.getElementById('export-chains-csv');
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('.tab-panel');
const expandedNodes = new Set();
const legendContainer = document.querySelector('.legend');
const mapSelector = document.getElementById('map-selector');
const languageToggleBtn = document.getElementById('language-toggle');
const questionPanelEl = document.getElementById('question-panel');
const questionPanelTitleEl = document.getElementById('question-panel-title');
const questionPanelBodyEl = document.getElementById('question-panel-body');
const questionConfigListEl = document.getElementById('question-config-list');
const syntheseDescEl = document.getElementById('synthese-desc');

function snapshotState() {
  return {
    nodes: nodes.map((n) => ({ ...n })),
    selectedId,
    collapsed: Array.from(collapsed),
    tagOptions: [...tagOptions],
    tierCategoryOptions: [...tierCategoryOptions],
  };
}

function buildInitialNodes(templateKey) {
  const templateColumns = mapTemplates[templateKey].columns;
  const firstColumn = templateColumns[0];
  const initialNode = {
    id: 'n1',
    column: 0,
    text: getInitialNodeText(firstColumn.key, firstColumn.label),
    parentId: null,
    extraParentIds: [],
    color: firstColumn.color,
    sortOrder: 0,
  };
  if (firstColumn.key === 'objective') {
    initialNode.objectiveRelaunch = false;
  }
  return [initialNode];
}

function storeActiveTemplateState() {
  templateStates[activeTemplateKey] = {
    nodes: nodes.map((n) => ({ ...n })),
    selectedId,
    collapsed: Array.from(collapsed),
    history: history.map((entry) => ({
      ...entry,
      nodes: entry.nodes.map((n) => ({ ...n })),
      collapsed: Array.from(entry.collapsed),
    })),
    expandedNodes: Array.from(expandedNodes),
  };
}

function loadTemplateState(templateKey) {
  const saved = templateStates[templateKey];
  if (saved) {
    nodes = saved.nodes.map((n) => ({ ...n }));
    selectedId = saved.selectedId;
    collapsed = new Set(saved.collapsed);
    history = saved.history.map((entry) => ({
      ...entry,
      nodes: entry.nodes.map((n) => ({ ...n })),
      collapsed: Array.from(entry.collapsed),
    }));
    expandedNodes.clear();
    saved.expandedNodes.forEach((id) => expandedNodes.add(id));
    return;
  }
  nodes = buildInitialNodes(templateKey);
  selectedId = nodes[0]?.id ?? null;
  collapsed = new Set();
  history = [];
  expandedNodes.clear();
}

function setActiveTemplate(templateKey) {
  if (!mapTemplates[templateKey] || templateKey === activeTemplateKey) return;
  storeActiveTemplateState();
  activeTemplateKey = templateKey;
  columns = mapTemplates[activeTemplateKey].columns;
  hasCenteredInitialObjective = false;
  activeQuestionCategoryKey = null;
  activeQuestionNodeId = null;
  loadTemplateState(templateKey);
  renderLegend();
  renderQuestionConfigManager();
  renderQuestionPanel();
  updateSyntheseDescription();
  render();
  if (!history.length) {
    recordHistory();
  }
  ensureFirstObjectiveVisible();
}

function renderLegend() {
  if (!legendContainer) return;
  legendContainer.innerHTML = '';
  columns.forEach((column) => {
    const item = document.createElement('span');
    item.className = `legend-item ${column.color}`;
    item.textContent = column.label;
    legendContainer.appendChild(item);
  });
}

function recordHistory() {
  if (isRestoring) return;
  history.push(snapshotState());
  if (history.length > 200) {
    history.shift();
  }
}

function restoreState(state) {
  isRestoring = true;
  nodes = state.nodes.map((n) => ({ ...n }));
  selectedId = state.selectedId;
  collapsed = new Set(state.collapsed);
  tagOptions = [...state.tagOptions];
  tierCategoryOptions = [...(state.tierCategoryOptions ?? tierCategoryOptions)];
  renderTagManager();
  renderTierCategoryManager();
  render();
  isRestoring = false;
}

function undo() {
  if (history.length <= 1) return;
  history.pop();
  const previous = history[history.length - 1];
  restoreState(previous);
}

let positions = new Map();
let groupBounds = new Map();

function adjustParentPositionsToChildren(visibleNodes) {
  const childPositionsByParent = new Map();
  visibleNodes.forEach((node) => {
    if (!node.parentId) return;
    const childPos = positions.get(node.id);
    if (!childPos) return;
    if (!childPositionsByParent.has(node.parentId)) {
      childPositionsByParent.set(node.parentId, []);
    }
    childPositionsByParent.get(node.parentId).push(childPos.y);
  });

  childPositionsByParent.forEach((childYs, parentId) => {
    const parentPos = positions.get(parentId);
    if (!parentPos) return;
    const minY = Math.min(...childYs);
    const maxY = Math.max(...childYs);
    const centerY = (minY + maxY) / 2;
    positions.set(parentId, { ...parentPos, y: centerY });
  });
}

function avoidChildAlignmentWithForeignParents(visibleNodes) {
  const parentsByColumn = new Map();
  visibleNodes.forEach((node) => {
    if (!hasChildren(node.id)) return;
    if (!parentsByColumn.has(node.column)) {
      parentsByColumn.set(node.column, []);
    }
    parentsByColumn.get(node.column).push(node);
  });

  const alignmentThreshold = 10;
  const nudgeDistance = Math.min(40, rowSpacing / 4);

  visibleNodes.forEach((node) => {
    if (!node.parentId) return;
    const parent = nodes.find((n) => n.id === node.parentId);
    if (!parent) return;
    const foreignParents = (parentsByColumn.get(parent.column) || []).filter((p) => p.id !== node.parentId);
    if (!foreignParents.length) return;
    const childPos = positions.get(node.id);
    if (!childPos) return;
    const bounds = groupBounds.get(getRootId(node));
    let adjustedY = childPos.y;

    foreignParents.forEach((foreignParent) => {
      const foreignPos = positions.get(foreignParent.id);
      if (!foreignPos) return;
      if (Math.abs(adjustedY - foreignPos.y) <= alignmentThreshold) {
        adjustedY += adjustedY <= foreignPos.y ? nudgeDistance : -nudgeDistance;
        if (bounds) {
          adjustedY = Math.min(bounds.bottom, Math.max(bounds.top, adjustedY));
        }
      }
    });

    if (adjustedY !== childPos.y) {
      positions.set(node.id, { ...childPos, y: adjustedY });
    }
  });
}

function ensureArrowDefs() {
  let defs = connectionsSvg.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    connectionsSvg.appendChild(defs);
  }

  let marker = defs.querySelector('#arrowhead');
  if (!marker) {
    marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('viewBox', '0 0 24 24');
    marker.setAttribute('refX', '20');
    marker.setAttribute('refY', '12');
    marker.setAttribute('markerWidth', '16');
    marker.setAttribute('markerHeight', '16');
    marker.setAttribute('markerUnits', 'userSpaceOnUse');
    marker.setAttribute('orient', 'auto');

    const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrowPath.setAttribute('d', 'M 0 0 L 24 12 L 0 24 z');
    arrowPath.setAttribute('fill', '#91a4c1');
    marker.appendChild(arrowPath);
    defs.appendChild(marker);
  }
}

function switchTab(targetId) {
  tabButtons.forEach((btn) => {
    const isActive = btn.dataset.tabTarget === targetId;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  tabPanels.forEach((panel) => {
    panel.classList.toggle('active', panel.id === targetId);
  });
  if (targetId === 'tab-map' && selectedId) {
    requestAnimationFrame(() => centerOnNode(selectedId));
  }
}

function sortValue(node, fallback) {
  return node.sortOrder ?? fallback;
}

function hasChildren(nodeId) {
  return nodes.some((n) => n.parentId === nodeId);
}

function isAncestorCollapsed(node) {
  let parentId = node.parentId;
  while (parentId) {
    if (collapsed.has(parentId)) return true;
    parentId = nodes.find((n) => n.id === parentId)?.parentId ?? null;
  }
  return false;
}

function getVisibleNodes() {
  return nodes.filter((n) => !isAncestorCollapsed(n));
}

function isNodeVisible(id) {
  const node = nodes.find((n) => n.id === id);
  if (!node) return false;
  return !isAncestorCollapsed(node);
}

function extractMentions(text) {
  if (!text) return [];
  const mentions = [];
  const mentionRegex = /@([A-Za-zÀ-ÖØ-öø-ÿ0-9_-]+)/g;
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  return mentions;
}

function getMentionGroups() {
  const groups = new Map();
  nodes.forEach((node) => {
    const mentions = extractMentions(node.text);
    mentions.forEach((mention) => {
      if (!groups.has(mention)) {
        groups.set(mention, []);
      }
      groups.get(mention).push(node);
    });
  });
  return groups;
}

function computeInsertionOrder(column, parentId, afterId) {
  const siblings = nodes
    .filter((n) => n.column === column && n.parentId === parentId)
    .sort((a, b) => sortValue(a, 0) - sortValue(b, 0) || a.id.localeCompare(b.id));

  if (!siblings.length) return 0;

  if (!afterId) {
    return sortValue(siblings[siblings.length - 1], siblings.length - 1) + 1;
  }

  const index = siblings.findIndex((s) => s.id === afterId);
  if (index === -1) {
    return sortValue(siblings[siblings.length - 1], siblings.length - 1) + 1;
  }

  const currentOrder = sortValue(siblings[index], index);
  const nextOrder = siblings[index + 1] ? sortValue(siblings[index + 1], index + 1) : currentOrder + 1;
  if (nextOrder === currentOrder) {
    return currentOrder + 1;
  }
  return (currentOrder + nextOrder) / 2;
}

function getRootId(node) {
  let current = node;
  while (current?.parentId) {
    const parent = nodes.find((n) => n.id === current.parentId);
    if (!parent) break;
    current = parent;
  }
  return current?.id ?? node.id;
}

function computeLayout() {
  positions = new Map();
  groupBounds = new Map();
  const visibleNodes = getVisibleNodes();
  if (!visibleNodes.length) return;

  const nodeById = new Map(visibleNodes.map((node) => [node.id, node]));
  const byColumn = columns.map(() => []);
  const groupMap = new Map();
  const rootOrder = [];
  const rootsById = new Map();

  visibleNodes.forEach((node) => {
    byColumn[node.column]?.push(node);
    const rootId = getRootId(node);
    if (!groupMap.has(rootId)) {
      groupMap.set(rootId, columns.map(() => []));
    }
    groupMap.get(rootId)[node.column].push(node);
  });

  const visibleRoots = visibleNodes.filter((n) => !n.parentId || n.column === 0);
  visibleRoots
    .sort((a, b) => sortValue(a, 0) - sortValue(b, 0) || a.id.localeCompare(b.id))
    .forEach((root) => {
      const rootId = getRootId(root);
      if (!rootsById.has(rootId)) {
        rootsById.set(rootId, root);
        rootOrder.push(rootId);
      }
    });

  Array.from(groupMap.keys()).forEach((rootId) => {
    if (!rootsById.has(rootId)) {
      rootOrder.push(rootId);
    }
  });

  groupMap.forEach((columnsByGroup) => {
    const orderByColumn = columns.map(() => new Map());
    columnsByGroup.forEach((colNodes, columnIndex) => {
      const getParentOrder = (node) => {
        if (!node.parentId) return -1;
        const parent = nodeById.get(node.parentId);
        if (!parent) return -1;
        const parentOrder = orderByColumn[parent.column]?.get(parent.id);
        return parentOrder ?? -1;
      };

      colNodes.sort((a, b) => {
        if (columnIndex === 0) {
          return sortValue(a, 0) - sortValue(b, 0) || a.id.localeCompare(b.id);
        }
        const parentOrderDiff = getParentOrder(a) - getParentOrder(b);
        if (parentOrderDiff !== 0) return parentOrderDiff;
        return sortValue(a, 0) - sortValue(b, 0) || a.id.localeCompare(b.id);
      });

      colNodes.forEach((node, index) => {
        orderByColumn[columnIndex].set(node.id, index);
      });
    });
  });

  let currentY = 140;
  const groupGap = 80;
  rootOrder.forEach((rootId) => {
    const columnsByGroup = groupMap.get(rootId);
    if (!columnsByGroup) return;
    const maxCount = Math.max(1, ...columnsByGroup.map((colNodes) => colNodes.length || 0));
    const contentHeight = maxCount * rowSpacing;
    const groupHeight = contentHeight + 120;
    const groupTop = currentY;
    const contentTop = groupTop + (groupHeight - contentHeight) / 2;
    groupBounds.set(rootId, { top: groupTop, bottom: groupTop + groupHeight });

    columnsByGroup.forEach((colNodes, columnIndex) => {
      const offset = ((maxCount - colNodes.length) * rowSpacing) / 2;
      colNodes.forEach((node, index) => {
        const x = 120 + columnIndex * columnSpacing;
        const y = contentTop + offset + index * rowSpacing;
        positions.set(node.id, { x, y });
      });
    });

    currentY += groupHeight + groupGap;
  });

  adjustParentPositionsToChildren(visibleNodes);
  avoidChildAlignmentWithForeignParents(visibleNodes);
}

function appendCategorySelect(container, node, options, key) {
  const tagRow = document.createElement('div');
  tagRow.className = 'tag-row';
  const select = document.createElement('select');
  select.className = 'tag-select';
  select.innerHTML = `<option value="">${translations[activeLanguage].ui.categoryPlaceholder}</option>`;
  options.forEach((opt) => {
    const option = document.createElement('option');
    option.value = opt;
    option.textContent = opt;
    select.appendChild(option);
  });
  select.value = node[key] || '';
  select.addEventListener('change', () => {
    if (node[key] === select.value) return;
    node[key] = select.value;
    recordHistory();
    renderSynthese();
  });
  tagRow.append(select);
  container.appendChild(tagRow);
}

function appendObjectiveRelaunchToggle(container, node) {
  const flagRow = document.createElement('label');
  flagRow.className = 'objective-flag';
  flagRow.addEventListener('click', (event) => event.stopPropagation());
  flagRow.addEventListener('mousedown', (event) => event.stopPropagation());
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = Boolean(node.objectiveRelaunch);
  checkbox.addEventListener('change', () => {
    node.objectiveRelaunch = checkbox.checked;
    recordHistory();
  });
  checkbox.addEventListener('click', (event) => event.stopPropagation());
  checkbox.addEventListener('mousedown', (event) => event.stopPropagation());
  const text = document.createElement('span');
  text.textContent = translations[activeLanguage].ui.objectiveRelaunchLabel;
  flagRow.append(checkbox, text);
  container.appendChild(flagRow);
}

function handleBadgeClick(node, titleEl) {
  const columnKey = columns[node.column]?.key;
  if (!columnKey) return;
  const isSameBadge =
    activeQuestionCategoryKey === columnKey &&
    activeQuestionNodeId === node.id &&
    questionPanelEl &&
    !questionPanelEl.hidden;
  if (isSameBadge) {
    activeQuestionCategoryKey = null;
    activeQuestionNodeId = null;
    renderQuestionPanel();
    return;
  }
  activeQuestionCategoryKey = columnKey;
  activeQuestionNodeId = node.id;
  selectedId = node.id;
  updateSelection();
  renderQuestionPanel();
  centerOnNode(node.id);
  titleEl?.focus({ preventScroll: true });
}

function renderNodes() {
  nodesContainer.innerHTML = '';
  const visibleNodes = getVisibleNodes();
  visibleNodes.forEach((node) => {
    const position = positions.get(node.id);
    if (!position) return;
    const { x, y } = position;
    const el = document.createElement('div');
    el.className = `node ${node.color} ${selectedId === node.id ? 'selected' : ''}`;
    if (editingId === node.id) {
      el.classList.add('editing');
    }
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.dataset.id = node.id;

    const badge = document.createElement('div');
    badge.className = 'badge';
    badge.innerHTML = `<span class="dot" aria-hidden="true"></span>${columns[node.column].label}`;
    badge.setAttribute('role', 'button');
    badge.tabIndex = 0;
    el.appendChild(badge);

    const title = document.createElement('div');
    title.className = 'node-text';
    title.contentEditable = 'true';
    title.dataset.placeholder = columns[node.column].placeholder;
    title.textContent = getNodeDisplayText(node);
    title.addEventListener('focus', () => {
      setEditingNode(node.id);
      selectedId = node.id;
      updateSelection();
      requestAnimationFrame(() => centerOnNode(node.id));
      title.textContent = node.text;
    });
    title.addEventListener('input', () => {
      requestAnimationFrame(() => centerOnNode(node.id));
    });
    title.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.altKey || e.shiftKey)) {
        e.preventDefault();
        document.execCommand('insertLineBreak');
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        title.blur();
      }
    });
    title.addEventListener('blur', () => {
      const sanitized = title.textContent || '';
      updateNodeText(node.id, sanitized);
      if (editingId === node.id) {
        setEditingNode(null);
      }
      if (!sanitized.trim()) {
        title.textContent = '';
        expandedNodes.delete(node.id);
        return;
      }
      title.textContent = getNodeDisplayText(node);
      const nodeEl = title.closest('.node');
      const expandBtn = nodeEl?.querySelector('.node-expand');
      if (shouldShowExpandToggle(node)) {
        if (!expandBtn && nodeEl) {
          const newExpandBtn = document.createElement('button');
          newExpandBtn.type = 'button';
          newExpandBtn.className = 'node-expand';
          updateExpandButton(newExpandBtn, node);
          newExpandBtn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleNodeExpanded(node.id);
            updateExpandButton(newExpandBtn, node);
            title.textContent = getNodeDisplayText(node);
          });
          newExpandBtn.addEventListener('mousedown', (event) => {
            event.stopPropagation();
          });
          nodeEl.appendChild(newExpandBtn);
        } else if (expandBtn) {
          updateExpandButton(expandBtn, node);
        }
      } else if (expandBtn) {
        expandBtn.remove();
      }
    });

    badge.addEventListener('click', (event) => {
      event.stopPropagation();
      handleBadgeClick(node, title);
    });
    badge.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleBadgeClick(node, title);
      }
    });

    el.appendChild(title);

    if (shouldShowExpandToggle(node)) {
      const expandBtn = document.createElement('button');
      expandBtn.type = 'button';
      expandBtn.className = 'node-expand';
      updateExpandButton(expandBtn, node);
      expandBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleNodeExpanded(node.id);
        updateExpandButton(expandBtn, node);
        title.textContent = getNodeDisplayText(node);
      });
      expandBtn.addEventListener('mousedown', (event) => {
        event.stopPropagation();
      });
      el.appendChild(expandBtn);
    }

    if (columns[node.column]?.key === 'tier') {
      appendCategorySelect(el, node, tierCategoryOptions, 'tierCategory');
    }

    if (columns[node.column]?.key === 'objective') {
      appendObjectiveRelaunchToggle(el, node);
    }

    if (columns[node.column]?.key === 'moyen') {
      appendCategorySelect(el, node, tagOptions, 'tag');
    }

    if (columns[node.column]?.key === 'proba') {
      appendCategorySelect(el, node, credibilityOptions, 'credibilityTag');
    }

    if (hasChildren(node.id)) {
      const toggle = document.createElement('button');
      toggle.className = `collapse-toggle ${collapsed.has(node.id) ? 'collapsed' : ''}`;
      toggle.type = 'button';
      toggle.title = collapsed.has(node.id)
        ? translations[activeLanguage].ui.branchExpand
        : translations[activeLanguage].ui.branchCollapse;
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleBranch(node.id);
      });
      el.appendChild(toggle);
    }

    el.addEventListener('click', (event) => {
      if (event.target.closest('select')) return;
      selectedId = node.id;
      updateSelection();
      centerOnNode(node.id);
      title.focus({ preventScroll: true });
    });

    el.addEventListener('mousedown', (event) => {
      if (event.button !== 0) return;
      if (event.target.isContentEditable || event.target.closest('select') || event.target.classList.contains('collapse-toggle')) return;
      startLinking(node.id, event);
    });

    nodesContainer.appendChild(el);
  });

  renderObjectiveAddButton();
}

function resolveChildAlignmentWithForeignParents({ node, candidateY, minY, maxY, alignmentThreshold, nudgeDistance, parentsByColumn }) {
  if (!node.parentId) return candidateY;
  const parent = nodes.find((n) => n.id === node.parentId);
  if (!parent) return candidateY;
  const foreignParents = (parentsByColumn.get(parent.column) || []).filter((p) => p.id !== parent.id);
  if (!foreignParents.length) return candidateY;

  let adjustedY = candidateY;
  let attempts = 0;
  while (attempts < 6) {
    const conflictingParent = foreignParents.find((foreignParent) => {
      const foreignPos = positions.get(foreignParent.id);
      return foreignPos && Math.abs(adjustedY - foreignPos.y) <= alignmentThreshold;
    });
    if (!conflictingParent) break;
    const foreignY = positions.get(conflictingParent.id)?.y ?? adjustedY;
    const moveUp = adjustedY <= foreignY;
    let nextY = adjustedY + (moveUp ? -nudgeDistance : nudgeDistance);
    if (nextY < minY || nextY > maxY) {
      nextY = adjustedY + (moveUp ? nudgeDistance : -nudgeDistance);
    }
    nextY = Math.min(maxY, Math.max(minY, nextY));
    if (nextY === adjustedY) break;
    adjustedY = nextY;
    attempts += 1;
  }

  return adjustedY;
}

function preventNodeOverlap() {
  const visibleNodes = getVisibleNodes();
  const nodesByGroupAndColumn = new Map();
  const rootOrder = [];
  const parentsByColumn = new Map();

  visibleNodes.forEach((node) => {
    const el = nodesContainer.querySelector(`.node[data-id="${node.id}"]`);
    if (!el) return;
    const rootId = getRootId(node);
    if (!nodesByGroupAndColumn.has(rootId)) {
      nodesByGroupAndColumn.set(rootId, columns.map(() => []));
      rootOrder.push(rootId);
    }
    nodesByGroupAndColumn.get(rootId)[node.column].push({ node, el });
    if (hasChildren(node.id)) {
      if (!parentsByColumn.has(node.column)) {
        parentsByColumn.set(node.column, []);
      }
      parentsByColumn.get(node.column).push(node);
    }
  });

  const gap = 32;
  const alignmentThreshold = 12;
  const nudgeDistance = Math.min(40, rowSpacing / 4);
  rootOrder.forEach((rootId) => {
    const columnsByGroup = nodesByGroupAndColumn.get(rootId);
    const bounds = groupBounds.get(rootId);
    columnsByGroup?.forEach((items) => {
      items.sort((a, b) => {
        const posA = positions.get(a.node.id)?.y ?? 0;
        const posB = positions.get(b.node.id)?.y ?? 0;
        return posA - posB;
      });

      let lastBottom = bounds?.top ?? -Infinity;
      items.forEach(({ node, el }) => {
        const pos = positions.get(node.id);
        if (!pos) return;
        const height = el.offsetHeight || el.getBoundingClientRect().height || 0;
        const minY = lastBottom + gap;
        const maxY = bounds?.bottom ? bounds.bottom - height : Infinity;
        let adjustedY = Math.max(pos.y, minY);
        if (bounds?.bottom) {
          adjustedY = Math.min(adjustedY, maxY);
        }
        adjustedY = resolveChildAlignmentWithForeignParents({
          node,
          candidateY: adjustedY,
          minY,
          maxY,
          alignmentThreshold,
          nudgeDistance,
          parentsByColumn,
        });
        if (adjustedY !== pos.y) {
          positions.set(node.id, { ...pos, y: adjustedY });
        }
        el.style.top = `${positions.get(node.id)?.y ?? adjustedY}px`;
        lastBottom = (positions.get(node.id)?.y ?? adjustedY) + height;
      });
    });
  });

  const addButton = nodesContainer.querySelector('.objective-add');
  if (addButton) {
    const objectiveNodes = getVisibleNodes().filter((n) => n.column === 0);
    const referenceId = objectiveNodes[0]?.id ?? nodes.find((n) => n.column === 0)?.id ?? null;
    const referencePos = referenceId ? positions.get(referenceId) : null;
    const baseX = referencePos?.x ?? 120;
    const maxObjectiveY = objectiveNodes.reduce((max, node) => {
      const pos = positions.get(node.id);
      return pos ? Math.max(max, pos.y) : max;
    }, referencePos?.y ?? 120);

    addButton.style.top = `${maxObjectiveY + rowSpacing}px`;
    addButton.style.left = `${baseX + 74}px`;
  }
}

function renderObjectiveAddButton() {
  const objectiveNodes = getVisibleNodes().filter((n) => n.column === 0);
  const referenceId = objectiveNodes[0]?.id ?? nodes.find((n) => n.column === 0)?.id ?? null;
  const referencePos = referenceId ? positions.get(referenceId) : null;
  const baseX = referencePos?.x ?? 120;
  const maxObjectiveY = objectiveNodes.reduce((max, node) => {
    const pos = positions.get(node.id);
    return pos ? Math.max(max, pos.y) : max;
  }, referencePos?.y ?? 120);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'objective-add';
  button.style.top = `${maxObjectiveY + rowSpacing}px`;
  button.style.left = `${baseX + 74}px`;
  button.title = translations[activeLanguage].ui.objectiveAddTitle;
  button.setAttribute('aria-label', translations[activeLanguage].ui.objectiveAddAriaLabel);
  button.innerHTML = '+';
  button.addEventListener('click', () => {
    createNode({ column: 0, parentId: null });
  });

  nodesContainer.appendChild(button);
}

function updateSelection() {
  document.querySelectorAll('.node').forEach((n) => n.classList.remove('selected'));
  const selectedEl = document.querySelector(`.node[data-id="${selectedId}"]`);
  if (selectedEl) {
    selectedEl.classList.add('selected');
    requestAnimationFrame(() => centerOnNode(selectedId));
  }
  syncQuestionPanelToSelection();
  updateHelperPanel();
}

function syncQuestionPanelToSelection() {
  if (!activeQuestionCategoryKey || !selectedId) return;
  const node = nodes.find((n) => n.id === selectedId);
  if (!node) return;
  const columnKey = columns[node.column]?.key;
  if (!columnKey) return;
  if (columnKey === activeQuestionCategoryKey && activeQuestionNodeId === node.id) return;
  activeQuestionCategoryKey = columnKey;
  activeQuestionNodeId = node.id;
  renderQuestionPanel();
}

function setEditingNode(nodeId) {
  if (editingId === nodeId) return;
  if (editingId) {
    const previousEl = nodesContainer.querySelector(`.node[data-id="${editingId}"]`);
    previousEl?.classList.remove('editing');
  }
  editingId = nodeId;
  if (editingId) {
    const currentEl = nodesContainer.querySelector(`.node[data-id="${editingId}"]`);
    currentEl?.classList.add('editing');
  }
}

function elbowPath(from, to) {
  const startX = from.x + NODE_WIDTH - 60;
  const startY = from.y + 32;
  const endX = to.x - 16;
  const endY = to.y + 32;
  const dx = endX - startX;
  const dy = endY - startY;
  const distance = Math.hypot(dx, dy);
  const handle = Math.min(220, distance / 2);
  const angle = Math.atan2(dy, dx);
  const control1 = {
    x: startX + Math.cos(angle) * handle,
    y: startY,
  };
  const control2 = {
    x: endX - Math.cos(angle) * handle,
    y: endY - Math.sin(angle) * handle,
  };
  return `M ${startX} ${startY} C ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${endX} ${endY}`;
}

function renderConnections() {
  connectionsSvg.replaceChildren();
  ensureArrowDefs();
  if (!positions.size) return;
  const maxX = Math.max(...Array.from(positions.values()).map((p) => p.x)) + 500;
  const maxY = Math.max(...Array.from(positions.values()).map((p) => p.y)) + 400;
  connectionsSvg.setAttribute('width', maxX);
  connectionsSvg.setAttribute('height', maxY);
  getVisibleNodes().forEach((node) => {
    const parentIds = [node.parentId, ...(node.extraParentIds ?? [])].filter(Boolean);
    parentIds.forEach((parentId) => {
      if (!isNodeVisible(parentId)) return;
      const from = positions.get(parentId);
      const to = positions.get(node.id);
      if (!from || !to) return;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', elbowPath(from, to));
      path.setAttribute('class', 'path');
      path.setAttribute('marker-end', 'url(#arrowhead)');
      connectionsSvg.appendChild(path);
    });
  });
  if (linkPreviewPath) {
    connectionsSvg.appendChild(linkPreviewPath);
  }
}

function render() {
  computeLayout();
  renderNodes();
  preventNodeOverlap();
  renderConnections();
  renderMentionBackoffice();
  renderSynthese();
  applyZoom();
  if (selectedId && !isNodeVisible(selectedId)) {
    const parentId = nodes.find((n) => n.id === selectedId)?.parentId;
    selectedId = parentId ?? nodes[0]?.id ?? null;
  }
  updateSelection();
}

function commitEditingNodeText() {
  if (!editingId) return;
  const editingEl = nodesContainer.querySelector(`.node[data-id="${editingId}"] .node-text`);
  if (!editingEl) return;
  const currentText = editingEl.textContent || '';
  updateNodeText(editingId, currentText);
  const node = nodes.find((n) => n.id === editingId);
  if (node) {
    editingEl.textContent = getNodeDisplayText(node);
  }
  setEditingNode(null);
}

function updateHelperPanel() {
  const current = nodes.find((n) => n.id === selectedId);
  const hasSelection = Boolean(current);
  const canCreateChild = hasSelection && current.column + 1 < columns.length;
  const displayText = hasSelection
    ? current.text || columns[current.column].placeholder
    : translations[activeLanguage].ui.selectionNone;
  selectionLabel.textContent = `${translations[activeLanguage].ui.selectionPrefix} ${displayText}`;
  addSiblingBtn.disabled = !hasSelection;
  addChildBtn.disabled = !canCreateChild;
  deleteBranchBtn.disabled = !hasSelection;
}

function createNode({ column, parentId, afterId }) {
  commitEditingNodeText();
  const newId = `n${Date.now()}`;
  const columnMeta = columns[column];
  const text = '';
  const sortOrder = computeInsertionOrder(column, parentId ?? null, afterId);
  const node = { id: newId, column, parentId: parentId ?? null, extraParentIds: [], text, color: columnMeta.color, sortOrder };
  if (columnMeta.key === 'objective') {
    node.objectiveRelaunch = false;
  }
  nodes.push(node);
  selectedId = newId;
  render();
  recordHistory();
  const verticalOnly = ['objective', 'controle', 'tier'].includes(columnMeta.key);
  centerOnNode(newId, { verticalOnly });
  requestAnimationFrame(() => {
    const titleEl = nodesContainer.querySelector(`[data-id="${newId}"] .node-text`);
    titleEl?.focus({ preventScroll: true });
  });
}

function handleKeydown(e) {
  const active = document.activeElement;
  const isEditing = active?.isContentEditable;
  const isFormField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(active?.tagName);
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    undo();
    return;
  }
  if ((isEditing && e.key !== 'Tab' && e.key !== 'Delete') || isFormField) {
    return;
  }
  if (!selectedId) return;
  const current = nodes.find((n) => n.id === selectedId);
  if (!current) return;

  if (e.key === 'Enter') {
    e.preventDefault();
    createNode({ column: current.column, parentId: current.parentId, afterId: current.id });
  } else if (e.key === 'Tab') {
    e.preventDefault();
    const nextColumn = current.column + 1;
    if (nextColumn < columns.length) {
      createNode({ column: nextColumn, parentId: current.id });
    }
  } else if (e.key === 'Delete') {
    e.preventDefault();
    deleteNodeTree(current.id);
  }
}

document.addEventListener('keydown', handleKeydown);

function addSiblingNode() {
  const current = nodes.find((n) => n.id === selectedId);
  if (!current) return;
  createNode({ column: current.column, parentId: current.parentId, afterId: current.id });
}

function addChildNode() {
  const current = nodes.find((n) => n.id === selectedId);
  if (!current) return;
  const nextColumn = current.column + 1;
  if (nextColumn >= columns.length) return;
  createNode({ column: nextColumn, parentId: current.id });
}

function deleteSelectedBranch() {
  const current = nodes.find((n) => n.id === selectedId);
  if (!current) return;
  deleteNodeTree(current.id);
}

addSiblingBtn.addEventListener('click', addSiblingNode);
addChildBtn.addEventListener('click', addChildNode);
deleteBranchBtn.addEventListener('click', deleteSelectedBranch);
addTagBtn?.addEventListener('click', addTagFromInput);
newTagInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addTagFromInput();
  }
});
addTierCategoryBtn?.addEventListener('click', addTierCategoryFromInput);
newTierCategoryInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addTierCategoryFromInput();
  }
});

copyAllSyntheseBtn?.addEventListener('click', () => {
  const entries = buildSyntheseEntries();
  if (!entries.length) return;
  const fullText = entries.map((entry) => entry.phrase).join('\n');
  copyToClipboard(fullText, copyAllSyntheseBtn);
});

exportChainsCsvBtn?.addEventListener('click', () => {
  const csvContent = buildChainsCsv();
  if (!csvContent) return;
  const dateStamp = new Date().toISOString().slice(0, 10);
  const filename = `${translations[activeLanguage].ui.csvFilenamePrefix}-${activeTemplateKey}-${dateStamp}.csv`;
  downloadCsvFile(filename, csvContent);
  showCopyFeedback(exportChainsCsvBtn, translations[activeLanguage].ui.exportFeedback);
});

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tabTarget));
});
switchTab('tab-map');

applyStaticTranslations();
updateLanguageToggle();
renderMapSelectorOptions();

if (mapSelector) {
  mapSelector.value = activeTemplateKey;
  mapSelector.addEventListener('change', (event) => {
    setActiveTemplate(event.target.value);
  });
}

languageToggleBtn?.addEventListener('click', () => {
  setLanguage(activeLanguage === 'fr' ? 'en' : 'fr');
});

function applyZoom() {
  mapWrapper.style.transform = `scale(${zoom})`;
  zoomRange.value = Math.round(zoom * 100);
  zoomValue.textContent = `${Math.round(zoom * 100)}%`;
}

function setZoom(value) {
  zoom = Math.min(1.5, Math.max(0.4, value));
  applyZoom();
  if (selectedId) {
    requestAnimationFrame(() => centerOnNode(selectedId));
  }
}

zoomRange.addEventListener('input', (e) => {
  setZoom(Number(e.target.value) / 100);
});

zoomOutBtn.addEventListener('click', () => setZoom(zoom - 0.1));
zoomInBtn.addEventListener('click', () => setZoom(zoom + 0.1));

function centerOnNode(id, options = {}) {
  const { verticalOnly = false } = options;
  const element = nodesContainer.querySelector(`[data-id="${id}"]`);
  if (!element) return;
  if (!workspace) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    return;
  }
  const workspaceRect = workspace.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const deltaX = elementRect.left - workspaceRect.left - (workspaceRect.width / 2 - elementRect.width / 2);
  const deltaY = elementRect.top - workspaceRect.top - (workspaceRect.height / 2 - elementRect.height / 2);
  workspace.scrollBy({ left: verticalOnly ? 0 : deltaX, top: deltaY, behavior: 'smooth' });
}

function updateNodeText(id, text) {
  const node = nodes.find((n) => n.id === id);
  if (!node) return;
  const trimmed = text.trim();
  if (trimmed === node.text) return;
  node.text = trimmed;
  if (node.text.length <= MAX_NODE_TEXT_LENGTH) {
    expandedNodes.delete(node.id);
  }
  updateHelperPanel();
  renderMentionBackoffice();
  renderSynthese();
  recordHistory();
}

function deleteNodeTree(id) {
  const idsToRemove = new Set();
  const targetNode = nodes.find((n) => n.id === id);
  function collect(targetId) {
    idsToRemove.add(targetId);
    nodes.filter((n) => n.parentId === targetId).forEach((child) => collect(child.id));
  }
  collect(id);
  nodes = nodes.filter((n) => !idsToRemove.has(n.id));
  idsToRemove.forEach((removedId) => collapsed.delete(removedId));
  nodes.forEach((node) => {
    if (!node.extraParentIds?.length) return;
    node.extraParentIds = node.extraParentIds.filter((parentId) => !idsToRemove.has(parentId));
  });
  if (!nodes.length) {
    selectedId = null;
  } else {
    const parentId = targetNode?.parentId || null;
    selectedId = nodes.find((n) => n.id === parentId)?.id || nodes[0].id;
  }
  render();
  recordHistory();
  if (selectedId) {
    centerOnNode(selectedId);
  }
}

function toggleBranch(id) {
  if (!hasChildren(id)) return;
  if (collapsed.has(id)) {
    collapsed.delete(id);
  } else {
    collapsed.add(id);
    if (selectedId && !isNodeVisible(selectedId)) {
      selectedId = id;
    }
  }
  render();
  recordHistory();
}

function mapCoordinates(clientX, clientY) {
  const rect = mapWrapper.getBoundingClientRect();
  const x = (clientX - rect.left) / zoom;
  const y = (clientY - rect.top) / zoom;
  return { x, y };
}

function resetLinkingState() {
  linkingFromId = null;
  currentLinkTargetId = null;
  if (linkPreviewPath?.parentNode) {
    linkPreviewPath.parentNode.removeChild(linkPreviewPath);
  }
  linkPreviewPath = null;
  document.querySelectorAll('.node').forEach((node) => node.classList.remove('link-target'));
  document.removeEventListener('mousemove', handleLinkingMove);
  document.removeEventListener('mouseup', handleLinkingEnd);
}

function startLinking(sourceId, event) {
  linkingFromId = sourceId;
  linkPreviewPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  linkPreviewPath.setAttribute('class', 'path preview');
  handleLinkingMove(event);
  document.addEventListener('mousemove', handleLinkingMove);
  document.addEventListener('mouseup', handleLinkingEnd);
}

function handleLinkingMove(event) {
  if (!linkingFromId || !linkPreviewPath) return;
  const fromPos = positions.get(linkingFromId);
  const pointerPos = mapCoordinates(event.clientX, event.clientY);
  const hovered = document.elementFromPoint(event.clientX, event.clientY)?.closest('.node');
  const hoveredId = hovered?.dataset.id;

  if (currentLinkTargetId && currentLinkTargetId !== hoveredId) {
    document.querySelector(`.node[data-id="${currentLinkTargetId}"]`)?.classList.remove('link-target');
    currentLinkTargetId = null;
  }

  const sourceNode = nodes.find((n) => n.id === linkingFromId);
  const hoveredNode = nodes.find((n) => n.id === hoveredId);

  if (hoveredId && hoveredId !== linkingFromId && hoveredNode && sourceNode && hoveredNode.column > sourceNode.column) {
    currentLinkTargetId = hoveredId;
    hovered.classList.add('link-target');
  }

  const toPos = currentLinkTargetId ? positions.get(currentLinkTargetId) : pointerPos;
  if (!fromPos || !toPos) return;
  if (currentLinkTargetId) {
    linkPreviewPath.setAttribute('d', elbowPath(fromPos, toPos));
    linkPreviewPath.setAttribute('marker-end', 'url(#arrowhead)');
  } else {
    const startX = fromPos.x + NODE_WIDTH - 60;
    const startY = fromPos.y + 32;
    linkPreviewPath.setAttribute('d', `M ${startX} ${startY} L ${pointerPos.x} ${pointerPos.y}`);
    linkPreviewPath.removeAttribute('marker-end');
  }
  renderConnections();
}

function shiftBranchColumn(nodeId, delta) {
  const queue = [nodeId];
  while (queue.length) {
    const currentId = queue.shift();
    const node = nodes.find((n) => n.id === currentId);
    if (!node) continue;
    node.column = Math.min(columns.length - 1, Math.max(0, node.column + delta));
    nodes
      .filter((n) => n.parentId === currentId)
      .forEach((child) => {
        queue.push(child.id);
      });
  }
}

function reparentNode(targetId, newParentId) {
  const target = nodes.find((n) => n.id === targetId);
  const parent = nodes.find((n) => n.id === newParentId);
  if (!target || !parent) return;
  let ancestor = parent.parentId;
  while (ancestor) {
    if (ancestor === targetId) return;
    ancestor = nodes.find((n) => n.id === ancestor)?.parentId ?? null;
  }
  const newColumn = Math.min(columns.length - 1, parent.column + 1);
  const delta = newColumn - target.column;
  target.parentId = newParentId;
  target.sortOrder = computeInsertionOrder(newColumn, newParentId, null);
  if (delta !== 0) {
    shiftBranchColumn(targetId, delta);
  } else {
    target.column = newColumn;
  }
  selectedId = targetId;
  render();
  recordHistory();
}

function canLinkNodes(parentId, childId) {
  let ancestor = parentId;
  while (ancestor) {
    if (ancestor === childId) return false;
    ancestor = nodes.find((n) => n.id === ancestor)?.parentId ?? null;
  }
  return true;
}

function linkNodeToParent(childId, parentId) {
  const child = nodes.find((n) => n.id === childId);
  const parent = nodes.find((n) => n.id === parentId);
  if (!child || !parent) return;
  if (!canLinkNodes(parentId, childId)) return;
  if (!child.parentId) {
    reparentNode(childId, parentId);
    return;
  }
  if (child.parentId === parentId || child.extraParentIds?.includes(parentId)) return;
  child.extraParentIds = [...(child.extraParentIds ?? []), parentId];
  render();
  recordHistory();
}

function handleLinkingEnd() {
  if (linkingFromId && currentLinkTargetId) {
    const fromNode = nodes.find((n) => n.id === linkingFromId);
    const toNode = nodes.find((n) => n.id === currentLinkTargetId);
    if (fromNode && toNode && toNode.column > fromNode.column) {
      linkNodeToParent(currentLinkTargetId, linkingFromId);
    }
  }
  resetLinkingState();
}

function renderTagManager() {
  if (!tagListEl) return;
  tagListEl.innerHTML = '';
  tagOptions.forEach((tag) => {
    const item = document.createElement('div');
    item.className = 'tag-item';
    const label = document.createElement('span');
    label.textContent = tag;
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = translations[activeLanguage].ui.remove;
    removeBtn.addEventListener('click', () => {
      tagOptions = tagOptions.filter((t) => t !== tag);
      nodes.forEach((n) => {
        if (columns[n.column]?.key === 'moyen' && n.tag === tag) {
          n.tag = '';
        }
      });
      renderTagManager();
      render();
      recordHistory();
    });
    item.append(label, removeBtn);
    tagListEl.appendChild(item);
  });
}

function renderTierCategoryManager() {
  if (!tierCategoryListEl) return;
  tierCategoryListEl.innerHTML = '';
  tierCategoryOptions.forEach((category) => {
    const item = document.createElement('div');
    item.className = 'tag-item';
    const label = document.createElement('span');
    label.textContent = category;
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = translations[activeLanguage].ui.remove;
    removeBtn.addEventListener('click', () => {
      tierCategoryOptions = tierCategoryOptions.filter((t) => t !== category);
      nodes.forEach((n) => {
        if (columns[n.column]?.key === 'tier' && n.tierCategory === category) {
          n.tierCategory = '';
        }
      });
      renderTierCategoryManager();
      render();
      recordHistory();
    });
    item.append(label, removeBtn);
    tierCategoryListEl.appendChild(item);
  });
}

function renderQuestionConfigManager() {
  if (!questionConfigListEl) return;
  questionConfigListEl.innerHTML = '';
  const config = questionConfigByTemplate[activeTemplateKey] ?? {};
  columns.forEach((column) => {
    const item = document.createElement('div');
    item.className = 'question-config-item';
    const label = document.createElement('label');
    label.textContent = `${translations[activeLanguage].ui.questionsFor} ${column.label}`;
    const textarea = document.createElement('textarea');
    textarea.rows = 4;
    textarea.placeholder = translations[activeLanguage].ui.questionPlaceholder;
    textarea.value = config[column.key] || '';
    textarea.addEventListener('input', () => {
      config[column.key] = textarea.value;
      if (activeQuestionCategoryKey === column.key) {
        renderQuestionPanel();
      }
    });
    item.append(label, textarea);
    questionConfigListEl.appendChild(item);
  });
}

function getQuestionsForCategory(categoryKey) {
  const config = questionConfigByTemplate[activeTemplateKey] ?? {};
  return config[categoryKey] || '';
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatQuestionMarkup(text) {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function buildQuestionList(raw) {
  const container = document.createElement('div');
  let listStack = [];
  let rootList = null;
  const lines = raw.split('\n');

  lines.forEach((line) => {
    if (!line.trim()) return;
    const match = line.match(/^(\s*)([-*+])\s+(.+)$/);
    let level = 0;
    let content = line.trim();

    if (!match) {
      listStack = [];
      rootList = null;
      const paragraph = document.createElement('p');
      paragraph.innerHTML = formatQuestionMarkup(content);
      container.appendChild(paragraph);
      return;
    }

    const indent = match[1].replace(/\t/g, '  ').length;
    level = Math.floor(indent / 2);
    content = match[3].trim();

    if (!rootList) {
      rootList = document.createElement('ul');
      container.appendChild(rootList);
      listStack = [rootList];
    }

    if (level > 0 && !listStack[listStack.length - 1].lastElementChild) {
      level = 0;
    }

    while (level + 1 < listStack.length) {
      listStack.pop();
    }

    while (level + 1 > listStack.length) {
      const parentList = listStack[listStack.length - 1];
      const lastItem = parentList.lastElementChild;
      if (!lastItem) break;
      const nested = document.createElement('ul');
      lastItem.appendChild(nested);
      listStack.push(nested);
    }

    const targetList = listStack[listStack.length - 1];
    const item = document.createElement('li');
    item.innerHTML = formatQuestionMarkup(content);
    targetList.appendChild(item);
  });

  return container;
}

function renderQuestionPanel() {
  if (!questionPanelEl || !questionPanelTitleEl || !questionPanelBodyEl) return;
  if (!activeQuestionCategoryKey) {
    questionPanelEl.hidden = true;
    return;
  }
  const column = columns.find((col) => col.key === activeQuestionCategoryKey);
  questionPanelTitleEl.textContent = column
    ? translations[activeLanguage].ui.questionPanelTitleWithColumn(column.label)
    : translations[activeLanguage].ui.questionPanelTitle;
  questionPanelBodyEl.innerHTML = '';
  const rawQuestions = getQuestionsForCategory(activeQuestionCategoryKey);
  if (!rawQuestions.trim()) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = translations[activeLanguage].ui.questionsEmpty;
    questionPanelBodyEl.appendChild(empty);
  } else {
    questionPanelBodyEl.appendChild(buildQuestionList(rawQuestions));
  }
  questionPanelEl.hidden = false;
}

function updateSyntheseDescription() {
  if (!syntheseDescEl) return;
  const syntheseConfig = mapTemplates[activeTemplateKey]?.synthese;
  if (!syntheseConfig) {
    syntheseDescEl.textContent = translations[activeLanguage].ui.syntheseUnavailable;
    return;
  }
  const connector = syntheseConfig.tierConnector ?? 'de';
  syntheseDescEl.textContent = translations[activeLanguage].synthese.description(connector);
}

function renderMentionBackoffice() {
  if (!mentionListEl) return;
  mentionListEl.innerHTML = '';
  const groups = getMentionGroups();

  if (!groups.size) {
    const empty = document.createElement('div');
    empty.className = 'mention-admin-desc';
    empty.textContent = translations[activeLanguage].ui.mentionEmpty;
    mentionListEl.appendChild(empty);
    return;
  }

  const sortedGroups = Array.from(groups.entries()).sort((a, b) =>
    a[0].localeCompare(b[0], getLocale(), { sensitivity: 'base' })
  );

  sortedGroups.forEach(([mention, nodesWithMention]) => {
    const groupEl = document.createElement('div');
    groupEl.className = 'mention-group';

    const header = document.createElement('div');
    header.className = 'mention-group-header';
    const bubbleLabel =
      nodesWithMention.length > 1
        ? translations[activeLanguage].ui.mentionBubblePlural
        : translations[activeLanguage].ui.mentionBubbleSingular;
    header.innerHTML = `<span>@${mention}</span><span class="count">${nodesWithMention.length} ${bubbleLabel}</span>`;

    const list = document.createElement('div');
    list.className = 'mention-node-list';

    const orderedNodes = [...nodesWithMention].sort((a, b) => {
      const textDiff = (a.text || '').localeCompare(b.text || '', getLocale(), { sensitivity: 'base' });
      if (textDiff !== 0) return textDiff;
      const columnDiff = a.column - b.column;
      if (columnDiff !== 0) return columnDiff;
      return a.id.localeCompare(b.id, getLocale(), { sensitivity: 'base' });
    });

    orderedNodes.forEach((node) => {
      const item = document.createElement('div');
      item.className = 'mention-node';
      const text = document.createElement('div');
      text.textContent = node.text || translations[activeLanguage].ui.untitled;
      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = `${columns[node.column]?.label ?? translations[activeLanguage].ui.unknown} • ${node.id}`;
      item.append(text, meta);
      list.appendChild(item);
    });

    groupEl.append(header, list);
    mentionListEl.appendChild(groupEl);
  });
}

function findAncestorsWithColumn(startNode, targetColumn) {
  const results = [];
  const visited = new Set();
  const queue = [];
  if (startNode?.parentId) queue.push(startNode.parentId);
  (startNode?.extraParentIds ?? []).forEach((id) => {
    if (id) queue.push(id);
  });

  while (queue.length) {
    const currentId = queue.shift();
    if (!currentId || visited.has(currentId)) continue;
    visited.add(currentId);
    const ancestor = nodes.find((n) => n.id === currentId);
    if (!ancestor) continue;
    if (ancestor.column === targetColumn) {
      results.push(ancestor);
    }
    const parentIds = [ancestor.parentId, ...(ancestor.extraParentIds ?? [])].filter(Boolean);
    parentIds.forEach((parentId) => {
      if (!visited.has(parentId)) queue.push(parentId);
    });
  }

  return results;
}

function buildSyntheseEntries() {

  const syntheseConfig = mapTemplates[activeTemplateKey]?.synthese;
  if (!syntheseConfig) {
    return [];
  }
  const tierColumn = columns.findIndex((col) => col.key === syntheseConfig.tierKey);
  const comportementColumn = columns.findIndex((col) => col.key === syntheseConfig.comportementKey);
  const moyenColumn = columns.findIndex((col) => col.key === syntheseConfig.moyenKey);
  const tierConnector = syntheseConfig.tierConnector ?? 'de';
  if (tierColumn === -1 || comportementColumn === -1 || moyenColumn === -1) {
    return [];
  }

  const entries = [];
  const seen = new Set();

  nodes
    .filter((n) => n.column === moyenColumn)
    .forEach((moyen) => {
      const moyenLabel = (moyen.tag || moyen.text || '').trim();
      if (!moyenLabel) return;
      const comportements = findAncestorsWithColumn(moyen, comportementColumn);
      comportements.forEach((comportement) => {
        const tiers = findAncestorsWithColumn(comportement, tierColumn);
        tiers.forEach((tier) => {
          const moyenCategory = moyenLabel || translations[activeLanguage].ui.moyenUncategorized;
          const tierCategory =
            (tier.tierCategory || tier.text || '').trim() || translations[activeLanguage].ui.tierUncategorized;
          const comportementText =
            (comportement.text || '').trim() || translations[activeLanguage].ui.comportementUnfilled;
          const entryKey = `${moyen.id}|${comportement.id}|${tier.id}`;
          if (seen.has(entryKey)) return;
          seen.add(entryKey);
          entries.push({
            id: moyen.id,
            phrase: translations[activeLanguage].synthese.phrase(
              moyenCategory,
              tierConnector,
              tierCategory,
              comportementText
            ),
            meta: {
              moyenCategory,
              tierCategory,
              comportementText,
            },
          });
        });
      });
    });

  return entries.sort((a, b) =>
    a.meta.moyenCategory.localeCompare(b.meta.moyenCategory, getLocale(), { sensitivity: 'base' })
  );
}

function buildChainRows() {
  const totalColumns = columns.length;
  if (!totalColumns) return [];
  const lastColumnIndex = totalColumns - 1;
  const lastColumnNodes = nodes.filter((node) => node.column === lastColumnIndex);
  if (!lastColumnNodes.length) return [];

  const rows = [];
  const seen = new Set();

  function buildChainsFromNode(node, columnIndex) {
    if (columnIndex === 0) {
      return [[node]];
    }
    const previousColumnIndex = columnIndex - 1;
    const ancestors = findAncestorsWithColumn(node, previousColumnIndex);
    if (!ancestors.length) return [];
    const chains = [];
    ancestors.forEach((ancestor) => {
      const parentChains = buildChainsFromNode(ancestor, previousColumnIndex);
      parentChains.forEach((chain) => {
        chains.push([...chain, node]);
      });
    });
    return chains;
  }

  lastColumnNodes.forEach((leafNode) => {
    const chains = buildChainsFromNode(leafNode, lastColumnIndex);
    chains.forEach((chain) => {
      const key = chain.map((node) => node.id).join('|');
      if (seen.has(key)) return;
      seen.add(key);
      rows.push(chain);
    });
  });

  return rows;
}

function getChainExportValue(node, columnKey) {
  if (!node) return '';
  if (columnKey === 'tier') return (node.tierCategory || node.text || '').trim();
  if (columnKey === 'moyen') return (node.tag || node.text || '').trim();
  return (node.text || '').trim();
}

function getChainExportTagValue(node) {
  if (!node) return '';
  return (node.tag || '').trim();
}

function formatCsvValue(value) {
  const normalized = (value ?? '').toString().replace(/\r?\n/g, ' ').trim();
  if (normalized === '') return '';
  const escaped = normalized.replace(/"/g, '""');
  if (/[;"\n,]/.test(escaped)) {
    return `"${escaped}"`;
  }
  return escaped;
}

function buildChainsCsv() {
  const rows = buildChainRows();
  if (!rows.length) return '';
  const delimiter = ';';
  const header = columns.flatMap((column) => [column.label, `${column.label} - Tag`]);
  const csvLines = [
    header.map((value) => formatCsvValue(value)).join(delimiter),
    ...rows.map((chain) =>
      chain
        .flatMap((node, index) => [
          formatCsvValue(getChainExportValue(node, columns[index]?.key)),
          formatCsvValue(getChainExportTagValue(node)),
        ])
        .join(delimiter)
    ),
  ];
  return csvLines.join('\n');
}

function downloadCsvFile(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function updateChainsCsvExportState() {
  if (!exportChainsCsvBtn) return;
  exportChainsCsvBtn.disabled = buildChainRows().length === 0;
}

function showCopyFeedback(button, label = translations[activeLanguage].ui.copyFeedback) {
  if (!button) return;
  const original = button.textContent;
  button.textContent = label;
  button.disabled = true;
  setTimeout(() => {
    button.textContent = original;
    button.disabled = false;
  }, 1200);
}

function copyToClipboard(text, button) {
  if (!text) return;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => showCopyFeedback(button)).catch(() => {});
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  showCopyFeedback(button);
}

function renderSynthese() {
  if (!syntheseListEl) return;
  const syntheseConfig = mapTemplates[activeTemplateKey]?.synthese;
  if (!syntheseConfig) {
    syntheseListEl.innerHTML = '';
    const empty = document.createElement('div');
    empty.className = 'mention-admin-desc';
    empty.textContent = translations[activeLanguage].ui.syntheseUnavailable;
    syntheseListEl.appendChild(empty);
    if (copyAllSyntheseBtn) {
      copyAllSyntheseBtn.disabled = true;
    }
    updateChainsCsvExportState();
    return;
  }
  const entries = buildSyntheseEntries();
  syntheseListEl.innerHTML = '';

  if (copyAllSyntheseBtn) {
    copyAllSyntheseBtn.disabled = entries.length === 0;
  }
  updateChainsCsvExportState();

  if (!entries.length) {
    const empty = document.createElement('div');
    empty.className = 'mention-admin-desc';
    empty.textContent = translations[activeLanguage].ui.syntheseEmptyChains;
    syntheseListEl.appendChild(empty);
    return;
  }

  entries.forEach((entry) => {
    const card = document.createElement('div');
    card.className = 'synthese-card';

    const text = document.createElement('p');
    text.className = 'synthese-text';
    text.textContent = entry.phrase;

    const meta = document.createElement('div');
    meta.className = 'synthese-meta';
    meta.textContent = translations[activeLanguage].synthese.meta(entry.meta.moyenCategory, entry.meta.tierCategory);

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.alignItems = 'center';
    actions.style.gap = '8px';

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'ghost';
    copyBtn.textContent = translations[activeLanguage].ui.copy;
    copyBtn.addEventListener('click', () => copyToClipboard(entry.phrase, copyBtn));

    actions.appendChild(copyBtn);
    card.append(text, meta, actions);
    syntheseListEl.appendChild(card);
  });
}

function addTagFromInput() {
  const value = newTagInput?.value.trim();
  if (!value) return;
  if (!tagOptions.includes(value)) {
    tagOptions.push(value);
    renderTagManager();
    render();
    recordHistory();
  }
  newTagInput.value = '';
}

function addTierCategoryFromInput() {
  const value = newTierCategoryInput?.value.trim();
  if (!value) return;
  if (!tierCategoryOptions.includes(value)) {
    tierCategoryOptions.push(value);
    renderTierCategoryManager();
    render();
    recordHistory();
  }
  newTierCategoryInput.value = '';
}

function fitToScreen() {
  const xs = Array.from(positions.values()).map((p) => p.x);
  const ys = Array.from(positions.values()).map((p) => p.y);
  if (!xs.length || !ys.length) return;
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs) + 220;
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys) + 120;
  const availableW = workspace.clientWidth - 120;
  const availableH = workspace.clientHeight - 160;
  const scaleX = availableW / (maxX - minX);
  const scaleY = availableH / (maxY - minY);
  setZoom(Math.min(1.2, Math.max(0.4, Math.min(scaleX, scaleY))));
  if (selectedId) {
    requestAnimationFrame(() => centerOnNode(selectedId));
  }
}

fitBtn.addEventListener('click', fitToScreen);

loadTemplateState(activeTemplateKey);
renderLegend();
renderTagManager();
renderTierCategoryManager();
renderQuestionConfigManager();
renderQuestionPanel();
updateSyntheseDescription();
render();
recordHistory();
ensureFirstObjectiveVisible();

function getNodeDisplayText(node) {
  const text = node.text || '';
  if (text.length <= MAX_NODE_TEXT_LENGTH) {
    return text;
  }
  if (expandedNodes.has(node.id)) {
    return text;
  }
  return `${text.slice(0, TRUNCATED_NODE_TEXT_LENGTH)}(...)`;
}

function shouldShowExpandToggle(node) {
  return (node.text || '').length > MAX_NODE_TEXT_LENGTH;
}

function toggleNodeExpanded(nodeId) {
  if (expandedNodes.has(nodeId)) {
    expandedNodes.delete(nodeId);
  } else {
    expandedNodes.add(nodeId);
  }
}

function updateExpandButton(button, node) {
  const isExpanded = expandedNodes.has(node.id);
  button.textContent = isExpanded ? '–' : '+';
  button.setAttribute(
    'aria-label',
    isExpanded ? translations[activeLanguage].ui.collapseTextAria : translations[activeLanguage].ui.expandTextAria
  );
  button.title = isExpanded ? translations[activeLanguage].ui.collapseTextAria : translations[activeLanguage].ui.expandTextAria;
}

function ensureFirstObjectiveVisible() {
  if (hasCenteredInitialObjective) return;
  const firstObjective = nodes.find((node) => node.column === 0);
  if (!firstObjective) return;
  hasCenteredInitialObjective = true;
  selectedId = firstObjective.id;
  updateSelection();
  requestAnimationFrame(() => centerOnNode(firstObjective.id));
}
