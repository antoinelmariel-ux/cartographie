(function (global) {
    const defaultDataSets = {
        risks: [],
        controls: [],
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
