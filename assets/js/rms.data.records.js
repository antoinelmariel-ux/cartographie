(function (global) {
    const defaultDataSets = {
        risks: [],
        controls: [
            { id: 1, reference: 'GEN.01', groupCode: '', name: 'Separation of medical and commercial roles (generic)', type: 'a-priori', origin: 'interne', owner: 'Compliance', frequency: 'annuelle', mode: 'ongoing', effectiveness: 'to-be-improved', status: 'actif', description: '', risks: [], dateCreation: '2026-04-16' },
            { id: 2, reference: 'GEN.02', groupCode: '', name: 'Segregation of duties (generic)', type: 'a-priori', origin: 'interne', owner: 'Compliance', frequency: 'annuelle', mode: 'ongoing', effectiveness: 'to-be-improved', status: 'actif', description: '', risks: [], dateCreation: '2026-04-16' },
            { id: 3, reference: 'GEN.03', groupCode: '', name: 'Collegial decision-making (generic)', type: 'a-priori', origin: 'interne', owner: 'Compliance', frequency: 'ad-hoc', mode: 'ongoing', effectiveness: 'to-be-improved', status: 'actif', description: '', risks: [], dateCreation: '2026-04-16' },
            { id: 4, reference: 'GEN.04', groupCode: '', name: 'Collegiality via committees/review bodies (generic)', type: 'a-priori', origin: 'interne', owner: 'Compliance', frequency: 'ad-hoc', mode: 'ongoing', effectiveness: 'to-be-improved', status: 'actif', description: '', risks: [], dateCreation: '2026-04-16' },
            { id: 5, reference: 'GEN.05', groupCode: '', name: 'Documentation of needs (generic)', type: 'a-priori', origin: 'interne', owner: 'Achats', frequency: 'ad-hoc', mode: 'ongoing', effectiveness: 'satisfactory', status: 'actif', description: '', risks: [], dateCreation: '2026-04-16' },
            { id: 6, reference: 'GEN.06', groupCode: '', name: 'Documentation of partner selection (generic)', type: 'a-priori', origin: 'interne', owner: 'Achats', frequency: 'ad-hoc', mode: 'ongoing', effectiveness: 'satisfactory', status: 'actif', description: '', risks: [], dateCreation: '2026-04-16' },
            { id: 7, reference: 'GEN.07', groupCode: '', name: 'Due diligence (generic)', type: 'a-priori', origin: 'interne', owner: 'Compliance', frequency: 'ad-hoc', mode: 'ongoing', effectiveness: 'satisfactory', status: 'actif', description: '', risks: [], dateCreation: '2026-04-16' },
            { id: 8, reference: 'GEN.08', groupCode: '', name: 'Pricing structure / ceiling (generic)', type: 'a-priori', origin: 'interne', owner: 'Finance', frequency: 'annuelle', mode: 'ongoing', effectiveness: 'to-be-improved', status: 'actif', description: '', risks: [], dateCreation: '2026-04-16' },
            { id: 9, reference: 'GEN.09', groupCode: '', name: 'Competitive tendering (generic)', type: 'a-priori', origin: 'interne', owner: 'Achats', frequency: 'ad-hoc', mode: 'ongoing', effectiveness: 'satisfactory', status: 'actif', description: '', risks: [], dateCreation: '2026-04-16' },
            { id: 10, reference: 'GEN.10', groupCode: '', name: 'Level 2 prior authorisation (generic)', type: 'a-priori', origin: 'interne', owner: 'Management', frequency: 'ad-hoc', mode: 'ongoing', effectiveness: 'to-be-improved', status: 'actif', description: '', risks: [], dateCreation: '2026-04-16' },
            { id: 11, reference: 'GEN.11', groupCode: '', name: 'Level 2 ex-post control (generic)', type: 'a-posteriori', origin: 'interne', owner: 'Contrôle interne', frequency: 'mensuelle', mode: 'transactional', effectiveness: 'to-be-improved', status: 'actif', description: '', risks: [], dateCreation: '2026-04-16' },
            { id: 12, reference: 'GEN.12', groupCode: '', name: 'Reconciliation of invoice and purchase order (generic)', type: 'a-posteriori', origin: 'interne', owner: 'Finance', frequency: 'mensuelle', mode: 'ongoing', effectiveness: 'satisfactory', status: 'actif', description: '', risks: [], dateCreation: '2026-04-16' },
            { id: 13, reference: 'GEN.13', groupCode: '', name: 'Proof of service rendered (generic)', type: 'a-posteriori', origin: 'interne', owner: 'Achats', frequency: 'ad-hoc', mode: 'ongoing', effectiveness: 'to-be-improved', status: 'actif', description: '', risks: [], dateCreation: '2026-04-16' },
            { id: 14, reference: 'GEN.14', groupCode: '', name: 'Traceability of actions/flows (generic)', type: 'a-posteriori', origin: 'interne', owner: 'IT', frequency: 'quotidienne', mode: 'ongoing', effectiveness: 'to-be-improved', status: 'actif', description: '', risks: [], dateCreation: '2026-04-16' },
            { id: 15, reference: 'GEN.15', groupCode: '', name: 'Traceability of the validation workflow (generic)', type: 'a-posteriori', origin: 'interne', owner: 'IT', frequency: 'quotidienne', mode: 'ongoing', effectiveness: 'to-be-improved', status: 'actif', description: '', risks: [], dateCreation: '2026-04-16' },
            { id: 16, reference: 'GEN.16', groupCode: '', name: 'Contract with anti-corruption clause (generic)', type: 'a-priori', origin: 'interne', owner: 'Juridique', frequency: 'ad-hoc', mode: 'ongoing', effectiveness: 'satisfactory', status: 'actif', description: '', risks: [], dateCreation: '2026-04-16' },
            { id: 17, reference: 'GEN.17', groupCode: '', name: 'Contract without anti-corruption clause (generic)', type: 'a-posteriori', origin: 'interne', owner: 'Juridique', frequency: 'ad-hoc', mode: 'transactional', effectiveness: 'not-in-place', status: 'actif', description: '', risks: [], dateCreation: '2026-04-16' },
            { id: 18, reference: 'GEN.18', groupCode: '', name: 'Anti-corruption training (generic)', type: 'a-priori', origin: 'interne', owner: 'Compliance', frequency: 'annuelle', mode: 'ongoing', effectiveness: 'to-be-improved', status: 'actif', description: '', risks: [], dateCreation: '2026-04-16' },
            { id: 19, reference: 'GEN.19', groupCode: '', name: 'Internal whistleblowing mechanism (generic)', type: 'a-posteriori', origin: 'interne', owner: 'Compliance', frequency: 'ad-hoc', mode: 'ongoing', effectiveness: 'to-be-improved', status: 'actif', description: '', risks: [], dateCreation: '2026-04-16' }
        ],
        actionPlans: [],
        interviews: [],
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
