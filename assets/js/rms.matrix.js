// Enhanced Risk Management System - Matrix Interactions

var activeRiskEditState = 'brut';
var editMatrixPoints = {};
var highlightedEditCells = {};
var currentDragState = null;
var currentPointerId = null;
var lastDragCell = null;

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

        const mitigationSelect = document.getElementById('mitigationEffectiveness');
        const mitigationValue = mitigationSelect ? mitigationSelect.value : '';
        const mitigationCoefficient = typeof getRiskMitigationCoefficient === 'function'
            ? getRiskMitigationCoefficient(mitigationValue)
            : (typeof normalizeMitigationEffectiveness === 'function'
                ? getRiskMitigationCoefficient(normalizeMitigationEffectiveness(mitigationValue))
                : 0);

        coefficient = Number.isFinite(mitigationCoefficient) ? mitigationCoefficient : 0;
        adjustedProb = brutScoreReference;
        rawScore = brutScoreReference * coefficient;
    }

    if (rawScore === undefined) {
        rawScore = adjustedProb * impact;
    }
    const safeScore = Number.isFinite(rawScore) ? rawScore : 0;

    const scoreElement = document.getElementById(config.scoreElement);
    if (scoreElement) {
        const formattedScore = safeScore.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
        scoreElement.textContent = `Score: ${formattedScore}`;
    }

    const coordElement = document.getElementById(config.coordElement);
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
        highlightCell(prob, impact);
        updateMatrixDescription(prob, impact, stateKey);
    }

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
    const matrix = document.getElementById(config.matrixId);
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

    const grid = document.getElementById(config.gridId);
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
    const container = document.getElementById('matrixDescription');
    const stateConfig = RISK_STATE_CONFIG[state];
    if (!container || !stateConfig) return;

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
    const matrix = document.getElementById(config.matrixId);
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
    const matrix = config ? document.getElementById(config.matrixId) : null;
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

    Object.entries(RISK_STATE_CONFIG).forEach(([state, config]) => {
        const matrix = document.getElementById(config.matrixId);
        const grid = document.getElementById(config.gridId);
        if (!matrix || !grid) {
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
    requestAnimationFrame(() => positionAllPoints());
}
window.initRiskEditMatrix = initRiskEditMatrix;

window.addEventListener('resize', () => positionAllPoints());
