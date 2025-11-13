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

function syncRiskFilterWidgets(filterKey, value, sourceElement) {
    const normalizedKey = typeof filterKey === 'string' ? filterKey.trim() : '';
    if (!normalizedKey) {
        return;
    }

    const normalizedValue = value == null ? '' : String(value);

    if (sourceElement && typeof sourceElement.value !== 'undefined' && sourceElement.value !== normalizedValue) {
        sourceElement.value = normalizedValue;
    }

    document.querySelectorAll(`[data-risk-filter="${normalizedKey}"]`).forEach(element => {
        if (element === sourceElement) {
            return;
        }
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
        rms.filters = { process: '', type: '', status: '', search: '' };
    }

    if (normalizedKey) {
        const normalizedValue = filterValue == null ? '' : String(filterValue);
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
        rms.filters = { process: '', type: '', status: '', search: '' };
    }

    rms.filters.search = normalizedValue;

    syncRiskFilterWidgets('search', normalizedValue, originElement);

    rms.renderRiskPoints();
    rms.updateRiskDetailsList();
    rms.updateRisksList();
}
window.searchRisks = searchRisks;

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
var controlFilterQueryForRisk = '';
var currentEditingRiskId = null;
var selectedActionPlansForRisk = [];
var lastActionPlanData = null;
var selectedRisksForPlan = [];
var riskFilterQueryForPlan = '';
var currentEditingActionPlanId = null;
var actionPlanFilterQueryForRisk = '';
var controlCreationContext = null;
var actionPlanCreationContext = null;

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
}

function selectAllRiskCountries() {
    setRiskCountriesSelection(getAllRiskCountryValues());
    const select = getRiskCountriesSelect();
    if (select) {
        select.dispatchEvent(new Event('change', { bubbles: true }));
    }
}
window.selectAllRiskCountries = selectAllRiskCountries;

function deselectAllRiskCountries() {
    setRiskCountriesSelection([], { fallbackToAll: false });
    const select = getRiskCountriesSelect();
    if (select) {
        select.dispatchEvent(new Event('change', { bubbles: true }));
    }
}
window.deselectAllRiskCountries = deselectAllRiskCountries;

