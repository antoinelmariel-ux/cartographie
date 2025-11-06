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
        <p>Gouvernance</p>
        <ul>
<li>Aucun engagement du management</li>
<li>Aucun principe d'&eacute;thique et de conformit&eacute; communiqu&eacute; ou non appliqu&eacute;</li>
<li>Pas de prise en charge de la fonction Ethique et Conformit&eacute;</li>
<li>Aucun reporting / suivi des sujets en mati&egrave;re d'&eacute;thique et de conformit&eacute;</li>
        </ul>
             <p>Proc&eacute;dures et contr&ocirc;les</p>
             <ul>
             <li>Absence de proc&eacute;dure / processus</li>
<li>Processus inefficaces/non pertinents, non appliqu&eacute;s ou non diffus&eacute;s</li>
<li>Absence de contr&ocirc;le</li>
<li>Contr&ocirc;les inefficaces/non pertinent ou non appliqu&eacute;s</li>
</ul>
<p>Formation</p>
<ul>
<li>Absence de formation ou de sensibilisation</li>
<li>Formation inefficace/non pertinente</li>
<li>Taux de formation tr&egrave;s faible (&le; 20%)</li>
</ul>
    `,
    insuffisant: `
        <p>Gouvernance</p>
           <ul>
<li>Engagement informel du management</li>
<li>Peu de communications / communications informelles ou partielles sur le respect des principes d'&eacute;thique et de conformit&eacute;</li>
<li>Pas d'&eacute;quipe officiellement en charge de la fonction Ethique et Conformit&eacute;</li>
<li>Suivi informel des sujets d'&eacute;thique et de conformit&eacute; mais aucun reporting au management</li>
</ul>
 <p>Proc&eacute;dures et contr&ocirc;les</p>
 <ul>
<li>Processus informels (pas de proc&eacute;dures formalis&eacute;es), diffus&eacute;s partiellement &agrave; l'oral, et partiellement appliqu&eacute;s</li>
<li>Contr&ocirc;les ponctuels non formalis&eacute;s et partiellement appliqu&eacute;s</li>
</ul>
<p>Formation</p>
<ul>
<li>Formation ou sensibilisation informelle (orale), ponctuelle et/ou partielle des collaborateurs et des nouveaux arrivants</li>
<li>Taux de formation peu &eacute;lev&eacute; (entre 20% et 50%)</li>
</ul>
    `,
    ameliorable: `
        <p>Gouvernance</p>
      <ul>
<li>Engagement formel / passif du management (r&eacute;actif en cas de sollicitation de l'&eacute;quipe en charge de la fonction Ethique et Conformit&eacute;, sujet &agrave; l'ordre du jour sur sollicitation, etc.)<br /> - Communications irr&eacute;guli&egrave;res sur le respect des principes d'&eacute;thique et de conformit&eacute; (pas de plan de communication particulier)</li>
<li>Equipe en charge de la fonction Ethique et Conformit&eacute; en plus d'autres fonctions (temps d&eacute;di&eacute; pas toujours suffisant) / Pas de Comit&eacute; Ethique et Conformit&eacute;</li>
<li>Reporting irr&eacute;gulier au management sur le suivi des actions</li>
</ul>
 <p>Proc&eacute;dures et contr&ocirc;les</p>
 <ul>
<li>Proc&eacute;dures partiellement formalis&eacute;es, diffus&eacute;es, appliqu&eacute;es, contr&ocirc;l&eacute;es et/ou audit&eacute;es</li>
<li>Mises &agrave; jour irr&eacute;guli&egrave;res des proc&eacute;dures</li>
<li>Contr&ocirc;les partiellement formalis&eacute;s ou document&eacute;s, sans actions correctives syst&eacute;matiques, non r&eacute;guli&egrave;rement revus par le contr&ocirc;le interne ni r&eacute;guli&egrave;rement audit&eacute;s</li>
</ul>
<p>Formation</p>
<ul>
<li>Formation standard &agrave; l'ensemble des collaborateurs (pas de ciblage particulier des populations les plus concern&eacute;es)</li>
<li>Pas de plan de formation &eacute;tabli ou non mis &agrave; jour</li>
<li>Taux de formation perfectible (entre 50% et 90%)</li>
<li>Absence de relances syst&eacute;matiques des collaborateurs</li>
</ul>
    `,
    efficace: `
        <p>Gouvernance</p>
     <ul>
<li>Engagement actif du management (proactivit&eacute; dans la d&eacute;finition des principes d'&eacute;thique et de conformit&eacute;, implication forte dans le suivi et les d&eacute;cisions, sujet r&eacute;current &agrave; l'ordre du jour des comit&eacute;s de direction, etc.)</li>
<li>Communications r&eacute;guli&egrave;res sur le respect des principes d'&eacute;thique et de conformit&eacute; (plan de communication d&eacute;fini)</li>
<li>Equipe en charge de la fonction Ethique et Conformit&eacute; (temps d&eacute;di&eacute; suffisant) et Comit&eacute; Ethique et Conformit&eacute; en place et actif</li>
<li>Reporting r&eacute;gulier au management sur le suivi des actions</li>
</ul>
<p>Proc&eacute;dures et contr&ocirc;les</p>
<ul>
<li>Proc&eacute;dures syst&eacute;matiquement formalis&eacute;es, diffus&eacute;es, appliqu&eacute;es, contr&ocirc;l&eacute;es et audit&eacute;es</li>
<li>Contr&ocirc;les syst&eacute;matiques, formalis&eacute;s et document&eacute;s, faisant l'objet d'actions correctives, de revues de contr&ocirc;le interne et d'audits</li>
</ul>
<p>Formation</p>
<ul>
<li>Formations r&eacute;guli&egrave;res d&eacute;di&eacute;es selon les populations cibl&eacute;es, privil&eacute;giant le pr&eacute;sentiel pour les populations les plus expos&eacute;es</li>
<li>Plan de formation &eacute;tabli selon les populations cibl&eacute;es, int&eacute;grant les nouveaux arrivants et d&eacute;finissant les fr&eacute;quences de formation</li>
<li>Taux de formation &eacute;lev&eacute; (&ge; 90%)</li>
</ul>
    `
});

window.RISK_PROBABILITY_INFO = RISK_PROBABILITY_INFO;
window.RISK_IMPACT_INFO = RISK_IMPACT_INFO;
window.RISK_STATE_CONFIG = RISK_STATE_CONFIG;
window.MITIGATION_EFFECTIVENESS_DESCRIPTIONS = MITIGATION_EFFECTIVENESS_DESCRIPTIONS;
