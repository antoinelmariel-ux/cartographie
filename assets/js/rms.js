// Enhanced Risk Management System

// Sanitize a string for safe DOM id usage
function sanitizeId(str) {
    return str.replace(/[^a-z0-9_-]/gi, '_');
}

function escapeForAttribute(str) {
    return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

class RiskManagementSystem {
    constructor() {
        this.risks = this.loadData('risks') || this.getDefaultRisks();
        this.controls = this.loadData('controls') || this.getDefaultControls();
        this.actionPlans = this.loadData('actionPlans') || [];
        this.history = this.loadData('history') || [];
        this.config = this.loadConfig() || this.getDefaultConfig();
        this.currentView = 'brut';
        this.currentTab = 'dashboard';
        this.filters = {
            process: '',
            type: '',
            status: '',
            search: ''
        };
        this.activeConfigEdit = null;
        this.activeSubProcessEdit = null;
        this.risks.forEach(r => {
            if (!r.actionPlans || r.actionPlans.length === 0) {
                r.probPost = r.probNet;
                r.impactPost = r.impactNet;
            }
        });
        this.init();
    }

    init() {
        this.populateSelects();
        this.initializeMatrix();
        this.updateDashboard();
        this.updateRisksList();
        this.updateControlsList();
        this.updateActionPlansList();
        this.updateHistory();
        this.saveData();
        this.updateLastSaveTime();
        
        // Auto-save every 30 seconds
        setInterval(() => this.autoSave(), 30000);
    }

    getDefaultRisks() {
        return [
            {
                id: 1,
                processus: "R&D",
                sousProcessus: "Études cliniques",
                description: "Corruption d'investigateurs pour favoriser inclusion patients",
                typeCorruption: "active",
                typeTiers: "Médecins",
                tiers: ["Professionnels de santé"],
                probBrut: 3, impactBrut: 4,
                probNet: 2, impactNet: 3,
                probPost: 1, impactPost: 2,
                statut: "en-cours",
                responsable: "Dr. Martin",
                dateCreation: "2024-01-15",
                controls: [1, 2]
            },
            {
                id: 2,
                processus: "Achats",
                sousProcessus: "Appels d'offres",
                description: "Favoritisme dans attribution marchés",
                typeCorruption: "favoritisme",
                typeTiers: "Fournisseurs",
                tiers: ["Acheteurs"],
                probBrut: 3, impactBrut: 4,  // Même position que risque 1
                probNet: 2, impactNet: 2,
                probPost: 1, impactPost: 2,
                statut: "traite",
                responsable: "M. Durand",
                dateCreation: "2024-01-20",
                controls: [3]
            },
            {
                id: 3,
                processus: "Marketing",
                sousProcessus: "Événements",
                description: "Avantages indus lors d'événements médicaux",
                typeCorruption: "cadeaux",
                typeTiers: "Médecins",
                tiers: ["Professionnels de santé"],
                probBrut: 4, impactBrut: 3,
                probNet: 2, impactNet: 3,  // Même position que risque 1
                probPost: 1, impactPost: 2,
                statut: "nouveau",
                responsable: "Mme. Leroy",
                dateCreation: "2024-02-01",
                controls: [1, 4]
            },
            {
                id: 4,
                processus: "Ventes",
                sousProcessus: "Négociation",
                description: "Corruption d'acheteurs hospitaliers",
                typeCorruption: "active",
                typeTiers: "Hôpitaux publics",
                tiers: ["Acheteurs"],
                probBrut: 3, impactBrut: 4,  // Même position que risques 1 et 2
                probNet: 2, impactNet: 3,  // Même position que risques 1 et 3
                probPost: 1, impactPost: 1,
                statut: "en-cours",
                responsable: "M. Bernard",
                dateCreation: "2024-01-10",
                controls: [2, 3]
            },
            {
                id: 5,
                processus: "RH",
                sousProcessus: "Recrutement",
                description: "Embauche famille/proches décideurs publics",
                typeCorruption: "trafic",
                typeTiers: "Administrations",
                tiers: ["Politiques"],
                probBrut: 2, impactBrut: 3,
                probNet: 1, impactNet: 2,
                probPost: 1, impactPost: 1,  // Même position que risque 4
                statut: "validé",
                responsable: "Mme. Petit",
                dateCreation: "2024-01-25",
                controls: [1]
            },
            {
                id: 6,
                processus: "Production",
                sousProcessus: "Contrôle qualité",
                description: "Falsification certificats pour accélérer mise sur marché",
                typeCorruption: "passive",
                typeTiers: "Organismes certificateurs",
                tiers: ["Institutionnels"],
                probBrut: 2, impactBrut: 4,
                probNet: 1, impactNet: 3,
                probPost: 1, impactPost: 2,
                statut: "nouveau",
                responsable: "M. Moreau",
                dateCreation: "2024-02-05",
                controls: [2, 3, 4]
            },
            {
                id: 7,
                processus: "Finance",
                sousProcessus: "Paiements",
                description: "Facilitation payments pour déblocage douane",
                typeCorruption: "active",
                typeTiers: "Douanes",
                tiers: ["Institutionnels"],
                probBrut: 3, impactBrut: 3,
                probNet: 2, impactNet: 2,
                probPost: 1, impactPost: 1,  // Même position que risques 4 et 5
                statut: "en-cours",
                responsable: "Mme. Dubois",
                dateCreation: "2024-02-10",
                controls: [1, 2]
            },
            {
                id: 8,
                processus: "Juridique",
                sousProcessus: "Contrats",
                description: "Clauses secrètes avantageant certains partenaires",
                typeCorruption: "favoritisme",
                typeTiers: "Partenaires commerciaux",
                tiers: ["Collaborateurs"],
                probBrut: 2, impactBrut: 3,
                probNet: 1, impactNet: 2,
                probPost: 1, impactPost: 1,  // Même position que risques 4, 5 et 7
                statut: "traite",
                responsable: "Me. Lambert",
                dateCreation: "2024-01-30",
                controls: [3, 4]
            }
        ];
    }

    getDefaultControls() {
        return [
            {
                id: 1,
                name: "Procédure de validation des dépenses",
                description: "Double validation pour toute dépense > 1000€",
                effectiveness: "forte",
                type: "preventif",
                owner: "Directeur Financier",
                frequency: "quotidienne",
                mode: "manuel",
                status: "actif",
                risks: [1, 2],
                dateCreation: "2024-01-01"
            },
            {
                id: 2,
                name: "Due diligence tiers",
                description: "Vérification approfondie de tous les nouveaux partenaires",
                effectiveness: "forte",
                type: "preventif",
                owner: "Service Juridique",
                frequency: "ad-hoc",
                mode: "manuel",
                status: "actif",
                risks: [3, 4],
                dateCreation: "2024-01-01"
            },
            {
                id: 3,
                name: "Audit interne trimestriel",
                description: "Revue complète des processus à risque",
                effectiveness: "moyenne",
                type: "detectif",
                owner: "Audit Interne",
                frequency: "mensuelle",
                mode: "manuel",
                status: "actif",
                risks: [5, 6],
                dateCreation: "2024-01-01"
            },
            {
                id: 4,
                name: "Formation anti-corruption",
                description: "Formation obligatoire annuelle pour tous les employés",
                effectiveness: "moyenne",
                type: "preventif",
                owner: "Ressources Humaines",
                frequency: "annuelle",
                mode: "manuel",
                status: "actif",
                risks: [7, 8],
                dateCreation: "2024-01-01"
            }
        ];
    }

    getDefaultConfig() {
        return {
            processes: [
                { value: 'R&D', label: 'R&D' },
                { value: 'Achats', label: 'Achats' },
                { value: 'Marketing', label: 'Marketing' },
                { value: 'Ventes', label: 'Ventes' },
                { value: 'RH', label: 'RH' },
                { value: 'Production', label: 'Production' },
                { value: 'Finance', label: 'Finance' },
                { value: 'Juridique', label: 'Juridique' }
            ],
            subProcesses: {
                'R&D': [
                    { value: 'Recherche fondamentale', label: 'Recherche fondamentale' },
                    { value: 'Développement préclinique', label: 'Développement préclinique' },
                    { value: 'Études cliniques', label: 'Études cliniques' },
                    { value: 'Affaires réglementaires', label: 'Affaires réglementaires' },
                    { value: 'Pharmacovigilance', label: 'Pharmacovigilance' }
                ],
                'Achats': [
                    { value: 'Sourcing fournisseurs', label: 'Sourcing fournisseurs' },
                    { value: "Appels d'offres", label: "Appels d'offres" },
                    { value: 'Négociation/contrats', label: 'Négociation/contrats' },
                    { value: 'Gestion des commandes', label: 'Gestion des commandes' },
                    { value: 'Réception et contrôles', label: 'Réception et contrôles' }
                ],
                'Marketing': [
                    { value: 'Études de marché', label: 'Études de marché' },
                    { value: 'Promotion médicale', label: 'Promotion médicale' },
                    { value: 'Communication digitale', label: 'Communication digitale' },
                    { value: "Organisation d’événements", label: "Organisation d’événements" },
                    { value: 'Gestion de la marque', label: 'Gestion de la marque' }
                ],
                'Ventes': [
                    { value: 'Prospection commerciale', label: 'Prospection commerciale' },
                    { value: "Soumissions d’offres", label: "Soumissions d’offres" },
                    { value: 'Négociation/contrats', label: 'Négociation/contrats' },
                    { value: 'Distribution', label: 'Distribution' },
                    { value: 'Suivi client', label: 'Suivi client' }
                ],
                'RH': [
                    { value: 'Recrutement', label: 'Recrutement' },
                    { value: 'Gestion des carrières', label: 'Gestion des carrières' },
                    { value: 'Formation', label: 'Formation' },
                    { value: 'Paie et avantages sociaux', label: 'Paie et avantages sociaux' },
                    { value: 'Évaluation des performances', label: 'Évaluation des performances' }
                ],
                'Production': [
                    { value: 'Planification', label: 'Planification' },
                    { value: 'Approvisionnement en matières premières', label: 'Approvisionnement en matières premières' },
                    { value: 'Fabrication', label: 'Fabrication' },
                    { value: 'Contrôle qualité', label: 'Contrôle qualité' },
                    { value: 'Libération des lots', label: 'Libération des lots' },
                    { value: 'Maintenance des équipements', label: 'Maintenance des équipements' }
                ],
                'Finance': [
                    { value: 'Comptabilité fournisseurs', label: 'Comptabilité fournisseurs' },
                    { value: 'Comptabilité clients', label: 'Comptabilité clients' },
                    { value: 'Trésorerie', label: 'Trésorerie' },
                    { value: 'Paiements', label: 'Paiements' },
                    { value: 'Contrôle de gestion', label: 'Contrôle de gestion' },
                    { value: 'Fiscalité', label: 'Fiscalité' }
                ],
                'Juridique': [
                    { value: 'Rédaction/gestion des contrats', label: 'Rédaction/gestion des contrats' },
                    { value: 'Veille réglementaire', label: 'Veille réglementaire' },
                    { value: 'Gestion des litiges', label: 'Gestion des litiges' },
                    { value: 'Propriété intellectuelle', label: 'Propriété intellectuelle' },
                    { value: 'Conformité & éthique', label: 'Conformité & éthique' }
                ]
            },
            riskTypes: [
                { value: 'active', label: 'Corruption active' },
                { value: 'passive', label: 'Corruption passive' },
                { value: 'trafic', label: "Trafic d'influence" },
                { value: 'favoritisme', label: 'Favoritisme' },
                { value: 'cadeaux', label: 'Cadeaux/avantages indus' }
            ],
            tiers: [
                { value: 'Professionnels de santé', label: 'Professionnels de santé' },
                { value: 'Institutionnels', label: 'Institutionnels' },
                { value: 'Acheteurs', label: 'Acheteurs' },
                { value: 'Politiques', label: 'Politiques' },
                { value: 'Collaborateurs', label: 'Collaborateurs' }
            ],
            riskStatuses: [
                { value: 'nouveau', label: 'Nouveau' },
                { value: 'en-cours', label: 'En cours de traitement' },
                { value: 'traite', label: 'Traité' },
                { value: 'archive', label: 'Archivé' }
            ],
            controlTypes: [
                { value: 'preventif', label: 'Préventif' },
                { value: 'detectif', label: 'Détectif' }
            ],
            controlFrequencies: [
                { value: 'quotidienne', label: 'Quotidienne' },
                { value: 'mensuelle', label: 'Mensuelle' },
                { value: 'annuelle', label: 'Annuelle' },
                { value: 'ad-hoc', label: 'Ad hoc' }
            ],
            controlModes: [
                { value: 'manuel', label: 'Manuel' },
                { value: 'automatise', label: 'Automatisé' }
            ],
            controlEffectiveness: [
                { value: 'forte', label: 'Forte' },
                { value: 'moyenne', label: 'Moyenne' },
                { value: 'faible', label: 'Faible' }
            ],
            controlStatuses: [
                { value: 'actif', label: 'Actif' },
                { value: 'en-mise-en-place', label: 'En mise en place' },
                { value: 'en-revision', label: 'En cours de révision' },
                { value: 'obsolete', label: 'Obsolète' }
            ]
        };
    }

    loadConfig() {
        const data = localStorage.getItem('rms_config');
        return data ? JSON.parse(data) : null;
    }

    saveConfig() {
        localStorage.setItem('rms_config', JSON.stringify(this.config));
    }

    populateSelects() {
        const fill = (id, options, placeholder) => {
            const el = document.getElementById(id);
            if (!el) return;
            const current = el.value;
            el.innerHTML = '';
            if (placeholder !== undefined) {
                const opt = document.createElement('option');
                opt.value = '';
                opt.textContent = placeholder;
                el.appendChild(opt);
            }
            options.forEach(o => {
                const opt = document.createElement('option');
                opt.value = o.value;
                opt.textContent = o.label;
                el.appendChild(opt);
            });
            if (current && options.some(o => o.value === current)) {
                el.value = current;
            }
        };

        fill('processFilter', this.config.processes, 'Tous les processus');
        fill('riskTypeFilter', this.config.riskTypes, 'Tous les types');
        fill('statusFilter', this.config.riskStatuses, 'Tous les statuts');
        fill('processus', this.config.processes, 'Sélectionner...');
        this.updateSousProcessusOptions();
        fill('typeCorruption', this.config.riskTypes, 'Sélectionner...');
        fill('tiers', this.config.tiers);
        fill('controlType', this.config.controlTypes, 'Sélectionner...');
        fill('controlFrequency', this.config.controlFrequencies, 'Sélectionner...');
        fill('controlMode', this.config.controlModes, 'Sélectionner...');
        fill('controlEffectiveness', this.config.controlEffectiveness, 'Sélectionner...');
        fill('controlStatus', this.config.controlStatuses, 'Sélectionner...');
    }

    renderConfiguration() {
        const container = document.getElementById('configurationContainer');
        if (!container) return;

        const sections = [
            {
                key: 'processes',
                label: 'Processus',
                description: 'Structurez les processus métiers utilisés dans l\'ensemble de la cartographie.'
            },
            {
                key: 'riskTypes',
                label: 'Types de corruption',
                description: 'Définissez les typologies de risques disponibles lors de la création d\'une fiche risque.'
            },
            {
                key: 'tiers',
                label: 'Tiers',
                description: 'Gérez les catégories de tiers suivies dans vos analyses de risques.'
            },
            {
                key: 'riskStatuses',
                label: 'Statuts des risques',
                description: 'Personnalisez les statuts utilisés pour piloter l\'avancement des risques.'
            },
            {
                key: 'controlTypes',
                label: 'Types de contrôle',
                description: 'Listez les types de contrôles disponibles pour les plans de maîtrise.'
            },
            {
                key: 'controlFrequencies',
                label: 'Fréquences des contrôles',
                description: 'Indiquez les périodicités proposées lors de la création d\'un contrôle.'
            },
            {
                key: 'controlModes',
                label: "Modes d'exécution",
                description: 'Précisez comment les contrôles peuvent être réalisés (manuel, automatisé...).'
            },
            {
                key: 'controlEffectiveness',
                label: 'Efficacités',
                description: "Définissez les niveaux d'efficacité pour évaluer vos contrôles."
            },
            {
                key: 'controlStatuses',
                label: 'Statuts des contrôles',
                description: 'Suivez la vie de vos contrôles grâce à des statuts adaptés.'
            }
        ];

        container.innerHTML = `
            <div class="config-intro">
                <h2>Personnalisez vos référentiels</h2>
                <p>Ajoutez, éditez ou supprimez les valeurs utilisées dans les formulaires afin d\'adapter l\'outil à votre organisation.</p>
            </div>
            <div class="config-grid">
                ${sections.map(section => `
                    <article class="config-card" data-config-key="${section.key}">
                        <div class="config-card-header">
                            <div class="config-card-text">
                                <h3>${section.label}</h3>
                                <p>${section.description}</p>
                            </div>
                            <span class="config-pill" data-config-count="${section.key}">${this.formatCountLabel((this.config[section.key] || []).length)}</span>
                        </div>
                        <ul id="list-${section.key}" class="config-list"></ul>
                        <div class="config-add">
                            <div class="config-add-field">
                                <label for="input-${section.key}-label">Libellé affiché</label>
                                <input type="text" id="input-${section.key}-label" placeholder="Ex : Process Achats" oninput="rms.autoFillValue('input-${section.key}-value', 'input-${section.key}-label')">
                            </div>
                            <div class="config-add-field">
                                <label for="input-${section.key}-value">Code interne</label>
                                <input type="text" id="input-${section.key}-value" placeholder="Ex : Achats" oninput="rms.markInputManual('input-${section.key}-value')">
                            </div>
                            <button class="btn btn-secondary config-add-btn" onclick="rms.addConfigOption('${section.key}')">+ Ajouter</button>
                        </div>
                    </article>
                `).join('')}
            </div>
        `;

        const subSection = document.createElement('article');
        subSection.className = 'config-card config-card--full';
        subSection.innerHTML = `
            <div class="config-card-header">
                <div class="config-card-text">
                    <h3>Sous-processus</h3>
                    <p>Déclarez les sous-processus propres à chaque processus. Ils alimentent automatiquement les formulaires risques.</p>
                </div>
            </div>
            <div id="subProcessConfig" class="config-subprocess-grid"></div>
        `;
        container.appendChild(subSection);

        this.refreshConfigLists();
        this.renderSubProcessConfig();
    }

    formatCountLabel(count) {
        return `${count} valeur${count > 1 ? 's' : ''}`;
    }

    getConfigLabel(key) {
        const labels = {
            processes: 'Processus',
            riskTypes: 'Types de corruption',
            tiers: 'Tiers',
            riskStatuses: 'Statuts des risques',
            controlTypes: 'Types de contrôle',
            controlFrequencies: 'Fréquences des contrôles',
            controlModes: "Modes d'exécution",
            controlEffectiveness: 'Efficacités',
            controlStatuses: 'Statuts des contrôles'
        };
        return labels[key] || key;
    }

    autoFillValue(valueInputId, labelInputId) {
        const valueInput = document.getElementById(valueInputId);
        const labelInput = document.getElementById(labelInputId);
        if (!valueInput || !labelInput) return;
        if (valueInput.dataset.manual === 'true' && valueInput.value.trim() !== '') return;
        const generated = this.generateValueFromLabel(labelInput.value);
        if (!generated) {
            valueInput.value = '';
            this.markInputManual(valueInputId, false);
            return;
        }
        valueInput.value = generated;
    }

    markInputManual(valueInputId, manual = true) {
        const input = document.getElementById(valueInputId);
        if (!input) return;
        if (manual && input.value.trim() !== '') {
            input.dataset.manual = 'true';
        } else if (!manual) {
            delete input.dataset.manual;
        }
    }

    generateValueFromLabel(label) {
        return label
            .replace(/\s+/g, ' ')
            .trim();
    }

    startConfigEdit(key, index) {
        this.activeConfigEdit = { key, index };
        this.refreshConfigLists();
    }

    cancelConfigEdit() {
        this.activeConfigEdit = null;
        this.refreshConfigLists();
    }

    saveConfigEdit(key, index) {
        if (!this.config[key] || !this.config[key][index]) return;
        const option = this.config[key][index];
        const editLabelInput = document.getElementById(`edit-${key}-${index}-label`);
        const editValueInput = document.getElementById(`edit-${key}-${index}-value`);
        if (!editLabelInput || !editValueInput) return;
        const label = editLabelInput.value.trim();
        const value = editValueInput.value.trim();
        if (!value || !label) {
            showNotification('error', 'Merci de renseigner un libellé et un code interne.');
            return;
        }

        const oldValue = option.value;
        option.value = value;
        option.label = label;
        this.config[key][index] = option;
        this.saveConfig();
        this.populateSelects();

        if (key === 'processes') {
            if (oldValue !== value) {
                this.config.subProcesses[value] = this.config.subProcesses[oldValue] || [];
                delete this.config.subProcesses[oldValue];
                if (this.activeSubProcessEdit && this.activeSubProcessEdit.process === oldValue) {
                    this.activeSubProcessEdit = null;
                }
                if (this.filters.process === oldValue) {
                    this.filters.process = value;
                }
                this.risks.forEach(risk => {
                    if (risk.processus === oldValue) {
                        risk.processus = value;
                    }
                });
                this.saveData();
                this.updateRisksList();
                this.initializeMatrix();
                this.updateDashboard();
                const processSelect = document.getElementById('processus');
                if (processSelect && processSelect.value === oldValue) {
                    processSelect.value = value;
                }
                const filterSelect = document.getElementById('processFilter');
                if (filterSelect && filterSelect.value === oldValue) {
                    filterSelect.value = value;
                }
            }
            this.renderConfiguration();
        } else {
            this.refreshConfigLists();
        }

        this.activeConfigEdit = null;
        showNotification('success', `Valeur mise à jour dans « ${this.getConfigLabel(key)} ».`);
    }

    startSubProcessEdit(process, index) {
        this.activeSubProcessEdit = { process, index };
        this.refreshSubProcessLists();
    }

    cancelSubProcessEdit() {
        this.activeSubProcessEdit = null;
        this.refreshSubProcessLists();
    }

    saveSubProcessEdit(process, index) {
        if (!this.config.subProcesses[process] || !this.config.subProcesses[process][index]) return;
        const procId = sanitizeId(process);
        const editLabelInput = document.getElementById(`edit-sub-${procId}-${index}-label`);
        const editValueInput = document.getElementById(`edit-sub-${procId}-${index}-value`);
        if (!editLabelInput || !editValueInput) return;
        const label = editLabelInput.value.trim();
        const value = editValueInput.value.trim();
        if (!value || !label) {
            showNotification('error', 'Merci de renseigner un libellé et un code interne.');
            return;
        }

        const subProcess = this.config.subProcesses[process][index];
        const oldValue = subProcess.value;
        subProcess.label = label;
        subProcess.value = value;
        this.config.subProcesses[process][index] = subProcess;
        this.saveConfig();
        this.updateSousProcessusOptions();
        this.refreshSubProcessLists();

        if (oldValue !== value) {
            this.risks.forEach(risk => {
                if (risk.processus === process && risk.sousProcessus === oldValue) {
                    risk.sousProcessus = value;
                }
            });
            this.saveData();
            this.updateRisksList();
            this.initializeMatrix();
        }

        this.activeSubProcessEdit = null;
        showNotification('success', `Sous-processus « ${label} » mis à jour.`);
    }

    refreshConfigLists() {
        const updateList = (key) => {
            const list = document.getElementById(`list-${key}`);
            if (!list) return;
            const options = this.config[key] || [];
            if (!options.length) {
                list.innerHTML = `<li class="config-list-empty">Aucune valeur pour le moment.</li>`;
            } else {
                list.innerHTML = options
                    .map((opt, idx) => {
                        const isEditing = this.activeConfigEdit && this.activeConfigEdit.key === key && this.activeConfigEdit.index === idx;
                        if (isEditing) {
                            const editLabelId = `edit-${key}-${idx}-label`;
                            const editValueId = `edit-${key}-${idx}-value`;
                            return `
                                <li class="config-item editing">
                                    <div class="config-item-fields">
                                        <input type="text" id="${editLabelId}" value="${opt.label}" placeholder="Libellé">
                                        <input type="text" id="${editValueId}" value="${opt.value}" placeholder="Code interne">
                                    </div>
                                    <div class="config-item-actions">
                                        <button class="config-icon-btn config-icon-btn--success" onclick="rms.saveConfigEdit('${key}', ${idx})">💾 <span>Sauvegarder</span></button>
                                        <button class="config-icon-btn" onclick="rms.cancelConfigEdit()">↩️ <span>Annuler</span></button>
                                    </div>
                                </li>
                            `;
                        }
                        return `
                            <li class="config-item">
                                <div class="config-item-info">
                                    <span class="config-item-label">${opt.label}</span>
                                    <span class="config-item-value">${opt.value}</span>
                                </div>
                                <div class="config-item-actions">
                                    <button class="config-icon-btn" onclick="rms.startConfigEdit('${key}', ${idx})">✏️ <span>Modifier</span></button>
                                    <button class="config-icon-btn config-icon-btn--danger" onclick="rms.removeConfigOption('${key}', ${idx})">🗑️ <span>Supprimer</span></button>
                                </div>
                            </li>
                        `;
                    })
                    .join('');
            }

            const counter = document.querySelector(`[data-config-count='${key}']`);
            if (counter) {
                counter.textContent = this.formatCountLabel(options.length);
            }
        };

        Object.keys(this.config).filter(k => k !== 'subProcesses').forEach(updateList);
    }

    addConfigOption(key) {
        const valueInput = document.getElementById(`input-${key}-value`);
        const labelInput = document.getElementById(`input-${key}-label`);
        if (!valueInput || !labelInput) return;
        const value = valueInput.value.trim();
        const label = labelInput.value.trim();
        if (!value || !label) {
            showNotification('error', 'Merci de renseigner un libellé et un code interne.');
            return;
        }

        this.config[key] = this.config[key] || [];
        this.config[key].push({ value, label });
        valueInput.value = '';
        labelInput.value = '';
        this.markInputManual(`input-${key}-value`, false);
        if (key === 'processes') {
            this.config.subProcesses[value] = [];
            this.saveConfig();
            this.populateSelects();
            this.renderConfiguration();
        } else {
            this.saveConfig();
            this.populateSelects();
            this.refreshConfigLists();
        }
        showNotification('success', `« ${label} » ajouté à « ${this.getConfigLabel(key)} ».`);
    }

    removeConfigOption(key, index) {
        if (!this.config[key] || !this.config[key][index]) return;

        if (this.activeConfigEdit && this.activeConfigEdit.key === key && this.activeConfigEdit.index === index) {
            this.activeConfigEdit = null;
        }

        if (key === 'processes') {
            const removed = this.config.processes.splice(index, 1)[0];
            if (!removed) return;
            delete this.config.subProcesses[removed.value];
            if (this.activeSubProcessEdit && this.activeSubProcessEdit.process === removed.value) {
                this.activeSubProcessEdit = null;
            }
            if (this.filters.process === removed.value) {
                this.filters.process = '';
            }
            this.risks.forEach(risk => {
                if (risk.processus === removed.value) {
                    risk.processus = '';
                    risk.sousProcessus = '';
                }
            });
            this.saveData();
            this.updateRisksList();
            this.initializeMatrix();
            this.updateDashboard();
            this.saveConfig();
            this.populateSelects();
            this.renderConfiguration();
            showNotification('success', `Processus « ${removed.label} » supprimé.`);
        } else {
            const removed = this.config[key].splice(index, 1)[0];
            this.saveConfig();
            this.populateSelects();
            this.refreshConfigLists();
            if (removed) {
                showNotification('success', `« ${removed.label} » supprimé de « ${this.getConfigLabel(key)} ».`);
            }
        }
    }

    renderSubProcessConfig() {
        const container = document.getElementById('subProcessConfig');
        if (!container) return;
        container.innerHTML = '';
        if (!this.config.processes.length) {
            container.innerHTML = '<div class="config-empty-hint">Ajoutez d\'abord un processus pour définir ses sous-processus.</div>';
            return;
        }

        this.config.processes.forEach(proc => {
            const block = document.createElement('article');
            block.className = 'config-card config-card--nested';
            const procId = sanitizeId(proc.value);
            const safeValue = escapeForAttribute(proc.value);
            const listId = `list-sub-${procId}`;
            block.innerHTML = `
                <div class="config-card-header">
                    <div class="config-card-text">
                        <h4>${proc.label}</h4>
                        <p>Valeurs proposées pour le processus ${proc.label}.</p>
                    </div>
                    <span class="config-pill" data-subprocess-count="${procId}">${this.formatCountLabel((this.config.subProcesses[proc.value] || []).length)}</span>
                </div>
                <ul id="${listId}" class="config-list config-list--sub"></ul>
                <div class="config-add">
                    <div class="config-add-field">
                        <label for="input-sub-${procId}-label">Libellé affiché</label>
                        <input type="text" id="input-sub-${procId}-label" placeholder="Ex : Études cliniques" oninput="rms.autoFillValue('input-sub-${procId}-value', 'input-sub-${procId}-label')">
                    </div>
                    <div class="config-add-field">
                        <label for="input-sub-${procId}-value">Code interne</label>
                        <input type="text" id="input-sub-${procId}-value" placeholder="Ex : etudes_cliniques" oninput="rms.markInputManual('input-sub-${procId}-value')">
                    </div>
                    <button class="btn btn-secondary config-add-btn" onclick="rms.addSubProcess('${safeValue}')">+ Ajouter</button>
                </div>
            `;
            container.appendChild(block);
        });
        this.refreshSubProcessLists();
    }

    refreshSubProcessLists() {
        this.config.processes.forEach(proc => {
            const procId = sanitizeId(proc.value);
            const list = document.getElementById(`list-sub-${procId}`);
            if (!list) return;
            const subs = this.config.subProcesses[proc.value] || [];
            if (!subs.length) {
                list.innerHTML = `<li class="config-list-empty">Aucun sous-processus enregistré.</li>`;
            } else {
                const safeValue = escapeForAttribute(proc.value);
                list.innerHTML = subs
                    .map((sp, idx) => {
                        const isEditing = this.activeSubProcessEdit && this.activeSubProcessEdit.process === proc.value && this.activeSubProcessEdit.index === idx;
                        if (isEditing) {
                            const editLabelId = `edit-sub-${procId}-${idx}-label`;
                            const editValueId = `edit-sub-${procId}-${idx}-value`;
                            return `
                                <li class="config-item editing">
                                    <div class="config-item-fields">
                                        <input type="text" id="${editLabelId}" value="${sp.label}" placeholder="Libellé">
                                        <input type="text" id="${editValueId}" value="${sp.value}" placeholder="Code interne">
                                    </div>
                                    <div class="config-item-actions">
                                        <button class="config-icon-btn config-icon-btn--success" onclick="rms.saveSubProcessEdit('${safeValue}', ${idx})">💾 <span>Sauvegarder</span></button>
                                        <button class="config-icon-btn" onclick="rms.cancelSubProcessEdit()">↩️ <span>Annuler</span></button>
                                    </div>
                                </li>
                            `;
                        }
                        return `
                            <li class="config-item">
                                <div class="config-item-info">
                                    <span class="config-item-label">${sp.label}</span>
                                    <span class="config-item-value">${sp.value}</span>
                                </div>
                                <div class="config-item-actions">
                                    <button class="config-icon-btn" onclick="rms.startSubProcessEdit('${safeValue}', ${idx})">✏️ <span>Modifier</span></button>
                                    <button class="config-icon-btn config-icon-btn--danger" onclick="rms.removeSubProcess('${safeValue}', ${idx})">🗑️ <span>Supprimer</span></button>
                                </div>
                            </li>
                        `;
                    })
                    .join('');
            }

            const counter = document.querySelector(`[data-subprocess-count='${procId}']`);
            if (counter) {
                counter.textContent = this.formatCountLabel(subs.length);
            }
        });
    }

    addSubProcess(process) {
        const procId = sanitizeId(process);
        const valueInput = document.getElementById(`input-sub-${procId}-value`);
        const labelInput = document.getElementById(`input-sub-${procId}-label`);
        if (!valueInput || !labelInput) return;
        const value = valueInput.value.trim();
        const label = labelInput.value.trim();
        if (!value || !label) {
            showNotification('error', 'Merci de renseigner un libellé et un code interne.');
            return;
        }
        this.config.subProcesses[process] = this.config.subProcesses[process] || [];
        this.config.subProcesses[process].push({ value, label });
        this.saveConfig();
        this.updateSousProcessusOptions();
        this.refreshSubProcessLists();
        valueInput.value = '';
        labelInput.value = '';
        this.markInputManual(`input-sub-${procId}-value`, false);
        showNotification('success', `« ${label} » ajouté au processus « ${process} ».`);
    }

    removeSubProcess(process, index) {
        if (!this.config.subProcesses[process]) return;
        const removed = this.config.subProcesses[process].splice(index, 1)[0];
        if (this.activeSubProcessEdit && this.activeSubProcessEdit.process === process && this.activeSubProcessEdit.index === index) {
            this.activeSubProcessEdit = null;
        }
        this.risks.forEach(risk => {
            if (risk.processus === process && risk.sousProcessus === (removed ? removed.value : '')) {
                risk.sousProcessus = '';
            }
        });
        this.saveData();
        this.updateRisksList();
        this.initializeMatrix();
        this.saveConfig();
        this.updateSousProcessusOptions();
        this.refreshSubProcessLists();
        if (removed) {
            showNotification('success', `Sous-processus « ${removed.label} » supprimé du processus « ${process} ».`);
        }
    }

    updateSousProcessusOptions() {
        const processSelect = document.getElementById('processus');
        const sousSelect = document.getElementById('sousProcessus');
        if (!processSelect || !sousSelect) return;
        const current = sousSelect.value;
        const proc = processSelect.value;
        sousSelect.innerHTML = '';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Sélectionner...';
        sousSelect.appendChild(placeholder);
        if (proc && this.config.subProcesses[proc]) {
            this.config.subProcesses[proc].forEach(sp => {
                const opt = document.createElement('option');
                opt.value = sp.value;
                opt.textContent = sp.label;
                sousSelect.appendChild(opt);
            });
        }
        if (Array.from(sousSelect.options).some(o => o.value === current)) {
            sousSelect.value = current;
        } else {
            sousSelect.value = '';
        }
    }

    // Data persistence
    saveData() {
        localStorage.setItem('rms_risks', JSON.stringify(this.risks));
        localStorage.setItem('rms_controls', JSON.stringify(this.controls));
        localStorage.setItem('rms_actionPlans', JSON.stringify(this.actionPlans));
        localStorage.setItem('rms_history', JSON.stringify(this.history));
    }

    loadData(key) {
        const data = localStorage.getItem(`rms_${key}`);
        return data ? JSON.parse(data) : null;
    }

    autoSave() {
        this.saveData();
        this.updateLastSaveTime();
        showNotification('info', 'Sauvegarde automatique effectuée');
    }

    updateLastSaveTime() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        document.getElementById('lastSaveTime').textContent = timeStr;
    }

    // Matrix functions
    initializeMatrix() {
        const grid = document.getElementById('matrixGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        for (let row = 4; row >= 1; row--) {
            for (let col = 1; col <= 4; col++) {
                const cell = document.createElement('div');
                cell.className = 'matrix-cell';
                cell.dataset.probability = row;
                cell.dataset.impact = col;
                
                const riskLevel = row * col;
                if (riskLevel <= 4) cell.classList.add('level-1');
                else if (riskLevel <= 8) cell.classList.add('level-2');
                else if (riskLevel <= 12) cell.classList.add('level-3');
                else cell.classList.add('level-4');
                
                grid.appendChild(cell);
            }
        }
        
        this.renderRiskPoints();
        this.updateRiskDetailsList();
    }

    renderRiskPoints() {
        // Remove existing points
        document.querySelectorAll('.risk-point').forEach(p => p.remove());
        
        const grid = document.getElementById('matrixGrid');
        if (!grid) return;
        
        const filteredRisks = this.getFilteredRisks();

        // Track how many risks are placed in each cell to offset duplicates
        const cellCounts = {};

        filteredRisks.forEach(risk => {
            let prob, impact;

            if (this.currentView === 'brut') {
                prob = risk.probBrut;
                impact = risk.impactBrut;
            } else if (this.currentView === 'net') {
                prob = risk.probNet;
                impact = risk.impactNet;
            } else {
                prob = risk.probPost;
                impact = risk.impactPost;
            }

            const leftPercent = ((impact - 0.5) / 4) * 100;
            const bottomPercent = ((prob - 0.5) / 4) * 100;

            // Calculate offset so that points do not overlap
            const key = `${prob}-${impact}`;
            const index = cellCounts[key] || 0;
            cellCounts[key] = index + 1;

            // Create point element and temporarily add it to the DOM to get its size
            const point = document.createElement('div');
            point.className = `risk-point ${this.currentView}`;
            point.dataset.riskId = risk.id;
            point.title = risk.description;
            point.onclick = () => this.selectRisk(risk.id);
            grid.appendChild(point);

            // Determine actual diameter and offset
            const diameter = point.offsetWidth;
            const margin = 4;
            const offset = diameter + margin;

            // Spread points around the center in eight directions
            const angle = index * Math.PI / 4;
            const dx = Math.cos(angle) * offset;
            const dy = Math.sin(angle) * offset;

            // Position the point
            point.style.left = `calc(${leftPercent}% + ${dx}px)`;
            point.style.bottom = `calc(${bottomPercent}% + ${dy}px)`;
            point.style.transform = 'translate(-50%, 50%)';
        });
    }

    getFilteredRisks() {
        return this.risks.filter(risk => {
            if (this.filters.process && !risk.processus.toLowerCase().includes(this.filters.process.toLowerCase())) {
                return false;
            }
            if (this.filters.type && risk.typeCorruption !== this.filters.type) {
                return false;
            }
            if (this.filters.status && risk.statut !== this.filters.status) {
                return false;
            }
            if (this.filters.search && !risk.description.toLowerCase().includes(this.filters.search.toLowerCase())) {
                return false;
            }
            return true;
        });
    }

    selectRisk(riskId) {
        const risk = this.risks.find(r => r.id === riskId);
        if (!risk) return;
        
        // Update selected state in details panel
        document.querySelectorAll('.risk-item').forEach(item => {
            item.classList.remove('selected');
            if (item.dataset.riskId == riskId) {
                item.classList.add('selected');
            }
        });
        
        // Show risk details
        this.showRiskDetails(risk);
    }

    showRiskDetails(risk) {
        // Could open a modal or update a details panel
        console.log('Risk details:', risk);
    }

    updateRiskDetailsList() {
        const container = document.getElementById('riskDetailsList');
        if (!container) return;
        
        const filteredRisks = this.getFilteredRisks();
        
        container.innerHTML = filteredRisks.map(risk => {
            let prob, impact;
            if (this.currentView === 'brut') {
                prob = risk.probBrut;
                impact = risk.impactBrut;
            } else if (this.currentView === 'net') {
                prob = risk.probNet;
                impact = risk.impactNet;
            } else {
                prob = risk.probPost;
                impact = risk.impactPost;
            }
            
            const score = prob * impact;
            let scoreClass = 'low';
            if (score > 12) scoreClass = 'critical';
            else if (score > 8) scoreClass = 'high';
            else if (score > 4) scoreClass = 'medium';
            
            const sp = risk.sousProcessus ? ` > ${risk.sousProcessus}` : '';
            return `
                <div class="risk-item" data-risk-id="${risk.id}" onclick="rms.selectRisk(${risk.id})">
                    <div class="risk-item-header">
                        <span class="risk-item-title">${risk.description}</span>
                        <span class="risk-item-score ${scoreClass}">${score}</span>
                    </div>
                    <div class="risk-item-meta">
                        ${risk.processus}${sp} • ${risk.responsable}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Dashboard functions
    updateDashboard() {
        // Update stats
        const stats = this.calculateStats();
        
        // Update KPI cards (if elements exist)
        // Update charts
        this.updateCharts();
    }

    calculateStats() {
        const stats = {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            total: this.risks.length
        };
        
        this.risks.forEach(risk => {
            const score = risk.probNet * risk.impactNet;
            if (score > 12) stats.critical++;
            else if (score > 8) stats.high++;
            else if (score > 4) stats.medium++;
            else stats.low++;
        });
        
        return stats;
    }

    updateCharts() {
        // Placeholder for chart updates
        // Would use Chart.js or similar library
    }

    // Risk list functions
    updateRisksList() {
        const tbody = document.getElementById('risksTableBody');
        if (!tbody) return;
        
        const filteredRisks = this.getFilteredRisks();
        
        tbody.innerHTML = filteredRisks.map(risk => `
            <tr>
                <td>#${risk.id}</td>
                <td>${risk.description}</td>
                <td>${risk.processus}</td>
                <td>${risk.sousProcessus || ''}</td>
                <td>${risk.typeCorruption}</td>
                <td>${(risk.tiers || []).join(', ')}</td>
                <td>${risk.probBrut * risk.impactBrut}</td>
                <td>${risk.probNet * risk.impactNet}</td>
                <td>${risk.probPost * risk.impactPost}</td>
                <td><span class="table-badge badge-${risk.statut === 'traite' ? 'success' : risk.statut === 'en-cours' ? 'warning' : 'danger'}">${risk.statut}</span></td>
                <td>${risk.responsable}</td>
                <td class="table-actions-cell">
                    <button class="action-btn" onclick="rms.editRisk(${risk.id})">✏️</button>
                    <button class="action-btn" onclick="rms.deleteRisk(${risk.id})">🗑️</button>
                </td>
            </tr>
        `).join('');
    }

    // Controls functions
    updateControlsList() {
        const container = document.getElementById('controlsList');
        if (!container) return;
        
        container.innerHTML = this.controls.map(control => {
            // Récupérer les risques couverts
            const coveredRisks = control.risks ? this.risks.filter(risk => 
                control.risks.includes(risk.id)
            ).map(risk => risk.description.substring(0, 50) + '...').join(', ') : 'Aucun risque associé';
            
            // Mapper les valeurs d'efficacité
            const effectivenessMap = {
                'forte': 'Forte',
                'moyenne': 'Moyenne', 
                'faible': 'Faible',
                'high': 'Forte',
                'medium': 'Moyenne',
                'low': 'Faible'
            };
            
            // Mapper les statuts
            const statusMap = {
                'actif': 'Actif',
                'en-mise-en-place': 'En mise en place',
                'en-revision': 'En cours de révision',
                'obsolete': 'Obsolète'
            };
            
            return `
                <div class="control-item" data-control-id="${control.id}">
                    <div class="control-actions">
                        <button class="control-action-btn edit" data-control-id="${control.id}" title="Modifier">
                            ✏️
                        </button>
                        <button class="control-action-btn delete" onclick="deleteControl(${control.id})" title="Supprimer">
                            🗑️
                        </button>
                    </div>
                    
                    <div class="control-header">
                        <div>
                            <div class="control-name">${control.name || 'Contrôle sans nom'}</div>
                            <div class="control-type-badge ${control.type || 'preventif'}">
                                ${control.type === 'preventif' ? 'Préventif' : 'Détectif'}
                            </div>
                        </div>
                        ${control.status ? `<span class="control-status-badge ${control.status}">${statusMap[control.status] || control.status}</span>` : ''}
                    </div>
                    
                    ${control.description ? `<div style="margin: 10px 0; color: #666; font-size: 0.9em;">${control.description}</div>` : ''}
                    
                    <div style="margin: 10px 0; font-size: 0.85em; color: #7f8c8d;">
                        <strong>Risques couverts:</strong> ${coveredRisks}
                    </div>
                    
                    <div class="control-meta">
                        ${control.owner ? `
                            <div class="control-meta-item">
                                <div class="control-meta-label">Propriétaire</div>
                                <div class="control-meta-value">${control.owner}</div>
                            </div>
                        ` : ''}
                        ${control.frequency ? `
                            <div class="control-meta-item">
                                <div class="control-meta-label">Fréquence</div>
                                <div class="control-meta-value">${control.frequency}</div>
                            </div>
                        ` : ''}
                        ${control.mode ? `
                            <div class="control-meta-item">
                                <div class="control-meta-label">Mode</div>
                                <div class="control-meta-value">${control.mode}</div>
                            </div>
                        ` : ''}
                        <div class="control-meta-item">
                            <div class="control-meta-label">Efficacité</div>
                            <div class="control-meta-value">${effectivenessMap[control.effectiveness] || 'Non définie'}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Action Plans functions
    updateActionPlansList() {
        const container = document.getElementById('actionPlansList');
        if (!container) return;

        container.innerHTML = this.actionPlans.map(plan => {
            const linkedRisks = plan.risks ? this.risks.filter(r => plan.risks.includes(r.id)).map(r => r.description.substring(0, 50) + '...').join(', ') : 'Aucun risque';
            return `
                <div class="control-item" data-plan-id="${plan.id}">
                    <div class="control-actions">
                        <button class="control-action-btn edit" data-plan-id="${plan.id}" title="Modifier">✏️</button>
                        <button class="control-action-btn delete" onclick="deleteActionPlan(${plan.id})" title="Supprimer">🗑️</button>
                    </div>
                    <div class="control-header">
                        <div>
                            <div class="control-name">${plan.title || 'Plan sans titre'}</div>
                            <div class="control-type-badge">${plan.status || ''}</div>
                        </div>
                    </div>
                    ${plan.description ? `<div style="margin: 10px 0; color: #666; font-size: 0.9em;">${plan.description}</div>` : ''}
                    <div class="control-meta">
                        ${plan.owner ? `<div class="control-meta-item"><div class="control-meta-label">Propriétaire</div><div class="control-meta-value">${plan.owner}</div></div>` : ''}
                        ${plan.dueDate ? `<div class="control-meta-item"><div class="control-meta-label">Échéance</div><div class="control-meta-value">${plan.dueDate}</div></div>` : ''}
                    </div>
                    <div style="margin: 10px 0; font-size: 0.85em; color: #7f8c8d;">
                        <strong>Risques:</strong> ${linkedRisks}
                    </div>
                </div>`;
        }).join('');
    }

    // History functions
    updateHistory() {
        const container = document.getElementById('historyTimeline');
        if (!container) return;
        
        const recentHistory = this.history.slice(-10).reverse();
        
        container.innerHTML = recentHistory.map(item => `
            <div class="timeline-item">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <div class="timeline-date">${new Date(item.date).toLocaleString('fr-FR')}</div>
                    <div class="timeline-title">${item.action}</div>
                    <div class="timeline-description">${item.description}</div>
                </div>
            </div>
        `).join('');
    }

    addHistoryItem(action, description) {
        this.history.push({
            id: Date.now(),
            date: new Date().toISOString(),
            action,
            description,
            user: 'Marie Dupont'
        });
        this.saveData();
        this.updateHistory();
    }

    // CRUD operations
    addRisk(riskData) {
        const newRisk = {
            id: Date.now(),
            ...riskData,
            dateCreation: new Date().toISOString(),
            statut: 'nouveau'
        };
        
        this.risks.push(newRisk);
        this.addHistoryItem('Création risque', `Nouveau risque: ${newRisk.description}`);
        this.saveData();
        this.init();
        
        return newRisk;
    }

    editRisk(riskId) {
        const risk = this.risks.find(r => r.id === riskId);
        if (!risk) return;

        currentEditingRiskId = riskId;

        const form = document.getElementById('riskForm');
        if (form) {
            form.reset();
            document.getElementById('processus').value = risk.processus || '';
            this.updateSousProcessusOptions();
            document.getElementById('sousProcessus').value = risk.sousProcessus || '';
            document.getElementById('typeCorruption').value = risk.typeCorruption || '';

            const tiersSelect = document.getElementById('tiers');
            Array.from(tiersSelect.options).forEach(opt => {
                opt.selected = (risk.tiers || []).includes(opt.value);
            });

            document.getElementById('description').value = risk.description || '';
            document.getElementById('probBrut').value = risk.probBrut;
            document.getElementById('impactBrut').value = risk.impactBrut;
            document.getElementById('probNet').value = risk.probNet;
            document.getElementById('impactNet').value = risk.impactNet;
            document.getElementById('probPost').value = risk.probPost;
            document.getElementById('impactPost').value = risk.impactPost;

            calculateScore('brut');
            calculateScore('net');
            calculateScore('post');
        }

        selectedControlsForRisk = [...(risk.controls || [])];
        selectedActionPlansForRisk = [...(risk.actionPlans || [])];
        updateSelectedControlsDisplay();
        updateSelectedActionPlansDisplay();

        document.getElementById('riskModal').classList.add('show');
    }

    deleteRisk(riskId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce risque?')) return;
        
        const index = this.risks.findIndex(r => r.id === riskId);
        if (index > -1) {
            const risk = this.risks[index];
            this.risks.splice(index, 1);
            this.addHistoryItem('Suppression risque', `Risque supprimé: ${risk.description}`);
            this.saveData();
            this.init();
        }
    }

    // Export functions
    exportData(format = 'json') {
        const data = {
            risks: this.risks,
            controls: this.controls,
            exportDate: new Date().toISOString(),
            exportedBy: 'Marie Dupont'
        };
        
        if (format === 'json') {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `risk_mapping_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
        } else if (format === 'csv') {
            // CSV export implementation
            const csv = this.convertToCSV(this.risks);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `risks_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
        }
        
        showNotification('success', 'Export réussi!');
    }

    convertToCSV(data) {
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).join(','));
        return [headers, ...rows].join('\n');
    }
}

// Reference to the current RMS instance
let rms;
function setRms(instance) {
    rms = instance;
    window.rms = instance;
}

// Global functions for HTML event handlers
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to clicked button
    const evt = window.event;
    evt && evt.target.classList.add('active');
    
    if (rms) {
        rms.currentTab = tabName;
        
        // Update relevant content based on tab
        if (tabName === 'matrix') {
            rms.initializeMatrix();
        } else if (tabName === 'dashboard') {
            rms.updateDashboard();
        } else if (tabName === 'risks') {
            rms.updateRisksList();
        } else if (tabName === 'controls') {
            rms.updateControlsList();
        } else if (tabName === 'plans') {
            rms.updateActionPlansList();
        } else if (tabName === 'history') {
            rms.updateHistory();
        } else if (tabName === 'config') {
            rms.renderConfiguration();
        }
    }
}
window.switchTab = switchTab;

