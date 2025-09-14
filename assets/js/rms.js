        // Enhanced Risk Management System
export class RiskManagementSystem {
            constructor() {
                this.risks = this.loadData('risks') || this.getDefaultRisks();
                this.controls = this.loadData('controls') || this.getDefaultControls();
                this.history = this.loadData('history') || [];
                this.currentView = 'brut';
                this.currentTab = 'dashboard';
                this.filters = {
                    process: '',
                    type: '',
                    status: '',
                    search: ''
                };
                this.init();
            }

            init() {
                this.initializeMatrix();
                this.updateDashboard();
                this.updateRisksList();
                this.updateControlsList();
                this.updateHistory();
                this.saveData();
                this.updateLastSaveTime();
                
                // Auto-save every 30 seconds
                setInterval(() => this.autoSave(), 30000);
            }

            getDefaultRisks() {
                return [
                    {
                        id: 1,
                        processus: "R&D",
                        sousProcessus: "Études cliniques",
                        description: "Corruption d'investigateurs pour favoriser inclusion patients",
                        typeCorruption: "active",
                        typeTiers: "Médecins",
                        probBrut: 3, impactBrut: 4,
                        probNet: 2, impactNet: 3,
                        probPost: 1, impactPost: 2,
                        statut: "en-cours",
                        responsable: "Dr. Martin",
                        dateCreation: "2024-01-15",
                        controls: [1, 2]
                    },
                    {
                        id: 2,
                        processus: "Achats",
                        sousProcessus: "Appels d'offres",
                        description: "Favoritisme dans attribution marchés",
                        typeCorruption: "favoritisme",
                        typeTiers: "Fournisseurs",
                        probBrut: 3, impactBrut: 4,  // Même position que risque 1
                        probNet: 2, impactNet: 2,
                        probPost: 1, impactPost: 2,
                        statut: "traite",
                        responsable: "M. Durand",
                        dateCreation: "2024-01-20",
                        controls: [3]
                    },
                    {
                        id: 3,
                        processus: "Marketing",
                        sousProcessus: "Événements",
                        description: "Avantages indus lors d'événements médicaux",
                        typeCorruption: "cadeaux",
                        typeTiers: "Médecins",
                        probBrut: 4, impactBrut: 3,
                        probNet: 2, impactNet: 3,  // Même position que risque 1
                        probPost: 1, impactPost: 2,
                        statut: "nouveau",
                        responsable: "Mme. Leroy",
                        dateCreation: "2024-02-01",
                        controls: [1, 4]
                    },
                    {
                        id: 4,
                        processus: "Ventes",
                        sousProcessus: "Négociation",
                        description: "Corruption d'acheteurs hospitaliers",
                        typeCorruption: "active",
                        typeTiers: "Hôpitaux publics",
                        probBrut: 3, impactBrut: 4,  // Même position que risques 1 et 2
                        probNet: 2, impactNet: 3,  // Même position que risques 1 et 3
                        probPost: 1, impactPost: 1,
                        statut: "en-cours",
                        responsable: "M. Bernard",
                        dateCreation: "2024-01-10",
                        controls: [2, 3]
                    },
                    {
                        id: 5,
                        processus: "RH",
                        sousProcessus: "Recrutement",
                        description: "Embauche famille/proches décideurs publics",
                        typeCorruption: "trafic",
                        typeTiers: "Administrations",
                        probBrut: 2, impactBrut: 3,
                        probNet: 1, impactNet: 2,
                        probPost: 1, impactPost: 1,  // Même position que risque 4
                        statut: "validé",
                        responsable: "Mme. Petit",
                        dateCreation: "2024-01-25",
                        controls: [1]
                    },
                    {
                        id: 6,
                        processus: "Production",
                        sousProcessus: "Contrôle qualité",
                        description: "Falsification certificats pour accélérer mise sur marché",
                        typeCorruption: "passive",
                        typeTiers: "Organismes certificateurs",
                        probBrut: 2, impactBrut: 4,
                        probNet: 1, impactNet: 3,
                        probPost: 1, impactPost: 2,
                        statut: "nouveau",
                        responsable: "M. Moreau",
                        dateCreation: "2024-02-05",
                        controls: [2, 3, 4]
                    },
                    {
                        id: 7,
                        processus: "Finance",
                        sousProcessus: "Paiements",
                        description: "Facilitation payments pour déblocage douane",
                        typeCorruption: "active",
                        typeTiers: "Douanes",
                        probBrut: 3, impactBrut: 3,
                        probNet: 2, impactNet: 2,
                        probPost: 1, impactPost: 1,  // Même position que risques 4 et 5
                        statut: "en-cours",
                        responsable: "Mme. Dubois",
                        dateCreation: "2024-02-10",
                        controls: [1, 2]
                    },
                    {
                        id: 8,
                        processus: "Juridique",
                        sousProcessus: "Contrats",
                        description: "Clauses secrètes avantageant certains partenaires",
                        typeCorruption: "favoritisme",
                        typeTiers: "Partenaires commerciaux",
                        probBrut: 2, impactBrut: 3,
                        probNet: 1, impactNet: 2,
                        probPost: 1, impactPost: 1,  // Même position que risques 4, 5 et 7
                        statut: "traite",
                        responsable: "Me. Lambert",
                        dateCreation: "2024-01-30",
                        controls: [3, 4]
                    }
                ];
            }

