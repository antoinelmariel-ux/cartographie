// Enhanced Risk Management System - Core Logic

class RiskManagementSystem {
    constructor() {
        this.risks = this.loadData('risks') || this.getDefaultRisks();
        this.controls = this.loadData('controls') || this.getDefaultControls();
        this.actionPlans = this.loadData('actionPlans') || [];
        this.history = this.loadData('history') || [];
        const defaultConfig = this.getDefaultConfig();
        this.config = this.loadConfig() || defaultConfig;
        const configStructureUpdated = this.ensureConfigStructure(defaultConfig);
        if (configStructureUpdated) {
            this.saveConfig();
        }
        this.needsConfigStructureRerender = configStructureUpdated;
        this.currentView = 'brut';
        this.currentTab = 'dashboard';
        this.filters = {
            process: '',
            type: '',
            status: '',
            search: ''
        };
        this.controlFilters = {
            type: '',
            status: '',
            search: ''
        };
        this.actionPlanFilters = {
            status: '',
            name: '',
            owner: '',
            dueDateOrder: ''
        };
        this.lastDashboardMetrics = null;
        this.charts = {};
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
        this.renderAll();
        if (this.needsConfigStructureRerender) {
            this.renderConfiguration();
            this.needsConfigStructureRerender = false;
        }
        this.saveData();
        this.updateLastSaveTime();
    }

    renderAll() {
        this.initializeMatrix();
        this.updateDashboard();
        this.updateRisksList();
        this.updateControlsList();
        this.updateActionPlansList();
        this.updateHistory();

        if (this.currentTab === 'config') {
            this.renderConfiguration();
        }
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
                statut: "a-valider",
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
                statut: "validé",
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
                statut: "brouillon",
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
                statut: "a-valider",
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
                statut: "brouillon",
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
                statut: "a-valider",
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
                statut: "archive",
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
                { value: 'brouillon', label: 'Brouillon' },
                { value: 'a-valider', label: 'A valider' },
                { value: 'validé', label: 'Validé' },
                { value: 'archive', label: 'Archivé' }
            ],
            actionPlanStatuses: [
                { value: 'brouillon', label: 'Brouillon' },
                { value: 'a-demarrer', label: 'À démarrer' },
                { value: 'en-cours', label: 'En cours' },
                { value: 'termine', label: 'Terminé' }
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
        this.updateLastSaveTime();
    }

    ensureConfigStructure(defaultConfig = this.getDefaultConfig()) {
        const fallback = defaultConfig || this.getDefaultConfig();
        let updated = false;

        const hasValidConfig = this.config && typeof this.config === 'object' && !Array.isArray(this.config);
        const baseConfig = hasValidConfig ? this.config : {};

        if (!hasValidConfig) {
            updated = true;
        }

        this.config = { ...fallback, ...baseConfig };

        const fallbackStatuses = (fallback && Array.isArray(fallback.actionPlanStatuses))
            ? fallback.actionPlanStatuses
            : [
                { value: 'brouillon', label: 'Brouillon' },
                { value: 'a-demarrer', label: 'À démarrer' },
                { value: 'en-cours', label: 'En cours' },
                { value: 'termine', label: 'Terminé' }
            ];

        if (!Array.isArray(baseConfig.actionPlanStatuses)) {
            this.config.actionPlanStatuses = fallbackStatuses.map(status => ({ ...status }));
            if (baseConfig.actionPlanStatuses !== undefined) {
                updated = true;
            }
        } else {
            this.config.actionPlanStatuses = baseConfig.actionPlanStatuses.map(status => ({ ...status }));
        }

        if (!baseConfig.subProcesses || typeof baseConfig.subProcesses !== 'object' || Array.isArray(baseConfig.subProcesses)) {
            this.config.subProcesses = {};
            if (baseConfig.subProcesses !== undefined) {
                updated = true;
            }
        } else {
            const normalizedSubProcesses = {};
            Object.entries(baseConfig.subProcesses).forEach(([key, value]) => {
                normalizedSubProcesses[key] = Array.isArray(value)
                    ? value.map(item => ({ ...item }))
                    : [];
                if (!Array.isArray(value)) {
                    updated = true;
                }
            });
            this.config.subProcesses = normalizedSubProcesses;
        }

        if (Array.isArray(baseConfig.processes)) {
            this.config.processes = baseConfig.processes.map(process => ({ ...process }));
        } else {
            this.config.processes = Array.isArray(fallback.processes)
                ? fallback.processes.map(process => ({ ...process }))
                : [];
            if (baseConfig.processes !== undefined) {
                updated = true;
            }
        }

        this.config.processes.forEach(process => {
            if (!process || !process.value) return;
            if (!Array.isArray(this.config.subProcesses[process.value])) {
                this.config.subProcesses[process.value] = [];
                updated = true;
            } else {
                this.config.subProcesses[process.value] = this.config.subProcesses[process.value].map(item => ({ ...item }));
            }
        });

        return updated;
    }

    getSnapshot() {
        return JSON.parse(JSON.stringify({
            risks: this.risks,
            controls: this.controls,
            actionPlans: this.actionPlans,
            history: this.history,
            config: this.config
        }));
    }

    loadSnapshot(snapshot) {
        if (!snapshot || typeof snapshot !== 'object') {
            throw new Error('Instantané invalide');
        }

        const cloneArray = (value) => Array.isArray(value)
            ? JSON.parse(JSON.stringify(value))
            : [];

        const cloneObject = (value) => (value && typeof value === 'object' && !Array.isArray(value))
            ? JSON.parse(JSON.stringify(value))
            : this.getDefaultConfig();

        this.risks = cloneArray(snapshot.risks);
        this.controls = cloneArray(snapshot.controls);
        this.actionPlans = cloneArray(snapshot.actionPlans);
        this.history = cloneArray(snapshot.history);
        this.config = cloneObject(snapshot.config);

        this.ensureConfigStructure();

        this.risks.forEach(risk => {
            if (!risk) return;
            if (!Array.isArray(risk.actionPlans) || risk.actionPlans.length === 0) {
                risk.probPost = risk.probNet;
                risk.impactPost = risk.impactNet;
            }
        });

        this.saveData();
        this.saveConfig();

        this.populateSelects();
        this.needsConfigStructureRerender = true;
        this.renderAll();
        if (this.needsConfigStructureRerender) {
            this.renderConfiguration();
            this.needsConfigStructureRerender = false;
        }
        this.updateLastSaveTime();

        this.addHistoryItem('Import instantané', 'Sauvegarde importée depuis un fichier');

        if (typeof showNotification === 'function') {
            showNotification('success', 'Données importées avec succès');
        }
    }