function changeMatrixView(view) {
    if (!rms) return;
    
    rms.currentView = view;
    
    // Update buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const evt = window.event;
    evt && evt.target.classList.add('active');
    
    // Update title
    const titles = {
        'brut': 'Matrice des Risques - Vue Brut',
        'net': 'Matrice des Risques - Vue Net',
        'post-mitigation': 'Matrice des Risques - Post-Mitigation'
    };
    
    const titleElement = document.getElementById('matrixTitle');
    if (titleElement) {
        titleElement.textContent = titles[view];
    }
    
    // Re-render matrix
    rms.renderRiskPoints();
    rms.updateRiskDetailsList();
}
window.changeMatrixView = changeMatrixView;

function resetMatrixView() {
    if (!rms) return;

    rms.currentView = 'brut';
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    const brutBtn = document.querySelector(".view-btn[onclick*='brut']");
    brutBtn && brutBtn.classList.add('active');
    const titleElement = document.getElementById('matrixTitle');
    if (titleElement) {
        titleElement.textContent = 'Matrice des Risques - Vue Brut';
    }
    rms.renderRiskPoints();
    rms.updateRiskDetailsList();
}
window.resetMatrixView = resetMatrixView;

function applyFilters() {
    if (!rms) return;
    
    rms.filters.process = document.getElementById('processFilter')?.value || '';
    rms.filters.type = document.getElementById('riskTypeFilter')?.value || '';
    rms.filters.status = document.getElementById('statusFilter')?.value || '';
    
    rms.renderRiskPoints();
    rms.updateRiskDetailsList();
    rms.updateRisksList();
}
window.applyFilters = applyFilters;

