import { BUILTIN_SONGS, getBuiltinSong } from '../songs/songRegistry.js';
import { Song } from './models/Song.js';
import { AudioEngine } from './audio/AudioEngine.js';
import { PitchDetector } from './audio/PitchDetector.js';
import { SynthFeedback } from './audio/SynthFeedback.js';
import { StaffRenderer } from './renderers/StaffRenderer.js';
import { FretboardRenderer } from './renderers/FretboardRenderer.js';
import { PracticeMode } from './modes/PracticeMode.js';
import { RhythmGameMode } from './modes/RhythmGameMode.js';
import { EndlessMode } from './modes/EndlessMode.js';
import { SongEditorMode } from './modes/SongEditorMode.js';
import { MidiImporter } from './midi/MidiImporter.js';

class GuitarApp {
  constructor() {
    this.songs = [...BUILTIN_SONGS.map(s => new Song(s))];
    this.loadCustomSongsFromStorage();
    const gia = this.songs.find(s => s.id === 'guitar_in_action');
    this.currentSong = gia || this.songs[0];
    this.currentModeName = 'practice'; // 'practice' | 'rhythm' | 'endless' | 'editor'

    // DOM-Elemente
    this.canvasEl = document.getElementById('notation-canvas');
    this.fretboardEl = document.getElementById('fretboard');
    this.fretboardCardEl = document.getElementById('fretboard-card');
    this.fretboardToggleBtn = document.getElementById('fretboard-toggle-btn');
    this.editorContainerEl = document.getElementById('editor-panel');

    this.isFretboardVisible = localStorage.getItem('fretboard_visible') !== '0';

    this.modeSelect = document.getElementById('mode-select');
    this.songSelect = document.getElementById('song-select');
    this.songSelectGroup = document.getElementById('song-select-group');
    this.mainFileInput = document.getElementById('main-file-input');
    this.speedGroup = document.getElementById('speed-group');
    this.speedSlider = document.getElementById('speed-slider');
    this.speedValDisplay = document.getElementById('speed-val');
    this.bpmControlGroup = document.getElementById('bpm-group');
    this.bpmSlider = document.getElementById('bpm-slider');
    this.bpmValDisplay = document.getElementById('bpm-val');
    this.metronomeToggle = document.getElementById('metronome-toggle');
    this.rhythmStartBtn = document.getElementById('rhythm-start-btn');

    this.scoreDisplay = document.getElementById('score');
    this.pitchDisplay = document.getElementById('pitch-display');
    this.levelMeterFill = document.getElementById('level-meter-fill');
    this.irigBtn = document.getElementById('irig-btn');
    this.micBtn = document.getElementById('mic-btn');

    // Modal
    this.modalBackdrop = document.getElementById('eval-modal');
    this.modalScorePercent = document.getElementById('modal-score-percent');
    this.modalStatHits = document.getElementById('modal-stat-hits');
    this.modalStatMisses = document.getElementById('modal-stat-misses');
    this.modalStatStreak = document.getElementById('modal-stat-streak');
    this.modalRestartBtn = document.getElementById('modal-restart-btn');
    this.modalCloseBtn = document.getElementById('modal-close-btn');

    // Audio & Engine
    this.audioEngine = new AudioEngine();
    this.pitchDetector = new PitchDetector();
    this.synth = new SynthFeedback(this.audioEngine);

    // Renderer
    this.staffRenderer = new StaffRenderer(this.canvasEl, { hitLineX: 150 });
    this.fretboardRenderer = new FretboardRenderer(this.fretboardEl, (midi, s, f, btn) => {
      this.handleFretboardClick(midi, s, f, btn);
    });

    // Modi initialisieren
    this.practiceMode = new PracticeMode({
      staffRenderer: this.staffRenderer,
      fretboardRenderer: this.fretboardRenderer,
      synth: this.synth,
      onProgressUpdate: (p) => { this.scoreDisplay.innerText = p.scoreText; },
      onComplete: (res) => this.showEvaluationModal(res)
    });

    this.rhythmMode = new RhythmGameMode({
      staffRenderer: this.staffRenderer,
      fretboardRenderer: this.fretboardRenderer,
      synth: this.synth,
      onProgressUpdate: (p) => { this.scoreDisplay.innerText = p.scoreText; },
      onComplete: (res) => {
        this.updateRhythmButtonState(false);
        this.showEvaluationModal(res);
      }
    });

    this.endlessMode = new EndlessMode({
      staffRenderer: this.staffRenderer,
      fretboardRenderer: this.fretboardRenderer,
      synth: this.synth,
      onProgressUpdate: (p) => { this.scoreDisplay.innerText = p.scoreText; }
    });

    this.editorMode = new SongEditorMode({
      staffRenderer: this.staffRenderer,
      fretboardRenderer: this.fretboardRenderer,
      synth: this.synth,
      containerEl: this.editorContainerEl,
      onSongSaved: (song) => this.registerNewSong(song)
    });

    this.lastFrameTime = performance.now();
    this.initUI();
    this.setMode('practice');
    this.startLoop();
  }

