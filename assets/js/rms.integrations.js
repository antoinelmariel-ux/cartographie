// Enhanced Risk Management System - Integrations & Advanced Features

function exportDashboard() {
    if (!window.rms) {
        const message = 'Instance du tableau de bord introuvable : export impossible';
        console.warn(message);
        if (typeof showNotification === 'function') {
            showNotification('error', message);
        } else {
            alert(message);
        }
        return;
    }

    const jsPdfNamespace = window.jspdf || window.jsPDF || window.jsPdf;
    const jsPDFConstructor = jsPdfNamespace && (jsPdfNamespace.jsPDF || jsPdfNamespace);

    if (typeof jsPDFConstructor !== 'function') {
        const message = 'Bibliothèque jsPDF introuvable : impossible de générer le PDF';
        console.error(message);
        if (typeof showNotification === 'function') {
            showNotification('error', message);
        } else {
            alert(message);
        }
        return;
    }

    if (typeof rms.getDashboardExportData !== 'function') {
        const message = 'Export du tableau de bord indisponible avec la version actuelle';
        console.error(message);
        if (typeof showNotification === 'function') {
            showNotification('error', message);
        } else {
            alert(message);
        }
        return;
    }

    try {
        const data = rms.getDashboardExportData();

        if (!data || !data.metrics || !data.metrics.stats) {
            const message = 'Aucune donnée valide à exporter pour le tableau de bord';
            console.warn(message, data);
            if (typeof showNotification === 'function') {
                showNotification('warning', message);
            } else {
                alert(message);
            }
            return;
        }

        const doc = new jsPDFConstructor({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        const margin = 40;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const lineHeight = 14;
        let cursorY = margin;

        const ensureSpace = (height = lineHeight) => {
            if (cursorY + height > pageHeight - margin) {
                doc.addPage();
                cursorY = margin;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(11);
            }
        };

        const splitText = (text, widthOffset = 0) => {
            return doc.splitTextToSize(String(text ?? ''), pageWidth - (2 * margin) - widthOffset);
        };

        const addParagraph = (text) => {
            const lines = splitText(text);
            lines.forEach((line) => {
                ensureSpace();
                doc.text(line, margin, cursorY);
                cursorY += lineHeight;
            });
        };

        const addSectionTitle = (title) => {
            ensureSpace(24);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text(String(title || ''), margin, cursorY);
            cursorY += 18;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
        };

        const addBullet = (text) => {
            const lines = splitText(text, 16);
            lines.forEach((line, index) => {
                ensureSpace();
                if (index === 0) {
                    doc.text('•', margin, cursorY);
                    doc.text(line, margin + 12, cursorY);
                } else {
                    doc.text(line, margin + 12, cursorY);
                }
                cursorY += lineHeight;
            });
        };

        const formatNumber = (value, { decimals = 0 } = {}) => {
            if (!Number.isFinite(value)) {
                return '-';
            }
            return Number(value).toLocaleString('fr-FR', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });
        };

        const formatDateTime = (isoString) => {
            if (!isoString) {
                return '-';
            }
            const date = new Date(isoString);
            if (Number.isNaN(date.getTime())) {
                return '-';
            }
            return date.toLocaleString('fr-FR');
        };

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('Tableau de bord - Synthèse', margin, cursorY);
        cursorY += 26;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        addParagraph(`Généré le ${formatDateTime(data.generatedAt)}`);

        const { metrics, topRisks = [], processOverview = {}, alerts = {} } = data;
        const stats = metrics.stats || {};

        addSectionTitle('Indicateurs clés');
        addParagraph(`Total des risques validés : ${formatNumber(stats.total)}`);
        const criticalShare = stats.total ? Math.round((stats.critical / stats.total) * 100) : 0;
        const highShare = stats.total ? Math.round((stats.high / stats.total) * 100) : 0;
        addParagraph(`Risques critiques : ${formatNumber(stats.critical)} (${criticalShare}% du total)`);
        addParagraph(`Risques élevés : ${formatNumber(stats.high)} (${highShare}% du total)`);
        addParagraph(`Score global de maîtrise : ${formatNumber(metrics.globalScore)} %`);
        addParagraph(`Réduction moyenne du score net : ${formatNumber(metrics.averageReduction, { decimals: 1 })}`);
        addParagraph(`Contrôles actifs : ${formatNumber(metrics.activeControls)} sur ${formatNumber(metrics.totalControls)}`);

        const actionPlanMetrics = metrics.actionPlanStatusMetrics || { total: 0, distribution: [] };
        if (!actionPlanMetrics.total) {
            addParagraph("Plans d'actions : aucun plan enregistré.");
        } else {
            addParagraph(`Plans d'actions suivis : ${formatNumber(actionPlanMetrics.total)}`);
            const filledDistribution = Array.isArray(actionPlanMetrics.distribution)
                ? actionPlanMetrics.distribution.filter(item => (Number(item?.count) || 0) > 0)
                : [];
            if (filledDistribution.length) {
                addParagraph('Répartition par statut :');
                filledDistribution.forEach((item) => {
                    const label = item?.label || item?.value || 'Non défini';
                    addBullet(`${label} : ${formatNumber(item.count)} plan${item.count > 1 ? 's' : ''}`);
                });
            }
        }

        addSectionTitle('Processus surveillés');
        const distribution = Array.isArray(processOverview.distribution) ? processOverview.distribution : [];
        if (!distribution.length) {
            addParagraph('Aucun risque à analyser sur les processus.');
        } else {
            const maxProcess = 5;
            distribution.slice(0, maxProcess).forEach((entry) => {
                addBullet(`${entry.label} : ${formatNumber(entry.count)} risque${entry.count > 1 ? 's' : ''}`);
            });
            if (distribution.length > maxProcess) {
                addParagraph(`... et ${distribution.length - maxProcess} processus supplémentaires.`);
            }
        }

        const severity = Array.isArray(processOverview.severity)
            ? processOverview.severity.filter(item => Number.isFinite(item?.average) && item.count > 0)
            : [];
        if (severity.length) {
            addParagraph('Scores nets moyens par processus :');
            const maxSeverity = 5;
            severity.slice(0, maxSeverity).forEach((entry) => {
                addBullet(`${entry.label} : score moyen ${formatNumber(entry.average, { decimals: 1 })} (max ${formatNumber(entry.maxScore, { decimals: 1 })})`);
            });
            if (severity.length > maxSeverity) {
                addParagraph(`... et ${severity.length - maxSeverity} autres processus suivis.`);
            }
        }

        addSectionTitle('Top risques nets');
        if (!topRisks.length) {
            addParagraph('Aucun risque validé disponible.');
        } else {
            const maxRisks = 5;
            topRisks.slice(0, maxRisks).forEach((risk) => {
                const processLabel = risk.sousProcessus
                    ? `${risk.processus} / ${risk.sousProcessus}`
                    : risk.processus;
                addBullet(`${risk.rank}. ${risk.titre} — ${processLabel} (Score ${formatNumber(risk.score)}, P${risk.probNet} × I${risk.impactNet})`);
            });
            if (topRisks.length > maxRisks) {
                addParagraph(`... et ${topRisks.length - maxRisks} risques supplémentaires dans l'application.`);
            }
        }

        addSectionTitle('Alertes et éléments de vigilance');
        const severeRisks = Array.isArray(alerts.severeRisks) ? alerts.severeRisks : [];
        if (!severeRisks.length) {
            addParagraph("Aucun risque sévère ou critique sans plan d'action.");
        } else {
            addParagraph('Risques sévères ou critiques sans plan d\'actions :');
            severeRisks.slice(0, 5).forEach((risk) => {
                addBullet(`${risk.description} — ${risk.process} (${risk.level}) • Score ${formatNumber(risk.score)} • ${risk.formattedDate}`);
            });
            if (severeRisks.length > 5) {
                addParagraph(`... et ${severeRisks.length - 5} alertes supplémentaires.`);
            }
        }

        const overduePlans = Array.isArray(alerts.overdueActionPlans) ? alerts.overdueActionPlans : [];
        if (!overduePlans.length) {
            addParagraph("Plans d'actions : aucun retard détecté.");
        } else {
            addParagraph("Plans d'actions en retard :");
            overduePlans.slice(0, 5).forEach((plan) => {
                addBullet(`${plan.title} — ${plan.owner || 'Responsable non défini'} • Échéance ${plan.formattedDueDate} • Statut ${plan.statusLabel}`);
            });
            if (overduePlans.length > 5) {
                addParagraph(`... et ${overduePlans.length - 5} plans supplémentaires en retard.`);
            }
        }

        doc.save('tableau-de-bord.pdf');

        if (typeof showNotification === 'function') {
            showNotification('success', 'Export PDF du tableau de bord généré');
        }
    } catch (error) {
        console.error('Erreur lors de la génération du PDF du tableau de bord', error);
        const message = "Échec de la génération du PDF du tableau de bord";
        if (typeof showNotification === 'function') {
            showNotification('error', `${message} : ${error.message}`);
        } else {
            alert(`${message}\n${error.message}`);
        }
    }
}
window.exportDashboard = exportDashboard;

function exportRisks() {
    if (window.rms) rms.exportData('csv');
}
window.exportRisks = exportRisks;

function downloadRmsData() {
    if (!window.rms) {
        console.warn('RiskManagementSystem indisponible pour la sauvegarde.');
        if (typeof showNotification === 'function') {
            showNotification('error', "Sauvegarde impossible : instance non initialisée");
        }
        return;
    }

    try {
        if (typeof rms.saveData === 'function') {
            rms.saveData();
        }
        if (typeof rms.saveConfig === 'function') {
            rms.saveConfig();
        }

        const snapshot = rms.getSnapshot();
        const payload = {
            exportedAt: new Date().toISOString(),
            risks: Array.isArray(snapshot.risks) ? snapshot.risks : [],
            controls: Array.isArray(snapshot.controls) ? snapshot.controls : [],
            actionPlans: Array.isArray(snapshot.actionPlans) ? snapshot.actionPlans : [],
            config: snapshot.config || {}
        };

        if (Array.isArray(snapshot.history)) {
            payload.history = snapshot.history;
        }

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'cartographie-donnees.json';
        document.body.appendChild(anchor);
        anchor.click();
        setTimeout(() => {
            document.body.removeChild(anchor);
            URL.revokeObjectURL(url);
        }, 0);

        if (typeof showNotification === 'function') {
            showNotification('success', 'Sauvegarde JSON générée');
        }
    } catch (error) {
        console.error('Erreur lors de la sauvegarde JSON', error);
        const message = "Erreur lors de l'export des données";
        if (typeof showNotification === 'function') {
            showNotification('error', message);
        } else {
            alert(`${message} : ${error.message}`);
        }
    }
}
window.downloadRmsData = downloadRmsData;

function loadRmsDataFromFile() {
    if (!window.rms) {
        console.warn('RiskManagementSystem indisponible pour le chargement.');
        if (typeof showNotification === 'function') {
            showNotification('error', "Chargement impossible : instance non initialisée");
        }
        return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.style.display = 'none';

    const handleError = (message, error) => {
        if (error) {
            console.error(message, error);
        }
        if (typeof showNotification === 'function') {
            showNotification('error', message);
        } else {
            alert(message);
        }
    };

    input.addEventListener('change', (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) {
            input.remove();
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            try {
                const text = reader.result ? String(reader.result) : '';
                const parsed = JSON.parse(text);

                if (!parsed || typeof parsed !== 'object') {
                    throw new Error('Fichier JSON invalide');
                }

                const snapshot = {
                    risks: Array.isArray(parsed.risks) ? parsed.risks : [],
                    controls: Array.isArray(parsed.controls) ? parsed.controls : [],
                    actionPlans: Array.isArray(parsed.actionPlans) ? parsed.actionPlans : [],
                    config: parsed.config
                };

                if (Array.isArray(parsed.history)) {
                    snapshot.history = parsed.history;
                }

                rms.loadSnapshot(snapshot);
            } catch (error) {
                handleError('Impossible de charger le fichier de données sélectionné', error);
            } finally {
                input.value = '';
                input.remove();
            }
        };

        reader.onerror = () => {
            handleError('Lecture du fichier de données impossible', reader.error);
            input.value = '';
            input.remove();
        };

        reader.readAsText(file, 'utf-8');
    });

    document.body.appendChild(input);
    input.click();
}
window.loadRmsDataFromFile = loadRmsDataFromFile;
function applyPatch() {
    (function(){
      const RMS = window.rms || window.RMS || window.RiskSystem || {};
      const state = {
        get risks(){ return RMS.risks || window.risks || []; },
        set risks(v){ if (RMS.risks) RMS.risks = v; else window.risks = v; },
        get controls(){ return RMS.controls || window.controls || []; },
        set controls(v){ if (RMS.controls) RMS.controls = v; else window.controls = v; },
        get actionPlans(){ return RMS.actionPlans || window.actionPlans || []; },
        set actionPlans(v){ if (RMS.actionPlans) RMS.actionPlans = v; else window.actionPlans = v; },
        get history(){ return RMS.history || window.historyLog || []; },
        set history(v){ if (RMS.history) RMS.history = v; else window.historyLog = v; },
        save: (label="auto") => {
          try {
            if (RMS.saveData) { RMS.saveData(); }
            else if (window.saveData) { window.saveData(); }
            const effectiveLabel = (typeof label === 'string' && label.trim()) ? label.trim() : 'auto';
            const description = effectiveLabel !== 'auto'
              ? `Sauvegarde "${effectiveLabel}" enregistrée.`
              : 'Sauvegarde automatique enregistrée.';
            addHistoryItem(`Sauvegarde ${effectiveLabel}`, description, { label: effectiveLabel });
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

      function addHistoryItem(action, descriptionOrMeta, meta){
        try{
          let description = descriptionOrMeta;
          let metadata = meta;

          if (descriptionOrMeta && typeof descriptionOrMeta === 'object' && !Array.isArray(descriptionOrMeta)) {
            metadata = descriptionOrMeta;
            description = descriptionOrMeta.description;
          }

          if (metadata && typeof metadata !== 'object') {
            metadata = { value: metadata };
          }

          const now = new Date();
          const entry = {
            id: now.getTime().toString(36) + Math.random().toString(36).slice(2, 6),
            date: now.toISOString(),
            action,
            description: (typeof description === 'string' && description.trim()) ? description.trim() : action,
            user: (metadata && typeof metadata.user === 'string' && metadata.user.trim()) ? metadata.user.trim() : 'Système'
          };

          if (metadata && typeof metadata === 'object') {
            const metaCopy = { ...metadata };
            delete metaCopy.user;
            delete metaCopy.description;
            if (Object.keys(metaCopy).length) {
              entry.meta = metaCopy;
            }
          }

          state.history = [...state.history, entry];

          if (RMS && typeof RMS.updateHistory === 'function') {
            try {
              RMS.updateHistory();
            } catch (err) {
              console.warn('history render error', err);
            }
          }
        }catch(e){ console.warn("history error", e); }
      }

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
              if (file.name.toLowerCase().endsWith(".json")) {
                const obj = JSON.parse(text);
                if (obj.risks) state.risks = mergeById(state.risks, obj.risks);
                if (obj.controls) state.controls = mergeById(state.controls, obj.controls);
                if (obj.history) state.history = [...state.history, ...obj.history];
                const riskCount = obj.risks?.length || 0;
                const controlCount = obj.controls?.length || 0;
                const jsonImportDescription = `Import du fichier ${file.name} : ${riskCount} risque${riskCount > 1 ? 's' : ''} et ${controlCount} contrôle${controlCount > 1 ? 's' : ''}.`;
                addHistoryItem("Import JSON", jsonImportDescription, {file: file.name, counts: {risks: riskCount, controls: controlCount}});
              } else {
                const rows = csvParse(text);
                if (rows.length){
                  const generateKeyVariants = (key) => {
                    if (key === undefined || key === null) return [];
                    const str = String(key);
                    const trimmed = str.trim();
                    if (!trimmed) return [];
                    const normalized = trimmed.normalize ? trimmed.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : trimmed;
                    const compactTrimmed = trimmed.replace(/[\s_-]+/g, '');
                    const compactNormalized = normalized.replace(/[\s_-]+/g, '');
                    return Array.from(new Set([
                      str,
                      trimmed,
                      trimmed.toLowerCase(),
                      normalized,
                      normalized.toLowerCase(),
                      compactTrimmed,
                      compactTrimmed.toLowerCase(),
                      compactNormalized,
                      compactNormalized.toLowerCase()
                    ])).filter(Boolean);
                  };

                  const createRowAccessor = (row) => {
                    const index = new Map();
                    Object.entries(row || {}).forEach(([key, value]) => {
                      if (value === undefined || value === null) return;
                      if (typeof value === 'string' && value.trim() === '') return;
                      generateKeyVariants(key).forEach(variant => {
                        if (variant && !index.has(variant)) {
                          index.set(variant, value);
                        }
                      });
                    });
                    return {
                      get: (...candidates) => {
                        for (const candidate of candidates) {
                          if (candidate === undefined || candidate === null) continue;
                          const variants = generateKeyVariants(candidate);
                          for (const variant of variants) {
                            if (index.has(variant)) {
                              return index.get(variant);
                            }
                          }
                        }
                        return undefined;
                      }
                    };
                  };

                  const hasMeaningfulValue = (value) => {
                    if (value === undefined || value === null) return false;
                    if (Array.isArray(value)) {
                      return value.some(item => hasMeaningfulValue(item));
                    }
                    if (typeof value === 'string') {
                      return value.trim() !== '';
                    }
                    return true;
                  };

                  const toText = (value, fallback = '') => {
                    if (value === undefined || value === null) return fallback;
                    if (typeof value === 'string') {
                      const trimmed = value.trim();
                      return trimmed === '' ? fallback : trimmed;
                    }
                    if (typeof value === 'number' && Number.isFinite(value)) {
                      return String(value);
                    }
                    if (typeof value === 'boolean') {
                      return value ? 'true' : 'false';
                    }
                    const str = String(value);
                    return str.trim() || fallback;
                  };

                  const parseScore = (value, fallback = 2) => {
                    if (Array.isArray(value)) {
                      value = value.find(item => item !== undefined && item !== null && String(item).trim() !== '');
                    }
                    if (value === undefined || value === null || value === '') return fallback;
                    const normalizedValue = typeof value === 'string'
                      ? value.trim().replace(',', '.')
                      : value;
                    const numeric = Number(normalizedValue);
                    if (Number.isFinite(numeric)) {
                      const rounded = Math.round(numeric);
                      if (rounded > 0) {
                        return Math.min(4, Math.max(1, rounded));
                      }
                    }
                    return fallback;
                  };

                  const splitToList = (value) => {
                    if (value === undefined || value === null) return [];
                    if (Array.isArray(value)) {
                      const acc = [];
                      value.forEach(item => {
                        splitToList(item).forEach(v => acc.push(v));
                      });
                      return acc;
                    }
                    if (typeof value === 'string') {
                      const trimmed = value.trim();
                      if (!trimmed) return [];
                      if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))){
                        try {
                          const parsed = JSON.parse(trimmed);
                          if (Array.isArray(parsed)) {
                            return splitToList(parsed);
                          }
                        } catch (err) {
                          // Ignore JSON parsing errors and fallback to splitting
                        }
                      }
                      return trimmed.split(/[|;,]/).map(part => part.trim()).filter(Boolean);
                    }
                    return [String(value).trim()].filter(Boolean);
                  };

                  const parseTextList = (value) => {
                    const list = splitToList(value);
                    const seen = new Set();
                    const result = [];
                    list.forEach(item => {
                      const text = toText(item, '');
                      if (!text) return;
                      const key = text.toLowerCase();
                      if (!seen.has(key)) {
                        seen.add(key);
                        result.push(text);
                      }
                    });
                    return result;
                  };

                  const parseIdList = (value) => {
                    const list = splitToList(value);
                    const seen = new Set();
                    const result = [];
                    list.forEach(item => {
                      const raw = toText(item, '');
                      if (!raw) return;
                      const normalized = /^-?\d+$/.test(raw) ? Number.parseInt(raw, 10) : raw;
                      const key = String(normalized);
                      if (!seen.has(key)) {
                        seen.add(key);
                        result.push(normalized);
                      }
                    });
                    return result;
                  };

                  const mapCsvRowToRisk = (row) => {
                    if (!row || !Object.values(row).some(value => hasMeaningfulValue(value))) {
                      return null;
                    }

                    const accessor = createRowAccessor(row);
                    const rawId = toText(accessor.get('id', 'identifiant', 'code', 'riskId', 'uid'), '');
                    const cleanedId = rawId
                      ? (typeof sanitizeId === 'function' ? sanitizeId(rawId) : rawId)
                      : '';
                    const riskId = cleanedId || (Date.now() + Math.random()).toString(36);

                    const titre = toText(accessor.get('titre', 'title', 'name', 'libelle', 'label'), '');
                    const description = toText(
                      accessor.get('description', 'riskDescription', 'detail', 'libelle', 'intitule'),
                      titre || 'Sans description'
                    );

                    const processus = toText(
                      accessor.get('processus', 'process', 'processusPrincipal', 'processus_principal', 'processuslibelle', 'processuslibre', 'processname'),
                      'Non renseigné'
                    );
                    const sousProcessus = toText(
                      accessor.get('sousProcessus', 'sous_processus', 'subprocess', 'subProcessus', 'sousProcess', 'subProcess'),
                      ''
                    );
                    const typeCorruption = toText(
                      accessor.get('typeCorruption', 'type', 'riskType', 'categorie', 'category', 'corruptionType'),
                      'autre'
                    );
                    const typeTiers = toText(
                      accessor.get('typeTiers', 'typetiers', 'categorieTiers', 'tiersType', 'type_tiers'),
                      ''
                    );

                    const probBrut = parseScore(
                      accessor.get(
                        'probBrut',
                        'probabiliteBrut',
                        'probabilite_brut',
                        'probabilite',
                        'probability',
                        'probabiliteInherente',
                        'probabiliteInitiale',
                        'inherentProbability',
                        'probabilite brute',
                        'prob brut'
                      )
                    );
                    const impactBrut = parseScore(
                      accessor.get(
                        'impactBrut',
                        'impact_brut',
                        'impact',
                        'impactInherente',
                        'impactInitial',
                        'inherentImpact',
                        'impact brut'
                      )
                    );
                    const probNet = parseScore(
                      accessor.get(
                        'probNet',
                        'probabiliteNet',
                        'probabilite_residuelle',
                        'residualProbability',
                        'probResidual',
                        'prob net',
                        'probabilite residuelle'
                      ),
                      probBrut
                    );
                    const impactNet = parseScore(
                      accessor.get(
                        'impactNet',
                        'impact_residuel',
                        'impactResidual',
                        'residualImpact',
                        'impact net'
                      ),
                      impactBrut
                    );
                    const probPost = parseScore(
                      accessor.get(
                        'probPost',
                        'probabilitePost',
                        'probabilite_post',
                        'probabilitePostMitigation',
                        'postProbability',
                        'prob post'
                      ),
                      probNet
                    );
                    const impactPost = parseScore(
                      accessor.get(
                        'impactPost',
                        'impact_post',
                        'impactPostMitigation',
                        'postImpact',
                        'impact post'
                      ),
                      impactNet
                    );

                    const statut = toText(
                      accessor.get('statut', 'status', 'etat', 'state', 'riskStatus'),
                      'brouillon'
                    );
                    const tiers = parseTextList(accessor.get('tiers', 'tiersImpliques', 'tiers_associes', 'stakeholders', 'thirdParties', 'partiesPrenantes'));
                    const controls = parseIdList(accessor.get('controls', 'controles', 'contrôles', 'controlIds', 'control_ids', 'listeControls'));
                    const actionPlans = parseIdList(accessor.get('actionPlans', 'plans', 'planActions', 'actionPlanIds', 'plan_ids', 'plansActions'));

                    const rawDate = accessor.get('dateCreation', 'date', 'creationDate', 'date_creation', 'createdAt');
                    const dateText = toText(rawDate, '');
                    let dateCreation;
                    if (!dateText) {
                      dateCreation = new Date().toISOString();
                    } else {
                      const parsed = new Date(dateText);
                      dateCreation = isNaN(parsed) ? dateText : parsed.toISOString();
                    }

                    const risk = {
                      id: riskId,
                      description,
                      processus,
                      sousProcessus,
                      typeCorruption,
                      probBrut,
                      impactBrut,
                      probNet,
                      impactNet,
                      probPost,
                      impactPost,
                      statut,
                      controls,
                      actionPlans,
                      tiers,
                      dateCreation
                    };

                    if (titre) {
                      risk.titre = titre;
                    }
                    if (typeTiers) {
                      risk.typeTiers = typeTiers;
                    }

                    if (!Array.isArray(risk.tiers)) {
                      risk.tiers = [];
                    }
                    if (!Array.isArray(risk.controls)) {
                      risk.controls = [];
                    }
                    if (!Array.isArray(risk.actionPlans)) {
                      risk.actionPlans = [];
                    }

                    if (!risk.controls.length) {
                      risk.controls = [];
                    }
                    if (!risk.actionPlans.length) {
                      risk.actionPlans = [];
                    }

                    return risk;
                  };

                  const mapped = rows
                    .map(mapCsvRowToRisk)
                    .filter(Boolean)
                    .map(risk => {
                      const normalizedRisk = { ...risk };
                      if (!Array.isArray(normalizedRisk.actionPlans)) {
                        normalizedRisk.actionPlans = [];
                      }
                      if (normalizedRisk.actionPlans.length === 0) {
                        normalizedRisk.probPost = normalizedRisk.probNet;
                        normalizedRisk.impactPost = normalizedRisk.impactNet;
                      }
                      return normalizedRisk;
                    });

                  if (mapped.length === 0) {
                    if (typeof toast === 'function') {
                      toast('Aucune ligne valide trouvée dans le fichier CSV.');
                    } else {
                      alert('Aucune ligne valide trouvée dans le fichier CSV.');
                    }
                    return;
                  }

                  state.risks = mergeById(state.risks, mapped);
                  const csvImportDescription = `Import du fichier ${file.name} : ${mapped.length} risque${mapped.length > 1 ? 's' : ''} ajouté${mapped.length > 1 ? 's' : ''}.`;
                  addHistoryItem("Import CSV", csvImportDescription, {file: file.name, count: mapped.length});
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

      window.exportHistory = function exportHistory(format="json"){
        const items = state.history || [];
        if (!items.length){ alert("Aucun élément d'historique"); return; }
        if (format === "csv"){
          const csv = toCSV(items);
          const bom = "\ufeff";
          downloadBlob("historique.csv","text/csv;charset=utf-8", bom + csv);
        } else {
          downloadBlob("historique.json","application/json;charset=utf-8", JSON.stringify(items, null, 2));
        }
        const description = `Historique exporté au format ${format.toUpperCase()}.`;
        addHistoryItem("Export historique", description, {format});
      };

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
          addHistoryItem("Export matrice (PNG)", "Export de la matrice des risques en image PNG.");
        });
      };

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

      let currentEditingControlId = null;
      let selectedRisksForControl = [];
      let riskFilterQueryForControl = '';
      let lastControlData = null;

      function populateControlOwnerSuggestions() {
        const datalist = document.getElementById('controlOwnerSuggestions');
        if (!datalist) return;

        datalist.innerHTML = '';

        const uniqueOwners = Array.from(new Set(
          (state.controls || [])
            .map(ctrl => (ctrl && typeof ctrl.owner === 'string') ? ctrl.owner.trim() : '')
            .filter(owner => owner)
        ));

        uniqueOwners.forEach(owner => {
          const option = document.createElement('option');
          option.value = owner;
          datalist.appendChild(option);
        });
      }

      window.addNewControl = function() {
        currentEditingControlId = null;
        const form = document.getElementById('controlForm');
        if (form) form.reset();

        selectedRisksForControl = [];

        if (lastControlData) {
          document.getElementById('controlName').value = lastControlData.name || '';
          document.getElementById('controlType').value = lastControlData.type || '';
          document.getElementById('controlOwner').value = lastControlData.owner || '';
          document.getElementById('controlFrequency').value = lastControlData.frequency || '';
          document.getElementById('controlMode').value = lastControlData.mode || '';
          document.getElementById('controlEffectiveness').value = lastControlData.effectiveness || '';
          document.getElementById('controlStatus').value = lastControlData.status || '';
          document.getElementById('controlDescription').value = lastControlData.description || '';
          selectedRisksForControl = [...(lastControlData.risks || [])];
        }

        document.getElementById('controlModalTitle').textContent = 'Nouveau Contrôle';
        updateSelectedRisksDisplay();
        populateControlOwnerSuggestions();
        document.getElementById('controlModal').classList.add('show');
      };

      window.editControl = function(controlId) {
        const control = state.controls.find(c => c.id == controlId);
        if (!control) {
          alert('Contrôle introuvable');
          return;
        }

        currentEditingControlId = controlId;
        selectedRisksForControl = control.risks || [];

        document.getElementById('controlName').value = control.name || '';
        document.getElementById('controlType').value = control.type || '';
        document.getElementById('controlOwner').value = control.owner || '';
        document.getElementById('controlFrequency').value = control.frequency || '';
        document.getElementById('controlMode').value = control.mode || '';
        document.getElementById('controlEffectiveness').value = control.effectiveness || '';
        document.getElementById('controlStatus').value = control.status || '';
        document.getElementById('controlDescription').value = control.description || '';

        document.getElementById('controlModalTitle').textContent = 'Modifier le Contrôle';
        updateSelectedRisksDisplay();
        populateControlOwnerSuggestions();
        document.getElementById('controlModal').classList.add('show');
      };

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

        state.risks.forEach(risk => {
          if (risk.controls && risk.controls.includes(controlId)) {
            risk.controls = risk.controls.filter(id => id !== controlId);
          }
        });

        addHistoryItem("Suppression contrôle", `Contrôle "${controlName}" (ID ${controlId}) supprimé.`, {id: controlId, name: controlName});
        state.save("suppression-contrôle");
        state.renderAll();

        toast(`Contrôle "${controlName}" supprimé avec succès`);
      };

      window.closeControlModal = function() {
        document.getElementById('controlModal').classList.remove('show');
      };

      window.openRiskSelector = function() {
        riskFilterQueryForControl = '';
        const searchInput = document.getElementById('riskSearchInput');
        if (searchInput) searchInput.value = '';
        renderRiskSelectionList();
        document.getElementById('riskSelectorModal').classList.add('show');
      };

      function renderRiskSelectionList() {
        const riskList = document.getElementById('riskList');
        if (!riskList) return;
        const query = riskFilterQueryForControl.toLowerCase();

        riskList.innerHTML = state.risks.filter(risk => {
          const title = (risk.titre || risk.description || '').toLowerCase();
          return String(risk.id).includes(query) || title.includes(query);
        }).map(risk => {
          const isSelected = selectedRisksForControl.some(id => idsEqual(id, risk.id));
          const title = risk.titre || risk.description || 'Sans titre';
          return `
            <div class="risk-list-item">
              <input type="checkbox" id="risk-${risk.id}" ${isSelected ? 'checked' : ''}
                     onchange="toggleRiskSelection(${JSON.stringify(risk.id)})">
              <div class="risk-item-info">
                <div class="risk-item-title">#${risk.id} - ${title}</div>
                <div class="risk-item-meta">
                  Processus: ${risk.processus}${risk.sousProcessus ? ` > ${risk.sousProcessus}` : ''} | Type: ${risk.typeCorruption}
                </div>
              </div>
            </div>
          `;
        }).join('');
      }

      window.filterRisksForControl = function(query) {
        riskFilterQueryForControl = query;
        renderRiskSelectionList();
      };

      window.closeRiskSelector = function() {
        document.getElementById('riskSelectorModal').classList.remove('show');
      };

      window.toggleRiskSelection = function(riskId) {
        const targetId = String(riskId);
        const index = selectedRisksForControl.findIndex(id => idsEqual(id, targetId));
        if (index > -1) {
          selectedRisksForControl.splice(index, 1);
        } else {
          selectedRisksForControl.push(riskId);
        }
      };

      window.confirmRiskSelection = function() {
        updateSelectedRisksDisplay();
        closeRiskSelector();
      };

      function updateSelectedRisksDisplay() {
        const container = document.getElementById('selectedRisks');

        if (selectedRisksForControl.length === 0) {
          container.innerHTML = '<div style="color: #7f8c8d; font-style: italic;">Aucun risque sélectionné</div>';
          return;
        }

        container.innerHTML = selectedRisksForControl.map(riskId => {
          const risk = state.risks.find(r => idsEqual(r.id, riskId));
          if (!risk) return '';

          const title = risk.titre || risk.description || 'Sans titre';
          return `
            <div class="selected-risk-item">
              #${risk.id} - ${title.substring(0, 50)}${title.length > 50 ? '...' : ''}
              <span class="remove-risk" onclick="removeRiskFromSelection(${JSON.stringify(riskId)})">×</span>
            </div>
          `;
        }).join('');
      }

      window.removeRiskFromSelection = function(riskId) {
        selectedRisksForControl = selectedRisksForControl.filter(id => !idsEqual(id, riskId));
        updateSelectedRisksDisplay();
      };

      window.saveControl = function() {
        const form = document.getElementById('controlForm');
        if (!form) return;
        const formData = new FormData(form);
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

        if (!controlData.name || !controlData.type || !controlData.owner || !controlData.frequency ||
            !controlData.mode || !controlData.effectiveness || !controlData.status) {
          alert('Veuillez remplir tous les champs obligatoires (marqués d\'un *)');
          return;
        }

        if (currentEditingControlId) {
          const controlIndex = state.controls.findIndex(c => c.id == currentEditingControlId);
          if (controlIndex !== -1) {
            state.controls[controlIndex] = {
              ...state.controls[controlIndex],
              ...controlData
            };
            addHistoryItem("Modification contrôle", `Contrôle "${controlData.name}" (ID ${currentEditingControlId}) mis à jour.`, {id: currentEditingControlId, name: controlData.name});
            toast(`Contrôle "${controlData.name}" modifié avec succès`);
          }
        } else {
          const newControl = {
            id: getNextSequentialId(state.controls),
            ...controlData,
            dateCreation: new Date().toISOString().split('T')[0]
          };

          state.controls.push(newControl);
          addHistoryItem("Nouveau contrôle", `Nouveau contrôle "${controlData.name}" créé (ID ${newControl.id}).`, {id: newControl.id, name: controlData.name});
          toast(`Contrôle "${controlData.name}" créé avec succès`);
        }

        lastControlData = { ...controlData, risks: [...controlData.risks] };

        state.save("contrôle");
        state.renderAll();
        populateControlOwnerSuggestions();
        closeControlModal();
      };

      function toast(msg){
        const t = document.createElement('div');
        t.textContent = msg;
        Object.assign(t.style, {position:'fixed',bottom:'16px',right:'16px',padding:'10px 14px',background:'#111',color:'#fff',borderRadius:'8px',boxShadow:'0 4px 12px rgba(0,0,0,.25)',zIndex:9999,opacity:'0',transition:'opacity .2s'});
        document.body.appendChild(t);
        requestAnimationFrame(()=>{ t.style.opacity='1'; });
        setTimeout(()=>{ t.style.opacity='0'; setTimeout(()=>t.remove(),200); }, 1600);
      }

    })();

}
window.applyPatch = applyPatch;
