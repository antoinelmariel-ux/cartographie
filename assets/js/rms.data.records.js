(function (global) {
    const defaultDataSets = {
        risks: [
            {
                id: 1,
                titre: 'Due diligence intermédiaires plasma Mexique',
                description: 'Risque de commissions indues versées aux intermédiaires pour sécuriser l\'approvisionnement en plasma au Mexique et aux USA.',
                processus: 'Supply Chain',
                sousProcessus: 'Approvisionnement plasma',
                typeCorruption: 'active',
                statut: 'a-valider',
                tiers: ['Fournisseurs', 'Distributeurs'],
                probBrut: 4,
                impactBrut: 4,
                probNet: 2,
                impactNet: 4,
                probPost: 2,
                impactPost: 4,
                mitigationEffectiveness: 'insuffisant',
                aggravatingFactors: {
                    group1: ['Présence d\'intermédiaires à forte exposition'],
                    group2: ['Marchés émergents sensibles']
                },
                aggravatingCoefficient: 1.4,
                controls: [1],
                actionPlans: [1],
                dateCreation: '2024-01-12T09:00:00Z',
                paysExposes: ['Mexique', 'États-Unis', 'France']
            },
            {
                id: 2,
                titre: 'Relations autorités FDA essais phase III',
                description: 'Risque de trafic d\'influence ou de facilitation pour accélérer les autorisations d\'essais cliniques aux États-Unis.',
                processus: 'R&D et Réglementaire',
                sousProcessus: 'Etudes cliniques',
                typeCorruption: 'trafic',
                statut: 'validé',
                tiers: ['AutoriteAgentPublic', 'CRO'],
                probBrut: 3,
                impactBrut: 4,
                probNet: 2,
                impactNet: 3,
                probPost: 2,
                impactPost: 3,
                mitigationEffectiveness: 'ameliorable',
                aggravatingFactors: {
                    group1: ['Interactions avec des agents publics'],
                    group2: ['Pression calendrier FDA']
                },
                aggravatingCoefficient: 1.2,
                controls: [3],
                actionPlans: [3],
                dateCreation: '2024-01-25T14:30:00Z',
                paysExposes: ['États-Unis', 'France', 'Royaume-Uni']
            },
            {
                id: 3,
                titre: 'Hospitalités envers professionnels de santé Espagne',
                description: 'Risque de cadeaux ou avantages non conformes offerts aux professionnels de santé espagnols lors des événements scientifiques.',
                processus: 'Commercialisation des produits',
                sousProcessus: 'Information scientifique et médicale',
                typeCorruption: 'cadeaux',
                statut: 'a-valider',
                tiers: ['PDS', 'SocietesSavantes'],
                probBrut: 3,
                impactBrut: 3,
                probNet: 2,
                impactNet: 2,
                probPost: 2,
                impactPost: 2,
                mitigationEffectiveness: 'ameliorable',
                aggravatingFactors: {
                    group1: ['Culture locale tolérante'],
                    group2: ['Multiplicité d\'événements sponsors']
                },
                aggravatingCoefficient: 1.2,
                controls: [4],
                actionPlans: [2],
                dateCreation: '2024-02-02T10:15:00Z',
                paysExposes: ['Espagne', 'France', 'Royaume-Uni']
            },
            {
                id: 4,
                titre: 'Rôle des distributeurs hospitaliers Allemagne',
                description: 'Risque de rétrocommissions versées par des distributeurs allemands pour influencer les appels d\'offres hospitaliers.',
                processus: 'Commercialisation des produits',
                sousProcessus: 'Administration des ventes',
                typeCorruption: 'passive',
                statut: 'validé',
                tiers: ['Distributeurs', 'ClientsPublics'],
                probBrut: 3,
                impactBrut: 4,
                probNet: 2,
                impactNet: 3,
                probPost: 2,
                impactPost: 3,
                mitigationEffectiveness: 'ameliorable',
                aggravatingFactors: {
                    group1: ['Réseau de distributeurs historiques'],
                    group2: ['Montants élevés des marchés publics']
                },
                aggravatingCoefficient: 1.2,
                controls: [1],
                actionPlans: [3],
                dateCreation: '2024-02-10T08:45:00Z',
                paysExposes: ['Allemagne', 'France']
            },
            {
                id: 5,
                titre: 'Inspection conjointe sites de production France/USA',
                description: 'Risque de favoritisme lors des inspections qualité conjointes France-USA pour accélérer la libération des lots.',
                processus: 'Production',
                sousProcessus: 'Contrôles matières, produits (sous toutes les formes)',
                typeCorruption: 'favoritisme',
                statut: 'a-valider',
                tiers: ['AutoriteAgentPublic', 'PrestatairesAutoriteAdmin'],
                probBrut: 2,
                impactBrut: 4,
                probNet: 2,
                impactNet: 3,
                probPost: 2,
                impactPost: 3,
                mitigationEffectiveness: 'ameliorable',
                aggravatingFactors: {
                    group1: ['Inspection binationale exceptionnelle']
                },
                aggravatingCoefficient: 1.2,
                controls: [5],
                actionPlans: [5],
                dateCreation: '2024-02-18T13:20:00Z',
                paysExposes: ['France', 'États-Unis']
            },
            {
                id: 6,
                titre: 'Gestion des remises hôpitaux US/UK',
                description: 'Risque de conditions financières inéquitables accordées aux hôpitaux américains et britanniques via des remises exceptionnelles.',
                processus: 'Finance',
                sousProcessus: 'Comptabilité et Fiscalité',
                typeCorruption: 'favoritisme',
                statut: 'a-valider',
                tiers: ['ClientsPublics', 'ClientsPrives'],
                probBrut: 3,
                impactBrut: 3,
                probNet: 2,
                impactNet: 2,
                probPost: 2,
                impactPost: 2,
                mitigationEffectiveness: 'insuffisant',
                aggravatingFactors: {
                    group1: ['Multiples circuits de validation'],
                    group2: ['Pression commerciale locale']
                },
                aggravatingCoefficient: 1.2,
                controls: [2],
                actionPlans: [4],
                dateCreation: '2024-02-22T11:05:00Z',
                paysExposes: ['États-Unis', 'Royaume-Uni']
            }
        ],
        controls: [
            {
                id: 1,
                name: 'Due diligence renforcée des intermédiaires plasma',
                type: 'a-priori',
                origin: 'interne',
                owner: 'Sonia Keller',
                frequency: 'annuelle',
                mode: 'manuel',
                effectiveness: 'moyenne',
                status: 'actif',
                description: 'Revue annuelle des distributeurs et courtiers plasma opérant au Mexique, aux États-Unis et en Europe.',
                risks: [1, 4]
            },
            {
                id: 2,
                name: 'Workflow de validation des paiements transfrontaliers',
                type: 'a-priori',
                origin: 'interne',
                owner: 'Sophie Bernard',
                frequency: 'mensuelle',
                mode: 'automatise',
                effectiveness: 'forte',
                status: 'en-mise-en-place',
                description: 'Contrôle automatisé des remises et paiements exceptionnels pour les hôpitaux américains et britanniques.',
                risks: [6]
            },
            {
                id: 3,
                name: 'Comité conformité essais cliniques FDA',
                type: 'a-priori',
                origin: 'interne',
                owner: 'Dr Aisha Campbell',
                frequency: 'mensuelle',
                mode: 'manuel',
                effectiveness: 'moyenne',
                status: 'actif',
                description: 'Revue mensuelle des interactions avec les autorités réglementaires américaines et mexicaines.',
                risks: [2]
            },
            {
                id: 4,
                name: 'Surveillance des avantages offerts aux HCP Espagne',
                type: 'a-posteriori',
                origin: 'interne',
                owner: 'Emily Foster',
                frequency: 'mensuelle',
                mode: 'manuel',
                effectiveness: 'faible',
                status: 'en-revision',
                description: 'Contrôle post-événement des invitations et hospitalités accordées aux professionnels de santé espagnols.',
                risks: [3]
            },
            {
                id: 5,
                name: 'Audit croisé des inspections qualité transatlantiques',
                type: 'a-posteriori',
                origin: 'interne',
                owner: 'Sven Richter',
                frequency: 'ad-hoc',
                mode: 'manuel',
                effectiveness: 'moyenne',
                status: 'actif',
                description: 'Audit conjoint France/USA des inspections qualité et revue des conclusions partagées.',
                risks: [5]
            }
        ],
        actionPlans: [
            {
                id: 1,
                title: 'Former les équipes achats Mexique/USA',
                owner: 'Diego Martínez',
                dueDate: '2024-06-30',
                status: 'en-cours',
                description: 'Déployer une formation anticorruption renforcée auprès des acheteurs plasma et des équipes supply chain nord-américaines.',
                risks: [1]
            },
            {
                id: 2,
                title: 'Mettre à jour la charte interactions HCP Espagne',
                owner: 'Emily Foster',
                dueDate: '2024-05-15',
                status: 'a-demarrer',
                description: 'Actualiser les règles d\'hospitalité et d\'invitation des professionnels de santé espagnols avec validation juridique locale.',
                risks: [3]
            },
            {
                id: 3,
                title: 'Renforcer la revue des distributeurs européens et US',
                owner: 'James Cooper',
                dueDate: '2024-04-20',
                status: 'en-cours',
                description: 'Mettre en place un reporting trimestriel partagé entre l\'Allemagne, le Royaume-Uni et les États-Unis sur les distributeurs clés.',
                risks: [2, 4]
            },
            {
                id: 4,
                title: 'Automatiser les contrôles de remises hospitalières',
                owner: 'Sophie Bernard',
                dueDate: '2024-07-15',
                status: 'brouillon',
                description: 'Spécifier et déployer un module SAP pour tracer les remises exceptionnelles accordées aux hôpitaux USA/UK.',
                risks: [6]
            },
            {
                id: 5,
                title: 'Programme d\'audit qualité transatlantique',
                owner: 'Sven Richter',
                dueDate: '2024-03-31',
                status: 'termine',
                description: 'Constituer une équipe mixte France/USA pour auditer les inspections croisées et formaliser un plan de progrès.',
                risks: [5]
            }
        ],
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
