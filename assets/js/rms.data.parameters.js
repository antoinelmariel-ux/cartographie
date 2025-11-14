(function (global) {
    const parameterConfig = {
        riskTypes: [
            { value: 'active', label: 'Corruption active' },
            { value: 'passive', label: 'Corruption passive' },
            { value: 'trafic', label: "Trafic d'influence" },
            { value: 'favoritisme', label: 'Favoritisme' },
            { value: 'cadeaux', label: 'Cadeaux/avantages indus' }
        ],
        countries: [
            { value: 'France', label: 'France' },
            { value: 'Allemagne', label: 'Allemagne' },
            { value: 'Belgique', label: 'Belgique' },
            { value: 'Espagne', label: 'Espagne' },
            { value: 'Italie', label: 'Italie' },
            { value: 'Mexique', label: 'Mexique' },
            { value: 'République Tchèque', label: 'République Tchèque' },
            { value: 'Royaume-Uni', label: 'Royaume-Uni' },
            { value: 'Turquie', label: 'Turquie' },
            { value: 'USA', label: 'USA' }
        ],
        countryColumns: [
            {
                key: 'collecte-distribution',
                label: 'Collecte & Distribution',
                countries: ['France', 'Belgique']
            },
            {
                key: 'collecte',
                label: 'Collecte',
                countries: ['Allemagne', 'Italie', 'République Tchèque']
            },
            {
                key: 'promotion',
                label: 'Promotion',
                countries: ['Espagne', 'Mexique', 'Turquie']
            },
            {
                key: 'distribution',
                label: 'Distribution',
                countries: ['Royaume-Uni', 'USA']
            }
        ],
        tiers: [
            { value: 'AgentsCommerciaux', label: 'Agents commerciaux' },
            { value: 'AssoCaritatives', label: 'Associations caritatives' },
            { value: 'AssoPatients', label: 'Associations de patients' },
            { value: 'AssoPDS', label: 'Associations de professionnels de santé' },
            { value: 'AssoIndus', label: "Associations représentatives de l'industrie pharmaceutique" },
            { value: 'AuditeursExternes', label: 'Auditeurs externes' },
            { value: 'AutoriteAgentPublic', label: 'Autorités ou agents publics' },
            { value: 'AutresOrgaHabiliteDons', label: 'Autres organismes habilités à percevoir des dons' },
            { value: 'Candidats', label: 'Candidats à un emploi' },
            { value: 'Certificateurs', label: 'Certificateurs' },
            { value: 'Clients', label: 'Clients' },
            { value: 'ClientsPrives', label: 'Clients privés' },
            { value: 'ClientsPublics', label: 'Clients publics' },
            { value: 'CliniquesHPrives', label: 'Cliniques et hôpitaux privés' },
            { value: 'CollaborateursOccasionnelsInterim', label: 'Collaborateurs extérieurs occasionnels / intérimaires' },
            { value: 'ConsultantsExperts', label: 'Consultants experts' },
            { value: 'CRO', label: 'CRO' },
            { value: 'Distributeurs', label: 'Distributeurs' },
            { value: 'Fournisseurs', label: 'Fournisseurs' },
            { value: 'HopitauxPublics', label: 'Hôpitaux publics' },
            { value: 'PartenairesJV', label: 'Partenaires de JV' },
            { value: 'PartiesPrenantes', label: "Parties prenantes de l'environnement des produits du LFB" },
            { value: 'PrestatairesAutoriteAdmin', label: 'Prestataires en contact direct avec une autorité administrative' },
            { value: 'PrestatairesIT', label: 'Prestataires IT' },
            { value: 'PrestatairesIntermediaires', label: 'Prestataires intermédiaires (marketing/médical - ex : CRO)' },
            { value: 'PDS', label: 'Professionnels de santé' },
            { value: 'SocietesSavantes', label: 'Sociétés savantes' },
            { value: 'Universites', label: 'Universités' }
        ],
        riskStatuses: [
            { value: 'brouillon', label: 'Brouillon' },
            { value: 'a-valider', label: 'A valider' },
            { value: 'validé', label: 'Validé' },
            { value: 'archive', label: 'Archivé' }
        ],
        actionPlanStatuses: [
            { value: 'brouillon', label: 'Brouillon' },
            { value: 'a-demarrer', label: 'À démarrer' },
            { value: 'en-cours', label: 'En cours' },
            { value: 'termine', label: 'Terminé' }
        ],
        controlTypes: [
            { value: 'a-priori', label: 'A priori' },
            { value: 'a-posteriori', label: 'A posteriori' }
        ],
        controlOrigins: [
            { value: 'interne', label: 'Interne' },
            { value: 'externe', label: 'Externe' }
        ],
        controlFrequencies: [
            { value: 'quotidienne', label: 'Quotidienne' },
            { value: 'mensuelle', label: 'Mensuelle' },
            { value: 'annuelle', label: 'Annuelle' },
            { value: 'ad-hoc', label: 'Ad hoc' }
        ],
        controlModes: [
            { value: 'manuel', label: 'Manuel' },
            { value: 'automatise', label: 'Automatisé' }
        ],
        controlEffectiveness: [
            { value: 'forte', label: 'Forte' },
            { value: 'moyenne', label: 'Moyenne' },
            { value: 'faible', label: 'Faible' }
        ],
        controlStatuses: [
            { value: 'actif', label: 'Actif' },
            { value: 'en-mise-en-place', label: 'En mise en place' },
            { value: 'en-revision', label: 'En cours de révision' },
            { value: 'obsolete', label: 'Obsolète' }
        ],
        interviewTemplates: [
            {
                value: 'entretien-standard-interne',
                label: "Entretien standard (collaborateurs internes)",
                content: '<p><strong>Participants & contexte</strong></p><ul><li>Référents présents :</li><li>Objectif de l’entretien :</li></ul><p><strong>Points principaux abordés</strong></p><ul><li>Processus décrits :</li><li>Interactions sensibles identifiées :</li></ul><p><strong>Risques corruption évoqués</strong></p><ul><li>Situations à surveiller :</li><li>Exemples récents :</li></ul><p><strong>Actions & besoins</strong></p><ul><li>Mesures envisagées :</li><li>Demandes de support :</li></ul>'
            },
            {
                value: 'due-diligence-fournisseur',
                label: 'Due diligence fournisseur / tiers',
                content: '<p><strong>Profil du tiers</strong></p><ul><li>Activités principales :</li><li>Pays d’opération :</li></ul><p><strong>Processus et opérations concernées</strong></p><ul><li>Flux ou transactions clés :</li><li>Points de contrôle existants :</li></ul><p><strong>Risques corruption identifiés</strong></p><ul><li>Exposition potentielle :</li><li>Signaux faibles détectés :</li></ul><p><strong>Actions de mitigation proposées</strong></p><ul><li>Contrôles complémentaires :</li><li>Suivi / responsables :</li></ul>'
            },
            {
                value: 'suivi-plan-actions',
                label: 'Suivi de plan d’actions anticorruption',
                content: '<p><strong>Avancement général</strong></p><ul><li>Rappels des actions engagées :</li><li>Niveau d’avancement :</li></ul><p><strong>Points de vigilance</strong></p><ul><li>Obstacles rencontrés :</li><li>Impacts sur les délais :</li></ul><p><strong>Décisions & arbitrages</strong></p><ul><li>Mesures correctrices :</li><li>Ressources nécessaires :</li></ul><p><strong>Prochaines étapes</strong></p><ul><li>Responsables assignés :</li><li>Calendrier de suivi :</li></ul>'
            }
        ]
    };

    const cloneList = (list) => Object.freeze(list.map(item => Object.freeze({ ...item })));

    global.RMS_DEFAULT_PARAMETER_CONFIG = Object.freeze({
        riskTypes: cloneList(parameterConfig.riskTypes),
        countries: cloneList(parameterConfig.countries),
        tiers: cloneList(parameterConfig.tiers),
        riskStatuses: cloneList(parameterConfig.riskStatuses),
        actionPlanStatuses: cloneList(parameterConfig.actionPlanStatuses),
        controlTypes: cloneList(parameterConfig.controlTypes),
        controlOrigins: cloneList(parameterConfig.controlOrigins),
        controlFrequencies: cloneList(parameterConfig.controlFrequencies),
        controlModes: cloneList(parameterConfig.controlModes),
        controlEffectiveness: cloneList(parameterConfig.controlEffectiveness),
        controlStatuses: cloneList(parameterConfig.controlStatuses),
        interviewTemplates: cloneList(parameterConfig.interviewTemplates)
    });
})(typeof window !== 'undefined' ? window : globalThis);
