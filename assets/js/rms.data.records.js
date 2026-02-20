(function (global) {
    const defaultDataSets = {
        "risks": [
                {
                        "id": 1,
                        "titre": "Risque 01 - Sourcing matières plasmatiques",
                        "processus": "Achats",
                        "sousProcessus": "Sourcing matières plasmatiques",
                        "typeCorruption": "active",
                        "description": "Paiement de facilitation sollicité par un intermédiaire pour accélérer l'obtention d'autorisations d'import.",
                        "scenario": "Scénario plausible dans un contexte de forte pression business et multiplicité d'intermédiaires.",
                        "paysExposes": [
                                "France",
                                "USA"
                        ],
                        "probBrut": 2,
                        "impactBrut": 3,
                        "mitigationEffectiveness": "partiel",
                        "statut": "a-valider",
                        "owner": "Directeur Achats",
                        "tiers": "AutoriteAgentPublic",
                        "controls": [
                                1
                        ],
                        "actionPlans": [
                                1
                        ],
                        "aggravatingFactors": {
                                "group1": [
                                        "pression-commerciale"
                                ],
                                "group2": []
                        },
                        "createdAt": "2025-11-02T09:00:00Z",
                        "updatedAt": "2026-01-02T10:30:00Z"
                },
                {
                        "id": 2,
                        "titre": "Risque 02 - Qualification fournisseurs critiques",
                        "processus": "Achats",
                        "sousProcessus": "Qualification fournisseurs critiques",
                        "typeCorruption": "passive",
                        "description": "Conflit d'intérêts non déclaré lors de la sélection d'un fournisseur stratégique.",
                        "scenario": "Scénario plausible dans un contexte de forte pression business et multiplicité d'intermédiaires.",
                        "paysExposes": [
                                "Allemagne",
                                "France"
                        ],
                        "probBrut": 3,
                        "impactBrut": 2,
                        "mitigationEffectiveness": "maîtrisé",
                        "statut": "validé",
                        "owner": "Responsable Affaires Médicales",
                        "tiers": "PDS",
                        "controls": [
                                2,
                                3
                        ],
                        "actionPlans": [
                                2
                        ],
                        "aggravatingFactors": {
                                "group1": [
                                        "intermediaire-haut-risque"
                                ],
                                "group2": []
                        },
                        "createdAt": "2025-11-03T09:00:00Z",
                        "updatedAt": "2026-01-03T10:30:00Z"
                },
                {
                        "id": 3,
                        "titre": "Risque 03 - Appels d'offres hôpitaux publics",
                        "processus": "Ventes & Accès marché",
                        "sousProcessus": "Appels d'offres hôpitaux publics",
                        "typeCorruption": "trafic",
                        "description": "Octroi d'avantages indus à un agent hospitalier pour influencer une attribution de marché.",
                        "scenario": "Scénario plausible dans un contexte de forte pression business et multiplicité d'intermédiaires.",
                        "paysExposes": [
                                "France",
                                "Belgique"
                        ],
                        "probBrut": 4,
                        "impactBrut": 5,
                        "mitigationEffectiveness": "insuffisant",
                        "statut": "validé",
                        "owner": "Directeur Supply Chain",
                        "tiers": "Distributeurs",
                        "controls": [
                                3
                        ],
                        "actionPlans": [
                                3,
                                4
                        ],
                        "aggravatingFactors": {
                                "group1": [
                                        "pression-commerciale"
                                ],
                                "group2": [
                                        "pays-a-risque-eleve"
                                ]
                        },
                        "createdAt": "2025-11-04T09:00:00Z",
                        "updatedAt": "2026-01-04T10:30:00Z"
                },
                {
                        "id": 4,
                        "titre": "Risque 04 - Remises commerciales distributeurs",
                        "processus": "Ventes & Accès marché",
                        "sousProcessus": "Remises commerciales distributeurs",
                        "typeCorruption": "favoritisme",
                        "description": "Rabais hors politique commerciale utilisé pour créer une caisse noire locale.",
                        "scenario": "Scénario plausible dans un contexte de forte pression business et multiplicité d'intermédiaires.",
                        "paysExposes": [
                                "Espagne",
                                "Italie"
                        ],
                        "probBrut": 1,
                        "impactBrut": 4,
                        "mitigationEffectiveness": "partiel",
                        "statut": "a-valider",
                        "owner": "Compliance Officer",
                        "tiers": "Fournisseurs",
                        "controls": [
                                4,
                                5
                        ],
                        "actionPlans": [
                                4
                        ],
                        "aggravatingFactors": {
                                "group1": [
                                        "intermediaire-haut-risque"
                                ],
                                "group2": []
                        },
                        "createdAt": "2025-11-05T09:00:00Z",
                        "updatedAt": "2026-01-05T10:30:00Z"
                },
                {
                        "id": 5,
                        "titre": "Risque 05 - Contrats de conseil avec KOL",
                        "processus": "Affaires médicales",
                        "sousProcessus": "Contrats de conseil avec KOL",
                        "typeCorruption": "cadeaux",
                        "description": "Rémunération de conseil disproportionnée versée à un professionnel de santé influent.",
                        "scenario": "Scénario plausible dans un contexte de forte pression business et multiplicité d'intermédiaires.",
                        "paysExposes": [
                                "France",
                                "Royaume-Uni"
                        ],
                        "probBrut": 2,
                        "impactBrut": 3,
                        "mitigationEffectiveness": "maîtrisé",
                        "statut": "validé",
                        "owner": "Directeur Achats",
                        "tiers": "AutoriteAgentPublic",
                        "controls": [
                                5
                        ],
                        "actionPlans": [
                                5
                        ],
                        "aggravatingFactors": {
                                "group1": [
                                        "pression-commerciale"
                                ],
                                "group2": []
                        },
                        "createdAt": "2025-11-06T09:00:00Z",
                        "updatedAt": "2026-01-06T10:30:00Z"
                },
                {
                        "id": 6,
                        "titre": "Risque 06 - Hospitalité congrès scientifiques",
                        "processus": "Affaires médicales",
                        "sousProcessus": "Hospitalité congrès scientifiques",
                        "typeCorruption": "active",
                        "description": "Paiement de facilitation sollicité par un intermédiaire pour accélérer l'obtention d'autorisations d'import.",
                        "scenario": "Scénario plausible dans un contexte de forte pression business et multiplicité d'intermédiaires.",
                        "paysExposes": [
                                "Belgique",
                                "République Tchèque"
                        ],
                        "probBrut": 3,
                        "impactBrut": 2,
                        "mitigationEffectiveness": "insuffisant",
                        "statut": "a-valider",
                        "owner": "Responsable Affaires Médicales",
                        "tiers": "PDS",
                        "controls": [
                                6,
                                7
                        ],
                        "actionPlans": [
                                1,
                                2
                        ],
                        "aggravatingFactors": {
                                "group1": [
                                        "intermediaire-haut-risque"
                                ],
                                "group2": [
                                        "pays-a-risque-eleve"
                                ]
                        },
                        "createdAt": "2025-11-07T09:00:00Z",
                        "updatedAt": "2026-01-07T10:30:00Z"
                },
                {
                        "id": 7,
                        "titre": "Risque 07 - Sélection des centres investigateurs",
                        "processus": "R&D Clinique",
                        "sousProcessus": "Sélection des centres investigateurs",
                        "typeCorruption": "passive",
                        "description": "Conflit d'intérêts non déclaré lors de la sélection d'un fournisseur stratégique.",
                        "scenario": "Scénario plausible dans un contexte de forte pression business et multiplicité d'intermédiaires.",
                        "paysExposes": [
                                "USA",
                                "Royaume-Uni"
                        ],
                        "probBrut": 4,
                        "impactBrut": 5,
                        "mitigationEffectiveness": "partiel",
                        "statut": "validé",
                        "owner": "Directeur Supply Chain",
                        "tiers": "Distributeurs",
                        "controls": [
                                7
                        ],
                        "actionPlans": [
                                2
                        ],
                        "aggravatingFactors": {
                                "group1": [
                                        "pression-commerciale"
                                ],
                                "group2": []
                        },
                        "createdAt": "2025-11-08T09:00:00Z",
                        "updatedAt": "2026-01-08T10:30:00Z"
                },
                {
                        "id": 8,
                        "titre": "Risque 08 - Gestion CRO internationales",
                        "processus": "R&D Clinique",
                        "sousProcessus": "Gestion CRO internationales",
                        "typeCorruption": "trafic",
                        "description": "Octroi d'avantages indus à un agent hospitalier pour influencer une attribution de marché.",
                        "scenario": "Scénario plausible dans un contexte de forte pression business et multiplicité d'intermédiaires.",
                        "paysExposes": [
                                "Mexique",
                                "USA"
                        ],
                        "probBrut": 1,
                        "impactBrut": 4,
                        "mitigationEffectiveness": "maîtrisé",
                        "statut": "validé",
                        "owner": "Compliance Officer",
                        "tiers": "Fournisseurs",
                        "controls": [
                                8,
                                9
                        ],
                        "actionPlans": [
                                3
                        ],
                        "aggravatingFactors": {
                                "group1": [
                                        "intermediaire-haut-risque"
                                ],
                                "group2": []
                        },
                        "createdAt": "2025-11-09T09:00:00Z",
                        "updatedAt": "2026-01-09T10:30:00Z"
                },
                {
                        "id": 9,
                        "titre": "Risque 09 - Dédouanement lots biologiques",
                        "processus": "Supply Chain",
                        "sousProcessus": "Dédouanement lots biologiques",
                        "typeCorruption": "favoritisme",
                        "description": "Rabais hors politique commerciale utilisé pour créer une caisse noire locale.",
                        "scenario": "Scénario plausible dans un contexte de forte pression business et multiplicité d'intermédiaires.",
                        "paysExposes": [
                                "Turquie",
                                "Italie"
                        ],
                        "probBrut": 2,
                        "impactBrut": 3,
                        "mitigationEffectiveness": "insuffisant",
                        "statut": "a-valider",
                        "owner": "Directeur Achats",
                        "tiers": "AutoriteAgentPublic",
                        "controls": [
                                9
                        ],
                        "actionPlans": [
                                4,
                                5
                        ],
                        "aggravatingFactors": {
                                "group1": [
                                        "pression-commerciale"
                                ],
                                "group2": [
                                        "pays-a-risque-eleve"
                                ]
                        },
                        "createdAt": "2025-11-10T09:00:00Z",
                        "updatedAt": "2026-01-10T10:30:00Z"
                },
                {
                        "id": 10,
                        "titre": "Risque 10 - Transport sous chaîne du froid",
                        "processus": "Supply Chain",
                        "sousProcessus": "Transport sous chaîne du froid",
                        "typeCorruption": "cadeaux",
                        "description": "Rémunération de conseil disproportionnée versée à un professionnel de santé influent.",
                        "scenario": "Scénario plausible dans un contexte de forte pression business et multiplicité d'intermédiaires.",
                        "paysExposes": [
                                "France",
                                "Espagne"
                        ],
                        "probBrut": 3,
                        "impactBrut": 2,
                        "mitigationEffectiveness": "partiel",
                        "statut": "validé",
                        "owner": "Responsable Affaires Médicales",
                        "tiers": "PDS",
                        "controls": [
                                10,
                                1
                        ],
                        "actionPlans": [
                                5
                        ],
                        "aggravatingFactors": {
                                "group1": [
                                        "intermediaire-haut-risque"
                                ],
                                "group2": []
                        },
                        "createdAt": "2025-11-11T09:00:00Z",
                        "updatedAt": "2026-01-11T10:30:00Z"
                },
                {
                        "id": 11,
                        "titre": "Risque 11 - Paiements exceptionnels",
                        "processus": "Finance",
                        "sousProcessus": "Paiements exceptionnels",
                        "typeCorruption": "active",
                        "description": "Paiement de facilitation sollicité par un intermédiaire pour accélérer l'obtention d'autorisations d'import.",
                        "scenario": "Scénario plausible dans un contexte de forte pression business et multiplicité d'intermédiaires.",
                        "paysExposes": [
                                "France"
                        ],
                        "probBrut": 4,
                        "impactBrut": 5,
                        "mitigationEffectiveness": "maîtrisé",
                        "statut": "a-valider",
                        "owner": "Directeur Supply Chain",
                        "tiers": "Distributeurs",
                        "controls": [
                                1
                        ],
                        "actionPlans": [
                                1
                        ],
                        "aggravatingFactors": {
                                "group1": [
                                        "pression-commerciale"
                                ],
                                "group2": []
                        },
                        "createdAt": "2025-11-12T09:00:00Z",
                        "updatedAt": "2026-01-12T10:30:00Z"
                },
                {
                        "id": 12,
                        "titre": "Risque 12 - Notes de frais management",
                        "processus": "Finance",
                        "sousProcessus": "Notes de frais management",
                        "typeCorruption": "passive",
                        "description": "Conflit d'intérêts non déclaré lors de la sélection d'un fournisseur stratégique.",
                        "scenario": "Scénario plausible dans un contexte de forte pression business et multiplicité d'intermédiaires.",
                        "paysExposes": [
                                "France",
                                "Allemagne"
                        ],
                        "probBrut": 1,
                        "impactBrut": 4,
                        "mitigationEffectiveness": "insuffisant",
                        "statut": "validé",
                        "owner": "Compliance Officer",
                        "tiers": "Fournisseurs",
                        "controls": [
                                2,
                                3
                        ],
                        "actionPlans": [
                                2,
                                3
                        ],
                        "aggravatingFactors": {
                                "group1": [
                                        "intermediaire-haut-risque"
                                ],
                                "group2": [
                                        "pays-a-risque-eleve"
                                ]
                        },
                        "createdAt": "2025-11-13T09:00:00Z",
                        "updatedAt": "2026-01-13T10:30:00Z"
                },
                {
                        "id": 13,
                        "titre": "Risque 13 - Prestataires cybersécurité",
                        "processus": "IT & Digital",
                        "sousProcessus": "Prestataires cybersécurité",
                        "typeCorruption": "trafic",
                        "description": "Octroi d'avantages indus à un agent hospitalier pour influencer une attribution de marché.",
                        "scenario": "Scénario plausible dans un contexte de forte pression business et multiplicité d'intermédiaires.",
                        "paysExposes": [
                                "USA",
                                "France"
                        ],
                        "probBrut": 2,
                        "impactBrut": 3,
                        "mitigationEffectiveness": "partiel",
                        "statut": "validé",
                        "owner": "Directeur Achats",
                        "tiers": "AutoriteAgentPublic",
                        "controls": [
                                3
                        ],
                        "actionPlans": [
                                3
                        ],
                        "aggravatingFactors": {
                                "group1": [
                                        "pression-commerciale"
                                ],
                                "group2": []
                        },
                        "createdAt": "2025-11-14T09:00:00Z",
                        "updatedAt": "2026-01-14T10:30:00Z"
                },
                {
                        "id": 14,
                        "titre": "Risque 14 - Attribution licences logicielles",
                        "processus": "IT & Digital",
                        "sousProcessus": "Attribution licences logicielles",
                        "typeCorruption": "favoritisme",
                        "description": "Rabais hors politique commerciale utilisé pour créer une caisse noire locale.",
                        "scenario": "Scénario plausible dans un contexte de forte pression business et multiplicité d'intermédiaires.",
                        "paysExposes": [
                                "République Tchèque",
                                "France"
                        ],
                        "probBrut": 3,
                        "impactBrut": 2,
                        "mitigationEffectiveness": "maîtrisé",
                        "statut": "a-valider",
                        "owner": "Responsable Affaires Médicales",
                        "tiers": "PDS",
                        "controls": [
                                4,
                                5
                        ],
                        "actionPlans": [
                                4
                        ],
                        "aggravatingFactors": {
                                "group1": [
                                        "intermediaire-haut-risque"
                                ],
                                "group2": []
                        },
                        "createdAt": "2025-11-15T09:00:00Z",
                        "updatedAt": "2026-01-15T10:30:00Z"
                },
                {
                        "id": 15,
                        "titre": "Risque 15 - Recrutement profils clés",
                        "processus": "RH",
                        "sousProcessus": "Recrutement profils clés",
                        "typeCorruption": "cadeaux",
                        "description": "Rémunération de conseil disproportionnée versée à un professionnel de santé influent.",
                        "scenario": "Scénario plausible dans un contexte de forte pression business et multiplicité d'intermédiaires.",
                        "paysExposes": [
                                "France",
                                "Belgique"
                        ],
                        "probBrut": 4,
                        "impactBrut": 5,
                        "mitigationEffectiveness": "insuffisant",
                        "statut": "validé",
                        "owner": "Directeur Supply Chain",
                        "tiers": "Distributeurs",
                        "controls": [
                                5
                        ],
                        "actionPlans": [
                                5,
                                1
                        ],
                        "aggravatingFactors": {
                                "group1": [
                                        "pression-commerciale"
                                ],
                                "group2": [
                                        "pays-a-risque-eleve"
                                ]
                        },
                        "createdAt": "2025-11-16T09:00:00Z",
                        "updatedAt": "2026-01-16T10:30:00Z"
                },
                {
                        "id": 16,
                        "titre": "Risque 16 - Mobilité internationale",
                        "processus": "RH",
                        "sousProcessus": "Mobilité internationale",
                        "typeCorruption": "active",
                        "description": "Paiement de facilitation sollicité par un intermédiaire pour accélérer l'obtention d'autorisations d'import.",
                        "scenario": "Scénario plausible dans un contexte de forte pression business et multiplicité d'intermédiaires.",
                        "paysExposes": [
                                "Turquie",
                                "Allemagne"
                        ],
                        "probBrut": 1,
                        "impactBrut": 4,
                        "mitigationEffectiveness": "partiel",
                        "statut": "a-valider",
                        "owner": "Compliance Officer",
                        "tiers": "Fournisseurs",
                        "controls": [
                                6,
                                7
                        ],
                        "actionPlans": [
                                1
                        ],
                        "aggravatingFactors": {
                                "group1": [
                                        "intermediaire-haut-risque"
                                ],
                                "group2": []
                        },
                        "createdAt": "2025-11-17T09:00:00Z",
                        "updatedAt": "2026-01-17T10:30:00Z"
                },
                {
                        "id": 17,
                        "titre": "Risque 17 - Inspections GMP",
                        "processus": "Qualité",
                        "sousProcessus": "Inspections GMP",
                        "typeCorruption": "passive",
                        "description": "Conflit d'intérêts non déclaré lors de la sélection d'un fournisseur stratégique.",
                        "scenario": "Scénario plausible dans un contexte de forte pression business et multiplicité d'intermédiaires.",
                        "paysExposes": [
                                "Italie",
                                "France"
                        ],
                        "probBrut": 2,
                        "impactBrut": 3,
                        "mitigationEffectiveness": "maîtrisé",
                        "statut": "validé",
                        "owner": "Directeur Achats",
                        "tiers": "AutoriteAgentPublic",
                        "controls": [
                                7
                        ],
                        "actionPlans": [
                                2
                        ],
                        "aggravatingFactors": {
                                "group1": [
                                        "pression-commerciale"
                                ],
                                "group2": []
                        },
                        "createdAt": "2025-11-18T09:00:00Z",
                        "updatedAt": "2026-01-18T10:30:00Z"
                },
                {
                        "id": 18,
                        "titre": "Risque 18 - Due diligence tiers",
                        "processus": "Juridique & Compliance",
                        "sousProcessus": "Due diligence tiers",
                        "typeCorruption": "trafic",
                        "description": "Octroi d'avantages indus à un agent hospitalier pour influencer une attribution de marché.",
                        "scenario": "Scénario plausible dans un contexte de forte pression business et multiplicité d'intermédiaires.",
                        "paysExposes": [
                                "France",
                                "USA"
                        ],
                        "probBrut": 3,
                        "impactBrut": 2,
                        "mitigationEffectiveness": "insuffisant",
                        "statut": "validé",
                        "owner": "Responsable Affaires Médicales",
                        "tiers": "PDS",
                        "controls": [
                                8,
                                9
                        ],
                        "actionPlans": [
                                3,
                                4
                        ],
                        "aggravatingFactors": {
                                "group1": [
                                        "intermediaire-haut-risque"
                                ],
                                "group2": [
                                        "pays-a-risque-eleve"
                                ]
                        },
                        "createdAt": "2025-11-19T09:00:00Z",
                        "updatedAt": "2026-01-19T10:30:00Z"
                },
                {
                        "id": 19,
                        "titre": "Risque 19 - Subventions associations patients",
                        "processus": "Market Access",
                        "sousProcessus": "Subventions associations patients",
                        "typeCorruption": "favoritisme",
                        "description": "Rabais hors politique commerciale utilisé pour créer une caisse noire locale.",
                        "scenario": "Scénario plausible dans un contexte de forte pression business et multiplicité d'intermédiaires.",
                        "paysExposes": [
                                "Espagne",
                                "Belgique"
                        ],
                        "probBrut": 4,
                        "impactBrut": 5,
                        "mitigationEffectiveness": "partiel",
                        "statut": "a-valider",
                        "owner": "Directeur Supply Chain",
                        "tiers": "Distributeurs",
                        "controls": [
                                9
                        ],
                        "actionPlans": [
                                4
                        ],
                        "aggravatingFactors": {
                                "group1": [
                                        "pression-commerciale"
                                ],
                                "group2": []
                        },
                        "createdAt": "2025-11-20T09:00:00Z",
                        "updatedAt": "2026-01-20T10:30:00Z"
                },
                {
                        "id": 20,
                        "titre": "Risque 20 - Permis environnementaux",
                        "processus": "Direction industrielle",
                        "sousProcessus": "Permis environnementaux",
                        "typeCorruption": "cadeaux",
                        "description": "Rémunération de conseil disproportionnée versée à un professionnel de santé influent.",
                        "scenario": "Scénario plausible dans un contexte de forte pression business et multiplicité d'intermédiaires.",
                        "paysExposes": [
                                "Italie",
                                "Turquie"
                        ],
                        "probBrut": 1,
                        "impactBrut": 4,
                        "mitigationEffectiveness": "maîtrisé",
                        "statut": "validé",
                        "owner": "Compliance Officer",
                        "tiers": "Fournisseurs",
                        "controls": [
                                10,
                                1
                        ],
                        "actionPlans": [
                                5
                        ],
                        "aggravatingFactors": {
                                "group1": [
                                        "intermediaire-haut-risque"
                                ],
                                "group2": []
                        },
                        "createdAt": "2025-11-21T09:00:00Z",
                        "updatedAt": "2026-01-21T10:30:00Z"
                }
        ],
        "controls": [
                {
                        "id": 1,
                        "name": "Due diligence renforcée des intermédiaires",
                        "description": "Contrôle clé du dispositif anticorruption, documenté et tracé dans le plan de conformité.",
                        "type": "a-priori",
                        "origin": "interne",
                        "frequency": "annuelle",
                        "mode": "manuel",
                        "effectiveness": "moyenne",
                        "status": "actif",
                        "owner": "Contrôle Interne",
                        "risks": [
                                1,
                                10,
                                11,
                                20
                        ]
                },
                {
                        "id": 2,
                        "name": "Comité de validation des remises commerciales",
                        "description": "Contrôle clé du dispositif anticorruption, documenté et tracé dans le plan de conformité.",
                        "type": "a-priori",
                        "origin": "interne",
                        "frequency": "quotidienne",
                        "mode": "automatise",
                        "effectiveness": "faible",
                        "status": "en-revision",
                        "owner": "Direction Juridique",
                        "risks": [
                                2,
                                12
                        ]
                },
                {
                        "id": 3,
                        "name": "Double approbation contrats HCP/KOL",
                        "description": "Contrôle clé du dispositif anticorruption, documenté et tracé dans le plan de conformité.",
                        "type": "a-priori",
                        "origin": "interne",
                        "frequency": "ad-hoc",
                        "mode": "manuel",
                        "effectiveness": "forte",
                        "status": "actif",
                        "owner": "Finance",
                        "risks": [
                                2,
                                3,
                                12,
                                13
                        ]
                },
                {
                        "id": 4,
                        "name": "Revue mensuelle des paiements exceptionnels",
                        "description": "Contrôle clé du dispositif anticorruption, documenté et tracé dans le plan de conformité.",
                        "type": "a-priori",
                        "origin": "interne",
                        "frequency": "mensuelle",
                        "mode": "automatise",
                        "effectiveness": "moyenne",
                        "status": "en-mise-en-place",
                        "owner": "Compliance Officer",
                        "risks": [
                                4,
                                14
                        ]
                },
                {
                        "id": 5,
                        "name": "Contrôle anti-cadeaux et hospitalité",
                        "description": "Contrôle clé du dispositif anticorruption, documenté et tracé dans le plan de conformité.",
                        "type": "a-priori",
                        "origin": "interne",
                        "frequency": "annuelle",
                        "mode": "manuel",
                        "effectiveness": "faible",
                        "status": "actif",
                        "owner": "Contrôle Interne",
                        "risks": [
                                4,
                                5,
                                14,
                                15
                        ]
                },
                {
                        "id": 6,
                        "name": "Clause anticorruption et droit d'audit",
                        "description": "Contrôle clé du dispositif anticorruption, documenté et tracé dans le plan de conformité.",
                        "type": "a-priori",
                        "origin": "interne",
                        "frequency": "quotidienne",
                        "mode": "manuel",
                        "effectiveness": "forte",
                        "status": "actif",
                        "owner": "Direction Juridique",
                        "risks": [
                                6,
                                16
                        ]
                },
                {
                        "id": 7,
                        "name": "Formation Sapin II et FCPA ciblée",
                        "description": "Contrôle clé du dispositif anticorruption, documenté et tracé dans le plan de conformité.",
                        "type": "a-posteriori",
                        "origin": "interne",
                        "frequency": "ad-hoc",
                        "mode": "manuel",
                        "effectiveness": "moyenne",
                        "status": "en-revision",
                        "owner": "Finance",
                        "risks": [
                                6,
                                7,
                                16,
                                17
                        ]
                },
                {
                        "id": 8,
                        "name": "Monitoring data analytics des anomalies",
                        "description": "Contrôle clé du dispositif anticorruption, documenté et tracé dans le plan de conformité.",
                        "type": "a-posteriori",
                        "origin": "interne",
                        "frequency": "mensuelle",
                        "mode": "automatise",
                        "effectiveness": "faible",
                        "status": "actif",
                        "owner": "Compliance Officer",
                        "risks": [
                                8,
                                18
                        ]
                },
                {
                        "id": 9,
                        "name": "Audit terrain distributeurs tiers",
                        "description": "Contrôle clé du dispositif anticorruption, documenté et tracé dans le plan de conformité.",
                        "type": "a-posteriori",
                        "origin": "externe",
                        "frequency": "annuelle",
                        "mode": "manuel",
                        "effectiveness": "forte",
                        "status": "en-mise-en-place",
                        "owner": "Contrôle Interne",
                        "risks": [
                                8,
                                9,
                                18,
                                19
                        ]
                },
                {
                        "id": 10,
                        "name": "Validation juridique des subventions",
                        "description": "Contrôle clé du dispositif anticorruption, documenté et tracé dans le plan de conformité.",
                        "type": "a-posteriori",
                        "origin": "interne",
                        "frequency": "quotidienne",
                        "mode": "manuel",
                        "effectiveness": "moyenne",
                        "status": "actif",
                        "owner": "Direction Juridique",
                        "risks": [
                                10,
                                20
                        ]
                }
        ],
        "actionPlans": [
                {
                        "id": 1,
                        "title": "Renforcer le contrôle des tiers à risque élevé",
                        "owner": "Direction Compliance",
                        "dueDate": "2026-04-30",
                        "status": "en-cours",
                        "description": "Plan d'actions structuré avec jalons, livrables et indicateurs de suivi.",
                        "progress": 55,
                        "risks": [
                                1,
                                6,
                                11,
                                15,
                                16
                        ]
                },
                {
                        "id": 2,
                        "title": "Fiabiliser les interactions avec les professionnels de santé",
                        "owner": "Affaires Médicales",
                        "dueDate": "2026-06-30",
                        "status": "a-demarrer",
                        "description": "Plan d'actions structuré avec jalons, livrables et indicateurs de suivi.",
                        "progress": 20,
                        "risks": [
                                2,
                                6,
                                7,
                                12,
                                17
                        ]
                },
                {
                        "id": 3,
                        "title": "Sécuriser les processus d'appels d'offres publics",
                        "owner": "Direction Commerciale",
                        "dueDate": "2026-05-15",
                        "status": "en-cours",
                        "description": "Plan d'actions structuré avec jalons, livrables et indicateurs de suivi.",
                        "progress": 40,
                        "risks": [
                                3,
                                8,
                                12,
                                13,
                                18
                        ]
                },
                {
                        "id": 4,
                        "title": "Automatiser la détection des paiements atypiques",
                        "owner": "Finance Transformation",
                        "dueDate": "2026-07-31",
                        "status": "brouillon",
                        "description": "Plan d'actions structuré avec jalons, livrables et indicateurs de suivi.",
                        "progress": 10,
                        "risks": [
                                3,
                                4,
                                9,
                                14,
                                18,
                                19
                        ]
                },
                {
                        "id": 5,
                        "title": "Déployer la gouvernance anti-corruption internationale",
                        "owner": "Direction Groupe",
                        "dueDate": "2026-09-30",
                        "status": "a-demarrer",
                        "description": "Plan d'actions structuré avec jalons, livrables et indicateurs de suivi.",
                        "progress": 15,
                        "risks": [
                                5,
                                9,
                                10,
                                15,
                                20
                        ]
                }
        ],
        "interviews": [
                {
                        "id": 1,
                        "fileIndex": 1,
                        "fileName": "interview1.json",
                        "title": "Entretien Camille Moreau",
                        "referents": [
                                "Camille Moreau"
                        ],
                        "date": "2026-01-02",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "France"
                        ],
                        "processes": [
                                "Achats"
                        ],
                        "subProcesses": [
                                "Sourcing matières plasmatiques"
                        ],
                        "createdAt": "2026-01-02T09:00:00Z",
                        "updatedAt": "2026-01-02T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 2,
                        "fileIndex": 2,
                        "fileName": "interview2.json",
                        "title": "Entretien Nicolas Renaud",
                        "referents": [
                                "Nicolas Renaud"
                        ],
                        "date": "2026-01-03",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "Groupe",
                                "International"
                        ],
                        "processes": [
                                "Achats"
                        ],
                        "subProcesses": [
                                "Qualification fournisseurs critiques"
                        ],
                        "createdAt": "2026-01-03T09:00:00Z",
                        "updatedAt": "2026-01-03T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 3,
                        "fileIndex": 3,
                        "fileName": "interview3.json",
                        "title": "Entretien Sarah El Idrissi",
                        "referents": [
                                "Sarah El Idrissi"
                        ],
                        "date": "2026-01-04",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "France"
                        ],
                        "processes": [
                                "Ventes & Accès marché"
                        ],
                        "subProcesses": [
                                "Appels d'offres hôpitaux publics"
                        ],
                        "createdAt": "2026-01-04T09:00:00Z",
                        "updatedAt": "2026-01-04T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 4,
                        "fileIndex": 4,
                        "fileName": "interview4.json",
                        "title": "Entretien Antoine Perrin",
                        "referents": [
                                "Antoine Perrin"
                        ],
                        "date": "2026-01-05",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "Groupe",
                                "International"
                        ],
                        "processes": [
                                "Ventes & Accès marché"
                        ],
                        "subProcesses": [
                                "Remises commerciales distributeurs"
                        ],
                        "createdAt": "2026-01-05T09:00:00Z",
                        "updatedAt": "2026-01-05T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 5,
                        "fileIndex": 5,
                        "fileName": "interview5.json",
                        "title": "Entretien Julie Vasseur",
                        "referents": [
                                "Julie Vasseur"
                        ],
                        "date": "2026-01-06",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "France"
                        ],
                        "processes": [
                                "Affaires médicales"
                        ],
                        "subProcesses": [
                                "Contrats de conseil avec KOL"
                        ],
                        "createdAt": "2026-01-06T09:00:00Z",
                        "updatedAt": "2026-01-06T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 6,
                        "fileIndex": 6,
                        "fileName": "interview6.json",
                        "title": "Entretien Karim Benali",
                        "referents": [
                                "Karim Benali"
                        ],
                        "date": "2026-01-07",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "Groupe",
                                "International"
                        ],
                        "processes": [
                                "Affaires médicales"
                        ],
                        "subProcesses": [
                                "Hospitalité congrès scientifiques"
                        ],
                        "createdAt": "2026-01-07T09:00:00Z",
                        "updatedAt": "2026-01-07T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 7,
                        "fileIndex": 7,
                        "fileName": "interview7.json",
                        "title": "Entretien Mathilde Giraud",
                        "referents": [
                                "Mathilde Giraud"
                        ],
                        "date": "2026-01-08",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "France"
                        ],
                        "processes": [
                                "R&D Clinique"
                        ],
                        "subProcesses": [
                                "Sélection des centres investigateurs"
                        ],
                        "createdAt": "2026-01-08T09:00:00Z",
                        "updatedAt": "2026-01-08T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 8,
                        "fileIndex": 8,
                        "fileName": "interview8.json",
                        "title": "Entretien Thomas Lemoine",
                        "referents": [
                                "Thomas Lemoine"
                        ],
                        "date": "2026-01-09",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "Groupe",
                                "International"
                        ],
                        "processes": [
                                "R&D Clinique"
                        ],
                        "subProcesses": [
                                "Gestion CRO internationales"
                        ],
                        "createdAt": "2026-01-09T09:00:00Z",
                        "updatedAt": "2026-01-09T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 9,
                        "fileIndex": 9,
                        "fileName": "interview9.json",
                        "title": "Entretien Lucie Marchand",
                        "referents": [
                                "Lucie Marchand"
                        ],
                        "date": "2026-01-10",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "France"
                        ],
                        "processes": [
                                "Supply Chain"
                        ],
                        "subProcesses": [
                                "Dédouanement lots biologiques"
                        ],
                        "createdAt": "2026-01-10T09:00:00Z",
                        "updatedAt": "2026-01-10T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 10,
                        "fileIndex": 10,
                        "fileName": "interview10.json",
                        "title": "Entretien Yanis Haddad",
                        "referents": [
                                "Yanis Haddad"
                        ],
                        "date": "2026-01-11",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "Groupe",
                                "International"
                        ],
                        "processes": [
                                "Supply Chain"
                        ],
                        "subProcesses": [
                                "Transport sous chaîne du froid"
                        ],
                        "createdAt": "2026-01-11T09:00:00Z",
                        "updatedAt": "2026-01-11T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 11,
                        "fileIndex": 11,
                        "fileName": "interview11.json",
                        "title": "Entretien Claire Dubois",
                        "referents": [
                                "Claire Dubois"
                        ],
                        "date": "2026-02-12",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "France"
                        ],
                        "processes": [
                                "Finance"
                        ],
                        "subProcesses": [
                                "Paiements exceptionnels"
                        ],
                        "createdAt": "2026-01-12T09:00:00Z",
                        "updatedAt": "2026-01-12T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 12,
                        "fileIndex": 12,
                        "fileName": "interview12.json",
                        "title": "Entretien Romain Chevalier",
                        "referents": [
                                "Romain Chevalier"
                        ],
                        "date": "2026-02-13",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "Groupe",
                                "International"
                        ],
                        "processes": [
                                "Finance"
                        ],
                        "subProcesses": [
                                "Notes de frais management"
                        ],
                        "createdAt": "2026-01-13T09:00:00Z",
                        "updatedAt": "2026-01-13T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 13,
                        "fileIndex": 13,
                        "fileName": "interview13.json",
                        "title": "Entretien Sophie Lambert",
                        "referents": [
                                "Sophie Lambert"
                        ],
                        "date": "2026-02-14",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "France"
                        ],
                        "processes": [
                                "IT & Digital"
                        ],
                        "subProcesses": [
                                "Prestataires cybersécurité"
                        ],
                        "createdAt": "2026-01-14T09:00:00Z",
                        "updatedAt": "2026-01-14T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 14,
                        "fileIndex": 14,
                        "fileName": "interview14.json",
                        "title": "Entretien Hugo Delmas",
                        "referents": [
                                "Hugo Delmas"
                        ],
                        "date": "2026-02-15",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "Groupe",
                                "International"
                        ],
                        "processes": [
                                "IT & Digital"
                        ],
                        "subProcesses": [
                                "Attribution licences logicielles"
                        ],
                        "createdAt": "2026-01-15T09:00:00Z",
                        "updatedAt": "2026-01-15T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 15,
                        "fileIndex": 15,
                        "fileName": "interview15.json",
                        "title": "Entretien Inès Robert",
                        "referents": [
                                "Inès Robert"
                        ],
                        "date": "2026-02-16",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "France"
                        ],
                        "processes": [
                                "RH"
                        ],
                        "subProcesses": [
                                "Recrutement profils clés"
                        ],
                        "createdAt": "2026-01-16T09:00:00Z",
                        "updatedAt": "2026-01-16T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 16,
                        "fileIndex": 16,
                        "fileName": "interview16.json",
                        "title": "Entretien David Schmitt",
                        "referents": [
                                "David Schmitt"
                        ],
                        "date": "2026-02-17",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "Groupe",
                                "International"
                        ],
                        "processes": [
                                "RH"
                        ],
                        "subProcesses": [
                                "Mobilité internationale"
                        ],
                        "createdAt": "2026-01-17T09:00:00Z",
                        "updatedAt": "2026-01-17T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 17,
                        "fileIndex": 17,
                        "fileName": "interview17.json",
                        "title": "Entretien Mélanie Torres",
                        "referents": [
                                "Mélanie Torres"
                        ],
                        "date": "2026-02-18",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "France"
                        ],
                        "processes": [
                                "Qualité"
                        ],
                        "subProcesses": [
                                "Inspections GMP"
                        ],
                        "createdAt": "2026-01-18T09:00:00Z",
                        "updatedAt": "2026-01-18T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 18,
                        "fileIndex": 18,
                        "fileName": "interview18.json",
                        "title": "Entretien Victor Nguyen",
                        "referents": [
                                "Victor Nguyen"
                        ],
                        "date": "2026-02-19",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "Groupe",
                                "International"
                        ],
                        "processes": [
                                "Juridique & Compliance"
                        ],
                        "subProcesses": [
                                "Due diligence tiers"
                        ],
                        "createdAt": "2026-01-19T09:00:00Z",
                        "updatedAt": "2026-01-19T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 19,
                        "fileIndex": 19,
                        "fileName": "interview19.json",
                        "title": "Entretien Amandine Faure",
                        "referents": [
                                "Amandine Faure"
                        ],
                        "date": "2026-02-20",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "France"
                        ],
                        "processes": [
                                "Market Access"
                        ],
                        "subProcesses": [
                                "Subventions associations patients"
                        ],
                        "createdAt": "2026-01-20T09:00:00Z",
                        "updatedAt": "2026-01-20T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 20,
                        "fileIndex": 20,
                        "fileName": "interview20.json",
                        "title": "Entretien Julien Caron",
                        "referents": [
                                "Julien Caron"
                        ],
                        "date": "2026-02-21",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "Groupe",
                                "International"
                        ],
                        "processes": [
                                "Direction industrielle"
                        ],
                        "subProcesses": [
                                "Permis environnementaux"
                        ],
                        "createdAt": "2026-01-21T09:00:00Z",
                        "updatedAt": "2026-01-21T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 21,
                        "fileIndex": 21,
                        "fileName": "interview21.json",
                        "title": "Entretien Nadia Bensalem",
                        "referents": [
                                "Nadia Bensalem"
                        ],
                        "date": "2026-03-22",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "France"
                        ],
                        "processes": [
                                "Achats"
                        ],
                        "subProcesses": [
                                "Sourcing matières plasmatiques"
                        ],
                        "createdAt": "2026-01-22T09:00:00Z",
                        "updatedAt": "2026-01-22T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 22,
                        "fileIndex": 22,
                        "fileName": "interview22.json",
                        "title": "Entretien Olivier Marty",
                        "referents": [
                                "Olivier Marty"
                        ],
                        "date": "2026-03-23",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "Groupe",
                                "International"
                        ],
                        "processes": [
                                "Achats"
                        ],
                        "subProcesses": [
                                "Qualification fournisseurs critiques"
                        ],
                        "createdAt": "2026-01-23T09:00:00Z",
                        "updatedAt": "2026-01-23T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 23,
                        "fileIndex": 23,
                        "fileName": "interview23.json",
                        "title": "Entretien Élodie Petit",
                        "referents": [
                                "Élodie Petit"
                        ],
                        "date": "2026-03-24",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "France"
                        ],
                        "processes": [
                                "Ventes & Accès marché"
                        ],
                        "subProcesses": [
                                "Appels d'offres hôpitaux publics"
                        ],
                        "createdAt": "2026-01-24T09:00:00Z",
                        "updatedAt": "2026-01-24T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 24,
                        "fileIndex": 24,
                        "fileName": "interview24.json",
                        "title": "Entretien Maxime Rolland",
                        "referents": [
                                "Maxime Rolland"
                        ],
                        "date": "2026-03-25",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "Groupe",
                                "International"
                        ],
                        "processes": [
                                "Ventes & Accès marché"
                        ],
                        "subProcesses": [
                                "Remises commerciales distributeurs"
                        ],
                        "createdAt": "2026-01-25T09:00:00Z",
                        "updatedAt": "2026-01-25T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 25,
                        "fileIndex": 25,
                        "fileName": "interview25.json",
                        "title": "Entretien Leïla Saadi",
                        "referents": [
                                "Leïla Saadi"
                        ],
                        "date": "2026-03-26",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "France"
                        ],
                        "processes": [
                                "Affaires médicales"
                        ],
                        "subProcesses": [
                                "Contrats de conseil avec KOL"
                        ],
                        "createdAt": "2026-01-26T09:00:00Z",
                        "updatedAt": "2026-01-26T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 26,
                        "fileIndex": 26,
                        "fileName": "interview26.json",
                        "title": "Entretien Bastien Garnier",
                        "referents": [
                                "Bastien Garnier"
                        ],
                        "date": "2026-03-27",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "Groupe",
                                "International"
                        ],
                        "processes": [
                                "Affaires médicales"
                        ],
                        "subProcesses": [
                                "Hospitalité congrès scientifiques"
                        ],
                        "createdAt": "2026-01-27T09:00:00Z",
                        "updatedAt": "2026-01-27T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 27,
                        "fileIndex": 27,
                        "fileName": "interview27.json",
                        "title": "Entretien Pauline Renault",
                        "referents": [
                                "Pauline Renault"
                        ],
                        "date": "2026-03-28",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "France"
                        ],
                        "processes": [
                                "R&D Clinique"
                        ],
                        "subProcesses": [
                                "Sélection des centres investigateurs"
                        ],
                        "createdAt": "2026-01-28T09:00:00Z",
                        "updatedAt": "2026-01-28T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 28,
                        "fileIndex": 28,
                        "fileName": "interview28.json",
                        "title": "Entretien Grégory Simon",
                        "referents": [
                                "Grégory Simon"
                        ],
                        "date": "2026-03-01",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "Groupe",
                                "International"
                        ],
                        "processes": [
                                "R&D Clinique"
                        ],
                        "subProcesses": [
                                "Gestion CRO internationales"
                        ],
                        "createdAt": "2026-01-01T09:00:00Z",
                        "updatedAt": "2026-01-01T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 29,
                        "fileIndex": 29,
                        "fileName": "interview29.json",
                        "title": "Entretien Anaïs Meunier",
                        "referents": [
                                "Anaïs Meunier"
                        ],
                        "date": "2026-03-02",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "France"
                        ],
                        "processes": [
                                "Supply Chain"
                        ],
                        "subProcesses": [
                                "Dédouanement lots biologiques"
                        ],
                        "createdAt": "2026-01-02T09:00:00Z",
                        "updatedAt": "2026-01-02T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                },
                {
                        "id": 30,
                        "fileIndex": 30,
                        "fileName": "interview30.json",
                        "title": "Entretien Loïc Bernard",
                        "referents": [
                                "Loïc Bernard"
                        ],
                        "date": "2026-03-03",
                        "notes": "Entretien de cartographie : exposition corruption, contrôles existants et zones de vulnérabilité.",
                        "scopes": [
                                "Groupe",
                                "International"
                        ],
                        "processes": [
                                "Supply Chain"
                        ],
                        "subProcesses": [
                                "Transport sous chaîne du froid"
                        ],
                        "createdAt": "2026-01-03T09:00:00Z",
                        "updatedAt": "2026-01-03T09:00:00Z",
                        "mindMap": {
                                "version": 1,
                                "data": null
                        }
                }
        ],
        "history": [
                {
                        "id": 1718000000001,
                        "date": "2026-01-10T08:30:00Z",
                        "action": "Chargement dataset Pharma Demo",
                        "description": "Initialisation de 20 risques, 10 contrôles, 5 plans d'action et 30 entretiens.",
                        "user": "Système"
                },
                {
                        "id": 1718000000002,
                        "date": "2026-01-12T10:00:00Z",
                        "action": "Revue Compliance",
                        "description": "Validation préliminaire des risques critiques liés aux tiers et marchés publics.",
                        "user": "Direction Compliance"
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
