import { generatePoolForKey, KEY_DEFINITIONS } from '../models/KeySignatures.js';
import { MelodicPatternGenerator } from '../models/MelodicPatterns.js';

export class EndlessMode {
  constructor(options = {}) {
    this.staffRenderer = options.staffRenderer;
    this.fretboardRenderer = options.fretboardRenderer;
    this.synth = options.synth;
    this.onProgressUpdate = options.onProgressUpdate;

    this.hitLineX = (this.staffRenderer && this.staffRenderer.hitLineX) || 150;
    this.pixelsPerBeat = 85; // 85 Pixel pro Beat (Viertelnote)
    this.baseBeatsPerSec = 1.35; // ~81 BPM bei speedMultiplier 1.0

    this.currentKey = options.currentKey || 'c_major';
    this.patternMode = options.patternMode || 'melodic';
    this.pool = generatePoolForKey(this.currentKey, 4);
    this.patternGenerator = new MelodicPatternGenerator(this.currentKey);

    this.activeNotes = [];
    this.score = 0;
    this.speedMultiplier = 1.2;
    this.scrollBeat = -2; // 2 Beats Vorlaufzeit vor der ersten Note
    this.nextSpawnBeat = 0; // Erste Note startet auf Takt 1, Beat 0
  }

  setKey(keyId) {
    this.currentKey = keyId;
    this.pool = generatePoolForKey(keyId, 4);
    this.patternGenerator.setKey(keyId);
    this.reset();
  }

  setPatternMode(mode) {
    this.patternMode = mode; // 'melodic' | 'random'
    this.patternGenerator.reset();
    this.reset();
  }

  setSpeed(val) {
    this.speedMultiplier = val;
  }

  reset() {
    this.activeNotes = [];
    this.score = 0;
    this.scrollBeat = -2; // 2 Beats Vorlauf
    this.nextSpawnBeat = 0;
    if (this.patternGenerator) {
      this.patternGenerator.reset();
    }
    this.notifyProgress();
  }

  notifyProgress() {
    if (this.onProgressUpdate) {
      this.onProgressUpdate({
        score: this.score,
        scoreText: `Punkte: ${this.score}`
      });
    }
  }

  spawnNote() {
    this.spawnNextNote();
  }

  spawnNextNote() {
    let template = null;
    if (this.patternMode === 'melodic') {
      template = this.patternGenerator.getNextNote();
    }
    if (!template && this.pool.length > 0) {
      const baseTemplate = this.pool[Math.floor(Math.random() * this.pool.length)];
      const rand = Math.random();
      let duration = 1;
      if (rand < 0.10) duration = 0.5;      // 10% Achtel
      else if (rand < 0.70) duration = 1;  // 60% Viertel
      else if (rand < 0.93) duration = 2;  // 23% Halbe
      else duration = 4;                   // 7% Ganze

      template = {
        ...baseTemplate,
        duration: duration
      };
    }
    if (!template) return;

    const noteDuration = template.duration || 1;
    const noteBeat = this.nextSpawnBeat;
    this.nextSpawnBeat += noteDuration;

    this.activeNotes.push({
      ...template,
      beat: noteBeat,
      duration: noteDuration,
      state: 'normal'
    });
  }

  evaluateNote(playedMidi, btnElement = null) {
    if (this.activeNotes.length === 0) return;

    const targetNote = this.activeNotes[0];

    if (playedMidi === targetNote.midi) {
      this.synth.playTone(targetNote.freq, true);
      this.fretboardRenderer.highlightMidi(playedMidi, 'correct-flash');
      this.activeNotes.shift();
      this.score++;
      this.notifyProgress();

      if (this.activeNotes.length > 0) {
        this.fretboardRenderer.setTargetHint(this.activeNotes[0].midi);
      } else {
        this.fretboardRenderer.clearHints();
      }
    } else {
      this.synth.playTone(0, false);
      if (btnElement) {
        this.fretboardRenderer.flashButton(btnElement, 'wrong-flash');
      } else {
        this.fretboardRenderer.highlightMidi(playedMidi, 'wrong-flash');
      }
    }
  }

  update(dt) {
    // 1. Zeitstrahl kontinuierlich nach vorne bewegen
    const beatsPerSec = this.baseBeatsPerSec * this.speedMultiplier;
    this.scrollBeat += beatsPerSec * dt;

    // 2. Noten kontinuierlich vorausschauend nachspawnen
    const visibleWidth = (this.staffRenderer && this.staffRenderer.width) || 940;
    const lookAheadBeats = (visibleWidth - this.hitLineX + 160) / this.pixelsPerBeat;

    while (this.nextSpawnBeat < this.scrollBeat + lookAheadBeats) {
      this.spawnNextNote();
    }

    // 3. Noten entfernen, die links aus dem Bild gewandert sind
    while (this.activeNotes.length > 0) {
      const noteX = this.hitLineX + (this.activeNotes[0].beat - this.scrollBeat) * this.pixelsPerBeat;
      if (noteX < 30) {
        this.activeNotes.shift();
      } else {
        break;
      }
    }

    // 4. Aktuelle Zielnote auf dem Griffbrett markieren
    if (this.activeNotes.length > 0) {
      this.fretboardRenderer.setTargetHint(this.activeNotes[0].midi);
    } else {
      this.fretboardRenderer.clearHints();
    }
  }

  render() {
    this.staffRenderer.drawStaff();

    // 1. Taktstriche an festen 4-Beat-Grenzen zeichnen
    const beatsPerBar = 4;
    const visibleWidth = (this.staffRenderer && this.staffRenderer.width) || 940;
    const minBeat = Math.floor((this.scrollBeat - this.hitLineX / this.pixelsPerBeat) / beatsPerBar) * beatsPerBar;
    const maxBeat = Math.ceil((this.scrollBeat + (visibleWidth - this.hitLineX + 60) / this.pixelsPerBeat) / beatsPerBar) * beatsPerBar;

    for (let b = minBeat; b <= maxBeat; b += beatsPerBar) {
      if (b >= 0) {
        const barX = this.hitLineX + (b - this.scrollBeat) * this.pixelsPerBeat;
        if (barX >= 35 && barX <= visibleWidth + 30) {
          this.staffRenderer.drawBarLine(barX);
        }
      }
    }

    // 2. Noten mit ihren jeweiligen Notenwerten und Vorzeichen zeichnen
    for (let i = 0; i < this.activeNotes.length; i++) {
      const note = this.activeNotes[i];
      const isTarget = i === 0;
      const noteX = this.hitLineX + (note.beat - this.scrollBeat) * this.pixelsPerBeat;

      if (noteX >= 20 && noteX <= visibleWidth + 40) {
        this.staffRenderer.drawNote(
          noteX,
          note.diatonicStep,
          note.duration || 1,
          isTarget ? 'target' : 'normal',
          note.accidental || null
        );
      }
    }
  }
}
