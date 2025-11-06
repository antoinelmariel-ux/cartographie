// Enhanced Risk Management System - Matrix Interactions

var activeRiskEditState = 'brut';
var editMatrixPoints = {};
var highlightedEditCells = {};
var currentDragState = null;
var currentPointerId = null;
var lastDragCell = null;

function updateNetLegendActive(effectiveness) {
    const legend = document.getElementById('netLegend');
    if (!legend) return;

    const normalized = typeof normalizeMitigationEffectiveness === 'function'
        ? normalizeMitigationEffectiveness(effectiveness)
        : effectiveness;

    legend.querySelectorAll('.legend-item').forEach(item => {
        const value = item.dataset.effectiveness;
        item.classList.toggle('active', value === normalized);
    });
}

function updateNetRowHighlight(impactValue) {
    const rowContainer = document.getElementById('riskMatrixEditNetRowLabels');
    if (!rowContainer) return;

    const numericImpact = parseInt(impactValue, 10);
    rowContainer.querySelectorAll('.matrix-net-row-label').forEach((label, index) => {
        const expectedImpact = 4 - index;
        label.classList.toggle('active', expectedImpact === numericImpact);
    });
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

        coefficient = Number.isFinite(mitigationCoefficient) ? mitigationCoefficient : 0;
        adjustedProb = brutScoreReference;
        rawScore = brutScoreReference * coefficient;

        const severity = typeof getRiskSeverityFromScore === 'function'
            ? getRiskSeverityFromScore(brutScoreReference)
            : (brutScoreReference >= 12 ? 'critique' : brutScoreReference >= 6 ? 'fort' : brutScoreReference >= 3 ? 'modere' : 'faible');
        const netImpactValue = typeof getNetImpactValueFromSeverity === 'function'
            ? getNetImpactValueFromSeverity(severity)
            : (severity === 'critique' ? 4 : severity === 'fort' ? 3 : severity === 'modere' ? 2 : 1);

        if (impactInput && parseInt(impactInput.value, 10) !== netImpactValue) {
            impactInput.value = netImpactValue;
        }

        updateNetLegendActive(mitigationLevel);
        updateNetRowHighlight(netImpactValue);
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

    if (state === 'net') {
        const severity = typeof getSeverityFromNetImpactValue === 'function'
            ? getSeverityFromNetImpactValue(impact)
            : (impact >= 4 ? 'critique' : impact === 3 ? 'fort' : impact === 2 ? 'modere' : 'faible');
        const mitigationLevel = typeof getMitigationLevelFromColumn === 'function'
            ? getMitigationLevelFromColumn(prob)
            : (typeof normalizeMitigationEffectiveness === 'function'
                ? normalizeMitigationEffectiveness(prob)
                : 'insuffisant');

        const mitigationInfo = typeof MITIGATION_EFFECTIVENESS_SCALE === 'object'
            ? MITIGATION_EFFECTIVENESS_SCALE[mitigationLevel]
            : null;

        const severityLabels = {
            critique: 'Critique',
            fort: 'Fort',
            modere: 'Modéré',
            faible: 'Faible'
        };

        const reductionLabel = typeof formatMitigationCoefficient === 'function'
            ? formatMitigationCoefficient(mitigationInfo?.coefficient)
            : `${Math.round((mitigationInfo?.coefficient || 0) * 100)}%`;

        container.innerHTML = `
            <div class="matrix-description-header">${stateConfig.label}</div>
            <div class="matrix-description-section">
                <h4>Niveau brut ${severityLabels[severity] || ''}</h4>
                <p>Déterminé automatiquement en fonction du score brut et des facteurs aggravants appliqués.</p>
            </div>
            <div class="matrix-description-section">
                <h4>Efficacité ${mitigationInfo?.label || mitigationLevel}</h4>
                <p>Réduction appliquée : ${reductionLabel}. Faites glisser le marqueur horizontalement pour ajuster la maîtrise.</p>
            </div>
        `;
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
        const mitigationValue = document.getElementById('mitigationEffectiveness')?.value;
        if (mitigationValue) {
            updateNetLegendActive(mitigationValue);
        }
        const impactValue = document.getElementById('impactNet')?.value;
        if (impactValue) {
            updateNetRowHighlight(impactValue);
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

        if (state === 'net') {
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

            brutLevels.forEach((level, rowIndex) => {
                const impactValue = 4 - rowIndex;
                mitigationOptions.forEach((option, colIndex) => {
                    const cell = document.createElement('div');
                    cell.className = 'matrix-cell';
                    cell.dataset.probability = colIndex + 1;
                    cell.dataset.impact = impactValue;
                    cell.dataset.effectiveness = option.value;
                    cell.dataset.brutLevel = level.value;

                    const coefficient = Number(option.coefficient) || 0;
                    const referenceScore = level.reference * coefficient;
                    const severity = typeof getRiskSeverityFromScore === 'function'
                        ? getRiskSeverityFromScore(referenceScore)
                        : (referenceScore >= 12 ? 'critique' : referenceScore >= 6 ? 'fort' : referenceScore >= 3 ? 'modere' : 'faible');
                    cell.classList.add(severityClassMap[severity] || 'level-1');

                    grid.appendChild(cell);
                });
            });

            const rowLabels = document.getElementById('riskMatrixEditNetRowLabels');
            if (rowLabels) {
                rowLabels.innerHTML = '';
                brutLevels.forEach(level => {
                    const label = document.createElement('div');
                    label.className = 'matrix-net-row-label';
                    label.innerHTML = `${level.label}<span>${level.range}</span>`;
                    rowLabels.appendChild(label);
                });
            }

            const colLabels = document.getElementById('riskMatrixEditNetColLabels');
            if (colLabels) {
                colLabels.innerHTML = '';
                mitigationOptions.forEach(option => {
                    const percent = Math.round((Number(option.coefficient) || 0) * 100);
                    const label = document.createElement('div');
                    label.className = 'matrix-net-col-label';
                    label.innerHTML = `${option.label}<span>Réduction ${percent}%</span>`;
                    colLabels.appendChild(label);
                });
            }
        } else {
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

        if (state === 'net') {
            const mitigationInput = document.getElementById('mitigationEffectiveness');
            if (mitigationInput) {
                updateNetLegendActive(mitigationInput.value);
            }
            const impactValue = document.getElementById('impactNet')?.value;
            if (impactValue) {
                updateNetRowHighlight(impactValue);
            }
        }
    });

    const initialState = RISK_STATE_CONFIG[activeRiskEditState] ? activeRiskEditState : 'brut';
    setActiveRiskState(initialState);
    requestAnimationFrame(() => positionAllPoints());
}
window.initRiskEditMatrix = initRiskEditMatrix;

window.addEventListener('resize', () => positionAllPoints());