function searchRisks(searchTerm) {
    if (!rms) return;
    
    rms.filters.search = searchTerm;
    rms.renderRiskPoints();
    rms.updateRiskDetailsList();
    rms.updateRisksList();
}
window.searchRisks = searchRisks;

let lastRiskData = null;
let selectedControlsForRisk = [];
let controlFilterQueryForRisk = '';
let currentEditingRiskId = null;
let selectedActionPlansForRisk = [];
let lastActionPlanData = null;
let selectedRisksForPlan = [];
let riskFilterQueryForPlan = '';
let currentEditingActionPlanId = null;
let actionPlanFilterQueryForRisk = '';

function addNewRisk() {
    currentEditingRiskId = null;
    const form = document.getElementById('riskForm');
    if (form) {
        form.reset();

        if (lastRiskData) {
            document.getElementById('processus').value = lastRiskData.processus || '';
            rms.updateSousProcessusOptions();
            document.getElementById('sousProcessus').value = lastRiskData.sousProcessus || '';
            document.getElementById('typeCorruption').value = lastRiskData.typeCorruption || '';

            const tiersSelect = document.getElementById('tiers');
            Array.from(tiersSelect.options).forEach(opt => {
                opt.selected = lastRiskData.tiers?.includes(opt.value);
            });

            document.getElementById('description').value = lastRiskData.description || '';
            document.getElementById('probBrut').value = lastRiskData.probBrut || 1;
            document.getElementById('impactBrut').value = lastRiskData.impactBrut || 1;
            document.getElementById('probNet').value = lastRiskData.probNet || 1;
            document.getElementById('impactNet').value = lastRiskData.impactNet || 1;
            document.getElementById('probPost').value = lastRiskData.probPost || 1;
            document.getElementById('impactPost').value = lastRiskData.impactPost || 1;
            selectedControlsForRisk = [...(lastRiskData.controls || [])];
            selectedActionPlansForRisk = [...(lastRiskData.actionPlans || [])];
        } else {
            rms.updateSousProcessusOptions();
            selectedControlsForRisk = [];
            selectedActionPlansForRisk = [];
        }

        // Recalculate scores for displayed values
        calculateScore('brut');
        calculateScore('net');
        calculateScore('post');
        updateSelectedControlsDisplay();
        updateSelectedActionPlansDisplay();
    }
    document.getElementById('riskModal').classList.add('show');
}
window.addNewRisk = addNewRisk;

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}
window.closeModal = closeModal;