            getDefaultControls() {
                return [
                    {
                        id: 1,
                        name: "Procédure de validation des dépenses",
                        description: "Double validation pour toute dépense > 1000€",
                        effectiveness: "forte",
                        type: "preventif",
                        owner: "Directeur Financier",
                        frequency: "quotidienne",
                        mode: "manuel",
                        status: "actif",
                        risks: [1, 2],
                        dateCreation: "2024-01-01"
                    },
                    {
                        id: 2,
                        name: "Due diligence tiers",
                        description: "Vérification approfondie de tous les nouveaux partenaires",
                        effectiveness: "forte",
                        type: "preventif",
                        owner: "Service Juridique",
                        frequency: "ad-hoc",
                        mode: "manuel",
                        status: "actif",
                        risks: [3, 4],
                        dateCreation: "2024-01-01"
                    },
                    {
                        id: 3,
                        name: "Audit interne trimestriel",
                        description: "Revue complète des processus à risque",
                        effectiveness: "moyenne",
                        type: "detectif",
                        owner: "Audit Interne",
                        frequency: "mensuelle",
                        mode: "manuel",
                        status: "actif",
                        risks: [5, 6],
                        dateCreation: "2024-01-01"
                    },
                    {
                        id: 4,
                        name: "Formation anti-corruption",
                        description: "Formation obligatoire annuelle pour tous les employés",
                        effectiveness: "moyenne",
                        type: "preventif",
                        owner: "Ressources Humaines",
                        frequency: "annuelle",
                        mode: "manuel",
                        status: "actif",
                        risks: [7, 8],
                        dateCreation: "2024-01-01"
                    }
                ];
            }

            // Data persistence
            saveData() {
                localStorage.setItem('rms_risks', JSON.stringify(this.risks));
                localStorage.setItem('rms_controls', JSON.stringify(this.controls));
                localStorage.setItem('rms_history', JSON.stringify(this.history));
            }

            loadData(key) {
                const data = localStorage.getItem(`rms_${key}`);
                return data ? JSON.parse(data) : null;
            }

            autoSave() {
                this.saveData();
                this.updateLastSaveTime();
                showNotification('info', 'Sauvegarde automatique effectuée');
            }

            updateLastSaveTime() {
                const now = new Date();
                const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                document.getElementById('lastSaveTime').textContent = timeStr;
            }

            // Matrix functions
            initializeMatrix() {
                const grid = document.getElementById('matrixGrid');
                if (!grid) return;
                
                grid.innerHTML = '';
                
                for (let row = 4; row >= 1; row--) {
                    for (let col = 1; col <= 4; col++) {
                        const cell = document.createElement('div');
                        cell.className = 'matrix-cell';
                        cell.dataset.probability = row;
                        cell.dataset.impact = col;
                        
                        const riskLevel = row * col;
                        if (riskLevel <= 4) cell.classList.add('level-1');
                        else if (riskLevel <= 8) cell.classList.add('level-2');
                        else if (riskLevel <= 12) cell.classList.add('level-3');
                        else cell.classList.add('level-4');
                        
                        grid.appendChild(cell);
                    }
                }
                
                this.renderRiskPoints();
                this.updateRiskDetailsList();
            }

            renderRiskPoints() {
                // Remove existing points
                document.querySelectorAll('.risk-point').forEach(p => p.remove());
                
                const grid = document.getElementById('matrixGrid');
                if (!grid) return;
                
                const filteredRisks = this.getFilteredRisks();
                
                filteredRisks.forEach(risk => {
                    let prob, impact;
                    
                    if (this.currentView === 'brut') {
                        prob = risk.probBrut;
                        impact = risk.impactBrut;
                    } else if (this.currentView === 'net') {
                        prob = risk.probNet;
                        impact = risk.impactNet;
                    } else {
                        prob = risk.probPost;
                        impact = risk.impactPost;
                    }
                    
                    const point = document.createElement('div');
                    point.className = `risk-point ${this.currentView}`;
                    point.dataset.riskId = risk.id;
                    
                    const leftPercent = ((impact - 0.5) / 4) * 100;
                    const bottomPercent = ((prob - 0.5) / 4) * 100;
                    
                    point.style.left = `${leftPercent}%`;
                    point.style.bottom = `${bottomPercent}%`;
                    point.style.transform = 'translate(-50%, 50%)';
                    
                    point.title = risk.description;
                    point.onclick = () => this.selectRisk(risk.id);
                    
                    grid.appendChild(point);
                });
            }

            getFilteredRisks() {
                return this.risks.filter(risk => {
                    if (this.filters.process && !risk.processus.toLowerCase().includes(this.filters.process.toLowerCase())) {
                        return false;
                    }
                    if (this.filters.type && risk.typeCorruption !== this.filters.type) {
                        return false;
                    }
                    if (this.filters.status && risk.statut !== this.filters.status) {
                        return false;
                    }
                    if (this.filters.search && !risk.description.toLowerCase().includes(this.filters.search.toLowerCase())) {
                        return false;
                    }
                    return true;
                });
            }

            selectRisk(riskId) {
                const risk = this.risks.find(r => r.id === riskId);
                if (!risk) return;
                
                // Update selected state in details panel
                document.querySelectorAll('.risk-item').forEach(item => {
                    item.classList.remove('selected');
                    if (item.dataset.riskId == riskId) {
                        item.classList.add('selected');
                    }
                });
                
                // Show risk details
                this.showRiskDetails(risk);
            }

