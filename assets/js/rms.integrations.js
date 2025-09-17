// Enhanced Risk Management System - Integrations & Advanced Features

function exportDashboard() {
    if (window.rms) rms.exportData('json');
}
window.exportDashboard = exportDashboard;

function exportRisks() {
    if (window.rms) rms.exportData('csv');
}
window.exportRisks = exportRisks;
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
            addHistoryItem(`Sauvegarde ${label}`);
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

      function addHistoryItem(action, meta){
        try{
          const item = { id: Date.now().toString(36)+Math.random().toString(36).slice(2,6), ts: new Date().toISOString(), action, meta: meta||{} };
          state.history = [...state.history, item];
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
                addHistoryItem("Import JSON", {file: file.name, counts: {risks: obj.risks?.length||0, controls: obj.controls?.length||0}});
              } else {
                const rows = csvParse(text);
                if (rows.length){
                  const mapped = rows.map(r => ({
                    id: r.id || (Date.now()+Math.random()).toString(36),
                    titre: r.titre || r.title || r.name || "Sans titre",
                    description: r.description || "",
                    typeCorruption: r.typeCorruption || r.type || "autre",
                    probabilite: Number(r.probabilite ?? r.probability ?? 2),
                    impact: Number(r.impact ?? 2),
                    status: r.status || r.statut || "brouillon",
                    controles: r.controles ? String(r.controles).split("|").filter(Boolean) : []
                  }));
                  state.risks = mergeById(state.risks, mapped);
                  addHistoryItem("Import CSV", {file: file.name, count: mapped.length});
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
        addHistoryItem("Export historique", {format});
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
          addHistoryItem("Export matrice (PNG)");
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

        addHistoryItem("Suppression contrôle", {id: controlId, name: controlName});
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
            addHistoryItem("Modification contrôle", {id: currentEditingControlId, name: controlData.name});
            toast(`Contrôle "${controlData.name}" modifié avec succès`);
          }
        } else {
          const newControl = {
            id: getNextSequentialId(state.controls),
            ...controlData,
            dateCreation: new Date().toISOString().split('T')[0]
          };

          state.controls.push(newControl);
          addHistoryItem("Nouveau contrôle", {id: newControl.id, name: controlData.name});
          toast(`Contrôle "${controlData.name}" créé avec succès`);
        }

        lastControlData = { ...controlData, risks: [...controlData.risks] };

        state.save("contrôle");
        state.renderAll();
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
