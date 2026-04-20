// Enhanced Risk Management System - UI Interactions

function switchTab(tabNameOrEvent, maybeTabName) {
    let tabName = tabNameOrEvent;
    let evt = null;

    if (typeof tabNameOrEvent === 'object' && tabNameOrEvent !== null && !(tabNameOrEvent instanceof String)) {
        evt = tabNameOrEvent;
        tabName = maybeTabName;
    } else {
        evt = window.event || null;
    }

    if (typeof tabName !== 'string' || !tabName) {
        return;
    }

    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    document.querySelectorAll('.tab').forEach(btn => {
        btn.classList.remove('active');
    });

    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    let activeButton = null;
    if (evt) {
        activeButton = evt.currentTarget || (evt.target && evt.target.closest('.tab'));
    }

    if (!activeButton) {
        activeButton = document.querySelector(`.tab[onclick="switchTab('${tabName}')"]`);
    }

    activeButton && activeButton.classList.add('active');

    if (window.rms) {
        rms.currentTab = tabName;
        rms.renderAll();
    }
}
window.switchTab = switchTab;

window.matrixEditMode = false;

function toggleMatrixEditMode(forceState = null) {
    const nextState = typeof forceState === 'boolean' ? forceState : !window.matrixEditMode;
    window.matrixEditMode = nextState;
    const button = document.getElementById('matrixEditToggleBtn');
    if (button) {
        button.classList.toggle('btn-primary', nextState);
        button.classList.toggle('btn-secondary', !nextState);
        button.textContent = nextState ? 'Edit mode active' : 'Edit mode';
    }
    document.body.classList.toggle('matrix-edit-mode', nextState);
    if (window.rms) {
        rms.renderRiskPoints();
    }
    if (typeof showNotification === 'function') {
        showNotification('info', nextState
            ? 'Edit mode enabled: drag a risk in the gross risk matrix.'
            : 'Edit mode disabled.');
    }
}
window.toggleMatrixEditMode = toggleMatrixEditMode;