            showRiskDetails(risk) {
                // Could open a modal or update a details panel
                console.log('Risk details:', risk);
            }

            updateRiskDetailsList() {
                const container = document.getElementById('riskDetailsList');
                if (!container) return;
                
                const filteredRisks = this.getFilteredRisks();
                
                container.innerHTML = filteredRisks.map(risk => {
                    let prob, impact;
                    if (this.currentView === 'brut') {
                        prob = risk.probBrut;
                        impact = risk.impactBrut;
                    } else if (this.currentView === 'net') {
                        prob = risk.probNet;
                        impact = risk.impactNet;
                    } else {
                        prob = risk.probPost;
                        impact = risk.impactPost;
                    }
                    
                    const score = prob * impact;
                    let scoreClass = 'low';
                    if (score > 12) scoreClass = 'critical';
                    else if (score > 8) scoreClass = 'high';
                    else if (score > 4) scoreClass = 'medium';
                    
                    return `
                        <div class="risk-item" data-risk-id="${risk.id}" onclick="window.rms.selectRisk(${risk.id})">
                            <div class="risk-item-header">
                                <span class="risk-item-title">${risk.description}</span>
                                <span class="risk-item-score ${scoreClass}">${score}</span>
                            </div>
                            <div class="risk-item-meta">
                                ${risk.processus} • ${risk.responsable}
                            </div>
                        </div>
                    `;
                }).join('');
            }

            // Dashboard functions
            updateDashboard() {
                // Update stats
                const stats = this.calculateStats();
                
                // Update KPI cards (if elements exist)
                // Update charts
                this.updateCharts();
            }

            calculateStats() {
                const stats = {
                    critical: 0,
                    high: 0,
                    medium: 0,
                    low: 0,
                    total: this.risks.length
                };
                
                this.risks.forEach(risk => {
                    const score = risk.probNet * risk.impactNet;
                    if (score > 12) stats.critical++;
                    else if (score > 8) stats.high++;
                    else if (score > 4) stats.medium++;
                    else stats.low++;
                });
                
                return stats;
            }

            updateCharts() {
                // Placeholder for chart updates
                // Would use Chart.js or similar library
            }

            // Risk list functions
            updateRisksList() {
                const tbody = document.getElementById('risksTableBody');
                if (!tbody) return;
                
                const filteredRisks = this.getFilteredRisks();
                
                tbody.innerHTML = filteredRisks.map(risk => `
                    <tr>
                        <td>#${risk.id}</td>
                        <td>${risk.description}</td>
                        <td>${risk.processus}</td>
                        <td>${risk.typeCorruption}</td>
                        <td>${risk.probBrut * risk.impactBrut}</td>
                        <td>${risk.probNet * risk.impactNet}</td>
                        <td>${risk.probPost * risk.impactPost}</td>
                        <td><span class="table-badge badge-${risk.statut === 'traite' ? 'success' : risk.statut === 'en-cours' ? 'warning' : 'danger'}">${risk.statut}</span></td>
                        <td>${risk.responsable}</td>
                        <td class="table-actions-cell">
                            <button class="action-btn" onclick="window.rms.editRisk(${risk.id})">✏️</button>
                            <button class="action-btn" onclick="window.rms.deleteRisk(${risk.id})">🗑️</button>
                        </td>
                    </tr>
                `).join('');
            }

