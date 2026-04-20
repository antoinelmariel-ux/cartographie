(function (global) {
    const defaultProcesses = [
        { value: 'Stratégie', label: 'Strategy', referents: [] },
        { value: 'Communication', label: 'Communication', referents: [] },
        { value: "Management Qualité et Risques d'entreprise", label: "Quality & Enterprise Risk Management", referents: [] },
        { value: 'Mesure et Amélioration Qualité', label: 'Quality Measurement & Improvement', referents: [] },
        { value: 'Gestion de la performance', label: 'Performance Management', referents: [] },
        { value: 'R&D et Réglementaire', label: 'R&D and Regulatory Affairs', referents: [] },
        { value: 'Production', label: 'Production', referents: [] },
        { value: 'Commercialisation des produits', label: 'Product Commercialization', referents: [] },
        { value: 'Supply Chain', label: 'Supply Chain', referents: [] },
        { value: 'Gestion des prestations', label: 'Service Management', referents: [] },
        { value: 'Ressources humaines', label: 'Human Resources', referents: ['Virginie SCANU'] },
        { value: 'Achats', label: 'Procurement', referents: [] },
        { value: 'Finance', label: 'Finance', referents: [] },
        { value: 'Systèmes transverses de connaissance et de documentation', label: 'Cross-functional Knowledge & Documentation Systems', referents: [] },
        { value: "Système d’information (SI)", label: "Information System (IS)", referents: ['Christophe MAHE'] },
        { value: 'Sites et Equipement', label: 'Sites and Equipment', referents: [] },
        { value: 'Juridique Compliance Propriété Intellectuelle Assurances', label: 'Legal, Compliance, IP and Insurance', referents: ['Fabrice DUBOIS'] }
    ];

    const defaultSubProcesses = {
        'Stratégie': [
            {
                value: 'Stratégie globale et objectifs',
                label: 'Overall strategy and objectives',
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
                label: 'Product project management',
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
                label: 'Industrial project management',
                referents: ['Vincent LORET', 'Philippe NOQUERO']
            }
        ],
        'Communication': [
            {
                value: 'Communication interne',
                label: 'Internal communication',
                referents: ['Virginie SCANU']
            },
            {
                value: 'Communication externe',
                label: 'External communication',
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
                label: 'Risk mapping',
                referents: ['Vincent LAGADOU']
            },
            {
                value: 'Contrôle interne',
                label: 'Internal control',
                referents: ['Florence POBEAU', 'Vincent LAGADOU']
            },
            {
                value: 'Audit interne',
                label: 'Internal audit',
                referents: ['Vincent LAGADOU']
            },
            {
                value: 'Management du système qualité',
                label: 'Quality system management',
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
                label: 'Deviations',
                referents: ['Odile LEPORT']
            },
            {
                value: 'Out Of Specifications/Out of Trend',
                label: 'Out Of Specifications/Out of Trend',
                referents: ['Odile LEPORT']
            },
            {
                value: 'Actions Correctives et Préventives',
                label: 'Corrective and Preventive Actions (CAPA)',
                referents: ['Odile LEPORT']
            },
            {
                value: 'Changements Industriels',
                label: 'Industrial changes',
                referents: ['Vincent LORET']
            },
            {
                value: 'Audits qualité internes',
                label: 'Internal quality audits',
                referents: ['Odile LEPORT']
            },
            {
                value: 'Revues qualité produits',
                label: 'Product quality reviews',
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
                label: 'Reporting',
                referents: ['Bruno DE MIRIBEL', 'Karine ARTIGUE']
            },
            {
                value: 'Responsabilité Sociétale d’Entreprise (RSE)',
                label: 'Corporate Social Responsibility (CSR)',
                referents: ['Didier VERON']
            }
        ],
        'R&D et Réglementaire': [
            {
                value: 'Recherche',
                label: 'Research',
                referents: ['Karen PINACHYAN']
            },
            {
                value: 'Développement',
                label: 'Development',
                referents: ['Catherine BURNOUF', 'Karen PINACHYAN', 'Emilien DUBOZ', 'Judith LAREDO']
            },
            {
                value: 'Etudes cliniques',
                label: 'Clinical studies',
                referents: ['Catherine BURNOUF', 'Karen PINACHYAN', 'Emilien DUBOZ', 'Judith LAREDO']
            },
            {
                value: 'Industrialisation des procédés',
                label: 'Process industrialization',
                referents: ['Vincent LORET', 'Karen PINACHYAN']
            },
            {
                value: 'Gestion réglementaire',
                label: 'Regulatory management',
                referents: ['Karen PINACHYAN', 'Céline DOSBAA']
            }
        ],
        'Production': [
            {
                value: 'Collecte plasma /lait',
                label: 'Plasma/milk collection',
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
                label: 'Plasma/milk receipt and acceptance',
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
                label: 'Materials and articles receipt and acceptance',
                referents: ['Vincent LORET', 'Odile LEPORT']
            },
            {
                value: 'Décongélation/préparation du plasma',
                label: 'Plasma thawing/preparation',
                referents: ['Vincent LORET', 'Odile LEPORT']
            },
            {
                value: 'Fractionnement /Bioproduction',
                label: 'Fractionation / Bioproduction',
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
                label: 'Pharmaceutical formulation',
                referents: ['Odile LEPORT', 'Vincent LORET']
            },
            {
                value: 'Conditionnement secondaire',
                label: 'Secondary packaging',
                referents: ['Odile LEPORT', 'Vincent LORET']
            },
            {
                value: 'Contrôles matières, produits (sous toutes les formes)',
                label: 'Materials and products controls (all forms)',
                referents: ['Odile LEPORT', 'Vincent LORET']
            },
            {
                value: "Contrôles de l'environnement de production",
                label: "Production environment controls",
                referents: ['Odile LEPORT', 'Vincent LORET']
            },
            {
                value: 'Certification et Libération',
                label: 'Certification and release',
                referents: ['Odile LEPORT']
            }
        ],
        'Commercialisation des produits': [
            {
                value: 'Lancement de produit',
                label: 'Product launch',
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
                label: 'Market and customer management',
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
                label: 'Sales administration',
                referents: ['Hanna LEPERS', 'Anne Laurence SABATINI', 'Patricia DEMENIER']
            },
            {
                value: 'Information scientifique et médicale',
                label: 'Scientific and medical information',
                referents: ['MSL', 'Savary OM', 'Sophie DANTAN LEWIS']
            },
            {
                value: 'Réclamations et litiges',
                label: 'Claims and disputes',
                referents: ['Patricia DEMENIER', 'Hanna LEPERS']
            },
            {
                value: 'Vigilances',
                label: 'Vigilance',
                referents: ['Karen PINACHYAN', 'Virginie DENCIC']
            },
            {
                value: 'Alertes et rappels',
                label: 'Alerts and recalls',
                referents: ['Odile LEPORT']
            },
            {
                value: 'Arrêt de produit',
                label: 'Product discontinuation',
                referents: ['Odile LEPORT', 'Jacques BROM', 'Hanna LEPERS', 'Anne Laurence SABATINI', 'Bruno DE MIRIBEL']
            },
            {
                value: 'Ruptures de stocks et tensions d’approvisionnement',
                label: 'Stockouts and supply tensions',
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
                label: 'Production planning and organization',
                referents: ['Eric PIMPURNIAUX', 'Vincent LORET']
            },
            {
                value: 'Approvisionnement plasma',
                label: 'Plasma supply',
                referents: ['Jose MORENO TOSCANO', 'Vincent LORET']
            },
            {
                value: 'Approvisionnement des matières et articles',
                label: 'Materials and articles supply',
                referents: ['Christophe KOTECKI', 'Vincent LORET']
            },
            {
                value: 'Transport des matières/produits internes',
                label: 'Internal materials/products transport',
                referents: ['Vincent LORET']
            },
            {
                value: 'Stockage des matières et productions Sites',
                label: 'Storage of materials and site production',
                referents: ['Vincent LORET', 'Cédric DEPRE', 'Régis Roussel [OSICS]', 'Matthieu CAILLOD', 'Herbert GUEDEGBE']
            },
            {
                value: 'Stockage et distribution des produits commercialisés',
                label: 'Storage and distribution of marketed products',
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
                label: 'Contract manufacturing / Services',
                referents: ['Vincent LORET']
            },
            {
                value: 'Transfert de technologie',
                label: 'Technology transfer',
                referents: ['Vincent LORET', 'Marcia BASSIT']
            }
        ],
        'Ressources humaines': [
            {
                value: 'Recrutement',
                label: 'Recruitment',
                referents: ['Virginie SCANU', 'Magali BURCKART']
            },
            {
                value: 'Gestion du personnel',
                label: 'Workforce management',
                referents: ['Virginie SCANU', 'Stéphanie CHARLOPIN']
            },
            {
                value: 'Développement et performance',
                label: 'Development and performance',
                referents: ['Virginie SCANU']
            },
            {
                value: 'Rémunérations et avantages',
                label: 'Compensation and benefits',
                referents: ['Stéphanie CHARLOPIN', 'Virginie SCANU']
            },
            {
                value: 'Paye',
                label: 'Payroll',
                referents: ['Stéphanie CHARLOPIN', 'Virginie SCANU']
            },
            {
                value: 'Relations sociales',
                label: 'Labor relations',
                referents: ['Virginie SCANU']
            },
            {
                value: 'Déplacements et Notes de frais professionnels',
                label: 'Travel and business expenses',
                referents: ['Eric LE FAOU', 'Virginie SCANU']
            },
            {
                value: 'Santé et sécurité (HSE)',
                label: 'Health and safety (HSE)',
                referents: ['Vincent LORET', 'Roxane LEUNG-TACK']
            }
        ],
        'Achats': [
            {
                value: 'Sélection et référencement',
                label: 'Selection and qualification',
                referents: ['Christophe KOTECKI', 'Baptiste JARRASSIER', 'Ronan CESBRON', 'Jean-Yves LAMIRAULT', 'Donna OLIVER']
            },
            {
                value: 'Agrément et Suivi pharmaceutique',
                label: 'Pharmaceutical approval and follow-up',
                referents: ['Odile LEPORT']
            },
            {
                value: 'Engagement de dépense et Factures',
                label: 'Spend commitment and invoices',
                referents: ['Bruno DE MIRIBEL', 'Karine ARTIGUE', 'Nathalie CORSO']
            },
            {
                value: 'Investissement',
                label: 'Investment',
                referents: ['Bruno DE MIRIBEL', 'Vincent LORET', 'Jacques BROM', 'Didier VERON']
            }
        ],
        'Finance': [
            {
                value: 'Comptabilité et Fiscalité',
                label: 'Accounting and taxation',
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
                label: 'Management control',
                referents: ['Bruno DE MIRIBEL', 'Nathalie CORSO']
            },
            {
                value: 'Trésorerie',
                label: 'Treasury',
                referents: ['Martial BROUARD']
            }
        ],
        'Systèmes transverses de connaissance et de documentation': [
            {
                value: 'Gestion des procédures et dossiers de lot',
                label: 'Procedure and batch record management',
                referents: ['Odile LEPORT']
            },
            {
                value: 'Gestion de la donnée pharmaceutique (DI)',
                label: 'Pharmaceutical data management (DI)',
                referents: ['Odile LEPORT']
            },
            {
                value: 'Gestion de la connaissance procédé /produit',
                label: 'Process/product knowledge management',
                referents: ['Odile LEPORT']
            },
            {
                value: 'Archivage',
                label: 'Archiving',
                referents: ['Odile LEPORT']
            }
        ],
        "Système d’information (SI)": [
            {
                value: 'Maintenance SI et gestion du changement',
                label: 'IS maintenance and change management',
                referents: []
            },
            {
                value: 'Exploitation SI',
                label: 'IS operations',
                referents: []
            },
            {
                value: 'Projets et développements SI',
                label: 'IS projects and development',
                referents: []
            },
            {
                value: 'Sécurisation SI',
                label: 'IS security',
                referents: []
            },
            {
                value: 'Pilotage de sous-traitance SI',
                label: 'IS outsourcing management',
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
                label: 'Maintenance and renewal of production equipment',
                referents: ['Vincent LORET', 'Cédric DEPRE', 'Régis Roussel [OSICS]', 'Matthieu CAILLOD', 'Herbert GUEDEGBE']
            },
            {
                value: 'Maintenance des locaux techniques et utilités',
                label: 'Maintenance of technical facilities and utilities',
                referents: ['Vincent LORET', 'Cédric DEPRE', 'Régis Roussel [OSICS]', 'Matthieu CAILLOD', 'Herbert GUEDEGBE']
            },
            {
                value: "Assurance de l'environnement stérile",
                label: "Sterile environment assurance",
                referents: ['Vincent LORET', 'Cédric DEPRE', 'Régis Roussel [OSICS]', 'Matthieu CAILLOD', 'Herbert GUEDEGBE', 'Odile LEPORT']
            },
            {
                value: 'Sûreté des sites (HSE)',
                label: 'Site safety (HSE)',
                referents: ['Vincent LORET', 'Roxane LEUNG-TACK']
            },
            {
                value: 'Déchets et environnement (HSE)',
                label: 'Waste and environment (HSE)',
                referents: ['Vincent LORET', 'Roxane LEUNG-TACK']
            },
            {
                value: 'Services généraux et Immobilier',
                label: 'General services and real estate',
                referents: ['Eric LE FAOU']
            }
        ],
        'Juridique Compliance Propriété Intellectuelle Assurances': [
            {
                value: 'Droit des sociétés',
                label: 'Corporate law',
                referents: ['Nicolas LENFANT']
            },
            {
                value: 'Contrats et contentieux',
                label: 'Contracts and litigation',
                referents: ['Severine BAZILLIER', 'Juliette Woimant', 'Kareen HANTZBERG']
            },
            {
                value: 'Propriété intellectuelle (marques, brevets…)',
                label: 'Intellectual property (trademarks, patents...)',
                referents: ['Laurence LE TEXIER']
            },
            {
                value: 'Compliance juridique',
                label: 'Legal compliance',
                referents: ['Fabrice DUBOIS', 'Rolf UFFINK', 'Joanna FLETCHER', 'Anja VANDENPLAS']
            },
            {
                value: 'Assurances',
                label: 'Insurance',
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
