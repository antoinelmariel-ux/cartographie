(function (global) {
    const defaultProcesses = [
        {
            value: 'R&D',
            label: 'R&D',
            referents: [
                'Dr Isabelle Laurent (France)',
                'Dr Miguel Torres (USA)',
                'Dr Aisha Campbell (Royaume-Uni)'
            ]
        },
        {
            value: 'Achats',
            label: 'Achats',
            referents: [
                'Sonia Keller (France)',
                'Diego Martínez (Mexique)',
                'Laura Chen (USA)'
            ]
        },
        {
            value: 'Marketing',
            label: 'Marketing',
            referents: [
                'Claire Dubois (France)',
                'Emily Foster (Royaume-Uni)',
                'Javier Ortega (Espagne)'
            ]
        },
        {
            value: 'Ventes',
            label: 'Ventes',
            referents: [
                'James Cooper (USA)',
                'Anke Schreiber (Allemagne)',
                'María López (Espagne)'
            ]
        },
        {
            value: 'RH',
            label: 'RH',
            referents: [
                'Hélène Rousseau (France)',
                'Patrick O’Neill (Royaume-Uni)',
                'Sofía Hernández (Mexique)'
            ]
        },
        {
            value: 'Production',
            label: 'Production',
            referents: [
                'Marc Giraud (France)',
                'Sven Richter (Allemagne)',
                'Patricia Nguyen (USA)'
            ]
        },
        {
            value: 'Finance',
            label: 'Finance',
            referents: [
                'Sophie Bernard (France)',
                'Liam Turner (Royaume-Uni)',
                'Carla Jiménez (Espagne)'
            ]
        },
        {
            value: 'Juridique',
            label: 'Juridique',
            referents: [
                'Nathalie Perrot (France)',
                'Alexander Hughes (USA)',
                'Helena Vogt (Allemagne)'
            ]
        }
    ];

    const defaultSubProcesses = {
        'R&D': [
            {
                value: 'Recherche fondamentale',
                label: 'Recherche fondamentale',
                referents: ['Dr Isabelle Laurent (France)', 'Dr Felix Braun (Allemagne)']
            },
            {
                value: 'Développement préclinique',
                label: 'Développement préclinique',
                referents: ['Dr Miguel Torres (USA)', 'Dr Aisha Campbell (Royaume-Uni)']
            },
            {
                value: 'Études cliniques',
                label: 'Études cliniques',
                referents: ['Dr Olivia Bennett (USA)', 'Dr Marta González (Espagne)']
            },
            {
                value: 'Affaires réglementaires',
                label: 'Affaires réglementaires',
                referents: ['Amélie Charvet (France)', 'Robert Fields (USA)']
            },
            {
                value: 'Pharmacovigilance',
                label: 'Pharmacovigilance',
                referents: ['Dr Lina Moretti (Italie)', 'Dr Sophie Klein (Allemagne)']
            }
        ],
        'Achats': [
            {
                value: 'Sourcing fournisseurs',
                label: 'Sourcing fournisseurs',
                referents: ['Diego Martínez (Mexique)', 'Sonia Keller (France)']
            },
            {
                value: "Appels d'offres",
                label: "Appels d'offres",
                referents: ['Laura Chen (USA)', 'Patrick O’Neill (Royaume-Uni)']
            },
            {
                value: 'Négociation/contrats',
                label: 'Négociation/contrats',
                referents: ['Sonia Keller (France)', 'Javier Ortega (Espagne)']
            },
            {
                value: 'Gestion des commandes',
                label: 'Gestion des commandes',
                referents: ['María López (Espagne)', 'Anke Schreiber (Allemagne)']
            },
            {
                value: 'Réception et contrôles',
                label: 'Réception et contrôles',
                referents: ['Marc Giraud (France)', 'Patricia Nguyen (USA)']
            }
        ],
        'Marketing': [
            {
                value: 'Études de marché',
                label: 'Études de marché',
                referents: ['Claire Dubois (France)', 'Carla Jiménez (Espagne)']
            },
            {
                value: 'Promotion médicale',
                label: 'Promotion médicale',
                referents: ['Emily Foster (Royaume-Uni)', 'Dr Marta González (Espagne)']
            },
            {
                value: 'Communication digitale',
                label: 'Communication digitale',
                referents: ['Javier Ortega (Espagne)', 'Olivia Chen (USA)']
            },
            {
                value: "Organisation d’événements",
                label: "Organisation d’événements",
                referents: ['Claire Dubois (France)', 'Sofía Hernández (Mexique)']
            },
            {
                value: 'Gestion de la marque',
                label: 'Gestion de la marque',
                referents: ['Emily Foster (Royaume-Uni)', 'James Cooper (USA)']
            }
        ],
        'Ventes': [
            {
                value: 'Prospection commerciale',
                label: 'Prospection commerciale',
                referents: ['James Cooper (USA)', 'María López (Espagne)']
            },
            {
                value: "Soumissions d’offres",
                label: "Soumissions d’offres",
                referents: ['Anke Schreiber (Allemagne)', 'Laura Chen (USA)']
            },
            {
                value: 'Négociation/contrats',
                label: 'Négociation/contrats',
                referents: ['James Cooper (USA)', 'Alexander Hughes (USA)']
            },
            {
                value: 'Distribution',
                label: 'Distribution',
                referents: ['Patricia Nguyen (USA)', 'Diego Martínez (Mexique)']
            },
            {
                value: 'Suivi client',
                label: 'Suivi client',
                referents: ['María López (Espagne)', 'Carla Jiménez (Espagne)']
            }
        ],
        'RH': [
            {
                value: 'Recrutement',
                label: 'Recrutement',
                referents: ['Hélène Rousseau (France)', 'Sofía Hernández (Mexique)']
            },
            {
                value: 'Gestion des carrières',
                label: 'Gestion des carrières',
                referents: ['Patrick O’Neill (Royaume-Uni)', 'Liam Turner (Royaume-Uni)']
            },
            {
                value: 'Formation',
                label: 'Formation',
                referents: ['Hélène Rousseau (France)', 'Emily Foster (Royaume-Uni)']
            },
            {
                value: 'Paie et avantages sociaux',
                label: 'Paie et avantages sociaux',
                referents: ['Sophie Bernard (France)', 'Carla Jiménez (Espagne)']
            },
            {
                value: 'Évaluation des performances',
                label: 'Évaluation des performances',
                referents: ['Patrick O’Neill (Royaume-Uni)', 'Sven Richter (Allemagne)']
            }
        ],
        'Production': [
            {
                value: 'Planification',
                label: 'Planification',
                referents: ['Marc Giraud (France)', 'Sven Richter (Allemagne)']
            },
            {
                value: 'Approvisionnement en matières premières',
                label: 'Approvisionnement en matières premières',
                referents: ['Diego Martínez (Mexique)', 'Patricia Nguyen (USA)']
            },
            {
                value: 'Fabrication',
                label: 'Fabrication',
                referents: ['Marc Giraud (France)', 'Helena Vogt (Allemagne)']
            },
            {
                value: 'Contrôle qualité',
                label: 'Contrôle qualité',
                referents: ['Sven Richter (Allemagne)', 'Patricia Nguyen (USA)']
            },
            {
                value: 'Libération des lots',
                label: 'Libération des lots',
                referents: ['Marc Giraud (France)', 'Helena Vogt (Allemagne)']
            },
            {
                value: 'Maintenance des équipements',
                label: 'Maintenance des équipements',
                referents: ['Sven Richter (Allemagne)', 'Patricia Nguyen (USA)']
            }
        ],
        'Finance': [
            {
                value: 'Comptabilité fournisseurs',
                label: 'Comptabilité fournisseurs',
                referents: ['Sophie Bernard (France)', 'Liam Turner (Royaume-Uni)']
            },
            {
                value: 'Comptabilité clients',
                label: 'Comptabilité clients',
                referents: ['Carla Jiménez (Espagne)', 'María López (Espagne)']
            },
            {
                value: 'Trésorerie',
                label: 'Trésorerie',
                referents: ['Sophie Bernard (France)', 'James Cooper (USA)']
            },
            {
                value: 'Paiements',
                label: 'Paiements',
                referents: ['Sophie Bernard (France)', 'Liam Turner (Royaume-Uni)']
            },
            {
                value: 'Contrôle de gestion',
                label: 'Contrôle de gestion',
                referents: ['Liam Turner (Royaume-Uni)', 'Carla Jiménez (Espagne)']
            },
            {
                value: 'Fiscalité',
                label: 'Fiscalité',
                referents: ['Sophie Bernard (France)', 'Alexander Hughes (USA)']
            }
        ],
        'Juridique': [
            {
                value: 'Rédaction/gestion des contrats',
                label: 'Rédaction/gestion des contrats',
                referents: ['Nathalie Perrot (France)', 'Alexander Hughes (USA)']
            },
            {
                value: 'Veille réglementaire',
                label: 'Veille réglementaire',
                referents: ['Helena Vogt (Allemagne)', 'Amélie Charvet (France)']
            },
            {
                value: 'Gestion des litiges',
                label: 'Gestion des litiges',
                referents: ['Nathalie Perrot (France)', 'Helena Vogt (Allemagne)']
            },
            {
                value: 'Propriété intellectuelle',
                label: 'Propriété intellectuelle',
                referents: ['Alexander Hughes (USA)', 'Dr Isabelle Laurent (France)']
            },
            {
                value: 'Conformité & éthique',
                label: 'Conformité & éthique',
                referents: ['Nathalie Perrot (France)', 'Helena Vogt (Allemagne)']
            }
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