            // Controls functions
            updateControlsList() {
                const container = document.getElementById('controlsList');
                if (!container) return;
                
                container.innerHTML = this.controls.map(control => {
                    // Récupérer les risques couverts
                    const coveredRisks = control.risks ? this.risks.filter(risk => 
                        control.risks.includes(risk.id)
                    ).map(risk => risk.description.substring(0, 50) + '...').join(', ') : 'Aucun risque associé';
                    
                    // Mapper les valeurs d'efficacité
                    const effectivenessMap = {
                        'forte': 'Forte',
                        'moyenne': 'Moyenne', 
                        'faible': 'Faible',
                        'high': 'Forte',
                        'medium': 'Moyenne',
                        'low': 'Faible'
                    };
                    
                    // Mapper les statuts
                    const statusMap = {
                        'actif': 'Actif',
                        'en-mise-en-place': 'En mise en place',
                        'en-revision': 'En cours de révision',
                        'obsolete': 'Obsolète'
                    };
                    
                    return `
                        <div class="control-item">
                            <div class="control-actions">
                                <button class="control-action-btn edit" onclick="editControl(${control.id})" title="Modifier">
                                    ✏️
                                </button>
                                <button class="control-action-btn delete" onclick="deleteControl(${control.id})" title="Supprimer">
                                    🗑️
                                </button>
                            </div>
                            
                            <div class="control-header">
                                <div>
                                    <div class="control-name">${control.name || 'Contrôle sans nom'}</div>
                                    <div class="control-type-badge ${control.type || 'preventif'}">
                                        ${control.type === 'preventif' ? 'Préventif' : 'Détectif'}
                                    </div>
                                </div>
                                ${control.status ? `<span class="control-status-badge ${control.status}">${statusMap[control.status] || control.status}</span>` : ''}
                            </div>
                            
                            ${control.description ? `<div style="margin: 10px 0; color: #666; font-size: 0.9em;">${control.description}</div>` : ''}
                            
                            <div style="margin: 10px 0; font-size: 0.85em; color: #7f8c8d;">
                                <strong>Risques couverts:</strong> ${coveredRisks}
                            </div>
                            
                            <div class="control-meta">
                                ${control.owner ? `
                                    <div class="control-meta-item">
                                        <div class="control-meta-label">Propriétaire</div>
                                        <div class="control-meta-value">${control.owner}</div>
                                    </div>
                                ` : ''}
                                ${control.frequency ? `
                                    <div class="control-meta-item">
                                        <div class="control-meta-label">Fréquence</div>
                                        <div class="control-meta-value">${control.frequency}</div>
                                    </div>
                                ` : ''}
                                ${control.mode ? `
                                    <div class="control-meta-item">
                                        <div class="control-meta-label">Mode</div>
                                        <div class="control-meta-value">${control.mode}</div>
                                    </div>
                                ` : ''}
                                <div class="control-meta-item">
                                    <div class="control-meta-label">Efficacité</div>
                                    <div class="control-meta-value">${effectivenessMap[control.effectiveness] || 'Non définie'}</div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }

            // History functions
            updateHistory() {
                const container = document.getElementById('historyTimeline');
                if (!container) return;
                
                const recentHistory = this.history.slice(-10).reverse();
                
                container.innerHTML = recentHistory.map(item => `
                    <div class="timeline-item">
                        <div class="timeline-marker"></div>
                        <div class="timeline-content">
                            <div class="timeline-date">${new Date(item.date).toLocaleString('fr-FR')}</div>
                            <div class="timeline-title">${item.action}</div>
                            <div class="timeline-description">${item.description}</div>
                        </div>
                    </div>
                `).join('');
            }

            addHistoryItem(action, description) {
                this.history.push({
                    id: Date.now(),
                    date: new Date().toISOString(),
                    action,
                    description,
                    user: 'Marie Dupont'
                });
                this.saveData();
                this.updateHistory();
            }

            // CRUD operations
            addRisk(riskData) {
                const newRisk = {
                    id: Date.now(),
                    ...riskData,
                    dateCreation: new Date().toISOString(),
                    statut: 'nouveau'
                };
                
                this.risks.push(newRisk);
                this.addHistoryItem('Création risque', `Nouveau risque: ${newRisk.description}`);
                this.saveData();
                this.init();
                
                return newRisk;
            }

            editRisk(riskId) {
                const risk = this.risks.find(r => r.id === riskId);
                if (!risk) return;
                
                // Populate form and open modal
                // Implementation depends on your form structure
                console.log('Edit risk:', risk);
            }

            deleteRisk(riskId) {
                if (!confirm('Êtes-vous sûr de vouloir supprimer ce risque?')) return;
                
                const index = this.risks.findIndex(r => r.id === riskId);
                if (index > -1) {
                    const risk = this.risks[index];
                    this.risks.splice(index, 1);
                    this.addHistoryItem('Suppression risque', `Risque supprimé: ${risk.description}`);
                    this.saveData();
                    this.init();
                }
            }

            // Export functions
            exportData(format = 'json') {
                const data = {
                    risks: this.risks,
                    controls: this.controls,
                    exportDate: new Date().toISOString(),
                    exportedBy: 'Marie Dupont'
                };
                
                if (format === 'json') {
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `risk_mapping_${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                } else if (format === 'csv') {
                    // CSV export implementation
                    const csv = this.convertToCSV(this.risks);
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `risks_${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                }
                
                showNotification('success', 'Export réussi!');
            }

            convertToCSV(data) {
                const headers = Object.keys(data[0]).join(',');
                const rows = data.map(row => Object.values(row).join(','));
                return [headers, ...rows].join('\n');
            }
        }

        // Initialize the system

        // Global functions for HTML event handlers
export function switchTab(tabName) {
            // Hide all tabs
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Remove active class from all tab buttons
            document.querySelectorAll('.tab').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Show selected tab
            const selectedTab = document.getElementById(`${tabName}-tab`);
            if (selectedTab) {
                selectedTab.classList.add('active');
            }
            
            // Add active class to clicked button
            event.target.classList.add('active');
            
            if (window.rms) {
                window.rms.currentTab = tabName;
                
                // Update relevant content based on tab
                if (tabName === 'matrix') {
                    window.rms.initializeMatrix();
                } else if (tabName === 'dashboard') {
                    window.rms.updateDashboard();
                } else if (tabName === 'risks') {
                    window.rms.updateRisksList();
                } else if (tabName === 'controls') {
                    window.rms.updateControlsList();
                } else if (tabName === 'history') {
                    window.rms.updateHistory();
                }
            }
        }
export function changeMatrixView(view) {
            if (!window.rms) return;
            
            window.rms.currentView = view;
            
            // Update buttons
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            // Update title
            const titles = {
                'brut': 'Matrice des Risques - Vue Brut',
                'net': 'Matrice des Risques - Vue Net',
                'post-mitigation': 'Matrice des Risques - Post-Mitigation'
            };
            
            const titleElement = document.getElementById('matrixTitle');
            if (titleElement) {
                titleElement.textContent = titles[view];
            }
            
            // Re-render matrix
            window.rms.renderRiskPoints();
            window.rms.updateRiskDetailsList();
        }
export function applyFilters() {
            if (!window.rms) return;
            
            window.rms.filters.process = document.getElementById('processFilter')?.value || '';
            window.rms.filters.type = document.getElementById('riskTypeFilter')?.value || '';
            window.rms.filters.status = document.getElementById('statusFilter')?.value || '';
            
            window.rms.renderRiskPoints();
            window.rms.updateRiskDetailsList();
            window.rms.updateRisksList();
        }
export function searchRisks(searchTerm) {
            if (!window.rms) return;
            
            window.rms.filters.search = searchTerm;
            window.rms.renderRiskPoints();
            window.rms.updateRiskDetailsList();
            window.rms.updateRisksList();
        }
export function addNewRisk() {
            document.getElementById('riskModal').classList.add('show');
        }
export function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('show');
        }
export function calculateScore(type) {
            let probId, impactId, scoreId;
            
            if (type === 'brut') {
                probId = 'probBrut';
                impactId = 'impactBrut';
                scoreId = 'scoreBrut';
            } else if (type === 'net') {
                probId = 'probNet';
                impactId = 'impactNet';
                scoreId = 'scoreNet';
            } else {
                probId = 'probPost';
                impactId = 'impactPost';
                scoreId = 'scorePost';
            }
            
            const prob = parseInt(document.getElementById(probId).value) || 1;
            const impact = parseInt(document.getElementById(impactId).value) || 1;
            const score = prob * impact;
            
            document.getElementById(scoreId).textContent = `Score: ${score}`;
        }
export function saveRisk() {
            if (!window.rms) return;
            
            const formData = {
                processus: document.getElementById('processus').value,
                description: document.getElementById('description').value,
                typeCorruption: document.getElementById('typeCorruption').value,
                probBrut: parseInt(document.getElementById('probBrut').value),
                impactBrut: parseInt(document.getElementById('impactBrut').value),
                probNet: parseInt(document.getElementById('probNet').value),
                impactNet: parseInt(document.getElementById('impactNet').value),
                probPost: parseInt(document.getElementById('probPost').value),
                impactPost: parseInt(document.getElementById('impactPost').value),
                responsable: 'Marie Dupont',
                controls: []
            };
            
            // Validate form
            if (!formData.processus || !formData.description || !formData.typeCorruption) {
                showNotification('error', 'Veuillez remplir tous les champs obligatoires');
                return;
            }
            
            window.rms.addRisk(formData);
            closeModal('riskModal');
            showNotification('success', 'Risque ajouté avec succès!');
        }
export function showNotification(type, message) {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
export function exportDashboard() {
            if (window.rms) window.rms.exportData('json');
        }
export function exportRisks() {
            if (window.rms) window.rms.exportData('csv');
        }
export function generateReport(type) {
            showNotification('info', `Génération du rapport ${type} en cours...`);
            setTimeout(() => {
                showNotification('success', 'Rapport généré avec succès!');
            }, 2000);
        }
export function refreshDashboard() {
            if (window.rms) {
                window.rms.updateDashboard();
                showNotification('success', 'Tableau de bord actualisé');
            }
        }

        // Close modals on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.show').forEach(modal => {
                    modal.classList.remove('show');
                });
            }
        });

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });
export function initPatch() {
  const RMS = window.rms || window.RMS || window.RiskSystem || {};
  // Guard: bind common getters
  const state = {
    get risks(){ return RMS.risks || window.risks || []; },
    set risks(v){ if (RMS.risks) RMS.risks = v; else window.risks = v; },
    get controls(){ return RMS.controls || window.controls || []; },
    set controls(v){ if (RMS.controls) RMS.controls = v; else window.controls = v; },
    get history(){ return RMS.history || window.historyLog || []; },
    set history(v){ if (RMS.history) RMS.history = v; else window.historyLog = v; },
    save: (label="auto") => {
      try {
        if (RMS.saveData) { RMS.saveData(); }
        else if (window.saveData) { window.saveData(); }
        addHistoryItem(`Sauvegarde ${label}`);
        updateLastSaveTime && updateLastSaveTime();
      } catch(e){ console.warn("save error", e); }
    },
    renderAll: () => {
      try {
        if (RMS.renderAll) RMS.renderAll();
        if (window.renderRisks) window.renderRisks();
        if (window.renderMatrix) window.renderMatrix();
        if (window.updateKPI) window.updateKPI();
        if (window.updateCharts) window.updateCharts();
      } catch(e){ console.warn("renderAll error", e); }
    }
  };

  function addHistoryItem(action, meta){
    try{
      const item = { id: Date.now().toString(36)+Math.random().toString(36).slice(2,6), ts: new Date().toISOString(), action, meta: meta||{} };
      state.history = [...state.history, item];
    }catch(e){ console.warn("history error", e); }
  }

  // CSV escaping
  function csvEscape(val){
    if (val === null || val === undefined) return "";
    const s = String(val);
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g,'""') + '"';
    return s;
  }
  function toCSV(rows){
    if (!rows || !rows.length) return "";
    const keys = Object.keys(rows[0]);
    const head = keys.map(csvEscape).join(",");
    const body = rows.map(r => keys.map(k => csvEscape(r[k])).join(",")).join("\n");
    return head + "\n" + body;
  }
  function downloadBlob(filename, mime, data){
    const blob = new Blob([data], {type: mime});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 0);
  }

  // === Importer ===
  window.importRisks = async function importRisks(){
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.csv,.txt';
    input.onchange = (ev)=>{
      const file = ev.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ()=>{
        try {
          const text = String(reader.result || "");
          if (file.name.toLowerCase().endswith(".json")) {
            const obj = JSON.parse(text);
            if (obj.risks) state.risks = mergeById(state.risks, obj.risks);
            if (obj.controls) state.controls = mergeById(state.controls, obj.controls);
            if (obj.history) state.history = [...state.history, ...obj.history];
            addHistoryItem("Import JSON", {file: file.name, counts: {risks: obj.risks?.length||0, controls: obj.controls?.length||0}});
          } else {
            // naive CSV: expects headers
            const rows = csvParse(text);
            if (rows.length){
              const mapped = rows.map(r => ({
                id: r.id || (Date.now()+Math.random()).toString(36),
                titre: r.titre || r.title || r.name || "Sans titre",
                description: r.description || "",
                typeCorruption: r.typeCorruption || r.type || "autre",
                probabilite: Number(r.probabilite ?? r.probability ?? 2),
                impact: Number(r.impact ?? 2),
                status: r.status || r.statut || "nouveau",
                controles: r.controles ? String(r.controles).split("|").filter(Boolean) : []
              }));
              state.risks = mergeById(state.risks, mapped);
              addHistoryItem("Import CSV", {file: file.name, count: mapped.length});
            }
          }
          state.save("après import");
          state.renderAll();
          toast && toast("Import réussi");
        } catch(err){
          console.error(err);
          alert("Erreur à l'import : " + err.message);
        }
      };
      reader.readAsText(file, 'utf-8');
    };
    input.click();
  };

  function mergeById(base, incoming){
    const map = new Map(base.map(x=>[String(x.id), x]));
    for (const it of incoming){
      const k = String(it.id);
      if (map.has(k)) map.set(k, {...map.get(k), ...it});
      else map.set(k, it);
    }
    return Array.from(map.values());
  }

  function csvParse(text){
    // simple CSV parser (handles quotes)
    const lines = text.replace(/\r\n/g,"\n").split("\n").filter(Boolean);
    if (!lines.length) return [];
    const headers = splitCSVLine(lines[0]);
    return lines.slice(1).map(line => {
      const cols = splitCSVLine(line);
      const obj = {};
      headers.forEach((h,i)=> obj[h.trim()] = cols[i] ?? "");
      return obj;
    });
  }
  function splitCSVLine(line){
    const out=[], len=line.length;
    let cur="", inQ=false;
    for(let i=0;i<len;i++){
      const ch=line[i];
      if (inQ){
        if (ch === '"'){
          if (line[i+1] === '"'){ cur+='"'; i++; }
          else { inQ=false; }
        } else cur+=ch;
      } else {
        if (ch === '"') inQ=true;
        else if (ch === ','){ out.push(cur); cur=""; }
        else cur+=ch;
      }
    }
    out.push(cur);
    return out;
  }

  // === Export History ===
  window.exportHistory = function exportHistory(format="json"){
    const items = state.history || [];
    if (!items.length){ alert("Aucun élément d'historique"); return; }
    if (format === "csv"){
      const csv = toCSV(items);
      const bom = "\ufeff"; // Excel
      downloadBlob("historique.csv","text/csv;charset=utf-8", bom + csv);
    } else {
      downloadBlob("historique.json","application/json;charset=utf-8", JSON.stringify(items, null, 2));
    }
    addHistoryItem("Export historique", {format});
  };

  // === Export Matrix Capture ===
  window.exportMatrix = async function exportMatrix(){
    const container = document.querySelector('.matrix-container') || document.querySelector('#matrix') || document.body;
    if (!window.html2canvas){
      alert("html2canvas non chargé. Connectez-vous à Internet ou ajoutez la librairie en local.");
      return;
    }
    const canvas = await html2canvas(container, {scale: 2});
    canvas.toBlob((blob)=>{
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = "matrice-risques.png";
      document.body.appendChild(a); a.click();
      setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); },0);
      addHistoryItem("Export matrice (PNG)");
    });
  };

  // === Toggle Fullscreen ===
  window.toggleFullScreen = function toggleFullScreen(){
    const el = document.querySelector('.matrix-container') || document.documentElement;
    const doc = document;
    if (!doc.fullscreenElement){
      (el.requestFullscreen && el.requestFullscreen()) ||
      (el.webkitRequestFullscreen && el.webkitRequestFullscreen());
    } else {
      (doc.exitFullscreen && doc.exitFullscreen()) ||
      (doc.webkitExitFullscreen && doc.webkitExitFullscreen());
    }
  };

  // === Controls CRUD (minimal UI via prompt) ===
  window.addNewControl = function addNewControl(){
    const name = prompt("Nom du contrôle ?");
    if (!name) return;
    const id = "ctl_" + Date.now().toString(36);
    const ctrl = { id, name, description: "", owner: "", effectiveness: "moyen" };
    state.controls = [...state.controls, ctrl];
    addHistoryItem("Nouveau contrôle", {id, name});
    state.save("contrôle");
    state.renderAll();
  };

  window.addControlToRisk = function addControlToRisk(riskId){
    const rId = riskId || prompt("ID du risque à enrichir ?");
    const risk = (state.risks||[]).find(r => String(r.id)===String(rId));
    if (!risk){ alert("Risque introuvable"); return; }
    const options = state.controls.map(c=>`${c.id}:${c.name}`).join("\n") || "(aucun contrôle)";
    const chosen = prompt("Sélectionnez un contrôle (id) parmi :\n"+options);
    const ctrl = state.controls.find(c=>String(c.id)===String(chosen));
    if (!ctrl){ alert("Contrôle introuvable"); return; }
    risk.controles = Array.from(new Set([...(risk.controles||[]), ctrl.id]));
    addHistoryItem("Lien contrôle→risque", {riskId:risk.id, controlId: ctrl.id});
    state.save("lien contrôle");
    state.renderAll();
  };

  // === Edit Risk (basic) ===
  window.editRisk = function editRisk(riskId){
    const risk = (state.risks||[]).find(r => String(r.id)===String(riskId));
    if (!risk){ alert("Risque introuvable"); return; }
    const titre = prompt("Titre du risque :", risk.titre || risk.title || "");
    if (titre===null) return;
    const description = prompt("Description :", risk.description || "");
    if (description===null) return;
    const probabilite = Number(prompt("Probabilité (1-4):", risk.probabilite ?? 2) || 2);
    const impact = Number(prompt("Impact (1-4):", risk.impact ?? 2) || 2);
    const status = prompt("Statut (nouveau|en-cours|traite):", risk.status || "nouveau") || "nouveau";
    Object.assign(risk, {titre, description, probabilite, impact, status});
    addHistoryItem("Édition risque", {riskId});
    state.save("risque modifié");
    state.renderAll();
  };

  // === Update Charts (minimal) ===
  window.updateCharts = function updateCharts(){
    if (!window.Chart) return; // library not loaded
    const byStatus = (state.risks||[]).reduce((acc, r)=>{
      const k = r.status || "inconnu"; acc[k] = (acc[k]||0)+1; return acc;
    }, {});
    const canvas = document.querySelector("#chart-status") || document.querySelector("canvas.chart-status");
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (canvas._chart) { canvas._chart.destroy(); }
    canvas._chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(byStatus),
        datasets: [{ data: Object.values(byStatus) }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
  };

  // === Export Dashboard PDF ===
  window.exportDashboard = async function exportDashboard(){
    const root = document.querySelector('#dashboard') || document.body;
    if (!window.html2canvas || !window.jspdf){
      alert("Librairies manquantes (html2canvas / jsPDF). Activez Internet ou installez-les en local.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({orientation: 'portrait', unit: 'pt', format: 'a4'});
    const A4_W = 595.28, A4_H = 841.89, M = 24;
    const scale = 2;

    const sections = root.querySelectorAll(':scope > *');
    let first = true;
    for (const sec of sections){
      const canvas = await html2canvas(sec, {scale});
      const imgW = A4_W - 2*M;
      const ratio = imgW / canvas.width;
      const imgH = canvas.height * ratio;
      if (!first) pdf.addPage();
      first = false;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', M, M, imgW, imgH);
    }
    pdf.save('dashboard-risques.pdf');
    addHistoryItem("Export dashboard PDF");
  };

  // === Safer event handlers (avoid global event) ===
  function rewireHandlers(){
    document.querySelectorAll("[data-switch-tab]").forEach(btn=>{
      btn.onclick = (e)=>{
        const tab = btn.getAttribute("data-switch-tab");
        if (window.switchTab) window.switchTab(e, tab);
        else {
          document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active", x.id===tab));
          document.querySelectorAll("[data-switch-tab]").forEach(x=>x.classList.toggle("active", x===btn));
        }
      };
    });
    document.querySelectorAll("[data-matrix-view]").forEach(btn=>{
      btn.onclick = (e)=>{
        const view = btn.getAttribute("data-matrix-view");
        if (window.changeMatrixView) window.changeMatrixView(e, view);
        document.querySelectorAll("[data-matrix-view]").forEach(x=>x.classList.toggle("active", x===btn));
      };
    });
  }
  try { rewireHandlers(); } catch(e){}
  try { updateCharts(); } catch(e){}

  // === Functions for Control Management ===
  
  let currentEditingControlId = null;
  let selectedRisksForControl = [];

  // Open control modal for new control
  window.addNewControl = function() {
    currentEditingControlId = null;
    selectedRisksForControl = [];
    
    // Reset form
    document.getElementById('controlForm').reset();
    document.getElementById('controlModalTitle').textContent = 'Nouveau Contrôle';
    document.getElementById('selectedRisks').innerHTML = '';
    
    // Show modal
    document.getElementById('controlModal').classList.add('show');
  };

  // Open control modal for editing
  window.editControl = function(controlId) {
    const control = state.controls.find(c => c.id == controlId);
    if (!control) {
      alert('Contrôle introuvable');
      return;
    }

    currentEditingControlId = controlId;
    selectedRisksForControl = control.risks || [];

    // Fill form with control data
    document.getElementById('controlName').value = control.name || '';
    document.getElementById('controlType').value = control.type || '';
    document.getElementById('controlOwner').value = control.owner || '';
    document.getElementById('controlFrequency').value = control.frequency || '';
    document.getElementById('controlMode').value = control.mode || '';
    document.getElementById('controlEffectiveness').value = control.effectiveness || '';
    document.getElementById('controlStatus').value = control.status || '';
    document.getElementById('controlDescription').value = control.description || '';

    // Update modal title and selected risks display
    document.getElementById('controlModalTitle').textContent = 'Modifier le Contrôle';
    updateSelectedRisksDisplay();

    // Show modal
    document.getElementById('controlModal').classList.add('show');
  };

  // Delete control
  window.deleteControl = function(controlId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contrôle ?')) {
      return;
    }

    const controlIndex = state.controls.findIndex(c => c.id == controlId);
    if (controlIndex === -1) {
      alert('Contrôle introuvable');
      return;
    }

    const controlName = state.controls[controlIndex].name;
    state.controls.splice(controlIndex, 1);

    // Remove control from risks
    state.risks.forEach(risk => {
      if (risk.controls && risk.controls.includes(controlId)) {
        risk.controls = risk.controls.filter(id => id !== controlId);
      }
    });

    addHistoryItem("Suppression contrôle", {id: controlId, name: controlName});
    state.save("suppression-contrôle");
    state.renderAll();
    
    toast(`Contrôle "${controlName}" supprimé avec succès`);
  };

  // Close control modal
  window.closeControlModal = function() {
    document.getElementById('controlModal').classList.remove('show');
  };

  // Open risk selector modal
  window.openRiskSelector = function() {
    const riskList = document.getElementById('riskList');
    
    riskList.innerHTML = state.risks.map(risk => {
      const isSelected = selectedRisksForControl.includes(risk.id);
      return `
        <div class="risk-list-item">
          <input type="checkbox" id="risk-${risk.id}" ${isSelected ? 'checked' : ''} 
                 onchange="toggleRiskSelection(${risk.id})">
          <div class="risk-item-info">
            <div class="risk-item-title">${risk.description}</div>
            <div class="risk-item-meta">
              Processus: ${risk.processus} | Type: ${risk.typeCorruption}
            </div>
          </div>
        </div>
      `;
    }).join('');

    document.getElementById('riskSelectorModal').classList.add('show');
  };

  // Close risk selector modal
  window.closeRiskSelector = function() {
    document.getElementById('riskSelectorModal').classList.remove('show');
  };

  // Toggle risk selection
  window.toggleRiskSelection = function(riskId) {
    const index = selectedRisksForControl.indexOf(riskId);
    if (index > -1) {
      selectedRisksForControl.splice(index, 1);
    } else {
      selectedRisksForControl.push(riskId);
    }
  };

  // Confirm risk selection
  window.confirmRiskSelection = function() {
    updateSelectedRisksDisplay();
    closeRiskSelector();
  };

  // Update selected risks display
  function updateSelectedRisksDisplay() {
    const container = document.getElementById('selectedRisks');
    
    if (selectedRisksForControl.length === 0) {
      container.innerHTML = '<div style="color: #7f8c8d; font-style: italic;">Aucun risque sélectionné</div>';
      return;
    }

    container.innerHTML = selectedRisksForControl.map(riskId => {
      const risk = state.risks.find(r => r.id === riskId);
      if (!risk) return '';
      
      return `
        <div class="selected-risk-item">
          ${risk.description.substring(0, 50)}${risk.description.length > 50 ? '...' : ''}
          <span class="remove-risk" onclick="removeRiskFromSelection(${riskId})">×</span>
        </div>
      `;
    }).join('');
  }

  // Remove risk from selection
  window.removeRiskFromSelection = function(riskId) {
    selectedRisksForControl = selectedRisksForControl.filter(id => id !== riskId);
    updateSelectedRisksDisplay();
  };

  // Save control (form submission)
  window.saveControl = function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const controlData = {
      name: formData.get('name'),
      type: formData.get('type'),
      owner: formData.get('owner'),
      frequency: formData.get('frequency'),
      mode: formData.get('mode'),
      effectiveness: formData.get('effectiveness'),
      status: formData.get('status'),
      description: formData.get('description'),
      risks: [...selectedRisksForControl]
    };

    // Validation
    if (!controlData.name || !controlData.type || !controlData.owner || !controlData.frequency || 
        !controlData.mode || !controlData.effectiveness || !controlData.status) {
      alert('Veuillez remplir tous les champs obligatoires (marqués d\'un *)');
      return;
    }

    if (currentEditingControlId) {
      // Update existing control
      const controlIndex = state.controls.findIndex(c => c.id == currentEditingControlId);
      if (controlIndex !== -1) {
        state.controls[controlIndex] = {
          ...state.controls[controlIndex],
          ...controlData
        };
        addHistoryItem("Modification contrôle", {id: currentEditingControlId, name: controlData.name});
        toast(`Contrôle "${controlData.name}" modifié avec succès`);
      }
    } else {
      // Create new control
      const newControl = {
        id: Date.now(),
        ...controlData,
        dateCreation: new Date().toISOString().split('T')[0]
      };
      
      state.controls.push(newControl);
      addHistoryItem("Nouveau contrôle", {id: newControl.id, name: controlData.name});
      toast(`Contrôle "${controlData.name}" créé avec succès`);
    }

    // Save and refresh
    state.save("contrôle");
    state.renderAll();
    closeControlModal();
  };

  // small toast helper if exists
  function toast(msg){
    const t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style, {position:'fixed',bottom:'16px',right:'16px',padding:'10px 14px',background:'#111',color:'#fff',borderRadius:'8px',boxShadow:'0 4px 12px rgba(0,0,0,.25)',zIndex:9999,opacity:'0',transition:'opacity .2s'});
    document.body.appendChild(t);
    requestAnimationFrame(()=>{ t.style.opacity='1'; });
    setTimeout(()=>{ t.style.opacity='0'; setTimeout(()=>t.remove(),200); }, 1600);
  }


}