    populateSelects() {
        const fill = (ids, options, placeholder) => {
            const targetIds = Array.isArray(ids) ? ids : [ids];
            const optionList = Array.isArray(options) ? options : [];

            targetIds.forEach(id => {
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

                optionList.forEach(o => {
                    if (!o || typeof o !== 'object') return;
                    const opt = document.createElement('option');
                    opt.value = o.value;
                    opt.textContent = o.label;
                    el.appendChild(opt);
                });

                if (current && optionList.some(o => o && o.value === current)) {
                    el.value = current;
                }
            });
        };

        fill(['matrixProcessFilter', 'risksProcessFilter'], this.config.processes, 'Tous les processus');
        fill(['matrixRiskTypeFilter', 'risksTypeFilter'], this.config.riskTypes, 'Tous les types');
        fill(['matrixStatusFilter', 'risksStatusFilter'], this.config.riskStatuses, 'Tous les statuts');
        fill('processus', this.config.processes, 'Sélectionner...');
        this.updateSousProcessusOptions();
        fill('typeCorruption', this.config.riskTypes, 'Sélectionner...');
        fill('statut', this.config.riskStatuses, 'Sélectionner...');
        fill('tiers', this.config.tiers);
        fill('controlType', this.config.controlTypes, 'Sélectionner...');
        fill('controlFrequency', this.config.controlFrequencies, 'Sélectionner...');
        fill('controlMode', this.config.controlModes, 'Sélectionner...');
        fill('controlEffectiveness', this.config.controlEffectiveness, 'Sélectionner...');
        fill('controlStatus', this.config.controlStatuses, 'Sélectionner...');
        fill('controlsTypeFilter', this.config.controlTypes, 'Tous les types de contrôle');
        fill('controlsStatusFilter', this.config.controlStatuses, 'Tous les statuts');
        fill('planStatus', this.config.actionPlanStatuses, 'Sélectionner...');
        fill('actionPlansStatusFilter', this.config.actionPlanStatuses, 'Tous les statuts');

        const syncFilterValue = (filterKey, value, options = {}) => {
            if (typeof document === 'undefined') return;
            const normalizedKey = typeof filterKey === 'string' ? filterKey : '';
            if (!normalizedKey) return;
            const normalizedValue = value == null ? '' : String(value);
            const attributeName = typeof options.attribute === 'string' && options.attribute
                ? options.attribute
                : 'data-filter-key';

            document.querySelectorAll(`[${attributeName}="${normalizedKey}"]`).forEach(element => {
                if (!('value' in element)) {
                    return;
                }

                if (element.tagName === 'SELECT') {
                    if (normalizedValue && !Array.from(element.options).some(opt => opt.value === normalizedValue)) {
                        const opt = document.createElement('option');
                        opt.value = normalizedValue;
                        opt.textContent = normalizedValue;
                        element.appendChild(opt);
                    }
                }

                if (element.value !== normalizedValue) {
                    element.value = normalizedValue;
                }
            });
        };

        syncFilterValue('type', this.controlFilters?.type || '');
        syncFilterValue('status', this.controlFilters?.status || '');
        syncFilterValue('search', this.controlFilters?.search || '');
        syncFilterValue('name', this.actionPlanFilters?.name || '', { attribute: 'data-action-plan-filter' });
        syncFilterValue('owner', this.actionPlanFilters?.owner || '', { attribute: 'data-action-plan-filter' });
        syncFilterValue('status', this.actionPlanFilters?.status || '', { attribute: 'data-action-plan-filter' });
        syncFilterValue('dueDateOrder', this.actionPlanFilters?.dueDateOrder || '', { attribute: 'data-action-plan-filter' });

        const riskFilterSync = typeof window !== 'undefined' && typeof window.syncRiskFilterWidgets === 'function'
            ? window.syncRiskFilterWidgets
            : null;

        if (riskFilterSync) {
            Object.entries(this.filters).forEach(([key, value]) => {
                riskFilterSync(key, value, null);
            });
        } else if (typeof document !== 'undefined') {
            document.querySelectorAll('[data-risk-filter]').forEach(element => {
                const key = element.dataset?.riskFilter;
                if (!key || !(key in this.filters)) {
                    return;
                }
                const normalizedValue = this.filters[key] == null ? '' : String(this.filters[key]);
                if (element.tagName === 'SELECT') {
                    if (normalizedValue && !Array.from(element.options).some(opt => opt.value === normalizedValue)) {
                        const opt = document.createElement('option');
                        opt.value = normalizedValue;
                        opt.textContent = normalizedValue;
                        element.appendChild(opt);
                    }
                }
                if (element.value !== normalizedValue) {
                    element.value = normalizedValue;
                }
            });
        }
    }

    setupAutoValueSync(labelInput, valueInput) {
        if (!labelInput || !valueInput) {
            return;
        }

        const slugifyFn = typeof slugifyLabel === 'function'
            ? slugifyLabel
            : (str) => String(str || '')
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');

        const computeAutoValue = () => slugifyFn(labelInput.value || '');

        const updateManualFlag = () => {
            const currentValue = valueInput.value.trim();
            const autoValue = valueInput.dataset.autoValue || '';
            valueInput.dataset.manual = currentValue && currentValue !== autoValue ? 'true' : 'false';
        };

        const updateAutoValue = () => {
            const generated = computeAutoValue();
            const currentValue = valueInput.value.trim();
            const lastAuto = valueInput.dataset.autoValue || '';
            const manualOverride = valueInput.dataset.manual === 'true' && currentValue !== lastAuto;

            if (!manualOverride || currentValue === '' || currentValue === lastAuto) {
                valueInput.value = generated;
            }

            valueInput.dataset.autoValue = generated;
            updateManualFlag();
        };

        const handleValueInput = () => {
            updateManualFlag();
        };

        const initialAuto = computeAutoValue();
        valueInput.dataset.autoValue = initialAuto;
        if (valueInput.value.trim() === '') {
            valueInput.value = initialAuto;
        }
        updateManualFlag();

        labelInput.addEventListener('input', updateAutoValue);
        labelInput.addEventListener('change', updateAutoValue);
        valueInput.addEventListener('input', handleValueInput);
        valueInput.addEventListener('change', handleValueInput);
    }

