(function () {
    const STORAGE_KEY = 'rmsQuickAssessmentData';
    const MAX_SCENARIO_LENGTH = 500;
    const DEFAULT_AGGRAVATING_FACTORS = [
        'High corruption-risk countries (CPI < 40)',
        'Moderate corruption-risk countries (40 ≤ CPI < 60)',
        'Intermediaries difficult to control',
        'Unstable geographic areas',
        'Exposed sectors (construction, energy, defense)',
        'Gift-tolerant culture',
        'High turnover'
    ];
    const EFFECTIVENESS_LEVELS = [
        { value: 0, label: 'Ineffective' },
        { value: 25, label: 'Insufficient' },
        { value: 50, label: 'Needs improvement' },
        { value: 75, label: 'Effective' }
    ];

    const state = {
        view: 'scenarios',
        data: {
            version: '2.14.52',
            scenarios: [],
            selectedId: null
        }
    };

    const dom = {};

    function uid() {
        return `qa_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    function clampMatrixValue(value) {
        const num = Number(value);
        if (!Number.isFinite(num)) return 1;
        return Math.min(4, Math.max(1, Math.round(num)));
    }

    function normalizeScenarioText(value) {
        return String(value || '').trim().slice(0, MAX_SCENARIO_LENGTH);
    }

    function nearestEffectivenessLevel(value) {
        const numeric = Math.min(75, Math.max(0, Number(value) || 0));
        return EFFECTIVENESS_LEVELS.reduce((closest, level) => (
            Math.abs(level.value - numeric) < Math.abs(closest.value - numeric) ? level : closest
        ), EFFECTIVENESS_LEVELS[0]).value;
    }

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
    }

    function load() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        try {
            const parsed = JSON.parse(raw);
            if (!parsed || !Array.isArray(parsed.scenarios)) return;
            state.data = {
                ...state.data,
                ...parsed,
                scenarios: parsed.scenarios
                    .map((s) => ({
                        id: s.id || uid(),
                        text: normalizeScenarioText(s.text),
                        raw: {
                            prob: clampMatrixValue(s.raw?.prob),
                            impact: clampMatrixValue(s.raw?.impact)
                        },
                        aggravatingFactors: Array.isArray(s.aggravatingFactors) ? s.aggravatingFactors : [],
                        effectiveness: nearestEffectivenessLevel(s.effectiveness),
                        comment: String(s.comment || '')
                    }))
                    .filter((s) => s.text)
            };
            ensureSelection();
        } catch (_error) {
            localStorage.removeItem(STORAGE_KEY);
        }
    }

    function ensureSelection() {
        if (!state.data.scenarios.length) {
            state.data.selectedId = null;
            return;
        }
        if (!state.data.scenarios.some((scenario) => scenario.id === state.data.selectedId)) {
            state.data.selectedId = state.data.scenarios[0].id;
        }
    }

    function getCurrentScenario() {
        return state.data.scenarios.find((scenario) => scenario.id === state.data.selectedId) || null;
    }

    function scoreToLevel(score) {
        if (score >= 13) return 4;
        if (score >= 9) return 3;
        if (score >= 5) return 2;
        return 1;
    }

    function scoreLabel(score) {
        if (score >= 12) return 'High';
        if (score >= 6) return 'Moderate';
        return 'Low';
    }

    function replaceScenariosFromText(inputText) {
        const lines = String(inputText || '')
            .split(/\r?\n/)
            .map((line) => normalizeScenarioText(line))
            .filter(Boolean);

        state.data.scenarios = lines.map((text) => ({
            id: uid(),
            text,
            raw: { prob: 1, impact: 1 },
            aggravatingFactors: [],
            effectiveness: 0,
            comment: ''
        }));
        state.data.selectedId = state.data.scenarios[0]?.id || null;
        render();
        save();
    }

    function updateCurrentScenario(patch) {
        const scenario = getCurrentScenario();
        if (!scenario) return;
        Object.assign(scenario, patch);
        save();
        renderAssessment();
        renderOverview();
        renderScenarioList();
    }

    function deleteScenario(id) {
        const index = state.data.scenarios.findIndex((scenario) => scenario.id === id);
        if (index < 0) return;
        state.data.scenarios.splice(index, 1);
        const fallback = state.data.scenarios[index] || state.data.scenarios[index - 1] || null;
        state.data.selectedId = fallback?.id || null;
        render();
        save();
    }

    function renderScenarioList() {
        dom.scenarioList.innerHTML = '';
        if (!state.data.scenarios.length) {
            dom.scenarioList.innerHTML = '<div class="interview-empty">No scenario loaded yet.</div>';
            return;
        }

        state.data.scenarios.forEach((scenario, index) => {
            const row = document.createElement('div');
            row.className = 'qa-scenario-row';

            const button = document.createElement('button');
            button.type = 'button';
            button.className = `qa-scenario-item ${scenario.id === state.data.selectedId ? 'active' : ''}`;
            button.textContent = `${index + 1}. ${scenario.text}`;
            button.addEventListener('click', () => {
                state.data.selectedId = scenario.id;
                render();
                save();
            });

            const del = document.createElement('button');
            del.type = 'button';
            del.className = 'qa-scenario-delete';
            del.textContent = '🗑️';
            del.addEventListener('click', () => deleteScenario(scenario.id));

            row.appendChild(button);
            row.appendChild(del);
            dom.scenarioList.appendChild(row);
        });
    }

    function renderMatrix() {
        dom.matrix.innerHTML = '';
        for (let impact = 4; impact >= 1; impact -= 1) {
            for (let prob = 1; prob <= 4; prob += 1) {
                const score = prob * impact;
                const cell = document.createElement('button');
                cell.type = 'button';
                cell.className = `matrix-cell qa-cell level-${scoreToLevel(score)}`;
                cell.dataset.prob = String(prob);
                cell.dataset.impact = String(impact);
                cell.addEventListener('click', () => updateCurrentScenario({ raw: { prob, impact } }));
                dom.matrix.appendChild(cell);
            }
        }
    }

    function renderAggravatingFactors(scenario) {
        dom.aggravatingFactors.innerHTML = '';
        DEFAULT_AGGRAVATING_FACTORS.forEach((factor) => {
            const label = document.createElement('label');
            label.className = 'qa-aggravating-item';
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = Boolean(scenario?.aggravatingFactors?.includes(factor));
            input.disabled = !scenario;
            input.addEventListener('change', () => {
                if (!scenario) return;
                const factorSet = new Set(scenario.aggravatingFactors || []);
                if (input.checked) factorSet.add(factor);
                else factorSet.delete(factor);
                updateCurrentScenario({ aggravatingFactors: [...factorSet] });
            });
            const text = document.createElement('span');
            text.textContent = factor;
            label.append(input, text);
            dom.aggravatingFactors.appendChild(label);
        });
    }

    function renderAssessment() {
        const scenario = getCurrentScenario();
        const disabled = !scenario;
        dom.currentScenario.textContent = scenario?.text || 'No scenario selected';
        dom.duplicateBtn.disabled = disabled;
        dom.deleteBtn.disabled = disabled;
        dom.prevBtn.disabled = disabled;
        dom.nextBtn.disabled = disabled;
        dom.effectiveness.disabled = disabled;
        dom.comment.disabled = disabled;

        renderAggravatingFactors(scenario);

        if (!scenario) {
            dom.rawLegend.textContent = 'P1 × I1 = 1 (Low)';
            dom.effectiveness.value = 0;
            dom.effectivenessLegend.textContent = '0% - Ineffective';
            dom.comment.value = '';
            dom.matrix.querySelectorAll('.qa-cell').forEach((cell) => cell.classList.remove('active-cell'));
            return;
        }

        const prob = clampMatrixValue(scenario.raw?.prob);
        const impact = clampMatrixValue(scenario.raw?.impact);
        const score = prob * impact;
        dom.rawLegend.textContent = `P${prob} × I${impact} = ${score} (${scoreLabel(score)})`;

        dom.matrix.querySelectorAll('.qa-cell').forEach((cell) => {
            const active = Number(cell.dataset.prob) === prob && Number(cell.dataset.impact) === impact;
            cell.classList.toggle('active-cell', active);
        });

        const snapped = nearestEffectivenessLevel(scenario.effectiveness);
        dom.effectiveness.value = snapped;
        dom.effectivenessLegend.textContent = `${snapped}% - ${EFFECTIVENESS_LEVELS.find((l) => l.value === snapped)?.label || 'Ineffective'}`;
        dom.comment.value = scenario.comment || '';

        const idx = state.data.scenarios.findIndex((s) => s.id === scenario.id);
        dom.prevBtn.disabled = idx <= 0;
        dom.nextBtn.disabled = idx >= state.data.scenarios.length - 1;
        dom.assessmentProgressFill.style.width = `${((idx + 1) / state.data.scenarios.length) * 100}%`;
    }

    function getSortedScenarios() {
        return [...state.data.scenarios].sort((a, b) => (b.raw.prob * b.raw.impact) - (a.raw.prob * a.raw.impact));
    }

    function renderOverview() {
        dom.overviewList.innerHTML = '';
        dom.overviewMatrix.innerHTML = '';
        const sorted = getSortedScenarios();

        if (!sorted.length) {
            dom.overviewList.innerHTML = '<div class="interview-empty">No assessed risk yet.</div>';
            dom.overviewMatrix.innerHTML = '<div class="interview-empty">Load scenarios to display the consolidated matrix.</div>';
            return;
        }

        sorted.forEach((scenario, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `qa-overview-item ${scenario.id === state.data.selectedId ? 'active' : ''}`;
            btn.innerHTML = `<strong>${index + 1}. ${scenario.text}</strong><span>Score ${scenario.raw.prob * scenario.raw.impact} • P${scenario.raw.prob} × I${scenario.raw.impact}</span>`;
            btn.addEventListener('click', () => {
                state.data.selectedId = scenario.id;
                save();
                render();
            });
            dom.overviewList.appendChild(btn);
        });

        for (let impact = 4; impact >= 1; impact -= 1) {
            for (let prob = 1; prob <= 4; prob += 1) {
                const cell = document.createElement('div');
                cell.className = `matrix-cell qa-cell qa-overview-cell level-${scoreToLevel(prob * impact)}`;
                const risks = sorted.filter((s) => s.raw.prob === prob && s.raw.impact === impact);
                risks.slice(0, 9).forEach((scenario, idx) => {
                    const bullet = document.createElement('button');
                    bullet.type = 'button';
                    bullet.className = `qa-overview-bullet ${scenario.id === state.data.selectedId ? 'active' : ''}`;
                    bullet.textContent = String(idx + 1);
                    bullet.title = scenario.text;
                    bullet.addEventListener('click', (event) => {
                        event.stopPropagation();
                        state.data.selectedId = scenario.id;
                        save();
                        render();
                    });
                    cell.appendChild(bullet);
                });
                dom.overviewMatrix.appendChild(cell);
            }
        }
    }

    function setView(view) {
        state.view = view;
        document.querySelectorAll('.qa-subtab').forEach((btn) => btn.classList.toggle('active', btn.dataset.qaView === view));
        dom.scenariosPanel.classList.toggle('active', view === 'scenarios');
        dom.assessmentPanel.classList.toggle('active', view === 'assessment');
        dom.overviewPanel.classList.toggle('active', view === 'overview');
    }

    function exportJson() {
        const payload = JSON.stringify(state.data, null, 2);
        const blob = new Blob([payload], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quick-assessment-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function csvEscape(value) {
        const v = String(value ?? '');
        const e = v.replace(/"/g, '""');
        return /[";\n]/.test(e) ? `"${e}"` : e;
    }

    function exportCsv() {
        const rows = [
            ['Scenario', 'Probability', 'Impact', 'Score', 'Aggravating factors', 'Effectiveness', 'Comment'],
            ...state.data.scenarios.map((scenario) => [
                scenario.text,
                scenario.raw.prob,
                scenario.raw.impact,
                scenario.raw.prob * scenario.raw.impact,
                (scenario.aggravatingFactors || []).join(' | '),
                `${nearestEffectivenessLevel(scenario.effectiveness)}%`,
                scenario.comment || ''
            ])
        ];
        const csv = rows.map((row) => row.map(csvEscape).join(';')).join('\n');
        const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quick-assessment-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function importJson(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = JSON.parse(String(reader.result || '{}'));
                if (!parsed || !Array.isArray(parsed.scenarios)) throw new Error('Invalid format');
                state.data.scenarios = parsed.scenarios
                    .map((s) => ({
                        id: s.id || uid(),
                        text: normalizeScenarioText(s.text),
                        raw: { prob: clampMatrixValue(s.raw?.prob), impact: clampMatrixValue(s.raw?.impact) },
                        aggravatingFactors: Array.isArray(s.aggravatingFactors) ? s.aggravatingFactors : [],
                        effectiveness: nearestEffectivenessLevel(s.effectiveness),
                        comment: String(s.comment || '')
                    }))
                    .filter((s) => s.text);
                state.data.selectedId = state.data.scenarios[0]?.id || null;
                save();
                render();
            } catch (error) {
                alert(`Import impossible : ${error.message}`);
            }
        };
        reader.readAsText(file);
    }

    function bindEvents() {
        document.querySelectorAll('.qa-subtab').forEach((btn) => {
            btn.addEventListener('click', () => setView(btn.dataset.qaView));
        });

        dom.loadScenariosBtn.addEventListener('click', () => replaceScenariosFromText(dom.scenariosInput.value));

        dom.duplicateBtn.addEventListener('click', () => {
            const current = getCurrentScenario();
            if (!current) return;
            const copy = { ...current, id: uid(), text: `${current.text} (copie)`, raw: { ...current.raw }, aggravatingFactors: [...(current.aggravatingFactors || [])] };
            const index = state.data.scenarios.findIndex((s) => s.id === current.id);
            state.data.scenarios.splice(index + 1, 0, copy);
            state.data.selectedId = copy.id;
            save();
            render();
        });

        dom.deleteBtn.addEventListener('click', () => deleteScenario(state.data.selectedId));
        dom.prevBtn.addEventListener('click', () => {
            const idx = state.data.scenarios.findIndex((s) => s.id === state.data.selectedId);
            if (idx > 0) state.data.selectedId = state.data.scenarios[idx - 1].id;
            save();
            render();
        });
        dom.nextBtn.addEventListener('click', () => {
            const idx = state.data.scenarios.findIndex((s) => s.id === state.data.selectedId);
            if (idx < state.data.scenarios.length - 1) state.data.selectedId = state.data.scenarios[idx + 1].id;
            save();
            render();
        });

        dom.effectiveness.addEventListener('input', (evt) => {
            const value = nearestEffectivenessLevel(evt.target.value);
            evt.target.value = value;
            updateCurrentScenario({ effectiveness: value });
        });

        dom.comment.addEventListener('input', (evt) => updateCurrentScenario({ comment: evt.target.value }));

        dom.exportJsonBtn.addEventListener('click', exportJson);
        dom.exportCsvBtn.addEventListener('click', exportCsv);
        dom.importBtn.addEventListener('click', () => dom.importFile.click());
        dom.importFile.addEventListener('change', (evt) => {
            importJson(evt.target.files[0]);
            evt.target.value = '';
        });
    }

    function render() {
        ensureSelection();
        renderScenarioList();
        renderAssessment();
        renderOverview();
    }

    function init() {
        dom.scenariosInput = document.getElementById('qaScenariosInput');
        if (!dom.scenariosInput) return;
        dom.loadScenariosBtn = document.getElementById('qaLoadScenariosBtn');
        dom.scenarioList = document.getElementById('qaScenarioList');
        dom.scenariosPanel = document.getElementById('qa-scenarios-panel');
        dom.assessmentPanel = document.getElementById('qa-assessment-panel');
        dom.overviewPanel = document.getElementById('qa-overview-panel');
        dom.matrix = document.getElementById('qaMatrix');
        dom.currentScenario = document.getElementById('qaCurrentScenario');
        dom.duplicateBtn = document.getElementById('qaDuplicateBtn');
        dom.deleteBtn = document.getElementById('qaDeleteBtn');
        dom.rawLegend = document.getElementById('qaRawLegend');
        dom.aggravatingFactors = document.getElementById('qaAggravatingFactors');
        dom.effectiveness = document.getElementById('qaEffectiveness');
        dom.effectivenessLegend = document.getElementById('qaEffectivenessLegend');
        dom.comment = document.getElementById('qaComment');
        dom.prevBtn = document.getElementById('qaPrevBtn');
        dom.nextBtn = document.getElementById('qaNextBtn');
        dom.assessmentProgressFill = document.getElementById('qaAssessmentProgressFill');
        dom.overviewList = document.getElementById('qaOverviewRiskList');
        dom.overviewMatrix = document.getElementById('qaOverviewMatrix');
        dom.exportJsonBtn = document.getElementById('qaExportJsonBtn');
        dom.exportCsvBtn = document.getElementById('qaExportCsvBtn');
        dom.importBtn = document.getElementById('qaImportBtn');
        dom.importFile = document.getElementById('qaImportFile');

        load();
        renderMatrix();
        bindEvents();
        setView('scenarios');
        render();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