function syncRiskFilterWidgets(filterKey, value, sourceElement) {
    const normalizedKey = typeof filterKey === 'string' ? filterKey.trim() : '';
    if (!normalizedKey) {
        return;
    }

    const normalizedValue = Array.isArray(value)
        ? value
        : (value == null ? '' : String(value));

    if (!Array.isArray(normalizedValue) && sourceElement && typeof sourceElement.value !== 'undefined' && sourceElement.value !== normalizedValue) {
        sourceElement.value = normalizedValue;
    }

    document.querySelectorAll(`[data-risk-filter="${normalizedKey}"]`).forEach(element => {
        if (element === sourceElement) {
            return;
        }
        if (!('value' in element)) {
            return;
        }

        if (Array.isArray(normalizedValue)) {
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
}
window.syncRiskFilterWidgets = syncRiskFilterWidgets;

function applyFilters(filterKeyOrEvent, value, sourceElement) {
    if (!window.rms) return;

    let filterKey = filterKeyOrEvent;
    let filterValue = value;
    let originElement = sourceElement;

    if (filterKey && typeof filterKey === 'object' && 'target' in filterKey) {
        originElement = filterKey.target;
        filterKey = originElement?.dataset?.riskFilter || '';
        filterValue = originElement?.value;
    }

    const normalizedKey = typeof filterKey === 'string' ? filterKey.trim() : '';

    if (!rms.filters) {
        rms.filters = { process: '', type: '', status: '', search: '', entity: [] };
    }

    if (normalizedKey) {
        const normalizedValue = normalizedKey === 'entity'
            ? (Array.isArray(filterValue) ? filterValue : [])
            : (filterValue == null ? '' : String(filterValue));
        rms.filters[normalizedKey] = normalizedValue;
        syncRiskFilterWidgets(normalizedKey, normalizedValue, originElement);
    } else {
        Object.entries(rms.filters).forEach(([key, currentValue]) => {
            syncRiskFilterWidgets(key, currentValue, null);
        });
    }

    rms.renderRiskPoints();
    rms.updateRiskDetailsList();
    rms.updateRisksList();
    if (typeof rms.renderMatrixEntityFilterChips === 'function') {
        rms.renderMatrixEntityFilterChips();
    }
}
window.applyFilters = applyFilters;

function searchRisks(searchTermOrEvent, sourceElement) {
    if (!window.rms) return;

    let searchTerm = searchTermOrEvent;
    let originElement = sourceElement;

    if (searchTerm && typeof searchTerm === 'object' && 'target' in searchTerm) {
        originElement = searchTerm.target;
        searchTerm = originElement?.value;
    }

    const normalizedValue = searchTerm == null ? '' : String(searchTerm).trim();

    if (!rms.filters) {
        rms.filters = { process: '', type: '', status: '', search: '', entity: [] };
    }

    rms.filters.search = normalizedValue;

    syncRiskFilterWidgets('search', normalizedValue, originElement);

    rms.renderRiskPoints();
    rms.updateRiskDetailsList();
    rms.updateRisksList();
    if (typeof rms.renderMatrixEntityFilterChips === 'function') {
        rms.renderMatrixEntityFilterChips();
    }
}
window.searchRisks = searchRisks;

function toggleEntityFilterChip(entityValue) {
    if (!window.rms || !entityValue) return;

    if (!rms.filters) {
        rms.filters = { process: '', type: '', status: '', search: '', entity: [] };
    }

    const current = Array.isArray(rms.filters.entity) ? rms.filters.entity : [];
    const next = current.includes(entityValue)
        ? current.filter(value => value !== entityValue)
        : [...current, entityValue];

    applyFilters('entity', next, null);
}
window.toggleEntityFilterChip = toggleEntityFilterChip;

function syncControlFilterWidgets(filterKey, value, sourceElement) {
    const normalizedKey = typeof filterKey === 'string' ? filterKey.trim() : '';
    if (!normalizedKey) return;

    const normalizedValue = value == null ? '' : String(value);

    document.querySelectorAll(`[data-filter-key="${normalizedKey}"]`).forEach(element => {
        if (element === sourceElement) {
            return;
        }
        if (!('value' in element)) {
            return;
        }

        if (element.value !== normalizedValue) {
            element.value = normalizedValue;
        }
    });
}

function applyControlFilters(filterKey, value, sourceElement) {
    if (!window.rms) return;

    const normalizedKey = typeof filterKey === 'string' ? filterKey.trim() : '';
    if (!normalizedKey) return;

    const normalizedValue = value == null ? '' : String(value);

    const defaultFilters = { type: '', origin: '', status: '', search: '' };
    if (!rms.controlFilters) {
        rms.controlFilters = { ...defaultFilters };
    } else {
        rms.controlFilters = { ...defaultFilters, ...rms.controlFilters };
    }

    if (normalizedKey in rms.controlFilters) {
        rms.controlFilters[normalizedKey] = normalizedValue;
    }

    syncControlFilterWidgets(normalizedKey, normalizedValue, sourceElement);

    rms.updateControlsList();
}
window.applyControlFilters = applyControlFilters;

function searchControls(searchTerm, sourceElement) {
    if (!window.rms) return;

    const normalizedValue = searchTerm == null ? '' : String(searchTerm);

    const defaultFilters = { type: '', origin: '', status: '', search: '' };
    if (!rms.controlFilters) {
        rms.controlFilters = { ...defaultFilters };
    } else {
        rms.controlFilters = { ...defaultFilters, ...rms.controlFilters };
    }

    rms.controlFilters.search = normalizedValue;

    syncControlFilterWidgets('search', normalizedValue, sourceElement);

    rms.updateControlsList();
}
window.searchControls = searchControls;

function syncActionPlanFilterWidgets(filterKey, value, sourceElement) {
    const normalizedKey = typeof filterKey === 'string' ? filterKey.trim() : '';
    if (!normalizedKey) return;

    const normalizedValue = value == null ? '' : String(value);

    document.querySelectorAll(`[data-action-plan-filter="${normalizedKey}"]`).forEach(element => {
        if (element === sourceElement) {
            return;
        }

        if (!('value' in element)) {
            return;
        }

        if (element.value !== normalizedValue) {
            element.value = normalizedValue;
        }
    });
}

function applyActionPlanFilters(filterKey, value, sourceElement) {
    if (!window.rms) return;

    const normalizedKey = typeof filterKey === 'string' ? filterKey.trim() : '';
    if (!normalizedKey) return;

    const normalizedValue = value == null ? '' : String(value);

    const defaultFilters = { status: '', name: '', owner: '', dueDateOrder: '' };

    if (!rms.actionPlanFilters) {
        rms.actionPlanFilters = { ...defaultFilters };
    } else {
        rms.actionPlanFilters = { ...defaultFilters, ...rms.actionPlanFilters };
    }

    rms.actionPlanFilters[normalizedKey] = normalizedValue;

    syncActionPlanFilterWidgets(normalizedKey, normalizedValue, sourceElement);

    rms.updateActionPlansList();
}
window.applyActionPlanFilters = applyActionPlanFilters;

function searchActionPlans(searchTerm, sourceElement) {
    applyActionPlanFilters('name', searchTerm, sourceElement);
}
window.searchActionPlans = searchActionPlans;

var lastRiskData = null;
var selectedControlsForRisk = [];
var controlAssignmentsForRisk = {};
var controlFilterQueryForRisk = '';
var currentBenefitFocusForControlSelector = '';
var currentEditingRiskId = null;
var selectedActionPlansForRisk = [];
var lastActionPlanData = null;
var selectedRisksForPlan = [];
var riskFilterQueryForPlan = '';
var currentEditingActionPlanId = null;
var actionPlanFilterQueryForRisk = '';
var controlCreationContext = null;
var actionPlanCreationContext = null;
var riskBenefitsState = {
    undue: [],
    expected: []
};

function normalizeBenefitForMatching(value) {
    const raw = typeof value === 'string' ? value : (value != null ? String(value) : '');
    return raw
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/['’`"]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .split(/\s+/)
        .map(token => (token.length > 3 && token.endsWith('s') ? token.slice(0, -1) : token))
        .join(' ');
}

function buildBenefitsDictionary(kind) {
    const dictionary = new Map();
    const addValue = (candidate) => {
        const label = typeof candidate === 'string' ? candidate.trim() : (candidate != null ? String(candidate).trim() : '');
        if (!label) return;
        const normalized = normalizeBenefitForMatching(label);
        if (!normalized || dictionary.has(normalized)) return;
        dictionary.set(normalized, label);
    };

    const stateKey = kind === 'expected' ? 'expected' : 'undue';
    const riskKey = kind === 'expected' ? 'avantagesAttendus' : 'avantagesIndus';

    (riskBenefitsState[stateKey] || []).forEach(addValue);
    (rms?.risks || []).forEach(risk => {
        (risk?.[riskKey] || []).forEach(addValue);
    });

    return dictionary;
}

function findClosestExistingBenefitLabel(value, kind) {
    const source = typeof value === 'string' ? value.trim() : '';
    if (!source) return '';
    const normalized = normalizeBenefitForMatching(source);
    if (!normalized) return '';
    const tokens = new Set(normalized.split(' ').filter(Boolean));
    const dictionary = buildBenefitsDictionary(kind);

    if (dictionary.has(normalized)) {
        return dictionary.get(normalized) || '';
    }

    for (const [key, label] of dictionary.entries()) {
        if (!key) continue;
        if (key.includes(normalized) || normalized.includes(key)) {
            return label;
        }
        const keyTokens = new Set(key.split(' ').filter(Boolean));
        const intersection = [...tokens].filter(token => keyTokens.has(token)).length;
        const union = new Set([...tokens, ...keyTokens]).size;
        if (union > 0 && (intersection / union) >= 0.7) {
            return label;
        }
    }

    return '';
}

function refreshBenefitsAutocomplete(kind) {
    const datalist = document.getElementById(kind === 'expected' ? 'expectedBenefitsSuggestions' : 'undueBenefitsSuggestions');
    if (!datalist) return;
    const dictionary = buildBenefitsDictionary(kind);
    const options = Array.from(dictionary.values()).sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
    datalist.innerHTML = options
        .map(label => `<option value="${label.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}"></option>`)
        .join('');
}

function getSelectedValues(selectId) {
    const element = document.getElementById(selectId);
    if (!element) return [];
    return Array.from(element.selectedOptions || []).map(option => option.value).filter(Boolean);
}

function setSelectedValues(selectId, values) {
    const element = document.getElementById(selectId);
    if (!element) return;
    const selectedSet = new Set(Array.isArray(values) ? values : []);
    Array.from(element.options).forEach(option => {
        option.selected = selectedSet.has(option.value);
    });
}

function renderRiskChipList(kind) {
    const container = document.getElementById(kind === 'undue' ? 'undueBenefitsChips' : 'expectedBenefitsChips');
    if (!container) return;
    const chips = Array.isArray(riskBenefitsState[kind]) ? riskBenefitsState[kind] : [];
    container.innerHTML = chips.map((chip, index) => `
        <span class="risk-chip-item">
            ${chip}
            <button type="button" class="risk-chip-remove" onclick="removeRiskChip('${kind}', ${index})" aria-label="Delete ${chip}">×</button>
        </span>
    `).join('');
    if (kind === 'undue' || kind === 'expected') {
        refreshBenefitsAutocomplete(kind);
    }
    if (kind === 'undue') {
        renderBenefitFirstAssignment();
        updateSelectedControlsDisplay();
    }
}

function setRiskBenefitChips(kind, values) {
    const list = Array.isArray(values) ? values : [];
    const normalized = [];
    const seen = new Set();
    list.forEach(item => {
        const value = typeof item === 'string' ? item.trim() : (item != null ? String(item).trim() : '');
        if (!value) return;
        const key = value.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        normalized.push(value);
    });
    riskBenefitsState[kind] = normalized;
    renderRiskChipList(kind);
}
window.setRiskBenefitChips = setRiskBenefitChips;

function addRiskChip(kind) {
    const inputId = kind === 'undue' ? 'undueBenefitsInput' : 'expectedBenefitsInput';
    const input = document.getElementById(inputId);
    if (!input) return;
    const value = input.value.trim();
    if (!value) return;
    const resolvedValue = findClosestExistingBenefitLabel(value, kind) || value;
    const existing = Array.isArray(riskBenefitsState[kind]) ? riskBenefitsState[kind] : [];
    if (!existing.some(item => normalizeBenefitForMatching(item) === normalizeBenefitForMatching(resolvedValue))) {
        existing.push(resolvedValue);
        riskBenefitsState[kind] = existing;
    }
    input.value = '';
    renderRiskChipList(kind);
    if (rms && typeof rms.markUnsavedChange === 'function') {
        rms.markUnsavedChange('riskForm');
    }
}
window.addRiskChip = addRiskChip;

function removeRiskChip(kind, index) {
    const existing = Array.isArray(riskBenefitsState[kind]) ? riskBenefitsState[kind] : [];
    existing.splice(index, 1);
    riskBenefitsState[kind] = existing;
    Object.values(controlAssignmentsForRisk).forEach(assignment => {
        if (!assignment || !Array.isArray(assignment.avantagesIndus)) return;
        assignment.avantagesIndus = assignment.avantagesIndus.filter(label => existing.includes(label));
    });
    renderRiskChipList(kind);
    updateSelectedControlsDisplay();
    if (rms && typeof rms.markUnsavedChange === 'function') {
        rms.markUnsavedChange('riskForm');
    }
}
window.removeRiskChip = removeRiskChip;

function setRiskControlAssignments(assignments) {
    const next = {};
    (Array.isArray(assignments) ? assignments : []).forEach(entry => {
        if (!entry || entry.controlId == null) return;
        next[String(entry.controlId)] = {
            transverse: !!entry.transverse,
            avantagesIndus: Array.isArray(entry.avantagesIndus) ? [...entry.avantagesIndus] : []
        };
    });
    controlAssignmentsForRisk = next;
    renderBenefitFirstAssignment();
    updateSelectedControlsDisplay();
}
window.setRiskControlAssignments = setRiskControlAssignments;

function getRecommendedControlIdsForBenefit(label) {
    if (!label || !rms || !Array.isArray(rms.risks)) return [];
    const ids = new Set();
    rms.risks.forEach(risk => {
        if (currentEditingRiskId != null && idsEqual(risk?.id, currentEditingRiskId)) {
            return;
        }
        const assignments = Array.isArray(risk?.controlAssignments) ? risk.controlAssignments : [];
        assignments.forEach(entry => {
            if (!entry || entry.controlId == null) return;
            const undueBenefits = Array.isArray(entry.avantagesIndus) ? entry.avantagesIndus : [];
            if (undueBenefits.includes(label)) {
                ids.add(entry.controlId);
            }
        });
    });
    return Array.from(ids);
}

function getAssignedControlsForBenefit(label) {
    if (!label || !rms) return [];
    return selectedControlsForRisk.map(controlId => {
        const assignment = controlAssignmentsForRisk[String(controlId)] || {};
        if (!(assignment.avantagesIndus || []).includes(label)) {
            return null;
        }
        const control = rms.controls.find(ctrl => ctrl.id === controlId);
        return {
            id: controlId,
            name: control?.name || `#${controlId}`
        };
    }).filter(Boolean);
}

function renderBenefitFirstAssignment() {
    const container = document.getElementById('benefitFirstAssignment');
    if (!container) return;
    const undueBenefits = Array.isArray(riskBenefitsState.undue) ? riskBenefitsState.undue : [];
    if (!undueBenefits.length) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <div class="benefit-first-assignment-title">Assignment guided by undue benefit</div>
        <div class="benefit-first-assignment-grid">
            ${undueBenefits.map(label => {
                const linkedControls = getAssignedControlsForBenefit(label);
                const summary = linkedControls.length
                    ? linkedControls.slice(0, 2).map(item => item.name).join(' • ') + (linkedControls.length > 2 ? ` • +${linkedControls.length - 2}` : '')
                    : 'No linked control';
                const linkedHtml = linkedControls.length
                    ? `<div class="benefit-first-linked-controls">
                        ${linkedControls.map(item => `<span class="benefit-first-linked-chip">#${item.id} - ${item.name}</span>`).join('')}
                    </div>`
                    : '';
                return `
                    <div class="benefit-first-card">
                        <div>
                            <div class="benefit-first-label">${label}</div>
                            <div class="benefit-first-meta">${summary}</div>
                            ${linkedHtml}
                        </div>
                        <div class="benefit-first-actions">
                            <button type="button" class="btn btn-outline" onclick="openControlSelectorForBenefit('${encodeURIComponent(label)}')">Add control</button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}
window.renderBenefitFirstAssignment = renderBenefitFirstAssignment;

function openControlSelectorForBenefit(encodedLabel) {
    const label = decodeURIComponent(encodedLabel);
    currentBenefitFocusForControlSelector = label;
    openControlSelector();
}
window.openControlSelectorForBenefit = openControlSelectorForBenefit;

function clearControlBenefitFocus() {
    currentBenefitFocusForControlSelector = '';
    renderControlSelectionList();
}
window.clearControlBenefitFocus = clearControlBenefitFocus;

function selectRecommendedControlsForFocusedBenefit() {
    const label = currentBenefitFocusForControlSelector;
    if (!label) return;
    const recommendedIds = getRecommendedControlIdsForBenefit(label);
    recommendedIds.forEach(controlId => {
        if (!selectedControlsForRisk.includes(controlId)) {
            selectedControlsForRisk.push(controlId);
        }
        const key = String(controlId);
        if (!controlAssignmentsForRisk[key]) {
            controlAssignmentsForRisk[key] = { transverse: false, avantagesIndus: [] };
        }
        const benefits = controlAssignmentsForRisk[key].avantagesIndus || [];
        if (!benefits.includes(label)) {
            benefits.push(label);
        }
        controlAssignmentsForRisk[key].avantagesIndus = benefits;
        controlAssignmentsForRisk[key].transverse = false;
    });
    updateSelectedControlsDisplay();
    renderControlSelectionList();
    if (rms && typeof rms.markUnsavedChange === 'function') {
        rms.markUnsavedChange('riskForm');
    }
}
window.selectRecommendedControlsForFocusedBenefit = selectRecommendedControlsForFocusedBenefit;

const MODAL_Z_INDEX_STEP = 5;

function getModalBaseZIndex(modal) {
    if (!modal) return 2000;
    if (modal.dataset && modal.dataset.baseZIndex) {
        const cached = parseInt(modal.dataset.baseZIndex, 10);
        if (Number.isFinite(cached)) {
            return cached;
        }
    }

    const computed = parseInt(window.getComputedStyle(modal).zIndex, 10);
    const baseZIndex = Number.isFinite(computed) ? computed : 2000;
    if (modal.dataset) {
        modal.dataset.baseZIndex = baseZIndex;
    } else {
        modal.setAttribute('data-base-zindex', baseZIndex);
    }
    return baseZIndex;
}

function bringModalToFront(modal) {
    if (!modal) return;
    const baseZIndex = getModalBaseZIndex(modal);
    const openModals = Array.from(document.querySelectorAll('.modal.show')).filter(el => el !== modal);
    const highestZIndex = openModals.reduce((max, el) => {
        const value = parseInt(window.getComputedStyle(el).zIndex, 10);
        if (Number.isFinite(value) && value > max) {
            return value;
        }
        return max;
    }, Number.NEGATIVE_INFINITY);
    const referenceZIndex = Number.isFinite(highestZIndex) ? highestZIndex : baseZIndex;
    const targetZIndex = openModals.length > 0
        ? Math.max(baseZIndex, referenceZIndex + MODAL_Z_INDEX_STEP)
        : baseZIndex;

    modal.style.zIndex = targetZIndex;
    if (modal.dataset) {
        modal.dataset.activeZIndex = targetZIndex;
    } else {
        modal.setAttribute('data-active-zindex', targetZIndex);
    }
    modal.classList.add('show');
}

function resetModalZIndex(modal) {
    if (!modal) return;
    const baseZIndex = getModalBaseZIndex(modal);
    modal.style.zIndex = baseZIndex;
    if (modal.dataset) {
        delete modal.dataset.activeZIndex;
    } else {
        modal.removeAttribute('data-active-zindex');
    }
}

function hideModal(modal) {
    if (!modal) return;
    modal.classList.remove('show');
    resetModalZIndex(modal);
}

window.bringModalToFront = bringModalToFront;
function setAggravatingFactorsSelection(factors) {
    const groups = (typeof AGGRAVATING_FACTOR_GROUPS === 'object' && AGGRAVATING_FACTOR_GROUPS)
        ? AGGRAVATING_FACTOR_GROUPS
        : {
            group1: { inputName: 'aggravatingGroup1' },
            group2: { inputName: 'aggravatingGroup2' }
        };

    const normalized = typeof normalizeAggravatingFactors === 'function'
        ? normalizeAggravatingFactors(factors)
        : { group1: [], group2: [] };

    Object.entries(groups).forEach(([groupKey, config]) => {
        const inputName = config?.inputName || '';
        if (!inputName) {
            return;
        }

        const selector = `input[name="${inputName}"]`;
        const inputs = document.querySelectorAll(selector);
        const selectedValues = Array.isArray(normalized[groupKey]) ? normalized[groupKey] : [];

        inputs.forEach(input => {
            input.checked = selectedValues.includes(input.value);
        });
    });

    if (typeof calculateScore === 'function') {
        calculateScore('brut');
    }
}
window.setAggravatingFactorsSelection = setAggravatingFactorsSelection;

function getRiskCountriesSelect() {
    return document.getElementById('riskCountries');
}

function getAllRiskCountryValues() {
    const select = getRiskCountriesSelect();
    return select ? Array.from(select.options).map(option => option.value) : [];
}

function escapeRiskCountrySelector(value) {
    if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
        return CSS.escape(String(value));
    }
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
}

function applyRiskCountryCheckboxState(value, isSelected) {
    const select = getRiskCountriesSelect();
    if (!select) {
        return;
    }

    const option = Array.from(select.options).find(opt => opt.value === value);
    if (option) {
        option.selected = !!isSelected;
    }

    select.dispatchEvent(new Event('change', { bubbles: true }));
}
window.applyRiskCountryCheckboxState = applyRiskCountryCheckboxState;

function syncRiskCountryCheckboxesFromSelect() {
    const select = getRiskCountriesSelect();
    if (!select) {
        return;
    }

    const selectedValues = new Set(Array.from(select.selectedOptions).map(option => option.value));
    const checkboxes = document.querySelectorAll('.risk-country-checkbox[data-country-value]');
    checkboxes.forEach(checkbox => {
        const value = checkbox.dataset.countryValue || checkbox.value;
        const isSelected = selectedValues.has(value);
        checkbox.checked = isSelected;
        const chip = checkbox.closest('.risk-country-option');
        if (chip) {
            chip.classList.toggle('is-selected', isSelected);
        }
    });
}
window.syncRiskCountryCheckboxesFromSelect = syncRiskCountryCheckboxesFromSelect;

function selectRiskCountryColumn(columnKey) {
    if (!columnKey) {
        return;
    }
    const select = getRiskCountriesSelect();
    if (!select) {
        return;
    }

    const column = document.querySelector(`.risk-country-column[data-column-key="${escapeRiskCountrySelector(columnKey)}"]`);
    if (!column) {
        return;
    }

    const checkboxes = Array.from(column.querySelectorAll('input[type="checkbox"][data-country-value]'));
    if (!checkboxes.length) {
        return;
    }

    const values = [];
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
        values.push(checkbox.dataset.countryValue || checkbox.value);
    });

    const valueSet = new Set(values);
    Array.from(select.options).forEach(option => {
        if (valueSet.has(option.value)) {
            option.selected = true;
        }
    });

    select.dispatchEvent(new Event('change', { bubbles: true }));
    syncRiskCountryCheckboxesFromSelect();
}
window.selectRiskCountryColumn = selectRiskCountryColumn;

function deselectRiskCountryColumn(columnKey) {
    if (!columnKey) {
        return;
    }
    const select = getRiskCountriesSelect();
    if (!select) {
        return;
    }

    const column = document.querySelector(`.risk-country-column[data-column-key="${escapeRiskCountrySelector(columnKey)}"]`);
    if (!column) {
        return;
    }

    const checkboxes = Array.from(column.querySelectorAll('input[type="checkbox"][data-country-value]'));
    if (!checkboxes.length) {
        return;
    }

    const values = [];
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        values.push(checkbox.dataset.countryValue || checkbox.value);
    });

    const valueSet = new Set(values);
    Array.from(select.options).forEach(option => {
        if (valueSet.has(option.value)) {
            option.selected = false;
        }
    });

    select.dispatchEvent(new Event('change', { bubbles: true }));
    syncRiskCountryCheckboxesFromSelect();
}
window.deselectRiskCountryColumn = deselectRiskCountryColumn;

function setRiskCountriesSelection(values, options = {}) {
    const select = getRiskCountriesSelect();
    if (!select) {
        return;
    }

    const fallbackToAll = options.fallbackToAll !== false;
    const availableValues = getAllRiskCountryValues();
    const normalized = Array.isArray(values)
        ? values.filter(value => availableValues.includes(value))
        : [];
    const targetValues = normalized.length
        ? normalized
        : (fallbackToAll ? availableValues : []);
    const selectionSet = new Set(targetValues);
    Array.from(select.options).forEach(option => {
        option.selected = selectionSet.has(option.value);
    });

    syncRiskCountryCheckboxesFromSelect();
}

function selectAllRiskCountries() {
    setRiskCountriesSelection(getAllRiskCountryValues());
    const select = getRiskCountriesSelect();
    if (select) {
        select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    syncRiskCountryCheckboxesFromSelect();
}
window.selectAllRiskCountries = selectAllRiskCountries;

function deselectAllRiskCountries() {
    setRiskCountriesSelection([], { fallbackToAll: false });
    const select = getRiskCountriesSelect();
    if (select) {
        select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    syncRiskCountryCheckboxesFromSelect();
}
window.deselectAllRiskCountries = deselectAllRiskCountries;

const RISK_MULTI_SELECT_CHIP_CONFIG = {
    processus: { containerId: 'processusChips', defaultColor: '#2563eb' },
    sousProcessus: { containerId: 'sousProcessusChips', defaultColor: '#2563eb' },
    typeCorruption: { containerId: 'typeCorruptionChips', defaultColor: '#db2777' },
    tiers: { containerId: 'tiersChips', defaultColor: '#16a34a' }
};

function getRiskMultiSelectConfig(selectId) {
    return RISK_MULTI_SELECT_CHIP_CONFIG[selectId] || null;
}

const RISK_PROCESS_CHIP_PALETTE = [
    '#2563eb',
    '#7c3aed',
    '#db2777',
    '#ea580c',
    '#16a34a',
    '#0891b2',
    '#be123c',
    '#4f46e5'
];

function buildRiskProcessChipColorMap() {
    const map = new Map();
    const processSelect = document.getElementById('processus');
    if (!processSelect) {
        return map;
    }

    Array.from(processSelect.options).forEach((option, index) => {
        map.set(option.value, RISK_PROCESS_CHIP_PALETTE[index % RISK_PROCESS_CHIP_PALETTE.length]);
    });

    return map;
}

function resolveParentProcessForSubProcess(subProcessValue) {
    if (!subProcessValue || !window.rms || !rms.config || !rms.config.subProcesses) {
        return '';
    }

    const entries = Object.entries(rms.config.subProcesses);
    for (const [processValue, subProcesses] of entries) {
        if (!Array.isArray(subProcesses)) {
            continue;
        }
        const match = subProcesses.some(item => item && item.value === subProcessValue);
        if (match) {
            return processValue;
        }
    }

    return '';
}

function resolveRiskMultiChipColor(selectId, optionValue, processColorMap) {
    const config = getRiskMultiSelectConfig(selectId);
    const defaultColor = config?.defaultColor || '#2563eb';

    if (selectId === 'processus') {
        return processColorMap.get(optionValue) || defaultColor;
    }

    if (selectId === 'sousProcessus') {
        const parentProcess = resolveParentProcessForSubProcess(optionValue);
        return processColorMap.get(parentProcess) || defaultColor;
    }

    return defaultColor;
}

function applyRiskMultiSelectValue(selectId, value, isSelected) {
    const select = document.getElementById(selectId);
    if (!select) {
        return;
    }
    const option = Array.from(select.options).find(opt => opt.value === value);
    if (!option) {
        return;
    }
    option.selected = !!isSelected;
    select.dispatchEvent(new Event('change', { bubbles: true }));
}

function syncRiskMultiSelectChipsFromSelect(selectId) {
    const config = getRiskMultiSelectConfig(selectId);
    const select = document.getElementById(selectId);
    if (!config || !select) {
        return;
    }

    const container = document.getElementById(config.containerId);
    if (!container) {
        return;
    }

    const selectedValues = new Set(Array.from(select.selectedOptions).map(option => option.value));
    const checkboxes = container.querySelectorAll('input[type="checkbox"][data-risk-multi-value]');
    checkboxes.forEach(checkbox => {
        const value = checkbox.dataset.riskMultiValue || checkbox.value;
        const isSelected = selectedValues.has(value);
        checkbox.checked = isSelected;
        const chip = checkbox.closest('.risk-multi-chip-option');
        if (chip) {
            chip.classList.toggle('is-selected', isSelected);
        }
    });
}
window.syncRiskMultiSelectChipsFromSelect = syncRiskMultiSelectChipsFromSelect;

function renderRiskMultiSelectChips(selectId) {
    const config = getRiskMultiSelectConfig(selectId);
    const select = document.getElementById(selectId);
    if (!config || !select) {
        return;
    }

    const container = document.getElementById(config.containerId);
    if (!container) {
        return;
    }

    const selectedValues = new Set(Array.from(select.selectedOptions).map(option => option.value));
    const options = Array.from(select.options).map(option => ({
        value: option.value,
        label: option.textContent || option.value
    }));

    container.innerHTML = '';
    const processColorMap = buildRiskProcessChipColorMap();

    options.forEach(entry => {
        const optionLabel = document.createElement('label');
        optionLabel.className = 'risk-multi-chip-option';
        optionLabel.dataset.riskMultiValue = entry.value;
        optionLabel.style.setProperty('--risk-chip-color', resolveRiskMultiChipColor(selectId, entry.value, processColorMap));
        if (selectedValues.has(entry.value)) {
            optionLabel.classList.add('is-selected');
        }

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = entry.value;
        checkbox.dataset.riskMultiValue = entry.value;
        checkbox.checked = selectedValues.has(entry.value);
        checkbox.addEventListener('change', () => {
            applyRiskMultiSelectValue(selectId, entry.value, checkbox.checked);
            syncRiskMultiSelectChipsFromSelect(selectId);
        });
        optionLabel.appendChild(checkbox);

        const text = document.createElement('span');
        text.textContent = entry.label;
        optionLabel.appendChild(text);

        container.appendChild(optionLabel);
    });

    if (!select.dataset.riskMultiSyncAttached) {
        select.addEventListener('change', () => {
            syncRiskMultiSelectChipsFromSelect(selectId);
        });
        select.dataset.riskMultiSyncAttached = 'true';
    }

    syncRiskMultiSelectChipsFromSelect(selectId);
}
window.renderRiskMultiSelectChips = renderRiskMultiSelectChips;

function renderAllRiskMultiSelectChips() {
    Object.keys(RISK_MULTI_SELECT_CHIP_CONFIG).forEach(selectId => {
        renderRiskMultiSelectChips(selectId);
    });
}
window.renderAllRiskMultiSelectChips = renderAllRiskMultiSelectChips;

function addNewRisk() {
    currentEditingRiskId = null;
    const form = document.getElementById('riskForm');
    if (form) {
        form.reset();

        const statutSelect = document.getElementById('statut');
        if (lastRiskData) {
            setSelectedValues('processus', lastRiskData.processusAssocies || (lastRiskData.processus ? [lastRiskData.processus] : []));
            rms.updateSousProcessusOptions();
            setSelectedValues('sousProcessus', lastRiskData.sousProcessusAssocies || (lastRiskData.sousProcessus ? [lastRiskData.sousProcessus] : []));
            setSelectedValues('typeCorruption', lastRiskData.typesCorruption || (lastRiskData.typeCorruption ? [lastRiskData.typeCorruption] : []));
            setSelectedValues('tiers', lastRiskData.tiers || []);

            setRiskCountriesSelection(lastRiskData.paysExposes || []);

            document.getElementById('description').value = lastRiskData.description || '';
            document.getElementById('probBrut').value = lastRiskData.probBrut || 1;
            document.getElementById('impactBrut').value = lastRiskData.impactBrut || 1;
            const mitigationInput = document.getElementById('mitigationEffectiveness');
            const probNetInput = document.getElementById('probNet');
            const impactNetInput = document.getElementById('impactNet');
            const defaultMitigation = typeof DEFAULT_MITIGATION_EFFECTIVENESS === 'string'
                ? DEFAULT_MITIGATION_EFFECTIVENESS
                : 'insuffisant';
            const mitigationLevel = lastRiskData.mitigationEffectiveness || defaultMitigation;
            if (mitigationInput) {
                mitigationInput.value = mitigationLevel;
            }
            if (probNetInput && typeof getMitigationColumnFromLevel === 'function') {
                probNetInput.value = getMitigationColumnFromLevel(mitigationLevel);
            }
            if (impactNetInput) {
                impactNetInput.value = lastRiskData.impactNet || impactNetInput.value || 1;
            }
            selectedControlsForRisk = [...(lastRiskData.controls || [])];
            setRiskControlAssignments(lastRiskData.controlAssignments || []);
            setRiskBenefitChips('undue', lastRiskData.avantagesIndus || []);
            setRiskBenefitChips('expected', lastRiskData.avantagesAttendus || []);
            selectedActionPlansForRisk = [...(lastRiskData.actionPlans || [])];
            setAggravatingFactorsSelection(lastRiskData.aggravatingFactors || null);
        } else {
            rms.updateSousProcessusOptions();
            selectedControlsForRisk = [];
            setRiskControlAssignments([]);
            setRiskBenefitChips('undue', []);
            setRiskBenefitChips('expected', []);
            selectedActionPlansForRisk = [];
            setAggravatingFactorsSelection(null);
            setRiskCountriesSelection([]);
            const mitigationInput = document.getElementById('mitigationEffectiveness');
            const probNetInput = document.getElementById('probNet');
            const impactNetInput = document.getElementById('impactNet');
            const defaultMitigation = typeof DEFAULT_MITIGATION_EFFECTIVENESS === 'string'
                ? DEFAULT_MITIGATION_EFFECTIVENESS
                : 'insuffisant';
            if (mitigationInput) {
                mitigationInput.value = defaultMitigation;
            }
            if (probNetInput && typeof getMitigationColumnFromLevel === 'function') {
                probNetInput.value = getMitigationColumnFromLevel(defaultMitigation);
            }
            if (impactNetInput) {
                impactNetInput.value = impactNetInput.value || 1;
            }
        }
        renderAllRiskMultiSelectChips();

        if (statutSelect) {
            const defaultStatus = rms?.config?.riskStatuses?.[0]?.value || '';
            const targetStatus = lastRiskData?.statut || defaultStatus;
            if (targetStatus) {
                const normalized = String(targetStatus);
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

        calculateScore('brut');
        calculateScore('net');
        updateSelectedControlsDisplay();
        updateSelectedActionPlansDisplay();
    }
    activeRiskEditState = 'brut';
    const modal = document.getElementById('riskModal');
    if (modal) {
        bringModalToFront(modal);
        requestAnimationFrame(() => initRiskEditMatrix());
    }
}
window.addNewRisk = addNewRisk;

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    hideModal(modal);
}
window.closeModal = closeModal;

window.getSelectedActionPlansForRisk = () => selectedActionPlansForRisk;
function saveRisk() {
    if (!rms) return;

    const aggravatingSelection = typeof getFormAggravatingSelection === 'function'
        ? getFormAggravatingSelection()
        : { group1: [], group2: [], coefficient: 1 };

    const aggravatingFactors = typeof normalizeAggravatingFactors === 'function'
        ? normalizeAggravatingFactors(aggravatingSelection)
        : { group1: [], group2: [] };

    const rawCoefficient = Number(aggravatingSelection?.coefficient);
    const aggravatingCoefficient = Number.isFinite(rawCoefficient) && rawCoefficient >= 1
        ? Math.round(rawCoefficient * 100) / 100
        : 1;

    const countriesSelect = document.getElementById('riskCountries');

    const processusAssocies = getSelectedValues('processus');
    const sousProcessusAssocies = getSelectedValues('sousProcessus');
    const typesCorruption = getSelectedValues('typeCorruption');

    const controlAssignments = selectedControlsForRisk.map(controlId => {
        const key = String(controlId);
        const assignment = controlAssignmentsForRisk[key] || {};
        const selectedUndueBenefits = Array.isArray(assignment.avantagesIndus)
            ? assignment.avantagesIndus.filter(label => (riskBenefitsState.undue || []).includes(label))
            : [];
        return {
            controlId,
            transverse: !!assignment.transverse,
            avantagesIndus: selectedUndueBenefits
        };
    });

    const formData = {
        processus: processusAssocies[0] || '',
        processusAssocies,
        sousProcessus: sousProcessusAssocies[0] || '',
        sousProcessusAssocies,
        description: document.getElementById('description').value,
        typeCorruption: typesCorruption[0] || '',
        typesCorruption,
        statut: document.getElementById('statut').value,
        tiers: Array.from(document.getElementById('tiers').selectedOptions).map(o => o.value),
        avantagesIndus: [...(riskBenefitsState.undue || [])],
        avantagesAttendus: [...(riskBenefitsState.expected || [])],
        paysExposes: countriesSelect
            ? Array.from(countriesSelect.selectedOptions).map(o => o.value)
            : [],
        probBrut: parseInt(document.getElementById('probBrut').value),
        impactBrut: parseInt(document.getElementById('impactBrut').value),
        probNet: parseInt(document.getElementById('probNet').value),
        impactNet: parseInt(document.getElementById('impactNet').value),
        mitigationEffectiveness: document.getElementById('mitigationEffectiveness').value,
        aggravatingFactors,
        aggravatingCoefficient,
        controls: [...selectedControlsForRisk],
        controlAssignments,
        actionPlans: [...selectedActionPlansForRisk]
    };

    formData.probPost = formData.probNet;
    formData.impactPost = formData.impactNet;

    const isIncompleteRisk = !formData.processusAssocies.length
        || !formData.description
        || !formData.typesCorruption.length
        || !formData.statut;
    if (isIncompleteRisk) {
        formData.statut = 'brouillon';
    }

    if (currentEditingRiskId) {
        const targetId = String(currentEditingRiskId);
        const riskIndex = rms.risks.findIndex(r => idsEqual(r.id, targetId));
        if (riskIndex !== -1) {
            const updatedRisk = typeof rms.normalizeRisk === 'function'
                ? rms.normalizeRisk({ ...rms.risks[riskIndex], ...formData })
                : { ...rms.risks[riskIndex], ...formData };
            rms.risks[riskIndex] = updatedRisk;

            // Update control links
            rms.controls.forEach(control => {
                control.risks = control.risks || [];
                if (selectedControlsForRisk.includes(control.id)) {
                    if (!control.risks.some(id => idsEqual(id, targetId))) {
                        control.risks.push(rms.risks[riskIndex].id);
                    }
                } else {
                    control.risks = control.risks.filter(id => !idsEqual(id, targetId));
                }
            });

            rms.actionPlans.forEach(plan => {
                plan.risks = plan.risks || [];
                if (selectedActionPlansForRisk.includes(plan.id)) {
                    if (!plan.risks.some(id => idsEqual(id, targetId))) {
                        plan.risks.push(rms.risks[riskIndex].id);
                    }
                } else {
                    plan.risks = plan.risks.filter(id => !idsEqual(id, targetId));
                }
            });

            rms.saveData();
            rms.init();
            closeModal('riskModal');
            if (isIncompleteRisk) {
                showNotification('info', 'Incomplete risk saved as draft');
            } else {
                showNotification('success', 'Risk updated successfully!');
            }
            currentEditingRiskId = null;
        }
    } else {
        const newRisk = rms.addRisk(formData);

        selectedControlsForRisk.forEach(controlId => {
            const ctrl = rms.controls.find(c => c.id === controlId);
            if (ctrl) {
                ctrl.risks = ctrl.risks || [];
                if (!ctrl.risks.includes(newRisk.id)) {
                    ctrl.risks.push(newRisk.id);
                }
            }
        });

        selectedActionPlansForRisk.forEach(planId => {
            const plan = rms.actionPlans.find(p => p.id === planId);
            if (plan) {
                plan.risks = plan.risks || [];
                if (!plan.risks.includes(newRisk.id)) {
                    plan.risks.push(newRisk.id);
                }
            }
        });

        rms.saveData();
        rms.renderAll();
        closeModal('riskModal');
        if (isIncompleteRisk) {
            showNotification('info', 'Incomplete risk saved as draft');
        } else {
            showNotification('success', 'Risk added successfully!');
        }
    }

    if (rms) {
        rms.renderRiskPoints();
        rms.updateRiskDetailsList();
    }

    lastRiskData = {
        ...formData,
        tiers: [...formData.tiers],
        paysExposes: [...formData.paysExposes],
        controls: [...formData.controls],
        controlAssignments: [...formData.controlAssignments],
        actionPlans: [...formData.actionPlans],
        aggravatingFactors: typeof normalizeAggravatingFactors === 'function'
            ? normalizeAggravatingFactors(formData.aggravatingFactors)
            : { group1: [], group2: [] }
    };

    if (rms && typeof rms.clearUnsavedChanges === 'function') {
        rms.clearUnsavedChanges('riskForm');
    }
}
window.saveRisk = saveRisk;

function applyMatrixRiskMove(riskId, probability, impact) {
    if (!rms || !window.matrixEditMode) return;
    const risk = Array.isArray(rms.risks) ? rms.risks.find(item => idsEqual(item.id, riskId)) : null;
    if (!risk) return;

    const nextProb = Math.min(4, Math.max(1, parseInt(probability, 10) || 1));
    const nextImpact = Math.min(4, Math.max(1, parseInt(impact, 10) || 1));
    risk.probBrut = nextProb;
    risk.impactBrut = nextImpact;

    const normalizedRisk = typeof rms.normalizeRisk === 'function'
        ? rms.normalizeRisk(risk)
        : risk;
    const index = rms.risks.findIndex(item => idsEqual(item.id, riskId));
    if (index > -1) {
        rms.risks[index] = normalizedRisk;
    }

    rms.saveData();
    rms.renderRiskPoints();
    rms.updateRiskDetailsList();
}
window.applyMatrixRiskMove = applyMatrixRiskMove;

function openControlSelector() {
    controlFilterQueryForRisk = '';
    const searchInput = document.getElementById('controlSearchInput');
    if (searchInput) searchInput.value = '';
    renderControlSelectionList();
    const modal = document.getElementById('controlSelectorModal');
    if (modal) {
        bringModalToFront(modal);
    }
}
window.openControlSelector = openControlSelector;

function createControlFromRisk() {
    const benefitLabel = currentBenefitFocusForControlSelector || null;
    controlCreationContext = {
        fromRisk: true,
        riskId: currentEditingRiskId != null ? currentEditingRiskId : null,
        benefitLabel,
        transverse: !benefitLabel
    };
    closeControlSelector();
    if (typeof addNewControl === 'function') {
        addNewControl();
    }
}
window.createControlFromRisk = createControlFromRisk;

function renderControlSelectionList() {
    const list = document.getElementById('controlList');
    if (!list || !rms) return;
    const focusContainer = document.getElementById('controlBenefitFocus');
    const focusLabel = currentBenefitFocusForControlSelector;
    const recommendedIds = getRecommendedControlIdsForBenefit(focusLabel);
    const recommendedSet = new Set(recommendedIds);
    if (focusContainer) {
        focusContainer.innerHTML = '';
    }
    const query = controlFilterQueryForRisk.toLowerCase();
    const typeMap = Array.isArray(rms.config?.controlTypes)
        ? rms.config.controlTypes.reduce((acc, item) => {
            if (!item || item.value == null) return acc;
            acc[String(item.value).toLowerCase()] = item.label || item.value;
            return acc;
        }, {})
        : {};
    const originMap = Array.isArray(rms.config?.controlOrigins)
        ? rms.config.controlOrigins.reduce((acc, item) => {
            if (!item || item.value == null) return acc;
            acc[String(item.value).toLowerCase()] = item.label || item.value;
            return acc;
        }, {})
        : {};
    const availableControls = rms.controls.filter(ctrl => {
        const name = (ctrl.name || '').toLowerCase();
        return String(ctrl.id).includes(query) || name.includes(query);
    });
    const recommendedControls = focusLabel
        ? availableControls.filter(ctrl => recommendedSet.has(ctrl.id))
        : [];
    const otherControls = focusLabel
        ? availableControls.filter(ctrl => !recommendedSet.has(ctrl.id))
        : availableControls;
    const renderControlItem = ctrl => {
        const key = String(ctrl.id);
        const assignment = controlAssignmentsForRisk[key] || {};
        const isSelected = focusLabel
            ? (assignment.avantagesIndus || []).includes(focusLabel)
            : !!assignment.transverse;
        const typeKey = ctrl?.type != null ? String(ctrl.type).toLowerCase() : '';
        const typeLabel = typeKey ? (typeMap[typeKey] || ctrl.type || '') : '';
        const originKey = ctrl?.origin != null ? String(ctrl.origin).toLowerCase() : '';
        const originLabel = originKey ? (originMap[originKey] || ctrl.origin || '') : '';
        const ownerLabel = ctrl?.owner || '';
        const controlName = ctrl?.name || 'Unnamed';
        return `
            <div class="risk-list-item">
              <input type="checkbox" id="control-${ctrl.id}" ${isSelected ? 'checked' : ''} onchange="toggleControlSelection(${ctrl.id})">
              <div class="risk-item-info">
                <div class="risk-item-title">#${ctrl.id} - ${controlName}</div>
                <div class="risk-item-meta">Type: ${typeLabel || 'Undefined'} | Origin: ${originLabel || 'Undefined'} | Owner: ${ownerLabel || 'Undefined'}</div>
                ${focusLabel && recommendedSet.has(ctrl.id) ? '<div class="risk-item-hint">Recommended for this undue benefit</div>' : ''}
              </div>
            </div>`;
    };
    const sections = [];
    if (focusLabel) {
        sections.push(`
            <div class="risk-list-section-title">
                Controls already assigned to this benefit in other risks (${recommendedControls.length})
            </div>
            ${recommendedControls.length ? recommendedControls.map(renderControlItem).join('') : '<div class="risk-list-empty">No recommended control found.</div>'}
        `);
        sections.push(`
            <div class="risk-list-section-title">
                Other available controls (${otherControls.length})
            </div>
            ${otherControls.length ? otherControls.map(renderControlItem).join('') : '<div class="risk-list-empty">No other control available.</div>'}
        `);
    } else {
        sections.push(otherControls.map(renderControlItem).join(''));
    }
    list.innerHTML = sections.join('');
}

function filterControlsForRisk(query) {
    controlFilterQueryForRisk = query;
    renderControlSelectionList();
}
window.filterControlsForRisk = filterControlsForRisk;

function closeControlSelector() {
    currentBenefitFocusForControlSelector = '';
    closeModal('controlSelectorModal');
}
window.closeControlSelector = closeControlSelector;

function toggleControlSelection(controlId) {
    const index = selectedControlsForRisk.indexOf(controlId);
    const key = String(controlId);
    const focusedBenefit = currentBenefitFocusForControlSelector;

    if (focusedBenefit) {
        if (index === -1) {
            selectedControlsForRisk.push(controlId);
        }

        if (!controlAssignmentsForRisk[key]) {
            controlAssignmentsForRisk[key] = { transverse: false, avantagesIndus: [] };
        }

        const entry = controlAssignmentsForRisk[key];
        entry.avantagesIndus = Array.isArray(entry.avantagesIndus) ? entry.avantagesIndus : [];
        const hasFocusedBenefit = entry.avantagesIndus.includes(focusedBenefit);

        if (hasFocusedBenefit) {
            entry.avantagesIndus = entry.avantagesIndus.filter(label => label !== focusedBenefit);
            if (!entry.transverse && entry.avantagesIndus.length === 0) {
                selectedControlsForRisk = selectedControlsForRisk.filter(id => id !== controlId);
                delete controlAssignmentsForRisk[key];
            }
        } else {
            entry.avantagesIndus.push(focusedBenefit);
            entry.transverse = false;
        }
    } else if (index > -1) {
        selectedControlsForRisk.splice(index, 1);
        delete controlAssignmentsForRisk[key];
    } else {
        selectedControlsForRisk.push(controlId);
        if (!controlAssignmentsForRisk[key]) {
            controlAssignmentsForRisk[key] = { transverse: true, avantagesIndus: [] };
        }
    }
    updateSelectedControlsDisplay();
    renderControlSelectionList();
    if (rms && typeof rms.markUnsavedChange === 'function') {
        rms.markUnsavedChange('riskForm');
    }
}
window.toggleControlSelection = toggleControlSelection;

function confirmControlSelection() {
    renderBenefitFirstAssignment();
    updateSelectedControlsDisplay();
    closeControlSelector();
}
window.confirmControlSelection = confirmControlSelection;

function updateSelectedControlsDisplay() {
    const container = document.getElementById('riskControls');
    if (!container) return;
    const transverseControls = selectedControlsForRisk.map(id => {
        const assignment = controlAssignmentsForRisk[String(id)];
        if (!assignment?.transverse) return null;
        const ctrl = rms.controls.find(c => c.id === id);
        if (!ctrl) return null;
        return `<span class="transverse-control-chip">#${id} - ${ctrl.name || 'Unnamed'} <button type="button" class="transverse-control-remove-btn" onclick="removeControlFromSelection(${id})" aria-label="Remove cross-functional control #${id}">×</button></span>`;
    }).filter(Boolean);
    const transverseSection = transverseControls.length
        ? `<div class="transverse-controls-section">
                <div class="transverse-controls-title">Cross-functional controls</div>
                <div class="transverse-controls-list">${transverseControls.join('')}</div>
           </div>`
        : '<div style="color: #7f8c8d; font-style: italic;">No cross-functional control selected</div>';
    container.innerHTML = transverseSection;
    renderBenefitFirstAssignment();
}
window.updateSelectedControlsDisplay = updateSelectedControlsDisplay;

function removeControlFromSelection(controlId) {
    selectedControlsForRisk = selectedControlsForRisk.filter(id => id !== controlId);
    delete controlAssignmentsForRisk[String(controlId)];
    updateSelectedControlsDisplay();
    if (rms && typeof rms.markUnsavedChange === 'function') {
        rms.markUnsavedChange('riskForm');
    }
}
window.removeControlFromSelection = removeControlFromSelection;

function toggleControlAssignmentBenefit(controlId, encodedLabel) {
    const label = decodeURIComponent(encodedLabel);
    const key = String(controlId);
    if (!controlAssignmentsForRisk[key]) {
        controlAssignmentsForRisk[key] = { transverse: false, avantagesIndus: [] };
    }
    const current = controlAssignmentsForRisk[key].avantagesIndus || [];
    const index = current.indexOf(label);
    if (index >= 0) {
        current.splice(index, 1);
    } else {
        current.push(label);
    }
    controlAssignmentsForRisk[key].avantagesIndus = current;
    updateSelectedControlsDisplay();
    if (rms && typeof rms.markUnsavedChange === 'function') {
        rms.markUnsavedChange('riskForm');
    }
}
window.toggleControlAssignmentBenefit = toggleControlAssignmentBenefit;

function updateSelectedActionPlansDisplay() {
    const container = document.getElementById('riskActionPlans');
    if (!container) return;
    if (selectedActionPlansForRisk.length === 0) {
        container.innerHTML = '<div style="color: #7f8c8d; font-style: italic;">No action plan selected</div>';
        return;
    }
    container.innerHTML = selectedActionPlansForRisk.map(id => {
        const plan = rms.actionPlans.find(p => p.id === id);
        if (!plan) return '';
        const title = plan.title || 'Untitled';
        return `
            <div class="selected-control-item">
              #${id} - ${title.substring(0, 50)}${title.length > 50 ? '...' : ''}
              <span class="remove-control" onclick="removeActionPlanFromSelection(${id})">×</span>
            </div>`;
    }).join('');
}
window.updateSelectedActionPlansDisplay = updateSelectedActionPlansDisplay;

function removeActionPlanFromSelection(planId) {
    selectedActionPlansForRisk = selectedActionPlansForRisk.filter(id => id !== planId);
    updateSelectedActionPlansDisplay();
    if (rms && typeof rms.markUnsavedChange === 'function') {
        rms.markUnsavedChange('riskForm');
    }
}
window.removeActionPlanFromSelection = removeActionPlanFromSelection;

function openActionPlanSelector() {
    actionPlanFilterQueryForRisk = '';
    const searchInput = document.getElementById('actionPlanSearchInput');
    if (searchInput) searchInput.value = '';
    renderActionPlanSelectionList();
    const modal = document.getElementById('actionPlanSelectorModal');
    if (modal) {
        bringModalToFront(modal);
    }
}
window.openActionPlanSelector = openActionPlanSelector;

function createActionPlanFromRisk() {
    actionPlanCreationContext = {
        fromRisk: true,
        riskId: currentEditingRiskId != null ? currentEditingRiskId : null
    };
    closeActionPlanSelector();
    if (typeof addNewActionPlan === 'function') {
        addNewActionPlan();
    }
}
window.createActionPlanFromRisk = createActionPlanFromRisk;

function renderActionPlanSelectionList() {
    const list = document.getElementById('actionPlanList');
    if (!list) return;
    const query = actionPlanFilterQueryForRisk.toLowerCase();
    list.innerHTML = rms.actionPlans.filter(plan => {
        const title = (plan.title || '').toLowerCase();
        return String(plan.id).includes(query) || title.includes(query);
    }).map(plan => {
        const isSelected = selectedActionPlansForRisk.includes(plan.id);
        const title = plan.title || 'Untitled';
        return `
            <div class="risk-list-item">
              <input type="checkbox" id="action-plan-${plan.id}" ${isSelected ? 'checked' : ''} onchange="toggleActionPlanSelection(${plan.id})">
              <div class="risk-item-info">
                <div class="risk-item-title">#${plan.id} - ${title}</div>
              </div>
            </div>`;
    }).join('');
}

window.filterActionPlansForRisk = function(query) {
    actionPlanFilterQueryForRisk = query;
    renderActionPlanSelectionList();
};

function closeActionPlanSelector() {
    closeModal('actionPlanSelectorModal');
}
window.closeActionPlanSelector = closeActionPlanSelector;

function toggleActionPlanSelection(planId) {
    const index = selectedActionPlansForRisk.indexOf(planId);
    if (index > -1) {
        selectedActionPlansForRisk.splice(index, 1);
    } else {
        selectedActionPlansForRisk.push(planId);
    }
    if (rms && typeof rms.markUnsavedChange === 'function') {
        rms.markUnsavedChange('riskForm');
    }
}
window.toggleActionPlanSelection = toggleActionPlanSelection;

function confirmActionPlanSelection() {
    updateSelectedActionPlansDisplay();
    closeActionPlanSelector();
}
window.confirmActionPlanSelection = confirmActionPlanSelection;

function populatePlanOwnerSuggestions() {
    const datalist = document.getElementById('planOwnerSuggestions');
    if (!datalist) return;

    datalist.innerHTML = '';

    if (!window.rms || !Array.isArray(rms.actionPlans)) {
        return;
    }

    const uniqueOwners = Array.from(new Set(
        rms.actionPlans
            .map(plan => (plan && typeof plan.owner === 'string') ? plan.owner.trim() : '')
            .filter(owner => owner)
    ));

    uniqueOwners.forEach(owner => {
        const option = document.createElement('option');
        option.value = owner;
        datalist.appendChild(option);
    });
}

function addNewActionPlan() {
    currentEditingActionPlanId = null;
    const form = document.getElementById('actionPlanForm');
    if (form) {
        form.reset();
        selectedRisksForPlan = [];
        if (lastActionPlanData) {
            document.getElementById('planTitle').value = lastActionPlanData.title || '';
            document.getElementById('planOwner').value = lastActionPlanData.owner || '';
            document.getElementById('planDueDate').value = lastActionPlanData.dueDate || '';
            document.getElementById('planStatus').value = lastActionPlanData.status || '';
            document.getElementById('planDescription').value = lastActionPlanData.description || '';
            selectedRisksForPlan = [...(lastActionPlanData.risks || [])];
        }
        const contextRiskId = (actionPlanCreationContext && actionPlanCreationContext.riskId != null)
            ? actionPlanCreationContext.riskId
            : null;
        if (contextRiskId != null && !selectedRisksForPlan.some(id => idsEqual(id, contextRiskId))) {
            selectedRisksForPlan.push(contextRiskId);
        }
        updateSelectedRisksForPlanDisplay();
    }
    document.getElementById('actionPlanModalTitle').textContent = 'New Action Plan';
    populatePlanOwnerSuggestions();
    const modal = document.getElementById('actionPlanModal');
    if (modal) {
        bringModalToFront(modal);
    }
}
window.addNewActionPlan = addNewActionPlan;

function editActionPlan(planId) {
    const plan = rms.actionPlans.find(p => p.id == planId);
    if (!plan) return;
    currentEditingActionPlanId = planId;
    const form = document.getElementById('actionPlanForm');
    if (form) {
        document.getElementById('planTitle').value = plan.title || '';
        document.getElementById('planOwner').value = plan.owner || '';
        document.getElementById('planDueDate').value = plan.dueDate || '';
        document.getElementById('planStatus').value = plan.status || '';
        document.getElementById('planDescription').value = plan.description || '';
        selectedRisksForPlan = plan.risks ? [...plan.risks] : [];
        updateSelectedRisksForPlanDisplay();
    }
    document.getElementById('actionPlanModalTitle').textContent = 'Edit Action Plan';
    populatePlanOwnerSuggestions();
    const modal = document.getElementById('actionPlanModal');
    if (modal) {
        bringModalToFront(modal);
    }
}
window.editActionPlan = editActionPlan;

function deleteActionPlan(planId) {
    const index = rms.actionPlans.findIndex(p => p.id == planId);
    if (index === -1) return;
    const title = rms.actionPlans[index].title;
    rms.actionPlans.splice(index,1);
    rms.risks.forEach(risk => {
        if (risk.actionPlans) {
            risk.actionPlans = risk.actionPlans.filter(id => id !== planId);
        }
    });
    rms.saveData();
    rms.renderAll();
    showNotification('success', `Plan "${title}" deleted`);
}
window.deleteActionPlan = deleteActionPlan;

function closeActionPlanModal() {
    closeModal('actionPlanModal');
    if (actionPlanCreationContext && actionPlanCreationContext.fromRisk) {
        actionPlanCreationContext = null;
    }
}
window.closeActionPlanModal = closeActionPlanModal;

function saveActionPlan() {
    const form = document.getElementById('actionPlanForm');
    if (!form) return;
    const formData = new FormData(form);
    const planTitle = String(formData.get('title') || '').trim();
    const planData = {
        title: planTitle,
        owner: formData.get('owner').trim(),
        dueDate: formData.get('dueDate'),
        status: formData.get('status'),
        description: formData.get('description').trim(),
        risks: [...selectedRisksForPlan]
    };
    const isDraftPlan = !planData.title;
    if (isDraftPlan) {
        planData.title = `Untitled draft (${new Date().toLocaleDateString('en-US')})`;
    }
    if (!planData.status || isDraftPlan) {
        planData.status = 'brouillon';
    }

    let resultingPlanId = currentEditingActionPlanId || null;
    const context = (actionPlanCreationContext && actionPlanCreationContext.fromRisk)
        ? actionPlanCreationContext
        : null;

    if (currentEditingActionPlanId) {
        const idx = rms.actionPlans.findIndex(p => p.id == currentEditingActionPlanId);
        if (idx !== -1) {
            rms.actionPlans[idx] = { ...rms.actionPlans[idx], ...planData };
            rms.risks.forEach(risk => {
                risk.actionPlans = risk.actionPlans || [];
                if (planData.risks.some(id => idsEqual(id, risk.id))) {
                    if (!risk.actionPlans.some(id => idsEqual(id, currentEditingActionPlanId))) {
                        risk.actionPlans.push(currentEditingActionPlanId);
                    }
                } else {
                    risk.actionPlans = risk.actionPlans.filter(id => !idsEqual(id, currentEditingActionPlanId));
                }
            });
            if (isDraftPlan) {
                showNotification('info', 'Incomplete plan saved as draft');
            } else {
                showNotification('success', `Plan "${planData.title}" updated`);
            }
        }
    } else {
        const newPlan = { id: getNextSequentialId(rms.actionPlans), ...planData };
        rms.actionPlans.push(newPlan);
        resultingPlanId = newPlan.id;
        planData.risks.forEach(rid => {
            const risk = rms.risks.find(r => idsEqual(r.id, rid));
            if (risk) {
                risk.actionPlans = risk.actionPlans || [];
                if (!risk.actionPlans.some(id => idsEqual(id, newPlan.id))) risk.actionPlans.push(newPlan.id);
            }
        });
        if (isDraftPlan) {
            showNotification('info', 'Incomplete plan saved as draft');
        } else {
            showNotification('success', `Plan "${planData.title}" created`);
        }
    }

    if (context && resultingPlanId != null) {
        if (!selectedActionPlansForRisk.some(id => idsEqual(id, resultingPlanId))) {
            selectedActionPlansForRisk.push(resultingPlanId);
        }
        updateSelectedActionPlansDisplay();

        if (context.riskId != null) {
            const targetRiskId = context.riskId;
            const risk = rms.risks.find(r => idsEqual(r.id, targetRiskId));
            if (risk) {
                risk.actionPlans = risk.actionPlans || [];
                if (!risk.actionPlans.some(id => idsEqual(id, resultingPlanId))) {
                    risk.actionPlans.push(resultingPlanId);
                }
            }

            const plan = rms.actionPlans.find(p => idsEqual(p.id, resultingPlanId));
            if (plan) {
                plan.risks = plan.risks || [];
                if (!plan.risks.some(id => idsEqual(id, targetRiskId))) {
                    plan.risks.push(targetRiskId);
                }
            }
        }

        actionPlanCreationContext = null;
    }

    if (context && typeof rms?.markUnsavedChange === 'function') {
        rms.markUnsavedChange('riskForm');
    }

    lastActionPlanData = { ...planData };
    rms.saveData();
    rms.renderAll();
    populatePlanOwnerSuggestions();
    closeActionPlanModal();
    if (rms && typeof rms.clearUnsavedChanges === 'function') {
        rms.clearUnsavedChanges('actionPlanForm');
    }
}
window.saveActionPlan = saveActionPlan;

function openRiskSelectorForPlan() {
    riskFilterQueryForPlan = '';
    const searchInput = document.getElementById('riskSearchInputPlan');
    if (searchInput) searchInput.value = '';
    renderRiskSelectionListForPlan();
    const modal = document.getElementById('riskSelectorPlanModal');
    if (modal) {
        bringModalToFront(modal);
    }
}
window.openRiskSelectorForPlan = openRiskSelectorForPlan;

function renderRiskSelectionListForPlan() {
    const riskList = document.getElementById('riskListForPlan');
    if (!riskList) return;
    const query = riskFilterQueryForPlan.toLowerCase();
    riskList.innerHTML = rms.risks.filter(risk => {
        const title = (risk.titre || risk.description || '').toLowerCase();
        return String(risk.id).includes(query) || title.includes(query);
    }).map(risk => {
        const isSelected = selectedRisksForPlan.some(id => idsEqual(id, risk.id));
        const title = risk.titre || risk.description || 'Untitled';
        return `
            <div class="risk-list-item">
              <input type="checkbox" id="plan-risk-${risk.id}" ${isSelected ? 'checked' : ''} onchange="toggleRiskSelectionForPlan(${JSON.stringify(risk.id)})">
              <div class="risk-item-info">
                <div class="risk-item-title">#${risk.id} - ${title}</div>
                <div class="risk-item-meta">Process: ${risk.processus}${risk.sousProcessus ? ` > ${risk.sousProcessus}` : ''} | Type: ${risk.typeCorruption}</div>
              </div>
            </div>`;
    }).join('');
}

window.filterRisksForPlan = function(query) {
    riskFilterQueryForPlan = query;
    renderRiskSelectionListForPlan();
};

function closeRiskSelectorForPlan() {
    closeModal('riskSelectorPlanModal');
}
window.closeRiskSelectorForPlan = closeRiskSelectorForPlan;

function toggleRiskSelectionForPlan(riskId) {
    const targetId = String(riskId);
    const index = selectedRisksForPlan.findIndex(id => idsEqual(id, targetId));
    if (index > -1) {
        selectedRisksForPlan.splice(index, 1);
    } else {
        selectedRisksForPlan.push(riskId);
    }
    if (rms && typeof rms.markUnsavedChange === 'function') {
        rms.markUnsavedChange('actionPlanForm');
    }
}
window.toggleRiskSelectionForPlan = toggleRiskSelectionForPlan;

function confirmRiskSelectionForPlan() {
    updateSelectedRisksForPlanDisplay();
    closeRiskSelectorForPlan();
}
window.confirmRiskSelectionForPlan = confirmRiskSelectionForPlan;

function updateSelectedRisksForPlanDisplay() {
    const container = document.getElementById('selectedRisksForPlan');
    if (!container) return;
    if (selectedRisksForPlan.length === 0) {
        container.innerHTML = '<div style="color: #7f8c8d; font-style: italic;">No selected risk</div>';
        return;
    }
    container.innerHTML = selectedRisksForPlan.map(riskId => {
        const risk = rms.risks.find(r => idsEqual(r.id, riskId));
        if (!risk) return '';
        const title = risk.titre || risk.description || 'Untitled';
        return `
            <div class="selected-risk-item">
              #${risk.id} - ${title.substring(0, 50)}${title.length > 50 ? '...' : ''}
              <span class="remove-risk" onclick="removeRiskFromPlanSelection(${JSON.stringify(riskId)})">×</span>
            </div>`;
    }).join('');
}
window.updateSelectedRisksForPlanDisplay = updateSelectedRisksForPlanDisplay;

function removeRiskFromPlanSelection(riskId) {
    selectedRisksForPlan = selectedRisksForPlan.filter(id => !idsEqual(id, riskId));
    updateSelectedRisksForPlanDisplay();
    if (rms && typeof rms.markUnsavedChange === 'function') {
        rms.markUnsavedChange('actionPlanForm');
    }
}
window.removeRiskFromPlanSelection = removeRiskFromPlanSelection;

function showNotification(type, message) {
    const notification = document.createElement('div');
    notification.classList.add('notification');

    if (['success', 'error', 'info'].includes(type)) {
        notification.classList.add(type);
    }

    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 4000);
}
window.showNotification = showNotification;
function generateReport(type) {
    showNotification('info', `Generating ${type} report...`);
    setTimeout(() => {
        showNotification('success', 'Report generated successfully!');
    }, 2000);
}
window.generateReport = generateReport;

function refreshDashboard() {
    if (rms) {
        rms.renderAll();
        showNotification('success', 'Dashboard refreshed');
    }
}
window.refreshDashboard = refreshDashboard;

function bindEvents() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.show').forEach(modal => {
                if (modal.id === 'interviewModal' && window.rms && typeof rms.closeInterviewModal === 'function') {
                    rms.closeInterviewModal();
                    return;
                }
                if (typeof hideModal === 'function') {
                    hideModal(modal);
                } else {
                    modal.classList.remove('show');
                }
            });
        }
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                if (modal.id === 'interviewModal' && window.rms && typeof rms.closeInterviewModal === 'function') {
                    rms.closeInterviewModal();
                    return;
                }
                if (typeof hideModal === 'function') {
                    hideModal(modal);
                } else {
                    modal.classList.remove('show');
                }
            }
        });
    });

    const probBrut = document.getElementById('probBrut');
    const impactBrut = document.getElementById('impactBrut');
    const probNet = document.getElementById('probNet');
    const impactNet = document.getElementById('impactNet');

    const mindmapButton = document.getElementById('openMindmapButton');
    if (mindmapButton) {
        mindmapButton.addEventListener('click', (event) => {
            event.preventDefault();

            if (window.rms && typeof rms.openMindMapModal === 'function') {
                rms.openMindMapModal();
            }
        });
    }

    const refreshBrutScores = () => {
        if (typeof calculateScore === 'function') {
            calculateScore('brut');
        }
    };

    if (probBrut && impactBrut) {
        probBrut.addEventListener('change', refreshBrutScores);
        impactBrut.addEventListener('change', refreshBrutScores);
    }

    if (probNet) {
        probNet.addEventListener('change', () => calculateScore('net'));
    }

    if (impactNet) {
        impactNet.addEventListener('change', () => calculateScore('net'));
    }

    const aggravatingInputs = document.querySelectorAll('input[name="aggravatingGroup1"], input[name="aggravatingGroup2"]');
    if (aggravatingInputs.length) {
        aggravatingInputs.forEach(input => {
            input.addEventListener('change', () => {
                if (typeof calculateScore === 'function') {
                    calculateScore('brut');
                }
            });
        });
    }

    const processScoreModeSelect = document.getElementById('processScoreMode');
    if (processScoreModeSelect) {
        processScoreModeSelect.addEventListener('change', (event) => {
            if (!window.rms) {
                return;
            }

            const selected = event.target.value === 'brut' ? 'brut' : 'net';
            if (rms.processScoreMode !== selected) {
                rms.processScoreMode = selected;
                rms.updateDashboard();
            }
        });
    }

    ['undueBenefitsInput', 'expectedBenefitsInput'].forEach((inputId) => {
        const input = document.getElementById(inputId);
        if (!input) return;
        if (inputId === 'undueBenefitsInput') {
            input.addEventListener('blur', () => {
                if (!input.value.trim()) return;
                const existingLabel = findClosestExistingBenefitLabel(input.value, 'undue');
                if (existingLabel) {
                    input.value = existingLabel;
                }
            });
        }
        if (inputId === 'expectedBenefitsInput') {
            input.addEventListener('blur', () => {
                if (!input.value.trim()) return;
                const existingLabel = findClosestExistingBenefitLabel(input.value, 'expected');
                if (existingLabel) {
                    input.value = existingLabel;
                }
            });
        }
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                addRiskChip(inputId === 'undueBenefitsInput' ? 'undue' : 'expected');
            }
        });
    });

    refreshBenefitsAutocomplete('undue');
    refreshBenefitsAutocomplete('expected');

    document.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.control-action-btn.edit');
        if (editBtn) {
            const controlId = editBtn.dataset.controlId;
            const planId = editBtn.dataset.planId;
            if (controlId && typeof editControl === 'function') {
                e.preventDefault();
                editControl(parseInt(controlId, 10));
            } else if (planId && typeof editActionPlan === 'function') {
                e.preventDefault();
                editActionPlan(parseInt(planId, 10));
            }
        }
    });
}
window.bindEvents = bindEvents;

