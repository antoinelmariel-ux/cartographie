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