    renderConfiguration() {
        const container = document.getElementById('configurationContainer');
        if (!container) return;

        const sections = {
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

        container.innerHTML = '';

        const accordion = document.createElement('div');
        accordion.className = 'config-accordion';
        container.appendChild(accordion);

        Object.entries(sections).forEach(([key, label], index) => {
            const item = document.createElement('div');
            item.className = 'config-accordion-item';

            const headerButton = document.createElement('button');
            headerButton.type = 'button';
            headerButton.className = 'config-accordion-header';
            headerButton.id = `config-accordion-${key}-header`;
            headerButton.innerHTML = `
                <span class="config-accordion-title">${label}</span>
                <span class="config-accordion-icon" aria-hidden="true"></span>
            `;

            const body = document.createElement('div');
            body.className = 'config-accordion-body';
            body.id = `config-accordion-${key}-panel`;
            body.setAttribute('aria-labelledby', headerButton.id);
            body.setAttribute('role', 'region');
            headerButton.setAttribute('aria-controls', body.id);

            item.appendChild(headerButton);
            item.appendChild(body);
            accordion.appendChild(item);

            this.configureAccordionItem(item, headerButton, body, index === 0);

            const list = document.createElement('ul');
            list.id = `list-${key}`;
            list.className = 'config-list';

            const addContainer = document.createElement('div');
            addContainer.className = 'config-add';

            const labelInput = document.createElement('input');
            labelInput.type = 'text';
            labelInput.id = `input-${key}-label`;
            labelInput.placeholder = 'Libellé à saisir';
            labelInput.classList.add('config-input-label');

            const valueInput = document.createElement('input');
            valueInput.type = 'text';
            valueInput.id = `input-${key}-value`;
            valueInput.placeholder = 'Valeur auto-générée';
            valueInput.classList.add('config-input-value');

            const addButton = document.createElement('button');
            addButton.type = 'button';
            addButton.textContent = 'Ajouter';
            addButton.addEventListener('click', () => {
                this.addConfigOption(key);
            });

            addContainer.appendChild(labelInput);
            addContainer.appendChild(valueInput);
            addContainer.appendChild(addButton);

            body.appendChild(list);
            body.appendChild(addContainer);

            this.setupAutoValueSync(labelInput, valueInput);
        });

        const subItem = document.createElement('div');
        subItem.className = 'config-accordion-item';

        const subHeader = document.createElement('button');
        subHeader.type = 'button';
        subHeader.className = 'config-accordion-header';
        subHeader.id = 'config-accordion-subprocesses-header';
        subHeader.innerHTML = `
            <span class="config-accordion-title">Sous-processus</span>
            <span class="config-accordion-icon" aria-hidden="true"></span>
        `;

        const subBody = document.createElement('div');
        subBody.className = 'config-accordion-body';
        subBody.id = 'config-accordion-subprocesses-panel';
        subBody.setAttribute('aria-labelledby', subHeader.id);
        subBody.setAttribute('role', 'region');
        subHeader.setAttribute('aria-controls', subBody.id);

        const subProcessContainer = document.createElement('div');
        subProcessContainer.id = 'subProcessConfig';
        subBody.appendChild(subProcessContainer);

        subItem.appendChild(subHeader);
        subItem.appendChild(subBody);
        accordion.appendChild(subItem);

        this.configureAccordionItem(subItem, subHeader, subBody);

        this.refreshConfigLists();
        this.renderSubProcessConfig();
        this.adjustOpenAccordionBodies(container);
    }

    configureAccordionItem(item, headerButton, body, initiallyOpen = false) {
        if (!item || !headerButton || !body) {
            return { setOpen: () => {} };
        }

        const findDirectChild = (element, selector) => {
            return Array.from(element.children).find(child => child.matches(selector));
        };

        const closeAccordionItem = (targetItem) => {
            const targetHeader = findDirectChild(targetItem, '.config-accordion-header');
            const targetBody = findDirectChild(targetItem, '.config-accordion-body');

            targetItem.classList.remove('open');
            if (targetHeader) {
                targetHeader.setAttribute('aria-expanded', 'false');
            }
            if (targetBody) {
                targetBody.setAttribute('aria-hidden', 'true');
                targetBody.style.maxHeight = '0px';
            }
        };

        const setState = (open) => {
            if (open) {
                item.classList.add('open');
                headerButton.setAttribute('aria-expanded', 'true');
                body.setAttribute('aria-hidden', 'false');
                body.style.maxHeight = `${body.scrollHeight}px`;
                requestAnimationFrame(() => {
                    this.adjustOpenAccordionBodies(item.closest('.config-accordion') || document);
                });
            } else {
                item.classList.remove('open');
                headerButton.setAttribute('aria-expanded', 'false');
                body.setAttribute('aria-hidden', 'true');
                body.style.maxHeight = '0px';
            }
        };

        headerButton.addEventListener('click', () => {
            const willOpen = !item.classList.contains('open');
            if (willOpen) {
                const parent = item.parentElement;
                if (parent instanceof HTMLElement) {
                    Array.from(parent.children)
                        .filter(child => child !== item && child instanceof HTMLElement && child.classList.contains('config-accordion-item') && child.classList.contains('open'))
                        .forEach(openItem => closeAccordionItem(openItem));
                }
            }
            setState(willOpen);
        });

        headerButton.setAttribute('aria-expanded', 'false');
        body.setAttribute('aria-hidden', 'true');
        body.style.maxHeight = '0px';

        if (initiallyOpen) {
            requestAnimationFrame(() => setState(true));
        }

        return { setOpen: setState };
    }

    adjustOpenAccordionBodies(scope) {
        const root = scope instanceof HTMLElement ? scope : document;
        root.querySelectorAll('.config-accordion-item.open > .config-accordion-body').forEach(body => {
            body.style.maxHeight = `${body.scrollHeight}px`;
        });
    }

    refreshConfigLists() {
        const createListItem = (key, opt, idx) => {
            const listItem = document.createElement('li');

            const renderDisplay = () => {
                listItem.innerHTML = '';

                const textSpan = document.createElement('span');
                textSpan.className = 'config-item-text';
                textSpan.textContent = `${opt.label} (${opt.value})`;
                listItem.appendChild(textSpan);

                const actions = document.createElement('div');
                actions.className = 'config-item-actions';

                const editButton = document.createElement('button');
                editButton.type = 'button';
                editButton.className = 'btn btn-secondary';
                editButton.textContent = 'Modifier';
                editButton.addEventListener('click', () => {
                    renderEditForm();
                });

                const removeButton = document.createElement('button');
                removeButton.type = 'button';
                removeButton.className = 'btn btn-outline';
                removeButton.textContent = 'Supprimer';
                removeButton.addEventListener('click', () => {
                    this.removeConfigOption(key, idx);
                });

                actions.appendChild(editButton);
                actions.appendChild(removeButton);
                listItem.appendChild(actions);

                this.adjustOpenAccordionBodies();
            };

            const renderEditForm = () => {
                listItem.innerHTML = '';

                const form = document.createElement('div');
                form.className = 'config-edit-form';

                const labelInput = document.createElement('input');
                labelInput.type = 'text';
                labelInput.value = opt.label;
                labelInput.placeholder = 'Libellé à saisir';
                labelInput.className = 'config-edit-input config-input-label';

                const valueInput = document.createElement('input');
                valueInput.type = 'text';
                valueInput.value = opt.value;
                valueInput.placeholder = 'Valeur auto-générée';
                valueInput.className = 'config-edit-input config-input-value';

                const actions = document.createElement('div');
                actions.className = 'config-item-actions';

                const saveButton = document.createElement('button');
                saveButton.type = 'button';
                saveButton.className = 'btn btn-success';
                saveButton.textContent = 'Enregistrer';
                saveButton.addEventListener('click', () => {
                    const value = valueInput.value.trim();
                    const label = labelInput.value.trim();
                    if (!value || !label) return;
                    this.updateConfigOption(key, idx, { value, label });
                });

                const cancelButton = document.createElement('button');
                cancelButton.type = 'button';
                cancelButton.className = 'btn btn-outline';
                cancelButton.textContent = 'Annuler';
                cancelButton.addEventListener('click', () => {
                    renderDisplay();
                });

                actions.appendChild(saveButton);
                actions.appendChild(cancelButton);

                form.appendChild(labelInput);
                form.appendChild(valueInput);
                form.appendChild(actions);
                this.setupAutoValueSync(labelInput, valueInput);
                listItem.appendChild(form);

                this.adjustOpenAccordionBodies();
            };

            renderDisplay();
            return listItem;
        };

        const updateList = (key) => {
            const list = document.getElementById(`list-${key}`);
            if (!list) return;
            list.innerHTML = '';
            this.config[key].forEach((opt, idx) => {
                const item = createListItem(key, opt, idx);
                list.appendChild(item);
            });
        };

        Object.keys(this.config)
            .filter(k => k !== 'subProcesses')
            .forEach(updateList);

        this.adjustOpenAccordionBodies();
    }

    updateConfigOption(key, index, updated) {
        if (!this.config[key] || !this.config[key][index]) return;
        const { value, label } = updated;
        if (!value || !label) return;

        const previous = this.config[key][index];
        this.config[key][index] = { value, label };

        if (key === 'processes') {
            if (previous.value !== value) {
                const previousSubs = this.config.subProcesses[previous.value] || [];
                const targetSubs = this.config.subProcesses[value] || [];
                const mergedSubs = [...targetSubs];
                previousSubs.forEach(sub => {
                    if (!mergedSubs.some(existing => existing.value === sub.value)) {
                        mergedSubs.push(sub);
                    }
                });
                this.config.subProcesses[value] = mergedSubs;
                delete this.config.subProcesses[previous.value];

                if (this.filters.process === previous.value) {
                    this.filters.process = value;
                }

                this.risks.forEach(risk => {
                    if (risk.processus === previous.value) {
                        risk.processus = value;
                        const availableSubs = this.config.subProcesses[value] || [];
                        if (!availableSubs.some(sub => sub.value === risk.sousProcessus)) {
                            risk.sousProcessus = '';
                        }
                    }
                });
                this.saveData();
            }
            this.saveConfig();
            this.populateSelects();
            this.renderAll();
        } else {
            this.saveConfig();
            this.populateSelects();
            this.refreshConfigLists();
        }
    }

    addConfigOption(key) {
        const valueInput = document.getElementById(`input-${key}-value`);
        const labelInput = document.getElementById(`input-${key}-label`);
        if (!valueInput || !labelInput) return;
        const value = valueInput.value.trim();
        const label = labelInput.value.trim();
        if (!value || !label) return;
        this.config[key].push({ value, label });
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
        valueInput.value = '';
        labelInput.value = '';
    }

    removeConfigOption(key, index) {
        if (key === 'processes') {
            const removed = this.config.processes.splice(index, 1)[0];
            delete this.config.subProcesses[removed.value];
            this.saveConfig();
            this.populateSelects();
            this.renderConfiguration();
        } else {
            this.config[key].splice(index, 1);
            this.saveConfig();
            this.populateSelects();
            this.refreshConfigLists();
        }
    }

    renderSubProcessConfig() {
        const container = document.getElementById('subProcessConfig');
        if (!container) return;

        container.innerHTML = '';

        if (!this.config.processes.length) {
            const empty = document.createElement('p');
            empty.className = 'config-empty';
            empty.textContent = 'Ajoutez un processus pour configurer ses sous-processus.';
            container.appendChild(empty);
            this.adjustOpenAccordionBodies(container);
            return;
        }

        const subAccordion = document.createElement('div');
        subAccordion.className = 'config-accordion config-accordion-nested';
        container.appendChild(subAccordion);

        this.config.processes.forEach((proc, index) => {
            const procId = sanitizeId(proc.value);

            const item = document.createElement('div');
            item.className = 'config-accordion-item';

            const headerButton = document.createElement('button');
            headerButton.type = 'button';
            headerButton.className = 'config-accordion-header';
            headerButton.id = `subprocess-accordion-${procId}-header`;
            headerButton.innerHTML = `
                <span class="config-accordion-title">${proc.label}</span>
                <span class="config-accordion-icon" aria-hidden="true"></span>
            `;

            const body = document.createElement('div');
            body.className = 'config-accordion-body';
            body.id = `subprocess-accordion-${procId}-panel`;
            body.setAttribute('aria-labelledby', headerButton.id);
            body.setAttribute('role', 'region');
            headerButton.setAttribute('aria-controls', body.id);

            const list = document.createElement('ul');
            list.id = `list-sub-${procId}`;
            list.className = 'config-list';

            const addContainer = document.createElement('div');
            addContainer.className = 'config-add';

            const labelInput = document.createElement('input');
            labelInput.type = 'text';
            labelInput.id = `input-sub-${procId}-label`;
            labelInput.placeholder = 'Libellé à saisir';
            labelInput.classList.add('config-input-label');

            const valueInput = document.createElement('input');
            valueInput.type = 'text';
            valueInput.id = `input-sub-${procId}-value`;
            valueInput.placeholder = 'Valeur auto-générée';
            valueInput.classList.add('config-input-value');

            const addButton = document.createElement('button');
            addButton.type = 'button';
            addButton.textContent = 'Ajouter';
            addButton.dataset.process = proc.value;
            addButton.addEventListener('click', (event) => {
                const { process } = event.currentTarget.dataset;
                if (typeof process !== 'undefined') {
                    this.addSubProcess(process);
                }
            });

            addContainer.appendChild(labelInput);
            addContainer.appendChild(valueInput);
            addContainer.appendChild(addButton);

            body.appendChild(list);
            body.appendChild(addContainer);

            item.appendChild(headerButton);
            item.appendChild(body);
            subAccordion.appendChild(item);

            this.configureAccordionItem(item, headerButton, body, index === 0);
            this.setupAutoValueSync(labelInput, valueInput);
        });

        this.refreshSubProcessLists();
        this.adjustOpenAccordionBodies(container);
    }

    refreshSubProcessLists() {
        this.config.processes.forEach(proc => {
            const procId = sanitizeId(proc.value);
            const list = document.getElementById(`list-sub-${procId}`);
            if (!list) return;
            const subs = this.config.subProcesses[proc.value] || [];
            list.innerHTML = '';
            subs.forEach((sp, idx) => {
                const listItem = document.createElement('li');

                const renderDisplay = () => {
                    listItem.innerHTML = '';

                    const textSpan = document.createElement('span');
                    textSpan.className = 'config-item-text';
                    textSpan.textContent = `${sp.label} (${sp.value})`;
                    listItem.appendChild(textSpan);

                    const actions = document.createElement('div');
                    actions.className = 'config-item-actions';

                    const editButton = document.createElement('button');
                    editButton.type = 'button';
                    editButton.className = 'btn btn-secondary';
                    editButton.textContent = 'Modifier';
                    editButton.addEventListener('click', () => {
                        renderEditForm();
                    });

                    const removeButton = document.createElement('button');
                    removeButton.type = 'button';
                    removeButton.className = 'btn btn-outline';
                    removeButton.textContent = 'Supprimer';
                    removeButton.addEventListener('click', () => {
                        this.removeSubProcess(proc.value, idx);
                    });

                    actions.appendChild(editButton);
                    actions.appendChild(removeButton);
                    listItem.appendChild(actions);

                    this.adjustOpenAccordionBodies();
                };

                const renderEditForm = () => {
                    listItem.innerHTML = '';

                    const form = document.createElement('div');
                    form.className = 'config-edit-form';

                    const labelInput = document.createElement('input');
                    labelInput.type = 'text';
                    labelInput.value = sp.label;
                    labelInput.placeholder = 'Libellé à saisir';
                    labelInput.className = 'config-edit-input config-input-label';

                    const valueInput = document.createElement('input');
                    valueInput.type = 'text';
                    valueInput.value = sp.value;
                    valueInput.placeholder = 'Valeur auto-générée';
                    valueInput.className = 'config-edit-input config-input-value';

                    const actions = document.createElement('div');
                    actions.className = 'config-item-actions';

                    const saveButton = document.createElement('button');
                    saveButton.type = 'button';
                    saveButton.className = 'btn btn-success';
                    saveButton.textContent = 'Enregistrer';
                    saveButton.addEventListener('click', () => {
                        const value = valueInput.value.trim();
                        const label = labelInput.value.trim();
                        if (!value || !label) return;
                        this.updateSubProcess(proc.value, idx, { value, label });
                    });

                    const cancelButton = document.createElement('button');
                    cancelButton.type = 'button';
                    cancelButton.className = 'btn btn-outline';
                    cancelButton.textContent = 'Annuler';
                    cancelButton.addEventListener('click', () => {
                        renderDisplay();
                    });

                    actions.appendChild(saveButton);
                    actions.appendChild(cancelButton);

                    form.appendChild(labelInput);
                    form.appendChild(valueInput);
                    form.appendChild(actions);
                    this.setupAutoValueSync(labelInput, valueInput);
                    listItem.appendChild(form);

                    this.adjustOpenAccordionBodies();
                };

                renderDisplay();
                list.appendChild(listItem);
            });
        });

        this.adjustOpenAccordionBodies();
    }

    updateSubProcess(process, index, updated) {
        if (!this.config.subProcesses[process] || !this.config.subProcesses[process][index]) return;
        const { value, label } = updated;
        if (!value || !label) return;

        const previous = this.config.subProcesses[process][index];
        this.config.subProcesses[process][index] = { value, label };

        if (previous.value !== value) {
            this.risks.forEach(risk => {
                if (risk.processus === process && risk.sousProcessus === previous.value) {
                    risk.sousProcessus = value;
                }
            });
            this.saveData();
        }

        this.saveConfig();
        this.updateSousProcessusOptions();
        this.refreshSubProcessLists();
        this.updateRisksList();
    }

    addSubProcess(process) {
        const procId = sanitizeId(process);
        const valueInput = document.getElementById(`input-sub-${procId}-value`);
        const labelInput = document.getElementById(`input-sub-${procId}-label`);
        if (!valueInput || !labelInput) return;
        const value = valueInput.value.trim();
        const label = labelInput.value.trim();
        if (!value || !label) return;
        if (!this.config.subProcesses || typeof this.config.subProcesses !== 'object' || Array.isArray(this.config.subProcesses)) {
            this.config.subProcesses = {};
        }
        this.config.subProcesses[process] = this.config.subProcesses[process] || [];
        this.config.subProcesses[process].push({ value, label });
        this.saveConfig();
        this.updateSousProcessusOptions();
        this.refreshSubProcessLists();
        valueInput.value = '';
        labelInput.value = '';
    }

    removeSubProcess(process, index) {
        if (!this.config.subProcesses[process]) return;
        this.config.subProcesses[process].splice(index, 1);
        this.saveConfig();
        this.updateSousProcessusOptions();
        this.refreshSubProcessLists();
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
        this.updateLastSaveTime();
    }

    loadData(key) {
        const data = localStorage.getItem(`rms_${key}`);
        return data ? JSON.parse(data) : null;
    }

    updateLastSaveTime() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const lastSaveElement = document.getElementById('lastSaveTime');
        if (lastSaveElement) {
            lastSaveElement.textContent = timeStr;
        }
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
            const slots = cellCounts[key];
            const gridSize = Math.ceil(Math.sqrt(slots));
            const slotIndex = index;
            const row = Math.floor(slotIndex / gridSize);
            const col = slotIndex % gridSize;

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
            const step = diameter + margin;
            const dx = (col - (gridSize - 1) / 2) * step;
            const dy = (row - (gridSize - 1) / 2) * step;

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
        const targetId = String(riskId);
        const risk = this.risks.find(r => idsEqual(r.id, targetId));
        if (!risk) return;

        // Update selected state in details panel
        let selectedElement = null;
        document.querySelectorAll('.risk-item').forEach(item => {
            item.classList.remove('selected');
            if (idsEqual(item.dataset.riskId, targetId)) {
                item.classList.add('selected');
                selectedElement = item;
            }
        });

        if (selectedElement) {
            this.scrollRiskItemIntoView(selectedElement);
        }

        // Show risk details
        this.showRiskDetails(risk);
    }

