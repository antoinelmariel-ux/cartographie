document.addEventListener('DOMContentLoaded', () => {
    const rms = new RiskManagementSystem();
    setRms(rms);
    bindEvents();
    if (typeof setupUnsavedChangeTracking === 'function') {
        setupUnsavedChangeTracking();
    }
    if (typeof registerBeforeUnloadWarning === 'function') {
        registerBeforeUnloadWarning();
    }
    try {
        applyPatch();
    } catch (error) {
        console.error('[Boot] applyPatch() failed during startup.', error);
    }
    initializeNewControlUiGuard();
    verifyControlBootIntegrity();
    rms.renderAll();
});

function notifyBootIssue(message) {
    const normalizedMessage = (typeof message === 'string' && message.trim())
        ? message.trim()
        : 'Une erreur de démarrage est survenue.';
    if (typeof window.showNotification === 'function') {
        window.showNotification(normalizedMessage, 'error');
        return;
    }
    alert(normalizedMessage);
}

function initializeNewControlUiGuard() {
    const button = document.getElementById('newControlButton');
    if (!button || button.dataset.controlListenerInitialized === 'true') {
        return;
    }

    button.addEventListener('click', (event) => {
        event.preventDefault();
        if (typeof window.addNewControl === 'function') {
            window.addNewControl();
            return;
        }
        notifyBootIssue('Action impossible : addNewControl est indisponible.');
    });
    button.dataset.controlListenerInitialized = 'true';
}

function verifyControlBootIntegrity() {
    if (typeof window.addNewControl !== 'function') {
        const message = '[Boot] addNewControl is unavailable after initialization.';
        console.error(message);
        notifyBootIssue('Initialisation incomplète : fonctionnalité New Control indisponible.');
    }
}