function addNewRisk() {
    currentEditingRiskId = null;
    const form = document.getElementById('riskForm');
    if (form) {
        form.reset();

        const statutSelect = document.getElementById('statut');
        if (lastRiskData) {
            document.getElementById('processus').value = lastRiskData.processus || '';
            rms.updateSousProcessusOptions();
            document.getElementById('sousProcessus').value = lastRiskData.sousProcessus || '';
            document.getElementById('typeCorruption').value = lastRiskData.typeCorruption || '';

            const tiersSelect = document.getElementById('tiers');
            Array.from(tiersSelect.options).forEach(opt => {
                opt.selected = lastRiskData.tiers?.includes(opt.value);
            });

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
            selectedActionPlansForRisk = [...(lastRiskData.actionPlans || [])];
            setAggravatingFactorsSelection(lastRiskData.aggravatingFactors || null);
        } else {
            rms.updateSousProcessusOptions();
            selectedControlsForRisk = [];
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

    const formData = {
        processus: document.getElementById('processus').value,
        sousProcessus: document.getElementById('sousProcessus').value,
        description: document.getElementById('description').value,
        typeCorruption: document.getElementById('typeCorruption').value,
        statut: document.getElementById('statut').value,
        tiers: Array.from(document.getElementById('tiers').selectedOptions).map(o => o.value),
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
        actionPlans: [...selectedActionPlansForRisk]
    };

    formData.probPost = formData.probNet;
    formData.impactPost = formData.impactNet;

    // Validate form
    if (!formData.processus || !formData.description || !formData.typeCorruption || !formData.statut) {
        showNotification('error', 'Veuillez remplir tous les champs obligatoires');
        return;
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
            showNotification('success', 'Risque mis à jour avec succès!');
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
        showNotification('success', 'Risque ajouté avec succès!');
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
    controlCreationContext = {
        fromRisk: true,
        riskId: currentEditingRiskId != null ? currentEditingRiskId : null
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
    list.innerHTML = rms.controls.filter(ctrl => {
        const name = (ctrl.name || '').toLowerCase();
        return String(ctrl.id).includes(query) || name.includes(query);
    }).map(ctrl => {
        const isSelected = selectedControlsForRisk.includes(ctrl.id);
        const typeKey = ctrl?.type != null ? String(ctrl.type).toLowerCase() : '';
        const typeLabel = typeKey ? (typeMap[typeKey] || ctrl.type || '') : '';
        const originKey = ctrl?.origin != null ? String(ctrl.origin).toLowerCase() : '';
        const originLabel = originKey ? (originMap[originKey] || ctrl.origin || '') : '';
        const ownerLabel = ctrl?.owner || '';
        const controlName = ctrl?.name || 'Sans nom';
        return `
            <div class="risk-list-item">
              <input type="checkbox" id="control-${ctrl.id}" ${isSelected ? 'checked' : ''} onchange="toggleControlSelection(${ctrl.id})">
              <div class="risk-item-info">
                <div class="risk-item-title">#${ctrl.id} - ${controlName}</div>
                <div class="risk-item-meta">Type: ${typeLabel || 'Non défini'} | Origine: ${originLabel || 'Non définie'} | Propriétaire: ${ownerLabel || 'Non défini'}</div>
              </div>
            </div>`;
    }).join('');
}

function filterControlsForRisk(query) {
    controlFilterQueryForRisk = query;
    renderControlSelectionList();
}
window.filterControlsForRisk = filterControlsForRisk;

function closeControlSelector() {
    closeModal('controlSelectorModal');
}
window.closeControlSelector = closeControlSelector;

function toggleControlSelection(controlId) {
    const index = selectedControlsForRisk.indexOf(controlId);
    if (index > -1) {
        selectedControlsForRisk.splice(index, 1);
    } else {
        selectedControlsForRisk.push(controlId);
    }
    if (rms && typeof rms.markUnsavedChange === 'function') {
        rms.markUnsavedChange('riskForm');
    }
}
window.toggleControlSelection = toggleControlSelection;

function confirmControlSelection() {
    updateSelectedControlsDisplay();
    closeControlSelector();
}
window.confirmControlSelection = confirmControlSelection;

function updateSelectedControlsDisplay() {
    const container = document.getElementById('riskControls');
    if (!container) return;
    if (selectedControlsForRisk.length === 0) {
        container.innerHTML = '<div style="color: #7f8c8d; font-style: italic;">Aucun contrôle sélectionné</div>';
        return;
    }
    container.innerHTML = selectedControlsForRisk.map(id => {
        const ctrl = rms.controls.find(c => c.id === id);
        if (!ctrl) return '';
        const name = ctrl.name || 'Sans nom';
        return `
            <div class="selected-control-item">
              #${id} - ${name.substring(0, 50)}${name.length > 50 ? '...' : ''}
              <span class="remove-control" onclick="removeControlFromSelection(${id})">×</span>
            </div>`;
    }).join('');
}
window.updateSelectedControlsDisplay = updateSelectedControlsDisplay;

function removeControlFromSelection(controlId) {
    selectedControlsForRisk = selectedControlsForRisk.filter(id => id !== controlId);
    updateSelectedControlsDisplay();
    if (rms && typeof rms.markUnsavedChange === 'function') {
        rms.markUnsavedChange('riskForm');
    }
}
window.removeControlFromSelection = removeControlFromSelection;

function updateSelectedActionPlansDisplay() {
    const container = document.getElementById('riskActionPlans');
    if (!container) return;
    if (selectedActionPlansForRisk.length === 0) {
        container.innerHTML = '<div style="color: #7f8c8d; font-style: italic;">Aucun plan d\'action sélectionné</div>';
        return;
    }
    container.innerHTML = selectedActionPlansForRisk.map(id => {
        const plan = rms.actionPlans.find(p => p.id === id);
        if (!plan) return '';
        const title = plan.title || 'Sans titre';
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
        const title = plan.title || 'Sans titre';
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
    document.getElementById('actionPlanModalTitle').textContent = "Nouveau Plan d'action";
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
    document.getElementById('actionPlanModalTitle').textContent = "Modifier le Plan d'action";
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
    showNotification('success', `Plan "${title}" supprimé`);
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
    const planData = {
        title: formData.get('title').trim(),
        owner: formData.get('owner').trim(),
        dueDate: formData.get('dueDate'),
        status: formData.get('status'),
        description: formData.get('description').trim(),
        risks: [...selectedRisksForPlan]
    };
    if (!planData.title) { alert('Titre requis'); return; }

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
            showNotification('success', `Plan "${planData.title}" modifié`);
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
        showNotification('success', `Plan "${planData.title}" créé`);
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
        const title = risk.titre || risk.description || 'Sans titre';
        return `
            <div class="risk-list-item">
              <input type="checkbox" id="plan-risk-${risk.id}" ${isSelected ? 'checked' : ''} onchange="toggleRiskSelectionForPlan(${JSON.stringify(risk.id)})">
              <div class="risk-item-info">
                <div class="risk-item-title">#${risk.id} - ${title}</div>
                <div class="risk-item-meta">Processus: ${risk.processus}${risk.sousProcessus ? ` > ${risk.sousProcessus}` : ''} | Type: ${risk.typeCorruption}</div>
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
        container.innerHTML = '<div style="color: #7f8c8d; font-style: italic;">Aucun risque sélectionné</div>';
        return;
    }
    container.innerHTML = selectedRisksForPlan.map(riskId => {
        const risk = rms.risks.find(r => idsEqual(r.id, riskId));
        if (!risk) return '';
        const title = risk.titre || risk.description || 'Sans titre';
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
    showNotification('info', `Génération du rapport ${type} en cours...`);
    setTimeout(() => {
        showNotification('success', 'Rapport généré avec succès!');
    }, 2000);
}
window.generateReport = generateReport;

function refreshDashboard() {
    if (rms) {
        rms.renderAll();
        showNotification('success', 'Tableau de bord actualisé');
    }
}
window.refreshDashboard = refreshDashboard;

function bindEvents() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.show').forEach(modal => {
                modal.classList.remove('show');
            });
        }
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });

    const probBrut = document.getElementById('probBrut');
    const impactBrut = document.getElementById('impactBrut');
    const probNet = document.getElementById('probNet');
    const impactNet = document.getElementById('impactNet');

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
            const message = 'Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir quitter ?';
            event.preventDefault();
            event.returnValue = message;
            return message;
        }
    });

    registerBeforeUnloadWarning._registered = true;
}
window.registerBeforeUnloadWarning = registerBeforeUnloadWarning;
