// Enhanced Risk Management System - Utility Functions

function sanitizeId(str) {
    return str.replace(/[^a-z0-9_-]/gi, '_');
}

function slugifyLabel(input) {
    if (typeof input !== 'string') {
        return '';
    }

    return input
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function idsEqual(a, b) {
    return String(a) === String(b);
}

function getNextSequentialId(items, startAt = 1) {
    if (!Array.isArray(items) || items.length === 0) {
        return startAt;
    }

    let maxId = startAt - 1;

    items.forEach(item => {
        if (!item || item.id === undefined || item.id === null) return;
        const numericId = Number(item.id);
        if (Number.isFinite(numericId) && numericId > maxId) {
            maxId = Math.trunc(numericId);
        }
    });

    return maxId + 1;
}

window.sanitizeId = sanitizeId;
window.idsEqual = idsEqual;
window.getNextSequentialId = getNextSequentialId;
window.slugifyLabel = slugifyLabel;

const AGGRAVATING_FACTOR_GROUPS = Object.freeze({
    group1: { coefficient: 1.4, inputName: 'aggravatingGroup1' },
    group2: { coefficient: 1.2, inputName: 'aggravatingGroup2' }
});

function normalizeAggravatingFactors(factors = {}) {
    const normalized = { group1: [], group2: [] };
    if (!factors || typeof factors !== 'object') {
        return normalized;
    }

    Object.keys(normalized).forEach(groupKey => {
        const rawValues = factors[groupKey];
        if (!Array.isArray(rawValues)) {
            normalized[groupKey] = [];
            return;
        }

        const uniqueValues = new Set();
        normalized[groupKey] = rawValues
            .map(value => (value === undefined || value === null ? '' : String(value).trim()))
            .filter(value => {
                if (!value) return false;
                if (uniqueValues.has(value)) return false;
                uniqueValues.add(value);
                return true;
            });
    });

    return normalized;
}

function computeAggravatingCoefficientFromGroups(groups = {}) {
    const normalized = normalizeAggravatingFactors(groups);
    let coefficient = 1;

    if (normalized.group2.length > 0) {
        coefficient = Math.max(coefficient, AGGRAVATING_FACTOR_GROUPS.group2.coefficient);
    }
    if (normalized.group1.length > 0) {
        coefficient = Math.max(coefficient, AGGRAVATING_FACTOR_GROUPS.group1.coefficient);
    }

    return coefficient;
}

function getRiskAggravatingFactors(risk) {
    if (!risk || typeof risk !== 'object') {
        return normalizeAggravatingFactors();
    }

    if (risk.aggravatingFactors && typeof risk.aggravatingFactors === 'object') {
        return normalizeAggravatingFactors(risk.aggravatingFactors);
    }

    const legacy = {
        group1: Array.isArray(risk.aggravatingGroup1) ? risk.aggravatingGroup1 : [],
        group2: Array.isArray(risk.aggravatingGroup2) ? risk.aggravatingGroup2 : []
    };

    return normalizeAggravatingFactors(legacy);
}

function getRiskAggravatingCoefficient(risk) {
    const factors = getRiskAggravatingFactors(risk);
    const computed = computeAggravatingCoefficientFromGroups(factors);
    const raw = Number(risk && risk.aggravatingCoefficient);
    const base = Number.isFinite(raw) && raw >= 1 ? raw : 1;
    return Math.max(base, computed);
}

function getRiskEffectiveBrutProbability(risk) {
    const prob = Number(risk && risk.probBrut) || 0;
    return prob * getRiskAggravatingCoefficient(risk);
}

function getRiskBrutScore(risk) {
    const impact = Number(risk && risk.impactBrut) || 0;
    return getRiskEffectiveBrutProbability(risk) * impact;
}

function formatCoefficient(value, options) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
        return '1,0';
    }

    const formatOptions = options || { minimumFractionDigits: 1, maximumFractionDigits: 1 };
    return numeric.toLocaleString('fr-FR', formatOptions);
}

