// Enhanced Risk Management System - Shared Constants

const RISK_PROBABILITY_INFO = {
    1: {
        label: 'Peu probable',
        text: "Evénement non survenu sur les 5 dernières années. Evénement non attendu sur les 5 prochaines années"
    },
    2: {
        label: 'Moyennement probable',
        text: "Evénement survenu 1 fois au cours des 5 dernières années. Evénement pouvant survenir 1 fois au cours des 5 prochaines années"
    },
    3: {
        label: 'Probable',
        text: "Evénement survenu 1 fois au cours de l’année passée. Evénement pouvant survenir 1 fois au cours de l’année à venir"
    },
    4: {
        label: 'Très probable',
        text: "Evénement survenu plusieurs fois au cours de l’année passée. Evénement attendu 1 ou plusieurs fois au cours de l’année à venir"
    }
};

const RISK_IMPACT_INFO = {
    1: {
        label: 'Faible',
        text: "<p><strong>Impact financier</strong></p><ul><li>Sanction interne disciplinaire envers un collaborateur</li></ul><p><strong>Impact juridique / r&eacute;glementaire</strong></p><ul><li>Sanction interne disciplinaire envers un collaborateur</li></ul><p><strong>Impact r&eacute;putationnel</strong></p><ul><li>Impact nul, interne ou externe local (ex : Partenaire)</li><li>Atteinte limit&eacute;e &agrave; quelques jours</li></ul><p><strong>Impact op&eacute;rationnel</strong></p><ul><li>Peu ou pas de perturbations</li><li>Rallentissement des activit&eacute;s</li></ul>"
    },
    2: {
        label: 'Modéré',
        text: "Incident gérable avec des efforts supplémentaires ; impacts financiers ou opérationnels contenus."
    },
    3: {
        label: 'Fort',
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
        symbol: 'B',
        matrixId: 'riskMatrixEditBrut',
        gridId: 'riskMatrixEditGridBrut',
        descriptionContainer: 'matrixDescriptionBrut'
    },
    net: {
        label: 'Risque Net',
        probInput: 'probNet',
        impactInput: 'impactNet',
        scoreElement: 'scoreNet',
        coordElement: 'coordNet',
        pointClass: 'net',
        symbol: 'N',
        matrixId: 'riskMatrixEditNet',
        gridId: 'riskMatrixEditGridNet',
        descriptionContainer: 'matrixDescriptionNet'
    }
};

window.RISK_PROBABILITY_INFO = RISK_PROBABILITY_INFO;
window.RISK_IMPACT_INFO = RISK_IMPACT_INFO;
window.RISK_STATE_CONFIG = RISK_STATE_CONFIG;