function calculateScore(type) {
    let probId, impactId, scoreId;
    
    if (type === 'brut') {
        probId = 'probBrut';
        impactId = 'impactBrut';
        scoreId = 'scoreBrut';
    } else if (type === 'net') {
        probId = 'probNet';
        impactId = 'impactNet';
        scoreId = 'scoreNet';
    } else {
        probId = 'probPost';
        impactId = 'impactPost';
        scoreId = 'scorePost';
    }
    
    const prob = parseInt(document.getElementById(probId).value) || 1;
    const impact = parseInt(document.getElementById(impactId).value) || 1;
    const score = prob * impact;

    document.getElementById(scoreId).textContent = `Score: ${score}`;

    if (type === 'net' && selectedActionPlansForRisk.length === 0) {
        document.getElementById('probPost').value = document.getElementById('probNet').value;
        document.getElementById('impactPost').value = document.getElementById('impactNet').value;
        document.getElementById('scorePost').textContent = `Score: ${score}`;
    }
}
window.calculateScore = calculateScore;

function saveRisk() {
    if (!rms) return;

    const formData = {
        processus: document.getElementById('processus').value,
        sousProcessus: document.getElementById('sousProcessus').value,
        description: document.getElementById('description').value,
        typeCorruption: document.getElementById('typeCorruption').value,
        tiers: Array.from(document.getElementById('tiers').selectedOptions).map(o => o.value),
        probBrut: parseInt(document.getElementById('probBrut').value),
        impactBrut: parseInt(document.getElementById('impactBrut').value),
        probNet: parseInt(document.getElementById('probNet').value),
        impactNet: parseInt(document.getElementById('impactNet').value),
        probPost: parseInt(document.getElementById('probPost').value),
        impactPost: parseInt(document.getElementById('impactPost').value),
        responsable: 'Marie Dupont',
        controls: [...selectedControlsForRisk],
        actionPlans: [...selectedActionPlansForRisk]
    };

    if (selectedActionPlansForRisk.length === 0) {
        formData.probPost = formData.probNet;
        formData.impactPost = formData.impactNet;
    }

    // Validate form
    if (!formData.processus || !formData.description || !formData.typeCorruption) {
        showNotification('error', 'Veuillez remplir tous les champs obligatoires');
        return;
    }

    if (formData.probNet > formData.probBrut || formData.impactNet > formData.impactBrut) {
        showNotification('error', 'La probabilité et l\'impact nets doivent être inférieurs ou égaux aux valeurs brutes');
        return;
    }

    if (currentEditingRiskId) {
        const riskIndex = rms.risks.findIndex(r => r.id === currentEditingRiskId);
        if (riskIndex !== -1) {
            rms.risks[riskIndex] = { ...rms.risks[riskIndex], ...formData };

            // Update control links
            rms.controls.forEach(control => {
                control.risks = control.risks || [];
                if (selectedControlsForRisk.includes(control.id)) {
                    if (!control.risks.includes(currentEditingRiskId)) {
                        control.risks.push(currentEditingRiskId);
                    }
                } else {
                    control.risks = control.risks.filter(id => id !== currentEditingRiskId);
                }
            });

            rms.actionPlans.forEach(plan => {
                plan.risks = plan.risks || [];
                if (selectedActionPlansForRisk.includes(plan.id)) {
                    if (!plan.risks.includes(currentEditingRiskId)) {
                        plan.risks.push(currentEditingRiskId);
                    }
                } else {
                    plan.risks = plan.risks.filter(id => id !== currentEditingRiskId);
                }
            });

            rms.saveData();
            rms.init();
            closeModal('riskModal');
            showNotification('success', 'Risque mis à jour avec succès!');
            currentEditingRiskId = null;
        }
    } else {
        const newRisk = rms.addRisk(formData);

        selectedControlsForRisk.forEach(controlId => {
            const ctrl = rms.controls.find(c => c.id === controlId);
            if (ctrl) {
                ctrl.risks = ctrl.risks || [];
                if (!ctrl.risks.includes(newRisk.id)) {
                    ctrl.risks.push(newRisk.id);
                }
            }
        });

        selectedActionPlansForRisk.forEach(planId => {
            const plan = rms.actionPlans.find(p => p.id === planId);
            if (plan) {
                plan.risks = plan.risks || [];
                if (!plan.risks.includes(newRisk.id)) {
                    plan.risks.push(newRisk.id);
                }
            }
        });

        rms.saveData();
        rms.updateControlsList();
        rms.updateActionPlansList();
        closeModal('riskModal');
        showNotification('success', 'Risque ajouté avec succès!');
    }

    lastRiskData = { ...formData, tiers: [...formData.tiers], controls: [...formData.controls], actionPlans: [...formData.actionPlans] };
}
window.saveRisk = saveRisk;