function getFormAggravatingSelection() {
    const selection = { group1: [], group2: [] };

    if (typeof document === 'undefined') {
        selection.coefficient = 1;
        return selection;
    }

    Object.entries(AGGRAVATING_FACTOR_GROUPS).forEach(([groupKey, config]) => {
        const selector = `input[name="${config.inputName}"]:checked`;
        const values = Array.from(document.querySelectorAll(selector)).map(input => input.value);
        selection[groupKey] = values;
    });

    selection.coefficient = computeAggravatingCoefficientFromGroups(selection);
    return selection;
}

window.AGGRAVATING_FACTOR_GROUPS = AGGRAVATING_FACTOR_GROUPS;
window.normalizeAggravatingFactors = normalizeAggravatingFactors;
window.computeAggravatingCoefficientFromGroups = computeAggravatingCoefficientFromGroups;
window.getRiskAggravatingFactors = getRiskAggravatingFactors;
window.getRiskAggravatingCoefficient = getRiskAggravatingCoefficient;
window.getRiskEffectiveBrutProbability = getRiskEffectiveBrutProbability;
window.getRiskBrutScore = getRiskBrutScore;
window.formatCoefficient = formatCoefficient;
window.getFormAggravatingSelection = getFormAggravatingSelection;

const MITIGATION_EFFECTIVENESS_ORDER = Object.freeze([
    'inefficace',
    'insuffisant',
    'ameliorable',
    'efficace'
]);

const MITIGATION_EFFECTIVENESS_SCALE = Object.freeze({
    inefficace: { label: 'Inefficace', coefficient: 0 },
    insuffisant: { label: 'Insuffisant', coefficient: 0.25 },
    ameliorable: { label: 'Améliorable', coefficient: 0.5 },
    efficace: { label: 'Efficace', coefficient: 0.75 }
});

const DEFAULT_MITIGATION_EFFECTIVENESS = 'insuffisant';

const NET_IMPACT_SEVERITY_MAP = Object.freeze({
    critique: 4,
    fort: 3,
    modere: 2,
    faible: 1
});

const NET_IMPACT_TO_SEVERITY = Object.freeze(Object.entries(NET_IMPACT_SEVERITY_MAP)
    .reduce((acc, [severity, value]) => {
        acc[value] = severity;
        return acc;
    }, {}));

function normalizeMitigationEffectiveness(value) {
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (MITIGATION_EFFECTIVENESS_ORDER.includes(normalized)) {
            return normalized;
        }
    }
    return DEFAULT_MITIGATION_EFFECTIVENESS;
}

function getMitigationEffectivenessOptions() {
    return MITIGATION_EFFECTIVENESS_ORDER.map(key => {
        const entry = MITIGATION_EFFECTIVENESS_SCALE[key] || {};
        return {
            value: key,
            label: entry.label || key,
            coefficient: entry.coefficient ?? 0
        };
    });
}

function getRiskMitigationEffectiveness(risk) {
    if (risk && typeof risk === 'object') {
        const candidates = [
            risk.mitigationEffectiveness,
            risk.mitigation_level,
            risk.mitigationLevel,
            risk.efficacite,
            risk.efficaciteMesures,
            risk.effectiveness
        ];

        for (const candidate of candidates) {
            if (typeof candidate === 'string' && candidate.trim()) {
                return normalizeMitigationEffectiveness(candidate);
            }
        }
    }

    return DEFAULT_MITIGATION_EFFECTIVENESS;
}

function getRiskMitigationCoefficient(input) {
    const level = typeof input === 'string' ? normalizeMitigationEffectiveness(input) : getRiskMitigationEffectiveness(input);
    const entry = MITIGATION_EFFECTIVENESS_SCALE[level];
    const coefficient = entry?.coefficient;
    return Number.isFinite(coefficient) ? coefficient : 0;
}

function getMitigationColumnFromLevel(level) {
    const normalized = normalizeMitigationEffectiveness(level);
    const index = MITIGATION_EFFECTIVENESS_ORDER.indexOf(normalized);
    return index >= 0 ? index + 1 : 1;
}

