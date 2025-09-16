// Matrix interaction logic for the Risk Management System
let activeRiskEditState = 'brut';
const editMatrixPoints = {};
let highlightedEditCell = null;
let currentDragState = null;
let currentPointerId = null;
let lastDragCell = null;

function calculateScore(type) {
    const stateKey = type === 'post' ? 'post' : type;
    const config = RISK_STATE_CONFIG[stateKey];
    if (!config) return;

    const probInput = document.getElementById(config.probInput);
    const impactInput = document.getElementById(config.impactInput);
    if (!probInput || !impactInput) return;

    const prob = parseInt(probInput.value, 10) || 1;
    const impact = parseInt(impactInput.value, 10) || 1;
    const score = prob * impact;

    const scoreElement = document.getElementById(config.scoreElement);
    if (scoreElement) {
        scoreElement.textContent = `Score: ${score}`;
    }

    const coordElement = document.getElementById(config.coordElement);
    if (coordElement) {
        coordElement.textContent = `P${prob} × I${impact}`;
    }

    positionRiskPointIfExists(stateKey, prob, impact);

    if (activeRiskEditState === stateKey) {
        highlightCell(prob, impact);
        updateMatrixDescription(prob, impact, stateKey);
    }

    if (type === 'net' && selectedActionPlansForRisk.length === 0) {
        const postConfig = RISK_STATE_CONFIG.post;
        if (postConfig) {
            const postProbInput = document.getElementById(postConfig.probInput);
            const postImpactInput = document.getElementById(postConfig.impactInput);
            if (postProbInput) postProbInput.value = prob;
            if (postImpactInput) postImpactInput.value = impact;
            calculateScore('post');
        }
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
    calculateScore(state === 'post' ? 'post' : state);
}

function positionRiskPointIfExists(state, prob, impact) {
    if (!editMatrixPoints[state]) return;
    const values = (typeof prob === 'number' && typeof impact === 'number')
        ? { prob, impact }
        : getStateValues(state);
    positionRiskPoint(state, values.prob, values.impact);
}

function positionRiskPoint(state, prob, impact) {
    const matrix = document.getElementById('riskMatrixEdit');
    const point = editMatrixPoints[state];
    if (!matrix || !point) return;

    const rect = matrix.getBoundingClientRect();
    if (!rect.width || !rect.height) {
        requestAnimationFrame(() => positionRiskPoint(state, prob, impact));
        return;
    }

    const cellWidth = rect.width / 4;
    const cellHeight = rect.height / 4;
    const left = (impact - 0.5) * cellWidth;
    const top = (4 - prob + 0.5) * cellHeight;

    point.style.left = `${left}px`;
    point.style.top = `${top}px`;
    point.style.transform = 'translate(-50%, -50%)';
}

function positionAllPoints() {
    if (!Object.keys(editMatrixPoints).length) return;
    const matrix = document.getElementById('riskMatrixEdit');
    if (!matrix) return;
    const rect = matrix.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    Object.keys(RISK_STATE_CONFIG).forEach(state => {
        const { prob, impact } = getStateValues(state);
        positionRiskPoint(state, prob, impact);
    });
}

function clearHighlightedCell() {
    if (highlightedEditCell) {
        highlightedEditCell.classList.remove('drag-hover');
        highlightedEditCell = null;
    }
}

function highlightCell(prob, impact) {
    const grid = document.getElementById('riskMatrixEditGrid');
    if (!grid) return;

    clearHighlightedCell();

    const selector = `.matrix-cell[data-probability="${prob}"][data-impact="${impact}"]`;
    const cell = grid.querySelector(selector);
    if (cell) {
        cell.classList.add('drag-hover');
        highlightedEditCell = cell;
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
        if (state === activeRiskEditState) {
            point.classList.remove('inactive');
        } else {
            point.classList.add('inactive');
        }
    });
}

function setActiveRiskState(state) {
    if (!RISK_STATE_CONFIG[state]) return;
    activeRiskEditState = state;
    updateStateButtons();
    updateScoreCardState();
    updatePointsVisualState();
    const { prob, impact } = getStateValues(state);
    highlightCell(prob, impact);
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

    const col = Math.min(4, Math.max(1, Math.ceil(x / (rect.width / 4))));
    const rowIndex = Math.min(3, Math.max(0, Math.floor(y / (rect.height / 4))));
    const prob = 4 - rowIndex;
    return { prob, impact: col };
}

function startPointDrag(event) {
    const point = event.currentTarget;
    const state = point.dataset.state;
    if (state !== activeRiskEditState) return;

    currentDragState = state;
    currentPointerId = event.pointerId;
    lastDragCell = null;
    point.setPointerCapture(currentPointerId);
    point.classList.add('dragging');
    event.preventDefault();
}

function handlePointMove(event) {
    if (!currentDragState || event.pointerId !== currentPointerId) return;
    const matrix = document.getElementById('riskMatrixEdit');
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

    const matrix = document.getElementById('riskMatrixEdit');
    const cell = getCellFromEvent(event, matrix) || lastDragCell || getStateValues(state);
    if (cell) {
        setStateValues(state, cell.prob, cell.impact);
    }

    currentDragState = null;
    currentPointerId = null;
    lastDragCell = null;
}

function initRiskEditMatrix() {
    const matrix = document.getElementById('riskMatrixEdit');
    const grid = document.getElementById('riskMatrixEditGrid');
    if (!matrix || !grid) return;

    grid.innerHTML = '';

    for (let prob = 4; prob >= 1; prob--) {
        for (let impact = 1; impact <= 4; impact++) {
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

    Object.keys(editMatrixPoints).forEach(state => {
        const point = editMatrixPoints[state];
        if (point && point.parentNode) {
            point.parentNode.removeChild(point);
        }
        delete editMatrixPoints[state];
    });

    Object.entries(RISK_STATE_CONFIG).forEach(([state, config]) => {
        const point = document.createElement('div');
        point.className = `risk-point ${config.pointClass} edit-point`;
        point.dataset.state = state;
        point.addEventListener('pointerdown', startPointDrag);
        point.addEventListener('pointermove', handlePointMove);
        point.addEventListener('pointerup', finishPointDrag);
        point.addEventListener('pointercancel', finishPointDrag);
        matrix.appendChild(point);
        editMatrixPoints[state] = point;
    });

    const initialState = RISK_STATE_CONFIG[activeRiskEditState] ? activeRiskEditState : 'brut';
    setActiveRiskState(initialState);
    requestAnimationFrame(() => positionAllPoints());
}
window.initRiskEditMatrix = initRiskEditMatrix;

window.addEventListener('resize', () => positionAllPoints());
