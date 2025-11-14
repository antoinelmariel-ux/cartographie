class FeedbackManager {
    constructor() {
        this.isActive = false;
        this.isPaused = false;
        this.notes = [];
        this.noteElements = new Map();
        this.currentContextKey = null;
        this.sourceInfo = new Map();
        this.sourcePalette = ['palette-0', 'palette-1', 'palette-2', 'palette-3', 'palette-4'];
        this.sourcePaletteIndex = 0;
        this.manualSourceId = 'manual';
        this.registerSource(this.manualSourceId, {
            label: 'Notes locales',
            type: 'manual',
            colorKey: 'base'
        });

        this.toggleButton = document.getElementById('feedbackToggleButton');
        this.panel = document.getElementById('feedbackPanel');
        this.pauseButton = document.getElementById('feedbackPauseButton');
        this.closeButton = document.getElementById('feedbackCloseButton');
        this.exportButton = document.getElementById('feedbackExportButton');
        this.importInput = document.getElementById('feedbackImportInput');
        this.statusMessage = document.getElementById('feedbackStatusMessage');

        this.boundDocumentClick = (event) => this.handleDocumentClick(event);
        this.boundResizeHandler = () => this.repositionNotes();
        this.boundKeyHandler = (event) => {
            if (event.key === 'Escape' && this.isActive) {
                this.setActive(false);
            }
        };
        this.initialise();
    }

    initialise() {
        if (!this.toggleButton || !this.panel) {
            return;
        }

        this.notesContainer = document.createElement('div');
        this.notesContainer.id = 'feedbackNotesContainer';
        this.notesContainer.className = 'feedback-notes-container';
        document.body.appendChild(this.notesContainer);

        this.toggleButton.addEventListener('click', () => this.toggle());

        if (this.pauseButton) {
            this.pauseButton.addEventListener('click', () => this.togglePause());
        }

        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => this.setActive(false));
        }

        if (this.exportButton) {
            this.exportButton.addEventListener('click', () => this.exportNotes());
        }

        if (this.importInput) {
            this.importInput.addEventListener('change', (event) => this.handleImport(event));
        }

        document.addEventListener('click', this.boundDocumentClick, true);
        window.addEventListener('resize', this.boundResizeHandler);
        document.addEventListener('keydown', this.boundKeyHandler);

        this.observeContextChanges();
        this.applyContextVisibility();
        this.updateUI();
    }

    toggle() {
        this.setActive(!this.isActive);
    }

    togglePause() {
        if (!this.isActive) {
            return;
        }

        this.setPaused(!this.isPaused);
    }

    setActive(state) {
        if (this.isActive === state) {
            return;
        }

        this.isActive = state;

        if (!state && this.isPaused) {
            this.isPaused = false;
        }

        this.updateUI();

        if (state) {
            this.setStatus('Mode feed-back activé. Cliquez sur la page pour ajouter une note.', 'info');
        } else {
            this.setStatus('Mode feed-back désactivé.', 'info');
        }
    }

    setPaused(state) {
        if (!this.isActive) {
            if (this.isPaused) {
                this.isPaused = false;
                this.updateUI();
            }
            return;
        }

        const targetState = Boolean(state);

        if (this.isPaused === targetState) {
            return;
        }

        this.isPaused = targetState;
        this.updateUI();

        if (targetState) {
            this.setStatus('Mode feed-back en pause. Vous pouvez naviguer sur le site avant de reprendre les annotations.', 'info');
        } else {
            this.setStatus('Mode feed-back réactivé. Cliquez sur la page pour ajouter une note.', 'info');
        }
    }

    updateUI() {
        if (!this.panel || !this.toggleButton) {
            return;
        }

        this.panel.classList.toggle('visible', this.isActive);
        this.panel.classList.toggle('paused', this.isActive && this.isPaused);
        this.panel.setAttribute('aria-hidden', this.isActive ? 'false' : 'true');
        this.toggleButton.classList.toggle('active', this.isActive);
        this.toggleButton.classList.toggle('paused', this.isActive && this.isPaused);
        this.toggleButton.setAttribute('aria-pressed', this.isActive ? 'true' : 'false');
        this.toggleButton.setAttribute('title', this.isActive ? 'Désactiver le mode feed-back' : 'Activer le mode feed-back');
        document.body.classList.toggle('feedback-mode', this.isActive && !this.isPaused);
        document.body.classList.toggle('feedback-mode-paused', this.isActive && this.isPaused);

        if (this.pauseButton) {
            const label = this.isPaused ? 'Reprendre les annotations' : 'Mettre en pause';
            const ariaLabel = this.isPaused ? 'Reprendre le mode feed-back' : 'Mettre en pause le mode feed-back';
            const title = ariaLabel;
            const icon = this.pauseButton.querySelector('.feedback-action-icon');
            const hiddenLabel = this.pauseButton.querySelector('.feedback-action-label');
            if (icon) {
                icon.textContent = this.isPaused ? '▶' : '⏸';
            }
            if (hiddenLabel) {
                hiddenLabel.textContent = label;
            }
            this.pauseButton.setAttribute('aria-label', ariaLabel);
            this.pauseButton.setAttribute('title', title);
            this.pauseButton.setAttribute('aria-pressed', this.isPaused ? 'true' : 'false');
            this.pauseButton.classList.toggle('active', this.isPaused);
            this.pauseButton.disabled = !this.isActive;
        }
    }

    handleDocumentClick(event) {
        if (!this.isActive || this.isPaused) {
            return;
        }

        const target = event.target;
        if (this.shouldIgnoreTarget(target)) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const docWidth = Math.max(document.documentElement.scrollWidth, window.innerWidth);
        const docHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight);

        const x = event.pageX;
        const y = event.pageY;

        const context = this.getContextFromEvent(event);

        const noteData = {
            id: this.createNoteId(),
            xPercent: docWidth ? this.clamp(x / docWidth, 0, 1) : 0,
            yPercent: docHeight ? this.clamp(y / docHeight, 0, 1) : 0,
            text: '',
            context,
            sourceId: this.manualSourceId
        };

        this.addPreparedNotes([noteData], { defaultSourceId: this.manualSourceId });
        this.setStatus('Nouvelle note ajoutée.', 'success', true);
    }

    createNoteId() {
        return `note-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    }

    shouldIgnoreTarget(target) {
        if (!target) {
            return false;
        }

        if (target.closest('#feedbackPanel')) {
            return true;
        }

        if (this.notesContainer && this.notesContainer.contains(target)) {
            return true;
        }

        if (target.closest('.feedback-note')) {
            return true;
        }

        if (target.closest('#feedbackToggleButton')) {
            return true;
        }

        if (target.closest('[data-feedback-safe-click="true"]')) {
            return true;
        }

        return false;
    }

    renderNote(noteData) {
        const noteElement = document.createElement('div');
        noteElement.className = 'feedback-note';
        noteElement.dataset.noteId = noteData.id;
        const noteContext = this.serialiseContext(noteData.context);
        if (noteContext) {
            noteElement.setAttribute('data-feedback-context', noteContext);
        }
        this.applySourceAttributes(noteElement, noteData);

        const header = document.createElement('div');
        header.className = 'feedback-note-header';

        const number = document.createElement('span');
        number.className = 'feedback-note-number';
        number.textContent = `#${this.notes.length}`;
        header.appendChild(number);

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'feedback-note-delete';
        deleteButton.setAttribute('aria-label', "Supprimer l'annotation");
        deleteButton.innerHTML = '&times;';
        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation();
            this.removeNote(noteData.id);
        });
        header.appendChild(deleteButton);

        const textArea = document.createElement('textarea');
        textArea.className = 'feedback-note-text';
        textArea.placeholder = 'Ajoutez votre remarque ici...';
        textArea.value = noteData.text || '';
        textArea.addEventListener('input', (event) => {
            this.updateNoteText(noteData.id, event.target.value);
        });

        noteElement.appendChild(header);
        noteElement.appendChild(textArea);

        this.notesContainer.appendChild(noteElement);
        this.noteElements.set(noteData.id, noteElement);
        this.positionNoteElement(noteData, noteElement);
        this.updateNotesContainerHeight();
    }

    positionNoteElement(noteData, element) {
        if (!element) {
            return;
        }

        const docWidth = Math.max(document.documentElement.scrollWidth, window.innerWidth);
        const docHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight);

        const noteWidth = element.offsetWidth || 220;
        const noteHeight = element.offsetHeight || 160;

        const margin = 24;
        let left = noteData.xPercent * docWidth;
        let top = noteData.yPercent * docHeight;

        left = this.clamp(left, margin, docWidth - noteWidth - margin);
        top = this.clamp(top, margin, docHeight - noteHeight - margin);

        element.style.left = `${left}px`;
        element.style.top = `${top}px`;
    }

    updateNotesContainerHeight() {
        if (!this.notesContainer) {
            return;
        }

        const docHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight);
        this.notesContainer.style.height = `${docHeight}px`;
    }

    updateNoteText(id, text) {
        const note = this.notes.find((item) => item.id === id);
        if (note) {
            note.text = text;
        }
    }

    removeNote(id) {
        this.notes = this.notes.filter((note) => note.id !== id);
        const element = this.noteElements.get(id);
        if (element) {
            element.remove();
            this.noteElements.delete(id);
        }
        this.updateNoteNumbers();
        this.updateNotesContainerHeight();
        this.setStatus('Note supprimée.', 'warning', true);
    }

    updateNoteNumbers() {
        this.notes.forEach((note, index) => {
            const element = this.noteElements.get(note.id);
            if (element) {
                const number = element.querySelector('.feedback-note-number');
                if (number) {
                    number.textContent = `#${index + 1}`;
                }
            }
        });
    }

    addPreparedNotes(notes, options = {}) {
        if (!Array.isArray(notes) || !notes.length) {
            return;
        }

        const preparedNotes = notes
            .map((note) => this.prepareNote(note, options))
            .filter(Boolean);

        if (!preparedNotes.length) {
            return;
        }

        preparedNotes.forEach((note) => {
            this.notes.push(note);
            this.renderNote(note);
        });

        this.updateNoteNumbers();
        this.repositionNotes();
        this.applyContextVisibility();
    }

    prepareNote(note, options = {}) {
        if (!note || typeof note !== 'object') {
            return null;
        }

        const defaultSourceId = typeof options.defaultSourceId === 'string' && options.defaultSourceId
            ? options.defaultSourceId
            : this.manualSourceId;
        const candidateSourceId = typeof note.sourceId === 'string' && note.sourceId
            ? note.sourceId
            : defaultSourceId;
        const sourceId = this.resolveSourceId(candidateSourceId);
        const baseSourceInfo = this.getSourceInfo(sourceId) || this.getSourceInfo(this.manualSourceId);
        const sourceInfo = baseSourceInfo || {
            id: this.manualSourceId,
            label: '',
            type: 'manual',
            colorKey: 'base'
        };

        const xPercent = typeof note.xPercent === 'number' && Number.isFinite(note.xPercent)
            ? this.clamp(note.xPercent, 0, 1)
            : 0.5;
        const yPercent = typeof note.yPercent === 'number' && Number.isFinite(note.yPercent)
            ? this.clamp(note.yPercent, 0, 1)
            : 0.5;

        const text = typeof note.text === 'string' ? note.text : '';

        return {
            ...note,
            id: typeof note.id === 'string' ? note.id : this.createNoteId(),
            xPercent,
            yPercent,
            text,
            context: this.normaliseNoteContext(note),
            sourceId: sourceInfo.id,
            sourceLabel: sourceInfo.label
        };
    }

    exportNotes() {
        if (!this.notes.length) {
            this.setStatus('Aucune note à exporter pour le moment.', 'warning');
            return;
        }

        const payload = {
            exportedAt: new Date().toISOString(),
            notes: this.notes
        };

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'feedback-notes.json';
        link.setAttribute('data-feedback-safe-click', 'true');
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            URL.revokeObjectURL(url);
            link.remove();
        }, 0);
        this.setStatus('Export des remarques effectué.', 'success');
    }

    async handleImport(event) {
        const input = event.target;
        const files = input.files ? Array.from(input.files) : [];
        input.value = '';

        if (!files.length) {
            return;
        }

        const results = await Promise.allSettled(files.map((file) => this.importNotesFromFile(file)));

        let importedFiles = 0;
        let importedNotes = 0;
        let emptyFiles = 0;
        let errorCount = 0;

        results.forEach((result) => {
            if (result.status === 'fulfilled') {
                const { notesCount } = result.value;
                if (notesCount > 0) {
                    importedFiles += 1;
                    importedNotes += notesCount;
                } else {
                    emptyFiles += 1;
                }
            } else {
                errorCount += 1;
                console.error('Import feedback notes error', result.reason);
            }
        });

        if (importedNotes > 0) {
            const notesLabel = importedNotes > 1 ? 'remarques' : 'remarque';
            const filesLabel = importedFiles > 1 ? 'fichiers' : 'fichier';
            let message = `${importedNotes} ${notesLabel} importée${importedNotes > 1 ? 's' : ''} depuis ${importedFiles} ${filesLabel}.`;
            if (emptyFiles > 0) {
                const emptyLabel = emptyFiles > 1 ? 'fichiers sans remarque' : 'fichier sans remarque';
                message += ` ${emptyFiles} ${emptyLabel}.`;
            }
            if (errorCount > 0) {
                message += ' Certains fichiers n\'ont pas pu être lus.';
                this.setStatus(message, 'warning');
            } else {
                this.setStatus(message, 'success');
            }
            return;
        }

        if (errorCount > 0) {
            this.setStatus("Impossible de lire les fichiers importés.", 'error');
            return;
        }

        this.setStatus("Les fichiers importés ne contiennent aucune remarque valide.", 'warning');
    }

    normaliseImportedNotes(data) {
        const rawNotes = Array.isArray(data) ? data : (data && Array.isArray(data.notes) ? data.notes : []);
        const docWidth = Math.max(document.documentElement.scrollWidth, window.innerWidth);
        const docHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight);

        return rawNotes
            .map((note) => {
                if (typeof note !== 'object' || note === null) {
                    return null;
                }
                const xPercent = this.extractCoordinate(note, 'xPercent', 'x', docWidth);
                const yPercent = this.extractCoordinate(note, 'yPercent', 'y', docHeight);
                const context = this.normaliseNoteContext(note);
                return {
                    id: this.createNoteId(),
                    xPercent,
                    yPercent,
                    text: typeof note.text === 'string' ? note.text : '',
                    context
                };
            })
            .filter(Boolean);
    }

    async importNotesFromFile(file) {
        if (!file) {
            return { fileName: '', notesCount: 0 };
        }

        const rawData = await this.readFileAsJson(file);
        const notes = this.normaliseImportedNotes(rawData);

        if (!notes.length) {
            return { fileName: file.name || '', notesCount: 0 };
        }

        const sourceId = this.createImportSource(file.name);
        const enrichedNotes = notes.map((note) => ({
            ...note,
            sourceId
        }));

        this.addPreparedNotes(enrichedNotes, { defaultSourceId: sourceId });

        return { fileName: file.name || '', notesCount: enrichedNotes.length, sourceId };
    }

    readFileAsJson(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const content = typeof reader.result === 'string' ? reader.result : String(reader.result || '');
                    resolve(JSON.parse(content));
                } catch (error) {
                    const parseError = new Error(`Impossible d'interpréter le contenu du fichier ${file.name || ''}`.trim());
                    parseError.cause = error;
                    parseError.fileName = file.name || '';
                    reject(parseError);
                }
            };
            reader.onerror = () => {
                const readError = new Error(`Impossible de lire le fichier ${file.name || ''}`.trim());
                readError.cause = reader.error;
                readError.fileName = file.name || '';
                reject(readError);
            };
            reader.readAsText(file);
        });
    }

    createImportSource(fileName) {
        const id = `import-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
        const label = typeof fileName === 'string' ? fileName : '';
        return this.registerSource(id, { label, type: 'import' });
    }

    registerSource(id, options = {}) {
        const sourceId = typeof id === 'string' && id ? id : this.manualSourceId;

        if (!this.sourceInfo.has(sourceId)) {
            const type = options.type === 'import' ? 'import' : 'manual';
            let colorKey = options.colorKey;
            if (!colorKey) {
                colorKey = type === 'import' ? this.getNextPaletteColorKey() : 'base';
            }
            const label = typeof options.label === 'string' ? options.label : '';
            this.sourceInfo.set(sourceId, {
                id: sourceId,
                type,
                label,
                colorKey
            });
        } else if (typeof options.label === 'string' && options.label) {
            const existing = this.sourceInfo.get(sourceId);
            if (existing && !existing.label) {
                this.sourceInfo.set(sourceId, { ...existing, label: options.label });
            }
        }

        return sourceId;
    }

    getNextPaletteColorKey() {
        const colorKey = this.sourcePalette[this.sourcePaletteIndex % this.sourcePalette.length];
        this.sourcePaletteIndex += 1;
        return colorKey;
    }

    resolveSourceId(sourceId) {
        if (typeof sourceId === 'string' && this.sourceInfo.has(sourceId)) {
            return sourceId;
        }
        return this.manualSourceId;
    }

    getSourceInfo(sourceId) {
        const resolvedId = this.resolveSourceId(sourceId);
        return this.sourceInfo.get(resolvedId);
    }

    applySourceAttributes(element, noteData) {
        if (!element) {
            return;
        }

        const sourceInfo = this.getSourceInfo(noteData && noteData.sourceId);
        if (!sourceInfo) {
            return;
        }

        element.setAttribute('data-feedback-source', sourceInfo.id);
        element.setAttribute('data-feedback-source-color', sourceInfo.colorKey);

        if (sourceInfo.type === 'import' && sourceInfo.label) {
            element.setAttribute('data-feedback-source-label', sourceInfo.label);
            element.setAttribute('title', `Fichier : ${sourceInfo.label}`);
        } else {
            element.removeAttribute('data-feedback-source-label');
            element.removeAttribute('title');
        }
    }

    extractCoordinate(note, percentKey, absoluteKey, reference) {
        if (typeof note[percentKey] === 'number' && Number.isFinite(note[percentKey])) {
            return this.clamp(note[percentKey], 0, 1);
        }

        if (typeof note[absoluteKey] === 'number' && Number.isFinite(note[absoluteKey]) && reference > 0) {
            return this.clamp(note[absoluteKey] / reference, 0, 1);
        }

        return 0.5;
    }

    replaceNotes(notes, options = {}) {
        this.clearNotes();
        this.addPreparedNotes(notes, options);
    }

    clearNotes() {
        this.noteElements.forEach((element) => element.remove());
        this.noteElements.clear();
        this.notes = [];
    }

    repositionNotes() {
        this.updateNotesContainerHeight();
        this.notes.forEach((note) => {
            const element = this.noteElements.get(note.id);
            this.positionNoteElement(note, element);
        });
    }

    setStatus(message, type = 'info', silent = false) {
        if (!this.statusMessage || silent) {
            if (silent) {
                return;
            }
        }

        if (!this.statusMessage) {
            return;
        }

        this.statusMessage.textContent = message;
        this.statusMessage.classList.remove('feedback-status-success', 'feedback-status-warning', 'feedback-status-error');

        if (type === 'success') {
            this.statusMessage.classList.add('feedback-status-success');
        } else if (type === 'warning') {
            this.statusMessage.classList.add('feedback-status-warning');
        } else if (type === 'error') {
            this.statusMessage.classList.add('feedback-status-error');
        }
    }

    clamp(value, min, max) {
        if (value < min) {
            return min;
        }
        if (value > max) {
            return max;
        }
        return value;
    }

    observeContextChanges() {
        if (this.contextObserver) {
            this.contextObserver.disconnect();
        }

        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            for (const mutation of mutations) {
                const target = mutation.target;
                if (!(target instanceof HTMLElement)) {
                    continue;
                }
                if (target.classList.contains('tab-content') || target.classList.contains('modal')) {
                    shouldUpdate = true;
                    break;
                }
            }
            if (shouldUpdate) {
                this.applyContextVisibility();
            }
        });

        observer.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ['class']
        });

        this.contextObserver = observer;
    }

    getContextFromEvent(event) {
        if (!event || !event.target || !(event.target instanceof HTMLElement)) {
            return this.getCurrentContext();
        }

        const modal = event.target.closest('.modal.show');
        if (modal) {
            return this.buildContext('modal', modal.id || modal.getAttribute('data-modal') || 'modal');
        }

        const tabContent = event.target.closest('.tab-content');
        if (tabContent && tabContent.id) {
            return this.buildContext('tab', tabContent.id);
        }

        return this.getCurrentContext();
    }

    getCurrentContext() {
        const activeModal = this.getTopmostActiveModal();
        if (activeModal) {
            return this.buildContext('modal', activeModal.id || activeModal.getAttribute('data-modal') || 'modal');
        }

        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab && activeTab.id) {
            return this.buildContext('tab', activeTab.id);
        }

        return this.buildContext('page', 'global');
    }

    getTopmostActiveModal() {
        const modals = Array.from(document.querySelectorAll('.modal.show'));
        if (!modals.length) {
            return null;
        }

        let topModal = modals[0];
        let topZIndex = this.parseZIndex(topModal);

        for (let index = 1; index < modals.length; index += 1) {
            const modal = modals[index];
            const zIndex = this.parseZIndex(modal);
            if (zIndex >= topZIndex) {
                topModal = modal;
                topZIndex = zIndex;
            }
        }

        return topModal;
    }

    parseZIndex(element) {
        if (!element) {
            return 0;
        }
        const computed = window.getComputedStyle(element);
        const value = parseInt(computed.zIndex, 10);
        return Number.isFinite(value) ? value : 0;
    }

    buildContext(type, id) {
        return {
            type: typeof type === 'string' ? type : 'page',
            id: typeof id === 'string' && id ? id : 'global'
        };
    }

    serialiseContext(context) {
        if (!context || typeof context !== 'object') {
            return '';
        }
        const { type, id } = context;
        if (typeof type !== 'string' || typeof id !== 'string') {
            return '';
        }
        return `${type}:${id}`;
    }

    contextsMatch(noteContext, activeContext) {
        if (!noteContext) {
            return true;
        }
        if (!activeContext) {
            return false;
        }
        return noteContext.type === activeContext.type && noteContext.id === activeContext.id;
    }

    applyContextVisibility() {
        const activeContext = this.getCurrentContext();
        const activeKey = this.serialiseContext(activeContext);
        this.currentContextKey = activeKey;

        this.noteElements.forEach((element, id) => {
            const note = this.notes.find((item) => item.id === id);
            if (!note) {
                return;
            }

            const matches = this.contextsMatch(note.context, activeContext);
            element.style.display = matches ? '' : 'none';
            element.setAttribute('data-feedback-context-active', matches ? 'true' : 'false');
        });
    }

    normaliseNoteContext(note) {
        if (!note || typeof note !== 'object') {
            return null;
        }

        const rawContext = note.context;
        if (rawContext && typeof rawContext === 'object') {
            const type = typeof rawContext.type === 'string' ? rawContext.type : '';
            const id = typeof rawContext.id === 'string' ? rawContext.id : '';
            if (type && id) {
                return { type, id };
            }
        }

        const contextKey = typeof note.contextKey === 'string' ? note.contextKey : '';
        if (contextKey.includes(':')) {
            const [type, ...rest] = contextKey.split(':');
            const id = rest.join(':');
            if (type && id) {
                return { type, id };
            }
        }

        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.feedbackManager = new FeedbackManager();
});
