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

    if (evt && evt.target) {
        evt.target.classList.add('active');
    } else {
        const fallbackButton = document.querySelector(`.tab[onclick="switchTab('${tabName}')"]`);
        fallbackButton && fallbackButton.classList.add('active');
    }

    if (window.rms) {
        rms.currentTab = tabName;
        rms.renderAll();
    }
}
window.switchTab = switchTab;

function applyFilters() {
    if (!window.rms) return;

    rms.filters.process = document.getElementById('processFilter')?.value || '';
    rms.filters.type = document.getElementById('riskTypeFilter')?.value || '';
    rms.filters.status = document.getElementById('statusFilter')?.value || '';

    rms.renderRiskPoints();
    rms.updateRiskDetailsList();
    rms.updateRisksList();
}
window.applyFilters = applyFilters;

function searchRisks(searchTerm) {
    if (!window.rms) return;

    rms.filters.search = searchTerm;
    rms.renderRiskPoints();
    rms.updateRiskDetailsList();
    rms.updateRisksList();
}
window.searchRisks = searchRisks;

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

function addNewRisk() {
    currentEditingRiskId = null;
    const form = document.getElementById('riskForm');
    if (form) {
        form.reset();

        if (lastRiskData) {
            document.getElementById('processus').value = lastRiskData.processus || '';
            rms.updateSousProcessusOptions();
            document.getElementById('sousProcessus').value = lastRiskData.sousProcessus || '';
            document.getElementById('typeCorruption').value = lastRiskData.typeCorruption || '';

            const tiersSelect = document.getElementById('tiers');
            Array.from(tiersSelect.options).forEach(opt => {
                opt.selected = lastRiskData.tiers?.includes(opt.value);
            });

            document.getElementById('description').value = lastRiskData.description || '';
            document.getElementById('probBrut').value = lastRiskData.probBrut || 1;
            document.getElementById('impactBrut').value = lastRiskData.impactBrut || 1;
            document.getElementById('probNet').value = lastRiskData.probNet || 1;
            document.getElementById('impactNet').value = lastRiskData.impactNet || 1;
            document.getElementById('probPost').value = lastRiskData.probPost || 1;
            document.getElementById('impactPost').value = lastRiskData.impactPost || 1;
            selectedControlsForRisk = [...(lastRiskData.controls || [])];
            selectedActionPlansForRisk = [...(lastRiskData.actionPlans || [])];
        } else {
            rms.updateSousProcessusOptions();
            selectedControlsForRisk = [];
            selectedActionPlansForRisk = [];
        }

        calculateScore('brut');
        calculateScore('net');
        calculateScore('post');
        updateSelectedControlsDisplay();
        updateSelectedActionPlansDisplay();
    }
    activeRiskEditState = 'brut';
    const modal = document.getElementById('riskModal');
    if (modal) {
        modal.classList.add('show');
        requestAnimationFrame(() => initRiskEditMatrix());
    }
}
window.addNewRisk = addNewRisk;

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}
window.closeModal = closeModal;

