import { RiskManagementSystem, setRms, bindEvents, applyPatch } from './rms.js';

document.addEventListener('DOMContentLoaded', () => {
    const rms = new RiskManagementSystem();
    setRms(rms);
    bindEvents();
    applyPatch();
    rms.renderAll();
});
