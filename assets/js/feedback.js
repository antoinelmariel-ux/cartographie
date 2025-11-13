class FeedbackManager {
    constructor() {
        this.isActive = false;
        this.notes = [];
        this.noteElements = new Map();

        this.toggleButton = document.getElementById('feedbackToggleButton');
        this.panel = document.getElementById('feedbackPanel');
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
    }

    toggle() {
        this.setActive(!this.isActive);
    }

    setActive(state) {
        if (this.isActive === state) {
            return;
        }

        this.isActive = state;
        this.updateUI();

        if (state) {
            this.setStatus('Mode feed-back activé. Cliquez sur la page pour ajouter une note.', 'info');
        } else {
            this.setStatus('Mode feed-back désactivé.', 'info');
        }
    }

    updateUI() {
        if (!this.panel || !this.toggleButton) {
            return;
        }

        this.panel.classList.toggle('visible', this.isActive);
        this.panel.setAttribute('aria-hidden', this.isActive ? 'false' : 'true');
        this.toggleButton.classList.toggle('active', this.isActive);
        this.toggleButton.setAttribute('aria-pressed', this.isActive ? 'true' : 'false');
        document.body.classList.toggle('feedback-mode', this.isActive);
    }

    handleDocumentClick(event) {
        if (!this.isActive) {
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

        const noteData = {
            id: this.createNoteId(),
            xPercent: docWidth ? this.clamp(x / docWidth, 0, 1) : 0,
            yPercent: docHeight ? this.clamp(y / docHeight, 0, 1) : 0,
            text: ''
        };

        this.notes.push(noteData);
        this.renderNote(noteData);
        this.updateNoteNumbers();
        this.setStatus('Nouvelle note ajoutée.', 'success', true);
    }

    createNoteId() {
        return `note-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    }

    shouldIgnoreTarget(target) {
        if (!target) {
            return false;
        }

        if (this.panel.contains(target)) {
            return true;
        }

        if (this.notesContainer.contains(target)) {
            return true;
        }

        if (target.closest('#feedbackToggleButton')) {
            return true;
        }

        return false;
    }

    renderNote(noteData) {
        const noteElement = document.createElement('div');
        noteElement.className = 'feedback-note';
        noteElement.dataset.noteId = noteData.id;

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
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        this.setStatus('Export des remarques effectué.', 'success');
    }

    handleImport(event) {
        const input = event.target;
        const file = input.files && input.files[0];
        input.value = '';

        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const rawData = JSON.parse(reader.result);
                const notes = this.normaliseImportedNotes(rawData);
                if (!notes.length) {
                    this.setStatus("Le fichier importé ne contient aucune remarque valide.", 'warning');
                    return;
                }
                this.replaceNotes(notes);
                this.setStatus('Remarques importées avec succès.', 'success');
            } catch (error) {
                console.error('Import feedback notes error', error);
                this.setStatus("Impossible de lire le fichier importé.", 'error');
            }
        };
        reader.readAsText(file);
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
                return {
                    id: typeof note.id === 'string' ? note.id : this.createNoteId(),
                    xPercent,
                    yPercent,
                    text: typeof note.text === 'string' ? note.text : ''
                };
            })
            .filter(Boolean);
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

    replaceNotes(notes) {
        this.clearNotes();
        this.notes = [...notes];
        this.notes.forEach((note) => this.renderNote(note));
        this.updateNoteNumbers();
        this.repositionNotes();
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
}

document.addEventListener('DOMContentLoaded', () => {
    window.feedbackManager = new FeedbackManager();
});