function openControlSelector() {
    controlFilterQueryForRisk = '';
    const searchInput = document.getElementById('controlSearchInput');
    if (searchInput) searchInput.value = '';
    renderControlSelectionList();
    document.getElementById('controlSelectorModal').classList.add('show');
}
window.openControlSelector = openControlSelector;

function renderControlSelectionList() {
    const list = document.getElementById('controlList');
    if (!list || !rms) return;
    const query = controlFilterQueryForRisk.toLowerCase();
    list.innerHTML = rms.controls.filter(ctrl => {
        const name = (ctrl.name || '').toLowerCase();
        return String(ctrl.id).includes(query) || name.includes(query);
    }).map(ctrl => {
        const isSelected = selectedControlsForRisk.includes(ctrl.id);
        return `
            <div class="risk-list-item">
              <input type="checkbox" id="control-${ctrl.id}" ${isSelected ? 'checked' : ''} onchange="toggleControlSelection(${ctrl.id})">
              <div class="risk-item-info">
                <div class="risk-item-title">#${ctrl.id} - ${ctrl.name}</div>
                <div class="risk-item-meta">Type: ${ctrl.type || ''} | Propriétaire: ${ctrl.owner || ''}</div>
              </div>
            </div>`;
    }).join('');
}

function filterControlsForRisk(query) {
    controlFilterQueryForRisk = query;
    renderControlSelectionList();
}
window.filterControlsForRisk = filterControlsForRisk;