    scrollRiskItemIntoView(element) {
        if (!element) return;

        const scrollContainer = element.closest('.risk-details-panel');
        if (scrollContainer) {
            const containerRect = scrollContainer.getBoundingClientRect();
            const targetRect = element.getBoundingClientRect();
            const offset = targetRect.top - containerRect.top + scrollContainer.scrollTop;
            const desiredTop = Math.max(offset - (scrollContainer.clientHeight / 2) + (element.offsetHeight / 2), 0);

            if (typeof scrollContainer.scrollTo === 'function') {
                scrollContainer.scrollTo({
                    top: desiredTop,
                    behavior: 'smooth'
                });
            } else {
                scrollContainer.scrollTop = desiredTop;
            }
        } else if (typeof element.scrollIntoView === 'function') {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    showRiskDetails(risk) {
        // Could open a modal or update a details panel
        console.log('Risk details:', risk);
    }

    updateRiskDetailsList() {
        const container = document.getElementById('riskDetailsList');
        if (!container) return;
        
        const filteredRisks = this.getFilteredRisks();
        const viewConfig = {
            'brut': { prob: 'probBrut', impact: 'impactBrut' },
            'net': { prob: 'probNet', impact: 'impactNet' },
            'post': { prob: 'probPost', impact: 'impactPost' },
            'post-mitigation': { prob: 'probPost', impact: 'impactPost' }
        };
        const { prob: probKey, impact: impactKey } = viewConfig[this.currentView] || viewConfig['brut'];

        const scoredRisks = filteredRisks.map(risk => {
            const prob = Number(risk[probKey]) || 0;
            const impact = Number(risk[impactKey]) || 0;
            return {
                risk,
                prob,
                impact,
                score: prob * impact
            };
        }).sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (b.prob !== a.prob) return b.prob - a.prob;
            if (b.impact !== a.impact) return b.impact - a.impact;

            const descComparison = (a.risk.description || '').localeCompare(b.risk.description || '', undefined, { sensitivity: 'base' });
            if (descComparison !== 0) return descComparison;

            return String(a.risk.id).localeCompare(String(b.risk.id), undefined, { numeric: true, sensitivity: 'base' });
        });

        container.innerHTML = scoredRisks.map(({ risk, score }) => {
            let scoreClass = 'low';
            if (score > 12) scoreClass = 'critical';
            else if (score > 8) scoreClass = 'high';
            else if (score > 4) scoreClass = 'medium';

            const sp = risk.sousProcessus ? ` > ${risk.sousProcessus}` : '';
            return `
                <div class="risk-item" data-risk-id="${risk.id}" onclick="rms.selectRisk(${JSON.stringify(risk.id)})">
                    <div class="risk-item-header">
                        <span class="risk-item-title">${risk.description}</span>
                        <span class="risk-item-score ${scoreClass}">${score}</span>
                    </div>
                    <div class="risk-item-meta">
                        ${risk.processus}${sp}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Dashboard functions
    updateDashboard() {
        // Update stats
        const stats = this.calculateStats();
        const metrics = this.computeDashboardMetrics(stats);

        this.updateKpiCards({ ...metrics, previous: this.lastDashboardMetrics });
        this.updateCharts();
        this.updateRecentAlerts();

        this.lastDashboardMetrics = metrics;
    }

    computeDashboardMetrics(stats) {
        const totalRisks = stats?.total || 0;

        const totals = this.risks.reduce((acc, risk) => {
            const brut = (Number(risk?.probBrut) || 0) * (Number(risk?.impactBrut) || 0);
            const net = (Number(risk?.probNet) || 0) * (Number(risk?.impactNet) || 0);
            const post = (Number(risk?.probPost) || 0) * (Number(risk?.impactPost) || 0);

            return {
                brut: acc.brut + brut,
                net: acc.net + net,
                post: acc.post + post
            };
        }, { brut: 0, net: 0, post: 0 });

        const maxScorePerRisk = 16; // 4x4 matrix
        const potentialScore = totalRisks * maxScorePerRisk;
        const rawResidualScore = totals.net;
        const normalizedScore = potentialScore > 0
            ? Math.max(0, Math.min(1, 1 - (rawResidualScore / potentialScore)))
            : 1;
        const globalScore = Math.round(normalizedScore * 100);

        const averageReduction = totalRisks > 0
            ? Math.max((totals.brut - totals.net) / totalRisks, 0)
            : 0;

        const activeControls = Array.isArray(this.controls)
            ? this.controls.filter(control => String(control?.status || '').toLowerCase() === 'actif').length
            : 0;
        const totalControls = Array.isArray(this.controls) ? this.controls.length : 0;

        return {
            stats: { ...stats },
            activeControls,
            totalControls,
            globalScore,
            averageReduction
        };
    }

    updateKpiCards(metrics) {
        if (!metrics || !metrics.stats) return;

        const { stats, activeControls, totalControls, globalScore, averageReduction, previous } = metrics;
        const previousStats = previous?.stats || null;
        const previousActiveControls = previous?.activeControls ?? activeControls;
        const previousGlobalScore = previous?.globalScore ?? globalScore;

        const applyTrend = (element, delta, { inverted = false, stableLabel = '→ Stable', formatter } = {}) => {
            if (!element) return;

            element.classList.remove('positive', 'negative');

            if (!Number.isFinite(delta) || delta === 0) {
                const label = typeof stableLabel === 'function' ? stableLabel() : stableLabel;
                element.textContent = label;
                return;
            }

            const arrow = delta > 0 ? '↑' : '↓';
            const signedValue = `${delta > 0 ? '+' : ''}${delta}`;
            const message = formatter
                ? formatter({ arrow, signedValue, delta })
                : `${arrow} ${signedValue} vs dernière mesure`;
            element.textContent = message;

            const isPositiveChange = inverted ? delta < 0 : delta > 0;
            element.classList.add(isPositiveChange ? 'positive' : 'negative');
        };

        const updateCard = (selector, updateFn) => {
            const card = document.querySelector(selector);
            if (!card) return;
            updateFn(card);
        };

        updateCard('.stat-card.danger', (card) => {
            const valueEl = card.querySelector('.stat-value');
            if (valueEl) {
                valueEl.textContent = stats.critical;
            }

            const share = stats.total > 0 ? Math.round((stats.critical / stats.total) * 100) : 0;
            const delta = stats.critical - (previousStats?.critical ?? stats.critical);
            const changeEl = card.querySelector('.stat-change');
            applyTrend(changeEl, delta, {
                inverted: true,
                stableLabel: () => `${share}% du total`,
                formatter: ({ arrow, signedValue }) => `${arrow} ${signedValue} (${share}% du total)`
            });
        });

        updateCard('.stat-card.warning', (card) => {
            const valueEl = card.querySelector('.stat-value');
            if (valueEl) {
                valueEl.textContent = stats.high;
            }

            const share = stats.total > 0 ? Math.round((stats.high / stats.total) * 100) : 0;
            const delta = stats.high - (previousStats?.high ?? stats.high);
            const changeEl = card.querySelector('.stat-change');
            applyTrend(changeEl, delta, {
                inverted: true,
                stableLabel: () => `${share}% du total`,
                formatter: ({ arrow, signedValue }) => `${arrow} ${signedValue} (${share}% du total)`
            });
        });

        updateCard('.stat-card.success', (card) => {
            const valueEl = card.querySelector('.stat-value');
            if (valueEl) {
                valueEl.textContent = activeControls;
            }

            const ratio = totalControls > 0 ? Math.round((activeControls / totalControls) * 100) : 0;
            const delta = activeControls - previousActiveControls;
            const changeEl = card.querySelector('.stat-change');
            applyTrend(changeEl, delta, {
                inverted: false,
                stableLabel: () => `${ratio}% des contrôles actifs`,
                formatter: ({ arrow, signedValue }) => `${arrow} ${signedValue} vs dernière mesure (${ratio}% actifs)`
            });
        });

        updateCard('.stat-card.primary', (card) => {
            const valueEl = card.querySelector('.stat-value');
            if (valueEl) {
                valueEl.textContent = `${globalScore}%`;
            }

            const delta = globalScore - previousGlobalScore;
            const changeEl = card.querySelector('.stat-change');
            const reductionLabel = `${averageReduction.toFixed(1)} pts de réduction moyenne`;
            applyTrend(changeEl, delta, {
                inverted: false,
                stableLabel: () => reductionLabel,
                formatter: ({ arrow, signedValue }) => `${arrow} ${signedValue} pts vs dernière mesure (${reductionLabel})`
            });
        });

        const dashboardBadge = document.querySelector('.tabs-container .tab .tab-badge');
        if (dashboardBadge) {
            dashboardBadge.textContent = String(stats.critical + stats.high);
        }
    }

    updateRecentAlerts() {
        const tbody = document.getElementById('recentAlertsBody');
        if (!tbody) return;

        const highRisks = this.risks
            .filter(risk => {
                const score = (risk.probNet || 0) * (risk.impactNet || 0);
                const hasPlans = risk.actionPlans && risk.actionPlans.length > 0;
                return score > 8 && !hasPlans;
            })
            .sort((a, b) => {
                const getTime = (risk) => {
                    const dateValue = risk.dateCreation || risk.date || risk.createdAt;
                    const parsed = dateValue ? new Date(dateValue).getTime() : 0;
                    return isNaN(parsed) ? 0 : parsed;
                };
                return getTime(b) - getTime(a);
            });

        if (highRisks.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="table-empty">Aucune alerte récente</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = highRisks.map(risk => {
            const score = (risk.probNet || 0) * (risk.impactNet || 0);
            const isCritical = score > 12;
            const badgeClass = isCritical ? 'badge-danger' : 'badge-warning';
            const levelLabel = isCritical ? 'Critique' : 'Élevé';
            const dateValue = risk.dateCreation || risk.date || risk.createdAt;
            const parsedDate = dateValue ? new Date(dateValue) : null;
            const formattedDate = parsedDate && !isNaN(parsedDate) ? parsedDate.toLocaleDateString('fr-FR') : '-';
            const description = risk.description || 'Sans description';
            const process = risk.processus || '-';

            return `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${description}</td>
                    <td>${process}</td>
                    <td><span class="table-badge ${badgeClass}">${levelLabel}</span></td>
                    <td class="table-actions-cell">
                        <button class="action-btn" onclick="rms.selectRisk(${JSON.stringify(risk.id)})">👁️</button>
                        <button class="action-btn" onclick="rms.editRisk(${JSON.stringify(risk.id)})">✏️</button>
                    </td>
                </tr>
            `;
        }).join('');
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
        if (typeof Chart === 'undefined') {
            return;
        }

        if (!this.charts) {
            this.charts = {};
        }

        const evolutionCanvas = document.getElementById('evolutionChart');
        if (evolutionCanvas) {
            const now = new Date();
            const months = [];
            const monthIndexMap = new Map();

            for (let offset = 5; offset >= 0; offset--) {
                const refDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
                const key = `${refDate.getFullYear()}-${refDate.getMonth()}`;
                monthIndexMap.set(key, months.length);
                months.push({
                    key,
                    label: refDate.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
                });
            }

            const monthlyStats = months.map(() => ({ critical: 0, high: 0, total: 0 }));

            const parseDate = (value) => {
                if (!value) return null;
                if (value instanceof Date) return isNaN(value) ? null : value;
                if (typeof value === 'number') {
                    const date = new Date(value);
                    return isNaN(date) ? null : date;
                }
                if (typeof value === 'string') {
                    const trimmed = value.trim();
                    if (!trimmed) return null;

                    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
                        const [day, month, year] = trimmed.split('/').map(Number);
                        const date = new Date(year, month - 1, day);
                        return isNaN(date) ? null : date;
                    }

                    const date = new Date(trimmed);
                    return isNaN(date) ? null : date;
                }
                return null;
            };

            this.risks.forEach(risk => {
                const rawDate = risk?.dateCreation || risk?.date || risk?.createdAt;
                const parsedDate = parseDate(rawDate);
                if (!parsedDate) return;

                const monthKey = `${parsedDate.getFullYear()}-${parsedDate.getMonth()}`;
                const index = monthIndexMap.get(monthKey);
                if (index === undefined) return;

                const probNet = Number(risk?.probNet) || 0;
                const impactNet = Number(risk?.impactNet) || 0;
                const score = probNet * impactNet;

                monthlyStats[index].total += 1;
                if (score > 12) {
                    monthlyStats[index].critical += 1;
                } else if (score > 8) {
                    monthlyStats[index].high += 1;
                }
            });

            const evolutionData = {
                labels: months.map(month => month.label),
                datasets: [
                    {
                        label: 'Critiques',
                        data: monthlyStats.map(item => item.critical),
                        borderColor: 'rgba(231, 76, 60, 0.9)',
                        backgroundColor: 'rgba(231, 76, 60, 0.15)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 4
                    },
                    {
                        label: 'Élevés',
                        data: monthlyStats.map(item => item.high),
                        borderColor: 'rgba(241, 196, 15, 0.9)',
                        backgroundColor: 'rgba(241, 196, 15, 0.15)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 4
                    },
                    {
                        label: 'Total',
                        data: monthlyStats.map(item => item.total),
                        borderColor: 'rgba(52, 152, 219, 0.9)',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        fill: false,
                        borderDash: [5, 5],
                        tension: 0.2,
                        pointRadius: 3
                    }
                ]
            };

            const evolutionOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            };

            if (this.charts.evolution) {
                const chart = this.charts.evolution;
                chart.data.labels = evolutionData.labels;
                chart.data.datasets = evolutionData.datasets;
                chart.options = evolutionOptions;
                chart.update();
            } else {
                this.charts.evolution = new Chart(evolutionCanvas, {
                    type: 'line',
                    data: evolutionData,
                    options: evolutionOptions
                });
            }
        }

        const processCanvas = document.getElementById('processChart');
        if (processCanvas) {
            const processCounts = this.risks.reduce((acc, risk) => {
                const process = risk?.processus || 'Non défini';
                acc[process] = (acc[process] || 0) + 1;
                return acc;
            }, {});

            const processLabels = Object.keys(processCounts);
            if (processLabels.length === 0) {
                processLabels.push('Aucun risque');
                processCounts['Aucun risque'] = 0;
            }

            const dataValues = processLabels.map(label => processCounts[label]);
            const palette = [
                'rgba(52, 152, 219, 0.8)',
                'rgba(46, 204, 113, 0.8)',
                'rgba(241, 196, 15, 0.8)',
                'rgba(231, 76, 60, 0.8)',
                'rgba(155, 89, 182, 0.8)',
                'rgba(26, 188, 156, 0.8)',
                'rgba(230, 126, 34, 0.8)',
                'rgba(149, 165, 166, 0.8)'
            ];

            const colors = dataValues.map((_, index) => palette[index % palette.length]);

            const processData = {
                labels: processLabels,
                datasets: [
                    {
                        data: dataValues,
                        backgroundColor: colors,
                        borderColor: colors.map(color => color.replace('0.8', '1')),
                        borderWidth: 1
                    }
                ]
            };

            const processOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            };

            if (this.charts.process) {
                const chart = this.charts.process;
                chart.data.labels = processData.labels;
                chart.data.datasets = processData.datasets;
                chart.options = processOptions;
                chart.update();
            } else {
                this.charts.process = new Chart(processCanvas, {
                    type: 'doughnut',
                    data: processData,
                    options: processOptions
                });
            }
        }
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
                <td><span class="table-badge badge-${risk.statut === 'validé' ? 'success' : risk.statut === 'archive' ? 'danger' : 'warning'}">${risk.statut}</span></td>
                <td class="table-actions-cell">
                    <button class="action-btn" onclick="rms.editRisk(${JSON.stringify(risk.id)})">✏️</button>
                    <button class="action-btn" onclick="rms.deleteRisk(${JSON.stringify(risk.id)})">🗑️</button>
                </td>
            </tr>
        `).join('');
    }

    // Controls functions
    getFilteredControls() {
        const controls = Array.isArray(this.controls) ? this.controls : [];
        const { type = '', status = '', search = '' } = this.controlFilters || {};

        const typeFilter = String(type || '').toLowerCase();
        const statusFilter = String(status || '').toLowerCase();
        const searchTerm = String(search || '').trim().toLowerCase();

        if (!typeFilter && !statusFilter && !searchTerm) {
            return controls.slice();
        }

        return controls.filter(control => {
            const controlType = String(control?.type || '').toLowerCase();
            const controlStatus = String(control?.status || '').toLowerCase();
            const controlName = String(control?.name || '').toLowerCase();
            const controlOwner = String(control?.owner || '').toLowerCase();

            if (typeFilter && controlType !== typeFilter) {
                return false;
            }

            if (statusFilter && controlStatus !== statusFilter) {
                return false;
            }

            if (searchTerm && !controlName.includes(searchTerm) && !controlOwner.includes(searchTerm)) {
                return false;
            }

            return true;
        });
    }

    updateControlsList() {
        const container = document.getElementById('controlsList');
        if (!container) return;

        const allControls = Array.isArray(this.controls) ? this.controls : [];
        const filteredControls = this.getFilteredControls();

        if (!allControls.length) {
            container.innerHTML = `
                <div class="controls-empty-state">
                    <div class="controls-empty-title">Aucun contrôle enregistré</div>
                    <div class="controls-empty-text">Ajoutez votre premier contrôle pour suivre vos mesures de mitigation.</div>
                    <button class="btn btn-secondary" onclick="addNewControl()">+ Ajouter un contrôle</button>
                </div>
            `;
            return;
        }

        if (!filteredControls.length) {
            container.innerHTML = `
                <div class="controls-empty-state">
                    <div class="controls-empty-title">Aucun contrôle ne correspond aux filtres</div>
                    <div class="controls-empty-text">Modifiez vos filtres ou réinitialisez-les pour afficher les contrôles disponibles.</div>
                </div>
            `;
            return;
        }

        const typeMap = (this.config.controlTypes || []).reduce((acc, item) => {
            if (item && item.value !== undefined && item.value !== null) {
                acc[String(item.value).toLowerCase()] = item.label || item.value;
            }
            return acc;
        }, {});

        const statusMap = (this.config.controlStatuses || []).reduce((acc, item) => {
            if (item && item.value !== undefined && item.value !== null) {
                acc[String(item.value).toLowerCase()] = item.label || item.value;
            }
            return acc;
        }, {});

        container.innerHTML = filteredControls.map(control => {
            const controlName = control?.name || 'Contrôle sans nom';
            const rawType = control?.type ?? '';
            const normalizedType = rawType ? String(rawType).toLowerCase() : '';
            const typeLabel = normalizedType ? (typeMap[normalizedType] || rawType) : 'Non défini';
            const typeClass = normalizedType ? normalizedType.replace(/[^a-z0-9-]+/g, '-') : 'type-undefined';
            const ownerLabel = control?.owner || '';
            const rawStatus = control?.status ?? '';
            const normalizedStatus = rawStatus ? String(rawStatus).toLowerCase() : '';
            const statusLabel = normalizedStatus ? (statusMap[normalizedStatus] || rawStatus) : '';
            const statusClass = normalizedStatus ? normalizedStatus.replace(/[^a-z0-9-]+/g, '-') : '';

            return `
                <div class="controls-table-row" data-control-id="${control.id}">
                    <div class="controls-table-cell control-name-cell">
                        <div class="control-name" title="${controlName}">${controlName}</div>
                    </div>
                    <div class="controls-table-cell control-type-cell">
                        <span class="control-type-badge ${typeClass}">${typeLabel}</span>
                    </div>
                    <div class="controls-table-cell control-owner-cell">
                        ${ownerLabel ? `<span class="control-owner">${ownerLabel}</span>` : `<span class="text-placeholder">Non défini</span>`}
                    </div>
                    <div class="controls-table-cell control-status-cell">
                        ${statusLabel ? `<span class="control-status-badge ${statusClass}">${statusLabel}</span>` : `<span class="text-placeholder">Non défini</span>`}
                    </div>
                    <div class="controls-table-cell controls-table-actions">
                        <button class="action-btn" onclick="editControl(${control.id})" title="Modifier">✏️</button>
                        <button class="action-btn" onclick="deleteControl(${control.id})" title="Supprimer">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Action Plans functions
    getFilteredActionPlans() {
        const plans = Array.isArray(this.actionPlans) ? this.actionPlans : [];
        const {
            status = '',
            name = '',
            owner = '',
            dueDateOrder = ''
        } = this.actionPlanFilters || {};

        const statusFilter = String(status || '').toLowerCase();
        const nameFilter = String(name || '').trim().toLowerCase();
        const ownerFilter = String(owner || '').trim().toLowerCase();
        const dueDateOrderFilter = String(dueDateOrder || '').toLowerCase();

        const filteredPlans = plans.filter(plan => {
            const planStatus = String(plan?.status || '').toLowerCase();
            if (statusFilter && planStatus !== statusFilter) {
                return false;
            }

            if (nameFilter) {
                const planTitle = plan?.title != null ? String(plan.title).toLowerCase() : '';
                const planId = plan?.id != null ? String(plan.id).toLowerCase() : '';
                if (!planTitle.includes(nameFilter) && !planId.includes(nameFilter)) {
                    return false;
                }
            }

            if (ownerFilter) {
                const planOwner = plan?.owner != null ? String(plan.owner).toLowerCase() : '';
                if (!planOwner.includes(ownerFilter)) {
                    return false;
                }
            }

            return true;
        });

        if (dueDateOrderFilter === 'asc' || dueDateOrderFilter === 'desc') {
            const direction = dueDateOrderFilter === 'asc' ? 1 : -1;

            const parseDueDateValue = (value) => {
                const rawValue = value != null ? String(value).trim() : '';
                if (!rawValue) {
                    return null;
                }

                let date = null;
                if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
                    date = new Date(`${rawValue}T00:00:00`);
                } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawValue)) {
                    const [day, month, year] = rawValue.split('/');
                    date = new Date(`${year}-${month}-${day}T00:00:00`);
                } else {
                    const parsed = Date.parse(rawValue);
                    if (!Number.isNaN(parsed)) {
                        date = new Date(parsed);
                    }
                }

                if (!date || Number.isNaN(date.getTime())) {
                    return null;
                }

                return date.getTime();
            };

            filteredPlans.sort((a, b) => {
                const aTime = parseDueDateValue(a?.dueDate);
                const bTime = parseDueDateValue(b?.dueDate);

                if (aTime === null && bTime === null) {
                    return 0;
                }
                if (aTime === null) {
                    return 1;
                }
                if (bTime === null) {
                    return -1;
                }

                return direction === 1 ? aTime - bTime : bTime - aTime;
            });
        }

        return filteredPlans;
    }

    updateActionPlansList() {
        const container = document.getElementById('actionPlansList');
        if (!container) return;

        const allPlans = Array.isArray(this.actionPlans) ? this.actionPlans : [];
        const filteredPlans = this.getFilteredActionPlans();

        if (!allPlans.length) {
            container.innerHTML = `
                <div class="controls-empty-state">
                    <div class="controls-empty-title">Aucun plan d'action enregistré</div>
                    <div class="controls-empty-text">Créez votre premier plan pour piloter vos actions correctives.</div>
                    <button class="btn btn-secondary" onclick="addNewActionPlan()">+ Ajouter un plan</button>
                </div>
            `;
            return;
        }

        if (!filteredPlans.length) {
            container.innerHTML = `
                <div class="controls-empty-state">
                    <div class="controls-empty-title">Aucun plan ne correspond aux filtres</div>
                    <div class="controls-empty-text">Ajustez votre recherche ou réinitialisez les filtres pour afficher les plans disponibles.</div>
                </div>
            `;
            return;
        }

        const statusMap = (this.config.actionPlanStatuses || []).reduce((acc, item) => {
            if (item && item.value !== undefined && item.value !== null) {
                acc[String(item.value).toLowerCase()] = item.label || item.value;
            }
            return acc;
        }, {});

        const formatDueDate = (value) => {
            const rawValue = value != null ? String(value).trim() : '';
            if (!rawValue) {
                return '';
            }

            if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
                const [year, month, day] = rawValue.split('-');
                return `${day}/${month}/${year}`;
            }

            if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawValue)) {
                return rawValue;
            }

            return rawValue;
        };

        container.innerHTML = filteredPlans.map(plan => {
            const planTitle = plan?.title || 'Plan sans titre';
            const rawStatus = plan?.status ?? '';
            const normalizedStatus = rawStatus ? String(rawStatus).toLowerCase() : '';
            const statusLabel = normalizedStatus ? (statusMap[normalizedStatus] || rawStatus) : '';
            const statusClass = normalizedStatus ? normalizedStatus.replace(/[^a-z0-9-]+/g, '-') : '';
            const ownerLabel = plan?.owner ? String(plan.owner) : '';
            const dueDateLabel = formatDueDate(plan?.dueDate);

            return `
                <div class="controls-table-row" data-plan-id="${plan.id}">
                    <div class="controls-table-cell control-name-cell">
                        <div class="control-name" title="${planTitle}">${planTitle}</div>
                    </div>
                    <div class="controls-table-cell control-owner-cell">
                        ${ownerLabel ? `<span class="control-owner">${ownerLabel}</span>` : `<span class="text-placeholder">Non défini</span>`}
                    </div>
                    <div class="controls-table-cell control-due-date-cell">
                        ${dueDateLabel ? `<span class="control-due-date">${dueDateLabel}</span>` : `<span class="text-placeholder">Non définie</span>`}
                    </div>
                    <div class="controls-table-cell control-status-cell">
                        ${statusLabel ? `<span class="control-status-badge ${statusClass}">${statusLabel}</span>` : `<span class="text-placeholder">Non défini</span>`}
                    </div>
                    <div class="controls-table-cell controls-table-actions">
                        <button class="action-btn" onclick="editActionPlan(${plan.id})" title="Modifier">✏️</button>
                        <button class="action-btn" onclick="deleteActionPlan(${plan.id})" title="Supprimer">🗑️</button>
                    </div>
                </div>
            `;
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
            user: 'Système'
        });
        this.saveData();
        this.updateHistory();
    }

    // CRUD operations
    addRisk(riskData) {
        const newRisk = {
            id: getNextSequentialId(this.risks),
            ...riskData,
            dateCreation: new Date().toISOString(),
            statut: riskData.statut || 'brouillon'
        };

        this.risks.push(newRisk);
        this.addHistoryItem('Création risque', `Nouveau risque: ${newRisk.description}`);
        this.saveData();
        this.init();
        
        return newRisk;
    }

    editRisk(riskId) {
        const targetId = String(riskId);
        const risk = this.risks.find(r => idsEqual(r.id, targetId));
        if (!risk) return;

        currentEditingRiskId = risk.id;

        const form = document.getElementById('riskForm');
        if (form) {
            form.reset();
            document.getElementById('processus').value = risk.processus || '';
            this.updateSousProcessusOptions();
            document.getElementById('sousProcessus').value = risk.sousProcessus || '';
            document.getElementById('typeCorruption').value = risk.typeCorruption || '';
            const statutSelect = document.getElementById('statut');
            if (statutSelect) {
                const defaultStatus = this.config?.riskStatuses?.[0]?.value || '';
                const statusToApply = risk.statut || defaultStatus;
                if (statusToApply) {
                    const normalized = String(statusToApply);
                    const hasOption = Array.from(statutSelect.options).some(opt => opt.value === normalized);
                    if (!hasOption) {
                        const option = document.createElement('option');
                        option.value = normalized;
                        option.textContent = normalized;
                        statutSelect.appendChild(option);
                    }
                    statutSelect.value = normalized;
                } else {
                    statutSelect.value = '';
                }
            }

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

        activeRiskEditState = 'brut';
        const modal = document.getElementById('riskModal');
        if (modal) {
            modal.classList.add('show');
            requestAnimationFrame(() => initRiskEditMatrix());
        }
    }

    deleteRisk(riskId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce risque?')) return;

        const index = this.risks.findIndex(r => idsEqual(r.id, riskId));
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
        if (format === 'json') {
            const snapshot = this.getSnapshot();
            snapshot.meta = {
                exportDate: new Date().toISOString(),
                exportedBy: 'Cartographie'
            };

            const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cartographie-donnees.json';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 0);

            if (typeof showNotification === 'function') {
                showNotification('success', 'Données exportées avec succès');
            }

            return;
        }

        if (format === 'csv') {
            const csv = this.convertToCSV(this.risks);

            if (!csv) {
                if (typeof showNotification === 'function') {
                    showNotification('warning', "Aucune donnée disponible pour l'export CSV.");
                }
                return;
            }

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `risks_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 0);

            if (typeof showNotification === 'function') {
                showNotification('success', 'Export CSV réussi!');
            }
        }
    }

    convertToCSV(data) {
        if (!Array.isArray(data) || data.length === 0) {
            return '';
        }

        const headerSet = new Set();
        data.forEach(item => {
            if (item && typeof item === 'object' && !Array.isArray(item)) {
                Object.keys(item).forEach(key => headerSet.add(key));
            }
        });

        const headers = Array.from(headerSet);
        if (headers.length === 0) {
            return '';
        }

        const escapeValue = (value) => {
            if (value === null || value === undefined) {
                return '';
            }

            let stringValue;
            if (Array.isArray(value)) {
                stringValue = value.join('; ');
            } else if (typeof value === 'object') {
                stringValue = JSON.stringify(value);
            } else {
                stringValue = String(value);
            }

            const shouldQuote = /[",\n\r]/.test(stringValue);
            const escapedValue = stringValue.replace(/"/g, '""');
            return shouldQuote ? `"${escapedValue}"` : escapedValue;
        };

        const rows = data.map(row => {
            return headers.map(header => escapeValue(row ? row[header] : undefined)).join(',');
        });

        return [headers.join(','), ...rows].join('\n');
    }
}

var rms;
function setRms(instance) {
    rms = instance;
    window.rms = instance;
}

window.RiskManagementSystem = RiskManagementSystem;
window.setRms = setRms;
