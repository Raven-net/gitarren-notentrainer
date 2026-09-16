import { generatePoolForKey, KEY_DEFINITIONS } from '../models/KeySignatures.js';

export class EndlessMode {
  constructor(options = {}) {
    this.staffRenderer = options.staffRenderer;
    this.fretboardRenderer = options.fretboardRenderer;
    this.synth = options.synth;
    this.onProgressUpdate = options.onProgressUpdate;

    this.currentKey = options.currentKey || 'c_major';
    this.pool = generatePoolForKey(this.currentKey, 4);
    this.activeNotes = [];
    this.score = 0;
    this.speedMultiplier = 1.2;
    this.lastSpawnTime = 0;
  }

  setKey(keyId) {
    this.currentKey = keyId;
    this.pool = generatePoolForKey(keyId, 4);
    this.reset();
  }

  setSpeed(val) {
    this.speedMultiplier = val;
  }

  reset() {
    this.activeNotes = [];
    this.score = 0;
    this.lastSpawnTime = performance.now();
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
    const template = this.pool[Math.floor(Math.random() * this.pool.length)];
    this.activeNotes.push({
      ...template,
      x: this.staffRenderer.width + 20,
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
    const now = performance.now();
    const spawnInterval = 2800 / this.speedMultiplier;

    if (now - this.lastSpawnTime > spawnInterval) {
      this.spawnNote();
      this.lastSpawnTime = now;
    }

    const moveDistance = 75 * this.speedMultiplier * dt;
    for (let i = this.activeNotes.length - 1; i >= 0; i--) {
      this.activeNotes[i].x -= moveDistance;
      // Wenn die Note den linken Bildschirmrand verlässt
      if (this.activeNotes[i].x < 40) {
        this.activeNotes.splice(i, 1);
      }
    }

    // Aktuelle Zielnote auf dem Griffbrett markieren
    if (this.activeNotes.length > 0) {
      this.fretboardRenderer.setTargetHint(this.activeNotes[0].midi);
    } else {
      this.fretboardRenderer.clearHints();
    }
  }

  render() {
    this.staffRenderer.drawStaff();

    for (let i = 0; i < this.activeNotes.length; i++) {
      const note = this.activeNotes[i];
      const isTarget = i === 0;

      this.staffRenderer.drawNote(
        note.x,
        note.diatonicStep,
        1,
        isTarget ? 'target' : 'normal',
        note.accidental || null
      );
    }
  }
}
