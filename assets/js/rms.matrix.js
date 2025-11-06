// Enhanced Risk Management System - Matrix Interactions

var activeRiskEditState = 'brut';
var editMatrixPoints = {};
var highlightedEditCells = {};
var currentDragState = null;
var currentPointerId = null;
var lastDragCell = null;
var netMitigationOptions = [];

function updateNetSeverityBadge(impactValue) {
    const badge = document.getElementById('netSeverityLabel');
    if (!badge) return;

    const numericImpact = parseInt(impactValue, 10) || 1;
    const severity = typeof getSeverityFromNetImpactValue === 'function'
        ? getSeverityFromNetImpactValue(numericImpact)
        : (numericImpact >= 4 ? 'critique' : numericImpact === 3 ? 'fort' : numericImpact === 2 ? 'modere' : 'faible');

    const severityLabels = {
        critique: 'Critique',
        fort: 'Fort',
        modere: 'Modéré',
        faible: 'Faible'
    };

    badge.textContent = `Risque net ${severityLabels[severity] || ''}`;
    if (severity) {
        badge.dataset.severity = severity;
    } else {
        badge.removeAttribute('data-severity');
    }
}

function ensureNetMitigationOptions() {
    if (netMitigationOptions.length) {
        return netMitigationOptions;
    }

    netMitigationOptions = typeof getMitigationEffectivenessOptions === 'function'
        ? getMitigationEffectivenessOptions()
        : [
            { value: 'inefficace', label: 'Inefficace', coefficient: 0 },
            { value: 'insuffisant', label: 'Insuffisant', coefficient: 0.25 },
            { value: 'ameliorable', label: 'Améliorable', coefficient: 0.5 },
            { value: 'efficace', label: 'Efficace', coefficient: 0.75 }
        ];

    return netMitigationOptions;
}

function updateNetSliderUI(probValue) {
    const slider = document.getElementById('netMitigationSlider');
    if (!slider) return;

    const options = ensureNetMitigationOptions();
    const numericValue = Math.min(
        Math.max(parseInt(probValue, 10) || 1, 1),
        options.length || 1
    );
    const option = options[numericValue - 1] || options[0];

    const marksContainer = document.getElementById('netMitigationMarks');
    if (marksContainer) {
        const marks = marksContainer.querySelectorAll('.net-slider-mark');
        marks.forEach((mark, index) => {
            const markPosition = index + 1;
            const isActive = markPosition === numericValue;
            mark.classList.toggle('active', isActive);
            mark.classList.toggle('passed', markPosition < numericValue);
            const button = mark.querySelector('.net-slider-mark-button');
            if (button) {
                button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            }
        });
    }

    if (option) {
        const percentLabel = document.getElementById('netMitigationPercentLabel');
        if (percentLabel) {
            const percent = Math.round((Number(option.coefficient) || 0) * 100);
            percentLabel.textContent = `Réduction ${percent}%`;
        }
    }

    const max = options.length > 1 ? options.length - 1 : 1;
    const progress = max ? ((numericValue - 1) / max) * 100 : 0;
    slider.style.setProperty('--slider-progress', `${progress}%`);
    slider.value = numericValue;
}

function handleNetSliderChange(event) {
    const sliderValue = parseInt(event.target?.value, 10) || 1;
    const state = 'net';
    const { impact } = getStateValues(state);
    setStateValues(state, sliderValue, impact);
    const updatedImpact = document.getElementById('impactNet')?.value || impact;
    updateNetSliderUI(sliderValue);
    updateNetSeverityBadge(updatedImpact);
    setActiveRiskState(state);
}

