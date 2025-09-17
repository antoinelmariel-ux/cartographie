// Enhanced Risk Management System - Shared Constants

const RISK_PROBABILITY_INFO = {
    1: {
        label: 'Très rare',
        text: "Situation exceptionnelle nécessitant une combinaison d'événements peu plausibles et sans cas recensé récemment."
    },
    2: {
        label: 'Peu probable',
        text: "Peut survenir de façon isolée lorsque plusieurs facteurs se cumulent ; occurrence envisageable à moyen terme."
    },
    3: {
        label: 'Probable',
        text: "Déjà observé ponctuellement ; les conditions favorables existent et les signaux faibles sont identifiés."
    },
    4: {
        label: 'Très probable',
        text: "Événement attendu à court terme en l'absence d'action ; les contrôles actuels ne suffisent pas à le prévenir."
    }
};

const RISK_IMPACT_INFO = {
    1: {
        label: 'Mineur',
        text: "Conséquences limitées, facilement réversibles et sans effet notable sur les activités ou la réputation."
    },
    2: {
        label: 'Modéré',
        text: "Incident gérable avec des efforts supplémentaires ; impacts financiers ou opérationnels contenus."
    },
    3: {
        label: 'Majeur',
        text: "Perturbation significative de l'activité ou des relations externes avec exposition médiatique possible."
    },
    4: {
        label: 'Critique',
        text: "Atteinte grave à la continuité, sanctions réglementaires majeures ou dommages durables à la réputation."
    }
};

const RISK_STATE_CONFIG = {
    brut: {
        label: 'Risque Brut',
        probInput: 'probBrut',
        impactInput: 'impactBrut',
        scoreElement: 'scoreBrut',
        coordElement: 'coordBrut',
        pointClass: 'brut',
        symbol: 'B'
    },
    net: {
        label: 'Risque Net',
        probInput: 'probNet',
        impactInput: 'impactNet',
        scoreElement: 'scoreNet',
        coordElement: 'coordNet',
        pointClass: 'net',
        symbol: 'N'
    },
    post: {
        label: 'Post-mitigation',
        probInput: 'probPost',
        impactInput: 'impactPost',
        scoreElement: 'scorePost',
        coordElement: 'coordPost',
        pointClass: 'post',
        symbol: 'P'
    }
};

window.RISK_PROBABILITY_INFO = RISK_PROBABILITY_INFO;
window.RISK_IMPACT_INFO = RISK_IMPACT_INFO;
window.RISK_STATE_CONFIG = RISK_STATE_CONFIG;