  initUI() {
    this.populateSongSelect();

    this.modeSelect.addEventListener('change', (e) => {
      this.setMode(e.target.value);
    });

    this.songSelect.addEventListener('change', (e) => {
      const selected = this.songs.find(s => s.id === e.target.value);
      if (selected) {
        this.currentSong = selected;
        this.bpmSlider.value = selected.bpm;
        this.bpmValDisplay.innerText = `${selected.bpm} BPM`;
        this.loadCurrentSongIntoMode();
      }
    });

    if (this.mainFileInput) {
      this.mainFileInput.addEventListener('change', async (e) => {
        if (e.target.files && e.target.files.length > 0) {
          await this.loadFile(e.target.files[0]);
          e.target.value = '';
        }
      });
    }

    this.speedSlider.addEventListener('input', (e) => {
      const spd = parseFloat(e.target.value);
      this.speedValDisplay.innerText = spd.toFixed(1) + 'x';
      this.endlessMode.setSpeed(spd);
    });

    this.bpmSlider.addEventListener('input', (e) => {
      const bpm = parseInt(e.target.value);
      this.bpmValDisplay.innerText = `${bpm} BPM`;
      this.rhythmMode.setBpm(bpm);
    });

    this.metronomeToggle.addEventListener('change', (e) => {
      this.rhythmMode.setMetronome(e.target.checked);
    });

    if (this.rhythmStartBtn) {
      this.rhythmStartBtn.addEventListener('click', () => {
        this.toggleRhythmPlayback();
      });
    }

    // Leertaste zum Starten/Stoppen im Rhythmus-Modus
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && this.currentModeName === 'rhythm') {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') {
          e.preventDefault();
          this.toggleRhythmPlayback();
        }
      }
    });

    this.irigBtn.addEventListener('click', () => this.connectAudio('irig'));
    this.micBtn.addEventListener('click', () => this.connectAudio('mic'));

    this.modalRestartBtn.addEventListener('click', () => {
      this.hideEvaluationModal();
      this.loadCurrentSongIntoMode();
      if (this.currentModeName === 'rhythm') {
        this.toggleRhythmPlayback();
      }
    });

    this.modalCloseBtn.addEventListener('click', () => {
      this.hideEvaluationModal();
    });

    if (this.fretboardToggleBtn) {
      this.fretboardToggleBtn.addEventListener('click', () => {
        this.isFretboardVisible = !this.isFretboardVisible;
        localStorage.setItem('fretboard_visible', this.isFretboardVisible ? '1' : '0');
        this.applyFretboardVisibility();
      });
    }

    this.applyFretboardVisibility();

    // Window Resize -> HiDPI Canvas anpassen
    window.addEventListener('resize', () => {
      this.staffRenderer.initHiDPI();
    });

    // Drag & Drop für .json und .mid Dateien
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => this.handleFileDrop(e));
  }

  populateSongSelect() {
    this.songSelect.innerHTML = '';
    const groups = {};

    this.songs.forEach(s => {
      const cat = s.category || 'Allgemein';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    });

    for (let [cat, songList] of Object.entries(groups)) {
      const optGroup = document.createElement('optgroup');
      optGroup.label = cat;
      songList.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.innerText = `${s.title} (${s.artist || 'Unbekannt'})`;
        optGroup.appendChild(opt);
      });
      this.songSelect.appendChild(optGroup);
    }
  }

  loadCustomSongsFromStorage() {
    try {
      const saved = localStorage.getItem('custom_guitar_songs');
      if (saved) {
        let list = JSON.parse(saved);
        // Falls in localStorage noch eine alte, fehlerhafte Version von Guitar in Action liegt,
        // filtern wir diese heraus, damit das saubere, eingespielte Builtin-Lied verwendet wird
        list = list.filter(songData => {
          const t = (songData.title || '').toLowerCase();
          return !t.includes('guitar in action') && !t.includes('guitar-in-action');
        });
        localStorage.setItem('custom_guitar_songs', JSON.stringify(list));

        list.forEach(songData => {
          if (!this.songs.some(s => s.id === songData.id)) {
            this.songs.push(new Song(songData));
          }
        });
      }
    } catch (e) {
      console.error("Fehler beim Laden gespeicherter Songs:", e);
    }
  }

  saveCustomSongToStorage(song) {
    try {
      const saved = localStorage.getItem('custom_guitar_songs');
      let list = saved ? JSON.parse(saved) : [];
      list = list.filter(s => s.id !== song.id);
      list.unshift(song.toJSON());
      localStorage.setItem('custom_guitar_songs', JSON.stringify(list));
    } catch (e) {
      console.error("Fehler beim Speichern des Songs:", e);
    }
  }

  registerNewSong(song) {
    this.saveCustomSongToStorage(song);
    const existingIdx = this.songs.findIndex(s => s.id === song.id);
    if (existingIdx >= 0) {
      this.songs[existingIdx] = song;
    } else {
      this.songs.unshift(song);
    }
    this.populateSongSelect();
    this.songSelect.value = song.id;
    this.currentSong = song;
    this.setMode('practice');
  }

  applyFretboardVisibility() {
    if (!this.fretboardCardEl || !this.fretboardToggleBtn) return;
    if (this.currentModeName === 'editor') {
      // Im Editor Griffbrett immer eingeblendet lassen für Notenauswahl
      this.fretboardCardEl.style.display = 'block';
      this.fretboardToggleBtn.style.display = 'none';
      return;
    }

    this.fretboardToggleBtn.style.display = 'inline-flex';
    if (this.isFretboardVisible) {
      this.fretboardCardEl.style.display = 'block';
      this.fretboardToggleBtn.innerText = '🎸 Griffbrett: An';
      this.fretboardToggleBtn.classList.remove('btn-danger');
    } else {
      this.fretboardCardEl.style.display = 'none';
      this.fretboardToggleBtn.innerText = '🎸 Griffbrett: Aus';
      this.fretboardToggleBtn.classList.add('btn-danger');
    }
  }

  setMode(mode) {
    this.currentModeName = mode;
    this.rhythmMode.stop();
    this.updateRhythmButtonState(false);
    this.editorMode.hide();
    this.applyFretboardVisibility();

    // Sichtbarkeit der Steuerelemente steuern
    this.songSelectGroup.style.display = (mode === 'practice' || mode === 'rhythm') ? 'flex' : 'none';
    this.bpmControlGroup.style.display = (mode === 'rhythm') ? 'flex' : 'none';
    this.speedGroup.style.display = (mode === 'endless') ? 'flex' : 'none';

    if (mode === 'editor') {
      this.editorMode.show();
      this.scoreDisplay.innerText = "Editor aktiv";
    } else if (mode === 'endless') {
      this.endlessMode.reset();
    } else {
      this.loadCurrentSongIntoMode();
    }
  }

  toggleRhythmPlayback() {
    const isPlaying = this.rhythmMode.togglePlay();
    this.updateRhythmButtonState(isPlaying);
  }

  updateRhythmButtonState(isPlaying) {
    if (!this.rhythmStartBtn) return;
    if (isPlaying) {
      this.rhythmStartBtn.innerText = "⏹ Stopp";
      this.rhythmStartBtn.className = "btn btn-danger";
    } else {
      this.rhythmStartBtn.innerText = "▶ Start";
      this.rhythmStartBtn.className = "btn btn-success";
    }
  }

  loadCurrentSongIntoMode() {
    if (!this.currentSong) return;
    if (this.currentModeName === 'practice') {
      this.practiceMode.loadSong(this.currentSong);
    } else if (this.currentModeName === 'rhythm') {
      this.updateRhythmButtonState(false);
      const bpm = parseInt(this.bpmSlider.value) || this.currentSong.bpm || 100;
      this.rhythmMode.loadSong(this.currentSong, bpm);
    }
  }

  handleFretboardClick(midi, s, f, btn) {
    // Wenn wir im Editor sind, Note hinzufügen
    if (this.currentModeName === 'editor') {
      this.editorMode.addNote(midi, s, f);
      return;
    }

    // In den Spielmodi als Note-Attempt auswerten
    if (this.currentModeName === 'practice') {
      this.practiceMode.evaluateNote(midi, btn);
    } else if (this.currentModeName === 'rhythm') {
      this.rhythmMode.evaluateNote(midi, btn);
    } else if (this.currentModeName === 'endless') {
      this.endlessMode.evaluateNote(midi, btn);
    }
  }

  async connectAudio(deviceType) {
    try {
      await this.audioEngine.start(deviceType);

      if (deviceType === 'mic') {
        this.pitchDetector.setRmsThreshold(0.022);
        this.micBtn.innerText = "Laptop-Mikrofon aktiv ✓";
        this.micBtn.classList.add('active');
        this.irigBtn.innerText = "Zu iRig wechseln";
        this.irigBtn.classList.remove('active');
      } else {
        this.pitchDetector.setRmsThreshold(0.015);
        this.irigBtn.innerText = "iRig aktiv ✓";
        this.irigBtn.classList.add('active');
        this.micBtn.innerText = "Zu Laptop-Mikrofon wechseln";
        this.micBtn.classList.remove('active');
      }
    } catch (err) {
      alert("Fehler beim Aktivieren des Audio-Eingangs: " + err.message);
    }
  }

  showEvaluationModal(result) {
    this.modalScorePercent.innerText = `${result.accuracy}%`;
    this.modalStatHits.innerText = result.hits || 0;
    this.modalStatMisses.innerText = result.misses || 0;
    this.modalStatStreak.innerText = result.maxStreak || result.hits || 0;
    this.modalBackdrop.classList.add('open');
  }

  hideEvaluationModal() {
    this.modalBackdrop.classList.remove('open');
  }

  async handleFileDrop(e) {
    e.preventDefault();
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    const file = e.dataTransfer.files[0];
    await this.loadFile(file);
  }

  async loadFile(file) {
    if (!file) return;
    const lowerName = file.name.toLowerCase();

    if (lowerName.endsWith('.json')) {
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (this.currentModeName === 'editor') {
          this.editorMode.loadSongData(data);
          alert(`Lied "${data.title || file.name}" in den Editor geladen!`);
        } else {
          const newSong = new Song(data);
          this.registerNewSong(newSong);
          alert(`Lied "${newSong.title}" erfolgreich importiert!`);
        }
      } catch (err) {
        alert("Fehler beim Laden der JSON-Datei: " + err.message);
      }
    } else if (lowerName.endsWith('.mid') || lowerName.endsWith('.midi')) {
      try {
        const songData = await MidiImporter.parseMidiFile(file);
        if (this.currentModeName === 'editor') {
          this.editorMode.loadSongData(songData);
          alert(`MIDI "${songData.title}" erfolgreich in den Editor geladen (${songData.notes.length} Noten)!`);
        } else {
          const newSong = new Song(songData);
          this.registerNewSong(newSong);
          alert(`MIDI "${newSong.title}" erfolgreich importiert und für Gitarre vorbereitet! (${newSong.notes.length} Noten)`);
        }
      } catch (err) {
        alert("Fehler beim Importieren der MIDI-Datei: " + err.message);
      }
    } else {
      alert("Nicht unterstütztes Dateiformat. Bitte wähle eine .json oder .mid / .midi Datei.");
    }
  }

  startLoop() {
    const loop = (now) => {
      const dt = Math.min((now - this.lastFrameTime) / 1000, 0.1);
      this.lastFrameTime = now;

      // Audio-Pitch verarbeiten
      if (this.audioEngine.isListening) {
        const buffer = this.audioEngine.getAudioData();
        if (buffer) {
          const sampleRate = this.audioEngine.audioCtx.sampleRate;
          const res = this.pitchDetector.process(buffer, sampleRate, now, (detectedMidi, noteName) => {
            // Note wurde sicher erkannt -> An aktuellen Modus übergeben
            if (this.currentModeName === 'practice') {
              this.practiceMode.evaluateNote(detectedMidi);
            } else if (this.currentModeName === 'rhythm') {
              this.rhythmMode.evaluateNote(detectedMidi);
            } else if (this.currentModeName === 'endless') {
              this.endlessMode.evaluateNote(detectedMidi);
            }
          });

          // Pitch-Display & Level-Meter aktualisieren
          this.pitchDisplay.innerText = res.noteName;
          const levelPct = Math.min(Math.round(res.rms * 600), 100);
          this.levelMeterFill.style.width = `${levelPct}%`;
        }
      }

      // Aktiven Modus updaten und rendern
      if (this.currentModeName === 'practice') {
        this.practiceMode.update(dt);
        this.practiceMode.render();
      } else if (this.currentModeName === 'rhythm') {
        this.rhythmMode.update(dt);
        this.rhythmMode.render();
      } else if (this.currentModeName === 'endless') {
        this.endlessMode.update(dt);
        this.endlessMode.render();
      } else if (this.currentModeName === 'editor') {
        this.editorMode.update(dt);
        this.editorMode.render();
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

// App starten sobald DOM geladen ist
window.addEventListener('DOMContentLoaded', () => {
  new GuitarApp();
});