function initNetMitigationSlider() {
    const slider = document.getElementById('netMitigationSlider');
    const marksContainer = document.getElementById('netMitigationMarks');
    if (!slider || !marksContainer) return;

    const options = ensureNetMitigationOptions();
    marksContainer.innerHTML = '';

    const applySliderValue = value => {
        slider.value = value;
        slider.dispatchEvent(new Event('input', { bubbles: true }));
        slider.dispatchEvent(new Event('change', { bubbles: true }));
    };

    const lastIndex = options.length - 1;

    options.forEach((option, index) => {
        const mark = document.createElement('div');
        mark.className = 'net-slider-mark';
        const progress = lastIndex > 0 ? (index / lastIndex) * 100 : 0;
        mark.style.setProperty('--mark-position', `${progress}%`);
        if (index === 0) {
            mark.dataset.edge = 'start';
        } else if (index === lastIndex) {
            mark.dataset.edge = 'end';
        }
        mark.dataset.value = option.value;
        const percent = Math.round((Number(option.coefficient) || 0) * 100);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'net-slider-mark-button';
        const label = option.label || option.value;
        button.innerHTML = `<span>${label}</span><span class="net-slider-mark-sub">Réduction ${percent}%</span>`;
        button.setAttribute('aria-label', `${label} – réduction ${percent}%`);
        button.setAttribute('aria-pressed', 'false');
        const targetValue = index + 1;
        button.addEventListener('click', () => applySliderValue(targetValue));
        mark.appendChild(button);
        marksContainer.appendChild(mark);
    });

    const hiddenMitigation = document.getElementById('mitigationEffectiveness');
    const hiddenProb = document.getElementById('probNet');
    const normalized = hiddenMitigation && typeof normalizeMitigationEffectiveness === 'function'
        ? normalizeMitigationEffectiveness(hiddenMitigation.value)
        : null;
    const defaultLevel = normalized || options[1]?.value || options[0]?.value;
    const fallbackColumn = typeof getMitigationColumnFromLevel === 'function'
        ? getMitigationColumnFromLevel(defaultLevel)
        : 1;
    const sliderValue = Math.min(
        Math.max(parseInt(hiddenProb?.value, 10) || fallbackColumn, 1),
        options.length || 1
    );

    slider.min = 1;
    slider.max = options.length || 1;
    slider.step = 1;
    slider.value = sliderValue;

    if (hiddenProb) {
        hiddenProb.value = sliderValue;
    }
    if (hiddenMitigation && !hiddenMitigation.value) {
        const optionAtValue = options[sliderValue - 1];
        if (optionAtValue && optionAtValue.value) {
            hiddenMitigation.value = optionAtValue.value;
        }
    }

    slider.removeEventListener('input', handleNetSliderChange);
    slider.removeEventListener('change', handleNetSliderChange);
    slider.addEventListener('input', handleNetSliderChange);
    slider.addEventListener('change', handleNetSliderChange);

    updateNetSliderUI(sliderValue);
}

