import { RiskManagementSystem, switchTab, changeMatrixView, applyFilters, searchRisks, addNewRisk, closeModal, calculateScore, saveRisk, showNotification, exportDashboard, exportRisks, generateReport, refreshDashboard, initPatch } from './rms.js';

document.addEventListener('DOMContentLoaded', () => {
  const rms = new RiskManagementSystem();
  window.rms = rms;

  window.switchTab = switchTab;
  window.changeMatrixView = changeMatrixView;
  window.applyFilters = applyFilters;
  window.searchRisks = searchRisks;
  window.addNewRisk = addNewRisk;
  window.closeModal = closeModal;
  window.calculateScore = calculateScore;
  window.saveRisk = saveRisk;
  window.showNotification = showNotification;
  window.exportDashboard = exportDashboard;
  window.exportRisks = exportRisks;
  window.generateReport = generateReport;
  window.refreshDashboard = refreshDashboard;

  initPatch();

  rms.renderAll();
});
