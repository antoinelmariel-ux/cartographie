document.addEventListener('DOMContentLoaded', () => {
    const rms = new RiskManagementSystem();
    setRms(rms);
    bindEvents();
    applyPatch();
    rms.renderAll();
});
