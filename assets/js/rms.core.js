// Enhanced Risk Management System - Core Logic

let emptyChartPluginRegistered = false;

function ensureEmptyChartMessagePlugin() {
    if (emptyChartPluginRegistered) {
        return;
    }

    if (typeof Chart === 'undefined') {
        return;
    }

    const emptyChartMessagePlugin = {
        id: 'emptyChartMessage',
        defaults: {
            display: false,
            message: 'Aucune donnée disponible',
            color: '#95a5a6',
            font: {
                family: 'Inter, Arial, sans-serif',
                size: 14,
                style: '600'
            }
        },
        afterDraw(chart, args, options) {
            if (!options || !options.display) {
                return;
            }

            const dataset = chart?.data?.datasets?.[0];
            const data = Array.isArray(dataset?.data) ? dataset.data : [];
            const total = data.reduce((sum, value) => sum + (Number(value) || 0), 0);
            if (total > 0) {
                return;
            }

            const { ctx, chartArea } = chart;
            if (!ctx || !chartArea) {
                return;
            }

            const { left, top, width, height } = chartArea;
            const message = typeof options.message === 'string' && options.message.trim()
                ? options.message.trim()
                : 'Aucune donnée disponible';
            const fontFamily = options.font?.family || 'Inter, Arial, sans-serif';
            const fontSize = options.font?.size || 14;
            const fontStyle = options.font?.style || '600';

            ctx.save();
            ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}`;
            ctx.fillStyle = options.color || '#95a5a6';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(message, left + width / 2, top + height / 2);
            ctx.restore();
        }
    };

    let registered = false;
    if (typeof Chart.register === 'function') {
        Chart.register(emptyChartMessagePlugin);
        registered = true;
    } else if (Chart.plugins && typeof Chart.plugins.register === 'function') {
        Chart.plugins.register(emptyChartMessagePlugin);
        registered = true;
    }

    if (registered) {
        emptyChartPluginRegistered = true;
    }
}

function cloneDefaultEntry(entry) {
    if (typeof structuredClone === 'function') {
        try {
            return structuredClone(entry);
        } catch (error) {
            // Fallback to JSON cloning below
        }
    }

    try {
        return JSON.parse(JSON.stringify(entry));
    } catch (error) {
        return entry && typeof entry === 'object' ? { ...entry } : entry;
    }
}


class RiskManagementSystem {
    constructor() {
        const storedRisks = this.loadData('risks');
        const defaultRisks = this.getDefaultRisks();
        const initialRisks = Array.isArray(storedRisks) ? storedRisks : defaultRisks;
        this.risks = Array.isArray(initialRisks)
            ? initialRisks.map(risk => this.normalizeRisk(risk))
            : [];

        const storedControls = this.loadData('controls');
        const defaultControls = this.getDefaultControls();
        this.controls = Array.isArray(storedControls) ? storedControls : defaultControls;

        const storedActionPlans = this.loadData('actionPlans');
        this.actionPlans = Array.isArray(storedActionPlans)
            ? storedActionPlans
            : this.getDefaultActionPlans();

        const storedHistory = this.loadData('history');
        this.history = Array.isArray(storedHistory) ? storedHistory : this.getDefaultHistory();

        const storedInterviews = this.loadData('interviews');
        const defaultInterviews = this.getDefaultInterviews();
        this.interviews = Array.isArray(storedInterviews)
            ? storedInterviews
                .map(entry => this.normalizeInterview(entry))
                .filter(Boolean)
            : defaultInterviews;
        const defaultConfig = this.getDefaultConfig();
        this.config = this.loadConfig() || defaultConfig;
        this.readOnlyConfigKeys = new Set(['riskStatuses']);
        const configStructureUpdated = this.ensureConfigStructure(defaultConfig);
        if (configStructureUpdated) {
            this.saveConfig();
        }
        this.needsConfigStructureRerender = configStructureUpdated;
        this.currentView = 'brut';
        this.processScoreMode = 'net';
        this.currentTab = 'dashboard';
        this.currentConfigSection = 'processManager';
        this.filters = {
            process: '',
            type: '',
            status: '',
            search: ''
        };
        this.controlFilters = {
            type: '',
            origin: '',
            status: '',
            search: ''
        };
        this.actionPlanFilters = {
            status: '',
            name: '',
            owner: '',
            dueDateOrder: ''
        };
        this.processManagerFilters = {
            query: '',
            referent: ''
        };
        this.interviewFilters = {
            process: '',
            subProcess: '',
            referent: ''
        };
        this.collapsedProcesses = new Set();
        this.initializeProcessCollapseState();
        this.activeInsertionForm = null;
        this.dragState = null;
        this.lastDashboardMetrics = null;
        this.charts = {};
        this.processColorMap = new Map();
        this.interviewEditorState = null;
        this.unsavedContexts = new Set();
        this.hasUnsavedChanges = false;
        this.init();
    }

    initializeProcessCollapseState() {
        if (!(this.collapsedProcesses instanceof Set)) {
            this.collapsedProcesses = new Set();
        }

        this.config.processes
            .map(process => process?.value)
            .filter(value => typeof value === 'string' && value)
            .forEach(value => {
                this.collapsedProcesses.add(value);
            });
    }

    init() {
        this.refreshProcessColorMap();
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
        this.updateInterviewsList();

        if (this.currentTab === 'config') {
            this.renderConfiguration();
        }
    }

    getDefaultRisks() {
        const defaults = window.RMS_DEFAULT_DATA?.risks;
        if (!Array.isArray(defaults)) {
            return [];
        }
        return defaults.map(item => cloneDefaultEntry(item));
    }

    getDefaultControls() {
        const defaults = window.RMS_DEFAULT_DATA?.controls;
        if (!Array.isArray(defaults)) {
            return [];
        }
        return defaults.map(item => cloneDefaultEntry(item));
    }

    getDefaultActionPlans() {
        const defaults = window.RMS_DEFAULT_DATA?.actionPlans;
        if (!Array.isArray(defaults)) {
            return [];
        }
        return defaults.map(item => cloneDefaultEntry(item));
    }

    getDefaultHistory() {
        const defaults = window.RMS_DEFAULT_DATA?.history;
        if (!Array.isArray(defaults)) {
            return [];
        }
        return defaults.map(item => cloneDefaultEntry(item));
    }

    getDefaultInterviews() {
        const defaults = window.RMS_DEFAULT_DATA?.interviews;
        if (!Array.isArray(defaults)) {
            return [];
        }

        return defaults
            .map(entry => this.normalizeInterview(entry))
            .filter(Boolean);
    }

    getDefaultConfig() {
        const processConfig = window.RMS_DEFAULT_PROCESS_CONFIG || {};
        const parameterConfig = window.RMS_DEFAULT_PARAMETER_CONFIG || {};

        const cloneList = (list) => Array.isArray(list)
            ? list.map(item => (item && typeof item === 'object') ? { ...item } : item)
            : [];

        const cloneReferentList = (list) => cloneList(list).map(entry => ({
            ...entry,
            referents: Array.isArray(entry?.referents)
                ? entry.referents.filter(ref => typeof ref === 'string' && ref.trim())
                : []
        }));

        const cloneSubProcessMap = (map) => {
            if (!map || typeof map !== 'object' || Array.isArray(map)) {
                return {};
            }
            return Object.entries(map).reduce((acc, [key, value]) => {
                acc[key] = cloneReferentList(value);
                return acc;
            }, {});
        };

        const config = {
            processes: cloneReferentList(processConfig.processes),
            subProcesses: cloneSubProcessMap(processConfig.subProcesses)
        };

        const parameterKeys = [
            'riskTypes',
            'tiers',
            'riskStatuses',
            'actionPlanStatuses',
            'controlTypes',
            'controlOrigins',
            'controlFrequencies',
            'controlModes',
            'controlEffectiveness',
            'controlStatuses'
        ];

        parameterKeys.forEach(key => {
            config[key] = cloneList(parameterConfig[key]);
        });

        if (!Array.isArray(config.riskStatuses) || config.riskStatuses.length === 0) {
            config.riskStatuses = [
                { value: 'brouillon', label: 'Brouillon' },
                { value: 'a-valider', label: 'A valider' },
                { value: 'validé', label: 'Validé' },
                { value: 'archive', label: 'Archivé' }
            ];
        }

        const subProcesses = config.subProcesses && typeof config.subProcesses === 'object'
            ? config.subProcesses
            : {};

        Object.keys(subProcesses).forEach(key => {
            const list = Array.isArray(subProcesses[key]) ? subProcesses[key] : [];
            subProcesses[key] = list.map(item => ({
                ...item,
                referents: Array.isArray(item?.referents)
                    ? item.referents.filter(ref => typeof ref === 'string' && ref.trim())
                    : []
            }));
        });

        config.processes = (config.processes || []).map(process => ({
            ...process,
            referents: Array.isArray(process?.referents)
                ? process.referents.filter(ref => typeof ref === 'string' && ref.trim())
                : []
        }));

        return config;
    }

    loadConfig() {
        const data = localStorage.getItem('rms_config');
        return data ? JSON.parse(data) : null;
    }

    saveConfig() {
        localStorage.setItem('rms_config', JSON.stringify(this.config));
        this.updateLastSaveTime();
        this.clearUnsavedChanges('configuration');
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

        const normalizeReferents = (value) => {
            if (!Array.isArray(value)) {
                return [];
            }
            const normalized = [];
            const seen = new Set();
            value.forEach(entry => {
                const str = typeof entry === 'string' ? entry.trim() : '';
                if (!str) {
                    return;
                }
                const key = str.toLowerCase();
                if (seen.has(key)) {
                    return;
                }
                seen.add(key);
                normalized.push(str);
            });
            return normalized;
        };

        const cloneConfigItem = (item, fallbackItem = {}) => {
            const base = item && typeof item === 'object' && !Array.isArray(item)
                ? { ...item }
                : { ...fallbackItem };
            base.referents = normalizeReferents(base.referents);
            return base;
        };

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
                    ? value.map(item => cloneConfigItem(item))
                    : [];
                if (!Array.isArray(value)) {
                    updated = true;
                }
            });
            this.config.subProcesses = normalizedSubProcesses;
        }

        if (Array.isArray(baseConfig.processes)) {
            this.config.processes = baseConfig.processes.map(process => cloneConfigItem(process));
        } else {
            this.config.processes = Array.isArray(fallback.processes)
                ? fallback.processes.map(process => cloneConfigItem(process))
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
                this.config.subProcesses[process.value] = this.config.subProcesses[process.value].map(item => cloneConfigItem(item));
            }
        });

        const simpleArrayKeys = [
            'riskTypes',
            'tiers',
            'controlTypes',
            'controlOrigins',
            'controlFrequencies',
            'controlModes',
            'controlEffectiveness',
            'controlStatuses'
        ];

        simpleArrayKeys.forEach(key => {
            const baseArray = Array.isArray(baseConfig[key])
                ? baseConfig[key]
                : Array.isArray(fallback[key])
                    ? fallback[key]
                    : [];

            if (!Array.isArray(baseConfig[key]) && baseConfig[key] !== undefined) {
                updated = true;
            }

            this.config[key] = baseArray.map(item => item && typeof item === 'object' ? { ...item } : item);
        });

        return updated;
    }

    normalizeRisk(risk) {
        if (!risk || typeof risk !== 'object') {
            return {};
        }

        const normalized = { ...risk };

        if (typeof normalizeAggravatingFactors === 'function') {
            normalized.aggravatingFactors = normalizeAggravatingFactors(risk.aggravatingFactors);
        } else {
            const group1 = Array.isArray(risk?.aggravatingFactors?.group1)
                ? [...risk.aggravatingFactors.group1]
                : [];
            const group2 = Array.isArray(risk?.aggravatingFactors?.group2)
                ? [...risk.aggravatingFactors.group2]
                : [];
            normalized.aggravatingFactors = { group1, group2 };
        }

        const rawCoefficient = Number(risk?.aggravatingCoefficient);
        let coefficient = Number.isFinite(rawCoefficient) && rawCoefficient >= 1 ? rawCoefficient : 1;

        if (typeof computeAggravatingCoefficientFromGroups === 'function') {
            const computed = computeAggravatingCoefficientFromGroups(normalized.aggravatingFactors);
            if (computed > coefficient) {
                coefficient = computed;
            }
        }

        normalized.aggravatingCoefficient = coefficient;

        const mitigationLevel = typeof getRiskMitigationEffectiveness === 'function'
            ? getRiskMitigationEffectiveness(risk)
            : (typeof normalizeMitigationEffectiveness === 'function'
                ? normalizeMitigationEffectiveness(risk?.mitigationEffectiveness)
                : (typeof DEFAULT_MITIGATION_EFFECTIVENESS === 'string'
                    ? DEFAULT_MITIGATION_EFFECTIVENESS
                    : 'insuffisant'));
        normalized.mitigationEffectiveness = mitigationLevel;

        if (typeof getMitigationColumnFromLevel === 'function') {
            normalized.probNet = getMitigationColumnFromLevel(mitigationLevel);
        }

        const brutScore = typeof getRiskBrutScore === 'function'
            ? getRiskBrutScore(normalized)
            : (Number(normalized.probBrut) || 0) * (Number(normalized.impactBrut) || 0);
        const severity = typeof getRiskSeverityFromScore === 'function'
            ? getRiskSeverityFromScore(brutScore)
            : (brutScore >= 12 ? 'critique' : brutScore >= 6 ? 'fort' : brutScore >= 3 ? 'modere' : 'faible');
        if (typeof getNetImpactValueFromSeverity === 'function') {
            normalized.impactNet = getNetImpactValueFromSeverity(severity);
        }

        return normalized;
    }

    normalizeInterviewDate(value) {
        if (value == null) {
            return '';
        }

        const asString = String(value).trim();
        if (!asString) {
            return '';
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(asString)) {
            return asString;
        }

        if (/^\d{2}\/\d{2}\/\d{4}$/.test(asString)) {
            const [day, month, year] = asString.split('/');
            return `${year}-${month}-${day}`;
        }

        const parsed = new Date(asString);
        if (!Number.isNaN(parsed.getTime())) {
            const year = parsed.getFullYear();
            const month = String(parsed.getMonth() + 1).padStart(2, '0');
            const day = String(parsed.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        return '';
    }

    normalizeInterviewScopes(scopes) {
        if (!Array.isArray(scopes)) {
            return [];
        }

        const seen = new Set();
        const normalized = [];

        scopes.forEach(scope => {
            if (!scope || typeof scope !== 'object') {
                return;
            }

            const processValueRaw = scope.processValue ?? scope.process;
            const subProcessValueRaw = scope.subProcessValue ?? scope.subProcess ?? scope.value;

            const processValue = typeof processValueRaw === 'string'
                ? processValueRaw.trim()
                : '';
            const subProcessValue = typeof subProcessValueRaw === 'string'
                ? subProcessValueRaw.trim()
                : '';

            if (!processValue && !subProcessValue) {
                return;
            }

            const key = `${processValue}::${subProcessValue}`;
            if (seen.has(key)) {
                return;
            }
            seen.add(key);

            const processLabelRaw = scope.processLabel ?? scope.processName ?? scope.label ?? '';
            const subProcessLabelRaw = scope.subProcessLabel ?? scope.label ?? scope.subLabel ?? '';

            const processLabel = processValue
                ? (processLabelRaw || this.getProcessLabel(processValue) || processValue)
                : (processLabelRaw || 'Processus');
            const subProcessLabel = subProcessValue
                ? (subProcessLabelRaw || this.getSubProcessLabel(processValue, subProcessValue) || subProcessValue)
                : '';

            normalized.push({
                key,
                processValue,
                processLabel,
                subProcessValue,
                subProcessLabel,
                type: subProcessValue ? 'subProcess' : 'process'
            });
        });

        return normalized;
    }

    normalizeInterview(interview) {
        if (!interview || typeof interview !== 'object') {
            return null;
        }

        const title = typeof interview.title === 'string' ? interview.title.trim() : '';

        const referents = Array.isArray(interview.referents)
            ? interview.referents
                .map(ref => (typeof ref === 'string' ? ref.trim() : ''))
                .filter(Boolean)
            : [];
        const uniqueReferents = Array.from(new Set(referents));

        const normalizedDate = this.normalizeInterviewDate(interview.date);
        const notes = typeof interview.notes === 'string' ? interview.notes : '';

        const rawScopes = Array.isArray(interview.scopes)
            ? interview.scopes
            : Array.isArray(interview.subProcesses)
                ? interview.subProcesses.map(sub => ({
                    processValue: sub.processValue ?? sub.process,
                    processLabel: sub.processLabel ?? sub.processName,
                    subProcessValue: sub.value ?? sub.subProcessValue ?? sub.subProcess,
                    subProcessLabel: sub.label ?? sub.subProcessLabel ?? sub.name
                }))
                : [];

        const normalizedScopes = this.normalizeInterviewScopes(rawScopes);

        const processesMap = new Map();
        normalizedScopes.forEach(scope => {
            if (!scope || !scope.processValue) {
                return;
            }
            if (!processesMap.has(scope.processValue)) {
                processesMap.set(scope.processValue, {
                    value: scope.processValue,
                    label: scope.processLabel || this.getProcessLabel(scope.processValue) || scope.processValue
                });
            }
        });

        const subProcesses = normalizedScopes
            .filter(scope => scope.subProcessValue)
            .map(scope => ({
                processValue: scope.processValue,
                processLabel: scope.processLabel,
                value: scope.subProcessValue,
                label: scope.subProcessLabel
            }));

        const createdAt = typeof interview.createdAt === 'string' && interview.createdAt
            ? interview.createdAt
            : new Date().toISOString();
        const updatedAt = typeof interview.updatedAt === 'string' && interview.updatedAt
            ? interview.updatedAt
            : createdAt;

        return {
            id: interview.id,
            title,
            referents: uniqueReferents,
            date: normalizedDate,
            notes,
            scopes: normalizedScopes,
            processes: Array.from(processesMap.values()),
            subProcesses,
            createdAt,
            updatedAt
        };
    }

    getSnapshot() {
        return JSON.parse(JSON.stringify({
            risks: this.risks,
            controls: this.controls,
            actionPlans: this.actionPlans,
            history: this.history,
            interviews: this.interviews,
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

        this.risks = cloneArray(snapshot.risks).map(risk => this.normalizeRisk(risk));
        this.controls = cloneArray(snapshot.controls);
        this.actionPlans = cloneArray(snapshot.actionPlans);
        this.history = cloneArray(snapshot.history);
        this.interviews = cloneArray(snapshot.interviews)
            .map(entry => this.normalizeInterview(entry))
            .filter(Boolean);
        this.config = cloneObject(snapshot.config);

        this.ensureConfigStructure();

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
        this.refreshProcessColorMap();
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

        fill(['matrixProcessFilter', 'risksProcessFilter', 'interviewProcessFilter'], this.config.processes, 'Tous les processus');
        fill(['matrixRiskTypeFilter', 'risksTypeFilter'], this.config.riskTypes, 'Tous les types');
        fill(['matrixStatusFilter', 'risksStatusFilter'], this.config.riskStatuses, 'Tous les statuts');
        fill('processus', this.config.processes, 'Sélectionner...');
        this.updateSousProcessusOptions();
        fill('typeCorruption', this.config.riskTypes, 'Sélectionner...');
        fill('statut', this.config.riskStatuses, 'Sélectionner...');
        fill('tiers', this.config.tiers);
        fill('controlType', this.config.controlTypes, 'Sélectionner...');
        fill('controlOrigin', this.config.controlOrigins, 'Sélectionner...');
        fill('controlFrequency', this.config.controlFrequencies, 'Sélectionner...');
        fill('controlMode', this.config.controlModes, 'Sélectionner...');
        fill('controlEffectiveness', this.config.controlEffectiveness, 'Sélectionner...');
        fill('controlStatus', this.config.controlStatuses, 'Sélectionner...');
        fill('controlsTypeFilter', this.config.controlTypes, 'Tous les types de contrôle');
        fill('controlsOriginFilter', this.config.controlOrigins, 'Toutes les origines');
        fill('controlsStatusFilter', this.config.controlStatuses, 'Tous les statuts');
        fill('planStatus', this.config.actionPlanStatuses, 'Sélectionner...');
        fill('actionPlansStatusFilter', this.config.actionPlanStatuses, 'Tous les statuts');

        const referentOptions = this.getAllKnownReferents().map(ref => ({ value: ref, label: ref }));

        fill('interviewReferentFilter', referentOptions, 'Tous les référents');
        this.updateInterviewReferentSelect(referentOptions);

        const mitigationInput = document.getElementById('mitigationEffectiveness');
        if (mitigationInput) {
            const defaultMitigation = typeof DEFAULT_MITIGATION_EFFECTIVENESS === 'string'
                ? DEFAULT_MITIGATION_EFFECTIVENESS
                : 'insuffisant';
            mitigationInput.value = defaultMitigation;
            const probNetInput = document.getElementById('probNet');
            if (probNetInput && typeof getMitigationColumnFromLevel === 'function') {
                probNetInput.value = getMitigationColumnFromLevel(defaultMitigation);
            }
        }

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
        syncFilterValue('origin', this.controlFilters?.origin || '');
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

        this.populateInterviewSubProcessFilterOptions();

        const processFilterSelect = document.getElementById('interviewProcessFilter');
        if (processFilterSelect) {
            const expected = this.interviewFilters?.process || '';
            if (processFilterSelect.value !== expected) {
                processFilterSelect.value = expected;
            }
        }

        const referentFilterSelect = document.getElementById('interviewReferentFilter');
        if (referentFilterSelect) {
            const expected = this.interviewFilters?.referent || '';
            if (referentFilterSelect.value !== expected) {
                referentFilterSelect.value = expected;
            }
        }

        const subProcessFilterSelect = document.getElementById('interviewSubProcessFilter');
        if (subProcessFilterSelect) {
            const expected = this.interviewFilters?.subProcess || '';
            if (subProcessFilterSelect.value !== expected) {
                subProcessFilterSelect.value = expected;
            }
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

        const availableSections = [
            { id: 'processManager', label: 'Processus & référents' },
            { id: 'general', label: 'Autres paramètres' }
        ];

        if (!this.currentConfigSection || !availableSections.some(section => section.id === this.currentConfigSection)) {
            this.currentConfigSection = 'processManager';
        }

        const exportButton = document.getElementById('configExportButton');
        if (exportButton) {
            const isProcessSection = this.currentConfigSection === 'processManager';
            exportButton.textContent = isProcessSection
                ? '💾 Exporter les processus'
                : '💾 Exporter les autres paramètres';
            exportButton.setAttribute('data-scope', isProcessSection ? 'processes' : 'parameters');
        }

        this.closeActiveInsertionForm();
        this.dragState = null;

        this.processManagerContainer = container;
        container.innerHTML = '';

        const tabs = document.createElement('div');
        tabs.className = 'config-section-tabs';
        availableSections.forEach(section => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `config-section-tab${this.currentConfigSection === section.id ? ' active' : ''}`;
            button.textContent = section.label;
            button.addEventListener('click', () => {
                this.currentConfigSection = section.id;
                this.renderConfiguration();
            });
            tabs.appendChild(button);
        });
        container.appendChild(tabs);

        const content = document.createElement('div');
        content.className = 'config-section-panel';
        container.appendChild(content);

        if (this.currentConfigSection === 'processManager') {
            this.renderProcessManager(content);
        } else {
            this.renderGeneralConfiguration(content);
        }
    }

    renderGeneralConfiguration(container) {
        if (!container) {
            return;
        }

        container.innerHTML = '';

        const intro = document.createElement('div');
        intro.className = 'config-section-description';
        intro.innerHTML = "<p>Gérez ici les valeurs de référence utilisées dans l'application (types de corruption, statuts, etc.). Les éléments marqués comme verrouillés ne peuvent pas être modifiés.</p>";
        container.appendChild(intro);

        const sections = {
            riskTypes: 'Types de corruption',
            tiers: 'Tiers',
            riskStatuses: 'Statuts des risques',
            controlTypes: 'Types de contrôle',
            controlOrigins: 'Origine des contrôles',
            controlFrequencies: 'Fréquences des contrôles',
            controlModes: "Modes d'exécution",
            controlEffectiveness: 'Efficacités',
            controlStatuses: 'Statuts des contrôles'
        };

        const readOnlyMessages = {
            riskStatuses: 'Les statuts de risque sont prédéfinis et ne peuvent pas être modifiés.'
        };

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

            const isReadOnly = this.readOnlyConfigKeys.has(key);

            const list = document.createElement('ul');
            list.id = `list-${key}`;
            list.className = 'config-list';

            if (isReadOnly) {
                const notice = document.createElement('p');
                notice.className = 'config-readonly-notice';
                notice.textContent = readOnlyMessages[key] || 'Ces valeurs sont prédéfinies et ne peuvent pas être modifiées.';
                body.appendChild(notice);
            }

            body.appendChild(list);

            if (!isReadOnly) {
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

                body.appendChild(addContainer);

                this.setupAutoValueSync(labelInput, valueInput);
            }
        });

        this.refreshConfigLists();
        this.adjustOpenAccordionBodies(container);
    }

    renderProcessManager(container) {
        if (!container) {
            return;
        }

        container.innerHTML = '';

        const header = document.createElement('div');
        header.className = 'process-manager-header';

        const title = document.createElement('h3');
        title.textContent = 'Gestion des processus et sous-processus';
        header.appendChild(title);

        const subtitle = document.createElement('p');
        subtitle.textContent = 'Ajoutez vos processus, rattachez des sous-processus et associez des référents. Utilisez le glisser-déposer pour réorganiser la hiérarchie.';
        header.appendChild(subtitle);

        container.appendChild(header);

        const filtersBar = document.createElement('div');
        filtersBar.className = 'process-manager-filters';

        const queryInput = document.createElement('input');
        queryInput.type = 'search';
        queryInput.className = 'process-filter-input';
        queryInput.placeholder = 'Filtrer par titre de processus ou sous-processus';
        queryInput.value = this.processManagerFilters.query || '';
        queryInput.addEventListener('input', (event) => {
            this.processManagerFilters.query = event.target.value || '';
            this.renderProcessManager(container);
        });
        filtersBar.appendChild(queryInput);

        const referentInput = document.createElement('input');
        referentInput.type = 'search';
        referentInput.className = 'process-filter-input';
        referentInput.placeholder = 'Filtrer par référent';
        referentInput.value = this.processManagerFilters.referent || '';
        referentInput.setAttribute('list', 'processReferentSuggestions');
        referentInput.addEventListener('input', (event) => {
            this.processManagerFilters.referent = event.target.value || '';
            this.renderProcessManager(container);
        });
        filtersBar.appendChild(referentInput);

        if ((this.processManagerFilters.query || '').trim() || (this.processManagerFilters.referent || '').trim()) {
            const resetButton = document.createElement('button');
            resetButton.type = 'button';
            resetButton.className = 'btn btn-outline process-filter-reset';
            resetButton.textContent = 'Réinitialiser';
            resetButton.addEventListener('click', () => {
                this.processManagerFilters = { query: '', referent: '' };
                this.renderProcessManager(container);
            });
            filtersBar.appendChild(resetButton);
        }

        container.appendChild(filtersBar);

        this.ensureReferentDatalist(container);

        const listWrapper = document.createElement('div');
        listWrapper.className = 'process-manager-list';
        container.appendChild(listWrapper);

        const filters = this.getProcessFilterState();
        const filtersActive = filters.hasQuery || filters.hasReferent;

        let hasVisibleProcesses = false;
        let lastControlIndex = 0;

        listWrapper.appendChild(this.createProcessInsertionControl(0, { filtersActive }));

        this.config.processes.forEach((process, index) => {
            const subs = Array.isArray(this.config.subProcesses[process.value])
                ? this.config.subProcesses[process.value]
                : [];
            const visibility = this.evaluateProcessVisibility(process, subs, filters);
            if (!visibility.visible) {
                return;
            }

            hasVisibleProcesses = true;

            const card = this.createProcessCard({
                process,
                index,
                visibleSubs: visibility.subs,
                totalSubs: subs.length,
                filters,
                filtersActive
            });

            listWrapper.appendChild(card);

            const control = this.createProcessInsertionControl(index + 1, { filtersActive });
            listWrapper.appendChild(control);
            lastControlIndex = index + 1;
        });

        if (this.config.processes.length > 0 && lastControlIndex !== this.config.processes.length) {
            listWrapper.appendChild(this.createProcessInsertionControl(this.config.processes.length, { filtersActive }));
            lastControlIndex = this.config.processes.length;
        }

        if (!hasVisibleProcesses) {
            const empty = document.createElement('div');
            empty.className = 'process-manager-empty';
            empty.innerHTML = '<p>Aucun processus ne correspond aux filtres actuels.</p><p>Utilisez le bouton + pour ajouter un processus ou réinitialisez les filtres.</p>';
            listWrapper.appendChild(empty);
        }
    }


    ensureReferentDatalist(container) {
        const scope = container instanceof HTMLElement ? container : document.body;
        const datalistId = 'processReferentSuggestions';
        let datalist = document.getElementById(datalistId);

        if (!datalist) {
            datalist = document.createElement('datalist');
            datalist.id = datalistId;
            scope.appendChild(datalist);
        } else if (scope !== document.body && !scope.contains(datalist)) {
            datalist.remove();
            scope.appendChild(datalist);
        }

        const referents = this.collectAllReferents();
        datalist.innerHTML = '';
        referents.forEach((referent) => {
            const option = document.createElement('option');
            option.value = referent;
            datalist.appendChild(option);
        });
    }

    getProcessFilterState() {
        const query = (this.processManagerFilters.query || '').trim();
        const referent = (this.processManagerFilters.referent || '').trim();
        return {
            query,
            referent,
            normalizedQuery: query.toLowerCase(),
            normalizedReferent: referent.toLowerCase(),
            hasQuery: query.length > 0,
            hasReferent: referent.length > 0
        };
    }

    evaluateProcessVisibility(process, subs, filters) {
        const processReferents = Array.isArray(process?.referents) ? process.referents : [];

        const matchesProcessQuery = !filters.hasQuery || [process.label, process.value, ...processReferents]
            .filter(value => typeof value === 'string')
            .some(value => value.toLowerCase().includes(filters.normalizedQuery));

        const matchesProcessReferent = !filters.hasReferent || processReferents
            .some(ref => typeof ref === 'string' && ref.toLowerCase() === filters.normalizedReferent);

        const normalizedSubs = subs.map((subProcess, index) => {
            const subReferents = Array.isArray(subProcess?.referents) ? subProcess.referents : [];
            const matchesQuery = !filters.hasQuery || [subProcess.label, subProcess.value, ...subReferents]
                .filter(value => typeof value === 'string')
                .some(value => value.toLowerCase().includes(filters.normalizedQuery));
            const matchesReferent = !filters.hasReferent || subReferents
                .some(ref => typeof ref === 'string' && ref.toLowerCase() === filters.normalizedReferent);

            return {
                item: subProcess,
                index,
                visible: (!filters.hasQuery && !filters.hasReferent) || (matchesQuery && matchesReferent)
            };
        });

        const visibleSubs = filters.hasQuery || filters.hasReferent
            ? normalizedSubs.filter(entry => entry.visible)
            : normalizedSubs;

        const processVisible = (!filters.hasQuery && !filters.hasReferent)
            || (matchesProcessQuery && matchesProcessReferent)
            || visibleSubs.length > 0;

        return { visible: processVisible, subs: visibleSubs };
    }

    isProcessCollapsed(processValue) {
        if (!processValue) {
            return false;
        }
        return this.collapsedProcesses instanceof Set && this.collapsedProcesses.has(processValue);
    }

    setProcessCollapsed(processValue, collapsed) {
        if (!processValue) {
            return;
        }
        if (!(this.collapsedProcesses instanceof Set)) {
            this.collapsedProcesses = new Set();
        }
        if (collapsed) {
            this.collapsedProcesses.add(processValue);
        } else {
            this.collapsedProcesses.delete(processValue);
        }
    }

    toggleProcessCollapse(processValue) {
        if (!processValue) {
            return;
        }
        const nextState = !this.isProcessCollapsed(processValue);
        this.setProcessCollapsed(processValue, nextState);
        this.rerenderProcessManager();
    }

    createProcessInsertionControl(position, options = {}) {
        const { parentProcess = null, filtersActive = false } = options;
        const control = document.createElement('div');
        control.className = 'process-insert-control';
        control.dataset.position = String(position);
        if (parentProcess) {
            control.dataset.parentProcess = parentProcess;
        }

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'process-insert-button';
        button.innerHTML = '<span aria-hidden="true">+</span>';
        button.setAttribute('aria-label', parentProcess
            ? 'Ajouter un sous-processus ici'
            : 'Ajouter un processus ici');

        if (filtersActive) {
            button.disabled = true;
            button.title = 'Ajout désactivé pendant l\'application de filtres';
            control.classList.add('is-disabled');
        } else {
            button.addEventListener('click', () => {
                this.toggleInsertionForm({ parentProcess, position });
            });

            control.addEventListener('dragover', (event) => {
                this.handleInsertDragOver(event, control, { parentProcess, position });
            });
            control.addEventListener('dragleave', () => {
                this.handleInsertDragLeave(control);
            });
            control.addEventListener('drop', (event) => {
                this.handleInsertDrop(event, control, { parentProcess, position });
            });
        }

        control.appendChild(button);

        const isActive = this.activeInsertionForm
            && this.activeInsertionForm.position === position
            && (this.activeInsertionForm.parentProcess || null) === (parentProcess || null);

        if (isActive && !filtersActive) {
            control.classList.add('process-insert-open');
            const form = this.renderProcessInsertionForm({ parentProcess, position });
            control.appendChild(form);
        }

        return control;
    }

    toggleInsertionForm(context) {
        const { parentProcess = null, position = 0 } = context || {};

        if (this.activeInsertionForm
            && this.activeInsertionForm.position === position
            && (this.activeInsertionForm.parentProcess || null) === (parentProcess || null)) {
            this.closeActiveInsertionForm({ rerender: true });
            return;
        }

        this.activeInsertionForm = { parentProcess: parentProcess || null, position };
        this.rerenderProcessManager();
    }

    renderProcessInsertionForm(options = {}) {
        const { parentProcess = null, position = 0 } = options;

        const form = document.createElement('form');
        form.className = 'process-insert-form';

        const labelInput = document.createElement('input');
        labelInput.type = 'text';
        labelInput.required = true;
        labelInput.className = 'process-insert-input';
        labelInput.placeholder = parentProcess
            ? 'Libellé du sous-processus'
            : 'Libellé du processus';

        const valueInput = document.createElement('input');
        valueInput.type = 'text';
        valueInput.required = true;
        valueInput.className = 'process-insert-input';
        valueInput.placeholder = parentProcess
            ? 'Identifiant du sous-processus'
            : 'Identifiant du processus';

        this.setupAutoValueSync(labelInput, valueInput);

        const actions = document.createElement('div');
        actions.className = 'process-insert-actions';

        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.className = 'btn btn-primary btn-small';
        submitButton.textContent = parentProcess ? 'Ajouter le sous-processus' : 'Ajouter le processus';

        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'btn btn-outline btn-small';
        cancelButton.textContent = 'Annuler';
        cancelButton.addEventListener('click', () => {
            this.closeActiveInsertionForm({ rerender: true });
        });

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const label = labelInput.value.trim();
            const value = valueInput.value.trim();
            if (!label || !value) {
                return;
            }

            if (parentProcess) {
                this.handleSubProcessSubmit({ parentProcess, label, value, position });
            } else {
                this.handleProcessSubmit({ label, value, position });
            }
        });

        form.appendChild(labelInput);
        form.appendChild(valueInput);
        actions.appendChild(submitButton);
        actions.appendChild(cancelButton);
        form.appendChild(actions);

        return form;
    }

    handleProcessSubmit(payload) {
        const { label, value, position } = payload || {};
        if (!label || !value) {
            return;
        }

        const normalizedLabel = label.trim();
        const baseValue = (value && value.trim()) || slugifyLabel(normalizedLabel);
        const uniqueValue = this.generateUniqueProcessValue(baseValue);

        const entry = {
            value: uniqueValue,
            label: normalizedLabel,
            referents: []
        };

        const insertIndex = Number.isInteger(position)
            ? Math.max(0, Math.min(position, this.config.processes.length))
            : this.config.processes.length;

        this.config.processes.splice(insertIndex, 0, entry);
        this.config.subProcesses[uniqueValue] = [];

        this.saveConfig();
        this.populateSelects();
        this.updateSousProcessusOptions();
        this.closeActiveInsertionForm();
        this.rerenderProcessManager();
    }

    handleSubProcessSubmit(payload) {
        const { parentProcess, label, value, position } = payload || {};
        if (!parentProcess || !label || !value) {
            return;
        }

        const normalizedLabel = label.trim();
        const baseValue = (value && value.trim()) || slugifyLabel(normalizedLabel);
        const uniqueValue = this.generateUniqueSubProcessValue(parentProcess, baseValue);

        if (!this.config.subProcesses[parentProcess]) {
            this.config.subProcesses[parentProcess] = [];
        }

        const list = this.config.subProcesses[parentProcess];
        const insertIndex = Number.isInteger(position)
            ? Math.max(0, Math.min(position, list.length))
            : list.length;

        list.splice(insertIndex, 0, {
            value: uniqueValue,
            label: normalizedLabel,
            referents: []
        });

        this.saveConfig();
        this.updateSousProcessusOptions();
        this.closeActiveInsertionForm();
        this.rerenderProcessManager();
    }

    generateUniqueProcessValue(baseValue, excludeIndex = -1) {
        const fallback = baseValue && baseValue.trim() ? baseValue.trim() : 'processus';
        const existing = new Set();

        this.config.processes.forEach((item, index) => {
            if (index === excludeIndex) {
                return;
            }
            if (item && item.value) {
                existing.add(String(item.value).toLowerCase());
            }
        });

        let candidate = fallback;
        let suffix = 2;
        while (existing.has(candidate.toLowerCase())) {
            candidate = `${fallback}-${suffix}`;
            suffix += 1;
        }
        return candidate;
    }

    generateUniqueSubProcessValue(parentProcess, baseValue, excludeIndex = -1) {
        const fallback = baseValue && baseValue.trim() ? baseValue.trim() : 'sous-processus';
        const list = Array.isArray(this.config.subProcesses[parentProcess])
            ? this.config.subProcesses[parentProcess]
            : [];
        const existing = new Set();

        list.forEach((item, index) => {
            if (index === excludeIndex) {
                return;
            }
            if (item && item.value) {
                existing.add(String(item.value).toLowerCase());
            }
        });

        let candidate = fallback;
        let suffix = 2;
        while (existing.has(candidate.toLowerCase())) {
            candidate = `${fallback}-${suffix}`;
            suffix += 1;
        }
        return candidate;
    }

    createProcessCard(context) {
        const { process, index, visibleSubs, totalSubs, filters, filtersActive } = context;
        const card = document.createElement('div');
        card.className = 'process-card';
        card.dataset.index = String(index);
        card.dataset.value = process.value;
        card.draggable = true;

        const processLabel = process.label || process.value || 'processus';
        const collapseForcedOpen = Boolean(filtersActive);
        const isCollapsed = collapseForcedOpen ? false : this.isProcessCollapsed(process.value);
        card.classList.toggle('is-collapsed', isCollapsed);

        card.addEventListener('dragstart', (event) => {
            this.handleProcessDragStart(event, card, index);
        });
        card.addEventListener('dragend', () => {
            this.handleDragEnd(card);
        });

        const header = document.createElement('div');
        header.className = 'process-card-header';

        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        dragHandle.setAttribute('role', 'presentation');
        header.appendChild(dragHandle);

        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.className = 'process-title-input';
        titleInput.value = process.label || '';
        titleInput.placeholder = 'Nom du processus';
        titleInput.addEventListener('change', () => {
            this.renameProcess(index, titleInput.value);
        });
        titleInput.addEventListener('blur', () => {
            if (titleInput.value.trim() !== (process.label || '')) {
                this.renameProcess(index, titleInput.value);
            }
        });
        header.appendChild(titleInput);

        const headerActions = document.createElement('div');
        headerActions.className = 'process-card-actions';
        header.appendChild(headerActions);

        const summary = document.createElement('span');
        summary.className = 'process-sub-count';
        if (filters.hasQuery || filters.hasReferent) {
            summary.textContent = `${visibleSubs.length} / ${totalSubs} sous-processus`;
        } else {
            summary.textContent = `${totalSubs} sous-processus`;
        }
        headerActions.appendChild(summary);

        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.className = 'process-card-toggle';
        toggleButton.setAttribute('aria-expanded', String(!isCollapsed));
        toggleButton.setAttribute('aria-label', `${isCollapsed ? 'Afficher' : 'Masquer'} les sous-processus du ${processLabel}`);
        toggleButton.classList.toggle('is-collapsed', isCollapsed);
        if (collapseForcedOpen) {
            toggleButton.disabled = true;
            toggleButton.title = "Développement automatique pendant l'application de filtres";
        } else {
            toggleButton.title = isCollapsed
                ? 'Afficher les sous-processus'
                : 'Masquer les sous-processus';
        }
        const toggleIcon = document.createElement('span');
        toggleIcon.className = 'process-card-toggle-icon';
        toggleIcon.setAttribute('aria-hidden', 'true');
        toggleButton.appendChild(toggleIcon);
        if (!collapseForcedOpen) {
            toggleButton.addEventListener('click', () => {
                this.toggleProcessCollapse(process.value);
            });
        }
        headerActions.appendChild(toggleButton);

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'icon-button danger';
        deleteButton.setAttribute('aria-label', `Supprimer le processus ${processLabel}`);
        deleteButton.innerHTML = '<span aria-hidden="true">✕</span>';
        deleteButton.addEventListener('click', () => {
            this.deleteProcess(index);
        });
        headerActions.appendChild(deleteButton);

        card.appendChild(header);

        const referentEditor = this.renderReferentEditor({
            referents: process.referents,
            scope: 'process',
            processIndex: index,
            processValue: process.value
        });
        card.appendChild(referentEditor);

        const subSection = document.createElement('div');
        subSection.className = 'subprocess-section';

        const subHeader = document.createElement('div');
        subHeader.className = 'subprocess-section-header';
        subHeader.textContent = 'Sous-processus';
        subSection.appendChild(subHeader);

        const list = document.createElement('div');
        list.className = 'subprocess-list';

        list.appendChild(this.createProcessInsertionControl(0, {
            parentProcess: process.value,
            filtersActive
        }));

        if (visibleSubs.length === 0) {
            const message = document.createElement('div');
            message.className = 'subprocess-empty';
            message.textContent = totalSubs === 0
                ? 'Aucun sous-processus pour le moment.'
                : 'Aucun sous-processus ne correspond aux filtres.';
            list.appendChild(message);
        } else {
            visibleSubs.forEach((entry) => {
                const subCard = this.createSubProcessCard({
                    parentProcess: process,
                    processIndex: index,
                    subProcess: entry.item,
                    subIndex: entry.index
                });
                list.appendChild(subCard);

                list.appendChild(this.createProcessInsertionControl(entry.index + 1, {
                    parentProcess: process.value,
                    filtersActive
                }));
            });
        }

        subSection.appendChild(list);
        subSection.hidden = isCollapsed;
        subSection.setAttribute('aria-hidden', String(isCollapsed));
        card.appendChild(subSection);

        return card;
    }

    createSubProcessCard(context) {
        const { parentProcess, processIndex, subProcess, subIndex } = context;
        const card = document.createElement('div');
        card.className = 'subprocess-card';
        card.dataset.index = String(subIndex);
        card.dataset.parentProcess = parentProcess.value;
        card.draggable = true;

        card.addEventListener('dragstart', (event) => {
            this.handleSubProcessDragStart(event, card, parentProcess.value, subIndex);
        });
        card.addEventListener('dragend', () => {
            this.handleDragEnd(card);
        });
        card.addEventListener('dragover', (event) => {
            this.handleSubProcessCardDragOver(event, card);
        });
        card.addEventListener('dragleave', (event) => {
            if (!card.contains(event.relatedTarget)) {
                this.handleSubProcessCardDragLeave(card);
            }
        });
        card.addEventListener('drop', (event) => {
            this.handleSubProcessCardDrop(event, card);
        });

        const header = document.createElement('div');
        header.className = 'subprocess-card-header';

        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        header.appendChild(dragHandle);

        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.className = 'subprocess-title-input';
        titleInput.value = subProcess.label || '';
        titleInput.placeholder = 'Nom du sous-processus';
        titleInput.addEventListener('change', () => {
            this.renameSubProcess(parentProcess.value, subIndex, titleInput.value);
        });
        titleInput.addEventListener('blur', () => {
            if (titleInput.value.trim() !== (subProcess.label || '')) {
                this.renameSubProcess(parentProcess.value, subIndex, titleInput.value);
            }
        });
        header.appendChild(titleInput);

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'icon-button danger';
        deleteButton.setAttribute('aria-label', `Supprimer le sous-processus ${subProcess.label}`);
        deleteButton.innerHTML = '<span aria-hidden="true">✕</span>';
        deleteButton.addEventListener('click', () => {
            this.deleteSubProcess(parentProcess.value, subIndex);
        });
        header.appendChild(deleteButton);

        card.appendChild(header);

        const referentEditor = this.renderReferentEditor({
            referents: subProcess.referents,
            scope: 'subprocess',
            processIndex,
            processValue: parentProcess.value,
            subIndex
        });
        card.appendChild(referentEditor);

        return card;
    }

    renderReferentEditor(options = {}) {
        const {
            referents = [],
            scope = 'process',
            processIndex = -1,
            processValue = '',
            subIndex = -1
        } = options;

        const container = document.createElement('div');
        container.className = scope === 'subprocess'
            ? 'subprocess-card-referents'
            : 'process-card-referents';

        const title = document.createElement('div');
        title.className = 'referent-editor-title';
        title.textContent = 'Référents';
        container.appendChild(title);

        const chips = document.createElement('div');
        chips.className = 'referent-chip-container';

        const normalizedReferents = Array.isArray(referents) ? referents : [];
        if (normalizedReferents.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'referent-empty';
            empty.textContent = 'Aucun référent défini';
            chips.appendChild(empty);
        } else {
            normalizedReferents.forEach((referent) => {
                if (!referent) {
                    return;
                }
                const chip = document.createElement('span');
                chip.className = 'referent-chip';
                chip.textContent = referent;

                const remove = document.createElement('button');
                remove.type = 'button';
                remove.className = 'referent-chip-remove';
                remove.setAttribute('aria-label', `Retirer ${referent}`);
                remove.textContent = '×';
                remove.addEventListener('click', () => {
                    if (scope === 'subprocess') {
                        this.removeReferentFromSubProcess(processValue, subIndex, referent);
                    } else {
                        this.removeReferentFromProcess(processIndex, referent);
                    }
                });

                chip.appendChild(remove);
                chips.appendChild(chip);
            });
        }

        container.appendChild(chips);

        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'referent-input-wrapper';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'referent-input';
        input.placeholder = 'Ajouter un référent';
        input.setAttribute('list', 'processReferentSuggestions');

        const commitInputValue = () => {
            const value = input.value.trim();
            if (!value) {
                return;
            }
            if (scope === 'subprocess') {
                this.addReferentToSubProcess(processValue, subIndex, value);
            } else {
                this.addReferentToProcess(processIndex, value);
            }
            input.value = '';
        };

        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ',' || event.key === ';') {
                event.preventDefault();
                commitInputValue();
            }
        });

        input.addEventListener('blur', () => {
            commitInputValue();
        });

        inputWrapper.appendChild(input);

        const helper = document.createElement('p');
        helper.className = 'referent-helper';
        helper.textContent = 'Validez avec Entrée pour ajouter un référent. Les suggestions proviennent des référents existants.';

        container.appendChild(inputWrapper);
        container.appendChild(helper);

        return container;
    }

    closeActiveInsertionForm(options = {}) {
        this.activeInsertionForm = null;
        if (options && options.rerender) {
            this.rerenderProcessManager();
        }
    }

    rerenderProcessManager() {
        if (this.currentConfigSection === 'processManager' && this.processManagerContainer instanceof HTMLElement) {
            this.renderProcessManager(this.processManagerContainer);
        }
    }

    collectAllReferents() {
        const referents = new Set();
        const add = (value) => {
            if (!value || typeof value !== 'string') {
                return;
            }
            const trimmed = value.trim();
            if (!trimmed) {
                return;
            }
            referents.add(trimmed);
        };

        (this.config.processes || []).forEach(process => {
            (process?.referents || []).forEach(add);
            const subs = this.config.subProcesses?.[process.value] || [];
            subs.forEach(sub => {
                (sub?.referents || []).forEach(add);
            });
        });

        return Array.from(referents).sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
    }

    addReferentToProcess(index, referent) {
        const target = this.config.processes?.[index];
        if (!target) {
            return;
        }

        const normalized = typeof referent === 'string' ? referent.trim() : '';
        if (!normalized) {
            return;
        }

        target.referents = Array.isArray(target.referents) ? target.referents : [];
        const exists = target.referents.some(entry => typeof entry === 'string' && entry.toLowerCase() === normalized.toLowerCase());
        if (exists) {
            return;
        }

        target.referents.push(normalized);
        this.saveConfig();
        this.rerenderProcessManager();
    }

    removeReferentFromProcess(index, referent) {
        const target = this.config.processes?.[index];
        if (!target || !Array.isArray(target.referents)) {
            return;
        }

        const normalized = typeof referent === 'string' ? referent.trim().toLowerCase() : '';
        if (!normalized) {
            return;
        }

        target.referents = target.referents.filter(entry => {
            return typeof entry === 'string' && entry.trim().toLowerCase() !== normalized;
        });

        this.saveConfig();
        this.rerenderProcessManager();
    }

    addReferentToSubProcess(processValue, subIndex, referent) {
        if (!processValue || typeof referent !== 'string') {
            return;
        }
        const list = this.config.subProcesses?.[processValue];
        if (!Array.isArray(list) || !list[subIndex]) {
            return;
        }

        const normalized = referent.trim();
        if (!normalized) {
            return;
        }

        list[subIndex].referents = Array.isArray(list[subIndex].referents) ? list[subIndex].referents : [];
        const exists = list[subIndex].referents.some(entry => typeof entry === 'string' && entry.toLowerCase() === normalized.toLowerCase());
        if (exists) {
            return;
        }

        list[subIndex].referents.push(normalized);
        this.saveConfig();
        this.rerenderProcessManager();
    }

    removeReferentFromSubProcess(processValue, subIndex, referent) {
        const list = this.config.subProcesses?.[processValue];
        if (!Array.isArray(list) || !list[subIndex] || typeof referent !== 'string') {
            return;
        }

        const normalized = referent.trim().toLowerCase();
        if (!normalized) {
            return;
        }

        list[subIndex].referents = (list[subIndex].referents || []).filter(entry => {
            return typeof entry === 'string' && entry.trim().toLowerCase() !== normalized;
        });

        this.saveConfig();
        this.rerenderProcessManager();
    }

    renameProcess(index, label) {
        const target = this.config.processes?.[index];
        if (!target) {
            return;
        }

        const normalizedLabel = typeof label === 'string' ? label.trim() : '';
        if (!normalizedLabel) {
            this.rerenderProcessManager();
            return;
        }

        const baseValue = slugifyLabel ? slugifyLabel(normalizedLabel) : normalizedLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const uniqueValue = baseValue === target.value
            ? target.value
            : this.generateUniqueProcessValue(baseValue, index);

        this.updateConfigOption('processes', index, { value: uniqueValue, label: normalizedLabel });
    }

    renameSubProcess(processValue, subIndex, label) {
        const list = this.config.subProcesses?.[processValue];
        if (!Array.isArray(list) || !list[subIndex]) {
            return;
        }

        const normalizedLabel = typeof label === 'string' ? label.trim() : '';
        if (!normalizedLabel) {
            this.rerenderProcessManager();
            return;
        }

        const baseValue = slugifyLabel ? slugifyLabel(normalizedLabel) : normalizedLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const uniqueValue = baseValue === list[subIndex].value
            ? list[subIndex].value
            : this.generateUniqueSubProcessValue(processValue, baseValue, subIndex);

        this.updateSubProcess(processValue, subIndex, { value: uniqueValue, label: normalizedLabel });
        this.rerenderProcessManager();
    }

    deleteProcess(index) {
        const target = this.config.processes?.[index];
        if (!target) {
            return;
        }

        if (typeof confirm === 'function') {
            const confirmed = confirm(`Supprimer le processus "${target.label || target.value}" et ses sous-processus ?`);
            if (!confirmed) {
                return;
            }
        }

        const removed = this.config.processes.splice(index, 1)[0];
        const removedValue = removed?.value;
        if (removedValue && this.config.subProcesses[removedValue]) {
            delete this.config.subProcesses[removedValue];
        }

        if (removedValue && this.collapsedProcesses instanceof Set) {
            this.collapsedProcesses.delete(removedValue);
        }

        if (removedValue) {
            this.risks.forEach(risk => {
                if (risk.processus === removedValue) {
                    risk.processus = '';
                    risk.sousProcessus = '';
                }
            });
        }

        this.saveData();
        this.saveConfig();
        this.populateSelects();
        this.updateSousProcessusOptions();
        this.updateRisksList();
        this.rerenderProcessManager();
    }

    deleteSubProcess(processValue, subIndex) {
        const list = this.config.subProcesses?.[processValue];
        if (!Array.isArray(list) || !list[subIndex]) {
            return;
        }

        const target = list[subIndex];
        if (typeof confirm === 'function') {
            const confirmed = confirm(`Supprimer le sous-processus "${target.label || target.value}" ?`);
            if (!confirmed) {
                return;
            }
        }

        list.splice(subIndex, 1);

        const removedValue = target?.value;
        if (removedValue) {
            this.risks.forEach(risk => {
                if (risk.processus === processValue && risk.sousProcessus === removedValue) {
                    risk.sousProcessus = '';
                }
            });
        }

        this.saveData();
        this.saveConfig();
        this.updateSousProcessusOptions();
        this.updateRisksList();
        this.rerenderProcessManager();
    }

    handleInsertDragOver(event, control, context = {}) {
        if (!this.dragState) {
            return;
        }

        const { parentProcess = null } = context;
        const { type } = this.dragState;

        if ((type === 'process' && parentProcess) || (type === 'subprocess' && parentProcess == null)) {
            return;
        }

        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move';
        }
        control.classList.add('drop-target');
    }

    handleInsertDragLeave(control) {
        control.classList.remove('drop-target');
    }

    handleInsertDrop(event, control, context = {}) {
        if (!this.dragState) {
            return;
        }
        event.preventDefault();
        control.classList.remove('drop-target');
        this.clearSubProcessDropIndicators();

        const position = Number(control.dataset.position || context.position || 0);
        const parentProcess = control.dataset.parentProcess || context.parentProcess || null;

        if (this.dragState.type === 'process' && parentProcess == null) {
            this.moveProcess(this.dragState.fromIndex, position);
        } else if (this.dragState.type === 'subprocess' && parentProcess) {
            this.moveSubProcess(this.dragState.parentProcess, this.dragState.fromIndex, parentProcess, position);
        }

        this.dragState = null;
    }

    handleProcessDragStart(event, card, index) {
        if (event?.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
            try {
                event.dataTransfer.setData('text/plain', `process:${index}`);
            } catch (error) {
                // ignore
            }
        }

        this.dragState = { type: 'process', fromIndex: index };
        card.classList.add('dragging');
    }

    handleSubProcessDragStart(event, card, parentProcess, subIndex) {
        if (event?.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
            try {
                event.dataTransfer.setData('text/plain', `subprocess:${parentProcess}:${subIndex}`);
            } catch (error) {
                // ignore
            }
        }

        this.dragState = { type: 'subprocess', parentProcess, fromIndex: subIndex };
        card.classList.add('dragging');
    }

    handleDragEnd(card) {
        card.classList.remove('dragging');
        this.dragState = null;
        this.clearSubProcessDropIndicators();
    }

    handleSubProcessCardDragOver(event, card) {
        if (!this.dragState || this.dragState.type !== 'subprocess' || !card) {
            return;
        }

        const targetParent = card.dataset.parentProcess;
        if (!targetParent) {
            return;
        }

        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move';
        }

        this.clearSubProcessDropIndicators();

        const rect = card.getBoundingClientRect();
        const midpoint = rect.top + (rect.height / 2);
        const isBefore = event.clientY < midpoint;

        card.classList.toggle('drop-before', isBefore);
        card.classList.toggle('drop-after', !isBefore);
        card.dataset.dropPosition = isBefore ? 'before' : 'after';
    }

    handleSubProcessCardDragLeave(card) {
        if (!card) {
            return;
        }
        card.classList.remove('drop-before', 'drop-after');
        delete card.dataset.dropPosition;
    }

    handleSubProcessCardDrop(event, card) {
        if (!this.dragState || this.dragState.type !== 'subprocess' || !card) {
            return;
        }

        event.preventDefault();

        const targetParent = card.dataset.parentProcess || null;
        if (!targetParent) {
            this.handleSubProcessCardDragLeave(card);
            return;
        }

        const dropPosition = card.dataset.dropPosition === 'after' ? 'after' : 'before';
        const baseIndex = Number(card.dataset.index || 0);
        const insertIndex = dropPosition === 'after' ? baseIndex + 1 : baseIndex;

        this.moveSubProcess(this.dragState.parentProcess, this.dragState.fromIndex, targetParent, insertIndex);

        this.dragState = null;
        this.clearSubProcessDropIndicators();
    }

    clearSubProcessDropIndicators() {
        document.querySelectorAll('.subprocess-card.drop-before, .subprocess-card.drop-after').forEach((element) => {
            element.classList.remove('drop-before', 'drop-after');
            delete element.dataset.dropPosition;
        });
    }

    moveProcess(fromIndex, toIndex) {
        if (!Array.isArray(this.config.processes)) {
            return;
        }
        if (fromIndex === toIndex) {
            return;
        }

        const list = this.config.processes;
        if (fromIndex < 0 || fromIndex >= list.length) {
            return;
        }

        const [item] = list.splice(fromIndex, 1);
        let targetIndex = toIndex;
        if (fromIndex < toIndex) {
            targetIndex -= 1;
        }
        targetIndex = Math.max(0, Math.min(targetIndex, list.length));
        list.splice(targetIndex, 0, item);

        this.saveConfig();
        this.populateSelects();
        this.updateSousProcessusOptions();
        this.rerenderProcessManager();
    }

    moveSubProcess(fromParent, fromIndex, toParent, toIndex) {
        if (!fromParent || fromIndex < 0 || !toParent) {
            return;
        }

        const fromList = this.config.subProcesses?.[fromParent];
        if (!Array.isArray(fromList) || fromIndex >= fromList.length) {
            return;
        }

        const [item] = fromList.splice(fromIndex, 1);
        if (!item) {
            return;
        }

        if (!Array.isArray(this.config.subProcesses[toParent])) {
            this.config.subProcesses[toParent] = [];
        }

        const targetList = this.config.subProcesses[toParent];
        let insertIndex = toIndex;
        if (fromParent === toParent && fromIndex < toIndex) {
            insertIndex -= 1;
        }
        insertIndex = Math.max(0, Math.min(insertIndex, targetList.length));
        targetList.splice(insertIndex, 0, item);

        this.saveConfig();
        this.updateSousProcessusOptions();
        this.rerenderProcessManager();
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
            const isReadOnly = this.readOnlyConfigKeys.has(key);
            if (isReadOnly) {
                listItem.classList.add('config-item-readonly');
            }

            const renderDisplay = () => {
                listItem.innerHTML = '';

                const textSpan = document.createElement('span');
                textSpan.className = 'config-item-text';
                textSpan.textContent = `${opt.label} (${opt.value})`;
                listItem.appendChild(textSpan);

                if (!isReadOnly) {
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
                }

                this.adjustOpenAccordionBodies();
            };

            const renderEditForm = () => {
                if (isReadOnly) {
                    return;
                }

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
        if (this.readOnlyConfigKeys.has(key)) {
            return;
        }
        if (!this.config[key] || !this.config[key][index]) return;
        const { value, label } = updated;
        if (!value || !label) return;

        const previous = this.config[key][index];
        const referents = Array.isArray(previous?.referents)
            ? previous.referents.filter(ref => typeof ref === 'string' && ref.trim())
            : [];
        this.config[key][index] = { value, label, referents };

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

                if (this.collapsedProcesses instanceof Set) {
                    if (this.collapsedProcesses.has(previous.value)) {
                        this.collapsedProcesses.delete(previous.value);
                        this.collapsedProcesses.add(value);
                    }
                }

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
        if (this.readOnlyConfigKeys.has(key)) {
            return;
        }
        const valueInput = document.getElementById(`input-${key}-value`);
        const labelInput = document.getElementById(`input-${key}-label`);
        if (!valueInput || !labelInput) return;
        const value = valueInput.value.trim();
        const label = labelInput.value.trim();
        if (!value || !label) return;
        const entry = { value, label, referents: [] };
        this.config[key].push(entry);
        if (key === 'processes') {
            this.setProcessCollapsed(value, true);
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
        if (this.readOnlyConfigKeys.has(key)) {
            return;
        }
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
        const referents = Array.isArray(previous?.referents)
            ? previous.referents.filter(ref => typeof ref === 'string' && ref.trim())
            : [];
        this.config.subProcesses[process][index] = { value, label, referents };

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
        this.config.subProcesses[process].push({ value, label, referents: [] });
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
        localStorage.setItem('rms_interviews', JSON.stringify(this.interviews));
        this.updateLastSaveTime();
    }

    loadData(key) {
        const data = localStorage.getItem(`rms_${key}`);
        return data ? JSON.parse(data) : null;
    }

    markUnsavedChange(context = 'global') {
        if (!(this.unsavedContexts instanceof Set)) {
            this.unsavedContexts = new Set();
        }

        const key = typeof context === 'string' && context.trim() ? context.trim() : 'global';
        this.unsavedContexts.add(key);
        this.hasUnsavedChanges = this.unsavedContexts.size > 0;
    }

    clearUnsavedChanges(context = null) {
        if (!(this.unsavedContexts instanceof Set)) {
            this.unsavedContexts = new Set();
        }

        if (typeof context === 'string' && context.trim()) {
            this.unsavedContexts.delete(context.trim());
        } else {
            this.unsavedContexts.clear();
        }

        this.hasUnsavedChanges = this.unsavedContexts.size > 0;
    }

    hasUnsavedContext(context) {
        if (!(this.unsavedContexts instanceof Set)) {
            this.unsavedContexts = new Set();
        }

        if (typeof context === 'string' && context.trim()) {
            return this.unsavedContexts.has(context.trim());
        }

        return this.unsavedContexts.size > 0;
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
        const brutGrid = document.getElementById('matrixGridBrut');
        if (brutGrid) {
            brutGrid.innerHTML = '';
            for (let impact = 4; impact >= 1; impact--) {
                for (let prob = 1; prob <= 4; prob++) {
                    const cell = document.createElement('div');
                    cell.className = 'matrix-cell';
                    cell.dataset.probability = prob;
                    cell.dataset.impact = impact;

                    const riskLevel = prob * impact;
                    if (riskLevel <= 4) cell.classList.add('level-1');
                    else if (riskLevel <= 8) cell.classList.add('level-2');
                    else if (riskLevel <= 12) cell.classList.add('level-3');
                    else cell.classList.add('level-4');

                    brutGrid.appendChild(cell);
                }
            }
        }

        const netGrid = document.getElementById('matrixGridNet');
        if (netGrid) {
            netGrid.innerHTML = '';

            const mitigationOptions = typeof getMitigationEffectivenessOptions === 'function'
                ? getMitigationEffectivenessOptions()
                : [
                    { value: 'inefficace', label: 'Inefficace', coefficient: 0 },
                    { value: 'insuffisant', label: 'Insuffisant', coefficient: 0.25 },
                    { value: 'ameliorable', label: 'Améliorable', coefficient: 0.5 },
                    { value: 'efficace', label: 'Efficace', coefficient: 0.75 }
                ];

            const brutLevels = [
                { value: 'critique', label: 'Critique', range: 'Score ≥ 12', reference: 13.5 },
                { value: 'fort', label: 'Fort', range: '6 ≤ score < 12', reference: 9 },
                { value: 'modere', label: 'Modéré', range: '3 ≤ score < 6', reference: 4.5 },
                { value: 'faible', label: 'Faible', range: 'Score < 3', reference: 2 }
            ];

            const severityClassMap = {
                faible: 'level-1',
                modere: 'level-2',
                fort: 'level-3',
                critique: 'level-4'
            };

            const getSeverityClass = (score) => {
                const level = typeof getRiskSeverityFromScore === 'function'
                    ? getRiskSeverityFromScore(score)
                    : (score >= 12 ? 'critique' : score >= 6 ? 'fort' : score >= 3 ? 'modere' : 'faible');
                return severityClassMap[level] || 'level-1';
            };

            brutLevels.forEach(level => {
                mitigationOptions.forEach(option => {
                    const cell = document.createElement('div');
                    cell.className = 'matrix-cell';
                    cell.dataset.brutLevel = level.value;
                    cell.dataset.effectiveness = option.value;
                    const coefficient = Number(option.coefficient) || 0;
                    const referenceScore = level.reference * coefficient;
                    cell.classList.add(getSeverityClass(referenceScore));
                    netGrid.appendChild(cell);
                });
            });

            const rowLabels = document.getElementById('matrixNetRowLabels');
            if (rowLabels) {
                rowLabels.innerHTML = '';
                brutLevels.forEach(level => {
                    const label = document.createElement('div');
                    label.className = 'matrix-net-row-label';
                    label.innerHTML = `${level.label}<span>${level.range}</span>`;
                    rowLabels.appendChild(label);
                });
            }

            const colLabels = document.getElementById('matrixNetColLabels');
            if (colLabels) {
                colLabels.innerHTML = '';
                colLabels.style.display = 'none';
            }
        }

        this.renderRiskPoints();
        this.updateRiskDetailsList();

        const activeView = this.currentView === 'net' ? 'net' : 'brut';
        document.querySelectorAll('.matrix-container[data-view]').forEach(container => {
            const isActive = container.dataset.view === activeView;
            container.classList.toggle('active-view', isActive);
        });
    }

    renderRiskPoints() {
        const baseRisks = Array.isArray(this.risks) ? this.risks : [];
        const filteredRisks = this.getFilteredRisks(baseRisks);

        const viewConfigs = {
            brut: {
                gridId: 'matrixGridBrut',
                probKey: 'probBrut',
                impactKey: 'impactBrut',
                label: 'Risque brut',
                mode: 'brut'
            },
            net: {
                gridId: 'matrixGridNet',
                label: 'Risque net',
                mode: 'net'
            }
        };

        const viewSymbols = { brut: 'B', net: 'N' };
        const mitigationOrder = Array.isArray(MITIGATION_EFFECTIVENESS_ORDER)
            ? [...MITIGATION_EFFECTIVENESS_ORDER]
            : ['inefficace', 'insuffisant', 'ameliorable', 'efficace'];
        const brutLevelsOrder = ['critique', 'fort', 'modere', 'faible'];
        const severityLabelMap = {
            critique: 'Critique',
            fort: 'Fort',
            modere: 'Modéré',
            faible: 'Faible'
        };

        Object.entries(viewConfigs).forEach(([viewKey, config]) => {
            const grid = document.getElementById(config.gridId);
            if (!grid) return;

            grid.querySelectorAll('.risk-point').forEach(p => p.remove());

            const cellCounts = {};

            filteredRisks.forEach(risk => {
                if (config.mode === 'net') {
                    const netInfo = typeof getRiskNetInfo === 'function'
                        ? getRiskNetInfo(risk)
                        : { score: 0, brutScore: 0, coefficient: 0, effectiveness: 'inefficace', label: 'Inefficace' };
                    const brutLevel = typeof getRiskBrutLevel === 'function'
                        ? getRiskBrutLevel(risk)
                        : (typeof getRiskSeverityFromScore === 'function'
                            ? getRiskSeverityFromScore(netInfo.brutScore)
                            : 'faible');

                    const rowIndex = brutLevelsOrder.indexOf(brutLevel);
                    const colIndex = mitigationOrder.indexOf(netInfo.effectiveness);
                    if (rowIndex === -1 || colIndex === -1) {
                        return;
                    }

                    const leftPercent = ((colIndex + 0.5) / mitigationOrder.length) * 100;
                    const bottomPercent = ((brutLevelsOrder.length - rowIndex - 0.5) / brutLevelsOrder.length) * 100;

                    const key = `${colIndex}-${rowIndex}`;
                    const index = cellCounts[key] || 0;
                    cellCounts[key] = index + 1;
                    const slots = cellCounts[key];
                    const gridSize = Math.ceil(Math.sqrt(slots));
                    const slotIndex = index;
                    const row = Math.floor(slotIndex / gridSize);
                    const col = slotIndex % gridSize;

                    const point = document.createElement('div');
                    point.className = `risk-point ${viewKey}`;
                    point.dataset.riskId = risk.id;

                    const tooltipSegments = [];
                    if (risk.description) {
                        tooltipSegments.push(risk.description);
                    }
                    const formattedBrut = Number.isFinite(netInfo.brutScore)
                        ? netInfo.brutScore.toLocaleString('fr-FR', { maximumFractionDigits: 2 })
                        : '0';
                    const formattedNet = Number.isFinite(netInfo.score)
                        ? netInfo.score.toLocaleString('fr-FR', { maximumFractionDigits: 2 })
                        : '0';
                    tooltipSegments.push(`Brut ${formattedBrut} → Net ${formattedNet}`);
                    tooltipSegments.push(`Réduction ${formatMitigationCoefficient(netInfo.coefficient)} (${netInfo.label})`);
                    tooltipSegments.push(`Niveau brut : ${severityLabelMap[brutLevel] || brutLevel}`);

                    point.title = tooltipSegments.join(' • ');
                    point.textContent = viewSymbols[viewKey] || '';
                    point.setAttribute('aria-label', `${config.label} : ${risk.description}`);
                    point.onclick = () => this.selectRisk(risk.id);
                    grid.appendChild(point);

                    const diameter = point.offsetWidth;
                    const margin = 4;
                    const step = diameter + margin;
                    const dx = (col - (gridSize - 1) / 2) * step;
                    const dy = (row - (gridSize - 1) / 2) * step;

                    point.style.left = `calc(${leftPercent}% + ${dx}px)`;
                    point.style.bottom = `calc(${bottomPercent}% + ${dy}px)`;
                    point.style.transform = 'translate(-50%, 50%)';
                    return;
                }

                const baseProb = Number(risk?.[config.probKey]);
                const rawImpact = Number(risk?.[config.impactKey]);
                if (!Number.isFinite(baseProb) || !Number.isFinite(rawImpact)) {
                    return;
                }

                let coefficient = 1;
                let effectiveProb = baseProb;

                if (viewKey === 'brut') {
                    if (typeof getRiskEffectiveBrutProbability === 'function') {
                        effectiveProb = getRiskEffectiveBrutProbability(risk);
                    }
                    if (typeof getRiskAggravatingCoefficient === 'function') {
                        coefficient = getRiskAggravatingCoefficient(risk);
                    }
                }

                const clampedProb = Math.min(4, Math.max(1, effectiveProb || 1));
                const clampedImpact = Math.min(4, Math.max(1, rawImpact || 1));

                const leftPercent = ((clampedProb - 0.5) / 4) * 100;
                const bottomPercent = ((clampedImpact - 0.5) / 4) * 100;

                const key = `${clampedProb}-${clampedImpact}`;
                const index = cellCounts[key] || 0;
                cellCounts[key] = index + 1;
                const slots = cellCounts[key];
                const gridSize = Math.ceil(Math.sqrt(slots));
                const slotIndex = index;
                const row = Math.floor(slotIndex / gridSize);
                const col = slotIndex % gridSize;

                const point = document.createElement('div');
                point.className = `risk-point ${viewKey}`;
                if (viewKey === 'brut') {
                    const aggravatingGroups = (typeof AGGRAVATING_FACTOR_GROUPS === 'object' && AGGRAVATING_FACTOR_GROUPS)
                        ? AGGRAVATING_FACTOR_GROUPS
                        : {};
                    const criticalCoef = Number(aggravatingGroups?.group1?.coefficient) || 1.4;
                    const majorCoef = Number(aggravatingGroups?.group2?.coefficient) || 1.2;
                    const epsilon = 0.0001;
                    if (coefficient >= criticalCoef - epsilon) {
                        point.classList.add('aggravating-critical');
                    } else if (coefficient >= majorCoef - epsilon) {
                        point.classList.add('aggravating-major');
                    }
                }
                point.dataset.riskId = risk.id;
                const tooltipSegments = [];
                if (risk.description) {
                    tooltipSegments.push(risk.description);
                }
                if (coefficient > 1) {
                    const formattedCoef = typeof formatCoefficient === 'function'
                        ? formatCoefficient(coefficient)
                        : (Math.round(coefficient * 10) / 10).toString().replace('.', ',');
                    tooltipSegments.push(`Coef ${formattedCoef}`);
                }

                point.title = tooltipSegments.join(' • ');
                point.textContent = viewSymbols[viewKey] || '';
                point.setAttribute('aria-label', `${config.label} : ${risk.description}`);
                point.onclick = () => this.selectRisk(risk.id);
                grid.appendChild(point);

                const diameter = point.offsetWidth;
                const margin = 4;
                const step = diameter + margin;
                const dx = (col - (gridSize - 1) / 2) * step;
                const dy = (row - (gridSize - 1) / 2) * step;

                point.style.left = `calc(${leftPercent}% + ${dx}px)`;
                point.style.bottom = `calc(${bottomPercent}% + ${dy}px)`;
                point.style.transform = 'translate(-50%, 50%)';
            });
        });
    }

    getFilteredRisks(risks = this.risks) {
        const sourceRisks = Array.isArray(risks) ? risks : [];
        const {
            process = '',
            type = '',
            status = '',
            search = ''
        } = this.filters || {};

        const processFilter = String(process || '').toLowerCase();
        const searchFilter = String(search || '').toLowerCase();

        return sourceRisks.filter(risk => {
            if (processFilter) {
                const riskProcess = risk?.processus != null ? String(risk.processus).toLowerCase() : '';
                if (!riskProcess.includes(processFilter)) {
                    return false;
                }
            }

            if (type && risk?.typeCorruption !== type) {
                return false;
            }

            if (status && risk?.statut !== status) {
                return false;
            }

            if (searchFilter) {
                const description = risk?.description != null ? String(risk.description).toLowerCase() : '';
                if (!description.includes(searchFilter)) {
                    return false;
                }
            }

            return true;
        });
    }

    getRisksByStatus(status) {
        const normalize = (value) => {
            if (value == null) {
                return '';
            }

            const str = String(value).trim().toLowerCase();
            if (typeof str.normalize === 'function') {
                return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            }
            return str;
        };

        const sourceRisks = Array.isArray(this.risks) ? this.risks : [];
        if (!status) {
            return sourceRisks.slice();
        }

        const targetStatus = normalize(status);
        if (!targetStatus) {
            return sourceRisks.slice();
        }

        const statusKeys = ['statut', 'status', 'statusLabel', 'state'];

        return sourceRisks.filter(risk => {
            return statusKeys.some(key => normalize(risk?.[key]) === targetStatus);
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
        const baseRisks = Array.isArray(this.risks) ? this.risks : [];
        const filteredRisks = this.getFilteredRisks(baseRisks);

        const viewConfigs = {
            brut: {
                containerId: 'riskDetailsListBrut',
                titleId: 'riskDetailsTitleBrut',
                probKey: 'probBrut',
                impactKey: 'impactBrut',
                title: 'Risques bruts triés par score',
                mode: 'brut'
            },
            net: {
                containerId: 'riskDetailsListNet',
                titleId: 'riskDetailsTitleNet',
                title: 'Risques nets triés par score',
                mode: 'net'
            }
        };

        Object.values(viewConfigs).forEach((config) => {
            const { containerId, titleId, title, mode } = config;
            const container = document.getElementById(containerId);
            if (!container) return;

            const titleElement = document.getElementById(titleId);
            if (titleElement) {
                titleElement.textContent = title;
            }

            const scoredRisks = filteredRisks.map(risk => {
                if (mode === 'net') {
                    const netInfo = typeof getRiskNetInfo === 'function'
                        ? getRiskNetInfo(risk)
                        : { score: 0, brutScore: 0, coefficient: 0, label: 'Inefficace', effectiveness: 'inefficace' };
                    return { risk, score: netInfo.score, brutScore: netInfo.brutScore, coefficient: netInfo.coefficient, label: netInfo.label, effectiveness: netInfo.effectiveness };
                }

                const baseProb = Number(risk?.[config.probKey]) || 0;
                const impact = Number(risk?.[config.impactKey]) || 0;
                const coefficient = typeof getRiskAggravatingCoefficient === 'function'
                    ? getRiskAggravatingCoefficient(risk)
                    : 1;
                const prob = baseProb * coefficient;
                const baseScore = baseProb * impact;
                return { risk, prob, impact, coefficient, baseScore, score: prob * impact };
            }).sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                if (mode === 'net') {
                    if (b.coefficient !== a.coefficient) return b.coefficient - a.coefficient;
                } else {
                    if ((b.prob || 0) !== (a.prob || 0)) return (b.prob || 0) - (a.prob || 0);
                    if ((b.impact || 0) !== (a.impact || 0)) return (b.impact || 0) - (a.impact || 0);
                }

                const descComparison = (a.risk.description || '').localeCompare(b.risk.description || '', undefined, { sensitivity: 'base' });
                if (descComparison !== 0) return descComparison;

                return String(a.risk.id).localeCompare(String(b.risk.id), undefined, { numeric: true, sensitivity: 'base' });
            });

            if (!scoredRisks.length) {
                const message = baseRisks.length
                    ? 'Aucun risque ne correspond aux filtres appliqués.'
                    : 'Aucun risque enregistré. Ajoutez un risque pour visualiser les détails ici.';

                container.innerHTML = `
                    <div class="matrix-description-empty" style="text-align: center; padding: 16px 12px;">
                        ${message}
                    </div>
                `;
                return;
            }

            const typeMap = (Array.isArray(this.config?.riskTypes) ? this.config.riskTypes : []).reduce((acc, item) => {
                if (!item || item.value === undefined || item.value === null) {
                    return acc;
                }
                const rawValue = String(item.value);
                const label = item.label || rawValue;
                acc[rawValue] = label;
                acc[rawValue.toLowerCase()] = label;
                return acc;
            }, {});

            const resolveTypeLabel = (value) => {
                if (value == null) {
                    return 'Non défini';
                }
                const rawValue = String(value);
                return typeMap[rawValue] || typeMap[rawValue.toLowerCase()] || rawValue;
            };

            container.innerHTML = scoredRisks.map(entry => {
                const { risk, score } = entry;
                let scoreClass = 'low';
                if (score > 12) scoreClass = 'critical';
                else if (score > 8) scoreClass = 'high';
                else if (score > 4) scoreClass = 'medium';

                const processLabel = risk?.processus && String(risk.processus).trim()
                    ? String(risk.processus).trim()
                    : 'Non défini';
                const sp = risk?.sousProcessus && String(risk.sousProcessus).trim()
                    ? ` > ${String(risk.sousProcessus).trim()}`
                    : '';
                const typeLabel = resolveTypeLabel(risk?.typeCorruption);
                const formattedScore = Number.isFinite(score)
                    ? score.toLocaleString('fr-FR', { maximumFractionDigits: 2 })
                    : '0';

                const metaDetails = `Processus: ${processLabel}${sp} • Type: ${typeLabel}`;

                return `
                    <div class="risk-item" data-risk-id="${risk.id}" onclick="rms.selectRisk(${JSON.stringify(risk.id)})">
                        <div class="risk-item-header">
                            <span class="risk-item-title">${risk.description}</span>
                            <span class="risk-item-score ${scoreClass}">${formattedScore}</span>
                        </div>
                        <div class="risk-item-meta">
                            ${metaDetails}
                        </div>
                    </div>
                `;
            }).join('');
        });
    }

    // Dashboard functions
    updateDashboard() {
        const validatedRisks = this.getRisksByStatus('validé');
        const stats = this.calculateStats(validatedRisks);
        const metrics = this.computeDashboardMetrics(validatedRisks, stats);

        this.updateKpiCards({ ...metrics, previous: this.lastDashboardMetrics });
        this.updateCharts(validatedRisks, stats);
        this.updateRecentAlerts(validatedRisks);

        this.lastDashboardMetrics = metrics;
    }

    computeDashboardMetrics(risks = this.risks, stats = null) {
        const sourceRisks = Array.isArray(risks) ? risks : [];
        const computedStats = stats || this.calculateStats(sourceRisks);
        const totalRisks = computedStats?.total ?? sourceRisks.length;

        const totals = sourceRisks.reduce((acc, risk) => {
            const brut = typeof getRiskBrutScore === 'function'
                ? getRiskBrutScore(risk)
                : (Number(risk?.probBrut) || 0) * (Number(risk?.impactBrut) || 0);
            const net = typeof getRiskNetScore === 'function'
                ? getRiskNetScore(risk)
                : (Number(risk?.probNet) || 0) * (Number(risk?.impactNet) || 0);

            return {
                brut: acc.brut + brut,
                net: acc.net + net
            };
        }, { brut: 0, net: 0 });

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

        const allControls = Array.isArray(this.controls) ? this.controls : [];
        const activeControlsList = allControls.filter(control => String(control?.status || '').toLowerCase() === 'actif');
        const activeControls = activeControlsList.length;
        const totalControls = allControls.length;

        const controlTypeOptions = Array.isArray(this.config?.controlTypes)
            ? this.config.controlTypes.filter(option => option && option.value !== undefined && option.value !== null)
            : [];
        const controlTypeOrder = controlTypeOptions.map(option => String(option.value).toLowerCase());
        const controlTypeLabelMap = controlTypeOptions.reduce((acc, option) => {
            const key = String(option.value).toLowerCase();
            acc[key] = option.label || option.value;
            return acc;
        }, {});

        const controlTypeCounts = activeControlsList.reduce((acc, control) => {
            const rawType = control?.type ?? '';
            const normalizedType = rawType ? String(rawType).toLowerCase() : '';
            const key = normalizedType || '__undefined__';

            if (!acc[key]) {
                acc[key] = { count: 0, value: normalizedType, rawValue: rawType };
            }

            acc[key].count += 1;
            return acc;
        }, {});

        const computeDistributionLabel = (entry) => {
            if (!entry) {
                return 'Non défini';
            }

            const normalizedValue = entry.value;
            if (normalizedValue) {
                return controlTypeLabelMap[normalizedValue] || entry.rawValue || normalizedValue;
            }

            return 'Non défini';
        };

        const controlTypeDistribution = [];
        const pushDistributionEntry = (key) => {
            const entry = controlTypeCounts[key];
            if (!entry) return;

            controlTypeDistribution.push({
                value: entry.value,
                label: computeDistributionLabel(entry),
                count: entry.count,
                percentage: 0
            });

            delete controlTypeCounts[key];
        };

        controlTypeOrder.forEach(pushDistributionEntry);

        Object.keys(controlTypeCounts).forEach((key) => {
            pushDistributionEntry(key);
        });

        if (activeControls > 0 && controlTypeDistribution.length > 0) {
            const distributionWithRemainder = controlTypeDistribution.map((item) => {
                const rawShare = (item.count / activeControls) * 100;
                const baseShare = Math.floor(rawShare);

                return {
                    item,
                    baseShare,
                    remainder: rawShare - baseShare
                };
            });

            let assigned = 0;
            distributionWithRemainder.forEach(({ item, baseShare }) => {
                item.percentage = baseShare;
                assigned += baseShare;
            });

            let remaining = Math.max(0, 100 - assigned);

            if (remaining > 0) {
                distributionWithRemainder
                    .slice()
                    .sort((a, b) => {
                        if (b.remainder === a.remainder) {
                            return (b.item.count || 0) - (a.item.count || 0);
                        }

                        return b.remainder - a.remainder;
                    })
                    .forEach(({ item }) => {
                        if (remaining <= 0) {
                            return;
                        }

                        item.percentage += 1;
                        remaining -= 1;
                    });
            }

            let index = 0;
            while (remaining > 0 && controlTypeDistribution.length > 0) {
                controlTypeDistribution[index % controlTypeDistribution.length].percentage += 1;
                remaining -= 1;
                index += 1;
            }
        }

        const actionPlans = Array.isArray(this.actionPlans) ? this.actionPlans : [];
        const totalActionPlans = actionPlans.length;

        const statusOptions = Array.isArray(this.config?.actionPlanStatuses)
            ? this.config.actionPlanStatuses.filter(option => option && option.value !== undefined && option.value !== null)
            : [];
        const statusOrder = statusOptions.map(option => String(option.value).toLowerCase());
        const statusLabelMap = statusOptions.reduce((acc, option) => {
            const key = String(option.value).toLowerCase();
            acc[key] = option.label || option.value;
            return acc;
        }, {});

        const statusCounts = actionPlans.reduce((acc, plan) => {
            const rawStatus = plan?.status ?? '';
            const rawString = rawStatus != null ? String(rawStatus).trim() : '';
            const normalizedStatus = rawString ? rawString.toLowerCase() : '';
            const key = normalizedStatus || '__undefined__';

            if (!acc[key]) {
                acc[key] = { count: 0, value: normalizedStatus, rawValue: rawString };
            }

            acc[key].count += 1;
            return acc;
        }, {});

        const actionPlanStatusDistribution = [];

        statusOrder.forEach((statusValue) => {
            const key = statusValue || '__undefined__';
            const entry = statusCounts[key];
            const label = statusLabelMap[statusValue] || entry?.rawValue || statusValue || 'Non défini';

            actionPlanStatusDistribution.push({
                value: statusValue,
                label,
                count: entry?.count || 0
            });

            if (entry) {
                delete statusCounts[key];
            }
        });

        Object.keys(statusCounts).forEach((key) => {
            const entry = statusCounts[key];
            if (!entry) {
                return;
            }

            const normalizedValue = entry.value || '';
            const label = normalizedValue
                ? (statusLabelMap[normalizedValue] || entry.rawValue || normalizedValue)
                : (entry.rawValue || 'Non défini');

            actionPlanStatusDistribution.push({
                value: normalizedValue,
                label,
                count: entry.count || 0
            });

            delete statusCounts[key];
        });

        const actionPlanStatusMetrics = {
            total: totalActionPlans,
            distribution: actionPlanStatusDistribution
        };

        return {
            stats: { ...computedStats },
            activeControls,
            totalControls,
            controlTypeDistribution,
            globalScore,
            averageReduction,
            actionPlanStatusMetrics
        };
    }

    getDashboardExportData() {
        const validatedRisks = this.getRisksByStatus('validé');
        const stats = this.calculateStats(validatedRisks);
        const metrics = this.computeDashboardMetrics(validatedRisks, stats);
        const filteredRisks = this.getFilteredRisks(Array.isArray(validatedRisks) ? validatedRisks : []);

        const enrichedRisks = filteredRisks.map(risk => {
            const netInfo = typeof getRiskNetInfo === 'function'
                ? getRiskNetInfo(risk)
                : { score: 0, brutScore: 0, coefficient: 0, label: 'Inefficace', reduction: 0 };
            return { risk, score: netInfo.score, brutScore: netInfo.brutScore, coefficient: netInfo.coefficient, label: netInfo.label, reduction: netInfo.reduction };
        }).filter(entry => Number.isFinite(entry.score));

        const topRisks = enrichedRisks
            .slice()
            .sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                if (b.coefficient !== a.coefficient) return b.coefficient - a.coefficient;
                const aTitle = a.risk?.titre || a.risk?.description || '';
                const bTitle = b.risk?.titre || b.risk?.description || '';
                return aTitle.localeCompare(bTitle, 'fr', { sensitivity: 'base' });
            })
            .slice(0, 10)
            .map((entry, index) => {
                const risk = entry.risk || {};
                const subProcessRaw = risk.sousProcessus;
                const subProcessLabel = subProcessRaw && String(subProcessRaw).trim() ? subProcessRaw : '';
                return {
                    rank: index + 1,
                    id: risk.id,
                    titre: risk.titre || risk.description || 'Risque sans titre',
                    processus: risk.processus || 'Non défini',
                    sousProcessus: subProcessLabel,
                    score: Number.isFinite(entry.score) ? entry.score : 0,
                    brutScore: Number.isFinite(entry.brutScore) ? entry.brutScore : 0,
                    reduction: Number.isFinite(entry.coefficient) ? Math.round(entry.coefficient * 100) : 0,
                    effectivenessLabel: entry.label || ''
                };
            });

        const processMetrics = filteredRisks.reduce((acc, risk) => {
            const rawLabel = risk?.processus;
            const label = rawLabel && String(rawLabel).trim() ? String(rawLabel).trim() : 'Non défini';
            if (!acc[label]) {
                acc[label] = { count: 0, totalScore: 0, maxScore: 0 };
            }

            const netScore = typeof getRiskNetScore === 'function'
                ? getRiskNetScore(risk)
                : (Number(risk?.probNet) || 0) * (Number(risk?.impactNet) || 0);

            acc[label].count += 1;
            if (Number.isFinite(netScore)) {
                acc[label].totalScore += netScore;
                acc[label].maxScore = Math.max(acc[label].maxScore, netScore);
            }
            return acc;
        }, {});

        const processDistribution = Object.keys(processMetrics).map(label => ({
            label,
            count: processMetrics[label].count || 0
        })).sort((a, b) => {
            if (b.count !== a.count) return b.count - a.count;
            return a.label.localeCompare(b.label, 'fr', { sensitivity: 'base' });
        });

        const processSeverity = Object.entries(processMetrics).map(([label, metrics]) => {
            const count = metrics.count || 0;
            const average = count > 0 ? metrics.totalScore / count : 0;
            const maxScore = metrics.maxScore || 0;
            return { label, count, average, maxScore };
        }).sort((a, b) => {
            if (b.average !== a.average) return b.average - a.average;
            if (b.maxScore !== a.maxScore) return b.maxScore - a.maxScore;
            return a.label.localeCompare(b.label, 'fr', { sensitivity: 'base' });
        });

        const alerts = this.getRecentAlertsData(filteredRisks);

        return {
            generatedAt: new Date().toISOString(),
            metrics,
            topRisks,
            processOverview: {
                distribution: processDistribution,
                severity: processSeverity
            },
            alerts
        };
    }

    updateKpiCards(metrics) {
        if (!metrics || !metrics.stats) return;

        const {
            stats,
            activeControls,
            controlTypeDistribution,
            previous,
            actionPlanStatusMetrics
        } = metrics;
        const previousStats = previous?.stats || null;
        const previousActiveControls = previous?.activeControls ?? activeControls;
        const actionPlanMetrics = actionPlanStatusMetrics && typeof actionPlanStatusMetrics === 'object'
            ? actionPlanStatusMetrics
            : { total: 0, distribution: [] };

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

        const formatControlTypeDistribution = (distribution, total) => {
            if (!total) {
                return 'Aucun contrôle actif';
            }

            if (!Array.isArray(distribution) || distribution.length === 0) {
                const plural = total > 1 ? 's' : '';
                return `${total} contrôle${plural} actif${plural}`;
            }

            return distribution.map((item) => {
                if (!item) {
                    return '0% de contrôles "Non défini"';
                }

                const percent = Number.isFinite(item.percentage)
                    ? item.percentage
                    : (total > 0 ? Math.round((Number(item.count) || 0) / total * 100) : 0);
                const label = item.label || item.value || 'Non défini';
                return `${percent}% de contrôles "${label}"`;
            }).join(' ; ');
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

            const delta = activeControls - previousActiveControls;
            const changeEl = card.querySelector('.stat-change');
            const distributionLabel = formatControlTypeDistribution(controlTypeDistribution, activeControls);
            applyTrend(changeEl, delta, {
                inverted: false,
                stableLabel: () => distributionLabel,
                formatter: ({ arrow, signedValue }) => {
                    const base = `${arrow} ${signedValue} vs dernière mesure`;
                    return distributionLabel ? `${base} (${distributionLabel})` : base;
                }
            });
        });

        updateCard('.stat-card.plan-status-card', (card) => {
            const totalElement = card.querySelector('#actionPlanStatusTotal');
            const summaryElement = card.querySelector('#actionPlanStatusSummary');
            const chartCanvas = card.querySelector('#actionPlanStatusChart');

            const totalPlans = Number(actionPlanMetrics.total) || 0;
            const distribution = Array.isArray(actionPlanMetrics.distribution)
                ? actionPlanMetrics.distribution
                : [];

            if (totalElement) {
                totalElement.textContent = totalPlans > 0
                    ? `${totalPlans} plan${totalPlans > 1 ? 's' : ''} d'action`
                    : "Aucun plan d'action";
            }

            const palette = [
                { background: 'rgba(52, 152, 219, 0.85)', border: 'rgba(52, 152, 219, 1)' },
                { background: 'rgba(46, 204, 113, 0.85)', border: 'rgba(46, 204, 113, 1)' },
                { background: 'rgba(241, 196, 15, 0.85)', border: 'rgba(241, 196, 15, 1)' },
                { background: 'rgba(231, 76, 60, 0.85)', border: 'rgba(231, 76, 60, 1)' },
                { background: 'rgba(155, 89, 182, 0.85)', border: 'rgba(155, 89, 182, 1)' },
                { background: 'rgba(26, 188, 156, 0.85)', border: 'rgba(26, 188, 156, 1)' },
                { background: 'rgba(230, 126, 34, 0.85)', border: 'rgba(230, 126, 34, 1)' },
                { background: 'rgba(149, 165, 166, 0.85)', border: 'rgba(149, 165, 166, 1)' }
            ];

            const getColor = (index, type = 'background') => {
                const fallback = type === 'border' ? '#bdc3c7' : 'rgba(189, 195, 199, 0.6)';
                const entry = palette[index % palette.length];
                if (!entry) {
                    return fallback;
                }

                if (typeof entry === 'string') {
                    return entry;
                }

                return entry[type] || entry.background || fallback;
            };

            if (summaryElement) {
                if (totalPlans === 0 || distribution.length === 0) {
                    summaryElement.innerHTML = '<div class="plan-status-empty">Aucun plan d\'action enregistré</div>';
                } else {
                    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (match) => {
                        const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
                        return entities[match] || match;
                    });

                    const summaryContent = distribution.map((item, index) => {
                        const label = escapeHtml(item?.label || 'Non défini');
                        const count = Number(item?.count) || 0;
                        const plural = count > 1 ? 'plans' : 'plan';
                        const color = getColor(index, 'border');

                        return `
                            <div class="plan-status-item">
                                <div class="plan-status-info">
                                    <span class="plan-status-color" style="background-color: ${color};"></span>
                                    <span class="plan-status-label">${label}</span>
                                </div>
                                <span class="plan-status-count">${count} ${plural} d'action</span>
                            </div>
                        `;
                    }).join('');

                    summaryElement.innerHTML = summaryContent;
                }
            }

            if (chartCanvas && typeof Chart !== 'undefined') {
                ensureEmptyChartMessagePlugin();

                if (!this.charts) {
                    this.charts = {};
                }

                const hasData = totalPlans > 0 && distribution.some(item => (Number(item?.count) || 0) > 0);
                const chartData = {
                    labels: distribution.map(item => item?.label || 'Non défini'),
                    datasets: [
                        {
                            data: distribution.map(item => Number(item?.count) || 0),
                            backgroundColor: distribution.map((_, index) => getColor(index, 'background')),
                            borderColor: distribution.map((_, index) => getColor(index, 'border')),
                            borderWidth: hasData ? 1 : 0,
                            hoverOffset: hasData ? 6 : 0
                        }
                    ]
                };

                const chartOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%',
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            enabled: hasData,
                            callbacks: {
                                label: (context) => {
                                    const value = Number(context.raw) || 0;
                                    const plural = value > 1 ? 'plans' : 'plan';
                                    const label = context.label || 'Non défini';
                                    return `${label}: ${value} ${plural} d'action`;
                                }
                            }
                        },
                        emptyChartMessage: {
                            display: !hasData,
                            message: "Aucun plan d'action"
                        }
                    }
                };

                if (this.charts.actionPlanStatus) {
                    const chart = this.charts.actionPlanStatus;
                    chart.data.labels = chartData.labels;
                    chart.data.datasets = chartData.datasets;
                    chart.options = chartOptions;
                    chart.update();
                } else {
                    this.charts.actionPlanStatus = new Chart(chartCanvas, {
                        type: 'doughnut',
                        data: chartData,
                        options: chartOptions
                    });
                }
            }
        });
    }

    getRecentAlertsData(risks = this.risks) {
        const sourceRisks = Array.isArray(risks) ? risks : [];

        const formatDate = (value) => {
            if (!value) {
                return '-';
            }
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) {
                return '-';
            }
            return date.toLocaleDateString('fr-FR');
        };

        const normalizeValue = (value) => {
            if (value == null) {
                return '';
            }
            const str = String(value).trim().toLowerCase();
            if (typeof str.normalize === 'function') {
                return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            }
            return str;
        };

        const parsePlanDueDate = (value) => {
            if (value == null) {
                return null;
            }
            const raw = String(value).trim();
            if (!raw) {
                return null;
            }

            if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
                return new Date(`${raw}T00:00:00`);
            }

            if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
                const [day, month, year] = raw.split('/');
                return new Date(`${year}-${month}-${day}T00:00:00`);
            }

            const parsed = Date.parse(raw);
            if (Number.isNaN(parsed)) {
                return null;
            }
            const date = new Date(parsed);
            return Number.isNaN(date.getTime()) ? null : date;
        };

        const normalizeId = (value) => {
            if (value == null) {
                return '';
            }
            return String(value).trim();
        };

        const allActionPlans = Array.isArray(this.actionPlans) ? this.actionPlans : [];
        const actionPlanIndex = new Map();
        const riskPlanLinks = new Map();

        allActionPlans.forEach(plan => {
            if (!plan || typeof plan !== 'object') {
                return;
            }

            const planId = normalizeId(plan.id);
            if (planId) {
                actionPlanIndex.set(planId, plan);
            }

            const linkedRisks = Array.isArray(plan.risks)
                ? plan.risks
                : Array.isArray(plan.riskIds)
                    ? plan.riskIds
                    : Array.isArray(plan.actionedRisks)
                        ? plan.actionedRisks
                        : [];

            linkedRisks.forEach(riskId => {
                const normalizedRiskId = normalizeId(riskId);
                if (!normalizedRiskId) {
                    return;
                }
                if (!riskPlanLinks.has(normalizedRiskId)) {
                    riskPlanLinks.set(normalizedRiskId, new Set());
                }
                if (planId) {
                    riskPlanLinks.get(normalizedRiskId).add(planId);
                }
            });
        });

        const collectPlansForRisk = (risk) => {
            const seen = new Set();
            const plans = [];

            const addPlanById = (planId) => {
                if (!planId || seen.has(planId)) {
                    return;
                }
                seen.add(planId);
                const indexed = actionPlanIndex.get(planId);
                if (indexed) {
                    plans.push(indexed);
                }
            };

            const addPlanObject = (planObj) => {
                if (!planObj || typeof planObj !== 'object') {
                    return;
                }
                const planId = normalizeId(planObj.id);
                if (planId) {
                    if (seen.has(planId)) {
                        return;
                    }
                    seen.add(planId);
                    plans.push(actionPlanIndex.get(planId) || planObj);
                    return;
                }
                const uniqueKey = `__obj_${plans.length}`;
                if (seen.has(uniqueKey)) {
                    return;
                }
                seen.add(uniqueKey);
                plans.push(planObj);
            };

            const directRefs = Array.isArray(risk?.actionPlans) ? risk.actionPlans : [];
            directRefs.forEach(ref => {
                if (typeof ref === 'object') {
                    addPlanObject(ref);
                } else {
                    addPlanById(normalizeId(ref));
                }
            });

            const riskId = normalizeId(risk?.id);
            if (riskId && riskPlanLinks.has(riskId)) {
                riskPlanLinks.get(riskId).forEach(addPlanById);
            }

            return plans;
        };

        const severityLabels = {
            critique: 'Critique',
            fort: 'Fort',
            modere: 'Modéré'
        };

        const acceptableSeverities = new Set(['modere', 'fort', 'critique']);

        const severeRisks = sourceRisks
            .map(risk => {
                const score = typeof getRiskNetScore === 'function'
                    ? getRiskNetScore(risk)
                    : (Number(risk.probNet) || 0) * (Number(risk.impactNet) || 0);

                const severity = typeof getRiskSeverityFromScore === 'function'
                    ? getRiskSeverityFromScore(score)
                    : (score >= 12 ? 'critique' : score >= 6 ? 'fort' : score >= 3 ? 'modere' : 'faible');
                const severityKey = normalizeValue(severity);
                if (!acceptableSeverities.has(severityKey)) {
                    return null;
                }

                const statusKeys = ['statut', 'status', 'statusLabel', 'state'];
                const riskStatus = statusKeys
                    .map(key => normalizeValue(risk?.[key]))
                    .find(value => Boolean(value));
                if (riskStatus !== 'valide') {
                    return null;
                }

                const associatedPlans = collectPlansForRisk(risk);
                const hasPlans = associatedPlans.length > 0;
                const hasDraftPlan = associatedPlans.some(plan => normalizeValue(plan?.status ?? plan?.statut ?? plan?.statusLabel) === 'brouillon');

                if (hasPlans && !hasDraftPlan) {
                    return null;
                }

                const dateValue = risk.dateCreation || risk.date || risk.createdAt;
                return {
                    id: risk.id,
                    description: risk.description || risk.titre || 'Sans description',
                    process: risk.processus || risk.process || '-',
                    level: severityLabels[severityKey] || 'Modéré',
                    severity: severityKey,
                    score,
                    date: dateValue || null,
                    formattedDate: formatDate(dateValue)
                };
            })
            .filter(Boolean)
            .sort((a, b) => {
                const getTime = (entry) => {
                    if (!entry.date) {
                        return 0;
                    }
                    const parsed = new Date(entry.date).getTime();
                    return Number.isNaN(parsed) ? 0 : parsed;
                };
                return getTime(b) - getTime(a);
            });

        const statusMap = (this.config?.actionPlanStatuses || []).reduce((acc, item) => {
            const key = normalizeValue(item?.value);
            if (key) {
                acc[key] = item?.label || item?.value;
            }
            return acc;
        }, {});

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTime = today.getTime();

        const overdueActionPlans = (Array.isArray(this.actionPlans) ? this.actionPlans : [])
            .map(plan => {
                const dueDate = parsePlanDueDate(plan?.dueDate);
                const statusValue = normalizeValue(plan?.status ?? plan?.statut ?? plan?.statusLabel);
                const statusLabel = statusMap[statusValue] || plan?.statusLabel || plan?.status || plan?.statut || '-';
                return {
                    plan,
                    dueDate,
                    statusValue,
                    statusLabel
                };
            })
            .filter(({ dueDate, statusValue }) => {
                if (!dueDate || Number.isNaN(dueDate.getTime())) {
                    return false;
                }
                if (statusValue === 'termine') {
                    return false;
                }
                return dueDate.getTime() < todayTime;
            })
            .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
            .map(({ plan, dueDate, statusLabel }) => ({
                title: plan?.title || 'Plan sans titre',
                owner: plan?.owner || '-',
                statusLabel,
                dueDate: dueDate ? dueDate.toISOString() : null,
                formattedDueDate: dueDate ? dueDate.toLocaleDateString('fr-FR') : (plan?.dueDate || '-')
            }));

        return { severeRisks, overdueActionPlans };
    }

    updateRecentAlerts(risks = this.risks) {
        const risksBody = document.getElementById('recentAlertsRisksBody');
        const plansBody = document.getElementById('recentAlertsPlansBody');

        const { severeRisks, overdueActionPlans } = this.getRecentAlertsData(risks);

        this.updateDashboardBadge(severeRisks.length + overdueActionPlans.length);

        if (!risksBody && !plansBody) {
            return;
        }

        if (risksBody) {
            if (severeRisks.length === 0) {
                risksBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="table-empty">Aucune alerte récente</td>
                    </tr>
                `;
            } else {
                risksBody.innerHTML = severeRisks.map(risk => {
                    const badgeClassMap = {
                        critique: 'badge-danger',
                        fort: 'badge-warning',
                        modere: 'badge-info'
                    };
                    const badgeClass = badgeClassMap[risk.severity] || 'badge-warning';

                    return `
                        <tr>
                            <td>${risk.formattedDate}</td>
                            <td>${risk.description}</td>
                            <td>${risk.process}</td>
                            <td><span class="table-badge ${badgeClass}">${risk.level}</span></td>
                            <td class="table-actions-cell">
                                <button class="action-btn" onclick="rms.selectRisk(${JSON.stringify(risk.id)})">👁️</button>
                                <button class="action-btn" onclick="rms.editRisk(${JSON.stringify(risk.id)})">✏️</button>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
        }

        if (plansBody) {
            if (overdueActionPlans.length === 0) {
                plansBody.innerHTML = `
                    <tr>
                        <td colspan="4" class="table-empty">Aucun plan d'action en retard</td>
                    </tr>
                `;
            } else {
                plansBody.innerHTML = overdueActionPlans.map(plan => `
                        <tr>
                            <td>${plan.title}</td>
                            <td>${plan.owner || '-'}</td>
                            <td>${plan.formattedDueDate}</td>
                            <td>${plan.statusLabel}</td>
                        </tr>
                    `).join('');
            }
        }
    }

    updateDashboardBadge(count = 0) {
        const dashboardBadge = document.querySelector('.tabs-container .tab .tab-badge');
        if (!dashboardBadge) {
            return;
        }

        const numericCount = Number(count);
        const safeCount = Number.isFinite(numericCount) ? Math.max(0, Math.trunc(numericCount)) : 0;
        dashboardBadge.textContent = String(safeCount);
    }

    calculateStats(risks = this.risks) {
        const sourceRisks = Array.isArray(risks) ? risks : [];
        const stats = {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            total: sourceRisks.length
        };

        sourceRisks.forEach(risk => {
            const score = typeof getRiskNetScore === 'function'
                ? getRiskNetScore(risk)
                : (Number(risk?.probNet) || 0) * (Number(risk?.impactNet) || 0);
            if (score > 12) stats.critical++;
            else if (score > 8) stats.high++;
            else if (score > 4) stats.medium++;
            else stats.low++;
        });

        return stats;
    }

    updateCharts(risks = this.risks, stats = null) {
        const baseRisks = Array.isArray(risks) ? risks : [];
        const filteredRisks = this.getFilteredRisks(baseRisks);

        const topRisksBody = document.getElementById('topRisksTableBody');
        const topRisksContent = document.getElementById('topRisksContent');
        if (topRisksBody && topRisksContent) {
            const enrichedRisks = filteredRisks.map(risk => {
                const netInfo = typeof getRiskNetInfo === 'function'
                    ? getRiskNetInfo(risk)
                    : { score: 0, brutScore: 0, coefficient: 0, reduction: 0, label: 'Inefficace' };
                return { risk, score: netInfo.score, brutScore: netInfo.brutScore, coefficient: netInfo.coefficient, reduction: netInfo.reduction, label: netInfo.label };
            }).filter(entry => Number.isFinite(entry.score));

            const topRisks = enrichedRisks.sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                if (b.coefficient !== a.coefficient) return b.coefficient - a.coefficient;
                const aTitle = a.risk?.titre || a.risk?.description || '';
                const bTitle = b.risk?.titre || b.risk?.description || '';
                return aTitle.localeCompare(bTitle, 'fr', { sensitivity: 'base' });
            }).slice(0, 10);

            if (!topRisks.length) {
                topRisksBody.innerHTML = '';
                topRisksContent.classList.add('is-empty');
            } else {
                topRisksContent.classList.remove('is-empty');
                topRisksBody.innerHTML = topRisks.map((entry, index) => {
                    const risk = entry.risk || {};
                    const rank = index + 1;
                    const title = risk.titre || risk.description || 'Risque sans titre';
                    const processLabel = risk.processus || 'Non défini';
                    const subProcessRaw = risk.sousProcessus;
                    const subProcessLabel = subProcessRaw && String(subProcessRaw).trim() ? subProcessRaw : '—';
                    const scoreLabel = Number.isFinite(entry.score)
                        ? entry.score.toLocaleString('fr-FR')
                        : '0';
                    const brutLabel = Number.isFinite(entry.brutScore)
                        ? entry.brutScore.toLocaleString('fr-FR')
                        : '0';
                    const reductionLabel = `${entry.reduction ?? 0}%${entry.label ? ` (${entry.label})` : ''}`;
                    const meta = `Brut ${brutLabel} → Net ${scoreLabel} • Réduction ${reductionLabel}`;

                    return `
                        <tr>
                            <td>${rank}</td>
                            <td>
                                <span class="top-risk-title">${title}</span>
                                <span class="top-risk-meta">${meta}</span>
                            </td>
                            <td class="top-risk-process">${processLabel}</td>
                            <td class="top-risk-subprocess">${subProcessLabel}</td>
                            <td class="top-risk-score">${scoreLabel}</td>
                        </tr>
                    `;
                }).join('');
            }
        }

        if (this.charts && this.charts.evolution) {
            try {
                if (typeof this.charts.evolution.destroy === 'function') {
                    this.charts.evolution.destroy();
                }
            } catch (error) {
                console.warn('Erreur lors de la destruction du graphique d\'évolution :', error);
            }
            delete this.charts.evolution;
        }

        if (typeof Chart === 'undefined') {
            return;
        }

        ensureEmptyChartMessagePlugin();

        if (!this.charts) {
            this.charts = {};
        }

        const scoreMode = this.processScoreMode === 'brut' ? 'brut' : 'net';
        const scoreKeyMap = {
            brut: { prob: 'probBrut', impact: 'impactBrut' }
        };

        const processMetrics = filteredRisks.reduce((acc, risk) => {
            const rawLabel = risk?.processus;
            const label = rawLabel && String(rawLabel).trim() ? String(rawLabel).trim() : 'Non défini';
            if (!acc[label]) {
                acc[label] = { count: 0, scores: [], maxScore: 0 };
            }

            acc[label].count += 1;

            let score = 0;
            if (scoreMode === 'brut') {
                const probKey = scoreKeyMap.brut.prob;
                const impactKey = scoreKeyMap.brut.impact;
                const baseProb = Number(risk?.[probKey]) || 0;
                const impact = Number(risk?.[impactKey]) || 0;
                const coefficient = typeof getRiskAggravatingCoefficient === 'function'
                    ? getRiskAggravatingCoefficient(risk)
                    : 1;
                score = baseProb * coefficient * impact;
            } else {
                score = typeof getRiskNetScore === 'function'
                    ? getRiskNetScore(risk)
                    : (Number(risk?.probNet) || 0) * (Number(risk?.impactNet) || 0);
            }

            if (Number.isFinite(score)) {
                acc[label].scores.push(score);
                acc[label].maxScore = Math.max(acc[label].maxScore, score);
            }

            return acc;
        }, {});

        const computeMedian = (values) => {
            if (!Array.isArray(values) || values.length === 0) {
                return 0;
            }

            const sorted = values
                .filter(value => Number.isFinite(value))
                .sort((a, b) => a - b);

            if (!sorted.length) {
                return 0;
            }

            const middle = Math.floor(sorted.length / 2);
            if (sorted.length % 2 === 0) {
                return (sorted[middle - 1] + sorted[middle]) / 2;
            }
            return sorted[middle];
        };

        const combinedCanvas = document.getElementById('processCombinedChart');
        const summaryElement = document.getElementById('processChartSummary');
        const scoreModeSelect = document.getElementById('processScoreMode');
        if (scoreModeSelect && scoreModeSelect.value !== scoreMode) {
            scoreModeSelect.value = scoreMode;
        }

        if (combinedCanvas || summaryElement) {
            const entries = Object.entries(processMetrics).map(([label, metrics]) => {
                const median = computeMedian(metrics.scores);
                return {
                    label,
                    count: metrics.count || 0,
                    median,
                    maxScore: metrics.maxScore || 0
                };
            });

            const sortedEntries = entries.slice().sort((a, b) => {
                if (b.count !== a.count) return b.count - a.count;
                if (b.median !== a.median) return b.median - a.median;
                return a.label.localeCompare(b.label, 'fr', { sensitivity: 'base' });
            });

            if (combinedCanvas) {
                const totalCount = sortedEntries.reduce((sum, entry) => sum + entry.count, 0);
                const hasProcessData = sortedEntries.some(entry => entry.count > 0);
                const labels = sortedEntries.map(entry => entry.label);
                const counts = sortedEntries.map(entry => entry.count);
                const medians = sortedEntries.map(entry => Number(entry.median.toFixed(2)));

                const metadata = sortedEntries.map(entry => ({
                    ...entry,
                    share: totalCount > 0 ? entry.count / totalCount : 0
                }));

                const scoreLabel = scoreMode === 'brut' ? 'Score médian brut' : 'Score médian net';
                const maxTheoreticalScore = 16;

                const combinedData = {
                    labels,
                    datasets: [
                        {
                            type: 'bar',
                            label: 'Nombre de risques',
                            data: counts,
                            backgroundColor: counts.map(() => 'rgba(52, 152, 219, 0.6)'),
                            borderColor: counts.map(() => 'rgba(52, 152, 219, 1)'),
                            borderWidth: hasProcessData ? 1.5 : 0,
                            borderRadius: 6,
                            maxBarThickness: 48,
                            minBarLength: 2,
                            yAxisID: 'y',
                            metadata
                        },
                        {
                            type: 'line',
                            label: scoreLabel,
                            data: medians,
                            borderColor: 'rgba(231, 76, 60, 1)',
                            backgroundColor: 'rgba(231, 76, 60, 0.15)',
                            yAxisID: 'y1',
                            fill: false,
                            tension: 0.25,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            pointBackgroundColor: 'rgba(231, 76, 60, 1)',
                            pointBorderColor: '#ffffff',
                            borderWidth: 2,
                            metadata
                        }
                    ]
                };

                const combinedOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Nombre de risques'
                            },
                            ticks: {
                                precision: 0
                            }
                        },
                        y1: {
                            beginAtZero: true,
                            position: 'right',
                            grid: {
                                drawOnChartArea: false
                            },
                            suggestedMax: maxTheoreticalScore,
                            title: {
                                display: true,
                                text: scoreLabel
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'bottom'
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                label: (context) => {
                                    const entry = context?.dataset?.metadata?.[context.dataIndex];
                                    if (context.dataset.type === 'line') {
                                        const value = entry ? entry.median : context.parsed.y;
                                        const formatted = Number(value || 0).toFixed(1).replace('.', ',');
                                        return `${scoreLabel} : ${formatted}`;
                                    }
                                    if (context.dataset.type === 'bar') {
                                        const value = Number(context.raw) || 0;
                                        const plural = value > 1 ? 'risques' : 'risque';
                                        const share = entry ? Math.round(entry.share * 100) : (totalCount > 0 ? Math.round((value / totalCount) * 100) : 0);
                                        return `${value} ${plural} (${share}%)`;
                                    }
                                    return `${context.dataset.label}: ${context.formattedValue}`;
                                }
                            }
                        },
                        emptyChartMessage: {
                            display: !hasProcessData,
                            message: 'Aucun risque à afficher'
                        }
                    }
                };

                if (this.charts.processSeverity) {
                    try {
                        if (typeof this.charts.processSeverity.destroy === 'function') {
                            this.charts.processSeverity.destroy();
                        }
                    } catch (error) {
                        console.warn('Erreur lors de la destruction du graphique de sévérité :', error);
                    }
                    delete this.charts.processSeverity;
                }

                if (this.charts.process) {
                    const chart = this.charts.process;
                    chart.data.labels = combinedData.labels;
                    chart.data.datasets = combinedData.datasets;
                    chart.options = combinedOptions;
                    chart.update();
                } else {
                    this.charts.process = new Chart(combinedCanvas, {
                        type: 'bar',
                        data: combinedData,
                        options: combinedOptions
                    });
                }
            }

            if (summaryElement) {
                const totalCount = sortedEntries.reduce((sum, entry) => sum + entry.count, 0);
                const nonZeroEntries = sortedEntries.filter(entry => entry.count > 0);
                const formatScore = (value) => Number(value || 0).toFixed(1).replace('.', ',');
                const scoreDescriptor = scoreMode === 'brut' ? 'brut' : 'net';

                if (!totalCount || nonZeroEntries.length === 0) {
                    summaryElement.textContent = 'Aucun risque filtré à analyser.';
                } else if (nonZeroEntries.length === 1) {
                    const [top] = nonZeroEntries;
                    summaryElement.textContent = `Le processus ${top.label} concentre 100 % des risques filtrés avec un score médian (${scoreDescriptor}) de ${formatScore(top.median)}.`;
                } else {
                    const [first, second] = nonZeroEntries;
                    const share = Math.round(((first.count + second.count) / totalCount) * 100);
                    summaryElement.textContent = `Les processus ${first.label} et ${second.label} regroupent ${share}% des risques filtrés avec des scores médians (${scoreDescriptor}) de ${formatScore(first.median)} et ${formatScore(second.median)}.`;
                }
            }
        }

    }

    // Risk list functions
    updateRisksList() {
        const tbody = document.getElementById('risksTableBody');
        if (!tbody) return;

        const allRisks = Array.isArray(this.risks) ? this.risks : [];
        const filteredRisks = this.getFilteredRisks(allRisks);

        const buildLabelMap = (list) => {
            return (Array.isArray(list) ? list : []).reduce((acc, item) => {
                if (!item || item.value === undefined || item.value === null) {
                    return acc;
                }
                const rawValue = String(item.value);
                const label = item.label || rawValue;
                acc[rawValue] = label;
                acc[rawValue.toLowerCase()] = label;
                return acc;
            }, {});
        };

        const typeMap = buildLabelMap(this.config?.riskTypes);
        const tierMap = buildLabelMap(this.config?.tiers);

        const resolveLabel = (map, value) => {
            if (value == null) {
                return value;
            }
            const rawValue = String(value);
            return map[rawValue] || map[rawValue.toLowerCase()] || value;
        };

        if (!allRisks.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="table-empty">Aucun risque enregistré</td>
                </tr>
            `;
            return;
        }

        if (!filteredRisks.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="table-empty">Aucun risque ne correspond aux filtres</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filteredRisks.map(risk => {
            const brutScore = typeof getRiskBrutScore === 'function'
                ? getRiskBrutScore(risk)
                : (Number(risk?.probBrut) || 0) * (Number(risk?.impactBrut) || 0);
            const netInfo = typeof getRiskNetInfo === 'function'
                ? getRiskNetInfo(risk)
                : { score: (Number(risk?.probNet) || 0) * (Number(risk?.impactNet) || 0), coefficient: 0, reduction: 0, label: '' };
            const netScore = netInfo.score;
            const brutLabel = Number.isFinite(brutScore)
                ? brutScore.toLocaleString('fr-FR', { maximumFractionDigits: 2 })
                : '0';
            const netLabel = Number.isFinite(netScore)
                ? netScore.toLocaleString('fr-FR', { maximumFractionDigits: 2 })
                : '0';
            const reductionPercent = Number.isFinite(netInfo.reduction)
                ? netInfo.reduction
                : Math.round((netInfo.coefficient || 0) * 100);
            const reductionLabel = `${reductionPercent}%`;
            const effectivenessLabel = netInfo.label ? ` (${netInfo.label})` : '';

            const typeLabel = resolveLabel(typeMap, risk.typeCorruption);
            const tierLabels = Array.isArray(risk.tiers)
                ? risk.tiers.map(tier => resolveLabel(tierMap, tier))
                : [];

            return `
                <tr>
                    <td>#${risk.id}</td>
                    <td>${risk.description}</td>
                    <td>${risk.processus}</td>
                    <td>${risk.sousProcessus || ''}</td>
                    <td>${typeLabel}</td>
                    <td>${tierLabels.join(', ')}</td>
                    <td>${brutLabel}</td>
                    <td title="Réduction ${reductionLabel}${effectivenessLabel}">${netLabel}</td>
                    <td><span class="table-badge badge-${risk.statut === 'validé' ? 'success' : risk.statut === 'archive' ? 'danger' : 'warning'}">${risk.statut}</span></td>
                    <td class="table-actions-cell">
                        <button class="action-btn" onclick="rms.editRisk(${JSON.stringify(risk.id)})">✏️</button>
                        <button class="action-btn" onclick="rms.deleteRisk(${JSON.stringify(risk.id)})">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Controls functions
    getFilteredControls() {
        const controls = Array.isArray(this.controls) ? this.controls : [];
        const { type = '', origin = '', status = '', search = '' } = this.controlFilters || {};

        const typeFilter = String(type || '').toLowerCase();
        const originFilter = String(origin || '').toLowerCase();
        const statusFilter = String(status || '').toLowerCase();
        const searchTerm = String(search || '').trim().toLowerCase();

        if (!typeFilter && !originFilter && !statusFilter && !searchTerm) {
            return controls.slice();
        }

        return controls.filter(control => {
            const controlType = String(control?.type || '').toLowerCase();
            const controlOrigin = String(control?.origin || '').toLowerCase();
            const controlStatus = String(control?.status || '').toLowerCase();
            const controlName = String(control?.name || '').toLowerCase();
            const controlOwner = String(control?.owner || '').toLowerCase();

            if (typeFilter && controlType !== typeFilter) {
                return false;
            }

            if (originFilter && controlOrigin !== originFilter) {
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

        const originMap = (this.config.controlOrigins || []).reduce((acc, item) => {
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
            const rawOrigin = control?.origin ?? '';
            const normalizedOrigin = rawOrigin ? String(rawOrigin).toLowerCase() : '';
            const originLabel = normalizedOrigin ? (originMap[normalizedOrigin] || rawOrigin) : '';
            const originClass = normalizedOrigin ? normalizedOrigin.replace(/[^a-z0-9-]+/g, '-') : 'origin-undefined';
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
                    <div class="controls-table-cell control-origin-cell">
                        ${originLabel ? `<span class="control-origin-badge ${originClass}">${originLabel}</span>` : `<span class="text-placeholder">Non définie</span>`}
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

    // Interview management
    refreshProcessColorMap() {
        if (!(this.processColorMap instanceof Map)) {
            this.processColorMap = new Map();
        } else {
            this.processColorMap.clear();
        }

        const processes = Array.isArray(this.config?.processes) ? this.config.processes : [];
        const paletteSize = 8;

        processes.forEach((process, index) => {
            const value = process?.value;
            if (!value) {
                return;
            }
            const colorClass = `process-color-${index % paletteSize}`;
            this.processColorMap.set(value, colorClass);
        });
    }

    getProcessColorClass(processValue) {
        if (!processValue) {
            return 'process-color-0';
        }

        if (this.processColorMap instanceof Map && this.processColorMap.has(processValue)) {
            return this.processColorMap.get(processValue);
        }

        return 'process-color-0';
    }

    getProcessLabel(processValue) {
        if (!processValue) {
            return '';
        }

        const processes = Array.isArray(this.config?.processes) ? this.config.processes : [];
        const match = processes.find(process => process && process.value === processValue);
        if (match) {
            return match.label || match.value || processValue;
        }

        return processValue;
    }

    getSubProcessLabel(processValue, subProcessValue) {
        if (!processValue || !subProcessValue) {
            return subProcessValue || '';
        }

        const subProcesses = this.config?.subProcesses?.[processValue];
        if (!Array.isArray(subProcesses)) {
            return subProcessValue;
        }

        const match = subProcesses.find(subProcess => subProcess && subProcess.value === subProcessValue);
        if (match) {
            return match.label || match.value || subProcessValue;
        }

        return subProcessValue;
    }

    getAllKnownReferents() {
        const referentSet = new Set(this.collectAllReferents());

        if (Array.isArray(this.interviews)) {
            this.interviews.forEach(interview => {
                if (!interview || !Array.isArray(interview.referents)) {
                    return;
                }

                interview.referents.forEach(ref => {
                    if (typeof ref === 'string' && ref.trim()) {
                        referentSet.add(ref.trim());
                    }
                });
            });
        }

        return Array.from(referentSet).sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
    }

    updateInterviewReferentSelect(options) {
        const select = document.getElementById('interviewReferents');
        if (!select) {
            return;
        }

        const currentSelection = Array.isArray(this.interviewEditorState?.referents)
            ? [...this.interviewEditorState.referents]
            : Array.from(select.selectedOptions || []).map(option => option.value);

        select.innerHTML = '';

        const normalizedOptions = Array.isArray(options) ? options : [];

        normalizedOptions.forEach(option => {
            if (!option || typeof option !== 'object') {
                return;
            }

            const value = option.value;
            const label = option.label ?? value;

            if (value == null) {
                return;
            }

            const opt = document.createElement('option');
            opt.value = value;
            opt.textContent = label;
            if (currentSelection.includes(value)) {
                opt.selected = true;
            }
            select.appendChild(opt);
        });
    }

    populateInterviewSubProcessFilterOptions() {
        const select = document.getElementById('interviewSubProcessFilter');
        if (!select) {
            return;
        }

        const previousValue = this.interviewFilters?.subProcess || '';
        const processFilter = this.interviewFilters?.process || '';

        select.innerHTML = '';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Tous les sous-processus';
        select.appendChild(placeholder);

        const optionsMap = new Map();
        const addOption = (scope) => {
            if (!scope || !scope.subProcessValue) {
                return;
            }

            if (processFilter && scope.processValue !== processFilter) {
                return;
            }

            const key = `${scope.processValue}::${scope.subProcessValue}`;
            if (optionsMap.has(key)) {
                return;
            }

            const label = `${scope.processLabel || this.getProcessLabel(scope.processValue)} • ${scope.subProcessLabel || this.getSubProcessLabel(scope.processValue, scope.subProcessValue)}`;
            optionsMap.set(key, { value: key, label });
        };

        (Array.isArray(this.interviews) ? this.interviews : []).forEach(interview => {
            if (!interview || !Array.isArray(interview.scopes)) {
                return;
            }
            interview.scopes.forEach(scope => addOption(scope));
        });

        const sortedOptions = Array.from(optionsMap.values())
            .sort((a, b) => a.label.localeCompare(b.label, 'fr', { sensitivity: 'base' }));

        sortedOptions.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.label;
            if (option.value === previousValue) {
                opt.selected = true;
            }
            select.appendChild(opt);
        });

        if (previousValue && !optionsMap.has(previousValue)) {
            select.value = '';
            if (this.interviewFilters) {
                this.interviewFilters.subProcess = '';
            }
        }
    }

    setInterviewFilter(filterKey, value) {
        if (!this.interviewFilters || typeof filterKey !== 'string') {
            return;
        }

        const normalizedKey = filterKey.trim();
        if (!normalizedKey || !(normalizedKey in this.interviewFilters)) {
            return;
        }

        const normalizedValue = value == null ? '' : String(value);
        this.interviewFilters[normalizedKey] = normalizedValue;

        if (normalizedKey === 'process') {
            this.populateInterviewSubProcessFilterOptions();
        }

        this.updateInterviewsList();
    }

    handleInterviewReferentsChange(element) {
        if (!this.interviewEditorState) {
            this.interviewEditorState = {
                editingId: null,
                referents: [],
                selectedScopeKeys: new Set(),
                availableScopes: [],
                fallbackScopes: []
            };
        }

        const values = element
            ? Array.from(element.selectedOptions || []).map(option => option.value).filter(value => typeof value === 'string' && value.trim())
            : [];

        this.interviewEditorState.referents = values;
        this.renderInterviewScopeSelection();
    }

    computeInterviewScopesForReferents(referents) {
        const normalizedReferents = Array.isArray(referents)
            ? referents
                .map(ref => typeof ref === 'string' ? ref.trim().toLowerCase() : '')
                .filter(Boolean)
            : [];

        if (!normalizedReferents.length) {
            return [];
        }

        const seen = new Set();
        const scopes = [];
        const processes = Array.isArray(this.config?.processes) ? this.config.processes : [];

        processes.forEach(process => {
            if (!process || !process.value) {
                return;
            }

            const processValue = process.value;
            const processLabel = process.label || process.value;
            const processReferents = Array.isArray(process.referents)
                ? process.referents.map(ref => typeof ref === 'string' ? ref.trim().toLowerCase() : '').filter(Boolean)
                : [];

            const includeAllSubProcesses = processReferents.some(ref => normalizedReferents.includes(ref));
            const subProcesses = Array.isArray(this.config?.subProcesses?.[processValue])
                ? this.config.subProcesses[processValue]
                : [];

            if (includeAllSubProcesses && subProcesses.length === 0) {
                const key = `${processValue}::`;
                if (!seen.has(key)) {
                    seen.add(key);
                    scopes.push({
                        key,
                        processValue,
                        processLabel,
                        subProcessValue: '',
                        subProcessLabel: '',
                        type: 'process'
                    });
                }
            }

            if (subProcesses.length) {
                subProcesses.forEach(subProcess => {
                    if (!subProcess || !subProcess.value) {
                        return;
                    }

                    const subProcessValue = subProcess.value;
                    const subProcessLabel = subProcess.label || subProcess.value;
                    const subReferents = Array.isArray(subProcess.referents)
                        ? subProcess.referents.map(ref => typeof ref === 'string' ? ref.trim().toLowerCase() : '').filter(Boolean)
                        : [];

                    if (includeAllSubProcesses || subReferents.some(ref => normalizedReferents.includes(ref))) {
                        const key = `${processValue}::${subProcessValue}`;
                        if (!seen.has(key)) {
                            seen.add(key);
                            scopes.push({
                                key,
                                processValue,
                                processLabel,
                                subProcessValue,
                                subProcessLabel,
                                type: 'subProcess'
                            });
                        }
                    }
                });
            }

            if (!includeAllSubProcesses && subProcesses.length === 0 && processReferents.some(ref => normalizedReferents.includes(ref))) {
                const key = `${processValue}::`;
                if (!seen.has(key)) {
                    seen.add(key);
                    scopes.push({
                        key,
                        processValue,
                        processLabel,
                        subProcessValue: '',
                        subProcessLabel: '',
                        type: 'process'
                    });
                }
            }
        });

        return scopes;
    }

    renderInterviewScopeSelection(options = {}) {
        const container = document.getElementById('interviewScopeSelection');
        const helper = document.getElementById('interviewScopeHelper');

        if (!container || !helper) {
            return;
        }

        if (!this.interviewEditorState) {
            this.interviewEditorState = {
                editingId: null,
                referents: [],
                selectedScopeKeys: new Set(),
                availableScopes: [],
                fallbackScopes: []
            };
        }

        const state = this.interviewEditorState;
        if (!(state.selectedScopeKeys instanceof Set)) {
            state.selectedScopeKeys = new Set();
        }

        const referents = Array.isArray(state.referents) ? state.referents : [];
        const preserveSelection = Boolean(options.preserveSelection);

        if (!referents.length) {
            helper.textContent = 'Sélectionnez un ou plusieurs référents pour afficher les sous-processus correspondants.';
            container.innerHTML = '<div class="interview-scope-empty">Aucun référent sélectionné.</div>';
            state.availableScopes = [];
            return;
        }

        let availableScopes = this.computeInterviewScopesForReferents(referents);
        if (!availableScopes.length && Array.isArray(state.fallbackScopes) && state.fallbackScopes.length) {
            availableScopes = [...state.fallbackScopes];
        }

        state.availableScopes = availableScopes;

        if (!availableScopes.length) {
            helper.textContent = 'Aucun processus ou sous-processus n’est associé aux référents sélectionnés.';
            container.innerHTML = '<div class="interview-scope-empty">Aucun élément disponible pour ces référents.</div>';
            state.selectedScopeKeys.clear();
            return;
        }

        const availableKeys = new Set(availableScopes.map(scope => scope.key));
        Array.from(state.selectedScopeKeys).forEach(key => {
            if (!availableKeys.has(key)) {
                state.selectedScopeKeys.delete(key);
            }
        });

        if (!preserveSelection && state.selectedScopeKeys.size === 0) {
            availableScopes.forEach(scope => state.selectedScopeKeys.add(scope.key));
        }

        const selectedCount = state.selectedScopeKeys.size;
        const totalCount = availableScopes.length;

        if (selectedCount === 0) {
            helper.textContent = 'Aucun élément sélectionné. Sélectionnez au moins un sous-processus.';
        } else if (selectedCount === totalCount) {
            helper.textContent = 'Tous les sous-processus correspondant aux référents sont sélectionnés.';
        } else {
            helper.textContent = `${selectedCount} élément${selectedCount > 1 ? 's' : ''} sélectionné${selectedCount > 1 ? 's' : ''} sur ${totalCount}.`;
        }

        const groups = new Map();
        availableScopes.forEach(scope => {
            const processValue = scope.processValue || '';
            if (!groups.has(processValue)) {
                groups.set(processValue, {
                    processValue,
                    processLabel: scope.processLabel || this.getProcessLabel(processValue) || processValue || 'Processus',
                    items: []
                });
            }
            groups.get(processValue).items.push(scope);
        });

        const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, match => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[match] || match));

        const escapeAttribute = (value) => String(value ?? '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

        container.innerHTML = Array.from(groups.values()).map(group => {
            const colorClass = this.getProcessColorClass(group.processValue);
            const chips = group.items.map(scope => {
                const isSelected = state.selectedScopeKeys.has(scope.key);
                const label = scope.subProcessValue
                    ? (scope.subProcessLabel || this.getSubProcessLabel(scope.processValue, scope.subProcessValue) || scope.subProcessValue)
                    : 'Processus complet';
                const escapedKey = escapeAttribute(scope.key);
                return `<div class="interview-subprocess-chip ${isSelected ? '' : 'deselected'}" tabindex="0" role="button" aria-pressed="${isSelected}" onclick="rms.toggleInterviewScope('${escapedKey}')" onkeydown="rms.handleInterviewScopeKey(event, '${escapedKey}')">${escapeHtml(label)}</div>`;
            }).join('');

            const itemCountLabel = `${group.items.length} élément${group.items.length > 1 ? 's' : ''}`;

            return `<div class="interview-scope-group ${colorClass}"><div class="interview-scope-group-header"><div class="interview-scope-group-title">${escapeHtml(group.processLabel)}</div><div class="interview-scope-group-count">${itemCountLabel}</div></div><div class="interview-scope-chips">${chips}</div></div>`;
        }).join('');
    }

    toggleInterviewScope(scopeKey) {
        if (!this.interviewEditorState) {
            return;
        }

        const key = scopeKey == null ? '' : String(scopeKey);
        if (!key) {
            return;
        }

        if (!(this.interviewEditorState.selectedScopeKeys instanceof Set)) {
            this.interviewEditorState.selectedScopeKeys = new Set();
        }

        if (this.interviewEditorState.selectedScopeKeys.has(key)) {
            this.interviewEditorState.selectedScopeKeys.delete(key);
        } else {
            this.interviewEditorState.selectedScopeKeys.add(key);
        }

        this.markUnsavedChange('interviewForm');
        this.renderInterviewScopeSelection({ preserveSelection: true });
    }

    handleInterviewScopeKey(event, scopeKey) {
        if (!event) {
            return;
        }

        const key = event.key || event.code;
        if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
            event.preventDefault();
            this.toggleInterviewScope(scopeKey);
        }
    }

    applyInterviewFormat(command) {
        if (typeof document === 'undefined') {
            return;
        }

        const notes = document.getElementById('interviewNotes');
        if (!notes) {
            return;
        }

        notes.focus();
        try {
            document.execCommand(command, false, null);
        } catch (error) {
            console.warn('Unsupported formatting command', command, error);
        }
    }

    applyInterviewLink() {
        if (typeof document === 'undefined') {
            return;
        }

        const notes = document.getElementById('interviewNotes');
        if (!notes) {
            return;
        }

        const url = prompt('Adresse du lien', 'https://');
        if (!url) {
            return;
        }

        let normalized = url.trim();
        if (!/^https?:\/\//i.test(normalized)) {
            normalized = `https://${normalized}`;
        }

        notes.focus();
        try {
            document.execCommand('createLink', false, normalized);
        } catch (error) {
            console.warn('Unable to create link', error);
        }
    }

    clearInterviewFormatting() {
        if (typeof document === 'undefined') {
            return;
        }

        const notes = document.getElementById('interviewNotes');
        if (!notes) {
            return;
        }

        notes.focus();
        try {
            document.execCommand('removeFormat', false, null);
            document.execCommand('unlink', false, null);
        } catch (error) {
            console.warn('Unable to clear formatting', error);
        }
    }

    openInterviewModal(interviewId = null) {
        if (typeof document === 'undefined') {
            return;
        }

        const modal = document.getElementById('interviewModal');
        const form = document.getElementById('interviewForm');
        const titleInput = document.getElementById('interviewTitle');
        const dateInput = document.getElementById('interviewDate');
        const notesElement = document.getElementById('interviewNotes');
        const modalTitle = document.getElementById('interviewModalTitle');

        if (!modal || !form || !notesElement) {
            return;
        }

        let targetInterview = null;
        if (interviewId != null) {
            targetInterview = (this.interviews || []).find(interview => idsEqual(interview.id, interviewId)) || null;
        }

        form.reset();
        notesElement.innerHTML = '';

        const referents = targetInterview && Array.isArray(targetInterview.referents)
            ? [...targetInterview.referents]
            : [];

        const selectedScopeKeys = targetInterview && Array.isArray(targetInterview.scopes)
            ? new Set(targetInterview.scopes.map(scope => scope.key))
            : new Set();

        const fallbackScopes = targetInterview && Array.isArray(targetInterview.scopes)
            ? [...targetInterview.scopes]
            : [];

        this.interviewEditorState = {
            editingId: targetInterview ? targetInterview.id : null,
            referents,
            selectedScopeKeys,
            availableScopes: [],
            fallbackScopes
        };

        const referentOptions = this.getAllKnownReferents().map(ref => ({ value: ref, label: ref }));
        this.updateInterviewReferentSelect(referentOptions);

        if (titleInput) {
            titleInput.value = targetInterview?.title || '';
        }

        if (dateInput) {
            const dateValue = targetInterview?.date || this.getTodayDateString();
            dateInput.value = dateValue;
        }

        notesElement.innerHTML = targetInterview?.notes || '';

        if (modalTitle) {
            modalTitle.textContent = targetInterview ? 'Modifier le compte-rendu' : 'Nouveau compte-rendu';
        }

        this.renderInterviewScopeSelection();

        modal.classList.add('show');

        setTimeout(() => {
            if (titleInput) {
                titleInput.focus();
            } else {
                const referentSelect = document.getElementById('interviewReferents');
                referentSelect && referentSelect.focus();
            }
        }, 50);
    }

    closeInterviewModal() {
        if (typeof document === 'undefined') {
            return;
        }

        const modal = document.getElementById('interviewModal');
        if (!modal) {
            return;
        }

        modal.classList.remove('show');

        const form = document.getElementById('interviewForm');
        const notes = document.getElementById('interviewNotes');
        if (form) {
            form.reset();
        }
        if (notes) {
            notes.innerHTML = '';
        }

        this.interviewEditorState = null;
    }

    getTodayDateString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    formatInterviewDate(value) {
        if (!value) {
            return '';
        }

        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const [year, month, day] = value.split('-');
            return `${day}/${month}/${year}`;
        }

        if (typeof value === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
            return value;
        }

        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toLocaleDateString('fr-FR');
        }

        return String(value);
    }

    formatInterviewDateTime(value) {
        if (!value) {
            return '';
        }

        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toLocaleString('fr-FR');
        }

        return this.formatInterviewDate(value);
    }

    saveInterview() {
        if (typeof document === 'undefined') {
            return;
        }

        const form = document.getElementById('interviewForm');
        if (!form) {
            return;
        }

        const titleInput = document.getElementById('interviewTitle');
        const dateInput = document.getElementById('interviewDate');
        const notesElement = document.getElementById('interviewNotes');
        const referentSelect = document.getElementById('interviewReferents');

        const title = titleInput ? titleInput.value.trim() : '';
        const dateValue = dateInput ? this.normalizeInterviewDate(dateInput.value) : '';

        const referents = referentSelect
            ? Array.from(referentSelect.selectedOptions || []).map(option => option.value).filter(value => typeof value === 'string' && value.trim())
            : [];

        if (!referents.length) {
            alert('Sélectionnez au moins un référent pour le compte-rendu.');
            return;
        }

        if (!dateValue) {
            alert('Indiquez une date valide pour le compte-rendu.');
            return;
        }

        const notes = notesElement ? notesElement.innerHTML.trim() : '';

        if (!this.interviewEditorState) {
            this.interviewEditorState = {
                editingId: null,
                referents,
                selectedScopeKeys: new Set(),
                availableScopes: [],
                fallbackScopes: []
            };
        }

        this.interviewEditorState.referents = referents;

        const scopeMap = new Map();
        (Array.isArray(this.interviewEditorState.availableScopes) ? this.interviewEditorState.availableScopes : []).forEach(scope => {
            if (scope && scope.key) {
                scopeMap.set(scope.key, scope);
            }
        });
        (Array.isArray(this.interviewEditorState.fallbackScopes) ? this.interviewEditorState.fallbackScopes : []).forEach(scope => {
            if (scope && scope.key && !scopeMap.has(scope.key)) {
                scopeMap.set(scope.key, scope);
            }
        });

        const selectedKeys = Array.from(this.interviewEditorState.selectedScopeKeys instanceof Set
            ? this.interviewEditorState.selectedScopeKeys
            : new Set());
        const selectedScopes = selectedKeys.map(key => scopeMap.get(key)).filter(Boolean);

        if (!selectedScopes.length) {
            alert('Sélectionnez au moins un processus ou sous-processus lié à cette interview.');
            return;
        }

        let existingInterview = null;
        if (this.interviewEditorState.editingId != null && Array.isArray(this.interviews)) {
            existingInterview = this.interviews.find(entry => idsEqual(entry.id, this.interviewEditorState.editingId)) || null;
        }

        const processesMap = new Map();
        selectedScopes.forEach(scope => {
            if (!scope || !scope.processValue) {
                return;
            }
            if (!processesMap.has(scope.processValue)) {
                processesMap.set(scope.processValue, {
                    value: scope.processValue,
                    label: scope.processLabel || this.getProcessLabel(scope.processValue) || scope.processValue
                });
            }
        });

        const subProcesses = selectedScopes
            .filter(scope => scope.subProcessValue)
            .map(scope => ({
                processValue: scope.processValue,
                processLabel: scope.processLabel || this.getProcessLabel(scope.processValue) || scope.processValue,
                value: scope.subProcessValue,
                label: scope.subProcessLabel || this.getSubProcessLabel(scope.processValue, scope.subProcessValue) || scope.subProcessValue
            }));

        const timestamp = new Date().toISOString();

        const interviewPayload = {
            id: this.interviewEditorState.editingId != null
                ? this.interviewEditorState.editingId
                : getNextSequentialId(this.interviews),
            title,
            referents,
            date: dateValue,
            notes,
            scopes: selectedScopes,
            processes: Array.from(processesMap.values()),
            subProcesses,
            createdAt: existingInterview?.createdAt || timestamp,
            updatedAt: timestamp
        };

        const normalizedInterview = this.normalizeInterview(interviewPayload);

        if (this.interviewEditorState.editingId != null) {
            const index = Array.isArray(this.interviews)
                ? this.interviews.findIndex(entry => idsEqual(entry.id, this.interviewEditorState.editingId))
                : -1;
            if (index > -1) {
                this.interviews[index] = normalizedInterview;
            }
        } else {
            if (!Array.isArray(this.interviews)) {
                this.interviews = [];
            }
            this.interviews.push(normalizedInterview);
        }

        this.interviewEditorState = null;
        this.saveData();
        this.clearUnsavedChanges('interviewForm');
        this.updateInterviewsList();
        this.closeInterviewModal();

        if (typeof showNotification === 'function') {
            showNotification('success', existingInterview ? 'Compte-rendu mis à jour avec succès' : 'Compte-rendu créé avec succès');
        }
    }

    deleteInterview(interviewId) {
        if (!Array.isArray(this.interviews)) {
            return;
        }

        const targetIndex = this.interviews.findIndex(interview => idsEqual(interview.id, interviewId));
        if (targetIndex === -1) {
            alert('Compte-rendu introuvable.');
            return;
        }

        if (!confirm('Confirmez-vous la suppression de ce compte-rendu ?')) {
            return;
        }

        this.interviews.splice(targetIndex, 1);
        this.saveData();
        this.updateInterviewsList();

        if (typeof showNotification === 'function') {
            showNotification('success', 'Compte-rendu supprimé.');
        }
    }

    updateInterviewsList() {
        if (typeof document === 'undefined') {
            return;
        }

        const container = document.getElementById('interviewList');
        const countElement = document.getElementById('interviewCount');

        if (!container) {
            return;
        }

        this.populateInterviewSubProcessFilterOptions();

        const interviews = Array.isArray(this.interviews) ? [...this.interviews] : [];
        const filters = this.interviewFilters || { process: '', subProcess: '', referent: '' };

        const processFilter = filters.process || '';
        const subProcessFilter = filters.subProcess || '';
        const referentFilter = (filters.referent || '').trim().toLowerCase();

        let subProcessFilterProcess = '';
        let subProcessFilterValue = '';

        if (subProcessFilter) {
            const [proc, sub] = subProcessFilter.split('::');
            subProcessFilterProcess = proc || '';
            subProcessFilterValue = sub || '';
        }

        const filtered = interviews.filter(interview => {
            if (!interview) {
                return false;
            }

            if (processFilter) {
                const matchesProcess = Array.isArray(interview.scopes)
                    ? interview.scopes.some(scope => scope?.processValue === processFilter)
                    : false;
                if (!matchesProcess) {
                    return false;
                }
            }

            if (subProcessFilterValue) {
                const matchesSub = Array.isArray(interview.scopes)
                    ? interview.scopes.some(scope => scope?.processValue === subProcessFilterProcess && scope?.subProcessValue === subProcessFilterValue)
                    : false;
                if (!matchesSub) {
                    return false;
                }
            }

            if (referentFilter) {
                const hasReferent = Array.isArray(interview.referents)
                    ? interview.referents.some(ref => typeof ref === 'string' && ref.trim().toLowerCase() === referentFilter)
                    : false;
                if (!hasReferent) {
                    return false;
                }
            }

            return true;
        }).sort((a, b) => {
            const dateA = a?.date || '';
            const dateB = b?.date || '';
            if (dateA && dateB && dateA !== dateB) {
                return dateA > dateB ? -1 : 1;
            }
            const updatedA = a?.updatedAt || '';
            const updatedB = b?.updatedAt || '';
            if (updatedA && updatedB && updatedA !== updatedB) {
                return updatedA > updatedB ? -1 : 1;
            }
            return 0;
        });

        if (countElement) {
            const total = filtered.length;
            const label = total <= 1 ? `${total} compte-rendu` : `${total} comptes-rendus`;
            countElement.textContent = label;
        }

        if (!filtered.length) {
            container.innerHTML = '<div class="interview-empty">Aucun compte-rendu ne correspond aux filtres sélectionnés.</div>';
            return;
        }

        const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, match => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[match] || match));

        container.innerHTML = filtered.map(interview => {
            const title = interview.title ? escapeHtml(interview.title) : 'Compte-rendu sans titre';
            const dateLabel = this.formatInterviewDate(interview.date);
            const referentsChips = Array.isArray(interview.referents)
                ? interview.referents.map(ref => `<span class="interview-referent-chip">${escapeHtml(ref)}</span>`).join('')
                : '';
            const notesContent = interview.notes ? interview.notes : '<p class="interview-card-empty-selection">Aucun contenu renseigné.</p>';

            const tags = Array.isArray(interview.scopes)
                ? interview.scopes.map(scope => {
                    const colorClass = this.getProcessColorClass(scope.processValue);
                    const label = scope.subProcessValue
                        ? (scope.subProcessLabel || this.getSubProcessLabel(scope.processValue, scope.subProcessValue) || scope.subProcessValue)
                        : 'Processus complet';
                    return `<span class="interview-tag ${colorClass}">${escapeHtml(label)}</span>`;
                }).join('')
                : '';

            const updatedLabel = this.formatInterviewDateTime(interview.updatedAt || interview.createdAt);
            const idAttribute = JSON.stringify(interview.id);

            return `
                <article class="interview-card">
                    <header class="interview-card-header">
                        <div class="interview-card-title">${title}</div>
                        <div class="interview-card-meta">
                            ${dateLabel ? `<span class="interview-date-badge">${escapeHtml(dateLabel)}</span>` : ''}
                        </div>
                    </header>
                    <div class="interview-card-meta interview-referents">${referentsChips}</div>
                    <div class="interview-card-tags">${tags}</div>
                    <div class="interview-card-notes">${notesContent}</div>
                    <footer class="interview-card-footer">
                        <div class="interview-card-meta">Dernière mise à jour : ${escapeHtml(updatedLabel || 'Date inconnue')}</div>
                        <div class="interview-card-actions">
                            <button class="interview-action-btn edit" onclick="rms.openInterviewModal(${idAttribute})">Modifier</button>
                            <button class="interview-action-btn delete" onclick="rms.deleteInterview(${idAttribute})">Supprimer</button>
                        </div>
                    </footer>
                </article>
            `;
        }).join('');
    }


    // CRUD operations
    addRisk(riskData) {
        const newRisk = {
            id: getNextSequentialId(this.risks),
            ...riskData,
            dateCreation: new Date().toISOString(),
            statut: riskData.statut || 'brouillon'
        };

        const normalizedRisk = this.normalizeRisk(newRisk);

        this.risks.push(normalizedRisk);
        this.addHistoryItem('Création risque', `Nouveau risque: ${normalizedRisk.description}`);
        this.saveData();
        this.init();

        return normalizedRisk;
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
            const probNetInput = document.getElementById('probNet');
            const impactNetInput = document.getElementById('impactNet');
            const mitigationInput = document.getElementById('mitigationEffectiveness');
            const defaultMitigation = typeof DEFAULT_MITIGATION_EFFECTIVENESS === 'string'
                ? DEFAULT_MITIGATION_EFFECTIVENESS
                : 'insuffisant';
            const mitigationLevel = risk.mitigationEffectiveness || defaultMitigation;
            if (mitigationInput) {
                mitigationInput.value = mitigationLevel;
            }
            if (probNetInput && typeof getMitigationColumnFromLevel === 'function') {
                probNetInput.value = getMitigationColumnFromLevel(mitigationLevel);
            } else if (probNetInput) {
                probNetInput.value = risk.probNet || probNetInput.value || 1;
            }
            if (impactNetInput) {
                impactNetInput.value = risk.impactNet || impactNetInput.value || 1;
            }

            if (typeof setAggravatingFactorsSelection === 'function') {
                setAggravatingFactorsSelection(risk.aggravatingFactors || null);
            }

            calculateScore('brut');
            calculateScore('net');
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
