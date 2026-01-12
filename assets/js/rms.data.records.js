(function (global) {
    const defaultDataSets = {
        risks: [],
        controls: [],
        actionPlans: [],
        interviews: [
            {
                id: 1,
                title: 'Due diligence fournisseurs plasma Amérique du Nord',
                referents: ['Sonia Keller (France)', 'Diego Martínez (Mexique)'],
                date: '2024-01-18',
                notes: '<p>Les deux référents confirment la pression forte sur l\'approvisionnement plasma au Mexique.</p><ul><li>Renforcer la cartographie des intermédiaires.</li><li>Aligner les outils de suivi avec les États-Unis.</li></ul>',
                scopes: [
                    {
                        processValue: 'Achats',
                        processLabel: 'Achats',
                        subProcessValue: 'Sourcing fournisseurs',
                        subProcessLabel: 'Sourcing fournisseurs',
                        type: 'subProcess'
                    },
                    {
                        processValue: 'Achats',
                        processLabel: 'Achats',
                        subProcessValue: 'Négociation/contrats',
                        subProcessLabel: 'Négociation/contrats',
                        type: 'subProcess'
                    }
                ],
                createdAt: '2024-01-18T15:40:00Z',
                updatedAt: '2024-01-18T16:10:00Z'
            },
            {
                id: 2,
                title: 'Préparation inspection FDA',
                referents: ['Dr Miguel Torres (USA)', 'Dr Olivia Bennett (USA)'],
                date: '2024-02-05',
                notes: '<p>Focus sur la documentation fournie aux autorités américaines.</p><p>Besoin d\'un registre centralisé des interactions avec la FDA.</p>',
                scopes: [
                    {
                        processValue: 'R&D',
                        processLabel: 'R&D',
                        subProcessValue: 'Études cliniques',
                        subProcessLabel: 'Études cliniques',
                        type: 'subProcess'
                    },
                    {
                        processValue: 'R&D',
                        processLabel: 'R&D',
                        subProcessValue: 'Affaires réglementaires',
                        subProcessLabel: 'Affaires réglementaires',
                        type: 'subProcess'
                    }
                ],
                createdAt: '2024-02-05T17:25:00Z',
                updatedAt: '2024-02-05T17:50:00Z'
            },
            {
                id: 3,
                title: 'Campagnes HCP Espagne',
                referents: ['Emily Foster (Royaume-Uni)', 'Javier Ortega (Espagne)'],
                date: '2024-02-20',
                notes: '<p>Les équipes marketing confirment une hausse des invitations de praticiens espagnols.</p><p>Planifier un contrôle renforcé sur les prestations offertes.</p>',
                scopes: [
                    {
                        processValue: 'Marketing',
                        processLabel: 'Marketing',
                        subProcessValue: 'Promotion médicale',
                        subProcessLabel: 'Promotion médicale',
                        type: 'subProcess'
                    },
                    {
                        processValue: 'Marketing',
                        processLabel: 'Marketing',
                        subProcessValue: "Organisation d’événements",
                        subProcessLabel: "Organisation d’événements",
                        type: 'subProcess'
                    }
                ],
                createdAt: '2024-02-20T09:10:00Z',
                updatedAt: '2024-02-20T09:55:00Z'
            },
            {
                id: 4,
                title: 'Suivi distributeurs Allemagne/USA',
                referents: ['Anke Schreiber (Allemagne)', 'James Cooper (USA)'],
                date: '2024-03-08',
                notes: '<p>Risque identifié sur les conditions commerciales proposées aux distributeurs hospitaliers.</p><p>Prévoir une revue trimestrielle des conventions.</p>',
                scopes: [
                    {
                        processValue: 'Ventes',
                        processLabel: 'Ventes',
                        subProcessValue: 'Distribution',
                        subProcessLabel: 'Distribution',
                        type: 'subProcess'
                    },
                    {
                        processValue: 'Ventes',
                        processLabel: 'Ventes',
                        subProcessValue: "Soumissions d’offres",
                        subProcessLabel: "Soumissions d’offres",
                        type: 'subProcess'
                    }
                ],
                createdAt: '2024-03-08T13:05:00Z',
                updatedAt: '2024-03-08T13:45:00Z'
            },
            {
                id: 5,
                title: 'Contrôle qualité transatlantique',
                referents: ['Sven Richter (Allemagne)', 'Patricia Nguyen (USA)'],
                date: '2024-03-15',
                notes: '<p>Analyse des écarts relevés lors des inspections croisées France/USA.</p><p>Décision de formaliser un plan d\'action global qualité.</p>',
                scopes: [
                    {
                        processValue: 'Production',
                        processLabel: 'Production',
                        subProcessValue: 'Contrôle qualité',
                        subProcessLabel: 'Contrôle qualité',
                        type: 'subProcess'
                    },
                    {
                        processValue: 'Production',
                        processLabel: 'Production',
                        subProcessValue: 'Libération des lots',
                        subProcessLabel: 'Libération des lots',
                        type: 'subProcess'
                    }
                ],
                createdAt: '2024-03-15T10:20:00Z',
                updatedAt: '2024-03-15T10:55:00Z'
            }
        ],
        history: [
            {
                id: 1704875400001,
                date: '2024-01-10T08:30:00Z',
                action: 'Initialisation du référentiel',
                description: 'Import du jeu de données de démonstration pour le laboratoire LFB.',
                user: 'Système'
            },
            {
                id: 1705582800002,
                date: '2024-01-18T16:15:00Z',
                action: 'Compte-rendu Achats validé',
                description: 'Interview fournisseurs Mexique/USA approuvée et partagée avec la conformité.',
                user: 'Diego Martínez'
            },
            {
                id: 1707166800003,
                date: '2024-02-05T18:00:00Z',
                action: 'Mise à jour risques R&D',
                description: 'Actualisation du risque FDA suite au comité conformité essais cliniques.',
                user: 'Dr Aisha Campbell'
            },
            {
                id: 1708520400004,
                date: '2024-02-21T09:30:00Z',
                action: 'Nouveau plan Marketing',
                description: 'Création du plan d\'action pour la charte interactions HCP en Espagne.',
                user: 'Emily Foster'
            },
            {
                id: 1710493200005,
                date: '2024-03-15T11:10:00Z',
                action: 'Audit qualité finalisé',
                description: 'Finalisation du programme d\'audit qualité transatlantique et clôture du plan associé.',
                user: 'Sven Richter'
            }
        ]
    };

    const freezeList = (list) => Array.isArray(list)
        ? Object.freeze(list.map(item => (item && typeof item === 'object')
            ? Object.freeze({ ...item })
            : item))
        : Object.freeze([]);

    global.RMS_DEFAULT_DATA = Object.freeze({
        risks: freezeList(defaultDataSets.risks),
        controls: freezeList(defaultDataSets.controls),
        actionPlans: freezeList(defaultDataSets.actionPlans),
        history: freezeList(defaultDataSets.history),
        interviews: freezeList(defaultDataSets.interviews)
    });
})(typeof window !== 'undefined' ? window : globalThis);
