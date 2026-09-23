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
import { ListenMode } from './modes/ListenMode.js';
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
    this.endlessKeyGroup = document.getElementById('endless-key-group');
    this.endlessKeySelect = document.getElementById('endless-key-select');
    this.endlessPatternSelect = document.getElementById('endless-pattern-select');
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

    // Liederverwaltung & Lösch-Buttons
    this.deleteSongBtn = document.getElementById('delete-song-btn');
    this.manageSongsBtn = document.getElementById('manage-songs-btn');

    // Auswertungs-Modal
    this.modalBackdrop = document.getElementById('eval-modal');
    this.modalScorePercent = document.getElementById('modal-score-percent');
    this.modalStatHits = document.getElementById('modal-stat-hits');
    this.modalStatMisses = document.getElementById('modal-stat-misses');
    this.modalStatStreak = document.getElementById('modal-stat-streak');
    this.modalRestartBtn = document.getElementById('modal-restart-btn');
    this.modalCloseBtn = document.getElementById('modal-close-btn');

    // Liederverwaltungs-Modal
    this.manageModalBackdrop = document.getElementById('custom-songs-modal');
    this.manageModalList = document.getElementById('custom-songs-list');
    this.manageModalDeleteAllBtn = document.getElementById('modal-delete-all-btn');
    this.manageModalCloseBtn = document.getElementById('modal-manage-close-btn');

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
      onSongSaved: (song) => this.registerNewSong(song),
      onManageSongs: () => this.openManageSongsModal(),
      onEnsureAudio: () => this.connectAudio('irig')
    });

    this.listenMode = new ListenMode({
      staffRenderer: this.staffRenderer,
      fretboardRenderer: this.fretboardRenderer,
      synth: this.synth,
      audioEngine: this.audioEngine,
      onProgressUpdate: (p) => { this.scoreDisplay.innerText = p.scoreText; },
      onNotePlay: (noteName) => { this.pitchDisplay.innerText = noteName; },
      onComplete: () => {
        this.updateRhythmButtonState(false);
      }
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
        this.updateCustomSongButtons();
      }
    });

    if (this.deleteSongBtn) {
      this.deleteSongBtn.addEventListener('click', () => {
        if (this.currentSong) {
          this.deleteCustomSong(this.currentSong.id);
        }
      });
    }

    if (this.manageSongsBtn) {
      this.manageSongsBtn.addEventListener('click', () => {
        this.openManageSongsModal();
      });
    }

    if (this.manageModalCloseBtn) {
      this.manageModalCloseBtn.addEventListener('click', () => {
        this.closeManageSongsModal();
      });
    }

    if (this.manageModalDeleteAllBtn) {
      this.manageModalDeleteAllBtn.addEventListener('click', () => {
        this.deleteAllCustomSongs();
      });
    }

    if (this.manageModalBackdrop) {
      this.manageModalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.manageModalBackdrop) {
          this.closeManageSongsModal();
        }
      });
    }

    if (this.mainFileInput) {
      this.mainFileInput.addEventListener('change', async (e) => {
        if (e.target.files && e.target.files.length > 0) {
          await this.loadFile(e.target.files[0]);
          e.target.value = '';
        }
      });
    }

    if (this.speedSlider) {
      const savedSpeed = localStorage.getItem('endless_speed_multiplier');
      if (savedSpeed) {
        const spd = parseFloat(savedSpeed);
        if (!isNaN(spd) && spd >= 0.1 && spd <= 3.0) {
          this.speedSlider.value = spd.toString();
          this.speedValDisplay.innerText = spd.toFixed(1) + 'x';
          this.endlessMode.setSpeed(spd);
        }
      }

      this.speedSlider.addEventListener('input', (e) => {
        const spd = parseFloat(e.target.value);
        this.speedValDisplay.innerText = spd.toFixed(1) + 'x';
        localStorage.setItem('endless_speed_multiplier', spd.toString());
        this.endlessMode.setSpeed(spd);
      });
    }

    if (this.endlessKeySelect) {
      const savedKey = localStorage.getItem('endless_key_selection') || 'c_major';
      this.endlessKeySelect.value = savedKey;
      this.endlessMode.setKey(savedKey);

      this.endlessKeySelect.addEventListener('change', (e) => {
        const keyId = e.target.value;
        localStorage.setItem('endless_key_selection', keyId);
        this.endlessMode.setKey(keyId);
      });
    }

    if (this.endlessPatternSelect) {
      const savedPattern = localStorage.getItem('endless_pattern_selection') || 'melodic';
      this.endlessPatternSelect.value = savedPattern;
      this.endlessMode.setPatternMode(savedPattern);

      this.endlessPatternSelect.addEventListener('change', (e) => {
        const patternMode = e.target.value;
        localStorage.setItem('endless_pattern_selection', patternMode);
        this.endlessMode.setPatternMode(patternMode);
      });
    }

    this.bpmSlider.addEventListener('input', (e) => {
      const bpm = parseInt(e.target.value);
      this.bpmValDisplay.innerText = `${bpm} BPM`;
      this.rhythmMode.setBpm(bpm);
      this.listenMode.setBpm(bpm);
    });

    this.metronomeToggle.addEventListener('change', (e) => {
      this.rhythmMode.setMetronome(e.target.checked);
      this.listenMode.setMetronome(e.target.checked);
    });

    if (this.rhythmStartBtn) {
      this.rhythmStartBtn.addEventListener('click', () => {
        if (this.currentModeName === 'rhythm') {
          this.toggleRhythmPlayback();
        } else if (this.currentModeName === 'listen') {
          this.toggleListenPlayback();
        }
      });
    }

    // Leertaste & Tasten-Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT' && e.target.tagName !== 'TEXTAREA') {
        if (e.code === 'Space') {
          if (this.currentModeName === 'rhythm') {
            e.preventDefault();
            this.toggleRhythmPlayback();
          } else if (this.currentModeName === 'listen') {
            e.preventDefault();
            this.toggleListenPlayback();
          } else if (this.currentModeName === 'editor') {
            e.preventDefault();
            this.editorMode.togglePlayback();
          }
        } else if (e.code === 'KeyR' && this.currentModeName === 'editor') {
          e.preventDefault();
          this.editorMode.toggleRecording();
        } else if (this.currentModeName === 'editor') {
          if (e.code === 'ArrowLeft') {
            e.preventDefault();
            this.editorMode.selectPreviousNote();
          } else if (e.code === 'ArrowRight') {
            e.preventDefault();
            this.editorMode.selectNextNote();
          } else if (e.code === 'Delete' || e.code === 'Backspace') {
            e.preventDefault();
            this.editorMode.removeSelectedNote();
          } else if (e.code === 'Digit1' || e.code === 'Numpad1') {
            e.preventDefault();
            this.editorMode.setDuration(1);
          } else if (e.code === 'Digit2' || e.code === 'Numpad2') {
            e.preventDefault();
            this.editorMode.setDuration(2);
          } else if (e.code === 'Digit4' || e.code === 'Numpad4') {
            e.preventDefault();
            this.editorMode.setDuration(4);
          } else if (e.code === 'Digit8' || e.code === 'Numpad8' || e.code === 'Digit5' || e.code === 'Numpad5') {
            e.preventDefault();
            this.editorMode.setDuration(0.5);
          }
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
      } else if (this.currentModeName === 'listen') {
        this.toggleListenPlayback();
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

    this.updateCustomSongButtons();
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
            const song = new Song(songData);
            song.isCustom = true;
            this.songs.push(song);
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
    song.isCustom = true;
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
    this.updateCustomSongButtons();
    this.setMode('practice');
  }

  isCustomSong(songOrId) {
    if (!songOrId) return false;
    const songId = typeof songOrId === 'string' ? songOrId : songOrId.id;
    const songObj = typeof songOrId === 'object' ? songOrId : this.songs.find(s => s.id === songId);
    if (songObj && songObj.isCustom) return true;

    // Gegen vorinstallierte Lieder abgleichen
    if (BUILTIN_SONGS.some(b => b.id === songId)) return false;

    // Prüfen, ob Song im localStorage hinterlegt ist
    try {
      const saved = localStorage.getItem('custom_guitar_songs');
      if (saved) {
        const list = JSON.parse(saved);
        if (list.some(s => s.id === songId)) return true;
      }
    } catch (e) {}

    return Boolean(songObj && songObj.isCustom);
  }

  getCustomSongsList() {
    return this.songs.filter(s => this.isCustomSong(s));
  }

  updateCustomSongButtons() {
    const isCustom = this.currentSong && this.isCustomSong(this.currentSong);
    if (this.deleteSongBtn) {
      this.deleteSongBtn.style.display = isCustom ? 'inline-flex' : 'none';
      if (isCustom) {
        this.deleteSongBtn.title = `Eigenes Lied "${this.currentSong.title}" aus dem Browser löschen`;
      }
    }

    if (this.manageSongsBtn) {
      const customCount = this.getCustomSongsList().length;
      this.manageSongsBtn.innerHTML = customCount > 0
        ? `📁 Eigene Lieder <span style="font-size:0.75rem; background:#2563eb; color:#fff; padding:1px 6px; border-radius:10px; margin-left:4px; font-weight:700;">${customCount}</span>`
        : `📁 Eigene Lieder`;
    }
  }

  deleteCustomSong(songId, skipConfirm = false) {
    const songIndex = this.songs.findIndex(s => s.id === songId);
    if (songIndex === -1) return;

    const song = this.songs[songIndex];
    if (!this.isCustomSong(song)) {
      alert("Vorinstallierte Lieder können nicht gelöscht werden.");
      return;
    }

    if (!skipConfirm) {
      const confirmed = confirm(`Möchtest du das eigene Lied "${song.title}" wirklich aus deinem Browser löschen?`);
      if (!confirmed) return;
    }

    // Aus localStorage entfernen
    try {
      const saved = localStorage.getItem('custom_guitar_songs');
      if (saved) {
        let list = JSON.parse(saved);
        list = list.filter(s => s.id !== songId);
        localStorage.setItem('custom_guitar_songs', JSON.stringify(list));
      }
    } catch (e) {
      console.error("Fehler beim Löschen des Songs aus localStorage:", e);
    }

    // Aus interner Liste entfernen
    this.songs.splice(songIndex, 1);

    // Falls das aktuelle Lied gelöscht wurde, auf Standardlied zurückfallen
    if (this.currentSong && this.currentSong.id === songId) {
      const gia = this.songs.find(s => s.id === 'guitar_in_action');
      this.currentSong = gia || this.songs[0];
    }

    this.populateSongSelect();
    if (this.currentSong) {
      this.songSelect.value = this.currentSong.id;
      this.bpmSlider.value = this.currentSong.bpm || 100;
      this.bpmValDisplay.innerText = `${this.currentSong.bpm || 100} BPM`;
      this.loadCurrentSongIntoMode();
    }
    this.updateCustomSongButtons();

    // Modal aktualisieren, falls geöffnet
    if (this.manageModalBackdrop && this.manageModalBackdrop.classList.contains('open')) {
      this.renderCustomSongsModal();
    }
  }

  deleteAllCustomSongs() {
    const customSongs = this.getCustomSongsList();
    if (customSongs.length === 0) return;

    const confirmed = confirm(`Möchtest du wirklich ALLE (${customSongs.length}) selbst im Browser gespeicherten Lieder unwiderruflich löschen?`);
    if (!confirmed) return;

    try {
      localStorage.removeItem('custom_guitar_songs');
    } catch (e) {
      console.error("Fehler beim Löschen aller eigenen Songs:", e);
    }

    this.songs = this.songs.filter(s => !this.isCustomSong(s));
    const gia = this.songs.find(s => s.id === 'guitar_in_action');
    this.currentSong = gia || this.songs[0];

    this.populateSongSelect();
    if (this.currentSong) {
      this.songSelect.value = this.currentSong.id;
      this.bpmSlider.value = this.currentSong.bpm || 100;
      this.bpmValDisplay.innerText = `${this.currentSong.bpm || 100} BPM`;
      this.loadCurrentSongIntoMode();
    }
    this.updateCustomSongButtons();
    this.renderCustomSongsModal();
  }

  openManageSongsModal() {
    this.renderCustomSongsModal();
    if (this.manageModalBackdrop) {
      this.manageModalBackdrop.classList.add('open');
    }
  }

  closeManageSongsModal() {
    if (this.manageModalBackdrop) {
      this.manageModalBackdrop.classList.remove('open');
    }
  }

  renderCustomSongsModal() {
    if (!this.manageModalList) return;
    const customSongs = this.getCustomSongsList();

    if (customSongs.length === 0) {
      this.manageModalList.innerHTML = `
        <div class="custom-songs-empty">
          <p><strong>Keine eigenen Lieder gespeichert</strong></p>
          <p style="margin-top:6px; font-size:0.82rem;">
            Du kannst im <em>✏️ Song-Editor</em> neue Lieder komponieren oder über <em>📂 Datei öffnen</em> eigene MIDI- oder JSON-Dateien laden.
          </p>
        </div>
      `;
      if (this.manageModalDeleteAllBtn) {
        this.manageModalDeleteAllBtn.style.display = 'none';
      }
      return;
    }

    if (this.manageModalDeleteAllBtn) {
      this.manageModalDeleteAllBtn.style.display = 'inline-flex';
    }

    this.manageModalList.innerHTML = '';
    customSongs.forEach(s => {
      const item = document.createElement('div');
      item.className = 'custom-song-item';

      const info = document.createElement('div');
      info.className = 'custom-song-info';

      const titleEl = document.createElement('div');
      titleEl.className = 'custom-song-title';
      titleEl.innerText = s.title;

      const metaEl = document.createElement('div');
      metaEl.className = 'custom-song-meta';
      metaEl.innerHTML = `
        <span>👤 ${s.artist || 'Unbekannt'}</span>
        <span class="custom-song-badge">🎵 ${(s.notes || []).length} Noten</span>
        <span class="custom-song-badge">⏱ ${s.bpm || 100} BPM</span>
      `;

      info.appendChild(titleEl);
      info.appendChild(metaEl);

      const actions = document.createElement('div');
      actions.className = 'custom-song-actions';

      const playBtn = document.createElement('button');
      playBtn.className = 'btn btn-primary btn-sm';
      playBtn.innerText = '🎯 Üben';
      playBtn.title = `"${s.title}" im Übungsmodus öffnen`;
      playBtn.addEventListener('click', () => {
        this.closeManageSongsModal();
        this.currentSong = s;
        this.songSelect.value = s.id;
        this.bpmSlider.value = s.bpm || 100;
        this.bpmValDisplay.innerText = `${s.bpm || 100} BPM`;
        this.setMode('practice');
        this.modeSelect.value = 'practice';
        this.updateCustomSongButtons();
      });

      const listenBtn = document.createElement('button');
      listenBtn.className = 'btn btn-sm';
      listenBtn.innerText = '🎧 Anhören';
      listenBtn.title = `"${s.title}" im Anhören-Modus abspielen`;
      listenBtn.addEventListener('click', async () => {
        this.closeManageSongsModal();
        this.currentSong = s;
        this.songSelect.value = s.id;
        this.bpmSlider.value = s.bpm || 100;
        this.bpmValDisplay.innerText = `${s.bpm || 100} BPM`;
        this.setMode('listen');
        this.modeSelect.value = 'listen';
        this.updateCustomSongButtons();
        await this.toggleListenPlayback();
      });

      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-sm';
      editBtn.innerText = '✏️ Editor';
      editBtn.title = `"${s.title}" im Song-Editor bearbeiten`;
      editBtn.addEventListener('click', () => {
        this.closeManageSongsModal();
        this.currentSong = s;
        this.setMode('editor');
        this.modeSelect.value = 'editor';
        this.editorMode.loadSongData(s.toJSON());
        this.updateCustomSongButtons();
      });

      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-danger btn-sm';
      delBtn.innerText = '🗑️ Löschen';
      delBtn.title = `"${s.title}" aus dem Browser löschen`;
      delBtn.addEventListener('click', () => {
        this.deleteCustomSong(s.id);
      });

      actions.appendChild(playBtn);
      actions.appendChild(listenBtn);
      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      item.appendChild(info);
      item.appendChild(actions);

      this.manageModalList.appendChild(item);
    });
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
    this.listenMode.stop();
    this.updateRhythmButtonState(false);
    this.editorMode.hide();
    this.applyFretboardVisibility();
    this.updateCustomSongButtons();

    // Sichtbarkeit der Steuerelemente steuern
    this.songSelectGroup.style.display = (mode === 'practice' || mode === 'rhythm' || mode === 'listen') ? 'flex' : 'none';
    this.bpmControlGroup.style.display = (mode === 'rhythm' || mode === 'listen') ? 'flex' : 'none';
    this.speedGroup.style.display = (mode === 'endless') ? 'flex' : 'none';
    if (this.endlessKeyGroup) {
      this.endlessKeyGroup.style.display = (mode === 'endless') ? 'flex' : 'none';
    }

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

  async toggleListenPlayback() {
    const isPlaying = await this.listenMode.togglePlay();
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
    } else if (this.currentModeName === 'listen') {
      this.updateRhythmButtonState(false);
      const bpm = parseInt(this.bpmSlider.value) || this.currentSong.bpm || 100;
      this.listenMode.loadSong(this.currentSong, bpm);
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
    } else if (this.currentModeName === 'listen') {
      const noteObj = this.listenMode?.currentSong?.notes?.find(n => n.midi === midi);
      const freq = noteObj?.freq || (440 * Math.pow(2, (midi - 69) / 12));
      this.synth.playTone(freq, true);
      this.fretboardRenderer.highlightMidi(midi, 'correct-flash');
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

          if (this.currentModeName === 'editor') {
            this.editorMode.processAudioFrame(res, now);
          }

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
      } else if (this.currentModeName === 'listen') {
        this.listenMode.update(dt);
        this.listenMode.render();
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
