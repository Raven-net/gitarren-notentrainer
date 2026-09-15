import { createNote } from '../models/Note.js';
import { Song } from '../models/Song.js';

export class SongEditorMode {
  constructor(options = {}) {
    this.staffRenderer = options.staffRenderer;
    this.fretboardRenderer = options.fretboardRenderer;
    this.synth = options.synth;
    this.containerEl = options.containerEl;
    this.onSongSaved = options.onSongSaved;

    this.currentDuration = 1; // Standard: Viertelnote
    this.songTitle = "Mein neues Gitarrenstück";
    this.songArtist = "Ich";
    this.songBpm = 100;
    this.notes = []; // [{ midi, duration, string, fret, ... }]
    this.selectedIndex = -1;

    this.isPlayingPreview = false;
    this.previewIndex = 0;
    this.previewTimer = null;

    this.setupUI();
  }

  setupUI() {
    if (!this.containerEl) return;

    this.containerEl.innerHTML = `
      <div class="editor-header">
        <div class="editor-title-group">
          <label>Titel:</label>
          <input type="text" id="editor-title" class="editor-input" value="${this.songTitle}">
          <label>Interpret:</label>
          <input type="text" id="editor-artist" class="editor-input" value="${this.songArtist}" style="width: 90px;">
          <label>BPM:</label>
          <input type="number" id="editor-bpm" class="editor-input" value="${this.songBpm}" min="40" max="220" style="width: 65px;">
        </div>

        <div class="duration-selector">
          <span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">Dauer:</span>
          <button class="duration-btn" data-dur="4">Ganze (4)</button>
          <button class="duration-btn" data-dur="2">Halbe (2)</button>
          <button class="duration-btn active" data-dur="1">Viertel (1)</button>
          <button class="duration-btn" data-dur="0.5">Achtel (½)</button>
        </div>
      </div>

      <div class="editor-actions">
        <button id="editor-play-btn" class="btn btn-success">▶ Playback</button>
        <button id="editor-save-btn" class="btn btn-primary" title="Speichert das Lied direkt in der Liederliste deines Browsers">⭐ In Liederliste speichern</button>
        <button id="editor-export-btn" class="btn">💾 Als JSON exportieren</button>
        <button id="editor-undo-btn" class="btn">↶ Letzte Note löschen</button>
        <button id="editor-clear-btn" class="btn btn-danger">Alle löschen</button>
        <label class="btn" style="cursor:pointer;">
          📂 JSON / MIDI laden
          <input type="file" id="editor-file-input" accept=".json,.mid,.midi" style="display:none;">
        </label>
      </div>

      <div class="notes-timeline" id="editor-timeline">
        <span style="color:var(--text-muted); font-size:0.85rem; padding: 0 10px;">
          Klicke auf das Griffbrett oder die Notenlinien, um Noten hinzuzufügen.
        </span>
      </div>
    `;

    // Event-Listener
    const titleInput = this.containerEl.querySelector('#editor-title');
    titleInput.addEventListener('input', (e) => { this.songTitle = e.target.value; });

    const artistInput = this.containerEl.querySelector('#editor-artist');
    artistInput.addEventListener('input', (e) => { this.songArtist = e.target.value; });

    const bpmInput = this.containerEl.querySelector('#editor-bpm');
    bpmInput.addEventListener('change', (e) => { this.songBpm = parseInt(e.target.value) || 100; });

    const durButtons = this.containerEl.querySelectorAll('.duration-btn');
    durButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        durButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentDuration = parseFloat(btn.dataset.dur);
      });
    });

    const playBtn = this.containerEl.querySelector('#editor-play-btn');
    playBtn.addEventListener('click', () => this.togglePlayback());

    const undoBtn = this.containerEl.querySelector('#editor-undo-btn');
    undoBtn.addEventListener('click', () => this.removeLastNote());

    const clearBtn = this.containerEl.querySelector('#editor-clear-btn');
    clearBtn.addEventListener('click', () => {
      if (confirm("Wirklich alle Noten aus dem Editor löschen?")) {
        this.notes = [];
        this.renderTimeline();
      }
    });

    const saveBtn = this.containerEl.querySelector('#editor-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveSongToList());
    }

    const exportBtn = this.containerEl.querySelector('#editor-export-btn');
    exportBtn.addEventListener('click', () => this.exportSongJSON());

    const fileInput = this.containerEl.querySelector('#editor-file-input');
    fileInput.addEventListener('change', (e) => this.handleFileImport(e));
  }

  saveSongToList() {
    if (this.notes.length === 0) {
      alert("Füge zuerst ein paar Noten hinzu!");
      return;
    }

    const songData = {
      id: "custom_" + Date.now(),
      title: this.songTitle || "Mein Stück",
      artist: this.songArtist || "Ich",
      category: "Meine Lieder",
      bpm: this.songBpm || 100,
      timeSignature: [4, 4],
      description: "Erstellt mit dem integrierten Gitarren-Song-Editor",
      notes: this.notes.map(n => ({
        midi: n.midi,
        duration: n.duration,
        ...(n.string !== undefined && n.string !== null ? { string: n.string } : {}),
        ...(n.fret !== undefined && n.fret !== null ? { fret: n.fret } : {})
      }))
    };

    if (this.onSongSaved) {
      this.onSongSaved(new Song(songData));
      alert(`Lied "${songData.title}" wurde dauerhaft in deiner Liederliste gespeichert!`);
    }
  }

  show() {
    if (this.containerEl) this.containerEl.style.display = 'flex';
  }

  hide() {
    if (this.containerEl) this.containerEl.style.display = 'none';
    this.stopPlayback();
  }

  addNote(midi, string = null, fret = null) {
    const note = createNote(midi, this.currentDuration, string, fret);
    this.notes.push(note);
    this.synth.playGuitarNote(midi, 0.4);
    this.fretboardRenderer.highlightMidi(midi, 'correct-flash');
    this.renderTimeline();
  }

  removeLastNote() {
    if (this.notes.length > 0) {
      this.notes.pop();
      this.renderTimeline();
    }
  }

  removeNoteAt(index) {
    if (index >= 0 && index < this.notes.length) {
      this.notes.splice(index, 1);
      this.renderTimeline();
    }
  }

  renderTimeline() {
    const timeline = this.containerEl.querySelector('#editor-timeline');
    if (!timeline) return;

    if (this.notes.length === 0) {
      timeline.innerHTML = `
        <span style="color:var(--text-muted); font-size:0.85rem; padding: 0 10px;">
          Klicke auf das Griffbrett, um Noten einzufügen (Dauer: ${this.currentDuration}).
        </span>
      `;
      return;
    }

    timeline.innerHTML = '';
    this.notes.forEach((note, idx) => {
      const chip = document.createElement('div');
      chip.className = `note-chip ${idx === this.selectedIndex ? 'selected' : ''}`;
      chip.innerHTML = `
        <span>#${idx + 1} <b>${note.name}</b> (${note.duration})</span>
        <span class="note-chip-del" title="Löschen">×</span>
      `;

      chip.addEventListener('click', (e) => {
        if (e.target.classList.contains('note-chip-del')) {
          this.removeNoteAt(idx);
        } else {
          this.selectedIndex = idx;
          this.synth.playGuitarNote(note.midi, 0.4);
          this.renderTimeline();
        }
      });

      timeline.appendChild(chip);
    });

    // Ans Ende scrollen
    timeline.scrollLeft = timeline.scrollWidth;
  }

  togglePlayback() {
    if (this.isPlayingPreview) {
      this.stopPlayback();
    } else {
      this.startPlayback();
    }
  }

  startPlayback() {
    if (this.notes.length === 0) return;
    this.isPlayingPreview = true;
    this.previewIndex = 0;
    const playBtn = this.containerEl.querySelector('#editor-play-btn');
    if (playBtn) playBtn.innerText = "⏹ Stopp";

    this.playNextPreviewNote();
  }

  playNextPreviewNote() {
    if (!this.isPlayingPreview || this.previewIndex >= this.notes.length) {
      this.stopPlayback();
      return;
    }

    const note = this.notes[this.previewIndex];
    this.selectedIndex = this.previewIndex;
    this.renderTimeline();

    const secondsPerBeat = 60 / this.songBpm;
    const durSeconds = note.duration * secondsPerBeat;

    this.synth.playGuitarNote(note.midi, durSeconds * 0.9);
    this.fretboardRenderer.highlightMidi(note.midi, 'correct-flash', durSeconds * 800);

    this.previewIndex++;
    this.previewTimer = setTimeout(() => {
      this.playNextPreviewNote();
    }, durSeconds * 1000);
  }

  stopPlayback() {
    this.isPlayingPreview = false;
    if (this.previewTimer) {
      clearTimeout(this.previewTimer);
      this.previewTimer = null;
    }
    const playBtn = this.containerEl.querySelector('#editor-play-btn');
    if (playBtn) playBtn.innerText = "▶ Playback";
    this.selectedIndex = -1;
    this.renderTimeline();
  }

  exportSongJSON() {
    if (this.notes.length === 0) {
      alert("Füge zuerst ein paar Noten hinzu!");
      return;
    }

    const songData = {
      id: "song_" + Date.now(),
      title: this.songTitle || "Mein Stück",
      artist: this.songArtist || "Unbekannt",
      category: "Eigene Lieder",
      bpm: this.songBpm || 100,
      timeSignature: [4, 4],
      description: "Erstellt mit dem integrierten Gitarren-Song-Editor",
      notes: this.notes.map(n => ({
        midi: n.midi,
        duration: n.duration,
        ...(n.string !== undefined && n.string !== null ? { string: n.string } : {}),
        ...(n.fret !== undefined && n.fret !== null ? { fret: n.fret } : {})
      }))
    };

    const jsonStr = JSON.stringify(songData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const safeTitle = (this.songTitle || "lied").toLowerCase().replace(/[^a-z0-9]/g, '_');
    a.download = `${safeTitle}.json`;
    a.click();
    URL.revokeObjectURL(url);

    if (this.onSongSaved) {
      this.onSongSaved(new Song(songData));
    }
  }

  handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          this.loadSongData(data);
          alert(`Lied "${data.title}" erfolgreich geladen!`);
        } catch (err) {
          alert("Fehler beim Lesen der JSON-Datei: " + err.message);
        }
      };
      reader.readAsText(file);
    } else {
      alert("Für MIDI-Dateien: Bitte Datei über die MIDI-Schaltfläche importieren.");
    }
  }

  loadSongData(data) {
    this.songTitle = data.title || "Geladenes Stück";
    this.songArtist = data.artist || "";
    this.songBpm = data.bpm || 100;

    const titleInput = this.containerEl.querySelector('#editor-title');
    if (titleInput) titleInput.value = this.songTitle;
    const artistInput = this.containerEl.querySelector('#editor-artist');
    if (artistInput) artistInput.value = this.songArtist;
    const bpmInput = this.containerEl.querySelector('#editor-bpm');
    if (bpmInput) bpmInput.value = this.songBpm;

    this.notes = (data.notes || []).map(n => createNote(n.midi, n.duration || 1, n.string, n.fret));
    this.renderTimeline();
  }

  update(dt) {
    // Editor benötigt keine permanente Animation
  }

  render() {
    this.staffRenderer.drawStaff();

    // Noten aus dem Editor auf dem Notensystem anzeigen
    const spacing = this.staffRenderer.noteSpacingUnit;
    let currentX = this.staffRenderer.hitLineX;
    let measureBeats = 0;

    for (let i = 0; i < this.notes.length; i++) {
      const note = this.notes[i];
      if (currentX > this.staffRenderer.width - 20) break;

      const isSelected = i === this.selectedIndex;
      const isSharp = [1, 3, 6, 8, 10].includes(note.midi % 12);
      const accidental = isSharp ? '♯' : null;

      this.staffRenderer.drawNote(
        currentX,
        note.diatonicStep,
        note.duration,
        isSelected ? 'target' : 'normal',
        accidental
      );

      currentX += note.duration * spacing;
      measureBeats += note.duration;

      if (measureBeats >= 4) {
        this.staffRenderer.drawBarLine(currentX - (spacing * 0.35));
        measureBeats = 0;
      }
    }
  }
}
