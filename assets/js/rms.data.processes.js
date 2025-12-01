(function (global) {
    const defaultProcesses = [
        { value: 'Stratégie', label: 'Stratégie' },
        { value: 'Communication', label: 'Communication' },
        { value: "Management Qualité et Risques d'entreprise", label: "Management Qualité et Risques d'entreprise" },
        { value: 'Mesure et Amélioration Qualité', label: 'Mesure et Amélioration Qualité' },
        { value: 'Gestion de la performance', label: 'Gestion de la performance' },
        { value: 'R&D et Réglementaire', label: 'R&D et Réglementaire' },
        { value: 'Production', label: 'Production' },
        { value: 'Commercialisation des produits', label: 'Commercialisation des produits' },
        { value: 'Supply Chain', label: 'Supply Chain' },
        { value: 'Gestion des prestations', label: 'Gestion des prestations' },
        { value: 'Ressources humaines', label: 'Ressources humaines' },
        { value: 'Achats', label: 'Achats' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Systèmes transverses de connaissance et de documentation', label: 'Systèmes transverses de connaissance et de documentation' },
        { value: "Système d’information (SI)", label: "Système d’information (SI)" },
        { value: 'Sites et Equipement', label: 'Sites et Equipement' },
        { value: 'Juridique Compliance Propriété Intellectuelle Assurances', label: 'Juridique Compliance Propriété Intellectuelle Assurances' }
    ];

    const defaultSubProcesses = {
        'Stratégie': [
            { value: 'Stratégie globale et objectifs', label: 'Stratégie globale et objectifs' },
            { value: 'Gestion des projets Produits', label: 'Gestion des projets Produits' },
            { value: 'Gestion des projets Industriels', label: 'Gestion des projets Industriels' }
        ],
        'Communication': [
            { value: 'Communication interne', label: 'Communication interne' },
            { value: 'Communication externe', label: 'Communication externe' }
        ],
        "Management Qualité et Risques d'entreprise": [
            { value: 'Cartographie des risques', label: 'Cartographie des risques' },
            { value: 'Contrôle interne', label: 'Contrôle interne' },
            { value: 'Audit interne', label: 'Audit interne' },
            { value: 'Management du système qualité', label: 'Management du système qualité' },
            { value: 'Quality Risk Management (QRM)', label: 'Quality Risk Management (QRM)' }
        ],
        'Mesure et Amélioration Qualité': [
            { value: 'Déviations', label: 'Déviations' },
            { value: 'Out Of Specifications/Out of Trend', label: 'Out Of Specifications/Out of Trend' },
            { value: 'Actions Correctives et Préventives', label: 'Actions Correctives et Préventives' },
            { value: 'Changements Industriels', label: 'Changements Industriels' },
            { value: 'Audits qualité internes', label: 'Audits qualité internes' },
            { value: 'Revues qualité produits', label: 'Revues qualité produits' }
        ],
        'Gestion de la performance': [
            { value: 'Budget', label: 'Budget' },
            { value: 'Reportings', label: 'Reportings' },
            { value: 'Responsabilité Sociétale d’Entreprise (RSE)', label: 'Responsabilité Sociétale d’Entreprise (RSE)' }
        ],
        'R&D et Réglementaire': [
            { value: 'Recherche', label: 'Recherche' },
            { value: 'Développement', label: 'Développement' },
            { value: 'Etudes cliniques', label: 'Etudes cliniques' },
            { value: 'Industrialisation des procédés', label: 'Industrialisation des procédés' },
            { value: 'Gestion réglementaire', label: 'Gestion réglementaire' }
        ],
        'Production': [
            { value: 'Collecte plasma /lait', label: 'Collecte plasma /lait' },
            { value: 'Réception et acceptation  du plasma /lait', label: 'Réception et acceptation  du plasma /lait' },
            { value: 'Réception et acceptation des matières et articles', label: 'Réception et acceptation des matières et articles' },
            { value: 'Décongélation/préparation du plasma', label: 'Décongélation/préparation du plasma' },
            { value: 'Fractionnement /Bioproduction', label: 'Fractionnement /Bioproduction' },
            { value: 'Mise en forme pharmaceutique', label: 'Mise en forme pharmaceutique' },
            { value: 'Conditionnement secondaire', label: 'Conditionnement secondaire' },
            { value: 'Contrôles matières, produits (sous toutes les formes)', label: 'Contrôles matières, produits (sous toutes les formes)' },
            { value: "Contrôles de l'environnement de production", label: "Contrôles de l'environnement de production" },
            { value: 'Certification et Libération', label: 'Certification et Libération' }
        ],
        'Commercialisation des produits': [
            { value: 'Lancement de produit', label: 'Lancement de produit' },
            { value: 'Gestion des marchés et des clients', label: 'Gestion des marchés et des clients' },
            { value: 'Administration des ventes', label: 'Administration des ventes' },
            { value: 'Information scientifique et médicale', label: 'Information scientifique et médicale' },
            { value: 'Réclamations et litiges', label: 'Réclamations et litiges' },
            { value: 'Vigilances', label: 'Vigilances' },
            { value: 'Alertes et rappels', label: 'Alertes et rappels' },
            { value: 'Arrêt de produit', label: 'Arrêt de produit' },
            { value: 'Ruptures de stocks et tensions d’approvisionnement', label: 'Ruptures de stocks et tensions d’approvisionnement' }
        ],
        'Supply Chain': [
            { value: 'Planification, organisation de la production', label: 'Planification, organisation de la production' },
            { value: 'Approvisionnement plasma', label: 'Approvisionnement plasma' },
            { value: 'Approvisionnement des matières et articles', label: 'Approvisionnement des matières et articles' },
            { value: 'Transport des matières/produits internes', label: 'Transport des matières/produits internes' },
            { value: 'Stockage des matières et productions Sites', label: 'Stockage des matières et productions Sites' },
            { value: 'Stockage et distribution des produits commercialisés', label: 'Stockage et distribution des produits commercialisés' }
        ],
        'Gestion des prestations': [
            { value: 'Travail à façon/Prestation', label: 'Travail à façon/Prestation' },
            { value: 'Transfert de technologie', label: 'Transfert de technologie' }
        ],
        'Ressources humaines': [
            { value: 'Recrutement', label: 'Recrutement' },
            { value: 'Gestion du personnel', label: 'Gestion du personnel' },
            { value: 'Développement et performance', label: 'Développement et performance' },
            { value: 'Rémunérations et avantages', label: 'Rémunérations et avantages' },
            { value: 'Paye', label: 'Paye' },
            { value: 'Relations sociales', label: 'Relations sociales' },
            { value: 'Déplacements et Notes de frais professionnels', label: 'Déplacements et Notes de frais professionnels' },
            { value: 'Santé et sécurité (HSE)', label: 'Santé et sécurité (HSE)' }
        ],
        'Achats': [
            { value: 'Sélection et référencement', label: 'Sélection et référencement' },
            { value: 'Agrément et Suivi pharmaceutique', label: 'Agrément et Suivi pharmaceutique' },
            { value: 'Engagement de dépense et Factures', label: 'Engagement de dépense et Factures' },
            { value: 'Investissement', label: 'Investissement' }
        ],
        'Finance': [
            { value: 'Comptabilité et Fiscalité', label: 'Comptabilité et Fiscalité' },
            { value: 'Contrôle de gestion', label: 'Contrôle de gestion' },
            { value: 'Trésorerie', label: 'Trésorerie' }
        ],
        'Systèmes transverses de connaissance et de documentation': [
            { value: 'Gestion des procédures et dossiers de lot', label: 'Gestion des procédures et dossiers de lot' },
            { value: 'Gestion de la donnée pharmaceutique (DI)', label: 'Gestion de la donnée pharmaceutique (DI)' },
            { value: 'Gestion de la connaissance procédé /produit', label: 'Gestion de la connaissance procédé /produit' },
            { value: 'Archivage', label: 'Archivage' }
        ],
        "Système d’information (SI)": [
            { value: 'Maintenance SI et gestion du changement', label: 'Maintenance SI et gestion du changement' },
            { value: 'Exploitation SI', label: 'Exploitation SI' },
            { value: 'Projets et développements SI', label: 'Projets et développements SI' },
            { value: 'Sécurisation SI', label: 'Sécurisation SI' },
            { value: 'Pilotage de sous-traitance SI', label: 'Pilotage de sous-traitance SI' },
            { value: 'Compliance Validation SI', label: 'Compliance Validation SI' }
        ],
        'Sites et Equipement': [
            { value: 'Qualification/validation', label: 'Qualification/validation' },
            { value: 'Maintenance et renouvellement des équipements de production', label: 'Maintenance et renouvellement des équipements de production' },
            { value: 'Maintenance des locaux techniques et utilités', label: 'Maintenance des locaux techniques et utilités' },
            { value: "Assurance de l'environnement stérile", label: "Assurance de l'environnement stérile" },
            { value: 'Sûreté des sites (HSE)', label: 'Sûreté des sites (HSE)' },
            { value: 'Déchets et environnement (HSE)', label: 'Déchets et environnement (HSE)' },
            { value: 'Services généraux et Immobilier', label: 'Services généraux et Immobilier' }
        ],
        'Juridique Compliance Propriété Intellectuelle Assurances': [
            { value: 'Droit des sociétés', label: 'Droit des sociétés' },
            { value: 'Contrats et contentieux', label: 'Contrats et contentieux' },
            { value: 'Propriété intellectuelle (marques, brevets…)', label: 'Propriété intellectuelle (marques, brevets…)' },
            { value: 'Compliance juridique', label: 'Compliance juridique' },
            { value: 'Assurances', label: 'Assurances' }
        ]
    };

    global.RMS_DEFAULT_PROCESS_CONFIG = Object.freeze({
        processes: Object.freeze(defaultProcesses.map(process => Object.freeze({ ...process }))),
        subProcesses: Object.freeze(Object.keys(defaultSubProcesses).reduce((acc, key) => {
            acc[key] = Object.freeze(defaultSubProcesses[key].map(item => Object.freeze({ ...item })));
            return acc;
        }, {}))
    });
})(typeof window !== 'undefined' ? window : globalThis);
