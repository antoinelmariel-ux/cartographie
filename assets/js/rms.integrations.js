// Enhanced Risk Management System - Integrations & Advanced Features

async function exportDashboard() {
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

    const writer = createDashboardPdfWriter();
    if (!writer) {
        const message = 'Génération du PDF impossible : aucun moteur disponible';
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

        let brandingAssets = null;
        try {
            brandingAssets = await loadDashboardBrandingAssets();
        } catch (error) {
            console.warn('Impossible de charger les éléments de branding pour le PDF', error);
        }

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

        writeDashboardPdfContent(writer, data, { branding: brandingAssets });
        writer.save('tableau-de-bord.pdf');

        if (typeof showNotification === 'function') {
            const successMessage = writer.isFallback
                ? 'Export PDF généré (mode simplifié)'
                : 'Export PDF du tableau de bord généré';
            showNotification('success', successMessage);
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


function createDashboardPdfWriter() {
    const jsPdfNamespace = window.jspdf || window.jsPDF || window.jsPdf;
    const jsPDFConstructor = jsPdfNamespace && (jsPdfNamespace.jsPDF || jsPdfNamespace);

    if (typeof jsPDFConstructor === 'function') {
        try {
            return new JsPdfDashboardWriter(jsPDFConstructor);
        } catch (error) {
            console.warn('Initialisation de jsPDF impossible, utilisation du mode simplifié', error);
        }
    } else {
        console.info('jsPDF non disponible localement. Tentative avec le moteur PDF natif.');
        if (typeof MiniJsPDF === 'function') {
            try {
                return new JsPdfDashboardWriter(MiniJsPDF);
            } catch (error) {
                console.warn('Initialisation du moteur PDF natif impossible, repli en mode texte.', error);
            }
        }
    }

    return new SimpleDashboardPdfWriter();
}

async function loadDashboardBrandingAssets() {
    const logoElement = document.querySelector('.header-logo');
    const fallbackSrc = 'assets/img/LFB-logo.PNG';
    const logoSrc = logoElement?.src || fallbackSrc;

    try {
        const logoDataUrl = await fetchAssetAsDataUrl(logoSrc);
        return { logo: logoDataUrl };
    } catch (error) {
        console.warn('Impossible de charger le logo du site pour le PDF', error);
        return null;
    }
}

async function fetchAssetAsDataUrl(url) {
    if (!url || typeof fetch !== 'function') {
        throw new Error('Impossible de récupérer la ressource demandée');
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Téléchargement impossible (${response.status})`);
    }

    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Lecture du flux impossible'));
        reader.readAsDataURL(blob);
    });
}

function writeDashboardPdfContent(writer, data, options = {}) {
    if (!writer || !data) {
        return;
    }

    const formatters = createPdfFormatters();

    if (options.branding && typeof writer.setBranding === 'function') {
        writer.setBranding(options.branding);
    }

    if (typeof writer.renderAdvancedReport === 'function') {
        writer.renderAdvancedReport(data, formatters);
        return;
    }

    writeDashboardPdfTextContent(writer, data, formatters);
}

function createPdfFormatters() {
    return {
        formatNumber: (value, { decimals = 0 } = {}) => {
            if (!Number.isFinite(value)) {
                return '-';
            }
            return Number(value).toLocaleString('fr-FR', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });
        },
        formatDateTime: (isoString) => {
            if (!isoString) {
                return '-';
            }
            const date = new Date(isoString);
            if (Number.isNaN(date.getTime())) {
                return '-';
            }
            return date.toLocaleString('fr-FR');
        }
    };
}

function writeDashboardPdfTextContent(writer, data, formatters) {
    const { formatNumber, formatDateTime } = formatters;
    const { metrics = {}, topRisks = [], processOverview = {}, alerts = {} } = data;
    const stats = metrics.stats || {};

    writer.setTitle('Tableau de bord - Synthèse');
    writer.addParagraph(`Généré le ${formatDateTime(data.generatedAt)}`);
    writer.addSpacing(6);

    writer.addSectionTitle('Indicateurs clés');
    writer.addParagraph(`Total des risques validés : ${formatNumber(stats.total)}`);
    const criticalShare = stats.total ? Math.round((stats.critical / stats.total) * 100) : 0;
    const highShare = stats.total ? Math.round((stats.high / stats.total) * 100) : 0;
    writer.addParagraph(`Risques critiques : ${formatNumber(stats.critical)} (${criticalShare}% du total)`);
    writer.addParagraph(`Risques élevés : ${formatNumber(stats.high)} (${highShare}% du total)`);
    writer.addParagraph(`Score global de maîtrise : ${formatNumber(metrics.globalScore)} %`);
    writer.addParagraph(`Réduction moyenne du score net : ${formatNumber(metrics.averageReduction, { decimals: 1 })}`);
    writer.addParagraph(`Contrôles actifs : ${formatNumber(metrics.activeControls)} sur ${formatNumber(metrics.totalControls)}`);

    const actionPlanMetrics = metrics.actionPlanStatusMetrics || { total: 0, distribution: [] };
    if (!actionPlanMetrics.total) {
        writer.addParagraph("Plans d'actions : aucun plan enregistré.");
    } else {
        writer.addParagraph(`Plans d'actions suivis : ${formatNumber(actionPlanMetrics.total)}`);
        const filledDistribution = Array.isArray(actionPlanMetrics.distribution)
            ? actionPlanMetrics.distribution.filter((item) => (Number(item?.count) || 0) > 0)
            : [];
        if (filledDistribution.length) {
            writer.addParagraph('Répartition par statut :');
            filledDistribution.forEach((item) => {
                const label = item?.label || item?.value || 'Non défini';
                writer.addBullet(`${label} : ${formatNumber(item.count)} plan${item.count > 1 ? 's' : ''}`);
            });
        }
    }

    writer.addSectionTitle('Processus surveillés');
    const distribution = Array.isArray(processOverview.distribution) ? processOverview.distribution : [];
    if (!distribution.length) {
        writer.addParagraph('Aucun risque à analyser sur les processus.');
    } else {
        const maxProcess = 5;
        distribution.slice(0, maxProcess).forEach((entry) => {
            writer.addBullet(`${entry.label} : ${formatNumber(entry.count)} risque${entry.count > 1 ? 's' : ''}`);
        });
        if (distribution.length > maxProcess) {
            writer.addParagraph(`... et ${distribution.length - maxProcess} processus supplémentaires.`);
        }
    }

    const severity = Array.isArray(processOverview.severity)
        ? processOverview.severity.filter((item) => Number.isFinite(item?.average) && item.count > 0)
        : [];
    if (severity.length) {
        writer.addParagraph('Scores nets moyens par processus :');
        const maxSeverity = 5;
        severity.slice(0, maxSeverity).forEach((entry) => {
            writer.addBullet(`${entry.label} : score moyen ${formatNumber(entry.average, { decimals: 1 })} (max ${formatNumber(entry.maxScore, { decimals: 1 })})`);
        });
        if (severity.length > maxSeverity) {
            writer.addParagraph(`... et ${severity.length - maxSeverity} autres processus suivis.`);
        }
    }

    writer.addSectionTitle('Top risques nets');
    if (!topRisks.length) {
        writer.addParagraph('Aucun risque validé disponible.');
    } else {
        const maxRisks = 5;
        topRisks.slice(0, maxRisks).forEach((risk) => {
            const processLabel = risk.sousProcessus
                ? `${risk.processus} / ${risk.sousProcessus}`
                : risk.processus;
            const effectiveness = risk.effectivenessLabel ? ` (${risk.effectivenessLabel})` : '';
            writer.addBullet(`${risk.rank}. ${risk.titre} - ${processLabel} (Brut ${formatNumber(risk.brutScore)} → Net ${formatNumber(risk.score)}, Réduction ${risk.reduction}%${effectiveness})`);
        });
        if (topRisks.length > maxRisks) {
            writer.addParagraph(`... et ${topRisks.length - maxRisks} risques supplémentaires dans l'application.`);
        }
    }

    writer.addSectionTitle('Alertes et éléments de vigilance');
    const severeRisks = Array.isArray(alerts.severeRisks) ? alerts.severeRisks : [];
    if (!severeRisks.length) {
        writer.addParagraph("Aucun risque sévère ou critique sans plan d'action.");
    } else {
        writer.addParagraph("Risques sévères ou critiques sans plan d'actions :");
        severeRisks.slice(0, 5).forEach((risk) => {
            writer.addBullet(`${risk.description} - ${risk.process} (${risk.level}) - Score ${formatNumber(risk.score)} - ${risk.formattedDate}`);
        });
        if (severeRisks.length > 5) {
            writer.addParagraph(`... et ${severeRisks.length - 5} alertes supplémentaires.`);
        }
    }

    const overduePlans = Array.isArray(alerts.overdueActionPlans) ? alerts.overdueActionPlans : [];
    if (!overduePlans.length) {
        writer.addParagraph("Plans d'actions : aucun retard détecté.");
    } else {
        writer.addParagraph("Plans d'actions en retard :");
        overduePlans.slice(0, 5).forEach((plan) => {
            writer.addBullet(`${plan.title} - ${plan.owner || 'Responsable non défini'} - Échéance ${plan.formattedDueDate} - Statut ${plan.statusLabel}`);
        });
        if (overduePlans.length > 5) {
            writer.addParagraph(`... et ${overduePlans.length - 5} plans supplémentaires en retard.`);
        }
    }
}

class JsPdfDashboardWriter {
    constructor(jsPDFConstructor) {
        this.doc = new jsPDFConstructor({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        this.margin = 40;
        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.pageHeight = this.doc.internal.pageSize.getHeight();
        this.cursorY = this.margin;
        this.lineHeight = 14;
        this.isFallback = false;
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(11);
        this.palette = {
            primary: { r: 14, g: 36, b: 66 },
            accent: { r: 235, g: 94, b: 40 },
            muted: { r: 236, g: 240, b: 245 },
            success: { r: 38, g: 166, b: 154 }
        };
        this.branding = null;
    }

    setBranding(branding = null) {
        this.branding = branding;
    }

    ensureSpace(height = this.lineHeight) {
        if (this.cursorY + height > this.pageHeight - this.margin) {
            this.doc.addPage();
            this.cursorY = this.margin;
            this.doc.setFont('helvetica', 'normal');
            this.doc.setFontSize(11);
        }
    }

    renderAdvancedReport(data, formatters = {}) {
        const { metrics = {}, topRisks = [], processOverview = {}, alerts = {} } = data;
        const stats = metrics.stats || {};

        this.cursorY = this.margin;
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(11);
        this.renderVisualHeader(data, formatters);
        this.renderKpiCards(metrics, formatters);
        this.renderProcessOverview(processOverview, formatters);
        this.renderRiskMatrix(stats, formatters);
        this.renderTopRisksTable(topRisks, formatters);
        this.renderAlertsPanels(alerts, formatters);
    }

    renderVisualHeader(data, formatters) {
        const headerHeight = 110;
        this.doc.setFillColor(this.palette.primary.r, this.palette.primary.g, this.palette.primary.b);
        this.doc.rect(0, 0, this.pageWidth, headerHeight, 'F');

        if (this.branding?.logo) {
            try {
                const imageType = this.getImageType(this.branding.logo);
                this.doc.addImage(this.branding.logo, imageType, this.margin, 25, 90, 50, undefined, 'FAST');
            } catch (error) {
                console.warn('Insertion du logo impossible dans le PDF', error);
            }
        }

        this.doc.setTextColor(255, 255, 255);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(20);
        this.doc.text('Cartographie des risques - Synthèse', this.margin + 110, 45);
        this.doc.setFontSize(12);
        const formattedDate = formatters.formatDateTime ? formatters.formatDateTime(data.generatedAt) : '';
        this.doc.text(`Généré le ${formattedDate}`, this.margin + 110, 70);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(11);
        this.doc.setTextColor(33, 37, 41);
        this.cursorY = headerHeight + 30;
    }

    renderKpiCards(metrics, formatters) {
        const stats = metrics.stats || {};
        const actionPlanMetrics = metrics.actionPlanStatusMetrics || { total: 0, distribution: [] };
        const controlDistribution = Array.isArray(metrics.controlTypeDistribution)
            ? metrics.controlTypeDistribution.filter((item) => item && item.label && Number.isFinite(item.percentage))
            : [];

        const topStatuses = Array.isArray(actionPlanMetrics.distribution)
            ? actionPlanMetrics.distribution.filter((item) => (item?.count || 0) > 0).slice(0, 2)
            : [];

        const formatValue = (value, options) => {
            if (typeof formatters.formatNumber === 'function') {
                const result = formatters.formatNumber(value, options);
                return result === '-' ? '-' : result;
            }
            if (value === null || value === undefined) {
                return '-';
            }
            return value;
        };

        const formatWithUnit = (value, unit) => {
            const formatted = formatValue(value);
            return formatted === '-' ? '—' : `${formatted}${unit}`;
        };

        const cards = [
            {
                title: 'Risques validés',
                value: formatValue(stats.total) === '-' ? '—' : formatValue(stats.total),
                meta: `Critiques ${formatValue(stats.critical)} • Élevés ${formatValue(stats.high)}`,
                color: this.palette.primary
            },
            {
                title: 'Score global de maîtrise',
                value: formatWithUnit(metrics.globalScore, ' %'),
                meta: (() => {
                    const reductionLabel = formatValue(metrics.averageReduction, { decimals: 1 });
                    return reductionLabel === '-'
                        ? 'Réduction moyenne non disponible'
                        : `Réduction moyenne ${reductionLabel}%`;
                })(),
                color: this.palette.accent
            },
            {
                title: 'Contrôles actifs',
                value: `${formatValue(metrics.activeControls)} / ${formatValue(metrics.totalControls)}`,
                meta: controlDistribution.length
                    ? `Types dominants : ${controlDistribution.slice(0, 2).map((item) => `${item.label} (${Math.round(item.percentage)}%)`).join(' • ')}`
                    : 'Répartition non renseignée',
                color: this.palette.success
            },
            {
                title: "Plans d'actions suivis",
                value: formatValue(actionPlanMetrics.total),
                meta: topStatuses.length
                    ? topStatuses.map((item) => `${item.label} : ${formatValue(item.count)}`).join(' • ')
                    : 'Aucune distribution disponible',
                color: { r: 52, g: 73, b: 94 }
            }
        ];

        const columns = 2;
        const cardWidth = ((this.pageWidth - (this.margin * 2)) - 20) / columns;
        const cardHeight = 90;
        const rows = Math.ceil(cards.length / columns);
        const sectionHeight = rows * (cardHeight + 15) + 20;
        this.ensureSpace(sectionHeight);

        cards.forEach((card, index) => {
            const column = index % columns;
            const row = Math.floor(index / columns);
            const x = this.margin + column * (cardWidth + 20);
            const y = this.cursorY + row * (cardHeight + 15);

            this.doc.setFillColor(card.color.r, card.color.g, card.color.b);
            this.doc.setDrawColor(card.color.r, card.color.g, card.color.b);
            this.doc.roundedRect(x, y, cardWidth, cardHeight, 8, 8, 'FD');

            this.doc.setTextColor(255, 255, 255);
            this.doc.setFont('helvetica', 'bold');
            this.doc.setFontSize(11);
            this.doc.text(card.title, x + 14, y + 22);
            this.doc.setFontSize(22);
            this.doc.text(String(card.value || '—'), x + 14, y + 50);
            this.doc.setFont('helvetica', 'normal');
            this.doc.setFontSize(10);
            const metaLines = this.doc.splitTextToSize(card.meta || '', cardWidth - 28);
            metaLines.forEach((line, idx) => {
                this.doc.text(line, x + 14, y + 68 + (idx * 12));
            });
        });

        this.doc.setTextColor(33, 37, 41);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(11);
        this.cursorY += sectionHeight;
    }

    renderProcessOverview(processOverview, formatters) {
        const distribution = Array.isArray(processOverview.distribution)
            ? processOverview.distribution.slice(0, 5)
            : [];
        const severity = Array.isArray(processOverview.severity)
            ? processOverview.severity.slice(0, 5)
            : [];

        const panelHeight = Math.max((Math.max(distribution.length, severity.length) || 1) * 28 + 100, 160);
        const availableWidth = this.pageWidth - (this.margin * 2);
        const columnWidth = (availableWidth - 20) / 2;

        this.ensureSpace(panelHeight + 30);

        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(13);
        this.doc.text('Analyse par processus', this.margin, this.cursorY + 15);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(11);

        const panelY = this.cursorY + 25;

        this.drawPanel(this.margin, panelY, columnWidth, panelHeight, 'Répartition des risques', ({ x, y, width }) => {
            if (!distribution.length) {
                this.doc.text('Aucune donnée disponible', x + 15, y + 40);
                return;
            }

            const maxCount = Math.max(...distribution.map((entry) => entry.count || 0), 1);
            const chartLeft = x + 20;
            const chartTop = y + 40;
            const barHeight = 16;
            const barMaxWidth = width - 80;

            distribution.forEach((entry, index) => {
                const barY = chartTop + index * (barHeight + 12);
                const barWidth = ((entry.count || 0) / maxCount) * barMaxWidth;
                this.doc.setFont('helvetica', 'bold');
                this.doc.setFontSize(10);
                this.doc.text(entry.label || 'Non défini', chartLeft, barY - 4);
                this.doc.setFillColor(this.palette.accent.r, this.palette.accent.g, this.palette.accent.b);
                this.doc.rect(chartLeft, barY, barWidth || 2, barHeight, 'F');
                this.doc.setFont('helvetica', 'normal');
                this.doc.setFontSize(10);
                this.doc.text(String(formatters.formatNumber ? formatters.formatNumber(entry.count) : entry.count), chartLeft + barMaxWidth + 5, barY + barHeight - 4);
            });
        });

        this.drawPanel(this.margin + columnWidth + 20, panelY, columnWidth, panelHeight, 'Scores nets moyens', ({ x, y }) => {
            if (!severity.length) {
                this.doc.text('Pas de tendance disponible', x + 25, y + 40);
                return;
            }

            const tableTop = y + 40;
            const rowHeight = 20;
            this.doc.setFont('helvetica', 'bold');
            this.doc.setFontSize(10);
            this.doc.text('Processus', x + 20, tableTop);
            this.doc.text('Score moyen', x + 20 + columnWidth - 60, tableTop);
            this.doc.setFont('helvetica', 'normal');

            severity.forEach((entry, index) => {
                const rowY = tableTop + 15 + index * rowHeight;
                this.doc.text(entry.label || 'Non défini', x + 20, rowY);
                const value = formatters.formatNumber
                    ? formatters.formatNumber(entry.average, { decimals: 1 })
                    : entry.average;
                this.doc.text(String(value || '—'), x + 20 + columnWidth - 60, rowY);
            });
        });

        this.cursorY += panelHeight + 40;
    }

    renderRiskMatrix(stats, formatters) {
        const matrixHeight = 200;
        this.ensureSpace(matrixHeight);
        const startY = this.cursorY;

        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(13);
        this.doc.text('Matrice de criticité', this.margin, startY + 15);
        this.doc.setFont('helvetica', 'normal');

        const gridTop = startY + 35;
        const cellSize = 80;
        const gap = 8;
        const rows = 2;
        const cols = 2;
        const cells = [
            { label: 'Critiques', value: stats.critical, color: { r: 200, g: 54, b: 54 } },
            { label: 'Élevés', value: stats.high, color: { r: 235, g: 152, b: 0 } },
            { label: 'Modérés', value: stats.medium, color: { r: 241, g: 196, b: 15 } },
            { label: 'Faibles', value: stats.low, color: { r: 88, g: 214, b: 141 } }
        ];

        const startX = this.margin;
        cells.forEach((cell, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            const x = startX + col * (cellSize + gap);
            const y = gridTop + row * (cellSize + gap);
            this.doc.setFillColor(cell.color.r, cell.color.g, cell.color.b);
            this.doc.roundedRect(x, y, cellSize, cellSize, 6, 6, 'F');
            this.doc.setTextColor(255, 255, 255);
            this.doc.setFont('helvetica', 'bold');
            this.doc.setFontSize(12);
            this.doc.text(String(formatters.formatNumber ? formatters.formatNumber(cell.value) : cell.value), x + cellSize / 2, y + cellSize / 2, { align: 'center' });
            this.doc.setFont('helvetica', 'normal');
            this.doc.setFontSize(10);
            this.doc.text(cell.label, x + cellSize / 2, y + cellSize - 12, { align: 'center' });
        });

        this.doc.setTextColor(33, 37, 41);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(10);
        const commentaryX = startX + (cols * (cellSize + gap)) + 30;
        const commentaryWidth = this.pageWidth - commentaryX - this.margin;
        const summaryText = `Répartition globale des ${formatters.formatNumber ? formatters.formatNumber(stats.total) : stats.total} risques validés par niveau de criticité.`;
        const lines = this.doc.splitTextToSize(summaryText, commentaryWidth);
        this.doc.text(lines, commentaryX, gridTop + 15);

        this.cursorY += matrixHeight;
    }

    renderTopRisksTable(topRisks, formatters) {
        const rows = Math.min(topRisks.length, 6);
        const tableHeight = rows ? rows * 30 + 80 : 140;
        this.ensureSpace(tableHeight);
        const startY = this.cursorY;

        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(13);
        this.doc.text('Top risques nets', this.margin, startY + 15);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(11);

        if (!rows) {
            this.doc.text('Aucun risque validé disponible pour cette période.', this.margin, startY + 40);
            this.cursorY += 80;
            return;
        }

        const tableWidth = this.pageWidth - (this.margin * 2);
        const tableTop = startY + 30;
        const headerHeight = 24;
        this.doc.setFillColor(this.palette.primary.r, this.palette.primary.g, this.palette.primary.b);
        this.doc.rect(this.margin, tableTop, tableWidth, headerHeight, 'F');
        this.doc.setTextColor(255, 255, 255);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('#', this.margin + 10, tableTop + 16);
        this.doc.text('Risque & Processus', this.margin + 40, tableTop + 16);
        this.doc.text('Scores', this.margin + tableWidth - 160, tableTop + 16);

        this.doc.setTextColor(33, 37, 41);
        this.doc.setFont('helvetica', 'normal');

        const rowHeight = 30;
        topRisks.slice(0, rows).forEach((risk, index) => {
            const rowY = tableTop + headerHeight + index * rowHeight;
            this.doc.setFillColor(index % 2 === 0 ? 248 : 255, index % 2 === 0 ? 250 : 255, 255);
            this.doc.rect(this.margin, rowY, tableWidth, rowHeight, 'F');
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(String(risk.rank), this.margin + 10, rowY + 18);
            this.doc.setFont('helvetica', 'normal');
            const processLabel = risk.sousProcessus
                ? `${risk.processus} / ${risk.sousProcessus}`
                : risk.processus;
            const infoLines = this.doc.splitTextToSize(`${risk.titre} — ${processLabel}`, tableWidth - 220).slice(0, 2);
            this.doc.text(infoLines, this.margin + 40, rowY + 16);
            const scoreLabel = `Brut ${formatters.formatNumber ? formatters.formatNumber(risk.brutScore) : risk.brutScore} → Net ${formatters.formatNumber ? formatters.formatNumber(risk.score) : risk.score}`;
            const reductionLabel = `Réduction ${risk.reduction}%${risk.effectivenessLabel ? ` (${risk.effectivenessLabel})` : ''}`;
            this.doc.text(scoreLabel, this.margin + tableWidth - 10, rowY + 14, { align: 'right' });
            this.doc.setFontSize(9);
            this.doc.text(reductionLabel, this.margin + tableWidth - 10, rowY + 24, { align: 'right' });
            this.doc.setFontSize(11);
        });

        this.cursorY += tableHeight;
    }

    renderAlertsPanels(alerts, formatters) {
        const panelHeight = 160;
        const availableWidth = this.pageWidth - (this.margin * 2);
        const columnWidth = (availableWidth - 20) / 2;
        this.ensureSpace(panelHeight + 20);
        const startY = this.cursorY;

        const severeRisks = Array.isArray(alerts.severeRisks) ? alerts.severeRisks : [];
        const overduePlans = Array.isArray(alerts.overdueActionPlans) ? alerts.overdueActionPlans : [];

        this.drawPanel(this.margin, startY + 10, columnWidth, panelHeight, 'Alertes critiques', ({ x, y }) => {
            if (!severeRisks.length) {
                this.doc.text("Aucun risque critique en attente de plan d'action.", x + 15, y + 30);
                return;
            }

            severeRisks.slice(0, 4).forEach((risk, index) => {
                const rowY = y + 40 + index * 24;
                const label = `${risk.process} • ${risk.level}`;
                this.doc.setFillColor(this.palette.accent.r, this.palette.accent.g, this.palette.accent.b);
                this.doc.circle(x + 15, rowY - 4, 2, 'F');
                this.doc.text(risk.description || 'Risque sans titre', x + 22, rowY);
                this.doc.setFontSize(9);
                this.doc.text(`${label} - Score ${formatters.formatNumber ? formatters.formatNumber(risk.score) : risk.score}`, x + 22, rowY + 10);
                this.doc.setFontSize(11);
            });
        });

        this.drawPanel(this.margin + columnWidth + 20, startY + 10, columnWidth, panelHeight, "Plans d'actions sensibles", ({ x, y }) => {
            if (!overduePlans.length) {
                this.doc.text('Aucun plan en retard.', x + 15, y + 30);
                return;
            }

            overduePlans.slice(0, 4).forEach((plan, index) => {
                const rowY = y + 40 + index * 24;
                this.doc.setFillColor(this.palette.success.r, this.palette.success.g, this.palette.success.b);
                this.doc.circle(x + 15, rowY - 4, 2, 'F');
                this.doc.text(plan.title || 'Plan sans nom', x + 22, rowY);
                this.doc.setFontSize(9);
                const status = plan.statusLabel ? `• ${plan.statusLabel}` : '';
                this.doc.text(`${plan.owner || 'Responsable ?'} ${status} • Échéance ${plan.formattedDueDate || '-'}`, x + 22, rowY + 10);
                this.doc.setFontSize(11);
            });
        });

        this.cursorY += panelHeight + 30;
    }

    drawPanel(x, y, width, height, title, contentCallback) {
        this.doc.setFillColor(255, 255, 255);
        this.doc.setDrawColor(224, 230, 237);
        this.doc.roundedRect(x, y, width, height, 8, 8, 'FD');
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(11);
        this.doc.text(title, x + 15, y + 22);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(11);
        if (typeof contentCallback === 'function') {
            contentCallback({ x, y, width, height });
        }
    }

    getImageType(dataUrl) {
        if (typeof dataUrl !== 'string') {
            return 'PNG';
        }
        if (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) {
            return 'JPEG';
        }
        if (dataUrl.startsWith('data:image/webp')) {
            return 'WEBP';
        }
        return 'PNG';
    }

    splitText(text, widthOffset = 0) {
        return this.doc.splitTextToSize(String(text ?? ''), this.pageWidth - (2 * this.margin) - widthOffset);
    }

    addSpacing(height = 8) {
        this.ensureSpace(height);
        this.cursorY += height;
    }

    setTitle(text) {
        const lines = this.splitText(text);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(18);
        lines.forEach((line) => {
            this.ensureSpace(24);
            this.doc.text(line, this.margin, this.cursorY);
            this.cursorY += 22;
        });
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(11);
        this.addSpacing(6);
    }

    addSectionTitle(title) {
        this.ensureSpace(24);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(14);
        this.doc.text(String(title || ''), this.margin, this.cursorY);
        this.cursorY += 18;
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(11);
    }

    addParagraph(text) {
        const lines = this.splitText(text);
        lines.forEach((line) => {
            this.ensureSpace();
            this.doc.text(line, this.margin, this.cursorY);
            this.cursorY += this.lineHeight;
        });
    }

    addBullet(text) {
        const lines = this.splitText(text, 16);
        lines.forEach((line, index) => {
            this.ensureSpace();
            if (index === 0) {
                this.doc.text('•', this.margin, this.cursorY);
                this.doc.text(line, this.margin + 12, this.cursorY);
            } else {
                this.doc.text(line, this.margin + 12, this.cursorY);
            }
            this.cursorY += this.lineHeight;
        });
    }

    save(filename) {
        this.doc.save(filename);
    }
}

class MiniJsPDF {
    constructor(options = {}) {
        const { width, height } = resolvePdfPageSize(options.format, options.orientation, options.unit);
        this.pageWidth = width;
        this.pageHeight = height;
        this.pages = [];
        this.currentPageIndex = -1;
        this.fontSize = 11;
        this.textColor = [33, 37, 41];
        this.fillColor = [255, 255, 255];
        this.drawColor = [0, 0, 0];
        this.fontResources = {
            regular: { resourceKey: 'F1', baseFont: 'Helvetica' },
            bold: { resourceKey: 'F2', baseFont: 'Helvetica-Bold' }
        };
        this.currentFontKey = 'regular';
        this.usedFonts = new Set([this.currentFontKey]);
        this.internal = {
            pageSize: {
                getWidth: () => this.pageWidth,
                getHeight: () => this.pageHeight
            }
        };
        this.addPage();
    }

    addPage() {
        this.pages.push({ commands: [] });
        this.currentPageIndex = this.pages.length - 1;
    }

    addCommand(command) {
        if (!command) {
            return;
        }
        const page = this.pages[this.currentPageIndex];
        if (!page) {
            return;
        }
        page.commands.push(command);
    }

    setFont(fontName = 'helvetica', fontStyle = 'normal') {
        const normalizedName = String(fontName || '').toLowerCase();
        const normalizedStyle = String(fontStyle || '').toLowerCase();
        if (normalizedName.includes('bold') || normalizedStyle.includes('bold')) {
            this.currentFontKey = 'bold';
        } else {
            this.currentFontKey = 'regular';
        }
        this.usedFonts.add(this.currentFontKey);
    }

    setFontSize(size) {
        if (Number.isFinite(size) && size > 0) {
            this.fontSize = size;
        }
    }

    setTextColor(r = 0, g = 0, b = 0) {
        this.textColor = normalizePdfColor(r, g, b);
    }

    setFillColor(r = 255, g = 255, b = 255) {
        this.fillColor = normalizePdfColor(r, g, b);
    }

    setDrawColor(r = 0, g = 0, b = 0) {
        this.drawColor = normalizePdfColor(r, g, b);
    }

    roundedRect(x, y, width, height, rx, ry, style) {
        this.rect(x, y, width, height, style);
    }

    rect(x, y, width, height, style = 'S') {
        if (!Number.isFinite(width) || !Number.isFinite(height)) {
            return;
        }
        const sanitizedStyle = typeof style === 'string' ? style.toUpperCase() : 'S';
        const commands = [];
        const yPosition = this.pageHeight - y - height;
        if (sanitizedStyle.includes('F')) {
            commands.push(`${formatPdfColor(this.fillColor)} rg`);
        }
        if (sanitizedStyle.includes('S') || sanitizedStyle.includes('D') || sanitizedStyle === 'B') {
            commands.push(`${formatPdfColor(this.drawColor)} RG`);
        }
        const operator = sanitizedStyle === 'F'
            ? 'f'
            : (sanitizedStyle === 'FD' || sanitizedStyle === 'DF' || sanitizedStyle === 'B')
                ? 'B'
                : 'S';
        commands.push(`${x.toFixed(2)} ${yPosition.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re ${operator}`);
        this.addCommand(commands.join('\n'));
    }

    text(value, x, y) {
        const content = String(value ?? '');
        if (!content) {
            return;
        }
        const lines = content.split(/\r?\n/);
        lines.forEach((line, index) => {
            const offsetY = y + (index * (this.fontSize + 2));
            this.drawSingleLine(line, x, offsetY);
        });
    }

    drawSingleLine(text, x, y) {
        if (!text) {
            return;
        }
        const page = this.pages[this.currentPageIndex];
        if (!page) {
            return;
        }
        const pdfY = this.pageHeight - y;
        const font = this.fontResources[this.currentFontKey] || this.fontResources.regular;
        const escaped = escapePdfText(text);
        const colorCommand = `${formatPdfColor(this.textColor)} rg`;
        page.commands.push(
            `${colorCommand}\nBT /${font.resourceKey} ${this.fontSize.toFixed(2)} Tf 1 0 0 1 ${x.toFixed(2)} ${pdfY.toFixed(2)} Tm (${escaped}) Tj ET`
        );
    }

    splitTextToSize(text, width) {
        const limit = Math.max(20, Math.floor(width / Math.max(1, this.fontSize * 0.45)));
        return wrapTextToMaxChars(String(text ?? ''), limit);
    }

    addImage() {
        throw new Error('MiniJsPDF: addImage non supporté dans le moteur natif');
    }

    save(filename) {
        const fontEntries = Array.from(this.usedFonts).map((key) => this.fontResources[key] || this.fontResources.regular);
        const pdfBytes = buildVectorPdfDocumentFromPages(this.pages, {
            pageWidth: this.pageWidth,
            pageHeight: this.pageHeight,
            fonts: fontEntries
        });
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        triggerBlobDownload(blob, filename);
    }
}

class SimpleDashboardPdfWriter {
    constructor() {
        this.margin = 40;
        this.pageWidth = 595.28;
        this.pageHeight = 841.89;
        this.defaultFontSize = 11;
        this.defaultLineHeight = 16;
        this.maxCharsPerLine = Math.max(60, Math.floor((this.pageWidth - this.margin * 2) / 6));
        this.lines = [];
        this.isFallback = true;
    }

    setTitle(text) {
        const sanitized = this.sanitizeText(text);
        if (!sanitized) {
            return;
        }
        if (this.lines.length) {
            this.addSpacing(6);
        }
        this.lines.push({
            text: sanitized,
            indent: 0,
            fontSize: 16,
            lineHeight: 26
        });
        this.addSpacing(6);
    }

    addSpacing(height = 8) {
        this.lines.push({
            text: '',
            indent: 0,
            fontSize: this.defaultFontSize,
            lineHeight: height
        });
    }

    addSectionTitle(title) {
        const sanitized = this.sanitizeText(title);
        if (!sanitized) {
            return;
        }
        this.addSpacing(10);
        this.lines.push({
            text: sanitized,
            indent: 0,
            fontSize: 13,
            lineHeight: 20
        });
        this.addSpacing(4);
    }

    addParagraph(text) {
        const parts = String(text ?? '').split(/\n+/);
        parts.forEach((part, index) => {
            const sanitized = this.sanitizeText(part);
            if (!sanitized) {
                if (index < parts.length - 1) {
                    this.addSpacing(this.defaultLineHeight);
                }
                return;
            }
            const wrapped = this.wrapText(sanitized, this.maxCharsPerLine);
            wrapped.forEach((line) => {
                this.lines.push({
                    text: line,
                    indent: 0,
                    fontSize: this.defaultFontSize,
                    lineHeight: this.defaultLineHeight
                });
            });
            if (index < parts.length - 1) {
                this.addSpacing(this.defaultLineHeight);
            }
        });
    }

    addBullet(text) {
        const sanitized = this.sanitizeText(text);
        if (!sanitized) {
            return;
        }
        const wrapped = this.wrapText(sanitized, this.maxCharsPerLine - 4);
        if (!wrapped.length) {
            return;
        }
        wrapped.forEach((line, index) => {
            this.lines.push({
                text: `${index === 0 ? '- ' : '  '}${line}`,
                indent: 0,
                fontSize: this.defaultFontSize,
                lineHeight: this.defaultLineHeight
            });
        });
    }

    save(filename) {
        const pages = paginateLines(this.lines, {
            pageHeight: this.pageHeight,
            margin: this.margin,
            defaultLineHeight: this.defaultLineHeight,
            defaultFontSize: this.defaultFontSize
        });
        const effectivePages = pages.length ? pages : [[{
            text: '',
            indent: 0,
            fontSize: this.defaultFontSize,
            lineHeight: this.defaultLineHeight
        }]];
        const pdfBytes = buildSimplePdfDocument(effectivePages, {
            pageWidth: this.pageWidth,
            pageHeight: this.pageHeight,
            margin: this.margin,
            defaultFontSize: this.defaultFontSize
        });
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        triggerBlobDownload(blob, filename);
    }

    sanitizeText(value) {
        if (value === undefined || value === null) {
            return '';
        }
        return String(value)
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\x20-\x7E]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    wrapText(text, maxChars) {
        const limit = Math.max(20, Math.floor(maxChars));
        const words = text.split(' ').filter(Boolean);
        const lines = [];
        let current = '';

        words.forEach((word) => {
            if (word.length > limit) {
                if (current) {
                    lines.push(current);
                    current = '';
                }
                for (let index = 0; index < word.length; index += limit) {
                    lines.push(word.slice(index, index + limit));
                }
                return;
            }

            const candidate = current ? `${current} ${word}` : word;
            if (candidate.length > limit && current) {
                lines.push(current);
                current = word;
            } else if (candidate.length > limit) {
                lines.push(candidate);
                current = '';
            } else {
                current = candidate;
            }
        });

        if (current) {
            lines.push(current);
        }

        return lines;
    }
}

const PDF_PAGE_FORMATS = {
    a4: [595.28, 841.89],
    letter: [612, 792]
};

function resolvePdfPageSize(format = 'a4', orientation = 'portrait', unit = 'pt') {
    const normalizedFormat = String(format || 'a4').toLowerCase();
    const baseSize = PDF_PAGE_FORMATS[normalizedFormat] || PDF_PAGE_FORMATS.a4;
    let [width, height] = baseSize;
    const normalizedOrientation = String(orientation || 'portrait').toLowerCase();
    if (normalizedOrientation.startsWith('land')) {
        [width, height] = [height, width];
    }
    const factor = getUnitToPointFactor(unit);
    return { width: width * factor, height: height * factor };
}

function getUnitToPointFactor(unit = 'pt') {
    const normalizedUnit = String(unit || 'pt').toLowerCase();
    switch (normalizedUnit) {
        case 'mm':
            return 72 / 25.4;
        case 'cm':
            return 72 / 2.54;
        case 'in':
        case 'inch':
            return 72;
        case 'pt':
        default:
            return 1;
    }
}

function normalizePdfColor(r = 0, g = 0, b = 0) {
    return [r, g, b].map((component) => {
        if (!Number.isFinite(component)) {
            return 0;
        }
        return Math.min(255, Math.max(0, Math.round(component)));
    });
}

function formatPdfColor(color) {
    return color
        .map((component) => (component / 255).toFixed(3))
        .join(' ');
}

function wrapTextToMaxChars(text, limit) {
    const safeLimit = Math.max(10, Math.floor(limit));
    const words = String(text || '').split(/\s+/).filter(Boolean);
    const lines = [];
    let current = '';

    words.forEach((word) => {
        if (word.length >= safeLimit) {
            if (current) {
                lines.push(current);
                current = '';
            }
            for (let index = 0; index < word.length; index += safeLimit) {
                lines.push(word.slice(index, index + safeLimit));
            }
            return;
        }

        const candidate = current ? `${current} ${word}` : word;
        if (candidate.length > safeLimit) {
            if (current) {
                lines.push(current);
            }
            current = word;
        } else {
            current = candidate;
        }
    });

    if (current) {
        lines.push(current);
    }

    return lines.length ? lines : [''];
}

function buildVectorPdfDocumentFromPages(pages, { pageWidth, pageHeight, fonts }) {
    const sanitizedPages = Array.isArray(pages) && pages.length
        ? pages.map((page) => Array.isArray(page.commands) ? page.commands.join('\n') : '')
        : [''];
    const fontEntries = (Array.isArray(fonts) && fonts.length ? fonts : [{ resourceKey: 'F1', baseFont: 'Helvetica' }])
        .map((font, index) => ({
            resourceKey: font.resourceKey || `F${index + 1}`,
            baseFont: font.baseFont || 'Helvetica'
        }));

    const totalPages = sanitizedPages.length;
    const totalFonts = fontEntries.length;
    const catalogId = 1;
    const pagesId = 2;
    const fontStartId = 3;
    const pageObjectStart = fontStartId + totalFonts;
    const contentObjectStart = pageObjectStart + totalPages;
    const totalObjects = contentObjectStart + totalPages - 1;
    const objectOffsets = new Array(totalObjects + 1).fill(0);
    const segments = [];
    let offset = 0;

    const append = (value) => {
        const bytes = encodePdfString(value);
        segments.push(bytes);
        offset += bytes.length;
    };

    const addObject = (id, content) => {
        objectOffsets[id] = offset;
        append(`${id} 0 obj\n`);
        append(content);
        append('\nendobj\n');
    };

    append('%PDF-1.4\n');
    append('%âãÏÓ\n');

    const fontObjects = fontEntries.map((font, index) => ({
        ...font,
        objectId: fontStartId + index
    }));

    addObject(catalogId, `<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
    addObject(pagesId, `<< /Type /Pages /Count ${totalPages} /Kids [${Array.from({ length: totalPages }, (_, index) => `${pageObjectStart + index} 0 R`).join(' ')}] >>`);

    fontObjects.forEach((font) => {
        addObject(font.objectId, `<< /Type /Font /Subtype /Type1 /BaseFont /${font.baseFont} >>`);
    });

    const fontResourceString = fontObjects
        .map((font) => `/${font.resourceKey} ${font.objectId} 0 R`)
        .join(' ');
    const resourceDictionary = `<< /Font << ${fontResourceString} >> >>`;

    sanitizedPages.forEach((stream, index) => {
        const pageObjectId = pageObjectStart + index;
        const contentObjectId = contentObjectStart + index;
        const contentLength = encodePdfString(stream).length;
        addObject(pageObjectId, `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(2)}] /Resources ${resourceDictionary} /Contents ${contentObjectId} 0 R >>`);
        addObject(contentObjectId, `<< /Length ${contentLength} >>\nstream\n${stream}\nendstream`);
    });

    const xrefOffset = offset;
    append(`xref\n0 ${totalObjects + 1}\n`);
    append('0000000000 65535 f \n');
    for (let index = 1; index <= totalObjects; index += 1) {
        append(`${String(objectOffsets[index]).padStart(10, '0')} 00000 n \n`);
    }
    append(`trailer\n<< /Size ${totalObjects + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

    const totalLength = segments.reduce((sum, segment) => sum + segment.length, 0);
    const result = new Uint8Array(totalLength);
    let position = 0;
    segments.forEach((segment) => {
        result.set(segment, position);
        position += segment.length;
    });

    return result;
}

function paginateLines(lines, { pageHeight, margin, defaultLineHeight, defaultFontSize }) {
    const availableHeight = pageHeight - margin * 2;
    const pages = [];
    let currentPage = [];
    let usedHeight = 0;

    lines.forEach((line) => {
        const lineHeight = Number.isFinite(line.lineHeight) ? line.lineHeight : defaultLineHeight;
        if (lineHeight <= 0) {
            return;
        }
        if (usedHeight + lineHeight > availableHeight && currentPage.length) {
            pages.push(currentPage);
            currentPage = [];
            usedHeight = 0;
        }
        currentPage.push({
            text: line.text || '',
            indent: Number.isFinite(line.indent) ? line.indent : 0,
            fontSize: Number.isFinite(line.fontSize) ? line.fontSize : defaultFontSize,
            lineHeight
        });
        usedHeight += lineHeight;
    });

    if (currentPage.length) {
        pages.push(currentPage);
    }

    return pages;
}

function buildSimplePdfDocument(pages, { pageWidth, pageHeight, margin, defaultFontSize }) {
    const totalPages = Math.max(1, pages.length);
    const segments = [];
    let offset = 0;

    const append = (value) => {
        const bytes = encodePdfString(value);
        segments.push(bytes);
        offset += bytes.length;
    };

    append('%PDF-1.4\n');
    append('%âãÏÓ\n');

    const totalObjects = 3 + totalPages * 2;
    const objectOffsets = new Array(totalObjects + 1).fill(0);

    const addObject = (id, content) => {
        objectOffsets[id] = offset;
        append(`${id} 0 obj\n`);
        append(content);
        append('\nendobj\n');
    };

    const pageObjectIds = [];
    const contentObjectIds = [];
    for (let index = 0; index < totalPages; index += 1) {
        pageObjectIds.push(4 + index);
        contentObjectIds.push(4 + totalPages + index);
    }

    addObject(1, '<< /Type /Catalog /Pages 2 0 R >>');
    addObject(2, `<< /Type /Pages /Count ${totalPages} /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] >>`);
    addObject(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

    for (let index = 0; index < totalPages; index += 1) {
        const pageId = pageObjectIds[index];
        const contentId = contentObjectIds[index];
        const lines = pages[index] || [];
        const { stream, length } = createPageContentStream(lines, {
            pageHeight,
            margin,
            defaultFontSize
        });

        addObject(pageId, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(2)}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`);
        addObject(contentId, `<< /Length ${length} >>\nstream\n${stream}\nendstream`);
    }

    const xrefOffset = offset;
    append(`xref\n0 ${totalObjects + 1}\n`);
    append('0000000000 65535 f \n');
    for (let index = 1; index <= totalObjects; index += 1) {
        append(`${String(objectOffsets[index]).padStart(10, '0')} 00000 n \n`);
    }
    append(`trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

    const totalLength = segments.reduce((sum, segment) => sum + segment.length, 0);
    const result = new Uint8Array(totalLength);
    let position = 0;
    segments.forEach((segment) => {
        result.set(segment, position);
        position += segment.length;
    });

    return result;
}

function createPageContentStream(lines, { pageHeight, margin, defaultFontSize }) {
    if (!Array.isArray(lines) || !lines.length) {
        return { stream: '', length: 0 };
    }

    const commands = [];
    let cursorY = pageHeight - margin;

    lines.forEach((line) => {
        const lineHeight = Number.isFinite(line.lineHeight) ? line.lineHeight : 16;
        cursorY -= lineHeight;
        if (!line.text) {
            return;
        }
        const fontSize = Number.isFinite(line.fontSize) ? line.fontSize : defaultFontSize;
        const indent = Number.isFinite(line.indent) ? line.indent : 0;
        const safeText = escapePdfText(line.text);
        commands.push(`BT /F1 ${fontSize} Tf 1 0 0 1 ${(margin + indent).toFixed(2)} ${cursorY.toFixed(2)} Tm (${safeText}) Tj ET`);
    });

    const stream = commands.join('\n');
    const length = encodePdfString(stream).length;
    return { stream, length };
}

function escapePdfText(value) {
    return String(value ?? '')
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)');
}

const pdfStringEncoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;

function encodePdfString(value) {
    const stringValue = String(value ?? '');
    if (pdfStringEncoder) {
        return pdfStringEncoder.encode(stringValue);
    }
    const buffer = new Uint8Array(stringValue.length);
    for (let index = 0; index < stringValue.length; index += 1) {
        buffer[index] = stringValue.charCodeAt(index) & 0xFF;
    }
    return buffer;
}

function triggerBlobDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    setTimeout(() => {
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    }, 0);
}

function sanitizeForModuleExport(value) {
    if (Array.isArray(value)) {
        return value.map(item => sanitizeForModuleExport(item));
    }
    if (!value || typeof value !== 'object') {
        return value;
    }
    return Object.keys(value).reduce((acc, key) => {
        const entry = value[key];
        if (entry === undefined) {
            return acc;
        }
        acc[key] = sanitizeForModuleExport(entry);
        return acc;
    }, {});
}

function buildDataModule(globalKey, data) {
    const sanitized = sanitizeForModuleExport(data);
    const json = JSON.stringify(sanitized, null, 2)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029')
        .replace(/\r?\n/g, '\\n');

    return `(function (global) {\n` +
        `    const data = JSON.parse('${json}');\n\n` +
        '    const deepFreeze = (value) => {\n' +
        '        if (!value || typeof value !== \"object\") {\n' +
        '            return value;\n' +
        '        }\n' +
        '        if (Array.isArray(value)) {\n' +
        '            value.forEach(deepFreeze);\n' +
        '        } else {\n' +
        '            Object.keys(value).forEach((key) => {\n' +
        '                deepFreeze(value[key]);\n' +
        '            });\n' +
        '        }\n' +
        '        return Object.freeze(value);\n' +
        '    };\n\n' +
        `    global.${globalKey} = deepFreeze(data);\n` +
        `})(typeof window !== 'undefined' ? window : globalThis);\n`;
}
function exportRisks() {
    if (window.rms) rms.exportData('csv');
}
window.exportRisks = exportRisks;

function exportOperationalData() {
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
            risks: Array.isArray(snapshot.risks) ? snapshot.risks : [],
            controls: Array.isArray(snapshot.controls) ? snapshot.controls : [],
            actionPlans: Array.isArray(snapshot.actionPlans) ? snapshot.actionPlans : [],
            history: Array.isArray(snapshot.history) ? snapshot.history : [],
            interviews: Array.isArray(snapshot.interviews) ? snapshot.interviews : []
        };

        const fileContent = buildDataModule('RMS_DEFAULT_DATA', payload);
        const blob = new Blob([fileContent], { type: 'application/javascript;charset=utf-8' });
        triggerBlobDownload(blob, 'rms.data.records.js');

        if (typeof showNotification === 'function') {
            showNotification('success', 'Sauvegarde des données opérationnelles générée');
        }
    } catch (error) {
        console.error('Erreur lors de la sauvegarde JSON', error);
        const message = "Erreur lors de l'export des données opérationnelles";
        if (typeof showNotification === 'function') {
            showNotification('error', message);
        } else {
            alert(`${message} : ${error.message}`);
        }
    }
}
window.exportOperationalData = exportOperationalData;
window.downloadRmsData = exportOperationalData;

function exportProcessConfiguration() {
    if (!window.rms) {
        console.warn('RiskManagementSystem indisponible pour exporter les processus.');
        if (typeof showNotification === 'function') {
            showNotification('error', "Export impossible : instance non initialisée");
        }
        return;
    }

    try {
        const snapshot = rms.getSnapshot();
        const rawConfig = snapshot && snapshot.config ? JSON.parse(JSON.stringify(snapshot.config)) : {};
        const processes = Array.isArray(rawConfig.processes) ? rawConfig.processes : [];
        const subProcesses = rawConfig.subProcesses && typeof rawConfig.subProcesses === 'object'
            ? rawConfig.subProcesses
            : {};

        const payload = { processes, subProcesses };

        const fileContent = buildDataModule('RMS_DEFAULT_PROCESS_CONFIG', payload);
        const blob = new Blob([fileContent], { type: 'application/javascript;charset=utf-8' });
        triggerBlobDownload(blob, 'rms.data.processes.js');

        if (typeof showNotification === 'function') {
            showNotification('success', 'Export des processus généré');
        }
    } catch (error) {
        console.error('Erreur lors de l\'export des processus', error);
        const message = "Erreur lors de l'export des processus";
        if (typeof showNotification === 'function') {
            showNotification('error', message);
        } else {
            alert(`${message} : ${error.message}`);
        }
    }
}
window.exportProcessConfiguration = exportProcessConfiguration;

function exportOtherParameters() {
    if (!window.rms) {
        console.warn('RiskManagementSystem indisponible pour exporter les paramètres.');
        if (typeof showNotification === 'function') {
            showNotification('error', "Export impossible : instance non initialisée");
        }
        return;
    }

    try {
        const snapshot = rms.getSnapshot();
        const rawConfig = snapshot && snapshot.config ? JSON.parse(JSON.stringify(snapshot.config)) : {};
        const otherParameters = { ...rawConfig };
        delete otherParameters.processes;
        delete otherParameters.subProcesses;

        const fileContent = buildDataModule('RMS_DEFAULT_PARAMETER_CONFIG', otherParameters);
        const blob = new Blob([fileContent], { type: 'application/javascript;charset=utf-8' });
        triggerBlobDownload(blob, 'rms.data.parameters.js');

        if (typeof showNotification === 'function') {
            showNotification('success', 'Export des autres paramètres généré');
        }
    } catch (error) {
        console.error('Erreur lors de l\'export des paramètres', error);
        const message = "Erreur lors de l'export des autres paramètres";
        if (typeof showNotification === 'function') {
            showNotification('error', message);
        } else {
            alert(`${message} : ${error.message}`);
        }
    }
}
window.exportOtherParameters = exportOtherParameters;

function handleConfigExport() {
    if (!window.rms) {
        console.warn('RiskManagementSystem indisponible pour exporter la configuration.');
        if (typeof showNotification === 'function') {
            showNotification('error', "Export impossible : instance non initialisée");
        }
        return;
    }

    const section = rms.currentConfigSection;
    if (section === 'processManager') {
        exportProcessConfiguration();
    } else if (section === 'general') {
        exportOtherParameters();
    } else if (section === 'history') {
        if (typeof exportHistory === 'function') {
            exportHistory();
        } else {
            console.warn("Export de l'historique indisponible : fonction non chargée.");
            if (typeof showNotification === 'function') {
                showNotification('error', "Export impossible : fonction d'historique absente");
            }
        }
    } else {
        exportOtherParameters();
    }
}
window.handleConfigExport = handleConfigExport;

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
      const updateLastSaveTimestamp = () => {
        try {
          if (RMS && typeof RMS.updateLastSaveTime === 'function') {
            RMS.updateLastSaveTime();
          } else if (typeof window.updateLastSaveTime === 'function') {
            window.updateLastSaveTime();
          }
        } catch (error) {
          console.warn('Impossible de mettre à jour la dernière heure de sauvegarde', error);
        }
      };
      const state = {
        get risks(){ return RMS.risks || window.risks || []; },
        set risks(v){ if (RMS.risks) RMS.risks = v; else window.risks = v; },
        get controls(){ return RMS.controls || window.controls || []; },
        set controls(v){ if (RMS.controls) RMS.controls = v; else window.controls = v; },
        get actionPlans(){ return RMS.actionPlans || window.actionPlans || []; },
        set actionPlans(v){ if (RMS.actionPlans) RMS.actionPlans = v; else window.actionPlans = v; },
        get history(){ return RMS.history || window.historyLog || []; },
        set history(v){ if (RMS.history) RMS.history = v; else window.historyLog = v; },
        get interviews(){ return RMS.interviews || window.interviews || []; },
        set interviews(v){ if (RMS.interviews) RMS.interviews = v; else window.interviews = v; },
        save: (label="auto") => {
          try {
            if (RMS.saveData) { RMS.saveData(); }
            else if (window.saveData) { window.saveData(); }
            const effectiveLabel = (typeof label === 'string' && label.trim()) ? label.trim() : 'auto';
            const description = effectiveLabel !== 'auto'
              ? `Sauvegarde "${effectiveLabel}" enregistrée.`
              : 'Sauvegarde automatique enregistrée.';
            addHistoryItem(`Sauvegarde ${effectiveLabel}`, description, { label: effectiveLabel });
            updateLastSaveTimestamp();
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
        },
        updateLastSaveTime: updateLastSaveTimestamp
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
                    const mitigationEffectivenessRaw = toText(
                      accessor.get(
                        'mitigationEffectiveness',
                        'efficaciteMitigation',
                        'efficaciteMesures',
                        'niveauEfficacite',
                        'mitigation_level'
                      ),
                      ''
                    );
                    const statut = toText(
                      accessor.get('statut', 'status', 'etat', 'state', 'riskStatus'),
                      'brouillon'
                    );
                    const tiers = parseTextList(accessor.get('tiers', 'tiersImpliques', 'tiers_associes', 'stakeholders', 'thirdParties', 'partiesPrenantes'));
                    const paysExposes = parseTextList(accessor.get('paysExposes', 'countries', 'pays', 'territoires', 'riskCountries', 'pays_exposes'));
                    const controls = parseIdList(accessor.get('controls', 'controles', 'contrôles', 'controlIds', 'control_ids', 'listeControls'));
                    const actionPlans = parseIdList(accessor.get('actionPlans', 'plans', 'planActions', 'actionPlanIds', 'plan_ids', 'plansActions'));

                    const aggravatingGroup1 = parseTextList(accessor.get(
                        'aggravatingGroup1',
                        'facteursAggravantsGroupe1',
                        'facteurs_aggravants_groupe1',
                        'aggravatingFactorsGroup1',
                        'facteurs_aggravants_1'
                    ));
                    const aggravatingGroup2 = parseTextList(accessor.get(
                        'aggravatingGroup2',
                        'facteursAggravantsGroupe2',
                        'facteurs_aggravants_groupe2',
                        'aggravatingFactorsGroup2',
                        'facteurs_aggravants_2'
                    ));

                    let aggravatingCoefficient;
                    const rawCoefficient = accessor.get('aggravatingCoefficient', 'coefficientAggravant', 'coeffAggravant', 'coefAggravant', 'coefficient_aggravant');
                    if (hasMeaningfulValue(rawCoefficient)) {
                        const parsed = Number.parseFloat(String(rawCoefficient).replace(',', '.'));
                        if (Number.isFinite(parsed) && parsed >= 1) {
                            aggravatingCoefficient = parsed;
                        }
                    }

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
                      statut,
                      controls,
                      actionPlans,
                      tiers,
                      paysExposes,
                      dateCreation
                    };

                    risk.aggravatingFactors = {
                      group1: aggravatingGroup1,
                      group2: aggravatingGroup2
                    };

                    if (mitigationEffectivenessRaw) {
                      risk.mitigationEffectiveness = typeof normalizeMitigationEffectiveness === 'function'
                        ? normalizeMitigationEffectiveness(mitigationEffectivenessRaw)
                        : mitigationEffectivenessRaw;
                    }

                    if (aggravatingCoefficient !== undefined) {
                      risk.aggravatingCoefficient = aggravatingCoefficient;
                    }

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

      window.exportMatrix = async function exportMatrix(view = 'brut'){
        const normalizedView = view === 'net' ? 'net' : 'brut';
        const selector = `.matrix-container[data-view="${normalizedView}"]`;
        const container = document.querySelector(selector) || document.querySelector('.matrix-container') || document.querySelector('#matrix') || document.body;
        if (!window.html2canvas){
          alert("html2canvas non chargé. Connectez-vous à Internet ou ajoutez la librairie en local.");
          return;
        }
        const canvas = await html2canvas(container, {scale: 2});
        canvas.toBlob((blob)=>{
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = `matrice-risques-${normalizedView}.png`;
          document.body.appendChild(a); a.click();
          setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); },0);
          const label = normalizedView === 'net' ? 'des risques nets' : 'des risques bruts';
          addHistoryItem("Export matrice (PNG)", `Export de la matrice ${label} en image PNG.`, { view: normalizedView });
        });
      };

      window.toggleFullScreen = function toggleFullScreen(view = 'brut'){
        const normalizedView = view === 'net' ? 'net' : 'brut';
        const selector = `.matrix-container[data-view="${normalizedView}"]`;
        const el = document.querySelector(selector) || document.querySelector('.matrix-container') || document.documentElement;
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
          document.getElementById('controlOrigin').value = lastControlData.origin || '';
          document.getElementById('controlOwner').value = lastControlData.owner || '';
          document.getElementById('controlFrequency').value = lastControlData.frequency || '';
          document.getElementById('controlMode').value = lastControlData.mode || '';
          document.getElementById('controlEffectiveness').value = lastControlData.effectiveness || '';
          document.getElementById('controlStatus').value = lastControlData.status || '';
          document.getElementById('controlDescription').value = lastControlData.description || '';
          selectedRisksForControl = [...(lastControlData.risks || [])];
        }

        const contextRiskId = (window.controlCreationContext && window.controlCreationContext.riskId != null)
          ? window.controlCreationContext.riskId
          : null;
        if (contextRiskId != null && !selectedRisksForControl.some(id => idsEqual(id, contextRiskId))) {
          selectedRisksForControl.push(contextRiskId);
        }

        document.getElementById('controlModalTitle').textContent = 'Nouveau Contrôle';
        updateSelectedRisksDisplay();
        populateControlOwnerSuggestions();
        const modal = document.getElementById('controlModal');
        if (modal) {
          if (typeof window.bringModalToFront === 'function') {
            window.bringModalToFront(modal);
          } else {
            modal.classList.add('show');
          }
        }
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
        document.getElementById('controlOrigin').value = control.origin || '';
        document.getElementById('controlOwner').value = control.owner || '';
        document.getElementById('controlFrequency').value = control.frequency || '';
        document.getElementById('controlMode').value = control.mode || '';
        document.getElementById('controlEffectiveness').value = control.effectiveness || '';
        document.getElementById('controlStatus').value = control.status || '';
        document.getElementById('controlDescription').value = control.description || '';

        document.getElementById('controlModalTitle').textContent = 'Modifier le Contrôle';
        updateSelectedRisksDisplay();
        populateControlOwnerSuggestions();
        const modal = document.getElementById('controlModal');
        if (modal) {
          if (typeof window.bringModalToFront === 'function') {
            window.bringModalToFront(modal);
          } else {
            modal.classList.add('show');
          }
        }
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
        if (typeof window.closeModal === 'function') {
          window.closeModal('controlModal');
        } else {
          const modal = document.getElementById('controlModal');
          if (modal) {
            modal.classList.remove('show');
          }
        }
        if (window.controlCreationContext && window.controlCreationContext.fromRisk) {
          window.controlCreationContext = null;
        }
      };

      window.openRiskSelector = function() {
        riskFilterQueryForControl = '';
        const searchInput = document.getElementById('riskSearchInput');
        if (searchInput) searchInput.value = '';
        renderRiskSelectionList();
        const modal = document.getElementById('riskSelectorModal');
        if (modal) {
          if (typeof window.bringModalToFront === 'function') {
            window.bringModalToFront(modal);
          } else {
            modal.classList.add('show');
          }
        }
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
        if (typeof window.closeModal === 'function') {
          window.closeModal('riskSelectorModal');
        } else {
          const modal = document.getElementById('riskSelectorModal');
          if (modal) {
            modal.classList.remove('show');
          }
        }
      };

      window.toggleRiskSelection = function(riskId) {
        const targetId = String(riskId);
        const index = selectedRisksForControl.findIndex(id => idsEqual(id, targetId));
        if (index > -1) {
          selectedRisksForControl.splice(index, 1);
        } else {
          selectedRisksForControl.push(riskId);
        }
        if (RMS && typeof RMS.markUnsavedChange === 'function') {
          RMS.markUnsavedChange('controlForm');
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
        if (RMS && typeof RMS.markUnsavedChange === 'function') {
          RMS.markUnsavedChange('controlForm');
        }
      };

      window.saveControl = function() {
        const form = document.getElementById('controlForm');
        if (!form) return;
        const formData = new FormData(form);
        const controlData = {
          name: formData.get('name'),
          type: formData.get('type'),
          origin: formData.get('origin'),
          owner: formData.get('owner'),
          frequency: formData.get('frequency'),
          mode: formData.get('mode'),
          effectiveness: formData.get('effectiveness'),
          status: formData.get('status'),
          description: formData.get('description'),
          risks: [...selectedRisksForControl]
        };

        if (!controlData.name || !controlData.type || !controlData.origin || !controlData.owner || !controlData.frequency ||
            !controlData.mode || !controlData.effectiveness || !controlData.status) {
          alert('Veuillez remplir tous les champs obligatoires (marqués d\'un *)');
          return;
        }

        let resultingControlId = currentEditingControlId || null;
        const context = (window.controlCreationContext && window.controlCreationContext.fromRisk)
          ? window.controlCreationContext
          : null;

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
          resultingControlId = newControl.id;
          addHistoryItem("Nouveau contrôle", `Nouveau contrôle "${controlData.name}" créé (ID ${newControl.id}).`, {id: newControl.id, name: controlData.name});
          toast(`Contrôle "${controlData.name}" créé avec succès`);
        }

        if (context && resultingControlId != null) {
          if (!selectedControlsForRisk.some(id => idsEqual(id, resultingControlId))) {
            selectedControlsForRisk.push(resultingControlId);
          }
          if (typeof window.updateSelectedControlsDisplay === 'function') {
            window.updateSelectedControlsDisplay();
          }

          if (context.riskId != null) {
            const targetRiskId = context.riskId;
            const risk = state.risks.find(r => idsEqual(r.id, targetRiskId));
            if (risk) {
              risk.controls = risk.controls || [];
              if (!risk.controls.some(id => idsEqual(id, resultingControlId))) {
                risk.controls.push(resultingControlId);
              }
            }

            const control = state.controls.find(c => idsEqual(c.id, resultingControlId));
            if (control) {
              control.risks = control.risks || [];
              if (!control.risks.some(id => idsEqual(id, targetRiskId))) {
                control.risks.push(targetRiskId);
              }
            }
          }

          window.controlCreationContext = null;
        }

        if (context && RMS && typeof RMS.markUnsavedChange === 'function') {
          RMS.markUnsavedChange('riskForm');
        }

        lastControlData = { ...controlData, risks: [...controlData.risks] };

        state.save("contrôle");
        state.renderAll();
        populateControlOwnerSuggestions();
        closeControlModal();
        if (RMS && typeof RMS.clearUnsavedChanges === 'function') {
          RMS.clearUnsavedChanges('controlForm');
        }
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
