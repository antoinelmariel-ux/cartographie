// Integration helpers and legacy patch routines for RMS
            } else if (planId && typeof editActionPlan === 'function') {
                e.preventDefault();
                editActionPlan(parseInt(planId, 10));
            }
        }
    });
}

function applyPatch() {
    (function(){
      const RMS = window.rms || window.RMS || window.RiskSystem || {};
      // Guard: bind common getters
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
    
      // CSV escaping
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
    
      // === Importer ===
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
              if (file.name.toLowerCase().endswith(".json")) {
                const obj = JSON.parse(text);
                if (obj.risks) state.risks = mergeById(state.risks, obj.risks);
                if (obj.controls) state.controls = mergeById(state.controls, obj.controls);
                if (obj.history) state.history = [...state.history, ...obj.history];
                addHistoryItem("Import JSON", {file: file.name, counts: {risks: obj.risks?.length||0, controls: obj.controls?.length||0}});
              } else {
                // naive CSV: expects headers
                const rows = csvParse(text);
                if (rows.length){
                  const mapped = rows.map(r => ({
                    id: r.id || (Date.now()+Math.random()).toString(36),
                    titre: r.titre || r.title || r.name || "Sans titre",
                    description: r.description || "",
                    typeCorruption: r.typeCorruption || r.type || "autre",
                    probabilite: Number(r.probabilite ?? r.probability ?? 2),
                    impact: Number(r.impact ?? 2),
                    status: r.status || r.statut || "nouveau",
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
        // simple CSV parser (handles quotes)
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
    
      // === Export History ===
      window.exportHistory = function exportHistory(format="json"){
        const items = state.history || [];
        if (!items.length){ alert("Aucun élément d'historique"); return; }
        if (format === "csv"){
          const csv = toCSV(items);
          const bom = "\ufeff"; // Excel
          downloadBlob("historique.csv","text/csv;charset=utf-8", bom + csv);
        } else {
          downloadBlob("historique.json","application/json;charset=utf-8", JSON.stringify(items, null, 2));
        }
        addHistoryItem("Export historique", {format});
      };
    
      // === Export Matrix Capture ===
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
    
      // === Toggle Fullscreen ===
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
    
      // === Controls CRUD (minimal UI via prompt) ===
      window.addNewControl = function addNewControl(){
        const name = prompt("Nom du contrôle ?");
        if (!name) return;
        const id = getNextSequentialId(state.controls);
        const ctrl = { id, name, description: "", owner: "", effectiveness: "moyen" };
        state.controls = [...state.controls, ctrl];
        addHistoryItem("Nouveau contrôle", {id, name});
        state.save("contrôle");
        state.renderAll();
      };
    
      window.addControlToRisk = function addControlToRisk(riskId){
        const rId = riskId || prompt("ID du risque à enrichir ?");
        const risk = (state.risks||[]).find(r => String(r.id)===String(rId));
        if (!risk){ alert("Risque introuvable"); return; }
        const options = state.controls.map(c=>`${c.id}:${c.name}`).join("\n") || "(aucun contrôle)";
        const chosen = prompt("Sélectionnez un contrôle (id) parmi :\n"+options);
        const ctrl = state.controls.find(c=>String(c.id)===String(chosen));
        if (!ctrl){ alert("Contrôle introuvable"); return; }
        risk.controles = Array.from(new Set([...(risk.controles||[]), ctrl.id]));
        addHistoryItem("Lien contrôle→risque", {riskId:risk.id, controlId: ctrl.id});
        state.save("lien contrôle");
        state.renderAll();
      };
    
      // === Edit Risk (basic) ===
      window.editRisk = function editRisk(riskId){
        const risk = (state.risks||[]).find(r => String(r.id)===String(riskId));
        if (!risk){ alert("Risque introuvable"); return; }
        const titre = prompt("Titre du risque :", risk.titre || risk.title || "");
        if (titre===null) return;
        const description = prompt("Description :", risk.description || "");
        if (description===null) return;
        const probabilite = Number(prompt("Probabilité (1-4):", risk.probabilite ?? 2) || 2);
        const impact = Number(prompt("Impact (1-4):", risk.impact ?? 2) || 2);
        const status = prompt("Statut (nouveau|en-cours|traite):", risk.status || "nouveau") || "nouveau";
        Object.assign(risk, {titre, description, probabilite, impact, status});
        addHistoryItem("Édition risque", {riskId});
        state.save("risque modifié");
        state.renderAll();
      };
    
      // === Update Charts (minimal) ===
      window.updateCharts = function updateCharts(){
        if (!window.Chart) return; // library not loaded
        const byStatus = (state.risks||[]).reduce((acc, r)=>{
          const k = r.status || "inconnu"; acc[k] = (acc[k]||0)+1; return acc;
        }, {});
        const canvas = document.querySelector("#chart-status") || document.querySelector("canvas.chart-status");
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (canvas._chart) { canvas._chart.destroy(); }
        canvas._chart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: Object.keys(byStatus),
            datasets: [{ data: Object.values(byStatus) }]
          },
          options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
      };
    
      // === Export Dashboard PDF ===
      window.exportDashboard = async function exportDashboard(){
        const root = document.querySelector('#dashboard') || document.body;
        if (!window.html2canvas || !window.jspdf){
          alert("Librairies manquantes (html2canvas / jsPDF). Activez Internet ou installez-les en local.");
          return;
        }
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({orientation: 'portrait', unit: 'pt', format: 'a4'});
        const A4_W = 595.28, A4_H = 841.89, M = 24;
        const scale = 2;
    
        const sections = root.querySelectorAll(':scope > *');
        let first = true;
        for (const sec of sections){
          const canvas = await html2canvas(sec, {scale});
          const imgW = A4_W - 2*M;
          const ratio = imgW / canvas.width;
          const imgH = canvas.height * ratio;
          if (!first) pdf.addPage();
          first = false;
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', M, M, imgW, imgH);
        }
        pdf.save('dashboard-risques.pdf');
        addHistoryItem("Export dashboard PDF");
      };
    
      // === Safer event handlers (avoid global event) ===
      function rewireHandlers(){
        document.querySelectorAll("[data-switch-tab]").forEach(btn=>{
          btn.onclick = (e)=>{
            const tab = btn.getAttribute("data-switch-tab");
            if (window.switchTab) window.switchTab(e, tab);
            else {
              document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active", x.id===tab));
              document.querySelectorAll("[data-switch-tab]").forEach(x=>x.classList.toggle("active", x===btn));
            }
          };
        });
        document.querySelectorAll("[data-matrix-view]").forEach(btn=>{
          btn.onclick = (e)=>{
            const view = btn.getAttribute("data-matrix-view");
            if (window.changeMatrixView) window.changeMatrixView(e, view);
            document.querySelectorAll("[data-matrix-view]").forEach(x=>x.classList.toggle("active", x===btn));
          };
        });
      }
    
      if (document.readyState === 'loading') {
        document.addEventListener("DOMContentLoaded", ()=>{
          try { rewireHandlers(); } catch(e){}
          try { updateCharts(); } catch(e){}
        });
      } else {
        try { rewireHandlers(); } catch(e){}
        try { updateCharts(); } catch(e){}
      }
    
      // === Functions for Control Management ===
      
      let currentEditingControlId = null;
      let selectedRisksForControl = [];
      let riskFilterQueryForControl = '';
      let lastControlData = null;
    
      // Open control modal for new control
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

        // Show modal
        document.getElementById('controlModal').classList.add('show');
      };
    
      // Open control modal for editing
      window.editControl = function(controlId) {
        const control = state.controls.find(c => c.id == controlId);
        if (!control) {
          alert('Contrôle introuvable');
          return;
        }
    
        currentEditingControlId = controlId;
        selectedRisksForControl = control.risks || [];
    
        // Fill form with control data
        document.getElementById('controlName').value = control.name || '';
        document.getElementById('controlType').value = control.type || '';
        document.getElementById('controlOwner').value = control.owner || '';
        document.getElementById('controlFrequency').value = control.frequency || '';
        document.getElementById('controlMode').value = control.mode || '';
        document.getElementById('controlEffectiveness').value = control.effectiveness || '';
        document.getElementById('controlStatus').value = control.status || '';
        document.getElementById('controlDescription').value = control.description || '';
    
        // Update modal title and selected risks display
        document.getElementById('controlModalTitle').textContent = 'Modifier le Contrôle';
        updateSelectedRisksDisplay();
    
        // Show modal
        document.getElementById('controlModal').classList.add('show');
      };
    
      // Delete control
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
    
        // Remove control from risks
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
    
      // Close control modal
      window.closeControlModal = function() {
        document.getElementById('controlModal').classList.remove('show');
      };
    
      // Open risk selector modal
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
    
      // Close risk selector modal
      window.closeRiskSelector = function() {
        document.getElementById('riskSelectorModal').classList.remove('show');
      };
    
      // Toggle risk selection
      window.toggleRiskSelection = function(riskId) {
        const targetId = String(riskId);
        const index = selectedRisksForControl.findIndex(id => idsEqual(id, targetId));
        if (index > -1) {
          selectedRisksForControl.splice(index, 1);
        } else {
          selectedRisksForControl.push(riskId);
        }
      };
    
      // Confirm risk selection
      window.confirmRiskSelection = function() {
        updateSelectedRisksDisplay();
        closeRiskSelector();
      };
    
      // Update selected risks display
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

      // Remove risk from selection
      window.removeRiskFromSelection = function(riskId) {
        selectedRisksForControl = selectedRisksForControl.filter(id => !idsEqual(id, riskId));
        updateSelectedRisksDisplay();
      };
    
      // Save control (form submission)
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
    
        // Validation
        if (!controlData.name || !controlData.type || !controlData.owner || !controlData.frequency || 
            !controlData.mode || !controlData.effectiveness || !controlData.status) {
          alert('Veuillez remplir tous les champs obligatoires (marqués d\'un *)');
          return;
        }
    
        if (currentEditingControlId) {
          // Update existing control
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
          // Create new control
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

        // Save and refresh
        state.save("contrôle");
        state.renderAll();
        closeControlModal();
      };
    
      // small toast helper if exists
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
