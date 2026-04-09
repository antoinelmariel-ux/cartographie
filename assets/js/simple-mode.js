(function () {
    const STORAGE_KEY = 'rmsSimpleModeData';
    const DEFAULT_DATA = {
        version: '2.1.25',
        scenarios: [],
        selectedId: null,
        updatedAt: null
    };
    const DEFAULT_AGGRAVATING_FACTORS = [
        { id: 'Pays à risque de corruption élevé (CPI < 40)', label: 'Pays à risque de corruption élevé (CPI < 40)' },
        { id: 'Pays à risque de corruption modéré (40 ≤ CPI < 60)', label: 'Pays à risque de corruption modéré (40 ≤ CPI < 60)' },
        { id: 'Intermédiaires difficiles à contrôler', label: 'Intermédiaires difficiles à contrôler' },
        { id: 'Zones géographiques instables', label: 'Zones géographiques instables' },
        { id: 'Secteurs d’activité exposés (BTP, énergie, défense)', label: 'Secteurs d’activité exposés (BTP, énergie, défense)' },
        { id: 'Culture tolérante aux cadeaux', label: 'Culture tolérante aux cadeaux' },
        { id: 'Turn-over élevé', label: 'Turn-over élevé' }
    ];
    const MAX_SCENARIO_LENGTH = 500;
    const EFFECTIVENESS_LEVELS = [
        { value: 0, label: 'Inefficace' },
        { value: 25, label: 'Insuffisant' },
        { value: 50, label: 'Améliorable' },
        { value: 75, label: 'Efficace' }
    ];
    const PROBABILITY_LEGEND = {
        1: {
            title: 'Probabilité 1 – Peu probable',
            details: ['Événement non survenu sur les 5 dernières années.', 'Événement non attendu sur les 5 prochaines années.']
        },
        2: {
            title: 'Probabilité 2 – Possible',
            details: ['Événement déjà observé ponctuellement.', 'Peut survenir dans des circonstances spécifiques.']
        },
        3: {
            title: 'Probabilité 3 – Probable',
            details: ['Événement observé régulièrement.', 'Survenue plausible à moyen terme sans action de maîtrise renforcée.']
        },
        4: {
            title: 'Probabilité 4 – Très probable',
            details: ['Événement fréquent ou attendu.', 'Survenue probable à court terme sans mesures correctives.']
        }
    };
    const IMPACT_LEGEND = {
        1: {
            title: 'Impact 1 – Faible',
            bullets: ['Financier: < 500 K€', 'Juridique/réglementaire: écart mineur', 'Réputationnel: impact local limité', 'Opérationnel: perturbation mineure']
        },
        2: {
            title: 'Impact 2 – Significatif',
            bullets: ['Financier: 500 K€ à 5 M€', 'Juridique/réglementaire: injonction ou sanction modérée', 'Réputationnel: exposition nationale ponctuelle', 'Opérationnel: ralentissement notable']
        },
        3: {
            title: 'Impact 3 – Majeur',
            bullets: ['Financier: 5 M€ à 30 M€', 'Juridique/réglementaire: sanctions importantes', 'Réputationnel: crise médiatique nationale', 'Opérationnel: interruption partielle d’activité']
        },
        4: {
            title: 'Impact 4 – Critique',
            bullets: ['Financier: ≥ 30 M€', 'Juridique/réglementaire: sanctions Groupe / condamnation pénale', 'Réputationnel: crise médiatique internationale', 'Opérationnel: arrêt d’activités']
        }
    };

    const state = {
        data: cloneData(DEFAULT_DATA),
        view: 'scenarios'
    };

    const dom = {};
    const dragState = {
        active: false,
        pointerId: null,
        pendingCell: null
    };

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
        return Math.min(4, Math.max(1, Math.round(num)));
    }

    function normalizeScenarioText(value) {
        return String(value || '').trim().slice(0, MAX_SCENARIO_LENGTH);
    }

    function isValidSimpleScenario(candidate) {
        if (!candidate || typeof candidate !== 'object') return false;
        const text = normalizeScenarioText(candidate.text);
        return Boolean(text);
    }

    function resetSimpleModeData() {
        state.data = cloneData(DEFAULT_DATA);
        localStorage.removeItem(STORAGE_KEY);
    }

    function nearestEffectivenessLevel(value) {
        const numeric = Math.min(100, Math.max(0, Number(value) || 0));
        return EFFECTIVENESS_LEVELS.reduce((closest, level) => (
            Math.abs(level.value - numeric) < Math.abs(closest.value - numeric) ? level : closest
        ), EFFECTIVENESS_LEVELS[0]).value;
    }

    function getAggravatingFactors() {
        const configuredFactors = Array.isArray(window.rms?.config?.aggravatingFactors)
            ? window.rms.config.aggravatingFactors
            : [];
        const factors = [...configuredFactors]
            .map((tier) => {
                if (tier && typeof tier === 'object') {
                    const id = String(tier.value || tier.label || '').trim();
                    const label = String(tier.label || tier.value || '').trim();
                    if (!id || !label) return null;
                    return { id, label };
                }

                const value = String(tier || '').trim();
                if (!value) return null;
                return { id: value, label: value };
            })
            .filter(Boolean);

        const uniqueFactors = Array.from(
            new Map(factors.map((factor) => [factor.id, factor])).values()
        );

        return uniqueFactors.length ? uniqueFactors : DEFAULT_AGGRAVATING_FACTORS;
    }

    function scoreToLevel(score) {
        if (score >= 13) return 4;
        if (score >= 9) return 3;
        if (score >= 5) return 2;
        return 1;
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
            if (!parsed || !Array.isArray(parsed.scenarios)) {
                throw new Error('Structure invalide');
            }

            const normalizedScenarios = parsed.scenarios
                .filter(isValidSimpleScenario)
                .map((s) => ({
                    id: s.id || uid(),
                    text: normalizeScenarioText(s.text),
                    raw: {
                        prob: clampMatrixValue(s.raw?.prob),
                        impact: clampMatrixValue(s.raw?.impact)
                    },
                    aggravatingFactors: normalizeAggravatingFactors(s.aggravatingFactors),
                    effectiveness: nearestEffectivenessLevel(s.effectiveness),
                    comment: s.comment || ''
                }));

            state.data = {
                ...cloneData(DEFAULT_DATA),
                ...parsed,
                version: DEFAULT_DATA.version,
                scenarios: normalizedScenarios
            };

            const hasSelectedScenario = state.data.scenarios.some((s) => s.id === state.data.selectedId);
            if (!hasSelectedScenario) {
                state.data.selectedId = state.data.scenarios[0]?.id || null;
            }
        } catch (err) {
            console.warn('Impossible de charger la version simplifiée', err);
            resetSimpleModeData();
        }
    }

    function getSelectedScenario() {
        return state.data.scenarios.find((s) => s.id === state.data.selectedId) || null;
    }

    function ensureSelectedScenario() {
        if (!state.data.scenarios.length) {
            state.data.selectedId = null;
            return null;
        }

        const hasSelectedScenario = state.data.scenarios.some((scenario) => scenario.id === state.data.selectedId);
        if (!hasSelectedScenario) {
            state.data.selectedId = state.data.scenarios[0].id;
        }

        return state.data.selectedId;
    }

    function selectScenario(id) {
        state.data.selectedId = id;
        render();
        saveLocal();
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
            effectiveness: EFFECTIVENESS_LEVELS[0].value,
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
            text: `${current.text} (copie)`,
            raw: { ...current.raw },
            aggravatingFactors: [...(current.aggravatingFactors || [])]
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

    function normalizeAggravatingFactors(value) {
        if (!Array.isArray(value)) return [];
        const allowed = new Set(getAggravatingFactors().map((factor) => factor.id));
        return [...new Set(value.map((item) => String(item)).filter((id) => allowed.has(id)))];
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
        return EFFECTIVENESS_LEVELS.find((level) => level.value === nearestEffectivenessLevel(value))?.label || 'Inefficace';
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
        for (let impact = 4; impact >= 1; impact -= 1) {
            for (let prob = 1; prob <= 4; prob += 1) {
                const cell = document.createElement('div');
                const score = prob * impact;
                cell.className = `matrix-cell simple-matrix-cell level-${scoreToLevel(score)}`;
                cell.dataset.prob = String(prob);
                cell.dataset.impact = String(impact);
                cell.addEventListener('dragover', (evt) => evt.preventDefault());
                cell.addEventListener('drop', (evt) => {
                    evt.preventDefault();
                    updateCurrentScenario({ raw: { prob, impact } });
                });
                cell.addEventListener('click', () => updateCurrentScenario({ raw: { prob, impact } }));
                dom.matrix.appendChild(cell);
            }
        }
        ensureSimpleMarker();
    }

    function getCellByCoordinates(clientX, clientY) {
        if (!dom.matrix) return null;
        const rect = dom.matrix.getBoundingClientRect();
        if (!rect.width || !rect.height) return null;
        if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return null;
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const prob = Math.min(4, Math.max(1, Math.floor((x / rect.width) * 4) + 1));
        const impact = Math.min(4, Math.max(1, 4 - Math.floor((y / rect.height) * 4)));
        return { prob, impact };
    }

    function findSimpleCell(prob, impact) {
        return dom.matrix?.querySelector(`.simple-matrix-cell[data-prob="${prob}"][data-impact="${impact}"]`) || null;
    }

    function setDragHoverCell(prob, impact) {
        dom.matrix?.querySelectorAll('.simple-matrix-cell.drag-hover').forEach((cell) => cell.classList.remove('drag-hover'));
        if (!prob || !impact) return;
        findSimpleCell(prob, impact)?.classList.add('drag-hover');
    }

    function ensureSimpleMarker() {
        if (!dom.matrixWrapper || dom.marker) return;
        const marker = document.createElement('button');
        marker.type = 'button';
        marker.className = 'simple-cell-marker simple-cell-marker-floating';
        marker.textContent = 'B';
        marker.setAttribute('aria-label', 'Puce de position du risque');
        marker.addEventListener('pointerdown', onMarkerPointerDown);
        dom.matrixWrapper.appendChild(marker);
        dom.marker = marker;
    }

    function placeMarker(prob, impact, animate = true) {
        if (!dom.matrixWrapper || !dom.marker) return;
        const cell = findSimpleCell(prob, impact);
        if (!cell) return;
        const cellRect = cell.getBoundingClientRect();
        const wrapperRect = dom.matrixWrapper.getBoundingClientRect();
        const x = cellRect.left - wrapperRect.left + (cellRect.width / 2);
        const y = cellRect.top - wrapperRect.top + (cellRect.height / 2);
        dom.marker.classList.toggle('no-transition', !animate);
        dom.marker.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px) translate(-50%, -50%)`;
    }

    function onMarkerPointerDown(event) {
        const scenario = getSelectedScenario();
        if (!scenario || !dom.marker) return;
        dragState.active = true;
        dragState.pointerId = event.pointerId;
        dragState.pendingCell = { ...scenario.raw };
        dom.marker.classList.add('is-dragging');
        dom.marker.setPointerCapture(event.pointerId);
        event.preventDefault();
    }

    function onGlobalPointerMove(event) {
        if (!dragState.active || dragState.pointerId !== event.pointerId) return;
        const cell = getCellByCoordinates(event.clientX, event.clientY);
        if (!cell) return;
        dragState.pendingCell = cell;
        placeMarker(cell.prob, cell.impact, false);
        setDragHoverCell(cell.prob, cell.impact);
    }

    function onGlobalPointerUp(event) {
        if (!dragState.active || dragState.pointerId !== event.pointerId) return;
        if (dom.marker?.hasPointerCapture(event.pointerId)) {
            dom.marker.releasePointerCapture(event.pointerId);
        }
        dragState.active = false;
        dragState.pointerId = null;
        dom.marker?.classList.remove('is-dragging');
        const cell = getCellByCoordinates(event.clientX, event.clientY) || dragState.pendingCell;
        setDragHoverCell(null, null);

        if (cell) {
            updateCurrentScenario({ raw: { prob: cell.prob, impact: cell.impact } });
        } else {
            const scenario = getSelectedScenario();
            if (scenario) placeMarker(scenario.raw.prob, scenario.raw.impact);
        }
        dragState.pendingCell = null;
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
        renderAggravatingFactors(scenario);

        if (!scenario) {
            if (dom.marker) dom.marker.classList.add('is-hidden');
            dom.rawLegend.textContent = 'P1 × I1 = 1 (Faible)';
            dom.rawLegendDetail.textContent = 'Chargez des scénarios pour commencer la cotation.';
            renderLegendDescription(1, 1);
            dom.effectiveness.value = 0;
            dom.effectivenessLegend.textContent = '0% - Inefficace';
            dom.comment.value = '';
            return;
        }

        const { prob, impact } = scenario.raw;
        if (dom.marker) dom.marker.classList.remove('is-hidden');
        const score = prob * impact;
        dom.rawLegend.textContent = `P${prob} × I${impact} = ${score} (${scoreLabel(score)})`;
        dom.rawLegendDetail.textContent = `Probabilité: ${prob}/4 • Impact: ${impact}/4`;
        renderLegendDescription(prob, impact);
        dom.matrix.querySelectorAll('.simple-matrix-cell').forEach((cell) => {
            const isActive = Number(cell.dataset.prob) === prob && Number(cell.dataset.impact) === impact;
            cell.classList.toggle('active-cell', isActive);
        });
        placeMarker(prob, impact, !dragState.active);

        const snappedEffectiveness = nearestEffectivenessLevel(scenario.effectiveness);
        if (snappedEffectiveness !== scenario.effectiveness) {
            scenario.effectiveness = snappedEffectiveness;
        }
        dom.effectiveness.value = snappedEffectiveness;
        dom.effectivenessLegend.textContent = `${snappedEffectiveness}% - ${effectivenessLabel(snappedEffectiveness)}`;
        dom.comment.value = scenario.comment;

        const idx = state.data.scenarios.findIndex((s) => s.id === scenario.id);
        dom.prevBtn.disabled = idx <= 0;
        dom.nextBtn.disabled = idx >= state.data.scenarios.length - 1;
    }

    function renderAggravatingFactors(scenario) {
        if (!dom.aggravatingFactorsList) return;
        dom.aggravatingFactorsList.innerHTML = '';
        const selectedFactors = new Set(scenario?.aggravatingFactors || []);

        getAggravatingFactors().forEach((factor) => {
            const label = document.createElement('label');
            label.className = 'simple-aggravating-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = factor.id;
            checkbox.checked = selectedFactors.has(factor.id);
            checkbox.disabled = !scenario;
            checkbox.addEventListener('change', () => {
                if (!scenario) return;
                const factorSet = new Set(scenario.aggravatingFactors || []);
                if (checkbox.checked) {
                    factorSet.add(factor.id);
                } else {
                    factorSet.delete(factor.id);
                }
                updateCurrentScenario({ aggravatingFactors: [...factorSet] });
            });

            const text = document.createElement('span');
            text.textContent = factor.label;

            label.appendChild(checkbox);
            label.appendChild(text);
            dom.aggravatingFactorsList.appendChild(label);
        });
    }

    function renderLegendDescription(probability, impact) {
        const probabilityLegend = PROBABILITY_LEGEND[probability] || PROBABILITY_LEGEND[1];
        const impactLegend = IMPACT_LEGEND[impact] || IMPACT_LEGEND[1];

        if (dom.legendProbabilityTitle) dom.legendProbabilityTitle.textContent = probabilityLegend.title;
        if (dom.legendProbabilityDetail1) dom.legendProbabilityDetail1.textContent = probabilityLegend.details[0];
        if (dom.legendProbabilityDetail2) dom.legendProbabilityDetail2.textContent = probabilityLegend.details[1];
        if (dom.legendImpactTitle) dom.legendImpactTitle.textContent = impactLegend.title;

        if (dom.legendImpactBullets) {
            dom.legendImpactBullets.innerHTML = '';
            impactLegend.bullets.forEach((item) => {
                const li = document.createElement('li');
                li.textContent = item;
                dom.legendImpactBullets.appendChild(li);
            });
        }
    }

    function syncSimpleMatrixSquare() {
        if (!dom.matrixWrapper) return;
        const width = dom.matrixWrapper.getBoundingClientRect().width;
        if (!Number.isFinite(width) || width <= 0) return;
        dom.matrixWrapper.style.height = `${Math.round(width)}px`;
    }

    function setView(viewName) {
        state.view = viewName;
        document.querySelectorAll('.simple-subtab').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.simpleView === viewName);
        });
        dom.scenariosPanel.classList.toggle('active', viewName === 'scenarios');
        dom.assessmentPanel.classList.toggle('active', viewName === 'assessment');

        if (viewName === 'assessment') {
            requestAnimationFrame(() => {
                syncSimpleMatrixSquare();
                renderAssessment();
            });
        }
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

    function csvEscape(value) {
        const stringValue = String(value ?? '');
        const escaped = stringValue.replace(/"/g, '""');
        if (/[";\n]/.test(escaped)) {
            return `"${escaped}"`;
        }
        return escaped;
    }

    function exportCsvData() {
        const header = [
            'Risque',
            'Probabilité',
            'Impact',
            'Facteurs aggravants',
            'Efficacité des mesures',
            'Commentaire'
        ];
        const factorsLabelById = new Map(getAggravatingFactors().map((factor) => [factor.id, factor.label]));
        const rows = state.data.scenarios.map((scenario) => {
            const risk = scenario.text || '';
            const probability = clampMatrixValue(scenario.raw?.prob);
            const impact = clampMatrixValue(scenario.raw?.impact);
            const aggravatingFactors = (scenario.aggravatingFactors || [])
                .map((id) => factorsLabelById.get(id) || id)
                .join(' | ');
            const effectiveness = `${nearestEffectivenessLevel(scenario.effectiveness)}% - ${effectivenessLabel(scenario.effectiveness)}`;
            const comment = scenario.comment || '';

            return [risk, probability, impact, aggravatingFactors, effectiveness, comment];
        });

        const csvContent = [header, ...rows]
            .map((row) => row.map(csvEscape).join(';'))
            .join('\n');

        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cartographie-simplifiee-risques-${new Date().toISOString().slice(0, 10)}.csv`;
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
                    text: normalizeScenarioText(s.text),
                    raw: {
                        prob: clampMatrixValue(s.raw?.prob),
                        impact: clampMatrixValue(s.raw?.impact)
                    },
                    aggravatingFactors: normalizeAggravatingFactors(s.aggravatingFactors),
                    effectiveness: nearestEffectivenessLevel(s.effectiveness),
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
            const value = nearestEffectivenessLevel(evt.target.value);
            evt.target.value = value;
            updateCurrentScenario({ effectiveness: value });
        });

        dom.comment.addEventListener('input', (evt) => {
            updateCurrentScenario({ comment: evt.target.value });
        });

        dom.exportBtn.addEventListener('click', exportData);
        dom.exportCsvBtn.addEventListener('click', exportCsvData);
        dom.importBtn.addEventListener('click', () => dom.importFile.click());
        dom.importFile.addEventListener('change', (evt) => {
            importDataFromFile(evt.target.files[0]);
            evt.target.value = '';
        });

        window.addEventListener('resize', () => {
            syncSimpleMatrixSquare();
            renderAssessment();
        });
        window.addEventListener('pointermove', onGlobalPointerMove);
        window.addEventListener('pointerup', onGlobalPointerUp);
        window.addEventListener('pointercancel', onGlobalPointerUp);

        document.addEventListener('rms:tab-changed', (event) => {
            if (event?.detail?.tabName !== 'simple') return;
            requestAnimationFrame(() => {
                syncSimpleMatrixSquare();
                renderAssessment();
            });
        });
    }

    function render() {
        ensureSelectedScenario();
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
        dom.matrixWrapper = document.querySelector('.simple-edit-matrix');
        dom.rawLegend = document.getElementById('simpleRawLegend');
        dom.rawLegendDetail = document.getElementById('simpleRawLegendDetail');
        dom.legendProbabilityTitle = document.getElementById('simpleLegendProbabilityTitle');
        dom.legendProbabilityDetail1 = document.getElementById('simpleLegendProbabilityDetail1');
        dom.legendProbabilityDetail2 = document.getElementById('simpleLegendProbabilityDetail2');
        dom.legendImpactTitle = document.getElementById('simpleLegendImpactTitle');
        dom.legendImpactBullets = document.getElementById('simpleLegendImpactBullets');
        dom.aggravatingFactorsList = document.getElementById('simpleAggravatingFactors');
        dom.effectiveness = document.getElementById('simpleEffectiveness');
        dom.effectiveness.min = String(EFFECTIVENESS_LEVELS[0].value);
        dom.effectiveness.max = String(EFFECTIVENESS_LEVELS[EFFECTIVENESS_LEVELS.length - 1].value);
        dom.effectiveness.step = '1';
        dom.effectivenessLegend = document.getElementById('simpleEffectivenessLegend');
        dom.comment = document.getElementById('simpleComment');
        dom.prevBtn = document.getElementById('simplePrevBtn');
        dom.nextBtn = document.getElementById('simpleNextBtn');
        dom.exportBtn = document.getElementById('simpleExportBtn');
        dom.exportCsvBtn = document.getElementById('simpleExportCsvBtn');
        dom.importBtn = document.getElementById('simpleImportBtn');
        dom.importFile = document.getElementById('simpleImportFile');

        if (!dom.scenariosInput || !dom.matrix) {
            return;
        }

        loadLocal();
        ensureSelectedScenario();

        renderMatrix();
        syncSimpleMatrixSquare();
        bindEvents();
        setView('scenarios');
        render();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
