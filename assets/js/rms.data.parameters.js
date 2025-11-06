(function (global) {
    const parameterConfig = {
        riskTypes: [
            { value: 'active', label: 'Corruption active' },
            { value: 'passive', label: 'Corruption passive' },
            { value: 'trafic', label: "Trafic d'influence" },
            { value: 'favoritisme', label: 'Favoritisme' },
            { value: 'cadeaux', label: 'Cadeaux/avantages indus' }
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
        ]
    };

    const cloneList = (list) => Object.freeze(list.map(item => Object.freeze({ ...item })));

    global.RMS_DEFAULT_PARAMETER_CONFIG = Object.freeze({
        riskTypes: cloneList(parameterConfig.riskTypes),
        tiers: cloneList(parameterConfig.tiers),
        riskStatuses: cloneList(parameterConfig.riskStatuses),
        actionPlanStatuses: cloneList(parameterConfig.actionPlanStatuses),
        controlTypes: cloneList(parameterConfig.controlTypes),
        controlOrigins: cloneList(parameterConfig.controlOrigins),
        controlFrequencies: cloneList(parameterConfig.controlFrequencies),
        controlModes: cloneList(parameterConfig.controlModes),
        controlEffectiveness: cloneList(parameterConfig.controlEffectiveness),
        controlStatuses: cloneList(parameterConfig.controlStatuses)
    });
})(typeof window !== 'undefined' ? window : globalThis);
