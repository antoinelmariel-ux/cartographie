(function (global) {
    const defaultProcesses = [
        { value: 'Stratégie', label: 'Stratégie', referents: [] },
        { value: 'Communication', label: 'Communication', referents: [] },
        { value: "Management Qualité et Risques d'entreprise", label: "Management Qualité et Risques d'entreprise", referents: [] },
        { value: 'Mesure et Amélioration Qualité', label: 'Mesure et Amélioration Qualité', referents: [] },
        { value: 'Gestion de la performance', label: 'Gestion de la performance', referents: [] },
        { value: 'R&D et Réglementaire', label: 'R&D et Réglementaire', referents: [] },
        { value: 'Production', label: 'Production', referents: [] },
        { value: 'Commercialisation des produits', label: 'Commercialisation des produits', referents: [] },
        { value: 'Supply Chain', label: 'Supply Chain', referents: [] },
        { value: 'Gestion des prestations', label: 'Gestion des prestations', referents: [] },
        { value: 'Ressources humaines', label: 'Ressources humaines', referents: ['Virginie SCANU'] },
        { value: 'Achats', label: 'Achats', referents: [] },
        { value: 'Finance', label: 'Finance', referents: [] },
        { value: 'Systèmes transverses de connaissance et de documentation', label: 'Systèmes transverses de connaissance et de documentation', referents: [] },
        { value: "Système d’information (SI)", label: "Système d’information (SI)", referents: ['Christophe MAHE'] },
        { value: 'Sites et Equipement', label: 'Sites et Equipement', referents: [] },
        { value: 'Juridique Compliance Propriété Intellectuelle Assurances', label: 'Juridique Compliance Propriété Intellectuelle Assurances', referents: ['Fabrice DUBOIS'] }
    ];

    const defaultSubProcesses = {
        'Stratégie': [
            {
                value: 'Stratégie globale et objectifs',
                label: 'Stratégie globale et objectifs',
                referents: [
                    'Jacques BROM',
                    'Fabrice DUBOIS',
                    'Virginie SCANU',
                    'Karen PINACHYAN',
                    'Didier VERON',
                    'Bruno DE MIRIBEL',
                    'Hanna LEPERS',
                    'Anne Laurence SABATINI',
                    'Vincent LORET',
                    'Philippe NOQUERO',
                    'Jose MORENO TOSCANO',
                    'Vincent TEINTENIER'
                ]
            },
            {
                value: 'Gestion des projets Produits',
                label: 'Gestion des projets Produits',
                referents: [
                    'Hanna LEPERS',
                    'Anne Laurence SABATINI',
                    'Karen PINACHYAN',
                    'Didier VERON',
                    'Jacques BROM',
                    'Jose MORENO TOSCANO'
                ]
            },
            {
                value: 'Gestion des projets Industriels',
                label: 'Gestion des projets Industriels',
                referents: ['Vincent LORET', 'Philippe NOQUERO']
            }
        ],
        'Communication': [
            {
                value: 'Communication interne',
                label: 'Communication interne',
                referents: ['Virginie SCANU']
            },
            {
                value: 'Communication externe',
                label: 'Communication externe',
                referents: ['Didier VERON']
            },
            {
                value: 'lobbying-new',
                label: 'Lobbying (NEW)',
                referents: ['Mazen ELZAABI']
            }
        ],
        "Management Qualité et Risques d'entreprise": [
            {
                value: 'Cartographie des risques',
                label: 'Cartographie des risques',
                referents: ['Vincent LAGADOU']
            },
            {
                value: 'Contrôle interne',
                label: 'Contrôle interne',
                referents: ['Florence POBEAU', 'Vincent LAGADOU']
            },
            {
                value: 'Audit interne',
                label: 'Audit interne',
                referents: ['Vincent LAGADOU']
            },
            {
                value: 'Management du système qualité',
                label: 'Management du système qualité',
                referents: ['Odile LEPORT']
            },
            {
                value: 'Quality Risk Management (QRM)',
                label: 'Quality Risk Management (QRM)',
                referents: ['Odile LEPORT']
            }
        ],
        'Mesure et Amélioration Qualité': [
            {
                value: 'Déviations',
                label: 'Déviations',
                referents: ['Odile LEPORT']
            },
            {
                value: 'Out Of Specifications/Out of Trend',
                label: 'Out Of Specifications/Out of Trend',
                referents: ['Odile LEPORT']
            },
            {
                value: 'Actions Correctives et Préventives',
                label: 'Actions Correctives et Préventives',
                referents: ['Odile LEPORT']
            },
            {
                value: 'Changements Industriels',
                label: 'Changements Industriels',
                referents: ['Vincent LORET']
            },
            {
                value: 'Audits qualité internes',
                label: 'Audits qualité internes',
                referents: ['Odile LEPORT']
            },
            {
                value: 'Revues qualité produits',
                label: 'Revues qualité produits',
                referents: ['Odile LEPORT']
            }
        ],
        'Gestion de la performance': [
            {
                value: 'Budget',
                label: 'Budget',
                referents: ['Bruno DE MIRIBEL', 'Nathalie CORSO']
            },
            {
                value: 'Reportings',
                label: 'Reportings',
                referents: ['Bruno DE MIRIBEL', 'Karine ARTIGUE']
            },
            {
                value: 'Responsabilité Sociétale d’Entreprise (RSE)',
                label: 'Responsabilité Sociétale d’Entreprise (RSE)',
                referents: ['Didier VERON']
            }
        ],
        'R&D et Réglementaire': [
            {
                value: 'Recherche',
                label: 'Recherche',
                referents: ['Karen PINACHYAN']
            },
            {
                value: 'Développement',
                label: 'Développement',
                referents: ['Catherine BURNOUF', 'Karen PINACHYAN', 'Emilien DUBOZ', 'Judith LAREDO']
            },
            {
                value: 'Etudes cliniques',
                label: 'Etudes cliniques',
                referents: ['Catherine BURNOUF', 'Karen PINACHYAN', 'Emilien DUBOZ', 'Judith LAREDO']
            },
            {
                value: 'Industrialisation des procédés',
                label: 'Industrialisation des procédés',
                referents: ['Vincent LORET', 'Karen PINACHYAN']
            },
            {
                value: 'Gestion réglementaire',
                label: 'Gestion réglementaire',
                referents: ['Karen PINACHYAN', 'Céline DOSBAA']
            }
        ],
        'Production': [
            {
                value: 'Collecte plasma /lait',
                label: 'Collecte plasma /lait',
                referents: [
                    'Jose MORENO TOSCANO',
                    'Michael STEINBERG',
                    'Benjamin MÉRY',
                    'Ben SAMARRIPAS',
                    'Nate BOULANGER',
                    'Milan ZELENY',
                    'Maximilian HUDL'
                ]
            },
            {
                value: 'Réception et acceptation  du plasma /lait',
                label: 'Réception et acceptation  du plasma /lait',
                referents: [
                    'Jose MORENO TOSCANO',
                    'Benjamin MÉRY',
                    'Ben SAMARRIPAS',
                    'Milan ZELENY',
                    'Maximilian HUDL'
                ]
            },
            {
                value: 'Réception et acceptation des matières et articles',
                label: 'Réception et acceptation des matières et articles',
                referents: ['Vincent LORET', 'Odile LEPORT']
            },
            {
                value: 'Décongélation/préparation du plasma',
                label: 'Décongélation/préparation du plasma',
                referents: ['Vincent LORET', 'Odile LEPORT']
            },
            {
                value: 'Fractionnement /Bioproduction',
                label: 'Fractionnement /Bioproduction',
                referents: [
                    'Vincent LORET',
                    'Odile LEPORT',
                    'Cédric DEPRE',
                    'Régis Roussel [OSICS]',
                    'Matthieu CAILLOD',
                    'Herbert GUEDEGBE',
                    'Eric PIMPURNIAUX'
                ]
            },
            {
                value: 'Mise en forme pharmaceutique',
                label: 'Mise en forme pharmaceutique',
                referents: ['Odile LEPORT', 'Vincent LORET']
            },
            {
                value: 'Conditionnement secondaire',
                label: 'Conditionnement secondaire',
                referents: ['Odile LEPORT', 'Vincent LORET']
            },
            {
                value: 'Contrôles matières, produits (sous toutes les formes)',
                label: 'Contrôles matières, produits (sous toutes les formes)',
                referents: ['Odile LEPORT', 'Vincent LORET']
            },
            {
                value: "Contrôles de l'environnement de production",
                label: "Contrôles de l'environnement de production",
                referents: ['Odile LEPORT', 'Vincent LORET']
            },
            {
                value: 'Certification et Libération',
                label: 'Certification et Libération',
                referents: ['Odile LEPORT']
            }
        ],
        'Commercialisation des produits': [
            {
                value: 'Lancement de produit',
                label: 'Lancement de produit',
                referents: [
                    'Hanna LEPERS',
                    'Anne Laurence SABATINI',
                    'Sophie DANTAN LEWIS',
                    'Agnes FLORENTINO',
                    'Jérémie GRAVELINE',
                    'Javier BARALLOBRE',
                    'Savary OM',
                    'Estella OZINO TELMON',
                    'Jose MORENO TOSCANO',
                    'Romuald GAUDEFROY',
                    'Peter OLIVER',
                    'Paulina ESCOBEDO',
                    'Pilar MARTINEZ',
                    'Marc GAUTHIER-DARNIS',
                    'Anke BALCAEN'
                ]
            },
            {
                value: 'marketing-plasma-new',
                label: 'Marketing Plasma (NEW)',
                referents: ['Benjamin MÉRY', 'Jessica TAEUFER', 'Ben SAMARRIPAS', 'Marketing American Plasma']
            },
            {
                value: 'market-acess-new',
                label: 'Market Acess (NEW)',
                referents: ['Marc GAUTHIER-DARNIS']
            },
            {
                value: 'Gestion des marchés et des clients',
                label: 'Gestion des marchés et des clients',
                referents: [
                    'Hanna LEPERS',
                    'Anne Laurence SABATINI',
                    'Jérémie GRAVELINE',
                    'Javier BARALLOBRE',
                    'Nora BOUMAZA',
                    'Piras THEVENDRAN',
                    'Olfa CHAMMAKHI',
                    'Paulina ESCOBEDO',
                    'Romuald GAUDEFROY',
                    'Peter OLIVER',
                    'Pilar MARTINEZ',
                    'KAM',
                    'Sales Reps',
                    'Jaime CASTILLO'
                ]
            },
            {
                value: 'Administration des ventes',
                label: 'Administration des ventes',
                referents: ['Hanna LEPERS', 'Anne Laurence SABATINI', 'Patricia DEMENIER']
            },
            {
                value: 'Information scientifique et médicale',
                label: 'Information scientifique et médicale',
                referents: ['MSL', 'Savary OM', 'Sophie DANTAN LEWIS']
            },
            {
                value: 'Réclamations et litiges',
                label: 'Réclamations et litiges',
                referents: ['Patricia DEMENIER', 'Hanna LEPERS']
            },
            {
                value: 'Vigilances',
                label: 'Vigilances',
                referents: ['Karen PINACHYAN', 'Virginie DENCIC']
            },
            {
                value: 'Alertes et rappels',
                label: 'Alertes et rappels',
                referents: ['Odile LEPORT']
            },
            {
                value: 'Arrêt de produit',
                label: 'Arrêt de produit',
                referents: ['Odile LEPORT', 'Jacques BROM', 'Hanna LEPERS', 'Anne Laurence SABATINI', 'Bruno DE MIRIBEL']
            },
            {
                value: 'Ruptures de stocks et tensions d’approvisionnement',
                label: 'Ruptures de stocks et tensions d’approvisionnement',
                referents: ['Odile LEPORT', 'Jacques BROM', 'Bruno DE MIRIBEL', 'Eric PIMPURNIAUX', 'Hanna LEPERS', 'Anne Laurence SABATINI']
            },
            {
                value: 'audit-inspection-new',
                label: 'Audit / Inspection (NEW)',
                referents: ['Constance VAN-TICHELEN']
            },
            {
                value: 'business-dev-bioprod-new',
                label: 'Business Dev BioProd (NEW)',
                referents: ['Vincent DEHOUSSE']
            }
        ],
        'Supply Chain': [
            {
                value: 'Planification, organisation de la production',
                label: 'Planification, organisation de la production',
                referents: ['Eric PIMPURNIAUX', 'Vincent LORET']
            },
            {
                value: 'Approvisionnement plasma',
                label: 'Approvisionnement plasma',
                referents: ['Jose MORENO TOSCANO', 'Vincent LORET']
            },
            {
                value: 'Approvisionnement des matières et articles',
                label: 'Approvisionnement des matières et articles',
                referents: ['Christophe KOTECKI', 'Vincent LORET']
            },
            {
                value: 'Transport des matières/produits internes',
                label: 'Transport des matières/produits internes',
                referents: ['Vincent LORET']
            },
            {
                value: 'Stockage des matières et productions Sites',
                label: 'Stockage des matières et productions Sites',
                referents: ['Vincent LORET', 'Cédric DEPRE', 'Régis Roussel [OSICS]', 'Matthieu CAILLOD', 'Herbert GUEDEGBE']
            },
            {
                value: 'Stockage et distribution des produits commercialisés',
                label: 'Stockage et distribution des produits commercialisés',
                referents: [
                    'Hanna LEPERS',
                    'Anne Laurence SABATINI',
                    'Vincent LORET',
                    'Javier BARALLOBRE',
                    'Peter OLIVER',
                    'Pilar MARTINEZ',
                    'Romuald GAUDEFROY',
                    'Paulina ESCOBEDO'
                ]
            }
        ],
        'Gestion des prestations': [
            {
                value: 'Travail à façon/Prestation',
                label: 'Travail à façon/Prestation',
                referents: ['Vincent LORET']
            },
            {
                value: 'Transfert de technologie',
                label: 'Transfert de technologie',
                referents: ['Vincent LORET', 'Marcia BASSIT']
            }
        ],
        'Ressources humaines': [
            {
                value: 'Recrutement',
                label: 'Recrutement',
                referents: ['Virginie SCANU', 'Magali BURCKART']
            },
            {
                value: 'Gestion du personnel',
                label: 'Gestion du personnel',
                referents: ['Virginie SCANU', 'Stéphanie CHARLOPIN']
            },
            {
                value: 'Développement et performance',
                label: 'Développement et performance',
                referents: ['Virginie SCANU']
            },
            {
                value: 'Rémunérations et avantages',
                label: 'Rémunérations et avantages',
                referents: ['Stéphanie CHARLOPIN', 'Virginie SCANU']
            },
            {
                value: 'Paye',
                label: 'Paye',
                referents: ['Stéphanie CHARLOPIN', 'Virginie SCANU']
            },
            {
                value: 'Relations sociales',
                label: 'Relations sociales',
                referents: ['Virginie SCANU']
            },
            {
                value: 'Déplacements et Notes de frais professionnels',
                label: 'Déplacements et Notes de frais professionnels',
                referents: ['Eric LE FAOU', 'Virginie SCANU']
            },
            {
                value: 'Santé et sécurité (HSE)',
                label: 'Santé et sécurité (HSE)',
                referents: ['Vincent LORET', 'Roxane LEUNG-TACK']
            }
        ],
        'Achats': [
            {
                value: 'Sélection et référencement',
                label: 'Sélection et référencement',
                referents: ['Christophe KOTECKI', 'Baptiste JARRASSIER', 'Ronan CESBRON', 'Jean-Yves LAMIRAULT', 'Donna OLIVER']
            },
            {
                value: 'Agrément et Suivi pharmaceutique',
                label: 'Agrément et Suivi pharmaceutique',
                referents: ['Odile LEPORT']
            },
            {
                value: 'Engagement de dépense et Factures',
                label: 'Engagement de dépense et Factures',
                referents: ['Bruno DE MIRIBEL', 'Karine ARTIGUE', 'Nathalie CORSO']
            },
            {
                value: 'Investissement',
                label: 'Investissement',
                referents: ['Bruno DE MIRIBEL', 'Vincent LORET', 'Jacques BROM', 'Didier VERON']
            }
        ],
        'Finance': [
            {
                value: 'Comptabilité et Fiscalité',
                label: 'Comptabilité et Fiscalité',
                referents: [
                    'Bruno DE MIRIBEL',
                    'Karine ARTIGUE',
                    'Nate BOULANGER',
                    'Jose MENDIETA',
                    'Thomasz BIALEK',
                    'Patrick CHUMBINHO',
                    'Elly DUVAL',
                    'Thomas BOHM',
                    'Sandy BOUSSUGE'
                ]
            },
            {
                value: 'Contrôle de gestion',
                label: 'Contrôle de gestion',
                referents: ['Bruno DE MIRIBEL', 'Nathalie CORSO']
            },
            {
                value: 'Trésorerie',
                label: 'Trésorerie',
                referents: ['Martial BROUARD']
            }
        ],
        'Systèmes transverses de connaissance et de documentation': [
            {
                value: 'Gestion des procédures et dossiers de lot',
                label: 'Gestion des procédures et dossiers de lot',
                referents: ['Odile LEPORT']
            },
            {
                value: 'Gestion de la donnée pharmaceutique (DI)',
                label: 'Gestion de la donnée pharmaceutique (DI)',
                referents: ['Odile LEPORT']
            },
            {
                value: 'Gestion de la connaissance procédé /produit',
                label: 'Gestion de la connaissance procédé /produit',
                referents: ['Odile LEPORT']
            },
            {
                value: 'Archivage',
                label: 'Archivage',
                referents: ['Odile LEPORT']
            }
        ],
        "Système d’information (SI)": [
            {
                value: 'Maintenance SI et gestion du changement',
                label: 'Maintenance SI et gestion du changement',
                referents: []
            },
            {
                value: 'Exploitation SI',
                label: 'Exploitation SI',
                referents: []
            },
            {
                value: 'Projets et développements SI',
                label: 'Projets et développements SI',
                referents: []
            },
            {
                value: 'Sécurisation SI',
                label: 'Sécurisation SI',
                referents: []
            },
            {
                value: 'Pilotage de sous-traitance SI',
                label: 'Pilotage de sous-traitance SI',
                referents: []
            },
            {
                value: 'Compliance Validation SI',
                label: 'Compliance Validation SI',
                referents: []
            }
        ],
        'Sites et Equipement': [
            {
                value: 'Qualification/validation',
                label: 'Qualification/validation',
                referents: ['Vincent LORET', 'Cédric DEPRE', 'Régis Roussel [OSICS]', 'Matthieu CAILLOD', 'Herbert GUEDEGBE', 'Odile LEPORT']
            },
            {
                value: 'Maintenance et renouvellement des équipements de production',
                label: 'Maintenance et renouvellement des équipements de production',
                referents: ['Vincent LORET', 'Cédric DEPRE', 'Régis Roussel [OSICS]', 'Matthieu CAILLOD', 'Herbert GUEDEGBE']
            },
            {
                value: 'Maintenance des locaux techniques et utilités',
                label: 'Maintenance des locaux techniques et utilités',
                referents: ['Vincent LORET', 'Cédric DEPRE', 'Régis Roussel [OSICS]', 'Matthieu CAILLOD', 'Herbert GUEDEGBE']
            },
            {
                value: "Assurance de l'environnement stérile",
                label: "Assurance de l'environnement stérile",
                referents: ['Vincent LORET', 'Cédric DEPRE', 'Régis Roussel [OSICS]', 'Matthieu CAILLOD', 'Herbert GUEDEGBE', 'Odile LEPORT']
            },
            {
                value: 'Sûreté des sites (HSE)',
                label: 'Sûreté des sites (HSE)',
                referents: ['Vincent LORET', 'Roxane LEUNG-TACK']
            },
            {
                value: 'Déchets et environnement (HSE)',
                label: 'Déchets et environnement (HSE)',
                referents: ['Vincent LORET', 'Roxane LEUNG-TACK']
            },
            {
                value: 'Services généraux et Immobilier',
                label: 'Services généraux et Immobilier',
                referents: ['Eric LE FAOU']
            }
        ],
        'Juridique Compliance Propriété Intellectuelle Assurances': [
            {
                value: 'Droit des sociétés',
                label: 'Droit des sociétés',
                referents: ['Nicolas LENFANT']
            },
            {
                value: 'Contrats et contentieux',
                label: 'Contrats et contentieux',
                referents: ['Severine BAZILLIER', 'Juliette Woimant', 'Kareen HANTZBERG']
            },
            {
                value: 'Propriété intellectuelle (marques, brevets…)',
                label: 'Propriété intellectuelle (marques, brevets…)',
                referents: ['Laurence LE TEXIER']
            },
            {
                value: 'Compliance juridique',
                label: 'Compliance juridique',
                referents: ['Fabrice DUBOIS', 'Rolf UFFINK', 'Joanna FLETCHER', 'Anja VANDENPLAS']
            },
            {
                value: 'Assurances',
                label: 'Assurances',
                referents: ['Nicolas LENFANT']
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