function setupUnsavedChangeTracking() {
    const contexts = [
        { selector: '#riskForm', context: 'riskForm' },
        { selector: '#actionPlanForm', context: 'actionPlanForm' },
        { selector: '#controlForm', context: 'controlForm' },
        { selector: '#interviewForm', context: 'interviewForm' },
        { selector: '#configurationContainer', context: 'configuration' }
    ];

    const attachListeners = (element, context) => {
        if (!element || element.dataset.unsavedTrackingBound === 'true') {
            return;
        }

        const markChange = () => {
            if (window.rms && typeof window.rms.markUnsavedChange === 'function') {
                window.rms.markUnsavedChange(context);
            }
        };

        element.addEventListener('input', markChange);
        element.addEventListener('change', markChange);
        element.dataset.unsavedTrackingBound = 'true';
    };

    contexts.forEach(({ selector, context }) => {
        document.querySelectorAll(selector).forEach(element => {
            attachListeners(element, context);
        });
    });
}
window.setupUnsavedChangeTracking = setupUnsavedChangeTracking;

function registerBeforeUnloadWarning() {
    if (registerBeforeUnloadWarning._registered) {
        return;
    }

    window.addEventListener('beforeunload', (event) => {
        const instance = window.rms;
        if (!instance) {
            return;
        }

        let hasChanges = false;

        if (typeof instance.hasUnsavedChanges === 'boolean') {
            hasChanges = instance.hasUnsavedChanges;
        } else if (instance.unsavedContexts instanceof Set) {
            hasChanges = instance.unsavedContexts.size > 0;
        }

        if (hasChanges) {
            const message = 'You have unsaved changes. Are you sure you want to leave?';
            event.preventDefault();
            event.returnValue = message;
            return message;
        }
    });

    registerBeforeUnloadWarning._registered = true;
}
window.registerBeforeUnloadWarning = registerBeforeUnloadWarning;