function closeControlSelector() {
    document.getElementById('controlSelectorModal').classList.remove('show');
}
window.closeControlSelector = closeControlSelector;

function toggleControlSelection(controlId) {
    const index = selectedControlsForRisk.indexOf(controlId);
    if (index > -1) {
        selectedControlsForRisk.splice(index, 1);
    } else {
        selectedControlsForRisk.push(controlId);
    }
}
window.toggleControlSelection = toggleControlSelection;

function confirmControlSelection() {
    updateSelectedControlsDisplay();
    closeControlSelector();
}
window.confirmControlSelection = confirmControlSelection;

function updateSelectedControlsDisplay() {
    const container = document.getElementById('riskControls');
    if (!container) return;
    if (selectedControlsForRisk.length === 0) {
        container.innerHTML = '<div style="color: #7f8c8d; font-style: italic;">Aucun contrôle sélectionné</div>';
        return;
    }
    container.innerHTML = selectedControlsForRisk.map(id => {
        const ctrl = rms.controls.find(c => c.id === id);
        if (!ctrl) return '';
        const name = ctrl.name || 'Sans nom';
        return `
            <div class="selected-control-item">
              #${id} - ${name.substring(0, 50)}${name.length > 50 ? '...' : ''}
              <span class="remove-control" onclick="removeControlFromSelection(${id})">×</span>
            </div>`;
    }).join('');
}
window.updateSelectedControlsDisplay = updateSelectedControlsDisplay;

function removeControlFromSelection(controlId) {
    selectedControlsForRisk = selectedControlsForRisk.filter(id => id !== controlId);
    updateSelectedControlsDisplay();
}
window.removeControlFromSelection = removeControlFromSelection;

function updateSelectedActionPlansDisplay() {
    const container = document.getElementById('riskActionPlans');
    const postSection = document.getElementById('postMitigationSection');
    if (!container) return;
    if (selectedActionPlansForRisk.length === 0) {
        container.innerHTML = '<div style="color: #7f8c8d; font-style: italic;">Aucun plan d\'action sélectionné</div>';
        if (postSection) postSection.style.display = 'none';
        const probNet = document.getElementById('probNet');
        const impactNet = document.getElementById('impactNet');
        document.getElementById('probPost').value = probNet ? probNet.value : 1;
        document.getElementById('impactPost').value = impactNet ? impactNet.value : 1;
        calculateScore('post');
        return;
    }
    container.innerHTML = selectedActionPlansForRisk.map(id => {
        const plan = rms.actionPlans.find(p => p.id === id);
        if (!plan) return '';
        const title = plan.title || 'Sans titre';
        return `
            <div class="selected-control-item">
              #${id} - ${title.substring(0, 50)}${title.length > 50 ? '...' : ''}
              <span class="remove-control" onclick="removeActionPlanFromSelection(${id})">×</span>
            </div>`;
    }).join('');
    if (postSection) postSection.style.display = 'block';
}
window.updateSelectedActionPlansDisplay = updateSelectedActionPlansDisplay;

function removeActionPlanFromSelection(planId) {
    selectedActionPlansForRisk = selectedActionPlansForRisk.filter(id => id !== planId);
    updateSelectedActionPlansDisplay();
}
window.removeActionPlanFromSelection = removeActionPlanFromSelection;

function openActionPlanSelector() {
    actionPlanFilterQueryForRisk = '';
    const searchInput = document.getElementById('actionPlanSearchInput');
    if (searchInput) searchInput.value = '';
    renderActionPlanSelectionList();
    document.getElementById('actionPlanSelectorModal').classList.add('show');
}
window.openActionPlanSelector = openActionPlanSelector;

function renderActionPlanSelectionList() {
    const list = document.getElementById('actionPlanList');
    if (!list) return;
    const query = actionPlanFilterQueryForRisk.toLowerCase();
    list.innerHTML = rms.actionPlans.filter(plan => {
        const title = (plan.title || '').toLowerCase();
        return String(plan.id).includes(query) || title.includes(query);
    }).map(plan => {
        const isSelected = selectedActionPlansForRisk.includes(plan.id);
        const title = plan.title || 'Sans titre';
        return `
            <div class="risk-list-item">
              <input type="checkbox" id="action-plan-${plan.id}" ${isSelected ? 'checked' : ''} onchange="toggleActionPlanSelection(${plan.id})">
              <div class="risk-item-info">
                <div class="risk-item-title">#${plan.id} - ${title}</div>
              </div>
            </div>`;
    }).join('');
}

window.filterActionPlansForRisk = function(query) {
    actionPlanFilterQueryForRisk = query;
    renderActionPlanSelectionList();
};

function closeActionPlanSelector() {
    document.getElementById('actionPlanSelectorModal').classList.remove('show');
}
window.closeActionPlanSelector = closeActionPlanSelector;

function toggleActionPlanSelection(planId) {
    const index = selectedActionPlansForRisk.indexOf(planId);
    if (index > -1) {
        selectedActionPlansForRisk.splice(index, 1);
    } else {
        selectedActionPlansForRisk.push(planId);
    }
}
window.toggleActionPlanSelection = toggleActionPlanSelection;

function confirmActionPlanSelection() {
    updateSelectedActionPlansDisplay();
    closeActionPlanSelector();
}
window.confirmActionPlanSelection = confirmActionPlanSelection;

function addNewActionPlan() {
    currentEditingActionPlanId = null;
    const form = document.getElementById('actionPlanForm');
    if (form) {
        form.reset();
        selectedRisksForPlan = [];
        if (lastActionPlanData) {
            document.getElementById('planTitle').value = lastActionPlanData.title || '';
            document.getElementById('planOwner').value = lastActionPlanData.owner || '';
            document.getElementById('planDueDate').value = lastActionPlanData.dueDate || '';
            document.getElementById('planStatus').value = lastActionPlanData.status || '';
            document.getElementById('planDescription').value = lastActionPlanData.description || '';
            selectedRisksForPlan = [...(lastActionPlanData.risks || [])];
        }
        updateSelectedRisksForPlanDisplay();
    }
    document.getElementById('actionPlanModalTitle').textContent = "Nouveau Plan d'action";
    document.getElementById('actionPlanModal').classList.add('show');
}
window.addNewActionPlan = addNewActionPlan;

function editActionPlan(planId) {
    const plan = rms.actionPlans.find(p => p.id == planId);
    if (!plan) return;
    currentEditingActionPlanId = planId;
    const form = document.getElementById('actionPlanForm');
    if (form) {
        document.getElementById('planTitle').value = plan.title || '';
        document.getElementById('planOwner').value = plan.owner || '';
        document.getElementById('planDueDate').value = plan.dueDate || '';
        document.getElementById('planStatus').value = plan.status || '';
        document.getElementById('planDescription').value = plan.description || '';
        selectedRisksForPlan = plan.risks ? [...plan.risks] : [];
        updateSelectedRisksForPlanDisplay();
    }
    document.getElementById('actionPlanModalTitle').textContent = "Modifier le Plan d'action";
    document.getElementById('actionPlanModal').classList.add('show');
}
window.editActionPlan = editActionPlan;

function deleteActionPlan(planId) {
    const index = rms.actionPlans.findIndex(p => p.id == planId);
    if (index === -1) return;
    const title = rms.actionPlans[index].title;
    rms.actionPlans.splice(index,1);
    rms.risks.forEach(risk => {
        if (risk.actionPlans) {
            risk.actionPlans = risk.actionPlans.filter(id => id !== planId);
        }
    });
    rms.saveData();
    rms.updateActionPlansList();
    rms.updateRisksList();
    showNotification('success', `Plan "${title}" supprimé`);
}
window.deleteActionPlan = deleteActionPlan;

function closeActionPlanModal() {
    document.getElementById('actionPlanModal').classList.remove('show');
}
window.closeActionPlanModal = closeActionPlanModal;

function saveActionPlan() {
    const form = document.getElementById('actionPlanForm');
    if (!form) return;
    const formData = new FormData(form);
    const planData = {
        title: formData.get('title').trim(),
        owner: formData.get('owner').trim(),
        dueDate: formData.get('dueDate'),
        status: formData.get('status'),
        description: formData.get('description').trim(),
        risks: [...selectedRisksForPlan]
    };
    if (!planData.title) { alert('Titre requis'); return; }

    if (currentEditingActionPlanId) {
        const idx = rms.actionPlans.findIndex(p => p.id == currentEditingActionPlanId);
        if (idx !== -1) {
            rms.actionPlans[idx] = { ...rms.actionPlans[idx], ...planData };
            rms.risks.forEach(risk => {
                risk.actionPlans = risk.actionPlans || [];
                if (planData.risks.includes(risk.id)) {
                    if (!risk.actionPlans.includes(currentEditingActionPlanId)) {
                        risk.actionPlans.push(currentEditingActionPlanId);
                    }
                } else {
                    risk.actionPlans = risk.actionPlans.filter(id => id !== currentEditingActionPlanId);
                }
            });
            showNotification('success', `Plan "${planData.title}" modifié`);
        }
    } else {
        const newPlan = { id: Date.now(), ...planData };
        rms.actionPlans.push(newPlan);
        planData.risks.forEach(rid => {
            const risk = rms.risks.find(r => r.id === rid);
            if (risk) {
                risk.actionPlans = risk.actionPlans || [];
                if (!risk.actionPlans.includes(newPlan.id)) risk.actionPlans.push(newPlan.id);
            }
        });
        showNotification('success', `Plan "${planData.title}" créé`);
    }

    lastActionPlanData = { ...planData };
    rms.saveData();
    rms.updateActionPlansList();
    rms.updateRisksList();
    closeActionPlanModal();
}
window.saveActionPlan = saveActionPlan;

function openRiskSelectorForPlan() {
    riskFilterQueryForPlan = '';
    const searchInput = document.getElementById('riskSearchInputPlan');
    if (searchInput) searchInput.value = '';
    renderRiskSelectionListForPlan();
    document.getElementById('riskSelectorPlanModal').classList.add('show');
}
window.openRiskSelectorForPlan = openRiskSelectorForPlan;

function renderRiskSelectionListForPlan() {
    const riskList = document.getElementById('riskListForPlan');
    if (!riskList) return;
    const query = riskFilterQueryForPlan.toLowerCase();
    riskList.innerHTML = rms.risks.filter(risk => {
        const title = (risk.titre || risk.description || '').toLowerCase();
        return String(risk.id).includes(query) || title.includes(query);
    }).map(risk => {
        const isSelected = selectedRisksForPlan.includes(risk.id);
        const title = risk.titre || risk.description || 'Sans titre';
        return `
            <div class="risk-list-item">
              <input type="checkbox" id="plan-risk-${risk.id}" ${isSelected ? 'checked' : ''} onchange="toggleRiskSelectionForPlan(${risk.id})">
              <div class="risk-item-info">
                <div class="risk-item-title">#${risk.id} - ${title}</div>
                <div class="risk-item-meta">Processus: ${risk.processus}${risk.sousProcessus ? ` > ${risk.sousProcessus}` : ''} | Type: ${risk.typeCorruption}</div>
              </div>
            </div>`;
    }).join('');
}

window.filterRisksForPlan = function(query) {
    riskFilterQueryForPlan = query;
    renderRiskSelectionListForPlan();
};

function closeRiskSelectorForPlan() {
    document.getElementById('riskSelectorPlanModal').classList.remove('show');
}
window.closeRiskSelectorForPlan = closeRiskSelectorForPlan;

function toggleRiskSelectionForPlan(riskId) {
    const index = selectedRisksForPlan.indexOf(riskId);
    if (index > -1) {
        selectedRisksForPlan.splice(index, 1);
    } else {
        selectedRisksForPlan.push(riskId);
    }
}
window.toggleRiskSelectionForPlan = toggleRiskSelectionForPlan;

function confirmRiskSelectionForPlan() {
    updateSelectedRisksForPlanDisplay();
    closeRiskSelectorForPlan();
}
window.confirmRiskSelectionForPlan = confirmRiskSelectionForPlan;

