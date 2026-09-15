export class PracticeMode {
  constructor(options = {}) {
    this.staffRenderer = options.staffRenderer;
    this.fretboardRenderer = options.fretboardRenderer;
    this.synth = options.synth;
    this.onProgressUpdate = options.onProgressUpdate;
    this.onComplete = options.onComplete;

    this.currentSong = null;
    this.currentIndex = 0;
    this.scrollOffset = 0;
    this.noteSpacingUnit = 80;
    this.hitLineX = this.staffRenderer.hitLineX;
    this.showHints = true;
  }

  loadSong(song) {
    this.currentSong = song;
    this.currentIndex = 0;
    this.scrollOffset = 0;
    this.updateHints();
    this.notifyProgress();
  }

  updateHints() {
    if (!this.currentSong || this.currentIndex >= this.currentSong.notes.length) {
      this.fretboardRenderer.clearHints();
      return;
    }
    const currentNote = this.currentSong.notes[this.currentIndex];
    if (this.showHints) {
      this.fretboardRenderer.setTargetHint(currentNote.midi);
    } else {
      this.fretboardRenderer.clearHints();
    }
  }

  notifyProgress() {
    if (this.onProgressUpdate && this.currentSong) {
      this.onProgressUpdate({
        index: this.currentIndex,
        total: this.currentSong.notes.length,
        scoreText: `${this.currentIndex} / ${this.currentSong.notes.length}`
      });
    }
  }

  evaluateNote(playedMidi, btnElement = null) {
    if (!this.currentSong || this.currentIndex >= this.currentSong.notes.length) return;

    const targetNote = this.currentSong.notes[this.currentIndex];

    if (playedMidi === targetNote.midi) {
      // Treffer!
      this.synth.playTone(targetNote.freq, true);
      this.fretboardRenderer.highlightMidi(playedMidi, 'correct-flash');

      this.currentIndex++;
      this.updateHints();
      this.notifyProgress();

      if (this.currentIndex >= this.currentSong.notes.length) {
        if (this.onComplete) {
          this.onComplete({
            mode: 'practice',
            song: this.currentSong,
            total: this.currentSong.notes.length,
            hits: this.currentSong.notes.length,
            accuracy: 100
          });
        }
      }
    } else {
      // Fehlversuch
      this.synth.playTone(0, false);
      if (btnElement) {
        this.fretboardRenderer.flashButton(btnElement, 'wrong-flash');
      } else {
        this.fretboardRenderer.highlightMidi(playedMidi, 'wrong-flash');
      }
    }
  }

  update(dt) {
    if (!this.currentSong) return;

    // Zielposition berechnen
    let targetScroll = 0;
    for (let i = 0; i < this.currentIndex; i++) {
      targetScroll += (this.currentSong.notes[i].duration || 1) * this.noteSpacingUnit;
    }

    // Weiche Kamera-Interpolation
    this.scrollOffset += (targetScroll - this.scrollOffset) * Math.min(dt * 10, 1);
  }

  render() {
    this.staffRenderer.drawStaff();
    if (!this.currentSong) return;

    let currentPos = 0;
    let measureBeats = 0;

    for (let i = 0; i < this.currentSong.notes.length; i++) {
      const note = this.currentSong.notes[i];
      const noteX = this.hitLineX + (currentPos - this.scrollOffset);

      if (noteX >= 40 && noteX <= this.staffRenderer.width + 40) {
        let status = 'normal';
        if (i < this.currentIndex) status = 'hit';
        else if (i === this.currentIndex) status = 'target';

        // G# Erkennung (z.B. Bund 1 G-Saite oder Bund 4 D-Saite)
        const isSharp = [1, 3, 6, 8, 10].includes(note.midi % 12);
        const accidental = isSharp ? '♯' : null;

        this.staffRenderer.drawNote(noteX, note.diatonicStep, note.duration, status, accidental);
      }

      currentPos += (note.duration || 1) * this.noteSpacingUnit;
      measureBeats += (note.duration || 1);

      if (measureBeats >= 4) {
        const barLineX = this.hitLineX + (currentPos - this.scrollOffset) - (this.noteSpacingUnit * 0.35);
        this.staffRenderer.drawBarLine(barLineX);
        measureBeats = 0;
      }
    }
  }
}