function changeMatrixView(view) {
    if (!window.rms) return;

    const targetView = view === 'net' ? 'net' : 'brut';
    rms.currentView = targetView;

    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const viewButton = document.querySelector(`.view-btn[onclick*="${targetView}"]`);
    if (viewButton) {
        viewButton.classList.add('active');
    }

    document.querySelectorAll('.matrix-container[data-view]').forEach(container => {
        const isActive = container.dataset.view === targetView;
        container.classList.toggle('active-view', isActive);
    });

    const targetContainer = document.querySelector(`.matrix-container[data-view="${targetView}"]`);
    if (targetContainer) {
        targetContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    rms.renderRiskPoints();
    rms.updateRiskDetailsList();
}
window.changeMatrixView = changeMatrixView;

function resetMatrixView() {
    if (!window.rms) return;

    changeMatrixView('brut');
}
window.resetMatrixView = resetMatrixView;

function calculateScore(type) {
    const stateKey = type;
    const config = RISK_STATE_CONFIG[stateKey];
    if (!config) return;

    const probInput = document.getElementById(config.probInput);
    const impactInput = document.getElementById(config.impactInput);
    if (!probInput || !impactInput) return;

    const prob = parseInt(probInput.value, 10) || 1;
    const impact = parseInt(impactInput.value, 10) || 1;

    let coefficient = 1;
    let adjustedProb = prob;
    let rawScore;
    let brutScoreReference = null;

    if (stateKey === 'brut') {
        let selection = { coefficient: 1 };
        if (typeof getFormAggravatingSelection === 'function') {
            selection = getFormAggravatingSelection();
        }

        const rawCoefficient = Number(selection?.coefficient);
        coefficient = Number.isFinite(rawCoefficient) && rawCoefficient >= 1 ? rawCoefficient : 1;
        adjustedProb = prob * coefficient;
        rawScore = adjustedProb * impact;

        const coefficientDisplay = document.getElementById('aggravatingCoefficientDisplay');
        if (coefficientDisplay) {
            const formatted = typeof formatCoefficient === 'function'
                ? formatCoefficient(coefficient)
                : (Math.round(coefficient * 10) / 10).toString().replace('.', ',');
            coefficientDisplay.textContent = formatted;
        }
    } else if (stateKey === 'net') {
        const brutProb = parseInt(document.getElementById('probBrut')?.value, 10) || 1;
        const brutImpact = parseInt(document.getElementById('impactBrut')?.value, 10) || 1;
        let aggravatingCoefficient = 1;
        if (typeof getFormAggravatingSelection === 'function') {
            const selection = getFormAggravatingSelection();
            const rawCoef = Number(selection?.coefficient);
            aggravatingCoefficient = Number.isFinite(rawCoef) && rawCoef >= 1 ? rawCoef : 1;
        }
        brutScoreReference = brutProb * aggravatingCoefficient * brutImpact;

        const probInput = document.getElementById(config.probInput);
        const impactInput = document.getElementById(config.impactInput);
        const mitigationInput = document.getElementById('mitigationEffectiveness');
        const currentColumn = probInput ? parseInt(probInput.value, 10) || 1 : 1;
        const mitigationLevel = typeof getMitigationLevelFromColumn === 'function'
            ? getMitigationLevelFromColumn(currentColumn)
            : (typeof normalizeMitigationEffectiveness === 'function'
                ? normalizeMitigationEffectiveness(mitigationInput?.value || '')
                : 'insuffisant');

        if (mitigationInput) {
            mitigationInput.value = mitigationLevel;
        }

        const mitigationCoefficient = typeof getRiskMitigationCoefficient === 'function'
            ? getRiskMitigationCoefficient(mitigationLevel)
            : 0;

        coefficient = typeof clampMitigationReduction === 'function'
            ? clampMitigationReduction(mitigationCoefficient)
            : (Number.isFinite(mitigationCoefficient) ? Math.min(Math.max(mitigationCoefficient, 0), 1) : 0);
        adjustedProb = brutScoreReference;
        rawScore = brutScoreReference * (1 - coefficient);

        const severity = typeof getRiskSeverityFromScore === 'function'
            ? getRiskSeverityFromScore(brutScoreReference)
            : (brutScoreReference >= 12 ? 'critique' : brutScoreReference >= 6 ? 'fort' : brutScoreReference >= 3 ? 'modere' : 'faible');
        const netImpactValue = typeof getNetImpactValueFromSeverity === 'function'
            ? getNetImpactValueFromSeverity(severity)
            : (severity === 'critique' ? 4 : severity === 'fort' ? 3 : severity === 'modere' ? 2 : 1);

        if (impactInput && parseInt(impactInput.value, 10) !== netImpactValue) {
            impactInput.value = netImpactValue;
        }

        updateNetSeverityBadge(netImpactValue);
        updateNetSliderUI(prob);
    }

    if (rawScore === undefined) {
        rawScore = adjustedProb * impact;
    }
    const safeScore = Number.isFinite(rawScore) ? rawScore : 0;

    const scoreElementId = config.scoreElement;
    const scoreElement = scoreElementId ? document.getElementById(scoreElementId) : null;
    if (scoreElement) {
        const formattedScore = safeScore.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
        scoreElement.textContent = `Score: ${formattedScore}`;
    }

    const coordElementId = config.coordElement;
    const coordElement = coordElementId ? document.getElementById(coordElementId) : null;
    if (coordElement) {
        if (stateKey === 'brut' && coefficient > 1) {
            const formattedCoef = typeof formatCoefficient === 'function'
                ? formatCoefficient(coefficient)
                : (Math.round(coefficient * 10) / 10).toString().replace('.', ',');
            coordElement.textContent = `P${prob} × C${formattedCoef} × I${impact}`;
        } else if (stateKey === 'net') {
            const brutLabel = Number.isFinite(brutScoreReference)
                ? brutScoreReference.toLocaleString('fr-FR', { maximumFractionDigits: 2 })
                : '0';
            const reductionLabel = typeof formatMitigationCoefficient === 'function'
                ? formatMitigationCoefficient(coefficient)
                : `${Math.round(coefficient * 100)}%`;
            coordElement.textContent = `Brut ${brutLabel} × Réduction ${reductionLabel}`;
        } else {
            coordElement.textContent = `P${prob} × I${impact}`;
        }
    }

    positionRiskPointIfExists(stateKey, prob, impact);

    if (activeRiskEditState === stateKey) {
        highlightCell(prob, impact, stateKey);
    }
    updateMatrixDescription(prob, impact, stateKey);

    if (stateKey === 'brut') {
        calculateScore('net');
    }
}
window.calculateScore = calculateScore;

function getStateValues(state) {
    const config = RISK_STATE_CONFIG[state];
    if (!config) {
        return { prob: 1, impact: 1 };
    }
    const prob = parseInt(document.getElementById(config.probInput)?.value, 10) || 1;
    const impact = parseInt(document.getElementById(config.impactInput)?.value, 10) || 1;
    return { prob, impact };
}

function setStateValues(state, prob, impact) {
    const config = RISK_STATE_CONFIG[state];
    if (!config) return;
    const probInput = document.getElementById(config.probInput);
    const impactInput = document.getElementById(config.impactInput);
    if (probInput) probInput.value = prob;
    if (impactInput) impactInput.value = impact;
    calculateScore(state);
}

function positionRiskPointIfExists(state, prob, impact) {
    if (!editMatrixPoints[state]) return;
    const values = (typeof prob === 'number' && typeof impact === 'number')
        ? { prob, impact }
        : getStateValues(state);
    positionRiskPoint(state, values.prob, values.impact);
}

function positionRiskPoint(state, prob, impact) {
    const config = RISK_STATE_CONFIG[state];
    if (!config) return;
    const matrixId = config.matrixId;
    if (!matrixId) return;
    const matrix = document.getElementById(matrixId);
    const point = editMatrixPoints[state];
    if (!matrix || !point) return;

    const rect = matrix.getBoundingClientRect();
    if (!rect.width || !rect.height) {
        requestAnimationFrame(() => positionRiskPoint(state, prob, impact));
        return;
    }

    const cellWidth = rect.width / 4;
    const cellHeight = rect.height / 4;
    const left = (prob - 0.5) * cellWidth;
    const top = (4 - impact + 0.5) * cellHeight;

    point.style.left = `${left}px`;
    point.style.top = `${top}px`;
    point.style.transform = 'translate(-50%, -50%)';
}

function positionAllPoints() {
    if (!Object.keys(editMatrixPoints).length) return;
    Object.keys(RISK_STATE_CONFIG).forEach(state => {
        const { prob, impact } = getStateValues(state);
        positionRiskPoint(state, prob, impact);
    });
}

function clearHighlightedCell(state) {
    if (state) {
        const highlighted = highlightedEditCells[state];
        if (highlighted) {
            highlighted.classList.remove('drag-hover');
            highlightedEditCells[state] = null;
        }
        return;
    }

    Object.keys(highlightedEditCells).forEach(key => {
        if (highlightedEditCells[key]) {
            highlightedEditCells[key].classList.remove('drag-hover');
            highlightedEditCells[key] = null;
        }
    });
}

function highlightCell(prob, impact, state = activeRiskEditState) {
    const config = RISK_STATE_CONFIG[state];
    if (!config) return;

    const gridId = config.gridId;
    if (!gridId) return;
    const grid = document.getElementById(gridId);
    if (!grid) return;

    clearHighlightedCell(state);

    const selector = `.matrix-cell[data-probability="${prob}"][data-impact="${impact}"]`;
    const cell = grid.querySelector(selector);
    if (cell) {
        cell.classList.add('drag-hover');
        highlightedEditCells[state] = cell;
    }
}

function updateMatrixDescription(prob, impact, state = activeRiskEditState) {
    const stateConfig = RISK_STATE_CONFIG[state];
    if (!stateConfig) return;

    const containerId = stateConfig.descriptionContainer || 'matrixDescription';
    const container = document.getElementById(containerId);
    if (!container) return;

    if (state === 'net') {
        const mitigationLevel = typeof getMitigationLevelFromColumn === 'function'
            ? getMitigationLevelFromColumn(prob)
            : (typeof normalizeMitigationEffectiveness === 'function'
                ? normalizeMitigationEffectiveness(prob)
                : 'insuffisant');

        const mitigationDescription = typeof MITIGATION_EFFECTIVENESS_DESCRIPTIONS === 'object'
            ? MITIGATION_EFFECTIVENESS_DESCRIPTIONS[mitigationLevel]
            : '';

        if (mitigationDescription) {
            container.innerHTML = `<div class="mitigation-description">${mitigationDescription}</div>`;
        } else {
            container.innerHTML = `
                <div class="matrix-description-empty">Ajustez le niveau de contrôle pour visualiser l'efficacité appliquée au risque.</div>
            `;
        }
        return;
    }

    const probability = RISK_PROBABILITY_INFO[prob];
    const impactInfo = RISK_IMPACT_INFO[impact];

    if (!probability || !impactInfo) {
        container.innerHTML = `
            <div class="matrix-description-header">${stateConfig.label}</div>
            <div class="matrix-description-empty">Déplacez le marqueur pour obtenir les définitions détaillées.</div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="matrix-description-header">${stateConfig.label}</div>
        <div class="matrix-description-section">
            <h4>Probabilité ${prob} – ${probability.label}</h4>
            <p>${probability.text}</p>
        </div>
        <div class="matrix-description-section">
            <h4>Impact ${impact} – ${impactInfo.label}</h4>
            <p>${impactInfo.text}</p>
        </div>
    `;
}

function updateStateButtons() {
    document.querySelectorAll('.state-btn').forEach(btn => {
        const state = btn.dataset.state;
        btn.classList.toggle('active', state === activeRiskEditState);
    });
    document.querySelectorAll('.edit-matrix-group').forEach(group => {
        const state = group.dataset.state;
        group.classList.toggle('active', state === activeRiskEditState);
    });
}

function updateScoreCardState() {
    document.querySelectorAll('.risk-score-card').forEach(card => {
        const state = card.dataset.state;
        card.classList.toggle('active', state === activeRiskEditState);
    });
}

function updatePointsVisualState() {
    Object.entries(editMatrixPoints).forEach(([state, point]) => {
        if (!point) return;
        const isActive = state === activeRiskEditState;
        point.classList.toggle('inactive', !isActive);
        point.classList.toggle('active-point', isActive);
    });
}

function setActiveRiskState(state) {
    if (!RISK_STATE_CONFIG[state]) return;
    activeRiskEditState = state;
    updateStateButtons();
    updateScoreCardState();
    updatePointsVisualState();
    const { prob, impact } = getStateValues(state);
    highlightCell(prob, impact, state);
    updateMatrixDescription(prob, impact, state);

    if (state === 'net') {
        const impactValue = document.getElementById('impactNet')?.value;
        if (impactValue) {
            updateNetSeverityBadge(impactValue);
        }
        const probValue = document.getElementById('probNet')?.value;
        if (probValue) {
            updateNetSliderUI(probValue);
        }
    }
    positionAllPoints();
}
window.setActiveRiskState = setActiveRiskState;

function getCellFromEvent(event, matrix) {
    if (!matrix) return null;
    const rect = matrix.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        return null;
    }

    const prob = Math.min(4, Math.max(1, Math.ceil(x / (rect.width / 4))));
    const state = matrix.dataset.state;
    if (state === 'net') {
        const impactInput = document.getElementById('impactNet');
        const lockedImpact = impactInput ? parseInt(impactInput.value, 10) || 1 : 1;
        return { prob, impact: lockedImpact };
    }

    const rowIndex = Math.min(3, Math.max(0, Math.floor(y / (rect.height / 4))));
    const impact = 4 - rowIndex;
    return { prob, impact };
}

function startPointDrag(event) {
    const point = event.currentTarget;
    const state = point.dataset.state;
    if (!state) return;

    if (state !== activeRiskEditState) {
        setActiveRiskState(state);
    }

    currentDragState = state;
    currentPointerId = event.pointerId;
    lastDragCell = null;
    point.setPointerCapture(currentPointerId);
    point.classList.add('dragging');
    event.preventDefault();
}

function handlePointMove(event) {
    if (!currentDragState || event.pointerId !== currentPointerId) return;
    const config = RISK_STATE_CONFIG[currentDragState];
    if (!config) return;
    const matrixId = config.matrixId;
    if (!matrixId) return;
    const matrix = document.getElementById(matrixId);
    const cell = getCellFromEvent(event, matrix);
    if (!cell) return;

    if (!lastDragCell || lastDragCell.prob !== cell.prob || lastDragCell.impact !== cell.impact) {
        lastDragCell = cell;
        setStateValues(currentDragState, cell.prob, cell.impact);
    }
}

function finishPointDrag(event) {
    if (!currentDragState || event.pointerId !== currentPointerId) return;
    const state = currentDragState;
    const point = event.currentTarget;
    point.releasePointerCapture(currentPointerId);
    point.classList.remove('dragging');

    const config = RISK_STATE_CONFIG[state];
    const matrixId = config?.matrixId;
    const matrix = matrixId ? document.getElementById(matrixId) : null;
    const cell = getCellFromEvent(event, matrix) || lastDragCell || getStateValues(state);
    if (cell) {
        setStateValues(state, cell.prob, cell.impact);
    }

    currentDragState = null;
    currentPointerId = null;
    lastDragCell = null;
}

function handleMatrixPointerDown(event) {
    const matrix = event.currentTarget;
    const state = matrix.dataset.state;
    if (!state || !RISK_STATE_CONFIG[state]) return;

    setActiveRiskState(state);

    if (event.target && event.target.classList.contains('risk-point')) {
        return;
    }

    const cell = getCellFromEvent(event, matrix);
    if (cell) {
        setStateValues(state, cell.prob, cell.impact);
    }
}

function initRiskEditMatrix() {
    Object.keys(editMatrixPoints).forEach(state => {
        const point = editMatrixPoints[state];
        if (point && point.parentNode) {
            point.parentNode.removeChild(point);
        }
        delete editMatrixPoints[state];
    });

    initNetMitigationSlider();

    Object.entries(RISK_STATE_CONFIG).forEach(([state, config]) => {
        if (state === 'net') {
            highlightedEditCells[state] = null;
            return;
        }

        const matrixId = config.matrixId;
        const gridId = config.gridId;
        const matrix = matrixId ? document.getElementById(matrixId) : null;
        const grid = gridId ? document.getElementById(gridId) : null;
        if (!matrix || !grid) {
            highlightedEditCells[state] = null;
            return;
        }

        grid.innerHTML = '';

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

                grid.appendChild(cell);
            }
        }

        highlightedEditCells[state] = null;

        const point = document.createElement('div');
        point.className = `risk-point ${config.pointClass} edit-point`;
        point.dataset.state = state;
        if (config.symbol) {
            point.textContent = config.symbol;
        }
        point.setAttribute('aria-label', config.label);
        point.addEventListener('pointerdown', startPointDrag);
        point.addEventListener('pointermove', handlePointMove);
        point.addEventListener('pointerup', finishPointDrag);
        point.addEventListener('pointercancel', finishPointDrag);
        matrix.appendChild(point);
        editMatrixPoints[state] = point;

        if (!matrix.dataset.pointerListener) {
            matrix.addEventListener('pointerdown', handleMatrixPointerDown);
            matrix.dataset.pointerListener = 'true';
        }
    });

    const initialState = RISK_STATE_CONFIG[activeRiskEditState] ? activeRiskEditState : 'brut';
    setActiveRiskState(initialState);

    const netImpact = document.getElementById('impactNet')?.value;
    if (netImpact) {
        updateNetSeverityBadge(netImpact);
    }
    const netProb = document.getElementById('probNet')?.value;
    if (netProb) {
        updateNetSliderUI(netProb);
    }
    const mitigationValue = document.getElementById('mitigationEffectiveness')?.value;
    if (mitigationValue) {
        updateNetLegendActive(mitigationValue);
    }

    requestAnimationFrame(() => positionAllPoints());
}
window.initRiskEditMatrix = initRiskEditMatrix;

window.addEventListener('resize', () => positionAllPoints());
