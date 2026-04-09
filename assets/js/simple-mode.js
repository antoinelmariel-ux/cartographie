(function () {
    const STORAGE_KEY = 'rmsSimpleModeData';
    const DEFAULT_DATA = {
        version: '2.1.5',
        scenarios: [],
        selectedId: null,
        updatedAt: null
    };

    const state = {
        data: cloneData(DEFAULT_DATA),
        view: 'scenarios'
    };

    const dom = {};

    function cloneData(data) {
        if (typeof structuredClone === 'function') {
            return structuredClone(data);
        }
        return JSON.parse(JSON.stringify(data));
    }

    function uid() {
        return `sc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    function clampMatrixValue(value) {
        const num = Number(value);
        if (!Number.isFinite(num)) return 1;
        return Math.min(5, Math.max(1, Math.round(num)));
    }

    function saveLocal() {
        state.data.updatedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
        const lastSave = document.getElementById('lastSaveTime');
        if (lastSave) {
            lastSave.textContent = new Date(state.data.updatedAt).toLocaleString('fr-FR');
        }
    }

    function loadLocal() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        try {
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.scenarios)) {
                state.data = {
                    ...cloneData(DEFAULT_DATA),
                    ...parsed,
                    scenarios: parsed.scenarios.map((s) => ({
                        id: s.id || uid(),
                        text: (s.text || '').trim(),
                        raw: {
                            prob: clampMatrixValue(s.raw?.prob),
                            impact: clampMatrixValue(s.raw?.impact)
                        },
                        effectiveness: Math.min(100, Math.max(0, Number(s.effectiveness) || 0)),
                        comment: s.comment || ''
                    }))
                };
            }
        } catch (err) {
            console.warn('Impossible de charger la version simplifiée', err);
        }
    }

    function getSelectedScenario() {
        return state.data.scenarios.find((s) => s.id === state.data.selectedId) || null;
    }

    function selectScenario(id) {
        state.data.selectedId = id;
        render();
        saveLocal();
    }

    function replaceScenariosFromText(inputText) {
        const lines = String(inputText || '')
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);

        state.data.scenarios = lines.map((text) => ({
            id: uid(),
            text,
            raw: { prob: 1, impact: 1 },
            effectiveness: 0,
            comment: ''
        }));
        state.data.selectedId = state.data.scenarios[0]?.id || null;
        render();
        saveLocal();
    }

    function duplicateScenario() {
        const current = getSelectedScenario();
        if (!current) return;
        const cloned = {
            ...current,
            id: uid(),
            text: `${current.text} (copie)`
        };
        const index = state.data.scenarios.findIndex((s) => s.id === current.id);
        state.data.scenarios.splice(index + 1, 0, cloned);
        state.data.selectedId = cloned.id;
        render();
        saveLocal();
    }

    function updateCurrentScenario(patch) {
        const current = getSelectedScenario();
        if (!current) return;
        Object.assign(current, patch);
        saveLocal();
        renderAssessment();
    }

    function goToScenario(step) {
        const scenarios = state.data.scenarios;
        if (!scenarios.length) return;
        const index = scenarios.findIndex((s) => s.id === state.data.selectedId);
        const nextIndex = Math.min(scenarios.length - 1, Math.max(0, index + step));
        state.data.selectedId = scenarios[nextIndex].id;
        render();
        saveLocal();
    }

    function scoreLabel(score) {
        if (score >= 20) return 'Critique';
        if (score >= 12) return 'Élevé';
        if (score >= 6) return 'Modéré';
        return 'Faible';
    }

    function effectivenessLabel(value) {
        if (value >= 80) return 'Très efficace';
        if (value >= 60) return 'Efficace';
        if (value >= 40) return 'Partielle';
        if (value > 0) return 'Faible';
        return 'Non évaluée';
    }

    function renderScenarioList() {
        dom.scenarioList.innerHTML = '';

        if (!state.data.scenarios.length) {
            dom.scenarioList.innerHTML = '<div class="simple-empty">Aucun scénario chargé pour le moment.</div>';
            return;
        }

        state.data.scenarios.forEach((scenario, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `simple-scenario-item ${scenario.id === state.data.selectedId ? 'active' : ''}`;
            button.innerHTML = `<span>${index + 1}. ${scenario.text}</span>`;
            button.addEventListener('click', () => selectScenario(scenario.id));
            dom.scenarioList.appendChild(button);
        });
    }

    function renderMatrix() {
        dom.matrix.innerHTML = '';
        for (let impact = 5; impact >= 1; impact -= 1) {
            for (let prob = 1; prob <= 5; prob += 1) {
                const cell = document.createElement('div');
                cell.className = 'simple-matrix-cell';
                cell.dataset.prob = String(prob);
                cell.dataset.impact = String(impact);
                cell.innerHTML = `<span>P${prob}×I${impact}</span>`;
                cell.addEventListener('dragover', (evt) => evt.preventDefault());
                cell.addEventListener('drop', (evt) => {
                    evt.preventDefault();
                    updateCurrentScenario({ raw: { prob, impact } });
                });
                cell.addEventListener('click', () => updateCurrentScenario({ raw: { prob, impact } }));
                dom.matrix.appendChild(cell);
            }
        }

        const marker = document.createElement('div');
        marker.id = 'simpleMatrixMarker';
        marker.className = 'simple-marker';
        marker.draggable = true;
        marker.title = 'Glissez-déposez ce marqueur dans une autre case';
        marker.textContent = '⬤';
        marker.addEventListener('dragstart', (evt) => {
            evt.dataTransfer.setData('text/plain', 'marker');
        });

        dom.matrix.appendChild(marker);
    }

    function renderAssessment() {
        const scenario = getSelectedScenario();
        const disabled = !scenario;

        dom.currentScenario.textContent = scenario ? scenario.text : 'Aucun scénario sélectionné';
        dom.duplicateBtn.disabled = disabled;
        dom.prevBtn.disabled = disabled;
        dom.nextBtn.disabled = disabled;
        dom.effectiveness.disabled = disabled;
        dom.comment.disabled = disabled;

        if (!scenario) {
            dom.rawLegend.textContent = 'P1 × I1 = 1 (Faible)';
            dom.rawLegendDetail.textContent = 'Chargez des scénarios pour commencer la cotation.';
            dom.effectiveness.value = 0;
            dom.effectivenessLegend.textContent = '0% - Non évaluée';
            dom.comment.value = '';
            return;
        }

        const { prob, impact } = scenario.raw;
        const score = prob * impact;
        dom.rawLegend.textContent = `P${prob} × I${impact} = ${score} (${scoreLabel(score)})`;
        dom.rawLegendDetail.textContent = `Probabilité: ${prob}/5 • Impact: ${impact}/5`;

        const marker = document.getElementById('simpleMatrixMarker');
        const cellIndex = (5 - impact) * 5 + (prob - 1);
        const targetCell = dom.matrix.children[cellIndex];
        if (marker && targetCell) {
            targetCell.appendChild(marker);
        }

        dom.effectiveness.value = scenario.effectiveness;
        dom.effectivenessLegend.textContent = `${scenario.effectiveness}% - ${effectivenessLabel(scenario.effectiveness)}`;
        dom.comment.value = scenario.comment;

        const idx = state.data.scenarios.findIndex((s) => s.id === scenario.id);
        dom.prevBtn.disabled = idx <= 0;
        dom.nextBtn.disabled = idx >= state.data.scenarios.length - 1;
    }

    function setView(viewName) {
        state.view = viewName;
        document.querySelectorAll('.simple-subtab').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.simpleView === viewName);
        });
        dom.scenariosPanel.classList.toggle('active', viewName === 'scenarios');
        dom.assessmentPanel.classList.toggle('active', viewName === 'assessment');
    }

    function exportData() {
        const payload = JSON.stringify(state.data, null, 2);
        const blob = new Blob([payload], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cartographie-simplifiee-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function importDataFromFile(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = JSON.parse(String(reader.result || '{}'));
                if (!parsed || !Array.isArray(parsed.scenarios)) {
                    throw new Error('Format JSON invalide');
                }
                state.data = cloneData(DEFAULT_DATA);
                state.data.version = parsed.version || DEFAULT_DATA.version;
                state.data.scenarios = parsed.scenarios.map((s) => ({
                    id: s.id || uid(),
                    text: (s.text || '').trim(),
                    raw: {
                        prob: clampMatrixValue(s.raw?.prob),
                        impact: clampMatrixValue(s.raw?.impact)
                    },
                    effectiveness: Math.min(100, Math.max(0, Number(s.effectiveness) || 0)),
                    comment: s.comment || ''
                })).filter((s) => s.text);
                state.data.selectedId = parsed.selectedId && state.data.scenarios.some((s) => s.id === parsed.selectedId)
                    ? parsed.selectedId
                    : state.data.scenarios[0]?.id || null;
                render();
                saveLocal();
            } catch (error) {
                alert(`Import impossible: ${error.message}`);
            }
        };
        reader.readAsText(file);
    }

    function bindEvents() {
        document.querySelectorAll('.simple-subtab').forEach((btn) => {
            btn.addEventListener('click', () => setView(btn.dataset.simpleView));
        });

        dom.loadScenariosBtn.addEventListener('click', () => replaceScenariosFromText(dom.scenariosInput.value));
        dom.duplicateBtn.addEventListener('click', duplicateScenario);
        dom.prevBtn.addEventListener('click', () => goToScenario(-1));
        dom.nextBtn.addEventListener('click', () => goToScenario(1));

        dom.effectiveness.addEventListener('input', (evt) => {
            const value = Number(evt.target.value) || 0;
            updateCurrentScenario({ effectiveness: value });
        });

        dom.comment.addEventListener('input', (evt) => {
            updateCurrentScenario({ comment: evt.target.value });
        });

        dom.exportBtn.addEventListener('click', exportData);
        dom.importBtn.addEventListener('click', () => dom.importFile.click());
        dom.importFile.addEventListener('change', (evt) => {
            importDataFromFile(evt.target.files[0]);
            evt.target.value = '';
        });
    }

    function render() {
        renderScenarioList();
        renderAssessment();
    }

    function init() {
        dom.scenariosInput = document.getElementById('simpleScenariosInput');
        dom.loadScenariosBtn = document.getElementById('simpleLoadScenariosBtn');
        dom.scenarioList = document.getElementById('simpleScenarioList');
        dom.scenariosPanel = document.getElementById('simple-scenarios-panel');
        dom.assessmentPanel = document.getElementById('simple-assessment-panel');
        dom.currentScenario = document.getElementById('simpleCurrentScenario');
        dom.duplicateBtn = document.getElementById('simpleDuplicateBtn');
        dom.matrix = document.getElementById('simpleMatrix');
        dom.rawLegend = document.getElementById('simpleRawLegend');
        dom.rawLegendDetail = document.getElementById('simpleRawLegendDetail');
        dom.effectiveness = document.getElementById('simpleEffectiveness');
        dom.effectivenessLegend = document.getElementById('simpleEffectivenessLegend');
        dom.comment = document.getElementById('simpleComment');
        dom.prevBtn = document.getElementById('simplePrevBtn');
        dom.nextBtn = document.getElementById('simpleNextBtn');
        dom.exportBtn = document.getElementById('simpleExportBtn');
        dom.importBtn = document.getElementById('simpleImportBtn');
        dom.importFile = document.getElementById('simpleImportFile');

        if (!dom.scenariosInput || !dom.matrix) {
            return;
        }

        loadLocal();

        if (!state.data.selectedId && state.data.scenarios.length) {
            state.data.selectedId = state.data.scenarios[0].id;
        }

        renderMatrix();
        bindEvents();
        setView('scenarios');
        render();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
