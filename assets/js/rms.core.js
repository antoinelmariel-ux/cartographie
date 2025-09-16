// Enhanced Risk Management System - Core Logic

class RiskManagementSystem {
    constructor() {
        this.risks = this.loadData('risks') || this.getDefaultRisks();
        this.controls = this.loadData('controls') || this.getDefaultControls();
        this.actionPlans = this.loadData('actionPlans') || [];
        this.history = this.loadData('history') || [];
        this.config = this.loadConfig() || this.getDefaultConfig();
        let configStructureUpdated = false;
        if (!this.config.subProcesses || typeof this.config.subProcesses !== 'object' || Array.isArray(this.config.subProcesses)) {
            this.config.subProcesses = {};
            configStructureUpdated = true;
        }
        if (Array.isArray(this.config.processes)) {
            this.config.processes.forEach(process => {
                if (!process || !process.value) return;
                if (!Array.isArray(this.config.subProcesses[process.value])) {
                    this.config.subProcesses[process.value] = [];
                    configStructureUpdated = true;
                }
            });
        } else {
            this.config.processes = [];
            configStructureUpdated = true;
        }
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

        // Auto-save every 30 seconds
        setInterval(() => this.autoSave(), 30000);
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
        Object.entries(sections).forEach(([key, label]) => {
            const section = document.createElement('div');
            section.className = 'config-section';
            section.innerHTML = `
                <h3>${label}</h3>
                <ul id="list-${key}" class="config-list"></ul>
                <div class="config-add">
                    <input type="text" id="input-${key}-value" placeholder="valeur">
                    <input type="text" id="input-${key}-label" placeholder="libellé">
                    <button onclick="rms.addConfigOption('${key}')">Ajouter</button>
                </div>
            `;
            container.appendChild(section);
        });

        const subSection = document.createElement('div');
        subSection.className = 'config-section';
        subSection.innerHTML = `
            <h3>Sous-processus</h3>
            <div id="subProcessConfig"></div>
        `;
        container.appendChild(subSection);

        this.refreshConfigLists();
        this.renderSubProcessConfig();
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
            };

            const renderEditForm = () => {
                listItem.innerHTML = '';

                const form = document.createElement('div');
                form.className = 'config-edit-form';

                const valueInput = document.createElement('input');
                valueInput.type = 'text';
                valueInput.value = opt.value;
                valueInput.placeholder = 'valeur';
                valueInput.className = 'config-edit-input';

                const labelInput = document.createElement('input');
                labelInput.type = 'text';
                labelInput.value = opt.label;
                labelInput.placeholder = 'libellé';
                labelInput.className = 'config-edit-input';

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

                form.appendChild(valueInput);
                form.appendChild(labelInput);
                form.appendChild(actions);
                listItem.appendChild(form);
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
        this.config.processes.forEach(proc => {
            const block = document.createElement('div');
            block.className = 'subprocess-section';
            const procId = sanitizeId(proc.value);
            const listId = `list-sub-${procId}`;
            block.innerHTML = `
                <h4>${proc.label}</h4>
                <ul id="${listId}" class="config-list"></ul>
                <div class="config-add">
                    <input type="text" id="input-sub-${procId}-value" placeholder="valeur">
                    <input type="text" id="input-sub-${procId}-label" placeholder="libellé">
                </div>
            `;
            container.appendChild(block);
            const addContainer = block.querySelector('.config-add');
            if (addContainer) {
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
                addContainer.appendChild(addButton);
            }
        });
        this.refreshSubProcessLists();
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
                };

                const renderEditForm = () => {
                    listItem.innerHTML = '';

                    const form = document.createElement('div');
                    form.className = 'config-edit-form';

                    const valueInput = document.createElement('input');
                    valueInput.type = 'text';
                    valueInput.value = sp.value;
                    valueInput.placeholder = 'valeur';
                    valueInput.className = 'config-edit-input';

                    const labelInput = document.createElement('input');
                    labelInput.type = 'text';
                    labelInput.value = sp.label;
                    labelInput.placeholder = 'libellé';
                    labelInput.className = 'config-edit-input';

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

                    form.appendChild(valueInput);
                    form.appendChild(labelInput);
                    form.appendChild(actions);
                    listItem.appendChild(form);
                };

                renderDisplay();
                list.appendChild(listItem);
            });
        });
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
        this.updateRecentAlerts();
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
                    <td colspan="6" class="table-empty">Aucune alerte récente</td>
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
            const owner = risk.responsable || '-';

            return `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${description}</td>
                    <td>${process}</td>
                    <td><span class="table-badge ${badgeClass}">${levelLabel}</span></td>
                    <td>${owner}</td>
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
                    <button class="action-btn" onclick="rms.editRisk(${JSON.stringify(risk.id)})">✏️</button>
                    <button class="action-btn" onclick="rms.deleteRisk(${JSON.stringify(risk.id)})">🗑️</button>
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
            id: getNextSequentialId(this.risks),
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

            if (!csv) {
                showNotification('warning', "Aucune donnée disponible pour l'export CSV.");
                return;
            }

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `risks_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }

        showNotification('success', 'Export réussi!');
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
