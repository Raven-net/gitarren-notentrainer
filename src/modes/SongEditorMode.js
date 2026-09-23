import { createNote, STRINGS } from '../models/Note.js';
import { Song } from '../models/Song.js';
import { MidiImporter } from '../midi/MidiImporter.js';

export class SongEditorMode {
  constructor(options = {}) {
    this.staffRenderer = options.staffRenderer;
    this.fretboardRenderer = options.fretboardRenderer;
    this.synth = options.synth;
    this.containerEl = options.containerEl;
    this.onSongSaved = options.onSongSaved;
    this.onManageSongs = options.onManageSongs;
    this.onEnsureAudio = options.onEnsureAudio;

    this.currentDuration = 1; // Standard: Viertelnote
    this.songTitle = "Mein neues Gitarrenstück";
    this.songArtist = "Ich";
    this.songCategory = "Eigene Lieder";
    this.songBpm = 100;
    this.notes = []; // [{ midi, duration, string, fret, ... }]
    this.selectedIndex = -1;

    // Metronom- und Aufnahme-Zustände
    this.isMetronomeActive = false;
    this.isRecording = false;
    this.isCountIn = false;
    this.countInRemaining = 4;
    this.beatAccumulator = 0;
    this.currentBeat = 0;
    this.recordingElapsedBeats = 0;
    this.autoDuration = true;
    this.useCountIn = true;

    // Gitarren-Noten-Tracking für Audio-Input
    this.currentDetectedNote = null; // { midi, noteName, startTime, lastSeenTime, startBeat }
    this.silenceStartTime = 0;
    this.silenceThresholdMs = 150;
    this.minNoteDurationMs = 120;

    this.isPlayingPreview = false;
    this.previewIndex = 0;
    this.previewTimer = null;

    this.scrollOffset = 0;
    this.targetScroll = 0;

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
          <label>Kategorie:</label>
          <input type="text" id="editor-category" class="editor-input" value="${this.songCategory}" style="width: 100px;" title="Kategorie für die Liederliste (z. B. Rock, Marten, Klassik)">
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
        <button id="editor-record-btn" class="btn btn-record" title="Gitarren-Aufnahme im Takt starten oder stoppen (Taste R)">🔴 Gitarren-Aufnahme</button>
        <button id="editor-metronome-btn" class="btn btn-metronome" title="Metronom im BPM-Takt aktivieren/deaktivieren">🔊 Metronom: Aus <span class="metronome-dot" id="metronome-dot"></span></button>
        <button id="editor-play-btn" class="btn btn-success">▶ Playback</button>
        <button id="editor-save-btn" class="btn btn-primary" title="Speichert das Lied direkt in der Liederliste deines Browsers">⭐ In Liederliste speichern</button>
        <button id="editor-manage-btn" class="btn" title="Gespeicherte eigene Lieder öffnen oder löschen">📁 Eigene Lieder</button>
        <button id="editor-export-btn" class="btn">💾 Als JSON exportieren</button>
        <button id="editor-undo-btn" class="btn">↶ Letzte Note löschen</button>
        <button id="editor-clear-btn" class="btn btn-danger">Alle löschen</button>
        <label class="btn" style="cursor:pointer;">
          📂 JSON / MIDI laden
          <input type="file" id="editor-file-input" accept=".json,.mid,.midi,.MID,.MIDI" style="display:none;">
        </label>
      </div>

      <div class="editor-live-monitor">
        <div class="editor-monitor-left">
          <span class="editor-status-text" id="editor-status-text">🎤 Bereit für Gitarreneingabe (BPM: ${this.songBpm})</span>
          <span class="live-note-badge" id="editor-live-note">--</span>
          <span id="editor-live-duration" style="color:var(--text-muted); font-size:0.82rem;"></span>
        </div>
        <div class="editor-monitor-right">
          <label class="editor-toggle-label" title="Notenlänge automatisch aus der gemessenen Haltedauer und dem BPM berechnen">
            <input type="checkbox" id="editor-auto-dur" ${this.autoDuration ? 'checked' : ''}>
            <span>Dauer aus Spieldauer</span>
          </label>
          <label class="editor-toggle-label" title="4 Schläge Einzähler vor Beginn der Aufnahme">
            <input type="checkbox" id="editor-count-in" ${this.useCountIn ? 'checked' : ''}>
            <span>Einzähler (4)</span>
          </label>
        </div>
      </div>

      <div class="notes-timeline" id="editor-timeline">
        <span style="color:var(--text-muted); font-size:0.85rem; padding: 0 10px;">
          Klicke auf das Griffbrett oder spiele deine Gitarre (iRig HD 2), um Noten hinzuzufügen.
        </span>
      </div>
    `;

    // Event-Listener
    const titleInput = this.containerEl.querySelector('#editor-title');
    titleInput.addEventListener('input', (e) => { this.songTitle = e.target.value; });

    const artistInput = this.containerEl.querySelector('#editor-artist');
    artistInput.addEventListener('input', (e) => { this.songArtist = e.target.value; });

    const categoryInput = this.containerEl.querySelector('#editor-category');
    if (categoryInput) {
      categoryInput.addEventListener('input', (e) => { this.songCategory = e.target.value; });
    }

    const bpmInput = this.containerEl.querySelector('#editor-bpm');
    bpmInput.addEventListener('change', (e) => {
      this.songBpm = parseInt(e.target.value) || 100;
      if (!this.isRecording && !this.isMetronomeActive) {
        this.updateStatusText(`🎤 Bereit für Gitarreneingabe (BPM: ${this.songBpm})`);
      }
    });

    const recordBtn = this.containerEl.querySelector('#editor-record-btn');
    if (recordBtn) {
      recordBtn.addEventListener('click', () => this.toggleRecording());
    }

    const metronomeBtn = this.containerEl.querySelector('#editor-metronome-btn');
    if (metronomeBtn) {
      metronomeBtn.addEventListener('click', () => this.toggleMetronome());
    }

    const autoDurCheckbox = this.containerEl.querySelector('#editor-auto-dur');
    if (autoDurCheckbox) {
      autoDurCheckbox.addEventListener('change', (e) => { this.autoDuration = e.target.checked; });
    }

    const countInCheckbox = this.containerEl.querySelector('#editor-count-in');
    if (countInCheckbox) {
      countInCheckbox.addEventListener('change', (e) => { this.useCountIn = e.target.checked; });
    }

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

    const manageBtn = this.containerEl.querySelector('#editor-manage-btn');
    if (manageBtn) {
      manageBtn.addEventListener('click', () => {
        if (this.onManageSongs) this.onManageSongs();
      });
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
      category: this.songCategory || "Eigene Lieder",
      bpm: this.songBpm || 100,
      timeSignature: [4, 4],
      description: "Erstellt mit dem integrierten Gitarren-Song-Editor",
      notes: this.notes.map((n, idx) => ({
        midi: n.midi,
        beat: n.beat !== undefined ? n.beat : idx,
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
    this.scrollToActiveNote();
    this.updateStatusText(`🎤 Bereit für Gitarreneingabe (BPM: ${this.songBpm})`);
    if (!this.boundWheelHandler && this.staffRenderer.canvas) {
      this.boundWheelHandler = (e) => this.handleWheel(e);
      this.staffRenderer.canvas.addEventListener('wheel', this.boundWheelHandler, { passive: false });
    }
  }

  hide() {
    if (this.containerEl) this.containerEl.style.display = 'none';
    this.stopPlayback();
    if (this.isRecording) this.stopRecording();
    if (this.isMetronomeActive) this.toggleMetronome();
    if (this.boundWheelHandler && this.staffRenderer.canvas) {
      this.staffRenderer.canvas.removeEventListener('wheel', this.boundWheelHandler);
      this.boundWheelHandler = null;
    }
  }

  handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
    this.targetScroll = Math.max(0, this.targetScroll + delta * 0.75);
  }

  scrollToActiveNote() {
    if (this.notes.length === 0) {
      this.targetScroll = 0;
      return;
    }

    const spacing = this.staffRenderer.noteSpacingUnit;
    const hitLineX = this.staffRenderer.hitLineX;
    const canvasWidth = this.staffRenderer.width || 940;

    let targetIdx = this.selectedIndex;
    if (targetIdx < 0 || targetIdx >= this.notes.length) {
      targetIdx = this.notes.length - 1;
    }

    const targetNote = this.notes[targetIdx];
    const noteX = hitLineX + (targetNote.beat !== undefined ? targetNote.beat : targetIdx) * spacing;

    const margin = 140;
    const currentViewX = noteX - this.targetScroll;

    if (currentViewX > canvasWidth - margin) {
      this.targetScroll = noteX - (canvasWidth - margin);
    } else if (currentViewX < hitLineX) {
      this.targetScroll = Math.max(0, noteX - hitLineX);
    }
  }

  getNextAvailableBeat() {
    if (this.notes.length === 0) return 0;
    const last = this.notes[this.notes.length - 1];
    return (last.beat !== undefined ? last.beat : 0) + (last.duration || 1);
  }

  addNote(midi, string = null, fret = null, duration = null, beat = null) {
    let nextBeat = beat;
    if (nextBeat === null || nextBeat === undefined) {
      nextBeat = this.getNextAvailableBeat();
    }
    const noteDur = (duration !== null && duration !== undefined) ? duration : this.currentDuration;
    const note = {
      ...createNote(midi, noteDur, string, fret),
      beat: nextBeat
    };
    this.notes.push(note);
    this.notes.sort((a, b) => (a.beat || 0) - (b.beat || 0) || a.midi - b.midi);
    this.selectedIndex = this.notes.findIndex(n => n === note);
    if (this.selectedIndex === -1) this.selectedIndex = this.notes.length - 1;
    this.synth.playGuitarNote(midi, 0.4);
    this.fretboardRenderer.highlightMidi(midi, 'correct-flash');
    this.renderTimeline();
    this.scrollToActiveNote();
  }

  removeLastNote() {
    if (this.notes.length > 0) {
      this.notes.pop();
      this.selectedIndex = this.notes.length - 1;
      this.renderTimeline();
      this.scrollToActiveNote();
    }
  }

  removeNoteAt(index) {
    if (index >= 0 && index < this.notes.length) {
      this.notes.splice(index, 1);
      if (this.selectedIndex >= this.notes.length) {
        this.selectedIndex = this.notes.length - 1;
      }
      this.renderTimeline();
      this.scrollToActiveNote();
    }
  }

  renderTimeline() {
    if (!this.containerEl) return;
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
          this.scrollToActiveNote();
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
    this.scrollToActiveNote();

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
    this.selectedIndex = this.notes.length - 1;
    this.renderTimeline();
    this.scrollToActiveNote();
  }

  exportSongJSON() {
    if (this.notes.length === 0) {
      alert("Füge zuerst ein paar Noten hinzu!");
      return;
    }

    const safeTitle = (this.songTitle || "lied").toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const songData = {
      id: safeTitle || ("song_" + Date.now()),
      title: this.songTitle || "Mein Stück",
      artist: this.songArtist || "Unbekannt",
      category: this.songCategory || "Eigene Lieder",
      bpm: this.songBpm || 100,
      timeSignature: [4, 4],
      description: "Erstellt mit dem integrierten Gitarren-Song-Editor",
      notes: this.notes.map((n, idx) => ({
        midi: n.midi,
        beat: n.beat !== undefined ? n.beat : idx,
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
    a.download = `${safeTitle}.json`;
    a.click();
    URL.revokeObjectURL(url);

    if (this.onSongSaved) {
      this.onSongSaved(new Song(songData));
    }
  }

  async handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();

    if (lowerName.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          this.loadSongData(data);
          alert(`Lied "${data.title}" erfolgreich in den Editor geladen!`);
        } catch (err) {
          alert("Fehler beim Lesen der JSON-Datei: " + err.message);
        }
      };
      reader.readAsText(file);
    } else if (lowerName.endsWith('.mid') || lowerName.endsWith('.midi')) {
      try {
        const songData = await MidiImporter.parseMidiFile(file);
        this.loadSongData(songData);
        alert(`MIDI "${songData.title}" erfolgreich in den Editor importiert (${songData.notes.length} Noten)!`);
      } catch (err) {
        alert("Fehler beim Importieren der MIDI-Datei: " + err.message);
      }
    } else {
      alert("Bitte wähle eine .json oder .mid / .midi Datei aus.");
    }

    e.target.value = '';
  }

  loadSongData(data) {
    this.songTitle = data.title || "Geladenes Stück";
    this.songArtist = data.artist || "";
    this.songCategory = data.category || "Eigene Lieder";
    this.songBpm = data.bpm || 100;

    const titleInput = this.containerEl.querySelector('#editor-title');
    if (titleInput) titleInput.value = this.songTitle;
    const artistInput = this.containerEl.querySelector('#editor-artist');
    if (artistInput) artistInput.value = this.songArtist;
    const categoryInput = this.containerEl.querySelector('#editor-category');
    if (categoryInput) categoryInput.value = this.songCategory;
    const bpmInput = this.containerEl.querySelector('#editor-bpm');
    if (bpmInput) bpmInput.value = this.songBpm;

    let runningBeat = 0;
    this.notes = (data.notes || []).map((n, idx) => {
      const beat = (n.beat !== undefined && n.beat !== null) ? Number(n.beat) : runningBeat;
      const dur = n.duration !== undefined ? Number(n.duration) : 1;
      if (n.beat === undefined || n.beat === null) runningBeat += dur;
      return {
        ...createNote(n.midi, dur, n.string, n.fret),
        beat: beat,
        id: idx
      };
    });
    this.selectedIndex = this.notes.length - 1;
    this.renderTimeline();
    this.scrollToActiveNote();
  }

  findBestStringAndFret(midi) {
    const candidates = [];
    for (let s = 0; s < STRINGS.length; s++) {
      const f = midi - STRINGS[s].baseMidi;
      if (f >= 0 && f <= 15) {
        candidates.push({ string: s, fret: f });
      }
    }
    if (candidates.length === 0) {
      return { string: null, fret: null };
    }
    // Bevorzuge niedrigere Bünde (insbesondere Leersaiten 0 und Bünde 1-4)
    candidates.sort((a, b) => a.fret - b.fret || b.string - a.string);
    return candidates[0];
  }

  calculateDurationFromHoldTime(holdDurationMs) {
    if (!this.autoDuration) {
      return this.currentDuration;
    }
    const holdSeconds = holdDurationMs / 1000;
    const beats = holdSeconds * (this.songBpm / 60);
    // Quantisierung auf 0.5-Schritte (Achtel, Viertel, Halbe, Ganze)
    return Math.max(0.5, Math.min(4.0, Math.round(beats * 2) / 2));
  }

  getDurationLabel(dur) {
    if (dur === 0.5) return '½ Achtel';
    if (dur === 1.0) return '1 Viertel';
    if (dur === 1.5) return '1½ punktiert';
    if (dur === 2.0) return '2 Halbe';
    if (dur === 3.0) return '3 punktiert';
    if (dur === 4.0) return '4 Ganze';
    return `${dur} Beats`;
  }

  updateLiveMonitorNote(noteName, heldMs, estimatedDur) {
    if (!this.containerEl) return;
    const noteBadge = this.containerEl.querySelector('#editor-live-note');
    const durLabel = this.containerEl.querySelector('#editor-live-duration');
    if (noteBadge) {
      noteBadge.innerText = noteName;
      noteBadge.classList.add('sounding');
    }
    if (durLabel) {
      const secStr = (heldMs / 1000).toFixed(1);
      durLabel.innerText = `(${secStr}s ➔ ${this.getDurationLabel(estimatedDur)})`;
    }
  }

  clearLiveMonitorNote() {
    if (!this.containerEl) return;
    const noteBadge = this.containerEl.querySelector('#editor-live-note');
    const durLabel = this.containerEl.querySelector('#editor-live-duration');
    if (noteBadge) {
      noteBadge.innerText = '--';
      noteBadge.classList.remove('sounding');
    }
    if (durLabel) {
      durLabel.innerText = '';
    }
  }

  updateStatusText(text, isRecording = false) {
    if (!this.containerEl) return;
    const statusEl = this.containerEl.querySelector('#editor-status-text');
    if (statusEl) {
      statusEl.innerText = text;
      if (isRecording) {
        statusEl.classList.add('recording');
      } else {
        statusEl.classList.remove('recording');
      }
    }
  }

  triggerMetronomeVisual(isAccent) {
    if (!this.containerEl) return;
    const dot = this.containerEl.querySelector('#metronome-dot');
    if (dot) {
      const cls = isAccent ? 'accent-flash' : 'flash';
      dot.classList.add(cls);
      setTimeout(() => dot.classList.remove(cls), 90);
    }
  }

  onMetronomeTick() {
    if (this.isCountIn) {
      const isAccent = (this.countInRemaining === 4);
      this.synth.playClick(isAccent);
      this.triggerMetronomeVisual(isAccent);
      this.updateStatusText(`⏳ Einzähler: ${this.countInRemaining}...`, true);
      this.countInRemaining--;

      if (this.countInRemaining < 0) {
        this.isCountIn = false;
        this.recordingStartTime = performance.now();
        this.recordingElapsedBeats = 0;
        this.currentBeat = 0;
        this.updateStatusText(`🔴 Aufnahme läuft... (Takt 1 | Schlag 1)`, true);
        this.synth.playClick(true);
        this.triggerMetronomeVisual(true);
      }
      return;
    }

    this.currentBeat++;
    const beatInMeasure = (this.currentBeat % 4);
    const isAccented = (beatInMeasure === 0);
    const measureNumber = Math.floor(this.currentBeat / 4) + 1;
    const displayBeat = beatInMeasure + 1;

    this.synth.playClick(isAccented);
    this.triggerMetronomeVisual(isAccented);

    if (this.isRecording) {
      this.updateStatusText(`🔴 Aufnahme läuft... (Takt ${measureNumber} | Schlag ${displayBeat})`, true);
    } else {
      this.updateStatusText(`🔊 Metronom: Takt ${measureNumber} | Schlag ${displayBeat} (${this.songBpm} BPM)`);
    }
  }

  scrollTimelineWithRecording(beat) {
    const spacing = this.staffRenderer.noteSpacingUnit;
    const hitLineX = this.staffRenderer.hitLineX;
    const canvasWidth = this.staffRenderer.width || 940;
    const currentX = hitLineX + (beat * spacing);
    const margin = 200;
    if (currentX - this.targetScroll > canvasWidth - margin) {
      this.targetScroll = currentX - (canvasWidth - margin);
    }
  }

  toggleMetronome() {
    this.isMetronomeActive = !this.isMetronomeActive;
    const btn = this.containerEl.querySelector('#editor-metronome-btn');
    if (btn) {
      if (this.isMetronomeActive) {
        btn.classList.add('active');
        btn.innerHTML = `🔊 Metronom: An <span class="metronome-dot" id="metronome-dot"></span>`;
        this.beatAccumulator = 0;
        this.currentBeat = 0;
        this.synth.playClick(true);
        this.triggerMetronomeVisual(true);
        this.updateStatusText(`🔊 Metronom aktiv (${this.songBpm} BPM)`);
      } else {
        btn.classList.remove('active');
        btn.innerHTML = `🔊 Metronom: Aus <span class="metronome-dot" id="metronome-dot"></span>`;
        if (!this.isRecording) {
          this.updateStatusText(`🎤 Bereit für Gitarreneingabe (BPM: ${this.songBpm})`);
        }
      }
    }
  }

  async toggleRecording() {
    if (this.isRecording || this.isCountIn) {
      this.stopRecording();
    } else {
      await this.startRecording();
    }
  }

  async startRecording() {
    if (this.isPlayingPreview) {
      this.stopPlayback();
    }

    if (this.onEnsureAudio) {
      try {
        await this.onEnsureAudio();
      } catch (e) {
        console.warn("Audio-Eingang konnte nicht automatisch aktiviert werden:", e);
      }
    }

    this.isRecording = true;
    this.beatAccumulator = 0;
    this.currentBeat = 0;
    this.recordingElapsedBeats = 0;

    const recordBtn = this.containerEl.querySelector('#editor-record-btn');
    if (recordBtn) {
      recordBtn.classList.add('recording');
      recordBtn.innerHTML = `⏹ Aufnahme beenden`;
    }

    if (this.useCountIn) {
      this.isCountIn = true;
      this.countInRemaining = 4;
      this.updateStatusText(`⏳ Einzähler: 4...`, true);
      this.synth.playClick(true);
      this.triggerMetronomeVisual(true);
      this.countInRemaining--;
    } else {
      this.isCountIn = false;
      this.recordingStartTime = performance.now();
      this.recordingElapsedBeats = 0;
      this.updateStatusText(`🔴 Aufnahme läuft... (Takt 1 | Schlag 1)`, true);
      this.synth.playClick(true);
      this.triggerMetronomeVisual(true);
    }
  }

  stopRecording() {
    this.isRecording = false;
    this.isCountIn = false;
    if (this.currentDetectedNote) {
      this.finalizeDetectedNote(performance.now());
    }

    const recordBtn = this.containerEl.querySelector('#editor-record-btn');
    if (recordBtn) {
      recordBtn.classList.remove('recording');
      recordBtn.innerHTML = `🔴 Gitarren-Aufnahme`;
    }

    this.updateStatusText(this.isMetronomeActive 
      ? `🔊 Metronom aktiv (${this.songBpm} BPM)` 
      : `🎤 Bereit für Gitarreneingabe (BPM: ${this.songBpm})`
    );
  }

  startDetectedNote(midi, noteName, now) {
    let startBeat = null;
    if (this.isRecording && !this.isCountIn) {
      startBeat = this.recordingElapsedBeats;
    }
    this.currentDetectedNote = {
      midi: midi,
      noteName: noteName,
      startTime: now,
      lastSeenTime: now,
      startBeat: startBeat
    };
    this.silenceStartTime = 0;
    const initialDur = this.autoDuration ? 0.5 : this.currentDuration;
    this.updateLiveMonitorNote(noteName, 0, initialDur);
  }

  finalizeDetectedNote(now) {
    if (!this.currentDetectedNote) return;
    const noteInfo = this.currentDetectedNote;
    this.currentDetectedNote = null;
    this.silenceStartTime = 0;
    this.clearLiveMonitorNote();

    const heldMs = noteInfo.lastSeenTime - noteInfo.startTime;
    if (heldMs < this.minNoteDurationMs) return;

    const duration = this.calculateDurationFromHoldTime(heldMs);
    const bestPos = this.findBestStringAndFret(noteInfo.midi);

    let noteBeat;
    if (this.isRecording && noteInfo.startBeat !== null) {
      // Bei getakteter Aufnahme auf nächsten halben Beat quantisieren
      noteBeat = Math.max(0, Math.round(noteInfo.startBeat * 2) / 2);
    } else {
      // Bei schrittweisem Einspielen an bisherige Noten anhängen
      noteBeat = this.getNextAvailableBeat();
    }

    const newNote = {
      ...createNote(noteInfo.midi, duration, bestPos.string, bestPos.fret),
      beat: noteBeat
    };

    this.notes.push(newNote);
    this.notes.sort((a, b) => (a.beat || 0) - (b.beat || 0) || a.midi - b.midi);
    this.selectedIndex = this.notes.findIndex(n => n === newNote);
    if (this.selectedIndex === -1) this.selectedIndex = this.notes.length - 1;

    // Fretboard-Highlight und Gitarrenklang
    this.synth.playGuitarNote(noteInfo.midi, 0.4);
    this.fretboardRenderer.highlightMidi(noteInfo.midi, 'correct-flash', 350);
    this.renderTimeline();
    this.scrollToActiveNote();
  }

  processAudioFrame(res, now) {
    if (!res) return;

    if (res.detected && res.midi !== null) {
      if (this.currentDetectedNote) {
        if (this.currentDetectedNote.midi === res.midi) {
          // Selber Ton wird weiter gehalten
          this.currentDetectedNote.lastSeenTime = now;
          this.silenceStartTime = 0;
          const heldMs = now - this.currentDetectedNote.startTime;
          const estDur = this.calculateDurationFromHoldTime(heldMs);
          this.updateLiveMonitorNote(this.currentDetectedNote.noteName, heldMs, estDur);
        } else {
          // Anderer Ton angeschlagen -> vorherigen Ton abschließen, neuen beginnen
          this.finalizeDetectedNote(now);
          this.startDetectedNote(res.midi, res.noteName, now);
        }
      } else {
        // Neuer Ton beginnt
        this.startDetectedNote(res.midi, res.noteName, now);
      }
    } else {
      // Kein Ton aktuell erkannt (Saite abgedämpft oder Ton abgeklungen)
      if (this.currentDetectedNote) {
        if (!this.silenceStartTime) {
          this.silenceStartTime = now;
        }
        if (now - this.silenceStartTime >= this.silenceThresholdMs) {
          this.finalizeDetectedNote(now);
        }
      }
    }
  }

  update(dt) {
    // Sanftes Nachführen des Notenbands im Editor
    this.scrollOffset += (this.targetScroll - this.scrollOffset) * Math.min(dt * 12, 1);

    // Metronom- & Aufnahme-Timing
    if (this.isMetronomeActive || this.isRecording) {
      const secondsPerBeat = 60 / this.songBpm;
      this.beatAccumulator += dt;

      while (this.beatAccumulator >= secondsPerBeat) {
        this.beatAccumulator -= secondsPerBeat;
        this.onMetronomeTick();
      }

      if (this.isRecording && !this.isCountIn) {
        this.recordingElapsedBeats += (dt / secondsPerBeat);
        this.scrollTimelineWithRecording(this.recordingElapsedBeats);
      }
    }
  }

  render() {
    this.staffRenderer.drawStaff();

    const spacing = this.staffRenderer.noteSpacingUnit;
    const hitLineX = this.staffRenderer.hitLineX;
    const width = this.staffRenderer.width || 940;

    const totalBeats = this.notes.reduce((max, n) => Math.max(max, (n.beat || 0) + (n.duration || 1)), 0);

    // 1. Taktstriche an festen Taktgrenzen zeichnen
    for (let b = 0; b <= totalBeats + 4; b += 4) {
      const barLineX = hitLineX + (b * spacing) - this.scrollOffset;
      if (barLineX >= 80 && barLineX <= width + 20) {
        this.staffRenderer.drawBarLine(barLineX);
      }
    }

    // 2. Notenköpfe zeichnen
    for (let i = 0; i < this.notes.length; i++) {
      const note = this.notes[i];
      const noteBeat = note.beat !== undefined ? note.beat : i;
      const noteX = hitLineX + (noteBeat * spacing) - this.scrollOffset;

      // Nur zeichnen, wenn im sichtbaren Canvas-Bereich
      if (noteX >= 40 && noteX <= width + 40) {
        const isSelected = (i === this.selectedIndex);
        const isSharp = [1, 3, 6, 8, 10].includes(note.midi % 12);
        const accidental = isSharp ? '♯' : null;

        this.staffRenderer.drawNote(
          noteX,
          note.diatonicStep,
          note.duration,
          isSelected ? 'target' : 'normal',
          accidental
        );
      }
    }

    // 3. Rote Aufnahmelinie (Playhead) zeichnen, wenn Aufnahme aktiv
    if (this.isRecording && !this.isCountIn) {
      const recX = hitLineX + (this.recordingElapsedBeats * spacing) - this.scrollOffset;
      if (recX >= 40 && recX <= width + 40) {
        const ctx = this.staffRenderer.ctx;
        if (ctx) {
          ctx.save();
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.moveTo(recX, 10);
          ctx.lineTo(recX, 190);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }
}