function getMitigationLevelFromColumn(column) {
    const index = Math.min(
        Math.max(parseInt(column, 10) - 1, 0),
        MITIGATION_EFFECTIVENESS_ORDER.length - 1
    );
    return MITIGATION_EFFECTIVENESS_ORDER[index] || DEFAULT_MITIGATION_EFFECTIVENESS;
}

function getNetImpactValueFromSeverity(severity) {
    if (typeof severity === 'string') {
        const normalized = severity.trim().toLowerCase();
        if (NET_IMPACT_SEVERITY_MAP[normalized]) {
            return NET_IMPACT_SEVERITY_MAP[normalized];
        }
    }
    return NET_IMPACT_SEVERITY_MAP.faible;
}

function getSeverityFromNetImpactValue(value) {
    const numeric = parseInt(value, 10);
    return NET_IMPACT_TO_SEVERITY[numeric] || 'faible';
}

function getRiskNetScore(risk) {
    const brutScore = typeof getRiskBrutScore === 'function'
        ? getRiskBrutScore(risk)
        : (Number(risk?.probBrut) || 0) * (Number(risk?.impactBrut) || 0);
    const coefficient = getRiskMitigationCoefficient(risk);
    return brutScore * coefficient;
}

function getRiskSeverityFromScore(score) {
    const numericScore = Number(score) || 0;
    if (numericScore >= 12) return 'critique';
    if (numericScore >= 6) return 'fort';
    if (numericScore >= 3) return 'modere';
    return 'faible';
}

function getRiskBrutLevel(risk) {
    const brutScore = typeof getRiskBrutScore === 'function'
        ? getRiskBrutScore(risk)
        : (Number(risk?.probBrut) || 0) * (Number(risk?.impactBrut) || 0);
    return getRiskSeverityFromScore(brutScore);
}

function getRiskNetInfo(risk) {
    const coefficient = getRiskMitigationCoefficient(risk);
    const brutScore = typeof getRiskBrutScore === 'function'
        ? getRiskBrutScore(risk)
        : (Number(risk?.probBrut) || 0) * (Number(risk?.impactBrut) || 0);
    const score = brutScore * coefficient;
    const level = getRiskSeverityFromScore(score);
    const effectiveness = getRiskMitigationEffectiveness(risk);
    const label = MITIGATION_EFFECTIVENESS_SCALE[effectiveness]?.label || effectiveness;
    const reduction = Math.round(coefficient * 100);

    return { score, brutScore, coefficient, level, effectiveness, label, reduction };
}

function formatMitigationCoefficient(value) {
    const numeric = Number(value);
    const safe = Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
    return `${Math.round(safe * 100)}%`;
}

window.MITIGATION_EFFECTIVENESS_ORDER = MITIGATION_EFFECTIVENESS_ORDER;
window.MITIGATION_EFFECTIVENESS_SCALE = MITIGATION_EFFECTIVENESS_SCALE;
window.DEFAULT_MITIGATION_EFFECTIVENESS = DEFAULT_MITIGATION_EFFECTIVENESS;
window.normalizeMitigationEffectiveness = normalizeMitigationEffectiveness;
window.getMitigationEffectivenessOptions = getMitigationEffectivenessOptions;
window.getRiskMitigationEffectiveness = getRiskMitigationEffectiveness;
window.getRiskMitigationCoefficient = getRiskMitigationCoefficient;
window.getRiskNetScore = getRiskNetScore;
window.getRiskSeverityFromScore = getRiskSeverityFromScore;
window.getRiskBrutLevel = getRiskBrutLevel;
window.getRiskNetInfo = getRiskNetInfo;
window.formatMitigationCoefficient = formatMitigationCoefficient;
window.getMitigationColumnFromLevel = getMitigationColumnFromLevel;
window.getMitigationLevelFromColumn = getMitigationLevelFromColumn;
window.getNetImpactValueFromSeverity = getNetImpactValueFromSeverity;
window.getSeverityFromNetImpactValue = getSeverityFromNetImpactValue;
