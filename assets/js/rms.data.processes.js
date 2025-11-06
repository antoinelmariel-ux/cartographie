(function (global) {
    const defaultProcesses = [
        { value: 'R&D', label: 'R&D' },
        { value: 'Achats', label: 'Achats' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Ventes', label: 'Ventes' },
        { value: 'RH', label: 'RH' },
        { value: 'Production', label: 'Production' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Juridique', label: 'Juridique' }
    ];

    const defaultSubProcesses = {
        'R&D': [
            { value: 'Recherche fondamentale', label: 'Recherche fondamentale' },
            { value: 'Développement préclinique', label: 'Développement préclinique' },
            { value: 'Études cliniques', label: 'Études cliniques' },
            { value: 'Affaires réglementaires', label: 'Affaires réglementaires' },
            { value: 'Pharmacovigilance', label: 'Pharmacovigilance' }
        ],
        'Achats': [
            { value: 'Sourcing fournisseurs', label: 'Sourcing fournisseurs' },
            { value: "Appels d'offres", label: "Appels d'offres" },
            { value: 'Négociation/contrats', label: 'Négociation/contrats' },
            { value: 'Gestion des commandes', label: 'Gestion des commandes' },
            { value: 'Réception et contrôles', label: 'Réception et contrôles' }
        ],
        'Marketing': [
            { value: 'Études de marché', label: 'Études de marché' },
            { value: 'Promotion médicale', label: 'Promotion médicale' },
            { value: 'Communication digitale', label: 'Communication digitale' },
            { value: "Organisation d’événements", label: "Organisation d’événements" },
            { value: 'Gestion de la marque', label: 'Gestion de la marque' }
        ],
        'Ventes': [
            { value: 'Prospection commerciale', label: 'Prospection commerciale' },
            { value: "Soumissions d’offres", label: "Soumissions d’offres" },
            { value: 'Négociation/contrats', label: 'Négociation/contrats' },
            { value: 'Distribution', label: 'Distribution' },
            { value: 'Suivi client', label: 'Suivi client' }
        ],
        'RH': [
            { value: 'Recrutement', label: 'Recrutement' },
            { value: 'Gestion des carrières', label: 'Gestion des carrières' },
            { value: 'Formation', label: 'Formation' },
            { value: 'Paie et avantages sociaux', label: 'Paie et avantages sociaux' },
            { value: 'Évaluation des performances', label: 'Évaluation des performances' }
        ],
        'Production': [
            { value: 'Planification', label: 'Planification' },
            { value: 'Approvisionnement en matières premières', label: 'Approvisionnement en matières premières' },
            { value: 'Fabrication', label: 'Fabrication' },
            { value: 'Contrôle qualité', label: 'Contrôle qualité' },
            { value: 'Libération des lots', label: 'Libération des lots' },
            { value: 'Maintenance des équipements', label: 'Maintenance des équipements' }
        ],
        'Finance': [
            { value: 'Comptabilité fournisseurs', label: 'Comptabilité fournisseurs' },
            { value: 'Comptabilité clients', label: 'Comptabilité clients' },
            { value: 'Trésorerie', label: 'Trésorerie' },
            { value: 'Paiements', label: 'Paiements' },
            { value: 'Contrôle de gestion', label: 'Contrôle de gestion' },
            { value: 'Fiscalité', label: 'Fiscalité' }
        ],
        'Juridique': [
            { value: 'Rédaction/gestion des contrats', label: 'Rédaction/gestion des contrats' },
            { value: 'Veille réglementaire', label: 'Veille réglementaire' },
            { value: 'Gestion des litiges', label: 'Gestion des litiges' },
            { value: 'Propriété intellectuelle', label: 'Propriété intellectuelle' },
            { value: 'Conformité & éthique', label: 'Conformité & éthique' }
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
