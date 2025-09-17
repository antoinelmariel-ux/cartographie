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