function updateSelectedRisksForPlanDisplay() {
    const container = document.getElementById('selectedRisksForPlan');
    if (!container) return;
    if (selectedRisksForPlan.length === 0) {
        container.innerHTML = '<div style="color: #7f8c8d; font-style: italic;">Aucun risque sélectionné</div>';
        return;
    }
    container.innerHTML = selectedRisksForPlan.map(riskId => {
        const risk = rms.risks.find(r => r.id === riskId);
        if (!risk) return '';
        const title = risk.titre || risk.description || 'Sans titre';
        return `
            <div class="selected-risk-item">
              #${risk.id} - ${title.substring(0, 50)}${title.length > 50 ? '...' : ''}
              <span class="remove-risk" onclick="removeRiskFromPlanSelection(${riskId})">×</span>
            </div>`;
    }).join('');
}
window.updateSelectedRisksForPlanDisplay = updateSelectedRisksForPlanDisplay;

function removeRiskFromPlanSelection(riskId) {
    selectedRisksForPlan = selectedRisksForPlan.filter(id => id !== riskId);
    updateSelectedRisksForPlanDisplay();
}
window.removeRiskFromPlanSelection = removeRiskFromPlanSelection;

function showNotification(type, message) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
window.showNotification = showNotification;

function exportDashboard() {
    if (rms) rms.exportData('json');
}
window.exportDashboard = exportDashboard;

function exportRisks() {
    if (rms) rms.exportData('csv');
}
window.exportRisks = exportRisks;

function generateReport(type) {
    showNotification('info', `Génération du rapport ${type} en cours...`);
    setTimeout(() => {
        showNotification('success', 'Rapport généré avec succès!');
    }, 2000);
}
window.generateReport = generateReport;

function refreshDashboard() {
    if (rms) {
        rms.updateDashboard();
        showNotification('success', 'Tableau de bord actualisé');
    }
}
window.refreshDashboard = refreshDashboard;

function bindEvents() {
    // Close modals on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.show').forEach(modal => {
                modal.classList.remove('show');
            });
        }
    });

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });

    // Ensure net probability and impact do not exceed gross values
    const probBrut = document.getElementById('probBrut');
    const probNet = document.getElementById('probNet');
    const impactBrut = document.getElementById('impactBrut');
    const impactNet = document.getElementById('impactNet');

    const enforceNetLimits = () => {
        if (parseInt(probNet.value) > parseInt(probBrut.value)) {
            probNet.value = probBrut.value;
        }
        if (parseInt(impactNet.value) > parseInt(impactBrut.value)) {
            impactNet.value = impactBrut.value;
        }
        calculateScore('net');
    };

    if (probBrut && probNet && impactBrut && impactNet) {
        probBrut.addEventListener('change', enforceNetLimits);
        probNet.addEventListener('change', enforceNetLimits);
        impactBrut.addEventListener('change', enforceNetLimits);
        impactNet.addEventListener('change', enforceNetLimits);
        enforceNetLimits();
    }

    // Handle edit buttons for controls and plans
    document.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.control-action-btn.edit');
        if (editBtn) {
            const controlId = editBtn.dataset.controlId;
            const planId = editBtn.dataset.planId;
            if (controlId && typeof editControl === 'function') {
                e.preventDefault();
                editControl(parseInt(controlId, 10));
            } else if (planId && typeof editActionPlan === 'function') {
                e.preventDefault();
                editActionPlan(parseInt(planId, 10));
            }
        }
    });
}