window.getSelectedActionPlansForRisk = () => selectedActionPlansForRisk;
function saveRisk() {
    if (!rms) return;

    const formData = {
        processus: document.getElementById('processus').value,
        sousProcessus: document.getElementById('sousProcessus').value,
        description: document.getElementById('description').value,
        typeCorruption: document.getElementById('typeCorruption').value,
        tiers: Array.from(document.getElementById('tiers').selectedOptions).map(o => o.value),
        probBrut: parseInt(document.getElementById('probBrut').value),
        impactBrut: parseInt(document.getElementById('impactBrut').value),
        probNet: parseInt(document.getElementById('probNet').value),
        impactNet: parseInt(document.getElementById('impactNet').value),
        probPost: parseInt(document.getElementById('probPost').value),
        impactPost: parseInt(document.getElementById('impactPost').value),
        responsable: 'Marie Dupont',
        controls: [...selectedControlsForRisk],
        actionPlans: [...selectedActionPlansForRisk]
    };

    if (selectedActionPlansForRisk.length === 0) {
        formData.probPost = formData.probNet;
        formData.impactPost = formData.impactNet;
    }

    // Validate form
    if (!formData.processus || !formData.description || !formData.typeCorruption) {
        showNotification('error', 'Veuillez remplir tous les champs obligatoires');
        return;
    }

    if (formData.probNet > formData.probBrut || formData.impactNet > formData.impactBrut) {
        showNotification('error', 'La probabilité et l\'impact nets doivent être inférieurs ou égaux aux valeurs brutes');
        return;
    }

    if (currentEditingRiskId) {
        const targetId = String(currentEditingRiskId);
        const riskIndex = rms.risks.findIndex(r => idsEqual(r.id, targetId));
        if (riskIndex !== -1) {
            rms.risks[riskIndex] = { ...rms.risks[riskIndex], ...formData };

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

    lastRiskData = { ...formData, tiers: [...formData.tiers], controls: [...formData.controls], actionPlans: [...formData.actionPlans] };
}
window.saveRisk = saveRisk;

function openControlSelector() {
    controlFilterQueryForRisk = '';
    const searchInput = document.getElementById('controlSearchInput');
    if (searchInput) searchInput.value = '';
    renderControlSelectionList();
    document.getElementById('controlSelectorModal').classList.add('show');
}
window.openControlSelector = openControlSelector;

function renderControlSelectionList() {
    const list = document.getElementById('controlList');
    if (!list || !rms) return;
    const query = controlFilterQueryForRisk.toLowerCase();
    list.innerHTML = rms.controls.filter(ctrl => {
        const name = (ctrl.name || '').toLowerCase();
        return String(ctrl.id).includes(query) || name.includes(query);
    }).map(ctrl => {
        const isSelected = selectedControlsForRisk.includes(ctrl.id);
        return `
            <div class="risk-list-item">
              <input type="checkbox" id="control-${ctrl.id}" ${isSelected ? 'checked' : ''} onchange="toggleControlSelection(${ctrl.id})">
              <div class="risk-item-info">
                <div class="risk-item-title">#${ctrl.id} - ${ctrl.name}</div>
                <div class="risk-item-meta">Type: ${ctrl.type || ''} | Propriétaire: ${ctrl.owner || ''}</div>
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
    document.getElementById('controlSelectorModal').classList.remove('show');
}
window.closeControlSelector = closeControlSelector;

function toggleControlSelection(controlId) {
    const index = selectedControlsForRisk.indexOf(controlId);
    if (index > -1) {
        selectedControlsForRisk.splice(index, 1);
    } else {
        selectedControlsForRisk.push(controlId);
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
}
window.removeControlFromSelection = removeControlFromSelection;

function updateSelectedActionPlansDisplay() {
    const container = document.getElementById('riskActionPlans');
    const postSection = document.getElementById('postMitigationSection');
    if (!container) return;
    if (selectedActionPlansForRisk.length === 0) {
        container.innerHTML = '<div style="color: #7f8c8d; font-style: italic;">Aucun plan d\'action sélectionné</div>';
        if (postSection) postSection.style.display = 'none';
        const probNet = document.getElementById('probNet');
        const impactNet = document.getElementById('impactNet');
        document.getElementById('probPost').value = probNet ? probNet.value : 1;
        document.getElementById('impactPost').value = impactNet ? impactNet.value : 1;
        calculateScore('post');
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
    if (postSection) postSection.style.display = 'block';
}
window.updateSelectedActionPlansDisplay = updateSelectedActionPlansDisplay;

function removeActionPlanFromSelection(planId) {
    selectedActionPlansForRisk = selectedActionPlansForRisk.filter(id => id !== planId);
    updateSelectedActionPlansDisplay();
}
window.removeActionPlanFromSelection = removeActionPlanFromSelection;

function openActionPlanSelector() {
    actionPlanFilterQueryForRisk = '';
    const searchInput = document.getElementById('actionPlanSearchInput');
    if (searchInput) searchInput.value = '';
    renderActionPlanSelectionList();
    document.getElementById('actionPlanSelectorModal').classList.add('show');
}
window.openActionPlanSelector = openActionPlanSelector;

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
    document.getElementById('actionPlanSelectorModal').classList.remove('show');
}
window.closeActionPlanSelector = closeActionPlanSelector;

function toggleActionPlanSelection(planId) {
    const index = selectedActionPlansForRisk.indexOf(planId);
    if (index > -1) {
        selectedActionPlansForRisk.splice(index, 1);
    } else {
        selectedActionPlansForRisk.push(planId);
    }
}
window.toggleActionPlanSelection = toggleActionPlanSelection;

function confirmActionPlanSelection() {
    updateSelectedActionPlansDisplay();
    closeActionPlanSelector();
}
window.confirmActionPlanSelection = confirmActionPlanSelection;

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
        updateSelectedRisksForPlanDisplay();
    }
    document.getElementById('actionPlanModalTitle').textContent = "Nouveau Plan d'action";
    document.getElementById('actionPlanModal').classList.add('show');
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
    document.getElementById('actionPlanModal').classList.add('show');
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
    document.getElementById('actionPlanModal').classList.remove('show');
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

    if (currentEditingActionPlanId) {
        const idx = rms.actionPlans.findIndex(p => p.id == currentEditingActionPlanId);
        if (idx !== -1) {
            rms.actionPlans[idx] = { ...rms.actionPlans[idx], ...planData };
            rms.risks.forEach(risk => {
                risk.actionPlans = risk.actionPlans || [];
                if (planData.risks.includes(risk.id)) {
                    if (!risk.actionPlans.includes(currentEditingActionPlanId)) {
                        risk.actionPlans.push(currentEditingActionPlanId);
                    }
                } else {
                    risk.actionPlans = risk.actionPlans.filter(id => id !== currentEditingActionPlanId);
                }
            });
            showNotification('success', `Plan "${planData.title}" modifié`);
        }
    } else {
        const newPlan = { id: getNextSequentialId(rms.actionPlans), ...planData };
        rms.actionPlans.push(newPlan);
        planData.risks.forEach(rid => {
            const risk = rms.risks.find(r => idsEqual(r.id, rid));
            if (risk) {
                risk.actionPlans = risk.actionPlans || [];
                if (!risk.actionPlans.includes(newPlan.id)) risk.actionPlans.push(newPlan.id);
            }
        });
        showNotification('success', `Plan "${planData.title}" créé`);
    }

    lastActionPlanData = { ...planData };
    rms.saveData();
    rms.renderAll();
    closeActionPlanModal();
}
window.saveActionPlan = saveActionPlan;

function openRiskSelectorForPlan() {
    riskFilterQueryForPlan = '';
    const searchInput = document.getElementById('riskSearchInputPlan');
    if (searchInput) searchInput.value = '';
    renderRiskSelectionListForPlan();
    document.getElementById('riskSelectorPlanModal').classList.add('show');
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
    document.getElementById('riskSelectorPlanModal').classList.remove('show');
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
}
window.removeRiskFromPlanSelection = removeRiskFromPlanSelection;

function showNotification(type, message) {
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
    const probNet = document.getElementById('probNet');
    const impactBrut = document.getElementById('impactBrut');
    const impactNet = document.getElementById('impactNet');

    const enforceNetLimits = () => {
        if (parseInt(probNet.value) > parseInt(probBrut.value)) {
            probNet.value = probBrut.value;
        }
        if (parseInt(impactNet.value) > parseInt(impactBrut.value)) {
            impactNet.value = impactBrut.value;
        }
        calculateScore('net');
    };

    if (probBrut && probNet && impactBrut && impactNet) {
        probBrut.addEventListener('change', enforceNetLimits);
        probNet.addEventListener('change', enforceNetLimits);
        impactBrut.addEventListener('change', enforceNetLimits);
        impactNet.addEventListener('change', enforceNetLimits);
        enforceNetLimits();
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
