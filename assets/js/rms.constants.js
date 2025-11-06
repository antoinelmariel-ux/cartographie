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
        text: "<p><strong>Impact financier</strong></p><ul><li>&lt; 300K&euro;</li></ul><p><strong>Impact juridique / r&eacute;glementaire</strong></p><ul><li>Sanction interne disciplinaire envers un collaborateur</li></ul><p><strong>Impact r&eacute;putationnel</strong></p><ul><li>Impact nul, interne ou externe local (ex : Partenaire)</li><li>Atteinte limit&eacute;e &agrave; quelques jours</li></ul><p><strong>Impact op&eacute;rationnel</strong></p><ul><li>Peu ou pas de perturbations</li><li>Rallentissement des activit&eacute;s</li></ul>"
    },
    2: {
        label: 'Modéré',
        text: "<p><strong>Impact financier</strong></p><ul><li>&lt; 3M&euro;</li></ul><p><strong>Impact juridique / r&eacute;glementaire</strong></p><ul><li>Proc&eacute;dure judiciaire ou administrative &agrave; l&rsquo;&eacute;chelle d&rsquo;un collaborateur</li></ul><p><strong>Impact r&eacute;putationnel</strong></p><ul><li><p>Impact externe r&eacute;gional (ex.&nbsp;: ARS)</p></li><li><p>Atteinte limit&eacute;e &agrave; quelques semaines</p></li></ul><p><strong>Impact op&eacute;rationnel</strong></p><ul><li><p>Perturbations l&eacute;g&egrave;res</p></li><li><p>Perte temporaire d&rsquo;activit&eacute;s ou de march&eacute;s</p></li></ul>"
    },
    3: {
        label: 'Fort',
        text: "<p><strong>Impact financier</strong></p><ul><li>&lt; 30M&euro;</li></ul><p><strong>Impact juridique / r&eacute;glementaire</strong></p><ul><li>Sanctions &agrave; l&rsquo;&eacute;chelle d&rsquo;une filiale Convention juridique d&rsquo;int&eacute;r&ecirc;t public (CJIP)</li></ul><p><strong>Impact r&eacute;putationnel</strong></p><ul><li><p>Impact externe national (ex.&nbsp;: minist&egrave;re de la Sant&eacute;)</p></li><li><p>Crise m&eacute;diatique nationale</p></li><li><p>Atteinte prolong&eacute;e sur plusieurs mois</p></li></ul><p><strong>Impact op&eacute;rationnel</strong></p><ul><li><p>Perturbations importantes</p></li><li><p>Perte d&eacute;finitive d&rsquo;activit&eacute;s ou de march&eacute;s</p></li></ul>"
    },
    4: {
        label: 'Critique',
        text: "<p><strong>Impact financier</strong></p><ul><li>&ge; 30M&euro;</li></ul><p><strong>Impact juridique / r&eacute;glementaire</strong></p><ul><li><p>Sanctions &agrave; l&rsquo;&eacute;chelle du Groupe</p></li><li><p>Condamnation p&eacute;nale</p></li></ul><p><strong>Impact r&eacute;putationnel</strong></p><ul><li><p>Impact externe international (ex.&nbsp;: EMA, FDA, etc.)</p></li><li><p>Crise m&eacute;diatique internationale</p></li><li><p>Atteinte durable sur plusieurs ann&eacute;es</p></li></ul><p><strong>Impact op&eacute;rationnel</strong></p><ul><li><p>Arr&ecirc;t des activit&eacute;s</p></li></ul>"
    }
};

const RISK_STATE_CONFIG = {
    brut: {
        label: 'Risque Brut aggravé',
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

const MITIGATION_EFFECTIVENESS_DESCRIPTIONS = Object.freeze({
    inefficace: `
        <p>Les contrôles sont inexistants ou ne sont pas réalisés. Aucun dispositif ne permet de réduire le risque.</p>
        <ul>
            <li>Absence de procédures documentées ou de responsabilités formalisées.</li>
            <li>Actions correctives non engagées malgré les constats d'audit ou de revue.</li>
        </ul>
    `,
    insuffisant: `
        <p>Les contrôles existent mais demeurent lacunaires et ne couvrent pas l'ensemble du périmètre exposé.</p>
        <ul>
            <li>Application ponctuelle ou dépendante d'acteurs clés sans supervision.</li>
            <li>Preuves d'exécution partielles ou non conservées.</li>
        </ul>
    `,
    ameliorable: `
        <p>Les contrôles sont structurés et suivis, mais présentent encore des faiblesses mesurables.</p>
        <ul>
            <li>Dispositif documenté, toutefois des améliorations restent nécessaires pour fiabiliser l'exécution.</li>
            <li>Suivi périodique en place avec des plans d'actions pour combler les écarts.</li>
        </ul>
    `,
    efficace: `
        <p>Les contrôles sont pleinement opérationnels et démontrent leur efficacité dans la réduction du risque.</p>
        <ul>
            <li>Procédures formalisées, formation des intervenants et supervision démontrable.</li>
            <li>Indicateurs de performance suivis avec amélioration continue du dispositif.</li>
        </ul>
    `
});

window.RISK_PROBABILITY_INFO = RISK_PROBABILITY_INFO;
window.RISK_IMPACT_INFO = RISK_IMPACT_INFO;
window.RISK_STATE_CONFIG = RISK_STATE_CONFIG;
window.MITIGATION_EFFECTIVENESS_DESCRIPTIONS = MITIGATION_EFFECTIVENESS_DESCRIPTIONS;
