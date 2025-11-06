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
    applyPatch();
    rms.renderAll();
});