function applyPatch() {
    (function(){
      const RMS = window.rms || window.RMS || window.RiskSystem || {};
      // Guard: bind common getters
      const state = {
        get risks(){ return RMS.risks || window.risks || []; },
        set risks(v){ if (RMS.risks) RMS.risks = v; else window.risks = v; },
        get controls(){ return RMS.controls || window.controls || []; },
        set controls(v){ if (RMS.controls) RMS.controls = v; else window.controls = v; },
        get actionPlans(){ return RMS.actionPlans || window.actionPlans || []; },
        set actionPlans(v){ if (RMS.actionPlans) RMS.actionPlans = v; else window.actionPlans = v; },
        get history(){ return RMS.history || window.historyLog || []; },
        set history(v){ if (RMS.history) RMS.history = v; else window.historyLog = v; },
        save: (label="auto") => {
          try {
            if (RMS.saveData) { RMS.saveData(); }
            else if (window.saveData) { window.saveData(); }
            addHistoryItem(`Sauvegarde ${label}`);
            updateLastSaveTime && updateLastSaveTime();
          } catch(e){ console.warn("save error", e); }
        },
        renderAll: () => {
          try {
            if (RMS.renderAll) RMS.renderAll();
            if (window.renderRisks) window.renderRisks();
            if (window.renderMatrix) window.renderMatrix();
            if (window.updateKPI) window.updateKPI();
            if (window.updateCharts) window.updateCharts();
          } catch(e){ console.warn("renderAll error", e); }
        }
      };
    
      function addHistoryItem(action, meta){
        try{
          const item = { id: Date.now().toString(36)+Math.random().toString(36).slice(2,6), ts: new Date().toISOString(), action, meta: meta||{} };
          state.history = [...state.history, item];
        }catch(e){ console.warn("history error", e); }
      }
    
      // CSV escaping
      function csvEscape(val){
        if (val === null || val === undefined) return "";
        const s = String(val);
        if (/[",\n]/.test(s)) return '"' + s.replace(/"/g,'""') + '"';
        return s;
      }
      function toCSV(rows){
        if (!rows || !rows.length) return "";
        const keys = Object.keys(rows[0]);
        const head = keys.map(csvEscape).join(",");
        const body = rows.map(r => keys.map(k => csvEscape(r[k])).join(",")).join("\n");
        return head + "\n" + body;
      }
      function downloadBlob(filename, mime, data){
        const blob = new Blob([data], {type: mime});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 0);
      }
    
      // === Importer ===
      window.importRisks = async function importRisks(){
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.csv,.txt';
        input.onchange = (ev)=>{
          const file = ev.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = ()=>{
            try {
              const text = String(reader.result || "");
              if (file.name.toLowerCase().endswith(".json")) {
                const obj = JSON.parse(text);
                if (obj.risks) state.risks = mergeById(state.risks, obj.risks);
                if (obj.controls) state.controls = mergeById(state.controls, obj.controls);
                if (obj.history) state.history = [...state.history, ...obj.history];
                addHistoryItem("Import JSON", {file: file.name, counts: {risks: obj.risks?.length||0, controls: obj.controls?.length||0}});
              } else {
                // naive CSV: expects headers
                const rows = csvParse(text);
                if (rows.length){
                  const mapped = rows.map(r => ({
                    id: r.id || (Date.now()+Math.random()).toString(36),
                    titre: r.titre || r.title || r.name || "Sans titre",
                    description: r.description || "",
                    typeCorruption: r.typeCorruption || r.type || "autre",
                    probabilite: Number(r.probabilite ?? r.probability ?? 2),
                    impact: Number(r.impact ?? 2),
                    status: r.status || r.statut || "nouveau",
                    controles: r.controles ? String(r.controles).split("|").filter(Boolean) : []
                  }));
                  state.risks = mergeById(state.risks, mapped);
                  addHistoryItem("Import CSV", {file: file.name, count: mapped.length});
                }
              }
              state.save("après import");
              state.renderAll();
              toast && toast("Import réussi");
            } catch(err){
              console.error(err);
              alert("Erreur à l'import : " + err.message);
            }
          };
          reader.readAsText(file, 'utf-8');
        };
        input.click();
      };
    
      function mergeById(base, incoming){
        const map = new Map(base.map(x=>[String(x.id), x]));
        for (const it of incoming){
          const k = String(it.id);
          if (map.has(k)) map.set(k, {...map.get(k), ...it});
          else map.set(k, it);
        }
        return Array.from(map.values());
      }
    
      function csvParse(text){
        // simple CSV parser (handles quotes)
        const lines = text.replace(/\r\n/g,"\n").split("\n").filter(Boolean);
        if (!lines.length) return [];
        const headers = splitCSVLine(lines[0]);
        return lines.slice(1).map(line => {
          const cols = splitCSVLine(line);
          const obj = {};
          headers.forEach((h,i)=> obj[h.trim()] = cols[i] ?? "");
          return obj;
        });
      }
      function splitCSVLine(line){
        const out=[], len=line.length;
        let cur="", inQ=false;
        for(let i=0;i<len;i++){
          const ch=line[i];
          if (inQ){
            if (ch === '"'){
              if (line[i+1] === '"'){ cur+='"'; i++; }
              else { inQ=false; }
            } else cur+=ch;
          } else {
            if (ch === '"') inQ=true;
            else if (ch === ','){ out.push(cur); cur=""; }
            else cur+=ch;
          }
        }
        out.push(cur);
        return out;
      }
    
      // === Export History ===
      window.exportHistory = function exportHistory(format="json"){
        const items = state.history || [];
        if (!items.length){ alert("Aucun élément d'historique"); return; }
        if (format === "csv"){
          const csv = toCSV(items);
          const bom = "\ufeff"; // Excel
          downloadBlob("historique.csv","text/csv;charset=utf-8", bom + csv);
        } else {
          downloadBlob("historique.json","application/json;charset=utf-8", JSON.stringify(items, null, 2));
        }
        addHistoryItem("Export historique", {format});
      };
    
      // === Export Matrix Capture ===
      window.exportMatrix = async function exportMatrix(){
        const container = document.querySelector('.matrix-container') || document.querySelector('#matrix') || document.body;
        if (!window.html2canvas){
          alert("html2canvas non chargé. Connectez-vous à Internet ou ajoutez la librairie en local.");
          return;
        }
        const canvas = await html2canvas(container, {scale: 2});
        canvas.toBlob((blob)=>{
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = "matrice-risques.png";
          document.body.appendChild(a); a.click();
          setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); },0);
          addHistoryItem("Export matrice (PNG)");
        });
      };
    
      // === Toggle Fullscreen ===
      window.toggleFullScreen = function toggleFullScreen(){
        const el = document.querySelector('.matrix-container') || document.documentElement;
        const doc = document;
        if (!doc.fullscreenElement){
          (el.requestFullscreen && el.requestFullscreen()) ||
          (el.webkitRequestFullscreen && el.webkitRequestFullscreen());
        } else {
          (doc.exitFullscreen && doc.exitFullscreen()) ||
          (doc.webkitExitFullscreen && doc.webkitExitFullscreen());
        }
      };
    
      // === Controls CRUD (minimal UI via prompt) ===
      window.addNewControl = function addNewControl(){
        const name = prompt("Nom du contrôle ?");
        if (!name) return;
        const id = "ctl_" + Date.now().toString(36);
        const ctrl = { id, name, description: "", owner: "", effectiveness: "moyen" };
        state.controls = [...state.controls, ctrl];
        addHistoryItem("Nouveau contrôle", {id, name});
        state.save("contrôle");
        state.renderAll();
      };
    
      window.addControlToRisk = function addControlToRisk(riskId){
        const rId = riskId || prompt("ID du risque à enrichir ?");
        const risk = (state.risks||[]).find(r => String(r.id)===String(rId));
        if (!risk){ alert("Risque introuvable"); return; }
        const options = state.controls.map(c=>`${c.id}:${c.name}`).join("\n") || "(aucun contrôle)";
        const chosen = prompt("Sélectionnez un contrôle (id) parmi :\n"+options);
        const ctrl = state.controls.find(c=>String(c.id)===String(chosen));
        if (!ctrl){ alert("Contrôle introuvable"); return; }
        risk.controles = Array.from(new Set([...(risk.controles||[]), ctrl.id]));
        addHistoryItem("Lien contrôle→risque", {riskId:risk.id, controlId: ctrl.id});
        state.save("lien contrôle");
        state.renderAll();
      };
    
      // === Edit Risk (basic) ===
      window.editRisk = function editRisk(riskId){
        const risk = (state.risks||[]).find(r => String(r.id)===String(riskId));
        if (!risk){ alert("Risque introuvable"); return; }
        const titre = prompt("Titre du risque :", risk.titre || risk.title || "");
        if (titre===null) return;
        const description = prompt("Description :", risk.description || "");
        if (description===null) return;
        const probabilite = Number(prompt("Probabilité (1-4):", risk.probabilite ?? 2) || 2);
        const impact = Number(prompt("Impact (1-4):", risk.impact ?? 2) || 2);
        const status = prompt("Statut (nouveau|en-cours|traite):", risk.status || "nouveau") || "nouveau";
        Object.assign(risk, {titre, description, probabilite, impact, status});
        addHistoryItem("Édition risque", {riskId});
        state.save("risque modifié");
        state.renderAll();
      };
    
      // === Update Charts (minimal) ===
      window.updateCharts = function updateCharts(){
        if (!window.Chart) return; // library not loaded
        const byStatus = (state.risks||[]).reduce((acc, r)=>{
          const k = r.status || "inconnu"; acc[k] = (acc[k]||0)+1; return acc;
        }, {});
        const canvas = document.querySelector("#chart-status") || document.querySelector("canvas.chart-status");
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (canvas._chart) { canvas._chart.destroy(); }
        canvas._chart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: Object.keys(byStatus),
            datasets: [{ data: Object.values(byStatus) }]
          },
          options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
      };
    
      // === Export Dashboard PDF ===
      window.exportDashboard = async function exportDashboard(){
        const root = document.querySelector('#dashboard') || document.body;
        if (!window.html2canvas || !window.jspdf){
          alert("Librairies manquantes (html2canvas / jsPDF). Activez Internet ou installez-les en local.");
          return;
        }
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({orientation: 'portrait', unit: 'pt', format: 'a4'});
        const A4_W = 595.28, A4_H = 841.89, M = 24;
        const scale = 2;
    
        const sections = root.querySelectorAll(':scope > *');
        let first = true;
        for (const sec of sections){
          const canvas = await html2canvas(sec, {scale});
          const imgW = A4_W - 2*M;
          const ratio = imgW / canvas.width;
          const imgH = canvas.height * ratio;
          if (!first) pdf.addPage();
          first = false;
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', M, M, imgW, imgH);
        }
        pdf.save('dashboard-risques.pdf');
        addHistoryItem("Export dashboard PDF");
      };
    
      // === Safer event handlers (avoid global event) ===
      function rewireHandlers(){
        document.querySelectorAll("[data-switch-tab]").forEach(btn=>{
          btn.onclick = (e)=>{
            const tab = btn.getAttribute("data-switch-tab");
            if (window.switchTab) window.switchTab(e, tab);
            else {
              document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active", x.id===tab));
              document.querySelectorAll("[data-switch-tab]").forEach(x=>x.classList.toggle("active", x===btn));
            }
          };
        });
        document.querySelectorAll("[data-matrix-view]").forEach(btn=>{
          btn.onclick = (e)=>{
            const view = btn.getAttribute("data-matrix-view");
            if (window.changeMatrixView) window.changeMatrixView(e, view);
            document.querySelectorAll("[data-matrix-view]").forEach(x=>x.classList.toggle("active", x===btn));
          };
        });
      }
    
      if (document.readyState === 'loading') {
        document.addEventListener("DOMContentLoaded", ()=>{
          try { rewireHandlers(); } catch(e){}
          try { updateCharts(); } catch(e){}
        });
      } else {
        try { rewireHandlers(); } catch(e){}
        try { updateCharts(); } catch(e){}
      }
    
      // === Functions for Control Management ===
      
      let currentEditingControlId = null;
      let selectedRisksForControl = [];
      let riskFilterQueryForControl = '';
      let lastControlData = null;
    
      // Open control modal for new control
      window.addNewControl = function() {
        currentEditingControlId = null;
        const form = document.getElementById('controlForm');
        if (form) form.reset();

        selectedRisksForControl = [];

        if (lastControlData) {
          document.getElementById('controlName').value = lastControlData.name || '';
          document.getElementById('controlType').value = lastControlData.type || '';
          document.getElementById('controlOwner').value = lastControlData.owner || '';
          document.getElementById('controlFrequency').value = lastControlData.frequency || '';
          document.getElementById('controlMode').value = lastControlData.mode || '';
          document.getElementById('controlEffectiveness').value = lastControlData.effectiveness || '';
          document.getElementById('controlStatus').value = lastControlData.status || '';
          document.getElementById('controlDescription').value = lastControlData.description || '';
          selectedRisksForControl = [...(lastControlData.risks || [])];
        }

        document.getElementById('controlModalTitle').textContent = 'Nouveau Contrôle';
        updateSelectedRisksDisplay();

        // Show modal
        document.getElementById('controlModal').classList.add('show');
      };
    
      // Open control modal for editing
      window.editControl = function(controlId) {
        const control = state.controls.find(c => c.id == controlId);
        if (!control) {
          alert('Contrôle introuvable');
          return;
        }
    
        currentEditingControlId = controlId;
        selectedRisksForControl = control.risks || [];
    
        // Fill form with control data
        document.getElementById('controlName').value = control.name || '';
        document.getElementById('controlType').value = control.type || '';
        document.getElementById('controlOwner').value = control.owner || '';
        document.getElementById('controlFrequency').value = control.frequency || '';
        document.getElementById('controlMode').value = control.mode || '';
        document.getElementById('controlEffectiveness').value = control.effectiveness || '';
        document.getElementById('controlStatus').value = control.status || '';
        document.getElementById('controlDescription').value = control.description || '';
    
        // Update modal title and selected risks display
        document.getElementById('controlModalTitle').textContent = 'Modifier le Contrôle';
        updateSelectedRisksDisplay();
    
        // Show modal
        document.getElementById('controlModal').classList.add('show');
      };
    
      // Delete control
      window.deleteControl = function(controlId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce contrôle ?')) {
          return;
        }
    
        const controlIndex = state.controls.findIndex(c => c.id == controlId);
        if (controlIndex === -1) {
          alert('Contrôle introuvable');
          return;
        }
    
        const controlName = state.controls[controlIndex].name;
        state.controls.splice(controlIndex, 1);
    
        // Remove control from risks
        state.risks.forEach(risk => {
          if (risk.controls && risk.controls.includes(controlId)) {
            risk.controls = risk.controls.filter(id => id !== controlId);
          }
        });
    
        addHistoryItem("Suppression contrôle", {id: controlId, name: controlName});
        state.save("suppression-contrôle");
        state.renderAll();
        
        toast(`Contrôle "${controlName}" supprimé avec succès`);
      };
    
      // Close control modal
      window.closeControlModal = function() {
        document.getElementById('controlModal').classList.remove('show');
      };
    
      // Open risk selector modal
      window.openRiskSelector = function() {
        riskFilterQueryForControl = '';
        const searchInput = document.getElementById('riskSearchInput');
        if (searchInput) searchInput.value = '';
        renderRiskSelectionList();
        document.getElementById('riskSelectorModal').classList.add('show');
      };

      function renderRiskSelectionList() {
        const riskList = document.getElementById('riskList');
        if (!riskList) return;
        const query = riskFilterQueryForControl.toLowerCase();

        riskList.innerHTML = state.risks.filter(risk => {
          const title = (risk.titre || risk.description || '').toLowerCase();
          return String(risk.id).includes(query) || title.includes(query);
        }).map(risk => {
          const isSelected = selectedRisksForControl.includes(risk.id);
          const title = risk.titre || risk.description || 'Sans titre';
          return `
            <div class="risk-list-item">
              <input type="checkbox" id="risk-${risk.id}" ${isSelected ? 'checked' : ''}
                     onchange="toggleRiskSelection(${risk.id})">
              <div class="risk-item-info">
                <div class="risk-item-title">#${risk.id} - ${title}</div>
                <div class="risk-item-meta">
                  Processus: ${risk.processus}${risk.sousProcessus ? ` > ${risk.sousProcessus}` : ''} | Type: ${risk.typeCorruption}
                </div>
              </div>
            </div>
          `;
        }).join('');
      }

      window.filterRisksForControl = function(query) {
        riskFilterQueryForControl = query;
        renderRiskSelectionList();
      };
    
      // Close risk selector modal
      window.closeRiskSelector = function() {
        document.getElementById('riskSelectorModal').classList.remove('show');
      };
    
      // Toggle risk selection
      window.toggleRiskSelection = function(riskId) {
        const index = selectedRisksForControl.indexOf(riskId);
        if (index > -1) {
          selectedRisksForControl.splice(index, 1);
        } else {
          selectedRisksForControl.push(riskId);
        }
      };
    
      // Confirm risk selection
      window.confirmRiskSelection = function() {
        updateSelectedRisksDisplay();
        closeRiskSelector();
      };
    
      // Update selected risks display
      function updateSelectedRisksDisplay() {
        const container = document.getElementById('selectedRisks');
        
        if (selectedRisksForControl.length === 0) {
          container.innerHTML = '<div style="color: #7f8c8d; font-style: italic;">Aucun risque sélectionné</div>';
          return;
        }
    
        container.innerHTML = selectedRisksForControl.map(riskId => {
          const risk = state.risks.find(r => r.id === riskId);
          if (!risk) return '';
          
          const title = risk.titre || risk.description || 'Sans titre';
          return `
            <div class="selected-risk-item">
              #${risk.id} - ${title.substring(0, 50)}${title.length > 50 ? '...' : ''}
              <span class="remove-risk" onclick="removeRiskFromSelection(${riskId})">×</span>
            </div>
          `;
        }).join('');
      }
    
      // Remove risk from selection
      window.removeRiskFromSelection = function(riskId) {
        selectedRisksForControl = selectedRisksForControl.filter(id => id !== riskId);
        updateSelectedRisksDisplay();
      };
    
      // Save control (form submission)
      window.saveControl = function() {
        const form = document.getElementById('controlForm');
        if (!form) return;
        const formData = new FormData(form);
        const controlData = {
          name: formData.get('name'),
          type: formData.get('type'),
          owner: formData.get('owner'),
          frequency: formData.get('frequency'),
          mode: formData.get('mode'),
          effectiveness: formData.get('effectiveness'),
          status: formData.get('status'),
          description: formData.get('description'),
          risks: [...selectedRisksForControl]
        };
    
        // Validation
        if (!controlData.name || !controlData.type || !controlData.owner || !controlData.frequency || 
            !controlData.mode || !controlData.effectiveness || !controlData.status) {
          alert('Veuillez remplir tous les champs obligatoires (marqués d\'un *)');
          return;
        }
    
        if (currentEditingControlId) {
          // Update existing control
          const controlIndex = state.controls.findIndex(c => c.id == currentEditingControlId);
          if (controlIndex !== -1) {
            state.controls[controlIndex] = {
              ...state.controls[controlIndex],
              ...controlData
            };
            addHistoryItem("Modification contrôle", {id: currentEditingControlId, name: controlData.name});
            toast(`Contrôle "${controlData.name}" modifié avec succès`);
          }
        } else {
          // Create new control
          const newControl = {
            id: Date.now(),
            ...controlData,
            dateCreation: new Date().toISOString().split('T')[0]
          };
          
          state.controls.push(newControl);
          addHistoryItem("Nouveau contrôle", {id: newControl.id, name: controlData.name});
          toast(`Contrôle "${controlData.name}" créé avec succès`);
        }

        lastControlData = { ...controlData, risks: [...controlData.risks] };

        // Save and refresh
        state.save("contrôle");
        state.renderAll();
        closeControlModal();
      };
    
      // small toast helper if exists
      function toast(msg){
        const t = document.createElement('div');
        t.textContent = msg;
        Object.assign(t.style, {position:'fixed',bottom:'16px',right:'16px',padding:'10px 14px',background:'#111',color:'#fff',borderRadius:'8px',boxShadow:'0 4px 12px rgba(0,0,0,.25)',zIndex:9999,opacity:'0',transition:'opacity .2s'});
        document.body.appendChild(t);
        requestAnimationFrame(()=>{ t.style.opacity='1'; });
        setTimeout(()=>{ t.style.opacity='0'; setTimeout(()=>t.remove(),200); }, 1600);
      }
    
    })();

}

// Expose key functions and classes globally for non-module usage
window.RiskManagementSystem = RiskManagementSystem;
window.setRms = setRms;
window.bindEvents = bindEvents;
window.applyPatch = applyPatch;
