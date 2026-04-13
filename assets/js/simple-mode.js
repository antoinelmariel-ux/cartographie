(function () {
    const STORAGE_KEY = 'rmsSimpleModeData';
    const DEFAULT_DATA = {
        version: '2.1.37',
        scenarios: [],
        selectedId: null,
        updatedAt: null,
        language: 'fr'
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
        { value: 0, labels: { fr: 'Inefficace', en: 'Ineffective' } },
        { value: 25, labels: { fr: 'Insuffisant', en: 'Insufficient' } },
        { value: 50, labels: { fr: 'Améliorable', en: 'Room for improvement' } },
        { value: 75, labels: { fr: 'Efficace', en: 'Effective' } }
    ];
    const PROBABILITY_LEGEND_BY_LANGUAGE = {
        fr: {
            1: {
                title: 'Probabilité 1 – Peu probable',
                details: ['Événement non survenu sur les 5 dernières années.', 'Événement non attendu sur les 5 prochaines années.']
            },
            2: {
                title: 'Probabilité 2 – Moyennement probable',
                details: ['Événement survenu 1 fois au cours des 5 dernières années.', 'Événement pouvant survenir 1 fois au cours des 5 prochaines années.']
            },
            3: {
                title: 'Probabilité 3 – Probable',
                details: ['Événement survenu 1 fois au cours de l’année passée.', 'Événement pouvant survenir 1 fois au cours de l’année à venir.']
            },
            4: {
                title: 'Probabilité 4 – Très probable',
                details: ['Événement survenu plusieurs fois au cours de l’année passée.', 'Événement attendu 1 ou plusieurs fois au cours de l’année à venir.']
            }
        },
        en: {
            1: {
                title: 'Probability 1 – Unlikely',
                details: ['Event has not occurred in the past 5 years.', 'Event not expected to occur in the next 5 years.']
            },
            2: {
                title: 'Probability 2 – Moderately likely',
                details: ['Event that has occurred once in the past 5 years.', 'Event that may occur once in the next 5 years.']
            },
            3: {
                title: 'Probability 3 – Likely',
                details: ['Event that has occurred once in the past year.', 'Event that may occur once in the coming year.']
            },
            4: {
                title: 'Probability 4 – Very likely',
                details: ['Event that occurred several times in the past year.', 'Event expected to occur once or more times in the coming year.']
            }
        }
    };
    const IMPACT_LEGEND_BY_LANGUAGE = {
        fr: {
            1: {
                title: 'Impact 1 – Faible',
                bullets: ['Financier (assiette): < 300 K€', 'Juridique: sanction interne disciplinaire envers un collaborateur', 'Réputationnel: impact nul, interne ou externe local ; atteinte limitée à quelques jours', 'Opérationnel: peu ou pas de perturbations ; ralentissement des activités']
            },
            2: {
                title: 'Impact 2 – Modéré',
                bullets: ['Financier (assiette): [300K€ ; 3 M€[', 'Juridique: procédure judiciaire ou administrative à l’échelle d’un collaborateur', 'Réputationnel: impact externe régional (ex. : ARS) ; atteinte limitée à quelques semaines', 'Opérationnel: perturbations légères ; perte temporaire d’activités ou de marchés']
            },
            3: {
                title: 'Impact 3 – Fort',
                bullets: ['Financier (assiette): [3M€ ; 30 M€[', 'Juridique: sanctions à l’échelle d’une filiale ; convention judiciaire d’intérêt public (CJIP)', 'Réputationnel: impact externe national (ex. : ministère de la Santé) ; crise médiatique nationale ; atteinte prolongée sur plusieurs mois', 'Opérationnel: perturbations importantes ; perte définitive d’activités ou de marchés']
            },
            4: {
                title: 'Impact 4 – Critique',
                bullets: ['Financier (assiette): ≥ 30 M€', 'Juridique: sanctions à l’échelle du Groupe ; condamnation pénale', 'Réputationnel: impact externe international (ex. : EMA, FDA, etc.) ; crise médiatique internationale ; atteinte durable sur plusieurs années', 'Opérationnel: arrêt des activités']
            }
        },
        en: {
            1: {
                title: 'Impact 1 – Low',
                bullets: ['Financial (base): < €300,000', 'Legal: Internal disciplinary action against an employee', 'Reputational: No impact, internal or local external (e.g., partners); disruption limited to a few days', 'Operational: Little or no disruption; slowdown in operations']
            },
            2: {
                title: 'Impact 2 – Moderate',
                bullets: ['Financial (base): [300K€ ; 3 M€[', 'Legal: Legal or administrative proceedings involving an individual employee', 'Reputational: Regional external impact (e.g., ARS); disruption limited to a few weeks', 'Operational: Minor disruptions; temporary loss of business or contracts']
            },
            3: {
                title: 'Impact 3 – High',
                bullets: ['Financial (base): [3M€ ; 30 M€[', 'Legal: Sanctions at the subsidiary level; Public Interest Legal Agreement (PILA)', 'Reputational: National external impact (e.g., Department of Health); national media crisis; impact lasting several months', 'Operational: Significant disruptions; permanent loss of business or contracts']
            },
            4: {
                title: 'Impact 4 – Critical',
                bullets: ['Financial (base): ≥ €30 million', 'Legal: Group-wide sanctions; criminal conviction', 'Reputational: International external impact (e.g., EMA, FDA, etc.); international media crisis; long-term damage lasting several years', 'Operational: Cessation of operations']
            }
        }
    };
    const AGGRAVATING_FACTORS_EN = {
        'Pays à risque de corruption élevé (CPI < 40)': 'Countries with a high risk of corruption (CPI < 40)',
        'Pays à risque de corruption modéré (40 ≤ CPI < 60)': 'Countries with moderate corruption risk (40 ≤ CPI < 60)',
        'Intermédiaires difficiles à contrôler': 'Intermediaries difficult to control',
        'Zones géographiques instables': 'Geographically unstable areas',
        'Secteurs d’activité exposés (BTP, énergie, défense)': 'Exposed sectors (construction, energy, defense)',
        'Culture tolérante aux cadeaux': 'Culture of gift-giving',
        'Turn-over élevé': 'High turnover'
    };

    const state = {
        data: cloneData(DEFAULT_DATA),
        view: 'scenarios',
        highlightedScenarioId: null,
        showProbabilityLegendDetails: false
    };

    const UI_TRANSLATIONS = {
        fr: {
            legendToggleTitle: 'Afficher/masquer le détail de probabilité',
            noScenarioSelected: 'Aucun scénario sélectionné',
            toolbarTitle: 'Version simplifiée - Cotation des risques bruts',
            subtabScenarios: '1. Chargement des scénarios',
            subtabAssessment: '2. Cotation',
            subtabOverview: '3. Vue consolidée',
            scenariosLabel: 'Collez vos scénarios (1 ligne = 1 scénario, max. 500 caractères)',
            scenariosPlaceholder: `Exemple :
Paiement indu via intermédiaire
Conflit d'intérêt dans la sélection fournisseur
Cadeau inapproprié à un agent public`,
            loadScenarios: 'Charger les scénarios',
            scenariosHelper: 'Les scénarios remplacent la liste actuelle.',
            selectedScenarioCaption: 'Scénario sélectionné',
            entitiesLabel: 'Applicable à :',
            duplicateScenario: 'Dupliquer ce scénario',
            deleteScenarioLabel: 'Supprimer ce scénario',
            rawRiskTitle: 'Risque brut',
            aggravatingTitle: 'Facteurs aggravants',
            effectivenessLabel: 'Efficacité des mesures de maîtrise',
            commentsLabel: 'Commentaires',
            commentsPlaceholder: 'Ajoutez vos observations...',
            prevScenario: '← Scénario précédent',
            nextScenario: 'Scénario suivant →',
            weak: 'Faible',
            moderate: 'Modéré',
            high: 'Élevé',
            critical: 'Critique',
            matrixProbabilityAxis: 'Probabilité →',
            matrixImpactAxis: 'Impact',
            overviewSortedTitle: 'Risques bruts triés (P × I décroissant)',
            overviewMatrixTitle: 'Matrice des risques bruts'
        },
        en: {
            legendToggleTitle: 'Show/hide probability details',
            noScenarioSelected: 'No scenario selected',
            toolbarTitle: 'Simplified version - Raw risk scoring',
            subtabScenarios: '1. Scenario loading',
            subtabAssessment: '2. Scoring',
            subtabOverview: '3. Consolidated view',
            scenariosLabel: 'Paste your scenarios (1 line = 1 scenario, max 500 characters)',
            scenariosPlaceholder: `Example:
Undue payment through intermediary
Conflict of interest in supplier selection
Inappropriate gift to a public official`,
            loadScenarios: 'Load scenarios',
            scenariosHelper: 'Loading replaces the current list.',
            selectedScenarioCaption: 'Selected scenario',
            entitiesLabel: 'Applies to:',
            duplicateScenario: 'Duplicate this scenario',
            deleteScenarioLabel: 'Delete this scenario',
            rawRiskTitle: 'Raw risk',
            aggravatingTitle: 'Aggravating factors',
            effectivenessLabel: 'Control effectiveness',
            commentsLabel: 'Comments',
            commentsPlaceholder: 'Add your observations...',
            prevScenario: '← Previous scenario',
            nextScenario: 'Next scenario →',
            weak: 'Low',
            moderate: 'Medium',
            high: 'High',
            critical: 'Critical',
            matrixProbabilityAxis: 'Probability →',
            matrixImpactAxis: 'Impact',
            overviewSortedTitle: 'Raw risks sorted (P × I descending)',
            overviewMatrixTitle: 'Raw risk matrix'
        }
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
                    comment: s.comment || '',
                    appliesTo: normalizeAppliesTo(s.appliesTo)
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
            state.highlightedScenarioId = null;
            return null;
        }

        const hasSelectedScenario = state.data.scenarios.some((scenario) => scenario.id === state.data.selectedId);
        if (!hasSelectedScenario) {
            state.data.selectedId = state.data.scenarios[0].id;
        }
        if (!state.data.scenarios.some((scenario) => scenario.id === state.highlightedScenarioId)) {
            state.highlightedScenarioId = state.data.selectedId;
        }

        return state.data.selectedId;
    }

    function selectScenario(id) {
        state.data.selectedId = id;
        state.highlightedScenarioId = id;
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
            comment: '',
            appliesTo: { lfbUsa: false, europlasma: false }
        }));
        state.data.selectedId = state.data.scenarios[0]?.id || null;
        state.highlightedScenarioId = state.data.selectedId;
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
            aggravatingFactors: [...(current.aggravatingFactors || [])],
            appliesTo: normalizeAppliesTo(current.appliesTo)
        };
        const index = state.data.scenarios.findIndex((s) => s.id === current.id);
        state.data.scenarios.splice(index + 1, 0, cloned);
        state.data.selectedId = cloned.id;
        state.highlightedScenarioId = cloned.id;
        render();
        saveLocal();
    }

    function deleteCurrentScenario() {
        const current = getSelectedScenario();
        if (!current) return;
        deleteScenario(current.id);
    }

    function deleteScenario(id) {
        const index = state.data.scenarios.findIndex((scenario) => scenario.id === id);
        if (index === -1) return;

        const wasSelected = state.data.selectedId === id;
        state.data.scenarios.splice(index, 1);

        if (wasSelected) {
            const fallback = state.data.scenarios[index] || state.data.scenarios[index - 1] || null;
            state.data.selectedId = fallback?.id || null;
            state.highlightedScenarioId = state.data.selectedId;
        } else {
            ensureSelectedScenario();
        }

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

    function normalizeAppliesTo(value) {
        return {
            lfbUsa: Boolean(value?.lfbUsa),
            europlasma: Boolean(value?.europlasma)
        };
    }

    function goToScenario(step) {
        const scenarios = state.data.scenarios;
        if (!scenarios.length) return;
        const index = scenarios.findIndex((s) => s.id === state.data.selectedId);
        const nextIndex = Math.min(scenarios.length - 1, Math.max(0, index + step));
        state.data.selectedId = scenarios[nextIndex].id;
        state.highlightedScenarioId = state.data.selectedId;
        render();
        saveLocal();
    }

    function getSortedScenariosByRawRisk() {
        return [...state.data.scenarios].sort((left, right) => {
            const leftProb = clampMatrixValue(left.raw?.prob);
            const leftImpact = clampMatrixValue(left.raw?.impact);
            const rightProb = clampMatrixValue(right.raw?.prob);
            const rightImpact = clampMatrixValue(right.raw?.impact);
            const leftScore = leftProb * leftImpact;
            const rightScore = rightProb * rightImpact;
            if (rightScore !== leftScore) return rightScore - leftScore;
            if (rightImpact !== leftImpact) return rightImpact - leftImpact;
            if (rightProb !== leftProb) return rightProb - leftProb;
            return left.text.localeCompare(right.text, 'fr');
        });
    }

    function scoreLabel(score) {
        const locale = UI_TRANSLATIONS[state.data.language] || UI_TRANSLATIONS.fr;
        if (score >= 20) return locale.critical;
        if (score >= 12) return locale.high;
        if (score >= 6) return locale.moderate;
        return locale.weak;
    }

    function effectivenessLabel(value) {
        const language = state.data.language === 'en' ? 'en' : 'fr';
        return EFFECTIVENESS_LEVELS.find((level) => level.value === nearestEffectivenessLevel(value))?.labels?.[language] || 'Inefficace';
    }

    function renderScenarioList() {
        dom.scenarioList.innerHTML = '';

        if (!state.data.scenarios.length) {
            dom.scenarioList.innerHTML = '<div class="simple-empty">Aucun scénario chargé pour le moment.</div>';
            return;
        }

        state.data.scenarios.forEach((scenario, index) => {
            const row = document.createElement('div');
            row.className = `simple-scenario-row ${scenario.id === state.data.selectedId ? 'active' : ''}`;

            const button = document.createElement('button');
            button.type = 'button';
            button.className = `simple-scenario-item ${scenario.id === state.data.selectedId ? 'active' : ''}`;
            button.innerHTML = `<span>${index + 1}. ${scenario.text}</span>`;
            button.addEventListener('click', () => selectScenario(scenario.id));

            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'simple-scenario-delete';
            deleteButton.setAttribute('aria-label', `Supprimer le scénario ${index + 1}`);
            deleteButton.title = 'Supprimer ce scénario';
            deleteButton.textContent = '🗑️';
            deleteButton.addEventListener('click', () => deleteScenario(scenario.id));

            row.appendChild(button);
            row.appendChild(deleteButton);
            dom.scenarioList.appendChild(row);
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
        const locale = UI_TRANSLATIONS[state.data.language] || UI_TRANSLATIONS.fr;

        dom.currentScenario.textContent = scenario ? scenario.text : locale.noScenarioSelected;
        dom.duplicateBtn.disabled = disabled;
        dom.deleteBtn.disabled = disabled;
        dom.prevBtn.disabled = disabled;
        dom.nextBtn.disabled = disabled;
        dom.effectiveness.disabled = disabled;
        dom.comment.disabled = disabled;
        dom.entityLfbUsa.disabled = disabled;
        dom.entityEuroplasma.disabled = disabled;
        renderAggravatingFactors(scenario);

        if (!scenario) {
            if (dom.marker) dom.marker.classList.add('is-hidden');
            dom.rawLegend.textContent = `P1 × I1 = 1 (${locale.weak})`;
            renderLegendDescription(1, 1);
            dom.effectiveness.value = 0;
            dom.effectivenessLegend.textContent = '0% - Inefficace';
            dom.comment.value = '';
            dom.entityLfbUsa.checked = false;
            dom.entityEuroplasma.checked = false;
            renderAssessmentProgress();
            return;
        }

        const { prob, impact } = scenario.raw;
        if (dom.marker) dom.marker.classList.remove('is-hidden');
        const score = prob * impact;
        dom.rawLegend.textContent = `P${prob} × I${impact} = ${score} (${scoreLabel(score)})`;
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
        const appliesTo = normalizeAppliesTo(scenario.appliesTo);
        dom.entityLfbUsa.checked = appliesTo.lfbUsa;
        dom.entityEuroplasma.checked = appliesTo.europlasma;

        const idx = state.data.scenarios.findIndex((s) => s.id === scenario.id);
        dom.prevBtn.disabled = idx <= 0;
        dom.nextBtn.disabled = idx >= state.data.scenarios.length - 1;
        renderAssessmentProgress();
    }

    function renderAssessmentProgress() {
        if (!dom.assessmentProgressFill) return;
        const total = state.data.scenarios.length;
        if (!total || !state.data.selectedId) {
            dom.assessmentProgressFill.style.width = '0%';
            return;
        }
        const index = state.data.scenarios.findIndex((scenario) => scenario.id === state.data.selectedId);
        const ratio = index < 0 ? 0 : ((index + 1) / total) * 100;
        dom.assessmentProgressFill.style.width = `${Math.max(0, Math.min(100, ratio)).toFixed(2)}%`;
    }

    function setHighlightedScenario(id, options = {}) {
        const { syncSelection = true, persist = false } = options;
        if (!id || !state.data.scenarios.some((scenario) => scenario.id === id)) return;
        state.highlightedScenarioId = id;
        if (syncSelection) {
            state.data.selectedId = id;
        }
        renderOverview();
        if (syncSelection) {
            renderScenarioList();
            if (state.view === 'assessment') {
                renderAssessment();
            }
        }
        if (persist) {
            saveLocal();
        }
    }

    function renderOverview() {
        if (!dom.overviewRiskList || !dom.overviewMatrix) return;
        const scenarios = getSortedScenariosByRawRisk();
        const impactLevels = [4, 3, 2, 1];
        const probabilityLevels = [1, 2, 3, 4];

        dom.overviewRiskList.innerHTML = '';
        dom.overviewMatrix.innerHTML = '';
        if (dom.overviewImpactLabels) dom.overviewImpactLabels.innerHTML = '';
        if (dom.overviewProbabilityLabels) dom.overviewProbabilityLabels.innerHTML = '';

        if (dom.overviewImpactLabels) {
            impactLevels.forEach((impact) => {
                const label = document.createElement('div');
                label.className = 'simple-overview-axis-level y-level';
                label.textContent = state.data.language === 'en'
                    ? (['Critical impact', 'High impact', 'Moderate impact', 'Low impact'][4 - impact] || `Impact ${impact}`)
                    : (['Impact critique', 'Impact fort', 'Impact modéré', 'Impact faible'][4 - impact] || `Impact ${impact}`);
                dom.overviewImpactLabels.appendChild(label);
            });
        }

        if (dom.overviewProbabilityLabels) {
            probabilityLevels.forEach((probability) => {
                const label = document.createElement('div');
                label.className = 'simple-overview-axis-level x-level';
                label.textContent = state.data.language === 'en'
                    ? (['Unlikely', 'Moderately\nlikely', 'Likely', 'Very\nlikely'][probability - 1] || `Probability ${probability}`)
                    : (['Peu probable', 'Moyennement\nprobable', 'Probable', 'Très\nprobable'][probability - 1] || `Probabilité ${probability}`);
                dom.overviewProbabilityLabels.appendChild(label);
            });
        }

        if (!scenarios.length) {
            dom.overviewRiskList.innerHTML = '<div class="simple-overview-empty">Aucun risque coté pour le moment.</div>';
            dom.overviewMatrix.innerHTML = '<div class="simple-overview-empty">Chargez des scénarios pour afficher la matrice consolidée.</div>';
            return;
        }

        const indexByScenarioId = new Map(scenarios.map((scenario, index) => [scenario.id, index + 1]));
        const highlightedId = state.highlightedScenarioId || state.data.selectedId || scenarios[0].id;

        scenarios.forEach((scenario, index) => {
            const score = scenario.raw.prob * scenario.raw.impact;
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `simple-overview-item ${scenario.id === highlightedId ? 'active' : ''}`;
            button.innerHTML = `
                <span class="simple-overview-item-title">${index + 1}. ${scenario.text}</span>
                <span class="simple-overview-item-meta">Score ${score} • P${scenario.raw.prob} × I${scenario.raw.impact}</span>
            `;
            button.addEventListener('click', () => setHighlightedScenario(scenario.id, { syncSelection: true, persist: true }));
            dom.overviewRiskList.appendChild(button);
        });

        for (let impact = 4; impact >= 1; impact -= 1) {
            for (let prob = 1; prob <= 4; prob += 1) {
                const cell = document.createElement('div');
                const score = prob * impact;
                cell.className = `matrix-cell simple-overview-cell level-${scoreToLevel(score)}`;
                const risksInCell = scenarios.filter((scenario) => scenario.raw.prob === prob && scenario.raw.impact === impact);

                const spacing = 23;
                const perRow = 4;
                risksInCell.forEach((scenario, riskIndex) => {
                    const bullet = document.createElement('button');
                    bullet.type = 'button';
                    bullet.className = `simple-overview-bullet ${scenario.id === highlightedId ? 'active' : ''}`;
                    bullet.title = scenario.text;
                    bullet.setAttribute('aria-label', `Risque ${indexByScenarioId.get(scenario.id)}: ${scenario.text}`);
                    bullet.textContent = String(indexByScenarioId.get(scenario.id));
                    const row = Math.floor(riskIndex / perRow);
                    const col = riskIndex % perRow;
                    bullet.style.top = `${8 + (row * spacing)}px`;
                    bullet.style.left = `${8 + (col * spacing)}px`;
                    bullet.addEventListener('click', (event) => {
                        event.stopPropagation();
                        setHighlightedScenario(scenario.id, { syncSelection: true, persist: true });
                    });
                    cell.appendChild(bullet);
                });

                cell.addEventListener('click', () => {
                    const firstRisk = risksInCell[0];
                    if (firstRisk) {
                        setHighlightedScenario(firstRisk.id, { syncSelection: true, persist: true });
                    }
                });
                dom.overviewMatrix.appendChild(cell);
            }
        }
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
            text.textContent = state.data.language === 'en'
                ? (AGGRAVATING_FACTORS_EN[factor.label] || factor.label)
                : factor.label;

            label.appendChild(checkbox);
            label.appendChild(text);
            dom.aggravatingFactorsList.appendChild(label);
        });
    }

    function renderLegendDescription(probability, impact) {
        const language = state.data.language === 'en' ? 'en' : 'fr';
        const probabilityLegendSet = PROBABILITY_LEGEND_BY_LANGUAGE[language] || PROBABILITY_LEGEND_BY_LANGUAGE.fr;
        const impactLegendSet = IMPACT_LEGEND_BY_LANGUAGE[language] || IMPACT_LEGEND_BY_LANGUAGE.fr;
        const probabilityLegend = probabilityLegendSet[probability] || probabilityLegendSet[1];
        const impactLegend = impactLegendSet[impact] || impactLegendSet[1];

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

    function applyLanguage(language) {
        const nextLanguage = language === 'en' ? 'en' : 'fr';
        const locale = UI_TRANSLATIONS[nextLanguage] || UI_TRANSLATIONS.fr;
        state.data.language = nextLanguage;
        if (!dom.languageToggleBtn) return;
        dom.languageToggleBtn.textContent = nextLanguage === 'fr' ? 'EN' : 'FR';
        dom.languageToggleBtn.title = nextLanguage === 'fr' ? 'Switch simplified mode to English' : 'Passer la version simplifiée en français';
        dom.legendToggleBtn.title = locale.legendToggleTitle;
        if (dom.toolbarTitle) dom.toolbarTitle.textContent = locale.toolbarTitle;
        if (dom.subtabScenarios) dom.subtabScenarios.textContent = locale.subtabScenarios;
        if (dom.subtabAssessment) dom.subtabAssessment.textContent = locale.subtabAssessment;
        if (dom.subtabOverview) dom.subtabOverview.textContent = locale.subtabOverview;
        if (dom.scenariosLabel) dom.scenariosLabel.textContent = locale.scenariosLabel;
        if (dom.scenariosInput) dom.scenariosInput.placeholder = locale.scenariosPlaceholder;
        if (dom.loadScenariosBtn) dom.loadScenariosBtn.textContent = locale.loadScenarios;
        if (dom.scenariosHelper) dom.scenariosHelper.textContent = locale.scenariosHelper;
        if (dom.selectedCaption) dom.selectedCaption.textContent = locale.selectedScenarioCaption;
        if (dom.entitiesLabel) dom.entitiesLabel.textContent = locale.entitiesLabel;
        if (dom.duplicateBtn) dom.duplicateBtn.textContent = locale.duplicateScenario;
        if (dom.deleteBtn) {
            dom.deleteBtn.textContent = `🗑️ ${locale.deleteScenarioLabel}`;
            dom.deleteBtn.title = locale.deleteScenarioLabel;
            dom.deleteBtn.setAttribute('aria-label', locale.deleteScenarioLabel);
        }
        if (dom.rawRiskTitle) dom.rawRiskTitle.textContent = locale.rawRiskTitle;
        if (dom.aggravatingTitle) dom.aggravatingTitle.textContent = locale.aggravatingTitle;
        if (dom.effectivenessLabel) dom.effectivenessLabel.textContent = locale.effectivenessLabel;
        if (dom.commentLabel) dom.commentLabel.textContent = locale.commentsLabel;
        if (dom.comment) dom.comment.placeholder = locale.commentsPlaceholder;
        if (dom.prevBtn) dom.prevBtn.textContent = locale.prevScenario;
        if (dom.nextBtn) dom.nextBtn.textContent = locale.nextScenario;
        if (dom.matrixProbabilityAxis) dom.matrixProbabilityAxis.textContent = locale.matrixProbabilityAxis;
        if (dom.matrixImpactAxis) dom.matrixImpactAxis.textContent = locale.matrixImpactAxis;
        if (dom.overviewSortedTitle) dom.overviewSortedTitle.textContent = locale.overviewSortedTitle;
        if (dom.overviewMatrixTitle) dom.overviewMatrixTitle.textContent = locale.overviewMatrixTitle;
    }

    function toggleLanguage() {
        applyLanguage(state.data.language === 'fr' ? 'en' : 'fr');
        render();
        saveLocal();
    }

    function setProbabilityLegendDetailsVisible(visible) {
        state.showProbabilityLegendDetails = Boolean(visible);
        if (!dom.legendProbabilityDetails || !dom.legendToggleBtn) return;
        dom.legendProbabilityDetails.classList.toggle('visible', state.showProbabilityLegendDetails);
        dom.legendToggleBtn.setAttribute('aria-expanded', String(state.showProbabilityLegendDetails));
    }

    function toggleProbabilityLegendDetails() {
        setProbabilityLegendDetailsVisible(!state.showProbabilityLegendDetails);
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
        dom.overviewPanel.classList.toggle('active', viewName === 'overview');

        if (viewName === 'assessment') {
            requestAnimationFrame(() => {
                syncSimpleMatrixSquare();
                renderAssessment();
            });
            return;
        }
        if (viewName === 'overview') {
            requestAnimationFrame(() => {
                renderOverview();
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
            'LFB USA',
            'EuroPlasma',
            'Facteurs aggravants',
            'Efficacité des mesures',
            'Commentaire'
        ];
        const factorsLabelById = new Map(getAggravatingFactors().map((factor) => [factor.id, factor.label]));
        const rows = state.data.scenarios.map((scenario) => {
            const risk = scenario.text || '';
            const probability = clampMatrixValue(scenario.raw?.prob);
            const impact = clampMatrixValue(scenario.raw?.impact);
            const appliesTo = normalizeAppliesTo(scenario.appliesTo);
            const aggravatingFactors = (scenario.aggravatingFactors || [])
                .map((id) => factorsLabelById.get(id) || id)
                .join(' | ');
            const effectiveness = `${nearestEffectivenessLevel(scenario.effectiveness)}% - ${effectivenessLabel(scenario.effectiveness)}`;
            const comment = scenario.comment || '';

            return [risk, probability, impact, appliesTo.lfbUsa ? 'Oui' : 'Non', appliesTo.europlasma ? 'Oui' : 'Non', aggravatingFactors, effectiveness, comment];
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
                state.data.language = parsed.language === 'en' ? 'en' : 'fr';
                state.data.scenarios = parsed.scenarios.map((s) => ({
                    id: s.id || uid(),
                    text: normalizeScenarioText(s.text),
                    raw: {
                        prob: clampMatrixValue(s.raw?.prob),
                        impact: clampMatrixValue(s.raw?.impact)
                    },
                    aggravatingFactors: normalizeAggravatingFactors(s.aggravatingFactors),
                    effectiveness: nearestEffectivenessLevel(s.effectiveness),
                    comment: s.comment || '',
                    appliesTo: normalizeAppliesTo(s.appliesTo)
                })).filter((s) => s.text);
                state.data.selectedId = parsed.selectedId && state.data.scenarios.some((s) => s.id === parsed.selectedId)
                    ? parsed.selectedId
                    : state.data.scenarios[0]?.id || null;
                state.highlightedScenarioId = state.data.selectedId;
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
        dom.deleteBtn.addEventListener('click', deleteCurrentScenario);
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
        dom.entityLfbUsa.addEventListener('change', () => {
            const current = getSelectedScenario();
            if (!current) return;
            const appliesTo = normalizeAppliesTo(current.appliesTo);
            updateCurrentScenario({ appliesTo: { ...appliesTo, lfbUsa: dom.entityLfbUsa.checked } });
        });
        dom.entityEuroplasma.addEventListener('change', () => {
            const current = getSelectedScenario();
            if (!current) return;
            const appliesTo = normalizeAppliesTo(current.appliesTo);
            updateCurrentScenario({ appliesTo: { ...appliesTo, europlasma: dom.entityEuroplasma.checked } });
        });

        dom.exportBtn.addEventListener('click', exportData);
        dom.exportCsvBtn.addEventListener('click', exportCsvData);
        dom.importBtn.addEventListener('click', () => dom.importFile.click());
        dom.languageToggleBtn.addEventListener('click', toggleLanguage);
        dom.legendToggleBtn.addEventListener('click', toggleProbabilityLegendDetails);
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
        renderOverview();
    }

    function init() {
        dom.scenariosInput = document.getElementById('simpleScenariosInput');
        dom.loadScenariosBtn = document.getElementById('simpleLoadScenariosBtn');
        dom.toolbarTitle = document.getElementById('simpleToolbarTitle');
        dom.subtabScenarios = document.getElementById('simpleSubtabScenarios');
        dom.subtabAssessment = document.getElementById('simpleSubtabAssessment');
        dom.subtabOverview = document.getElementById('simpleSubtabOverview');
        dom.scenariosLabel = document.getElementById('simpleScenariosLabel');
        dom.scenariosHelper = document.getElementById('simpleScenariosHelper');
        dom.scenarioList = document.getElementById('simpleScenarioList');
        dom.scenariosPanel = document.getElementById('simple-scenarios-panel');
        dom.assessmentPanel = document.getElementById('simple-assessment-panel');
        dom.overviewPanel = document.getElementById('simple-overview-panel');
        dom.currentScenario = document.getElementById('simpleCurrentScenario');
        dom.selectedCaption = document.getElementById('simpleSelectedCaption');
        dom.duplicateBtn = document.getElementById('simpleDuplicateBtn');
        dom.deleteBtn = document.getElementById('simpleDeleteBtn');
        dom.matrix = document.getElementById('simpleMatrix');
        dom.matrixProbabilityAxis = document.getElementById('simpleMatrixProbabilityAxis');
        dom.matrixImpactAxis = document.getElementById('simpleMatrixImpactAxis');
        dom.matrixWrapper = document.querySelector('.simple-edit-matrix');
        dom.rawLegend = document.getElementById('simpleRawLegend');
        dom.rawRiskTitle = document.getElementById('simpleRawRiskTitle');
        dom.legendProbabilityTitle = document.getElementById('simpleLegendProbabilityTitle');
        dom.legendProbabilityDetail1 = document.getElementById('simpleLegendProbabilityDetail1');
        dom.legendProbabilityDetail2 = document.getElementById('simpleLegendProbabilityDetail2');
        dom.legendImpactTitle = document.getElementById('simpleLegendImpactTitle');
        dom.legendImpactBullets = document.getElementById('simpleLegendImpactBullets');
        dom.aggravatingFactorsList = document.getElementById('simpleAggravatingFactors');
        dom.aggravatingTitle = document.getElementById('simpleAggravatingTitle');
        dom.effectiveness = document.getElementById('simpleEffectiveness');
        dom.effectivenessLabel = document.getElementById('simpleEffectivenessLabel');
        dom.effectiveness.min = String(EFFECTIVENESS_LEVELS[0].value);
        dom.effectiveness.max = String(EFFECTIVENESS_LEVELS[EFFECTIVENESS_LEVELS.length - 1].value);
        dom.effectiveness.step = '1';
        dom.effectivenessLegend = document.getElementById('simpleEffectivenessLegend');
        dom.comment = document.getElementById('simpleComment');
        dom.commentLabel = document.getElementById('simpleCommentLabel');
        dom.entitiesLabel = document.getElementById('simpleEntitiesLabel');
        dom.entityLfbUsa = document.getElementById('simpleEntityLfbUsa');
        dom.entityEuroplasma = document.getElementById('simpleEntityEuroplasma');
        dom.prevBtn = document.getElementById('simplePrevBtn');
        dom.nextBtn = document.getElementById('simpleNextBtn');
        dom.exportBtn = document.getElementById('simpleExportBtn');
        dom.exportCsvBtn = document.getElementById('simpleExportCsvBtn');
        dom.importBtn = document.getElementById('simpleImportBtn');
        dom.importFile = document.getElementById('simpleImportFile');
        dom.languageToggleBtn = document.getElementById('simpleLanguageToggleBtn');
        dom.legendToggleBtn = document.getElementById('simpleLegendToggleBtn');
        dom.legendProbabilityDetails = document.getElementById('simpleLegendProbabilityDetails');
        dom.assessmentProgressFill = document.getElementById('simpleAssessmentProgressFill');
        dom.overviewRiskList = document.getElementById('simpleOverviewRiskList');
        dom.overviewSortedTitle = document.getElementById('simpleOverviewSortedTitle');
        dom.overviewMatrixTitle = document.getElementById('simpleOverviewMatrixTitle');
        dom.overviewMatrix = document.getElementById('simpleOverviewMatrix');
        dom.overviewImpactLabels = document.getElementById('simpleOverviewImpactLabels');
        dom.overviewProbabilityLabels = document.getElementById('simpleOverviewProbabilityLabels');

        if (!dom.scenariosInput || !dom.matrix) {
            return;
        }

        loadLocal();
        ensureSelectedScenario();
        state.highlightedScenarioId = state.data.selectedId;
        applyLanguage(state.data.language);
        setProbabilityLegendDetailsVisible(false);

        renderMatrix();
        syncSimpleMatrixSquare();
        bindEvents();
        setView('scenarios');
        render();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
